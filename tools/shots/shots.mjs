#!/usr/bin/env node
/* Orbit · tools/shots/shots.mjs
   The screenshot harness: pulls named scenarios of the game in headless Chromium on a virtual clock, at
   any viewport and on any plate, and writes the captures with a manifest and a contact sheet. A tool of
   the desk like scripts/probe.mjs, not a test: it asserts nothing and `npm test` never runs it. See
   tools/shots/README.md. */
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {run,BASE_OPTIONS} from './lib/runner.mjs';
import {allScenarios,findScenario} from './lib/scenarios.mjs';
import {VIEWPORTS} from './lib/viewports.mjs';
import {PROFILES} from './lib/fixtures.mjs';

const HELP=`Usage: npm run shots -- [scenario ...] [options]

  Scenarios are the files in tools/shots/scenarios/ (see --list), or a path to any .mjs scenario file.
  With none named, "smoke" runs.

Options (a comma list on viewport/plate/era crosses every value):
  --viewport=NAME|WxH[@S]  iphone-15-pro-max (default), iphone-se, laptop, 390x844@3, ... or "all"
  --scale=N                device pixel ratio, overriding the viewport's own
  --plate=ID               night, paper, cellarius, verdigris, foxed, azzurra, sepia, proof, modern
  --era=ID                 rock | ceiling | scroll | astrolabe | lens — enters that era's door after boot
  --profile=NAME           fresh | returning (default) | full — what localStorage holds at boot
  --storage=JSON           extra localStorage keys, e.g. '{"orbit.difficulty.v1":"hardcore"}'
  --seed=N                 the run's seed (default 7)
  --difficulty=ID          classic | relaxed | hardcore
  --daily                  play the daily plate instead of a seeded run
  --date=ISO               the page's wall clock (default 2026-09-24T12:00:00Z; sets the daily)
  --hand=NAME|SECONDS      the pilot: oracle (default) | good | fair | poor | a lateness in seconds
  --paint-all              paint every frame instead of fast-forwarding (slower, for animation checks)
  --dist                   shoot the built dist/index.html instead of src/ (run npm run build first)
  --out=DIR                output folder (default tools/shots/out)
  --clean                  empty the output folder first
  --headed                 show the browser
  --chromium=PATH          a Chromium binary to use (else Playwright's own; also CHROMIUM_PATH)
  --list                   list scenarios, viewports and profiles
  --help`;

const argv=process.argv.slice(2),named=[],cli={};
let out=fileURLToPath(new URL('./out/',import.meta.url)),clean=false,headed=false,chromium,listOnly=false;
for(const a of argv){
  if(!a.startsWith('--')){named.push(a);continue;}
  const [k,...v]=a.slice(2).split('='),val=v.length?v.join('='):true;
  switch(k){
    case 'help':case 'h':console.log(HELP);process.exit(0);
    case 'list':listOnly=true;break;
    case 'out':out=resolve(process.cwd(),val);break;
    case 'clean':clean=true;break;
    case 'headed':headed=true;break;
    case 'chromium':chromium=val;break;
    case 'paint-all':cli.paintAll=true;break;
    case 'storage':cli.storage=JSON.parse(val);break;
    case 'viewport':cli.viewport=val==='all'?Object.keys(VIEWPORTS):val.split(',');break;
    case 'plate':case 'era':cli[k]=val.split(',');break;
    default:
      if(!(k in BASE_OPTIONS)){console.error(`Unknown option --${k}\n\n${HELP}`);process.exit(2);}
      cli[k]=val;
  }
}
if(cli.daily)cli.daily=cli.daily!=='false';
const hand=cli.hand;if(hand!=null&&!isNaN(+hand))cli.hand=+hand;

if(listOnly){
  const all=await allScenarios();
  console.log('Scenarios:');for(const s of all)console.log(`  ${s.name.padEnd(14)} ${s.description}`);
  console.log('\nViewports:');for(const [id,v] of Object.entries(VIEWPORTS))console.log(`  ${id.padEnd(18)} ${v.width}×${v.height} @${v.scale}${v.note?'  — '+v.note:''}`);
  console.log('\nProfiles:  '+Object.keys(PROFILES).join(', '));
  process.exit(0);
}

const scenarios=await Promise.all((named.length?named:['smoke']).map(findScenario));
console.log(`Orbit shots → ${out}`);
const manifest=await run({scenarios,cli,out,clean,headed,chromium});
console.log(`\n${manifest.shots.length} capture(s). Contact sheet: ${resolve(out,'index.html')}`);
if(manifest.failures.length){
  console.log(`\n${manifest.failures.length} variant(s) reported page errors:`);
  for(const f of manifest.failures)console.log(`\n  ${f.label}\n    `+f.errors.join('\n    ').split('\n').slice(0,12).join('\n    '));
  process.exitCode=1;
}
