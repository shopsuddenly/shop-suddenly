"use client";

import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { Loader2 } from "lucide-react";

export default function PrivacyPage() {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('privacy');
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
                        <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center text-foreground">{content.title}</h1>
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
                    <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center text-foreground">Privacy Policy</h1>

                    <div className="prose prose-invert max-w-none font-sans text-muted-foreground leading-relaxed space-y-8">
                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">Our Commitment</h3>
                            <p>At Suddenly, we respect your privacy and are committed to protecting your personal data. This policy outlines how we collect, use, and safeguard your information.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">Information Collection</h3>
                            <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or sign up for our newsletter. This includes name, email, shipping address, and payment details.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">Data Usage</h3>
                            <p>We use your data to process orders, improve our services, and communicate with you about promotions and updates. We do not sell your personal data to third parties.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">Security</h3>
                            <p>We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
