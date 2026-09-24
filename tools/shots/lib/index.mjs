/* Orbit · tools/shots/lib/index.mjs
   The harness as a library, for a script that wants a page of the game in hand without writing a
   scenario file: `await shoot({viewport:'iphone-se',plate:'paper'},async g=>{...})`. */
export {run,BASE_OPTIONS} from './runner.mjs';
export {VIEWPORTS,resolveViewport} from './viewports.mjs';
export {PROFILES,FULL_LEDGER} from './fixtures.mjs';
export {Game} from './game.mjs';
import {run} from './runner.mjs';
import {fileURLToPath} from 'node:url';

export function shoot(options,fn,{name='adhoc',out=fileURLToPath(new URL('../out/',import.meta.url)),...rest}={}){
  return run({scenarios:[{name,description:'',defaults:{},run:fn}],cli:options,out,...rest});
}
