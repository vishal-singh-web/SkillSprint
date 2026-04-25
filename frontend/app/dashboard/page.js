"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { cfGetSession, cfLogout } from "@/lib/auth";
import { showToast } from "@/components/Toast";

const DEFAULT_STATE = {
  streak: 42,
  tasks: [
    { cat: "Building", title: "Write 50 lines on the LangGraph moderator for Varta", sub: "Estimated: 45 min", done: false },
    { cat: "Applying", title: "Tailor resume for Razorpay SDE-1 (high intent: 87%)", sub: "Auto-draft ready", done: false },
    { cat: "Networking", title: "DM Aditya Mishra (Sr SDE, Postman) about your RAG repo", sub: "Proof-of-Work template ready", done: false },
  ],
  moodHistory: [
    { day: "Mon", mood: "great" },
    { day: "Tue", mood: "okay" },
    { day: "Wed", mood: "okay" },
    { day: "Thu", mood: "anxious" },
    { day: "Fri", mood: "burnt" },
    { day: "Sat", mood: "anxious" },
    { day: "Sun", mood: "okay" },
  ],
  todayMood: null,
  score: 72,
  delta: 25,
  portfolio: { commits: 218, hard: 14, shipped: 3 },
};

const AGENT_LINES = [
  "Repo scanned. You are leaning on Express + REST. The market is paying for Agentic RAG. Add a LangGraph moderator and your callback rate roughly doubles. Estimated 4-hour ship.",
  "Tech debt detected: jQuery in 3 files. Replace with vanilla DOM or React. Cosmetic, but recruiters notice. Want a refactor PR?",
  "Strong signal: your tests pass, CI is green, README is human. You are in the top 18% on hygiene. Now push one feature this week and you cross the noise floor.",
  "Your last commit was 11 days ago. The streak agent does not care about excuses. Push 50 lines today, even broken ones.",
  "You have a deployed project but no live URL on your resume. That is a 30-second fix worth roughly 6% on callback rate. Add it tonight.",
];

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [state, setState] = useState(DEFAULT_STATE);
  const [activeNav, setActiveNav] = useState("today");
  const [scanRepo, setScanRepo] = useState("");
  const [agentText, setAgentText] = useState("");
  const typingTimer = useRef(null);

  // Auth gate + state hydration
  useEffect(() => {
    const s = cfGetSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    const key = "careerflow_state_" + (s.email || "anon");
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
      }
    } catch {}
  }, [router]);

  // Persist state per user
  useEffect(() => {
    if (!session) return;
    const key = "careerflow_state_" + (session.email || "anon");
    localStorage.setItem(key, JSON.stringify(state));
  }, [session, state]);

  // Initial agent text
  useEffect(() => {
    if (session) typeAgent(AGENT_LINES[0]);
    return () => clearTimeout(typingTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function typeAgent(text) {
    clearTimeout(typingTimer.current);
    let i = 0;
    function step() {
      setAgentText(text.slice(0, i));
      if (i < text.length) {
        i++;
        typingTimer.current = setTimeout(step, 18);
      }
    }
    step();
  }

  // Derived UI values
  const greeting = useMemo(() => {
    if (!session) return "";
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    return `${greet}, ${session.name.split(" ")[0]}.`;
  }, [session]);

  const dateLine = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    return `${days[now.getDay()]} · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} · Day ${state.streak}`;
  }, [state.streak]);

  const userBits = useMemo(() => {
    if (!session) return { display: "", initial: "", handle: "" };
    const parts = session.name.split(" ");
    const display = parts[0] + (parts[1] ? " " + parts[1].charAt(0) + "." : "");
    return {
      display,
      initial: parts[0].charAt(0).toUpperCase(),
      handle: "@" + (session.github || "you"),
    };
  }, [session]);

  const pivotActive = useMemo(() => {
    const hard = ["anxious", "burnt"];
    const last = state.moodHistory.slice(-2).map((d) => d.mood);
    return last.length === 2 && hard.includes(last[0]) && hard.includes(last[1]);
  }, [state.moodHistory]);

  const moodHeight = (m) => ({ great: 90, okay: 70, anxious: 40, burnt: 22 }[m] || 50);
  const moodClass = (m) => (m === "anxious" ? "warn" : m === "burnt" ? "bad" : "");

  function toggleTask(idx) {
    setState((prev) => {
      const tasks = prev.tasks.map((t, i) => (i === idx ? { ...t, done: !t.done } : t));
      const allDone = tasks.every((t) => t.done);
      const justChecked = !prev.tasks[idx].done;
      let streak = prev.streak;
      if (allDone && !prev.tasks.every((t) => t.done)) {
        streak = prev.streak + 1;
        showToast("All three shipped. Streak: " + streak + " days.");
      } else if (justChecked) {
        showToast("Logged. " + tasks.filter((t) => t.done).length + " / 3 done today.");
      }
      return { ...prev, tasks, streak };
    });
  }

  function pickMood(m) {
    setState((prev) => {
      const moodHistory = [...prev.moodHistory];
      moodHistory[moodHistory.length - 1] = { day: "Today", mood: m };
      return { ...prev, todayMood: m, moodHistory };
    });
    showToast("Logged. The agent is recalibrating.");
  }

  function runScan() {
    if (!scanRepo.trim()) {
      showToast("Drop a repo URL first.");
      return;
    }
    const newScore = 50 + Math.min(45, scanRepo.length * 2);
    const delta = Math.max(8, 100 - newScore - 5);
    setState((prev) => ({ ...prev, score: newScore, delta }));
    const line = AGENT_LINES[Math.floor(Math.random() * AGENT_LINES.length)];
    typeAgent("Scanned " + scanRepo + ". " + line);
    showToast("Scan complete.");
  }

  function logout() {
    cfLogout();
    showToast("Logged out. The streak is paused.");
    setTimeout(() => router.push("/"), 500);
  }

  if (!session) return null;

  const activity = [
    { time: "2m ago", html: 'Pushed <strong>feat: langgraph moderation</strong> to varta-chat' },
    { time: "3h ago", html: 'Solved <strong>Median of Two Sorted Arrays</strong> · Hard' },
    { time: "Yesterday", html: `Deployed <strong>resume-rag.${session.github}.dev</strong>` },
    { time: "2d ago", html: 'Agent updated impact summary for <strong>nexus-cli</strong>' },
    { time: "4d ago", html: 'Solved <strong>LRU Cache</strong> · Medium' },
  ];

  return (
    <>
      <Nav
        variant="dashboard"
        rightSlot={
          <>
            <span className="btn-link mono">{state.streak} day streak</span>
            <button className="btn btn-ghost" onClick={logout}>Log out</button>
          </>
        }
      />

      <div className="dash-shell">
        <aside className="dash-side">
          <div className="dash-user">
            <div className="dash-avatar">{userBits.initial}</div>
            <div className="dash-user-info">
              <div className="n">{userBits.display}</div>
              <div className="h">{userBits.handle}</div>
            </div>
          </div>
          <nav className="dash-nav">
            {[
              { id: "today", label: "Today", key: "⌘1" },
              { id: "scanner", label: "Scanner", key: "⌘2" },
              { id: "mood", label: "Vibe Check", key: "⌘3" },
              { id: "portfolio", label: "Portfolio", key: "⌘4" },
            ].map((n) => (
              <a
                key={n.id}
                href={"#" + n.id}
                className={activeNav === n.id ? "active" : ""}
                onClick={() => setActiveNav(n.id)}
              >
                {n.label} <span className="key">{n.key}</span>
              </a>
            ))}
            <Link href="/">Home</Link>
          </nav>
        </aside>

        <main className="dash-main">
          <div className="dash-h">
            <div>
              <h1>{greeting}</h1>
              <p className="sub mono">{dateLine}</p>
            </div>
            <div className="streak-pill">{state.streak} day streak</div>
          </div>

          {/* Today */}
          <section className="dash-card span-full" id="today">
            <h3>Today&apos;s 3 Non-Negotiables <span className="meta">// agent-generated 08:00 IST</span></h3>
            <p className="desc">
              Three tasks. One to build. One to apply. One to network. Miss them and the
              streak resets at midnight.
            </p>
            <div>
              {state.tasks.map((t, i) => (
                <div key={i} className="task-row" onClick={() => toggleTask(i)}>
                  <div className={"task-check" + (t.done ? " done" : "")} />
                  <div className="task-info">
                    <div className="task-cat">{t.cat}</div>
                    <div className={"task-title" + (t.done ? " done" : "")}>{t.title}</div>
                    <div className="task-sub">{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="dash-grid">
            {/* Scanner */}
            <section className="dash-card" id="scanner">
              <h3>Skill-Gap Scanner <span className="meta">// agentic</span></h3>
              <p className="desc">
                Drop a repo. The agent reads your stack and tells you exactly what to ship next.
              </p>
              <div className="scan-input">
                <input
                  type="text"
                  placeholder="github.com/you/your-repo"
                  value={scanRepo}
                  onChange={(e) => setScanRepo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runScan()}
                />
                <button className="btn btn-primary" onClick={runScan}>Scan</button>
              </div>
              <div className="score-gauge">
                <div>
                  <div className="label">Agentic Readiness</div>
                  <div className="value">{state.score}</div>
                  <div className="delta">+{state.delta} with suggested upgrade</div>
                </div>
                <div className="score-bar">
                  <div className="score-bar-fill" style={{ width: state.score + "%" }} />
                </div>
              </div>
              <div className="agent-output">
                <span className="label">// agent says</span>
                <span>{agentText}</span>
                <span className="cursor" />
              </div>
            </section>

            {/* Mood */}
            <section className="dash-card" id="mood">
              <h3>Vibe Check <span className="meta">// private</span></h3>
              <p className="desc">
                How are you actually doing today? Two anxious days in a row and we&apos;ll quietly
                drop the load.
              </p>
              <div className="mood-row">
                {["great", "okay", "anxious", "burnt"].map((m) => {
                  const label = m === "burnt" ? "Burnt out" : m.charAt(0).toUpperCase() + m.slice(1);
                  const isActive = state.todayMood === m;
                  const cls = isActive
                    ? "active" + (m === "anxious" ? " anxious" : m === "burnt" ? " burnt" : "")
                    : "";
                  return (
                    <button key={m} className={"mood-btn " + cls} onClick={() => pickMood(m)}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="mood-graph">
                {state.moodHistory.map((d, i) => (
                  <div
                    key={i}
                    className={"mood-bar " + moodClass(d.mood)}
                    style={{ height: moodHeight(d.mood) + "%" }}
                    title={`${d.day}: ${d.mood}`}
                  />
                ))}
              </div>
              {pivotActive && (
                <div className="pivot-note">
                  <strong>Auto-pivot active</strong>
                  Two hard days logged. Today&apos;s plan is dialed back — system design video,
                  light refactor, no cold applications. We&apos;ll re-escalate when you&apos;re ready.
                </div>
              )}
            </section>
          </div>

          {/* Portfolio */}
          <section className="dash-card span-full" id="portfolio">
            <h3>Proof-of-Work Portfolio <span className="meta">// live</span></h3>
            <p className="desc">
              Your live recruiter-facing page. Every commit, every Hard solved, every shipped
              feature ticks on automatically.
            </p>
            <div className="port-head">
              <div>
                <div className="port-name">{session.name}</div>
                <div className="port-handle">
                  @{session.github} · CSE 2026 · live at {session.github}.careerflow.dev
                </div>
              </div>
              <div className="port-live"><span className="dot" />Live</div>
            </div>
            <div className="port-stats">
              <div className="port-stat">
                <div className="v">{state.portfolio.commits}</div>
                <div className="l">Commits / 30d</div>
              </div>
              <div className="port-stat">
                <div className="v">{state.portfolio.hard}</div>
                <div className="l">Hard solved</div>
              </div>
              <div className="port-stat">
                <div className="v">{state.portfolio.shipped}</div>
                <div className="l">Shipped</div>
              </div>
            </div>
            <div className="activity-list">
              {activity.map((a, i) => (
                <div key={i} className="act-row">
                  <div className="act-time">{a.time}</div>
                  <div className="act-text" dangerouslySetInnerHTML={{ __html: a.html }} />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
