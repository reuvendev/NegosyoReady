export type Business={name:string;category:string;location:string;stage:"new"|"existing";openingDate?:string;activities?:string;ownership?:string;premises?:string};
export type Review={status:"appears_complete"|"needs_review"|"unreadable";matchExpected:"matches"|"mismatch"|"uncertain";detectedType:string;fieldsFound:string[];issues:string[];explanation:string;issueDate?:string|null;expirationDate?:string|null;reviewedAt:string};
export type DocumentRecord={id:string;name:string;type:string;issued:string;expires:string;addedAt:string;requirementId?:string;fileName?:string;review?:Review};
export type PhotoFinding = {criterion:string;result:"potential_issue"|"no_visible_issue"|"cannot_verify";observation:string;action:string;photoNumber:number};
export type PhotoReview = {overall:"needs_attention"|"no_visible_issues"|"insufficient_evidence";summary:string;findings:PhotoFinding[];suggestedPhotos:string[];reviewedAt:string;photoCount?:number};
export type State={business:Business|null;completed:string[];inspection:string[];documents:DocumentRecord[];photoReviews?:PhotoReview[]};
export const KEY="negosyo-ready-phase1-v1";
export const initial:State={business:null,completed:[],inspection:[],documents:[],photoReviews:[]};
export const categories=["Eatery / Restaurant","Café / Coffee Shop","Sari-sari Store","Retail Store","Personal Services","Other"];
export type Item={id:string;title:string;detail:string;categories?:string[]};
// Illustrative examples only. No legal validity, deadlines or government approval implied.
export const requirements:Item[]=[
{id:"business-registration",title:"Business registration preparation",detail:"Identify the appropriate registration pathway for your ownership structure. Confirm details with the relevant government office."},
{id:"local-permit",title:"Local business permit inquiry",detail:"Check the current Baguio City requirements and official application channel before applying."},
{id:"tax-registration",title:"Tax registration preparation",detail:"Check applicable tax registration and invoicing obligations with the BIR."},
{id:"premises",title:"Premises and occupancy documents",detail:"Prepare documents related to your business location, if applicable. Confirm required forms with city offices."},
{id:"sanitation",title:"Food-handling and sanitation preparation",detail:"Review sanitation and food-handling obligations with the proper authority; applicability depends on your operations.",categories:["Eatery / Restaurant","Café / Coffee Shop"]},
{id:"safety",title:"Fire and workplace safety preparation",detail:"Review applicable safety measures and ask the relevant authorities which inspections or documents apply."}
];
export const inspections:Item[]=[
{id:"clear-pathways",title:"Clear entrances and walkways",detail:"Are entryways and common pathways unobstructed?"},
{id:"emergency-info",title:"Emergency contact information",detail:"Is emergency contact information easy for staff to find?"},
{id:"clean-premises",title:"Clean and maintained premises",detail:"Are work areas clean and maintained?"},
{id:"safe-storage",title:"Safe storage",detail:"Are products and supplies stored safely for your type of business?"},
{id:"staff-awareness",title:"Staff preparedness",detail:"Do staff know how to report hazards and respond to basic emergencies?"}
];
export function applicable(category:string){return requirements.filter(r=>!r.categories||r.categories.includes(category))}
export function dueDays(date:string){if(!date)return null;const d=new Date(date+"T00:00:00");if(Number.isNaN(d.getTime()))return null;return Math.ceil((d.getTime()-Date.now())/86400000)}

// Illustrative document groups for a demo, NOT a definitive government permit list.
export type DocumentNeed={id:string;title:string;detail:string;categories?:string[]};
export const documentNeeds:DocumentNeed[]=[
{id:"registration",title:"Business registration evidence",detail:"Check the appropriate registration route for your ownership structure."},
{id:"local",title:"Local permit or application record",detail:"Confirm the current city requirements and whether an application receipt is sufficient."},
{id:"tax",title:"Tax registration evidence",detail:"Confirm applicable BIR registration documents."},
{id:"premises-doc",title:"Premises-related record",detail:"Examples may include occupancy or location-related records, where applicable."},
{id:"food",title:"Food / sanitation-related record",detail:"Confirm which sanitary or food-handling documents apply.",categories:["Eatery / Restaurant","Café / Coffee Shop"]},
{id:"fire",title:"Fire safety-related record",detail:"Confirm the current inspection or clearance process with the responsible authority."}
];
export function applicableDocuments(category:string){return documentNeeds.filter(d=>!d.categories||d.categories.includes(category))}
export function hasUploadedRecord(d:DocumentRecord){return Boolean(d.fileName)}
export function documentCoverage(category:string,docs:DocumentRecord[]){return applicableDocuments(category).map(need=>({need,records:docs.filter(d=>d.requirementId===need.id&&hasUploadedRecord(d))}))}
