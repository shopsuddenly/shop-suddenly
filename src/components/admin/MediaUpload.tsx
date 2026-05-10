"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImagePlus, Video as VideoIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StorageService } from "@/services/storage.service";

interface MediaUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    disabled?: boolean;
    maxFiles?: number;
    folder?: string;
    fileType?: "image" | "video";
}

export function MediaUpload({ value = [], onChange, disabled, maxFiles = 1, folder = "uploads", fileType = "image" }: MediaUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const downloadUrl = await StorageService.uploadFile(file, folder);

            // Append new URL to existing array
            onChange([...value, downloadUrl]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = (urlToRemove: string) => {
        onChange(value.filter((url) => url !== urlToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {/* Existing Media */}
                {value.filter(url => url && url.length > 0).map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden bg-slate-900 border border-slate-800 group">
                        <div className="absolute top-2 right-2 z-10">
                            <button
                                type="button"
                                onClick={() => handleRemove(url)}
                                className="bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {fileType === 'video' ? (
                            <video
                                src={url}
                                className="w-full h-full object-cover"
                                controls
                            />
                        ) : (
                            <Image
                                src={url}
                                alt="Uploaded Media"
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                ))}

                {/* Upload Button */}
                {(!maxFiles || value.length < maxFiles) && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "w-[200px] h-[200px] rounded-md border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center cursor-pointer gap-2 text-slate-400 hover:text-white",
                            disabled && "opacity-50 cursor-not-allowed",
                            isUploading && "pointer-events-none opacity-50"
                        )}
                    >
                        <input
                            type="file"
                            className="hidden"
                            accept={fileType === 'video' ? "video/*" : "image/*"}
                            ref={fileInputRef}
                            onChange={handleUpload}
                            disabled={disabled || isUploading}
                        />
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            fileType === 'video' ? <VideoIcon className="w-6 h-6" /> : <ImagePlus className="w-6 h-6" />
                        )}
                        <span className="text-sm font-medium">
                            {isUploading ? "Uploading..." : `Upload ${fileType === 'video' ? 'Video' : 'Image'}`}
                        </span>
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-500">
                {fileType === 'video' ? "Recommended: MP4, WebM. Max 10MB." : "Recommended size: 800x1000px. Max 2MB."}
                Max {maxFiles} files.
            </p>
        </div>
    );
}
