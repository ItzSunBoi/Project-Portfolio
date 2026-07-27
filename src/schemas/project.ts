import { z } from "zod";
import { projectCategories, projectStatuses } from "../lib/project-taxonomy";

export { projectCategories, projectStatuses };

export const projectCategorySchema = z.enum(projectCategories);
export const projectStatusSchema = z.enum(projectStatuses);
export const projectVisibilitySchema = z.enum(["public", "draft", "hidden"]);

const localOrRemotePath = z
  .string()
  .refine(
    (value) => value.startsWith("/") || URL.canParse(value),
    "Expected an absolute site path or valid URL",
  );

const imageSchema = z
  .object({
    src: localOrRemotePath,
    alt: z.string().trim().min(1, "Image alt text is required"),
    caption: z.string().trim().optional(),
  })
  .strict();

const paragraphBlockSchema = z
  .object({
    type: z.literal("paragraph"),
    body: z.string().trim().min(1),
  })
  .strict();

const headingBlockSchema = z
  .object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    title: z.string().trim().min(1),
  })
  .strict();

const imageBlockSchema = imageSchema
  .extend({
    type: z.literal("image"),
  })
  .strict();

const galleryBlockSchema = z
  .object({
    type: z.literal("gallery"),
    images: z.array(imageSchema).min(1),
  })
  .strict();

const codeBlockSchema = z
  .object({
    type: z.literal("code"),
    language: z.string().trim().optional(),
    code: z.string().min(1),
  })
  .strict();

const quoteBlockSchema = z
  .object({
    type: z.literal("quote"),
    body: z.string().trim().min(1),
    attribution: z.string().trim().optional(),
  })
  .strict();

const calloutBlockSchema = z
  .object({
    type: z.literal("callout"),
    style: z.enum(["info", "warning", "success"]),
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
  })
  .strict();

const specificationTableBlockSchema = z
  .object({
    type: z.literal("specificationTable"),
    title: z.string().trim().min(1),
    rows: z
      .array(
        z
          .object({
            label: z.string().trim().min(1),
            value: z.string().trim().min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

const timelineBlockSchema = z
  .object({
    type: z.literal("timeline"),
    title: z.string().trim().min(1),
    items: z
      .array(
        z
          .object({
            title: z.string().trim().min(1),
            body: z.string().trim().min(1),
            date: z.string().trim().optional(),
            state: z.enum(["complete", "active", "planned"]).optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

const linkGroupBlockSchema = z
  .object({
    type: z.literal("linkGroup"),
    links: z
      .array(
        z
          .object({
            label: z.string().trim().min(1),
            url: z.url(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

const videoBlockSchema = z
  .object({
    type: z.literal("video"),
    src: localOrRemotePath,
    title: z.string().trim().min(1),
    poster: localOrRemotePath.optional(),
    caption: z.string().trim().optional(),
  })
  .strict();

const diagramBlockSchema = z
  .object({
    type: z.literal("diagram"),
    title: z.string().trim().optional(),
    description: z.string().trim().min(1),
    items: z.array(z.string().trim().min(1)).optional(),
  })
  .strict();

export const projectContentBlockSchema = z.discriminatedUnion("type", [
  paragraphBlockSchema,
  headingBlockSchema,
  imageBlockSchema,
  galleryBlockSchema,
  codeBlockSchema,
  quoteBlockSchema,
  calloutBlockSchema,
  specificationTableBlockSchema,
  timelineBlockSchema,
  linkGroupBlockSchema,
  videoBlockSchema,
  diagramBlockSchema,
]);

export const projectSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    slug: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(1),
    subtitle: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    category: projectCategorySchema,
    secondaryCategories: z.array(projectCategorySchema).default([]),
    status: projectStatusSchema,
    year: z.number().int().min(2000).max(2100),
    featured: z.boolean(),
    visibility: projectVisibilitySchema,
    thumbnail: localOrRemotePath.nullable(),
    thumbnailAlt: z.string().trim().min(1).nullable(),
    technologies: z.array(z.string().trim().min(1)).min(1),
    links: z
      .object({
        github: z.url().nullable(),
        demo: z.url().nullable(),
        documentation: z.url().nullable(),
      })
      .strict(),
    content: z.array(projectContentBlockSchema).default([]),
  })
  .strict()
  .superRefine((project, context) => {
    if (project.thumbnail && !project.thumbnailAlt) {
      context.addIssue({
        code: "custom",
        path: ["thumbnailAlt"],
        message: "Thumbnail alt text is required when a thumbnail is present",
      });
    }

    if (!project.thumbnail && project.thumbnailAlt) {
      context.addIssue({
        code: "custom",
        path: ["thumbnailAlt"],
        message:
          "Thumbnail alt text should be null when no thumbnail is present",
      });
    }

    if (project.featured && project.visibility === "hidden") {
      context.addIssue({
        code: "custom",
        path: ["visibility"],
        message: "A featured project cannot be hidden",
      });
    }

    if (project.secondaryCategories.includes(project.category)) {
      context.addIssue({
        code: "custom",
        path: ["secondaryCategories"],
        message: "The primary category should not be repeated",
      });
    }
  });

export const projectsSchema = z.array(projectSchema);

export type Project = z.infer<typeof projectSchema>;
export type ProjectCategory = z.infer<typeof projectCategorySchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectContentBlock = z.infer<typeof projectContentBlockSchema>;
