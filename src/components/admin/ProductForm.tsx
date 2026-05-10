"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AdminService } from "@/services/admin.service";
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TagInput } from "@/components/common/TagInput";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ProductService } from "@/services/product.service";
import { Category } from "@/types/store";

interface ProductFormProps {
    initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // [New] State for categories
    const [categories, setCategories] = useState<Category[]>([]);
    const [openCategory, setOpenCategory] = useState(false);

    // [New] Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            const data = await ProductService.getCategories();
            setCategories(data);
        };
        fetchCategories();
    }, []);
    const [formData, setFormData] = useState<Partial<Product>>(
        initialData || {
            name: "",
            slug: "",
            description: "",
            price: 0,
            mrp: 0,
            stock: 0,
            categoryId: "",
            images: [],
            isActive: true,
            isFeatured: false,
            keywords: [], // Initialize
            colorMedia: {}, // [NEW] Color-specific mapping
            customBadge: "", // [NEW] Ensure always defined
        }
    );

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
    };

    // Auto-update slug when name changes, ONLY if slug hasn't been manually edited
    // or if the current slug matches the 'slugified' previous name.
    // Simplifying for better UX: If user hasn't explicitly touched the slug field, update it.
    // We can track "touched" state.
    const [slugTouched, setSlugTouched] = useState(false);

    useEffect(() => {
        // [Updated] Removed !initialData check to allow slug updates on Edit
        // UNLESS the user has manually touched the slug field.
        if (!slugTouched && formData.name) {
            setFormData(prev => ({ ...prev, slug: generateSlug(formData.name!) }));
        }
    }, [formData.name, slugTouched]); // Removed initialData dependency

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'slug') setSlugTouched(true);

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            const val = parseFloat(value);
            setFormData(prev => ({ ...prev, [name]: isNaN(val) ? 0 : val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };


    // [New] Variant Generation Logic
    const [attributeInput, setAttributeInput] = useState({ sizes: "", colors: "", defaultStock: "0" });

    const generateVariants = () => {
        const sizes = attributeInput.sizes.split(',').map(s => s.trim()).filter(Boolean);
        const colors = attributeInput.colors.split(',').map(c => c.trim()).filter(Boolean);
        const defaultStock = parseInt(attributeInput.defaultStock) || 0;

        const newVariants: Product['variants'] = [];

        if (sizes.length > 0 && colors.length > 0) {
            // Cartesian product
            sizes.forEach(size => {
                const numericSize = !isNaN(Number(size)) ? Number(size) : size;
                colors.forEach(color => {
                    newVariants.push({
                        id: `${size}-${color}-${Date.now()}`,
                        name: `${size} / ${color}`,
                        attributes: { Size: numericSize, Color: color },
                        stock: defaultStock,
                        price: formData.price // Default to product price
                    });
                });
            });
        } else if (sizes.length > 0) {
            sizes.forEach(size => {
                const numericSize = !isNaN(Number(size)) ? Number(size) : size;
                newVariants.push({
                    id: `${size}-${Date.now()}`,
                    name: `Size ${size}`,
                    attributes: { Size: numericSize },
                    stock: defaultStock,
                    price: formData.price
                });
            });
        }

        // [Updated] Append logic: Merge new variants with existing ones
        const updatedVariants = [...(formData.variants || []), ...newVariants];
        const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

        setFormData(prev => ({
            ...prev,
            variants: updatedVariants,
            stock: totalStock
        }));

        // Clear inputs after generation for better UX
        setAttributeInput(prev => ({ ...prev, sizes: "", colors: "" }));
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const newVariants = [...(formData.variants || [])];
        if (field === 'stock') newVariants[index].stock = Number(value);
        if (field === 'price') newVariants[index].price = Number(value);

        // Update total stock automatically
        const totalStock = newVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

        setFormData(prev => ({
            ...prev,
            variants: newVariants,
            stock: totalStock
        }));
    };

    const removeVariant = (index: number) => {
        const newVariants = [...(formData.variants || [])];
        newVariants.splice(index, 1);

        // Recalculate stock
        const totalStock = newVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

        setFormData(prev => ({
            ...prev,
            variants: newVariants,
            stock: totalStock
        }));
    };
    const ensureUniqueSlug = async (baseSlug: string, id?: string): Promise<string> => {
        let uniqueSlug = baseSlug;
        let counter = 1;

        while (!(await ProductService.checkSlugAvailability(uniqueSlug, id))) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }
        return uniqueSlug;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate and Ensure Unique Slug
            let finalSlug = formData.slug || generateSlug(formData.name || '');

            // Clean it one last time to be safe
            finalSlug = generateSlug(finalSlug);

            const uniqueSlug = await ensureUniqueSlug(finalSlug, initialData?.id);

            const dataToSave = {
                ...formData,
                slug: uniqueSlug
            };

            if (initialData?.id) {
                await AdminService.updateProduct(initialData.id, dataToSave);
            } else {
                await AdminService.addProduct(dataToSave);
            }
            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Ultra Comfort Hoodie"
                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Slug (URL)</label>
                    <input
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="e.g. ultra-comfort-hoodie"
                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Custom Badge (Optional)</label>
                    <input
                        name="customBadge"
                        value={formData.customBadge || ""}
                        onChange={handleChange}
                        placeholder="e.g. Winter Drop, New Arrival"
                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Price (INR)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">MRP (INR)</label>
                    <input
                        type="number"
                        name="mrp"
                        value={formData.mrp}
                        onChange={handleChange}
                        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Stock</label>
                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className={cn(
                            "w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all",
                            formData.variants && formData.variants.length > 0 && "opacity-50 cursor-not-allowed bg-muted"
                        )}
                        required
                        readOnly={!!(formData.variants && formData.variants.length > 0)}
                        title={formData.variants && formData.variants.length > 0 ? "Stock is sum of variants" : ""}
                    />
                </div>
                <div className="space-y-4 col-span-2 border border-border p-4 rounded-lg bg-muted/30">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-muted-foreground">Product Variants (Size/Color)</label>
                        <Button type="button" onClick={generateVariants} size="sm" variant="secondary" className="text-xs h-7">
                            Generate Variants
                        </Button>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-5 space-y-2">
                            <label className="text-xs text-muted-foreground">Sizes (comma separated)</label>
                            <input
                                value={attributeInput.sizes}
                                placeholder="S, M, L, XL"
                                className="w-full bg-background border border-border rounded px-3 py-1 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                onChange={(e) => setAttributeInput(prev => ({ ...prev, sizes: e.target.value }))}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-5 space-y-2">
                            <label className="text-xs text-muted-foreground">Colors (Optional, comma separated)</label>
                            <input
                                value={attributeInput.colors}
                                placeholder="Red, Blue, Black (Optional)"
                                className="w-full bg-background border border-border rounded px-3 py-1 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                onChange={(e) => setAttributeInput(prev => ({ ...prev, colors: e.target.value }))}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-2 space-y-2">
                            <label className="text-xs text-muted-foreground">Default Stock</label>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full bg-background border border-border rounded px-3 py-1 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                onChange={(e) => setAttributeInput(prev => ({ ...prev, defaultStock: e.target.value }))}
                            />
                        </div>
                    </div>

                    {formData.variants && formData.variants.length > 0 && (
                        <div className="space-y-3 mt-4">
                            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-2">
                                <div className="col-span-4">Variant</div>
                                <div className="col-span-3">Spec Price</div>
                                <div className="col-span-3">Stock</div>
                                <div className="col-span-2">Action</div>
                            </div>
                            {formData.variants.map((variant, index) => (
                                <div key={variant.id} className="grid grid-cols-12 gap-2 items-center bg-background p-2 rounded border border-border">
                                    <div className="col-span-4 text-sm text-foreground truncate" title={variant.name}>{variant.name}</div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={variant.price || ''}
                                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                            className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={variant.stock}
                                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                            className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-foreground"
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <button type="button" onClick={() => removeVariant(index)} className="text-destructive hover:text-destructive/80 text-xs">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <Popover open={openCategory} onOpenChange={setOpenCategory}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCategory}
                                className="w-full justify-between bg-background border-border text-foreground hover:bg-muted hover:text-foreground"
                            >
                                {formData.categoryId
                                    ? (() => {
                                        const cat = categories.find((c) => c.id === formData.categoryId);
                                        return cat ? `${cat.name} (${cat.id})` : formData.categoryId;
                                    })()
                                    : "Select category..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0 bg-card border-border text-foreground">
                            <Command className="bg-card text-foreground">
                                <CommandInput placeholder="Search category..." className="h-9" />
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup className="text-foreground">
                                    {categories.map((category) => (
                                        <CommandItem
                                            key={category.id}
                                            value={category.name}
                                            onSelect={() => {
                                                setFormData(prev => ({ ...prev, categoryId: category.id }));
                                                setOpenCategory(false);
                                            }}
                                            className="text-foreground aria-selected:bg-muted aria-selected:text-foreground"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    formData.categoryId === category.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {category.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Main Product Images</label>
                <ImageUpload
                    value={formData.images || []}
                    onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                    maxFiles={4}
                />
            </div>

            {/* [NEW] Color-Specific Galleries */}
            {formData.variants && formData.variants.some(v => v.attributes.Color) && (
                <div className="space-y-6 pt-4 border-t border-border mt-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">Color-Specific Galleries</h3>
                        <p className="text-xs text-muted-foreground italic">Uploaded images will show only when that color is selected on the storefront.</p>
                    </div>

                    <div className="grid gap-6">
                        {Array.from(new Set(formData.variants
                            .map(v => v.attributes.Color)
                            .filter(Boolean) as string[]
                        )).map(color => (
                            <div key={color} className="space-y-3 p-4 bg-muted/20 border border-border rounded-lg">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: color.toLowerCase() }} />
                                    Gallery for <span className="font-bold underline">{color}</span>
                                </label>
                                <ImageUpload
                                    value={formData.colorMedia?.[color] || []}
                                    onChange={(urls) => setFormData(prev => ({
                                        ...prev,
                                        colorMedia: {
                                            ...(prev.colorMedia || {}),
                                            [color]: urls
                                        }
                                    }))}
                                    maxFiles={4}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Search Keywords</label>
                <TagInput
                    tags={formData.keywords || []}
                    onTagsChange={(tags) => setFormData(prev => ({ ...prev, keywords: tags }))}
                    placeholder="Type keyword and press Enter..."
                />
                <p className="text-xs text-muted-foreground">Add keywords to improve search discoverability (e.g. 'summer', 'casual', 'cotton').</p>
            </div>

            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-muted-foreground">Active</span>
                </label>

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
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? 'Update Product' : 'Create Product')}
                </Button>
            </div>
        </form>
    );
}
