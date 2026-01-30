"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/storyDefaults";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark" | null>(null);

    useEffect(() => {
        // Read from localStorage only after mount to avoid hydration mismatch
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        const initialTheme = saved === "dark" || saved === "light" ? saved : "light";
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(initialTheme);
    }, []);

    useEffect(() => {
        if (theme) {
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((t) => (t === "light" ? "dark" : "light"));
    };

    // Prevent flash or mismatch by rendering a placeholder or the same structure
    if (theme === null) {
        return (
            <button className="btn" aria-label="Basculer le thème" title="Basculer le thème">
                ...
            </button>
        );
    }

    return (
        <button
            className="btn"
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            title="Basculer le thème"
        >
            {theme === "light" ? "🌙 Mode nuit" : "☀️ Mode jour"}
        </button>
    );
}
