// Era IV's story beats, forced rather than waited for: a chapter door opening with its part of the
// instrument being cut, a figure set on the rete, the dangers, the frontispiece after a journey finished,
// and the finale at Samarkand.
export default {
  name:'astrolabe',
  description:'Era IV (astrolabe): a chapter reveal, a set figure, the finale, and the frontispiece with the instrument whole.',
  defaults:{era:'astrolabe'},
  async run(g){
    await g.start();
    await g.fly(1.2);await g.shot('door-1-cutting');
    await g.fly(20);
    await g.eval(()=>{chapterReveal={index:2,age:0};});await g.advance(1.6);await g.shot('door-3-cutting');
    await g.eval(()=>{const c=world.constellations.filter(c=>c.stars.length>=3&&!c.expired).sort((a,b)=>Math.abs(sy(a.stars[1].y)-H*.5)-Math.abs(sy(b.stars[1].y)-H*.5))[0];
      if(c){for(const s of c.stars)s.visited=true;c.completed=true;}});
    await g.advance(.3);await g.shot('figure-set');
    await g.eval(()=>{world.die('THE SUN ROSE',true);});await g.advance(1.4);await g.shot('finale-rising');
    await g.advance(2.4);await g.shot('finale-leaf');
    await g.tap();await g.eval(()=>{world.state='ready';});await g.advance(.3);
    await g.eval(()=>{leaveEra();enterEra('astrolabe');});await g.advance(.5);await g.shot('frontispiece-after');
  }
};
