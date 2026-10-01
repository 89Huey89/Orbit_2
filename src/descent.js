'use strict';
/* Orbit · src/descent.js
   The circle's turn (JOURNEY.md §9.1, §9.2): the Probe's sheet does not recede in its own material as the
   seven below it do, it is fallen through. */
// ---------- The descent from the probe to the hand ----------
// Every other change of century grows the new sheet out of the body landed on while the old one gives way at
// the circle's edge (src/recede.js). The last one is the one turn nothing before it says is coming, so it moves
// as nothing else on the ladder moves: a zoom, one continuous fall inward on the body just landed on. The probe's
// own field is pushed into until it thins to black; the black streams with stars and a pale point swells at its
// heart into a blue world; the world fills the sheet and gives way to a sky over a landscape at dusk, with a cave
// mouth in the hillside where the body was; the cave mouth swallows the sheet, a torch catches a wall, and a hand
// reaches in and presses one dot of ochre on it, where the probe was looking. The dot is the body, and the wall
// it is set on is the new century's own sheet, opened out from it as the dark of the cave draws back.
// Three things are shown and never said (§9.2). The probe's daughter goes ahead of the fall as a spark trailing
// the probe's own dotted wake and is lost in the world's clouds: a seed. For a moment the world is struck twice
// more, faintly, beside itself, as if there were several to arrive at. And the probe's clock, T+ as its sheet
// counts, is carried under the world and runs the other way, to seventeen thousand years before the count began.
// A round that followed a star (src/onestar.js) ends on it: the dot the hand presses is lettered with that star's
// name, in the wall's own hand, and held a little longer so it can be read. Only the star is named; the three
// hints stay as they are. The first round followed none, and its descent ends on an unnamed dot.
// Everything here reads the run's clock, so a pause holds the fall where it is; it is drawn in CSS pixels over
// whatever the new century has already drawn, and it reads no plate tokens except for the probe's own face,
// taken as the page turns, since the press already holds the Rock's by the time the first frame is drawn.
const DESCENT_TIME=6.6;
const descentEase=(a,b,t)=>{const u=clamp((t-a)/(b-a),0,1);return u*u*(3-2*u);};
const descentBell=(a,b,c,d,t)=>descentEase(a,b,t)*(1-descentEase(c,d,t));
function descentBegin(g){
  let s=((g.x*73856093)^(g.y*19349663)^0x9e3779b9)>>>0;
  const rng=()=>{s=(s+0x6D2B79F5)>>>0;let r=Math.imul(s^(s>>>15),1|s);r^=r+Math.imul(r^(r>>>7),61|r);return ((r^(r>>>14))>>>0)/4294967296;};
  // The round about to close is the one in hand: the descent is begun before the circle is counted.
  g.star=runMode==='journey'?oneStarOfRound(journey.rounds+1):null;g.hold=g.star?1.2:0;
  g.descent=true;g.dur=DESCENT_TIME+g.hold;
  // The clock is lettered in the face the probe counted in, asked before the page turns to the Rock.
  g.face=plateFace(11,'text');
  g.stars=[];for(let i=0;i<260;i++)g.stars.push({a:rng()*TAU,d:.01+rng()*rng()*1.2,m:.3+rng()*.7});
  // The cave mouth is a broken edge of rock, never an arch: its outline is jittered once and kept.
  g.mouth=Array.from({length:22},(_,i)=>{const a=Math.PI+i/21*Math.PI,k=.86+rng()*.22;return {x:Math.cos(a)*12*k,y:6+Math.sin(a)*13*k};});
  // Each world is its own scatter of land and cloud, so the two struck beside it are not the same world.
  const blob=()=>{const cx=rng()*1.5-.75,cy=rng()*1.5-.75,r=.1+rng()*.28;return Array.from({length:14},(_,i)=>{const a=i/14*TAU,k=r*(.6+rng()*.7);return {x:cx+Math.cos(a)*k,y:cy+Math.sin(a)*k*.8};});};
  const world=()=>({land:Array.from({length:6},blob),
    cloud:Array.from({length:16},()=>({x:rng()*1.8-.9,y:rng()*1.8-.9,r:.08+rng()*.4,a0:rng()*TAU,span:.5+rng()*1.4,w:.02+rng()*.05}))});
  g.worlds=[world(),world(),world()];
  g.flicker=rng()*100;
}
// The body the fall is aimed at, where the camera now holds it: the zoom's one fixed point.
const descentAt=g=>({x:sx(g.x),y:sy(g.y)});
function descentWorld(c,x,y,r,w,alpha){
  if(r<.4||alpha<=0)return;
  c.save();c.globalAlpha=alpha;
  if(r<3){c.fillStyle='rgba(190,215,255,1)';c.beginPath();c.arc(x,y,Math.max(.8,r),0,TAU);c.fill();c.restore();return;}
  const sea=c.createRadialGradient(x-r*.35,y-r*.4,r*.05,x,y,r);
  sea.addColorStop(0,'rgb(88,148,214)');sea.addColorStop(.6,'rgb(34,84,160)');sea.addColorStop(1,'rgb(12,34,82)');
  c.fillStyle=sea;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
  c.save();c.beginPath();c.arc(x,y,r,0,TAU);c.clip();
  // Land as ragged coasts in two tones, and cloud as thin bands laid twice, the second wider and fainter.
  for(const [fill,grow] of [['rgba(92,104,62,.8)',1],['rgba(150,138,92,.45)',.72]])for(const l of w.land){
    const mx=l.reduce((v,q)=>v+q.x,0)/l.length,my=l.reduce((v,q)=>v+q.y,0)/l.length;
    c.fillStyle=fill;c.beginPath();l.forEach((q,i)=>{const px=x+(mx+(q.x-mx)*grow)*r,py=y+(my+(q.y-my)*grow)*r;if(i)c.lineTo(px,py);else c.moveTo(px,py);});c.closePath();c.fill();}
  c.lineCap='round';
  for(const pass of [[2.4,.16],[1,.5]])for(const k of w.cloud){c.strokeStyle=`rgba(244,247,255,${pass[1]})`;c.lineWidth=Math.max(.5,k.w*r*pass[0]);c.beginPath();c.arc(x+k.x*r,y+k.y*r,k.r*r,k.a0,k.a0+k.span);c.stroke();}
  // The night side, then the thin blue of the air on the limb.
  const dark=c.createLinearGradient(x-r*.2,y-r*.3,x+r,y+r*.9);dark.addColorStop(0,'rgba(2,4,12,0)');dark.addColorStop(1,'rgba(2,4,12,.88)');
  c.fillStyle=dark;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
  c.strokeStyle='rgba(140,190,255,.55)';c.lineWidth=Math.max(1,r*.035);c.beginPath();c.arc(x,y,r,Math.PI*.7,Math.PI*1.95);c.stroke();
  c.restore();
}
// The land at dusk round the cave, drawn in units about the cave mouth and scaled as the fall closes on it.
function descentLand(c,x,y,z,t,g){
  c.save();c.translate(x,y);c.scale(z,z);
  const sky=c.createLinearGradient(0,-240,0,8);sky.addColorStop(0,'rgb(10,14,40)');sky.addColorStop(.75,'rgb(58,52,92)');sky.addColorStop(1,'rgb(168,104,74)');
  c.fillStyle=sky;c.fillRect(-900,-900,1800,912);
  c.fillStyle='rgba(255,246,226,.85)';
  for(let i=0;i<40;i++){const s=g.stars[i];const sx0=Math.cos(s.a)*420*s.d*2-0,sy0=-30-Math.abs(Math.sin(s.a))*200*s.d*2;c.beginPath();c.arc(sx0,sy0,.35+s.m*.5,0,TAU);c.fill();}
  // The far ridge, then the hill the cave is cut into, then the plain in front of it.
  c.fillStyle='rgb(40,30,34)';c.beginPath();c.moveTo(-900,6);c.lineTo(-300,-8);c.quadraticCurveTo(-180,-26,-90,-12);c.quadraticCurveTo(80,-30,260,-6);c.lineTo(900,2);c.lineTo(900,40);c.lineTo(-900,40);c.fill();
  c.fillStyle='rgb(26,18,16)';c.beginPath();c.moveTo(-160,12);c.quadraticCurveTo(-70,-40,0,-44);c.quadraticCurveTo(70,-42,150,12);c.fill();
  c.fillStyle='rgb(20,14,10)';c.fillRect(-900,10,1800,900);
  const glow=c.createRadialGradient(0,1,0,0,1,26);glow.addColorStop(0,'rgba(236,150,70,.5)');glow.addColorStop(1,'rgba(236,150,70,0)');
  c.fillStyle=glow;c.beginPath();c.arc(0,1,26,0,TAU);c.fill();
  // A few strata across the hill face, then the mouth: a ragged opening, darkest at its heart.
  c.strokeStyle='rgba(58,42,34,.35)';c.lineWidth=.6;for(const [a,b,k] of [[-120,-6,-18],[-90,-20,-30],[40,-24,-14],[60,-8,-2]]){c.beginPath();c.moveTo(a,b);c.quadraticCurveTo((a+b)/2,k,a+60,b+4);c.stroke();}
  const m=g.mouth,hole=c.createRadialGradient(0,2,0,0,2,13);hole.addColorStop(0,'rgb(2,1,1)');hole.addColorStop(.7,'rgb(8,5,4)');hole.addColorStop(1,'rgb(30,20,16)');
  c.fillStyle=hole;c.beginPath();m.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.quadraticCurveTo(7,7.5,1,6.8);c.quadraticCurveTo(-6,7.6,m[0].x,m[0].y);c.fill();
  c.restore();
}
// A hand in silhouette, drawn with the finger's tip at the origin and the arm running off to +x.
function descentHand(c,x,y,s,angle,off,alpha){
  if(alpha<=0)return;
  c.save();c.translate(x,y);c.rotate(angle);c.translate(off,0);c.scale(s,s);c.globalAlpha=alpha;
  const skin='rgb(46,26,16)';c.fillStyle=skin;c.strokeStyle=skin;c.lineCap='round';
  c.lineWidth=46;c.beginPath();c.moveTo(96,20);c.lineTo(320,58);c.stroke();
  c.beginPath();c.ellipse(64,10,30,22,.12,0,TAU);c.fill();
  c.lineWidth=10;c.beginPath();c.moveTo(44,4);c.lineTo(4,0);c.stroke();
  c.lineWidth=11;c.beginPath();c.moveTo(56,-10);c.lineTo(36,-20);c.stroke();
  for(const k of [0,1,2]){c.beginPath();c.arc(44+k*11,26+k*2,7,0,TAU);c.fill();}
  // Torchlight along the upper edge only, from the flame behind and above.
  c.strokeStyle='rgba(236,150,80,.45)';c.lineWidth=2.2;c.beginPath();c.moveTo(4,-4);c.lineTo(40,-3);c.moveTo(38,-24);c.lineTo(58,-14);c.moveTo(70,-11);c.quadraticCurveTo(92,-6,110,-2);c.lineTo(320,34);c.stroke();
  c.restore();
}
function descentFrame(g){
  const t=world.time-g.t0;if(t>=g.dur)return false;
  const {x,y}=descentAt(g),diag=Math.hypot(W,H),c=ctx;
  // The fall is aimed at the body, but drifts to the middle of the sheet while it is out among the stars and back
  // to the body as the cave closes on it, so the world is met face on rather than at the sheet's edge.
  const k=descentBell(.35,1.6,3.9,4.6,t),fx=x+(W/2-x)*k,fy=y+(H*.44-y)*k;
  c.save();c.setTransform(DPR,0,0,DPR,0,0);
  // How much of the sheet is still the fall rather than the wall: whole until the cave, then opened from the dot.
  const open=descentEase(4.9,6.3,t),hole=open*diag*1.15;
  c.save();
  if(hole>0){c.beginPath();c.rect(0,0,W,H);c.arc(x,y,hole,0,TAU,true);c.clip('evenodd');}
  c.fillStyle='rgb(1,2,6)';c.fillRect(0,0,W,H);
  // The probe's field, pushed into.
  if(t<1.3&&g.snap){
    const z=Math.exp(1.7*t),a=1-descentEase(.45,1.3,t);
    c.save();c.globalAlpha=a;c.translate(x,y);c.scale(z,z);c.translate(-x,-y);c.drawImage(g.snap,0,0,W,H);c.restore();
  }
  // The stars streaming past, the field turning very slightly backward as it goes.
  {
    const a=descentBell(.5,.95,2.7,3.3,t);
    if(a>0){const grow=Math.exp(2.1*(t-.5)),turn=-(t-.5)*.1;
      for(const s of g.stars){const d=s.d*diag*.6*grow;if(d>diag)continue;const an=s.a+turn,len=Math.min(40,d*.09);
        c.strokeStyle=`rgba(236,240,255,${(a*s.m).toFixed(3)})`;c.lineWidth=.6+s.m*.9;c.beginPath();
        c.moveTo(fx+Math.cos(an)*d,fy+Math.sin(an)*d);c.lineTo(fx+Math.cos(an)*(d+len),fy+Math.sin(an)*(d+len));c.stroke();}}
  }
  // The daughter gone ahead: a spark on the probe's dotted wake, lost in the clouds as the world comes up.
  {
    const a=descentBell(.8,1.0,2.1,2.4,t);
    if(a>0){const u=descentEase(.8,2.25,t),bx=fx-W*.42,by=fy+H*.34,cx0=fx-W*.3,cy0=fy-H*.05;
      const at=v=>({px:(1-v)*(1-v)*bx+2*(1-v)*v*cx0+v*v*fx,py:(1-v)*(1-v)*by+2*(1-v)*v*cy0+v*v*fy});
      c.fillStyle=`rgba(236,240,255,${(a*.6).toFixed(3)})`;
      for(let k=1;k<9;k++){const v=u-k*.045;if(v<0)break;const q=at(v);c.beginPath();c.arc(q.px,q.py,1.4*(1-k/10),0,TAU);c.fill();}
      const q=at(u);c.fillStyle=`rgba(255,250,236,${a.toFixed(3)})`;c.beginPath();c.arc(q.px,q.py,2.2,0,TAU);c.fill();}
  }
  // The world, swelling from a point; two more struck faintly beside it for a moment.
  const wr=1.2*Math.exp(2.75*(t-1.2)),wa=descentEase(1.1,1.5,t)*(1-descentEase(3.25,3.6,t));
  if(wa>0&&wr<diag*2){
    const ghost=descentBell(1.95,2.3,2.55,2.95,t)*.16;
    if(ghost>0){descentWorld(c,fx-wr*1.45,fy+wr*.2,wr*.9,g.worlds[1],ghost*wa);descentWorld(c,fx+wr*1.4,fy-wr*.28,wr*.86,g.worlds[2],ghost*wa);}
    descentWorld(c,fx,fy,wr,g.worlds[0],wa);
  }
  // The probe's clock, carried under the world and run the other way.
  {
    const a=descentBell(1.5,1.8,3.1,3.45,t);
    if(a>0&&g.face){const years=Math.round(17000*descentEase(1.6,3.2,t)),ty=Math.min(H-48,fy+Math.max(36,wr+18));
      c.font=g.face;c.textAlign='center';c.textBaseline='middle';c.fillStyle=`rgba(214,228,220,${(a*.8).toFixed(3)})`;
      c.fillText('T-'+String(years).padStart(5,'0')+'.0 Y',fx,ty);}
  }
  // Through the air into the dusk over the land, and down into the cave mouth.
  {
    const a=descentEase(3.1,3.5,t);
    if(a>0){c.save();c.globalAlpha=a;descentLand(c,fx,fy,Math.exp(3.4*(t-3.3))*.9,t,g);c.restore();
      const veil=descentBell(3.0,3.3,3.4,3.8,t);if(veil>0){c.fillStyle=`rgba(236,238,246,${(veil*.75).toFixed(3)})`;c.fillRect(0,0,W,H);}}
  }
  // The inside of the cave: black, and a torch's warmth moving on the wall.
  {
    const a=descentEase(4.35,4.7,t);
    if(a>0){c.fillStyle=`rgba(3,2,1,${a.toFixed(3)})`;c.fillRect(0,0,W,H);
      const f=.8+.2*Math.sin((t+g.flicker)*11)*Math.sin((t+g.flicker)*7.3),tx=x-W*.25,ty=y+H*.2;
      const torch=c.createRadialGradient(tx,ty,0,tx,ty,diag*.55);torch.addColorStop(0,`rgba(220,128,58,${(.34*a*f).toFixed(3)})`);torch.addColorStop(1,'rgba(220,128,58,0)');
      c.fillStyle=torch;c.fillRect(0,0,W,H);}
  }
  c.restore();
  // The edge of the dark as the wall opens out from the dot, warm as the torch is.
  if(hole>2&&open<1){const soft=Math.min(60,hole*.5),edge=c.createRadialGradient(x,y,Math.max(0,hole-soft),x,y,hole);
    edge.addColorStop(0,'rgba(3,2,1,0)');edge.addColorStop(1,`rgba(3,2,1,${(.95*(1-open)).toFixed(3)})`);
    c.fillStyle=edge;c.beginPath();c.arc(x,y,hole,0,TAU);c.fill();}
  // The hand, and the one dot it presses where the probe was looking.
  {
    const reach=descentEase(4.8,5.65,t),back=descentEase(5.95,6.55,t),off=(1-reach)*W*.8+back*W*.7;
    descentHand(c,x,y,Math.max(.7,scale)*.95,.62,off+2,reach*(1-back));
    const hold=g.hold||0,dot=descentEase(5.62,5.72,t)*(1-descentEase(6.2+hold,6.6+hold,t));
    if(dot>0){const pulse=1+.35*(1-descentEase(5.65,6.0,t));
      c.fillStyle=`rgba(168,42,24,${(dot*.9).toFixed(3)})`;c.beginPath();c.arc(x,y,5.2*scale*pulse,0,TAU);c.fill();
      c.fillStyle=`rgba(212,86,46,${(dot*.55).toFixed(3)})`;c.beginPath();c.arc(x-1,y-1,2.6*scale*pulse,0,TAU);c.fill();}
    // The star's name over the dot, set in the face the wall now letters in, clear of the hand below it and of the
    // body's own ring as the wall comes up round it.
    const named=g.star?descentEase(5.8,6.1,t)*(1-descentEase(6.3+hold,6.6+hold,t)):0;
    if(named>0){const size=Math.max(15,17*scale),ty=y-Math.max(48,56*scale),word=oneStarName(g.star).toUpperCase();
      c.font=plateFace(size,'sc');c.textAlign='center';c.textBaseline='middle';
      c.lineJoin='round';c.lineWidth=Math.max(3,size*.3);c.strokeStyle=`rgba(3,2,1,${(named*.7).toFixed(3)})`;c.strokeText(word,x,ty);
      c.fillStyle=`rgba(232,186,132,${(named*.95).toFixed(3)})`;c.fillText(word,x,ty);}
  }
  c.restore();
  return true;
}
