
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    getDoc,
    setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, Category } from "@/types/store";

export const AdminService = {
    // --- Products ---

    async addProduct(product: Partial<Product>) {
        const docRef = await addDoc(collection(db, "products"), {
            ...product,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: product.isActive ?? true,
            isFeatured: product.isFeatured ?? false,
        });
        return docRef.id;
    },

    async updateProduct(id: string, product: Partial<Product>) {
        const docRef = doc(db, "products", id);
        await updateDoc(docRef, {
            ...product,
            updatedAt: new Date().toISOString(),
        });
    },

    async deleteProduct(id: string) {
        const docRef = doc(db, "products", id);
        await deleteDoc(docRef);
    },

    // --- Categories ---

    async addCategory(category: Partial<Category>) {
        if (!category.slug) throw new Error("Slug is required");
        const docRef = doc(db, "categories", category.slug);
        const uniqueCheck = await getDoc(docRef);

        if (uniqueCheck.exists()) {
            throw new Error("Category with this slug already exists.");
        }

        await setDoc(docRef, {
            ...category,
            imageUrl: category.imageUrl || `https://ui-avatars.com/api/?name=${(category.name || category.slug).replace(/ /g, '+')}&background=000&color=fff`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        return docRef.id;
    },

    async updateCategory(id: string, category: Partial<Category>) {
        const docRef = doc(db, "categories", id);
        await updateDoc(docRef, {
            ...category,
            updatedAt: new Date().toISOString(),
        });
    },

    async deleteCategory(id: string) {
        const docRef = doc(db, "categories", id);
        await deleteDoc(docRef);
    },

    async ensureCategoryExists(id: string, name?: string) {
        const docRef = doc(db, "categories", id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            await setDoc(docRef, {
                name: name || id.charAt(0).toUpperCase() + id.slice(1),
                slug: id,
                imageUrl: `https://ui-avatars.com/api/?name=${(name || id).replace(/ /g, '+')}&background=000&color=fff`,
                description: "Auto-created from CSV",
                isFeatured: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
    }
};
