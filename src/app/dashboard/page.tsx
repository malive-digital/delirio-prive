"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";
import { getSubscriptionDaysLeft, isSubscriptionActive } from "@/lib/subscriptions";

const TRIAL_DAYS = 7;
const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

type DashboardTab = "resumo" | "editar" | "fotos" | "documento";

const DASHBOARD_TABS: DashboardTab[] = ["resumo", "editar", "fotos", "documento"];

function isDashboardTab(value: string | null): value is DashboardTab {
  return Boolean(value && DASHBOARD_TABS.includes(value as DashboardTab));
}

type ApprovalStatus = "pending" | "approved" | "rejected";

type ProfileForm = {
  name: string;
  type: string;
  whatsapp: string;
  location: string;
  state_uf: string;
  headline: string;
  age: string;
  neighborhood: string;
  price_15: string;
  price_30: string;
  price_60: string;
  overnight_price: string;
  serves: string;
  has_place: string;
  availability: string;
  payment_methods: string;
  services: string;
  specialties: string;
  restrictions: string;
  appearance: string;
  languages: string;
  description: string;
  active_plan: string;
  is_online: boolean;
  profile_approval_status: ApprovalStatus;
  user_document_path: string | null;
  user_document_name: string | null;
  user_document_back_path: string | null;
  user_document_back_name: string | null;
};

const profileTextFields: Array<keyof Omit<ProfileForm, "is_online" | "profile_approval_status" | "user_document_path" | "user_document_name" | "user_document_back_path" | "user_document_back_name">> = [
  "name",
  "type",
  "whatsapp",
  "location",
  "state_uf",
  "headline",
  "age",
  "neighborhood",
  "price_15",
  "price_30",
  "price_60",
  "overnight_price",
  "serves",
  "has_place",
  "availability",
  "payment_methods",
  "services",
  "specialties",
  "restrictions",
  "appearance",
  "languages",
  "description",
  "active_plan",
];

type ProfileMedia = {
  id: string;
  file_name: string | null;
  media_type: "photo" | "video";
  public_url: string | null;
  storage_path: string;
  approval_status: ApprovalStatus;
  is_cover: boolean | null;
  created_at: string | null;
};

type ProfileRow = Partial<Record<keyof ProfileForm, unknown>>;

type ProfileAnalytics = {
  profile_views: number;
  whatsapp_clicks: number;
};

const emptyProfile: ProfileForm = {
  name: "",
  type: "mulher",
  whatsapp: "",
  location: "",
  state_uf: "",
  headline: "",
  age: "",
  neighborhood: "",
  price_15: "",
  price_30: "",
  price_60: "",
  overnight_price: "",
  serves: "",
  has_place: "nao_informado",
  availability: "",
  payment_methods: "",
  services: "",
  specialties: "",
  restrictions: "",
  appearance: "",
  languages: "",
  description: "",
  active_plan: "Basico",
  is_online: false,
  profile_approval_status: "pending",
  user_document_path: null,
  user_document_name: null,
  user_document_back_path: null,
  user_document_back_name: null,
};

const approvalCopy = {
  pending: {
    title: "Aguardando aceite",
    description: "Seu perfil fica fora do catálogo até a aprovação da administração.",
  },
  approved: {
    title: "Perfil aprovado",
    description: "Seu cadastro está liberado para aparecer no catálogo.",
  },
  rejected: {
    title: "Ajustes solicitados",
    description: "Revise as informações e envie novamente para avaliação.",
  },
};

const mediaStatusCopy = {
  pending: "Em análise",
  approved: "Aprovada",
  rejected: "Recusada",
};

const placeLabels: Record<string, string> = {
  nao_informado: "Não informado",
  com_local: "Com local",
  sem_local: "Sem local",
  hotel_motel: "Hotel ou motel",
  a_combinar: "A combinar",
};

const BRAZIL_UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const getTrialDaysLeft = (createdAt: string | undefined) => {
  if (!createdAt) return 0;

  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return 0;

  const diffDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, TRIAL_DAYS - diffDays);
};

const predefinedOptions = {
  serves: ["Homens", "Mulheres", "Casais", "Trans", "Atendimento social", "Viagens"],
  has_place: ["Com local", "Sem local", "Hotel ou motel", "A combinar"],
  availability: ["Manha", "Tarde", "Noite", "Madrugada", "Segunda a sexta", "Fim de semana", "24 horas", "Com hora marcada"],
  payment_methods: ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Transferência", "Sinal antecipado"],
  services: ["Massagem", "Jantar", "Encontro social", "Viagem", "Atendimento virtual", "Fantasias", "Namoradinha", "Premium"],
  specialties: ["Discrição", "Local próprio", "Atendimento em hotel", "Atendimento para casais", "Experiência luxo", "Roleplay"],
  languages: ["Português", "Inglês", "Espanhol", "Francês", "Italiano"],
};

const categoryGuides = {
  mulher: {
    title: "Padrao para mulheres",
    headline: "Ex: Atendimento elegante, discreto e com hora marcada",
    priceLabel: "Valor forte no perfil: 1 hora",
    pricePlaceholder: "Ex: R$ 700",
    serves: "Ex: homens, mulheres e casais",
    services: "Destaque experiencias, estilo de atendimento, encontros sociais e diferenciais.",
  },
  homem: {
    title: "Padrao para homens",
    headline: "Ex: Dotadao novidade",
    priceLabel: "Valor forte no perfil: 15 min",
    pricePlaceholder: "Ex: R$ 100",
    serves: "Ex: atende homens",
    services: "Destaque porte fisico, discricao, disponibilidade, com local e combinados objetivos.",
  },
  trans: {
    title: "Padrao para trans",
    headline: "Ex: Estilo namoradinha",
    priceLabel: "Valor forte no perfil: 1 hora",
    pricePlaceholder: "Ex: R$ 700",
    serves: "Ex: atende homens",
    services: "Destaque estilo, documento verificado, local, experiencias e atendimento completo.",
  },
};

function normalizeProfileForm(profileData: ProfileRow): ProfileForm {
  const normalizedProfile: ProfileForm = {
    ...emptyProfile,
    is_online: typeof profileData.is_online === "boolean" ? profileData.is_online : emptyProfile.is_online,
    profile_approval_status: ["pending", "approved", "rejected"].includes(String(profileData.profile_approval_status))
      ? (profileData.profile_approval_status as ApprovalStatus)
      : emptyProfile.profile_approval_status,
    user_document_path: typeof profileData.user_document_path === "string" ? profileData.user_document_path : null,
    user_document_name: typeof profileData.user_document_name === "string" ? profileData.user_document_name : null,
    user_document_back_path: typeof profileData.user_document_back_path === "string" ? profileData.user_document_back_path : null,
    user_document_back_name: typeof profileData.user_document_back_name === "string" ? profileData.user_document_back_name : null,
  };

  profileTextFields.forEach((field) => {
    const value = profileData[field];
    normalizedProfile[field] = typeof value === "string" ? value : emptyProfile[field];
  });

  return normalizedProfile;
}

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("resumo");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentBackUrl, setDocumentBackUrl] = useState("");
  const [confirmAction, setConfirmAction] = useState<null | { title: string; description: string; confirmLabel: string; onConfirm: () => void }>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [mediaItems, setMediaItems] = useState<ProfileMedia[]>([]);
  const [profileAnalytics, setProfileAnalytics] = useState<ProfileAnalytics>({
    profile_views: 0,
    whatsapp_clicks: 0,
  });

  const currentPlan = getPlanConfig(profile.active_plan || (isTrial ? "Basico" : "Top Prive"));
  const categoryGuide = categoryGuides[profile.type as keyof typeof categoryGuides] || categoryGuides.mulher;
  const approval = approvalCopy[profile.profile_approval_status];
  const trialPercent = trialDaysLeft === null ? 0 : Math.max(0, Math.min(100, (trialDaysLeft / TRIAL_DAYS) * 100));
  const usedPhotos = mediaItems.filter((item) => item.media_type === "photo" && item.approval_status !== "rejected").length;
  const usedVideos = mediaItems.filter((item) => item.media_type === "video" && item.approval_status !== "rejected").length;
  const availablePhotos = Math.max(0, currentPlan.limits.photos - usedPhotos);
  const availableVideos = Math.max(0, currentPlan.limits.videos - usedVideos);

  useEffect(() => {
    const syncTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const hashTab = window.location.hash.replace("#", "");
      const nextTab = isDashboardTab(tabParam) ? tabParam : isDashboardTab(hashTab) ? hashTab : null;

      if (nextTab) {
        setActiveTab(nextTab);
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);

    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);

    const url = new URL(window.location.href);
    if (tab === "resumo") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    url.hash = "";
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("hasActivePlan");
    sessionStorage.removeItem("hasActivePlan");
    router.push("/login");
  };

  const loadDocumentUrl = async (path: string | null, isBack: boolean = false) => {
    if (!path) {
      if (isBack) setDocumentBackUrl("");
      else setDocumentUrl("");
      return;
    }

    const { data } = await supabase.storage.from("user-documents").createSignedUrl(path, 60 * 10);
    if (isBack) setDocumentBackUrl(data?.signedUrl || "");
    else setDocumentUrl(data?.signedUrl || "");
  };

  const loadProfileMedia = async (profileId: string) => {
    const { data, error } = await supabase
      .from("profile_media")
      .select("id,file_name,media_type,storage_path,public_url,approval_status,is_cover,created_at")
      .eq("profile_id", profileId)
      .order("is_cover", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error) {
      setMediaItems((data || []) as ProfileMedia[]);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "name,type,whatsapp,location,state_uf,headline,age,neighborhood,price_15,price_30,price_60,overnight_price,serves,has_place,availability,payment_methods,services,specialties,restrictions,appearance,languages,description,active_plan,is_online,profile_approval_status,user_document_path,user_document_name,user_document_back_path,user_document_back_name",
        )
        .eq("id", user.id)
        .maybeSingle();

      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("status,plan,plan_key,current_period_end")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: analyticsData } = await supabase
        .from("profile_analytics")
        .select("profile_views,whatsapp_clicks")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (analyticsData) {
        setProfileAnalytics({
          profile_views: Number(analyticsData.profile_views) || 0,
          whatsapp_clicks: Number(analyticsData.whatsapp_clicks) || 0,
        });
      }

      const storedPlan = localStorage.getItem("hasActivePlan") || sessionStorage.getItem("hasActivePlan");
      const planStorage = localStorage.getItem("delirioSessionPersistence") === "session" ? sessionStorage : localStorage;
      const hasPaidPlan = isSubscriptionActive(subscriptionData);
      const subscriptionPlan =
        typeof subscriptionData?.plan === "string"
          ? subscriptionData.plan.trim()
          : typeof subscriptionData?.plan_key === "string"
            ? subscriptionData.plan_key.trim()
            : "";
      const profilePlan = typeof profileData?.active_plan === "string" ? profileData.active_plan.trim() : "";
      const savedPlan = hasPaidPlan ? subscriptionPlan || profilePlan : "";
      const paidDaysLeft = hasPaidPlan ? getSubscriptionDaysLeft(subscriptionData) : null;
      const daysLeft = getTrialDaysLeft(user.created_at);
      const hasActiveTrial = daysLeft > 0;
      let hasDashboardAccess = Boolean(savedPlan || hasActiveTrial);

      if (hasActiveTrial && !savedPlan) {
        setIsTrial(true);
        setTrialDaysLeft(daysLeft);
        setSubscriptionDaysLeft(null);
        localStorage.removeItem("hasActivePlan");
        sessionStorage.removeItem("hasActivePlan");
        planStorage.setItem("hasActivePlan", "trial");
      } else if (storedPlan === "trial") {
        localStorage.removeItem("hasActivePlan");
        sessionStorage.removeItem("hasActivePlan");
        hasDashboardAccess = Boolean(savedPlan);
      }

      if (savedPlan) {
        setIsTrial(false);
        setTrialDaysLeft(null);
        setSubscriptionDaysLeft(paidDaysLeft);
      }

      if (!hasDashboardAccess) {
        await supabase.rpc("sync_expired_profile_publication", { target_profile_id: user.id });
        router.push("/cobranca");
        return;
      }

      if (profileData) {
        const loadedProfile = normalizeProfileForm(profileData as ProfileRow);

        setProfile(loadedProfile);
        if (savedPlan && !storedPlan) {
          planStorage.setItem("hasActivePlan", savedPlan);
        }
        await loadDocumentUrl(loadedProfile.user_document_path, false);
        await loadDocumentUrl(loadedProfile.user_document_back_path, true);
      }

      await loadProfileMedia(user.id);
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  const buildProfilePayload = (overrides: Partial<ProfileForm> = {}) => {
    const nextProfile = { ...profile, ...overrides };

    return {
      id: userId,
      type: nextProfile.type,
      name: nextProfile.name.trim() || "Perfil sem nome",
      whatsapp: nextProfile.whatsapp.trim() || null,
      location: nextProfile.location.trim() || null,
      state_uf: nextProfile.state_uf || null,
      headline: nextProfile.headline.trim() || null,
      age: nextProfile.age.trim() || null,
      neighborhood: nextProfile.neighborhood.trim() || null,
      price_15: nextProfile.price_15.trim() || null,
      price_30: nextProfile.price_30.trim() || null,
      price_60: nextProfile.price_60.trim() || null,
      overnight_price: nextProfile.overnight_price.trim() || null,
      serves: nextProfile.serves.trim() || null,
      has_place: nextProfile.has_place,
      availability: nextProfile.availability.trim() || null,
      payment_methods: nextProfile.payment_methods.trim() || null,
      services: nextProfile.services.trim() || null,
      specialties: nextProfile.specialties.trim() || null,
      restrictions: nextProfile.restrictions.trim() || null,
      appearance: nextProfile.appearance.trim() || null,
      languages: nextProfile.languages.trim() || null,
      description: nextProfile.description.trim() || null,
      active_plan: nextProfile.active_plan,
      is_online: nextProfile.is_online,
      updated_at: new Date().toISOString(),
    };
  };

  const ensureProfileExists = async () => {
    const { error } = await supabase.from("profiles").upsert({
      ...buildProfilePayload(),
      updated_at: new Date().toISOString(),
    });

    return error;
  };

  const updateProfileField = <T extends keyof ProfileForm>(field: T, value: ProfileForm[T]) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const toggleListValue = (field: keyof Pick<ProfileForm, "serves" | "availability" | "payment_methods" | "services" | "specialties" | "languages">, value: string) => {
    setProfile((current) => {
      const values = current[field].split(",").map((item) => item.trim()).filter(Boolean);
      const nextValues = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
      return { ...current, [field]: nextValues.join(", ") };
    });
  };

  const hasListValue = (field: keyof Pick<ProfileForm, "serves" | "availability" | "payment_methods" | "services" | "specialties" | "languages">, value: string) => {
    return profile[field].split(",").map((item) => item.trim()).includes(value);
  };

  const handleOnlineToggle = async () => {
    if (!userId) return;

    const nextOnlineState = !profile.is_online;
    setProfile((current) => ({ ...current, is_online: nextOnlineState }));
    setStatusMessage("Atualizando status...");

    const { error } = await supabase
      .from("profiles")
      .update({ is_online: nextOnlineState, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      setProfile((current) => ({ ...current, is_online: !nextOnlineState }));
      setStatusMessage(`Erro ao atualizar status: ${error.message}`);
      return;
    }

    setStatusMessage(`Perfil ${nextOnlineState ? "online" : "offline"}.`);
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;

    setSaving(true);
    setStatusMessage("Enviando perfil para aprovação...");

    const { error } = await supabase.from("profiles").upsert({
      ...buildProfilePayload(),
      profile_verified: false,
      profile_approval_status: "pending",
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      setStatusMessage(`Erro ao salvar perfil: ${error.message}`);
      return;
    }

    setProfile((current) => ({ ...current, profile_approval_status: "pending" }));
    setStatusMessage("Perfil salvo e enviado para aceite da administração.");
    handleTabChange("resumo");
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !userId) return;

    const oversizedFile = files.find((file) => file.size > MAX_IMAGE_UPLOAD_BYTES);
    if (oversizedFile) {
      setStatusMessage(`O arquivo ${oversizedFile.name} passa de 10MB. Envie uma imagem menor.`);
      event.target.value = "";
      return;
    }

    const imageFiles = files.filter((file) => ALLOWED_IMAGE_TYPES.has(file.type));
    if (imageFiles.length !== files.length) {
      setStatusMessage("Envie fotos em JPG, PNG, WEBP ou GIF. HEIC/HEIF do celular precisa ser convertido antes.");
      event.target.value = "";
      return;
    }

    if (isCover && imageFiles.length > 1) {
      setStatusMessage("Envie apenas uma foto de capa por vez.");
      event.target.value = "";
      return;
    }

    if (!isCover && imageFiles.length > availablePhotos) {
      setStatusMessage(`Seu plano permite mais ${availablePhotos} foto(s) neste momento.`);
      event.target.value = "";
      return;
    }

    setUploadingMedia(true);
    setStatusMessage(isCover ? "Enviando capa para aprovação..." : "Enviando fotos para aprovação...");

    const profileError = await ensureProfileExists();
    if (profileError) {
      setUploadingMedia(false);
      setStatusMessage(`Erro ao preparar perfil para envio: ${profileError.message}`);
      event.target.value = "";
      return;
    }

    const rows = [];

    for (const file of imageFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const storagePath = `${userId}/${isCover ? "capa" : "foto"}-${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("profile-media").upload(storagePath, file, {
        contentType: file.type,
        upsert: true,
      });

      if (uploadError) {
        setUploadingMedia(false);
        setStatusMessage(`Erro ao enviar ${file.name}: ${uploadError.message}`);
        event.target.value = "";
        return;
      }

      const { data: urlData } = supabase.storage.from("profile-media").getPublicUrl(storagePath);
      rows.push({
        profile_id: userId,
        user_id: userId,
        file_name: file.name,
        media_type: "photo",
        mime_type: file.type,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        approval_status: "pending",
        is_cover: isCover,
        sort_order: isCover ? -1 : 0,
      });
    }

    const { error } = await supabase.from("profile_media").insert(rows);

    setUploadingMedia(false);
    event.target.value = "";

    if (error) {
      setStatusMessage(`Fotos enviadas, mas não entraram na fila: ${error.message}`);
      return;
    }

    setStatusMessage(isCover ? "Capa enviada para aprovação." : "Fotos enviadas para aprovação.");
    await loadProfileMedia(userId);
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !userId) return;

    const oversizedFile = files.find((file) => file.size > MAX_VIDEO_UPLOAD_BYTES);
    if (oversizedFile) {
      setStatusMessage(`O vídeo ${oversizedFile.name} passa de 50MB. Envie um vídeo menor.`);
      event.target.value = "";
      return;
    }

    const videoFiles = files.filter((file) => ALLOWED_VIDEO_TYPES.has(file.type));
    if (videoFiles.length !== files.length) {
      setStatusMessage("Envie vídeos em MP4, WEBM ou MOV.");
      event.target.value = "";
      return;
    }

    if (videoFiles.length > availableVideos) {
      setStatusMessage(`Seu plano permite mais ${availableVideos} vídeo(s) neste momento.`);
      event.target.value = "";
      return;
    }

    setUploadingMedia(true);
    setStatusMessage("Enviando vídeos para aprovação...");

    const profileError = await ensureProfileExists();
    if (profileError) {
      setUploadingMedia(false);
      setStatusMessage(`Erro ao preparar perfil para envio: ${profileError.message}`);
      event.target.value = "";
      return;
    }

    const rows = [];

    for (const file of videoFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const storagePath = `${userId}/video-${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("profile-media").upload(storagePath, file, {
        contentType: file.type,
        upsert: true,
      });

      if (uploadError) {
        setUploadingMedia(false);
        setStatusMessage(`Erro ao enviar ${file.name}: ${uploadError.message}`);
        event.target.value = "";
        return;
      }

      const { data: urlData } = supabase.storage.from("profile-media").getPublicUrl(storagePath);
      rows.push({
        profile_id: userId,
        user_id: userId,
        file_name: file.name,
        media_type: "video",
        mime_type: file.type,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        approval_status: "pending",
        is_cover: false,
        sort_order: 0,
      });
    }

    const { error } = await supabase.from("profile_media").insert(rows);

    setUploadingMedia(false);
    event.target.value = "";

    if (error) {
      setStatusMessage(`Vídeos enviados, mas não entraram na fila: ${error.message}`);
      return;
    }

    setStatusMessage("Vídeos enviados para aprovação.");
    await loadProfileMedia(userId);
  };

  const deleteMediaItem = async (item: ProfileMedia) => {
    if (!userId || deletingMediaId) return;

    setDeletingMediaId(item.id);
    setStatusMessage(`Excluindo ${item.media_type === "video" ? "vídeo" : "foto"}...`);

    const { error: storageError } = await supabase.storage.from("profile-media").remove([item.storage_path]);

    if (storageError) {
      setDeletingMediaId("");
      setStatusMessage(`Erro ao excluir arquivo: ${storageError.message}`);
      return;
    }

    const { error: deleteError } = await supabase
      .from("profile_media")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId);

    setDeletingMediaId("");

    if (deleteError) {
      setStatusMessage(`Arquivo removido, mas a foto continuou na lista: ${deleteError.message}`);
      await loadProfileMedia(userId);
      return;
    }

    setMediaItems((current) => current.filter((mediaItem) => mediaItem.id !== item.id));
    setStatusMessage(`${item.media_type === "video" ? "Vídeo" : "Foto"} excluído do perfil.`);
  };

  const handleMediaDelete = (item: ProfileMedia) => {
    setConfirmAction({
      title: `Excluir ${item.media_type === "video" ? "vídeo" : "foto"}`,
      description: `Tem certeza que deseja excluir ${item.file_name || "esta mídia"}? Essa ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      onConfirm: () => deleteMediaItem(item),
    });
  };

  const deleteDocument = async (isBack: boolean = false) => {
    const path = isBack ? profile.user_document_back_path : profile.user_document_path;
    if (!userId || !path) return;

    setUploadingDocument(true);
    setStatusMessage(`Excluindo ${isBack ? "verso" : "frente"} do documento...`);

    const { error: storageError } = await supabase.storage.from("user-documents").remove([path]);
    if (storageError) {
      setUploadingDocument(false);
      setStatusMessage(`Erro ao excluir documento: ${storageError.message}`);
      return;
    }

    const updates = isBack
      ? {
          user_document_back_path: null,
          user_document_back_name: null,
          user_document_back_mime: null,
          profile_verified: false,
          profile_approval_status: "pending",
          updated_at: new Date().toISOString(),
          ...(profile.user_document_path ? {} : { document_uploaded_at: null }),
        }
      : {
          user_document_path: null,
          user_document_name: null,
          user_document_mime: null,
          profile_verified: false,
          profile_approval_status: "pending",
          updated_at: new Date().toISOString(),
          ...(profile.user_document_back_path ? {} : { document_uploaded_at: null }),
        };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    setUploadingDocument(false);

    if (updateError) {
      setStatusMessage(`Documento removido, mas continuou vinculado ao perfil: ${updateError.message}`);
      return;
    }

    setProfile((current) => ({
      ...current,
      ...(isBack ? { user_document_back_path: null, user_document_back_name: null } : { user_document_path: null, user_document_name: null }),
      profile_approval_status: "pending",
    }));

    if (isBack) setDocumentBackUrl("");
    else setDocumentUrl("");

    setStatusMessage(`Documento (${isBack ? "verso" : "frente"}) excluído do perfil.`);
  };

  const handleDocumentDelete = (isBack: boolean = false) => {
    const name = isBack ? profile.user_document_back_name : profile.user_document_name;
    setConfirmAction({
      title: `Excluir ${isBack ? "verso" : "frente"} do documento`,
      description: `Tem certeza que deseja excluir ${name || "o documento anexado"}? O perfil voltará para análise.`,
      confirmLabel: "Excluir documento",
      onConfirm: () => deleteDocument(isBack),
    });
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, isBack: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setStatusMessage("Anexe um documento em PDF, JPEG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      setStatusMessage("O documento passa de 10MB. Envie um arquivo menor.");
      event.target.value = "";
      return;
    }

    setUploadingDocument(true);
    setStatusMessage("Enviando documento...");

    const profileError = await ensureProfileExists();
    if (profileError) {
      setUploadingDocument(false);
      setStatusMessage(`Erro ao preparar perfil para o documento: ${profileError.message}`);
      event.target.value = "";
      return;
    }

    const fileExtension = file.name.split('.').pop() || 'pdf';
    const documentPath = `${userId}/documento-${Date.now()}.${fileExtension}`;
    const { error: uploadError } = await supabase.storage.from("user-documents").upload(documentPath, file, {
      contentType: file.type,
      upsert: true,
    });

    if (uploadError) {
      setUploadingDocument(false);
      setStatusMessage(`Erro ao enviar documento: ${uploadError.message}`);
      event.target.value = "";
      return;
    }

    const updates = isBack
      ? {
          user_document_back_path: documentPath,
          user_document_back_name: file.name,
          user_document_back_mime: file.type,
        }
      : {
          user_document_path: documentPath,
          user_document_name: file.name,
          user_document_mime: file.type,
        };

    const { error: updateError } = await supabase.from("profiles").upsert({
      ...buildProfilePayload(),
      ...updates,
      document_uploaded_at: new Date().toISOString(),
      profile_verified: false,
      profile_approval_status: "pending",
      updated_at: new Date().toISOString(),
    });

    setUploadingDocument(false);
    event.target.value = "";

    if (updateError) {
      setStatusMessage(`Documento enviado, mas não foi vinculado ao perfil: ${updateError.message}`);
      return;
    }

    setProfile((current) => ({
      ...current,
      ...updates,
      profile_approval_status: "pending",
    }));
    await loadDocumentUrl(documentPath, isBack);
    setStatusMessage(`Documento (${isBack ? "verso" : "frente"}) anexado e enviado para análise.`);
  };

  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/parcerias-promocoes">Parcerias</Link>
          <Link href="/redefinir-senha">Trocar senha</Link>
          <button className="nav-button" type="button" onClick={handleLogout}>Sair</button>
        </nav>
      </header>

      <main className="app-page dashboard dashboard-page">
        <div className="page-title dashboard-title">
          <div>
            <p className="eyebrow">Painel</p>
            <h1>Dashboard</h1>
            <p className="page-intro">Gerencie seus dados, visibilidade, fotos e documentos.</p>
          </div>
          <Link className="button button--primary" href="/cobranca">
            Upgrade de plano
          </Link>
        </div>

        {loading ? (
          <section className="empty-state">
            <p>Carregando painel...</p>
          </section>
        ) : (
          <>
            <section className="dashboard-summary" aria-label="Resumo do perfil">
              <article className="dashboard-card dashboard-card--main">
                <span className="section-kicker">Aceite</span>
                <h2>{approval.title}</h2>
                <p>{approval.description}</p>
              </article>

              <article className="dashboard-card dashboard-card--main dashboard-card--trial">
                <span className="section-kicker">Plano</span>
                <h2>{currentPlan.displayName}</h2>
                <p>{currentPlan.mediaLabel}</p>
                {isTrial && trialDaysLeft !== null && (
                  <div className="trial-progress" aria-label={`${trialDaysLeft} dias restantes`}>
                    <div className="trial-progress__top">
                      <span>Teste gratuito</span>
                      <strong>{trialDaysLeft} dia(s)</strong>
                    </div>
                    <div className="trial-progress__track">
                      <span style={{ width: `${trialPercent}%` }} />
                    </div>
                  </div>
                )}
                {!isTrial && subscriptionDaysLeft !== null && (
                  <div className="trial-progress" aria-label={`${subscriptionDaysLeft} dias de assinatura restantes`}>
                    <div className="trial-progress__top">
                      <span>Assinatura ativa</span>
                      <strong>{subscriptionDaysLeft} dia(s)</strong>
                    </div>
                    <div className="trial-progress__track">
                      <span style={{ width: `${Math.max(0, Math.min(100, (subscriptionDaysLeft / 30) * 100))}%` }} />
                    </div>
                  </div>
                )}
              </article>

              <article className="dashboard-card dashboard-card--main">
                <span className="section-kicker">Visibilidade</span>
                <h2>{profile.is_online ? "Online" : "Offline"}</h2>
                <p>{profile.is_online ? "Seu perfil esta marcado como ativo." : "Seu perfil esta marcado como inativo."}</p>
                <button className="button button--primary" type="button" onClick={handleOnlineToggle}>
                  {profile.is_online ? "Ficar offline" : "Ficar online"}
                </button>
              </article>

              <article className="dashboard-card dashboard-card--metric">
                <span className="section-kicker">Aberturas</span>
                <h2>{profileAnalytics.profile_views.toLocaleString("pt-BR")}</h2>
                <p>Visualizações do seu anúncio.</p>
              </article>

              <article className="dashboard-card dashboard-card--metric">
                <span className="section-kicker">WhatsApp</span>
                <h2>{profileAnalytics.whatsapp_clicks.toLocaleString("pt-BR")}</h2>
                <p>Cliques no botão de contato.</p>
              </article>
            </section>

            <div className="dashboard-tabs" role="tablist" aria-label="Secoes do dashboard">
              {[
                { id: "resumo", label: "Visao Geral" },
                { id: "editar", label: "Editar Perfil" },
                { id: "fotos", label: "Fotos" },
                { id: "documento", label: "Documentos" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={activeTab === tab.id ? "is-active" : ""}
                  onClick={() => handleTabChange(tab.id as DashboardTab)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <section className="dashboard-workspace">
              {activeTab === "resumo" && (
                <div className="dashboard-stack">
                  <div>
                    <span className="section-kicker">Resumo</span>
                    <h2>Dados atuais</h2>
                  </div>

                  <div className="profile-public-preview">
                    <article className="profile-card preview-card-inline">
                      <div className="profile-card__body">
                        <span className="tag tag--premium">{currentPlan.displayName}</span>
                        <h2>{profile.name || "Nome artistico"}</h2>
                        {profile.headline && <p>{profile.headline}</p>}
                        <p>{profile.location || "Localização"}</p>
                        {profile.description && <p>{profile.description}</p>}
                        <div className="trust-row">
                          {profile.is_online && <span className="trust-pill trust-pill--online">Online</span>}
                          {profile.profile_approval_status === "approved" && <span className="trust-pill trust-pill--verified">Verificado</span>}
                        </div>
                      </div>
                    </article>

                    <div className="dashboard-facts">
                      <article>
                        <strong>Categoria</strong>
                        <p>{profile.type || "Não informada"}</p>
                      </article>
                      <article>
                        <strong>WhatsApp</strong>
                        <p>{profile.whatsapp || "Não informado"}</p>
                      </article>
                      <article>
                        <strong>Valor inicial</strong>
                        <p>{profile.price_15 || profile.price_30 || profile.price_60 || "Não informado"}</p>
                      </article>
                      <article>
                        <strong>Atendimento</strong>
                        <p>{profile.serves || "Não informado"}</p>
                      </article>
                      <article>
                        <strong>Fotos</strong>
                        <p>{usedPhotos}/{currentPlan.limits.photos} usadas</p>
                      </article>
                    </div>
                  </div>

                  {statusMessage && <p className="status-message" aria-live="polite">{statusMessage}</p>}
                </div>
              )}

              {activeTab === "editar" && (
                <form className="model-profile-form dashboard-stack" onSubmit={handleSaveProfile}>
                  <div>
                    <span className="section-kicker">Perfil público</span>
                    <h2>Informações exibidas no perfil</h2>
                    <p>Preencha os dados principais, valores, atendimento e preferências que formam a página pública do perfil.</p>
                  </div>

                  <section className="dashboard-profile-guide">
                    <div>
                      <span className="section-kicker">{categoryGuide.title}</span>
                      <h3>{categoryGuide.headline}</h3>
                      <p>{categoryGuide.services}</p>
                    </div>
                    <div className="dashboard-guide-grid">
                      <article>
                        <strong>{categoryGuide.priceLabel}</strong>
                        <p>{categoryGuide.pricePlaceholder}</p>
                      </article>
                      <article>
                        <strong>Atendimento</strong>
                        <p>{categoryGuide.serves}</p>
                      </article>
                      <article>
                        <strong>Localização</strong>
                        <p>Bairro + cidade/UF + se tem local</p>
                      </article>
                    </div>
                  </section>

                  <fieldset className="dashboard-fieldset">
                    <legend>Identificacao</legend>
                  <div className="dashboard-form-grid">
                    <label className="input-group">
                      <span>Nome artistico</span>
                      <input
                        value={profile.name}
                        onChange={(event) => updateProfileField("name", event.target.value)}
                        type="text"
                        placeholder="Ex: Ana Santos"
                      />
                    </label>

                    <label className="input-group">
                      <span>Categoria exibida</span>
                      <select value={profile.type} onChange={(event) => updateProfileField("type", event.target.value)}>
                        <option value="mulher">Mulher</option>
                        <option value="homem">Homem</option>
                        <option value="trans">Trans</option>
                      </select>
                    </label>

                    <label className="input-group">
                      <span>Idade</span>
                      <input
                        value={profile.age}
                        onChange={(event) => updateProfileField("age", event.target.value)}
                        type="text"
                        placeholder="Ex: 25 anos"
                      />
                    </label>

                    <label className="input-group">
                      <span>Frase de status</span>
                      <input
                        value={profile.headline}
                        onChange={(event) => updateProfileField("headline", event.target.value)}
                        type="text"
                        placeholder={categoryGuide.headline}
                      />
                    </label>

                    <label className="input-group">
                      <span>Localização pública</span>
                      <input
                        value={profile.location}
                        onChange={(event) => updateProfileField("location", event.target.value)}
                        type="text"
                        placeholder="Cidade ou regiao"
                      />
                    </label>

                    <label className="input-group">
                      <span>Estado (UF)</span>
                      <select value={profile.state_uf} onChange={(event) => updateProfileField("state_uf", event.target.value)}>
                        <option value="">Selecione</option>
                        {BRAZIL_UFS.map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </label>

                    <label className="input-group">
                      <span>Bairro ou regiao</span>
                      <input
                        value={profile.neighborhood}
                        onChange={(event) => updateProfileField("neighborhood", event.target.value)}
                        type="text"
                        placeholder="Ex: Centro"
                      />
                    </label>

                    <label className="input-group">
                      <span>WhatsApp público</span>
                      <input
                        value={profile.whatsapp}
                        onChange={(event) => updateProfileField("whatsapp", event.target.value)}
                        type="tel"
                        placeholder="(00) 00000-0000"
                      />
                    </label>

                    <label className="input-group">
                      <span>Plano exibido</span>
                      <input value={currentPlan.displayName} type="text" readOnly />
                    </label>

                    <label className="input-group">
                      <span>Status atual</span>
                      <input value={profile.is_online ? "Online" : "Offline"} type="text" readOnly />
                    </label>
                  </div>
                  </fieldset>

                  <fieldset className="dashboard-fieldset">
                    <legend>Valores e local</legend>
                    <div className="dashboard-form-grid">
                      <label className="input-group">
                        <span>Valor 15 min</span>
                        <input value={profile.price_15} onChange={(event) => updateProfileField("price_15", event.target.value)} type="text" placeholder={profile.type === "homem" ? categoryGuide.pricePlaceholder : "Ex: R$ 350"} />
                      </label>
                      <label className="input-group">
                        <span>Valor 30 min</span>
                        <input value={profile.price_30} onChange={(event) => updateProfileField("price_30", event.target.value)} type="text" placeholder="Ex: R$ 500" />
                      </label>
                      <label className="input-group">
                        <span>Valor 1 hora</span>
                        <input value={profile.price_60} onChange={(event) => updateProfileField("price_60", event.target.value)} type="text" placeholder={profile.type === "trans" ? categoryGuide.pricePlaceholder : "Ex: R$ 800"} />
                      </label>
                      <label className="input-group">
                        <span>Pernoite</span>
                        <input value={profile.overnight_price} onChange={(event) => updateProfileField("overnight_price", event.target.value)} type="text" placeholder="Ex: Sob consulta" />
                      </label>
                      <label className="input-group">
                        <span>Local de atendimento</span>
                        <select value={profile.has_place} onChange={(event) => updateProfileField("has_place", event.target.value)}>
                          <option value="nao_informado">Não informado</option>
                          <option value="com_local">Com local</option>
                          <option value="sem_local">Sem local</option>
                          <option value="hotel_motel">Hotel ou motel</option>
                          <option value="a_combinar">A combinar</option>
                        </select>
                      </label>
                      <label className="input-group">
                        <span>Atendimento</span>
                        <input value={profile.serves} onChange={(event) => updateProfileField("serves", event.target.value)} type="text" placeholder={categoryGuide.serves} />
                        <div className="quick-options">
                          {predefinedOptions.serves.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={hasListValue("serves", option) ? "is-selected" : ""}
                              onClick={() => toggleListValue("serves", option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="dashboard-fieldset">
                    <legend>Atendimento e detalhes</legend>
                    <div className="dashboard-form-grid">
                      <label className="input-group input-group--wide">
                        <span>Horários de atendimento</span>
                        <textarea value={profile.availability} onChange={(event) => updateProfileField("availability", event.target.value)} rows={3} placeholder="Ex: Segunda a sabado, das 10h as 22h" />
                        <div className="quick-options">
                          {predefinedOptions.availability.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={hasListValue("availability", option) ? "is-selected" : ""}
                              onClick={() => toggleListValue("availability", option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </label>
                      <label className="input-group input-group--wide">
                        <span>Formas de pagamento</span>
                        <textarea value={profile.payment_methods} onChange={(event) => updateProfileField("payment_methods", event.target.value)} rows={3} placeholder="Ex: Pix, dinheiro, cartao" />
                        <div className="quick-options">
                          {predefinedOptions.payment_methods.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={hasListValue("payment_methods", option) ? "is-selected" : ""}
                              onClick={() => toggleListValue("payment_methods", option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </label>
                      <label className="input-group input-group--wide">
                        <span>O que faz</span>
                        <textarea value={profile.services} onChange={(event) => updateProfileField("services", event.target.value)} rows={4} placeholder={categoryGuide.services} />
                        <div className="quick-options">
                          {predefinedOptions.services.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={hasListValue("services", option) ? "is-selected" : ""}
                              onClick={() => toggleListValue("services", option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </label>
                      <label className="input-group input-group--wide">
                        <span>Diferenciais</span>
                        <textarea value={profile.specialties} onChange={(event) => updateProfileField("specialties", event.target.value)} rows={3} placeholder="Ex: massagem, jantar, viagem, atendimento premium" />
                        <div className="quick-options">
                          {predefinedOptions.specialties.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={hasListValue("specialties", option) ? "is-selected" : ""}
                              onClick={() => toggleListValue("specialties", option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </label>
                      <label className="input-group input-group--wide">
                        <span>Limites e restricoes</span>
                        <textarea value={profile.restrictions} onChange={(event) => updateProfileField("restrictions", event.target.value)} rows={3} placeholder="Informe o que não atende ou condições importantes" />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="dashboard-fieldset">
                    <legend>Aparencia e idiomas</legend>
                    <div className="dashboard-form-grid">
                      <label className="input-group input-group--wide">
                        <span>Caracteristicas fisicas</span>
                        <textarea value={profile.appearance} onChange={(event) => updateProfileField("appearance", event.target.value)} rows={3} placeholder="Ex: altura, cabelo, olhos, corpo, tatuagens" />
                      </label>
                      <label className="input-group input-group--wide">
                        <span>Idiomas</span>
                        <input value={profile.languages} onChange={(event) => updateProfileField("languages", event.target.value)} type="text" placeholder="Ex: Português, inglês, espanhol" />
                        <div className="quick-options">
                          {predefinedOptions.languages.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={hasListValue("languages", option) ? "is-selected" : ""}
                              onClick={() => toggleListValue("languages", option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </label>
                    </div>
                  </fieldset>

                  <label className="input-group input-group--wide">
                    <span>Descrição pública</span>
                    <textarea
                      value={profile.description}
                      onChange={(event) => updateProfileField("description", event.target.value)}
                      rows={6}
                      placeholder="Texto que sera exibido no perfil"
                    />
                  </label>

                  <div className="form-actions">
                    <button className="button button--primary" type="submit" disabled={saving}>
                      {saving ? "Salvando..." : "Salvar e enviar para aceite"}
                    </button>
                    {statusMessage && <p className="status-message" aria-live="polite">{statusMessage}</p>}
                  </div>
                </form>
              )}

              {activeTab === "fotos" && (
                <div className="dashboard-stack">
                  <div className="dashboard-section-header">
                    <div>
                      <span className="section-kicker">Mídia</span>
                      <h2>Fotos e vídeos para aprovação</h2>
                      <p>{usedPhotos}/{currentPlan.limits.photos} fotos e {usedVideos}/{currentPlan.limits.videos} vídeos usados no plano {currentPlan.displayName}. A capa também passa por aprovação.</p>
                    </div>
                    <div className="media-upload-actions">
                      <label className="button button--ghost">
                        {uploadingMedia ? "Enviando..." : "Adicionar capa"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleMediaUpload(event, true)}
                          disabled={uploadingMedia}
                          style={{ display: "none" }}
                        />
                      </label>
                      <label className={`button button--primary ${availablePhotos === 0 ? "is-disabled" : ""}`}>
                        {uploadingMedia ? "Enviando..." : "Adicionar fotos"}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(event) => handleMediaUpload(event)}
                          disabled={uploadingMedia || availablePhotos === 0}
                          style={{ display: "none" }}
                        />
                      </label>
                      {currentPlan.limits.videos > 0 && (
                        <label className={`button button--ghost ${availableVideos === 0 ? "is-disabled" : ""}`}>
                          {uploadingMedia ? "Enviando..." : "Adicionar vídeos"}
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            multiple
                            onChange={handleVideoUpload}
                            disabled={uploadingMedia || availableVideos === 0}
                            style={{ display: "none" }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="media-approval-grid">
                    {mediaItems.length === 0 ? (
                      <section className="empty-state empty-state--compact">
                        <p>Nenhuma mídia enviada para aprovação.</p>
                      </section>
                    ) : (
                      mediaItems.map((item) => (
                        <article className="media-approval-card" key={item.id}>
                          <div className="watermarked-media watermarked-media--approval">
                            {item.media_type === "video" && item.public_url ? (
                              <video src={item.public_url} controls muted />
                            ) : item.public_url ? (
                              <img src={item.public_url} alt={item.file_name || "Foto enviada"} />
                            ) : (
                              <div />
                            )}
                          </div>
                          <div>
                            <strong>{item.file_name || (item.media_type === "video" ? "Vídeo enviado" : "Foto enviada")}</strong>
                            {item.is_cover && <span data-status="cover">Capa</span>}
                            <span data-status="type">{item.media_type === "video" ? "Vídeo" : "Foto"}</span>
                            <span data-status={item.approval_status}>{mediaStatusCopy[item.approval_status]}</span>
                            <button
                              className="media-delete-button"
                              type="button"
                              onClick={() => handleMediaDelete(item)}
                              disabled={deletingMediaId === item.id}
                            >
                              {deletingMediaId === item.id ? "Excluindo..." : `Excluir ${item.media_type === "video" ? "vídeo" : "foto"}`}
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>

                  {statusMessage && <p className="status-message" aria-live="polite">{statusMessage}</p>}
                </div>
              )}

              {activeTab === "documento" && (
                <div className="dashboard-stack">
                  <div>
                    <span className="section-kicker">Documentos</span>
                    <h2>Documento para Aprovação</h2>
                    <p>Envie foto da frente e verso do seu RG ou CNH, ou um arquivo PDF com as duas partes. Necessário para aprovação do perfil.</p>
                  </div>

                  <div className="dashboard-form-grid" style={{ gap: "2rem" }}>
                    <div className="document-upload-box" style={{ padding: "1.5rem", border: "1px solid rgba(245, 230, 200, 0.1)", borderRadius: "0.5rem" }}>
                      <h3>Frente (ou PDF Completo)</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                        {profile.user_document_name || "Nenhum arquivo anexado."}
                      </p>

                      <div className="form-actions" style={{ justifyContent: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
                        <label className="button button--ghost button--small">
                          {uploadingDocument ? "Enviando..." : "Anexar frente"}
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/webp"
                            onChange={(e) => handleDocumentUpload(e, false)}
                            disabled={uploadingDocument}
                            style={{ display: "none" }}
                          />
                        </label>

                        {documentUrl && (
                          <a className="button button--primary button--small" href={documentUrl} target="_blank" rel="noreferrer">
                            Visualizar
                          </a>
                        )}
                        {profile.user_document_path && (
                          <button className="button button--ghost button--small" type="button" onClick={() => handleDocumentDelete(false)} disabled={uploadingDocument}>
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="document-upload-box" style={{ padding: "1.5rem", border: "1px solid rgba(245, 230, 200, 0.1)", borderRadius: "0.5rem" }}>
                      <h3>Verso (Opcional)</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                        {profile.user_document_back_name || "Nenhum arquivo anexado."}
                      </p>

                      <div className="form-actions" style={{ justifyContent: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
                        <label className="button button--ghost button--small">
                          {uploadingDocument ? "Enviando..." : "Anexar verso"}
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/webp"
                            onChange={(e) => handleDocumentUpload(e, true)}
                            disabled={uploadingDocument}
                            style={{ display: "none" }}
                          />
                        </label>

                        {documentBackUrl && (
                          <a className="button button--primary button--small" href={documentBackUrl} target="_blank" rel="noreferrer">
                            Visualizar
                          </a>
                        )}
                        {profile.user_document_back_path && (
                          <button className="button button--ghost button--small" type="button" onClick={() => handleDocumentDelete(true)} disabled={uploadingDocument}>
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {statusMessage && <p className="status-message" aria-live="polite">{statusMessage}</p>}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      {confirmAction && (
        <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div className="confirm-modal__panel">
            <span className="section-kicker">Confirmar exclusão</span>
            <h2 id="confirm-modal-title">{confirmAction.title}</h2>
            <p>{confirmAction.description}</p>
            <div className="confirm-modal__actions">
              <button
                className="button button--ghost"
                type="button"
                onClick={() => setConfirmAction(null)}
              >
                Cancelar
              </button>
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  const action = confirmAction.onConfirm;
                  setConfirmAction(null);
                  action();
                }}
              >
                {confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
