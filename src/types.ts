export interface WordEntry {
  word: string;
  phonetic?: string;
  definition: string;
  translation: string;
  example: string;
  exampleTranslation: string;
  mastered?: boolean;
  addedDate: number; // learned/added timestamp
  // SRS Metadata
  lastReviewDate?: number; // timestamp
  nextReviewDate?: number; // timestamp
  interval?: number; // days
  easeFactor?: number;
  repetitionCount?: number;
}

export type AppMode = 'input' | 'list' | 'study' | 'review';
