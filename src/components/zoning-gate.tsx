"use client";
import {useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {useStore} from "@/components/store";
import type {ZoningReport, Business} from "@/lib/data";
import {inferCategory} from "@/lib/zoning-category";

export function ZoningGate({compact=false}:{compact?:boolean}){
 const {state,save}=useStore();const router=useRouter();
 const [file,setFile]=useState<File|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [drag,setDrag]=useState(false);const ref=useRef<HTMLInputElement>(null);
 const z=state.zoning;const allowed=z?.result?.toUpperCase()==="ALLOWED";
 function choose(f?:File){if(!f)return;if(!(f.type==="application/pdf"||f.name.toLowerCase().endsWith(".pdf"))){setError("Choose a PDF zoning report.");return;}if(f.size>8*1024*1024){setError("The PDF must be 8 MB or smaller.");return;}setFile(f);setError("");}
 async function scan(){if(!file)return;setBusy(true);setError("");try{
 const body=new FormData();body.set("file",file);const res=await fetch("/api/zoning/review",{method:"POST",body});const data=await res.json();if(!res.ok)throw Error(data.error||"Could not read report");
 const report=data.report as ZoningReport;if(!report.location||!report.businessType)throw Error("Business type or location is missing from the report.");
 const nextBusiness:Business={...(state.business||{name:report.businessType,category:inferCategory(report.businessType),location:report.location,stage:"new" as const}),category:inferCategory(report.businessType),location:report.location,activities:report.businessType};
 // The zoning report contains a proposed business type, not an actual registered business name.
 if(!state.business?.name)nextBusiness.name=report.businessType;
 save({...state,zoning:report,business:nextBusiness});
 // Keep the user on the homepage to review the zoning result.
 }catch(e){setError(e instanceof Error?e.message:"Unable to read report")}finally{setBusy(false)}}
 return <div className="card stack" style={{maxWidth:780}}>
 <div><h2 className="section-heading">Check if your business is allowed in this location</h2><p className="muted small">Start with Baguio BiZ Checker. Download its zoning PDF, then upload the report here to check the result and set up your business profile.</p></div>
 <a className="btn" href="https://bizchecker.online/zoning" target="_blank" rel="noopener noreferrer">Check zoning with BiZ Checker ↗</a>
 <div role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();ref.current?.click()}}} onClick={()=>ref.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);choose(e.dataTransfer.files[0])}} style={{border:`2px dashed ${drag?"#2563eb":"#a8b8d0"}`,borderRadius:14,padding:24,textAlign:"center",cursor:"pointer",background:"#f6f9ff"}}>
 <strong>Drag and drop your zoning PDF</strong><p className="muted small">or click to choose · PDF only · max 8 MB</p><input ref={ref} type="file" accept="application/pdf,.pdf" hidden onChange={e=>choose(e.target.files?.[0])}/>{file&&<p style={{fontWeight:700}}>{file.name}</p>}
 </div>
 <p className="muted small">Your PDF is sent to OpenAI to read its contents. Only the extracted summary is saved in this browser. Avoid uploading personal information you do not need to share.</p>
 <button className="btn" type="button" disabled={!file||busy} onClick={scan}>{busy?"Checking zoning report…":"Check zoning report"}</button>
 {error&&<p role="alert" style={{color:"#b91c1c"}}>{error}</p>}
 {z&&<div className="card stack" style={{background:allowed?"#effaf3":"#fff8ed",border:`1px solid ${allowed?"#86cfa2":"#f3bd71"}`}}>
 <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}><strong style={{fontSize:18}}>Zoning result</strong><span style={{borderRadius:30,padding:"6px 12px",fontWeight:800,background:allowed?"#dcfce7":"#ffedd5",color:allowed?"#166534":"#9a3412"}}>{allowed?"ALLOWED":z.result.toUpperCase()==="NOT ALLOWED"?"NOT ALLOWED":z.result.toUpperCase()==="CONDITIONAL"?"CONDITIONAL – REVIEW NEEDED":"RESULT UNCLEAR"}</span></div>
 <p><strong>Business:</strong> {z.businessType}</p><p><strong>Location:</strong> {z.location}</p><p><strong>Zone:</strong> {z.zone}</p>
 {z.conditions.length>0&&<div><strong>Conditions in the report</strong><ul style={{paddingLeft:22,marginTop:8}}>{z.conditions.map((c,i)=><li key={i}>{c}</li>)}</ul></div>}
 {!allowed&&<div><strong>Suggested next steps</strong><ul style={{paddingLeft:22,marginTop:8}}>{(z.tips?.length?z.tips:["Review the zoning conditions and the reason shown in your report.","Ask the Baguio City zoning office whether a different business use or location may be permitted.","Generate a new report after making changes."]).map((tip,i)=><li key={i}>{tip}</li>)}</ul><p className="muted small">Requirements remain locked until an allowed report is uploaded.</p></div>}
 {allowed&&<p style={{color:"#166534",fontWeight:700}}>Location check passed. Your business profile and Compliance Passport are filled with the business type and location from this report.</p>}
 <p className="muted small">This is a preliminary zoning check, not an official government approval. The report does not provide a registered business name, ownership type, or tax deadlines.</p>
 {allowed&&<button className="btn secondary" type="button" onClick={()=>router.push("/dashboard")}>Go to dashboard →</button>}
 </div>}
 </div>
}
