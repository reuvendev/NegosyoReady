"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Heading, Notice } from "@/components/ui";
function Content() {
  const { state, reset } = useStore();
  const router = useRouter();
  return (
    <>
      <Heading
        title="Settings"
        description="Manage your local prototype workspace"
      />
      <div className="stack" style={{ maxWidth: 740 }}>
        <div className="card">
          <h2 style={{ fontWeight: 800, fontSize: 20 }}>Business profile</h2>
          <p className="muted" style={{ margin: "10px 0 20px" }}>
            {state.business
              ? `${state.business.name} · ${state.business.category}`
              : "No business profile yet"}
          </p>
          <Link className="btn secondary" href="/onboarding">
            {state.business ? "Edit profile" : "Create profile"}
          </Link>
        </div>
        <div className="card">
          <h2 style={{ fontWeight: 800, fontSize: 20 }}>Demo storage</h2>
          <p
            className="muted"
            style={{ lineHeight: 1.7, margin: "10px 0 20px" }}
          >
            Data is stored in this browser using localStorage. It is not synced
            between devices or shared with teammates.
          </p>
          <button
            className="btn ghost"
            onClick={() => {
              if (
                window.confirm(
                  "Delete all NEGOSYO READY demo data from this browser?",
                )
              ) {
                reset();
                router.push("/onboarding");
              }
            }}
          >
            Reset all demo data
          </button>
        </div>
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
