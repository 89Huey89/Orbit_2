'use strict';
/* Orbit · src/rock.js
   Era I, The Rock: torchlit limestone, and every mark on it struck by a hand rather than printed. */
// This era is not a colourway of the atlas and it does not take the atlas's whole frame away either.
// It registers a hand — a small set of painters, named in `defineHand` below — and the pipeline in
// frame.js reaches for each of them by name where it would otherwise have drawn the atlas's own. What
// this file does not name, the atlas still draws, which is the difference between an era and a
// sandbox: two hands can work into one frame, and the next century is another row in that registry
// rather than another question asked at every mark.
//
// See docs/eras/01-rock.md for what the era is, and docs/eras/PROTOTYPES.md for what its readability
// spike proved. The spike is the porting source for the language on this sheet; none of its physics
// comes with it, because the simulation is and stays OrbitWorld.

// ---------- The pigments ----------
// The whole palette this era has, and it is short by two on purpose. There is no gold — the reddest
// ochre stands in, and is spent as sparingly as gold ever was — and there is no blue at all, so what
// the atlas says in blue this era says in its black. Charcoal and manganese are both here and are
// never mixed on one panel, exactly as a real one never mixes them: charcoal is the warmer line,
// manganese the cooler, and each panel is worked in one of them. The tooth stage below is the wall's
// own mineral speckle rather than a drawn line and is the one place both blacks sit side by side, the
// way a real face of limestone can carry both stains at once under a single figure worked in only one.
definePlate('rock',{
  night:{redOchre:'156,59,34',ochre:'201,150,46',ochreDeep:'169,112,31',manganese:'33,31,30',charcoal:'44,38,34',
    kaolin:'234,225,207',ember:'255,201,122',emberCore:'255,247,225',flare:'228,90,32',
    stone:'158,143,118',shaft:'4,3,3',dark:'2,2,2',
    ambient:'36,31,27',torchWarm:'206,176,140',torchFar:'150,126,100'},
  paper:{redOchre:'156,59,34',ochre:'201,150,46',ochreDeep:'169,112,31',manganese:'33,31,30',charcoal:'44,38,34',
    kaolin:'234,225,207',ember:'255,201,122',emberCore:'255,247,225',flare:'228,90,32',
    stone:'158,143,118',shaft:'4,3,3',dark:'2,2,2',
    ambient:'36,31,27',torchWarm:'206,176,140',torchFar:'150,126,100'}
});

// ---------- The tunable rows ----------
// The opening triad's reading, written down once so it can be read against the running page rather
// than buried in a conditional: the Moon for Tiro, a bright star for Adeptus, a faint star for
// Magister (01-rock.md; JOURNEY.md §9 leaves the choice itself open).
const ROCK_TRIAD={relaxed:'moon',classic:'bright',hardcore:'faint'};
// The two radii a naked eye sorts an ordinary body by, beside the triad above as the other tunable
// row. A difficultyChoice body skips this and takes ROCK_TRIAD's word for it instead.
const ROCK_TIER_BRIGHT=34,ROCK_TIER_MAJOR=46;
function rockTier(n){
  if(n.difficultyChoice)return ROCK_TRIAD[n.difficultyChoice];
  return n.r>=ROCK_TIER_MAJOR?'major':n.r>=ROCK_TIER_BRIGHT?'bright':'faint';
}
// Stage spans over the observation clock `d` (revealNode's own pen.d — see rockNode), copied from the
// spike: the hand-drawn edge, the wall's tooth coming up through the pigment, the accumulating dabs,
// and last the mark that says which body this is.
const ROCK_STAGE={edge:[.10,.46],tooth:[.26,.70],marks:[.34,.88],detail:[.70,1]};
const rockSpan=(t,r)=>clamp((t-r[0])/(r[1]-r[0]),0,1);

// ---------- The wall: three value-noise fields, baked once, tiled and lit by one torch ----------
// The field is baked at full resolution — every one of NW*NH cells reads its own honest interpolation
// of the lattice below it — because a wall upscaled from a coarser grid is a fog, not a rock face. The
// lattice is indexed modulo its own width and height, which is the whole reason the tile can be drawn
// twice at a scroll offset with no seam ever showing.
const ROCK_NW=960,ROCK_NH=900;
const rockSS=t=>t*t*(3-2*t);
// Which two lattice columns a pixel falls between, and how far, depends only on its x — so it is worked
// out once per octave across the row rather than once per pixel. That is eleven passes over most of a
// million pixels, and hoisting it is the difference between a wall that costs half a second to lay and
// one that costs a seventh of one.
const rockX0=new Int32Array(ROCK_NW),rockX1=new Int32Array(ROCK_NW),rockTX=new Float32Array(ROCK_NW);
function rockOctave(arr,cx,cy,amp,seed){
  const gw=ROCK_NW/cx,gh=ROCK_NH/cy,rnd=seeded(seed),lat=new Float32Array(gw*gh);
  for(let i=0;i<lat.length;i++)lat[i]=rnd();
  for(let x=0;x<ROCK_NW;x++){const fx=x/cx,ix=fx|0;rockTX[x]=rockSS(fx-ix);rockX0[x]=ix%gw;rockX1[x]=(ix+1)%gw;}
  for(let y=0;y<ROCK_NH;y++){
    const fy=y/cy,iy=fy|0,ty=rockSS(fy-iy),y0=(iy%gh)*gw,y1=((iy+1)%gh)*gw,row=y*ROCK_NW;
    for(let x=0;x<ROCK_NW;x++){
      const tx=rockTX[x],x0=rockX0[x],x1=rockX1[x];
      const t=lat[y0+x0]+(lat[y0+x1]-lat[y0+x0])*tx,b=lat[y1+x0]+(lat[y1+x1]-lat[y1+x0])*tx;
      arr[row+x]+=amp*(t+(b-t)*ty);
    }
  }
}
function rockBuild(specs){
  const a=new Float32Array(ROCK_NW*ROCK_NH);
  for(const o of specs)rockOctave(a,o[0],o[1],o[2],o[3]);
  let lo=1e9,hi=-1e9;for(let i=0;i<a.length;i++){if(a[i]<lo)lo=a[i];if(a[i]>hi)hi=a[i];}
  const k=1/(hi-lo||1);for(let i=0;i<a.length;i++)a[i]=(a[i]-lo)*k;
  return a;
}
// Baked lazily on first reach rather than at load, so a player who never opens this era never pays for
// it; invalidateRockArt() below drops it, and rockBakeWall() below rebuilds it once on next reach.
let rockWall=null;
function rockBakeWall(){
  if(rockWall)return rockWall;
  // Room-sized bulges down to a hand's breadth, then the calcite sheen stretched vertically for the
  // water that has run down this wall a long time, then the broad, slow iron staining underneath it all.
  const HF=rockBuild([[320,300,1,101],[192,180,.42,202],[120,100,.17,303],[64,60,.07,404],[24,20,.028,505],[12,10,.012,606]]);
  const CF=rockBuild([[192,900,1,707],[64,300,.45,808],[24,100,.2,909]]);
  const SF=rockBuild([[320,900,1,1010],[192,300,.4,1111]]);
  const c=makeCanvas(ROCK_NW,ROCK_NH),g=c.getContext('2d'),img=g.createImageData(ROCK_NW,ROCK_NH),d=img.data;
  const LX=-.62,LY=.60,stone=ink.rock.stone.split(',').map(Number);
  for(let y=0;y<ROCK_NH;y++){
    for(let x=0;x<ROCK_NW;x++){
      const i=y*ROCK_NW+x,xm=(x+ROCK_NW-1)%ROCK_NW,xp=(x+1)%ROCK_NW,ym=((y+ROCK_NH-1)%ROCK_NH)*ROCK_NW,yp=((y+1)%ROCK_NH)*ROCK_NW;
      const gx=(HF[y*ROCK_NW+xp]-HF[y*ROCK_NW+xm])*.5,gy=(HF[yp+x]-HF[ym+x])*.5;
      const tooth=(((x*73856093^y*19349663)>>>8)&255)/255-.5;
      const lam=clamp((-gx*LX-gy*LY)*46+.54+HF[i]*.30+tooth*.03,.06,1.28);
      const iron=SF[i],cal=CF[i];
      const r=(stone[0]+iron*44+cal*20)*lam,gc=(stone[1]+iron*20+cal*22)*lam,b=(stone[2]-iron*22+cal*26)*lam;
      const o=i*4;d[o]=Math.min(255,r);d[o+1]=Math.min(255,gc);d[o+2]=Math.min(255,b);d[o+3]=255;
    }
  }
  g.putImageData(img,0,0);rockWall=c;return rockWall;
}
// The torch's own reach, in view space rather than world space — a light left behind in world space
// would slide off the top of the sheet the instant the traveller climbed past it. Rebuilt whenever the
// viewport's own size changes; never rebuilt for a scroll.
let rockTorch=null,rockTorchKey='';
function rockBakeTorch(){
  const key=W+'x'+H;
  if(rockTorch&&rockTorchKey===key)return rockTorch;
  const c=makeCanvas(Math.max(1,Math.round(W)),Math.max(1,Math.round(H))),g=c.getContext('2d');
  g.fillStyle=`rgb(${ink.rock.ambient})`;g.fillRect(0,0,W,H);
  const tx=W*.44,ty=H*.70;
  g.globalCompositeOperation='lighter';
  const near=g.createRadialGradient(tx,ty,8,tx,ty,H*.86);
  near.addColorStop(0,`rgba(${ink.rock.emberCore},1)`);near.addColorStop(.46,`rgba(${ink.rock.torchWarm},.58)`);near.addColorStop(1,`rgba(${ink.rock.torchWarm},0)`);
  g.fillStyle=near;g.fillRect(0,0,W,H);
  const far=g.createRadialGradient(tx,ty,H*.42,tx,ty,H*1.6);
  far.addColorStop(0,`rgba(${ink.rock.torchFar},.42)`);far.addColorStop(1,`rgba(${ink.rock.torchFar},0)`);
  g.fillStyle=far;g.fillRect(0,0,W,H);
  rockTorch=c;rockTorchKey=key;return rockTorch;
}
// Multiplied over whatever is already on the canvas: full strength over the wall alone (drawn from
// rockAtmosphere, before a single mark is on it) and again at .42 over the whole composited frame
// (drawn from rockDark, the last of this era's own painters to run), so the wall takes the whole fall
// of the flame and the marks laid on it keep under half of that loss.
function rockTorchPass(strength){
  ctx.save();ctx.globalCompositeOperation='multiply';if(strength!==undefined)ctx.globalAlpha=strength;
  ctx.drawImage(rockBakeTorch(),0,0,W,H);ctx.restore();
}
function rockPaintWall(){
  rockBakeWall();
  // One baked sample to one device pixel, and every blit landing on a whole one. The wall's tooth is a
  // per-pixel term by construction — a hash at the mark scale, which is the scale the era's own risk
  // lives at, since red ochre survives on warm limestone by being regular against something that is not
  // — so drawing this tile at anything but its native resolution smears away exactly the detail it
  // exists to carry, and lands a wall that reads as a fog. The tile still scrolls at the world's own
  // rate: only how much wall a screen holds changes with the pixel ratio, never how fast it passes.
  const tileW=ROCK_NW/DPR,tileH=ROCK_NH/DPR,snap=v=>Math.round(v*DPR)/DPR;
  const off=((world.cameraY*scale)%tileH+tileH)%tileH;
  for(let x=0;x<W;x+=tileW)for(let y=-off;y<H;y+=tileH)ctx.drawImage(rockWall,snap(x),snap(y),tileW,tileH);
}

// ---------- The four primitives, each taking the context they draw into so a hazard's own bake can
// use them exactly as the live frame does ----------
// A dab: opacity ramps in from a seeded, slightly irregular silhouette; no direction, no leading edge.
// The silhouette and its three-stop gradient are baked once per (pigment, variant) into a small sprite
// and every dab after that is one drawImage scaled to the radius wanted, globalAlpha carrying the
// alpha — the spike's own dab rebuilt a gradient and a ten-point path on every call, which is this
// project's landmine L9, and is the single thing this port must not carry across.
const ROCK_DAB_VARIANTS=8,ROCK_DAB_R=28;
const rockDabSprites=new Map();
function rockDabSprite(rgb,variant){
  const key=rgb+':'+variant+':'+DPR.toFixed(2);
  const cached=rockDabSprites.get(key);if(cached)return cached;
  const pad=4,size=(ROCK_DAB_R+pad)*2,px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const rnd=seeded((0x9e3779b1+variant*0x1000193)>>>0);
  const gr=g.createRadialGradient(0,0,0,0,0,ROCK_DAB_R);
  gr.addColorStop(0,`rgba(${rgb},1)`);gr.addColorStop(.55,`rgba(${rgb},.72)`);gr.addColorStop(1,`rgba(${rgb},0)`);
  g.fillStyle=gr;g.beginPath();
  for(let i=0;i<=9;i++){
    const t=i/9*TAU,rr=ROCK_DAB_R*(.78+rnd()*.4),x=Math.cos(t)*rr,y=Math.sin(t)*rr;
    if(i)g.lineTo(x,y);else g.moveTo(x,y);
  }
  g.closePath();g.fill();
  const sprite={canvas:c,size};rockDabSprites.set(key,sprite);
  if(rockDabSprites.size>64)rockDabSprites.delete(rockDabSprites.keys().next().value);
  return sprite;
}
function rockDab(g,x,y,r,rgb,alpha,seed){
  if(alpha<=.003||r<=.05)return;
  const sprite=rockDabSprite(rgb,(seed>>>0)%ROCK_DAB_VARIANTS);
  g.globalAlpha=alpha;g.drawImage(sprite.canvas,x-r,y-r,r*2,r*2);
}
// A wash: the palm loaded and pressed again and again — never a flat fill, always a scatter of many
// small dabs so the mark keeps a hand's own unevenness.
function rockWash(g,x,y,r,rgb,alpha,n,seed){
  const rnd=seeded((seed>>>0)||3);
  for(let i=0;i<n;i++){
    const t=rnd()*TAU,dd=Math.sqrt(rnd());
    rockDab(g,x+Math.cos(t)*dd*r,y+Math.sin(t)*dd*r,r*(.18+rnd()*.22),rgb,alpha*(.5+.5*(1-dd)),i*7+seed);
  }
}
// A flint scratch: fresh pale stone in the groove, a dark shadow thrown to one side — never a clean
// ruled line, because nothing this era cut was ruled.
function rockScratch(g,x0,y0,x1,y1,w,alpha,dash){
  g.save();g.lineCap='round';g.setLineDash(dash?[w*2.4,w*3]:[]);
  g.strokeStyle=`rgba(${ink.rock.charcoal},${alpha*.55})`;g.lineWidth=w*1.5;
  g.beginPath();g.moveTo(x0+1,y0+1.3);g.lineTo(x1+1,y1+1.3);g.stroke();
  g.strokeStyle=`rgba(${ink.rock.kaolin},${alpha*.62})`;g.lineWidth=w*.72;
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
  g.restore();
}
// A pecked hollow: stone struck with stone, a rim thrown up bright around a dark pit.
function rockPeck(g,x,y,r,alpha){
  g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle=`rgba(${ink.rock.manganese},${alpha*.85})`;g.fill();
  g.beginPath();g.arc(x-r*.32,y-r*.32,r*.62,0,TAU);g.fillStyle=`rgba(${ink.rock.kaolin},${alpha*.4})`;g.fill();
}

// ---------- A hand-walked edge, cached by shape rather than rebuilt by point ----------
// The radius breathes on a slow harmonic with noise over it, laid through the midpoints so it reads as
// a wavering line rather than a polygon — seeded off the body, so it is the same edge every frame. The
// spike rebuilt the 26-point walk on every call, twice per visible body per frame; here the walk's own
// per-angle multipliers are cached once per seed and the draw call is pure trigonometry over that
// lookup, so nothing is allocated on the hot path at all.
const rockEdgeShapes=new Map();
function rockEdgeShape(seed){
  const key=seed>>>0;
  let k=rockEdgeShapes.get(key);if(k)return k;
  const rnd=seeded(key||5),ph=rnd()*TAU,steps=26;
  k=new Float32Array(steps);
  for(let i=0;i<steps;i++){const a=i/steps*TAU;k[i]=1+Math.sin(a*2+ph)*.10+Math.sin(a*5-ph)*.06+(rnd()-.5)*.15;}
  rockEdgeShapes.set(key,k);
  if(rockEdgeShapes.size>240)rockEdgeShapes.delete(rockEdgeShapes.keys().next().value);
  return k;
}
function rockEdgePath(g,x,y,r,seed){
  const k=rockEdgeShape(seed),steps=k.length;
  // Point 0 sits at angle 0 (cos=1, sin=0), so it is just (x+r*k[0], y); no need to call either
  // trig function for it. Point[steps-1] is still needed once, to open the path at their midpoint.
  const a=(steps-1)/steps*TAU,lx=x+Math.cos(a)*r*k[steps-1],ly=y+Math.sin(a)*r*k[steps-1]*.95;
  let cx=x+r*k[0],cy=y;
  g.beginPath();g.moveTo((lx+cx)/2,(ly+cy)/2);
  for(let i=0;i<steps;i++){
    const j=(i+1)%steps,aj=j/steps*TAU,jx=x+Math.cos(aj)*r*k[j],jy=y+Math.sin(aj)*r*k[j]*.95;
    g.quadraticCurveTo(cx,cy,(cx+jx)/2,(cy+jy)/2);
    cx=jx;cy=jy;
  }
  g.closePath();
}

// ---------- The body: what has been learned, staged over the observation clock alone ----------
function rockCore(r,tier){return r*(tier==='moon'?.94:tier==='faint'?.6:.72);}
function rockTone(tier){return tier==='moon'?ink.rock.kaolin:tier==='faint'?ink.rock.ochre:ink.rock.redOchre;}
// `taken` is revealNode's own pen.taken — 0 until the body has ever been orbited, then a fast fade to 1
// — except a difficultyChoice body, which the design already draws whole before it is observed (see
// reveal.js's own comment on pen.d): the choice has to read before any caption could, on a sheet that
// has none, so its taken-ness is never gated at all.
function rockBody(n,x,y,r,tier,d,taken){
  if(taken<=0)return;
  const core=rockCore(r,tier),tone=rockTone(tier),moon=tier==='moon',bright=tier==='bright'||tier==='major';
  // Colour before contour: the crude mass a hand lays down at the capture itself, ungated by d.
  rockWash(ctx,x,y,core*1.06,tone,(moon?.17:.58)*taken,moon?18:12,n.seed+91);
  const edge=rockSpan(d,ROCK_STAGE.edge),tooth=rockSpan(d,ROCK_STAGE.tooth),marks=rockSpan(d,ROCK_STAGE.marks),detail=rockSpan(d,ROCK_STAGE.detail);
  if(marks>0){
    // Not a bigger dab: the same seeded scatter carried further, since raising n only ever adds.
    const base=moon?58:tier==='major'?46:bright?40:22;
    rockWash(ctx,x,y,core,tone,(moon?.15:.5)*Math.min(1,.35+marks)*taken,Math.round(base*marks),n.seed);
  }
  if(tooth>0){
    // The wall's own mineral speckle coming up through the pigment as it is worked — not a drawn line,
    // which is why both blacks sit in it together (see the palette note above).
    ctx.save();rockEdgePath(ctx,x,y,core,n.seed^0x51ed);ctx.clip();
    const rnd=seeded((n.seed^0x2ba9)>>>0||7),count=moon?26:40;
    for(let i=0;i<count;i++){
      const a=rnd()*TAU,rr=Math.sqrt(rnd())*core;
      rockDab(ctx,x+Math.cos(a)*rr,y+Math.sin(a)*rr,(.7+rnd()*1.4)*scale,rnd()<.4?ink.rock.charcoal:ink.rock.manganese,(.05+rnd()*.12)*tooth*taken,n.seed+i+30);
    }
    ctx.restore();
  }
  if(edge>0){
    ctx.save();rockEdgePath(ctx,x,y,core*1.03,n.seed^0x51ed);
    ctx.strokeStyle=`rgba(${moon?ink.rock.manganese:ink.rock.charcoal},${.3*edge*taken})`;ctx.lineWidth=(.9+.9*edge)*scale;ctx.stroke();ctx.restore();
  }
  // What the body is, rather than that it is: the last thing the orbit pays for.
  if(detail>0){
    if(moon){
      for(let i=0;i<7;i++){const rnd=seeded(n.seed+i*13);
        rockDab(ctx,x+(rnd()*2-1)*core*.5,y+(rnd()*2-1)*core*.5,(5+rnd()*5)*(.45+.55*detail)*scale,ink.rock.manganese,.8*detail*taken,n.seed+i);}
    }else if(bright){
      for(let i=0;i<7;i++){const a=i/7*TAU+n.seed,rr=core*1.24;
        rockDab(ctx,x+Math.cos(a)*rr,y+Math.sin(a)*rr,(3.2+1.6*detail)*scale,ink.rock.manganese,.7*detail*taken,n.seed+i+7);}
    }else rockDab(ctx,x,y,3.2*scale,ink.rock.manganese,.55*detail*taken,n.seed+3);
  }
}
function rockPhenomenon(n,x,y,r){
  const pulse=.28+.14*(reducedMotion?0:Math.sin(world.time/.6+n.seed));
  rockDab(ctx,x,y,r*.52,ink.rock.ochre,pulse*1.05,n.seed);
}

// ---------- The ring: where an observation is possible, structurally unchanged while it is made ----------
// 28 dabs at the node's own capture radius, never staged wider or narrower and never re-seeded, so the
// same 28 dots sit in the same 28 places every frame; only a caller-supplied state scales their size
// and alpha uniformly. The one exception is the completion cue below, a single brief change of state.
const ROCK_RING_N=28,ROCK_FLOURISH_DUR=.64;
// Stamped by rockFlourish (this era's `flourish` painter) on the crossing into a full observation, kept
// on this side rather than on the simulation node; read here and pruned by age once the map grows past
// a small bound, so a run that finishes many bodies never grows this without limit.
const rockFlourishAt=new Map();
function rockFlourish(n){
  rockFlourishAt.set(n,world.time);
  if(rockFlourishAt.size>40)for(const [key,at] of rockFlourishAt)if(world.time-at>ROCK_FLOURISH_DUR)rockFlourishAt.delete(key);
}
function rockRing(n,x,y,cap,state){
  for(let i=0;i<ROCK_RING_N;i++){
    const a=i/ROCK_RING_N*TAU;
    rockDab(ctx,x+Math.cos(a)*cap,y+Math.sin(a)*cap,3.2*Math.max(.55,state)*scale,ink.rock.redOchre,.5*state,n.seed+i);
  }
  const at=rockFlourishAt.get(n);if(at===undefined)return;
  const seal=clamp(1-(world.time-at)/ROCK_FLOURISH_DUR,0,1);if(seal<=0)return;
  const glow=seal*seal;
  // The 28 dots drawing together into one struck line, and a little dust lifting off it, for 640ms.
  ctx.save();ctx.strokeStyle=`rgba(${ink.rock.kaolin},${.42*glow})`;ctx.lineWidth=(1.3+2.4*glow)*scale;
  ctx.beginPath();ctx.arc(x,y,cap,0,TAU);ctx.stroke();ctx.restore();
  for(let i=0;i<10;i++){
    const a=i/10*TAU+n.seed,lift=cap+(6+(1-seal)*16)*scale;
    rockDab(ctx,x+Math.cos(a)*lift,y+Math.sin(a)*lift,2.6*glow*scale,ink.rock.kaolin,.4*glow,n.seed+i+500);
  }
}

// ---------- The release marks: the same information the atlas draws, in this era's own hand ----------
// A hand does not react to an instant, it arrives at a mark it can already see. Geometry only, taken
// from the shipped code exactly as drawNode reads it — releaseTargets, orbitTangents, segmentCircle
// and the real p.rad — not from the spike's own 144-sample sweep and hazard test.
function rockReleaseMarks(n,p,x,y){
  const rad=p.rad*scale;
  ctx.save();ctx.translate(x,y);
  for(const next of releaseTargets(n)){
    const dist=Math.hypot(next.x-n.x,next.y-n.y);
    const a=Math.atan2(next.y-n.y,next.x-n.x)-p.dir*Math.acos(clamp(p.rad/dist,-1,1));
    const window=Math.asin(clamp(next.cap/dist,0,.8));
    // A row of pressed ochre dabs along the arc that connects.
    const ROWS=6;
    for(let i=0;i<=ROWS;i++){
      const wa=a-window+2*window*(i/ROWS);
      rockDab(ctx,Math.cos(wa)*rad,Math.sin(wa)*rad,2.2*scale,ink.rock.ochre,.5,n.seed+i*17+3);
    }
    // One struck deeper — kaolin over manganese — at the middle of each run that actually threads clear
    // of every hazard; a run with none is left with only the row above, so danger reads as an absence.
    for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
      if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
      const mx=Math.cos(path.angle)*rad,my=Math.sin(path.angle)*rad;
      rockDab(ctx,mx,my,4.6*scale,ink.rock.manganese,.7,n.seed+900);
      rockDab(ctx,mx,my,3*scale,ink.rock.kaolin,.85,n.seed+901);
    }
  }
  ctx.restore();
}

// ---------- The node: ring, body or phenomenon, and the release marks while it is held ----------
function rockNode(n,aim){
  const pen=revealNode(n);if(pen.t<=0)return;
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=!!(aim&&aim.n.id===n.id);
  const x=sx(n.x),y=sy(n.y),cap=n.cap*scale,bodyR=n.r*scale;
  if(y<-cap*2-60||y>H+cap*2+60)return;
  const tier=rockTier(n);
  const state=active?1:target?1:used?.24:.6;
  ctx.save();
  rockRing(n,x,y,cap,state);
  if(n.difficultyChoice||pen.taken>0)rockBody(n,x,y,bodyR,tier,pen.d,n.difficultyChoice?1:pen.taken);
  else rockPhenomenon(n,x,y,bodyR);
  if(active)rockReleaseMarks(n,p,x,y);
  ctx.restore();
}

// ---------- The hazards ----------
// The Shaft: a true black void with a pecked rim. The eye is drawn down into it; it is not a whirlpool,
// so nothing here turns — only the gradient's own reach and the ten pecks ringing the core.
const rockShaftSprites=new Map();
function rockShaftSprite(reach,core){
  const rB=Math.max(2,Math.round(reach)),cB=Math.max(1,Math.round(core)),key=rB+':'+cB+':'+DPR.toFixed(2);
  const cached=rockShaftSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil(rB*2.1)),px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const gr=g.createRadialGradient(0,0,2,0,0,rB);
  gr.addColorStop(0,`rgba(${ink.rock.shaft},.95)`);gr.addColorStop(.45,`rgba(${ink.rock.shaft},.7)`);gr.addColorStop(1,`rgba(${ink.rock.shaft},0)`);
  g.fillStyle=gr;g.beginPath();g.arc(0,0,rB,0,TAU);g.fill();
  g.fillStyle=`rgb(${ink.rock.shaft})`;g.beginPath();g.arc(0,0,cB,0,TAU);g.fill();
  const sprite={canvas:c,size};rockShaftSprites.set(key,sprite);
  if(rockShaftSprites.size>16)rockShaftSprites.delete(rockShaftSprites.keys().next().value);
  return sprite;
}
function rockShaft(h,x,y){
  const reach=gravityRadius(h)*scale,core=hazardCore(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const sprite=rockShaftSprite(reach,core);
  ctx.drawImage(sprite.canvas,x-sprite.size/2,y-sprite.size/2,sprite.size,sprite.size);
  for(let i=0;i<10;i++){const a=(h.phase||0)+i/10*TAU;rockPeck(ctx,x+Math.cos(a)*core*1.15,y+Math.sin(a)*core*1.15,3.4*scale,.85);}
}
// The Flare: an ember-red core under soot, breathing gently, deliberately not the traveller's own warm
// glow — an early pass of the spike let the two share one and they read as the same thing at a glance.
// Sixteen sooty manganese dabs orbit outside the glow rather than inside it.
const rockFlareSprites=new Map();
function rockFlareGlowSprite(core){
  const cB=Math.max(1,Math.round(core)),key=cB+':'+DPR.toFixed(2);
  const cached=rockFlareSprites.get(key);if(cached)return cached;
  const reach=cB*1.15,size=Math.max(4,Math.ceil(reach*2.3)),px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const gr=g.createRadialGradient(0,0,0,0,0,reach);
  gr.addColorStop(0,`rgba(${ink.rock.flare},.9)`);gr.addColorStop(.55,`rgba(${ink.rock.redOchre},.45)`);gr.addColorStop(1,`rgba(${ink.rock.redOchre},0)`);
  g.fillStyle=gr;g.beginPath();g.arc(0,0,reach,0,TAU);g.fill();
  const sprite={canvas:c,size};rockFlareSprites.set(key,sprite);
  if(rockFlareSprites.size>16)rockFlareSprites.delete(rockFlareSprites.keys().next().value);
  return sprite;
}
function rockFlare(h,x,y){
  const core=hazardCore(h)*scale,reach=gravityRadius(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const t=reducedMotion?0:world.time,breathe=1+(reducedMotion?0:Math.sin(t*7+(h.phase||0))*.03);
  const sprite=rockFlareGlowSprite(core),bs=sprite.size*breathe;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(sprite.canvas,x-bs/2,y-bs/2,bs,bs);ctx.restore();
  for(let i=0;i<16;i++){
    const a=i/16*TAU,dd=core*1.35+(reducedMotion?0:Math.sin(t*4+i)*3*scale);
    rockDab(ctx,x+Math.cos(a)*dd,y+Math.sin(a)*dd,(7+(i*7)%5)*scale,ink.rock.manganese,.5,h.seed+i);
  }
}
// The Draught: a streaked charcoal smear dragged sideways, a torch-flame bent by real cave airflow.
// Baked once per hazard along local +x and rotated live to h.dir, so nothing about its own shape is
// rebuilt from one frame to the next.
const rockDraughtSprites=new Map();
function rockDraughtSprite(seed,reach){
  const rB=Math.max(2,Math.round(reach)),key=(seed>>>0)+':'+rB+':'+DPR.toFixed(2);
  const cached=rockDraughtSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil(rB*2.2)),px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const rnd=seeded((seed>>>0)||1);
  for(let i=0;i<8;i++){
    const lane=(i/7-.5)*rB*1.1,len=rB*(.5+rnd()*.55),jog=(rnd()*2-1)*rB*.08;
    rockScratch(g,-len*.5,lane,len*.5,lane+jog,1.3+rnd()*1.4,.6+rnd()*.25,false);
  }
  const sprite={canvas:c,size};rockDraughtSprites.set(key,sprite);
  if(rockDraughtSprites.size>16)rockDraughtSprites.delete(rockDraughtSprites.keys().next().value);
  return sprite;
}
function rockDraught(h,x,y){
  const reach=gravityRadius(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const sprite=rockDraughtSprite(h.seed,reach);
  ctx.save();ctx.translate(x,y);ctx.rotate(h.dir||0);
  ctx.drawImage(sprite.canvas,-sprite.size/2,-sprite.size/2,sprite.size,sprite.size);
  ctx.restore();
}
// Unlit rock: the one hazard this era depicts with total fidelity. Nothing drawn at all.
function rockHazard(h){
  if(h.kind==='nebula')return;
  const x=sx(h.x),y=sy(h.y);
  if(h.kind==='wind')return rockDraught(h,x,y);
  if(h.kind==='flare')return rockFlare(h,x,y);
  return rockShaft(h,x,y);
}

// ---------- The traveller: not the crayon, the point on it actually touching the wall ----------
// A lump of ground haematite worked to a blunt contact point, held point-first — no vane, no
// aerodynamic taper, because nothing about mined stone needs to look like it is flying. Baked once,
// since it is one tool rather than a body keyed by seed, and rotated live to the heading of travel.
let rockCrayon=null,rockCrayonKey='';
function rockCrayonSprite(){
  const key=DPR.toFixed(2);if(rockCrayon&&rockCrayonKey===key)return rockCrayon;
  const rx=17,ry=9,pad=6,size=(rx+pad)*2,px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  // A closed, wavering silhouette exactly like a body's own edge, but elongated and squashed toward
  // local +x — the direction of travel — into the one blunt working point, baked once since this is
  // one tool rather than a body keyed by seed. Building the point array here costs nothing: the whole
  // function only ever runs again if the pixel ratio changes.
  const rnd=seeded(4051),steps=14,pts=[];
  for(let i=0;i<steps;i++){
    const a=i/steps*TAU,taper=1-Math.max(0,Math.cos(a))*.72,jit=1+(rnd()-.5)*.22;
    pts.push([Math.cos(a)*rx*taper*jit,Math.sin(a)*ry*taper*jit]);
  }
  const f=pts[0],l=pts[steps-1];
  g.beginPath();g.moveTo((f[0]+l[0])/2,(f[1]+l[1])/2);
  for(let i=0;i<steps;i++){const a=pts[i],b=pts[(i+1)%steps];g.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}
  g.closePath();
  g.fillStyle=`rgba(${ink.rock.ochreDeep},1)`;g.fill();
  g.strokeStyle=`rgba(${ink.rock.charcoal},.5)`;g.lineWidth=1;g.stroke();
  const sprite={canvas:c,size};rockCrayon=sprite;rockCrayonKey=key;return sprite;
}
// The Observer Core: the one small bright spot on the whole tool, and the only pure light on the
// sheet. Baked once — one traveller, one point — and blended in additively wherever it sits.
let rockCoreArt=null,rockCoreKey='';
function rockCoreSprite(){
  const key=DPR.toFixed(2);if(rockCoreArt&&rockCoreKey===key)return rockCoreArt;
  const R=64,size=R*2,px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(R,R);
  g.globalCompositeOperation='lighter';
  const halo=g.createRadialGradient(0,0,0,0,0,R);
  halo.addColorStop(0,`rgba(${ink.rock.ember},.16)`);halo.addColorStop(1,`rgba(${ink.rock.ember},0)`);
  g.fillStyle=halo;g.beginPath();g.arc(0,0,R,0,TAU);g.fill();
  const core=g.createRadialGradient(0,0,0,0,0,R*.13);
  core.addColorStop(0,`rgba(${ink.rock.emberCore},1)`);core.addColorStop(.4,`rgba(${ink.rock.ember},.9)`);core.addColorStop(1,`rgba(${ink.rock.ember},0)`);
  g.fillStyle=core;g.beginPath();g.arc(0,0,R*.13,0,TAU);g.fill();
  rockCoreArt={canvas:c,size,R};rockCoreKey=key;return rockCoreArt;
}
function rockPlayer(){
  if(world.state==='dead')return;
  const p=world.player,x=sx(p.x),y=sy(p.y),ang=Math.atan2(p.vy,p.vx);
  ctx.save();
  // A short trail of fading ember dabs, sampled off the same shared trail every other era's own
  // traveller mark rides, so the era's tail keeps whatever cadence the rest of the chart already keeps.
  for(let i=0;i<trail.length;i++){
    const s=trail[i],age=world.time-s.time,life=clamp(1-age/TRAIL_LIFE,0,1);if(life<=0)continue;
    rockDab(ctx,sx(s.x),sy(s.y),(1.6+2*life)*scale,ink.rock.ember,.35*life,i+7);
  }
  // Everything from here in is one rigid tool: translate to the travelling point, face the heading of
  // travel, and scale by the chart's own scale exactly as every other mark on it does.
  ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);
  const crayon=rockCrayonSprite();
  ctx.drawImage(crayon.canvas,-crayon.size*.72,-crayon.size*.5,crayon.size,crayon.size);
  const core=rockCoreSprite();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(core.canvas,-core.R,-core.R,core.size,core.size);ctx.restore();
  // A shielded run carries the charge visibly, in the one colour this era spends on rarity: kaolin.
  if(p.shielded){ctx.strokeStyle=`rgba(${ink.rock.kaolin},.55)`;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.stroke();}
  ctx.restore();
}

// ---------- The forgetting: two failures, not one, read as one broken-edged loss ----------
// The pigment's own film lets go or is sealed under a calcite skin that later spalls, and the engraved
// line fails by the limestone itself exfoliating — a complete loss of the support rather than a fading
// film. Read together here as a hard, sharp-lipped spall margin with small chips drifting free, rather
// than the atlas's soft wash. The boundary's own position, rate and grace are untouched: read straight
// off the same world state drawDark reads, so nothing about where the edge is ever moves.
const rockChipRng=seeded(50221);
const ROCK_CHIP_N=22;
const rockChips=Array.from({length:ROCK_CHIP_N},()=>({x:rockChipRng(),phase:rockChipRng(),speed:.4+rockChipRng()*.5,size:.8+rockChipRng()*1.6,drift:rockChipRng()*TAU}));
let rockDarkEdge=null,rockDarkEdgeW=-1,rockDarkStep=0;
function rockEnsureDarkEdge(){
  const wB=Math.round(W/8)*8;
  if(rockDarkEdge&&rockDarkEdgeW===wB)return;
  const step=Math.max(1,26*scale),n=Math.max(8,Math.ceil(W/step)+3);
  const rnd=seeded(9001),pts=new Float32Array(n);
  for(let i=0;i<n;i++)pts[i]=rnd()*2-1;
  rockDarkEdge=pts;rockDarkEdgeW=wB;rockDarkStep=step;
}
function rockDark(dt){
  const fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);
  if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  rockTorchPass(.42);
  rockEnsureDarkEdge();
  const time=reducedMotion?0:world.time,lip=3*scale;
  ctx.save();
  ctx.fillStyle=`rgba(${ink.rock.dark},.94)`;
  ctx.beginPath();ctx.moveTo(-10,fy+rockDarkEdge[0]*16*scale);
  for(let i=0;i<rockDarkEdge.length;i++)ctx.lineTo(-40*scale+i*rockDarkStep,fy+rockDarkEdge[i]*16*scale);
  ctx.lineTo(W+10,H+10);ctx.lineTo(-10,H+10);ctx.closePath();ctx.fill();
  ctx.strokeStyle=`rgba(${ink.rock.charcoal},${.55+near*.2})`;ctx.lineWidth=Math.max(1,4*scale);ctx.stroke();
  ctx.strokeStyle=`rgba(${ink.rock.kaolin},${.28+near*.18})`;ctx.lineWidth=Math.max(.7,1.3*scale);
  ctx.beginPath();ctx.moveTo(-10,fy+rockDarkEdge[0]*16*scale-lip);
  for(let i=0;i<rockDarkEdge.length;i++)ctx.lineTo(-40*scale+i*rockDarkStep,fy+rockDarkEdge[i]*16*scale-lip);
  ctx.stroke();
  for(const chip of rockChips){
    const phase=(chip.phase+time*chip.speed)%1,cx=chip.x*W+Math.sin(time*.3+chip.drift)*3*scale,cy=fy-(2+phase*22)*scale;
    if(cy<-10||cy>H+10)continue;
    rockDab(ctx,cx,cy,chip.size*scale*(1-phase*.4),ink.rock.charcoal,(1-phase)*.4*(.6+near*.4),Math.floor(chip.x*1000)+1);
  }
  ctx.restore();
}

// ---------- The frame, the laid paper: nothing surrounds this sky ----------
// No border, cartouche, colophon or maker's mark — a figure's edge is wherever rock or torchlight
// stops, and there are no laid wires on a cave wall. Registered as no-ops so the intent is stated
// rather than inferred from an absence.
function rockPlateFrame(){}
function rockLaid(){}
// Two more the atlas draws that this wall has no word for, and neither is a matter of taste. It draws a
// constellation as an engraved figure — a lyre, a ship, a pair of dividers — where this era draws
// animals and never constellation-figures at all; the route through the chart's stars is a separate
// mark and is still drawn, so nothing a transfer depends on is withheld. And it surveys a landing as a
// geometer's construction, lettered a-b-c with the arrival angle set in figures beside it, on a sheet
// with no script and no geometry to letter one in. The cluster this era does have for a constellation
// — six dots over a bull's shoulder, three of them ringed, kept exactly as ambiguous as the reading
// that licenses it — is not drawn yet.
function rockFigure(){}
function rockSurveys(){}
// And three fixtures of the printed sheet that a wall simply does not have: the leaf of ground the
// atlas lays under its running numbers, the plate's number and name engraved at the foot, and the
// chapter title written across the sheet as a new plate opens. A cave has no foot and no title page,
// the chamber it names is announced in the live region instead, and a soft patch of paper laid under
// the HUD reads on lit limestone as exactly what it is — a patch of paper. The counts themselves are
// still owed the player and are still set, in the modern hand this era admits to; what is dropped is
// the furniture that would have carried them on a sheet.
function rockHudLeaf(){}
function rockRunningHead(){}
function rockChapterReveal(){}

// ---------- The ground: the wall, lit by one torch, and nothing else behind the marks ----------
function rockAtmosphere(){
  plateShift.x=0;plateShift.y=0;
  rockPaintWall();
  rockTorchPass();
}

defineHand('rock',{
  atmosphere:rockAtmosphere,
  node:rockNode,
  hazard:rockHazard,
  player:rockPlayer,
  dark:rockDark,
  plateFrame:rockPlateFrame,
  laid:rockLaid,
  figure:rockFigure,
  surveys:rockSurveys,
  hudLeaf:rockHudLeaf,
  runningHead:rockRunningHead,
  chapterReveal:rockChapterReveal,
  flourish:rockFlourish
});

// ---------- The vocabulary: only what this era actually calls differently ----------
// Currency needs no renaming (ochre already), and the title is deliberately left untranslated — this
// era does not get its own frontispiece. Score is the tally, chapter is the chamber, and best is how
// deep the torch carried you (01-rock.md's Names table); the four chambers are its own signature sheet
// and the later panels its own enrichment adds, in that order. The daily plate is deliberately not
// attempted, and is not touched here at all — it is already hidden by data-era's own CSS rule.
defineVoice('rock',{
  chartNoun:'cluster',
  chartSaid:'{chart} closes. Sixty toward the tally. The dark retreats for four seconds.',
  chapters:['THE HALL OF THE BULLS','THE SHAFT SCENE','THE PANEL OF HAND DOTS','NEWGRANGE'],
  chapterSaid:'Chamber {numeral}. {name}.',
  ended:'The torch gutters. Tally {score}. Deepest {best}. Strike again.',
  chrome:{bestLabel:'Deepest'}
});

// ---------- Invalidation ----------
// Drops every baked tile and sprite cache this file owns; invalidateArt() calls this alongside its own
// when the plate or the pixel ratio changes, so the next reach simply rebuilds lazily as it always did.
function invalidateRockArt(){
  rockWall=null;
  rockTorch=null;rockTorchKey='';
  rockDabSprites.clear();
  rockEdgeShapes.clear();
  rockShaftSprites.clear();rockFlareSprites.clear();rockDraughtSprites.clear();
  rockCrayon=null;rockCrayonKey='';
  rockCoreArt=null;rockCoreKey='';
  rockDarkEdge=null;rockDarkEdgeW=-1;
}
