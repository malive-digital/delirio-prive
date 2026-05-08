"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthNavLink } from "@/components/AuthNavLink";

export default function Home() {
  const router = useRouter();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [isHidingAgeGate, setIsHidingAgeGate] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  useEffect(() => {
    const introPlayed = sessionStorage.getItem("introPlayed");
    const ageConfirmed = sessionStorage.getItem("ageConfirmed");
    const userPreference = localStorage.getItem("userPreference");

    if (!introPlayed) {
      setShowIntroVideo(true);
      return;
    }

    if (!ageConfirmed) {
      setShowAgeGate(true);
    } else if (userPreference) {
      // Se já tem preferência salva, redireciona direto
      router.push(userPreference);
    } else {
      setShowInterestModal(true);
    }
  }, [router]);

  const finishIntroVideo = () => {
    sessionStorage.setItem("introPlayed", "true");
    setShowIntroVideo(false);

    const ageConfirmed = sessionStorage.getItem("ageConfirmed");
    const userPreference = localStorage.getItem("userPreference");

    if (!ageConfirmed) {
      setShowAgeGate(true);
    } else if (userPreference) {
      router.push(userPreference);
    } else {
      setShowInterestModal(true);
    }
  };

  const handleAgeConfirm = () => {
    sessionStorage.setItem("ageConfirmed", "true");
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
      {showIntroVideo && (
        <div className="intro-video" aria-label="Abertura Delírio Privê">
          <video
            className="intro-video__media"
            src="/assets/intro.mp4"
            autoPlay
            muted
            playsInline
            onEnded={finishIntroVideo}
            onError={finishIntroVideo}
          />
          <button className="intro-video__skip" type="button" onClick={finishIntroVideo}>
            Pular
          </button>
        </div>
      )}

      {showAgeGate && (
        <div className={`age-gate ${isHidingAgeGate ? "is-hiding" : ""}`} role="dialog" aria-modal="true" aria-labelledby="age-title">
          <div className="age-gate__panel">
            <p className="eyebrow">Conteúdo adulto</p>
            <h2 id="age-title">Acesso restrito a maiores de 18 anos</h2>
            <p>Ao continuar, você confirma ser maior de idade e concorda com os termos de uso e política de privacidade.</p>
            <div className="age-gate__notice-list">
              <div className="age-gate__notice age-gate__notice--institutional">
                <strong>Aviso institucional</strong>
                <p>
                  O Delírio Privê atua exclusivamente como plataforma de divulgação de perfis independentes. Não somos agência,
                  boate, casa de atendimento, intermediadores ou representantes das anunciantes. Toda negociação acontece
                  diretamente entre visitante e anunciante.
                </p>
              </div>

              <div className="age-gate__notice age-gate__notice--warning">
                <strong>Alerta contra golpes</strong>
                <p>
                  O Delírio Privê não solicita prints de conversas, vídeos de clientes, códigos, senhas ou pagamentos para
                  terceiros. Desconfie de perfis, agenciadores ou supostos representantes usando o nome do site. Antes de
                  qualquer pagamento, confirme diretamente com a administração oficial. Não respondemos intermediários,
                  agenciadores ou terceiros.
                </p>
                <Link href="/cadastro-whatsapp" className="age-gate__policy-link">
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
          <a href="/planos">Planos</a>
          <a href="/parcerias-promocoes">Parcerias</a>
          <AuthNavLink />
        </nav>
      </header>

      <main className="entry-shell" style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 4.8rem)" }}>
        <section className="home-seo" aria-labelledby="home-title">
          <p className="eyebrow">Plataforma exclusiva</p>
          <h1 id="home-title">Delírio Privê | Acompanhantes de Luxo</h1>
          <p>
            Conheça o Delírio Privê, uma plataforma exclusiva para encontrar acompanhantes de luxo com perfis
            verificados, fotos, informações completas e atendimento discreto.
          </p>
          <div className="home-seo__actions" aria-label="Categorias principais">
            <Link className="button button--primary" href="/mulheres">Mulheres</Link>
            <Link className="button button--ghost" href="/homens">Homens</Link>
            <Link className="button button--ghost" href="/travestis">Trans</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
