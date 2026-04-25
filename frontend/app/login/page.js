"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { cfGetSession, cfLogin } from "@/lib/auth";
import { showToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (cfGetSession()) router.replace("/dashboard");
  }, [router]);

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Both fields are required.");
      return;
    }
    const result = cfLogin(email.trim(), password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast("Welcome back, " + result.user.name.split(" ")[0] + ".");
    setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <>
      <Nav
        rightSlot={
          <>
            <span className="btn-link">Don&apos;t have an account?</span>
            <Link href="/signup" className="btn btn-ghost">Sign up</Link>
          </>
        }
      />

      <main className="auth-wrap">
        <div className="auth-card">
          <h1>Welcome back.</h1>
          <p className="sub">The agent has been waiting. Log in and let&apos;s get back to it.</p>

          <div className={"error-msg" + (error ? " show" : "")}>{error}</div>

          <form onSubmit={onSubmit} autoComplete="on">
            <div className="field">
              <label htmlFor="email">Email</label>
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
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block">
              Log in &rarr;
            </button>
          </form>

          <div className="demo-creds">
            <strong>// demo credentials</strong>
            email: demo@careerflow.com<br />
            password: careerflow2026
          </div>

          <div className="auth-foot">
            New to CareerFlow? <Link href="/signup">Boot the agent &rarr;</Link>
          </div>
        </div>
      </main>
    </>
  );
}
