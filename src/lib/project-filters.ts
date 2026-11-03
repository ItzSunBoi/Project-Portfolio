import {
  projectCategories,
  projectStatuses,
  type ProjectCategory,
  type ProjectStatus,
} from "./project-taxonomy";

export function initializeProjectFilters(
  doc: Document = document,
  currentWindow: Window = window,
) {
  const form = doc.querySelector<HTMLFormElement>("[data-project-filters]");
  const results = doc.querySelector<HTMLElement>("[data-project-results]");
  if (!form || !results) return null;

  const cards = [
    ...results.querySelectorAll<HTMLElement>("[data-project-card]"),
  ];
  const resultCount = doc.querySelector<HTMLElement>("[data-result-count]");
  const emptyState = doc.querySelector<HTMLElement>("[data-empty-state]");
  const clearButtons = doc.querySelectorAll<HTMLButtonElement>(
    "[data-clear-filters]",
  );
  const queryField = form.querySelector<HTMLInputElement>('input[name="q"]');
  let searchTimeout: number | undefined;

  function selectedValues<T extends string>(name: string): T[] {
    return [
      ...form!.querySelectorAll<HTMLInputElement>(
        `input[name="${name}"]:checked`,
      ),
    ].map((input) => input.value as T);
  }

  function readFilters() {
    return {
      query: queryField?.value.trim().toLocaleLowerCase() ?? "",
      categories: selectedValues<ProjectCategory>("category"),
      statuses: selectedValues<ProjectStatus>("status"),
    };
  }

  function updateUrl() {
    const { query, categories, statuses } = readFilters();
    const parameters = new URLSearchParams();
    if (query) parameters.set("q", query);
    categories.forEach((category) => parameters.append("category", category));
    statuses.forEach((status) => parameters.append("status", status));
    const nextUrl = `${currentWindow.location.pathname}${parameters.size ? `?${parameters}` : ""}`;
    const currentUrl = `${currentWindow.location.pathname}${currentWindow.location.search}`;
    if (nextUrl !== currentUrl) {
      currentWindow.history.pushState({}, "", nextUrl);
    }
  }

  function applyFilters(updateHistory = true) {
    const { query, categories, statuses } = readFilters();
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

    results!.dataset.projectCount = String(visibleCount);
    if (resultCount) {
      resultCount.textContent = `${visibleCount} project${visibleCount === 1 ? "" : "s"}`;
    }
    if (emptyState) emptyState.hidden = visibleCount !== 0;
    clearButtons.forEach((button) => {
      button.hidden =
        !query && categories.length === 0 && statuses.length === 0;
    });

    if (updateHistory) updateUrl();
  }

  function clearPendingSearch() {
    currentWindow.clearTimeout(searchTimeout);
    searchTimeout = undefined;
  }

  function hydrateFromUrl() {
    clearPendingSearch();
    const parameters = new URLSearchParams(currentWindow.location.search);
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

    form!
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((input) => {
        input.checked =
          input.name === "category"
            ? selectedCategories.includes(input.value as ProjectCategory)
            : selectedStatuses.includes(input.value as ProjectStatus);
      });

    applyFilters(false);
  }

  form.addEventListener("input", (event) => {
    clearPendingSearch();
    applyFilters(false);
    if (event.target === queryField) {
      searchTimeout = currentWindow.setTimeout(updateUrl, 250);
    } else {
      updateUrl();
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearPendingSearch();
    applyFilters();
  });

  clearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      clearPendingSearch();
      form.reset();
      applyFilters();
      queryField?.focus();
    });
  });

  currentWindow.addEventListener("popstate", hydrateFromUrl);
  hydrateFromUrl();

  return { applyFilters, hydrateFromUrl };
}
