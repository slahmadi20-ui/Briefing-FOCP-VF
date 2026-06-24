import React, { useState, useEffect } from 'react';
import { FOCUS_COUNTRIES } from '../constants';
import { generateCountryFocus } from '../services/geminiService';
import { CountryFocusData, LoadingState } from '../types';
import { 
  Globe, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  RefreshCw, 
  Sparkles, 
  ShieldAlert, 
  Users, 
  Calendar, 
  Coins, 
  FileText, 
  Activity, 
  Lightbulb, 
  User, 
  Leaf, 
  Droplets, 
  Wrench, 
  Sprout, 
  Scale, 
  ChevronDown, 
  ArrowUpRight, 
  Lock,
  Search,
  Award,
  BookOpen,
  Info
} from 'lucide-react';

const CountryFocus: React.FC = () => {
  // We'll default to "Sénégal" or the first available country in the FOCUS_COUNTRIES list
  const defaultCountry = FOCUS_COUNTRIES.includes("Sénégal") ? "Sénégal" : FOCUS_COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [data, setData] = useState<CountryFocusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'agriculture' | 'governance' | 'risk_indices' | 'news'>('summary');

  // Filter countries based on search
  const filteredCountries = FOCUS_COUNTRIES.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCountryData = async (countryName: string, forceRefresh = false) => {
    setLoadingState(LoadingState.LOADING);
    setError(null);

    const cacheKey = `country_focus_${countryName.replace(/\s+/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached && !forceRefresh) {
      try {
        const parsed = JSON.parse(cached);
        setData(parsed);
        setLoadingState(LoadingState.SUCCESS);
        return;
      } catch (e) {
        console.error("Cache parsing failed for country focus:", e);
      }
    }

    try {
      const generated = await generateCountryFocus(countryName);
      setData(generated);
      localStorage.setItem(cacheKey, JSON.stringify(generated));
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error("Failed to generate country focus data:", err);
      setError(err?.message || "Une erreur est survenue lors du chargement des données. Veuillez réessayer.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  useEffect(() => {
    fetchCountryData(selectedCountry);
  }, [selectedCountry]);

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  return (
    <div id="country-focus-container-section" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 transition-all">
      {/* Header section with Dropdown and Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-gray-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-50 text-green-700 rounded-xl">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Veille & Fiche Pays Pays du Sud</h2>
            <p className="text-xs text-gray-500">
              Analyse d'intelligence géopolitique, profil agricole, gouvernance sectorielle et opportunités du Grand Sud
            </p>
          </div>
        </div>

        {/* Dropdown country Selector (Searchable) */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <div className="relative flex-grow md:flex-grow-0 min-w-[240px]">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-gray-400 text-sm font-bold text-gray-700 shadow-xs focus:ring-2 focus:ring-green-100 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-700 flex-shrink-0" />
                <span>{selectedCountry}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in max-h-[300px] flex flex-col">
                <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Rechercher un pays..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none text-xs text-gray-700 focus:outline-none focus:ring-0 p-1"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex-grow custom-scrollbar divide-y divide-gray-50">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-green-50 transition-colors flex items-center justify-between ${
                          selectedCountry === country ? 'bg-green-50/50 text-green-900 font-bold' : 'text-gray-700'
                        }`}
                      >
                        <span>{country}</span>
                        {selectedCountry === country && <span className="w-1.5 h-1.5 bg-green-700 rounded-full" />}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400">Aucun pays trouvé</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => fetchCountryData(selectedCountry, true)}
            disabled={loadingState === LoadingState.LOADING}
            className="flex-shrink-0 p-2.5 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${loadingState === LoadingState.LOADING ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main workspace container */}
      <div className="min-h-[400px]">
        {loadingState === LoadingState.LOADING && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full border-[3px] border-green-100 border-t-green-700 animate-spin"></div>
              <CompassIcon className="w-6 h-6 text-green-700 absolute inset-0 m-auto" />
            </div>
            <h3 className="font-bold text-gray-950 text-sm">Génération de la fiche de veille stratégique</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Recherche en cours pour <strong>{selectedCountry}</strong>. Analyse du marché agricole, données électorales et suivi des engrais OCP.
            </p>
          </div>
        )}

        {loadingState === LoadingState.ERROR && (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-red-200 bg-red-50/40 rounded-xl">
            <ShieldAlert className="w-10 h-10 text-red-500 mb-3" />
            <h3 className="font-bold text-red-800 text-sm">Échec de la génération</h3>
            <p className="text-xs text-red-600 mt-1 max-w-md px-4">{error || "Une erreur d'API s'est produite lors de la connexion à l'intelligence de veille."}</p>
            <button
              onClick={() => fetchCountryData(selectedCountry, true)}
              className="mt-4 px-4 py-2 bg-red-150 hover:bg-red-200 text-red-800 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all outline-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réessayer de charger le pays</span>
            </button>
          </div>
        )}

        {loadingState === LoadingState.SUCCESS && data && (
          <div className="space-y-6 animate-fade-in">
            {/* Country Identity Card Banner */}
            <div className="bg-gradient-to-r from-green-50/30 to-emerald-50/10 border border-green-100 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-3xs">
              <div className="flex items-center gap-4">
                {data.flagUrl ? (
                  <img 
                    src={data.flagUrl} 
                    alt={`Drapeau de ${data.countryName}`}
                    className="w-16 h-11 object-cover rounded-md border border-gray-200 shadow-2xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-11 bg-green-700/10 border border-green-200 rounded-md flex items-center justify-center text-sm font-bold text-green-700">
                    {data.countryName.slice(0, 3).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-md font-bold text-gray-905">{data.identity.officialName || data.countryName}</h3>
                    <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                      FOCP National
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Région : <span className="font-medium text-gray-700">{data.identity.region}</span> • Capitale : <span className="font-medium text-gray-700">{data.identity.capital}</span>
                  </p>
                </div>
              </div>

              {/* Quick executive highlight */}
              <div className="flex items-center gap-2 self-stretch md:self-auto bg-white border border-gray-150 p-2.5 rounded-lg">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  data.executiveSummary.priorityLevel?.toLowerCase().includes('haute') || data.executiveSummary.priorityLevel?.toLowerCase().includes('high')
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-amber-500'
                }`} />
                <div className="text-left">
                  <p className="text-[9px] text-gray-400 font-extrabold uppercase leading-none">Niveau de Priorité Veille</p>
                  <p className="text-xs font-bold text-gray-700 mt-1 leading-none">{data.executiveSummary.priorityLevel}</p>
                </div>
              </div>
            </div>

            {/* Sub Tabs Selection */}
            <div className="flex flex-wrap gap-1 border-b border-gray-100 pb-1">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                  activeTab === 'summary' 
                    ? 'border-green-720 text-green-750 bg-green-50/10 font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                📊 Identité & Synthèse
              </button>
              <button
                onClick={() => setActiveTab('agriculture')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                  activeTab === 'agriculture' 
                    ? 'border-green-720 text-green-750 bg-green-50/10 font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                🌾 Profil Agricole & Engrais
              </button>
              <button
                onClick={() => setActiveTab('governance')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                  activeTab === 'governance' 
                    ? 'border-green-720 text-green-750 bg-green-50/10 font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                📜 Politiques & Gouvernance
              </button>
              <button
                onClick={() => setActiveTab('risk_indices')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                  activeTab === 'risk_indices' 
                    ? 'border-green-720 text-green-750 bg-green-50/10 font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                🛡️ Enjeux & Risques Risques
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                  activeTab === 'news' 
                    ? 'border-green-720 text-green-750 bg-green-50/10 font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                📰 Réf. Presse ({data.latestNews?.length || 0})
              </button>
            </div>

            {/* TAB CONTENTS */}
            
            {/* Tab 1: Identity & Summary */}
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Structural Profile data */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      Fiche d'Identité Structurelle
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 border border-gray-100 p-3 rounded-lg flex items-center gap-3">
                        <Users className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Population globale</p>
                          <p className="text-xs font-bold text-gray-800 mt-1 leading-none">{data.identity.population}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 border border-gray-100 p-3 rounded-lg flex items-center gap-3">
                        <Coins className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">produit intérieur brut (pib)</p>
                          <p className="text-xs font-bold text-gray-800 mt-1 leading-none">{data.identity.gdp}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 border border-gray-100 p-3 rounded-lg flex items-center gap-3">
                        <Sprout className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Part de l'Agriculture au PIB</p>
                          <p className="text-xs font-bold text-gray-800 mt-1 leading-none">{data.identity.agGdpPercent}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 border border-gray-100 p-3 rounded-lg flex items-center gap-3">
                        <Scale className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Régime Politique</p>
                          <p className="text-xs font-bold text-gray-800 mt-1 truncate max-w-[200px]" title={data.identity.politicalRegime}>{data.identity.politicalRegime}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 border border-gray-100 p-3 rounded-lg flex items-center gap-3">
                        <span className="text-[14px] font-bold text-gray-600 flex-shrink-0 bg-gray-100 w-5 h-5 rounded-md flex items-center justify-center">🌐</span>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Langues Officielles</p>
                          <p className="text-xs font-bold text-gray-850 mt-1 leading-none truncate max-w-[200px]" title={data.identity.officialLanguages}>{data.identity.officialLanguages}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 border border-gray-100 p-3 rounded-lg flex items-center gap-3">
                        <span className="text-[14px] font-bold text-gray-600 flex-shrink-0 bg-gray-100 w-5 h-5 rounded-md flex items-center justify-center">💵</span>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Devise / Monnaie nationale</p>
                          <p className="text-xs font-bold text-gray-850 mt-1 leading-none">{data.identity.currency}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Indices and Stabilities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-gray-200/80 p-4 rounded-xl space-y-1 bg-white">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-800 uppercase">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        Stabilité Politique
                      </div>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">{data.identity.politicalStabilityIndex}</p>
                    </div>

                    <div className="border border-gray-200/80 p-4 rounded-xl space-y-1 bg-white">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-800 uppercase">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        Perception Corruption
                      </div>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">{data.identity.corruptionIndex}</p>
                    </div>
                  </div>
                </div>

                {/* Synthesis of risks, watchPoints & Opportunities with executive emphasis */}
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 h-full">
                    <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                      <Lightbulb className="w-4 h-4 text-green-700 animate-bounce" />
                      Résumé Exécutif FOCP
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Opportunities */}
                      <div className="bg-green-50/50 border border-green-100 rounded-lg p-3">
                        <p className="text-[9px] text-green-900 font-extrabold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Opportunités Majeures
                        </p>
                        <p className="text-[11px] text-gray-650 leading-relaxed mt-1.5">{data.executiveSummary.opportunities}</p>
                      </div>

                      {/* Risks */}
                      <div className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                        <p className="text-[9px] text-red-900 font-extrabold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          Risques Clés
                        </p>
                        <p className="text-[11px] text-gray-650 leading-relaxed mt-1.5">{data.executiveSummary.majorRisks}</p>
                      </div>

                      {/* Watch Points */}
                      <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                        <p className="text-[9px] text-amber-900 font-extrabold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Points de Vigilance
                        </p>
                        <p className="text-[11px] text-gray-650 leading-relaxed mt-1.5">{data.executiveSummary.watchPoints}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Agricultural Profile & Fertilizers */}
            {activeTab === 'agriculture' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Section A: Agricultural profile */}
                <div className="border border-gray-200/80 rounded-xl p-5 space-y-4 bg-white">
                  <h4 className="text-xs font-extrabold uppercase text-green-800 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                    <Sprout className="w-4 h-4 text-green-600" />
                    Profil de Production Agricole
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50/20 p-3 rounded-lg">
                      <p className="text-[9px] font-bold uppercase text-gray-450">Population Active Agricole</p>
                      <p className="text-xs font-extrabold text-green-900 mt-1 leading-tight">{data.agriculturalProfile.activePopulationInAg}</p>
                    </div>

                    <div className="bg-green-50/20 p-3 rounded-lg">
                      <p className="text-[9px] font-bold uppercase text-gray-450">Taux de Population Rurale</p>
                      <p className="text-xs font-extrabold text-green-900 mt-1 leading-tight">{data.agriculturalProfile.ruralPopulation}</p>
                    </div>

                    <div className="bg-green-50/20 p-3 rounded-lg col-span-2">
                      <p className="text-[9px] font-bold uppercase text-gray-450">Terres Arables Totales</p>
                      <p className="text-xs font-bold text-gray-700 mt-1">{data.agriculturalProfile.arableLand}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <span className="p-1 text-xs font-bold text-green-700 bg-green-50 rounded-md">🌾</span>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 leading-none">Cultures Principales</h5>
                        <p className="text-xs text-gray-600 mt-1">{data.agriculturalProfile.mainCrops}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Droplets className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 leading-none">Niveau d'Irrigation</h5>
                        <p className="text-xs text-gray-600 mt-1">{data.agriculturalProfile.irrigationLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Wrench className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 leading-none">Mécanisation Agricole</h5>
                        <p className="text-xs text-gray-600 mt-1">{data.agriculturalProfile.mechanizationLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 leading-none">Vulnérabilité Climatique</h5>
                        <p className="text-xs text-gray-600 mt-1">{data.agriculturalProfile.climateVulnerability}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Coins className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 leading-none">Dépendance aux Importations Alimentaires</h5>
                        <p className="text-xs text-gray-600 mt-1">{data.agriculturalProfile.foodImportDependency}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Fertilizer Market & OCP focus */}
                <div className="space-y-5">
                  <div className="border border-green-200/80 rounded-xl p-5 space-y-4 bg-white shadow-2xs">
                    <h4 className="text-xs font-extrabold uppercase text-green-900 tracking-wider flex items-center gap-1.5 border-b border-green-150 pb-1.5">
                      <Leaf className="w-4 h-4 text-green-700" />
                      Marché National des Engrais
                    </h4>

                    {/* Quick stats row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-[9px] font-bold uppercase text-gray-400">Consommation Annuelle</p>
                        <p className="text-xs font-bold text-gray-700 mt-1 leading-none">{data.fertilizerMarket.annualConsumption}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-[9px] font-bold uppercase text-gray-400">Tendance Récente Marché</p>
                        <p className="text-xs font-bold text-gray-700 mt-1 leading-none">{data.fertilizerMarket.recentTrend}</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 pt-2 text-xs">
                      <div>
                        <h5 className="font-bold text-gray-800">Imports & Principaux Fournisseurs</h5>
                        <p className="text-gray-600 mt-1">{data.fertilizerMarket.imports}</p>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Production Locale</h5>
                        <p className="text-gray-600 mt-1">{data.fertilizerMarket.localProduction}</p>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Subventions Étatiques</h5>
                        <p className="text-gray-600 mt-1">{data.fertilizerMarket.subsidies}</p>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Acteurs Dominants du Secteur</h5>
                        <p className="text-gray-600 mt-1">{data.fertilizerMarket.dominantPlayers}</p>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Sensibilité aux Prix des Engrais</h5>
                        <p className="text-gray-600 mt-1">{data.fertilizerMarket.priceSensitivity}</p>
                      </div>
                    </div>
                  </div>

                  {/* OCP Group Presence - crucial strategic card */}
                  <div className="bg-gradient-to-br from-green-700 to-emerald-850 text-white rounded-xl p-5 space-y-3 shadow-sm border border-emerald-800">
                    <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                        <Award className="w-4 h-4 text-green-200" />
                        Présence, Accords & Projets OCP
                      </div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-600 border border-emerald-500">Filiale / Partenaire</span>
                    </div>
                    <p className="text-xs text-green-50 leading-relaxed font-medium whitespace-pre-line bg-white/5 p-3 rounded-lg border border-white/5">
                      {data.fertilizerMarket.ocpPresence}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Governance, Policies & electoral calendar */}
            {activeTab === 'governance' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Agricultural sector policy */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-white">
                    <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                      <Scale className="w-4 h-4 text-blue-600" />
                      Stratégie Nationale & Politiques de Développement
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Nom de la stratégie</p>
                        <p className="text-xs font-bold text-gray-800 mt-1" title={data.agriculturalPolicy.strategyName}>{data.agriculturalPolicy.strategyName}</p>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Année de Lancement / Horizon</p>
                        <p className="text-xs font-bold text-gray-800 mt-1">{data.agriculturalPolicy.launchYear}</p>
                      </div>
                    </div>

                    <div className="space-y-4 block text-xs">
                      <div>
                        <h5 className="font-bold text-gray-800">Objectifs Globaux et Chiffrés</h5>
                        <p className="text-gray-600 mt-1 leading-relaxed">{data.agriculturalPolicy.objectives}</p>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Réformes Récentes du Secteur</h5>
                        <p className="text-gray-600 mt-1 leading-relaxed">{data.agriculturalPolicy.recentReforms}</p>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Programmes de Subventions</h5>
                        <p className="text-gray-600 mt-1 leading-relaxed">{data.agriculturalPolicy.subsidiesPrograms}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <h5 className="font-bold text-gray-800">Accès au Crédit / Financement</h5>
                          <p className="text-gray-600 mt-1 leading-relaxed">{data.agriculturalPolicy.accessToFinance}</p>
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800">Orientation Commerciale</h5>
                          <p className="text-gray-600 mt-1 leading-relaxed">{data.agriculturalPolicy.tradeOrientation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ministers Profiles (Agricultural Governance) */}
                <div className="space-y-5">
                  <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-white">
                    <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                      <User className="w-4 h-4 text-emerald-700" />
                      Gouvernance & Personnalités Clés
                    </h4>

                    {/* Minister Agriculture */}
                    <div className="bg-slate-50/50 p-3.5 rounded-xl border border-gray-150 space-y-2">
                      <div className="flex items-start justify-between gap-2 border-b border-gray-200/50 pb-1.5">
                        <div>
                          <h5 className="text-xs font-extrabold text-blue-900 leading-none">{data.agriculturalGovernance.ministerAg.name}</h5>
                          <p className="text-[10px] text-gray-500 font-semibold mt-1">Ministre de l'Agriculture</p>
                        </div>
                        <span className="text-[9px] bg-green-50 text-green-800 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">Nomination : {data.agriculturalGovernance.ministerAg.nominationDate}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed italic">
                        "{data.agriculturalGovernance.ministerAg.bio}"
                      </p>
                    </div>

                    {/* Minister Environment */}
                    <div className="bg-slate-50/50 p-3.5 rounded-xl border border-gray-150 space-y-2">
                      <div className="flex items-start justify-between gap-2 border-b border-gray-200/50 pb-1.5">
                        <div>
                          <h5 className="text-xs font-extrabold text-blue-900 leading-none">{data.agriculturalGovernance.ministerEnv.name}</h5>
                          <p className="text-[10px] text-gray-500 font-semibold mt-1">Ministre de l'Environnement / Eau</p>
                        </div>
                        <span className="text-[9px] bg-green-50 text-green-800 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">Nomination : {data.agriculturalGovernance.ministerEnv.nominationDate}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed italic">
                        "{data.agriculturalGovernance.ministerEnv.bio}"
                      </p>
                    </div>
                  </div>

                  {/* Electoral Calendar */}
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3.5 bg-indigo-50/20">
                    <h4 className="text-xs font-extrabold uppercase text-indigo-900 tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1.5">
                      <Calendar className="w-4 h-4 text-indigo-700" />
                      Calendrier Politique Électoral
                    </h4>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-gray-800 block">Prochaine Échéance Nationale :</span>
                        <span className="text-gray-600 block mt-0.5">{data.politicalCalendar.nextElection}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 block">Dernier Contexte Électoral :</span>
                        <span className="text-gray-600 block mt-0.5">{data.politicalCalendar.recentElections}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 block">Impact sur les Politiques Agricoles :</span>
                        <span className="text-gray-600 block mt-0.5 italic">{data.politicalCalendar.impactOnAg}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 4: FOCP risk indices & climate/security issues */}
            {activeTab === 'risk_indices' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fade-in">
                {/* Left Side: FOCP Evaluation Index Ratings */}
                <div className="border border-gray-200/80 rounded-xl p-5 space-y-5 bg-white">
                  <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    Indicateurs d'Évaluation de Risque & Développement FOCP
                  </h4>

                  <div className="space-y-4">
                    {/* Index 1 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700">Dépendance stratégique aux importations engrais / nourriture :</span>
                        <span className="bg-red-50 text-red-850 px-2 py-0.5 rounded font-extrabold text-[10px] border border-red-100">{data.focpIndicators.importDependency}</span>
                      </div>
                    </div>

                    {/* Index 2 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700">Potentiel de Croissance du Secteur Agricole :</span>
                        <span className="bg-green-50 text-green-850 px-2 py-0.5 rounded font-extrabold text-[10px] border border-green-100">{data.focpIndicators.growthPotential}</span>
                      </div>
                    </div>

                    {/* Index 3 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700">Risque Climatique Global Sourcé :</span>
                        <span className="bg-amber-50 text-amber-850 px-2 py-0.5 rounded font-extrabold text-[10px] border border-amber-100">{data.focpIndicators.climateRisk}</span>
                      </div>
                    </div>

                    {/* Index 4 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700">Sensibilité Politique & Sociale aux Prix de l'Intrant :</span>
                        <span className="bg-orange-50 text-orange-850 px-2 py-0.5 rounded font-extrabold text-[10px] border border-orange-100">{data.focpIndicators.fertilizerSensitivity}</span>
                      </div>
                    </div>

                    {/* Index 5 */}
                    <div className="space-y-1">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-bold text-gray-700">Opportunités de Coopération (Fondations d'Économie Solidaire) :</span>
                        <span className="text-gray-600 text-xs bg-slate-50 p-2.5 rounded border border-gray-100 italic leading-relaxed mt-1">"{data.focpIndicators.coopOpportunities}"</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Geopolitics, Climate vulnerability details & logistics risk */}
                <div className="space-y-5">
                  <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
                    <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Géopolitique, Dépendances & Risques Logistiques
                    </h4>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <h5 className="font-bold text-gray-800">Sécurité & Niveau de Stabilité Globale</h5>
                        <p className="text-gray-600 mt-1">{data.securityAndGeopolitics.stabilityLevel}</p>
                      </div>

                      {data.securityAndGeopolitics.conflicts && (
                        <div>
                          <h5 className="font-bold text-gray-800">Conflits Internes ou Tensions Régionales</h5>
                          <p className="text-gray-600 mt-1">{data.securityAndGeopolitics.conflicts}</p>
                        </div>
                      )}

                      <div>
                        <h5 className="font-bold text-gray-800">Goulots d'Étranglement & Risques Logistiques</h5>
                        <p className="text-gray-600 mt-1">{data.securityAndGeopolitics.logisticsRisks}</p>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Dépendance Énergétique Majeure</h5>
                        <p className="text-gray-600 mt-1">{data.securityAndGeopolitics.energyDependency}</p>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Position Géostratégique Régionale</h5>
                        <p className="text-gray-600 mt-1">{data.securityAndGeopolitics.regionalPosition}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
                    <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                      <Leaf className="w-4 h-4 text-green-700" />
                      Changement Climatique & Ressources Hydriques
                    </h4>

                    <div className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-bold text-gray-800">Climat Dominant</h5>
                          <p className="text-gray-600 mt-0.5">{data.climateAndEnv.dominantClimate}</p>
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800">Pluviométrie Récente</h5>
                          <p className="text-gray-600 mt-0.5">{data.climateAndEnv.rainfallTrend}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-bold text-gray-800">Stress Hydrique</h5>
                          <p className="text-gray-600 mt-0.5">{data.climateAndEnv.waterStress}</p>
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800">Risque de Sécheresse</h5>
                          <p className="text-gray-600 mt-0.5">{data.climateAndEnv.droughtRisk}</p>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Événements Climatiques Extrêmes Récents</h5>
                        <p className="text-gray-600 mt-1">{data.climateAndEnv.recentExtremeEvents}</p>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-800">Impact Global sur le Secteur Agricole</h5>
                        <p className="text-gray-600 mt-1 leading-relaxed italic">"{data.climateAndEnv.agImpact}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Latest News reference lists */}
            {activeTab === 'news' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h4 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600 animate-spin duration-3000" />
                    Références d'Actualités au {selectedCountry} (Presse Nationale & Internationale)
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Recherche IA à jour</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.latestNews && data.latestNews.length > 0 ? (
                    data.latestNews.map((newsItem, index) => (
                      <div key={index} className="bg-white border border-gray-200 hover:border-green-300 rounded-xl p-4 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition-all h-full">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold border-b border-gray-50 pb-1.5">
                            <span className="font-extrabold text-blue-800 uppercase tracking-widest">{newsItem.source}</span>
                            <span>Réf d'actu #{index + 1}</span>
                          </div>
                          <h5 className="font-bold text-gray-905 text-xs inline-block leading-tight select-none">
                            {newsItem.title}
                          </h5>
                        </div>

                        <a
                          href={newsItem.url || `https://www.google.com/search?q=${encodeURIComponent(newsItem.title + " " + selectedCountry)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-green-700 hover:text-green-800 hover:underline cursor-pointer"
                        >
                          <span>Accéder à l'article</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 bg-slate-50 border border-dashed border-gray-200 rounded-xl">
                      <p className="text-xs text-gray-400">Aucun article de presse n'a pu être localisé aujourd'hui pour {selectedCountry}.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple compass icon overlay
const CompassIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
};

export default CountryFocus;
