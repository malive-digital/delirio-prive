import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PerfilPage from "@/components/PerfilPage";
import {
  findProfileByCanonicalParams,
  getProfileCoverUrl,
  getPublishedProfilesForSeo,
  siteUrl,
} from "@/lib/profile-seo";

type CityProfilePageProps = {
  params: Promise<{
    city: string;
    profileSlug: string;
  }>;
};

const formatSlugTitle = (slug: string) => {
  return slug
    .replace(/^acompanhante-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export async function generateMetadata({ params }: CityProfilePageProps): Promise<Metadata> {
  const { city, profileSlug } = await params;
  const profiles = await getPublishedProfilesForSeo();
  const profile = findProfileByCanonicalParams(profiles, city, profileSlug);
  if (!profile) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const coverUrl = profile ? await getProfileCoverUrl(profile.id) : "";
  const cityTitle = formatSlugTitle(city) || "sua cidade";
  const profileTitle = profile?.name || formatSlugTitle(profileSlug) || "Acompanhante";
  const description = profile?.headline || profile?.description || `Perfil de ${profileTitle}, acompanhante em ${cityTitle}, no Delirio Prive.`;
  const canonical = `${siteUrl}/${city}/${profileSlug}`;

  return {
    title: `${profileTitle} em ${cityTitle} | Delirio Prive`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${profileTitle} em ${cityTitle}`,
      description,
      url: canonical,
      siteName: "Delirio Prive",
      images: coverUrl ? [{ url: coverUrl }] : undefined,
      locale: "pt_BR",
      type: "profile",
    },
  };
}

export default async function CityProfilePage({ params }: CityProfilePageProps) {
  const { city, profileSlug } = await params;
  const profiles = await getPublishedProfilesForSeo();
  const profile = findProfileByCanonicalParams(profiles, city, profileSlug);

  if (!profile) {
    notFound();
  }

  return <PerfilPage citySlug={city} profileSlug={profileSlug} />;
}
