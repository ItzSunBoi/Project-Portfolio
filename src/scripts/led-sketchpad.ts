import {
  defaultLedColour,
  isLedColour,
  ledPalette,
  ledPixelLabel,
  ledStroke,
  nextLedPixel,
  sunHasPixel,
  type LedColour,
} from "../lib/led-sketchpad";

function initializeSketchpad(sketchpad: HTMLElement): void {
  const board = sketchpad.querySelector<HTMLElement>("[data-led-board]");
  const status = sketchpad.querySelector<HTMLElement>("[data-led-status]");
  if (!board || !status) return;

  const pixels = [
    ...board.querySelectorAll<HTMLButtonElement>("[data-led-index]"),
  ];
  let current = board.querySelector<HTMLButtonElement>('[tabindex="0"]');
  let brush = defaultLedColour;
  let stroke:
    { pointerId: number; index: number; colour?: LedColour } | undefined;

  function getPixel(target: EventTarget | null): HTMLButtonElement | undefined {
    if (!(target instanceof HTMLButtonElement) || !board?.contains(target))
      return;
    return target.dataset.ledIndex === undefined ? undefined : target;
  }

  function setPixel(index: number, colour?: LedColour): void {
    const pixel = pixels[index];
    if (!pixel || pixel.dataset.ledColour === colour) return;

    if (colour) {
      pixel.dataset.ledColour = colour;
    } else {
      delete pixel.dataset.ledColour;
    }
    pixel.setAttribute("aria-pressed", String(Boolean(colour)));
    pixel.setAttribute("aria-label", ledPixelLabel(index, colour));
  }

  function setCurrent(pixel: HTMLButtonElement): void {
    if (pixel === current) return;
    if (current) current.tabIndex = -1;
    pixel.tabIndex = 0;
    current = pixel;
  }

  function strokeColour(pixel: HTMLButtonElement): LedColour | undefined {
    return pixel.dataset.ledColour === brush ? undefined : brush;
  }

  const checkedRadio = sketchpad.querySelector<HTMLInputElement>(
    'input[type="radio"]:checked',
  );
  if (checkedRadio && isLedColour(checkedRadio.value))
    brush = checkedRadio.value;

  sketchpad.addEventListener("change", (event) => {
    const option = event.target;
    if (
      option instanceof HTMLInputElement &&
      option.checked &&
      isLedColour(option.value)
    ) {
      brush = option.value;
    }
  });

  sketchpad.querySelector("[data-led-sun]")?.addEventListener("click", () => {
    pixels.forEach((_, index) =>
      setPixel(index, sunHasPixel(index) ? brush : undefined),
    );
    status.textContent = `Sun drawn in ${ledPalette[brush].label.toLowerCase()}.`;
  });

  sketchpad.querySelector("[data-led-clear]")?.addEventListener("click", () => {
    pixels.forEach((_, index) => setPixel(index));
    status.textContent = "Display cleared.";
  });

  board.addEventListener("focusin", (event) => {
    const pixel = getPixel(event.target);
    if (pixel) setCurrent(pixel);
  });

  board.addEventListener("keydown", (event) => {
    const pixel = getPixel(event.target);
    if (!pixel) return;
    const next = nextLedPixel(Number(pixel.dataset.ledIndex), event.key);
    if (next === undefined) return;
    event.preventDefault();
    pixels[next].focus({ preventScroll: true });
  });

  board.addEventListener("click", (event) => {
    const pixel = getPixel(event.target);
    if (pixel && event.detail === 0) {
      setPixel(Number(pixel.dataset.ledIndex), strokeColour(pixel));
    }
  });

  board.addEventListener("pointerdown", (event) => {
    const pixel = getPixel(event.target);
    if (!pixel || event.button !== 0 || stroke) return;
    event.preventDefault();
    pixel.focus({ preventScroll: true });
    const index = Number(pixel.dataset.ledIndex);
    stroke = { pointerId: event.pointerId, index, colour: strokeColour(pixel) };
    board.setPointerCapture(event.pointerId);
    setPixel(index, stroke.colour);
  });

  board.addEventListener("pointermove", (event) => {
    if (!stroke || stroke.pointerId !== event.pointerId) return;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const pixel = getPixel(target);
    if (!pixel) return;
    const targetIndex = Number(pixel.dataset.ledIndex);
    const colour = stroke.colour;
    for (const index of ledStroke(stroke.index, targetIndex))
      setPixel(index, colour);
    stroke.index = targetIndex;
  });

  function finishStroke(event: PointerEvent): void {
    if (event.pointerId === stroke?.pointerId) stroke = undefined;
  }

  board.addEventListener("pointerup", finishStroke);
  board.addEventListener("pointercancel", finishStroke);
  board.addEventListener("lostpointercapture", finishStroke);
}

document
  .querySelectorAll<HTMLElement>("[data-led-sketchpad]")
  .forEach(initializeSketchpad);
