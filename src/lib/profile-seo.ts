import { createClient } from "@supabase/supabase-js";
import { buildLegacyProfileSlug, buildProfileCitySlug, buildProfilePath } from "@/lib/profile-slug";

export type PublishedProfileSeo = {
  id: string;
  type: string | null;
  name: string | null;
  location: string | null;
  state_uf: string | null;
  headline: string | null;
  description: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type ProfileMediaSeo = {
  public_url: string | null;
  storage_path: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const createSeoSupabase = () => createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const siteUrl = "https://delirioprive.com.br";

export const getPublishedProfilesForSeo = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return [] as PublishedProfileSeo[];
  }

  const { data } = await createSeoSupabase()
    .from("published_profiles")
    .select("id,type,name,location,state_uf,headline,description,created_at,updated_at")
    .order("created_at", { ascending: true });

  return (data || []) as PublishedProfileSeo[];
};

export const getCanonicalProfilePath = (profile: PublishedProfileSeo, profiles: PublishedProfileSeo[]) => {
  return buildProfilePath(profile, profiles);
};

export const isIndexableProfile = (profile: PublishedProfileSeo) => {
  return getCitySlug(profile) !== "cidade";
};

export const findProfileByCanonicalParams = (
  profiles: PublishedProfileSeo[],
  citySlug: string,
  profileSlug: string,
) => {
  const indexableProfiles = profiles.filter(isIndexableProfile);
  return indexableProfiles.find((profile) => getCanonicalProfilePath(profile, indexableProfiles) === `/${citySlug}/${profileSlug}`) || null;
};

export const findProfileByLegacySlug = (profiles: PublishedProfileSeo[], profileSlug: string) => {
  return profiles.find((profile) => {
    const canonicalSlug = getCanonicalProfilePath(profile, profiles).split("/").pop();
    return canonicalSlug === profileSlug || buildLegacyProfileSlug(profile) === profileSlug;
  }) || null;
};

export const findProfileById = async (profileId: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const { data } = await createSeoSupabase()
    .from("published_profiles")
    .select("id,type,name,location,state_uf,headline,description,created_at,updated_at")
    .eq("id", profileId)
    .maybeSingle();

  return data as PublishedProfileSeo | null;
};

export const getProfileCoverUrl = async (profileId: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return "";
  }

  const supabase = createSeoSupabase();
  const { data } = await supabase
    .from("profile_media")
    .select("public_url,storage_path")
    .eq("profile_id", profileId)
    .eq("approval_status", "approved")
    .eq("media_type", "photo")
    .order("is_cover", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const media = data as ProfileMediaSeo | null;

  return media?.public_url || (media?.storage_path ? supabase.storage.from("profile-media").getPublicUrl(media.storage_path).data.publicUrl : "");
};

export const getCitySlug = buildProfileCitySlug;
