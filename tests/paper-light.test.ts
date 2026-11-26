import { describe, expect, it, vi } from "vitest";
import { initializePaperLight } from "../src/lib/paper-light";

function paperLightLayer() {
  const variables = new Map<string, string>();
  const attributes = new Map<string, string>();
  const light = {
    style: { setProperty: variables.set.bind(variables) },
    setAttribute: attributes.set.bind(attributes),
    removeAttribute: attributes.delete.bind(attributes),
  };
  return { attributes, light, variables };
}

function fixture() {
  const layers = [paperLightLayer(), paperLightLayer()];
  const documentElement = new EventTarget();
  const doc = {
    documentElement,
    querySelectorAll: () => layers.map(({ light }) => light),
  };
  const media = Object.assign(new EventTarget(), { matches: true });
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  const currentWindow = Object.assign(new EventTarget(), {
    matchMedia: vi.fn(() => media),
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    }),
    cancelAnimationFrame: vi.fn((frame: number) => frames.delete(frame)),
  });
  const flush = () => {
    for (const [id, callback] of frames) {
      frames.delete(id);
      callback(0);
    }
  };
  const move = (pointerType: string, clientX: number, clientY: number) => {
    currentWindow.dispatchEvent(
      Object.assign(new Event("pointermove"), {
        pointerType,
        clientX,
        clientY,
      }),
    );
  };

  initializePaperLight(
    doc as unknown as Document,
    currentWindow as unknown as Window,
  );

  return {
    currentWindow,
    documentElement,
    flush,
    layers,
    media,
    move,
  };
}

describe("paper lighting", () => {
  it("moves the page and header lighting together once per animation frame", () => {
    const { currentWindow, flush, layers, move } = fixture();

    move("mouse", 100, 150);
    move("mouse", 800, 450);
    expect(currentWindow.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(
      layers.every(({ attributes }) => !attributes.has("data-visible")),
    ).toBe(true);

    flush();
    for (const { variables, attributes } of layers) {
      expect(variables.get("--paper-light-x")).toBe("800px");
      expect(variables.get("--paper-light-y")).toBe("450px");
      expect(attributes.has("data-visible")).toBe(true);
    }
  });

  it("keeps the texture still for touch and reduced motion", () => {
    const { currentWindow, flush, layers, media, move } = fixture();

    expect(currentWindow.matchMedia).toHaveBeenCalledWith(
      expect.stringContaining("prefers-reduced-motion: no-preference"),
    );
    move("mouse", 80, 60);
    flush();
    expect(
      layers.every(({ attributes }) => attributes.has("data-visible")),
    ).toBe(true);

    media.matches = false;
    media.dispatchEvent(new Event("change"));
    move("mouse", 250, 100);
    flush();
    expect(
      layers.every(({ attributes }) => !attributes.has("data-visible")),
    ).toBe(true);

    media.matches = true;
    media.dispatchEvent(new Event("change"));
    move("touch", 700, 450);
    expect(currentWindow.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it("hides the light when the pointer leaves or the window loses focus", () => {
    const { currentWindow, documentElement, flush, layers, move } = fixture();

    move("mouse", 10, 10);
    documentElement.dispatchEvent(new Event("pointerleave"));
    flush();
    expect(currentWindow.cancelAnimationFrame).toHaveBeenCalledOnce();
    expect(
      layers.every(({ attributes }) => !attributes.has("data-visible")),
    ).toBe(true);

    move("mouse", 100, 400);
    flush();
    expect(
      layers.every(({ attributes }) => attributes.has("data-visible")),
    ).toBe(true);
    currentWindow.dispatchEvent(new Event("blur"));
    expect(
      layers.every(({ attributes }) => !attributes.has("data-visible")),
    ).toBe(true);
  });
});
