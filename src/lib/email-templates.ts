import { Order } from "@/types/order";
import { formatPrice } from "@/lib/utils";

export const generateOrderEmail = (order: Order): string => {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                <div style="display: flex; align-items: center;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 12px;">
                    <div>
                        <p style="margin: 0; font-weight: 500; font-size: 14px;">${item.name}</p>
                        <p style="margin: 0; color: #777; font-size: 12px;">Qty: ${item.quantity} | Size: ${item.variantId || 'Standard'}</p>
                    </div>
                </div>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
                <p style="margin: 0; font-weight: 500; font-size: 14px;">${formatPrice(item.unitPrice * item.quantity)}</p>
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f8f8; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #000; text-decoration: none; }
        .order-info { margin-bottom: 30px; }
        .section-title { font-size: 16px; font-weight: 600; text-transform: uppercase; margin-bottom: 15px; border-bottom: 2px solid #000; display: inline-block; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; }
        .totals { margin-top: 20px; border-top: 2px solid #000; padding-top: 15px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .total-final { font-weight: bold; font-size: 18px; margin-top: 10px; }
        .address { font-size: 14px; line-height: 1.5; color: #555; background: #f9f9f9; padding: 15px; border-radius: 4px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div style="padding: 40px 0;">
        <div class="container">
            <div class="header">
                <a href="https://www.suddenly.com" class="logo">Suddenly</a>
            </div>

            <div class="order-info">
                <h1 style="font-size: 22px; font-weight: 400; margin-bottom: 10px;">Thank you for your order!</h1>
                <p style="color: #666; margin-top: 0;">Order #${order.id}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <div class="section-title">Items</div>
                <table cellpadding="0" cellspacing="0">
                    ${itemsHtml}
                </table>
            </div>

            <div class="totals">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>${formatPrice(order.totals.subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>Shipping</span>
                    <span>${order.totals.shipping === 0 ? "Free" : formatPrice(order.totals.shipping)}</span>
                </div>
                ${order.totals.discountTotal > 0 ? `
                <div class="total-row" style="color: green;">
                    <span>Discount</span>
                    <span>-${formatPrice(order.totals.discountTotal)}</span>
                </div>` : ''}
                <div class="total-row total-final">
                    <span>Total</span>
                    <span>${formatPrice(order.totals.total)}</span>
                </div>
            </div>

            <div style="margin-top: 30px;">
                <div class="section-title">Shipping Address</div>
                <div class="address">
                    <strong>${order.addressSnapshot.name}</strong><br>
                    ${order.addressSnapshot.addressLine1}<br>
                    ${order.addressSnapshot.addressLine2 ? `${order.addressSnapshot.addressLine2}<br>` : ''}
                    ${order.addressSnapshot.city}, ${order.addressSnapshot.state} ${order.addressSnapshot.postalCode}<br>
                    ${order.addressSnapshot.country}<br>
                    Phone: ${order.addressSnapshot.phone}
                </div>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Suddenly. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

export const generateStatusUpdateEmail = (order: Order, status: string): string => {
    let title = '';
    let message = '';
    let color = '#000';

    switch (status) {
        case 'packed':
            title = 'Order Packed';
            message = 'Great news! Your order has been packed and is getting ready for shipment.';
            color = '#2563eb'; // blue
            break;
        case 'shipped':
            title = 'Order Shipped';
            message = `Your order is on the way!${order.trackingNumber ? ` Track it using: ${order.trackingNumber}` : ''}`;
            color = '#d97706'; // amber
            break;
        case 'delivered':
            title = 'Order Delivered';
            message = 'Your order has been delivered. We hope you enjoy your purchase!';
            color = '#16a34a'; // green
            break;
        case 'cancelled':
            title = 'Order Cancelled';
            message = 'Your order has been cancelled.';
            color = '#dc2626'; // red
            break;
        default:
            title = 'Order Update';
            message = `Your order status has been updated to: ${status}`;
    }

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                <p style="margin: 0; font-weight: 500; font-size: 14px;">${item.name}</p>
                <p style="margin: 0; color: #777; font-size: 12px;">Qty: ${item.quantity}</p>
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #000; padding: 30px; text-align: center; }
        .logo { color: #fff; font-size: 24px; font-weight: bold; text-decoration: none; letter-spacing: 2px; }
        .content { padding: 40px 30px; }
        .status-badge { display: inline-block; padding: 8px 16px; background-color: ${color}; color: #fff; border-radius: 4px; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
        .footer { background-color: #f5f5f5; padding: 30px; text-align: center; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div style="padding: 40px 0;">
        <div class="container">
            <div class="header">
                <a href="https://www.suddenly.com" class="logo">Suddenly</a>
            </div>

            <div class="content" style="text-align: center;">
                <div class="status-badge">${title}</div>
                <h1 style="margin: 0 0 10px 0; font-size: 24px;">Hello ${order.addressSnapshot.name.split(' ')[0]},</h1>
                <p style="font-size: 16px; color: #555; margin-bottom: 30px;">${message}</p>
                
                <div style="text-align: left; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                    <h3 style="margin-top: 0;">Order Summary (${order.id})</h3>
                    <table style="width: 100%;">
                        ${itemsHtml}
                    </table>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #777;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.suddenly.com'}/profile" style="color: #000; text-decoration: underline;">View Order Details</a>
                </p>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Suddenly Store. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

export const generateOtpEmail = (otp: string, name: string): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #000; padding: 30px; text-align: center; }
        .logo { color: #fff; font-size: 24px; font-weight: bold; text-decoration: none; letter-spacing: 2px; }
        .content { padding: 40px 30px; text-align: center; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 8px; display: inline-block; color: #000; }
        .footer { background-color: #f5f5f5; padding: 30px; text-align: center; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div style="padding: 40px 0;">
        <div class="container">
            <div class="header">
                <a href="https://www.suddenly.com" class="logo">Suddenly</a>
            </div>

            <div class="content">
                <h1 style="margin: 0 0 10px 0; font-size: 24px;">Verify Your Email</h1>
                <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
                    Hi ${name}, use the code below to complete your registration.
                </p>
                
                <div class="otp-code">${otp}</div>
                
                <p style="font-size: 14px; color: #777; margin-top: 30px;">
                    This code will expire in 10 minutes.<br>
                    If you didn't request this, please ignore this email.
                </p>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Suddenly Store. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

export const generateWelcomeEmail = (name: string): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Playfair Display', 'Times New Roman', serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; }
        .header { background-color: #000; padding: 40px; text-align: center; }
        .logo { color: #fff; font-size: 28px; font-weight: 700; text-decoration: none; letter-spacing: 3px; font-family: 'Helvetica Neue', sans-serif; text-transform: uppercase; }
        .hero { height: 200px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center; text-align: center; background-image: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600'); background-size: cover; background-position: center; }
        .hero-overlay { background: rgba(0,0,0,0.3); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .content { padding: 60px 40px; text-align: center; }
        .welcome-title { font-size: 32px; margin-bottom: 20px; font-weight: 400; color: #000; letter-spacing: 0.5px; }
        .welcome-text { font-size: 16px; color: #555; margin-bottom: 40px; font-family: 'Helvetica Neue', sans-serif; font-weight: 300; line-height: 1.8; }
        .btn { display: inline-block; padding: 15px 40px; background-color: #000; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; border-radius: 0; transition: all 0.3s ease; font-family: 'Helvetica Neue', sans-serif; }
        .btn:hover { background-color: #333; }
        .features { padding: 40px; background: #f9f9f9; text-align: center; display: flex; justify-content: space-between; gap: 20px; }
        .feature-item { flex: 1; }
        .feature-icon { font-size: 24px; margin-bottom: 10px; display: block; }
        .feature-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .footer { background-color: #fff; padding: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eaeaea; }
    </style>
</head>
<body>
    <div style="padding: 40px 0; background-color: #fcfcfc;">
        <div class="container">
            <div class="header">
                <a href="https://www.suddenly.com" class="logo">Suddenly</a>
            </div>

            <div class="hero">
                <div class="hero-overlay">
                    <h2 style="color: #fff; font-size: 24px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Welcome to the Club</h2>
                </div>
            </div>

            <div class="content">
                <h1 class="welcome-title">Hello, ${name}</h1>
                <p class="welcome-text">
                    We are thrilled to welcome you to Suddenly. You have just stepped into a world of curated luxury and timeless style.
                    <br><br>
                    As a member, you now have exclusive access to our new arrivals, private sales, and limited edition collections. We are dedicated to providing you with an exceptional shopping experience.
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.suddenly.com'}/shop" class="btn">Start Exploring</a>
            </div>

            <div class="features">
                <div class="feature-item">
                    <span class="feature-icon">✨</span>
                    <div class="feature-title">Premium Quality</div>
                </div>
                 <div class="feature-item">
                    <span class="feature-icon">🚀</span>
                    <div class="feature-title">Fast Shipping</div>
                </div>
                 <div class="feature-item">
                    <span class="feature-icon">🛡️</span>
                    <div class="feature-title">Secure Checkout</div>
                </div>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Suddenly Store. All rights reserved.</p>
                <p style="margin-top: 10px;">
                    <a href="#" style="color: #999; text-decoration: none; margin: 0 10px;">Instagram</a>
                    <a href="#" style="color: #999; text-decoration: none; margin: 0 10px;">Facebook</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

export const generatePromotionalEmail = (
    subject: string,
    content: string,
    ctaText: string = 'Shop Now',
    ctaUrl: string = 'https://www.suddenly.com/shop',
    recipientName: string = 'Valued Customer',
    tracking?: {
        campaignId: string;
        email: string;
        baseUrl: string;
    }
): string => {
    // Build tracking URLs if tracking info is provided
    const trackingPixel = tracking
        ? `<img src="${tracking.baseUrl}/api/track/open?c=${encodeURIComponent(tracking.campaignId)}&e=${encodeURIComponent(tracking.email)}" width="1" height="1" style="display:none" alt="" />`
        : '';

    const trackedCtaUrl = tracking
        ? `${tracking.baseUrl}/api/track/click?c=${encodeURIComponent(tracking.campaignId)}&e=${encodeURIComponent(tracking.email)}&url=${encodeURIComponent(ctaUrl)}`
        : ctaUrl;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #000; padding: 30px 40px; text-align: center; }
        .logo { color: #C9A55C; font-size: 28px; font-weight: 700; text-decoration: none; letter-spacing: 3px; text-transform: uppercase; }
        .hero { padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); }
        .hero-title { font-size: 32px; font-weight: 300; color: #C9A55C; margin: 0 0 10px 0; letter-spacing: 2px; }
        .hero-subtitle { font-size: 16px; color: #ffffff; opacity: 0.8; margin: 0; letter-spacing: 1px; }
        .content { padding: 50px 40px; text-align: center; }
        .content-text { font-size: 16px; color: #555; line-height: 1.8; margin-bottom: 30px; }
        .btn { display: inline-block; padding: 16px 50px; background-color: #C9A55C; color: #000; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; border-radius: 0; transition: all 0.3s ease; }
        .divider { height: 1px; background: linear-gradient(to right, transparent, #C9A55C, transparent); margin: 40px 0; }
        .features { padding: 40px; background: #fafafa; text-align: center; }
        .feature-row { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
        .feature-item { text-align: center; }
        .feature-icon { font-size: 24px; margin-bottom: 8px; display: block; }
        .feature-text { font-size: 12px; color: #777; text-transform: uppercase; letter-spacing: 1px; }
        .footer { background-color: #000; padding: 40px; text-align: center; }
        .footer-text { font-size: 12px; color: #888; margin: 0 0 15px 0; }
        .social-links { margin-bottom: 15px; }
        .social-links a { color: #C9A55C; text-decoration: none; margin: 0 10px; font-size: 12px; letter-spacing: 1px; }
        .unsubscribe { font-size: 11px; color: #666; }
        .unsubscribe a { color: #666; text-decoration: underline; }
    </style>
</head>
<body>
    <div style="padding: 40px 20px;">
        <div class="container">
            <div class="header">
                <a href="https://www.suddenly.com" class="logo">Suddenly</a>
            </div>

            <div class="hero">
                <h1 class="hero-title">${subject}</h1>
                <p class="hero-subtitle">Exclusive for our valued members</p>
            </div>

            <div class="content">
                <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${recipientName},</p>
                <div class="content-text">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                <div class="divider"></div>
                <a href="${trackedCtaUrl}" class="btn">${ctaText}</a>
            </div>

            <div class="features">
                <div class="feature-row">
                    <div class="feature-item">
                        <span class="feature-icon">✨</span>
                        <span class="feature-text">Premium Quality</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🚚</span>
                        <span class="feature-text">Free Shipping</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">💎</span>
                        <span class="feature-text">Exclusive Access</span>
                    </div>
                </div>
            </div>

            <div class="footer">
                <div class="social-links">
                    <a href="#">Instagram</a>
                    <a href="#">Facebook</a>
                    <a href="#">Twitter</a>
                </div>
                <p class="footer-text">&copy; ${new Date().getFullYear()} Suddenly. All rights reserved.</p>
                <p class="unsubscribe">
                    You're receiving this email because you signed up for Suddenly updates.<br>
                    <a href="https://www.suddenly.com/profile">Manage Preferences</a> | 
                    <a href="${tracking ? `${tracking.baseUrl}/api/unsubscribe?email=${encodeURIComponent(tracking.email)}&token=${Buffer.from(tracking.email).toString('base64')}` : 'https://www.suddenly.com/unsubscribe'}">Unsubscribe</a>
                </p>
                ${trackingPixel}
            </div>
        </div>
    </div>
</body>
</html>
    `;
};


export const generateContactEmail = (name: string, email: string, subject: string, message: string): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #ddd; }
        .header { background-color: #000; color: #fff; padding: 15px; text-align: center; font-weight: bold; }
        .content { padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; font-size: 13px; color: #666; text-transform: uppercase; }
        .value { background: #f9f9f9; padding: 10px; border-radius: 4px; border: 1px solid #eee; margin-top: 5px; }
        .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">New Contact Form Message</div>
        <div class="content">
            <div class="field">
                <div class="label">From</div>
                <div class="value"><strong>${name}</strong> (${email})</div>
            </div>
            <div class="field">
                <div class="label">Subject</div>
                <div class="value">${subject}</div>
            </div>
            <div class="field">
                <div class="label">Message</div>
                <div class="value" style="white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
        </div>
        <div class="footer">
            Received from Suddenly Website
        </div>
    </div>
</body>
</html>
    `;
};
