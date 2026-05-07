import Link from "next/link";
import { AuthNavLink } from "@/components/AuthNavLink";

export default function FavoritosPage() {
  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link className="is-active" href="/favoritos">Favoritos</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/parcerias-promocoes">Parcerias</Link>
          <AuthNavLink />
        </nav>
      </header>

      <main className="app-page">
        <div className="page-title">
          <div>
            <p className="eyebrow">Favoritos</p>
            <h1>Seus favoritos</h1>
          </div>
          <Link className="button button--ghost" href="/">Explorar</Link>
        </div>
        <section className="empty-state">
          <h2>Nenhum favorito salvo</h2>
          <p>Os perfis favoritados aparecerão aqui quando houver dados reais vinculados à sua conta.</p>
        </section>
      </main>

    </>
  );
}
