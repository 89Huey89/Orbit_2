/* Orbit · tools/shots/lib/scenarios.mjs
   Every *.mjs in tools/shots/scenarios/ is a scenario, found by listing the folder, so adding one is
   adding a file. A path to a file anywhere else loads the same way, for a one-off capture that does not
   belong in the shared set. */
import {readdir} from 'node:fs/promises';
import {resolve,basename} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

export const SCENARIO_DIR=fileURLToPath(new URL('../scenarios/',import.meta.url));

async function load(file){
  const mod=await import(pathToFileURL(file).href);
  const s=mod.default||mod;
  if(typeof s.run!=='function')throw new Error(`${file} does not export a scenario (a default export with run(game)).`);
  return {name:s.name||basename(file,'.mjs'),description:s.description||'',defaults:s.defaults||{},run:s.run};
}
export async function allScenarios(){
  const files=(await readdir(SCENARIO_DIR)).filter(f=>f.endsWith('.mjs')).sort();
  return Promise.all(files.map(f=>load(resolve(SCENARIO_DIR,f))));
}
// A name from the folder, or a path to a file.
export async function findScenario(spec){
  if(/[\\/]|\.mjs$/.test(spec))return load(resolve(process.cwd(),spec));
  const all=await allScenarios(),hit=all.find(s=>s.name===spec);
  if(!hit)throw new Error(`Unknown scenario "${spec}". Known: ${all.map(s=>s.name).join(', ')} (or pass a path to a .mjs file).`);
  return hit;
}
