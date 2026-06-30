import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { Badge } from "../components/Badge/Badge";
import { TrendBadge } from "../components/TrendBadge/TrendBadge";
import { Button } from "../components/Button/Button";
import { Input, Select } from "../components/Input/Input";

const meta = {
  title: "Design System/Panel",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* ── Shared styles ──────────────────────────────────────────── */

const pageWrapper: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--c-bg)",
  backgroundAttachment: "fixed",
  padding: "3rem 2rem",
  fontFamily: "var(--font-body)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

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

const panelLabel: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "var(--c-content-muted)",
  marginBottom: "0.75rem",
};

/* ── Story 1: SimplePanel ───────────────────────────────────── */

export const SimplePanel: Story = {
  render: () => (
    <div style={pageWrapper}>
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* Fino */}
        <div>
          <p style={panelLabel}>Glass Fino — 12%</p>
          <GlassCard variant="fino" radius="panel" style={{ width: 480, padding: "2.5rem" }}>
            <h2 style={panelTitle}>Resumo do Mês</h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                color: "var(--c-content-muted)",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}
            >
              Aqui você encontra uma visão consolidada das suas finanças para Junho 2026. O saldo
              disponível reflete todas as entradas e saídas registradas até hoje.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
              <TrendBadge trend="up">Receitas R$ 35.928,25</TrendBadge>
              <TrendBadge trend="down">Despesas R$ 10.756,80</TrendBadge>
              <TrendBadge trend="neutral">Saldo R$ 25.171,45</TrendBadge>
            </div>
          </GlassCard>
        </div>

        {/* Denso */}
        <div>
          <p style={panelLabel}>Glass Denso — 70%</p>
          <GlassCard variant="denso" radius="panel" style={{ width: 480, padding: "2.5rem" }}>
            <h2 style={panelTitle}>Resumo do Mês</h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                color: "var(--c-content-muted)",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}
            >
              Aqui você encontra uma visão consolidada das suas finanças para Junho 2026. O saldo
              disponível reflete todas as entradas e saídas registradas até hoje.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
              <TrendBadge trend="up">Receitas R$ 35.928,25</TrendBadge>
              <TrendBadge trend="down">Despesas R$ 10.756,80</TrendBadge>
              <TrendBadge trend="neutral">Saldo R$ 25.171,45</TrendBadge>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  ),
};

/* ── Story 2: PanelWithActions ──────────────────────────────── */

export const PanelWithActions: Story = {
  render: () => (
    <div style={pageWrapper}>
      <GlassCard variant="fino" radius="panel" style={{ width: 480, padding: "2.5rem" }}>
        <h2 style={panelTitle}>Novo Lançamento</h2>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}
        >
          <Input label="Descrição" placeholder="Ex: Mensalidade academia" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Input label="Valor" prefix="R$" placeholder="0,00" />
            <Select
              label="Categoria"
              options={[
                { value: "essenciais", label: "Gastos Essenciais" },
                { value: "conforto", label: "Conforto" },
                { value: "prazeres", label: "Prazeres" },
                { value: "conhecimento", label: "Conhecimento" },
                { value: "metas", label: "Metas" },
                { value: "liberdade", label: "Liberdade Financeira" },
              ]}
            />
          </div>
          <Input label="Data" type="date" />
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <Button variant="outline">Cancelar</Button>
          <Button variant="action">Inserir Lançamento</Button>
        </div>
      </GlassCard>
    </div>
  ),
};

/* ── Story 3: TwoPanelLayout ────────────────────────────────── */

const statRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: "0.875rem",
  marginBottom: "0.875rem",
  borderBottom: "1px solid color-mix(in srgb, var(--c-content) 8%, transparent)",
};

const statLabel: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.85rem",
  color: "var(--c-content-muted)",
};

const statValue: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "var(--c-content)",
};

export const TwoPanelLayout: Story = {
  render: () => (
    <div style={{ ...pageWrapper, alignItems: "flex-start" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2.5rem",
        }}
      >
        {/* Left: Resumo */}
        <GlassCard variant="fino" radius="panel" style={{ padding: "2.5rem" }}>
          <h2 style={panelTitle}>Resumo</h2>

          <div style={statRow}>
            <span style={statLabel}>Saldo disponível</span>
            <span style={{ ...statValue, color: "var(--status-positive)" }}>R$ 25.171,45</span>
          </div>
          <div style={statRow}>
            <span style={statLabel}>Receitas do mês</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={statValue}>R$ 35.928,25</span>
              <TrendBadge trend="up">+8%</TrendBadge>
            </div>
          </div>
          <div style={statRow}>
            <span style={statLabel}>Despesas do mês</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={statValue}>R$ 10.756,80</span>
              <TrendBadge trend="down">-3%</TrendBadge>
            </div>
          </div>
          <div style={{ ...statRow, borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
            <span style={statLabel}>Investido</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={statValue}>R$ 15.000,00</span>
              <TrendBadge trend="up">+12%</TrendBadge>
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <Badge variant="pilar-essenciais">Essenciais 48%</Badge>
            <Badge variant="pilar-conforto">Conforto 65%</Badge>
            <Badge variant="pilar-prazeres">Prazeres 25%</Badge>
            <Badge variant="pilar-liberdade">Liberdade 50%</Badge>
          </div>
        </GlassCard>

        {/* Right: Ações Rápidas */}
        <GlassCard variant="fino" radius="panel" style={{ padding: "2.5rem" }}>
          <h2 style={panelTitle}>Ações Rápidas</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Button variant="action" size="lg" style={{ width: "100%", justifyContent: "center" }}>
              Inserir Lançamento
            </Button>
            <Button variant="glass" size="lg" style={{ width: "100%", justifyContent: "center" }}>
              Transferência do Mês
            </Button>
            <Button variant="outline" size="lg" style={{ width: "100%", justifyContent: "center" }}>
              Exportar Relatório
            </Button>
            <Button variant="outline" size="lg" style={{ width: "100%", justifyContent: "center" }}>
              Ver Investimentos
            </Button>
          </div>

          <div
            style={{
              marginTop: "2rem",
              padding: "1.25rem",
              borderRadius: "var(--radius-card)",
              background: "color-mix(in srgb, var(--c-action) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--c-action) 20%, transparent)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--c-action)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: "0 0 0.4rem",
              }}
            >
              Dica Fortuna
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                color: "var(--c-content-muted)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Você pode registrar gastos rapidamente digitando no assistente abaixo.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  ),
};
