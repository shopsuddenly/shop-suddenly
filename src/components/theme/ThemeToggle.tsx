"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent SSR mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" />; // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative w-10 h-10 rounded-full flex items-center justify-center",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-secondary/50 transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            )}
            aria-label="Toggle theme"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            {theme === "light" ? (
                <Moon className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
            ) : (
                <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
            )}
        </button>
    );
}
