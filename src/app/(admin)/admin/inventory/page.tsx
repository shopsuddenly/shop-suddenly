"use client";

import React, { useEffect, useState } from "react";
import { ProductService } from "@/services/product.service";
import { AdminService } from "@/services/admin.service";
import { Product } from "@/types/store";
import { formatPrice, cn } from "@/lib/utils";
import { Loader2, Search, AlertTriangle, CheckCircle, XCircle, Save, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

    // Track expanded rows
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

    // Track localized stock changes before saving
    // keys for main product: "productId"
    // keys for variants: "productId:variantId"
    const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await ProductService.getAdminProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products:", error);
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (productId: string) => {
        const newSet = new Set(expandedProducts);
        if (newSet.has(productId)) newSet.delete(productId);
        else newSet.add(productId);
        setExpandedProducts(newSet);
    };

    const handleStockChange = (key: string, newValue: string) => {
        const value = parseInt(newValue);
        if (isNaN(value) || value < 0) return;

        setStockUpdates(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const saveStock = async (product: Product, variantId?: string) => {
        const updateKey = variantId ? `${product.id}:${variantId}` : product.id;
        const newStock = stockUpdates[updateKey];

        if (newStock === undefined) return;

        setSaving(prev => ({ ...prev, [updateKey]: true }));
        try {
            let updatePayload: Partial<Product> = {};

            if (variantId && product.variants) {
                // Updating a variant
                const updatedVariants = product.variants.map(v =>
                    v.id === variantId ? { ...v, stock: newStock } : v
                );

                // Recalculate total stock
                const newTotalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

                updatePayload = {
                    variants: updatedVariants,
                    stock: newTotalStock
                };
            } else {
                // Updating main product stock (only allowed if no variants)
                updatePayload = { stock: newStock };
            }

            await AdminService.updateProduct(product.id, updatePayload);

            // Update local state
            setProducts(prev => prev.map(p => {
                if (p.id !== product.id) return p;
                return { ...p, ...updatePayload };
            }));

            // Clear update tracking
            setStockUpdates(prev => {
                const next = { ...prev };
                delete next[updateKey];
                return next;
            });

            toast.success("Stock updated");
        } catch (error) {
            console.error("Failed to update stock:", error);
            toast.error("Failed to update stock");
        } finally {
            setSaving(prev => ({ ...prev, [updateKey]: false }));
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.id.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        const stock = product.stock; // Filter based on actual current stock

        if (filter === 'low') return stock > 0 && stock < 10;
        if (filter === 'out') return stock === 0;

        return true;
    });

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle };
        if (stock < 10) return { label: 'Low Stock', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle };
        return { label: 'In Stock', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-2">Inventory Management</h1>
                    <p className="text-muted-foreground">Manage stock levels and availability</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchProducts}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md focus:border-primary outline-none transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('low')}
                        className={`px-4 py-2 rounded-md transition-colors ${filter === 'low' ? 'bg-amber-500 text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                    >
                        Low Stock
                    </button>
                    <button
                        onClick={() => setFilter('out')}
                        className={`px-4 py-2 rounded-md transition-colors ${filter === 'out' ? 'bg-red-500 text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                    >
                        Out of Stock
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="w-10"></th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Product</th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Category</th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Price</th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Badge</th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                // Status based on TOTAL stock (real-time from product)
                                const status = getStockStatus(product.stock);
                                const StatusIcon = status.icon;

                                const hasVariants = product.variants && product.variants.length > 0;
                                const isExpanded = expandedProducts.has(product.id);

                                // Main Product Stock Input (Read Only if variants exist)
                                const mainStockKey = product.id;
                                const mainStockValue = stockUpdates[mainStockKey] ?? product.stock;
                                const hasMainChanges = stockUpdates[mainStockKey] !== undefined && stockUpdates[mainStockKey] !== product.stock;
                                const isMainSaving = saving[mainStockKey];

                                return (
                                    <React.Fragment key={product.id}>
                                        <tr className={cn(
                                            "border-b border-border transition-colors hover:bg-muted/30",
                                            isExpanded ? "bg-muted/30" : ""
                                        )}>
                                            <td className="py-4 pl-4 text-center">
                                                {hasVariants && (
                                                    <button
                                                        onClick={() => toggleExpand(product.id)}
                                                        className="p-1 hover:bg-muted rounded text-muted-foreground"
                                                    >
                                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                                                        {product.images[0] && (
                                                            <Image
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">{product.id}</p>
                                                        {hasVariants && <div className="text-xs text-indigo-400 mt-0.5">{product.variants?.length} Variants</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-sm">
                                                {formatPrice(product.price)}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-foreground">
                                                {product.sku || "N/A"}
                                            </td>
                                            <td className="py-4 px-6">
                                                {product.customBadge ? (
                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                                        {product.customBadge}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/30 text-[10px] italic">None</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={mainStockValue}
                                                        onChange={(e) => handleStockChange(mainStockKey, e.target.value)}
                                                        disabled={!!hasVariants}
                                                        className={cn(
                                                            "w-20 px-2 py-1 bg-background border rounded outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-center",
                                                            hasMainChanges ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-border',
                                                            hasVariants ? 'opacity-50 cursor-not-allowed bg-muted' : ''
                                                        )}
                                                        title={hasVariants ? "Total stock is calculated from variants" : "Edit Stock"}
                                                    />
                                                    {hasMainChanges && !hasVariants && (
                                                        <button
                                                            onClick={() => saveStock(product)}
                                                            disabled={isMainSaving}
                                                            className="p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                                                            title="Save Changes"
                                                        >
                                                            {isMainSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {status.label}
                                                </div>
                                            </td>
                                            <td className="text-right py-4 px-6">
                                                <Link
                                                    href={`/admin/products/edit/${product.id}`}
                                                    className="text-sm font-medium text-primary hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                        {/* Nested Variant Row */}
                                        {isExpanded && hasVariants && (
                                            <tr className="bg-muted/20">
                                                <td colSpan={7} className="p-0">
                                                    <div className="p-4 pl-16 border-b border-border">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-xs text-muted-foreground uppercase tracking-wider text-left">
                                                                    <th className="pb-2">Variant</th>
                                                                    <th className="pb-2">SKU</th>
                                                                    <th className="pb-2">Price Override</th>
                                                                    <th className="pb-2">Stock</th>
                                                                    <th className="pb-2">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border/50">
                                                                {product.variants!.map(variant => {
                                                                    const vKey = `${product.id}:${variant.id}`;
                                                                    const vStock = stockUpdates[vKey] ?? variant.stock;
                                                                    const vChanged = stockUpdates[vKey] !== undefined && stockUpdates[vKey] !== variant.stock;
                                                                    const vSaving = saving[vKey];
                                                                    const vStatus = getStockStatus(variant.stock);

                                                                    return (
                                                                        <tr key={variant.id} className="hover:bg-muted/50">
                                                                            <td className="py-2 font-medium text-foreground">
                                                                                <div className="flex items-center gap-2">
                                                                                    {variant.attributes?.Color && (
                                                                                        <div 
                                                                                            className="w-3 h-3 rounded-full border border-border flex-shrink-0" 
                                                                                            style={{ backgroundColor: String(variant.attributes.Color).toLowerCase() }}
                                                                                            title={String(variant.attributes.Color)}
                                                                                        />
                                                                                    )}
                                                                                    <span>{variant.name}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-2 text-muted-foreground font-mono text-xs">{variant.sku || '-'}</td>
                                                                            <td className="py-2 text-muted-foreground">
                                                                                {variant.price ? formatPrice(variant.price) : <span className="text-muted-foreground/50">Same as Base</span>}
                                                                            </td>
                                                                            <td className="py-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        value={vStock}
                                                                                        onChange={(e) => handleStockChange(vKey, e.target.value)}
                                                                                        className={cn(
                                                                                            "w-16 px-2 py-1 bg-background border rounded outline-none text-xs font-mono text-center",
                                                                                            vChanged ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-border'
                                                                                        )}
                                                                                    />
                                                                                    {vChanged && (
                                                                                        <button
                                                                                            onClick={() => saveStock(product, variant.id)}
                                                                                            disabled={vSaving}
                                                                                            className="p-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                                                                                            title="Save Changes"
                                                                                        >
                                                                                            {vSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-2">
                                                                                <span className={cn("text-xs", vStatus.color)}>
                                                                                    {vStock === 0 ? "Out of Stock" : `${vStock} Available`}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                        No products found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
