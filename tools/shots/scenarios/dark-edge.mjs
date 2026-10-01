// The rising dark brought to the same height on every sheet, so the boundary each century draws can be judged
// side by side: a mass with an edge, as plain on the darkest ground as on the palest.
export default {
  name:'dark-edge',
  description:'The boundary held a fixed distance under the traveller on every sheet, far and then near.',
  defaults:{era:['','rock','ceiling','scroll','astrolabe','lens','flyby','probe']},
  async run(g){
    await g.start();
    await g.fly(15);
    await g.eval(()=>{world.floorY=world.player.y+220/scale;});
    await g.advance(.05,{settle:.02});await g.shot('dark-far');
    await g.eval(()=>{world.floorY=world.player.y+110/scale;});
    await g.advance(.05,{settle:.02});await g.shot('dark-near');
  }
};
