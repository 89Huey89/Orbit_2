'use strict';
/* Orbit · src/replay.js
   A run rebuilt from nothing but its own log: every mark OrbitWorld carries is a pure function of
   its seed and when the traveller released, so the finished chart can be read back long after the
   run that drew it, without a frame of it ever having played again. */
// ---------- Replaying a run from its own log ----------
// A log is {seed, width, height, offerDifficulty, releases, resizes}: releases and resizes are
// ordered lists of the world.time each one happened at (see replayLog in ui.js, where one is kept).
// Capturing one of the three opening bodies fires a 'difficulty' event that the live game answers
// by setting the pressure multipliers on the world (setDifficulty()/syncDifficulty() in plates.js).
// A replay has no game listening for that, so it answers the event itself, the same way, with
// nothing else attached — audio, particles, and every other listener the live game carries stay out.
const REPLAY_TICK_GUARD=3000000; // ~7 hours of simulated time; a run this long could only be a bad log.
function replayRun(log){
  const world=new OrbitWorld(log.seed,log.width,log.height,(type,e)=>{
    if(type!=='difficulty')return;
    world.darknessMult=DARKNESS_MULT[e.value];world.inkMult=INK_MULT[e.value];world.perfectMult=PERFECT_MULT[e.value];world.capMult=CAP_MULT[e.value];
  },log.offerDifficulty);
  world.keepAll=true;
  const releases=log.releases||[],resizes=log.resizes||[],startedAt=log.startedAt||0;
  let ri=0,zi=0,guard=0,started=false;
  // The live clock keeps running while the traveller is still reading the frontispiece (nodes wobble
  // there too), so a release logged against world.time is only meaningful once that same idle stretch
  // has been sat through here — start() is held off, exactly like the live 'ready' state, until it has.
  while(world.state!=='dead'&&guard++<REPLAY_TICK_GUARD){
    // Checked before the tick, not after: live input lands between two ticks, on whatever world.time
    // the most recently completed one left behind, and never on the tick a release or resize is itself
    // logged against. Firing after update() here instead would let every mark answer to an orbit sweep
    // one tick further along than the one it actually answered to live.
    while(zi<resizes.length&&world.time>=resizes[zi].at){world.resize(resizes[zi].width,resizes[zi].height);zi++;}
    if(!started&&world.time>=startedAt){world.start();started=true;}
    while(ri<releases.length&&world.time>=releases[ri]){world.release();ri++;}
    world.update(FLIGHT_STEP);
  }
  return world;
}
