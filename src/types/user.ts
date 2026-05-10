import { User } from "firebase/auth";

export type UserRole = 'admin' | 'customer';

export interface AppUser extends User {
    role?: UserRole;
}

export interface UserDocument {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    createdAt: string; // ISO String
}

export interface Address {
    id: string;
    uid: string;
    name: string; // Receiver's name
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault?: boolean;
    type: 'shipping' | 'billing';
}
