// How the sheet looks when a run has gone deep: past the chapter turns, with the trail long behind it.
export default {
  name:'deep',
  description:'Flies to rows 20, 40 and 60 and captures each.',
  defaults:{profile:'full'},
  async run(g){
    await g.start();
    for(const row of [20,40,60]){
      await g.flyTo(row);
      const s=await g.state();
      if(s.state!=='playing')break;
      await g.shot(`row-${row}`);
    }
  }
};
