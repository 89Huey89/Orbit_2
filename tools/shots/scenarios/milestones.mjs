// The Journey's milestones as each century draws them (paintJourneyMark in ui.js, `journeyMark` in each
// hand): every era's frontispiece at the frontier, with the knowledge banked part of the way up the climb, and the Rock's once it is known.
// Then the one place a milestone is named, the leaf of a run that opened one — `A MILESTONE STANDS · {name}`
// with what it stands for in italic beneath (docs/KNOWLEDGE-AUDIT.md §3.2, item 6) — and the Record's list.
export default {
  name:'milestones',
  description:'Each era\'s own milestone drawing on its Journey frontispiece, part of the way up; then a leaf naming a milestone with its gloss, and the Record\'s list.',
  async run(g){
    for(const [era,k] of [[1,11],[2,11],[3,11],[4,11],[5,11],[6,11],[1,20]]){
      await g.eval(([e,kk])=>{if(runMode==='journey'){if(plateOwns('mode'))leaveEra();else toggleJourney();}journey.era=e;journey.knowledge=kk;toggleJourney();},[era,k]);
      // The last is carried to known after the door, since a door onto a known era turns the page at once.
      if(era===1&&k===20)await g.eval(()=>{journey.knowledge=25;syncJourney();});
      await g.advance(.6);
      await g.shot('era-'+era+'-k'+k);
      await g.shot('era-'+era+'-k'+k+'-mark',{selector:'#journey-mark'});
    }
    // A run on the frontier that carries the knowledge over its next milestone, on the Ceiling (whose hours
    // the audit corrected) and on the atlas: the leaf names the milestone and glosses it.
    for(const era of [2,5]){
      await g.eval(e=>{if(runMode==='journey'){if(plateOwns('mode'))leaveEra();else toggleJourney();}journey.era=e;journey.knowledge=11;toggleJourney();},era);
      await g.advance(.4);
      await g.start();
      await g.fly(3);
      await g.eval(()=>{journeyObserve(1);journeyObserve(1);});
      await g.die();
      await g.shot('era-'+era+'-stands');
      await g.shot('era-'+era+'-stands-note',{selector:'#end-journey'});
      await g.openCatalogue('record');
      await g.eval(()=>{const h=[...document.querySelectorAll('#catalogue-body [data-pane="record"] .cat-group h3')].find(n=>/milestones/.test(n.textContent));if(h)h.closest('.cat-group').scrollIntoView({block:'start'});});
      await g.advance(.1);
      await g.shot('era-'+era+'-record');
      await g.closeCatalogue();
    }
  }
};
