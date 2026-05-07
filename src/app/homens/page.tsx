import { CatalogPage } from "@/components/CatalogPage";

export default function HomensPage() {
  return (
    <CatalogPage
      title="Homens"
      type="homem"
      activeHref="/homens"
      intro="Perfis masculinos cadastrados pela administração."
    />
  );
}
