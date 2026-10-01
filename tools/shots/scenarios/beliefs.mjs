// A belief kept, and corrected, in every century (src/beliefs.js, docs/KNOWLEDGE-AUDIT.md §3.2 item 7). Each
// century's preview, and the paper atlas, is flown until its belief is set beside a body, then on until the
// correction is written further up the run with the belief quoted and struck. A run the pilot loses first, or
// one too slow to reach the correction's row in the time allowed, is carried on by moving the century's first
// row down under it — the chart and the bodies are untouched, only the count the two rows are read from — so
// every century still shows its correction. The Lens keeps its pair on Mars's plate, painted last as a specimen.
const ERAS=[['era','ceiling'],['era','scroll'],['era','astrolabe'],['plate','paper'],['era','flyby'],['era','probe']];
export default {
  name:'beliefs',
  description:'Each century’s belief set on the sheet, then struck through and corrected later in the run.',
  defaults:{hand:'oracle'},
  async run(g){
    for(const [kind,name] of ERAS){
      await g.eval(()=>{if(world.state==='playing')world.die('THE DARK CAUGHT UP');});
      await g.advance(.8);
      await g.eval(()=>{if(eraId())leaveEra();});
      await g.advance(.4);
      if(kind==='era')await g.enterEra(name);else await g.setPlate(name);
      await g.start();
      for(let i=0;i<160&&!await g.eval(()=>inscriptions.some(q=>q.key==='belief'));i++)await g.fly(.25,{settle:.25});
      await g.advance(1.6);
      await g.shot(name+'-belief');
      for(let i=0;i<200&&!await g.eval(()=>world.state!=='playing'||inscriptions.some(q=>q.key==='belief-fix'));i++)await g.fly(.25,{settle:.25});
      if(!await g.eval(()=>inscriptions.some(q=>q.key==='belief-fix'))){
        if(await g.eval(()=>world.state!=='playing')){await g.eval(()=>{if(eraId())leaveEra();});await g.advance(.4);if(kind==='era')await g.enterEra(name);else await g.setPlate(name);await g.start();await g.fly(3,{settle:.25});}
        await g.eval(()=>{const b=beliefOf(journeyEraOf());world.eraFrom=Math.floor(world.progress)+2-b.fixAt;});
        for(let i=0;i<80&&!await g.eval(()=>world.state!=='playing'||inscriptions.some(q=>q.key==='belief-fix'));i++)await g.fly(.25,{settle:.25});
      }
      await g.advance(2.4);
      await g.shot(name+'-corrected');
    }
    // The Lens's own pair, on Mars's plate: flown into the glass register, then one Mars painted twice beside the
    // run as a specimen, as it develops (Lowell's canals) and once developed (struck, and Antoniadi's note).
    await g.eval(()=>{if(world.state==='playing')world.die('THE DARK CAUGHT UP');});
    await g.advance(.8);await g.eval(()=>{if(eraId())leaveEra();});await g.advance(.4);
    await g.enterEra('lens');await g.start();await g.flyTo(14);
    await g.advance(.5);
    await g.eval(()=>{ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
      for(const [d,y] of [[.45,H*.66],[1,H*.82]])lensBodyPlate({id:41,r:40,x:0,y:0},'dune',W*.22,y,d,1);ctx.restore();});
    await g.shot('lens-mars-specimen');
  }
};
