// Free Play's doors as shipped (JOURNEY.md §9.1): a player whose Journey has reached only the Rock sees every
// other century's door named for its first chapter, flies the Scroll's first chapter, and closes on its leaf.
export default {
  name:'proof',
  description:'The frontispiece with gated doors, a proof chapter of the Scroll flown to its end, and its leaf.',
  defaults:{hand:'oracle',gates:true,storage:{'orbit.journey.v1':JSON.stringify({era:1,unlocked:[1,5]})}},
  async run(g){
    await g.openMore();
    await g.shot('doors');
    await g.eval(()=>{enterEra('scroll');});await g.advance(.5);
    await g.shot('proof-frontispiece');
    await g.start();
    await g.flyTo(8);
    await g.advance(3);
    await g.shot('proof-leaf');
  }
};
