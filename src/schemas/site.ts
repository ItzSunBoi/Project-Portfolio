import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.url()]);

export const siteSchema = z
  .object({
    name: z.string().trim().min(1),
    brandName: z.string().trim().min(1),
    baseUrl: z.url(),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    defaultTheme: z.enum(["system", "light", "dark"]),
    footerLine: z.string().trim().min(1),
  })
  .strict();

export const contactSchema = z
  .object({
    email: z.email(),
    eyebrow: z.string().trim().min(1),
    title: z.string().trim().min(1),
    knownContact: z.string().trim().min(1),
    inquiryPrefix: z.string().trim().min(1),
    profilesTitle: z.string().trim().min(1),
    emptyProfilesMessage: z.string().trim().min(1),
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
    code: z
      .string()
      .trim()
      .regex(/^[A-Z]{2,4}$/),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    skills: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export const timelineItemSchema = z
  .object({
    id: z.string().trim().min(1),
    code: z
      .string()
      .trim()
      .regex(/^[A-Z]{2,4}$/),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    relatedProjects: z.array(z.string().trim().min(1)),
  })
  .strict();

export const socialSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    url: optionalUrl,
    visible: z.boolean(),
  })
  .refine((social) => !social.visible || social.url !== "", {
    message: "A visible profile must have a URL",
    path: ["url"],
  })
  .strict();

export type SiteConfig = z.infer<typeof siteSchema>;
export type ContactConfig = z.infer<typeof contactSchema>;
export type NavigationItem = z.infer<typeof navigationItemSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type Social = z.infer<typeof socialSchema>;
