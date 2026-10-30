import Link from "next/link";
import {
  BriefcaseBusiness,
  ClipboardCheck,
  FileCheck2,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
export default function Home() {
  return (
    <>
      <header
        style={{ background: "white", borderBottom: "1px solid #e5eaf1" }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 18,
            paddingBottom: 18,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <BriefcaseBusiness color="#1552ae" /> NEGOSYO READY
          </div>
          <Link className="btn secondary" href="/dashboard">
            Open workspace
          </Link>
        </div>
      </header>
      <section className="hero">
        <div className="container" style={{ maxWidth: 920 }}>
          <span className="pill">
            Built for Baguio micro and small businesses
          </span>
          <h1 className="h1" style={{ margin: "22px 0" }}>
            Get ready. Stay ready.
            <br />
            <span style={{ color: "#1455bb" }}>Renew ready.</span>
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.7,
              maxWidth: 640,
              color: "#52657f",
            }}
          >
            A simpler way to prepare business requirements, organize document
            records, and keep track of your next steps.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 30,
            }}
          >
            <Link href="/onboarding" className="btn">
              Get started <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="btn ghost">
              View dashboard
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 12 }}>
            One workspace for the preparation work
          </h2>
          <p className="muted" style={{ marginBottom: 26 }}>
            Track your progress without confusing preparation with official
            approval.
          </p>
          <div className="grid3">
            {[
              {
                Icon: ClipboardCheck,
                title: "Understand requirements",
                desc: "Explore illustrative preparation checklists based on your business type.",
              },
              {
                Icon: FileCheck2,
                title: "Organize documents",
                desc: "Record document details and monitor what may need attention.",
              },
              {
                Icon: CalendarClock,
                title: "Plan renewals",
                desc: "Keep an eye on the expiration dates you enter.",
              },
            ].map(({ Icon, title, desc }) => (
              <div className="card" key={title}>
                <Icon color="#1455bb" size={29} />
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    margin: "18px 0 9px",
                  }}
                >
                  {title}
                </h3>
                <p className="muted" style={{ lineHeight: 1.7 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 25 }}>
            How it works
          </h2>
          <div className="grid3">
            {[
              "Tell us about your business",
              "Review your preparation checklist",
              "Track documents and upcoming dates",
            ].map((x, i) => (
              <div key={x}>
                <span className="pill">Step {i + 1}</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 14 }}>
                  {x}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="container">
          © 2026 NEGOSYO READY · Prototype only · No legal or official
          compliance determination
        </div>
      </footer>
    </>
  );
}
