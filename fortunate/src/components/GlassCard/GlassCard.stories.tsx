import type { Meta, StoryObj } from "@storybook/react";
import { GlassCard } from "./GlassCard";

const meta = {
  title: "Design System/GlassCard",
  component: GlassCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["fino", "denso"],
      description: "Glass opacity variant — Fino (12%) or Denso (70%)",
    },
    radius: {
      control: "radio",
      options: ["panel", "card"],
      description: "Border radius — panel (24px) or card (20px)",
    },
    hover: {
      control: "boolean",
      description: "Enable hover lift effect",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent = () => (
  <div>
    <p
      style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.1rem",
        fontWeight: 600,
        marginBottom: "0.5rem",
        color: "var(--c-content)",
      }}
    >
      Título do Card
    </p>
    <p
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.9rem",
        color: "var(--c-content-muted)",
        lineHeight: 1.6,
      }}
    >
      Conteúdo do cartão com texto de exemplo para demonstrar a aparência do glassmorphism do
      Fortunate.
    </p>
  </div>
);

export const Fino: Story = {
  args: {
    variant: "fino",
    radius: "panel",
    hover: true,
    children: <SampleContent />,
    style: { width: 360 },
  },
};

export const Denso: Story = {
  args: {
    variant: "denso",
    radius: "card",
    hover: true,
    children: <SampleContent />,
    style: { width: 360 },
  },
};

export const Comparison: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--c-content-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "1rem",
          }}
        >
          Glass Fino — 12%
        </p>
        <GlassCard variant="fino" radius="panel" style={{ width: 280 }}>
          <SampleContent />
        </GlassCard>
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--c-content-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "1rem",
          }}
        >
          Glass Denso — 70%
        </p>
        <GlassCard variant="denso" radius="card" style={{ width: 280 }}>
          <SampleContent />
        </GlassCard>
      </div>
    </div>
  ),
};
