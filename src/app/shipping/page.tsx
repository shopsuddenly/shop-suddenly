"use client";

import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { Loader2 } from "lucide-react";

export default function ShippingPage() {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('shipping');
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
                        <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center">{content.title}</h1>
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
                <div className="max-w-4xl mx-auto">
                    <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center">Shipping & Returns</h1>

                    <div className="space-y-16">
                        <section className="fade-in">
                            <h2 className="font-serif text-2xl mb-6 flex items-center gap-4">
                                <span className="w-8 h-[1px] bg-primary" />
                                Worldwide Shipping
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-card border border-border p-6">
                                    <h3 className="font-sans text-sm uppercase tracking-luxury mb-4 text-foreground">Standard Delivery</h3>
                                    <p className="text-muted-foreground text-sm mb-4">3-5 Business Days</p>
                                    <p className="text-primary font-serif text-xl">Complimentary</p>
                                </div>
                                <div className="bg-card border border-border p-6">
                                    <h3 className="font-sans text-sm uppercase tracking-luxury mb-4 text-foreground">Express Delivery</h3>
                                    <p className="text-muted-foreground text-sm mb-4">1-2 Business Days</p>
                                    <p className="text-primary font-serif text-xl">$25.00</p>
                                </div>
                            </div>
                            <p className="mt-6 text-sm text-muted-foreground font-sans leading-relaxed">
                                All orders are processed within 24 hours. You will receive a tracking link via email once your package has been dispatched.
                            </p>
                        </section>

                        <section className="fade-in">
                            <h2 className="font-serif text-2xl mb-6 flex items-center gap-4">
                                <span className="w-8 h-[1px] bg-primary" />
                                Returns Policy
                            </h2>
                            <div className="prose prose-invert max-w-none text-muted-foreground font-sans">
                                <p className="mb-4">
                                    We accept returns within <span className="text-foreground">30 days</span> of delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached.
                                </p>
                                <ul className="space-y-2 list-disc pl-5">
                                    <li>Refunds are processed to the original payment method.</li>
                                    <li>Return shipping is free for all domestic orders.</li>
                                    <li>Exchanges are subject to stock availability.</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
