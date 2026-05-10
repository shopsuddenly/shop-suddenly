"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CampaignService, EmailCampaign } from "@/services/campaign.service";
import { Button } from "@/components/ui/button";
import {
    Loader2, ArrowLeft, Mail, MousePointer, Eye, Users,
    CheckCircle, Clock, XCircle, BarChart3
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Analytics {
    opens: Array<{ email: string; openedAt: string; userAgent: string }>;
    clicks: Array<{ email: string; url: string; clickedAt: string; userAgent: string }>;
}

export default function CampaignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'opens' | 'clicks'>('overview');

    useEffect(() => {
        loadCampaignData();
    }, [campaignId]);

    const loadCampaignData = async () => {
        setLoading(true);
        try {
            const [campaignData, analyticsData] = await Promise.all([
                CampaignService.getCampaignById(campaignId),
                CampaignService.getCampaignAnalytics(campaignId)
            ]);

            if (!campaignData) {
                toast.error("Campaign not found");
                router.push('/admin/marketing');
                return;
            }

            setCampaign(campaignData);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error("Failed to load campaign:", error);
            toast.error("Failed to load campaign data");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400"><CheckCircle className="w-4 h-4" /> Sent</span>;
            case 'sending':
                return <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400"><Clock className="w-4 h-4" /> Sending</span>;
            case 'failed':
                return <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400"><XCircle className="w-4 h-4" /> Failed</span>;
            default:
                return <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground">Draft</span>;
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Campaign not found</p>
            </div>
        );
    }

    const openRate = campaign.recipientCount > 0 && campaign.openCount
        ? Math.round((campaign.openCount / campaign.recipientCount) * 100)
        : 0;
    const clickRate = campaign.recipientCount > 0 && campaign.clickCount
        ? Math.round((campaign.clickCount / campaign.recipientCount) * 100)
        : 0;

    // Get unique opens (dedupe by email)
    const uniqueOpens = analytics?.opens ?
        Array.from(new Map(analytics.opens.map(o => [o.email, o])).values()) : [];
    const uniqueClicks = analytics?.clicks ?
        Array.from(new Map(analytics.clicks.map(c => [c.email, c])).values()) : [];

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Link
                        href="/admin/marketing"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Campaigns</span>
                    </Link>
                    <h1 className="font-serif text-2xl md:text-3xl text-foreground mb-2">{campaign.subject}</h1>
                    <div className="flex items-center gap-4">
                        {getStatusBadge(campaign.status)}
                        <span className="text-sm text-muted-foreground">
                            Sent {formatDate(campaign.sentAt || campaign.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{campaign.recipientCount || 0}</p>
                            <p className="text-sm text-muted-foreground">Recipients</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {uniqueOpens.length}
                                <span className="text-sm font-normal text-muted-foreground ml-2">({openRate}%)</span>
                            </p>
                            <p className="text-sm text-muted-foreground">Unique Opens</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <MousePointer className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {uniqueClicks.length}
                                <span className="text-sm font-normal text-muted-foreground ml-2">({clickRate}%)</span>
                            </p>
                            <p className="text-sm text-muted-foreground">Unique Clicks</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {uniqueOpens.length > 0
                                    ? Math.round((uniqueClicks.length / uniqueOpens.length) * 100)
                                    : 0}%
                            </p>
                            <p className="text-sm text-muted-foreground">Click-to-Open</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'overview'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('opens')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'opens'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Opens ({uniqueOpens.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('clicks')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'clicks'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Clicks ({uniqueClicks.length})
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Email Content</h3>
                                <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-foreground">
                                    {campaign.content}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">CTA Button:</span>
                                    <p className="text-foreground">{campaign.ctaText || 'Shop Now'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">CTA Link:</span>
                                    <p className="text-foreground truncate">{campaign.ctaUrl || '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'opens' && (
                        <div>
                            {uniqueOpens.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No opens recorded yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted border-b border-border">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Opened At</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Device</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {uniqueOpens.map((open, idx) => (
                                                <tr key={idx} className="hover:bg-muted/50">
                                                    <td className="px-4 py-3 text-foreground">{open.email}</td>
                                                    <td className="px-4 py-3 text-muted-foreground text-sm">{formatDate(open.openedAt)}</td>
                                                    <td className="px-4 py-3 text-muted-foreground text-sm truncate max-w-xs">
                                                        {open.userAgent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'clicks' && (
                        <div>
                            {uniqueClicks.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <MousePointer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No clicks recorded yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted border-b border-border">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Clicked At</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Link</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {uniqueClicks.map((click, idx) => (
                                                <tr key={idx} className="hover:bg-muted/50">
                                                    <td className="px-4 py-3 text-foreground">{click.email}</td>
                                                    <td className="px-4 py-3 text-muted-foreground text-sm">{formatDate(click.clickedAt)}</td>
                                                    <td className="px-4 py-3 text-primary text-sm truncate max-w-xs">
                                                        <a href={click.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                            {click.url}
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
