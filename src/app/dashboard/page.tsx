"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";

const TRIAL_DAYS = 7;

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isTrial, setIsTrial] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

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

      setLoading(false);
    };

    checkAccess();
  }, [router]);

  const currentPlan = isTrial ? getPlanConfig("Basico") : getPlanConfig("Top Prive");

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
              <div className="section-kicker">Plano</div>
              <h2>{currentPlan.displayName}</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                {isTrial && trialDaysLeft !== null
                  ? `Teste gratuito ativo: ${trialDaysLeft} dia(s) restante(s).`
                  : "Plano ativo conforme cadastro do usuário."}
              </p>
              <p style={{ color: "var(--text-secondary)" }}>{currentPlan.mediaLabel}</p>
            </article>

            <article className="profile-card-shell profile-wide-section">
              <div className="section-kicker">Mídia</div>
              <h2>Nenhum arquivo enviado</h2>
              <p style={{ color: "var(--text-secondary)" }}>Fotos e vídeos reais enviados pelo usuário aparecerão aqui.</p>
            </article>

            <article className="profile-card-shell profile-wide-section">
              <div className="section-kicker">Perfil público</div>
              <h2>Informações do cadastro</h2>
              <form className="model-profile-form">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                  <label className="input-group">
                    <span>Nome artístico</span>
                    <input type="text" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Localização</span>
                    <input type="text" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>WhatsApp público</span>
                    <input type="text" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                </div>
                <button className="button button--primary" type="button" style={{ marginTop: "1rem" }}>Salvar quando conectado ao banco</button>
              </form>
            </article>
          </section>
        )}
      </main>
    </>
  );
}
