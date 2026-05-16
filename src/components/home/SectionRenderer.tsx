import { PageSection } from "@/types/cms";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { ProductSlider } from "@/components/home/ProductSlider";
import { PromoBanner } from "@/components/home/PromoBanner";
import { TrustBadges } from "@/components/home/TrustBadges";
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
                <section className="relative py-8 md:py-28 overflow-hidden bg-background hidden md:block">
                    {/* Decorative gradient orbs */}
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
                    <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-secondary blur-[80px] pointer-events-none" />

                    <div className="container relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-6">
                            {section.heading && (
                                <span className="inline-block text-xs font-bold uppercase tracking-[0.4em] text-primary border border-primary/20 rounded-full px-5 py-2 bg-primary/5">
                                    {section.heading}
                                </span>
                            )}
                            {section.subheading && (
                                <h2 className="text-display-md md:text-display-lg lg:text-display-xl tracking-tighter leading-[1.05]">
                                    {section.subheading}
                                </h2>
                            )}
                            {section.description && (
                                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                    {section.description}
                                </p>
                            )}
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
                <section className="py-8 md:py-32">
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
                <section className="py-10 border-y border-border overflow-hidden bg-background">
                    <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
                        {/* Duplicate for seamless loop */}
                        {Array(16).fill(null).map((_, i) => (
                            <span
                                key={i}
                                className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground/10 mx-10 select-none"
                            >
                                {section.text}
                            </span>
                        ))}
                    </div>
                </section>
            );

        case 'TRUST_BADGES':
            return <TrustBadges />;

        default:
            return null;
    }
}
