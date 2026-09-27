// The Journey's change of century inside a run (JOURNEY.md stage 5): the frontier's era brought to the edge
// of known, the run flown until it becomes known and the next body is marked, then the next century growing
// out of the body landed on — the body itself redrawn from nothing in the new hand,
// then wider, and grown over the whole sheet. `--storage` with a Journey
// document names another frontier: '{"orbit.journey.v1":"{\"era\":5,\"unlocked\":[1,2,3,4,5]}"}'.
export default {
  name:'era-transition',
  description:'Journey: the era known inside the run, the next body marked, and the next century growing out of it.',
  defaults:{hand:'oracle'},
  async run(g){
    await g.click('#journey-open');
    await g.start();
    await g.fly(6);
    await g.eval(()=>{journey.knowledge=ERA_THRESHOLD-.02;});
    for(let i=0;i<120&&!await g.eval(()=>world.transitionReady||world.eraTransitions>0||world.state!=='playing');i++)await g.fly(.2,{settle:0});
    await g.advance(.6,{settle:.1});await g.shot('known-marked');
    for(let i=0;i<150&&!await g.eval(()=>world.eraTransitions>0||world.state!=='playing');i++)await g.fly(.1,{settle:0});
    // The body is drawn again from nothing in the new hand while the old sheet recedes round it. Pass
    // --paint-all for these first frames to show the sheet as the game paints it, every frame.
    await g.advance(.15,{settle:.05});await g.shot('landed');
    await g.advance(.35,{settle:.1});await g.shot('reinterpreting');
    await g.advance(.5,{settle:.1});await g.shot('wider');
    await g.advance(2);await g.shot('grown');
  }
};
