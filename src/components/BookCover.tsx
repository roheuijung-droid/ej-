import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  title: string;
  author: string;
  category?: string;
  coverImage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  'IT/프로그래밍': { bg: 'from-slate-900 to-blue-950', text: 'text-blue-200', accent: 'bg-blue-500' },
  'IT/AI': { bg: 'from-indigo-950 to-slate-900', text: 'text-indigo-200', accent: 'bg-indigo-400' },
  'IT/웹개발': { bg: 'from-cyan-950 to-slate-900', text: 'text-cyan-200', accent: 'bg-cyan-400' },
  '인문/교양': { bg: 'from-amber-950 to-stone-900', text: 'text-amber-200', accent: 'bg-amber-500' },
  '인문/역사': { bg: 'from-stone-900 to-neutral-950', text: 'text-stone-300', accent: 'bg-stone-400' },
  '자연과학': { bg: 'from-emerald-950 to-slate-900', text: 'text-emerald-200', accent: 'bg-emerald-400' },
  '문학/소설': { bg: 'from-purple-950 to-slate-900', text: 'text-purple-200', accent: 'bg-purple-400' },
  '사회/경영': { bg: 'from-blue-950 to-slate-900', text: 'text-sky-200', accent: 'bg-sky-400' },
};

export const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  category = '기타',
  coverImage,
  className = '',
  size = 'md',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const theme = CATEGORY_COLORS[category] || {
    bg: 'from-slate-800 to-slate-950',
    text: 'text-slate-300',
    accent: 'bg-blue-500',
  };

  const sizeClasses = {
    sm: 'w-16 h-22 text-[10px]',
    md: 'w-24 h-32 sm:w-28 sm:h-38 text-xs',
    lg: 'w-36 h-48 sm:w-44 sm:h-60 text-sm',
  }[size];

  if (coverImage && !imageFailed) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-md shadow-md border border-slate-200/80 aspect-[3/4] ${sizeClasses} ${className}`}
      >
        <img
          src={coverImage}
          alt={`${title} 도서 표지`}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover select-none transition-transform duration-300 hover:scale-105"
        />
        {/* Subtle spine shadow on the left */}
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Beautiful fallback typographic book jacket
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-md shadow-md border border-slate-700/30 aspect-[3/4] bg-gradient-to-br ${theme.bg} p-2.5 flex flex-col justify-between text-white select-none ${sizeClasses} ${className}`}
    >
      {/* Spine highlight & shadow */}
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-2 w-px bg-white/10 pointer-events-none" />

      {/* Category kicker */}
      <div className="flex items-center gap-1 z-10 pl-1">
        <div className={`w-1.5 h-1.5 rounded-full ${theme.accent}`} />
        <span className={`text-[9px] font-semibold tracking-wider uppercase truncate ${theme.text}`}>
          {category}
        </span>
      </div>

      {/* Book Title */}
      <div className="z-10 pl-1 my-auto">
        <h4 className="font-bold leading-tight line-clamp-3 text-white drop-shadow-xs">
          {title}
        </h4>
      </div>

      {/* Author & Footer */}
      <div className="z-10 pl-1 pt-1 border-t border-white/15 flex items-center justify-between text-[9px] text-slate-300">
        <span className="truncate max-w-[80%] font-medium">{author}</span>
        <BookOpen className="w-2.5 h-2.5 opacity-60 shrink-0" />
      </div>
    </div>
  );
};
