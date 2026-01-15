/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
          light: "#60A5FA",
        },
        secondary: {
          DEFAULT: "#8B5CF6",
        },
        accent: {
          orange: "#F59E0B",
          green: "#10B981",
        },
        background: "#F9FAFB",
        surface: "#FFFFFF",
        text: {
          primary: "#111827",
          secondary: "#6B7280",
        },
        border: "#E5E7EB",
        dark: {
          background: "#0F172A",
          surface: "#1E293B",
          border: "#334155",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
      },
    },
  },
  plugins: [],
};
