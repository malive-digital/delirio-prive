"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";

type Profile = {
  id: string;
  type: string | null;
  name: string | null;
  whatsapp: string | null;
  location: string | null;
  description: string | null;
  active_plan: string | null;
  is_online: boolean | null;
  profile_verified: boolean | null;
  profile_approval_status: "pending" | "approved" | "rejected" | null;
  user_document_path: string | null;
  user_document_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ProfileMedia = {
  id: string;
  profile_id: string;
  user_id: string;
  file_name: string | null;
  media_type: "photo" | "video";
  public_url: string | null;
  storage_path: string;
  approval_status: "pending" | "approved" | "rejected";
  is_cover: boolean | null;
  created_at: string | null;
  profiles?: {
    name: string | null;
    type: string | null;
    location: string | null;
  } | null;
};

type Subscription = {
  id?: string;
  user_id?: string;
  profile_id?: string;
  plan?: string;
  plan_key?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type PartnershipPromotion = {
  id: string;
  title: string;
  partner_name: string;
  description: string;
  promotion_label: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
};

const emptyPartnershipForm = {
  title: "",
  partner_name: "",
  description: "",
  promotion_label: "",
  image_url: "",
  link_url: "",
  sort_order: "0",
  is_active: true,
};

const DOCUMENTS_PER_PAGE = 10;
const PROFILES_PER_PAGE = 10;

const emptyProfileEditForm = {
  name: "",
  type: "mulher",
  whatsapp: "",
  location: "",
  active_plan: "Basico",
  is_online: false,
  profile_approval_status: "pending" as "pending" | "approved",
};

const normalizeProfileMediaRows = (rows: unknown[]): ProfileMedia[] => {
  return rows.map((row) => {
    const item = row as ProfileMedia & { profiles?: ProfileMedia["profiles"] | ProfileMedia["profiles"][] };
    const linkedProfile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;

    return {
      ...item,
      profiles: linkedProfile || null,
    };
  });
};

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@delirioprive.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const formatDateTimeSP = (value?: string | null) => {
  if (!value) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
};

const pendingProfileDocuments = (profiles: Profile[]) => {
  return profiles.filter((profile) => profile.profile_approval_status === "pending" && profile.user_document_path);
};

const allProfileDocuments = (profiles: Profile[]) => {
  return profiles.filter((profile) => profile.user_document_path);
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("aprovacoes");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mediaItems, setMediaItems] = useState<ProfileMedia[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [partnerships, setPartnerships] = useState<PartnershipPromotion[]>([]);
  const [partnershipForm, setPartnershipForm] = useState(emptyPartnershipForm);
  const [partnershipStatus, setPartnershipStatus] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentPage, setDocumentPage] = useState(1);
  const [profilePage, setProfilePage] = useState(1);
  const [editingProfileId, setEditingProfileId] = useState("");
  const [profileEditForm, setProfileEditForm] = useState(emptyProfileEditForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Carregando dados reais da base...");
  const [adminActionMessage, setAdminActionMessage] = useState("");

  const loadPartnerships = async () => {
    const { data } = await supabase
      .from("partnership_promotions")
      .select("id,title,partner_name,description,promotion_label,image_url,link_url,is_active,sort_order,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    setPartnerships(data || []);
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,type,name,whatsapp,location,description,active_plan,is_online,profile_verified,profile_approval_status,user_document_path,user_document_name,created_at,updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage(`Não foi possível carregar perfis: ${error.message}`);
      return;
    }

    setProfiles(data || []);
    setMessage("Dados carregados da base Supabase.");
  };

  const loadProfileMedia = async () => {
    const { data, error } = await supabase
      .from("profile_media")
      .select("id,profile_id,user_id,file_name,media_type,public_url,storage_path,approval_status,is_cover,created_at,profiles(name,type,location)")
      .order("is_cover", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error) {
      setMediaItems(normalizeProfileMediaRows(data || []));
    }
  };

  useEffect(() => {
    const loadAdminData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        router.push("/login");
        return;
      }

      const userEmail = user.email.toLowerCase();
      let isAdmin = ADMIN_EMAILS.includes(userEmail);

      const [roleResult, legacyAdminResult] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
        supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(),
      ]);

      if (roleResult.data?.role === "admin" || legacyAdminResult.data) {
        isAdmin = true;
      }

      if (!isAdmin) {
        router.push("/dashboard");
        return;
      }

      const [profilesResult, subscriptionsResult, mediaResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,type,name,whatsapp,location,description,active_plan,is_online,profile_verified,profile_approval_status,user_document_path,user_document_name,created_at,updated_at")
          .order("updated_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
        supabase
          .from("profile_media")
          .select("id,profile_id,user_id,file_name,media_type,public_url,storage_path,approval_status,is_cover,created_at,profiles(name,type,location)")
          .order("is_cover", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (profilesResult.error) {
        setMessage(`Não foi possível carregar perfis: ${profilesResult.error.message}`);
      } else {
        setProfiles(profilesResult.data || []);
        setMessage("Dados carregados da base Supabase.");
      }

      if (!subscriptionsResult.error) {
        setSubscriptions(subscriptionsResult.data || []);
      }

      if (!mediaResult.error) {
        setMediaItems(normalizeProfileMediaRows(mediaResult.data || []));
      }

      await loadPartnerships();
      setLoading(false);
    };

    loadAdminData();
  }, [router]);

  const planCounts = useMemo(() => {
    return profiles.reduce<Record<string, number>>((acc, profile) => {
      const plan = getPlanConfig(profile.active_plan || "Basico").displayName;
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});
  }, [profiles]);

  const activeProfiles = profiles.filter((profile) => profile.is_online || profile.profile_verified).length;
  const manageableProfiles = useMemo(() => {
    const genericNames = new Set(["modelo", "nova modelo", "perfil sem nome"]);

    return profiles.filter((profile) => {
      const status = profile.profile_approval_status;
      const name = profile.name?.trim().toLowerCase() || "";

      return Boolean(name) && !genericNames.has(name) && (status === "approved" || status === "pending");
    });
  }, [profiles]);
  const profilePageCount = Math.max(1, Math.ceil(manageableProfiles.length / PROFILES_PER_PAGE));
  const visibleManageableProfiles = manageableProfiles.slice(
    (profilePage - 1) * PROFILES_PER_PAGE,
    profilePage * PROFILES_PER_PAGE,
  );
  const documentProfiles = useMemo(() => {
    const normalizedSearch = documentSearch.trim().toLowerCase();

    return allProfileDocuments(profiles).filter((profile) => {
      if (!normalizedSearch) return true;

      return (profile.name || "").toLowerCase().includes(normalizedSearch);
    });
  }, [documentSearch, profiles]);
  const documentPageCount = Math.max(1, Math.ceil(documentProfiles.length / DOCUMENTS_PER_PAGE));
  const visibleDocumentProfiles = documentProfiles.slice(
    (documentPage - 1) * DOCUMENTS_PER_PAGE,
    documentPage * DOCUMENTS_PER_PAGE,
  );

  useEffect(() => {
    if (documentPage > documentPageCount) {
      setDocumentPage(documentPageCount);
    }
  }, [documentPage, documentPageCount]);

  useEffect(() => {
    if (profilePage > profilePageCount) {
      setProfilePage(profilePageCount);
    }
  }, [profilePage, profilePageCount]);

  const handlePartnershipSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPartnershipStatus("Salvando parceria...");

    const { error } = await supabase.from("partnership_promotions").insert({
      title: partnershipForm.title.trim(),
      partner_name: partnershipForm.partner_name.trim(),
      description: partnershipForm.description.trim(),
      promotion_label: partnershipForm.promotion_label.trim() || null,
      image_url: partnershipForm.image_url.trim(),
      link_url: partnershipForm.link_url.trim() || null,
      sort_order: Number(partnershipForm.sort_order) || 0,
      is_active: partnershipForm.is_active,
    });

    if (error) {
      setPartnershipStatus(`Erro ao salvar: ${error.message}`);
      return;
    }

    setPartnershipForm(emptyPartnershipForm);
    setPartnershipStatus("Parceria publicada com sucesso.");
    await loadPartnerships();
  };

  const togglePartnership = async (item: PartnershipPromotion) => {
    await supabase
      .from("partnership_promotions")
      .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    await loadPartnerships();
  };

  const updateProfileApproval = async (profileId: string, status: "approved" | "rejected") => {
    setAdminActionMessage("Atualizando aceite do perfil...");
    const profile = profiles.find((item) => item.id === profileId);

    if (status === "approved" && !profile?.user_document_path) {
      setAdminActionMessage("Nao e possivel aprovar: o perfil ainda nao enviou a documentacao em PDF.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({
        profile_approval_status: status,
        profile_verified: status === "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (error) {
      setAdminActionMessage(`Erro ao atualizar perfil: ${error.message}`);
      return;
    }

    setAdminActionMessage(status === "approved" ? "Perfil aprovado." : "Perfil recusado.");
    await loadProfiles();
  };

  const updateProfileMediaApproval = async (mediaId: string, status: "approved" | "rejected") => {
    setAdminActionMessage("Atualizando aceite da foto...");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profile_media")
      .update({
        approval_status: status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mediaId);

    if (error) {
      setAdminActionMessage(`Erro ao atualizar foto: ${error.message}`);
      return;
    }

    setAdminActionMessage(status === "approved" ? "Foto aprovada." : "Foto recusada.");
    await loadProfileMedia();
  };

  const startProfileEdit = (profile: Profile) => {
    setEditingProfileId(profile.id);
    setProfileEditForm({
      name: profile.name || "",
      type: profile.type || "mulher",
      whatsapp: profile.whatsapp || "",
      location: profile.location || "",
      active_plan: profile.active_plan || "Basico",
      is_online: Boolean(profile.is_online),
      profile_approval_status: profile.profile_approval_status === "approved" ? "approved" : "pending",
    });
  };

  const cancelProfileEdit = () => {
    setEditingProfileId("");
    setProfileEditForm(emptyProfileEditForm);
  };

  const saveProfileEdit = async () => {
    if (!editingProfileId) return;

    setAdminActionMessage("Salvando perfil...");

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profileEditForm.name.trim() || null,
        type: profileEditForm.type,
        whatsapp: profileEditForm.whatsapp.trim() || null,
        location: profileEditForm.location.trim() || null,
        active_plan: profileEditForm.active_plan,
        is_online: profileEditForm.is_online,
        profile_approval_status: profileEditForm.profile_approval_status,
        profile_verified: profileEditForm.profile_approval_status === "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingProfileId);

    if (error) {
      setAdminActionMessage(`Erro ao salvar perfil: ${error.message}`);
      return;
    }

    setAdminActionMessage("Perfil atualizado.");
    cancelProfileEdit();
    await loadProfiles();
  };

  const deleteProfile = async (profile: Profile) => {
    const confirmed = window.confirm(`Excluir o perfil de ${profile.name || "sem nome"}? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setAdminActionMessage("Excluindo perfil...");

    await supabase.from("profile_media").delete().eq("profile_id", profile.id);
    const { error } = await supabase.from("profiles").delete().eq("id", profile.id);

    if (error) {
      setAdminActionMessage(`Erro ao excluir perfil: ${error.message}`);
      return;
    }

    if (editingProfileId === profile.id) {
      cancelProfileEdit();
    }

    setAdminActionMessage("Perfil excluído.");
    await Promise.all([loadProfiles(), loadProfileMedia()]);
  };

  const viewUserDocument = async (path: string | null) => {
    if (!path) return;

    const { data, error } = await supabase.storage.from("user-documents").createSignedUrl(path, 60 * 10);
    if (error || !data?.signedUrl) {
      setAdminActionMessage(`Não foi possível abrir o documento: ${error?.message || "URL indisponível"}`);
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="entry-page" style={{ overflowX: "hidden" }}>
      <header className="app-header" style={{ borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
        <Link className="brand" href="/">
          <span className="brand__mark" style={{ background: "var(--gold-primary)", color: "#111" }}>ADM</span>
          <span>Painel Administrativo</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação administrativa">
          <Link href="/">Site</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Trocar usuário</Link>
        </nav>
      </header>

      <main className="app-page dashboard" style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Gestão Geral da Plataforma</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>{message}</p>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(245, 230, 200, 0.1)", paddingBottom: "1rem", overflowX: "auto" }}>
          {[
            { id: "aprovacoes", label: "Aprovação de Mídia" },
            { id: "documentos", label: "Documentação" },
            { id: "perfis", label: "Gerenciar Perfis" },
            { id: "financeiro", label: "Visão Financeira" },
            { id: "parcerias", label: "Parcerias e Promoções" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "rgba(212, 175, 55, 0.1)" : "transparent",
                border: "none",
                color: activeTab === tab.id ? "var(--gold-primary)" : "var(--text-secondary)",
                padding: "0.8rem 1.5rem",
                borderRadius: "0.5rem",
                fontWeight: "bold",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ background: "rgba(10, 10, 10, 0.4)", border: "1px solid rgba(245, 230, 200, 0.08)", borderRadius: "1.25rem", padding: "clamp(1.25rem, 4vw, 2.5rem)", backdropFilter: "blur(12px)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", overflowX: "auto" }}>
          {loading && <p style={{ color: "var(--text-secondary)" }}>Carregando...</p>}

          {!loading && activeTab === "aprovacoes" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Fila de Aceite</h2>
                <span style={{ padding: "0.4rem 1rem", background: "rgba(234,179,8,0.1)", color: "#eab308", borderRadius: "999px", fontWeight: "bold", fontSize: "0.9rem" }}>
                  {profiles.filter((profile) => profile.profile_approval_status === "pending").length + mediaItems.filter((item) => item.approval_status === "pending").length} pendente(s)
                </span>
              </div>
              {adminActionMessage && <p style={{ color: "var(--text-secondary)" }}>{adminActionMessage}</p>}

              <div style={{ display: "grid", gap: "1.5rem" }}>
                <section>
                  <h3 style={{ color: "var(--gold-primary)", marginBottom: "1rem" }}>Mídias aguardando aceite</h3>
                  {mediaItems.filter((item) => item.approval_status === "pending").length === 0 ? (
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>Nenhuma mídia aguardando aceite.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "0.85rem" }}>
                      {mediaItems.filter((item) => item.approval_status === "pending").map((item) => (
                        <article key={item.id} style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr auto", gap: "1rem", alignItems: "center", padding: "0.85rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                          {item.media_type === "video" && item.public_url ? (
                            <video src={item.public_url} style={{ width: "4.5rem", height: "4.5rem", objectFit: "cover", borderRadius: "0.45rem" }} muted />
                          ) : item.public_url ? (
                            <img src={item.public_url} alt={item.file_name || "Foto enviada"} style={{ width: "4.5rem", height: "4.5rem", objectFit: "cover", borderRadius: "0.45rem" }} />
                          ) : (
                            <div style={{ width: "4.5rem", height: "4.5rem", borderRadius: "0.45rem", background: "rgba(245,230,200,0.08)" }} />
                          )}
                          <div>
                            <strong style={{ color: "white" }}>{item.profiles?.name || "Perfil sem nome"}</strong>
                            <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                              {item.profiles?.type || "Categoria nao informada"} - {item.profiles?.location || "Localizacao nao informada"}
                            </p>
                            {item.is_cover && (
                              <span style={{ display: "inline-flex", width: "fit-content", marginTop: "0.35rem", padding: "0.25rem 0.55rem", borderRadius: "999px", background: "rgba(212,175,55,0.14)", color: "var(--gold-primary)", fontWeight: 900, fontSize: "0.75rem" }}>
                                Foto de capa
                              </span>
                            )}
                            <p style={{ color: "var(--text-secondary)", margin: "0.2rem 0 0", fontSize: "0.85rem" }}>{item.file_name || (item.media_type === "video" ? "Vídeo enviado" : "Foto enviada")}</p>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {item.public_url && (
                              <a className="button button--ghost" href={item.public_url} target="_blank" rel="noreferrer">
                                Visualizar
                              </a>
                            )}
                            <button className="button button--primary" type="button" onClick={() => updateProfileMediaApproval(item.id, "approved")}>
                              Aprovar
                            </button>
                            <button className="button button--ghost" type="button" onClick={() => updateProfileMediaApproval(item.id, "rejected")}>
                              Recusar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 style={{ color: "var(--gold-primary)", marginBottom: "1rem" }}>Documentos aguardando aceite</h3>
                  {pendingProfileDocuments(profiles).length === 0 ? (
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>Nenhum documento aguardando aceite.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "0.85rem" }}>
                      {pendingProfileDocuments(profiles).map((profile) => (
                        <article key={profile.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center", padding: "0.85rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                          <div>
                            <strong style={{ color: "white" }}>{profile.name || "Perfil sem nome"}</strong>
                            <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                              {profile.user_document_name || "Documento PDF enviado"}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button className="button button--ghost" type="button" onClick={() => viewUserDocument(profile.user_document_path)}>
                              Visualizar
                            </button>
                            <button className="button button--primary" type="button" onClick={() => updateProfileApproval(profile.id, "approved")}>
                              Aprovar perfil
                            </button>
                            <button className="button button--ghost" type="button" onClick={() => updateProfileApproval(profile.id, "rejected")}>
                              Recusar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 style={{ color: "var(--gold-primary)", marginBottom: "1rem" }}>Perfis aguardando aceite</h3>
                  {profiles.filter((profile) => profile.profile_approval_status === "pending").length === 0 ? (
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>Nenhum perfil aguardando aceite.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {profiles.filter((profile) => profile.profile_approval_status === "pending").map((profile) => (
                    <article key={profile.id} style={{ display: "grid", gap: "0.85rem", padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                          <strong style={{ color: "white" }}>{profile.name || "Perfil sem nome"}</strong>
                          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                            {profile.type || "Categoria nao informada"} - {profile.location || "Localizacao nao informada"}
                          </p>
                        </div>
                        <span style={{ color: profile.is_online ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                          {profile.is_online ? "Online" : "Offline"}
                        </span>
                      </div>
                      {profile.description && <p style={{ color: "var(--text-secondary)", margin: 0 }}>{profile.description}</p>}
                      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                        <span style={{ padding: "0.35rem 0.7rem", borderRadius: "999px", background: profile.user_document_path ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", color: profile.user_document_path ? "#4ade80" : "#f87171", fontWeight: 800, fontSize: "0.85rem" }}>
                          {profile.user_document_path ? "Documentacao enviada" : "Sem documentacao"}
                        </span>
                        {profile.user_document_name && (
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{profile.user_document_name}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {profile.user_document_path && (
                          <button className="button button--ghost" type="button" onClick={() => viewUserDocument(profile.user_document_path)}>
                            Ver PDF
                          </button>
                        )}
                        <button
                          className="button button--primary"
                          type="button"
                          disabled={!profile.user_document_path}
                          title={!profile.user_document_path ? "Envio de documentacao obrigatorio para aprovar" : undefined}
                          onClick={() => updateProfileApproval(profile.id, "approved")}
                        >
                          Aprovar
                        </button>
                        <button className="button button--ghost" type="button" onClick={() => updateProfileApproval(profile.id, "rejected")}>
                          Recusar
                        </button>
                      </div>
                    </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {!loading && activeTab === "documentos" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Documentação dos cadastrados</h2>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {documentProfiles.length} documento(s) encontrado(s)
                </span>
              </div>
              {adminActionMessage && <p style={{ color: "var(--text-secondary)" }}>{adminActionMessage}</p>}

              <label className="input-group" style={{ maxWidth: "420px", marginBottom: "1rem" }}>
                <span>Pesquisar por nome</span>
                <input
                  type="search"
                  value={documentSearch}
                  onChange={(event) => {
                    setDocumentSearch(event.target.value);
                    setDocumentPage(1);
                  }}
                  placeholder="Digite o nome da modelo"
                  style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}
                />
              </label>

              {documentProfiles.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>Nenhuma modelo com documento encontrada.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  {visibleDocumentProfiles.map((profile) => (
                    <article key={profile.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "1rem", alignItems: "center", padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ color: "white" }}>{profile.name || "Perfil sem nome"}</strong>
                        <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                          {profile.type || "Categoria nao informada"} - {profile.location || "Localizacao nao informada"}
                        </p>
                        <p style={{ color: "#4ade80", margin: "0.35rem 0 0", fontWeight: 800 }}>
                          {profile.user_document_name || "Documento enviado"}
                        </p>
                      </div>
                      <button
                        className="button button--ghost"
                        type="button"
                        onClick={() => viewUserDocument(profile.user_document_path)}
                      >
                        Visualizar
                      </button>
                    </article>
                  ))}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Página {documentPage} de {documentPageCount}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button
                        className="button button--ghost"
                        type="button"
                        disabled={documentPage <= 1}
                        onClick={() => setDocumentPage((page) => Math.max(1, page - 1))}
                      >
                        Anterior
                      </button>
                      <button
                        className="button button--ghost"
                        type="button"
                        disabled={documentPage >= documentPageCount}
                        onClick={() => setDocumentPage((page) => Math.min(documentPageCount, page + 1))}
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "perfis" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Gerenciar Perfis</h2>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{manageableProfiles.length} perfil(is) aprovado(s) ou aguardando aprovação</span>
              </div>

              {adminActionMessage && <p style={{ color: "var(--text-secondary)" }}>{adminActionMessage}</p>}

              {manageableProfiles.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>Nenhum perfil encontrado.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  {visibleManageableProfiles.map((profile) => (
                    <article key={profile.id} style={{ display: "grid", gap: "0.85rem", padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(8rem, 0.7fr) minmax(8rem, 0.7fr) minmax(10rem, auto)", gap: "1rem", alignItems: "center" }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: "white" }}>{profile.name}</strong>
                          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>{profile.location || "Localização não informada"}</p>
                        </div>
                        <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{profile.type || "Não informado"}</span>
                        <span style={{ color: "white" }}>{getPlanConfig(profile.active_plan || "Basico").displayName}</span>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <span style={{ width: "100%", color: profile.profile_approval_status === "approved" ? "#4ade80" : "#eab308", fontWeight: "bold", textAlign: "right" }}>
                            {profile.profile_approval_status === "approved" ? "Aprovado" : "Aguardando aprovação"}
                          </span>
                          <button className="button button--ghost" type="button" onClick={() => startProfileEdit(profile)}>Editar</button>
                          <button className="button button--ghost" type="button" onClick={() => deleteProfile(profile)}>Excluir</button>
                        </div>
                      </div>

                      {editingProfileId === profile.id && (
                        <div style={{ display: "grid", gap: "1rem", padding: "1rem", borderRadius: "0.65rem", background: "rgba(0,0,0,0.28)", border: "1px solid rgba(245,230,200,0.08)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                            <label className="input-group"><span>Nome</span><input value={profileEditForm.name} onChange={(event) => setProfileEditForm({ ...profileEditForm, name: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} /></label>
                            <label className="input-group"><span>Categoria</span><select value={profileEditForm.type} onChange={(event) => setProfileEditForm({ ...profileEditForm, type: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}><option value="mulher">Mulher</option><option value="homem">Homem</option><option value="trans">Trans</option></select></label>
                            <label className="input-group"><span>WhatsApp</span><input value={profileEditForm.whatsapp} onChange={(event) => setProfileEditForm({ ...profileEditForm, whatsapp: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} /></label>
                            <label className="input-group"><span>Localização</span><input value={profileEditForm.location} onChange={(event) => setProfileEditForm({ ...profileEditForm, location: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} /></label>
                            <label className="input-group"><span>Plano</span><select value={profileEditForm.active_plan} onChange={(event) => setProfileEditForm({ ...profileEditForm, active_plan: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}><option value="Basico">Básico</option><option value="Premium">Premium</option><option value="Top Prive">Top Privê</option></select></label>
                            <label className="input-group"><span>Status</span><select value={profileEditForm.profile_approval_status} onChange={(event) => setProfileEditForm({ ...profileEditForm, profile_approval_status: event.target.value as "pending" | "approved" })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}><option value="pending">Aguardando aprovação</option><option value="approved">Aprovado</option></select></label>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", color: "var(--text-secondary)" }}><input type="checkbox" checked={profileEditForm.is_online} onChange={(event) => setProfileEditForm({ ...profileEditForm, is_online: event.target.checked })} />Online</label>
                          </div>
                          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                            <button className="button button--primary" type="button" onClick={saveProfileEdit}>Salvar alterações</button>
                            <button className="button button--ghost" type="button" onClick={cancelProfileEdit}>Cancelar</button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Página {profilePage} de {profilePageCount}</span>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button className="button button--ghost" type="button" disabled={profilePage <= 1} onClick={() => setProfilePage((page) => Math.max(1, page - 1))}>Anterior</button>
                      <button className="button button--ghost" type="button" disabled={profilePage >= profilePageCount} onClick={() => setProfilePage((page) => Math.min(profilePageCount, page + 1))}>Próxima</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "financeiro" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Receita e Assinaturas</h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: "bold" }}>Perfis na base</p>
                  <strong style={{ display: "block", fontSize: "2.5rem", color: "white", margin: "0.5rem 0" }}>{profiles.length}</strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{activeProfiles} com sinal ativo/verificado</span>
                </div>

                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: "bold" }}>Assinaturas</p>
                  <strong style={{ display: "block", fontSize: "2.5rem", color: "white", margin: "0.5rem 0" }}>{subscriptions.length}</strong>
                  <span style={{ color: "var(--gold-primary)", fontSize: "0.85rem" }}>
                    {Object.entries(planCounts).map(([plan, count]) => `${count} ${plan}`).join(" | ") || "Sem planos ativos"}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: "1.2rem", color: "var(--gold-primary)", marginBottom: "1rem" }}>Assinaturas registradas</h3>
              {subscriptions.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>Nenhuma assinatura encontrada na tabela `subscriptions`.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "680px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.3)", color: "var(--gold-primary)" }}>
                      <th style={{ padding: "1rem" }}>Plano</th>
                      <th style={{ padding: "1rem" }}>Status</th>
                      <th style={{ padding: "1rem" }}>Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription, index) => (
                      <tr key={subscription.id || `${subscription.user_id}-${index}`} style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                        <td style={{ padding: "1rem" }}>{getPlanConfig(subscription.plan || subscription.plan_key || "Basico").displayName}</td>
                        <td style={{ padding: "1rem" }}>{subscription.status || "Sem status"}</td>
                        <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{formatDateTimeSP(subscription.updated_at || subscription.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {!loading && activeTab === "parcerias" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Parcerias e Promoções</h2>
                <Link className="button button--ghost" href="/parcerias-promocoes">Ver página pública</Link>
              </div>

              <form onSubmit={handlePartnershipSubmit} style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                  <label className="input-group">
                    <span>Título</span>
                    <input required value={partnershipForm.title} onChange={(e) => setPartnershipForm({ ...partnershipForm, title: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Parceiro</span>
                    <input required value={partnershipForm.partner_name} onChange={(e) => setPartnershipForm({ ...partnershipForm, partner_name: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Selo</span>
                    <input placeholder="Ex: 15% OFF" value={partnershipForm.promotion_label} onChange={(e) => setPartnershipForm({ ...partnershipForm, promotion_label: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Ordem</span>
                    <input type="number" value={partnershipForm.sort_order} onChange={(e) => setPartnershipForm({ ...partnershipForm, sort_order: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                  </label>
                </div>
                <label className="input-group">
                  <span>URL da foto</span>
                  <input required type="url" placeholder="https://..." value={partnershipForm.image_url} onChange={(e) => setPartnershipForm({ ...partnershipForm, image_url: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                </label>
                <label className="input-group">
                  <span>Link da promoção</span>
                  <input type="url" placeholder="https://..." value={partnershipForm.link_url} onChange={(e) => setPartnershipForm({ ...partnershipForm, link_url: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                </label>
                <label className="input-group">
                  <span>Descrição</span>
                  <textarea required rows={4} value={partnershipForm.description} onChange={(e) => setPartnershipForm({ ...partnershipForm, description: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white", resize: "vertical" }} />
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", color: "var(--text-secondary)" }}>
                  <input type="checkbox" checked={partnershipForm.is_active} onChange={(e) => setPartnershipForm({ ...partnershipForm, is_active: e.target.checked })} />
                  Publicar agora
                </label>
                <button className="button button--primary" type="submit" style={{ justifySelf: "start", padding: "0.9rem 1.4rem" }}>Cadastrar parceria</button>
                {partnershipStatus && <p style={{ color: "var(--text-secondary)", margin: 0 }}>{partnershipStatus}</p>}
              </form>

              <div style={{ display: "grid", gap: "0.85rem" }}>
                {partnerships.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>Nenhuma parceria cadastrada.</p>
                ) : partnerships.map((item) => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr auto", gap: "1rem", alignItems: "center", padding: "0.85rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.5rem", background: "rgba(18,18,18,0.5)" }}>
                    <img src={item.image_url} alt="" style={{ width: "4.5rem", height: "4.5rem", objectFit: "contain", borderRadius: "0.35rem", background: "#080808" }} />
                    <div>
                      <strong style={{ color: "white" }}>{item.title}</strong>
                      <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)" }}>{item.partner_name} - {item.is_active ? "Ativa" : "Inativa"}</p>
                    </div>
                    <button className="button button--ghost" type="button" onClick={() => togglePartnership(item)}>
                      {item.is_active ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
