import { createClient } from "@/lib/supabase/server";

interface UploadDreamParams {
  userId: string;
  title: string;
  description: string;
  longitude?: number;
  latitude?: number;
  imageUrl?: string | null;
  videoUrl?: string | null;
  keywordIds?: number[]; // Array of keyword IDs
}

export async function uploadDream(params: UploadDreamParams) {
  const supabase = await createClient();

  // 1️⃣ Insert into dreams table
  const { data: dreamData, error: dreamError } = await supabase
    .from("dreams")
    .insert({
      user_id: params.userId,
      title: params.title,
      description: params.description,
      longitude: params.longitude,
      latitude: params.latitude,
      image_url: params.imageUrl,
      video_url: params.videoUrl,
    })
    .select()
    .single(); // Return inserted row

  if (dreamError) {
    console.error("Error inserting dream:", dreamError);
    throw new Error(dreamError.message);
  }

  if (!dreamData || !dreamData.id) {
    throw new Error("Failed to insert dream or retrieve dream ID");
  }

  const dreamId = dreamData.id;

  // 2️⃣ Insert into dream_keywords join table
  if (params.keywordIds && params.keywordIds.length > 0) {
    const dreamKeywords = params.keywordIds.map((keywordId) => ({
      dream_id: dreamId,
      keyword_id: keywordId,
    }));

    const { error: keywordError } = await supabase
      .from("dream_keywords")
      .insert(dreamKeywords);

    if (keywordError) {
      console.error("Error inserting dream_keywords:", keywordError);
      throw new Error(keywordError.message);
    }
  }

  return dreamData; // Return inserted dream record
}
