export function formatYear(year: number) {
  return new Intl.NumberFormat("en-GB", {
    useGrouping: false,
  }).format(year);
}

export function currentYear() {
  return new Date().getFullYear();
}
