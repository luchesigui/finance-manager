"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Person } from "@/lib/types";
import { CreditCard, Pencil, UserX, X } from "lucide-react";

type BulkEditFormState = {
  categoryId: string | null;
  paidBy: string | null;
  isCreditCard: boolean | null;
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
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 rounded-outer">
        <div className="p-6 border-b border-noir-border flex items-center justify-between">
          <h3
            id="bulk-edit-modal-title"
            className="font-semibold text-heading flex items-center gap-2"
          >
            <Pencil className="text-accent-primary" size={20} />
            Editar em Massa
            <Badge variant="secondary">{selectedCount} lançamento(s)</Badge>
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
              <Select
                value={formState.categoryId}
                onValueChange={(value) => onFormStateChange({ ...formState, categoryId: value })}
              >
                <SelectTrigger className="w-full animate-in slide-in-from-top-1 duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select
                value={formState.paidBy}
                onValueChange={(value) => onFormStateChange({ ...formState, paidBy: value })}
              >
                <SelectTrigger className="w-full animate-in slide-in-from-top-1 duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <CreditCard size={14} /> Alterar Próxima Fatura
              </label>
              {formState.isCreditCard !== null && (
                <Select
                  value={formState.isCreditCard ? "true" : "false"}
                  onValueChange={(value) =>
                    onFormStateChange({ ...formState, isCreditCard: value === "true" })
                  }
                >
                  <SelectTrigger className="ml-auto w-auto h-8 text-sm animate-in slide-in-from-left-1 duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select
                  value={formState.excludeFromSplit ? "true" : "false"}
                  onValueChange={(value) =>
                    onFormStateChange({ ...formState, excludeFromSplit: value === "true" })
                  }
                >
                  <SelectTrigger className="ml-auto w-auto h-8 text-sm animate-in slide-in-from-left-1 duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-noir-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-3 h-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onSave}
              disabled={isSaveDisabled}
              className="flex-1 py-3 h-auto"
            >
              <Pencil size={18} />
              Aplicar Alterações
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
