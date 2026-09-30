// The circle's turn (JOURNEY.md §9.1, §9.2): the Probe known inside a Journey run, the next body marked, and the
// descent from the probe's field through the stars, the world, the land and the cave to the hand that presses the
// dot on the wall (src/descent.js), taken at its stages and then with the Rock's sheet whole.
export default {
  name:'descent',
  description:'Journey: the Probe known, the circle closed, and the descent from the probe to the hand on the wall.',
  defaults:{hand:'oracle',storage:{'orbit.journey.v1':JSON.stringify({era:8,unlocked:[1,2,3,4,5,6,7,8],milestones:{sig8:true}})}},
  async run(g){
    await g.click('#journey-open');
    await g.start();
    await g.fly(6);
    await g.eval(()=>{journey.knowledge=ERA_THRESHOLD-.02;});
    for(let i=0;i<120&&!await g.eval(()=>world.transitionReady||world.eraTransitions>0||world.state!=='playing');i++)await g.fly(.2,{settle:0});
    for(let i=0;i<150&&!await g.eval(()=>world.eraTransitions>0||world.state!=='playing');i++)await g.fly(.1,{settle:0});
    let at=0;
    for(const [name,t] of [['field',.5],['stars',1.3],['world',2.0],['doubled',2.5],['clock',3.0],['land',3.6],['cave',4.2],['torch',4.75],['reach',5.4],['dot',5.8],['wall',6.3]]){
      await g.advance(t-at,{settle:.02});at=t;await g.shot(name);
    }
    await g.advance(1.5);await g.shot('whole');
  }
};
