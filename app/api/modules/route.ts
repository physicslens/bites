import { NextRequest, NextResponse } from "next/server";
import { getModules, saveModules } from "../../../lib/data";

export async function GET() {
  const modules = await getModules();
  return NextResponse.json(modules);
}

export async function POST(request: NextRequest) {
  const modules = await request.json();
  if (!Array.isArray(modules)) {
    return NextResponse.json({ error: "Expected an array of modules." }, { status: 400 });
  }

  await saveModules(modules);
  return NextResponse.json({ success: true });
}
