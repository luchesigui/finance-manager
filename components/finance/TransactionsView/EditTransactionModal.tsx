"use client";

import { TransactionFormFields } from "@/components/finance/TransactionFormFields";
import { Pencil, X } from "lucide-react";

type EditTransactionModalProps = {
  onClose: () => void;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form has complex generic types
  form: any;
};

export function EditTransactionModal({ onClose, form }: EditTransactionModalProps) {
  return (
    <div
      // biome-ignore lint/a11y/useSemanticElements: Custom modal with backdrop styling requires div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="noir-card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 rounded-outer">
        <div className="p-6 border-b border-noir-border flex items-center justify-between">
          <h3 id="edit-modal-title" className="font-semibold text-heading flex items-center gap-2">
            <Pencil className="text-accent-primary" size={20} />
            Editar Lançamento
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-heading p-1 rounded-interactive hover:bg-noir-active transition-all"
            aria-label="Fechar modal de edição"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="mb-4">
              <form.Field name="description">
                {(field: { state: { value: string }; handleChange: (value: string) => void }) => (
                  <>
                    <label
                      htmlFor="edit-description"
                      className="block text-xs font-medium text-body mb-1"
                    >
                      Descrição
                    </label>
                    <input
                      id="edit-description"
                      type="text"
                      placeholder="Ex: Luz, Mercado, iFood..."
                      className="noir-input w-full"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      required
                    />
                  </>
                )}
              </form.Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <TransactionFormFields
                form={form}
                showInstallmentFields={false}
                showDescription={false}
                idPrefix="edit-transaction"
              />
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-noir-border">
              <button type="button" onClick={onClose} className="noir-btn-secondary flex-1 py-3">
                Cancelar
              </button>
              <button
                type="submit"
                className="noir-btn-primary flex-1 py-3 flex items-center justify-center gap-2"
              >
                <Pencil size={18} />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
