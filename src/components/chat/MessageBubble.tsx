"use client";

import { Message } from "@/types/chat";
import { User, Bot, Headphones } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { QuickReplies } from "./QuickReplies";
import { OrderCard } from "./OrderCard";

interface MessageBubbleProps {
    message: Message;
    onQuickReply?: (option: string) => void;
}

export function MessageBubble({ message, onQuickReply }: MessageBubbleProps) {
    const isUser = message.senderType === 'user';
    const isBot = message.senderType === 'bot';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-primary/20' : isBot ? 'bg-blue-500/20' : 'bg-green-500/20'
                }`}>
                {isUser ? (
                    <User className="w-4 h-4 text-primary" />
                ) : isBot ? (
                    <Bot className="w-4 h-4 text-blue-500" />
                ) : (
                    <Headphones className="w-4 h-4 text-green-500" />
                )}
            </div>

            {/* Content */}
            <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl ${isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Rich Content */}
                {message.type === 'order_card' && message.metadata && (
                    <OrderCard {...message.metadata} />
                )}

                {message.type === 'quick_reply' && message.metadata?.quickReplies && onQuickReply && (
                    <QuickReplies
                        options={message.metadata.quickReplies}
                        onSelect={onQuickReply}
                    />
                )}

                <p className={`text-[10px] text-muted-foreground mt-1 ${isUser ? 'text-right' : ''}`}>
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}
