import { useEffect, useState, useCallback } from 'react'
import { ChatService } from '@/lib/db/chat'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { showKeyFailureToast, showKeyRotationSuccessToast } from '@/lib/agents/toast-notifications'

type Message = Database['public']['Tables']['messages']['Row']
type ChatSession = Database['public']['Tables']['chat_sessions']['Row']

export function useChat(chatId: string | null, userContext?: any, onAgentChange?: (agent: any) => void) {
    const [messages, setMessages] = useState<Message[]>([])
    const [session, setSession] = useState<ChatSession | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [forceAgent, setForceAgent] = useState<string | null>(null)

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

            // Call API with userContext and forceAgent
            const res = await fetch('/api/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    chatId,
                    userContext,
                    forceAgent
                })
            })

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to send message');
            }

            // Handle Stream
            const reader = res.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            const aiTempId = crypto.randomUUID();
            let fullContent = "";
            let agentInfo: any = null;

            // Add an empty AI message initially
            setMessages(prev => [
                ...prev,
                {
                    id: aiTempId,
                    chat_id: chatId,
                    role: 'assistant',
                    content: '',
                    sequence_number: Date.now() + 1,
                    created_at: new Date().toISOString(),
                    agent_name: 'thinking...',
                    agent_model: null,
                    intent: 'CHAT',
                    input_tokens: null,
                    output_tokens: null,
                    created_artifact_ids: null,
                    metadata: null,
                    content_search: null
                }
            ]);

            console.log('[useChat] Starting to read stream...');
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('[useChat] Stream finished');
                    break;
                }

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data: ')) continue;

                    try {
                        const data = JSON.parse(line.slice(6));
                        console.log('[useChat] Received stream data:', data.type, data.type === 'text' ? `(${data.content?.length || 0} chars)` : '');

                        if (data.type === 'text') {
                            fullContent += data.content;
                            // Update the AI message content in real-time
                            setMessages(prev => prev.map(m =>
                                m.id === aiTempId ? { ...m, content: fullContent } : m
                            ));
                        } else if (data.type === 'agent_selected') {
                            // EARLY agent notification - fires BEFORE response starts streaming
                            console.log('[useChat] ⚡ EARLY agent selection received:', data.agent);
                            agentInfo = data.agent;

                            // Immediately notify parent (triggers toast + dropdown update)
                            if (onAgentChange) {
                                console.log('[useChat] 🔔 Triggering immediate agent change callback...');
                                onAgentChange(data.agent);
                            }

                            // Update the temporary AI message with agent info
                            setMessages(prev => prev.map(m =>
                                m.id === aiTempId ? {
                                    ...m,
                                    agent_name: data.agent.name,
                                    intent: data.agent.intent
                                } : m
                            ));
                        } else if (data.type === 'metadata') {
                            console.log('[useChat] Received final metadata:', data.agent);
                            // Final metadata - may contain additional info like key rotation
                            // Only update agent if we didn't get early notification
                            if (!agentInfo && data.agent && onAgentChange) {
                                console.log('[useChat] Calling onAgentChange callback (fallback)...');
                                onAgentChange(data.agent);
                            }

                            // Update message with final agent info
                            setMessages(prev => prev.map(m =>
                                m.id === aiTempId ? {
                                    ...m,
                                    agent_name: data.agent.name,
                                    intent: data.agent.intent
                                } : m
                            ));

                            // Handle Key Rotation Events
                            if (data.keyRotationEvent) {
                                console.log('[useChat] Key rotation event detected:', data.keyRotationEvent);
                                const { type, oldKeyIndex, newKeyIndex, totalKeys, error } = data.keyRotationEvent;
                                if (type === 'failure') {
                                    console.log('[useChat] Calling showKeyFailureToast...');
                                    showKeyFailureToast(oldKeyIndex, totalKeys, error || 'Unknown error');
                                } else if (type === 'success') {
                                    console.log('[useChat] Calling showKeyRotationSuccessToast...');
                                    showKeyRotationSuccessToast(newKeyIndex);
                                }
                            }
                        } else if (data.type === 'error') {
                            console.error('[useChat] Stream error:', data.message);
                            throw new Error(data.message);
                        }
                    } catch (e) {
                        console.error('[useChat] Error parsing stream chunk:', e, line);
                    }
                }
            }

            // Clear force agent after use
            setForceAgent(null);

        } catch (err: any) {
            console.error('[useChat] Send failed:', err)
            setError(err.message)
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId))
        }
    }, [chatId, userContext, forceAgent, onAgentChange])

    return { messages, session, isLoading, error, sendMessage, setForceAgent }
}
