// The high-water marks a reprieve leaves: once the traveller has landed, the flood is let rise to a close call just under
// it and turned back by a forced grace, with no hand on the run so the camera holds and the retreat shows
// the dried tide line above the receding waterline, first wet and then dried in.
export default {
  name:'tide',
  description:'A reprieve after a close call and the dried tide mark it leaves, on paper and night.',
  defaults:{profile:'full',plate:['paper','night']},
  async run(g){
    await g.start();
    await g.fly(12);await g.advance(1.5);
    await g.eval(()=>{world.floorY=Math.min(world.floorY,world.player.y+70);world.darknessGrace=4;});
    await g.advance(2.5);await g.shot('first-retreat');
    await g.advance(1.2);await g.shot('dried');
  }
};
