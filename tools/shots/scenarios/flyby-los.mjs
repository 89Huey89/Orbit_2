// Era VII as the link fails (JOURNEY.md §9.1, "vacuum as measurement"): a run flown a while, then the edge of
// LOS brought up under the craft, so the margins' traces go flat over it, the stars hold in their parallax and
// the network's AOS turns LOS; then the edge let fall away again and lock regained.
export default {
  name:'flyby-los',
  description:'Era VII with lock held, then LOS brought up under the craft, then lock regained.',
  defaults:{era:'flyby',hand:'oracle'},
  async run(g){
    await g.start();
    await g.fly(8);
    await g.shot('lock-held');
    await g.eval(()=>{world.floorY=world.player.y+34;});await g.advance(.12);
    await g.shot('lock-lost');
    await g.eval(()=>{world.floorY=world.player.y+34;});await g.idle(.5);await g.eval(()=>{world.floorY=world.player.y+34;});await g.advance(.1);
    await g.shot('lock-lost-climbing');
    await g.eval(()=>{world.floorY=world.player.y+600;});await g.advance(.4);
    await g.shot('lock-regained');
  }
};
