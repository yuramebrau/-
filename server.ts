import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Gemini Setup
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

// API Routes
app.post("/api/process-words", async (req, res) => {
  const { input } = req.body;
  
  if (!input) {
    return res.status(400).json({ error: "Missing input" });
  }

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
      contents: isImage 
        ? { parts: [{ inlineData: { mimeType: input.mimeType, data: input.data } }, { text: prompt }] }
        : prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: WORD_SCHEMA as any,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Error processing words:", error);
    res.status(500).json({ error: "Failed to process words" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
