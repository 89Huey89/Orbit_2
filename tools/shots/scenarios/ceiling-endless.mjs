// The Ceiling's Endless reading (docs/archive/eras/LINKING.md's "Endless, later"): read Endless the
// barque passes dawn at row 36 and a new night begins, hour I again after hour XII, every 36 rows. Caught
// at three points either side of the first wrap so the gate, the sun's course on Nut and the running head
// can all be checked for anything that overlaps or breaks at the seam.
export default {
  name:'ceiling-endless',
  description:'Era II (ceiling) read Endless, flown past its first dawn to the second night: rows 34, 38 and 45.',
  defaults:{era:'ceiling',hand:'oracle'},
  async run(g){
    await g.click('#reading');await g.shot('frontispiece-endless');
    await g.start();
    for(const row of [34,38,45]){
      await g.flyTo(row,{maxSeconds:240});
      const s=await g.state();if(s.state!=='playing')break;
      await g.advance(.3);
      await g.shot(`row-${row}`);
    }
  }
};
