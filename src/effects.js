'use strict';
/* Orbit · src/effects.js
   Rising darkness, the player comet, trail, ripples, and particle effects. */
// ---------- Rising darkness, player comet, and effects: spilled ink on paper, starlight ink at night ----------
definePlate('dark',{
  night:{
    chapterShadow:'#080f18',chapterLabel:'#baa57b',chapterRule:'202,180,137',chapterDiamond:'216,195,154',
    playerHeadWash:'222,199,151',playerFilamentA:'195,178,138',playerFilamentB:'236,218,178',
    playerHalo:'#0c1519',playerKeyline:'#0c1519',playerMid:'#dcc394',playerHighlight:'#fff3ce',playerNib:'246,227,181',playerShield:'150,205,224',
    trailWash:'204,181,133',trailStroke:'242,225,186',trailEdge:'165,154,123',trailBleed:'214,193,151',
    pigment:'166,125,101',pigmentRelief:'211,192,143',shorelineRelief:'221,202,152',
    washTop:'4,10,17',washMid:'6,13,22',washSolid:'#040910',bodyTop:'5,11,19',bodyMid:'4,10,18',
    voidLayers:['rgba(22,30,36,.23)','rgba(13,22,31,.44)','rgba(7,16,25,.57)','rgba(4,11,20,.63)','rgba(3,8,15,.72)'],
    landFillWash:'rgba(36,45,50,.075)',landFillPool:'rgba(1,5,12,.3)',fleckDark:'0,3,9',
    burstGold:'230,209,159',burstRed:'222,145,106',burstBlue:'165,215,210',ringSimple:'231,216,171',
    transferArc:'226,207,165',transferArcSoft:'186,169,131',transferTick:'239,219,173',transferNib:'232,212,171',
    floaterText:'238,224,185',screenFlash:'238,212,157'
  },
  paper:{
    chapterShadow:'transparent',chapterLabel:'#5c4630',chapterRule:'58,42,28',chapterDiamond:'34,24,16',
    playerHeadWash:'96,74,52',playerFilamentA:'96,74,52',playerFilamentB:'58,42,28',
    playerHalo:'#e7dabd',playerKeyline:'#221810',playerMid:'#3a2a1c',playerHighlight:'#604a34',playerNib:'58,42,28',playerShield:'52,84,120',
    trailWash:'96,74,52',trailStroke:'34,24,16',trailEdge:'120,92,60',trailBleed:'80,55,34',
    // The calibrated shoreline is rubrication red-brown on paper, turning ochre/gold during a reprieve.
    pigment:'166,58,40',pigmentRelief:'176,118,38',shorelineRelief:'176,118,38',
    // Spilled indigo-black ink, #14121f family, pooling and feathering into the paper fibres.
    washTop:'20,18,31',washMid:'24,20,34',washSolid:'#14121f',bodyTop:'20,18,31',bodyMid:'20,18,31',
    voidLayers:['rgba(28,24,38,.34)','rgba(24,20,34,.58)','rgba(20,18,31,.78)','rgba(16,14,26,.9)','rgba(14,12,22,.97)'],
    landFillWash:'rgba(20,18,31,.09)',landFillPool:'rgba(14,12,22,.34)',fleckDark:'14,12,22',
    burstGold:'150,100,32',burstRed:'166,58,40',burstBlue:'52,84,120',ringSimple:'58,42,28',
    transferArc:'58,42,28',transferArcSoft:'96,74,52',transferTick:'34,24,16',transferNib:'58,42,28',
    floaterText:'34,24,16',screenFlash:'255,248,222'
  }
});
function recordTrail(){
  if(world.state!=='playing'&&world.state!=='ready')return;
  const p=world.player;
  trail.push({x:p.x,y:p.y,time:world.time,air:!p.node,speed:Math.hypot(p.vx,p.vy)});
  const limit=reducedMotion?64:148;if(trail.length>limit)trail.splice(0,trail.length-limit);
}
function drawTrail(){
  if(trail.length<2)return;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(let i=1;i<trail.length;i++){
    const a=trail[i-1],b=trail[i],age=world.time-b.time;
    const life=reducedMotion?.48:b.air?1.18:.78,t=clamp(1-age/life,0,1);if(t===0)continue;
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<.01)continue;
    const nx=-dy/d,ny=dx/d,boost=clamp((b.speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1),weight=t*(1+boost*.7);
    // A tapered wash, a fine pen stroke and a dry-brush edge follow real motion.
    line(sx(a.x),sy(a.y),sx(b.x),sy(b.y),`rgba(${ink.dark.trailWash},${t*t*.16})`,(1+3.5*weight)*scale);
    line(sx(a.x),sy(a.y),sx(b.x),sy(b.y),`rgba(${ink.dark.trailStroke},${t*t*.77})`,(.18+1.2*weight)*scale);
    if(!reducedMotion){
      const offset=(.55+Math.sin(b.time*19)*.3)*(1-t)+.6;
      line(sx(a.x+nx*offset),sy(a.y+ny*offset),sx(b.x+nx*offset),sy(b.y+ny*offset),`rgba(${ink.dark.trailEdge},${t*.36})`,.4*scale);
      if(b.air&&i%6===0&&t<.88){
        const reach=(1-t)*(1.5+boost*2.5),sign=i%12===0?1:-1;
        line(sx(b.x+nx*sign),sy(b.y+ny*sign),sx(b.x-dx/d*reach+nx*reach*sign),sy(b.y-dy/d*reach+ny*reach*sign),`rgba(${ink.dark.trailBleed},${t*.24})`,.4*scale);
      }
    }
  }
  ctx.restore();
}
function drawPlayer(){
  if(world.state==='dead')return;const p=world.player,flight=!p.node;
  const speed=Math.hypot(p.vx,p.vy),boost=clamp((speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1),charge=world.charge();
  const length=flight?23+boost*20:16,breath=reducedMotion?0:Math.sin(world.time*5.5)*.22;
  ctx.save();ctx.translate(sx(p.x),sy(p.y));ctx.rotate(Math.atan2(p.vy,p.vx));ctx.scale(scale,scale);
  // A little copperplate comet: a bright head and asymmetric engraved filaments.
  ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.2)`;ctx.beginPath();ctx.moveTo(4,0);
  ctx.bezierCurveTo(-3,-4.4,-length*.7,-2.8,-length,0);
  ctx.bezierCurveTo(-length*.58,2.3,-4,4.1,4,0);ctx.fill();
  for(let i=0;i<5;i++){
    const side=i%2?1:-1,spread=(1+i*.48)*(1+boost*.28)+breath;
    ctx.strokeStyle=`rgba(${i%2?ink.dark.playerFilamentA:ink.dark.playerFilamentB},${.56-i*.065})`;ctx.lineWidth=i===0?.7:.45;
    ctx.beginPath();ctx.moveTo(1,side*.8);
    ctx.bezierCurveTo(-length*.26,side*spread,-length*.63,side*(spread+.7),-length*(.72+i*.1),side*(.4+i*.22));ctx.stroke();
  }
  // The dark keyline keeps the actual moving point legible over pale planets; on paper a thin ring of
  // exposed, unprinted paper sits between the ink filaments and the head, like a reserved highlight.
  if(onPaper()){ctx.fillStyle=ink.dark.playerHalo;ctx.beginPath();ctx.ellipse(0,0,6,5,0,0,TAU);ctx.fill();}
  ctx.fillStyle=ink.dark.playerKeyline;ctx.beginPath();ctx.ellipse(0,0,5.3,4.4,0,0,TAU);ctx.fill();
  ctx.fillStyle=ink.dark.playerMid;ctx.beginPath();ctx.ellipse(-.25,.2,4.1,3.3,0,0,TAU);ctx.fill();
  ctx.fillStyle=ink.dark.playerHighlight;ctx.beginPath();ctx.ellipse(.7,-.45,2.7,2.3,0,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgba(${ink.dark.playerNib},${.48+charge*.25})`;ctx.lineWidth=.55;
  ctx.beginPath();ctx.moveTo(5.1,0);ctx.lineTo(7.8+boost*1.5,0);ctx.moveTo(0,-4.7);ctx.lineTo(0,-6.4);ctx.moveTo(0,4.7);ctx.lineTo(0,6.1);ctx.stroke();
  if(p.shielded){
    const pulse=reducedMotion?1:.85+.15*Math.sin(world.time*4);
    ctx.strokeStyle=`rgba(${ink.dark.playerShield},${.55*pulse})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,9,0,TAU);ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.playerShield},${.22*pulse})`;ctx.lineWidth=.5;ctx.beginPath();ctx.arc(0,0,11.5,0,TAU);ctx.stroke();
  }
  ctx.restore();
}
function darknessPlate(relief){
  if(darknessPlates.has(relief))return darknessPlates.get(relief);
  const c=makeCanvas(640,180),g=c.getContext('2d'),rng=seeded(620173),w=c.width,h=c.height;
  const pigment=relief?ink.dark.pigmentRelief:ink.dark.pigment;
  // Seamless pools of dilute ink, growing opaque below the leading edge.
  const wash=g.createLinearGradient(0,24,0,140);
  wash.addColorStop(0,`rgba(${ink.dark.washTop},0)`);wash.addColorStop(.22,`rgba(${ink.dark.washMid},${onPaper()?.94:.78})`);wash.addColorStop(1,ink.dark.washSolid);
  g.fillStyle=wash;g.fillRect(0,24,w,h-24);
  if(onPaper()){
    // Spilled ink on paper: the flood bleeds upward along the fibres in dark feathered threads, with a few
    // near-opaque pools where the pigment settled, so the edge reads as a stain rather than a horizon.
    const bleed=seeded(311977);
    for(let i=0;i<260;i++){
      const x=bleed()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5,reach=2+bleed()*bleed()*16,bend=(bleed()-.5)*6;
      for(const wrap of [-w,0,w]){
        g.strokeStyle=`rgba(${ink.dark.fleckDark},${.08+bleed()*.22})`;g.lineWidth=.35+bleed()*.7;
        g.beginPath();g.moveTo(x+wrap,edge+6);g.bezierCurveTo(x+wrap+bend,edge+2,x+wrap-bend,edge-reach*.5,x+wrap+bend*.4,edge-reach);g.stroke();
      }
    }
    for(let i=0;i<14;i++){
      const x=bleed()*w,y=44+bleed()*90,rx=10+bleed()*34,ry=4+bleed()*11,seed=Math.floor(bleed()*1e7);
      for(const wrap of [-w,0,w]){landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=`rgba(${ink.dark.fleckDark},.55)`;g.fill();}
    }
  }
  for(let layer=0;layer<5;layer++){
    g.beginPath();g.moveTo(0,h);
    for(let x=0;x<=w;x+=4){
      const a=x/w*TAU,y=28+layer*13+Math.sin(a*3+layer*.6)*6+Math.sin(a*11-layer*.4)*2.5;
      g.lineTo(x,y);
    }
    g.lineTo(w,h);g.closePath();g.fillStyle=ink.dark.voidLayers[layer];g.fill();
  }
  g.save();g.beginPath();g.rect(0,27,w,h-27);g.clip();
  for(let i=0;i<24;i++){
    const x=rng()*w,y=36+rng()*100,rx=14+rng()*52,ry=6+rng()*18,seed=Math.floor(rng()*1e7);
    for(const wrap of [-w,0,w]){
      landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=i%3?ink.dark.landFillWash:ink.dark.landFillPool;g.fill();
      g.strokeStyle=`rgba(${pigment},.055)`;g.lineWidth=.6;g.stroke();
    }
  }
  // The pigment settles along paper fibres, leaving a ragged, pale tide mark.
  for(let i=0;i<220;i++){
    const x=rng()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5;
    const length=2+rng()*15,bend=(rng()-.5)*5;
    for(const wrap of [-w,0,w]){
      g.strokeStyle=`rgba(${pigment},${.045+rng()*.07})`;g.lineWidth=.3+rng()*.45;
      g.beginPath();g.moveTo(x+wrap,edge+length);
      g.bezierCurveTo(x+wrap+bend,edge+length*.6,x+wrap-bend,edge+2,x+wrap,edge);g.stroke();
    }
  }
  for(let i=0;i<2400;i++){
    const x=rng()*w,y=28+rng()*(h-28),fade=Math.pow(1-(y-28)/(h-28),1.5);
    g.fillStyle=i%3?`rgba(${pigment},${fade*(.02+rng()*.09)})`:`rgba(${ink.dark.fleckDark},${fade*.18})`;
    g.fillRect(x,y,.3+rng()*.65,.35+rng()*.6);
  }
  g.restore();
  // The shallow fringe is translucent; the calibrated danger line stays clear.
  for(let i=0;i<75;i++){
    const x=rng()*w,top=7+rng()*15,length=1+rng()*4;
    g.strokeStyle=`rgba(${pigment},${.035+rng()*.055})`;g.lineWidth=.45;
    g.beginPath();g.moveTo(x,25);g.bezierCurveTo(x+length,21,x-length,top+4,x+.7,top);g.stroke();
  }
  darknessPlates.set(relief,c);return c;
}
function drawDark(dt=0){
  // Match the visible hairline to the simulation's exact loss threshold.
  const fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);
  if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  const time=reducedMotion?0:world.time,s=scale;
  const shoreBase=ink.dark.pigment.split(',').map(Number),shoreTarget=ink.dark.shorelineRelief.split(',').map(Number);
  const rgb=shoreBase.map((v,i)=>Math.round(lerp(v,shoreTarget[i],darknessRelief))).join(',');
  ctx.save();
  const body=ctx.createLinearGradient(0,fy,0,fy+68*s);
  body.addColorStop(0,`rgba(${ink.dark.bodyTop},.12)`);body.addColorStop(.4,`rgba(${ink.dark.bodyMid},.82)`);body.addColorStop(1,ink.dark.washSolid);
  ctx.fillStyle=body;ctx.fillRect(0,fy,W,Math.max(0,H-fy));
  const tileWidth=640*s,tileHeight=180*s,drift=(time*2.3*s)%tileWidth;
  const normal=darknessPlate(false),relief=darknessPlate(true);
  for(let x=-drift-tileWidth;x<W;x+=tileWidth){
    ctx.drawImage(normal,x,fy-24*s,tileWidth,tileHeight);
    if(darknessRelief>.001){ctx.globalAlpha=darknessRelief;ctx.drawImage(relief,x,fy-24*s,tileWidth,tileHeight);ctx.globalAlpha=1;}
  }
  // One fine shoreline communicates danger; softer sediment lines stay below it.
  line(0,fy,W,fy,`rgba(${rgb},${.38+near*.24+darknessRelief*.12})`,Math.max(.65,s*.75));
  for(let layer=0;layer<3;layer++){
    ctx.strokeStyle=`rgba(${rgb},${(.18-layer*.04)*(1+darknessRelief*.45)})`;ctx.lineWidth=.45*s;
    ctx.beginPath();
    for(let x=-8;x<W+9;x+=8){
      const y=fy+(3+layer*5+(Math.sin(x/(48*s)+time*.19+layer)*.5+.5)*(2+layer))*s;
      if(x===-8)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  for(const mote of inkMotes){
    const phase=(mote.phase+time*mote.speed)%1,alpha=Math.sin(phase*Math.PI)*(.13+near*.09+darknessRelief*.1);
    const x=mote.x*W+Math.sin(time*.3+mote.drift)*2*s,y=fy-(4+phase*25)*s;
    line(x,y,x+.3*s,y+mote.length*s,`rgba(${rgb},${alpha})`,.55*s);
  }
  if(near>.2&&world.state==='playing'){
    const edge=ctx.createRadialGradient(W*.5,H*.5,H*.3,W*.5,H*.5,Math.max(W,H)*.65);
    edge.addColorStop(0,'rgba(81,48,39,0)');edge.addColorStop(1,`rgba(${rgb},${near*.105*(1-darknessRelief*.75)})`);
    ctx.fillStyle=edge;ctx.fillRect(0,0,W,H);
  }
  ctx.restore();
}
function burst(x,y,count,color='gold',force=1){
  if(reducedMotion)return;
  for(let i=0;i<count;i++){
    const a=Math.random()*TAU,v=(18+Math.random()*90)*force;
    particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.4+Math.random()*.7,max:1.1,size:.6+Math.random()*1.3,color});
  }
  if(particles.length>230)particles.splice(0,particles.length-230);
}
function drawTransferMark(r,t){
  const grow=reducedMotion?0:1-Math.pow(1-t,3),radius=r.start+grow*r.distance;
  const x=r.node?r.node.x:r.x,y=r.node?r.node.y:r.y,alpha=Math.pow(1-t,1.5)*r.alpha;
  const sectors=r.perfect?8:5;
  ctx.save();ctx.translate(sx(x),sy(y));ctx.scale(scale,scale);ctx.rotate(r.angle);
  for(let j=0;j<sectors;j++){
    const a=j*TAU/sectors,gap=r.perfect?.055:.11;
    ctx.strokeStyle=`rgba(${ink.dark.transferArc},${alpha})`;ctx.lineWidth=r.perfect?.9:.6;
    ctx.beginPath();ctx.arc(0,0,radius,a+gap,a+TAU/sectors-gap);ctx.stroke();
    if(r.perfect){
      ctx.strokeStyle=`rgba(${ink.dark.transferArcSoft},${alpha*.68})`;ctx.lineWidth=.4;
      ctx.beginPath();ctx.arc(0,0,radius+3,a+.1,a+TAU/sectors-.17);ctx.stroke();
      const c=Math.cos(a),s=Math.sin(a),reach=j%2===0?6:3;
      line(c*(radius+1),s*(radius+1),c*(radius+reach),s*(radius+reach),`rgba(${ink.dark.transferTick},${alpha})`,.6);
    }
  }
  // A short fan marks the actual point of contact, like a nib touching paper.
  if(!reducedMotion){
    for(let i=-2;i<=2;i++){
      const a=i*.07,c=Math.cos(a),s=Math.sin(a),start=radius+3,reach=(r.perfect?12:6)*(1-Math.abs(i)*.16);
      line(c*start,s*start,c*(start+reach),s*(start+reach),`rgba(${ink.dark.transferNib},${alpha*.72})`,.5);
    }
  }
  ctx.restore();
}
function drawEffects(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];if(world.state!=='paused'){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*1.5);p.vy*=Math.exp(-dt*1.5);}
    if(p.life<=0){particles.splice(i,1);continue;}
    const alpha=clamp(p.life/p.max,0,1),rgb=p.color==='red'?ink.dark.burstRed:p.color==='blue'?ink.dark.burstBlue:ink.dark.burstGold;
    line(sx(p.x),sy(p.y),sx(p.x-p.vx*.025),sy(p.y-p.vy*.025),`rgba(${rgb},${alpha})`,p.size*scale);
  }
  for(let i=rings.length-1;i>=0;i--){
    const r=rings[i];if(world.state!=='paused')r.age+=dt;if(r.age>r.life){rings.splice(i,1);continue;}
    const t=r.age/r.life;
    if(r.kind==='capture'){drawTransferMark(r,t);continue;}
    ctx.strokeStyle=`rgba(${ink.dark.ringSimple},${(1-t)*r.alpha})`;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(sx(r.x),sy(r.y),(r.start+(reducedMotion?0:t*r.distance))*scale,0,TAU);ctx.stroke();
  }
  for(let i=floaters.length-1;i>=0;i--){
    const f=floaters[i];if(world.state!=='paused')f.age+=dt;if(f.age>1.15){floaters.splice(i,1);continue;}
    ctx.fillStyle=`rgba(${ink.dark.floaterText},${Math.min(1,f.age*8)*clamp((1.15-f.age)*3,0,1)})`;ctx.font=`${18*scale}px 'IM Fell English',Georgia,serif`;ctx.textAlign='center';ctx.fillText(f.text,sx(f.x),sy(f.y)-(reducedMotion?0:f.age*24*scale));
  }
}
