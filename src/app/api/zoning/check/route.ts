import {NextRequest,NextResponse} from 'next/server';
import {checkZone} from '@/lib/zoning-engine';
import {BUSINESS_CATEGORIES} from '@/lib/zoning-constants';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 try{
  const body=await req.json();const {coordinates,category}=body??{};
  if(!coordinates||typeof coordinates.lat!=='number'||typeof coordinates.lng!=='number'||!Number.isFinite(coordinates.lat)||!Number.isFinite(coordinates.lng)||coordinates.lat<16.25||coordinates.lat>16.55||coordinates.lng<120.45||coordinates.lng>120.75||!BUSINESS_CATEGORIES.some(c=>c.id===category))return NextResponse.json({error:'Select a valid Baguio location and business category.'},{status:400});
  const decision=await checkZone(coordinates,category);
  return NextResponse.json({decision},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Could not check the zoning map.'},{status:400});}
}
