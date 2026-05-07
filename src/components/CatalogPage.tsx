"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";

type CatalogProfile = {
  id: string;
  type: string | null;
  name: string | null;
  location: string | null;
  description: string | null;
  active_plan: string | null;
  is_online: boolean | null;
  profile_verified: boolean | null;
};

type CatalogPageProps = {
  title: string;
  type: string;
  activeHref: string;
  intro: string;
};

export function CatalogPage({ title, type, activeHref, intro }: CatalogPageProps) {
  const [profiles, setProfiles] = useState<CatalogProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,type,name,location,description,active_plan,is_online,profile_verified")
        .eq("type", type)
        .eq("profile_approval_status", "approved")
        .order("updated_at", { ascending: false });

      setProfiles(data || []);
      setLoading(false);
    };

    loadProfiles();
  }, [type]);

  const visibleProfiles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return profiles;
    }

    return profiles.filter((profile) => {
      return [profile.name, profile.location, profile.description, profile.active_plan]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [profiles, search]);

  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/" aria-label="Delírio Privê">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link href="/favoritos">Favoritos</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/parcerias-promocoes">Parcerias</Link>
          <Link className="login-link" href="/login">Entrar</Link>
        </nav>
      </header>

      <main className="app-page explore">
        <div className="page-title">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h1>{title}</h1>
            <p className="page-intro">{intro}</p>
          </div>
          <nav className="category-switcher" aria-label="Trocar categoria">
            <Link className={activeHref === "/mulheres" ? "is-active" : ""} href="/mulheres">Mulheres</Link>
            <Link className={activeHref === "/homens" ? "is-active" : ""} href="/homens">Homens</Link>
            <Link className={activeHref === "/travestis" ? "is-active" : ""} href="/travestis">Trans</Link>
          </nav>
        </div>

        <section className="catalog-shell catalog-shell--single">
          <div className="catalog-main">
            <section className="catalog-controls" aria-label="Controles do catálogo">
              <div className="catalog-controls__bar">
                <label className="search-pill">
                  <span>Buscar perfil</span>
                  <input
                    type="search"
                    placeholder="Nome, localização ou descrição"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <div className="filter-summary" aria-live="polite">
                  <span>{visibleProfiles.length} perfil(is)</span>
                </div>
              </div>
            </section>

            {loading ? (
              <section className="empty-state">
                <p>Carregando perfis cadastrados...</p>
              </section>
            ) : visibleProfiles.length === 0 ? (
              <section className="empty-state">
                <h2>Nenhum perfil cadastrado</h2>
                <p>Os perfis aparecerão aqui quando forem cadastrados e publicados pela administração.</p>
              </section>
            ) : (
              <section className="profile-grid" aria-label={`Perfis de ${title}`}>
                {visibleProfiles.map((profile) => {
                  const plan = getPlanConfig(profile.active_plan || "Basico");

                  return (
                    <article className="profile-card" key={profile.id}>
                      <div className="profile-card__body">
                        <span className="tag tag--premium">{plan.displayName}</span>
                        <h2>{profile.name || "Perfil sem nome"}</h2>
                        <p>{profile.location || "Localização não informada"}</p>
                        {profile.description && <p>{profile.description}</p>}
                        <div className="trust-row">
                          {profile.is_online && <span>Online</span>}
                          {profile.profile_verified && <span>Verificado</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </div>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Navegação mobile">
        <Link href="/favoritos">Favoritos</Link>
        <Link href="/planos">Planos</Link>
        <Link href="/parcerias-promocoes">Parcerias</Link>
        <Link href="/login">Conta</Link>
      </nav>
    </>
  );
}
