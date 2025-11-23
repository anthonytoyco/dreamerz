import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import os from "os";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const GEMINI_API_KEY = process.env.GEMINI_KEY || "";
if (!GEMINI_API_KEY) throw new Error("GEMINI_KEY env variable not set");

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    // 1️⃣ Start video generation
    let operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview", // VEO 3
      prompt,
    });

    // 2️⃣ Poll until done or timeout (max 5 minutes)
    const startTime = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    while (!operation.done) {
      if (Date.now() - startTime > timeout) {
        return NextResponse.json({ error: "Video generation timed out." }, { status: 500 });
      }
      console.log("⏳ Waiting for video generation...");
      await new Promise((r) => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    // 3️⃣ Verify generatedVideos array
    const videoRef = operation.response?.generatedVideos?.[0]?.video;
    if (!videoRef) {
      console.error("Full operation response:", JSON.stringify(operation, null, 2));
      return NextResponse.json({ error: "Video reference missing." }, { status: 500 });
    }

    // 4️⃣ Download video temporarily
    const tempPath = path.join(os.tmpdir(), `dream_video_${Date.now()}.mp4`);
    await ai.files.download({ file: videoRef, downloadPath: tempPath });

    // 5️⃣ Upload video to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      resource_type: "video",
      folder: "dream_videos",
      public_id: `dream_video_${Date.now()}`,
    });

    // 6️⃣ Clean up temp file
    fs.unlinkSync(tempPath);

    // 7️⃣ Return Cloudinary URL
    return NextResponse.json({
      status: "completed",
      videoUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    }, { status: 200 });

  } catch (err: any) {
    console.error("❌ Error generating/uploading video:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
