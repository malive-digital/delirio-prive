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
  state_uf: string | null;
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

const BRAZIL_UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const UF_BOXES = [
  { uf: "SP", minLat: -25.4, maxLat: -19.7, minLng: -53.2, maxLng: -44.0 },
  { uf: "RJ", minLat: -23.4, maxLat: -20.7, minLng: -44.9, maxLng: -40.9 },
  { uf: "MG", minLat: -22.9, maxLat: -14.0, minLng: -51.1, maxLng: -39.8 },
  { uf: "ES", minLat: -21.4, maxLat: -17.8, minLng: -41.9, maxLng: -39.6 },
  { uf: "PR", minLat: -26.8, maxLat: -22.5, minLng: -54.8, maxLng: -48.0 },
  { uf: "SC", minLat: -29.4, maxLat: -25.8, minLng: -53.9, maxLng: -48.3 },
  { uf: "RS", minLat: -33.8, maxLat: -27.0, minLng: -57.7, maxLng: -49.7 },
  { uf: "BA", minLat: -18.4, maxLat: -8.5, minLng: -46.7, maxLng: -37.3 },
  { uf: "PE", minLat: -9.5, maxLat: -7.2, minLng: -41.4, maxLng: -34.8 },
  { uf: "CE", minLat: -7.9, maxLat: -2.7, minLng: -41.4, maxLng: -37.0 },
  { uf: "DF", minLat: -16.1, maxLat: -15.5, minLng: -48.3, maxLng: -47.3 },
  { uf: "GO", minLat: -19.5, maxLat: -12.4, minLng: -53.3, maxLng: -45.9 },
];

const detectUfFromCoords = (latitude: number, longitude: number) => {
  return UF_BOXES.find((box) => latitude >= box.minLat && latitude <= box.maxLat && longitude >= box.minLng && longitude <= box.maxLng)?.uf || "";
};

export function CatalogPage({ title, type, activeHref, intro }: CatalogPageProps) {
  const [profiles, setProfiles] = useState<CatalogProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUf, setSelectedUf] = useState("");
  const [regionMessage, setRegionMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,type,name,location,state_uf,description,active_plan,is_online,profile_verified")
        .eq("type", type)
        .eq("profile_approval_status", "approved")
        .order("updated_at", { ascending: false });

      setProfiles(
        (data || []).filter((profile) => {
          const name = profile.name?.trim().toLowerCase();
          const location = profile.location?.trim();
          const genericNames = new Set(["modelo", "nova modelo", "perfil sem nome"]);

          return Boolean(name) && !genericNames.has(name || "") && Boolean(location);
        }),
      );
      setLoading(false);
    };

    loadProfiles();
  }, [type]);

  useEffect(() => {
    const savedUf = localStorage.getItem("delirioPreferredUf");
    if (savedUf) {
      setSelectedUf(savedUf);
    }
  }, []);

  const visibleProfiles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesUf = !selectedUf || profile.state_uf === selectedUf;
      const matchesSearch = !normalizedSearch || [profile.name, profile.location, profile.state_uf, profile.description, profile.active_plan]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

      return matchesUf && matchesSearch;
    });
  }, [profiles, search, selectedUf]);

  const handleUfChange = (uf: string) => {
    setSelectedUf(uf);
    if (uf) {
      localStorage.setItem("delirioPreferredUf", uf);
      return;
    }

    localStorage.removeItem("delirioPreferredUf");
  };

  const detectRegion = () => {
    if (!navigator.geolocation) {
      setRegionMessage("Seu navegador nao permite detectar a regiao.");
      return;
    }

    setRegionMessage("Detectando sua regiao...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uf = detectUfFromCoords(position.coords.latitude, position.coords.longitude);
        if (!uf) {
          setRegionMessage("Nao conseguimos identificar a UF automaticamente. Escolha no filtro.");
          return;
        }

        handleUfChange(uf);
        setRegionMessage(`Buscando perfis em ${uf}.`);
      },
      () => setRegionMessage("Permissao negada. Voce ainda pode escolher o estado no filtro."),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/" aria-label="Delirio Prive">
          <span className="brand__mark">DP</span>
          <span>Delirio Prive</span>
        </Link>
        <nav className="app-nav" aria-label="Navegacao">
          <Link href="/">Inicio</Link>
          <Link href="/favoritos">Favoritos</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/parcerias-promocoes">Parcerias</Link>
          <Link className="login-link" href="/login">Entrar</Link>
        </nav>
      </header>

      <main className="app-page explore">
        <div className="page-title">
          <div>
            <p className="eyebrow">Catalogo</p>
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
            <section className="catalog-controls" aria-label="Controles do catalogo">
              <div className="catalog-controls__bar">
                <label className="search-pill">
                  <span>Buscar perfil</span>
                  <input
                    type="search"
                    placeholder="Nome, localizacao ou descricao"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <div className="filter-summary" aria-live="polite">
                  <span>{visibleProfiles.length} perfil(is)</span>
                </div>
              </div>

              <div className="catalog-region-bar">
                <label>
                  <span>Estado</span>
                  <select value={selectedUf} onChange={(event) => handleUfChange(event.target.value)}>
                    <option value="">Todos</option>
                    {BRAZIL_UFS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </label>
                <button className="button button--ghost" type="button" onClick={detectRegion}>
                  Detectar minha regiao
                </button>
                {regionMessage && <p aria-live="polite">{regionMessage}</p>}
              </div>
            </section>

            {loading ? (
              <section className="empty-state">
                <p>Carregando perfis cadastrados...</p>
              </section>
            ) : visibleProfiles.length === 0 ? (
              <section className="empty-state">
                <h2>Nenhum perfil cadastrado</h2>
                <p>Os perfis aparecerao aqui quando forem cadastrados e publicados pela administracao.</p>
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
                        <p>{[profile.location, profile.state_uf].filter(Boolean).join(" - ") || "Localizacao nao informada"}</p>
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

      <nav className="bottom-nav" aria-label="Navegacao mobile">
        <Link href="/favoritos">Favoritos</Link>
        <Link href="/planos">Planos</Link>
        <Link href="/parcerias-promocoes">Parcerias</Link>
        <Link href="/login">Conta</Link>
      </nav>
    </>
  );
}
