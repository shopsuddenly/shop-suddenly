"use client";

import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { Loader2 } from "lucide-react";

export default function TermsPage() {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('terms');
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
                    <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center text-foreground">Terms of Service</h1>

                    <div className="prose prose-invert max-w-none font-sans text-muted-foreground leading-relaxed space-y-8">
                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">1. Introduction</h3>
                            <p>Welcome to Suddenly. By accessing or using our website, you agree to be bound by these Terms of Service. Please read them carefully.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">2. Intellectual Property</h3>
                            <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of Suddenly and protected by international copyright laws.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">3. Product Information</h3>
                            <p>We make every effort to display as accurately as possible the colors and images of our products. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">4. Limitation of Liability</h3>
                            <p>Suddenly shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or services.</p>
                        </div>

                        <div className="pt-8 border-t border-border">
                            <p className="text-sm">Last Updated: December 2024</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
