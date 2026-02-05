"use client";

import {
  Activity,
  ArrowRight,
  Brain,
  ChevronDown,
  Compass,
  Gauge,
  Scale,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const premiumFeatures = [
  {
    id: "proportional-finances",
    icon: Scale,
    title: "Finanças Compartilhadas Proporcionais",
    description:
      "Quem ganha mais, contribui mais — na mesma proporção. Elimine brigas e injustiças no casal com uma divisão matemática que respeita a realidade de cada um.",
    highlight: "Divisão balanceada por renda",
    color: "accent-primary",
  },
  {
    id: "scenario-simulator",
    icon: Compass,
    title: "Simulador de Cenários",
    description:
      "Financiamento, faculdade, tratamentos médicos, ano sabático. Saiba exatamente quanto tempo sua reserva dura antes de tomar o próximo grande passo.",
    highlight: "Calcule seu runway financeiro",
    color: "accent-positive",
  },
  {
    id: "outlier-detector",
    icon: Brain,
    title: "Detector de Outliers",
    description:
      "IA estatística que ignora o cafézinho mas te avisa quando um gasto foge dois desvios padrão da sua média — o verdadeiro ralo de dinheiro.",
    highlight: "Vigia inteligente que importa",
    color: "accent-spending",
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
      "Entender seus gastos fixos e aportes mensais é mais valioso que saber quanto gastou no último almoço. Estratégia supera controle.",
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

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {displayValue.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
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
            <div className="bg-accent-primary p-2 rounded-interactive text-white shadow-glow-accent">
              <Wallet size={24} />
            </div>
            <span className="text-xl font-bold text-heading tracking-tight">
              Finanças<span className="text-accent-primary">Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-body hover:text-heading transition-colors font-medium"
            >
              Entrar
            </Link>
            <Link href="/login" className="noir-btn-primary">
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
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-accent-primary/10 border border-accent-primary/30 text-accent-primary text-sm font-medium mb-8">
            <Shield size={16} />
            Gestão Financeira Sem Neura
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-heading leading-tight mb-6">
            Domine seu futuro.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-accent-positive to-accent-spending">
              Não seu extrato bancário.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-body max-w-3xl mx-auto mb-10 leading-relaxed">
            Esqueça a ansiedade do centavo. O FinançasPro foca no que realmente importa:{" "}
            <span className="text-heading font-medium">sua Saúde Financeira</span> e seu progresso
            rumo à <span className="text-heading font-medium">Liberdade Financeira</span>.
            Estratégia supera microgerenciamento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="noir-btn-primary px-8 py-4 text-lg flex items-center gap-2 group"
            >
              Começar Gratuitamente
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#philosophy"
              className="noir-btn-secondary px-8 py-4 text-lg flex items-center gap-2"
            >
              Entender a Filosofia
              <ChevronDown size={20} />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-heading mb-1">
                <AnimatedNumber value={100} suffix="%" />
              </div>
              <div className="text-sm text-muted">Gratuito</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-positive mb-1">
                <AnimatedNumber value={0} suffix="" />
              </div>
              <div className="text-sm text-muted">Centavos contados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-spending mb-1">
                <AnimatedNumber value={100} suffix="" />
              </div>
              <div className="text-sm text-muted">Score de Saúde</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={32} className="text-muted" />
        </div>
      </section>

      {/* Philosophy Section - A Filosofia do Arredondamento */}
      <section id="philosophy" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-accent-spending/10 border border-accent-spending/30 text-accent-spending text-sm font-medium mb-6">
              <Zap size={14} />
              Nossa Filosofia
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">
              A Filosofia do{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-positive">
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
                  <div className="bg-accent-primary/20 p-3 rounded-card group-hover:scale-110 transition-transform">
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
                  "Se você entende o conceito da sua saúde financeira, não precisa de continha."
                </p>
                <p className="text-muted">
                  Eficiência é gastar menos tempo gerenciando e mais tempo vivendo — sem perder o
                  controle estratégico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section id="features" className="py-24 bg-noir-surface/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">
              Ferramentas de <span className="text-accent-primary">Estratégia Financeira</span>
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              Funcionalidades premium pensadas para quem quer eficiência, não microgerenciamento.
              Cada recurso foi desenhado para liberar seu tempo e ampliar sua visão.
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
                  <div className={`bg-${feature.color}/20 p-4 rounded-card shrink-0`}>
                    <feature.icon size={32} className={`text-${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-${feature.color}/10 border border-${feature.color}/30 text-${feature.color} text-xs font-medium mb-3`}
                    >
                      {feature.highlight}
                    </div>
                    <h3 className="text-2xl font-bold text-heading mb-3">{feature.title}</h3>
                    <p className="text-body text-lg leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Proportional Split Deep Dive */}
          <div className="mt-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-heading mb-4">
                Divisão Proporcional: <span className="text-accent-primary">Matemática Justa</span>
              </h3>
              <p className="text-body text-lg leading-relaxed mb-6">
                Quando um parceiro ganha R$ 8.000 e outro R$ 4.000, dividir 50/50 não é justo — é
                injusto. No FinançasPro, quem ganha 67% contribui com 67% das despesas conjuntas.
              </p>
              <p className="text-body leading-relaxed">
                O resultado? Ambos ficam com a{" "}
                <span className="text-heading font-medium">mesma proporção de renda livre</span>{" "}
                para gastos pessoais. Sem brigas. Sem ressentimentos. Apenas eficiência matemática.
              </p>
            </div>
            <div className="noir-card p-6 bg-noir-surface">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-noir-border">
                  <span className="text-muted">Parceiro A (67% da renda)</span>
                  <span className="text-heading font-semibold">67% das despesas</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-noir-border">
                  <span className="text-muted">Parceiro B (33% da renda)</span>
                  <span className="text-heading font-semibold">33% das despesas</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-accent-positive font-medium">Resultado</span>
                  <span className="text-accent-positive font-semibold">
                    Mesma % de renda livre ✓
                  </span>
                </div>
              </div>
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
              <h2 className="text-3xl md:text-4xl font-bold text-heading mb-6">
                Sua vida financeira em{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-positive to-accent-primary">
                  um número
                </span>
              </h2>
              <p className="text-body text-lg leading-relaxed mb-6">
                O Score de Saúde Financeira (0-100) resume a complexidade das suas finanças em uma
                métrica acionável. Não é sobre quanto você tem — é sobre sua{" "}
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
                    className={`bg-${tier.color}/20 px-3 py-2 rounded-interactive min-w-[80px] text-center`}
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

          {/* Runway concept */}
          <div className="mt-16 noir-card p-8 bg-gradient-to-r from-noir-surface to-noir-sidebar border-accent-primary/20">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold text-heading mb-4">
                  Seu <span className="text-accent-primary">Runway</span> Financeiro
                </h3>
                <p className="text-body text-lg leading-relaxed">
                  Quantos meses sua reserva de emergência cobre seus gastos atuais? Essa é a métrica
                  que separa quem está vulnerável de quem tem liberdade para tomar decisões. O
                  Simulador de Cenários calcula isso automaticamente para diferentes situações.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-accent-primary mb-2">12+</div>
                <div className="text-muted text-sm">meses de runway = tranquilidade</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It's Different Section */}
      <section className="py-24 bg-noir-surface/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">
              Anti-Microgerenciamento
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              Apps tradicionais te fazem contar centavos. O FinançasPro te faz entender tendências.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="noir-card p-6 border-accent-negative/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-accent-negative/20 p-2 rounded-interactive">
                  <span className="text-accent-negative text-xl">✕</span>
                </div>
                <h3 className="text-xl font-semibold text-heading">Apps Tradicionais</h3>
              </div>
              <ul className="space-y-3 text-body">
                <li className="flex items-start gap-2">
                  <span className="text-accent-negative mt-1">•</span>
                  Exigem categorização de cada café
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-negative mt-1">•</span>
                  Notificações constantes gerando ansiedade
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-negative mt-1">•</span>
                  Foco no saldo exato da conta
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-negative mt-1">•</span>
                  Divisão 50/50 que ignora diferenças de renda
                </li>
              </ul>
            </div>

            <div className="noir-card p-6 border-accent-positive/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-accent-positive/20 p-2 rounded-interactive">
                  <span className="text-accent-positive text-xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-heading">FinançasPro</h3>
              </div>
              <ul className="space-y-3 text-body">
                <li className="flex items-start gap-2">
                  <span className="text-accent-positive mt-1">•</span>
                  Arredondamentos encorajados — foque no macro
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-positive mt-1">•</span>
                  Alertas apenas para outliers estatísticos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-positive mt-1">•</span>
                  Foco no Score de Saúde e tendências
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-positive mt-1">•</span>
                  Divisão proporcional por renda real
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-positive/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-heading mb-6">
            Liberdade financeira começa com{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-positive">
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
              className="noir-btn-primary px-10 py-4 text-lg flex items-center gap-2 group"
            >
              Começar Gratuitamente
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="text-muted text-sm mt-6">
            Sem necessidade de cartão • 100% gratuito • Sem ansiedade do centavo
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-noir-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent-primary p-2 rounded-interactive text-white">
                <Wallet size={20} />
              </div>
              <span className="text-lg font-bold text-heading">
                Finanças<span className="text-accent-primary">Pro</span>
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
