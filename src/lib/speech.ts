
let isUnlocked = false;

/**
 * Unlocks speech synthesis on mobile devices.
 * Should be called during a user-initiated event (like a click).
 */
export const unlockSpeech = () => {
  if (isUnlocked || typeof window === 'undefined') return;
  
  try {
    // 1. Create a truly empty but valid utterance
    const utterance = new SpeechSynthesisUtterance(' ');
    utterance.volume = 0; // Silent
    window.speechSynthesis.speak(utterance);
    
    // 2. iOS/Safari often need resume() inside a user-initiated event
    if (window.speechSynthesis && window.speechSynthesis.resume) {
      window.speechSynthesis.resume();
    }
    
    isUnlocked = true;
    console.log('Speech synthesis unlocked on mobile');
  } catch (e) {
    console.error('Failed to unlock speech synthesis', e);
  }
};

/**
 * Robust speech synthesis function
 */
export const speak = (text: string, lang: string = 'en-US', rate: number = 0.8) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Force unlock if requested during a user action
  if (!isUnlocked) {
    unlockSpeech();
  }

  // Cancel any ongoing speech to avoid queueing
  window.speechSynthesis.cancel();
  
  // iOS/Safari fix: Ensure engine is resumed
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // IMPORTANT: Keep a global reference to prevent garbage collection on mobile
  // This is a common cause for speech stopping halfway or not starting on iOS
  (window as any)._lastUtterance = utterance;

  utterance.onstart = () => console.log('Speech started:', text);
  utterance.onerror = (event) => console.error('Speech error:', event);

  window.speechSynthesis.speak(utterance);
};
