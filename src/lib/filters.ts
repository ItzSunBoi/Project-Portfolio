import type {
  Project,
  ProjectCategory,
  ProjectStatus,
} from "../schemas/project";

export type ProjectFilters = {
  query?: string;
  categories?: ProjectCategory[];
  statuses?: ProjectStatus[];
};

function normalise(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function projectMatchesFilters(
  project: Project,
  filters: ProjectFilters,
) {
  const query = normalise(filters.query ?? "");
  const searchable = normalise(
    [
      project.title,
      project.subtitle,
      project.summary,
      project.category,
      ...project.secondaryCategories,
      ...project.technologies,
    ].join(" "),
  );

  const categoryMatch =
    !filters.categories?.length ||
    filters.categories.some(
      (category) =>
        project.category === category ||
        project.secondaryCategories.includes(category),
    );
  const statusMatch =
    !filters.statuses?.length || filters.statuses.includes(project.status);

  return (!query || searchable.includes(query)) && categoryMatch && statusMatch;
}

export function filterProjects(projects: Project[], filters: ProjectFilters) {
  return projects.filter((project) => projectMatchesFilters(project, filters));
}
