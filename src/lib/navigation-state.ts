const NAV_LINK_SELECTOR = "[data-nav-link]";
const HOME_PATH = "/";
const SECTION_HASH = "#skills";

type NavigationWindow = Pick<
  Window,
  "addEventListener" | "innerHeight" | "location" | "requestAnimationFrame"
>;

function normalizePathname(pathname: string) {
  if (pathname === HOME_PATH) return HOME_PATH;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function initializeNavigationState(
  doc: Document = document,
  currentWindow: NavigationWindow = window,
) {
  const links = Array.from(
    doc.querySelectorAll<HTMLAnchorElement>(NAV_LINK_SELECTOR),
  );

  if (links.length === 0) return null;

  const currentPathname = normalizePathname(currentWindow.location.pathname);
  const skillsSection = doc.getElementById("skills");
  const siteHeader = doc.querySelector<HTMLElement>("[data-site-header]");
  let frame = 0;

  const setActive = (pathname: string, hash = "") => {
    const normalizedPathname = normalizePathname(pathname);

    links.forEach((link) => {
      const matchesPath =
        normalizePathname(link.dataset.navPathname ?? HOME_PATH) ===
        normalizedPathname;
      const matchesHash = (link.dataset.navHash ?? "") === hash;
      const active = matchesPath && matchesHash;

      link.classList.toggle("is-active", active);

      if (active) {
        link.setAttribute("aria-current", hash ? "location" : "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const syncFromViewport = () => {
    if (currentPathname !== HOME_PATH || !skillsSection) {
      setActive(currentPathname);
      return;
    }

    const sectionBounds = skillsSection.getBoundingClientRect();
    const headerHeight = siteHeader?.getBoundingClientRect().height ?? 76;
    const activationLine =
      headerHeight + Math.min(currentWindow.innerHeight * 0.18, 150);
    const skillsIsCurrent =
      sectionBounds.top <= activationLine &&
      sectionBounds.bottom > activationLine;

    setActive(HOME_PATH, skillsIsCurrent ? SECTION_HASH : "");
  };

  const scheduleSync = () => {
    if (frame) return;

    frame = currentWindow.requestAnimationFrame(() => {
      frame = 0;
      syncFromViewport();
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const pathname = normalizePathname(link.dataset.navPathname ?? HOME_PATH);
      const hash = link.dataset.navHash ?? "";

      if (pathname === currentPathname) setActive(pathname, hash);
    });
  });

  currentWindow.addEventListener("scroll", scheduleSync, { passive: true });
  currentWindow.addEventListener("resize", scheduleSync);
  currentWindow.addEventListener("hashchange", scheduleSync);
  currentWindow.addEventListener("load", scheduleSync);

  if (
    currentPathname === HOME_PATH &&
    currentWindow.location.hash === SECTION_HASH
  ) {
    setActive(HOME_PATH, SECTION_HASH);
  } else {
    syncFromViewport();
  }

  scheduleSync();

  return {
    sync: syncFromViewport,
  };
}
