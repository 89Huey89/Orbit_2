// The opening row with the difficulty still unchosen: the standing instruction to aim for TIRO, ADEPTUS
// or MAGISTER is written beside the first orbit, which at the reference sheet sits just above the
// impressum's cartouche. It is worst on a phone browser whose toolbars leave the sheet short — take it
// with --viewport=430x745@3 --plate=paper, Safari's visible sheet on the reference phone. The ledger is
// filled far enough for the cartouche to carry most of its rows, which is when it stands tallest and the note was once set straight across the imprint.
export default {
  name:'choose',
  description:'The difficulty instruction held on the first orbit beside a well-filled impressum, at 0.5 s and 3 s.',
  async run(g){
    await g.eval(()=>{
      Object.assign(ledger,{captures:40,badAngles:3,telescopicCaptures:2});
      ledger.constellations=Object.assign({},ledger.constellations,{__shots:3});
      ledger.observations=Object.assign({},ledger.observations,{perfectThree:true});
    });
    await g.start();
    await g.idle(.5);await g.shot('choose-0.5s');
    await g.idle(2.5);await g.shot('choose-3s');
  }
};
