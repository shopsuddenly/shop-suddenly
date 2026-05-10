"use client";

import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { Loader2 } from "lucide-react";

export default function SustainabilityPage() {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('sustainability');
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
                    <div className="max-w-3xl mx-auto text-center mb-16 fade-in">
                        <h1 className="font-serif text-4xl md:text-5xl mb-6 text-foreground">{content.title}</h1>
                        <div
                            className="prose prose-neutral dark:prose-invert max-w-none font-sans text-muted-foreground leading-relaxed text-left"
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
                <div className="max-w-3xl mx-auto text-center mb-16 fade-in">
                    <h1 className="font-serif text-4xl md:text-5xl mb-6 text-foreground">
                        Responsible Luxury
                    </h1>
                    <p className="text-muted-foreground font-sans leading-relaxed">
                        We are committed to minimizing our footprint while maximizing your style. Sustainability isn't just a trend for us; it's a core principle of our design process.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16 fade-in">
                    {[
                        { title: "Ethical Sourcing", desc: "We partner strictly with suppliers who uphold the highest standards of labor rights and environmental protection." },
                        { title: "Eco-Friendly Materials", desc: "From organic cottons to recycled polymers, 80% of our materials are certified sustainable." },
                        { title: "Mindful Packaging", desc: "Our unboxing experience is 100% plastic-free and fully recyclable." }
                    ].map((item) => (
                        <div key={item.title} className="bg-card border border-border p-8 hover:border-primary/50 transition-colors duration-300">
                            <h3 className="font-serif text-xl mb-4 text-foreground">{item.title}</h3>
                            <p className="text-sm text-muted-foreground font-sans leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
