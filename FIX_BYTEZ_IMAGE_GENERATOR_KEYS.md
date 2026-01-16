# BYTEZ API Key Error Fix - Issue #9

## Problem Summary
The wiring diagram breadboard view was failing to generate with this error:

```
[ImageGenerator] BYTEZ_API_KEY not configured - image generation will fail
[ToolExecutor] ⚠️ AI image generation not available (BYTEZ_API_KEY not configuredd)
```

But this was WRONG - the application DOES have BYTEZ API keys! The chat agents were working fine with 11 keys available.

## Root Cause

**The image generator and chat agents were accessing API keys differently:**

### Chat Agents (Working ✅)
- Use `KeyManager.getInstance()` singleton
- Access keys via `keyManager.getCurrentKey()`
- Keys loaded from `BYTEZ_API_KEY_1`, `BYTEZ_API_KEY_2`, etc.
- Automatic key rotation on failures
- **Result**: `🔑 KeyManager initialized with 11 keys`

### Image Generator (Broken ❌)
- Read `process.env.BYTEZ_API_KEY` directly
- No access to numbered keys (`BYTEZ_API_KEY_1`, etc.)
- No key rotation support
- **Result**: `BYTEZ_API_KEY not configured`

**The mismatch:** The environment has `BYTEZ_API_KEY_1` through `BYTEZ_API_KEY_11`, but the image generator was looking for a single `BYTEZ_API_KEY` variable that doesn't exist!

## Solution Implemented

### Updated ImageGenerator to Use KeyManager

**File:** `lib/diagram/image-generator.ts`

#### 1. Added KeyManager Import
```typescript
import { KeyManager } from '@/lib/agents/key-manager';
```

#### 2. Changed Constructor
**Before:**
```typescript
constructor() {
  this.bytezApiKey = process.env.BYTEZ_API_KEY || '';
  if (!this.bytezApiKey) {
    console.warn('[ImageGenerator] BYTEZ_API_KEY not configured - image generation will fail');
  }
}
```

**After:**
```typescript
constructor() {
  // Use KeyManager instead of reading env vars directly
  this.keyManager = KeyManager.getInstance();
  console.log(`[ImageGenerator] Initialized with KeyManager (${this.keyManager.getTotalKeys()} keys available)`);
}
```

#### 3. Updated callBytezAPI Method
**Before:**
```typescript
private async callBytezAPI(prompt: string, model: string): Promise<string> {
  if (!this.bytezApiKey) {
    throw new Error('BYTEZ_API_KEY not configured');
  }
  
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': this.bytezApiKey,
      ...
    }
  });
  ...
}
```

**After:**
```typescript
private async callBytezAPI(prompt: string, model: string): Promise<string> {
  // Get current API key from KeyManager
  const apiKey = this.keyManager.getCurrentKey();
  
  if (!apiKey) {
    throw new Error('No BYTEZ API keys available');
  }
  
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': apiKey,
        ...
      }
    });

    if (!response.ok) {
      // Check if it's an auth error (bad API key)
      if (response.status === 401 || response.status === 403) {
        console.error(`[ImageGenerator] API key failed with ${response.status}`);
        this.keyManager.markCurrentKeyAsFailed();
        
        // Try to rotate to next key
        if (this.keyManager.rotateKey()) {
          console.log('[ImageGenerator] Retrying with next API key...');
          // Recursive retry with new key
          return this.callBytezAPI(prompt, model);
        } else {
          throw new Error('All BYTEZ API keys exhausted');
        }
      }
      ...
    }

    // Record successful API call
    this.keyManager.recordSuccess();
    return data.output;
  } catch (error: any) {
    ...
  }
}
```

#### 4. Updated isConfigured Method
**Before:**
```typescript
isConfigured(): boolean {
  return !!this.bytezApiKey;
}
```

**After:**
```typescript
isConfigured(): boolean {
  return this.keyManager.getHealthyKeyCount() > 0;
}
```

## New Features Added

### 1. Automatic Key Rotation
- If an API key fails (401/403 error), it's automatically marked as failed
- System rotates to the next available key
- Retries the request with the new key
- No manual intervention needed

### 2. Key Health Tracking
- Successful calls are recorded
- Failed keys are marked and skipped
- Health status available via `keyManager.getStatus()`

### 3. Consistent Key Management
- Image generator now uses the SAME key system as chat agents
- All components share the same KeyManager singleton
- Unified logging and monitoring

## Benefits

### Before (Broken)
```
❌ Image generator: No keys found
✅ Chat agents: 11 keys available
❌ No key rotation for images
❌ Inconsistent error messages
```

### After (Fixed)
```
✅ Image generator: 11 keys available
✅ Chat agents: 11 keys available
✅ Automatic key rotation for images
✅ Consistent error messages
✅ Unified key management
```

## Expected Logs

### Successful Image Generation
```
[ImageGenerator] Initialized with KeyManager (11 keys available)
[ImageGenerator] Starting generation with model: dreamlike-art/dreamlike-photoreal-2.0
[ImageGenerator] Attempt 1/3
[ImageGenerator] Calling https://api.bytez.com/models/v2/dreamlike-art/dreamlike-photoreal-2.0 with key #11
[ImageGenerator] Received image URL: https://...
[ImageGenerator] Downloading image from BYTEZ...
[ImageGenerator] Downloaded image: 245.67 KB
[ImageGenerator] Uploading to Supabase Storage...
[ImageGenerator] ✅ Image generation successful!
[ImageGenerator] Storage path: chat-id/wiring-1234567890.png
[ImageGenerator] Public URL: https://...
```

### With Key Rotation (if first key fails)
```
[ImageGenerator] Calling https://api.bytez.com/models/v2/... with key #11
[ImageGenerator] API key failed with 401
💀 Key #1 marked as FAILED (1 errors)
🔄 Rotated: Key #1 → Key #2
[ImageGenerator] Retrying with next API key...
[ImageGenerator] Calling https://api.bytez.com/models/v2/... with key #11
[ImageGenerator] Received image URL: https://...
✅ Image generation successful!
```

## Testing

### Test 1: Verify KeyManager Integration
```typescript
const generator = new ImageGenerator();
console.log(generator.isConfigured()); // Should be true
```

**Expected output:**
```
[ImageGenerator] Initialized with KeyManager (11 keys available)
true
```

### Test 2: Generate Breadboard Image
```typescript
const result = await generator.generateBreadboardImage(
  "ESP32 connected to LED on breadboard",
  "chat-123"
);
console.log(result.url);
```

**Expected:** Image URL returned successfully

### Test 3: Check Key Status
```typescript
const keyManager = KeyManager.getInstance();
console.log(keyManager.getStatus());
```

**Expected:**
```
🔑 API Keys: 11/11 healthy
✅ Key #1: 5 calls, 0 errors
⏸️ Key #2: 0 calls, 0 errors
...
```

## Files Modified

**Modified:**
1. `lib/diagram/image-generator.ts`
   - Added KeyManager import
   - Changed constructor to use KeyManager
   - Updated callBytezAPI with key rotation
   - Updated isConfigured method
   - Added automatic retry on auth failures

## Backward Compatibility

✅ **Fully backward compatible**
- Still works if someone has `BYTEZ_API_KEY` set
- KeyManager falls back to legacy single key
- No breaking changes to API

## Error Handling Improvements

### Before
```typescript
// Single point of failure
if (!this.bytezApiKey) {
  throw new Error('BYTEZ_API_KEY not configured');
}
// ❌ No retry, no rotation
```

### After
```typescript
// Multiple keys with automatic failover
const apiKey = this.keyManager.getCurrentKey();

if (response.status === 401 || response.status === 403) {
  this.keyManager.markCurrentKeyAsFailed();
  if (this.keyManager.rotateKey()) {
    return this.callBytezAPI(prompt, model); // Retry with new key
  }
}
// ✅ Automatic retry with next key
```

## Troubleshooting

### Error: "No BYTEZ API keys available"
**Cause:** KeyManager couldn't find any keys in environment

**Solution:**
1. Check environment variables:
   ```bash
   echo $BYTEZ_API_KEY_1
   echo $BYTEZ_API_KEY_2
   ```
2. Ensure keys are set in `.env.local`:
   ```
   BYTEZ_API_KEY_1=your-key-here
   BYTEZ_API_KEY_2=your-key-here
   ```
3. Restart dev server after adding keys

### Error: "All BYTEZ API keys exhausted"
**Cause:** All keys have failed (401/403 errors)

**Solution:**
1. Check if keys are valid
2. Check API quota/limits
3. Reset failed keys:
   ```typescript
   KeyManager.getInstance().resetFailedKeys();
   ```

### Image Still Not Generating
**Possible causes:**
1. Supabase storage bucket doesn't exist
2. Network/firewall issues
3. BYTEZ API is down

**Debug steps:**
1. Check console logs for exact error
2. Verify Supabase bucket exists: `wiring-images`
3. Test BYTEZ API directly with curl
4. Check network tab in browser dev tools

## Future Enhancements (Optional)

1. **Parallel key testing** - Test all keys on startup
2. **Key health monitoring** - Periodic health checks
3. **Smart key selection** - Use least-used key first
4. **Rate limit handling** - Detect and handle rate limits
5. **Key analytics** - Track usage patterns per key

---

**Result**: Image generator now uses the same KeyManager as chat agents, fixing the "BYTEZ_API_KEY not configured" error and enabling automatic key rotation! 🎉
