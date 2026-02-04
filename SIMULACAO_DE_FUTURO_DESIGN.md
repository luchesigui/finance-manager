# Simulação de Futuro (Sandbox) - Design UX/UI

## Visão Geral

A funcionalidade de **Simulação de Futuro** é um ambiente isolado onde o usuário pode projetar cenários financeiros dos próximos 12 meses sem afetar os dados reais. O objetivo é responder perguntas como:

- "E se eu perder meu emprego?"
- "E se meu parceiro(a) reduzir a renda?"
- "Em quanto tempo atingirei minha meta de Liberdade Financeira?"
- "Qual é o impacto de reduzir meus gastos para o mínimo?"

---

## 1. Arquitetura de Informação

### 1.1 Estrutura da Página

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: "Simulação de Futuro" + Badge "Sandbox"                    │
│  Subtítulo: "Simule cenários sem afetar seus dados reais"           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ SEÇÃO A: PAINEL DE CONTROLES (Inputs)                       │    │
│  │ ┌─────────────────────┐  ┌─────────────────────────────┐    │    │
│  │ │ Gestão de           │  │ Cenários de Gasto           │    │    │
│  │ │ Participantes       │  │ • Minimalista (Custos Fixos)│    │    │
│  │ │ • Toggle On/Off     │  │ • Realista (Média 6 meses)  │    │    │
│  │ │ • Slider de Renda   │  │ • Personalizado             │    │    │
│  │ └─────────────────────┘  └─────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ SEÇÃO B: RESUMO DE IMPACTO (Cards Rápidos)                  │    │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │    │
│  │ │ Renda      │ │ Saldo Livre│ │ Rombo      │ │ Liberdade  │ │    │
│  │ │ Simulada   │ │ Médio/Mês  │ │ Acumulado  │ │ Financeira │ │    │
│  │ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ SEÇÃO C: GRÁFICO PRINCIPAL - Projeção 12 Meses              │    │
│  │ Gráfico de Área Empilhada: Renda vs Gastos vs Saldo         │    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────────────────┐  ┌───────────────────────────────┐    │
│  │ SEÇÃO D: Tabela Mensal   │  │ SEÇÃO E: Insights & Alertas   │    │
│  │ Detalhamento mês a mês   │  │ • "Rombo" em X meses          │    │
│  │ Renda | Gasto | Saldo    │  │ • Liberdade em Y meses        │    │
│  └──────────────────────────┘  └───────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Hierarquia Visual

| Prioridade | Elemento | Justificativa |
|------------|----------|---------------|
| 1 | Gráfico Principal | Visualização do impacto ao longo do tempo |
| 2 | Cards de Resumo | Feedback imediato das alterações |
| 3 | Controles de Participantes | Ajustes principais de renda |
| 4 | Seletor de Cenário | Troca rápida entre cenários |
| 5 | Tabela Detalhada | Análise granular mês a mês |

### 1.3 Fluxo do Usuário

```
1. Entrada na página
   └─> Estado inicial carrega dados reais (baseline)

2. Ajuste de participantes
   ├─> Toggle desliga participante → Renda zerada
   ├─> Slider ajusta % da renda → Renda proporcional
   └─> Feedback instantâneo nos cards e gráfico

3. Seleção de cenário de gastos
   ├─> Minimalista → Apenas custos fixos
   ├─> Realista → Média de 6 meses
   └─> Personalizado → Edição manual por categoria

4. Análise dos resultados
   ├─> Visualização do gráfico de projeção
   ├─> Leitura dos insights automáticos
   └─> Exploração da tabela mensal

5. Saída (sem persistência)
   └─> Dados da simulação descartados
```

---

## 2. Componentes Sugeridos

### 2.1 Painel de Gestão de Participantes

```tsx
// Componente: ParticipantSimulator
┌────────────────────────────────────────────────────────────────┐
│ 👤 João Silva                                    [━━━━━━━━━] ON │
│ ├── Renda Real: R$ 8.000,00                                    │
│ ├── Renda Simulada: R$ 8.000,00 (100%)                         │
│ └── [═══════════════════════════●═══] 100%                     │
│                                                                │
│ 👤 Maria Silva                                   [━━━━━━━━━] ON │
│ ├── Renda Real: R$ 6.000,00                                    │
│ ├── Renda Simulada: R$ 3.000,00 (50%)                          │
│ └── [═══════════════●════════════════] 50%                     │
│                                                                │
│ 👤 Carlos Santos                                 [         ] OFF│
│ ├── Renda Real: R$ 4.000,00                                    │
│ ├── Renda Simulada: R$ 0,00 (0%)           ⚠️ Desativado       │
│ └── [●═══════════════════════════════] 0%                      │
└────────────────────────────────────────────────────────────────┘
```

**Especificações do Componente:**

| Elemento | Tipo | Comportamento |
|----------|------|---------------|
| Toggle On/Off | Switch | Liga/desliga participante (0% ou último valor) |
| Slider de Renda | Range Input | 0-150% da renda real (permite simular aumento) |
| Renda Simulada | Label dinâmico | Atualiza em tempo real com o slider |
| Badge de Status | Pill | Mostra "Desativado" quando OFF |

**Estados do Toggle:**
- **ON (ativo)**: Fundo azul (`bg-accent-primary`), slider habilitado
- **OFF (inativo)**: Fundo cinza (`bg-noir-active`), slider desabilitado, renda = 0

### 2.2 Seletor de Cenários de Gasto

```tsx
// Componente: ScenarioSelector
┌────────────────────────────────────────────────────────────────┐
│ Cenário de Gastos                                              │
│                                                                │
│ ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│ │ 🏠 MINIMALISTA   │  │ 📊 REALISTA      │  │ ✏️ CUSTOM     │ │
│ │                  │  │                  │  │                │ │
│ │ Apenas Custos    │  │ Média dos        │  │ Definir        │ │
│ │ Fixos            │  │ últimos 6 meses  │  │ manualmente    │ │
│ │                  │  │                  │  │                │ │
│ │ R$ 4.500/mês     │  │ R$ 8.200/mês     │  │ R$ ---/mês     │ │
│ │ ○ Selecionar     │  │ ● Selecionado    │  │ ○ Selecionar   │ │
│ └──────────────────┘  └──────────────────┘  └────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

**Especificações:**

| Cenário | Cálculo | Uso Recomendado |
|---------|---------|-----------------|
| Minimalista | Soma da categoria "Custos Fixos" | Emergência, perda de emprego |
| Realista | Média dos gastos totais (6 meses) | Planejamento conservador |
| Personalizado | Edição manual por categoria | Análise detalhada |

**Visual do Card Selecionado:**
```css
/* Card Selecionado */
border: 2px solid var(--accent-primary);
background: rgba(59, 130, 246, 0.1);

/* Card Não Selecionado */
border: 1px solid var(--noir-border);
background: var(--noir-surface);
```

### 2.3 Cards de Resumo Rápido

```tsx
// Componente: SimulationSummaryCards
┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ 💰 RENDA       │ │ 💵 SALDO LIVRE │ │ 🔴 ROMBO       │ │ 💎 LIBERDADE   │
│    SIMULADA    │ │    MÉDIO/MÊS   │ │    ACUMULADO   │ │    FINANCEIRA  │
│                │ │                │ │                │ │                │
│ R$ 11.000      │ │ +R$ 2.800      │ │ -R$ 0          │ │ Meta em        │
│                │ │                │ │                │ │ 18 meses       │
│ vs R$ 18.000   │ │ 📈 +15.5%      │ │ ✅ Sem rombo   │ │ -3 meses       │
│ (-38.9%)       │ │    da renda    │ │                │ │ antecipação    │
│                │ │                │ │                │ │                │
│ [━━━━━━━━━━━]  │ │ [█████████░░]  │ │ [███████████]  │ │ [█████░░░░░░]  │
│ 61.1%          │ │ Saudável       │ │ OK             │ │ 42%            │
└────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
```

**Lógica de Cores:**

| Card | Condição Positiva | Condição Negativa |
|------|-------------------|-------------------|
| Renda Simulada | ≥ 80% da renda real | < 50% da renda real |
| Saldo Livre | > 0 | ≤ 0 |
| Rombo Acumulado | = 0 | > 0 |
| Liberdade Financeira | Adiantamento | Atraso |

### 2.4 Gráfico de Projeção (Área Empilhada)

```tsx
// Componente: FutureProjectionChart (usando Recharts)
```

**Estrutura do Gráfico:**

```
 R$
 ↑
20k│  ┌──────────────────────────────────────────
   │  │  RENDA TOTAL ████████████████████████████
   │  │  ████████████████████████████████████████
15k│  ├──────────────────────────────────────────
   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  GASTOS
   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
10k│  ├──────────────────────────────────────────
   │  │                                          
   │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  SALDO ACUMULADO
 5k│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 0 │──┼──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──→ Mês
      Fev Mar Abr Mai Jun Jul Ago Set Out Nov Dez Jan
      2026                                     2027
```

**Elementos Visuais:**

| Área | Cor | Opacidade |
|------|-----|-----------|
| Renda | `#3B82F6` (accent-primary) | 30% |
| Gastos | `#EF4444` (accent-negative) | 50% |
| Saldo Positivo | `#22C55E` (accent-positive) | 30% |
| Saldo Negativo | `#EF4444` (accent-negative) | 60% + hachura |

**Marcadores Especiais:**

```tsx
// Linha de referência para mês atual
<ReferenceLine
  x="Fev 2026"
  stroke="#94A3B8"
  strokeDasharray="3 3"
  label="Hoje"
/>

// Área de projeção (futura)
// Usar opacidade reduzida ou padrão pontilhado para indicar projeção
```

### 2.5 Tabela de Detalhamento Mensal

```tsx
// Componente: MonthlyBreakdownTable
┌──────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Mês      │ Renda       │ Gastos      │ Saldo Mês   │ Acumulado   │
├──────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ Fev 2026 │ R$ 11.000   │ R$ 8.200    │ +R$ 2.800   │ R$ 2.800    │
│ Mar 2026 │ R$ 11.000   │ R$ 8.200    │ +R$ 2.800   │ R$ 5.600    │
│ Abr 2026 │ R$ 11.000   │ R$ 8.200    │ +R$ 2.800   │ R$ 8.400    │
│ ...      │ ...         │ ...         │ ...         │ ...         │
│ Jan 2027 │ R$ 11.000   │ R$ 8.200    │ +R$ 2.800   │ R$ 33.600   │
├──────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ TOTAL    │ R$ 132.000  │ R$ 98.400   │ +R$ 33.600  │ —           │
└──────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

**Formatação Condicional:**

| Coluna | Verde | Vermelho |
|--------|-------|----------|
| Saldo Mês | Positivo | Negativo |
| Acumulado | Positivo | Negativo |
| Gastos | Abaixo do orçamento | Acima do orçamento |

---

## 3. Visualização de Impacto Negativo

### 3.1 Card de "Rombo" Financeiro

Quando a simulação resulta em déficit, o sistema exibe um card de alerta proeminente:

```tsx
// Componente: DeficitAlertCard
┌────────────────────────────────────────────────────────────────┐
│  ⚠️  ALERTA: DÉFICIT PROJETADO                                 │
│                                                                │
│  ┌────────────────────────┐  ┌────────────────────────────────┐│
│  │ ROMBO MENSAL           │  │ ROMBO ACUMULADO (12 meses)     ││
│  │                        │  │                                ││
│  │    -R$ 3.200           │  │    -R$ 38.400                  ││
│  │                        │  │                                ││
│  │ 💔 29% da renda        │  │ 🔴 Equivalente a 3.5 meses     ││
│  │    necessária falta    │  │    de renda familiar           ││
│  └────────────────────────┘  └────────────────────────────────┘│
│                                                                │
│  📅 Primeiro mês negativo: Março 2026                          │
│  📉 Saldo zerado em: Maio 2026 (3 meses)                       │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ TIMELINE DO DÉFICIT                                      │  │
│  │ Fev    Mar     Abr     Mai     Jun     Jul      ...      │  │
│  │ ✅     ⚠️      🔴      🔴      🔴      🔴              │  │
│  │ +2.8k  -1.2k   -3.2k   -3.2k   -3.2k   -3.2k            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Estilização do Card de Déficit:**

```css
/* Card de Déficit */
.deficit-card {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.1) 0%, 
    rgba(239, 68, 68, 0.05) 100%);
  border: 2px solid var(--accent-negative);
  border-left: 4px solid var(--accent-negative);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
}

/* Valores negativos destacados */
.deficit-value {
  color: var(--accent-negative);
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}
```

### 3.2 Gráfico com Zona de Déficit

No gráfico principal, a área de déficit é destacada visualmente:

```
 R$
 ↑
 5k│      ░░░░░
   │    ░░░░░░░░░░
   │  ░░░░░░░░░░░░░░░░
 0 │──────────────────────────────────────────── LINHA ZERO
   │                    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
-5k│                    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ← ZONA DE DÉFICIT
   │                    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   (vermelho + hachura)
-10│──┼──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──→
      Fev Mar Abr Mai Jun Jul Ago Set Out Nov Dez Jan
```

**Configuração do Recharts:**

```tsx
<Area
  type="monotone"
  dataKey="saldo"
  stroke="#EF4444"
  fill="url(#deficitPattern)"
  fillOpacity={0.6}
/>

// Padrão de hachura para área negativa
<defs>
  <pattern id="deficitPattern" patternUnits="userSpaceOnUse" width="4" height="4">
    <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" 
          stroke="#EF4444" 
          strokeWidth="1" 
          strokeOpacity="0.5"/>
  </pattern>
</defs>
```

### 3.3 Mensagens de Alerta Contextuais

```tsx
// Componente: SimulationAlerts
const alertMessages = {
  deficit_warning: {
    icon: "⚠️",
    title: "Atenção: Déficit em {{months}} meses",
    message: "Com a renda de {{person}} zerada, o saldo ficará negativo a partir de {{month}}.",
    severity: "warning"
  },
  deficit_critical: {
    icon: "🚨",
    title: "Crítico: Reserva esgotada em {{months}} meses",
    message: "Considerando sua reserva atual de {{reserve}}, os recursos se esgotarão em {{date}}.",
    severity: "critical"
  },
  no_income: {
    icon: "🔴",
    title: "Renda zerada",
    message: "Nenhum participante está contribuindo com renda nesta simulação.",
    severity: "critical"
  }
};
```

---

## 4. Visualização de Impacto Positivo

### 4.1 Card de Aceleração da Liberdade Financeira

Quando a simulação mostra um cenário favorável:

```tsx
// Componente: FreedomAccelerationCard
┌────────────────────────────────────────────────────────────────┐
│  🎯  IMPACTO NA LIBERDADE FINANCEIRA                           │
│                                                                │
│  ┌────────────────────────────────┐                            │
│  │                                │                            │
│  │     Meta Atual    Meta Simulada│                            │
│  │        ↓              ↓        │                            │
│  │   Dez 2028       Jul 2028      │                            │
│  │                                │                            │
│  │   ════════════●════════════    │ ← Linha do tempo           │
│  │                 ↖              │                            │
│  │               5 MESES          │                            │
│  │               ANTECIPADOS      │                            │
│  │                                │                            │
│  └────────────────────────────────┘                            │
│                                                                │
│  💎 Aumento do Aporte Mensal: +R$ 800 (de R$ 1.200 → R$ 2.000) │
│  📈 Taxa de Poupança: 18.2% → 25.5% da renda                   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PROJEÇÃO DO PATRIMÔNIO                                   │  │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  │ R$ 150k ───────────────────────────── ← Meta              │  │
│  │ Atual: R$ 45k                     Projetado: R$ 150k      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Estilização do Card Positivo:**

```css
/* Card de Aceleração */
.acceleration-card {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.1) 0%, 
    rgba(34, 197, 94, 0.05) 100%);
  border: 2px solid var(--accent-positive);
  border-left: 4px solid var(--accent-positive);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
}

/* Valores de destaque positivos */
.positive-highlight {
  color: var(--accent-positive);
  font-size: 1.5rem;
  font-weight: 700;
  animation: pulse 2s infinite;
}
```

### 4.2 Card de Saldo Livre Aumentado

```tsx
// Componente: IncreasedBalanceCard
┌────────────────────────────────────────────────────────────────┐
│  💰  SALDO LIVRE PROJETADO                                     │
│                                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  Cenário Atual      vs      Cenário Simulado              │ │
│  │                                                           │ │
│  │    R$ 1.200                   R$ 3.800                    │ │
│  │    por mês                    por mês                     │ │
│  │                                                           │ │
│  │              ↑ +R$ 2.600 (+216%)                          │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                │
│  📊 Comparativo Visual:                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Atual:    [████████░░░░░░░░░░░░░░░░░░░░░░] 15%           │  │
│  │ Simulado: [████████████████████████████░░░] 47%          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  💡 Com esse saldo extra você poderia:                         │
│  • Investir R$ 31.200 a mais por ano                           │
│  • Quitar uma dívida de R$ 30k em 8 meses                      │
│  • Formar uma reserva de emergência de 6 meses em 5 meses      │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 Indicadores Comparativos

```tsx
// Componente: ComparisonIndicator
const ComparisonIndicator = ({ current, simulated, label }) => {
  const diff = simulated - current;
  const percentChange = ((diff / current) * 100).toFixed(1);
  const isPositive = diff > 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted">{label}:</span>
      <span className={isPositive ? "text-accent-positive" : "text-accent-negative"}>
        {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}{formatCurrency(diff)}
        <span className="text-xs ml-1">({percentChange}%)</span>
      </span>
    </div>
  );
};
```

---

## 5. Micro-interações

### 5.1 Feedback do Slider de Renda

```tsx
// Comportamento do Slider
const IncomeSlider = ({ person, onValueChange }) => {
  const [value, setValue] = useState(100);
  const [isMoving, setIsMoving] = useState(false);
  
  return (
    <div className="relative">
      {/* Tooltip flutuante que segue o thumb */}
      {isMoving && (
        <div 
          className="absolute -top-10 transform -translate-x-1/2 
                     bg-noir-surface border border-noir-border rounded-lg 
                     px-3 py-1 shadow-lg animate-in fade-in duration-150"
          style={{ left: `${value}%` }}
        >
          <span className="text-heading font-bold tabular-nums">
            {formatCurrency(person.income * (value / 100))}
          </span>
          <span className="text-muted text-xs ml-1">({value}%)</span>
        </div>
      )}
      
      <input
        type="range"
        min={0}
        max={150}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onMouseDown={() => setIsMoving(true)}
        onMouseUp={() => setIsMoving(false)}
        onTouchStart={() => setIsMoving(true)}
        onTouchEnd={() => setIsMoving(false)}
        className="w-full slider-income"
      />
      
      {/* Marcadores visuais */}
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
        <span>150%</span>
      </div>
    </div>
  );
};
```

**Estilo do Slider:**

```css
/* Slider customizado */
.slider-income {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 9999px;
  background: linear-gradient(to right, 
    var(--accent-negative) 0%, 
    var(--accent-warning) 33%, 
    var(--accent-positive) 66%, 
    var(--accent-primary) 100%);
  outline: none;
  transition: all 0.2s;
}

.slider-income::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--text-heading);
  border: 3px solid var(--accent-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s, box-shadow 0.15s;
}

.slider-income::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 12px var(--accent-primary);
}

.slider-income::-webkit-slider-thumb:active {
  transform: scale(1.15);
}
```

### 5.2 Toggle de Participante

```tsx
// Animação do Toggle
const ParticipantToggle = ({ isActive, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-14 h-7 rounded-full transition-all duration-300
        ${isActive 
          ? 'bg-accent-primary shadow-glow-accent' 
          : 'bg-noir-active'}
      `}
    >
      {/* Thumb com ícone */}
      <div
        className={`
          absolute top-0.5 w-6 h-6 rounded-full bg-white
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${isActive ? 'left-7' : 'left-0.5'}
        `}
      >
        {isActive ? (
          <CheckIcon className="w-4 h-4 text-accent-positive animate-in zoom-in duration-200" />
        ) : (
          <XIcon className="w-4 h-4 text-accent-negative animate-in zoom-in duration-200" />
        )}
      </div>
      
      {/* Feedback tátil/visual */}
      <div
        className={`
          absolute inset-0 rounded-full transition-all duration-300
          ${isActive ? 'bg-accent-primary/20' : 'bg-noir-active/20'}
        `}
        style={{
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
          opacity: isActive ? 1 : 0
        }}
      />
    </button>
  );
};
```

### 5.3 Atualização do Gráfico em Tempo Real

```tsx
// Animação suave de transição no gráfico
const chartConfig = {
  // Transição de dados
  animationDuration: 500,
  animationEasing: 'ease-out',
  
  // Destaque da área modificada
  onDataChange: (prevData, newData) => {
    return {
      ...newData,
      animationBegin: 0,
      animationDuration: 500,
      animationEasing: 'ease-out'
    };
  }
};

// CSS para highlight da mudança
.chart-highlight-change {
  animation: pulse-border 0.5s ease-out;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}
```

### 5.4 Cards de Resumo - Contador Animado

```tsx
// Animação de contagem em valores monetários
const AnimatedCurrency = ({ value, duration = 500 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(value);
  
  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
    previousValue.current = value;
  }, [value, duration]);
  
  return (
    <span className="tabular-nums">
      {formatCurrency(displayValue)}
    </span>
  );
};
```

### 5.5 Feedback de Cenário Selecionado

```tsx
// Transição ao selecionar cenário
const ScenarioCard = ({ scenario, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`
        relative overflow-hidden p-4 rounded-card border-2
        transition-all duration-300 ease-out
        ${isSelected 
          ? 'border-accent-primary bg-accent-primary/10 scale-[1.02]' 
          : 'border-noir-border bg-noir-surface hover:border-noir-border-light'}
      `}
    >
      {/* Ícone com animação de check */}
      <div className="absolute top-2 right-2">
        {isSelected ? (
          <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center animate-in zoom-in duration-200">
            <CheckIcon className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-noir-border" />
        )}
      </div>
      
      {/* Efeito de ripple ao clicar */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`
          absolute inset-0 bg-accent-primary/10 rounded-card
          transition-transform duration-500
          ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        `} />
      </div>
      
      <div className="relative z-10">
        {/* Conteúdo do card */}
      </div>
    </button>
  );
};
```

### 5.6 Loading States

```tsx
// Skeleton enquanto calcula projeção
const SimulationSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {/* Cards skeleton */}
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="noir-card p-4">
          <div className="h-4 w-24 bg-noir-active rounded mb-2" />
          <div className="h-8 w-32 bg-noir-active rounded" />
        </div>
      ))}
    </div>
    
    {/* Chart skeleton */}
    <div className="noir-card p-4">
      <div className="h-64 bg-noir-active rounded flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted">
          <LoaderIcon className="w-5 h-5 animate-spin" />
          <span>Calculando projeção...</span>
        </div>
      </div>
    </div>
  </div>
);
```

---

## 6. Acessibilidade

### 6.1 Navegação por Teclado

```tsx
// Componentes de simulação devem ser navegáveis por teclado
const SimulationControls = () => {
  return (
    <div role="group" aria-label="Controles de Simulação">
      {/* Slider acessível */}
      <div role="slider"
           aria-valuemin={0}
           aria-valuemax={150}
           aria-valuenow={value}
           aria-valuetext={`${value}% da renda, equivalente a ${formatCurrency(income * value / 100)}`}
           tabIndex={0}
           onKeyDown={handleKeyDown}
      />
      
      {/* Toggle acessível */}
      <button
        role="switch"
        aria-checked={isActive}
        aria-label={`${person.name}: ${isActive ? 'ativo' : 'inativo'}`}
      />
    </div>
  );
};
```

### 6.2 Anúncios para Screen Readers

```tsx
// Anunciar mudanças importantes
const useSimulationAnnouncer = () => {
  const [announcement, setAnnouncement] = useState('');
  
  const announceChange = (message: string) => {
    setAnnouncement(message);
    // Limpar após leitura
    setTimeout(() => setAnnouncement(''), 1000);
  };
  
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      {/* Uso: announceChange("Déficit projetado de 3 mil reais por mês") */}
    </>
  );
};
```

---

## 7. Responsividade

### 7.1 Layout Mobile

```
┌─────────────────────────────────┐
│ Simulação de Futuro   [Sandbox] │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ CENÁRIO: Realista      ▼    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 João        [ON] ══●══   │ │
│ │ 👤 Maria       [ON] ═●═══   │ │
│ │ 👤 Carlos      [--] ●═════  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Renda       │ │ Saldo       │ │
│ │ R$ 11k      │ │ +R$ 2.8k    │ │
│ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Rombo       │ │ Liberdade   │ │
│ │ R$ 0        │ │ 18 meses    │ │
│ └─────────────┘ └─────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [GRÁFICO - Scroll Horiz.]   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [TABELA - Accordion]        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 7.2 Breakpoints

```css
/* Mobile First */
.simulation-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .simulation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-container {
    grid-column: span 2;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .simulation-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .controls-panel {
    grid-column: span 4;
  }
  
  .chart-container {
    grid-column: span 3;
  }
  
  .insights-panel {
    grid-column: span 1;
  }
}
```

---

## 8. Estados da Interface

### 8.1 Estado Inicial (Baseline)

```
┌────────────────────────────────────────────────┐
│ 💡 Dica: Ajuste os controles para ver o        │
│    impacto em sua projeção financeira.         │
│                                                │
│    Nenhuma alteração foi feita ainda.          │
└────────────────────────────────────────────────┘
```

### 8.2 Estado Modificado

```
┌────────────────────────────────────────────────┐
│ ⚡ Simulação ativa                              │
│                                                │
│ Alterações:                                    │
│ • Maria Silva: 100% → 50%                      │
│ • Cenário: Realista                            │
│                                                │
│ [🔄 Resetar para valores reais]                │
└────────────────────────────────────────────────┘
```

### 8.3 Estado de Erro

```
┌────────────────────────────────────────────────┐
│ ❌ Não foi possível calcular a projeção        │
│                                                │
│ Motivo: Dados insuficientes para o cenário     │
│ "Média de 6 meses".                            │
│                                                │
│ [Usar cenário Minimalista]  [Tentar novamente] │
└────────────────────────────────────────────────┘
```

---

## 9. Métricas de Sucesso

### 9.1 KPIs da Feature

| Métrica | Meta | Medição |
|---------|------|---------|
| Tempo para primeira simulação | < 10s | Analytics |
| Taxa de conclusão do fluxo | > 70% | Funnel |
| Interações por sessão | > 5 ajustes | Events |
| NPS da feature | > 50 | Survey |

### 9.2 Eventos de Analytics

```typescript
// Eventos a serem rastreados
const simulationEvents = {
  PAGE_VIEW: 'simulation_page_viewed',
  PARTICIPANT_TOGGLED: 'simulation_participant_toggled',
  INCOME_ADJUSTED: 'simulation_income_adjusted',
  SCENARIO_CHANGED: 'simulation_scenario_changed',
  DEFICIT_SHOWN: 'simulation_deficit_shown',
  FREEDOM_ACCELERATED: 'simulation_freedom_accelerated',
  SESSION_COMPLETED: 'simulation_session_completed'
};
```

---

## 10. Considerações Técnicas

### 10.1 Performance

- **Debounce** nos sliders: 150ms
- **Memoização** do cálculo de projeção
- **Virtualização** da tabela se > 24 meses
- **Lazy loading** do gráfico

### 10.2 Estrutura de Dados

```typescript
interface SimulationState {
  participants: {
    id: string;
    isActive: boolean;
    incomeMultiplier: number; // 0 to 1.5
  }[];
  scenario: 'minimalist' | 'realistic' | 'custom';
  customExpenses?: Record<string, number>; // categoryId -> amount
}

interface ProjectionResult {
  months: {
    period: string;
    income: number;
    expenses: number;
    balance: number;
    cumulativeBalance: number;
  }[];
  summary: {
    avgMonthlyBalance: number;
    totalDeficit: number;
    firstDeficitMonth: string | null;
    freedomTargetDate: string;
    freedomAcceleration: number; // meses antecipados
  };
}
```

---

## Conclusão

Este documento define a arquitetura de informação, componentes visuais, padrões de interação e considerações técnicas para a feature de **Simulação de Futuro**. O design prioriza:

1. **Clareza** - Feedback visual imediato das alterações
2. **Impacto** - Destaque claro de cenários positivos e negativos
3. **Segurança** - Ambiente sandbox sem afetar dados reais
4. **Acessibilidade** - Suporte a navegação por teclado e leitores de tela
5. **Responsividade** - Experiência otimizada para mobile e desktop

O próximo passo é a implementação dos componentes seguindo os padrões existentes do FinançasPro, utilizando o design system "Financial Noir" já estabelecido no projeto.
