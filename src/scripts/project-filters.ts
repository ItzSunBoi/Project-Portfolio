import { initializeProjectFilters } from "../lib/project-filters";

initializeProjectFilters();

const disclosures = document.querySelectorAll<HTMLDetailsElement>(
  "[data-filter-options]",
);

disclosures.forEach((disclosure) => {
  disclosure.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !disclosure.open) return;
    event.preventDefault();
    disclosure.open = false;
    disclosure.querySelector("summary")?.focus();
  });
});

function dismissFilters(event: Event) {
  const target = event.target;
  if (!(target instanceof Node)) return;
  disclosures.forEach((disclosure) => {
    if (disclosure.open && !disclosure.contains(target)) {
      disclosure.open = false;
    }
  });
}

document.addEventListener("click", dismissFilters);
document.addEventListener("focusin", dismissFilters);
