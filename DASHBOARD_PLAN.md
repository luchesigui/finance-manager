# Dashboard Control Panel - Implementation Plan

## Overview

This document outlines the plan for a new **Dashboard Control Panel** that provides a comprehensive, at-a-glance view of household financial health. The dashboard will integrate all existing features (default income, track history, outliers, and categories) into an actionable control center that clearly communicates whether finances are in good or bad shape.

## Design Philosophy

The dashboard should answer one critical question: **"Are we building financial freedom?"**

The core metric is whether we're meeting our **Liberdade Financeira** (Financial Freedom) savings goal. This is the primary indicator of financial health - not just having money left over, but consistently investing in our future.

It should:
- Provide immediate visual feedback (green = good, red = bad, yellow = warning)
- Prioritize savings goal achievement as the main success metric
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
| Liberdade Financeira (Savings Goal) | 40% | Meeting/exceeding savings target is THE priority |
| Categories on Budget | 25% | % of categories within target |
| Outliers | 15% | Number of unusual expenses flagged |
| Settlement Status | 10% | Whether fair distribution is balanced |
| Free Balance | 10% | Positive = good, Negative = bad |

> **Why Liberdade Financeira is #1:** The ultimate measure of financial health isn't having money left over at month's end - it's consistently building wealth through disciplined savings. Meeting the savings target means we're paying ourselves first and building toward financial independence.

**Visual States:**
- **Saudável (80-100)**: Green glow, checkmark icon
- **Atenção (50-79)**: Yellow/amber, warning icon
- **Crítico (0-49)**: Red glow, alert icon

**🎉 Savings Goal Celebration (Confetti)**

When the Liberdade Financeira savings goal is achieved (≥100% of target), trigger a confetti animation to celebrate the achievement.

**Implementation Details:**
- Use a library like `canvas-confetti` or `react-confetti`
- Confetti triggers once when the dashboard loads and goal is met
- Controlled by a cookie (`savings_goal_celebrated_{yearMonth}`) with 7-day expiration
- Cookie prevents confetti from showing repeatedly during the same achievement period
- If user achieves goal, sees confetti, then the month changes to a new month where goal is also met, confetti shows again (new achievement)

**Cookie Logic:**
```typescript
const CELEBRATION_COOKIE = `savings_goal_celebrated_${currentYearMonth}`;
const hasSeenCelebration = getCookie(CELEBRATION_COOKIE);

if (savingsGoalAchieved && !hasSeenCelebration) {
  triggerConfetti();
  setCookie(CELEBRATION_COOKIE, 'true', { expires: 7 }); // 7 days
}
```

**Confetti Configuration:**
- Duration: ~3 seconds
- Colors: Gold, green (success colors)
- Origin: Center-top of screen
- Non-blocking: User can still interact with dashboard

---

### 2. Quick Stats Grid (4 Cards)

Four key metrics displayed prominently below the health score.

#### Card A: Liberdade Financeira (PRIMARY - highlighted)
- **Primary**: Amount saved this month toward financial freedom
- **Secondary**: Progress bar showing % of target achieved (e.g., "R$ 1.600 de R$ 2.000")
- **Status Badge**: "Meta Atingida ✓" or "Faltam R$ X"
- **Trend**: Arrow up/down vs. previous month average
- **Visual**: This card should be visually distinct (accent border/glow when on target)

#### Card B: Total Gasto vs Orçamento
- **Primary**: Total expenses this month
- **Secondary**: Progress bar showing % of planned budget used
- **Status Badge**: "Dentro" or "Acima" do orçamento

#### Card C: Renda Efetiva
- **Primary**: Effective household income (base + adjustments)
- **Secondary**: Income changes this month (increments/decrements)
- **Icon**: Trending up/down indicator

#### Card D: Saldo Livre (Free Balance)
- **Primary**: Current month free balance amount (colored green/red)
- **Secondary**: Percentage of income remaining
- **Trend**: Arrow up/down vs. previous month

---

### 3. Alerts & Actions Panel

A notification-style panel highlighting items requiring attention.

**Alert Types:**

| Priority | Type | Trigger | Action |
|----------|------|---------|--------|
| High | 🔴 Meta Lib. Financeira | Savings < 80% of target | Prioritize savings |
| High | 🔴 Saldo Negativo | Free balance < 0 | Review expenses |
| High | 🔴 Categoria Estourada | Category > 150% target | Check transactions |
| Medium | 🟡 Lib. Financeira em Risco | Savings 80-99% of target | Monitor closely |
| Medium | 🟡 Gastos Atípicos | Outliers detected | Review flagged items |
| Medium | 🟡 Previsões Pendentes | Forecasts awaiting confirmation | Confirm or adjust |
| Info | ⚪ Acerto Pendente | Settlement needed | Transfer funds |
| Success | ✅ Meta Atingida | Savings >= 100% target | Celebrate! |

**Display Format:**
```
┌─ ATENÇÃO NECESSÁRIA ─────────────────────────────────────────┐
│ 🔴 2 categorias acima do orçamento                           │
│ 🟡 3 gastos fora do padrão detectados                        │
│ 🟡 R$ 450,00 em previsões aguardando confirmação             │
│ ⚪ Amanda deve transferir R$ 234,50 para Guilherme           │
└──────────────────────────────────────────────────────────────┘
```

> **Note:** Alerts are informational only - no action buttons. Users navigate to the relevant sections themselves if they want to take action.

---

### 4. Category Budget Overview

Visual representation of all categories showing budget vs. actual spending using horizontal bar charts.

**Display: Horizontal Bar Chart**
```
⭐ Lib.Financ. [████████████████░░░░░░] 80% (R$ 1.600 / R$ 2.000)
Moradia       [████████████████░░░░░░] 75% (R$ 2.250 / R$ 3.000)
Alimentação   [██████████████████████████░] 130% ⚠️
Transporte    [████████░░░░░░░░░░░░░░] 40%
Lazer         [████████████░░░░░░░░░░] 60%
```

**Features:**
- Liberdade Financeira always shown first with star icon
- Color coding: green (under budget), yellow (near limit), red (over budget)
- Shows both percentage and absolute values
- Warning icon (⚠️) for categories exceeding target

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

Dedicated section for expense anomalies to increase awareness. This is a **read-only visualization** - users can navigate to the Transactions page if they want to take action on any item.

**Display:**
```
┌─ GASTOS FORA DO PADRÃO ──────────────────────────────────────┐
│                                                               │
│  📍 iFood - R$ 350,00                          Alimentação   │
│     Média histórica: R$ 85,00 (+312%)                        │
│                                                               │
│  📍 Manutenção Carro - R$ 1.200,00              Transporte   │
│     Média histórica: R$ 200,00 (+500%)                       │
│                                                               │
│  ─────────────────────────────────────────────────────────   │
│  Total em outliers: R$ 1.550,00 (15% do total gasto)         │
└──────────────────────────────────────────────────────────────┘
```

**Data Shown:**
- Transaction description and amount
- Category
- Historical average for comparison
- Percentage above average
- Total outlier impact on monthly spending

---

### 7. Header with Quick Actions

Quick actions are integrated into the page header for easy access without taking up dashboard real estate.

**Header Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 Finanças Familiares    [➕ Nova Despesa] [📊] [⚙️]  Jan ▼  │
└─────────────────────────────────────────────────────────────────┘
```

**Actions in Header:**
- **➕ Nova Despesa**: Primary action button (always visible with label)
- **📊 Transações**: Icon button linking to transactions page
- **⚙️ Configurações**: Icon button linking to settings
- **Month Selector**: Dropdown to change the current month view

**Responsive Behavior:**
- Desktop: All actions visible with "Nova Despesa" having a text label
- Mobile: Icons only, with "Nova Despesa" as a floating action button (FAB)

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
    // PRIMARY FACTOR (40% weight)
    liberdadeFinanceira: { 
      score: number; 
      actual: number; 
      target: number; 
      percentAchieved: number;
      streak: number; // consecutive months meeting target
    };
    // SECONDARY FACTORS
    categoriesOnBudget: { score: number; onBudget: number; total: number };
    outliers: { score: number; count: number };
    settlement: { score: number; balanced: boolean };
    freeBalance: { score: number; value: number };
  };
  summary: string; // e.g., "Meta de poupança em 80%, faltam R$400"
};
```

#### 2. `/api/dashboard/trends`
Returns historical data for trend visualization, with emphasis on Liberdade Financeira tracking.

```typescript
type TrendsResponse = {
  months: {
    yearMonth: string; // "2024-01"
    income: number;
    expenses: number;
    freeBalance: number;
    // Liberdade Financeira specific
    liberdadeFinanceira: {
      actual: number;
      target: number;
      metGoal: boolean;
    };
    categoryBreakdown: Record<string, number>;
  }[];
  averages: {
    monthlyExpenses: number;
    monthlyIncome: number;
    monthlyBalance: number;
    monthlySavings: number; // Liberdade Financeira average
  };
  liberdadeFinanceiraStats: {
    currentStreak: number; // consecutive months meeting target
    bestStreak: number;
    totalSaved: number; // sum over period
    averageAchievement: number; // avg % of target achieved
  };
};
```

#### 3. `/api/dashboard/alerts`
Returns active alerts requiring attention. Alerts are informational only (no action links).

```typescript
type AlertsResponse = {
  alerts: {
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    category: 'savings' | 'budget' | 'outlier' | 'forecast' | 'settlement';
    title: string;
    description: string;
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
- [ ] Header with quick actions integrated
- [ ] Health Score component with basic calculation
- [ ] Quick Stats grid (4 cards)
- [ ] Basic Alerts panel (read-only)
- [ ] Category budget horizontal bars

### Phase 2: Visualization & Celebration
- [ ] Monthly trend chart (using Recharts)
- [ ] Outlier spotlight section (read-only)
- [ ] Savings goal confetti celebration with cookie control

### Phase 3: Intelligence
- [ ] Trend insights and recommendations
- [ ] Streak tracking for savings goal
- [ ] Predictive alerts (e.g., "At this rate, you'll exceed budget by...")

### Phase 4: Polish
- [ ] Animations and transitions
- [ ] Mobile optimizations (FAB for new expense)
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

### Confetti Library
**Recommendation: canvas-confetti**
- Lightweight (~3KB gzipped)
- No React wrapper needed (vanilla JS)
- Highly customizable (colors, duration, particle count)
- Good performance

```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

### State Management
Continue using existing patterns:
- React Query for server state
- React Context for shared state
- Local state for UI interactions
- js-cookie for celebration cookie management

### New Components to Create

```
components/
  dashboard/
    HealthScore.tsx          # Hero health indicator
    QuickStatsGrid.tsx       # 4 metric cards
    AlertsPanel.tsx          # Notifications/warnings (read-only)
    CategoryBudgetChart.tsx  # Category vs budget (horizontal bars)
    MonthlyTrendChart.tsx    # Historical trends
    OutlierSpotlight.tsx     # Anomaly highlighting (read-only)
    SavingsConfetti.tsx      # Confetti celebration for goal achievement
```

```
components/
  layout/
    DashboardHeader.tsx      # Header with quick actions integrated
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
│  🏠 Finanças Familiares   [➕ Nova Despesa] [📊] [⚙️]  Jan ▼  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ╔═══════════════════════════════════════════════════════╗    │
│   ║  SAÚDE FINANCEIRA                                     ║    │
│   ║  ████████████████████░░░░░░░░  75/100                 ║    │
│   ║  😊 ATENÇÃO - Meta de poupança em 80%, faltam R$400   ║    │
│   ╚═══════════════════════════════════════════════════════╝    │
│                                                                 │
│  ┌══════════════╗ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  ║ 💎 LIBERDADE ║ │ GASTOS   │ │ RENDA    │ │ SALDO    │      │
│  ║  FINANCEIRA  ║ │ DO MÊS   │ │ EFETIVA  │ │ LIVRE    │      │
│  ║              ║ │          │ │          │ │          │      │
│  ║  R$ 1.600    ║ │ R$10.550 │ │ R$13.000 │ │ +R$2.450 │      │
│  ║  ████████░░  ║ │ 81% orcam│ │ +R$500   │ │ ↑ 12%    │      │
│  ║  80% da meta ║ │          │ │          │ │          │      │
│  ╚══════════════╝ └──────────┘ └──────────┘ └──────────┘      │
│                                                                 │
│  ┌─ ATENÇÃO ────────────────────────────────────────────────┐  │
│  │ 🔴 Meta Lib. Financeira em 80% - faltam R$400            │  │
│  │ 🟡 Alimentação acima do orçamento (130%)                 │  │
│  │ 🟡 2 gastos fora do padrão detectados                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ CATEGORIAS ─────────────────────────────────────────────┐  │
│  │ ⭐ Lib.Financ. [████████████████░░░░░░] 80%  R$1.600    │  │
│  │ Moradia       [████████████████░░░░░░] 75%  R$2.250     │  │
│  │ Alimentação   [██████████████████████████░] 130% ⚠️     │  │
│  │ Transporte    [████████░░░░░░░░░░░░░░] 40%  R$520      │  │
│  │ Lazer         [████████████░░░░░░░░░░] 60%  R$360      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ GASTOS FORA DO PADRÃO ──────────────────────────────────┐  │
│  │ 📍 iFood - R$350            Alimentação | +312% média   │  │
│  │ 📍 Manutenção - R$1.200     Transporte  | +500% média   │  │
│  │ ─────────────────────────────────────────────────────    │  │
│  │ Total outliers: R$1.550 (15% do gasto)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ TENDÊNCIA LIBERDADE FINANCEIRA (6 MESES) ───────────────┐  │
│  │        Meta ──── Realizado                               │  │
│  │  2.5k│ ─────────────────────────                         │  │
│  │      │         ████                                      │  │
│  │    2k│ ████████    ████████████                          │  │
│  │      │                                                   │  │
│  │  1.5k│                                                   │  │
│  │      └───────────────────────────                        │  │
│  │        Ago  Set  Out  Nov  Dez  Jan                      │  │
│  │  Média: R$1.850/mês | Sequência: 4 meses atingindo meta  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

🎉 When savings goal is achieved (100%+), confetti animation plays!
   (Controlled by 7-day cookie to avoid repetition)
```

---

## Conclusion

This dashboard plan provides a comprehensive control panel that leverages all existing features to give users immediate insight into their financial health. The phased approach allows for iterative development while delivering value early.

**Core Philosophy:** Financial health is measured primarily by **consistent savings toward financial freedom**, not by leftover money. The dashboard makes this clear by:

Key differentiators:
1. **Liberdade Financeira First**: The savings goal is the hero metric, prominently displayed and weighted at 40% of the health score
2. **Health Score**: Single metric that summarizes everything, led by savings achievement
3. **Informational Alerts**: Clean notifications without action clutter - users navigate themselves
4. **Visual Budget Tracking**: Horizontal bars with Liberdade Financeira shown first
5. **Savings Trend**: Dedicated trend chart showing savings consistency over time
6. **Celebration**: Confetti animation when savings goal is achieved (cookie-controlled)
7. **Header Actions**: Quick actions in header keep dashboard focused on data visualization

The implementation should prioritize the Health Score and Liberdade Financeira card first, as these communicate the core value proposition: **"Are we building wealth?"**
