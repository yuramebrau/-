import React, { useState } from 'react';
import { Volume2, Star, CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WordEntry } from '../types';
import { cn } from '../lib/utils';

interface WordCardProps {
  entry: WordEntry;
  onToggleMastered: (word: string) => void;
  speak: (text: string) => void;
}

interface WordListProps {
  words: WordEntry[];
  onToggleMastered: (word: string) => void;
}

const WordCard: React.FC<WordCardProps> = ({ entry, onToggleMastered, speak }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-[40px] border-4 p-8 bubble-shadow transition-all",
        entry.mastered 
          ? "border-success/30 bg-success/5 opacity-80" 
          : "border-border-main bg-white hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <h3 className={cn(
              "text-4xl font-black tracking-tight",
              entry.mastered ? "text-success" : "text-primary"
            )}>{entry.word}</h3>
            <button
              onClick={() => speak(entry.word)}
              className={cn(
                "rounded-full p-3 transition-all",
                entry.mastered 
                  ? "bg-success/10 text-success hover:bg-success hover:text-white"
                  : "bg-secondary/10 text-secondary hover:bg-secondary hover:text-white"
              )}
            >
              <Volume2 size={24} />
            </button>
          </div>
          <p className="text-xl text-text-sub font-bold">{entry.phonetic}</p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <button
            onClick={() => onToggleMastered(entry.word)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm transition-all bubble-shadow",
              entry.mastered 
                ? "bg-success text-white" 
                : "bg-white text-text-sub border-2 border-border-main hover:border-success hover:text-success"
            )}
          >
            {entry.mastered ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            {entry.mastered ? '已掌握' : '标记掌握'}
          </button>
          <p className={cn(
            "text-3xl font-bold",
            entry.mastered ? "text-success/70" : "text-success"
          )}>{entry.translation}</p>
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
            <div className="space-y-6 pt-6 border-t-4 border-bg-main mt-2">
              <div className="space-y-2">
                <span className="inline-block px-4 py-1 bg-accent/20 rounded-full text-xs font-black text-text-sub uppercase tracking-widest">英文解释</span>
                <p className="text-lg leading-relaxed text-text-main font-bold">
                  {entry.definition}
                </p>
              </div>
              
              <div className="rounded-[32px] bg-bg-main border-4 border-border-main p-8 relative overflow-hidden group/example">
                <div className={cn(
                  "absolute top-0 left-0 w-2 h-full",
                  entry.mastered ? "bg-success" : "bg-accent"
                )} />
                <div className="flex justify-between items-start gap-4">
                  <p className="text-xl italic text-text-main leading-relaxed font-bold flex-1">"{entry.example}"</p>
                  <button
                    onClick={() => speak(entry.example)}
                    className="shrink-0 rounded-full p-2 bg-white border-2 border-border-main text-text-sub hover:text-primary hover:border-primary transition-all bubble-shadow-hover"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
                <p className="mt-3 text-base text-text-sub font-black">{entry.exampleTranslation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const WordList: React.FC<WordListProps> = ({ words, onToggleMastered }) => {
  const [showOnlyUnmastered, setShowOnlyUnmastered] = React.useState(false);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  };

  const unmasteredWords = words.filter(w => !w.mastered);
  const masteredWords = words.filter(w => w.mastered);

  return (
    <div className="mx-auto max-w-4xl space-y-16 py-12 px-6">
      <div className="flex items-center justify-between border-b-4 border-border-main pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl rotate-12">
            <Star className="text-white fill-white" size={24} />
          </div>
          <h2 className="text-4xl font-bold text-text-main tracking-wide">宝贝的单词本</h2>
        </div>
        <button
          onClick={() => setShowOnlyUnmastered(!showOnlyUnmastered)}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all bubble-shadow",
            showOnlyUnmastered 
              ? "bg-red-500 text-white" 
              : "bg-white text-text-sub border-2 border-border-main hover:border-red-500 hover:text-red-500"
          )}
        >
          {showOnlyUnmastered ? '显示全部' : '只看未掌握'}
        </button>
      </div>

      {/* Unmastered Section */}
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <h3 className="text-2xl font-black text-text-main">待复习 ({unmasteredWords.length})</h3>
        </div>

        {unmasteredWords.length > 0 ? (
          <div className="grid gap-8">
            {unmasteredWords.map((entry, index) => (
              <WordCard 
                key={index} 
                entry={entry} 
                onToggleMastered={onToggleMastered} 
                speak={speak} 
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
            {masteredWords.map((entry, index) => (
              <WordCard 
                key={index} 
                entry={entry} 
                onToggleMastered={onToggleMastered} 
                speak={speak} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
