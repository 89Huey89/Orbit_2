/* Shared by build.mjs and verify.mjs: turns src/index.html plus its module scripts into one
   self-contained HTML document with a single inline <script>. Node built-ins only. */
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const srcDir=new URL('../src/',import.meta.url);
const TAG=/^[ \t]*<script src="([^"]+)"><\/script>[ \t]*$/gm;

export async function bundle(){
  const template=await readFile(new URL('index.html',srcDir),'utf8');
  const names=[...template.matchAll(TAG)].map(m=>m[1]);
  if(names.length===0)throw new Error('src/index.html has no module script tags.');
  const parts=[];
  for(const name of names){
    let source=await readFile(new URL(name,srcDir),'utf8');
    source=source.replace(/^'use strict';\r?\n/,'');
    parts.push(`// ===== src/${name} =====\n${source.trimEnd()}`);
  }
  const script=`'use strict';\n${parts.join('\n\n')}\n`;
  // The stylesheet is named by what it holds, not only where it is. A browser reloading the page asks
  // again for the page but may keep a subresource it fetched minutes ago, so a font added to fonts.css
  // arrived with the page that sets it and then was never loaded: the faces fell back until the cached
  // copy expired. A hash of the file in the query string makes every new cut a new address.
  const fontsVersion=createHash('sha256').update(await readFile(new URL('../assets/fonts.css',import.meta.url))).digest('hex').slice(0,10);
  let seen=false;
  const html=template.replace(TAG,()=>{if(seen)return '';seen=true;return `<script>\n${script}</script>`;})
    .replace(/\n{3,}/g,'\n\n')
    .replace('href="../assets/fonts.css"',`href="assets/fonts.css?v=${fontsVersion}"`);
  return {html,script,names,template};
}
