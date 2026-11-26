const frame = document.querySelector<HTMLIFrameElement>("iframe")!;
const stage = document.querySelector<HTMLElement>("[data-review-viewport]")!;
const page = document.querySelector<HTMLSelectElement>("#review-page")!;
const designs = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-design-choice]"),
);
const viewports = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-viewport-choice]"),
);

let design = designs.find(
  (item) => item.getAttribute("aria-pressed") === "true",
)?.dataset.designChoice;
let viewport = stage.dataset.reviewViewport;

function rememberSelection() {
  const url = new URL(location.href);
  url.searchParams.set("page", page.value);
  url.searchParams.set("design", design ?? "editorial");
  url.searchParams.set("viewport", viewport ?? "fit");
  history.replaceState(null, "", url);
}

function currentFrameUrl() {
  try {
    const href = frame.contentWindow?.location.href;
    if (!href) return;
    const url = new URL(href);
    if (url.origin === location.origin) return url;
  } catch {
    // An external profile or project link can navigate outside the preview.
  }
}

function showFrame(url: URL) {
  if (design === "workbench") {
    url.searchParams.set("design", design);
  } else {
    url.searchParams.delete("design");
  }
  frame.src = url.href;
}

function syncPage() {
  const url = currentFrameUrl();
  if (!url) return;
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  const path =
    pathname === "/" && url.hash === "#skills" ? "/#skills" : url.pathname;
  const match = Array.from(page.options).find(
    (option) => option.value.replace(/\/$/, "") === path.replace(/\/$/, ""),
  );
  if (match) {
    page.value = match.value;
    rememberSelection();
  }
}

page.addEventListener("change", () => {
  showFrame(new URL(page.value, location.origin));
  rememberSelection();
});

for (const button of designs) {
  button.addEventListener("click", () => {
    if (design === button.dataset.designChoice) return;
    design = button.dataset.designChoice;
    designs.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    showFrame(currentFrameUrl() ?? new URL(page.value, location.origin));
    rememberSelection();
  });
}

for (const button of viewports) {
  button.addEventListener("click", () => {
    viewport = button.dataset.viewportChoice;
    stage.dataset.reviewViewport = viewport;
    viewports.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    rememberSelection();
  });
}

frame.addEventListener("load", () => {
  if (!currentFrameUrl()) return;
  frame.contentWindow?.addEventListener("hashchange", syncPage);
  syncPage();
});
