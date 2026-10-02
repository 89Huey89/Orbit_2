// The atlas's harder Endless reading (ENDLESS-HARD.md): the slipped strokes it deals, named once, on the
// reference sheet. The reading is set in storage, as a player who chose it last time would find it.
export default {
  name:'slipped',
  description:'The atlas read ENDLESS · SLIPPED STROKES: the frontispiece, then rows 8, 14 and 22 with the strokes on the chart.',
  defaults:{profile:'full',storage:{'orbit.reading.v1':'{"atlas":"hard"}'}},
  async run(g){
    await g.shot('frontispiece');
    await g.start();
    for(const row of [8,14,22]){
      await g.flyTo(row);
      const s=await g.state();
      if(s.state!=='playing')break;
      await g.shot(`row-${row}`);
    }
    // However the run ends, its colophon names the loss: a slipped stroke has its own line.
    const s=await g.state();if(s.state==='playing')await g.die('FELL INTO THE CHASM');else await g.advance(2.2);
    await g.shot('end',{note:(await g.state()).reason});
  }
};
