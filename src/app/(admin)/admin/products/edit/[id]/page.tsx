"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types/store";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EditProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            // Need to fetch by ID directly since we link by ID now
            // ProductService.getProductBySlug is not useful here if we use IDs
            // I'll make a direct firestore call here for simplicity or add getProductById to service.
            // Direct call is easier for this one-off admin edit
            if (params.id) {
                try {
                    const docRef = doc(db, "products", params.id as string);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        setProduct({ id: snap.id, ...snap.data() } as Product);
                    } else {
                        console.error("No such product!");
                    }
                } catch (e) {
                    console.error("Error fetching", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProduct();
    }, [params.id]);

    if (loading) return <div className="p-8 text-muted-foreground flex items-center justify-center min-h-[200px]">Loading...</div>;
    if (!product) return <div className="p-8 text-muted-foreground">Product not found.</div>;

    return (
        <div className="p-6 md:p-8">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-8">Edit Product</h1>
            <ProductForm initialData={product} />
        </div>
    );
}
