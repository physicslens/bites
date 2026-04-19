import { NextRequest, NextResponse } from "next/server";
import { writeStore, readStore } from "../../../lib/data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const moduleId = typeof body.moduleId === "string" ? body.moduleId : "";
  const slideId = typeof body.slideId === "string" ? body.slideId : "";
  const choice = typeof body.choice === "string" ? body.choice : "";

  if (!email || !moduleId || !slideId || !choice) {
    return NextResponse.json({ error: "Missing quiz payload." }, { status: 400 });
  }

  const store = await readStore();
  const student = store.students.find((item) => item.email.toLowerCase() === email);
  const moduleItem = store.modules.find((item) => item.id === moduleId);

  if (!student || !moduleItem) {
    return NextResponse.json({ error: "Student or module not found." }, { status: 404 });
  }

  const slide = moduleItem.slides.find((item) => item.id === slideId);
  if (!slide || slide.type !== "quiz") {
    return NextResponse.json({ error: "Quiz slide not found." }, { status: 404 });
  }

  if (!slide.quiz.responses) {
    slide.quiz.responses = {};
  }

  slide.quiz.responses[choice] = (slide.quiz.responses[choice] ?? 0) + 1;
  student.quizProgress[moduleId] = student.quizProgress[moduleId] ?? {};
  student.quizProgress[moduleId][slideId] = (student.quizProgress[moduleId][slideId] ?? 0) + 1;

  await writeStore(store);

  const assignedModules = store.modules.filter((item) => student.assignedModules.includes(item.id));

  return NextResponse.json({
    email: student.email,
    name: student.name,
    className: student.className,
    assignedModules,
  });
}
