"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";

type SaveSimulationModalProps = {
  onSave: (name: string) => void;
  onClose: () => void;
  isSaving: boolean;
};

export function SaveSimulationModal({ onSave, onClose, isSaving }: SaveSimulationModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      // biome-ignore lint/a11y/useSemanticElements: Custom modal with backdrop styling requires div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-simulation-modal-title"
    >
      <Card className="max-w-md w-full animate-in fade-in zoom-in-95 duration-200 rounded-outer">
        <div className="p-6 border-b border-noir-border flex items-center justify-between">
          <h3
            id="save-simulation-modal-title"
            className="font-semibold text-heading flex items-center gap-2"
          >
            <Save className="text-accent-primary" size={20} />
            Salvar Simulação
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-heading p-1 rounded-interactive hover:bg-noir-active transition-all"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <label htmlFor="simulation-name" className="block text-sm text-body mb-2">
              Nome da simulação
            </label>
            <Input
              id="simulation-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cenário sem aluguel"
              className="w-full"
              disabled={isSaving}
            />
            <div className="flex gap-3 mt-6 pt-4 border-t border-noir-border">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1 py-3 h-auto"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || isSaving}
                className="flex-1 py-3 h-auto flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
