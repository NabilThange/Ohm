'use client';

import React from 'react';
import { Toast, Toaster } from '@ark-ui/react/toast';
import { getToaster } from '@/lib/agents/toast-notifications';
import { XIcon, AlertCircleIcon, CheckCircleIcon, InfoIcon, AlertTriangleIcon, ZapIcon } from 'lucide-react';

const iconMap = {
    success: CheckCircleIcon,
    error: AlertCircleIcon,
    warning: AlertTriangleIcon,
    info: InfoIcon,
    agent: ZapIcon,
};

/**
 * Global Toast Provider Component
 * Renders toast notifications for API key failover events
 */
export function ToastProvider() {
    const [isReady, setIsReady] = React.useState(false);
    const toaster = getToaster();

    // Eagerly initialize and mark as ready
    React.useEffect(() => {
        console.log('[ToastProvider] 🎨 ToastProvider mounting...');
        const mountTime = performance.now();

        // Force toaster initialization
        getToaster();

        // Mark as ready after a microtask to ensure DOM is ready
        requestAnimationFrame(() => {
            setIsReady(true);
            console.log('[ToastProvider] ✅ ToastProvider ready at', performance.now().toFixed(2), 'ms (took', (performance.now() - mountTime).toFixed(2), 'ms)');
        });

        return () => {
            console.log('[ToastProvider] 🔴 ToastProvider unmounting');
        };
    }, []);

    // Log ready state changes
    React.useEffect(() => {
        console.log('[ToastProvider] 📊 Ready state changed:', isReady);
    }, [isReady]);

    return (
        <Toaster toaster={toaster}>
            {(toast) => {
                const ToastIcon = toast.type ? iconMap[toast.type as keyof typeof iconMap] : InfoIcon;

                // Log when a toast is rendered
                console.log('[ToastProvider] 🎨 Rendering toast:', {
                    id: toast.id,
                    type: toast.type,
                    title: toast.title,
                    timestamp: performance.now().toFixed(2) + 'ms'
                });

                return (
                    <Toast.Root key={toast.id} className="toast-root">
                        <div className="toast-content">
                            <div className="toast-icon-wrapper">
                                <ToastIcon className="toast-icon" size={20} />
                            </div>
                            <div className="toast-text">
                                <Toast.Title className="toast-title">{toast.title}</Toast.Title>
                                <Toast.Description className="toast-description">
                                    {toast.description}
                                </Toast.Description>
                            </div>
                            <Toast.CloseTrigger className="toast-close">
                                <XIcon size={16} />
                            </Toast.CloseTrigger>
                        </div>
                    </Toast.Root>
                );
            }}
        </Toaster>
    );
}
