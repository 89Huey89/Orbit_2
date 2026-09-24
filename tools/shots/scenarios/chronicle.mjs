// The two readings of a century that offers both (docs/archive/eras/LINKING.md): its frontispiece on the
// Chronicle and on Endless, and the Chronicle flown to its ending, forced at the last row if the pilot
// has not reached it, so the won leaf is always taken.
export default {
  name:'chronicle',
  description:'Era I (rock) and Era III (scroll): the reading switch on the frontispiece, and the won end leaf.',
  defaults:{era:['rock','scroll'],hand:'oracle'},
  async run(g){
    await g.shot('frontispiece-chronicle');
    await g.click('#reading');await g.shot('frontispiece-endless');
    await g.click('#reading');
    await g.start();
    await g.flyTo(30,{maxSeconds:180});
    await g.eval(()=>{if(world.state==='playing'){world.progress=world.goalRow;world.die('THE SUN ROSE',true);}});
    await g.advance(3);
    await g.shot('end-won');
  }
};
