"use client";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Heading, Notice, EmptyProfile } from "@/components/ui";
import { dueDays } from "@/lib/data";
import { TaxReminders } from "@/components/tax-reminders";
function Content() {
  const { state } = useStore();
  if (!state.business)
    return (
      <>
        <Heading title="Renewal tracker" description="Track entered dates" />
        <EmptyProfile />
      </>
    );
  const docs = [...state.documents]
    .filter((d) => d.expires)
    .sort((a, b) => a.expires.localeCompare(b.expires));
  return (
    <>
      <Heading
        title="Renewal tracker"
        description="See document expiry dates you entered. Official renewal schedules must be confirmed separately."
      />
      <TaxReminders />
      <div className="card">
        <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 15 }}>
          Upcoming document dates
        </h2>
        {!docs.length ? (
          <>
            <p className="muted" style={{ marginBottom: 18 }}>
              No expiration dates recorded yet.
            </p>
            <Link href="/documents" className="btn">
              Add document dates
            </Link>
          </>
        ) : (
          docs.map((d) => {
            const days = dueDays(d.expires);
            return (
              <div
                key={d.id}
                className="checkrow"
                style={{ justifyContent: "space-between" }}
              >
                <div>
                  <strong>{d.name}</strong>
                  <p className="muted small" style={{ marginTop: 6 }}>
                    {d.type} · {d.expires}
                  </p>
                </div>
                <span className="pill">
                  {days === null
                    ? "Unknown"
                    : days < 0
                      ? `${Math.abs(days)} days past date`
                      : days === 0
                        ? "Date is today"
                        : `${days} days remaining`}
                </span>
              </div>
            );
          })
        )}
      </div>
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
