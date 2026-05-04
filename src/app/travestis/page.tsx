export default function Page() {
  return (
    <>
<header className="app-header">
      <a className="brand" href="/index" aria-label="Delírio Privê">
        <span className="brand__mark">DP</span>
        <span>Delírio Privê</span>
      </a>
      <nav className="app-nav" aria-label="Navegação">
        <a href="/index">Início</a>
        <a href="/favoritos">Favoritos</a>
        <a href="/planos">Planos</a>
        <a className="login-link" href="/login">Entrar</a>
      </nav>
    </header>

    <main className="app-page explore">
      <div className="page-title">
        <div>
          <p className="eyebrow">Descoberta premium</p>
          <h1>Trans</h1>
          <p className="page-intro">Perfis trans selecionados com foco em segurança, curadoria e alto padrão.</p>
        </div>
        <nav className="category-switcher" aria-label="Trocar categoria">
          <a href="/mulheres">Mulheres</a>
          <a href="/homens">Homens</a>
          <a className="is-active" href="/travestis">Trans</a>
        </nav>
      </div>

      <section className="catalog-status" aria-label="Preferências de navegação">
        <div>
          <span className="status-kicker">Localização</span>
          <strong>São Paulo</strong>
        </div>
        <div>
          <span className="status-kicker">Modo anônimo</span>
          <strong>Ativado</strong>
        </div>
      </section>

      <section className="catalog-shell catalog-shell--single">
        <div className="catalog-main">
          <section className="catalog-controls is-collapsed" id="catalog-controls" aria-label="Controles do catálogo">
            <div className="catalog-controls__bar">
              <label className="search-pill">
                <span>Buscar perfil</span>
                <input id="profile-search" type="search" placeholder="Nome, cidade, bairro ou categoria" />
              </label>
              <div className="filter-summary" aria-live="polite">
                <span id="filter-summary-text">Todos os perfis</span>
              </div>
              <button
                className="filter-toggle"
                id="filter-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="filter-panel"
              >
                <span>Filtros</span>
                <span className="filter-toggle__icon" aria-hidden="true"></span>
              </button>
              <button className="button button--ghost clear-filter-button js-clear-filters" type="button">Limpar filtros</button>
            </div>

            <div className="filter-panel" id="filter-panel">
              <div className="filter-bar" role="group" aria-label="Filtros baseados no perfil trans">
                <label className="filter-field">
                  <span>Estado</span>
                  <select aria-label="Estado">
                                        <option>Estado</option>
                    <option>SP</option>
                    <option>RJ</option>
                    <option>PR</option>
                    <option>BA</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Cidade</span>
                  <select aria-label="Cidade">
                                        <option>Cidade</option>
                    <option>São Paulo</option>
                    <option>Rio de Janeiro</option>
                    <option>Curitiba</option>
                    <option>Salvador</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Bairro</span>
                  <select aria-label="Bairro">
                                        <option>Bairro</option>
                    <option>Moema</option>
                    <option>Copacabana</option>
                    <option>Batel</option>
                    <option>Barra</option>
                    <option>Jardins</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Identidade</span>
                  <select aria-label="Identidade de gênero">
                                        <option>Identidade</option>
                    <option>Trans</option>
                    <option>Não-binária</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Viagem</span>
                  <select aria-label="Disponibilidade para viagem">
                                        <option>Viagem</option>
                    <option>Disponível sob consulta</option>
                    <option>Viagem</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Perfil</span>
                  <select aria-label="Características do perfil">
                                        <option>Perfil</option>
                    <option>Feminino</option>
                    <option>Curvilíneo</option>
                    <option>Silicone</option>
                    <option>Piercings</option>
                    <option>Não fumante</option>
                    <option>Português Espanhol</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Serviço</span>
                  <select aria-label="Serviço">
                                        <option>Serviço</option>
                    <option>Acompanhante</option>
                    <option>Eventos</option>
                    <option>Viagens</option>
                    <option>Virtual</option>
                    <option>Experiências personalizadas</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Pagamento</span>
                  <select aria-label="Pagamento">
                                        <option>Pagamento</option>
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Ordenar por</span>
                  <select id="sort-profiles" aria-label="Ordenar por">
                    <option value="featured">Destaque</option>
                    <option value="new">Top Privê</option>
                    <option value="views">Mais vistas</option>
                  </select>
                </label>
              </div>

              <div className="quick-filter-row" role="group" aria-label="Filtros rápidos">
                <button className="quick-chip is-active" type="button" data-filter="all">Todos</button>
                <button className="quick-chip" type="button" data-filter="online">Online agora</button>
                <button className="quick-chip" type="button" data-filter="trans">Trans</button>
                <button className="quick-chip" type="button" data-filter="verificada">Verificadas</button>
                <button className="quick-chip" type="button" data-filter="curvilineo">Curvilíneo</button>
                <button className="quick-chip" type="button" data-filter="viagem">Viagem</button>
                <span className="result-count"><strong id="result-count">8</strong> perfis</span>
              </div>
            </div>
          </section>

          <section className="stories-row" aria-label="Stories">
            <a className="story-item is-online" href="/perfil-trans" data-online="true">
              <span className="story-avatar story-avatar--one"><span className="story-online-badge"></span></span>
              <strong>Luna</strong>
              <span className="sr-only">Online</span>
            </a>
            <a className="story-item is-online" href="/perfil-trans" data-online="true">
              <span className="story-avatar story-avatar--two"><span className="story-online-badge"></span></span>
              <strong>Valentina</strong>
              <span className="sr-only">Online</span>
            </a>
            <a className="story-item" href="/perfil-trans" data-online="false">
              <span className="story-avatar story-avatar--three"><span className="story-online-badge"></span></span>
              <strong>Mirella</strong>
            </a>
            <a className="story-item" href="/perfil-trans" data-online="false">
              <span className="story-avatar story-avatar--four"><span className="story-online-badge"></span></span>
              <strong>Ayla</strong>
            </a>
            <a className="story-item is-online" href="/perfil-trans" data-online="true">
              <span className="story-avatar story-avatar--two"><span className="story-online-badge"></span></span>
              <strong>Noah</strong>
              <span className="sr-only">Online</span>
            </a>
          </section>

          <div className="catalog-section-title">
            <h2>Top Privê</h2>
            <span>Perfis com maior destaque</span>
          </div>

          <section className="profile-grid profile-grid--top" aria-label="Top Privê">
            <article className="profile-card profile-card--top" data-search="luna trans sao paulo moema premium online verificada proxima sp feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos viagens virtual experiencias personalizadas pix dinheiro cartao" data-tags="trans moema premium online verificada proxima sp feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos viagens virtual experiencias personalizadas pix dinheiro cartao" data-featured="99" data-new="90" data-views="13600">
              <a className="profile-card__media profile-card__media--one" href="/perfil-trans" aria-label="Ver perfil de Luna">
                <span className="tag tag--premium">Top Privê</span>
              </a>

              <div className="profile-card__body">
                <h2>Luna</h2>
                <p>26 anos · Moema · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil-trans">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--top" data-search="valentina trans rio de janeiro copacabana premium online verificada rj feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos viagens virtual experiencias personalizadas pix dinheiro cartao" data-tags="trans copacabana premium online verificada rj feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos viagens virtual experiencias personalizadas pix dinheiro cartao" data-featured="97" data-new="87" data-views="12100">
              <a className="profile-card__media profile-card__media--two" href="/perfil-trans" aria-label="Ver perfil de Valentina">
                <span className="tag tag--premium">Top Privê</span>
              </a>

              <div className="profile-card__body">
                <h2>Valentina</h2>
                <p>29 anos · Copacabana · Rio de Janeiro</p>
                <div className="card-actions">
                  <a href="/perfil-trans">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
          </section>

          <div className="catalog-section-title catalog-section-title--spaced">
            <h2>Premium</h2>
            <span>Fotos em destaque compacto</span>
          </div>

          <section className="profile-grid profile-grid--premium" aria-label="Premium">
            <article className="profile-card profile-card--premium" data-search="mirella trans curitiba batel viagens premium verificada pr feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos virtual experiencias personalizadas pix dinheiro cartao" data-tags="trans batel viagens premium verificada pr feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos virtual experiencias personalizadas pix dinheiro cartao" data-featured="91" data-new="94" data-views="9900">
              <a className="profile-card__media profile-card__media--three" href="/perfil-trans" aria-label="Ver perfil de Mirella">
                <span className="tag tag--premium">Premium</span>
              </a>

              <div className="profile-card__body">
                <h2>Mirella</h2>
                <p>31 anos · Batel · Curitiba</p>
                <div className="card-actions">
                  <a href="/perfil-trans">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--premium" data-search="ayla trans salvador barra eventos premium proxima ba feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante viagens virtual experiencias personalizadas pix dinheiro cartao" data-tags="trans barra eventos premium proxima ba feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante viagens virtual experiencias personalizadas pix dinheiro cartao" data-featured="89" data-new="89" data-views="8300">
              <a className="profile-card__media profile-card__media--four" href="/perfil-trans" aria-label="Ver perfil de Ayla">
                <span className="tag tag--premium">Premium</span>
              </a>

              <div className="profile-card__body">
                <h2>Ayla</h2>
                <p>27 anos · Barra · Salvador</p>
                <div className="card-actions">
                  <a href="/perfil-trans">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--premium" data-search="noah nao-binaria sao paulo jardins virtual premium online sp trans feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos viagens experiencias personalizadas pix dinheiro cartao" data-tags="nao-binaria jardins virtual premium online sp trans feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos viagens experiencias personalizadas pix dinheiro cartao" data-featured="86" data-new="91" data-views="7600">
              <a className="profile-card__media profile-card__media--two" href="/perfil-trans" aria-label="Ver perfil de Noah">
                <span className="tag tag--premium">Premium</span>
              </a>

              <div className="profile-card__body">
                <h2>Noah</h2>
                <p>25 anos · Jardins · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil-trans">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
          </section>

          <section className="profile-grid profile-grid--basic" aria-label="Básico">
            <article className="profile-card profile-card--basic" data-search="bianca trans sao paulo moema acompanhante basico online sp feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol eventos viagens virtual experiencias personalizadas pix dinheiro cartao" data-tags="trans moema acompanhante basico online sp feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol eventos viagens virtual experiencias personalizadas pix dinheiro cartao" data-featured="83" data-new="76" data-views="7200">
              <a className="profile-card__media profile-card__media--one" href="/perfil-trans" aria-label="Ver perfil de Bianca">
                <span className="sr-only">Ver perfil de Bianca</span>
              </a>

              <div className="profile-card__body">
                <h2>Bianca</h2>
                <p>30 anos · Moema · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil-trans">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--basic" data-search="sabrina trans rio de janeiro copacabana viagens basico verificada rj feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos virtual experiencias personalizadas pix dinheiro cartao" data-tags="trans copacabana viagens basico verificada rj feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante eventos virtual experiencias personalizadas pix dinheiro cartao" data-featured="80" data-new="83" data-views="6700">
              <a className="profile-card__media profile-card__media--three" href="/perfil-trans" aria-label="Ver perfil de Sabrina">
                <span className="sr-only">Ver perfil de Sabrina</span>
              </a>

              <div className="profile-card__body">
                <h2>Sabrina</h2>
                <p>28 anos · Copacabana · Rio de Janeiro</p>
                <div className="card-actions">
                  <a href="/perfil-trans">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--basic" data-search="kiara trans curitiba batel eventos basico proxima pr feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante viagens virtual experiencias personalizadas pix dinheiro cartao" data-tags="trans batel eventos basico proxima pr feminino disponivel sob consulta viagem curvilineo silicone piercings nao fumante portugues espanhol acompanhante viagens virtual experiencias personalizadas pix dinheiro cartao" data-featured="78" data-new="72" data-views="6100">
              <a className="profile-card__media profile-card__media--four" href="/perfil-trans" aria-label="Ver perfil de Kiara">
                <span className="sr-only">Ver perfil de Kiara</span>
              </a>

              <div className="profile-card__body">
                <h2>Kiara</h2>
                <p>33 anos · Batel · Curitiba</p>
                <div className="card-actions">
                  <a href="/perfil-trans">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
          </section>
          <div className="empty-state" id="empty-state" hidden>
            <h2>Nenhum perfil encontrado</h2>
            <p>Ajuste os filtros ou faça uma nova busca para encontrar perfis disponíveis.</p>
            <button className="button button--ghost js-clear-filters" type="button">Limpar filtros</button>
          </div>
        </div>
      </section>
    </main>

    <nav className="bottom-nav" aria-label="Navegação mobile">
        <a href="/favoritos">Favoritos</a>
              <a href="/planos">Planos</a>
      <a href="/login">Conta</a>
    </nav>

    
  
    </>
  );
}