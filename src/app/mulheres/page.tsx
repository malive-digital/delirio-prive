import type { Metadata } from "next";
import { CatalogPage } from "@/components/CatalogPage";
import { siteUrl } from "@/lib/profile-seo";

export const metadata: Metadata = {
  title: "Mulheres",
  description: "Encontre acompanhantes mulheres no Delirio Prive com perfis verificados, fotos e atendimento discreto.",
  alternates: {
    canonical: `${siteUrl}/mulheres`,
  },
};

export default function MulheresPage() {
  return (
    <CatalogPage
      title="Mulheres"
      type="mulher"
      activeHref="/mulheres"
    />
  );
}
