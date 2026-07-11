"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Autocomplete } from "../../components/Autocomplete/Autocomplete";
import { Button } from "../../components/Button/Button";
import { CloudBackground } from "../../components/CloudBackground/CloudBackground";
import { GlassCard } from "../../components/GlassCard/GlassCard";
import { ArrowLeft, ArrowRight } from "../../components/Icons";
import { Input } from "../../components/Input/Input";
import { PilarCard } from "../../components/PilarCard/PilarCard";
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
} from "../../hooks/mutations";
import { useCategories } from "../../hooks/useCategories";
import { useCurrentMonth } from "../../hooks/useCurrentMonth";
import { useSettings } from "../../hooks/useSettings";
import { useTransactions } from "../../hooks/useTransactions";
import { useUsers } from "../../hooks/useUsers";
import {
  DEFAULT_PILLAR_TARGETS,
  PILLAR_NAMES,
  PILLAR_NAME_TO_SLUG,
  PILLAR_SLUGS,
  PILLAR_SLUG_TO_PILAR_KEY,
  type PillarSlug,
} from "../../utils/pillars";
import styles from "./DashboardPreview.module.css";

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

  const padZero = (n: number) => n.toString().padStart(2, "0");
  const { transactions: dbTxs } = useTransactions(currentMonthStr);
  const { categories } = useCategories();
  const { users } = useUsers();
  const { settings } = useSettings();

  const pillars = PILLAR_SLUGS.map((slug) => PILLAR_NAMES[slug]);

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

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id, "only_this");
    } catch (err) {
      console.error("Error deleting transaction", err);
      toast({ variant: "error", title: "Erro ao excluir lançamento" });
    }
  };

  const handleConfirmTransaction = async (id: string) => {
    try {
      await confirmTransaction(id);
      toast({ variant: "success", title: "Previsão confirmada" });
    } catch (err) {
      console.error("Error confirming transaction", err);
      toast({ variant: "error", title: "Erro ao confirmar lançamento" });
    }
  };

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
      const amountFloat = tx.amount / 100;
      const isForecast = tx.isPrevisao || tx.date > todayStr;

      if (tx.isPrevisao) {
        // Apenas para as previsões de gastos, somamos no forecast
        if (tx.transactionType === "expense") {
          const cat = categories.find((c) => c.id === tx.categoryId);
          const pilarSlug = (cat?.pillarSlug ?? "conforto") as PillarSlug;
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
        const pilarSlug = (cat?.pillarSlug ?? "conforto") as PillarSlug;

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
  }, [dbTxs, categories, users, settings]);

  const autocompleteOptions = React.useMemo(() => {
    return categories.map((c) => ({
      value: c.id,
      label: c.name,
      pillar: PILLAR_NAMES[c.pillarSlug as PillarSlug] || "Outros",
    }));
  }, [categories]);

  // Mapeia transações do banco para o formato de exibição
  const viewTransactions = React.useMemo(() => {
    return dbTxs
      .filter((tx) => tx.transactionType === "expense")
      .map((tx) => {
        const displayDate = tx.date.split("-").reverse().join("/");
        const pills: TransactionTagVariant[] = [];
        if (tx.isPrevisao) pills.push("previsao");
        if (tx.recurrenceTemplateId) pills.push("recorrente");
        if (tx.isParcelado) pills.push("parcelado");
        if (tx.isCreditCard) pills.push("cartao");
        if (tx.nextInvoice) pills.push("proxima-fatura");

        const catObj = categories.find((c) => c.id === tx.categoryId);
        const assignedUser = users.find((u) => u.id === tx.assignedToUserId);

        return {
          id: tx.id,
          isPrevisao: !!tx.isPrevisao,
          avatar: assignedUser?.avatarInitials ?? "?",
          date: displayDate,
          description: tx.description,
          category: catObj?.name ?? "—",
          amount: tx.amount / 100,
          transactionType:
            tx.transactionType === "income" ? ("income" as const) : ("expense" as const),
          pills: pills.length > 0 ? pills : undefined,
        };
      });
  }, [dbTxs, categories, users]);

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
              {PILLAR_SLUGS.map((slug) => (
                <PilarCard
                  key={slug}
                  pilar={PILLAR_SLUG_TO_PILAR_KEY[slug]}
                  targetValue={stats.targetValues[slug]}
                  usedValue={stats.pilarUsed[slug]}
                  onClick={() => router.push(`/lancamentos?pilar=${slug}`)}
                  forecastedValue={stats.pilarForecasted[slug]}
                />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Últimas Transações — full width */}
        <GlassCard variant="fino" className={styles.listCard}>
          <h2 className={styles.listTitle}>Últimas Transações</h2>
          {viewTransactions.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--c-content-muted)", padding: "1rem" }}>
              Nenhuma transação registrada para este mês.
            </p>
          ) : (
            viewTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                avatar={tx.avatar}
                description={tx.description}
                category={tx.category}
                date={tx.date}
                amount={tx.amount}
                transactionType={tx.transactionType}
                pills={tx.pills}
                onConfirm={tx.isPrevisao ? () => handleConfirmTransaction(tx.id) : undefined}
                onEdit={() => window.location.assign("/lancamentos")}
                onDelete={() => handleDeleteTransaction(tx.id)}
              />
            ))
          )}
        </GlassCard>
      </div>
    </div>
  );
}
