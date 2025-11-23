import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import path from "path";


const GEMINI_API_KEY = process.env.GEMINI_KEY || ""; 

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();
        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required." },
                { status: 400 }
            );
        }

        // Start generation
        let operation = await ai.models.generateVideos({
            model: "veo-3.1-generate-preview",
            prompt,
        });

        // Poll until done
        while (!operation.done) {
            console.log("⏳ Waiting for video generation...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const response = operation.response;

        if (!response?.generatedVideos?.length) {
            return NextResponse.json(
                { error: "No generated videos found." },
                { status: 500 }
            );
        }

        const videoRef = response.generatedVideos[0].video;

        if (!videoRef) {
            return NextResponse.json(
                { error: "Video reference missing." },
                { status: 500 }
            );
        }

        // TEMPORARY FILE PATH (optional)
        const outputPath = path.join(process.cwd(), "public", "generated_video.mp4");

        // Download video to the filesystem
        await ai.files.download({
            file: videoRef,
            downloadPath: outputPath,
        });

        const publicUrl = "/generated_video.mp4";

        return NextResponse.json({
            status: "completed",
            file: videoRef,
            downloadUrl: publicUrl,
        });

    } catch (err: any) {
        console.error("❌ Error generating video:", err);
        return NextResponse.json(
            { error: err?.message || "Server error" },
            { status: 500 }
        );
    }
}
