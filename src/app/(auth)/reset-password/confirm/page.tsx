"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase"; // Direct import to avoid circular dependency if needed, or use service
import { AuthService } from "@/services/auth.service"; // Use Service
import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";

function ConfirmPasswordContent() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [email, setEmail] = useState("");

    const searchParams = useSearchParams();
    const router = useRouter();
    const oobCode = searchParams.get("oobCode");

    useEffect(() => {
        if (!oobCode) {
            setError("Invalid or missing reset code.");
            setIsVerifying(false);
            return;
        }

        // Verify the code on load
        AuthService.verifyPasswordResetCode(oobCode)
            .then((email) => {
                setEmail(email);
                setIsVerifying(false);
            })
            .catch((err) => {
                console.error(err);
                setError("This reset link is invalid or has expired.");
                setIsVerifying(false);
            });
    }, [oobCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (!oobCode) return;

        try {
            setError("");
            setIsLoading(true);
            await AuthService.confirmPasswordReset(oobCode, password);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error(err);
            setError("Failed to reset password. Please try again or request a new link.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-sans">Verifying link...</p>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center animate-fade-in">
                    <div className="bg-card border border-border p-8 md:p-12">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-serif text-3xl text-foreground mb-4">
                            Password Reset
                        </h1>
                        <p className="text-muted-foreground text-sm mb-8">
                            Your password has been successfully updated. You can now log in with your new password.
                        </p>
                        <Link
                            href="/login"
                            className="btn-luxury w-full flex items-center justify-center gap-2"
                        >
                            <span>Sign In</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="block text-center mb-12">
                    <span className="font-serif text-3xl text-foreground">Suddenly</span>
                </Link>

                {/* Card */}
                <div className="bg-card border border-border p-8 md:p-12">
                    <h1 className="font-serif text-3xl text-foreground text-center mb-2">
                        Set New Password
                    </h1>
                    <p className="text-muted-foreground text-sm text-center mb-8">
                        {email ? `for ${email}` : "Create a strong password for your account"}
                    </p>

                    {!error ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Password */}
                            <div>
                                <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent border border-border px-4 py-3 pr-12 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-luxury disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Resetting...
                                    </span>
                                ) : (
                                    <span>Reset Password</span>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded">
                                {error}
                            </div>
                            <Link href="/reset-password" className="text-primary hover:underline text-sm">
                                Request a new link
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ConfirmPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <ConfirmPasswordContent />
        </Suspense>
    );
}
