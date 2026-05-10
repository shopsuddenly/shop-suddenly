import { db } from "@/lib/firebase";
import { Address } from "@/types/user";
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

const COLLECTION_USERS = "users";
const SUBCOLLECTION_ADDRESSES = "addresses";

export const AddressService = {
    async getAddresses(userId: string): Promise<Address[]> {
        const ref = collection(db, COLLECTION_USERS, userId, SUBCOLLECTION_ADDRESSES);
        const snapshot = await getDocs(ref);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
    },

    async addAddress(userId: string, address: Omit<Address, "id">) {
        const ref = collection(db, COLLECTION_USERS, userId, SUBCOLLECTION_ADDRESSES);
        const newDocRef = doc(ref); // Auto-ID
        await setDoc(newDocRef, { ...address, id: newDocRef.id });
        return { ...address, id: newDocRef.id };
    },

    async updateAddress(userId: string, address: Address) {
        const ref = doc(db, COLLECTION_USERS, userId, SUBCOLLECTION_ADDRESSES, address.id);
        await setDoc(ref, address, { merge: true });
    },

    async deleteAddress(userId: string, addressId: string) {
        const ref = doc(db, COLLECTION_USERS, userId, SUBCOLLECTION_ADDRESSES, addressId);
        await deleteDoc(ref);
    },

    async setDefaultAddress(userId: string, addressId: string) {
        // This requires a batch: set isDefault=true for one, false for others
        // Simplified: Just update the specific doc for now, strictly speaking we should unset others.
        // Implementing strict toggle:
        const addresses = await this.getAddresses(userId);
        const updates = addresses.map(addr => {
            const ref = doc(db, COLLECTION_USERS, userId, SUBCOLLECTION_ADDRESSES, addr.id);
            return updateDoc(ref, { isDefault: addr.id === addressId });
        });
        await Promise.all(updates);
    }
};
