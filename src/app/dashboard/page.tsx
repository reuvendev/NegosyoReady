"use client";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Heading, Notice, EmptyProfile, Meter } from "@/components/ui";
import { applicable, dueDays } from "@/lib/data";
import { coverageFor } from "@/lib/documents";
function Content() {
  const { state } = useStore();
  if (!state.business)
    return (
      <>
        <Heading
          title="Dashboard"
          description="Your business preparation overview"
        />
        <EmptyProfile />
      </>
    );
  const req = applicable(state.business.category);
  const completed = req.filter((r) => state.completed.includes(r.id)).length;
  const percent = Math.round((completed / req.length) * 100);
  const coverage = coverageFor(state.business.category, state.documents);
  const missing = coverage.filter((x) => x.status === "missing").length;
  const flagged = coverage.filter((x) => x.status === "needs_review").length;
  const exp = state.documents.filter((d) => {
    const days = dueDays(d.expires);
    return days !== null && days <= 30;
  }).length;
  return (
    <>
      <Heading
        title={`Welcome, ${state.business.name}`}
        description={`${state.business.category} · ${state.business.location} · ${state.business.stage === "new" ? "Planning / new" : "Operating"}`}
      />
      <div className="grid3">
        <div className="card">
          <div className="muted small">Checklist progress</div>
          <div style={{ fontSize: 34, fontWeight: 900, margin: "12px 0" }}>
            {percent}%
          </div>
          <Meter value={percent} />
          <p className="muted small" style={{ marginTop: 12 }}>
            {completed} of {req.length} illustrative items marked done
          </p>
        </div>
        <div className="card">
          <div className="muted small">Document group coverage</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 12 }}>
            {coverage.length - missing} / {coverage.length}
          </div>
          <p className="muted small">
            {missing} missing · {flagged} flagged for review
          </p>
        </div>
        <div className="card">
          <div className="muted small">Expiring / expired records</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 12 }}>
            {exp}
          </div>
          <p className="muted small">Based only on dates you entered</p>
        </div>
      </div>
      <div className="grid2" style={{ marginTop: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: 14 }}>
            Continue preparing
          </h2>
          <p className="muted" style={{ marginBottom: 22 }}>
            Review illustrative preparation steps alongside your upload
            checklist.
          </p>
          <Link className="btn" href="/requirements">
            View requirements
          </Link>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: 14 }}>
            Keep records organized
          </h2>
          <p className="muted" style={{ marginBottom: 22 }}>
            Upload your documents, identify missing groups, and request a
            cautious AI visual review.
          </p>
          <Link className="btn secondary" href="/documents">
            Upload documents
          </Link>
        </div>
      </div>
      <Notice />
    </>
  );
}
export default function Page() {
  return (
    <Shell>
      <Content />
    </Shell>
  );
}
