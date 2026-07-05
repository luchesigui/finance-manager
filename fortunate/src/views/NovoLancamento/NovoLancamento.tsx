"use client";

import clsx from "clsx";
import React from "react";
import { Autocomplete } from "../../components/Autocomplete/Autocomplete";
import { Button } from "../../components/Button/Button";
import { CloudBackground } from "../../components/CloudBackground/CloudBackground";
import { GlassCard } from "../../components/GlassCard/GlassCard";
import { CapsuleRadio, Input, Select } from "../../components/Input/Input";
import { Modal } from "../../components/Modal/Modal";
import { TabSelector } from "../../components/TabSelector/TabSelector";
import { useToast } from "../../components/Toast/ToastProvider";
import { TransactionRow } from "../../components/TransactionRow/TransactionRow";
import type { TransactionTagVariant } from "../../components/TransactionTag/TransactionTag";
import {
  confirmTransaction,
  createCategory,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../../hooks/mutations";
import { useCategories } from "../../hooks/useCategories";
import { useSettings } from "../../hooks/useSettings";
import { useTransactions } from "../../hooks/useTransactions";
import { useUsers } from "../../hooks/useUsers";
import type { RecurrenceOption } from "../../lib/types";
import { formatBrlCurrency, parseBrazilianCurrencyToNumber } from "../../utils/currency";
import {
  PILLAR_NAMES,
  PILLAR_NAME_TO_SLUG,
  PILLAR_SLUGS,
  type PillarSlug,
} from "../../utils/pillars";
import styles from "./NovoLancamento.module.css";

interface Transaction {
  id: string;
  avatar: string;
  date: string;
  rawDate: string;
  description: string;
  category: string;
  amount: number;
  transactionType: "expense" | "income" | "transfer";
  pills?: TransactionTagVariant[];
  isPrevisao: boolean;
  recurrenceTemplateId?: string | null;
  isCreditCard: boolean;
  isRecorrente: boolean;
  assignedToUserId: string;
  pillar?: string;
  categoryId?: string | null;
}

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

const PILLARS = PILLAR_SLUGS.map((slug) => PILLAR_NAMES[slug]);

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
      className={clsx(styles.inlineCheck, { [styles.inlineCheckActive]: checked })}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.inlineCheckInput}
      />
      <span
        className={clsx(styles.inlineCheckIndicator, {
          [styles.inlineCheckIndicatorActive]: checked,
        })}
      >
        {checked && "✓"}
      </span>
      {label}
    </label>
  );
}

/* ─── Main form component ─── */
interface NovoLancamentoProps {
  initialType?: TransactionType;
}

export function NovoLancamento({ initialType = "despesa" }: NovoLancamentoProps) {
  const [type, setType] = React.useState<TransactionType>(initialType);
  const [rendaSubtype, setRendaSubtype] = React.useState<RendaSubtype>("incremento");
  const [isCard, setIsCard] = React.useState(false);
  const [proximaFatura, setProximaFatura] = React.useState(false);
  const [naoEntraDivisao, setNaoEntraDivisao] = React.useState(false);
  const [previsao, setPrevisao] = React.useState(false);
  const [isRecorrente, setIsRecorrente] = React.useState(false);
  const [isParcelado, setIsParcelado] = React.useState(false);
  const [numParcelas, setNumParcelas] = React.useState("");
  const [paraQuem, setParaQuem] = React.useState("");
  const [atribuirA, setAtribuirA] = React.useState("");
  const [valor, setValor] = React.useState<number | null>(null);

  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().split("T")[0]);

  const toast = useToast();

  // Edit and Delete Recurrence States
  const [editingTx, setEditingTx] = React.useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = React.useState<Transaction | null>(null);
  const [showEditRecurrenceModal, setShowEditRecurrenceModal] = React.useState(false);

  // Views and Filters States
  const [activeView, setActiveView] = React.useState<"expense" | "income" | "transfer">("expense");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterAssigned, setFilterAssigned] = React.useState("todos");
  const [filterCategory, setFilterCategory] = React.useState("todas");
  const [filterPillar, setFilterPillar] = React.useState("todos");
  const [filterCardOnly, setFilterCardOnly] = React.useState(false);
  const [filterRecurringOnly, setFilterRecurringOnly] = React.useState(false);

  const handleViewChange = (view: "expense" | "income" | "transfer") => {
    setActiveView(view);
    setFilterCategory("todas");
    setFilterPillar("todos");
    setFilterCardOnly(false);
  };

  const currentMonthStr = React.useMemo(() => date.slice(0, 7), [date]);

  const { transactions: dbTxs } = useTransactions(currentMonthStr);
  const { categories: dbCategories } = useCategories();
  const { users } = useUsers();
  const { settings } = useSettings();

  const people = React.useMemo(() => users.map((u) => ({ value: u.id, label: u.name })), [users]);

  // Inicializa "Atribuir à" com o pagador padrão e "Para quem" com o outro participante
  React.useEffect(() => {
    if (!atribuirA && users.length > 0) {
      setAtribuirA(settings?.defaultPayerId ?? users[0].id);
    }
  }, [users, settings, atribuirA]);

  React.useEffect(() => {
    if (!paraQuem && atribuirA && users.length > 1) {
      const other = users.find((u) => u.id !== atribuirA);
      if (other) setParaQuem(other.id);
    }
  }, [users, atribuirA, paraQuem]);

  const categories = React.useMemo(
    () =>
      dbCategories.map((c) => ({
        value: c.id,
        label: c.name,
        pillar: PILLAR_NAMES[c.pillarSlug as PillarSlug] || "Outros",
      })),
    [dbCategories],
  );

  const transactions = React.useMemo(() => {
    return dbTxs.map((tx): Transaction => {
      const displayDate = tx.date.split("-").reverse().join("/");
      const pills: TransactionTagVariant[] = [];
      if (tx.isPrevisao) pills.push("previsao");
      if (tx.recurrenceTemplateId) pills.push("recorrente");
      if (tx.isParcelado) pills.push("parcelado");
      if (tx.isCreditCard) pills.push("cartao");
      if (tx.nextInvoice) pills.push("proxima-fatura");

      const matchedCategory = categories.find((c) => c.value === tx.categoryId);
      const assignedUser = users.find((u) => u.id === tx.assignedToUserId);

      return {
        id: tx.id,
        avatar: assignedUser?.avatarInitials ?? "?",
        date: displayDate,
        rawDate: tx.date,
        description: tx.description,
        category: matchedCategory ? matchedCategory.label : "—",
        amount: tx.amount / 100, // cents to float
        transactionType: tx.transactionType as "expense" | "income" | "transfer",
        pills: pills.length > 0 ? pills : undefined,
        isPrevisao: !!tx.isPrevisao,
        recurrenceTemplateId: tx.recurrenceTemplateId,
        isCreditCard: !!tx.isCreditCard,
        isRecorrente: !!tx.recurrenceTemplateId || !!tx.isRecorrente,
        assignedToUserId: tx.assignedToUserId,
        pillar: matchedCategory ? matchedCategory.pillar : undefined,
        categoryId: tx.categoryId,
      };
    });
  }, [dbTxs, categories, users]);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // 1. View / Type filter
      if (tx.transactionType !== activeView) return false;

      // 2. Search term (description case-insensitive)
      if (searchTerm && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // 3. Assigned to filter
      if (filterAssigned !== "todos" && tx.assignedToUserId !== filterAssigned) {
        return false;
      }

      // Contextual filters (only for despesa / expense view)
      if (activeView === "expense") {
        // 4. Category filter
        if (filterCategory !== "todas" && tx.categoryId !== filterCategory) {
          return false;
        }

        // 5. Pillar filter
        if (filterPillar !== "todos" && tx.pillar !== filterPillar) {
          return false;
        }

        // 6. Credit card filter
        if (filterCardOnly && !tx.isCreditCard) {
          return false;
        }
      }

      // 7. Recurring filter
      if (filterRecurringOnly && !tx.isRecorrente) {
        return false;
      }

      return true;
    });
  }, [
    transactions,
    activeView,
    searchTerm,
    filterAssigned,
    filterCategory,
    filterPillar,
    filterCardOnly,
    filterRecurringOnly,
  ]);

  const contextSum = React.useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      if (activeView === "expense" && tx.isPrevisao) {
        return acc;
      }
      return acc + tx.amount;
    }, 0);
  }, [filteredTransactions, activeView]);

  const handleCreateCategory = async (name: string, pillar: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard accent removal after normalization
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

    const pillarSlug = PILLAR_NAME_TO_SLUG[pillar] || "conforto";

    try {
      const result = await createCategory(name, slug, pillarSlug);
      setSelectedCategory(result.id);
    } catch (err) {
      console.error("Error creating category", err);
      toast({ variant: "error", title: "Erro ao criar categoria" });
    }
  };

  const handleCancel = () => {
    setDescription("");
    setValor(null);
    setSelectedCategory("");
    setEditingTx(null);
    setIsRecorrente(false);
    setIsParcelado(false);
    setNumParcelas("");
    setIsCard(false);
    setProximaFatura(false);
    setNaoEntraDivisao(false);
    setPrevisao(false);
  };

  const handleAddTransaction = async () => {
    if (!description.trim() || valor === null || valor <= 0) return;

    let categoryId = null;
    if (type === "despesa") {
      categoryId = selectedCategory || null;
    }

    try {
      await createTransaction({
        description: description.trim(),
        amount: Math.round(valor * 100), // convert to cents
        categoryId,
        date,
        assignedToUserId: atribuirA || null,
        paraQuemUserId: type === "transferencia" ? paraQuem || null : null,
        isCreditCard: type === "despesa" && isCard,
        nextInvoice: type === "despesa" && isCard && proximaFatura,
        naoEntraDivisao: type === "despesa" && naoEntraDivisao,
        isPrevisao: previsao,
        isRecorrente: isRecorrente,
        isParcelado: isParcelado,
        numParcelas: isParcelado && numParcelas ? Number.parseInt(numParcelas, 10) : null,
        transactionType: type === "despesa" ? "expense" : type === "renda" ? "income" : "transfer",
      });
      handleCancel();
    } catch (err) {
      console.error("Error adding transaction", err);
      toast({ variant: "error", title: "Erro ao adicionar lançamento" });
    }
  };

  const handleSaveClick = () => {
    if (!editingTx) return;

    if (editingTx.recurrenceTemplateId) {
      // It is a recurring transaction, ask user how to apply changes
      setShowEditRecurrenceModal(true);
    } else {
      // Non-recurring transaction, update directly
      submitEdit("only_this");
    }
  };

  const submitEdit = async (option: RecurrenceOption) => {
    if (!editingTx || valor === null) return;

    let categoryId = null;
    if (type === "despesa") {
      categoryId = selectedCategory || null;
    }

    try {
      await updateTransaction(
        editingTx.id,
        {
          description: description.trim(),
          amount: Math.round(valor * 100),
          categoryId,
          date,
          assignedToUserId: atribuirA || undefined,
          paraQuemUserId: type === "transferencia" ? paraQuem || null : null,
          isCreditCard: type === "despesa" && isCard,
          nextInvoice: type === "despesa" && isCard && proximaFatura,
          naoEntraDivisao: type === "despesa" && naoEntraDivisao,
          isPrevisao: previsao,
          transactionType:
            type === "despesa" ? "expense" : type === "renda" ? "income" : "transfer",
        },
        option,
      );
      handleCancel();
      setShowEditRecurrenceModal(false);
    } catch (err) {
      console.error("Error updating transaction", err);
      toast({ variant: "error", title: "Erro ao salvar alterações" });
    }
  };

  const handleConfirmTransaction = async (id: string) => {
    try {
      await confirmTransaction(id);
    } catch (err) {
      console.error("Error confirming transaction", err);
      toast({ variant: "error", title: "Erro ao confirmar lançamento" });
    }
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTx(tx);
    setType(
      tx.transactionType === "income"
        ? "renda"
        : tx.transactionType === "expense"
          ? "despesa"
          : "transferencia",
    );
    setDescription(tx.description);
    setValor(tx.amount);
    setDate(tx.rawDate);
    setAtribuirA(tx.assignedToUserId);
    setSelectedCategory(tx.categoryId ?? "");

    setIsRecorrente(tx.pills?.includes("recorrente") || false);
    setIsParcelado(tx.pills?.includes("parcelado") || false);
    setIsCard(tx.pills?.includes("cartao") || false);
    setProximaFatura(tx.pills?.includes("proxima-fatura") || false);
    setPrevisao(tx.isPrevisao);
  };

  const handleDeleteClick = (tx: Transaction) => {
    if (tx.recurrenceTemplateId) {
      // It is a recurring transaction, show selection dialog
      setDeletingTx(tx);
    } else {
      // Single transaction, delete directly
      setDeletingTx(tx); // Set so submitDelete knows what to delete
      setTimeout(() => submitDelete("only_this", tx.id), 0);
    }
  };

  const submitDelete = async (option: RecurrenceOption, explicitId?: string) => {
    const txId = explicitId || (deletingTx ? deletingTx.id : null);
    if (!txId) return;

    try {
      await deleteTransaction(txId, option);
      setDeletingTx(null);
    } catch (err) {
      console.error("Error deleting transaction", err);
      toast({ variant: "error", title: "Erro ao excluir lançamento" });
    }
  };

  const accent = TYPE_ACCENT[type];
  const tabValues: TransactionType[] = ["despesa", "renda", "transferencia"];
  const activeTabIndex = tabValues.indexOf(type);

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
    <div className={styles.container}>
      <CloudBackground />

      <div className={styles.content}>
        <div className={styles.formWrapper}>
          <GlassCard variant="fino" className={styles.formCard}>
            {/* ── Header ── */}
            <h2 className={styles.panelTitle}>
              {editingTx ? `Editando Lançamento: ${editingTx.description}` : TITLE_LABEL[type]}
            </h2>

            {/* ── Type tab selector ── */}
            <div className={styles.tabSelectorWrapper}>
              <TabSelector
                tabs={[
                  { label: "Despesa", color: TYPE_ACCENT.despesa },
                  { label: "Renda", color: TYPE_ACCENT.renda },
                  { label: "Transferência", color: TYPE_ACCENT.transferencia },
                ]}
                value={activeTabIndex}
                onChange={(idx) => setType(tabValues[idx])}
              />
            </div>

            {/* ── Renda sub-type ── */}
            {type === "renda" && (
              <div className={styles.checkboxesRow}>
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
            <div className={styles.fieldsContainer}>
              {/* Descrição + Valor */}
              <div className={styles.grid15to1}>
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
                  value={valor == null ? "" : formatBrlCurrency(valor)}
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
                <div className={styles.grid1to1}>
                  <Select
                    label="Para quem"
                    value={paraQuem}
                    onChange={(e) => setParaQuem(e.target.value)}
                    options={people.filter((p) => p.value !== atribuirA)}
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
              <div className={styles.checkboxesRow}>
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
                <div className={styles.parcelasWrapper}>
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
                  options={people}
                />
              ) : (
                <div className={styles.grid1to1}>
                  <Input
                    label="Data"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <Select
                    label="Atribuir à"
                    value={atribuirA}
                    onChange={(e) => setAtribuirA(e.target.value)}
                    options={people}
                  />
                </div>
              )}
            </div>

            {/* ── Actions ── */}
            <div className={styles.actionsRow}>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              {editingTx ? (
                <Button variant="action" onClick={handleSaveClick}>
                  Salvar Alterações
                </Button>
              ) : (
                <Button variant="action" onClick={handleAddTransaction}>
                  + {CTA_LABEL[type]}
                </Button>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ── Listagem de lançamentos ── */}
        <GlassCard variant="fino" className={styles.listCard}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>Lançamentos</h2>

            {/* Search Bar */}
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* View Tab Selector */}
          <div className={styles.viewTabsRow}>
            <TabSelector
              tabs={[
                { label: "Despesas", color: TYPE_ACCENT.despesa },
                { label: "Rendas", color: TYPE_ACCENT.renda },
                { label: "Transferências", color: TYPE_ACCENT.transferencia },
              ]}
              value={["expense", "income", "transfer"].indexOf(activeView)}
              onChange={(idx) => {
                const views: ("expense" | "income" | "transfer")[] = [
                  "expense",
                  "income",
                  "transfer",
                ];
                handleViewChange(views[idx]);
              }}
            />
          </div>

          {/* Filters Bar */}
          <div className={styles.filtersBar}>
            {/* Atribuído a (Household Filter) */}
            {people.length > 1 && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Atribuído a</label>
                <select
                  value={filterAssigned}
                  onChange={(e) => setFilterAssigned(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="todos">Todos</option>
                  {people.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Categorias (only for despesas) */}
            {activeView === "expense" && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Categoria</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="todas">Todas</option>
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pilares (only for despesas) */}
            {activeView === "expense" && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Pilar</label>
                <select
                  value={filterPillar}
                  onChange={(e) => setFilterPillar(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="todos">Todos</option>
                  {PILLARS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Checkbox/Pill Filters */}
            <div className={styles.filterToggles}>
              {activeView === "expense" && (
                <button
                  type="button"
                  onClick={() => setFilterCardOnly(!filterCardOnly)}
                  className={clsx(styles.filterPill, {
                    [styles.filterPillActive]: filterCardOnly,
                  })}
                >
                  💳 Apenas Cartão
                </button>
              )}

              <button
                type="button"
                onClick={() => setFilterRecurringOnly(!filterRecurringOnly)}
                className={clsx(styles.filterPill, {
                  [styles.filterPillActive]: filterRecurringOnly,
                })}
              >
                🔄 Apenas Recorrentes
              </button>
            </div>
          </div>

          <hr className={styles.listSeparator} />

          {/* List Content */}
          {transactions.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--c-content-muted)", padding: "1.5rem" }}>
              Nenhum lançamento cadastrado para este mês.
            </p>
          ) : filteredTransactions.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--c-content-muted)", padding: "1.5rem" }}>
              Nenhum lançamento encontrado para os filtros selecionados.
            </p>
          ) : (
            <div className={styles.transactionsWrapper}>
              <div className={styles.transactionsList}>
                {filteredTransactions.map((tx) => {
                  return (
                    <TransactionRow
                      key={tx.id}
                      avatar={tx.avatar}
                      description={tx.description}
                      category={tx.category}
                      date={tx.date}
                      amount={tx.amount}
                      transactionType={tx.transactionType}
                      pills={tx.pills}
                      onConfirm={() => handleConfirmTransaction(tx.id)}
                      onEdit={() => handleEditClick(tx)}
                      onDelete={() => handleDeleteClick(tx)}
                    />
                  );
                })}
              </div>

              {/* Sum Row */}
              <div className={styles.sumRow}>
                <span className={styles.sumLabel}>Total do Contexto:</span>
                <span
                  className={clsx(styles.sumAmount, {
                    [styles.sumExpense]: activeView === "expense",
                    [styles.sumIncome]: activeView === "income",
                    [styles.sumTransfer]: activeView === "transfer",
                  })}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(activeView === "expense" ? -contextSum : contextSum)}
                </span>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── Modais de Confirmação de Recorrência ── */}

      {/* Delete Choice Modal */}
      <Modal
        open={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        title="Excluir Transação Recorrente"
      >
        <p className={styles.modalDescription}>
          Esta é uma transação recorrente de <strong>{deletingTx?.description}</strong>. Como você
          gostaria de realizar a exclusão?
        </p>
        <div className={styles.modalButtons}>
          <Button variant="action" onClick={() => submitDelete("only_this")}>
            Excluir apenas esta ocorrência
          </Button>
          <Button variant="action" onClick={() => submitDelete("future")}>
            Excluir esta e todas as futuras
          </Button>
          <Button variant="outline" onClick={() => submitDelete("all")}>
            Excluir todo o histórico (passado e futuro)
          </Button>
          <Button variant="outline" onClick={() => setDeletingTx(null)}>
            Cancelar
          </Button>
        </div>
      </Modal>

      {/* Edit Choice Modal */}
      <Modal
        open={showEditRecurrenceModal}
        onClose={() => setShowEditRecurrenceModal(false)}
        title="Editar Transação Recorrente"
      >
        <p className={styles.modalDescription}>
          Você está editando a transação recorrente <strong>{editingTx?.description}</strong>. Como
          deseja aplicar essas alterações?
        </p>
        <div className={styles.modalButtons}>
          <Button variant="action" onClick={() => submitEdit("only_this")}>
            Aplicar apenas a esta ocorrência
          </Button>
          <Button variant="action" onClick={() => submitEdit("future")}>
            Aplicar a esta e todas as futuras
          </Button>
          <Button variant="outline" onClick={() => submitEdit("all")}>
            Aplicar a todo o histórico (passado e futuro)
          </Button>
          <Button variant="outline" onClick={() => setShowEditRecurrenceModal(false)}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
