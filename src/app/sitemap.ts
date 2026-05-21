import type { MetadataRoute } from "next";
import { CATALOG_CATEGORIES, getCatalogCategoryCityHref } from "@/lib/catalog-categories";
import { getCanonicalProfilePath, getCitySlug, getPublishedProfilesForSeo, siteUrl } from "@/lib/profile-seo";

export const dynamic = "force-dynamic";

const routes: MetadataRoute.Sitemap = [
  {
    url: siteUrl,
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${siteUrl}/mulheres`,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/homens`,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/travestis`,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/planos`,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/parcerias-promocoes`,
    changeFrequency: "weekly",
    priority: 0.6,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const profiles = await getPublishedProfilesForSeo();
  const indexableProfiles = profiles.filter((profile) => getCitySlug(profile) !== "cidade");
  const cityRoutes = Array.from(indexableProfiles.reduce((cities, profile) => {
    const city = getCitySlug(profile);
    const current = cities.get(city);
    const currentTime = current?.updated_at ? new Date(current.updated_at).getTime() : 0;
    const profileTime = profile.updated_at ? new Date(profile.updated_at).getTime() : 0;

    if (!current || profileTime > currentTime) {
      cities.set(city, profile);
    }

    return cities;
  }, new Map<string, (typeof indexableProfiles)[number]>()).entries())
    .map(([city, profile]) => ({
      url: `${siteUrl}/${city}`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : lastModified,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));
  const categoryCityRoutes = CATALOG_CATEGORIES.flatMap((category) => {
    return Array.from(indexableProfiles
      .filter((profile) => profile.type === category.type)
      .reduce((cities, profile) => {
        const city = getCitySlug(profile);
        const current = cities.get(city);
        const currentTime = current?.updated_at ? new Date(current.updated_at).getTime() : 0;
        const profileTime = profile.updated_at ? new Date(profile.updated_at).getTime() : 0;

        if (!current || profileTime > currentTime) {
          cities.set(city, profile);
        }

        return cities;
      }, new Map<string, (typeof indexableProfiles)[number]>()).entries())
      .map(([city, profile]) => ({
        url: `${siteUrl}${getCatalogCategoryCityHref(category, city)}`,
        lastModified: profile.updated_at ? new Date(profile.updated_at) : lastModified,
        changeFrequency: "daily" as const,
        priority: 0.86,
      }));
  });
  const profileRoutes = indexableProfiles.map((profile) => ({
    url: `${siteUrl}${getCanonicalProfilePath(profile, indexableProfiles)}`,
    lastModified: profile.updated_at ? new Date(profile.updated_at) : lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...routes, ...cityRoutes, ...categoryCityRoutes, ...profileRoutes];
}
