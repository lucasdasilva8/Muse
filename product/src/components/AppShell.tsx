"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

const links = [
  { href: "/browse", label: "Browse" },
  { href: "/artist/apply", label: "Artists" },
  { href: "/portfolio", label: "Fans" },
  { href: "/admin", label: "Admin" },
  { href: "/session", label: "Session" },
];

export function AppShell({
  children,
  active,
  home = false,
}: {
  children: ReactNode;
  active?: string;
  home?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="banner">
        <strong>Prototype</strong> — simulated product only. No payments or
        securities offering.{" "}
        <a href="https://lucasdasilva8.github.io/Muse/" target="_blank" rel="noreferrer">
          Marketing site
        </a>
      </div>

      <nav className="site-nav" aria-label="Primary">
        <div className="container">
          <Link href="/" className="logo">
            MUSE
          </Link>
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
          <ul className={`nav-links${open ? " is-open" : ""}`}>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={active === l.href ? "active" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="nav-cta" href="/artist/apply" onClick={() => setOpen(false)}>
                List yourself
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {home ? children : <div className="app-main">{children}</div>}

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">MUSE</div>
              <p>Revenue shares for artists and the fans who believe in them.</p>
            </div>
            <ul className="footer-links">
              <li>
                <Link href="/browse">Browse</Link>
              </li>
              <li>
                <Link href="/artist/apply">Artists</Link>
              </li>
              <li>
                <Link href="/portfolio">Portfolio</Link>
              </li>
              <li>
                <Link href="/session">Session</Link>
              </li>
              <li>
                <a
                  href="https://lucasdasilva8.github.io/Muse/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Marketing site
                </a>
              </li>
            </ul>
          </div>
          <p className="footer-meta">
            Prototype only. Not an offer to sell securities. Music revenue is
            uncertain — you can lose money.
          </p>
        </div>
      </footer>
    </>
  );
}
