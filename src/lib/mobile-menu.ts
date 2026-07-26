export function initializeMobileMenu(
  doc: Document = document,
  currentWindow: Window = window,
) {
  const menu = doc.querySelector<HTMLElement>("[data-mobile-menu]");
  const toggle = menu?.querySelector<HTMLButtonElement>(
    "[data-mobile-menu-toggle]",
  );
  const panel = menu?.querySelector<HTMLElement>("[data-mobile-nav-panel]");

  if (!menu || !toggle || !panel) return null;

  const setOpen = (open: boolean) => {
    menu.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    panel.hidden = !open;
    doc.body.classList.toggle("mobile-menu-open", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(menu.dataset.open !== "true");
  });

  menu.querySelectorAll("[data-mobile-nav-link]").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  doc.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || menu.dataset.open !== "true") return;

    setOpen(false);
    toggle.focus();
  });

  currentWindow.addEventListener("resize", () => {
    if (currentWindow.innerWidth > 960) setOpen(false);
  });

  setOpen(false);

  return {
    isOpen: () => menu.dataset.open === "true",
    setOpen,
  };
}
