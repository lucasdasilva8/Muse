import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/artist/apply", label: "List yourself" },
  { href: "/artist/dashboard", label: "Artist dashboard" },
  { href: "/portfolio", label: "Portfolio" },
];

export function AppShell({
  children,
  active,
}: {
  children: ReactNode;
  active?: string;
}) {
  return (
    <>
      <div className="banner">
        <strong>PROTOTYPE — not fully functioning.</strong> Simulated listings
        &amp; commitments only. No payments, no real accounts, no securities
        offering.
      </div>
      <nav className="shell-nav">
        <div className="shell-nav-inner">
          <Link href="/" className="logo">
            MUSE
          </Link>
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={active === l.href ? "active" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="container">{children}</div>
    </>
  );
}
