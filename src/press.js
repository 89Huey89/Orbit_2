'use strict';
/* Orbit · src/press.js
   The press itself: what the rolling-press, the wiping hand and the strapwork cutter add to the sheet —
   the strike of a perfect landing, the second-colour pass over a finished figure, the plate tone the
   wiping hand leaves, and the strapwork cartouche the plate's title and imprint are set in. */
// Every mark in this file belongs to the printed atlas alone. The eras that draw in their own hand
// (src/rock.js, src/ceiling.js) take the whole frame through handFor('frame') and never reach the
// painters below, and the events they share with the atlas are turned away by renaissanceAtlas(), so an
// era's sheet is never struck by a press it did not have.
definePlate('press',{
  // The rubricator's red on paper and a burnished gold at night: the second plate is inked in the one
  // colour the sheet already keeps for what matters most, never a new one.
  night:{rubric:'226,190,112',embossLight:'236,222,186',embossDark:'0,4,10',toneStreak:'176,190,178',toneEdge:'150,168,160'},
  paper:{rubric:'164,46,28',embossLight:'255,250,236',embossDark:'40,28,18',toneStreak:'70,50,30',toneEdge:'64,44,24'}
});
// ---------- The press strike ----------
// A perfect transfer is the one landing the whole plate is struck for. For eighty milliseconds the sheet
// sits a pixel down and to the right, as it does when the bed runs under the roller with the pressure a
// shade too high, and the ring the traveller landed on prints with an embossed edge — a lit lip on one
// side and a shadowed one on the other — that dries back into the sheet over most of a second.
const PRESS_STRIKE=.08,PRESS_EMBOSS=.95,PRESS_BLOT=2.4,PRESS_NOVA=.85,PRESS_SHEEN=.28;
let pressWorld=null,pressStrike=Infinity,pressEmboss=[],pressNovae=[];
function pressReset(){pressWorld=world;pressStrike=Infinity;pressEmboss=[];pressNovae=[];}
// The press felt in the hand as well as seen: a short tick on a landing, a double one on a perfect, and one
// longer pulse when the run is lost. Wherever the device can do it (Android; iOS offers no vibration to a
// page), on every plate, and never under a stiller press (reduced motion), which asks for less of all this.
const PRESS_HAPTICS={capture:10,perfect:[10,40,12],death:34};
function pressHaptic(type,e){
  if(reducedMotion||typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return;
  const pattern=type==='capture'?(e&&e.perfect&&!e.steep?PRESS_HAPTICS.perfect:PRESS_HAPTICS.capture):type==='death'?PRESS_HAPTICS.death:null;
  if(pattern)try{navigator.vibrate(pattern);}catch(_){}
}
function pressEvent(type,e){
  pressHaptic(type,e);
  if(typeof world==='undefined'||!world||!renaissanceAtlas())return;
  if(pressWorld!==world||type==='start')pressReset();
  // A slingshot star at full charge strikes its rays across the chart (drawPress, below).
  if(type==='charged'&&world.player.node){pressNovae.push({node:world.player.node,age:0,seed:(world.player.node.id*48271+world.captures)>>>0});if(pressNovae.length>2)pressNovae.shift();}
  if(type==='capture'&&e.perfect&&!e.steep){
    if(!reducedMotion)pressStrike=0;
    pressEmboss.push({node:e.n,age:0,seed:(e.n.id*7919+world.captures*104729)>>>0});
    if(pressEmboss.length>4)pressEmboss.shift();
  }
}
// The offset the whole sheet is set down at this frame, in CSS pixels (render() in frame.js multiplies it
// into the one transform the frame is drawn under). Nought except inside a strike.
function pressShift(){return pressWorld===world&&pressStrike<PRESS_STRIKE?1:0;}
// Drawn with the chart's other effects (drawEffects, effects.js), under the lettering and the traveller.
function drawPress(dt){
  if(pressWorld!==world||!renaissanceAtlas())return;
  const running=world.state!=='paused';
  if(running)pressStrike+=dt;
  // Blind embossing: every ring a landing was made on keeps the bite of the press after its ink has dried
  // back, an uninked relief a hair outside the ring — lit on the upper left, shadowed on the lower right —
  // so the route taken reads on the sheet as a line of pressed circles even where the eye has lost the ink.
  // Two plain arcs a ring rather than the burin's own cut: it is a dent, not a line, and there may be a
  // dozen on the sheet at once.
  if(!plainPlate()){
    const paper=onPaper(),off=.7*scale,lw=Math.max(.6,.9*scale),la=paper?.34:.06,da=paper?.14:.32;
    ctx.save();ctx.lineWidth=lw;
    for(const n of world.nodes){
      if(!n.visited)continue;
      const x=sx(n.x),y=sy(n.y),r=n.r*scale+2.2*scale;
      if(y<-r-4||y>H+r+4)continue;
      ctx.strokeStyle=`rgba(${ink.press.embossLight},${la})`;ctx.beginPath();ctx.arc(x-off,y-off,r,Math.PI*.55,Math.PI*1.95);ctx.stroke();
      ctx.strokeStyle=`rgba(${ink.press.embossDark},${da})`;ctx.beginPath();ctx.arc(x+off,y+off,r,-Math.PI*.45,Math.PI*.95);ctx.stroke();
    }
    ctx.restore();
  }
  // The nova struck across the plate: at full charge the star's primary spokes are cut once more, long,
  // out past its own gauge and across whatever orbits lie about it — the one mark on the sheet allowed to
  // cross an orbit — and dry back to nothing in under a second. A stella nova is the brightest thing the
  // plate ever records, and for that instant the burin says so.
  // Cut off at the plate's inner rule and above the footer band, the way every other mark on the chart is.
  const rule=frameBand()*.92;
  const clipped=pressNovae.length>0;
  if(clipped){ctx.save();ctx.beginPath();ctx.rect(rule,rule,Math.max(0,W-rule*2),Math.max(0,H-footerBand()-rule));ctx.clip();}
  for(let i=pressNovae.length-1;i>=0;i--){
    const v=pressNovae[i];if(running)v.age+=dt;
    if(v.age>=PRESS_NOVA){pressNovae.splice(i,1);continue;}
    const n=v.node,x=sx(n.x),y=sy(n.y),t=v.age/PRESS_NOVA,reach=reducedMotion?1:clamp(t/.12,0,1),fade=Math.pow(1-t,1.4);
    const rng=seeded(v.seed||1),rays=8,len=Math.min(W,H)*.42*(.8+.2*reach),inner=n.r*scale*.55,rgb=ink.marks.slingFill||ink.dark.burstGold;
    for(let k=0;k<rays;k++){
      const a=k*TAU/rays-Math.PI/2+(rng()-.5)*.08,l=len*(k%2?.62:1)*(.9+rng()*.2)*reach;
      burinSegment(ctx,x+Math.cos(a)*inner,y+Math.sin(a)*inner,x+Math.cos(a)*(inner+l),y+Math.sin(a)*(inner+l),rgb,(onPaper()?.55:.62)*fade*(k%2?.7:1),cut('bold')*(k%2?.8:1.1),v.seed^(k*977+13),{segments:6,wobble:.3,hair:false});
    }
  }
  if(clipped)ctx.restore();
  // The wet ink's sheen, at night: the last fraction of a second of the trail still lies proud of the
  // sheet and catches a narrow glint along its crest, which dries away as the stroke sinks in. It is the
  // one light ink really has, so it is the only highlight the night plate ever lays on a line.
  if(!onPaper()&&!reducedMotion&&world.trail&&world.trail.length>2){
    const tr=world.trail,now=world.time,off=.55*scale;
    ctx.save();ctx.lineCap='round';
    for(let k=tr.length-1;k>0;k--){
      const a=tr[k],b=tr[k-1],age=now-b.time;if(age>PRESS_SHEEN)break;
      const wet=1-age/PRESS_SHEEN;
      ctx.strokeStyle=`rgba(${ink.press.embossLight},${(.42*wet*wet).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.7*scale);
      ctx.beginPath();ctx.moveTo(sx(a.x)-off,sy(a.y)-off);ctx.lineTo(sx(b.x)-off,sy(b.y)-off);ctx.stroke();
    }
    ctx.restore();
  }
  for(let i=pressEmboss.length-1;i>=0;i--){
    const m=pressEmboss[i];if(running)m.age+=dt;
    if(m.age>=PRESS_EMBOSS){pressEmboss.splice(i,1);continue;}
    const n=m.node,x=sx(n.x),y=sy(n.y),r=n.r*scale;
    if(y<-r-20||y>H+r+20)continue;
    // Full at the strike and dried back into the sheet by the end: a quick rise so the bite reads as one
    // blow rather than a fade-in, then an ease out.
    const t=m.age/PRESS_EMBOSS,k=clamp(t/.08,0,1)*Math.pow(1-t,1.6),off=.75*scale,wt=cut('bold')*1.1,paper=onPaper();
    // The lit lip toward the top left, where the room's light falls; the shadow the groove throws opposite.
    burinArc(ctx,x-off,y-off,r,0,TAU,ink.press.embossLight,(paper?.7:.32)*k,wt,m.seed,{skips:0,wobble:.12});
    burinArc(ctx,x+off,y+off,r,0,TAU,ink.press.embossDark,(paper?.46:.7)*k,wt,m.seed+17,{skips:0,wobble:.12});
  }
}
// ---------- The second colour pass over a finished figure ----------
// The biggest reward in the game is a figure closed, so it is the one moment a second plate is laid over
// the first: the whole figure is inked again in the rubricator's colour in one sweep of the dabber from
// its left edge to its right, a pixel or two off register the way a second pull always lands, and the
// sheet settles it back onto the line and lets it dry into the hand colour already there. It reads
// chart.flash (set to 2.4 at completion by the simulation, run down with its clock), so it pauses with
// the run and a replay lays it exactly where the flight did.
const PRESS_COLOUR_LIFE=2.4;
function pressTinted(layer){
  const rgb=ink.press.rubric;
  if(layer.pressTint&&layer.pressTintRgb===rgb)return layer.pressTint;
  const c=makeCanvas(layer.canvas.width,layer.canvas.height),g=c.getContext('2d');
  g.drawImage(layer.canvas,0,0);g.globalCompositeOperation='source-in';g.fillStyle=`rgb(${rgb})`;g.fillRect(0,0,c.width,c.height);
  layer.pressTint=c;layer.pressTintRgb=rgb;return c;
}
function pressColourPass(chart,layer,x,y){
  if(!chart.completed||chart.expired||!(chart.flash>0)||!renaissanceAtlas()||plainPlate())return;
  const t=clamp(1-chart.flash/PRESS_COLOUR_LIFE,0,1),w=layer.canvas.width,h=layer.canvas.height;
  // The dabber crosses the figure in the first third of the pass; reduced motion lays it whole.
  const sweep=reducedMotion?1:clamp(t/.3,0,1),reach=w*(1-Math.pow(1-sweep,2));
  const settle=reducedMotion?0:1-clamp((t-.3)/.3,0,1),alpha=clamp(t/.06,0,1)*Math.pow(1-t,1.2)*(onPaper()?.62:.72);
  if(!(alpha>.005)||!(reach>0))return;
  const tint=pressTinted(layer),ox=1.6*scale*settle,oy=-1.1*scale*settle;
  ctx.save();ctx.globalAlpha=alpha;
  ctx.beginPath();ctx.rect(x+ox,y+oy-2,reach,h+4);ctx.clip();
  ctx.drawImage(tint,x+ox,y+oy);
  ctx.restore();
}
// ---------- Plate tone ----------
// A plate is wiped by hand before every pull, first with a pad of scrim and then with the heel of the
// palm, and never wiped clean: a film of ink stays on the metal, heavier toward the edges where the hand
// turns and cannot press, and streaked in long shallow arcs the way the palm travelled. Cut once into the
// cached frame layer (buildFrameLayer, frame.js), inside the plate mark and clipped to it, so the tone
// stops dead at the mark the way it does on a real impression and costs nothing per frame.
function plateTone(g,x,y,w,h,r){
  if(!(w>2&&h>2))return;
  const rng=seeded(((plateName.length*131+Math.round(w)*7+Math.round(h))*2654435761)>>>0||1),paper=onPaper();
  const edgeRgb=ink.press.toneEdge,streakRgb=ink.press.toneStreak,edgeA=paper?.09:.04,streakA=paper?.11:.05;
  g.save();g.beginPath();g.roundRect(x,y,w,h,r);g.clip();
  // The film the hand could not reach: four soft bands standing in from the edges, deepest in the corners
  // where two of them meet, and nothing at all across the middle of the plate.
  const band=Math.min(w,h)*.16;
  for(const [x0,y0,x1,y1,rx,ry,rw,rh] of [[x,0,x+band,0,x,y,band,h],[x+w,0,x+w-band,0,x+w-band,y,band,h],[0,y,0,y+band,x,y,w,band],[0,y+h,0,y+h-band,x,y+h-band,w,band]]){
    const grad=g.createLinearGradient(x0,y0,x1,y1);
    grad.addColorStop(0,`rgba(${edgeRgb},${edgeA})`);grad.addColorStop(1,`rgba(${edgeRgb},0)`);
    g.fillStyle=grad;g.fillRect(rx,ry,rw,rh);
  }
  // The palm's streaks: long shallow arcs about a centre well off the plate, all turning the same way, so
  // they lie nearly parallel across the sheet and bow gently the way a wiping arm swings from the elbow.
  // Each is laid in short chords so its strength can come and go along its length, and each is strongest
  // near the edges, where the film it drags is thickest.
  const cx=x-w*.9,cy=y+h*1.6,base=Math.hypot(w*1.4,h*.9),edgeWeight=(px,py)=>{
    const d=Math.min(px-x,x+w-px,py-y,y+h-py)/(Math.min(w,h)*.5);return .25+.75*Math.pow(clamp(1-d,0,1),1.5);
  };
  g.lineCap='round';
  const count=Math.round(clamp(w*h/2600,40,150));
  for(let i=0;i<count;i++){
    const rad=base*(.55+rng()*.95),a0=-Math.PI*.5+rng()*.9-.25,span=.12+rng()*.3,steps=10,phase=rng()*TAU,width=.5+rng()*2.4;
    for(let s=0;s<steps;s++){
      const t0=a0+span*s/steps,t1=a0+span*(s+1)/steps;
      const px=cx+Math.cos(t0)*rad,py=cy+Math.sin(t0)*rad,qx=cx+Math.cos(t1)*rad,qy=cy+Math.sin(t1)*rad;
      if((px<x||px>x+w||py<y||py>y+h)&&(qx<x||qx>x+w||qy<y||qy>y+h))continue;
      const along=Math.sin(s/steps*Math.PI)*(.55+.45*Math.sin(phase+s*.9));
      const a=streakA*along*edgeWeight(clamp(px,x,x+w),clamp(py,y,y+h))*(.4+rng()*.6);
      if(a<.002)continue;
      g.strokeStyle=`rgba(${streakRgb},${a.toFixed(4)})`;g.lineWidth=width;
      g.beginPath();g.moveTo(px,py);g.lineTo(qx,qy);g.stroke();
    }
  }
  g.restore();
}
// ---------- The strapwork cartouche ----------
// The frame a Renaissance plate sets its title and its imprint in: a flat strap bent round the panel,
// its corners cut in as concave notches, rolled into a pair of scrolls at either end and pierced with a
// lozenge at the head and foot, its lower and right-hand faces hatched as the side turned from the light.
// (x,y,w,h) is the whole ornament's box; the panel the lettering stands in is inset from it by the scrolls
// at the ends and the lozenges at the head and foot (see pressCartoucheInset). Baked once per size and ink
// into its own raster at the device's density and blitted, since the imprint and the title both stand on
// the sheet for most of a run.
const pressCartouches=new Map();
function pressCartoucheInset(w,h){
  const v=clamp(h*.12,4,8),e=clamp(h*.07,3,5);
  return {x:v*1.9,y:e};
}
function paintPressCartouche(g,w,h,rgb,alpha,weight,seed){
  const inset=pressCartoucheInset(w,h),v=inset.x/1.9,e=inset.y,s=clamp(Math.min(w,h)*.05,2.6,4.6),c=s*1.5;
  const x0=inset.x,y0=inset.y,x1=w-inset.x,y1=h-inset.y,mx=w*.5,my=h*.5,rng=seeded(seed>>>0||1);
  // One rim of the strap: four straight runs between concave corner notches, each notch a quarter circle
  // struck from the corner itself so the band reads as bent metal rather than a ruled box.
  const rim=(d,a,wt,sd)=>{
    const k=c+d,q=Math.sqrt(k*k-d*d),n=Math.asin(d/k),runX=clamp(Math.round((x1-x0)/18),6,30),runY=clamp(Math.round((y1-y0)/18),3,20);
    burinSegment(g,x0+q,y0+d,x1-q,y0+d,rgb,a,wt,sd,{segments:runX,hair:false,wobble:.2});
    burinSegment(g,x1-d,y0+q,x1-d,y1-q,rgb,a,wt,sd+5,{segments:runY,hair:false,wobble:.2});
    burinSegment(g,x1-q,y1-d,x0+q,y1-d,rgb,a,wt,sd+11,{segments:runX,hair:false,wobble:.2});
    burinSegment(g,x0+d,y1-q,x0+d,y0+q,rgb,a,wt,sd+17,{segments:runY,hair:false,wobble:.2});
    burinArc(g,x0,y0,k,n,Math.PI/2-n,rgb,a,wt,sd+23,{segments:5,skips:0,wobble:.1});
    burinArc(g,x1,y0,k,Math.PI/2+n,Math.PI-n,rgb,a,wt,sd+29,{segments:5,skips:0,wobble:.1});
    burinArc(g,x1,y1,k,Math.PI+n,Math.PI*1.5-n,rgb,a,wt,sd+31,{segments:5,skips:0,wobble:.1});
    burinArc(g,x0,y1,k,Math.PI*1.5+n,TAU-n,rgb,a,wt,sd+37,{segments:5,skips:0,wobble:.1});
  };
  rim(0,alpha,weight,seed);
  rim(s,alpha*.72,weight*.7,seed+101);
  // The inner fillet the lettering is ruled inside, a hair within the strap.
  rim(s+2.2,alpha*.32,Math.max(.3,weight*.4),seed+151);
  // The shade on the strap's two faces turned from the light: short hatches laid across the band on the
  // foot and the right-hand side, the only tone the ornament carries.
  g.save();g.strokeStyle=`rgba(${rgb},${alpha*.36})`;g.lineWidth=Math.max(.25,weight*.38);g.beginPath();
  for(let px=x0+c+s+1;px<x1-c-s;px+=2.3+rng()*.5){g.moveTo(px,y1-s+.6);g.lineTo(px-s*.6,y1-.6);}
  for(let py=y0+c+s+1;py<y1-c-s;py+=2.3+rng()*.5){g.moveTo(x1-s+.6,py);g.lineTo(x1-.6,py+s*.6);}
  g.stroke();g.restore();
  // The scrolls: at each end the strap rolls back on itself above and below the panel's middle, a turn and
  // a half of tightening curl apiece, joined across the end of the panel by the strap's own turned edge.
  for(const side of [-1,1]){
    const ex=side<0?x0:x1,vx=ex+side*v*.95;
    for(const up of [-1,1]){
      const vy=my+up*v*1.05,start=side<0?(up<0?Math.PI*.5:-Math.PI*.5):(up<0?Math.PI*.5:-Math.PI*.5);
      const turn=Math.PI*2.6*(side<0?-up:up);
      burinSpiral(g,vx,vy,v,v*.16,start,start+turn,rgb,alpha*.9,weight*.85,seed+211+side*13+up*7,{skips:0,wobble:.12});
      g.fillStyle=`rgba(${rgb},${alpha*.7})`;g.beginPath();g.arc(vx,vy,Math.max(.5,v*.14),0,TAU);g.fill();
    }
  }
  // The pierced lozenges at the head and foot, each standing half out of the strap.
  for(const up of [-1,1]){
    const ly=up<0?y0+s*.5:y1-s*.5,hw=e*2.4,hh=e*1.05;
    g.save();g.strokeStyle=`rgba(${rgb},${alpha*.85})`;g.lineWidth=Math.max(.35,weight*.7);
    g.beginPath();g.moveTo(mx-hw,ly);g.lineTo(mx,ly-hh);g.lineTo(mx+hw,ly);g.lineTo(mx,ly+hh);g.closePath();g.stroke();
    g.beginPath();g.arc(mx,ly,hh*.36,0,TAU);g.stroke();g.restore();
  }
}
function drawPressCartouche(x,y,w,h,rgb,alpha,weight,seed){
  if(!(w>20&&h>12)||!(alpha>0))return;
  const pad=2,key=[Math.round(w),Math.round(h),rgb,alpha.toFixed(3),weight,seed,DPR].join('|');
  let c=pressCartouches.get(key);
  if(!c){
    c=makeCanvas(Math.ceil((Math.round(w)+pad*2)*DPR),Math.ceil((Math.round(h)+pad*2)*DPR));
    const g=c.getContext('2d');g.scale(DPR,DPR);g.translate(pad,pad);
    paintPressCartouche(g,Math.round(w),Math.round(h),rgb,alpha,weight,seed);
    if(pressCartouches.size>12)pressCartouches.delete(pressCartouches.keys().next().value);
    pressCartouches.set(key,c);
  }
  ctx.drawImage(c,x-pad,y-pad,Math.round(w)+pad*2,Math.round(h)+pad*2);
}
// ---------- The printer's device ----------
// The house's own mark, set beside its name in the imprint the way every press of the century signed its
// sheets: an armillary sphere on its stand — the atlas's whole subject in one instrument — within an oval
// of two rules, stars pricked in the field around it and a spray of laurel crossed beneath. (cx,cy) is its
// centre and h its height; baked once per size and ink like the cartouche.
const pressDevices=new Map();
function paintPressDevice(g,w,h,rgb,alpha,seed){
  const cx=w*.5,cy=h*.46,rx=w*.46,ry=h*.42,wt=Math.max(.45,h/60);
  // The oval, cut twice: the outer rule full, the inner a hair within it and lighter.
  g.save();g.translate(cx,cy);
  burinArc(g,0,0,rx,0,TAU,rgb,alpha,wt*1.1,seed+1,{flatten:ry/rx,skips:0,wobble:.15,segments:36});
  burinArc(g,0,0,rx*.88,0,TAU,rgb,alpha*.55,wt*.6,seed+3,{flatten:ry/rx,skips:2,wobble:.12,segments:32});
  // The sphere: its meridian ring, the equator and the ecliptic as ellipses across it, the axis through
  // the poles, all raised a little so the stand has room beneath.
  const sy=-ry*.12,sr=rx*.5;
  burinArc(g,0,sy,sr,0,TAU,rgb,alpha,wt,seed+5,{skips:0,wobble:.1,segments:24});
  burinArc(g,0,sy,sr,0,TAU,rgb,alpha*.8,wt*.8,seed+7,{flatten:.3,skips:0,wobble:.1,segments:24});
  g.save();g.translate(0,sy);g.rotate(-.42);
  burinArc(g,0,0,sr,0,TAU,rgb,alpha*.8,wt*.8,seed+9,{flatten:.32,skips:1,wobble:.1,segments:24});
  g.restore();
  g.save();g.translate(0,sy);g.rotate(.26);
  burinSegment(g,0,-sr*1.3,0,sr*1.3,rgb,alpha*.9,wt*.8,seed+11,{segments:4,hair:false,wobble:.1});
  g.restore();
  // The earth at the centre, and the stand: a short pillar on a foot.
  g.fillStyle=`rgba(${rgb},${alpha*.85})`;g.beginPath();g.arc(0,sy,Math.max(.8,sr*.16),0,TAU);g.fill();
  burinSegment(g,0,sy+sr,0,ry*.62,rgb,alpha,wt,seed+13,{segments:3,hair:false,wobble:.1});
  burinSegment(g,-rx*.26,ry*.64,rx*.26,ry*.64,rgb,alpha,wt,seed+17,{segments:3,hair:false,wobble:.1});
  // The laurel crossed beneath the foot: two stems curving up the oval, a few leaves on each.
  for(const side of [-1,1]){
    // A stem from under the foot sweeping up the inside of the oval, laid as a quadratic, and four leaves
    // set along it turning outward.
    const x0=side*rx*.06,y0=ry*.8,x1=side*rx*.66,y1=ry*.12,qx=side*rx*.62,qy=ry*.78;
    g.save();g.strokeStyle=`rgba(${rgb},${alpha*.7})`;g.lineWidth=wt*.6;g.lineCap='round';
    g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(qx,qy,x1,y1);g.stroke();g.restore();
    for(let i=1;i<=4;i++){
      const t=i/5,u=1-t,lx=u*u*x0+2*u*t*qx+t*t*x1,ly=u*u*y0+2*u*t*qy+t*t*y1;
      const tx=2*u*(qx-x0)+2*t*(x1-qx),ty=2*u*(qy-y0)+2*t*(y1-qy),a=Math.atan2(ty,tx);
      g.fillStyle=`rgba(${rgb},${alpha*.55})`;g.beginPath();g.ellipse(lx+Math.cos(a-side*1.2)*w*.035,ly+Math.sin(a-side*1.2)*w*.035,Math.max(.7,w*.05),Math.max(.3,w*.02),a-side*.7,0,TAU);g.fill();
    }
  }
  // Stars pricked in the field above the sphere.
  const rng=seeded((seed^0x5f17)>>>0||1);
  for(let i=0;i<7;i++){
    const a=-Math.PI*.95+i/6*Math.PI*.9,d=rx*(.72+rng()*.08);
    g.fillStyle=`rgba(${rgb},${alpha*(.5+rng()*.3)})`;g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d*ry/rx*.9+sy*.3,Math.max(.4,w*.018),0,TAU);g.fill();
  }
  g.restore();
}
function drawPressDevice(cx,cy,h,rgb,alpha,seed){
  if(!(h>8)||!(alpha>0))return;
  const w=Math.round(h*.76),hh=Math.round(h),pad=2,key=[w,hh,rgb,seed,DPR].join('|');
  let c=pressDevices.get(key);
  if(!c){
    c=makeCanvas(Math.ceil((w+pad*2)*DPR),Math.ceil((hh+pad*2)*DPR));
    const g=c.getContext('2d');g.scale(DPR,DPR);g.translate(pad,pad);
    paintPressDevice(g,w,hh,rgb,1,seed);
    if(pressDevices.size>6)pressDevices.delete(pressDevices.keys().next().value);
    pressDevices.set(key,c);
  }
  ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(c,cx-w/2-pad,cy-hh/2-pad,w+pad*2,hh+pad*2);ctx.restore();
}
// ---------- The page turn's lifted corner ----------
// The next chapter's sheet is drawn up from under the frame (drawAtmosphere, celestial.js). A sheet lifted
// by a hand is never flat: its leading corner turns back on itself, shows its underside, and throws a
// short shadow on the face beneath, and the fold flattens as the sheet is laid down. `turn` runs 0 to 1
// over the turn; the corner is largest as the sheet first rises and gone by the time it lies.
function pageCurlSize(turn){return renaissanceAtlas()?Math.min(W*.2,64*scale)*Math.pow(clamp(1-turn,0,1),.9):0;}
// The rising sheet's clip, with the lifted corner cut out of it so the plate beneath shows there.
function pageTurnClip(slide,c){
  ctx.beginPath();
  if(!(c>1)){ctx.rect(0,slide,W,Math.max(0,H-slide));return;}
  ctx.moveTo(0,slide);ctx.lineTo(W-c,slide);ctx.lineTo(W,slide+c);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
}
// The turned-back flap itself: the corner reflected across the fold, lying on the sheet's face.
function drawPageCurl(slide,c){
  if(!(c>1)||slide>=H)return;
  const ax=W-c,ay=slide,bx=W,by=slide+c,tx=W-c,ty=slide+c,paper=onPaper();
  ctx.save();
  // The shadow the flap throws on the face below it, drawn with the flap and offset away from the fold.
  ctx.shadowColor=`rgba(${ink.atmosphere.sheetEdgeShade},${paper?.28:.5})`;ctx.shadowBlur=7*scale;ctx.shadowOffsetX=-2*scale;ctx.shadowOffsetY=2*scale;
  // The underside: the sheet's own stock, a shade lighter at the fold where it catches the light and
  // darker toward the tip that curls away from it.
  const grad=ctx.createLinearGradient((ax+bx)/2,(ay+by)/2,tx,ty);
  grad.addColorStop(0,`rgba(${ink.base.paperRgb},1)`);grad.addColorStop(.35,`rgba(${mixRgb(ink.base.paperRgb.split(',').map(Number),paper?[255,251,238]:[70,82,88],.35)},1)`);
  grad.addColorStop(1,`rgba(${mixRgb(ink.base.paperRgb.split(',').map(Number),paper?[150,120,84]:[4,8,14],.3)},1)`);
  ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(tx,ty);ctx.closePath();ctx.fill();
  ctx.shadowColor='transparent';
  // The fold, and the flap's two cut edges, in the frame's own hairline.
  ctx.strokeStyle=`rgba(${ink.base.inkStrong},${paper?.5:.4})`;ctx.lineWidth=Math.max(.6,scale*.8);
  ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(tx,ty);ctx.lineTo(bx,by);ctx.stroke();
  ctx.strokeStyle=`rgba(${ink.base.inkStrong},${paper?.22:.18})`;ctx.lineWidth=Math.max(.4,scale*.5);
  ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
  ctx.restore();
}
// ---------- Foxing that grows ----------
// A sheet kept in the hand is a sheet ageing in it. On the paper plate the rust spots and a tide mark
// spread with the time the run has spent on the chart, so a three-minute plate is visibly older at its
// end than at its start. The growth is taken in stages — first at thirty seconds, then once a minute,
// six at most — and each stage is baked once over the whole sheet, so a run re-paints this a handful of
// times and not once a frame. Seeded from the run's own seed, so the same run ages the same way.
let foxingLayer=null,foxingKey='';
const FOXING_STAGES=6;
function foxingStage(){return world&&world.state!=='ready'?Math.min(FOXING_STAGES,world.elapsed<30?0:1+Math.floor((world.elapsed-30)/60)):0;}
function drawFoxing(){
  if(!onPaper()||!renaissanceAtlas()||plainPlate()||!world)return;
  const stage=foxingStage();if(!stage)return;
  const key=[world.seed,stage,W,H,DPR,plateName].join('|');
  if(foxingKey!==key){
    const c=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(H*DPR))),g=c.getContext('2d');
    g.scale(DPR,DPR);
    const rng=seeded(((world.seed^0x6f0c55)>>>0)||1),spots=10+stage*9,k=stage/FOXING_STAGES;
    for(let i=0;i<spots;i++){
      // Each spot has its own place and the stage it first appears at; a spot already there grows with
      // every stage after its own, so the sheet reads as the same spots spreading, not a new scatter.
      const corner=rng()<.6,x=corner?(rng()<.5?rng()*W*.32:W-rng()*W*.32):rng()*W,y=corner?H*.55+rng()*H*.45:rng()*H;
      const born=Math.floor(i/9),grow=Math.max(0,stage-born),base=.7+rng()*rng()*3.2,r=base*(1+grow*.45),a=(.05+rng()*.07)*Math.min(1,grow*.6+.4);
      if(born>=stage)continue;
      const spot=g.createRadialGradient(x,y,0,x,y,r);
      spot.addColorStop(0,`rgba(128,80,36,${a*1.4})`);spot.addColorStop(.6,`rgba(140,92,46,${a*.7})`);spot.addColorStop(1,'rgba(140,92,46,0)');
      g.fillStyle=spot;g.fillRect(x-r,y-r,r*2,r*2);
    }
    // A tide mark creeping in from one corner: a pale interior and a darker deposited rim, widening with
    // each stage.
    const tx=rng()<.5?-W*.05:W*1.05,ty=H*(.2+rng()*.6),tr=Math.min(W,H)*(.12+.28*k);
    g.save();g.translate(tx,ty);g.scale(1,.8);
    const tide=g.createRadialGradient(0,0,0,0,0,tr);
    tide.addColorStop(0,'rgba(250,244,226,.05)');tide.addColorStop(.9,'rgba(240,228,200,.04)');tide.addColorStop(.97,`rgba(150,108,58,${.06+.08*k})`);tide.addColorStop(1,'rgba(150,108,58,0)');
    g.fillStyle=tide;g.beginPath();g.arc(0,0,tr,0,TAU);g.fill();g.restore();
    foxingLayer=c;foxingKey=key;
  }
  ctx.drawImage(foxingLayer,0,0,W,H);
}
