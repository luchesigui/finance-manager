"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchJson } from "@/lib/apiClient";
import type { AiAnalysis, CurrentUserResponse } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type AiAnalysisPanelProps = {
  referenceMonth: string; // Format: YYYY-MM
};

// ============================================================================
// Constants
// ============================================================================

const INSIGHT_CONFIG = {
  positive: {
    icon: CheckCircle2,
    textColor: "text-accent-positive",
    borderColor: "border-accent-positive/20",
    bgColor: "bg-accent-positive/5",
    iconColor: "text-accent-positive",
    iconBg: "bg-accent-positive/10",
  },
  negative: {
    icon: AlertCircle,
    textColor: "text-accent-negative",
    borderColor: "border-accent-negative/20",
    bgColor: "bg-accent-negative/5",
    iconColor: "text-accent-negative",
    iconBg: "bg-accent-negative/10",
  },
  warning: {
    icon: AlertTriangle,
    textColor: "text-accent-warning",
    borderColor: "border-accent-warning/20",
    bgColor: "bg-accent-warning/5",
    iconColor: "text-accent-warning",
    iconBg: "bg-accent-warning/10",
  },
  info: {
    icon: Info,
    textColor: "text-accent-primary",
    borderColor: "border-accent-primary/20",
    bgColor: "bg-accent-primary/5",
    iconColor: "text-accent-primary",
    iconBg: "bg-accent-primary/10",
  },
};

// ============================================================================
// Components
// ============================================================================

function SkeletonLoader() {
  return (
    <div className="space-y-3">
      <div className="text-center py-4 space-y-2">
        <Sparkles size={24} className="text-accent-primary animate-spin mx-auto" />
        <p className="text-sm font-medium text-heading">
          Nossa inteligência financeira está analisando seus dados...
        </p>
        <p className="text-xs text-muted">
          Processando transações, salários e reserva de emergência para gerar insights úteis.
        </p>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-4 p-4 rounded-card border border-noir-border bg-noir-active/30 animate-pulse"
        >
          <div className="w-9 h-9 rounded-interactive bg-noir-active self-start" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-noir-active rounded w-1/3" />
            <div className="h-3 bg-noir-active rounded w-3/4" />
            <div className="h-3 bg-noir-active rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AiAnalysisPanel({ referenceMonth }: AiAnalysisPanelProps) {
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Fetch user to check OpenRouter API key presence
  const { data: userData, isLoading: isUserLoading } = useQuery<CurrentUserResponse>({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson<CurrentUserResponse>("/api/user"),
  });

  const hasApiKey = !!userData?.openrouterApiKeyConfigured;

  // 2. Fetch latest analysis for current month
  const {
    data: analysis,
    isLoading: isAnalysisLoading,
    refetch: refetchLatestAnalysis,
  } = useQuery<AiAnalysis | null>({
    queryKey: ["aiAnalysis", referenceMonth],
    queryFn: () => fetchJson<AiAnalysis | null>(`/api/ai/latest?month=${referenceMonth}`),
    enabled: hasApiKey,
  });

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetchJson<AiAnalysis>("/api/ai/analyze", {
        method: "POST",
        body: JSON.stringify({ month: referenceMonth }),
      });

      queryClient.setQueryData(["aiAnalysis", referenceMonth], response);
      toast.success("Análise financeira gerada com sucesso!");
    } catch (err) {
      console.error("AI Analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "Falha ao gerar análise por IA.";
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isLoading = isUserLoading || isAnalysisLoading;

  // Format reference month for nice header display (ex: 2026-06 -> Junho 2026)
  const formatMonthTitle = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    const monthName = date.toLocaleDateString("pt-BR", { month: "long" });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  // State A: User is loading
  if (isUserLoading) {
    return (
      <Card className="p-card-padding flex items-center justify-center h-32">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted">Carregando dados da IA...</p>
        </div>
      </Card>
    );
  }

  // State B: Key is not configured
  if (!hasApiKey) {
    return (
      <Card className="p-card-padding">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
              <Brain size={20} className="text-muted" />
              Análise Financeira por IA
            </h2>
            <p className="text-sm text-muted">
              Receba conselhos e alertas personalizados sobre as suas movimentações mensais.
            </p>
          </div>
          <Link href="/configuracoes" passHref legacyBehavior>
            <Button className="flex items-center gap-2 self-start sm:self-center">
              <Brain size={16} />
              Configurar Chave OpenRouter
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header bar */}
      <div className="p-card-padding flex items-center justify-between border-b border-noir-border">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-accent-primary" />
          <div>
            <h2 className="text-lg font-semibold text-heading">Análise Financeira por IA</h2>
            <p className="text-xs text-muted">
              insights gerados com o modelo owl-alpha no OpenRouter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {analysis && !isAnalyzing && (
            <Button
              onClick={handleRunAnalysis}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs h-8"
            >
              <Sparkles size={14} className="text-accent-primary" />
              Recalcular
            </Button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-interactive text-muted hover:text-heading hover:bg-noir-active/30 transition-colors"
            aria-label={isCollapsed ? "Expandir painel de IA" : "Recolher painel de IA"}
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      {!isCollapsed && (
        <div className="p-card-padding space-y-4 animate-in slide-in-from-top-2 duration-200">
          {isAnalyzing ? (
            <SkeletonLoader />
          ) : analysis && analysis.insights.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-muted flex items-center justify-between pb-1">
                <span>Ref: {formatMonthTitle(referenceMonth)}</span>
                <span>Gerada em: {new Date(analysis.createdAt).toLocaleString("pt-BR")}</span>
              </div>
              <div className="space-y-3">
                {analysis.insights.map((insight) => {
                  const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.info;
                  const Icon = config.icon;
                  return (
                    <div
                      key={insight.id}
                      className={`flex gap-4 p-4 rounded-card border transition-all duration-200 ${config.borderColor} ${config.bgColor}`}
                    >
                      <div
                        className={`p-2 rounded-interactive self-start ${config.iconBg} ${config.iconColor}`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-heading">{insight.title}</h4>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="p-4 rounded-full bg-noir-active w-fit mx-auto text-muted">
                <Brain size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-heading">
                  Nenhuma análise para {formatMonthTitle(referenceMonth)}
                </h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Gere insights personalizados a partir do dump de transações desse mês.
                </p>
              </div>
              <Button
                onClick={handleRunAnalysis}
                className="flex items-center gap-2 mx-auto"
                disabled={isLoading}
              >
                <Sparkles size={16} />
                Gerar Análise Financeira
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
