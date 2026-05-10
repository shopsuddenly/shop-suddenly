import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Conversation, Message, ConversationStatus } from '@/types/chat';

const COLLECTION_CONVERSATIONS = 'conversations';
const COLLECTION_MESSAGES = 'messages';

export class ChatService {
    /**
     * Get or create conversation for user
     * Returns existing active conversation or creates new one
     */
    static async getOrCreateConversation(
        userId: string,
        userName: string,
        userEmail: string
    ): Promise<Conversation> {
        console.log('🔄 [CHAT] Getting or creating conversation for:', userId);

        try {
            // Check for existing non-closed conversation
            const q = query(
                collection(db, COLLECTION_CONVERSATIONS),
                where('userId', '==', userId),
                where('status', 'in', ['bot', 'waiting', 'active'])
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const conv = snapshot.docs[0];
                console.log('✅ [CHAT] Found existing conversation:', conv.id);
                return { id: conv.id, ...conv.data() } as Conversation;
            }

            // Create new conversation
            const newConversation: Omit<Conversation, 'id'> = {
                userId,
                userName,
                userEmail,
                status: 'bot',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastMessage: '',
                unreadCount: 0
            };

            const docRef = await addDoc(
                collection(db, COLLECTION_CONVERSATIONS),
                newConversation
            );

            console.log('✅ [CHAT] Created new conversation:', docRef.id);
            return { id: docRef.id, ...newConversation };
        } catch (error) {
            console.error('❌ [CHAT] Error getting/creating conversation:', error);
            throw error;
        }
    }

    /**
     * Send a message in a conversation
     */
    static async sendMessage(
        conversationId: string,
        senderId: string,
        senderName: string,
        senderType: 'user' | 'bot' | 'admin',
        content: string,
        type: 'text' | 'image' | 'quick_reply' | 'order_card' = 'text',
        metadata?: any
    ): Promise<Message> {
        console.log('🔄 [CHAT] Sending message in:', conversationId);

        try {
            const message: Omit<Message, 'id'> = {
                senderId,
                senderType,
                senderName,
                content,
                type,
                metadata,
                createdAt: new Date().toISOString(),
                read: false
            };

            const docRef = await addDoc(
                collection(db, COLLECTION_CONVERSATIONS, conversationId, COLLECTION_MESSAGES),
                message
            );

            // Update conversation
            const convRef = doc(db, COLLECTION_CONVERSATIONS, conversationId);
            await updateDoc(convRef, {
                lastMessage: type === 'text' ? content.slice(0, 100) : `[${type}]`,
                updatedAt: new Date().toISOString(),
                unreadCount: senderType === 'user' ? 1 : 0
            });

            console.log('✅ [CHAT] Message sent:', docRef.id);
            return { id: docRef.id, ...message };
        } catch (error) {
            console.error('❌ [CHAT] Error sending message:', error);
            throw error;
        }
    }

    /**
     * Subscribe to messages in a conversation (real-time)
     */
    static subscribeToMessages(
        conversationId: string,
        callback: (messages: Message[]) => void
    ): Unsubscribe {
        console.log('🔄 [CHAT] Subscribing to messages:', conversationId);

        const q = query(
            collection(db, COLLECTION_CONVERSATIONS, conversationId, COLLECTION_MESSAGES),
            orderBy('createdAt', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            callback(messages);
        });
    }

    /**
     * Update conversation status
     */
    static async updateConversationStatus(
        conversationId: string,
        status: ConversationStatus,
        assignedTo?: string
    ): Promise<void> {
        console.log('🔄 [CHAT] Updating conversation status:', conversationId, status);

        try {
            const convRef = doc(db, COLLECTION_CONVERSATIONS, conversationId);
            const updates: Partial<Conversation> = {
                status,
                updatedAt: new Date().toISOString()
            };
            if (assignedTo) {
                updates.assignedTo = assignedTo;
            }
            await updateDoc(convRef, updates);
            console.log('✅ [CHAT] Conversation status updated');
        } catch (error) {
            console.error('❌ [CHAT] Error updating status:', error);
            throw error;
        }
    }

    /**
     * Assign conversation to admin
     */
    static async assignConversation(conversationId: string, adminId: string): Promise<void> {
        console.log('🔄 [CHAT] Assigning conversation:', conversationId, 'to', adminId);
        return this.updateConversationStatus(conversationId, 'active', adminId);
    }

    /**
     * Close conversation (admin only)
     */
    static async closeConversation(conversationId: string): Promise<void> {
        return this.updateConversationStatus(conversationId, 'closed');
    }

    /**
     * Request human agent
     */
    static async requestHumanAgent(conversationId: string): Promise<void> {
        return this.updateConversationStatus(conversationId, 'waiting');
    }

    /**
     * Get all conversations (admin)
     */
    static async getAllConversations(status?: ConversationStatus): Promise<Conversation[]> {
        console.log('🔄 [CHAT] Fetching all conversations...');

        try {
            let q = query(
                collection(db, COLLECTION_CONVERSATIONS),
                orderBy('updatedAt', 'desc')
            );

            if (status) {
                q = query(
                    collection(db, COLLECTION_CONVERSATIONS),
                    where('status', '==', status),
                    orderBy('updatedAt', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            const conversations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Conversation[];

            console.log('✅ [CHAT] Found', conversations.length, 'conversations');
            return conversations;
        } catch (error) {
            console.error('❌ [CHAT] Error fetching conversations:', error);
            throw error;
        }
    }

    /**
     * Subscribe to all conversations (admin - real-time)
     */
    static subscribeToConversations(
        callback: (conversations: Conversation[]) => void
    ): Unsubscribe {
        console.log('🔄 [CHAT] Subscribing to all conversations');

        const q = query(
            collection(db, COLLECTION_CONVERSATIONS),
            orderBy('updatedAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const conversations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Conversation[];
            callback(conversations);
        });
    }

    /**
     * Mark messages as read
     */
    static async markMessagesAsRead(conversationId: string): Promise<void> {
        console.log('🔄 [CHAT] Marking messages as read:', conversationId);

        try {
            const convRef = doc(db, COLLECTION_CONVERSATIONS, conversationId);
            await updateDoc(convRef, {
                unreadCount: 0
            });
            console.log('✅ [CHAT] Messages marked as read');
        } catch (error) {
            console.error('❌ [CHAT] Error marking as read:', error);
            throw error;
        }
    }
}
