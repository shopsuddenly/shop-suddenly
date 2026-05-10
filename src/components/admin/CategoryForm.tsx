"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types/store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AdminService } from "@/services/admin.service";
import { ProductService } from "@/services/product.service";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CategoryFormProps {
    initialData?: Category;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // [New] State for parent category selection
    const [existingCategories, setExistingCategories] = useState<Category[]>([]);
    const [openCategory, setOpenCategory] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await ProductService.getCategories();
            // Filter to show only top-level categories if needed, for now show all except self
            setExistingCategories(data);
        };
        fetchCategories();
    }, []);

    const [formData, setFormData] = useState<Partial<Category>>(
        initialData || {
            name: "",
            slug: "",
            description: "",
            imageUrl: "",
            isFeatured: false,
            type: 'CATEGORY', // Default
            parentId: null
        }
    );

    // [New] helper to create URL-friendly slugs
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => {
                const updates = { [name]: value };
                // Auto-generate slug if name changes and user hasn't manually edited slug
                // (Simple heuristic: if slug starts with old slugified name or is empty)
                if (name === 'name' && !initialData?.id) {
                    // Only auto-generate for new categories or if we decide to enforce it.
                    // Let's just do it if the slug is empty or matches the generated version of the previous name snippet
                    // Check simply: always suggest slug if it's a create form
                    updates.slug = generateSlug(value);
                }
                return { ...prev, ...updates };
            });
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, slug: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData?.id) {
                await AdminService.updateCategory(initialData.id, formData);
            } else {
                await AdminService.addCategory(formData);
            }
            router.push("/admin/categories");
            router.refresh();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Failed to save category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6 max-w-2xl">
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Category Name</label>
                <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Electronics"
                    className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Slug (URL Path)</label>
                <div className="relative">
                    <input
                        name="slug"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        placeholder="e.g. electronics"
                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-sm transition-all"
                        required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        example.com/shop/{formData.slug || 'category'}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    The "slug" is the URL-friendly version of the name. It appears in the browser address bar.
                    It is auto-generated from the name but you can edit it.
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Image URL</label>
                <input
                    name="imageUrl"
                    value={formData.imageUrl || ""}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-muted-foreground">Featured</span>
            </label>

            {/* [NEW] Category Type Selection */}
            <div className="space-y-3 pt-4 border-t border-border">
                <label className="text-sm font-medium text-muted-foreground">Category Type</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            checked={formData.type !== 'SUBCATEGORY'}
                            onChange={() => setFormData(prev => ({ ...prev, type: 'CATEGORY', parentId: null }))}
                            className="w-4 h-4 text-primary focus:ring-primary bg-background border-border"
                        />
                        <span className="text-sm text-muted-foreground">Main Category</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            checked={formData.type === 'SUBCATEGORY'}
                            onChange={() => setFormData(prev => ({ ...prev, type: 'SUBCATEGORY' }))}
                            className="w-4 h-4 text-primary focus:ring-primary bg-background border-border"
                        />
                        <span className="text-sm text-muted-foreground">Subcategory</span>
                    </label>
                </div>
            </div>

            {/* [NEW] Parent Category Selection (if Subcategory) */}
            {
                formData.type === 'SUBCATEGORY' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Parent Category</label>
                        <Popover open={openCategory} onOpenChange={setOpenCategory}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCategory}
                                    className="w-full justify-between bg-background border-border text-foreground hover:bg-muted hover:text-foreground"
                                >
                                    {formData.parentId
                                        ? existingCategories.find((c) => c.id === formData.parentId)?.name || formData.parentId
                                        : "Select parent category..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0 bg-card border-border text-foreground">
                                <Command className="bg-card text-foreground">
                                    <CommandInput placeholder="Search parent category..." className="h-9" />
                                    <CommandEmpty>No category found.</CommandEmpty>
                                    <CommandGroup className="text-foreground">
                                        {existingCategories
                                            .filter(c => c.id !== initialData?.id) // Prevent self-selection
                                            .map((category) => (
                                                <CommandItem
                                                    key={category.id}
                                                    value={category.name}
                                                    onSelect={() => {
                                                        setFormData(prev => ({ ...prev, parentId: category.id }));
                                                        setOpenCategory(false);
                                                    }}
                                                    className="text-foreground aria-selected:bg-muted aria-selected:text-foreground"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.parentId === category.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {category.name}
                                                </CommandItem>
                                            ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">Select the main category this subcategory belongs to.</p>
                    </div>
                )
            }

            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? 'Update Category' : 'Create Category')}
                </Button>
            </div>
        </form>
    );
}
