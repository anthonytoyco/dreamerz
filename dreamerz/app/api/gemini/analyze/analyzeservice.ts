import { GoogleGenAI } from "@google/genai";
import { getAllKeywords } from "../../backend/keywords/keywordservice";

const GEMINI_API_KEY = process.env.GEMINI_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function analyzeDream(dreamDescription: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("Server configuration error: GEMINI_KEY environment variable is not set.");
  }

  // 1️⃣ Fetch all predefined keywords (with id and name)
  const predefinedKeywords = await getAllKeywords();
  if (!predefinedKeywords || predefinedKeywords.length === 0) {
    throw new Error("No keywords found in database");
  }

  const keywordList = predefinedKeywords.map((k) => k.name);

  // 2️⃣ Build AI prompt
  const finalPrompt = `
Analyze the following dream and select 5 keywords that best describe it.
**Dream:** "${dreamDescription}"
**Instructions:** Choose keywords **only from the list below**. Response should be a JSON array of strings with no extra text or formatting.
**Keywords to choose from:** ${keywordList.join(", ")}
`;

  // 3️⃣ Call Gemini AI
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

  // 4️⃣ Map AI-selected keywords to their database IDs
  const keywordMap = new Map(predefinedKeywords.map(k => [k.name.toLowerCase(), k.id]));
  const validKeywordIds = selectedKeywords
    .map((kw: string) => keywordMap.get(kw.toLowerCase()))
    .filter((id: number | undefined): id is number => id !== undefined);

  return validKeywordIds; // ✅ Return IDs instead of names
}
