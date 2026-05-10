"use client";

import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { Loader2 } from "lucide-react";

export default function AboutPage() {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('about');
                if (data) setContent(data);
            } catch (error) {
                console.error("Failed to load page content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (content) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12">
                <div className="luxury-container">
                    <div className="max-w-4xl mx-auto fade-in">
                        <h1 className="font-serif text-4xl md:text-6xl mb-8 text-gold-gradient text-center">
                            {content.title}
                        </h1>
                        <div
                            className="prose prose-neutral dark:prose-invert max-w-none font-sans text-muted-foreground leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: content.content }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="luxury-container">
                <div className="max-w-4xl mx-auto text-center fade-in">
                    <h1 className="font-serif text-4xl md:text-6xl mb-8 text-gold-gradient">
                        Our Story
                    </h1>
                    <p className="text-xl md:text-2xl font-serif text-foreground/80 mb-12 leading-relaxed">
                        "Effortlessly Bold. Made for those who stand still yet stand out."
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-24 fade-in">
                    <div className="aspect-[4/5] bg-muted relative overflow-hidden group">
                        {/* Placeholder for brand image */}
                        <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-transparent transition-colors duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-serif text-4xl">
                            Image
                        </div>
                    </div>
                    <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
                        <p>
                            Founded in 2024, Suddenly emerged from a desire to redefine luxury for the modern era. We believe that true style shouldn't be complicated. It should be intuitive, commanding, and accessible.
                        </p>
                        <p>
                            Our collections are crafted with meticulous attention to detail, sourcing the finest materials from around the globe. Each piece is designed not just to be worn, but to be experienced.
                        </p>
                        <p>
                            We are more than just a brand; we are a movement of individuals who appreciate the finer things in life without the pretense.
                        </p>
                    </div>
                </div>

                <div className="border-t border-border pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center fade-in">
                    <div>
                        <h3 className="font-serif text-4xl mb-2">2024</h3>
                        <p className="text-sm font-sans uppercase tracking-luxury text-muted-foreground">Established</p>
                    </div>
                    <div>
                        <h3 className="font-serif text-4xl mb-2">100+</h3>
                        <p className="text-sm font-sans uppercase tracking-luxury text-muted-foreground">Artisans</p>
                    </div>
                    <div>
                        <h3 className="font-serif text-4xl mb-2">Global</h3>
                        <p className="text-sm font-sans uppercase tracking-luxury text-muted-foreground">Presence</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
