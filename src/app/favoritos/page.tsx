export default function Page() {
  return (
    <>
<header className="app-header">
      <a className="brand" href="/index"><span className="brand__mark">DP</span><span>Delírio Privê</span></a>
      <nav className="app-nav" aria-label="Navegação">
        <a href="/index">Início</a><a className="is-active" href="/favoritos">Favoritos</a><a href="/planos">Planos</a><a className="login-link" href="/login">Entrar</a>
      </nav>
    </header>
    <main className="app-page favorites">
      <div className="page-title"><div><p className="eyebrow">Retenção</p><h1>Favoritos</h1></div><a className="button button--ghost" href="/index">Explorar mais</a></div>
      <section className="profile-grid profile-grid--compact">
        <article className="profile-card"><a className="profile-card__media profile-card__media--two" href="/perfil"><span className="tag tag--favorite">Favorito</span></a><div className="profile-card__body"><h2>Isadora</h2><p>Acesso rápido · Remover favorito</p></div></article>
        <article className="profile-card"><a className="profile-card__media profile-card__media--four" href="/perfil"><span className="tag tag--favorite">Favorito</span></a><div className="profile-card__body"><h2>Laura</h2><p>Acesso rápido · Remover favorito</p></div></article>
      </section>
    </main>
    <nav className="bottom-nav" aria-label="Navegação mobile">
      <a href="/index">Explorar</a>
      <a className="is-active" href="/favoritos">Favoritos</a>
      <a href="/planos">Planos</a>
      <a href="/login">Conta</a>
    </nav>
  
    </>
  );
}