"use client";

import {useEffect, useRef, useState, type FormEvent} from "react";
import Link from "next/link";
import {AlertCircle, CheckCircle2, CloudUpload, FileCheck2, FileWarning, Info, Trash2} from "lucide-react";
import {Shell} from "@/components/shell";
import {useStore} from "@/components/store";
import {Heading, Notice, EmptyProfile} from "@/components/ui";
import {applicableDocuments, type DocumentRecord, dueDays, type Review} from "@/lib/data";
import {ACCEPTED_MIME, coverageFor, documentStatusLabel, isReview, isValidDate, MAX_DOCUMENT_BYTES} from "@/lib/documents";

function Content() {
  const {state, save, ready} = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [requirementId, setRequirementId] = useState("");
  const [issued, setIssued] = useState("");
  const [expires, setExpires] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dateScan, setDateScan] = useState<"idle" | "scanning" | "done" | "failed">("idle");
  const [dateScanMessage, setDateScanMessage] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Date extraction runs automatically once a document, group, and explicit consent are supplied.
  // This is separate from the full AI review and never marks a document as checked.
  useEffect(() => {
    if (!file || !requirementId || !consent) {setDateScan("idle"); setDateScanMessage(""); return;}
    if (!ACCEPTED_MIME.includes(file.type as (typeof ACCEPTED_MIME)[number]) || !file.size || file.size > MAX_DOCUMENT_BYTES) return;
    const controller = new AbortController();
    setDateScan("scanning"); setDateScanMessage("Reading document dates automatically…");
    (async () => {
      try {
        const form = new FormData();
        form.set("file", file);
        form.set("category", state.business?.category || "");
        form.set("expectedId", requirementId);
        form.set("mode", "dates");
        const response = await fetch("/api/documents/review", {method:"POST", body:form, signal:controller.signal});
        const result = await response.json();
        if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Date extraction failed.");
        if (controller.signal.aborted) return;
        const issue = typeof result.issueDate === "string" && isValidDate(result.issueDate) ? result.issueDate : "";
        const expiry = typeof result.expirationDate === "string" && isValidDate(result.expirationDate) ? result.expirationDate : "";
        setIssued(current => current || issue);
        setExpires(current => current || expiry);
        setDateScan("done");
        setDateScanMessage(issue || expiry ? "Dates detected and filled. Please verify them before saving." : "No clear dates found. You can enter them manually.");
      } catch (err) {
        if (controller.signal.aborted) return;
        setDateScan("failed");
        setDateScanMessage(err instanceof Error ? `Automatic date scan: ${err.message}` : "Could not detect dates automatically.");
      }
    })();
    return () => controller.abort();
  }, [file, requirementId, consent, state.business?.category]);

  if (!ready) return <><Heading title="Document checker" description="Loading your saved workspace…"/><div className="card muted">Loading…</div></>;
  if (!state.business) return <><Heading title="Document checker" description="Upload and organize your business documents"/><EmptyProfile/></>;

  const category = state.business.category;
  const needs = applicableDocuments(category);
  const coverage = coverageFor(category, state.documents);
  const uploaded = coverage.filter(({status}) => status !== "missing").length;
  const reviewed = coverage.filter(({status}) => status === "visually_checked").length;
  const flagged = coverage.filter(({status}) => status === "needs_review").length;
  const missing = coverage.length - uploaded;

  function clearInputs() {
    setFile(null); setIssued(""); setExpires(""); setConsent(false); setDateScan("idle");
    if (fileInput.current) fileInput.current.value = "";
  }

  function validate(): string | null {
    if (!file || !requirementId || !needs.some((n) => n.id === requirementId)) return "Choose a file and an applicable document group.";
    if (!file.size || file.size > MAX_DOCUMENT_BYTES) return "File size must be greater than 0 and no more than 8 MB.";
    if (!ACCEPTED_MIME.includes(file.type as (typeof ACCEPTED_MIME)[number])) return "Only PDF, JPG, PNG, and WebP files are supported.";
    if (!isValidDate(issued) || !isValidDate(expires)) return "Enter valid dates.";
    if (issued && expires && expires < issued) return "Expiration date cannot be earlier than the issue date.";
    return null;
  }

  function persistRecord(review?: Review, detectedIssued?: string, detectedExpires?: string) {
    // Uploaded files are NOT retained. Only a filename and preliminary AI findings are saved locally.
    if (!file) return;
    const group = needs.find((n) => n.id === requirementId);
    if (!group) return;
    const record: DocumentRecord = {
      id: crypto.randomUUID(), name: file.name, type: group.title,
      requirementId, fileName: file.name,
      issued: issued || detectedIssued || "", expires: expires || detectedExpires || "", addedAt: new Date().toISOString(), review,
    };
    save({...state, documents: [...state.documents, record]});
    clearInputs();
  }

  function saveUnchecked() {
    setError(""); setMessage("");
    const validation = validate();
    if (validation) {setError(validation); return;}
    persistRecord();
    setMessage("Saved without a full AI review. The file may have been sent to AI for date extraction if you gave consent.");
  }

  async function reviewUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const validation = validate();
    if (validation) {setError(validation); return;}
    if (!consent) {setError("Consent is required before sending your document to OpenAI for review."); return;}
    if (!file) return;

    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("category", category);
      form.set("expectedId", requirementId);
      const response = await fetch("/api/documents/review", {method: "POST", body: form});
      const data: unknown = await response.json().catch(() => ({}));
      const result = data && typeof data === "object" ? data as Record<string, unknown> : {};
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Document review could not be completed.");
      if (!isReview(result.review)) throw new Error("The AI response was incomplete. You can retry or save the file as unchecked.");
      const aiIssued = result.review.issueDate || "";
      const aiExpires = result.review.expirationDate || "";
      // User-entered dates take priority over AI-extracted dates.
      persistRecord(result.review, aiIssued, aiExpires);
      setMessage(result.review.status === "appears_complete" && result.review.matchExpected === "matches"
        ? "AI visual review finished. Detected dates were saved automatically when available. Compliance and authenticity are NOT confirmed."
        : "AI review finished. Detected dates were saved automatically when available. See the details below.");
    } catch (cause) {
      // Do not silently save when the user asked for AI review; allow an explicit retry or unchecked save.
      setError(cause instanceof Error ? cause.message : "Review failed. Retry or save without AI review.");
    } finally {setBusy(false);}
  }

  return <>
    <Heading title="Document upload & checker" description={`Organize records and check what may be missing for ${state.business.name}.`}/>

    <div className="card document-summary">
      <div className="summary-heading"><div><h2 className="section-heading">Document preparation overview</h2><p className="muted small">{category} · Illustrative document groups, not an official government checklist</p></div><Link className="btn secondary" href="/onboarding">Change business</Link></div>
      <div className="summary-stats" aria-label="Document review summary">
        <div><span className="stat-number">{uploaded}<small> / {coverage.length}</small></span><span className="muted small">Groups with uploads</span></div>
        <div><span className="stat-number">{missing}</span><span className="muted small">Not uploaded</span></div>
        <div><span className="stat-number">{reviewed}</span><span className="muted small">Visually checked by AI</span></div>
        <div><span className="stat-number">{flagged}</span><span className="muted small">Groups needing review</span></div>
      </div>
      <div className="progress" aria-label="Share of illustrative groups with an uploaded record"><div style={{width: `${coverage.length ? uploaded / coverage.length * 100 : 0}%`}}/></div>
      <p className="muted small" style={{marginTop: 12}}>An upload only confirms that a file was recorded. An AI visual check is not proof of validity, compliance, or government approval.</p>
    </div>

    <div className="grid2" style={{marginTop: 18, alignItems: "start"}}>
      <form className="card stack" onSubmit={reviewUpload}>
        <div className="section-heading-row"><CloudUpload size={22} color="#1455bb"/><h2 className="section-heading">Upload a document</h2></div>
        <div><label htmlFor="expected" className="label">Expected document group *</label><select id="expected" className="field" required value={requirementId} onChange={(e) => setRequirementId(e.target.value)}><option value="">Choose a group</option>{needs.map((n) => <option value={n.id} key={n.id}>{n.title}</option>)}</select></div>
        <div><label htmlFor="actual-upload" className="label">Your file *</label><input id="actual-upload" ref={fileInput} className="field" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" required onChange={(e) => {setError(""); setMessage(""); setIssued(""); setExpires(""); setFile(e.target.files?.[0] || null);}}/><p className="muted small" style={{marginTop: 8}}>PDF, JPG, PNG, or WebP · Max 8 MB. Use redacted or fictional samples only.</p>{file && <p className="file-selection">Selected: {file.name} ({(file.size / 1048576).toFixed(2)} MB)</p>}</div>
        <div className="grid2"><div><label htmlFor="issued" className="label">Issue date (auto-detected, editable)</label><input id="issued" type="date" className="field" value={issued} onChange={(e) => setIssued(e.target.value)}/></div><div><label htmlFor="expires" className="label">Expiration date (auto-detected, editable)</label><input id="expires" type="date" className="field" min={issued || undefined} value={expires} onChange={(e) => setExpires(e.target.value)}/></div></div>
<p className="muted small">After selecting a document and agreeing to AI analysis, dates are detected before the full document check. You can edit them. Dates are not verified.</p>
        {dateScan !== "idle" && <p role="status" className={`date-scan-status ${dateScan}`}>{dateScan === "scanning" ? "Scanning dates… " : ""}{dateScanMessage}</p>}
        <div className="privacy-note"><Info size={17} style={{flexShrink: 0}}/><p>Files are processed only for this request. Original files are <strong>not saved</strong> by this application. Only filenames, dates, and optional AI review results are kept in this browser.</p></div>
        <label className="consent-row"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}/><span>I consent to sending this redacted or sample document to OpenAI for AI analysis. I understand this is not an official compliance determination.</span></label>
        <div className="upload-actions"><button className="btn" type="submit" disabled={busy || dateScan === "scanning" || !file || !requirementId || !consent}>{busy ? "Checking file…" : "Upload & AI check"}</button><button className="btn ghost" type="button" disabled={busy || dateScan === "scanning" || !file || !requirementId} onClick={saveUnchecked}>Save without AI</button></div>
        {error && <p role="alert" className="feedback error"><AlertCircle size={16}/>{error}</p>}
        {message && <p role="status" className="feedback success"><CheckCircle2 size={16}/>{message}</p>}
      </form>

      <section className="card" aria-label="Document group checklist"><h2 className="section-heading">Document checklist</h2><p className="muted small" style={{marginTop: 7, marginBottom: 16}}>Prepared for {category}. This is a demonstration, not a definitive list of legal requirements.</p>
        {coverage.map(({need, status}) => <div key={need.id} className="document-row"><div className="document-row-head"><strong>{need.title}</strong><span className={`doc-badge doc-${status}`}>{documentStatusLabel(status)}</span></div><p className="muted small" style={{marginTop: 6}}>{need.detail}</p></div>)}
        <p className="muted small" style={{marginTop: 16}}>For additional preparation steps, see <Link className="inline-link" href="/requirements">Requirements</Link>.</p>
      </section>
    </div>

    <section className="card" style={{marginTop: 18}}>
      <div className="summary-heading"><h2 className="section-heading">Uploaded records ({state.documents.length})</h2><span className="muted small">Saved only on this device</span></div>
      {!state.documents.length ? <div className="empty-docs"><FileWarning size={30}/><p>No documents yet. Add a file above to begin.</p></div> : [...state.documents].reverse().map((record) => {
        const days = dueDays(record.expires);
        const status = coverageFor(category, [record]).find((row) => row.need.id === record.requirementId)?.status ?? "uploaded_unreviewed";
        return <article key={record.id} className="record-card"><div className="record-header"><div className="record-title"><FileCheck2 size={20} color="#1455bb"/><div><strong className="wrap-text">{record.fileName || record.name}</strong><p className="muted small">{record.type}</p></div></div><button type="button" className="btn ghost remove-btn" aria-label={`Remove ${record.name}`} onClick={() => {if(window.confirm(`Remove the local record for "${record.name}"?`)) save({...state, documents: state.documents.filter((d) => d.id !== record.id)});}}><Trash2 size={15}/> Remove</button></div>
          <div className="record-meta"><span className={`doc-badge doc-${status}`}>{documentStatusLabel(status)}</span>{record.issued && <span>Issued: {record.issued}</span>}{record.expires && <span>Expires: {record.expires}{days !== null && days < 0 ? " (past date)" : ""}</span>}</div>
          {record.review ? <div className="review-box">
            <div className="result-heading"><span className="result-kicker">AI DOCUMENT ASSESSMENT</span><span className={`result-pill ${record.review.status === "appears_complete" && record.review.matchExpected === "matches" && !(days !== null && days < 0) ? "result-good" : "result-warning"}`}>{record.review.status === "unreadable" ? "UNREADABLE" : days !== null && days < 0 ? "EXPIRED DATE" : record.review.status === "appears_complete" && record.review.matchExpected === "matches" ? "LOOKS COMPLETE" : "NEEDS ATTENTION"}</span></div>
            <p className="result-disclaimer">Preliminary visual assessment only. Not an official permit verification or approval.</p>
            <p><strong>Detected document:</strong> {record.review.detectedType}</p>
            <p><strong>Document-type match:</strong> {record.review.matchExpected === "matches" ? "Appears to match" : record.review.matchExpected === "mismatch" ? "Different from selected group" : "Uncertain / not verified"}</p>
            <p>{record.review.explanation}</p>
            <div className={`result-section ${record.review.issues.length ? "result-section-warning" : "result-section-good"}`}><h4>{record.review.issues.length ? "Potential concerns" : "No obvious missing fields reported"}</h4>{record.review.issues.length ? <ul>{record.review.issues.map((issue, i) => <li key={`${i}-${issue}`}>{issue}</li>)}</ul> : <p>No concerns were identified from the visible fields. This does not confirm authenticity or compliance.</p>}</div>
            {record.review.fieldsFound.length > 0 && <p className="muted small">Visible field labels: {record.review.fieldsFound.join(", ")}</p>}
            <p className="muted small">AI reviewed: {new Date(record.review.reviewedAt).toLocaleString()}</p>
          </div> : <div className="result-unchecked"><strong>NOT YET CHECKED</strong><p>No full AI review has been completed. Extracted dates alone do not establish whether this document is good.</p></div>}
        </article>;
      })}
    </section>
    <Notice/>
  </>;
}

export default function Page() {return <Shell><Content/></Shell>;}
