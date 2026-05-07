import Link from "next/link";
import { AuthNavLink } from "@/components/AuthNavLink";

export default function PerfilMasculinoPage() {
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
          <Link href="/parcerias-promocoes">Parcerias</Link>
          <AuthNavLink />
        </nav>
      </header>

      <main className="app-page profile-detail">
        <section className="empty-state">
          <h1>Perfil indisponível</h1>
          <p>Esta página não exibe dados fictícios. O perfil detalhado será carregado quando houver um cadastro real selecionado.</p>
          <Link className="button button--primary" href="/homens">Voltar ao catálogo</Link>
        </section>
      </main>
    </>
  );
}
