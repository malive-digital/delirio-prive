export type PlanName = "Basico" | "Premium" | "Top Prive";

export type PlanLimits = {
  photos: number;
  videos: number;
};

export type PlanConfig = {
  key: PlanName;
  displayName: string;
  price: string;
  limits: PlanLimits;
  mediaLabel: string;
};

export const PLAN_CONFIGS: Record<PlanName, PlanConfig> = {
  Basico: {
    key: "Basico",
    displayName: "B\u00e1sico",
    price: "R$ 49,90",
    limits: {
      photos: 5,
      videos: 0,
    },
    mediaLabel: "5 fotos no perfil",
  },
  Premium: {
    key: "Premium",
    displayName: "Premium",
    price: "R$ 89,90",
    limits: {
      photos: 10,
      videos: 1,
    },
    mediaLabel: "10 fotos e 1 v\u00eddeo no perfil",
  },
  "Top Prive": {
    key: "Top Prive",
    displayName: "Top Priv\u00ea",
    price: "R$ 149,90",
    limits: {
      photos: 15,
      videos: 2,
    },
    mediaLabel: "15 fotos e 2 v\u00eddeos no perfil",
  },
};

export const PLAN_LIST = [
  PLAN_CONFIGS.Basico,
  PLAN_CONFIGS.Premium,
  PLAN_CONFIGS["Top Prive"],
];

export function getPlanConfig(planName: string): PlanConfig {
  const normalizedPlan = planName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedPlan.includes("top")) return PLAN_CONFIGS["Top Prive"];
  if (normalizedPlan.includes("premium")) return PLAN_CONFIGS.Premium;
  return PLAN_CONFIGS.Basico;
}
