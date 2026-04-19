"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { BlockMath, InlineMath } from "react-katex";


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
function ModuleEditorPage() {
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


  // Load modules from API on mount
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/modules");
      if (res.ok) {
        const loaded = await res.json();
        setModules(loaded);
      }
    })();
  }, []);

  async function addModule() {
    // Generate ID only on client, never during SSR
    const id = typeof window !== "undefined" && window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    const newModule: Module = {
      id,
      title: "Untitled Module",
      topic: "",
      assignedClasses: [],
      slides: [],
      theme: "default",
    };
    const updated = [...modules, newModule];
    setModules(updated);
    await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }

  async function saveChanges() {
    setSaving(true);
    setMessage(null);
    try {
      await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modules),
      });
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
    // Generate ID only on client, never during SSR
    const id = typeof window !== "undefined" && window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const newSlide =
          type === "text"
            ? { id, type: "text", html: "" }
            : {
                id,
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
  function renderPreview(slide: Slide, theme: Theme = "default") {
    if (!slide || slide.type !== "text" || !slide.html) return null;
    // Replace $...$ and $$...$$ with KaTeX components
    const html = slide.html;
    // Block math: $$...$$
    const blockMathRegex = /\$\$(.+?)\$\$/gs;
    // Inline math: $...$
    const inlineMathRegex = /\$(.+?)\$/g;

    // Split by block math first
    const parts = html.split(blockMathRegex);
    const rendered = parts.map((part, i) => {
      if (i % 2 === 1) {
        // Odd indices: block math
        return <BlockMath key={i}>{part}</BlockMath>;
      } else {
        // Even indices: may contain inline math
        const subparts = part.split(inlineMathRegex);
        return subparts.map((sub, j) => {
          if (j % 2 === 1) {
            return <InlineMath key={j}>{sub}</InlineMath>;
          } else {
            return <span key={j} dangerouslySetInnerHTML={{ __html: sub }} />;
          }
        });
      }
    });
    return <div className="prose max-w-none">{rendered}</div>;
  }

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
                        {/* Rich text editor for text slides */}
                        {(() => {
                          const idx = selectedSlideIdx[module.id] ?? 0;
                          const slide = module.slides[idx];
                          if (!slide || slide.type !== "text") return null;
                          const dynamic = require("next/dynamic").default;
                          const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });
                          return (
                            <RichTextEditor
                              value={slide.html || ""}
                              onChange={(html: string) => {
                                const updatedSlide = { ...slide, html };
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
                          );
                        })()}
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

export default ModuleEditorPage;
