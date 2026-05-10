"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Search, Plus, Minus, Check } from "lucide-react";
import { Order, OrderItem } from "@/types/order";
import { Product } from "@/types/store";
import { ProductService } from "@/services/product.service";
import { OrderService } from "@/services/order.service";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

interface ReplacementOrderModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ReplacementItem extends OrderItem {
    isModified: boolean;
}

export function ReplacementOrderModal({ order, isOpen, onClose, onSuccess }: ReplacementOrderModalProps) {
    const [items, setItems] = useState<ReplacementItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && order) {
            // Initialize with original order items
            setItems(order.items.map(item => ({
                ...item,
                isModified: false
            })));
        }
    }, [isOpen, order]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const products = await ProductService.getAllProducts();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 10);
            setSearchResults(filtered);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectProduct = (product: Product, variantIndex?: number) => {
        if (editingItemIndex === null) return;

        const variant = variantIndex !== undefined ? product.variants?.[variantIndex] : null;

        const newItem: ReplacementItem = {
            productId: product.id,
            name: product.name,
            variantId: variant?.id,
            size: variant?.attributes?.Size ? String(variant.attributes.Size) : variant?.name,
            image: product.images?.[0] || '',
            quantity: items[editingItemIndex].quantity,
            unitPrice: variant?.price || product.price,
            isModified: true
        };

        const updatedItems = [...items];
        updatedItems[editingItemIndex] = newItem;
        setItems(updatedItems);

        setEditingItemIndex(null);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleQuantityChange = (index: number, delta: number) => {
        const updatedItems = [...items];
        const newQty = updatedItems[index].quantity + delta;
        if (newQty > 0 && newQty <= 10) {
            updatedItems[index].quantity = newQty;
            updatedItems[index].isModified = true;
            setItems(updatedItems);
        }
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            toast.error("At least one item is required");
            return;
        }

        setLoading(true);
        try {
            // Convert to OrderItem (remove isModified flag)
            const orderItems: OrderItem[] = items.map(({ isModified, ...item }) => item);

            const newOrder = await OrderService.createCustomReplacementOrder(order.id, orderItems);
            toast.success(`Replacement order ${newOrder.id} created!`);
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to create replacement order");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div>
                        <h2 className="font-serif text-xl">Create Replacement Order</h2>
                        <p className="text-sm text-muted-foreground">For order {order.id.slice(-8)}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Items List */}
                    <div>
                        <h3 className="font-medium mb-3">Replacement Items</h3>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-4 p-3 border rounded-lg ${item.isModified ? 'border-primary bg-primary/5' : 'border-border'
                                        }`}
                                >
                                    {/* Image */}
                                    <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.name}</p>
                                        {item.size && (
                                            <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                                        )}
                                        <p className="text-sm font-medium mt-1">{formatPrice(item.unitPrice)}</p>
                                        {item.isModified && (
                                            <span className="text-xs text-primary">Modified</span>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantityChange(index, -1)}
                                            className="w-7 h-7 flex items-center justify-center border border-border rounded hover:bg-muted"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(index, 1)}
                                            className="w-7 h-7 flex items-center justify-center border border-border rounded hover:bg-muted"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Change Button */}
                                    <button
                                        onClick={() => setEditingItemIndex(index)}
                                        className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                                    >
                                        Change
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Search (when editing) */}
                    {editingItemIndex !== null && (
                        <div className="border border-primary rounded-lg p-4 bg-primary/5">
                            <h4 className="font-medium mb-3">Select Replacement Product</h4>

                            {/* Search Input */}
                            <div className="flex gap-2 mb-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search products..."
                                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={searching}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                                >
                                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                                </button>
                                <button
                                    onClick={() => setEditingItemIndex(null)}
                                    className="px-4 py-2 border border-border rounded-lg text-sm"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {searchResults.map((product) => (
                                        <div key={product.id} className="border border-border rounded-lg p-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                                                    {product.images?.[0] && (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                                                </div>
                                            </div>

                                            {/* Variants */}
                                            {product.variants && product.variants.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {product.variants.map((variant, vi) => (
                                                        <button
                                                            key={variant.id}
                                                            onClick={() => handleSelectProduct(product, vi)}
                                                            className="px-3 py-1 text-xs border border-border rounded hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                                        >
                                                            {variant.name} - {formatPrice(variant.price || product.price)}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSelectProduct(product)}
                                                    className="mt-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded"
                                                >
                                                    Select
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {items.length} item{items.length !== 1 ? 's' : ''} • Free replacement
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || items.length === 0}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 inline mr-2" />
                                    Create Replacement
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
