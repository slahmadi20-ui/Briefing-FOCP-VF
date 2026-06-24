import React from 'react';
import { RefreshCw, Calendar, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import NotificationManager from './NotificationManager';
import { BriefingData } from '../types';

interface HeaderProps {
  onGenerate: () => void;
  isLoading: boolean;
  currentDate: string;
  history: Partial<BriefingData>[];
  onSelectBriefing: (briefing: Partial<BriefingData>) => void;
}

const CustomLogo = () => (
  <svg viewBox="0 0 120 80" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Sun */}
    <path d="M 55 35 A 16 16 0 0 1 87 35" fill="#FBBF24" />
    <path d="M 71 15 L 71 5 M 55 22 L 45 12 M 87 22 L 97 12" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />
    
    {/* Infinity Right (Blue) */}
    <path d="M 60 50 C 75 20, 110 25, 105 55 C 100 85, 65 75, 60 50" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" />
    
    {/* Infinity Left (Green) */}
    <path d="M 60 50 C 45 80, 10 75, 15 45 C 20 15, 55 25, 60 50" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" />
    
    {/* Leaves */}
    <path d="M 15 45 Q 0 20 20 10 Q 35 25 15 45 Z" fill="#16A34A" />
    <path d="M 35 65 Q 20 45 40 35 Q 55 50 35 65 Z" fill="#16A34A" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onGenerate, isLoading, currentDate, history = [], onSelectBriefing }) => {
  const currentIndex = history.findIndex(item => item.date === currentDate);
  const historyCount = history.length;
  const canPrev = currentIndex !== -1 && currentIndex < historyCount - 1;
  const canNext = currentIndex > 0;

  const handlePrev = () => {
    if (canPrev) {
      onSelectBriefing(history[currentIndex + 1]);
    }
  };

  const handleNext = () => {
    if (canNext) {
      onSelectBriefing(history[currentIndex - 1]);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[80px]">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <CustomLogo />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                BRIEFING STRATÉGIQUE
              </h1>
              <p className="text-sm text-green-700 font-semibold uppercase tracking-[2px] mt-1">
                FONDATION OCP
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Carousel of historical briefings */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1 shadow-xs">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canPrev}
                className={`p-1.5 rounded-md transition-all ${
                  canPrev 
                    ? 'text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Jour précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-gray-100 rounded-md">
                <Calendar className="w-3.5 h-3.5 text-green-700 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700 capitalize max-w-[100px] sm:max-w-[180px] text-center truncate">
                  {currentDate}
                </span>
                {historyCount > 0 && currentIndex !== -1 && (
                  <span className="text-[10px] bg-green-50 text-green-800 border border-green-200/50 px-1.5 py-0.5 rounded-full font-bold">
                    {currentIndex + 1}/{historyCount}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext}
                className={`p-1.5 rounded-md transition-all ${
                  canNext 
                    ? 'text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Jour suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <NotificationManager />

            <button
              onClick={onGenerate}
              disabled={isLoading}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white shadow-md transition-all
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-900 hover:bg-gray-800 hover:shadow-lg active:transform active:scale-95'}
              `}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Analyse en cours...' : 'Générer le Briefing'}
            </button>
          </div>

        </div>
      </div>
      
      {/* Decorative Bar */}
      <div className="h-[4px] w-full flex">
        <div className="w-1/3 bg-red-600"></div>
        <div className="w-1/3 bg-[#2D6A4F]"></div>
        <div className="w-1/3 bg-yellow-500"></div>
      </div>
    </header>
  );
};

export default Header;