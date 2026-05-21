import type { Metadata } from "next";
import { CatalogPage } from "@/components/CatalogPage";
import { siteUrl } from "@/lib/profile-seo";

export const metadata: Metadata = {
  title: "Homens",
  description: "Encontre acompanhantes homens no Delirio Prive com perfis verificados, fotos e atendimento discreto.",
  alternates: {
    canonical: `${siteUrl}/homens`,
  },
};

export default function HomensPage() {
  return (
    <CatalogPage
      title="Homens"
      type="homem"
      activeHref="/homens"
    />
  );
}
