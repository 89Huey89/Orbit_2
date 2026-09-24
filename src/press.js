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
const PRESS_STRIKE=.08,PRESS_EMBOSS=.95,PRESS_BLOT=2.4;
let pressWorld=null,pressStrike=Infinity,pressEmboss=[];
function pressReset(){pressWorld=world;pressStrike=Infinity;pressEmboss=[];}
function pressEvent(type,e){
  if(typeof world==='undefined'||!world||!renaissanceAtlas())return;
  if(pressWorld!==world||type==='start')pressReset();
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
