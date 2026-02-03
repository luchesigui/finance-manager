# Dashboard Control Panel - Implementation Plan

## Overview

This document outlines the plan for a new **Dashboard Control Panel** that provides a comprehensive, at-a-glance view of household financial health. The dashboard will integrate all existing features (default income, track history, outliers, and categories) into an actionable control center that clearly communicates whether finances are in good or bad shape.

## Design Philosophy

The dashboard should answer one critical question: **"Are we doing well financially?"**

It should:
- Provide immediate visual feedback (green = good, red = bad, yellow = warning)
- Surface important alerts and required actions
- Show trends and historical context
- Be scannable in under 5 seconds for the quick answer
- Provide drill-down details for deeper analysis

---

## Core Components

### 1. Financial Health Score (Hero Section)

A prominent visual indicator at the top of the dashboard showing overall financial health.

**Implementation:**
```
┌─────────────────────────────────────────────────────────────────┐
│  SAÚDE FINANCEIRA: [SAUDÁVEL / ATENÇÃO / CRÍTICO]              │
│  ████████████████████░░░░  78/100                              │
│  "Saldo livre positivo, 2 categorias acima do orçamento"       │
└─────────────────────────────────────────────────────────────────┘
```

**Score Calculation Factors:**
| Factor | Weight | Criteria |
|--------|--------|----------|
| Free Balance | 40% | Positive = good, Negative = bad |
| Categories on Budget | 25% | % of categories within target |
| Outliers | 15% | Number of unusual expenses flagged |
| Settlement Status | 10% | Whether fair distribution is balanced |
| Savings Goal (Liberdade Financeira) | 10% | Meeting savings target |

**Visual States:**
- **Saudável (80-100)**: Green glow, checkmark icon
- **Atenção (50-79)**: Yellow/amber, warning icon
- **Crítico (0-49)**: Red glow, alert icon

---

### 2. Quick Stats Grid (4 Cards)

Four key metrics displayed prominently below the health score.

#### Card A: Saldo Livre (Free Balance)
- **Primary**: Current month free balance amount (colored green/red)
- **Secondary**: Percentage of income remaining
- **Trend**: Arrow up/down vs. previous month

#### Card B: Total Gasto vs Orçamento
- **Primary**: Total expenses this month
- **Secondary**: Progress bar showing % of planned budget used
- **Status Badge**: "Dentro" or "Acima" do orçamento

#### Card C: Renda Efetiva
- **Primary**: Effective household income (base + adjustments)
- **Secondary**: Income changes this month (increments/decrements)
- **Icon**: Trending up/down indicator

#### Card D: Próximo Acerto
- **Primary**: Settlement amount (who owes whom)
- **Secondary**: Person names and direction
- **Status**: "Quitado" or amount to transfer

---

### 3. Alerts & Actions Panel

A notification-style panel highlighting items requiring attention.

**Alert Types:**

| Priority | Type | Trigger | Action |
|----------|------|---------|--------|
| High | 🔴 Saldo Negativo | Free balance < 0 | Review expenses |
| High | 🔴 Categoria Estourada | Category > 150% target | Check transactions |
| Medium | 🟡 Gastos Atípicos | Outliers detected | Review flagged items |
| Medium | 🟡 Previsões Pendentes | Forecasts awaiting confirmation | Confirm or adjust |
| Low | 🔵 Meta não Atingida | Savings below target | Adjust spending |
| Info | ⚪ Acerto Pendente | Settlement needed | Transfer funds |

**Display Format:**
```
┌─ ATENÇÃO NECESSÁRIA ─────────────────────────────────────────┐
│ 🔴 2 categorias acima do orçamento                    [Ver →]│
│ 🟡 3 gastos fora do padrão detectados                 [Ver →]│
│ 🟡 R$ 450,00 em previsões aguardando confirmação      [Ver →]│
│ ⚪ Amanda deve transferir R$ 234,50 para Guilherme    [Ver →]│
└──────────────────────────────────────────────────────────────┘
```

---

### 4. Category Budget Overview

Visual representation of all categories showing budget vs. actual spending.

**Display Options:**

#### Option A: Horizontal Bar Chart
```
Moradia      [████████████████░░░░░░] 75% (R$ 2.250 / R$ 3.000)
Alimentação  [██████████████████████████░] 130% ⚠️
Transporte   [████████░░░░░░░░░░░░░░] 40%
Lazer        [████████████░░░░░░░░░░] 60%
```

#### Option B: Radial/Donut Chart
- Center: Total spent vs total income
- Segments: Each category proportionally colored
- Hover: Shows category details

#### Option C: Traffic Light Grid
```
┌─────────┬─────────┬─────────┬─────────┐
│ Moradia │  Alim.  │ Transp. │  Lazer  │
│   🟢    │   🔴    │   🟢    │   🟢    │
│   75%   │  130%   │   40%   │   60%   │
└─────────┴─────────┴─────────┴─────────┘
```

**Recommendation:** Start with Option A (horizontal bars) as it's most scannable.

---

### 5. Monthly Trend Chart

A line/area chart showing financial patterns over time.

**Data Series:**
1. **Total Expenses** (red line)
2. **Total Income** (green line)
3. **Free Balance** (blue area fill)

**Time Range:** Last 6 months with current month highlighted

**Interactive Features:**
- Hover for monthly details
- Click to navigate to that month's detailed view

**Key Insights Displayed:**
- Average monthly expenses
- Month with highest/lowest spending
- Trend direction (improving/declining)

---

### 6. Outlier Spotlight

Dedicated section for expense anomalies to increase awareness.

**Display:**
```
┌─ GASTOS FORA DO PADRÃO ──────────────────────────────────────┐
│                                                               │
│  📍 iFood - R$ 350,00                          Alimentação   │
│     Média histórica: R$ 85,00 (+312%)             [Revisar]  │
│                                                               │
│  📍 Manutenção Carro - R$ 1.200,00              Transporte   │
│     Média histórica: R$ 200,00 (+500%)            [Revisar]  │
│                                                               │
│  Total em outliers: R$ 1.550,00 (15% do total gasto)         │
└──────────────────────────────────────────────────────────────┘
```

**Actions:**
- Mark as "Expected" (one-time expense)
- Mark as "Exclude from split"
- Navigate to edit transaction

---

### 7. Income Distribution Visualization

Shows how household income is divided between participants.

**Display:**
```
DISTRIBUIÇÃO DE RENDA
┌────────────────────────────────────────────────┐
│  Guilherme  [████████████████████░░] 65%      │
│             R$ 8.500,00                        │
│                                                │
│  Amanda     [████████████░░░░░░░░░░] 35%      │
│             R$ 4.500,00                        │
├────────────────────────────────────────────────┤
│  Total Familiar: R$ 13.000,00                  │
│  Ajustes este mês: +R$ 500,00                  │
└────────────────────────────────────────────────┘
```

---

### 8. Quick Actions Footer

Prominent action buttons for common tasks.

**Actions:**
- ➕ Adicionar Despesa
- 📊 Ver Transações
- ⚙️ Configurações
- 📅 Mudar Mês

---

## Data Requirements

### New API Endpoints Needed

#### 1. `/api/dashboard/health-score`
Returns calculated health score and factors.

```typescript
type HealthScoreResponse = {
  score: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
  factors: {
    freeBalance: { score: number; value: number };
    categoriesOnBudget: { score: number; onBudget: number; total: number };
    outliers: { score: number; count: number };
    settlement: { score: number; balanced: boolean };
    savingsGoal: { score: number; actual: number; target: number };
  };
  summary: string;
};
```

#### 2. `/api/dashboard/trends`
Returns historical data for trend visualization.

```typescript
type TrendsResponse = {
  months: {
    yearMonth: string; // "2024-01"
    income: number;
    expenses: number;
    freeBalance: number;
    categoryBreakdown: Record<string, number>;
  }[];
  averages: {
    monthlyExpenses: number;
    monthlyIncome: number;
    monthlyBalance: number;
  };
};
```

#### 3. `/api/dashboard/alerts`
Returns active alerts requiring attention.

```typescript
type AlertsResponse = {
  alerts: {
    id: string;
    type: 'critical' | 'warning' | 'info';
    category: 'budget' | 'outlier' | 'forecast' | 'settlement';
    title: string;
    description: string;
    action?: { label: string; href: string };
  }[];
};
```

### Reused Existing Data
- People & incomes: `usePeople()`
- Categories & targets: `useCategories()`
- Transactions: `useTransactions()`
- Outlier detection: `useOutlierDetection()`
- Finance calculations: `useFinanceCalculations`

---

## UI/UX Considerations

### Responsive Design

**Desktop (lg+):**
- Health score: full width hero
- Quick stats: 4 columns
- Categories + Trends: 2 columns side by side
- Alerts: sidebar or integrated

**Tablet (md):**
- Quick stats: 2x2 grid
- Categories + Trends: stacked
- Alerts: collapsible panel

**Mobile (sm):**
- All sections: single column, stacked
- Health score: simplified
- Categories: swipeable cards

### Accessibility
- Color-coded elements should have icon alternatives
- All interactive elements keyboard accessible
- Screen reader friendly labels
- Sufficient color contrast ratios

### Performance
- Lazy load trend charts (not critical for initial view)
- Cache health score calculation (5 min TTL)
- Use React Query for data fetching with stale-while-revalidate

---

## Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Health Score component with basic calculation
- [ ] Quick Stats grid (4 cards)
- [ ] Basic Alerts panel
- [ ] Category budget bars

### Phase 2: Visualization
- [ ] Monthly trend chart (using a charting library like Recharts)
- [ ] Income distribution visualization
- [ ] Enhanced category visualization

### Phase 3: Intelligence
- [ ] Outlier spotlight section
- [ ] Trend insights and recommendations
- [ ] Predictive alerts (e.g., "At this rate, you'll exceed budget by...")

### Phase 4: Polish
- [ ] Animations and transitions
- [ ] Mobile optimizations
- [ ] Dark mode refinements
- [ ] Tutorial/onboarding for new users

---

## Technical Stack Recommendations

### Charting Library
**Recommendation: Recharts**
- Already compatible with React
- Good TypeScript support
- Responsive and customizable
- Lightweight

### State Management
Continue using existing patterns:
- React Query for server state
- React Context for shared state
- Local state for UI interactions

### New Components to Create

```
components/
  dashboard/
    HealthScore.tsx          # Hero health indicator
    QuickStatsGrid.tsx       # 4 metric cards
    AlertsPanel.tsx          # Notifications/warnings
    CategoryBudgetChart.tsx  # Category vs budget
    MonthlyTrendChart.tsx    # Historical trends
    OutlierSpotlight.tsx     # Anomaly highlighting
    IncomeDistribution.tsx   # Income split visual
    DashboardActions.tsx     # Quick action buttons
```

### New Hooks to Create

```
hooks/
  useHealthScore.ts          # Calculate overall score
  useDashboardAlerts.ts      # Generate alerts from data
  useMonthlyTrends.ts        # Fetch/calculate trends
```

---

## Success Metrics

After implementation, measure:

1. **Time to insight**: How quickly can users understand their financial status?
   - Target: < 5 seconds for health score comprehension

2. **Action rate**: Do users take recommended actions?
   - Track clicks on alert actions

3. **Return visits**: Is the dashboard the go-to entry point?
   - Target: 70%+ sessions start at dashboard

4. **User satisfaction**: Does it feel helpful?
   - Gather qualitative feedback

---

## Mockup Reference

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 Finanças Familiares                        Janeiro 2024 ▼  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ╔═══════════════════════════════════════════════════════╗    │
│   ║  SAÚDE FINANCEIRA                                     ║    │
│   ║  ████████████████████░░░░░░░░  75/100                 ║    │
│   ║  😊 ATENÇÃO - 2 categorias precisam de atenção        ║    │
│   ╚═══════════════════════════════════════════════════════╝    │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ SALDO    │ │ GASTOS   │ │ RENDA    │ │ ACERTO   │          │
│  │ LIVRE    │ │ DO MÊS   │ │ EFETIVA  │ │ PENDENTE │          │
│  │          │ │          │ │          │ │          │          │
│  │ +R$2.450 │ │ R$10.550 │ │ R$13.000 │ │ R$234,50 │          │
│  │ ↑ 12%    │ │ 81% orcam│ │ +R$500   │ │ Amanda→  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌─ ATENÇÃO NECESSÁRIA ─────────────────────────────────────┐  │
│  │ 🔴 Alimentação acima do orçamento (130%)          [Ver] │  │
│  │ 🟡 2 gastos fora do padrão detectados             [Ver] │  │
│  │ 🟡 R$450 em previsões aguardando confirmação      [Ver] │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ CATEGORIAS ─────────────────────────────────────────────┐  │
│  │ Moradia      [████████████████░░░░░░] 75%  R$2.250      │  │
│  │ Alimentação  [██████████████████████████░] 130% ⚠️      │  │
│  │ Transporte   [████████░░░░░░░░░░░░░░] 40%  R$520       │  │
│  │ Lazer        [████████████░░░░░░░░░░] 60%  R$360       │  │
│  │ Lib.Financ.  [████████████████░░░░░░] 80%  R$1.600 ✓   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ TENDÊNCIA (6 MESES) ────────────────────────────────────┐  │
│  │        Renda ──── Gastos ---- Saldo                      │  │
│  │  15k│ ──────────────────────                             │  │
│  │     │    ──────         ──────                           │  │
│  │  10k│ ------   --------      ------                      │  │
│  │     │                                                    │  │
│  │   5k│ ████████████████████████████████                   │  │
│  │     └────────────────────────────────                    │  │
│  │       Ago  Set  Out  Nov  Dez  Jan                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [➕ Nova Despesa]  [📊 Transações]  [⚙️ Configurar]    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conclusion

This dashboard plan provides a comprehensive control panel that leverages all existing features to give users immediate insight into their financial health. The phased approach allows for iterative development while delivering value early.

Key differentiators:
1. **Health Score**: Single metric that summarizes everything
2. **Smart Alerts**: Proactive notifications prevent problems
3. **Visual Budget Tracking**: Instant category status
4. **Historical Context**: Trends inform decisions

The implementation should prioritize the Health Score and Quick Stats first, as these provide the most value with the least complexity.
