export function formatYear(year: number) {
  return new Intl.NumberFormat("en-GB", {
    useGrouping: false,
  }).format(year);
}

export function formatProjectYear(
  year: number,
  yearEnd: number | "Now" | null,
) {
  const start = formatYear(year);

  if (yearEnd === null) return start;
  if (yearEnd === "Now") return `${start}–Now`;
  return `${start}–${formatYear(yearEnd)}`;
}

export function currentYear() {
  return new Date().getFullYear();
}
