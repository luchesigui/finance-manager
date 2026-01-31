"use client";

import {
  ArrowRight,
  BarChart3,
  Calculator,
  ChevronDown,
  CreditCard,
  Heart,
  PieChart,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
  {
    id: "shared-management",
    icon: Users,
    title: "Gestão Compartilhada",
    description:
      "Cadastre todas as pessoas da família e acompanhe quanto cada um ganha. Divisão justa baseada na proporção de renda de cada um.",
    color: "accent-primary",
  },
  {
    id: "proportional-split",
    icon: PieChart,
    title: "Divisão Proporcional",
    description:
      "Gastos divididos por porcentagem de renda, garantindo que todos contribuam de forma justa e se sintam parte das conquistas.",
    color: "accent-positive",
  },
  {
    id: "credit-card",
    icon: CreditCard,
    title: "Gastos em Cartão",
    description:
      "Controle de compras no cartão de crédito com lançamento automático para o mês seguinte. Nunca mais se perca nas faturas.",
    color: "accent-spending",
  },
  {
    id: "financial-goals",
    icon: Target,
    title: "Metas Financeiras",
    description:
      "Defina metas de economia e acompanhe o progresso juntos. Sonhos compartilhados são mais fáceis de alcançar.",
    color: "accent-warning",
  },
  {
    id: "expense-forecast",
    icon: TrendingUp,
    title: "Previsão de Gastos",
    description:
      "Lance despesas futuras e tenha uma visão completa do que está por vir. Planeje-se antes que os gastos aconteçam.",
    color: "accent-primary",
  },
  {
    id: "category-analysis",
    icon: BarChart3,
    title: "Análise por Categoria",
    description:
      "Visualize seus gastos organizados por categoria. Identifique onde o dinheiro está indo e tome decisões mais inteligentes.",
    color: "accent-negative",
  },
];

const philosophyPoints = [
  {
    id: "transparency",
    title: "Transparência Total",
    description:
      "Quando todos sabem para onde o dinheiro vai, as decisões financeiras se tornam mais conscientes e colaborativas.",
  },
  {
    id: "fairness",
    title: "Justiça na Divisão",
    description:
      "A divisão proporcional garante que quem ganha mais contribua mais, mas na mesma proporção do seu esforço.",
  },
  {
    id: "shared-goals",
    title: "Metas Compartilhadas",
    description:
      "Casais que planejam juntos, conquistam juntos. Cada economia é um passo em direção aos sonhos do casal.",
  },
  {
    id: "control-not-restriction",
    title: "Controle, não Restrição",
    description:
      "Não se trata de cortar gastos, mas de saber para onde o dinheiro vai e fazer escolhas alinhadas com seus valores.",
  },
];

const howItWorksSteps = [
  {
    step: "01",
    title: "Cadastre as pessoas",
    description: "Adicione você e seu parceiro(a), com a renda de cada um.",
  },
  {
    step: "02",
    title: "Registre os gastos",
    description: "Lance as despesas indicando quem pagou e a categoria.",
  },
  {
    step: "03",
    title: "Veja a divisão justa",
    description: "O sistema calcula automaticamente quanto cada um deve contribuir.",
  },
  {
    step: "04",
    title: "Acompanhe as metas",
    description: "Defina objetivos e acompanhe o progresso em tempo real.",
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
            <Heart size={16} />
            Inspirado em "Casais Inteligentes Enriquecem Juntos"
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-heading leading-tight mb-6">
            Controle financeiro
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-accent-positive to-accent-spending">
              para casais e famílias
            </span>
          </h1>

          <p className="text-lg md:text-xl text-body max-w-3xl mx-auto mb-10 leading-relaxed">
            Mais do que dividir contas, o FinançasPro ajuda casais a construírem riqueza juntos.
            Divisão justa por proporção de renda, controle de gastos no cartão, previsão de despesas
            e metas compartilhadas.
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
              href="#features"
              className="noir-btn-secondary px-8 py-4 text-lg flex items-center gap-2"
            >
              Conhecer Recursos
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
                <AnimatedNumber value={50} suffix="%" />
              </div>
              <div className="text-sm text-muted">Menos conflitos sobre dinheiro</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-spending mb-1">
                <AnimatedNumber value={2} suffix="x" />
              </div>
              <div className="text-sm text-muted">Mais economia</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={32} className="text-muted" />
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-heading mb-6">
                Dinheiro é a maior causa de conflitos entre casais
              </h2>
              <p className="text-body text-lg leading-relaxed mb-6">
                Quando não há transparência sobre gastos, cada compra pode se tornar uma discussão.
                Quem gastou mais? Quem está economizando? Para onde está indo o dinheiro?
              </p>
              <p className="text-body text-lg leading-relaxed">
                O <span className="text-heading font-semibold">FinançasPro</span> foi criado para
                resolver isso. Inspirado nas metodologias de{" "}
                <span className="text-accent-primary font-semibold">Gustavo Cerbasi</span>,
                oferecemos uma forma justa e transparente de gerenciar as finanças em família.
              </p>
            </div>
            <div className="noir-card p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-accent-negative/20 p-2 rounded-interactive text-accent-negative">
                    <Calculator size={24} />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold mb-1">Divisão por igual?</h3>
                    <p className="text-body text-sm">
                      Dividir 50/50 parece justo, mas não considera que um pode ganhar mais que o
                      outro.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-accent-positive/20 p-2 rounded-interactive text-accent-positive">
                    <PieChart size={24} />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold mb-1">Divisão proporcional ✓</h3>
                    <p className="text-body text-sm">
                      Cada um contribui proporcionalmente à sua renda. Justo para todos.
                    </p>
                  </div>
                </div>
                <div className="border-t border-noir-border pt-6">
                  <p className="text-muted text-sm italic">
                    "Se você ganha 60% da renda do casal, você paga 60% das despesas. Assim, ambos
                    têm o mesmo percentual de renda disponível para gastos pessoais."
                  </p>
                  <p className="text-accent-primary text-sm mt-2 font-medium">
                    — Metodologia Cerbasi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-noir-surface/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">
              Tudo que você precisa para{" "}
              <span className="text-accent-primary">controlar suas finanças</span>
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              Recursos pensados especificamente para casais e famílias que querem construir um
              futuro financeiro sólido juntos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="noir-card p-6 hover:border-noir-border-light transition-all group"
              >
                <div
                  className={`bg-${feature.color}/20 p-3 rounded-card w-fit mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={28} className={`text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-heading mb-2">{feature.title}</h3>
                <p className="text-body leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">Como funciona</h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              Em poucos passos, você e sua família terão controle total das finanças.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorksSteps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-bold text-accent-primary/30 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-heading mb-2">{item.title}</h3>
                <p className="text-body text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-noir-surface/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-accent-spending/10 border border-accent-spending/30 text-accent-spending text-sm font-medium mb-6">
                <Heart size={14} />
                Nossa Filosofia
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-heading mb-6">
                Baseado em{" "}
                <span className="text-accent-spending">
                  "Casais Inteligentes Enriquecem Juntos"
                </span>
              </h2>
              <p className="text-body text-lg leading-relaxed mb-6">
                Gustavo Cerbasi é um dos maiores especialistas em finanças pessoais do Brasil. Seu
                livro revolucionou a forma como casais pensam sobre dinheiro, mostrando que a chave
                para a prosperidade está na parceria e na transparência.
              </p>
              <p className="text-body text-lg leading-relaxed">
                O FinançasPro foi construído sobre esses princípios, transformando teoria em prática
                com ferramentas simples e poderosas.
              </p>
            </div>

            <div className="space-y-4">
              {philosophyPoints.map((point) => (
                <div key={point.id} className="noir-card p-5 flex items-start gap-4">
                  <div className="bg-accent-positive/20 p-2 rounded-full mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-accent-positive" />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold mb-1">{point.title}</h3>
                    <p className="text-body text-sm">{point.description}</p>
                  </div>
                </div>
              ))}
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
            Comece a construir riqueza{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-positive">
              em casal
            </span>
          </h2>
          <p className="text-body text-lg mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de casais que já transformaram sua relação com o dinheiro.
            Cadastre-se gratuitamente e comece hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="noir-btn-primary px-10 py-4 text-lg flex items-center gap-2 group"
            >
              Criar Conta Gratuita
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="text-muted text-sm mt-6">
            Sem necessidade de cartão de crédito • 100% gratuito
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
                Inspirado em "Casais Inteligentes Enriquecem Juntos" de Gustavo Cerbasi
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
