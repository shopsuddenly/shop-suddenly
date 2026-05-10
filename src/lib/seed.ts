import { db } from "@/lib/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { Category, Product } from "@/types/store";

const CATEGORIES = [
    { id: 'electronics', name: 'Electronics', slug: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800&q=80', isFeatured: true },
    { id: 'fashion', name: 'Fashion', slug: 'fashion', imageUrl: 'https://images.unsplash.com/photo-1445205170230-05328324f37f?w=800&q=80', isFeatured: true },
    { id: 'home', name: 'Home & Living', slug: 'home-living', imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80', isFeatured: false },
];

const PRODUCTS: Partial<Product>[] = [
    {
        id: 'prod_1',
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'Noise cancelling high fidelity headphones.',
        price: 199.99,
        mrp: 249.99,
        categoryId: 'electronics',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
        stock: 50,
        isFeatured: true,
        isActive: true,
        tags: ['audio', 'wireless'],
    },
    {
        id: 'prod_2',
        name: 'Smart Watch',
        slug: 'smart-watch',
        description: 'Track your fitness and sleep.',
        price: 149.99,
        mrp: 199.99,
        categoryId: 'electronics',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
        stock: 30,
        isFeatured: false,
        isActive: true,
        tags: ['fitness', 'smart'],
    },
    {
        id: 'prod_3',
        name: 'Cotton T-Shirt',
        slug: 'cotton-t-shirt',
        description: '100% organic cotton basic tee.',
        price: 29.99,
        mrp: 39.99,
        categoryId: 'fashion',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
        stock: 100,
        isFeatured: true,
        isActive: true,
        tags: ['clothing', 'cotton'],
    },
    {
        id: 'prod_4',
        name: 'Denim Jacket',
        slug: 'denim-jacket',
        description: 'Classic vintage style denim jacket.',
        price: 89.99,
        mrp: 120.00,
        categoryId: 'fashion',
        images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80'],
        stock: 20,
        isFeatured: false,
        isActive: true,
        tags: ['clothing', 'outerwear'],
    },
    {
        id: 'prod_5',
        name: 'Minimalist Lamp',
        slug: 'minimalist-lamp',
        description: 'Warm light for your reading corner.',
        price: 45.00,
        mrp: 60.00,
        categoryId: 'home',
        images: ['https://images.unsplash.com/photo-1507473888900-52e1adad5481?w=800&q=80'],
        stock: 15,
        isFeatured: true,
        isActive: true,
        tags: ['decor', 'lighting'],
    }
];

export async function seedDatabase() {
    const batch = writeBatch(db);

    // Seed Categories
    CATEGORIES.forEach((cat) => {
        const ref = doc(db, 'categories', cat.id);
        batch.set(ref, {
            ...cat,
            createdAt: new Date().toISOString()
        });
    });

    // Seed Products
    PRODUCTS.forEach((prod) => {
        const ref = doc(db, 'products', prod.id!);
        batch.set(ref, {
            ...prod,
            createdAt: new Date().toISOString()
        });
    });

    await batch.commit();
    console.log("Database seeded successfully!");
}
