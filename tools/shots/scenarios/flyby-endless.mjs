// Era VII's Endless reading (LINKING.md, and the era's own defineVoice comment): the frontispiece's
// reading switch, then rows on both sides of Pluto — the sixth encounter still open, the sixth encounter
// held once the Chronicle's own finish line at row 36 has passed, and well past it, to see that nothing
// past the last encounter reads as broken (no chapter announced again, no HUD or title-mark garbage).
export default {
  name:'flyby-endless',
  description:'Era VII (flyby), read Endless: the reading switch, then rows 34 (still Pluto ahead), 38 and 48 (Pluto held, the craft going on).',
  defaults:{era:'flyby',hand:'oracle'},
  async run(g){
    await g.shot('frontispiece-chronicle');
    await g.click('#reading');
    await g.shot('frontispiece-endless');
    await g.start();
    for(const row of [34,38,48]){
      await g.flyTo(row,{maxSeconds:320});
      const s=await g.state();if(s.state!=='playing')break;
      await g.shot('row-'+row);
    }
  }
};
