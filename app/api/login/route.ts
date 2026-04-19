import { NextRequest, NextResponse } from "next/server";
import { getStudents } from "../../../lib/data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const student = (await getStudents()).find((item) => item.email.toLowerCase() === email);

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ email: student.email, name: student.name });
}
