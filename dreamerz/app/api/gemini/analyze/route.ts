import { NextRequest, NextResponse } from "next/server";
import { analyzeDream } from "./analyzeservice";

export async function POST(req: NextRequest) {
  let requestBody;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt } = requestBody;
  if (!prompt) {
    return NextResponse.json({ message: "Missing dream description" }, { status: 400 });
  }

  try {
    const keywords = await analyzeDream(prompt);
    return NextResponse.json({ keywords }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
