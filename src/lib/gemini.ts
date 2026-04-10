import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ErrorExplanation {
  explanation: string;
  cause: string;
  fix: string;
  codeExample: string;
  tags: string[];
}

export async function explainError(errorQuery: string): Promise<ErrorExplanation> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explain the following programming error or error code: "${errorQuery}". Provide a clear explanation, the common cause, a fix, and a code example showing the fix.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          cause: { type: Type.STRING },
          fix: { type: Type.STRING },
          codeExample: { type: Type.STRING },
          tags: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["explanation", "cause", "fix", "codeExample", "tags"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeCode(code: string): Promise<ErrorExplanation> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following code for errors, bugs, or potential issues: \n\n\`\`\`\n${code}\n\`\`\`\n\nIdentify the main issue, explain it, describe the cause, provide a fix, and show the corrected code example.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING, description: "Detailed explanation of the error found" },
          cause: { type: Type.STRING, description: "The root cause of the error" },
          fix: { type: Type.STRING, description: "Step-by-step instructions on how to fix it" },
          codeExample: { type: Type.STRING, description: "The complete corrected code block" },
          tags: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["explanation", "cause", "fix", "codeExample", "tags"]
      }
    }
  });

  return JSON.parse(response.text);
}
