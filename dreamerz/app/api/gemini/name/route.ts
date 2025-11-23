import { NextRequest, NextResponse } from "next/server";
import { generateDreamName } from "./nameservice";

export async function POST(req: NextRequest) {
  let requestBody;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { description } = requestBody;
  if (!description) {
    return NextResponse.json(
      { message: "Missing description" },
      { status: 400 }
    );
  }

  try {
    const name = await generateDreamName(description);
    return NextResponse.json({ name }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
