"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PageSection } from "@/types/cms";
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
    HeroForm,
    BrandForm,
    CategoryStripForm,
    SliderForm,
    BannerForm,
    LookbookForm,
    MarqueeForm
} from "./CMSForms";

interface Props {
    section: PageSection;
    onUpdate: (section: PageSection) => void;
    onDelete: (id: string) => void;
}

export function CMSEditorItem({ section, onUpdate, onDelete }: Props) {
    const [expanded, setExpanded] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const renderForm = () => {
        switch (section.type) {
            case 'HERO':
                return <HeroForm section={section} onUpdate={onUpdate} />;
            case 'BRAND':
                return <BrandForm section={section} onUpdate={onUpdate} />;
            case 'CATEGORY_STRIP':
                return <CategoryStripForm section={section} onUpdate={onUpdate} />;
            case 'PRODUCT_SLIDER':
                return <SliderForm section={section} onUpdate={onUpdate} />;
            case 'PROMO_BANNER':
                return <BannerForm section={section} onUpdate={onUpdate} />;
            case 'LOOKBOOK':
                return <LookbookForm section={section} onUpdate={onUpdate} />;
            case 'MARQUEE':
                return <MarqueeForm section={section} onUpdate={onUpdate} />;
            default:
                return <div>Unknown Section Type</div>;
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-card border border-border rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-md">
            {/* Header */}
            <div className="flex items-center p-4 gap-4 bg-muted/30">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-muted-foreground hover:text-foreground touch-none"
                    title="Drag to reorder"
                >
                    <GripVertical className="w-5 h-5" />
                </button>

                {/* Title */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm tracking-wide">
                            {section.type.replace('_', ' ')}
                        </span>
                        {!section.isEnabled && (
                            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded">Disabled</span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                        ID: {section.id.split('-')[0]}...
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-2 hover:bg-secondary rounded text-muted-foreground"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => onDelete(section.id)}
                        className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Body */}
            {expanded && (
                <div className="p-6 border-t border-border bg-background animate-slide-down">
                    <div className="mb-6 flex items-center gap-2">
                        <label className="text-xs uppercase tracking-luxury text-muted-foreground">Status</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={section.isEnabled}
                                onChange={(e) => onUpdate({ ...section, isEnabled: e.target.checked })}
                                className="w-4 h-4 accent-primary"
                            />
                            <span className="text-sm">Enabled</span>
                        </div>
                    </div>
                    {renderForm()}
                </div>
            )}
        </div>
    );
}
