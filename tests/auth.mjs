import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
const sqlite=new DatabaseSync(':memory:');
for(const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+name,'utf8'));
const db={prepare(sql){let args=[];return {bind(...values){args=values;return this},async first(){return sqlite.prepare(sql).get(...args)||null},async run(){return sqlite.prepare(sql).run(...args)},async all(){return {results:sqlite.prepare(sql).all(...args)}}}},async batch(statements){for(const s of statements)await s.run()}};
const cache=new Map();
function load(path){if(cache.has(path))return cache.get(path);const m={exports:{}};cache.set(path,m.exports);const code=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(name=>name==='@/db/storage'?{storage:()=>db}:load(name.replace('@/','')+'.ts'),m,m.exports);return m.exports}
const auth=load('app/api/auth/route.ts'),records=load('app/api/records/route.ts');
function req(method='GET',body,session='',user='owner',origin='https://example.test'){const headers={'oai-authenticated-user-id':user,origin,cookie:session};return new Request('https://example.test/api/auth',{method,headers,...(body?{body:JSON.stringify(body)}:{})})}
assert.equal((await records.GET(req())).status,401);
assert.equal((await records.POST(req('POST',{kind:'favorite',target:'VFB',value:'1'}))).status,401);
assert.equal((await records.DELETE(req('DELETE',{id:'favorite-VFB'}))).status,401);
assert.equal((await auth.POST(req('POST',{username:'admin',password:'wrong'}))).status,401);
assert.equal((await auth.POST(req('POST',{username:'other',password:'admin'}))).status,401);
assert.equal((await auth.POST(req('POST',{username:'admin',password:'admin'},'','owner','https://evil.test'))).status,403);
assert.equal((await auth.POST(req('POST',{username:'admin',password:'admin'},'',''))).status,401);
const login=await auth.POST(req('POST',{username:'admin',password:'admin'}));assert.equal(login.status,200);
const fullCookie=login.headers.get('set-cookie');assert.match(fullCookie,/HttpOnly/);assert.match(fullCookie,/Secure/);assert.match(fullCookie,/SameSite=Strict/);
const cookie=fullCookie.split(';')[0];
assert.equal((await (await auth.GET(req('GET',undefined,cookie))).json()).authenticated,true);
assert.equal((await (await auth.GET(req('GET',undefined,cookie,'other-viewer'))).json()).authenticated,false);
assert.equal((await records.POST(req('POST',{kind:'favorite',target:'VFB',value:'1'},cookie))).status,200);
assert.equal((await (await records.GET(req('GET',undefined,cookie))).json()).length,1);
assert.equal((await auth.DELETE(req('DELETE',undefined,cookie))).status,200);
assert.equal((await records.GET(req('GET',undefined,cookie))).status,401);
const again=await auth.POST(req('POST',{username:'admin',password:'admin'}));const second=again.headers.get('set-cookie').split(';')[0];
assert.equal((await (await records.GET(req('GET',undefined,second))).json())[0].target,'VFB');
sqlite.exec("UPDATE sessions SET expires='2000-01-01T00:00:00.000Z'");
assert.equal((await records.GET(req('GET',undefined,second))).status,401);
for(let i=0;i<8;i++)assert.equal((await auth.POST(req('POST',{username:'admin',password:'wrong'},'','rate-test'))).status,401);
assert.equal((await auth.POST(req('POST',{username:'admin',password:'admin'},'','rate-test'))).status,429);
const {standings,teams,matches}=load('lib/football.ts');assert.equal(standings.length,18);assert.equal(new Set(standings.map(t=>t.id)).size,18);for(const row of standings){assert(teams.some(t=>t.id===row.id));assert(matches.some(m=>m.home===row.id||m.away===row.id));assert.equal(row.points,row.won*3+row.drawn)}
console.log('Passed: login, invalid credentials, origin validation, protected CRUD, viewer binding, secure cookie, logout invalidation, expiry, rate limiting, preserved records and 18-team leaderboard coverage.');

// Production regression: Sites forwards email and full name, but no user-id header.
function emailRequest(method='GET',body,cookie='',email='owner@example.test'){
 const r=req(method,body,cookie,'');r.headers.delete('oai-authenticated-user-id');
 r.headers.set('oai-authenticated-user-email',email);return r;
}
assert.equal((await auth.POST(emailRequest('POST',{username:'admin',password:'wrong'}))).status,401);
const emailLogin=await auth.POST(emailRequest('POST',{username:'admin',password:'admin'}));
assert.equal(emailLogin.status,200);
const emailCookie=emailLogin.headers.get('set-cookie').split(';')[0];
assert.equal((await (await auth.GET(emailRequest('GET',undefined,emailCookie))).json()).authenticated,true);
assert.equal((await records.GET(emailRequest('GET',undefined,emailCookie))).status,200);
assert.equal((await records.GET(emailRequest('GET',undefined,emailCookie,'someone-else@example.test'))).status,401);
assert.equal((await records.GET(req('GET',undefined,emailCookie,''))).status,401);
assert.equal((await auth.DELETE(emailRequest('DELETE',undefined,emailCookie))).status,200);
assert.equal((await records.GET(emailRequest('GET',undefined,emailCookie))).status,401);
console.log('Passed: email-only production identity login, password rejection, protected records, identity isolation and logout.');
