"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { BlockMath, InlineMath } from "react-katex";
import { saveModules } from "../../../lib/data";

type QuizBlock = {
  prompt: string;
  choices: string[];
  correct?: number;
  responses?: Record<string, number>;
};

type Theme = "default" | "minimalist" | "neo-brutalism" | "dark" | "nature";

type Slide =
  | { id: string; type: "text"; html: string }
  | { id: string; type: "quiz"; quiz: QuizBlock };

type Module = {
  id: string;
  title: string;
  topic: string;
  assignedClasses: string[];
  slides: Slide[];
  theme?: Theme;
};

export default function ModuleEditorPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewSlideId, setPreviewSlideId] = useState<string | null>(null);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<Record<string, number>>({});
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [activeSlideForModal, setActiveSlideForModal] = useState<any>(null);

  // --- STUBS FOR ALL REFERENCED FUNCTIONS ---
  function addModule() {
    const newModule: Module = {
      id: Math.random().toString(36).slice(2),
      title: "Untitled Module",
      topic: "",
      assignedClasses: [],
      slides: [],
      theme: "default",
    };
    setModules((prev) => [...prev, newModule]);
  }
  async function saveChanges() {
    setSaving(true);
    setMessage(null);
    try {
      await saveModules(modules);
      setMessage("Modules saved successfully.");
    } catch (err) {
      setMessage("Failed to save modules.");
    } finally {
      setSaving(false);
    }
  }
  function updateModule(updated: Module) {
    setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }
  function removeModule(id: string) {}
  function createSlide(moduleId: string, type: "text" | "quiz") {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const newSlide =
          type === "text"
            ? { id: Math.random().toString(36).slice(2), type: "text", html: "" }
            : {
                id: Math.random().toString(36).slice(2),
                type: "quiz",
                quiz: { prompt: "", choices: ["", "", "", ""], correct: undefined, responses: {} },
              };
        return { ...m, slides: [...m.slides, newSlide] };
      })
    );
  }
  function removeSlide(moduleId: string, slideId: string) {}
  function applyTextCommand(moduleId: string, slideId: string, cmd: string) {}
  function syncTextHtml(moduleId: string, slideId: string) {}
  function updateSlide(moduleId: string, slideId: string, data: any) {}
  function insertImage() {}
  function renderPreview(slide: Slide, theme: Theme = "default") { return null; }
  return (
    <main className="container">
      <div className="card space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Module editor</p>
            <h1 className="mt-2 text-3xl font-semibold">Create modules</h1>
            <p className="text-slate-600">Build rich slide decks with text, LaTeX, images, and quizzes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={addModule} className="link-button" title="Add module">
              ➕ Module
            </button>
            <button onClick={saveChanges} disabled={saving} className="link-button bg-slate-700 hover:bg-slate-600">
              {saving ? "Saving…" : "💾 Save"}
            </button>
          </div>
        </div>

        {message ? <div className="rounded-2xl bg-slate-100 p-4 text-slate-700">{message}</div> : null}

        <div className="space-y-6">
          {modules.map((module) => (
            <div key={module.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm text-slate-700">
                    Module title
                    <input
                      value={module.title}
                      onChange={(event) => updateModule({ ...module, title: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                    />
                  </label>
                  <label className="block text-sm text-slate-700">
                    Topic / order
                    <input
                      value={module.topic}
                      onChange={(event) => updateModule({ ...module, topic: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                    />
                  </label>
                </div>
                <button onClick={() => removeModule(module.id)} className="link-button bg-rose-600 hover:bg-rose-500">
                  🗑
                </button>
              </div>

              <label className="mt-4 block text-sm text-slate-700">
                Assigned classes (comma separated)
                <input
                  value={module.assignedClasses.join(", ")}
                  onChange={(event) =>
                    updateModule({
                      ...module,
                      assignedClasses: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </label>

              <label className="mt-4 block text-sm text-slate-700">
                Theme
                <select
                  value={module.theme || "default"}
                  onChange={(event) => updateModule({ ...module, theme: event.target.value as Theme })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                >
                  <option value="default">Default</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="neo-brutalism">Neo Brutalism</option>
                  <option value="dark">Dark</option>
                  <option value="nature">Nature</option>
                </select>
              </label>

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => createSlide(module.id, "text")}
                    className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                    title="Add text slide"
                  >
                    ✎ Text
                  </button>
                  <button
                    type="button"
                    onClick={() => createSlide(module.id, "quiz")}
                    className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                    title="Add quiz slide"
                  >
                    ❓ Quiz
                  </button>
                </div>
                {/* Slide editor and horizontally scrollable thumbnails */}
                {module.slides && module.slides.length > 0 ? (
                  <>
                    {/* Large current slide editor */}
                    <div className="theme-default p-4 rounded-2xl border border-slate-300 bg-white shadow-md mb-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <p className="font-semibold text-slate-900">
                          Slide Editor
                        </p>
                      </div>
                      <div className="space-y-3">
                        <textarea
                          className="min-h-[80px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none"
                          value={(() => {
                            const slide = module.slides[selectedSlideIdx[module.id] ?? 0];
                            if (!slide) return "";
                            if (slide.type === "text") return slide.html || "";
                            return "[Quiz slide]";
                          })()}
                          onChange={(e) => {
                            const idx = selectedSlideIdx[module.id] ?? 0;
                            const slide = module.slides[idx];
                            if (!slide || slide.type !== "text") return;
                            const updatedSlide = { ...slide, html: e.target.value };
                            setModules((prev) =>
                              prev.map((m) =>
                                m.id === module.id
                                  ? { ...m, slides: m.slides.map((s, i) => (i === idx ? updatedSlide : s)) }
                                  : m
                              )
                            );
                          }}
                          placeholder="Slide content..."
                        />
                      </div>
                    </div>
                    {/* Thumbnails */}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {module.slides.map((s, i) => (
                        <div
                          key={s.id}
                          className={`cursor-pointer transition-transform duration-200 ${i === (selectedSlideIdx[module.id] ?? 0) ? "scale-110 border-2 border-blue-500" : "scale-90 border border-slate-300"} rounded-xl bg-white shadow-sm min-w-[120px] max-w-[160px] h-[90px] flex flex-col items-center justify-center`}
                          onClick={() => setSelectedSlideIdx((prev) => ({ ...prev, [module.id]: i }))}
                        >
                          <div className="truncate text-xs font-semibold mb-1">
                            {s.type === "text" ? "✎ Text" : "❓ Quiz"}
                          </div>
                          <div className="w-full h-full overflow-hidden flex items-center justify-center">
                            {s.type === "text" ? (
                              <div className="w-full h-full text-xs line-clamp-2">{s.html}</div>
                            ) : (
                              <div className="w-full h-full text-xs line-clamp-2">Quiz</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                    No slides yet. Add a text or quiz slide to begin.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
