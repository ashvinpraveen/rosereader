"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "theme-preference";
const LIGHT_COLOR = "#f5f7fb";
const DARK_COLOR = "#151515";
const OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" }
];

function ThemeIcon({ mode }) {
  if (mode === "light") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="3.2" />
        <path d="M10 1.7v2.1M10 16.2v2.1M18.3 10h-2.1M3.8 10H1.7M15.8 4.2l-1.5 1.5M5.7 14.3l-1.5 1.5M15.8 15.8l-1.5-1.5M5.7 5.7L4.2 4.2" />
      </svg>
    );
  }

  if (mode === "dark") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M12.3 2.2a7.8 7.8 0 1 0 5.5 13.3A8.6 8.6 0 0 1 12.3 2.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="10.2" rx="1.8" />
      <path d="M8.1 16.5h3.8M10 13.8v2.7" />
    </svg>
  );
}

function setThemeColor(mode) {
  const darkPreferred =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const color = darkPreferred ? DARK_COLOR : LIGHT_COLOR;
  const themeColorTags = document.querySelectorAll('meta[name="theme-color"]');

  if (themeColorTags.length === 0) {
    const themeColorTag = document.createElement("meta");
    themeColorTag.setAttribute("name", "theme-color");
    themeColorTag.setAttribute("content", color);
    document.head.appendChild(themeColorTag);
    return;
  }

  themeColorTags.forEach((tag) => tag.setAttribute("content", color));
}

function applyTheme(mode) {
  const root = document.documentElement;

  if (mode === "system") {
    root.removeAttribute("data-theme");
    setThemeColor(mode);
    return;
  }

  root.setAttribute("data-theme", mode);
  setThemeColor(mode);
}

export default function ThemeToggle() {
  const pathname = usePathname();
  const [theme, setTheme] = useState("system");
  const [menuOpen, setMenuOpen] = useState(false);
  const dockRef = useRef(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initial = saved === "light" || saved === "dark" || saved === "system"
      ? saved
      : "system";

    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemThemeChange = () => {
      if (theme === "system") {
        setThemeColor("system");
      }
    };

    mediaQuery.addEventListener("change", onSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", onSystemThemeChange);
  }, [theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [pathname, theme]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onWindowPointerDown = (event) => {
      if (dockRef.current && !dockRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const onWindowKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", onWindowPointerDown);
    window.addEventListener("keydown", onWindowKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onWindowPointerDown);
      window.removeEventListener("keydown", onWindowKeyDown);
    };
  }, [menuOpen]);

  function onSelect(mode) {
    setTheme(mode);
    setMenuOpen(false);
    window.localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
  }

  const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[0];

  return (
    <div ref={dockRef} className="themeDock" role="group" aria-label="Theme toggle">
      <div className="themeDockDesktop">
        {OPTIONS.map((option) => {
          const active = option.value === theme;
          return (
            <button
              key={option.value}
              type="button"
              className={`themeButton ${active ? "themeButtonActive" : ""}`}
              onClick={() => onSelect(option.value)}
              aria-label={option.label}
              aria-pressed={active}
              title={option.label}
            >
              <span className="themeIconWrap">
                <ThemeIcon mode={option.value} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="themeDockMobile">
        <button
          type="button"
          className="themeMenuButton"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Theme options"
          onClick={() => setMenuOpen((open) => !open)}
          title={`Theme: ${current.label}`}
        >
          <span className="themeIconWrap">
            <ThemeIcon mode={current.value} />
          </span>
          <span className="themeMenuChevron" aria-hidden="true">
            v
          </span>
        </button>

        {menuOpen ? (
          <div className="themeMenu" role="menu" aria-label="Theme options">
            {OPTIONS.map((option) => {
              const active = option.value === theme;
              return (
                <button
                  key={`mobile-${option.value}`}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  aria-label={option.label}
                  className={`themeMenuItem ${active ? "themeMenuItemActive" : ""}`}
                  onClick={() => onSelect(option.value)}
                  title={option.label}
                >
                  <span className="themeIconWrap">
                    <ThemeIcon mode={option.value} />
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
