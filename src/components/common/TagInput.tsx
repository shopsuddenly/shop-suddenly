"use client";

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TagInputProps {
    placeholder?: string;
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    className?: string;
}

export function TagInput({ placeholder = "Type and press Enter...", tags, onTagsChange, className }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onTagsChange([...tags, trimmed]);
            setInputValue("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            onTagsChange(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className={cn("flex flex-wrap items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent", className)}>
            {tags.map((tag, index) => (
                <span key={index} className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-md">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag} // Auto-add tag on blur
                placeholder={tags.length === 0 ? placeholder : ""}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-white min-w-[120px]"
            />
        </div>
    );
}
