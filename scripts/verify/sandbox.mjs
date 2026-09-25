/* The simulation slice's own sandbox: extracting the sim API off src/simulation.js's vm context,
   and the live bindings every module in this suite reads it through. */
import vm from 'node:vm';

// Every seed-loop and full-page scenario is flown at this fixed physics step.
export const step=1/120;

// The heavy blocks (taskRoute60, taskDetourDeep, taskSling60 in tasks.mjs, runtime in runtime.mjs) are each an independent,
// seeded simulation that never reads or writes another's state, so they are handed to worker threads
// and run in parallel instead of one after another. Every one of them is written exactly as it would
// be inline — reading these free variables rather than taking parameters — so a worker just needs to
// populate them (from its own vm sandbox, or from workerData) before calling the task it was asked for.
export let OrbitWorld,segmentCircle,segmentCapsuleTime,segmentSegmentDist,tangentPaths,orbitTangents,transferContact,nodeMotion,pointSegment,gravityRadius,hazardCore,hazardKind,bendVelocity,flightStep,CONSTELLATIONS,OBSERVATIONS,BASE_SPEED,MAX_SPEED,SWEEP_FULL,STAR_GAIN,GRAZE_MINIMUM,INK_PERFECT_GAIN,INK_CAPTURE_GAIN,INK_ORBIT_GAIN,POWERUP_LABELS,DARKNESS_RESCUE_DROP,DARKNESS_RESCUE_GRACE,RELEASE_GRACE;
// The bundled page script, set once by the driver (and again inside a worker from workerData) before
// runtime() is called — held here so every module that reads it sees the same live binding.
export let script;
export function setScript(s){script=s;}

// A name looked up on a vm context's global object goes through the interceptor V8 installs on every
// contextified sandbox, which is many times slower than an ordinary global, and the simulation and the
// page's own bakes ask for Math.min, Math.max and Math.hypot millions of times — that lookup alone was
// most of the suite's wall time. Binding Math once as a script-scope constant, which every later script
// in the same context resolves before it ever reaches the global object, puts it back on the fast path.
// It is the same Math either way, so nothing the code computes changes.
export const FAST_GLOBALS='const Math=globalThis.Math;';

// Runs the extracted `// BEGIN SIMULATION`/`// END SIMULATION` slice of src/simulation.js in its own
// vm sandbox and returns the named globals verify.mjs needs off it — the same slice-and-pull the file
// has always done, just callable once per thread instead of once for the whole process.
export function simSandbox(simulation){
  const sandbox={};vm.createContext(sandbox);vm.runInContext(FAST_GLOBALS,sandbox);
  vm.runInContext(simulation+'\nthis.api={OrbitWorld,segmentCircle,segmentCapsuleTime,segmentSegmentDist,tangentPaths,orbitTangents,transferContact,nodeMotion,pointSegment,gravityRadius,hazardCore,hazardKind,bendVelocity,flightStep,CONSTELLATIONS,OBSERVATIONS,BASE_SPEED,MAX_SPEED,SWEEP_FULL,STAR_GAIN,GRAZE_MINIMUM,INK_PERFECT_GAIN,INK_CAPTURE_GAIN,INK_ORBIT_GAIN,POWERUP_LABELS,DARKNESS_RESCUE_DROP,DARKNESS_RESCUE_GRACE,RELEASE_GRACE};',sandbox);
  return sandbox.api;
}
export function useSimulationApi(api){
  ({OrbitWorld,segmentCircle,segmentCapsuleTime,segmentSegmentDist,tangentPaths,orbitTangents,transferContact,nodeMotion,pointSegment,gravityRadius,hazardCore,hazardKind,bendVelocity,flightStep,CONSTELLATIONS,OBSERVATIONS,BASE_SPEED,MAX_SPEED,SWEEP_FULL,STAR_GAIN,GRAZE_MINIMUM,INK_PERFECT_GAIN,INK_CAPTURE_GAIN,INK_ORBIT_GAIN,POWERUP_LABELS,DARKNESS_RESCUE_DROP,DARKNESS_RESCUE_GRACE,RELEASE_GRACE}=api);
}
