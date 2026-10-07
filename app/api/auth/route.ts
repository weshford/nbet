import {storage} from '@/db/storage';
import {authenticated,hash,noStore,sameOrigin,sessionCookie,token,unauthorized,verifyPassword,viewer} from '@/lib/auth';
export async function GET(request:Request){try{return Response.json({authenticated:await authenticated(request),username:'admin'},{headers:noStore})}catch(e){console.error(e);return Response.json({error:'Anmeldung ist gerade nicht erreichbar.'},{status:503,headers:noStore})}}
export async function POST(request:Request){
 try{
  if(!sameOrigin(request))return new Response(null,{status:403});
  const v=viewer(request);if(!v)return unauthorized();
  const body=await request.json() as {username?:unknown;password?:unknown};
  if(typeof body?.username!=='string'||typeof body?.password!=='string'||body.username.length>100||body.password.length>256)return Response.json({error:'Bitte gib Benutzername und Passwort ein.'},{status:400,headers:noStore});
  const db=storage(),now=new Date().toISOString(),reset=new Date(Date.now()+15*60*1000).toISOString();
  const attempt=await db.prepare('INSERT INTO login_attempts (viewer,count,reset_at) VALUES (?,1,?) ON CONFLICT(viewer) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE CAST(count AS INTEGER)+1 END, reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END RETURNING count').bind(v,reset,now,now).first<{count:string}>();
  if(Number(attempt?.count)>8)return Response.json({error:'Zu viele Anmeldeversuche. Bitte warte 15 Minuten.'},{status:429,headers:{...noStore,'Retry-After':'900'}});
  const correct=await verifyPassword(body.password);
  if(body.username!=='admin'||!correct)return Response.json({error:'Benutzername oder Passwort ist falsch.'},{status:401,headers:noStore});
  const raw=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
  const previous=token(request);
  const statements=[db.prepare('DELETE FROM sessions WHERE expires<=?').bind(now),db.prepare('INSERT INTO sessions (token_hash,viewer,expires) VALUES (?,?,?)').bind(await hash(raw),v,new Date(Date.now()+86400000).toISOString()),db.prepare('DELETE FROM login_attempts WHERE viewer=?').bind(v)];
  if(previous)statements.push(db.prepare('DELETE FROM sessions WHERE token_hash=? AND viewer=?').bind(await hash(previous),v));
  await db.batch(statements);
  return Response.json({authenticated:true,username:'admin'},{headers:{...noStore,'Set-Cookie':sessionCookie(raw)}});
 }catch(e){console.error(e);return Response.json({error:'Anmeldung fehlgeschlagen. Bitte versuche es erneut.'},{status:503,headers:noStore})}
}
export async function DELETE(request:Request){try{if(!sameOrigin(request))return new Response(null,{status:403});const t=token(request),v=viewer(request);if(t&&v)await storage().prepare('DELETE FROM sessions WHERE token_hash=? AND viewer=?').bind(await hash(t),v).run();return Response.json({authenticated:false},{headers:{...noStore,'Set-Cookie':sessionCookie('',true)}})}catch(e){console.error(e);return Response.json({error:'Abmelden fehlgeschlagen. Bitte versuche es erneut.'},{status:503,headers:noStore})}}
