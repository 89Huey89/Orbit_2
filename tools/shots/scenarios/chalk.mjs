// The setting-out laid before the ink on the paper plate: the sheet's marks are begun again and caught while
// the chalk stub is still running its sanguine trial arcs ahead of the pen, then once the rings are cut.
export default {
  name:'chalk',
  description:'Red-chalk setting-out swept on ahead of the graver as the orbit rings arrive (paper), and the graver itself (both plates).',
  defaults:{profile:'full',plate:['paper','night']},
  async run(g){
    await g.start();
    await g.fly(3);
    await g.eval(()=>{reveal.reset();});
    await g.advance(.22,{settle:0});await g.shot('chalk-leading');
    await g.advance(1.4,{settle:0});await g.shot('cut');
  }
};
