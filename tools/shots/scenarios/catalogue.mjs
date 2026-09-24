// The catalogue leaf, all three tabs, on a ledger that has earned everything, and the ephemeris.
export default {
  name:'catalogue',
  description:'Catalogue tabs (record, catalogue, insignia) on a full ledger, and the ephemeris.',
  defaults:{profile:'full'},
  async run(g){
    for(const tab of ['record','catalogue','insignia']){
      await g.openCatalogue(tab);
      await g.shot(`catalogue-${tab}`);
    }
    await g.closeCatalogue();
    await g.openEphemeris();
    await g.shot('ephemeris');
  }
};
