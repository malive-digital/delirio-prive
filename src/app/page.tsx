"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthNavLink } from "@/components/AuthNavLink";

export default function Home() {
  const router = useRouter();
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  useEffect(() => {
    const continueHomeFlow = () => {
      const userPreference = localStorage.getItem("userPreference");

      if (userPreference) {
        // Se já tem preferência salva, redireciona direto
        router.push(userPreference);
      } else {
        setShowInterestModal(true);
      }
    };

    setShowIntroVideo(true);

    if (sessionStorage.getItem("ageConfirmed")) {
      continueHomeFlow();
    }

    window.addEventListener("delirio:age-confirmed", continueHomeFlow);

    return () => {
      window.removeEventListener("delirio:age-confirmed", continueHomeFlow);
    };
  }, [router]);

  const finishIntroVideo = () => {
    setShowIntroVideo(false);
    window.dispatchEvent(new Event("delirio:intro-finished"));

    const ageConfirmed = sessionStorage.getItem("ageConfirmed");
    const userPreference = localStorage.getItem("userPreference");

    if (!ageConfirmed) {
      return;
    } else if (userPreference) {
      router.push(userPreference);
    } else {
      setShowInterestModal(true);
    }
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
