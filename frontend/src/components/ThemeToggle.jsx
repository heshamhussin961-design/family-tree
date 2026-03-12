import React from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, toggleTheme }) {
    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-xl transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/5 group overflow-hidden"
            title={theme === "dark" ? "الوضع المضيء" : "الوضع المظلم"}
        >
            <div className="relative w-6 h-6">
                <div
                    className={`absolute inset-0 transition-transform duration-500 ${theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
                        }`}
                >
                    <Moon size={24} className="text-accent" />
                </div>
                <div
                    className={`absolute inset-0 transition-transform duration-500 ${theme === "light" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                        }`}
                >
                    <Sun size={24} className="text-accent" />
                </div>
            </div>
        </button>
    );
}
