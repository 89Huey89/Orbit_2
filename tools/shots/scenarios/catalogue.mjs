// The catalogue leaf, all three tabs, on a ledger that has earned everything, and the ephemeris.
export default {
  name:'catalogue',
  description:'Catalogue tabs (record, catalogue, insignia) on a full ledger, and the ephemeris.',
  defaults:{profile:'full'},
  async run(g){
    for(const tab of ['record','catalogue','insignia']){
      await g.openCatalogue(tab);
      await g.shot(`catalogue-${tab}`);
      // The Record's last two sections, where what the atlas said is kept (docs/KNOWLEDGE-AUDIT.md): each
      // traced figure's note under its name in the Asterismi register, and the chapters' lines below it.
      if(tab==='record')for(const [name,sel] of [['asterismi','.ledger-table th .cat-gloss'],['annals','.cat-annals']]){
        const found=await g.eval(s=>{const n=document.querySelector('#catalogue-body [data-pane="record"] '+s);if(!n)return false;n.closest('.cat-group').scrollIntoView({block:'start'});return true;},sel);
        if(found){await g.advance(.1);await g.shot(`catalogue-${name}`);}
      }
    }
    await g.closeCatalogue();
    await g.openEphemeris();
    await g.shot('ephemeris');
  }
};
