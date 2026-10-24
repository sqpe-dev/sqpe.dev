import test from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir,stat} from 'node:fs/promises';import {resolve,join} from 'node:path';
const root=resolve('dist');
async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);out.push(...(e.isDirectory()?await files(p):[p]));}return out;}
const all=await files(root),html=all.filter(p=>p.endsWith('.html'));
test('catalog has unique IDs, primary sources, honest evidence and review dates',async()=>{const entries=JSON.parse(await readFile(join(root,'catalog.json'),'utf8'));const source=[...JSON.parse(await readFile('data/research.json','utf8')),...JSON.parse(await readFile('data/industry.json','utf8'))];assert.deepEqual(entries,source);assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);for(const r of entries){for(const key of ['title','summary','url','caveat','verifiedDate','evidence'])assert.ok(r[key],`${r.id}: ${key}`);assert.equal(new URL(r.url).protocol,'https:');assert.match(r.verifiedDate,/^\d{4}-\d{2}-\d{2}$/);assert.ok(r.caveat.length>40);assert.ok(!r.evidence.includes('reproduced'));assert.ok(html.includes(join(root,'research',r.id,'index.html')))}});
test('all generated local hrefs and assets resolve, including fragments',async()=>{for(const f of html){const content=await readFile(f,'utf8');for(const [,raw] of content.matchAll(/(?:href|src)="([^"]+)"/g)){if(!raw.startsWith('/')&&!raw.startsWith('#'))continue;const u=new URL(raw,'https://sqpe.dev'+f.slice(root.length).replace(/index.html$/,''));let p=join(root,decodeURIComponent(u.pathname));if(u.pathname.endsWith('/'))p=join(p,'index.html');assert.ok((await stat(p)).isFile(),`${f}: ${raw}`);if(u.hash){const target=await readFile(p,'utf8');assert.ok(target.includes(`id="${u.hash.slice(1)}"`),`${f}: missing anchor ${raw}`)}}}});
test('every page has one h1, a unique title, description and main landmark',async()=>{const titles=new Set();for(const f of html){const c=await readFile(f,'utf8');assert.equal([...c.matchAll(/<h1[ >]/g)].length,1,f);const title=c.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title),title);titles.add(title);assert.match(c,/<meta name="description" content="[^"]+"/);assert.match(c,/<main id="main">/);assert.match(c,/<html lang="en">/)}});
test('no external runtime scripts, tracking or placeholder links',async()=>{for(const f of html){const c=await readFile(f,'utf8');assert.ok(!/src="https?:/.test(c),f);assert.ok(!/href="#"/.test(c),f);assert.ok(!/\bTODO\b|Lorem ipsum/.test(c),f)}});

test('benchmarks are grouped by evaluation scope and every record is reachable',async()=>{
 const entries=JSON.parse(await readFile(join(root,'catalog.json'),'utf8'));
 const page=await readFile(join(root,'benchmarks/index.html'),'utf8');
 for(const r of entries.filter(r=>['Benchmark','Evaluation study'].includes(r.category))){
  assert.ok(['engine','generation','adjacent','methodology'].includes(r.benchmarkGroup),r.id);
  const section=page.split(`id="${r.benchmarkGroup}"`)[1]?.split('</section>')[0];
  assert.ok(section?.includes(`/research/${r.id}/`),`${r.id} missing from correct group`);
  if(r.category==='Evaluation study')assert.equal(r.benchmarkGroup,'methodology');
 }
 assert.equal(entries.find(r=>r.id==='uda-bench').benchmarkGroup,'engine');
 assert.equal(entries.find(r=>r.id==='spider2-aifunc').benchmarkGroup,'generation');
});
