import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getLocationFromCoordinates(
  latitude: number,
  longitude: number
) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Server configuration error: GEMINI_KEY environment variable is not set."
    );
  }

  const prompt = `
    I have a location with the following coordinates:
    Latitude: ${latitude} 
    Longitude: ${longitude}

    Please provide a readable location name in the format "City, Country" (e.g., "Toronto, Canada").
    Only return the location string, nothing else.
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
