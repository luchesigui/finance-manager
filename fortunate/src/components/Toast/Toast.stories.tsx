import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Toast } from "./Toast";

const meta = {
  title: "Design System/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["success", "error", "warning", "info"],
      description: "Visual variant — controls accent color and icon",
    },
    title: {
      control: "text",
    },
    message: {
      control: "text",
    },
    autoDismiss: {
      control: "boolean",
      description: "Show animated progress bar at bottom (4s CSS animation)",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: "success",
    title: "Lançamento registrado",
    message: "R$ 85,00 adicionado aos Prazeres.",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    title: "Erro ao salvar",
    message: "Verifique os campos e tente novamente.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Limite próximo",
    message: "Você atingiu 85% do limite de Conforto.",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    title: "Dica Fortuna",
    message: "Você pode categorizar lançamentos por voz.",
  },
};

export const ComAutoDismiss: Story = {
  args: {
    variant: "success",
    title: "Lançamento registrado",
    message: "R$ 85,00 adicionado aos Prazeres.",
    autoDismiss: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Toast
        variant="success"
        title="Lançamento registrado"
        message="R$ 85,00 adicionado aos Prazeres."
        onDismiss={() => {}}
      />
      <Toast
        variant="error"
        title="Erro ao salvar"
        message="Verifique os campos e tente novamente."
        onDismiss={() => {}}
      />
      <Toast
        variant="warning"
        title="Limite próximo"
        message="Você atingiu 85% do limite de Conforto."
        onDismiss={() => {}}
      />
      <Toast
        variant="info"
        title="Dica Fortuna"
        message="Você pode categorizar lançamentos por voz."
        onDismiss={() => {}}
      />
    </div>
  ),
};
