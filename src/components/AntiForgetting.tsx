import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, RotateCcw, Volume2, CheckCircle2, Circle, Trophy, ChevronRight, AlertCircle, Smile, Frown, Star } from 'lucide-react';
import { WordEntry } from '../types';
import { cn } from '../lib/utils';
import { speak } from '../lib/speech';
import { getDuelWords, updateSRS } from '../lib/srs';

interface AntiForgettingProps {
  words: WordEntry[];
  onUpdateSRS: (word: string, srsData: Partial<WordEntry>) => void;
}

export const AntiForgetting: React.FC<AntiForgettingProps> = ({ words, onUpdateSRS }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ word: string; quality: number }[]>([]);

  // Get words that are due for review
  const dueWords = useMemo(() => getDuelWords(words), [words]);

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-4 md:p-8 shrink-0">
        <div className="w-full max-w-md bg-white rounded-[32px] md:rounded-[40px] border-2 md:border-4 border-border-main p-6 md:p-10 bubble-shadow space-y-6 md:space-y-8 text-center">
          <div className="h-16 w-16 md:h-24 md:w-24 bg-primary/20 rounded-[20px] md:rounded-[32px] flex items-center justify-center mx-auto text-primary rotate-12">
            <Brain size={32} md:size={48} />
          </div>
          <div className="space-y-2 md:space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-text-main">科学抗遗忘</h2>
            <p className="text-base md:text-lg font-bold text-text-sub">
              根据艾宾浩斯遗忘曲线，精准推送你需要复习的单词。
            </p>
          </div>

          <div className="bg-bg-main p-6 rounded-3xl border-2 border-border-main space-y-2">
            <p className="text-sm font-black text-text-sub uppercase tracking-widest">今日待复习</p>
            <p className="text-4xl font-black text-primary">{dueWords.length}</p>
          </div>
          
          <button
            onClick={() => {
              if (dueWords.length > 0) {
                setIsStarted(true);
              }
            }}
            disabled={dueWords.length === 0}
            className="w-full py-4 md:py-5 bg-primary text-white text-lg md:text-xl font-black rounded-2xl md:rounded-3xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all bubble-shadow disabled:opacity-50"
          >
            {dueWords.length > 0 ? '开始复习' : '太棒了，今日无复习'}
          </button>
        </div>
      </div>
    );
  }

  const currentWord = dueWords[currentIndex];

  const handleQualitySelect = (q: number) => {
    const srsData = updateSRS(currentWord, q);
    onUpdateSRS(currentWord.word, srsData);
    setSessionResults([...sessionResults, { word: currentWord.word, quality: q }]);

    if (currentIndex < dueWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const easyCount = sessionResults.filter(r => r.quality === 5).length;
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-4 md:p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white rounded-[32px] md:rounded-[40px] border-4 border-border-main p-6 md:p-10 bubble-shadow text-center space-y-6 md:space-y-8"
        >
          <div className="h-20 w-20 md:h-32 md:w-32 bg-success/20 rounded-[24px] md:rounded-[40px] flex items-center justify-center mx-auto text-success rotate-6">
            <Trophy size={40} md:size={64} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-black text-text-main">复习结束！</h2>
            <p className="text-lg md:text-xl font-bold text-text-sub">今日战绩</p>
            <div className="text-2xl font-black text-primary">轻松解决: {easyCount} / {dueWords.length}</div>
          </div>
          <button
            onClick={() => {
              setIsStarted(false);
              setIsFinished(false);
              setCurrentIndex(0);
              setSessionResults([]);
            }}
            className="w-full py-4 md:py-5 bg-primary text-white text-lg md:text-xl font-black rounded-2xl md:rounded-3xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all bubble-shadow"
          >
            完成
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] bg-bg-main p-4 md:p-8 overflow-hidden">
      <div className="w-full max-w-2xl space-y-6 md:space-y-10">
        <div className="flex items-center justify-between px-3 md:px-4 bg-white p-3 md:p-4 rounded-[24px] md:rounded-[32px] border-2 md:border-4 border-border-main shadow-sm">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary p-1 md:p-1.5 rounded-lg">
              <Brain className="text-white" size={14} md:size={18} />
            </div>
            <span className="text-sm md:text-lg font-bold text-text-main">抗遗忘挑战</span>
            <span className="text-sm md:text-lg font-black text-primary">{currentIndex + 1} / {dueWords.length}</span>
          </div>
          <button
            onClick={() => setIsStarted(false)}
            className="text-xs md:text-sm font-black text-text-sub hover:text-primary transition-colors"
          >
            退出
          </button>
        </div>

        <div className="perspective-1000 relative h-[320px] xs:h-[400px] md:h-[480px] w-full cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center rounded-[40px] md:rounded-[60px] p-6 md:p-12 text-center border-4 md:border-8 transition-all bubble-shadow",
                isFlipped ? "bg-primary text-white border-white" : "bg-white text-text-main border-border-main"
              )}
            >
              {!isFlipped ? (
                <div className="space-y-4 md:space-y-8">
                  <h3 className="text-5xl md:text-8xl font-black tracking-tighter drop-shadow-sm break-all leading-tight px-4 text-primary">
                    {currentWord.word}
                  </h3>
                  <p className="text-lg md:text-2xl text-text-sub font-bold">{currentWord.phonetic}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(currentWord.word);
                    }}
                    className="mx-auto flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/10 text-primary border-2 md:border-4 border-primary/20"
                  >
                    <Volume2 size={32} md:size={40} />
                  </button>
                  <div className="bg-bg-main px-4 md:px-6 py-1.5 md:py-2 rounded-full border-2 border-border-main inline-block">
                    <p className="text-[10px] md:text-sm font-black text-text-sub uppercase tracking-widest animate-pulse">点击查看详情</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8 w-full text-center px-4">
                  <div className="space-y-2 md:space-y-4">
                    <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] opacity-70">中文意思</p>
                    <h3 className="text-3xl md:text-6xl font-bold leading-tight">{currentWord.translation}</h3>
                  </div>
                  <div className="h-1 md:h-2 bg-white/20 rounded-full w-16 md:w-24 mx-auto" />
                  <div className="space-y-2 md:space-y-4">
                    <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] opacity-70">英文解释</p>
                    <p className="text-base md:text-2xl leading-relaxed font-bold line-clamp-3">{currentWord.definition}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {isFlipped && (
          <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6 md:mt-10">
            <button
              onClick={() => handleQualitySelect(1)}
              className="flex flex-col items-center gap-2 p-4 md:p-6 bg-white rounded-3xl border-4 border-border-main hover:border-red-500 hover:bg-red-50 transition-all bubble-shadow group"
            >
              <Frown className="text-text-sub group-hover:text-red-500" size={32} />
              <span className="font-black text-sm md:text-base text-text-sub group-hover:text-red-500">记不住</span>
            </button>
            <button
              onClick={() => handleQualitySelect(3)}
              className="flex flex-col items-center gap-2 p-4 md:p-6 bg-white rounded-3xl border-4 border-border-main hover:border-yellow-500 hover:bg-yellow-50 transition-all bubble-shadow group"
            >
              <Smile className="text-text-sub group-hover:text-yellow-500" size={32} />
              <span className="font-black text-sm md:text-base text-text-sub group-hover:text-yellow-500">有点难</span>
            </button>
            <button
              onClick={() => handleQualitySelect(5)}
              className="flex flex-col items-center gap-2 p-4 md:p-6 bg-white rounded-3xl border-4 border-border-main hover:border-success hover:bg-success/10 transition-all bubble-shadow group"
            >
              <Star className="text-text-sub group-hover:text-success" size={32} />
              <span className="font-black text-sm md:text-base text-text-sub group-hover:text-success">太简单</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
