
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { StrategicMove } from '../types';
import { Briefcase, MapPin, Building, Calendar, FileText, Building2, Globe, RefreshCw, Search } from 'lucide-react';
import GenerativeImage from './GenerativeImage';
import SourceLink from './SourceLink';

interface StrategicMovesProps {
  moves: StrategicMove[];
  onRefreshOCP?: () => Promise<void>;
  onRefreshInternational?: () => Promise<void>;
}

const OCP_ENTITY_MAP: Record<string, string> = {
    'ocp africa': 'OCP Africa',
    'ocp nutricrops': 'OCP Nutricrops',
    'ocp solutions': 'OCP Solutions',
    'ocp maintenance solutions': 'OCP Maintenance Solutions (OCP MS)',
    'phosboucraa': 'Phosboucraa',
    'um6p': 'Université Mohammed VI Polytechnique (UM6P)',
    'fondation ocp': 'Fondation OCP',
    'innovx': 'InnovX',
    'um6p ventures': 'UM6P Ventures',
    'africa business school': 'Africa Business School (ABS)',
    '1337': '1337',
    'youcode': 'YouCode',
    'agriedge': 'AgriEdge',
    'jesa': 'JESA',
    'imacid': 'IMACID',
    'emaphos': 'EMAPHOS',
    'ocp': 'Groupe OCP',
};

const OCP_ECOSYSTEM_KEYWORDS = Object.keys(OCP_ENTITY_MAP);

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const MoveItem: React.FC<{ move: StrategicMove }> = ({ move }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6 transition-all hover:shadow-md hover:border-l-2 hover:border-l-[#2D6A4F] mt-6">
        <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 relative group">
                <div className="w-[48px] h-[48px] rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center relative ring-1 ring-gray-100">
                    {move.imageUrl ? (
                        <GenerativeImage
                            src={move.imageUrl}
                            alt={`Portrait de ${move.personName}`}
                            prompt={`Professional Linkedin style headshot of ${move.personName}, ${move.newRole} at ${move.company}. White background, business attire.`}
                            className="w-full h-full object-cover"
                            enableAutoGeneration={false}
                        />
                    ) : (
                        <span className="text-sm font-bold text-gray-400">{getInitials(move.personName)}</span>
                    )}
                </div>
            </div>
            <div className='flex-grow pt-0.5'>
                <p className="font-bold text-base text-gray-900">{move.personName}</p>
                <p className="text-sm font-semibold text-green-700 mt-0.5">{move.newRole}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
                    <div className="flex items-center gap-1"><Building className="w-[14px] h-[14px]"/>{move.company}</div>
                    <div className="flex items-center gap-1"><MapPin className="w-[14px] h-[14px]"/>{move.country}</div>
                </div>
            </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
             <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    {move.appointmentDate}
                </span>
            </div>

            <div className="prose prose-sm max-w-none text-sm text-gray-700 leading-relaxed">
                <ReactMarkdown
                    components={{
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    }}
                >
                    {move.background}
                </ReactMarkdown>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50 flex-wrap">
                <SourceLink title={move.reference.title} source={move.reference.source} className="border border-blue-100 shadow-sm !px-[8px] !py-[4px] !text-xs" />
                
                {move.linkedinUrl && (
                    <a 
                        href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(move.personName + " " + move.company)}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="Rechercher sur LinkedIn"
                        className="inline-flex items-center gap-1.5 text-xs text-[#0A66C2] border border-[#0A66C2]/20 hover:bg-[#0A66C2]/5 px-[8px] py-[4px] rounded-md transition-colors font-medium shadow-sm"
                    >
                        <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                    </a>
                )}
            </div>
        </div>
    </div>
  );
};


const StrategicMoves: React.FC<StrategicMovesProps> = ({ moves, onRefreshOCP, onRefreshInternational }) => {
  const [refreshingOCP, setRefreshingOCP] = useState(false);
  const [refreshingIntl, setRefreshingIntl] = useState(false);

  const handleRefreshOCP = async () => {
    if (onRefreshOCP) {
      setRefreshingOCP(true);
      try {
        await onRefreshOCP();
      } finally {
        setRefreshingOCP(false);
      }
    }
  };

  const handleRefreshIntl = async () => {
    if (onRefreshInternational) {
        setRefreshingIntl(true);
        try {
            await onRefreshInternational();
        } finally {
            setRefreshingIntl(false);
        }
    }
  };

  if (!moves || moves.length === 0) return null;

  const initialAcc: { ocpMoves: StrategicMove[]; externalMoves: StrategicMove[] } = {
    ocpMoves: [],
    externalMoves: []
  };

  const { ocpMoves, externalMoves } = moves.reduce(
    (acc, move) => {
      const isOcp = OCP_ECOSYSTEM_KEYWORDS.some(keyword =>
        move.company.toLowerCase().includes(keyword)
      );
      if (isOcp) {
        acc.ocpMoves.push(move);
      } else {
        acc.externalMoves.push(move);
      }
      return acc;
    },
    initialAcc
  );

  const initialGrouped: Record<string, StrategicMove[]> = {};

  const groupedOcpMoves = ocpMoves.reduce((acc, move) => {
    let assignedEntity = OCP_ENTITY_MAP['ocp'];
    let longestMatch = '';

    for (const keyword of OCP_ECOSYSTEM_KEYWORDS) {
        if (move.company.toLowerCase().includes(keyword) && keyword.length > longestMatch.length) {
            longestMatch = keyword;
        }
    }
    
    if (longestMatch && OCP_ENTITY_MAP[longestMatch]) {
        assignedEntity = OCP_ENTITY_MAP[longestMatch];
    }
    
    if (!acc[assignedEntity]) {
        acc[assignedEntity] = [];
    }
    acc[assignedEntity].push(move);

    return acc;
  }, initialGrouped);

  return (
    <div className="mb-8 animate-fade-in bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-700" />
            Mouvements Stratégiques (Profils & Nominations)
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* OCP Column */}
          <div className={`transition-opacity duration-300 ${refreshingOCP ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-green-700"/>
                    Écosystème OCP
                </h3>
                {onRefreshOCP && (
                    <button 
                        onClick={handleRefreshOCP} 
                        disabled={refreshingOCP}
                        className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                        title="Actualiser nominations OCP"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshingOCP ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>
            
            {Object.keys(groupedOcpMoves).length > 0 ? (
                Object.entries(groupedOcpMoves).map(([entityName, entityMoves]) => (
                    <div key={entityName} className="mt-4">
                        <div className="flex items-center gap-3">
                           <div className="h-px bg-[#2D6A4F] flex-grow opacity-20"></div>
                           <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide">{entityName}</h4>
                           <div className="h-px bg-[#2D6A4F] flex-grow opacity-20"></div>
                        </div>
                        {(entityMoves as StrategicMove[]).map((move, index) => <MoveItem key={`ocp-${entityName}-${index}`} move={move} />)}
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 italic mt-4">Aucune nomination interne significative détectée.</p>
            )}
          </div>

          {/* International Column */}
          <div className={`transition-opacity duration-300 ${refreshingIntl ? 'opacity-50' : 'opacity-100'} md:border-l md:border-gray-100 md:pl-[40px]`}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600"/>
                    International & Revue Concurrence
                </h3>
                {onRefreshInternational && (
                    <button 
                        onClick={handleRefreshIntl} 
                        disabled={refreshingIntl}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                        title="Actualiser nominations Internationales"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshingIntl ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

             {externalMoves.length > 0 ? (
                externalMoves.map((move, index) => <MoveItem key={`ext-${index}`} move={move} />)
            ) : (
                <p className="text-sm text-gray-500 italic mt-4">Aucune nomination externe significative détectée.</p>
            )}
          </div>
      </div>
    </div>
  );
};

export default StrategicMoves;
