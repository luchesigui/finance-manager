import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  hasRecurringSelection: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onOpenBulkEdit: () => void;
  onBulkDelete: () => void;
}

export function BulkActionBar({
  selectedCount,
  hasRecurringSelection,
  onSelectAll,
  onClearSelection,
  onOpenBulkEdit,
  onBulkDelete,
}: BulkActionBarProps) {
  return (
    <div className="p-3 border-b border-noir-border bg-accent-primary/10 flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onSelectAll}
          className="text-xs px-2 py-1 h-auto"
        >
          Selecionar Todos
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onClearSelection}
          className="text-xs px-2 py-1 h-auto"
        >
          Limpar
        </Button>
      </div>
      <span className="text-xs text-accent-primary font-medium">
        {selectedCount} selecionado(s)
      </span>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={onOpenBulkEdit}
          disabled={selectedCount === 0 || hasRecurringSelection}
          className="text-xs px-3 py-1.5 h-auto"
        >
          <Pencil size={12} />
          Editar em Massa
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onBulkDelete}
          disabled={selectedCount === 0 || hasRecurringSelection}
          className="text-xs px-3 py-1.5 h-auto"
        >
          <Trash2 size={12} />
          Excluir
        </Button>
      </div>
    </div>
  );
}
