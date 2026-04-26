"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { getStoredProfile, isLoggedIn } from "@/lib/auth";
import { apiFetch, logout } from "@/lib/api";
import { showToast } from "@/components/Toast";

const emptyProgress = {
  streak: 0,
  tasksCompleted: 0,
  interviewsCompleted: 0,
  completionRate: 0,
};

const INTERVIEW_TRANSCRIPT_KEY = "skillsprint_interview_transcript";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(emptyProgress);
  const [tasks, setTasks] = useState([]);
  const [skillGap, setSkillGap] = useState(null);
  const [skillGapHistory, setSkillGapHistory] = useState([]);
  const [openSkillGapId, setOpenSkillGapId] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [interview, setInterview] = useState(null);
  const [interviewScoreHistory, setInterviewScoreHistory] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewType, setInterviewType] = useState("hr");
  const [questionCount, setQuestionCount] = useState(2);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [voiceAllowed, setVoiceAllowed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeNav, setActiveNav] = useState("today");
  const [scannerMode, setScannerMode] = useState("resume");
  const [resumeText, setResumeText] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [manualSkills, setManualSkills] = useState("");
  const [interviewMessage, setInterviewMessage] = useState("");
  const [interviewCode, setInterviewCode] = useState("");
  const [agentText, setAgentText] = useState("SkillSprint is ready. Ask what to improve, your best skill, or what you are lacking.");
  const [agentQuestion, setAgentQuestion] = useState("");
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState({});
  const [pageError, setPageError] = useState("");
  const recognitionRef = useRef(null);
  const voiceShouldContinueRef = useRef(false);
  const lastTranscriptRef = useRef("");

  const setBusyKey = (key, value) => {
    setBusy((prev) => ({ ...prev, [key]: value }));
  };

  const showApiError = (err) => {
    const message = err.message || "Something went wrong. Please try again.";
    setPageError(message);
    showToast(message);
  };

  const formatShortDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const saveInterviewTranscript = (items) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(INTERVIEW_TRANSCRIPT_KEY, JSON.stringify(items));
  };

  const readInterviewTranscript = () => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem(INTERVIEW_TRANSCRIPT_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const clearInterviewTranscript = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(INTERVIEW_TRANSCRIPT_KEY);
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setBusyKey("dashboard", true);
      setPageError("");
      const [profileRes, progressRes, tasksRes, moodRes] = await Promise.all([
        apiFetch("/profile"),
        apiFetch("/progress"),
        apiFetch("/daily-tasks"),
        apiFetch("/mood"),
      ]);

      setProfile(profileRes.profile || getStoredProfile());
      setProgress(progressRes);
      setTasks(tasksRes.daily3 || []);
      setMoodHistory(moodRes.moodHistory || []);
      setTodayMood(moodRes.todayMood || null);
      apiFetch("/interview/history").then((data) => setInterviewScoreHistory(data.history || [])).catch(() => {});
      apiFetch("/skill-gap/history").then((data) => setSkillGapHistory(data.history || [])).catch(() => {});
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
      setBusyKey("dashboard", false);
    }
  }

  const greeting = useMemo(() => {
    const name = profile?.name || "sprinter";
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    return `${greet}, ${name.split(" ")[0]}.`;
  }, [profile]);

  const dateLine = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    return `${days[now.getDay()]} · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} · Day ${progress.streak}`;
  }, [progress.streak]);

  const userBits = useMemo(() => {
    const name = profile?.name || "SkillSprint User";
    const parts = name.split(" ");
    return {
      display: parts[0] + (parts[1] ? " " + parts[1].charAt(0) + "." : ""),
      initial: parts[0].charAt(0).toUpperCase(),
      handle: profile?.targetRole || "Placement Prep",
    };
  }, [profile]);

  async function generateTasks() {
    try {
      setBusyKey("generateTasks", true);
      setPageError("");
      const data = await apiFetch("/daily-tasks/generate", {
        method: "POST",
        body: JSON.stringify({
          targetRole: profile?.targetRole || "Frontend Developer",
        }),
      });
      setTasks(data.daily3 || []);
      setAgentText("Today's Daily 3 was regenerated using your role, skills, progress, and recent mood.");
      showToast("Today's SkillSprint tasks generated.");
    } catch (err) {
      showApiError(err);
    } finally {
      setBusyKey("generateTasks", false);
    }
  }

  async function completeTask(taskId) {
    try {
      setBusyKey(`task-${taskId}`, true);
      setPageError("");
      const data = await apiFetch(`/daily-tasks/${taskId}/complete`, {
        method: "PATCH",
      });
      setProgress(data.updatedProgress || progress);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, completed: true } : task))
      );
      setAgentText("Nice. That task is complete and your progress has been updated.");
      showToast("Task marked complete.");
    } catch (err) {
      showApiError(err);
    } finally {
      setBusyKey(`task-${taskId}`, false);
    }
  }

  async function pickMood(mood) {
    try {
      setBusyKey("mood", true);
      setPageError("");
      const data = await apiFetch("/mood", {
        method: "POST",
        body: JSON.stringify({ mood }),
      });
      setTodayMood(mood);
      setMoodHistory(data.moodHistory || []);
      setAgentText("Mood saved for today. If you change it, the same DB row will be updated.");
      showToast("Mood saved.");
    } catch (err) {
      showApiError(err);
    } finally {
      setBusyKey("mood", false);
    }
  }

  async function runSkillGap() {
    if (scannerMode === "resume" && !resumeText.trim()) {
      showToast("Paste resume or project text first.");
      return;
    }

    if (scannerMode === "github" && !repoUrl.trim()) {
      showToast("Paste a GitHub repository URL first.");
      return;
    }

    if (scannerMode === "manual" && !manualSkills.trim()) {
      showToast("Enter at least one skill first.");
      return;
    }

    try {
      setBusyKey("skillGap", true);
      setPageError("");
      const data = await apiFetch("/skill-gap", {
        method: "POST",
        body: JSON.stringify({
          targetRole: profile?.targetRole || "Frontend Developer",
          sourceType: scannerMode,
          resumeText,
          repoUrl,
          manualSkills: manualSkills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });
      setSkillGap(data);
      setProfile((prev) => ({ ...prev, skills: data.updatedSkills || prev?.skills || [] }));
      const historyData = await apiFetch("/skill-gap/history");
      setSkillGapHistory(historyData.history || []);
      setAgentText(data.message || "Skills updated. Your next generated Daily 3 will use this analysis.");
      showToast("Skill analysis saved.");
    } catch (err) {
      showApiError(err);
    } finally {
      setBusyKey("skillGap", false);
    }
  }

  function speakText(text) {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  async function requestVoicePermission() {
    try {
      setBusyKey("voicePermission", true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setVoiceAllowed(true);
      showToast("Microphone enabled.");
      return true;
    } catch {
      setVoiceAllowed(false);
      showToast("Microphone denied. You can type your answer.");
      return false;
    } finally {
      setBusyKey("voicePermission", false);
    }
  }

  async function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser.");
      return;
    }

    const allowed = voiceAllowed || (await requestVoicePermission());
    if (!allowed) return;

    if (isListening || recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (voiceShouldContinueRef.current) {
        window.setTimeout(() => startListening(), 250);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      showToast("Voice input stopped. You can type instead.");
    };
    recognition.onresult = (event) => {
      const result = event.results?.[event.resultIndex];
      if (!result?.isFinal) return;

      const transcript = result?.[0]?.transcript?.trim() || "";
      if (!transcript || transcript === lastTranscriptRef.current) return;

      lastTranscriptRef.current = transcript;
      setInterviewMessage((prev) => `${prev}${prev ? " " : ""}${transcript}`);
    };
    recognitionRef.current = recognition;
    voiceShouldContinueRef.current = true;
    recognition.start();
  }

  function stopListening() {
    voiceShouldContinueRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }

  async function startInterview() {
    const allowed = await requestVoicePermission();
    setInterviewStarted(true);
    setInterview(null);
    setInterviewMessage("");
    setInterviewCode("");
    lastTranscriptRef.current = "";
    setInterviewHistory([]);
    clearInterviewTranscript();
    setQuestionNumber(1);
    await sendInterviewMessage({
      starterMessage: "Start the interview. Ask the first question.",
      nextQuestionNumber: 0,
      nextHistory: [],
      shouldSpeak: allowed,
    });
  }

  async function endInterview() {
    stopListening();
    await requestFinalInterviewReport();
  }

  async function requestFinalInterviewReport(transcriptOverride) {
    const transcript = transcriptOverride || readInterviewTranscript();

    try {
      setBusyKey("finalReport", true);
      setPageError("");
      const data = await apiFetch("/interview/message", {
        method: "POST",
        body: JSON.stringify({
          targetRole: profile?.targetRole || "Frontend Developer",
          interviewType,
          questionCount,
          isFinalReport: true,
          transcript,
        }),
      });

      setInterview(data);
      setAgentText(data.feedback || "Final interview report is ready.");
      showToast("Final interview report ready.");
      clearInterviewTranscript();
      const progressData = await apiFetch("/progress");
      setProgress(progressData);
      const historyData = await apiFetch("/interview/history");
      setInterviewScoreHistory(historyData.history || []);
    } catch (err) {
      showApiError(err);
    } finally {
      setBusyKey("finalReport", false);
    }
  }

  async function sendInterviewMessage({
    starterMessage,
    nextQuestionNumber,
    nextHistory,
    shouldSpeak = true,
  } = {}) {
    const answer = starterMessage || interviewMessage.trim();

    if (!answer) {
      showToast("Answer by voice or typing first.");
      return;
    }

    try {
      setBusyKey("interview", true);
      setPageError("");
      const currentQuestionNumber = nextQuestionNumber || questionNumber;
      const currentHistory = nextHistory || interviewHistory;
      let updatedHistory = currentHistory;

      if (!starterMessage && interview?.reply) {
        updatedHistory = [
          ...currentHistory,
          {
            questionNumber: currentQuestionNumber,
            question: interview.reply,
            answer,
            code: interviewType === "technical" ? interviewCode : "",
          },
        ];
        saveInterviewTranscript(updatedHistory);
      }

      if (!starterMessage && currentQuestionNumber >= questionCount) {
        setInterviewMessage("");
        setInterviewCode("");
        lastTranscriptRef.current = "";
        await requestFinalInterviewReport(updatedHistory);
        return;
      }

      const data = await apiFetch("/interview/message", {
        method: "POST",
        body: JSON.stringify({
          targetRole: profile?.targetRole || "Frontend Developer",
          interviewType,
          questionCount,
          questionNumber: currentQuestionNumber,
          message: answer,
          code: interviewType === "technical" ? interviewCode : "",
          history: updatedHistory,
        }),
      });
      setInterview(data);
      setAgentText(data.feedback);
      setInterviewHistory(updatedHistory);
      setQuestionNumber(data.questionNumber || currentQuestionNumber + 1);
      setInterviewMessage("");
      setInterviewCode("");
      lastTranscriptRef.current = "";
      if (shouldSpeak) speakText(data.reply);
      showToast("Next interview question ready.");
    } catch (err) {
      showApiError(err);
    } finally {
      setBusyKey("interview", false);
    }
  }

  async function askAgent() {
    if (!agentQuestion.trim()) return;

    try {
      setBusyKey("agent", true);
      setPageError("");
      const data = await apiFetch("/agent/message", {
        method: "POST",
        body: JSON.stringify({ question: agentQuestion }),
      });
      setAgentText(data.reply);
      setAgentQuestion("");
    } catch (err) {
      showApiError(err);
    } finally {
      setBusyKey("agent", false);
    }
  }

  async function handleLogout() {
    await logout();
    showToast("Logged out.");
    router.push("/");
  }

  if (!profile && loading) return null;

  return (
    <>
      <Nav
        variant="dashboard"
        rightSlot={
          <>
            <span className="btn-link mono">{progress.streak} day streak</span>
            <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
          </>
        }
      />

      <div className="dash-shell">
        <aside className="dash-side">
          <div>
            <div className="dash-user">
              <div className="dash-avatar">{userBits.initial}</div>
              <div className="dash-user-info">
                <div className="n">{userBits.display}</div>
                <div className="h">{userBits.handle}</div>
              </div>
            </div>
            <nav className="dash-nav">
              {[
                { id: "today", label: "Today", key: "1" },
                { id: "scanner", label: "Skill Gap", key: "2" },
                { id: "interview", label: "Interview", key: "3" },
                { id: "progress", label: "Progress", key: "4" },
              ].map((n) => (
                <button
                  key={n.id}
                  className={activeNav === n.id ? "active" : ""}
                  onClick={() => setActiveNav(n.id)}
                >
                  {n.label} <span className="key">{n.key}</span>
                </button>
              ))}
              <Link href="/">Home</Link>
            </nav>
          </div>

          <div className="side-agent">
            <span className="label">// agent says</span>
            <div className="side-agent-text">{agentText}</div>
            <div className="side-agent-input">
              <input
                type="text"
                placeholder="Ask what to improve..."
                value={agentQuestion}
                onChange={(e) => setAgentQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAgent()}
              />
              <button onClick={askAgent}>Ask</button>
            </div>
          </div>
        </aside>

        <main className="dash-main">
          {pageError && <div className="error-msg show">{pageError}</div>}
          <div className="dash-h">
            <div>
              <h1>{greeting}</h1>
              <p className="sub mono">{dateLine}</p>
            </div>

            <div className="dash-top-actions">
              <div className={"mood-card-slide" + (activeNav === "today" ? " in" : " out")}>
                {!todayMood && <div className="mood-helper">Select your mood for today.</div>}
                <div className="mood-toggle" aria-label="Mood selector">
                {["low", "neutral", "high"].map((mood) => (
                  <button
                    key={mood}
                    className={todayMood === mood ? "active" : ""}
                    onClick={() => pickMood(mood)}
                    disabled={busy.mood}
                  >
                    {busy.mood && todayMood === mood ? "Saving..." : mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </button>
                ))}
                </div>
              </div>
              {activeNav === "today" && (
                <button className="btn btn-primary" onClick={generateTasks} disabled={busy.generateTasks}>
                  {busy.generateTasks ? "Generating..." : "Generate Daily 3"}
                </button>
              )}
            </div>
          </div>

          {activeNav === "today" && (
            <section className="dash-card span-full">
              <h3>Today&apos;s 3 Non-Negotiables <span className="meta">Build consistency</span></h3>
              <p className="desc">
                Generated from your role, progress, completed tasks, latest skill gaps, and mood history.
              </p>
              <div>
                {busy.dashboard && <p className="desc">Loading today&apos;s tasks...</p>}
                {!busy.dashboard && tasks.length === 0 && <p className="desc">No tasks yet. Click Generate Daily 3.</p>}
                {tasks.map((task) => (
                  <div key={task.id} className="task-row" onClick={() => !task.completed && completeTask(task.id)}>
                    <div className={"task-check" + (task.completed ? " done" : "")} />
                    <div className="task-info">
                      <div className="task-cat">{task.category}</div>
                      <div className={"task-title" + (task.completed ? " done" : "")}>{task.title}</div>
                    <div className="task-sub">
                      {busy[`task-${task.id}`] ? "Updating..." : `${task.description || task.reason} · ${task.estimatedTime}`}
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </section>
          )}

          {activeNav === "scanner" && (
            <section className="dash-card span-full">
              <h3>Skill-Gap Scanner <span className="meta">Find what to improve next</span></h3>
              <p className="desc">Analyze a resume, GitHub README, or manual skills. Updated tasks will reflect this from the next generation.</p>
              <div className="mood-row">
                {[
                  { id: "resume", label: "Paste resume" },
                  { id: "github", label: "Paste GitHub repo" },
                  { id: "manual", label: "Enter skills" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    className={"mood-btn" + (scannerMode === mode.id ? " active" : "")}
                    onClick={() => setScannerMode(mode.id)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <div className="scan-input">
                {scannerMode === "resume" && (
                  <textarea
                    rows={6}
                    placeholder="Paste resume or project summary text..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                )}
                {scannerMode === "github" && (
                  <input
                    type="text"
                    placeholder="https://github.com/username/reponame"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                )}
                {scannerMode === "manual" && (
                  <input
                    type="text"
                    placeholder="React, Node.js, Supabase, REST APIs"
                    value={manualSkills}
                    onChange={(e) => setManualSkills(e.target.value)}
                  />
                )}
                <button className="btn btn-primary" onClick={runSkillGap} disabled={busy.skillGap}>
                  {busy.skillGap ? "Analyzing..." : "Analyze"}
                </button>
              </div>
              {skillGap && (
                <div className="activity-list">
                  <div className="act-row"><div className="act-time">Detected</div><div className="act-text">{skillGap.detectedSkills?.join(", ")}</div></div>
                  <div className="act-row"><div className="act-time">Strengths</div><div className="act-text">{skillGap.strengths?.join(", ")}</div></div>
                  <div className="act-row"><div className="act-time">Missing</div><div className="act-text">{skillGap.missingSkills?.join(", ")}</div></div>
                  <div className="act-row"><div className="act-time">Roadmap</div><div className="act-text">{skillGap.recommendedRoadmap?.join(" · ")}</div></div>
                  <div className="act-row"><div className="act-time">Next</div><div className="act-text">{skillGap.message}</div></div>
                </div>
              )}
              {skillGapHistory.length > 0 && (
                <>
                  <h3 style={{ marginTop: 24 }}>Scan History</h3>
                  <div className="activity-list">
                    {skillGapHistory.map((scan) => (
                      <div className="act-row" key={scan.id}>
                        <div className="act-time">{new Date(scan.createdAt).toLocaleDateString()}</div>
                        <div className="act-text">
                          <strong>{scan.targetRole}</strong>
                          <br />
                          Strengths: {scan.strengths.slice(0, 3).join(", ") || "None"}
                          <br />
                          Missing: {scan.missingSkills.slice(0, 3).join(", ") || "None"}
                          <br />
                          <button
                            className="btn btn-ghost"
                            style={{ marginTop: 8 }}
                            onClick={() => setOpenSkillGapId(openSkillGapId === scan.id ? null : scan.id)}
                          >
                            {openSkillGapId === scan.id ? "Hide details" : "View details"}
                          </button>
                          {openSkillGapId === scan.id && (
                            <div style={{ marginTop: 10 }}>
                              Projects: {scan.projectSuggestions.join(" · ")}
                              <br />
                              Roadmap: {scan.recommendedRoadmap.join(" · ")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {activeNav === "interview" && (
            <section className="dash-card span-full">
              <h3>Mock Interview <span className="meta">Practice answers under pressure</span></h3>
              <p className="desc">Choose interview type and question count. SkillSprint asks one question at a time and can speak it aloud.</p>
              {!interviewStarted && (
                <>
                  <div className="mood-row">
                    {[
                      { id: "hr", label: "HR Interview" },
                      { id: "technical", label: "Technical Interview" },
                    ].map((type) => (
                      <button
                        key={type.id}
                        className={"mood-btn" + (interviewType === type.id ? " active" : "")}
                        onClick={() => setInterviewType(type.id)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <div className="mood-row">
                    {[
                      { count: 2, label: "2 questions" },
                      { count: 6, label: "5–7 questions" },
                      { count: 9, label: "9+ questions" },
                    ].map((option) => (
                      <button
                        key={option.count}
                        className={"mood-btn" + (questionCount === option.count ? " active" : "")}
                        onClick={() => setQuestionCount(option.count)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-primary btn-block" onClick={startInterview}>
                    {busy.interview || busy.voicePermission ? "Starting..." : "Start Interview"}
                  </button>
                </>
              )}
              {interviewStarted && (
                <>
                  {interview && (
                    <div className="activity-list">
                      {!interview.isComplete && (
                        <div className="act-row"><div className="act-time">Question</div><div className="act-text">{interview.reply}</div></div>
                      )}
                      {!interview.isComplete && interview.score > 0 && (
                        <>
                          <div className="act-row"><div className="act-time">Feedback</div><div className="act-text">{interview.feedback}</div></div>
                          <div className="act-row"><div className="act-time">Score</div><div className="act-text">{interview.score}/10 · {interview.improvementTip}</div></div>
                        </>
                      )}
                    </div>
                  )}
                  {busy.interview && !busy.finalReport && !interview?.isComplete && (
                    <div className="activity-list">
                      <div className="act-row">
                        <div className="act-time">Question</div>
                        <div className="act-text">Question loading...</div>
                      </div>
                    </div>
                  )}
                  {busy.finalReport && (
                    <div className="activity-list">
                      <div className="act-row">
                        <div className="act-time">Report</div>
                        <div className="act-text">Final report loading...</div>
                      </div>
                    </div>
                  )}
                  {!interview?.isComplete && !busy.finalReport && (
                    <>
                      <div className="scan-input">
                        <textarea
                          rows={5}
                          placeholder="Answer by voice or type here..."
                          value={interviewMessage}
                          onChange={(e) => setInterviewMessage(e.target.value)}
                        />
                        <button className="btn btn-ghost" onClick={startListening} disabled={busy.voicePermission}>
                          {isListening ? "Listening..." : "Voice"}
                        </button>
                        {isListening && (
                          <button className="btn btn-ghost" onClick={stopListening}>
                            Stop voice
                          </button>
                        )}
                      </div>
                      {interviewType === "technical" && (
                        <div className="scan-input">
                          <textarea
                            rows={8}
                            className="code-textarea"
                            placeholder="// Optional code if the interviewer asks for it"
                            value={interviewCode}
                            onChange={(e) => setInterviewCode(e.target.value)}
                          />
                        </div>
                      )}
                      <button className="btn btn-primary" onClick={() => sendInterviewMessage()} disabled={busy.interview || busy.finalReport}>
                        {busy.interview ? "Submitting..." : "Submit Answer"}
                      </button>
                      <button className="btn btn-ghost" onClick={endInterview} style={{ marginLeft: 8 }} disabled={busy.interview || busy.finalReport}>
                        {busy.finalReport ? "Preparing report..." : "End Interview"}
                      </button>
                    </>
                  )}
                  {interview?.isComplete && (
                    <>
                      <div className="activity-list">
                        <div className="act-row"><div className="act-time">Good</div><div className="act-text">{interview.overallGood?.join(" · ") || "Completed the interview attempt."}</div></div>
                        <div className="act-row"><div className="act-time">Improve</div><div className="act-text">{interview.overallImprove?.join(" · ") || "Add clearer examples, technical detail, and stronger structure."}</div></div>
                        <div className="act-row"><div className="act-time">Final</div><div className="act-text">{interview.finalScore}/10</div></div>
                      </div>
                      <button className="btn btn-primary" onClick={() => setInterviewStarted(false)}>
                        Start Another Interview
                      </button>
                    </>
                  )}
                </>
              )}
              {interviewScoreHistory.length > 0 && (
                <>
                  <h3 style={{ marginTop: 24 }}>Score History</h3>
                  <div className="activity-list">
                    {interviewScoreHistory.slice(0, 6).map((item) => (
                      <div className="act-row" key={item.id}>
                        <div className="act-time">{item.score}/10</div>
                        <div className="act-text">
                          {item.interviewType} · {new Date(item.createdAt).toLocaleDateString()} · {item.feedback}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {activeNav === "progress" && (
            <section className="dash-card span-full">
              <h3>Progress <span className="meta">Track placement readiness</span></h3>
              <div className="score-gauge">
                <div>
                  <div className="label">Readiness Score</div>
                  <div className="value">{progress.readinessScore || 0}</div>
                  <div className="delta">{progress.readinessReason || "Generated from your skills and progress"}</div>
                </div>
                <div className="score-bar">
                  <div className="score-bar-fill" style={{ width: `${progress.readinessScore || 0}%` }} />
                </div>
              </div>
              <div className="port-stats progress-stats">
                <div className="port-stat"><div className="v">{progress.streak}</div><div className="l">Streak</div></div>
                <div className="port-stat"><div className="v">{progress.tasksCompleted}</div><div className="l">Tasks done</div></div>
                <div className="port-stat"><div className="v">{progress.interviewsCompleted}</div><div className="l">Interviews</div></div>
                <div className="port-stat"><div className="v">{progress.completionRate}%</div><div className="l">Completion</div></div>
              </div>
              {moodHistory.length > 0 && (
                <>
                  <h3 style={{ marginTop: 24 }}>Mood History</h3>
                  <div className="mood-graph mood-graph-dated">
                    {moodHistory.slice(0, 7).reverse().map((entry) => {
                      const height = { high: 85, neutral: 60, low: 28 }[entry.mood] || 50;
                      const cls = entry.mood === "low" ? "bad" : entry.mood === "neutral" ? "warn" : "";
                      return (
                        <div className="mood-point" key={entry.id}>
                          <div
                            className={`mood-bar ${cls}`}
                            style={{ height: `${height}%` }}
                            title={`${entry.mood} · ${new Date(entry.createdAt).toLocaleDateString()}`}
                          />
                          <div className="mood-date">{formatShortDate(entry.createdAt)}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {moodHistory.length === 0 && (
                <>
                  <h3 style={{ marginTop: 24 }}>Mood History</h3>
                  <p className="desc">No mood history yet. Select your mood today to begin.</p>
                </>
              )}
              <h3 style={{ marginTop: 24 }}>Skills</h3>
              <div className={"skill-chip-row" + (showAllSkills ? "" : " collapsed")}>
                {(profile?.skills || []).length === 0 && <p className="desc">No skills saved yet. Run the Skill-Gap Scanner.</p>}
                {(profile?.skills || []).map((skill) => (
                  <span className="skill-chip" key={skill}>{skill}</span>
                ))}
              </div>
              {(profile?.skills || []).length > 0 && (
                <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => setShowAllSkills((value) => !value)}>
                  {showAllSkills ? "Show less" : "Show all skills"}
                </button>
              )}
            </section>
          )}
        </main>
      </div>
    </>
  );
}
