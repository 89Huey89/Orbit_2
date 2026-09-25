/* Orbit · tools/shots/lib/playwright.mjs
   Playwright is a tool of the desk, never of the page, and the repository does not carry it as a
   dependency: the harness takes whichever copy it can find — the project's own node_modules if one was
   ever installed there, else the machine's global one — and says plainly what to do when there is none. */
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {join} from 'node:path';

export async function loadPlaywright(){
  try{return await import('playwright');}catch(_){}
  try{return await import('playwright-core');}catch(_){}
  let globalRoot='';
  try{globalRoot=execSync('npm root -g',{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch(_){}
  for(const name of ['playwright','playwright-core']){
    const dir=globalRoot&&join(globalRoot,name);
    if(dir&&existsSync(dir)){const req=createRequire(join(dir,'package.json'));return req(dir);}
  }
  throw new Error('Playwright was not found. Install it where the harness can see it — `npm i -g playwright` '+
    '(or `npm i --no-save playwright` in the repo) — and a Chromium for it, or pass --chromium=/path/to/chrome.');
}

// A sandbox that already ships a Chromium (PLAYWRIGHT_BROWSERS_PATH) needs nothing; anywhere else an
// explicit binary can be named, and the harness never downloads one of its own. The timing instrument
// (scripts/perf.mjs) launches through here too, with its own flags in place of the harness's.
export async function launchChromium({executablePath,headed=false,args=['--disable-gpu-vsync','--autoplay-policy=no-user-gesture-required']}={}){
  const {chromium}=await loadPlaywright();
  const opts={headless:!headed,args};
  const exe=executablePath||process.env.CHROMIUM_PATH;
  if(exe)opts.executablePath=exe;
  return chromium.launch(opts);
}
