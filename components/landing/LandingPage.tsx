"use client";

import {
  Activity,
  ArrowRight,
  Brain,
  ChevronDown,
  Clock,
  Compass,
  Gauge,
  Scale,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const premiumFeatures = [
  {
    id: "proportional-finances",
    icon: Scale,
    title: "Divisão Proporcional",
    description:
      "Inspirados nas metodologias de Gustavo Cerbasi, oferecemos uma forma justa e transparente de gerenciar as finanças em família. Quem ganha mais, paga mais. Assim, ambos têm o mesmo percentual de renda disponível para gastos pessoais.",
    highlight: "Metodologia Cerbasi",
    color: "accent-primary",
  },
  {
    id: "runway-calculator",
    icon: Clock,
    title: "Calculadora de Runway",
    description:
      "Saiba exatamente quanto tempo sua reserva de emergência dura em caso de diminuição ou perda de renda. Uma métrica essencial para quem quer tomar decisões com segurança e planejamento.",
    highlight: "Tempo de autonomia financeira",
    color: "accent-warning",
  },
  {
    id: "outlier-detector",
    icon: Brain,
    title: "Detector de Outliers",
    description:
      "Um vigia inteligente que aprende seus padrões de consumo e ignora as pequenas variações do dia a dia. Quando algo realmente fora do comum acontece, você recebe um alerta. Descubra onde o dinheiro está escapando sem precisar analisar cada transação manualmente.",
    highlight: "Vigia inteligente",
    color: "accent-spending",
  },
  {
    id: "scenario-simulator",
    icon: Compass,
    title: "Simulador de Cenários",
    description:
      "Financiamento imobiliário, faculdade dos filhos, tratamentos de saúde, ano sabático. Visualize como cada compromisso de longo prazo impacta sua liberdade financeira antes de assumir qualquer decisão.",
    highlight: "Impacto na liberdade financeira",
    color: "accent-positive",
  },
];

const philosophyPoints = [
  {
    id: "rounding",
    icon: Zap,
    title: "Arredondamento Estratégico",
    description:
      "Gastos de R$ 47,83? Lance R$ 50. Seu tempo vale mais do que centavos. A diferença? Irrelevante para sua saúde financeira.",
  },
  {
    id: "recurrence",
    icon: Target,
    title: "Foco em Recorrências",
    description:
      "Percebeu um padrão? Agrupe, arredonde e coloque como recorrência. Estratégia supera controle.",
  },
  {
    id: "macro-health",
    icon: Activity,
    title: "Visão Macro, Não Extrato",
    description:
      "A métrica de sucesso não é o saldo exato da conta. É sua tendência de crescimento e seu Score de Saúde Financeira.",
  },
  {
    id: "freedom",
    icon: Sparkles,
    title: "Liberdade, Não Prisão",
    description:
      "Finanças pessoais não devem gerar ansiedade. Se você entende o conceito da sua saúde financeira, não precisa de 'continha'.",
  },
];

const healthScoreBreakdown = [
  {
    range: "80-100",
    label: "Excelente",
    description: "Reserva sólida, aportes consistentes, gastos sob controle",
    color: "accent-positive",
  },
  {
    range: "60-79",
    label: "Bom",
    description: "Trajetória positiva com oportunidades de otimização",
    color: "accent-primary",
  },
  {
    range: "40-59",
    label: "Atenção",
    description: "Sinais de vulnerabilidade que merecem ajustes estratégicos",
    color: "accent-warning",
  },
  {
    range: "0-39",
    label: "Crítico",
    description: "Momento de reestruturação e priorização de reservas",
    color: "accent-negative",
  },
];

function smoothScrollTo(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-noir-primary">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-noir-sidebar/95 backdrop-blur-md border-b border-noir-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary/15 p-2 rounded-interactive text-accent-primary border border-accent-primary/20">
              <Wallet size={22} />
            </div>
            <span className="text-xl text-heading tracking-tight">
              <span className="font-display italic">Finanças</span>
              <span className="text-accent-primary font-semibold text-sm ml-0.5 uppercase tracking-wider">
                Pro
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-body hover:text-heading transition-colors font-medium"
            >
              Entrar
            </Link>
            <Link href="/login" className="hidden md:inline-flex noir-btn-primary">
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-accent-positive/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-spending/5 rounded-full blur-[120px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--chart-axis) 1px, transparent 1px),
                            linear-gradient(90deg, var(--chart-axis) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-accent-primary/10 border border-accent-primary/30 text-accent-primary text-sm font-medium mb-8">
            <Shield size={16} />
            Gestão Financeira Sem Neura
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl text-heading leading-tight mb-6">
            <span className="font-display italic">Domine seu futuro.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-accent-positive to-accent-spending font-display italic">
              Não seu extrato bancário.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-body max-w-3xl mx-auto mb-10 leading-relaxed">
            Esqueça a ansiedade do centavo. O FinançasPro foca no que realmente importa:{" "}
            <span className="text-heading font-medium">sua Saúde Financeira</span> e seu progresso
            rumo à <span className="text-heading font-medium">Liberdade Financeira</span>.
            Estratégia supera microgerenciamento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/login"
              className="noir-btn-primary px-6 py-3 text-base flex items-center gap-2 group"
            >
              Começar Agora
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              type="button"
              onClick={() => smoothScrollTo("philosophy")}
              className="hidden sm:flex noir-btn-secondary px-6 py-3 text-base items-center gap-2"
            >
              Entender a Filosofia
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          type="button"
          onClick={() => smoothScrollTo("philosophy")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
        >
          <ChevronDown size={32} className="text-muted hover:text-heading transition-colors" />
        </button>
      </section>

      {/* Philosophy Section - A Filosofia do Arredondamento */}
      <section id="philosophy" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-accent-spending/10 border border-accent-spending/30 text-accent-spending text-sm font-medium mb-6">
              <Zap size={14} />
              Nossa Filosofia
            </div>
            <h2 className="text-4xl md:text-5xl text-heading mb-4">
              <span className="font-display italic">A Filosofia do</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-positive font-display italic">
                Arredondamento
              </span>
            </h2>
            <p className="text-body text-lg max-w-3xl mx-auto">
              Por que o FinançasPro é diferente? Porque entendemos que seu tempo e paz mental valem
              mais do que precisão milimétrica. Foque no que importa:{" "}
              <span className="text-heading font-medium">grandes categorias</span>,{" "}
              <span className="text-heading font-medium">aportes consistentes</span> e{" "}
              <span className="text-heading font-medium">tendências de longo prazo</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {philosophyPoints.map((point) => (
              <div
                key={point.id}
                className="noir-card p-6 hover:border-noir-border-light transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-accent-primary/15 p-3 rounded-card group-hover:scale-110 transition-transform border border-accent-primary/10">
                    <point.icon size={24} className="text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-heading mb-2">{point.title}</h3>
                    <p className="text-body leading-relaxed">{point.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 noir-card p-8 bg-noir-surface/50 border-accent-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="bg-accent-primary/10 p-4 rounded-full">
                <TrendingUp size={32} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-heading text-lg font-medium mb-2">
                  "Quem entende o conceito, não precisa de continha. Quem faz continha, não entendeu
                  o conceito."
                </p>
                <p className="text-muted">
                  Eficiência é gastar menos tempo gerenciando e mais tempo vivendo, sem perder o
                  controle estratégico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshot Section */}
      <section className="py-16 bg-noir-surface/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl text-heading mb-4">
              <span className="font-display italic">Visão clara da sua</span>{" "}
              <span className="text-accent-primary font-display italic">saúde financeira</span>
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              Dashboard intuitivo que mostra o que realmente importa: seu score, suas tendências e
              seus alertas.
            </p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 via-accent-positive/20 to-accent-spending/20 rounded-2xl blur-xl" />
            <div className="relative noir-card p-2 rounded-2xl overflow-hidden">
              <Image
                src="/images/screenshot-dashboard.png"
                alt="Dashboard do FinançasPro mostrando Score de Saúde Financeira, gastos do mês e tendências"
                width={1200}
                height={675}
                className="rounded-xl w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Health Score Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-accent-positive/10 border border-accent-positive/30 text-accent-positive text-sm font-medium mb-6">
                <Gauge size={14} />
                Score de Saúde Financeira
              </div>
              <h2 className="text-4xl md:text-5xl text-heading mb-6">
                <span className="font-display italic">Sua vida financeira em</span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-positive to-accent-primary font-display italic block">
                  um número
                </span>
              </h2>
              <p className="text-body text-lg leading-relaxed mb-6">
                O Score de Saúde Financeira (0-100) resume a complexidade das suas finanças em uma
                métrica acionável. Não é sobre quanto você tem, é sobre sua{" "}
                <span className="text-heading font-medium">trajetória</span>.
              </p>
              <p className="text-body text-lg leading-relaxed mb-6">
                As <span className="text-heading font-medium">tendências do Score</span> revelam se
                você está construindo riqueza ou acumulando vulnerabilidades. Subiu 5 pontos este
                mês? Você está ficando mais forte. Caiu? Hora de ajustar a estratégia.
              </p>
              <div className="flex items-center gap-4 text-muted">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-accent-positive" />
                  <span className="text-sm">Tendência positiva = mais liberdade</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {healthScoreBreakdown.map((tier) => (
                <div
                  key={tier.range}
                  className="noir-card p-5 flex items-center gap-4 hover:border-noir-border-light transition-all"
                >
                  <div
                    className={`${tier.color === "accent-primary" ? "bg-transparent" : `bg-${tier.color}/20`} border border-${tier.color}/30 px-4 py-2 rounded-pill min-w-[92px] text-center whitespace-nowrap`}
                  >
                    <span className={`text-${tier.color} font-bold`}>{tier.range}</span>
                  </div>
                  <div>
                    <h4 className="text-heading font-semibold">{tier.label}</h4>
                    <p className="text-body text-sm">{tier.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section id="features" className="py-24 bg-noir-surface/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-heading mb-4">
              <span className="font-display italic">Ferramentas Premium de</span>{" "}
              <span className="text-accent-primary font-display italic">Estratégia Financeira</span>
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              Nosso plano premium oferece funcionalidades exclusivas, pensadas para quem quer
              eficiência, não microgerenciamento. Cada recurso foi desenhado para liberar seu tempo
              e ampliar sua visão.
            </p>
          </div>

          <div className="space-y-8">
            {premiumFeatures.map((feature, index) => (
              <div
                key={feature.id}
                className={`noir-card p-8 hover:border-noir-border-light transition-all ${
                  index % 2 === 1 ? "md:ml-12" : "md:mr-12"
                }`}
              >
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div
                    className={`${feature.color === "accent-primary" ? "bg-transparent" : `bg-${feature.color}/20`} p-4 rounded-card shrink-0`}
                  >
                    <feature.icon size={32} className={`text-${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-${feature.color}/10 border border-${feature.color}/30 text-${feature.color} text-xs font-medium mb-3`}
                    >
                      {feature.highlight}
                    </div>
                    <h3 className="text-3xl font-display text-heading mb-3">{feature.title}</h3>
                    <p className="text-body text-lg leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simulation Screenshot */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-positive/20 via-accent-primary/20 to-accent-warning/20 rounded-2xl blur-xl" />
            <div className="relative noir-card p-2 rounded-2xl overflow-hidden">
              {/* Container with fixed aspect ratio matching dashboard screenshot */}
              <div
                className="relative w-full overflow-hidden rounded-xl"
                style={{ paddingBottom: "56.25%" }}
              >
                {/* Animated scrolling image */}
                <div className="absolute inset-0 animate-scroll-preview">
                  <Image
                    src="/images/screenshot-previsao.png"
                    alt="Simulador de Cenários do FinançasPro mostrando projeções financeiras e análise de runway"
                    width={1200}
                    height={1845}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Beta Notice */}
          <p className="mt-12 text-center text-muted text-sm max-w-lg mx-auto">
            Como o app ainda está em beta, os early adopters podem utilizar todas as funcionalidades
            premium gratuitamente até o lançamento oficial.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-positive/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl text-heading mb-6">
            <span className="font-display italic">Liberdade financeira com</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-positive font-display italic">
              estratégia
            </span>
          </h2>
          <p className="text-body text-lg mb-10 max-w-2xl mx-auto">
            Pare de contar centavos. Comece a construir seu runway. O FinançasPro te dá visão macro
            e ferramentas inteligentes para decisões financeiras eficientes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="noir-btn-primary px-8 py-3 text-base flex items-center gap-2 group"
            >
              Começar Agora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="text-muted text-sm mt-6">Sem necessidade de cartão de crédito</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-12 border-t border-noir-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent-primary/15 p-2 rounded-interactive text-accent-primary border border-accent-primary/20">
                <Wallet size={20} />
              </div>
              <span className="text-lg text-heading">
                <span className="font-display italic">Finanças</span>
                <span className="text-accent-primary font-semibold text-sm ml-0.5 uppercase tracking-wider">
                  Pro
                </span>
              </span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted text-sm">
                Gestão financeira estratégica para quem valoriza eficiência sobre microgerenciamento
              </p>
              <p className="text-muted text-sm mt-1">
                © {new Date().getFullYear()} FinançasPro. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
