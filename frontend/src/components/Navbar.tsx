import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function Navbar() {
  const { theme, toggle } = useTheme();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-brand/10 text-brand"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-sm text-white">JP</span>
          <span className="hidden sm:inline">JSONPlaceholder Explorer</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Feed</NavLink>
          <NavLink to="/users" className={linkClass}>Users</NavLink>
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="ml-2 rounded-md p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
