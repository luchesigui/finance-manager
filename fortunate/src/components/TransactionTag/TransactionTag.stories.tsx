import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { TransactionTag } from "./TransactionTag";

const meta = {
  title: "Design System/TransactionTag",
  component: TransactionTag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "previsao",
        "fora-do-padrao",
        "cartao",
        "proxima-fatura",
        "recorrente",
        "parcelado",
      ],
      description: "Variante visual da tag",
    },
    label: {
      control: "text",
      description: "Texto customizado da tag (opcional)",
    },
  },
} satisfies Meta<typeof TransactionTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "cartao",
  },
};

export const TodasAsVariantes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <TransactionTag variant="previsao" />
      <TransactionTag variant="fora-do-padrao" />
      <TransactionTag variant="cartao" />
      <TransactionTag variant="proxima-fatura" />
      <TransactionTag variant="recorrente" />
      <TransactionTag variant="parcelado" />
    </div>
  ),
};
