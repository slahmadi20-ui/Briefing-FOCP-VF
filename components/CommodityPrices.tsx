import React from 'react';
import { CommodityPrice } from '../types';
import { TrendingUp, TrendingDown, Minus, DollarSign, History, ExternalLink } from 'lucide-react';

interface CommodityPricesProps {
  prices: CommodityPrice[];
  marketAnalysis?: string;
}

const CommodityPrices: React.FC<CommodityPricesProps> = ({ prices, marketAnalysis }) => {
  if (!prices || prices.length === 0) return null;

  return (
    <div className="mb-8 animate-fade-in bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-700" />
          Cours des Matières Premières, Fertilisants & Gaz de Référence
        </h2>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-sm">
          Fiche de Veille Référence FOCP
        </span>
      </div>
      
      <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
        <table className="w-full text-left bg-white">
            <thead className="bg-[#F9FAFB] border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Matière Première / Fertilisant</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Prix Actuel</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Var. (J/M)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Prix (N-1)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Évolution (1 an)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Analyse & Tendance</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {prices.map((item, index) => {
                    const isUp = item.trend === 'up';
                    const isDown = item.trend === 'down';
                    const isStable = item.trend === 'stable';
                    
                    return (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-sm text-gray-900">{item.name}</div>
                                {item.referenceName && (
                                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
                                        <span>Réf :</span>
                                        {item.referenceUrl ? (
                                            <a 
                                                href={item.referenceUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 font-bold"
                                            >
                                                <span>{item.referenceName}</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        ) : (
                                            <span className="font-semibold text-gray-500">{item.referenceName}</span>
                                        )}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="font-mono font-medium text-sm text-gray-900">{item.price}</span>
                                <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                            </td>
                            <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${item.change.includes('+') ? 'text-[#10B981]' : item.change.includes('-') ? 'text-red-500' : 'text-gray-500'}`}>
                                {item.change}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-sm text-gray-500">
                                {item.lastYearPrice}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className={`inline-flex items-center px-2 py-1 rounded font-mono text-xs font-bold ${
                                    item.evolution.includes('+') ? 'bg-green-50 text-[#10B981]' : 
                                    item.evolution.includes('-') ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {item.evolution}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {isUp && <TrendingUp className="w-4 h-4 text-[#10B981] flex-shrink-0" />}
                                    {isDown && <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                    {isStable && <Minus className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                                    <span className="text-xs text-gray-700 leading-tight" title={item.analysis}>{item.analysis}</span>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
      
      {marketAnalysis && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-green-700" />
                Analyse Stratégique du Marché
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{marketAnalysis}</p>
        </div>
      )}
    </div>
  );
};

export default CommodityPrices;
