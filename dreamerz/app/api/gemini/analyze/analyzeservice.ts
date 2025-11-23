import { GoogleGenAI } from "@google/genai";
import { getAllKeywords } from "../../backend/keywords/keywordservice";

const GEMINI_API_KEY = process.env.GEMINI_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function analyzeDream(dreamDescription: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("Server configuration error: GEMINI_KEY environment variable is not set.");
  }

  // Fetch all predefined keywords
  const predefinedKeywords = await getAllKeywords();
  if (!predefinedKeywords || predefinedKeywords.length === 0) {
    throw new Error("No keywords found in database");
  }

  const keywordList = predefinedKeywords.map((k) => k.name);

  // Build AI prompt
  const finalPrompt = `
Analyze the following dream and select 5 keywords that best describe it.
**Dream:** "${dreamDescription}"
**Instructions:** Choose keywords **only from the list below**. Response should be a JSON array of strings with no extra text or formatting.
**Keywords to choose from:** ${keywordList.join(", ")}
`;

  // Call Gemini AI
  const aiResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: finalPrompt,
  });

  const rawText = aiResponse.text;
  if (!rawText) {
    throw new Error("AI response was empty");
  }

  const cleaned = rawText.replace(/```json\s*|\s*```/g, "").trim();
  const selectedKeywords = JSON.parse(cleaned);

  if (!Array.isArray(selectedKeywords)) {
    throw new Error("AI returned invalid format (not an array)");
  }

  // Filter valid keywords
  const validKeywords = selectedKeywords.filter((kw: string) =>
    keywordList.some((dbKw) => dbKw.toLowerCase() === kw.toLowerCase())
  );

  return validKeywords;
}
