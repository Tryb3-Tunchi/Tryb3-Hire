"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-md border border-main bg-card 
                 flex items-center justify-center cursor-pointer 
                 hover:bg-hover transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={14} className="text-secondary" />
      ) : (
        <Moon size={14} className="text-secondary" />
      )}
    </button>
  );
}
