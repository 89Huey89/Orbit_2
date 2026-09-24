// The Journey's milestones as each century draws them (paintJourneyMark in ui.js, `journeyMark` in each
// hand): every era's frontispiece at the frontier, with the knowledge banked part of the way up the climb, and the Rock's once it is known.
export default {
  name:'milestones',
  description:'Each era\'s own milestone drawing on its Journey frontispiece, part of the way up.',
  async run(g){
    for(const [era,k] of [[1,11],[2,11],[3,11],[4,11],[5,11],[6,11],[1,20]]){
      await g.eval(([e,kk])=>{if(runMode==='journey'){if(plateOwns('mode'))leaveEra();else toggleJourney();}journey.era=e;journey.knowledge=kk;toggleJourney();},[era,k]);
      // The last is carried to known after the door, since a door onto a known era turns the page at once.
      if(era===1&&k===20)await g.eval(()=>{journey.knowledge=25;syncJourney();});
      await g.advance(.6);
      await g.shot('era-'+era+'-k'+k);
      await g.shot('era-'+era+'-k'+k+'-mark',{selector:'#journey-mark'});
    }
  }
};
