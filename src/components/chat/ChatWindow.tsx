"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, User, Bot, Headphones, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ChatService } from "@/services/chat.service";
import { BotService } from "@/services/bot.service";
import { Conversation, Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
    conversation: Conversation | null;
    loading: boolean;
    onClose: () => void;
}

export function ChatWindow({ conversation, loading, onClose }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Subscribe to messages
    useEffect(() => {
        if (!conversation?.id) return;

        const unsubscribe = ChatService.subscribeToMessages(
            conversation.id,
            (msgs) => {
                setMessages(msgs);
            }
        );

        return () => unsubscribe();
    }, [conversation?.id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send initial bot greeting if new conversation
    useEffect(() => {
        if (conversation && messages.length === 0 && !loading) {
            BotService.handleIncomingMessage(
                user?.uid || 'guest',
                'greeting', // Trigger greeting intent
                conversation.id
            );
        }
    }, [conversation, messages.length, loading, user?.uid]);

    const handleSend = async (contentInput?: string) => {
        const content = contentInput || inputValue.trim();
        if (!content || !conversation || !user) return;

        if (!contentInput) setInputValue("");
        setSending(true);

        try {
            await ChatService.sendMessage(
                conversation.id,
                user.uid,
                user.displayName || 'Customer',
                'user',
                content
            );

            // Trigger Bot Response
            await BotService.handleIncomingMessage(
                user.uid,
                content,
                conversation.id
            );

        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-medium text-sm">Support Chat</h3>
                        <p className="text-xs text-muted-foreground">
                            {conversation?.status === 'waiting' ? 'Waiting for agent...' :
                                conversation?.status === 'active' ? 'Agent connected' :
                                    'Online'}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-muted rounded">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                onQuickReply={(option: string) => handleSend(option)}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        disabled={sending || conversation?.status === 'closed'}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || sending || conversation?.status === 'closed'}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {conversation?.status === 'closed' && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        This conversation has been closed.
                    </p>
                )}
            </div>
        </>
    );
}
