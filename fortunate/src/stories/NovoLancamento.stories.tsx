import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Autocomplete } from "../components/Autocomplete/Autocomplete";
import { Button } from "../components/Button/Button";
import { CloudBackground } from "../components/CloudBackground/CloudBackground";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { CapsuleRadio, Input, Select } from "../components/Input/Input";
import { TransactionRow } from "../components/TransactionRow/TransactionRow";
import type { TransactionTagVariant } from "../components/TransactionTag/TransactionTag";

function parseBrazilianCurrencyToNumber(inputValue: string): number | null {
  const digitsOnly = inputValue.replace(/\D/g, "");
  if (digitsOnly.length === 0) return null;

  const centsValue = Number.parseInt(digitsOnly, 10);
  if (!Number.isFinite(centsValue)) return null;

  return centsValue / 100;
}

interface Transaction {
  avatar: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  transactionType: "expense" | "income";
  pills?: TransactionTagVariant[];
}

const allTransactions: Transaction[] = [
  {
    avatar: "GU",
    date: "29/06/2026",
    description: "Assinatura Netflix",
    category: "Prazeres",
    amount: 55.9,
    transactionType: "expense",
    pills: ["cartao", "proxima-fatura"],
  },
  {
    avatar: "GU",
    date: "29/06/2026",
    description: "Mercado Semanal",
    category: "Gastos Essenciais",
    amount: 287.4,
    transactionType: "expense",
    pills: ["previsao"],
  },
  {
    avatar: "AM",
    date: "28/06/2026",
    description: "Almoço com equipe",
    category: "Prazeres",
    amount: 85.0,
    transactionType: "expense",
    pills: ["cartao", "fora-do-padrao"],
  },
  {
    avatar: "GU",
    date: "27/06/2026",
    description: "Salário — Junho",
    category: "—",
    amount: 12000.0,
    transactionType: "income",
  },
  {
    avatar: "GU",
    date: "27/06/2026",
    description: "Transferência para Amanda",
    category: "—",
    amount: 1250.75,
    transactionType: "expense",
  },
  {
    avatar: "GU",
    date: "26/06/2026",
    description: "Mensalidade Academia",
    category: "Conforto",
    amount: 89.9,
    transactionType: "expense",
    pills: ["cartao", "recorrente"],
  },
  {
    avatar: "AM",
    date: "25/06/2026",
    description: "Curso de Investimentos",
    category: "Conhecimento",
    amount: 297.0,
    transactionType: "expense",
    pills: ["parcelado"],
  },
  {
    avatar: "GU",
    date: "24/06/2026",
    description: "Dividendos FIIs",
    category: "Liberdade Financeira",
    amount: 423.5,
    transactionType: "income",
  },
  {
    avatar: "GU",
    date: "23/06/2026",
    description: "Uber — semana",
    category: "Gastos Essenciais",
    amount: 142.0,
    transactionType: "expense",
    pills: ["cartao"],
  },
  {
    avatar: "GU",
    date: "22/06/2026",
    description: "Bônus trimestral",
    category: "—",
    amount: 3500.0,
    transactionType: "income",
  },
];

const meta = {
  title: "Fortunate / Novo Lançamento",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* ─── Design tokens / shared styles ─── */
const panelTitle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "1.4rem",
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: "var(--c-content)",
};

type TransactionType = "despesa" | "renda" | "transferencia";
type RendaSubtype = "incremento" | "decremento";

const TYPE_ACCENT: Record<TransactionType, string> = {
  despesa: "var(--status-negative, #E05C5C)",
  renda: "var(--status-positive, #4CAF82)",
  transferencia: "var(--c-action, #E98024)",
};

const CTA_LABEL: Record<TransactionType, string> = {
  despesa: "Adicionar Lançamento",
  renda: "Adicionar Renda",
  transferencia: "Adicionar Transferência",
};

const TITLE_LABEL: Record<TransactionType, string> = {
  despesa: "Novo Lançamento de Despesa",
  renda: "Novo Lançamento de Renda",
  transferencia: "Nova Transferência",
};

const PEOPLE = [
  { value: "guilherme", label: "Guilherme" },
  { value: "amanda", label: "Amanda" },
];

interface StoryCategory {
  value: string;
  label: string;
  pillar: string;
}

const INITIAL_CATEGORIES: StoryCategory[] = [
  { value: "alimentacao", label: "Alimentação", pillar: "Gastos Essenciais" },
  { value: "transporte", label: "Transporte", pillar: "Gastos Essenciais" },
  { value: "moradia", label: "Moradia", pillar: "Gastos Essenciais" },
  { value: "saude", label: "Saúde", pillar: "Gastos Essenciais" },
  { value: "educacao", label: "Educação", pillar: "Conhecimento" },
  { value: "lazer", label: "Lazer e Entretenimento", pillar: "Prazeres" },
  { value: "vestuario", label: "Vestuário", pillar: "Conforto" },
  { value: "assinaturas", label: "Assinaturas e Serviços", pillar: "Prazeres" },
  { value: "outros", label: "Outros", pillar: "Conforto" },
];

const PILLARS = [
  "Gastos Essenciais",
  "Conforto",
  "Prazeres",
  "Conhecimento",
  "Planejamento",
  "Liberdade Financeira",
];

/* ─── Tab Selector (full-width underline tabs) ─── */
interface TabSelectorProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  accent?: string;
}

function TabSelector({ options, value, onChange, accent = "var(--c-action)" }: TabSelectorProps) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        borderBottom: "1px solid color-mix(in srgb, var(--c-content) 12%, transparent)",
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              borderBottom: isActive ? `3px solid ${accent}` : "3px solid transparent",
              marginBottom: -1,
              cursor: "pointer",
              padding: "0.75rem 1rem",
              fontFamily: "var(--font-heading)",
              fontSize: "0.95rem",
              fontWeight: isActive ? 700 : 400,
              color: isActive ? "var(--c-content)" : "var(--c-content-muted)",
              transition: "all 200ms ease",
              whiteSpace: "nowrap",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Inline Checkbox row item ─── */
interface InlineCheckProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function InlineCheck({ label, checked, onChange }: InlineCheckProps) {
  const id = React.useId();
  return (
    <label
      htmlFor={id}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        cursor: "pointer",
        userSelect: "none",
        fontFamily: "var(--font-body)",
        fontSize: "0.88rem",
        color: checked ? "var(--c-content)" : "var(--c-content-muted)",
        padding: "0.3rem 0.6rem",
        borderRadius: "6px",
        background: checked
          ? "color-mix(in srgb, var(--c-action) 12%, transparent)"
          : "transparent",
        border: checked
          ? "1px solid color-mix(in srgb, var(--c-action) 35%, transparent)"
          : "1px solid transparent",
        transition: "all 200ms ease",
        whiteSpace: "nowrap",
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: "none" }}
      />
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1.5px solid ${checked ? "var(--c-action)" : "color-mix(in srgb, var(--c-content) 30%, transparent)"}`,
          background: checked ? "var(--c-action)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 200ms ease",
          fontSize: "0.65rem",
          color: "white",
          fontWeight: 700,
        }}
      >
        {checked && "✓"}
      </span>
      {label}
    </label>
  );
}

/* ─── Divider ─── */
const Divider = () => (
  <div
    style={{
      borderBottom: "1.5px solid color-mix(in srgb, var(--c-content) 10%, transparent)",
      margin: "0 0 1.5rem",
    }}
  />
);

/* ─── Main form component ─── */
interface NovoLancamentoFormProps {
  initialType?: TransactionType;
}

function NovoLancamentoForm({ initialType = "despesa" }: NovoLancamentoFormProps) {
  const [type, setType] = React.useState<TransactionType>(initialType);
  const [rendaSubtype, setRendaSubtype] = React.useState<RendaSubtype>("incremento");
  const [isCard, setIsCard] = React.useState(false);
  const [proximaFatura, setProximaFatura] = React.useState(false);
  const [naoEntraDivisao, setNaoEntraDivisao] = React.useState(false);
  const [previsao, setPrevisao] = React.useState(false);
  const [isRecorrente, setIsRecorrente] = React.useState(false);
  const [isParcelado, setIsParcelado] = React.useState(false);
  const [numParcelas, setNumParcelas] = React.useState("");
  const [paraQuem, setParaQuem] = React.useState(PEOPLE[1].value);
  const [atribuirA, setAtribuirA] = React.useState(PEOPLE[0].value);
  const [valor, setValor] = React.useState<number | null>(null);

  const [categories, setCategories] = React.useState<StoryCategory[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [transactions, setTransactions] = React.useState<Transaction[]>(allTransactions);
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().split("T")[0]);

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
    if (!description.trim() || valor === null || valor <= 0) return;

    let categoryLabel = "—";
    if (type === "despesa") {
      const selected = categories.find((cat) => cat.value === selectedCategory);
      categoryLabel = selected ? selected.label : "Outros";
    }

    const formattedDate = date.split("-").reverse().join("/");

    const pills: TransactionTagVariant[] = [];
    if (previsao) pills.push("previsao");
    if (isRecorrente) pills.push("recorrente");
    if (isParcelado) pills.push("parcelado");
    if (type === "despesa" && isCard) {
      pills.push("cartao");
      if (proximaFatura) pills.push("proxima-fatura");
    }

    const newTx: Transaction = {
      avatar: atribuirA === "guilherme" ? "GU" : "AM",
      date: formattedDate,
      description: description.trim(),
      category: categoryLabel,
      amount: valor,
      transactionType: type === "despesa" ? "expense" : "income",
      pills: pills.length > 0 ? pills : undefined,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Reset fields
    setDescription("");
    setValor(null);
    setSelectedCategory("");
  };

  const accent = TYPE_ACCENT[type];

  /* mutual exclusion: Recorrente vs Parcelado */
  const handleRecorrente = (v: boolean) => {
    setIsRecorrente(v);
    if (v) setIsParcelado(false);
  };
  const handleParcelado = (v: boolean) => {
    setIsParcelado(v);
    if (v) setIsRecorrente(false);
  };

  /* reset card state when type changes away from despesa */
  React.useEffect(() => {
    if (type !== "despesa") {
      setIsCard(false);
      setProximaFatura(false);
      setNaoEntraDivisao(false);
    }
  }, [type]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--c-bg)",
        padding: "6rem 2rem 10rem",
        position: "relative",
        fontFamily: "var(--font-body)",
      }}
    >
      <CloudBackground />

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 900, width: "100%", margin: "0 auto" }}>
          <GlassCard
            variant="fino"
            style={{
              padding: "2.5rem",
            }}
          >
            {/* ── Header ── */}
            <h2 style={{ ...panelTitle, marginBottom: "0.75rem" }}>{TITLE_LABEL[type]}</h2>

            <Divider />

            {/* ── Type tab selector ── */}
            <div style={{ marginBottom: "1.5rem" }}>
              <TabSelector
                options={[
                  { value: "despesa", label: "Despesa" },
                  { value: "renda", label: "Renda" },
                  { value: "transferencia", label: "Transferência" },
                ]}
                value={type}
                onChange={(v) => setType(v as TransactionType)}
                accent={accent}
              />
            </div>

            {/* ── Renda sub-type ── */}
            {type === "renda" && (
              <div style={{ marginBottom: "1.5rem" }}>
                <CapsuleRadio
                  options={[
                    { value: "incremento", label: "Incremento (Bônus, 13º salário)" },
                    { value: "decremento", label: "Decremento (Dedução, Estorno)" },
                  ]}
                  value={rendaSubtype}
                  onChange={(v) => setRendaSubtype(v as RendaSubtype)}
                />
              </div>
            )}

            {/* ── Fields ── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* Descrição + Valor */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.25rem" }}>
                <Input
                  label="Descrição"
                  placeholder="Ex: Assinatura Netflix"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Input
                  label="Valor"
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={
                    valor == null
                      ? ""
                      : new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(valor)
                  }
                  onChange={(e) => setValor(parseBrazilianCurrencyToNumber(e.target.value))}
                />
              </div>

              {/* Categoria (despesa only) */}
              {type === "despesa" && (
                <Autocomplete
                  label="Categoria"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categories}
                  pillars={PILLARS}
                  onCreateCategory={handleCreateCategory}
                />
              )}

              {/* Para quem + Data (transferência only) */}
              {type === "transferencia" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <Select
                    label="Para quem"
                    value={paraQuem}
                    onChange={(e) => setParaQuem(e.target.value)}
                    options={PEOPLE.filter((p) => p.value !== atribuirA)}
                  />
                  <Input
                    label="Data de Referência"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              )}

              {/* Checkboxes row — Cartão de Crédito always last; Próxima Fatura inline after it */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.25rem",
                  alignItems: "center",
                }}
              >
                {type === "despesa" && (
                  <InlineCheck
                    label="Não entra na divisão"
                    checked={naoEntraDivisao}
                    onChange={setNaoEntraDivisao}
                  />
                )}
                <InlineCheck label="Previsão" checked={previsao} onChange={setPrevisao} />
                {!isParcelado && (
                  <InlineCheck
                    label="Recorrente"
                    checked={isRecorrente}
                    onChange={handleRecorrente}
                  />
                )}
                {!isRecorrente && (
                  <InlineCheck label="Parcelado" checked={isParcelado} onChange={handleParcelado} />
                )}
                {type === "despesa" && (
                  <>
                    <InlineCheck
                      label="Cartão de Crédito"
                      checked={isCard}
                      onChange={(v) => {
                        setIsCard(v);
                        if (!v) setProximaFatura(false);
                      }}
                    />
                    {isCard && (
                      <InlineCheck
                        label="Próxima Fatura"
                        checked={proximaFatura}
                        onChange={setProximaFatura}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Nº de parcelas (when Parcelado) */}
              {isParcelado && (
                <div style={{ maxWidth: 160 }}>
                  <Input
                    label="Número de parcelas"
                    type="number"
                    min={2}
                    max={72}
                    placeholder="Ex: 12"
                    value={numParcelas}
                    onChange={(e) => setNumParcelas(e.target.value)}
                  />
                </div>
              )}

              {/* Data + Atribuir à */}
              {type === "transferencia" ? (
                <Select
                  label="Atribuir à"
                  value={atribuirA}
                  onChange={(e) => setAtribuirA(e.target.value)}
                  options={PEOPLE}
                />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <Input
                    label="Data"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <Select label="Atribuir à" options={PEOPLE} />
                </div>
              )}
            </div>

            {/* ── Actions ── */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <Button
                variant="outline"
                onClick={() => {
                  setDescription("");
                  setValor(null);
                  setSelectedCategory("");
                }}
              >
                Cancelar
              </Button>
              <Button variant="action" onClick={handleAddTransaction}>
                + {CTA_LABEL[type]}
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* ── Listagem de lançamentos ── */}
        <GlassCard variant="fino" style={{ padding: "1.5rem 2rem" }}>
          <h2 style={{ ...panelTitle, margin: "0 0 0.75rem" }}>Lançamentos</h2>
          <Divider />
          {transactions.map((tx, i) => (
            <TransactionRow
              key={`${tx.description}-${tx.date}-${i}`}
              avatar={tx.avatar}
              description={tx.description}
              category={tx.category}
              date={tx.date}
              amount={tx.amount}
              transactionType={tx.transactionType}
              pills={tx.pills}
              onConfirm={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </GlassCard>
      </div>
    </div>
  );
}

/* ─── Stories ─── */

export const Padrao: Story = {
  render: () => <NovoLancamentoForm initialType="despesa" />,
};
