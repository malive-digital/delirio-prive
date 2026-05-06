"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [isHidingAgeGate, setIsHidingAgeGate] = useState(false);

  useEffect(() => {
    const ageConfirmed = localStorage.getItem("ageConfirmed");
    const userPreference = localStorage.getItem("userPreference");

    if (!ageConfirmed) {
      setShowAgeGate(true);
    } else if (userPreference) {
      // Se já tem preferência salva, redireciona direto
      router.push(userPreference);
    } else {
      setShowInterestModal(true);
    }
  }, [router]);

  const handleAgeConfirm = () => {
    localStorage.setItem("ageConfirmed", "true");
    setIsHidingAgeGate(true);
    setTimeout(() => {
      setShowAgeGate(false);
      
      const userPreference = localStorage.getItem("userPreference");
      if (userPreference) {
        router.push(userPreference);
      } else {
        setShowInterestModal(true);
      }
    }, 400); 
  };

  const handleInterestSelect = (target: string) => {
    localStorage.setItem("userPreference", target);
    router.push(target);
  };

  return (
    <div className="entry-page">
      {showAgeGate && (
        <div className={`age-gate ${isHidingAgeGate ? "is-hiding" : ""}`} role="dialog" aria-modal="true" aria-labelledby="age-title">
          <div className="age-gate__panel" style={{ maxHeight: "calc(100vh - 2rem)", overflowY: "auto" }}>
            <p className="eyebrow">Conteúdo adulto</p>
            <h2 id="age-title">Acesso restrito a maiores de 18 anos</h2>
            <p>Ao continuar, você confirma ser maior de idade e concorda com os termos de uso e política de privacidade.</p>
            <div style={{ display: "grid", gap: "0.75rem", margin: "1.2rem 0", textAlign: "left" }}>
              <div style={{ padding: "0.95rem", borderRadius: "0.85rem", border: "1px solid rgba(212,175,55,0.28)", background: "rgba(212,175,55,0.08)" }}>
                <strong style={{ display: "block", color: "var(--champagne)", marginBottom: "0.35rem" }}>Aviso institucional</strong>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.55 }}>
                  O Delírio Privê atua exclusivamente como plataforma de divulgação de perfis independentes. Não somos agência,
                  boate, casa de atendimento, intermediadores ou representantes das anunciantes. Toda negociação acontece
                  diretamente entre visitante e anunciante.
                </p>
              </div>

              <div style={{ padding: "0.95rem", borderRadius: "0.85rem", border: "1px solid rgba(239,68,68,0.32)", background: "rgba(239,68,68,0.08)" }}>
                <strong style={{ display: "block", color: "#fca5a5", marginBottom: "0.35rem" }}>Alerta contra golpes</strong>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.55 }}>
                  O Delírio Privê não solicita prints de conversas, vídeos de clientes, códigos, senhas ou pagamentos para
                  terceiros. Desconfie de perfis, agenciadores ou supostos representantes usando o nome do site. Antes de
                  qualquer pagamento, confirme diretamente com a administração oficial. Não respondemos intermediários,
                  agenciadores ou terceiros.
                </p>
                <Link href="/cadastro-whatsapp" style={{ display: "inline-flex", marginTop: "0.65rem", color: "var(--gold-primary)", fontSize: "0.85rem", fontWeight: 800, textDecoration: "underline" }}>
                  Ver alertas e política de anúncios
                </Link>
              </div>
            </div>
            <div className="age-gate__actions">
              <button className="button button--primary" type="button" onClick={handleAgeConfirm}>
                Tenho 18 anos ou mais
              </button>
              <a className="button button--ghost" href="https://www.google.com.br">Sair</a>
            </div>
          </div>
        </div>
      )}

      {showInterestModal && (
        <div className="interest-modal" role="dialog" aria-modal="true" aria-labelledby="interest-title">
          <div className="interest-modal__panel">
            <p className="eyebrow">Preferência de busca</p>
            <h2 id="interest-title">Qual perfil você deseja explorar?</h2>
            <p>Essa escolha define o catálogo principal da sua navegação.</p>
            <div className="interest-options" role="group" aria-label="Escolha de interesse">
              <button className="interest-option" type="button" onClick={() => handleInterestSelect("/mulheres")}>
                <span>Mulheres</span>
              </button>
              <button className="interest-option" type="button" onClick={() => handleInterestSelect("/homens")}>
                <span>Homens</span>
              </button>
              <button className="interest-option" type="button" onClick={() => handleInterestSelect("/travestis")}>
                <span>Trans</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="app-header">
        <a className="brand" href="/" aria-label="Delírio Privê">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </a>
        <nav className="app-nav" aria-label="Navegação">
          <a href="/">Início</a>
          <a href="/favoritos">Favoritos</a>
          <a href="/planos">Planos</a>
          <a className="login-link" href="/login">Entrar</a>
        </nav>
      </header>

      <main className="entry-shell" style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 4.8rem)" }}>
        {/* Modais estão como fixed, então podem cobrir a tela inteira, mas se quiser que fiquem abaixo do header, 
            podemos ajustar o z-index ou deixá-los fluidos no meio do main */}
      </main>
    </div>
  );
}
