// The standalone era doors: each wall's frontispiece, a run on it, and its own end leaf.
export default {
  name:'eras',
  description:'Era I (rock) and Era II (ceiling): frontispiece, flight, and end leaf.',
  defaults:{era:['rock','ceiling']},
  async run(g){
    await g.shot('frontispiece');
    await g.start();
    await g.fly(3);await g.shot('flight-3s');
    await g.fly(12);await g.shot('flight-15s');
    await g.die();
    await g.shot('end');
  }
};
