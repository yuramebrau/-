import { WordEntry } from "../types";

export async function processWords(input: string | { mimeType: string; data: string }): Promise<WordEntry[]> {
  try {
    const response = await fetch('/api/process-words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process words');
    }

    return await response.json();
  } catch (error) {
    console.error("Error processing words:", error);
    throw error;
  }
}
