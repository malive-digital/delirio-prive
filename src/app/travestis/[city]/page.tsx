import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/CatalogPage";
import { CATALOG_CATEGORIES, getCatalogCategoryCityHref, getCatalogCategoryHref } from "@/lib/catalog-categories";
import { getCitySlug, getPublishedProfilesForSeo, siteUrl } from "@/lib/profile-seo";

type CategoryCityPageProps = {
  params: Promise<{ city: string }>;
};

const category = CATALOG_CATEGORIES[2];

const formatSlugTitle = (slug: string) => {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getCategoryCityProfile = async (city: string) => {
  const profiles = await getPublishedProfilesForSeo();
  const profile = profiles.find((item) => item.type === category.type && getCitySlug(item) === city);

  return { profile, profiles };
};

export async function generateMetadata({ params }: CategoryCityPageProps): Promise<Metadata> {
  const { city } = await params;
  const { profile } = await getCategoryCityProfile(city);
  if (!profile) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cityTitle = profile.location || formatSlugTitle(city) || "sua cidade";
  const description = `Encontre acompanhantes trans em ${cityTitle} no Delirio Prive.`;
  const path = getCatalogCategoryCityHref(category, city);

  return {
    title: `Trans em ${cityTitle} | Delirio Prive`,
    description,
    alternates: {
      canonical: `${siteUrl}${path}`,
    },
    openGraph: {
      title: `Trans em ${cityTitle}`,
      description,
      url: `${siteUrl}${path}`,
      siteName: "Delirio Prive",
      locale: "pt_BR",
      type: "website",
    },
  };
}

export default async function TravestisCityPage({ params }: CategoryCityPageProps) {
  const { city } = await params;
  const { profile } = await getCategoryCityProfile(city);

  if (!profile) {
    notFound();
  }

  const cityTitle = profile.location || formatSlugTitle(city);

  return (
    <CatalogPage
      key={`${category.segment}-${city}`}
      title={`${category.title} em ${cityTitle || "sua cidade"}`}
      type={category.type}
      activeHref={getCatalogCategoryHref(category)}
      initialCitySlug={city}
    />
  );
}
