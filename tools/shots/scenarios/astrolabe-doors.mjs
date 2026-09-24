// Era IV's two doors that draw a theorem as well as a part: Valencia's equatorium and Marāgha's Ṭūsī couple,
// each forced open over a live sheet and caught twice as it turns, with the orbits breaking round the title.
export default {
  name:'astrolabe-doors',
  description:'Era IV (astrolabe): the Valencia and Maragha doors, their theorems turning over the instrument.',
  defaults:{era:'astrolabe'},
  async run(g){
    await g.start();await g.fly(3);
    for(const i of [3,4])for(const t of [1.4,2.8]){await g.eval(i=>{chapterReveal={index:i,age:0};},i);await g.advance(t);await g.shot('door-'+(i+1)+'-'+t);}
  }
};
