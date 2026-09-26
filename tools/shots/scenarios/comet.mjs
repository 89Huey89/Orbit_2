// The ambient comet, forced mid-run rather than waited for: struck early while its tail is still being
// cut, and at the height of its passage, on paper and night.
export default {
  name:'comet',
  description:'The cut ambient comet, early in its passage and at its height, on paper and night.',
  defaults:{profile:'full',plate:['paper','night']},
  async run(g){
    await g.start();
    await g.fly(6);await g.advance(1.5);
    const made=await g.eval(()=>{ambience.sequence=0;const e=makeAmbientEvent(clamp(Math.floor(world.progress/8),0,3));if(!e)return false;e.visibility=1;e.age=.6;ambience.event=e;return true;});
    if(!made)return;
    await g.advance(.05);await g.shot('comet-cutting');
    await g.eval(()=>{if(ambience.event)ambience.event.age=ambience.event.life*.5;});
    await g.advance(.05);await g.shot('comet-height');
  }
};
