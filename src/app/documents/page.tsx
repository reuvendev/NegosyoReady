"use client";
import Link from "next/link";
import { FileCheck2, FileWarning, Trash2 } from "lucide-react";
import { Shell } from "@/components/shell";
import { BulkDocuments } from "@/components/bulk-documents";
import { getDocumentFixes } from "@/lib/document-actions";
import { useStore } from "@/components/store";
import { Heading, Notice, EmptyProfile } from "@/components/ui";
import { dueDays } from "@/lib/data";
import { coverageFor, documentStatusLabel } from "@/lib/documents";
function Content() {
  const { state, save, ready } = useStore();
  if (!ready) return <><Heading title="Document checker" description="Loading your workspace…" /><div className="card muted">Loading…</div></>;
  if (!state.business) return <><Heading title="Document checker" description="Upload and organize your business documents" /><EmptyProfile /></>;
  const category = state.business.category;
  const coverage = coverageFor(category, state.documents);
  const uploaded = coverage.filter(({status}) => status !== "missing").length;
  const reviewed = coverage.filter(({status}) => status === "visually_checked").length;
  const flagged = coverage.filter(({status}) => status === "needs_review").length;
  const missing = coverage.length - uploaded;
  return (
    <>
    <Heading title="Document upload & checker" description={`Organize records and check what may be missing for ${state.business.name}.`} />
    <BulkDocuments />
    <div className="card document-summary">
      <div className="summary-heading"><div><h2 className="section-heading">Document preparation overview</h2><p className="muted small">{category} · Preparation guide, not an official checklist</p></div><Link className="btn secondary" href="/onboarding">Change business</Link></div>
      <div className="summary-stats" aria-label="Document review summary">
        <div><span className="stat-number">{uploaded}<small> / {coverage.length}</small></span><span className="muted small">Groups with uploads</span></div>
        <div><span className="stat-number">{missing}</span><span className="muted small">Not uploaded</span></div>
        <div><span className="stat-number">{reviewed}</span><span className="muted small">Visually checked</span></div>
        <div><span className="stat-number">{flagged}</span><span className="muted small">Groups needing review</span></div>
      </div>
      <div className="progress" aria-label="Document coverage"><div style={{width:`${coverage.length ? uploaded / coverage.length * 100 : 0}%`}} /></div>
      <p className="muted small" style={{marginTop:12}}>Uploaded records and automated checks do not confirm official validity or approval.</p>
    </div>
      <section className="card" style={{ marginTop: 18 }}>
        <div className="summary-heading">
          <h2 className="section-heading">
            Uploaded records ({state.documents.length})
          </h2>
          <span className="muted small">Saved only on this device</span>
        </div>
        {!state.documents.length ? (
          <div className="empty-docs">
            <FileWarning size={30} />
            <p>No documents yet. Add a file above to begin.</p>
          </div>
        ) : (
          [...state.documents].reverse().map((record) => {
            const days = dueDays(record.expires);
            const status =
              coverageFor(category, [record]).find(
                (row) => row.need.id === record.requirementId,
              )?.status ?? "uploaded_unreviewed";
            return (
              <article key={record.id} className="record-card">
                <div className="record-header">
                  <div className="record-title">
                    <FileCheck2 size={20} color="#1455bb" />
                    <div>
                      <strong className="wrap-text">
                        {record.fileName || record.name}
                      </strong>
                      <p className="muted small">{record.type}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn ghost remove-btn"
                    aria-label={`Remove ${record.name}`}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove the local record for "${record.name}"?`,
                        )
                      )
                        save({
                          ...state,
                          documents: state.documents.filter(
                            (d) => d.id !== record.id,
                          ),
                        });
                    }}
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
                <div className="record-meta">
                  <span className={`doc-badge doc-${status}`}>
                    {documentStatusLabel(status)}
                  </span>
                  {record.issued && <span>Issued: {record.issued}</span>}
                  {record.expires && (
                    <span>
                      Expires: {record.expires}
                      {days !== null && days < 0 ? " (past date)" : ""}
                    </span>
                  )}
                </div>
                {record.review ? (
                  <div className="review-box">
                    <div className="result-heading">
                      <span className="result-kicker">
                        DOCUMENT CHECK RESULTS
                      </span>
                      <span
                        className={`result-pill ${record.review.status === "appears_complete" && record.review.matchExpected === "matches" && !(days !== null && days < 0) ? "result-good" : "result-warning"}`}
                      >
                        {record.review.status === "unreadable"
                          ? "UNREADABLE"
                          : days !== null && days < 0
                            ? "EXPIRED DATE"
                            : record.review.status === "appears_complete" &&
                                record.review.matchExpected === "matches"
                              ? "LOOKS COMPLETE"
                              : "NEEDS ATTENTION"}
                      </span>
                    </div>
                    <p className="result-disclaimer">
                      Preliminary visual assessment only. Not an official permit
                      verification or approval.
                    </p>
                    <p>
                      <strong>Document Found:</strong>{" "}
                      {record.review.detectedType}
                    </p>
                    <p>
                      <strong>Document Category:</strong>{" "}
                      {record.review.matchExpected === "matches"
                        ? "Appears to match"
                        : record.review.matchExpected === "mismatch"
                          ? "Wrong Document Category"
                          : "Not confirmed"}
                    </p>
                    <p>{record.review.explanation}</p>
                    <div
                      className={`result-section ${record.review.issues.length ? "result-section-warning" : "result-section-good"}`}
                    >
                      <h4>
                        {record.review.issues.length
                          ? "Issues Found"
                          : "No obvious missing fields reported"}
                      </h4>
                      {record.review.issues.length ? (
                        <ul>
                          {record.review.issues.map((issue, i) => (
                            <li key={`${i}-${issue}`}>{issue}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>
                          No concerns were identified from the visible fields.
                          This does not confirm authenticity or compliance.
                        </p>
                      )}
                    </div>
                    {getDocumentFixes(record, days !== null && days < 0).length > 0 && (
                      <section className="document-fix-panel" aria-label="How to fix document issues">
                        <h4>How to Fix This</h4>
                        <p className="muted small">Follow these steps, then upload a corrected or renewed document. These are suggestions, not official approval instructions.</p>
                        {getDocumentFixes(record, days !== null && days < 0).map((fix, index) => (
                          <div className="document-fix-item" key={`${index}-${fix.title}`}>
                            <strong>{fix.title}</strong>
                            <ol>{fix.steps.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}</ol>
                            {fix.url && <a className="document-fix-link" href={fix.url} target="_blank" rel="noopener noreferrer">{fix.linkLabel || "Official government resource"} ↗</a>}
                          </div>
                        ))}
                      </section>
                    )}
                    {record.review.fieldsFound.length > 0 && (
                      <p className="muted small">
                        Visible field labels:{" "}
                        {record.review.fieldsFound.join(", ")}
                      </p>
                    )}
                    <p className="muted small">
                      Checked on:{" "}
                      {new Date(record.review.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="result-unchecked">
                    <strong>NOT YET CHECKED</strong>
                    <p>
                      No full document check has been completed. Extracted dates
                      alone do not establish whether this document is good.
                    </p>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
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
