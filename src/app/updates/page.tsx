"use client";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Heading, EmptyProfile } from "@/components/ui";
import { complianceAlerts } from "@/lib/compliance-updates";
import { AlertCircle, CalendarX, FileQuestion, Info, ExternalLink } from "lucide-react";

function Content() {
  const { state } = useStore();
  if (!state.business) return <><Heading title="Compliance updates & permit discovery" description="Check what your business may need"/><EmptyProfile/></>;
  const alerts = complianceAlerts(state.business, state.documents);
  const icon = { expired: CalendarX, review: AlertCircle, missing: FileQuestion, info: Info };
  const colors = { expired: "#b91c1c", review: "#b45309", missing: "#9a6700", info: "#1552ae" };
  return <>
    <Heading title="Compliance updates & permit discovery" description="Find missing records, renewal issues, and possible additional permits for your business." />
    <div className="card" style={{ marginBottom: 18 }}>
      <strong>{state.business.name}</strong><p className="muted small">{state.business.category} · {state.business.location}</p>
      <p className="muted small" style={{lineHeight:1.7}}>These suggestions compare your saved documents and business profile with a curated set of government references. <strong>Not a live government feed, official permit checklist, or confirmation of legal compliance.</strong> Source references were checked on October 31, 2026. Always confirm current rules with the issuing office.</p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Link className="btn secondary" href="/documents">Open Document Vault</Link><Link className="btn secondary" href="/settings">Update business profile</Link></div>
    </div>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
      <span className="tag">{alerts.filter(a=>a.level==="expired").length} past expiry</span><span className="tag">{alerts.filter(a=>a.level==="review").length} scan concerns</span><span className="tag">{alerts.filter(a=>a.level==="missing").length} records to check</span><span className="tag">{alerts.filter(a=>a.level==="info").length} additional checks</span>
    </div>
    {alerts.length ? alerts.map(alert => {const Icon=icon[alert.level];return <section className="card" key={alert.id} style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}><Icon size={23} color={colors[alert.level]}/><div style={{flex:1,minWidth:0}}><h3 style={{margin:"0 0 8px"}}>{alert.title}</h3><p style={{lineHeight:1.7,margin:"0 0 12px"}}>{alert.why}</p><strong>How to Fix This</strong><ol style={{paddingLeft:22,lineHeight:1.8}}>{alert.next.map((n,i)=><li key={i}>{n}</li>)}</ol><p className="muted small">Where to Go: {alert.office}</p><p className="muted small">Information Last Checked: {alert.sourceChecked}</p><a href={alert.source} target="_blank" rel="noopener noreferrer" style={{color:"#2563eb",textDecoration:"underline",textUnderlineOffset:3,display:"inline-flex",gap:5,alignItems:"center"}}>{alert.sourceName}<ExternalLink size={14}/></a>{alert.group && <div style={{marginTop:12}}><Link className="btn secondary" href="/documents">View My Documents</Link></div>}</div></div>
    </section>}) : <div className="card">No alerts based on the currently saved information. This does not confirm compliance.</div>}
  </>;
}
export default function Page(){return <Shell><Content/></Shell>}
