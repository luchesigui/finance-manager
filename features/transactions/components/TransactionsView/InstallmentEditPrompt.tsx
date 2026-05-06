import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TransactionPatch } from "@/lib/types";
import { Layers, X } from "lucide-react";

interface InstallmentEditPromptProps {
  transactionId: number;
  patch: TransactionPatch;
  installmentTotal: number;
  siblingCount: number;
  isUpdatePending: boolean;
  onApplyToThisOnly: () => void;
  onApplyToAll: () => void;
  onClose: () => void;
}

export function InstallmentEditPrompt({
  transactionId,
  patch,
  installmentTotal,
  siblingCount,
  isUpdatePending,
  onApplyToThisOnly,
  onApplyToAll,
  onClose,
}: InstallmentEditPromptProps) {
  return (
    <dialog
      open
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 border-0 max-w-none max-h-none w-full h-full m-0"
      aria-labelledby="installment-edit-scope-title"
    >
      <Card className="max-w-md w-full animate-in fade-in zoom-in-95 duration-200 rounded-outer">
        <div className="p-6 border-b border-noir-border flex items-center justify-between">
          <h3
            id="installment-edit-scope-title"
            className="font-semibold text-heading flex items-center gap-2"
          >
            <Layers className="text-accent-primary" size={20} />
            Parcelamento
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
          <p className="text-sm text-body">
            Este lançamento faz parte de um parcelamento em {installmentTotal}x. Existem{" "}
            {siblingCount} parcelas cadastradas. Deseja aplicar as alterações a todas elas ou
            somente a esta?
          </p>
          <div className="space-y-3">
            <button
              type="button"
              disabled={isUpdatePending}
              onClick={onApplyToThisOnly}
              className="w-full text-left p-4 rounded-interactive border border-noir-border hover:border-accent-primary hover:bg-accent-primary/5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <p className="font-medium text-heading text-sm">Somente esta parcela</p>
              <p className="text-xs text-muted mt-1">
                Atualiza apenas o lançamento que você está editando (outras faturas / meses
                permanecem iguais).
              </p>
            </button>
            <button
              type="button"
              disabled={isUpdatePending}
              onClick={onApplyToAll}
              className="w-full text-left p-4 rounded-interactive border border-noir-border hover:border-accent-primary hover:bg-accent-primary/5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <p className="font-medium text-heading text-sm">Todas as parcelas</p>
              <p className="text-xs text-muted mt-1">
                Aplica categoria, valor, descrição (com numeração), cartão e demais campos a todas
                as parcelas encontradas. A data de cada parcela é mantida.
              </p>
            </button>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full py-2.5 h-auto"
          >
            Voltar à edição
          </Button>
        </div>
      </Card>
    </dialog>
  );
}
