import type { MetadataRoute } from "next";

const siteUrl = "https://delirioprive.com.br";

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
  {
    url: `${siteUrl}/cadastro-whatsapp`,
    changeFrequency: "monthly",
    priority: 0.5,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    ...route,
    lastModified,
  }));
}
