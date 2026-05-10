"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ChatWindow } from "./ChatWindow";
import { ChatService } from "@/services/chat.service";
import { Conversation } from "@/types/chat";

export function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(false);

    // Don't show for admins or unauthenticated users
    if (!user || user.role === 'admin') {
        return null;
    }

    const handleOpen = async () => {
        setIsOpen(true);

        if (!conversation) {
            setLoading(true);
            try {
                const conv = await ChatService.getOrCreateConversation(
                    user.uid,
                    user.displayName || 'Customer',
                    user.email || ''
                );
                setConversation(conv);
            } catch (error) {
                console.error('Failed to open chat:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={handleOpen}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                    <ChatWindow
                        conversation={conversation}
                        loading={loading}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            )}
        </>
    );
}
