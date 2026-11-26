import { afterEach, describe, expect, it, vi } from "vitest";
import { content } from "../src/lib/content";
import { filterProjects } from "../src/lib/filters";
import { initializeProjectFilters } from "../src/lib/project-filters";

describe("project filtering", () => {
  it("matches technologies and summary text", () => {
    expect(
      filterProjects(content.projects, { query: "CH32V006" }).map(
        (project) => project.slug,
      ),
    ).toContain("gigaplex");
    expect(
      filterProjects(content.projects, { query: "keychain" }).map(
        (project) => project.slug,
      ),
    ).toContain("gigaplex");
  });

  it("matches secondary categories", () => {
    const results = filterProjects(content.projects, {
      categories: ["pcb"],
    });
    expect(results.map((project) => project.slug)).toContain("gigaplex");
  });

  it("lists the finished Gigaplex build as completed", () => {
    const results = filterProjects(content.projects, {
      statuses: ["completed"],
    });

    expect(results.map((project) => project.slug)).toContain("gigaplex");
  });

  it("combines category and status filters", () => {
    const experimentalProject = {
      ...structuredClone(content.projects[0]),
      status: "experimental" as const,
    };
    const results = filterProjects([experimentalProject], {
      categories: ["pcb"],
      statuses: ["experimental"],
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (project) =>
          project.status === "experimental" &&
          [project.category, ...project.secondaryCategories].includes("pcb"),
      ),
    ).toBe(true);
  });

  it("handles long project titles", () => {
    const longTitleProject = {
      ...structuredClone(content.projects[0]),
      id: "long-title",
      slug: "long-title",
      title:
        "A deliberately long project title that still remains searchable and structurally valid",
    };

    expect(
      filterProjects([longTitleProject], { query: "structurally valid" }),
    ).toHaveLength(1);
  });

  it("returns an empty list for no matches", () => {
    expect(
      filterProjects(content.projects, {
        query: "definitely-not-a-project-technology",
      }),
    ).toEqual([]);
  });
});

type FilterEvent = {
  target?: FilterInput;
  preventDefault?: () => void;
};
type FilterListener = (event: FilterEvent) => void;

class FilterInput {
  checked = false;
  focused = false;

  constructor(
    readonly name: string,
    public value: string,
  ) {}

  focus() {
    this.focused = true;
  }
}

function browserFixture(address = "") {
  const query = new FilterInput("q", "");
  const pcb = new FilterInput("category", "pcb");
  const web = new FilterInput("category", "web");
  const completed = new FilterInput("status", "completed");
  const experimental = new FilterInput("status", "experimental");
  const checkboxes = [pcb, web, completed, experimental];
  const formListeners = new Map<string, FilterListener>();
  const clearListeners = new Map<string, FilterListener>();
  const windowListeners = new Map<string, () => void>();
  const cards = [
    {
      dataset: {
        title: "Gigaplex",
        summary: "A keychain console CH32V006",
        categories: "hardware,pcb,firmware",
        status: "completed",
      },
      hidden: false,
    },
    {
      dataset: {
        title: "Workflow viewer",
        summary: "Browser interface TypeScript",
        categories: "software,web",
        status: "experimental",
      },
      hidden: false,
    },
  ];
  const results = {
    dataset: { projectCount: "2" },
    querySelectorAll: () => cards,
  };
  const count = { textContent: "" };
  const categorySelection = {
    textContent: "",
    dataset: { unfiltered: "All categories" },
  };
  const statusSelection = {
    textContent: "",
    dataset: { unfiltered: "All statuses" },
  };
  const empty = { hidden: true };
  const clear = {
    disabled: true,
    addEventListener: (name: string, listener: FilterListener) =>
      clearListeners.set(name, listener),
  };
  const fields = new Map<string, unknown>([
    ['input[name="q"]', query],
    ['[data-filter-selection="category"]', categorySelection],
    ['[data-filter-selection="status"]', statusSelection],
  ]);
  const form = {
    querySelector: (selector: string) => fields.get(selector),
    querySelectorAll: (selector: string) => {
      if (selector === 'input[type="checkbox"]') return checkboxes;
      const name = selector.match(/name="([^"]+)"/)?.[1];
      return checkboxes.filter((input) => input.name === name && input.checked);
    },
    addEventListener: (name: string, listener: FilterListener) =>
      formListeners.set(name, listener),
    reset: () => {
      query.value = "";
      checkboxes.forEach((input) => (input.checked = false));
    },
  };
  const elements = new Map<string, unknown>([
    ["[data-project-filters]", form],
    ["[data-project-results]", results],
    ["[data-result-count]", count],
    ["[data-empty-state]", empty],
  ]);
  const doc = {
    querySelector: (selector: string) => elements.get(selector),
    querySelectorAll: () => [clear],
  };
  const entries = [`/projects/${address}`];
  const location = new URL(entries[0], "https://example.com");
  let historyIndex = 0;
  const restore = (index: number) => {
    historyIndex = index;
    location.href = new URL(entries[index], "https://example.com").href;
    windowListeners.get("popstate")?.();
  };
  const currentWindow = {
    location,
    history: {
      pushState: (_state: unknown, _unused: string, url: string) => {
        entries.splice(historyIndex + 1);
        entries.push(url);
        historyIndex += 1;
        location.href = new URL(url, "https://example.com").href;
      },
      back: () => restore(historyIndex - 1),
      forward: () => restore(historyIndex + 1),
    },
    addEventListener: (name: string, listener: () => void) =>
      windowListeners.set(name, listener),
    setTimeout: (callback: () => void, delay: number) =>
      globalThis.setTimeout(callback, delay),
    clearTimeout: (id: ReturnType<typeof setTimeout>) =>
      globalThis.clearTimeout(id),
  };

  initializeProjectFilters(
    doc as unknown as Document,
    currentWindow as unknown as Window,
  );

  return {
    cards,
    categorySelection,
    clear,
    completed,
    count,
    currentWindow,
    empty,
    entries,
    experimental,
    pcb,
    query,
    results,
    statusSelection,
    web,
    input: (target: FilterInput) => formListeners.get("input")?.({ target }),
    submit: () =>
      formListeners.get("submit")?.({ preventDefault: () => undefined }),
    reset: () => clearListeners.get("click")?.({}),
  };
}

describe("project browser interaction", () => {
  afterEach(() => vi.useRealTimers());

  it("hydrates shared URLs and updates the layout from the matching count", () => {
    const { cards, completed, count, empty, entries, pcb, query, results } =
      browserFixture("?q=CH32V006&category=pcb&status=completed");

    expect(query.value).toBe("CH32V006");
    expect(pcb.checked).toBe(true);
    expect(completed.checked).toBe(true);
    expect(cards.map((card) => card.hidden)).toEqual([false, true]);
    expect(results.dataset.projectCount).toBe("1");
    expect(count.textContent).toBe("1 project");
    expect(empty.hidden).toBe(true);
    expect(entries).toHaveLength(1);
  });

  it("combines filters, exposes the empty state and resets all controls", () => {
    const fixture = browserFixture();
    const { cards, clear, completed, count, empty, query, results, web } =
      fixture;
    web.checked = true;
    fixture.input(web);
    expect(results.dataset.projectCount).toBe("1");
    expect(cards.map((card) => card.hidden)).toEqual([true, false]);

    completed.checked = true;
    fixture.input(completed);
    expect(results.dataset.projectCount).toBe("0");
    expect(count.textContent).toBe("0 projects");
    expect(empty.hidden).toBe(false);
    expect(clear.disabled).toBe(false);

    fixture.reset();
    expect(results.dataset.projectCount).toBe("2");
    expect(cards.every((card) => !card.hidden)).toBe(true);
    expect(web.checked).toBe(false);
    expect(completed.checked).toBe(false);
    expect(clear.disabled).toBe(true);
    expect(query.focused).toBe(true);
    expect(fixture.currentWindow.location.search).toBe("");
  });

  it("debounces search history while updating results immediately", () => {
    vi.useFakeTimers();
    const fixture = browserFixture();
    fixture.query.value = "  CH32  ";
    fixture.input(fixture.query);
    expect(fixture.results.dataset.projectCount).toBe("1");
    expect(fixture.entries).toHaveLength(1);

    vi.advanceTimersByTime(150);
    fixture.query.value = "  CH32V006  ";
    fixture.input(fixture.query);
    vi.advanceTimersByTime(250);
    expect(fixture.entries).toEqual(["/projects/", "/projects/?q=ch32v006"]);

    fixture.submit();
    expect(fixture.entries).toHaveLength(2);
  });

  it("restores controls and result layout through Back and Forward", () => {
    const fixture = browserFixture();
    fixture.web.checked = true;
    fixture.input(fixture.web);
    fixture.completed.checked = true;
    fixture.input(fixture.completed);
    expect(fixture.results.dataset.projectCount).toBe("0");

    fixture.currentWindow.history.back();
    expect(fixture.web.checked).toBe(true);
    expect(fixture.completed.checked).toBe(false);
    expect(fixture.results.dataset.projectCount).toBe("1");

    fixture.currentWindow.history.back();
    expect(fixture.web.checked).toBe(false);
    expect(fixture.results.dataset.projectCount).toBe("2");

    fixture.currentWindow.history.forward();
    expect(fixture.web.checked).toBe(true);
    expect(fixture.results.dataset.projectCount).toBe("1");
  });

  it("ignores unknown filters and cancels pending search when history changes", () => {
    vi.useFakeTimers();
    const fixture = browserFixture("?category=private&status=unknown");
    expect(fixture.results.dataset.projectCount).toBe("2");
    expect(fixture.web.checked).toBe(false);
    fixture.web.checked = true;
    fixture.input(fixture.web);
    fixture.query.value = "missing";
    fixture.input(fixture.query);
    expect(fixture.results.dataset.projectCount).toBe("0");

    fixture.currentWindow.history.back();
    vi.advanceTimersByTime(250);
    expect(fixture.query.value).toBe("");
    expect(fixture.results.dataset.projectCount).toBe("2");
    expect(fixture.entries).toHaveLength(2);
  });

  it("retains multi-select results and summarises selections on closed controls", () => {
    const fixture = browserFixture("?category=pcb&status=completed");
    expect(fixture.categorySelection.textContent).toBe("PCB");
    expect(fixture.statusSelection.textContent).toBe("Completed");
    expect(fixture.results.dataset.projectCount).toBe("1");

    fixture.web.checked = true;
    fixture.input(fixture.web);
    expect(fixture.categorySelection.textContent).toBe("2 selected");
    expect(fixture.results.dataset.projectCount).toBe("1");

    fixture.experimental.checked = true;
    fixture.input(fixture.experimental);
    expect(fixture.statusSelection.textContent).toBe("2 selected");
    expect(fixture.results.dataset.projectCount).toBe("2");

    fixture.reset();
    expect(fixture.categorySelection.textContent).toBe("All categories");
    expect(fixture.statusSelection.textContent).toBe("All statuses");
  });

  it("preserves unrelated preview parameters and the fragment through filtering and reset", () => {
    const fixture = browserFixture("?design=workbench#results");
    fixture.pcb.checked = true;
    fixture.input(fixture.pcb);

    expect(fixture.entries.at(-1)).toBe(
      "/projects/?design=workbench&category=pcb#results",
    );

    fixture.reset();
    expect(fixture.entries.at(-1)).toBe("/projects/?design=workbench#results");
  });
});
