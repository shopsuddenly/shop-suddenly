"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import { TagPill } from "@/components/common/TagPill";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, Category } from "@/types/store";
import { useProductSearch, SortOption } from "@/hooks/useProductSearch";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Drawer } from "vaul";

interface ShopClientProps {
    initialProducts: Product[];
    categories: Category[];
}

const sortOptions: SortOption[] = ["Newest", "Price: Low to High", "Price: High to Low", "Best Sellers"];

export function ShopClient({ initialProducts, categories }: ShopClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category");


    const {
        products,
        totalCount,
        totalPages,
        facets,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        sortOption,
        setSortOption,
        currentPage,
        setCurrentPage
    } = useProductSearch(initialProducts);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sync URL search param with internal state on mount or URL change
    useEffect(() => {
        if (initialQuery !== searchQuery) {
            setSearchQuery(initialQuery);
        }
    }, [initialQuery]);

    // Sync URL category param with internal filters
    useEffect(() => {
        if (categorySlug) {
            const matchedCategory = categories.find(c => c.slug.toLowerCase() === categorySlug.toLowerCase());
            if (matchedCategory) {
                setFilters(prev => ({ ...prev, category: matchedCategory.id }));
            }
        } else {
            // If no category param, and we are not explicitly filtering by "All" (default), reset to All
            // But we want to preserve manual changes if we didn't navigate. 
            // Actually, if URL changes (back button), we should sync.
            setFilters(prev => ({ ...prev, category: "All" }));
        }
    }, [categorySlug, categories]);

    // Update Category Filter when clicking pills
    const handleCategoryChange = (catId: string) => {
        // Find category to get slug
        if (catId === "All") {
            setFilters(prev => ({ ...prev, category: "All" }));
            router.push('/shop', { scroll: false });
        } else {
            const matchedCategory = categories.find(c => c.id === catId);
            if (matchedCategory) {
                setFilters(prev => ({ ...prev, category: catId }));
                router.push(`/shop?category=${matchedCategory.slug}`, { scroll: false });
            }
        }
    };

    return (
        <div className="min-h-screen bg-background pb-8 md:pb-20">
            {/* Header */}
            <section className="pt-16 md:pt-20 pb-6 md:pb-10 bg-gradient-to-b from-secondary/40 to-background border-b border-border/50">
                <div className="container">
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                            {searchQuery ? "Search Results" : "The Collection"}
                        </span>
                        <h1 className="text-display-sm md:text-display-md tracking-tighter font-bold">
                            {searchQuery ? `"${searchQuery}"` : "Shop All"}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {totalCount} product{totalCount !== 1 ? "s" : ""} found
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="sticky top-[calc(var(--navbar-height,64px))] z-30 bg-background/95 backdrop-blur-md border-b border-border py-3">
                <div className="container">
                    <div className="flex items-center justify-between gap-4">
                        {/* Category Pills - Desktop (Quick Filters) */}
                        <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <TagPill
                                active={filters.category === "All"}
                                onClick={() => handleCategoryChange("All")}
                            >
                                All
                            </TagPill>
                            {categories.map((category) => (
                                <TagPill
                                    key={category.id}
                                    active={filters.category === category.id}
                                    onClick={() => handleCategoryChange(category.id)}
                                >
                                    {category.name}
                                </TagPill>
                            ))}
                        </div>

                        {/* Mobile Filter Button */}
                        <Button
                            variant="ghost"
                            onClick={() => setIsFilterOpen(true)}
                            className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </Button>

                        {/* Sort Dropdown */}
                        <div className="relative ml-auto">
                            <button
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Sort: {sortOption}
                                <ChevronDown className={cn("w-4 h-4 transition-transform", isSortOpen && "rotate-180")} />
                            </button>
                            {isSortOpen && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border p-2 animate-fade-in z-40 shadow-lg rounded-xl">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                setSortOption(option);
                                                setIsSortOpen(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors rounded-lg",
                                                sortOption === option
                                                    ? "text-foreground bg-secondary"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                            )}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="container pt-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-40">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="font-bold text-lg tracking-tight">Filters</h3>
                                {(filters.brands.length > 0 || filters.category !== "All" || filters.priceRange[0] > 0 || filters.rating) && (
                                    <button
                                        onClick={() => setFilters({ category: "All", brands: [], priceRange: [facets.minPrice, facets.maxPrice], rating: null, attributes: {} })}
                                        className="text-xs text-muted-foreground hover:text-primary underline transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <FilterSidebar
                                filters={filters}
                                setFilters={setFilters}
                                facets={facets}
                            />
                        </div>
                    </aside>

                    {/* Main Grid */}
                    <main className="flex-1">
                        {products.length > 0 ? (
                            <>
                                <ProductGrid products={products} columns={3} />
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                                <h2 className="font-serif text-2xl mb-2">No products found</h2>
                                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                                <Button
                                    variant="outline"
                                    className="mt-6"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setFilters({ category: "All", brands: [], priceRange: [facets.minPrice, facets.maxPrice], rating: null, attributes: {} });
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Drawer (Vaul Bottom Sheet) */}
            <Drawer.Root open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
                    <Drawer.Content 
                        className="bg-background border-t border-border flex flex-col rounded-t-[32px] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] outline-none"
                    >
                        {/* Drag Handle */}
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-4 mb-2" />
                        
                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <Drawer.Title className="font-serif text-3xl font-medium">Filters</Drawer.Title>
                                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-sans">Refine Results</p>
                                </div>
                                <button 
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center haptic-press"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <FilterSidebar
                                filters={filters}
                                setFilters={setFilters}
                                facets={facets}
                            />
                        </div>

                        {/* Sticky Action Footer */}
                        <div className="p-4 bg-background border-t border-border safe-bottom">
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-full btn-luxury h-14 flex items-center justify-center rounded-2xl haptic-press"
                            >
                                <span>Show {totalCount} Results</span>
                            </button>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    );
}
