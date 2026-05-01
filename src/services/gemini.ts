import { WordEntry } from "../types";

export async function processWords(input: string | { mimeType: string; data: string }): Promise<WordEntry[]> {
  const isImage = typeof input !== 'string';
  
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        isImage
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `请求失败: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    throw new Error(error.message || "AI 处理失败，请检查您的网络。");
  }
}
