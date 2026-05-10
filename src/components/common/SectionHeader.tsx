import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground font-sans text-sm md:text-base max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
