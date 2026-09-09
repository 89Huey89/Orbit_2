'use strict';
/* Orbit · src/replay.js
   A run rebuilt from nothing but its own log: every mark OrbitWorld carries is a pure function of
   its seed and when the traveller released, so the finished chart can be read back long after the
   run that drew it, without a frame of it ever having played again. */
// ---------- Replaying a run from its own log ----------
// A log is {seed, width, height, offerDifficulty, varyOpening, releases, resizes}: releases and
// resizes are ordered lists of the world.time each one happened at (see replayLog in ui.js, where one
// is kept). varyOpening is read the same permissive way an older saved log already reads a field it
// predates — undefined falls through to OrbitWorld's own default of an ordinary, unvaried opening.
// Capturing one of the three opening bodies fires a 'difficulty' event that the live game answers
// by setting the pressure multipliers on the world (setDifficulty()/syncDifficulty() in plates.js).
// A replay has no game listening for that, so it answers the event itself, the same way, with
// nothing else attached — audio, particles, and every other listener the live game carries stay out.
const REPLAY_TICK_GUARD=3000000; // ~7 hours of simulated time; a run this long could only be a bad log.
function replayRun(log){
  // recordDeparture/recordLanding/sampleInkPath (src/effects.js) read and write through the shared
  // `world` binding, the same way every other painter in this file does — so it is pointed at the
  // world being rebuilt for the whole of the loop below, and put back the way it was found afterward.
  const savedWorld=world;
  const w=new OrbitWorld(log.seed,log.width,log.height,(type,e)=>{
    if(type==='difficulty'){w.darknessMult=DARKNESS_MULT[e.value];w.inkMult=INK_MULT[e.value];w.perfectMult=PERFECT_MULT[e.value];w.capMult=CAP_MULT[e.value];}
    // The departure and landing are surveyed exactly as they are live (see event() in src/ui.js), so a
    // reviewed plate carries the same release bearings and arrival angles the run itself was drawn with.
    else if(type==='release')recordDeparture(e);
    else if(type==='capture')recordLanding(e);
  },log.offerDifficulty,log.varyOpening);
  world=w;w.keepAll=true;
  const releases=log.releases||[],resizes=log.resizes||[],startedAt=log.startedAt||0;
  let ri=0,zi=0,guard=0,started=false;
  // The live clock keeps running while the traveller is still reading the frontispiece (nodes wobble
  // there too), so a release logged against world.time is only meaningful once that same idle stretch
  // has been sat through here — start() is held off, exactly like the live 'ready' state, until it has.
  while(w.state!=='dead'&&guard++<REPLAY_TICK_GUARD){
    // Checked before the tick, not after: live input lands between two ticks, on whatever world.time
    // the most recently completed one left behind, and never on the tick a release or resize is itself
    // logged against. Firing after update() here instead would let every mark answer to an orbit sweep
    // one tick further along than the one it actually answered to live.
    while(zi<resizes.length&&w.time>=resizes[zi].at){w.resize(resizes[zi].width,resizes[zi].height);zi++;}
    if(!started&&w.time>=startedAt){w.start();started=true;}
    while(ri<releases.length&&w.time>=releases[ri]){w.release();ri++;}
    w.update(FLIGHT_STEP);
    // Sampled every physics tick rather than once a rendered frame, the way the live route is: a replay
    // never misses a frame, so the dry route it lays down is at least as faithful as the one flown live.
    sampleInkPath();
  }
  world=savedWorld;
  return w;
}
