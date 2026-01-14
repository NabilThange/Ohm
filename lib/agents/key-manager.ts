import {
    showKeyFailureToast,
    showAllKeysExhaustedToast,
    showKeyRotationSuccessToast,
    showKeyManagerInitToast
} from './toast-notifications';

/**
 * Production-Grade Key Manager with Health Tracking
 * Manages rotation and health status of Bytez API keys
 */
export interface KeyRotationEvent {
    type: 'key_failed' | 'key_rotated' | 'all_keys_exhausted';
    failedKeyIndex?: number;
    newKeyIndex?: number;
    remainingKeys?: number;
    totalKeys?: number;
    message?: string;
}

export class KeyManager {
    private static instance: KeyManager;
    private keys: string[] = [];
    private currentIndex: number = 0;
    private failedKeys: Set<number> = new Set();
    private metrics = {
        usage: new Map<number, number>(),
        errors: new Map<number, number>(),
        lastRotation: Date.now()
    };
    private lastEvent: KeyRotationEvent | null = null;

    private constructor() {
        this.loadKeys();
    }

    static getInstance(): KeyManager {
        if (!KeyManager.instance) {
            KeyManager.instance = new KeyManager();
        }
        return KeyManager.instance;
    }

    /**
     * Get and clear the last rotation event (for API routes to return to client)
     */
    getAndClearLastEvent(): KeyRotationEvent | null {
        const event = this.lastEvent;
        this.lastEvent = null;
        return event;
    }

    /**
     * Load keys from environment with fallback support
     * Supports new numbered format: BYTEZ_API_KEY_1, BYTEZ_API_KEY_2, etc.
     * Also supports legacy comma-separated format for backwards compatibility
     */
    private loadKeys() {
        const keys: string[] = [];

        // Try new numbered format first: BYTEZ_API_KEY_1, BYTEZ_API_KEY_2, etc.
        for (let i = 1; i <= 20; i++) { // Support up to 20 keys
            const key = process.env[`BYTEZ_API_KEY_${i}`] || process.env[`NEXT_PUBLIC_BYTEZ_API_KEY_${i}`];
            if (key && key.trim().length > 0) {
                keys.push(key.trim());
            } else {
                // Stop at first gap (no more sequential keys)
                break;
            }
        }

        // Fallback to legacy comma-separated format
        if (keys.length === 0) {
            const keysString = process.env.BYTEZ_API_KEYS || "";
            const legacyKey = process.env.BYTEZ_API_KEY || process.env.NEXT_PUBLIC_BYTEZ_API_KEY;

            const parsedKeys = keysString
                .split(",")
                .map(k => k.trim())
                .filter(k => k.length > 0);

            if (parsedKeys.length > 0) {
                keys.push(...parsedKeys);
            } else if (legacyKey) {
                keys.push(legacyKey);
            }
        }

        if (keys.length === 0) {
            throw new Error("❌ CRITICAL: No BYTEZ_API_KEY_* found in environment. Please set BYTEZ_API_KEY_1, BYTEZ_API_KEY_2, etc.");
        }

        this.keys = keys;
        console.log(`🔑 KeyManager initialized with ${this.keys.length} keys`);

        // Show toast notification if running in browser
        if (typeof window !== 'undefined') {
            showKeyManagerInitToast(this.keys.length);
        }
    }

    /**
     * Get current active key
     */
    getCurrentKey(): string {
        if (this.keys.length === 0) {
            throw new Error("No API keys available");
        }
        if (this.failedKeys.has(this.currentIndex)) {
            throw new Error("Current key is marked as failed");
        }
        return this.keys[this.currentIndex];
    }

    /**
     * Rotate to next healthy key (skips failed ones)
     */
    rotateKey(): boolean {
        const startIndex = this.currentIndex;
        let attempts = 0;

        do {
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;
            attempts++;

            // Skip failed keys
            if (!this.failedKeys.has(this.currentIndex)) {
                console.log(`🔄 Rotated: Key #${startIndex + 1} → Key #${this.currentIndex + 1}`);
                this.metrics.lastRotation = Date.now();

                // Record event for API to return to client
                this.lastEvent = {
                    type: 'key_rotated',
                    failedKeyIndex: startIndex,
                    newKeyIndex: this.currentIndex,
                    remainingKeys: this.getHealthyKeyCount(),
                    totalKeys: this.keys.length,
                    message: `Rotated to backup key #${this.currentIndex + 1}`
                };

                // Show success toast for rotation (only if running in browser)
                if (typeof window !== 'undefined') {
                    showKeyRotationSuccessToast(this.currentIndex);
                }

                return true;
            }

            // Prevent infinite loop - if we've checked all keys, fail
            if (attempts >= this.keys.length) {
                console.error("❌ All keys have failed");

                // Record event for API to return to client
                this.lastEvent = {
                    type: 'all_keys_exhausted',
                    totalKeys: this.keys.length,
                    remainingKeys: 0,
                    message: `All ${this.keys.length} API keys exhausted`
                };

                // Show error toast when all keys exhausted (only if running in browser)
                if (typeof window !== 'undefined') {
                    showAllKeysExhaustedToast(this.keys.length);
                }

                return false;
            }
        } while (true);
    }

    /**
     * Mark current key as permanently failed
     */
    markCurrentKeyAsFailed() {
        this.failedKeys.add(this.currentIndex);
        const errorCount = (this.metrics.errors.get(this.currentIndex) || 0) + 1;
        this.metrics.errors.set(this.currentIndex, errorCount);
        console.warn(`💀 Key #${this.currentIndex + 1} marked as FAILED (${errorCount} errors)`);

        // Record event for API to return to client
        this.lastEvent = {
            type: 'key_failed',
            failedKeyIndex: this.currentIndex,
            remainingKeys: this.getHealthyKeyCount(),
            totalKeys: this.keys.length,
            message: `API Key #${this.currentIndex + 1} failed`
        };

        // Show warning toast for key failure (only if running in browser)
        if (typeof window !== 'undefined') {
            const remainingKeys = this.getHealthyKeyCount();
            showKeyFailureToast(this.currentIndex, this.keys.length, `${remainingKeys} backup keys available`);
        }
    }

    /**
     * Record successful API call
     */
    recordSuccess() {
        const count = (this.metrics.usage.get(this.currentIndex) || 0) + 1;
        this.metrics.usage.set(this.currentIndex, count);
    }

    /**
     * Get total number of keys
     */
    getTotalKeys(): number {
        return this.keys.length;
    }

    /**
     * Get number of healthy (non-failed) keys
     */
    getHealthyKeyCount(): number {
        return this.keys.length - this.failedKeys.size;
    }

    /**
     * Get detailed status for monitoring
     */
    getStatus(): string {
        const healthy = this.getHealthyKeyCount();
        const total = this.getTotalKeys();
        const status = Array.from({ length: total }, (_, i) => {
            const isCurrent = i === this.currentIndex;
            const isFailed = this.failedKeys.has(i);
            const usage = this.metrics.usage.get(i) || 0;
            const errors = this.metrics.errors.get(i) || 0;

            let icon = isFailed ? '❌' : (isCurrent ? '✅' : '⏸️');
            return `${icon} Key #${i + 1}: ${usage} calls, ${errors} errors`;
        });

        return `🔑 API Keys: ${healthy}/${total} healthy\n${status.join('\n')}`;
    }

    /**
     * Reset all failed keys (for manual recovery)
     */
    resetFailedKeys() {
        this.failedKeys.clear();
        console.log("♻️ Reset all failed key markers");
    }

    /**
     * FOR TESTING ONLY - Inject mock keys
     */
    static createTestInstance(mockKeys: string[]): KeyManager {
        const instance = new KeyManager();
        instance.keys = mockKeys;
        KeyManager.instance = instance;
        return instance;
    }
}
