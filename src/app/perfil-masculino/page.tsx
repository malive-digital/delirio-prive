export default function Page() {
  return (
    <>`n      <header className="app-header">
      <a className="brand" href="/"><span className="brand__mark">DP</span><span>DelÃ­rio PrivÃª</span></a>
      <nav className="app-nav" aria-label="NavegaÃ§Ã£o">
        <a href="/">InÃ­cio</a><a href="/favoritos">Favoritos</a><a href="/planos">Planos</a><a className="login-link" href="/login">Entrar</a>
      </nav>
    </header>

    <main className="app-page profile-detail">
      <section className="profile-layout profile-layout--complete" aria-label="Perfil masculino">
        <div className="profile-media-column">
          <section className="profile-card-shell media-gallery" aria-label="Galeria de mÃ­dia">
            <div className="gallery-stage">
              <button className="gallery-zoom" type="button" aria-label="Ampliar mÃ­dia selecionada">
                <img id="profile-gallery-main" src="assets/profile-hero.webp" alt="Foto principal de Rafael Prado" />
              </button>
              <span className="approval-badge">Verificado</span>
              <span className="media-counter">1 / 6</span>
            </div>

            <div className="gallery-preview-grid" role="group" aria-label="PrÃ©via da galeria">
              <button className="gallery-thumb is-active" type="button" data-media="assets/profile-hero.webp" data-alt="Foto principal de Rafael Prado" aria-label="Ver foto principal">
                <img src="assets/profile-hero.webp" alt="" loading="lazy" />
              </button>
              <button className="gallery-thumb" type="button" data-media="assets/profile-isadora.webp" data-alt="Retrato verificado de Rafael Prado" aria-label="Ver retrato verificado">
                <img src="assets/profile-isadora.webp" alt="" loading="lazy" />
              </button>
              <button className="gallery-thumb" type="button" data-media="assets/profile-laura.webp" data-alt="PrÃ©via aprovada do perfil" aria-label="Ver prÃ©via aprovada">
                <img src="assets/profile-laura.webp" alt="" loading="lazy" />
              </button>
              <button className="gallery-thumb" type="button" data-media="assets/profile-valentina.webp" data-alt="Foto adicional aprovada" aria-label="Ver foto adicional aprovada">
                <img src="assets/profile-valentina.webp" alt="" loading="lazy" />
              </button>
              <button className="gallery-thumb gallery-thumb--video" type="button" data-media="assets/profile-hero.webp" data-alt="Preview de vÃ­deo curto aprovado" aria-label="Ver vÃ­deo curto aprovado">
                <img src="assets/profile-hero.webp" alt="" loading="lazy" />
                <span>VÃ­deo</span>
              </button>
              <button className="gallery-thumb" type="button" data-media="assets/profile-isadora.webp" data-alt="Foto de galeria aprovada" aria-label="Ver foto de galeria aprovada">
                <img src="assets/profile-isadora.webp" alt="" loading="lazy" />
              </button>
            </div>
          </section>
        </div>

        <aside className="profile-info-column">
          <article className="profile-card-shell profile-summary">
            <div className="status-line"><span className="status-dot"></span> Online agora <span>Perfil verificado</span></div>
            <h1>Rafael Prado <span className="seal">Premium</span></h1>
            <p className="profile-lead">Atendimento discreto, comunicaÃ§Ã£o objetiva e disponibilidade para encontros sociais, viagens e eventos.</p>

            <dl className="primary-info-grid">
              <div><dt>LocalizaÃ§Ã£o</dt><dd>Itaim Bibi, SÃ£o Paulo</dd></div>
              <div><dt>Viagem</dt><dd>DisponÃ­vel</dd></div>
              <div><dt>Expediente</dt><dd>Todos os dias, 12h Ã s 23h</dd></div>
              <div><dt>Perfil criado</dt><dd>22/03/2026</dd></div>
            </dl>

            <div className="trust-row">
              <span>Galeria aprovada</span>
              <span>Maior de 18</span>
              <span>Contato direto</span>
            </div>

            <div className="sticky-actions profile-actions">
              <a className="button button--primary" href="https://wa.me/5511988888888" target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
              <button className="button button--ghost favorite-button favorite-button--wide" type="button">Favoritar</button>
            </div>
          </article>
        </aside>
      </section>

      <section className="profile-content-grid" aria-label="Detalhes do perfil masculino">
        <article className="profile-card-shell pricing-section">
          <div className="section-kicker">Valores</div>
          <h2>Tabela rÃ¡pida</h2>
          <table className="pricing-table pricing-table--compact">
            <caption>Valores de atendimento</caption>
            <tbody>
              <tr><td>15 minutos</td><td>R$ 220</td></tr>
              <tr><td>30 minutos</td><td>R$ 390</td></tr>
              <tr><td>1 hora</td><td>R$ 650</td></tr>
              <tr><td>2 horas</td><td>R$ 1.100</td></tr>
              <tr><td>4 horas</td><td>R$ 1.900</td></tr>
              <tr><td>DiÃ¡ria</td><td>R$ 4.200</td></tr>
              <tr><td>DiÃ¡ria viagem</td><td>Sob consulta</td></tr>
            </tbody>
          </table>
        </article>

        <article className="profile-card-shell description-section">
          <div className="section-kicker">DescriÃ§Ã£o</div>
          <h2>Objetivo e profissional</h2>
          <p>
            Rafael prioriza pontualidade, descriÃ§Ã£o e postura profissional. Perfil indicado para companhia em eventos,
            viagens curtas, encontros reservados e experiÃªncias com agenda combinada previamente.
          </p>
        </article>

        <article className="profile-card-shell profile-wide-section">
          <div className="section-kicker">CaracterÃ­sticas</div>
          <h2>InformaÃ§Ãµes rÃ¡pidas</h2>
          <dl className="detail-grid">
            <div><dt>GÃªnero</dt><dd>Masculino</dd></div>
            <div><dt>PreferÃªncia</dt><dd>Mulheres</dd></div>
            <div><dt>Peso</dt><dd>82 kg</dd></div>
            <div><dt>Altura</dt><dd>1,84 m</dd></div>
            <div><dt>Porte fÃ­sico</dt><dd>AtlÃ©tico</dd></div>
            <div><dt>Etnia</dt><dd>Branco</dd></div>
            <div><dt>Olhos</dt><dd>Castanhos</dd></div>
            <div><dt>Cabelo</dt><dd>Castanho curto</dd></div>
            <div><dt>Barba</dt><dd>Curta</dd></div>
            <div><dt>Tatuagens</dt><dd>Sim</dd></div>
            <div><dt>Piercings</dt><dd>NÃ£o</dd></div>
            <div><dt>Fumante</dt><dd>NÃ£o</dd></div>
            <div><dt>Idiomas</dt><dd>PortuguÃªs, InglÃªs</dd></div>
          </dl>
        </article>

        <article className="profile-card-shell profile-wide-section">
          <div className="section-kicker">ServiÃ§os</div>
          <h2>OpÃ§Ãµes disponÃ­veis</h2>
          <div className="premium-tags premium-tags--minimal">
            <span>Acompanhante</span>
            <span>Eventos</span>
            <span>Viagens</span>
            <span>Massagem</span>
            <span>Companhia</span>
            <span>Virtual</span>
          </div>
        </article>

        <article className="profile-card-shell profile-wide-section">
          <div className="section-kicker">Pagamento</div>
          <h2>Formas aceitas</h2>
          <div className="payment-tags">
            <span>Pix</span>
            <span>Dinheiro</span>
            <span>CartÃ£o</span>
          </div>
        </article>
      </section>
    </main>

    <a className="mobile-contact" href="https://wa.me/5511988888888" target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
    <div className="image-lightbox" id="image-lightbox" role="dialog" aria-modal="true" aria-label="Imagem ampliada" hidden>
      <button className="image-lightbox__close" type="button" aria-label="Fechar imagem ampliada">Ã—</button>
      <img src="assets/profile-hero.webp" alt="" />
    </div>
    <nav className="bottom-nav" aria-label="NavegaÃ§Ã£o mobile">
      <a href="/">Explorar</a>
      <a href="/favoritos">Favoritos</a>
      <a href="/planos">Planos</a>
      <a href="/login">Conta</a>
    </nav>
    
  
    </>
  );
}