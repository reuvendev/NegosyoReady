import {
  applicableDocuments,
  dueDays,
  type DocumentRecord,
  type Review,
} from "@/lib/data";

export const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type DocumentCheck =
  "missing" | "uploaded_unreviewed" | "needs_review" | "visually_checked";

export function documentStatus(records: DocumentRecord[]): DocumentCheck {
  if (records.length === 0) return "missing";
  // User-entered past expiration dates require attention, even if a visual review looks fine.
  if (
    records.some((r) => {
      const days = dueDays(r.expires);
      return days !== null && days < 0;
    })
  )
    return "needs_review";
  // Flag concerns, even if a separate upload for this group had no review.
  if (
    records.some(
      (r) =>
        r.review &&
        (r.review.status !== "appears_complete" ||
          r.review.matchExpected !== "matches"),
    )
  ) {
    return "needs_review";
  }
  if (
    records.some(
      (r) =>
        r.review?.status === "appears_complete" &&
        r.review.matchExpected === "matches",
    )
  ) {
    return "visually_checked";
  }
  return "uploaded_unreviewed";
}

export function coverageFor(category: string, documents: DocumentRecord[]) {
  return applicableDocuments(category).map((need) => {
    const records = documents.filter(
      (r) => r.requirementId === need.id && !!r.fileName,
    );
    return { need, records, status: documentStatus(records) };
  });
}

export function documentStatusLabel(status: DocumentCheck) {
  switch (status) {
    case "missing":
      return "Not uploaded";
    case "uploaded_unreviewed":
      return "Uploaded · unchecked";
    case "needs_review":
      return "Needs review";
    case "visually_checked":
      return "Visually checked";
  }
}

export function isValidDate(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

/** Validate the declared MIME type AND file signatures; an extension alone is not trusted. */
export function signatureMatches(mime: string, bytes: Uint8Array) {
  if (bytes.length < 12) return false;
  switch (mime) {
    case "application/pdf":
      return (
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46 &&
        bytes[4] === 0x2d
      );
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "image/webp":
      return (
        String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
        String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
      );
    default:
      return false;
  }
}

export function isReview(value: unknown): value is Review {
  if (!value || typeof value !== "object") return false;
  const r = value as Partial<Review>;
  return (
    ["appears_complete", "needs_review", "unreadable"].includes(
      r.status || "",
    ) &&
    ["matches", "mismatch", "uncertain"].includes(r.matchExpected || "") &&
    typeof r.detectedType === "string" &&
    typeof r.explanation === "string" &&
    Array.isArray(r.fieldsFound) &&
    r.fieldsFound.every((s) => typeof s === "string") &&
    Array.isArray(r.issues) &&
    r.issues.every((s) => typeof s === "string")
  );
}
