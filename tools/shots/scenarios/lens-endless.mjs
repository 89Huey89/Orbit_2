// Era VI read Endless: the sensor register held past the sixth chapter, the survey going on with no
// row it is won at (LINKING.md, docs/archive/eras/06-lens.md). Rows 34 and 38 straddle the old finish
// line at row 36; row 48 is well past it, to see the held register and chapter hold for good.
export default {
  name:'lens-endless',
  description:'Era VI (lens), read Endless, at rows 34, 38 and 48 — across and well past the old row 36 finish.',
  defaults:{era:'lens',hand:'oracle'},
  async run(g){
    await g.click('#reading');
    await g.start();
    for(const row of [34,38,48]){
      await g.flyTo(row,{maxSeconds:200});
      const s=await g.state();if(s.state!=='playing')break;
      await g.shot('row-'+row);
    }
  }
};
