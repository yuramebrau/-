export interface WordEntry {
  word: string;
  phonetic?: string;
  definition: string;
  translation: string;
  example: string;
  exampleTranslation: string;
  mastered?: boolean;
}

export type AppMode = 'input' | 'list' | 'study';
