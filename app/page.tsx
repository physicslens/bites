import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <div className="card space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Bites Learning CMS</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Bite-sized learning modules for teachers and students</h1>
          <p className="mt-4 max-w-3xl text-slate-600">Manage slide decks with images, embedded content, LaTeX, and live MCQ feedback. Assign modules to classes, import students with CSV, and let learners sign in with their email to access assigned work.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/teacher" className="link-button">
            Teacher dashboard
          </Link>
          <Link href="/login" className="link-button bg-slate-700 hover:bg-slate-600">
            Student login
          </Link>
        </div>
      </div>
    </main>
  );
}
