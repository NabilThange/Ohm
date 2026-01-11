import { KeyManager } from './key-manager';

/**
 * API Health Monitoring Utility
 * Logs detailed status of all API keys and their usage
 */
export function logAPIHealth() {
    const km = KeyManager.getInstance();
    console.log('\n📊 API Health Report\n' + '='.repeat(50));
    console.log(km.getStatus());
    console.log('='.repeat(50) + '\n');
}

/**
 * Get API health metrics as JSON
 */
export function getAPIHealthMetrics() {
    const km = KeyManager.getInstance();
    return {
        totalKeys: km.getTotalKeys(),
        healthyKeys: km.getHealthyKeyCount(),
        status: km.getStatus()
    };
}

// Optional: Auto-log health every minute (uncomment to enable)
// if (typeof window === 'undefined') { // Server-side only
//     setInterval(logAPIHealth, 60000);
// }
