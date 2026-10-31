/** Deterministic zoning checks. Never infer the legal zone from street names, a barangay, or an LLM. */
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

export type Pin={lat:number;lng:number};
export type ZoningDecision={status:'ALLOWED'|'CONDITIONAL'|'NOT ALLOWED'|'NOT VERIFIED';zone:string|null;zoneName?:string;reason:string;conditions:string[];source:string|null;ruleReference:string|null;method:'official_map'|'unavailable';checkedAt:string};
export type Rule={status:'ALLOWED'|'CONDITIONAL'|'NOT ALLOWED';reason:string;conditions?:string[];reference:string};
type Ring=number[][];
type GeoFeature={type:'Feature';geometry:{type:'Polygon'|'MultiPolygon';coordinates:number[][][]|number[][][][]};properties:Record<string,unknown>};
type FeatureCollection={type:'FeatureCollection';features:GeoFeature[];metadata?:{authority?:string;sourceUrl?:string;verifiedAt?:string;ordinance?:string}};
type RuleSet={metadata?:{sourceUrl?:string;verifiedAt?:string;ordinance?:string};zones:Record<string,{label?:string;businesses:Record<string,Rule>}>};

function inRing(point:[number,number], ring:Ring){
 // Even-odd containment. The tolerance catches points on edges for manual verification.
 let inside=false;let edge=false;
 for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const [xi,yi]=ring[i], [xj,yj]=ring[j];
  const cross=(point[0]-xi)*(yj-yi)-(point[1]-yi)*(xj-xi);
  const len=Math.hypot(xj-xi,yj-yi);
  if(len>0&&Math.abs(cross)/len<0.000004&&point[0]>=Math.min(xi,xj)-0.000004&&point[0]<=Math.max(xi,xj)+0.000004&&point[1]>=Math.min(yi,yj)-0.000004&&point[1]<=Math.max(yi,yj)+0.000004)edge=true;
  if(((yi>point[1])!==(yj>point[1]))&&point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi)inside=!inside;
 }
 return {inside,edge};
}
function inPolygon(p:[number,number],rings:Ring[]){if(!rings.length)return {inside:false,edge:false};const shell=inRing(p,rings[0]);let inside=shell.inside;let edge=shell.edge;for(let n=1;n<rings.length;n++){const hole=inRing(p,rings[n]);if(hole.inside)inside=false;if(hole.edge)edge=true;}return {inside,edge};}
function locate(f:GeoFeature,p:[number,number]){
 const polys:Ring[][]=f.geometry.type==='Polygon'?[f.geometry.coordinates as Ring[]]:(f.geometry.coordinates as Ring[][]);
 let inside=false,edge=false;
 for(const poly of polys){const r=inPolygon(p,poly);inside ||=r.inside;edge ||=r.edge;}
 return {inside,edge};
}
function unavailable(reason:string, source:string|null=null):ZoningDecision{return {status:'NOT VERIFIED',zone:null,reason,conditions:[],source,ruleReference:null,method:'unavailable',checkedAt:new Date().toISOString()};}
function isString(x:unknown):x is string{return typeof x==='string' && x.length>0;}
export function evaluateFromData(pin:Pin,category:string,map:FeatureCollection,rules:RuleSet):ZoningDecision{
 const source=map.metadata?.sourceUrl || null;
 if(!Array.isArray(map.features)||!map.features.length)return unavailable('No zoning map polygons are available.',source);
 if(!map.metadata?.authority||!map.metadata?.verifiedAt||!source || !rules.metadata?.sourceUrl || !rules.metadata?.verifiedAt)return unavailable('Zoning boundaries and rules are missing required source and verification metadata.',source);
 const hits=map.features.filter(f=>f?.type==='Feature'&&f.geometry&&['Polygon','MultiPolygon'].includes(f.geometry.type)&&locate(f,[pin.lng,pin.lat]).inside);
 if(!hits.length)return unavailable('The pinned point is outside the mapped area. Ask CPDSO to verify the zoning classification.',source);
 if(hits.length>1||hits.some(f=>locate(f,[pin.lng,pin.lat]).edge))return unavailable('The pin is near a zoning boundary or overlapping mapped areas; CPDSO must confirm the lot classification.',source);
 const properties=hits[0].properties;
 const zone=isString(properties.zone)?properties.zone.trim().toUpperCase():null;
 if(!zone)return unavailable('The mapped polygon has no readable zoning code.',source);
 const zoneRules=rules.zones?.[zone];
 if(!zoneRules)return {...unavailable(`Zone ${zone} was found, but its permitted-use rules have not been verified.`,source),zone};
 const rule=zoneRules.businesses?.[category];
 if(!rule||!['ALLOWED','CONDITIONAL','NOT ALLOWED'].includes(rule.status)||!isString(rule.reference)||!isString(rule.reason))return {...unavailable(`Zone ${zone} was located, but this business activity has no verified rule.`,source),zone,zoneName:zoneRules.label};
 return {status:rule.status,zone,zoneName:zoneRules.label,reason:rule.reason,conditions:Array.isArray(rule.conditions)?rule.conditions.filter(isString).slice(0,12):[],source,ruleReference:rule.reference,method:'official_map',checkedAt:new Date().toISOString()};
}
export async function checkZone(pin:Pin,category:string):Promise<ZoningDecision>{
 try{
  const root=join(process.cwd(),'data');
  const [mapText,rulesText]=await Promise.all([readFile(join(root,'baguio-zoning.geojson'),'utf8'),readFile(join(root,'zoning-rules.json'),'utf8')]);
  const map=JSON.parse(mapText) as FeatureCollection;const rules=JSON.parse(rulesText) as RuleSet;
  return evaluateFromData(pin,category,map,rules);
 }catch{return unavailable('Verified Baguio zoning map and permitted-use data are not installed. Use a BiZ Checker result or contact CPDSO.');}
}
