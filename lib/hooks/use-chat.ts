import { useEffect, useState, useCallback } from 'react'
import { ChatService } from '@/lib/db/chat'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Message = Database['public']['Tables']['messages']['Row']
type ChatSession = Database['public']['Tables']['chat_sessions']['Row']

export function useChat(chatId: string | null, userContext?: any) {
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

        console.log('[useChat] Setting up realtime subscription for chatId:', chatId)

        const channel = supabase
            .channel(`chat:${chatId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                (payload) => {
                    console.log('[useChat] Realtime INSERT event received:', payload.new)
                    const newMsg = payload.new as Message
                    setMessages(prev => {
                        // Dedup based on ID
                        if (prev.some(m => m.id === newMsg.id)) {
                            console.log('[useChat] Message already exists, skipping:', newMsg.id)
                            return prev
                        }
                        console.log('[useChat] Adding new message from realtime:', newMsg.id, newMsg.role)
                        return [...prev, newMsg].sort((a, b) => a.sequence_number - b.sequence_number)
                    })
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chat_sessions', filter: `chat_id=eq.${chatId}` },
                (payload) => {
                    console.log('[useChat] Session update received:', payload.new)
                    setSession(payload.new as ChatSession)
                }
            )
            .subscribe((status) => {
                console.log('[useChat] Subscription status:', status, 'for chatId:', chatId)
            })

        return () => {
            console.log('[useChat] Unsubscribing from chatId:', chatId)
            supabase.removeChannel(channel)
        }
    }, [chatId])

    const sendMessage = useCallback(async (content: string) => {
        if (!chatId) return

        const tempId = crypto.randomUUID()
        console.log('[useChat] sendMessage called with:', { content, chatId })

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

            console.log('[useChat] Adding optimistic user message:', optimisticMsg.id)
            setMessages(prev => {
                console.log('[useChat] Current messages before user add:', prev.length)
                return [...prev, optimisticMsg]
            })

            // Call API with userContext
            const res = await fetch('/api/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: content, chatId, userContext })
            })

            const data = await res.json()
            console.log('[useChat] API response:', data)

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
                console.log('[useChat] Adding optimistic AI message:', aiTempId, 'content length:', data.response.length)
                setMessages(prev => {
                    console.log('[useChat] Current messages before AI add:', prev.length)
                    const updated = [...prev, optimisticAiMsg]
                    console.log('[useChat] Messages after AI add:', updated.length)
                    return updated
                })
            } else {
                console.warn('[useChat] No response in API data:', data)
            }

            // Realtime will replace the optimistic message eventually.

        } catch (err: any) {
            console.error('[useChat] Send failed:', err)
            setError(err.message)
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId))
        }
    }, [chatId])

    return { messages, session, isLoading, error, sendMessage }
}
