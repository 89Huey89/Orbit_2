/* Deterministic simulation and runtime checks. No browser or dependencies required. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {bundle} from './bundle.mjs';

const step=1/120;
const LEDGER_KEY='orbit.ledger.v1';
// The heavy blocks below (taskRoute60, taskDetourDeep, taskSling60, runtime) are each an independent,
// seeded simulation that never reads or writes another's state, so they are handed to worker threads
// and run in parallel instead of one after another. Every one of them is written exactly as it would
// be inline — reading these free variables rather than taking parameters — so a worker just needs to
// populate them (from its own vm sandbox, or from workerData) before calling the task it was asked for.
let OrbitWorld,segmentCircle,tangentPaths,orbitTangents,transferContact,nodeMotion,pointSegment,gravityRadius,hazardCore,hazardKind,bendVelocity,flightStep,CONSTELLATIONS,OBSERVATIONS,BASE_SPEED,MAX_SPEED,SWEEP_FULL,STAR_GAIN,GRAZE_MINIMUM,INK_PERFECT_GAIN,INK_CAPTURE_GAIN,POWERUP_LABELS,DARKNESS_RESCUE_DROP,DARKNESS_RESCUE_GRACE,script;

// Runs the extracted `// BEGIN SIMULATION`/`// END SIMULATION` slice of src/simulation.js in its own
// vm sandbox and returns the named globals verify.mjs needs off it — the same slice-and-pull the file
// has always done, just callable once per thread instead of once for the whole process.
function simSandbox(simulation){
  const sandbox={};vm.createContext(sandbox);
  vm.runInContext(simulation+'\nthis.api={OrbitWorld,segmentCircle,tangentPaths,orbitTangents,transferContact,nodeMotion,pointSegment,gravityRadius,hazardCore,hazardKind,bendVelocity,flightStep,CONSTELLATIONS,OBSERVATIONS,BASE_SPEED,MAX_SPEED,SWEEP_FULL,STAR_GAIN,GRAZE_MINIMUM,INK_PERFECT_GAIN,INK_CAPTURE_GAIN,POWERUP_LABELS,DARKNESS_RESCUE_DROP,DARKNESS_RESCUE_GRACE};',sandbox);
  return sandbox.api;
}
function useSimulationApi(api){
  ({OrbitWorld,segmentCircle,tangentPaths,orbitTangents,transferContact,nodeMotion,pointSegment,gravityRadius,hazardCore,hazardKind,bendVelocity,flightStep,CONSTELLATIONS,OBSERVATIONS,BASE_SPEED,MAX_SPEED,SWEEP_FULL,STAR_GAIN,GRAZE_MINIMUM,INK_PERFECT_GAIN,INK_CAPTURE_GAIN,POWERUP_LABELS,DARKNESS_RESCUE_DROP,DARKNESS_RESCUE_GRACE}=api);
}

// A tangent-seeking pilot uses the stars and follows the generated main route.
function taskRoute60(){
  let totalCaptures=0,perfects=0,maxNodes=0,maxHazards=0;const failures=[];
  for(let seed=1;seed<=60;seed++){
    const w=new OrbitWorld(seed,seed%3===0?1280:440,860);w.start();
    for(let i=0;i<120*220&&w.state==='playing'&&w.progress<48;i++){
      if(w.player.node){
        const aim=w.aim();
        if(aim&&!aim.steep&&aim.n.type!=='gold'&&aim.n.row===Math.floor(w.progress)+1&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))w.release();
      }
      w.update(step);
      if(i===120*12&&seed%4===0)w.resize(1280,780);
      if(i===120*16&&seed%4===0)w.resize(440,860);
      assert(Number.isFinite(w.player.x)&&Number.isFinite(w.player.y));
      maxNodes=Math.max(maxNodes,w.nodes.length);maxHazards=Math.max(maxHazards,w.hazards.length);
    }
    totalCaptures+=w.captures;perfects+=w.perfects;
    if(w.progress<48)failures.push({seed,progress:w.progress,reason:w.reason,elapsed:w.elapsed});
  }
  assert.equal(failures.length,0,'Every tested route must remain playable: '+JSON.stringify(failures));
  assert(maxNodes<20&&maxHazards<12,'Endless generation should stay bounded');
  return {totalCaptures,perfects,maxNodes,maxHazards};
}

function taskDetourDeep(){
  // Follow each optional three-star path, rejoin, and continue to row 48, then keep flying the same
  // course to row 60: forks no longer stop at the fourth region, and one seeded flight answers both,
  // since the pilot at row 48 has no notion of stopping there. Row 48 is a snapshot taken in passing,
  // not a second flight of the same seed under the same policy — the two used to be run separately.
  let chartCompletions=0,deepCharts=0,deepRows=0;
  const detourFailures=[],deepFailures=[],deepFigures=new Set();
  for(let seed=1;seed<=60;seed++){
    const rewards=[],w=new OrbitWorld(seed,seed%3===0?1280:440,860,(type,e)=>{if(type==='constellation')rewards.push(e);});w.start();
    let past48=false;
    for(let i=0;i<120*320&&w.state==='playing'&&w.progress<60;i++){
      if(w.player.node){
        const row=Math.floor(w.progress)+1;
        const target=w.nodes.find(n=>n.row===row&&n.routeRole==='star')||w.nodes.find(n=>n.row===row&&n.type!=='gold');
        const aim=w.aim();
        if(aim&&!aim.steep&&target&&aim.n.id===target.id&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))w.release();
      }
      w.update(step);
      if(i===120*12&&seed%4===0)w.resize(1280,780);
      if(i===120*16&&seed%4===0)w.resize(440,860);
      assert(w.nodes.length<20&&w.hazards.length<12&&w.nebulas.length<8,'Later generation must stay bounded');
      if(w.progress<48)assert(w.constellations.length<=Math.floor(w.row/8)+1,'Branch generation must stay bounded');
      if(!past48&&w.progress>=48){
        past48=true;
        // Every region now carries a fork, so a course through row 48 offers six charts.
        if(w.constellationsCompleted<4)detourFailures.push({seed,progress:w.progress,completed:w.constellationsCompleted,reason:w.reason});
        chartCompletions+=w.constellationsCompleted;
        assert.equal(rewards.length,w.constellationsCompleted,'Exactly one reward event per completed chart');
        assert(rewards.every(e=>e.gain===60&&e.chart.mask===7));
        assert(rewards.every(e=>e.chart.name===e.chart.name.toUpperCase()&&e.chart.catalogueIndex>=0));
        if(w.constellationsCompleted>=4){
          const score=w.score,captures=w.captures,done=w.constellations.filter(c=>c.completed);
          assert.equal(w.capture(done[done.length-1].stars[2]),false,'A visited star cannot be farmed');
          assert.equal(w.score,score);assert.equal(w.captures,captures);
        }
      }
    }
    if(!past48)detourFailures.push({seed,progress:w.progress,completed:w.constellationsCompleted,reason:w.reason});
    if(w.progress<60)deepFailures.push({seed,progress:w.progress,reason:w.reason,elapsed:w.elapsed});
    deepRows+=w.progress;
    for(const chart of w.constellations){
      assert(chart.catalogueIndex>=0&&chart.catalogueIndex<CONSTELLATIONS.length);
      assert.equal(chart.name,CONSTELLATIONS[chart.catalogueIndex].name);
      assert(chart.stars.length<=3&&chart.id===Math.floor(chart.entry.row/8),'A chart is identified by its region');
      if(chart.id>=4)deepFigures.add(chart.catalogueIndex);
    }
    deepCharts+=w.constellations.filter(c=>c.completed&&c.id>=4).length;
  }
  assert.equal(detourFailures.length,0,'Every optional path must be playable: '+JSON.stringify(detourFailures));
  assert.equal(deepFailures.length,0,'Forks past the fourth region must stay completable: '+JSON.stringify(deepFailures));
  assert(deepCharts>=60,'The later regions must actually be traced: '+deepCharts);
  assert(deepFigures.size>=8,'Later regions must draw a varying figure from the catalogue: '+deepFigures.size);
  return {chartCompletions,deepCharts,deepRows,deepFiguresSize:deepFigures.size};
}

function taskSling60(){
  let boostedTransfers=0;const slingFailures=[];
  for(let seed=1;seed<=60;seed++){
    const w=new OrbitWorld(seed,440,860);w.start();let expected=null,boosts=0;
    for(let i=0;i<120*240&&w.state==='playing'&&w.progress<48;i++){
      if(w.player.node){
        if(expected!==null){assert.equal(w.player.node.id,expected,'A charged guide must lead to the advertised landing');boosts++;expected=null;}
        const n=w.player.node,row=Math.floor(w.progress)+1;
        const target=n.shortcut?w.nodes.find(q=>q.id===n.shortcutId):w.nodes.find(q=>q.row===row&&q.routeRole==='star')||w.nodes.find(q=>q.row===row&&q.type!=='gold');
        const aim=w.aim();
        if(aim&&!aim.steep&&target&&aim.n.id===target.id&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(n.type!=='sling'||w.charge()===1)){
          if(n.shortcut)expected=target.id;
          w.release();
        }
      }
      w.update(step);
    }
    if(expected!==null&&w.player.node?.id===expected)boosts++;
    boostedTransfers+=boosts;
    if(w.progress<48||boosts!==6)slingFailures.push({seed,progress:w.progress,boosts,reason:w.reason});
  }
  assert.equal(slingFailures.length,0,'Charged shortcuts must remain playable: '+JSON.stringify(slingFailures));
  return {boostedTransfers};
}

// The daily plate's varyOpening lets a seed draw the second and third planets and all twelve regions'
// figures itself instead of reading the same fixed values every other chart opens on (see the
// constructor and catalogueFor() in src/simulation.js). It reuses the same formula every later planet
// already trusted, so this checks two things rather than re-proving the formula: that the opening
// actually varies from one seed to the next, and that a course drawn this way is exactly as playable
// through the same depth an ordinary seed already is.
function taskVariedOpening(){
  let totalCaptures=0;const failures=[];
  const opens=[],firstFigures=new Set();
  for(let seed=1;seed<=20;seed++){
    const w=new OrbitWorld(seed,440,860,()=>{},false,true);
    opens.push({x1:w.nodes.find(n=>n.row===1).x,x2:w.nodes.find(n=>n.row===2).x});
    firstFigures.add(w.catalogueFor(0));
    // No figure may repeat before all twelve have been drawn, exactly as an ordinary seed's later
    // regions already promise — only now the promise covers the first four regions too.
    const order=Array.from({length:12},(_,r)=>w.catalogueFor(r));
    assert.equal(new Set(order).size,12,'A varied opening must still draw all twelve figures before any repeats: seed '+seed);
    assert.equal(w.catalogueFor(12),order[0],'The thirteenth region must repeat the first exactly as an ordinary seed\'s does');
    w.start();
    for(let i=0;i<120*220&&w.state==='playing'&&w.progress<40;i++){
      if(w.player.node){
        const aim=w.aim();
        if(aim&&!aim.steep&&aim.n.type!=='gold'&&aim.n.row===Math.floor(w.progress)+1&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))w.release();
      }
      w.update(step);
      assert(Number.isFinite(w.player.x)&&Number.isFinite(w.player.y));
    }
    totalCaptures+=w.captures;
    if(w.progress<40)failures.push({seed,progress:w.progress,reason:w.reason});
  }
  assert.equal(failures.length,0,'A varied opening must stay exactly as playable as a fixed one: '+JSON.stringify(failures));
  assert(new Set(opens.map(o=>o.x1)).size>1&&new Set(opens.map(o=>o.x2)).size>1,'The second and third planets must actually move from one seed to the next');
  assert(firstFigures.size>1,'The first region\'s own figure must actually vary from one seed to the next');
  return {totalCaptures,variedOpenings:opens.length,variedFigures:firstFigures.size};
}

function runtime(width,height,storageBlocked=false,reduceMotion=false,seed={}){
  const events={},items=new Map(),raf=[],saved=new Map(Object.entries(seed));
  let lensCopies=0;
  const gradient={addColorStop(){}};
  // measureText is the one text metric the lettering routines ask for; the stand-in answers with a
  // plausible advance so textAlongArc exercises its measured path rather than its fallback.
  const drawing=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>gradient,createLinearGradient:()=>gradient,createPattern:()=>({}),measureText:t=>({width:Math.max(1,String(t).length*5.5)})},{
    get(target,key){return key in target?target[key]:(...args)=>{
      for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),'Non-finite canvas argument in '+String(key));
      if(key==='drawImage'&&args[0]?.id==='sky'&&args.length===9){
        const [source,x,y,w,h,,,dw,dh]=args;
        assert(x>=0&&y>=0&&w>0&&h>0&&dw>0&&dh>0);assert(x+w<=source.width+1e-6&&y+h<=source.height+1e-6,'Lens sampling must clip to the real canvas bounds');lensCopies++;
      }
    };},set(target,key,value){target[key]=value;return true;}
  });
  function element(id){
    if(items.has(id))return items.get(id);
    const classes=new Set(),e={id,style:{},textContent:'',innerHTML:'',classList:{add:(...x)=>x.forEach(a=>classes.add(a)),remove:(...x)=>x.forEach(a=>classes.delete(a)),toggle:(x,force)=>force?classes.add(x):classes.delete(x),contains:x=>classes.has(x)},setAttribute(){},getContext:()=>drawing,getBoundingClientRect:()=>({width,height}),closest:()=>null,removeAttribute(){},addEventListener:(type,fn)=>{events[id+':'+type]=fn;}};
    items.set(id,e);return e;
  }
  const context={console,Math,Date,Uint8ClampedArray,performance:{now:()=>0},requestAnimationFrame:fn=>raf.push(fn),document:{hidden:false,getElementById:element,createElement:()=>element('offscreen-'+items.size),addEventListener:(t,fn)=>{events['document:'+t]=fn;}},window:{devicePixelRatio:2,matchMedia:()=>({matches:reduceMotion}),addEventListener:(t,fn)=>{events['window:'+t]=fn;}},localStorage:{getItem:k=>{if(storageBlocked)throw Error('blocked');return saved.get(k)??null;},setItem:(k,v)=>{if(storageBlocked)throw Error('blocked');saved.set(k,v);}}};
  vm.createContext(context);vm.runInContext(script+'\nthis.test={get world(){return world},handleInput,newWorld,resize,render,showEnd,audio,drawCelestialScene,setPlate,get plateName(){return plateName},setDaily,recordBest,scoreLine,copyScore,reveal,revealNode,revealFlourish,atlasFlourishAt,SWEEP_FULL,penLettering,letteringTime,get dailyOn(){return dailyOn},get dailyDay(){return dailyDay},get dailySeed(){return dailySeed},get difficulty(){return difficulty},get ctx(){return ctx},get regionBlend(){return regionBlend},pageTurn,textAlongArc,figureFor,figAsterism,figFrame,buildFigureLayer,FIGURE_SHAPES,\
get ledger(){return ledger},get cosmetics(){return cosmetics},cosmetic,activeCosmetic,dailySetup,dailySetupFor,dailyPressPlate,setCosmetic,recordCosmetic,cosmeticItems,COSMETIC_KINDS,UNLOCKS,UNLOCK_BY_ID,unlockMet,unlockedIds,isUnlocked,ledgerStat,ledgerCommit,setInitials,engraverCredit,\
get initials(){return initials},plateIds:Object.keys(PLATES),plainPlate,buildFrameLayer,applyPlate,plateWords,plateOwns,handFor,eraId,laidPaper,laidSheetFor,paintBackdrop,enterEra,leaveEra,get PLATE_STYLES(){return PLATE_STYLES},get rings(){return rings},get inkPath(){return world.inkPath},sy,INK_PATH_CAP,openCatalogue,closeCatalogue,renderCatalogue,get catalogueOpen(){return catalogueOpen},\
drawSurveys,get surveys(){return world.surveys},SURVEY_CAP,orbitTangents,nebulaSprite,glossSprite,marginaliaGloss,marginaliaFloor,footerBand,setPlaying,\
openEphemeris,closeEphemeris,renderEphemeris,leafMonth,replayDaily,noteDailyPlay,dailyOpen,dailyDates,dailyLabel,roman,get ephemerisOpen(){return ephemerisOpen},get ephMonth(){return ephMonth},get dailyLog(){return dailyLog},get dailyReplay(){return dailyReplay},\
get inscriptions(){return inscriptions},inscribe,inscribeHeld,clearInscriptions,inscriptionBox,inscriptionRoom,INSCRIPTION_CAP,get scale(){return scale},drawRunningHead,drawImpressum,impressumRows,impressumScreenLine,impressumMetrics,\
replayRun,get replayLog(){return replayLog},openReview,closeReview,panReviewBy,renderReview,reviewBounds,get reviewing(){return reviewing},get reviewWorld(){return reviewWorld},get reviewCameraY(){return reviewCameraY}};',context);
  // The distance behind the chart ships bare and every style of it has to be earned, so a test that
  // wants one drawn has to put it on the press by name — `setCosmetic` would rightly refuse a locked
  // one. Each style is selected in turn, the body run under it, and whatever was chosen put back.
  const everyScene=body=>{
    const held=context.test.cosmetic('scenery');
    for(const style of ['none','chapterplates','rhumbs','counterproof']){context.test.recordCosmetic('scenery',style);body(style);}
    context.test.recordCosmetic('scenery',held);
  };
  // What the pen has written onto the chart, and the same words as they are spoken.
  const written=()=>context.test.inscriptions;
  const inscribed=()=>written().map(g=>g.text).join(' | ');
  // Drive real frame callbacks so sampled trail history is rendered in orbit,
  // in flight, after death, and across pause/restart, including reduced motion.
  let clock=1;const frames=count=>{for(let i=0;i<count;i++){const next=raf.shift();assert(next);next(clock+=1000/60);}};
  assert.equal(context.test.world.state,'ready');
  assert.equal(context.test.world.varyOpening,false,'An ordinary run keeps the fixed opening, not the daily\'s own');
  // ---- A plate saved on a previous visit: the frontispiece names it, or stays silent about nothing ----
  {
    // storageBlocked throws on the raw getItem the same way a real blocked store would; storage.get()
    // inside the app already catches that (see plates.js), so the fixture matches its own stand-in here.
    let stored=null;try{stored=context.localStorage.getItem('orbit.lastReplay.v1');}catch(_){}
    const btn=context.document.getElementById('review-last');
    if(stored){
      const rec=JSON.parse(stored);
      assert.equal(btn.hidden,false,'A saved plate must show REVIEW LAST PLATE on the frontispiece: '+width+'x'+height);
      assert.equal(context.document.getElementById('review-last-note').textContent,'ROW '+rec.row+' · '+rec.score,'Its note must read the saved row and score: '+width+'x'+height);
      events['review-last:click']();
      assert.equal(context.test.reviewing,true,'Clicking it must open a review of the saved plate: '+width+'x'+height);
      assert.equal(context.test.reviewWorld.seed,rec.seed,'It must rebuild the saved seed, not whatever run is live: '+width+'x'+height);
      context.test.closeReview();
      assert.equal(context.test.reviewing,false);
      assert.equal(context.document.getElementById('intro').classList.contains('hidden'),false,'Closing a review opened from the frontispiece must return to it, not to the colophon: '+width+'x'+height);
    }else assert.equal(btn.hidden,true,'With nothing saved yet, the frontispiece must not offer to review it: '+width+'x'+height);
  }
  // The impressum is engraved on the sheet, not attached to the viewport. The same stored world
  // coordinate must therefore move downward when the camera rises, with no second anchor created.
  {
    const w=context.test.world,markY=w.impressumY,screenBefore=context.test.sy(markY),cameraBefore=w.cameraY;
    assert(Number.isFinite(markY),'The impressum receives one finite world anchor');
    w.cameraY=cameraBefore-100;
    assert(context.test.sy(markY)>screenBefore,'A rising camera carries the engraved impressum downward');
    assert.equal(w.impressumY,markY,'Camera motion never re-anchors the impressum');
    w.cameraY=cameraBefore;
    const rows=context.test.impressumRows();
    assert.equal(rows.length,9,'The impressum reserves every line before achievements are earned');
    assert.equal(rows[0].text,'AUGUSTA VINDELICORUM');
    assert.equal(rows[1].text,'EX OFFICINA ORBIS TABULÆ','The house sets its own name with the digraph the rest of the cartouche uses');
    assert.equal(rows[2].text,'TAB. V · I  /  A1');
  }
  // ---------- The ledger and the catalogue ----------
  // A browser with no ledger — or with a ledger that is not JSON at all — opens on an empty one, with
  // every cosmetic at its classic default and nothing unlocked.
  const seededLedger=seed[LEDGER_KEY]&&seed[LEDGER_KEY].startsWith('{"captures');
  if(!seededLedger){
    const fresh=JSON.parse(JSON.stringify(context.test.ledger));
    assert.deepEqual({captures:fresh.captures,perfects:fresh.perfects,bestFlow:fresh.bestFlow,constellations:fresh.constellations,
      grazes:fresh.grazes,shieldsSpent:fresh.shieldsSpent,reflectorsSpent:fresh.reflectorsSpent,maxSpeedSlings:fresh.maxSpeedSlings,
      inkwellsFound:fresh.inkwellsFound,badAngles:fresh.badAngles,runs:fresh.runs,observations:fresh.observations,personalBests:fresh.personalBests,allFourInOneRun:fresh.allFourInOneRun},
      {captures:0,perfects:0,bestFlow:0,constellations:{},grazes:0,shieldsSpent:0,reflectorsSpent:0,maxSpeedSlings:0,inkwellsFound:0,badAngles:0,runs:{},observations:{},personalBests:{},allFourInOneRun:false},
      'A fresh or unreadable ledger opens empty');
    // The classic look, and — the one category that defaults to nothing rather than to something — a
    // sheet that prints no distance behind the chart at all until the catalogue earns one.
    assert.deepEqual(JSON.parse(JSON.stringify(context.test.cosmetics)),{plate:'night',mark:'quill',trail:'irongall',capture:'ripple',frame:'windheads',figures:'hevelius',sphere:'graticule',scenery:'none'},'Cosmetics default to the classic look, and to a bare sheet behind it');
    assert.equal(context.test.isUnlocked('cellarius'),false);
    assert.equal(context.test.setCosmetic('mark','saturn'),false,'A locked cosmetic can never be selected');
    assert.equal(context.test.cosmetic('mark'),'quill','A refused selection leaves the default in place');
  }
  // Every condition in the catalogue is evaluated against the ledger exactly as written.
  {
    const empty=context.test.ledger&&JSON.parse(JSON.stringify(context.test.ledger));
    const at=fields=>Object.assign(JSON.parse(JSON.stringify(empty)),{captures:0,perfects:0,bestRow:0,maxSpeedSlings:0,runs:{},
      constellations:{},personalBests:{},deepestHardcoreChapter:0,allFourInOneRun:false,inkwellsFound:0,badAngles:0},fields);
    const cases=[
      ['cellarius',{captures:999},false],['cellarius',{captures:1000},true],
      ['verdigris',{deepestHardcoreChapter:3},false],['verdigris',{deepestHardcoreChapter:4},true],
      ['foxed',{runs:{classic:60,hardcore:39}},false],['foxed',{runs:{classic:60,hardcore:40}},true],
      ['proof',{allFourInOneRun:false},false],['proof',{allFourInOneRun:true},true],
      ['azzurra',{grazes:24},false],['azzurra',{grazes:25},true],
      ['sepia',{constellations:{'THE LYRE':6,'THE SAIL':5}},false],['sepia',{constellations:{'THE LYRE':6,'THE SAIL':6}},true],
      ['comet',{runs:{classic:24}},false],['comet',{runs:{classic:20,relaxed:5}},true],
      ['telescope',{perfects:99},false],['telescope',{perfects:100},true],
      ['moth',{perfects:499},false],['moth',{perfects:500},true],
      ['saturn',{perfects:1499},false],['saturn',{perfects:1500},true],
      ['crossstaff',{constellations:{'THE LYRE':13,'THE SAIL':11}},false],['crossstaff',{constellations:{'THE LYRE':13,'THE SAIL':12}},true],
      ['burin',{captures:2499},false],['burin',{captures:2500},true],
      ['moon',{bestRow:49},false],['moon',{bestRow:50},true],
      ['sanguine',{maxSpeedSlings:9},false],['sanguine',{maxSpeedSlings:10},true],
      ['silverpoint',{maxSpeedSlings:49},false],['silverpoint',{maxSpeedSlings:50},true],
      ['goldleaf',{maxSpeedSlings:199},false],['goldleaf',{maxSpeedSlings:200},true],
      ['quicksilver',{maxSpeedSlings:499},false],['quicksilver',{maxSpeedSlings:500},true],
      ['umber',{badAngles:9},false],['umber',{badAngles:10},true],
      ['woad',{badAngles:24},false],['woad',{badAngles:25},true],
      ['vermilion',{badAngles:74},false],['vermilion',{badAngles:75},true],
      ['malachite',{badAngles:199},false],['malachite',{badAngles:200},true],
      ['ultramarine',{badAngles:499},false],['ultramarine',{badAngles:500},true],
      ['bistre',{inkwellsFound:2},false],['bistre',{inkwellsFound:3},true],
      ['orpiment',{inkwellsFound:9},false],['orpiment',{inkwellsFound:10},true],
      ['phosphor',{grazes:49},false],['phosphor',{grazes:50},true],
      ['rose',{captures:249},false],['rose',{captures:250},true],
      ['seal',{captures:999},false],['seal',{captures:1000},true],
      ['manicule',{captures:4999},false],['manicule',{captures:5000},true],
      ['strapwork',{bestRow:19},false],['strapwork',{bestRow:20},true],
      ['acanthus',{bestRow:39},false],['acanthus',{bestRow:40},true],
      ['seamonsters',{bestRow:59},false],['seamonsters',{bestRow:60},true],
      ['bayer',{constellations:{'THE LYRE':9,'THE SAIL':9}},false],['bayer',{constellations:{'THE LYRE':10}},true],
      ['bode',{constellations:{'THE LYRE':24}},false],['bode',{constellations:{'THE LYRE':25}},true],
      ['rete',{captures:499},false],['rete',{captures:500},true],
      ['orbs',{bestRow:29},false],['orbs',{bestRow:30},true],
      ['volvelle',{constellations:{'THE LYRE':4}},false],['volvelle',{constellations:{'THE LYRE':5}},true],
      ['chapterplates',{deepestChapter:1},false],['chapterplates',{deepestChapter:2},true],
      ['rhumbs',{runs:{classic:14}},false],['rhumbs',{runs:{classic:9,relaxed:6}},true],
      ['counterproof',{deepestChapter:3},false],['counterproof',{deepestChapter:4},true],
      ['delineavit',{runs:{classic:49}},false],['delineavit',{runs:{classic:30,relaxed:20}},true],
      ['exlibris',{personalBests:{relaxed:10,classic:10}},false],['exlibris',{personalBests:{relaxed:10,classic:10,hardcore:10}},true],
      ['newton',{perfects:500,grazes:24},false],['newton',{perfects:499,grazes:25},false],['newton',{perfects:500,grazes:25},true],
      ['perfecti',{observations:{}},false],['perfecti',{observations:{perfectThree:1}},true],
      ['quinque',{observations:{}},false],['quinque',{observations:{skipFive:1}},true],
      ['summa',{observations:{}},false],['summa',{observations:{maxSpeed:1}},true],
      ['periculum',{observations:{}},false],['periculum',{observations:{graze:1}},true],
      ['pura',{observations:{}},false],['pura',{observations:{pureChart:1}},true],
      ['altitudo',{observations:{}},false],['altitudo',{observations:{fortyRows:1}},true],
      ['vigilia',{observations:{}},false],['vigilia',{observations:{threeMinutes:1}},true],
      ['rectus',{observations:{}},false],['rectus',{observations:{rightAngle:1}},true],
      ['evasio',{shieldsSpent:12,reflectorsSpent:12},false],['evasio',{shieldsSpent:12,reflectorsSpent:13},true],
      ['myrias',{captures:9999},false],['myrias',{captures:10000},true]
    ];
    for(const [id,fields,expected] of cases){
      assert.equal(context.test.unlockMet(context.test.UNLOCK_BY_ID[id],at(fields)),expected,'Unlock condition for '+id+' with '+JSON.stringify(fields));
    }
    assert.equal(context.test.UNLOCKS.length,52,'The catalogue holds every unlockable');
    // Nothing is ever taken away: a ledger that meets everything unlocks everything.
    const everything=at({captures:10000,perfects:2500,bestRow:60,maxSpeedSlings:500,runs:{classic:100},grazes:50,
      constellations:{'THE LYRE':25},personalBests:{relaxed:1,classic:1,hardcore:1},deepestChapter:4,deepestHardcoreChapter:4,allFourInOneRun:true,inkwellsFound:10,badAngles:500,
      shieldsSpent:15,reflectorsSpent:15,
      observations:{perfectThree:1,skipFive:1,maxSpeed:1,graze:1,pureChart:1,fortyRows:1,threeMinutes:1,rightAngle:1}});
    assert.equal(context.test.unlockedIds(everything).size,context.test.UNLOCKS.length);
  }
  // The living pen: the first row of a fresh chart is begun the moment the sheet is drawn and every mark
  // of it is finished within its second; reduced motion prints the whole chart at once instead.
  {
    const pen=context.test.reveal,fresh=context.test.world,firstRow=fresh.nodes.filter(n=>n.row<=1);
    assert(firstRow.length>0,'A fresh chart opens with a first row');
    if(reduceMotion){
      for(const n of firstRow)assert.equal(pen.progress(n,1),1,'Reduced motion prints every mark at once');
      assert.equal(pen.peek('frame'),1);assert.equal(pen.peek(fresh.nodes[0]),1);
    }else{
      context.test.render(0);
      for(const n of firstRow){
        const started=pen.peek(n);
        assert(started>=0&&started<1,'The pen starts the first row before the traveller can reach it');
      }
      for(let i=0;i<90;i++)fresh.update(1/60);
      context.test.render(0);
      for(const n of firstRow)assert.equal(pen.peek(n),1,'Every first-row mark is finished within a second');
      assert.equal(pen.peek('frame'),1,'The frame finishes drawing itself at the start of a run');
      const probes=['probe0','probe1','probe2','probe3','probe4'],busy=pen.report().drawing;
      assert(busy<=3,'The pen never has more than three marks in hand');
      for(const key of probes)pen.progress(key,1);
      assert.equal(pen.report().drawing,3,'Five more marks fill the pen\'s hand and no further');
      // Rendering claim: a fresh, un-orbited, non-difficultyChoice body has never been paid for, and
      // revealNode must draw it as nothing more than a phenomenon: no documentation, no keyline.
      const unmet=context.test.revealNode({row:-1});
      assert.equal(unmet.d,0,'A body neither captured nor released reads no documentation at all');
      assert.equal(unmet.keyline,0,'Its keyline has not begun either, since keyline only spans over d');
      // L4: the pen's hand above is already full of three marks. A fourth body that was already paid
      // for in an earlier orbit must still be drawn whole — REVEAL_CAP only staggers marks entering
      // the view, and must never blank an observation the player has already earned.
      const paid=context.test.revealNode({row:-2,documented:1});
      assert.equal(paid.t,0,'A brand new mark still waits at nothing while the pen\'s hand is full');
      assert.equal(paid.keyline,1,'An already-documented body keeps its keyline whatever the pen\'s hand holds');
      assert.equal(paid.wash,1,'and its wash too, unblanked by a fourth mark entering the view');
      assert.equal(paid.survey,1,'and its survey last of all, the same body paid for in full');
      assert.equal(probes.filter(key=>pen.peek(key)>=0).length,3-busy,'The marks past the third wait at nothing drawn');
      assert.equal(context.test.penLettering('THE QUIET',100,100,30,'text',.3,'center'),true,'The chapter name is written letter by letter');
    }
    assert(context.test.letteringTime('THE QUIET')>0);
    assert.equal(context.test.penLettering('THE QUIET',100,100,30,'text',99,'center'),false,'Finished lettering hands back to the printed text');
  }
  // The completion flourish fires exactly once on the <1→1 crossing of an orbit's own documented
  // fraction, and never for a body let go before it gets there. A counting spy on revealFlourish.fire
  // stands in for an era's own mark without changing what triggers it. The printed atlas now answers
  // this hook itself (see the block just below) rather than through the bare fallback, so the generic
  // mechanism is exercised here under a plate that still falls through to it — the Ceiling names no
  // flourish of its own either, and never reaches this code from its own independent render() at all,
  // but a direct call to revealNode, as this test makes, still runs the one shared crossing-detector.
  {
    context.test.setPlate('ceiling');
    const fresh=context.test.world,p=fresh.player,origNode=p.node,origSweep=p.orbitSweep;
    let fires=0;context.test.revealFlourish.fire=()=>{fires++;};
    const probeA={row:-3};
    p.node=probeA;p.orbitSweep=0;
    context.test.revealNode(probeA);assert.equal(fires,0,'Arming the watch on a fresh orbit must not itself fire');
    p.orbitSweep=context.test.SWEEP_FULL*.4;context.test.revealNode(probeA);assert.equal(fires,0,'A body still short of a full observation must not fire');
    p.orbitSweep=context.test.SWEEP_FULL*.99;context.test.revealNode(probeA);assert.equal(fires,0,'One hundredth of a turn short of completion is still short of it');
    p.orbitSweep=context.test.SWEEP_FULL;context.test.revealNode(probeA);assert.equal(fires,1,'The <1→1 crossing must fire exactly once');
    p.orbitSweep=context.test.SWEEP_FULL*1.6;context.test.revealNode(probeA);assert.equal(fires,1,'A completed observation must not fire a second time on a later frame');
    // A second body, watched from scratch, that is let go before it ever reaches completion must never
    // have fired at all — however many times a released, unfinished body is still drawn afterwards.
    const probeB={row:-4};
    p.node=probeB;p.orbitSweep=0;
    context.test.revealNode(probeB);assert.equal(fires,1,'Coming to a new body arms its own watch without firing on the switch');
    p.orbitSweep=context.test.SWEEP_FULL*.5;context.test.revealNode(probeB);assert.equal(fires,1,'Still short of completion, still no fire');
    probeB.documented=.5;p.node=null;
    for(let i=0;i<3;i++)context.test.revealNode(probeB);
    assert.equal(fires,1,'A body released before completion never fires the flourish, however often it is drawn afterwards');
    context.test.revealFlourish.fire=()=>{};
    p.node=origNode;p.orbitSweep=origSweep;
    context.test.setPlate('night');
  }
  // On the atlas's own two plates the same crossing is answered by atlasFlourish, called directly rather
  // than through a registered painter — night and paper name nothing at the flourish hook, exactly as
  // they name nothing at any other, and are still owed the mark this whole mechanism exists for.
  {
    assert.equal(context.test.handFor('flourish'),undefined,'The printed atlas must be drawn by the atlas hand alone: flourish');
    const fresh=context.test.world,p=fresh.player,origNode=p.node,origSweep=p.orbitSweep;
    const probe={row:-5,seed:424242};
    p.node=probe;p.orbitSweep=0;
    context.test.revealNode(probe);assert(!context.test.atlasFlourishAt.has(probe.seed),'Arming the watch must not itself fire on the atlas either');
    p.orbitSweep=context.test.SWEEP_FULL*.99;context.test.revealNode(probe);assert(!context.test.atlasFlourishAt.has(probe.seed),'Still short of a full observation, still unmarked');
    p.orbitSweep=context.test.SWEEP_FULL;context.test.revealNode(probe);
    assert(context.test.atlasFlourishAt.has(probe.seed),'The printed atlas marks the same crossing in its own hand');
    p.node=origNode;p.orbitSweep=origSweep;
  }
  // The daily plate replaces the run seed with the UTC date's, forces Classic pressure,
  // and is not remembered: switching it off restores an ordinary run.
  const beforeDaily=context.test.world;
  const plateBeforeDaily=context.test.plateName,cosmeticsBeforeDaily=JSON.parse(JSON.stringify(context.test.cosmetics));
  const plateStorageBeforeDaily=saved.get('orbit.plate.v1'),cosmeticsStorageBeforeDaily=saved.get('orbit.cosmetics.v1');
  events['daily:click']();
  assert.equal(context.test.dailyOn,true);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(context.test.dailyDay),'The daily course is keyed to a UTC date');
  assert.equal(context.test.world.seed,context.test.dailySeed,'The daily course comes from the date, not the clock');
  assert.equal(context.test.world.darknessMult,1,'The daily plate is always played at Classic pressure');
  assert(element('daily-date').textContent.includes('Tabula diei \u00b7 '+context.test.dailyDay));
  assert.equal(new OrbitWorld(context.test.dailySeed,440,860,()=>{},false,true).catalogueOrder.join(),context.test.world.catalogueOrder.join(),'Everyone plays the same daily chart');
  assert.equal(context.test.world.varyOpening,true,'The daily plate draws its own opening rather than the fixed one');
  // A saved daily replay carries its varyOpening flag, so reviewing it later rebuilds the same varied
  // opening rather than quietly falling back to the fixed one; a log saved before the flag existed —
  // undefined rather than true or false — must fall back to the fixed opening exactly as OrbitWorld's
  // own default does, so an old save from before this shipped still replays as it always did.
  {
    const dailyReplayed=context.test.replayRun({seed:context.test.dailySeed,width:440,height:860,offerDifficulty:false,varyOpening:true,startedAt:0,releases:[],resizes:[]});
    assert.equal(dailyReplayed.catalogueOrder.join(),context.test.world.catalogueOrder.join(),'A replayed daily plate rebuilds the same varied opening');
    const predatesFlag=context.test.replayRun({seed:context.test.dailySeed,width:440,height:860,offerDifficulty:false,startedAt:0,releases:[],resizes:[]});
    assert.equal(predatesFlag.varyOpening,false,'A replay log saved before this flag existed falls back to the fixed opening');
  }
  // ---------- The daily's own showcase: a setup drawn from the same date hash ----------
  {
    // Array.from (called on this module's own Array, not the sandbox's) rather than .map, and JSON
    // round-tripping below for the setup itself: the sandboxed script runs in its own vm realm, so a
    // structural compare against one of its arrays or objects fails deepStrictEqual on prototype
    // identity alone even when every element matches, exactly as context.test.cosmetics already has
    // to be unwrapped this way above.
    const kinds=Array.from(context.test.COSMETIC_KINDS,g=>g.kind);
    const setup=JSON.parse(JSON.stringify(context.test.dailySetupFor(context.test.dailyDay)));
    assert.deepEqual(Object.keys(setup).sort(),kinds.slice().sort(),'A daily setup names every cosmetic category');
    for(const kind of kinds)assert(context.test.cosmeticItems(kind).some(item=>item.id===setup[kind]),'The daily draws an item the catalogue actually lists, for '+kind);
    assert.deepEqual(JSON.parse(JSON.stringify(context.test.dailySetupFor(context.test.dailyDay))),setup,'The same day always draws the same setup');
    assert.equal(context.test.plateName,setup.plate,'The daily puts its own drawn plate on the press');
    for(const kind of kinds)assert.equal(context.test.activeCosmetic(kind),setup[kind],'The daily overrides '+kind+' while it is current');
    assert.deepEqual(JSON.parse(JSON.stringify(context.test.cosmetics)),cosmeticsBeforeDaily,'The showcase never touches the ledger\'s own cosmetic choices');
    assert.equal(saved.get('orbit.plate.v1'),plateStorageBeforeDaily,'The showcase never writes the stored plate');
    assert.equal(saved.get('orbit.cosmetics.v1'),cosmeticsStorageBeforeDaily,'The showcase never writes the stored cosmetics');
    // Short of a ledger that has already earned the whole catalogue, some day in a modest search draws
    // a cosmetic nothing has unlocked yet \u2014 the whole point of a showcase \u2014 without that day unlocking it.
    if(context.test.unlockedIds().size<context.test.UNLOCKS.length){
      let shownLocked=null;
      for(let y=1970;y<2070&&!shownLocked;y++){
        const trial=context.test.dailySetupFor(y+'-01-01');
        for(const kind of kinds)if(!context.test.isUnlocked(trial[kind])){shownLocked={kind,id:trial[kind]};break;}
      }
      assert(shownLocked,'Some day in a century of them shows a cosmetic nothing has unlocked yet');
      assert.equal(context.test.isUnlocked(shownLocked.id),false,'Showing it never earns it');
    }
  }
  events['daily:click']();
  assert.equal(context.test.dailyOn,false);assert.equal(element('daily-date').textContent,'');
  assert(context.test.world!==beforeDaily&&context.test.world.state==='ready','Leaving the daily plate deals a fresh ordinary course');
  assert.equal(context.test.world.varyOpening,false,'Leaving the daily plate returns to the fixed opening');
  assert.equal(context.test.plateName,plateBeforeDaily,'Leaving the daily restores whichever plate was actually on the press');
  assert.deepEqual(JSON.parse(JSON.stringify(context.test.cosmetics)),cosmeticsBeforeDaily,'Leaving the daily leaves the ledger\'s own cosmetic choices exactly as they were');
  // ---------- The ephemeris: the almanac of daily plates, and drawing a past one again ----------
  // One rule holds the whole leaf up: a day is written into the log only by a run begun while it was
  // the current day, and it is the log alone that opens a plate to be drawn again.
  {
    const today=new Date().toISOString().slice(0,10),drawnDay='2019-03-07',seededLog=!!seed['orbit.dailyLog.v1'];
    // A log seeded into storage is read as written where it is a day with a record on it and ignored
    // everywhere else, and the one record that predates the log opens the day it was set on.
    if(seededLog){
      assert.equal(context.test.dailyDates().join(),'2018-05-04,2019-11-30','Only well-formed past days are read from the log');
      assert.equal(context.test.dailyLog['2018-05-04'].best,420);
      assert.equal(context.test.dailyLog['2018-05-04'].plays,3);
      assert.equal(context.test.dailyLog['2019-11-30'].best,88,'The record that predates the log opens its own day');
      assert(saved.get('orbit.dailyLog.v1').includes('2019-11-30'),'The folded-in record is written to the log once');
    }
    assert.equal(context.test.roman(2026),'MMXXVI','The almanac dates its months in Roman numerals');
    assert.equal(context.test.roman(1620),'MDCXX');
    assert.equal(context.test.dailyOpen(drawnDay),false,'A day that was never drawn is closed');
    assert.equal(context.test.replayDaily(drawnDay),false,'A plate that was never drawn can never be dealt');
    assert.equal(context.test.dailyOn,false,'A refused entry leaves the ordinary chart exactly as it was');
    context.test.openEphemeris();
    assert.equal(context.test.ephemerisOpen,true);
    {
      const leaf=element('ephemeris-body').innerHTML;
      assert(leaf.includes('data-date="'+today+'"'),'Today\'s plate is always open in the almanac: '+leaf);
      assert(leaf.includes('eph-hodie'),'Today is captioned as today until it has been drawn');
      assert(leaf.includes('eph-blank'),'A day that was never drawn is printed as a blank rule');
      assert(element('eph-title').textContent.includes(context.test.roman(Number(today.slice(0,4)))),element('eph-title').textContent);
      assert(element('eph-note').textContent.includes('only on the day it was drawn'),element('eph-note').textContent);
    }
    const held=context.test.world.state;
    context.test.handleInput();
    assert.equal(context.test.world.state,held,'The ephemeris holds the gameplay input while it is open');
    events['window:keydown']({code:'Escape',preventDefault(){},repeat:false,target:{closest:()=>null}});
    assert.equal(context.test.ephemerisOpen,false,'Escape closes the ephemeris');
    // A daily run begun today writes that day into the log, which is what opens it ever after.
    context.test.setDaily(true);
    assert.equal(context.test.dailyReplay,false);
    assert.equal(context.test.impressumRows()[8].text,'TABULA DIEI · '+today,'The impressum records the exact current daily date');
    context.test.setPlaying();
    assert(context.test.dailyLog[today].plays>=1,'A daily run begun today enters that day in the log');
    assert.equal(context.test.dailyOpen(today),true);
    if(!storageBlocked)assert(JSON.parse(saved.get('orbit.dailyLog.v1'))[today],'The log of drawn days is kept in storage');
    // A plate drawn on its own day is dealt again from that day's own seed, and says so.
    context.test.dailyLog[drawnDay]={best:410,plays:2};
    assert.equal(context.test.replayDaily(drawnDay),true);
    assert.equal(context.test.dailyDay,drawnDay);assert.equal(context.test.dailyReplay,true);
    assert.equal(context.test.world.seed,context.test.dailySeed,'A repeated plate is dealt from its own date');
    assert.equal(new OrbitWorld(context.test.dailySeed,440,860,()=>{},false,true).catalogueOrder.join(),context.test.world.catalogueOrder.join(),'A repeat deals exactly the plate of that day');
    assert.equal(context.test.world.darknessMult,1,'A repeated daily plate keeps its Classic pressure');
    assert(element('daily-date').textContent.includes('Tabula diei \u00b7 '+drawnDay)&&element('daily-date').textContent.includes('iterum'),element('daily-date').textContent);
    assert(context.test.scoreLine().includes('Tabula diei '+drawnDay+' (iterum)'),context.test.scoreLine());
    // Repeating an old plate never opens a new day, and its score is kept under the day it repeats.
    const openDays=context.test.dailyDates().join();
    context.test.setPlaying();
    assert.equal(context.test.dailyDates().join(),openDays,'Repeating an old plate never opens another day');
    assert.equal(context.test.dailyLog[drawnDay].plays,2,'A repeat is not counted as having drawn that day');
    const currentRecord=saved.get('orbit.daily.v1');
    context.test.recordBest(999);
    assert.equal(context.test.dailyLog[drawnDay].best,999,'A repeat improves the record of the day it repeats');
    if(!storageBlocked)assert.equal(saved.get('orbit.daily.v1'),currentRecord,'A repeat never touches the current day\'s record');
    context.test.openEphemeris();
    {
      const leaf=element('ephemeris-body').innerHTML;
      assert(leaf.includes('data-date="'+drawnDay+'"')&&leaf.includes('>999<'),'The almanac opens on the month of the plate in hand and prints its record: '+leaf);
      assert(leaf.includes('aria-pressed="true"'),'The plate now in hand is pricked in the almanac');
      assert(!leaf.includes('data-date="2019-03-08"'),'A day that was never drawn can never be chosen');
    }
    // The almanac leafs between the earliest plate on record and the current month, and no further.
    assert.equal(context.test.ephMonth.y+'-'+context.test.ephMonth.m,'2019-2','The leaf opens on the month of the plate in hand');
    if(!seededLog){
      assert.equal(element('eph-prev').disabled,true,'There is nothing to leaf back to before the earliest plate');
      context.test.leafMonth(-1);
      assert.equal(context.test.ephMonth.y+'-'+context.test.ephMonth.m,'2019-2','The almanac never leafs past its earliest plate');
    }
    context.test.leafMonth(1);
    assert.equal(context.test.ephMonth.y+'-'+context.test.ephMonth.m,'2019-3','April follows March');
    context.test.closeEphemeris();
    assert.equal(context.test.ephemerisOpen,false);
    delete context.test.dailyLog[drawnDay];
    context.test.setDaily(false);
    assert.equal(context.test.dailyOn,false);assert.equal(context.test.dailyReplay,false);
    context.test.newWorld();
  }
  everyScene(()=>{for(let chapter=0;chapter<4;chapter++)context.test.drawCelestialScene(chapter,1);});
  // Both plates must boot, draw every chapter, and switch mid-run without touching the simulation.
  context.test.setPlate('paper');assert.equal(context.test.plateName,'paper');
  everyScene(()=>{for(let chapter=0;chapter<4;chapter++)context.test.drawCelestialScene(chapter,1);});
  // Every entry in the catalogue is engraved: none of them falls through to the generic asterism,
  // and each figure bakes a layer with finite arguments part-traced, completed and expired.
  for(const entry of CONSTELLATIONS){
    const index=CONSTELLATIONS.indexOf(entry),figure=context.test.figureFor({name:entry.name,catalogueIndex:index});
    assert.equal(typeof figure,'function','Every catalogue figure needs an engraving: '+entry.name);
    assert.notEqual(figure,context.test.figAsterism,'No catalogue entry may fall back to the asterism: '+entry.name);
    for(const [count,completed,expired] of [[0,false,false],[2,false,false],[3,true,false],[1,false,true]]){
      const stars=entry.shape.map((offset,j)=>({x:offset-120,y:-j*200+[24,42,18][j],r:33,visited:j<count}));
      const chart={id:5,catalogueIndex:index,name:entry.name,stars,completed,expired};
      const layer=context.test.buildFigureLayer(chart,context.test.figFrame(chart),count,1);
      assert(layer&&layer.canvas,'A catalogue figure must bake into a layer: '+entry.name);
    }
  }
  assert.equal(context.test.figureFor({name:'THE UNCUT PLATE'}),context.test.figAsterism,'An unknown name still falls back');
  // Lettering on a curve places every glyph at a finite point, and reports the arc it used.
  for(const options of [{size:9,spacing:1.2,align:'center'},{size:7,spacing:0,inward:true},{size:11,align:'end',direction:-1}]){
    const arc=context.test.textAlongArc(context.test.ctx,'ORBITA \u00b7 TABULA',60,80,54,-Math.PI/2,options);
    assert(Number.isFinite(arc.start)&&Number.isFinite(arc.end)&&arc.span>0,'textAlongArc must report a finite arc');
  }
  assert.equal(context.test.textAlongArc(context.test.ctx,'',10,10,40,0,{}).span,0,'Empty lettering occupies no arc');
  assert.equal(context.test.textAlongArc(context.test.ctx,'ORBITA',10,10,0,0,{}).span,0,'A degenerate rim is skipped, not drawn');
  context.test.handleInput();assert.equal(context.test.world.state,'playing');
  // Every plate in the press — the two base plates and the four derived ones — boots, prints all four
  // chapter plates and builds a frame, and the proof plate is the only one that omits its lettering.
  for(const id of context.test.plateIds){
    context.test.setPlate(id);
    assert.equal(context.test.plateName,id);
    assert.equal(context.test.plainPlate(),id==='proof','Only the proof plate is pulled before letters');
    everyScene(()=>{for(let chapter=0;chapter<4;chapter++)context.test.drawCelestialScene(chapter,1);});
    assert(context.test.buildFrameLayer(),'Every plate must build a frame: '+id);
    context.test.render(1/60);
  }
  context.test.setPlate('night');
  // ---- What stands behind the chart: the construction the captures build, and the distance ----
  // The construction is ten separate drawings rather than one, so every style is put through every
  // stage it passes: a figure that only sets out correctly once it is finished is not one the atlas
  // earns. The canvas stand-in refuses a non-finite argument, so a radius or an angle that goes bad at
  // any one stage of any one style fails here rather than on the sheet.
  {
    const heldSphere=context.test.cosmetic('sphere'),heldCaptures=context.test.world.captures;
    for(const plate of ['night','paper']){
      context.test.setPlate(plate);
      for(const style of ['graticule','rete','orbs','volvelle','none']){
        context.test.recordCosmetic('sphere',style);
        for(const captures of [0,1,3,6,9,10,25]){context.test.world.captures=captures;context.test.render(1/60);}
      }
    }
    context.test.setPlate('night');context.test.recordCosmetic('sphere',heldSphere);context.test.world.captures=heldCaptures;
  }
  // And every distance, through whole frames rather than through the plate alone, so that the chapter
  // print, the wash down the play channel and both dust plates are drawn together or skipped together —
  // including across a page turn, which is the one thing that still happens on a bare sheet.
  {
    const heldProgress=context.test.world.progress;
    everyScene(()=>{
      for(const progress of [0,7.4,8.2,9,17,26]){context.test.world.progress=progress;context.test.render(1/60);}
    });
    context.test.world.progress=heldProgress;
  }
  // ---- A plate says what it is, and nothing asks it which century it is ----
  {
    // The two plates the atlas is actually printed on answer no to every question an era asks of
    // itself, so nothing an era declares can reach them.
    for(const id of ['night','paper']){
      context.test.setPlate(id);
      assert.equal(context.test.eraId(),0,id+' is the atlas\'s own sheet, not a century cut beside it');
      assert.equal(context.test.plateOwns('score'),false,id+' keeps the atlas record');
      assert.equal(context.test.plateOwns('mode'),false,id+' is not entered as a mode');
      for(const painter of ['atmosphere','node','hazard','player','dark','plateFrame','laid','figure','surveys','hudLeaf','runningHead','chapterReveal','flourish','frame'])
        assert.equal(context.test.handFor(painter),undefined,id+' must be drawn by the atlas hand alone: '+painter);
    }
    // Every plate speaks a complete vocabulary. The atlas's words stand under whatever an era renames,
    // so no call site carries a fallback — which is only true while no era leaves a hole in the table.
    context.test.setPlate('night');
    const atlas=context.test.plateWords(),keys=Object.keys(atlas).sort().join(',');
    for(const id of context.test.plateIds){
      context.test.setPlate(id);
      assert.equal(Object.keys(context.test.plateWords()).sort().join(','),keys,'Every plate must speak a complete vocabulary: '+id);
    }
    // The Ceiling is a shipped sheet and entsandboxing it may not change one word of it. These are the
    // strings it said before the plate was asked what it does instead of which era it is; they pin the
    // conversion, and a plate that declares its own render must still name the painter that draws it.
    context.test.setPlate('ceiling');
    const wall=context.test.plateWords();
    assert.equal(context.test.eraId(),2,'The Ceiling is era II on the roster docs/archive/eras/JOURNEY.md fixes');
    assert.equal(context.test.plateOwns('score'),true,'The Ceiling keeps its own record');
    assert.equal(context.test.plateOwns('mode'),true,'The Ceiling is entered and left as a mode');
    assert.equal(typeof context.test.handFor('frame'),'function','A plate that draws a whole frame in its own hand must name that painter');
    assert.equal(wall.chart,'DECAN COURSE');
    assert.equal(wall.chartNoun,'decan course');
    assert.equal(wall.losses['THE DARK CAUGHT UP'],'THE WALL BROKE AWAY BENEATH');
    assert.equal(wall.losses['THE NIB RAN DRY'],'THE REED RAN DRY');
    assert.equal(wall.observations.perfectThree,'THREE CLEAN TRANSFERS');
    assert.equal(wall.observations.rightAngle,'A RIGHT ANGLE ON THE CANON GRID');
    assert.equal(wall.pressures.relaxed,'QUIET NIGHT');
    assert.equal(wall.pressures.hardcore,'HARD NIGHT');
    assert.equal(wall.hud.pace,'COURSE \u00d7');
    assert.equal(wall.hud.shield,'PROTECTION HELD');
    assert.equal(wall.hud.dawn,'DAYBREAK HELD','The charge against the dark is named in the era it is carried in');
    assert.equal(wall.chrome.brand,'WNWT');
    assert.equal(wall.chrome.bestLabel,'Preview');
    assert.equal(wall.chrome.pauseTitle,'The barque rests.');
    // The halt is lettered wholly in the era's own terms: no press stands idle on a painted wall, and
    // nothing on it is taken up again but the course. Only the frontispiece the atlas returns to is
    // shared, and this era renames that too.
    assert.equal(wall.chrome.pauseEyebrow,'THE HOURS STAND STILL');
    assert.equal(wall.chrome.pauseResume,'TAKE UP THE COURSE');
    assert.equal(wall.chrome.pauseLeave,'LEAVE THE VOYAGE');
    assert(!/press|pen|frontispiece/i.test([wall.chrome.pauseEyebrow,wall.chrome.pauseTitle,wall.chrome.pauseNote,wall.chrome.pauseResume,wall.chrome.pauseLeave].join(' ')),'No word of the atlas\'s own workshop is left standing on the pause leaf of another century');
    assert.equal(wall.unrecorded,'ERA PREVIEW \u00b7 NOT RECORDED');
    assert.equal(wall.chapters[0],'FIRST WATCH');
    assert.equal(wall.chapters[3],'BEFORE DAWN');
    assert(/decan course/i.test(wall.chartSaid)&&/wall holds/i.test(wall.chartSaid),'The Ceiling keeps its own completion sentence');
    assert(/barque/i.test(wall.opening),'The Ceiling keeps its own opening line');
    // Every feat the simulation can record must have a word on this sheet. The conversion reads one
    // table with the atlas's Latin behind it, which is only ever right while the era's table is
    // complete; a ninth observation added to simulation.js would otherwise be captioned in Latin on a
    // wall that has no Latin, and nothing would say so.
    for(const key of Object.keys(OBSERVATIONS))assert(wall.observations[key],'The Ceiling names every observation the simulation can record: '+key);
    for(const key of ['first','dark','faded','vortex','angle','speed'])assert(wall.tips[key],'The Ceiling names a tip for every ending: '+key);
    for(const key of ['choose','dry','sling','release','bend'])assert(wall.held[key],'The Ceiling names every standing instruction: '+key);
    for(const sound of ['capture','death','medal','scratch'])assert(context.test.handFor(sound),'The Ceiling keeps its own voice: '+sound);
    context.test.setPlate('night');
  }
  {
    // A century with a door on the frontispiece names it on its own row, and the label carries its
    // place on the roster docs/archive/eras/JOURNEY.md §1.9 fixes. A plate with an ordinal and no door would
    // be a century nothing can reach; a door on a plate with no ordinal would be a door to the atlas.
    const styles=context.test.PLATE_STYLES,doors={};
    for(const id in styles){
      const style=styles[id];
      if(style.door){
        assert(style.era,'A door must open onto a century: '+id);
        assert(style.door.button&&style.door.label,'A door names its button and its label: '+id);
        assert(!doors[style.door.button],'Two centuries must not share one door: '+style.door.button);
        doors[style.door.button]=id;
      }
      if(style.era)assert(style.door,'A century the frontispiece cannot reach is a century nobody plays: '+id);
    }
    assert.equal(styles.rock.door.label,'ERA I \u00b7 THE ROCK');
    // The Rock is drawn by its own hand and inherits the atlas's for what it does not name; the two it
    // names silently are the two the era forbids outright, and a run through it must still reach every
    // painter that carries planning information.
    context.test.setPlate('rock');
    for(const painter of ['atmosphere','node','hazard','player','dark','plateFrame','laid','figure','surveys','hudLeaf','runningHead','chapterReveal','flourish'])
      assert.equal(typeof context.test.handFor(painter),'function','The Rock names its own: '+painter);
    assert.equal(context.test.handFor('frame'),undefined,'The Rock is drawn into the atlas\'s frame, not instead of it');
    assert.equal(context.test.plateWords().chapterSaid.includes('Chamber'),true,'The Rock calls a chapter a chamber');
    context.test.setPlate('night');
    assert.equal(styles.ceiling.door.label,'ERA II \u00b7 THE CEILING');
    // A door is not opened out from under a run in progress: changing the plate deals a new chart, and
    // a player mid-flight would lose the one they were flying. Everything else about the doors is
    // flown at the end of this layout, where dealing a fresh chart disturbs nothing after it.
    context.test.setPlate('paper');
    assert.equal(context.test.world.state,'playing','fixture expects a run in progress here');
    context.test.enterEra('rock');
    assert.equal(context.test.plateName,'paper','A century may not be entered out from under a run');
    context.test.setPlate('night');
  }
  {
    // Two eras never share a cached entry, and both hit. applyPlate() points `ink` at a plate without
    // clearing the cached artwork, which is exactly what a frame carrying two eras does — so this is the
    // shape that must not rebuild. The sheet and the ground are the expensive two.
    const held=context.test.plateName;
    context.test.applyPlate('rock');
    const rockTile=context.test.laidPaper(),rockSheet=context.test.laidSheetFor(),rockGround=context.test.paintBackdrop();
    context.test.applyPlate('night');
    const nightTile=context.test.laidPaper(),nightSheet=context.test.laidSheetFor(),nightGround=context.test.paintBackdrop();
    assert.notEqual(rockTile,nightTile,'Two eras must not share one laid tile');
    assert.notEqual(rockSheet,nightSheet,'Two eras must not share one laid sheet');
    assert.notEqual(rockGround,nightGround,'Two eras must not share one painted ground');
    context.test.applyPlate('rock');
    assert.equal(context.test.laidPaper(),rockTile,'A second era in one frame must hit the tile it already built');
    assert.equal(context.test.laidSheetFor(),rockSheet,'A second era in one frame must hit the sheet it already built');
    assert.equal(context.test.paintBackdrop(),rockGround,'A second era in one frame must hit the ground it already built');
    context.test.applyPlate('night');
    assert.equal(context.test.laidPaper(),nightTile,'And the first era must still hit its own');
    assert.equal(context.test.paintBackdrop(),nightGround);
    context.test.applyPlate(held);
  }
  // Every cosmetic selection draws: the frame ornaments and figure styles into the cached layers, the
  // observer marks, inks and capture marks through a live frame with a capture ripple in hand.
  {
    const chosen={};for(const group of context.test.COSMETIC_KINDS)chosen[group.kind]=context.test.cosmetic(group.kind);
    for(const group of context.test.COSMETIC_KINDS){
      if(group.kind==='plate')continue;
      for(const item of context.test.cosmeticItems(group.kind)){
        const open=context.test.isUnlocked(item.id);
        assert.equal(context.test.setCosmetic(group.kind,item.id),open,'Only an earned cosmetic can be chosen: '+item.id);
        if(!open)continue;
        assert.equal(context.test.cosmetic(group.kind),item.id);
        const target=context.test.world.nodes[0];
        context.test.rings.push({kind:'capture',node:target,x:target.x,y:target.y,start:target.r+2,distance:18,angle:.4,perfect:true,age:0,life:.85,alpha:.86,seed:9181});
        context.test.render(1/60);
        assert(context.test.buildFrameLayer(),'Every cosmetic must render a frame: '+item.id);
      }
      context.test.setCosmetic(group.kind,chosen[group.kind]);
    }
  }
  frames(75);const midRun=context.test.world.time;context.test.setPlate('night');assert.equal(context.test.world.time,midRun);
  frames(75);
  // The opening now offers three reachable targets (the difficulty choice), so a release at
  // whatever angle the orbit has drifted to can no longer be trusted to miss all of them; aim
  // it dead sideways instead, straight out of the chart's width, to force the intended miss.
  context.test.world.player.angle=-Math.PI/2;context.test.world.player.dir=1;
  context.test.handleInput();assert.equal(context.test.world.player.node,null);
  frames(900);
  assert.equal(context.test.world.state,'dead');context.test.render(.1);
  // The dried route the run has flown stays on the sheet. It is bounded twice: everything that has
  // passed below the sheet is dropped as the camera climbs, and a hard cap holds the rest.
  {
    const path=context.test.inkPath;
    assert(path.length>1,'A flight leaves its dried route behind it');
    assert(path.length<=context.test.INK_PATH_CAP,'The dried route is capped: '+path.length);
    assert(path.every(point=>context.test.sy(point.y)<=height+240),'The dried route is pruned to the sheet');
  }
  context.test.handleInput();assert.equal(context.test.world.state,'playing');assert.equal(context.test.world.score,0);assert(context.test.world.player.node);
  assert(context.test.inkPath.length<=1,'A new run is dealt on a clean sheet');
  events['window:blur']();assert.equal(context.test.world.state,'paused');const pausedTime=context.test.world.time;frames(10);assert.equal(context.test.world.time,pausedTime);context.test.handleInput();assert.equal(context.test.world.state,'playing');
  context.test.render(step);
  // Complete a constellation through the full runtime, including presentation,
  // score persistence, pause during the reward, the end screen, and a new run.
  const run=context.test.world;let captures=run.captures;
  for(let i=0;i<120*70&&run.state==='playing'&&run.constellationsCompleted===0;i++){
    if(run.player.node){
      const row=Math.floor(run.progress)+1,target=run.nodes.find(n=>n.row===row&&n.routeRole==='star')||run.nodes.find(n=>n.row===row&&n.type!=='gold'),aim=run.aim();
      if(aim&&target&&aim.n.id===target.id&&aim.perfect&&run.player.orbitTime>.12)run.release();
    }
    run.update(step);
    if(i%60===0||captures!==run.captures){context.test.render(step);captures=run.captures;}
  }
  assert.equal(run.constellationsCompleted,1,'The complete runtime must support the optional route');
  assert(element('announcement').textContent.includes('Darkness retreats'));
  if(!storageBlocked)assert(Number(saved.get('orbit.best.v1'))>=run.score,'The constellation bonus must be saved in the best score');
  const grace=run.darknessGrace;events['window:blur']();run.update(1);context.test.render(.1);assert.equal(run.darknessGrace,grace);
  context.test.handleInput();
  for(let i=0;i<120*30&&run.state==='playing'&&run.progress<7;i++){
    const aim=run.aim();if(aim&&aim.perfect&&aim.n.row===7&&run.player.orbitTime>.12)run.release();run.update(step);
  }
  assert.equal(run.player.node?.type,'sling',JSON.stringify({seed:run.seed,progress:run.progress,reason:run.reason}));context.test.render(step);
  // The standing instruction is written on the chart, beside the very orbit it is about, and it is held
  // there rather than counted down while the condition lasts.
  {
    const held=written().find(g=>g.key==='instruction'&&g.held);
    assert(held&&held.text.includes('One lap'),'The slingshot instruction is written onto the chart: '+JSON.stringify(written().map(g=>g.text)));
    assert.equal(held.node,run.player.node,'It is set beside the orbit being held');
    assert.equal(held.held,true);
    for(let i=0;i<40;i++)context.test.render(step);
    assert(written().includes(held),'A standing instruction stays while its condition holds');
  }
  while(run.state==='playing'&&run.charge()<1){run.update(step);context.test.render(step);}
  assert.equal(run.charge(),1);assert(/FULL CHARGE|MAX SPEED/.test(inscribed()),inscribed());
  assert(/FULL CHARGE|MAX SPEED/.test(element('inscribed').textContent),'Every inscription is spoken as it is written');
  events['window:blur']();run.update(1);assert.equal(run.charge(),1);context.test.handleInput();
  const shortcut=run.player.node.shortcutId;
  for(let i=0;i<120*10&&run.state==='playing'&&run.player.node;i++){
    const aim=run.aim();if(aim&&aim.n.id===shortcut&&aim.perfect)run.release();else run.update(step);
  }
  assert.equal(run.player.node,null);assert(inscribed().includes('SLINGSHOT'),inscribed());
  for(let i=0;i<120*4&&run.state==='playing'&&!run.player.node;i++){run.update(step);context.test.render(step);}
  assert.equal(run.player.node?.id,shortcut);assert.equal(run.charge(),0);
  // Observations are announced as they happen and listed on the colophon.
  assert.equal(run.observe('threeMinutes'),true);assert.equal(run.observe('threeMinutes'),false,'An observation is awarded once per run');
  context.test.render(step);
  assert(inscribed().includes('OBSERVATION \u00b7 VIGILIA'),inscribed());
  const beforeRun={captures:context.test.ledger.captures,perfects:context.test.ledger.perfects,
    charts:context.test.ledgerStat('constellations'),runs:context.test.ledgerStat('runs'),seconds:context.test.ledger.playSeconds};
  run.die('RUN COMPLETE');run.player.deadTime=.8;context.test.render(.1);
  // The colophon writes the ledger: the lifetime figures rise by exactly what this run did, the run is
  // counted under the pressure it was played at, and the document itself is written unless storage is blocked.
  {
    const led=context.test.ledger;
    assert.equal(led.captures,beforeRun.captures+run.captures,'The ledger counts the run\'s captures');
    assert.equal(led.perfects,beforeRun.perfects+run.perfects,'The ledger counts the run\'s perfect transfers');
    assert.equal(context.test.ledgerStat('constellations'),beforeRun.charts+run.constellationsCompleted,'The ledger counts the constellations traced');
    assert.equal(context.test.ledgerStat('runs'),beforeRun.runs+1,'A finished run is counted once');
    assert(led.bestFlow>=run.maxCombo&&led.bestRow>=Math.floor(run.progress),'The ledger keeps the best flow and the highest row');
    assert(led.playSeconds>beforeRun.seconds,'The ledger keeps the time spent in the chart');
    assert(led.personalBests[context.test.difficulty]>=run.score,'The ledger keeps a personal best for the pressure played');
    assert(led.observations.threeMinutes>=1,'The ledger counts the observations made');
    assert(led.deepestChapter>=Math.min(4,Math.floor(run.progress/8)+1),'The ledger keeps the deepest chapter reached');
    if(!storageBlocked){
      const document=JSON.parse(saved.get(LEDGER_KEY));
      assert.equal(document.captures,led.captures,'The ledger is written to storage at the end of a run');
      assert.equal(document.bestRow,led.bestRow);
    }
  }
  // The catalogue: a ruled leaf over the plate that lists the ledger and every cosmetic, opens and
  // closes on its own, holds the gameplay input while it is open, and takes three letters of initials.
  {
    context.test.openCatalogue();
    assert.equal(context.test.catalogueOpen,true);
    const page=element('catalogue-body').innerHTML;
    assert(page.includes('Orbits captured')&&page.includes('Time in the chart'),'The catalogue prints the ledger\'s figures');
    for(const group of context.test.COSMETIC_KINDS)assert(page.includes(group.title),'The catalogue lists '+group.title);
    assert(page.includes('Named feats')&&page.includes('Insignia'),'The catalogue lists the named feats as medals');
    assert(page.includes('Night plate')&&page.includes('Tabula nocturna'),'Stock cosmetics are always listed and selectable');
    assert(page.includes('Celestial graticule')&&page.includes('Nothing drawn'),'The construction can always be chosen, or left undrawn');
    assert(page.includes('Bare sheet')&&page.includes('Charta nuda'),'A bare sheet is always on offer as the distance');
    if(!seededLedger){
      assert(page.includes('cat-row cat-card locked')&&page.includes('Capture 1,000 orbits in all'),'A locked entry is a blank rule with its condition');
      assert(!page.includes('id="initials"'),'The initials field waits for the engraver\'s credit');
    }else{
      assert(page.includes('id="initials"'),'The engraver\'s credit brings out the initials field');
      assert.equal(context.test.setInitials('j.h.f.g'),'JHF','Initials are three letters at most');
      assert(context.test.engraverCredit().startsWith('J.H.F. delineavit'),context.test.engraverCredit());
    }
    const heldState=context.test.world.state;
    context.test.handleInput();
    assert.equal(context.test.world.state,heldState,'The catalogue holds the gameplay input while it is open');
    events['window:keydown']({code:'Escape',preventDefault(){},repeat:false,target:{closest:()=>null}});
    assert.equal(context.test.catalogueOpen,false,'Escape closes the catalogue');
  }
  assert.equal(element('end-constellations').textContent,'1 constellation traced');
  assert.equal(element('end-row').textContent,Math.floor(run.progress),'The colophon reports the row reached');
  assert(element('end-observations').textContent.includes('VIGILIA'),'The colophon lists the run observations');
  if(!storageBlocked)assert(Number(saved.get('orbit.bestRow.v1'))>=Math.floor(run.progress),'The ascent record is kept');
  const line=context.test.copyScore();
  assert(line.startsWith('Orbit \u00b7 ')&&line.includes(' points \u00b7 row ')&&line.includes('constellation'),line);
  assert.equal(element('copy-score').textContent,'COPY SCORE','With no clipboard the button never claims to have copied');
  events['copy-score:click']();
  context.test.setDaily(true);context.test.showEnd();
  assert(element('end-daily').textContent.includes('Tabula diei \u00b7 '+context.test.dailyDay));
  assert(context.test.copyScore().includes('Tabula diei '+context.test.dailyDay));
  context.test.recordBest(1234);
  if(!storageBlocked){
    const plate=JSON.parse(saved.get('orbit.daily.v1'));
    assert.deepEqual(plate,{date:context.test.dailyDay,best:1234},'The daily plate keeps its own record for that date');
    assert(Number(saved.get('orbit.best.v1'))<1234,'A daily score never touches the ordinary best');
  }
  context.test.setDaily(false);
  context.test.handleInput();assert.equal(context.test.world.constellationsCompleted,0);assert.equal(context.test.world.darknessGrace,0);
  assert(context.test.world.constellations.every(c=>c.mask===0&&!c.completed&&!c.expired),'Restart must clear chart progress');
  assert.equal(context.test.inscriptions.length,0,'A new run is dealt on a sheet with nothing written on it');
  context.test.render(step);
  assert(/Tap when|sets the pressure/.test(inscribed()),'Restart writes the opening instruction and nothing of the last run: '+inscribed());
  const fresh=context.test.world;
  fresh.hazards=[{x:-fresh.width/2+4,y:fresh.cameraY+4,r:28,seed:23,phase:.3,near:false},{x:fresh.width/2-4,y:fresh.cameraY+fresh.height-4,r:30,seed:24,phase:.6,near:false}];
  const beforeCopies=lensCopies;context.test.render(step);assert.equal(lensCopies-beforeCopies,2,'Partly clipped vortices must still swirl the background');
  // Every kind of hazard mark is put on the sheet and drawn, on both plates and with reduced motion
  // either way, so the stand-in's finite-argument check covers the wind-head's own engraving — its
  // sprite, its live breath, and the turn that points it — and not only the two older marks.
  {
    const wind=(x,y,dir)=>({x,y,r:26,kind:'wind',dir,seed:77,phase:.4,near:false});
    fresh.hazards=[wind(-40,fresh.cameraY+120,0),wind(30,fresh.cameraY+220,Math.PI*.75),
      {x:0,y:fresh.cameraY+320,r:24,kind:'flare',seed:78,phase:.1,near:false},
      {x:-60,y:fresh.cameraY+420,r:26,kind:'vortex',seed:79,phase:.9,near:false}];
    for(const plate of ['night','paper']){
      context.test.setPlate(plate);
      context.test.render(step);context.test.render(step);
    }
    // A gust with no bearing recorded must still draw: an absent direction reads as blowing along
    // the plate rather than as a non-finite rotation.
    fresh.hazards=[{x:0,y:fresh.cameraY+120,r:26,kind:'wind',seed:80,phase:0,near:false}];
    context.test.render(step);
    fresh.hazards=[];context.test.setPlate('night');
  }
  events['window:blur']();const frozenTime=fresh.time;fresh.update(2);context.test.render(step);assert.equal(fresh.time,frozenTime);
  // The page turn: a sheet leaves the frame entirely, freezes with the run, and lands exactly on the
  // new chapter rather than crawling toward it.
  assert.equal(context.test.pageTurn(0),0);assert.equal(context.test.pageTurn(1),1);
  assert(context.test.pageTurn(.5)>0&&context.test.pageTurn(.5)<1);
  fresh.state='playing';fresh.progress=8;
  let midTurn=0,turnFrames=0;
  for(let i=0;i<900&&context.test.regionBlend<1;i++){
    context.test.render(1/60);turnFrames++;
    if(context.test.regionBlend>.25&&context.test.regionBlend<.75)midTurn=context.test.regionBlend;
    if(i===120){const held=context.test.regionBlend;fresh.state='paused';context.test.render(1/60);assert.equal(context.test.regionBlend,held,'A paused run freezes the page turn');fresh.state='playing';}
  }
  assert(midTurn>0,'The sheet must be drawn part way across the frame');
  assert.equal(context.test.regionBlend,1,'The page turn settles exactly on the new chapter: '+context.test.regionBlend);
  assert(turnFrames<900,'The page turn must complete in a few seconds');
  // ---------- The pause leaf: the footer's own control, and the two things it offers ----------
  // A run can now be set down deliberately rather than only by losing the page, and the leaf that comes
  // up over the suspended sheet offers both ways back: take the plate up again, or set it aside for the
  // frontispiece. The old way in and out — a switched-away page, a tap anywhere on the sheet — is unchanged.
  {
    const leaf=element('pause'),escape={code:'Escape',preventDefault(){},repeat:false,target:{closest:()=>null}};
    const held=fresh.time;
    events['pause-open:click']();
    assert.equal(fresh.state,'paused','The footer control suspends the run');
    assert.equal(leaf.classList.contains('hidden'),false,'A suspended run raises the pause leaf');
    assert.equal(element('announcement').textContent,context.test.plateWords().chrome.pauseTitle,'The halt is spoken in the plate\'s own word for it');
    frames(10);assert.equal(fresh.time,held,'A run suspended from the footer stands as still as one switched away from');
    events['pause-open:click']();
    assert.equal(fresh.state,'playing','The same control takes the run up again');
    events['pause-open:click']();
    events['pause-resume:click']();
    assert.equal(fresh.state,'playing','The leaf takes the run up too');
    assert.equal(leaf.classList.contains('hidden'),true,'Taking a run up puts the leaf away');
    events['window:keydown'](escape);assert.equal(fresh.state,'paused','Escape is the same halt from the keyboard');
    events['window:keydown'](escape);assert.equal(fresh.state,'playing','And takes the run up again');
    // Leaving is the third way out, and it is not a death: nothing is scored and no colophon is pulled.
    // What the run did is still folded into the ledger, so the orbits flown are never lost with the sheet.
    const runsBefore=context.test.ledgerStat('runs');
    events['pause-open:click']();
    events['pause-leave:click']();
    assert(context.test.world!==fresh&&context.test.world.state==='ready','Leaving a run deals a fresh chart at the frontispiece');
    assert.equal(element('intro').classList.contains('hidden'),false,'Leaving a run raises the frontispiece');
    assert.equal(element('end').classList.contains('hidden'),true,'Leaving a run pulls no colophon');
    assert.equal(leaf.classList.contains('hidden'),true,'Leaving a run puts the pause leaf away');
    assert.equal(element('game').classList.contains('playing'),false,'The running head goes with the run');
    assert.equal(context.test.ledgerStat('runs'),runsBefore+1,'A run set aside unfinished is still counted in the ledger');
    // And with no run in hand there is nothing to suspend: the control and the key both stand down.
    events['pause-open:click']();events['window:keydown'](escape);
    assert.equal(context.test.world.state,'ready','Neither the control nor Escape suspends the frontispiece');
    assert.equal(leaf.classList.contains('hidden'),true,'The frontispiece raises no pause leaf');
  }
  // ---------- The survey at both ends of a flight ----------
  // An exact tangent from a two-planet fixture, flown through the whole runtime: the release lays a
  // departure construction on the orbit it left, the landing lays an arrival construction with the
  // geometer's right angle on the one it reached, and both dry on the sheet with the route.
  {
    context.test.newWorld();context.test.setPlaying();
    const w=context.test.world,origin=w.player.node,destination=w.makeNode(120,-400,54,1,'still');
    w.nodes=[origin,destination];w.lastMain=destination;w.row=1;w.ensureAhead=()=>{};w.hazards=[];w.nebulas=[];
    const path=context.test.orbitTangents(origin,destination,-1)[0];
    assert(path,'A tangent route must exist for the survey fixture');
    // The run's first square is also its ANGULUS RECTUS observation, whose announcement follows the
    // capture and takes the line; noting the observation first leaves the square's own toast standing.
    w.observed.add('rightAngle');
    w.player.angle=path.angle;w.player.dir=-1;w.player.speed=150;w.positionPlayer();w.start();
    assert.equal(context.test.surveys.length,0,'A new run is dealt with nothing surveyed');
    assert.equal(w.release(),true);
    const departure=context.test.surveys.at(-1);
    assert.equal(context.test.surveys.length,1,'A release is surveyed once');
    assert.equal(departure.kind,'departure','The release lays a departure construction');
    assert(departure.r>1&&Number.isFinite(departure.cx)&&Number.isFinite(departure.cy));
    assert(Number.isInteger(departure.bearing)&&departure.bearing>=0&&departure.bearing<360,'The release bearing reads 0 to 359 clockwise from north: '+departure.bearing);
    context.test.render(step);
    for(let i=0;i<120*8&&w.state==='playing'&&!w.player.node;i++)w.update(step);
    assert.equal(w.player.node,destination,'The survey fixture must land');
    const landing=context.test.surveys.at(-1);
    assert.equal(context.test.surveys.length,2,'A landing is surveyed once');
    assert.equal(landing.kind,'landing','The landing lays an arrival construction');
    assert.equal(landing.square,true,'An exact tangent lands square');
    assert(landing.squareBonus>0&&Math.abs(landing.angle-90)<1e-6,'The right-angle mark carries the square bonus');
    assert(inscribed().includes('RIGHT ANGLE · +'+landing.squareBonus),inscribed());
    // It is written beside the orbit it was landed on, and rides with it: the note keeps its place on the
    // sheet as the chart scrolls, and never prints into the frame's margin, the score band or the footer.
    {
      const square=written().find(g=>g.text.includes('RIGHT ANGLE'));
      assert.equal(square.node,w.player.node,'A landing is announced on the orbit it was made on');
      const before=context.test.inscriptionBox(square),offset=before.cx-before.ax;
      w.cameraY-=40;
      const after=context.test.inscriptionBox(square);
      assert(Math.abs((after.cx-after.ax)-offset)<1e-6&&Math.abs(after.cy-before.cy)>1,'An inscription is carried by the sheet, not held on the screen');
      w.cameraY+=40;
    }
    // Wherever on the chart the thing happened — hard against any edge of the plate — the lettering is set
    // on the sheet and never into the margin.
    for(const [ex,ey] of [[-w.width/2,w.cameraY],[w.width/2,w.cameraY],[0,w.cameraY],[0,w.cameraY+w.height],[-w.width/2,w.cameraY+w.height]]){
      const note=context.test.inscribe('OBSERVATION \u00b7 A LONG NOTE SET AT THE VERY EDGE OF THE PLATE',{x:ex,y:ey,life:4});
      assert(context.test.inscriptionRoom(context.test.inscriptionBox(note))>-1e-6,'Nothing is written into the margin at '+ex+','+ey);
    }
    // A standing instruction the sheet has carried off the plate is set again, so what is still being
    // asked for stays legible however far the chart has scrolled under it.
    {
      context.test.clearInscriptions();
      const stood=context.test.inscribeHeld('probe','One lap builds speed.',{node:w.player.node});
      w.cameraY-=w.height;
      assert(context.test.inscriptionRoom(context.test.inscriptionBox(stood))<0,'The sheet carries an inscription away with it');
      context.test.inscribeHeld('probe','One lap builds speed.',{node:w.player.node});
      assert(context.test.inscriptionRoom(context.test.inscriptionBox(stood))>-1e-6,'A standing instruction is re-set onto the sheet');
      w.cameraY+=w.height;
    }
    // The sheet holds a bounded number of them, and a run is dealt on a clean one.
    for(let i=0;i<context.test.INSCRIPTION_CAP*3;i++)context.test.inscribe('NOTA '+i);
    assert(context.test.inscriptions.length<=context.test.INSCRIPTION_CAP,'The inscriptions are capped: '+context.test.inscriptions.length);
    context.test.render(step);context.test.render(step);
    // Lettering is never set over lettering: however many notes crowd one subject, no two of them overlap.
    const sway=g=>g.node&&g.node.amp?g.node.amp*context.test.scale:0;
    const overlapping=()=>{
      const boxes=written().map(g=>({g,b:context.test.inscriptionBox(g),s:sway(g),r:g.node&&g.node.amp?(g.node.baseX-g.node.x)*context.test.scale:0})),pairs=[];
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
        const a=boxes[i],b=boxes[j];
        if(a.b.left+a.r-a.s<b.b.right+b.r+b.s&&a.b.right+a.r+a.s>b.b.left+b.r-b.s&&a.b.top<b.b.bottom&&a.b.bottom>b.b.top)pairs.push(a.g.text+' / '+b.g.text);
      }
      return pairs;
    };
    assert.equal(overlapping().length,0,'Inscriptions overlap: '+overlapping().join(', '));
    // The same holds across a wandering orbit's whole drift: a note beside it is set clear of the others
    // wherever the planet is carried, so the drift can never bring two notes together.
    {
      context.test.clearInscriptions();
      const wanderer=w.nodes.find(n=>n!==w.player.node&&Math.abs(n.y-w.player.y)<w.height*.3)||w.nodes[0];
      const savedAmp=wanderer.amp,savedX=wanderer.x;wanderer.amp=22;
      for(let i=0;i<6;i++)context.test.inscribe('WANDERING NOTE '+i,{node:wanderer});
      for(let i=0;i<6;i++)context.test.inscribe('FIXED NOTE '+i,{x:wanderer.baseX+40,y:wanderer.y});
      for(const t of [-1,-.5,0,.5,1]){
        wanderer.x=wanderer.baseX+t*wanderer.amp;
        assert.equal(overlapping().length,0,'Drift brings inscriptions together at '+t+': '+overlapping().join(', '));
      }
      wanderer.amp=savedAmp;wanderer.x=savedX;
    }
    // Nothing written fades or expires: a note stays on the sheet, at full strength, for as long as the
    // sheet holds still under it, and leaves only when the chart has carried it under the plate's rule.
    {
      context.test.clearInscriptions();
      const kept=context.test.inscribe('KEPT AS INK',{node:w.player.node});
      const before=context.test.inscriptionBox(kept);
      for(let i=0;i<120*30;i++)context.test.render(step);
      assert(written().includes(kept),'An inscription is not struck out with age');
      const after=context.test.inscriptionBox(kept);
      assert(Math.abs(after.cx-before.cx)<1e-6&&Math.abs(after.cy-before.cy)<1e-6,'An inscription keeps its place while the sheet holds still');
      const stood=context.test.inscribeHeld('probe','One lap builds speed.',{node:w.player.node});
      w.cameraY-=w.height*2;
      context.test.render(step);
      assert(!written().includes(kept),'A note the sheet has carried off the plate is struck from the list');
      assert(written().includes(stood)&&context.test.inscriptionRoom(context.test.inscriptionBox(stood))<0,'A standing instruction is held until it is asked for again');
      context.test.inscribeHeld('probe','One lap builds speed.',{node:w.player.node});
      assert(context.test.inscriptionRoom(context.test.inscriptionBox(stood))>-1e-6,'A standing instruction the sheet carried off is set again');
      w.cameraY+=w.height*2;
    }
    // A standing instruction that stops being asked for is not struck out: it is ink like any other note,
    // and the same instruction asked for again while it is still on the plate is taken up, not written twice.
    {
      context.test.clearInscriptions();
      const first=context.test.inscribeHeld('probe','Tap when the pricked line skims the rim.',{node:w.player.node});
      const second=context.test.inscribeHeld('probe','One lap builds speed.',{node:w.player.node});
      assert(written().includes(first)&&written().includes(second),'A replaced instruction stays on the sheet as ink');
      assert(!first.held&&second.held,'Only the instruction still being asked for is held');
      assert.equal(context.test.inscribeHeld('probe','Tap when the pricked line skims the rim.',{node:w.player.node}),first,'An instruction still on the plate is taken up again');
      assert(first.held&&!second.held&&written().length===2,'No instruction is written twice over');
      assert.equal(overlapping().length,0,'Instructions overlap: '+overlapping().join(', '));
      context.test.clearInscriptions();
    }
    // Bounded like the route: the constructions can never outgrow their cap or outlive the run.
    for(let i=0;i<context.test.SURVEY_CAP*3;i++)context.test.surveys.push({...landing,birth:w.time});
    frames(3);
    assert(context.test.surveys.length<=context.test.SURVEY_CAP,'The constructions are capped: '+context.test.surveys.length);
    context.test.newWorld();
    assert.equal(context.test.surveys.length,0,'A new run is dealt on a sheet with no constructions');
  }
  // A rough impression cannot be joined, only arrested: its landing construction carries a skid mark of
  // its own — gated strictly on the steep flag, seeded off the node so it never flickers, and drawn
  // without a single non-finite canvas argument (the proxy above asserts that for every call it sees).
  {
    // A fresh newWorld() draws its opening node at a seed-dependent radius, so the offset that lands
    // one course steep and another ordinary is pinned against a radius fixed here rather than left to
    // whatever a given run happened to generate.
    const roughFixture=(offset,speed)=>{
      context.test.newWorld();context.test.setPlaying();
      const w=context.test.world;w.difficultyPending=false;
      const origin=w.player.node,destination=w.makeNode(0,-300,50,1,'still');
      origin.r=40;origin.x=origin.baseX=offset-origin.r;origin.y=origin.baseY=0;
      w.nodes=[origin,destination];w.lastMain=destination;w.row=1;w.ensureAhead=()=>{};w.hazards=[];w.nebulas=[];
      w.player.angle=0;w.player.dir=-1;w.player.speed=speed;w.positionPlayer();w.start();
      return {w,destination};
    };
    const {w,destination}=roughFixture(-10,240),aim=w.aim();
    assert(aim&&aim.steep,'The fixture must aim a rough, near-radial arrival: '+aim?.angle);
    assert.equal(w.release(),true);
    for(let i=0;i<120*3&&w.state==='playing'&&!w.player.node;i++)w.update(step);
    assert.equal(w.player.node,destination,'The rough fixture must land');
    const landing=context.test.surveys.at(-1);
    assert.equal(landing.kind,'landing');
    assert.equal(landing.rough,true,'A steep arrival is surveyed as a rough impression, marked for its skid');
    assert(Number.isInteger(landing.seed)&&landing.seed>0,'The skid mark is drawn from a stable per-node seed');
    // Mid-reveal, then fully settled: every canvas call the stand-in sees along the way must stay finite.
    context.test.render(step);
    for(let i=0;i<60;i++)w.update(step);
    context.test.render(step);
    // An ordinary, non-rough landing must carry no skid mark at all.
    const control=roughFixture(20,150);
    assert.equal(control.w.aim().steep,false,'The control fixture must not be rough');
    assert.equal(control.w.release(),true);
    for(let i=0;i<120*3&&control.w.state==='playing'&&!control.w.player.node;i++)control.w.update(step);
    assert.equal(context.test.surveys.at(-1).rough,false,'An ordinary landing carries no skid mark');
    context.test.render(step);
    context.test.newWorld();
  }
  // A nebula patch is baked into a sprite of its own, whatever the plate.
  {
    const patch=context.test.nebulaSprite(4711,26);
    assert(patch&&patch.canvas&&patch.size>0,'A nebula patch is baked into a sprite');
    assert.strictEqual(context.test.nebulaSprite(4711,26),patch,'A nebula sprite is cut once and reused');
  }
  // The gloss on the flood keeps out of the footer band, where the chapter name and the buttons are set,
  // however high the ink has risen — at every layout this runtime is booted at.
  {
    const gloss=context.test.glossSprite(false),floor=context.test.marginaliaFloor();
    assert(floor>0&&floor<=height-context.test.footerBand(),'The marginalia floor sits above the footer band at '+width+'x'+height);
    for(const fy of [-40,0,height*.35,height*.75,height-10,height+120]){
      const place=context.test.marginaliaGloss(fy,gloss);
      assert(place.y+place.h<=floor+1e-6,'The gloss stays out of the footer band at '+width+'x'+height+', waterline '+fy);
    }
  }
  // ---- The replay: a chart rebuilt from nothing but its seed and when the traveller released ----
  // A middling pilot — it takes any release that isn't steep, not only a perfect one — flies a real
  // session through the actual gameplay input, exactly as a tap would. What it plays is then handed to
  // replayRun() as nothing but replayLog, and the two must agree on everything pruning does not touch:
  // an unpruned replay is expected to outgrow the live, pruned world's own arrays, not match them.
  // A dawdle on the frontispiece is folded in before the first tap: world.time keeps ticking (and its
  // nodes keep wobbling) while the sheet just sits there waiting to be started, so every release this
  // pilot logs afterward is stamped well past zero, and the replay has to sit through that same idle
  // stretch rather than starting cold at the first release's own timestamp.
  {
    // newWorld() deals from the live runSeed counter (src/plates.js), seeded off Date.now()^Math.random()
    // so a real game never replays the same chart — which means an unlucky draw here can occasionally die
    // within a release or two of nothing but a rough opening. Redraw a fresh chart when that happens
    // rather than let the wall clock's luck fail a suite that has nothing wrong with it; a real bug still
    // fails loudly, since it would keep failing across every seed this redraws into.
    let live,log,attempts=0;
    do{
      context.test.newWorld();frames(300);context.test.handleInput();
      let guard=0;
      while(context.test.world.state==='playing'&&guard++<20000){
        const w=context.test.world;
        if(w.player.node){const aim=w.aim();if(aim&&!aim.steep)context.test.handleInput();}
        frames(1);
      }
      live=context.test.world;
      assert.equal(live.state,'dead','The replay fixture must actually finish a run to be worth replaying: '+width+'x'+height);
      log=context.test.replayLog;
    }while(log.releases.length<4&&++attempts<20);
    assert(log.releases.length>=4,'The fixture must record a real handful of releases: '+width+'x'+height);
    const replayed=context.test.replayRun(log);
    assert.equal(replayed.state,'dead','A replayed run must reach the same end the live one did: '+width+'x'+height);
    assert.equal(replayed.reason,live.reason,'A replayed run must die of the same cause: '+width+'x'+height);
    for(const key of ['score','captures','perfects','squares','maxCombo','progress','constellationsCompleted'])
      assert.equal(replayed[key],live[key],'A replayed run must match the live one on '+key+' at '+width+'x'+height);
    assert.equal(replayed.observations.map(o=>o.key).sort().join(),live.observations.map(o=>o.key).sort().join(),'A replayed run must earn the same observations: '+width+'x'+height);
    assert(Math.abs(replayed.player.x-live.player.x)<1e-6&&Math.abs(replayed.player.y-live.player.y)<1e-6,'A replayed run must land in the same place: '+width+'x'+height);
    assert(replayed.nodes.length>live.nodes.length,'An unpruned replay must keep more of the chart than the darkness left the live run holding: '+width+'x'+height);
    // ---- The review: a free-scrolling camera over that same, unpruned replay ----
    context.test.showEnd();
    assert.equal(context.test.reviewing,false,'The colophon alone must not start a review: '+width+'x'+height);
    context.test.openReview();
    assert.equal(context.test.reviewing,true,'REVIEW THE PLATE must open one: '+width+'x'+height);
    const rw=context.test.reviewWorld;
    assert(rw&&rw.state==='dead'&&rw.nodes.length===replayed.nodes.length,'A review is the same unpruned replay, not a second one: '+width+'x'+height);
    context.test.renderReview();
    const bounds=context.test.reviewBounds(rw);
    assert(bounds.min<=bounds.max,'A review\'s scroll range must never invert, however short the run: '+width+'x'+height);
    assert(bounds.min<bounds.max,'A run that climbed several rows must leave the review something to scroll through: '+width+'x'+height);
    context.test.panReviewBy(-1e9);
    assert.equal(context.test.reviewCameraY,bounds.min,'Panning past the top of the climb must stop there: '+width+'x'+height);
    context.test.panReviewBy(1e9);
    assert.equal(context.test.reviewCameraY,bounds.max,'Panning past the opening must stop there, not run on: '+width+'x'+height);
    context.test.renderReview();
    context.test.handleInput();
    assert.equal(context.test.reviewing,true,'Reviewing holds the gameplay input exactly as the catalogue and ephemeris do: '+width+'x'+height);
    context.test.closeReview();
    assert.equal(context.test.reviewing,false,'CLOSE must end the review: '+width+'x'+height);
  }
  // ---- The doors, last, because entering a century deals a fresh chart ----
  // Entering puts a century's plate on the press; leaving puts back the plate that was there, and
  // never strands the player on a plate that is itself a mode. Every era renders on both sides of the
  // journey, so a hand that draws nothing at all would be caught here rather than on the page.
  {
    context.test.setPlate('paper');context.test.newWorld();
    for(const id in context.test.PLATE_STYLES){
      if(!context.test.PLATE_STYLES[id].door)continue;
      context.test.enterEra(id);
      assert.equal(context.test.plateName,id,'A door opens onto its own century: '+id);
      assert.equal(context.test.eraId(),context.test.PLATE_STYLES[id].era);
      assert.equal(context.test.plateOwns('score'),true,'A century keeps its own record: '+id);
      context.test.render(1/60);context.test.handleInput();context.test.render(1/60);
      context.test.leaveEra();
      assert.equal(context.test.plateName,'paper','Leaving a century puts back the plate that was on the press: '+id);
      context.test.newWorld();
    }
    context.test.enterEra('rock');
    context.test.enterEra('ceiling');
    assert.equal(context.test.plateName,'paper','A door pressed from inside a century is the way back out');
    context.test.leaveEra();
    assert.equal(context.test.plateName,'paper','Leaving when no century is standing is not a second exit');
    context.test.setPlate('night');
  }
  return {width,height,storageBlocked,reduceMotion,lensCopies,turnFrames};
}

// ---------- worker entry: when this file is spawned as a worker, run exactly the one task asked for ----------
if(!isMainThread){
  const {task,simulation,params}=workerData;
  try{
    if(simulation)useSimulationApi(simSandbox(simulation));
    if(workerData.script)script=workerData.script;
    let result;
    if(task==='route60')result=taskRoute60();
    else if(task==='detourDeep')result=taskDetourDeep();
    else if(task==='sling60')result=taskSling60();
    else if(task==='variedOpening')result=taskVariedOpening();
    else if(task==='runtime')result=runtime(params.width,params.height,params.storageBlocked,params.reduceMotion,params.seed);
    else throw new Error('Unknown worker task: '+task);
    parentPort.postMessage({ok:true,result});
  }catch(err){
    parentPort.postMessage({ok:false,error:{name:err.name,message:err.message,stack:err.stack,actual:err.actual,expected:err.expected,operator:err.operator}});
  }
}else{

// ---------- the driver: bundle once, fire every heavy block into a worker immediately, then run every
// fast sequential check below on the main thread while that work runs alongside it ----------
const bundled=await bundle();const html=bundled.html;script=bundled.script;
const simulation=(await readFile(new URL('../src/simulation.js',import.meta.url),'utf8')).split('// BEGIN SIMULATION')[1].split('// END SIMULATION')[0];
useSimulationApi(simSandbox(simulation));

const workers=[];
function runInWorker(task,extra={}){
  const worker=new Worker(new URL(import.meta.url),{workerData:{task,...extra}});
  workers.push(worker);
  return new Promise((resolve,reject)=>{
    worker.once('message',m=>{
      if(m.ok){resolve(m.result);return;}
      const info=m.error;
      const err=info.name==='AssertionError'?new assert.AssertionError({message:info.message,actual:info.actual,expected:info.expected,operator:info.operator}):new Error(info.message);
      err.stack=info.stack||err.stack;reject(err);
    });
    worker.once('error',reject);
  });
}
// A runtime scenario needs OrbitWorld too — the daily-plate checks build one directly, beside the
// world the booted page deals itself, to confirm both read the same catalogue for the same seed.
function runtimeLayout(params){return runInWorker('runtime',{script,simulation,params});}

// Every seed-loop and full-page scenario below is an independent, seeded run that never reads or
// writes another's state (proven by the daily-plate determinism checks further down, which are the
// same claim about a single run), so all of them are fired at once here and only awaited where their
// results are actually needed, letting them run on worker threads alongside the sequential checks.
const pRoute=runInWorker('route60',{simulation});
const pDetourDeep=runInWorker('detourDeep',{simulation});
const pSling=runInWorker('sling60',{simulation});
const pVaried=runInWorker('variedOpening',{simulation});
// A ledger that has earned the whole catalogue, seeded into storage before the page boots, so the
// unlocked half of every screen is exercised as well as the empty one.
const FULL_LEDGER=JSON.stringify({captures:10500,perfects:4000,bestFlow:9,constellations:{'THE LYRE':40},bestRow:88,
  deepestChapter:4,deepestHardcoreChapter:4,grazes:40,shieldsSpent:20,reflectorsSpent:10,maxSpeedSlings:400,inkwellsFound:14,badAngles:550,runs:{classic:140,relaxed:6,hardcore:20},
  playSeconds:41000,personalBests:{classic:2400,relaxed:900,hardcore:1800},
  observations:{perfectThree:6,skipFive:5,maxSpeed:3,graze:2,pureChart:2,fortyRows:9,threeMinutes:4,rightAngle:12},allFourInOneRun:true});
// A plate from a previous visit, saved under its own seed and viewport rather than this layout's —
// review has to rebuild it as it was flown, not as the frontispiece booting it happens to be sized.
const SAVED_REPLAY=JSON.stringify({seed:1,width:440,height:860,offerDifficulty:true,releases:[],resizes:[],score:250,row:9,reason:'THE NIB RAN DRY',capturedAt:Date.now()});
const pLayouts=Promise.all([
  runtimeLayout({width:390,height:844}),
  runtimeLayout({width:430,height:932,storageBlocked:true,reduceMotion:true}),
  // The whole catalogue earned, on a wide plate where the frame prints its credit line and its legend.
  runtimeLayout({width:1440,height:900,seed:{'orbit.ledger.v1':FULL_LEDGER,'orbit.initials.v1':'ORB','orbit.lastReplay.v1':SAVED_REPLAY,
    'orbit.cosmetics.v1':JSON.stringify({plate:'night',mark:'telescope',trail:'sanguine',capture:'rose',frame:'acanthus',figures:'bayer'})}}),
  runtimeLayout({width:844,height:390}),
  // A ledger that is not JSON at all is the same as no ledger: the page boots on an empty one. The
  // ephemeris log is seeded here too, with junk among the days, beside a daily record from before the
  // log existed for the boot to fold in.
  runtimeLayout({width:320,height:568,seed:{'orbit.ledger.v1':'{ this is not a ledger',
    'orbit.dailyLog.v1':JSON.stringify({'2018-05-04':{best:'420',plays:3},nonsense:{best:9},'3000-01-01':{best:5},'2018-05-05':7}),
    'orbit.daily.v1':JSON.stringify({date:'2019-11-30',best:88})}}),
  // The same, under reduced motion, with a derived plate, an ink, a mark, an ornament and a hand chosen.
  runtimeLayout({width:412,height:915,reduceMotion:true,seed:{'orbit.ledger.v1':FULL_LEDGER,'orbit.plate.v1':'cellarius','orbit.initials.v1':'ORB',
    'orbit.cosmetics.v1':JSON.stringify({plate:'cellarius',mark:'saturn',trail:'goldleaf',capture:'seal',frame:'seamonsters',figures:'bode'})}}),
]);

try{

// Nothing may ask the plate which era it is by name. Twenty-one places once did, across four files,
// and every era after the first would have had to be answered at all of them; the plate is asked what
// it does instead. This is the guard that keeps that true, because the cheapest way to add an era is
// always to add a second name beside the first.
assert(!/ceilingPlate/.test(script),'No code may ask whether the plate is the Ceiling by name');

assert.equal(segmentCircle(-100,0,100,0,0,0,10),.45,'Swept collision must detect fast crossing');
assert.equal(segmentCircle(-100,20,100,20,0,0,10),null);
assert.equal(segmentCircle(0,0,100,0,0,0,10),0);

// Tiro's wider pressure asks less precise timing to land a smooth tangent transfer: the windowMult
// argument widens the band around the target's rim that counts as perfect, and the guide and real
// flight both read it from the world's own perfectMult, so a flight passing just outside the drawn
// window at Classic's ×1 reads perfect once Tiro's ×1.35 is in effect.
{
  const n={x:0,y:0,vx:0,vy:0,amp:0,r:100,cap:130},p={x:125,y:-500},v={vx:0,vy:200};
  assert.equal(transferContact(p,v,n,0,10).perfect,false,'125 falls outside the drawn ±20 rim window');
  assert.equal(transferContact(p,v,n,0,10,1.35).perfect,true,'The same flight is perfect inside the widened window');
}

// Black-hole flybys bend close, slow flights most strongly while preserving
// the player's selected speed. The field ends cleanly outside its drawn range.
function flyby(offset,speed){
  const h={x:0,y:0,r:24,seed:1,phase:0},p={x:offset,y:180,vx:0,vy:-speed};let minDistance=Infinity,hit=null;
  for(let i=0;i<120*6&&p.y>-180&&!hit;i++){
    const result=flightStep(p,[],[h],i*step,step,180,4000);minDistance=Math.min(minDistance,Math.hypot(p.x,p.y));hit=result.hit;
  }
  return {p,hit,minDistance,turn:Math.atan2(-p.vx,-p.vy)};
}
for(const speed of [150,240,360])for(const offset of [45,60,85,130]){
  const result=flyby(offset,speed);assert(Number.isFinite(result.p.x)&&Number.isFinite(result.p.y));
  assert(Math.abs(Math.hypot(result.p.vx,result.p.vy)-speed)<1e-7,'Gravity changes heading without overriding earned speed');
}
const slowClose=flyby(60,150),fastClose=flyby(60,360),farPass=flyby(130,150),mirror=flyby(-60,150);
assert(slowClose.turn>.25&&slowClose.turn<.5,'A close pass at opening speed should visibly turn the flight');
assert(fastClose.turn>.025&&fastClose.turn<.08&&fastClose.turn<slowClose.turn,'Faster flybys get less time to bend');
assert(Math.abs(farPass.turn)<1e-10);assert(Math.abs(mirror.turn+slowClose.turn)<1e-10,'The field is symmetric around the vortex');

// Sunspot flares use the same field radius and the same steering, with the sign
// reversed: they push the flight outward, preserve its speed, and end just as cleanly.
function flareFlyby(offset,speed){
  const h={x:0,y:0,r:24,kind:'flare',seed:2,phase:0},p={x:offset,y:180,vx:0,vy:-speed};let minDistance=Infinity,hit=null;
  for(let i=0;i<120*6&&p.y>-180&&!hit;i++){
    const result=flightStep(p,[],[h],i*step,step,180,4000);minDistance=Math.min(minDistance,Math.hypot(p.x,p.y));hit=result.hit;
  }
  return {p,hit,minDistance,turn:Math.atan2(-p.vx,-p.vy)};
}
for(const speed of [150,240,360])for(const offset of [45,60,85,130]){
  const result=flareFlyby(offset,speed);assert(Number.isFinite(result.p.x)&&Number.isFinite(result.p.y));
  assert(Math.abs(Math.hypot(result.p.vx,result.p.vy)-speed)<1e-7,'A flare turns the flight without touching its speed');
}
const flareSlow=flareFlyby(60,150),flareFast=flareFlyby(60,360),flareFar=flareFlyby(130,150),flareMirror=flareFlyby(-60,150);
assert(flareSlow.turn<-.15&&flareSlow.turn>-.35,'A close flare pass pushes the flight outward');
assert(flareFast.turn<0&&flareFast.turn>flareSlow.turn,'Faster flare passes get less time to bend');
assert(Math.abs(flareFar.turn)<1e-10,'The flare field ends cleanly at its drawn edge');
assert(Math.abs(flareMirror.turn+flareSlow.turn)<1e-10,'The flare field is symmetric around its core');
assert(slowClose.turn>0&&flareSlow.turn<0,'A hole and a flare of the same size turn a flight opposite ways');
assert(Math.abs(flareSlow.turn+slowClose.turn)<.16,'Both fields bend a matched flyby by a comparable amount');

// Newton mode: a main body's own pull bends a free flight the way a hazard's field does, but with one
// deliberate difference — it is a real acceleration rather than a direction-only steer. Over a full
// symmetric pass the field gives back on the way out almost exactly what it took on the way in (the
// same conservative-field behaviour that lets a real slingshot trade a course for speed rather than
// create it), so what actually tells a Newtonian body apart from a hazard is the traveller's transient
// speed at closest approach, not its speed once clear of the field again. newtonOn is otherwise inert:
// none of the flybys above pass it, and it does nothing without it (see the false case below).
function newtonFlyby(offset,speed,newtonOn=true){
  const n={x:0,y:0,r:50,cap:1,amp:0,vx:0,vy:0,visited:false,type:'still',seed:1,phase:0};
  const p={x:offset,y:180,vx:0,vy:-speed};let minDistance=Infinity,hit=null,speedAtClosest=speed;
  for(let i=0;i<120*6&&p.y>-180&&!hit;i++){
    const result=flightStep(p,[n],[],i*step,step,180,4000,1,newtonOn);
    const d=Math.hypot(p.x,p.y);if(d<minDistance){minDistance=d;speedAtClosest=Math.hypot(p.vx,p.vy);}
    hit=result.hit;
  }
  return {p,hit,minDistance,speedAtClosest,speed:Math.hypot(p.vx,p.vy),turn:Math.atan2(-p.vx,-p.vy)};
}
for(const speed of [150,240,360])for(const offset of [20,45,60,110]){
  const result=newtonFlyby(offset,speed);assert(Number.isFinite(result.p.x)&&Number.isFinite(result.p.y)&&Number.isFinite(result.speed));
}
assert.equal(Math.abs(newtonFlyby(45,150,false).turn),0,'newtonOn defaults off: flightStep’s existing callers see no node pull');
const newtonSlow=newtonFlyby(45,150),newtonFast=newtonFlyby(45,360),newtonFar=newtonFlyby(110,150),newtonMirror=newtonFlyby(-45,150);
assert(newtonSlow.turn>.45&&newtonSlow.turn<.8,'A pass halfway into the field at opening speed should visibly turn the flight toward the body');
assert(newtonSlow.speedAtClosest-150>10,'Unlike a hazard, gravity speeds the traveller up on the way past');
assert(Math.abs(newtonSlow.speed-150)<.5,'A full symmetric pass gives back on the way out almost exactly what it took on the way in');
assert(newtonFast.turn>0&&newtonFast.turn<newtonSlow.turn,'Faster flybys get less time to bend');
assert(newtonFast.speedAtClosest-360>0&&newtonFast.speedAtClosest-360<newtonSlow.speedAtClosest-150,'Faster flybys also get less time to speed up');
assert(Math.abs(newtonFar.turn)<1e-9&&Math.abs(newtonFar.speedAtClosest-150)<1e-7,'The field ends cleanly at its drawn reach');
assert(Math.abs(newtonMirror.turn+newtonSlow.turn)<1e-9,'The field is symmetric around the body');
assert(Math.abs(newtonMirror.speedAtClosest-newtonSlow.speedAtClosest)<1e-9,'A mirrored pass speeds the traveller up by the same amount');

// A head-on approach feels no turning force, so it reaches the lethal core directly:
// a vortex is lethal to its drawn edge, a flare only inside a core of 0.6 r.
function headOn(kind){
  const h={x:0,y:0,r:24,kind,seed:5,phase:0},p={x:0,y:180,vx:0,vy:-300};let hit=null;
  for(let i=0;i<120*3&&p.y>-180&&!hit;i++)hit=flightStep(p,[],[h],i*step,step,180,4000).hit;
  return {hit,y:p.y};
}
const holeHead=headOn('vortex'),flareHead=headOn('flare');
assert.equal(holeHead.hit?.kind,'hazard');assert(Math.abs(holeHead.y-27)<3,'A vortex is lethal to its drawn edge');
assert.equal(flareHead.hit?.kind,'hazard');assert(Math.abs(flareHead.y-(24*.6+3))<3,'A flare only kills inside its smaller core');
assert.equal(hazardCore({r:24}),24);assert.equal(hazardCore({r:24,kind:'vortex'}),24);assert.equal(hazardCore({r:24,kind:'flare'}),24*.6);
// An unknown kind falls back to the vortex, so a fixture naming none keeps its old behaviour.
assert.equal(hazardKind({}).latin,'VORAGO');assert.equal(hazardKind({kind:'wind'}).lethal,false);

// The arrival angle reads 90 for a line exactly tangent to the drawn ring, a little off for a smooth
// entry joined inside or outside it, and far below for a hard turn toward the centre. Only the exact
// tangent is a square and earns its own bonus, once per landing, on top of the perfect transfer.
function tangentArrival(offset){
  const events=[],w=new OrbitWorld(31,440,860,(type,e)=>{if(type==='capture')events.push(e);}),origin=w.player.node;
  const destination=w.makeNode(120,-400,54,1,'still');w.nodes=[origin,destination];w.lastMain=destination;w.row=1;w.ensureAhead=()=>{};w.hazards=[];
  const path=orbitTangents(origin,destination,-1)[0];assert(path,'A tangent route must exist for the fixture');
  w.player.angle=path.angle+offset;w.player.dir=-1;w.player.speed=150;w.positionPlayer();w.start();w.release();
  for(let i=0;i<120*8&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.player.node,destination);assert.equal(events.length,1);return {event:events[0],world:w};
}
const exact=tangentArrival(0),shy=tangentArrival(.02);
assert(exact.event.perfect&&Math.abs(exact.event.angle-90)<1e-6,'An exact tangent reads ninety degrees');
assert(exact.event.square&&exact.event.squareBonus===10&&exact.world.squares===1,'An exact tangent is a square worth ten at the opening pace');
assert(exact.world.observations.some(o=>o.key==='rightAngle'),'The first square is observed');
assert(exact.world.score===exact.event.gain+10,'The square bonus is added beside the landing reward');
assert(exact.event.n.impression?.perfect&&exact.event.n.impression.x===0&&exact.event.n.impression.y===0,'A perfect landing keeps hand-colour inside the engraving');
assert(!shy.event.square&&Math.abs(shy.event.angle-90)>1.5&&Math.abs(shy.event.angle-90)<15,'A tangent released late joins off the ring and is not a square');
{
  const events=[],w=new OrbitWorld(32,440,860,(type,e)=>{if(type==='capture')events.push(e);}),destination=w.makeNode(0,-400,54,1,'still');
  w.player.node=null;w.player.x=0;w.player.y=-400+54;w.player.vx=0;w.player.vy=-150;w.player.launch={row:0,sweep:1};w.state='playing';
  assert.equal(w.capture(destination),true);assert.equal(events.length,1);
  assert(!events[0].n.impression?.perfect&&events[0].n.impression?.quality<1,'A rough landing records a distinct hand-colour impression');
  assert(!events[0].perfect&&!events[0].square&&events[0].angle<10,'A flight straight at the centre reads near zero');
}
function curvedFixture(speed=240,drift=false,angle=-.002){
  const captures=[],w=new OrbitWorld(712,440,860,(type,e)=>{if(type==='capture')captures.push(e);}),origin=w.player.node;
  origin.x=origin.baseX=-57;const destination=w.makeNode(70,-420,50,2,drift?'drift':'still');
  w.nodes=[origin,destination];w.lastMain=destination;w.row=2;w.ensureAhead=()=>{};
  w.hazards=[{x:70,y:-170,r:24,seed:43,phase:.2,near:false}];
  w.player.angle=angle;w.player.dir=-1;w.player.speed=speed;w.positionPlayer();w.start();return {w,destination,captures};
}
let curvedCaptures=0,maxPreviewSteps=0;
for(const [speed,drift,angle] of [[150,false,-.032],[150,true,-.026],[240,false,-.002],[240,true,-.02],[360,false,.016],[360,true,-.014]]){
  const {w,destination,captures}=curvedFixture(speed,drift,angle),before={score:w.score,near:w.hazards[0].near,node:w.player.node};
  const aim=w.aim(),preview=w.flightPreview;assert.equal(aim?.n,destination);assert(preview.curved&&preview.points.length>4);maxPreviewSteps=Math.max(maxPreviewSteps,preview.steps);
  assert.deepEqual({score:w.score,near:w.hazards[0].near,node:w.player.node},before,'Prediction cannot mutate the live run');
  // The drawn course may be cut short by the pace's own horizon; what is compared is the prediction.
  const expected=preview.landing;w.release();for(let i=0;i<120*8&&!w.player.node&&w.state==='playing';i++)w.update(step);
  assert.equal(w.player.node,destination);assert.equal(captures[0].perfect,aim.perfect);
  assert(Math.hypot(w.player.x-expected.x,w.player.y-expected.y)<.2,'The curved guide must land where real flight lands');curvedCaptures++;
}
assert(maxPreviewSteps<300,'Curved prediction must remain bounded');
const blockedCurve=curvedFixture(240,false,.32);assert.equal(blockedCurve.w.aim(),null);assert.equal(blockedCurve.w.flightPreview.blocked,'hazard');
const blockedPoint=blockedCurve.w.flightPreview.landing;assert(Math.abs(Math.hypot(blockedPoint.x-70,blockedPoint.y+170)-27)<.02);
blockedCurve.w.release();for(let i=0;i<120*4&&blockedCurve.w.state==='playing';i++)blockedCurve.w.update(step);
assert.equal(blockedCurve.w.reason,'DRAWN INTO A VORTEX','A warning guide must agree with the real collision');

// The curved guide and real flight must agree through a repulsive field too.
function flareFixture(angle){
  const captures=[],w=new OrbitWorld(713,440,860,(type,e)=>{if(type==='capture')captures.push(e);}),origin=w.player.node;
  origin.x=origin.baseX=-57;const destination=w.makeNode(70,-420,50,2,'still');
  w.nodes=[origin,destination];w.lastMain=destination;w.row=2;w.ensureAhead=()=>{};
  w.hazards=[{x:70,y:-170,r:24,kind:'flare',seed:44,phase:.2,near:false}];
  w.player.angle=angle;w.player.dir=-1;w.player.speed=240;w.positionPlayer();w.start();return {w,destination,captures};
}
let flareCaptures=0,flareGrazes=0;
for(let angle=-.02;angle<=.24;angle+=.004){
  const {w,destination}=flareFixture(angle),aim=w.aim(),preview=w.flightPreview,before=w.score;
  if(!aim||aim.n!==destination||!preview.curved)continue;
  const expected=preview.landing;w.release();
  for(let i=0;i<120*8&&!w.player.node&&w.state==='playing';i++)w.update(step);
  assert.equal(w.player.node,destination,'A flare-bent guide must reach the planet it advertises');
  assert(Math.hypot(w.player.x-expected.x,w.player.y-expected.y)<.2,'The flare guide must land where real flight lands');
  if(w.hazards[0].near){assert(w.score>=before+5,'A flare graze earns its once-per-hazard bonus');flareGrazes++;}
  flareCaptures++;
}
assert(flareCaptures>8,'Exercise real flights steered by a repulsive field');
assert(flareGrazes>0,'Close flare passes still count as grazes');
const flareDeath=flareFixture(.12);flareDeath.w.release();
flareDeath.w.hazards=[{x:flareDeath.w.player.x+flareDeath.w.player.vx*.05,y:flareDeath.w.player.y+flareDeath.w.player.vy*.05,r:20,kind:'flare',seed:2,phase:0,near:false}];
for(let i=0;i<15;i++)flareDeath.w.update(step);
assert.equal(flareDeath.w.reason,'SEARED BY A SUNSPOT FLARE','A flare core reports its own loss');

// The curved guide and real flight must agree through a gust too, and a gust must actually bend a
// crossing without ever ending one: a wind-head has no lethal core at all.
function windFixture(angle,dir=Math.PI*.5){
  const captures=[],w=new OrbitWorld(714,440,860,(type,e)=>{if(type==='capture')captures.push(e);}),origin=w.player.node;
  origin.x=origin.baseX=-57;const destination=w.makeNode(70,-420,50,2,'still');
  w.nodes=[origin,destination];w.lastMain=destination;w.row=2;w.ensureAhead=()=>{};
  w.hazards=[{x:70,y:-170,r:30,kind:'wind',dir,seed:45,phase:.2,near:false}];
  w.player.angle=angle;w.player.dir=-1;w.player.speed=240;w.positionPlayer();w.start();return {w,destination,captures};
}
let windCaptures=0,windBent=0;
for(let angle=-.02;angle<=.24;angle+=.004){
  const {w,destination}=windFixture(angle),aim=w.aim(),preview=w.flightPreview;
  if(!aim||aim.n!==destination||!preview.curved)continue;
  windBent++;
  const expected=preview.landing;w.release();
  for(let i=0;i<120*8&&!w.player.node&&w.state==='playing';i++)w.update(step);
  assert.equal(w.player.node,destination,'A wind-bent guide must reach the planet it advertises');
  assert(Math.hypot(w.player.x-expected.x,w.player.y-expected.y)<.2,'The wind guide must land where real flight lands');
  assert(!w.hazards[0].near,'A gust is never grazed, so it never pays the once-per-hazard bonus');
  windCaptures++;
}
assert(windCaptures>8,'Exercise real flights steered by a wind-head');
assert(windBent>8,'A gust must actually put the guide onto its curved prediction');
// Flown across the heart of a gust, the crossing comes out measurably off the line it left on, and
// the run is never lost to it however square the hit. Flown along one it is untouched: these fields
// steer without changing speed, so a force lying along the flight has nothing left to turn — which
// is exactly why a wind-head is laid across its route rather than down it.
{
  const w=new OrbitWorld(715,440,860);w.nodes=[];w.ensureAhead=()=>{};w.state='playing';
  const h={x:0,y:-400,r:30,kind:'wind',dir:0,near:false,seed:1,phase:0};
  w.hazards=[h];const p=w.player;p.node=null;
  p.x=0;p.y=-400-gravityRadius(h)-40;p.vx=0;p.vy=240;p.launch={row:0,sweep:1};p.ink=1;
  const startX=p.x;
  for(let i=0;i<120*4&&w.state==='playing'&&p.y<-400+gravityRadius(h)+40;i++)w.update(step);
  assert(w.state==='playing','A wind-head has no lethal core: flying through its centre cannot end a run');
  assert(Math.abs(p.x-startX)>12,'A crossing flown through a gust is carried off its line: '+(p.x-startX).toFixed(1));
  assert(Math.abs(Math.hypot(p.vx,p.vy)-240)<1e-6,'A gust steers without touching the speed it steers');
  const along=new OrbitWorld(716,440,860);along.nodes=[];along.ensureAhead=()=>{};along.state='playing';
  const g={x:0,y:-400,r:30,kind:'wind',dir:Math.PI/2,near:false,seed:1,phase:0};
  along.hazards=[g];const q=along.player;q.node=null;
  q.x=0;q.y=-400-gravityRadius(g)-40;q.vx=0;q.vy=240;q.launch={row:0,sweep:1};q.ink=1;
  for(let i=0;i<120*4&&along.state==='playing'&&q.y<-400+gravityRadius(g)+40;i++)along.update(step);
  assert(Math.abs(q.x)<1e-9,'A crossing flown straight down a gust is not turned by it at all');
}

// A nebula is inert. It only cuts the drawn guide at its near edge.
function nebulaFixture(withFog){
  const captures=[],w=new OrbitWorld(214,440,860,(type,e)=>{if(type==='capture')captures.push(e);});
  const origin=w.player.node,destination=w.makeNode(0,-300,50,1,'still');
  origin.x=origin.baseX=50-origin.r;w.player.angle=0;w.player.dir=-1;w.player.speed=240;w.positionPlayer();
  w.nodes=[origin,destination];w.lastMain=destination;w.row=1;
  w.nebulas=withFog?[{kind:'nebula',x:50,y:-150,r:70,seed:9,phase:0}]:[];
  w.start();return {w,destination,captures};
}
const fogged=nebulaFixture(true),unfogged=nebulaFixture(false);
const fogAim=fogged.w.aim(),clearAim=unfogged.w.aim();
assert(fogAim?.perfect&&fogAim.n===fogged.destination,'A nebula changes nothing about where the flight goes');
assert.deepEqual({n:fogAim.n.id,perfect:fogAim.perfect,radius:fogAim.radius},{n:clearAim.n.id,perfect:clearAim.perfect,radius:clearAim.radius});
assert.equal(fogged.w.flightPreview.fogged,true);assert.equal(unfogged.w.flightPreview.fogged,false);
const cutPoint=fogged.w.flightPreview.points.at(-1),fullPoint=unfogged.w.flightPreview.points.at(-1);
assert(Math.abs(Math.hypot(cutPoint.x-50,cutPoint.y+150)-70)<1e-6,'The preview stops at the near edge of the cloud');
assert(cutPoint.distance<fullPoint.distance-100,'The guide is cut well short of the landing');
fogged.w.release();for(let i=0;i<120*4&&!fogged.w.player.node&&fogged.w.state==='playing';i++)fogged.w.update(step);
assert.equal(fogged.w.player.node,fogged.destination,'The flight crosses a nebula and captures normally');
assert.equal(fogged.captures[0].perfect,true,'A fogged guide still describes a perfect transfer');

// A perfect transfer reaches a rim tangent without changing direction or speed.
// Test both arrival windings, fast frame-spanning flights, and rough center hits.
function transferFixture(offset,speed=240,drift=false){
  const captures=[],w=new OrbitWorld(101,440,860,(type,e)=>{if(type==='capture')captures.push(e);});
  const origin=w.player.node,destination=w.makeNode(0,-300,50,1,drift?'drift':'still');
  if(drift){destination.amp=18;destination.phase=.4;}
  origin.x=origin.baseX=offset-origin.r;w.player.angle=0;w.player.dir=-1;w.player.speed=speed;w.positionPlayer();
  w.nodes=[origin,destination];w.lastMain=destination;w.row=1;w.start();return {w,destination,captures};
}
for(const offset of [-50,50])for(const speed of [150,240,360]){
  const {w,destination,captures}=transferFixture(offset,speed),guide=w.aim();
  assert(guide?.perfect);assert.equal(guide.n,destination);assert(Math.abs(guide.distance-300)<1e-8);
  w.release();const incoming={vx:w.player.vx,vy:w.player.vy};
  w.update(280/speed);assert.equal(w.player.node,null,'A tangent flight must pass the outer capture rim before joining');
  w.update(20/speed+1e-7);assert.equal(w.player.node,destination);assert.equal(captures[0].perfect,true);
  assert(Math.abs(w.player.x-offset)<1e-7&&Math.abs(w.player.y+300)<1e-7,'Join at the closest rim point without snapping to the center');
  assert(Math.abs(w.player.vx-incoming.vx)<1e-7&&Math.abs(w.player.vy-incoming.vy)<1e-7,'A perfect join must preserve the entire velocity vector');
  for(let i=0;i<120;i++)w.update(step);
  assert(Math.abs(w.player.speed-speed)<1e-7,'Ordinary orbits must not erase earned momentum or auto-accelerate');
}
// An angled arrival that is not a tangent is still the forgiving ordinary capture it has always been.
const roughSlow=transferFixture(25,150),roughFast=transferFixture(25,300);
for(const test of [roughSlow,roughFast]){
  const aim=test.w.aim();
  assert.equal(aim.perfect,false,'An angled, non-tangent flight is an ordinary capture');
  assert.equal(aim.steep,false,'and still joins the orbit');
  assert(aim.angle>GRAZE_MINIMUM&&aim.angle<45,'well inside the forgiving band: '+aim.angle.toFixed(1));
  test.w.release();
  for(let i=0;i<120*3&&!test.w.player.node;i++)test.w.update(step);
  assert.equal(test.w.player.node,test.destination);assert.equal(test.captures[0].perfect,false);
}
// A flight falling straight down at the centre still joins the orbit — there is no way to steer a
// flight once it is released, so turning it away outright only ever stranded a mistimed release with
// nothing left to recover onto. It earns the same base as every accepted arrival, while the guide says
// before the release that its rough impression receives no angle bonus.
// release is made.
for(const offset of [0,10]){
  const skid=transferFixture(offset,240),aim=skid.w.aim();
  assert.equal(aim.n,skid.destination,'The guide still aims the course');
  assert(aim.angle<GRAZE_MINIMUM);
  assert.equal(aim.steep,true,'and marks that the landing will leave a rough impression');
  const inkBefore=skid.w.player.ink,cost=skid.w.inkCost(aim.distance);
  skid.w.release();
  for(let i=0;i<120*3&&skid.w.state==='playing'&&!skid.w.player.node;i++)skid.w.update(step);
  assert.equal(skid.w.player.node,skid.destination,'The orbit is still joined');
  assert.equal(skid.destination.visited,true,'and the planet is spent, exactly as any other capture spends it');
  assert.equal(skid.captures.length,1,'the capture happens');
  assert.equal(skid.captures[0].steep,true,'marked as a rough impression');
  assert(skid.captures[0].gain>0,'and still earns its base score');
  assert.equal(skid.captures[0].angleBonus,0,'but earns no angle bonus');
  assert.equal(skid.destination.impression.quality,0,'and freezes the roughest colour registration on the body');
  assert(skid.w.player.speed<240&&skid.w.player.speed>=BASE_SPEED,'a steep landing sheds speed like any other hard turn');
  assert(Math.abs(skid.w.player.ink-(inkBefore-cost))<1e-6,'no ink dividend is paid for a steep landing');
}
// The three opening targets never turn a landing away, so the choice of pressure cannot be lost to it.
{
  const open=new OrbitWorld(12,440,860,()=>{},true);open.start();
  const target=open.nodes.find(q=>q.difficultyChoice==='classic');
  open.player.x=target.x;open.player.y=target.y+target.r;open.player.vx=0;open.player.vy=-240;
  assert.equal(open.capture(target,{cx:target.x,cy:target.y,vx:0,vy:0,perfect:false,rx:0,ry:target.r,rvx:0,rvy:-240,distance:target.r}),true,
    'A dead-centre arrival on an opening target still sets the pressure');
  // And the guide never warns of a refusal that cannot happen while the choice is pending.
  const offer=new OrbitWorld(12,440,860,()=>{},true);offer.start();
  let warned=0,aimed=0;
  for(let i=0;i<360;i++){
    offer.player.angle=i/360*Math.PI*2;offer.positionPlayer();
    const a=offer.aim();if(!a)continue;aimed++;if(a.steep)warned++;
  }
  assert(aimed>0,'The opening targets must be aimable');
  assert.equal(warned,0,'No opening course is marked as one that will earn nothing');
}
assert.equal(roughFast.captures[0].gain,roughSlow.captures[0].gain*2,'The same landing at twice the speed earns twice the points');
assert(roughFast.w.player.speed<300&&roughFast.w.player.speed>BASE_SPEED,'A sharp capture sheds only some excess momentum');
for(const offset of [-80,80])assert.equal(transferFixture(offset).w.aim(),null,'A flight outside the capture rim must miss');
let driftCaptures=0;
for(let angle=-.22;angle<=.22;angle+=.003){
  const test=transferFixture(50,240,true);test.w.player.angle=angle;test.w.positionPlayer();const aim=test.w.aim();
  if(!aim?.perfect)continue;
  test.w.release();const incoming={vx:test.w.player.vx,vy:test.w.player.vy};
  for(let i=0;i<120*4&&!test.w.player.node&&test.w.state==='playing';i++)test.w.update(step);
  assert.equal(test.w.player.node,test.destination);assert.equal(test.captures[0].perfect,true,'A moving-planet guide must predict the actual tangent capture');
  assert(Math.hypot(test.w.player.vx-incoming.vx,test.w.player.vy-incoming.vy)<.1,'A moving capture preserves velocity within the planet motion remaining in the fixed step');driftCaptures++;
}
assert(driftCaptures>3,'Exercise a real range of moving-planet tangent arrivals');
for(const dir of [-1,1])for(const path of orbitTangents({x:0,y:0,r:57},{x:77,y:-207,r:54},dir)){
  const dx=path.bx-path.x,dy=path.by-path.y;
  assert(Math.abs(path.x*dx+path.y*dy)<1e-8);
  assert(Math.abs((path.bx-77)*dx+(path.by+207)*dy)<1e-8,'Release markers must describe circle-to-circle tangents');
}

const tangent=new OrbitWorld(1);tangent.start();tangent.update(step);
assert.equal(tangent.player.speed,150,'The opening pace is slower than the former 205');
assert.equal(tangent.nodes.find(n=>n.row===2).type,'sling','Introduce speed control on the third planet');
const initial={...tangent.player};assert(tangent.release());const released={...tangent.player};
assert(Math.abs((released.x-initial.node.x)*released.vx+(released.y-initial.node.y)*released.vy)<1e-8,'Release must be tangent');
tangent.update(step);
assert(Math.abs(tangent.player.x-released.x-released.vx*step)<1e-8);
assert(Math.abs(tangent.player.y-released.y-released.vy*step)<1e-8);
assert.equal(tangent.release(),false,'Airborne taps must not alter trajectory');

const idle=new OrbitWorld(2);idle.start();for(let i=0;i<120*40&&idle.state==='playing';i++)idle.update(step);
assert.equal(idle.state,'dead','Waiting forever must lose');assert.equal(idle.reason,'THE DARK CAUGHT UP');
assert(idle.elapsed>6&&idle.elapsed<13,'Opening darkness must give a few learning seconds, then threaten idle play');
const paused=new OrbitWorld(3);paused.start();paused.state='paused';const old=paused.player.x;paused.update(10);assert.equal(paused.player.x,old);assert.equal(paused.elapsed,0);

// ---------- The pace hides the far end of a fast crossing ----------
// At the opening pace the whole course is drawn. As the chart's speed is earned the pen stops setting
// down the far part of it, so a run at full pace commits to the last of a long transfer unseen. What
// is hidden is only what is drawn: the aim and the prediction behind it are untouched, which is what
// lets the guide still be checked against real flight.
{
  const sight=speed=>{const w=new OrbitWorld(13,440,860);w.start();
    const origin=w.player.node,far=w.makeNode(origin.x+origin.r+25,origin.y-700,54,2,'still');
    w.nodes=[origin,far];w.lastMain=far;w.player.angle=0;w.player.dir=-1;w.player.speed=speed;w.positionPlayer();
    const aim=w.aim(),p=w.flightPreview;
    return {aim,fogged:p.fogged,drawn:p.points.at(-1).distance,landing:p.landing,range:w.sightRange()};
  };
  const slow=sight(BASE_SPEED),fast=sight(MAX_SPEED);
  assert.equal(slow.aim?.n.row,2);assert.equal(fast.aim?.n.row,2,'The same planet is aimed at either pace');
  assert.equal(slow.fogged,false,'At the opening pace the whole course is drawn');
  assert(Math.abs(slow.drawn-slow.aim.distance)<1e-6);
  assert.equal(fast.fogged,true,'At the chart top speed the far part of a long crossing is not');
  assert(fast.drawn<slow.drawn*.6,'and a good deal of it is left unset: '+fast.drawn.toFixed(0)+' of '+slow.drawn.toFixed(0));
  assert(Math.abs(fast.drawn-fast.range)<1e-6,'The course is cut exactly at the pace horizon');
  assert(fast.range<slow.range,'The horizon closes in as the pace rises');
  // The fog is what is drawn, never what will happen.
  assert(Math.abs(slow.landing.x-fast.landing.x)<1e-6&&Math.abs(slow.landing.y-fast.landing.y)<1e-6,
    'The predicted landing is the same whether or not the course to it is drawn');
  assert.equal(slow.aim.perfect,fast.aim.perfect);
  assert(Math.abs(slow.aim.angle-fast.aim.angle)<1e-6,'and so is the arrival it predicts');
}

// ---------- The nib and its ink ----------
// A full nib carries 2000 world units, spent by the distance flown rather than the time taken, so
// the same crossing costs the same whether it is flown slowly or at the chart's top speed.
{
  const w=new OrbitWorld(5,440,860);w.start();
  assert.equal(w.inkLevel(),1,'A run is dealt with a full nib');
  assert.equal(w.inkCost(2000),1,'A full nib carries two thousand world units');
  assert.equal(w.inkRange(),2000);
  w.inkMult=1.25;assert.equal(w.inkCost(2000),1.25,'The pressure scales the drain, not the gauge');
  assert.equal(w.inkRange(),1600,'A harder plate reaches less far on the same charge');
  assert.equal(w.inkLevel(),1,'and reads the same full gauge');
}
// Flight spends it; a landing pays a dividend, and a clean tangent arrival pays more than a hard turn.
{
  const spend=(speed)=>{
    const w=new OrbitWorld(6,440,860);w.start();
    w.nodes=[w.player.node];w.player.speed=speed;w.positionPlayer();w.release();
    let flown=0;
    for(let i=0;i<120*4&&w.state==='playing';i++){
      const x=w.player.x,y=w.player.y;w.update(step);flown+=Math.hypot(w.player.x-x,w.player.y-y);
    }
    return {spent:1-w.player.ink,flown};
  };
  const slow=spend(150),fast=spend(300);
  assert(slow.flown>0&&fast.flown>0);
  assert(Math.abs(slow.spent-slow.flown/2000)<1e-9,'Ink is spent by the distance drawn');
  assert(Math.abs(fast.spent-fast.flown/2000)<1e-9);
  assert(Math.abs(slow.spent/slow.flown-fast.spent/fast.flown)<1e-12,
    'The same crossing costs the same ink however fast it is flown');
}
// Running the nib dry in flight ends the run, and the landing is settled first, so a transfer that
// arrives on the last drop stands.
{
  const dry=new OrbitWorld(7,440,860);dry.start();
  dry.nodes=[dry.player.node];dry.player.ink=.02;dry.release();
  for(let i=0;i<120*4&&dry.state==='playing';i++)dry.update(step);
  assert.equal(dry.reason,'THE NIB RAN DRY','An empty nib ends the run in flight');
  const last=new OrbitWorld(8,440,860);last.start();
  const origin=last.player.node,target=last.makeNode(origin.x+origin.r+25,origin.y-600,54,2,'still');
  last.nodes=[origin,target];last.lastMain=target;last.player.angle=0;last.player.dir=-1;last.positionPlayer();
  const aim=last.aim();assert.equal(aim?.n,target);
  last.player.ink=last.inkCost(aim.distance)+1e-4;
  last.release();
  for(let i=0;i<120*10&&last.state==='playing'&&!last.player.node;i++)last.update(step);
  assert.equal(last.player.node,target,'A transfer that arrives on the last drop stands');
  assert.equal(last.state,'playing');
}
// A skipped orbit is flown past at the same distance-based cost as a landing, so it now pays half the
// dividend a landing on it would have, rather than the flight paying full price for dividends it
// never stopped to collect.
{
  const captures=[];
  const w=new OrbitWorld(11,440,860,(type,e)=>{if(type==='capture')captures.push(e);});w.start();
  const origin=w.player.node,target=w.makeNode(origin.x+origin.r+25,origin.y-600,54,4,'still');
  w.nodes=[origin,target];w.lastMain=target;w.player.angle=0;w.player.dir=-1;w.positionPlayer();
  const aim=w.aim();assert.equal(aim?.n,target);assert.equal(aim.steep,false,'the fixture must actually score');
  w.release();
  let flown=0;
  for(let i=0;i<120*10&&w.state==='playing'&&!w.player.node;i++){
    const x=w.player.x,y=w.player.y;w.update(step);flown+=Math.hypot(w.player.x-x,w.player.y-y);
  }
  assert.equal(w.player.node,target,'the long transfer lands');
  assert.equal(captures.length,1);assert.equal(captures[0].skipped,3,'three main orbits lie between them');
  const dividend=(captures[0].perfect?INK_PERFECT_GAIN:INK_CAPTURE_GAIN)*(1+3*.5);
  assert(Math.abs(w.player.ink-Math.min(1,1-w.inkCost(flown)+dividend))<1e-6,
    'each of the three skipped orbits pays half the landing dividend on top of the one landed');
}
// Holding a ring re-charges the nib; a slingshot star fills it over its lap; a landing pays back more
// for a tangent arrival than for a hard turn. Dwelling is how ink is bought, and time is what it costs.
{
  const w=new OrbitWorld(9,440,860);w.start();w.player.ink=.2;
  w.update(1);assert(Math.abs(w.player.ink-.33)<1e-9,'A held orbit re-charges the nib slowly');
  const star=new OrbitWorld(10,440,860);star.start();
  star.player.node.type='sling';star.player.ink=.2;star.update(1);
  assert(Math.abs(star.player.ink-1.05+.05)<1e-9||star.player.ink===1,'A slingshot star fills the nib far faster');
  assert(star.player.ink>w.player.ink,'and faster than an ordinary ring');
  assert(star.player.ink<=1,'The nib never holds more than a full charge');
}
// The guide prices the transfer it is drawing and marks the one the nib cannot pay for. It still aims
// it and still draws it: the choice to fly a course that stops short stays the player's to make.
{
  const w=new OrbitWorld(11,440,860);w.start();
  const origin=w.player.node,far=w.makeNode(origin.x+origin.r,origin.y-1500,54,2,'still');
  w.nodes=[origin,far];w.lastMain=far;w.player.angle=0;w.player.dir=-1;w.positionPlayer();
  const rich=w.aim();
  assert.equal(rich?.n,far,'The guide reaches the distant planet');
  assert.equal(rich.dry,false,'A full nib pays for it');
  assert(Math.abs(w.flightPreview.inkCost-w.inkCost(rich.distance))<1e-9);
  w.player.ink=.2;
  const poor=w.aim();
  assert.equal(poor?.n,far,'The same course is still aimed when the nib cannot pay for it');
  assert.equal(poor.dry,true,'and is marked dry');
  assert.equal(w.flightPreview.dry,true);
  assert(Math.abs(w.flightPreview.inkRange-400)<1e-9,'The preview says how far the ink still reaches');
  assert.equal(w.release(),true,'A dry course may still be flown');
}

// Charge follows angular travel, caps at one lap, and changes actual momentum.
const chargeEvents=[],charged=new OrbitWorld(4,440,860,(type,e)=>chargeEvents.push({type,...e}));
charged.player.node.type='sling';charged.update(1);assert.equal(charged.charge(),0,'Ready mode cannot pre-charge');charged.start();
assert.equal(charged.launchVelocity().factor,1);
for(let i=0;i<45;i++)charged.update(step);
assert(charged.charge()>0&&charged.charge()<1);
assert(Math.abs(charged.player.speed-(BASE_SPEED+STAR_GAIN*charged.charge()))<1e-8,'The star accelerates during the orbit, in proportion to angular travel');
charged.state='paused';const partialCharge=charged.charge();charged.update(2);assert.equal(charged.charge(),partialCharge);
charged.state='playing';while(charged.charge()<1)charged.update(step);
for(let i=0;i<120;i++)charged.update(step);
assert.equal(charged.charge(),1);assert.equal(chargeEvents.filter(e=>e.type==='charged').length,1);
const predicted=charged.launchVelocity();assert(Math.abs(predicted.factor-1.6)<1e-8);assert(Math.abs(predicted.speed-240)<1e-8);charged.release();
assert.equal(charged.player.vx,predicted.vx);assert.equal(charged.player.vy,predicted.vy);assert.equal(charged.player.launch.charge,1);
const launchPoint={x:charged.player.x,y:charged.player.y};charged.update(step);
assert(Math.abs(charged.player.x-launchPoint.x-predicted.vx*step)<1e-8);
assert(Math.abs(charged.player.y-launchPoint.y-predicted.vy*step)<1e-8);
assert.equal(charged.charge(),0);assert.equal(charged.release(),false);
charged.capture(charged.nodes.find(n=>!n.visited));assert.equal(charged.player.orbitSweep,0);assert(charged.player.speed<=360);
const capped=new OrbitWorld(5);capped.player.node.type='sling';capped.player.speed=330;capped.start();
while(capped.charge()<1)capped.update(step);assert.equal(capped.player.speed,MAX_SPEED,'Stars have a finite speed cap');
for(let i=0;i<120;i++)capped.update(step);assert.equal(capped.player.speed,MAX_SPEED);assert.equal(capped.score,0,'Orbiting cannot farm points');
const assisted=new OrbitWorld(6);assisted.player.speed=358;assisted.player.angle=-Math.PI/2;assisted.player.dir=1;assisted.player.node.vx=16;assisted.positionPlayer();
assert(assisted.player.vx>MAX_SPEED);const limitedLaunch=assisted.launchVelocity();
assert(Math.abs(limitedLaunch.speed-MAX_SPEED)<1e-8);assert(Math.abs(limitedLaunch.vx*assisted.player.vy-limitedLaunch.vy*assisted.player.vx)<1e-8,'Bounding a moving-planet assist must keep its heading');
assisted.start();assisted.release();assert(Math.abs(Math.hypot(assisted.player.vx,assisted.player.vy)-MAX_SPEED)<1e-8);

// A clear 1,800-unit transfer used to die at 3.6 seconds, before reaching its
// destination. Flight duration must never override a valid distant landing.
function distantTransfer(boosted=true){
  const captures=[],w=new OrbitWorld(99,440,860,(type,e)=>{if(type==='capture')captures.push(e);});
  const origin=w.player.node;origin.type=boosted?'sling':'still';
  w.player.angle=0;w.player.dir=-1;w.player.orbitSweep=Math.PI*2;
  w.player.speed=boosted?240:150;
  w.positionPlayer();
  // Offset enough to cross the rim at about 27 degrees: an ordinary capture, as this fixture wants,
  // but not the near-radial drop the rim now turns away.
  const destination=w.makeNode(origin.x+origin.r+25,-1800,54,8,'still');
  w.nodes=[origin,destination];w.lastMain=destination;w.row=8;w.start();
  return {w,destination,captures};
}
const longFlightSeconds=[];
for(const boosted of [true,false]){
  const {w,destination,captures}=distantTransfer(boosted);
  assert.equal(w.aim()?.n,destination,'The guide must include distant generated planets');
  w.release();for(let i=0;i<240;i++)w.update(step);
  w.state='paused';const frozen={x:w.player.x,y:w.player.y,time:w.player.flightTime};w.update(10);
  assert.deepEqual({x:w.player.x,y:w.player.y,time:w.player.flightTime},frozen);w.state='playing';
  for(let i=0;i<120*15&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.state,'playing');assert.equal(w.player.node,destination);
  assert(w.player.flightTime>3.6,'Regression must cross the former automatic death deadline');
  longFlightSeconds.push(w.player.flightTime);
  assert.equal(captures.length,1);assert.equal(captures[0].skipped,7);assert.equal(captures[0].skipBonus,boosted?112:70);
  assert.equal(w.score,captures[0].gain+captures[0].squareBonus,'Landing earns base, its progressive angle award and seven skipped-orbit rewards');
  const score=w.score;assert.equal(w.capture(destination),false);assert.equal(w.score,score,'Long bonuses cannot be farmed');
  assert(Math.abs((w.player.x-destination.x)*w.player.vx+(w.player.y-destination.y)*w.player.vy)<1e-7,'Captured velocity must immediately match the new orbit');
}
// The hazard sits on the flight's own line, which is the launch tangent rather than the destination's
// centre now that the fixture crosses the rim at an angle.
const longHazard=distantTransfer();longHazard.w.hazards.push({x:longHazard.w.player.x,y:-1620,r:14,near:false});
assert.equal(longHazard.w.aim(),null,'A distant hazard must block the guide');longHazard.w.release();
for(let i=0;i<120*12&&longHazard.w.state==='playing';i++)longHazard.w.update(step);
assert(longHazard.w.player.flightTime>3.6);assert.equal(longHazard.w.reason,'DRAWN INTO A VORTEX');assert.equal(longHazard.captures.length,0);
const outside=new OrbitWorld(12);outside.start();outside.player.angle=-Math.PI/2;outside.player.dir=1;outside.release();
for(let i=0;i<120*3&&outside.state==='playing';i++)outside.update(step);
assert.equal(outside.reason,'LEFT THE STAR CHART','A shot leaving the chart still ends the run');
for(const [from,to,expected]of [[0,1,0],[0,2,1],[0,4,3],[3,4.5,1],[3.5,5,1]]){
  const {w,destination,captures}=distantTransfer();w.player.node.row=from;destination.row=to;w.release();
  for(let i=0;i<120*12&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.player.node,destination);assert.equal(captures[0].skipped,expected);assert.equal(captures[0].skipBonus,expected*16,'Count each intervening full orbit, including gold detour endpoints, with the speed reward');
}

// A real new run opens on three parallel targets, one per pressure, in place of the ordinary
// single first node. Course generation waits until one is captured; that capture sets the run's
// difficulty, clears the two unchosen targets, and becomes the new main node exactly as an
// ordinary capture would.
for(const choice of ['relaxed','classic','hardcore']){
  const emitted=[],w=new OrbitWorld(55,440,860,(type,e)=>{if(type==='difficulty')emitted.push(e.value);},true);
  const paths=w.nodes.filter(n=>n.difficultyChoice);
  assert.equal(paths.length,3,'A real new run opens on three difficulty targets');
  assert.equal(paths.map(n=>n.difficultyChoice).sort().join(','),'classic,hardcore,relaxed');
  assert.equal(w.difficultyPending,true,'The choice is pending until one target is captured');
  const rowBefore=w.row;w.start();w.ensureAhead();
  assert.equal(w.row,rowBefore,'Course generation must wait for the difficulty choice');
  const target=paths.find(n=>n.difficultyChoice===choice);
  w.player.x=target.x;w.player.y=target.y;w.player.vx=0;w.player.vy=-1;
  assert.equal(w.capture(target),true,'Capturing a difficulty target is an ordinary capture');
  assert.equal(w.difficultyPending,false,'Capturing a target resolves the pending choice');
  assert.deepEqual(emitted,[choice],'The chosen pressure is announced exactly once, and only the chosen one');
  assert.equal(w.nodes.filter(n=>n.difficultyChoice).length,1,'The two unchosen targets are removed');
  assert.equal(w.nodes.some(n=>n.difficultyChoice&&n!==target),false,'Only the captured target remains');
  assert.equal(w.lastMain,target,'The captured target becomes the new main node');
  const rowAfter=w.row;w.ensureAhead();assert(w.row>rowAfter,'Course generation resumes once the choice is made');
}
{
  // Daily runs and every fixed layout keep the ordinary single-node opening.
  const daily=new OrbitWorld(56,440,860,()=>{},false);
  assert.equal(daily.nodes.some(n=>n.difficultyChoice),false,'A run started with offerDifficulty off skips the choice');
  assert.equal(daily.difficultyPending,undefined);
}

// Missing a capture outright is harsher than only missing the perfect band inside it, so Tiro's
// capMult widens the whole forgiving window generateRow and makeNode grant a node, on top of the
// narrower perfect band widened by perfectMult. Two worlds built from the same seed generate
// identical geometry, so the only thing capMult may change is the capture radius, never the
// drawn radius or position a node is placed at.
{
  const seed=777;
  const plain=new OrbitWorld(seed,440,860,()=>{},false);
  const widened=new OrbitWorld(seed,440,860,()=>{},false);
  widened.capMult=1.3;
  const pBefore=plain.nodes.length,wBefore=widened.nodes.length;
  plain.generateRow();widened.generateRow();
  const pNew=plain.nodes.slice(pBefore),wNew=widened.nodes.slice(wBefore);
  assert(pNew.length>0,'generateRow must add at least one node');
  assert.equal(wNew.length,pNew.length,'The same seed generates the same nodes regardless of capMult');
  for(let i=0;i<pNew.length;i++){
    assert.equal(wNew[i].x,pNew[i].x);assert.equal(wNew[i].r,pNew[i].r,'capMult must never change a node\'s drawn radius');
    assert(Math.abs(wNew[i].cap-pNew[i].cap*1.3)<1e-9,'capMult scales the forgiving capture window by exactly the difficulty multiplier');
  }
}


const {totalCaptures,perfects,maxNodes,maxHazards}=await pRoute;
const {chartCompletions,deepCharts,deepRows,deepFiguresSize}=await pDetourDeep;

// The catalogue is fixed by the run seed and exhausts itself before repeating.
assert(CONSTELLATIONS.length>=12&&CONSTELLATIONS.every(c=>c.name===c.name.toUpperCase()&&c.shape.length===3));
assert.equal(new Set(CONSTELLATIONS.map(c=>c.name)).size,CONSTELLATIONS.length,'Every catalogue figure has its own name');
const orderA=new OrbitWorld(4242),orderB=new OrbitWorld(4242),orderC=new OrbitWorld(4243);
assert.deepEqual(orderA.catalogueOrder,orderB.catalogueOrder,'A seed fixes the figure order');
assert.notDeepEqual(orderA.catalogueOrder,orderC.catalogueOrder,'Different runs order the catalogue differently');
assert.equal(new Set(orderA.catalogueOrder).size,CONSTELLATIONS.length);
for(let region=0;region<4;region++)assert.equal(orderA.catalogueFor(region),region,'The opening four regions keep their own figures');
const drawn=[];for(let region=4;region<4+CONSTELLATIONS.length;region++)drawn.push(orderA.catalogueFor(region));
assert.equal(new Set(drawn).size,CONSTELLATIONS.length,'No figure repeats until the catalogue is exhausted');
assert.equal(orderA.catalogueFor(4+CONSTELLATIONS.length),orderA.catalogueFor(4),'The catalogue then starts again');
// Omitting varyOpening — every existing fixture and every ordinary run — must read exactly as it
// always has: the same fixed second and third planets, whatever the seed.
for(const seed of [1,4242,99999]){
  const w=new OrbitWorld(seed);
  assert.equal(w.nodes.find(n=>n.row===1).x,77,'An unvaried opening keeps its fixed second planet: seed '+seed);
  assert.equal(w.nodes.find(n=>n.row===2).x,-75,'An unvaried opening keeps its fixed third planet: seed '+seed);
}
// varyOpening lets the same seed draw both instead: a seed fixes what it draws, two different seeds
// need not agree, and the whole twelve-figure catalogue — the first four regions included — keeps the
// no-repeat-before-exhaustion promise an ordinary seed already keeps for the eight later ones alone.
const variedA=new OrbitWorld(4242,440,860,()=>{},false,true),variedB=new OrbitWorld(4242,440,860,()=>{},false,true),variedC=new OrbitWorld(4243,440,860,()=>{},false,true);
assert.deepEqual(variedA.catalogueOrder,variedB.catalogueOrder,'A seed fixes a varied opening exactly as it fixes an ordinary one');
assert.notDeepEqual(variedA.catalogueOrder,variedC.catalogueOrder,'Different seeds still vary the drawn order');
assert.equal(new Set(variedA.catalogueOrder).size,CONSTELLATIONS.length,'A varied opening still shuffles the whole catalogue, not a subset of it');
const variedDrawn=[];for(let region=0;region<CONSTELLATIONS.length;region++)variedDrawn.push(variedA.catalogueFor(region));
assert.equal(new Set(variedDrawn).size,CONSTELLATIONS.length,'No figure repeats before the catalogue is exhausted, first four regions included');
assert.equal(variedA.catalogueFor(CONSTELLATIONS.length),variedA.catalogueFor(0),'The catalogue then starts again, exactly as the unvaried opening already does');

// ---------- The chart is cut for the pace it expects ----------
// Every transfer is drawn to take about the same time to fly at the pace the chart is cut for, so the
// gulfs open as the run climbs instead of staying the length they were at the opening.
{
  const w=new OrbitWorld(4242,440,860);while(w.row<60)w.generateRow();
  const main=new Map();
  for(const n of w.nodes)if(Number.isInteger(n.row)&&n.type!=='gold'&&n.type!=='shield'&&n.routeRole!=='star')main.set(n.row,n);
  const gap=row=>{const a=main.get(row-1),b=main.get(row);return a&&b?Math.hypot(b.baseX-a.baseX,b.baseY-a.baseY)-a.r-b.r:null;};
  const early=[4,5,6].map(gap),late=[40,41,42].map(gap);
  assert(early.every(v=>v!==null)&&late.every(v=>v!==null));
  const mean=v=>v.reduce((s,x)=>s+x,0)/v.length;
  assert(mean(late)>mean(early)*1.8,'A deep crossing must be far longer than an opening one: '+mean(early).toFixed(0)+' then '+mean(late).toFixed(0));
  // The orbits open with the chart, so a wider ring is swept more slowly and presents a larger rim
  // from further off. Without this the release window would halve as the gulfs doubled.
  assert(main.get(40).r>main.get(5).r,'Orbits open with the chart rather than shrinking');
  assert(main.get(40).cap-main.get(40).r>main.get(5).cap-main.get(5).r,'and their capture bands open too');
  // A slingshot ring is the exception: its charge is earned per lap, so a wider one would only cost
  // more time against the flood for the same 90 units of speed.
  const stars=[...main.values()].filter(n=>n.type==='sling');
  assert(stars.length>=4&&stars.every(n=>n.r===57),'Slingshot rings keep their size whatever the chart does');
}
// The pace is a property of the row and not of the traveller, which is what the daily plate rests on:
// two players opening the same seed are dealt the same plate, and how one of them flies cannot change
// the chart the other is given.
{
  const plate=()=>{const w=new OrbitWorld(20260904,440,860);while(w.row<40)w.generateRow();
    return JSON.stringify(w.nodes.map(n=>[n.row,n.baseX,n.baseY,n.r,n.type]));};
  assert.equal(plate(),plate(),'One seed deals one chart');
  const flown=new OrbitWorld(20260904,440,860);flown.start();
  for(let i=0;i<120*30&&flown.state==='playing';i++){
    if(flown.player.node&&flown.aim()?.perfect)flown.release();
    flown.update(step);
  }
  while(flown.row<40)flown.generateRow();
  const untouched=new OrbitWorld(20260904,440,860);while(untouched.row<40)untouched.generateRow();
  const deep=w=>JSON.stringify([...w.nodes].filter(n=>n.row>=30).map(n=>[n.row,n.baseY]).sort());
  assert.equal(deep(flown),deep(untouched),'How a run is flown cannot change the chart it is dealt');
}
// The observation clock rides the body released, never the generation that follows it: two flights of
// one seed that hold the opening body for different fractions of SWEEP_FULL must document it
// differently, yet the chart dealt beneath them — the same fields plate() above compares — must still
// come out identical.
{
  const chart=w=>JSON.stringify(w.nodes.map(n=>[n.row,n.baseX,n.baseY,n.r,n.type]));
  const brief=new OrbitWorld(20260905,440,860);brief.start();
  brief.player.orbitSweep=SWEEP_FULL*.25;brief.release();
  const lingering=new OrbitWorld(20260905,440,860);lingering.start();
  lingering.player.orbitSweep=SWEEP_FULL*1.5;lingering.release();
  while(brief.row<40)brief.generateRow();
  while(lingering.row<40)lingering.generateRow();
  assert.notEqual(brief.nodes[0].documented,lingering.nodes[0].documented,'The two flights must actually leave different documented fractions on the opening body, or this fixture proves nothing');
  assert.equal(chart(brief),chart(lingering),'How the opening body was held cannot change the chart dealt beneath it');
}
// A sheet made narrower must not leave orbits standing outside its own edge, where a run is lost.
{
  const w=new OrbitWorld(31,1280,860);w.start();
  for(let i=0;i<120*30&&w.state==='playing';i++){
    if(w.player.node&&w.aim()?.perfect)w.release();
    w.update(step);
  }
  const before=w.nodes.map(n=>n.baseX);
  assert(w.nodes.some(n=>Math.abs(n.baseX)+n.r>440/2+16),'The wide sheet must lay orbits beyond a narrow one');
  w.resize(440,860);
  assert(w.nodes.some((n,i)=>n.baseX!==before[i]),'Narrowing the sheet must actually move what stood outside it');
  for(const n of w.nodes)assert(Math.abs(n.baseX)+n.r+n.amp<=440/2+16,'Every orbit is pulled inside the narrower chart');
  for(const h of w.hazards)assert(Math.abs(h.x)+h.r<=440/2+16);
  if(w.player.node)assert(Math.abs(w.player.x)<=440/2+16,'and the traveller rides its own orbit in');
}

// Generation of the later hazard kinds. The wind-heads are placed on their own cadence, the way a
// nebula is, so the vortex/flare alternation is read off the lethal hazards alone.
let flareRows=0,holeRows=0,windRows=0,nebulaCount=0;
for(let seed=1;seed<=60;seed++){
  const w=new OrbitWorld(seed);while(w.row<60)w.generateRow();
  const lethal=w.hazards.filter(h=>hazardKind(h).lethal),later=lethal.filter(h=>h.row>=16);
  assert(lethal.filter(h=>h.row<16).every(h=>h.kind==='vortex'),'Flares only appear from the third region');
  for(let i=1;i<later.length;i++)assert(later[i].kind!==later[i-1].kind,'Flares alternate with vortices');
  flareRows+=w.hazards.filter(h=>h.kind==='flare').length;holeRows+=w.hazards.filter(h=>h.kind==='vortex').length;
  const winds=w.hazards.filter(h=>h.kind==='wind');windRows+=winds.length;
  for(const g of winds){
    assert(g.row>=20&&g.row%5===3,'Wind-heads start at row 20 and appear at most once every five rows');
    assert(g.r>=16&&g.r<=34,'A wind-head is 16 to 34 units across its radius');
    assert(Number.isFinite(g.dir),'A wind-head blows one settled way');
    assert.equal(hazardKind(g).lethal,false,'A wind-head kills nothing');
    // It is the whole field that is kept clear, not just the head: a gust over a capture band would
    // bend the arrival itself, and two fields overlapping would be read at once.
    const field=gravityRadius(g);
    for(const q of w.nodes)assert(Math.hypot(g.x-q.baseX,g.y-q.baseY)>=q.cap+q.amp+field-1e-9,'A wind field never covers a capture band or a drift envelope');
    for(const h of w.hazards)if(h!==g)assert(Math.hypot(g.x-h.x,g.y-h.y)>=gravityRadius(h)+field-1e-9,'Two hazard fields are never read at once');
    for(const q of w.nebulas)assert(Math.hypot(g.x-q.x,g.y-q.y)>=q.r+field-1e-9,'A wind field never lies under a cloud');
  }
  assert.equal(new Set(winds.map(g=>g.row)).size,winds.length,'At most one wind-head per row');
  nebulaCount+=w.nebulas.length;
  for(const g of w.nebulas){
    assert.equal(g.kind,'nebula');assert(g.r>=60&&g.r<=90,'A nebula patch is 60 to 90 units across its radius');
    assert(g.row>=12&&g.row%4===0,'Nebulas start at row 12 and appear at most once every four rows');
    for(const q of w.nodes)assert(Math.hypot(g.x-q.baseX,g.y-q.baseY)>=q.cap+q.amp+g.r,'A nebula never covers a capture band or a drift envelope');
    for(const h of w.hazards)assert(Math.hypot(g.x-h.x,g.y-h.y)>=h.r+g.r,'A nebula never sits on a hazard');
  }
  assert.equal(new Set(w.nebulas.map(g=>g.row)).size,w.nebulas.length,'At most one nebula per row');
}
assert(flareRows>60&&holeRows>60,'Both lethal hazard kinds must be common past the third region');
assert(windRows>=120,'Wind-heads must actually appear: '+windRows);
assert(nebulaCount>=120,'Nebula patches must actually appear: '+nebulaCount);

// A hazard may sit on one of the ways between two main nodes and shut it, from row 12 and only on
// every third row. What it may never do is close the last way through: whichever side it leaves open
// has to be flyable both ways it can be flown — a smooth tangent for a perfect transfer and a
// centre-directed line for a player not yet flying them — and clear of the whole gravity field, not
// merely of the lethal core, or the flight would be bent into the hazard it was drawn around.
let hazardsPlaced=0,routesClosed=0;
for(let seed=1;seed<=120;seed++){
  const w=new OrbitWorld(seed,440,860);
  const rowOf=new Map(),placed=[];
  // Only the lethal hazards go through the route-closing placement; a wind-head is put on a route
  // deliberately and is exempt, since it cannot shut one.
  while(w.row<70){const before=w.hazards.length;w.generateRow();for(const h of w.hazards.slice(before))if(hazardKind(h).lethal)placed.push(h);}
  for(const n of w.nodes)if(Number.isInteger(n.row)&&n.type!=='gold'&&n.type!=='shield'&&n.routeRole!=='star')rowOf.set(n.row,n);
  for(const h of placed){
    const n=rowOf.get(h.row),prev=rowOf.get(h.row-1);if(!n||!prev)continue;
    hazardsPlaced++;
    const smooth=[...orbitTangents(prev,n,1),...orbitTangents(prev,n,-1)].map(p=>pointSegment(h.x,h.y,p.x,p.y,p.bx,p.by));
    const direct=tangentPaths(prev,n).map(p=>pointSegment(h.x,h.y,p.x,p.y,n.x,n.y));
    const kill=h.r+prev.amp+n.amp+25,free=gravityRadius(h)+prev.amp+n.amp+10;
    if(!smooth.concat(direct).some(d=>d<kill))continue;
    routesClosed++;
    assert(h.row>=12,'No route is closed before row 12: row '+h.row+' seed '+seed);
    assert.equal(h.row%3,2,'A route is only closed on every third row: row '+h.row+' seed '+seed);
    assert(smooth.some(d=>d>=free),'A closed crossing must leave a smooth tangent clear of the field: seed '+seed+' row '+h.row);
    assert(direct.some(d=>d>=free),'A closed crossing must leave a centred line clear of the field: seed '+seed+' row '+h.row);
  }
}
assert(routesClosed>200,'Hazards must actually close routes, not merely be allowed to: '+routesClosed);
assert(routesClosed<hazardsPlaced*.6,'A closed route stays an event, not the standing state of the chart: '+routesClosed+'/'+hazardsPlaced);

const {boostedTransfers}=await pSling;
const {totalCaptures:variedCaptures,variedOpenings,variedFigures}=await pVaried;

const missed=new OrbitWorld(77);while(missed.row<7)missed.generateRow();missed.start();
const partial=missed.constellations[0];missed.capture(partial.stars[0]);missed.capture(partial.exit);
assert(partial.expired,'Leaving an incomplete chart expires the objective');
missed.capture(partial.stars[1]);missed.capture(partial.stars[2]);assert.equal(missed.constellationsCompleted,0);assert.equal(missed.darknessGrace,0);
const respite=new OrbitWorld(78);respite.start();respite.elapsed=5;respite.floorY=110;respite.darknessGrace=4;
respite.update(.25);assert(respite.floorY>110,'The reward must move visible darkness away');
respite.state='paused';const frozenFloor=respite.floorY,frozenGrace=respite.darknessGrace;respite.update(2);
assert.equal(respite.floorY,frozenFloor);assert.equal(respite.darknessGrace,frozenGrace,'Pausing preserves the reprieve');
respite.state='playing';for(let i=0;i<120*4;i++)respite.update(step);
assert.equal(respite.darknessGrace,0);const recoveredFloor=respite.floorY;respite.update(step);assert(respite.floorY<recoveredFloor,'Darkness resumes after the reward');

// A skipped orbit also banks a capped, decaying head start on the flood: a burst of skips keeps the
// pursuit off-screen for a few seconds instead of it being re-painted at the sill next frame.
{
  const w=new OrbitWorld(81,440,860);w.start();
  const origin=w.player.node,target=w.makeNode(origin.x+origin.r+25,origin.y-900,54,6,'still');
  w.nodes=[origin,target];w.lastMain=target;w.player.angle=0;w.player.dir=-1;w.positionPlayer();
  const aim=w.aim();assert.equal(aim?.n,target);assert.equal(aim.steep,false,'the fixture must actually score');
  w.elapsed=5;w.release();
  for(let i=0;i<120*10&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.player.node,target,'the long transfer lands');
  assert(w.darknessLead>259&&w.darknessLead<=260,'five skipped orbits at 55 each are capped at 260, not stacked without limit');
  // Force the camera far ahead, as the skips just flown would, and confirm the floor is let to trail
  // behind the ordinary 25-unit slack rather than being snapped back to the sill immediately.
  w.cameraY-=600;const bound=w.cameraY+w.height-25;w.floorY=bound+w.darknessLead-5;
  w.update(step);
  assert(w.floorY>bound+1,'the banked lead must widen the clamp, not just the ordinary 25-unit slack');
  // Put the camera back to an ordinary trailing distance — the forced value above exists only to
  // prove the clamp, and pinning the floor near the player every tick keeps idle chase from ending
  // the run — so the credit's own leak, not a collision, is what the next check observes.
  w.cameraY=w.player.y-w.height*.57;
  for(let i=0;i<120*15&&w.darknessLead>0;i++){w.floorY=w.player.y+400;w.update(step);}
  assert.equal(w.state,'playing');assert.equal(w.darknessLead,0,'the head start leaks away rather than standing forever');
  w.floorY=w.cameraY+w.height+50;w.update(step);
  assert(w.floorY<=w.cameraY+w.height-25+1e-6,'once spent, the ordinary slack is all that is left');
}

// ---------- The charge carried against the rising dark ----------
// The third carried charge answers the one loss the other two do not, and the one most runs actually end
// on: the flood itself. It is dealt off the main line every nineteenth row, arms one charge at a time, and
// is spent at the moment the dark would have taken the traveller — driving the waterline back down the
// sheet and holding it off for a reprieve rather than ending the run there.
{
  let dealt=0;
  for(let seed=1;seed<=12;seed++){
    const w=new OrbitWorld(seed,440,860);while(w.row<44)w.generateRow();
    for(const n of w.nodes)if(n.type==='dawn'){
      dealt++;
      assert.equal((n.row+.5-18)%32,0,'A charge against the dark hangs off the eighteenth row and every thirty-second after it');
      assert(n.row>17,'and never before the row a median run reaches');
      assert(!w.nodes.some(q=>q!==n&&Math.hypot(q.x-n.x,q.y-n.y)<=q.r+q.amp+70),'and is cut clear of everything already on the chart');
    }
  }
  assert(dealt>=12,'The chart deals the charge wherever it has room for it: '+dealt);
}
{
  const events=[];
  const w=new OrbitWorld(55,440,860,type=>{if(type==='dawn'||type==='dawnBreak')events.push(type);});w.start();
  const origin=w.player.node,charge=w.makeNode(origin.x+origin.r+25,origin.y-400,28,6,'dawn');
  w.nodes=[origin,charge];w.lastMain=charge;w.player.angle=0;w.player.dir=-1;w.positionPlayer();
  assert.equal(w.aim()?.n,charge,'the fixture must actually reach the charge');
  w.release();
  for(let i=0;i<120*8&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.player.node,charge,'the flight lands on the charge');
  assert.equal(w.player.dawnArmed,true,'taking the orbit arms one charge');
  assert.deepEqual(events,['dawn'],'and says so exactly once');
  // The worst case the rescue has to survive is the one where the flood is already trailing the camera by
  // everything the ordinary clamp allows: the traveller at the very sill with a full skip credit banked. The
  // charge has to open that floor further on its own, or it would buy nothing at all where it is needed most.
  w.darknessLead=260;w.cameraY=w.player.y-w.height+25-260;w.floorY=w.player.y-100;
  w.update(step);
  assert.equal(w.state,'playing','A charge in hand turns the flood back rather than ending the run');
  assert.equal(w.player.dawnArmed,false,'and is spent doing it');
  assert.deepEqual(events,['dawn','dawnBreak']);
  assert(w.floorY-w.player.y>100,'the waterline is driven clear below the traveller: '+(w.floorY-w.player.y).toFixed(0));
  assert.equal(w.darknessGrace,DARKNESS_RESCUE_GRACE,'and then held off for a reprieve');
  for(let i=0;i<120*3&&w.state==='playing';i++)w.update(step);
  assert.equal(w.state,'playing','The reprieve is real time, not one frame of it');
  // Only one, and only ever the one loss it answers: the next time the flood arrives it takes the run.
  w.floorY=w.player.y-100;w.update(step);
  assert.equal(w.state,'dead');assert.equal(w.reason,'THE DARK CAUGHT UP');
  assert.deepEqual(events,['dawn','dawnBreak'],'a spent charge is not spent twice');
}
{
  // The trailing room a rescue grants is not the credit a skipped orbit banks, and a skip flown while it
  // is still standing must not cut it back to what skipping alone is allowed to hold.
  const {w,destination}=distantTransfer(false);
  w.release();
  for(let i=0;i<120*20&&w.state==='playing'&&!w.player.node;i++){w.update(step);w.darknessLead=400;}
  assert.equal(w.player.node,destination,'the long transfer lands');
  assert(w.darknessLead>300,'seven skipped orbits must not cut back room the flood was already being held off by: '+w.darknessLead.toFixed(0));
}

// Explicit hazard contact and disappearing-node deadline.
const hit=new OrbitWorld(9);hit.start();hit.release();hit.hazards.push({x:hit.player.x+hit.player.vx*.05,y:hit.player.y+hit.player.vy*.05,r:10,near:false});
for(let i=0;i<15;i++)hit.update(step);assert.equal(hit.state,'dead');assert.equal(hit.reason,'DRAWN INTO A VORTEX');
const fade=new OrbitWorld(8);fade.start();fade.player.node.type='fading';fade.player.orbitTime=4.49;fade.update(.02);assert.equal(fade.reason,'THE ORBIT FADED');

// n.documented freezes the fraction of SWEEP_FULL an orbit actually held, the moment the traveller
// lets go of it: a partial hold documents partially, and one held past a full two thirds of a turn
// still documents at exactly one, never past it.
{
  const partial=new OrbitWorld(106);partial.start();
  const n=partial.player.node;partial.player.orbitSweep=SWEEP_FULL*.4;partial.release();
  assert.equal(n.documented,.4,'A released body documents exactly the fraction of SWEEP_FULL it held');
}
{
  const overheld=new OrbitWorld(107);overheld.start();
  const n=overheld.player.node;overheld.player.orbitSweep=SWEEP_FULL*1.3;overheld.release();
  assert.equal(n.documented,1,'An orbit held past SWEEP_FULL still documents at one and never beyond it');
}
// A body's documented fraction is frozen at release and nothing captured afterwards can touch it: the
// player's own sweep is zeroed by the very next capture, and a body that went on reading it live would
// blank the instant the traveller landed anywhere else.
{
  const w=new OrbitWorld(108);w.start();
  const first=w.player.node;w.player.orbitSweep=SWEEP_FULL*.7;w.release();
  const documented=first.documented,second=w.nodes.find(q=>q!==first&&!q.visited);
  w.capture(second);
  assert.equal(first.documented,documented,'A later capture must never rewrite an earlier body\'s documented fraction');
}
// Dying while still in orbit is not a release: die() never lets go of p.node, so a body held at death
// carries no frozen fraction at all and the renderer's only truth is the live orbitSweep it can still read.
{
  const w=new OrbitWorld(109);w.start();
  const n=w.player.node;n.type='fading';w.player.orbitTime=4.49;w.player.orbitSweep=SWEEP_FULL*.55;
  w.update(.02);
  assert.equal(w.state,'dead','A fading orbit held past 4.5s of dwell ends the run');
  assert.equal(w.player.node,n,'Dying in orbit must leave the node on the player rather than clear it');
  assert.equal(n.documented,undefined,'A body died on rather than released from is never frozen onto');
}
// A body neither captured nor released carries no documented fraction at all, which is exactly what
// the renderer's own (n.documented||0) turns into nothing drawn.
{
  const w=new OrbitWorld(110);w.start();
  const untouched=w.nodes.find(n=>!n.visited);
  assert.equal(untouched.documented,undefined,'An untouched body carries no documented fraction');
  assert.equal(untouched.documented||0,0,'A missing documented fraction reads as zero wherever it is asked for');
}

const layouts=await pLayouts;

// Two pilots traverse the same course. A dawdler that lingers two laps on every ring and leaves its
// stars uncharged keeps little of the chart's pace and is eventually overhauled by the flood;
// deliberate charging and tangent entries outrun the fully developed pursuit. No artificial flight
// timer and no automatic speed gain: the difference is entirely in how the two of them fly.
function pressureRun(useStars,observations,inkMult=0){
  const w=new OrbitWorld(1,440,860,observations?(type,e)=>{if(type==='observation')observations.push(e);}:undefined);w.start();
  // The pursuit is what these two runs are about, so ink is free here and measured on its own below.
  w.inkMult=inkMult;w.bestRelief=1;
  // 220 rows is a longer journey than it was: the chart is now cut for the pace it expects, so the
  // same row count covers close to twice the distance and needs the wall-clock to match.
  for(let i=0;i<120*700&&w.state==='playing'&&w.progress<220;i++){
    const n=w.player.node;
    if(n){
      const target=w.nodes.find(q=>q.row===Math.floor(w.progress)+1&&q.type!=='gold'),aim=w.aim();
      // The dawdler takes whatever landing the rim will accept, but only after two idle laps, and
      // never charges a star. The other flies tangents and takes every star to a full lap.
      const ready=useStars?aim&&(aim.perfect||w.player.orbitSweep>Math.PI*3):aim&&w.player.orbitSweep>Math.PI*4;
      if(ready&&!aim.steep&&aim.n===target&&w.player.orbitTime>.12&&(!useStars||n.type!=='sling'||w.charge()===1))w.release();
    }
    w.update(step);
    w.bestRelief=Math.min(w.bestRelief,w.darknessRelief());
    if(!w.player.node)assert(Math.hypot(w.player.vx,w.player.vy)<=MAX_SPEED+1e-7);
  }
  return w;
}
const observed=[];
const slowRun=pressureRun(false),fastRun=pressureRun(true,observed);
assert.equal(slowRun.state,'dead');assert.equal(slowRun.reason,'THE DARK CAUGHT UP');// Consistently slow play meets the flood far sooner than it once did, and deliberately so: the chart
// is cut for a faster pace with the tide taking a quarter of that growth, from row 12 a hazard may
// close one side of a crossing, and a rim will not accept a flight that falls at it. The band is what
// this assertion is really for — the pursuit must neither become unable to catch a dawdler nor take
// one the instant the run begins.
assert(slowRun.elapsed>60&&slowRun.elapsed<300,'The pursuit must eventually catch consistently slow progress: '+slowRun.elapsed.toFixed(0)+'s');
// The streak rule, tested where it lives rather than read off whichever landing a pilot happened to
// stop on: an ordinary capture resets it, and with no streak there is no relief from the pursuit.
{
  const streak=transferFixture(25,240);streak.w.perfectStreak=6;
  assert(streak.w.darknessRelief()<1,'A standing streak is worth relief');
  streak.w.release();
  for(let i=0;i<120*3&&!streak.w.player.node;i++)streak.w.update(step);
  assert.equal(streak.captures[0].perfect,false,'An angled arrival is an ordinary capture');
  assert.equal(streak.w.perfectStreak,0,'An ordinary capture resets the perfect streak');
  assert.equal(streak.w.darknessRelief(),1,'and with it the relief from the pursuit');
}
assert.equal(fastRun.state,'playing');assert(fastRun.progress>=220&&fastRun.elapsed>slowRun.elapsed);
// The two pressures answer two different mistakes, and a run can only dodge both by flying well.
// Dwelling on a ring buys ink but spends the time the flood is counting, so the slow, centred pilot
// above is caught by the dark with ink still in hand. Leaving at the first opening spends distance
// faster than any landing pays it back, so a pilot that never waits runs the nib dry instead. Flying
// tangent entries and charging the stars pays for both and outlasts the pursuit.
const wetRun=pressureRun(true,undefined,1);
assert.equal(wetRun.state,'playing','Tangent entries and charged stars keep the nib paid for');
assert(wetRun.progress>=220&&wetRun.inkLevel()>0,'A well-flown run reaches row 220 with ink to spare');
assert(pressureRun(false,undefined,1).inkLevel()>0,'A run that dwells is never short of ink, only of time');
function rusher(seed){
  const w=new OrbitWorld(seed,440,860);w.start();
  for(let i=0;i<120*400&&w.state==='playing'&&w.progress<120;i++){
    if(w.player.node){const aim=w.aim();if(aim&&!aim.steep&&aim.n.row>w.progress&&w.player.orbitTime>.12)w.release();}
    w.update(step);
  }
  return w;
}
const rushed=[1,2,3,4,5,6,7,8].map(rusher);
assert(rushed.every(w=>w.reason==='THE NIB RAN DRY'),
  'Leaving at the first opening every time must run the nib dry: '+JSON.stringify(rushed.map(w=>w.reason)));
assert(rushed.every(w=>w.progress<60),'The nib gives out well before a rushed run gets deep');
// The pursuit is fully developed at 150; a long chain of perfect transfers holds it
// 15% back, which is the whole of the relief a run can earn.
assert.equal(fastRun.bestRelief,.85,'A long chain of perfect transfers earns the whole of the relief');
assert.equal(150*fastRun.bestRelief,127.5,'A player using speed and smooth transfers faces 127.5 where sloppy play faces the full 150');
const reliefWorld=new OrbitWorld(21);reliefWorld.start();reliefWorld.elapsed=400;
for(const [streak,factor] of [[0,1],[1,1],[2,1],[3,.97],[4,.94],[7,.85],[40,.85]]){
  reliefWorld.perfectStreak=streak;
  assert(Math.abs(reliefWorld.darknessSpeed()-150*factor)<1e-9,'Each perfect past the second slows the pursuit 3%, to a limit of 15%');
}
// Named feats fire once each and are recorded on the world in the order they happen.
assert(observed.length>=3,'A long, fast run must earn several observations: '+JSON.stringify(observed.map(o=>o.key)));
assert.equal(new Set(observed.map(o=>o.key)).size,observed.length,'Each observation is awarded once per run');
assert.equal(observed.length,fastRun.observations.length);
assert(observed.every((o,i)=>o===fastRun.observations[i]),'Emitted observations are the ones recorded on the world');
assert(observed.every(o=>OBSERVATIONS[o.key]&&o.name===OBSERVATIONS[o.key].name&&o.latin===OBSERVATIONS[o.key].latin));
for(const key of ['perfectThree','maxSpeed','fortyRows','threeMinutes'])assert(observed.some(o=>o.key===key),'Expected the '+key+' observation: '+JSON.stringify(observed.map(o=>o.key)));
// The dawdler takes whatever landing the rim accepts, so it does sometimes fly a tangent by luck; the
// claim worth holding is that the feat is never awarded without the transfers it names.
assert(!slowRun.observations.some(o=>o.key==='perfectThree')||slowRun.perfects>=3,
  'TRES PERFECTI is never earned without three perfect transfers');
{
  const plain=transferFixture(25,240);plain.w.release();
  for(let i=0;i<120*3&&!plain.w.player.node;i++)plain.w.update(step);
  assert.equal(plain.w.perfects,0,'An angled arrival is not a perfect transfer');
  assert.equal(plain.w.observations.some(o=>o.key==='perfectThree'),false,'A run without perfect transfers cannot earn TRES PERFECTI');
}
assert.equal((html.match(/<\/script>/g)||[]).length,1);
assert(!/\b(fetch\(|XMLHttpRequest|WebSocket|https?:\/\/)/.test(script),'Game must not require the network');

console.log(JSON.stringify({simulation:'passed',routeSeeds:60,detourSeeds:60,slingSeeds:60,deepSeeds:60,boostedTransfers,longFlightSeconds,openingIdleSeconds:idle.elapsed,driftCaptures,gravity:{curvedCaptures,maxPreviewSteps,slowFlybyDegrees:slowClose.turn*180/Math.PI,fastFlybyDegrees:fastClose.turn*180/Math.PI,flareCaptures,flareGrazes,flareFlybyDegrees:flareSlow.turn*180/Math.PI,windCaptures},pressure:{slowCaughtAt:slowRun.elapsed,fastSurvivedTo:fastRun.elapsed,fastProgress:fastRun.progress,reliefEarned:1-fastRun.bestRelief},chartCompletions,catalogue:CONSTELLATIONS.length,deep:{rowsReached:deepRows/60,lateChartsTraced:deepCharts,lateFiguresSeen:deepFiguresSize},hazards:{flares:flareRows,vortices:holeRows,winds:windRows,nebulas:nebulaCount,placed:hazardsPlaced,closingARoute:routesClosed},observations:observed.map(o=>o.key),transfers:totalCaptures,perfectTransfers:perfects,maxResidentNodes:maxNodes,maxResidentHazards:maxHazards,variedOpening:{seeds:variedOpenings,transfers:variedCaptures,distinctFirstFigures:variedFigures},runtimeLayouts:layouts,checks:['rim tangency in both directions at three speeds','moving-planet tangent prediction and momentum','symmetric gravity with retained speed','curved guide matches real captures','vortex warnings match collisions','bounded prediction and clipped lens sampling','center captures do not earn perfects','persistent speed and star acceleration','speed-based rewards and bounded launches','slow progress eventually loses; charged runs survive','a nib charged with ink, spent by distance and paid back by landings','a guide that prices its own course and marks the one the nib cannot pay for','two pressures: dwelling loses to the dark, rushing runs the nib dry','a chart cut for the pace it expects, with orbits that open with it','a rough radial arrival that keeps its base score and is marked before the release','a pace that hides the far end of a fast crossing without moving the landing','one seed deals one chart however it is flown','a narrowed sheet pulls its orbits back inside its edge','hazards that close one way across but never the last','swept collision','automatic capture','both routes through 48 rows','forks in every region through 60 rows','a seeded catalogue of twelve figures','an engraving for every catalogue figure','a varied opening that draws the second and third planets and all twelve regions’ figures from its own seed, exactly as playable as a fixed one','lettering along an arc','the page turn completes and freezes','charged shortcut routes','one-lap charge, cap and reset','boosted preview matches momentum','long flights have no expiry','per-orbit skip rewards including gold endpoints','distant hazards and chart boundary','resizing mid-run','bounded generation','constellation reward and expiry','duplicate capture protection','symmetric repulsive flare fields with a smaller core','arrival angles and the right-angle square bonus','flare guides match real flight','wind-heads that bend a crossing without ever ending one, and whose guide matches real flight','inert nebulas that fog the guide but not the flight','perfect streaks relieve the pursuit','a charge carried against the rising dark, dealt off the main line and spent once at the waterline','observations awarded once per run','the daily plate, its own record and its copied line','the ephemeris of daily plates: a day opened only by having been drawn on itself, dealt again from its own date','the ascent record','an empty ledger from a fresh, blocked or malformed store','the ledger written at the end of a run','every unlock threshold in the catalogue','every plate and every cosmetic selection renders','a bounded dried route, cleared with the run','a surveyed departure and a surveyed square landing, bounded and cleared','descriptions inscribed on the chart, carried by the sheet, kept off the margins, never overlapping and never fading','a nebula baked into its own faint sprite','the gloss kept clear of the footer band at every layout','the catalogue leaf, its locked rules and its initials','reprieve and pause','a pause control on the sheet, its leaf, and the run it sets aside for the frontispiece','earlier rising darkness','fading orbit','hazard death','full-script boot and drawing arguments','slingshot UI and hints','blocked localStorage','one-tap restart','focus pause','a chart replayed from nothing but its own seed and release log matches the run that drew it, unpruned','a review scrolls freely over that replay and its range never inverts','a plate saved at the end of a run is named on the frontispiece and reviewable from it, blocked storage included','no network dependencies']},null,2));

}finally{
  for(const w of workers)w.terminate();
}

}
