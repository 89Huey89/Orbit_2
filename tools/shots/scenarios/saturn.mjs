// Saturn as the century saw it, staged side by side on one sheet: the ringed body drawn through its
// observation at 30%, 62%, 85%, 94% and complete — the handles of 1610 growing from the limb, coming away
// as ansae, and the ring opening only at the close. Drawn over the opening sheet rather than flown to.
export default {
  name:'saturn',
  description:'The ringed body at five stages of observation: tricorporeal, ansae, ring opening, ring.',
  defaults:{profile:'full',plate:['paper','night']},
  async run(g){
    await g.start();await g.fly(2);
    await g.eval(()=>{const o=render;render=function(...a){o.apply(this,a);ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
      const n=world.nodes.find(n=>n.difficultyChoice==='classic');const art=glyph(n.seed,n.type,n.row,world.seed,'classic');
      [.3,.62,.85,.94,1].forEach((d,i)=>{const pen={t:1,d,taken:1,ring:1,done:d>=1,age:Infinity,keyline:revealSpan(d,0,.4),hatch:revealSpan(d,.28,.62),wash:revealSpan(d,.36,.84),survey:revealSpan(d,.58,1)};
        ctx.save();ctx.translate(i<3?75+i*140:145+(i-3)*140,i<3?250:430);revealPlanet(art,60,0,pen,n.seed,null);ctx.restore();});ctx.restore();};});
    await g.advance(.05);await g.shot('stages');
  }
};
