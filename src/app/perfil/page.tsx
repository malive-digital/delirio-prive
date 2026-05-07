"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";

type PublicProfile = {
  id: string;
  type: string | null;
  name: string | null;
  whatsapp: string | null;
  location: string | null;
  state_uf: string | null;
  headline: string | null;
  age: string | null;
  neighborhood: string | null;
  price_15: string | null;
  price_30: string | null;
  price_60: string | null;
  overnight_price: string | null;
  serves: string | null;
  has_place: string | null;
  availability: string | null;
  payment_methods: string | null;
  services: string | null;
  specialties: string | null;
  restrictions: string | null;
  appearance: string | null;
  languages: string | null;
  description: string | null;
  active_plan: string | null;
  is_online: boolean | null;
  profile_verified: boolean | null;
};

type ProfileMedia = {
  id: string;
  public_url: string | null;
  storage_path: string | null;
  file_name: string | null;
  is_cover: boolean | null;
};

const catalogHrefByType: Record<string, string> = {
  mulher: "/mulheres",
  homem: "/homens",
  trans: "/travestis",
};

const formatList = (value: string | null) => value?.split(",").map((item) => item.trim()).filter(Boolean) || [];

export default function PerfilPage() {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [mediaItems, setMediaItems] = useState<ProfileMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const profileId = new URLSearchParams(window.location.search).get("id");

      if (!profileId) {
        setMessage("Perfil nao informado.");
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id,type,name,whatsapp,location,state_uf,headline,age,neighborhood,price_15,price_30,price_60,overnight_price,serves,has_place,availability,payment_methods,services,specialties,restrictions,appearance,languages,description,active_plan,is_online,profile_verified")
        .eq("id", profileId)
        .eq("profile_approval_status", "approved")
        .maybeSingle();

      if (profileError || !profileData) {
        setMessage("Perfil indisponivel ou aguardando aceite.");
        setLoading(false);
        return;
      }

      const { data: mediaData } = await supabase
        .from("profile_media")
        .select("id,public_url,storage_path,file_name,is_cover")
        .eq("profile_id", profileId)
        .eq("approval_status", "approved")
        .eq("media_type", "photo")
        .order("is_cover", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      setProfile(profileData as PublicProfile);
      setMediaItems((mediaData || []) as ProfileMedia[]);
      setLoading(false);
    };

    loadProfile();
  }, []);

  const plan = getPlanConfig(profile?.active_plan || "Basico");
  const photos = useMemo(
    () => mediaItems
      .map((item) => item.public_url || (item.storage_path ? supabase.storage.from("profile-media").getPublicUrl(item.storage_path).data.publicUrl : ""))
      .filter(Boolean),
    [mediaItems],
  );
  const backHref = catalogHrefByType[profile?.type || ""] || "/mulheres";

  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delirio Prive</span>
        </Link>
        <nav className="app-nav" aria-label="Navegacao">
          <Link href="/">Inicio</Link>
          <Link href="/mulheres">Mulheres</Link>
          <Link href="/homens">Homens</Link>
          <Link href="/travestis">Trans</Link>
          <Link className="login-link" href="/login">Entrar</Link>
        </nav>
      </header>

      <main className="app-page profile-layout profile-layout--complete">
        {loading ? (
          <section className="empty-state">
            <p>Carregando perfil...</p>
          </section>
        ) : !profile ? (
          <section className="empty-state">
            <h1>Perfil indisponivel</h1>
            <p>{message}</p>
            <Link className="button button--primary" href="/mulheres">Voltar ao catalogo</Link>
          </section>
        ) : (
          <>
            <section className="profile-media-column">
              <div className="profile-card-shell media-gallery">
                <div className="gallery-stage">
                  {profile.profile_verified && <span className="approval-badge">Verificado</span>}
                  <div className="gallery-zoom">
                    {photos[0] ? (
                      <img src={photos[0]} alt={profile.name || "Foto do perfil"} />
                    ) : (
                      <div className="profile-photo-placeholder">Sem foto aprovada</div>
                    )}
                  </div>
                  <span className="media-counter">{photos.length} foto(s)</span>
                </div>
                {photos.length > 1 && (
                  <div className="gallery-preview-grid" aria-label="Fotos aprovadas">
                    {photos.map((photo, index) => (
                      <div className="gallery-thumb" key={photo}>
                        <img src={photo} alt={`${profile.name || "Perfil"} - foto ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="profile-info-column">
              <div className="profile-card-shell profile-summary">
                <span className="tag tag--premium profile-plan-tag">{plan.displayName}</span>
                <h1>{profile.name || "Perfil sem nome"}</h1>
                {profile.headline && <p className="profile-lead">{profile.headline}</p>}
                <dl className="primary-info-grid">
                  <div>
                    <dt>Localizacao</dt>
                    <dd>{[profile.neighborhood, profile.location, profile.state_uf].filter(Boolean).join(" - ") || "Nao informada"}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{profile.is_online ? "Online" : "Offline"}</dd>
                  </div>
                  <div>
                    <dt>Atende</dt>
                    <dd>{profile.serves || "Nao informado"}</dd>
                  </div>
                  <div>
                    <dt>Local</dt>
                    <dd>{profile.has_place || "Nao informado"}</dd>
                  </div>
                </dl>
                {profile.whatsapp && (
                  <a className="button button--primary favorite-button--wide" href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    Chamar no WhatsApp
                  </a>
                )}
              </div>
            </aside>

            <section className="profile-content-grid profile-wide-section">
              <article className="profile-card-shell description-section">
                <span className="section-kicker">Descricao</span>
                <h2>Sobre o perfil</h2>
                <p>{profile.description || "Descricao ainda nao informada."}</p>
              </article>

              <article className="profile-card-shell">
                <span className="section-kicker">Valores</span>
                <h2>Atendimento</h2>
                <table className="pricing-table">
                  <tbody>
                    {profile.price_15 && <tr><td>15 min</td><td>{profile.price_15}</td></tr>}
                    {profile.price_30 && <tr><td>30 min</td><td>{profile.price_30}</td></tr>}
                    {profile.price_60 && <tr><td>1 hora</td><td>{profile.price_60}</td></tr>}
                    {profile.overnight_price && <tr><td>Pernoite</td><td>{profile.overnight_price}</td></tr>}
                  </tbody>
                </table>
              </article>

              <article className="profile-card-shell">
                <span className="section-kicker">Detalhes</span>
                <h2>Preferencias</h2>
                <div className="premium-tags">
                  {[...formatList(profile.services), ...formatList(profile.specialties), ...formatList(profile.languages)].map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>

              <article className="profile-card-shell">
                <span className="section-kicker">Disponibilidade</span>
                <h2>Combinados</h2>
                <dl className="detail-grid">
                  <div><dt>Horarios</dt><dd>{profile.availability || "Nao informado"}</dd></div>
                  <div><dt>Pagamento</dt><dd>{profile.payment_methods || "Nao informado"}</dd></div>
                  <div><dt>Restricoes</dt><dd>{profile.restrictions || "Nao informado"}</dd></div>
                </dl>
              </article>
            </section>

            <Link className="button button--ghost profile-wide-section" href={backHref}>Voltar ao catalogo</Link>
          </>
        )}
      </main>
    </>
  );
}
