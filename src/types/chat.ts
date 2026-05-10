import { Timestamp } from 'firebase/firestore';

export type ConversationStatus = 'bot' | 'waiting' | 'active' | 'closed';
export type MessageSenderType = 'user' | 'bot' | 'admin';
export type MessageType = 'text' | 'image' | 'quick_reply' | 'order_card';

export interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    status: ConversationStatus;
    assignedTo?: string; // Admin userId
    orderId?: string; // Linked order
    category?: 'order' | 'payment' | 'product' | 'general';
    createdAt: string;
    updatedAt: string;
    lastMessage: string;
    unreadCount: number;
}

export interface Message {
    id: string;
    senderId: string;
    senderType: MessageSenderType;
    senderName: string;
    content: string;
    type: MessageType;
    metadata?: any;
    createdAt: string;
    read: boolean;
}

export interface SupportQueue {
    id: string;
    conversationId: string;
    userId: string;
    priority: 'low' | 'medium' | 'high';
    waitingSince: string;
    category?: string;
}
