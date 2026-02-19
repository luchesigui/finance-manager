"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TransactionFormFields } from "@/features/transactions/components/TransactionFormFields";
import type { Transaction } from "@/lib/types";
import { Pencil, X } from "lucide-react";

type EditTransactionModalProps = {
  onClose: () => void;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form has complex generic types
  form: any;
  editingTransaction: Transaction;
  recurringEditScope: "template_only" | "full_history";
  onRecurringEditScopeChange: (scope: "template_only" | "full_history") => void;
};

export function EditTransactionModal({
  onClose,
  form,
  editingTransaction,
  recurringEditScope,
  onRecurringEditScopeChange,
}: EditTransactionModalProps) {
  const isRecurring = editingTransaction.recurringTemplateId != null;

  return (
    <div
      // biome-ignore lint/a11y/useSemanticElements: Custom modal with backdrop styling requires div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 rounded-outer">
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
                    <Input
                      id="edit-description"
                      type="text"
                      placeholder="Ex: Luz, Mercado, iFood..."
                      className="w-full"
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
            {isRecurring && (
              <div className="mt-4 pt-4 border-t border-noir-border">
                <p className="text-xs font-medium text-body mb-2">
                  Aplicar alterações ao modelo recorrente
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurring-edit-scope"
                      checked={recurringEditScope === "template_only"}
                      onChange={() => onRecurringEditScopeChange("template_only")}
                      className="text-accent-primary"
                    />
                    <span className="text-sm text-body">Só daqui pra frente</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurring-edit-scope"
                      checked={recurringEditScope === "full_history"}
                      onChange={() => onRecurringEditScopeChange("full_history")}
                      className="text-accent-primary"
                    />
                    <span className="text-sm text-body">Todo o histórico (meses abertos)</span>
                  </label>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-6 pt-4 border-t border-noir-border">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1 py-3 h-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 py-3 h-auto">
                <Pencil size={18} />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
