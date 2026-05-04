"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    // Login com sucesso
    // Salva plano ativo provisoriamente (será substituído por checagem no BD depois)
    localStorage.setItem("hasActivePlan", "true");
    router.push("/dashboard");
  };
  return (
    <div className="entry-page" style={{ overflow: "hidden" }}>
      <header className="app-header" style={{ position: "absolute", top: 0, width: "100%", background: "transparent", border: "none" }}>
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link href="/favoritos">Favoritos</Link>
          <Link href="/planos">Planos</Link>
          <Link className="login-link is-active" href="/login">Entrar</Link>
        </nav>
      </header>

      <main 
        className="app-page auth" 
        style={{ 
          minHeight: "100vh", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: `radial-gradient(circle at center, rgba(212, 175, 55, 0.05) 0%, transparent 60%), linear-gradient(to bottom, #0a0a0a, #111)`
        }}
      >
        <form 
          className="checkout-form auth-form" 
          onSubmit={handleLogin}
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "3rem",
            borderRadius: "1.5rem",
            background: "rgba(18, 18, 18, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212, 175, 55, 0.15)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            textAlign: "center"
          }}
        >
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ 
              width: "50px", 
              height: "50px", 
              background: "linear-gradient(135deg, var(--gold-secondary), var(--gold-primary))", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 1rem",
              color: "#111",
              fontWeight: "900",
              fontSize: "1.2rem",
              boxShadow: "0 0 20px rgba(212, 175, 55, 0.4)"
            }}>
              DP
            </div>
            <p className="eyebrow" style={{ color: "var(--gold-primary)" }}>Acesso Exclusivo</p>
            <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>Login Premium</h1>
          </div>
          
          {error && (
            <div style={{ marginBottom: "1.5rem", padding: "0.8rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "0.5rem", color: "#f87171", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          <label className="input-group" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
            <span>E-mail profissional</span>
            <input 
              type="email" 
              name="email" 
              placeholder="contato@modelo.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "1rem", borderRadius: "0.8rem", background: "rgba(10, 10, 10, 0.6)", border: "1px solid rgba(245, 230, 200, 0.1)", color: "white" }}
            />
          </label>
          
          <label className="input-group" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
            <span>Senha segura</span>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "1rem", borderRadius: "0.8rem", background: "rgba(10, 10, 10, 0.6)", border: "1px solid rgba(245, 230, 200, 0.1)", color: "white" }}
            />
          </label>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <label className="check-row" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--gold-primary)", width: "1rem", height: "1rem" }} />
              <span>Lembrar sessão</span>
            </label>
            <Link className="subtle-link" href="#" style={{ fontSize: "0.9rem", color: "var(--gold-primary)", textDecoration: "underline" }}>Esqueceu a senha?</Link>
          </div>
          
          <button 
            className={`button button--primary ${loading ? "is-loading" : ""}`} 
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem", borderRadius: "0.8rem", fontWeight: "bold", position: "relative" }}
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>
      </main>
    </div>
  );
}