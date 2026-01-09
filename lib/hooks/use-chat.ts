import { useEffect, useState, useCallback } from 'react'
import { ChatService } from '@/lib/db/chat'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Message = Database['public']['Tables']['messages']['Row']
type ChatSession = Database['public']['Tables']['chat_sessions']['Row']

export function useChat(chatId: string | null) {
    const [messages, setMessages] = useState<Message[]>([])
    const [session, setSession] = useState<ChatSession | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load initial history
    useEffect(() => {
        if (!chatId) {
            setMessages([])
            setSession(null)
            return
        }

        const load = async () => {
            setIsLoading(true)
            try {
                const [msgs, sess] = await Promise.all([
                    ChatService.getMessages(chatId),
                    ChatService.getSession(chatId)
                ])
                setMessages(msgs || [])
                setSession(sess || null)
            } catch (err: any) {
                console.error('Failed to load chat:', err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        load()
    }, [chatId])

    // Subscribe to realtime updates
    useEffect(() => {
        if (!chatId) return

        const channel = supabase
            .channel(`chat:${chatId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages(prev => {
                        // Dedup based on ID
                        if (prev.some(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg].sort((a, b) => a.sequence_number - b.sequence_number)
                    })
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chat_sessions', filter: `chat_id=eq.${chatId}` },
                (payload) => {
                    setSession(payload.new as ChatSession)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [chatId])

    const sendMessage = useCallback(async (content: string) => {
        if (!chatId) return

        const tempId = crypto.randomUUID()
        try {
            // Optimistic update
            const now = new Date().toISOString()
            const optimisticMsg: Message = {
                id: tempId,
                chat_id: chatId,
                role: 'user',
                content,
                sequence_number: Date.now(), // temporary
                created_at: now,
                agent_name: null,
                agent_model: null,
                intent: null,
                input_tokens: null,
                output_tokens: null,
                created_artifact_ids: null,
                metadata: null,
                content_search: null
            }

            setMessages(prev => [...prev, optimisticMsg])

            // Call API
            const res = await fetch('/api/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content, chatId })
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            // Optimistic AI Response (using the API return value)
            if (data.response) {
                const aiTempId = crypto.randomUUID()
                const optimisticAiMsg: Message = {
                    id: aiTempId,
                    chat_id: chatId,
                    role: 'assistant',
                    content: data.response,
                    sequence_number: Date.now() + 1, // temporary
                    created_at: new Date().toISOString(),
                    agent_name: 'conversational',
                    agent_model: null,
                    intent: null,
                    input_tokens: null,
                    output_tokens: null,
                    created_artifact_ids: null,
                    metadata: null,
                    content_search: null
                }
                setMessages(prev => [...prev, optimisticAiMsg])
            }

            // Realtime will replace the optimistic message eventually.

        } catch (err: any) {
            console.error('Send failed:', err)
            setError(err.message)
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId))
        }
    }, [chatId])

    return { messages, session, isLoading, error, sendMessage }
}
