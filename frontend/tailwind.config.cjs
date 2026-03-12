/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Cairo"', '"Tajawal"', "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
      },
      colors: {
        primary: "#10b981",          /* green */
        "primary-dark": "#059669",
        "primary-light": "#34d399",
        accent: "#c5a059",           /* gold */
        "accent-dark": "#b48c48",
        "text-primary": "var(--text-primary)",   /* dynamic text */
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        card: "var(--bg-card)",      /* dynamic bg */
      },
    },
  },
  plugins: [],
};
