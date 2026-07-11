import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { PilarCard, type PilarKey } from "./PilarCard";

const meta = {
  title: "Design System/PilarCard",
  component: PilarCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    pilar: {
      control: "select",
      options: ["essenciais", "conforto", "prazeres", "conhecimento", "metas", "liberdade"],
    },
    mode: {
      control: "radio",
      options: ["display", "config"],
    },
    targetValue: { control: "number" },
    usedValue: { control: "number" },
    forecastedValue: { control: "number" },
    percentTarget: { control: "number" },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PilarCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Display mode ── */

export const Padrao: Story = {
  args: { pilar: "essenciais", mode: "display", targetValue: 10000, usedValue: 4800 },
  render: (args) => (
    <div style={{ width: 300 }}>
      <PilarCard {...args} />
    </div>
  ),
};

export const ComPrevisao: Story = {
  args: {
    pilar: "essenciais",
    mode: "display",
    targetValue: 10000,
    usedValue: 4800,
    forecastedValue: 6500,
  },
  render: (args) => (
    <div style={{ width: 300 }}>
      <PilarCard {...args} />
    </div>
  ),
};

export const PrevisaoComOverflow: Story = {
  args: {
    pilar: "conforto",
    mode: "display",
    targetValue: 5000,
    usedValue: 3500,
    forecastedValue: 5800,
  },
  render: (args) => (
    <div style={{ width: 300 }}>
      <PilarCard {...args} />
    </div>
  ),
};

export const Zerado: Story = {
  args: { pilar: "metas", mode: "display", targetValue: 8000, usedValue: 0 },
  render: (args) => (
    <div style={{ width: 300 }}>
      <PilarCard {...args} />
    </div>
  ),
};

export const Overflow: Story = {
  args: { pilar: "conforto", mode: "display", targetValue: 5000, usedValue: 6350 },
  render: (args) => (
    <div style={{ width: 300 }}>
      <PilarCard {...args} />
    </div>
  ),
};

/** Todos os 3 estados lado a lado para o mesmo pilar */
export const TresEstados: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
      {(
        [
          { label: "Zerado", usedValue: 0 },
          { label: "Padrão (48%)", usedValue: 1440 },
          { label: "Quase no limite (90%)", usedValue: 2700 },
          { label: "Overflow (127%)", usedValue: 3810 },
        ] as const
      ).map(({ label, usedValue }) => (
        <div key={label} style={{ width: 260 }}>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.72rem",
              color: "var(--c-content-muted)",
              textAlign: "center",
              margin: "0 0 0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </p>
          <PilarCard pilar="prazeres" targetValue={3000} usedValue={usedValue} />
        </div>
      ))}
    </div>
  ),
};

/** Grade 2×3 com os 6 pilares — layout real do Dashboard */
export const TodosOsPilares: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1.25rem",
        width: 620,
      }}
    >
      <PilarCard pilar="essenciais" targetValue={10000} usedValue={4800} />
      <PilarCard pilar="conforto" targetValue={5000} usedValue={3250} />
      <PilarCard pilar="prazeres" targetValue={3000} usedValue={750} />
      <PilarCard pilar="conhecimento" targetValue={2000} usedValue={1600} />
      <PilarCard pilar="metas" targetValue={8000} usedValue={1200} />
      <PilarCard pilar="liberdade" targetValue={15000} usedValue={7500} />
    </div>
  ),
};

/** Grade com alguns em overflow para verificar o estado de alerta */
export const ComOverflows: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1.25rem",
        width: 620,
      }}
    >
      <PilarCard pilar="essenciais" targetValue={10000} usedValue={4800} />
      <PilarCard pilar="conforto" targetValue={5000} usedValue={6350} />
      <PilarCard pilar="prazeres" targetValue={3000} usedValue={3810} />
      <PilarCard pilar="conhecimento" targetValue={2000} usedValue={1600} />
      <PilarCard pilar="metas" targetValue={8000} usedValue={1200} />
      <PilarCard pilar="liberdade" targetValue={15000} usedValue={7500} />
    </div>
  ),
};

/* ── Config mode ── */

const PILARES: PilarKey[] = [
  "essenciais",
  "conforto",
  "prazeres",
  "conhecimento",
  "metas",
  "liberdade",
];

/** Grade de configuração interativa — mesmos cards, mode="config" com inputs editáveis */
export const ModoConfiguracao: Story = {
  render: () => {
    const Demo = () => {
      const [targets, setTargets] = useState<Record<PilarKey, number>>({
        essenciais: 25,
        conforto: 15,
        prazeres: 10,
        conhecimento: 5,
        metas: 15,
        liberdade: 30,
      });

      const total = Object.values(targets).reduce((a, b) => a + b, 0);
      const isValid = total === 100;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: 620 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.25rem",
            }}
          >
            {PILARES.map((pilar) => (
              <PilarCard
                key={pilar}
                mode="config"
                pilar={pilar}
                percentTarget={targets[pilar]}
                onPercentChange={(val) => setTargets((prev) => ({ ...prev, [pilar]: val }))}
              />
            ))}
          </div>

          {/* Indicador de total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1.25rem",
              borderRadius: "var(--radius-card)",
              background: isValid
                ? "color-mix(in srgb, var(--status-positive) 10%, transparent)"
                : "color-mix(in srgb, var(--status-negative) 8%, transparent)",
              border: `1px solid ${
                isValid
                  ? "color-mix(in srgb, var(--status-positive) 25%, transparent)"
                  : "color-mix(in srgb, var(--status-negative) 20%, transparent)"
              }`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: isValid ? "var(--status-positive)" : "var(--status-negative)",
              }}
            >
              {isValid
                ? "Total: 100% — pronto para salvar ✓"
                : `Total: ${total}% — ${total < 100 ? `faltam ${100 - total}%` : `excede em ${total - 100}%`}`}
            </span>
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};
