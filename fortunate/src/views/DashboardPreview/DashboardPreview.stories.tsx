import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DashboardPreview } from "./DashboardPreview";

const meta = {
  title: "Fortunate / Dashboard Preview",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const FullDashboard: Story = {
  render: () => <DashboardPreview />,
};
