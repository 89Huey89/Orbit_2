import {writeFile,mkdir,cp,readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
import {bundle} from './bundle.mjs';
const {html,script,names}=await bundle();
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if(scripts.length!==1)throw new Error('Expected one self-contained script in the built page.');
new Script(script,{filename:'dist/index.html'});
const externalRef=/<(script|link|img|audio|video)\b[^>]*(src|href)=["']https?:/i;
if(externalRef.test(html))throw new Error('External dependency found.');
if(!html.includes('new OrbitWorld('))throw new Error('Game bootstrap missing.');
// The Rock prototype (docs/eras/JOURNEY.md's readability spike for Era I) is shipped as a sibling
// page rather than folded into the bundle, since it is a standalone canvas sheet with its own toy
// physics, not a module the game loads; it is still deployed static HTML, so it is held to the same
// no-network rule as the page it stands beside.
const rock=await readFile(new URL('../docs/eras/prototypes/rock-read.html',import.meta.url),'utf8');
if(externalRef.test(rock))throw new Error('External dependency found in the Rock prototype.');
const dist=new URL('../dist/',import.meta.url);
await mkdir(dist,{recursive:true});
await writeFile(new URL('index.html',dist),html);
// The full faces in assets/fonts.source.css are what fonts.css and glyphs.js are cut from; only the
// cut stylesheet is served, so the built page never carries a character the atlas cannot set.
await cp(new URL('../assets/',import.meta.url),new URL('assets/',dist),{recursive:true,filter:src=>!src.endsWith('.source.css')});
await writeFile(new URL('rock-read.html',dist),rock);
console.log(`Orbit built from ${names.length} modules: ${Buffer.byteLength(html).toLocaleString()} bytes of HTML plus the embedded-font stylesheet in assets/ and the Rock prototype at dist/rock-read.html.`);
