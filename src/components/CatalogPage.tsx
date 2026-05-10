"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";
import { AuthNavLink } from "@/components/AuthNavLink";

type CatalogProfile = {
  id: string;
  type: string | null;
  name: string | null;
  location: string | null;
  state_uf: string | null;
  description: string | null;
  active_plan: string | null;
  serves: string | null;
  has_place: string | null;
  payment_methods: string | null;
  is_online: boolean | null;
  profile_verified: boolean | null;
  media_url?: string;
};

type ProfileMediaRow = {
  profile_id: string;
  public_url: string | null;
  storage_path: string | null;
  is_cover: boolean | null;
};

type CatalogPageProps = {
  title: string;
  type: string;
  activeHref: string;
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

const SERVES_FILTERS = ["Homens", "Mulheres", "Casais", "Trans"];
const PLACE_FILTERS = [
  { value: "com_local", label: "Com local" },
  { value: "sem_local", label: "Sem local" },
  { value: "hotel_motel", label: "Hotel ou motel" },
  { value: "a_combinar", label: "A combinar" },
];
const PAYMENT_FILTERS = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito"];
const PLAN_ORDER = {
  "Top Prive": 0,
  Premium: 1,
  Basico: 2,
};
const CATALOG_PLAN_SECTIONS = [
  { key: "Top Prive", title: "Top Privê", gridClass: "profile-grid--catalog-top" },
  { key: "Premium", title: "Premium", gridClass: "profile-grid--catalog-premium" },
  { key: "Basico", title: "Básico", gridClass: "profile-grid--catalog-basic" },
] as const;

const detectUfFromCoords = (latitude: number, longitude: number) => {
  return UF_BOXES.find((box) => latitude >= box.minLat && latitude <= box.maxLat && longitude >= box.minLng && longitude <= box.maxLng)?.uf || "";
};

export function CatalogPage({ title, type, activeHref }: CatalogPageProps) {
  const [profiles, setProfiles] = useState<CatalogProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUf, setSelectedUf] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedServes, setSelectedServes] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [regionMessage, setRegionMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const loadProfiles = async () => {
      let { data, error } = await supabase
        .from("profiles")
        .select("id,type,name,location,state_uf,description,active_plan,serves,has_place,payment_methods,is_online,profile_verified")
        .eq("type", type)
        .eq("profile_approval_status", "approved")
        .order("updated_at", { ascending: false });

      if (error) {
        const fallback = await supabase
          .from("profiles")
          .select("id,type,name,location,description,active_plan,serves,has_place,payment_methods,is_online,profile_verified")
          .eq("type", type)
          .eq("profile_approval_status", "approved")
          .order("updated_at", { ascending: false });

        data = (fallback.data || []).map((profile) => ({ ...profile, state_uf: null }));
        error = fallback.error;
      }

      const approvedProfiles = (data || []).filter((profile) => {
          const name = profile.name?.trim().toLowerCase();
          const genericNames = new Set(["modelo", "nova modelo", "perfil sem nome"]);

          return Boolean(name) && !genericNames.has(name || "");
        });

      const profileIds = approvedProfiles.map((profile) => profile.id);
      let mediaByProfile = new Map<string, string>();

      if (profileIds.length) {
        const { data: mediaData } = await supabase
          .from("profile_media")
          .select("profile_id,public_url,storage_path,is_cover")
          .in("profile_id", profileIds)
          .eq("approval_status", "approved")
          .eq("media_type", "photo")
          .order("is_cover", { ascending: false })
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });

        mediaByProfile = (mediaData || []).reduce((map, media) => {
          const item = media as ProfileMediaRow;
          if (!map.has(item.profile_id)) {
            const url = item.public_url || (item.storage_path ? supabase.storage.from("profile-media").getPublicUrl(item.storage_path).data.publicUrl : "");
            if (url) {
              map.set(item.profile_id, url);
            }
          }

          return map;
        }, new Map<string, string>());
      }

      setProfiles(approvedProfiles.map((profile) => ({ ...profile, media_url: mediaByProfile.get(profile.id) || "" })));
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

  const availableUfs = useMemo(() => {
    const ufs = new Set(profiles.map((profile) => profile.state_uf).filter((uf): uf is string => BRAZIL_UFS.includes(uf || "")));
    return BRAZIL_UFS.filter((uf) => ufs.has(uf));
  }, [profiles]);

  useEffect(() => {
    if (selectedUf && !availableUfs.includes(selectedUf)) {
      handleUfChange("");
    }
  }, [availableUfs, selectedUf]);

  const visibleProfiles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return profiles
      .filter((profile) => {
        const matchesUf = !selectedUf || profile.state_uf === selectedUf;
        const matchesStatus = !selectedStatus || (selectedStatus === "online" ? profile.is_online : profile.profile_verified);
        const matchesServes = !selectedServes || (profile.serves || "").toLowerCase().includes(selectedServes.toLowerCase());
        const matchesPlace = !selectedPlace || profile.has_place === selectedPlace;
        const matchesPayment = !selectedPayment || (profile.payment_methods || "").toLowerCase().includes(selectedPayment.toLowerCase());
        const matchesSearch = !normalizedSearch || [profile.name, profile.location, profile.state_uf, profile.description, profile.active_plan]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

        return matchesUf && matchesStatus && matchesServes && matchesPlace && matchesPayment && matchesSearch;
      })
      .sort((a, b) => {
        const planA = getPlanConfig(a.active_plan || "Basico").key;
        const planB = getPlanConfig(b.active_plan || "Basico").key;
        return PLAN_ORDER[planA] - PLAN_ORDER[planB];
      });
  }, [profiles, search, selectedUf, selectedStatus, selectedServes, selectedPlace, selectedPayment]);

  const handleUfChange = (uf: string) => {
    setSelectedUf(uf);
    if (uf) {
      localStorage.setItem("delirioPreferredUf", uf);
      return;
    }

    localStorage.removeItem("delirioPreferredUf");
  };

  const activeFilterCount = [selectedUf, selectedStatus, selectedServes, selectedPlace, selectedPayment].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedStatus("");
    setSelectedServes("");
    setSelectedPlace("");
    setSelectedPayment("");
    handleUfChange("");
    setRegionMessage("");
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

  const renderProfileCard = (profile: CatalogProfile) => {
    const plan = getPlanConfig(profile.active_plan || "Basico");
    const planSizeClass =
      plan.key === "Top Prive"
        ? "profile-card--catalog-top"
        : plan.key === "Premium"
          ? "profile-card--catalog-premium"
          : "profile-card--catalog-basic";

    return (
      <Link className={`profile-card profile-card--link ${planSizeClass}`} href={`/perfil?id=${profile.id}`} key={profile.id}>
        <div
          className="profile-card__media profile-card__media--one"
          style={profile.media_url ? { backgroundImage: `linear-gradient(180deg, transparent, rgba(10, 10, 10, 0.82)), url("${profile.media_url}")` } : undefined}
        />
        <div className="profile-card__body">
          <span className="tag tag--premium">{plan.displayName}</span>
          <h2>{profile.name || "Perfil sem nome"}</h2>
          <p className="profile-card__location">{[profile.location, profile.state_uf].filter(Boolean).join(" - ") || "Localizacao nao informada"}</p>
          {profile.description && <p className="profile-card__description">{profile.description}</p>}
          <div className="trust-row">
            {profile.is_online && <span className="trust-pill trust-pill--online">Online</span>}
            {profile.profile_verified && <span className="trust-pill trust-pill--verified">Verificado</span>}
          </div>
        </div>
      </Link>
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
          <Link href="/planos">Planos</Link>
          <Link href="/parcerias-promocoes">Parcerias</Link>
          <AuthNavLink />
        </nav>
      </header>

      <main className="app-page explore">
        <div className="page-title">
          <div>
            <p className="eyebrow">Catalogo</p>
            <h1>{title}</h1>
          </div>
          <nav className="category-switcher" aria-label="Trocar categoria">
            <Link className={activeHref === "/mulheres" ? "is-active" : ""} href="/mulheres">Mulheres</Link>
            <Link className={activeHref === "/homens" ? "is-active" : ""} href="/homens">Homens</Link>
            <Link className={activeHref === "/travestis" ? "is-active" : ""} href="/travestis">Trans</Link>
          </nav>
        </div>

        <section className="catalog-shell catalog-shell--single">
          <div className="catalog-main">
            <section className={`catalog-controls ${filtersOpen ? "" : "is-collapsed"}`} aria-label="Controles do catalogo">
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
                  <span>{visibleProfiles.length} perfil(is){activeFilterCount ? ` | ${activeFilterCount} filtro(s)` : ""}</span>
                </div>
                <button className="filter-toggle" type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((current) => !current)}>
                  Filtros
                  <span className="filter-toggle__icon" aria-hidden="true" />
                </button>
                {activeFilterCount > 0 && (
                  <button className="button button--ghost clear-filter-button" type="button" onClick={clearFilters}>
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className="filter-panel">
                <div className="catalog-region-bar">
                  <label>
                    <span>Estado</span>
                    <select value={selectedUf} onChange={(event) => handleUfChange(event.target.value)}>
                      <option value="">Todos</option>
                      {availableUfs.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Status</span>
                    <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                      <option value="">Todos</option>
                      <option value="online">Online</option>
                      <option value="verified">Verificado</option>
                    </select>
                  </label>
                  <label>
                    <span>Atendimento</span>
                    <select value={selectedServes} onChange={(event) => setSelectedServes(event.target.value)}>
                      <option value="">Todos</option>
                      {SERVES_FILTERS.map((serves) => (
                        <option key={serves} value={serves}>{serves}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Local</span>
                    <select value={selectedPlace} onChange={(event) => setSelectedPlace(event.target.value)}>
                      <option value="">Todos</option>
                      {PLACE_FILTERS.map((place) => (
                        <option key={place.value} value={place.value}>{place.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Pagamento</span>
                    <select value={selectedPayment} onChange={(event) => setSelectedPayment(event.target.value)}>
                      <option value="">Todos</option>
                      {PAYMENT_FILTERS.map((payment) => (
                        <option key={payment} value={payment}>{payment}</option>
                      ))}
                    </select>
                  </label>
                  <button className="button button--ghost" type="button" onClick={detectRegion}>
                    Detectar minha regiao
                  </button>
                  {regionMessage && <p aria-live="polite">{regionMessage}</p>}
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
                <p>Os perfis aparecerao aqui quando forem cadastrados e publicados pela administracao.</p>
              </section>
            ) : (
              <div className="catalog-plan-stack" aria-label={`Perfis de ${title}`}>
                {CATALOG_PLAN_SECTIONS.map((section) => {
                  const sectionProfiles = visibleProfiles.filter((profile) => getPlanConfig(profile.active_plan || "Basico").key === section.key);
                  if (!sectionProfiles.length) return null;

                  return (
                    <section className="catalog-plan-section" key={section.key} aria-labelledby={`catalog-plan-${section.key}`}>
                      <div className="catalog-plan-section__header">
                        <div>
                          <h2 id={`catalog-plan-${section.key}`}>{section.title}</h2>
                        </div>
                        <span>{sectionProfiles.length} perfil(is)</span>
                      </div>
                      <div className={`profile-grid ${section.gridClass}`}>
                        {sectionProfiles.map(renderProfileCard)}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

    </>
  );
}
