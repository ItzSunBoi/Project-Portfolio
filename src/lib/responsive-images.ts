const responsiveWidths = [480, 960, 1600] as const;

export function responsiveSrcSet(src: string): string | undefined {
  if (!/^\/[a-z0-9-]+\/images\/.+-1600\.webp$/.test(src)) {
    return undefined;
  }

  const base = src.slice(0, -"-1600.webp".length);
  return responsiveWidths
    .map((width) => `${base}-${width}.webp ${width}w`)
    .join(", ");
}
