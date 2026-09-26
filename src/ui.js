'use strict';
/* Orbit · src/ui.js
   Presentation, storage, viewport, screens, the single gameplay input, and bootstrap. */
// ---------- Presentation, storage, viewport, and the single gameplay input ----------
// Every ripple, ring and blot carries its own seed so the burin cuts each one differently.
let ringSeq=0;const ringSeed=()=>(ringSeq=(ringSeq+9781)>>>0)||1;
let eraReturn=null;
let replayLog=null;
// Whether this run has already inscribed its own NOVUM RECORDUM: at most one per run, struck the
// moment the score first passes the best it opened with (see event(), below), and reset wherever the
// rest of a fresh run's marks are (newWorld()).
let recordAnnounced=false;
// A loss reads in an instant — the flash and the splat already say what happened — but a win takes its
// own beat: the Ceiling paints its sunrise into the frame the run ends on, and the colophon must not
// cover it before that has had time to be seen. Losses keep the .65/.7 numbers below unchanged.
const WIN_END_DELAY=3.2;
// The atlas's own vocabulary — what a plain run of the printed star chart calls things, in its
// own words. A plate cut for another century registers its own defineVoice() and replaces only the
// entries it renames (see plateWords()/spoken() in src/plates.js); anything it leaves out is still
// read from here, which is why an empty map or a blank string below is itself a meaningful entry.
defineVoice('atlas',{
  chart:'',
  chartNoun:'constellation',
  chartVerb:'traced',
  chartNames:null,
  // Lore a plate may keep for itself: a line set on the sheet as each chapter opens, and a note under a
  // chart as it closes. The atlas keeps none; its chapters and charts say what they are by their names.
  chapterLines:null,chartNotes:null,
  chartSaid:'{chart} complete. Sixty bonus points. Darkness retreats for four seconds.',
  observations:{},
  pressures:DIFFICULTY_LABELS,
  pressureSet:'PRESSURE SET · {label}',
  losses:{},
  opening:'Game started. Tap to release. Skim an orbit for a perfect transfer. Circle slingshot stars to gain speed and to fill the nib. Every flight spends ink by the distance flown; hold an orbit to re-charge it.',
  ended:'Run complete. Score {score}. Best {best}. Tap to try again.',
  unrecorded:'',
  // Struck once beside the traveller the moment a run's score first passes the best it opened with —
  // see event(), below — never on a first run, which breaks no record for want of one to beat.
  newRecord:'NOVUM RECORDUM',
  hud:{pace:'SPEED ×',flow:'FLOW ×',shield:POWERUP_LABELS.shield+' ARMED',reflector:POWERUP_LABELS.reflector+' ARMED',dawn:POWERUP_LABELS.dawn+' ARMED'},
  chrome:{brand:'ORBIT',bestLabel:'Best',endTitle:'One more orbit.',endAction:'Tap to try again',endActionWon:'Tap to try again',pauseTitle:'Suspended.',pauseEyebrow:'THE PRESS STANDS IDLE',pauseNote:'Tap the sheet to continue',pauseResume:'TAKE UP THE PEN',pauseLeave:'RETURN TO THE FRONTISPIECE',pauseLabel:'Pause the run',gameLabel:'Orbit arcade game',canvasLabel:'Orbit. Tap or press Space to start. While orbiting, tap to release toward the next node.',
    eraExit:'RETURN TO THE ATLAS',eraExitLabel:'Return to the atlas',
    readings:{chronicle:'CHRONICLE',endless:'ENDLESS',label:'The reading: {reading}. Tap to change it'},
    journey:{door:'THE JOURNEY',doorLabel:'The Journey: climb the eras from the frontier you have reached',line:'THE JOURNEY · {era} · {count} · {name} {pct}%',known:'THE JOURNEY · {era} IS KNOWN · THE NEXT RUN OPENS ON {next}',whole:'THE JOURNEY · {era} IS KNOWN',stands:'A MILESTONE STANDS · {name}',onward:'Tap to turn the page to {next}'},
    statCaptures:'Orbits',statPerfects:'Perfects',statFlow:'Best flow',statRow:'Row',
    reduceMotion:'A STILLER PRESS',reduceMotionLabel:'Reduce motion and effects, for a lighter, faster plate',
    instructions:{head:'MODUS OPERANDI',rules:['Tap to release. Skim the next orbit.','Circle stars to gain speed. Faster earns more.','Keep ahead of the rising dark.','Aim your first orbit — {pressures}.']}},
  tips:{first:'Release when the pricked line reaches the next orbit.',dark:'Circle a slingshot star to gain speed. The dark grows faster.',faded:'Copper orbits fade. Release before the ring runs out.',vortex:'Close flybys bend your path. Follow the curved guide and leave room for the dark eye.',angle:'Skim the orbit’s rim for a perfect transfer.',speed:'Perfect transfers keep your speed. Faster earns more points.'},
  chapters,
  // The Journey's milestones for this century (docs/archive/eras/LINKING.md): the chapters it is told in,
  // named as this century names them. The atlas's are its own four chapters; every century replaces the
  // list, and src/journey.js's ERA_MILESTONES must count the same number (the suite checks it).
  milestones:chapters,
  // How many rows one chapter spans, read by the chapter math in updateUI() below; the atlas's own
  // four chapters are eight rows apiece, as they always were. goalRow is the row a run is won at —
  // 0, the atlas's own value, means no such row exists and a run is endless, exactly as it always was.
  chapterRows:8,
  goalRow:0,
  chapterSaid:'Plate {numeral}. {name}.',
  // The atlas never wins, so it names no line for it; a plate with a goalRow overrides this.
  won:'',
  // Whether a century with a goalRow may also be flown without one: its Chronicle ends at that row, its
  // Endless reading never ends (docs/archive/eras/LINKING.md). Only a century whose chapters, notes and
  // record all read sanely past its own last chapter says so; the atlas, having no ending, has no choice.
  endless:false,
  // The rows past which a century changes its medium under the run, growing the next out of the body
  // landed on (see TRANSITION_GRACE in the simulation, and the Lens's registers). The atlas has none.
  transitionRows:[],
  held:{choose:'Aim for TIRO, ADEPTUS, or MAGISTER — your first orbit sets the pressure.',dry:'The nib is running dry. Hold this orbit to re-charge it, or find a star.',sling:'One lap builds speed. Tap sooner for less. Perfect landings keep it.',release:'Tap when the pricked line skims the next orbit’s rim.',bend:'Vortices bend your flight. Follow the curve; give the dark eye room.'},
  // A hazard's Latin name, taught once per kind on the sheet itself (see frame.js's own naming pass) —
  // kept here rather than read straight off HAZARD_KINDS at the call site, so a plate with no Latin of
  // its own has somewhere to put a different word instead.
  hazards:{vortex:HAZARD_KINDS.vortex.latin,flare:HAZARD_KINDS.flare.latin,wind:HAZARD_KINDS.wind.latin},
  // The bare currency word, without the ARMED/HELD suffix a capsule's own pickup toast (below) adds to
  // it — kept apart from POWERUP_LABELS itself so a plate can rename what is carried without touching
  // the internal type strings every capsule handler already keys on.
  labels:{shield:POWERUP_LABELS.shield,reflector:POWERUP_LABELS.reflector,dawn:POWERUP_LABELS.dawn},
  // The one observation whose caption event() reaches for directly rather than through `observations`
  // (below): the arrival square is announced the instant it lands, ahead of the observation itself
  // (see the survey fixture in scripts/verify.mjs), so it earns its own key instead of a second, earlier
  // read of the same table.
  squareLanding:OBSERVATIONS.rightAngle.latin,
  // Every other inscription event() strikes onto the chart beside what it is about, kept as one table
  // so a plate with nothing of its own to say inherits the atlas's words exactly, word for word.
  glosses:{
    slingshot:'SLINGSHOT · SPEED ×{factor}',
    maxSpeed:'MAX SPEED · FIND YOUR LINE',
    fullCharge:'FULL CHARGE · SPEED IS YOURS',
    rough:'ROUGH IMPRESSION · BASE {base}',
    skip:'{count} ORBIT{plural} SKIPPED · +{bonus}',
    reprieve:'TRACE 3 STARS · +60 & A REPRIEVE',
    slingOrbit:'ORBIT TO GAIN SPEED · TAP TO LEAVE',
    fading:'FADING ORBIT · KEEP MOVING',
    golden:'GOLDEN DETOUR',
    perfectFlow:'PERFECT · FLOW ×{combo}',
    perfect:'PERFECT · MOMENTUM KEPT',
    wandering:'A WANDERING ORBIT',
    chartProgress:'{chart} · {count} / 3',
    chartComplete:'{chart} · COMPLETE +60',
    angleBonus:'  ·  ANGULUS +{bonus}',
    multiplier:'  ·  ×{mult}',
    shieldArmed:'{label} ARMED · SURVIVES ONE VORTEX',
    shieldBreak:'{label} ABSORBED THE IMPACT',
    reflectorArmed:'{label} ARMED · TURNS BACK THE EDGE',
    reflectorBreak:'{label} THREW YOU BACK',
    dawnArmed:'{label} ARMED · TURNS BACK THE DARK',
    dawnBreak:'{label} DROVE THE DARK BACK',
    inkwellFound:'A RECKLESS LINE · A NEW COLOUR TAKES',
    inkwellDry:'THE WELL RUNS DRY · FLY RECKLESS FIRST',
    observation:'OBSERVATION · {name}',
    close:'CLOSE +5'
  }
});
// Everything the run has to say is written onto the chart itself, beside whatever it is about: see
// src/inscriptions.js. `where` names the subject — a planet or star to follow, or the point on the sheet
// the thing happened at — and the note is set clear of it and left as ink for the chart to carry away.
function say(text,where){
  return inscribe(text,where);
}
function event(type,e){
  // The press answers a few of these in its own way (src/press.js) before anything else hears them.
  pressEvent(type,e);
  if(type==='start'){audio.start();if(replayLog)replayLog.startedAt=world.time;return;}
  if(type==='release'){
    audio.release();burst(e.x,e.y,8,'gold',.4);rings.push({x:e.x,y:e.y,start:4,distance:25,age:0,life:.32,alpha:.45,seed:ringSeed()});
    // What the orbit just left had been observed to is banked for the Journey (src/journey.js), and only there.
    journeyObserve(world.player.launch.sweep/SWEEP_FULL);
    // The departure is surveyed on the orbit just left, and stays on the sheet as dried ink.
    recordDeparture(e);
    rings.push({kind:'blot',x:e.x,y:e.y,size:1.5+e.charge*1.5,age:0,life:1.5,alpha:.6,seed:ringSeed()});
    if(e.sling&&e.charge>.15){
      audio.tone(155,.45,0,.25,'sine',230+e.charge*200);
      if(!reducedMotion){burst(e.x,e.y,Math.round(8+e.charge*12),'gold',.9);rings.push({x:e.x,y:e.y,start:5,distance:55,age:0,life:.5,alpha:.42,seed:ringSeed()});}
      say(fmt(plateWords().glosses.slingshot,{factor:e.factor.toFixed(1)}),{x:e.x,y:e.y});
    }
  }else if(type==='charged'){
    // The trail ladder counts the star's own band filling, which every charged event means by
    // definition; gating it on e.max instead asked for the chart's absolute top speed, a bar a
    // hand loses the moment its release is a frame late, and the ladder's chalk-to-gold-leaf
    // reading of common-to-rare needs its first rung reachable the way a full charge already is.
    tally('maxSpeedSlings');
    audio.tone(392,.65,0,.16);audio.tone(587.33,.65,.12,.12);say(plateWords().glosses[e.max?'maxSpeed':'fullCharge'],{node:world.player.node});
  }else if(type==='capture'){
    tally('captures');if(e.perfect)tally('perfects');if(e.steep)tally('badAngles');
    // The bodies README:56 hand-colours as worlds — every 'still'/'drift'/'fading'/'sling' capture,
    // never a pickup — are all cut from planetFamilies (see src/backdrop.js), and every one of those
    // seven families is a surface only a lens could have resolved: this is what lets the impressum
    // admit its own anachronism (see impressumHasTelescopicBody() in src/frame.js).
    if(planetFamilies.includes(planetFamilyFor(e.n.type,e.n.row,world.seed,e.n.difficultyChoice)))tally('telescopicCaptures');
    // The landing is surveyed where the flight met the ring; a square is answered with two short tones.
    recordLanding(e);
    if(e.steep){
      // A rough impression still earns its base; the duller strike and displaced colour carry the
      // cost now, while the score floater makes the continuous angle progression explicit.
      audio.tone(196,.35,0,.2,'triangle',150);audio.brush(700,.18);burst(e.x,e.y,6,'red',.4);
      // The impressum already promises a correction notice for exactly this (impressumHasRoughImpression,
      // frame.js); the chart itself queries the first one a run makes, and only the first.
      if(!correctionNode)correctionNode=e.n;
    }else{
      audio.capture(e.n.row,e.perfect);burst(e.x,e.y,e.perfect?12:6,'gold',.5);
      if(e.square){audio.tone(880,.3,.02,.12);audio.tone(1174.66,.3,.11,.1);}
    }
    // The gain is the same line either way; only where it lands differs. The atlas keeps it as ink —
    // a tally of its own, the run's SUMMA struck beneath it (world.score already carries this landing's
    // gain: the simulation adds it before emitting the event, see OrbitWorld.capture) — while an era
    // still gets the floater it always had, drifting up and fading over a second and change.
    {
      const glosses=plateWords().glosses;
      const gainText='+'+e.gain+(e.angleBonus?fmt(glosses.angleBonus,{bonus:e.angleBonus}):'')+(e.scoreMultiplier>=1.05?fmt(glosses.multiplier,{mult:e.scoreMultiplier.toFixed(1)}):'');
      if(renaissanceAtlas())tallies.push({x:e.n.x,y:e.n.y-e.n.r-17,line1:gainText,line2:'SUMMA '+world.score,age:0});
      // A plate that writes the gain into its own record of the landing (the Ceiling's red rubric under
      // its survey) takes it there instead; any it does not take still floats as before, carrying the
      // gain's parts as well as its line for a plate that cuts the note in marks of its own (the Rock).
      else if(!(handFor('gainEntry')||(()=>false))(e))floaters.push({x:e.n.x,y:e.n.y-e.n.r-17,text:gainText,gain:e.gain,angleBonus:e.angleBonus||0,mult:e.scoreMultiplier,age:0});
    }
    screenFlash=e.perfect?.28:0;
    rings.push({kind:'capture',node:e.n,x:e.n.x,y:e.n.y,start:e.n.r+2,distance:e.perfect?18:11,angle:Math.atan2(e.y-e.n.y,e.x-e.n.x),perfect:e.perfect,age:0,life:e.perfect?.85:.55,alpha:e.perfect?.86:.56,seed:ringSeed()});
    // The landing is announced on the orbit it was made on, so the note travels with that planet.
    const at={node:e.n},glosses=plateWords().glosses;
    if(e.steep)say(fmt(glosses.rough,{base:e.gain-e.skipBonus}),at);
    else if(e.skip)say(fmt(glosses.skip,{count:e.skipped,plural:e.skipped===1?'':'S',bonus:e.skipBonus}),at);
    else if(e.n.routeRole==='entry')say(glosses.reprieve,at);
    else if(e.n.type==='sling')say(glosses.slingOrbit,at);
    else if(e.n.type==='fading')say(glosses.fading,at);
    else if(e.n.type==='gold')say(glosses.golden,at);
    // The atlas notes a square landing by its Latin name; a plate that renames it in its own voice (the
    // Ceiling in its colophon's words, the Rock in the wall's) is read in that voice here too.
    else if(e.square)say(plateWords().squareLanding+' · +'+e.squareBonus,at);
    else if(e.perfect)say(e.combo>=3?fmt(glosses.perfectFlow,{combo:e.combo}):glosses.perfect,at);
    else if(e.n.type==='drift'&&e.n.row<10)say(glosses.wandering,at);
    recordBest(world.score);
  }else if(type==='chartProgress'){
    say(fmt(plateWords().glosses.chartProgress,{chart:plateWords().chart||chartTitle(e.chart),count:e.count}),{node:e.chart.stars[e.count-1]||world.player.node});
    audio.tone(e.count===1?523.25:659.25,.6,.1,.13);
  }else if(type==='constellation'){
    tallyMap('constellations',e.chart.name);
    // A preview era's own record of every animal ever finished (the Rock's cave, G3) is kept here too,
    // the moment a cluster actually closes, rather than only totalled at the run's end.
    {const caveAnimal=handFor('caveAnimal');if(caveAnimal)caveAnimal(e.chart.catalogueIndex);}
    say(fmt(plateWords().glosses.chartComplete,{chart:plateWords().chart||chartTitle(e.chart)}),{node:e.chart.stars[1]||e.chart.entry});
    {const notes=plateWords().chartNotes,note=notes&&notes[e.chart.catalogueIndex];if(note)say(note,{node:e.chart.stars[2]||e.chart.stars[1],tone:'note'});}
    for(const n of e.chart.stars){
      if(!reducedMotion){burst(n.x,n.y,9,'gold',.5);rings.push({x:n.x,y:n.y,start:n.r,distance:35,age:0,life:1.3,alpha:.5,seed:ringSeed()});}
    }
    audio.medal();
    $('announcement').textContent=spoken('chartSaid',{chart:chartTitle(e.chart)});
    recordBest(world.score);
  }else if(type==='shield'){
    audio.tone(660,.4,0,.22,'sine',880);burst(e.x,e.y,10,'blue',.5);
    rings.push({x:e.x,y:e.y,start:4,distance:30,age:0,life:.5,alpha:.45,seed:ringSeed()});
    say(fmt(plateWords().glosses.shieldArmed,{label:plateWords().labels.shield}),{x:e.x,y:e.y});
  }else if(type==='shieldBreak'){
    tally('shieldsSpent');
    audio.tone(180,.5,0,.3,'triangle',90);audio.brush(900,.3);
    burst(e.x,e.y,20,'blue',.9);rings.push({x:e.x,y:e.y,start:4,distance:60,age:0,life:.6,alpha:.6,seed:ringSeed()});
    say(fmt(plateWords().glosses.shieldBreak,{label:plateWords().labels.shield}),{x:e.x,y:e.y});
  }else if(type==='reflector'){
    audio.tone(740,.4,0,.22,'sine',920);burst(e.x,e.y,10,'violet',.5);
    rings.push({x:e.x,y:e.y,start:4,distance:30,age:0,life:.5,alpha:.45,seed:ringSeed()});
    say(fmt(plateWords().glosses.reflectorArmed,{label:plateWords().labels.reflector}),{x:e.x,y:e.y});
  }else if(type==='reflectorBreak'){
    tally('reflectorsSpent');
    audio.tone(210,.5,0,.3,'triangle',105);audio.brush(900,.3);
    burst(e.x,e.y,20,'violet',.9);rings.push({x:e.x,y:e.y,start:4,distance:60,age:0,life:.6,alpha:.6,seed:ringSeed()});
    say(fmt(plateWords().glosses.reflectorBreak,{label:plateWords().labels.reflector}),{x:e.x,y:e.y});
  }else if(type==='dawn'){
    audio.tone(587.33,.45,0,.2,'sine',784);audio.tone(880,.45,.13,.14);burst(e.x,e.y,10,'gold',.5);
    rings.push({x:e.x,y:e.y,start:4,distance:30,age:0,life:.5,alpha:.45,seed:ringSeed()});
    say(fmt(plateWords().glosses.dawnArmed,{label:plateWords().labels.dawn}),{x:e.x,y:e.y});
  }else if(type==='dawnBreak'){
    tally('dawnsSpent');
    // The flood going back down the sheet is the constellation reprieve's own event, so it is answered in
    // the same register: a rising pair rather than the dull note a spent shield or reflector takes.
    audio.tone(392,.6,0,.22);audio.tone(659.25,.6,.14,.18);audio.brush(1200,.25);
    burst(e.x,e.y,24,'gold',1);rings.push({x:e.x,y:e.y,start:4,distance:70,age:0,life:.7,alpha:.6,seed:ringSeed()});
    say(fmt(plateWords().glosses.dawnBreak,{label:plateWords().labels.dawn}),{x:e.x,y:e.y});
  }else if(type==='inkwell'){
    tally('inkwellsFound');
    audio.tone(523.25,.5,0,.16);audio.tone(659.25,.5,.12,.14);
    burst(e.x,e.y,14,'gold',.7);rings.push({x:e.x,y:e.y,start:4,distance:40,age:0,life:.6,alpha:.5,seed:ringSeed()});
    say(plateWords().glosses.inkwellFound,{x:e.x,y:e.y});
  }else if(type==='inkwellDry'){
    audio.tone(220,.3,0,.18,'triangle',160);burst(e.x,e.y,5,'red',.3);
    say(plateWords().glosses.inkwellDry,{x:e.x,y:e.y});
  }else if(type==='observation'){
    tallyMap('observations',e.key);
    say(fmt(plateWords().glosses.observation,{name:plateWords().observations[e.key]||e.latin}));
    audio.tone(587.33,.5,0,.15);audio.tone(880,.5,.15,.13);
  }else if(type==='near'){
    tally('grazes');
    audio.graze();
    // A graze's own +5 is scored before this fires (OrbitWorld's near handling), so the same total the
    // atlas's tally carries after a landing is exactly as true here.
    if(renaissanceAtlas())tallies.push({x:e.x,y:e.y-20,line1:plateWords().glosses.close,line2:'SUMMA '+world.score,age:0});
    else floaters.push({x:e.x,y:e.y-20,text:plateWords().glosses.close,age:0});
    recordBest(world.score);
  }else if(type==='relight'){
    // Era-only (relightOn, see PLATE_STYLES.rock.can.relight): the atlas never emits this event, so
    // this branch is dead code everywhere but the wall. The era draws the effect itself; a plate with
    // nothing to show for it (the atlas, always) simply has no 'relight' hand and nothing happens.
    const own=handFor('relight');if(own)own(e);
  }else if(type==='death'){
    tallyMap('deaths',e.reason);
    audio.death();
    if(e.reason==='LEFT THE STAR CHART'){
      // Run off the side and the hand jitters: the nib skids off the sheet and spills, rather than
      // bursting. The kill boundary sits 16 units past the visible edge, so the splat sits at the
      // actual point the player left by, only capped to just inside the visible edge in case that
      // point landed further out than the sheet ever drew.
      const dir=e.x>=0?1:-1,edgeX=dir*Math.min(Math.abs(e.x),Math.max(0,world.width/2-8));
      rings.push({kind:'splat',x:edgeX,y:e.y,dir,size:24,age:0,life:1.8,alpha:.72,seed:ringSeed()});
      screenFlash=1;
    }else if(e.reason==='THE DARK CAUGHT UP'){
      // The dark takes the traveller by drowning, not by force, so the sheet answers in its own ink
      // rather than the burst a hazard earns: a blot spreading up from the point of loss, with a
      // short crown of the flood's own bleed threads climbing over the spot.
      rings.push({kind:'splat',x:e.x,y:e.y,spray:-Math.PI/2,crown:true,size:24,age:0,life:1.8,alpha:.72,seed:ringSeed()});
      darkFlash=1;
    }else if(renaissanceAtlas()){
      // A hazard takes the traveller by force, and on the atlas the page blots: the nib is driven into the
      // sheet and the run's own ink floods out from the point of loss, flung away from whatever struck it,
      // and soaks in under the colophon's leaf rather than bursting into sparks that belong to no sheet.
      const h=world.hazards.reduce((a,b)=>!a||Math.hypot(b.x-e.x,b.y-e.y)<Math.hypot(a.x-e.x,a.y-e.y)?b:a,null);
      const spray=h?Math.atan2(e.y-h.y,e.x-h.x):-Math.PI/2;
      rings.push({kind:'splat',x:e.x,y:e.y,spray,size:34,age:0,life:PRESS_BLOT,alpha:.84,seed:ringSeed()});
      rings.push({kind:'splat',x:e.x+Math.cos(spray)*20,y:e.y+Math.sin(spray)*20,spray,size:11,age:0,life:PRESS_BLOT,alpha:.66,seed:ringSeed()});
      screenFlash=1;
    }else{
      burst(e.x,e.y,56,'gold',1.4);burst(e.x,e.y,24,'red',.7);
      rings.push({x:e.x,y:e.y,start:3,distance:115,age:0,life:1.2,alpha:.6,seed:ringSeed()});
      screenFlash=1;
    }
    // The sheet is wiped of everything the run was saying: the colophon is a leaf of its own.
    clearInscriptions();
  }else if(type==='transition'){
    // The medium changes under the run (JOURNEY.md §1.3): the plate's own hand draws it, and a plate with
    // no hand for it has no transition rows either.
    const h=handFor('transition');if(h)h(e);
  }else if(type==='sunrise'){
    // A win, not a death: its own sound (the plate's 'dawn' hand — see defineHand('ceiling',...) in
    // src/ceiling.js — falling back to the atlas's fanfare exactly as medal() does), no splat or flash,
    // and the live region gets its own line rather than the ordinary loss announcement.
    const h=handFor('dawn');if(h)h(audio);else audio.medal();
    $('announcement').textContent=spoken('won',{score:e.score})||spoken('ended',{score:e.score,best});
    clearInscriptions();
  }else if(type==='difficulty'){
    setDifficulty(e.value);
    audio.tone(440,.3,0,.15);say(spoken('pressureSet',{label:plateWords().pressures[e.value]}));
  }
  // The one inscription that answers no event of its own: struck the moment any of the above actually
  // carries the score past the best the run opened with, wherever that happens to land — a capture, a
  // graze, a constellation's bonus. plateOwns('score') is how a century keeps its own record apart from
  // the atlas's (see the colophon, below, and syncEraChrome's own use of it), so an era is left to its
  // own telling of a new best; recordAtStart of 0 means the run opened with no best yet to beat.
  if(renaissanceAtlas()&&!plateOwns('score')&&world.state==='playing'&&recordAtStart>0&&!recordAnnounced&&world.score>recordAtStart){
    recordAnnounced=true;say(plateWords().newRecord);
  }
}
// The reading a century is flown in, where it offers two (LINKING.md): its Chronicle, told to an ending
// at its goalRow, or Endless, the same sheet with no row it is won at. Kept per plate, since a player who
// likes the Rock's wall endless may still want the Scroll's four palaces; a century that offers no choice
// is always its Chronicle, and the atlas, having no ending, is unaffected either way.
const READING_KEY='orbit.reading.v1';
const readings=(()=>{
  const out={};
  try{const raw=JSON.parse(storage.get(READING_KEY,'{}'));if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const k in raw)if(raw[k]==='endless')out[k]='endless';}catch(_){}
  return out;
})();
const eraReading=()=>plateWords().endless&&readings[plateName]==='endless'?'endless':'chronicle';
// A Journey run is never won at a row: its chapters are opened by knowledge across runs (LINKING.md).
const eraGoalRow=()=>runMode==='journey'||eraReading()==='endless'?0:plateWords().goalRow;
// Only from the frontispiece: a run is dealt with its finish line or without one, never changed under it.
function toggleReading(){
  if(!plateWords().endless||runMode==='journey'||(world&&world.state!=='ready'))return;
  if(eraReading()==='endless')delete readings[plateName];else readings[plateName]='endless';
  storage.set(READING_KEY,JSON.stringify(readings));
  newWorld();resetToFrontispiece();syncEraChrome();render(0);
}
// ---------- The Journey's door ----------
// The one way into a Journey run: from the atlas's frontispiece, onto the frontier — the century whose own
// door names the era the climb has reached, or the atlas itself for era V, on whichever of its plates is
// already on the press. Everything a Journey run banks is src/journey.js's; this is only the door.
const journeyPlate=era=>Object.keys(PLATE_STYLES).find(id=>PLATE_STYLES[id].era===era&&PLATE_STYLES[id].door)||null;
const journeyPlayable=era=>era===5||!!journeyPlate(era);
const journeyEraTitle=era=>{const id=journeyPlate(era);return id?PLATE_STYLES[id].door.label:'ERA V \u00b7 THE ATLAS';};
function journeyNote(){
  const w=plateWords(),c=w.chrome.journey,m=journeyMilestones(),era=journeyEraTitle(journey.era);
  if(m.open<m.of)return fmt(c.line,{era,count:m.open+' / '+m.of,name:(w.milestones||[])[m.open]||'',pct:Math.floor(m.toward*100)});
  const next=journey.era<JOURNEY_ERAS&&journeyPlayable(journey.era+1)?journeyEraTitle(journey.era+1):'';
  return fmt(next?c.known:c.whole,{era,next});
}
// The milestones drawn, not only named: every century paints its own knowledge structure as far as the
// climb has built it (a `journeyMark` painter in its hand), onto a small sheet of its own under the
// frontispiece's line and the leaf's. The atlas's are its four chapters as four engraved roundels, each
// hatched as the knowledge banked reaches it, the one in hand hatched round from the top as a dial is.
function atlasJourneyMark(g,w,h,m){
  const B=ink.base,step=Math.min(56,w/(m.of+.4)),r=Math.min(12,h*.18);
  for(let i=0;i<m.of;i++){const cx=w/2+(i-(m.of-1)/2)*step,cy=h/2,f=i<m.open?1:i===m.open?m.toward:0;
    g.save();g.beginPath();g.arc(cx,cy,r,0,TAU);g.strokeStyle=`rgba(${f>=1?B.inkStrong:B.inkSoft},${f>=1?.95:.5})`;g.lineWidth=f>=1?1.1:.7;g.stroke();
    if(f>0){g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,r-1.2,-Math.PI/2,-Math.PI/2+TAU*f);g.closePath();g.clip();
      g.strokeStyle=`rgba(${B.ink},.8)`;g.lineWidth=.55;g.beginPath();for(let d=-r*2;d<=r*2;d+=2.2){g.moveTo(cx+d-r,cy+r);g.lineTo(cx+d+r,cy-r);}g.stroke();}
    g.restore();
    if(f>=1){g.save();g.fillStyle=`rgb(${B.gold})`;g.beginPath();g.arc(cx,cy,1.8,0,TAU);g.fill();g.restore();}}
}
// The leaf's is drawn flatter than the frontispiece's, since the leaf is already full and must stand clear
// of the running figures above it on the shortest phone.
function paintJourneyMark(id,h=64){
  const c=$(id);if(!c)return;const on=runMode==='journey';c.hidden=!on;if(!on||!c.getContext)return;
  const w=260,d=Math.max(1,Math.min(3,window.devicePixelRatio||1));
  c.width=Math.round(w*d);c.height=Math.round(h*d);c.style.width=w+'px';c.style.height=h+'px';
  const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  (handFor('journeyMark')||atlasJourneyMark)(g,w,h,journeyMilestones());
}
function syncJourney(){
  const on=runMode==='journey',c=plateWords().chrome.journey;
  const door=$('journey-open');if(door){door.textContent=c.door;door.setAttribute('aria-pressed',String(on));door.setAttribute('aria-label',c.doorLabel);}
  const note=$('journey-note');if(note){note.hidden=!on;note.textContent=on?journeyNote():'';}
  paintJourneyMark('journey-mark');
}
// Puts the frontier on the press for a Journey run: the century it names entered by its own door, or the
// atlas dealt a fresh chart. A ready era is turned over first (journeyAdvance), which is the whole of the
// transition until JOURNEY.md's stage 5 lets it happen inside a run.
function journeyTurn(){
  journeyAdvance(journeyPlayable);
  if(plateOwns('mode'))leaveEra();
  runMode='journey';
  const plate=journeyPlate(journey.era);
  if(plate)enterEra(plate);else{newWorld();resetToFrontispiece();syncEraChrome();render(0);}
  syncJourney();
}
function toggleJourney(){
  if(world&&world.state==='playing')return;
  if(runMode==='journey'){runMode='free';newWorld();resetToFrontispiece();syncEraChrome();render(0);return;}
  if(dailyOn)setDaily(false);
  journeyTurn();
}
function newWorld(){
  reveal.reset();glyphs.clear();trailSampledAt=-1;particles=[];rings=[];floaters=[];tallies=[];clearInscriptions();clearRevealTitles();lastScore=-1;lastChapter=-1;loreChapter=-1;deathShown=false;screenFlash=0;darkFlash=0;accumulator=0;namedHazardKinds=new Set();correctionNode=null;recordAnnounced=false;
  regionBlend=0;darknessRelief=0;chapterReveal={index:0,age:5};
  // Newton gravity never rides under the daily plate's own fixed setup, and never leaks into an era's
  // separate simulation-and-record (see PLATE_STYLES' can.mode and enterEra/leaveEra).
  recordAtStart=currentBest();resetRunTally();resetJourneyRun();world=new OrbitWorld(dailyOn?dailySeed:++runSeed,W/scale,H/scale,event,!dailyOn,dailyOn,newtonOn&&!dailyOn&&!plateOwns('mode')&&isUnlocked('newton'),plateOwns('chasms'),plateOwns('relight'),eraGoalRow());world.transitionRows=plateWords().transitionRows||[];
  world.darknessMult=DARKNESS_MULT[activeDifficulty()];world.inkMult=INK_MULT[activeDifficulty()];world.perfectMult=PERFECT_MULT[activeDifficulty()];world.capMult=CAP_MULT[activeDifficulty()];world.releaseGrace=RELEASE_GRACE_BY[activeDifficulty()];
  $('copy-score').textContent='TAKE AN IMPRESSION';
  ambience={random:seeded(world.seed^0x5c8a21),wait:7,event:null,sequence:0};
  // A chart's whole course reduces to one thing repeated: when the traveller released. Kept here as
  // world.time — the sim's own clock, immune to real time and frame jitter — so the plate can later be
  // flown again from nothing but its seed and this list. startedAt defaults to 0 (an immediate start)
  // and is corrected the moment 'start' actually fires (event(), below): the sim clock ticks on while
  // the traveller is still reading the frontispiece, so a run that sat a while before its first tap
  // logs every release well after world.time zero, and the replay has to sit through that same idle
  // stretch rather than starting cold at the first release's own timestamp.
  replayLog={seed:world.seed,width:world.width,height:world.height,offerDifficulty:!dailyOn,varyOpening:dailyOn,chasmsOn:world.chasmsOn,relightOn:world.relightOn,startedAt:0,grace:world.releaseGrace,releases:[],resizes:[]};
}
function resetToFrontispiece(){
  game.classList.remove('playing','over','cataloguing');$('intro').classList.remove('hidden');$('end').classList.add('hidden');$('pause').classList.add('hidden');
  syncLastReviewButton();syncPauseControl();
}
function syncEraChrome(){
  // Everything here is a plate's own name for a fixture the atlas also has; the fixture stays where
  // it is, and only the words on it change. The entry button is the one exception even to that: what
  // it says depends on a capability (whether the standing plate is itself a mode, not on which one).
  const chrome=plateWords().chrome;
  // Each century that has a door on the frontispiece names it on its own row in PLATE_STYLES, so a
  // third era is a button in the markup and that row, rather than another label written out here. The
  // doors stand on the atlas's sheet only; from inside a century the way back is the exit, which is
  // the same door out of all of them.
  for(const id in PLATE_STYLES){
    const door=PLATE_STYLES[id].door;if(!door)continue;
    const button=$(door.button);if(button)button.textContent=door.label;
  }
  const brand=$('brand');if(brand)brand.textContent=chrome.brand;
  const bestLabel=$('best-label');if(bestLabel)bestLabel.textContent=chrome.bestLabel;
  const endTitle=$('end-title');if(endTitle)endTitle.textContent=chrome.endTitle;
  const pauseTitle=$('pause-title');if(pauseTitle)pauseTitle.textContent=chrome.pauseTitle;
  const pauseEyebrow=$('pause-eyebrow');if(pauseEyebrow)pauseEyebrow.textContent=chrome.pauseEyebrow;
  const pauseNote=$('pause-note');if(pauseNote)pauseNote.textContent=chrome.pauseNote;
  const pauseResume=$('pause-resume');if(pauseResume)pauseResume.textContent=chrome.pauseResume;
  const pauseLeave=$('pause-leave');if(pauseLeave)pauseLeave.textContent=chrome.pauseLeave;
  const reduceMotion=$('reduce-motion');
  if(reduceMotion){reduceMotion.textContent=chrome.reduceMotion;reduceMotion.setAttribute('aria-label',chrome.reduceMotionLabel);}
  // The one door out of every century, wherever it stands on the sheet — the footer's own utility
  // button and the colophon's own row both carry the same word and the same aria-label.
  const eraExitEnd=$('ceiling-exit-end');if(eraExitEnd)eraExitEnd.textContent=chrome.eraExit;
  const eraExit=$('ceiling-exit');if(eraExit){eraExit.setAttribute('aria-label',chrome.eraExitLabel);eraExit.title=chrome.eraExitLabel;}
  // The choice of reading stands only on a century that offers one, and names the reading in hand.
  const reading=$('reading');
  if(reading){
    const offered=!!plateWords().endless&&runMode!=='journey',now=eraReading(),word=chrome.readings[now];
    reading.hidden=!offered;reading.textContent=word;
    reading.setAttribute('aria-pressed',String(now==='endless'));reading.setAttribute('aria-label',fmt(chrome.readings.label,{reading:word}));
  }
  syncJourney();
  const statCaptures=$('end-captures-label');if(statCaptures)statCaptures.textContent=chrome.statCaptures;
  const statPerfects=$('end-perfects-label');if(statPerfects)statPerfects.textContent=chrome.statPerfects;
  const statFlow=$('end-flow-label');if(statFlow)statFlow.textContent=chrome.statFlow;
  const statRow=$('end-row-label');if(statRow)statRow.textContent=chrome.statRow;
  // The canones-page rubric: a plate's own head and its four rules, the {pressures} marker in the
  // fourth resolved here rather than baked into the voice map, so a rubricated word is always this
  // plate's own pressure names — TIRO, ADEPTUS, MAGISTER on the atlas — not a copy typed a second time.
  const instructions=chrome.instructions,instrHead=$('instructions-head'),instrRules=$('instructions-rules');
  if(instrHead)instrHead.textContent=instructions?instructions.head:'';
  if(instrRules){
    const names=Object.values(plateWords().pressures).map(p=>`<b class="rubric-gold">${p}</b>`);
    const pressures=names.slice(0,-1).join(', ')+(names.length>1?' or ':'')+(names[names.length-1]||'');
    instrRules.innerHTML=(instructions?instructions.rules:[]).map(r=>`<li>${r.replace('{pressures}',pressures)}</li>`).join('');
  }
  syncPauseControl();
  game.setAttribute('aria-label',chrome.gameLabel);
  canvas.setAttribute('aria-label',chrome.canvasLabel);
}
// A century is entered by putting its plate on the press, and left by putting back whatever plate was
// on it before. What the daily is doing is set aside on the way in and restored on the way out,
// because a century is not a day of the atlas's own almanac. A plate that has something to wait for
// before its sheet can be painted — a face still loading, say — names a `ready` painter and it is
// called last, once there is something on screen to repaint.
// A face is fetched only once something on the page asks for it, and a canvas asking is not enough in
// every browser — Safari never loads a face for fillText — so an era whose lettering lives only on the
// canvas, or in markup that is hidden while it is flown, could letter its whole visit in the fallback.
// Entering one asks for every face its type tokens name, upright and italic; each arrival repaints
// the cached art through the loadingdone listener below. A plate that sets a variant at its own weight
// (the Rock's cut capitals are bold) is asked for at that weight, since it is a separate face to fetch;
// its `weight` and `scale` tables name no face and are skipped.
function loadPlateFaces(){
  const t=ink.type;if(!document.fonts||!document.fonts.load||!t)return;
  const asks=new Set();
  for(const [variant,stack] of Object.entries(t))if(typeof stack==='string'){const w=t.weight&&t.weight[variant];for(const style of ['','italic '])asks.add(style+(w?w+' ':'')+'16px '+stack);}
  for(const font of asks)document.fonts.load(font).catch(()=>{});
}
function enterEra(name){
  if(plateOwns('mode')){leaveEra();return;}
  if(world&&world.state==='playing')return;
  if(!PLATES[name])return;
  eraReturn={plate:plateName,dailyOn,dailyDay,dailyReplay,difficulty};
  dailyOn=false;dailyReplay=false;dailyDay=utcDay();dailySeed=dayStamp(dailyDay);dailyBest=readDailyBest();
  applyPlate(name);invalidateArt();loadPlateFaces();syncPlate();syncDaily();newWorld();resetToFrontispiece();syncEraChrome();render(0);
  const ready=handFor('ready');if(ready)ready();
}
function leaveEra(){
  if(!plateOwns('mode'))return;
  // Leaving a century by its exit leaves the Journey with it: the way back in is the Journey's own door.
  runMode='free';
  const keep=eraReturn||{};
  difficulty=keep.difficulty&&DARKNESS_MULT[keep.difficulty]?keep.difficulty:difficulty;
  dailyOn=!!keep.dailyOn;dailyDay=dailyOn&&dailyOpen(keep.dailyDay)?keep.dailyDay:utcDay();dailyReplay=dailyOn&&dailyDay!==utcDay();dailySeed=dayStamp(dailyDay);dailyBest=readDailyBest();
  // A daily returned to asks its own showcase again — freshly, in case the day turned over while the
  // era held the press — rather than trusting the plate snapshotted on the way in; anything else puts
  // back whatever plate was standing before the era, or night if that was itself another mode's own.
  const kept=keep.plate&&PLATES[keep.plate]&&!(PLATE_STYLES[keep.plate]&&PLATE_STYLES[keep.plate].can&&PLATE_STYLES[keep.plate].can.mode);
  const restore=dailyPressPlate()||(kept?keep.plate:'night');
  applyPlate(restore);eraReturn=null;invalidateArt();syncPlate();syncDaily();newWorld();resetToFrontispiece();syncEraChrome();render(0);
}
function setPlaying(){
  // A daily plate is entered in the log the moment its run begins, and only while it is the current
  // day's: that entry is the whole of what opens a past plate to be drawn again.
  noteDailyPlay();
  game.classList.add('playing');game.classList.remove('over');$('intro').classList.add('hidden');$('end').classList.add('hidden');$('pause').classList.add('hidden');
  clearInscriptions();
  $('announcement').textContent=plateWords().opening;
  chapterReveal={index:0,age:0};
}
function showEnd(){
  const preview=plateOwns('score');deathShown=true;game.classList.remove('playing');game.classList.add('over');$('end').classList.remove('hidden');
  paintLeafFrame('end-leaf-frame',{noRosette:true});
  // The leaf's own title carries a win, where the plate has one to say (chrome.endTitleWon); it is set
  // here rather than left to syncEraChrome() alone because that runs on plate change, not per run, and
  // a losing run after a win must not be left showing the winning title.
  {
    const endTitleEl=$('end-title'),chrome=plateWords().chrome;
    if(endTitleEl)endTitleEl.textContent=world.won?(chrome.endTitleWon||chrome.endTitle):chrome.endTitle;
    // The line under it asks for the next run in the same terms: a won night is not something to try again.
    $('end-action').textContent=world.won?chrome.endActionWon:chrome.endAction;
    // A century that closes its leaf with a line of its own (the Rock's torch going out) says a different
    // one over a run that reached its ending, since a won run did not end in the dark.
    const lore=$('end-lore');if(lore&&chrome.endLore)lore.textContent=world.won?(chrome.endLoreWon||chrome.endLore):chrome.endLore;
    // A won leaf's sun is turned gold a beat after the leaf appears, so it is seen to change rather than
    // arriving already turned; a loss clears it at once so it never carries over from a win.
    const leaf=$('end');leaf.classList.remove('won');
    if(world.won){if(reducedMotion)leaf.classList.add('won');else setTimeout(()=>{if(world&&world.won)leaf.classList.add('won');},350);}
  }
  $('end-score').textContent=world.score;$('end-score-roman').textContent=roman(world.score);$('end-reason').textContent=plateWords().losses[world.reason]||world.reason;
  // The Ceiling letters its own score in Egyptian numerals, on the canvas rather than in this DOM
  // text — ceilingPaintEndNumerals (src/ceiling.js) sizes the canvas for its own devicePixelRatio and
  // paints it; this call only exists on that plate, and the typeof guard keeps it safe if that
  // painter's script has not defined it yet.
  if(eraId()===2&&typeof ceilingPaintEndNumerals==='function')ceilingPaintEndNumerals($('end-numerals'),world.score);
  // Any other century that letters its score in its own numerals names an `endNumerals` painter for the
  // same canvas (the Astrolabe's Eastern Arabic-Indic digits, src/astrolabe.js).
  {const paint=handFor('endNumerals');if(paint)paint($('end-numerals'),world);}
  $('record').textContent=preview?plateWords().unrecorded:world.score>recordAtStart?'A NEW RECORD':'BEST '+currentBest();
  $('end-captures').textContent=world.captures;$('end-perfects').textContent=world.perfects;$('end-flow').textContent='×'+world.maxCombo;
  const row=Math.floor(world.progress),newRow=!preview&&row>bestRow;
  if(newRow){bestRow=row;storage.set('orbit.bestRow.v1',bestRow);}
  // A preview era keeps no best of its own above (orbit.best.v1/orbit.bestRow.v1 are the atlas's), but
  // may keep a small record of its own runs under its own key — the Rock's cave (G3), never the atlas's
  // ledger. See defineHand('rock',{...}) in rock.js for what caveRun actually does.
  {const caveRun=handFor('caveRun');if(caveRun)caveRun(world);}
  $('end-row').textContent=row;$('end-row-note').textContent=newRow?'BEST ROW '+bestRow:'';
  const charts=world.constellationsCompleted;
  // Fell's old-style zero sets as a lowercase o at this size: a run that traced nothing reads as the
  // words for nothing rather than as that figure.
  {const w=plateWords(),v=w.chartVerb;$('end-constellations').textContent=charts?charts+' '+w.chartNoun+(charts===1?'':'s')+' '+v:'no '+w.chartNoun+'s '+v;}
  $('end-observations').textContent=world.observations.map(o=>plateWords().observations[o.key]||o.latin).join(' · ');
  // The one page a period book always closes in Latin: FINIS on an ordinary run, LAVS DEO where the
  // run itself earned a perfect chain (the same three-in-a-row the 'Tres perfecti' observation marks).
  $('end-finis-word').textContent=world.observed.has('perfectThree')?'LAVS DEO':'FINIS';paintFinisDevice();
  // The run in miniature is rebuilt from its log, which takes a moment on a long run, so it is struck two
  // frames after the leaf is laid rather than holding the leaf back for it; the fit is measured again once it stands.
  {const m=$('end-miniature');if(m)m.hidden=!(eraId()===0&&!plainPlate());requestAnimationFrame(()=>requestAnimationFrame(()=>{if(deathShown){paintEndMiniature();syncEndFit();}}));}
  $('end-daily').textContent=dailyOn?dailyLabel():'';
  // The run is folded into the ledger here, and anything the catalogue has just granted is named on
  // the colophon and announced once.
  const fresh=preview?[]:[...pendingUnlocks,...ledgerCommit()];pendingUnlocks=[];
  // What a Journey run banked is said on the leaf: any milestone it opened, then where the climb stands.
  {
    const fold=journeyCommit(true),note=$('end-journey');
    paintJourneyMark('end-journey-mark',42);
    if(note){
      note.hidden=!fold;
      if(fold){const w=plateWords(),opened=(w.milestones||[]).slice(fold.open-fold.opened,fold.open);note.textContent=[...opened.map(name=>fmt(w.chrome.journey.stands,{name})),journeyNote()].join(' \u00b7 ');}
    }
    // The next tap turns the page rather than dealing this century again, and the leaf says so.
    if(fold&&fold.ready&&journey.era<JOURNEY_ERAS&&journeyPlayable(journey.era+1))$('end-action').textContent=fmt(plateWords().chrome.journey.onward,{next:journeyEraTitle(journey.era+1)});
    syncJourney();
  }
  const names=fresh.map(id=>UNLOCK_BY_ID[id]&&UNLOCK_BY_ID[id].name).filter(Boolean);
  $('end-unlocked').textContent=names.length?'NEW IN THE CATALOGUE \u00b7 '+names.join(' \u00b7 '):'';
  if(names.length){audio.tone(523.25,.7,0,.14);audio.tone(783.99,.7,.16,.12);}
  syncCatalogueMarks();
  syncNewton();
  syncImpressumScreen();
  // Saved regardless of preview: the plate itself was really drawn, whether or not its score was
  // the kind the ledger keeps. Eras I and II are their own doors, outside review entirely.
  if(eraId()===0)saveLastReplay(replayLog,{score:world.score,row,reason:world.reason,capturedAt:Date.now()});
  // Which situation the run ended in, in the same precedence the atlas always checked it in; a plate
  // that gives several of these the same line (the Ceiling gives four of the six one shared sentence)
  // still reads correctly, since only the chosen key's text is ever read. The old inline ternary this
  // replaced also carried 'Circle a slingshot star to gain speed. The wall breaks away faster.' for
  // this same dark-tip case, but nested inside the branch that only runs once the plate is already
  // known not to be the Ceiling — so the era's own wording was written but never once reached, and is
  // recorded here rather than silently dropped with the ternary that could never read it.
  // A win has no failure to give a tip about; tips.won is read where a plate names one, and left blank
  // where it does not, rather than falling through to a loss tip that would misdescribe the run.
  const tip=world.captures===0?'first':world.reason==='THE DARK CAUGHT UP'?'dark':world.reason==='THE ORBIT FADED'?'faded':world.reason==='DRAWN INTO A VORTEX'?'vortex':world.perfects<2?'angle':'speed';
  $('end-tip').textContent=world.won?(plateWords().tips.won||''):plateWords().tips[tip];
  $('announcement').textContent=world.won?spoken('won',{score:world.score})||spoken('ended',{score:world.score,best}):spoken('ended',{score:world.score,best:best});
  syncEndFit();
}
// Whether the colophon actually fits #end's own box is measured directly rather than guessed from a
// breakpoint: @media height features read a stable viewport so a mobile browser's own chrome sliding
// in and out doesn't reflow the page underneath it, which is exactly the size #end's height (100dvh,
// inherited from #game) does track. Called once the colophon's text is set and again on every resize,
// so the two compaction tiers in the stylesheet follow the sheet's real, current room instead.
function syncEndFit(){
  const end=$('end'),colophon=$('end-colophon');
  end.classList.remove('end-compact','end-tight');
  const fits=()=>{const er=end.getBoundingClientRect(),cr=colophon.getBoundingClientRect();return cr.top>=er.top&&cr.bottom<=er.bottom;};
  if(!fits()){
    end.classList.add('end-compact');
    if(!fits())end.classList.add('end-tight');
  }
}
// A changed HUD line is written in rather than swapped, by the hand that writes the sheet.
function inked(id,text){
  const el=$(id);if(el.textContent===text)return;
  el.textContent=text;el.classList.remove('inked');void el.offsetWidth;el.classList.add('inked');
}
// Whichever vortex is nearest the traveller, for the instruction that is about one.
function nearestHazard(){
  let best=null,bestD=Infinity;
  for(const h of world.hazards){
    if(h.kind&&h.kind!=='vortex')continue;
    const d=Math.hypot(h.x-world.player.x,h.y-world.player.y);
    if(d<bestD){bestD=d;best=h;}
  }
  return best;
}
function updateUI(dt){
  if(lastScore!==world.score){lastScore=world.score;inked('score',String(world.score));inked('best',String(currentBest()));}
  const words=plateWords().hud;
  // Fell's old-style zero is a lowercase o at this size, and a trailing '.0' set it on every frame of
  // every run: dropped whenever the multiple is whole, so the opening reads 'SPEED ×1' rather than
  // '×1.0'.
  const m=world.speedMultiplier();inked('pace',words.pace+(m%1?m.toFixed(1):m));
  inked('flow',world.combo>1&&world.captures>0?words.flow+world.combo:'');
  inked('shield',world.player.shielded?words.shield:'');
  inked('reflector',world.player.reflectorArmed?words.reflector:'');
  inked('dawn',world.player.dawnArmed?words.dawn:'');
  // The nib's reservoir. The rule drains with the ink in hand and takes the copper of a warning
  // once what is left will not carry an ordinary transfer.
  // The reservoir is a CSS gradient on a DOM element laid over the chart. Assigning one makes the
  // browser re-parse the gradient, recalculate that element's style and repaint its layer — and this
  // was assigned on every single frame, with a figure that changed on every single frame, for a rule
  // that had moved a fraction of a pixel. The mark is read to a quarter of a per cent and written only
  // when it actually moves, so the gauge repaints when it has something to show and not otherwise.
  const level=world.inkLevel(),gauge=$('ink'),held=(Math.round(level*400)/4).toFixed(2);
  const wet=level<=.34?'var(--copper)':'var(--gold)';
  const paint='linear-gradient(to right,'+wet+' 0 '+held+'%,var(--line) '+held+'% 100%)';
  if(paint!==inkGaugePaint){inkGaugePaint=paint;gauge.style.background=paint;}
  gauge.classList.toggle('dry',level<=.12);
  // Rows per chapter is a plate's own number — the atlas's four chapters are eight rows apiece, the
  // Ceiling's twelve hours are shorter — so the boundary and the chapter count are both read off
  // plateWords() rather than the atlas's own fixture kept here as a literal 3/8.
  const chapterVoice=plateWords(),chapter=Math.min(chapterVoice.chapters.length-1,Math.floor(world.progress/chapterVoice.chapterRows));
  // The plate's number and name are engraved at the foot of the sheet rather than set in the DOM; the
  // live region is told once, so the change is still spoken.
  // A chapter's line of lore is set once the run is actually under way, so the first chapter's is not
  // spent on the frontispiece; it is tracked apart from lastChapter, which the reveal above keys on.
  if(chapter!==loreChapter&&world.state==='playing'){loreChapter=chapter;const lines=plateWords().chapterLines,line=lines&&lines[chapter];if(line)say(line,{node:world.player.node,tone:'note'});}
  if(chapter!==lastChapter){
    lastChapter=chapter;
    // A plate may mark the turn of a chapter with a sound of its own (the Ceiling's gates); the atlas has none.
    if(chapter>0&&world.state==='playing'){chapterReveal={index:chapter,age:0};{const turn=handFor('chapter');if(turn)turn(audio,chapter);}$('announcement').textContent=spoken('chapterSaid',{numeral:numerals[chapter],name:chapterVoice.chapters[chapter]});}
  }
  // The standing instructions of the opening rows are written on the chart beside what they are about:
  // the orbit being held, or the vortex that is bending the flight. Each is kept on the sheet while
  // its condition holds, and left as ink for the chart to carry away as soon as it stops.
  if(world.state==='playing'&&world.difficultyPending){
    inscribeHeld('instruction',plateWords().held.choose,{node:world.player.node});
  }else if(world.state==='playing'&&world.player.node&&world.inkLevel()<=.28){
    inscribeHeld('instruction',plateWords().held.dry,{node:world.player.node});
  }else if(world.state==='playing'&&world.player.node?.type==='sling'&&world.player.node.row<=7){
    inscribeHeld('instruction',plateWords().held.sling,{node:world.player.node});
  }else if(world.state==='playing'&&world.captures<2){
    inscribeHeld('instruction',plateWords().held.release,{node:world.player.node});
  }else if(world.state==='playing'&&world.progress<12&&world.flightPreview?.curved){
    inscribeHeld('instruction',plateWords().held.bend,{node:nearestHazard()});
  }
  if(world.state==='dead'&&!deathShown&&world.player.deadTime>(world.won?WIN_END_DELAY:.65))showEnd();
}
function resize(){
  // Floored at 1.5 even on an ordinary "1x" screen: the engraving's hairline burin strokes run well
  // under a device pixel wide, and rasterising them with no supersampling turns a crisp incised line
  // into a soft grey smear. The floor costs at most the same fill rate already paid on any 2x display.
  const rect=game.getBoundingClientRect();W=rect.width;H=rect.height;DPR=Math.min(Math.max(window.devicePixelRatio||1,1.5),2);scale=Math.min(W/440,H/780);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
  // Resizing the canvas resets its context state, so this is set again on every resize: it governs how
  // the cached planet, figure and ring sprites get resampled when blitted at the chart's current scale.
  ctx.imageSmoothingQuality='high';
  backdrop=paintBackdrop();if(!grain)grain=grainTexture();
  syncLeafAssets();
  if(world){
    world.resize(W/scale,H/scale);
    // A resize mid-run pulls already-drawn nodes inboard (see OrbitWorld.resize), which the seed alone
    // cannot reproduce; logged here so a replay can repeat the same pull at the same moment instead of
    // only matching the run up to the first time the window changed shape.
    if(replayLog)replayLog.resizes.push({at:world.time,width:world.width,height:world.height});
  }
  syncEndFit();
}
function enterFullscreen(){
  if(document.fullscreenElement||document.webkitFullscreenElement)return;
  try{const request=game.requestFullscreen||game.webkitRequestFullscreen;if(request){const p=request.call(game,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{});}}catch(_){}
}
function handleInput(){
  if(catalogueOpen||ephemerisOpen||reviewing)return;
  audio.unlock();
  if(world.state==='ready'){recordAtStart=currentBest();world.start();setPlaying();enterFullscreen();}
  else if(world.state==='playing'){if(world.release()&&replayLog)replayLog.releases.push(world.time);}
  else if(world.state==='dead'&&world.player.deadTime>(world.won?WIN_END_DELAY:.7)){
    // A Journey whose era has just become known opens the next century's frontispiece rather than dealing
    // the same one again: the page turns between runs until the transition can turn it inside one.
    if(runMode==='journey'&&journeyReady()&&journey.era<JOURNEY_ERAS&&journeyPlayable(journey.era+1)){journeyTurn();return;}
    newWorld();world.start();setPlaying();
  }
  else if(world.state==='paused')resume();
}
// The frontispiece is the one screen with room enough under it to scroll (see #intro, index.html), so
// the state it shows — 'ready' — can't fire on the down stroke the way every other state safely does:
// a finger settling to start a scroll drag is indistinguishable from a tap at that instant, and
// preventDefault()ing it the old way would cancel the scroll outright. Ready alone is tracked down to
// up instead, unlatched by a real drag or by the browser taking the gesture for its own scroll, so only
// a stationary release starts the run and a pan of the leaf never does.
let readyDownX=0,readyDownY=0,readyTracking=false;
const READY_TAP_SLOP=10;
game.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')||!e.isPrimary||e.button!==0)return;
  if(world.state==='ready'){readyTracking=true;readyDownX=e.clientX;readyDownY=e.clientY;return;}
  e.preventDefault();handleInput();
},{passive:false});
game.addEventListener('pointerup',e=>{
  if(!readyTracking||!e.isPrimary)return;
  readyTracking=false;
  if(e.target.closest('button')||Math.hypot(e.clientX-readyDownX,e.clientY-readyDownY)>READY_TAP_SLOP)return;
  handleInput();
});
game.addEventListener('pointercancel',()=>{readyTracking=false;});
// iOS/WebKit doesn't reliably treat pointerdown as a user gesture for unlocking Web
// Audio, so also unlock on the touch events it does recognize.
for(const type of ['touchstart','touchend'])game.addEventListener(type,()=>audio.unlock(),{passive:true});
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&(catalogueOpen||ephemerisOpen)){e.preventDefault();if(catalogueOpen)closeCatalogue();else closeEphemeris();return;}
  if(catalogueOpen||ephemerisOpen)return;
  // With no leaf open over the plate, Escape is the desk's own halt: it sets a run down and takes it up.
  if(e.code==='Escape'&&!reviewing&&world&&(world.state==='playing'||world.state==='paused')){e.preventDefault();if(world.state==='playing')pause();else resume();return;}
  if((e.code==='Space'||e.code==='Enter')&&!e.repeat&&!e.target.closest('button')){e.preventDefault();handleInput();}
});
game.addEventListener('contextmenu',e=>e.preventDefault());
// One control does both, so it is a switch and says so — the plate's own name for the halt, and beside
// it whether the run is being held down, exactly as the sound and daily switches are read.
function syncPauseControl(){
  const control=$('pause-open');if(!control)return;
  control.setAttribute('aria-label',plateWords().chrome.pauseLabel);
  control.setAttribute('aria-pressed',String(!!(world&&world.state==='paused')));
}
// A run is suspended by the footer's own control, by Escape, or by the page being switched away from,
// and it is taken up again by that same control, by a tap anywhere on the sheet exactly as it always
// was, or from the leaf the suspended sheet now carries: the plate's word for the halt, and beneath it
// the two things that can be done with a run held in hand.
function pause(){if(world&&world.state==='playing'){world.state='paused';$('pause').classList.remove('hidden');accumulator=0;$('announcement').textContent=plateWords().chrome.pauseTitle;syncPauseControl();}}
function resume(){
  if(!world||world.state!=='paused')return;
  // The presentation clock is picked up from now rather than from whenever the run was set down, so a
  // sheet left standing for a minute does not come back to a minute's worth of frames owed.
  world.state='playing';accumulator=0;renderDue=0;paceIntervals.length=0;frameTime=performance.now();$('pause').classList.add('hidden');syncPauseControl();
}
// Leaving a suspended run is not a death: no colophon is pulled and nothing is scored, the plate in hand
// is simply set aside unfinished and the frontispiece comes back up with a fresh chart dealt behind it.
// What the run did is still folded into the ledger, exactly as it is when the page is switched away from,
// so orbits already flown are never lost with the sheet; anything earned waits for the next colophon to
// name it. A preview era keeps its own record and so writes nothing here, as it writes nothing anywhere.
function leaveRun(){
  if(!world||world.state!=='paused')return;
  if(!plateOwns('score'))for(const id of ledgerCommit())if(!pendingUnlocks.includes(id))pendingUnlocks.push(id);
  journeyCommit(true);
  newWorld();resetToFrontispiece();render(0);
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    pause();
    // A run that is never finished still counts what it did: fold it in now, and keep anything it
    // unlocked for the colophon to name when the run does end.
    if(!plateOwns('score'))for(const id of ledgerCommit())if(!pendingUnlocks.includes(id))pendingUnlocks.push(id);
    journeyCommit();
    if(audio.ctx)audio.ctx.suspend().catch(()=>{});
  }else{frameTime=performance.now();renderDue=0;paceIntervals.length=0;}
});
window.addEventListener('blur',pause);
$('pause-open').addEventListener('click',()=>{
  if(!world)return;
  if(world.state==='playing'){pause();if(audio.enabled)audio.brush(1200,.12);}
  else if(world.state==='paused'){resume();if(audio.enabled)audio.brush(1600,.1);}
});
$('pause-resume').addEventListener('click',()=>{if(world&&world.state==='paused'){resume();if(audio.enabled)audio.brush(1600,.1);}});
$('pause-leave').addEventListener('click',()=>{if(world&&world.state==='paused'){leaveRun();if(audio.enabled)audio.tone(392,.35,0,.15);}});
$('reduce-motion').addEventListener('click',()=>{reducedMotion=!reducedMotion;storage.set('orbit.reducedMotion.v1',reducedMotion?'on':'off');syncEffects();});
$('sound').addEventListener('click',()=>{audio.toggle();storage.set('orbit.sound.v1',audio.enabled?'on':'off');syncSound();if(audio.enabled)audio.tone(440,.25,0,.2);});
$('plate').addEventListener('click',()=>{setPlate(onPaper()?'night':'paper');if(audio.enabled)audio.brush(1500,.12);});
$('catalogue-open').addEventListener('click',()=>{if(catalogueOpen)closeCatalogue();else openCatalogue();});
$('catalogue-close').addEventListener('click',()=>closeCatalogue());
$('catalogue').addEventListener('pointerdown',e=>{if(e.stopPropagation)e.stopPropagation();});
$('catalogue-body').addEventListener('click',e=>{
  const tabButton=e.target&&e.target.closest?e.target.closest('button[data-tab]'):null;
  if(tabButton){
    const wanted=tabButton.getAttribute('data-tab');
    if(catalogueTab!==wanted){catalogueTab=wanted;renderCatalogue();if(audio.enabled)audio.brush(1400,.1);}
    return;
  }
  const button=e.target&&e.target.closest?e.target.closest('button[data-kind]'):null;
  if(!button)return;
  if(setCosmetic(button.getAttribute('data-kind'),button.getAttribute('data-id'))){
    renderCatalogue();if(audio.enabled)audio.tone(587.33,.22,0,.11);
  }
});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{invalidateArt();if(world)render(0);}).catch(()=>{});
// ready settles once, for the faces the opening page asked for; a face first wanted later — an era's,
// entered long after the page loaded — lands after it, and whatever was baked in the meantime was
// baked in the fallback. Every later arrival therefore repaints the cached art as well.
if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>{invalidateArt();if(world)render(0);});
// The switch lives on both the title screen and the run-complete colophon, so a daily run is never a
// dead end: tapping either one toggles the same setting and the next "tap to try again" honours it.
function toggleDaily(){if(!dailyOn&&runMode==='journey'){runMode='free';syncJourney();}setDaily(!dailyOn);if(audio.enabled)audio.tone(dailyOn?659.25:392,.3,0,.16);}
$('daily').addEventListener('click',toggleDaily);
$('daily-end').addEventListener('click',toggleDaily);
function toggleNewtonSwitch(){toggleNewton();if(audio.enabled)audio.tone(newtonOn?659.25:392,.3,0,.16);}
$('newton').addEventListener('click',toggleNewtonSwitch);
$('newton-end').addEventListener('click',toggleNewtonSwitch);
for(const id in PLATE_STYLES){
  const door=PLATE_STYLES[id].door;if(!door)continue;
  const button=$(door.button);if(button)button.addEventListener('click',()=>enterEra(id));
}
$('ceiling-exit-end').addEventListener('click',leaveEra);
$('ceiling-exit').addEventListener('click',leaveEra);
$('reading').addEventListener('click',toggleReading);
$('journey-open').addEventListener('click',toggleJourney);
$('copy-score').addEventListener('click',()=>{copyScore();if(audio.enabled)audio.tone(523.25,.25,0,.14);});
function syncSound(){$('sound').classList.toggle('muted',!audio.enabled);$('sound').setAttribute('aria-label',audio.enabled?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(audio.enabled));}
function syncEffects(){$('reduce-motion').setAttribute('aria-pressed',String(reducedMotion));}
// The full instruction paragraph prints on its own the first time the frontispiece is ever seen;
// after that it stays off the page unless this toggle calls it back, same as any other standing text.
function syncInstructions(){
  const open=!$('instructions').hidden;
  $('instructions-toggle').textContent=open?'FOLD':'HOW TO PLAY';
  $('instructions-toggle').setAttribute('aria-expanded',String(open));
}
$('instructions-toggle').addEventListener('click',()=>{
  $('instructions').hidden=!$('instructions').hidden;syncInstructions();
  if(audio.enabled)audio.brush(1400,.1);
});
// A second disclosure in the same shape: the ephemeris, both era doors and the last plate stay off
// the frontispiece until this is opened, so the sheet first shown offers only the day's two live
// choices — HOW TO PLAY and DAILY PLATE.
function syncMoreMenu(){
  const open=!$('more-menu').hidden;
  $('more-toggle').textContent=open?'LESS':'MORE';
  $('more-toggle').setAttribute('aria-expanded',String(open));
}
$('more-toggle').addEventListener('click',()=>{
  $('more-menu').hidden=!$('more-menu').hidden;syncMoreMenu();
  if(audio.enabled)audio.brush(1400,.1);
});
$('fullscreen').addEventListener('click',()=>{
  if(document.fullscreenElement||document.webkitFullscreenElement){try{const exit=document.exitFullscreen||document.webkitExitFullscreen;const p=exit.call(document);if(p&&p.catch)p.catch(()=>{});}catch(_){}}
  else enterFullscreen();
});
if(!game.requestFullscreen&&!game.webkitRequestFullscreen)$('fullscreen').style.visibility='hidden';
document.addEventListener('fullscreenchange',()=>{const on=!!document.fullscreenElement;$('fullscreen').setAttribute('aria-label',on?'Exit fullscreen':'Enter fullscreen');$('fullscreen').setAttribute('aria-pressed',String(on));resize();});
if('ResizeObserver'in window)new ResizeObserver(resize).observe(game);else window.addEventListener('resize',resize);
// ---------- Presenting: painting the sheet only as often as it can actually be laid down ----------
// A phone with a 120 Hz screen asks for a frame every eight milliseconds. This chart is a wide,
// heavily blended engraving, and on a screen that fast the press cannot always pull a sheet in the
// time it is given — so frames arrive late and unevenly, which is exactly what a stutter is. The
// cadence the screen is actually achieving is measured over a short window; if the screen is a fast
// one and the press is plainly missing it, the sheet is pulled every other frame instead, which lands
// on a steady sixty rather than a ragged eighty. The flight is stepped on its own fixed clock either
// way, so nothing about the simulation, the input timing or the run changes — only how often the page
// is painted, and the elapsed time is handed to the renderer whole so every animation still runs at
// its own speed. It probes back up at widening intervals, so a screen the press can keep up with is
// never held down for long, and on an ordinary sixty-hertz screen it never engages at all.
const PACE_WINDOW=48,PACE_FAST_PANEL=11.5,PACE_MISS=1.5;
const paceIntervals=[];
let presentEvery=1,presentIn=1,renderDue=0,paceProbeIn=0,paceProbeWait=5;
function pacePresent(dt,raw){
  if(presentEvery>1){
    paceProbeIn-=dt;
    if(paceProbeIn<=0){presentEvery=1;presentIn=1;paceIntervals.length=0;}
    return;
  }
  // A frame that took longer than a tenth of a second was not slow drawing: it was a tab waking up,
  // a plate being rebuilt, or the phone attending to something else. Those say nothing about cadence.
  if(!(raw>0)||raw>100)return;
  paceIntervals.push(raw);
  if(paceIntervals.length<PACE_WINDOW)return;
  const sorted=paceIntervals.slice().sort((a,b)=>a-b);
  const native=sorted[Math.floor(sorted.length*.1)],achieved=sorted[sorted.length>>1],late=sorted[Math.floor(sorted.length*.8)];
  paceIntervals.length=0;
  // Before the press slows, it drops what it can do without: a plate's relit surface (src/relight.js) is
  // an addition to the ground, never the ground, so a screen of any speed that is plainly missing frames
  // — one in five or more — loses it first, and the window is measured again without it.
  if(late>native*PACE_MISS&&typeof relightShed==='function'&&relightShed())return;
  if(native<PACE_FAST_PANEL&&achieved>native*PACE_MISS){
    presentEvery=2;presentIn=1;paceProbeIn=paceProbeWait;paceProbeWait=Math.min(30,paceProbeWait*2);
  }
}
// The flight steps at 1/120 s, and a sixty-hertz screen's frames come a little early and a little late
// round their 16.7 ms: taken at face value, the clock then hands the flight one step on this frame, three
// on the next and two on most, and the traveller moves unevenly across a sheet painted perfectly evenly —
// a judder no amount of speed in the painting can cure. So an interval within a millisecond or so of a
// whole number of steps is taken as exactly that many; anything else (a ninety-hertz screen, a frame
// really dropped) is taken as it came. The run's own time is untouched in kind: it only ever advances
// in whole fixed steps, as it always did.
const PACE_SNAP_MS=1.2;
function snapInterval(raw){const steps=Math.round(raw/(FLIGHT_STEP*1000));return steps>=1&&Math.abs(raw-steps*FLIGHT_STEP*1000)<PACE_SNAP_MS?steps*FLIGHT_STEP*1000:raw;}
function tick(now){
  const raw=frameTime?now-frameTime:0;
  const dt=frameTime?Math.min(snapInterval(raw)/1000,.05):0;frameTime=now;
  if(!document.hidden){
    if(reviewing){
      if(--presentIn<=0){presentIn=presentEvery;renderReview();}
    }else{
      accumulator+=dt;
      // A hair of slack, so a whole number of steps taken as exactly that is never one short to rounding.
      while(accumulator>=FLIGHT_STEP-1e-9){
        world.update(FLIGHT_STEP);accumulator-=FLIGHT_STEP;
      }
      recordTrail();
      audio.scratch(world.state==='playing',Math.hypot(world.player.vx,world.player.vy));
      pacePresent(dt,raw);
      renderDue+=dt;
      if(--presentIn<=0){presentIn=presentEvery;render(renderDue);renderDue=0;}
    }
  }
  requestAnimationFrame(tick);
}
if(!tutorialSeen){$('instructions').hidden=false;markTutorialSeen();}
syncPlate();resize();newWorld();syncSound();syncEffects();syncDifficulty();syncDaily();syncNewton();syncCatalogueMarks();syncInstructions();syncMoreMenu();syncEraChrome();syncLastReviewButton();$('best').textContent=currentBest();render(0);requestAnimationFrame(tick);
