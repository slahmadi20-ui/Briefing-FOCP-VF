
import React from 'react';
import { VideoOfTheDay as VideoInfo } from '../types';
import { Film, ExternalLink } from 'lucide-react';
import GenerativeImage from './GenerativeImage';
import SourceLink from './SourceLink';

interface VideoOfTheDayProps {
  videoInfo: VideoInfo;
}

// Liste des IDs YouTube connus pour être des "Rickrolls" ou des placeholders musicaux fréquents
const BLOCKED_VIDEO_IDS = [
    'dQw4w9WgXcQ', // Never Gonna Give You Up
    'oHg5SJYRHA0', // Another version
    'cvh0nX08nRw', // Another version
    'j5a0jTc9S10', // Another version
];

const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // Regex to capture video ID from various YouTube URL formats
    const youtubeRegex = /(?:v=|vi\/|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    
    if (!match || !match[1]) {
        return null;
    }

    const videoId = match[1];

    if (BLOCKED_VIDEO_IDS.includes(videoId)) {
        return null;
    }

    // Use the privacy-enhanced mode URL to prevent common embedding issues.
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

const VideoOfTheDay: React.FC<VideoOfTheDayProps> = ({ videoInfo }) => {
  if (!videoInfo) return null;
  
  const { videoUrl, title, commentary, reference, posterImagePrompt } = videoInfo;
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div className="mb-8 animate-fade-in bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2 uppercase tracking-wider">
            <Film className="w-5 h-5 text-green-700" />
            La Vidéo du Jour
        </h2>
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm">
            {embedUrl ? (
                <div className="aspect-video bg-black">
                    <iframe
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                    ></iframe>
                </div>
            ) : (
                <div className="aspect-video w-full bg-gray-100 relative">
                    {/* Fallback : Générer une image représentative si la vidéo manque */}
                    <GenerativeImage 
                        alt={title}
                        prompt={posterImagePrompt || `A cinematic thumbnail image representing: ${title}. Corporate, industrial or economic context in Africa.`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 pointer-events-none mix-blend-multiply"></div>
                </div>
            )}
            <div className="p-6 flex flex-col flex-grow bg-white">
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-4">{title}</h3>
                    <div className="bg-gray-50 border-l-2 border-green-700 p-4 rounded-r-md shadow-sm">
                        <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Analyse</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{commentary}</p>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center">
                     <SourceLink title={reference.title || title} source={reference.source} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default VideoOfTheDay;
