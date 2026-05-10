"use client";

import { useState, useEffect } from "react";
import { ChatService } from "@/services/chat.service";
import { Conversation, Message, ConversationStatus } from "@/types/chat";
import { Loader2, Headphones, MessageCircle, Check, CircleDot, User, Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { CustomerProfilePanel } from "@/components/chat/admin/CustomerProfilePanel";

export default function AdminSupportPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const [filter, setFilter] = useState<ConversationStatus | 'all'>('all');

    // Subscribe to conversations
    useEffect(() => {
        const unsubscribe = ChatService.subscribeToConversations((convs) => {
            setConversations(convs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to messages when conversation selected
    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }

        const unsubscribe = ChatService.subscribeToMessages(
            selectedConversation.id,
            (msgs) => setMessages(msgs)
        );

        // Mark as read and set active
        ChatService.markMessagesAsRead(selectedConversation.id);
        if (selectedConversation.status === 'waiting') {
            ChatService.updateConversationStatus(selectedConversation.id, 'active', user?.uid);
        }

        return () => unsubscribe();
    }, [selectedConversation?.id]);

    const handleJoinChat = async () => {
        if (!selectedConversation || !user) return;
        try {
            await ChatService.assignConversation(selectedConversation.id, user.uid);
            toast.success("You joined the chat");
        } catch (error) {
            toast.error("Failed to join chat");
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !selectedConversation || !user) return;

        setSending(true);
        try {
            await ChatService.sendMessage(
                selectedConversation.id,
                user.uid,
                user.displayName || 'Support Agent',
                'admin',
                inputValue.trim()
            );
            setInputValue("");
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleCloseConversation = async () => {
        if (!selectedConversation) return;

        try {
            await ChatService.closeConversation(selectedConversation.id);
            toast.success("Conversation closed");
            setSelectedConversation(null);
        } catch (error) {
            toast.error("Failed to close conversation");
        }
    };

    const filteredConversations = filter === 'all'
        ? conversations
        : conversations.filter(c => c.status === filter);

    const waitingCount = conversations.filter(c => c.status === 'waiting').length;
    const activeCount = conversations.filter(c => c.status === 'active').length;

    const getStatusColor = (status: ConversationStatus) => {
        switch (status) {
            case 'waiting': return 'text-amber-500';
            case 'active': return 'text-green-500';
            case 'closed': return 'text-muted-foreground';
            default: return 'text-blue-500';
        }
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Headphones className="w-8 h-8 text-primary" />
                        <div>
                            <h1 className="font-serif text-2xl">Support Dashboard</h1>
                            <p className="text-sm text-muted-foreground">
                                {waitingCount > 0 && <span className="text-amber-500 font-medium">{waitingCount} waiting </span>}
                                • {activeCount} active
                            </p>
                        </div>
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as ConversationStatus | 'all')}
                        className="px-4 py-2 bg-background border border-border rounded-lg text-sm"
                    >
                        <option value="all">All</option>
                        <option value="waiting">Waiting</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Main Content - Flex Row */}
            <div className="flex-1 flex overflow-hidden">

                {/* 1. Conversations List (Left Panel) */}
                <div className="w-80 border-r border-border overflow-y-auto flex-shrink-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No conversations</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-muted' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <CircleDot className={`w-3 h-3 ${getStatusColor(conv.status)}`} />
                                        <span className="font-medium text-sm truncate w-32">{conv.userName}</span>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                                    </p>
                                    {conv.assignedTo === user?.uid && (
                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                            You
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 2. Chat Area (Middle Panel) */}
                <div className="flex-1 flex flex-col min-w-0">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{selectedConversation.userName}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{selectedConversation.userEmail}</span>
                                            {selectedConversation.status === 'waiting' && (
                                                <span className="text-amber-500 font-medium">• Waiting for agent</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {selectedConversation.status === 'waiting' && (
                                        <button
                                            onClick={handleJoinChat}
                                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                                        >
                                            <Check className="w-4 h-4 inline mr-1" />
                                            Join Chat
                                        </button>
                                    )}
                                    {selectedConversation.status !== 'closed' && (
                                        <button
                                            onClick={handleCloseConversation}
                                            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                                        >
                                            <X className="w-4 h-4 inline mr-1" />
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${msg.senderType !== 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${msg.senderType === 'user'
                                                ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
                                                : msg.senderType === 'admin'
                                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                    : 'bg-blue-600/30 border border-blue-500/30 text-blue-100 rounded-tr-sm'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            <p className="text-[10px] opacity-70 mt-2">
                                                {msg.senderName} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input - Only if active or admin joined */}
                            {selectedConversation.status !== 'closed' ? (
                                <div className="p-4 border-t border-border flex-shrink-0">
                                    {selectedConversation.assignedTo && selectedConversation.assignedTo !== user?.uid ? (
                                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg text-sm text-center">
                                            Another agent is handling this chat.
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                                placeholder="Type your reply..."
                                                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!inputValue.trim() || sending}
                                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                                            >
                                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 border-t border-border bg-muted/30 text-center text-muted-foreground text-sm">
                                    This conversation is closed.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Customer Profile (Right Panel) */}
                {selectedConversation && (
                    <CustomerProfilePanel
                        userId={selectedConversation.userId}
                        userName={selectedConversation.userName}
                        userEmail={selectedConversation.userEmail}
                    />
                )}

            </div>
        </div>
    );
}
