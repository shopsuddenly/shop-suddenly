"use client";

import { useState, useEffect } from "react";
import { CMSService } from "@/services/cms.service";
import { PageSection, SectionType, HomeConfig, CountdownConfig, FooterConfig } from "@/types/cms";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Loader2, Plus, Save } from "lucide-react";
import { CMSEditorItem } from "@/components/admin/cms/CMSEditorItem";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FooterEditor } from "@/components/admin/cms/FooterEditor";
import { PageEditor } from "@/components/admin/cms/PageEditor";
import { DEFAULT_FOOTER_CONFIG } from "@/services/cms.service";
import { v4 as uuidv4 } from "uuid";

export default function CMSPage() {
    const [sections, setSections] = useState<PageSection[]>([]);
    const [countdown, setCountdown] = useState<CountdownConfig>({
        isEnabled: false,
        targetDate: new Date(Date.now() + 86400000).toISOString(),
        title: "Coming Soon",
        subheading: "Get Ready",
        backgroundImage: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
    const [activeTab, setActiveTab] = useState<'content' | 'footer' | 'pages'>('content');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const config = await CMSService.getHomeConfig();
            setSections(config.sections || []);
            if (config.countdown) {
                setCountdown(config.countdown);
            }
            if (config.footer) {
                setFooterConfig(config.footer);
            }
        } catch (error) {
            console.error("Failed to load CMS config", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await CMSService.updateHomeConfig({
                sections,
                countdown,
                footer: footerConfig
            });
            // Show toast success
            alert("Homepage updated successfully!");
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddSection = (type: SectionType) => {
        const newSection: PageSection = createDefaultSection(type);
        setSections([...sections, newSection]);
    };

    const handleUpdateSection = (updatedSection: PageSection) => {
        setSections(sections.map(s => s.id === updatedSection.id ? updatedSection : s));
    };

    const handleDeleteSection = (id: string) => {
        if (confirm("Are you sure you want to delete this section?")) {
            setSections(sections.filter(s => s.id !== id));
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-serif mb-2">Home Page Editor</h1>
                        <p className="text-muted-foreground text-sm">Drag to reorder sections. Changes are live upon save.</p>
                    </div>
                    <div className="flex bg-muted p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                activeTab === 'content' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Content Sections
                        </button>
                        <button
                            onClick={() => setActiveTab('footer')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                activeTab === 'footer' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Footer
                        </button>
                        <button
                            onClick={() => setActiveTab('pages')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                activeTab === 'pages' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Pages
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-luxury flex items-center gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Changes</span>
                </button>
            </div>

            {/* Countdown Settings Panel */}
            <div className="bg-card border border-border p-6 rounded-lg mb-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif">Luxury Launch / Countdown</h2>
                        <p className="text-sm text-muted-foreground">Enable this to replace the landing page with a countdown timer.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={countdown.isEnabled}
                            onCheckedChange={(checked) => setCountdown(prev => ({ ...prev, isEnabled: checked }))}
                        />
                        <Label>Enable Countdown</Label>
                    </div>
                </div>

                {countdown.isEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                        <div className="space-y-2">
                            <Label>Target Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !countdown.targetDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {countdown.targetDate ? format(new Date(countdown.targetDate), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={new Date(countdown.targetDate)}
                                        onSelect={(date) => date && setCountdown(prev => ({ ...prev, targetDate: date.toISOString() }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Background Image</Label>
                            <ImageUpload
                                value={countdown.backgroundImage ? [countdown.backgroundImage] : []}
                                onChange={(urls) => setCountdown(prev => ({ ...prev, backgroundImage: urls[0] || "" }))}
                                maxFiles={1}
                                folder="cms"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={countdown.title}
                                onChange={(e) => setCountdown(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="The Winter Edit"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Subheading</Label>
                            <Input
                                value={countdown.subheading}
                                onChange={(e) => setCountdown(prev => ({ ...prev, subheading: e.target.value }))}
                                placeholder="Coming Soon"
                            />
                        </div>
                    </div>
                )}

                {/* Subscription Settings */}
                {countdown.isEnabled && (
                    <div className="pt-4 border-t border-border animate-in fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-lg">Waitlist / Subscription</h3>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={countdown.showSubscribe}
                                    onCheckedChange={(checked) => setCountdown(prev => ({ ...prev, showSubscribe: checked }))}
                                />
                                <Label>Show Subscribe Card</Label>
                            </div>
                        </div>

                        {countdown.showSubscribe && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Card Title</Label>
                                    <Input
                                        value={countdown.subscribeTitle || ""}
                                        onChange={(e) => setCountdown(prev => ({ ...prev, subscribeTitle: e.target.value }))}
                                        placeholder="Join the Waitlist"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Card Message</Label>
                                    <Input
                                        value={countdown.subscribeMessage || ""}
                                        onChange={(e) => setCountdown(prev => ({ ...prev, subscribeMessage: e.target.value }))}
                                        placeholder="Be the first to know when we launch."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Button Text</Label>
                                    <Input
                                        value={countdown.subscribeButtonText || ""}
                                        onChange={(e) => setCountdown(prev => ({ ...prev, subscribeButtonText: e.target.value }))}
                                        placeholder="Notify Me"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {activeTab === 'content' ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Section List */}
                    <div className="lg:col-span-2 space-y-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={sections.map(s => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {sections.map((section) => (
                                    <CMSEditorItem
                                        key={section.id}
                                        section={section}
                                        onUpdate={handleUpdateSection}
                                        onDelete={handleDeleteSection}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

                        {/* Add Section Button */}
                        <div className="relative group">
                            <button className="w-full py-4 border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" />
                                <span>Add Section</span>
                            </button>
                            {/* Dropdown for types */}
                            <div className="hidden group-hover:block absolute bottom-full left-0 w-full bg-card border border-border shadow-xl p-2 z-10 mb-2">
                                {['HERO', 'BRAND', 'PRODUCT_SLIDER', 'PROMO_BANNER', 'LOOKBOOK', 'MARQUEE'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => handleAddSection(type as SectionType)}
                                        className="w-full text-left px-4 py-2 hover:bg-secondary text-sm"
                                    >
                                        {type.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Tips or Preview (Future) */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border p-6 sticky top-8">
                            <h3 className="font-serif text-lg mb-4">Tips</h3>
                            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                                <li>Use high-resolution images for banners.</li>
                                <li>"Hero" should usually be at the top.</li>
                                <li>You can have multiple "Product Sliders" with different filters.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'footer' ? (
                <div className="max-w-4xl mx-auto pb-20">
                    <div className="bg-card border rounded-lg p-6 space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">Footer Configuration</h2>
                            <p className="text-sm text-muted-foreground">Manage links, newsletter text, and social handles.</p>
                        </div>
                        <FooterEditor config={footerConfig} onChange={setFooterConfig} />
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto pb-20">
                    <div className="bg-card border rounded-lg p-6 space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">Page Content Editor</h2>
                            <p className="text-sm text-muted-foreground">Manage content for static pages like About, Sustainability, etc.</p>
                        </div>
                        <PageEditor />
                    </div>
                </div>
            )}
        </div>
    );
}

function createDefaultSection(type: SectionType): PageSection {
    const id = uuidv4();
    const base = { id, type, isEnabled: true };

    switch (type) {
        case 'HERO': return { ...base, slides: [] } as any;
        case 'BRAND': return { ...base, heading: "New Heading", subheading: "Subheading", description: "Description text..." } as any;
        case 'PRODUCT_SLIDER': return { ...base, title: "New Collection", subtitle: "Subtitle", count: 8, filterType: "NEW_ARRIVALS" } as any;
        case 'PROMO_BANNER': return { ...base, title: "Promo Title", subtitle: "Subtitle", ctaText: "Shop Now", ctaLink: "/shop", image: "", layout: "STANDARD" } as any;
        case 'LOOKBOOK': return { ...base, title: "Lookbook", subtitle: "Instagram Feed", images: ["", "", "", ""] } as any;
        case 'MARQUEE': return { ...base, text: "Scroll text..." } as any;
        default: return base as any;
    }
}
