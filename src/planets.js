'use strict';
/* Orbit · src/planets.js
   Planet families, procedural surfaces, pigment and engraving layers, survey marks, weather, and drawPlanet. */
function planetFamily(row,runSeed){
  const offset=(runSeed>>>0)%7,stride=1+((runSeed>>>4)%6);
  return planetFamilies[(Math.floor(row)*stride+offset)%7];
}
function landContour(g,x,y,rx,ry,rng){
  const phase=rng()*TAU,points=[];
  for(let i=0;i<28;i++){
    const a=i/28*TAU,r=.78+Math.sin(a*3+phase)*.12+Math.sin(a*7-phase)*.07+rng()*.16;
    points.push({x:x+Math.cos(a)*rx*r,y:y+Math.sin(a)*ry*r});
  }
  const last=points[points.length-1],first=points[0];g.beginPath();g.moveTo((last.x+first.x)/2,(last.y+first.y)/2);
  for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];g.quadraticCurveTo(p.x,p.y,(p.x+q.x)/2,(p.y+q.y)/2);}
  g.closePath();
}
function paintPlanetSurface(g,core,family,palette,rng,fissures=[]){
  const rgb=palette.rgb,paper=onPaper();
  if(family==='ocean'){
    // Broad, irregular shorelines and islands beneath wisps of cloud.
    for(let i=0;i<4;i++){
      const x=(rng()-.5)*core*1.5,y=(rng()-.5)*core*1.6;
      landContour(g,x,y,core*(i===0?.52:.22+rng()*.2),core*(.3+rng()*.32),rng);
      if(paper){g.fillStyle=i%2?'rgba(62,104,84,.3)':'rgba(98,140,116,.24)';g.strokeStyle='rgba(58,42,28,.55)';}
      else{g.fillStyle=i%2?'#b8b292':'#cbc4a4';g.strokeStyle='rgba(51,60,45,.7)';}
      g.fill();g.lineWidth=.65;g.stroke();
    }
    for(let i=0;i<9;i++){
      const x=(rng()-.5)*core*1.8,y=(rng()-.5)*core*1.9;
      g.strokeStyle=paper?`rgba(96,74,52,${.14+rng()*.18})`:`rgba(218,218,196,${.1+rng()*.15})`;g.lineWidth=.6+rng()*1.25;g.lineCap='round';
      g.beginPath();g.moveTo(x-core*.28,y);g.bezierCurveTo(x-core*.12,y-3,x+core*.18,y+3,x+core*.4,y-1);g.stroke();
    }
    if(paper){g.fillStyle='rgba(231,218,189,.6)';g.strokeStyle='rgba(58,42,28,.28)';g.lineWidth=.4;g.beginPath();g.ellipse(-core*.16,-core*.97,core*.42,core*.16,0,0,TAU);g.fill();g.stroke();}
    else{g.fillStyle='rgba(207,213,193,.42)';g.beginPath();g.ellipse(-core*.16,-core*.97,core*.42,core*.16,0,0,TAU);g.fill();}
  }else if(family==='crater'){
    for(let i=0;i<5;i++){
      landContour(g,(rng()-.5)*core*1.5,(rng()-.5)*core*1.5,core*.55,core*.35,rng);
      g.fillStyle=paper?'rgba(58,42,28,.12)':'rgba(56,66,75,.14)';g.fill();
    }
    for(let i=0;i<25;i++){
      const a=rng()*TAU,d=Math.sqrt(rng())*core*.94,x=Math.cos(a)*d,y=Math.sin(a)*d;
      const r=core*(i<3?.15+rng()*.055:.035+rng()*.07),flatten=.72+rng()*.24;
      g.fillStyle='rgba(60,52,39,.17)';g.beginPath();g.ellipse(x,y,r,r*flatten,0,0,TAU);g.fill();
      g.strokeStyle='rgba(48,43,34,.66)';g.lineWidth=.55;g.stroke();
      for(let j=0;j<4;j++){
        g.lineWidth=.3;g.beginPath();g.ellipse(x+.2*j,y+.16*j,r*(1-j*.16),r*flatten*(1-j*.16),0,-.5,Math.PI*.7);g.stroke();
      }
      g.strokeStyle='rgba(239,222,184,.7)';g.lineWidth=.7;g.beginPath();g.ellipse(x-.35,y-.35,r+.35,r*flatten+.35,0,Math.PI*.8,Math.PI*1.85);g.stroke();
      if(i===0){
        g.strokeStyle='rgba(236,226,201,.23)';g.lineWidth=.4;
        for(let j=0;j<13;j++){const t=j/13*TAU,reach=r*(1.5+rng());g.beginPath();g.moveTo(x+Math.cos(t)*r,y+Math.sin(t)*r);g.lineTo(x+Math.cos(t)*reach,y+Math.sin(t)*reach);g.stroke();}
      }
    }
  }else if(family==='ringed'||family==='storm'){
    const phase=rng()*TAU,storm=family==='storm';
    const stormMajor=paper?'rgba(224,220,206,.42)':'rgba(200,194,202,.38)',stormMinor=paper?'rgba(52,84,120,.5)':'rgba(75,71,87,.45)';
    const ringMajor=paper?'rgba(234,222,190,.42)':'rgba(215,197,161,.42)',ringMinor=paper?'rgba(120,90,58,.42)':'rgba(111,86,66,.4)';
    for(let i=-22;i<23;i++){
      const y=i*core/21,bend=Math.sin(i*.65+phase)*(storm?3.7:1.5);
      g.strokeStyle=i%4===0?(storm?stormMajor:ringMajor):i%3===0?(storm?stormMinor:ringMinor):`rgba(${rgb},.22)`;
      g.lineWidth=.65+rng()*1.45;g.beginPath();g.moveTo(-core-3,y);g.bezierCurveTo(-core*.35,y-3+bend,core*.32,y+4-bend,core+3,y-1);g.stroke();
    }
    const x=-core*.24,y=core*.12,w=core*(storm?.43:.25),h=w*.53;
    const spotA=storm?(paper?'rgba(220,214,198,.4)':'rgba(207,201,208,.4)'):(paper?'rgba(224,206,166,.44)':'rgba(212,190,150,.44)');
    const spotB=storm?(paper?'rgba(52,84,120,.55)':'rgba(76,71,89,.52)'):(paper?'rgba(120,90,58,.48)':'rgba(115,85,64,.45)');
    for(let i=9;i>0;i--){
      g.strokeStyle=i%2===0?spotA:spotB;g.lineWidth=.8;
      g.beginPath();g.ellipse(x+Math.sin(i*.5)*.55,y,w*i/9,h*i/9,-.12,0,TAU);g.stroke();
    }
  }else if(family==='ice'){
    for(let i=0;i<8;i++){
      landContour(g,(rng()-.5)*core*1.7,(rng()-.5)*core*1.6,core*(.2+rng()*.4),core*(.25+rng()*.3),rng);
      g.fillStyle=paper?(i%2?'rgba(236,228,204,.42)':'rgba(100,118,128,.2)'):(i%2?'rgba(210,216,206,.3)':'rgba(95,119,128,.22)');g.fill();
    }
    // Long fractured plates, each with smaller branches and a pale raised rim.
    for(let i=0;i<7;i++){
      let x=(rng()-.5)*core*1.9,y=-core-rng()*5;
      g.beginPath();g.moveTo(x,y);
      for(let j=0;j<8;j++){
        x+=(rng()-.5)*core*.5;y+=core*.29;g.lineTo(x,y);
        if(j===3||j===5){g.lineTo(x+core*(rng()-.5)*.7,y-core*.22);g.moveTo(x,y);}
      }
      g.strokeStyle=paper?'rgba(58,42,28,.5)':'rgba(61,89,104,.43)';g.lineWidth=1.1;g.stroke();
      g.save();g.translate(-.5,-.45);g.strokeStyle=paper?'rgba(238,228,200,.55)':'rgba(220,226,214,.5)';g.lineWidth=.4;g.stroke();g.restore();
    }
  }else if(family==='dune'){
    const phase=rng()*TAU;
    for(let i=-20;i<=20;i++){
      const y=i*core/17;g.beginPath();
      for(let x=-core-3;x<=core+4;x+=2){
        const yy=y+Math.sin(x*.1+phase+i*.22)*3.4+Math.sin(x*.22-i*.34)*.85;
        if(x===-core-3)g.moveTo(x,yy);else g.lineTo(x,yy);
      }
      g.strokeStyle=i%3===0?'rgba(92,68,48,.32)':'rgba(217,190,146,.36)';g.lineWidth=i%3===0?1.5:.65;g.stroke();
    }
    g.beginPath();g.moveTo(-core*.75,-core*.1);g.bezierCurveTo(-core*.12,-core*.4,-core*.1,core*.5,core*.6,core*.25);
    g.strokeStyle='rgba(95,65,49,.48)';g.lineWidth=2.2;g.stroke();g.strokeStyle='rgba(210,176,128,.4)';g.lineWidth=.55;g.stroke();
    g.fillStyle='rgba(215,198,164,.47)';g.beginPath();g.ellipse(core*.08,-core*.99,core*.44,core*.18,.2,0,TAU);g.fill();
  }else if(family==='volcanic'){
    for(let i=0;i<10;i++){
      landContour(g,(rng()-.5)*core*1.8,(rng()-.5)*core*1.8,core*.38,core*.3,rng);
      g.fillStyle=i%2?'rgba(141,101,86,.2)':(paper?'rgba(60,32,20,.4)':'rgba(13,20,33,.45)');g.fill();
    }
    for(let i=0;i<7;i++){
      let x=(rng()-.5)*core*1.8,y=(rng()-.75)*core*1.7;
      const path=[{x,y,move:true}];
      g.beginPath();g.moveTo(x,y);
      for(let j=0;j<6;j++){
        x+=(rng()-.35)*core*.35;y+=core*(.08+rng()*.19);g.lineTo(x,y);path.push({x,y});
        if(j===2){g.lineTo(x-core*.25,y+core*.12);g.lineTo(x-core*.31,y+core*.31);g.moveTo(x,y);path.push({x:x-core*.25,y:y+core*.12},{x:x-core*.31,y:y+core*.31},{x,y,move:true});}
      }
      g.strokeStyle='rgba(155,100,69,.17)';g.lineWidth=2.4;g.stroke();
      g.strokeStyle='rgba(199,151,98,.62)';g.lineWidth=.8;g.stroke();g.strokeStyle='rgba(222,191,137,.55)';g.lineWidth=.3;g.stroke();
      fissures.push(path);
    }
  }else{
    for(let i=-6;i<=6;i++){
      g.strokeStyle=`rgba(${rgb},.4)`;g.lineWidth=.5;g.beginPath();g.ellipse(0,i*2.5,core,core*.2,0,0,TAU);g.stroke();
    }
  }
}
function paintPlanetRings(g,core,tilt,flatten,front,rgb){
  const paper=onPaper();
  g.save();g.rotate(tilt);
  // The far half disappears behind the globe; the near half crosses its face.
  for(let i=0;i<68;i++){
    if(i>44&&i<50)continue;
    const r=core*(1.28+i*.0107),a=(i<13?.25:i<44?.55:.36)+(i%5)*.025;
    g.strokeStyle=`rgba(${rgb},${a})`;g.lineWidth=i%8===0?.75:.4;
    g.beginPath();g.ellipse(0,0,r,r*flatten,0,front?0:Math.PI,front?Math.PI:TAU);g.stroke();
    // Paper plate: the shadowed sweep of ring is cross-hatched ink, not just a darker wash.
    if(paper&&i>=13&&i<44&&i%2===0){
      g.strokeStyle=`rgba(58,42,28,${.12+(i%5)*.02})`;g.lineWidth=.32;
      for(let s=0;s<7;s++){
        const t=(front?0:Math.PI)+Math.PI*(s+.5)/7,x=Math.cos(t)*r,y=Math.sin(t)*r*flatten;
        const nx=Math.cos(t)*.95,ny=Math.sin(t)*flatten*.95;
        g.beginPath();g.moveTo(x-nx,y-ny);g.lineTo(x+nx,y+ny);g.stroke();
      }
    }
  }
  g.restore();
}
function planetLayer(size=288){
  const image=makeCanvas(size,size),ink=image.getContext('2d');ink.translate(size/2,size/2);ink.scale(2,2);return {image,ink};
}
function paintPigment(g,core,rng,rgb=null){
  const paper=onPaper();
  // Uneven transparent washes, pooled edges and exposed paper, cached once.
  for(let i=0;i<16;i++){
    landContour(g,(rng()-.5)*core*2,(rng()-.5)*core*2,core*(.2+rng()*.6),core*(.16+rng()*.4),rng);
    if(paper&&rgb)g.fillStyle=i%3===0?'rgba(58,42,28,.05)':`rgba(${rgb},${.06+rng()*.05})`;
    else g.fillStyle=i%3===0?'rgba(52,43,30,.065)':'rgba(229,213,172,.075)';
    g.fill();
    g.strokeStyle='rgba(63,52,34,.07)';g.lineWidth=.45;g.stroke();
  }
  for(let i=0;i<950;i++){
    const x=(rng()-.5)*core*2,y=(rng()-.5)*core*2,light=i%3!==0;
    g.fillStyle=light?'rgba(239,226,192,.24)':(paper?'rgba(45,39,27,.16)':'rgba(45,39,27,.22)');
    g.fillRect(x,y,.18+rng()*.55,.2+rng()*.42);
  }
  // Short broken strokes suggest dry brush catching the paper grain.
  g.strokeStyle='rgba(238,225,193,.16)';g.lineWidth=.35;
  for(let i=0;i<65;i++){
    const x=(rng()-.5)*core*2,y=(rng()-.5)*core*2;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+1+rng()*3,y-.25-rng()*.45);g.stroke();
  }
}
function paintEngraving(g,core,palette,rng){
  const paper=onPaper();
  // Shading is cut into the plate with curved strokes, not a glossy gradient.
  g.fillStyle=palette.light+'22';g.fillRect(-core,-core,core*2,core*2);
  const hatchInk=paper?'34,24,16':'38,34,26';
  for(let i=0;i<34;i++){
    const x=-core*.28+i*core*.048;
    g.strokeStyle=`rgba(${hatchInk},${(paper?.15:.21)+i/34*(paper?.45:.37)})`;g.lineWidth=.35+rng()*.28;
    g.beginPath();g.moveTo(x,-core*1.14);
    g.bezierCurveTo(x+core*.22,-core*.3,x-core*.36,core*.65,x-core*.48,core*1.1);g.stroke();
  }
  g.strokeStyle=paper?'rgba(34,24,16,.28)':'rgba(37,33,25,.32)';g.lineWidth=.38;
  for(let i=0;i<19;i++){
    const y=-core+i*core*.12;
    g.beginPath();g.moveTo(core*.4,y);g.bezierCurveTo(core*.66,y+.08*core,core*.86,y+.35*core,core*1.1,y+.45*core);g.stroke();
  }
  if(paper){
    // A second, counter-slanted pass crosses the first over the dark limb: true cross-hatch.
    for(let i=0;i<22;i++){
      const y=-core*1.05+i*core*.1;
      g.strokeStyle=`rgba(34,24,16,${.05+i/22*.17})`;g.lineWidth=.28+rng()*.2;
      g.beginPath();g.moveTo(core*.05,y);g.bezierCurveTo(core*.4,y+core*.05,core*.55,y+core*.05,core*.95,y+core*.02);g.stroke();
    }
  }
  for(let i=0;i<440;i++){
    const x=(rng()-.5)*core*2,y=(rng()-.5)*core*2;
    if(rng()>(x+y+core)/(core*3))continue;
    g.fillStyle=paper?'rgba(34,24,16,.3)':'rgba(36,32,24,.35)';g.fillRect(x,y,.32+rng()*.35,.35);
  }
  // Fine meridians make each globe read as a hand-coloured atlas specimen.
  g.save();g.rotate(-.28);g.strokeStyle=paper?'rgba(96,74,52,.24)':'rgba(47,44,33,.19)';g.lineWidth=.38;g.setLineDash([1.4,1.6]);
  for(const width of [.35,.72]){g.beginPath();g.ellipse(0,0,core*width,core,0,0,TAU);g.stroke();}
  for(const y of [-.48,0,.48]){g.beginPath();g.ellipse(0,core*y,core*Math.sqrt(1-y*y),core*.17,0,0,TAU);g.stroke();}
  g.restore();
}
function paintSurvey(g,core,family,tilt){
  // Broken survey arcs sit inside the functional orbit, with a distinct style.
  const radius=family==='ringed'?core*1.98:core+6;
  g.save();g.rotate(tilt);g.strokeStyle=onPaper()?'rgba(96,74,52,.32)':'rgba(196,182,145,.26)';g.lineWidth=.45;
  for(let quadrant=0;quadrant<4;quadrant++){
    const a=quadrant*Math.PI/2;
    g.beginPath();g.arc(0,0,radius,a+.18,a+.68);g.stroke();
    for(let i=0;i<4;i++){
      const t=a+.18+i*.16,outer=radius+(i===0?2.8:1.4);
      g.beginPath();g.moveTo(Math.cos(t)*radius,Math.sin(t)*radius);g.lineTo(Math.cos(t)*outer,Math.sin(t)*outer);g.stroke();
    }
  }
  if(family!=='ringed'){
    g.setLineDash([1,2]);g.beginPath();g.moveTo(0,-core-2);g.lineTo(0,-core-12);g.moveTo(0,core+2);g.lineTo(0,core+9);g.stroke();
  }
  g.restore();
}
function planetWeather(family,core,seed){
  if(!['ocean','ringed','storm'].includes(family))return null;
  const paper=onPaper();
  const layer=planetLayer(160),g=layer.ink,rng=seeded(seed^0x41c38),ocean=family==='ocean';
  for(let i=0;i<(ocean?11:17);i++){
    const x=(rng()-.5)*64,y=(rng()-.5)*core*1.65,length=ocean?5+rng()*12:11+rng()*18;
    // Fine ink strokes on paper, in place of pale drifting cloud on the night plate.
    g.strokeStyle=paper?`rgba(58,42,28,${.14+rng()*.22})`:`rgba(220,215,196,${.12+rng()*.25})`;
    g.lineWidth=(paper?.32:.45)+rng()*(ocean?(paper?.6:1.1):(paper?.42:.7));g.lineCap='round';
    g.beginPath();g.moveTo(x-length/2,y);g.bezierCurveTo(x-length*.2,y-2.5,x+length*.15,y+2.7,x+length/2,y-.6);g.stroke();
  }
  return layer.image;
}
function glyph(seed,type,row,runSeed){
  const family=type==='gold'?'gold':type==='shield'?'shield':planetFamily(row,runSeed),key=seed+':'+type+':'+family;
  if(glyphs.has(key))return glyphs.get(key);
  const paper=onPaper();
  const back=planetLayer(),surface=planetLayer(160),front=planetLayer(),rng=seeded(seed),palette=planetPalettes[family];
  let g=back.ink;
  const core=palette.size+rng()*3,rgb=palette.rgb,tilt=(rng()-.5)*1.35,flatten=.23+rng()*.14;
  if(family!=='gold'&&family!=='shield')paintSurvey(g,core,family,tilt);
  if(family==='ringed')paintPlanetRings(g,core,tilt,flatten,false,rgb);
  g=surface.ink;
  g.beginPath();g.arc(0,0,core,0,TAU);g.fillStyle=palette.body;g.fill();
  g.save();g.beginPath();g.arc(0,0,core-.2,0,TAU);g.clip();
  const fissures=[];paintPlanetSurface(g,core,family,palette,rng,fissures);
  paintPigment(g,core,rng,rgb);
  g.restore();
  // Lighting and ring occlusion stay still as the etched surface turns below.
  g=front.ink;g.save();g.beginPath();g.arc(0,0,core,0,TAU);g.clip();
  paintEngraving(g,core,palette,rng);
  if(family==='ringed'){
    g.save();g.rotate(tilt);g.strokeStyle=paper?'rgba(34,24,16,.32)':'rgba(23,22,30,.3)';g.lineWidth=2.6;g.beginPath();g.ellipse(0,1.5,core*1.38,core*1.38*flatten,0,0,Math.PI);g.stroke();g.restore();
  }
  g.restore();
  // Slightly misregistered outlines retain the character of a printed plate; on paper the
  // dark keyline and the coloured wash sit a touch further apart, like off-register hand colouring.
  g.strokeStyle=paper?'rgba(34,24,16,.88)':'rgba(31,29,23,.85)';g.lineWidth=paper?.85:.8;g.beginPath();g.arc(0,0,core-.25,0,TAU);g.stroke();
  g.strokeStyle=`rgba(${rgb},${paper?.7:.65})`;g.lineWidth=paper?.5:.4;g.beginPath();g.arc(paper?-.55:-.28,paper?-.4:-.2,core+(paper?.75:.5),0,TAU);g.stroke();
  for(let i=0;i<11;i++){
    const a=i/11*TAU;g.strokeStyle=paper?'rgba(58,42,28,.3)':'rgba(226,211,174,.38)';g.lineWidth=.35;
    g.beginPath();g.arc(.15,-.1,core+.85,a+.06,a+.16+rng()*.25);g.stroke();
  }
  if(family==='ringed')paintPlanetRings(g,core,tilt,flatten,true,rgb);
  if(family==='gold'){
    g.strokeStyle=`rgba(${rgb},.65)`;g.lineWidth=.7;
    for(let i=0;i<6;i++){g.save();g.rotate(i*TAU/6);g.beginPath();g.moveTo(12,0);g.bezierCurveTo(24,-9,35,-7,44,0);g.bezierCurveTo(32,7,22,10,12,0);g.stroke();g.restore();}
  }
  let embers=null;
  if(fissures.length){
    const layer=planetLayer(160),ink=layer.ink;embers=layer.image;
    for(const path of fissures){
      ink.beginPath();for(const p of path){if(p.move)ink.moveTo(p.x,p.y);else ink.lineTo(p.x,p.y);}
      ink.strokeStyle=paper?'rgba(120,60,32,.28)':'rgba(190,143,93,.24)';ink.lineWidth=2.5;ink.stroke();
      ink.strokeStyle=paper?'rgba(180,110,58,.7)':'rgba(228,194,135,.72)';ink.lineWidth=.7;ink.stroke();
    }
  }
  const art={back:back.image,surface:surface.image,front:front.image,weather:planetWeather(family,core,seed),embers,core,tilt,family,spin:palette.spin,phase:seed*.017};
  // Only cached layer blits animate. No surface generation runs per frame.
  if(glyphs.size>=24)glyphs.delete(glyphs.keys().next().value);
  glyphs.set(key,art);return art;
}
function drawPlanet(art,r,time){
  const t=reducedMotion?0:time,angle=art.tilt+t*art.spin;
  ctx.save();ctx.scale(r/60,r/60);ctx.drawImage(art.back,-72,-72,144,144);
  ctx.save();ctx.beginPath();ctx.arc(0,0,art.core,0,TAU);ctx.clip();ctx.rotate(angle);
  ctx.drawImage(art.surface,-40,-40,80,80);
  if(art.embers){
    ctx.save();ctx.globalAlpha*=.18+.32*(.5+.5*Math.sin(t*.65+art.phase));ctx.drawImage(art.embers,-40,-40,80,80);ctx.restore();
  }
  if(art.weather){
    const wind=(t*(art.family==='ocean'?.48:.7))%80;
    ctx.drawImage(art.weather,wind-40,-40,80,80);ctx.drawImage(art.weather,wind-120,-40,80,80);
  }
  ctx.restore();
  if(art.family==='ice'){
    const paper=onPaper();
    ctx.save();ctx.rotate(art.tilt);
    for(let i=0;i<4;i++){
      const height=2.2+i*.75+Math.sin(t*.32+art.phase+i*.8)*.8;
      ctx.strokeStyle=paper?`rgba(58,42,28,${.045+.02*Math.sin(t*.38+art.phase+i*.6)})`:`rgba(184,198,179,${.055+.025*Math.sin(t*.38+art.phase+i*.6)})`;
      ctx.lineWidth=.65;
      ctx.beginPath();ctx.ellipse(-2,-art.core*.66,art.core*.59,art.core*.3+height,-.1,Math.PI*1.05,Math.PI*1.86);ctx.stroke();
    }
    ctx.restore();
  }
  ctx.drawImage(art.front,-72,-72,144,144);ctx.restore();
}
function sx(x){return W*.5+x*scale;}
function sy(y){return (y-world.cameraY)*scale;}
function line(x1,y1,x2,y2,color,width=.6){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}

