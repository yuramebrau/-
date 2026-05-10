import { WordEntry } from '../types';

/**
 * Simplified SM-2 Algorithm
 * q: quality of response (1: Hard, 3: Good, 5: Easy)
 */
export const updateSRS = (word: WordEntry, q: number): Partial<WordEntry> => {
  let { repetitionCount = 0, interval = 0, easeFactor = 2.5 } = word;

  if (q >= 3) {
    if (repetitionCount === 0) {
      interval = 1;
    } else if (repetitionCount === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitionCount++;
  } else {
    repetitionCount = 0;
    interval = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const lastReviewDate = Date.now();
  const nextReviewDate = lastReviewDate + interval * 24 * 60 * 60 * 1000;

  return {
    repetitionCount,
    interval,
    easeFactor,
    lastReviewDate,
    nextReviewDate,
  };
};

export const getDuelWords = (words: WordEntry[]): WordEntry[] => {
  const now = Date.now();
  return words
    .filter(w => {
      // If nextReviewDate is missing, it's a new word to be reviewed if not mastered
      // Or if nextReviewDate is in the past
      if (!w.nextReviewDate) return !w.mastered;
      return w.nextReviewDate <= now;
    })
    .sort((a, b) => (a.addedDate || 0) - (b.addedDate || 0)); // Review oldest learned words first
};
