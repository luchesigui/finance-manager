"use client";

import { ArrowRightLeft, PieChart } from "lucide-react";

import { MonthNavigator } from "@/components/finance/MonthNavigator";
import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import {
  calculateCategorySummary,
  calculatePeopleShare,
  calculateSettlementData,
  calculateTotalExpenses,
  calculateTotalIncome,
} from "@/components/finance/hooks/useFinanceCalculations";
import { formatCurrency, formatMonthYear, formatPercent } from "@/lib/format";

export function DashboardView() {
  const { selectedMonthDate } = useCurrentMonth();
  const { people } = usePeople();
  const { categories } = useCategories();
  const { transactionsForSelectedMonth } = useTransactions();

  const totalIncome = calculateTotalIncome(people);
  const peopleWithShare = calculatePeopleShare(people, totalIncome);
  const totalExpenses = calculateTotalExpenses(transactionsForSelectedMonth);
  const settlementData = calculateSettlementData(
    peopleWithShare,
    transactionsForSelectedMonth,
    totalExpenses,
  );
  const categorySummary = calculateCategorySummary(
    categories,
    transactionsForSelectedMonth,
    totalIncome,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MonthNavigator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Renda Total Familiar</h3>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Total Gasto ({formatMonthYear(selectedMonthDate)})
          </h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Saldo Livre</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <ArrowRightLeft size={18} />
            Distribuição Justa ({formatMonthYear(selectedMonthDate)})
          </h2>
        </div>
        <div className="p-6">
          {transactionsForSelectedMonth.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum gasto registrado neste mês para calcular.
            </div>
          ) : (
            <div className="space-y-6">
              {settlementData.map((person) => (
                <div key={person.id} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="font-medium text-lg text-slate-800">{person.name}</span>
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
                          totalExpenses > 0 ? (person.fairShareAmount / totalExpenses) * 100 : 0
                        }%`,
                      }}
                      title="Parte Justa"
                    />
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
                          <strong>{formatCurrency(Math.abs(debtor.balance))}</strong> para{" "}
                          <strong>{creditor.name}</strong>.
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
                const isOverBudget = cat.realPercentOfIncome > cat.targetPercent;
                return (
                  <tr
                    key={cat.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className={`px-4 py-3 font-medium ${cat.color}`}>{cat.name}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(cat.totalSpent)}</td>
                    <td className="px-4 py-3 text-center">{cat.targetPercent}%</td>
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
                <td className="px-4 py-3 text-right">{formatCurrency(totalExpenses)}</td>
                <td className="px-4 py-3 text-center">100%</td>
                <td className="px-4 py-3 text-center">
                  {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0}%
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
