/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Bright, Student-Friendly Primary Colors
        primary: {
          DEFAULT: "#2563EB", // Vibrant Blue
          dark: "#1D4ED8",
          light: "#3B82F6",
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        secondary: {
          DEFAULT: "#7C3AED", // Purple
          dark: "#6D28D9",
          light: "#8B5CF6",
          50: "#F5F3FF",
          100: "#EDE9FE",
          500: "#7C3AED",
          600: "#6D28D9",
        },
        accent: {
          orange: "#F97316", // Energetic Orange
          teal: "#14B8A6", // Success Teal
          pink: "#EC4899", // Friendly Pink
          yellow: "#EAB308", // Bright Yellow
          green: "#10B981", // Fresh Green
        },
        background: "#FAFBFC",
        surface: "#FFFFFF",
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
          light: "#9CA3AF",
        },
        border: "#E5E7EB",
        dark: {
          background: "#0F172A",
          surface: "#1E293B",
          border: "#334155",
          text: "#F1F5F9",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
        "gradient-accent": "linear-gradient(135deg, #F97316 0%, #EAB308 100%)",
        "gradient-teal": "linear-gradient(135deg, #14B8A6 0%, #10B981 100%)",
        "gradient-soft":
          "linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 50%, #FDF2F8 100%)",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        "card-hover":
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px rgba(37, 99, 235, 0.3)",
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.3)",
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
