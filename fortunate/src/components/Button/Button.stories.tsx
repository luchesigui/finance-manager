import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Design System/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["action", "glass", "outline"],
      description: "Visual style variant",
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Button size",
    },
    children: {
      control: "text",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Action: Story = {
  args: {
    variant: "action",
    size: "md",
    children: "Inserir Lançamento",
  },
};

export const Glass: Story = {
  args: {
    variant: "glass",
    size: "md",
    children: "Exportar Dados",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    size: "md",
    children: "Cancelar",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}
    >
      <Button variant="action" size="sm">
        Pequeno
      </Button>
      <Button variant="action" size="md">
        Médio
      </Button>
      <Button variant="action" size="lg">
        Grande
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Button variant="action">Ação Principal</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};
