import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "skillsight-theme-mode";

const isThemeMode = (value: string | null): value is ThemeMode =>
    value === "light" || value === "dark";

const detectSystemTheme = (): ThemeMode => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getStoredTheme = (): ThemeMode | null => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemeMode(stored) ? stored : null;
};

const applyTheme = (mode: ThemeMode) => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = mode;
};

const getInitialTheme = (): ThemeMode => {
    if (typeof document !== "undefined") {
        const activeTheme = document.documentElement.getAttribute("data-theme");
        if (isThemeMode(activeTheme)) return activeTheme;
    }
    return getStoredTheme() || detectSystemTheme();
};

export const useTheme = () => {
    const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

    useEffect(() => {
        const initialTheme = getStoredTheme() || detectSystemTheme();
        setTheme(initialTheme);
        applyTheme(initialTheme);
    }, []);

    const setMode = useCallback((mode: ThemeMode) => {
        setTheme(mode);
        applyTheme(mode);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, mode);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setMode(theme === "dark" ? "light" : "dark");
    }, [setMode, theme]);

    return {
        theme,
        isDark: theme === "dark",
        setTheme: setMode,
        toggleTheme,
    };
};

export const THEME_STORAGE_KEY = STORAGE_KEY;
