import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, X } from "lucide-react";

interface RecurringDeleteModalProps {
  isDeleting: boolean;
  onDeleteTemplateOnly: () => void;
  onDeleteFullHistory: () => void;
  onClose: () => void;
}

export function RecurringDeleteModal({
  isDeleting,
  onDeleteTemplateOnly,
  onDeleteFullHistory,
  onClose,
}: RecurringDeleteModalProps) {
  return (
    <dialog
      open
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      aria-labelledby="recurring-delete-modal-title"
    >
      <Card className="max-w-md w-full animate-in fade-in zoom-in-95 duration-200 rounded-outer">
        <div className="p-6 border-b border-noir-border flex items-center justify-between">
          <h3
            id="recurring-delete-modal-title"
            className="font-semibold text-heading flex items-center gap-2"
          >
            <Trash2 className="text-accent-negative" size={20} />
            Excluir Recorrente
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-heading p-1 rounded-interactive hover:bg-noir-active transition-all"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-body">O que deseja fazer com este lançamento recorrente?</p>
          <div className="space-y-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onDeleteTemplateOnly}
              className="w-full text-left p-4 rounded-interactive border border-noir-border hover:border-accent-primary hover:bg-accent-primary/5 transition-all disabled:opacity-50"
            >
              <p className="font-medium text-heading text-sm">Só daqui pra frente</p>
              <p className="text-xs text-muted mt-1">
                Desativa o modelo e remove ocorrências em meses abertos. Meses já fechados
                permanecem como estão.
              </p>
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onDeleteFullHistory}
              className="w-full text-left p-4 rounded-interactive border border-noir-border hover:border-accent-negative hover:bg-accent-negative/5 transition-all disabled:opacity-50"
            >
              <p className="font-medium text-heading text-sm">Todo o histórico</p>
              <p className="text-xs text-muted mt-1">
                Desativa o template. Em meses já fechados os lançamentos são apenas desvinculados
                (valores mantidos). Em meses abertos os lançamentos são excluídos.
              </p>
            </button>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full py-2.5 mt-2 h-auto"
          >
            Cancelar
          </Button>
        </div>
      </Card>
    </dialog>
  );
}
