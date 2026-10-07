import { storage } from '@/db/storage';
const COOKIE='kurve_session';
const SALT='a2a5a42f9f5ef01a5b86b5cc1bc5c94f';
const PASSWORD_HASH='7b3f858640f819bfcb8b5f7d84fc9b3626d6b50ebb24cff4c7a371fdc6d7e7b1';
export const noStore={'Cache-Control':'no-store, private'};
// Sites dispatch may provide only the authenticated email on private deployments.
// These are platform-authenticated headers; app username/password checks still apply.
export function viewer(request:Request){
 const id=request.headers.get('oai-authenticated-user-id')?.trim();
 if(id)return id;
 const email=request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
 return email?`email:${email}`:null;
}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin}
export async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('')}
export async function verifyPassword(password:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bytes=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(SALT),iterations:100000,hash:'SHA-256'},key,256));const expected=Uint8Array.from(PASSWORD_HASH.match(/.{2}/g)!,b=>parseInt(b,16));let diff=0;for(let i=0;i<bytes.length;i++)diff|=bytes[i]^expected[i];return diff===0}
export function token(request:Request){const value=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);return value&&/^[a-f0-9]{64}$/.test(value)?value:null}
export function sessionCookie(value:string,clear=false){return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${clear?0:86400}`}
export async function authenticated(request:Request){const v=viewer(request),t=token(request);if(!v||!t)return false;const row=await storage().prepare('SELECT token_hash FROM sessions WHERE token_hash=? AND viewer=? AND expires>?').bind(await hash(t),v,new Date().toISOString()).first();return !!row}
export const unauthorized=()=>Response.json({error:'Bitte melde dich an.'},{status:401,headers:noStore});
