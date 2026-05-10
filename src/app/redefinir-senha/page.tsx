"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RedefinirSenha() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Não foi possível atualizar a senha. Solicite um novo link e tente novamente.");
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage("Senha atualizada com sucesso.");
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
          <Link href="/login">Login</Link>
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
          background: "radial-gradient(circle at center, rgba(212,175,55,0.06) 0%, transparent 65%), linear-gradient(to bottom, #0a0a0a, #111)",
        }}
      >
        <form
          onSubmit={handlePasswordUpdate}
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
              Segurança
            </p>
            <h1
              style={{
                fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
                margin: 0,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Definir nova senha
            </h1>
          </div>

          {!hasSession && (
            <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Abra esta página pelo link enviado ao seu e-mail para liberar a troca de senha.
            </p>
          )}

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

          {message && (
            <div
              style={{
                padding: "0.8rem",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "0.5rem",
                color: "#86efac",
                fontSize: "0.9rem",
              }}
            >
              {message}
            </div>
          )}

          <label className="input-group" style={{ textAlign: "left" }}>
            <span>Nova senha</span>
            <input
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={inputStyle}
            />
          </label>

          <label className="input-group" style={{ textAlign: "left" }}>
            <span>Confirmar senha</span>
            <input
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              style={inputStyle}
            />
          </label>

          <button
            className={`button button--primary ${loading ? "is-loading" : ""}`}
            type="submit"
            disabled={loading || !hasSession}
            style={{
              width: "100%",
              padding: "1.15rem",
              fontSize: "1.05rem",
              borderRadius: "0.8rem",
              fontWeight: "bold",
            }}
          >
            {loading ? "Atualizando..." : "Atualizar senha"}
          </button>

          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
            Depois de atualizar, acesse novamente pelo{" "}
            <Link href="/login" style={{ color: "var(--gold-primary)", textDecoration: "underline" }}>
              login
            </Link>
            .
          </p>
        </form>
      </main>
    </div>
  );
}
