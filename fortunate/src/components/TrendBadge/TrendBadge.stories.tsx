import type { Meta, StoryObj } from "@storybook/react";
import { TrendBadge } from "./TrendBadge";

const meta = {
  title: "Design System/TrendBadge",
  component: TrendBadge,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    trend: {
      control: "radio",
      options: ["up", "down", "neutral"],
    },
    children: { control: "text" },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TrendBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Up: Story = {
  args: { trend: "up", children: "Investido R$ 15.000,00" },
};

export const Down: Story = {
  args: { trend: "down", children: "Despesas R$ 10.756,80" },
};

export const Neutral: Story = {
  args: { trend: "neutral", children: "Sem variação" },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      <TrendBadge trend="up">Investido +R$ 2.500</TrendBadge>
      <TrendBadge trend="down">Investido -R$ 2.500</TrendBadge>
      <TrendBadge trend="neutral">Investido R$ 0,00</TrendBadge>
    </div>
  ),
};
