"use client";

import { PieChart, Users } from "lucide-react";

import { useFinance } from "@/components/finance/FinanceProvider";
import { formatPercent } from "@/lib/format";

export function SettingsView() {
  const {
    people,
    peopleShare,
    categories,
    defaultPayerId,
    setDefaultPayerId,
    updatePerson,
    updateCategory,
  } = useFinance();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users size={20} />
          Participantes & Salários
        </h2>

        <div className="space-y-4">
          {peopleShare.map((person) => (
            <div
              key={person.id}
              className="flex flex-col md:flex-row gap-3 items-end md:items-center p-3 bg-slate-50 rounded-lg"
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
                  value={person.name}
                  onChange={(e) => updatePerson(person.id, "name", e.target.value)}
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
                  <span className="absolute left-2 top-1.5 text-slate-400 text-sm">R$</span>
                  <input
                    id={`person-income-${person.id}`}
                    type="number"
                    value={person.income}
                    onChange={(e) =>
                      updatePerson(person.id, "income", Number.parseFloat(e.target.value) || 0)
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
                    updateCategory(cat.id, "targetPercent", Number.parseFloat(e.target.value))
                  }
                  className="w-16 border border-slate-300 rounded px-2 py-1 text-right text-sm"
                />
                <span className="text-slate-500 text-sm">%</span>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
            <span className="font-semibold text-slate-600">Total Planejado</span>
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
}
