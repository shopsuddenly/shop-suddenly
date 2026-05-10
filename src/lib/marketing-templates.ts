// Pre-built Email Templates for Marketing Campaigns

export type TemplateType = 'custom' | 'sale' | 'flash_sale' | 'new_arrival' | 'newsletter' | 'abandoned_cart';

export interface EmailTemplate {
    id: TemplateType;
    name: string;
    description: string;
    defaultSubject: string;
    defaultContent: string;
    defaultCtaText: string;
    defaultCtaUrl: string;
    variables: string[];
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'custom',
        name: 'Custom Email',
        description: 'Write your own custom promotional email',
        defaultSubject: '',
        defaultContent: '',
        defaultCtaText: 'Shop Now',
        defaultCtaUrl: 'https://www.suddenly.com/shop',
        variables: ['name']
    },
    {
        id: 'sale',
        name: 'Sale Announcement',
        description: 'Announce a sale with discount percentage',
        defaultSubject: '🎉 {discount}% OFF - Exclusive Sale Just For You!',
        defaultContent: `We're excited to announce our biggest sale of the season!

For a limited time, enjoy {discount}% OFF on our entire luxury collection. From timeless classics to the latest trends, now is the perfect time to treat yourself.

Use code: {code}

Don't miss out on these incredible savings. Shop now before your favorites sell out!`,
        defaultCtaText: 'Shop The Sale',
        defaultCtaUrl: 'https://www.suddenly.com/shop',
        variables: ['name', 'discount', 'code']
    },
    {
        id: 'flash_sale',
        name: 'Flash Sale (24 Hours)',
        description: 'Urgent flash sale with countdown urgency',
        defaultSubject: '⚡ FLASH SALE - 24 Hours Only! Up to {discount}% OFF',
        defaultContent: `HURRY! This is not a drill!

For the next 24 HOURS ONLY, we're offering an exclusive {discount}% discount on selected items. This is your chance to grab those pieces you've been eyeing at unbelievable prices.

⏰ Sale ends at midnight tonight!

Use code: {code}

Once it's gone, it's gone. Don't let this opportunity slip away!`,
        defaultCtaText: 'Shop Flash Sale',
        defaultCtaUrl: 'https://www.suddenly.com/shop',
        variables: ['name', 'discount', 'code']
    },
    {
        id: 'new_arrival',
        name: 'New Arrivals',
        description: 'Showcase new products in your store',
        defaultSubject: '✨ Just Dropped: New Arrivals You\'ll Love',
        defaultContent: `Something exciting just landed at Suddenly!

We're thrilled to introduce our latest collection, carefully curated for those who appreciate quality and style. Each piece has been handpicked to bring you the finest in luxury fashion.

Be among the first to explore these stunning new additions. Limited quantities available – the best pieces always go fast!`,
        defaultCtaText: 'Explore New Arrivals',
        defaultCtaUrl: 'https://www.suddenly.com/shop?filter=new',
        variables: ['name']
    },
    {
        id: 'newsletter',
        name: 'Monthly Newsletter',
        description: 'Regular newsletter with updates and offers',
        defaultSubject: '💌 Your Monthly Style Update from Suddenly',
        defaultContent: `Hello, fashion lover!

Here's what's been happening at Suddenly this month:

📦 NEW ARRIVALS - Fresh pieces added to our collection
🎨 STYLE TIPS - How to elevate your everyday look
🌟 MEMBER EXCLUSIVE - Special offers just for you

Thank you for being part of our community. We're constantly working to bring you the best in luxury fashion.`,
        defaultCtaText: 'Visit Store',
        defaultCtaUrl: 'https://www.suddenly.com',
        variables: ['name']
    },
    {
        id: 'abandoned_cart',
        name: 'Cart Reminder',
        description: 'Remind customers about items left in cart',
        defaultSubject: '🛒 You left something behind...',
        defaultContent: `We noticed you left some amazing items in your cart!

Those pieces you were eyeing? They're still waiting for you – but they're selling fast!

Complete your order now and enjoy FREE shipping on orders over ₹999.

Don't let someone else snag your favorites!`,
        defaultCtaText: 'Complete Your Order',
        defaultCtaUrl: 'https://www.suddenly.com/cart',
        variables: ['name']
    }
];

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
    text: string,
    variables: Record<string, string>
): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{${key}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: TemplateType): EmailTemplate | undefined {
    return EMAIL_TEMPLATES.find(t => t.id === id);
}
