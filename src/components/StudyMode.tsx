import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, Eye, EyeOff, Trophy, CheckCircle2, Circle, Gamepad2 } from 'lucide-react';
import { WordEntry } from '../types';
import { cn } from '../lib/utils';

interface StudyModeProps {
  words: WordEntry[];
  onToggleMastered: (word: string) => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({ words, onToggleMastered }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [studyFilter, setStudyFilter] = useState<'all' | 'unmastered'>('unmastered');
  const [isStarted, setIsStarted] = useState(false);

  const unmasteredWords = words.filter(w => !w.mastered);
  const studyWords = studyFilter === 'unmastered' ? unmasteredWords : words;
  
  const currentWord = studyWords[currentIndex];

  const nextWord = () => {
    setIsFlipped(false);
    setShowDetails(false);
    setCurrentIndex((prev) => (prev + 1) % studyWords.length);
  };

  const prevWord = () => {
    setIsFlipped(false);
    setShowDetails(false);
    setCurrentIndex((prev) => (prev - 1 + studyWords.length) % studyWords.length);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-8">
        <div className="w-full max-w-md bg-white rounded-[40px] border-4 border-border-main p-10 bubble-shadow space-y-8 text-center">
          <div className="h-24 w-24 bg-accent/20 rounded-[32px] flex items-center justify-center mx-auto text-accent rotate-12">
            <Gamepad2 size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-text-main">准备好挑战了吗？</h2>
            <p className="text-lg font-bold text-text-sub">选择您想要复习的范围：</p>
          </div>
          
          <div className="grid gap-4">
            <button
              onClick={() => setStudyFilter('unmastered')}
              className={cn(
                "flex items-center justify-between px-6 py-4 rounded-2xl border-4 transition-all",
                studyFilter === 'unmastered' ? "border-primary bg-primary/5" : "border-border-main bg-white"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                  {studyFilter === 'unmastered' && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span className="text-lg font-black text-text-main">只看未掌握 ({unmasteredWords.length})</span>
              </div>
            </button>
            <button
              onClick={() => setStudyFilter('all')}
              className={cn(
                "flex items-center justify-between px-6 py-4 rounded-2xl border-4 transition-all",
                studyFilter === 'all' ? "border-secondary bg-secondary/5" : "border-border-main bg-white"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full border-2 border-secondary flex items-center justify-center">
                  {studyFilter === 'all' && <div className="h-2 w-2 rounded-full bg-secondary" />}
                </div>
                <span className="text-lg font-black text-text-main">查看全部单词 ({words.length})</span>
              </div>
            </button>
          </div>

          <button
            onClick={() => setIsStarted(true)}
            disabled={studyFilter === 'unmastered' && unmasteredWords.length === 0}
            className="w-full py-5 bg-primary text-white text-xl font-black rounded-3xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all bubble-shadow disabled:opacity-50"
          >
            开始学习
          </button>
        </div>
      </div>
    );
  }

  if (studyWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-8">
        <div className="text-center space-y-6">
          <div className="h-32 w-32 rounded-[40px] bg-white border-4 border-border-main flex items-center justify-center text-success rotate-6 bubble-shadow mx-auto">
            <Trophy size={64} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-text-main">太棒了！</h2>
            <p className="text-xl font-bold text-text-sub">您已经掌握了所有单词！</p>
          </div>
          <button
            onClick={() => setIsStarted(false)}
            className="px-12 py-5 bg-primary text-white text-xl font-black rounded-3xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all bubble-shadow"
          >
            返回选择
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-8">
      <div className="w-full max-w-2xl space-y-10">
        {/* Progress Info */}
        <div className="flex items-center justify-between px-4 bg-white p-4 rounded-[32px] border-4 border-border-main shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-success p-1.5 rounded-lg">
              <Trophy className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-text-main">
              {studyFilter === 'unmastered' ? '复习未掌握' : '全部挑战'}
            </span>
            <span className="text-lg font-black text-primary">{currentIndex + 1} / {studyWords.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsStarted(false)}
              className="text-sm font-black text-text-sub hover:text-primary transition-colors"
            >
              退出
            </button>
            <div className="h-4 w-px bg-border-main" />
            <button
              onClick={() => setCurrentIndex(0)}
              className="flex items-center gap-2 text-sm font-black text-text-sub hover:text-primary transition-colors"
            >
              <RotateCcw size={16} />
              重来
            </button>
          </div>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 relative h-[480px] w-full cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center rounded-[60px] p-12 text-center border-8 transition-all bubble-shadow",
                isFlipped 
                  ? (currentWord.mastered ? "bg-success text-white border-white" : "bg-primary text-white border-white")
                  : "bg-white text-text-main border-border-main"
              )}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMastered(currentWord.word);
                }}
                className={cn(
                  "absolute top-8 right-8 flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm transition-all bubble-shadow",
                  currentWord.mastered 
                    ? "bg-white text-success" 
                    : (isFlipped ? "bg-white/20 text-white border-2 border-white/50" : "bg-bg-main text-text-sub border-2 border-border-main")
                )}
              >
                {currentWord.mastered ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                {currentWord.mastered ? '已掌握' : '标记掌握'}
              </button>

              {!isFlipped ? (
                <div className="space-y-8">
                  <h3 className={cn(
                    "text-8xl font-black tracking-tighter drop-shadow-sm",
                    currentWord.mastered ? "text-success" : "text-primary"
                  )}>{currentWord.word}</h3>
                  <p className="text-2xl text-text-sub font-bold">{currentWord.phonetic}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(currentWord.word);
                    }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform hover:scale-110 border-4 border-primary/20"
                  >
                    <Volume2 size={40} />
                  </button>
                  <div className="bg-bg-main px-6 py-2 rounded-full border-2 border-border-main inline-block">
                    <p className="text-sm font-black text-text-sub uppercase tracking-widest animate-pulse">点我翻面看答案哦</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-10 w-full text-center">
                  <div className="space-y-4">
                    <p className="text-sm font-black uppercase tracking-[0.3em] opacity-70">中文意思</p>
                    <h3 className="text-6xl font-bold leading-tight">{currentWord.translation}</h3>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full w-24 mx-auto" />
                  
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <p className="text-sm font-black uppercase tracking-[0.3em] opacity-70">英文解释</p>
                        <p className="text-2xl leading-relaxed font-bold">{currentWord.definition}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!showDetails && (
                    <p className="text-sm font-black opacity-50 italic">点击下方按钮查看详情</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Details Section (Explanation & Example) */}
        <div className="space-y-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-center gap-3 rounded-[32px] border-4 border-border-main bg-white py-5 text-xl font-black text-text-sub shadow-sm transition-all hover:border-primary/50 hover:text-primary bubble-shadow"
          >
            {showDetails ? <EyeOff size={24} /> : <Eye size={24} />}
            {showDetails ? '隐藏详情' : '查看详情 (解释与造句)'}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                className="overflow-hidden rounded-[40px] bg-white border-4 border-border-main p-10 shadow-inner relative"
              >
                <div className="absolute top-0 left-0 w-full h-4 bg-accent/30" />
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-4 py-1 bg-accent/10 rounded-full text-xs font-black text-text-sub uppercase tracking-widest">造句示例</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(currentWord.example);
                        }}
                        className="rounded-full p-2 bg-bg-main border-2 border-border-main text-text-sub hover:text-primary hover:border-primary transition-all"
                      >
                        <Volume2 size={20} />
                      </button>
                    </div>
                    <p className="text-2xl italic text-text-main leading-relaxed font-bold">"{currentWord.example}"</p>
                    <p className="mt-4 text-lg text-text-sub font-black">{currentWord.exampleTranslation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-12 pt-4">
          <button
            onClick={prevWord}
            className="flex h-20 w-20 items-center justify-center rounded-[32px] bg-white text-text-sub border-4 border-border-main transition-all hover:border-secondary hover:text-secondary active:scale-95 bubble-shadow"
          >
            <ChevronLeft size={40} />
          </button>
          
          <div className="h-16 w-2 rounded-full bg-border-main" />

          <button
            onClick={nextWord}
            className="flex h-20 w-20 items-center justify-center rounded-[32px] bg-primary text-white border-4 border-white transition-all hover:opacity-90 active:scale-95 bubble-shadow"
          >
            <ChevronRight size={40} />
          </button>
        </div>
      </div>
    </div>
  );
};
