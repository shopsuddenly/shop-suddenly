import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star } from "lucide-react";
import { FilterState } from "@/hooks/useProductSearch";
import { formatPrice } from "@/lib/utils";

interface Facets {
    brands: string[];
    minPrice: number;
    maxPrice: number;
    attributes: { [key: string]: string[] };
}

interface FilterSidebarProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    facets: Facets;
    className?: string;
}

export function FilterSidebar({ filters, setFilters, facets, className }: FilterSidebarProps) {

    // --- Handlers ---
    const handleBrandChange = (brand: string, checked: boolean) => {
        setFilters(prev => ({
            ...prev,
            brands: checked
                ? [...prev.brands, brand]
                : prev.brands.filter(b => b !== brand)
        }));
    };

    const handleAttributeChange = (key: string, value: string, checked: boolean) => {
        setFilters(prev => {
            const currentValues = prev.attributes[key] || [];
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter(v => v !== value);

            return {
                ...prev,
                attributes: {
                    ...prev.attributes,
                    [key]: newValues
                }
            };
        });
    };

    const handleRatingChange = (rating: number) => {
        // Toggle: if clicking same rating, clear it
        setFilters(prev => ({
            ...prev,
            rating: prev.rating === rating ? null : rating
        }));
    };

    return (
        <div className={className}>
            <Accordion type="multiple" defaultValue={["price", "brand", "rating", ...Object.keys(facets.attributes)]} className="w-full">

                {/* Price Range */}
                <AccordionItem value="price">
                    <AccordionTrigger className="text-sm uppercase tracking-luxury">Price Range</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-1 pt-4 pb-2">
                            <Slider
                                defaultValue={[facets.minPrice, facets.maxPrice]}
                                value={filters.priceRange}
                                min={facets.minPrice}
                                max={facets.maxPrice}
                                step={10}
                                minStepsBetweenThumbs={1}
                                onValueChange={(val) => setFilters(prev => ({ ...prev, priceRange: [val[0], val[1]] }))}
                                className="mb-4"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground font-sans">
                                <span>{formatPrice(filters.priceRange[0])}</span>
                                <span>{formatPrice(filters.priceRange[1])}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Brands */}
                {facets.brands.length > 0 && (
                    <AccordionItem value="brand">
                        <AccordionTrigger className="text-sm uppercase tracking-luxury">Brands</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                {facets.brands.map(brand => (
                                    <div key={brand} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`brand-${brand}`}
                                            checked={filters.brands.includes(brand)}
                                            onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                                        />
                                        <Label htmlFor={`brand-${brand}`} className="text-sm font-sans font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                            {brand}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Attributes (Dynamic) */}
                {Object.entries(facets.attributes).map(([key, values]) => (
                    <AccordionItem key={key} value={key}>
                        <AccordionTrigger className="text-sm uppercase tracking-luxury">{key}</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                {values.map(val => (
                                    <div key={val} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`attr-${key}-${val}`}
                                            checked={filters.attributes[key]?.includes(val) || false}
                                            onCheckedChange={(checked) => handleAttributeChange(key, val, checked as boolean)}
                                        />
                                        <Label htmlFor={`attr-${key}-${val}`} className="text-sm font-sans font-normal leading-none cursor-pointer">
                                            {val}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}

                {/* Rating */}
                <AccordionItem value="rating">
                    <AccordionTrigger className="text-sm uppercase tracking-luxury">Min Rating</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {[4, 3, 2, 1].map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => handleRatingChange(rating)}
                                    className={`flex items-center gap-2 text-sm w-full hover:bg-zinc-50 dark:hover:bg-zinc-900 p-1 rounded ${filters.rating === rating ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                                >
                                    <div className="flex text-yellow-500">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < rating ? "fill-current" : "text-gray-300 dark:text-gray-700"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-muted-foreground">& Up</span>
                                </button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
