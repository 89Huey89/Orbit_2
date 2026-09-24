/* Orbit · tools/shots/lib/game.mjs
   The driver a scenario is handed. It holds one page of the game on the virtual clock page-init.mjs
   installs, and gives a scenario the handful of verbs a capture is actually made of — boot, start, fly,
   die, open a leaf, take a shot — so that a new capture is a short list of those rather than another
   harness. Everything reaches into the game through the globals its classic scripts share (world,
   handleInput, setPlate, enterEra, ...), the same way the console would. */
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';

// The pilot, installed into the page once and switched on and off from here. It is probe.mjs's hand:
// release on the first frame the game's own guide calls a clean perfect, or settle for any clean
// transfer once the body has been held for `patience` turns; `late` lets go that many seconds after
// deciding, which is how a worse hand than the oracle is flown. It releases through handleInput(), so
// the release is logged into the replay exactly as a tap would be.
function installPilot(){
  if(window.__shots.pilotInstalled)return;
  window.__shots.pilotInstalled=true;
  let pending=-1;
  window.__shots.hooks.push(()=>{
    const p=window.__shots.pilot;
    if(!p||typeof world==='undefined'||!world||world.state!=='playing'||!world.player.node){pending=-1;return;}
    if(pending<0){
      const aim=world.aim(),row=Math.floor(world.progress)+1,sweep=world.player.orbitSweep;
      if(aim&&!aim.steep&&!aim.dry&&aim.n.type!=='gold'&&aim.n.row>=row&&aim.n.row<=row+2&&(aim.perfect||sweep>p.patience*Math.PI*2)&&world.player.orbitTime>.12&&(world.player.node.type!=='sling'||world.charge()===1))
        pending=world.time+p.late;
    }
    if(pending>=0&&world.time>=pending){pending=-1;handleInput();}
  });
}

const HANDS={oracle:0,good:.008,fair:.025,poor:.06};

export class Game{
  constructor({page,variant,outDir,options,record}){
    this.page=page;this.variant=variant;this.outDir=outDir;this.options=options;this.record=record;this.count=0;
  }
  // Evaluates in the page. A string is evaluated as a script, which is the way to reach the game's
  // top-level `let`s (runSeed, catalogueOpen, ...) — those live in the global lexical scope, not on
  // window, so a function passed here can read them only by name, never through window.
  eval(fn,arg){return this.page.evaluate(fn,arg);}

  // Loads the page, lets the faces arrive, and puts the options' plate, era, seed and difficulty on
  // the press. The world is dealt again afterwards so the seed actually takes.
  async boot(){
    const o=this.options;
    await this.page.goto(o.url,{waitUntil:'load'});
    await this.page.evaluate(()=>document.fonts&&document.fonts.ready);
    await this.advance(.25);
    await this.page.evaluate(({plate,era,seed,difficulty,daily})=>{
      if(era)enterEra(era);
      if(plate&&!era)setPlate(plate);
      if(difficulty&&typeof setDifficulty==='function')setDifficulty(difficulty);
      if(daily&&typeof setDaily==='function')setDaily(true);
      if(seed!=null&&!daily){runSeed=(seed-1)>>>0;newWorld();render(0);}
    },{plate:o.plate,era:o.era,seed:o.seed,difficulty:o.difficulty,daily:o.daily});
    // An era asks for its faces on entry; give them the same chance the opening faces had.
    await this.page.evaluate(()=>document.fonts&&document.fonts.ready);
    await this.advance(.5);
    return this;
  }
  // Moves the page's clock on. paint:false skips painting all but the last `settle` seconds — the
  // simulation still runs every frame — which is what to use for anything longer than a few seconds.
  async advance(seconds,{fps=60,paint=true,settle=.5}={}){
    if(this.options.paintAll)paint=true;
    // One evaluate per chunk keeps a long advance from holding the protocol for minutes at a time.
    const chunk=paint?2:20;
    for(let left=seconds;left>1e-9;left-=chunk){
      const part=Math.min(chunk,left),last=left-part<=1e-9;
      await this.page.evaluate(([s,o])=>window.__shots.advance(s,o),[part,{fps,paint,settle:last?settle:0}]);
    }
  }
  // A tap on the sheet: starts a run from the frontispiece, releases in flight, deals again from the end.
  async tap(){await this.page.evaluate(()=>handleInput());await this.advance(1/60);}
  async start(){
    await this.page.evaluate(()=>{if(world.state==='ready')handleInput();});
    await this.advance(.1);
  }
  // Flies the run for `seconds` with the pilot's hand on it. hand is oracle|good|fair|poor or a
  // lateness in seconds; the run is stepped at 120 fps so the pilot sees every simulation step.
  async fly(seconds,{hand=this.options.hand,patience=1.5,paint=false,settle=.75}={}){
    const late=typeof hand==='number'?hand:HANDS[hand]??0;
    await this.page.evaluate(installPilot);
    await this.page.evaluate(p=>{window.__shots.pilot=p;},{late,patience});
    try{await this.advance(seconds,{fps:120,paint,settle});}
    finally{await this.page.evaluate(()=>{window.__shots.pilot=null;});}
  }
  // Flies until the run reaches `row` (or `maxSeconds` pass), then settles.
  async flyTo(row,{maxSeconds=240,...rest}={}){
    for(let t=0;t<maxSeconds;t+=5){
      const s=await this.state();
      if(s.state!=='playing'||s.row>=row)break;
      await this.fly(5,{...rest,settle:0});
    }
    await this.advance(.75);
  }
  // Lets the run go on with no hand on it at all.
  async idle(seconds,opts){await this.advance(seconds,opts);}
  // Ends the run where it stands with the named loss, and waits for the colophon to come up.
  async die(reason='THE DARK CAUGHT UP'){
    await this.page.evaluate(r=>{if(world.state==='playing')world.die(r);},reason);
    await this.advance(2.2);
  }
  async pause(){await this.page.evaluate(()=>pause());await this.advance(.3);}
  async resume(){await this.page.evaluate(()=>resume());await this.advance(.3);}
  // Presses a control by selector with a real pointer, so its own listeners run exactly as a finger's.
  async click(selector){await this.page.click(selector,{force:true});await this.advance(.4);}
  async openCatalogue(tab){
    await this.page.evaluate(t=>{openCatalogue();if(t){catalogueTab=t;renderCatalogue();}},tab||null);
    await this.advance(.6);
  }
  async closeCatalogue(){await this.page.evaluate(()=>closeCatalogue());await this.advance(.3);}
  async openEphemeris(){await this.page.evaluate(()=>openEphemeris());await this.advance(.6);}
  async openMore(){await this.page.evaluate(()=>{const m=document.getElementById('more-menu');if(m.hidden)document.getElementById('more-toggle').click();});await this.advance(.3);}
  async openReview(){await this.page.evaluate(()=>{const b=document.getElementById('review-open');if(b)b.click();});await this.advance(.8);}
  async setPlate(name){await this.page.evaluate(n=>{setPlate(n);render(0);},name);await this.advance(.2);}
  async enterEra(name){await this.page.evaluate(n=>enterEra(n),name);await this.page.evaluate(()=>document.fonts&&document.fonts.ready);await this.advance(.5);}
  async leaveEra(){await this.page.evaluate(()=>leaveEra());await this.advance(.5);}
  // A summary of the run in hand, for a scenario to branch on or a caption to carry.
  state(){
    return this.page.evaluate(()=>({state:world.state,row:Math.floor(world.progress||0),score:world.score,captures:world.captures,time:+world.time.toFixed(2),seed:world.seed,plate:plateName,reason:world.reason||null}));
  }
  // Takes one capture, named for what it shows. Files are numbered in the order a scenario takes
  // them, so a folder reads as the sequence it was flown in. `selector` crops to one element;
  // `fullPage` takes the whole scrollable document (the frontispiece leaf is taller than a phone).
  async shot(name,{selector,fullPage=false,note}={}){
    const n=String(++this.count).padStart(2,'0'),file=`${n}-${name.replace(/[^a-z0-9-]+/gi,'-').toLowerCase()}.png`;
    await mkdir(this.outDir,{recursive:true});
    const path=join(this.outDir,file);
    const opts={path,animations:'disabled',caret:'hide'};
    if(selector)await this.page.locator(selector).first().screenshot(opts);
    else await this.page.screenshot({...opts,fullPage});
    const state=await this.state().catch(()=>null);
    this.record({variant:this.variant,name,file:path,state,note:note||null});
    return path;
  }
}
