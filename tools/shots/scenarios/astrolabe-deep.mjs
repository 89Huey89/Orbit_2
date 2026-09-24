// Era IV deep in a run: the dangers, the gifts and a figure set on the rete, as a flown run meets them.
export default {
  name:'astrolabe-deep',
  description:'Era IV (astrolabe) at rows 8, 14, 20 and 26, with the nearest figure forced complete.',
  defaults:{era:'astrolabe',hand:'oracle'},
  async run(g){
    await g.start();
    for(const row of [8,14,20,26]){
      await g.flyTo(row);
      const s=await g.state();if(s.state!=='playing')break;
      await g.shot('row-'+row);
      // A figure is staged on the visible sheet rather than waited for: its three stars are carried into view.
      await g.eval(()=>{const c=world.constellations.filter(c=>c.stars.length>=3&&!c.expired).pop();if(!c)return;
        const top=world.cameraY+H/scale*.3;c.stars.forEach((n,i)=>{n.y=top+[0,70,150][i];n.baseX=n.x=W/scale*[.3,.62,.4][i];n.visited=true;});c.completed=true;});
      await g.advance(1.6);await g.shot('row-'+row+'-figure');
    }
  }
};
