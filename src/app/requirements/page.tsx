"use client";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Heading, Notice, EmptyProfile, Meter } from "@/components/ui";
import { applicable } from "@/lib/data";
function Content() {
  const { state, save } = useStore();
  if (!state.business)
    return (
      <>
        <Heading title="Requirements" description="Preparation checklist" />
        <EmptyProfile />
      </>
    );
  const items = applicable(state.business.category);
  const done = items.filter((i) => state.completed.includes(i.id)).length;
  return (
    <>
      <Heading
        title="Preparation requirements"
        description={`Illustrative checklist for ${state.business.category}. Confirm current requirements with the relevant offices.`}
      />
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <strong>Checklist progress</strong>
          <span className="muted small">
            {done}/{items.length} items
          </span>
        </div>
        <Meter value={Math.round((done / items.length) * 100)} />
        <div style={{ marginTop: 18 }}>
          {items.map((i) => (
            <label className="checkrow" key={i.id}>
              <input
                type="checkbox"
                checked={state.completed.includes(i.id)}
                onChange={(e) =>
                  save({
                    ...state,
                    completed: e.target.checked
                      ? [...state.completed, i.id]
                      : state.completed.filter((x) => x !== i.id),
                  })
                }
              />
              <span>
                <strong>{i.title}</strong>
                <span
                  className="muted small"
                  style={{ display: "block", lineHeight: 1.7, marginTop: 5 }}
                >
                  {i.detail}
                </span>
              </span>
            </label>
          ))}
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
