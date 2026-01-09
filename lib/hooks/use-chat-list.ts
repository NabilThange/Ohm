import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Chat = Database['public']['Tables']['chats']['Row']

export function useChatList(userId: string) {
    const [chats, setChats] = useState<Chat[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!userId) return

        // Handle anonymous user (dummy ID)
        const isAnonymous = userId === '00000000-0000-0000-0000-000000000000'

        const load = async () => {
            setIsLoading(true)
            let query = supabase
                .from('chats')
                .select('*')
                .order('last_message_at', { ascending: false })

            if (isAnonymous) {
                query = query.is('user_id', null)
            } else {
                query = query.eq('user_id', userId)
            }

            const { data, error } = await query
            if (error) console.error('Failed to load chats:', error)
            setChats(data || [])
            setIsLoading(false)
        }
        load()

        // Subscribe to new/updated chats
        // Note: Realtime filter for NULL values (is:null) can be tricky. 
        // string filter format: user_id=is.null
        const filter = isAnonymous ? `user_id=is.null` : `user_id=eq.${userId}`

        const channel = supabase
            .channel('chat_list')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chats', filter },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setChats(prev => [payload.new as Chat, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setChats(prev => prev.map(c => c.id === payload.new.id ? payload.new as Chat : c))
                    } else if (payload.eventType === 'DELETE') {
                        setChats(prev => prev.filter(c => c.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [userId])

    return { chats, isLoading }
}
