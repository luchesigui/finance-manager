import type { Meta, StoryObj } from "@storybook/react";
import { StackedCards } from "./StackedCards";

const defaultCards = [
  {
    label: "Conta Corrente Principal",
    value: "R$ 14.280,00",
    meta: "Banco Celestial • Conta Ativa",
  },
  {
    label: "Carteira de Investimentos",
    value: "R$ 78.430,00",
    meta: "Ações & Fundos Imobiliários",
  },
  {
    label: "Reserva de Emergência",
    value: "R$ 25.000,00",
    meta: "Banco do Sol • Liquidez Diária",
  },
];

const meta = {
  title: "Design System/StackedCards",
  component: StackedCards,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    cards: { control: "object", description: "Array de dados das carteiras empilhadas" },
  },
  args: {
    cards: defaultCards,
  },
} satisfies Meta<typeof StackedCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 420 }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.85rem",
          color: "var(--c-content-muted)",
          marginBottom: "1rem",
        }}
      >
        Passe o mouse para ver o efeito Tarot Spread
      </p>
      <StackedCards {...args} />
    </div>
  ),
};

export const SingleCard: Story = {
  args: {
    cards: [defaultCards[0]],
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <StackedCards {...args} />
    </div>
  ),
};
