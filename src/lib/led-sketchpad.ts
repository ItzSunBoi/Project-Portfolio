export const ledColumns = 15;
export const ledRows = 11;

export const ledPalette = {
  green: { label: "Green", hex: "#a6ee69" },
  gold: { label: "Gold", hex: "#ffd447" },
  "light-blue": { label: "Light Blue", hex: "#78dffa" },
  "dark-blue": { label: "Dark Blue", hex: "#547cff" },
  purple: { label: "Purple", hex: "#cb89ff" },
  white: { label: "White", hex: "#ffffff" },
} as const;

export type LedColour = keyof typeof ledPalette;
export const defaultLedColour: LedColour = "green";

const sunPattern = [
  "000000010000000",
  "000100010001000",
  "000010000010000",
  "000001111100000",
  "000011111110000",
  "011011111110110",
  "000011111110000",
  "000001111100000",
  "000010000010000",
  "000100010001000",
  "000000010000000",
].join("");

const arrowOffsets: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function isLedColour(value: string): value is LedColour {
  return Object.hasOwn(ledPalette, value);
}

export function sunHasPixel(index: number): boolean {
  return sunPattern[index] === "1";
}

export function ledPixelLabel(
  index: number,
  colour: LedColour | undefined,
): string {
  const row = Math.floor(index / ledColumns) + 1;
  const column = (index % ledColumns) + 1;
  return `Row ${row}, column ${column}${colour ? `, ${ledPalette[colour].label}` : ""}`;
}

export function nextLedPixel(index: number, key: string): number | undefined {
  if (!Object.hasOwn(arrowOffsets, key)) return;
  const [columnOffset, rowOffset] = arrowOffsets[key];
  const column = Math.min(
    ledColumns - 1,
    Math.max(0, (index % ledColumns) + columnOffset),
  );
  const row = Math.min(
    ledRows - 1,
    Math.max(0, Math.floor(index / ledColumns) + rowOffset),
  );
  return row * ledColumns + column;
}

export function ledStroke(from: number, to: number): number[] {
  const column = from % ledColumns;
  const row = Math.floor(from / ledColumns);
  const deltaX = (to % ledColumns) - column;
  const deltaY = Math.floor(to / ledColumns) - row;
  const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

  return Array.from({ length: steps }, (_, index) => {
    const progress = (index + 1) / steps;
    const nextColumn = Math.round(column + progress * deltaX);
    const nextRow = Math.round(row + progress * deltaY);
    return nextRow * ledColumns + nextColumn;
  });
}
