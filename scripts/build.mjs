import {writeFile,mkdir,cp,readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
import {transform} from 'esbuild';
import {bundle} from './bundle.mjs';
const {html,script,names}=await bundle();
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if(scripts.length!==1)throw new Error('Expected one self-contained script in the built page.');
new Script(script,{filename:'dist/index.html'});
const externalRef=/<(script|link|img|audio|video)\b[^>]*(src|href)=["']https?:/i;
if(externalRef.test(html))throw new Error('External dependency found.');
if(!html.includes('new OrbitWorld('))throw new Error('Game bootstrap missing.');
// The page ships minified: the source stays full-word and fully commented, in the atlas's own prose,
// for whoever reads it next, but none of that needs to cross the wire to a phone on a slow connection.
// Renaming everything esbuild can find is only safe because nothing outside this one inline script
// ever names one of its functions or classes by string — no inline `on...=` handler in the markup, no
// `window.Name` reflection anywhere in src/ — checked in the shell, not assumed, before this was added.
const {code:minified}=await transform(script,{minify:true});
new Script(minified,{filename:'dist/index.html (minified)'});
const shipped=html.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/i,(_,attrs)=>`<script${attrs}>\n${minified}\n</script>`);
if(externalRef.test(shipped))throw new Error('External dependency found.');
// The Rock's readability spike (docs/archive/eras/JOURNEY.md's stage 2) is still shipped as a sibling page,
// though the frontispiece no longer opens it: era I is a plate now, flown on OrbitWorld, and the spike
// is the record of the question that had to be answered before it could be drawn — a standalone canvas
// sheet with its own toy physics, never a module the game loads. It is deployed static HTML, so it is
// held to the same no-network rule as the page it stands beside.
const rock=await readFile(new URL('../docs/archive/eras/prototypes/rock-read.html',import.meta.url),'utf8');
if(externalRef.test(rock))throw new Error('External dependency found in the Rock prototype.');
const dist=new URL('../dist/',import.meta.url);
await mkdir(dist,{recursive:true});
await writeFile(new URL('index.html',dist),shipped);
// The full faces in assets/fonts.source.css are what fonts.css and glyphs.js are cut from; only the
// cut stylesheet is served, so the built page never carries a character the atlas cannot set.
await cp(new URL('../assets/',import.meta.url),new URL('assets/',dist),{recursive:true,filter:src=>!src.endsWith('.source.css')});
await writeFile(new URL('rock-read.html',dist),rock);
console.log(`Orbit built from ${names.length} modules: ${Buffer.byteLength(shipped).toLocaleString()} bytes of HTML (script minified from ${Buffer.byteLength(script).toLocaleString()} to ${Buffer.byteLength(minified).toLocaleString()} bytes) plus the embedded-font stylesheet in assets/ and the Rock's readability spike at dist/rock-read.html.`);
