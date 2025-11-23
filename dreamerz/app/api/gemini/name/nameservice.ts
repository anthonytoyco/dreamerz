import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateDreamName(description: string) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Server configuration error: GEMINI_KEY environment variable is not set."
    );
  }

  const prompt = `
    Read the following dream description and generate a short, creative, and intriguing title (name) for it.
    The title should be no more than 5-7 words.
    
    Dream Description:
    "${description}"

    Only return the title, nothing else. Do not use quotes.
  `;

  const aiResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const rawText = aiResponse.text;
  if (!rawText) {
    throw new Error("AI response was empty");
  }

  return rawText.trim();
}
