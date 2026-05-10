import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm rounded-full transition-all duration-300",
        variant === "default" && "bg-black text-white",
        variant === "gold" && "bg-[#D4AF37] text-white", // Classic Gold
        variant === "outline" && "border border-black text-black bg-white/50 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </span>
  );
}
