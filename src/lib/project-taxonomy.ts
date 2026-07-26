export const projectCategories = [
  "hardware",
  "firmware",
  "software",
  "pcb",
  "robotics",
  "computer-vision",
  "manufacturing",
  "web",
  "embedded",
] as const;

export const projectStatuses = ["completed", "active", "experimental"] as const;

export type ProjectCategory = (typeof projectCategories)[number];
export type ProjectStatus = (typeof projectStatuses)[number];
