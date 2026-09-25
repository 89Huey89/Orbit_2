// Era VIII's story beats, forced rather than waited for: the frontispiece, the phase openings with each drawing
// coming in, a held body caught at every stage of its reading, a system surveyed, a bill met and a daughter
// launched, the flux close under the craft, closure, and the frontispiece after a finished run.
// Flies on with the pilot until the craft is holding an orbit, so a beat forced next is shot on a live run.
async function hold(g){for(let i=0;i<40;i++){if(await g.eval(()=>world.state==='playing'&&!!world.player.node))return;await g.fly(.25,{settle:0});}}
export default {
  name:'probe',
  description:'Era VIII (probe): frontispiece, phase openings, a body at each stage, a system, a daughter, the flux, closure and the frontispiece after.',
  defaults:{era:'probe'},
  async run(g){
    await g.shot('frontispiece');
    await g.start();
    await g.fly(1.6);await g.shot('departure-opening');
    await g.fly(10);await g.shot('flight');
    // the held body staged at each stage of its reading: spectral guess, mass locked, apsides, catalogued
    for(const [d,name] of [[.06,'body-spectral'],[.2,'body-mass'],[.45,'body-apsides'],[1,'body-catalogued']]){
      await g.eval(d=>{for(const n of world.nodes){if(n.difficultyChoice||n===world.player.node||n.routeRole==='star'||['shield','reflector','dawn','inkwell','sling','gold','fading'].includes(n.type))continue;if(!n.visited)continue;n.documented=d;}},d);await g.advance(.6,{settle:0});await g.shot(name);}
    await g.eval(()=>{const c=world.constellations.filter(c=>c.stars.length>=3).sort((a,b)=>Math.abs(sy(a.stars[1].y)-H*.5)-Math.abs(sy(b.stars[1].y)-H*.5))[0];
      if(!c)return;const top=world.cameraY+H/scale*.22;c.stars.forEach((n,i)=>{n.y=top+[0,70,150][i];n.baseX=n.x=W/scale*[-.2,.12,-.05][i];n.visited=true;});c.expired=false;c.completed=true;});
    await g.advance(.4);await g.shot('system-surveyed');
    await hold(g);
    // the manifest half built, then a bill met and a daughter peeling off on its escape burn
    await g.eval(()=>{prbRun();Object.assign(prbState.got,{VOL:1.4,SIL:2,MET:0,FUEL:.5});});await g.advance(.2);await g.shot('manifest-half');
    await g.eval(()=>{Object.assign(prbState.got,{VOL:2,SIL:2,MET:1,FUEL:1});});await g.advance(1.1);await g.shot('daughter-launch');
    await hold(g);
    for(const [i,name] of [[1,'cruise-sail'],[2,'arrival-conics'],[3,'seed-drop'],[4,'factory-closure'],[5,'replication']]){
      await g.eval(i=>{chapterReveal={index:i,age:0};world.floorY=Math.max(world.floorY,world.cameraY+H/scale+400);},i);await g.advance(2.6);await g.shot(name);await hold(g);}
    await g.eval(()=>{chapterReveal={index:5,age:9};world.floorY=world.player.y+H/scale*.28;});await g.advance(.1);await g.shot('flux-close');
    await g.eval(()=>{world.floorY=world.cameraY+H/scale+400;world.die('THE SUN ROSE',true);});await g.advance(1.2);await g.shot('closure-hull');
    await g.advance(1.9);await g.shot('closure-ladder');
    await g.advance(1.6);await g.shot('closure-leaf');
    await g.tap();await g.eval(()=>{world.state='ready';});await g.advance(.3);
    await g.eval(()=>{leaveEra();enterEra('probe');});await g.advance(.5);await g.shot('frontispiece-after');
  }
};
