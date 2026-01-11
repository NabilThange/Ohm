'use client';

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
    const toaster = getToaster();

    return (
        <Toaster toaster={toaster}>
            {(toast) => {
                const ToastIcon = toast.type ? iconMap[toast.type as keyof typeof iconMap] : InfoIcon;

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
