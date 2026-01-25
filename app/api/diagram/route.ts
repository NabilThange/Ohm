/**
 * Diagram Generation API Endpoint
 * 
 * Queues circuit diagrams for generation.
 * Called by the Wiring Specialist agent after generating circuit JSON.
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { validateCircuitJson } from '@/lib/diagram-generation/prompt-builder';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { circuitJson, artifactId, chatId } = body as any;

        // Validate required fields
        if (!circuitJson || !artifactId || !chatId) {
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                    required: ['circuitJson', 'artifactId', 'chatId']
                },
                { status: 400 }
            );
        }

        // Validate circuit JSON structure
        if (!validateCircuitJson(circuitJson)) {
            return NextResponse.json(
                {
                    error: 'Invalid circuit JSON format',
                    details: 'Circuit must have components and connections arrays'
                },
                { status: 400 }
            );
        }

        console.log(`[Diagram API] Queueing diagram for artifact ${artifactId}`);

        // Mark artifact as queued
        const { error: updateError } = await supabase
            .from('artifact_versions')
            .update({
                diagram_status: 'queued',
                updated_at: new Date().toISOString()
            })
            .eq('id', artifactId);

        if (updateError) {
            console.error('[Diagram API] Failed to update artifact status:', updateError);
            throw new Error(`Failed to update artifact: ${updateError.message}`);
        }

        // Add to diagram queue
        const { data: queueEntry, error: queueError } = await (supabase
            .from('diagram_queue')
            .insert({
                circuit_json: circuitJson,
                artifact_id: artifactId,
                chat_id: chatId,
                status: 'queued'
            } as any)
            .select()
            .single() as any);

        if (queueError) {
            console.error('[Diagram API] Failed to queue diagram:', queueError);
            throw new Error(`Failed to queue diagram: ${queueError.message}`);
        }

        console.log(`[Diagram API] Diagram queued successfully: ${queueEntry.id}`);

        return NextResponse.json({
            success: true,
            jobId: queueEntry.id,
            status: 'queued',
            message: 'Diagram generation queued. Will be ready within 1-2 minutes.',
            estimatedTime: '1-2 minutes'
        });

    } catch (error) {
        console.error('[Diagram API] Error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint to check queue status
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const artifactId = searchParams.get('artifactId');

        if (!artifactId) {
            // Return queue statistics
            const { data: queueStats } = await supabase
                .from('diagram_queue')
                .select('status')
                .in('status', ['queued', 'processing']);

            const queued = queueStats?.filter(q => q.status === 'queued').length || 0;
            const processing = queueStats?.filter(q => q.status === 'processing').length || 0;

            return NextResponse.json({
                queue: {
                    queued,
                    processing,
                    total: queued + processing
                },
                estimatedWaitTime: `${queued + processing} minutes`
            });
        }

        // Check specific artifact status
        const { data: artifact, error } = await supabase
            .from('artifact_versions')
            .select('diagram_status, fritzing_url, error_message')
            .eq('id', artifactId)
            .single();

        if (error || !artifact) {
            return NextResponse.json(
                { error: 'Artifact not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: artifact.diagram_status,
            url: artifact.fritzing_url,
            error: artifact.error_message
        });

    } catch (error) {
        console.error('[Diagram API] GET error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
