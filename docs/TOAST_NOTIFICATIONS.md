# Toast Notifications for API Failover

## Overview

The API failover system now includes **visual toast notifications** that alert users when API keys fail and the system rotates to backup keys.

## Features

✅ **Automatic Notifications** - Toasts appear automatically when:
- An API key fails (warning toast)
- System rotates to a backup key (success toast)
- All keys are exhausted (error toast that stays until dismissed)
- System initializes with multiple keys (info toast)

✅ **User-Friendly** - Clear, non-technical messages
✅ **Non-Intrusive** - Appears in bottom-right corner
✅ **Auto-Dismiss** - Most toasts disappear after 3-5 seconds
✅ **Dark Mode Support** - Adapts to your theme
✅ **Mobile Responsive** - Works on all screen sizes

## Files Added

| File | Purpose |
|------|---------|
| `lib/agents/toast-notifications.ts` | Toast manager and helper functions |
| `components/ToastProvider.tsx` | React component for rendering toasts |
| `components/toast.css` | Styling for toast notifications |

## Files Modified

| File | Changes |
|------|---------|
| `lib/agents/key-manager.ts` | Added toast calls on key events |
| `app/layout.tsx` | Added `<ToastProvider />` to root layout |

## Toast Types

### 1. **Key Failure Warning** (Yellow)
```
⚠️ API Key #1 Failed
Switching to backup key... (4 remaining)
```

### 2. **Successful Rotation** (Green)
```
✅ API Key Rotated
Now using backup key #2
```

### 3. **All Keys Exhausted** (Red)
```
❌ All API Keys Exhausted
All 5 API keys have run out of credits. Please add credits or new keys.
```
*This toast stays until manually dismissed*

### 4. **System Initialized** (Blue)
```
ℹ️ API Failover Active
5 API keys loaded. Automatic failover enabled.
```

## How It Works

1. **KeyManager detects failure** → Marks key as failed
2. **Shows warning toast** → "API Key #X Failed"
3. **Rotates to next key** → Finds healthy backup
4. **Shows success toast** → "Now using backup key #Y"
5. **User continues working** → No interruption

## Testing

To test the toast notifications:

1. **Add an invalid key first** in `.env.local`:
   ```bash
   BYTEZ_API_KEYS="sk-invalid,sk-real-key-1,sk-real-key-2"
   ```

2. **Make an API call** through your app

3. **Watch for toasts** in bottom-right corner:
   - Warning: "API Key #1 Failed"
   - Success: "Now using backup key #2"

## Customization

### Change Toast Position

Edit `lib/agents/toast-notifications.ts`:
```typescript
export const apiToaster = createToaster({
  placement: 'top-end', // Options: top-start, top-end, bottom-start, bottom-end
  overlap: true,
  gap: 16,
});
```

### Change Toast Duration

```typescript
showKeyFailureToast(keyIndex, totalKeys, error) {
  apiToaster.warning({
    title: `API Key #${keyIndex + 1} Failed`,
    description: `Switching to backup key...`,
    duration: 6000, // 6 seconds instead of 4
  });
}
```

### Disable Toasts

To disable toasts, comment out the toast calls in `key-manager.ts`:
```typescript
// if (typeof window !== 'undefined') {
//     showKeyFailureToast(...);
// }
```

## Browser vs Server

Toasts only appear in the browser (client-side). The system checks `typeof window !== 'undefined'` before showing toasts, so server-side API calls won't trigger visual notifications (but will still log to console).

## Dependencies

Uses **Ark UI Toast** component:
- Already installed: `@ark-ui/react` (v5.30.0)
- Zero additional dependencies needed
- Fully accessible (ARIA compliant)

---

**Status**: ✅ **FULLY INTEGRATED**

Toast notifications are now live! API key failures will trigger user-friendly alerts automatically.
