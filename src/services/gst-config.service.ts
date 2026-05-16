import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GSTConfig, DEFAULT_GST_CONFIG } from "@/types/gst";

const GST_CONFIG_DOC = "gst-config";
const SETTINGS_COLLECTION = "settings";

export const GSTConfigService = {

    /**
     * Get the current GST configuration from Firestore.
     * Returns defaults if no config exists yet.
     */
    async getConfig(): Promise<GSTConfig> {
        try {
            const docRef = doc(db, SETTINGS_COLLECTION, GST_CONFIG_DOC);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                return snap.data() as GSTConfig;
            }

            // If no config exists, seed with defaults
            await this.saveConfig(DEFAULT_GST_CONFIG);
            return DEFAULT_GST_CONFIG;
        } catch (error) {
            console.error("❌ [GST CONFIG] Error fetching config:", error);
            return DEFAULT_GST_CONFIG;
        }
    },

    /**
     * Save the GST configuration to Firestore.
     */
    async saveConfig(config: GSTConfig): Promise<void> {
        try {
            const docRef = doc(db, SETTINGS_COLLECTION, GST_CONFIG_DOC);
            await setDoc(docRef, {
                ...config,
                updatedAt: new Date().toISOString(),
            });
            console.log("✅ [GST CONFIG] Config saved successfully");
        } catch (error) {
            console.error("❌ [GST CONFIG] Error saving config:", error);
            throw error;
        }
    },

    /**
     * Determine the GST rate for a given unit price based on configured slabs.
     * Slabs should be sorted by maxPrice ascending.
     */
    getGSTRate(slabs: GSTConfig['slabs'], unitPrice: number): number {
        // Sort slabs by maxPrice ascending
        const sorted = [...slabs].sort((a, b) => a.maxPrice - b.maxPrice);
        for (const slab of sorted) {
            if (unitPrice <= slab.maxPrice) {
                return slab.rate;
            }
        }
        // Fallback to the last (highest) slab rate
        return sorted[sorted.length - 1]?.rate ?? 12;
    },

    /**
     * Determine tax type (CGST+SGST vs IGST) based on seller and buyer state.
     */
    getTaxType(sellerState: string, buyerState: string): 'intra' | 'inter' {
        return sellerState.toLowerCase() === buyerState.toLowerCase() ? 'intra' : 'inter';
    },
};
