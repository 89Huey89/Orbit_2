// The pause leaf as the atlas's legend (docs/KNOWLEDGE-AUDIT.md §3.2, item 9): the magnitude key and the
// construction's two named lines, which the phone has no flank for, carried on the leaf on both engraved
// plates; and a century's leaf beside them, which carries no legend of the atlas's.
export default {
  name:'pause',
  description:'The pause leaf with the atlas\'s legend, after twenty seconds of flight, and a century\'s leaf without it.',
  defaults:{plate:['night','paper']},
  async run(g){
    await g.start();
    await g.fly(20);
    await g.pause();
    await g.shot('paused');
    await g.shot('paused-leaf',{selector:'.pause-leaf'});
    await g.resume();
    await g.die();
    await g.enterEra('scroll');
    await g.start();
    await g.fly(6);
    await g.pause();
    await g.shot('era-paused');
  }
};
