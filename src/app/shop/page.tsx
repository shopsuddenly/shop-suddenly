import { ProductService } from "@/services/product.service";
import { ShopClient } from "@/components/shop/ShopClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
    // Fetch both products and categories
    const [products, categories] = await Promise.all([
        ProductService.getAllProducts(),
        ProductService.getCategories()
    ]);

    return <ShopClient initialProducts={products} categories={categories} />;
}
