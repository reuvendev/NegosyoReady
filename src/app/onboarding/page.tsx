"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Heading, Notice } from "@/components/ui";
import { categories, Business } from "@/lib/data";
function Form() {
  const { state, save } = useStore();
  const router = useRouter();
  const [form, setForm] = useState<Business>(
    state.business ?? {
      name: "",
      category: categories[0],
      location: "Baguio City",
      stage: "new",
    },
  );
  function change<K extends keyof Business>(key: K, value: Business[K]) {
    setForm((v) => ({ ...v, [key]: value }));
  }
  return (
    <>
      <Heading
        title="Set up your business"
        description="Tell us a little about your business to personalize your preparation workspace."
      />
      <form
        className="card stack"
        style={{ maxWidth: 690 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          save({ ...state, business: { ...form, name: form.name.trim() } });
          router.push("/dashboard");
        }}
      >
        <div>
          <label className="label" htmlFor="name">
            Business name *
          </label>
          <input
            id="name"
            className="field"
            required
            maxLength={120}
            value={form.name}
            onChange={(e) => change("name", e.target.value)}
            placeholder="e.g., My Neighborhood Café"
          />
        </div>
        <div className="grid2">
          <div>
            <label className="label" htmlFor="category">
              Business category
            </label>
            <select
              id="category"
              className="field"
              value={form.category}
              onChange={(e) => change("category", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="stage">
              Business stage
            </label>
            <select
              id="stage"
              className="field"
              value={form.stage}
              onChange={(e) =>
                change("stage", e.target.value as Business["stage"])
              }
            >
              <option value="new">Planning / new</option>
              <option value="existing">Already operating</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="location">
            Business location
          </label>
          <input
            id="location"
            className="field"
            value={form.location}
            onChange={(e) => change("location", e.target.value)}
            placeholder="Barangay, Baguio City"
          />
        </div>
        <div>
          <label className="label" htmlFor="opening">
            Planned / actual opening date (optional)
          </label>
          <input
            id="opening"
            className="field"
            type="date"
            value={form.openingDate || ""}
            onChange={(e) => change("openingDate", e.target.value)}
          />
        </div>
        <button className="btn" type="submit">
          Save and continue
        </button>
      </form>
      <Notice />
    </>
  );
}
export default function Page() {
  return (
    <Shell>
      <Form />
    </Shell>
  );
}
