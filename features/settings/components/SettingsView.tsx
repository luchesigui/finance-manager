"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  Check,
  Copy,
  Eye,
  EyeOff,
  Key,
  Monitor,
  Moon,
  PieChart,
  Plus,
  Save,
  Shield,
  Sun,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FieldError } from "@/components/ui/FieldError";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCategoriesData } from "@/features/categories/hooks/useCategoriesData";
import { getCategoryColorStyle } from "@/features/categories/utils/categoryColors";
import { PersonEditRow } from "@/features/people/components/PersonEditRow";
import { useDefaultPayerData } from "@/features/people/hooks/useDefaultPayerData";
import { useEmergencyFundData } from "@/features/people/hooks/useEmergencyFundData";
import { usePeopleData } from "@/features/people/hooks/usePeopleData";

import { calculateTotalIncome } from "@/features/transactions/hooks/useFinanceCalculations";
import { fetchJson } from "@/lib/apiClient";
import { zodValidator } from "@/lib/form";
import { incomeSchema, personNameSchema } from "@/lib/formSchemas";
import { useTheme } from "@/lib/theme/ThemeContext";
import type { Category, CurrentUserResponse, Person, PersonPatch } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  const queryClient = useQueryClient();

  // AI settings state
  const [openrouterApiKey, setOpenrouterApiKey] = useState("");
  const [isApiKeyDirty, setIsApiKeyDirty] = useState(false);
  const [aiAnalysisMonths, setAiAnalysisMonths] = useState(3);
  const [aiCustomContext, setAiCustomContext] = useState("");
  const [isSavingAiSettings, setIsSavingAiSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // API Token settings state
  const [apiToken, setApiToken] = useState("");
  const [showApiToken, setShowApiToken] = useState(false);
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  // Initialize AI Settings from fetched userData
  useEffect(() => {
    if (userData) {
      setOpenrouterApiKey("");
      setIsApiKeyDirty(false);
      setAiAnalysisMonths(userData.aiAnalysisMonths ?? 3);
      setAiCustomContext(userData.aiCustomContext ?? "");
      setApiToken(userData.apiToken ?? "");
    }
  }, [userData]);

  const handleSaveAiSettings = async () => {
    setIsSavingAiSettings(true);
    try {
      const response = await fetchJson<{ success: boolean }>("/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          openrouterApiKey: isApiKeyDirty
            ? openrouterApiKey === ""
              ? null
              : openrouterApiKey
            : undefined,
          aiAnalysisMonths,
          aiCustomContext: aiCustomContext.trim() || null,
        }),
      });

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        alert("Configurações de IA salvas com sucesso!");
      }
    } catch (error) {
      console.error("Failed to save AI settings:", error);
      alert("Falha ao salvar configurações de IA. Por favor, tente novamente.");
    } finally {
      setIsSavingAiSettings(false);
    }
  };

  const handleRegenerateApiToken = async () => {
    if (
      !confirm(
        "Tem certeza que deseja regenerar o seu Token de API? O token anterior deixará de funcionar imediatamente.",
      )
    ) {
      return;
    }
    setIsRegeneratingToken(true);
    try {
      const response = await fetchJson<{ success: boolean; apiToken?: string }>("/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          regenerateApiToken: true,
        }),
      });

      if (response.success && response.apiToken) {
        setApiToken(response.apiToken);
        alert("Token de API regenerado com sucesso!");
      }
    } catch (error) {
      console.error("Failed to regenerate API token:", error);
      alert("Falha ao regenerar token de API. Por favor, tente novamente.");
    } finally {
      setIsRegeneratingToken(false);
    }
  };

  const handleCopyApiToken = () => {
    if (!apiToken) return;
    navigator.clipboard.writeText(apiToken);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

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
      <Card className="p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
            <Users size={20} className="text-accent-primary" />
            Participantes & Salários
          </h2>
          {hasUnsavedChanges && (
            <Button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 text-sm"
            >
              <Save size={16} />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
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
                      <Input
                        id="new-person-name"
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                        className={cn(
                          "w-full text-sm",
                          field.state.meta.errors.length > 0 && "border-accent-negative",
                        )}
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
                        className={cn(
                          "w-full text-sm",
                          field.state.meta.errors.length > 0 && "border-accent-negative",
                        )}
                        placeholder="R$ 0,00"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </>
                  )}
                </createPersonForm.Field>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button type="submit" disabled={isCreatingPerson} className="text-sm py-1.5 h-auto">
                  {isCreatingPerson ? "Adicionando..." : "Adicionar"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelNewPerson}
                  className="text-sm py-1.5 h-auto"
                >
                  Cancelar
                </Button>
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
      </Card>

      {/* Emergency Fund Section */}
      <Card className="p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
            <Shield size={20} className="text-accent-primary" />
            Reserva de Emergência
          </h2>
          {hasEmergencyFundChanged && (
            <Button
              type="button"
              onClick={handleSaveEmergencyFund}
              disabled={isUpdatingEmergencyFund}
              className="flex items-center gap-2 text-sm"
            >
              <Save size={16} />
              {isUpdatingEmergencyFund ? "Salvando..." : "Salvar"}
            </Button>
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
            className="w-full"
            placeholder="R$ 0,00"
          />
        </div>
      </Card>

      {/* Categories Section */}
      <Card className="p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
            <PieChart size={20} className="text-accent-primary" />
            Categorias & Metas (%)
          </h2>
          {hasUnsavedCategoryChanges && (
            <Button
              type="button"
              onClick={handleSaveCategories}
              disabled={isSavingCategories || totalCategoryPercent !== 100}
              className="flex items-center gap-2 text-sm"
            >
              <Save size={16} />
              {isSavingCategories ? "Salvando..." : "Salvar Alterações"}
            </Button>
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
                  <Input
                    type="number"
                    value={edits.targetPercent}
                    onChange={(e) =>
                      updateCategoryEdit(cat.id, Number.parseFloat(e.target.value) || 0)
                    }
                    className="w-16 text-right text-sm py-1 h-auto"
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
      </Card>

      {/* AI Settings Section */}
      <Card className="p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
              <Brain size={20} className="text-accent-primary" />
              Configurações de IA
            </h2>
            <p className="text-xs text-muted mt-1">
              Configure as credenciais e parâmetros para a Análise Financeira por IA
            </p>
          </div>
          <Button
            type="button"
            onClick={handleSaveAiSettings}
            disabled={isSavingAiSettings}
            className="flex items-center gap-2 text-sm"
          >
            <Save size={16} />
            {isSavingAiSettings ? "Salvando..." : "Salvar IA"}
          </Button>
        </div>

        <div className="space-y-4">
          {/* API Key */}
          <div className="space-y-2">
            <label htmlFor="openrouter-api-key" className="text-sm font-medium text-heading block">
              Chave de API do OpenRouter
            </label>
            <div className="relative">
              <Input
                id="openrouter-api-key"
                type={showApiKey ? "text" : "password"}
                value={openrouterApiKey}
                onChange={(e) => {
                  setOpenrouterApiKey(e.target.value);
                  setIsApiKeyDirty(true);
                }}
                placeholder={
                  userData?.openrouterApiKeyConfigured ? "••••••••" : "Insira sua chave sk-or-..."
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-heading"
                aria-label={showApiKey ? "Esconder chave de API" : "Mostrar chave de API"}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted">
              Sua chave é armazenada de forma segura e enviada diretamente para o OpenRouter apenas
              no servidor.
            </p>
          </div>

          {/* Analysis Period (Months) */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-heading block">
              Período de Análise (últimos meses)
            </span>
            <div className="grid grid-cols-3 gap-3">
              {[3, 6, 12].map((months) => {
                const isSelected = aiAnalysisMonths === months;
                return (
                  <label
                    key={months}
                    className={`
                      relative flex flex-col items-center justify-center min-h-[72px] p-3 rounded-card
                      border-2 cursor-pointer transition-all duration-200 text-center
                      ${
                        isSelected
                          ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                          : "border-noir-border hover:border-noir-border-light hover:bg-noir-active/30 text-heading"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="aiAnalysisMonths"
                      value={months}
                      checked={isSelected}
                      onChange={() => setAiAnalysisMonths(months)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-bold text-lg">{months} Meses</span>
                      {months === 6 && (
                        <span className="text-[10px] text-muted block leading-none">
                          Recomendado
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Custom Context */}
          <div className="space-y-2">
            <label htmlFor="ai-custom-context" className="text-sm font-medium text-heading block">
              Contexto Pessoal / Objetivos
            </label>
            <textarea
              id="ai-custom-context"
              value={aiCustomContext}
              onChange={(e) => setAiCustomContext(e.target.value)}
              placeholder="Descreva seus objetivos financeiros, perfil de gastos ou regras familiares para guiar as análises da IA (ex: 'Quero reduzir delivery, somos um casal com 1 filho, objetivo de fazer reserva de emergência de R$ 30k...')"
              className="w-full min-h-[100px] text-sm p-3 rounded-interactive border border-noir-border bg-noir-active text-heading placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary"
            />
          </div>
        </div>
      </Card>

      {/* API Token Section */}
      <Card className="p-card-padding">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
              <Key size={20} className="text-accent-primary" />
              Token de API para Integrações
            </h2>
            <p className="text-xs text-muted mt-1">
              Use este token para criar transações programaticamente através da API
            </p>
          </div>
          <Button
            type="button"
            onClick={handleRegenerateApiToken}
            disabled={isRegeneratingToken}
            className="flex items-center gap-2 text-sm"
          >
            {isRegeneratingToken ? "Gerando..." : "Regenerar Token"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="api-token-value" className="text-sm font-medium text-heading block">
              Seu Token de API (JWT)
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-token-value"
                  type={showApiToken ? "text" : "password"}
                  value={apiToken}
                  readOnly
                  placeholder="Nenhum token disponível"
                  className="pr-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowApiToken(!showApiToken)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-heading"
                  aria-label={showApiToken ? "Esconder token de API" : "Mostrar token de API"}
                >
                  {showApiToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button
                type="button"
                onClick={handleCopyApiToken}
                disabled={!apiToken}
                className="flex items-center gap-2 min-w-[100px]"
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
            <p className="text-xs text-muted mt-1">
              Faça requisições POST para{" "}
              <code className="bg-noir-active px-1.5 py-0.5 rounded font-mono text-accent-primary">
                /api/transactions
              </code>{" "}
              com o header{" "}
              <code className="bg-noir-active px-1.5 py-0.5 rounded font-mono text-accent-primary">
                Authorization: Bearer &lt;seu_token&gt;
              </code>
              .
            </p>
          </div>
        </div>
      </Card>

      {/* Appearance Section */}
      <Card className="p-card-padding">
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
      </Card>
    </div>
  );
}
