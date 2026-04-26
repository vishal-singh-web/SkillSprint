"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { isLoggedIn } from "@/lib/auth";
import { login } from "@/lib/api";
import { showToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace("/dashboard");
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Both fields are required.");
      return;
    }
    try {
      setLoading(true);
      await login({ email: email.trim(), password });
      showToast("Welcome back to SkillSprint.");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <p className="sub">SkillSprint has been waiting. Log in and let&apos;s get back to it.</p>

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
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? "Logging in..." : "Log in →"}
            </button>
          </form>

          <div className="auth-foot">
            New to SkillSprint? <Link href="/signup">Boot the agent &rarr;</Link>
          </div>
        </div>
      </main>
    </>
  );
}
