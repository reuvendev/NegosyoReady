import { Business, DocumentRecord, dueDays } from "@/lib/data";

export type ComplianceAlert = {
  id: string;
  title: string;
  level: "expired" | "review" | "missing" | "info";
  why: string;
  next: string[];
  office: string;
  source: string;
  sourceName: string;
  sourceChecked: string;
  group?: string;
};

// Curated reference information, not a live agency feed. Review source links before changing rules.
const checked = "October 31, 2026";
const city = "https://ebpls.baguio.gov.ph/";
const workpass = "https://workpass.baguio.gov.ph/services";
const boi = "https://boi.gov.ph/how-to-setup-business/setting-up/business-process-business-permit/";

export function complianceAlerts(business: Business, docs: DocumentRecord[]): ComplianceAlert[] {
  const result: ComplianceAlert[] = [];
  const add = (alert: Omit<ComplianceAlert, "sourceChecked">) => result.push({ ...alert, sourceChecked: checked });
  const groups = [
    { id: "registration", label: "Business registration certificate", office: "DTI or SEC", url: "https://bnrs.dti.gov.ph/", sourceName: "DTI BNRS", next: "Upload the issued registration certificate, not just the application form." },
    { id: "local", label: "Baguio City business permit", office: "Baguio City eBPLS", url: city, sourceName: "Baguio City eBPLS", next: "Check the city's current permit application or renewal requirements." },
    { id: "tax", label: "BIR registration record", office: "BIR", url: "https://web-services.bir.gov.ph/newbizreg/", sourceName: "BIR NewBizReg", next: "Check the BIR registration route and upload your issued record." },
    { id: "premises-doc", label: "Premises / occupancy record", office: "Baguio City CBAO", url: "https://main.baguio.gov.ph/media/announcements/BMdZjWbA/public-advisory-on-building-permit-applications", sourceName: "Baguio City CBAO advisory", next: "Ask CBAO which building, occupancy, or location documents apply to your premises." },
    { id: "fire", label: "Fire safety record", office: "Bureau of Fire Protection", url: boi, sourceName: "Board of Investments business permit guide", next: "Confirm the fire safety certificate or inspection requirements with BFP." },
  ];
  if (["Café / Coffee Shop", "Eatery / Restaurant"].includes(business.category)) {
    groups.push({ id: "food", label: "Food / sanitation record", office: "Baguio City Health Services Office", url: workpass, sourceName: "Baguio City WorkPASS", next: "Check sanitary and food-handling requirements with the City Health Services Office." });
  }
  for (const group of groups) {
    const records = docs.filter((d) => d.requirementId === group.id && Boolean(d.fileName));
    if (!records.length) {
      add({ id: `missing-${group.id}`, title: `Check if you need: ${group.label}`, level: "missing", why: "No uploaded record was found in this document group. This does not prove you lack the official permit.", next: [group.next, "If you already have it, upload the issued document to the matching group."], office: group.office, source: group.url, sourceName: group.sourceName, group: group.id });
    } else {
      for (const doc of records) {
        const days = dueDays(doc.expires);
        const mismatched = doc.review?.matchExpected === "mismatch";
        if (days !== null && days < 0) add({ id: `expired-${doc.id}`, title: `Document Expired: ${doc.name}`, level: "expired", why: `The recorded expiration date is ${doc.expires}. Check the document to confirm this date.`, next: ["Confirm the renewal procedure and current requirements with the issuing office.", "Apply for renewal, then upload the newly issued record and update its expiration date."], office: /nbi\s*clearance/i.test(doc.review?.detectedType || "") ? "NBI (for the clearance)" : group.office, source: /nbi\s*clearance/i.test(doc.review?.detectedType || "") ? "https://clearance.nbi.gov.ph/" : group.url, sourceName: /nbi\s*clearance/i.test(doc.review?.detectedType || "") ? "NBI Clearance Online" : group.sourceName, group: group.id });
        if (mismatched || doc.review?.status === "unreadable" || doc.review?.status === "needs_review") add({ id: `review-${doc.id}`, title: `Check Document: ${doc.name}`, level: "review", why: mismatched ? `Document Found: ${doc.review?.detectedType || "Unidentified document"}. This may be the wrong file for ${group.label}.` : "The document scan flagged a concern or could not read the document reliably.", next: ["Read the document check results and confirm details with the issuing office.", "Replace the file or move it to the correct document group if necessary."], office: group.office, source: group.url, sourceName: group.sourceName, group: group.id });
      }
    }
  }
  const food = ["Café / Coffee Shop", "Eatery / Restaurant"].includes(business.category) || /prepar|serv|cook|drink|food|beverage/i.test(business.activities || "");
  if (food) add({ id: "food-handler", title: "Additional requirement to check: food-handler working permits", level: "info", why: "Baguio WorkPASS lists a Yellow Card pathway for workers who handle or serve food and drinks. This is a worker-level requirement and is not replaced by a business registration certificate.", next: ["Identify employees who handle, prepare, or serve food and drinks.", "Check the Yellow Card, health certificate, and food-handler seminar requirements on WorkPASS.", "Confirm applicability and renewal dates with the city office."], office: "Baguio City WorkPASS / City Health Services Office", source: workpass, sourceName: "Baguio City WorkPASS", group: "food" });
  if (/salon|barber|beauty|massage|spa/i.test(`${business.category} ${business.activities || ""}`)) add({ id: "service-health", title: "Additional requirement to check: staff health certificates", level: "info", why: "Baguio WorkPASS identifies beauty, barber, and spa workers among occupations that may need health certificates.", next: ["Identify affected workers and their actual duties.", "Check WorkPASS health certificate and working permit requirements."], office: "Baguio City Health Services Office", source: workpass, sourceName: "Baguio City WorkPASS" });
  if (business.premises && /rent|leas/i.test(business.premises)) add({ id: "lease", title: "Check your lease or authority to use the premises", level: "info", why: "The Board of Investments lists a lease contract or title among general documents for a new local business permit, as applicable.", next: ["Prepare your lease or other proof of authority to use the location.", "Confirm the exact supporting documents with Baguio City."], office: "Baguio City eBPLS", source: boi, sourceName: "Board of Investments business permit guide", group: "premises-doc" });
  if (!business.activities?.trim()) add({ id: "activities", title: "Describe your activities to check for more permits", level: "info", why: "Business category alone may not reveal additional permits or certificates.", next: ["Update your business profile with the products sold and services provided.", "Review the suggested requirements again."], office: "Business profile", source: city, sourceName: "Baguio City eBPLS" });
  return result;
}
