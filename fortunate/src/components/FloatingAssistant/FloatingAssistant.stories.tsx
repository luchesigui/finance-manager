import type { Meta, StoryObj } from "@storybook/react";
import { FloatingAssistant } from "./FloatingAssistant";

const meta = {
  title: "Design System/FloatingAssistant",
  component: FloatingAssistant,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text", description: "Placeholder do campo de entrada" },
    promptSuggestions: { control: "object", description: "Sugestões de prompts sugeridos" },
  },
} satisfies Meta<typeof FloatingAssistant>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Pergunte ao Fortunate AI… (⌘K)",
  },
  render: (args) => (
    <div style={{ width: 560 }}>
      <FloatingAssistant {...args} />
    </div>
  ),
};

export const CustomSuggestions: Story = {
  args: {
    placeholder: "Converse com o Fortunate AI…",
    promptSuggestions: [
      "Resumo financeiro de junho",
      "Meta de liberdade em dia?",
      "Quem gastou mais este mês?",
    ],
  },
  render: (args) => (
    <div style={{ width: 560 }}>
      <FloatingAssistant {...args} />
    </div>
  ),
};
