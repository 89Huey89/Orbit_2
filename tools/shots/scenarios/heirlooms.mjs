// What the other centuries leave on the atlas's own sheet (src/frame.js, paintSphereHeirlooms and
// frameHeirlooms): every century marked known through its log, the sheet's last line at the opening, a run
// flown until the construction is finished, then the same moment under each of the four constructions,
// with close-ups of Taurus and the pole. The last shot is the same sheet with nothing known, to compare.
const KNOWN=JSON.stringify(Object.fromEntries([1,2,3,4,6,7,8].map(era=>[era,{won:1}])));
export default {
  name:'heirlooms',
  description:'The seven heirlooms on the construction and the last line, under each of the four spheres.',
  defaults:{profile:'full',plate:['paper','night'],storage:{'orbit.eras.v1':KNOWN}},
  async run(g){
    await g.start();
    await g.fly(1.5,{settle:1});
    const {w,h}=await g.eval(()=>({w:innerWidth,h:innerHeight}));
    await g.shot('last-line',{clip:{x:0,y:h-34,width:w,height:34}});
    await g.fly(40);
    for(const sphere of ['graticule','rete','orbs','volvelle']){
      await g.eval(s=>{cosmetics.sphere=s;},sphere);
      await g.advance(.1);
      await g.shot(`sphere-${sphere}`);
      const box=await g.eval(()=>{const m=sphereMeasure(null,10),at=sphereZodiacAt(sphereStyle(),m,-2.3);return {x:at.x,y:at.y,cx:m.cx,cy:m.cy};});
      await g.shot(`taurus-${sphere}`,{clip:{x:Math.max(0,box.x-80),y:Math.max(0,box.y-70),width:160,height:130}});
      await g.shot(`pole-${sphere}`,{clip:{x:box.cx-60,y:box.cy-45,width:120,height:90}});
    }
    await g.eval(()=>{cosmetics.sphere='graticule';for(const era in eraLogs)eraLogs[era].won=0;});
    await g.advance(.1);
    await g.shot('none-known');
  }
};
