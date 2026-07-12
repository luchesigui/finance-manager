"use client";

import { Button } from "@/components/Button/Button";
import { GlassCard } from "@/components/GlassCard/GlassCard";
import { ArrowLeft, ArrowRight, Pencil, Trash } from "@/components/Icons";
import { Input } from "@/components/Input/Input";
import { Modal } from "@/components/Modal/Modal";
import { useToast } from "@/components/Toast/ToastProvider";
import { createReserve, deleteReserve, updateReserve } from "@/hooks/mutations";
import { useCurrentMonth } from "@/hooks/useCurrentMonth";
import { useReserves } from "@/hooks/useReserves";
import type { Reserve } from "@/lib/types";
import { formatBrlCurrency, parseBrazilianCurrencyToNumber } from "@/utils/currency";
import React from "react";
import styles from "../DashboardPreview/DashboardPreview.module.css";

const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

export function ReservasView() {
  const { currentMonthStr, monthLabel, handlePrevMonth, handleNextMonth } = useCurrentMonth();
  const { reserves, essentialAvg, mutate } = useReserves(currentMonthStr);
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingType, setEditingType] = React.useState<"emergency" | "goal" | "investment" | null>(
    null,
  );

  // Form State
  const [currentAmount, setCurrentAmount] = React.useState<number | null>(null);

  const typeLabels = {
    emergency: "Reserva de Emergência",
    goal: "Metas",
    investment: "Investimentos",
  };

  const aggregated = React.useMemo(() => {
    const types = ["emergency", "goal", "investment"] as const;
    return types.map((t) => {
      const subset = reserves.filter((r) => r.type === t);
      return {
        type: t,
        label: typeLabels[t],
        reserves: subset,
        totalCurrent: subset.reduce((acc, r) => acc + r.currentAmount, 0),
        totalTarget: subset.reduce((acc, r) => acc + (r.targetAmount || 0), 0),
        totalMonthly: subset.reduce((acc, r) => acc + (r.monthlyContribution || 0), 0),
      };
    });
  }, [reserves]);

  const openModal = (type: "emergency" | "goal" | "investment") => {
    const data = aggregated.find((a) => a.type === type);
    setEditingType(type);
    setCurrentAmount(data ? data.totalCurrent / 100 : 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!editingType) return;

    const valCurrent = currentAmount ?? 0;

    const typeData = aggregated.find((a) => a.type === editingType);
    const existing = typeData?.reserves || [];

    // ponytail: consolidate into the first record, preserving others by subtracting their values
    // if no records exist, create a new one.
    const currentCents = Math.round(valCurrent * 100);

    try {
      if (existing.length > 0) {
        const [first, ...others] = existing;
        const othersCurrent = others.reduce((acc, r) => acc + r.currentAmount, 0);

        await updateReserve(first.id, {
          currentAmount: Math.max(0, currentCents - othersCurrent),
        });
      } else {
        await createReserve({
          name: typeLabels[editingType],
          type: editingType,
          currentAmount: currentCents,
          status: "active",
        });
      }
      toast({ variant: "success", title: "Reserva atualizada" });
      setIsModalOpen(false);
      mutate();
    } catch (err) {
      toast({ variant: "error", title: "Erro ao salvar reserva" });
    }
  };

  const totalEmergency = aggregated.find((a) => a.type === "emergency")?.totalCurrent || 0;
  const runway = essentialAvg > 0 ? (totalEmergency / essentialAvg).toFixed(1) : "0";

  return (
    <div className={styles.container}>
      <header className={styles.heroHeader}>
        <div className={styles.monthSelector}>
          <button
            className={styles.navButton}
            onClick={handlePrevMonth}
            type="button"
            aria-label="Mês anterior"
          >
            <ArrowLeft width={20} height={20} />
          </button>
          <h2 className={styles.heroTitle} style={{ fontSize: "2.5rem", margin: 0 }}>
            {monthLabel}
          </h2>
          <button
            className={styles.navButton}
            onClick={handleNextMonth}
            type="button"
            aria-label="Próximo mês"
          >
            <ArrowRight width={20} height={20} />
          </button>
        </div>
        <p className={styles.heroSubtitle}>Patrimônio e Reservas</p>
      </header>

      <main className={styles.content}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {aggregated.map((agg) => (
            <ReserveCard
              key={agg.type}
              type={agg.type}
              label={agg.label}
              current={agg.totalCurrent}
              target={agg.totalTarget}
              monthly={agg.totalMonthly}
              runway={agg.type === "emergency" ? runway : undefined}
              essentialAvg={agg.type === "emergency" ? essentialAvg : undefined}
              onEdit={() => openModal(agg.type)}
            />
          ))}
        </div>
      </main>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Editar ${editingType ? typeLabels[editingType] : ""}`}
      >
        <div className={styles.fieldsContainer}>
          <Input
            label="Saldo Atual"
            type="text"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={currentAmount === null ? "" : formatBrlCurrency(currentAmount)}
            onChange={(e) => setCurrentAmount(parseBrazilianCurrencyToNumber(e.target.value))}
          />
        </div>
        <div className={styles.actionsRow}>
          <Button onClick={() => setIsModalOpen(false)} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="action">
            Salvar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ReserveCard({
  type,
  label,
  current,
  target,
  monthly,
  runway,
  essentialAvg,
  onEdit,
}: {
  type: string;
  label: string;
  current: number;
  target: number;
  monthly: number;
  runway?: string;
  essentialAvg?: number;
  onEdit: () => void;
}) {
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : null;

  return (
    <GlassCard
      className={styles.cardPadding}
      style={{ position: "relative", minHeight: "220px", display: "flex", flexDirection: "column" }}
    >
      <div style={{ position: "absolute", top: "1.2rem", right: "1.2rem" }}>
        <button
          onClick={onEdit}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "none",
            color: "var(--c-content-muted)",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "50%",
          }}
          title="Editar"
          type="button"
        >
          <Pencil width={18} height={18} />
        </button>
      </div>

      <h4
        style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          color: "var(--c-content-muted)",
        }}
      >
        {label}
      </h4>

      <div style={{ marginBottom: "auto" }}>
        <p
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            color: "var(--c-content)",
            lineHeight: 1.1,
          }}
        >
          {brl(current)}
        </p>
        {target > 0 && (
          <p style={{ fontSize: "0.9rem", color: "var(--c-content-muted)", marginTop: "0.4rem" }}>
            de {brl(target)}
          </p>
        )}
      </div>

      {type === "emergency" && runway && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--c-content-muted)" }}>Runway</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--c-action)" }}>
              {runway} meses
            </span>
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--c-content-muted)", marginTop: "0.2rem" }}>
            base: {brl(essentialAvg || 0)}/mês
          </p>
        </div>
      )}

      {type === "goal" && progress !== null && (
        <div style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "var(--c-content-muted)" }}>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div
            style={{
              height: "8px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--status-positive)",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>
      )}

      {monthly > 0 && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--c-content-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Aporte Mensal
          </span>
          <span style={{ fontSize: "1rem", fontWeight: 600 }}>{brl(monthly)}</span>
        </div>
      )}
    </GlassCard>
  );
}
