import { cn } from "@/lib/utils";

interface TagPillProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TagPill({ children, active, onClick, className }: TagPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-xs font-sans uppercase tracking-luxury transition-all duration-300 border",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}
