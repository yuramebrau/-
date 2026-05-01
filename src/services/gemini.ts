import { GoogleGenAI, Type } from "@google/genai";
import { WordEntry } from "../types";

// The platform automatically handles GEMINI_API_KEY in the frontend environment.
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
    required: ["word", "phonetic", "definition", "translation", "example", "exampleTranslation"],
  },
};

export async function processWords(input: string | { mimeType: string; data: string }): Promise<WordEntry[]> {
  const isImage = typeof input !== 'string';
  
  const prompt = isImage 
    ? "Extract all English words from this image and provide their phonetic symbols, English definitions, Chinese translations, and example sentences with Chinese translations. Return as a JSON array."
    : `Explain the following English words: ${input}. For each word, provide its phonetic symbol, English definition, Chinese translation, and an example sentence with Chinese translation. Return as a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: isImage 
        ? { parts: [{ inlineData: { mimeType: input.mimeType, data: input.data } }, { text: prompt }] }
        : prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: WORD_SCHEMA as any,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI 响应为空");
    }
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "AI 处理失败，请检查您的输入或网络。");
  }
}
