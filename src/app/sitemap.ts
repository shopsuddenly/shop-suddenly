import { MetadataRoute } from 'next';
import { ProductService } from '@/services/product.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suddenly.com';

    // Fetch all products
    const products = await ProductService.getAllProducts();

    // Product routes
    const productUrls = products.map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    // Static routes
    const routes = [
        '',
        '/shop',
        '/about',
        '/contact',
        '/faqs',
        '/privacy',
        '/terms',
        '/shipping',
        '/returns'
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.5,
    }));

    return [...routes, ...productUrls];
}
