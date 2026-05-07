"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";

const TRIAL_DAYS = 7;

type DashboardTab = "resumo" | "editar" | "documento";

type ProfileForm = {
  name: string;
  type: string;
  whatsapp: string;
  location: string;
  description: string;
  active_plan: string;
  is_online: boolean;
  profile_approval_status: "pending" | "approved" | "rejected";
  user_document_path: string | null;
  user_document_name: string | null;
};

const emptyProfile: ProfileForm = {
  name: "",
  type: "mulher",
  whatsapp: "",
  location: "",
  description: "",
  active_plan: "Basico",
  is_online: false,
  profile_approval_status: "pending",
  user_document_path: null,
  user_document_name: null,
};

const approvalCopy = {
  pending: {
    title: "Aguardando aceite",
    description: "Seu perfil fica fora do catalogo ate a aprovacao da administracao.",
  },
  approved: {
    title: "Perfil aprovado",
    description: "Seu cadastro esta liberado para aparecer no catalogo.",
  },
  rejected: {
    title: "Ajustes solicitados",
    description: "Revise as informacoes e envie novamente para avaliacao.",
  },
};

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("resumo");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [isTrial, setIsTrial] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);

  const loadDocumentUrl = async (path: string | null) => {
    if (!path) {
      setDocumentUrl("");
      return;
    }

    const { data } = await supabase.storage.from("user-documents").createSignedUrl(path, 60 * 10);
    setDocumentUrl(data?.signedUrl || "");
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasPlan = localStorage.getItem("hasActivePlan");

      if (!hasPlan) {
        router.push("/cobranca");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      if (hasPlan === "trial") {
        const trialKey = `trial_start_${user.id}`;
        const trialStart = localStorage.getItem(trialKey);

        if (trialStart) {
          const diffDays = Math.floor((Date.now() - new Date(trialStart).getTime()) / (1000 * 60 * 60 * 24));
          const daysLeft = TRIAL_DAYS - diffDays;

          if (daysLeft <= 0) {
            localStorage.removeItem("hasActivePlan");
            router.push("/cobranca");
            return;
          }

          setIsTrial(true);
          setTrialDaysLeft(daysLeft);
        }
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "name,type,whatsapp,location,description,active_plan,is_online,profile_approval_status,user_document_path,user_document_name",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        const loadedProfile = {
          ...emptyProfile,
          ...profileData,
          active_plan: profileData.active_plan || emptyProfile.active_plan,
          profile_approval_status: profileData.profile_approval_status || "pending",
        } as ProfileForm;

        setProfile(loadedProfile);
        await loadDocumentUrl(loadedProfile.user_document_path);
      }

      setLoading(false);
    };

    checkAccess();
  }, [router]);

  const currentPlan = getPlanConfig(profile.active_plan || (isTrial ? "Basico" : "Top Prive"));
  const approval = approvalCopy[profile.profile_approval_status];

  const buildProfilePayload = (overrides: Partial<ProfileForm> = {}) => {
    const nextProfile = { ...profile, ...overrides };

    return {
      id: userId,
      type: nextProfile.type,
      name: nextProfile.name.trim() || null,
      whatsapp: nextProfile.whatsapp.trim() || null,
      location: nextProfile.location.trim() || null,
      description: nextProfile.description.trim() || null,
      active_plan: nextProfile.active_plan,
      is_online: nextProfile.is_online,
      updated_at: new Date().toISOString(),
    };
  };

  const updateProfileField = <T extends keyof ProfileForm>(field: T, value: ProfileForm[T]) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleOnlineToggle = async () => {
    if (!userId) return;

    const nextOnlineState = !profile.is_online;
    setProfile((current) => ({ ...current, is_online: nextOnlineState }));
    setStatusMessage("Atualizando status...");

    const { error } = await supabase.from("profiles").upsert(buildProfilePayload({ is_online: nextOnlineState }));

    setStatusMessage(error ? `Erro ao atualizar status: ${error.message}` : `Perfil ${nextOnlineState ? "online" : "offline"}.`);
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;

    setSaving(true);
    setStatusMessage("Enviando perfil para aprovacao...");

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
    setStatusMessage("Perfil salvo e enviado para aceite da administracao.");
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    if (file.type !== "application/pdf") {
      setStatusMessage("Anexe apenas documento em PDF.");
      event.target.value = "";
      return;
    }

    setUploadingDocument(true);
    setStatusMessage("Enviando documento...");

    const documentPath = `${userId}/documento-${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage.from("user-documents").upload(documentPath, file, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (uploadError) {
      setUploadingDocument(false);
      setStatusMessage(`Erro ao enviar documento: ${uploadError.message}`);
      return;
    }

    const { error: updateError } = await supabase.from("profiles").upsert({
      ...buildProfilePayload(),
      user_document_path: documentPath,
      user_document_name: file.name,
      user_document_mime: file.type,
      document_uploaded_at: new Date().toISOString(),
      profile_verified: false,
      profile_approval_status: "pending",
      updated_at: new Date().toISOString(),
    });

    setUploadingDocument(false);
    event.target.value = "";

    if (updateError) {
      setStatusMessage(`Documento enviado, mas nao foi vinculado ao perfil: ${updateError.message}`);
      return;
    }

    setProfile((current) => ({
      ...current,
      user_document_path: documentPath,
      user_document_name: file.name,
      profile_approval_status: "pending",
    }));
    await loadDocumentUrl(documentPath);
    setStatusMessage("Documento anexado e enviado para analise.");
  };

  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delirio Prive</span>
        </Link>
        <nav className="app-nav" aria-label="Navegacao">
          <Link href="/">Inicio</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/parcerias-promocoes">Parcerias</Link>
        </nav>
      </header>

      <main className="app-page dashboard" style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div className="page-title">
          <div>
            <p className="eyebrow">Painel</p>
            <h1>Dashboard</h1>
            <p className="page-intro">Gerencie seus dados, visibilidade e documentos do perfil.</p>
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
            <section className="dashboard-grid" aria-label="Resumo do perfil">
              <article className="dashboard-panel" style={{ gridColumn: "auto" }}>
                <span className="section-kicker">Aceite</span>
                <h2>{approval.title}</h2>
                <p>{approval.description}</p>
              </article>

              <article className="dashboard-panel" style={{ gridColumn: "auto" }}>
                <span className="section-kicker">Plano</span>
                <h2>{currentPlan.displayName}</h2>
                <p>{currentPlan.mediaLabel}</p>
              </article>

              <article className="dashboard-panel" style={{ gridColumn: "auto" }}>
                <span className="section-kicker">Visibilidade</span>
                <h2>{profile.is_online ? "Online" : "Offline"}</h2>
                <p>{profile.is_online ? "Seu perfil esta marcado como ativo." : "Seu perfil esta marcado como inativo."}</p>
                <button className="button button--primary" type="button" onClick={handleOnlineToggle}>
                  {profile.is_online ? "Ficar offline" : "Ficar online"}
                </button>
              </article>
            </section>

            <div className="dashboard-tabs" role="tablist" aria-label="Secoes do dashboard">
              {[
                { id: "resumo", label: "Visao Geral" },
                { id: "editar", label: "Editar Perfil" },
                { id: "documento", label: "Documento PDF" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={activeTab === tab.id ? "is-active" : ""}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <section className="dashboard-panel dashboard-workspace-panel">
              {activeTab === "resumo" && (
                <div>
                  <span className="section-kicker">Resumo</span>
                  <h2>Dados atuais</h2>
                  <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                    <article>
                      <strong>Nome artistico</strong>
                      <p>{profile.name || "Nao informado"}</p>
                    </article>
                    <article>
                      <strong>Categoria</strong>
                      <p>{profile.type || "Nao informada"}</p>
                    </article>
                    <article>
                      <strong>Localizacao</strong>
                      <p>{profile.location || "Nao informada"}</p>
                    </article>
                    <article>
                      <strong>WhatsApp</strong>
                      <p>{profile.whatsapp || "Nao informado"}</p>
                    </article>
                  </div>
                  {isTrial && trialDaysLeft !== null && <p>Teste gratuito ativo: {trialDaysLeft} dia(s) restante(s).</p>}
                  {statusMessage && <p aria-live="polite">{statusMessage}</p>}
                </div>
              )}

              {activeTab === "editar" && (
                <form className="model-profile-form" onSubmit={handleSaveProfile}>
                  <div>
                    <span className="section-kicker">Perfil publico</span>
                    <h2>Informacoes do cadastro</h2>
                    <p>Ao salvar, seu perfil volta para aceite da administracao antes de aparecer no catalogo.</p>
                  </div>

                  <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                    <label className="input-group">
                      <span>Nome artistico</span>
                      <input
                        value={profile.name}
                        onChange={(event) => updateProfileField("name", event.target.value)}
                        type="text"
                        placeholder="Seu nome publico"
                      />
                    </label>

                    <label className="input-group">
                      <span>Categoria</span>
                      <select value={profile.type} onChange={(event) => updateProfileField("type", event.target.value)}>
                        <option value="mulher">Mulher</option>
                        <option value="homem">Homem</option>
                        <option value="trans">Trans</option>
                      </select>
                    </label>

                    <label className="input-group">
                      <span>Localizacao</span>
                      <input
                        value={profile.location}
                        onChange={(event) => updateProfileField("location", event.target.value)}
                        type="text"
                        placeholder="Cidade ou regiao"
                      />
                    </label>

                    <label className="input-group">
                      <span>WhatsApp publico</span>
                      <input
                        value={profile.whatsapp}
                        onChange={(event) => updateProfileField("whatsapp", event.target.value)}
                        type="tel"
                        placeholder="(00) 00000-0000"
                      />
                    </label>
                  </div>

                  <label className="input-group input-group--wide">
                    <span>Descricao</span>
                    <textarea
                      value={profile.description}
                      onChange={(event) => updateProfileField("description", event.target.value)}
                      rows={6}
                      placeholder="Descreva seu atendimento"
                    />
                  </label>

                  <div className="form-actions">
                    <button className="button button--primary" type="submit" disabled={saving}>
                      {saving ? "Salvando..." : "Salvar e enviar para aceite"}
                    </button>
                    {statusMessage && <p aria-live="polite">{statusMessage}</p>}
                  </div>
                </form>
              )}

              {activeTab === "documento" && (
                <div>
                  <span className="section-kicker">Documento</span>
                  <h2>Documento em PDF</h2>
                  <p>{profile.user_document_name || "Nenhum documento anexado."}</p>

                  <div className="form-actions">
                    <label className="button button--ghost">
                      {uploadingDocument ? "Enviando..." : "Anexar PDF"}
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleDocumentUpload}
                        disabled={uploadingDocument}
                        style={{ display: "none" }}
                      />
                    </label>

                    {documentUrl && (
                      <a className="button button--primary" href={documentUrl} target="_blank" rel="noreferrer">
                        Visualizar PDF
                      </a>
                    )}
                  </div>

                  {statusMessage && <p aria-live="polite">{statusMessage}</p>}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
