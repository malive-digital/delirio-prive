"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";

const TRIAL_DAYS = 7;

type MediaFile = {
  name: string;
  type: "photo" | "video";
  status: string;
};

const initialMediaFiles: MediaFile[] = [];
const baseApprovedPhotoCount = 1;
const baseApprovedVideoCount = 1;

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("resumo");
  const [isOnline, setIsOnline] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(initialMediaFiles);
  const [mediaLimitError, setMediaLimitError] = useState("");

  useEffect(() => {
    const hasPlan = localStorage.getItem("hasActivePlan");
    if (!hasPlan) {
      router.push("/cobranca");
      return;
    }

    // Calcula dias restantes do trial
    const checkTrial = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const trialKey = `trial_start_${user.id}`;
      const trialStart = localStorage.getItem(trialKey);

      if (trialStart && hasPlan === "trial") {
        setIsTrial(true);
        const startDate = new Date(trialStart);
        const now = new Date();
        const diffMs = now.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const daysLeft = TRIAL_DAYS - diffDays;

        if (daysLeft <= 0) {
          localStorage.removeItem("hasActivePlan");
          router.push("/cobranca");
          return;
        }
        setTrialDaysLeft(daysLeft);
      }
    };

    checkTrial();

    const onlineStatus = localStorage.getItem("isOnline");
    if (onlineStatus !== null) {
      setIsOnline(onlineStatus === "true");
    }
  }, [router]);

  const handleToggleOnline = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    localStorage.setItem("isOnline", String(newState));
  };

  // Estado para controlar se as notificações foram lidas
  const [notificationsRead, setNotificationsRead] = useState(false);

  const daysToExpire = 5;
  const notifications = isTrial && trialDaysLeft !== null
    ? [{ id: 1, message: `⏳ Plano Básico gratuito: ${trialDaysLeft} dia(s) restante(s) de teste.` }]
    : [{ id: 1, message: `Faltam ${daysToExpire} dias para o vencimento do seu plano Top Privê.` }];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setNotificationsRead(true);
  };

  const currentPlan = isTrial ? getPlanConfig("Basico") : getPlanConfig("Top Prive");
  const currentBaseApprovedPhotoCount = currentPlan.key === "Basico" ? 0 : baseApprovedPhotoCount;
  const currentBaseApprovedVideoCount = currentPlan.key === "Basico" ? 0 : baseApprovedVideoCount;
  const approvedOrPendingMedia = mediaFiles.filter((file) => !file.status.toLowerCase().includes("recusada"));
  const photoCount = currentBaseApprovedPhotoCount + approvedOrPendingMedia.filter((file) => file.type === "photo").length;
  const videoCount = currentBaseApprovedVideoCount + approvedOrPendingMedia.filter((file) => file.type === "video").length;
  const canUploadPhotos = photoCount < currentPlan.limits.photos;
  const canUploadVideos = videoCount < currentPlan.limits.videos;

  const handleMediaSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const newPhotos = selectedFiles.filter((file) => file.type.startsWith("image/"));
    const newVideos = selectedFiles.filter((file) => file.type.startsWith("video/"));
    const unsupportedFiles = selectedFiles.length - newPhotos.length - newVideos.length;

    if (unsupportedFiles > 0) {
      setMediaLimitError("Envie apenas imagens ou videos.");
      event.target.value = "";
      return;
    }

    if (photoCount + newPhotos.length > currentPlan.limits.photos) {
      setMediaLimitError(`Seu plano ${currentPlan.displayName} permite ate ${currentPlan.limits.photos} fotos.`);
      event.target.value = "";
      return;
    }

    if (videoCount + newVideos.length > currentPlan.limits.videos) {
      setMediaLimitError(`Seu plano ${currentPlan.displayName} permite ate ${currentPlan.limits.videos} video(s).`);
      event.target.value = "";
      return;
    }

    setMediaFiles((currentFiles) => [
      ...currentFiles,
      ...newPhotos.map((file) => ({ name: file.name, type: "photo" as const, status: "Em analise" })),
      ...newVideos.map((file) => ({ name: file.name, type: "video" as const, status: "Em analise" })),
    ]);
    setMediaLimitError("");
    event.target.value = "";
  };

  return (
    <div className="entry-page" style={{ overflowX: "hidden" }}>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          
          <Link href="/" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "bold" }}>Início</Link>
          
          {/* Sino de Notificação */}
          <div style={{ position: "relative" }}>
            <button 
              onClick={handleNotificationClick}
              style={{ 
                background: "transparent", 
                border: "none", 
                color: "var(--gold-primary)", 
                cursor: "pointer", 
                position: "relative",
                animation: !notificationsRead ? "ring 2s ease-in-out infinite" : "none",
                transformOrigin: "top center"
              }}
            >
              <style>{`
                @keyframes ring {
                  0% { transform: rotate(0); }
                  5% { transform: rotate(15deg); }
                  10% { transform: rotate(-10deg); }
                  15% { transform: rotate(5deg); }
                  20% { transform: rotate(-5deg); }
                  25% { transform: rotate(0); }
                  100% { transform: rotate(0); }
                }
              `}</style>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {notifications.length > 0 && !notificationsRead && (
                <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", fontSize: "0.7rem", fontWeight: "bold", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{ position: "absolute", right: 0, top: "40px", width: "300px", background: "rgba(18,18,18,0.95)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "1rem", padding: "1rem", boxShadow: "0 10px 30px rgba(0,0,0,0.8)", zIndex: 100 }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "white", fontSize: "1rem" }}>Avisos</h4>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: "0.8rem", background: "rgba(212,175,55,0.1)", borderLeft: "3px solid var(--gold-primary)", borderRadius: "0.3rem", color: "var(--champagne)", fontSize: "0.9rem" }}>
                    {n.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "bold" }}>Sair</Link>
        </div>
      </header>

      <main className="app-page dashboard" style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(1rem, 3vw, 2rem)" }}>
        {/* Banner de trial */}
        {isTrial && trialDaysLeft !== null && (
          <div style={{
            marginBottom: "1.5rem",
            padding: "1.1rem 1.25rem",
            background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(75,15,26,0.18))",
            border: "1px solid rgba(212,175,55,0.35)",
            borderRadius: "0.9rem",
            boxShadow: "0 0 28px rgba(212,175,55,0.06)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                {/* Contador de dias em destaque */}
                <div style={{
                  minWidth: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "0.6rem",
                  background: "linear-gradient(135deg, var(--gold-secondary), var(--gold-primary))",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111",
                  boxShadow: "0 0 20px rgba(212,175,55,0.3)",
                  flexShrink: 0
                }}>
                  <strong style={{ fontSize: "1.5rem", fontWeight: "900", lineHeight: 1 }}>{trialDaysLeft}</strong>
                  <span style={{ fontSize: "0.6rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>dias</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: "bold", color: "var(--champagne)", fontSize: "0.95rem" }}>
                    Plano Básico gratuito ativo
                  </p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                    {trialDaysLeft === 1 ? "Último dia" : `${trialDaysLeft} dias restantes`} de {TRIAL_DAYS} dias grátis
                  </p>
                </div>
              </div>
              <Link
                className="button button--primary"
                href="/cobranca"
                style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", whiteSpace: "nowrap", flexShrink: 0 }}
              >
                Ver Planos
              </Link>
            </div>
            {/* Barra de progresso */}
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "999px", height: "5px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(trialDaysLeft / TRIAL_DAYS) * 100}%`,
                background: trialDaysLeft <= 2
                  ? "linear-gradient(90deg, #ef4444, #f87171)"
                  : "linear-gradient(90deg, var(--gold-secondary), var(--gold-primary))",
                borderRadius: "999px",
                transition: "width 0.5s ease"
              }} />
            </div>
          </div>
        )}
        
        {/* Cabeçalho do Dashboard */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "3rem" }}>
          <div>
            <p className="eyebrow" style={{ color: "var(--gold-primary)" }}>Painel da Modelo</p>
            <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Bem-vinda, Isadora</h1>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Toggle Online/Offline */}
            <button 
              onClick={handleToggleOnline}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.2rem",
                borderRadius: "999px",
                border: `1px solid ${isOnline ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                background: isOnline ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: isOnline ? "#4ade80" : "#f87171",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isOnline ? "#4ade80" : "#f87171", boxShadow: `0 0 10px ${isOnline ? "#4ade80" : "#f87171"}` }}></span>
              {isOnline ? "Online" : "Offline"}
            </button>
            <Link className="button button--primary" href="/cobranca" style={{ padding: "0.6rem 1.2rem" }}>Upgrade de plano</Link>
          </div>
        </div>

        {/* Menu de Navegação do Dashboard */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(245, 230, 200, 0.1)", paddingBottom: "1rem", overflowX: "auto" }}>
          {[
            { id: "resumo", label: "Visão Geral" },
            { id: "editar", label: "Editar Perfil" },
            { id: "fotos", label: "Mídia & Aprovação" },
            { id: "pagamentos", label: "Histórico Financeiro" }
          ].map(tab => (
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
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo Dinâmico */}
        <div style={{ background: "rgba(10, 10, 10, 0.4)", border: "1px solid rgba(245, 230, 200, 0.08)", borderRadius: "1.25rem", padding: "2.5rem", backdropFilter: "blur(12px)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
          
          {/* TAB: VISÃO GERAL */}
          {activeTab === "resumo" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Métricas do Perfil</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: "bold" }}>Acessos ao Perfil</p>
                  <strong style={{ display: "block", fontSize: "3rem", color: "white", margin: "0.5rem 0" }}>12.842</strong>
                  <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>+14% essa semana</span>
                </div>
                
                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: "bold" }}>Cliques no WhatsApp</p>
                  <strong style={{ display: "block", fontSize: "3rem", color: "var(--gold-primary)", margin: "0.5rem 0" }}>318</strong>
                  <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>Alta conversão</span>
                </div>

                <div style={{ background: "linear-gradient(145deg, rgba(212,175,55,0.15), rgba(18,18,18,0.8))", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(212,175,55,0.3)" }}>
                  <p style={{ color: "var(--champagne)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: "bold" }}>Seu Plano Atual</p>
                  <strong style={{ display: "block", fontSize: "2rem", color: "white", margin: "0.5rem 0" }}>{currentPlan.displayName}</strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Vence em {daysToExpire} dias</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EDITAR PERFIL */}
          {activeTab === "editar" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Configurações do Perfil</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>As informações alteradas aqui refletirão diretamente na sua página pública do catálogo.</p>
              
              <form className="model-profile-form">
                {/* INFORMAÇÕES BÁSICAS */}
                <h3 style={{ fontSize: "1.2rem", color: "var(--gold-primary)", marginBottom: "1rem" }}>Informações Básicas</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                  <label className="input-group">
                    <span>Nome Artístico</span>
                    <input type="text" defaultValue="Isadora Monteiro" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Gênero</span>
                    <select style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }}>
                      <option>Feminino</option>
                      <option>Masculino</option>
                      <option>Trans</option>
                    </select>
                  </label>
                  <label className="input-group">
                    <span>Preferência Sexual</span>
                    <input type="text" defaultValue="Homens" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>WhatsApp Público</span>
                    <input type="text" defaultValue="(11) 99999-9999" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Localização</span>
                    <input type="text" defaultValue="Jardins, São Paulo" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Viagem</span>
                    <select style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }}>
                      <option>Disponível sob consulta</option>
                      <option>Disponível</option>
                      <option>Não</option>
                    </select>
                  </label>
                  <label className="input-group">
                    <span>Expediente</span>
                    <input type="text" defaultValue="Seg a sáb, 14h às 23h" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                </div>

                {/* CARACTERÍSTICAS FÍSICAS */}
                <h3 style={{ fontSize: "1.2rem", color: "var(--gold-primary)", marginBottom: "1rem", marginTop: "2rem" }}>Características Físicas</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                  <label className="input-group">
                    <span>Altura (m)</span>
                    <input type="text" defaultValue="1,68" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Peso (kg)</span>
                    <input type="text" defaultValue="58" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Etnia</span>
                    <input type="text" defaultValue="Branca" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Olhos</span>
                    <input type="text" defaultValue="Castanhos" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Cabelo</span>
                    <input type="text" defaultValue="Castanho longo" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Tamanho do pé</span>
                    <input type="text" defaultValue="36" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Silicone</span>
                    <select style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }}>
                      <option>Sim</option>
                      <option>Não</option>
                    </select>
                  </label>
                  <label className="input-group">
                    <span>Tatuagens</span>
                    <input type="text" defaultValue="Discretas" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Piercings</span>
                    <input type="text" defaultValue="Não" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Fumante</span>
                    <select style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }}>
                      <option>Não</option>
                      <option>Sim</option>
                    </select>
                  </label>
                  <label className="input-group">
                    <span>Idiomas</span>
                    <input type="text" defaultValue="Português, Inglês" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                </div>

                {/* SERVIÇOS E PAGAMENTO */}
                <h3 style={{ fontSize: "1.2rem", color: "var(--gold-primary)", marginBottom: "1rem", marginTop: "2rem" }}>Serviços e Pagamento</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
                  <div style={{ background: "rgba(18,18,18,0.5)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Serviços Prestados</h4>
                    <div style={{ display: "grid", gap: "0.8rem", color: "var(--text-secondary)" }}>
                      <label><input type="checkbox" defaultChecked /> Sexo vaginal com preservativo</label>
                      <label><input type="checkbox" defaultChecked /> Sexo oral com preservativo</label>
                      <label><input type="checkbox" defaultChecked /> Masturbação</label>
                      <label><input type="checkbox" defaultChecked /> Sexo virtual</label>
                      <label><input type="checkbox" defaultChecked /> Acessórios eróticos</label>
                      <label><input type="checkbox" defaultChecked /> Chuva dourada</label>
                      <label><input type="checkbox" defaultChecked /> Acompanhante</label>
                    </div>
                  </div>
                  <div style={{ background: "rgba(18,18,18,0.5)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Formas de Pagamento</h4>
                    <div style={{ display: "grid", gap: "0.8rem", color: "var(--text-secondary)" }}>
                      <label><input type="checkbox" defaultChecked /> Dinheiro</label>
                      <label><input type="checkbox" defaultChecked /> Pix</label>
                      <label><input type="checkbox" defaultChecked /> Cartão</label>
                      <label><input type="checkbox" defaultChecked /> Transferência</label>
                    </div>
                  </div>
                </div>

                {/* DESCRIÇÃO */}
                <h3 style={{ fontSize: "1.2rem", color: "var(--gold-primary)", marginBottom: "1rem", marginTop: "2rem" }}>Apresentação</h3>
                <div style={{ marginTop: "1rem" }}>
                  <label className="input-group">
                    <span>Sobre mim (Descrição que aparece no perfil)</span>
                    <textarea 
                      defaultValue="Presença elegante, atendimento reservado e agenda seletiva para encontros com alto nível de discrição."
                      style={{ width: "100%", minHeight: "120px", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white", resize: "vertical" }}
                    />
                  </label>
                </div>

                <button className="button button--primary" type="submit" style={{ marginTop: "2rem", padding: "1rem 2.5rem", fontSize: "1.1rem" }} onClick={e => e.preventDefault()}>
                  Salvar Alterações
                </button>
              </form>
            </div>
          )}

          {/* TAB: FOTOS E MÍDIA */}
          {activeTab === "fotos" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Galeria e Aprovação</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Envie fotos e vídeos para análise da nossa equipe de curadoria.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ margin: "0 0 0.35rem", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800 }}>Plano atual</p>
                  <strong style={{ color: "var(--champagne)", fontSize: "1.25rem" }}>{currentPlan.displayName}</strong>
                </div>
                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ margin: "0 0 0.35rem", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800 }}>Fotos</p>
                  <strong style={{ color: canUploadPhotos ? "var(--gold-primary)" : "#f87171", fontSize: "1.25rem" }}>{photoCount}/{currentPlan.limits.photos}</strong>
                </div>
                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ margin: "0 0 0.35rem", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800 }}>Videos</p>
                  <strong style={{ color: canUploadVideos ? "var(--gold-primary)" : "#f87171", fontSize: "1.25rem" }}>{videoCount}/{currentPlan.limits.videos}</strong>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
                <label style={{ background: "rgba(18,18,18,0.5)", border: "2px dashed rgba(212,175,55,0.3)", borderRadius: "1rem", padding: "3rem", textAlign: "center", cursor: "pointer", display: "block" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <h3 style={{ color: "white", marginBottom: "0.5rem" }}>Clique para enviar mídia</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>JPG, PNG ou MP4 (Máx 50MB)</p>
                  <p style={{ color: "var(--gold-primary)", fontSize: "0.85rem", margin: "0.75rem 0 0" }}>{currentPlan.mediaLabel}</p>
                  {mediaLimitError && <p style={{ color: "#f87171", fontSize: "0.85rem", margin: "0.75rem 0 0" }}>{mediaLimitError}</p>}
                  <input type="file" accept="image/*,video/*" multiple onChange={handleMediaSelection} style={{ display: "none" }} />
                </label>

                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Status dos Arquivos</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {mediaFiles.map((file) => (
                      <li key={file.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.5rem", border: "1px solid rgba(245,230,200,0.05)", flexWrap: "wrap" }}>
                        <span style={{ color: "white" }}>{file.name}</span>
                        <span style={{ padding: "0.3rem 0.8rem", background: "rgba(234,179,8,0.1)", color: "#eab308", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "bold" }}>{file.status}</span>
                      </li>
                    ))}
                    <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.5rem", border: "1px solid rgba(245,230,200,0.05)" }}>
                      <span style={{ color: "white" }}>ensaio_vip_01.jpg</span>
                      <span style={{ padding: "0.3rem 0.8rem", background: "rgba(34,197,94,0.1)", color: "#4ade80", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "bold" }}>Aprovada</span>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.5rem", border: "1px solid rgba(245,230,200,0.05)" }}>
                      <span style={{ color: "white" }}>video_intro.mp4</span>
                      <span style={{ padding: "0.3rem 0.8rem", background: "rgba(234,179,8,0.1)", color: "#eab308", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "bold" }}>Em análise</span>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.5rem", border: "1px solid rgba(245,230,200,0.05)" }}>
                      <span style={{ color: "white" }}>selfie_espelho.jpg</span>
                      <span style={{ padding: "0.3rem 0.8rem", background: "rgba(239,68,68,0.1)", color: "#f87171", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "bold" }}>Recusada (Baixa prop.)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAGAMENTOS */}
          {activeTab === "pagamentos" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Histórico de Assinaturas</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Controle de faturas e planos adquiridos.</p>

              {/* Cards responsivos em vez de tabela */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { data: "18/03/2026", plano: "Top Privê", valor: "R$ 149,90", metodo: "PIX", status: "Pago" },
                  { data: "18/02/2026", plano: "Top Privê", valor: "R$ 149,90", metodo: "PIX", status: "Pago" },
                  { data: "18/01/2026", plano: "Premium", valor: "R$ 89,90", metodo: "Cartão", status: "Pago" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.25)", padding: "1rem 1.25rem", borderRadius: "0.75rem", border: "1px solid rgba(245,230,200,0.07)" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", flex: 1 }}>
                      <div><p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Data</p><p style={{ margin: 0, color: "white" }}>{row.data}</p></div>
                      <div><p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Plano</p><p style={{ margin: 0, color: "var(--gold-primary)", fontWeight: 700 }}>{row.plano}</p></div>
                      <div><p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Valor</p><p style={{ margin: 0, color: "white" }}>{row.valor}</p></div>
                      <div><p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>Método</p><p style={{ margin: 0, color: "white" }}>{row.metodo}</p></div>
                    </div>
                    <span style={{ padding: "0.4rem 0.9rem", background: "rgba(34,197,94,0.1)", color: "#4ade80", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 700, border: "1px solid rgba(34,197,94,0.25)" }}>{row.status}</span>
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
