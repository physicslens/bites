"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BlockMath, InlineMath } from "react-katex";

type QuizBlock = {
  prompt: string;
  choices: string[];
  responses?: Record<string, number>;
};

type Theme = "default" | "minimalist" | "neo-brutalism" | "dark" | "nature";

type Slide =
  | { id: string; type: "text"; html: string }
  | { id: string; type: "quiz"; quiz: QuizBlock };

type AssignedModule = {
  id: string;
  title: string;
  topic: string;
  slides: Slide[];
  theme?: Theme;
};

type StudentData = {
  email: string;
  name: string;
  className: string;
  assignedModules: AssignedModule[];
};

function renderFormattedText(text: string, keyPrefix = ""): ReactNode[] {
  const regex = /(!\[([^\]]*)\]\(([^)]+)\))|(\$\$([^$]+)\$\$)|(\\\(([^)]+)\\\))|(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*([^*]+)\*)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      nodes.push(
        <img key={`img-${lastIndex}`} src={match[3]} alt={match[2]} className="mx-auto max-w-full rounded-2xl" />,
      );
    } else if (match[4]) {
      nodes.push(<BlockMath key={`block-${lastIndex}`} math={match[5].trim()} />);
    } else if (match[7]) {
      nodes.push(<InlineMath key={`inline-${lastIndex}`} math={match[7].trim()} />);
    } else if (match[8]) {
      nodes.push(<strong key={`strong-${lastIndex}`}>{renderFormattedText(match[9])}</strong>);
    } else if (match[10]) {
      nodes.push(
        <span key={`underline-${lastIndex}`} className="underline">
          {renderFormattedText(match[11])}
        </span>,
      );
    } else if (match[12]) {
      nodes.push(<em key={`em-${lastIndex}`}>{renderFormattedText(match[13])}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderNode(node: ChildNode, keyPath: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return <span key={keyPath}>{renderFormattedText(node.textContent ?? "", keyPath)}</span>;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const children = Array.from(element.childNodes).map((child, index) => renderNode(child, `${keyPath}-${index}`));

  switch (element.tagName) {
    case "STRONG":
    case "B":
      return <strong key={keyPath}>{children}</strong>;
    case "EM":
    case "I":
      return <em key={keyPath}>{children}</em>;
    case "U":
      return (
        <span key={keyPath} className="underline">
          {children}
        </span>
      );
    case "IMG":
      return (
        <img
          key={keyPath}
          src={element.getAttribute("src") ?? ""}
          alt={element.getAttribute("alt") ?? ""}
          className="mx-auto max-w-full rounded-2xl"
        />
      );
    case "BR":
      return <br key={keyPath} />;
    case "P":
      return <p key={keyPath}>{children}</p>;
    case "DIV":
      return <div key={keyPath}>{children}</div>;
    case "SPAN":
      return <span key={keyPath}>{children}</span>;
    default:
      return <span key={keyPath}>{children}</span>;
  }
}

function renderHtmlContent(html: string): ReactNode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return Array.from(doc.body.childNodes).map((child, index) => renderNode(child, `html-${index}`));
}

export default function StudentPage() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("studentEmail");
    if (!email) {
      setError("Please login first.");
      return;
    }

    fetch(`/api/students?email=${encodeURIComponent(email)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load student data.");
        }
        return response.json();
      })
      .then((data) => setStudent(data))
      .catch((err) => setError(err.message));
  }, []);

  async function submitAnswer(moduleId: string, slideId: string, choice: string) {
    const email = sessionStorage.getItem("studentEmail");
    if (!email) {
      setError("Please login first.");
      return;
    }

    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, moduleId, slideId, choice }),
    });

    if (response.ok) {
      const data = await response.json();
      setStudent(data);
    }
  }

  if (error) {
    return (
      <main className="container">
        <div className="card">
          <p className="text-rose-600">{error}</p>
          <p className="mt-4">Go back to <a href="/login" className="text-slate-900 underline">login</a>.</p>
        </div>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="container">
        <div className="card">
          <p>Loading your assigned modules…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="space-y-6">
        <div className="card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Student portal</p>
              <h1 className="mt-2 text-3xl font-semibold">Welcome, {student.name}</h1>
              <p className="text-slate-600">Class: {student.className}</p>
            </div>
            <button onClick={() => { sessionStorage.removeItem("studentEmail"); window.location.href = "/login"; }} className="link-button bg-slate-700 hover:bg-slate-600">
              Sign out
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {student.assignedModules.length === 0 ? (
            <div className="card">
              <p>No modules have been assigned to your class yet.</p>
            </div>
          ) : (
            student.assignedModules.map((module) => (
              <div key={module.id} className="card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{module.topic}</p>
                    <h2 className="text-2xl font-semibold">{module.title}</h2>
                  </div>
                  <button
                    onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                    className="link-button bg-slate-900 hover:bg-slate-700"
                  >
                    {activeModule === module.id ? "Hide slides" : "Open module"}
                  </button>
                </div>

                {activeModule === module.id ? (
                  <div className="mt-6 space-y-6">
                    {module.slides.map((slide) => (
                      <div key={slide.id} className={`theme-${module.theme || "default"}`}>
                        {slide.type === "text" ? (
                          <div className="slide-content">{renderHtmlContent(slide.html)}</div>
                        ) : (
                          <div>
                            <p className="quiz-prompt">{slide.quiz.prompt}</p>
                            <div className="grid gap-3">
                              {slide.quiz.choices.map((choice) => (
                                <button
                                  key={choice}
                                  onClick={() => submitAnswer(module.id, slide.id, choice)}
                                  className="quiz-button"
                                >
                                  {choice}
                                </button>
                              ))}
                            </div>
                            <div className="mt-4 text-sm text-slate-600">
                              Response summary:
                              <ul className="mt-2 list-disc space-y-1 pl-5">
                                {Object.entries(slide.quiz.responses ?? {}).map(([option, count]) => (
                                  <li key={option}>{option}: {count} vote{count === 1 ? "" : "s"}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
