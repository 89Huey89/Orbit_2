// Era IV's Endless reading (docs/archive/eras/LINKING.md): the frontispiece's reading switch, then rows
// on either side of the Chronicle's own finish at row 36 — short of it, just past it with the sixth door
// held and the instrument complete, and well past it, to see the sheet still reads sanely deep into a
// run the Zij never closes.
export default {
  name:'astrolabe-endless',
  description:'Era IV (astrolabe), read Endless: the frontispiece switch, and rows 34, 38 and 48.',
  defaults:{era:'astrolabe',hand:'oracle'},
  async run(g){
    await g.shot('frontispiece-chronicle');
    await g.click('#reading');await g.shot('frontispiece-endless');
    await g.start();
    for(const row of [34,38,48]){
      await g.flyTo(row,{maxSeconds:300});
      const s=await g.state();if(s.state!=='playing')break;
      await g.shot('row-'+row);
    }
  }
};
