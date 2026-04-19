"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter a valid student email.");
      return;
    }

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem("studentEmail", data.email);
      router.push("/student");
    } else {
      setError("Email not found. Please check the class roster.");
    }
  }

  return (
    <main className="container">
      <div className="card max-w-xl mx-auto">
        <h1 className="text-3xl font-semibold">Student login</h1>
        <p className="mt-3 text-slate-600">Enter your email address to access assigned modules. No password required.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="student@example.com"
            />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button type="submit" className="link-button w-full">
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
