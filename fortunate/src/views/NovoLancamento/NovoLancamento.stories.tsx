import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { NovoLancamento } from "./NovoLancamento";

const meta = {
  title: "Fortunate / Novo Lançamento",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Padrao: Story = {
  render: () => <NovoLancamento initialType="despesa" />,
};
