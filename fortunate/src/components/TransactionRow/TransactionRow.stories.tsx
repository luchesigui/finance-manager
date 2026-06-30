import type { Meta, StoryObj } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { Button } from "../Button/Button";
import { GlassCard } from "../GlassCard/GlassCard";
import { Input, Select } from "../Input/Input";
import { Modal } from "../Modal/Modal";
import type { TransactionTagVariant } from "../TransactionTag/TransactionTag";
import { TransactionRow } from "./TransactionRow";

function parseBrazilianCurrencyToNumber(inputValue: string): number | null {
  const digitsOnly = inputValue.replace(/\D/g, "");
  if (digitsOnly.length === 0) return null;

  const centsValue = Number.parseInt(digitsOnly, 10);
  if (!Number.isFinite(centsValue)) return null;

  return centsValue / 100;
}

// Helper styles for cards inside the recurrent delete modal
const cardButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid color-mix(in srgb, var(--c-content) 12%, transparent)",
  borderRadius: "12px",
  padding: "1.25rem",
  marginBottom: "1rem",
  cursor: "pointer",
  transition: "all 200ms ease",
};

const cardTitleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "1.05rem",
  color: "var(--c-content)",
  marginBottom: "0.25rem",
  fontFamily: "var(--font-heading)",
};

const cardDescStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--c-content-muted)",
  lineHeight: "1.4",
  fontFamily: "var(--font-body)",
};

const handleCardMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.borderColor = "var(--c-action, #e98024)";
  e.currentTarget.style.background = "color-mix(in srgb, var(--c-action, #e98024) 8%, transparent)";
};

const handleCardMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.borderColor = "color-mix(in srgb, var(--c-content) 12%, transparent)";
  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
};

// Inline check helper component for advanced options
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
          border: `1.5px solid ${
            checked ? "var(--c-action)" : "color-mix(in srgb, var(--c-content) 30%, transparent)"
          }`,
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

// Stateful wrapper component for stories
interface InteractiveRowProps {
  avatar: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  transactionType: "expense" | "income";
  pills?: TransactionTagVariant[];
  onConfirm?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function InteractiveRow(props: InteractiveRowProps) {
  const [tx, setTx] = useState<InteractiveRowProps>({
    avatar: props.avatar,
    description: props.description,
    category: props.category,
    date: props.date,
    amount: props.amount,
    transactionType: props.transactionType,
    pills: props.pills || [],
  });

  const [activeModal, setActiveModal] = useState<"edit" | "delete" | "confirm" | null>(null);

  // Form edit states
  const [editDesc, setEditDesc] = useState(tx.description);
  const [editAmount, setEditAmount] = useState<number | null>(tx.amount);
  const [editDate, setEditDate] = useState(tx.date);
  const [editCategory, setEditCategory] = useState(tx.category);
  const [editAvatar, setEditAvatar] = useState(tx.avatar);

  // Flags for pills options
  const [flagPrevisao, setFlagPrevisao] = useState(tx.pills?.includes("previsao") || false);
  const [flagForaDoPadrao, setFlagForaDoPadrao] = useState(
    tx.pills?.includes("fora-do-padrao") || false,
  );
  const [flagCartao, setFlagCartao] = useState(tx.pills?.includes("cartao") || false);
  const [flagProximaFatura, setFlagProximaFatura] = useState(
    tx.pills?.includes("proxima-fatura") || false,
  );
  const [flagRecorrente, setFlagRecorrente] = useState(tx.pills?.includes("recorrente") || false);
  const [flagParcelado, setFlagParcelado] = useState(tx.pills?.includes("parcelado") || false);
  const [flagNaoEntraDivisao, setFlagNaoEntraDivisao] = useState(false);

  // Sync state with props when controls modify it
  useEffect(() => {
    setTx({
      avatar: props.avatar,
      description: props.description,
      category: props.category,
      date: props.date,
      amount: props.amount,
      transactionType: props.transactionType,
      pills: props.pills || [],
    });
    setEditDesc(props.description);
    setEditAmount(props.amount);
    setEditDate(props.date);
    setEditCategory(props.category);
    setEditAvatar(props.avatar);
    setFlagPrevisao(props.pills?.includes("previsao") || false);
    setFlagForaDoPadrao(props.pills?.includes("fora-do-padrao") || false);
    setFlagCartao(props.pills?.includes("cartao") || false);
    setFlagProximaFatura(props.pills?.includes("proxima-fatura") || false);
    setFlagRecorrente(props.pills?.includes("recorrente") || false);
    setFlagParcelado(props.pills?.includes("parcelado") || false);
  }, [
    props.avatar,
    props.description,
    props.category,
    props.date,
    props.amount,
    props.transactionType,
    props.pills,
  ]);

  const handleConfirm = () => {
    setActiveModal("confirm");
  };

  const handleEdit = () => {
    setEditDesc(tx.description);
    setEditAmount(tx.amount);
    setEditDate(tx.date);
    setEditCategory(tx.category);
    setEditAvatar(tx.avatar);
    setFlagPrevisao(tx.pills?.includes("previsao") || false);
    setFlagForaDoPadrao(tx.pills?.includes("fora-do-padrao") || false);
    setFlagCartao(tx.pills?.includes("cartao") || false);
    setFlagProximaFatura(tx.pills?.includes("proxima-fatura") || false);
    setFlagRecorrente(tx.pills?.includes("recorrente") || false);
    setFlagParcelado(tx.pills?.includes("parcelado") || false);
    setActiveModal("edit");
  };

  const handleDelete = () => {
    setActiveModal("delete");
  };

  const executeConfirm = () => {
    setTx((prev) => ({
      ...prev,
      pills: prev.pills?.filter((p) => p !== "previsao"),
    }));
    props.onConfirm?.();
    setActiveModal(null);
  };

  const executeEdit = () => {
    const newPills: TransactionTagVariant[] = [];
    if (flagPrevisao) newPills.push("previsao");
    if (flagForaDoPadrao) newPills.push("fora-do-padrao");
    if (flagCartao) newPills.push("cartao");
    if (flagProximaFatura) newPills.push("proxima-fatura");
    if (flagRecorrente) newPills.push("recorrente");
    if (flagParcelado) newPills.push("parcelado");

    setTx((prev) => ({
      ...prev,
      avatar: editAvatar,
      description: editDesc,
      amount: editAmount ?? 0,
      date: editDate,
      category: editCategory,
      pills: newPills,
    }));
    props.onEdit?.();
    setActiveModal(null);
  };

  const executeDelete = (option: string) => {
    props.onDelete?.();
    alert(`Excluído com a opção: ${option}`);
    setActiveModal(null);
  };

  const isRecorrente = tx.pills?.includes("recorrente");

  return (
    <>
      <TransactionRow
        {...tx}
        onConfirm={props.onConfirm !== undefined ? handleConfirm : undefined}
        onEdit={props.onEdit !== undefined ? handleEdit : undefined}
        onDelete={props.onDelete !== undefined ? handleDelete : undefined}
      />

      {/* ── Confirm Modal ── */}
      <Modal
        open={activeModal === "confirm"}
        onClose={() => setActiveModal(null)}
        title="Confirmar Lançamento"
      >
        <div
          style={{ color: "var(--c-content)", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}
        >
          <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
            Deseja marcar este lançamento previsto como uma transação acontecida? O status passará
            de "Previsão" para "Ocorrido".
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Cancelar
            </Button>
            <Button variant="action" onClick={executeConfirm}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={activeModal === "edit"}
        onClose={() => setActiveModal(null)}
        title="Editar Lançamento"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            color: "var(--c-content)",
          }}
        >
          <Select
            label="Atribuir à"
            value={editAvatar}
            onChange={(e) => setEditAvatar(e.target.value)}
            options={[
              { value: "GU", label: "Guilherme" },
              { value: "AM", label: "Amanda" },
            ]}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.25rem" }}>
            <Input
              label="Descrição"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <Input
              label="Valor"
              type="text"
              inputMode="numeric"
              value={
                editAmount == null
                  ? ""
                  : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      editAmount,
                    )
              }
              onChange={(e) => setEditAmount(parseBrazilianCurrencyToNumber(e.target.value))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Select
              label="Categoria"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              options={[
                { value: "Gastos Essenciais", label: "Gastos Essenciais" },
                { value: "Conforto", label: "Conforto" },
                { value: "Prazeres", label: "Prazeres" },
                { value: "Conhecimento", label: "Conhecimento" },
                { value: "Liberdade Financeira", label: "Liberdade Financeira" },
                { value: "—", label: "Nenhuma" },
              ]}
            />
            <Input
              label="Data"
              type="text"
              placeholder="DD/MM/AAAA"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>

          {/* Options Checkboxes */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              alignItems: "center",
              marginTop: "0.25rem",
            }}
          >
            <InlineCheck
              label="Não entra na divisão"
              checked={flagNaoEntraDivisao}
              onChange={setFlagNaoEntraDivisao}
            />
            <InlineCheck label="Previsão" checked={flagPrevisao} onChange={setFlagPrevisao} />
            {!flagParcelado && (
              <InlineCheck
                label="Recorrente"
                checked={flagRecorrente}
                onChange={(v) => {
                  setFlagRecorrente(v);
                  if (v) setFlagParcelado(false);
                }}
              />
            )}
            {!flagRecorrente && (
              <InlineCheck
                label="Parcelado"
                checked={flagParcelado}
                onChange={(v) => {
                  setFlagParcelado(v);
                  if (v) setFlagRecorrente(false);
                }}
              />
            )}
            <InlineCheck
              label="Cartão de Crédito"
              checked={flagCartao}
              onChange={(v) => {
                setFlagCartao(v);
                if (!v) setFlagProximaFatura(false);
              }}
            />
            {flagCartao && (
              <InlineCheck
                label="Próxima Fatura"
                checked={flagProximaFatura}
                onChange={setFlagProximaFatura}
              />
            )}
          </div>

          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}
          >
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Cancelar
            </Button>
            <Button variant="action" onClick={executeEdit}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal
        open={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        title={isRecorrente ? "Excluir Recorrente" : "Excluir Lançamento"}
      >
        <div
          style={{ color: "var(--c-content)", fontFamily: "var(--font-body)", fontSize: "0.95rem" }}
        >
          {isRecorrente ? (
            <div>
              <p
                style={{
                  marginBottom: "1.5rem",
                  color: "var(--c-content-muted)",
                  fontSize: "0.95rem",
                }}
              >
                O que deseja fazer com este lançamento recorrente?
              </p>

              {/* Option 1: Apenas este lançamento */}
              <button
                type="button"
                style={cardButtonStyle}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => executeDelete("apenas-este")}
              >
                <div style={cardTitleStyle}>Apenas este lançamento</div>
                <div style={cardDescStyle}>
                  Exclui apenas este lançamento específico. As outras ocorrências não serão
                  alteradas.
                </div>
              </button>

              {/* Option 2: Só daqui pra frente */}
              <button
                type="button"
                style={cardButtonStyle}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => executeDelete("daqui-pra-frente")}
              >
                <div style={cardTitleStyle}>Só daqui pra frente</div>
                <div style={cardDescStyle}>
                  Desativa o modelo e remove ocorrências em meses abertos. Meses já fechados
                  permanecem como estão.
                </div>
              </button>

              {/* Option 3: Todo o histórico */}
              <button
                type="button"
                style={cardButtonStyle}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => executeDelete("todo-historico")}
              >
                <div style={cardTitleStyle}>Todo o histórico</div>
                <div style={cardDescStyle}>
                  Desativa o template. Em meses já fechados os lançamentos são apenas desvinculados
                  (valores mantidos). Em meses abertos os lançamentos são excluídos.
                </div>
              </button>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <Button
                  variant="outline"
                  onClick={() => setActiveModal(null)}
                  style={{ width: "100%", padding: "0.75rem" }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
                Tem certeza que deseja remover este gasto? Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <Button variant="outline" onClick={() => setActiveModal(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="action"
                  onClick={() => executeDelete("normal")}
                  style={{
                    background: "var(--status-negative, #E05C5C)",
                    borderColor: "var(--status-negative, #E05C5C)",
                  }}
                >
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

const meta = {
  title: "Design System/TransactionRow",
  component: TransactionRow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    avatar: { control: "text", description: "Iniciais do avatar" },
    description: { control: "text", description: "Descrição da transação" },
    category: { control: "text", description: "Categoria da transação" },
    date: { control: "text", description: "Data" },
    amount: { control: "number", description: "Valor numérico" },
    transactionType: {
      control: "inline-radio",
      options: ["expense", "income"],
      description: "Tipo de transação",
    },
    pills: {
      control: "inline-check",
      options: [
        "previsao",
        "fora-do-padrao",
        "cartao",
        "proxima-fatura",
        "recorrente",
        "parcelado",
      ],
      description: "Tags/Pills de status",
    },
    onConfirm: { action: "onConfirm", description: "Callback ao confirmar" },
    onEdit: { action: "onEdit", description: "Callback ao editar" },
    onDelete: { action: "onDelete", description: "Callback ao excluir" },
  },
  args: {
    avatar: "GU",
    description: "Marmita Livup",
    category: "Gastos Essenciais",
    date: "31/07/2026",
    amount: 1000.0,
    transactionType: "expense",
  },
} satisfies Meta<typeof TransactionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simples: Story = {
  args: {
    avatar: "GU",
    description: "Amazon Prime",
    category: "Conforto",
    date: "28/06/2026",
    amount: 20.0,
    transactionType: "expense",
    onConfirm: undefined,
  },
  render: (args) => (
    <GlassCard variant="fino" style={{ padding: "1.5rem 2rem", width: 640 }}>
      <InteractiveRow {...args} />
    </GlassCard>
  ),
};

export const ComPills: Story = {
  args: {
    avatar: "GU",
    description: "Marmita Livup",
    category: "Gastos Essenciais",
    date: "31/07/2026",
    amount: 1000.0,
    transactionType: "expense",
    pills: ["previsao", "fora-do-padrao"],
  },
  render: (args) => (
    <GlassCard variant="fino" style={{ padding: "1.5rem 2rem", width: 640 }}>
      <InteractiveRow {...args} />
    </GlassCard>
  ),
};

export const ListaCompleta: Story = {
  render: () => (
    <GlassCard variant="fino" style={{ padding: "1.5rem 2rem", width: 700 }}>
      <InteractiveRow
        avatar="GU"
        description="Marmita Livup"
        category="Gastos Essenciais"
        date="31/07/2026"
        amount={1000.0}
        transactionType="expense"
        pills={["previsao", "fora-do-padrao"]}
        onConfirm={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <InteractiveRow
        avatar="GU"
        description="Amazon Prime"
        category="Conforto"
        date="28/06/2026"
        amount={20.0}
        transactionType="expense"
        pills={["cartao"]}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <InteractiveRow
        avatar="GU"
        description="Salário — Junho"
        category="—"
        date="27/06/2026"
        amount={12000.0}
        transactionType="income"
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <InteractiveRow
        avatar="GU"
        description="Mensalidade Academia"
        category="Conforto"
        date="26/06/2026"
        amount={89.9}
        transactionType="expense"
        pills={["cartao", "recorrente"]}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <InteractiveRow
        avatar="GU"
        description="Curso de Investimentos"
        category="Conhecimento"
        date="25/06/2026"
        amount={297.0}
        transactionType="expense"
        pills={["parcelado"]}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      <InteractiveRow
        avatar="GU"
        description="Netflix"
        category="Prazeres"
        date="29/06/2026"
        amount={55.9}
        transactionType="expense"
        pills={["cartao", "proxima-fatura"]}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </GlassCard>
  ),
};
