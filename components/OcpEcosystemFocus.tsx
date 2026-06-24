import React, { useState, useEffect } from 'react';
import { generateOcpEcosystemFocus } from '../services/geminiService';
import { OcpEcosystemFocusData, LoadingState } from '../types';
import { 
  Building2, 
  ExternalLink, 
  Linkedin, 
  MapPin, 
  Calendar, 
  Network, 
  Info, 
  RefreshCw, 
  Sparkles, 
  AlertCircle,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Globe,
  Compass,
  ArrowUpRight
} from 'lucide-react';

export const ocpEcosystemList = [
  {
    category: "🔬 Écosystème Innovation, Labos et Tech Builders",
    entities: [
      { name: "Social Innovation Lab (SIL)", desc: "Laboratoire d'innovation sociale propulsé par la Fondation OCP et hébergé à l'UM6P, dédié au développement de projets de recherche-action à fort impact communautaire." },
      { name: "MRTB (Moroccan Retail Tech Builder)", desc: "Plateforme nationale d'incubation et d'accélération de startups digitales spécialisées dans le secteur du commerce, co-créée avec le Ministère de l'Industrie." },
      { name: "INNOVX", desc: "Filiale de l'UM6P et de l'OCP opérant comme un 'Venture Builder' industriel et investisseur dans les secteurs de la transition énergétique (hydrogène vert, eau, chimie)." },
      { name: "Tourba", desc: "Entreprise lancée par INNOVX axée sur la décarbonation agricole (Carbon Farming) et la certification de crédits carbone." },
      { name: "Digital Innovation & Change Office", desc: "Division interne accélérant l'intrapreneuriat technologique et l'acculturation digitale des collaborateurs du groupe." },
      { name: "Bidra Innovation Ventures", desc: "Fonds de capital-risque technologique du groupe basé à San Francisco." }
    ]
  },
  {
    category: "🤝 Économie Sociale, Solidaire et Fondations",
    entities: [
      { name: "Fondation OCP", desc: "Structure menant les projets de développement humain, d'éducation et d'appui agricole au Maroc et à l'international." },
      { name: "Fondation Phosboucraa", desc: "Organisme dédié au développement socio-économique durable des provinces du Sud du Maroc." },
      { name: "Coopstore", desc: "Programme et réseau physique/digital mis en place par la Fondation OCP pour encadrer, certifier et faciliter la mise en marché des produits de plus de 900 coopératives du terroir." },
      { name: "Al Moutmir", desc: "Initiative d'accompagnement direct (agronomique et phygital) des agriculteurs marocains." }
    ]
  },
  {
    category: "🏭 Grandes Filiales Industrielles et de Services",
    entities: [
      { name: "OCP Nutricrops S.A.", desc: "Filiale industrielle née de la réorganisation des entités de production d'engrais (ex JFC I à V)." },
      { name: "OCP Africa", desc: "Filiale dédiée au développement agricole continental, avec des programmes sur-mesure d'approvisionnement et de conseil agronomique." },
      { name: "Phosboucraa", desc: "Filiale d'extraction, enrichissement et valorisation minière opérant dans le Sud du Maroc (Boucraa/Laâyoune)." },
      { name: "OCP Green Energy / OCP Green Water", desc: "Entités chargées de guider et opérer la transition hydro-énergétique bas-carbone du groupe (dessalement d'eau, solaire, éolien)." },
      { name: "JESA", desc: "Jacobs Engineering SA - Joint-venture d'ingénierie majeure pour les grands chantiers industriels, d'infrastructure et d'énergie." },
      { name: "OCP Global Business", desc: "Structure de conseil opérationnel issue de l'intégration de PwC Business Services." },
      { name: "OCP Ré S.A.", desc: "Filiale de réassurance du groupe implantée au Luxembourg." },
      { name: "SOTREG & Marphocéan", desc: "Filiales de logistique pour le transport routier, ferroviaire et maritime des acides et des phosphates sous forme de vrac liquide." },
      { name: "CERPHOS", desc: "Centre d'études et de recherche appliquée dédié aux phosphates et à l'analyse minérale de pointe." }
    ]
  },
  {
    category: "🌍 Joint-Ventures Internationales",
    entities: [
      { name: "Imacid", desc: "Coentreprise de production d’acide phosphorique de référence, en partenariat avec des industriels indiens indiens (Birla)." },
      { name: "PMP (Pakistan Maroc Phosphore)", desc: "Coentreprise majeure assurant l'alimentation industrielle du marché pakistanais en acide et engrais." },
      { name: "Zuari Maroc Phosphates / Paradeep Phosphates", desc: "Implantations et participations stratégiques de premier plan connectant la chaîne de valeur OCP au marché agricole indien." },
      { name: "Prayon", desc: "Filiale technologique et de chimie fine basée en Belgique, spécialiste mondial du secteur des phosphates." },
      { name: "Global Feed", desc: "Production industrielle de phosphates à forte valeur ajoutée pour la nutrition animale, basée en Espagne." }
    ]
  },
  {
    category: "🌐 Filiales Commerciales Internationales (OCP International)",
    entities: [
      { name: "OCP North America", desc: "Bureau commercial et de représentation du groupe couvrant le marché agricole et industriel nord-américain depuis les Etats-Unis." },
      { name: "OCP Do Brasil & OCP Argentina", desc: "Filiales commerciales couvrant les immenses marchés d'Amérique du Sud, notamment le géant agricole brésilien." },
      { name: "OCP Europe", desc: "Hub de commercialisation pilotant les ventes et partenariats en France, Belgique et Suisse." },
      { name: "OCP Singapore, OCP China, OCP India", desc: "Filiales commerciales opérant l'approvisionnement des grands marchés de la zone Asie-Pacifique." }
    ]
  }
];

const OcpEcosystemFocus: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(ocpEcosystemList[0].category);
  const [selectedEntity, setSelectedEntity] = useState<string>(ocpEcosystemList[0].entities[0].name);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [data, setData] = useState<OcpEcosystemFocusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load from cache first or generate
  const fetchEcosystemData = async (entityName: string) => {
    setLoadingState(LoadingState.LOADING);
    setError(null);

    const cacheKey = `ocp_ecosystem_focus_${entityName.replace(/\s+/g, '_')}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setData(parsed);
        setLoadingState(LoadingState.SUCCESS);
        return;
      } catch (e) {
        console.error("Cache parsing failed for OCP ecosystem focus:", e);
      }
    }

    try {
      const generated = await generateOcpEcosystemFocus(entityName);
      setData(generated);
      localStorage.setItem(cacheKey, JSON.stringify(generated));
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erreur de chargement. Veuillez réessayer.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  // Triger data load when selection change
  useEffect(() => {
    fetchEcosystemData(selectedEntity);
  }, [selectedEntity]);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const cat = ocpEcosystemList.find(c => c.category === categoryName);
    if (cat && cat.entities.length > 0) {
      setSelectedEntity(cat.entities[0].name);
    }
  };

  const activeCategory = ocpEcosystemList.find(c => c.category === selectedCategory);

  return (
    <div id="ocp-ecosystem-focus-section" className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 mb-8 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-50 text-green-700 rounded-xl">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Focus Filiales & Écosystème OCP</h2>
            <p className="text-xs text-gray-500">Veille par entité, synthèses de presse (Maroc & International) et publications LinkedIn </p>
          </div>
        </div>
        
        {/* Force refresh */}
        <button
          onClick={() => fetchEcosystemData(selectedEntity)}
          disabled={loadingState === LoadingState.LOADING}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          title="Actualiser les données"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingState === LoadingState.LOADING ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Tabs / Filter Groups */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ocpEcosystemList.map((cat, idx) => {
          const isSelected = selectedCategory === cat.category;
          return (
            <button
              key={idx}
              onClick={() => handleCategoryChange(cat.category)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                isSelected 
                  ? 'bg-green-750 text-white border-green-750 shadow-xs ring-2 ring-green-100/30' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat.category}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Entity selection Sidebar */}
        <div className="lg:col-span-1 space-y-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar border-r border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">Sélectionner une entité</p>
          {activeCategory?.entities.map((ent, idx) => {
            const isSelected = selectedEntity === ent.name;
            return (
              <button
                key={idx}
                onClick={() => setSelectedEntity(ent.name)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all border flex flex-col gap-1 cursor-pointer ${
                  isSelected 
                    ? 'bg-green-50/50 border-green-300 text-green-900 font-semibold shadow-2xs' 
                    : 'bg-white border-transparent text-gray-700 hover:bg-gray-50'
                }`}
                title={ent.desc}
              >
                <span>{ent.name}</span>
                {!isSelected && (
                  <span className="text-[10px] text-gray-400 font-normal line-clamp-1 group-hover:text-gray-500">
                    {ent.desc}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content area */}
        <div className="lg:col-span-3">
          {loadingState === LoadingState.LOADING && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
              <div className="p-3 bg-green-50 text-green-700 rounded-full mb-3 animate-spin duration-1500">
                <Compass className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-800 text-sm">Génération de l'analyse & veille OCP...</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">Recherche et structuration des communiqués de presse et des posts LinkedIn par l'IA.</p>
            </div>
          )}

          {loadingState === LoadingState.ERROR && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-red-200 bg-red-50/40 rounded-xl">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="font-bold text-red-800 text-sm">Échec de la génération</p>
              <p className="text-xs text-red-600 mt-1 mb-4">{error || "Impossible de joindre les serveurs IA pour le moment."}</p>
              <button
                onClick={() => fetchEcosystemData(selectedEntity)}
                className="px-4 py-2 bg-red-100 hover:bg-red-250 text-red-800 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all outline-none"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réessayer la veille</span>
              </button>
            </div>
          )}

          {loadingState === LoadingState.SUCCESS && data && (
            <div className="space-y-6 animate-fade-in">
              {/* Profile Overview (Fiche d'identité) */}
              <div className="bg-gradient-to-br from-green-50/25 to-emerald-50/10 border border-green-100/50 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-green-700" />
                      {data.entityName}
                    </h3>
                    <p className="text-xs text-green-800 font-medium uppercase mt-0.5 tracking-wider">{data.category}</p>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-green-700" />
                    Focus IA
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 mt-3.5 leading-relaxed bg-white border border-gray-100 p-3 rounded-lg shadow-2xs">
                  {data.identity.overview}
                </p>

                {/* Grid attributes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
                  <div className="bg-white border border-gray-100 p-2.5 rounded-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">Implantation</p>
                      <p className="font-bold text-gray-700 truncate" title={data.identity.headquarters}>{data.identity.headquarters}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 p-2.5 rounded-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">Lancement</p>
                      <p className="font-bold text-gray-700" title={data.identity.creationDate}>{data.identity.creationDate}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 p-2.5 rounded-lg flex items-center gap-2 col-span-2">
                    <Info className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-green-700 font-medium uppercase">Rôle stratégique</p>
                      <p className="font-semibold text-gray-700 clamp-1" title={data.identity.keyRoles}>{data.identity.keyRoles}</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-gray-700">Direction :</span>
                  <span className="bg-white border border-gray-250 px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-gray-650">{data.identity.leaders}</span>
                </div>
              </div>

              {/* Press Articles & LinkedIn columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Press Articles Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Presse Maroc & Internationale
                  </h4>
                  <div className="space-y-4">
                    {data.pressArticles.map((art, idx) => (
                      <div key={idx} className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-3xs flex flex-col h-full hover:border-blue-300 transition-all">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${
                            art.type === 'Maroc' 
                              ? 'bg-red-50 text-red-800 border border-red-100' 
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                          }`}>
                            {art.type}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">{art.date}</span>
                        </div>
                        <h5 className="font-bold text-gray-905 text-xs tracking-tight line-clamp-2 leading-tight mb-2 hover:text-blue-800">
                          {art.title}
                        </h5>
                        <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed mb-3 flex-grow">
                          {art.summary}
                        </p>
                        <a
                          href={art.url || `https://www.google.com/search?q=${encodeURIComponent(art.title + ' ' + art.source)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-700 hover:text-blue-900 font-bold hover:underline mt-auto border-t border-gray-50 pt-2"
                        >
                          <span>Accéder à {art.source}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LinkedIn Posts Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                    <Linkedin className="w-4 h-4 text-blue-800" />
                    Publications & Réseaux Professionnels
                  </h4>
                  <div className="space-y-4">
                    {data.linkedinPosts.map((post, idx) => (
                      <div key={idx} className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-3xs hover:border-sky-300 transition-all">
                        <div className="flex items-center gap-2.5 mb-2.5">
                          {/* LinkedIn Avatar Mockup */}
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-sm font-bold text-blue-800 uppercase">
                            {post.author.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-gray-900 text-xs truncate leading-none mb-1">{post.author}</h5>
                            <p className="text-[10px] text-gray-400 truncate leading-none max-w-[150px] sm:max-w-[200px]" title={post.authorRole}>
                              {post.authorRole}
                            </p>
                            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{post.date} • 🌐</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-650 leading-relaxed whitespace-pre-line bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                          {post.content}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mt-2.5 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-sky-700">
                              <ThumbsUp className="w-3 h-3" />
                              {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {post.comments}
                            </span>
                          </div>
                          <a
                            href={post.url || "https://linkedin.com"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-800 hover:underline inline-flex items-center gap-0.5 font-extrabold"
                          >
                            <span>Voir l'original</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Strategic Prospects Accordion/Lists */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-green-700" />
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Perspectives & Enjeux de Développement</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Opportunities */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest bg-green-50 border border-green-150 rounded-md px-2 py-1 inline-block">opportunités</p>
                    <ul className="space-y-1.5">
                      {data.strategicProspects.opportunities.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-green-600 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-150 rounded-md px-2 py-1 inline-block">enjeux & défis</p>
                    <ul className="space-y-1.5">
                      {data.strategicProspects.challenges.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Future Projects */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest bg-blue-50 border border-blue-150 rounded-md px-2 py-1 inline-block">projets d'avenir</p>
                    <ul className="space-y-1.5">
                      {data.strategicProspects.futureProjects.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OcpEcosystemFocus;
