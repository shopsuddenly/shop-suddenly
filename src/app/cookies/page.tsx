"use client";

import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { Loader2 } from "lucide-react";

export default function CookiesPage() {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('cookies');
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
                    <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center text-foreground">Cookie Policy</h1>

                    <div className="prose prose-invert max-w-none font-sans text-muted-foreground leading-relaxed space-y-8">
                        <p className="text-lg">This Cookie Policy explains how Suddenly uses cookies and similar technologies to recognize you when you visit our website.</p>

                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">What are Cookies?</h3>
                            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide reporting information.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">How We Use Cookies</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., shopping cart and login).</li>
                                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site.</li>
                                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements to you.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-serif text-foreground mb-4">Your Choices</h3>
                            <p>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
