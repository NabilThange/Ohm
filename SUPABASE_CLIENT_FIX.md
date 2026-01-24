# Supabase Client Fix - First Message Visibility Issue

## Problem
The first AI response from the Project Initializer was not visible in the UI, even though:
- ✅ The agent generated the response successfully (visible in terminal logs)
- ✅ User messages were saved correctly
- ❌ Assistant messages were not being saved to the database

## Root Cause
The `lib/supabase/client.ts` was exporting a singleton client instance that was evaluated at module load time:

```typescript
export const supabase = getSupabaseClient()
```

This caused issues because:
1. The module might be evaluated during the build process or on the client side
2. The `typeof window === 'undefined'` check would fail in some contexts
3. Server-side code was using the ANON_KEY instead of SERVICE_ROLE_KEY
4. Row Level Security (RLS) blocked the insert of assistant messages

## Solution
Changed the export to use a Proxy that dynamically calls `getSupabaseClient()` on every access:

```typescript
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
    get(target, prop) {
        const client = getSupabaseClient();
        return (client as any)[prop];
    }
})
```

This ensures:
- ✅ Server-side code always gets a fresh client with SERVICE_ROLE_KEY
- ✅ Client-side code gets the singleton with ANON_KEY
- ✅ The correct context is determined at runtime, not module load time
- ✅ RLS is bypassed for server-side operations (orchestrator, API routes)

## Testing
After this fix:
1. Restart the dev server: `npm run dev`
2. Create a new chat with a message
3. The Project Initializer's response should now be visible immediately
4. Check terminal logs for: `[Supabase] ✅ Using SERVICE_ROLE_KEY for server-side operations`

## Files Changed
- `lib/supabase/client.ts` - Fixed client export to use Proxy for dynamic context detection
