import {writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const commit=process.argv[2];
if(!/^[a-f0-9]{40}$/.test(commit||''))throw new Error('Usage: npm run catalog:update -- <full catalog commit SHA>');
const files={};const buffers={};
for(const [remote,local] of [['records.json','catalog.json'],['reference-inventory.json','reference-inventory.json']]){
 const response=await fetch(`https://raw.githubusercontent.com/sqpe-dev/catalog/${commit}/data/${remote}`);
 if(!response.ok)throw new Error(`Catalog fetch failed: ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());const value=JSON.parse(bytes);
 if(!Array.isArray(value))throw new Error('Expected catalog array');
 buffers[local]=bytes;files[local]=createHash('sha256').update(bytes).digest('hex');
}
const rows=JSON.parse(buffers['catalog.json']);const ids=new Set(rows.map(r=>r.id));
if(ids.size!==rows.length)throw new Error('Duplicate catalog IDs');
for(const ref of JSON.parse(buffers['reference-inventory.json']))if(!ids.has(ref.recordId))throw new Error('Unresolved inventory entry');
// Fetch and parse everything before replacing the pinned snapshot; write lock last.
for(const [name,bytes] of Object.entries(buffers)){await writeFile('data/'+name+'.tmp',bytes);await rename('data/'+name+'.tmp','data/'+name)}
await writeFile('data/catalog.lock.json',JSON.stringify({repository:'sqpe-dev/catalog',commit,files},null,2)+'\n');
console.log(`Pinned ${rows.length} records at ${commit}. Run npm run check and review the diff.`);
