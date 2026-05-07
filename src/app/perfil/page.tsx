"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Perfil() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Carrega status online
    const onlineStatus = localStorage.getItem("isOnline");
    if (onlineStatus !== null) {
      setIsOnline(onlineStatus === "true");
    }

    // Basic Lightbox functionality se necessário localmente
    const thumbs = document.querySelectorAll(".gallery-thumb");
    const mainImg = document.getElementById("profile-gallery-main") as HTMLImageElement;
    
    thumbs.forEach(thumb => {
      thumb.addEventListener("click", () => {
        thumbs.forEach(t => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
        if (mainImg) {
          mainImg.src = thumb.getAttribute("data-media") || mainImg.src;
        }
      });
    });
  }, []);

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
          <Link href="/planos">Planos</Link>
          <Link className="login-link" href="/login">Entrar</Link>
        </nav>
      </header>

      <main className="app-page profile-detail profile-detail--masculine">
        <section className="profile-layout profile-layout--complete" aria-label="Perfil de acompanhante">
          <div className="profile-media-column">
            {/* Botão de Voltar */}
            <button 
              onClick={() => router.back()} 
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(10, 10, 10, 0.6)",
                border: "1px solid rgba(245, 230, 200, 0.15)",
                backdropFilter: "blur(10px)",
                padding: "0.8rem 1.5rem",
                borderRadius: "999px",
                color: "var(--text-secondary)",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "1rem",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--gold-primary)";
                e.currentTarget.style.color = "var(--gold-primary)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "rgba(245, 230, 200, 0.15)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar ao Catálogo
            </button>

            <section className="profile-card-shell media-gallery" aria-label="Galeria de fotos e vídeos">
              <div className="gallery-stage">
                <button className="gallery-zoom" type="button" aria-label="Ampliar imagem selecionada">
                  <img id="profile-gallery-main" src="/assets/profile-hero.webp" alt="Foto principal de Isadora Monteiro" />
                </button>
                <button className="gallery-nav gallery-nav--prev" type="button" aria-label="Foto anterior">‹</button>
                <button className="gallery-nav gallery-nav--next" type="button" aria-label="Próxima foto">›</button>
                <span className="approval-badge">Verificado</span>
                <span className="media-counter">1 / 6</span>
              </div>

              <div className="gallery-preview-grid" role="group" aria-label="Prévia da galeria">
                <button className="gallery-thumb is-active" type="button" data-media="/assets/profile-hero.webp" data-alt="Foto principal" aria-label="Ver foto principal">
                  <img src="/assets/profile-hero.webp" alt="" loading="lazy" />
                </button>
                <button className="gallery-thumb" type="button" data-media="/assets/profile-isadora.webp" data-alt="Retrato verificado" aria-label="Ver retrato verificado">
                  <img src="/assets/profile-isadora.webp" alt="" loading="lazy" />
                </button>
                <button className="gallery-thumb" type="button" data-media="/assets/profile-valentina.webp" data-alt="Prévia aprovada" aria-label="Ver prévia aprovada">
                  <img src="/assets/profile-valentina.webp" alt="" loading="lazy" />
                </button>
                <button className="gallery-thumb" type="button" data-media="/assets/profile-laura.webp" data-alt="Prévia de galeria" aria-label="Ver prévia de galeria">
                  <img src="/assets/profile-laura.webp" alt="" loading="lazy" />
                </button>
                <button className="gallery-thumb gallery-thumb--video" type="button" data-media="/assets/profile-hero.webp" data-alt="Preview de vídeo" aria-label="Ver vídeo curto">
                  <img src="/assets/profile-hero.webp" alt="" loading="lazy" />
                  <span>Vídeo</span>
                </button>
                <button className="gallery-thumb" type="button" data-media="/assets/profile-isadora.webp" data-alt="Foto adicional" aria-label="Ver foto adicional">
                  <img src="/assets/profile-isadora.webp" alt="" loading="lazy" />
                </button>
              </div>
            </section>
          </div>

          <aside className="profile-info-column">
            <article className="profile-card-shell profile-summary">
              <div className="status-line">
                <span className="status-dot" style={{ background: isOnline ? "#4ade80" : "#f87171", boxShadow: `0 0 10px ${isOnline ? "#4ade80" : "#f87171"}` }}></span> 
                {isOnline ? "Online agora" : "Offline"} 
                <span style={{ marginLeft: "1rem" }}>Perfil verificado</span>
              </div>
              <h1>Isadora Monteiro <span className="seal" style={{ WebkitTextFillColor: "initial", color: "#111", background: "var(--gold-primary)", textShadow: "none" }}>Top Privê</span></h1>
              <p className="profile-lead">Presença elegante, atendimento reservado e agenda seletiva para encontros com alto nível de discrição.</p>

              <dl className="primary-info-grid">
                <div><dt>Localização</dt><dd>Jardins, São Paulo</dd></div>
                <div><dt>Viagem</dt><dd>Disponível sob consulta</dd></div>
                <div><dt>Expediente</dt><dd>Seg a sáb, 14h às 23h</dd></div>
                <div><dt>Perfil criado</dt><dd>18/03/2026</dd></div>
              </dl>

              <div className="trust-row">
                <span>Fotos aprovadas</span>
                <span>Maior de 18</span>
                <span>Contato protegido</span>
              </div>

              <div className="sticky-actions profile-actions">
                <a className="button button--primary" href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
                <button className="button button--ghost favorite-button favorite-button--wide" type="button">Favoritar</button>
              </div>
            </article>
          </aside>
        </section>

        <section className="profile-content-grid" aria-label="Detalhes do perfil">
          <article className="profile-card-shell pricing-section">
            <div className="section-kicker">Valores</div>
            <h2>Tabela de atendimento</h2>
            <table className="pricing-table">
              <caption>Valores de atendimento</caption>
              <tbody>
                <tr><td>15 minutos</td><td>R$ 250</td></tr>
                <tr><td>30 minutos</td><td>R$ 450</td></tr>
                <tr><td>1 hora</td><td>R$ 700</td></tr>
                <tr><td>2 horas</td><td>R$ 1.200</td></tr>
                <tr><td>4 horas</td><td>R$ 2.100</td></tr>
                <tr><td>Diária</td><td>R$ 4.800</td></tr>
                <tr><td>Diária viagem</td><td>Sob consulta</td></tr>
              </tbody>
            </table>
          </article>

          <article className="profile-card-shell description-section">
            <div className="section-kicker">Descrição</div>
            <h2>Sobre Isadora</h2>
            <p>
              Atendimento pensado para quem valoriza presença, discrição e uma experiência conduzida com calma. Isadora recebe
              com hora marcada, mantém comunicação objetiva e prioriza encontros elegantes, seguros e reservados.
            </p>
          </article>

          <article className="profile-card-shell profile-wide-section">
            <div className="section-kicker">Características físicas</div>
            <h2>Detalhes do perfil</h2>
            <dl className="detail-grid">
              <div><dt>Gênero</dt><dd>Feminino</dd></div>
              <div><dt>Preferência sexual</dt><dd>Homens</dd></div>
              <div><dt>Peso</dt><dd>58 kg</dd></div>
              <div><dt>Altura</dt><dd>1,68 m</dd></div>
              <div><dt>Etnia</dt><dd>Branca</dd></div>
              <div><dt>Olhos</dt><dd>Castanhos</dd></div>
              <div><dt>Cabelo</dt><dd>Castanho longo</dd></div>
              <div><dt>Tamanho do pé</dt><dd>36</dd></div>
              <div><dt>Silicone</dt><dd>Sim</dd></div>
              <div><dt>Tatuagens</dt><dd>Discretas</dd></div>
              <div><dt>Piercings</dt><dd>Não</dd></div>
              <div><dt>Fumante</dt><dd>Não</dd></div>
              <div><dt>Idiomas</dt><dd>Português, Inglês</dd></div>
            </dl>
          </article>

          <article className="profile-card-shell profile-wide-section">
            <div className="section-kicker">Serviços oferecidos</div>
            <h2>Preferências de atendimento</h2>
            <div className="premium-tags">
              <span>Sexo vaginal com preservativo</span>
              <span>Sexo oral com preservativo</span>
              <span>Masturbação</span>
              <span>Sexo virtual</span>
              <span>Acessórios eróticos</span>
              <span>Chuva dourada</span>
              <span>Acompanhante</span>
            </div>
          </article>

          <article className="profile-card-shell profile-wide-section">
            <div className="section-kicker">Formas de pagamento</div>
            <h2>Pagamento aceito</h2>
            <div className="payment-tags">
              <span>Dinheiro</span>
              <span>Pix</span>
              <span>Cartão</span>
              <span>Transferência</span>
            </div>
          </article>
        </section>
      </main>

      <a className="mobile-contact" href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
      
      <div className="image-lightbox" id="image-lightbox" role="dialog" aria-modal="true" aria-label="Imagem ampliada" hidden>
        <button className="image-lightbox__close" type="button" aria-label="Fechar imagem ampliada">×</button>
        <img src="/assets/profile-hero.webp" alt="" />
      </div>

      <nav className="bottom-nav" aria-label="Navegação mobile">
        <Link href="/">Explorar</Link>
        <Link href="/favoritos">Favoritos</Link>
        <Link href="/planos">Planos</Link>
        <Link href="/login">Conta</Link>
      </nav>
    </>
  );
}
