"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useMessages } from "@/components/language";

export function ThemeToggle({
  className = "",
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
} = {}) {
  const m = useMessages();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  }

  const label = dark ? m.lightMode : m.darkMode;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={label}
      title={label}
      className={
        className ||
        "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-paper text-ink hover:bg-brand-soft"
      }
    >
      {dark ? <Sun className="h-4 w-4 shrink-0" aria-hidden /> : <Moon className="h-4 w-4 shrink-0" aria-hidden />}
      {showLabel ? <span>{label}</span> : null}
    </button>
  );
}
