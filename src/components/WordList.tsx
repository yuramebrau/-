import React, { useState } from 'react';
import { Volume2, Star, CheckCircle2, Circle, ChevronDown, Trash2, CheckSquare, Square, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WordEntry } from '../types';
import { cn } from '../lib/utils';
import { speak } from '../lib/speech';

interface WordCardProps {
  entry: WordEntry;
  onToggleMastered: (word: string) => void;
  onDelete: (word: string) => void;
  speak: (text: string) => void;
  isSelected: boolean;
  onSelect: (word: string) => void;
}

interface WordListProps {
  words: WordEntry[];
  onToggleMastered: (word: string) => void;
  onDeleteWord: (word: string) => void;
  onDeleteWords: (words: string[]) => void;
}

const WordCard: React.FC<WordCardProps> = ({ entry, onToggleMastered, onDelete, speak, isSelected, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-[32px] md:rounded-[40px] border-2 md:border-4 p-4 md:p-8 bubble-shadow transition-all",
        entry.mastered 
          ? "border-success/30 bg-success/5 opacity-80" 
          : isSelected 
            ? "border-primary bg-primary/5" 
            : "border-border-main bg-white hover:border-primary/50"
      )}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 md:gap-0">
        <div className="flex items-start gap-3 md:gap-6 w-full sm:w-auto">
          <button
            onClick={() => onSelect(entry.word)}
            className={cn(
              "mt-1 md:mt-2 shrink-0 rounded-xl transition-all",
              isSelected ? "text-primary" : "text-text-sub/20 hover:text-primary/40"
            )}
          >
            {isSelected ? <CheckSquare size={24} md:size={32} /> : <Square size={24} md:size={32} />}
          </button>
          
          <div className="space-y-1 md:space-y-3 grow">
            <div className="flex items-center gap-2 md:gap-4">
              <h3 className={cn(
                "text-2xl md:text-4xl font-black tracking-tight",
                entry.mastered ? "text-text-main" : "text-primary"
              )}>{entry.word}</h3>
              <button
                onClick={() => speak(entry.word)}
                className={cn(
                  "rounded-full p-2 md:p-3 transition-all",
                  entry.mastered 
                    ? "bg-success/10 text-text-main hover:bg-success hover:text-white"
                    : "bg-secondary/10 text-secondary hover:bg-secondary hover:text-white"
                )}
              >
                <Volume2 size={20} md:size={24} />
              </button>
            </div>
            <p className="text-base md:text-xl text-text-sub font-bold">{entry.phonetic}</p>
            {entry.nextReviewDate && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-black text-primary/70">
                  {new Date(entry.nextReviewDate).toLocaleDateString() === new Date().toLocaleDateString() 
                    ? "今日待复习" 
                    : `下次复习: ${new Date(entry.nextReviewDate).getMonth() + 1}月${new Date(entry.nextReviewDate).getDate()}日`}
                </span>
                {entry.addedDate && (
                  <span className="text-[10px] bg-bg-main px-2 py-0.5 rounded-full border border-border-main text-text-sub">
                    学习于: {new Date(entry.addedDate).toLocaleDateString()}
                  </span>
                )}
                {entry.repetitionCount !== undefined && entry.repetitionCount > 0 && (
                  <span className="text-[10px] bg-bg-main px-2 py-0.5 rounded-full border border-border-main text-text-sub">
                    已复习 {entry.repetitionCount} 次
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 md:gap-4">
          <p className={cn(
            "text-xl md:text-3xl font-bold order-1 sm:order-2",
            entry.mastered ? "text-text-main/70" : "text-text-main"
          )}>{entry.translation}</p>
          <div className="flex items-center gap-1 md:gap-2 order-2 sm:order-1">
            <button
              onClick={() => onDelete(entry.word)}
              className="p-1.5 md:p-2 rounded-xl text-text-sub/40 hover:text-red-500 hover:bg-red-50 transition-all"
              title="删除单词"
            >
              <Trash2 size={18} md:size={20} />
            </button>
            <button
              onClick={() => onToggleMastered(entry.word)}
              className={cn(
                "flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all bubble-shadow",
                entry.mastered 
                  ? "bg-success text-white" 
                  : "bg-white text-text-sub border-2 border-border-main hover:border-text-main hover:text-text-main"
              )}
            >
              {entry.mastered ? <CheckCircle2 size={16} md:size={18} /> : <Circle size={16} md:size={18} />}
              <span>{entry.mastered ? '已掌握' : '掌握'}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-black text-text-sub/60 hover:text-primary transition-colors py-2 px-4 rounded-xl hover:bg-bg-main"
        >
          <span>{isExpanded ? '收起详情' : '查看详情 (解释与造句)'}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 md:space-y-6 pt-4 md:pt-6 border-t-2 md:border-t-4 border-bg-main mt-2">
              <div className="space-y-1 md:space-y-2">
                <span className="inline-block px-3 md:px-4 py-0.5 md:py-1 bg-accent/20 rounded-full text-[10px] md:text-xs font-black text-text-sub uppercase tracking-widest">英文解释</span>
                <p className="text-base md:text-lg leading-relaxed text-text-main font-bold">
                  {entry.definition}
                </p>
              </div>
              
              <div className="rounded-[24px] md:rounded-[32px] bg-bg-main border-2 md:border-4 border-border-main p-4 md:p-8 relative overflow-hidden group/example">
                <div className={cn(
                  "absolute top-0 left-0 w-1.5 md:w-2 h-full",
                  entry.mastered ? "bg-success" : "bg-accent"
                )} />
                <div className="flex justify-between items-start gap-2 md:gap-4">
                  <p className="text-base md:text-xl italic text-text-main leading-relaxed font-bold flex-1">"{entry.example}"</p>
                  <button
                    onClick={() => speak(entry.example)}
                    className="shrink-0 rounded-full p-2 bg-white border-2 border-border-main text-text-sub hover:text-primary hover:border-primary transition-all bubble-shadow-hover"
                  >
                    <Volume2 size={16} md:size={18} />
                  </button>
                </div>
                <p className="mt-2 md:mt-3 text-sm md:text-base text-text-sub font-black">{entry.exampleTranslation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const WordList: React.FC<WordListProps> = ({ words, onToggleMastered, onDeleteWord, onDeleteWords }) => {
  const [showOnlyUnmastered, setShowOnlyUnmastered] = React.useState(false);
  const [selectedWords, setSelectedWords] = React.useState<string[]>([]);

  const unmasteredWords = words.filter(w => !w.mastered);
  const masteredWords = words.filter(w => w.mastered);
  const visibleWords = showOnlyUnmastered ? unmasteredWords : words;

  const toggleSelect = (word: string) => {
    setSelectedWords(prev => 
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  const handleSelectAll = () => {
    if (selectedWords.length === visibleWords.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords(visibleWords.map(w => w.word));
    }
  };

  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);

  const handleBulkDelete = () => {
    if (selectedWords.length === 0) return;
    
    if (!isBulkDeleting) {
      setIsBulkDeleting(true);
      // Auto-cancel if not clicked for 3 seconds
      setTimeout(() => setIsBulkDeleting(false), 3000);
      return;
    }

    onDeleteWords([...selectedWords]);
    setSelectedWords([]);
    setIsBulkDeleting(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 md:space-y-16 py-6 md:py-12 px-4 md:px-6">
      {/* Sticky Selection Bar */}
      <AnimatePresence>
        {selectedWords.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 sm:bottom-10 left-0 sm:left-1/2 sm:-translate-x-1/2 z-50 w-full sm:max-w-2xl px-0 sm:px-6"
          >
            <div className="bg-text-main text-white sm:rounded-3xl p-3 md:p-4 shadow-2xl flex items-center justify-between bubble-shadow sm:border-4 border-white/10">
              <div className="flex items-center gap-3 md:gap-6 pl-2">
                <button 
                  onClick={() => setSelectedWords([])}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} md:size={20} />
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-sm font-black opacity-60 uppercase tracking-widest">已选择</span>
                  <span className="text-base md:text-xl font-black">{selectedWords.length} 个单词</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={handleSelectAll}
                  className="px-3 md:px-6 py-2 md:py-3 font-black text-xs md:text-sm hover:bg-white/10 rounded-xl md:rounded-2xl transition-colors"
                >
                  {selectedWords.length === visibleWords.length ? '取消' : '全选'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className={cn(
                    "flex items-center gap-1 md:gap-2 px-4 md:pl-6 md:pr-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all bubble-shadow",
                    isBulkDeleting ? "bg-amber-500 text-white animate-pulse" : "bg-red-500 text-white hover:bg-red-600"
                  )}
                >
                  <Trash2 size={16} md:size={20} />
                  <span>{isBulkDeleting ? '确定？' : '批量删除'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between border-b-2 md:border-b-4 border-border-main pb-4 md:pb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-primary p-1.5 md:p-2 rounded-lg md:rounded-xl rotate-12">
            <Star className="text-white fill-white" size={18} md:size={24} />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-text-main tracking-wide">单词本</h2>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowOnlyUnmastered(!showOnlyUnmastered)}
            className={cn(
              "flex items-center gap-1 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all bubble-shadow",
              showOnlyUnmastered 
                ? "bg-red-500 text-white" 
                : "bg-white text-text-sub border-2 border-border-main hover:border-red-500 hover:text-red-500"
            )}
          >
            {showOnlyUnmastered ? '全部' : '只看未学'}
          </button>
        </div>
      </div>

      {/* Unmastered Section */}
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <h3 className="text-2xl font-black text-text-main">待复习 ({unmasteredWords.length})</h3>
        </div>

        {unmasteredWords.length > 0 ? (
          <div className="grid gap-8">
            {unmasteredWords.map((entry) => (
              <WordCard 
                key={entry.word} 
                entry={entry} 
                onToggleMastered={onToggleMastered} 
                onDelete={onDeleteWord} 
                speak={speak} 
                isSelected={selectedWords.includes(entry.word)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-[40px] border-4 border-dashed border-border-main">
            <p className="text-2xl font-bold text-text-sub">太棒了！所有单词都掌握啦 🎉</p>
          </div>
        )}
      </div>

      {/* Mastered Section */}
      {!showOnlyUnmastered && masteredWords.length > 0 && (
        <div className="space-y-10">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-success" />
            <h3 className="text-2xl font-black text-text-main">已掌握 ({masteredWords.length})</h3>
          </div>

          <div className="grid gap-8">
            {masteredWords.map((entry) => (
              <WordCard 
                key={entry.word} 
                entry={entry} 
                onToggleMastered={onToggleMastered} 
                onDelete={onDeleteWord} 
                speak={speak} 
                isSelected={selectedWords.includes(entry.word)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
