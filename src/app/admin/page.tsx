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
  active_plan: string | null;
  is_online: boolean | null;
  profile_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("aprovacoes");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Carregando dados reais da base...");

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

      const [profilesResult, subscriptionsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,type,name,active_plan,is_online,profile_verified,created_at,updated_at")
          .order("updated_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
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
            { id: "perfis", label: "Gerenciar Perfis" },
            { id: "financeiro", label: "Visão Financeira" },
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
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Fila de Análise</h2>
                <span style={{ padding: "0.4rem 1rem", background: "rgba(34,197,94,0.1)", color: "#4ade80", borderRadius: "999px", fontWeight: "bold", fontSize: "0.9rem" }}>0 pendentes</span>
              </div>
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                Não há tabela de mídia publicada na base Supabase. A fila fica vazia até os uploads reais serem persistidos.
              </p>
            </div>
          )}

          {!loading && activeTab === "perfis" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Catálogo de Perfis</h2>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{profiles.length} perfil(is) na base</span>
              </div>

              {profiles.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>Nenhum perfil encontrado.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "760px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.3)", color: "var(--gold-primary)" }}>
                      <th style={{ padding: "1rem" }}>Perfil</th>
                      <th style={{ padding: "1rem" }}>Categoria</th>
                      <th style={{ padding: "1rem" }}>Plano</th>
                      <th style={{ padding: "1rem" }}>Status</th>
                      <th style={{ padding: "1rem" }}>Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile.id} style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                        <td style={{ padding: "1rem" }}><strong>{profile.name || "Sem nome"}</strong></td>
                        <td style={{ padding: "1rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>{profile.type || "Não informado"}</td>
                        <td style={{ padding: "1rem" }}>{getPlanConfig(profile.active_plan || "Basico").displayName}</td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{ color: profile.profile_verified ? "#4ade80" : "#eab308", fontWeight: "bold" }}>
                            {profile.profile_verified ? "Verificado" : "Aguardando verificação"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{formatDateTimeSP(profile.updated_at || profile.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        </div>
      </main>
    </div>
  );
}
