
import React from 'react';
import { ImageOfTheDay as ImageInfo } from '../types';
import { Camera, ExternalLink } from 'lucide-react';
import GenerativeImage from './GenerativeImage';
import SourceLink from './SourceLink';

interface ImageOfTheDayProps {
  imageInfo: ImageInfo;
}

const ImageOfTheDay: React.FC<ImageOfTheDayProps> = ({ imageInfo }) => {
  if (!imageInfo) return null;
  
  const { imageUrl, commentary, reference } = imageInfo;

  return (
    <div className="mb-8 animate-fade-in bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2 uppercase tracking-wider">
            <Camera className="w-5 h-5 text-green-700" />
            L'Image du Jour
        </h2>
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm">
            <div className="w-full flex-shrink-0 bg-gray-100 aspect-video relative">
                <GenerativeImage 
                    src={imageUrl}
                    alt={reference.title || "Image de l'actualité"}
                    prompt={`News photography showing: ${reference.title}. Context: ${commentary}`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/5 pointer-events-none mix-blend-multiply"></div>
            </div>
            <div className="p-6 flex flex-col flex-grow bg-white">
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-4">{reference.title}</h3>
                    
                    <div className="bg-gray-50 border-l-2 border-green-700 p-4 rounded-r-md shadow-sm mb-6">
                        <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Analyse</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{commentary}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200 flex items-center">
                        <SourceLink title={reference.title} source={reference.source} />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ImageOfTheDay;
