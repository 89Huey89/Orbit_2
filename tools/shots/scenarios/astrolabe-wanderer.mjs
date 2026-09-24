// Era IV's wanderers: the first chapter's planet (always the body after the opening, since it is the only
// plain row Baghdad has) while its scale is still being struck and its track pricked, then held long enough
// for the scale to close and its name to be set, and the frontispiece's fihrist counting it afterwards.
export default {
  name:'astrolabe-wanderer',
  description:'Era IV (astrolabe): a wanderer sighted — its track pricked, its name set, and the fihrist counting it.',
  defaults:{era:'astrolabe'},
  async run(g){
    await g.start();
    for(let i=0;i<400&&!(await g.eval(()=>world.player.node&&world.player.node.row>=6&&astroWanderer(world.player.node)>=0));i++)await g.fly(.25,{settle:0});
    await g.eval(()=>{world.player.orbitSweep=SWEEP_FULL*.45;});await g.advance(.2);await g.shot('wanderer-striking');
    await g.eval(()=>{world.player.orbitSweep=SWEEP_FULL;});await g.advance(1.2);await g.shot('wanderer-named');
    const at=await g.eval(()=>{const n=world.player.node;return{x:Math.max(0,sx(n.x)-110),y:Math.max(0,sy(n.y)-90)};});await g.shot('wanderer-close',{clip:{x:at.x,y:at.y,width:220,height:180}});
    await g.eval(()=>{world.die('THE SUN ROSE',true);});await g.advance(4);await g.shot('wanderer-leaf');
    await g.tap();await g.eval(()=>{world.state='ready';});await g.advance(.3);
    await g.eval(()=>{leaveEra();enterEra('astrolabe');});await g.advance(.5);await g.shot('wanderer-frontispiece');
  }
};
