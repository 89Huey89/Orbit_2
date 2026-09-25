/* Orbit · scripts/perf.mjs
   A timing instrument, not a test: flies a seeded run on each era in headless Chromium, on the reference
   sheet, and reports how long the page takes to paint a frame — the median, the slow tail, and every
   frame that ran well past the median, which is what a hand feels as a stutter. Like probe.mjs it
   asserts nothing, and `npm test` never runs it.

   The canvas is rasterised on the CPU (--disable-accelerated-2d-canvas), which is the nearest a desktop
   Chromium comes to Safari's own canvas: WebKit paints 2D canvas with CoreGraphics, so on an iPhone
   every full-sheet blend, every gradient fill and every sprite laid is paid in pixels, the same as here.
   The absolute numbers are a desktop core's, not a phone's; compare runs against each other. WebGL is
   switched off unless --webgl is given, since without a GPU it runs in a software rasteriser whose
   cost says nothing about a phone's.

     node scripts/perf.mjs                          every era, 8 s of flight after 3 s of warm-up
     node scripts/perf.mjs rock,ceiling --seconds=20
     node scripts/perf.mjs rock --breakdown         also: which painters the frame's time went to
     node scripts/perf.mjs --root=/path/to/checkout compare against another tree (e.g. a git worktree)

   Every frame is flushed (a one-pixel read) so its raster is counted in the frame that drew it. With
   --breakdown every global painter is wrapped and flushed as well, which inflates the total by that
   flushing; read those figures for their proportions, not their sum. */
import {pageInit} from '../tools/shots/lib/page-init.mjs';
import {resolveProfile} from '../tools/shots/lib/fixtures.mjs';
import {Game} from '../tools/shots/lib/game.mjs';
import {launchChromium} from '../tools/shots/lib/playwright.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {join,extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const args=process.argv.slice(2),flag=(name,fallback)=>{const a=args.find(x=>x.startsWith('--'+name+'='));return a?a.slice(name.length+3):args.includes('--'+name)?true:fallback;};
const eras=(args.find(a=>!a.startsWith('--'))||'atlas,rock,ceiling,scroll,astrolabe,lens,flyby').split(',');
const seconds=+flag('seconds',8),warm=+flag('warm',3),breakdown=!!flag('breakdown',false),webgl=!!flag('webgl',false);
const root=resolve(flag('root',fileURLToPath(new URL('..',import.meta.url))));

const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  try{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';
    const file=join(root,p);if(!file.startsWith(root))throw 0;res.writeHead(200,{'content-type':TYPES[extname(p)]||'application/octet-stream'});res.end(await readFile(file));}
  catch(_){res.writeHead(404);res.end();}
}).listen(0);
const browser=await launchChromium({args:['--disable-accelerated-2d-canvas',...(webgl?[]:['--disable-webgl'])]});
const round=v=>+v.toFixed(1);

try{
  for(const era of eras){
    const context=await browser.newContext({viewport:{width:430,height:932},deviceScaleFactor:3,isMobile:true,hasTouch:true});
    await context.addInitScript(pageInit,{seed:7,epoch:Date.parse('2026-09-24T12:00:00Z'),storage:resolveProfile('returning')});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const g=new Game({page,variant:era,outDir:'/tmp',options:{url:`http://localhost:${server.address().port}/src/`,era:era==='atlas'?null:era,seed:7,hand:'oracle'},record:()=>{}});
    await g.boot();await g.start();await g.fly(warm,{settle:0});
    // The page's own clock is the harness's virtual one (page-init.mjs); the prototype's now is the wall.
    await page.evaluate(breakdown=>{
      const now=()=>Performance.prototype.now.call(performance),flush=()=>ctx.getImageData(0,0,1,1);
      const stats=window.__perfStats={},real=window.render;window.__perfFrames=[];
      if(breakdown){
        const skip=/^(render|tick|sx|sy|clamp|lerp|seeded|makeCanvas|handFor|plateWords|onPaper|plainPlate|eraId|snapInterval|pacePresent|requestAnimationFrame)$/;
        const wrap=(name,f)=>function(...a){const flushing=!stats[name]||stats[name].calls<1500;if(flushing)flush();const t=now();
          try{return f.apply(this,a);}finally{if(flushing)flush();const d=now()-t,s=stats[name]||(stats[name]={time:0,calls:0,max:0});s.time+=d;s.calls++;if(d>s.max)s.max=d;}};
        for(const n of Object.getOwnPropertyNames(window)){let f;try{f=window[n];}catch(_){continue;}
          if(typeof f!=='function'||!/^[a-z]/.test(n)||skip.test(n)||/Hash$/.test(n)||(f.prototype&&Object.getOwnPropertyNames(f.prototype).length>1))continue;window[n]=wrap(n,f);}
        for(const id in HANDS)for(const k in HANDS[id])if(typeof HANDS[id][k]==='function')HANDS[id][k]=wrap(`hand.${id}.${k}`,HANDS[id][k]);
      }
      window.render=function(dt){flush();const t=now();real(dt);flush();window.__perfFrames.push(now()-t);};
    },breakdown);
    await g.advance(seconds,{fps:60,paint:true});
    const {frames,stats}=await page.evaluate(()=>({frames:window.__perfFrames,stats:window.__perfStats}));
    const sorted=[...frames].sort((a,b)=>a-b),q=p=>round(sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))]),median=sorted[sorted.length>>1];
    const spikes=frames.map((t,i)=>[i,round(t)]).filter(([,t])=>t>median*1.6);
    console.log(`${era.padEnd(10)} frames ${String(frames.length).padStart(4)}  median ${String(q(.5)).padStart(6)} ms  p90 ${String(q(.9)).padStart(6)}  p99 ${String(q(.99)).padStart(6)}  max ${String(round(sorted.at(-1))).padStart(6)}  spikes ${spikes.length}${spikes.length?' '+JSON.stringify(spikes.slice(0,8)):''}`);
    if(breakdown)for(const [k,v] of Object.entries(stats).sort((a,b)=>b[1].time-a[1].time).slice(0,30))
      console.log(`    ${String(round(v.time/frames.length)).padStart(7)} ms/frame  max ${String(round(v.max)).padStart(6)}  ${String(round(v.calls/frames.length)).padStart(6)} calls/frame  ${k}`);
    if(errors.length)console.log('    page errors:',errors);
    await context.close();
  }
}finally{await browser.close();server.close();}
