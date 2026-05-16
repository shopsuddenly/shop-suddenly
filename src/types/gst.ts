// GST Configuration Types

export interface GSTSlab {
    id: string;
    label: string;         // e.g. "Clothing ≤ ₹1000"
    maxPrice: number;      // Upper price limit (use Infinity or 999999 for no cap)
    rate: number;          // GST rate percentage, e.g. 5 or 12
}

export interface BusinessAddress {
    companyName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface GSTConfig {
    // Business Identity
    businessAddress: BusinessAddress;
    gstin: string;
    pan: string;
    stateCode: string;     // e.g. "03" for Punjab

    // Tax Slabs (ordered by maxPrice ascending)
    slabs: GSTSlab[];

    // Defaults
    defaultTaxType: 'inclusive' | 'exclusive'; // Whether listed prices include GST
    hsnCode: string;       // Default HSN code for clothing (e.g. "6109")

    // Metadata
    updatedAt: string;
}

// Default GST Config
export const DEFAULT_GST_CONFIG: GSTConfig = {
    businessAddress: {
        companyName: "SHOPSUDDENLY PRIVATE LIMITED",
        addressLine1: "Plot No. 88, Tech Business Park",
        addressLine2: "Industrial Area Phase 8B",
        city: "Mohali",
        state: "Punjab",
        postalCode: "160071",
        country: "India",
    },
    gstin: "03AABCS1234Q1Z2",
    pan: "AABCS1234Q",
    stateCode: "03",
    slabs: [
        { id: "slab-1", label: "Clothing ≤ ₹1000", maxPrice: 1000, rate: 5 },
        { id: "slab-2", label: "Clothing > ₹1000", maxPrice: 999999, rate: 12 },
    ],
    defaultTaxType: 'inclusive',
    hsnCode: "6109",
    updatedAt: new Date().toISOString(),
};
