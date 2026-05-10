"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            setIsLoading(true);
            await resetPassword(email);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/user-not-found') {
                setError("No account found with this email address.");
            } else if (err.code === 'auth/invalid-email') {
                setError("Please enter a valid email address.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center animate-fade-in">
                    <div className="bg-card border border-border p-8 md:p-12">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-serif text-3xl text-foreground mb-4">
                            Check Your Email
                        </h1>
                        <p className="text-muted-foreground text-sm mb-8">
                            We have sent a password reset link to <br />
                            <span className="font-semibold text-foreground">{email}</span>
                        </p>
                        <Link
                            href="/login"
                            className="btn-luxury w-full flex items-center justify-center gap-2"
                        >
                            <span>Back to Sign In</span>
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
                        Reset Password
                    </h1>
                    <p className="text-muted-foreground text-sm text-center mb-8">
                        Enter your email to receive instructions
                    </p>

                    <form onSubmit={handleReset} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-luxury disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </span>
                            ) : (
                                <span>Send Reset Link</span>
                            )}
                        </button>
                    </form>

                    {/* Back Link */}
                    <div className="mt-8 text-center pt-8 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Remember your password?{" "}
                            <Link href="/login" className="text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
