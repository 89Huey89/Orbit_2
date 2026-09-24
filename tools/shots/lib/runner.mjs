/* Orbit · tools/shots/lib/runner.mjs
   Crosses the scenarios asked for with every viewport, plate and era asked for, gives each crossing a
   fresh browser context of its own (so nothing carries between them but the scenario's own storage),
   and writes what it took into a folder with a manifest and a contact sheet beside it. */
import {mkdir,writeFile,rm} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {launchChromium} from './playwright.mjs';
import {startServer} from './server.mjs';
import {resolveViewport} from './viewports.mjs';
import {resolveProfile} from './fixtures.mjs';
import {pageInit} from './page-init.mjs';
import {Game} from './game.mjs';
import {contactSheet} from './contact-sheet.mjs';

// Everything a crossing can vary, with the value it takes when nothing names it. A scenario's own
// `defaults` sit between these and the command line, so a scenario can ask for (say) the full ledger
// while a hand can still override it.
export const BASE_OPTIONS={viewport:'iphone-15-pro-max',plate:null,era:null,profile:'returning',seed:7,difficulty:null,daily:false,
  date:'2026-09-24T12:00:00Z',hand:'oracle',scale:null,dist:false,paintAll:false,storage:null};
const AXES=['viewport','plate','era'];
const list=v=>v==null?[null]:Array.isArray(v)?v:String(v).split(',').map(x=>x.trim()).filter(Boolean);

function variantName(o){
  return [o.viewport.id,o.era||o.plate||null,o.profile!=='returning'?o.profile:null,o.daily?'daily':null].filter(Boolean).join('_');
}

export async function run({scenarios,cli={},out,clean=false,headed=false,chromium,log=console.log}){
  if(clean)await rm(out,{recursive:true,force:true});
  await mkdir(out,{recursive:true});
  const server=await startServer();
  const browser=await launchChromium({executablePath:chromium,headed});
  const shots=[],failures=[];
  try{
    for(const scenario of scenarios){
      const merged={...BASE_OPTIONS,...scenario.defaults,...Object.fromEntries(Object.entries(cli).filter(([,v])=>v!==undefined))};
      // The crossing: each axis may be a list, from the command line or from a scenario's defaults.
      let combos=[{}];
      for(const axis of AXES)combos=combos.flatMap(c=>list(merged[axis]).map(v=>({...c,[axis]:v})));
      for(const combo of combos){
        const o={...merged,...combo};
        o.viewport=resolveViewport(o.viewport||BASE_OPTIONS.viewport,o.scale?+o.scale:null);
        o.seed=o.seed==null?null:+o.seed;
        o.url=`${server.url}/${o.dist?'dist':'src'}/`;
        const variant=variantName(o),dir=join(out,scenario.name,variant);
        const label=`${scenario.name} · ${variant}`;
        const started=Date.now();
        const context=await browser.newContext({viewport:{width:o.viewport.width,height:o.viewport.height},deviceScaleFactor:o.viewport.scale,
          isMobile:o.viewport.mobile,hasTouch:o.viewport.touch,reducedMotion:'no-preference',colorScheme:'dark'});
        await context.addInitScript(pageInit,{seed:o.seed??1,epoch:Date.parse(o.date),storage:{...resolveProfile(o.profile),...(o.storage||{})}});
        const page=await context.newPage();
        const consoleErrors=[];
        page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
        page.on('pageerror',e=>consoleErrors.push(String(e&&e.stack||e)));
        const game=new Game({page,variant,outDir:dir,options:o,record:s=>shots.push({scenario:scenario.name,...s})});
        try{
          await game.boot();
          await scenario.run(game,o);
          const pageErrors=await page.evaluate(()=>window.__shots.errors.slice()).catch(()=>[]);
          const errors=[...new Set([...consoleErrors,...pageErrors])];
          if(errors.length)failures.push({label,errors});
          log(`  ${errors.length?'!':'✓'} ${label}  (${game.count} shot${game.count===1?'':'s'}, ${((Date.now()-started)/1000).toFixed(1)} s)${errors.length?'  — '+errors.length+' page error(s)':''}`);
        }catch(e){
          failures.push({label,errors:[String(e&&e.stack||e)]});
          log(`  ✗ ${label}  — ${String(e&&e.message||e).split('\n')[0]}`);
        }finally{await context.close();}
      }
    }
  }finally{await browser.close();await server.close();}
  const manifest={taken:new Date().toISOString(),out,shots:shots.map(s=>({...s,file:relative(out,s.file)})),failures};
  await writeFile(join(out,'manifest.json'),JSON.stringify(manifest,null,2));
  await writeFile(join(out,'index.html'),contactSheet(manifest));
  return manifest;
}
