export type QuizBlock = {
  prompt: string;
  choices: string[];
  correct?: number;
  responses?: Record<string, number>;
};

export type Theme = "default" | "minimalist" | "neo-brutalism" | "dark" | "nature";

export type Slide =
  | { id: string; type: "text"; html: string }
  | { id: string; type: "quiz"; quiz: QuizBlock };

export type Module = {
  id: string;
  title: string;
  topic: string;
  assignedClasses: string[];
  slides: Slide[];
  theme?: Theme;
};

export type Student = {
  email: string;
  name: string;
  className: string;
  assignedModules: string[];
  quizProgress: Record<string, Record<string, number>>;
};

export type Store = {
  modules: Module[];
  students: Student[];
};
