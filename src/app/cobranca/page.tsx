"use client";

import { useState } from "react";
import Link from "next/link";

export default function Cobranca() {
  const [selectedPlan, setSelectedPlan] = useState("Top Privê");

  const plans = [
    {
      name: "Básico",
      price: "R$ 49,90",
      badge: null,
      features: ["Perfil listado", "Baixa visibilidade"],
      buttonLabel: "Pagar Básico",
      buttonClass: "button--muted",
    },
    {
      name: "Premium",
      price: "R$ 89,90",
      badge: null,
      features: ["Perfil em destaque", "Mais visualizações", "Prioridade na busca"],
      buttonLabel: "Pagar Premium",
      buttonClass: "button--muted",
    },
    {
      name: "Top Privê",
      price: "R$ 149,90",
      badge: "Mais escolhido",
      features: ["Topo fixo", "Máxima exposição", "Selo exclusivo", "Alta conversão"],
      buttonLabel: "Pagar Top Privê",
      buttonClass: "button--primary",
    },
  ];

  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link href="/favoritos">Favoritos</Link>
          <Link className="is-active" href="/planos">Planos</Link>
          <Link className="login-link" href="/login">Entrar</Link>
        </nav>
      </header>

      <main className="app-page">
        <div className="page-title">
          <div>
            <p className="eyebrow">Área Restrita</p>
            <h1>Renovação de Plano</h1>
          </div>
          <p>Escolha o seu plano para prosseguir com o pagamento automático (PIX ou Cartão).</p>
        </div>

        <section className="pricing-grid" aria-label="Planos disponíveis" style={{ maxWidth: "1000px", margin: "0 auto 4rem" }}>
          {plans.map((plan) => (
            <article 
              key={plan.name} 
              className={`plan ${plan.badge ? "plan--featured" : ""} ${selectedPlan === plan.name ? "is-selected" : ""}`} 
              onClick={() => setSelectedPlan(plan.name)}
              style={{ cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease", padding: "2rem" }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                if (!plan.badge) {
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                if (!plan.badge) {
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {plan.badge && <div className="plan__badge">{plan.badge}</div>}
              <div className="plan__head" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.8rem" }}>{plan.name}</h2>
                <p style={{ fontSize: "2.8rem", fontWeight: "900", color: "var(--gold-primary)", margin: "1rem 0 0.5rem" }}>
                  {plan.price}<span style={{ fontSize: "1rem", color: "var(--text-secondary)", fontWeight: "normal" }}>/mês</span>
                </p>
              </div>
              <ul style={{ minHeight: "180px" }}>
                {plan.features.map((feat, idx) => (
                  <li key={idx} style={{ marginBottom: "0.8rem", fontSize: "1.05rem" }}>{feat}</li>
                ))}
              </ul>
              <button 
                className={`button ${plan.buttonClass} plan__button`} 
                style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
                onClick={(e) => {
                  const btn = e.currentTarget;
                  btn.classList.add("is-loading");
                  setTimeout(() => {
                    btn.classList.remove("is-loading");
                    alert(`Redirecionando para o gateway de pagamento (MercadoPago/Stripe) do plano ${plan.name} no valor de ${plan.price}...`);
                  }, 1500);
                }}
              >
                {plan.buttonLabel}
              </button>
            </article>
          ))}
        </section>


      </main>
    </>
  );
}