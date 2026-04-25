"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { isLoggedIn } from "@/lib/auth";
import { signup } from "@/lib/api";
import { showToast } from "@/components/Toast";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [skills, setSkills] = useState("HTML, CSS, JavaScript");
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
    if (!name || !targetRole || !skills || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      await signup({
        name,
        email,
        password,
        targetRole,
        skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      });
      showToast("SkillSprint account created. Redirecting...");
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
              <label htmlFor="targetRole">Target role</label>
              <input
                type="text"
                id="targetRole"
                required
                placeholder="Frontend Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="skills">Skills</label>
              <input
                type="text"
                id="skills"
                required
                placeholder="HTML, CSS, JavaScript, React"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
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
              {loading ? "Creating account..." : "Boot Agent →"}
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
