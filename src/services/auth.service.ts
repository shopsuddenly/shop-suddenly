import { auth, db } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    verifyPasswordResetCode,
    confirmPasswordReset,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { AppUser, UserRole } from "@/types/user";

const CACHE_KEY_PREFIX = 'suddenly_user_v1_';

const googleProvider = new GoogleAuthProvider();

// Mock User removed
// Mocking logic has been stripped out. Auth errors will now throw as expected.

export const AuthService = {
    async syncUserToFirestore(user: User): Promise<AppUser> {
        try {
            // Check session cache first
            if (typeof window !== 'undefined') {
                try {
                    const cached = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${user.uid}`);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        // Basic validity check
                        if (parsed && parsed.uid === user.uid) {
                            console.log('⚡ Using Cached User Profile');
                            return parsed as AppUser;
                        }
                    }
                } catch (e) {
                    console.warn("Cache read failed", e);
                }
            }

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            let role: UserRole = 'customer';

            if (userSnap.exists()) {
                role = userSnap.data().role as UserRole;
            } else {
                // Create new user doc
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    role: 'customer',
                    createdAt: new Date().toISOString()
                });
            }

            const appUser: AppUser = { ...user, role };

            // Save to Session Cache
            if (typeof window !== 'undefined') {
                try {
                    sessionStorage.setItem(`${CACHE_KEY_PREFIX}${user.uid}`, JSON.stringify(appUser));
                } catch (e) {
                    // Ignore storage errors
                }
            }

            return appUser;
        } catch (error) {
            console.error("AuthService (sync) failed:", error);
            // If Firestore is down, we can attempt to return the user with a default role
            // This is a resilience fallback, not a mock fallback.
            return { ...user, role: 'customer' } as AppUser;
        }
    },

    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return AuthService.syncUserToFirestore(result.user);
        } catch (error: any) {
            console.error("AuthService (Google) failed:", error);
            throw error;
        }
    },

    async loginWithEmail(email: string, pass: string) {
        try {
            const result = await signInWithEmailAndPassword(auth, email, pass);
            return AuthService.syncUserToFirestore(result.user);
        } catch (error: any) {
            // For normal errors (wrong password, user not found), just throw
            console.error("AuthService (Email) failed:", error);
            throw error;
        }
    },

    async registerWithEmail(email: string, pass: string, name?: string) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, pass);

            // Update Auth Profile if name is provided
            if (name) {
                try {
                    // Dynamic import to avoid circular dependencies if any, though updateProfile is from firebase/auth
                    const { updateProfile } = await import("firebase/auth");
                    await updateProfile(result.user, { displayName: name });
                    // Reload user to refresh the object
                    await result.user.reload();
                } catch (e) {
                    console.error("Failed to update profile name", e);
                }
            }

            // Manually sync cleanly instead of relying on the implicit sync in login
            // because strict sync might overwrite provided name if waiting for auth state change
            const userRef = doc(db, "users", result.user.uid);
            await setDoc(userRef, {
                uid: result.user.uid,
                email: result.user.email,
                displayName: name || result.user.displayName, // Prioritize provided name
                photoURL: result.user.photoURL,
                role: 'customer',
                createdAt: new Date().toISOString()
            });

            return { ...result.user, role: 'customer', displayName: name || result.user.displayName } as AppUser;

        } catch (error: any) {
            console.error("AuthService (Register) failed:", error);
            throw error;
        }
    },

    async logout() {
        try {
            // Sign out from Firebase
            // Clear all session storage on logout (includes cache)
            if (typeof window !== 'undefined') {
                sessionStorage.clear();
            }
            await signOut(auth);
        } catch (error) {
            console.warn("Logout failed (likely already disconnected)", error);
        }
        // Note: Redirect should be handled by the calling component
        // This keeps the service clean and allows flexibility
    },

    async resetPassword(email: string) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            console.warn("Reset Password failed", error);
            throw error;
        }
    },

    async verifyPasswordResetCode(code: string) {
        try {
            return await verifyPasswordResetCode(auth, code);
        } catch (error: any) {
            console.warn("Verify Code failed", error);
            throw error;
        }
    },

    async confirmPasswordReset(code: string, newPass: string) {
        try {
            const result = await confirmPasswordReset(auth, code, newPass);
            // Optionally sign them in immediately? Not strictly required by Firebase, 
            // but often good UX. But confirmPasswordReset doesn't return user credential.
            // They usually have to login again.
        } catch (error: any) {
            console.warn("Confirm Reset failed", error);
            throw error;
        }
    },

    setupRecaptcha(containerId: string) {
        try {
            const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                }
            });
            return recaptchaVerifier;
        } catch (error) {
            console.warn("Recaptcha setup failed", error);
            return null;
        }
    },

    async signInWithPhoneNumber(phoneNumber: string, appVerifier: any) {
        try {
            return await signInWithPhoneNumber(auth, phoneNumber, appVerifier as RecaptchaVerifier);
        } catch (error: any) {
            console.error("Phone auth failed", error);
            throw error;
        }
    },

    async verifyOtp(confirmationResult: any, code: string) {
        const result = await confirmationResult.confirm(code);
        return AuthService.syncUserToFirestore(result.user);
    }
};
