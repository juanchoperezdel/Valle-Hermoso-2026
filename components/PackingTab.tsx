import React, { useState } from 'react';
import { Item, Person } from '../types';
import { Trash2, Plus, Sparkles, Check, ChevronDown, ChevronUp, Minus, BarChart3, AlertCircle } from 'lucide-react';
import { parseNaturalLanguageItem } from '../services/geminiService';

interface PackingTabProps {
  items: Item[];
  people: Person[];
  deleteItem: (id: string) => void;
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
}

const PackingTab: React.FC<PackingTabProps> = ({ items, people, deleteItem, addItem, updateItem }) => {
  const [newItemName, setNewItemName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // State for error feedback
  const [flashError, setFlashError] = useState<{ itemId: string, msg: string } | null>(null);
  // State to toggle stats visibility
  const [showStats, setShowStats] = useState(false);

  // Stats
  const total = items.length;
  // Item is "Done" if checked, OR if assigned quantity meets total quantity
  const packedCount = items.filter(i => {
    if (i.isPacked) return true;
    const assignedCount = Object.values(i.assignedTo).reduce((a: number, b: number) => a + b, 0);
    return assignedCount >= i.totalQuantity && i.totalQuantity > 0;
  }).length;

  const progress = total === 0 ? 0 : Math.round((packedCount / total) * 100);

  // Calculate per-person statistics
  const personStats = people.map(p => {
    const itemCount = items.reduce((acc, item) => acc + (item.assignedTo[p.id] || 0), 0);
    return { ...p, itemCount };
  }).sort((a, b) => b.itemCount - a.itemCount);

  const maxItemsCarried = Math.max(...personStats.map(p => p.itemCount), 1);

  const handleSmartAdd = async () => {
    if (!newItemName.trim()) return;

    if (newItemName.split(' ').length > 2) {
      setIsProcessing(true);
      const parsed = await parseNaturalLanguageItem(newItemName, people);
      setIsProcessing(false);

      if (parsed) {
        const assignments: Record<string, number> = {};
        parsed.assignments.forEach(assign => {
          const person = people.find(p => p.name.toLowerCase().includes(assign.personName.toLowerCase()) || assign.personName.toLowerCase().includes(p.name.toLowerCase()));
          if (person) {
            assignments[person.id] = assign.quantity;
          }
        });

        addItem({
          id: Date.now().toString(),
          name: parsed.name,
          totalQuantity: parsed.totalQuantity || 1,
          assignedTo: assignments,
          isPacked: false
        });
        setNewItemName('');
        return;
      }
    }

    // Fallback normal add
    addItem({
      id: Date.now().toString(),
      name: newItemName,
      totalQuantity: 1,
      assignedTo: {},
      isPacked: false
    });
    setNewItemName('');
  };



  const toggleExpanded = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
    setFlashError(null); // Clear errors when switching
  }

  const handleAssignmentChange = (item: Item, personId: string, delta: number) => {
    const currentPersonQty = item.assignedTo[personId] || 0;

    // Validation Logic
    if (delta > 0) {
      const totalAssigned = Object.values(item.assignedTo).reduce((a: number, b: number) => a + b, 0);
      if (totalAssigned >= item.totalQuantity) {
        // Trigger Error
        setFlashError({ itemId: item.id, msg: `¡Límite alcanzado! Solo se necesitan ${item.totalQuantity}.` });

        // Clear error after 3 seconds
        setTimeout(() => setFlashError(null), 3000);
        return;
      }
    }

    setFlashError(null);
    const newQty = Math.max(0, currentPersonQty + delta);

    const newAssignedTo = { ...item.assignedTo };
    if (newQty === 0) {
      delete newAssignedTo[personId];
    } else {
      newAssignedTo[personId] = newQty;
    }

    updateItem({ ...item, assignedTo: newAssignedTo });
  }

  return (
    <div className="space-y-6 pb-20">

      {/* Progress Bar Card */}
      <div className="bg-white p-5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tu Progreso</h2>
            <p className="text-sm font-medium text-slate-500">{packedCount} de {total} ítems listos</p>
          </div>
          <span className="text-3xl font-black text-[#FF9F68]">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 border-2 border-black overflow-hidden relative mb-4">
          <div className="bg-[#FF9F68] h-full transition-all duration-500 border-r-2 border-black" style={{ width: `${progress}%` }}>
            {/* Stripe pattern */}
            <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 6px)' }}></div>
          </div>
        </div>

        {/* Stats Toggle */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full py-2 bg-[#E9C46A] text-slate-900 font-bold text-sm border-2 border-black rounded-lg hover:bg-[#F4A261] transition-colors flex items-center justify-center gap-2"
        >
          <BarChart3 size={16} strokeWidth={3} />
          {showStats ? 'Ocultar Cargas' : 'Ver Reparto de Carga'}
        </button>

        {/* Distribution Stats */}
        {showStats && (
          <div className="mt-4 pt-4 border-t-2 border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ítems por persona (Click para ver detalles)</h3>
            <div className="space-y-2">
              {personStats.map(p => {
                // Calculate % of the max carrier for bar width
                const barWidth = (p.itemCount / maxItemsCarried) * 100;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPerson(p)}
                    className="w-full flex items-center gap-3 hover:bg-slate-50 p-1 rounded transition-colors group text-left"
                  >
                    <span className="text-xs font-bold w-16 truncate text-slate-700 group-hover:text-black transition-colors">{p.name}</span>
                    <div className="flex-1 h-6 bg-slate-100 rounded border-2 border-black overflow-hidden relative">
                      <div
                        className="h-full bg-[#2A9D8F] transition-all duration-500 group-hover:brightness-110"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-end px-2 text-[10px] font-black text-slate-700">
                        {p.itemCount}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Person Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedPerson(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#FF9F68] p-4 border-b-2 border-black flex justify-between items-center">
              <h3 className="font-black text-xl uppercase tracking-tight text-slate-900 line-clamp-1">
                La mochila de {selectedPerson.name}
              </h3>
              <button
                onClick={() => setSelectedPerson(null)}
                className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {items.filter(i => (i.assignedTo[selectedPerson.id] || 0) > 0).length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-bold">
                  Nada asignado todavía 🏝️
                </div>
              ) : (
                <ul className="space-y-2">
                  {items
                    .filter(i => (i.assignedTo[selectedPerson.id] || 0) > 0)
                    .map(item => (
                      <li key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <span className={`font-medium ${item.isPacked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                        <span className="bg-[#2A9D8F] text-white text-xs font-black px-2 py-1 rounded border-2 border-black">
                          x{item.assignedTo[selectedPerson.id]}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="bg-slate-50 p-3 border-t-2 border-black text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total: {items.reduce((acc, item) => acc + (item.assignedTo[selectedPerson.id] || 0), 0)} ítems
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Ej: 'Carbón' o 'Santi lleva 2 vinos'"
          className="flex-1 p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-0 focus:outline-none focus:translate-y-1 focus:shadow-none transition-all font-medium text-lg placeholder:text-slate-400"
          onKeyDown={(e) => e.key === 'Enter' && handleSmartAdd()}
        />
        <button
          onClick={handleSmartAdd}
          disabled={isProcessing}
          className="bg-[#264653] text-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-80 hover:bg-slate-800"
        >
          {isProcessing ? <Sparkles className="animate-spin w-6 h-6" /> : <Plus className="w-6 h-6" strokeWidth={3} />}
        </button>
      </div>



      {/* List */}
      <div className="space-y-4">
        {[...items].sort((a, b) => Number(a.isPacked) - Number(b.isPacked)).map(item => {
          const assignedCount = Object.values(item.assignedTo).reduce((a: number, b: number) => a + b, 0);
          const isFullyAssigned = assignedCount >= item.totalQuantity;
          const isExpanded = expandedItemId === item.id;
          const hasError = flashError?.itemId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all duration-200 ${item.isPacked ? 'opacity-60 grayscale' : ''
                }`}
            >
              {/* Main Row */}
              <div
                className="p-4 flex items-center gap-4 cursor-pointer select-none"
                onClick={() => toggleExpanded(item.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateItem({ ...item, isPacked: !item.isPacked });
                  }}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] ${item.isPacked ? 'bg-[#2A9D8F] text-white' : 'bg-white hover:bg-slate-100'
                    }`}
                >
                  {item.isPacked && <Check size={20} strokeWidth={4} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold truncate ${item.isPacked ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-black px-2 py-1 rounded border-2 border-black transition-colors ${isFullyAssigned
                        ? 'bg-[#2A9D8F] text-white'
                        : 'bg-[#E9C46A] text-slate-900'
                        }`}>
                        {assignedCount}/{item.totalQuantity}
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-900" strokeWidth={3} /> : <ChevronDown size={20} className="text-slate-900" strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details & Assignment Controls (Expanded) */}
              {isExpanded && (
                <div className="bg-[#FFF8F0] border-t-2 border-black p-4 space-y-5 animate-in slide-in-from-top-2 relative">

                  {/* Error Banner */}
                  {hasError && (
                    <div className="bg-red-100 text-red-600 border-2 border-red-500 p-2 rounded-lg text-sm font-bold flex items-center gap-2 animate-bounce">
                      <AlertCircle size={16} />
                      {flashError.msg}
                    </div>
                  )}

                  {/* Total Needed Config */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Se necesitan</label>
                    <div className="flex items-center gap-3 bg-white border-2 border-black rounded-lg p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <button
                        onClick={() => updateItem({ ...item, totalQuantity: Math.max(1, item.totalQuantity - 1) })}
                        className="w-8 h-8 flex items-center justify-center text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      <span className="font-black text-xl text-slate-900 w-6 text-center">{item.totalQuantity}</span>
                      <button
                        onClick={() => updateItem({ ...item, totalQuantity: item.totalQuantity + 1 })}
                        className="w-8 h-8 flex items-center justify-center text-[#E76F51] hover:bg-orange-50 rounded"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  {/* People Assignments */}
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase mb-3 block tracking-widest">¿Quién lo lleva?</label>
                    <div className="space-y-2">
                      {people.map(person => {
                        const qty = item.assignedTo[person.id] || 0;
                        if (qty === 0) return null; // Only show active assignments in this list

                        return (
                          <div key={person.id} className="flex justify-between items-center bg-white p-2 rounded-lg border-2 border-black shadow-sm">
                            <span className="text-sm font-bold text-slate-900 pl-2">{person.name}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAssignmentChange(item, person.id, -1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-900 border-2 border-black bg-slate-100 hover:bg-red-100 rounded"
                              >
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span className="text-base font-black text-slate-900 w-5 text-center">{qty}</span>
                              <button
                                onClick={() => handleAssignmentChange(item, person.id, 1)}
                                className={`w-7 h-7 flex items-center justify-center text-white border-2 border-black rounded transition-all ${assignedCount >= item.totalQuantity
                                  ? 'bg-slate-300 cursor-not-allowed opacity-50'
                                  : 'bg-[#2A9D8F] hover:opacity-90'
                                  }`}
                              >
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Unassigned People Pills */}
                      <div className="pt-3 flex flex-wrap gap-2">
                        {people.filter(p => !item.assignedTo[p.id]).map(person => {
                          const isMaxedOut = assignedCount >= item.totalQuantity;
                          return (
                            <button
                              key={person.id}
                              onClick={() => handleAssignmentChange(item, person.id, 1)}
                              disabled={isMaxedOut}
                              className={`px-3 py-1.5 border-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${isMaxedOut
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-slate-900 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                }`}
                            >
                              <Plus size={12} strokeWidth={3} /> {person.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-2 border-2 border-transparent hover:border-red-200 rounded-lg transition-all"
                    >
                      <Trash2 size={14} /> Eliminar ítem
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PackingTab;