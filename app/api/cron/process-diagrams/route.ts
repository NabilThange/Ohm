/**
 * Vercel Cron Job: Process Diagram Queue
 * 
 * Runs every minute to process pending diagram generation requests.
 * Respects BYTEZ API rate limit of 1 request per second.
 * 
 * Schedule: * * * * * (every minute)
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { generateFritzingDiagram } from '@/lib/services/diagram-generator';
import { hashCircuit, getCachedDiagram, cacheDiagram } from '@/lib/services/diagram-cache';

export async function GET(req: Request) {
    const startTime = Date.now();

    // Verify cron secret for security
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error('[Cron] Unauthorized access attempt');
        return new Response('Unauthorized', { status: 401 });
    }

    console.log('[Cron] Starting diagram queue processing');

    try {
        // Get pending diagrams (limit to 60 per minute = 1 per second max)
        const { data: pending, error: fetchError } = await supabase
            .from('diagram_queue')
            .select('*')
            .eq('status', 'queued')
            .order('created_at', { ascending: true })
            .limit(60);

        if (fetchError) {
            console.error('[Cron] Error fetching queue:', fetchError);
            throw fetchError;
        }

        if (!pending || pending.length === 0) {
            console.log('[Cron] Queue is empty');
            return NextResponse.json({
                message: 'Queue empty',
                processed: 0,
                duration: Date.now() - startTime
            });
        }

        console.log(`[Cron] Found ${pending.length} pending diagrams`);

        let processed = 0;
        let cached = 0;
        let failed = 0;

        // Process each job with 1-second delay between requests
        for (let i = 0; i < pending.length; i++) {
            const job = pending[i];
            const jobStartTime = Date.now();

            try {
                console.log(`[Cron] Processing job ${job.id} (${i + 1}/${pending.length})`);

                // Mark as processing
                await supabase
                    .from('diagram_queue')
                    .update({ status: 'processing' })
                    .eq('id', job.id);

                // Check cache first
                const circuitJson = job.circuit_json as any;
                const circuitHash = hashCircuit(circuitJson);
                let diagramUrl = await getCachedDiagram(circuitHash);

                if (diagramUrl) {
                    console.log(`[Cron] Using cached diagram for job ${job.id}`);

                    // Use cached diagram
                    await supabase
                        .from('artifact_versions')
                        .update({
                            fritzing_url: diagramUrl,
                            diagram_status: 'complete',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', job.artifact_id);

                    cached++;
                } else {
                    console.log(`[Cron] Generating new diagram for job ${job.id}`);

                    // Generate new diagram
                    diagramUrl = await generateFritzingDiagram(
                        circuitJson,
                        job.artifact_id,
                        job.chat_id
                    );

                    // Cache it for future use
                    await cacheDiagram(circuitHash, diagramUrl);
                }

                // Mark job as complete
                await supabase
                    .from('diagram_queue')
                    .update({
                        status: 'complete',
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', job.id);

                processed++;

                const jobDuration = Date.now() - jobStartTime;
                console.log(`[Cron] Job ${job.id} completed in ${jobDuration}ms`);

                // Wait 1 second before next request (rate limit: 1 req/sec)
                if (i < pending.length - 1) {
                    const waitTime = Math.max(0, 1000 - jobDuration);
                    if (waitTime > 0) {
                        console.log(`[Cron] Waiting ${waitTime}ms before next request`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }

            } catch (error) {
                console.error(`[Cron] Job ${job.id} failed:`, error);
                failed++;

                // Mark as failed
                const { error: updateError } = await supabase
                    .from('diagram_queue')
                    .update({
                        status: 'failed',
                        error_message: error instanceof Error ? error.message : 'Unknown error',
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', job.id);

                if (updateError) {
                    console.error('[Cron] Failed to mark job as failed:', updateError);
                }
            }
        }

        const totalDuration = Date.now() - startTime;

        console.log(`[Cron] Completed: ${processed} processed, ${cached} from cache, ${failed} failed in ${totalDuration}ms`);

        return NextResponse.json({
            success: true,
            processed,
            cached,
            failed,
            total: pending.length,
            duration: totalDuration
        });

    } catch (error) {
        console.error('[Cron] Fatal error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: Date.now() - startTime
            },
            { status: 500 }
        );
    }
}

// Prevent caching of this endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;
