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

media.addEventListener("change", () => {
  try {
    if (localStorage.getItem("portfolio-theme")) return;
  } catch {
    // A blocked storage API should still leave system theme support intact.
  }
  root.dataset.theme = media.matches ? "dark" : "light";
  syncThemeButtons();
});

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

const mobileMenu =
  document.querySelector<HTMLDetailsElement>("[data-mobile-menu]");

document.querySelectorAll("[data-mobile-nav-link]").forEach((link) => {
  link.addEventListener("click", () => {
    if (mobileMenu) mobileMenu.open = false;
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileMenu?.open) mobileMenu.open = false;
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 960 && mobileMenu) mobileMenu.open = false;
});
