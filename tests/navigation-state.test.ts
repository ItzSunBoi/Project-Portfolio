import { describe, expect, it } from "vitest";
import { initializeNavigationState } from "../src/lib/navigation-state";

type Listener = () => void;

class FakeClassList {
  private values = new Set<string>();

  toggle(name: string, force: boolean) {
    if (force) this.values.add(name);
    else this.values.delete(name);
  }

  contains(name: string) {
    return this.values.has(name);
  }
}

class FakeLink {
  dataset: Record<string, string>;
  classList = new FakeClassList();
  attributes = new Map<string, string>();
  listeners = new Map<string, Listener[]>();

  constructor(pathname: string, hash = "") {
    this.dataset = {
      navPathname: pathname,
      navHash: hash,
    };
  }

  addEventListener(name: string, listener: Listener) {
    const listeners = this.listeners.get(name) ?? [];
    listeners.push(listener);
    this.listeners.set(name, listeners);
  }

  dispatch(name: string) {
    this.listeners.get(name)?.forEach((listener) => listener());
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
}

function fixture(hash = "") {
  const homeDesktop = new FakeLink("/");
  const skillsDesktop = new FakeLink("/", "#skills");
  const homeMobile = new FakeLink("/");
  const skillsMobile = new FakeLink("/", "#skills");
  const links = [homeDesktop, skillsDesktop, homeMobile, skillsMobile];
  let sectionBounds = { top: 700, bottom: 1300 };

  const section = {
    getBoundingClientRect: () => ({
      ...sectionBounds,
      height: sectionBounds.bottom - sectionBounds.top,
    }),
  };
  const header = {
    getBoundingClientRect: () => ({ height: 76 }),
  };
  const documentRoot = {
    getElementById: (id: string) => (id === "skills" ? section : null),
    querySelector: (selector: string) =>
      selector === "[data-site-header]" ? header : null,
    querySelectorAll: (selector: string) =>
      selector === "[data-nav-link]" ? links : [],
  };
  const windowListeners = new Map<string, Listener[]>();
  const windowRoot = {
    innerHeight: 900,
    location: {
      pathname: "/",
      hash,
    },
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    },
    addEventListener: (name: string, listener: Listener) => {
      const listeners = windowListeners.get(name) ?? [];
      listeners.push(listener);
      windowListeners.set(name, listeners);
    },
  };

  const controller = initializeNavigationState(
    documentRoot as unknown as Document,
    windowRoot as unknown as Window,
  );

  return {
    controller,
    homeDesktop,
    homeMobile,
    setSectionBounds: (top: number, bottom: number) => {
      sectionBounds = { top, bottom };
    },
    skillsDesktop,
    skillsMobile,
  };
}

describe("section-aware navigation", () => {
  it("selects Home at the top of the home page", () => {
    const { homeDesktop, homeMobile, skillsDesktop, skillsMobile } = fixture();

    expect(homeDesktop.classList.contains("is-active")).toBe(true);
    expect(homeMobile.classList.contains("is-active")).toBe(true);
    expect(homeDesktop.attributes.get("aria-current")).toBe("page");
    expect(skillsDesktop.classList.contains("is-active")).toBe(false);
    expect(skillsMobile.classList.contains("is-active")).toBe(false);
  });

  it("selects Skills immediately when its island is clicked", () => {
    const { homeDesktop, skillsDesktop, skillsMobile } = fixture();

    skillsDesktop.dispatch("click");

    expect(homeDesktop.classList.contains("is-active")).toBe(false);
    expect(skillsDesktop.classList.contains("is-active")).toBe(true);
    expect(skillsMobile.classList.contains("is-active")).toBe(true);
    expect(skillsDesktop.attributes.get("aria-current")).toBe("location");
  });

  it("tracks the Skills section while scrolling and restores Home elsewhere", () => {
    const { controller, homeDesktop, setSectionBounds, skillsDesktop } =
      fixture("#skills");

    setSectionBounds(80, 900);
    controller?.sync();
    expect(skillsDesktop.classList.contains("is-active")).toBe(true);

    setSectionBounds(-900, -100);
    controller?.sync();
    expect(skillsDesktop.classList.contains("is-active")).toBe(false);
    expect(homeDesktop.classList.contains("is-active")).toBe(true);
  });
});
