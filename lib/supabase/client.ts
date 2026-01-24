import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Client-side singleton
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
    if (typeof window === 'undefined') {
        // Server-side: Always create a new client with SERVICE_ROLE_KEY to bypass RLS
        // This is safe because this code only runs on the server
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.warn('[Supabase] ⚠️ No SERVICE_ROLE_KEY found, using ANON_KEY (RLS will be enforced)');
        } else {
            console.log('[Supabase] ✅ Using SERVICE_ROLE_KEY for server-side operations');
        }
        
        return createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceKey!
        )
    }

    // Client-side: Use singleton with ANON_KEY
    if (!supabaseInstance) {
        supabaseInstance = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }

    return supabaseInstance
}

// Export a getter that always calls getSupabaseClient() to ensure correct context
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
    get(target, prop) {
        const client = getSupabaseClient();
        return (client as any)[prop];
    }
})
