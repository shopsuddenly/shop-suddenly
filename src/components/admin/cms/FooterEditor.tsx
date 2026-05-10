"use client";

import { FooterConfig, FooterColumn, FooterLink } from "@/types/cms";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, LayoutGrid, Type, Link as LinkIcon, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface FooterEditorProps {
    config: FooterConfig;
    onChange: (config: FooterConfig) => void;
}

export function FooterEditor({ config, onChange }: FooterEditorProps) {

    // --- Newsletter Helpers ---
    const updateNewsletter = (key: keyof FooterConfig['newsletter'], value: string) => {
        onChange({
            ...config,
            newsletter: { ...config.newsletter, [key]: value }
        });
    };

    // --- Brand Column Helpers ---
    const updateBrand = (key: keyof FooterConfig['brandColumn'], value: any) => {
        onChange({
            ...config,
            brandColumn: { ...config.brandColumn, [key]: value }
        });
    };

    const updateSocial = (index: number, url: string) => {
        const newSocials = [...config.brandColumn.socials];
        newSocials[index] = { ...newSocials[index], url };
        updateBrand('socials', newSocials);
    };

    // --- Link Columns Helpers ---
    const updateColumnTitle = (colIndex: number, title: string) => {
        const newCols = [...config.linkColumns];
        newCols[colIndex] = { ...newCols[colIndex], title };
        onChange({ ...config, linkColumns: newCols });
    };

    const addLink = (colIndex: number) => {
        const newCols = [...config.linkColumns];
        newCols[colIndex].links.push({ label: "New Link", url: "/" });
        onChange({ ...config, linkColumns: newCols });
    };

    const removeLink = (colIndex: number, linkIndex: number) => {
        const newCols = [...config.linkColumns];
        newCols[colIndex].links.splice(linkIndex, 1);
        onChange({ ...config, linkColumns: newCols });
    };

    const updateLink = (colIndex: number, linkIndex: number, key: keyof FooterLink, value: string) => {
        const newCols = [...config.linkColumns];
        newCols[colIndex].links[linkIndex] = { ...newCols[colIndex].links[linkIndex], [key]: value };
        onChange({ ...config, linkColumns: newCols });
    };

    return (
        <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
                {/* Newsletter Section */}
                <AccordionItem value="newsletter">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline px-4 bg-accent/20 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-primary" />
                            Newsletter Section
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 border border-t-0 rounded-b-lg">
                        <div className="space-y-2">
                            <Label>Heading</Label>
                            <Input
                                value={config.newsletter.heading}
                                onChange={(e) => updateNewsletter('heading', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subheading</Label>
                            <Textarea
                                value={config.newsletter.subheading}
                                onChange={(e) => updateNewsletter('subheading', e.target.value)}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Brand Info */}
                <AccordionItem value="brand">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline px-4 bg-accent/20 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Type className="w-5 h-5 text-primary" />
                            Brand Information
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 border border-t-0 rounded-b-lg">
                        <div className="space-y-2">
                            <Label>Heading</Label>
                            <Input
                                value={config.brandColumn.heading}
                                onChange={(e) => updateBrand('heading', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={config.brandColumn.description}
                                onChange={(e) => updateBrand('description', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Social Links</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {config.brandColumn.socials.map((social, idx) => (
                                    <div key={social.platform} className="space-y-1">
                                        <Label className="capitalize text-xs text-muted-foreground flex items-center gap-1">
                                            {social.platform === 'instagram' && <Instagram className="w-3 h-3" />}
                                            {social.platform === 'twitter' && <Twitter className="w-3 h-3" />}
                                            {social.platform === 'facebook' && <Facebook className="w-3 h-3" />}
                                            {social.platform === 'youtube' && <Youtube className="w-3 h-3" />}
                                            {social.platform}
                                        </Label>
                                        <Input
                                            value={social.url}
                                            onChange={(e) => updateSocial(idx, e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Link Columns */}
                {config.linkColumns.map((col, colIndex) => (
                    <AccordionItem key={col.id} value={`col-${col.id}`}>
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline px-4 bg-accent/20 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-primary" />
                                {col.title} Links
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 space-y-4 border border-t-0 rounded-b-lg">
                            <div className="space-y-2">
                                <Label>Column Title</Label>
                                <Input
                                    value={col.title}
                                    onChange={(e) => updateColumnTitle(colIndex, e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Links</Label>
                                <div className="space-y-2">
                                    {col.links.map((link, linkIndex) => (
                                        <div key={linkIndex} className="flex gap-2 items-center">
                                            <Input
                                                value={link.label}
                                                onChange={(e) => updateLink(colIndex, linkIndex, 'label', e.target.value)}
                                                placeholder="Label"
                                                className="flex-1"
                                            />
                                            <Input
                                                value={link.url}
                                                onChange={(e) => updateLink(colIndex, linkIndex, 'url', e.target.value)}
                                                placeholder="URL"
                                                className="flex-1"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => removeLink(colIndex, linkIndex)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-dashed"
                                    onClick={() => addLink(colIndex)}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Link
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}

                {/* Copyright */}
                <AccordionItem value="bottom">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline px-4 bg-accent/20 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Type className="w-5 h-5 text-primary" />
                            Bottom Bar
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 border border-t-0 rounded-b-lg">
                        <div className="space-y-2">
                            <Label>Copyright Text</Label>
                            <Input
                                value={config.bottomBar.copyrightText}
                                onChange={(e) => onChange({
                                    ...config,
                                    bottomBar: { ...config.bottomBar, copyrightText: e.target.value }
                                })}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    );
}
