import { KeyManager } from '../key-manager';

describe('KeyManager Failover', () => {
    beforeEach(() => {
        // Reset singleton
        (KeyManager as any).instance = null;
    });

    test('should rotate through all keys', () => {
        const km = KeyManager.createTestInstance(['key1', 'key2', 'key3']);

        expect(km.getCurrentKey()).toBe('key1');
        km.rotateKey();
        expect(km.getCurrentKey()).toBe('key2');
        km.rotateKey();
        expect(km.getCurrentKey()).toBe('key3');
    });

    test('should skip failed keys', () => {
        const km = KeyManager.createTestInstance(['key1', 'key2', 'key3']);

        km.rotateKey(); // Now at key2
        km.markCurrentKeyAsFailed(); // Mark key2 as failed
        km.rotateKey(); // Should skip to key3

        expect(km.getCurrentKey()).toBe('key3');
        expect(km.getHealthyKeyCount()).toBe(2);
    });

    test('should fail when all keys exhausted', () => {
        const km = KeyManager.createTestInstance(['key1', 'key2']);

        km.markCurrentKeyAsFailed();
        km.rotateKey();
        km.markCurrentKeyAsFailed();

        expect(km.rotateKey()).toBe(false);
        expect(km.getHealthyKeyCount()).toBe(0);
    });

    test('should track usage metrics', () => {
        const km = KeyManager.createTestInstance(['key1', 'key2']);

        km.recordSuccess();
        km.recordSuccess();
        km.rotateKey();
        km.recordSuccess();

        const status = km.getStatus();
        expect(status).toContain('2 calls');
        expect(status).toContain('1 calls');
    });

    test('should handle single key gracefully', () => {
        const km = KeyManager.createTestInstance(['key1']);

        expect(km.getCurrentKey()).toBe('key1');
        expect(km.rotateKey()).toBe(false); // Cannot rotate with 1 key
        expect(km.getTotalKeys()).toBe(1);
    });
});
