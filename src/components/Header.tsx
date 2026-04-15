import React from 'react';
import { Sparkles, Library, Gamepad2, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  hasWords: boolean;
  progress?: { current: number; total: number };
}

export const Header: React.FC<HeaderProps> = ({ mode, setMode, hasWords, progress }) => {
  const percentage = progress ? Math.round((progress.current / progress.total) * 100) : 0;
  const unmasteredCount = progress ? progress.total - progress.current : 0;

  return (
    <header className="h-20 bg-white border-b-4 border-border-main flex items-center justify-between px-6 shrink-0 sticky top-0 z-50 rounded-b-[32px] shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-2xl rotate-3 shadow-sm">
            <Heart className="text-white fill-white" size={24} />
          </div>
          <div className="text-2xl font-bold text-primary tracking-wide">
            小状元背单词
          </div>
        </div>
        
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setMode('input')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl text-base font-bold transition-all bubble-shadow-hover",
              mode === 'input' ? "bg-primary text-white" : "bg-white text-text-sub border-2 border-border-main"
            )}
          >
            <Sparkles size={18} />
            添加单词
          </button>
          
          {hasWords && (
            <>
              <button
                onClick={() => setMode('list')}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-2xl text-base font-bold transition-all bubble-shadow-hover",
                  mode === 'list' ? "bg-secondary text-white" : "bg-white text-text-sub border-2 border-border-main"
                )}
              >
                <Library size={18} />
                单词本
                {unmasteredCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] text-white border-2 border-white shadow-sm">
                    {unmasteredCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMode('study')}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-2xl text-base font-bold transition-all bubble-shadow-hover",
                  mode === 'study' ? "bg-accent text-white" : "bg-white text-text-sub border-2 border-border-main"
                )}
              >
                <Gamepad2 size={18} />
                开始挑战
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
          <div className="text-sm font-black text-success">
            {percentage}%
          </div>
        </div>
      )}
    </header>
  );
};
