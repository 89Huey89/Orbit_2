// The opening leaf in each of the states a player meets it in: as first seen, with the MORE menu
// open, and the whole scrollable leaf at once.
export default {
  name:'frontispiece',
  description:'The title leaf: first visit, MORE opened, and the full scrollable page.',
  defaults:{profile:'fresh'},
  async run(g){
    await g.shot('first-visit');
    await g.shot('first-visit-full',{fullPage:true});
    await g.openMore();
    await g.shot('more-open');
  }
};
