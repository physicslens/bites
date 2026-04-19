import Link from "next/link";

export default function TeacherDashboard() {
  return (
    <main className="container">
      <div className="card space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Teacher dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Manage modules, students, and assignments</h1>
          <p className="mt-4 max-w-3xl text-slate-600">Edit slide decks with images, embeds, LaTeX math, and MCQ interactions. Upload or update student records and see class assignment completion.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/teacher/modules" className="link-button">
            Module editor
          </Link>
          <Link href="/teacher/students" className="link-button bg-slate-700 hover:bg-slate-600">
            Student roster
          </Link>
        </div>
      </div>
    </main>
  );
}
