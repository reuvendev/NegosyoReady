"use client";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Heading, Notice, EmptyProfile, Meter } from "@/components/ui";
import { applicable, dueDays } from "@/lib/data";
import { coverageFor } from "@/lib/documents";
import { readinessFor } from "@/lib/readiness";
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
  const live = readinessFor(state);
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
      <div className="card readiness-status-card" style={{ marginBottom: 18 }}>
        <div className="muted small">Current business preparation status</div>
        <div className="readiness-status-title">{live.statusLabel}</div>
        <div className="feature-number">
          {live.progress}%{" "}
          <span className="muted small">preparation progress</span>
        </div>
        <div className="progress">
          <div style={{ width: `${live.progress}%` }} />
        </div>
        <p className="muted small">
          Based on saved checklist items, document groups, self-checks and AI
          findings. Not an official approval or compliance certification.
        </p>
        <h3 className="section-heading" style={{ fontSize: 16, marginTop: 16 }}>
          What to do next
        </h3>
        {live.nextActions.length ? (
          <ul className="feature-list">
            {live.nextActions.slice(0, 4).map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        ) : (
          <p className="muted small">
            No outstanding preparation actions identified from the saved
            records. Confirm requirements with the relevant authorities.
          </p>
        )}
        <div
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}
        >
          <Link className="btn secondary" href="/documents">
            Documents
          </Link>
          <Link className="btn secondary" href="/inspection">
            Inspection
          </Link>
          <Link className="btn secondary" href="/requirements">
            Checklist
          </Link>
        </div>
      </div>
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
      <div className="card" style={{ marginTop: 20 }}>
        <div className="summary-heading">
          <h2 className="section-heading">Connected readiness summary</h2>
          <Link className="btn secondary" href="/passport">
            Open passport
          </Link>
        </div>
        <div className="feature-number">{live.progress}%</div>
        <Meter value={live.progress} />
        <p className="muted small">
          {live.prepared}/{live.steps.length} preparation steps ·{" "}
          {live.uploaded}/{live.coverage.length} document groups ·{" "}
          {live.inspectionDone}/5 manual inspection checks
        </p>
        <p className="muted small">
          {live.photoReviews.length} saved AI photo reviews ·{" "}
          {live.photoConcerns} concerns in latest review · {live.expired}{" "}
          expired records
        </p>
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
      <div className="grid2" style={{ marginTop: 18, marginBottom: 18 }}>
        <div className="card">
          <h2 className="section-heading">Business readiness assessment</h2>
          <p className="muted small" style={{ margin: "12px 0" }}>
            See preparation steps and document groups based on your business
            profile.
          </p>
          <Link className="btn" href="/assessment">
            Start assessment
          </Link>
        </div>
        <div className="card">
          <h2 className="section-heading">Compliance passport</h2>
          <p className="muted small" style={{ margin: "12px 0" }}>
            Review your documents, checklist progress, and upcoming renewals
            together.
          </p>
          <Link className="btn secondary" href="/passport">
            View passport
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
