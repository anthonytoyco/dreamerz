// app/api/backend/dreams/getdream.ts
import { createClient } from '@/lib/supabase/server';
import type { PointData } from '@/types/point-data';
interface DreamKeyword {
  keyword_id: number;
  keywords: { name: string } | null;
}

// app/api/backend/dreams/getdream.ts
export async function getSimilarDreams(userId: string): Promise<PointData[]> {
  const supabase = await createClient();

  // 1️⃣ Get current user's dream IDs
  const { data: userDreams, error: udError } = await supabase
    .from('dreams')
    .select('id')
    .eq('user_id', userId);

  if (udError) {
    console.error('Error fetching user dreams:', udError);
    throw new Error(udError.message);
  }

  const userDreamIds = userDreams?.map(d => d.id) || [];
  if (userDreamIds.length === 0) return [];

  // 2️⃣ Get keyword IDs for user's dreams
  const { data: userKeywords, error: ukError } = await supabase
    .from('dream_keywords')
    .select('keyword_id')
    .in('dream_id', userDreamIds);

  if (ukError) {
    console.error('Error fetching user keywords:', ukError);
    throw new Error(ukError.message);
  }

  const keywordIds = userKeywords?.map(k => k.keyword_id) || [];
  if (keywordIds.length === 0) return [];

  // 3️⃣ Get dreams that share these keywords, excluding user's own dreams
  const { data: dreams, error: dError } = await supabase
    .from('dreams')
    .select(`
      id,
      title,
      description,
      image_url,
      video_url,
      longitude,
      latitude,
      dream_keywords!inner(
        keyword_id,
        keywords(name)
      ),
      user_id
    `)
    .in('dream_keywords.keyword_id', keywordIds)
    .not('user_id', 'eq', userId);

  if (dError) {
    console.error('Error fetching similar dreams:', dError);
    throw new Error(dError.message);
  }

const points: PointData[] = dreams?.map((dream: any) => ({
  id: dream.id,
  name: dream.title,
  desc: dream.description,
  image: dream.image_url,
  image_alt: dream.title,
  video: dream.video_url,
  lat: Number(dream.latitude) || 0,
  lng: Number(dream.longitude) || 0,
  tags: dream.dream_keywords
    ?.filter((dk: DreamKeyword) => dk.keywords)
    .map((dk: DreamKeyword) => dk.keywords!.name) || [],
})) || [];


  return points;
}
