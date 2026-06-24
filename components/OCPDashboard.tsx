import React from 'react';
import { OcpKeyFigures } from '../types';
import { BarChart3, Users, Factory, DollarSign, Newspaper, TrendingUp } from 'lucide-react';
import SourceLink from './SourceLink';

interface OCPDashboardProps {
  data: OcpKeyFigures;
}

const StatCard = ({ icon: Icon, label, value, subtext }: { icon: any, label: string, value: string, subtext?: string }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:border-l-2 hover:border-l-[#2D6A4F]">
        <div className="p-3 bg-green-50 rounded-lg text-green-700">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl leading-tight font-bold text-gray-900 mt-1">{value}</h3>
            {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

const OCPDashboard: React.FC<OCPDashboardProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#2D6A4F] rounded-lg shadow-sm">
                <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">Tableau de Bord Groupe OCP</h2>
                <p className="text-sm text-gray-500">Indicateurs clés de performance & Actualités Corporate</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-6">
            {data.turnover && <StatCard icon={DollarSign} label="Chiffre d'Affaires" value={data.turnover} subtext="Dernier exercice" />}
            {data.ebitda && <StatCard icon={TrendingUp} label="EBITDA" value={data.ebitda} subtext="Marge opérationnelle" />}
            {data.investment && <StatCard icon={Factory} label="Investissement" value={data.investment} subtext="CAPEX" />}
            {data.employees && <StatCard icon={Users} label="Collaborateurs" value={data.employees} subtext="Effectif total" />}
        </div>

        {data.confirmedNews && data.confirmedNews.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6">
              <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-4 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-green-700" />
                  Dernières Actualités Confirmées
              </h3>
              <div className="space-y-4">
                  {data.confirmedNews.map((news, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-50 last:border-0 last:pb-0 transition-colors duration-200 hover:bg-[#F0FDF4]">
                          <div className="px-2">
                              <span className="text-xs font-bold text-green-700 mb-1 block">{news.date} | {news.source}</span>
                              <h4 className="text-sm text-gray-900">{news.title}</h4>
                          </div>
                          <div className="shrink-0 pr-2">
                            <SourceLink title={news.title} source={news.source} hideIcon className="bg-white border border-gray-200 shadow-sm" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        )}
    </div>
  );
};

export default OCPDashboard;
