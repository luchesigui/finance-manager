import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Autocomplete } from "../components/Autocomplete/Autocomplete";
import { Badge } from "../components/Badge/Badge";
import { Button } from "../components/Button/Button";
import { CloudBackground } from "../components/CloudBackground/CloudBackground";
import { FloatingAssistant } from "../components/FloatingAssistant/FloatingAssistant";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { Input, Select } from "../components/Input/Input";
import { PilarCard } from "../components/PilarCard/PilarCard";
import { Table } from "../components/Table/Table";
import { TransferCard } from "../components/TransferCard/TransferCard";
import { TrendBadge } from "../components/TrendBadge/TrendBadge";

const meta = {
  title: "Fortunate / Dashboard Preview",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

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
];

const tableColumns = [
  { key: "date" as const, header: "Data" },
  { key: "description" as const, header: "Descrição" },
  { key: "pilar" as const, header: "Categoria" },
  {
    key: "amount" as const,
    header: "Valor",
    render: (value: unknown, row: Transaction) => (
      <span
        style={{
          color: row.type === "income" ? "var(--status-positive)" : "var(--status-negative)",
          fontWeight: 600,
        }}
      >
        {String(value)}
      </span>
    ),
  },
];

const panelTitle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "1.4rem",
  fontWeight: 600,
  marginBottom: "2rem",
  letterSpacing: "0.02em",
  borderBottom: "1.5px solid color-mix(in srgb, var(--c-content) 10%, transparent)",
  paddingBottom: "0.75rem",
  color: "var(--c-content)",
};

export const FullDashboard: Story = {
  render: () => {
    const Demo = () => {
      const [txs, setTxs] = React.useState<Transaction[]>(transactions);
      const [description, setDescription] = React.useState("");
      const [amount, setAmount] = React.useState("");
      const [categories, setCategories] = React.useState([
        { value: "alimentacao", label: "Alimentação", pillar: "Gastos Essenciais" },
        { value: "transporte", label: "Transporte", pillar: "Gastos Essenciais" },
        { value: "moradia", label: "Moradia", pillar: "Gastos Essenciais" },
        { value: "saude", label: "Saúde", pillar: "Gastos Essenciais" },
        { value: "educacao", label: "Educação", pillar: "Conhecimento" },
        { value: "lazer", label: "Lazer e Entretenimento", pillar: "Prazeres" },
        { value: "vestuario", label: "Vestuário", pillar: "Conforto" },
        { value: "assinaturas", label: "Assinaturas e Serviços", pillar: "Prazeres" },
        { value: "outros", label: "Outros", pillar: "Conforto" },
      ]);
      const [selectedCategory, setSelectedCategory] = React.useState("");

      const pillars = [
        "Gastos Essenciais",
        "Conforto",
        "Prazeres",
        "Conhecimento",
        "Planejamento",
        "Liberdade Financeira",
      ];

      const handleCreateCategory = (name: string, pillar: string) => {
        const newValue = name
          .toLowerCase()
          .normalize("NFD")
          // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard accent removal after normalization
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-");
        const newCategory = { value: newValue, label: name, pillar };
        setCategories((prev) => [...prev, newCategory]);
        setSelectedCategory(newValue);
      };

      const handleAddTransaction = () => {
        if (!description.trim() || !amount.trim()) return;
        const parsedAmount = Number.parseFloat(amount.replace(",", "."));
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

        const selected = categories.find((cat) => cat.value === selectedCategory);
        const categoryLabel = selected ? selected.label : "Outros";

        const newTx: Transaction = {
          date: "30/06",
          description: description.trim(),
          pilar: categoryLabel,
          amount: `R$ -${parsedAmount.toFixed(2).replace(".", ",")}`,
          type: "expense",
          isCard: false,
        };

        setTxs((prev) => [newTx, ...prev]);

        // Reset
        setDescription("");
        setAmount("");
        setSelectedCategory("");
      };

      return (
        <div
          style={{
            minHeight: "100vh",
            background: "var(--c-bg)",
            backgroundAttachment: "fixed",
            padding: "6rem 2rem 10rem",
            fontFamily: "var(--font-body)",
          }}
        >
          <CloudBackground />

          {/* Hero */}
          <header style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--c-content-muted)",
                margin: "0 0 0.5rem",
              }}
            >
              Junho 2026
            </p>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "4rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: "0 0 1.2rem",
                color: "var(--c-content)",
              }}
            >
              R$ 25.171,45
            </h1>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}
            >
              <TrendBadge trend="up">Receitas R$ 35.928,25</TrendBadge>
              <TrendBadge trend="down">Despesas R$ 10.756,80</TrendBadge>
              <TrendBadge trend="up">Investido R$ 15.000,00</TrendBadge>
            </div>
          </header>

          {/* Main content */}
          <div
            style={{
              maxWidth: 1400,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "2.5rem",
            }}
          >
            {/* Top: 2-column grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: "2.5rem",
                alignItems: "stretch",
              }}
            >
              {/* Coluna esquerda */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                {/* Novo Lançamento */}
                <GlassCard variant="fino" style={{ padding: "2.5rem" }}>
                  <h2 style={panelTitle}>Novo Lançamento</h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.25rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <Input
                      label="Descrição"
                      placeholder="Ex: Assinatura de Software"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <div
                      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}
                    >
                      <Input
                        label="Valor"
                        prefix="R$"
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <Autocomplete
                        label="Categoria"
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={categories}
                        pillars={pillars}
                        onCreateCategory={handleCreateCategory}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDescription("");
                        setAmount("");
                        setSelectedCategory("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button variant="action" onClick={handleAddTransaction}>
                      Inserir Lançamento
                    </Button>
                  </div>
                </GlassCard>

                {/* Transferência */}
                <GlassCard variant="fino" style={{ padding: "2.5rem" }}>
                  <h2 style={panelTitle}>Transferência do Mês</h2>
                  <TransferCard
                    from={{ name: "Guilherme", initial: "G" }}
                    to={{ name: "Amanda", initial: "A" }}
                    amount={1250.75}
                    status="pending"
                  />
                </GlassCard>
              </div>

              {/* Distribuição por Pilares */}
              <GlassCard
                variant="fino"
                style={{
                  padding: "2.5rem",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 400,
                }}
              >
                <h2 style={panelTitle}>Distribuição por Pilares</h2>
                <div
                  style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(260px, 1fr))",
                    gridTemplateRows: "repeat(3, 1fr)",
                    gap: "1.25rem",
                    alignItems: "stretch",
                  }}
                >
                  <PilarCard pilar="essenciais" targetValue={10000} usedValue={4800} />
                  <PilarCard pilar="conforto" targetValue={5000} usedValue={3250} />
                  <PilarCard pilar="prazeres" targetValue={3000} usedValue={750} />
                  <PilarCard pilar="conhecimento" targetValue={2000} usedValue={1600} />
                  <PilarCard pilar="metas" targetValue={8000} usedValue={1200} />
                  <PilarCard pilar="liberdade" targetValue={15000} usedValue={7500} />
                </div>
              </GlassCard>
            </div>

            {/* Últimas Transações — full width */}
            <GlassCard variant="fino" style={{ padding: "2.5rem" }}>
              <h2 style={panelTitle}>Últimas Transações</h2>
              <Table
                columns={tableColumns}
                data={txs}
                maxLines={4}
                onReadAllClick={() => {}}
                showCardBadge
              />
            </GlassCard>
          </div>

          {/* Floating Assistant */}
          <div
            style={{
              position: "fixed",
              bottom: 30,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 580,
              padding: "0 1.5rem",
              zIndex: 900,
            }}
          >
            <FloatingAssistant
              promptSuggestions={[
                "Gastei R$ 45 no almoço",
                "Qual meu saldo este mês?",
                "Estou dentro do limite?",
              ]}
            />
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};
