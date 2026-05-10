import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    iconColor?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, iconColor = "text-primary" }: StatsCardProps) {
    return (
        <div className="bg-card p-6 border border-border/50 rounded-lg">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-muted-foreground text-xs font-sans uppercase tracking-luxury mb-2">
                        {title}
                    </h3>
                    <p className="text-3xl font-serif text-foreground mb-1">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground font-sans">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className={cn(
                            "mt-3 text-sm font-sans inline-flex items-center gap-1",
                            trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                            <span>{trend.isPositive ? "↑" : "↓"}</span>
                            <span>{Math.abs(trend.value).toFixed(1)}%</span>
                            <span className="text-muted-foreground">from last month</span>
                        </div>
                    )}
                </div>
                <div className={cn("p-3 rounded-lg bg-primary/10", iconColor)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
