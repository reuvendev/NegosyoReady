import { applicable, dueDays, inspections, type State } from "@/lib/data";
import { coverageFor } from "@/lib/documents";

export function readinessFor(state: State) {
  const category = state.business?.category ?? "";
  const steps = applicable(category);
  const coverage = coverageFor(category, state.documents);
  const prepared = steps.filter((step) =>
    state.completed.includes(step.id),
  ).length;
  const uploaded = coverage.filter(
    (group) => group.status !== "missing",
  ).length;
  const flagged = coverage.filter(
    (group) => group.status === "needs_review",
  ).length;
  const missing = coverage.filter((group) => group.status === "missing").length;
  const expired = state.documents.filter((doc) => {
    const days = dueDays(doc.expires);
    return days !== null && days < 0;
  }).length;
  const dueSoon = state.documents.filter((doc) => {
    const days = dueDays(doc.expires);
    return days !== null && days >= 0 && days <= 60;
  }).length;
  const inspectionDone = inspections.filter((item) =>
    state.inspection.includes(item.id),
  ).length;
  const photoReviews = state.photoReviews ?? [];
  const latestPhotoReview = photoReviews[0] ?? null;
  const photoConcerns =
    latestPhotoReview?.findings.filter((f) => f.result === "potential_issue")
      .length ?? 0;
  const progress = Math.round(
    (100 * (prepared + uploaded + inspectionDone)) /
      Math.max(1, steps.length + coverage.length + inspections.length),
  );
  // A preparation status, never a government approval or inspection result.
  const hasUnreviewed = coverage.some(
    (group) => group.status === "uploaded_unreviewed",
  );
  const hasUnknownDates = state.documents.some(
    (doc) => Boolean(doc.fileName) && !doc.expires,
  );
  const incomplete =
    prepared < steps.length ||
    missing > 0 ||
    inspectionDone < inspections.length;
  const hasConcerns =
    flagged > 0 ||
    expired > 0 ||
    photoConcerns > 0 ||
    latestPhotoReview?.overall === "needs_attention";
  const status = hasConcerns
    ? "needs_attention"
    : incomplete
      ? "in_progress"
      : hasUnreviewed ||
          hasUnknownDates ||
          !latestPhotoReview ||
          latestPhotoReview.overall === "insufficient_evidence"
        ? "review_recommended"
        : "prepared_for_review";
  const statusLabel = {
    needs_attention: "Needs attention",
    in_progress: "Preparation in progress",
    review_recommended: "Review recommended",
    prepared_for_review: "Prepared for further review",
  }[status];
  const nextActions = [
    ...(expired > 0 ? [`Review ${expired} expired document(s).`] : []),
    ...(flagged > 0
      ? [`Resolve concerns in ${flagged} document group(s).`]
      : []),
    ...(photoConcerns > 0
      ? [
          `Review ${photoConcerns} potential issue(s) from the latest photo screening.`,
        ]
      : []),
    ...(missing > 0
      ? [`Upload records for ${missing} missing document group(s).`]
      : []),
    ...(prepared < steps.length
      ? [`Complete ${steps.length - prepared} preparation step(s).`]
      : []),
    ...(inspectionDone < inspections.length
      ? [
          `Complete ${inspections.length - inspectionDone} manual self-check item(s).`,
        ]
      : []),
    ...(hasUnreviewed
      ? ["Review uploaded documents that have not been checked."]
      : []),
    ...(hasUnknownDates
      ? ["Confirm expiration dates for uploaded records where applicable."]
      : []),
    ...(!latestPhotoReview
      ? ["Consider an establishment photo screening."]
      : []),
  ];
  return {
    steps,
    coverage,
    prepared,
    uploaded,
    flagged,
    missing,
    expired,
    dueSoon,
    inspectionDone,
    photoReviews,
    latestPhotoReview,
    photoConcerns,
    progress,
    status,
    statusLabel,
    nextActions,
  };
}
