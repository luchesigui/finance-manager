import {
  ArrowRightLeft,
  BrainCircuit,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Layers,
  Loader2,
  PieChart,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

// --- Configuração da API Gemini ---
const apiKey = ""; // A chave será injetada pelo ambiente de execução

async function generateGeminiContent(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não foi possível gerar uma resposta."
    );
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return null;
  }
}

// --- Utilitários ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatPercent = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

const formatMonthYear = (date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
};

// --- Dados Iniciais (Mock) ---
const INITIAL_PEOPLE = [
  { id: "p1", name: "Gui", income: 40000, color: "bg-blue-500" },
  { id: "p2", name: "Amanda", income: 12000, color: "bg-pink-500" },
];

const INITIAL_CATEGORIES = [
  { id: "c1", name: "Custos Fixos", targetPercent: 25, color: "text-red-600" },
  { id: "c2", name: "Conforto", targetPercent: 15, color: "text-purple-600" },
  { id: "c3", name: "Metas", targetPercent: 15, color: "text-green-600" },
  { id: "c4", name: "Prazeres", targetPercent: 10, color: "text-yellow-600" },
  {
    id: "c5",
    name: "Liberdade Financeira",
    targetPercent: 30,
    color: "text-indigo-600",
  },
  { id: "c6", name: "Conhecimento", targetPercent: 5, color: "text-cyan-600" },
];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const INITIAL_TRANSACTIONS = [
  {
    id: 1,
    description: "Aluguel",
    amount: 4100,
    categoryId: "c1",
    paidBy: "p1",
    isRecurring: true,
    date: new Date(currentYear, currentMonth, 1).toISOString().split("T")[0],
  },
  {
    id: 2,
    description: "Condomínio",
    amount: 1025,
    categoryId: "c1",
    paidBy: "p1",
    isRecurring: true,
    date: new Date(currentYear, currentMonth, 5).toISOString().split("T")[0],
  },
  {
    id: 3,
    description: "Terapia Amanda",
    amount: 1200,
    categoryId: "c1",
    paidBy: "p2",
    isRecurring: true,
    date: new Date(currentYear, currentMonth, 10).toISOString().split("T")[0],
  },
  {
    id: 4,
    description: "Escola da Chiara",
    amount: 500,
    categoryId: "c2",
    paidBy: "p1",
    isRecurring: true,
    date: new Date(currentYear, currentMonth, 15).toISOString().split("T")[0],
  },
  {
    id: 5,
    description: "Mercado Mensal",
    amount: 800,
    categoryId: "c1",
    paidBy: "p1",
    isRecurring: false,
    date: new Date(currentYear, currentMonth - 1, 10)
      .toISOString()
      .split("T")[0],
  },
];

export default function App() {
  // --- Estados ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [defaultPayerId, setDefaultPayerId] = useState("p1");

  // Estados AI
  const [aiLoading, setAiLoading] = useState(false);
  const [smartInput, setSmartInput] = useState("");

  const [newTrans, setNewTrans] = useState({
    description: "",
    amount: "",
    categoryId: "c1",
    paidBy: "",
    isRecurring: false,
    date: "",
    isInstallment: false,
    installments: 2,
  });

  useEffect(() => {
    setNewTrans((prev) => ({ ...prev, paidBy: defaultPayerId }));
  }, [defaultPayerId]);

  // --- Navegação Temporal ---
  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // --- Filtros ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const [year, month] = t.date.split("-");
      return (
        parseInt(year) === currentDate.getFullYear() &&
        parseInt(month) === currentDate.getMonth() + 1
      );
    });
  }, [transactions, currentDate]);

  // --- Cálculos ---
  const totalIncome = useMemo(
    () => people.reduce((acc, p) => acc + p.income, 0),
    [people]
  );

  const peopleShare = useMemo(() => {
    return people.map((p) => ({
      ...p,
      sharePercent: totalIncome > 0 ? p.income / totalIncome : 0,
    }));
  }, [people, totalIncome]);

  const categorySummary = useMemo(() => {
    const summary = categories.map((cat) => {
      const totalSpent = filteredTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((acc, t) => acc + t.amount, 0);

      const realPercentOfIncome =
        totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;

      return {
        ...cat,
        totalSpent,
        realPercentOfIncome,
      };
    });
    return summary;
  }, [categories, filteredTransactions, totalIncome]);

  const totalExpenses = filteredTransactions.reduce(
    (acc, t) => acc + t.amount,
    0
  );

  const settlementData = useMemo(() => {
    return peopleShare.map((person) => {
      const paidAmount = filteredTransactions
        .filter((t) => t.paidBy === person.id)
        .reduce((acc, t) => acc + t.amount, 0);

      const fairShareAmount = totalExpenses * person.sharePercent;
      const balance = paidAmount - fairShareAmount;

      return {
        ...person,
        paidAmount,
        fairShareAmount,
        balance,
      };
    });
  }, [peopleShare, filteredTransactions, totalExpenses]);

  // --- Handlers ---
  const handleAddTransaction = (e) => {
    e?.preventDefault();
    if (!newTrans.description || !newTrans.amount) return;

    let baseDateStr = newTrans.date;
    if (!baseDateStr) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      baseDateStr = `${year}-${month}-01`;
    }

    const newTransactionsList = [];
    const amountVal = parseFloat(newTrans.amount);

    if (newTrans.isInstallment && newTrans.installments > 1) {
      const installmentValue = amountVal / newTrans.installments;
      const baseDateObj = new Date(baseDateStr + "T12:00:00");

      for (let i = 0; i < newTrans.installments; i++) {
        const dateObj = new Date(baseDateObj);
        dateObj.setMonth(baseDateObj.getMonth() + i);

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");

        newTransactionsList.push({
          id: Date.now() + i,
          description: `${newTrans.description} (${i + 1}/${
            newTrans.installments
          })`,
          amount: installmentValue,
          categoryId: newTrans.categoryId,
          paidBy: newTrans.paidBy,
          isRecurring: false,
          date: `${year}-${month}-${day}`,
        });
      }
    } else {
      newTransactionsList.push({
        id: Date.now(),
        description: newTrans.description,
        amount: amountVal,
        categoryId: newTrans.categoryId,
        paidBy: newTrans.paidBy,
        isRecurring: newTrans.isRecurring,
        date: baseDateStr,
      });
    }

    setTransactions([...newTransactionsList, ...transactions]);

    setNewTrans({
      description: "",
      amount: "",
      categoryId: categories[0].id,
      paidBy: defaultPayerId,
      isRecurring: false,
      date: "",
      isInstallment: false,
      installments: 2,
    });
    setSmartInput(""); // Limpa input smart
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const updatePerson = (id, field, value) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const updateCategory = (id, field, value) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // --- Funcionalidades AI ---

  // 1. Preenchimento Inteligente de Transação
  const handleSmartFill = async () => {
    if (!smartInput.trim()) return;
    setAiLoading(true);

    const categoriesPrompt = categories
      .map((c) => `${c.id}:${c.name}`)
      .join(", ");
    const peoplePrompt = people.map((p) => `${p.id}:${p.name}`).join(", ");
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
        // Limpar markdown se houver
        const cleanJson = result
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const data = JSON.parse(cleanJson);

        setNewTrans((prev) => ({
          ...prev,
          description: data.description || prev.description,
          amount: data.amount || prev.amount,
          categoryId: data.categoryId || prev.categoryId,
          paidBy: data.paidBy || defaultPayerId, // Usa padrão se AI não detectar
          date: data.date || prev.date,
        }));
      }
    } catch (e) {
      console.error("Erro parsing AI JSON", e);
    } finally {
      setAiLoading(false);
    }
  };

  // --- Componentes UI ---
  const MonthNavigator = () => (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
      <button
        onClick={handlePrevMonth}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2 justify-center">
          <Calendar size={20} className="text-indigo-600" />
          {formatMonthYear(currentDate)}
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          {filteredTransactions.length} lançamentos neste mês
        </span>
      </div>
      <button
        onClick={handleNextMonth}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MonthNavigator />

      {/* Resumo Renda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Renda Total Familiar
          </h3>
          <p className="text-2xl font-bold text-slate-800">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Total Gasto ({formatMonthYear(currentDate)})
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Saldo Livre
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* COMPENSAÇÃO / SETTLEMENT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <ArrowRightLeft size={18} />
            Distribuição Justa ({formatMonthYear(currentDate)})
          </h2>
        </div>
        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum gasto registrado neste mês para calcular.
            </div>
          ) : (
            <div className="space-y-6">
              {settlementData.map((person) => (
                <div key={person.id} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="font-medium text-lg text-slate-800">
                        {person.name}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        (Renda: {formatPercent(person.sharePercent * 100)})
                      </span>
                    </div>
                    <div
                      className={`text-sm font-bold px-3 py-1 rounded-full ${
                        person.balance >= 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {person.balance >= 0 ? "A Receber" : "A Pagar"}:{" "}
                      {formatCurrency(Math.abs(person.balance))}
                    </div>
                  </div>

                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-slate-300 opacity-50 transition-all duration-500"
                      style={{
                        width: `${
                          totalExpenses > 0
                            ? (person.fairShareAmount / totalExpenses) * 100
                            : 0
                        }%`,
                      }}
                      title="Parte Justa"
                    ></div>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 flex justify-between">
                    <span>
                      Pagou de fato:{" "}
                      <strong className="text-slate-700">
                        {formatCurrency(person.paidAmount)}
                      </strong>
                    </span>
                    <span>
                      Deveria pagar:{" "}
                      <strong className="text-slate-700">
                        {formatCurrency(person.fairShareAmount)}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p className="font-semibold mb-1">Resumo do Acerto:</p>
                {settlementData
                  .filter((p) => p.balance < -0.01)
                  .map((debtor) => {
                    return settlementData
                      .filter((p) => p.balance > 0.01)
                      .map((creditor) => (
                        <p key={`${debtor.id}-${creditor.id}`}>
                          👉 <strong>{debtor.name}</strong> precisa transferir{" "}
                          <strong>
                            {formatCurrency(Math.abs(debtor.balance))}
                          </strong>{" "}
                          para <strong>{creditor.name}</strong>.
                        </p>
                      ));
                  })}
                {settlementData.every((p) => Math.abs(p.balance) < 1) && (
                  <p>✅ Tudo quitado! Ninguém deve nada.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categorias */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <PieChart size={18} />
            Metas vs Realizado
          </h2>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Gasto</th>
                <th className="px-4 py-3 text-center">% Previsto</th>
                <th className="px-4 py-3 text-center">% Real</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.map((cat) => {
                const isOverBudget =
                  cat.realPercentOfIncome > cat.targetPercent;
                return (
                  <tr
                    key={cat.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className={`px-4 py-3 font-medium ${cat.color}`}>
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(cat.totalSpent)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cat.targetPercent}%
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      {cat.realPercentOfIncome.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      {isOverBudget ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                          Estourou
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                          Dentro
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50 font-bold">
                <td className="px-4 py-3">TOTAL</td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(totalExpenses)}
                </td>
                <td className="px-4 py-3 text-center">100%</td>
                <td className="px-4 py-3 text-center">
                  {totalIncome > 0
                    ? ((totalExpenses / totalIncome) * 100).toFixed(1)
                    : 0}
                  %
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const TransactionsView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MonthNavigator />

      {/* Formulário de Adição */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 relative overflow-hidden">
        {/* AI Quick Add Section */}
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-indigo-600 flex items-center gap-1 mb-2">
            <Sparkles size={14} />
            PREENCHIMENTO INTELIGENTE (BETA)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={smartInput}
              onChange={(e) => setSmartInput(e.target.value)}
              placeholder="Ex: Almoço com Amanda hoje custou 45 reais"
              className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSmartFill()}
            />
            <button
              onClick={handleSmartFill}
              disabled={aiLoading || !smartInput}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {aiLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <BrainCircuit size={18} />
              )}
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Plus
            className="bg-indigo-600 text-white rounded-full p-1"
            size={24}
          />
          Nova Despesa Manual
        </h3>
        <form
          onSubmit={handleAddTransaction}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Descrição
            </label>
            <input
              type="text"
              placeholder="Ex: Luz, Mercado, iFood..."
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newTrans.description}
              onChange={(e) =>
                setNewTrans({ ...newTrans, description: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newTrans.amount}
              onChange={(e) =>
                setNewTrans({ ...newTrans, amount: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Categoria
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newTrans.categoryId}
              onChange={(e) =>
                setNewTrans({ ...newTrans, categoryId: e.target.value })
              }
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Data (Opcional)
            </label>
            <input
              type="date"
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-600"
              value={newTrans.date}
              onChange={(e) =>
                setNewTrans({ ...newTrans, date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Pago por
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newTrans.paidBy}
              onChange={(e) =>
                setNewTrans({ ...newTrans, paidBy: e.target.value })
              }
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Opções Extras: Recorrente ou Parcelado */}
          <div className="lg:col-span-2 flex items-center gap-6 pb-2">
            {!newTrans.isInstallment && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newTrans.isRecurring}
                  onChange={(e) =>
                    setNewTrans({ ...newTrans, isRecurring: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="recurring"
                  className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={14} /> Recorrente?
                </label>
              </div>
            )}

            {!newTrans.isRecurring && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="installment"
                  checked={newTrans.isInstallment}
                  onChange={(e) =>
                    setNewTrans({
                      ...newTrans,
                      isInstallment: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="installment"
                  className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <Layers size={14} /> Parcelado?
                </label>
              </div>
            )}

            {newTrans.isInstallment && (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                <span className="text-sm text-slate-500">x</span>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={newTrans.installments}
                  onChange={(e) =>
                    setNewTrans({
                      ...newTrans,
                      installments: parseInt(e.target.value) || 2,
                    })
                  }
                  className="w-16 border border-slate-300 rounded px-2 py-1 text-sm"
                />
                <span className="text-xs text-slate-400">parcelas</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 mt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {newTrans.isInstallment
                ? `Lançar ${newTrans.installments}x Parcelas`
                : "Adicionar Lançamento"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Transações */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-700">
            Histórico de {formatMonthYear(currentDate)}
          </h2>
          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
            {filteredTransactions.length} itens
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhum lançamento neste mês.
            </div>
          ) : (
            filteredTransactions.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              const person = people.find((p) => p.id === t.paidBy);
              return (
                <div
                  key={t.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                        person?.color || "bg-gray-400"
                      }`}
                    >
                      {person?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 flex items-center gap-2">
                        {t.description}
                        {t.isRecurring && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <RefreshCw size={10} /> Recorrente
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 flex gap-2">
                        <span>{cat?.name}</span>
                        <span>•</span>
                        <span>
                          {new Date(t.date).toLocaleDateString("pt-BR")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700">
                      {formatCurrency(t.amount)}
                    </span>
                    {!t.isRecurring ? (
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="text-slate-300 hover:text-red-500 p-2 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <div className="w-8"></div> // Spacer para alinhar
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Configuração de Pessoas */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users size={20} />
          Participantes & Salários
        </h2>
        <div className="space-y-4">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex flex-col md:flex-row gap-3 items-end md:items-center p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex-1 w-full">
                <label className="text-xs text-slate-500 font-medium">
                  Nome
                </label>
                <input
                  type="text"
                  value={person.name}
                  onChange={(e) =>
                    updatePerson(person.id, "name", e.target.value)
                  }
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="w-full md:w-48">
                <label className="text-xs text-slate-500 font-medium">
                  Renda Mensal
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-slate-400 text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    value={person.income}
                    onChange={(e) =>
                      updatePerson(
                        person.id,
                        "income",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 pl-8 text-sm"
                  />
                </div>
              </div>
              <div className="w-full md:w-auto text-xs text-slate-500 px-2 py-1 bg-white border border-slate-200 rounded">
                Share: {formatPercent(person.sharePercent * 100)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Responsável Padrão (Pré-selecionado)
          </label>
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

      {/* Configuração de Categorias */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PieChart size={20} />
          Categorias & Metas (%)
        </h2>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4">
              <input
                type="text"
                value={cat.name}
                onChange={(e) => updateCategory(cat.id, "name", e.target.value)}
                className={`flex-1 font-medium bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none py-1 ${cat.color}`}
              />
              <div className="flex items-center gap-2 w-32">
                <input
                  type="number"
                  value={cat.targetPercent}
                  onChange={(e) =>
                    updateCategory(
                      cat.id,
                      "targetPercent",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-16 border border-slate-300 rounded px-2 py-1 text-right text-sm"
                />
                <span className="text-slate-500 text-sm">%</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
            <span className="font-semibold text-slate-600">
              Total Planejado
            </span>
            <span
              className={`font-bold ${
                categories.reduce((a, c) => a + c.targetPercent, 0) === 100
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {categories.reduce((a, c) => a + c.targetPercent, 0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Wallet size={24} />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Finanças<span className="text-indigo-600">Pro</span>
              </h1>
            </div>
            {/* Desktop Nav */}
            <nav className="hidden md:flex bg-slate-100 p-1 rounded-lg">
              {[
                { id: "dashboard", label: "Resumo", icon: TrendingUp },
                { id: "transactions", label: "Lançamentos", icon: DollarSign },
                { id: "settings", label: "Configurações", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "transactions" && <TransactionsView />}
          {activeTab === "settings" && <SettingsView />}
        </main>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around z-20">
          {[
            { id: "dashboard", label: "Resumo", icon: TrendingUp },
            { id: "transactions", label: "Lançamentos", icon: Plus },
            { id: "settings", label: "Config", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 ${
                activeTab === tab.id ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              <tab.icon size={24} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
