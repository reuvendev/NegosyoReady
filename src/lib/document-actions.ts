import type { DocumentRecord } from "@/lib/data";

export type FixAction = { title: string; steps: string[]; url?: string; linkLabel?: string };

const groups: Record<string, { name: string; agency: string; url: string; linkLabel: string }> = {
  registration: { name: "issued DTI business name certificate (sole proprietor) or SEC registration document (company/partnership)", agency: "DTI or SEC", url: "https://bnrs.dti.gov.ph/", linkLabel: "DTI Business Name Registration" },
  local: { name: "current Baguio City permit or application record", agency: "Baguio City Business Permits and Licensing Office", url: "https://ebpls.baguio.gov.ph/", linkLabel: "Baguio City eBPLS" },
  tax: { name: "BIR Certificate of Registration or relevant tax registration record", agency: "BIR", url: "https://www.bir.gov.ph/", linkLabel: "Bureau of Internal Revenue" },
  premises: { name: "applicable occupancy or premises document", agency: "relevant Baguio City office", url: "https://www.baguio.gov.ph/", linkLabel: "Baguio City Government" },
  sanitation: { name: "applicable sanitation or food-handling document", agency: "Baguio City Health Services Office", url: "https://www.baguio.gov.ph/", linkLabel: "Baguio City Government" },
  safety: { name: "applicable fire safety document", agency: "Bureau of Fire Protection", url: "https://bfp.gov.ph/", linkLabel: "Bureau of Fire Protection" },
};

export function getDocumentFixes(record: DocumentRecord, expired: boolean): FixAction[] {
  const actions: FixAction[] = [];
  const group = record.requirementId ? groups[record.requirementId] : undefined;
  const review = record.review;
  if (expired) {
    const isNbi = /nbi\s*clearance/i.test(review?.detectedType || "");
    actions.push({
      title: "Document Expired",
      steps: isNbi
        ? ["If you still need an NBI Clearance, check the official NBI service for a new clearance application.", "After receiving the new clearance, upload it with the correct issue and expiry dates.", "An NBI Clearance does not replace a business registration certificate."]
        : ["Check the expiry date printed on the document. Correct the saved date if the AI read it incorrectly.", `If expired, contact ${group?.agency || "the issuing office"} to confirm the current renewal or reapplication process.`, "Upload the newly issued document and check its dates again."],
      url: isNbi ? "https://clearance.nbi.gov.ph/" : group?.url,
      linkLabel: isNbi ? "NBI Clearance Online" : group?.linkLabel,
    });
  }
  if (review?.matchExpected === "mismatch") {
    actions.push({
      title: "Wrong Document Category",
      steps: ["Check the detected document type and the group you selected.", `For this group, prepare ${group?.name || "the correct supporting document"}.`, "Remove the incorrectly grouped record, then upload the correct document under this group. Keep the other document only if it is needed elsewhere."],
      url: group?.url,
      linkLabel: group?.linkLabel,
    });
  } else if (review?.matchExpected === "uncertain") {
    actions.push({ title: "Document type could not be confirmed", steps: ["Check whether the file belongs to the selected document group.", "Upload a clearer, complete copy showing the document title and relevant details.", "Confirm the correct document with the issuing office if unsure."], url: group?.url, linkLabel: group?.linkLabel });
  }
  if (review?.status === "unreadable") {
    actions.push({ title: "File is hard to read", steps: ["Retake the photo in good lighting, with the full document visible.", "Avoid glare, blur, cropped corners, or covered text.", "Upload the clearer file and check the document again."] });
  }
  if (review?.issues.length && review.status !== "unreadable") {
    const otherIssues = review.issues.filter(issue => !/expir|out.of.date|date has passed|wrong document|does not match|different (document|category)|nbi clearance.*(business registration|expected)/i.test(issue));
    if (otherIssues.length) actions.push({ title: "Other concerns to check", steps: ["Review the concerns listed above and compare them with the original document.", "If a detail is missing or incorrect, ask the issuing office how to correct or replace the record.", "Upload an updated document and check the document again."], url: group?.url, linkLabel: group?.linkLabel });
  }
  if (!actions.length && review && (review.status !== "appears_complete" || review.matchExpected !== "matches")) {
    actions.push({ title: "Review recommended", steps: ["Check that the document is complete, readable, and in the correct group.", `Ask ${group?.agency || "the responsible office"} to confirm the applicable requirements.`, "Replace the record and check the document again if needed."], url: group?.url, linkLabel: group?.linkLabel });
  }
  return actions;
}
