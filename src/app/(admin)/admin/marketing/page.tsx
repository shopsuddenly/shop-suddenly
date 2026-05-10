"use client";

import { useState, useEffect } from "react";
import { CampaignService, EmailCampaign, UserEmail, AudienceSegment } from "@/services/campaign.service";
import { NotificationService } from "@/services/notification.service";
import { EMAIL_TEMPLATES, TemplateType, replaceTemplateVariables, getTemplateById } from "@/lib/marketing-templates";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Mail, Users, Eye, CheckCircle, XCircle, Clock, FileText, Tag, Zap, Sparkles, Newspaper, ShoppingCart, Filter, Bell } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const TEMPLATE_ICONS: Record<TemplateType, any> = {
    custom: FileText,
    sale: Tag,
    flash_sale: Zap,
    new_arrival: Sparkles,
    newsletter: Newspaper,
    abandoned_cart: ShoppingCart
};

const AUDIENCE_SEGMENTS: { id: AudienceSegment; name: string; description: string }[] = [
    { id: 'all', name: 'All Subscribers', description: 'All subscribed users' },
    { id: 'recent_orders', name: 'Recent Buyers', description: 'Ordered in last 30 days' },
    { id: 'inactive', name: 'Inactive Users', description: 'No orders in 90+ days' },
    { id: 'new_users', name: 'New Users', description: 'Registered in last 30 days' },
    { id: 'no_orders', name: 'Never Ordered', description: 'No purchase history' }
];

export default function MarketingPage() {
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [users, setUsers] = useState<UserEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('custom');
    const [selectedSegment, setSelectedSegment] = useState<AudienceSegment>('all');

    const [formData, setFormData] = useState({
        subject: "",
        content: "",
        ctaText: "Shop Now",
        ctaUrl: "https://www.suddenly.com/shop"
    });

    // Variables for template substitution
    const [variables, setVariables] = useState({
        discount: "50",
        code: "SALE50"
    });

    // Push notification state
    const [pushForm, setPushForm] = useState({
        title: "",
        body: "",
        url: "/shop"
    });
    const [sendingPush, setSendingPush] = useState(false);
    const [pushEnabledUsers, setPushEnabledUsers] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    // Reload users when segment changes
    useEffect(() => {
        loadUsers();
    }, [selectedSegment]);

    // When template changes, pre-fill form
    useEffect(() => {
        const template = getTemplateById(selectedTemplate);
        if (template && selectedTemplate !== 'custom') {
            setFormData({
                subject: template.defaultSubject,
                content: template.defaultContent,
                ctaText: template.defaultCtaText,
                ctaUrl: template.defaultCtaUrl
            });
        }
    }, [selectedTemplate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [campaignsData, usersData, pushUsers] = await Promise.all([
                CampaignService.getAllCampaigns(),
                CampaignService.getUsersBySegment(selectedSegment),
                NotificationService.getUsersWithTokens()
            ]);
            setCampaigns(campaignsData);
            setUsers(usersData);
            setPushEnabledUsers(pushUsers.length);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const usersData = await CampaignService.getUsersBySegment(selectedSegment);
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to load users:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handlePushChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPushForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSendPush = async () => {
        if (!pushForm.title || !pushForm.body) {
            toast.error("Please fill in title and message");
            return;
        }

        if (!confirm(`Send notification to all users?`)) return;

        setSendingPush(true);
        try {
            // Get FCM-enabled users (for push notifications)
            const pushUsers = await NotificationService.getUsersWithTokens();
            const tokens = pushUsers.map(u => u.fcmToken);

            // Get ALL users (for in-app notification center)
            const allUserIds = await NotificationService.getAllUserIds();

            console.log('📱 Push to:', tokens.length, 'devices | 📥 In-app to:', allUserIds.length, 'users');

            const response = await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokens,
                    userIds: allUserIds, // ALL users get in-app notification
                    title: pushForm.title,
                    body: pushForm.body,
                    url: pushForm.url
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Push: ${result.stats.sent} | In-app: ${result.stats.stored} notifications`);
                setPushForm({ title: "", body: "", url: "/shop" });
            } else if (result.skipped) {
                if (result.stored > 0) {
                    toast.success(`Stored ${result.stored} in-app notifications (FCM not configured)`);
                    setPushForm({ title: "", body: "", url: "/shop" });
                } else {
                    toast.error("Firebase Admin SDK not configured. Add FB_SERVICE_ACCOUNT_KEY to env.");
                }
            } else {
                toast.error(result.error || "Failed to send push");
            }
        } catch (error: any) {
            console.error("Push error:", error);
            toast.error("Failed to send push notification");
        } finally {
            setSendingPush(false);
        }
    };

    const handleVariableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVariables(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Get final content with variables replaced
    const getFinalContent = () => {
        return {
            subject: replaceTemplateVariables(formData.subject, { ...variables, name: 'Customer' }),
            content: replaceTemplateVariables(formData.content, { ...variables, name: 'Customer' })
        };
    };

    const handleSendCampaign = async () => {
        const finalContent = getFinalContent();

        if (!finalContent.subject.trim() || !finalContent.content.trim()) {
            toast.error("Please fill in subject and content");
            return;
        }

        if (users.length === 0) {
            toast.error("No users to send to");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to send this email to ${users.length} users?`
        );
        if (!confirmed) return;

        setSending(true);

        try {
            const campaignId = await CampaignService.createCampaign({
                subject: finalContent.subject,
                content: finalContent.content,
                ctaText: formData.ctaText,
                ctaUrl: formData.ctaUrl,
                status: 'sending',
                recipientCount: users.length,
                createdBy: 'admin'
            });

            // Send with variable substitution per-user
            const response = await fetch('/api/send-bulk-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: formData.subject,
                    content: formData.content,
                    ctaText: formData.ctaText,
                    ctaUrl: formData.ctaUrl,
                    variables: variables,
                    recipients: users.map(u => ({ email: u.email, name: u.displayName })),
                    campaignId
                })
            });

            const result = await response.json();

            if (result.success) {
                await CampaignService.updateCampaignStatus(campaignId, 'sent', result.stats.sent);
                toast.success(`Campaign sent! ${result.stats.sent}/${result.stats.total} emails delivered`);
                setFormData({ subject: "", content: "", ctaText: "Shop Now", ctaUrl: "https://www.suddenly.com/shop" });
                setSelectedTemplate('custom');
                loadData();
            } else if (result.skipped) {
                await CampaignService.updateCampaignStatus(campaignId, 'failed');
                toast.error("SMTP not configured. Please set up email credentials.");
            } else {
                await CampaignService.updateCampaignStatus(campaignId, 'failed');
                toast.error(result.error || "Failed to send campaign");
            }
        } catch (error: any) {
            console.error("Send campaign error:", error);
            toast.error("Failed to send campaign");
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = (status: EmailCampaign['status']) => {
        switch (status) {
            case 'sent':
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3" /> Sent</span>;
            case 'sending':
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3" /> Sending</span>;
            case 'failed':
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-500/20 text-red-400"><XCircle className="w-3 h-3" /> Failed</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-muted text-muted-foreground">Draft</span>;
        }
    };

    const currentTemplate = getTemplateById(selectedTemplate);
    const finalContent = getFinalContent();

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="font-serif text-3xl md:text-4xl text-foreground">Email Marketing</h1>
                <p className="text-muted-foreground mt-2">Send promotional emails to your customers</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{users.length}</p>
                            <p className="text-sm text-muted-foreground">Subscribers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
                            <p className="text-sm text-muted-foreground">Campaigns Sent</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Send className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {campaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">Emails Sent</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{pushEnabledUsers}</p>
                            <p className="text-sm text-muted-foreground">Push Enabled</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Push Notification Section */}
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <h2 className="font-serif text-xl text-foreground">Send Push Notification</h2>
                    <span className="text-xs text-muted-foreground">({pushEnabledUsers} users enabled)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={pushForm.title}
                                onChange={handlePushChange}
                                placeholder="Flash Sale Alert!"
                                className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Message</label>
                            <textarea
                                name="body"
                                value={pushForm.body}
                                onChange={handlePushChange}
                                placeholder="50% off everything for the next 24 hours!"
                                rows={3}
                                className="w-full px-4 py-2 rounded border border-border bg-background text-foreground resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Link URL</label>
                            <input
                                type="text"
                                name="url"
                                value={pushForm.url}
                                onChange={handlePushChange}
                                placeholder="/shop"
                                className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
                            />
                        </div>
                        <Button
                            onClick={handleSendPush}
                            disabled={sendingPush || !pushForm.title || !pushForm.body || pushEnabledUsers === 0}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {sendingPush ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Bell className="w-4 h-4 mr-2" />
                            )}
                            Send Push to {pushEnabledUsers} Users
                        </Button>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-3">Preview</p>
                        <div className="bg-background rounded-lg border border-border p-4 shadow-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center shrink-0">
                                    <Bell className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{pushForm.title || "Notification Title"}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{pushForm.body || "Notification message..."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audience Segment Selector */}
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Filter className="w-5 h-5 text-primary" />
                    <h2 className="font-serif text-xl text-foreground">Target Audience</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {AUDIENCE_SEGMENTS.map((segment) => (
                        <button
                            key={segment.id}
                            onClick={() => setSelectedSegment(segment.id)}
                            className={`p-4 rounded-lg border transition-all text-left ${selectedSegment === segment.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                }`}
                        >
                            <p className="text-sm font-medium text-foreground">{segment.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{segment.description}</p>
                            {selectedSegment === segment.id && (
                                <p className="text-xs text-primary mt-2 font-medium">{users.length} users</p>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Selector */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-serif text-xl text-foreground mb-4">Choose a Template</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {EMAIL_TEMPLATES.map((template) => {
                        const Icon = TEMPLATE_ICONS[template.id];
                        return (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                className={`p-4 rounded-lg border transition-all text-left ${selectedTemplate === template.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mb-2 ${selectedTemplate === template.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                <p className="text-sm font-medium text-foreground">{template.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Compose Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    <h2 className="font-serif text-xl text-foreground">Compose Campaign</h2>

                    {/* Variable Inputs - Show only if template has discount/code */}
                    {currentTemplate && currentTemplate.variables.includes('discount') && (
                        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                            <p className="text-sm font-medium text-foreground">Template Variables</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Discount %</label>
                                    <input
                                        name="discount"
                                        value={variables.discount}
                                        onChange={handleVariableChange}
                                        placeholder="50"
                                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Coupon Code</label>
                                    <input
                                        name="code"
                                        value={variables.code}
                                        onChange={handleVariableChange}
                                        placeholder="SALE50"
                                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Subject Line</label>
                        <input
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="e.g. 🎉 Exclusive Sale - 50% Off Everything!"
                            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                        {formData.subject.includes('{') && (
                            <p className="text-xs text-muted-foreground">Preview: {finalContent.subject}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={8}
                            placeholder="Write your promotional message here..."
                            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Button Text</label>
                            <input
                                name="ctaText"
                                value={formData.ctaText}
                                onChange={handleChange}
                                placeholder="Shop Now"
                                className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Button Link</label>
                            <input
                                name="ctaUrl"
                                value={formData.ctaUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex-1"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {showPreview ? 'Hide Preview' : 'Preview'}
                        </Button>
                        <Button
                            onClick={handleSendCampaign}
                            disabled={sending || !formData.subject || !formData.content}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Send to {users.length} Users
                        </Button>
                    </div>
                </div>

                {/* Preview */}
                {showPreview && (
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-serif text-xl text-foreground mb-4">Preview</h2>
                        <div className="bg-white rounded-lg overflow-hidden border max-h-[600px] overflow-y-auto">
                            <div className="bg-black px-6 py-4 text-center">
                                <span className="text-[#C9A55C] text-xl font-bold tracking-wider">SUDDENLY</span>
                            </div>
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-8 text-center">
                                <h3 className="text-[#C9A55C] text-2xl font-light tracking-wide mb-2">
                                    {finalContent.subject || 'Your Subject Line'}
                                </h3>
                                <p className="text-white/70 text-sm">Exclusive for our valued members</p>
                            </div>
                            <div className="p-6 text-center">
                                <p className="text-gray-700 mb-4">Hello Valued Customer,</p>
                                <p className="text-gray-600 whitespace-pre-wrap mb-6 text-left">
                                    {finalContent.content || 'Your email content will appear here...'}
                                </p>
                                <button className="bg-[#C9A55C] text-black px-8 py-3 font-semibold tracking-wider">
                                    {formData.ctaText || 'SHOP NOW'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Campaign History */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="font-serif text-xl text-foreground">Campaign History</h2>
                </div>

                {campaigns.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No campaigns sent yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Recipients</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Opens</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Clicks</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {campaigns.map((campaign) => {
                                    const openRate = campaign.recipientCount > 0 && campaign.openCount
                                        ? Math.round((campaign.openCount / campaign.recipientCount) * 100)
                                        : 0;
                                    const clickRate = campaign.recipientCount > 0 && campaign.clickCount
                                        ? Math.round((campaign.clickCount / campaign.recipientCount) * 100)
                                        : 0;

                                    return (
                                        <tr key={campaign.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/marketing/${campaign.id}`}>
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/marketing/${campaign.id}`} className="text-foreground font-medium hover:text-primary transition-colors">
                                                    {campaign.subject}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(campaign.status)}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {campaign.recipientCount || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground">{campaign.openCount || 0}</span>
                                                    {campaign.status === 'sent' && (
                                                        <span className="text-xs text-muted-foreground">({openRate}%)</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground">{campaign.clickCount || 0}</span>
                                                    {campaign.status === 'sent' && (
                                                        <span className="text-xs text-muted-foreground">({clickRate}%)</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-sm">
                                                {campaign.sentAt
                                                    ? new Date(campaign.sentAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
