// Every century's own leaf of the catalogue — record, collection, feats — opened from inside the century,
// on a log half filled so earned and unearned cards stand side by side. Run it across the era axis:
// `npm run shots -- centuries --era=rock,ceiling,scroll,astrolabe,lens,flyby,probe`.
export default {
  name:'centuries',
  description:'A century\'s own catalogue leaf: record, collection and feats, half earned.',
  defaults:{profile:'full',era:'lens'},
  async run(g){
    await g.eval(()=>{
      const log=eraLogs[eraId()];
      if(log)Object.assign(log,{runs:12,captures:180,perfects:40,grazes:6,constellations:9,bestRow:20,bestFlow:9,won:1,playSeconds:2400});
      // Half the century's charts met, through the same hand a closing chart calls, so its collection shows
      // cards carrying their notes beside cards still waiting.
      const met=handFor('caveAnimal');if(met)for(let i=0;i<6;i++)met(i);
    });
    for(const tab of ['record','catalogue','insignia']){
      await g.openCatalogue(tab);
      await g.shot(`century-${tab}`);
      // The curator's lines the Record keeps, chapter by chapter, below the ledger (docs/KNOWLEDGE-AUDIT.md).
      if(tab==='catalogue'){
        const noted=await g.eval(()=>{const n=document.querySelector('#catalogue-body [data-pane="catalogue"] .cat-card .cat-gloss');if(!n)return false;n.closest('.cat-card').scrollIntoView({block:'start'});return true;});
        if(noted){await g.advance(.1);await g.shot('century-notes');}
      }
      if(tab==='record'){
        const kept=await g.eval(()=>{const a=document.querySelector('#catalogue-body .cat-annals');if(!a)return false;a.closest('.cat-group').scrollIntoView({block:'start'});return true;});
        if(kept){await g.advance(.1);await g.shot('century-annals');}
      }
    }
    await g.eval(()=>{const b=document.getElementById('catalogue-body');b.scrollTop=b.scrollHeight;});
    await g.advance(.1);
    await g.shot('century-lineage');
    await g.closeCatalogue();
  }
};
