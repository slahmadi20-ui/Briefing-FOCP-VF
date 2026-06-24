import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SourceLinkProps {
  title: string;
  source: string;
  className?: string;
  url?: string;
}

const SourceLink: React.FC<SourceLinkProps> = ({ title, source, className = '', url }) => {
  if (!source) return null;
  const href = url || `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + source)}`;
  
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors ${className}`}
    >
      <ExternalLink className="w-3 h-3 min-w-[12px]" />
      <span className="truncate max-w-[200px]" title={`Source: ${source}`}>Source : {source}</span>
    </a>
  );
};

export default SourceLink;
