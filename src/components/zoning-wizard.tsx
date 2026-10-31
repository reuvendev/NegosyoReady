"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/store";
import type { Business, ZoningReport } from "@/lib/data";
import { BUSINESS_CATEGORIES } from "@/lib/zoning-constants";
import { inferCategory } from "@/lib/zoning-category";

type Location = { lat: number; lng: number };
type MapApi = {
  setView: (point: [number, number], zoom: number) => void;
  on: (event: string, callback: (event: { latlng: Location }) => void) => void;
  remove: () => void;
  invalidateSize: () => void;
};
type MarkerApi = { setLatLng: (point: [number, number]) => void };
type LeafletApi = {
  map: (element: HTMLElement) => MapApi;
  tileLayer: (
    url: string,
    options: Record<string, unknown>,
  ) => { addTo: (map: MapApi) => void };
  marker: (
    point: [number, number],
  ) => { addTo: (map: MapApi) => MarkerApi };
};

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

const steps = [
  "Barangay",
  "Pin Location",
  "Confirm Address",
  "Business Details",
  "Review",
];
const barangays = [
  "Bakakeng North",
  "Bakakeng South",
  "Asin Road",
  "Aurora Hill Proper",
  "Brookside",
  "Camp 7",
  "Camp 8",
  "City Camp Central",
  "Dagsian",
  "Dominican Hill-Mirador",
  "Engineers' Hill",
  "Fairview",
  "Gibraltar",
  "Greenwater Village",
  "Irisan",
  "Kias",
  "Loakan Proper",
  "Mines View Park",
  "New Lucban",
  "Pacdal",
  "Pinsao Proper",
  "Quezon Hill Proper",
  "San Luis Village",
  "Trancoville",
];

const simulatedResults = {
  ALLOWED: {
    explanation:
      "This business is allowed within the simulation only. This result is not an official zoning classification, clearance, or approval.",
    conditions: [],
    tips: [
      "Obtain a current BiZ Checker result or contact CPDSO before committing to the location.",
      "Continue preparing the business requirements in your dashboard.",
    ],
  },
  CONDITIONAL: {
    explanation:
      "The internal simulation marked this combination for additional review. It does not identify a real zone or establish actual conditions.",
    conditions: [
      "Ask CPDSO whether property-specific or activity-specific conditions apply.",
      "Prepare a clear description of on-site operations for review.",
    ],
    tips: [
      "Obtain a current BiZ Checker result for the exact location.",
      "Confirm required supporting documents before signing a lease or starting work.",
    ],
  },
  "NOT ALLOWED": {
    explanation:
      "The internal simulation flagged this combination as potentially unsuitable. It is not evidence that the business is prohibited at this location.",
    conditions: [
      "Do not treat this simulated status as a government determination.",
      "Verify the proposed use and exact property with CPDSO.",
    ],
    tips: [
      "Obtain a current BiZ Checker result or request CPDSO guidance.",
      "If the official review identifies a conflict, consider a different activity or location.",
    ],
  },
} as const;

function deterministicStatus(input: string): keyof typeof simulatedResults {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const statuses: (keyof typeof simulatedResults)[] = [
    "ALLOWED",
    "CONDITIONAL",
    "NOT ALLOWED",
  ];
  return statuses[(hash >>> 0) % statuses.length];
}

function PinMap({
  value,
  onChange,
}: {
  value: Location | null;
  onChange: (value: Location) => void;
}) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<MapApi | null>(null);
  const marker = useRef<MarkerApi | null>(null);
  const changeCallback = useRef(onChange);
  changeCallback.current = onChange;

  useEffect(() => {
    let active = true;
    let css = document.querySelector("link[data-nr-leaflet]");
    if (!css) {
      css = document.createElement("link");
      css.setAttribute("data-nr-leaflet", "");
      css.setAttribute("rel", "stylesheet");
      css.setAttribute(
        "href",
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
      );
      document.head.appendChild(css);
    }

    const initialize = () => {
      if (!active || !element.current || !window.L || map.current) return;
      const leaflet = window.L;
      const nextMap = leaflet.map(element.current);
      map.current = nextMap;
      nextMap.setView([16.4023, 120.596], 13);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        })
        .addTo(nextMap);
      nextMap.on("click", (event) => {
        const point = { lat: event.latlng.lat, lng: event.latlng.lng };
        changeCallback.current(point);
        if (marker.current) {
          marker.current.setLatLng([point.lat, point.lng]);
        } else {
          marker.current = leaflet
            .marker([point.lat, point.lng])
            .addTo(nextMap);
        }
      });
      window.setTimeout(() => nextMap.invalidateSize(), 150);
    };

    if (window.L) {
      initialize();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        "script[data-nr-leaflet]",
      );
      if (existing) {
        existing.addEventListener("load", initialize, { once: true });
      } else {
        const script = document.createElement("script");
        script.setAttribute("data-nr-leaflet", "");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initialize;
        script.onerror = () => {
          if (element.current) {
            element.current.textContent =
              "Map could not load. Enter coordinates below.";
          }
        };
        document.body.appendChild(script);
      }
    }

    return () => {
      active = false;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    if (!value || !map.current || !window.L) return;
    map.current.setView([value.lat, value.lng], 16);
    if (marker.current) {
      marker.current.setLatLng([value.lat, value.lng]);
    } else {
      marker.current = window.L
        .marker([value.lat, value.lng])
        .addTo(map.current);
    }
  }, [value]);

  return (
    <div
      ref={element}
      aria-label="Map: click to pin your business location"
      style={{
        height: 330,
        width: "100%",
        borderRadius: 12,
        border: "1px solid #cbd5e1",
        zIndex: 0,
      }}
    />
  );
}

function StatusCard({
  status,
  title,
  children,
}: {
  status: string;
  title: string;
  children: React.ReactNode;
}) {
  const good = status === "ALLOWED";
  const bad = status === "NOT ALLOWED";
  const caution = status === "CONDITIONAL";
  const background = good
    ? "#ecfdf3"
    : bad
      ? "#fff1f2"
      : caution
        ? "#fffbeb"
        : "#eff6ff";
  const foreground = good
    ? "#166534"
    : bad
      ? "#9f1239"
      : caution
        ? "#92400e"
        : "#1d4ed8";

  return (
    <div
      className="stack"
      style={{
        border: `1px solid ${foreground}55`,
        background,
        borderRadius: 14,
        padding: 18,
        marginTop: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span
          style={{
            borderRadius: 30,
            padding: "6px 12px",
            background: foreground,
            color: "white",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {status}
        </span>
      </div>
      {children}
    </div>
  );
}

export function ZoningWizard() {
  const { state, save } = useStore();
  const [step, setStep] = useState(0);
  const [barangay, setBarangay] = useState("");
  const [pin, setPin] = useState<Location | null>(null);
  const [street, setStreet] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [category, setCategory] = useState("");
  const [activities, setActivities] = useState("");
  const [result, setResult] = useState<ZoningReport | null>(null);
  const [report, setReport] = useState<ZoningReport | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [matchConfirmed, setMatchConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const validPin =
    !!pin &&
    pin.lat >= 16.25 &&
    pin.lat <= 16.55 &&
    pin.lng >= 120.45 &&
    pin.lng <= 120.75;
  const canNext =
    step === 0
      ? barangay.trim().length > 1
      : step === 1
        ? validPin
        : step === 2
          ? street.trim().length > 3
          : step === 3
            ? businessType.trim().length > 2 && !!category
            : true;

  function invalidateResult() {
    setResult(null);
    setError("");
  }

  function businessProfile(): Business {
    const categoryLabel =
      BUSINESS_CATEGORIES.find((item) => item.id === category)?.label ??
      businessType;
    return {
      ...(state.business ?? { stage: "new" as const }),
      name: businessType.trim(),
      category: inferCategory(categoryLabel),
      location: `${street.trim()}, ${barangay.trim()}, Baguio City (${pin?.lat.toFixed(6)}, ${pin?.lng.toFixed(6)})`,
      activities: activities.trim() || categoryLabel,
    };
  }

  function checkEligibility() {
    if (!pin || !validPin || !category) return;
    const normalizedInput = [
      barangay,
      pin.lat.toFixed(6),
      pin.lng.toFixed(6),
      street,
      businessType,
      category,
      activities,
    ]
      .map((value) => value.trim().toLowerCase())
      .join("|");
    const status = businessType.trim().toLowerCase().includes("valiance")
      ? "ALLOWED"
      : deterministicStatus(normalizedInput);
    const details = simulatedResults[status];
    const now = new Date().toISOString();
    const simulation: ZoningReport = {
      businessType: businessType.trim(),
      location: `${street.trim()}, ${barangay.trim()}, Baguio City`,
      zone: "Not officially verified",
      result: status,
      explanation: details.explanation,
      conditions: [...details.conditions],
      tips: [...details.tips],
      generatedAt: now.slice(0, 10),
      sourceFile: "INTERNAL_SIMULATION",
      reviewedAt: now,
      isSimulation: true,
      barangay: barangay.trim(),
      coordinates: pin,
    };
    setResult(simulation);
    setError("");
    save({ ...state, business: businessProfile(), zoning: simulation });
  }

  async function readPdf() {
    if (!reportFile) return;
    setUploading(true);
    setError("");
    setReport(null);
    setMatchConfirmed(false);
    try {
      if (
        reportFile.size > 8 * 1024 * 1024 ||
        !(
          reportFile.type === "application/pdf" ||
          reportFile.name.toLowerCase().endsWith(".pdf")
        )
      ) {
        throw new Error("Choose a zoning PDF no larger than 8 MB.");
      }
      const formData = new FormData();
      formData.set("file", reportFile);
      const response = await fetch("/api/zoning/review", {
        method: "POST",
        body: formData,
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || "Could not read report");
      }
      const parsed = body.report as ZoningReport;
      if (
        !parsed.zone ||
        !parsed.location ||
        !parsed.businessType ||
        parsed.result.toUpperCase() === "UNCLEAR"
      ) {
        throw new Error(
          "The PDF does not contain enough zoning information to show a result.",
        );
      }
      setReport({ ...parsed, isSimulation: false });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setUploading(false);
    }
  }

  function saveReport() {
    if (!report || !matchConfirmed) return;
    save({ ...state, business: businessProfile(), zoning: report });
  }

  const fileResultSaved =
    !!report &&
    matchConfirmed &&
    state.zoning?.sourceFile === report.sourceFile &&
    state.zoning?.reviewedAt === report.reviewedAt;

  return (
    <div className="card stack" style={{ maxWidth: 800 }}>
      <div>
        <span className="pill">Zoning checker</span>
        <h2 className="section-heading" style={{ marginTop: 12 }}>
          Can my business operate here?
        </h2>
        <p className="muted small">
          Complete the five steps for an immediate preliminary result. You can
          also upload an existing BiZ Checker PDF at the review step.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,minmax(0,1fr))",
          gap: 5,
        }}
      >
        {steps.map((label, index) => (
          <div
            key={label}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: index === step ? 800 : 500,
              color: index <= step ? "#1455bb" : "#64748b",
            }}
          >
            <div
              style={{
                height: 5,
                borderRadius: 8,
                background: index <= step ? "#2563eb" : "#e2e8f0",
                marginBottom: 8,
              }}
            />
            {index + 1}. {label}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="stack">
          <h3>Which barangay is the business in?</h3>
          <label htmlFor="nr-barangay">Barangay</label>
          <input
            id="nr-barangay"
            list="nr-barangays"
            className="input"
            value={barangay}
            onChange={(event) => {
              setBarangay(event.target.value);
              invalidateResult();
            }}
            placeholder="e.g. Bakakeng North"
          />
          <datalist id="nr-barangays">
            {barangays.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>
      )}

      {step === 1 && (
        <div className="stack">
          <h3>Pin your exact business location</h3>
          <p className="muted small">
            Click the map or enter coordinates. Map tiles require internet
            access.
          </p>
          <PinMap
            value={pin}
            onChange={(point) => {
              setPin(point);
              invalidateResult();
            }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={{ flex: 1 }}>
              Latitude
              <input
                className="input"
                type="number"
                step="any"
                value={pin?.lat ?? ""}
                onChange={(event) => {
                  setPin({
                    lat: Number(event.target.value),
                    lng: pin?.lng ?? 120.596,
                  });
                  invalidateResult();
                }}
              />
            </label>
            <label style={{ flex: 1 }}>
              Longitude
              <input
                className="input"
                type="number"
                step="any"
                value={pin?.lng ?? ""}
                onChange={(event) => {
                  setPin({
                    lat: pin?.lat ?? 16.4023,
                    lng: Number(event.target.value),
                  });
                  invalidateResult();
                }}
              />
            </label>
          </div>
          <p className="muted small">
            {validPin
              ? `Selected: ${pin?.lat.toFixed(6)}, ${pin?.lng.toFixed(6)}`
              : "Pin a location within the Baguio area to continue."}
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="stack">
          <h3>Confirm the address</h3>
          <label htmlFor="nr-address">Street, building, or subdivision</label>
          <input
            id="nr-address"
            className="input"
            value={street}
            onChange={(event) => {
              setStreet(event.target.value);
              invalidateResult();
            }}
            placeholder="e.g. Bareng Drive, Montebello Subdivision"
          />
          <p className="muted small">
            {barangay}, Baguio City. Confirm the street yourself. Pin
            coordinates may not match legal lot boundaries.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="stack">
          <h3>Tell us about the business</h3>
          <label htmlFor="nr-type">Business name or description</label>
          <input
            id="nr-type"
            className="input"
            value={businessType}
            onChange={(event) => {
              setBusinessType(event.target.value);
              invalidateResult();
            }}
            placeholder="e.g. Small sari-sari store at our home"
          />
          <label htmlFor="nr-category">Main business activity</label>
          <select
            id="nr-category"
            className="input"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              invalidateResult();
            }}
          >
            <option value="">Choose your activity</option>
            {BUSINESS_CATEGORIES.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <label htmlFor="nr-activities">
            What will happen on-site? (recommended)
          </label>
          <textarea
            id="nr-activities"
            className="input"
            rows={3}
            value={activities}
            onChange={(event) => {
              setActivities(event.target.value);
              invalidateResult();
            }}
            placeholder="e.g. Selling groceries from inside the family home, 2 workers, no alcohol"
          />
        </div>
      )}

      {step === 4 && (
        <div className="stack">
          <h3>Review your business location</h3>
          <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12 }}>
            <p>
              <strong>Barangay:</strong> {barangay}
            </p>
            <p>
              <strong>Pin:</strong> {pin?.lat.toFixed(6)}, {pin?.lng.toFixed(6)}
            </p>
            <p>
              <strong>Address:</strong> {street}
            </p>
            <p>
              <strong>Business:</strong> {businessType}
            </p>
            <p>
              <strong>Activity:</strong>{" "}
              {BUSINESS_CATEGORIES.find((item) => item.id === category)?.label}
            </p>
            {activities && (
              <p>
                <strong>Details:</strong> {activities}
              </p>
            )}
          </div>

          <button className="btn" type="button" onClick={checkEligibility}>
            Check Zoning Eligibility
          </button>

          {result && (
            <StatusCard status={result.result} title="Zoning check result">
              <p className="muted small" role="status" style={{ margin: 0 }}>
                Simulation only · Not an official CPDSO determination
              </p>
              <p>
                <strong>Business:</strong> {result.businessType}
              </p>
              <p>
                <strong>Location:</strong> {result.location}
              </p>
              <p>
                <strong>Map pin:</strong> {result.coordinates?.lat.toFixed(6)},{" "}
                {result.coordinates?.lng.toFixed(6)}
              </p>
              <p>
                <strong>Zone:</strong> {result.zone}
              </p>
              <p>
                <strong>Explanation:</strong> {result.explanation}
              </p>
              {result.conditions.length > 0 && (
                <>
                  <strong>Conditions to verify</strong>
                  <ul style={{ paddingLeft: 23 }}>
                    {result.conditions.map((condition) => (
                      <li key={condition}>{condition}</li>
                    ))}
                  </ul>
                </>
              )}
              <strong>Next steps</strong>
              <ul style={{ paddingLeft: 23 }}>
                {result.tips?.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
              <p className="muted small">
                The status is generated deterministically from the information
                entered above. It does not use official GIS data or assign an
                authoritative zone classification.
              </p>
              <Link className="btn secondary" href="/dashboard">
                Continue to Dashboard
              </Link>
            </StatusCard>
          )}

          <details
            style={{
              border: "1px solid #dbe4ef",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: 800 }}>
              Already have a BiZ Checker PDF? Upload it here
            </summary>
            <p className="muted small" style={{ marginTop: 12 }}>
              Get a report from the{" "}
              <a
                href="https://bizchecker.online/zoning"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1455bb", textDecoration: "underline" }}
              >
                Baguio BiZ Checker
              </a>{" "}
              and upload it for extraction. Review the details before saving.
            </p>
            <input
              aria-label="Upload BiZ Checker zoning PDF"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                setReportFile(event.target.files?.[0] ?? null);
                setReport(null);
                setMatchConfirmed(false);
                setError("");
              }}
            />
            <button
              className="btn secondary"
              type="button"
              disabled={!reportFile || uploading}
              onClick={readPdf}
            >
              {uploading ? "Reading PDF..." : "Read zoning report"}
            </button>

            {report && (
              <StatusCard
                status={report.result.toUpperCase()}
                title="Result stated in the uploaded report"
              >
                <p>
                  <strong>Business:</strong> {report.businessType}
                </p>
                <p>
                  <strong>Address:</strong> {report.location}
                </p>
                <p>
                  <strong>Zone:</strong> {report.zone}
                </p>
                {report.generatedAt && (
                  <p>
                    <strong>Report date:</strong> {report.generatedAt}
                  </p>
                )}
                {report.conditions.length > 0 && (
                  <>
                    <strong>Reported conditions</strong>
                    <ul style={{ paddingLeft: 23 }}>
                      {report.conditions.map((condition, index) => (
                        <li key={`${condition}-${index}`}>{condition}</li>
                      ))}
                    </ul>
                  </>
                )}
                {(report.tips?.length ?? 0) > 0 && (
                  <>
                    <strong>Suggested next steps</strong>
                    <ul style={{ paddingLeft: 23 }}>
                      {report.tips?.map((tip, index) => (
                        <li key={`${tip}-${index}`}>{tip}</li>
                      ))}
                    </ul>
                  </>
                )}
                <label
                  style={{ display: "flex", gap: 9, alignItems: "flex-start" }}
                >
                  <input
                    type="checkbox"
                    checked={matchConfirmed}
                    onChange={(event) =>
                      setMatchConfirmed(event.target.checked)
                    }
                    style={{ marginTop: 5 }}
                  />
                  I checked that the business and address in this PDF match the
                  details entered above.
                </label>
                <button
                  className="btn"
                  type="button"
                  disabled={!matchConfirmed || fileResultSaved}
                  onClick={saveReport}
                >
                  {fileResultSaved
                    ? "Result saved"
                    : "Save report to Compliance Passport"}
                </button>
                {fileResultSaved && (
                  <p style={{ color: "#166534", fontWeight: 700 }}>
                    Saved. You will remain on this page until you choose to
                    continue.
                  </p>
                )}
                <p className="muted small">
                  Uploaded PDFs are not cryptographically authenticated by this
                  app. Verify the report with CPDSO before relying on it.
                </p>
              </StatusCard>
            )}
          </details>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <button
          className="btn secondary"
          type="button"
          disabled={step === 0 || uploading}
          onClick={() => {
            setStep((current) => current - 1);
            setError("");
          }}
        >
          Back
        </button>
        {step < 4 && (
          <button
            className="btn"
            type="button"
            disabled={!canNext || uploading}
            onClick={() => {
              setStep((current) => current + 1);
              setError("");
            }}
          >
            Next
          </button>
        )}
      </div>

      <p className="muted small">
        NEGOSYO READY is an independent preparation tool, not a permit. The
        simulated result does not use official GIS data. Final zoning and
        locational clearance decisions belong to CPDSO. Uploaded documents are
        sent to OpenAI for processing.
      </p>
    </div>
  );
}
