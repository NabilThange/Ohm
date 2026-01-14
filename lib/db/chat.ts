import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type ChatInsert = Database['public']['Tables']['chats']['Insert']
type ChatSessionInsert = Database['public']['Tables']['chat_sessions']['Insert']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

export const ChatService = {
    /**
     * Create a new chat for a user.
     * If userId is not provided (e.g. anonymous), it will error if RLS enforces it.
     */
    async createChat(userId: string, title: string = 'New Hardware Project') {
        // If userId is the dummy default, treat as anonymous (null)
        // This relies on the 'chats.user_id' column being nullable in the schema
        const validUserId = userId === '00000000-0000-0000-0000-000000000000' ? null : userId;

        const { data: chat, error } = await supabase
            .from('chats')
            .insert({ user_id: validUserId, title })
            .select()
            .single()

        if (error) throw error

        // Create a companion session for multi-agent state
        const { error: sessionError } = await supabase
            .from('chat_sessions')
            .insert({ chat_id: chat.id })

        if (sessionError) console.warn('Failed to create chat session:', sessionError)

        return chat
    },

    /**
     * Get full message history for a chat
     */
    async getMessages(chatId: string) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('sequence_number', { ascending: true })

        if (error) throw error
        return data
    },

    /**
     * Add a message to the chat
     */
    async addMessage(message: MessageInsert) {
        const { data, error } = await supabase
            .from('messages')
            .insert(message)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Get the current session state (active agent, budget, etc.)
     */
    async getSession(chatId: string) {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('chat_id', chatId)
            .maybeSingle()

        if (error) throw error
        return data
    },

    /**
     * Update session state (e.g. switch agent, lock plan)
     */
    async updateSession(chatId: string, updates: Partial<Database['public']['Tables']['chat_sessions']['Update']>) {
        const { data, error } = await supabase
            .from('chat_sessions')
            .update(updates)
            .eq('chat_id', chatId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Subscribe to new messages in a chat
     */
    subscribeToMessages(chatId: string, callback: (payload: any) => void) {
        return supabase
            .channel(`chat:${chatId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                callback
            )
            .subscribe()
    },

    /**
     * Update chat properties (e.g. title)
     */
    async updateChat(chatId: string, updates: Partial<Database['public']['Tables']['chats']['Update']>) {
        const { data, error } = await supabase
            .from('chats')
            .update(updates)
            .eq('id', chatId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Get the next sequence number for a chat
     */
    async getNextSequenceNumber(chatId: string) {
        const { data, error } = await supabase
            .from('messages')
            .select('sequence_number')
            .eq('chat_id', chatId)
            .order('sequence_number', { ascending: false })
            .limit(1)

        if (error) throw error
        const max = data[0]?.sequence_number || 0
        return max + 1
    }
}
