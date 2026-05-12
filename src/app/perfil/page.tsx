"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getPlanConfig } from "@/lib/plans";
import { AuthNavLink } from "@/components/AuthNavLink";

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
  media_type: "photo" | "video";
  is_cover: boolean | null;
};

const catalogHrefByType: Record<string, string> = {
  mulher: "/mulheres",
  homem: "/homens",
  trans: "/travestis",
};

const placeLabels: Record<string, string> = {
  nao_informado: "Não informado",
  com_local: "Com local",
  sem_local: "Sem local",
  hotel_motel: "Hotel ou motel",
  a_combinar: "A combinar",
};

const formatList = (value: string | null) => value?.split(",").map((item) => item.trim()).filter(Boolean) || [];

export default function PerfilPage() {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [mediaItems, setMediaItems] = useState<ProfileMedia[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const profileId = new URLSearchParams(window.location.search).get("id");

      if (!profileId) {
        setMessage("Perfil não informado.");
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
        setMessage("Perfil indisponível ou aguardando aceite.");
        setLoading(false);
        return;
      }

      const { data: mediaData } = await supabase
        .from("profile_media")
        .select("id,public_url,storage_path,file_name,media_type,is_cover")
        .eq("profile_id", profileId)
        .eq("approval_status", "approved")
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
      .filter((item) => item.media_type === "photo")
      .map((item) => item.public_url || (item.storage_path ? supabase.storage.from("profile-media").getPublicUrl(item.storage_path).data.publicUrl : ""))
      .filter(Boolean),
    [mediaItems],
  );
  const videos = useMemo(
    () => mediaItems
      .filter((item) => item.media_type === "video")
      .map((item) => item.public_url || (item.storage_path ? supabase.storage.from("profile-media").getPublicUrl(item.storage_path).data.publicUrl : ""))
      .filter(Boolean),
    [mediaItems],
  );
  const selectedPhoto = photos[selectedPhotoIndex] || photos[0] || "";
  const selectedPhotoAlt = `${profile?.name || "Perfil"} - foto ${selectedPhotoIndex + 1}`;
  const backHref = catalogHrefByType[profile?.type || ""] || "/mulheres";

  useEffect(() => {
    if (selectedPhotoIndex >= photos.length) {
      setSelectedPhotoIndex(0);
    }
  }, [photos.length, selectedPhotoIndex]);

  const showPreviousPhoto = () => {
    setSelectedPhotoIndex((current) => (photos.length ? (current - 1 + photos.length) % photos.length : 0));
  };

  const showNextPhoto = () => {
    setSelectedPhotoIndex((current) => (photos.length ? (current + 1) % photos.length : 0));
  };

  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link href="/mulheres">Mulheres</Link>
          <Link href="/homens">Homens</Link>
          <Link href="/travestis">Trans</Link>
          <AuthNavLink />
        </nav>
      </header>

      <main className="app-page profile-layout profile-layout--complete">
        {loading ? (
          <section className="empty-state">
            <p>Carregando perfil...</p>
          </section>
        ) : !profile ? (
          <section className="empty-state">
            <h1>Perfil indisponível</h1>
            <p>{message}</p>
            <Link className="button button--primary" href="/mulheres">Voltar ao catálogo</Link>
          </section>
        ) : (
          <>
            <section className="profile-media-column">
              <div className="profile-card-shell media-gallery">
                <div className="gallery-stage">
                  {profile.profile_verified && <span className="approval-badge">Verificado</span>}
                  <button
                    className="gallery-zoom"
                    type="button"
                    onClick={showNextPhoto}
                    disabled={photos.length <= 1}
                    aria-label={photos.length > 1 ? "Abrir próxima foto" : "Foto principal"}
                    style={selectedPhoto ? { "--gallery-photo": `url("${selectedPhoto}")` } as React.CSSProperties : undefined}
                  >
                    {selectedPhoto ? (
                      <img src={selectedPhoto} alt={selectedPhotoAlt} />
                    ) : (
                      <div className="profile-photo-placeholder">Sem foto aprovada</div>
                    )}
                  </button>
                  {photos.length > 1 && (
                    <>
                      <button className="gallery-nav gallery-nav--prev" type="button" onClick={showPreviousPhoto} aria-label="Foto anterior">
                        ‹
                      </button>
                      <button className="gallery-nav gallery-nav--next" type="button" onClick={showNextPhoto} aria-label="Próxima foto">
                        ›
                      </button>
                    </>
                  )}
                  <span className="media-counter">{photos.length} foto(s)</span>
                </div>
                {photos.length > 1 && (
                  <div className="gallery-preview-grid" aria-label="Fotos aprovadas">
                    {photos.map((photo, index) => (
                      <button
                        className={`gallery-thumb ${selectedPhotoIndex === index ? "is-active" : ""}`}
                        key={photo}
                        type="button"
                        onClick={() => setSelectedPhotoIndex(index)}
                        aria-label={`Abrir foto ${index + 1}`}
                      >
                        <img src={photo} alt={`${profile.name || "Perfil"} - foto ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
                {videos.length > 0 && (
                  <div className="profile-video-list" aria-label="Vídeos aprovados">
                    {videos.map((videoUrl, index) => (
                      <div className="watermarked-media" key={videoUrl}>
                        <video src={videoUrl} controls preload="metadata" aria-label={`Vídeo ${index + 1}`} />
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
                    <dt>Localização</dt>
                    <dd>{[profile.neighborhood, profile.location, profile.state_uf].filter(Boolean).join(" - ") || "Não informada"}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{profile.is_online ? "Online" : "Offline"}</dd>
                  </div>
                  <div>
                    <dt>Atendimento</dt>
                    <dd>{profile.serves || "Não informado"}</dd>
                  </div>
                  <div>
                    <dt>Local</dt>
                    <dd>{profile.has_place ? placeLabels[profile.has_place] || profile.has_place : "Não informado"}</dd>
                  </div>
                </dl>
                {profile.whatsapp && (
                  <a className="button button--primary favorite-button--wide" href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}?text=Olá,%20encontrei%20seu%20contato%20no%20site%20Delírio%20Privê`} target="_blank" rel="noreferrer">
                    Chamar no WhatsApp
                  </a>
                )}
              </div>
            </aside>

            <section className="profile-content-grid profile-wide-section">
              <article className="profile-card-shell description-section">
                <span className="section-kicker">Descrição</span>
                <h2>Sobre o perfil</h2>
                <p>{profile.description || "Descrição ainda não informada."}</p>
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
                  <div><dt>Horários</dt><dd>{profile.availability || "Não informado"}</dd></div>
                  <div><dt>Pagamento</dt><dd>{profile.payment_methods || "Não informado"}</dd></div>
                  <div><dt>Restrições</dt><dd>{profile.restrictions || "Não informado"}</dd></div>
                </dl>
              </article>
            </section>

            <Link className="button button--ghost profile-wide-section" href={backHref}>Voltar ao catálogo</Link>
          </>
        )}
      </main>
    </>
  );
}
