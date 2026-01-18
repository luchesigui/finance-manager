"use client";

import { useQuery } from "@tanstack/react-query";
import { PieChart, Plus, Save, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useDefaultPayer } from "@/components/finance/contexts/DefaultPayerContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { calculateTotalIncome } from "@/components/finance/hooks/useFinanceCalculations";
import { PersonEditRow } from "@/components/finance/PersonEditRow";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { fetchJson } from "@/lib/apiClient";
import { getCategoryColorStyle } from "@/lib/categoryColors";
import { formatPercent } from "@/lib/format";
import type { Category, CurrentUserResponse, Person, PersonPatch } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

type PersonEdits = Record<string, { name: string; income: number }>;
type CategoryEdits = Record<string, { targetPercent: number }>;

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
  const { people, updatePeople, createPerson, deletePerson } = usePeople();
  const { categories, updateCategories } = useCategories();
  const {
    defaultPayerId,
    setDefaultPayerId,
    isUpdating: isUpdatingDefaultPayer,
  } = useDefaultPayer();

  // Form state
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonIncome, setNewPersonIncome] = useState<number | null>(null);
  const [showNewPersonForm, setShowNewPersonForm] = useState(false);

  // Loading states
  const [isCreatingPerson, setIsCreatingPerson] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);

  // Edit states
  const [personEdits, setPersonEdits] = useState<PersonEdits>({});
  const [categoryEdits, setCategoryEdits] = useState<CategoryEdits>({});

  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson<CurrentUserResponse>("/api/user"),
  });

  const currentUserId = userData?.userId;

  // Initialize edits when data loads
  useEffect(() => {
    setPersonEdits(initializePersonEdits(people));
  }, [people]);

  useEffect(() => {
    setCategoryEdits(initializeCategoryEdits(categories));
  }, [categories]);

  // Separate current user from other participants
  const currentUserPerson = useMemo(
    () => people.find((person) => person.linkedUserId === currentUserId),
    [people, currentUserId],
  );

  const otherPeople = useMemo(
    () => people.filter((person) => person.linkedUserId !== currentUserId),
    [people, currentUserId],
  );

  // Calculate shares using edited values
  const editedPeople = useMemo(() => {
    return people.map((person) => {
      const edits = personEdits[person.id];
      return edits ? { ...person, name: edits.name, income: edits.income } : person;
    });
  }, [people, personEdits]);

  const totalIncome = calculateTotalIncome(editedPeople);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return people.some((person) => {
      const edits = personEdits[person.id];
      return edits && (edits.name !== person.name || edits.income !== person.income);
    });
  }, [people, personEdits]);

  const hasUnsavedCategoryChanges = useMemo(() => {
    return categories.some((category) => {
      const edits = categoryEdits[category.id];
      return edits && edits.targetPercent !== category.targetPercent;
    });
  }, [categories, categoryEdits]);

  const totalCategoryPercent = useMemo(() => {
    return categories.reduce((sum, category) => {
      const edits = categoryEdits[category.id];
      return sum + (edits?.targetPercent ?? category.targetPercent);
    }, 0);
  }, [categories, categoryEdits]);

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

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName || newPersonIncome === null) return;

    setIsCreatingPerson(true);
    try {
      await createPerson({ name: newPersonName, income: newPersonIncome });
      setNewPersonName("");
      setNewPersonIncome(null);
      setShowNewPersonForm(false);
    } catch (error) {
      console.error("Failed to create person:", error);
      alert("Falha ao criar participante. Por favor, tente novamente.");
    } finally {
      setIsCreatingPerson(false);
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

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Participants Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users size={20} />
            Participantes & Salários
          </h2>
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              onSubmit={handleCreatePerson}
              className="flex flex-col md:flex-row gap-3 items-end p-4 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300"
            >
              <div className="flex-1 w-full">
                <label htmlFor="new-person-name" className="text-xs text-slate-500 font-medium">
                  Nome
                </label>
                <input
                  id="new-person-name"
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                  placeholder="Nome do participante"
                />
              </div>
              <div className="w-full md:w-48">
                <label htmlFor="new-person-income" className="text-xs text-slate-500 font-medium">
                  Renda Mensal
                </label>
                <CurrencyInput
                  id="new-person-income"
                  value={newPersonIncome}
                  onValueChange={setNewPersonIncome}
                  required
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  type="submit"
                  disabled={isCreatingPerson}
                  className="px-4 py-1 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingPerson ? "Adicionando..." : "Adicionar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPersonForm(false);
                    setNewPersonName("");
                    setNewPersonIncome(null);
                  }}
                  className="px-4 py-1 bg-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewPersonForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 rounded-lg border-2 border-dashed border-slate-300 text-slate-600 font-medium transition-colors"
            >
              <Plus size={20} />
              Adicionar Novo Participante
            </button>
          )}
        </div>

        {/* Default Payer Selection */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <p className="block text-sm font-medium text-slate-700">
              Responsável Padrão (Pré-selecionado)
            </p>
            {isUpdatingDefaultPayer && <span className="text-xs text-slate-500">Salvando...</span>}
          </div>
          <div className="flex gap-4">
            {people.map((person) => (
              <label
                key={person.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                  defaultPayerId === person.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 hover:bg-slate-50"
                } ${isUpdatingDefaultPayer ? "opacity-50 cursor-wait" : ""}`}
              >
                <input
                  type="radio"
                  name="defaultPayer"
                  checked={defaultPayerId === person.id}
                  onChange={() => !isUpdatingDefaultPayer && setDefaultPayerId(person.id)}
                  disabled={isUpdatingDefaultPayer}
                  className="text-indigo-600 focus:ring-indigo-500 disabled:cursor-wait"
                />
                {person.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <PieChart size={20} />
            Categorias & Metas (%)
          </h2>
          {hasUnsavedCategoryChanges && (
            <button
              type="button"
              onClick={handleSaveCategories}
              disabled={isSavingCategories || totalCategoryPercent !== 100}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              <div key={cat.id} className="flex items-center gap-4">
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
                    className="w-16 border border-slate-300 rounded px-2 py-1 text-right text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="text-slate-500 text-sm">%</span>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
            <span className="font-semibold text-slate-600">Total Planejado</span>
            <span
              className={`font-bold ${totalCategoryPercent === 100 ? "text-green-600" : "text-red-500"}`}
            >
              {totalCategoryPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

