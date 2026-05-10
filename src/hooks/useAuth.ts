import { useAuthStore } from "@/store/auth.store";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = () => {
    const { user, isLoading } = useAuthStore();

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        ...AuthService
    };
};

export const useUserRole = () => {
    const { user } = useAuthStore();
    return user?.role;
};

export const useRequireAuth = (redirectUrl = "/login") => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push(redirectUrl);
        }
    }, [user, isLoading, router, redirectUrl]);

    return { user, isLoading };
};
