import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";
import { useMemo, useState } from "react";
import * as Icons from "./index";

const meta = {
  title: "Design System/Icons",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* ── Types & Icon Definitions ────────────────────────────────── */

interface IconItem {
  name: string;
  originalId: string;
  category: "brand" | "actions" | "status" | "tags" | "trends" | "general";
  categoryLabel: string;
  reactCode: string;
  svgCode: string;
  Component: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const iconsList: IconItem[] = [
  {
    name: "CheckCircle",
    originalId: "confirmar",
    category: "actions",
    categoryLabel: "Ações",
    reactCode: `import { CheckCircle } from "../components/Icons";

<CheckCircle />`,
    svgCode: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2" />
  <polyline points="4,7.5 6.2,9.5 10,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
</svg>`,
    Component: Icons.CheckCircle,
  },
  {
    name: "Pencil",
    originalId: "editar",
    category: "actions",
    categoryLabel: "Ações",
    reactCode: `import { Pencil } from "../components/Icons";

<Pencil />`,
    svgCode: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path d="M9.5 2.5L11.5 4.5L5 11H3V9L9.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
</svg>`,
    Component: Icons.Pencil,
  },
  {
    name: "Trash",
    originalId: "excluir",
    category: "actions",
    categoryLabel: "Ações",
    reactCode: `import { Trash } from "../components/Icons";

<Trash />`,
    svgCode: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path d="M2.5 4H11.5M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3.5 4L4 11.5H10L10.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
</svg>`,
    Component: Icons.Trash,
  },
  {
    name: "ArrowRight",
    originalId: "arrow-right",
    category: "general",
    categoryLabel: "Geral",
    reactCode: `import { ArrowRight } from "../components/Icons";

<ArrowRight />`,
    svgCode: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M5 12h14M13 6l6 6-6 6" />
</svg>`,
    Component: Icons.ArrowRight,
  },
  {
    name: "Check",
    originalId: "check",
    category: "general",
    categoryLabel: "Geral",
    reactCode: `import { Check } from "../components/Icons";

<Check />`,
    svgCode: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M20 6L9 17l-5-5" />
</svg>`,
    Component: Icons.Check,
  },
  {
    name: "Logo",
    originalId: "logo",
    category: "brand",
    categoryLabel: "Marca",
    reactCode: `import { Logo } from "../components/Icons";

<Logo />`,
    svgCode: `<svg viewBox="0 0 100 100" fill="currentColor">
  <path d="M 16,33 C 14,35 24,47 28,49 C 29,49 20,38 16,33 Z" />
  <path d="M 50,15 C 52,18 52,38 50,45 C 48,38 48,18 50,15 Z" />
  <path d="M 84,33 C 80,38 71,49 72,49 C 76,47 86,35 84,33 Z" />
  <path d="M 5,56 C 25,54 75,54 95,56 C 80,58 45,59 5,56 Z" />
  <path d="M 18,63 C 12,75 30,92 50,92 C 70,92 88,75 82,63 C 86,75 70,96 50,96 C 30,96 14,75 18,63 Z" />
</svg>`,
    Component: Icons.Logo,
  },
  {
    name: "Sparkle",
    originalId: "sparkle",
    category: "brand",
    categoryLabel: "Marca",
    reactCode: `import { Sparkle } from "../components/Icons";

<Sparkle />`,
    svgCode: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
</svg>`,
    Component: Icons.Sparkle,
  },
  {
    name: "SuccessCircle",
    originalId: "toast-success",
    category: "status",
    categoryLabel: "Status",
    reactCode: `import { SuccessCircle } from "../components/Icons";

<SuccessCircle />`,
    svgCode: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.2" />
  <polyline points="4.5,8.5 7,11 11.5,5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
</svg>`,
    Component: Icons.SuccessCircle,
  },
  {
    name: "XCircle",
    originalId: "toast-error",
    category: "status",
    categoryLabel: "Status",
    reactCode: `import { XCircle } from "../components/Icons";

<XCircle />`,
    svgCode: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.2" />
  <line x1="5" y1="5" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  <line x1="11" y1="5" x2="5" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
</svg>`,
    Component: Icons.XCircle,
  },
  {
    name: "AlertTriangle",
    originalId: "toast-warning",
    category: "status",
    categoryLabel: "Status",
    reactCode: `import { AlertTriangle } from "../components/Icons";

<AlertTriangle />`,
    svgCode: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
  <line x1="8" y1="6" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
</svg>`,
    Component: Icons.AlertTriangle,
  },
  {
    name: "InfoCircle",
    originalId: "toast-info",
    category: "status",
    categoryLabel: "Status",
    reactCode: `import { InfoCircle } from "../components/Icons";

<InfoCircle />`,
    svgCode: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.2" />
  <line x1="8" y1="7" x2="8" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  <circle cx="8" cy="4.75" r="0.85" fill="currentColor" />
</svg>`,
    Component: Icons.InfoCircle,
  },
  {
    name: "Close",
    originalId: "fechar",
    category: "actions",
    categoryLabel: "Ações",
    reactCode: `import { Close } from "../components/Icons";

<Close />`,
    svgCode: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
  <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
</svg>`,
    Component: Icons.Close,
  },
  {
    name: "CrystalBall",
    originalId: "tag-previsao",
    category: "tags",
    categoryLabel: "Tags",
    reactCode: `import { CrystalBall } from "../components/Icons";

<CrystalBall />`,
    svgCode: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
  <circle cx="6" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.1" />
  <circle cx="6" cy="5.5" r="4.5" fill="currentColor" opacity="0.1" />
  <circle cx="4.2" cy="3.8" r="1.1" fill="currentColor" opacity="0.5" />
  <path d="M4 10.5 L8 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  <path d="M6 10 L6 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
</svg>`,
    Component: Icons.CrystalBall,
  },
  {
    name: "AlertTriangleSmall",
    originalId: "tag-fora-padrao",
    category: "tags",
    categoryLabel: "Tags",
    reactCode: `import { AlertTriangleSmall } from "../components/Icons";

<AlertTriangleSmall />`,
    svgCode: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M6 1.5L10.5 10.5H1.5L6 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  <line x1="6" y1="5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  <circle cx="6" cy="9.5" r="0.6" fill="currentColor" />
</svg>`,
    Component: Icons.AlertTriangleSmall,
  },
  {
    name: "CreditCard",
    originalId: "tag-cartao",
    category: "tags",
    categoryLabel: "Tags",
    reactCode: `import { CreditCard } from "../components/Icons";

<CreditCard />`,
    svgCode: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
  <rect x="1" y="2.5" width="10" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
  <line x1="1" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.1" />
  <rect x="2.5" y="6.5" width="3" height="1.5" rx="0.4" fill="currentColor" opacity="0.6" />
</svg>`,
    Component: Icons.CreditCard,
  },
  {
    name: "Calendar",
    originalId: "tag-proxima-fatura",
    category: "tags",
    categoryLabel: "Tags",
    reactCode: `import { Calendar } from "../components/Icons";

<Calendar />`,
    svgCode: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
  <rect x="1.5" y="2" width="9" height="8.5" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
  <line x1="1.5" y1="5" x2="10.5" y2="5" stroke="currentColor" strokeWidth="1" />
  <line x1="4" y1="0.5" x2="4" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  <line x1="8" y1="0.5" x2="8" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  <circle cx="4" cy="7.5" r="0.8" fill="currentColor" />
  <circle cx="6" cy="7.5" r="0.8" fill="currentColor" />
  <circle cx="8" cy="7.5" r="0.8" fill="currentColor" />
</svg>`,
    Component: Icons.Calendar,
  },
  {
    name: "Repeat",
    originalId: "tag-recorrente",
    category: "tags",
    categoryLabel: "Tags",
    reactCode: `import { Repeat } from "../components/Icons";

<Repeat />`,
    svgCode: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M2.5 4.5C3.2 2.8 5 1.75 7 2C8.8 2.2 10 3.5 10.25 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  <path d="M9.5 2.5L10.25 5L7.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M9.5 7.5C8.8 9.2 7 10.25 5 10C3.2 9.8 2 8.5 1.75 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  <path d="M2.5 9.5L1.75 7L4.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
</svg>`,
    Component: Icons.Repeat,
  },
  {
    name: "Layers",
    originalId: "tag-parcelado",
    category: "tags",
    categoryLabel: "Tags",
    reactCode: `import { Layers } from "../components/Icons";

<Layers />`,
    svgCode: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M1.5 4L6 2L10.5 4L6 6L1.5 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  <path d="M1.5 6.5L6 8.5L10.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M1.5 9L6 11L10.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
</svg>`,
    Component: Icons.Layers,
  },
  {
    name: "TriangleUp",
    originalId: "trend-up",
    category: "trends",
    categoryLabel: "Tendências",
    reactCode: `import { TriangleUp } from "../components/Icons";

<TriangleUp />`,
    svgCode: `<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
  <polygon points="4,0 8,8 0,8" fill="currentColor" />
</svg>`,
    Component: Icons.TriangleUp,
  },
  {
    name: "TriangleDown",
    originalId: "trend-down",
    category: "trends",
    categoryLabel: "Tendências",
    reactCode: `import { TriangleDown } from "../components/Icons";

<TriangleDown />`,
    svgCode: `<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
  <polygon points="0,0 8,0 4,8" fill="currentColor" />
</svg>`,
    Component: Icons.TriangleDown,
  },
  {
    name: "Star",
    originalId: "estrela",
    category: "general",
    categoryLabel: "Geral",
    reactCode: `import { Star } from "../components/Icons";

<Star />`,
    svgCode: `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
  <polygon points="5,0 6.2,3.8 10,3.8 6.9,6.1 8.1,10 5,7.6 1.9,10 3.1,6.1 0,3.8 3.8,3.8" />
</svg>`,
    Component: Icons.Star,
  },
];

/* ── Interactive Catalog Component ───────────────────────────── */

function IconsCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [iconSize, setIconSize] = useState<number>(32);
  const [iconColor, setIconColor] = useState<string>("currentColor");
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<"react" | "svg" | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const categories = [
    { value: "all", label: "Todos os Ícones" },
    { value: "brand", label: "Marca / Identidade" },
    { value: "actions", label: "Ações" },
    { value: "status", label: "Status & Toasts" },
    { value: "tags", label: "Tags de Transação" },
    { value: "trends", label: "Tendências" },
    { value: "general", label: "Geral" },
  ];

  const colors = [
    { value: "currentColor", label: "Herdada (Default)" },
    { value: "var(--c-action)", label: "Dourado Celestial" },
    { value: "var(--status-positive)", label: "Verde Prosperidade" },
    { value: "var(--status-negative)", label: "Rubi Alerta" },
    { value: "var(--pilar-liberdade)", label: "Roxo Místico" },
    { value: "var(--slate-deep)", label: "Azul Profundo" },
  ];

  const filteredIcons = useMemo(() => {
    return iconsList.filter((icon) => {
      const matchesSearch =
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        icon.originalId.toLowerCase().includes(search.toLowerCase()) ||
        icon.categoryLabel.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || icon.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const handleCopy = (text: string, name: string, type: "react" | "svg") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedName(name);
      setCopiedType(type);
      setTimeout(() => {
        setCopiedName(null);
        setCopiedType(null);
      }, 2000);
    });
  };

  // Inline CSS Styles mapped for pure visual beauty and celestial themes
  const wrapperStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "var(--c-bg)",
    backgroundAttachment: "fixed",
    padding: "3rem 2rem",
    fontFamily: "var(--font-body)",
    color: "var(--c-content)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1200px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  };

  const headerPanelStyle: React.CSSProperties = {
    background: "color-mix(in srgb, var(--c-glass) 50%, transparent)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "var(--radius-panel)",
    padding: "2.5rem",
    boxShadow: "var(--shadow-glass-3d)",
    border: "1px solid color-mix(in srgb, var(--c-light) 30%, transparent)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    animation: "fadeIn 0.6s ease-out",
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "2.5rem",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "0.03em",
    background: "linear-gradient(135deg, var(--c-content) 30%, var(--c-action) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "1.05rem",
    margin: 0,
    color: "var(--c-content-muted)",
    lineHeight: 1.6,
  };

  const controlsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginTop: "1rem",
    borderTop: "1px solid color-mix(in srgb, var(--c-content) 8%, transparent)",
    paddingTop: "1.5rem",
  };

  const controlGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-heading)",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--c-content-muted)",
  };

  const inputStyle: React.CSSProperties = {
    background: "color-mix(in srgb, var(--c-light) 60%, transparent)",
    border: "1px solid color-mix(in srgb, var(--c-content) 15%, transparent)",
    borderRadius: "var(--radius-input)",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    fontFamily: "var(--font-body)",
    color: "var(--c-content)",
    outline: "none",
    transition: "var(--transition-base)",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
    backgroundSize: "0.6rem",
  };

  const filterTabsContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "var(--c-action)" : "color-mix(in srgb, var(--c-light) 50%, transparent)",
    color: active ? "var(--white)" : "var(--c-content)",
    border: "none",
    borderRadius: "var(--radius-pill)",
    padding: "0.5rem 1.25rem",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "var(--transition-base)",
    boxShadow: active ? "0 4px 10px rgba(233, 128, 36, 0.25)" : "none",
  });

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
  };

  const cardStyle = (expanded: boolean): React.CSSProperties => ({
    background: "color-mix(in srgb, var(--c-glass) 50%, transparent)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "var(--radius-card)",
    padding: "1.75rem",
    border: expanded
      ? "1.5px solid var(--c-action)"
      : "1px solid color-mix(in srgb, var(--c-light) 25%, transparent)",
    boxShadow: expanded ? "0 10px 25px rgba(23, 40, 60, 0.12)" : "var(--shadow-glass-3d)",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    position: "relative",
    overflow: "hidden",
    transition: "var(--transition-base)",
    cursor: expanded ? "default" : "pointer",
  });

  const iconDisplayContainerStyle: React.CSSProperties = {
    height: "120px",
    background: "color-mix(in srgb, var(--c-light) 30%, transparent)",
    borderRadius: "var(--radius-input)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    border: "1px solid color-mix(in srgb, var(--c-content) 5%, transparent)",
  };

  const cardCategoryStyle: React.CSSProperties = {
    position: "absolute",
    top: "0.75rem",
    right: "0.75rem",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    padding: "0.25rem 0.6rem",
    borderRadius: "var(--radius-pill)",
    background: "color-mix(in srgb, var(--c-content) 8%, transparent)",
    color: "var(--c-content-muted)",
    letterSpacing: "0.05em",
  };

  const cardTitleStyle: React.CSSProperties = {
    fontFamily: "var(--font-heading)",
    fontSize: "1.15rem",
    fontWeight: 600,
    margin: 0,
    color: "var(--c-content)",
  };

  const actionGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const btnStyle = (variant: "primary" | "secondary", isCopied: boolean): React.CSSProperties => ({
    background: isCopied
      ? "var(--status-positive)"
      : variant === "primary"
        ? "color-mix(in srgb, var(--c-content) 90%, transparent)"
        : "color-mix(in srgb, var(--c-light) 60%, transparent)",
    color: isCopied ? "var(--white)" : variant === "primary" ? "var(--white)" : "var(--c-content)",
    border: isCopied
      ? "none"
      : variant === "primary"
        ? "none"
        : "1px solid color-mix(in srgb, var(--c-content) 15%, transparent)",
    borderRadius: "var(--radius-input)",
    padding: "0.6rem 1rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 200ms ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
  });

  const codeContainerStyle: React.CSSProperties = {
    background: "rgba(10, 20, 30, 0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "var(--radius-input)",
    padding: "0.85rem",
    fontSize: "0.75rem",
    color: "#a5d6ff",
    overflowX: "auto",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    margin: 0,
    maxHeight: "150px",
    position: "relative",
  };

  const codeHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.7rem",
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const codeTitleStyle: React.CSSProperties = {
    fontWeight: 600,
  };

  const toggleExpandBtnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "var(--c-action)",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    alignSelf: "flex-start",
  };

  const toastStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    background: "var(--status-positive)",
    color: "var(--white)",
    padding: "1rem 2rem",
    borderRadius: "var(--radius-card)",
    fontWeight: 600,
    fontSize: "0.95rem",
    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
    display: copiedName ? "flex" : "none",
    alignItems: "center",
    gap: "0.75rem",
    zIndex: 1000,
    animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  };

  const IconComp = (icon: IconItem) => {
    const Component = icon.Component;
    return <Component width="100%" height="100%" style={{ display: "block" }} />;
  };

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        {/* Toast Notifier */}
        <div style={toastStyle}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span>Código {copiedType === "react" ? "React" : "SVG"} copiado com sucesso!</span>
        </div>

        {/* Header Panel */}
        <header style={headerPanelStyle}>
          <h1 style={titleStyle}>Biblioteca de Ícones</h1>
          <p style={subtitleStyle}>
            Catálogo interativo de todos os ícones semânticos da interface do Fortunate. Cada ícone
            é um componente React independente pronto para ser importado e utilizado.
          </p>

          <div style={controlsGridStyle}>
            {/* Search Input */}
            <div style={controlGroupStyle}>
              <span style={labelStyle}>Pesquisar</span>
              <input
                type="text"
                placeholder="Ex: CheckCircle, Pencil, Trash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Customizer Color */}
            <div style={controlGroupStyle}>
              <span style={labelStyle}>Cor de Visualização</span>
              <select
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                style={selectStyle}
              >
                {colors.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Customizer Size */}
            <div style={controlGroupStyle}>
              <span style={labelStyle}>Tamanho dos Ícones ({iconSize}px)</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[16, 24, 32, 48].map((size) => (
                  <button
                    key={size}
                    onClick={() => setIconSize(size)}
                    style={tabStyle(iconSize === size)}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ ...controlGroupStyle, marginTop: "0.5rem" }}>
            <span style={labelStyle}>Filtrar por Categoria</span>
            <div style={filterTabsContainerStyle}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  style={tabStyle(category === cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Counter Info */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--c-content-muted)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            EXIBINDO {filteredIcons.length} DE {iconsList.length} ÍCONES
          </span>
          {filteredIcons.length === 0 && <span>Nenhum ícone corresponde à sua busca.</span>}
        </div>

        {/* Icons Grid */}
        <div style={gridStyle}>
          {filteredIcons.map((icon) => {
            const isExpanded = expandedName === icon.name;
            const isReactCopied = copiedName === icon.name && copiedType === "react";
            const isSvgCopied = copiedName === icon.name && copiedType === "svg";

            return (
              <div
                key={icon.name}
                style={cardStyle(isExpanded)}
                onClick={() => {
                  if (!isExpanded) {
                    setExpandedName(icon.name);
                  }
                }}
              >
                {/* Visual rendering box */}
                <div style={iconDisplayContainerStyle}>
                  <div style={cardCategoryStyle}>{icon.categoryLabel}</div>

                  {/* Dynamic coloring and sizing wrapper */}
                  <div
                    style={{
                      width: `${iconSize}px`,
                      height: `${iconSize}px`,
                      color: iconColor === "currentColor" ? "var(--c-content)" : iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {IconComp(icon)}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 style={cardTitleStyle}>{icon.name}</h3>
                  <code style={{ fontSize: "0.75rem", color: "var(--c-content-muted)" }}>
                    import {"{"} {icon.name} {"}"} from "../components/Icons";
                  </code>
                </div>

                {/* Copy Buttons */}
                <div style={actionGroupStyle}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(icon.reactCode, icon.name, "react");
                    }}
                    style={btnStyle("primary", isReactCopied)}
                  >
                    {isReactCopied ? (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Copiado!
                      </>
                    ) : (
                      "Copiar React Import"
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(icon.svgCode, icon.name, "svg");
                    }}
                    style={btnStyle("secondary", isSvgCopied)}
                  >
                    {isSvgCopied ? (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Copiado!
                      </>
                    ) : (
                      "Copiar SVG Puro"
                    )}
                  </button>
                </div>

                {/* Collapsible Source Code View */}
                {isExpanded ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      animation: "fadeIn 0.3s ease-out",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* React code preview */}
                    <div style={codeHeaderStyle}>
                      <span style={codeTitleStyle}>React Component Code</span>
                    </div>
                    <pre style={codeContainerStyle}>
                      <code>{icon.reactCode}</code>
                    </pre>

                    {/* SVG code preview */}
                    <div style={{ ...codeHeaderStyle, marginTop: "0.25rem" }}>
                      <span style={codeTitleStyle}>Raw SVG Element</span>
                    </div>
                    <pre style={codeContainerStyle}>
                      <code>{icon.svgCode}</code>
                    </pre>

                    <button
                      onClick={() => setExpandedName(null)}
                      style={{ ...toggleExpandBtnStyle, marginTop: "0.5rem" }}
                    >
                      Recolher Detalhes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedName(icon.name);
                    }}
                    style={toggleExpandBtnStyle}
                  >
                    Ver Códigos Fontes
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Keyframe Injection for Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Stories Configuration ───────────────────────────────────── */

export const Catalogo: Story = {
  render: () => <IconsCatalog />,
};
