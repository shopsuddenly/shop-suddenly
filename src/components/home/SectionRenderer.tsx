import { PageSection } from "@/types/cms";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { ProductSlider } from "@/components/home/ProductSlider";
import { PromoBanner } from "@/components/home/PromoBanner";
import Image from "next/image";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ProductService } from "@/services/product.service";

interface Props {
    section: PageSection;
}

export async function SectionRenderer({ section }: Props) {
    if (!section.isEnabled) return null;

    switch (section.type) {
        case 'HERO':
            return <HeroCarousel slides={section.slides} />;

        case 'BRAND':
            return (
                <section className="py-20 md:py-32 bg-secondary/20">
                    <div className="container">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                                {section.heading}
                            </span>
                            <h2 className="text-display-md md:text-display-lg lg:text-display-xl tracking-tighter">
                                {section.subheading}
                            </h2>
                            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                {section.description}
                            </p>
                        </div>
                    </div>
                </section>
            );

        case 'CATEGORY_STRIP':
            return <CategoryStrip categories={section.categories} />;

        case 'PRODUCT_SLIDER':
            const products = await ProductService.getProductsByFilter(
                section.filterType,
                section.count
            );
            return (
                <ProductSlider
                    title={section.title}
                    subtitle={section.subtitle}
                    products={products}
                />
            );

        case 'PROMO_BANNER':
            return (
                <PromoBanner
                    title={section.title}
                    subtitle={section.subtitle}
                    cta={section.ctaText}
                    link={section.ctaLink}
                    image={section.image}
                    reverse={section.layout === 'REVERSE'}
                />
            );

        case 'LOOKBOOK':
            return (
                <section className="py-20 md:py-32">
                    <div className="container">
                        <SectionHeader
                            title={section.title}
                            subtitle={section.subtitle}
                            className="mb-16"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {section.images.map((image, index) => (
                                <div
                                    key={index}
                                    className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary shadow-soft hover:shadow-soft-lg transition-all duration-500"
                                >
                                    {image && (
                                        <Image
                                            src={image}
                                            alt={`Lookbook ${index + 1}`}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );

        case 'MARQUEE':
            return (
                <section className="py-12 border-y border-border overflow-hidden bg-background">
                    <div className="flex animate-marquee whitespace-nowrap">
                        {Array(8).fill(null).map((_, i) => (
                            <span
                                key={i}
                                className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground/5 mx-12 italic"
                            >
                                {section.text}
                            </span>
                        ))}
                    </div>
                </section>
            );

        default:
            return null;
    }
}
