import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/CatalogPage";
import { getCitySlug, getPublishedProfilesForSeo, siteUrl } from "@/lib/profile-seo";

type CityPageProps = {
  params: Promise<{ city: string }>;
};

const formatSlugTitle = (slug: string) => {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const profiles = await getPublishedProfilesForSeo();
  const cityProfile = profiles.find((profile) => getCitySlug(profile) === city);
  if (!cityProfile) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cityTitle = cityProfile?.location || formatSlugTitle(city) || "sua cidade";
  const description = `Encontre acompanhantes em ${cityTitle} no Delirio Prive.`;

  return {
    title: `Acompanhantes em ${cityTitle} | Delirio Prive`,
    description,
    alternates: {
      canonical: `${siteUrl}/${city}`,
    },
    openGraph: {
      title: `Acompanhantes em ${cityTitle}`,
      description,
      url: `${siteUrl}/${city}`,
      siteName: "Delirio Prive",
      locale: "pt_BR",
      type: "website",
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  const profiles = await getPublishedProfilesForSeo();
  const cityProfile = profiles.find((profile) => getCitySlug(profile) === city);

  if (!cityProfile) {
    notFound();
  }

  const cityTitle = cityProfile.location || formatSlugTitle(city);

  return (
    <CatalogPage
      key={city}
      title={`Acompanhantes em ${cityTitle || "sua cidade"}`}
      activeHref="/mulheres"
      initialCitySlug={city}
    />
  );
}
