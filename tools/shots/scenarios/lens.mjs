// Era VI's story beats, forced rather than waited for: the frontispiece, a chapter opening in each register
// with Saturn drawn as that place drew it, the seams where one register gives way to the next, a resolved
// field, the finale's signature sheet, and the frontispiece after a finished run.
export default {
  name:'lens',
  description:'Era VI (lens): frontispiece, a chapter opening per register, both seams, a field, the finale and the frontispiece after.',
  defaults:{era:'lens'},
  async run(g){
    await g.shot('frontispiece');
    await g.start();
    await g.fly(1.4);await g.shot('padua-opening');
    await g.fly(12);
    // The nearest field is staged on the visible sheet and resolved, expired or not, rather than waited for.
    await g.eval(()=>{const c=world.constellations.filter(c=>c.stars.length>=3).sort((a,b)=>Math.abs(sy(a.stars[1].y)-H*.5)-Math.abs(sy(b.stars[1].y)-H*.5))[0];
      if(!c)return;const top=world.cameraY+H/scale*.22;c.stars.forEach((n,i)=>{n.y=top+[0,70,150][i];n.baseX=n.x=W/scale*[-.2,.12,-.05][i];n.visited=true;});c.expired=false;c.completed=true;});
    await g.advance(.4);await g.shot('field-resolved');
    await g.eval(()=>{chapterReveal={index:1,age:0};world.floorY=Math.max(world.floorY,world.cameraY+H/scale+400);});await g.advance(2.2);await g.shot('the-hague-ring');
    for(const [i,name] of [[2,'paris-glass'],[3,'meudon-ink'],[4,'tucson-channels'],[5,'canaveral-rendered']]){
      // forced while the run sits still, so the fog is pushed back each time: the run must still be alive when
      // the finale is forced, or no win is recorded for the frontispiece after
      await g.eval(i=>{chapterReveal={index:i,age:0};world.floorY=Math.max(world.floorY,world.cameraY+H/scale+400);},i);await g.advance(2.6);await g.shot(name);}
    await g.eval(()=>{world.die('THE SUN ROSE',true);});await g.advance(2.2);await g.shot('finale-saturns');
    await g.advance(3.2);await g.shot('finale-vulcan');
    await g.advance(1.6);await g.shot('finale-leaf');
    await g.tap();await g.eval(()=>{world.state='ready';});await g.advance(.3);
    await g.eval(()=>{leaveEra();enterEra('lens');});await g.advance(.5);await g.shot('frontispiece-after');
  }
};
