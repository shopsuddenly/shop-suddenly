import { ChatService } from './chat.service';
import { OrderService } from './order.service';
import { formatDistanceToNow } from 'date-fns';

type BotIntent =
    | 'greeting'
    | 'order_status'
    | 'return_request'
    | 'payment_issue'
    | 'human_agent'
    | 'unknown';

interface BotResponse {
    content: string;
    type: 'text' | 'quick_reply' | 'order_card';
    metadata?: any;
}

export class BotService {
    private static intents: Record<BotIntent, RegExp[]> = {
        greeting: [/hi/i, /hello/i, /hey/i, /start/i],
        order_status: [/where.*order/i, /track.*order/i, /status/i, /shipping/i, /delivery/i],
        return_request: [/return/i, /refund/i, /exchange/i, /replace/i],
        payment_issue: [/payment/i, /card/i, /failed/i, /transaction/i],
        human_agent: [/human/i, /agent/i, /person/i, /support/i, /talk/i],
        unknown: []
    };

    /**
     * Detect intent from user message
     */
    static detectIntent(message: string): BotIntent {
        for (const [intent, patterns] of Object.entries(this.intents)) {
            if (patterns.some(pattern => pattern.test(message))) {
                return intent as BotIntent;
            }
        }
        return 'unknown';
    }

    /**
     * Generate response based on intent and user context
     */
    static async generateResponse(
        userId: string,
        message: string,
        conversationId: string
    ): Promise<BotResponse[]> {
        const intent = this.detectIntent(message);
        const responses: BotResponse[] = [];

        console.log(`🤖 [BOT] Detected intent: ${intent} for user: ${userId}`);

        switch (intent) {
            case 'greeting':
                responses.push({
                    content: "Hi there! 👋 I'm your support assistant. How can I help you today?",
                    type: 'text'
                });
                responses.push({
                    content: 'Choose an option below:',
                    type: 'quick_reply',
                    metadata: {
                        quickReplies: ['Where is my order?', 'I want to return', 'Talk to Agent']
                    }
                });
                break;

            case 'order_status':
                try {
                    // Fetch user's recent orders
                    const orders = await OrderService.getUserOrders(userId);
                    const lastOrder = orders[0];

                    if (lastOrder) {
                        const status = lastOrder.orderStatus.toUpperCase();
                        responses.push({
                            content: `I found your most recent order #${lastOrder.id.slice(-8)}.`,
                            type: 'text'
                        });
                        responses.push({
                            content: 'Order Details',
                            type: 'order_card',
                            metadata: {
                                orderId: lastOrder.id,
                                status: lastOrder.orderStatus,
                                total: lastOrder.totals.total,
                                items: lastOrder.items.slice(0, 2), // Show first 2 items
                                itemCount: lastOrder.items.length
                            }
                        });

                        if (status === 'DELIVERED') {
                            responses.push({
                                content: "It looks like this order was delivered. Do you need help with a return?",
                                type: 'quick_reply',
                                metadata: { quickReplies: ['Return Item', 'No, thanks'] }
                            });
                        } else {
                            responses.push({
                                content: `Your order is currently **${status}**. Is there anything else you need?`,
                                type: 'quick_reply',
                                metadata: { quickReplies: ['Talk to Agent', 'No, thanks'] }
                            });
                        }
                    } else {
                        responses.push({
                            content: "I couldn't find any recent orders linked to your account. Would you like to connect with a human agent for help?",
                            type: 'quick_reply',
                            metadata: { quickReplies: ['Talk to Agent', 'No, thanks'] }
                        });
                    }
                } catch (error) {
                    console.error('Error fetching orders for bot:', error);
                    responses.push({
                        content: "I'm having trouble fetching your order details right now.",
                        type: 'text'
                    });
                }
                break;

            case 'return_request':
                responses.push({
                    content: "To initiate a return, go to your **Orders** page, select the order, and click **'Request Return'** if it's within the 3-day window.",
                    type: 'text'
                });
                responses.push({
                    content: "Do you need help with a specific order?",
                    type: 'quick_reply',
                    metadata: { quickReplies: ['Show my orders', 'Talk to Agent'] }
                });
                break;

            case 'payment_issue':
                responses.push({
                    content: "For payment issues, please ensure your card has sufficient funds and the details are correct. If the issue persists, try a different payment method.",
                    type: 'text'
                });
                responses.push({
                    content: "Would you like to speak to a support agent about this?",
                    type: 'quick_reply',
                    metadata: { quickReplies: ['Yes, connect me', 'No, I\'ll retry'] }
                });
                break;

            case 'human_agent':
                await ChatService.requestHumanAgent(conversationId);
                responses.push({
                    content: "I've connected you to our live support queue. An agent will be with you shortly! 👨‍💻",
                    type: 'text'
                });
                break;

            case 'unknown':
                responses.push({
                    content: "I'm not sure I understand. Here are some things I can help with:",
                    type: 'quick_reply',
                    metadata: {
                        quickReplies: ['Track Order', 'Return Policy', 'Talk to Agent']
                    }
                });
                break;
        }

        return responses;
    }

    /**
     * Handle incoming user message and send bot response
     */
    static async handleIncomingMessage(
        userId: string,
        message: string,
        conversationId: string
    ) {
        // Simulate "typing" delay
        setTimeout(async () => {
            const responses = await this.generateResponse(userId, message, conversationId);

            for (const response of responses) {
                await ChatService.sendMessage(
                    conversationId,
                    'bot',
                    'Support Bot',
                    'bot',
                    response.content,
                    response.type,
                    response.metadata
                );
            }
        }, 1000);
    }
}
