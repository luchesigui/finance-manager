import type { Meta, StoryObj } from "@storybook/react";
import { GlassCard } from "../GlassCard/GlassCard";
import { Table } from "./Table";

interface Transaction {
  date: string;
  description: string;
  pilar: string;
  amount: string;
  type: "expense" | "income";
  isCard?: boolean;
}

const transactions: Transaction[] = [
  {
    date: "28/06",
    description: "Almoço com equipe",
    pilar: "Prazeres",
    amount: "R$ -85,00",
    type: "expense",
    isCard: true,
  },
  {
    date: "27/06",
    description: "Salário — Junho",
    pilar: "—",
    amount: "R$ +12.000,00",
    type: "income",
  },
  {
    date: "26/06",
    description: "Mensalidade Academia",
    pilar: "Conforto",
    amount: "R$ -89,90",
    type: "expense",
    isCard: true,
  },
  {
    date: "25/06",
    description: "Curso de Investimentos",
    pilar: "Conhecimento",
    amount: "R$ -297,00",
    type: "expense",
  },
  {
    date: "24/06",
    description: "Dividendos FIIs",
    pilar: "Liberdade Financeira",
    amount: "R$ +423,50",
    type: "income",
  },
];

const columns = [
  { key: "date" as const, header: "Data" },
  { key: "description" as const, header: "Descrição" },
  { key: "pilar" as const, header: "Pilar" },
  {
    key: "amount" as const,
    header: "Valor",
    render: (value: unknown, row: Transaction) => (
      <span className={row.type === "income" ? "val-positive" : "val-negative"}>
        {String(value)}
      </span>
    ),
  },
];

const meta = {
  title: "Design System/Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "object", description: "Configuração das colunas da tabela" },
    data: { control: "object", description: "Array de objetos contendo os dados da tabela" },
    maxLines: { control: "number", description: "Limite máximo de linhas visíveis antes do fade" },
    showCardBadge: {
      control: "boolean",
      description: "Exibe tag/emoji de cartão nos lançamentos devidos",
    },
    onReadAllClick: { action: "onReadAllClick", description: "Callback ao clicar em ver tudo" },
  },
  args: {
    columns,
    data: transactions,
    showCardBadge: false,
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <GlassCard variant="fino" style={{ width: 680, padding: "2rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.1rem",
          fontWeight: 600,
          marginBottom: "1.5rem",
          color: "var(--c-content)",
        }}
      >
        Últimas Transações
      </h2>
      <Table {...args} />
    </GlassCard>
  ),
};

export const ComMaxLines: Story = {
  args: {
    maxLines: 3,
    showCardBadge: true,
  },
  render: (args) => (
    <GlassCard variant="fino" style={{ width: 680, padding: "2rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.1rem",
          fontWeight: 600,
          marginBottom: "1.5rem",
          color: "var(--c-content)",
        }}
      >
        Últimas Transações
      </h2>
      <Table {...args} />
    </GlassCard>
  ),
};
