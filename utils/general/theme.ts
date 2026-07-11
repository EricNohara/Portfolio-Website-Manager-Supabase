export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

export function applyTheme(theme: Theme) {
  const root = document.documentElement; // <html>
  root.classList.toggle("dark-theme", theme === "dark");
}

export function setStoredTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function getStoredTheme(): Theme | null {
  const v = localStorage.getItem(THEME_KEY);
  return v === "dark" || v === "light" ? v : null;
}

// border radius
export type BorderRadius = "sharp" | "balanced" | "rounded";

const BORDER_RADII: Record<BorderRadius, string> = {
  sharp: "5px",
  balanced: "15px",
  rounded: "25px",
};

export function applyBorderRadius(radius: BorderRadius) {
  document.documentElement.style.setProperty(
    "--global-border-radius",
    BORDER_RADII[radius],
  );
}

export function setStoredBorderRadius(radius: BorderRadius) {
  localStorage.setItem("border-radius", radius);
}

export function getStoredBorderRadius(): BorderRadius | null {
  const value = localStorage.getItem("border-radius");
  if (value === "sharp" || value === "balanced" || value === "rounded") {
    return value;
  }
  return null;
}
