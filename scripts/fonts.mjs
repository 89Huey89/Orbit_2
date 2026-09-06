/* Orbit · scripts/fonts.mjs
   `npm run fonts` — cuts assets/fonts.source.css down to assets/fonts.css.

   The source stylesheet holds every face as its publisher shipped it, with every character it was
   drawn for: five Latin faces as inlined base64 woff2, plus Noto Egyptian Hieroglyphs as inlined
   base64 TrueType, the form Noto ships it in. The atlas sets a few hundred characters of what's on
   offer (and, for the Ceiling, twenty-some hieroglyphs out of the block's thousand-plus) and carries
   the rest across the wire for nothing, so this writes a second stylesheet containing the same faces
   cut to only the characters the game can actually produce, all converted to woff2, and it is that
   one the page loads. The source is kept beside it and is never shipped: a subset cannot be widened
   back out, so the full faces have to stay somewhere.

   Run it after changing the embedded faces or after adding a character the game sets — and then run
   `npm run glyphs`, which reads the source stylesheet rather than this output for the same reason.  */
import {readFile,readdir,writeFile} from 'node:fs/promises';
import subsetFont from 'subset-font';

const root=new URL('../',import.meta.url);
const SOURCE='assets/fonts.source.css',OUT='assets/fonts.css';

// What the atlas can set, read off the atlas itself rather than kept as a list here that would drift
// out of step with it. Every character in the source counts — every string literal reaches the screen
// one way or another, and the code around them is ASCII, which the game sets anyway for scores and
// initials. Printable ASCII is added whole so a character that only ever appears at runtime is still
// cut in. The Ceiling's hieroglyphs never appear as literal characters in the source, only as
// `0x1313f`-style numeric codepoints that `String.fromCodePoint` turns into signs at runtime (see
// CEILING_G / CEILING_RG in src/ceiling.js), so those are picked up separately below by scanning for
// hex literals that land inside the Egyptian Hieroglyphs block (U+13000–U+1342F) rather than by a
// literal glyph a character-by-character scan could ever find. Add a caption with a character the
// faces have not been cut for, or a sign whose codepoint isn't written this way, and it will fall
// back until this is run again; that is the same staleness `npm run glyphs` already has.
const SCANNED=['src/index.html',...(await readdir(new URL('src/',root))).filter(n=>n.endsWith('.js')).map(n=>'src/'+n)];
const HIEROGLYPH_HEX=/\b0x1([0-9a-fA-F]{4})\b/g; // last 4 hex digits of a 0x1_ _ _ _ literal
const charset=await (async()=>{
  const seen=new Set();
  for(let c=0x20;c<=0x7e;c++)seen.add(String.fromCharCode(c));
  for(const file of SCANNED){
    const text=await readFile(new URL(file,root),'utf8');
    for(const ch of text)if(ch>' ')seen.add(ch);
    for(const m of text.matchAll(HIEROGLYPH_HEX)){
      const codepoint=0x10000+parseInt(m[1],16);
      if(codepoint>=0x13000&&codepoint<=0x1342f)seen.add(String.fromCodePoint(codepoint));
    }
  }
  return [...seen].sort().join('');
})();

const css=await readFile(new URL(SOURCE,root),'utf8');
// Every face in the source is one @font-face block carrying one inlined font as base64, whether it
// arrived as woff2 (the Latin faces, already converted when they were vendored) or TrueType (Noto's
// native format, decoded straight off the .ttf subset-font ships with harfbuzz can read just as well).
// Either way it comes back out the same: subset-font sniffs the input format on its own, so the same
// call cuts and converts in one step, and every face in fonts.css ends up the same inlined woff2 shape
// regardless of what it started as in the source.
const TOTAL_FACES=(css.match(/@font-face\{/g)??[]).length;
const FACE=/@font-face\{([^}]*?)src:url\(data:font\/(?:woff2|truetype);base64,([A-Za-z0-9+/=]+)\)\s*format\('(?:woff2|truetype)'\)\}/g;
let out=css,cut=0,kept=0,faces=0;
const jobs=[...css.matchAll(FACE)];
if(!jobs.length)throw new Error(SOURCE+' holds no inlined face.');
for(const [block,head,base64] of jobs){
  const before=Buffer.from(base64,'base64');
  const after=await subsetFont(before,charset,{targetFormat:'woff2'});
  const family=/font-family:'([^']+)'/.exec(head)?.[1]??'?';
  const style=/font-style:(\w+)/.exec(head)?.[1]??'normal';
  console.log(`  ${family} ${style}: ${(before.length/1024).toFixed(0)} KB -> ${(after.length/1024).toFixed(0)} KB`);
  cut+=before.length;kept+=after.length;faces++;
  out=out.replace(block,`@font-face{${head}src:url(data:font/woff2;base64,${after.toString('base64')}) format('woff2')}`);
}
// The bug this script used to have was silent: a face whose block didn't match the regex was skipped
// without a word, so it shipped whole. Never let that happen again without shouting about it.
if(faces!==TOTAL_FACES)throw new Error(`${SOURCE} holds ${TOTAL_FACES} @font-face block(s) but only ${faces} were cut — `+
  'a face was left unmatched and would ship uncut. Check its src: shape against the FACE pattern above.');
const note=`/* Generated by scripts/fonts.mjs from ${SOURCE} — do not edit by hand.\n`+
  `   The same faces, cut to the ${charset.length} characters the atlas can set. */\n`;
await writeFile(new URL(OUT,root),note+out.replace(/^\/\*[\s\S]*?\*\/\n/,''));
console.log(`${OUT} written: ${faces} faces, ${(cut/1024).toFixed(0)} KB of font data cut to ${(kept/1024).toFixed(0)} KB `+
  `(${(100-kept/cut*100).toFixed(0)}% smaller), at ${charset.length} characters.`);
