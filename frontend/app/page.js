"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { cfGetSession } from "@/lib/auth";

const AGENT_TEXT =
  "The market is shifting from REST to Agentic RAG. Your varta-chat repo uses Socket.io — adding a LangGraph layer for automated moderation lifts your Agentic Readiness Score by 25%. Estimated 4-hour ship. Want me to scaffold the PR?";

export default function HomePage() {
  const router = useRouter();
  const agentRef = useRef(null);
  const [agentText, setAgentText] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [tasks, setTasks] = useState([false, false, false]);
  const [mood, setMood] = useState("anxious");

  // Reveal-on-scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Typewriter
  useEffect(() => {
    if (!agentRef.current) return;
    let i = 0;
    let cancelled = false;
    let timer;
    function type() {
      if (cancelled) return;
      if (i <= AGENT_TEXT.length) {
        setAgentText(AGENT_TEXT.slice(0, i));
        i++;
        timer = setTimeout(type, 22);
      } else {
        timer = setTimeout(() => {
          i = 0;
          type();
        }, 6000);
      }
    }
    const heroIO = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            type();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    heroIO.observe(agentRef.current);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      heroIO.disconnect();
    };
  }, []);

  function bootAgent(e) {
    e.preventDefault();
    const session = cfGetSession();
    router.push(session ? "/dashboard" : "/signup");
  }

  function toggleTask(i) {
    setTasks((t) => t.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="eyebrow">
            <span className="dot" />&gt;_ INITIALIZING BATCH 2026
          </div>
          <h1 className="h-display">
            Stop spamming.<br />
            <span className="strike">Start shipping.</span>
          </h1>
          <p className="lead">
            Not a Notion tracker. Not a spreadsheet. An autonomous AI coach in your pocket
            that fights skill obsolescence, application fatigue, and bed rotting.
          </p>
          <div className="hero-actions">
            <a href="/signup" className="btn btn-primary btn-lg" onClick={bootAgent}>
              Boot Agent &rarr;
            </a>
            <a href="#manifesto" className="btn btn-ghost btn-lg">$ cat manifesto.md</a>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="num">3</div><div className="lbl">Daily tasks</div></div>
            <div className="stat"><div className="num">8:00</div><div className="lbl">AM ping</div></div>
            <div className="stat"><div className="num">17k+</div><div className="lbl">Batch 2026</div></div>
            <div className="stat"><div className="num">0</div><div className="lbl">Bed rot days</div></div>
          </div>
        </div>
      </section>

      {/* ENEMIES */}
      <section className="section" id="manifesto">
        <div className="reveal">
          <div
            className="eyebrow"
            style={{ borderColor: "var(--red)", color: "var(--red)", background: "rgba(255,93,74,0.06)" }}
          >
            <span className="dot" style={{ background: "var(--red)", boxShadow: "0 0 8px var(--red)" }} />
            THE THREE ENEMIES
          </div>
          <h2 className="h-section" style={{ marginTop: 24, maxWidth: 800 }}>
            Placement season has changed. The advice hasn&apos;t.
          </h2>
          <p className="lead" style={{ marginTop: 20 }}>
            Your seniors graduated into REST APIs and React tutorials. You&apos;re graduating into
            LangGraph, Agentic RAG, and a market that rewrites itself every quarter. The old
            playbook is a trap. CareerFlow names the trap.
          </p>
        </div>

        <div className="enemy-grid">
          {[
            { num: "01 / ENEMY", tag: "URGENT", title: "Skill Obsolescence", body: "The repo you spent six months on uses libraries the market is already moving past. You don't need another tutorial — you need a surgeon who tells you exactly which line to delete." },
            { num: "02 / ENEMY", tag: "DRAINING", title: "Application Fatigue", body: "200 applications. 0 callbacks. Each one feels like screaming into a CSV. You stop tailoring resumes. You start copy-pasting cover letters. Then you stop applying entirely." },
            { num: "03 / ENEMY", tag: "SILENT", title: "Mental Burnout", body: "\"Bed rotting\" between rejection emails. Doomscrolling Twitter for proof someone else made it. Telling yourself you'll start tomorrow. CareerFlow knows what tomorrow looks like." },
          ].map((e) => (
            <div className="enemy reveal" key={e.title}>
              <div className="num">{e.num}</div>
              <span className="tag">{e.tag}</span>
              <h3>{e.title}</h3>
              <p>{e.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        {/* Feature 1 */}
        <div className="feature">
          <div className="feature-text reveal">
            <div className="eyebrow"><span className="dot" />FEATURE 01 / SCANNER</div>
            <h2 className="h-section">An LLM agent that reads your code like a staff engineer.</h2>
            <p className="lead">
              It scans your GitHub repos, your tech choices, your commit cadence — then tells
              you what the market is paying for, and what&apos;s quietly killing your callback rate.
            </p>
            <ul>
              <li>Streaming, surgical advice — not &quot;learn Python&quot;</li>
              <li>Compares your stack against current 2026 hiring signals</li>
              <li>Calculates an Agentic Readiness Score, with deltas</li>
              <li>Suggests one repo upgrade per week, never ten</li>
            </ul>
          </div>
          <div className="reveal">
            <div className="mock">
              <div className="mock-head">
                <div className="lights"><span /><span /><span /></div>
                <span className="title">careerflow-agent — scanning ~/repos</span>
              </div>
              <div className="mock-body">
                <div className="scanner-row">
                  <div className="scanner-icon">V</div>
                  <div className="scanner-info">
                    <div className="scanner-name">priya/varta-chat</div>
                    <div className="scanner-meta">Node.js · Socket.io · 142 commits</div>
                  </div>
                </div>
                <div className="score-gauge">
                  <div>
                    <div className="label">Agentic Readiness</div>
                    <div className="value">72</div>
                    <div className="delta">+25 with suggested upgrade</div>
                  </div>
                  <div className="score-bar"><div className="score-bar-fill" /></div>
                </div>
                <div className="agent-output" ref={agentRef}>
                  <span className="label">// agent says</span>
                  <span>{agentText}</span>
                  <span className="cursor" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="feature reverse">
          <div className="reveal">
            <div className="mock">
              <div className="mock-head">
                <div className="lights"><span /><span /><span /></div>
                <span className="title">today.md — 3 non-negotiables</span>
              </div>
              <div className="mock-body">
                <div className="daily-head">
                  <div className="daily-time">
                    <span className="day">Tuesday</span>
                    <span>08:00 IST</span>
                  </div>
                  <div className="streak-pill">42 day streak</div>
                </div>
                {[
                  { cat: "Building", title: "Write 50 lines on the LangGraph moderator for Varta", sub: "Estimated: 45 min · Open in Cursor" },
                  { cat: "Applying", title: "Tailor resume for Razorpay SDE-1 (high intent: 87%)", sub: "Auto-draft ready · Review & send" },
                  { cat: "Networking", title: "DM Aditya Mishra (Sr SDE, Postman) about your RAG repo", sub: "Proof-of-Work template ready" },
                ].map((t, i) => (
                  <div className="task-row" key={i} onClick={() => toggleTask(i)}>
                    <div className={"task-check" + (tasks[i] ? " done" : "")} />
                    <div className="task-info">
                      <div className="task-cat">{t.cat}</div>
                      <div className={"task-title" + (tasks[i] ? " done" : "")}>{t.title}</div>
                      <div className="task-sub">{t.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="feature-text reveal">
            <div className="eyebrow"><span className="dot" />FEATURE 02 / DAILY LOGIC</div>
            <h2 className="h-section">Three things. Every morning. No analysis paralysis.</h2>
            <p className="lead">
              8:00 AM. Three tasks. One to build, one to apply, one to network. Miss them and
              the streak breaks. The agent watches the streak. The leaderboard watches you.
            </p>
            <ul>
              <li>Auto-generated from your goals, not a generic checklist</li>
              <li>Application picks ranked by intent score, not job board luck</li>
              <li>&quot;Proof of Work&quot; DM templates pre-written from your repos</li>
              <li>Streak counter shared on the batch leaderboard</li>
            </ul>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature">
          <div className="feature-text reveal">
            <div className="eyebrow"><span className="dot" />FEATURE 03 / RESILIENCE</div>
            <h2 className="h-section">It scales the difficulty to your mental state.</h2>
            <p className="lead">
              Vibe Check, every morning. Two days marked Anxious or Burnt Out and the agent
              quietly drops the load — system design videos instead of cold applications. You
              don&apos;t crash. You don&apos;t ghost yourself.
            </p>
            <ul>
              <li>Mood tracked privately, never shown on leaderboards</li>
              <li>Auto-pivot to low-intensity tasks after 2 hard days</li>
              <li>Optional check-in nudges from a real human mentor</li>
              <li>Trend graph so you can see the storm coming</li>
            </ul>
          </div>
          <div className="reveal">
            <div className="mock">
              <div className="mock-head">
                <div className="lights"><span /><span /><span /></div>
                <span className="title">vibe-check.log — private</span>
              </div>
              <div className="mock-body">
                <div className="mood-row">
                  {["great", "okay", "anxious", "burnt"].map((m) => {
                    const label = m === "burnt" ? "Burnt out" : m.charAt(0).toUpperCase() + m.slice(1);
                    const cls = mood === m ? "active" + (m === "anxious" ? " anxious" : m === "burnt" ? " burnt" : "") : "";
                    return (
                      <button key={m} className={"mood-btn " + cls} onClick={() => setMood(m)}>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="mood-graph">
                  <div className="mood-bar" style={{ height: "80%" }} />
                  <div className="mood-bar" style={{ height: "65%" }} />
                  <div className="mood-bar warn" style={{ height: "45%" }} />
                  <div className="mood-bar warn" style={{ height: "38%" }} />
                  <div className="mood-bar bad" style={{ height: "25%" }} />
                  <div className="mood-bar warn" style={{ height: "50%" }} />
                  <div className="mood-bar" style={{ height: "70%" }} />
                </div>
                <div className="pivot-note">
                  <strong>Auto-pivot active</strong>
                  Two anxious days logged. Today&apos;s plan: watch one Hello Interview video,
                  refactor one file, no cold applications. We&apos;ll re-escalate when you&apos;re ready.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="feature reverse">
          <div className="reveal">
            <div className="mock">
              <div className="mock-head">
                <div className="lights"><span /><span /><span /></div>
                <span className="title">priyak.dev — live portfolio</span>
              </div>
              <div className="mock-body">
                <div className="port-head">
                  <div>
                    <div className="port-name">Priya Krishnan</div>
                    <div className="port-handle">@priyak · CSE, IIIT Hyderabad · 2026</div>
                  </div>
                  <div className="port-live"><span className="dot" />Live</div>
                </div>
                <div className="port-stats">
                  <div className="port-stat"><div className="v">218</div><div className="l">Commits / 30d</div></div>
                  <div className="port-stat"><div className="v">14</div><div className="l">Hard solved</div></div>
                  <div className="port-stat"><div className="v">3</div><div className="l">Shipped</div></div>
                </div>
                <div className="activity-list">
                  <div className="act-row"><div className="act-time">2m ago</div><div className="act-text">Pushed <strong>feat: langgraph moderation</strong> to varta-chat</div></div>
                  <div className="act-row"><div className="act-time">3h ago</div><div className="act-text">Solved <strong>Median of Two Sorted Arrays</strong> · Hard</div></div>
                  <div className="act-row"><div className="act-time">Yesterday</div><div className="act-text">Deployed <strong>resume-rag.priyak.dev</strong></div></div>
                  <div className="act-row"><div className="act-time">2d ago</div><div className="act-text">Agent updated impact summary for <strong>nexus-cli</strong></div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="feature-text reveal">
            <div className="eyebrow"><span className="dot" />FEATURE 04 / PROOF OF WORK</div>
            <h2 className="h-section">A live portfolio recruiters can&apos;t ignore.</h2>
            <p className="lead">
              Every commit, every Hard solved, every shipped feature ticks onto your public
              Proof-of-Work page in real time. The agent writes the impact summaries so you
              don&apos;t have to lie about &quot;increased efficiency by 40%.&quot;
            </p>
            <ul>
              <li>Auto-syncs from GitHub · LeetCode · deployed projects</li>
              <li>Agent-generated, brutally honest project descriptions</li>
              <li>Recruiters get a live link, not a PDF graveyard</li>
              <li>One DM template — one URL — zero &quot;kindly find attached&quot;</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="reveal">
          <div className="eyebrow"><span className="dot" />FAQ</div>
          <h2 className="h-section" style={{ marginTop: 20 }}>
            The questions you were going to ask anyway.
          </h2>
        </div>

        <div className="faq-list">
          {[
            { q: "Is this just another job tracker with extra steps?", a: "No. Trackers are passive — they wait for you to log things. CareerFlow is agentic — it pings you at 8 AM with three specific tasks, scans your repos for stale tech, and pivots your plan when you're burnt out. You don't manage it. It manages you." },
            { q: "Do I have to give it my GitHub token?", a: "Read-only access on public repos by default. You can grant private access for deeper scans. Tokens are encrypted, never used outside scans, and you can revoke at any time from your settings page." },
            { q: "What if I'm not from a top-tier college?", a: "Especially built for you. The Proof-of-Work portfolio is the whole point — recruiters who care about your repo, not your campus. CareerFlow ranks high-intent roles (recruiters who actually open cold DMs from non-tier-1 students) and surfaces them first." },
            { q: "Will the agent shame me if I miss a day?", a: "No. The streak resets, that's it. The mood tracker exists exactly so a bad day doesn't snowball. If you mark anxious twice in a row, the agent pivots — it doesn't lecture." },
            { q: "Free, paid, freemium, what's the deal?", a: "Free for the entire 2026 batch through placement season. We'll add premium features post-graduation, but the core agent — daily tasks, scanner, mood tracker, portfolio — stays free for students." },
            { q: "Who's behind this?", a: "A small team of 2024 grads who survived their own placement season and built the tool they wished existed. Backed by a few angels who were sick of seeing burnt-out students." },
          ].map((item, i) => (
            <div key={i} className={"faq-item" + (openFaq === i ? " open" : "")}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q} <span className="icon">+</span>
              </button>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-block reveal">
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          <span className="dot" />STATUS: WAITLIST OPEN
        </div>
        <h2 className="h-section">The next 8 months will define the next 8 years.</h2>
        <p className="lead">Stop refreshing LinkedIn. Boot the agent. Let it run.</p>
        <Link href="/signup" className="btn btn-primary btn-lg" style={{ marginTop: 32 }}>
          Boot Agent &rarr;
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>© 2026 CareerFlow · Built by people who shipped</div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
