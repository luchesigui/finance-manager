import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onClose: () => void;
}

export function SearchBar({ searchQuery, onSearchQueryChange, onClose }: SearchBarProps) {
  return (
    <div className="p-3 border-b border-noir-border bg-noir-active/30 animate-in slide-in-from-top-2 duration-200">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Buscar por descrição, categoria, pessoa..."
          className="w-full pl-9 pr-8 py-2 text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
