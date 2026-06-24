
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AfricanHeritage as HeritageInfo, ExpandedHeritageInfo } from '../types';
import { Landmark, ExternalLink, Loader, BookOpen, User, AlertTriangle, RefreshCw } from 'lucide-react';
import { expandHeritageInfo } from '../services/geminiService';
import Modal from './Modal';
import GenerativeImage from './GenerativeImage';
import SourceLink from './SourceLink';

interface AfricanHeritageProps {
  heritageInfo: HeritageInfo;
}

const AfricanHeritage: React.FC<AfricanHeritageProps> = ({ heritageInfo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<ExpandedHeritageInfo | null>(null);
  const [expansionError, setExpansionError] = useState<string | null>(null);

  const handleLearnMore = async () => {
    setIsModalOpen(true);
    if (expandedInfo && !expansionError) return;

    setIsExpanding(true);
    setExpansionError(null);
    try {
      const data = await expandHeritageInfo(heritageInfo.title, heritageInfo.description);
      setExpandedInfo(data);
    } catch (err) {
      setExpansionError("Impossible de charger les informations détaillées. Veuillez réessayer plus tard.");
    } finally {
      setIsExpanding(false);
    }
  };

  if (!heritageInfo) return null;

  return (
    <>
      <div className="mb-8 animate-fade-in bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2 uppercase tracking-wider">
          <Landmark className="w-5 h-5 text-green-700" />
          Héritage Africain
        </h2>
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row md:items-stretch group">
          <div className="md:w-80 flex-shrink-0 bg-gray-100 aspect-video md:aspect-auto self-stretch relative overflow-hidden">
            <GenerativeImage 
                src="" // Souvent pas d'image source pour l'héritage, on force la génération
                alt={heritageInfo.title}
                prompt={heritageInfo.imagePrompt || `Historical illustration of ${heritageInfo.title} in Africa, detailed, cinematic lighting.`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                enableAutoGeneration={true}
            />
            <div className="absolute inset-0 shadow-inner rounded-l-lg pointer-events-none"></div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-gray-900 leading-tight flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-orange-500" />
                  {heritageInfo.title}
              </h3>
              <p className="mt-4 text-sm text-gray-700 leading-relaxed border-l-2 border-[#FCD34D] pl-4">
                  {heritageInfo.description}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <button 
                  onClick={handleLearnMore}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D6A4F] text-white text-sm font-bold rounded-md shadow-sm hover:bg-[#1B4332] transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Savoir plus sur le sujet
                </button>
                <div className="flex items-center">
                   <SourceLink title={heritageInfo.title} source={heritageInfo.source} />
                </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={heritageInfo.title}>
        {isExpanding ? (
          <div className="flex flex-col items-center justify-center h-[280px]">
            <Loader className="w-10 h-10 text-green-700 animate-spin" />
            <p className="mt-4 text-sm text-gray-500 font-medium">Recherche d'informations détaillées...</p>
          </div>
        ) : expansionError ? (
          <div className="flex flex-col items-center justify-center h-[280px] text-center px-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <p className="mt-4 text-sm font-bold text-red-500">{expansionError}</p>
            <button
                onClick={handleLearnMore}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-900 text-sm font-bold rounded-md hover:bg-gray-200 transition-colors"
            >
                <RefreshCw className="w-4 h-4" />
                Réessayer
            </button>
          </div>
        ) : expandedInfo && (
          <div className="space-y-[32px]">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider text-sm border-b border-gray-100 pb-2">Analyse Détaillée</h3>
              <ReactMarkdown
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                components={{
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1.5" {...props} />,
                    p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
                }}
              >
                {expandedInfo.detailedDescription}
              </ReactMarkdown>
            </div>
            {expandedInfo.bookRecommendations && expandedInfo.bookRecommendations.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <BookOpen className="w-5 h-5 text-green-700" />
                  Suggestions de Lecture
                </h3>
                <ul className="space-y-3">
                  {expandedInfo.bookRecommendations.map((book, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-50 text-green-700 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{book.title}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                          <User className="w-3.5 h-3.5" />
                          {book.author}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default AfricanHeritage;
