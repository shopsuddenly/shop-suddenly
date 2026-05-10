import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Product } from '@/types/store';

export type SortOption = 'Newest' | 'Price: Low to High' | 'Price: High to Low' | 'Best Sellers';

export interface FilterState {
    category: string;
    brands: string[];
    priceRange: [number, number];
    rating: number | null; // Minimum rating
    attributes: { [key: string]: string[] }; // e.g. { Color: ['Red'], Size: ['M'] }
}

const ITEMS_PER_PAGE = 12;

export const useProductSearch = (initialProducts: Product[]) => {
    // --- State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<FilterState>({
        category: "All",
        brands: [],
        priceRange: [0, 10000], // Default wide range
        rating: null,
        attributes: {}
    });
    const [sortOption, setSortOption] = useState<SortOption>("Newest");
    const [currentPage, setCurrentPage] = useState(1);

    // --- Derived Data (Facets) ---
    // Calculate available brands, min/max price, etc. from initial dataset
    const facets = useMemo(() => {
        const brands = Array.from(new Set(initialProducts.map(p => p.brand).filter(Boolean) as string[])).sort();
        const prices = initialProducts.map(p => p.price);
        const minPrice = Math.floor(Math.min(...prices, 0));
        const maxPrice = Math.ceil(Math.max(...prices, 1000));

        // Extract all unique attributes
        const attributes: { [key: string]: Set<string> } = {};
        initialProducts.forEach(p => {
            if (p.attributes) {
                Object.entries(p.attributes).forEach(([key, values]) => {
                    if (!attributes[key]) attributes[key] = new Set();
                    values.forEach(v => attributes[key].add(v));
                });
            }
        });

        const formattedAttributes: { [key: string]: string[] } = {};
        Object.entries(attributes).forEach(([key, set]) => {
            formattedAttributes[key] = Array.from(set).sort();
        });

        return { brands, minPrice, maxPrice, attributes: formattedAttributes };
    }, [initialProducts]);

    // Initialize price range filter once on mount if needed, or keep default
    // For now we assume default is wide enough or user sets it.

    // --- Search Engine (Fuse.js) ---
    const fuse = useMemo(() => {
        return new Fuse(initialProducts, {
            keys: ['name', 'brand', 'category.name', 'description', 'tags', 'keywords'], // Added keywords
            threshold: 0.3, // 0.0 = exact match, 1.0 = match anything
            ignoreLocation: true,
            minMatchCharLength: 2
        });
    }, [initialProducts]);

    // --- Filtering Logic ---
    const filteredProducts = useMemo(() => {
        let result = initialProducts;

        // 1. Search Query
        if (searchQuery.trim()) {
            result = fuse.search(searchQuery).map(r => r.item);
        }

        // 2. Category Filter
        if (filters.category !== "All") {
            result = result.filter(p => p.categoryId === filters.category);
        }

        // 3. Brand Filter
        if (filters.brands.length > 0) {
            result = result.filter(p => p.brand && filters.brands.includes(p.brand));
        }

        // 4. Price Filter
        if (filters.priceRange) {
            result = result.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
        }

        // 5. Rating Filter
        if (filters.rating) {
            result = result.filter(p => (p.rating?.rate || 0) >= filters.rating!);
        }

        // 6. Attribute Filters (e.g. Color, Size)
        // Logic: OR within a key (Red OR Blue), AND across keys (Color AND Size)
        const activeAttributeKeys = Object.keys(filters.attributes).filter(k => filters.attributes[k].length > 0);
        if (activeAttributeKeys.length > 0) {
            result = result.filter(p => {
                return activeAttributeKeys.every(key => {
                    // Product must have this attribute key
                    if (!p.attributes || !p.attributes[key]) return false;
                    // Product attribute values must overlap with selected values
                    const productValues = p.attributes[key];
                    const selectedValues = filters.attributes[key];
                    return productValues.some(val => selectedValues.includes(val));
                });
            });
        }

        return result;
    }, [initialProducts, searchQuery, filters, fuse]);

    // --- Sorting Logic ---
    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            switch (sortOption) {
                case "Price: Low to High":
                    return a.price - b.price;
                case "Price: High to Low":
                    return b.price - a.price;
                case "Best Sellers":
                    return (b.sales || 0) - (a.sales || 0);
                case "Newest":
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
    }, [filteredProducts, sortOption]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedProducts, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters, sortOption]);

    return {
        // Data
        products: paginatedProducts,
        totalCount: sortedProducts.length,
        totalPages,
        facets, // Available options for UI

        // State
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        sortOption,
        setSortOption,
        currentPage,
        setCurrentPage
    };
};
