import { generateGeminiContent } from "@/lib/geminiClient";
import type { NewTransactionFormState } from "@/lib/types";
import { useState } from "react";
import { getCurrentYearMonth } from "../lib/transactionUtils";

export function useSmartFill(
  categories: { id: string; name: string }[],
  people: { id: string; name: string }[],
  defaultPayerId: string,
  selectedMonthDate: Date,
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form has complex generic types
  setFieldValue: (field: any, value: any) => void,
) {
  const [aiLoading, setAiLoading] = useState(false);
  const [smartInput, setSmartInput] = useState("");

  const handleSmartFill = async () => {
    if (!smartInput.trim()) return;
    setAiLoading(true);

    const categoriesPrompt = categories
      .map((category) => `${category.id}:${category.name}`)
      .join(", ");
    const peoplePrompt = people.map((person) => `${person.id}:${person.name}`).join(", ");
    const todayStr = new Date().toISOString().split("T")[0];

    const prompt = `
Analise o seguinte texto de despesa: "${smartInput}".
Data de hoje: ${todayStr}.

Extraia os dados para JSON com as chaves:
- description (string)
- amount (number)
- categoryId (string, escolha o ID mais adequado de: ${categoriesPrompt})
- paidBy (string, escolha o ID mais adequado de: ${peoplePrompt}. Se não mencionado, use null)
- date (string, formato YYYY-MM-DD. Se "hoje", use ${todayStr}. Se "ontem", calcule.)

Retorne APENAS o JSON, sem markdown.
`;

    try {
      const result = await generateGeminiContent(prompt);
      if (result) {
        const cleanJson = result
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const data = JSON.parse(cleanJson) as {
          description?: string;
          amount?: number;
          categoryId?: string;
          paidBy?: string | null;
          date?: string;
        };

        if (data.description) setFieldValue("description", data.description);
        if (data.amount) setFieldValue("amount", data.amount);
        if (data.categoryId) setFieldValue("categoryId", data.categoryId);
        if (data.paidBy) {
          setFieldValue("paidBy", data.paidBy);
        } else {
          setFieldValue("paidBy", defaultPayerId);
        }
        if (data.date) {
          const dateParts = data.date.split("-");
          const day = dateParts[2] ? Number.parseInt(dateParts[2], 10) : 1;
          if (day === 1) {
            setFieldValue("dateSelectionMode", "month");
            setFieldValue(
              "selectedMonth",
              dateParts[0] && dateParts[1]
                ? `${dateParts[0]}-${dateParts[1]}`
                : getCurrentYearMonth(selectedMonthDate),
            );
          } else {
            setFieldValue("dateSelectionMode", "specific");
          }
          setFieldValue("date", data.date);
        }
      }
    } catch (error) {
      console.error("Erro parsing AI JSON", error);
    } finally {
      setAiLoading(false);
    }
  };

  return {
    aiLoading,
    smartInput,
    setSmartInput,
    handleSmartFill,
  };
}
