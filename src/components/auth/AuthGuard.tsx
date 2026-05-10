"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types/user";

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login");
            } else if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
                router.push("/"); // Redirect unauthorized role to home
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isAuthenticated || (allowedRoles && user?.role && !allowedRoles.includes(user.role))) {
        return null; // Prevent flash of content
    }

    return <>{children}</>;
}
