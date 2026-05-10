import React from 'react';
import { Sparkles, Library, Gamepad2, Heart, Brain } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppMode, WordEntry } from '../types';
import { getDuelWords } from '../lib/srs';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  hasWords: boolean;
  progress?: { current: number; total: number };
  words?: WordEntry[];
}

export const Header: React.FC<HeaderProps> = ({ mode, setMode, hasWords, progress, words = [] }) => {
  const percentage = progress ? Math.round((progress.current / progress.total) * 100) : 0;
  const unmasteredCount = progress ? progress.total - progress.current : 0;
  
  const dueCount = React.useMemo(() => getDuelWords(words).length, [words]);

  return (
    <header className="h-16 md:h-20 bg-white border-b-2 md:border-b-4 border-border-main flex items-center justify-between px-3 md:px-6 shrink-0 sticky top-0 z-50 rounded-b-[24px] md:rounded-b-[32px] shadow-sm">
      <div className="flex items-center gap-2 md:gap-6 w-full md:w-auto">
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <div className="bg-primary p-1.5 md:p-2 rounded-xl md:rounded-2xl rotate-3 shadow-sm">
            <Heart className="text-white fill-white" size={18} md:size={24} />
          </div>
          <div className="text-lg md:text-2xl font-bold text-primary tracking-wide hidden sm:block">
            小状元背单词
          </div>
        </div>
        
        <nav className="flex items-center gap-1 md:gap-2 grow md:grow-0 justify-center md:justify-start">
          <button
            onClick={() => setMode('input')}
            className={cn(
              "flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all bubble-shadow-hover shrink-0",
              mode === 'input' ? "bg-primary text-white" : "bg-white text-text-sub border-2 border-border-main"
            )}
          >
            <Sparkles size={16} md:size={18} />
            <span className="hidden xs:inline">添加</span>
            <span className="xs:hidden">添加</span>
          </button>
          
          {hasWords && (
            <>
              <button
                onClick={() => setMode('list')}
                className={cn(
                  "relative flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all bubble-shadow-hover shrink-0",
                  mode === 'list' ? "bg-secondary text-white" : "bg-white text-text-sub border-2 border-border-main"
                )}
              >
                <Library size={16} md:size={18} />
                <span className="hidden xs:inline">单词本</span>
                <span className="xs:hidden">库</span>
                {unmasteredCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[8px] md:text-[10px] text-white border-2 border-white shadow-sm">
                    {unmasteredCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMode('review')}
                className={cn(
                  "relative flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all bubble-shadow-hover shrink-0",
                  mode === 'review' ? "bg-primary text-white" : "bg-white text-text-sub border-2 border-border-main"
                )}
              >
                <Brain size={16} md:size={18} />
                <span className="hidden xs:inline">抗遗忘</span>
                <span className="xs:hidden">复习</span>
                {dueCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[8px] md:text-[10px] text-white border-2 border-white shadow-sm">
                    {dueCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMode('study')}
                className={cn(
                  "relative flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all bubble-shadow-hover shrink-0",
                  mode === 'study' ? "bg-accent text-white" : "bg-white text-text-sub border-2 border-border-main"
                )}
              >
                <Gamepad2 size={16} md:size={18} />
                <span className="hidden xs:inline">挑战</span>
                <span className="xs:hidden">挑战</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {hasWords && progress && (
        <div className="hidden lg:flex items-center gap-4 bg-bg-main p-3 rounded-3xl border-2 border-border-main">
          <div className="text-sm text-text-sub font-bold">
            学习进度 {progress.current}/{progress.total}
          </div>
          <div className="w-[150px] h-4 bg-white rounded-full border-2 border-border-main overflow-hidden p-0.5">
            <div 
              className="h-full bg-success rounded-full transition-all duration-500" 
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-sm font-black text-text-main">
            {percentage}%
          </div>
        </div>
      )}
    </header>
  );
};
