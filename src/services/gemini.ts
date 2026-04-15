import { GoogleGenAI, Type } from "@google/genai";
import { WordEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const WORD_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING, description: "The English word" },
      phonetic: { type: Type.STRING, description: "Phonetic transcription (IPA)" },
      definition: { type: Type.STRING, description: "English definition" },
      translation: { type: Type.STRING, description: "Chinese translation" },
      example: { type: Type.STRING, description: "An example sentence in English" },
      exampleTranslation: { type: Type.STRING, description: "Chinese translation of the example sentence" },
    },
    required: ["word", "definition", "translation", "example", "exampleTranslation"],
  },
};

export async function processWords(input: string | { mimeType: string; data: string }): Promise<WordEntry[]> {
  const isImage = typeof input !== 'string';
  
  const prompt = isImage 
    ? "Extract all English words from this image and provide their phonetic symbols, English definitions, Chinese translations, and example sentences with Chinese translations. Return as a JSON array."
    : `Explain the following English words: ${input}. For each word, provide its phonetic symbol, English definition, Chinese translation, and an example sentence with Chinese translation. Return as a JSON array.`;

  const contents = isImage 
    ? { parts: [{ inlineData: input }, { text: prompt }] }
    : prompt;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: WORD_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as WordEntry[];
  } catch (error) {
    console.error("Error processing words:", error);
    throw error;
  }
}
