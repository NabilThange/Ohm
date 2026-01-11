'use client';

import { createToaster } from '@ark-ui/react/toast';
import type { CreateToasterReturn } from '@ark-ui/react/toast';

/**
 * Global Toast Manager for API Key Failover Notifications
 * Lazy-initialized to prevent server-side execution
 */
let apiToaster: CreateToasterReturn | null = null;

function getToaster(): CreateToasterReturn {
    if (!apiToaster) {
        apiToaster = createToaster({
            placement: 'top-end',
            overlap: true,
            gap: 16,
            max: 5,
            duration: 5000,
        });
    }
    return apiToaster;
}

/**
 * Show a warning toast when an API key fails
 */
export function showKeyFailureToast(keyIndex: number, totalKeys: number, error: string) {
    console.log('[Toast Debug] 🔴 showKeyFailureToast called:', { keyIndex, totalKeys, error });
    if (typeof window === 'undefined') {
        console.log('[Toast Debug] Skipping - server side');
        return;
    }

    console.log('[Toast Debug] Creating warning toast...');
    getToaster().warning({
        title: `API Key #${keyIndex + 1} Failed`,
        description: `Switching to backup key... (${totalKeys - keyIndex - 1} remaining)`,
        duration: 5000,
    });
    console.log('[Toast Debug] Warning toast created');
}

/**
 * Show an error toast when all keys are exhausted
 */
export function showAllKeysExhaustedToast(totalKeys: number) {
    if (typeof window === 'undefined') return; // Server-side guard

    getToaster().error({
        title: 'All API Keys Exhausted',
        description: `All ${totalKeys} API keys have run out of credits. Please add credits or new keys.`,
        duration: Infinity, // Stay until dismissed
    });
}

/**
 * Show a success toast when a key rotation succeeds
 */
export function showKeyRotationSuccessToast(newKeyIndex: number) {
    console.log('[Toast Debug] 🟢 showKeyRotationSuccessToast called:', { newKeyIndex });
    if (typeof window === 'undefined') {
        console.log('[Toast Debug] Skipping - server side');
        return;
    }

    console.log('[Toast Debug] Creating success toast...');
    getToaster().warning({
        title: 'API Key Rotated',
        description: `Now using backup key #${newKeyIndex + 1}`,
        duration: 5000,
    });
    console.log('[Toast Debug] Warning toast created');
}

/**
 * Show an info toast when the system initializes
 */
export function showKeyManagerInitToast(keyCount: number) {
    if (typeof window === 'undefined') return; // Server-side guard

    if (keyCount > 1) {
        getToaster().info({
            title: 'API Failover Active',
            description: `${keyCount} API keys loaded. Automatic failover enabled.`,
            duration: 5000,
        });
    }
}

/**
 * Show a toast when the orchestrator switches agents
 */
export function showAgentChangeToast(agentName: string, agentIcon: string) {
    console.log('[Toast Debug] 🤖 showAgentChangeToast called:', { agentName, agentIcon });
    if (typeof window === 'undefined') {
        console.log('[Toast Debug] Skipping - server side');
        return;
    }

    console.log('[Toast Debug] Creating agent change toast...');
    getToaster().success({
        title: 'Agent Active',
        description: `${agentIcon} ${agentName} is now handling your request.`,
        duration: 5000,
    });
    console.log('[Toast Debug] Agent change toast created');
}

// Export toaster getter for ToastProvider
export { getToaster };
