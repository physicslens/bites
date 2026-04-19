"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";

type Student = {
  email: string;
  name: string;
  className: string;
  assignedModules: string[];
};

type ModuleSummary = { id: string; title: string };

export default function StudentRosterPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/modules")
      .then((res) => res.json())
      .then((data) => setModules(data.map((module: any) => ({ id: module.id, title: module.title }))));

    fetch("/api/students/all")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(() => {
        setMessage("Unable to load student roster.");
      });
  }, []);

  async function saveStudents(updatedStudents: Student[]) {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStudents),
    });

    if (response.ok) {
      setMessage("Student roster saved.");
    } else {
      setMessage("Unable to save student roster.");
    }
  }

  function handleCsv(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(result: any) {
        const rows = result.data as Record<string, string>[];
        const parsed = rows
          .map((row) => {
            const email = row.email?.trim().toLowerCase() ?? "";
            if (!email) return null;
            return {
              email,
              name: row.name?.trim() ?? "",
              className: row.className?.trim() ?? "",
              assignedModules: row.assignedModules?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
            };
          })
          .filter((row): row is Student => row !== null);

        setStudents(parsed);
        setMessage("CSV imported. Save to persist changes.");
      },
    });
  }

  function updateStudent(index: number, patch: Partial<Student>) {
    setStudents((prev) => prev.map((student, idx) => (idx === index ? { ...student, ...patch } : student)));
  }

  function addRow() {
    setStudents((prev) => [
      ...prev,
      { email: "", name: "", className: "", assignedModules: [] },
    ]);
  }

  function deleteRow(index: number) {
    setStudents((prev) => prev.filter((_, idx) => idx !== index));
  }

  return (
    <main className="container">
      <div className="card space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Student roster</p>
            <h1 className="mt-2 text-3xl font-semibold">Upload or edit student details</h1>
            <p className="text-slate-600">Manage student names, classes, unique email logins and module assignments.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="link-button cursor-pointer">
              Upload CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleCsv(file);
                }}
              />
            </label>
            <button onClick={addRow} className="link-button bg-slate-700 hover:bg-slate-600">
              Add student
            </button>
            <button onClick={() => saveStudents(students)} className="link-button bg-slate-900 hover:bg-slate-700">
              Save roster
            </button>
          </div>
        </div>

        {message ? <div className="rounded-2xl bg-slate-100 p-4 text-slate-700">{message}</div> : null}

        <div className="space-y-4">
          {students.map((student, index) => (
            <div key={`${student.email}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    value={student.email}
                    onChange={(event) => updateStudent(index, { email: event.target.value.toLowerCase() })}
                    placeholder="Email"
                    className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                  />
                  <input
                    value={student.name}
                    onChange={(event) => updateStudent(index, { name: event.target.value })}
                    placeholder="Name"
                    className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                  />
                  <input
                    value={student.className}
                    onChange={(event) => updateStudent(index, { className: event.target.value })}
                    placeholder="Class"
                    className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                  />
                </div>

                <button onClick={() => deleteRow(index)} className="link-button bg-rose-600 hover:bg-rose-500 text-white">
                  Delete
                </button>
              </div>

              <label className="mt-4 block text-sm text-slate-700">
                Assigned module IDs (comma separated)
                <input
                  value={student.assignedModules.join(", ")}
                  onChange={(event) =>
                    updateStudent(index, {
                      assignedModules: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </label>

              {modules.length > 0 ? (
                <div className="mt-4 text-sm text-slate-600">
                  Available modules: {modules.map((module) => module.id).join(", ")}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
