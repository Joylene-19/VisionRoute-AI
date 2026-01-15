import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
      aria-label="Toggle dark mode"
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <Sun
          className={`absolute inset-0 text-yellow-500 transition-all duration-300 ${
            isDarkMode
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100"
          }`}
          size={24}
        />
        {/* Moon Icon */}
        <Moon
          className={`absolute inset-0 text-blue-400 transition-all duration-300 ${
            isDarkMode
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
          size={24}
        />
      </div>
    </button>
  );
};

export default DarkModeToggle;
