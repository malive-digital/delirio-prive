"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";

const TRIAL_DAYS = 7;

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
  active_plan: "básico",
  is_online: false,
  profile_approval_status: "pending",
  user_document_path: null,
  user_document_name: null,
};

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
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
        .select("name,type,whatsapp,location,description,active_plan,is_online,profile_approval_status,user_document_path,user_document_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        const loadedProfile = {
          ...emptyProfile,
          ...profileData,
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

  const handleOnlineToggle = async () => {
    if (!userId) return;

    const nextOnlineState = !profile.is_online;
    setProfile((current) => ({ ...current, is_online: nextOnlineState }));
    setStatusMessage("Atualizando status...");

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        type: profile.type,
        name: profile.name.trim() || null,
        whatsapp: profile.whatsapp.trim() || null,
        location: profile.location.trim() || null,
        description: profile.description.trim() || null,
        active_plan: profile.active_plan,
        is_online: nextOnlineState,
        updated_at: new Date().toISOString(),
      });

    setStatusMessage(error ? `Erro ao atualizar status: ${error.message}` : `Perfil ${nextOnlineState ? "online" : "offline"}.`);
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;

    setSaving(true);
    setStatusMessage("Enviando perfil para aprovação...");

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      type: profile.type,
      name: profile.name.trim() || null,
      whatsapp: profile.whatsapp.trim() || null,
      location: profile.location.trim() || null,
      description: profile.description.trim() || null,
      active_plan: profile.active_plan,
      is_online: profile.is_online,
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

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        type: profile.type,
        name: profile.name.trim() || null,
        whatsapp: profile.whatsapp.trim() || null,
        location: profile.location.trim() || null,
        description: profile.description.trim() || null,
        active_plan: profile.active_plan,
        is_online: profile.is_online,
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
      setStatusMessage(`Documento enviado, mas não foi vinculado ao perfil: ${updateError.message}`);
      return;
    }

    setProfile((current) => ({
      ...current,
      user_document_path: documentPath,
      user_document_name: file.name,
      profile_approval_status: "pending",
    }));
    await loadDocumentUrl(documentPath);
    setStatusMessage("Documento anexado e enviado para análise.");
  };

  const approvalLabel = {
    pending: "Aguardando aceite do administrador",
    approved: "Aprovado",
    rejected: "Recusado",
  }[profile.profile_approval_status];

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
        </nav>
      </header>

      <main className="app-page dashboard">
        <div className="page-title">
          <div>
            <p className="eyebrow">Painel</p>
            <h1>Dashboard</h1>
          </div>
          <Link className="button button--primary" href="/cobranca">Upgrade de plano</Link>
        </div>

        {loading ? (
          <section className="empty-state">
            <p>Carregando painel...</p>
          </section>
        ) : (
          <section className="profile-content-grid">
            <article className="profile-card-shell profile-wide-section">
              <div className="section-kicker">Status do perfil</div>
              <h2>{approvalLabel}</h2>
              <p style={{ color: "var(--text-secondary)" }}>{currentPlan.mediaLabel}</p>
              {isTrial && trialDaysLeft !== null && (
                <p style={{ color: "var(--text-secondary)" }}>Teste gratuito: {trialDaysLeft} dia(s) restante(s).</p>
              )}
              <button className="button button--primary" type="button" onClick={handleOnlineToggle} style={{ marginTop: "1rem" }}>
                {profile.is_online ? "Ficar offline" : "Ficar online"}
              </button>
            </article>

            <article className="profile-card-shell profile-wide-section">
              <div className="section-kicker">Documento</div>
              <h2>Documento em PDF</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                {profile.user_document_name || "Nenhum documento anexado."}
              </p>
              <label className="button button--ghost" style={{ marginTop: "1rem", width: "fit-content" }}>
                {uploadingDocument ? "Enviando..." : "Anexar PDF"}
                <input type="file" accept="application/pdf" onChange={handleDocumentUpload} disabled={uploadingDocument} style={{ display: "none" }} />
              </label>
              {documentUrl && (
                <a className="button button--primary" href={documentUrl} target="_blank" rel="noreferrer" style={{ marginTop: "1rem", width: "fit-content" }}>
                  Visualizar PDF
                </a>
              )}
            </article>

            <article className="profile-card-shell profile-wide-section">
              <div className="section-kicker">Perfil público</div>
              <h2>Informações do cadastro</h2>
              <form className="model-profile-form" onSubmit={handleSaveProfile}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                  <label className="input-group">
                    <span>Nome artístico</span>
                    <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} type="text" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Categoria</span>
                    <select value={profile.type} onChange={(e) => setProfile({ ...profile, type: e.target.value })} style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }}>
                      <option value="mulher">Mulher</option>
                      <option value="homem">Homem</option>
                      <option value="trans">Trans</option>
                    </select>
                  </label>
                  <label className="input-group">
                    <span>Localização</span>
                    <input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} type="text" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>WhatsApp público</span>
                    <input value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} type="text" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                </div>
                <label className="input-group" style={{ display: "block", marginTop: "1rem" }}>
                  <span>Descrição</span>
                  <textarea value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} rows={5} style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white", resize: "vertical" }} />
                </label>
                <button className="button button--primary" type="submit" disabled={saving} style={{ marginTop: "1rem" }}>
                  {saving ? "Salvando..." : "Salvar e enviar para aceite"}
                </button>
              </form>
              {statusMessage && <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>{statusMessage}</p>}
            </article>
          </section>
        )}
      </main>
    </>
  );
}
