"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";

const faqs = [
    {
        q: "How do I track my order?",
        a: "Once your order is shipped, you will receive a confirmation email containing your tracking number. You can also view your order status in your account dashboard."
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and Apple Pay. All transactions are secure and encrypted."
    },
    {
        q: "Do you ship internationally?",
        a: "Yes, we ship to over 50 countries worldwide. International shipping rates vary by location and are calculated at checkout."
    },
    {
        q: "Can I modify my order after placing it?",
        a: "We process orders quickly. If you need to make a change, please contact our concierge team within 1 hour of placing your order."
    },
    {
        q: "How do returning process work?",
        a: "Visit our Returns Center to generate a prepaid label. Drop off the package at any authorized carrier location. Refunds are processed within 5-7 days of receipt."
    }
];

export default function FAQsPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('faqs');
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
                    <div className="max-w-3xl mx-auto">
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
                <div className="max-w-3xl mx-auto">
                    <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center">Frequently Asked Questions</h1>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border border-border bg-card overflow-hidden transition-all duration-300"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between p-6 text-left active:bg-secondary/50 transition-colors"
                                >
                                    <span className={cn(
                                        "font-serif text-lg transition-colors",
                                        openIndex === index ? "text-primary" : "text-foreground"
                                    )}>
                                        {faq.q}
                                    </span>
                                    {openIndex === index ? (
                                        <Minus className="w-5 h-5 text-primary" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </button>

                                <div className={cn(
                                    "px-6 font-sans text-muted-foreground leading-relaxed overflow-hidden transition-all duration-300 ease-in-out",
                                    openIndex === index ? "max-h-48 pb-6 opacity-100" : "max-h-0 opacity-0"
                                )}>
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
