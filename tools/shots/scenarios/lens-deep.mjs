// Era VI deep in a run: each register as a flown run meets it, both seams on screen, and a field forced
// complete in each register.
export default {
  name:'lens-deep',
  description:'Era VI (lens) at rows 6, 11, 16, 23, 28 and 33, with the nearest field forced complete.',
  defaults:{era:'lens',hand:'oracle'},
  async run(g){
    await g.start();
    for(const row of [6,11,16,23,28,33]){
      await g.flyTo(row);
      const s=await g.state();if(s.state!=='playing')break;
      await g.shot('row-'+row);
      await g.eval(()=>{const c=world.constellations.filter(c=>c.stars.length>=3).pop();if(!c)return;c.expired=false;
        const top=world.cameraY+H/scale*.3;c.stars.forEach((n,i)=>{n.y=top+[0,70,150][i];n.baseX=n.x=W/scale*[-.2,.12,-.05][i];n.visited=true;});c.completed=true;});
      await g.advance(1.6);await g.shot('row-'+row+'-field');
    }
  }
};
