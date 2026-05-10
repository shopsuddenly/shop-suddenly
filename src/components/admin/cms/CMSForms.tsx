"use client";

import {
    PageSection,
    HeroSection,
    BrandSection,
    CategoryStripSection,
    ProductSliderSection,
    PromoBannerSection,
    LookbookSection,
    MarqueeSection
} from "@/types/cms";
import { Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MediaUpload } from "@/components/admin/MediaUpload";

// Reusable Input
function Input({ label, value, onChange, ...props }: any) {
    return (
        <div className="space-y-1">
            <label className="text-xs uppercase tracking-luxury text-muted-foreground">{label}</label>
            <input
                className="w-full bg-transparent border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors rounded-sm"
                value={value}
                onChange={onChange}
                {...props}
            />
        </div>
    );
}

// Reusable Select
function Select({ label, value, onChange, options }: any) {
    return (
        <div className="space-y-1">
            <label className="text-xs uppercase tracking-luxury text-muted-foreground">{label}</label>
            <select
                className="w-full bg-card border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors rounded-sm"
                value={value}
                onChange={onChange}
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

// --- Specific Forms ---

export function CategoryStripForm({ section, onUpdate }: { section: CategoryStripSection, onUpdate: (s: PageSection) => void }) {
    // Default categories if none exist
    const categories = section.categories || [
        { name: "Men", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80", link: "/shop?category=men" },
        { name: "Women", image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80", link: "/shop?category=women" },
        { name: "Essentials", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80", link: "/shop?category=essentials" },
        { name: "Winter", image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80", link: "/shop?filter=winter" },
        { name: "Streetwear", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80", link: "/shop?category=streetwear" }
    ];

    const updateCategory = (index: number, field: string, value: string) => {
        const newCats = [...categories];
        newCats[index] = { ...newCats[index], [field]: value };
        onUpdate({ ...section, categories: newCats });
    };

    const addCategory = () => {
        const newCat = { name: "New Category", image: "", link: "/shop" };
        onUpdate({ ...section, categories: [...categories, newCat] });
    };

    const removeCategory = (index: number) => {
        const newCats = categories.filter((_, i) => i !== index);
        onUpdate({ ...section, categories: newCats });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {categories.map((cat, index) => (
                    <div key={index} className="border border-border p-4 rounded bg-secondary/10 relative group">
                        <button
                            onClick={() => removeCategory(index)}
                            className="absolute top-2 right-2 p-1 bg-background hover:bg-red-500 hover:text-white rounded-full transition-colors z-10"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <h4 className="text-sm font-bold mb-4">Category {index + 1}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input label="Name" value={cat.name} onChange={(e: any) => updateCategory(index, 'name', e.target.value)} />
                            <Input label="Link" value={cat.link} onChange={(e: any) => updateCategory(index, 'link', e.target.value)} />
                            <div className="md:col-span-2">
                                <label className="text-xs uppercase tracking-luxury text-muted-foreground mb-2 block">Category Image</label>
                                <ImageUpload
                                    value={cat.image ? [cat.image] : []}
                                    onChange={(urls) => updateCategory(index, 'image', urls[0] || "")}
                                    maxFiles={1}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={addCategory}
                className="w-full py-2 border border-dashed border-border text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Category
            </button>
        </div>
    );
}


export function HeroForm({ section, onUpdate }: { section: HeroSection, onUpdate: (s: PageSection) => void }) {
    const addSlide = () => {
        const newSlide = {
            id: uuidv4(),
            image: "",
            title: "New Slide",
            subtitle: "Subtitle",
            ctaText: "Shop Now",
            ctaLink: "/shop"
        };
        onUpdate({ ...section, slides: [...section.slides, newSlide] });
    };

    const updateSlide = (index: number, field: string, value: string) => {
        const newSlides = [...section.slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        onUpdate({ ...section, slides: newSlides });
    };

    const removeSlide = (index: number) => {
        const newSlides = section.slides.filter((_, i) => i !== index);
        onUpdate({ ...section, slides: newSlides });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {section.slides.map((slide, index) => (
                    <div key={slide.id} className="border border-border p-4 rounded bg-secondary/10 relative group">
                        <button
                            onClick={() => removeSlide(index)}
                            className="absolute top-2 right-2 p-1 bg-background hover:bg-red-500 hover:text-white rounded-full transition-colors z-10"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <h4 className="text-sm font-bold mb-4">Slide {index + 1}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Select
                                    label="Media Type"
                                    value={slide.type || 'image'}
                                    onChange={(e: any) => updateSlide(index, 'type', e.target.value)}
                                    options={[
                                        { label: "Image", value: "image" },
                                        { label: "Video", value: "video" }
                                    ]}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs uppercase tracking-luxury text-muted-foreground mb-2 block">
                                    {slide.type === 'video' ? 'Hero Video' : 'Hero Image'}
                                </label>
                                {slide.type === 'video' ? (
                                    <MediaUpload
                                        value={slide.videoUrl ? [slide.videoUrl] : []}
                                        onChange={(urls) => updateSlide(index, 'videoUrl', urls[0] || "")}
                                        maxFiles={1}
                                        fileType="video"
                                        folder="hero-videos"
                                    />
                                ) : (
                                    <MediaUpload
                                        value={slide.image ? [slide.image] : []}
                                        onChange={(urls) => updateSlide(index, 'image', urls[0] || "")}
                                        maxFiles={1}
                                        fileType="image"
                                        folder="hero-images"
                                    />
                                )}
                            </div>
                            <Input label="Title" value={slide.title} onChange={(e: any) => updateSlide(index, 'title', e.target.value)} />
                            <Input label="Subtitle" value={slide.subtitle} onChange={(e: any) => updateSlide(index, 'subtitle', e.target.value)} />
                            <div className="grid grid-cols-2 gap-2">
                                <Input label="CTA Text" value={slide.ctaText} onChange={(e: any) => updateSlide(index, 'ctaText', e.target.value)} />
                                <Input label="CTA Link" value={slide.ctaLink} onChange={(e: any) => updateSlide(index, 'ctaLink', e.target.value)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={addSlide}
                className="w-full py-2 border border-dashed border-border text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Slide
            </button>
        </div>
    );
}

export function BrandForm({ section, onUpdate }: { section: BrandSection, onUpdate: (s: PageSection) => void }) {
    return (
        <div className="space-y-4">
            <Input label="Heading" value={section.heading} onChange={(e: any) => onUpdate({ ...section, heading: e.target.value })} />
            <Input label="Highlighted Subheading" value={section.subheading} onChange={(e: any) => onUpdate({ ...section, subheading: e.target.value })} />
            <div className="space-y-1">
                <label className="text-xs uppercase tracking-luxury text-muted-foreground">Description</label>
                <textarea
                    className="w-full bg-transparent border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors rounded-sm"
                    rows={4}
                    value={section.description}
                    onChange={(e) => onUpdate({ ...section, description: e.target.value })}
                />
            </div>
        </div>
    );
}

export function SliderForm({ section, onUpdate }: { section: ProductSliderSection, onUpdate: (s: PageSection) => void }) {
    return (
        <div className="space-y-4">
            <Input label="Section Title" value={section.title} onChange={(e: any) => onUpdate({ ...section, title: e.target.value })} />
            <Input label="Subtitle" value={section.subtitle} onChange={(e: any) => onUpdate({ ...section, subtitle: e.target.value })} />

            <div className="grid grid-cols-2 gap-4">
                <Input type="number" label="Max Items" value={section.count} onChange={(e: any) => onUpdate({ ...section, count: parseInt(e.target.value) })} />
                <Select
                    label="Filter By"
                    value={section.filterType}
                    onChange={(e: any) => onUpdate({ ...section, filterType: e.target.value })}
                    options={[
                        { label: "New Arrivals", value: "NEW_ARRIVALS" },
                        { label: "Streetwear", value: "STREETWEAR" },
                        { label: "Winter Collection", value: "WINTER" },
                        { label: "Essentials", value: "ESSENTIALS" },
                    ]}
                />
            </div>
        </div>
    );
}

export function BannerForm({ section, onUpdate }: { section: PromoBannerSection, onUpdate: (s: PageSection) => void }) {
    return (
        <div className="space-y-4">
            <Input label="Section Title" value={section.title} onChange={(e: any) => onUpdate({ ...section, title: e.target.value })} />
            <Input label="Subtitle" value={section.subtitle} onChange={(e: any) => onUpdate({ ...section, subtitle: e.target.value })} />
            <div>
                <label className="text-xs uppercase tracking-luxury text-muted-foreground mb-2 block">Banner Image</label>
                <ImageUpload
                    value={section.image ? [section.image] : []}
                    onChange={(urls) => onUpdate({ ...section, image: urls[0] || "" })}
                    maxFiles={1}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input label="CTA Text" value={section.ctaText} onChange={(e: any) => onUpdate({ ...section, ctaText: e.target.value })} />
                <Input label="CTA Link" value={section.ctaLink} onChange={(e: any) => onUpdate({ ...section, ctaLink: e.target.value })} />
            </div>

            <Select
                label="Layout Style"
                value={section.layout}
                onChange={(e: any) => onUpdate({ ...section, layout: e.target.value })}
                options={[
                    { label: "Standard (Text Left)", value: "STANDARD" },
                    { label: "Reverse (Text Right)", value: "REVERSE" },
                ]}
            />
        </div>
    );
}

export function LookbookForm({ section, onUpdate }: { section: LookbookSection, onUpdate: (s: PageSection) => void }) {
    const updateImage = (index: number, val: string) => {
        const newImages = [...section.images];
        newImages[index] = val;
        onUpdate({ ...section, images: newImages });
    };

    return (
        <div className="space-y-4">
            <Input label="Section Title" value={section.title} onChange={(e: any) => onUpdate({ ...section, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
                {section.images.map((img, i) => (
                    <div key={i} className="space-y-2">
                        <label className="text-xs uppercase tracking-luxury text-muted-foreground">Image {i + 1}</label>
                        <ImageUpload
                            value={img ? [img] : []}
                            onChange={(urls) => updateImage(i, urls[0] || "")}
                            maxFiles={1}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MarqueeForm({ section, onUpdate }: { section: MarqueeSection, onUpdate: (s: PageSection) => void }) {
    return (
        <div className="space-y-4">
            <Input label="Marquee Text" value={section.text} onChange={(e: any) => onUpdate({ ...section, text: e.target.value })} />
        </div>
    );
}
