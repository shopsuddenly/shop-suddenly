"use client";

import { useEffect, useState } from "react";
import { GSTConfigService } from "@/services/gst-config.service";
import { GSTConfig, GSTSlab, DEFAULT_GST_CONFIG } from "@/types/gst";
import { toast } from "sonner";
import {
    Loader2,
    Save,
    Plus,
    Trash2,
    Building2,
    Receipt,
    Calculator,
    Info,
} from "lucide-react";

export default function GSTConfigPage() {
    const [config, setConfig] = useState<GSTConfig>(DEFAULT_GST_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await GSTConfigService.getConfig();
            setConfig(data);
        } catch (error) {
            console.error("Error loading GST config:", error);
            toast.error("Failed to load GST configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await GSTConfigService.saveConfig(config);
            toast.success("GST configuration saved successfully");
        } catch (error) {
            console.error("Error saving GST config:", error);
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const updateBusinessAddress = (field: string, value: string) => {
        setConfig((prev) => ({
            ...prev,
            businessAddress: {
                ...prev.businessAddress,
                [field]: value,
            },
        }));
    };

    const addSlab = () => {
        const newSlab: GSTSlab = {
            id: `slab-${Date.now()}`,
            label: "",
            maxPrice: 0,
            rate: 5,
        };
        setConfig((prev) => ({
            ...prev,
            slabs: [...prev.slabs, newSlab],
        }));
    };

    const updateSlab = (index: number, field: keyof GSTSlab, value: string | number) => {
        setConfig((prev) => {
            const newSlabs = [...prev.slabs];
            newSlabs[index] = { ...newSlabs[index], [field]: value };
            return { ...prev, slabs: newSlabs };
        });
    };

    const removeSlab = (index: number) => {
        setConfig((prev) => ({
            ...prev,
            slabs: prev.slabs.filter((_, i) => i !== index),
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl md:text-4xl">
                        GST & Invoice Settings
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your business details, tax slabs, and invoice configuration
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            {/* Business Address Section */}
            <section className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">Business Address</h2>
                        <p className="text-xs text-muted-foreground">
                            This will appear on all generated invoices
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={config.businessAddress.companyName}
                            onChange={(e) =>
                                updateBusinessAddress("companyName", e.target.value)
                            }
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            Address Line 1
                        </label>
                        <input
                            type="text"
                            value={config.businessAddress.addressLine1}
                            onChange={(e) =>
                                updateBusinessAddress("addressLine1", e.target.value)
                            }
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            Address Line 2
                        </label>
                        <input
                            type="text"
                            value={config.businessAddress.addressLine2 || ""}
                            onChange={(e) =>
                                updateBusinessAddress("addressLine2", e.target.value)
                            }
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            City
                        </label>
                        <input
                            type="text"
                            value={config.businessAddress.city}
                            onChange={(e) =>
                                updateBusinessAddress("city", e.target.value)
                            }
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            State
                        </label>
                        <input
                            type="text"
                            value={config.businessAddress.state}
                            onChange={(e) =>
                                updateBusinessAddress("state", e.target.value)
                            }
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            Postal Code
                        </label>
                        <input
                            type="text"
                            value={config.businessAddress.postalCode}
                            onChange={(e) =>
                                updateBusinessAddress("postalCode", e.target.value)
                            }
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            Country
                        </label>
                        <input
                            type="text"
                            value={config.businessAddress.country}
                            onChange={(e) =>
                                updateBusinessAddress("country", e.target.value)
                            }
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </section>

            {/* Tax Identity Section */}
            <section className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">Tax Identity</h2>
                        <p className="text-xs text-muted-foreground">
                            Your GSTIN, PAN, and state code for invoice compliance
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            GSTIN
                        </label>
                        <input
                            type="text"
                            value={config.gstin}
                            onChange={(e) =>
                                setConfig((prev) => ({ ...prev, gstin: e.target.value.toUpperCase() }))
                            }
                            placeholder="22AAAAA0000A1Z5"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            PAN Number
                        </label>
                        <input
                            type="text"
                            value={config.pan}
                            onChange={(e) =>
                                setConfig((prev) => ({ ...prev, pan: e.target.value.toUpperCase() }))
                            }
                            placeholder="AAAAA0000A"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            State/UT Code
                        </label>
                        <input
                            type="text"
                            value={config.stateCode}
                            onChange={(e) =>
                                setConfig((prev) => ({ ...prev, stateCode: e.target.value }))
                            }
                            placeholder="03"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        />
                    </div>
                </div>
            </section>

            {/* GST Slabs Section */}
            <section className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">GST Tax Slabs</h2>
                            <p className="text-xs text-muted-foreground">
                                Define price-based tax rates for clothing
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={addSlab}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Slab
                    </button>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 mb-5 flex items-start gap-3">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div className="text-xs text-muted-foreground">
                        <strong className="text-foreground">How it works:</strong> The system
                        checks the item&apos;s unit price against each slab&apos;s max price
                        (ascending). The first matching slab determines the GST rate.
                        <br />
                        Example: Price ₹800 → matches &quot;≤ ₹1000&quot; slab → 5% GST.
                        Price ₹1500 → matches &quot;&gt; ₹1000&quot; slab → 12% GST.
                    </div>
                </div>

                {/* Slabs Table */}
                {config.slabs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No tax slabs configured. Click &quot;Add Slab&quot; to create one.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-4">Label</div>
                            <div className="col-span-3">Max Price (₹)</div>
                            <div className="col-span-3">GST Rate (%)</div>
                            <div className="col-span-2 text-right">Action</div>
                        </div>

                        {config.slabs.map((slab, index) => (
                            <div
                                key={slab.id}
                                className="grid grid-cols-12 gap-3 items-center bg-muted/30 rounded-lg p-3"
                            >
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        value={slab.label}
                                        onChange={(e) =>
                                            updateSlab(index, "label", e.target.value)
                                        }
                                        placeholder="e.g. Clothing ≤ ₹1000"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        value={slab.maxPrice}
                                        onChange={(e) =>
                                            updateSlab(
                                                index,
                                                "maxPrice",
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        placeholder="1000"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={slab.rate}
                                            onChange={(e) =>
                                                updateSlab(
                                                    index,
                                                    "rate",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            placeholder="5"
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                            %
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <button
                                        onClick={() => removeSlab(index)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Remove slab"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Invoice Defaults Section */}
            <section className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">Invoice Defaults</h2>
                        <p className="text-xs text-muted-foreground">
                            Configure default settings for invoice generation
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            Default Tax Type
                        </label>
                        <select
                            value={config.defaultTaxType}
                            onChange={(e) =>
                                setConfig((prev) => ({
                                    ...prev,
                                    defaultTaxType: e.target.value as 'inclusive' | 'exclusive',
                                }))
                            }
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="inclusive">
                                Tax Inclusive (Price includes GST)
                            </option>
                            <option value="exclusive">
                                Tax Exclusive (GST added on top)
                            </option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                            Default HSN Code
                        </label>
                        <input
                            type="text"
                            value={config.hsnCode}
                            onChange={(e) =>
                                setConfig((prev) => ({ ...prev, hsnCode: e.target.value }))
                            }
                            placeholder="6109"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        />
                    </div>
                </div>
            </section>

            {/* Last Updated Info */}
            {config.updatedAt && (
                <p className="text-xs text-muted-foreground text-right">
                    Last updated: {new Date(config.updatedAt).toLocaleString()}
                </p>
            )}
        </div>
    );
}
