// The Journey's door (docs/archive/eras/LINKING.md): the atlas's frontispiece with it, the frontier's own
// frontispiece naming the milestone worked toward, the leaf after a run that opened one, the leaf of a run
// that made the era known, and the next century's frontispiece the page turns to.
export default {
  name:'journey',
  description:'The Journey door, a run on the frontier, a milestone on the leaf, and the page turned to the next era.',
  defaults:{hand:'oracle'},
  async run(g){
    await g.shot('atlas-frontispiece');
    await g.click('#journey-open');
    await g.shot('frontier-frontispiece');
    await g.start();
    await g.fly(20);
    await g.die();
    await g.shot('end-milestone');
    // The era is carried to the edge of known and the next run's first landings take it over.
    await g.tap();
    await g.fly(6);
    await g.eval(()=>{journey.knowledge=25;});
    await g.die();
    await g.shot('end-known');
    await g.eval(()=>{world.player.deadTime=10;});
    await g.tap();
    await g.advance(.6);
    await g.shot('next-era-frontispiece');
  }
};
