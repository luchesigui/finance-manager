"use client";

import { useQuery } from "@tanstack/react-query";
import { PieChart, Plus, Save, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useDefaultPayer } from "@/components/finance/contexts/DefaultPayerContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import {
  calculatePeopleShare,
  calculateTotalIncome,
} from "@/components/finance/hooks/useFinanceCalculations";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { formatPercent } from "@/lib/format";
import type { Category, Person } from "@/lib/types";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

type PersonEdits = {
  [personId: string]: {
    name: string;
    income: number;
  };
};

type CategoryEdits = {
  [categoryId: string]: {
    name: string;
    targetPercent: number;
  };
};

export function SettingsView() {
  const { people, updatePeople, createPerson, deletePerson } = usePeople();
  const { categories, updateCategories } = useCategories();
  const { defaultPayerId, setDefaultPayerId } = useDefaultPayer();

  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonIncome, setNewPersonIncome] = useState<number | null>(null);
  const [isCreatingPerson, setIsCreatingPerson] = useState(false);
  const [showNewPersonForm, setShowNewPersonForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);

  // Local state for editing participants
  const [personEdits, setPersonEdits] = useState<PersonEdits>({});

  // Local state for editing categories
  const [categoryEdits, setCategoryEdits] = useState<CategoryEdits>({});

  // Get current user ID
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson<{ userId: string }>("/api/user"),
  });

  const currentUserId = userData?.userId;

  // Initialize edits from people data
  useEffect(() => {
    const initialEdits: PersonEdits = {};
    for (const person of people) {
      initialEdits[person.id] = {
        name: person.name,
        income: person.income,
      };
    }
    setPersonEdits(initialEdits);
  }, [people]);

  // Initialize edits from categories data
  useEffect(() => {
    const initialEdits: CategoryEdits = {};
    for (const category of categories) {
      initialEdits[category.id] = {
        name: category.name,
        targetPercent: category.targetPercent,
      };
    }
    setCategoryEdits(initialEdits);
  }, [categories]);

  // Separate current user from other participants
  const currentUserPerson = people.find((p) => p.linkedUserId === currentUserId);
  const otherPeople = people.filter((p) => p.linkedUserId !== currentUserId);

  // Use edited values for calculations
  const editedPeople = useMemo(() => {
    return people.map((person) => {
      const edits = personEdits[person.id];
      if (edits) {
        return { ...person, name: edits.name, income: edits.income };
      }
      return person;
    });
  }, [people, personEdits]);

  const totalIncome = calculateTotalIncome(editedPeople);
  const peopleWithShare = calculatePeopleShare(editedPeople, totalIncome);
  const currentUserWithShare = currentUserPerson
    ? peopleWithShare.find((p) => p.id === currentUserPerson.id)
    : null;
  const otherPeopleWithShare = peopleWithShare.filter((p) => p.linkedUserId !== currentUserId);

  // Check if there are unsaved changes for people
  const hasUnsavedChanges = useMemo(() => {
    return people.some((person) => {
      const edits = personEdits[person.id];
      if (!edits) return false;
      return edits.name !== person.name || edits.income !== person.income;
    });
  }, [people, personEdits]);

  // Check if there are unsaved changes for categories
  const hasUnsavedCategoryChanges = useMemo(() => {
    return categories.some((category) => {
      const edits = categoryEdits[category.id];
      if (!edits) return false;
      return edits.name !== category.name || edits.targetPercent !== category.targetPercent;
    });
  }, [categories, categoryEdits]);

  // Calculate total percentage from edited categories
  const totalCategoryPercent = useMemo(() => {
    return categories.reduce((sum, category) => {
      const edits = categoryEdits[category.id];
      if (edits) {
        return sum + edits.targetPercent;
      }
      return sum + category.targetPercent;
    }, 0);
  }, [categories, categoryEdits]);

  const updatePersonEdit = (personId: string, field: "name" | "income", value: string | number) => {
    setPersonEdits((prev) => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        [field]: value,
      },
    }));
  };

  const updateCategoryEdit = (
    categoryId: string,
    field: "name" | "targetPercent",
    value: string | number,
  ) => {
    setCategoryEdits((prev) => {
      const currentEdit = prev[categoryId] || {
        name: categories.find((c) => c.id === categoryId)?.name ?? "",
        targetPercent: categories.find((c) => c.id === categoryId)?.targetPercent ?? 0,
      };

      // If updating targetPercent, validate that total doesn't exceed 100%
      if (field === "targetPercent" && typeof value === "number") {
        const otherCategoriesTotal = categories.reduce((sum, cat) => {
          if (cat.id === categoryId) return sum;
          const edits = prev[cat.id];
          return sum + (edits?.targetPercent ?? cat.targetPercent);
        }, 0);

        const newTotal = otherCategoriesTotal + value;
        if (newTotal > 100) {
          // Don't allow the change if it would exceed 100%
          return prev;
        }
      }

      return {
        ...prev,
        [categoryId]: {
          ...currentEdit,
          [field]: value,
        },
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
          if (!edits) return null;
          if (edits.name === person.name && edits.income === person.income) return null;
          return {
            personId: person.id,
            patch: {
              name: edits.name,
              income: edits.income,
            } as Partial<Omit<Person, "id">>,
          };
        })
        .filter((update): update is NonNullable<typeof update> => update !== null);

      if (updates.length > 0) {
        await updatePeople(updates);
      }
    } catch (error) {
      console.error("Failed to save participants", error);
      alert("Falha ao salvar alterações. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCategories = async () => {
    if (!hasUnsavedCategoryChanges) return;

    // Validate total is exactly 100%
    if (totalCategoryPercent !== 100) {
      alert("O total das categorias deve ser exatamente 100%.");
      return;
    }

    setIsSavingCategories(true);
    try {
      const updates = categories
        .map((category) => {
          const edits = categoryEdits[category.id];
          if (!edits) return null;
          if (edits.name === category.name && edits.targetPercent === category.targetPercent)
            return null;
          return {
            categoryId: category.id,
            patch: {
              name: edits.name,
              targetPercent: edits.targetPercent,
            } as Partial<Omit<Category, "id">>,
          };
        })
        .filter((update): update is NonNullable<typeof update> => update !== null);

      if (updates.length > 0) {
        await updateCategories(updates);
      }
    } catch (error) {
      console.error("Failed to save categories", error);
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
      await createPerson({
        name: newPersonName,
        income: newPersonIncome,
      });
      setNewPersonName("");
      setNewPersonIncome(null);
      setShowNewPersonForm(false);
    } catch (error) {
      console.error("Failed to create person", error);
      alert("Falha ao criar participante. Por favor, tente novamente.");
    } finally {
      setIsCreatingPerson(false);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    if (!confirm("Tem certeza que deseja remover este participante?")) {
      return;
    }

    setDeletingPersonId(personId);
    try {
      await deletePerson(personId);
      // Remove from local edits if present
      setPersonEdits((prev) => {
        const updated = { ...prev };
        delete updated[personId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete person", error);
      alert("Falha ao remover participante. Por favor, tente novamente.");
    } finally {
      setDeletingPersonId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
          {/* Current User - Fixed Participant */}
          {currentUserWithShare && personEdits[currentUserWithShare.id] && (
            <div className="flex flex-col md:flex-row gap-3 items-end p-3 bg-indigo-50 rounded-lg border-2 border-indigo-200">
              <div className="flex-1 w-full">
                <label
                  htmlFor={`person-name-${currentUserWithShare.id}`}
                  className="text-xs text-indigo-700 font-medium"
                >
                  Nome (Você)
                </label>
                <input
                  id={`person-name-${currentUserWithShare.id}`}
                  type="text"
                  value={personEdits[currentUserWithShare.id]?.name ?? ""}
                  onChange={(event) =>
                    updatePersonEdit(currentUserWithShare.id, "name", event.target.value)
                  }
                  className="w-full bg-white border border-indigo-300 rounded px-2 py-1 text-sm"
                />
              </div>

              <div className="w-full md:w-48">
                <label
                  htmlFor={`person-income-${currentUserWithShare.id}`}
                  className="text-xs text-indigo-700 font-medium"
                >
                  Renda Mensal
                </label>
                <div className="relative">
                  <CurrencyInput
                    id={`person-income-${currentUserWithShare.id}`}
                    value={personEdits[currentUserWithShare.id]?.income ?? 0}
                    onValueChange={(nextIncomeValue) =>
                      updatePersonEdit(currentUserWithShare.id, "income", nextIncomeValue ?? 0)
                    }
                    className="w-full bg-white border border-indigo-300 rounded px-2 py-1 text-sm"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="w-full md:w-auto text-xs text-indigo-700 px-2 py-[6px] bg-white border border-indigo-200 rounded font-medium">
                Porcentagem: {formatPercent(currentUserWithShare.sharePercent * 100)}
              </div>
            </div>
          )}

          {/* Other Participants */}
          {otherPeopleWithShare.map((person) => {
            const edits = personEdits[person.id];
            if (!edits) return null;

            return (
              <div
                key={person.id}
                className="flex flex-col md:flex-row gap-3 items-end p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1 w-full">
                  <label
                    htmlFor={`person-name-${person.id}`}
                    className="text-xs text-slate-500 font-medium"
                  >
                    Nome
                  </label>
                  <input
                    id={`person-name-${person.id}`}
                    type="text"
                    value={edits.name}
                    onChange={(event) => updatePersonEdit(person.id, "name", event.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                  />
                </div>

                <div className="w-full md:w-48">
                  <label
                    htmlFor={`person-income-${person.id}`}
                    className="text-xs text-slate-500 font-medium"
                  >
                    Renda Mensal
                  </label>
                  <div className="relative">
                    <CurrencyInput
                      id={`person-income-${person.id}`}
                      value={edits.income}
                      onValueChange={(nextIncomeValue) =>
                        updatePersonEdit(person.id, "income", nextIncomeValue ?? 0)
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>

                <div className="w-full md:w-auto text-xs text-slate-500 px-2 py-[6px] bg-white border border-slate-200 rounded">
                  Porcentagem: {formatPercent(person.sharePercent * 100)}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePerson(person.id)}
                  disabled={deletingPersonId === person.id}
                  className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  title="Remover participante"
                >
                  <Trash2 size={16} />
                  {deletingPersonId === person.id ? "Removendo..." : "Remover"}
                </button>
              </div>
            );
          })}

          {/* Add New Participant Form */}
          {showNewPersonForm ? (
            <form
              onSubmit={handleCreatePerson}
              className="flex flex-col md:flex-row gap-3 items-end md:items-center p-4 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300"
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

        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="block text-sm font-medium text-slate-700 mb-2">
            Responsável Padrão (Pré-selecionado)
          </p>
          <div className="flex gap-4">
            {people.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                  defaultPayerId === p.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="defaultPayer"
                  checked={defaultPayerId === p.id}
                  onChange={() => setDefaultPayerId(p.id)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      </div>

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
                <input
                  type="text"
                  value={edits.name}
                  onChange={(event) => updateCategoryEdit(cat.id, "name", event.target.value)}
                  className={`flex-1 font-medium bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none py-1 ${cat.color}`}
                />
                <div className="flex items-center gap-2 w-32">
                  <input
                    type="number"
                    value={edits.targetPercent}
                    onChange={(event) => {
                      const value = Number.parseFloat(event.target.value) || 0;
                      updateCategoryEdit(cat.id, "targetPercent", value);
                    }}
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
              className={`font-bold ${
                totalCategoryPercent === 100 ? "text-green-600" : "text-red-500"
              }`}
            >
              {totalCategoryPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
