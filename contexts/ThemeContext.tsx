"use client";
import { Toaster } from "@/components/ui/sonner";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import { createContext, useContext, useState, useEffect } from "react";

export type ThemeColors = "gray" | "orange" | "green" | "blue";

type ThemeMode = "dark" | "light" | "system";
type Theme = {
  mode: ThemeMode;
  color: ThemeColors;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: { mode: "dark", color: "gray" },
  setTheme: () => null,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = { mode: "light", color: "gray" },
  storageKey = "distort-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [storedTheme, setStoredTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        setStoredTheme(parsedTheme);
      }
    } catch (error) {
      console.error("Failed to load theme from localStorage:", error);
    }
  }, [storageKey]);

  const value = {
    theme: storedTheme,
    setTheme: (theme: Theme) => {
      setStoredTheme(theme);
      try {
        localStorage.setItem(storageKey, JSON.stringify(theme));
      } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
      }
    },
  };

  if (storedTheme.mode === "system") {
    const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    return (
      <ThemeProviderContext.Provider {...props} value={value}>
        <body suppressHydrationWarning data-theme={`${storedTheme.color}-${systemMode}`}>
          {children}
          <Toaster expand visibleToasts={3} position="bottom-right" />
        </body>
      </ThemeProviderContext.Provider>
    );
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${storedTheme.mode} antialiased `}
        data-theme={`${storedTheme.color}-${storedTheme.mode}`}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </ThemeProviderContext.Provider>
  );
}

/**
 * Hook to get and set new theme throughout application
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
