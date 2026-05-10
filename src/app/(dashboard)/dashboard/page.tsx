"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, Package } from "lucide-react";

export default function DashboardPage() {
    const { user, isAdmin, logout } = useAuth();
    const router = useRouter();

    // Safety check just in case
    if (!user) return null;

    return (
        <div className="container py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Account</h1>
                <Button variant="outline" onClick={() => {
                    logout(); // Fire and forget
                    window.location.href = '/';
                }}>Logout</Button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500">
                        {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user.displayName || "User"}</h2>
                        <p className="text-slate-500">{user.email}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            Role: {isAdmin ? "Admin" : "Customer"}
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="bg-slate-900 text-white p-6 rounded-lg flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                Admin Access
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">You have administrative privileges.</p>
                        </div>
                        <Link href="/admin">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                Go to Admin Panel
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-6 hover:bg-slate-50 transition-colors cursor-pointer block">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            My Orders
                        </h3>
                        <p className="text-sm text-slate-500">View your order history and track shipments.</p>
                    </div>
                    {/* More sections... */}
                </div>
            </div>
        </div>
    );
}
