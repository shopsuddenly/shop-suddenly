"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const messages = [
  "Free shipping on orders above ₹999",
  "New arrivals every week — shop the latest drops",
  "Use code SUDDENLY10 for 10% off your first order",
  "Easy 7-day returns on all products",
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative z-50 bg-foreground text-background">
      <div className="container flex items-center justify-center py-2.5 px-4 relative">
        <p
          className={cn(
            "text-[11px] font-medium tracking-widest uppercase text-center transition-all duration-300",
            isAnimating ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          )}
        >
          {messages[currentIndex]}
        </p>

        {/* Dot indicators */}
        <div className="hidden sm:flex items-center gap-1.5 absolute right-12">
          {messages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                i === currentIndex ? "bg-background scale-125" : "bg-background/40"
              )}
            />
          ))}
        </div>

        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 p-1 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
