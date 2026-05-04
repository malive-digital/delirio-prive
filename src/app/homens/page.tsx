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
          <h1>Homens</h1>
          <p className="page-intro">Perfis masculinos selecionados para uma navegação discreta e sofisticada.</p>
        </div>
        <nav className="category-switcher" aria-label="Trocar categoria">
          <a href="/mulheres">Mulheres</a>
          <a className="is-active" href="/homens">Homens</a>
          <a href="/travestis">Trans</a>
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
              <div className="filter-bar" role="group" aria-label="Filtros baseados no perfil masculino">
                <label className="filter-field">
                  <span>Estado</span>
                  <select aria-label="Estado">
                                        <option>Estado</option>
                    <option>SP</option>
                    <option>RJ</option>
                    <option>MG</option>
                    <option>PR</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Cidade</span>
                  <select aria-label="Cidade">
                                        <option>Cidade</option>
                    <option>São Paulo</option>
                    <option>Rio de Janeiro</option>
                    <option>Belo Horizonte</option>
                    <option>Curitiba</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Bairro</span>
                  <select aria-label="Bairro">
                                        <option>Bairro</option>
                    <option>Itaim Bibi</option>
                    <option>Ipanema</option>
                    <option>Savassi</option>
                    <option>Batel</option>
                    <option>Moema</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Viagem</span>
                  <select aria-label="Disponibilidade para viagem">
                                        <option>Viagem</option>
                    <option>Disponível</option>
                    <option>Viagem</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Perfil</span>
                  <select aria-label="Características do perfil">
                                        <option>Perfil</option>
                    <option>Masculino</option>
                    <option>Atlético</option>
                    <option>Barba curta</option>
                    <option>Não fumante</option>
                    <option>Português Inglês</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Serviço</span>
                  <select aria-label="Serviço">
                                        <option>Serviço</option>
                    <option>Acompanhante</option>
                    <option>Eventos</option>
                    <option>Viagens</option>
                    <option>Massagem</option>
                    <option>Companhia</option>
                    <option>Virtual</option>
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
                <button className="quick-chip" type="button" data-filter="eventos">Eventos</button>
                <button className="quick-chip" type="button" data-filter="viagens">Viagens</button>
                <button className="quick-chip" type="button" data-filter="massagem">Massagem</button>
                <button className="quick-chip" type="button" data-filter="atletico">Atlético</button>
                <span className="result-count"><strong id="result-count">8</strong> perfis</span>
              </div>
            </div>
          </section>

          <section className="stories-row" aria-label="Stories">
            <a className="story-item is-online" href="/perfil-masculino" data-online="true">
              <span className="story-avatar story-avatar--one"><span className="story-online-badge"></span></span>
              <strong>Rafael</strong>
              <span className="sr-only">Online</span>
            </a>
            <a className="story-item is-online" href="/perfil-masculino" data-online="true">
              <span className="story-avatar story-avatar--two"><span className="story-online-badge"></span></span>
              <strong>Bruno</strong>
              <span className="sr-only">Online</span>
            </a>
            <a className="story-item" href="/perfil-masculino" data-online="false">
              <span className="story-avatar story-avatar--three"><span className="story-online-badge"></span></span>
              <strong>Thiago</strong>
            </a>
            <a className="story-item" href="/perfil-masculino" data-online="false">
              <span className="story-avatar story-avatar--four"><span className="story-online-badge"></span></span>
              <strong>Henrique</strong>
            </a>
            <a className="story-item is-online" href="/perfil-masculino" data-online="true">
              <span className="story-avatar story-avatar--two"><span className="story-online-badge"></span></span>
              <strong>Caio</strong>
              <span className="sr-only">Online</span>
            </a>
          </section>

          <div className="catalog-section-title">
            <h2>Top Privê</h2>
            <span>Perfis com maior destaque</span>
          </div>

          <section className="profile-grid profile-grid--top" aria-label="Top Privê">
            <article className="profile-card profile-card--top" data-search="rafael sao paulo itaim bibi eventos premium online verificada proximo sp masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante viagens massagem companhia virtual pix dinheiro cartao" data-tags="itaim bibi eventos premium online verificada proximo sp masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante viagens massagem companhia virtual pix dinheiro cartao" data-featured="98" data-new="88" data-views="14200">
              <a className="profile-card__media profile-card__media--one" href="/perfil-masculino" aria-label="Ver perfil de Rafael">
                <span className="tag tag--premium">Top Privê</span>
              </a>

              <div className="profile-card__body">
                <h2>Rafael</h2>
                <p>32 anos · Itaim Bibi · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil-masculino">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--top" data-search="bruno rio de janeiro ipanema viagens premium online verificada rj masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos massagem companhia virtual pix dinheiro cartao" data-tags="ipanema viagens premium online verificada rj masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos massagem companhia virtual pix dinheiro cartao" data-featured="96" data-new="84" data-views="11800">
              <a className="profile-card__media profile-card__media--two" href="/perfil-masculino" aria-label="Ver perfil de Bruno">
                <span className="tag tag--premium">Top Privê</span>
              </a>

              <div className="profile-card__body">
                <h2>Bruno</h2>
                <p>29 anos · Ipanema · Rio de Janeiro</p>
                <div className="card-actions">
                  <a href="/perfil-masculino">Ver perfil</a>
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
            <article className="profile-card profile-card--premium" data-search="thiago belo horizonte savassi massagem premium verificada mg masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos viagens companhia virtual pix dinheiro cartao" data-tags="savassi massagem premium verificada mg masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos viagens companhia virtual pix dinheiro cartao" data-featured="90" data-new="92" data-views="9200">
              <a className="profile-card__media profile-card__media--three" href="/perfil-masculino" aria-label="Ver perfil de Thiago">
                <span className="tag tag--premium">Premium</span>
              </a>

              <div className="profile-card__body">
                <h2>Thiago</h2>
                <p>34 anos · Savassi · Belo Horizonte</p>
                <div className="card-actions">
                  <a href="/perfil-masculino">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--premium" data-search="henrique curitiba batel companhia viagens premium proximo pr masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos massagem virtual pix dinheiro cartao" data-tags="batel companhia viagens premium proximo pr masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos massagem virtual pix dinheiro cartao" data-featured="87" data-new="86" data-views="8700">
              <a className="profile-card__media profile-card__media--four" href="/perfil-masculino" aria-label="Ver perfil de Henrique">
                <span className="tag tag--premium">Premium</span>
              </a>

              <div className="profile-card__body">
                <h2>Henrique</h2>
                <p>31 anos · Batel · Curitiba</p>
                <div className="card-actions">
                  <a href="/perfil-masculino">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--premium" data-search="caio sao paulo moema eventos virtual premium online sp masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante viagens massagem companhia pix dinheiro cartao" data-tags="moema eventos virtual premium online sp masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante viagens massagem companhia pix dinheiro cartao" data-featured="85" data-new="90" data-views="7800">
              <a className="profile-card__media profile-card__media--two" href="/perfil-masculino" aria-label="Ver perfil de Caio">
                <span className="tag tag--premium">Premium</span>
              </a>

              <div className="profile-card__body">
                <h2>Caio</h2>
                <p>27 anos · Moema · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil-masculino">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
          </section>

          <section className="profile-grid profile-grid--basic" aria-label="Básico">
            <article className="profile-card profile-card--basic" data-search="lucas sao paulo itaim bibi companhia basico online sp masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos viagens massagem virtual pix dinheiro cartao" data-tags="itaim bibi companhia basico online sp masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos viagens massagem virtual pix dinheiro cartao" data-featured="81" data-new="74" data-views="6900">
              <a className="profile-card__media profile-card__media--one" href="/perfil-masculino" aria-label="Ver perfil de Lucas">
                <span className="sr-only">Ver perfil de Lucas</span>
              </a>

              <div className="profile-card__body">
                <h2>Lucas</h2>
                <p>30 anos · Itaim Bibi · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil-masculino">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--basic" data-search="matheus rio de janeiro ipanema viagens basico verificada rj masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos massagem companhia virtual pix dinheiro cartao" data-tags="ipanema viagens basico verificada rj masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos massagem companhia virtual pix dinheiro cartao" data-featured="79" data-new="80" data-views="6400">
              <a className="profile-card__media profile-card__media--three" href="/perfil-masculino" aria-label="Ver perfil de Matheus">
                <span className="sr-only">Ver perfil de Matheus</span>
              </a>

              <div className="profile-card__body">
                <h2>Matheus</h2>
                <p>28 anos · Ipanema · Rio de Janeiro</p>
                <div className="card-actions">
                  <a href="/perfil-masculino">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--basic" data-search="daniel belo horizonte savassi massagem basico proximo mg masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos viagens companhia virtual pix dinheiro cartao" data-tags="savassi massagem basico proximo mg masculino disponivel viagem atletico barba curta nao fumante portugues ingles acompanhante eventos viagens companhia virtual pix dinheiro cartao" data-featured="77" data-new="71" data-views="5800">
              <a className="profile-card__media profile-card__media--four" href="/perfil-masculino" aria-label="Ver perfil de Daniel">
                <span className="sr-only">Ver perfil de Daniel</span>
              </a>

              <div className="profile-card__body">
                <h2>Daniel</h2>
                <p>35 anos · Savassi · Belo Horizonte</p>
                <div className="card-actions">
                  <a href="/perfil-masculino">Ver perfil</a>
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