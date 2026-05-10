"use client";

import { useEffect, useState } from "react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Category, Product } from "@/types/store";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductService } from "@/services/product.service";
import { AdminService } from "@/services/admin.service";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function EditCategoryPage() {
    const params = useParams();
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!params.id) return;
        setLoading(true);
        try {
            // Fetch Category
            const docRef = doc(db, "categories", params.id as string);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setCategory({ id: snap.id, ...snap.data() } as Category);
            }

            // Fetch Products for this Category
            const productsData = await ProductService.getAdminProductsByCategory(params.id as string);
            setProducts(productsData);
        } catch (e) {
            console.error("Error fetching", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const handleDeleteProduct = async (productId: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            await AdminService.deleteProduct(productId);
            fetchData(); // Refresh list
        }
    };

    if (loading) return <div className="p-8 text-muted-foreground flex items-center justify-center min-h-[200px]">Loading...</div>;
    if (!category) return <div className="p-8 text-muted-foreground">Category not found.</div>;

    return (
        <div className="p-6 md:p-8 space-y-12">
            <div>
                <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-8">Edit Category</h1>
                <CategoryForm initialData={category} />
            </div>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-2xl text-foreground">Products in this Category</h2>
                    <Link href={`/admin/products/new?categoryId=${category.id}`}>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Image</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {products.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No products found in this category.</td></tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-muted/50 transition-colors">
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
                                            {product.isActive ? (
                                                <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs">Active</span>
                                            ) : (
                                                <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-xs">Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right space-x-2">
                                            <Link href={`/admin/products/${product.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted hover:text-foreground">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => handleDeleteProduct(product.id)}
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
        </div>
    );
}
