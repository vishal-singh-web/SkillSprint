"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { cfGetSession, cfRegister } from "@/lib/auth";
import { showToast } from "@/components/Toast";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [github, setGithub] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (cfGetSession()) router.replace("/dashboard");
  }, [router]);

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name || !github || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const result = cfRegister({
      name,
      github: github.replace(/^@/, ""),
      email,
      password,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast("Agent booted. Redirecting...");
    setTimeout(() => router.push("/dashboard"), 700);
  }

  return (
    <>
      <Nav
        rightSlot={
          <>
            <span className="btn-link">Already have an account?</span>
            <Link href="/login" className="btn btn-ghost">Log in</Link>
          </>
        }
      />

      <main className="auth-wrap">
        <div className="auth-card">
          <h1>Boot the agent.</h1>
          <p className="sub">Free for the entire 2026 batch. No card. No bait. Takes 30 seconds.</p>

          <div className={"error-msg" + (error ? " show" : "")}>{error}</div>

          <form onSubmit={onSubmit} autoComplete="on">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                required
                placeholder="Priya Krishnan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="github">GitHub handle</label>
              <input
                type="text"
                id="github"
                required
                placeholder="priyak"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="email">College email</label>
              <input
                type="email"
                id="email"
                required
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Set a password (min 6 chars)</label>
              <input
                type="password"
                id="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block">
              Boot Agent &rarr;
            </button>
          </form>

          <div className="auth-foot">
            Already booted? <Link href="/login">Log in &rarr;</Link>
          </div>
        </div>
      </main>
    </>
  );
}
