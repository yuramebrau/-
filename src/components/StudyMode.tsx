import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, Eye, EyeOff, Trophy, CheckCircle2, Circle, Gamepad2, Brain, Check, X, Keyboard, Send } from 'lucide-react';
import { WordEntry } from '../types';
import { cn } from '../lib/utils';

interface QuizQuestion {
  type: 'translation' | 'definition' | 'example';
  question: string;
  correctAnswer: string;
  options: string[];
  word: WordEntry;
}

interface StudyModeProps {
  words: WordEntry[];
  onToggleMastered: (word: string) => void;
}

const DictationMode: React.FC<{
  words: WordEntry[];
  onToggleMastered: (word: string) => void;
  onExit: () => void;
}> = ({ words, onToggleMastered, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const challengeWords = useMemo(() => 
    [...words].sort(() => 0.5 - Math.random()),
    [words]
  );

  const currentWord = challengeWords[currentIndex];

  if (challengeWords.length === 0) return null;

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.7; // Slower rate
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!isFinished && !isAnswered) {
      // First play
      speak(currentWord.word);
      
      // Second play after 5 seconds
      timeoutId = setTimeout(() => {
        if (!isAnswered) {
          speak(currentWord.word);
        }
      }, 5000);

      // Small delay to ensure input is rendered and focusable
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.speechSynthesis.cancel();
    };
  }, [currentIndex, isAnswered]);

  const handleCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAnswered || !userInput.trim()) return;

    // Intelligent normalization: lowercase and remove punctuation/special characters
    const normalize = (str: string) => 
      str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?!'"]/g, "").replace(/\s+/g, " ").trim();

    const correct = normalize(userInput) === normalize(currentWord.word);
    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) {
      setScore(prev => prev + 1);
      // Automatically mark as mastered if correct
      if (!currentWord.mastered) {
        onToggleMastered(currentWord.word);
      }
    } else {
      // If wrong, ensure it's marked as unmastered (included in review scope)
      if (currentWord.mastered) {
        onToggleMastered(currentWord.word);
      }
    }
  };

  const nextWord = () => {
    if (currentIndex < challengeWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white rounded-[40px] border-4 border-border-main p-10 bubble-shadow text-center space-y-8"
        >
          <div className="h-32 w-32 bg-accent/20 rounded-[40px] flex items-center justify-center mx-auto text-accent rotate-6">
            <Keyboard size={64} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-text-main">听写完成！</h2>
            <p className="text-xl font-bold text-text-sub">您的得分是</p>
            <div className="text-6xl font-black text-primary">{score} / {challengeWords.length}</div>
          </div>
          <button
            onClick={onExit}
            className="w-full py-5 bg-primary text-white text-xl font-black rounded-3xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all bubble-shadow"
          >
            返回
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-[32px] border-4 border-border-main shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-xl">
              <Keyboard className="text-white" size={20} />
            </div>
            <span className="text-lg font-black text-text-main">听写挑战</span>
            <span className="text-lg font-black text-primary">{currentIndex + 1} / {challengeWords.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-black text-text-main">得分: {score}</div>
            <div className="h-4 w-px bg-border-main" />
            <button onClick={onExit} className="text-sm font-black text-text-sub hover:text-primary">退出</button>
          </div>
        </div>

        {/* Dictation Card */}
        <motion.div
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[40px] border-4 border-border-main p-10 bubble-shadow space-y-10"
        >
          <div className="flex flex-col items-center space-y-8">
            <button
              onClick={() => speak(currentWord.word)}
              className="group relative flex h-32 w-32 items-center justify-center rounded-[40px] bg-primary/10 text-primary transition-all hover:scale-110 border-4 border-primary/20 bubble-shadow-hover"
            >
              <Volume2 size={56} />
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-white rounded-full border-2 border-primary flex items-center justify-center text-primary shadow-sm">
                <RotateCcw size={14} />
              </div>
            </button>
            <div className="text-center space-y-2">
              <p className="text-sm font-black text-text-sub uppercase tracking-widest">请听发音并拼写单词</p>
              <p className="text-xl font-bold text-text-main">{currentWord.translation}</p>
            </div>
          </div>

          <form onSubmit={handleCheck} className="space-y-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isAnswered}
                placeholder="在此输入单词..."
                className={cn(
                  "w-full px-8 py-6 rounded-3xl border-4 text-3xl font-black text-center transition-all outline-none",
                  !isAnswered && "border-border-main focus:border-primary bg-bg-main",
                  isAnswered && isCorrect && "border-success bg-success/5 text-text-main",
                  isAnswered && !isCorrect && "border-red-500 bg-red-50 text-red-500"
                )}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {isAnswered && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  {isCorrect ? (
                    <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center text-white">
                      <Check size={24} />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                      <X size={24} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isAnswered ? (
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="w-full py-5 bg-primary text-white text-xl font-black rounded-3xl shadow-lg hover:opacity-90 transition-all bubble-shadow disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <Send size={24} />
                检查拼写
              </button>
            ) : (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6"
              >
                {!isCorrect && (
                  <div className="p-6 rounded-3xl bg-red-50 border-4 border-red-100 text-center">
                    <p className="text-sm font-black text-red-400 uppercase tracking-widest mb-2">正确拼写</p>
                    <p className="text-4xl font-black text-red-600 tracking-tight">{currentWord.word}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onToggleMastered(currentWord.word)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border-4",
                      currentWord.mastered ? "bg-success border-success text-white" : "bg-white border-border-main text-text-sub hover:border-primary hover:text-primary"
                    )}
                  >
                    {currentWord.mastered ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    {currentWord.mastered ? '已掌握' : '标记掌握'}
                  </button>
                  <button
                    type="button"
                    onClick={nextWord}
                    className="flex-[2] py-4 bg-primary text-white text-xl font-black rounded-2xl shadow-lg hover:opacity-90 transition-all bubble-shadow"
                  >
                    {currentIndex === challengeWords.length - 1 ? '查看结果' : '下一个'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

const QuizMode: React.FC<{
  words: WordEntry[];
  onToggleMastered: (word: string) => void;
  onExit: () => void;
}> = ({ words, onToggleMastered, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Stabilize questions for the duration of the challenge
  const quizQuestions = useMemo(() => {
    if (words.length === 0) return [];
    return words.map((word) => {
      const types: QuizQuestion['type'][] = ['translation', 'definition', 'example'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let question = '';
      let correctAnswer = '';
      let options: string[] = [];

      if (type === 'translation') {
        question = `“${word.word}” 的中文翻译是？`;
        correctAnswer = word.translation;
        const distractors = words
          .filter(w => w.word !== word.word)
          .map(w => w.translation)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      } else if (type === 'definition') {
        question = `哪个单词的意思是：\n“${word.definition}”？`;
        correctAnswer = word.word;
        const distractors = words
          .filter(w => w.word !== word.word)
          .map(w => w.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      } else {
        const blankedExample = word.example.replace(new RegExp(word.word, 'gi'), '_____');
        question = `请补全句子：\n“${blankedExample}”`;
        correctAnswer = word.word;
        const distractors = words
          .filter(w => w.word !== word.word)
          .map(w => w.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      }

      return { type, question, correctAnswer, options, word };
    }).sort(() => 0.5 - Math.random());
  }, [words]);

  const currentQuestion = quizQuestions[currentIndex];

  if (quizQuestions.length === 0) return null;

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
      // Automatically mark as mastered if correct
      if (!currentQuestion.word.mastered) {
        onToggleMastered(currentQuestion.word.word);
      }
    } else {
      // If wrong, ensure it's marked as unmastered (included in review scope)
      if (currentQuestion.word.mastered) {
        onToggleMastered(currentQuestion.word.word);
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white rounded-[40px] border-4 border-border-main p-10 bubble-shadow text-center space-y-8"
        >
          <div className="h-32 w-32 bg-success/20 rounded-[40px] flex items-center justify-center mx-auto text-text-main rotate-6">
            <Trophy size={64} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-text-main">挑战结束！</h2>
            <p className="text-xl font-bold text-text-sub">您的得分是</p>
            <div className="text-6xl font-black text-primary">{score} / {quizQuestions.length}</div>
          </div>
          <button
            onClick={onExit}
            className="w-full py-5 bg-primary text-white text-xl font-black rounded-3xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all bubble-shadow"
          >
            返回
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Quiz Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-[32px] border-4 border-border-main shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <Brain className="text-white" size={20} />
            </div>
            <span className="text-lg font-black text-text-main">知识竞赛</span>
            <span className="text-lg font-black text-primary">{currentIndex + 1} / {quizQuestions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-black text-text-main">得分: {score}</div>
            <div className="h-4 w-px bg-border-main" />
            <button onClick={onExit} className="text-sm font-black text-text-sub hover:text-primary">退出</button>
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-[40px] border-4 border-border-main p-10 bubble-shadow space-y-10"
        >
          <div className="space-y-4 text-center">
            <span className="inline-block px-4 py-1 bg-accent/10 rounded-full text-xs font-black text-accent uppercase tracking-widest">
              {currentQuestion.type === 'translation' ? '翻译题' : currentQuestion.type === 'definition' ? '释义题' : '填空题'}
            </span>
            <h3 className="text-3xl font-bold text-text-main leading-relaxed whitespace-pre-wrap">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedOption;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={cn(
                    "flex items-center justify-between px-8 py-5 rounded-3xl border-4 text-xl font-bold transition-all text-left",
                    !isAnswered && "bg-white border-border-main hover:border-primary hover:bg-primary/5",
                    isAnswered && isCorrect && "bg-success/10 border-success text-text-main",
                    isAnswered && isSelected && !isCorrect && "bg-red-50 border-red-500 text-red-500",
                    isAnswered && !isSelected && !isCorrect && "bg-gray-50 border-gray-200 text-gray-400"
                  )}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <Check size={24} />}
                  {isAnswered && isSelected && !isCorrect && <X size={24} />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center space-y-6 pt-6 border-t-4 border-bg-main"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(currentQuestion.word.word);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl font-bold hover:bg-secondary hover:text-white transition-all"
                >
                  <Volume2 size={18} />
                  听发音
                </button>
                <button
                  onClick={() => onToggleMastered(currentQuestion.word.word)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all",
                    currentQuestion.word.mastered ? "bg-success text-white" : "bg-bg-main text-text-sub border-2 border-border-main"
                  )}
                >
                  {currentQuestion.word.mastered ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  {currentQuestion.word.mastered ? '已掌握' : '标记掌握'}
                </button>
              </div>
              <button
                onClick={nextQuestion}
                className="w-full py-5 bg-primary text-white text-xl font-black rounded-3xl shadow-lg hover:opacity-90 transition-all bubble-shadow"
              >
                {currentIndex === quizQuestions.length - 1 ? '查看结果' : '下一题'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export const StudyMode: React.FC<StudyModeProps> = ({ words, onToggleMastered }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [studyFilter, setStudyFilter] = useState<'all' | 'unmastered'>('unmastered');
  const [studyType, setStudyType] = useState<'flashcard' | 'quiz' | 'dictation'>('flashcard');
  const [isStarted, setIsStarted] = useState(false);
  const [frozenWords, setFrozenWords] = useState<WordEntry[]>([]);

  const unmasteredWords = words.filter(w => !w.mastered);

  // Freeze the words list when the study session starts
  useEffect(() => {
    if (isStarted) {
      setFrozenWords(studyFilter === 'unmastered' ? unmasteredWords : words);
    } else {
      setFrozenWords([]);
      setCurrentIndex(0);
    }
  }, [isStarted, studyFilter]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
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
            <p className="text-lg font-bold text-text-sub">请选择挑战模式：</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setStudyType('flashcard')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-3xl border-4 transition-all",
                studyType === 'flashcard' ? "border-primary bg-primary/5" : "border-border-main bg-white"
              )}
            >
              <RotateCcw size={24} className={studyType === 'flashcard' ? "text-primary" : "text-text-sub"} />
              <span className="font-black text-xs">经典闪卡</span>
            </button>
            <button
              onClick={() => setStudyType('quiz')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-3xl border-4 transition-all",
                studyType === 'quiz' ? "border-secondary bg-secondary/5" : "border-border-main bg-white"
              )}
            >
              <Brain size={24} className={studyType === 'quiz' ? "text-secondary" : "text-text-sub"} />
              <span className="font-black text-xs">知识竞赛</span>
            </button>
            <button
              onClick={() => setStudyType('dictation')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-3xl border-4 transition-all",
                studyType === 'dictation' ? "border-accent bg-accent/5" : "border-border-main bg-white"
              )}
            >
              <Keyboard size={24} className={studyType === 'dictation' ? "text-accent" : "text-text-sub"} />
              <span className="font-black text-xs">听写挑战</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm font-black text-text-sub uppercase tracking-widest">选择复习范围</p>
            <div className="grid gap-3">
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
          </div>

          <button
            onClick={() => setIsStarted(true)}
            disabled={studyFilter === 'unmastered' && unmasteredWords.length === 0}
            className="w-full py-5 bg-primary text-white text-xl font-black rounded-3xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all bubble-shadow disabled:opacity-50"
          >
            开始挑战
          </button>
        </div>
      </div>
    );
  }

  if (isStarted && frozenWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-bg-main p-8">
        <div className="text-center space-y-6">
          <div className="h-32 w-32 rounded-[40px] bg-white border-4 border-border-main flex items-center justify-center text-text-main rotate-6 bubble-shadow mx-auto">
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

  if (studyType === 'quiz') {
    return (
      <QuizMode 
        words={frozenWords} 
        onToggleMastered={onToggleMastered} 
        onExit={() => setIsStarted(false)} 
      />
    );
  }

  if (studyType === 'dictation') {
    return (
      <DictationMode 
        words={frozenWords} 
        onToggleMastered={onToggleMastered} 
        onExit={() => setIsStarted(false)} 
      />
    );
  }

  const currentWord = frozenWords[currentIndex];

  const nextWord = () => {
    setIsFlipped(false);
    setShowDetails(false);
    setCurrentIndex((prev) => (prev + 1) % frozenWords.length);
  };

  const prevWord = () => {
    setIsFlipped(false);
    setShowDetails(false);
    setCurrentIndex((prev) => (prev - 1 + frozenWords.length) % frozenWords.length);
  };

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
            <span className="text-lg font-black text-primary">{currentIndex + 1} / {frozenWords.length}</span>
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
                    ? "bg-white text-text-main" 
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
                    currentWord.mastered ? "text-text-main" : "text-primary"
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
