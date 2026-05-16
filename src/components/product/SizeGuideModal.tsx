"use client";

import { useEffect, useState } from "react";
import { CMSService } from "@/services/cms.service";
import { PageContent } from "@/types/cms";
import { X, Loader2 } from "lucide-react";

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
    const [content, setContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

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
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 p-4 md:p-10 rounded-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6 md:mb-10">
                    <h2 className="font-serif text-3xl md:text-4xl text-foreground">Size Guide</h2>
                    <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded-full opacity-20" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : content ? (
                    <div className="overflow-x-auto pb-4 no-scrollbar">
                        <div
                            className="prose prose-neutral dark:prose-invert max-w-none font-sans text-muted-foreground leading-relaxed size-guide-content"
                            dangerouslySetInnerHTML={{ __html: content.content }}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto no-scrollbar">
                        <div className="text-center mb-6">
                            <h3 className="font-serif text-xl text-foreground">Women&apos;s Collection</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Slim Fit</p>
                        </div>
                        <table className="w-full text-sm font-sans border-collapse">
                            <thead className="bg-secondary/50 text-foreground uppercase tracking-luxury border border-border">
                                <tr>
                                    <th className="p-4 text-left border border-border">Size</th>
                                    <th className="p-4 border border-border text-center">Bust (in)</th>
                                    <th className="p-4 border border-border text-center">Waist (in)</th>
                                    <th className="p-4 border border-border text-center">Hips (in)</th>
                                </tr>
                            </thead>
                            <tbody className="text-muted-foreground">
                                <tr className="border border-border">
                                    <td className="p-4 font-bold text-foreground bg-muted/20 border border-border">XS</td>
                                    <td className="p-4 border border-border text-center">30-32</td>
                                    <td className="p-4 border border-border text-center">24-26</td>
                                    <td className="p-4 border border-border text-center">34-36</td>
                                </tr>
                                <tr className="border border-border">
                                    <td className="p-4 font-bold text-foreground bg-muted/20 border border-border">S</td>
                                    <td className="p-4 border border-border text-center">32-34</td>
                                    <td className="p-4 border border-border text-center">26-28</td>
                                    <td className="p-4 border border-border text-center">36-38</td>
                                </tr>
                                <tr className="border border-border">
                                    <td className="p-4 font-bold text-foreground bg-muted/20 border border-border">M</td>
                                    <td className="p-4 border border-border text-center">34-36</td>
                                    <td className="p-4 border border-border text-center">28-30</td>
                                    <td className="p-4 border border-border text-center">38-40</td>
                                </tr>
                                <tr className="border border-border">
                                    <td className="p-4 font-bold text-foreground bg-muted/20 border border-border">L</td>
                                    <td className="p-4 border border-border text-center">36-38</td>
                                    <td className="p-4 border border-border text-center">30-32</td>
                                    <td className="p-4 border border-border text-center">40-42</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
