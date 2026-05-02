import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { WordList } from './components/WordList';
import { StudyMode } from './components/StudyMode';
import { processWords } from './services/gemini';
import { WordEntry, AppMode } from './types';
import { unlockSpeech } from './lib/speech';

export default function App() {
  const [mode, setMode] = useState<AppMode>('input');
  const [words, setWords] = useState<WordEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Global unlock for mobile speech on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      unlockSpeech();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Load words from localStorage on mount
  useEffect(() => {
    const savedWords = localStorage.getItem('wordmaster_words');
    if (savedWords) {
      try {
        const parsed = JSON.parse(savedWords);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWords(parsed);
          setMode('list');
        }
      } catch (e) {
        console.error('Failed to parse saved words');
      }
    }
  }, []);

  // Save words to localStorage when they change
  useEffect(() => {
    if (words.length > 0) {
      localStorage.setItem('wordmaster_words', JSON.stringify(words));
    }
  }, [words]);

  const handleProcess = async (input: string | { mimeType: string; data: string }) => {
    setIsProcessing(true);
    try {
      const newWords = await processWords(input);
      setWords((prev) => [...newWords, ...prev]);
      setMode('list');
    } catch (error) {
      console.error('Processing failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMastered = (wordToToggle: string) => {
    setWords((prev) =>
      prev.map((w) =>
        w.word === wordToToggle ? { ...w, mastered: !w.mastered } : w
      )
    );
  };

  const deleteWord = (wordToDelete: string) => {
    if (window.confirm(`确定要从单词本中删除 "${wordToDelete}" 吗？`)) {
      setWords((prev) => prev.filter((w) => w.word !== wordToDelete));
    }
  };

  const deleteWords = (wordsToDelete: string[]) => {
    setWords((prev) => prev.filter((w) => !wordsToDelete.includes(w.word)));
  };

  const masteredCount = words.filter(w => w.mastered).length;

  return (
    <div className="min-h-screen bg-bg-main text-text-main selection:bg-primary/10 selection:text-primary flex flex-col">
      <Header 
        mode={mode} 
        setMode={setMode} 
        hasWords={words.length > 0} 
        progress={words.length > 0 ? { current: masteredCount, total: words.length } : undefined}
      />
      
      <main className="flex-1 overflow-auto">
        {mode === 'input' && (
          <UploadZone 
            onProcess={handleProcess} 
            isProcessing={isProcessing} 
          />
        )}
        
        {mode === 'list' && words.length > 0 && (
          <WordList 
            words={words} 
            onToggleMastered={toggleMastered} 
            onDeleteWord={deleteWord} 
            onDeleteWords={deleteWords}
          />
        )}
        
        {mode === 'study' && words.length > 0 && (
          <StudyMode words={words} onToggleMastered={toggleMastered} />
        )}

        {words.length === 0 && mode !== 'input' && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="h-32 w-32 rounded-[40px] bg-white border-4 border-border-main flex items-center justify-center text-primary rotate-6 bubble-shadow">
              <BookOpen size={64} />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-text-main">书包空空如也</p>
              <p className="text-xl font-bold text-text-sub">快去添加一些单词，开启学习之旅吧！</p>
            </div>
            <button
              onClick={() => setMode('input')}
              className="mt-6 px-12 py-5 bg-primary text-white text-xl font-black rounded-3xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all bubble-shadow"
            >
              立即去添加
            </button>
          </div>
        )}
      </main>

      <footer className="py-8 md:py-12 text-center border-t-4 border-border-main bg-white rounded-t-[32px] md:rounded-t-[48px]">
        <p className="text-base md:text-lg font-bold text-primary tracking-widest px-4">✨ 陪宝贝一起成长的背单词神器 ✨</p>
        <p className="text-xs md:text-sm font-bold text-text-sub/60 mt-2 md:mt-3 italic">© 2026 小状元 · AI 智能单词助手</p>
      </footer>
    </div>
  );
}
