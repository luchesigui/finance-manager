"use client";

import { isSmartFillEnabled } from "@/lib/featureFlags";
import { BrainCircuit, Loader2 } from "lucide-react";

type SmartFillSectionProps = {
  smartInput: string;
  onSmartInputChange: (value: string) => void;
  onSmartFill: () => void;
  isLoading: boolean;
};

export function SmartFillSection({
  smartInput,
  onSmartInputChange,
  onSmartFill,
  isLoading,
}: SmartFillSectionProps) {
  if (!isSmartFillEnabled) return null;

  return (
    <div className="mb-6 p-4 rounded-card bg-noir-active border border-noir-border">
      <label
        htmlFor="smart-input"
        className="text-xs font-bold text-accent-primary flex items-center gap-1.5 mb-2"
      >
        <BrainCircuit size={14} />
        PREENCHIMENTO INTELIGENTE (BETA)
      </label>
      <div className="flex gap-2">
        <input
          id="smart-input"
          type="text"
          value={smartInput}
          onChange={(event) => onSmartInputChange(event.target.value)}
          placeholder="Ex: Almoço com Amanda hoje custou 45 reais"
          className="noir-input flex-1 text-sm"
          onKeyDown={(event) => event.key === "Enter" && onSmartFill()}
        />
        <button
          type="button"
          onClick={onSmartFill}
          disabled={isLoading || !smartInput}
          className="noir-btn-primary"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
        </button>
      </div>
    </div>
  );
}
