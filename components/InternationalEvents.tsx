import React, { useState } from 'react';
import { InternationalEvent, AnnualEvent } from '../types';
import { CalendarDays, MapPin, CalendarRange, Sprout, Globe, Factory, Leaf, Landmark, Flag, Users, ExternalLink, RefreshCw, Search } from 'lucide-react';

interface InternationalEventsProps {
  events: InternationalEvent[];
  annualEvents?: AnnualEvent[];
  onRefreshInternational?: () => Promise<void>;
  onRefreshAnnual?: () => Promise<void>;
}

const ThemeIcon: React.FC<{ theme: string }> = ({ theme }) => {
    const t = theme.toLowerCase();
    
    if (t.includes('sol') || t.includes('terre') || t.includes('agri')) return <Sprout className="w-4 h-4 text-[#16A34A]" />;
    if (t.includes('muraille') || t.includes('verte') || t.includes('forêt') || t.includes('biodiv')) return <Leaf className="w-4 h-4 text-[#059669]" />;
    if (t.includes('carbone') || t.includes('industrie') || t.includes('finance')) return <Factory className="w-4 h-4 text-[#4B5563]" />;
    
    if (t.includes('cop') || t.includes('climat')) return <Globe className="w-4 h-4 text-[#2563EB]" />;
    if (t.includes('onu') || t.includes('un ') || t.includes('nations unies')) return <Landmark className="w-4 h-4 text-[#1E40AF]" />;
    if (t.includes('union africaine') || t.includes('ua ') || t.includes('au ')) return <Flag className="w-4 h-4 text-[#D97706]" />;
    if (t.includes('forum') || t.includes('sommet')) return <Users className="w-4 h-4 text-[#9333EA]" />;

    return <Globe className="w-4 h-4 text-[#64748B]" />;
};

const InternationalEvents: React.FC<InternationalEventsProps> = ({ events, annualEvents, onRefreshInternational, onRefreshAnnual }) => {
  const [refreshingIntl, setRefreshingIntl] = useState(false);
  const [refreshingAnnual, setRefreshingAnnual] = useState(false);

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

  const handleRefreshAnnual = async () => {
    if (onRefreshAnnual) {
        setRefreshingAnnual(true);
        try {
            await onRefreshAnnual();
        } finally {
            setRefreshingAnnual(false);
        }
    }
  };

  if ((!events || events.length === 0) && (!annualEvents || annualEvents.length === 0)) return null;

  return (
    <div className="mb-8 animate-fade-in bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-green-700" />
            Agenda International & Stratégique
        </h2>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Colonne 1 : Actualités Hebdo */}
            <div className={`space-y-4 transition-opacity duration-300 ${refreshingIntl ? 'opacity-50' : 'opacity-100'}`}>
                 <div className="flex items-center justify-between pb-2 border-b-2 border-blue-500">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-blue-600"/>
                        Cette Semaine
                    </h3>
                    {onRefreshInternational && (
                        <button 
                            onClick={handleRefreshIntl} 
                            disabled={refreshingIntl}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                            title="Actualiser les événements de la semaine"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshingIntl ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>

                {events && events.map((event, index) => (
                    <div key={index} className="bg-slate-50 p-[16px] rounded-lg border border-gray-100 flex items-start gap-4 h-auto group transition-colors hover:bg-[#EEF2F6]">
                        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                            <CalendarDays className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className='flex-grow'>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 shrink-0">
                                    {event.date}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3"/>
                                    <span>{event.location}</span>
                                </div>
                            </div>
                            <h4 className="font-bold text-base text-gray-900 mb-1 leading-snug">{event.name}</h4>
                            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{event.description}</p>
                            <div className="mt-2">
                                <a 
                                    href={`https://www.google.com/search?q=${encodeURIComponent(event.name + " " + event.date + " site officiel")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                    title="Rechercher Site Officiel sur Google"
                                >
                                    <Search className="w-3 h-3" /> Site Officiel
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
                {(!events || events.length === 0) && <p className="text-sm text-gray-500 italic">Aucun événement cette semaine.</p>}
            </div>

            {/* Colonne 2 : Agenda Annuel */}
            <div className={`space-y-4 transition-opacity duration-300 ${refreshingAnnual ? 'opacity-50' : 'opacity-100'} lg:border-l lg:border-gray-100 lg:pl-[40px]`}>
                 <div className="flex items-center justify-between pb-2 border-b-2 border-green-700">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <CalendarRange className="w-4 h-4 text-green-700"/>
                        Agenda Annuel Phare
                    </h3>
                    {onRefreshAnnual && (
                        <button 
                            onClick={handleRefreshAnnual} 
                            disabled={refreshingAnnual}
                            className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                            title="Actualiser l'agenda annuel"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshingAnnual ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>

                {annualEvents && annualEvents.map((event, index) => (
                    <div key={index} className="bg-slate-50 p-[16px] rounded-lg border border-gray-100 flex items-start gap-4 h-auto group transition-colors hover:bg-[#EEF2F6]">
                        <div className="p-2 bg-green-100 rounded-lg shrink-0">
                            <ThemeIcon theme={event.theme} />
                        </div>
                        <div className='flex-grow'>
                             <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 shrink-0">
                                    {event.dateRange}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3"/>
                                    <span>{event.location}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-[999px] text-xs font-bold bg-white border border-gray-200 text-[#4B5563] ml-auto">
                                    {event.theme}
                                </span>
                             </div>
                            
                            <h4 className="font-bold text-base text-gray-900 mb-1 leading-snug">{event.name}</h4>
                            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{event.description}</p>
                            
                            <div className="mt-2 text-xs">
                                <a 
                                    href={`https://www.google.com/search?q=${encodeURIComponent(event.name + " " + event.dateRange + " site officiel")}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-green-700 hover:underline"
                                    title="Rechercher Site Officiel"
                                >
                                    <Search className="w-3 h-3" /> Site Officiel
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
                 {(!annualEvents || annualEvents.length === 0) && <p className="text-sm text-gray-500 italic">Aucun événement majeur identifié pour le reste de l'année.</p>}
            </div>
        </div>
    </div>
  );
};

export default InternationalEvents;