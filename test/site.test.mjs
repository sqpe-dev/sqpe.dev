import test from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir,stat} from 'node:fs/promises';import {resolve,join} from 'node:path';
const root=resolve('dist');
async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);out.push(...(e.isDirectory()?await files(p):[p]));}return out;}
const all=await files(root),html=all.filter(p=>p.endsWith('.html'));
test('catalog has unique IDs, primary sources, honest evidence and review dates',async()=>{const entries=JSON.parse(await readFile(join(root,'profiles.json'),'utf8'));const source=JSON.parse(await readFile('data/catalog.json','utf8')).filter(r=>r.profile);assert.deepEqual(entries,source);assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);for(const r of entries){for(const key of ['title','summary','url','caveat','verifiedDate','evidence'])assert.ok(r[key],`${r.id}: ${key}`);assert.equal(new URL(r.url).protocol,'https:');assert.match(r.verifiedDate,/^\d{4}-\d{2}-\d{2}$/);assert.ok(r.caveat.length>40);assert.ok(!r.evidence.includes('reproduced'));assert.ok(html.includes(join(root,'research',r.id,'index.html')))}});
test('all generated local hrefs and assets resolve, including fragments',async()=>{for(const f of html){const content=await readFile(f,'utf8');for(const [,raw] of content.matchAll(/(?:href|src)="([^"]+)"/g)){if(!raw.startsWith('/')&&!raw.startsWith('#'))continue;const u=new URL(raw,'https://sqpe.dev'+f.slice(root.length).replace(/index.html$/,''));let p=join(root,decodeURIComponent(u.pathname));if(u.pathname.endsWith('/'))p=join(p,'index.html');assert.ok((await stat(p)).isFile(),`${f}: ${raw}`);if(u.hash){const target=await readFile(p,'utf8');assert.ok(target.includes(`id="${u.hash.slice(1)}"`),`${f}: missing anchor ${raw}`)}}}});
test('every page has one h1, a unique title, description and main landmark',async()=>{const titles=new Set();for(const f of html){const c=await readFile(f,'utf8');assert.equal([...c.matchAll(/<h1[ >]/g)].length,1,f);const title=c.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title),title);titles.add(title);assert.match(c,/<meta name="description" content="[^"]+"/);assert.match(c,/<main id="main">/);assert.match(c,/<html lang="en">/)}});
test('no external runtime scripts, tracking or placeholder links',async()=>{for(const f of html){const c=await readFile(f,'utf8');assert.ok(!/src="https?:/.test(c),f);assert.ok(!/href="#"/.test(c),f);assert.ok(!/\bTODO\b|Lorem ipsum/.test(c),f)}});

test('benchmarks are grouped by evaluation scope and every record is reachable',async()=>{
 const entries=JSON.parse(await readFile(join(root,'profiles.json'),'utf8'));
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

test('indexable pages have canonical structured metadata and exact sitemap coverage',async()=>{
 const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');
 const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
 assert.equal(new Set(urls).size,urls.length);
 const expected=[];
 for(const f of html){
  const c=await readFile(f,'utf8');
  if(f===join(root,'404.html')){
   assert.match(c,/<meta name="robots" content="noindex">/);
   assert.ok(!c.includes('application/ld+json'));
   continue;
  }
  const path=f.slice(root.length).replace(/index.html$/,'');
  const canonical='https://sqpe.dev'+path;
  expected.push(canonical);
  assert.equal(c.match(/rel="canonical" href="([^"]+)"/)[1],canonical);
  assert.equal(c.match(/property="og:url" content="([^"]+)"/)[1],canonical);
  const data=JSON.parse(c.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(data['@context'],'https://schema.org');
  const page=data['@graph'].find(n=>['WebPage','CollectionPage'].includes(n['@type']));
  assert.equal(page.url,canonical);
  assert.equal(page.isPartOf['@id'],'https://sqpe.dev/#website');
  if(path!=='/'){
   const crumbs=data['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement;
   assert.equal(crumbs[0].item,'https://sqpe.dev/');
   assert.equal(crumbs.at(-1).item,canonical);
   assert.deepEqual(crumbs.map(n=>n.position),crumbs.map((_,i)=>i+1));
  }
 }
 assert.deepEqual(urls.sort(),expected.sort());
 const robots=await readFile(join(root,'robots.txt'),'utf8');
 assert.match(robots,/Allow: \/\n/);
 assert.match(robots,/Sitemap: https:\/\/sqpe.dev\/sitemap.xml/);
});

test('profiles describe the cited source without claiming its authorship and link related profiles',async()=>{
 const entries=JSON.parse(await readFile(join(root,'profiles.json'),'utf8'));
 for(const r of entries){
  const c=await readFile(join(root,'research',r.id,'index.html'),'utf8');
  const data=JSON.parse(c.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const page=data['@graph'].find(n=>n['@type']==='WebPage');
  assert.equal(page.about.name,r.title);
  assert.equal(page.about.url,r.url);
  assert.ok(!page.author);
  const related=entries.filter(other=>other.id!==r.id&&other.tags.some(t=>r.tags.includes(t)));
  if(related.length)assert.ok(related.some(other=>c.includes(`href="/research/${other.id}/"`)),r.id);
 }
});

test('full catalog covers the original bibliography and exports the same record set',async()=>{
 const entries=JSON.parse(await readFile(join(root,'catalog.json'),'utf8'));
 const inventory=JSON.parse(await readFile('data/reference-inventory.json','utf8'));
 const original=(await readFile('references/state-of-the-art.md','utf8')).split('## References\n')[1].split(/\n## /)[0].split('\n').filter(l=>l.startsWith('- ')).map(l=>l.slice(2));
 assert.deepEqual(inventory.map(r=>r.citation),original);
 const ids=new Set(entries.map(r=>r.id));assert.equal(ids.size,entries.length);
 for(const ref of inventory)assert.ok(ids.has(ref.recordId));
 const page=await readFile(join(root,'catalog/index.html'),'utf8');
 const bib=await readFile(join(root,'catalog.bib'),'utf8');
 const csv=await readFile(join(root,'catalog.csv'),'utf8');
 assert.equal([...bib.matchAll(/^@misc\{/gm)].length,entries.length);
 assert.equal(csv.trim().split('\n').length,entries.length+1);
 for(const r of entries){assert.ok(page.includes(`id="${r.id}"`));assert.ok(bib.includes('@misc{'+r.id+','));if(r.reviewStatus==='Metadata pending verification')assert.equal(r.verifiedDate,null)}
 assert.match(page,/template=source.yml/);assert.match(page,/template=correction.yml/);
 const lock=JSON.parse(await readFile('data/catalog.lock.json'));
 assert.match(lock.commit,/^[a-f0-9]{40}$/);assert.ok(page.includes(lock.commit));
 assert.deepEqual(JSON.parse(await readFile(join(root,'catalog-version.json'))),lock);
});
