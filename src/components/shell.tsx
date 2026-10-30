"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Files,
  ShieldCheck,
  CalendarClock,
  Settings,
  Home,
  BriefcaseBusiness,
} from "lucide-react";
import { StoreProvider, useStore } from "./store";
const links = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/requirements", label: "Requirements", Icon: ClipboardList },
  { href: "/documents", label: "Documents", Icon: Files },
  { href: "/inspection", label: "Inspection readiness", Icon: ShieldCheck },
  { href: "/renewal", label: "Renewal tracker", Icon: CalendarClock },
  { href: "/settings", label: "Settings", Icon: Settings },
];
function Inner({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { state, ready } = useStore();
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link
          href="/"
          className="brand"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontWeight: 900,
            fontSize: 19,
            padding: "8px 12px",
          }}
        >
          <BriefcaseBusiness size={23} color="#1552ae" /> NEGOSYO READY
        </Link>
        <div className="muted small" style={{ padding: "0 12px 16px" }}>
          Business preparation workspace
        </div>
        <nav>
          {links.map(({ href, label, Icon }) => (
            <Link
              className={`navlink ${path === href ? "active" : ""}`}
              key={href}
              href={href}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <Link className="navlink" href="/">
            <Home size={18} />
            Home
          </Link>
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <span className="tag">
            Hackathon demo · Not an official government service
          </span>
          <span className="muted small">
            {state.business?.name || "No business profile"}
          </span>
        </div>
        {ready ? (
          children
        ) : (
          <div className="card muted" role="status">
            Loading your workspace…
          </div>
        )}
      </main>
    </div>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Inner>{children}</Inner>
    </StoreProvider>
  );
}
