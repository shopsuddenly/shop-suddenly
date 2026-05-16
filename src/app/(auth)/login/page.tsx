"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import PhoneAuthForm from "@/components/auth/PhoneAuthForm";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function LoginPageContent() {
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const { loginWithEmail, loginWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            const user = await loginWithEmail(email, password);
            if (user?.role === 'admin') {
                router.push("/admin");
            } else {
                router.push(redirectUrl);
            }
        } catch (err: any) {
            // console.error("Login failed", err); // Removed to keep console clean
            if (err.code === 'auth/invalid-credential' || err.message.includes('invalid-credential')) {
                // Show Dialog instead of Toast
                setShowErrorDialog(true);
                setError("");
            } else {
                setError(err.message);
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError("");
            const user = await loginWithGoogle();
            if (user?.role === 'admin') {
                router.push("/admin");
            } else {
                router.push(redirectUrl);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 py-12 md:py-20">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="bg-card border border-border p-8 md:p-12">
                    <h1 className="font-serif text-3xl text-foreground text-center mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-sm text-center mb-8">
                        Sign in to access your account
                    </p>

                    {/* Method Toggle */}
                    <div className="flex justify-center gap-4 mb-6">
                        <button
                            onClick={() => setLoginMethod('email')}
                            className={`text-xs font-sans uppercase tracking-luxury pb-1 border-b-2 transition-colors ${loginMethod === 'email' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Email
                        </button>
                        <button
                            onClick={() => setLoginMethod('phone')}
                            className={`text-xs font-sans uppercase tracking-luxury pb-1 border-b-2 transition-colors ${loginMethod === 'phone' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Phone
                        </button>
                    </div>

                    {loginMethod === 'email' ? (
                        <>
                            <form onSubmit={handleEmailLogin} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border border-border px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-luxury text-muted-foreground mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-transparent border border-border px-4 py-3 pr-12 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-500">{error}</p>}

                                {/* Forgot Password */}
                                <div className="text-right">
                                    <Link
                                        href="/reset-password"
                                        className="text-xs font-sans text-primary hover:underline"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>

                                {/* Submit */}
                                <button type="submit" className="w-full btn-luxury">
                                    <span>Sign In</span>
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-8">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground">or</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {/* Social Login */}
                            <button onClick={handleGoogleLogin} className="w-full btn-luxury-outline mb-4">
                                Continue with Google
                            </button>
                        </>
                    ) : (
                        <div className="py-4">
                            <PhoneAuthForm />
                        </div>
                    )}

                    {/* Register Link */}
                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-primary hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <p className="text-center mt-8">
                    <Link
                        href="/"
                        className="text-xs font-sans uppercase tracking-luxury text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Back to Store
                    </Link>
                </p>

                {/* Error Dialog */}
                <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                    <DialogContent className="sm:max-w-md backdrop-blur-sm bg-white/90 dark:bg-zinc-950/90 border-zinc-200 dark:border-zinc-800">
                        <DialogHeader>
                            <DialogTitle>User Not Found</DialogTitle>
                            <DialogDescription>
                                We couldn't find an account with that email. Would you like to create one?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-4">
                            <Button
                                className="w-full bg-black text-white hover:bg-zinc-800"
                                onClick={() => router.push('/register')}
                            >
                                Register Now
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/reset-password')}
                            >
                                Forgot Password
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    );
}
