/**
 * Diagram Display Component
 * 
 * Displays circuit breadboard diagrams with loading states,
 * error handling, and real-time updates via Supabase subscriptions.
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Download, RefreshCw, AlertCircle } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DiagramDisplayProps {
    artifactId: string;
    initialUrl?: string;
    initialStatus?: string;
    onRetry?: () => void;
}

export function DiagramDisplay({
    artifactId,
    initialUrl,
    initialStatus = 'pending',
    onRetry
}: DiagramDisplayProps) {
    const [url, setUrl] = useState(initialUrl);
    const [status, setStatus] = useState(initialStatus);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        // Subscribe to artifact updates for real-time status changes
        const subscription = supabase
            .channel(`artifact-${artifactId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'artifact_versions',
                    filter: `id=eq.${artifactId}`
                },
                (payload) => {
                    const newData = payload.new as any;
                    console.log('[DiagramDisplay] Artifact updated:', newData.diagram_status);
                    setUrl(newData.fritzing_url);
                    setStatus(newData.diagram_status);
                    setError(newData.error_message);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [artifactId]);

    const handleDownload = async () => {
        if (!url) return;

        setIsDownloading(true);

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `circuit-diagram-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('[DiagramDisplay] Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleRetryClick = async () => {
        if (onRetry) {
            onRetry();
        } else {
            // Default retry: re-queue the diagram
            try {
                setStatus('queued');
                setError(null);

                // Call retry API (implement if needed)
                const response = await fetch(`/api/diagram?artifactId=${artifactId}`);
                const data = await response.json();

                if (data.status) {
                    setStatus(data.status);
                }
            } catch (error) {
                console.error('[DiagramDisplay] Retry failed:', error);
            }
        }
    };

    // Loading state
    if (status === 'queued' || status === 'generating' || status === 'processing') {
        return (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                        Generating professional breadboard diagram...
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        This may take 1-2 minutes. The diagram will appear automatically when ready.
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (status === 'failed') {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                            Diagram generation failed
                        </p>
                        {error && (
                            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                {error}
                            </p>
                        )}
                        <button
                            onClick={handleRetryClick}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry Generation
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state with diagram
    if (status === 'complete' && url) {
        return (
            <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-border bg-white dark:bg-gray-900">
                    <img
                        src={url}
                        alt="Circuit breadboard diagram"
                        className="w-full h-auto"
                        loading="lazy"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Download High-Res
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => window.open(url, '_blank')}
                        className="px-4 py-2 border border-border rounded hover:bg-accent transition-colors text-sm font-medium"
                    >
                        Open in New Tab
                    </button>
                </div>
            </div>
        );
    }

    // Pending state (initial)
    if (status === 'pending') {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Diagram will be generated when wiring instructions are complete.
                </p>
            </div>
        );
    }

    return null;
}
