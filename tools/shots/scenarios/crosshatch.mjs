// The seven worlds drawn large side by side, for judging the hatching and the surface marks. The crossing
// question (ART-AUDIT-TODO, finding i) was settled by pulling this twice; run it again with
// --storage='{"orbit.crosshatch.trial":"off"}' to see the single-slant reading beside the crossed one.
export default {
  name:'crosshatch',
  description:'The seven worlds large, specimens in flight and a figure, for judging hatching and surface marks.',
  defaults:{profile:'full',plate:['paper','night']},
  async run(g){
    await g.start();await g.fly(2);
    await g.eval(()=>{const o=render;render=function(...a){o.apply(this,a);ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
      const n=world.nodes.find(n=>!n.difficultyChoice&&!PICKUP_FAMILIES.has(n.type));
      ctx.fillStyle=onPaper()?'rgba(236,224,196,.92)':'rgba(14,20,30,.92)';ctx.fillRect(0,150,W,560);
      for(let i=0;i<7;i++){const art=glyph(n.seed+i*977,n.type,i,world.seed,null);
        const pen={t:1,d:1,taken:1,ring:1,done:true,age:Infinity,keyline:1,hatch:1,wash:1,survey:1};
        ctx.save();ctx.translate(75+(i%3)*140,240+Math.floor(i/3)*170);revealPlanet(art,62,0,pen,n.seed+i*977,null);ctx.restore();}
      ctx.restore();};});
    await g.advance(.05);await g.shot('worlds-large');
  }
};
