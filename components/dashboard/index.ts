// Components
export { AlertsPanel } from "./AlertsPanel";
export { CategoryBudgetChart } from "./CategoryBudgetChart";
export { HealthScore } from "./HealthScore";
export { MonthlyTrendChart, type MonthlyTrendData } from "./MonthlyTrendChart";
export { OutlierSpotlight, type OutlierTransaction } from "./OutlierSpotlight";
export { QuickStatsGrid } from "./QuickStatsGrid";
export { SavingsConfetti } from "./SavingsConfetti";

// Hooks
export {
  useDashboardAlerts,
  type Alert,
  type AlertType,
  type AlertCategory,
} from "./hooks/useDashboardAlerts";
export {
  useHealthScore,
  type HealthScoreResult,
  type HealthScoreFactors,
  type HealthStatus,
  type LiberdadeFinanceiraFactor,
} from "./hooks/useHealthScore";
