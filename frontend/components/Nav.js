"use client";

import Link from "next/link";

export default function Nav({ variant = "marketing", rightSlot }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href={variant === "dashboard" ? "/dashboard" : "/"} className="logo">
          <span className="logo-mark">&gt;_</span>
          <span className="logo-text">SkillSprint</span>
          <span className="logo-batch">2026</span>
        </Link>

        {variant === "marketing" && (
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#manifesto">Manifesto</a>
            <a href="#faq">FAQ</a>
          </nav>
        )}

        <div className="nav-actions">
          {rightSlot ? (
            rightSlot
          ) : (
            <>
              <Link href="/login" className="btn-link">Log in</Link>
              <Link href="/signup" className="btn btn-primary">Get Early Access</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
