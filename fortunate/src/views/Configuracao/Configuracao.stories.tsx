import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Configuracao } from "./Configuracao";

const meta = {
  title: "Fortunate / Configuração",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const PaginaConfiguracao: Story = {
  render: () => <Configuracao />,
};
