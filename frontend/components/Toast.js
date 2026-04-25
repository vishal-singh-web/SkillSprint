"use client";

import { useEffect, useState } from "react";

export const TOAST_EVENT = "skillsprint-toast";

export function showToast(message) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
}

export default function Toast() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;
    function handler(e) {
      setMsg(e.detail);
      setShow(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShow(false), 2400);
    }
    window.addEventListener(TOAST_EVENT, handler);
    return () => {
      window.removeEventListener(TOAST_EVENT, handler);
      clearTimeout(timer);
    };
  }, []);

  return <div className={"toast" + (show ? " show" : "")}>{msg}</div>;
}
