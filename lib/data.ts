import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { Store, Student, Module } from "./types";

const storePath = join(process.cwd(), "data", "store.json");

export async function readStore(): Promise<Store> {
  const raw = await readFile(storePath, "utf-8");
  return JSON.parse(raw) as Store;
}

export async function writeStore(store: Store): Promise<void> {
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
}

function migrateTextBlocks(modules: Module[]): Module[] {
  // No migration needed - new slide structure uses union type (text | quiz)
  return modules;
}

export async function getModules(): Promise<Module[]> {
  const store = await readStore();
  return migrateTextBlocks(store.modules);
}

export async function getStudents(): Promise<Student[]> {
  return (await readStore()).students;
}

export async function saveModules(modules: Module[]): Promise<void> {
  const store = await readStore();
  store.modules = modules;
  await writeStore(store);
}

export async function saveStudents(students: Student[]): Promise<void> {
  const store = await readStore();
  store.students = students;
  await writeStore(store);
}
