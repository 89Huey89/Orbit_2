// The sheet the art review found empty for most of a run (B1) and muddy when the chapter plates were on
// (B4): the opening row and a run under way, on both base plates, with the chapter plates chosen as the
// scenery so the print, and what the play channel keeps of it, are in every capture.
export default {
  name:'sheet',
  description:'The opening row and a run under way on night and paper, chapter plates on.',
  defaults:{profile:'full',plate:['night','paper'],storage:{'orbit.cosmetics.v1':JSON.stringify({scenery:'chapterplates'})}},
  async run(g){
    await g.start();
    await g.fly(1.5,{settle:1});await g.shot('opening');
    await g.fly(10);await g.shot('flight-12s');
    await g.fly(25);await g.shot('flight-37s');
  }
};
