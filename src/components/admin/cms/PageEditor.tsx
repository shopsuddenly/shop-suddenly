import { useState, useEffect } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const AVAILABLE_PAGES = [
    { id: 'about', label: 'Our Story (About Us)' },
    { id: 'sustainability', label: 'Sustainability' },
    { id: 'careers', label: 'Careers' },
    { id: 'press', label: 'Press' },
    { id: 'shipping', label: 'Shipping & Returns' },
    { id: 'size-guide', label: 'Size Guide' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'cookies', label: 'Cookie Policy' },
];

export function PageEditor() {
    const [selectedPageId, setSelectedPageId] = useState(AVAILABLE_PAGES[0].id);
    const [pageData, setPageData] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPage(selectedPageId);
    }, [selectedPageId]);

    const loadPage = async (slug: string) => {
        setLoading(true);
        try {
            const data = await CMSService.getPage(slug);
            if (data) {
                setPageData(data);
            } else {
                // Initialize empty state if page doesn't exist yet
                setPageData({
                    id: slug,
                    title: AVAILABLE_PAGES.find(p => p.id === slug)?.label || '',
                    content: '',
                    lastUpdated: new Date().toISOString()
                });
            }
        } catch (error) {
            toast.error("Failed to load page content");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!pageData) return;
        setSaving(true);
        try {
            await CMSService.savePage(pageData.id, pageData);
            toast.success("Page saved successfully");
            // Reload to get latest timestamp, etc.
            loadPage(pageData.id);
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="w-full md:w-64">
                    <label className="text-xs uppercase tracking-luxury text-muted-foreground mb-2 block">
                        Select Page
                    </label>
                    <select
                        value={selectedPageId}
                        onChange={(e) => setSelectedPageId(e.target.value)}
                        className="w-full p-2 bg-background border border-border rounded-md focus:border-primary focus:outline-none"
                    >
                        {AVAILABLE_PAGES.map(page => (
                            <option key={page.id} value={page.id}>{page.label}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="btn-luxury flex items-center gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Changes</span>
                </button>
            </div>

            {loading ? (
                <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : pageData ? (
                <div className="space-y-6">
                    <div>
                        <label className="text-xs uppercase tracking-luxury text-muted-foreground mb-2 block">
                            Page Title
                        </label>
                        <input
                            type="text"
                            value={pageData.title}
                            onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                            className="w-full p-3 bg-background border border-border rounded-md focus:border-primary focus:outline-none font-serif text-xl"
                            placeholder="Enter page title"
                        />
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-luxury text-muted-foreground mb-2 block">
                            Content (HTML Supported)
                        </label>
                        <p className="text-xs text-muted-foreground mb-2">
                            You can use basic HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.
                        </p>
                        <textarea
                            value={pageData.content}
                            onChange={(e) => setPageData({ ...pageData, content: e.target.value })}
                            className="w-full h-96 p-4 bg-background border border-border rounded-md focus:border-primary focus:outline-none font-mono text-sm leading-relaxed resize-y"
                            placeholder="To start, try: <p>Write your content here...</p>"
                        />
                    </div>

                    {pageData.lastUpdated && (
                        <p className="text-xs text-muted-foreground text-right">
                            Last updated: {new Date(pageData.lastUpdated).toLocaleString()}
                        </p>
                    )}
                </div>
            ) : null}
        </div>
    );
}
