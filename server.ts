import express from "express";
// 注意：我去掉了原来在这里的 import { createServer ... } from "vite";
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
if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables!");
}

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
  console.log("Received request to /api/process-words");
  const { input } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("API Key missing");
    return res.status(500).json({ error: "服务器配置错误：缺少 API Key" });
  }

  if (!input) {
    return res.status(400).json({ error: "缺少输入内容" });
  }

  const isImage = typeof input !== 'string';
  console.log(`Processing mode: ${isImage ? 'Image' : 'Text'}`);
  
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
      console.error("Gemini returned empty response");
      throw new Error("AI 响应为空");
    }
    
    console.log("Successfully processed words");
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "AI 处理失败", 
      details: error.message,
      suggestion: "如果是图片，请尝试裁剪后只上传单词部分，或检查网络。"
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    try {
      // 核心修复点：将原来的顶层静态引入，改成了这里的动态引入 (Dynamic Import)
      // 这样 Vercel 线上打包时就不会报错了
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
      console.log("Skipping Vite in production environment.");
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer();

export default app;