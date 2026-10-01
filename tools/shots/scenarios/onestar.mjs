// One star, eight names (JOURNEY.md §9.2, src/onestar.js): a Journey in its second round, so every century follows
// the Pleiades. Each century is opened as the frontier in turn and flown until the star's name is set beside its
// body, then until it is landed on and its note said; last, the atlas's Record with what was met. `--round=3`
// (through `--storage`) is not needed: `options.round`, if a scenario wrapper sets it, picks another star.
export default {
  name:'onestar',
  description:'Journey round 2: the round’s star named in each century’s hand, its note, and the catalogue’s page.',
  defaults:{hand:'oracle',storage:{'orbit.journey.v1':JSON.stringify({era:1,rounds:1,unlocked:[1,2,3,4,5,6,7,8],milestones:{}})}},
  async run(g,options={}){
    const rounds=Math.max(1,(Number(options.round)||2)-1);
    for(let era=1;era<=8;era++){
      await g.eval(([e,r])=>{
        if(world.state==='playing')world.die('THE DARK CAUGHT UP');
        if(runMode==='journey'){if(plateOwns('mode'))leaveEra();else toggleJourney();}
        Object.assign(journey,{era:e,rounds:r,knowledge:0,milestones:{},unlocked:[1,2,3,4,5,6,7,8]});
      },[era,rounds]);
      await g.click('#journey-open');
      await g.start();
      // Flown until the name stands on the sheet, then until the body is held and its note said.
      for(let i=0;i<120&&!await g.eval(()=>inscriptions.some(q=>q.key==='onestar'));i++)await g.fly(.25,{settle:.25});
      await g.advance(1.5);
      await g.shot('era'+era+'-named');
      for(let i=0;i<160&&!await g.eval(()=>{const n=oneStarBody();return !!n&&world.player.node===n||world.state!=='playing';});i++)await g.fly(.25,{settle:.25});
      await g.advance(1.2);
      await g.shot('era'+era+'-held');
    }
    await g.eval(()=>{if(world.state==='playing')world.die('THE DARK CAUGHT UP');});
    await g.advance(1);
    await g.eval(()=>{if(runMode==='journey'){if(plateOwns('mode'))leaveEra();else toggleJourney();}});
    await g.openCatalogue('record');
    await g.eval(()=>{const s=document.querySelector('.cat-onestar');if(s)s.scrollIntoView({block:'start'});});
    await g.advance(.3);
    await g.shot('catalogue');
  }
};
