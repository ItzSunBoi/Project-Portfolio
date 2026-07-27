import {
  projectCategories,
  projectStatuses,
  type ProjectCategory,
  type ProjectStatus,
} from "../lib/project-taxonomy";

const form = document.querySelector<HTMLFormElement>("[data-project-filters]");
const cards = [
  ...document.querySelectorAll<HTMLElement>("[data-project-card]"),
];
const resultCount = document.querySelector<HTMLElement>("[data-result-count]");
const emptyState = document.querySelector<HTMLElement>("[data-empty-state]");
const clearButtons = document.querySelectorAll<HTMLButtonElement>(
  "[data-clear-filters]",
);

function selectedValues<T extends string>(name: string): T[] {
  if (!form) return [];
  return [
    ...form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`),
  ].map((input) => input.value as T);
}

function applyFilters(updateUrl = true) {
  if (!form) return;

  const query =
    form
      .querySelector<HTMLInputElement>('input[name="q"]')
      ?.value.trim()
      .toLocaleLowerCase() ?? "";
  const categories = selectedValues<ProjectCategory>("category");
  const statuses = selectedValues<ProjectStatus>("status");
  let visibleCount = 0;

  cards.forEach((card) => {
    const title = card.dataset.title?.toLocaleLowerCase() ?? "";
    const summary = card.dataset.summary?.toLocaleLowerCase() ?? "";
    const cardCategories = (card.dataset.categories ?? "").split(",");
    const status = card.dataset.status ?? "";
    const matchesQuery = !query || `${title} ${summary}`.includes(query);
    const matchesCategory =
      !categories.length ||
      categories.some((category) => cardCategories.includes(category));
    const matchesStatus =
      !statuses.length || statuses.includes(status as ProjectStatus);
    const visible = matchesQuery && matchesCategory && matchesStatus;

    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (resultCount) {
    resultCount.textContent = `${visibleCount} project${visibleCount === 1 ? "" : "s"}`;
  }
  if (emptyState) emptyState.hidden = visibleCount !== 0;
  clearButtons.forEach((button) => {
    button.hidden = !query && categories.length === 0 && statuses.length === 0;
  });

  if (!updateUrl) return;

  const parameters = new URLSearchParams();
  if (query) parameters.set("q", query);
  categories.forEach((category) => parameters.append("category", category));
  statuses.forEach((status) => parameters.append("status", status));
  const nextUrl = `${window.location.pathname}${parameters.size ? `?${parameters}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
}

function hydrateFromUrl() {
  if (!form) return;
  const parameters = new URLSearchParams(window.location.search);
  const queryField = form.querySelector<HTMLInputElement>('input[name="q"]');
  if (queryField) queryField.value = parameters.get("q") ?? "";

  const selectedCategories = parameters
    .getAll("category")
    .filter((value): value is ProjectCategory =>
      projectCategories.includes(value as ProjectCategory),
    );
  const selectedStatuses = parameters
    .getAll("status")
    .filter((value): value is ProjectStatus =>
      projectStatuses.includes(value as ProjectStatus),
    );

  form
    .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    .forEach((input) => {
      input.checked =
        input.name === "category"
          ? selectedCategories.includes(input.value as ProjectCategory)
          : selectedStatuses.includes(input.value as ProjectStatus);
    });

  applyFilters(false);
}

form?.addEventListener("input", () => applyFilters());
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilters();
});

clearButtons.forEach((button) => {
  button.addEventListener("click", () => {
    form?.reset();
    applyFilters();
    form?.querySelector<HTMLInputElement>('input[name="q"]')?.focus();
  });
});

window.addEventListener("popstate", hydrateFromUrl);
hydrateFromUrl();
