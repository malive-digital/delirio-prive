export type CatalogCategory = {
  segment: string;
  title: string;
  type: "mulher" | "homem" | "trans";
};

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    segment: "mulheres",
    title: "Mulheres",
    type: "mulher",
  },
  {
    segment: "homens",
    title: "Homens",
    type: "homem",
  },
  {
    segment: "travestis",
    title: "Trans",
    type: "trans",
  },
];

export const getCatalogCategoryHref = (category: CatalogCategory) => `/${category.segment}`;

export const getCatalogCategoryCityHref = (category: CatalogCategory, citySlug: string) => {
  return `${getCatalogCategoryHref(category)}/${citySlug}`;
};
