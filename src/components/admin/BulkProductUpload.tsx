"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { AdminService } from "@/services/admin.service";
import { Product } from "@/types/store";

export function BulkProductUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ total: number; success: number; failed: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any[] | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setStats(null);
        setPreviewData(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as any[];
                if (rows.length === 0) {
                    setError("CSV file is empty");
                    setLoading(false);
                    return;
                }
                setPreviewData(rows);
                setLoading(false);
            },
            error: (err) => {
                setError("Failed to parse CSV file: " + err.message);
                setLoading(false);
            }
        });

        // Reset input
        e.target.value = '';
    };

    const confirmUpload = async () => {
        if (!previewData) return;

        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const row of previewData) {
            try {
                const product: Partial<Product> = {
                    name: row["Product Name"],
                    slug: row["Slug"] || row["Product Name"]?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                    price: parseFloat(row["Price"] || "0"),
                    mrp: parseFloat(row["MRP"] || "0"),
                    stock: parseInt(row["Stock"] || "0", 10),
                    categoryId: row["Category ID"],
                    images: row["Image URL"] ? [row["Image URL"]] : [],
                    description: row["Description"] || "",
                    isActive: row["Active"]?.toLowerCase() === 'true' || row["Active"] === '1',
                    isFeatured: row["Featured"]?.toLowerCase() === 'true' || row["Featured"] === '1',
                };

                if (!product.name || !product.categoryId) {
                    throw new Error("Missing required fields");
                }

                if (product.categoryId) {
                    await AdminService.ensureCategoryExists(product.categoryId);
                }

                await AdminService.addProduct(product);
                successCount++;
            } catch (err) {
                console.error("Failed row:", row, err);
                failCount++;
            }
        }

        setStats({ total: previewData.length, success: successCount, failed: failCount });
        setPreviewData(null);
        setLoading(false);
        if (successCount > 0) {
            onUploadComplete();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                    <Button variant="outline" onClick={() => {
                        const csvContent = "Product Name,Slug,Price,MRP,Stock,Category ID,Image URL,Description,Active,Featured\nExample Product,example-slug,29.99,39.99,100,electronics,https://example.com/image.jpg,This is a description,true,false";
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = "product_upload_template.csv";
                        link.click();
                    }} className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700">
                        Download Template
                    </Button>

                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            disabled={loading}
                        />
                        <Button variant="outline" className="bg-indigo-600 text-white border-none hover:bg-indigo-700" disabled={loading}>
                            {loading && !previewData ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {loading && !previewData ? "Processing..." : "Import CSV"}
                        </Button>
                    </div>
                </div>

                {error && <span className="text-red-400 text-sm">{error}</span>}

                {stats && (
                    <div className="flex items-center gap-2 text-sm">
                        {stats.success > 0 && <span className="text-green-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> {stats.success} Added</span>}
                        {stats.failed > 0 && <span className="text-red-400 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {stats.failed} Failed</span>}
                    </div>
                )}
            </div>

            {previewData && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-white">Preview ({previewData.length} items)</h3>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setPreviewData(null)} disabled={loading}>Cancel</Button>
                            <Button onClick={confirmUpload} disabled={loading} className="bg-green-600 hover:bg-green-700">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Confirm Upload
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-60 overflow-auto rounded border border-slate-700">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="bg-slate-800 text-slate-200 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Price</th>
                                    <th className="px-4 py-2">Category</th>
                                    <th className="px-4 py-2">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, i) => (
                                    <tr key={i} className="border-b border-slate-800">
                                        <td className="px-4 py-2">{row["Product Name"]}</td>
                                        <td className="px-4 py-2">{row["Price"]}</td>
                                        <td className="px-4 py-2">{row["Category ID"]}</td>
                                        <td className="px-4 py-2">{row["Stock"]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
