"use server";
import { actionClient } from "./safe-action";
import { formSchema } from "../lib/form-schema";
import { generateDreamName } from "@/app/api/gemini/name/nameservice";
import { analyzeDream } from "@/app/api/gemini/analyze/analyzeservice";
import { generateDreamImage } from "@/app/api/gemini/image/route";
import { generateDreamVideo } from "@/app/api/gemini/video/route";
import { createClient } from "@/lib/supabase/server";
import { uploadDream } from "@/app/api/backend/dreams/uploaddream";

// ✅ Define types for media results
type MediaResult = { imageUrl: string | null; publicId: string | null };
type VideoResult = { videoUrl: string | null; publicId: string | null };

export const serverAction = actionClient
  .inputSchema(formSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    // 1️⃣ Generate a title if missing
    let name = parsedInput.name;
    if (!name && parsedInput.description) {
      try {
        name = await generateDreamName(parsedInput.description);
      } catch (error) {
        console.error("Failed to generate dream name:", error);
      }
    }

    // Ensure title is always a string
    const title = name ?? "Untitled Dream";

    // 2️⃣ Initialize default results
    let keywords: number[] = [];
    let imageRes: MediaResult = { imageUrl: null, publicId: null };
    let videoRes: VideoResult = { videoUrl: null, publicId: null };

    try {
      // 3️⃣ Run all AI services in parallel
      const [kw, img, vid] = await Promise.all([
        analyzeDream(parsedInput.description),
        generateDreamImage(parsedInput.description),
        generateDreamVideo(parsedInput.description),
      ]);

      keywords = kw ?? [];
      imageRes = img ?? imageRes;
      videoRes = vid ?? videoRes;
    } catch (error) {
      console.error("Error generating AI content:", error);
    }

    // 4️⃣ Upload dream to database
    try {
      const dreamRecord = await uploadDream({
        userId: user.id,
        title,
        description: parsedInput.description,
        longitude: parsedInput.longitude,
        latitude: parsedInput.latitude,
        imageUrl: imageRes.imageUrl,
        videoUrl: videoRes.videoUrl,
        keywordIds: keywords,
      });

      return {
        success: true,
        message: "Dream uploaded successfully",
        data: dreamRecord,
      };
    } catch (dbError: any) {
      console.error("Error saving dream to DB:", dbError);
      return {
        success: false,
        message: dbError.message || "Failed to save dream",
      };
    }
  });
