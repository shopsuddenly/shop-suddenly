"use client";

import { Product } from "@/types/store";
import { AlertTriangle, Package } from "lucide-react";
import Link from "next/link";

interface LowStockAlertProps {
    products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-serif text-lg text-yellow-900 dark:text-yellow-100 mb-1">
                        Low Stock Alert
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {products.length} {products.length === 1 ? 'product has' : 'products have'} low stock levels
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {products.slice(0, 5).map((product) => (
                    <Link
                        key={product.id}
                        href={`/admin/products/${product.id}`}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded border border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <div>
                                <p className="text-sm font-medium text-foreground">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    Only {product.stock} left in stock
                                </p>
                            </div>
                        </div>
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                            Restock →
                        </span>
                    </Link>
                ))}
                {products.length > 5 && (
                    <p className="text-xs text-center text-yellow-700 dark:text-yellow-300 mt-2">
                        +{products.length - 5} more products need restocking
                    </p>
                )}
            </div>
        </div>
    );
}
