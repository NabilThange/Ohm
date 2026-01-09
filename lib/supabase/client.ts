import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Client-side singleton
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
    if (typeof window === 'undefined') {
        // Server-side: always create new instance or handle appropriately
        // For simple usage, we can just return a new client
        return createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }

    if (!supabaseInstance) {
        supabaseInstance = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }

    return supabaseInstance
}

// Export a default instance for convenience
export const supabase = getSupabaseClient()
