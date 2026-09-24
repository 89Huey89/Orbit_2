// A seeded run flown by the pilot, taken at the moments the art review found most telling: the
// opening row, the first captures, and a run well under way. Ends on the pause leaf.
export default {
  name:'run',
  description:'A seeded run at 1.5 s, 8 s, 30 s and 60 s of flight, then paused.',
  async run(g){
    await g.start();
    await g.fly(1.5,{settle:1});await g.shot('flight-1.5s');
    await g.fly(6.5);await g.shot('flight-8s');
    await g.fly(22);await g.shot('flight-30s');
    await g.fly(30);await g.shot('flight-60s');
    await g.pause();await g.shot('paused');
  }
};
