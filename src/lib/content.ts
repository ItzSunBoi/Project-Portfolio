import contactJson from "../content/contact.json";
import navigationJson from "../content/navigation.json";
import projectsJson from "../content/projects.json";
import siteJson from "../content/site.json";
import skillsJson from "../content/skills.json";
import socialsJson from "../content/socials.json";
import timelineJson from "../content/timeline.json";
import { projectsSchema, type Project } from "../schemas/project";
import {
  contactSchema,
  navigationItemSchema,
  siteSchema,
  skillGroupSchema,
  socialSchema,
  timelineItemSchema,
} from "../schemas/site";

export class ContentValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(
      `Portfolio content is invalid:\n${issues.map((issue) => `- ${issue}`).join("\n")}`,
    );
    this.name = "ContentValidationError";
  }
}

function formatZodIssues(
  label: string,
  error: { issues: Array<{ path: PropertyKey[]; message: string }> },
) {
  return error.issues.map((issue) => {
    const path = issue.path.length ? `.${issue.path.join(".")}` : "";
    return `${label}${path}: ${issue.message}`;
  });
}

function findDuplicates(values: string[], label: string) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates].map((value) => `${label}: duplicate value "${value}"`);
}

function projectNarrativeCopy(project: Project) {
  const copy = [project.subtitle, project.summary];

  for (const block of project.content) {
    switch (block.type) {
      case "paragraph":
      case "quote":
      case "callout":
        copy.push(block.body);
        break;
      case "timeline":
        copy.push(...block.items.map((item) => item.body));
        break;
      case "diagram":
        copy.push(block.description);
        break;
    }
  }

  return copy.map((value) => value.trim().toLocaleLowerCase());
}

export function validatePortfolioContent(input: {
  site: unknown;
  contact: unknown;
  projects: unknown;
  skills: unknown;
  timeline: unknown;
  socials: unknown;
  navigation: unknown;
}) {
  const siteResult = siteSchema.safeParse(input.site);
  const contactResult = contactSchema.safeParse(input.contact);
  const projectsResult = projectsSchema.safeParse(input.projects);
  const skillsResult = skillGroupSchema.array().safeParse(input.skills);
  const timelineResult = timelineItemSchema.array().safeParse(input.timeline);
  const socialsResult = socialSchema.array().safeParse(input.socials);
  const navigationResult = navigationItemSchema
    .array()
    .safeParse(input.navigation);

  const issues = [
    ...(siteResult.success ? [] : formatZodIssues("site", siteResult.error)),
    ...(contactResult.success
      ? []
      : formatZodIssues("contact", contactResult.error)),
    ...(projectsResult.success
      ? []
      : formatZodIssues("projects", projectsResult.error)),
    ...(skillsResult.success
      ? []
      : formatZodIssues("skills", skillsResult.error)),
    ...(timelineResult.success
      ? []
      : formatZodIssues("timeline", timelineResult.error)),
    ...(socialsResult.success
      ? []
      : formatZodIssues("socials", socialsResult.error)),
    ...(navigationResult.success
      ? []
      : formatZodIssues("navigation", navigationResult.error)),
  ];

  if (projectsResult.success) {
    issues.push(
      ...findDuplicates(
        projectsResult.data.map((project) => project.id),
        "projects.id",
      ),
      ...findDuplicates(
        projectsResult.data.map((project) => project.slug),
        "projects.slug",
      ),
      ...findDuplicates(
        projectsResult.data.flatMap(projectNarrativeCopy),
        "projects.copy",
      ),
    );
  }

  if (skillsResult.success) {
    issues.push(
      ...findDuplicates(
        skillsResult.data.map((skill) => skill.id),
        "skills.id",
      ),
      ...findDuplicates(
        skillsResult.data.map((skill) => skill.code),
        "skills.code",
      ),
      ...findDuplicates(
        skillsResult.data.flatMap((group) =>
          group.skills.map((skill) => skill.toLocaleLowerCase()),
        ),
        "skills.entries",
      ),
    );
  }

  if (timelineResult.success) {
    issues.push(
      ...findDuplicates(
        timelineResult.data.map((item) => item.id),
        "timeline.id",
      ),
      ...findDuplicates(
        timelineResult.data.map((item) => item.code),
        "timeline.code",
      ),
    );
  }

  if (socialsResult.success) {
    issues.push(
      ...findDuplicates(
        socialsResult.data.map((social) => social.id),
        "socials.id",
      ),
      ...findDuplicates(
        socialsResult.data
          .map((social) => social.url)
          .filter((url) => url !== ""),
        "socials.url",
      ),
    );
  }

  if (navigationResult.success) {
    issues.push(
      ...findDuplicates(
        navigationResult.data.map((item) => item.href),
        "navigation.href",
      ),
    );
  }

  if (siteResult.success && socialsResult.success) {
    const portfolioOrigin = new URL(siteResult.data.baseUrl).origin;
    for (const social of socialsResult.data) {
      if (social.url && new URL(social.url).origin === portfolioOrigin) {
        issues.push(
          `socials.${social.id}: the portfolio URL belongs only in site.json`,
        );
      }
    }
  }

  if (timelineResult.success && projectsResult.success) {
    const projectIds = new Set(
      projectsResult.data.map((project) => project.id),
    );
    for (const item of timelineResult.data) {
      for (const relatedProject of item.relatedProjects) {
        if (!projectIds.has(relatedProject)) {
          issues.push(
            `timeline.${item.id}: unknown related project "${relatedProject}"`,
          );
        }
      }
    }
  }

  if (issues.length) throw new ContentValidationError(issues);

  return {
    site: siteResult.data!,
    contact: contactResult.data!,
    projects: projectsResult.data!,
    skills: skillsResult.data!,
    timeline: timelineResult.data!,
    socials: socialsResult.data!,
    navigation: navigationResult.data!,
  };
}

export const content = validatePortfolioContent({
  site: siteJson,
  contact: contactJson,
  projects: projectsJson,
  skills: skillsJson,
  timeline: timelineJson,
  socials: socialsJson,
  navigation: navigationJson,
});

export function getVisibleProjects(
  projects: Project[] = content.projects,
  includeDrafts = false,
) {
  return projects.filter(
    (project) =>
      project.visibility === "public" ||
      (includeDrafts && project.visibility === "draft"),
  );
}

export function getProjectBySlug(slug: string, includeDrafts = false) {
  return getVisibleProjects(content.projects, includeDrafts).find(
    (project) => project.slug === slug,
  );
}
