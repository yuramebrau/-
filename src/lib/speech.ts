
let isUnlocked = false;

/**
 * Unlocks speech synthesis on mobile devices.
 * Should be called during a user-initiated event (like a click).
 */
export const unlockSpeech = () => {
  if (isUnlocked || typeof window === 'undefined') return;
  
  try {
    // Some browsers need a real utterance even if empty
    const utterance = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(utterance);
    
    // Also try to resume if suspended (some browsers use AudioContext logic for Speech)
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    
    isUnlocked = true;
    console.log('Speech synthesis unlocked');
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

  // Ensure unlocked if not already
  if (!isUnlocked) {
    unlockSpeech();
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // On some mobile devices, we MUST keep a reference to the utterance
  // to prevent it from being garbage collected mid-speech.
  (window as any)._activeUtterance = utterance;

  // Error handling
  utterance.onerror = (event) => {
    console.error('SpeechSynthesisUtterance error:', event.error);
    if (event.error === 'not-allowed') {
      console.warn('Speech synthesis blocked by browser. User interaction required.');
    }
  };

  // Speak
  window.speechSynthesis.speak(utterance);
};
