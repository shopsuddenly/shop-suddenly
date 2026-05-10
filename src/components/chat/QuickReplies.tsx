"use client";

interface QuickRepliesProps {
    options: string[];
    onSelect: (option: string) => void;
}

export function QuickReplies({ options, onSelect }: QuickRepliesProps) {
    if (!options || options.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(option)}
                    className="px-3 py-1.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors"
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
