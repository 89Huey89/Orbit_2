/* Orbit · tools/shots/lib/fixtures.mjs
   What the browser remembers before the page boots. Each profile is a plain map of localStorage keys,
   written into a fresh origin by an init script, so a capture always starts from exactly the sheet it
   names rather than from whatever the last capture left behind. Add a profile here to make a new name
   available to --profile; a scenario can also layer its own keys on top with `storage`. */

// The whole catalogue earned: the same document scripts/verify.mjs seeds as FULL_LEDGER, so the
// unlocked half of every screen can be pulled as well as the empty one. Kept in step by hand, since
// verify.mjs runs its suite on import and cannot be imported from.
export const FULL_LEDGER={captures:10500,perfects:4000,bestFlow:9,constellations:{'THE LYRE':40},bestRow:88,
  deepestChapter:4,deepestHardcoreChapter:4,grazes:40,shieldsSpent:20,reflectorsSpent:10,maxSpeedSlings:400,inkwellsFound:14,badAngles:550,runs:{classic:140,relaxed:6,hardcore:20},
  playSeconds:41000,personalBests:{classic:2400,relaxed:900,hardcore:1800},
  observations:{perfectThree:6,skipFive:5,maxSpeed:3,graze:2,pureChart:2,fortyRows:9,threeMinutes:4,rightAngle:12},allFourInOneRun:true};

// Sound is off in every profile: nothing is listening, and a live AudioContext only slows the page.
const QUIET={'orbit.sound.v1':'off'};

export const PROFILES={
  // A first visit: the instructions print on the frontispiece and nothing is earned.
  fresh:{...QUIET},
  // The ordinary returning player: the tutorial seen, nothing earned yet.
  returning:{...QUIET,'orbit.tutorialSeen.v1':'1'},
  // Everything earned, with initials set and a best to beat, so every unlockable is on the sheet.
  full:{...QUIET,'orbit.tutorialSeen.v1':'1','orbit.ledger.v1':JSON.stringify(FULL_LEDGER),'orbit.initials.v1':'ORB','orbit.best.v1':'2400','orbit.bestRow.v1':'88'}
};
export const DEFAULT_PROFILE='returning';

export function resolveProfile(name){
  if(!PROFILES[name])throw new Error(`Unknown profile "${name}". Use one of: ${Object.keys(PROFILES).join(', ')}.`);
  return PROFILES[name];
}
