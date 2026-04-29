"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SimulationParticipant } from "@/features/simulation/types";
import { formatCurrency } from "@/lib/format";
import { Check, Pencil, User, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type ParticipantSimulatorProps = {
  participants: SimulationParticipant[];
  onToggle: (id: string) => void;
  onMultiplierChange: (id: string, multiplier: number) => void;
};

type ParticipantRowProps = {
  participant: SimulationParticipant;
  onToggle: () => void;
  onMultiplierChange: (multiplier: number) => void;
};

// ============================================================================
// Participant Row Component
// ============================================================================

function ParticipantRow({ participant, onToggle, onMultiplierChange }: ParticipantRowProps) {
  const [localMultiplier, setLocalMultiplier] = useState(participant.incomeMultiplier * 100);
  const [isMoving, setIsMoving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customInputValue, setCustomInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (participant.incomeMultiplier * 100 !== localMultiplier) {
        onMultiplierChange(localMultiplier / 100);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [localMultiplier, onMultiplierChange, participant.incomeMultiplier]);

  // Sync from parent when it changes externally
  useEffect(() => {
    setLocalMultiplier(participant.incomeMultiplier * 100);
  }, [participant.incomeMultiplier]);

  const simulatedIncome = participant.isActive
    ? participant.realIncome * (localMultiplier / 100)
    : 0;

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMultiplier(Number(e.target.value));
  }, []);

  const handlePencilClick = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleEditChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInputValue(e.target.value);
  }, []);

  const handleEditBlur = useCallback(() => {
    const parsed = Number(customInputValue);
    if (customInputValue !== "" && !Number.isNaN(parsed) && participant.realIncome > 0) {
      const multiplierPercent = (parsed / participant.realIncome) * 100;
      const clamped = Math.min(150, Math.max(0, multiplierPercent));
      setLocalMultiplier(clamped);
    }
    setIsEditing(false);
  }, [customInputValue, participant.realIncome]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  }, []);

  return (
    <div className="p-4 border border-noir-border rounded-card bg-noir-surface">
      <div className="flex items-start justify-between gap-4">
        {/* Person info */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-card transition-colors ${
              participant.isActive
                ? "bg-accent-primary/20 text-accent-primary"
                : "bg-noir-active text-muted"
            }`}
          >
            <User size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-heading">{participant.name}</h3>
            <p className="text-sm text-muted">
              Renda Real: {formatCurrency(participant.realIncome)}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          onClick={onToggle}
          className={`relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
            participant.isActive ? "bg-accent-primary shadow-glow-accent" : "bg-noir-active"
          }`}
          aria-label={`${participant.name}: ${participant.isActive ? "ativo" : "inativo"}`}
          role="switch"
          aria-checked={participant.isActive}
        >
          <div
            className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out ${
              participant.isActive ? "left-[31px]" : "left-[3px]"
            }`}
          >
            {participant.isActive ? (
              <Check className="w-4 h-4 text-accent-positive" />
            ) : (
              <X className="w-4 h-4 text-accent-negative" />
            )}
          </div>
        </button>
      </div>

      {/* Simulated income display */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm text-muted">Renda Simulada:</span>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              min={0}
              value={customInputValue}
              onChange={handleEditChange}
              onBlur={handleEditBlur}
              onKeyDown={handleEditKeyDown}
              placeholder={String(Math.round(simulatedIncome))}
              className="w-28 text-right text-sm bg-noir-active border border-accent-primary rounded px-2 py-0.5 text-heading tabular-nums focus:outline-none"
              aria-label="Renda simulada"
            />
          ) : (
            <span
              className={`font-bold tabular-nums ${
                participant.isActive ? "text-heading" : "text-muted"
              }`}
            >
              {formatCurrency(simulatedIncome)}{" "}
              <span className="text-sm font-normal text-muted">
                ({Math.round(localMultiplier)}%)
              </span>
            </span>
          )}
          {participant.isActive && !isEditing && (
            <button
              type="button"
              onClick={handlePencilClick}
              className="text-muted hover:text-accent-primary transition-colors"
              aria-label="Editar renda simulada"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Inactive badge */}
      {!participant.isActive && (
        <div className="mt-2">
          <Badge variant="warning">Desativado</Badge>
        </div>
      )}

      {/* Slider */}
      <div className="mt-4 relative">
        {/* Floating tooltip when moving */}
        {isMoving && (
          <div
            className="absolute -top-10 transform -translate-x-1/2 bg-noir-surface border border-noir-border rounded-lg px-3 py-1 shadow-lg z-10 pointer-events-none"
            style={{ left: `${(localMultiplier / 150) * 100}%` }}
          >
            <span className="text-heading font-bold tabular-nums text-sm">
              {formatCurrency(simulatedIncome)}
            </span>
            <span className="text-muted text-xs ml-1">({Math.round(localMultiplier)}%)</span>
          </div>
        )}

        <input
          type="range"
          min={0}
          max={150}
          value={localMultiplier}
          onChange={handleSliderChange}
          onMouseDown={() => setIsMoving(true)}
          onMouseUp={() => setIsMoving(false)}
          onTouchStart={() => setIsMoving(true)}
          onTouchEnd={() => setIsMoving(false)}
          onBlur={() => setIsMoving(false)}
          disabled={!participant.isActive}
          className={`w-full h-2 rounded-full appearance-none cursor-pointer transition-opacity ${
            participant.isActive ? "opacity-100" : "opacity-40 cursor-not-allowed"
          }`}
          style={{
            background: participant.isActive
              ? "linear-gradient(to right, rgb(var(--accent-negative)) 0%, rgb(var(--accent-warning)) 33%, rgb(var(--accent-positive)) 66%, rgb(var(--accent-primary)) 100%)"
              : "rgb(var(--noir-active))",
          }}
          aria-valuemin={0}
          aria-valuemax={150}
          aria-valuenow={localMultiplier}
          aria-valuetext={`${Math.round(localMultiplier)}% da renda, equivalente a ${formatCurrency(simulatedIncome)}`}
        />

        {/* Markers */}
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
          <span>150%</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ParticipantSimulator({
  participants,
  onToggle,
  onMultiplierChange,
}: ParticipantSimulatorProps) {
  return (
    <Card className="p-card-padding">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
          <User size={20} className="text-accent-primary" />
          Gestão de Participantes
        </h2>
      </div>
      <div className="space-y-3">
        {participants.map((participant) => (
          <ParticipantRow
            key={participant.id}
            participant={participant}
            onToggle={() => onToggle(participant.id)}
            onMultiplierChange={(multiplier) => onMultiplierChange(participant.id, multiplier)}
          />
        ))}
      </div>
    </Card>
  );
}
