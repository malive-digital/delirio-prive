export default function Page() {
  return (
    <>`n      <header className="app-header">
      <a className="brand" href="/"><span className="brand__mark">DP</span><span>DelÃ­rio PrivÃª</span></a>
      <nav className="app-nav" aria-label="NavegaÃ§Ã£o">
        <a href="/">InÃ­cio</a><a href="/favoritos">Favoritos</a><a href="/planos">Planos</a><a className="login-link" href="/login">Entrar</a>
      </nav>
    </header>

    <main className="app-page profile-detail">
      <section className="profile-layout profile-layout--complete" aria-label="perfil trans">
        <div className="profile-media-column">
          <section className="profile-card-shell media-gallery" aria-label="Galeria de mÃ­dia aprovada">
            <div className="gallery-stage">
              <button className="gallery-zoom" type="button" aria-label="Ampliar mÃ­dia selecionada">
                <img id="profile-gallery-main" src="assets/profile-hero.webp" alt="Foto principal de Luna ValenÃ§a" />
              </button>
              <span className="approval-badge">Verificado</span>
              <span className="media-counter">1 / 6</span>
            </div>

            <div className="gallery-preview-grid" role="group" aria-label="PrÃ©via da galeria">
              <button className="gallery-thumb is-active" type="button" data-media="assets/profile-hero.webp" data-alt="Foto principal de Luna ValenÃ§a" aria-label="Ver foto principal">
                <img src="assets/profile-hero.webp" alt="" loading="lazy" />
              </button>
              <button className="gallery-thumb" type="button" data-media="assets/profile-valentina.webp" data-alt="Retrato verificado de Luna ValenÃ§a" aria-label="Ver retrato verificado">
                <img src="assets/profile-valentina.webp" alt="" loading="lazy" />
              </button>
              <button className="gallery-thumb" type="button" data-media="assets/profile-isadora.webp" data-alt="PrÃ©via aprovada da galeria" aria-label="Ver prÃ©via aprovada">
                <img src="assets/profile-isadora.webp" alt="" loading="lazy" />
              </button>
              <button className="gallery-thumb" type="button" data-media="assets/profile-laura.webp" data-alt="Foto adicional aprovada" aria-label="Ver foto adicional aprovada">
                <img src="assets/profile-laura.webp" alt="" loading="lazy" />
              </button>
              <button className="gallery-thumb gallery-thumb--video" type="button" data-media="assets/profile-hero.webp" data-alt="Preview de vÃ­deo curto aprovado" aria-label="Ver vÃ­deo curto aprovado">
                <img src="assets/profile-hero.webp" alt="" loading="lazy" />
                <span>VÃ­deo</span>
              </button>
              <button className="gallery-thumb" type="button" data-media="assets/profile-valentina.webp" data-alt="Foto de galeria aprovada" aria-label="Ver foto de galeria aprovada">
                <img src="assets/profile-valentina.webp" alt="" loading="lazy" />
              </button>
            </div>
          </section>
        </div>

        <aside className="profile-info-column">
          <article className="profile-card-shell profile-summary">
            <div className="status-line"><span className="status-dot"></span> Online agora <span>Perfil verificado</span></div>
            <h1>Luna ValenÃ§a <span className="seal">Premium</span></h1>
            <p className="profile-lead">Perfil trans com atendimento elegante, comunicaÃ§Ã£o clara e informaÃ§Ãµes completas para uma escolha segura e respeitosa.</p>

            <dl className="primary-info-grid primary-info-grid--trans">
              <div><dt>Identidade</dt><dd>Trans</dd></div>
              <div><dt>LocalizaÃ§Ã£o</dt><dd>Moema, SÃ£o Paulo</dd></div>
              <div><dt>Viagem</dt><dd>DisponÃ­vel sob consulta</dd></div>
              <div><dt>Expediente</dt><dd>Ter a dom, 15h Ã s 00h</dd></div>
              <div><dt>Perfil criado</dt><dd>25/03/2026</dd></div>
            </dl>

            <div className="trust-row">
              <span>MÃ­dia aprovada</span>
              <span>Dados transparentes</span>
              <span>Contato protegido</span>
            </div>

            <div className="sticky-actions profile-actions">
              <a className="button button--primary" href="https://wa.me/5511977777777" target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
              <button className="button button--ghost favorite-button favorite-button--wide" type="button">Favoritar</button>
            </div>
          </article>
        </aside>
      </section>

      <section className="profile-content-grid" aria-label="Detalhes do perfil trans">
        <article className="profile-card-shell pricing-section">
          <div className="section-kicker">Valores</div>
          <h2>Tabela transparente</h2>
          <table className="pricing-table">
            <caption>Valores de atendimento</caption>
            <tbody>
              <tr><td>15 minutos</td><td>R$ 260</td></tr>
              <tr><td>30 minutos</td><td>R$ 480</td></tr>
              <tr><td>1 hora</td><td>R$ 780</td></tr>
              <tr><td>2 horas</td><td>R$ 1.350</td></tr>
              <tr><td>4 horas</td><td>R$ 2.300</td></tr>
              <tr><td>DiÃ¡ria</td><td>R$ 5.000</td></tr>
              <tr><td>DiÃ¡ria viagem</td><td>Sob consulta</td></tr>
            </tbody>
          </table>
        </article>

        <article className="profile-card-shell description-section">
          <div className="section-kicker">DescriÃ§Ã£o</div>
          <h2>PresenÃ§a, respeito e confianÃ§a</h2>
          <p>
            Luna valoriza encontros com discriÃ§Ã£o, alinhamento prÃ©vio e tratamento respeitoso. O perfil reÃºne informaÃ§Ãµes
            detalhadas para facilitar uma conversa objetiva e uma experiÃªncia conduzida com seguranÃ§a e elegÃ¢ncia.
          </p>
        </article>

        <article className="profile-card-shell profile-wide-section">
          <div className="section-kicker">CaracterÃ­sticas fÃ­sicas</div>
          <h2>InformaÃ§Ãµes completas</h2>
          <dl className="detail-grid">
            <div><dt>GÃªnero</dt><dd>Feminino</dd></div>
            <div><dt>Identidade de gÃªnero</dt><dd>Trans</dd></div>
            <div><dt>PreferÃªncia</dt><dd>Homens e casais</dd></div>
            <div><dt>Peso</dt><dd>62 kg</dd></div>
            <div><dt>Altura</dt><dd>1,72 m</dd></div>
            <div><dt>Etnia</dt><dd>Parda</dd></div>
            <div><dt>Olhos</dt><dd>Mel</dd></div>
            <div><dt>Cabelo</dt><dd>Preto longo</dd></div>
            <div><dt>Corpo</dt><dd>CurvilÃ­neo</dd></div>
            <div><dt>Silicone</dt><dd>Sim</dd></div>
            <div><dt>Tatuagens</dt><dd>Discretas</dd></div>
            <div><dt>Piercings</dt><dd>Sim</dd></div>
            <div><dt>Fumante</dt><dd>NÃ£o</dd></div>
            <div><dt>Idiomas</dt><dd>PortuguÃªs, Espanhol</dd></div>
          </dl>
        </article>

        <article className="profile-card-shell profile-wide-section optional-details">
          <div className="section-kicker">Detalhes corporais opcionais</div>
          <h2>TransparÃªncia do perfil</h2>
          <dl className="detail-grid detail-grid--compact">
            <div><dt>Operada</dt><dd>NÃ£o informado</dd></div>
            <div><dt>Tipo de corpo</dt><dd>Feminino curvilÃ­neo</dd></div>
            <div><dt>ObservaÃ§Ãµes</dt><dd>Campo opcional preenchido pela modelo conforme preferÃªncia.</dd></div>
          </dl>
        </article>

        <article className="profile-card-shell profile-wide-section">
          <div className="section-kicker">ServiÃ§os</div>
          <h2>ExperiÃªncias disponÃ­veis</h2>
          <div className="premium-tags premium-tags--strong">
            <span>Acompanhante</span>
            <span>Eventos</span>
            <span>Viagens</span>
            <span>Virtual</span>
            <span>ExperiÃªncias personalizadas</span>
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

    <a className="mobile-contact" href="https://wa.me/5511977777777" target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
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