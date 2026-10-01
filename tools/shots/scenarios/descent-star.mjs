// The descent that ends a round which followed a star (src/onestar.js): the same fall as `descent`, closing the second
// round, so the dot the hand presses is lettered with the Pleiades.
import descent from './descent.mjs';
export default {
  ...descent,
  name:'descent-star',
  description:'Journey round 2: the circle closed, and the descent ending on the dot lettered with the round’s star.',
  defaults:{...descent.defaults,storage:{'orbit.journey.v1':JSON.stringify({era:8,rounds:1,unlocked:[1,2,3,4,5,6,7,8],milestones:{sig8:true}})}}
  // The same stages as the plain descent: the name stands over the dot from `dot` to past `wall`.
};
