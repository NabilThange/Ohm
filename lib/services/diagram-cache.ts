/**
 * Circuit Diagram Caching Service
 * 
 * Caches generated diagrams by circuit hash to avoid regenerating
 * identical circuits. Reduces API costs and improves response time.
 */

import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';
import { CircuitJson } from '../diagram-generation/prompt-builder';

/**
 * Generate a hash for a circuit configuration
 * Same circuit = same hash, regardless of component order
 */
export function hashCircuit(circuitJson: CircuitJson): string {
    // Normalize circuit JSON for consistent hashing
    const normalized = {
        components: circuitJson.components
            .map(c => ({
                id: c.id,
                type: c.type,
                properties: c.properties || {}
            }))
            .sort((a, b) => a.id.localeCompare(b.id)),
        connections: circuitJson.connections
            .map(c => ({
                from: c.from,
                to: c.to,
                color: c.color || 'default'
            }))
            .sort((a, b) => `${a.from}-${a.to}`.localeCompare(`${b.from}-${b.to}`))
    };

    const jsonString = JSON.stringify(normalized);
    return crypto.createHash('md5').update(jsonString).digest('hex');
}

/**
 * Check if a diagram exists in cache
 * Returns diagram URL if found, null otherwise
 */
export async function getCachedDiagram(circuitHash: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('diagram_cache')
            .select('fritzing_url, id, access_count')
            .eq('circuit_hash', circuitHash)
            .single();

        if (error || !data) {
            return null;
        }

        console.log(`[Cache] Hit for circuit hash ${circuitHash}`);

        // Update access statistics
        const { error: updateError } = await supabase
            .from('diagram_cache')
            .update({
                access_count: (data.access_count || 0) + 1,
                last_accessed_at: new Date().toISOString()
            })
            .eq('id', data.id);

        if (updateError) {
            console.error('[Cache] Failed to update access stats:', updateError);
        }

        return data.fritzing_url;

    } catch (error) {
        console.error('[Cache] Error checking cache:', error);
        return null;
    }
}

/**
 * Store a generated diagram in cache
 */
export async function cacheDiagram(
    circuitHash: string,
    fritzingUrl: string
): Promise<void> {
    try {
        const { error } = await supabase
            .from('diagram_cache')
            .upsert({
                circuit_hash: circuitHash,
                fritzing_url: fritzingUrl,
                access_count: 1,
                last_accessed_at: new Date().toISOString()
            }, {
                onConflict: 'circuit_hash'
            });

        if (error) {
            console.error('[Cache] Failed to cache diagram:', error);
        } else {
            console.log(`[Cache] Cached diagram for hash ${circuitHash}`);
        }
    } catch (error) {
        console.error('[Cache] Error caching diagram:', error);
    }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
    totalEntries: number;
    totalHits: number;
    averageHitsPerEntry: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
}> {
    try {
        const { data, error } = await supabase
            .from('diagram_cache')
            .select('access_count, created_at');

        if (error || !data || data.length === 0) {
            return {
                totalEntries: 0,
                totalHits: 0,
                averageHitsPerEntry: 0,
                oldestEntry: null,
                newestEntry: null
            };
        }

        const totalHits = data.reduce((sum, entry) => sum + (entry.access_count || 0), 0);
        const dates = data.map(entry => new Date(entry.created_at)).sort((a, b) => a.getTime() - b.getTime());

        return {
            totalEntries: data.length,
            totalHits,
            averageHitsPerEntry: totalHits / data.length,
            oldestEntry: dates[0] || null,
            newestEntry: dates[dates.length - 1] || null
        };
    } catch (error) {
        console.error('[Cache] Error getting stats:', error);
        return {
            totalEntries: 0,
            totalHits: 0,
            averageHitsPerEntry: 0,
            oldestEntry: null,
            newestEntry: null
        };
    }
}

/**
 * Clean up old, unused cache entries
 * Removes entries not accessed in the last N days with low access count
 */
export async function cleanupCache(options: {
    daysOld?: number;
    maxAccessCount?: number;
} = {}): Promise<number> {
    const daysOld = options.daysOld || 30;
    const maxAccessCount = options.maxAccessCount || 2;

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const { data, error } = await supabase
            .from('diagram_cache')
            .delete()
            .lt('last_accessed_at', cutoffDate.toISOString())
            .lte('access_count', maxAccessCount)
            .select('id');

        if (error) {
            console.error('[Cache] Cleanup error:', error);
            return 0;
        }

        const deletedCount = data?.length || 0;
        console.log(`[Cache] Cleaned up ${deletedCount} old entries`);
        return deletedCount;

    } catch (error) {
        console.error('[Cache] Error during cleanup:', error);
        return 0;
    }
}

/**
 * Check if two circuits are equivalent (for testing)
 */
export function areCircuitsEquivalent(circuit1: CircuitJson, circuit2: CircuitJson): boolean {
    return hashCircuit(circuit1) === hashCircuit(circuit2);
}

/**
 * Get cache hit rate for analytics
 */
export async function getCacheHitRate(timeframeHours: number = 24): Promise<number> {
    try {
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - timeframeHours);

        // Get total diagram generations in timeframe
        const { data: queueData } = await supabase
            .from('diagram_queue')
            .select('id')
            .gte('created_at', cutoffDate.toISOString())
            .eq('status', 'complete');

        const totalGenerations = queueData?.length || 0;

        if (totalGenerations === 0) return 0;

        // Get cache accesses in timeframe
        const { data: cacheData } = await supabase
            .from('diagram_cache')
            .select('access_count')
            .gte('last_accessed_at', cutoffDate.toISOString());

        const cacheHits = cacheData?.reduce((sum, entry) => sum + (entry.access_count || 0), 0) || 0;

        return (cacheHits / (totalGenerations + cacheHits)) * 100;

    } catch (error) {
        console.error('[Cache] Error calculating hit rate:', error);
        return 0;
    }
}
