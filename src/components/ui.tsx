import Link from "next/link";
export function Heading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h1 className="h2">{title}</h1>
      <p className="muted" style={{ marginTop: 8 }}>
        {description}
      </p>
    </div>
  );
}
export function Notice() {
  return (
    <div className="notice" style={{ marginTop: 22 }}>
      Demo guidance only. Requirements, checklists, and readiness scores are
      illustrative and must be confirmed with official Baguio City and national
      government sources. This app does not issue permits, certify compliance,
      or replace inspections.
    </div>
  );
}
export function EmptyProfile() {
  return (
    <div className="card">
      <h2 style={{ fontSize: 22, fontWeight: 800 }}>
        Set up your business first
      </h2>
      <p className="muted" style={{ margin: "12px 0 22px" }}>
        Create a business profile to personalize this demo workspace.
      </p>
      <Link href="/onboarding" className="btn">
        Start onboarding
      </Link>
    </div>
  );
}
export function Meter({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
