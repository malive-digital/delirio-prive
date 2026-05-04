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
          <h1>Mulheres</h1>
          <p className="page-intro">Perfis femininos selecionados com curadoria visual, discrição e alto padrão.</p>
        </div>
        <nav className="category-switcher" aria-label="Trocar categoria">
          <a className="is-active" href="/mulheres">Mulheres</a>
          <a href="/homens">Homens</a>
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
              <div className="filter-bar" role="group" aria-label="Filtros baseados no perfil feminino">
                <label className="filter-field">
                  <span>Estado</span>
                  <select aria-label="Estado">
                                        <option>Estado</option>
                    <option>SP</option>
                    <option>RJ</option>
                    <option>PR</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Cidade</span>
                  <select aria-label="Cidade">
                                        <option>Cidade</option>
                    <option>São Paulo</option>
                    <option>Rio de Janeiro</option>
                    <option>Curitiba</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Bairro</span>
                  <select aria-label="Bairro">
                                        <option>Bairro</option>
                    <option>Jardins</option>
                    <option>Leblon</option>
                    <option>Batel</option>
                    <option>Itaim Bibi</option>
                    <option>Moema</option>
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
                    <option>Silicone</option>
                    <option>Tatuagens discretas</option>
                    <option>Não fumante</option>
                    <option>Português Inglês</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Serviço</span>
                  <select aria-label="Serviço">
                                        <option>Serviço</option>
                    <option>Acompanhante</option>
                    <option>Sexo virtual</option>
                    <option>Acessórios eróticos</option>
                  </select>
                </label>
                <label className="filter-field">
                  <span>Pagamento</span>
                  <select aria-label="Pagamento">
                                        <option>Pagamento</option>
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão</option>
                    <option>Transferência</option>
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
                <button className="quick-chip" type="button" data-filter="premium">Premium</button>
                <button className="quick-chip" type="button" data-filter="verificada">Verificadas</button>
                <button className="quick-chip" type="button" data-filter="proxima">Próximas</button>
                <button className="quick-chip" type="button" data-filter="viagem">Viagem</button>
                <span className="result-count"><strong id="result-count">8</strong> perfis</span>
              </div>
            </div>
          </section>

          <section className="stories-row" aria-label="Stories">
            <a className="story-item is-online" href="/perfil" data-online="true">
              <span className="story-avatar story-avatar--one"><span className="story-online-badge"></span></span>
              <strong>Valentina</strong>
              <span className="sr-only">Online</span>
            </a>
            <a className="story-item is-online" href="/perfil" data-online="true">
              <span className="story-avatar story-avatar--two"><span className="story-online-badge"></span></span>
              <strong>Isadora</strong>
              <span className="sr-only">Online</span>
            </a>
            <a className="story-item" href="/perfil" data-online="false">
              <span className="story-avatar story-avatar--three"><span className="story-online-badge"></span></span>
              <strong>Marcela</strong>
            </a>
            <a className="story-item is-online" href="/perfil" data-online="true">
              <span className="story-avatar story-avatar--four"><span className="story-online-badge"></span></span>
              <strong>Laura</strong>
              <span className="sr-only">Online</span>
            </a>
            <a className="story-item" href="/perfil" data-online="false">
              <span className="story-avatar story-avatar--two"><span className="story-online-badge"></span></span>
              <strong>Sofia</strong>
            </a>
          </section>

          <div className="catalog-section-title">
            <h2>Top Privê</h2>
            <span>Perfis com maior destaque</span>
          </div>

          <section className="profile-grid profile-grid--top" aria-label="Top Privê">
            <article className="profile-card profile-card--top" data-search="valentina sao paulo jardins luxo premium proxima sp feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-tags="jardins luxo premium proxima sp feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-featured="95" data-new="82" data-views="12400">
              <a className="profile-card__media profile-card__media--one" href="/perfil" aria-label="Ver perfil de Camila">
                <span className="tag tag--premium">Top Privê</span>
              </a>

              <div className="profile-card__body">
                <h2>Valentina</h2>
                <p>25 anos · Jardins · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--top" data-search="isadora rio de janeiro leblon executiva destaque premium online verificada rj feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-tags="executiva premium online verificada rj feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-featured="99" data-new="76" data-views="12800">
              <a className="profile-card__media profile-card__media--two" href="/perfil">
                <span className="tag tag--premium">Top Privê</span>
              </a>

              <div className="profile-card__body">
                <h2>Isadora</h2>
                <p>27 anos · Leblon · Rio de Janeiro</p>
                <div className="card-actions">
                  <a href="/perfil">Ver perfil</a>
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
            <article className="profile-card profile-card--premium" data-search="marcela curitiba batel viagem premium verificada pr feminino disponivel sob consulta silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-tags="batel viagem premium verificada pr feminino disponivel sob consulta silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-featured="86" data-new="94" data-views="9800">
              <a className="profile-card__media profile-card__media--three" href="/perfil" aria-label="Ver perfil de Helena">
                <span className="tag tag--premium">Premium</span>
              </a>

              <div className="profile-card__body">
                <h2>Marcela</h2>
                <p>29 anos · Batel · Curitiba</p>
                <div className="card-actions">
                  <a href="/perfil">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--premium" data-search="laura sao paulo itaim luxo online premium proxima sp feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-tags="itaim luxo online premium proxima sp feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-featured="91" data-new="88" data-views="11600">
              <a className="profile-card__media profile-card__media--four" href="/perfil" aria-label="Ver perfil de Bianca">
                <span className="tag tag--premium">Premium</span>
              </a>

              <div className="profile-card__body">
                <h2>Laura</h2>
                <p>26 anos · Itaim Bibi · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--premium" data-search="sofia sao paulo moema executiva premium verificada sp feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-tags="moema executiva premium verificada proxima sp feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-featured="84" data-new="91" data-views="7600">
              <a className="profile-card__media profile-card__media--two" href="/perfil">
                <span className="tag tag--premium">Premium</span>
              </a>

              <div className="profile-card__body">
                <h2>Sofia</h2>
                <p>28 anos · Moema · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
          </section>

          <section className="profile-grid profile-grid--basic" aria-label="Básico">
            <article className="profile-card profile-card--basic" data-search="camila sao paulo jardins viagem luxo basico sp feminino disponivel sob consulta silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-tags="jardins viagem luxo basico sp feminino disponivel sob consulta silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-featured="89" data-new="73" data-views="8900">
              <a className="profile-card__media profile-card__media--one" href="/perfil">
                <span className="sr-only">Ver perfil de Camila</span>
              </a>

              <div className="profile-card__body">
                <h2>Camila</h2>
                <p>30 anos · Jardins · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--basic" data-search="helena curitiba batel luxo online basico pr feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-tags="batel luxo online basico verificada pr feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-featured="82" data-new="86" data-views="6900">
              <a className="profile-card__media profile-card__media--three" href="/perfil">
                <span className="sr-only">Ver perfil de Helena</span>
              </a>

              <div className="profile-card__body">
                <h2>Helena</h2>
                <p>26 anos · Batel · Curitiba</p>
                <div className="card-actions">
                  <a href="/perfil">Ver perfil</a>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </article>
            <article className="profile-card profile-card--basic" data-search="bianca sao paulo itaim executiva basico online sp feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-tags="itaim executiva basico online sp feminino disponivel sob consulta viagem silicone tatuagens discretas nao fumante portugues ingles acompanhante sexo virtual acessorios eroticos pix dinheiro cartao transferencia" data-featured="87" data-new="79" data-views="10300">
              <a className="profile-card__media profile-card__media--four" href="/perfil">
                <span className="sr-only">Ver perfil de Bianca</span>
              </a>

              <div className="profile-card__body">
                <h2>Bianca</h2>
                <p>31 anos · Itaim Bibi · São Paulo</p>
                <div className="card-actions">
                  <a href="/perfil">Ver perfil</a>
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