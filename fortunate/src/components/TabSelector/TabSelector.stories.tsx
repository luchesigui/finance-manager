import type { Meta, StoryObj } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { GlassCard } from "../GlassCard/GlassCard";
import { TabSelector } from "./TabSelector";

const meta = {
  title: "Design System/TabSelector",
  component: TabSelector,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    tabs: {
      control: "object",
      description: "Array contendo os itens da aba e suas cores customizadas",
    },
    value: { control: "number", description: "Índice da aba ativa atualmente" },
    onChange: { action: "onChange", description: "Callback executado ao mudar de aba" },
  },
  args: {
    value: 0,
    tabs: [{ label: "Visão Geral" }, { label: "Detalhes" }, { label: "Histórico" }],
  },
} satisfies Meta<typeof TabSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  render: (args) => {
    const Demo = () => {
      const [active, setActive] = useState(args.value);

      useEffect(() => {
        setActive(args.value);
      }, [args.value]);

      const handleChange = (index: number) => {
        setActive(index);
        args.onChange(index);
      };

      const content = [
        "Resumo geral do período.",
        "Detalhes da seleção.",
        "Histórico de atividades.",
      ];

      return (
        <div style={{ width: 480 }}>
          <TabSelector tabs={args.tabs} value={active} onChange={handleChange} />
          <div style={{ padding: "1.5rem 0" }}>
            <p style={{ margin: 0, color: "var(--c-content-muted)", fontSize: "0.9rem" }}>
              {content[active]}
            </p>
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

export const ComCores: Story = {
  args: {
    tabs: [
      { label: "Despesa", color: "var(--status-negative)" },
      { label: "Renda", color: "var(--status-positive)" },
      { label: "Transferência", color: "var(--c-action)" },
    ],
  },
  render: (args) => {
    const Demo = () => {
      const [active, setActive] = useState(args.value);

      useEffect(() => {
        setActive(args.value);
      }, [args.value]);

      const handleChange = (index: number) => {
        setActive(index);
        args.onChange(index);
      };

      const content = [
        <p key="despesa" style={{ margin: 0, color: "var(--c-content-muted)", fontSize: "0.9rem" }}>
          Registrar uma saída de caixa.
        </p>,
        <p key="renda" style={{ margin: 0, color: "var(--c-content)", fontSize: "0.9rem" }}>
          Registrar uma entrada de recursos.
        </p>,
        <p key="transferencia" style={{ margin: 0, color: "var(--c-content)", fontSize: "0.9rem" }}>
          Mover valor entre contas.
        </p>,
      ];

      return (
        <div style={{ width: 480 }}>
          <TabSelector tabs={args.tabs} value={active} onChange={handleChange} />
          <div style={{ padding: "1.5rem 0" }}>{content[active]}</div>
        </div>
      );
    };
    return <Demo />;
  },
};

export const EmPanel: Story = {
  args: {
    tabs: [{ label: "Pilares" }, { label: "Transações" }, { label: "Metas" }],
  },
  render: (args) => {
    const Demo = () => {
      const [active, setActive] = useState(args.value);

      useEffect(() => {
        setActive(args.value);
      }, [args.value]);

      const handleChange = (index: number) => {
        setActive(index);
        args.onChange(index);
      };

      const labels = ["Pilares", "Transações", "Metas"];
      return (
        <div style={{ width: 560 }}>
          <GlassCard variant="fino" style={{ padding: "2rem" }}>
            <TabSelector tabs={args.tabs} value={active} onChange={handleChange} />
            <div style={{ padding: "1.5rem 0" }}>
              <p style={{ margin: 0, color: "var(--c-content-muted)", fontSize: "0.9rem" }}>
                Aba ativa: {labels[active]}
              </p>
            </div>
          </GlassCard>
        </div>
      );
    };
    return <Demo />;
  },
};
