"use client";

import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { Loader2 } from "lucide-react";

export default function PressPage() {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('press');
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
                    <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center fade-in">{content.title}</h1>
                    <div
                        className="prose prose-neutral dark:prose-invert max-w-none font-sans text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="luxury-container">
                <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center fade-in">In The News</h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group cursor-pointer fade-in">
                            <div className="aspect-video bg-muted mb-6 overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-serif">
                                    Press Image
                                </div>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                            <p className="text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">Vogue • Dec 2024</p>
                            <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                                "Suddenly is redefining what it means to be bold in the digital age."
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
