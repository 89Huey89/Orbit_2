// The lettered specimen: every body on the sheet is marked fully observed (a staging, not a run), so each carries its Latin
// species round the top of its rim (or the foot, where the top is taken), on night and paper.
export default {
  name:'specimen',
  description:'Fully observed bodies lettered with their Latin species, on night and paper.',
  defaults:{profile:'full',plate:['paper','night']},
  async run(g){
    await g.start();
    await g.fly(14);
    await g.eval(()=>{for(const n of world.nodes)n.documented=1;world.player.orbitSweep=SWEEP_FULL;});
    await g.advance(.3);await g.shot('writing');
    await g.advance(1.5);await g.shot('lettered');
  }
};
