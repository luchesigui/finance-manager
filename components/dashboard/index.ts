// Components
export { AlertsPanel } from "./AlertsPanel";
export { CategoryBudgetChart } from "./CategoryBudgetChart";
export { ForecastSpotlight } from "./ForecastSpotlight";
export { HealthScore } from "./HealthScore";
export { HealthTrendChart, type HealthTrendDataPoint } from "./HealthTrendChart";
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
  type MonthPeriod,
} from "./hooks/useHealthScore";
export {
  useHealthScoreQuery,
  formatPeriod,
  generatePeriodRange,
  type HealthScoreData,
} from "./hooks/useHealthScoreQuery";
