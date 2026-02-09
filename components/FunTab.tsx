import React from 'react';
import { Item, Person, Expense } from '../types';
import { Trophy, Crown, Ghost, Sparkles, TrendingDown, PackageOpen, Award } from 'lucide-react';

interface FunTabProps {
    items: Item[];
    people: Person[];
    expenses: Expense[];
}

const FunTab: React.FC<FunTabProps> = ({ items, people, expenses }) => {

    // 1. Calculate Stats
    const stats = people.map(p => {
        const assignedItems = items.filter(item => item.assignedTo[p.id]);
        const itemCount = assignedItems.reduce((acc, item) => acc + (item.assignedTo[p.id] || 0), 0);

        const packedCount = assignedItems.reduce((acc, item) => {
            return acc + (item.assignedTo[p.id] || 0) * (item.isPacked ? 1 : 0);
        }, 0);

        const packedPercentage = itemCount > 0 ? (packedCount / itemCount) * 100 : 0;

        const paidAmount = expenses
            .filter(e => e.payerId === p.id)
            .reduce((acc, e) => acc + e.amount, 0);

        // Score for "El Fantasma" (formerly Parasito): Lower is "better" (more ghostly)
        // Normalize: items * 5000 + paidAmount. 
        const ghostScore = (itemCount * 5000) + paidAmount;

        return { ...p, itemCount, packedCount, packedPercentage, paidAmount, ghostScore };
    });

    // --- PODIUM HELPERS ---
    const getPodium = (metric: 'itemCount' | 'paidAmount') => {
        return [...stats]
            .sort((a, b) => b[metric] - a[metric])
            .slice(0, 3);
    };

    const podiumMula = getPodium('itemCount');
    const podiumSugar = getPodium('paidAmount');

    // --- SPECIAL AWARDS ---

    // El Fantasma: Lowest contribution
    const fantasma = [...stats]
        .sort((a, b) => a.ghostScore - b.ghostScore)
    [0];


    const EmptyState = () => (
        <div className="text-center py-8 text-slate-400 font-bold italic">
            Faltan datos para calcular esto...
        </div>
    );

    return (
        <div className="space-y-12 pb-24 animate-in fade-in duration-500">

            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center justify-center gap-2">
                    <Sparkles className="text-yellow-500 animate-pulse" />
                    Sala de Trofeos
                    <Sparkles className="text-yellow-500 animate-pulse" />
                </h2>
                <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto">
                    Donde se premia el esfuerzo y se castiga la vagancia.
                </p>
            </div>

            {/* --- LA MULA (PODIUM) --- */}
            <section>
                <div className="flex items-center gap-2 mb-4 justify-center">
                    <span className="text-2xl">🫏</span>
                    <h3 className="text-xl font-black text-slate-900 uppercase">La Mula de Carga</h3>
                </div>
                <div className="grid grid-cols-3 items-end gap-2 h-48 bg-slate-50 rounded-xl border-2 border-slate-200 p-4 relative">
                    {/* 2nd Place */}
                    {podiumMula[1] && (
                        <div className="flex flex-col items-center justify-end h-[70%] w-full">
                            <span className="font-bold text-xs text-center leading-tight mb-1">{podiumMula[1].name}</span>
                            <div className="w-full bg-slate-300 h-full rounded-t-lg border-2 border-slate-400 flex items-center justify-center relative">
                                <span className="font-black text-sm text-slate-600">{podiumMula[1].itemCount}</span>
                                <div className="absolute -top-3 bg-white border border-slate-300 px-1 rounded text-[10px] font-bold text-slate-400">#2</div>
                            </div>
                        </div>
                    )}
                    {/* 1st Place */}
                    {podiumMula[0] && (
                        <div className="flex flex-col items-center justify-end h-[100%] w-full z-10">
                            <Crown size={24} className="text-yellow-500 mb-1 animate-bounce" fill="currentColor" />
                            <span className="font-black text-sm text-center leading-tight mb-1">{podiumMula[0].name}</span>
                            <div className="w-full bg-yellow-400 h-full rounded-t-lg border-2 border-black flex items-center justify-center shadow-lg relative">
                                <span className="font-black text-xl text-black">{podiumMula[0].itemCount}</span>
                                <span className="absolute bottom-1 text-[8px] font-bold uppercase tracking-wider">Ítems</span>
                            </div>
                        </div>
                    )}
                    {/* 3rd Place */}
                    {podiumMula[2] && (
                        <div className="flex flex-col items-center justify-end h-[50%] w-full">
                            <span className="font-bold text-xs text-center leading-tight mb-1">{podiumMula[2].name}</span>
                            <div className="w-full bg-orange-200 h-full rounded-t-lg border-2 border-orange-300 flex items-center justify-center relative">
                                <span className="font-black text-sm text-orange-800">{podiumMula[2].itemCount}</span>
                                <div className="absolute -top-3 bg-white border border-orange-200 px-1 rounded text-[10px] font-bold text-slate-400">#3</div>
                            </div>
                        </div>
                    )}

                    {podiumMula.length === 0 && <div className="absolute inset-0 flex items-center justify-center"><EmptyState /></div>}
                </div>
            </section>


            {/* --- EL SUGAR DADDY (PODIUM) --- */}
            <section>
                <div className="flex items-center gap-2 mb-4 justify-center">
                    <span className="text-2xl">💸</span>
                    <h3 className="text-xl font-black text-slate-900 uppercase">El Sugar Daddy</h3>
                </div>
                <div className="grid grid-cols-3 items-end gap-2 h-48 bg-slate-50 rounded-xl border-2 border-slate-200 p-4 relative">
                    {/* 2nd Place */}
                    {podiumSugar[1] && (
                        <div className="flex flex-col items-center justify-end h-[70%] w-full">
                            <div className="mb-1 text-center">
                                <span className="font-bold text-xs block">{podiumSugar[1].name}</span>
                            </div>
                            <div className="w-full bg-slate-300 h-full rounded-t-lg border-2 border-slate-400 flex items-center justify-center relative">
                                <span className="font-black text-xs text-slate-600">${(podiumSugar[1].paidAmount / 1000).toFixed(0)}k</span>
                                <div className="absolute -top-3 bg-white border border-slate-300 px-1 rounded text-[10px] font-bold text-slate-400">#2</div>
                            </div>
                        </div>
                    )}
                    {/* 1st Place */}
                    {podiumSugar[0] && (
                        <div className="flex flex-col items-center justify-end h-[100%] w-full z-10">
                            <div className="bg-black text-white p-1 rounded-full mb-1 border-2 border-yellow-400">
                                <Award size={16} />
                            </div>
                            <span className="font-black text-sm text-center leading-tight mb-1">{podiumSugar[0].name}</span>
                            <div className="w-full bg-[#2A9D8F] h-full rounded-t-lg border-2 border-black flex items-center justify-center shadow-lg relative">
                                <span className="font-black text-lg text-white">${(podiumSugar[0].paidAmount / 1000).toFixed(0)}k</span>
                            </div>
                        </div>
                    )}
                    {/* 3rd Place */}
                    {podiumSugar[2] && (
                        <div className="flex flex-col items-center justify-end h-[50%] w-full">
                            <span className="font-bold text-xs text-center leading-tight mb-1">{podiumSugar[2].name}</span>
                            <div className="w-full bg-orange-200 h-full rounded-t-lg border-2 border-orange-300 flex items-center justify-center relative">
                                <span className="font-black text-xs text-orange-800">${(podiumSugar[2].paidAmount / 1000).toFixed(0)}k</span>
                                <div className="absolute -top-3 bg-white border border-orange-200 px-1 rounded text-[10px] font-bold text-slate-400">#3</div>
                            </div>
                        </div>
                    )}
                    {podiumSugar.length === 0 && <div className="absolute inset-0 flex items-center justify-center"><EmptyState /></div>}
                </div>
            </section>

            {/* --- VISCERAL AWARDS ROW --- */}
            <div className="grid grid-cols-1 gap-6">

                {/* EL FANTASMA */}
                {fantasma && (
                    <div className="bg-[#1a1a1a] p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#64748b] text-white relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <div className="bg-slate-700 p-2 rounded-lg border border-slate-600">
                                <Ghost size={24} className="text-slate-300" />
                            </div>
                            <span className="text-4xl filter grayscale">👻</span>
                        </div>
                        <h3 className="font-black text-lg text-white uppercase relative z-10">El Fantasma</h3>
                        <p className="text-xs font-bold text-slate-400 leading-snug mb-3 relative z-10">
                            Menos aporte que cenicero de moto.
                        </p>

                        <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-700 relative z-10">
                            <span className="font-black text-lg">{fantasma.name}</span>
                            <div className="ml-auto text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Aportó</p>
                                <p className="text-[10px] font-mono text-slate-300">
                                    {fantasma.itemCount} ítems | ${fantasma.paidAmount}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <div className="mt-8 text-center opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    * Los datos no mienten, la gente sí *
                </p>
            </div>

        </div>
    );
};

export default FunTab;
