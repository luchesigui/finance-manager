import type { Meta, StoryObj } from "@storybook/react";
import { TransferCard } from "./TransferCard";

const meta = {
  title: "Design System/TransferCard",
  component: TransferCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "inline-radio",
      options: ["pending", "done"],
      description: "Status da transferência",
    },
    amount: { control: "number", description: "Valor da transferência" },
    empty: { control: "boolean", description: "Exibe estado vazio" },
    from: { control: "object", description: "Pessoa remetente" },
    to: { control: "object", description: "Pessoa destinatária" },
    onMarkDone: { action: "onMarkDone", description: "Callback de marcar como concluído" },
  },
  args: {
    from: { name: "Guilherme", initial: "G" },
    to: { name: "Amanda", initial: "A" },
    amount: 1250.75,
    status: "pending",
  },
} satisfies Meta<typeof TransferCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    status: "pending",
  },
};

export const Done: Story = {
  args: {
    status: "done",
  },
};

export const Empty: Story = {
  args: {
    empty: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 560 }}>
      <TransferCard
        from={{ name: "Guilherme", initial: "G" }}
        to={{ name: "Amanda", initial: "A" }}
        amount={1250.75}
        status="pending"
        onMarkDone={() => console.log("onMarkDone")}
      />
      <TransferCard
        from={{ name: "Guilherme", initial: "G" }}
        to={{ name: "Amanda", initial: "A" }}
        amount={1250.75}
        status="done"
      />
      <TransferCard empty />
    </div>
  ),
};
