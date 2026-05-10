"use client";

import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { Loader2 } from "lucide-react";

export default function SizeGuidePage() {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('size-guide');
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
                    <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center">{content.title}</h1>
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
                <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center">Size Guide</h1>

                <div className="max-w-4xl mx-auto space-y-16">
                    <section className="fade-in">
                        <h2 className="font-serif text-2xl mb-6 text-center">Men's Collection</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-sans text-left">
                                <thead className="bg-secondary text-foreground uppercase tracking-luxury">
                                    <tr>
                                        <th className="p-4">Size</th>
                                        <th className="p-4">Chest (in)</th>
                                        <th className="p-4">Waist (in)</th>
                                        <th className="p-4">Hips (in)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-muted-foreground">
                                    <tr className="border-b border-border">
                                        <td className="p-4 font-bold text-foreground">S</td>
                                        <td className="p-4">36-38</td>
                                        <td className="p-4">28-30</td>
                                        <td className="p-4">36-38</td>
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-4 font-bold text-foreground">M</td>
                                        <td className="p-4">38-40</td>
                                        <td className="p-4">30-32</td>
                                        <td className="p-4">38-40</td>
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-4 font-bold text-foreground">L</td>
                                        <td className="p-4">40-42</td>
                                        <td className="p-4">32-34</td>
                                        <td className="p-4">40-42</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-foreground">XL</td>
                                        <td className="p-4">42-44</td>
                                        <td className="p-4">34-36</td>
                                        <td className="p-4">42-44</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="fade-in">
                        <h2 className="font-serif text-2xl mb-6 text-center">Women's Collection</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm font-sans text-left">
                                <thead className="bg-secondary text-foreground uppercase tracking-luxury">
                                    <tr>
                                        <th className="p-4">Size</th>
                                        <th className="p-4">Bust (in)</th>
                                        <th className="p-4">Waist (in)</th>
                                        <th className="p-4">Hips (in)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-muted-foreground">
                                    <tr className="border-b border-border">
                                        <td className="p-4 font-bold text-foreground">XS</td>
                                        <td className="p-4">30-32</td>
                                        <td className="p-4">24-26</td>
                                        <td className="p-4">34-36</td>
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-4 font-bold text-foreground">S</td>
                                        <td className="p-4">32-34</td>
                                        <td className="p-4">26-28</td>
                                        <td className="p-4">36-38</td>
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-4 font-bold text-foreground">M</td>
                                        <td className="p-4">34-36</td>
                                        <td className="p-4">28-30</td>
                                        <td className="p-4">38-40</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-foreground">L</td>
                                        <td className="p-4">36-38</td>
                                        <td className="p-4">30-32</td>
                                        <td className="p-4">40-42</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
