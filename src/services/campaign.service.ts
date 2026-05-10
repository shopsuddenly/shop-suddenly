import { collection, getDocs, doc, setDoc, getDoc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_USERS = 'users';
const COLLECTION_CAMPAIGNS = 'email_campaigns';

export interface EmailCampaign {
    id: string;
    subject: string;
    preheader?: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;

    status: 'draft' | 'sending' | 'sent' | 'failed';
    recipientCount: number;
    sentAt?: string;

    // Analytics
    openCount?: number;
    clickCount?: number;

    createdBy: string;
    createdAt: string;
}

export type AudienceSegment = 'all' | 'recent_orders' | 'inactive' | 'new_users' | 'no_orders';

export interface UserEmail {
    id: string;
    email: string;
    displayName: string | null;
    isSubscribed: boolean;
    lastOrderAt?: string;
    orderCount?: number;
    createdAt?: string;
}

export class CampaignService {
    /**
     * Get all users with email addresses (with subscription filter)
     */
    static async getAllUserEmails(includeUnsubscribed: boolean = false): Promise<UserEmail[]> {
        console.log('📧 [CAMPAIGN SERVICE] Fetching all user emails...');

        try {
            const usersRef = collection(db, COLLECTION_USERS);
            const usersSnapshot = await getDocs(usersRef);

            const users: UserEmail[] = [];
            usersSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.email) {
                    const isSubscribed = data.emailSubscribed !== false; // Default to subscribed

                    // Skip unsubscribed unless explicitly included
                    if (!isSubscribed && !includeUnsubscribed) {
                        return;
                    }

                    users.push({
                        id: doc.id,
                        email: data.email,
                        displayName: data.displayName || null,
                        isSubscribed,
                        lastOrderAt: data.lastOrderAt || null,
                        orderCount: data.orderCount || 0,
                        createdAt: data.createdAt instanceof Timestamp
                            ? data.createdAt.toDate().toISOString()
                            : data.createdAt
                    });
                }
            });

            console.log('✅ [CAMPAIGN SERVICE] Found', users.length, 'subscribed users');
            return users;
        } catch (error) {
            console.error('❌ [CAMPAIGN SERVICE] Error fetching user emails:', error);
            throw error;
        }
    }

    /**
     * Get users filtered by audience segment
     */
    static async getUsersBySegment(segment: AudienceSegment): Promise<UserEmail[]> {
        console.log('📧 [CAMPAIGN SERVICE] Fetching users for segment:', segment);

        const allUsers = await this.getAllUserEmails();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        switch (segment) {
            case 'all':
                return allUsers;

            case 'recent_orders':
                // Users who ordered in the last 30 days
                return allUsers.filter(user => {
                    if (!user.lastOrderAt) return false;
                    return new Date(user.lastOrderAt) >= thirtyDaysAgo;
                });

            case 'inactive':
                // Users who haven't ordered in 90+ days
                return allUsers.filter(user => {
                    if (!user.lastOrderAt) return true; // Never ordered
                    return new Date(user.lastOrderAt) < ninetyDaysAgo;
                });

            case 'new_users':
                // Users who registered in the last 30 days
                return allUsers.filter(user => {
                    if (!user.createdAt) return false;
                    return new Date(user.createdAt) >= thirtyDaysAgo;
                });

            case 'no_orders':
                // Users who have never ordered
                return allUsers.filter(user => !user.orderCount || user.orderCount === 0);

            default:
                return allUsers;
        }
    }

    /**
     * Create a new email campaign record
     */
    static async createCampaign(
        campaign: Omit<EmailCampaign, 'id' | 'createdAt'>
    ): Promise<string> {
        console.log('📝 [CAMPAIGN SERVICE] Creating campaign:', campaign.subject);

        try {
            const campaignId = `CAMP-${Date.now()}`;
            const campaignRef = doc(db, COLLECTION_CAMPAIGNS, campaignId);

            await setDoc(campaignRef, {
                ...campaign,
                id: campaignId,
                createdAt: serverTimestamp()
            });

            console.log('✅ [CAMPAIGN SERVICE] Campaign created:', campaignId);
            return campaignId;
        } catch (error) {
            console.error('❌ [CAMPAIGN SERVICE] Error creating campaign:', error);
            throw error;
        }
    }

    /**
     * Update campaign status
     */
    static async updateCampaignStatus(
        campaignId: string,
        status: EmailCampaign['status'],
        recipientCount?: number
    ): Promise<void> {
        console.log('🔄 [CAMPAIGN SERVICE] Updating campaign status:', campaignId, status);

        try {
            const campaignRef = doc(db, COLLECTION_CAMPAIGNS, campaignId);
            const updateData: any = { status };

            if (status === 'sent') {
                updateData.sentAt = new Date().toISOString();
            }
            if (recipientCount !== undefined) {
                updateData.recipientCount = recipientCount;
            }

            await setDoc(campaignRef, updateData, { merge: true });
            console.log('✅ [CAMPAIGN SERVICE] Campaign status updated');
        } catch (error) {
            console.error('❌ [CAMPAIGN SERVICE] Error updating campaign:', error);
            throw error;
        }
    }

    /**
     * Get all campaigns
     */
    static async getAllCampaigns(): Promise<EmailCampaign[]> {
        console.log('📋 [CAMPAIGN SERVICE] Fetching all campaigns...');

        try {
            const campaignsRef = collection(db, COLLECTION_CAMPAIGNS);
            const q = query(campaignsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const campaigns = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate().toISOString()
                        : data.createdAt
                } as EmailCampaign;
            });

            console.log('✅ [CAMPAIGN SERVICE] Retrieved', campaigns.length, 'campaigns');
            return campaigns;
        } catch (error) {
            console.error('❌ [CAMPAIGN SERVICE] Error fetching campaigns:', error);
            throw error;
        }
    }

    /**
     * Get campaign by ID
     */
    static async getCampaignById(campaignId: string): Promise<EmailCampaign | null> {
        console.log('📧 [CAMPAIGN SERVICE] Fetching campaign:', campaignId);

        try {
            const campaignRef = doc(db, COLLECTION_CAMPAIGNS, campaignId);
            const campaignSnap = await getDoc(campaignRef);

            if (!campaignSnap.exists()) {
                console.log('⚠️ [CAMPAIGN SERVICE] Campaign not found');
                return null;
            }

            const data = campaignSnap.data();
            return {
                ...data,
                id: campaignSnap.id,
                createdAt: data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt
            } as EmailCampaign;
        } catch (error) {
            console.error('❌ [CAMPAIGN SERVICE] Error fetching campaign:', error);
            throw error;
        }
    }

    /**
     * Get campaign analytics (opens and clicks)
     */
    static async getCampaignAnalytics(campaignId: string): Promise<{
        opens: Array<{ email: string; openedAt: string; userAgent: string }>;
        clicks: Array<{ email: string; url: string; clickedAt: string; userAgent: string }>;
    }> {
        console.log('📊 [CAMPAIGN SERVICE] Fetching analytics for:', campaignId);

        try {
            // Fetch opens
            const opensRef = collection(db, COLLECTION_CAMPAIGNS, campaignId, 'opens');
            const opensSnapshot = await getDocs(opensRef);
            const opens = opensSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    email: data.email,
                    openedAt: data.openedAt instanceof Timestamp
                        ? data.openedAt.toDate().toISOString()
                        : data.openedAt || '',
                    userAgent: data.userAgent || 'unknown'
                };
            });

            // Fetch clicks
            const clicksRef = collection(db, COLLECTION_CAMPAIGNS, campaignId, 'clicks');
            const clicksSnapshot = await getDocs(clicksRef);
            const clicks = clicksSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    email: data.email,
                    url: data.url || '',
                    clickedAt: data.clickedAt instanceof Timestamp
                        ? data.clickedAt.toDate().toISOString()
                        : data.clickedAt || '',
                    userAgent: data.userAgent || 'unknown'
                };
            });

            console.log('✅ [CAMPAIGN SERVICE] Analytics:', opens.length, 'opens,', clicks.length, 'clicks');
            return { opens, clicks };
        } catch (error) {
            console.error('❌ [CAMPAIGN SERVICE] Error fetching analytics:', error);
            throw error;
        }
    }
}

