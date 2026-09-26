/* The full-page runtime scenario: boots src/index.html's bundled script in a vm sandbox with DOM,
   canvas, localStorage, and Web Audio stand-ins, then drives it exactly as a browser would. Spawned
   on its own worker thread by the driver in ../verify.mjs (see runtimeLayout there). */
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {step,FAST_GLOBALS,OrbitWorld,orbitTangents,CONSTELLATIONS,OBSERVATIONS,SWEEP_FULL,RELEASE_GRACE,script} from './sandbox.mjs';

const LEDGER_KEY='orbit.ledger.v2',LEDGER_KEY_V1='orbit.ledger.v1';

// A Web Audio stand-in, just enough of the API surface OrbitAudio and an era's own painters ask for
// (gains, filters, oscillators, buffer sources, a convolver for a synthetic cave reverb, the master
// compressor, and the buffers those are built from) to run the real synthesis code end to end with nothing that throws,
// rather than skip it outright the way a missing AudioContext makes audio.js itself skip it. Every
// node is a plain no-op sink: nothing here plays a sound, it only has to survive being asked to.
class FakeAudioParam{constructor(v=0){this.value=v;}setValueAtTime(v){this.value=v;return this;}linearRampToValueAtTime(v){this.value=v;return this;}exponentialRampToValueAtTime(v){this.value=v;return this;}setTargetAtTime(v){this.value=v;return this;}}
class FakeAudioNode{connect(){return arguments[0];}disconnect(){}}
class FakeGain extends FakeAudioNode{constructor(){super();this.gain=new FakeAudioParam(1);}}
class FakeFilter extends FakeAudioNode{constructor(){super();this.type='lowpass';this.frequency=new FakeAudioParam(350);this.Q=new FakeAudioParam(1);}}
class FakeOscillator extends FakeAudioNode{constructor(){super();this.type='sine';this.frequency=new FakeAudioParam(440);this.onended=null;}start(){}stop(){}}
class FakeBufferSource extends FakeAudioNode{constructor(){super();this.buffer=null;this.onended=null;}start(){}stop(){}}
class FakeConvolver extends FakeAudioNode{constructor(){super();this.buffer=null;}}
class FakeCompressor extends FakeAudioNode{constructor(){super();for(const k of ['threshold','knee','ratio','attack','release'])this[k]=new FakeAudioParam();}}
class FakeAudioBuffer{
  constructor(channels,length,sampleRate){this.numberOfChannels=channels;this.length=length;this.sampleRate=sampleRate;this.duration=length/sampleRate;this._data=Array.from({length:channels},()=>new Float32Array(length));}
  getChannelData(ch){return this._data[ch];}
}
class FakeAudioContext{
  constructor(){this.sampleRate=44100;this.currentTime=0;this.state='running';this.destination=new FakeAudioNode();}
  createGain(){return new FakeGain();}
  createBiquadFilter(){return new FakeFilter();}
  createOscillator(){return new FakeOscillator();}
  createBufferSource(){return new FakeBufferSource();}
  createConvolver(){return new FakeConvolver();}
  createDynamicsCompressor(){return new FakeCompressor();}
  createBuffer(channels,length,sampleRate){return new FakeAudioBuffer(channels,length,sampleRate);}
  resume(){this.state='running';return Promise.resolve();}
}
export function runtime(width,height,storageBlocked=false,reduceMotion=false,seed={},checkRename=false){
  const events={},items=new Map(),raf=[],saved=new Map(Object.entries(seed));
  let lensCopies=0;
  const gradient={addColorStop(){}};
  // measureText is the one text metric the lettering routines ask for; the stand-in answers with a
  // plausible advance so textAlongArc exercises its measured path rather than its fallback.
  // getTransform stands in as the identity: the stub never actually composes a transform stack, so the
  // single-nib claim system (reveal.js's penNib) reading it to place its candidate in absolute space
  // gets a well-formed, if not truly tracked, matrix rather than undefined.
  const drawing=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>gradient,createLinearGradient:()=>gradient,createPattern:()=>({}),measureText:t=>({width:Math.max(1,String(t).length*5.5)}),getTransform:()=>({a:1,b:0,c:0,d:1,e:0,f:0})},{
    get(target,key){return key in target?target[key]:(...args)=>{
      for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),'Non-finite canvas argument in '+String(key));
      // A real canvas throws on a negative radius where this one would not, and stops the frame there.
      if((key==='arc'&&args[2]<0)||(key==='ellipse'&&(args[2]<0||args[3]<0)))assert.fail('Negative radius in '+String(key)+': '+args.join(','));
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
  const context={console,Math,Date,Uint8ClampedArray,performance:{now:()=>0},requestAnimationFrame:fn=>raf.push(fn),document:{hidden:false,getElementById:element,createElement:()=>element('offscreen-'+items.size),addEventListener:(t,fn)=>{events['document:'+t]=fn;}},window:{devicePixelRatio:2,matchMedia:()=>({matches:reduceMotion}),addEventListener:(t,fn)=>{events['window:'+t]=fn;},AudioContext:FakeAudioContext},localStorage:{getItem:k=>{if(storageBlocked)throw Error('blocked');return saved.get(k)??null;},setItem:(k,v)=>{if(storageBlocked)throw Error('blocked');saved.set(k,v);}}};
  vm.createContext(context);vm.runInContext(FAST_GLOBALS,context);vm.runInContext(script+'\nthis.test={get world(){return world},handleInput,groundCollisions,GROUND_FIXED,newWorld,resize,render,showEnd,audio,drawCelestialScene,setPlate,get plateName(){return plateName},setDaily,recordBest,scoreLine,copyScore,reveal,revealNode,revealFlourish,atlasFlourishAt,SWEEP_FULL,penLettering,letteringTime,get dailyOn(){return dailyOn},get dailyDay(){return dailyDay},get dailySeed(){return dailySeed},get difficulty(){return difficulty},get ctx(){return ctx},get regionBlend(){return regionBlend},pageTurn,textAlongArc,figureFor,figAsterism,figFrame,buildFigureLayer,FIGURE_SHAPES,\
get ledger(){return ledger},get cosmetics(){return cosmetics},cosmetic,activeCosmetic,dailySetup,dailySetupFor,dailyPressPlate,setCosmetic,recordCosmetic,cosmeticItems,COSMETIC_KINDS,UNLOCKS,UNLOCK_BY_ID,unlockMet,unlockedIds,isUnlocked,ledgerStat,ledgerCommit,setInitials,engraverCredit,\
get initials(){return initials},get runMode(){return runMode},get journey(){return journey},journeyObserve,paintJourneyMark,ERA_MILESTONES,plateIds:Object.keys(PLATES),plainPlate,buildFrameLayer,applyPlate,plateWords,plateOwns,handFor,relightSurface,eraId,laidPaper,laidSheetFor,paintBackdrop,enterEra,leaveEra,rockCaveRead,rockCaveRecordRun,rockCaveRecordAnimal,rockBest,ROCK_CAVE_KEY,lensRead,lensRecordRun,lensNoteField,lensRegOfRow,lensRegAtY,lensRegAt,lensReach,lensGrowths,LENS_KEY,LENS_CHAPTERS,flyRead,flyRecordRun,flyNoteTarget,flyNoteWorld,FLY_KEY,FLY_CHAPTERS,flyChartValue,prbRead,prbRecordRun,prbNoteSystem,prbNoteClass,prbNoteGen,prbBill,PRB_KEY,PRB_CHAPTERS,PRB_MATS,get prbState(){return prbState},prbHarvest,prbPay,get PLATE_STYLES(){return PLATE_STYLES},get rings(){return rings},get inkPath(){return world.inkPath},sy,INK_PATH_CAP,openCatalogue,closeCatalogue,renderCatalogue,get catalogueOpen(){return catalogueOpen},\
drawSurveys,get surveys(){return world.surveys},SURVEY_CAP,orbitTangents,nebulaSprite,glossSprite,marginaliaGloss,marginaliaFloor,footerBand,setPlaying,\
openEphemeris,closeEphemeris,renderEphemeris,leafMonth,replayDaily,noteDailyPlay,dailyOpen,dailyDates,dailyLabel,roman,sunPlace,moonAge,MONTHS_LATIN_GEN,get ephemerisOpen(){return ephemerisOpen},get ephMonth(){return ephMonth},get dailyLog(){return dailyLog},get dailyReplay(){return dailyReplay},\
get inscriptions(){return inscriptions},inscribe,inscribeHeld,clearInscriptions,inscriptionBox,inscriptionRoom,INSCRIPTION_CAP,get scale(){return scale},drawRunningHead,drawImpressum,impressumRows,impressumScreenLine,impressumMetrics,impressumAnchor,\
groundTurn,markGround,groundTaken,groundStanding,groundClear,revealBand,revealPoint,captionOffset,get tallies(){return tallies},tallyBox,\
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
  // The plate's own promise (ground.js): nothing it has set down to stay — a title, a note, the running
  // head, a legend key, a landing's tally — is ever set across another. Two such marks overlapping by more
  // than a sliver of their gutter is type printed through type, and fails the run it was found in.
  const settledClashes=(found,where)=>{
    const fixed=context.test.GROUND_FIXED;
    for(const {a,b,area} of found){
      if(!fixed.has(a.kind)||!fixed.has(b.kind))continue;
      // The running head stands on a ground of its own laid over the chart at the foot of the sheet, and the
      // notes the sheet carries down pass under it on their way off the plate: that is a leaf over ink, not
      // two lines of type sharing a place.
      if(a.kind==='head'||b.kind==='head')continue;
      const smaller=Math.min((a.right-a.left)*(a.bottom-a.top),(b.right-b.left)*(b.bottom-b.top));
      const said=m=>`${m.kind}${m.owner&&m.owner.text?' "'+m.owner.text+'"':''}${m.owner&&m.owner.pending?' (still finding its line)':m.owner&&m.owner.name?' "'+m.owner.name+'"':''} [${[m.left,m.top,m.right,m.bottom].map(Math.round)}]`;
      assert(area<=smaller*.12,`Settled type overlaps in ${where} at ${width}×${height}: ${said(a)} over ${said(b)} (${Math.round(area)} of ${Math.round(smaller)} sq pt)`);
    }
  };
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
  // The impressum is engraved on the sheet, not attached to the viewport — but nothing is stamped yet
  // while the frontispiece leaf is still up (it is measured live against the leaf instead, so the MORE
  // disclosure never runs the cartouche under it), so the one-time world anchor is checked once a run
  // has actually begun, the same moment the real anchor first commits.
  {
    const w=context.test.world;
    w.state='playing';context.test.impressumAnchor(context.test.impressumMetrics());w.state='ready';
    const markY=w.impressumY,screenBefore=context.test.sy(markY),cameraBefore=w.cameraY;
    assert(Number.isFinite(markY),'The impressum receives one finite world anchor');
    w.cameraY=cameraBefore-100;
    assert(context.test.sy(markY)>screenBefore,'A rising camera carries the engraved impressum downward');
    assert.equal(w.impressumY,markY,'Camera motion never re-anchors the impressum');
    w.cameraY=cameraBefore;
    const rows=context.test.impressumRows();
    assert.equal(rows.length,11,'The impressum reserves every line before achievements are earned');
    assert.equal(rows[0].text,'AUGUSTÆ VINDELICORUM');
    assert.equal(rows[1].text,'Ex officina Orbis Tabulæ','The house sets its own name with the digraph the rest of the cartouche uses, in the small-caps face\'s own mixed case');
    assert.equal(rows[2].text,'TAB. I · A1','The plate\'s own number, with the atlas\'s edition number moved to its own row');
    assert.equal(rows[3].text,'EDITIO V');
  }
  // ---------- The ledger and the catalogue ----------
  // A browser with no ledger — or with a ledger that is not JSON at all — opens on an empty one, with
  // every cosmetic at its classic default and nothing unlocked.
  const seededLedger=(seed[LEDGER_KEY]&&seed[LEDGER_KEY].startsWith('{"captures'))||(seed[LEDGER_KEY_V1]&&seed[LEDGER_KEY_V1].startsWith('{"captures'));
  if(!seededLedger){
    const fresh=JSON.parse(JSON.stringify(context.test.ledger));
    assert.deepEqual({captures:fresh.captures,perfects:fresh.perfects,bestFlow:fresh.bestFlow,constellations:fresh.constellations,
      grazes:fresh.grazes,shieldsSpent:fresh.shieldsSpent,reflectorsSpent:fresh.reflectorsSpent,maxSpeedSlings:fresh.maxSpeedSlings,
      inkwellsFound:fresh.inkwellsFound,badAngles:fresh.badAngles,runs:fresh.runs,observations:fresh.observations,personalBests:fresh.personalBests,allFourInOneRun:fresh.allFourInOneRun},
      {captures:0,perfects:0,bestFlow:0,constellations:{},grazes:0,shieldsSpent:0,reflectorsSpent:0,maxSpeedSlings:0,inkwellsFound:0,badAngles:0,runs:{},observations:{},personalBests:{},allFourInOneRun:false},
      'A fresh or unreadable ledger opens empty');
    // The classic look, and — the one category that defaults to nothing rather than to something — a
    // sheet that prints no distance behind the chart at all until the catalogue earns one.
    assert.deepEqual(JSON.parse(JSON.stringify(context.test.cosmetics)),{plate:'night',mark:'quill',trail:'irongall',capture:'ripple',frame:'windheads',figures:'bayer',sphere:'graticule',scenery:'none'},'Cosmetics default to the classic look, and to a bare sheet behind it');
    assert.equal(context.test.isUnlocked('cellarius'),false);
    assert.equal(context.test.setCosmetic('mark','saturn'),false,'A locked cosmetic can never be selected');
    assert.equal(context.test.cosmetic('mark'),'quill','A refused selection leaves the default in place');
  }
  // A v1 document from before "Bayer's own dozen" (ART-AUDIT-TODO.md) retired three instrument
  // figures: its lifetime counts under their old names must migrate onto the new ones the moment
  // the page reads it forward, unprompted by a run, and the promoted document must land under the
  // live v2 key so the migration is written down once rather than repeated on every load.
  if(checkRename){
    const led=context.test.ledger;
    assert.equal(led.constellations['THE PHOENIX'],7,'THE COMPASS\'s lifetime count migrates onto THE PHOENIX');
    assert.equal(led.constellations['THE TOUCAN'],3,'THE HOURGLASS\'s lifetime count migrates onto THE TOUCAN');
    assert.equal(led.constellations['THE PEACOCK'],2,'THE ASTROLABE\'s lifetime count migrates onto THE PEACOCK');
    assert.equal(led.constellations['THE LYRE'],1,'A name that was never renamed carries forward unchanged');
    for(const retired of ['THE COMPASS','THE HOURGLASS','THE ASTROLABE'])assert(!(retired in led.constellations),retired+' must not survive the migration');
    assert.equal(JSON.stringify(JSON.parse(saved.get(LEDGER_KEY)).constellations),JSON.stringify(led.constellations),'The migrated document is promoted to the v2 key immediately, not only after a run');
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
      ['hevelius',{constellations:{'THE LYRE':9,'THE SAIL':9}},false],['hevelius',{constellations:{'THE LYRE':10}},true],
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
    assert.equal(context.test.UNLOCKS.length,53,'The catalogue holds every unlockable');
    // Nothing is ever taken away: a ledger that meets everything unlocks everything.
    const everything=at({captures:10000,perfects:2500,bestRow:100,maxSpeedSlings:500,runs:{classic:100},grazes:50,
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
  // Each pressure sets its own release grace alongside its other multipliers: widest on Tiro, the glass's
  // own noise on Adeptus, and none at all on Magister.
  {
    const table=vm.runInContext('RELEASE_GRACE_BY',context),was=context.test.difficulty;
    assert(table.relaxed>table.classic&&table.classic===RELEASE_GRACE&&table.hardcore===0,'Tiro forgives most, Adeptus the default, Magister nothing: '+JSON.stringify(table));
    for(const value of ['relaxed','classic','hardcore']){
      vm.runInContext('setDifficulty('+JSON.stringify(value)+')',context);
      assert.equal(context.test.world.releaseGrace,table[value],'The '+value+' pressure sets its own release grace');
    }
    vm.runInContext('setDifficulty('+JSON.stringify(was)+')',context);
  }
  events['daily:click']();
  assert.equal(context.test.dailyOn,true);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(context.test.dailyDay),'The daily course is keyed to a UTC date');
  assert.equal(context.test.world.seed,context.test.dailySeed,'The daily course comes from the date, not the clock');
  assert.equal(context.test.world.darknessMult,1,'The daily plate is always played at Classic pressure');
  assert.equal(context.test.world.releaseGrace,RELEASE_GRACE,'and with Adeptus\'s release grace');
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
    assert.equal(predatesFlag.releaseGrace,0,'A replay log saved before the release grace existed is read back without it');
    const graced=context.test.replayRun({seed:context.test.dailySeed,width:440,height:860,offerDifficulty:false,varyOpening:true,startedAt:0,grace:.012,releases:[],resizes:[]});
    assert.equal(graced.releaseGrace,.012,'A replay starts from the grace its log was dealt with');
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
    // The sun's place against published ingresses: Libra 2026-09-23 00:05 UTC, Aries 2026-03-20 14:46 UTC,
    // Capricorn 2026-12-21 20:50 UTC. The day named is the UTC day the crossing falls in.
    assert.deepEqual({...context.test.sunPlace(2026,8)},{sign:5,into:6,day:23},'The sun enters Libra on the 23rd of September 2026');
    assert.deepEqual({...context.test.sunPlace(2026,2)},{sign:11,into:0,day:20},'The sun enters Aries on the 20th of March 2026');
    assert.deepEqual({...context.test.sunPlace(2026,11)},{sign:8,into:9,day:21},'The sun enters Capricorn on the 21st of December 2026');
    // The moon's age against published phases: new 2026-09-11 03:27 UTC, full 2026-09-26 16:49 UTC.
    // The mean month runs up to half a day either side of the true moon, so the new moon is measured round the cycle.
    {const age=context.test.moonAge(2026,8,11);assert(Math.min(age,29.530588853-age)<1,'The moon is new on the 11th of September 2026: '+age);}
    assert(Math.abs(context.test.moonAge(2026,8,26)-14.77)<1.2,'The moon is full on the 26th of September 2026: '+context.test.moonAge(2026,8,26));
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
      assert(/^<svg[^]*<\/svg>in [A-Z][a-z]+ · [A-Z][a-z]+ intrat die [IVX]+$/.test(element('eph-sun').innerHTML),'The ephemeris names the sun\'s place: '+element('eph-sun').innerHTML);
    }
    const held=context.test.world.state;
    context.test.handleInput();
    assert.equal(context.test.world.state,held,'The ephemeris holds the gameplay input while it is open');
    events['window:keydown']({code:'Escape',preventDefault(){},repeat:false,target:{closest:()=>null}});
    assert.equal(context.test.ephemerisOpen,false,'Escape closes the ephemeris');
    // A daily run begun today writes that day into the log, which is what opens it ever after.
    context.test.setDaily(true);
    assert.equal(context.test.dailyReplay,false);
    const [ty,tm,td]=today.split('-').map(Number);
    const todayLatin='DIE '+context.test.roman(td)+' '+context.test.MONTHS_LATIN_GEN[tm-1].toUpperCase()+' · ANNO '+context.test.roman(ty);
    assert.equal(context.test.impressumRows()[10].text,'TABULA DIEI · '+todayLatin,'The impressum records the exact current daily date, in the plate\'s own Latin form');
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
    assert.equal(wall.losses['THE DARK CAUGHT UP'],'THE WATERS OF NUN ROSE OVER THE BARQUE');
    assert.equal(wall.losses['THE NIB RAN DRY'],'THE REED RAN DRY');
    assert.equal(wall.observations.perfectThree,'THREE CLEAN TRANSFERS');
    assert.equal(wall.observations.rightAngle,'A RIGHT ANGLE OF ARRIVAL');
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
    assert.equal(wall.chapters.length,12,'The Ceiling divides its night into the Amduat\'s twelve hours');
    assert.equal(wall.chapters[0],'THE ENTRANCE OF THE WEST');
    assert.equal(wall.chapters[11],'THE BODY OF THE SERPENT');
    assert.equal(wall.chapterRows*wall.chapters.length,wall.goalRow,'The Ceiling\'s dawn falls at the end of its last hour');
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
    // The atlas's furniture this wall has no use for is named away rather than left to leak onto it.
    for(const painter of ['sphere','nib','chartStar','floater'])
      assert.equal(typeof context.test.handFor(painter),'function','The Rock names its own: '+painter);
    // The relit wall is an addition, never a dependency: where there is no WebGL, as here, there is no
    // surface, and the Rock is drawn exactly as it was.
    assert.equal(context.test.relightSurface('void main(){gl_FragColor=vec4(1.);}'),null,'No WebGL, no relit surface');
    context.test.setPlate('night');
    for(const painter of ['sphere','nib','chartStar','floater'])
      assert.equal(context.test.handFor(painter),undefined,'The atlas keeps its own: '+painter);
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
  // ---- The Rock's own instrument: five sound painters registered, none of them throwing ----
  {
    context.test.setPlate('rock');
    for(const painter of ['capture','release','graze','death','medal'])
      assert.equal(typeof context.test.handFor(painter),'function','The Rock names its own sound: '+painter);
    context.test.audio.unlock();
    assert(context.test.audio.ctx,'The stand-in AudioContext must actually attach');
    context.test.audio.capture(3,false);context.test.audio.capture(3,true);
    context.test.audio.release();context.test.audio.graze();context.test.audio.death();context.test.audio.medal();
    context.test.setPlate('night');
    // The atlas's own painters must still throw nothing and stay untouched by the Rock's registration.
    context.test.audio.capture(3,false);context.test.audio.capture(3,true);
    context.test.audio.release();context.test.audio.graze();context.test.audio.death();context.test.audio.medal();
  }
  // ---- The Rock's own vocabulary: no word of the atlas's own workshop or Latin is left standing ----
  {
    context.test.setPlate('night');
    const atlasWords=context.test.plateWords();
    context.test.setPlate('rock');
    const rockWords=context.test.plateWords();
    // Every nested table the atlas keeps a word in, the wall keeps one too — a feat, a loss or a
    // charge the simulation can deal is never left to print in the atlas's own Latin on a wall that
    // has none of its own. `chart` is the one key both plates leave blank on purpose (an empty chart
    // name falls back to the constellation's own English name, the same on every plate), and `close`
    // and the two purely numeric gain glosses need no era-specific word — those three are the only
    // keys this test deliberately lets the wall inherit.
    const inherited={glosses:['close','chartProgress','chartComplete','multiplier']};
    for(const table of ['tips','held','observations','losses','hud','labels','hazards','pressures'])
      for(const key of Object.keys(atlasWords[table]))
        assert(rockWords[table][key]!==undefined,'The Rock must name every '+table+' key the atlas has: '+key);
    for(const key of Object.keys(atlasWords.glosses))
      if(!inherited.glosses.includes(key))assert(rockWords.glosses[key]!==undefined&&rockWords.glosses[key]!==atlasWords.glosses[key],'The Rock must speak its own gloss for: '+key);
    for(const key of Object.keys(atlasWords.chrome))
      if(key!=='instructions')assert(rockWords.chrome[key]!==undefined,'The Rock must set every chrome key the atlas has: '+key);
    assert(rockWords.chrome.instructions&&rockWords.chrome.instructions.head&&rockWords.chrome.instructions.rules.length===4,'The Rock keeps its own canon-page rubric');
    assert.equal(rockWords.squareLanding,'A SQUARE LANDING');
    // Every named feat the simulation can record must have a word on this wall (see OBSERVATIONS in
    // simulation.js), the same completeness the Ceiling is already held to above.
    for(const key of Object.keys(OBSERVATIONS))assert(rockWords.observations[key],'The Rock names every observation the simulation can record: '+key);
    // No word of the atlas's own printing shop, and none of its Latin, is left standing on the wall:
    // every string the wall can actually set is joined into one block and checked at once, template
    // markers included, so a placeholder left unfilled cannot hide a forbidden word behind it.
    const flatten=(value,out)=>{
      if(value==null)return;
      if(typeof value==='string')out.push(value);
      else if(Array.isArray(value))for(const v of value)flatten(v,out);
      else if(typeof value==='object')for(const k in value)flatten(value[k],out);
    };
    const wallText=[];flatten(rockWords,wallText);const wall=wallText.join(' · ');
    for(const bad of ['pricked','PRESSURE SET','MOMENTUM KEPT','TIRO','ADEPTUS','MAGISTER','LEFT THE STAR CHART','ANGULUS','VORAGO','nib'])
      assert(!wall.includes(bad),'The Rock\'s vocabulary must never carry the atlas\'s own word "'+bad+'"');
    // And the atlas keeps its own words exactly as they were: a handful of spot checks against the
    // strings this change actually touched.
    assert.equal(atlasWords.chrome.eraExit,'RETURN TO THE ATLAS');
    assert.equal(atlasWords.chrome.endAction,'Tap to try again');
    assert.equal(atlasWords.chrome.statFlow,'Best flow');
    assert.equal(atlasWords.hazards.vortex,'VORAGO');
    assert.equal(atlasWords.squareLanding,'Angulus rectus');
    assert.equal(atlasWords.glosses.perfect,'PERFECT · MOMENTUM KEPT');
    assert.equal(atlasWords.held.choose,'Aim for TIRO, ADEPTUS, or MAGISTER — your first orbit sets the pressure.');
    context.test.setPlate('night');
  }
  // ---- A short run through the Rock actually prints the wall's own words, not the atlas's ----
  {
    const held=context.test.plateName;
    context.test.setPlate('rock');context.test.newWorld();
    context.test.handleInput();
    const run=context.test.world;
    for(let i=0;i<120*45&&run.state==='playing'&&run.captures<8;i++){
      if(run.player.node){
        const aim=run.aim();
        if(aim&&aim.perfect&&run.player.orbitTime>.12)run.release();
      }
      run.update(step);
      if(i%20===0)context.test.render(step);
    }
    const text=inscribed();
    for(const bad of ['pricked','PRESSURE SET','MOMENTUM KEPT','TIRO','ADEPTUS','MAGISTER','LEFT THE STAR CHART','ANGULUS','VORAGO','nib'])
      assert(!text.includes(bad),'A rendered Rock run must never print "'+bad+'": '+text);
    // Leave the suite exactly as it found it: a live run in progress, not a fresh chart still
    // waiting on its first tap — the blocks after this one assume a 'playing' world already
    // under way (see the release forced a few blocks down).
    context.test.setPlate(held);context.test.newWorld();context.test.world.start();context.test.setPlaying();
  }
  // ---- A cave of your own: the Rock's own persistent record, apart from the atlas's ledger (G3, orbit.rock.v1) ----
  {
    const held=context.test.plateName;
    context.test.setPlate('rock');
    if(!storageBlocked)saved.delete(context.test.ROCK_CAVE_KEY);
    assert.deepEqual(JSON.parse(JSON.stringify(context.test.rockCaveRead())),{v:1,runs:[],animals:{}},'A never-written cave reads as a valid, empty-shaped record');
    assert.equal(context.test.rockBest(),0,'rockBest() is 0 with no recorded runs');
    // Round-trip: a recorded run and a recorded animal read back exactly as written.
    context.test.rockCaveRecordRun({progress:12.7,score:340,captures:5});
    context.test.rockCaveRecordAnimal(3);context.test.rockCaveRecordAnimal(3);
    let cave=context.test.rockCaveRead();
    if(!storageBlocked){
      assert.equal(cave.runs.length,1,'One recorded run appends exactly one entry');
      assert.equal(cave.runs[0].row,12,'The row is the floor of the run\'s progress');
      assert.equal(cave.runs[0].score,340);assert.equal(cave.runs[0].hands,5,'hands is the run\'s captures');
      assert(Number.isFinite(cave.runs[0].at)&&cave.runs[0].at>0,'Every run carries a timestamp');
      assert.equal(cave.animals[3],2,'Each completed constellation increments its own animal\'s count');
      assert.equal(context.test.rockBest(),12,'rockBest() is the deepest recorded row');
      context.test.rockCaveRecordRun({progress:40.2,score:900,captures:9});
      assert.equal(context.test.rockBest(),40,'rockBest() tracks a deeper run once one is recorded');
    }else{
      // Storage blocked: every call above must have been a silent no-op, never a throw, and the record
      // must still read back as empty rather than partially written.
      assert.deepEqual(JSON.parse(JSON.stringify(cave)),{v:1,runs:[],animals:{}},'Blocked storage never actually keeps a written run');
      assert.equal(context.test.rockBest(),0,'rockBest() reads 0 when storage is blocked');
    }
    // Corrupt JSON in the key must never throw, and must read back as an empty record.
    if(!storageBlocked){
      saved.set(context.test.ROCK_CAVE_KEY,'{not json');
      assert.deepEqual(JSON.parse(JSON.stringify(context.test.rockCaveRead())),{v:1,runs:[],animals:{}},'Corrupt JSON yields an empty record, not a throw');
      assert.equal(context.test.rockBest(),0,'rockBest() reads 0 off a corrupt record');
      saved.delete(context.test.ROCK_CAVE_KEY);
      // Runs are capped at the most recent 60: the oldest are dropped first, the newest kept.
      for(let i=0;i<65;i++)context.test.rockCaveRecordRun({progress:i,score:i,captures:i});
      cave=context.test.rockCaveRead();
      assert.equal(cave.runs.length,60,'The cave keeps only the most recent 60 runs');
      assert.equal(cave.runs[0].row,5,'The oldest runs past the cap are dropped first');
      assert.equal(cave.runs[cave.runs.length-1].row,64,'The newest run is always kept');
      saved.delete(context.test.ROCK_CAVE_KEY);
    }
    context.test.setPlate(held);
  }
  // ---- The Lens: three registers read off the row, a story that ends at row 36, and a record of its own (orbit.lens.v1) ----
  {
    const held=context.test.plateName;
    context.test.setPlate('lens');
    assert.equal(context.test.eraId(),6,'The Lens is era VI on the roster, the next door up from the atlas');
    const words=context.test.plateWords();
    assert.equal(words.chapters.length,context.test.LENS_CHAPTERS.length,'Every chapter of the story is named');
    assert.equal(words.chapterRows*words.chapters.length,words.goalRow,'The finale falls at the end of the last chapter');
    assert.equal(words.chapterLines.length,words.chapters.length,'Every chapter opens with a curator\'s line');
    assert.equal(words.chartNotes.length,12,'Every field carries a note');
    for(const key of Object.keys(OBSERVATIONS))assert(words.observations[key],'The Lens names every observation the simulation can record: '+key);
    assert.equal(JSON.stringify(words.transitionRows),'[12,24]','The Lens changes medium past its twelfth and twenty-fourth rows');
    // The next register grows out of the body it starts at, drawn every frame of the way, and a point is
    // drawn in it once the circle has reached it and not before.
    {
      const w=context.test.world,at={x:0,y:w.cameraY+300};
      assert.equal(context.test.lensRegAt(at.x,at.y),0,'Before any change the sheet is the eyepiece');
      context.test.handFor('transition')({x:at.x,y:at.y,time:w.time,index:0});
      const t0=w.time;
      for(const dt of [0,.01,.05,.2,.5,.9,1.4,1.79,1.81,3]){w.time=t0+dt;context.test.render(1/60);}
      w.time=t0+.4;
      const r=context.test.lensReach(context.test.lensGrowths()[0]);
      assert(r>0&&r<Infinity,'Part way, the plate has a reach');
      assert.equal(context.test.lensRegAt(at.x,at.y+r*.5),1,'Inside the circle the sheet is already glass');
      assert.equal(context.test.lensRegAt(at.x,at.y+r*1.5),0,'Outside it, still the eyepiece');
      w.time=t0+5;assert.equal(context.test.lensRegAt(at.x,at.y+50000),1,'Once grown, the whole sheet is glass');
      context.test.newWorld();assert.equal(context.test.lensGrowths().length,0,'A fresh chart starts at the eyepiece');
    }
    for(const painter of ['atmosphere','node','hazard','player','dark','figure','hudLeaf','chapterReveal','trail','aim','floater','tally','chartRoute','endNumerals'])
      assert.equal(typeof context.test.handFor(painter),'function','The Lens names its own: '+painter);
    // Two chapters to a register, and the register changes exactly at a chapter pair's boundary.
    assert.deepEqual([0,11,12,23,24,35,40].map(context.test.lensRegOfRow),[0,0,1,1,2,2,2],'Rows 0-11 are the eyepiece, 12-23 the plate, 24 on the sensor');
    context.test.LENS_CHAPTERS.forEach((c,i)=>assert.equal(c.reg,context.test.lensRegOfRow(i*words.chapterRows),'Chapter '+i+' is told in the register its rows are drawn in'));
    // Every register draws, the finale included, without throwing: the HUD, trail and traveller follow the run's row.
    // Silenced while the run is forced through its chapters: a chapter's sound lays a wash, and a wash
    // schedules its own disconnect on a timer this sandbox has not got.
    const heard=context.test.audio.enabled;context.test.audio.enabled=false;
    context.test.newWorld();context.test.handleInput();
    for(const row of [0,14,30]){context.test.world.progress=row;context.test.render(1/60);}
    // The win is set by hand rather than through die(), whose sound schedules a timer this sandbox has not got.
    Object.assign(context.test.world,{state:'dead',won:true});context.test.world.player.deadTime=2;context.test.render(1/60);
    context.test.audio.enabled=heard;
    // The record: empty when unwritten or corrupt, and a run and a field read back as written.
    if(!storageBlocked){
      saved.delete(context.test.LENS_KEY);
      assert.deepEqual(JSON.parse(JSON.stringify(context.test.lensRead())),{v:1,furthest:0,completed:0,best:0,runs:0,worlds:0,fields:0},'A never-written lens record reads empty');
      context.test.lensRecordRun({progress:19,score:512,won:false});context.test.lensNoteField(15);
      const r=context.test.lensRead();
      assert.equal(r.furthest,3,'Row 19 is the fourth chapter');assert.equal(r.best,512);assert.equal(r.runs,1);assert.equal(r.fields,1<<3,'A field index wraps into the twelve');
      context.test.lensRecordRun({progress:36,score:100,won:true});
      assert.equal(context.test.lensRead().completed,1);assert.equal(context.test.lensRead().best,512,'A lower score never lowers the best');
      saved.set(context.test.LENS_KEY,'{not json');
      assert.equal(context.test.lensRead().runs,0,'Corrupt JSON reads as an empty record, not a throw');
      saved.delete(context.test.LENS_KEY);
    }else assert.equal(context.test.lensRead().runs,0,'Blocked storage reads as an empty record');
    context.test.setPlate(held);context.test.newWorld();context.test.world.start();context.test.setPlaying();
  }
  // ---- The Flyby: six encounters to row 36, a picture that comes home in stages, and a mission log of its own (orbit.flyby.v1) ----
  {
    const held=context.test.plateName;
    context.test.setPlate('flyby');
    assert.equal(context.test.eraId(),7,'The Flyby is era VII on the roster, the next door up from the Lens');
    const words=context.test.plateWords();
    assert.equal(words.chapters.length,context.test.FLY_CHAPTERS.length,'Every encounter of the story is named');
    assert.equal(words.chapterRows*words.chapters.length,words.goalRow,'The finale falls at the end of the last encounter');
    assert.equal(words.goalRow,36,'Six encounters of six rows');
    assert.equal(words.chapterLines.length,words.chapters.length,'Every encounter opens with a curator\'s line');
    assert.equal(words.chartNotes.length,12,'Every target carries a note');assert.equal(words.chartNames.length,12,'Every target is named');
    for(const key of Object.keys(OBSERVATIONS))assert(words.observations[key],'The Flyby names every observation the simulation can record: '+key);
    assert.equal(JSON.stringify(words.transitionRows),'[]','The Flyby keeps one ground, vacuum, the whole way');
    for(const painter of ['atmosphere','node','hazard','player','dark','figure','hudLeaf','chapterReveal','trail','aim','floater','tally','chartRoute','endNumerals','journeyMark'])
      assert.equal(typeof context.test.handFor(painter),'function','The Flyby names its own: '+painter);
    // The strip chart's numbers are six-bit values, as Mariner 4's pixels were.
    for(let c=0;c<12;c++)for(let r=0;r<8;r++){const v=context.test.flyChartValue(c,r);assert(Number.isInteger(v)&&v>=0&&v<=63,'A strip-chart value is six bits: '+v);}
    // Every stage draws without throwing: the opening choice, a run through every encounter with a body held at
    // every stage of its picture, the loss of signal close under the craft, and the finale.
    const heard=context.test.audio.enabled;context.test.audio.enabled=false;
    context.test.newWorld();context.test.render(1/60);context.test.handleInput();
    const w=context.test.world;
    for(const row of [0,7,13,19,25,31]){w.progress=row;for(const d of [0,.1,.3,.6,.85,1])for(const n of w.nodes)if(!n.difficultyChoice){n.documented=d;n.visited=true;}context.test.render(1/60);}
    w.floorY=w.player.y+20;context.test.render(1/60);
    Object.assign(w,{state:'dead',won:true});w.player.deadTime=1.9;context.test.render(1/60);
    // the finale's later lines, painted straight rather than through render(), whose leaf would open here
    w.player.deadTime=4;context.test.handFor('hudLeaf')();w.player.deadTime=1.9;
    context.test.audio.enabled=heard;
    // The mission log: empty when unwritten or corrupt, and a run, a world and a target read back as written.
    if(!storageBlocked){
      saved.delete(context.test.FLY_KEY);
      assert.deepEqual(JSON.parse(JSON.stringify(context.test.flyRead())),{v:1,furthest:0,completed:0,best:0,runs:0,worlds:0,targets:0},'A never-written mission log reads empty');
      context.test.flyRecordRun({progress:19,score:512,won:false});context.test.flyNoteTarget(15);context.test.flyNoteWorld('volcanic');context.test.flyNoteWorld('nowhere');
      const r=context.test.flyRead();
      assert.equal(r.furthest,3,'Row 19 is the fourth encounter');assert.equal(r.best,512);assert.equal(r.runs,1);assert.equal(r.targets,1<<3,'A target index wraps into the twelve');assert.equal(r.worlds,1<<5,'Only a real family is logged');
      context.test.flyRecordRun({progress:36,score:100,won:true});
      assert.equal(context.test.flyRead().completed,1);assert.equal(context.test.flyRead().best,512,'A lower downlink never lowers the best');
      saved.set(context.test.FLY_KEY,'{not json');
      assert.equal(context.test.flyRead().runs,0,'Corrupt JSON reads as an empty log, not a throw');
      saved.delete(context.test.FLY_KEY);
    }else assert.equal(context.test.flyRead().runs,0,'Blocked storage reads as an empty log');
    context.test.setPlate(held);context.test.newWorld();context.test.world.start();context.test.setPlaying();
  }
  // ---- The Probe: six phases to closure at row 36, an Endless reading past it, a manifest paid from what is read, and a self-log of its own (orbit.probe.v1) ----
  {
    const held=context.test.plateName;
    context.test.setPlate('probe');
    assert.equal(context.test.eraId(),8,'The Probe is era VIII on the roster, the last rung');
    const words=context.test.plateWords();
    assert.equal(words.chapters.length,context.test.PRB_CHAPTERS.length,'Every phase of the story is named');
    assert.equal(words.chapterRows*words.chapters.length,words.goalRow,'Closure falls at the end of the last phase');
    assert.equal(words.goalRow,36,'Six phases of six rows');
    assert.equal(words.endless,true,'The last rung may be read without an ending');
    assert.equal(words.chapterLines.length,words.chapters.length,'Every phase opens with a line');
    assert.equal(words.milestones.length,3,'The Probe keeps three milestones, as the Journey counts for era VIII');
    assert.equal(words.chartNotes.length,12,'Every system carries a note');assert.equal(words.chartNames.length,12,'Every system is named');
    for(const key of Object.keys(OBSERVATIONS))assert(words.observations[key],'The Probe names every observation the simulation can record: '+key);
    assert.equal(JSON.stringify(words.transitionRows),'[]','The Probe keeps one ground, interstellar black, the whole way');
    for(const painter of ['atmosphere','node','hazard','player','dark','figure','hudLeaf','chapterReveal','trail','aim','floater','tally','chartRoute','endNumerals','journeyMark'])
      assert.equal(typeof context.test.handFor(painter),'function','The Probe names its own: '+painter);
    // Every bill after closure is larger than the last, in every material.
    for(const m of context.test.PRB_MATS)assert(context.test.prbBill(2)[m]>context.test.prbBill(1)[m]&&context.test.prbBill(1)[m]>=1,'The bill grows with the generation: '+m);
    // Every stage draws without throwing: the opening choice, a run through every phase with a body held at every
    // stage of its reading, a bill met and a daughter launched, the flux close under the craft, and closure.
    const heard=context.test.audio.enabled;context.test.audio.enabled=false;
    context.test.newWorld();context.test.render(1/60);context.test.handleInput();
    const w=context.test.world;
    for(const row of [0,7,13,19,25,31]){w.progress=row;for(const d of [0,.1,.3,.6,.85,1])for(const n of w.nodes)if(!n.difficultyChoice){n.documented=d;n.visited=true;}context.test.render(1/60);}
    // Everything read pays its material: a chart this well documented has met the first bill, so a daughter left.
    // What is read pays its material. The bill for the first daughter met by parts alone — a sail segment, two
    // memory scrubs, a shield plate and an isotope cache — launches it; half-read bodies pay half their share,
    // and a surplus covers a shortfall only at the refinery's two for one.
    {const S=context.test.prbState,base=w.nodes.length,part=(type,i)=>({id:90000+i,type,row:1,visited:true,documented:1,seed:i});
      w.nodes.push(part('reflector',0),part('dawn',2),part('dawn',3),part('shield',4));context.test.prbHarvest();
      assert.equal(S.gen,1,'A bill one part short launches nothing');
      w.nodes.push(part('inkwell',5));context.test.prbHarvest();
      assert.equal(S.gen,2,'The first bill met is closure: a daughter launches and GEN rises');assert.equal(S.launches.length,1);
      for(const m of context.test.PRB_MATS)assert(Math.abs(S.got[m])<1e-9,'Paying the bill spends exactly what it asked: '+m);
      context.test.prbHarvest();assert.equal(S.gen,2,'A part is paid for once, not every frame');
      w.nodes.push({id:90010,type:'still',row:3,visited:true,documented:.5,seed:3});context.test.prbHarvest();
      const half=Object.values(S.got).reduce((a,b)=>a+b,0);assert(half>=.99&&half<=1.51,'A half-read body pays half of what a whole reading would: '+half);
      const got={VOL:4,SIL:1,MET:1,FUEL:0},bill=context.test.prbBill(1);
      assert.equal(context.test.prbPay({VOL:3.9,SIL:1,MET:1,FUEL:0},bill),false,'A surplus short of two for one covers nothing');
      assert.equal(context.test.prbPay(got,bill),true,'Two units of surplus refine into one owed');
      for(const m of context.test.PRB_MATS)assert(Math.abs(got[m])<1e-9,'Refining spends the surplus it used: '+m);
      w.nodes.length=base;}
    w.floorY=w.player.y+20;context.test.render(1/60);
    Object.assign(w,{state:'dead',won:true});w.player.deadTime=1.9;context.test.render(1/60);
    for(const t of [3,4.2])w.player.deadTime=t,context.test.handFor('hudLeaf')();w.player.deadTime=1.9;
    context.test.audio.enabled=heard;
    // The self-log: empty when unwritten or corrupt, and a run, a class, a system and a generation read back as written.
    if(!storageBlocked){
      saved.delete(context.test.PRB_KEY);
      assert.deepEqual(JSON.parse(JSON.stringify(context.test.prbRead())),{v:1,furthest:0,completed:0,best:0,runs:0,maxGen:0,classes:0,systems:0},'A never-written self-log reads empty');
      context.test.prbRecordRun({progress:19,score:512,won:false});context.test.prbNoteSystem(15);context.test.prbNoteClass('volcanic');context.test.prbNoteClass('nowhere');context.test.prbNoteGen(3);
      const r=context.test.prbRead();
      assert.equal(r.furthest,3,'Row 19 is the fourth phase');assert.equal(r.best,512);assert.equal(r.runs,1);assert.equal(r.systems,1<<3,'A system index wraps into the twelve');assert.equal(r.classes,1<<5,'Only a real class is logged');assert.equal(r.maxGen,3);
      context.test.prbNoteGen(2);assert.equal(context.test.prbRead().maxGen,3,'A lower generation never lowers the highest');
      context.test.prbRecordRun({progress:36,score:100,won:true});
      assert.equal(context.test.prbRead().completed,1);assert.equal(context.test.prbRead().best,512,'A lower mass never lowers the best');
      saved.set(context.test.PRB_KEY,'{not json');
      assert.equal(context.test.prbRead().runs,0,'Corrupt JSON reads as an empty self-log, not a throw');
      saved.delete(context.test.PRB_KEY);
    }else assert.equal(context.test.prbRead().runs,0,'Blocked storage reads as an empty self-log');
    context.test.setPlate(held);context.test.newWorld();context.test.world.start();context.test.setPlaying();
  }
  // ---- A Rock run end writes exactly one run to its own cave, and never touches the atlas's ledger ----
  {
    const held=context.test.plateName;
    if(!storageBlocked)saved.delete(context.test.ROCK_CAVE_KEY);
    context.test.setPlate('rock');context.test.newWorld();context.test.handleInput();
    const run=context.test.world,beforeRuns=context.test.ledgerStat('runs'),beforeLedgerDoc=storageBlocked?null:saved.get(LEDGER_KEY);
    for(let i=0;i<120*45&&run.state==='playing'&&run.captures<3;i++){
      if(run.player.node){const aim=run.aim();if(aim&&aim.perfect&&run.player.orbitTime>.12)run.release();}
      run.update(step);
    }
    run.die('THE TORCH GUTTERED');run.player.deadTime=.8;context.test.render(.1);
    assert.equal(context.test.ledgerStat('runs'),beforeRuns,'A Rock run end must never fold into the atlas\'s ledger');
    if(!storageBlocked){
      assert.equal(saved.get(LEDGER_KEY),beforeLedgerDoc,'A Rock run end must never write the atlas\'s ledger to storage');
      const cave=context.test.rockCaveRead();
      assert.equal(cave.runs.length,1,'A Rock run end writes exactly one run to its own cave');
      assert.equal(cave.runs[0].hands,run.captures,'The recorded run keeps the run\'s own captures as hands');
      assert.equal(cave.runs[0].row,Math.floor(run.progress));
    }
    context.test.setPlate(held);context.test.newWorld();context.test.world.start();context.test.setPlaying();
  }
  // ---- The atlas itself never writes the Rock's own key ----
  {
    if(!storageBlocked)saved.delete(context.test.ROCK_CAVE_KEY);
    const held=context.test.plateName;
    context.test.setPlate('night');context.test.newWorld();context.test.handleInput();
    const run=context.test.world;
    for(let i=0;i<60&&run.state==='playing';i++)run.update(step);
    run.die('THE DARK CAUGHT UP');run.player.deadTime=.8;context.test.render(.1);
    if(!storageBlocked)assert.equal(saved.has(context.test.ROCK_CAVE_KEY),false,'An atlas run must never write orbit.rock.v1');
    context.test.setPlate(held);context.test.newWorld();context.test.world.start();context.test.setPlaying();
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
  // Flown without the release grace: this walk checks what the page writes where, and a crowded sheet can
  // rightly leave a note unwritten, so the course is held to the exact releases it was tuned against.
  const run=context.test.world;run.releaseGrace=0;let captures=run.captures;
  for(let i=0;i<120*70&&run.state==='playing'&&run.constellationsCompleted===0;i++){
    if(run.player.node){
      const row=Math.floor(run.progress)+1,target=run.nodes.find(n=>n.row===row&&n.routeRole==='star')||run.nodes.find(n=>n.row===row&&n.type!=='gold'),aim=run.aim();
      if(aim&&target&&aim.n.id===target.id&&aim.perfect&&run.player.orbitTime>.12)run.release();
    }
    run.update(step);
    // Drawn at the page's own sixty frames to the simulation's hundred and twenty, so every note is placed
    // against the ground the frame before it actually recorded, as it is in play, not a half-second-old one.
    if(i%2===0||captures!==run.captures){context.test.render(step*2);captures=run.captures;settledClashes(context.test.groundCollisions(),'the constellation run');}
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
  // Reaching full charge is a promise the run itself makes (OrbitWorld emits 'charged' the instant the
  // lap or the top speed is met, exactly once — see src/simulation.js), not a promise about where the
  // pen manages to fit the note describing it. The standing instruction just checked above is real ink,
  // held right beside this very orbit, and by the time the charge fills, this seed's chart may also
  // carry a constellation's name, an observation, or both — none of it wrong to have written, all of it
  // real lettering the note has to fit beside. inscribe() never prints over other lettering (it goes
  // unwritten rather than garble the page — see placeInscription in src/inscriptions.js), so on a chart
  // crowded enough, even a single standing instruction beside a small orbit can leave the solver no
  // clear ground on a phone-width sheet, and that is a real, intended limit, not a bug to catch here.
  // What must always be true is checked by watching the emission itself: `run.emit` is nothing but the
  // callback OrbitWorld was built with (see the constructor), reassigned for the span of this loop so
  // every event is both recorded and still passed on for the rest of this fixture to see, exactly as if
  // nothing had been watching.
  let chargedEvent=null;const passThrough=run.emit;
  run.emit=(type,e)=>{if(type==='charged')chargedEvent=e;passThrough(type,e);};
  while(run.state==='playing'&&run.charge()<1){run.update(step);context.test.render(step);}
  run.emit=passThrough;
  assert.equal(run.charge(),1);
  assert(chargedEvent,'Reaching full charge must always announce itself, whatever the sheet has room to print');
  // When the sheet did have clear ground for the note, it must say the right thing and be spoken aloud
  // too — checked here, not required, since a crowded chart is free to leave it unwritten (above).
  if(/FULL CHARGE|MAX SPEED/.test(inscribed())||/FULL CHARGE|MAX SPEED/.test(element('inscribed').textContent)){
    assert(/FULL CHARGE|MAX SPEED/.test(inscribed()),inscribed());
    assert(/FULL CHARGE|MAX SPEED/.test(element('inscribed').textContent),'Every inscription is spoken as it is written');
  }
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
  assert(inscribed().includes('OBSERVATION \u00b7 Vigilia'),inscribed());
  // The pen's own ink readout \u2014 the quill's filled barrel and the trail's wet weight/alpha \u2014 must
  // draw cleanly across the whole reservoir, brimming to bone dry, not only whatever level a real
  // flight happens to leave it at here. Forced onto the quill mark itself, since a seeded run may
  // have a different one in hand.
  {
    const heldMark=context.test.cosmetic('mark'),heldInk=run.player.ink;
    context.test.setCosmetic('mark','quill');
    for(const level of [0,.2,.5,1]){
      run.player.ink=level;
      assert.equal(run.inkLevel(),level,'inkLevel must read back the level just set: '+level);
      context.test.render(step);
    }
    context.test.setCosmetic('mark',heldMark);run.player.ink=heldInk;
  }
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
    assert(page.includes('THE PHOENIX')&&page.includes('Phoenix')&&page.includes('THE TOUCAN')&&page.includes('Tucana')&&page.includes('THE PEACOCK')&&page.includes('Pavo'),
      'The Asterismi table lists Bayer\'s three added figures in place of the retired instruments');
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
  assert(element('end-observations').textContent.includes('Vigilia'),'The colophon lists the run observations');
  if(!storageBlocked)assert(Number(saved.get('orbit.bestRow.v1'))>=Math.floor(run.progress),'The ascent record is kept');
  const line=context.test.copyScore();
  assert(line.startsWith('Orbit \u00b7 ')&&line.includes(' points \u00b7 row ')&&line.includes('constellation'),line);
  assert.equal(element('copy-score').textContent,'TAKE AN IMPRESSION','With no clipboard the button never claims to have copied');
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
    assert(inscribed().includes('Angulus rectus · +'+landing.squareBonus),inscribed());
    // It is written beside the orbit it was landed on, and rides with it: the note keeps its place on the
    // sheet as the chart scrolls, and never prints into the frame's margin, the score band or the footer.
    {
      const square=written().find(g=>g.text.includes('Angulus rectus'));
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
      // The survey fixture above leaves the world mid its own opening choice, and past this point every
      // frame this loop renders would keep re-writing that choice's own standing instruction beside this
      // same node — a third note sharing the one anchor this block deliberately holds still under while
      // it also holds 'kept' and, in a moment, 'stood'. Three notes fighting one small point on a 320px
      // sheet is a tight fit at the best of times; it happened to still resolve under the old, far taller
      // HUD band candidates once clamped against, and no longer reliably does now that the atlas clamps
      // to the inner rule instead (hudBand(), src/plates.js). The fixture is settled out of its pending
      // choice here, which is no part of what this block actually tests, rather than asking the placer to
      // solve a crowd it was never written to be tested against.
      w.difficultyPending=false;w.captures=Math.max(w.captures,2);
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
      // Released exactly where it is aimed: whichever pressure the page is on, no grace may carry this
      // deliberately rough release onto the tangent beside it.
      w.releaseGrace=0;
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
  // The plate's register of lettered ground (src/ground.js): one place that knows what type is standing
  // where, and one question every solver that has to letter something asks of it.
  {
    const test=context.test;
    context.test.newWorld();context.test.world.start();context.test.setPlaying();
    // A proof plate is pulled before the letters were cut: it sets no type at all, so it holds no ground
    // and there is nothing here for it to answer.
    if(!test.plainPlate()){
    const w=test.world;
    // The opening's difficulty picker offers three targets and no chart to speak of yet — chartOpen()
    // waits on a real row past it — so it is skipped straight through here, the way an actual capture
    // would clear it, and the real course generated behind it, so the title below actually gets struck
    // rather than sitting in its pre-strike search for the length of this test.
    w.difficultyPending=false;w.ensureAhead();
    // The chapter title is engraved on the paper now: struck once, on the line revealAnchor still chooses
    // once, and from there carried down by exactly as much of the sheet as the camera moves — no more, no
    // less, and never sideways. Two seconds of a real climb is the proof of it; render() alone never
    // advances the sim clock (it only draws), so the camera is driven by hand here to stand in for it.
    test.render(step);test.render(step);
    const struck=test.revealPoint(),cameraBefore=w.cameraY;
    for(let i=0;i<120*2;i++)test.render(step);
    if(w.cameraY===cameraBefore)w.cameraY-=140;
    test.render(step);
    const held=test.revealPoint(),cameraAfter=w.cameraY;
    assert(Math.abs(held.x-struck.x)<1e-6&&Math.abs((held.y-struck.y)-(-(cameraAfter-cameraBefore)*test.scale))<1e-6,
      'The chapter title moves with the paper and only with it: '+JSON.stringify(struck)+' vs '+JSON.stringify(held)+' over a camera move of '+(cameraAfter-cameraBefore));
    // One more frame lets the register (ground.js) catch up to the position just moved to — it reads the
    // last complete frame, by design, so a check made in the same beat as a manual camera move would be
    // asking about ground the title has already left rather than the ground it is standing on now.
    test.render(step);
    // A short landscape screen sets the title out beside the play area and claims no band for it at all,
    // which is the one layout with nothing here to check.
    const band=test.revealBand();
    assert(struck.compact?band===null:band&&band.right>band.left&&band.bottom>band.top,'The chapter title holds ground while the plate is open at '+width+'x'+height);
    if(band){
    // A caption whose planet stands square on the title's own line is set clear of it — and it gets there
    // by asking the register what is already lettered, not by knowing what a chapter title is.
    {
      const cx=(band.left+band.right)/2,cy=(band.top+band.bottom)/2;
      const dy=test.captionOffset(cx,cy,10,20,60),top=cy+dy-9,bottom=cy+dy+4;
      assert(bottom<=band.top||top>=band.bottom,'A caption is set clear of the chapter title: '+top+'-'+bottom+' against '+band.top+'-'+band.bottom);
    }
    // And a note asked for on that same ground is set somewhere else entirely, by the same one question.
    {
      test.clearInscriptions();
      const note=test.inscribe('A NOTE ASKED FOR EXACTLY WHERE THE PLATE IS ALREADY TITLED',{x:(band.left+band.right)/2/test.scale,y:w.cameraY,life:6});
      const box=test.inscriptionBox(note);
      const overlap=Math.max(0,Math.min(box.right,band.right)-Math.max(box.left,band.left))*Math.max(0,Math.min(box.bottom,band.bottom)-Math.max(box.top,band.top));
      assert.equal(overlap,0,'A note is set over the chapter title');
      test.clearInscriptions();
    }
    }
    // Enough more climbing carries the title's own box under the foot of the plate, the same as any other
    // ink the sheet has carried that far: the register has nothing left to say about where it stands.
    w.cameraY-=6000;test.render(step);
    assert.equal(test.revealBand(),null,'The chapter title leaves the sheet once the paper has carried it under the foot');
    // The register itself: a mark declared on one frame is what the next frame's solvers read, and it is
    // cleared by the turn after that rather than accumulating for the life of the run.
    {
      const box={left:10,top:10,right:60,bottom:40};
      test.markGround('note',box.left,box.top,box.right,box.bottom);
      test.groundTurn();
      assert(test.groundTaken(box)>0,'A declared mark is read by the next frame');
      assert.equal(test.groundTaken(box,'note'),0,'A solver excuses its own kind');
      test.groundTurn();test.groundTurn();
      assert.equal(test.groundTaken(box),0,'The register is cleared with the frame');
    }
    }
    context.test.newWorld();
  }
  // ---------- The atlas's own tally: a landing's score, inked once rather than floated and faded ----------
  {
    context.test.newWorld();context.test.setPlaying();
    const w=context.test.world,origin=w.player.node,destination=w.makeNode(120,-400,54,1,'still');
    w.nodes=[origin,destination];w.lastMain=destination;w.row=1;w.ensureAhead=()=>{};w.hazards=[];w.nebulas=[];
    const path=context.test.orbitTangents(origin,destination,-1)[0];
    assert(path,'A tangent route must exist for the tally fixture');
    w.player.angle=path.angle;w.player.dir=-1;w.player.speed=150;w.positionPlayer();w.start();
    assert.equal(w.release(),true);
    for(let i=0;i<120*8&&w.state==='playing'&&!w.player.node;i++)w.update(step);
    assert.equal(w.player.node,destination,'The tally fixture must land');
    context.test.render(step);
    const tallyList=context.test.tallies;
    assert(tallyList.length>0,'A landing inks a standing tally rather than a fading floater');
    const tally=tallyList.at(-1);
    assert.equal(tally.line2,'SUMMA '+w.score,'The tally carries the run\'s total, not only the landing\'s own gain');
    // The landing's own announcement is inscribed in the same event that pushes the tally, and the
    // register is read a frame behind: a tally waits one frame for its line so that it reads that note
    // where it was set (drawTallies), so the first frame shows it unsettled and the second settled.
    assert.equal(context.test.tallyBox(tally),null,'A fresh tally waits one frame before settling its line');
    context.test.render(step);
    const before=context.test.tallyBox(tally);
    assert(before,'A tally settles a line to stand on the frame after it is pushed');
    const beforeSide=tally.left,beforeCam=w.cameraY;
    // A modest, forced new height to close over: what the orbit's own drift happens to give back is not
    // reliable enough to test against, and the property under test is the exact relation between the
    // camera's own movement and the tally's, not how far a couple of seconds of this fixture's own
    // flight happens to climb.
    w.topY-=60;
    for(let i=0;i<Math.round(2/step);i++)w.update(step);
    assert.equal(w.state,'playing','The fixture must still be flying two seconds on');
    context.test.render(step);
    const moved=w.cameraY-beforeCam,after=context.test.tallyBox(tally);
    assert(moved<-1e-6,'The fixture must actually move the camera to be worth testing: '+moved);
    assert.equal(tally.left,beforeSide,'A standing tally never changes gutter once it is set');
    assert(Math.abs((after.top-before.top)-(-moved*context.test.scale))<1e-6,
      'A tally rides the ascent by exactly the camera\'s own movement: '+(after.top-before.top)+' vs '+(-moved*context.test.scale));
    // Pushed far past the footer band rather than merely off the visible screen, so the strike is read
    // off the same rule drawInscriptions itself is cut against.
    w.cameraY-=height*6;
    context.test.render(step);
    assert(!context.test.tallies.includes(tally),'A tally carried under the footer band is struck from the sheet');
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
    // chasmsOn rides the log exactly as offerDifficulty and varyOpening already do (see replayRun() in
    // src/replay.js): a log carrying it must deal identical chasms and reach the identical outcome on
    // a second, independent rebuild, and an older log that predates the field (chasmsOn undefined)
    // must still replay exactly as it always did — no chasm generated for want of the flag.
    const chasmLog={...log,chasmsOn:true};
    const chasmReplayA=context.test.replayRun(chasmLog),chasmReplayB=context.test.replayRun(chasmLog);
    assert.equal(chasmReplayA.state,'dead','A chasm-flagged replay must still reach an end: '+width+'x'+height);
    assert.equal(chasmReplayA.reason,chasmReplayB.reason,'The same log with chasmsOn set must reproduce the same cause of death: '+width+'x'+height);
    assert.equal(chasmReplayA.score,chasmReplayB.score,'The same log with chasmsOn set must reproduce the same score: '+width+'x'+height);
    assert(Math.abs(chasmReplayA.player.x-chasmReplayB.player.x)<1e-6&&Math.abs(chasmReplayA.player.y-chasmReplayB.player.y)<1e-6,'The same log with chasmsOn set must reproduce the same final position: '+width+'x'+height);
    assert.equal(chasmReplayA.chasms.length,chasmReplayB.chasms.length,'The same log with chasmsOn set must reproduce the same chasms');
    assert.equal(context.test.replayRun(log).chasms.length,0,'A log that predates chasmsOn (undefined) must still replay with none generated: '+width+'x'+height);
    // relightOn rides the log the same way: a run flown with it set must reproduce identically on a
    // second, independent rebuild — the refill is a pure function of the fixed-step ticks and the
    // hazards each one already deals, so nothing about it can diverge between two rebuilds of one log.
    const relightLog={...log,relightOn:true};
    const relightReplayA=context.test.replayRun(relightLog),relightReplayB=context.test.replayRun(relightLog);
    assert.equal(relightReplayA.state,'dead','A relight-flagged replay must still reach an end: '+width+'x'+height);
    assert.equal(relightReplayA.reason,relightReplayB.reason,'The same log with relightOn set must reproduce the same cause of death: '+width+'x'+height);
    assert.equal(relightReplayA.score,relightReplayB.score,'The same log with relightOn set must reproduce the same score: '+width+'x'+height);
    assert(Math.abs(relightReplayA.player.x-relightReplayB.player.x)<1e-6&&Math.abs(relightReplayA.player.y-relightReplayB.player.y)<1e-6,'The same log with relightOn set must reproduce the same final position: '+width+'x'+height);
    assert.equal(relightReplayA.player.ink,relightReplayB.player.ink,'The same log with relightOn set must reproduce the same final ink charge: '+width+'x'+height);
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
  // ---- A century with an ending may be flown without one: its Chronicle, or Endless (LINKING.md) ----
  {
    context.test.setPlate('paper');context.test.newWorld();
    const reading=element('reading');
    for(const id in context.test.PLATE_STYLES){
      if(!context.test.PLATE_STYLES[id].door)continue;
      context.test.enterEra(id);const w=context.test.plateWords();
      if(w.goalRow>0)assert(w.won&&w.chrome.endTitleWon&&w.chrome.endActionWon&&w.losses['THE SUN ROSE'],'A century with an ending names it on every leaf: '+id);
      assert.equal(context.test.world.goalRow,w.goalRow,'A century opens on its Chronicle: '+id);
      assert.equal(reading.hidden,!w.endless,'The choice of reading stands only on a century that offers one: '+id);
      if(w.endless)assert(w.goalRow>0&&w.chrome.readings.chronicle!==w.chrome.readings.endless,'A century offering two readings has an ending to leave out, and names both: '+id);
      context.test.leaveEra();context.test.newWorld();
    }
    assert.equal(reading.hidden,true,'The atlas has no ending, and so no choice of reading');
    context.test.enterEra('rock');
    assert.equal(context.test.world.goalRow,32,'The Rock\'s Chronicle ends with the fourth chamber, Newgrange');
    events['reading:click']();
    assert.equal(context.test.world.goalRow,0,'Read Endless, the wall has no row it is won at');
    assert.equal(reading.textContent,context.test.plateWords().chrome.readings.endless);
    assert.equal(reading.hidden,false);
    if(!storageBlocked)assert.equal(JSON.parse(saved.get('orbit.reading.v1')).rock,'endless','The reading is kept, per century');
    context.test.leaveEra();context.test.newWorld();context.test.enterEra('scroll');
    assert.equal(context.test.world.goalRow,32,'One century\'s reading is not another\'s: the Scroll\'s Chronicle ends with its fourth palace');
    context.test.leaveEra();context.test.newWorld();context.test.enterEra('rock');
    assert.equal(context.test.world.goalRow,0,'The reading chosen still stands when the century is entered again');
    context.test.handleInput();events['reading:click']();
    assert.equal(context.test.world.goalRow,0,'A run under way keeps the finish line it was dealt');
    context.test.leaveEra();context.test.newWorld();context.test.enterEra('rock');
    events['reading:click']();
    assert.equal(context.test.world.goalRow,32,'And the Chronicle can be chosen back');
    context.test.leaveEra();context.test.setPlate('night');
  }
  // ---- The chapter boundary reads chapterRows off the plate, not the atlas's own hard-coded 8 ----
  // Last of all: stubbing the Ceiling's voice below is a one-way change for the rest of this process
  // (defineVoice only ever adds to a plate's table), so nothing after this point may depend on the
  // Ceiling's real chapter words again.
  {
    context.test.setPlate('paper');context.test.newWorld();
    context.test.enterEra('ceiling');
    context.defineVoice('ceiling',{chapterRows:3,chapters:['H1','H2','H3','H4','H5']});
    context.test.world.state='playing';context.test.world.progress=7;
    context.test.render(1/60);
    // floor(7/3)=2 -> 'H3'; the atlas's own literal /8 would read floor(7/8)=0 and announce nothing.
    assert(element('announcement').textContent.includes('H3'),
      'The chapter boundary must read chapterRows off the plate, not a literal 8: '+element('announcement').textContent);
    context.test.leaveEra();
  }
  // Nothing enters a Journey run yet, so however much this page flew, it must not have moved the climb.
  if(!('orbit.journey.v1' in seed))assert(!saved.has('orbit.journey.v1'),'Free Play must never write the Journey document: '+width+'x'+height);
  // ---- The Journey's door: a run on the frontier, banked on its leaf, and the page turned between runs ----
  {
    const t=context.test,note=element('journey-note'),endNote=element('end-journey');
    for(const id of [null,...Object.keys(t.PLATE_STYLES).filter(id=>t.PLATE_STYLES[id].door)]){
      if(id)t.enterEra(id);else t.setPlate('paper');
      assert.equal(t.plateWords().milestones.length,t.ERA_MILESTONES[t.eraId()||5],'A century names exactly the milestones the Journey counts for it: '+(id||'atlas'));
      if(id)t.leaveEra();
    }
    t.setPlate('paper');t.newWorld();
    assert.equal(note.hidden,true,'Outside the Journey the frontispiece says nothing of it');
    events['journey-open:click']();
    assert.equal(t.runMode,'journey');
    assert.equal(t.plateName,'rock','A first Journey opens on the frontier, era I');
    assert.equal(t.world.goalRow,0,'A Journey run is never won at a row: its chapters are opened by knowledge');
    assert.equal(element('reading').hidden,true,'A Journey run has no reading to choose');
    assert.equal(note.hidden,false);assert(note.textContent.includes('THE HALL OF THE BULLS'),'The frontispiece names the milestone the climb is working toward: '+note.textContent);
    t.handleInput();for(let i=0;i<7;i++)t.journeyObserve(1);
    t.world.die('THE DARK CAUGHT UP');t.showEnd();
    assert.equal(t.journey.knowledge,7,'A Journey run banks what it observed');
    if(!storageBlocked)assert.equal(JSON.parse(saved.get('orbit.journey.v1')).knowledge,7);
    assert.equal(endNote.hidden,false);assert(endNote.textContent.includes('A MILESTONE STANDS \u00b7 THE HALL OF THE BULLS'),'The leaf names the milestone the run opened: '+endNote.textContent);
    t.journey.knowledge=24.5;t.newWorld();t.handleInput();t.journeyObserve(1);
    t.world.die('THE DARK CAUGHT UP');t.showEnd();
    assert(endNote.textContent.includes('IS KNOWN')&&endNote.textContent.includes('THE CEILING'),'A known era says which century the next run opens on: '+endNote.textContent);
    assert(element('end-action').textContent.includes('THE CEILING'),'And the leaf asks for the tap that turns the page to it: '+element('end-action').textContent);
    t.world.player.deadTime=10;t.handleInput();
    assert.equal(t.journey.era,2,'The page turns between runs');
    assert.equal(t.plateName,'ceiling','The next run opens on the next century');
    assert.equal(t.world.state,'ready','Onto its frontispiece, not straight into a run');
    assert.equal(t.world.goalRow,0,'The Ceiling in a Journey has no dawn row either');
    assert(note.textContent.includes('HOURS I TO III'),'The Ceiling names its own milestones: '+note.textContent);
    events['ceiling-exit:click']();
    assert.equal(t.runMode,'free','Leaving a century by its exit leaves the Journey with it');
    assert.equal(t.plateName,'paper');assert.equal(note.hidden,true);
    // Era V is the atlas itself: the door puts the Journey on the plate already on the press, and the daily
    // plate is Free Play's, never the Journey's.
    t.journey.era=5;t.journey.knowledge=0;
    events['journey-open:click']();
    assert.equal(t.plateName,'paper','Era V is flown on the atlas, on the plate already chosen');
    assert.equal(t.runMode,'journey');assert.equal(t.world.goalRow,0);
    events['daily:click']();
    assert.equal(t.runMode,'free','Turning to the daily plate leaves the Journey');assert.equal(t.dailyOn,true);
    events['daily:click']();
    events['journey-open:click']();events['journey-open:click']();
    assert.equal(t.runMode,'free','The door pressed again on the atlas leaves the Journey');
    // Every century on the ladder draws its own milestones, and draws them at every stage of the climb.
    const mark=element('journey-mark');
    for(const era of [1,2,3,4,5,6,7,8]){
      t.journey.era=era;t.journey.knowledge=0;events['journey-open:click']();
      assert.equal(t.eraId()||5,era,'The door opens on the frontier era: '+era);
      if(era!==5)assert.equal(typeof t.handFor('journeyMark'),'function','Every century paints its own milestones: era '+era);
      for(const k of [0,3.1,12.5,24.9,25]){t.journey.knowledge=k;t.paintJourneyMark('journey-mark');}
      assert.equal(mark.hidden,false,'The milestones are drawn under the frontispiece\'s line: era '+era);
      if(t.plateOwns('mode'))events['ceiling-exit:click']();else events['journey-open:click']();
      assert.equal(mark.hidden,true,'And gone with the Journey: era '+era);
    }
    t.journey.era=1;t.journey.knowledge=0;
    t.setPlate('night');
  }
  return {width,height,storageBlocked,reduceMotion,lensCopies,turnFrames};
}
