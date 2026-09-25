// Era VII's story beats, forced rather than waited for: the frontispiece, the encounter openings with each
// frame coming down in its own manner, a held body caught at every stage of its picture, a target mapped, the
// loss of signal close under the craft, the finale's strip chart, and the frontispiece after a finished run.
// Flies on with the pilot until the craft is holding an orbit, so a beat forced next is shot on a live run.
async function hold(g){for(let i=0;i<40;i++){if(await g.eval(()=>world.state==='playing'&&!!world.player.node))return;await g.fly(.25,{settle:0});}}
export default {
  name:'flyby',
  description:'Era VII (flyby): frontispiece, encounter openings, a body at each stage, a target, LOS, the finale and the frontispiece after.',
  defaults:{era:'flyby'},
  async run(g){
    await g.shot('frontispiece');
    await g.start();
    await g.fly(1.6);await g.shot('mars-opening');
    await g.fly(10);await g.shot('flight');
    // the held body staged at each stage of its picture: raster, mosaic, seams closing, the margin
    for(const [d,name] of [[.12,'body-scan'],[.34,'body-mosaic'],[.62,'body-seams'],[1,'body-mapped']]){
      await g.eval(d=>{for(const n of world.nodes){if(n.difficultyChoice||n===world.player.node||n.routeRole==='star'||['shield','reflector','dawn','inkwell','sling','gold','fading'].includes(n.type))continue;if(!n.visited)continue;n.documented=d;}},d);await g.advance(.6,{settle:0});await g.shot(name);}
    await g.eval(()=>{const c=world.constellations.filter(c=>c.stars.length>=3).sort((a,b)=>Math.abs(sy(a.stars[1].y)-H*.5)-Math.abs(sy(b.stars[1].y)-H*.5))[0];
      if(!c)return;const top=world.cameraY+H/scale*.22;c.stars.forEach((n,i)=>{n.y=top+[0,70,150][i];n.baseX=n.x=W/scale*[-.2,.12,-.05][i];n.visited=true;});c.expired=false;c.completed=true;});
    await g.advance(.4);await g.shot('target-mapped');
    await hold(g);
    for(const [i,name] of [[1,'viking-scan'],[2,'io-plume'],[3,'uranus-lightcurve'],[4,'neptune-mosaic'],[5,'pluto-colour']]){
      await g.eval(i=>{chapterReveal={index:i,age:0};world.floorY=Math.max(world.floorY,world.cameraY+H/scale+400);},i);await g.advance(i===3?1.4:2.6);await g.shot(name);await hold(g);}
    await g.eval(()=>{world.floorY=world.player.y+H/scale*.28;});await g.advance(.1);await g.shot('los-close');
    await g.eval(()=>{world.floorY=world.cameraY+H/scale+400;world.die('THE SUN ROSE',true);});await g.advance(2.2);await g.shot('finale-chart');
    await g.advance(2.2);await g.shot('finale-log');
    await g.advance(1.6);await g.shot('finale-leaf');
    await g.tap();await g.eval(()=>{world.state='ready';});await g.advance(.3);
    await g.eval(()=>{leaveEra();enterEra('flyby');});await g.advance(.5);await g.shot('frontispiece-after');
  }
};
