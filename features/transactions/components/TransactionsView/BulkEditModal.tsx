"use client";

import type { Category, Person } from "@/lib/types";
import { ArrowRight, CreditCard, Pencil, UserX, X } from "lucide-react";

type BulkEditFormState = {
  categoryId: string | null;
  paidBy: string | null;
  isCreditCard: boolean | null;
  isNextBilling: boolean | null;
  excludeFromSplit: boolean | null;
};

type BulkEditModalProps = {
  formState: BulkEditFormState;
  onFormStateChange: (state: BulkEditFormState) => void;
  categories: Category[];
  people: Person[];
  selectedCount: number;
  onClose: () => void;
  onSave: () => void;
  isSaveDisabled: boolean;
};

export function BulkEditModal({
  formState,
  onFormStateChange,
  categories,
  people,
  selectedCount,
  onClose,
  onSave,
  isSaveDisabled,
}: BulkEditModalProps) {
  return (
    <div
      // biome-ignore lint/a11y/useSemanticElements: Custom modal with backdrop styling requires div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-edit-modal-title"
    >
      <div className="noir-card max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 rounded-outer">
        <div className="p-6 border-b border-noir-border flex items-center justify-between">
          <h3
            id="bulk-edit-modal-title"
            className="font-semibold text-heading flex items-center gap-2"
          >
            <Pencil className="text-accent-primary" size={20} />
            Editar em Massa
            <span className="noir-badge-muted">{selectedCount} lançamento(s)</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-heading p-1 rounded-interactive hover:bg-noir-active transition-all"
            aria-label="Fechar modal de edição em massa"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-body mb-4">
            Selecione os campos que deseja alterar. Apenas os campos selecionados serão atualizados
            em todos os lançamentos.
          </p>

          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="bulk-category-enable"
                checked={formState.categoryId !== null}
                onChange={(event) =>
                  onFormStateChange({
                    ...formState,
                    categoryId: event.target.checked ? (categories[0]?.id ?? "") : null,
                  })
                }
                className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
              />
              <label
                htmlFor="bulk-category-enable"
                className="text-sm font-medium text-heading cursor-pointer"
              >
                Alterar Categoria
              </label>
            </div>
            {formState.categoryId !== null && (
              <select
                id="bulk-category"
                className="noir-select w-full animate-in slide-in-from-top-1 duration-200"
                value={formState.categoryId}
                onChange={(event) =>
                  onFormStateChange({ ...formState, categoryId: event.target.value })
                }
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="bulk-paidby-enable"
                checked={formState.paidBy !== null}
                onChange={(event) =>
                  onFormStateChange({
                    ...formState,
                    paidBy: event.target.checked ? (people[0]?.id ?? "") : null,
                  })
                }
                className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
              />
              <label
                htmlFor="bulk-paidby-enable"
                className="text-sm font-medium text-heading cursor-pointer"
              >
                Alterar Pago por
              </label>
            </div>
            {formState.paidBy !== null && (
              <select
                id="bulk-paidby"
                className="noir-select w-full animate-in slide-in-from-top-1 duration-200"
                value={formState.paidBy}
                onChange={(event) =>
                  onFormStateChange({ ...formState, paidBy: event.target.value })
                }
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bulk-creditcard-enable"
                checked={formState.isCreditCard !== null}
                onChange={(event) =>
                  onFormStateChange({
                    ...formState,
                    isCreditCard: event.target.checked ? false : null,
                  })
                }
                className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
              />
              <label
                htmlFor="bulk-creditcard-enable"
                className="text-sm font-medium text-heading cursor-pointer flex items-center gap-1"
              >
                <CreditCard size={14} /> Alterar Cartão de Crédito
              </label>
              {formState.isCreditCard !== null && (
                <select
                  className="noir-select ml-auto text-sm py-1 animate-in slide-in-from-left-1 duration-200"
                  value={formState.isCreditCard ? "true" : "false"}
                  onChange={(event) =>
                    onFormStateChange({
                      ...formState,
                      isCreditCard: event.target.value === "true",
                    })
                  }
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bulk-nextbilling-enable"
                checked={formState.isNextBilling !== null}
                onChange={(event) =>
                  onFormStateChange({
                    ...formState,
                    isNextBilling: event.target.checked ? false : null,
                  })
                }
                className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
              />
              <label
                htmlFor="bulk-nextbilling-enable"
                className="text-sm font-medium text-heading cursor-pointer flex items-center gap-1"
              >
                <ArrowRight size={14} /> Alterar Próxima Fatura
              </label>
              {formState.isNextBilling !== null && (
                <select
                  className="noir-select ml-auto text-sm py-1 animate-in slide-in-from-left-1 duration-200"
                  value={formState.isNextBilling ? "true" : "false"}
                  onChange={(event) =>
                    onFormStateChange({
                      ...formState,
                      isNextBilling: event.target.value === "true",
                    })
                  }
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bulk-exclude-enable"
                checked={formState.excludeFromSplit !== null}
                onChange={(event) =>
                  onFormStateChange({
                    ...formState,
                    excludeFromSplit: event.target.checked ? false : null,
                  })
                }
                className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
              />
              <label
                htmlFor="bulk-exclude-enable"
                className="text-sm font-medium text-heading cursor-pointer flex items-center gap-1"
              >
                <UserX size={14} /> Alterar Fora da Divisão
              </label>
              {formState.excludeFromSplit !== null && (
                <select
                  className="noir-select ml-auto text-sm py-1 animate-in slide-in-from-left-1 duration-200"
                  value={formState.excludeFromSplit ? "true" : "false"}
                  onChange={(event) =>
                    onFormStateChange({
                      ...formState,
                      excludeFromSplit: event.target.value === "true",
                    })
                  }
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-noir-border">
            <button type="button" onClick={onClose} className="noir-btn-secondary flex-1 py-3">
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaveDisabled}
              className="noir-btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Pencil size={18} />
              Aplicar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
