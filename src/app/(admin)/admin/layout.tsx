import AdminLayout from "@/components/admin/AdminLayout";
import AuthGuard from "@/components/auth/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
    // We can add Admin Role Guard here later
    return (
        <AuthGuard allowedRoles={['admin']}>
            {/* Ideally check isAdmin inside AuthGuard or here */}
            <AdminLayout>{children}</AdminLayout>
        </AuthGuard>
    );
}
