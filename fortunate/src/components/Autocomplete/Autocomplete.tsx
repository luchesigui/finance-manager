import clsx from "clsx";
import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Badge, type BadgeVariant } from "../Badge/Badge";
import styles from "./Autocomplete.module.css";

export interface AutocompleteOption {
  value: string;
  label: string;
  pillar: string;
}

export interface AutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  pillars: string[];
  onCreateCategory: (name: string, pillar: string) => void;
}

const PILLAR_VARIANT: Record<string, BadgeVariant> = {
  "Gastos Essenciais": "pilar-essenciais",
  Conforto: "pilar-conforto",
  Prazeres: "pilar-prazeres",
  Conhecimento: "pilar-conhecimento",
  Planejamento: "pilar-metas",
  Metas: "pilar-metas",
  "Liberdade Financeira": "pilar-liberdade",
};

function pillarToVariant(pillar: string): BadgeVariant {
  return PILLAR_VARIANT[pillar] ?? "pilar-metas";
}

export function Autocomplete({
  label,
  placeholder = "Buscar ou criar categoria...",
  value,
  onChange,
  options,
  pillars,
  onCreateCategory,
}: AutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();

  // Raw text inside the input
  const [inputValue, setInputValue] = useState("");
  // Debounced search term for filtering
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Synchronize input value with external value
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else {
      setInputValue("");
    }
  }, [value, options]);

  // Debounce logic for filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 200);

    return () => clearTimeout(handler);
  }, [inputValue]);

  // Filter options based on debounced search
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  // Determine if exact match exists
  const exactMatchExists = options.some(
    (opt) => opt.label.toLowerCase() === debouncedSearch.trim().toLowerCase(),
  );

  // Show "Create" option if we have a search term and no exact match
  const showCreateOption = debouncedSearch.trim().length > 0 && !exactMatchExists;

  const totalItemsCount = filteredOptions.length + (showCreateOption ? pillars.length : 0);

  // Handle closing on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset input text to selected option name on blur
        const selectedOption = options.find((opt) => opt.value === value);
        setInputValue(selectedOption ? selectedOption.label : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options]);

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleCreate = (name: string, pillar: string) => {
    onCreateCategory(name.trim(), pillar);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
      // Restore selected value text
      const selectedOption = options.find((opt) => opt.value === value);
      setInputValue(selectedOption ? selectedOption.label : "");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1 >= totalItemsCount ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 < 0 ? totalItemsCount - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < totalItemsCount) {
        if (focusedIndex < filteredOptions.length) {
          // Select existing
          handleSelect(filteredOptions[focusedIndex]);
        } else {
          // Select creation with pillar
          const pillarIndex = focusedIndex - filteredOptions.length;
          const selectedPillar = pillars[pillarIndex];
          handleCreate(inputValue, selectedPillar);
        }
      }
    }
  };

  return (
    <div ref={containerRef} className={styles.container}>
      {label && (
        <label htmlFor={generatedId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          id={generatedId}
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          className={clsx(styles.arrow, { [styles.arrowOpen]: isOpen })}
          onClick={() => {
            setIsOpen((o) => !o);
            inputRef.current?.focus();
          }}
        >
          ▾
        </button>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {filteredOptions.length > 0 &&
            filteredOptions.map((opt, index) => {
              const isSelected = opt.value === value;
              const isFocused = index === focusedIndex;
              return (
                <button
                  type="button"
                  key={opt.value}
                  className={clsx(styles.item, {
                    [styles.itemSelected]: isSelected,
                    [styles.itemFocused]: isFocused,
                  })}
                  onClick={() => handleSelect(opt)}
                >
                  <span>{opt.label}</span>
                  <Badge variant={pillarToVariant(opt.pillar)} className={styles.badgeCustom}>
                    {opt.pillar}
                  </Badge>
                </button>
              );
            })}

          {filteredOptions.length === 0 && !showCreateOption && (
            <div className={styles.noResults}>Nenhuma categoria encontrada</div>
          )}

          {showCreateOption && (
            <>
              <div className={styles.createHeader}>Criar "{inputValue.trim()}" em:</div>
              {pillars.map((pillar, index) => {
                const globalIndex = filteredOptions.length + index;
                const isFocused = globalIndex === focusedIndex;
                return (
                  <button
                    type="button"
                    key={pillar}
                    className={clsx(styles.createItem, {
                      [styles.itemFocused]: isFocused,
                    })}
                    onClick={() => handleCreate(inputValue, pillar)}
                  >
                    <span className={styles.createLabel}>
                      <span className={styles.createIcon}>+</span> Criar em
                    </span>
                    <Badge variant={pillarToVariant(pillar)} className={styles.badgeCustom}>
                      {pillar}
                    </Badge>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
