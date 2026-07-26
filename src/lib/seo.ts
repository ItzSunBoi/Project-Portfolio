import type { SiteConfig } from "../schemas/site";

export function absoluteUrl(path: string, site: SiteConfig) {
  return new URL(path, `${site.baseUrl}/`).toString();
}

export function pageTitle(title: string, site: SiteConfig) {
  return title === site.title ? title : `${title} | ${site.brandName}`;
}
