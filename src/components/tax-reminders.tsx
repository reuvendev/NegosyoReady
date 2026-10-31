"use client";
import { useState } from "react";
import { useStore } from "@/components/store";
import { dueDays, TaxReminder } from "@/lib/data";
import { nextReminderDate } from "@/lib/reminder-dates";

export function TaxReminders() {
  const { state, save } = useStore();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [source, setSource] = useState("");
  const [frequency, setFrequency] = useState<"once" | "quarterly" | "annual">("once");
  const reminders = state.taxReminders || [];
  function add() {
    if (!title.trim() || !dueDate || !source.trim()) return;
    save({ ...state, taxReminders: [...reminders, { id: crypto.randomUUID(), title: title.trim(), dueDate, source: source.trim(), frequency }] });
    setTitle(""); setDueDate(""); setSource(""); setFrequency("once");
  }
  return <div className="card stack" style={{marginBottom:20}}>
    <h2 className="section-heading">Tax and filing deadlines</h2>
    <p className="muted small">Enter dates confirmed from your BIR registration, official filing calendar, or agency notice. A zoning report does not contain tax filing dates. Quarterly and annual reminders repeat from the date you enter; confirm each new deadline with the agency.</p>
    <div className="grid2">
      <div><label className="label" htmlFor="reminder-title">Tax or filing obligation</label><input id="reminder-title" className="field" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Quarterly income tax filing"/></div>
      <div><label className="label" htmlFor="reminder-date">Next confirmed due date</label><input id="reminder-date" className="field" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></div>
    </div>
    <div className="grid2">
      <div><label className="label" htmlFor="reminder-frequency">Repeat reminder</label><select id="reminder-frequency" className="field" value={frequency} onChange={e=>setFrequency(e.target.value as typeof frequency)}><option value="once">One time</option><option value="quarterly">Every 3 months (estimated)</option><option value="annual">Every year (estimated)</option></select></div>
      <div><label className="label" htmlFor="reminder-source">Official source or reference</label><input id="reminder-source" className="field" value={source} onChange={e=>setSource(e.target.value)} placeholder="BIR notice or official link"/></div>
    </div>
    <button className="btn" disabled={!title.trim()||!dueDate||!source.trim()} onClick={add}>Save deadline</button>
    {reminders.map(r=>{const next=nextReminderDate(r);const days=dueDays(next);return <div key={r.id} className="checkrow" style={{justifyContent:"space-between",gap:12}}><div><strong>{r.title}</strong><p className="muted small">{next} · {r.frequency === "quarterly" ? "Quarterly estimate" : r.frequency === "annual" ? "Annual estimate" : "One time"}</p><p className="muted small">{days===null?"Date unavailable":days<0?`${Math.abs(days)} days overdue`:days===0?"Due today":`Due in ${days} days`} · Source: {r.source}</p></div><button className="btn ghost" onClick={()=>save({...state,taxReminders:reminders.filter(x=>x.id!==r.id)})}>Remove</button></div>})}
    <p className="muted small">Alerts appear in the app. You can also enable browser notifications while this website is open. This does not send email or background notifications when the browser is closed.</p>
  </div>;
}
