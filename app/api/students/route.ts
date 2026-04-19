import { NextRequest, NextResponse } from "next/server";
import { getModules, getStudents, saveStudents } from "../../../lib/data";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ error: "Missing email parameter." }, { status: 400 });
  }

  const students = await getStudents();
  const student = students.find((item) => item.email.toLowerCase() === email);

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const modules = await getModules();
  const assignedModules = modules.filter((module) => student.assignedModules.includes(module.id));

  return NextResponse.json({
    email: student.email,
    name: student.name,
    className: student.className,
    assignedModules,
  });
}

export async function POST(request: NextRequest) {
  const students = await request.json();

  if (!Array.isArray(students)) {
    return NextResponse.json({ error: "Expected an array of students." }, { status: 400 });
  }

  await saveStudents(students);
  return NextResponse.json({ success: true });
}
