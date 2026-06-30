import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Badge } from "./Badge";

const meta = {
  title: "Design System/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "pilar-essenciais",
        "pilar-conforto",
        "pilar-prazeres",
        "pilar-conhecimento",
        "pilar-metas",
        "pilar-liberdade",
      ],
      description: "Variante do pilar para a cor da badge",
    },
    children: {
      control: "text",
      description: "Conteúdo textual da badge",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge Default (Metas)",
  },
};

export const AllPilares: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      <Badge variant="pilar-essenciais">Gastos Essenciais</Badge>
      <Badge variant="pilar-conforto">Conforto</Badge>
      <Badge variant="pilar-prazeres">Prazeres</Badge>
      <Badge variant="pilar-conhecimento">Conhecimento</Badge>
      <Badge variant="pilar-metas">Metas</Badge>
      <Badge variant="pilar-liberdade">Liberdade Financeira</Badge>
    </div>
  ),
};
