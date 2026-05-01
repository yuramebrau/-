import fs from "fs";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Init Gemini
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

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/gemini", async (req, res) => {
  try {
    const { input, isImage } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
    }

    const prompt = isImage 
      ? "Extract all English words from this image and provide their phonetic symbols, English definitions, Chinese translations, and example sentences with Chinese translations. Return as a JSON array."
      : `Explain the following English words: ${input}. For each word, provide its phonetic symbol, English definition, Chinese translation, and an example sentence with Chinese translation. Return as a JSON array.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: isImage 
        ? { parts: [{ inlineData: { mimeType: input.mimeType, data: input.data } }, { text: prompt }] }
        : prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: WORD_SCHEMA as any,
      },
    });

    const text = result.text;
    if (!text) {
      throw new Error("AI 响应为空");
    }
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Server API Error:", error);
    // If the error is from the Gemini SDK, it might have an 'error' property with codes
    const message = error.message || "AI 处理失败";
    res.status(500).json({ 
      error: message,
      details: error.status || "UNKNOWN_ERROR"
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await import("vite");
      const viteServer = await vite.createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(viteServer.middlewares);
      
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
       // Only build in CI/CD or explicit build command
       console.log("Vite middleware not loaded, continuing as static server.");
       const distPath = path.join(process.cwd(), 'dist');
       if (fs.existsSync(distPath)) {
         app.use(express.static(distPath));
         app.get('*', (req, res) => {
           res.sendFile(path.join(distPath, 'index.html'));
         });
       }
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running in production on port ${PORT}`);
      });
    }
  }
}

startServer();

export default app;
