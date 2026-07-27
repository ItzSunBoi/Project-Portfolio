import { initializeMobileMenu } from "../lib/mobile-menu";
import { initializeNavigationState } from "../lib/navigation-state";

initializeMobileMenu();
initializeNavigationState();

const root = document.documentElement;
const themeButtons = document.querySelectorAll<HTMLButtonElement>(
  "[data-theme-toggle]",
);
const media = window.matchMedia("(prefers-color-scheme: dark)");

function currentTheme() {
  return root.dataset.theme === "dark" ? "dark" : "light";
}

function syncThemeButtons() {
  const theme = currentTheme();
  themeButtons.forEach((button) => {
    button.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
    button.title =
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  });
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch {
      // Local storage is a preference, not a structural dependency.
    }
    syncThemeButtons();
  });
});

const handleSystemThemeChange = () => {
  try {
    if (localStorage.getItem("portfolio-theme")) return;
  } catch {
    // A blocked storage API should still leave system theme support intact.
  }
  root.dataset.theme = media.matches ? "dark" : "light";
  syncThemeButtons();
};

const compatibleMedia = media as unknown as {
  addEventListener?: (name: string, listener: () => void) => void;
  addListener?: (listener: () => void) => void;
};

if (typeof compatibleMedia.addEventListener === "function") {
  compatibleMedia.addEventListener("change", handleSystemThemeChange);
} else if (typeof compatibleMedia.addListener === "function") {
  compatibleMedia.addListener(handleSystemThemeChange);
}

syncThemeButtons();

document
  .querySelectorAll<HTMLImageElement>("[data-project-image]")
  .forEach((image) => {
    const showFallback = () => {
      image.hidden = true;
      const fallback = image.nextElementSibling;
      if (fallback instanceof HTMLElement) fallback.hidden = false;
    };

    image.addEventListener("error", showFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) showFallback();
  });
