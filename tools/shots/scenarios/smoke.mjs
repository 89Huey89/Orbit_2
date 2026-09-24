// The quickest look there is: the frontispiece and eight seconds of flight. Cheap enough to run
// across every viewport at once (`--viewport=all`) after any change to layout or type.
export default {
  name:'smoke',
  description:'Frontispiece, then eight seconds of flight (past the opening row).',
  async run(g){
    await g.shot('frontispiece');
    await g.start();
    await g.fly(8);
    await g.shot('flight-8s');
  }
};
