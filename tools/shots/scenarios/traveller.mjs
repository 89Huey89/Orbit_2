// The traveller close up, cropped round the point the simulation actually flies, so a mark whose drawn point
// strays from it shows at once: in flight and on an orbit, as the comet every century flies by default and
// then as the century's own instrument, earned and chosen (instrumentOn(), src/journey.js).
export default {
  name:'traveller',
  description:'The traveller cropped round its true point, as the comet and as the century\'s own instrument.',
  defaults:{profile:'full',era:['rock','ceiling','scroll','astrolabe','lens','flyby','probe']},
  async run(g){
    await g.start();
    for(const [at,label] of [[4,'early'],[9,'mid']]){
      await g.fly(at===4?4:5);
      for(const tool of [false,true]){
        await g.eval(tool=>{instrumentsOn=tool;if(tool)for(const e of [1,2,3,4,6,7,8])if(!journey.unlocked.includes(e))journey.unlocked.push(e);},tool);
        await g.advance(1/60);
        const p=await g.eval(()=>({x:sx(world.player.x),y:sy(world.player.y),node:!!world.player.node}));
        const S=180;await g.shot(`${label}-${p.node?'orbit':'flight'}-${tool?'instrument':'comet'}`,{clip:{x:Math.max(0,p.x-S/2),y:Math.max(0,p.y-S/2),width:S,height:S}});
      }
      await g.eval(()=>{instrumentsOn=false;});
    }
  }
};
