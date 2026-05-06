"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TRIAL_DAYS = 7;

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError("E-mail ou senha inválidos. Verifique seus dados ou contate o administrador.");
      setLoading(false);
      return;
    }

    const userId = data.user.id;
    const trialKey = `trial_start_${userId}`;

    // Se é o primeiro login, registra o início do trial agora
    if (!localStorage.getItem(trialKey)) {
      localStorage.setItem(trialKey, new Date().toISOString());
    }

    // Verifica se ainda está no trial
    const trialStart = localStorage.getItem(trialKey)!;
    const startDate = new Date(trialStart);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < TRIAL_DAYS) {
      localStorage.setItem("hasActivePlan", "trial");
      router.push("/dashboard");
    } else {
      // Trial expirado — precisa escolher um plano
      localStorage.removeItem("hasActivePlan");
      router.push("/cobranca");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.95rem 1rem",
    borderRadius: "0.8rem",
    background: "rgba(10,10,10,0.6)",
    border: "1px solid rgba(245,230,200,0.12)",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  return (
    <div className="entry-page" style={{ minHeight: "100vh", overflowX: "hidden", overflowY: "auto" }}>
      <header
        className="app-header"
        style={{ position: "absolute", top: 0, width: "100%", background: "transparent", border: "none" }}
      >
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link href="/planos">Planos</Link>
        </nav>
      </header>

      <main
        className="app-page auth"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "clamp(5.8rem, 14vh, 7rem) 1rem 3rem",
          background: `radial-gradient(circle at center, rgba(212,175,55,0.06) 0%, transparent 65%), linear-gradient(to bottom, #0a0a0a, #111)`,
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "clamp(1.8rem, 5vw, 3rem)",
            borderRadius: "1.5rem",
            background: "rgba(18,18,18,0.65)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(212,175,55,0.16)",
            boxShadow: "0 30px 60px -15px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)",
            textAlign: "center",
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: "0.25rem" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                background: "linear-gradient(135deg, var(--gold-secondary), var(--gold-primary))",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                color: "#111",
                fontWeight: "900",
                fontSize: "1.1rem",
                boxShadow: "0 0 28px rgba(212,175,55,0.45)",
              }}
            >
              DP
            </div>
            <p className="eyebrow" style={{ color: "var(--gold-primary)", margin: "0 0 0.4rem" }}>
              Acesso Exclusivo
            </p>
            <h1
              style={{
                fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
                margin: 0,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Bem-vinda ao Painel
            </h1>
          </div>

          {/* Info para usuários sem conta */}
          <div
            style={{
              padding: "0.8rem 1rem",
              background: "rgba(212,175,55,0.07)",
              border: "1px solid rgba(212,175,55,0.18)",
              borderRadius: "0.65rem",
              fontSize: "0.83rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
            }}
          >
            🔐 Acesso apenas para perfis aprovados pelo administrador.
          </div>

          {/* Erro */}
          {error && (
            <div
              style={{
                padding: "0.8rem",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "0.5rem",
                color: "#f87171",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Campos */}
          <label className="input-group" style={{ textAlign: "left" }}>
            <span>E-mail</span>
            <input
              type="email"
              placeholder="contato@modelo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label className="input-group" style={{ textAlign: "left" }}>
            <span>Senha</span>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-0.5rem" }}>
            <Link
              href="#"
              style={{ fontSize: "0.85rem", color: "var(--gold-primary)", textDecoration: "underline" }}
            >
              Esqueceu a senha?
            </Link>
          </div>

          <button
            className={`button button--primary ${loading ? "is-loading" : ""}`}
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1.15rem",
              fontSize: "1.05rem",
              borderRadius: "0.8rem",
              fontWeight: "bold",
            }}
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </button>

          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
            Novo por aqui? Entre em contato com{" "}
            <Link href="/cadastro-whatsapp" style={{ color: "var(--gold-primary)", textDecoration: "underline" }}>
              nosso atendimento
            </Link>
            .
          </p>
        </form>
      </main>
    </div>
  );
}
