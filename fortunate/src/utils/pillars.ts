import type { PilarKey } from "@/components/PilarCard/PilarCard";

// Slugs canônicos do banco (categories.pillar_slug e settings.pillar_targets)
export const PILLAR_SLUGS = [
  "essenciais",
  "conforto",
  "prazeres",
  "conhecimento",
  "planejamento",
  "liberdade",
] as const;

export type PillarSlug = (typeof PILLAR_SLUGS)[number];

// Nome exibido de cada pilar
export const PILLAR_NAMES: Record<PillarSlug, string> = {
  essenciais: "Gastos Essenciais",
  conforto: "Conforto",
  prazeres: "Prazeres",
  conhecimento: "Conhecimento",
  planejamento: "Planejamento",
  liberdade: "Liberdade Financeira",
};

// Nome exibido -> slug do banco
export const PILLAR_NAME_TO_SLUG: Record<string, PillarSlug> = Object.fromEntries(
  PILLAR_SLUGS.map((slug) => [PILLAR_NAMES[slug], slug]),
) as Record<string, PillarSlug>;

// O componente PilarCard usa "metas" onde o banco usa "planejamento"
export const PILLAR_SLUG_TO_PILAR_KEY: Record<PillarSlug, PilarKey> = {
  essenciais: "essenciais",
  conforto: "conforto",
  prazeres: "prazeres",
  conhecimento: "conhecimento",
  planejamento: "metas",
  liberdade: "liberdade",
};

export const PILAR_KEY_TO_PILLAR_SLUG: Record<PilarKey, PillarSlug> = {
  essenciais: "essenciais",
  conforto: "conforto",
  prazeres: "prazeres",
  conhecimento: "conhecimento",
  metas: "planejamento",
  liberdade: "liberdade",
};

// Percentuais-alvo default de cada pilar (soma 100)
export const DEFAULT_PILLAR_TARGETS: Record<PillarSlug, number> = {
  essenciais: 50,
  conforto: 15,
  prazeres: 10,
  conhecimento: 5,
  planejamento: 10,
  liberdade: 10,
};

export type PillarTargets = Record<PillarSlug, number>;

export function parsePillarTargets(json: string | null | undefined): PillarTargets {
  if (!json) return { ...DEFAULT_PILLAR_TARGETS };
  try {
    const parsed = JSON.parse(json);
    const result = { ...DEFAULT_PILLAR_TARGETS };
    for (const slug of PILLAR_SLUGS) {
      if (typeof parsed[slug] === "number") result[slug] = parsed[slug];
    }
    return result;
  } catch {
    return { ...DEFAULT_PILLAR_TARGETS };
  }
}
