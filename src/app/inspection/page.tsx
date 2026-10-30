"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Heading, Notice, EmptyProfile, Meter } from "@/components/ui";
import { inspections } from "@/lib/data";
import {
  Camera,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  UploadCloud,
} from "lucide-react";

import type { PhotoReview } from "@/lib/data";
function Content() {
  const { state, save } = useStore();
  const [photos, setPhotos] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<PhotoReview | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);
  if (!state.business)
    return (
      <>
        <Heading
          title="Inspection readiness"
          description="Self-check your preparations"
        />
        <EmptyProfile />
      </>
    );
  const done = inspections.filter((i) =>
    state.inspection.includes(i.id),
  ).length;
  async function analyze() {
    if (!state.business || !photos.length || !consent || busy) return;
    setBusy(true);
    setError("");
    setReview(null);
    try {
      const body = new FormData();
      body.set("category", state.business.category);
      body.set("consent", "yes");
      photos.forEach((p) => body.append("photos", p));
      const res = await fetch("/api/inspection/review", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Photo analysis failed");
      const nextReview = {
        ...(data.review as PhotoReview),
        photoCount: photos.length,
      };
      setReview(nextReview);
      save({
        ...state,
        photoReviews: [nextReview, ...(state.photoReviews ?? [])].slice(0, 12),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Photo analysis failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Inspection preparation"
        description="Self-assessment and AI photo screening. Not an official government inspection."
      />
      <div className="stack">
        <section className="card">
          <div className="summary-heading">
            <div>
              <h2 className="section-heading">AI establishment photo check</h2>
              <p className="muted small" style={{ marginTop: 7 }}>
                Upload up to 3 photos (you can select them one at a time). All
                selected photos stay visible below. AI identifies possible
                visible concerns and suggests what to inspect yourself.
              </p>
            </div>
            <Camera size={28} color="#1455bb" />
          </div>
          <div className="privacy-note" style={{ marginBottom: 16 }}>
            <AlertTriangle size={19} style={{ flexShrink: 0 }} />
            <span>
              Photos are sent to OpenAI for analysis. Avoid faces, IDs, private
              details, and unrelated people. A photo cannot establish whether an
              LGU inspection will pass. The checks are illustrative until
              verified against applicable Baguio requirements.
            </span>
          </div>
          <label className="label" htmlFor="establishment-photos">
            Establishment photos (JPG, PNG or WebP, max 5 MB each)
          </label>
          <input
            id="establishment-photos"
            className="field"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
            onChange={(e) => {
              const next = Array.from(e.target.files || []);
              setPhotos((prev) => [...prev, ...next].slice(0, 3));
              setReview(null);
              setError("");
              e.target.value = "";
            }}
          />
          {photos.length > 3 && (
            <p className="feedback error" style={{ marginTop: 10 }}>
              Select no more than 3 photos.
            </p>
          )}
          {photos.some((f) => f.size > 5 * 1024 * 1024) && (
            <p className="feedback error" style={{ marginTop: 10 }}>
              Each photo must be 5 MB or less.
            </p>
          )}
          {photos.length > 0 && (
            <>
              <div className="summary-heading" style={{ marginTop: 16 }}>
                <strong>All uploaded photos ({photos.length}/3)</strong>
                <button
                  className="btn ghost"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setPhotos([]);
                    setReview(null);
                  }}
                >
                  Clear all
                </button>
              </div>
              <div className="photo-preview-grid">
                {photos.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="photo-preview">
                    {previews[i] && (
                      <a
                        href={previews[i]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open full photo ${i + 1}`}
                      >
                        <img
                          src={previews[i]}
                          alt={`Selected establishment photo ${i + 1}`}
                        />
                      </a>
                    )}
                    <div className="muted small">
                      Photo {i + 1}: {f.name}
                    </div>
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={busy}
                      onClick={() => {
                        setPhotos((prev) => prev.filter((_, j) => j !== i));
                        setReview(null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <label className="consent-row" style={{ marginTop: 16 }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy}
            />
            <span>
              I am authorized to share these establishment photos with OpenAI
              for preliminary AI review.
            </span>
          </label>
          <div style={{ marginTop: 16 }}>
            <button
              className="btn"
              disabled={
                busy ||
                !consent ||
                photos.length < 1 ||
                photos.length > 3 ||
                photos.some((f) => f.size > 5 * 1024 * 1024)
              }
              onClick={analyze}
            >
              <UploadCloud size={17} />
              {busy ? "Analyzing photos…" : "Analyze establishment photos"}
            </button>
          </div>
          {busy && (
            <p className="muted small" role="status" style={{ marginTop: 12 }}>
              Reviewing visible conditions. This may take a minute.
            </p>
          )}
          {error && (
            <p
              className="feedback error"
              role="alert"
              style={{ marginTop: 12 }}
            >
              {error}
            </p>
          )}
        </section>
        {review && (
          <section className="card" aria-live="polite">
            <h3 className="section-heading">
              Photos reviewed ({photos.length})
            </h3>
            <div className="photo-preview-grid">
              {photos.map((f, i) => (
                <div key={`review-${i}`} className="photo-preview">
                  {previews[i] && (
                    <a
                      href={previews[i]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={previews[i]} alt={`Reviewed photo ${i + 1}`} />
                    </a>
                  )}
                  <p className="muted small">
                    Photo {i + 1}: {f.name}
                  </p>
                </div>
              ))}
            </div>
            <div className="summary-heading">
              <h2 className="section-heading">Photo review results</h2>
              <span
                className={`result-pill ${review.overall === "needs_attention" ? "result-warning" : review.overall === "no_visible_issues" ? "result-good" : "result-unknown"}`}
              >
                {review.overall === "needs_attention"
                  ? "Potential concerns"
                  : review.overall === "no_visible_issues"
                    ? "No obvious issues seen"
                    : "More photos needed"}
              </span>
            </div>
            <p style={{ lineHeight: 1.6 }}>{review.summary}</p>
            <p className="muted small" style={{ marginTop: 8 }}>
              AI-assisted visual screening only. No approval or inspection pass
              prediction.
            </p>
            <div
              className="result-section result-section-warning"
              style={{ marginTop: 18 }}
            >
              <h3>Potential concerns & inspection observations</h3>
              <p className="muted small">
                Review each finding below. These are not official inspection
                results.
              </p>
            </div>
            <div className="stack" style={{ marginTop: 12 }}>
              {review.findings.map((f, i) => (
                <div className="review-box" key={i}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {f.result === "potential_issue" ? (
                      <AlertTriangle color="#aa6216" size={19} />
                    ) : f.result === "no_visible_issue" ? (
                      <CheckCircle2 color="#23744b" size={19} />
                    ) : (
                      <HelpCircle color="#5a6c86" size={19} />
                    )}
                    <strong className="inspection-criterion">
                      {f.criterion}
                    </strong>
                  </div>
                  <span
                    className={`result-pill ${f.result === "potential_issue" ? "result-warning" : f.result === "no_visible_issue" ? "result-good" : "result-unknown"}`}
                  >
                    {f.result === "potential_issue"
                      ? "Potential visible issue"
                      : f.result === "no_visible_issue"
                        ? "No issue visible in provided photo"
                        : "Cannot verify from photos"}
                    {f.photoNumber > 0 ? ` · Photo ${f.photoNumber}` : ""}
                  </span>
                  <div>{f.observation}</div>
                  {f.action && (
                    <div>
                      <strong>Suggested next step: </strong>
                      {f.action}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {review.suggestedPhotos.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <strong>Additional photos that may help</strong>
                <ul style={{ paddingLeft: 20, marginTop: 9 }}>
                  {review.suggestedPhotos.map((s, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
        {(state.photoReviews?.length ?? 0) > 0 && (
          <section className="card">
            <div className="summary-heading">
              <h2 className="section-heading">Saved photo review history</h2>
              <a className="btn secondary" href="/passport">
                View in passport
              </a>
            </div>
            <p className="muted small">
              Only the AI findings and review dates are saved in this browser,
              not the photo files.
            </p>
            {(state.photoReviews ?? []).slice(0, 5).map((r, i) => (
              <div className="checkrow" key={`${r.reviewedAt}-${i}`}>
                <span>
                  <strong>
                    {r.overall === "needs_attention"
                      ? "Potential concerns"
                      : r.overall === "no_visible_issues"
                        ? "No obvious issues visible"
                        : "More evidence needed"}
                  </strong>
                  <span className="muted small" style={{ display: "block" }}>
                    {new Date(r.reviewedAt).toLocaleString()} ·{" "}
                    {r.photoCount ?? "?"} photos ·{" "}
                    {
                      r.findings.filter((f) => f.result === "potential_issue")
                        .length
                    }{" "}
                    flagged observations
                  </span>
                </span>
              </div>
            ))}
          </section>
        )}
        <section className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <strong>Manual inspection self-check</strong>
            <span className="muted small">
              {done}/{inspections.length}
            </span>
          </div>
          <Meter value={Math.round((done / inspections.length) * 100)} />
          <div style={{ marginTop: 20 }}>
            {inspections.map((i) => (
              <label className="checkrow" key={i.id}>
                <input
                  type="checkbox"
                  checked={state.inspection.includes(i.id)}
                  onChange={(e) =>
                    save({
                      ...state,
                      inspection: e.target.checked
                        ? [...state.inspection, i.id]
                        : state.inspection.filter((x) => x !== i.id),
                    })
                  }
                />
                <span>
                  <strong>{i.title}</strong>
                  <span
                    className="muted small"
                    style={{ display: "block", marginTop: 5 }}
                  >
                    {i.detail}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
        <Notice />
      </div>
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
