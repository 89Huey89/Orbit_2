// One star, eight names in its sixth round (src/onestar.js): the same captures as `onestar`, the round following
// Vega, with Altair in the notes, so every century's line for the pair's entry and its Record page can be seen.
import onestar from './onestar.mjs';
export default {
  ...onestar,
  name:'onestar-vega',
  description:'Journey round 6: Vega, the Weaver Girl, named in each century’s hand, Altair in the notes, and the Record’s page.',
  defaults:{...onestar.defaults,storage:{'orbit.journey.v1':JSON.stringify({era:1,rounds:5,unlocked:[1,2,3,4,5,6,7,8],milestones:{}})}},
  run:(g,options={})=>onestar.run(g,{...options,round:6})
};
