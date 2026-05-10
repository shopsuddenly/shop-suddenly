"use client";

import { useEffect, useState } from "react";
import { ProductService } from "@/services/product.service";
import { AdminService } from "@/services/admin.service";
import { Category } from "@/types/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await ProductService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            await AdminService.deleteCategory(id);
            fetchCategories();
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedIds.size} categories?`)) {
            setLoading(true);
            try {
                await Promise.all(Array.from(selectedIds).map(id => AdminService.deleteCategory(id)));
                setSelectedIds(new Set());
                fetchCategories();
            } catch (error) {
                console.error("Bulk delete failed", error);
                alert("Some deletions failed.");
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(categories.map(c => c.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleSelect = (id: string, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        setSelectedIds(newSet);
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="font-serif text-3xl md:text-4xl text-foreground">Categories</h1>
                <div className="flex gap-4">
                    {selectedIds.size > 0 && (
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete ({selectedIds.size})
                        </Button>
                    )}
                    <Link href="/admin/categories/new">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="px-4 py-3 w-12">
                                <input
                                    type="checkbox"
                                    className="rounded border-border bg-background"
                                    checked={categories.length > 0 && selectedIds.size === categories.length}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Image</th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Featured</th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No categories found.</td></tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-border bg-background"
                                            checked={selectedIds.has(category.id)}
                                            onChange={(e) => toggleSelect(category.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="h-10 w-10 bg-muted rounded overflow-hidden">
                                            {category.imageUrl && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={category.imageUrl} alt="" className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-medium text-foreground">{category.name}</td>
                                    <td className="px-4 py-4 text-muted-foreground font-mono text-xs">{category.slug}</td>
                                    <td className="px-4 py-4">
                                        {category.isFeatured ? (
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">Featured</span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right space-x-2">
                                        <Link href={`/admin/categories/${category.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted hover:text-foreground">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
