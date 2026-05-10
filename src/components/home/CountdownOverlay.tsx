"use client";

import { useEffect, useState } from "react";
import { CountdownConfig } from "@/types/cms";
import { cn } from "@/lib/utils";

interface CountdownOverlayProps {
    config: CountdownConfig;
    onComplete?: () => void;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function CountdownOverlay({ config, onComplete }: CountdownOverlayProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(config.targetDate) - +new Date();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }

            return null;
        };

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            if (newTimeLeft) {
                setTimeLeft(newTimeLeft);
            } else {
                clearInterval(timer);
                if (onComplete) {
                    onComplete();
                } else {
                    // Default behavior: Reload page to fetch server content
                    window.location.reload();
                }
            }
        }, 1000);

        // Initial calc
        const initial = calculateTimeLeft();
        if (initial) {
            setTimeLeft(initial);
        } else {
            // Already expired
            if (onComplete) {
                onComplete();
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setTimeout(() => window.location.reload(), 2000);
            }
        }

        return () => clearInterval(timer);
    }, [config.targetDate, onComplete]);

    if (!isClient) return null; // Prevent hydration mismatch

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white overflow-hidden">
            {/* Background Image with Overlay */}
            {config.backgroundImage && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={config.backgroundImage}
                        alt="Background"
                        className="w-full h-full object-cover opacity-60 scale-105 animate-in fade-in duration-1000"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl w-full animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150">
                <div className="mb-8 space-y-4">
                    <h2 className="text-sm md:text-base tracking-[0.3em] uppercase text-gray-400 font-light">
                        {config.subheading || "Coming Soon"}
                    </h2>
                    <h1 className="text-4xl md:text-7xl font-serif font-medium tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                        {config.title || "The Next Chapter"}
                    </h1>
                </div>

                {/* Counter */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 my-16">
                    <TimeBlock value={timeLeft.days} label="Day" />
                    <div className="h-12 w-px bg-white/10 hidden md:block" />
                    <TimeBlock value={timeLeft.hours} label="Hour" />
                    <div className="h-12 w-px bg-white/10 hidden md:block" />
                    <TimeBlock value={timeLeft.minutes} label="Min" />
                    <div className="h-12 w-px bg-white/10 hidden md:block" />
                    <TimeBlock value={timeLeft.seconds} label="Sec" />
                </div>

                {/* Subscription Card */}
                {config.showSubscribe && (
                    <div className="max-w-md mx-auto mt-12 mb-8">
                        <SubscriptionCard config={config} />
                    </div>
                )}

                {/* Footer / Brand */}
                <div className="mt-12 opacity-80">
                    <p className="text-xs tracking-widest uppercase text-white/50">Suddenly Exclusive</p>
                </div>
            </div>
        </div>
    );
}

function SubscriptionCard({ config }: { config: CountdownConfig }) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "launch_page" }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("You are on the list.");
            } else {
                setStatus("error");
                setMessage(data.error || "Something went wrong.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Failed to connect.");
        }
    };

    if (status === "success") {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-lg text-center animate-in fade-in zoom-in">
                <div className="text-green-400 mb-2">✓ Subscribed</div>
                <p className="text-sm text-white/70">{message}</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-lg text-left transition-all hover:bg-white/10">
            <h3 className="text-lg font-serif mb-1 text-amber-50">{config.subscribeTitle || "Join the Waitlist"}</h3>
            <p className="text-sm text-white/60 mb-4">{config.subscribeMessage || "Get notified when we launch."}</p>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-200/50 transition-colors font-light"
                />
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="bg-white text-black px-6 py-2 rounded-sm text-sm font-serif tracking-wide hover:bg-amber-50 disabled:opacity-70 transition-colors uppercase"
                >
                    {status === "loading" ? "..." : (config.subscribeButtonText || "Notify Me")}
                </button>
            </form>
            {status === "error" && <p className="text-xs text-red-400 mt-2">{message}</p>}
        </div>
    );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-5xl md:text-8xl font-serif font-medium tabular-nums leading-none tracking-tight text-amber-50 drop-shadow-2xl">
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-amber-100/60 mt-4 font-medium">
                {label}
            </span>
        </div>
    );
}
