"use client";

import { 
  ArrowRight, 
  BarChart3, 
  CreditCard, 
  Heart, 
  PieChart, 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  Users, 
  Wallet 
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-noir-primary text-heading">
      {/* Navigation */}
      <header className="absolute top-0 w-full z-10 border-b border-white/5 bg-noir-primary/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-accent-primary p-1.5 rounded-lg text-white">
              <Wallet size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Finanças<span className="text-accent-primary">Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-body hover:text-heading transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-medium bg-white text-noir-primary px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-accent-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-medium mb-6 border border-accent-primary/20">
            <Heart size={12} className="fill-current" />
            <span>Feito para casais inteligentes</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Enriqueçam juntos com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-positive">
              transparência total
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-body max-w-2xl mx-auto mb-10 leading-relaxed">
            Mais que dividir contas, multipliquem conquistas. Uma plataforma inspirada na filosofia de Gustavo Cerbasi para casais que querem crescer juntos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-full font-medium transition-all shadow-glow-accent flex items-center justify-center gap-2"
            >
              Criar conta grátis
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="#como-funciona" 
              className="w-full sm:w-auto px-8 py-3 bg-noir-surface hover:bg-noir-active border border-white/10 text-heading rounded-full font-medium transition-all flex items-center justify-center"
            >
              Como funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="como-funciona" className="py-24 bg-noir-surface border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                A matemática do amor
              </h2>
              <p className="text-body text-lg mb-6 leading-relaxed">
                Baseado nos ensinamentos do livro <em>"Casais Inteligentes Enriquecem Juntos"</em>, nossa plataforma vai além do básico "quem deve a quem".
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="mt-1 bg-accent-primary/10 p-2 rounded-lg h-fit text-accent-primary">
                    <PieChart size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-heading">Divisão Proporcional</h3>
                    <p className="text-body text-sm mt-1">
                      Contribuição justa baseada na renda de cada um. Quem ganha mais, contribui com mais, mantendo o equilíbrio na relação.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-accent-positive/10 p-2 rounded-lg h-fit text-accent-positive">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-heading">Metas Compartilhadas</h3>
                    <p className="text-body text-sm mt-1">
                      Definam objetivos comuns — seja uma viagem, a casa própria ou a aposentadoria — e acompanhem o progresso juntos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/20 to-transparent rounded-2xl blur-2xl" />
              <div className="relative bg-noir-primary border border-white/10 rounded-2xl p-6 shadow-2xl">
                {/* Mock UI Element */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-semibold">Distribuição de Gastos</h4>
                    <span className="text-xs bg-accent-primary/10 text-accent-primary px-2 py-1 rounded-full">Mensal</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Você (60%)</span>
                        <span>R$ 4.200</span>
                      </div>
                      <div className="h-2 bg-noir-active rounded-full overflow-hidden">
                        <div className="h-full bg-accent-primary w-[60%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Parceiro(a) (40%)</span>
                        <span>R$ 2.800</span>
                      </div>
                      <div className="h-2 bg-noir-active rounded-full overflow-hidden">
                        <div className="h-full bg-accent-spending w-[40%]" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/5 text-center text-sm text-muted">
                    Equilíbrio financeiro automático
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Controle total, sem complicações</h2>
            <p className="text-body">
              Todas as ferramentas que você precisa para gerenciar a vida financeira a dois, em um só lugar.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Multi-usuário",
                desc: "Cadastre o casal e dependentes para ter uma visão unificada ou individualizada dos gastos."
              },
              {
                icon: CreditCard,
                title: "Gestão de Cartões",
                desc: "Lançamentos no crédito são jogados automaticamente para o vencimento da fatura."
              },
              {
                icon: TrendingUp,
                title: "Previsão de Gastos",
                desc: "Visualize o futuro financeiro com base em gastos recorrentes e parcelados."
              },
              {
                icon: ShieldCheck,
                title: "Segurança Total",
                desc: "Seus dados são criptografados e visíveis apenas para quem você autorizar."
              },
              {
                icon: BarChart3,
                title: "Relatórios Inteligentes",
                desc: "Entenda para onde vai o dinheiro com gráficos claros e categorização automática."
              },
              {
                icon: Target,
                title: "Planejamento de Metas",
                desc: "Reserve dinheiro para o que realmente importa e acompanhe a evolução do patrimônio."
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-noir-surface border border-white/5 rounded-2xl hover:border-accent-primary/30 transition-colors group">
                <div className="w-12 h-12 bg-noir-active rounded-xl flex items-center justify-center text-heading mb-4 group-hover:bg-accent-primary group-hover:text-white transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-body text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent-primary/5" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comece a construir seu futuro hoje
          </h2>
          <p className="text-xl text-body mb-8">
            Junte-se a casais que já transformaram sua relação com o dinheiro.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-noir-primary rounded-full font-bold hover:bg-gray-100 transition-colors"
          >
            Criar conta gratuitamente
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-noir-surface border-t border-white/5 text-sm text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Wallet size={16} />
            <span className="font-semibold text-heading">FinançasPro</span>
          </div>
          <div className="text-center md:text-right">
            <p>&copy; {new Date().getFullYear()} FinançasPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
