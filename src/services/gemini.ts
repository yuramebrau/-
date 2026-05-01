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
      let errorMessage = `请求失败: ${response.status}`;
      try {
        const errorData = await response.json();
        // If it's a Gemini API error object forwarded by our server
        if (errorData.error) {
          if (typeof errorData.error === 'object' && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else {
            errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
          }
        }
      } catch (e) {
        // Fallback if not JSON
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    throw new Error(error.message || "AI 处理失败，请检查您的网络。");
  }
}
