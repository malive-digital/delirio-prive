import type { Metadata } from "next";
import { CatalogPage } from "@/components/CatalogPage";
import { siteUrl } from "@/lib/profile-seo";

export const metadata: Metadata = {
  title: "Trans",
  description: "Encontre acompanhantes trans no Delirio Prive com perfis verificados, fotos e atendimento discreto.",
  alternates: {
    canonical: `${siteUrl}/travestis`,
  },
};

export default function TravestisPage() {
  return (
    <CatalogPage
      title="Trans"
      type="trans"
      activeHref="/travestis"
    />
  );
}
