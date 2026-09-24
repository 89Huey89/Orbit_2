// Era VI flown the whole way by the oracle hand, with nothing staged: each register's chapter opening caught
// at the moment the run reaches it, the traveller crossing both seams, and the finale of a real win at row 36.
// The run is flown on the gentlest pressure so it reaches the end; every frame of the climb is painted in
// short steps, so the seams are found the way they are in play.
async function flyToRow(g,row,max=260){
  for(let t=0;t<max;t+=.5){const s=await g.state();if(s.state!=='playing'||s.row>=row)return s;await g.fly(.5,{settle:0,paint:true});}
  return g.state();
}
export default {
  name:'lens-run',
  description:'Era VI (lens) flown to its finish: chapter openings in all three registers as reached, both seams, and the win.',
  defaults:{era:'lens',hand:'oracle',difficulty:'relaxed'},
  async run(g){
    await g.start();
    for(const [row,name] of [[6,'the-hague'],[12,'paris'],[18,'meudon'],[24,'tucson'],[30,'canaveral']]){
      const s=await flyToRow(g,row);if(s.state!=='playing')break;
      await g.advance(1.3);await g.shot(name+'-opening');
      if(row===12||row===24){await g.fly(4,{paint:true});await g.shot(name+'-after-crossing');}
    }
    await flyToRow(g,36);
    await g.advance(1);await g.shot('finale-1s');
    await g.advance(1.1);await g.shot('finale-2s');
    await g.advance(.9);await g.shot('finale-3s');
    await g.advance(1.5);await g.shot('leaf');
  }
};
