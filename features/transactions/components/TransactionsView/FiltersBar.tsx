import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, Plus, Search, SlidersHorizontal } from "lucide-react";
import type { UseTransactionFilters } from "./hooks/useTransactionFilters";

interface FiltersBarProps {
  filters: UseTransactionFilters;
  people: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  visibleCount: number;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
}

export function FiltersBar({
  filters,
  people,
  categories,
  visibleCount,
  isSelectionMode,
  onToggleSelectionMode,
}: FiltersBarProps) {
  const {
    viewMode,
    typeFilter,
    setTypeFilter,
    paidByFilter,
    setPaidByFilter,
    categoryFilter,
    setCategoryFilter,
    creditCardFilter,
    setCreditCardFilter,
    isNextBillingFilter,
    setIsNextBillingFilter,
    recurringFilter,
    setRecurringFilter,
    outlierFilter,
    setOutlierFilter,
    isSearchOpen,
    setIsSearchOpen,
    isAdvancedFiltersOpen,
    setIsAdvancedFiltersOpen,
    getAdvancedFilterCount,
  } = filters;

  return (
    <div className="p-4 border-b border-noir-border bg-noir-active/30 flex flex-wrap items-center gap-3">
      {viewMode === "general" && (
        <div className="bg-noir-active p-1 rounded-interactive flex gap-1 border border-noir-border">
          <button
            type="button"
            onClick={() => setTypeFilter(typeFilter === "expense" ? "all" : "expense")}
            className={`px-4 py-1.5 text-sm font-medium rounded-interactive transition-all duration-200 ${
              typeFilter === "expense"
                ? "bg-accent-primary text-white shadow-glow-accent"
                : "text-body hover:text-heading hover:bg-noir-surface"
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter(typeFilter === "income" ? "all" : "income")}
            className={`px-4 py-1.5 text-sm font-medium rounded-interactive transition-all duration-200 ${
              typeFilter === "income"
                ? "bg-accent-primary text-white shadow-glow-accent"
                : "text-body hover:text-heading hover:bg-noir-surface"
            }`}
          >
            Renda
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter(typeFilter === "transfer" ? "all" : "transfer")}
            className={`px-4 py-1.5 text-sm font-medium rounded-interactive transition-all duration-200 ${
              typeFilter === "transfer"
                ? "bg-accent-primary text-white shadow-glow-accent"
                : "text-body hover:text-heading hover:bg-noir-surface"
            }`}
          >
            Transferência
          </button>
        </div>
      )}

      {people.length > 1 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-[42px] rounded-interactive bg-noir-active border-noir-border text-body hover:text-heading hover:bg-noir-surface flex items-center gap-2"
            >
              <Plus size={16} className="text-muted" />
              {paidByFilter === "all"
                ? "Atribuído à"
                : people.find((p) => p.id === paidByFilter)?.name}
              <ChevronDown size={14} className="text-muted" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1 bg-noir-surface border-noir-border">
            <button
              type="button"
              className="w-full text-left p-2 text-sm text-heading hover:bg-noir-active cursor-pointer rounded-interactive border-0 bg-transparent"
              onClick={() => setPaidByFilter("all")}
            >
              Todos
            </button>
            {people.map((person) => (
              <button
                key={person.id}
                type="button"
                className="w-full text-left p-2 text-sm text-heading hover:bg-noir-active cursor-pointer rounded-interactive border-0 bg-transparent"
                onClick={() => setPaidByFilter(person.id)}
              >
                {person.name}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-[42px] rounded-interactive bg-noir-active border-noir-border text-body hover:text-heading hover:bg-noir-surface flex items-center gap-2"
            disabled={typeFilter === "income"}
          >
            <Plus size={16} className="text-muted" />
            Categoria
            {categoryFilter.size > 0 && (
              <Badge variant="secondary" className="ml-1 bg-accent-primary text-white">
                {categoryFilter.size}
              </Badge>
            )}
            <ChevronDown size={14} className="text-muted" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-0 bg-noir-surface border-noir-border">
          <div className="max-h-[300px] overflow-y-auto p-1">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-noir-active/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={categoryFilter.has(category.id)}
                  onChange={(e) => {
                    const newSet = new Set(categoryFilter);
                    if (e.target.checked) {
                      newSet.add(category.id);
                    } else {
                      newSet.delete(category.id);
                    }
                    setCategoryFilter(newSet);
                  }}
                  className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
                />
                <span className="text-sm text-heading">{category.name}</span>
              </label>
            ))}
          </div>

          <div className="p-2 border-t border-noir-border flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter(new Set(categories.map((c) => c.id)))}
              className="text-xs px-3 py-1.5 rounded-interactive font-medium transition-all duration-200 bg-accent-primary text-white shadow-glow-accent"
            >
              Selecionar Todas
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter(new Set())}
              className="text-xs px-3 py-1.5 rounded-interactive font-medium transition-all duration-200 bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
            >
              Limpar
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-[42px] rounded-interactive bg-noir-active border-noir-border text-body hover:text-heading hover:bg-noir-surface flex items-center gap-2"
            aria-label="Filtrar lançamentos"
          >
            <SlidersHorizontal size={16} className="text-muted" />
            Mais filtros
            {getAdvancedFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1 bg-accent-primary text-white">
                {getAdvancedFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-4 bg-noir-surface border-noir-border space-y-6"
          align="end"
        >
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
            FILTROS AVANÇADOS
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="card-filter" className="text-sm font-medium text-heading">
                Cartão
              </Label>
              <Switch
                id="card-filter"
                checked={creditCardFilter === "yes"}
                onCheckedChange={(checked) => setCreditCardFilter(checked ? "yes" : "all")}
                className="data-[state=unchecked]:bg-noir-active"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="next-billing-filter" className="text-sm font-medium text-heading">
                Ocultar gastos da próxima fatura
              </Label>
              <Switch
                id="next-billing-filter"
                checked={isNextBillingFilter === "yes"}
                onCheckedChange={(checked) => setIsNextBillingFilter(checked ? "yes" : "all")}
                className="data-[state=unchecked]:bg-noir-active"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="recurring-adv-filter" className="text-sm font-medium text-heading">
                Recorrente
              </Label>
              <Switch
                id="recurring-adv-filter"
                checked={recurringFilter === "yes"}
                onCheckedChange={(checked) => setRecurringFilter(checked ? "yes" : "all")}
                className="data-[state=unchecked]:bg-noir-active"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="outlier-adv-filter" className="text-sm font-medium text-heading">
                Fora do padrão
              </Label>
              <Switch
                id="outlier-adv-filter"
                checked={outlierFilter === "yes"}
                onCheckedChange={(checked) => setOutlierFilter(checked ? "yes" : "all")}
                className="data-[state=unchecked]:bg-noir-active"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-noir-border flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCreditCardFilter("all");
                setIsNextBillingFilter("all");
                setRecurringFilter("all");
                setOutlierFilter("all");
              }}
              className="text-xs px-3 py-1.5 h-auto font-medium bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
            >
              Limpar
            </Button>
            <Button
              type="button"
              onClick={() => setIsAdvancedFiltersOpen(false)}
              className="text-xs px-3 py-1.5 h-auto font-medium bg-accent-primary text-white shadow-glow-accent"
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1" />

      <Badge variant="secondary" className="w-fit">
        {visibleCount} itens
      </Badge>

      <button
        type="button"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={`p-1.5 rounded-interactive transition-all duration-200 ${
          isSearchOpen
            ? "bg-accent-primary text-white shadow-glow-accent"
            : "bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
        }`}
        title="Buscar lançamentos"
        aria-label="Buscar lançamentos"
      >
        <Search size={16} />
      </button>
      <button
        type="button"
        onClick={onToggleSelectionMode}
        className={`text-xs px-3 py-1.5 rounded-interactive font-medium transition-all duration-200 ${
          isSelectionMode
            ? "bg-accent-primary text-white shadow-glow-accent"
            : "bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
        }`}
      >
        {isSelectionMode ? "Cancelar Seleção" : "Selecionar"}
      </button>
    </div>
  );
}
