import React, { useState } from 'react';
import { Expense, Person } from '../types';
import { Trash2, Plus, Users, DollarSign, Check, X } from 'lucide-react';
import { calculateSettlements, getPersonBalance } from '../utils/finance';

interface ExpenseTabProps {
  expenses: Expense[];
  people: Person[];
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
}

const ExpenseTab: React.FC<ExpenseTabProps> = ({ expenses, people, addExpense, deleteExpense }) => {
  const [showForm, setShowForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [payerId, setPayerId] = useState<string>(people[0]?.id || '');
  const [sharedBy, setSharedBy] = useState<string[]>([]); // Empty = All

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount || !payerId) return;

    addExpense({
      id: Date.now().toString(),
      description: newDesc,
      amount: parseFloat(newAmount),
      payerId,
      sharedBy, // empty array means ALL
      date: Date.now()
    });

    setNewDesc('');
    setNewAmount('');
    setSharedBy([]);
    setShowForm(false);
  };

  const settlements = calculateSettlements(expenses, people);
  const allPersonIds = people.map(p => p.id);

  const toggleSharePerson = (id: string) => {
    setSharedBy(prev => {
      if (prev.includes(id)) return prev.filter(pid => pid !== id);
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Total Gastado</h3>
          <p className="text-3xl font-black text-slate-900">
            ${expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[#E9C46A] p-5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black text-slate-800 mb-1 uppercase tracking-widest opacity-80">Mayor Pagador</h3>
          <p className="text-xl font-black text-slate-900">
            {(() => {
              const payerCounts: Record<string, number> = {};
              expenses.forEach(e => payerCounts[e.payerId] = (payerCounts[e.payerId] || 0) + e.amount);
              const topPayerId = Object.keys(payerCounts).reduce((a, b) => payerCounts[a] > payerCounts[b] ? a : b, '');
              return people.find(p => p.id === topPayerId)?.name || 'Nadie aún';
            })()}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className={`w-full py-4 text-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 font-black text-lg border-2 border-black ${showForm ? 'bg-slate-800' : 'bg-[#E76F51]'
          }`}
      >
        {showForm ? <X size={24} strokeWidth={3} /> : <Plus size={24} strokeWidth={3} />}
        {showForm ? 'Cancelar' : 'Agregar Gasto'}
      </button>

      {/* Add Expense Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-4">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Descripción</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Ej: Supermercado, Nafta, Hielo"
                className="w-full p-3 border-2 border-black rounded-lg focus:ring-4 focus:ring-orange-100 outline-none font-bold text-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-900 font-bold">$</span>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 p-3 border-2 border-black rounded-lg focus:ring-4 focus:ring-orange-100 outline-none font-bold text-slate-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Pagó</label>
                <div className="relative">
                  <select
                    value={payerId}
                    onChange={(e) => setPayerId(e.target.value)}
                    className="w-full p-3 border-2 border-black rounded-lg bg-white appearance-none font-bold text-slate-800"
                  >
                    {people.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-4 pointer-events-none text-slate-900" size={16} strokeWidth={3} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-3 uppercase">Dividir entre (Vacío = Todos)</label>
              <div className="flex flex-wrap gap-2">
                {people.map(p => {
                  const isSelected = sharedBy.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleSharePerson(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${isSelected
                          ? 'bg-[#2A9D8F] text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-black'
                        }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold border-2 border-black hover:bg-slate-800 transition-colors">
              Guardar Gasto
            </button>
          </div>
        </form>
      )}

      {/* Expenses List */}
      <div>
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
          <DollarSign className="w-6 h-6 text-[#2A9D8F]" strokeWidth={3} />
          Historial
        </h3>
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium italic border-2 border-dashed border-slate-300 rounded-xl">No hay gastos anotados.</div>
          ) : (
            expenses.sort((a, b) => b.date - a.date).map(expense => {
              const payer = people.find(p => p.id === expense.payerId);
              return (
                <div key={expense.id} className="bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] flex justify-between items-center hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{expense.description}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                      <span className="text-[#E76F51]">{payer?.name}</span> pagó
                      {expense.sharedBy.length === 0
                        ? ' por todos'
                        : ` por ${expense.sharedBy.length} personas`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-slate-900 text-xl">${expense.amount}</span>
                    <button onClick={() => deleteExpense(expense.id)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Settlements Section */}
      <div className="mt-8 border-t-4 border-black pt-8">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
          <Users className="w-6 h-6 text-[#E9C46A]" strokeWidth={3} />
          Cuentas Claras
        </h3>

        {/* Balances Overview */}
        <div className="mb-6 flex overflow-x-auto gap-4 pb-4">
          {people.map(person => {
            const balance = getPersonBalance(person.id, expenses, allPersonIds);
            return (
              <div key={person.id} className={`flex-shrink-0 p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[140px] ${balance >= 0 ? 'bg-[#D8F3DC]' : 'bg-[#FFDDD2]'}`}>
                <p className="text-xs text-slate-900 font-black uppercase mb-1 tracking-wider">{person.name}</p>
                <p className={`text-2xl font-black ${balance >= 0 ? 'text-[#2D6A4F]' : 'text-[#E76F51]'}`}>
                  {balance >= 0 ? '+' : ''}{Math.round(balance).toLocaleString()}
                </p>
              </div>
            )
          })}
        </div>

        {/* Who Owes Who */}
        <div className="space-y-3">
          {settlements.length === 0 && expenses.length > 0 ? (
            <div className="bg-[#95D1CC] p-4 rounded-xl border-2 border-black text-center font-bold text-slate-900">
              ¡Todo saldado! Nadie debe nada.
            </div>
          ) : (
            settlements.map((s, idx) => {
              const from = people.find(p => p.id === s.from)?.name;
              const to = people.find(p => p.id === s.to)?.name;
              return (
                <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 text-sm md:text-base">
                    <span className="font-black text-slate-900 bg-red-100 px-2 py-0.5 rounded border border-red-200">{from}</span>
                    <span className="text-slate-500 font-bold italic text-xs">le debe a</span>
                    <span className="font-black text-slate-900 bg-green-100 px-2 py-0.5 rounded border border-green-200">{to}</span>
                  </div>
                  <span className="font-black text-[#264653] text-lg">${s.amount}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Helper for select arrow
function ChevronDown({ size, className, strokeWidth }: { size: number, className?: string, strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default ExpenseTab;