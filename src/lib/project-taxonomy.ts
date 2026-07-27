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

export const projectCategoryLabels: Record<ProjectCategory, string> = {
  hardware: "Hardware",
  firmware: "Firmware",
  software: "Software",
  pcb: "PCB",
  robotics: "Robotics",
  "computer-vision": "Computer vision",
  manufacturing: "Manufacturing",
  web: "Web",
  embedded: "Embedded",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  completed: "Completed",
  active: "Active",
  experimental: "Experimental",
};
