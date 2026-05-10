"use client";

import { formatPrice } from "@/lib/utils";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/types/store";
import { Badge } from "@/components/common/Badge";
import { ProductSlider } from "@/components/home/ProductSlider";
import { Heart, Minus, Plus, ChevronDown, Truck, RotateCcw, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import useEmblaCarousel from "embla-carousel-react";
import { ReviewSection } from "./reviews/ReviewSection";
import { WishlistButton } from "@/components/common/WishlistButton";
import { SizeGuideModal } from "./SizeGuideModal";
import { OffersSection } from "./OffersSection";

const sizes = ["XS", "S", "M", "L", "XL"];

interface ProductDetailClientProps {
    product: Product;
    relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
    const router = useRouter();
    const addToCart = useCartStore((state) => state.addToCart);
    const setDirectCheckoutItem = useCartStore((state) => state.setDirectCheckoutItem);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string | number>>({});
    const [selectedColor, setSelectedColor] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
    const [isCareOpen, setIsCareOpen] = useState(false);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = () => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        }
    }, [emblaApi]);

    // [NEW] Dynamic Gallery Logic
    const images = useMemo(() => {
        const colorAttr = selectedAttributes['Color'];
        // If color-specific media exists, use it
        if (colorAttr && product.colorMedia && product.colorMedia[String(colorAttr)] && product.colorMedia[String(colorAttr)].length > 0) {
            return product.colorMedia[String(colorAttr)];
        }

        // Fallback to general images
        const baseImages = product.images.length > 0
            ? [...product.images]
            : ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80"];

        // Simulation for demo (if only 1 image)
        if (baseImages.length === 1) {
            baseImages.push("https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80");
            baseImages.push("https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80");
        }
        return baseImages;
    }, [product.images, product.colorMedia, selectedAttributes['Color']]);

    // [NEW] Reset active image when the gallery set changes
    useEffect(() => {
        setActiveImage(0);
    }, [images]);


    const handleAddToBag = () => {
        console.log('🛍️ [PRODUCT] Add to Bag clicked', { product: product.name, selectedAttributes, quantity });

        // Logic moved to button onClick for now, but this handler exists for reference/legacy structure
        // If we want to use this handler, we should consolidate logic.
        // For now, the button onClick handles the logic directly in the updated render.
        // Leaving this as safe placeholder or we can remove it.
        // Actually, let's just make it helpful.
        if (product.variants && product.variants.length > 0) {
            const requiredKeys = Object.keys(product.variants[0].attributes || {});
            const missingKeys = requiredKeys.filter(k => !selectedAttributes[k]);
            if (missingKeys.length > 0) {
                toast.error(`Please select ${missingKeys.join(' and ')}`);
                return;
            }
        }
    };


    const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;


    return (
        <>
            <section className="pt-28 pb-16 md:pt-32">
                <div className="luxury-container">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            {/* Desktop: Main Image + Thumbnails | Mobile: Swipe Carousel */}
                            <div className="hidden md:block space-y-4">
                                <div className="aspect-[3/4] overflow-hidden bg-card relative">
                                    <Image
                                        src={images[activeImage]}
                                        alt={product.name}
                                        fill
                                        className="object-cover animate-fade-in"
                                        priority
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {images.slice(0, 4).map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={cn(
                                                "aspect-[3/4] overflow-hidden bg-card transition-all duration-300 relative",
                                                activeImage === index
                                                    ? "ring-2 ring-primary"
                                                    : "opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            <Image
                                                src={image}
                                                alt={`${product.name} view ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Swipe Gallery */}
                            <div className="md:hidden">
                                <div className="overflow-hidden" ref={emblaRef}>
                                    <div className="flex">
                                        {images.map((image, index) => (
                                            <div key={index} className="flex-[0_0_100%] min-w-0 relative aspect-[3/4]">
                                                <Image
                                                    src={image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Pagination Indicator */}
                                <div className="flex justify-center gap-2 mt-4">
                                    {scrollSnaps.map((_, index) => (
                                        <button
                                            key={index}
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                                selectedIndex === index ? "bg-primary w-4" : "bg-muted-foreground/30"
                                            )}
                                            onClick={() => emblaApi?.scrollTo(index)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="lg:sticky lg:top-32 lg:self-start space-y-8">
                            {/* Badges */}
                            <div className="flex items-center gap-2">
                                {product.isFeatured && <Badge variant="gold">New Arrival</Badge>}
                                {product.customBadge && <Badge>{product.customBadge}</Badge>}
                            </div>

                            {/* Title & Price */}
                            <div>
                                {/* Assuming category is a string or relation. For now displaying hardcoded or available field */}
                                {/* <p className="text-muted-foreground text-xs font-sans uppercase tracking-luxury mb-2">
                  {product.categoryId} 
                </p>  */}
                                <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <p className="font-serif text-3xl font-medium text-foreground">
                                        {formatPrice(product.price)}
                                    </p>
                                    {product.mrp && product.mrp > product.price && (
                                        <p className="text-lg text-muted-foreground line-through">
                                            {formatPrice(product.mrp)}
                                        </p>
                                    )}
                                    {discount > 0 && <span className="text-green-600 text-sm font-medium">{discount}% OFF</span>}
                                </div>
                            </div>

                            {/* Offers Section */}
                            <OffersSection />



                            {/* Variant Selection (Dynamic) */}
                            {product.variants && product.variants.length > 0 ? (
                                <div className="space-y-6">
                                    {(() => {
                                        // 1. Derive unique attributes from variants
                                        const attributes: Record<string, (string | number)[]> = {};
                                        product.variants.forEach(v => {
                                            if (v.attributes) {
                                                Object.entries(v.attributes).forEach(([key, val]) => {
                                                    if (!attributes[key]) attributes[key] = [];
                                                    if (!attributes[key].includes(val)) attributes[key].push(val);
                                                });
                                            }
                                        });

                                        // 2. Render a selector for EACH attribute type (e.g. Size, Color)
                                        return Object.entries(attributes).map(([attrName, options]) => (
                                            <div key={attrName}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-sm font-sans text-muted-foreground">
                                                        {attrName}: <span className="text-foreground">{selectedAttributes[attrName] || "Select"}</span>
                                                    </p>
                                                    {attrName === 'Size' && (
                                                        <button
                                                            onClick={() => setIsSizeGuideOpen(true)}
                                                            className="text-xs font-sans uppercase tracking-luxury text-primary hover:underline"
                                                        >
                                                            Size Guide
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {options.map((option) => {
                                                        // Check availability for this specific option value
                                                        // logic: is there ANY variant with this option that has stock?
                                                        // Advanced: Filter based on OTHER selected attributes.
                                                        // Implementation: exact match on this attr, loose match on others?
                                                        // For now: Simple "exists in any variant" check.

                                                        // Better availability check:
                                                        // Is there a variant that matches { ...selectedAttributes, [attrName]: option } AND has stock?
                                                        // We simulate selecting this option temporarily.
                                                        const potentialSelection = { ...selectedAttributes, [attrName]: option };

                                                        // Filter variants matching ALL selected keys (except the current loop's keys if needed, but here we want to see if this option IS clickable given current state)
                                                        // Actually, standard e-comm behavior:
                                                        // If I selected Color: Red, and I'm looking at Sizes... I should only see Sizes available in Red.

                                                        const isCombinable = product.variants?.some(v => {
                                                            // Match all ALREADY selected attributes (excluding current attribute type)
                                                            const otherAttrsMatch = Object.entries(selectedAttributes).every(([k, val]) => {
                                                                if (k === attrName) return true; // Ignore self
                                                                return v.attributes[k] === val;
                                                            });

                                                            // Match THIS option
                                                            const thisAttrMatches = v.attributes[attrName] === option;

                                                            return otherAttrsMatch && thisAttrMatches && v.stock > 0;
                                                        });

                                                        // If no other attributes selected yet, just check if ANY variant has this option with stock
                                                        const isAvailableGlobal = product.variants?.some(v => v.attributes[attrName] === option && v.stock > 0);

                                                        // Decide which check to use.
                                                        // If we want strict step-by-step selection, use isCombinable.
                                                        // But users might select Size first, OR Color first. 
                                                        // Strict 'isCombinable' might disable everything if a conflict exists.
                                                        // Let's use strict isCombinable but fallback if nothing selected.
                                                        const hasStock = Object.keys(selectedAttributes).length > 0 ? isCombinable : isAvailableGlobal;

                                                        // Highlight if selected
                                                        const isSelected = selectedAttributes[attrName] === option;

                                                        return (
                                                            <button
                                                                key={option}
                                                                onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrName]: option }))}
                                                                disabled={!hasStock && !isSelected} // Allow deselecting or viewing? No, standard is disable if no stock.
                                                                className={cn(
                                                                    "min-w-[3.5rem] h-12 px-4 border text-sm font-sans transition-all duration-300 relative flex items-center justify-center",
                                                                    isSelected
                                                                        ? "bg-foreground text-background border-foreground"
                                                                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                                                                    (!hasStock && !isSelected) && "opacity-50 cursor-not-allowed bg-muted"
                                                                )}
                                                            >
                                                                {option}
                                                                {(!hasStock && !isSelected) && (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <div className="w-full h-px bg-slate-400 rotate-45" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ));
                                    })()}

                                    {/* Stock Status Message */}
                                    {(() => {
                                        // Find exact variant match
                                        const variant = product.variants.find(v =>
                                            Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val) &&
                                            // Ensure we selected ALL required attributes? 
                                            // Ideally yes. Count keys.
                                            Object.keys(v.attributes).length === Object.keys(selectedAttributes).length
                                        );

                                        if (variant && Object.keys(selectedAttributes).length > 0) {
                                            if (variant.stock <= 5 && variant.stock > 0) {
                                                return <p className="text-xs font-medium text-amber-600 animate-in fade-in">Only {variant.stock} left in stock!</p>;
                                            }
                                            if (variant.stock === 0) {
                                                return <p className="text-xs font-medium text-red-600 animate-in fade-in">Out of stock</p>;
                                            }
                                            return <p className="text-xs font-medium text-green-600 animate-in fade-in">In Stock</p>;
                                        }
                                        return null;
                                    })()}
                                </div>
                            ) : (
                                /* Fallback to legacy static sizes if no variants exist */
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-sans text-muted-foreground">
                                            Size: <span className="text-foreground">{selectedAttributes['Size'] || "Select"}</span>
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedAttributes({ 'Size': size })}
                                                className={cn(
                                                    "w-14 h-12 border text-sm font-sans transition-all duration-300",
                                                    selectedAttributes['Size'] === size
                                                        ? "bg-foreground text-background border-foreground"
                                                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                                                )}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity & Add to Bag */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                                {/* Top Row (Mobile): Quantity and Wishlist */}
                                <div className="flex justify-between items-center w-full sm:contents">
                                    {/* Quantity */}
                                    <div className="flex items-center border border-border h-14 rounded-md overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-sans text-foreground">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Wishlist Mobile Position - Hidden on Desktop */}
                                    <div className="sm:hidden">
                                        <WishlistButton
                                            product={product}
                                            className="w-14 h-14 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors rounded-md"
                                        />
                                    </div>
                                </div>


                                {/* Action Buttons - Full Width Rows on Mobile, Flex on Desktop */}
                                <div className="flex gap-4 w-full sm:flex-1">
                                    {/* Add to Bag */}
                                    <button
                                        onClick={() => {
                                            // Legacy / Fallback Mode (No Variants defined in DB)
                                            if (!product.variants || product.variants.length === 0) {
                                                if (!selectedAttributes['Size']) {
                                                    toast.error("Please select a size");
                                                    return;
                                                }
                                                addToCart(product, quantity, String(selectedAttributes['Size'])); // Treat size string as variantId for legacy
                                                toast.success("Added to bag!");
                                                return;
                                            }

                                            // Variant Mode
                                            // 1. Check if all attributes selected
                                            // We need to know HOW MANY attributes exist to know if selection is complete.
                                            // Take the first variant as a template for keys.
                                            const requiredKeys = Object.keys(product.variants[0].attributes || {});
                                            const missingKeys = requiredKeys.filter(k => !selectedAttributes[k]);

                                            if (missingKeys.length > 0) {
                                                toast.error(`Please select ${missingKeys.join(' and ')}`);
                                                return;
                                            }

                                            // 2. Find matching variant
                                            const variant = product.variants.find(v =>
                                                Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
                                            );

                                            if (!variant) {
                                                toast.error("Unavailable combination");
                                                return;
                                            }

                                            if (variant.stock < quantity) {
                                                toast.error(`Insufficient stock (Only ${variant.stock} left)`);
                                                return;
                                            }

                                            addToCart(product, quantity, variant.id);
                                            toast.success("Added to bag!");
                                        }}
                                        disabled={
                                            // Disable if specific variant selected and out of stock
                                            (() => {
                                                if (!product.variants || product.variants.length === 0) return false;
                                                const variant = product.variants.find(v =>
                                                    Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
                                                );
                                                return variant ? variant.stock === 0 : false;
                                            })()
                                        }
                                        className="flex-1 btn-luxury h-14 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base px-2 sm:px-4 text-center break-words" // Added text-xs/break-words to prevent overflow
                                    >
                                        <span>
                                            {(() => {
                                                if (product.variants && product.variants.length > 0) {
                                                    const variant = product.variants.find(v =>
                                                        Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
                                                    );
                                                    if (variant && variant.stock === 0) return "Out of Stock";
                                                }
                                                return "Add to Bag";
                                            })()}
                                        </span>
                                    </button>

                                    {/* Buy Now Button */}
                                    <button
                                        onClick={() => {
                                            // Legacy Logic
                                            if (!product.variants || product.variants.length === 0) {
                                                if (!selectedAttributes['Size']) {
                                                    toast.error("Please select a size");
                                                    return;
                                                }
                                                setDirectCheckoutItem(product, quantity, String(selectedAttributes['Size']));
                                                router.push('/checkout');
                                                return;
                                            }

                                            // Variant Logic
                                            const requiredKeys = Object.keys(product.variants[0].attributes || {});
                                            const missingKeys = requiredKeys.filter(k => !selectedAttributes[k]);

                                            if (missingKeys.length > 0) {
                                                toast.error(`Please select ${missingKeys.join(' and ')}`);
                                                return;
                                            }

                                            const variant = product.variants.find(v =>
                                                Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
                                            );

                                            if (!variant) {
                                                toast.error("Unavailable combination");
                                                return;
                                            }

                                            if (variant.stock < quantity) {
                                                toast.error(`Insufficient stock (Only ${variant.stock} left)`);
                                                return;
                                            }

                                            setDirectCheckoutItem(product, quantity, variant.id);
                                            router.push('/checkout');
                                        }}
                                        disabled={
                                            (() => {
                                                if (!product.variants || product.variants.length === 0) return false;
                                                const variant = product.variants.find(v =>
                                                    Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
                                                );
                                                return variant ? variant.stock === 0 : false;
                                            })()
                                        }
                                        className="flex-1 h-14 border border-foreground text-foreground font-sans uppercase tracking-luxury hover:bg-foreground hover:text-background transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground text-xs sm:text-base px-2 sm:px-4 rounded-md"
                                    >
                                        Buy Now
                                    </button>
                                </div>

                                {/* Wishlist Desktop Position - Hidden on Mobile */}
                                <div className="hidden sm:block">
                                    <WishlistButton
                                        product={product}
                                        className="w-14 h-14 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors rounded-md"
                                    />
                                </div>
                            </div>


                            {/* Features */}
                            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
                                <div className="text-center">
                                    <Truck className="w-5 h-5 mx-auto mb-2 text-primary" />
                                    <p className="text-xs font-sans text-muted-foreground">Free Shipping</p>
                                </div>
                                <div className="text-center">
                                    <RotateCcw className="w-5 h-5 mx-auto mb-2 text-primary" />
                                    <p className="text-xs font-sans text-muted-foreground">Easy Returns</p>
                                </div>
                                <div className="text-center">
                                    <Shield className="w-5 h-5 mx-auto mb-2 text-primary" />
                                    <p className="text-xs font-sans text-muted-foreground">Secure Payment</p>
                                </div>
                            </div>

                            {/* Accordions */}
                            <div className="space-y-0">
                                {/* Description */}
                                <div className="border-b border-border">
                                    <button
                                        onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                                        className="w-full flex items-center justify-between py-4 text-sm font-sans uppercase tracking-luxury text-foreground"
                                    >
                                        Description
                                        <ChevronDown className={cn("w-4 h-4 transition-transform", isDescriptionOpen && "rotate-180")} />
                                    </button>
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-300",
                                        isDescriptionOpen ? "max-h-96 pb-4" : "max-h-0"
                                    )}>
                                        <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                                            {product.description || "Crafted from premium materials, this piece embodies the essence of modern luxury. The minimalist design is complemented by impeccable tailoring, ensuring both comfort and sophistication. Perfect for those who appreciate understated elegance with a contemporary edge."}
                                        </p>
                                    </div>
                                </div>

                                {/* Care Instructions */}
                                <div className="border-b border-border">
                                    <button
                                        onClick={() => setIsCareOpen(!isCareOpen)}
                                        className="w-full flex items-center justify-between py-4 text-sm font-sans uppercase tracking-luxury text-foreground"
                                    >
                                        Care Instructions
                                        <ChevronDown className={cn("w-4 h-4 transition-transform", isCareOpen && "rotate-180")} />
                                    </button>
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-300",
                                        isCareOpen ? "max-h-96 pb-4" : "max-h-0"
                                    )}>
                                        <ul className="text-sm font-sans text-muted-foreground space-y-2">
                                            <li>• Dry clean recommended</li>
                                            <li>• Do not bleach</li>
                                            <li>• Iron on low heat</li>
                                            <li>• Store in a cool, dry place</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <div className="luxury-container">
                <ReviewSection
                    productId={product.id}
                    averageRating={product.averageRating}
                    reviewCount={product.reviewCount}
                />
            </div>

            {/* Related Products */}
            {
                relatedProducts.length > 0 && (
                    <ProductSlider
                        title="You May Also Like"
                        subtitle="Curated selections to complement your style"
                        products={relatedProducts}
                    />
                )
            }
            <SizeGuideModal
                isOpen={isSizeGuideOpen}
                onClose={() => setIsSizeGuideOpen(false)}
            />

            {/* Sticky Mobile CTA Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 safe-bottom p-4 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Price</p>
                        <p className="text-xl font-serif font-bold leading-none">{formatPrice(product.price)}</p>
                    </div>
                    <button
                        onClick={() => {
                            // Find matching variant
                            const requiredKeys = Object.keys(product.variants?.[0]?.attributes || {});
                            const missingKeys = requiredKeys.filter(k => !selectedAttributes[k]);

                            if (missingKeys.length > 0) {
                                // Jump to selection
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                                toast.error(`Please select ${missingKeys.join(' and ')}`);
                                return;
                            }

                            const variant = product.variants?.find(v =>
                                Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val)
                            );

                            if (!variant && (product.variants?.length ?? 0) > 0) {
                                toast.error("Unavailable combination");
                                return;
                            }

                            addToCart(product, quantity, variant?.id || String(selectedAttributes['Size']));
                            toast.success("Added to bag!");
                        }}
                        className="btn-luxury h-12 flex items-center justify-center px-6 min-w-[140px] haptic-press"
                    >
                        <span>Add to Bag</span>
                    </button>
                </div>
            </div>
        </>
    );
}
