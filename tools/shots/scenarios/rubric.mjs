// The rubricator's pass on the paper plate: the chapter title's red plate line, rule and lozenge as the
// opening sheet sets them, then a run far enough under way that the construction has struck its ecliptic
// and the running head's red under-rule stands at the foot. Night is taken too, to show it stays in ink.
export default {
  name:'rubric',
  description:'The chapter title, the running head and the ecliptic on paper (red) and night (ink).',
  defaults:{profile:'full',plate:['paper','night']},
  async run(g){
    await g.start();
    await g.fly(2.5,{settle:1});await g.shot('chapter-title');
    await g.fly(30);await g.shot('construction-and-head');
  }
};
