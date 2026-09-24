// Era VI's change of medium inside a run (JOURNEY.md stage 5, tried inside one century first): the glass
// plate growing out of the body landed on past row 12, caught part way and grown, then the sensor past 24.
export default {
  name:'lens-transition',
  description:'Era VI: the next register growing out of the transition body, part way and complete, twice.',
  defaults:{era:'lens',hand:'oracle'},
  async run(g){
    await g.start();
    for(const [k,row] of [[0,12],[1,24]]){
      await g.flyTo(row-4,{maxSeconds:200});
      // Close in a fifth of a second at a time, so the change is caught as it starts rather than seconds on.
      for(let i=0;i<150&&await g.eval(()=>world.state==='playing'&&lensGrowths().length)<=k;i++)await g.fly(.2,{settle:0});
      const s=await g.state();if(s.state!=='playing')break;
      await g.advance(.35,{settle:.1});await g.shot('row-'+row+'-growing');
      await g.advance(.4,{settle:.1});await g.shot('row-'+row+'-wider');
      await g.advance(1.5);await g.shot('row-'+row+'-grown');
    }
  }
};
