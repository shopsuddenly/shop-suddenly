"use client";

import { useEffect, useState } from "react";
import { ProductService } from "@/services/product.service";
import { AdminService } from "@/services/admin.service";
import { Product } from "@/types/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { BulkProductUpload } from "@/components/admin/BulkProductUpload";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const router = useRouter();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await ProductService.getAdminProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            await AdminService.deleteProduct(id);
            fetchProducts();
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) {
            setLoading(true);
            try {
                await Promise.all(Array.from(selectedIds).map(id => AdminService.deleteProduct(id)));
                setSelectedIds(new Set());
                fetchProducts();
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
            setSelectedIds(new Set(products.map(p => p.id)));
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
                <h1 className="font-serif text-3xl md:text-4xl text-foreground">Products</h1>
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
                    <BulkProductUpload onUploadComplete={fetchProducts} />
                    <Link href="/admin/products/new">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
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
                                    checked={products.length > 0 && selectedIds.size === products.length}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Image</th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Badge</th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No products found.</td></tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-border bg-background"
                                            checked={selectedIds.has(product.id)}
                                            onChange={(e) => toggleSelect(product.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="h-10 w-10 bg-muted rounded overflow-hidden">
                                            {product.images?.[0] && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-medium text-foreground">{product.name}</td>
                                    <td className="px-4 py-4 text-muted-foreground">{formatPrice(product.price)}</td>
                                    <td className="px-4 py-4">
                                        {product.customBadge ? (
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                                {product.customBadge}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/30 text-[10px] italic">No Badge</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {product.isActive ? (
                                            <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs">Active</span>
                                        ) : (
                                            <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-xs">Inactive</span>
                                        )}
                                        {product.isFeatured && (
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs ml-2">Featured</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right space-x-2">
                                        <Link href={`/admin/products/edit/${product.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted hover:text-foreground">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleDelete(product.id)}
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
