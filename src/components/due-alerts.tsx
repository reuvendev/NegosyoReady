"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { useStore } from "@/components/store";
import { dueDays } from "@/lib/data";
import { nextReminderDate } from "@/lib/reminder-dates";
export function DueAlerts() {
  const { state } = useStore();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [now, setNow] = useState(0);
  useEffect(() => {
    setPermission("Notification" in window ? Notification.permission : "unsupported");
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const upcoming = (state.taxReminders || []).map(r=>({...r, next:nextReminderDate(r), days:dueDays(nextReminderDate(r))})).filter(r=>r.days!==null && r.days<=30).sort((a,b)=>(a.days??0)-(b.days??0));
  useEffect(() => {
    if (permission !== "granted" || !upcoming.length || !now) return;
    const today = new Date().toLocaleDateString("en-CA");
    for (const r of upcoming) {
      const key = `nr-notified:${today}:${r.id}:${r.next}`;
      if (sessionStorage.getItem(key)) continue;
      try {
        new Notification(`NEGOSYO READY: ${r.title}`, { body: r.days! < 0 ? `${Math.abs(r.days!)} days overdue. Check the official filing deadline.` : r.days === 0 ? "Due today. Confirm with the agency." : `Due in ${r.days} days. Confirm with the agency.`, tag: `nr-${r.id}` });
        sessionStorage.setItem(key,"1");
      } catch { /* Browser may block notifications. In-app alerts remain visible. */ }
    }
  }, [permission, now, state.taxReminders]);
  const urgent = upcoming.some(r=>(r.days??31)<=7);
  return <section className="card" aria-label="Deadline notifications" style={{marginBottom:18,borderLeft:`4px solid ${urgent?"#d97706":"#2563eb"}`}}>
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}><BellRing size={19} color={urgent?"#b45309":"#2563eb"}/><strong>Deadline notifications {upcoming.length ? `(${upcoming.length})` : ""}</strong></div>
    {upcoming.length ? upcoming.slice(0,4).map(r=><p key={r.id} className="small" style={{marginTop:6}}><strong>{r.title}:</strong> {r.days!<0?`${Math.abs(r.days!)} days overdue`:r.days===0?"Due today":`Due in ${r.days} days`} · {r.next}{r.frequency && r.frequency!=="once" ? " (estimated repeat)" : ""}</p>) : <p className="muted small">No tax or filing deadlines within the next 30 days.</p>}
    <div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",marginTop:12}}>
      <Link className="inline-link" href="/renewal">Manage deadlines</Link>
      {permission === "default" && <button type="button" className="btn ghost" onClick={async()=>{const result=await Notification.requestPermission();setPermission(result);setNow(Date.now());}}>Enable browser notifications</button>}
      {permission === "granted" && <span className="muted small">Browser notifications enabled</span>}
    </div>
    <p className="muted small" style={{marginTop:8}}>Uses dates you entered. Repeated dates are estimates, not official BIR deadlines. Notifications work while this website is open.</p>
  </section>;
}
