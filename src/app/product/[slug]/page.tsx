import { ProductService } from "@/services/product.service";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export const revalidate = 3600;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const product = await ProductService.getProductBySlug(params.slug);
    if (!product) return { title: "Product Not Found" };

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suddenly.com';
    const cleanDescription = product.description.replace(/<[^>]*>?/gm, '').slice(0, 160);
    const mainImage = product.images[0] || '/og-image.jpg';

    return {
        title: product.name,
        description: cleanDescription,
        openGraph: {
            title: product.name,
            description: cleanDescription,
            url: `${baseUrl}/product/${product.slug}`,
            images: [{ url: mainImage, alt: product.name }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: cleanDescription,
            images: [mainImage],
        },
        other: {
            'product:price:amount': String(product.price),
            'product:price:currency': 'INR',
        }
    };
}

export default async function ProductPage(props: Props) {
    const params = await props.params;
    const product = await ProductService.getProductBySlug(params.slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await ProductService.getRelatedProducts(product.categoryId, product.id);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suddenly.com';

    // Product Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description.replace(/<[^>]*>?/gm, ''),
        sku: product.id,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${baseUrl}/product/${product.slug}`,
        },
    };

    // Breadcrumb Schema
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Shop',
                item: `${baseUrl}/shop`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: `${baseUrl}/product/${product.slug}`,
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <ProductDetailClient product={product} relatedProducts={relatedProducts} />
        </>
    );
}
