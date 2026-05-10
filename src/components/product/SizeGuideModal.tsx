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
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <h2 className="font-serif text-3xl md:text-4xl text-foreground">Size Guide</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : content ? (
                    <div
                        className="prose prose-neutral dark:prose-invert max-w-none font-sans text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                ) : (
                    <div className="space-y-12">
                        <div className="overflow-x-auto">
                            <h3 className="font-serif text-xl mb-4 text-center">Men&apos;s Collection</h3>
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

                        <div className="overflow-x-auto">
                            <h3 className="font-serif text-xl mb-4 text-center">Women&apos;s Collection</h3>
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
                    </div>
                )}
            </div>
        </div>
    );
}
