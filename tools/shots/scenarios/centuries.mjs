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
    });
    for(const tab of ['record','catalogue','insignia']){
      await g.openCatalogue(tab);
      await g.shot(`century-${tab}`);
    }
    await g.eval(()=>{const b=document.getElementById('catalogue-body');b.scrollTop=b.scrollHeight;});
    await g.advance(.1);
    await g.shot('century-lineage');
    await g.closeCatalogue();
  }
};
