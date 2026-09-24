// Every plate the atlas can be pulled on, each with a few seconds of flight, so a palette or token
// change can be read across all of them. Eras are left to eras.mjs, since they are modes, not plates.
export default {
  name:'plates',
  description:'The frontispiece and six seconds of flight on each atlas plate.',
  defaults:{profile:'full',plate:['night','paper','cellarius','verdigris','foxed','azzurra','sepia','proof','modern']},
  async run(g){
    await g.shot('frontispiece');
    await g.start();
    await g.fly(6);
    await g.shot('flight-6s');
  }
};
