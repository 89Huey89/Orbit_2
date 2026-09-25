// Era VII deep in a run flown by the oracle hand: the dangers as a real chart deals them, the loss of signal as
// it actually climbs, and the nearest target forced mapped at each depth.
export default {
  name:'flyby-deep',
  description:'Era VII (flyby) at rows 6, 11, 16, 23, 28 and 33, with the nearest target forced mapped.',
  defaults:{era:'flyby',hand:'oracle'},
  async run(g){
    await g.start();
    for(const row of [6,11,16,23,28,33]){
      await g.flyTo(row);
      const s=await g.state();if(s.state!=='playing')break;
      await g.shot('row-'+row);
      await g.eval(()=>{const c=world.constellations.filter(c=>c.stars.length>=3).pop();if(!c)return;c.expired=false;
        const top=world.cameraY+H/scale*.3;c.stars.forEach((n,i)=>{n.y=top+[0,70,150][i];n.baseX=n.x=W/scale*[-.2,.12,-.05][i];n.visited=true;});c.completed=true;});
      await g.advance(1.6);await g.shot('row-'+row+'-target');
    }
  }
};
