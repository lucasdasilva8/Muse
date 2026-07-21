"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiSetSession } from "@/lib/api";
import {
  clearClientSession,
  readClientSession,
  writeClientSession,
  type ClientSession,
} from "@/lib/clientSession";

export default function SessionPage() {
  const [session, setSession] = useState<ClientSession>({
    role: null,
    name: "",
    email: "",
  });
  const [role, setRole] = useState<"fan" | "artist" | "admin">("fan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const s = readClientSession();
    setSession(s);
    if (s.email) setEmail(s.email);
    if (s.name) setName(s.name);
    if (s.role === "fan" || s.role === "artist" || s.role === "admin") {
      setRole(s.role);
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Email is required for the prototype session.");
      return;
    }

    const next: ClientSession = {
      role,
      name: name.trim() || (role === "artist" ? "Artist" : "Fan"),
      email: email.trim(),
    };
    writeClientSession(next);
    setSession(next);

    try {
      if (role === "fan") {
        await apiSetSession({ role: "fan", email: next.email });
      } else if (role === "artist") {
        await apiSetSession({ role: "artist", email: next.email });
      }
      setMessage(
        "Prototype session saved in this browser. Not real authentication."
      );
    } catch (err) {
      // Client session still works even if server bind fails (e.g. no artist yet)
      setMessage(
        err instanceof Error
          ? `${err.message} — local session still saved.`
          : "Local session saved."
      );
    }
  }

  function onClear() {
    clearClientSession();
    void apiSetSession({ role: "clear" });
    setSession({ role: null, name: "", email: "" });
    setMessage("Session cleared.");
  }

  return (
    <AppShell active="/session">
      <p className="eyebrow">Prototype session</p>
      <h1>Continue as fan, artist, or admin</h1>
      <p className="lead">
        Lightweight identity for demos — email + role in this browser. Not login,
        not secure, not production auth.
      </p>

      <div className="grid-2">
        <form className="card" onSubmit={onSubmit}>
          <div className="field">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "fan" | "artist" | "admin")
              }
            >
              <option value="fan">Fan / investor</option>
              <option value="artist">Artist</option>
              <option value="admin">Admin (review queue)</option>
            </select>
          </div>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="error">{error}</p>}
          {message && <p className="callout-ok callout">{message}</p>}
          <div className="btn-row">
            <button className="btn" type="submit">
              Save prototype session
            </button>
            <button className="btn btn-outline" type="button" onClick={onClear}>
              Clear
            </button>
          </div>
        </form>

        <aside className="card">
          <h2>Current session</h2>
          {session.role ? (
            <>
              <p>
                <strong>{session.role}</strong> · {session.name || "—"}
              </p>
              <p className="muted">{session.email}</p>
              <div className="btn-row">
                {session.role === "fan" && (
                  <Link className="btn" href="/browse">
                    Browse
                  </Link>
                )}
                {session.role === "artist" && (
                  <Link className="btn" href="/artist/dashboard">
                    Artist dashboard
                  </Link>
                )}
                {session.role === "admin" && (
                  <Link className="btn" href="/admin">
                    Admin queue
                  </Link>
                )}
              </div>
            </>
          ) : (
            <p className="muted">No session yet.</p>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
