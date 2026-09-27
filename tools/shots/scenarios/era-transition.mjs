// The Journey's change of century inside a run (JOURNEY.md stage 5): the frontier's era brought to the edge
// of known, the run flown until it becomes known and the next body is marked, then the next century growing
// out of the body landed on — part way, wider, and grown over the whole sheet. `--storage` with a Journey
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
    await g.advance(.3,{settle:.1});await g.shot('growing');
    await g.advance(.5,{settle:.1});await g.shot('wider');
    await g.advance(2);await g.shot('grown');
  }
};
