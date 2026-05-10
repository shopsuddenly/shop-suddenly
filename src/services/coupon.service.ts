import { db } from "@/lib/firebase";
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc, serverTimestamp, query, where, updateDoc, increment } from "firebase/firestore";
import { Coupon } from "@/types/store";

export const CouponService = {
    async createCoupon(coupon: Omit<Coupon, 'createdAt' | 'usedCount'>) {
        // Validation: Check if code exists
        const q = query(collection(db, "coupons"), where("code", "==", coupon.code));
        const snap = await getDocs(q);
        if (!snap.empty) throw new Error("Coupon code already exists");

        const ref = doc(collection(db, "coupons"));
        const newCoupon: Coupon = {
            ...coupon,
            id: ref.id,
            usedCount: 0,
            createdAt: new Date().toISOString()
        };
        await setDoc(ref, newCoupon);
        return newCoupon;
    },

    async updateCoupon(id: string, updates: Partial<Coupon>) {
        await updateDoc(doc(db, "coupons", id), updates);
    },

    async deleteCoupon(id: string) {
        await deleteDoc(doc(db, "coupons", id));
    },

    async getCouponById(id: string): Promise<Coupon | null> {
        const snap = await getDoc(doc(db, "coupons", id));
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() } as Coupon;
    },

    async getAllCoupons(): Promise<Coupon[]> {
        const snap = await getDocs(collection(db, "coupons"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
    },

    async validateCoupon(code: string, cartTotal: number, userId?: string): Promise<Coupon> {
        const normalizedCode = code.toUpperCase();
        const q = query(
            collection(db, "coupons"),
            where("code", "==", normalizedCode)
        );
        const snap = await getDocs(q);

        if (snap.empty) throw new Error("Invalid coupon code");

        const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;

        if (!coupon.isActive) throw new Error("This coupon is no longer active");

        // Checks
        const now = new Date();
        if (new Date(coupon.startDate) > now) throw new Error("Coupon is not yet active");
        if (new Date(coupon.endDate) < now) throw new Error("Coupon has expired");

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new Error("Coupon usage limit reached");
        }

        // Per User Limit Check
        if (coupon.limitPerUser && userId) {
            const userUsageRef = doc(db, "users", userId, "coupon_usage", normalizedCode);
            const userUsageSnap = await getDoc(userUsageRef);
            if (userUsageSnap.exists()) {
                const usedCount = userUsageSnap.data().count || 0;
                if (usedCount >= coupon.limitPerUser) {
                    throw new Error(`You have already used this coupon ${coupon.limitPerUser} time(s)`);
                }
            }
        }

        if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
            throw new Error(`Minimum purchase of ₹${coupon.minPurchase} required`);
        }

        return coupon;
    },

    async incrementUsage(couponId: string, userId?: string, code?: string) {
        // Global Limit
        await updateDoc(doc(db, "coupons", couponId), {
            usedCount: increment(1)
        });

        // User Limit
        if (userId && code) {
            const normalizedCode = code.toUpperCase();
            const userUsageRef = doc(db, "users", userId, "coupon_usage", normalizedCode);
            await setDoc(userUsageRef, {
                count: increment(1),
                lastUsedAt: serverTimestamp()
            }, { merge: true });
        }
    }
};
