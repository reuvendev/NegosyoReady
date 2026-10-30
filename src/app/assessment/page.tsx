"use client";

import Link from "next/link";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { EmptyProfile, Heading, Notice } from "@/components/ui";
import { applicable, applicableDocuments } from "@/lib/data";
import { coverageFor } from "@/lib/documents";
import { readinessFor } from "@/lib/readiness";

function Content() {
  const { state } = useStore();
  const business = state.business;
  if (!business) {
    return (
      <>
        <Heading
          title="Business Readiness Assessment"
          description="Start with your business profile"
        />
        <EmptyProfile />
      </>
    );
  }

  const live = readinessFor(state);
  const steps = applicable(business.category);
  const groups = applicableDocuments(business.category);
  const coverage = coverageFor(business.category, state.documents);
  const foodBusiness = ["Eatery / Restaurant", "Café / Coffee Shop"].includes(
    business.category,
  );
  const details = [
    { label: "Business type", value: business.category },
    { label: "Location", value: business.location || "Not specified" },
    {
      label: "Stage",
      value: business.stage === "new" ? "Planning / new" : "Already operating",
    },
    { label: "Activities", value: business.activities || "Not specified" },
    { label: "Ownership", value: business.ownership || "Not specified" },
    { label: "Premises", value: business.premises || "Not specified" },
  ];
  const followUps = [
    !business.ownership &&
      "Confirm your ownership structure to check the relevant registration pathway.",
    !business.activities &&
      "Describe your actual activities or services to help identify additional requirements.",
    !business.premises &&
      "Confirm whether the business premises are owned, rented, home-based, or online-only.",
    !business.location.trim() && "Specify the business location and barangay.",
    foodBusiness &&
      "Ask the city health office which food-handling and sanitation records apply to your operation.",
    business.premises === "Rented" &&
      "Check whether your permit application requires a lease or proof of authority to use the premises.",
    business.stage === "existing" &&
      "Review your current permit validity and renewal schedule.",
  ].filter((value): value is string => Boolean(value));

  return (
    <>
      <Heading
        title="Business Readiness Assessment"
        description="Personalized preparation guidance based on your business profile"
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
      </div>{" "}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="summary-heading">
          <h2 className="section-heading">Your business details</h2>
          <Link className="btn secondary" href="/onboarding">
            Edit profile
          </Link>
        </div>
        <div className="grid2">
          {details.map(({ label, value }) => (
            <div key={label}>
              <div className="muted small">{label}</div>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="grid2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="muted small">Preparation steps</div>
          <div className="feature-number">{steps.length}</div>
          <p className="muted small">
            Illustrative steps for your business type
          </p>
        </div>
        <div className="card">
          <div className="muted small">Missing document groups</div>
          <div className="feature-number">
            {coverage.filter((c) => c.status === "missing").length} /{" "}
            {groups.length}
          </div>
          <p className="muted small">
            0 means every expected group has a saved document record. AI checks
            do not confirm official approval.
          </p>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <h2 className="section-heading">
          Potentially applicable preparation steps
        </h2>
        {steps.map((step) => (
          <div className="checkrow" key={step.id}>
            <span>
              <strong>{step.title}</strong>
              <span
                className="muted small"
                style={{ display: "block", marginTop: 6 }}
              >
                {step.detail}
              </span>
              <span className="pill" style={{ marginTop: 8 }}>
                {state.completed.includes(step.id)
                  ? "Marked prepared"
                  : "To review"}
              </span>
            </span>
          </div>
        ))}
        <Link href="/requirements" className="btn" style={{ marginTop: 18 }}>
          Manage checklist
        </Link>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <h2 className="section-heading">Document preparation</h2>
        {coverage.map(({ need, status }) => (
          <div className="checkrow" key={need.id}>
            <span>
              <strong>{need.title}</strong>
              <span
                className="muted small"
                style={{ display: "block", marginTop: 6 }}
              >
                {status === "missing"
                  ? "No uploaded record"
                  : status === "needs_review"
                    ? "Needs attention"
                    : status === "visually_checked"
                      ? "AI visually checked"
                      : "Uploaded, not yet reviewed"}
              </span>
            </span>
          </div>
        ))}
        <Link
          href="/documents"
          className="btn secondary"
          style={{ marginTop: 18 }}
        >
          Open documents
        </Link>
      </div>
      {followUps.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h2 className="section-heading">Questions to verify</h2>
          <ul className="feature-list">
            {followUps.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="card" style={{ marginBottom: 18 }}>
        <h2 className="section-heading">Connected checks</h2>
        <p className="muted small">
          Manual establishment checks: {live.inspectionDone}/5. AI photo
          reviews: {live.photoReviews.length}. Potential concerns in latest
          review: {live.photoConcerns}.
        </p>
        <p className="muted small">
          Expired documents: {live.expired}. Upcoming dates within 60 days:{" "}
          {live.dueSoon}.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn secondary" href="/inspection">
            Review inspection
          </Link>
          <Link className="btn secondary" href="/renewal">
            Review renewals
          </Link>
          <Link className="btn" href="/passport">
            View passport
          </Link>
        </div>
      </div>
      <Notice />
      <p className="muted small" style={{ marginTop: 14 }}>
        This assessment is a planning aid, not a verified or exhaustive list of
        Baguio City permit requirements. Confirm current applicability with the
        relevant offices.
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
