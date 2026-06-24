import React, { useState } from 'react';
import { Alert, ArticleReference } from '../types';
import { ShieldAlert, ChevronDown, Paperclip } from 'lucide-react';
import SourceLink from './SourceLink';

interface AlertsTableProps {
  alerts: Alert[];
}

const AlertRow: React.FC<{ alert: Alert }> = ({ alert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasReferences = alert.references && alert.references.length > 0;

  return (
    <>
      <tr 
        className={`bg-[#FFFBEB] border-b hover:bg-yellow-100/50 transition-colors ${hasReferences ? 'cursor-pointer' : ''}`}
        onClick={() => hasReferences && setIsOpen(!isOpen)}
      >
        <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
          {alert.sector === 'OCP' && <span className="w-2 h-2 rounded-full bg-[#2D6A4F]"></span>}
          {alert.sector === 'Maroc' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
          {alert.sector === 'Afrique' && <span className="w-2 h-2 rounded-full bg-yellow-500"></span>}
          {alert.sector}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">{alert.event}</td>
        <td className="px-6 py-4 text-[#92400E] italic">"{alert.impact}"</td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              alert.severity === 'high' ? 'bg-red-100 text-red-800' :
              alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {alert.severity.toUpperCase()}
            </span>
            {hasReferences && (
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </div>
        </td>
      </tr>
      {hasReferences && isOpen && (
        <tr className="bg-orange-50/50">
          <td colSpan={4} className="p-0">
            <div className="px-8 py-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Paperclip className="w-3 h-3 text-blue-600" />
                SOURCES DIRECTES
              </h4>
              <ul className="space-y-1.5 pl-1 flex flex-col items-start">
                {alert.references?.map((ref, i) => (
                  <li key={i}>
                    <SourceLink title={ref.title} source={ref.source} className="bg-white border border-blue-100" />
                  </li>
                ))}
              </ul>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const AlertsTable: React.FC<AlertsTableProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-yellow-50 rounded-xl shadow-md border-l-4 border-l-[#F59E0B] border-t border-r border-b border-gray-100 overflow-hidden mb-8 animate-fade-in p-[14px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#92400E]">
          <ShieldAlert className="w-5 h-5 animate-pulse text-orange-500" />
          <h2 className="text-base font-bold italic">Point(s) À Vérifier - Alertes</h2>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-orange-100">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-900 uppercase bg-orange-50">
            <tr>
              <th scope="col" className="px-6 py-3 font-bold">Secteur</th>
              <th scope="col" className="px-6 py-3 font-bold">Événement</th>
              <th scope="col" className="px-6 py-3 font-bold">Impact</th>
              <th scope="col" className="px-6 py-3 font-bold text-center">Niveau</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <AlertRow key={index} alert={alert} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTable;