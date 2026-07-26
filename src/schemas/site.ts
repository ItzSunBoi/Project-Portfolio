import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.url()]);
const optionalPath = z.union([
  z.literal(""),
  z.string().startsWith("/", "Expected an absolute site path"),
]);

export const siteSchema = z
  .object({
    name: z.string().trim().min(1),
    brandName: z.string().trim().min(1),
    domain: z.string().trim().min(1),
    baseUrl: z.url(),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    email: z.union([z.literal(""), z.email()]),
    github: optionalUrl,
    linkedin: optionalUrl,
    cvPath: optionalPath,
    defaultTheme: z.enum(["system", "light", "dark"]),
    footerLine: z.string().trim().min(1),
  })
  .strict();

export const navigationItemSchema = z
  .object({
    label: z.string().trim().min(1),
    href: z.string().startsWith("/"),
  })
  .strict();

export const skillGroupSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    skills: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export const timelineItemSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    relatedProjects: z.array(z.string().trim().min(1)),
  })
  .strict();

export const socialSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    url: z.url(),
    visible: z.boolean(),
  })
  .strict();

export type SiteConfig = z.infer<typeof siteSchema>;
export type NavigationItem = z.infer<typeof navigationItemSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type Social = z.infer<typeof socialSchema>;
