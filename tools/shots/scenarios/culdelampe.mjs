// The cul-de-lampe the flood uncovers at the foot of the sheet: the ink is let rise high under the landed
// traveller, as it stands at the most pressed moment of a deep run, on paper and night.
export default {
  name:'culdelampe',
  description:'The tailpiece cut into the flood at the foot of the sheet, with the ink risen high, on paper and night.',
  defaults:{profile:'full',plate:['paper','night']},
  async run(g){
    await g.start();
    await g.fly(12);await g.advance(1.5);
    await g.eval(()=>{world.floorY=Math.min(world.floorY,world.player.y+110);});
    await g.advance(.2);await g.shot('flood-high');
  }
};
