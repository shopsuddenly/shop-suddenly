"use client";

import { Truck, RotateCcw, ShieldCheck, BadgeCheck } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Free Delivery",
    subtitle: "On orders above ₹999",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    subtitle: "7-day hassle-free returns",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    subtitle: "100% safe & encrypted",
  },
  {
    icon: BadgeCheck,
    title: "100% Authentic",
    subtitle: "Genuine products only",
  },
];

export function TrustBadges() {
  return (
    <section className="py-14 md:py-20 bg-secondary/30 border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-background border border-border shadow-soft flex items-center justify-center mb-4 group-hover:border-primary/30 group-hover:shadow-soft-lg transition-all duration-300">
                  <Icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <h4 className="text-sm font-bold tracking-tight mb-1">
                  {badge.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {badge.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
