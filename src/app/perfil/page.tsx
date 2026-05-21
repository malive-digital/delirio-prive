import { redirect } from "next/navigation";
import PerfilPage from "@/components/PerfilPage";
import {
  findProfileById,
  findProfileByLegacySlug,
  getCanonicalProfilePath,
  getPublishedProfilesForSeo,
} from "@/lib/profile-seo";

type LegacyPerfilPageProps = {
  searchParams: Promise<{
    id?: string;
    modelo?: string;
  }>;
};

export default async function LegacyPerfilPage({ searchParams }: LegacyPerfilPageProps) {
  const { id, modelo } = await searchParams;

  if (id || modelo) {
    const profiles = await getPublishedProfilesForSeo();
    const profile = id
      ? await findProfileById(id)
      : findProfileByLegacySlug(profiles, modelo || "");

    if (profile) {
      redirect(getCanonicalProfilePath(profile, profiles));
    }
  }

  return <PerfilPage />;
}
