import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { NewTransactionFormState } from "@/lib/types";
import { Plus } from "lucide-react";
import { TransactionFormFields } from "../TransactionFormFields";
import { SmartFillSection } from "./SmartFillSection";

interface NewTransactionSectionProps {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form has complex generic types
  form: any;
  smartInput: string;
  onSmartInputChange: (val: string) => void;
  onSmartFill: () => void;
  aiLoading: boolean;
  viewMode: "general" | "creditCard";
  onViewModeChange: (mode: "general" | "creditCard") => void;
}

export function NewTransactionSection({
  form,
  smartInput,
  onSmartInputChange,
  onSmartFill,
  aiLoading,
  viewMode,
  onViewModeChange,
}: NewTransactionSectionProps) {
  return (
    <Card className="p-card-padding relative overflow-hidden border-accent-primary/30">
      <div className="absolute inset-0 bg-accent-primary/5" />
      <div className="relative">
        <SmartFillSection
          smartInput={smartInput}
          onSmartInputChange={onSmartInputChange}
          onSmartFill={onSmartFill}
          isLoading={aiLoading}
        />

        <form.Subscribe selector={(state: { values: NewTransactionFormState }) => state.values}>
          {(values: NewTransactionFormState) => (
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-heading flex items-center gap-2">
                <Plus
                  className={`${
                    values.type === "income" ? "bg-accent-positive" : "bg-accent-primary"
                  } text-white rounded-interactive p-1`}
                  size={24}
                />
                {values.type === "income" ? "Novo Lançamento de Renda" : "Nova Despesa Manual"}
              </h3>
              {values.type !== "income" && (
                <div className="flex items-center gap-2 select-none">
                  <Label
                    htmlFor="view-mode-switch"
                    className="text-xs font-medium text-body mr-2 cursor-pointer"
                  >
                    Cartão de crédito
                  </Label>
                  <Switch
                    id="view-mode-switch"
                    checked={viewMode === "creditCard"}
                    onCheckedChange={(checked: boolean) => {
                      const next = checked ? "creditCard" : "general";
                      onViewModeChange(next);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </form.Subscribe>

        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <TransactionFormFields
            form={form}
            showInstallmentFields={true}
            showDescription={true}
            idPrefix="new-transaction"
            creditCardViewActive={viewMode === "creditCard"}
          />

          <div className="lg:col-span-4 mt-2">
            <form.Subscribe selector={(state: { values: NewTransactionFormState }) => state.values}>
              {(values: NewTransactionFormState) => (
                <button
                  type="submit"
                  className={`w-full font-semibold py-3 px-4 rounded-interactive transition-all duration-200 flex items-center justify-center gap-2 ${
                    values.type === "income"
                      ? "bg-accent-positive text-white hover:shadow-glow-positive"
                      : "bg-accent-primary text-white hover:shadow-glow-accent"
                  }`}
                >
                  <Plus size={18} />
                  {values.type === "income"
                    ? values.isIncrement
                      ? "Adicionar Renda"
                      : "Adicionar Dedução de Renda"
                    : values.isInstallment
                      ? `Lançar ${values.installments}x Parcelas`
                      : "Adicionar Lançamento"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </Card>
  );
}
