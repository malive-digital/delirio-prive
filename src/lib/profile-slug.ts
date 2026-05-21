type ProfileSlugSource = {
  id?: string | null;
  name?: string | null;
  location?: string | null;
  created_at?: string | null;
};

export const slugifyPart = (value: string | null | undefined) => {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const buildProfileSlug = (profile: ProfileSlugSource) => {
  const name = slugifyPart(profile.name) || "perfil";

  return `acompanhante-${name}`;
};

export const buildProfileCitySlug = (profile: ProfileSlugSource) => {
  const city = slugifyPart(profile.location) || "cidade";

  return city;
};

export const buildLegacyProfileSlug = (profile: ProfileSlugSource) => {
  const name = slugifyPart(profile.name) || "perfil";
  const city = buildProfileCitySlug(profile);

  return `acompanhante-${name}-${city}`;
};

const compareProfilesByRegistration = (a: ProfileSlugSource, b: ProfileSlugSource) => {
  const dateA = a.created_at || "";
  const dateB = b.created_at || "";

  if (dateA !== dateB) {
    return dateA.localeCompare(dateB);
  }

  return (a.id || "").localeCompare(b.id || "");
};

export const buildUniqueProfileSlug = (profile: ProfileSlugSource, profiles: ProfileSlugSource[]) => {
  const baseSlug = buildProfileSlug(profile);
  const citySlug = buildProfileCitySlug(profile);
  const matchingProfiles = profiles
    .filter((item) => buildProfileCitySlug(item) === citySlug && buildProfileSlug(item) === baseSlug)
    .sort(compareProfilesByRegistration);
  const profileIndex = matchingProfiles.findIndex((item) => item.id === profile.id);

  if (profileIndex <= 0) {
    return baseSlug;
  }

  return `${baseSlug}-${profileIndex + 1}`;
};

export const buildProfilePath = (profile: ProfileSlugSource, profiles: ProfileSlugSource[]) => {
  return `/${buildProfileCitySlug(profile)}/${buildUniqueProfileSlug(profile, profiles)}`;
};
