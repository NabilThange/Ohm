# UUID Generation Fix

## Problem

The app was generating invalid UUIDs for chat IDs:

```javascript
// ❌ WRONG - Generates invalid UUID
const chatId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
// Example output: "chat-1769186317811-91mbag6g9"
```

**Error:**
```
Could not create chat: invalid input syntax for type uuid: "chat-1769186317811-91mbag6g9"
```

**Why it failed:**
- UUIDs must follow a specific format: `550e8400-e29b-41d4-a716-446655440000`
- Only hex characters (0-9, a-f) are allowed
- Must have hyphens in specific positions
- The generated ID had invalid characters like 'm', 'b', 'g' and wrong format

## Solution

Use the browser's built-in `crypto.randomUUID()` API:

```javascript
// ✅ CORRECT - Generates valid UUID
const chatId = crypto.randomUUID()
// Example output: "550e8400-e29b-41d4-a716-446655440000"
```

## Implementation

### MorphingPromptInput (`components/shared/MorphingPromptInput.tsx`)

**Before:**
```javascript
const chatId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
```

**After:**
```javascript
const chatId = crypto.randomUUID()
```

### Full Context

```javascript
const handleSubmit = async () => {
    if (!message.trim() || isSubmitting) return

    setIsSubmitting(true)
    const userMessage = message.trim()

    if (isLanding || isBuild) {
        // Generate proper UUID for chat ID
        const chatId = crypto.randomUUID()
        
        // Clear input immediately for better UX
        setMessage('')
        
        // Navigate immediately with the message
        router.push(`/build/${chatId}?initialPrompt=${encodeURIComponent(userMessage)}`)
        
        setIsSubmitting(false)
    }
}
```

## Browser Support

`crypto.randomUUID()` is supported in:
- ✅ Chrome 92+
- ✅ Firefox 95+
- ✅ Safari 15.4+
- ✅ Edge 92+

This covers all modern browsers (2021+).

## Benefits

✅ **Valid UUIDs**: Always generates RFC 4122 compliant UUIDs
✅ **Database Compatible**: Works with PostgreSQL UUID type
✅ **Cryptographically Secure**: Uses secure random number generation
✅ **No Dependencies**: Built into the browser
✅ **Simple**: One line of code

## Alternative (if older browser support needed)

If you need to support older browsers, you can use a polyfill:

```javascript
// Polyfill for older browsers
if (!crypto.randomUUID) {
    crypto.randomUUID = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }
}
```

But this is not needed for modern applications.

## Testing

To verify the fix works:

1. Go to landing page (`/`)
2. Type a message in the textarea
3. Press Enter
4. Check the URL - should be `/build/[valid-uuid]`
5. Check browser console - no UUID errors
6. Check database - chat session created successfully

## Result

✅ Chat IDs are now valid UUIDs
✅ Database accepts the IDs without errors
✅ Navigation works smoothly
✅ No more "invalid input syntax for type uuid" errors
