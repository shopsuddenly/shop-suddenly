"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function RegisterPageContent() {
    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // OTP State
    const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
    const [otp, setOtp] = useState("");

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { registerWithEmail } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Validate inputs
            if (!name || !email || !password) {
                throw new Error("All fields are required");
            }
            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters");
            }

            // Call API to send OTP
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send OTP");
            }

            toast.success("Verification code sent to your email");
            setStep('OTP');
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Verify OTP
            const verifyRes = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
                throw new Error(verifyData.error || "Invalid OTP");
            }

            // OTP Verified - Create Account
            await registerWithEmail(email, password, name); // Passing name to update profile

            // Send Welcome Email
            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'welcome',
                        userEmail: email,
                        userName: name
                    })
                });
            } catch (emailErr) {
                console.error("Failed to send welcome email", emailErr);
                // Don't block flow for this
            }

            toast.success("Account created successfully!");
            router.push(redirectUrl);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>{step === 'DETAILS' ? 'Create Account' : 'Verify Email'}</CardTitle>
                    <CardDescription>
                        {step === 'DETAILS'
                            ? 'Enter your details to get started'
                            : `Enter the code sent to ${email}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 'DETAILS' ? (
                        <form onSubmit={handleSendOtp}>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                            <Button className="w-full mt-4" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {loading ? 'Sending Code...' : 'Sign Up'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyAndRegister}>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="otp">Verification Code</Label>
                                    <Input
                                        id="otp"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        className="text-center text-lg tracking-widest"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                            <Button className="w-full mt-4" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {loading ? 'Creating Account...' : 'Verify & Create Account'}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full mt-2"
                                onClick={() => setStep('DETAILS')}
                                disabled={loading}
                                type="button"
                            >
                                Back
                            </Button>
                        </form>
                    )}
                </CardContent>
                {step === 'DETAILS' && (
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-slate-500">
                            Already have an account? <Link href="/login" className="underline">Login</Link>
                        </p>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RegisterPageContent />
        </Suspense>
    );
}
