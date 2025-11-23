import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';

const GEMINI_API_KEY = process.env.GEMINI_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { message: "Server configuration error: GEMINI_KEY not set." },
      { status: 500 }
    );
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt } = requestBody;
  if (!prompt) {
    return NextResponse.json({ message: "Missing prompt in request body." }, { status: 400 });
  }

  const finalPrompt = `A surreal, high-detail digital painting of a dreamscape based on: ${prompt}. Cinematic, ethereal, artistic style.`;

  try {
    // 1️⃣ Generate Image via Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: finalPrompt,
      config: { responseModalities: ["IMAGE"] },
    });

    const candidate = response.candidates?.[0];
    const base64Part = candidate?.content?.parts?.find(p => p.inlineData?.data);
    const base64Data = base64Part?.inlineData?.data;
    const mimeType = base64Part?.inlineData?.mimeType || 'image/png';

    if (!base64Data) {
      return NextResponse.json({ message: "AI did not return image data" }, { status: 500 });
    }

    // 2️⃣ Upload to Cloudinary
    // Cloudinary expects "data:image/png;base64,..." format
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "dreamscapes",
      resource_type: "image",
    });

    // 3️⃣ Return the Cloudinary URL
    return NextResponse.json({
      status: "success",
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error generating/uploading image:", error);
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 });
  }
}
