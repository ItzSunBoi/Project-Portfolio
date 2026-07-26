export type ResolvedTheme = "light" | "dark";

export function resolveThemePreference(
  saved: string | null,
  systemPrefersDark: boolean,
  fallback: "system" | ResolvedTheme = "system",
): ResolvedTheme {
  if (saved === "light" || saved === "dark") return saved;
  if (fallback === "light" || fallback === "dark") return fallback;
  return systemPrefersDark ? "dark" : "light";
}
