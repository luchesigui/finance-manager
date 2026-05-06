import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, X } from "lucide-react";

interface InstallmentDeletePromptProps {
  description: string;
  installmentTotal: number;
  siblingCount: number;
  isDeletePending: boolean;
  onDeleteThisOnly: () => void;
  onDeleteAll: () => void;
  onClose: () => void;
}

export function InstallmentDeletePrompt({
  description,
  installmentTotal,
  siblingCount,
  isDeletePending,
  onDeleteThisOnly,
  onDeleteAll,
  onClose,
}: InstallmentDeletePromptProps) {
  return (
    <dialog
      open
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 border-0 max-w-none max-h-none w-full h-full m-0"
      aria-labelledby="installment-delete-scope-title"
    >
      <Card className="max-w-md w-full animate-in fade-in zoom-in-95 duration-200 rounded-outer">
        <div className="p-6 border-b border-noir-border flex items-center justify-between">
          <h3
            id="installment-delete-scope-title"
            className="font-semibold text-heading flex items-center gap-2"
          >
            <Trash2 className="text-accent-negative" size={20} />
            Excluir parcelamento
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
            <span className="font-medium text-heading">{description}</span> faz parte de um
            parcelamento em {installmentTotal}x. Existem {siblingCount} parcelas cadastradas. O que
            deseja excluir?
          </p>
          <div className="space-y-3">
            <button
              type="button"
              disabled={isDeletePending}
              onClick={onDeleteThisOnly}
              className="w-full text-left p-4 rounded-interactive border border-noir-border hover:border-accent-primary hover:bg-accent-primary/5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <p className="font-medium text-heading text-sm">Somente esta parcela</p>
              <p className="text-xs text-muted mt-1">
                Remove só este lançamento; as outras parcelas permanecem.
              </p>
            </button>
            <button
              type="button"
              disabled={isDeletePending}
              onClick={onDeleteAll}
              className="w-full text-left p-4 rounded-interactive border border-noir-border hover:border-accent-negative hover:bg-accent-negative/5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <p className="font-medium text-heading text-sm">Todas as parcelas</p>
              <p className="text-xs text-muted mt-1">
                Exclui todas as {siblingCount} parcelas deste parcelamento.
              </p>
            </button>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full py-2.5 h-auto"
          >
            Cancelar
          </Button>
        </div>
      </Card>
    </dialog>
  );
}
