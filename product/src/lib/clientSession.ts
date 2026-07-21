"use client";

const KEY = "muse.prototype.session";

export type ClientSession = {
  role: "fan" | "artist" | "admin" | null;
  name: string;
  email: string;
};

export function readClientSession(): ClientSession {
  if (typeof window === "undefined") {
    return { role: null, name: "", email: "" };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { role: null, name: "", email: "" };
    return JSON.parse(raw) as ClientSession;
  } catch {
    return { role: null, name: "", email: "" };
  }
}

export function writeClientSession(session: ClientSession) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearClientSession() {
  localStorage.removeItem(KEY);
}
