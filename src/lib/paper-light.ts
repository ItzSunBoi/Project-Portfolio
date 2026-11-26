export function initializePaperLight(
  doc: Pick<Document, "querySelectorAll" | "documentElement"> = document,
  currentWindow: Pick<
    Window,
    | "matchMedia"
    | "requestAnimationFrame"
    | "cancelAnimationFrame"
    | "addEventListener"
  > = window,
) {
  const lights = doc.querySelectorAll<HTMLElement>("[data-paper-light]");
  if (!lights.length) return;

  const media = currentWindow.matchMedia(
    "(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  let frame: number | undefined;
  let mouseX: number;
  let mouseY: number;

  const hide = () => {
    if (frame !== undefined) {
      currentWindow.cancelAnimationFrame(frame);
      frame = undefined;
    }
    lights.forEach((light) => light.removeAttribute("data-visible"));
  };

  currentWindow.addEventListener(
    "pointermove",
    (event) => {
      if (!media.matches || event.pointerType !== "mouse") return;

      mouseX = event.clientX;
      mouseY = event.clientY;

      if (frame !== undefined) return;
      frame = currentWindow.requestAnimationFrame(() => {
        frame = undefined;
        const x = `${mouseX}px`;
        const y = `${mouseY}px`;
        lights.forEach((light) => {
          light.style.setProperty("--paper-light-x", x);
          light.style.setProperty("--paper-light-y", y);
          light.setAttribute("data-visible", "");
        });
      });
    },
    { passive: true },
  );

  doc.documentElement.addEventListener("pointerleave", hide);
  currentWindow.addEventListener("blur", hide);
  media.addEventListener?.("change", hide);
}
