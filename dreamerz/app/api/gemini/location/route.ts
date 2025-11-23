import { NextRequest, NextResponse } from "next/server";
import { getLocationFromCoordinates } from "./locationservice";

export async function POST(req: NextRequest) {
  let requestBody;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { latitude, longitude } = requestBody;
  if (latitude === undefined || longitude === undefined) {
    return NextResponse.json(
      { message: "Missing latitude or longitude" },
      { status: 400 }
    );
  }

  try {
    const location = await getLocationFromCoordinates(latitude, longitude);
    return NextResponse.json({ location }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
