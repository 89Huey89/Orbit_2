// The frame arriving as an impression on the opening sheet: the plate-mark biting in, the engraved layer
// rolling down the sheet off register, and the pull settled, on paper and night.
export default {
  name:'pressframe',
  description:'The frame printed by the press at the start of a run: the bite, the roll, the settle.',
  defaults:{profile:'full',plate:['paper','night']},
  async run(g){
    await g.start();
    await g.eval(()=>{reveal.reset&&reveal.reset();});
    await g.advance(.2,{settle:0});await g.shot('bite');
    await g.advance(.25,{settle:0});await g.shot('roll');
    await g.advance(.6,{settle:0});await g.shot('settled');
  }
};
