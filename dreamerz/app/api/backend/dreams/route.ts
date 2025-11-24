// app/api/dreams/points/route.ts
import { NextResponse } from "next/server";
import { getSimilarDreams } from "@/app/api/backend/dreams/getdream";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1️⃣ Get the current user from Supabase auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Fetch dreams similar to this user's dreams
    console.log(user.id);
    const points = await getSimilarDreams(user.id);

    return NextResponse.json(points, { status: 200 });
  } catch (err) {
    console.error("Error fetching points:", err);
    const message =
      err instanceof Error ? err.message : "Failed to fetch points";
    return NextResponse.json({ message }, { status: 500 });
  }
}
