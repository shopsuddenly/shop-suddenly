"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";

export default function CareersPage() {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await CMSService.getPage('careers');
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
                        <h1 className="font-serif text-4xl md:text-5xl mb-6">{content.title}</h1>
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
                    <h1 className="font-serif text-4xl md:text-5xl mb-6">
                        Join the <span className="text-gold-gradient">Ambition</span>
                    </h1>
                    <p className="text-muted-foreground font-sans leading-relaxed mb-8">
                        We are always looking for visionary talent to help us shape the future of luxury fashion. If you are passionate, bold, and creative, we want to hear from you.
                    </p>
                    <Link href="/contact" className="btn-luxury inline-flex items-center gap-2">
                        <span>Contact HR</span>
                    </Link>
                </div>

                <div className="space-y-4 max-w-4xl mx-auto fade-in">
                    <h3 className="font-sans text-xs uppercase tracking-luxury text-muted-foreground mb-6">Open Positions</h3>
                    {[
                        { role: "Senior Fashion Designer", dept: "Design", loc: "New York / Remote" },
                        { role: "Brand Marketing Manager", dept: "Marketing", loc: "London" },
                        { role: "Full Stack Developer", dept: "Engineering", loc: "Remote" }
                    ].map((job) => (
                        <div key={job.role} className="group flex items-center justify-between p-6 border border-border bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer">
                            <div>
                                <h4 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{job.role}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{job.dept} • {job.loc}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
