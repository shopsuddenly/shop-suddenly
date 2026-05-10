import Link from "next/link";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    actionLink?: string;
}

export function EmptyState({
    title,
    description,
    icon,
    actionLabel,
    actionLink,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
            {icon && (
                <div className="mb-6 text-muted-foreground">{icon}</div>
            )}
            <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
                {title}
            </h3>
            {description && (
                <p className="text-muted-foreground font-sans text-sm max-w-md mb-8">
                    {description}
                </p>
            )}
            {actionLabel && actionLink && (
                <Link href={actionLink} className="btn-luxury-outline">
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
