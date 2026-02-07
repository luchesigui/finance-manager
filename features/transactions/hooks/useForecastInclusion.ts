"use client";

import { useState } from "react";

/**
 * Hook to manage forecast inclusion override state.
 * Allows temporarily including/excluding forecast transactions from calculations.
 */
export function useForecastInclusion() {
  const [forecastInclusionOverrides, setForecastInclusionOverrides] = useState<
    Record<number, boolean>
  >({});

  const setForecastInclusionOverride = (transactionId: number, include: boolean) => {
    setForecastInclusionOverrides((prev) => {
      if (include) {
        if (prev[transactionId]) return prev;
        return { ...prev, [transactionId]: true };
      }
      if (!prev[transactionId]) return prev;
      const { [transactionId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const isForecastIncluded = (transactionId: number) =>
    forecastInclusionOverrides[transactionId] === true;

  return {
    forecastInclusionOverrides,
    isForecastIncluded,
    setForecastInclusionOverride,
  };
}
