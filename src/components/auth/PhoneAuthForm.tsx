"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function PhoneAuthForm() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [error, setError] = useState("");
    const { setupRecaptcha, signInWithPhoneNumber, verifyOtp } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Initialize invisible recaptcha
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = setupRecaptcha("recaptcha-container");
        }
    }, [setupRecaptcha]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            const appVerifier = window.recaptchaVerifier;
            const result = await signInWithPhoneNumber(phoneNumber, appVerifier);
            setConfirmationResult(result);
            setStep('otp');
        } catch (err: any) {
            setError(err.message || "Failed to send OTP");
            console.error(err);
            // Reset captcha if needed
            window.recaptchaVerifier.render().then((widgetId: any) => {
                window.recaptchaVerifier.reset(widgetId);
            });
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            await verifyOtp(confirmationResult, otp);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Invalid OTP");
        }
    };

    return (
        <div className="space-y-4">
            <div id="recaptcha-container"></div>

            {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 555 555 5555"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                        <p className="text-xs text-slate-500">Include country code (e.g. +91)</p>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full">Send OTP</Button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full">Verify & Login</Button>
                    <Button
                        variant="ghost"
                        type="button"
                        className="w-full"
                        onClick={() => setStep('phone')}
                    >
                        Back to Phone Number
                    </Button>
                </form>
            )}
        </div>
    );
}

// Add types for window object
declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}
