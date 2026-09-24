// The press's own moments (src/press.js), forced on the reference phone rather than waited for: the
// strike and emboss of a perfect landing, a nova's rays struck across the chart, a constellation's second
// colour at three points of its sweep, the sheet's foxing at its late stages, and the blot a hazard death
// leaves. Each is staged on the traveller's own ring or the nearest figure; the wet sheen shows in flight.
export default {
  name:'press',
  description:'The strike, the nova, the second colour, late foxing and the hazard blot, forced mid-run on night and paper.',
  defaults:{profile:'full',plate:['night','paper']},
  async run(g){
    await g.start();
    await g.fly(8);
    await g.eval(()=>pressEvent('capture',{perfect:true,steep:false,n:world.player.node||world.nodes[0]}));
    await g.advance(.05);await g.shot('strike-emboss');
    await g.shot('wet-sheen-in-flight');
    await g.eval(()=>{const n=world.nodes.find(n=>n.type==='sling'&&sy(n.y)>80&&sy(n.y)<H-120)||world.player.node||world.nodes[0];pressNovae.push({node:n,age:0,seed:7});});
    await g.advance(.12);await g.shot('nova-struck');
    const found=await g.eval(()=>{
      const c=world.constellations.filter(c=>c.stars.length>=3&&!c.expired).sort((a,b)=>Math.abs(sy(a.stars[1].y)-H*.5)-Math.abs(sy(b.stars[1].y)-H*.5))[0];
      if(!c)return false;for(const s of c.stars)s.visited=true;c.completed=true;c.flash=2.4;return true;});
    if(found){
      await g.advance(.25);await g.shot('second-colour-sweep');
      await g.advance(.5);await g.shot('second-colour-settled');
      await g.advance(1);await g.shot('second-colour-drying');
    }
    await g.eval(()=>{world.elapsed=400;});await g.advance(.05);await g.shot('foxing-late');
    await g.eval(()=>{const p=world.player;event('death',{x:p.x,y:p.y,reason:'A VORTEX'});});
    await g.advance(.2);await g.shot('hazard-blot');
  }
};
