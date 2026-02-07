"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Monitor, Moon, PieChart, Plus, Save, Shield, Sun, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { PersonEditRow } from "@/components/finance/PersonEditRow";
import { useCategoriesData } from "@/components/finance/hooks/useCategoriesData";
import { useDefaultPayerData } from "@/components/finance/hooks/useDefaultPayerData";
import { useEmergencyFundData } from "@/components/finance/hooks/useEmergencyFundData";
import { calculateTotalIncome } from "@/components/finance/hooks/useFinanceCalculations";
import { usePeopleData } from "@/components/finance/hooks/usePeopleData";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FieldError } from "@/components/ui/FieldError";
import { fetchJson } from "@/lib/apiClient";
import { getCategoryColorStyle } from "@/lib/categoryColors";
import { zodValidator } from "@/lib/form";
import { incomeSchema, personNameSchema } from "@/lib/formSchemas";
import { useTheme } from "@/lib/theme/ThemeContext";
import type { Category, CurrentUserResponse, Person, PersonPatch } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

type PersonEdits = Record<string, { name: string; income: number }>;
type CategoryEdits = Record<string, { targetPercent: number }>;

type CreatePersonFormValues = {
  name: string;
  income: number | null;
};

// ============================================================================
// Helper Functions
// ============================================================================

function initializePersonEdits(people: Person[]): PersonEdits {
  const edits: PersonEdits = {};
  for (const person of people) {
    edits[person.id] = { name: person.name, income: person.income };
  }
  return edits;
}

function initializeCategoryEdits(categories: Category[]): CategoryEdits {
  const edits: CategoryEdits = {};
  for (const category of categories) {
    edits[category.id] = { targetPercent: category.targetPercent };
  }
  return edits;
}

// ============================================================================
// Component
// ============================================================================

export function SettingsView() {
  const { people, updatePeople, createPerson, deletePerson } = usePeopleData();
  const { categories, updateCategories } = useCategoriesData();
  const {
    defaultPayerId,
    setDefaultPayerId,
    isUpdating: isUpdatingDefaultPayer,
  } = useDefaultPayerData();
  const {
    emergencyFund,
    updateEmergencyFund,
    isUpdating: isUpdatingEmergencyFund,
  } = useEmergencyFundData();

  // Form state
  const [showNewPersonForm, setShowNewPersonForm] = useState(false);

  // Loading states
  const [isCreatingPerson, setIsCreatingPerson] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);

  // Edit states
  const [personEdits, setPersonEdits] = useState<PersonEdits>({});
  const [categoryEdits, setCategoryEdits] = useState<CategoryEdits>({});
  const [emergencyFundEdit, setEmergencyFundEdit] = useState<number | null>(null);

  // Track if emergency fund has been edited
  const hasEmergencyFundChanged = emergencyFundEdit !== null && emergencyFundEdit !== emergencyFund;

  // Initialize emergency fund edit when data loads
  useEffect(() => {
    setEmergencyFundEdit(emergencyFund);
  }, [emergencyFund]);

  // Handle emergency fund save
  const handleSaveEmergencyFund = async () => {
    if (emergencyFundEdit === null || !hasEmergencyFundChanged) return;
    try {
      await updateEmergencyFund(emergencyFundEdit);
    } catch (error) {
      console.error("Failed to save emergency fund:", error);
      alert("Falha ao salvar reserva de emergência. Por favor, tente novamente.");
    }
  };

  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson<CurrentUserResponse>("/api/user"),
  });

  const currentUserId = userData?.userId;

  // TanStack Form for creating new person
  const createPersonForm = useForm({
    defaultValues: {
      name: "",
      income: null as number | null,
    },
    onSubmit: async ({ value }) => {
      if (!value.name || value.income === null) return;

      setIsCreatingPerson(true);
      try {
        await createPerson({ name: value.name, income: value.income });
        createPersonForm.reset();
        setShowNewPersonForm(false);
      } catch (error) {
        console.error("Failed to create person:", error);
        alert("Falha ao criar participante. Por favor, tente novamente.");
      } finally {
        setIsCreatingPerson(false);
      }
    },
  });

  // Initialize edits when data loads
  useEffect(() => {
    setPersonEdits(initializePersonEdits(people));
  }, [people]);

  useEffect(() => {
    setCategoryEdits(initializeCategoryEdits(categories));
  }, [categories]);

  // Separate current user from other participants
  const currentUserPerson = people.find((person) => person.linkedUserId === currentUserId);
  const otherPeople = people.filter((person) => person.linkedUserId !== currentUserId);

  // Calculate shares using edited values
  const editedPeople = people.map((person) => {
    const edits = personEdits[person.id];
    return edits ? { ...person, name: edits.name, income: edits.income } : person;
  });

  const totalIncome = calculateTotalIncome(editedPeople);

  // Check for unsaved changes
  const hasUnsavedChanges = people.some((person) => {
    const edits = personEdits[person.id];
    return edits && (edits.name !== person.name || edits.income !== person.income);
  });

  const hasUnsavedCategoryChanges = categories.some((category) => {
    const edits = categoryEdits[category.id];
    return edits && edits.targetPercent !== category.targetPercent;
  });

  const totalCategoryPercent = categories.reduce((sum, category) => {
    const edits = categoryEdits[category.id];
    return sum + (edits?.targetPercent ?? category.targetPercent);
  }, 0);

  // ============================================================================
  // Handlers
  // ============================================================================

  const updatePersonEdit = (personId: string, field: "name" | "income", value: string | number) => {
    setPersonEdits((prev) => ({
      ...prev,
      [personId]: { ...prev[personId], [field]: value },
    }));
  };

  const updateCategoryEdit = (categoryId: string, value: number) => {
    setCategoryEdits((prev) => {
      // Validate total doesn't exceed 100%
      const otherCategoriesTotal = categories.reduce((sum, cat) => {
        if (cat.id === categoryId) return sum;
        const edits = prev[cat.id];
        return sum + (edits?.targetPercent ?? cat.targetPercent);
      }, 0);

      if (otherCategoriesTotal + value > 100) return prev;

      return {
        ...prev,
        [categoryId]: { targetPercent: value },
      };
    });
  };

  const handleSaveAll = async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      const updates = people
        .map((person) => {
          const edits = personEdits[person.id];
          if (!edits || (edits.name === person.name && edits.income === person.income)) {
            return null;
          }
          return {
            personId: person.id,
            patch: { name: edits.name, income: edits.income } as PersonPatch,
          };
        })
        .filter((u): u is NonNullable<typeof u> => u !== null);

      if (updates.length > 0) {
        await updatePeople(updates);
      }
    } catch (error) {
      console.error("Failed to save participants:", error);
      alert("Falha ao salvar alterações. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCategories = async () => {
    if (!hasUnsavedCategoryChanges) return;

    if (totalCategoryPercent !== 100) {
      alert("O total das categorias deve ser exatamente 100%.");
      return;
    }

    setIsSavingCategories(true);
    try {
      const updates = categories
        .map((category) => {
          const edits = categoryEdits[category.id];
          if (!edits || edits.targetPercent === category.targetPercent) {
            return null;
          }
          return {
            categoryId: category.id,
            patch: { targetPercent: edits.targetPercent },
          };
        })
        .filter((u): u is NonNullable<typeof u> => u !== null);

      if (updates.length > 0) {
        await updateCategories(updates);
      }
    } catch (error) {
      console.error("Failed to save categories:", error);
      alert("Falha ao salvar alterações. Por favor, tente novamente.");
    } finally {
      setIsSavingCategories(false);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    if (!confirm("Tem certeza que deseja remover este participante?")) return;

    setDeletingPersonId(personId);
    try {
      await deletePerson(personId);
      setPersonEdits((prev) => {
        const { [personId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error("Failed to delete person:", error);
      alert("Falha ao remover participante. Por favor, tente novamente.");
    } finally {
      setDeletingPersonId(null);
    }
  };

  const handleCancelNewPerson = () => {
    setShowNewPersonForm(false);
    createPersonForm.reset();
  };

  // ============================================================================
  // Theme Settings
  // ============================================================================

  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: "system" as const,
      label: "Sistema",
      description: "Segue a preferência do seu dispositivo",
      icon: Monitor,
    },
    {
      value: "dark" as const,
      label: "Escuro",
      description: "Tema Financial Noir",
      icon: Moon,
    },
    {
      value: "light" as const,
      label: "Claro",
      description: "Tema Paper",
      icon: Sun,
    },
  ];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Title */}
      <div className="text-center p-5 mb-2">
        <h1 className="text-4xl font-display text-heading tracking-tight">Configurações</h1>
        <span className="text-[11px] text-muted font-medium tracking-wider uppercase mt-1 block">
          Participantes, categorias e preferências
        </span>
      </div>

      {/* Participants Section */}
      <div className="noir-card p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
            <Users size={20} className="text-accent-primary" />
            Participantes & Salários
          </h2>
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="noir-btn-primary flex items-center gap-2 text-sm"
            >
              <Save size={16} />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Current User */}
          {currentUserPerson && personEdits[currentUserPerson.id] && (
            <PersonEditRow
              person={currentUserPerson}
              editedIncome={personEdits[currentUserPerson.id].income}
              edits={personEdits[currentUserPerson.id]}
              totalIncome={totalIncome}
              onEditChange={updatePersonEdit}
              isCurrentUser
            />
          )}

          {/* Other Participants */}
          {otherPeople.map((person) => {
            const edits = personEdits[person.id];
            if (!edits) return null;

            return (
              <PersonEditRow
                key={person.id}
                person={person}
                editedIncome={edits.income}
                edits={edits}
                totalIncome={totalIncome}
                onEditChange={updatePersonEdit}
                onDelete={handleDeletePerson}
                isDeleting={deletingPersonId === person.id}
              />
            );
          })}

          {/* Add New Person Form */}
          {showNewPersonForm ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                createPersonForm.handleSubmit();
              }}
              className="flex flex-col md:flex-row gap-3 items-end p-4 bg-noir-active rounded-card border-2 border-dashed border-noir-border-light"
            >
              <div className="flex-1 w-full">
                <createPersonForm.Field
                  name="name"
                  validators={{
                    onBlur: zodValidator(personNameSchema),
                  }}
                >
                  {(field) => (
                    <>
                      <label htmlFor="new-person-name" className="text-xs text-body font-medium">
                        Nome
                      </label>
                      <input
                        id="new-person-name"
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                        className={`noir-input w-full text-sm ${
                          field.state.meta.errors.length > 0 ? "border-accent-negative" : ""
                        }`}
                        placeholder="Nome do participante"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </>
                  )}
                </createPersonForm.Field>
              </div>
              <div className="w-full md:w-48">
                <createPersonForm.Field
                  name="income"
                  validators={{
                    onBlur: zodValidator(incomeSchema),
                  }}
                >
                  {(field) => (
                    <>
                      <label htmlFor="new-person-income" className="text-xs text-body font-medium">
                        Renda Mensal
                      </label>
                      <CurrencyInput
                        id="new-person-income"
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                        required
                        className={`noir-input w-full text-sm ${
                          field.state.meta.errors.length > 0 ? "border-accent-negative" : ""
                        }`}
                        placeholder="R$ 0,00"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </>
                  )}
                </createPersonForm.Field>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  type="submit"
                  disabled={isCreatingPerson}
                  className="noir-btn-primary text-sm py-1.5"
                >
                  {isCreatingPerson ? "Adicionando..." : "Adicionar"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelNewPerson}
                  className="noir-btn-secondary text-sm py-1.5"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewPersonForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-noir-active hover:bg-noir-surface rounded-card border-2 border-dashed border-noir-border-light text-body hover:text-heading font-medium transition-all duration-200"
            >
              <Plus size={20} />
              Adicionar Novo Participante
            </button>
          )}
        </div>

        {/* Default Payer Selection */}
        <div className="mt-6 pt-4 border-t border-noir-border">
          <div className="flex items-center gap-2 mb-3">
            <p className="block text-sm font-medium text-heading">
              Responsável Padrão (Pré-selecionado)
            </p>
            {isUpdatingDefaultPayer && <span className="text-xs text-muted">Salvando...</span>}
          </div>
          <div className="flex flex-wrap gap-3">
            {people.map((person) => (
              <label
                key={person.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-interactive border cursor-pointer transition-all duration-200 ${
                  defaultPayerId === person.id
                    ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                    : "border-noir-border hover:bg-noir-active hover:border-noir-border-light text-body"
                } ${isUpdatingDefaultPayer ? "opacity-50 cursor-wait" : ""}`}
              >
                <input
                  type="radio"
                  name="defaultPayer"
                  checked={defaultPayerId === person.id}
                  onChange={() => !isUpdatingDefaultPayer && setDefaultPayerId(person.id)}
                  disabled={isUpdatingDefaultPayer}
                  className="text-accent-primary focus:ring-accent-primary bg-noir-active border-noir-border disabled:cursor-wait"
                />
                {person.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Fund Section */}
      <div className="noir-card p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
            <Shield size={20} className="text-accent-primary" />
            Reserva de Emergência
          </h2>
          {hasEmergencyFundChanged && (
            <button
              type="button"
              onClick={handleSaveEmergencyFund}
              disabled={isUpdatingEmergencyFund}
              className="noir-btn-primary flex items-center gap-2 text-sm"
            >
              <Save size={16} />
              {isUpdatingEmergencyFund ? "Salvando..." : "Salvar"}
            </button>
          )}
        </div>

        <p className="text-sm text-muted mb-4">
          Informe o valor total da reserva de emergência da sua família. Este valor será usado nas
          simulações para calcular quanto tempo você consegue manter o padrão de vida em caso de
          redução de renda.
        </p>

        <div className="max-w-xs">
          <label htmlFor="emergency-fund" className="text-xs text-body font-medium mb-1 block">
            Valor da Reserva
          </label>
          <CurrencyInput
            id="emergency-fund"
            value={emergencyFundEdit}
            onValueChange={(value) => setEmergencyFundEdit(value ?? 0)}
            className="noir-input w-full"
            placeholder="R$ 0,00"
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="noir-card p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
            <PieChart size={20} className="text-accent-primary" />
            Categorias & Metas (%)
          </h2>
          {hasUnsavedCategoryChanges && (
            <button
              type="button"
              onClick={handleSaveCategories}
              disabled={isSavingCategories || totalCategoryPercent !== 100}
              className="noir-btn-primary flex items-center gap-2 text-sm"
            >
              <Save size={16} />
              {isSavingCategories ? "Salvando..." : "Salvar Alterações"}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const edits = categoryEdits[cat.id];
            if (!edits) return null;

            return (
              <div
                key={cat.id}
                className="flex items-center gap-4 p-2 rounded-interactive hover:bg-noir-active/30 transition-colors"
              >
                <span className="flex-1 font-medium py-1" style={getCategoryColorStyle(cat.name)}>
                  {cat.name}
                </span>
                <div className="flex items-center justify-end gap-2 w-32">
                  <input
                    type="number"
                    value={edits.targetPercent}
                    onChange={(e) =>
                      updateCategoryEdit(cat.id, Number.parseFloat(e.target.value) || 0)
                    }
                    className="noir-input w-16 text-right text-sm py-1"
                    min="0"
                    max="100"
                  />
                  <span className="text-body text-sm">%</span>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-4 border-t border-noir-border mt-4">
            <span className="font-semibold text-body">Total Planejado</span>
            <span
              className={`font-bold tabular-nums ${
                totalCategoryPercent === 100 ? "text-accent-positive" : "text-accent-negative"
              }`}
            >
              {totalCategoryPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="noir-card p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
              <Monitor size={20} className="text-accent-primary" />
              Aparência
            </h2>
            <p className="text-xs text-muted mt-1">
              Personalize como o FinançasPro aparece no seu dispositivo
            </p>
          </div>
        </div>

        <div>
          <fieldset>
            <legend className="sr-only">Escolha o tema</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;

                return (
                  <label
                    key={option.value}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-card 
                      border-2 cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "border-accent-primary bg-accent-primary/10"
                          : "border-noir-border hover:border-noir-border-light hover:bg-noir-active/30"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => setTheme(option.value)}
                      className="sr-only"
                    />

                    <div
                      className={`
                        p-3 rounded-interactive
                        ${
                          isSelected
                            ? "bg-accent-primary/20 text-accent-primary"
                            : "bg-noir-active text-body"
                        }
                      `}
                    >
                      <Icon size={24} />
                    </div>

                    <div className="text-center">
                      <span
                        className={`
                          font-medium block
                          ${isSelected ? "text-accent-primary" : "text-heading"}
                        `}
                      >
                        {option.label}
                      </span>
                      <span className="text-xs text-muted">{option.description}</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-primary" />
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
