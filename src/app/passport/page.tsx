"use client";

import Link from "next/link";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { EmptyProfile, Heading, Meter, Notice } from "@/components/ui";
import { applicable, dueDays } from "@/lib/data";
import { documentStatusLabel } from "@/lib/documents";
import { readinessFor } from "@/lib/readiness";

function Content() {
  const { state } = useStore();
  const business = state.business;
  if (!business)
    return (
      <>
        <Heading
          title="Compliance Passport"
          description="Your business preparation record"
        />
        <EmptyProfile />
      </>
    );

  const metrics = readinessFor(state);
  const {
    steps,
    coverage,
    progress,
    photoReviews,
    latestPhotoReview,
    photoConcerns,
  } = metrics;
  const checked = metrics.prepared;
  const uploaded = metrics.uploaded;
  const flagged = metrics.flagged;
  const dated = state.documents
    .map((doc) => ({ doc, days: dueDays(doc.expires) }))
    .filter(
      (row): row is { doc: (typeof state.documents)[number]; days: number } =>
        row.days !== null,
    )
    .sort((a, b) => a.days - b.days);
  const upcoming = dated.filter((row) => row.days <= 60);

  return (
    <>
      <Heading
        title="Compliance Passport"
        description="One view of your business records and preparation progress"
      />
      <div className="card readiness-status-card" style={{ marginBottom: 18 }}>
        <div className="muted small">Current business preparation status</div>
        <div className="readiness-status-title">{metrics.statusLabel}</div>
        <div className="feature-number">
          {metrics.progress}%{" "}
          <span className="muted small">preparation progress</span>
        </div>
        <div className="progress">
          <div style={{ width: `${metrics.progress}%` }} />
        </div>
        <p className="muted small">
          Based on saved checklist items, document groups, self-checks and AI
          findings. Not an official approval or compliance certification.
        </p>
        <h3 className="section-heading" style={{ fontSize: 16, marginTop: 16 }}>
          What to do next
        </h3>
        {metrics.nextActions.length ? (
          <ul className="feature-list">
            {metrics.nextActions.slice(0, 4).map((action, i) => (
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
      </div>{" "}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="summary-heading">
          <div>
            <h2 className="section-heading">{business.name}</h2>
            <p className="muted small">
              {business.category} · {business.location} ·{" "}
              {business.stage === "new" ? "Planning / new" : "Operating"}
            </p>
          </div>
          <Link href="/onboarding" className="btn secondary">
            Edit profile
          </Link>
        </div>
        <div className="muted small" style={{ marginBottom: 8 }}>
          Preparation progress (not an official compliance score)
        </div>
        <div className="feature-number">{progress}%</div>
        <Meter value={progress} />
        <p className="muted small" style={{ marginTop: 12 }}>
          Calculated from preparation steps, uploaded document groups, and the
          manual self-check. This does not mean the business has passed an
          inspection.
        </p>
      </div>
      <div className="grid3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="muted small">Preparation steps</div>
          <div className="feature-number">
            {checked} / {steps.length}
          </div>
        </div>
        <div className="card">
          <div className="muted small">Document groups uploaded</div>
          <div className="feature-number">
            {uploaded} / {coverage.length}
          </div>
        </div>
        <div className="card">
          <div className="muted small">Groups needing attention</div>
          <div className="feature-number">{flagged}</div>
        </div>
      </div>
      <div className="grid2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="summary-heading">
            <h2 className="section-heading">Documents</h2>
            <Link href="/documents" className="btn secondary">
              Manage
            </Link>
          </div>
          {coverage.map((group) => (
            <div className="checkrow" key={group.need.id}>
              <span>
                <strong>{group.need.title}</strong>
                <span
                  className="muted small"
                  style={{ display: "block", marginTop: 5 }}
                >
                  {documentStatusLabel(group.status)}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="summary-heading">
            <h2 className="section-heading">Renewals & dates</h2>
            <Link href="/renewal" className="btn secondary">
              View tracker
            </Link>
          </div>
          {upcoming.length ? (
            upcoming.map(({ doc, days }) => (
              <div className="checkrow" key={doc.id}>
                <span>
                  <strong>{doc.name}</strong>
                  <span
                    className="muted small"
                    style={{ display: "block", marginTop: 5 }}
                  >
                    {days < 0
                      ? `Expired ${-days} days ago`
                      : days === 0
                        ? "Expires today"
                        : `Expires in ${days} days`}{" "}
                    · {doc.expires}
                  </span>
                </span>
              </div>
            ))
          ) : (
            <p className="muted small">
              No saved records expiring within 60 days. This does not confirm
              that all renewal dates have been recorded.
            </p>
          )}
        </div>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="summary-heading">
          <h2 className="section-heading">Self-check history</h2>
          <Link href="/inspection" className="btn secondary">
            Open inspection
          </Link>
        </div>
        <p className="muted small">
          {state.inspection.length} of the current manual inspection checklist
          items marked complete.
        </p>
        <p className="muted small">
          {latestPhotoReview
            ? `Latest AI photo screening: ${latestPhotoReview.overall.replaceAll("_", " ")} (${photoConcerns} potential concerns).`
            : "No AI photo screening saved yet."}
        </p>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="summary-heading">
          <h2 className="section-heading">AI photo screening history</h2>
          <Link className="btn secondary" href="/inspection">
            Check photos
          </Link>
        </div>
        {photoReviews.length ? (
          photoReviews.slice(0, 6).map((review, i) => (
            <div className="checkrow" key={`${review.reviewedAt}-${i}`}>
              <div>
                <strong>
                  {review.overall === "needs_attention"
                    ? "Potential concerns"
                    : review.overall === "no_visible_issues"
                      ? "No obvious issues visible"
                      : "More evidence needed"}
                </strong>
                <p className="muted small">
                  {new Date(review.reviewedAt).toLocaleString()} ·{" "}
                  {review.photoCount ?? "?"} photos ·{" "}
                  {
                    review.findings.filter(
                      (f) => f.result === "potential_issue",
                    ).length
                  }{" "}
                  potential concerns
                </p>
                <p className="muted small">{review.summary}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="muted small">
            No saved photo reviews. Analyze establishment photos on the
            Inspection page.
          </p>
        )}
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <h2 className="section-heading">Next actions across your workspace</h2>
        <div className="stack">
          {metrics.missing > 0 && (
            <p>
              <Link href="/documents">
                Upload {metrics.missing} missing document groups
              </Link>
            </p>
          )}
          {metrics.flagged > 0 && (
            <p>
              <Link href="/documents">
                Review {metrics.flagged} document groups needing attention
              </Link>
            </p>
          )}
          {(metrics.expired > 0 || metrics.dueSoon > 0) && (
            <p>
              <Link href="/renewal">
                Check {metrics.expired} expired and {metrics.dueSoon} upcoming
                document dates
              </Link>
            </p>
          )}
          {metrics.prepared < steps.length && (
            <p>
              <Link href="/requirements">
                Complete {steps.length - metrics.prepared} preparation steps
              </Link>
            </p>
          )}
          {metrics.inspectionDone < 5 && (
            <p>
              <Link href="/inspection">
                Finish the manual establishment self-check
              </Link>
            </p>
          )}
        </div>
      </div>
      <Notice />
      <p className="muted small" style={{ marginTop: 14 }}>
        Demo passport stored in this browser. It is not an LGU-issued
        certificate or proof of legal compliance.
      </p>
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
