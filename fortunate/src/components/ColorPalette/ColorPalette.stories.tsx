import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Color Palette",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface Swatch {
  name: string;
  value: string;
  cssVar?: string;
  textDark?: boolean;
}

function SwatchGrid({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <div style={{ marginBottom: "3rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1rem",
          fontWeight: 600,
          color: "var(--c-content)",
          marginBottom: "1.5rem",
          paddingBottom: "0.5rem",
          borderBottom: "1.5px solid color-mix(in srgb, var(--c-content) 10%, transparent)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        {swatches.map((s) => (
          <div key={s.name} style={{ textAlign: "center", minWidth: 100 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: s.cssVar ? `var(${s.cssVar})` : s.value,
                margin: "0 auto 0.75rem",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                boxShadow: "0 4px 15px rgba(26, 50, 71, 0.08)",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: "0.8rem",
                color: "var(--c-content)",
                marginBottom: "0.2rem",
              }}
            >
              {s.name}
            </p>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "0.7rem",
                color: "var(--c-content-muted)",
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CelestialPalette: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <SwatchGrid
        title="Paleta Base — O Céu"
        swatches={[
          { name: "Céu Topo", value: "#5B8BAF" },
          { name: "Céu Médio", value: "#8BBAD6" },
          { name: "Céu Claro", value: "#C3D5E4" },
          { name: "Nuvem Clara", value: "#F3E8DB" },
          { name: "Nuvem Escura", value: "#E9DFCE" },
        ]}
      />
      <SwatchGrid
        title="Ouro Fortuna — O Brilho"
        swatches={[
          { name: "Ouro Fortuna", value: "#E98024" },
          { name: "Brilho Solar", value: "#F3A83B" },
        ]}
      />
      <SwatchGrid
        title="Slate — O Azul Profundo"
        swatches={[
          { name: "Azul Profundo", value: "#1A3247" },
          { name: "Slate Muted", value: "#4A607A" },
          { name: "Eclipse", value: "#0A131C" },
        ]}
      />
      <SwatchGrid
        title="6 Pilares Financeiros"
        swatches={[
          { name: "Essenciais", value: "#3B82F6", cssVar: "--pilar-essenciais" },
          { name: "Conforto", value: "#EC4899", cssVar: "--pilar-conforto" },
          { name: "Prazeres", value: "#F97316", cssVar: "--pilar-prazeres" },
          { name: "Conhecimento", value: "#EAB308", cssVar: "--pilar-conhecimento" },
          { name: "Metas", value: "#6B7280", cssVar: "--pilar-metas" },
          { name: "Liberdade", value: "#8B5CF6", cssVar: "--pilar-liberdade" },
        ]}
      />
      <SwatchGrid
        title="Status Semânticos"
        swatches={[
          { name: "Positivo", value: "#10b981" },
          { name: "Negativo", value: "#e11d48" },
        ]}
      />
    </div>
  ),
};
