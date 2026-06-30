import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "./Navbar";

const meta = {
  title: "Design System/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    scrolled: {
      control: "boolean",
      description: "Simulates the scrolled/glass state",
    },
    userName: { control: "text" },
    userInitial: { control: "text" },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    scrolled: false,
    userName: "Luche Silva",
    userInitial: "L",
  },
};

export const Scrolled: Story = {
  args: {
    scrolled: true,
    userName: "Luche Silva",
    userInitial: "L",
  },
};
