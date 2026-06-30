import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Pill } from "./Pill";

const meta = {
  title: "Design System/Pill",
  component: Pill,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Conteúdo do Pill",
    },
    bg: {
      control: "color",
      description: "Cor de fundo (CSS color)",
    },
    icon: {
      control: false,
      description: "Ícone opcional (ReactNode)",
    },
  },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Pill Texto",
    bg: "color-mix(in srgb, var(--c-action) 12%, transparent)",
  },
};

export const ComIcone: Story = {
  args: {
    children: "Destaque",
    bg: "color-mix(in srgb, var(--c-action) 12%, transparent)",
    icon: (
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="currentColor"
        style={{ color: "var(--c-action)" }}
      >
        <polygon points="5,0 6.2,3.8 10,3.8 6.9,6.1 8.1,10 5,7.6 1.9,10 3.1,6.1 0,3.8 3.8,3.8" />
      </svg>
    ),
  },
};
