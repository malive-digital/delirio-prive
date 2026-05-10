"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthNavLink } from "@/components/AuthNavLink";

type PartnershipPromotion = {
  id: string;
  title: string;
  partner_name: string;
  description: string;
  promotion_label: string | null;
  image_url: string;
  link_url: string | null;
};

export default function ParceriasPromocoes() {
  const [items, setItems] = useState<PartnershipPromotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      const { data } = await supabase
        .from("partnership_promotions")
        .select("id,title,partner_name,description,promotion_label,image_url,link_url")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      setItems(data || []);
      setLoading(false);
    };

    loadItems();
  }, []);

  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link href="/planos">Planos</Link>
          <Link className="is-active" href="/parcerias-promocoes">Parcerias</Link>
          <AuthNavLink />
        </nav>
      </header>

      <main className="app-page">
        <div className="page-title">
          <div>
            <p className="eyebrow">Clube Delírio Privê</p>
            <h1>Parcerias e promoções</h1>
          </div>
        </div>

        {loading ? (
          <section className="empty-state">
            <p>Carregando parcerias...</p>
          </section>
        ) : items.length === 0 ? (
          <section className="empty-state">
            <h2>Nenhuma promoção ativa no momento</h2>
            <p>Novas parcerias oficiais serão exibidas aqui assim que forem publicadas.</p>
          </section>
        ) : (
          <section className="partner-grid" aria-label="Parcerias e promoções ativas">
            {items.map((item) => (
              <article className="partner-card" key={item.id}>
                <div className="partner-card__media">
                  <img src={item.image_url} alt={item.title} loading="lazy" />
                  {item.promotion_label && <span>{item.promotion_label}</span>}
                </div>
                <div className="partner-card__body">
                  <p className="eyebrow">{item.partner_name}</p>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  {item.link_url && (
                    <a className="button button--primary" href={item.link_url} target="_blank" rel="noreferrer">
                      Ver promoção
                    </a>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
