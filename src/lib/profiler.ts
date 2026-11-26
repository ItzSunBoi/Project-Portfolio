export const initialScan = 62;

export const profilerParts = [
  {
    id: "assembly",
    label: "Assembly",
    height: initialScan,
    description: "Sweep across the render or select a component to inspect it.",
  },
  {
    id: "pcb",
    label: "PCB",
    height: 16,
    description: "The custom circuit board sits above the top case.",
  },
  {
    id: "optics",
    label: "Optics",
    height: 49,
    description:
      "The OV9281 camera and two line lasers sit between the case halves.",
  },
  {
    id: "case",
    label: "Case",
    height: 69,
    description: "The two case halves hold the optics in place.",
  },
] as const;

export function getSweepHeight(value: number) {
  return Math.max(5, Math.min(95, Math.round(value)));
}
