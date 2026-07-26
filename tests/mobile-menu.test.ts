import { describe, expect, it } from "vitest";
import { initializeMobileMenu } from "../src/lib/mobile-menu";

type Listener = (event: { key?: string }) => void;

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

class FakeElement {
  dataset: Record<string, string> = {};
  hidden = false;
  classList = new FakeClassList();
  focused = false;
  attributes = new Map<string, string>();
  listeners = new Map<string, Listener[]>();
  children = new Map<string, FakeElement | FakeElement[]>();

  querySelector(selector: string) {
    return this.children.get(selector) ?? null;
  }

  querySelectorAll(selector: string) {
    const value = this.children.get(selector);
    return Array.isArray(value) ? value : [];
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  addEventListener(name: string, listener: Listener) {
    const listeners = this.listeners.get(name) ?? [];
    listeners.push(listener);
    this.listeners.set(name, listeners);
  }

  dispatch(name: string, event: { key?: string } = {}) {
    this.listeners.get(name)?.forEach((listener) => listener(event));
  }

  focus() {
    this.focused = true;
  }
}

function fixture() {
  const body = new FakeElement();
  const menu = new FakeElement();
  const toggle = new FakeElement();
  const panel = new FakeElement();
  const link = new FakeElement();
  const documentRoot = new FakeElement();
  const windowRoot = new FakeElement() as FakeElement & { innerWidth: number };

  menu.dataset.open = "false";
  menu.children.set("[data-mobile-menu-toggle]", toggle);
  menu.children.set("[data-mobile-nav-panel]", panel);
  menu.children.set("[data-mobile-nav-link]", [link]);
  documentRoot.children.set("[data-mobile-menu]", menu);
  Object.assign(documentRoot, { body });
  windowRoot.innerWidth = 390;

  const controller = initializeMobileMenu(
    documentRoot as unknown as Document,
    windowRoot as unknown as Window,
  );

  return {
    body,
    controller,
    documentRoot,
    link,
    menu,
    panel,
    toggle,
    windowRoot,
  };
}

describe("mobile navigation", () => {
  it("opens and closes from the menu button", () => {
    const { body, controller, menu, panel, toggle } = fixture();

    expect(controller?.isOpen()).toBe(false);
    expect(panel.hidden).toBe(true);

    toggle.dispatch("click");

    expect(controller?.isOpen()).toBe(true);
    expect(menu.dataset.open).toBe("true");
    expect(panel.hidden).toBe(false);
    expect(toggle.attributes.get("aria-expanded")).toBe("true");
    expect(toggle.attributes.get("aria-label")).toBe("Close navigation");
    expect(body.classList.contains("mobile-menu-open")).toBe(true);

    toggle.dispatch("click");

    expect(controller?.isOpen()).toBe(false);
    expect(panel.hidden).toBe(true);
    expect(toggle.attributes.get("aria-expanded")).toBe("false");
  });

  it("closes after navigation, Escape, or returning to desktop", () => {
    const { controller, documentRoot, link, toggle, windowRoot } = fixture();

    controller?.setOpen(true);
    link.dispatch("click");
    expect(controller?.isOpen()).toBe(false);

    controller?.setOpen(true);
    documentRoot.dispatch("keydown", { key: "Escape" });
    expect(controller?.isOpen()).toBe(false);
    expect(toggle.focused).toBe(true);

    controller?.setOpen(true);
    windowRoot.innerWidth = 1200;
    windowRoot.dispatch("resize");
    expect(controller?.isOpen()).toBe(false);
  });
});
