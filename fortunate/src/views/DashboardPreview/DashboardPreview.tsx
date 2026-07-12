"use client";

import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { Autocomplete } from "../../components/Autocomplete/Autocomplete";
import { Button } from "../../components/Button/Button";
import { CloudBackground } from "../../components/CloudBackground/CloudBackground";
import { GlassCard } from "../../components/GlassCard/GlassCard";
import { ArrowLeft, ArrowRight } from "../../components/Icons";
import { Input, Toggle } from "../../components/Input/Input";
import { Modal } from "../../components/Modal/Modal";
import { PilarCard } from "../../components/PilarCard/PilarCard";
import { TabSelector } from "../../components/TabSelector/TabSelector";
import { useToast } from "../../components/Toast/ToastProvider";
import { TransactionRow } from "../../components/TransactionRow/TransactionRow";
import type { TransactionTagVariant } from "../../components/TransactionTag/TransactionTag";
import { TransferCard } from "../../components/TransferCard/TransferCard";
import { TrendBadge } from "../../components/TrendBadge/TrendBadge";
import {
  confirmTransaction,
  createCategory,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../../hooks/mutations";
import { useCategories } from "../../hooks/useCategories";
import { useCurrentMonth } from "../../hooks/useCurrentMonth";
import { useSettings } from "../../hooks/useSettings";
import { useReserves } from "../../hooks/useReserves";
import { useTransactions } from "../../hooks/useTransactions";
import { useUsers } from "../../hooks/useUsers";
import type { RecurrenceOption } from "../../lib/types";
import {
  DEFAULT_PILLAR_TARGETS,
  PILLAR_NAMES,
  PILLAR_NAME_TO_SLUG,
  PILLAR_SLUGS,
  PILLAR_SLUG_TO_PILAR_KEY,
  type PillarSlug,
} from "../../utils/pillars";
import styles from "./DashboardPreview.module.css";

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
  nextInvoice: boolean;
  assignedToUserId: string;
  pillar?: string;
  categoryId?: string | null;
  ignored: boolean;
  pending?: boolean;
}

const TYPE_ACCENT = {
  despesa: "var(--status-negative, #E05C5C)",
  renda: "var(--status-positive, #4CAF82)",
  transferencia: "var(--c-action, #E98024)",
};

const PILLARS = PILLAR_SLUGS.map((slug) => PILLAR_NAMES[slug]);

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function DashboardPreview() {
  const router = useRouter();
  const { currentDate, currentMonthStr, monthLabel, handlePrevMonth, handleNextMonth } =
    useCurrentMonth();
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");

  const toast = useToast();

  const [includeFuture, setIncludeFuture] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("fortunate_include_future");
    if (saved !== null) {
      setIncludeFuture(saved === "true");
    }
  }, []);

  const handleToggleIncludeFuture = (val: boolean) => {
    setIncludeFuture(val);
    localStorage.setItem("fortunate_include_future", String(val));
  };

  const todayStr = React.useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const padZero = (n: number) => n.toString().padStart(2, "0");
  const { transactions: dbTxs } = useTransactions(currentMonthStr);
  const { reserves } = useReserves(currentMonthStr);
  const { categories } = useCategories();
  const { users } = useUsers();
  const { settings } = useSettings();

  const pillars = PILLAR_SLUGS.map((slug) => PILLAR_NAMES[slug]);

  // Views and Filters States
  const searchParams = useSearchParams();
  const pilarParam = searchParams ? searchParams.get("pilar") : null;

  const [activeView, setActiveView] = React.useState<"expense" | "income" | "transfer">("expense");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterAssigned, setFilterAssigned] = React.useState("todos");
  const [filterCategory, setFilterCategory] = React.useState("todas");
  const [filterPillar, setFilterPillar] = React.useState("todos");
  const [filterCardOnly, setFilterCardOnly] = React.useState(false);
  const [filterRecurringOnly, setFilterRecurringOnly] = React.useState(false);

  // Delete Recurrence State
  const [deletingTx, setDeletingTx] = React.useState<Transaction | null>(null);

  const handleViewChange = (view: "expense" | "income" | "transfer") => {
    setActiveView(view);
    setFilterCategory("todas");
    setFilterPillar("todos");
    setFilterCardOnly(false);
  };

  const people = React.useMemo(() => users.map((u) => ({ value: u.id, label: u.name })), [users]);

  const handleCreateCategory = async (name: string, pillarName: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard accent removal after normalization
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

    const pillarSlug = PILLAR_NAME_TO_SLUG[pillarName] || "conforto";

    try {
      const result = await createCategory(name, slug, pillarSlug);
      setSelectedCategory(result.id);
    } catch (err) {
      console.error("Error creating category", err);
      toast({ variant: "error", title: "Erro ao criar categoria" });
    }
  };

  const handleAddTransaction = async () => {
    if (!description.trim() || !amount.trim()) return;
    const parsedAmount = Number.parseFloat(amount.replace(",", "."));
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    // Usa ano/mês selecionados e o dia atual
    const day = padZero(new Date().getDate());
    const dateStr = `${currentDate.getFullYear()}-${padZero(currentDate.getMonth() + 1)}-${day}`;

    try {
      await createTransaction({
        description: description.trim(),
        amount: Math.round(parsedAmount * 100), // cents
        categoryId: selectedCategory || null,
        date: dateStr,
        assignedToUserId: settings?.defaultPayerId ?? null,
        transactionType: "expense",
      });
      setDescription("");
      setAmount("");
      setSelectedCategory("");
    } catch (err) {
      console.error("Error adding transaction", err);
      toast({ variant: "error", title: "Erro ao inserir lançamento" });
    }
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

  const handleConfirmTransaction = async (id: string) => {
    try {
      await confirmTransaction(id);
    } catch (err) {
      console.error("Error confirming transaction", err);
      toast({ variant: "error", title: "Erro ao confirmar lançamento" });
    }
  };

  const handleToggleIgnore = async (tx: Transaction) => {
    try {
      await updateTransaction(tx.id, { ignored: !tx.ignored }, "only_this");
    } catch (err) {
      console.error("Error toggling ignore status", err);
      toast({ variant: "error", title: "Erro ao alterar visibilidade do lançamento" });
    }
  };

  const handleEditClick = (tx: Transaction) => {
    // Navigate to releases page so user can edit there
    router.push("/lancamentos");
  };

  const metasTotal = React.useMemo(() => {
    return reserves
      .filter((r) => r.type === "goal")
      .reduce((acc, r) => acc + r.currentAmount / 100, 0);
  }, [reserves]);

  const metasRolling = React.useMemo(() => {
    const rangeStart = Math.floor(metasTotal / 10000) * 10000;
    const rangeEnd = rangeStart + 10000;
    return { rangeStart, rangeEnd };
  }, [metasTotal]);

  // Cálculos financeiros do mês
  const stats = React.useMemo(() => {
    let totalIncomes = 0;
    let totalExpenses = 0;
    let totalInvested = 0;

    const pilarUsed: Record<PillarSlug, number> = {
      essenciais: 0,
      conforto: 0,
      prazeres: 0,
      conhecimento: 0,
      planejamento: 0,
      liberdade: 0,
    };

    const pilarForecasted: Record<PillarSlug, number> = {
      essenciais: 0,
      conforto: 0,
      prazeres: 0,
      conhecimento: 0,
      planejamento: 0,
      liberdade: 0,
    };

    // Divisão de gastos do casal, por usuário
    const incomeByUser: Record<string, number> = {};
    const paidSharedByUser: Record<string, number> = {};
    const transferPaidByPair: Record<string, number> = {};
    for (const user of users) {
      incomeByUser[user.id] = 0;
      paidSharedByUser[user.id] = 0;
    }

    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    for (const tx of dbTxs) {
      if (tx.ignored) {
        continue;
      }
      const isFutureOrForecast = !!tx.isPrevisao || tx.date > todayStr;
      if (isFutureOrForecast && !includeFuture) continue;
      const amountFloat = tx.amount / 100;
      const isForecast = tx.isPrevisao || tx.date > todayStr;

      if (tx.isPrevisao) {
        // Apenas para as previsões de gastos, somamos no forecast
        if (tx.transactionType === "expense") {
          const cat = categories.find((c) => c.id === tx.categoryId);
          const pilarSlug = (tx.pillarSlug || cat?.pillarSlug || "conforto") as PillarSlug;
          if (pilarSlug in pilarForecasted) {
            pilarForecasted[pilarSlug] += amountFloat;
          }
        }
        continue;
      }

      if (tx.transactionType === "income") {
        totalIncomes += amountFloat;
        if (tx.assignedToUserId in incomeByUser) {
          incomeByUser[tx.assignedToUserId] += amountFloat;
        }
      } else if (tx.transactionType === "expense") {
        totalExpenses += amountFloat;

        const cat = categories.find((c) => c.id === tx.categoryId);
        const pilarSlug = (tx.pillarSlug || cat?.pillarSlug || "conforto") as PillarSlug;

        if (isForecast) {
          if (pilarSlug in pilarForecasted) {
            pilarForecasted[pilarSlug] += amountFloat;
          }
        } else {
          if (pilarSlug in pilarUsed) {
            pilarUsed[pilarSlug] += amountFloat;
          }
          if (pilarSlug in pilarForecasted) {
            pilarForecasted[pilarSlug] += amountFloat;
          }
        }

        if (pilarSlug === "liberdade") {
          totalInvested += amountFloat;
        }

        if (!tx.naoEntraDivisao && tx.assignedToUserId in paidSharedByUser) {
          paidSharedByUser[tx.assignedToUserId] += amountFloat;
        }
      } else if (tx.transactionType === "transfer" && tx.assignedToUserId && tx.paraQuemUserId) {
        const pairKey = `${tx.assignedToUserId}->${tx.paraQuemUserId}`;
        transferPaidByPair[pairKey] = (transferPaidByPair[pairKey] ?? 0) + amountFloat;
      }
    }

    // Metas por pilar: percentuais das settings aplicados sobre a renda do mês
    const baseIncome = totalIncomes || 12000;
    const pillarTargets = settings?.pillarTargets ?? DEFAULT_PILLAR_TARGETS;
    const targetValues = Object.fromEntries(
      PILLAR_SLUGS.map((slug) => [slug, (baseIncome * pillarTargets[slug]) / 100]),
    ) as Record<PillarSlug, number>;

    // Transferência de acerto entre os dois participantes,
    // proporcional à renda de cada um
    const [userA, userB] = users;
    let transfer: {
      debtor: string;
      debtorInitial: string;
      creditor: string;
      creditorInitial: string;
      amount: number;
    } | null = null;

    if (userA && userB) {
      const paidA = paidSharedByUser[userA.id];
      const paidB = paidSharedByUser[userB.id];
      const totalShared = paidA + paidB;
      const totalNetIncome = incomeByUser[userA.id] + incomeByUser[userB.id];

      transfer = {
        debtor: userA.name,
        debtorInitial: userA.avatarInitials[0],
        creditor: userB.name,
        creditorInitial: userB.avatarInitials[0],
        amount: 0,
      };

      if (totalShared > 0) {
        const shareA =
          totalNetIncome > 0
            ? totalShared * (incomeByUser[userA.id] / totalNetIncome)
            : totalShared / 2;

        const diffA = paidA - shareA;
        const targetSignedAmount = diffA < 0 ? Math.abs(diffA) : -diffA;
        const existingSignedTransfers =
          (transferPaidByPair[`${userA.id}->${userB.id}`] ?? 0) -
          (transferPaidByPair[`${userB.id}->${userA.id}`] ?? 0);
        const remainingSignedAmount = targetSignedAmount - existingSignedTransfers;

        if (remainingSignedAmount > 0) {
          transfer.amount = remainingSignedAmount;
        } else if (remainingSignedAmount < 0) {
          transfer = {
            debtor: userB.name,
            debtorInitial: userB.avatarInitials[0],
            creditor: userA.name,
            creditorInitial: userA.avatarInitials[0],
            amount: Math.abs(remainingSignedAmount),
          };
        }
      }
    }

    return {
      balance: totalIncomes - totalExpenses,
      receitas: totalIncomes,
      despesas: totalExpenses,
      investido: totalInvested,
      pilarUsed,
      pilarForecasted,
      targetValues,
      transfer,
    };
  }, [dbTxs, categories, users, settings, includeFuture]);

  const autocompleteOptions = React.useMemo(() => {
    return categories.map((c) => ({
      value: c.id,
      label: c.name,
      pillar: PILLAR_NAMES[c.pillarSlug as PillarSlug] || "Outros",
    }));
  }, [categories]);

  const initialPillar = React.useMemo(() => {
    if (!pilarParam) return "todos";
    // Check if it's a direct display name
    const displayNames = PILLAR_SLUGS.map((slug) => PILLAR_NAMES[slug]);
    const matchedDisplayName = displayNames.find(
      (name) => name.toLowerCase() === pilarParam.toLowerCase(),
    );
    if (matchedDisplayName) return matchedDisplayName;

    // Check if it matches a slug
    let slugStr = pilarParam.toLowerCase();
    if (slugStr === "metas") {
      slugStr = "planejamento";
    }
    const matchedSlug = PILLAR_SLUGS.find((s) => s === slugStr);
    if (matchedSlug) {
      return PILLAR_NAMES[matchedSlug];
    }
    return "todos";
  }, [pilarParam]);

  React.useEffect(() => {
    setFilterPillar(initialPillar);
  }, [initialPillar]);

  React.useEffect(() => {
    if (filterPillar !== "todos") {
      const matchedCat = autocompleteOptions.find((c) => c.value === filterCategory);
      if (matchedCat && matchedCat.pillar !== filterPillar) {
        setFilterCategory("todas");
      }
    }
  }, [filterPillar, autocompleteOptions, filterCategory]);

  const transactions = React.useMemo(() => {
    return dbTxs.map((tx): Transaction => {
      const displayDate = tx.date.split("-").reverse().join("/");
      const pills: TransactionTagVariant[] = [];
      if (tx.isPrevisao) pills.push("previsao");
      if (tx.recurrenceTemplateId) pills.push("recorrente");
      if (tx.isParcelado) pills.push("parcelado");
      if (tx.isCreditCard) pills.push("cartao");

      const matchedCategory = autocompleteOptions.find((c) => c.value === tx.categoryId);
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
        nextInvoice: !!tx.nextInvoice,
        assignedToUserId: tx.assignedToUserId,
        pillar: matchedCategory ? matchedCategory.pillar : undefined,
        categoryId: tx.categoryId,
        ignored: !!tx.ignored,
        pending: !!tx.isPrevisao || tx.date > todayStr,
      };
    });
  }, [dbTxs, autocompleteOptions, users, todayStr]);

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
      if (tx.ignored) {
        return acc;
      }
      return acc + tx.amount;
    }, 0);
  }, [filteredTransactions, activeView]);

  return (
    <div className={styles.container}>
      <CloudBackground />

      {/* Hero */}
      <header className={styles.heroHeader}>
        <div className={styles.monthSelector}>
          <button
            type="button"
            className={styles.navButton}
            onClick={handlePrevMonth}
            aria-label="Mês anterior"
          >
            <ArrowLeft />
          </button>
          <p className={styles.heroSubtitle}>{monthLabel}</p>
          <button
            type="button"
            className={styles.navButton}
            onClick={handleNextMonth}
            aria-label="Próximo mês"
          >
            <ArrowRight />
          </button>
        </div>
        <h1 className={styles.heroTitle}>{formatCurrency(stats.balance)}</h1>
        <div className={styles.trendsRow}>
          <TrendBadge trend="up">Receitas {formatCurrency(stats.receitas)}</TrendBadge>
          <TrendBadge trend="down">Despesas {formatCurrency(stats.despesas)}</TrendBadge>
          <TrendBadge trend="up">Investido {formatCurrency(stats.investido)}</TrendBadge>
        </div>
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Toggle
            label="Incluir previsões e lançamentos futuros nos totais"
            checked={includeFuture}
            onChange={(e) => handleToggleIncludeFuture(e.target.checked)}
          />
        </div>
      </header>

      {/* Main content */}
      <div className={styles.content}>
        {/* Top: 2-column grid */}
        <div className={styles.topGrid}>
          {/* Coluna esquerda */}
          <div className={styles.leftCol}>
            {/* Novo Lançamento */}
            <GlassCard variant="fino" className={styles.cardPadding}>
              <h2 className={styles.panelTitle}>Novo Lançamento</h2>
              <div className={styles.fieldsContainer}>
                <Input
                  label="Descrição"
                  placeholder="Ex: Assinatura de Software"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className={styles.grid1to1}>
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
                    options={autocompleteOptions}
                    pillars={pillars}
                    onCreateCategory={handleCreateCategory}
                  />
                </div>
              </div>
              <div className={styles.actionsRow}>
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
            <GlassCard variant="fino" className={styles.cardPadding}>
              <h2 className={styles.panelTitle}>Transferência do Mês</h2>
              {stats.transfer ? (
                <TransferCard
                  from={{ name: stats.transfer.debtor, initial: stats.transfer.debtorInitial }}
                  to={{ name: stats.transfer.creditor, initial: stats.transfer.creditorInitial }}
                  amount={stats.transfer.amount}
                  status={stats.transfer.amount > 0 ? "pending" : "done"}
                />
              ) : (
                <TransferCard empty />
              )}
            </GlassCard>
          </div>

          {/* Distribuição por Pilares */}
          <GlassCard variant="fino" className={styles.rightColCard}>
            <h2 className={styles.panelTitle}>Distribuição por Pilares</h2>
            <div className={styles.pillarsGrid}>
              {PILLAR_SLUGS.map((slug) => {
                const pilar = PILLAR_SLUG_TO_PILAR_KEY[slug];
                const isMetas = pilar === "metas";
                const isLiberdade = pilar === "liberdade";

                return (
                  <PilarCard
                    key={slug}
                    pilar={pilar}
                    variant={isMetas ? "rolling" : isLiberdade ? "positive" : "standard"}
                    targetValue={stats.targetValues[slug]}
                    usedValue={isMetas ? metasTotal : stats.pilarUsed[slug]}
                    rangeStart={isMetas ? metasRolling.rangeStart : undefined}
                    rangeEnd={isMetas ? metasRolling.rangeEnd : undefined}
                    onClick={() => router.push(`/lancamentos?pilar=${slug}`)}
                    forecastedValue={isMetas ? undefined : stats.pilarForecasted[slug]}
                  />
                );
              })}
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
                <label className={styles.filterLabel} htmlFor="filter-assigned">
                  Atribuído a
                </label>
                <select
                  id="filter-assigned"
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
                <label className={styles.filterLabel} htmlFor="filter-category">
                  Categoria
                </label>
                <select
                  id="filter-category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="todas">Todas</option>
                  {autocompleteOptions
                    .filter((c) => filterPillar === "todos" || c.pillar === filterPillar)
                    .map((c) => (
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
                <label className={styles.filterLabel} htmlFor="filter-pillar">
                  Pilar
                </label>
                <select
                  id="filter-pillar"
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
                      ignored={tx.ignored}
                      onConfirm={tx.isPrevisao ? () => handleConfirmTransaction(tx.id) : undefined}
                      onEdit={() => handleEditClick(tx)}
                      onDelete={() => handleDeleteClick(tx)}
                      onToggleIgnore={() => handleToggleIgnore(tx)}
                      pending={tx.pending}
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
      </div>
    </div>
  );
}
