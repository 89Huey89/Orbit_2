'use strict';
/* Orbit · src/figures.js
   Constellation figures, nodes, gravitational lenses, hazards, and the aim guide. */
// ---------- Constellation figures: the plate each fork route is engraved for ----------
// Behind the three stars of a fork, draw the figure the route is named for — every entry in the
// twelve-figure catalogue has its own engraving — as Hevelius or Bayer would cut it: broken ink contours and stipple that are
// always present once the frame is on the page, fine hatching that fills in as each star is captured,
// and hand-colour that arrives in broken passes as the figure is documented. An expired chart fades to
// hairlines. The figure is baked once per (chart, plate, side, scale) into an offscreen layer and blitted
// per frame.
definePlate('figures',{
  night:{contour:'222,190,127',hatch:'222,190,127',wash:'148,180,177'},
  paper:{contour:'150,100,32',hatch:'58,42,28',wash:'166,58,40'}
});
// The printed Renaissance atlas treats a constellation star as a point of light, not a miniature world.
// The thresholds are deliberately tied to the same two-thirds orbit used by the observer core: a normal
// classification arrives after roughly 160 degrees, while an occasional faint and uncertain point needs
// almost the whole observation before the quill will commit a Greek letter to the plate.
const RENAISSANCE_STAR_CLASSIFIED=.68,RENAISSANCE_STAR_CERTAIN=.94;
function renaissanceStarObservation(n){
  const p=world&&world.player;
  return clamp(p&&p.node===n?p.orbitSweep/SWEEP_FULL:n.documented||0,0,1);
}
function renaissanceStarClassified(n,observation){
  if(!n||n.magnitude===undefined)return false;
  return observation>=(n.uncertain?RENAISSANCE_STAR_CERTAIN:RENAISSANCE_STAR_CLASSIFIED);
}
function renaissanceLegendMask(){
  if(!renaissanceAtlas()||!world)return 0;
  let mask=0;
  for(const chart of world.constellations)for(const star of chart.stars){
    if(renaissanceStarClassified(star,renaissanceStarObservation(star)))mask|=1<<(star.magnitude-1);
  }
  return mask;
}
// Six distinct point sizes carry the six traditional classes. Only the upper two classes grow into
// multi-ray printer's signs; classes V and VI stay as the small pricks a naked-eye atlas can honestly set.
const RENAISSANCE_STAR_RADII=[3.2,4.4,5.8,7.6,9.8,13];
// How far the whole sign actually reaches from its own centre, in the same units the radii are given in:
// the outer class circle where the class has one, the longest spoke where it does not, the punch alone
// for the two classes that are nothing but a punch. Anything set beside a star measures itself off this,
// so a first-magnitude sign and a sixth-magnitude prick are each given exactly the room they take.
function renaissanceStarSpan(magnitude){
  const index=clamp(6-(magnitude||6),0,5);
  return RENAISSANCE_STAR_RADII[index]*(index>=4?1.76:index===3?1.5:index===2?1.36:.62);
}
function renaissanceStarGlyph(g,cx,cy,magnitude,rgb,alpha,size,seed=0){
  // Sized for the phone the plate is actually read on (see "Viewport" in README.md), not for the desk.
  // `size` is the responsive `scale`, which sits at about .98 on the target sheet, so these radii are
  // very nearly the printed millimetres: the atlas's original .7-3.9 ramp put four of the six classes
  // under two pixels across, a hair inside a forty-eight-pixel orbit, and the commonest of them printed
  // as nothing at all on paper. The six-class hierarchy is unchanged; only the gauge of the punch is,
  // and every class is now a mark the eye can find without hunting for it.
  const index=clamp(6-(magnitude||6),0,5),radius=RENAISSANCE_STAR_RADII[index]*size;
  g.save();g.lineCap='round';
  // Classes V and VI have no spokes at all, so the punch is the whole of the sign and is set proportionally
  // deeper; from class IV up the point is only the centre of a figure the rays finish.
  const core=Math.max(1.1,radius*(index>=2?.46:.62));
  // On the pale sheet the ochre a catalogued star is set in has little to read against at this size, so the
  // punch is bedded on a fine dark ring first, the way the gilder cuts his line before the leaf goes in.
  if(onPaper()){g.fillStyle=`rgba(${ink.base.ink},${.36*alpha})`;g.beginPath();g.arc(cx,cy,core*1.3,0,TAU);g.fill();}
  g.fillStyle=`rgba(${rgb},${alpha})`;g.beginPath();g.arc(cx,cy,core,0,TAU);g.fill();
  if(index>=2){
    const rays=index>=5?8:index>=4?6:4,rng=seeded((seed^0x51f3a91d)>>>0||1);
    // A larger sign wants a heavier burin under it, or the spokes read as scratches beside their own
    // point: the cut thickens by class the way an engraver changes tools rather than only pressure.
    const weight=Math.max(.45,(.42+index*.07)*size),rayAlpha=alpha*(index>=4?.85:.7);
    for(let i=0;i<rays;i++){
      const a=i*TAU/rays-Math.PI/2,jitter=(rng()-.5)*.06;
      // Only the brightest class alternates long primary spokes with short secondary ticks, cut the
      // way a printer's radiant star is engraved, rather than a spider of equal-length legs; every
      // ray is laid as a burin cut, not a clean vector line, so the point reads as struck rather than drawn.
      // The spokes are struck from outside the punch and carry well past it. They used to end barely
      // clear of the point they came from, which made every class above IV read as one thickened dot
      // with a fringe rather than as a radiant sign.
      const primary=index<5||i%2===0,len=radius*(index>=4?(primary?1.62:1.02):1.36)*(.86+rng()*.16);
      const x1=cx+Math.cos(a+jitter)*core*1.5,y1=cy+Math.sin(a+jitter)*core*1.5;
      const x2=cx+Math.cos(a+jitter)*len,y2=cy+Math.sin(a+jitter)*len;
      burinSegment(g,x1,y1,x2,y2,rgb,rayAlpha,weight,seed^(i*9176+7),{segments:len>radius?3:2,wobble:.22,hair:false});
    }
  }
  // Both class circles now ride outside the spokes rather than under them, so the ray and the ring stay
  // two separate marks at every class instead of crossing into one another.
  if(index===3)burinArc(g,cx,cy,radius*1.5,0,TAU,rgb,alpha*.46,Math.max(.36,.42*size),seed^0x7c31,{wobble:.12,skips:1});
  if(index>=4)burinArc(g,cx,cy,radius*1.76,0,TAU,rgb,alpha*.38,Math.max(.32,.36*size),seed^0x9d15,{wobble:.14,skips:2});
  g.restore();
  return radius;
}
function revealRenaissanceStar(n,pen,rgb){
  const faint=pen.taken<1?pen.ring:0;
  if(faint>0)renaissanceStarGlyph(ctx,0,0,6,rgb,.82*faint,scale*.9,n.seed^0x17);
  // The classified point is printed at nearly full strength from the moment the quill commits to it.
  // The old floor of .38 was the pen drying, not the plate: a star already entered in the catalogue is
  // not a faint one, and on the pale sheet the ochre it is set in had nothing left to read against.
  if(pen.taken>0)renaissanceStarGlyph(ctx,0,0,n.magnitude,rgb,pen.taken*(.56+.44*pen.d),scale,n.seed);
}
function drawRenaissanceStarLetter(n,observation,rgb){
  if(plainPlate()||!renaissanceStarClassified(n,observation)||!n.greek)return;
  const threshold=n.uncertain?RENAISSANCE_STAR_CERTAIN:RENAISSANCE_STAR_CLASSIFIED;
  const inked=clamp((observation-threshold)/Math.max(.01,1-threshold),0,1),dir=n.x>=0?1:-1,size=Math.max(9,10*scale);
  ctx.font=plateFace(size,'text','italic');ctx.textAlign=dir>0?'left':'right';ctx.textBaseline='alphabetic';
  ctx.fillStyle=`rgba(${rgb},${.78*inked})`;
  // Set clear of whatever the sign itself reaches, rather than at a fixed hair's breadth from the centre:
  // at the gauge the classes are now punched at, a flat offset put the letter across the star's own spokes.
  writeText(ctx,n.greek,dir*((renaissanceStarSpan(n.magnitude)+2.8)*scale)+dir*size*.35,-5.4*scale,inked,{size,nib:false});
}
// A slingshot star does not carry a fixed magnitude the way a catalogued point does — the atlas has
// watched this one flare before, the way it watched Tycho's star of 1572 or Kepler's of 1604: a modest
// ember at rest, brightening lap over lap as it is orbited, and spending that light in a burst at full
// charge rather than holding still. It reads by the same charge the ring outside the frame fills with,
// so the specimen and the instrument around it always agree.
// Nothing here emits light: the plate has no lamp in it, and an engraving never had one either. A star
// is made to blaze by the four things a burin can actually do — leave the sheet bare around the point,
// throw long spokes off it, ring it in corona, and fleck the ground beyond with sparks — and the atlas
// spends more of all four the fuller the lap runs. The old ember was a three-pixel dot adrift in a
// forty-pixel instrument ring, so the specimen read as fainter than the gauge measuring it.
function novaGlyph(g,cx,cy,charge,rgb,alpha,size,seed=0){
  const rng=seeded((seed^0x51e2b7)>>>0||1),radius=(8.4+charge*8.4)*size,core=Math.max(1.2,radius*.4);
  g.save();g.lineCap='round';
  // Three coronas at the most, and spaced so that even the outermost stays inside the charge band the
  // instrument draws at r*.73: the burst is the specimen's, and it never reaches across the gauge.
  const rings=1+Math.round(charge*2);
  for(let i=0;i<rings;i++){
    const ringR=radius*(1.5+i*.42),ringAlpha=alpha*(.34+charge*.2-i*.07);
    if(ringAlpha>0)burinArc(g,cx,cy,ringR,0,TAU,rgb,ringAlpha,Math.max(.38,.5*size),seed^(0x2c40+i*131),{wobble:.15,skips:1});
  }
  // Long primary spokes alternating with short ticks, as a printer's radiant star is cut rather than a
  // spider of equal legs. They are laid before the reserve below, which then takes their inner ends off,
  // and they are cut heavy: a thin spoke beside a bold instrument ring reads as a scratch, not as light.
  const rays=8+2*Math.round(charge*4),rayAlpha=alpha*(.62+.38*charge),weight=Math.max(.6,(.72+charge*.5)*size);
  for(let i=0;i<rays;i++){
    const a=i*TAU/rays-Math.PI/2+(rng()-.5)*.1,primary=i%2===0;
    const len=radius*(primary?1.3+charge*.75:.96+charge*.44)*(.88+rng()*.16);
    const x1=cx+Math.cos(a)*core*1.55,y1=cy+Math.sin(a)*core*1.55;
    const x2=cx+Math.cos(a)*len,y2=cy+Math.sin(a)*len;
    burinSegment(g,x1,y1,x2,y2,rgb,rayAlpha*(primary?1:.72),weight,seed^(i*733+53),{segments:len>radius?3:2,wobble:.2,hair:false});
  }
  // The sparks a nova throws past its own corona, stippled onto the ground as the lap fills. They stay
  // well inside the charge band outside them, so the specimen never crowds the instrument.
  const flecks=charge>.5?Math.round((charge-.5)*44):0;
  for(let i=0;i<flecks;i++){
    const a=rng()*TAU,d=radius*(1.4+rng()*.75);
    g.fillStyle=`rgba(${rgb},${alpha*(.28+charge*.34)*(.4+rng()*.6)})`;
    g.beginPath();g.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,Math.max(.4,.55*size),0,TAU);g.fill();
  }
  // A reserve of bare sheet around the point: the engraver's own way of printing light is to cut nothing
  // at all there. It crops the spokes back so they spring from a clear halo instead of out of the ink.
  g.fillStyle=`rgba(${ink.base.paperRgb},${.74*alpha})`;g.beginPath();g.arc(cx,cy,core*1.42,0,TAU);g.fill();
  // On the pale sheet the warm ink of the point is laid over a dark keyline first, the way the gilder
  // cuts his line before the leaf goes into it; at night the ground is already the dark behind it.
  if(onPaper()){g.fillStyle=`rgba(${ink.base.inkStrong},${.58*alpha})`;g.beginPath();g.arc(cx,cy,core*1.15,0,TAU);g.fill();}
  g.fillStyle=`rgba(${rgb},${Math.min(1,alpha*(.86+.28*charge))})`;g.beginPath();g.arc(cx,cy,core,0,TAU);g.fill();
  g.restore();
  return radius;
}
function revealNova(n,pen,rgb){
  const p=world&&world.player,active=p&&p.node===n,charge=active?world.charge():0;
  const faint=pen.taken<1?pen.ring:0;
  if(faint>0)novaGlyph(ctx,0,0,0,rgb,.72*faint,scale*.9,n.seed^0x17);
  if(pen.taken>0)novaGlyph(ctx,0,0,charge,rgb,pen.taken*(.58+.42*pen.d),scale,n.seed);
}
const figureLayers=new Map();
// The lateral room a figure actually has, and the two numbers that say so. Outward — away from the
// main route — there is only whatever is left between the middle star and the edge every node on the
// sheet is already cut inboard of: on the reference sheet the fork's own stars are pushed right up
// against that edge, so the whole outward allowance comes to about one star's radius. Inward there is
// the entire gulf between the fork and the main line, less the clearance the route itself needs. The
// figure is therefore biased inward, deliberately and by the fork's own numbers rather than by taste.
const FIG_OUTWARD=75,FIG_INWARD=110,FIG_ROUTE=40,FIG_EDGE=6;
function figFrame(chart){
  const s=chart.stars,side=(s[0].x+s[1].x+s[2].x)>=0?1:-1;
  const minX=Math.min(s[0].x,s[1].x,s[2].x),maxX=Math.max(s[0].x,s[1].x,s[2].x);
  const minY=Math.min(s[0].y,s[1].y,s[2].y),maxY=Math.max(s[0].y,s[1].y,s[2].y),pad=FIG_INWARD+14;
  return {side,originX:minX-pad,originY:minY-pad,w:maxX-minX+pad*2,h:maxY-minY+pad*2};
}
// A parametric spine running bottom-to-top through the three stars (their fixed generation order),
// extended a little past both ends. Its perpendicular always points to the outward side of the fork,
// away from the main route, so the figure is mirrored by `side` to face the route it branches from.
function figSpine(p0,p1,p2,side,ext){
  const dir0=Math.atan2(p1.y-p0.y,p1.x-p0.x),dir2=Math.atan2(p2.y-p1.y,p2.x-p1.x);
  const chain=[{x:p0.x-Math.cos(dir0)*ext,y:p0.y-Math.sin(dir0)*ext},p0,p1,p2,{x:p2.x+Math.cos(dir2)*ext,y:p2.y+Math.sin(dir2)*ext}];
  const segLen=chain.slice(1).map((b,i)=>Math.hypot(b.x-chain[i].x,b.y-chain[i].y)||.001);
  const total=segLen.reduce((a,b)=>a+b,0);
  // Where each star falls along the spine, so a figure can hang its hinges, waists and joints on them.
  const stops=[segLen[0]/total,(segLen[0]+segLen[1])/total,(segLen[0]+segLen[1]+segLen[2])/total];
  return {total,stops,at(t){
    let d=clamp(t,0,1)*total,i=0;
    while(i<segLen.length-1&&d>segLen[i]){d-=segLen[i];i++;}
    const a=chain[i],b=chain[i+1],frac=d/segLen[i],tx=(b.x-a.x)/segLen[i],ty=(b.y-a.y)/segLen[i];
    let px=-ty,py=tx;if(px*side<0){px=-px;py=-py;}
    return {x:lerp(a.x,b.x,frac),y:lerp(a.y,b.y,frac),tx,ty,px,py};
  }};
}
// One point on the figure: a distance `o` off the spine at parameter `t`, on the outward side.
function figAt(spine,t,o){const s=spine.at(t);return {x:s.x+s.px*o,y:s.y+s.py*o};}
function figRibbon(spine,fn,steps){return figRibbonRange(spine,fn,steps,0,1);}
// The same contour over part of the spine only, for a figure that ends before the extensions do.
function figRibbonRange(spine,fn,steps,from,to){
  const pts=[];for(let i=0;i<=steps;i++){const t=lerp(from,to,i/steps),s=spine.at(t),o=fn(t);pts.push({x:s.x+s.px*o,y:s.y+s.py*o});}
  return pts;
}
// The budget every figure's off-spine profile is written as a fraction of. It is asked of the middle
// star, because that is where the drawing is widest: the spine is straightest there, the main route
// has swung to the far side of the sheet for the length of the fork, and neither the entry nor the
// exit node is within a row of it. `inboard` is the chart's own reach — the furthest from the middle
// a mark of a given size may be cut — and it is asked here for the width of the figure's own ink
// rather than for a node's radius, since a contour is a line and not an orbit. Mass is concentrated
// at t1 and falls away to a strap by the outer two stars, which is all the room a fork leaves there.
// Ornament hung on a star itself (a collar, a socket, a vane) is furniture around that star and keeps
// its own p.r+k radius; only the ribbon answers to the budget.
function figBox(spine,p1){
  const anchor=Math.abs(p1.x),[t0,t1,t2]=spine.stops,reach=Math.max(.001,Math.max(t1-t0,t2-t1));
  const out=Math.max(12,Math.min(FIG_OUTWARD,world.inboard(FIG_EDGE)-anchor)),into=Math.max(12,Math.min(FIG_INWARD,anchor-FIG_ROUTE));
  const mass=t=>Math.pow(Math.max(0,Math.cos(clamp((t-t1)/(reach*1.32),-1,1)*(Math.PI/2))),1.7);
  // The inward allowance is asked again at every point on the spine rather than once at the middle
  // star: a fork whose outer stars are cut further in than its middle one would otherwise carry the
  // middle star's whole budget out to the ends of the figure and crowd the main line there.
  const room=t=>Math.max(10,Math.min(into,Math.abs(spine.at(t).x)-FIG_ROUTE));
  // `lat` is how a figure asks for width: a signed fraction of the budget, positive spending the
  // outward allowance and negative the inward one, already tapered by the mass curve.
  return {out,half:(out+into)/2,mass,room,lat:(t,f)=>f<0?f*room(t)*mass(t):f*out*mass(t)};
}
// ---------- The hand the figures are cut in ----------
// One style object is consulted by the four primitives every figure is built from — the contour, the
// hatching, the stipple and the wash — and by the pen the layer is drawn with, whose line weight is
// scaled as it is set. So all twelve engravings answer to the chosen hand without being rewritten:
// Bayer's is finer, more geometric and less broken, Bode's heavier and far more shaded.
const FIGURE_STYLES={
  // The cut and the colourist are one cosmetic hand: the same selected manner changes how the
  // figure is engraved and how its wash is brushed over the finished line.
  hevelius:{weight:1,breaks:1,jag:1,hatch:1,stipple:1,hatchWeight:.45,wash:'mineral'},
  bayer:{weight:.78,breaks:.4,jag:.3,hatch:.8,stipple:.65,hatchWeight:.45,wash:'rubricated'},
  bode:{weight:1.4,breaks:1.35,jag:1.3,hatch:2,stipple:1.7,hatchWeight:.45,wash:'dry'}
};
const HAND_COLOUR_STYLES={
  // A dilute mineral wash: broken coverage and soft pigment, with short bristle marks at each start.
  mineral:{coverage:.72,skip:.24,alpha:.56,brush:.8,grain:.34},
  // Bayer's finer hand is paired with a more deliberate rubricated pass, still visibly laid by hand.
  rubricated:{coverage:.82,skip:.15,alpha:.62,brush:.62,grain:.22},
  // Bode's heavier cut gets a dry, uneven pass: darker islands and more unpainted paper between them.
  dry:{coverage:.58,skip:.36,alpha:.68,brush:1.12,grain:.5}
};
const figureStyle=()=>FIGURE_STYLES[activeCosmetic('figures')]||FIGURE_STYLES.hevelius;
let figStyle=FIGURE_STYLES.hevelius;
// The pen the figure is cut with: every line weight set on it, by the primitives below or by a figure
// reaching for the context directly, is scaled by the style's weight.
function figPen(g,style){
  return new Proxy(g,{
    get(target,key){const value=target[key];return typeof value==='function'?value.bind(target):value;},
    set(target,key,value){target[key]=key==='lineWidth'?value*style.weight:value;return true;}
  });
}
// A hand-inked contour: short broken segments, each struck with the same burin every other mark on
// the plate is cut with — swelling and tapering rather than holding one flat vector width — instead
// of the constant-width jittered polyline this used to be. rgb/alpha are taken explicitly rather
// than inherited off ctx.strokeStyle, so a caller never has to set the context up beforehand.
function figInk(g,pts,rng,jag,gap,width,rgb,alpha){
  for(let i=0;i<pts.length-1;i++){
    if(rng()<gap*figStyle.breaks)continue;
    const a=pts[i],b=pts[i+1],j=jag*figStyle.jag;
    const ax=a.x+(rng()-.5)*j,ay=a.y+(rng()-.5)*j,bx=b.x+(rng()-.5)*j,by=b.y+(rng()-.5)*j;
    const seed=Math.floor(rng()*4294967296)>>>0;
    burinSegment(g,ax,ay,bx,by,rgb,alpha,width,seed,{segments:2,wobble:jag*.6,hair:i%3===0});
  }
}
function figStipple(g,spine,leftFn,rightFn,count,rng,size){
  const n=Math.round(count*figStyle.stipple);
  for(let i=0;i<n;i++){
    const t=rng(),s=spine.at(t),o=lerp(leftFn(t),rightFn(t),rng());
    g.fillRect(s.x+s.px*o,s.y+s.py*o,size,size);
  }
}
// Every hatch on the plate is laid in the sheet's own hand — down and to the right, one fixed slant
// for the whole atlas, the same rule Saturn's handles and every planet's own terminator hatch already
// keep — never turning to face whatever axis the mark it shades happens to sit on. A figure's own
// spine used to set that axis instead, which is why the moth's wings and the needle's shaft shaded in
// two different directions on the same sheet. Strokes now walk the spine at a fixed pitch rather than
// landing at n random points, each sized to the ribbon's own local width rather than a flat 2-5 units,
// and set darker the further outward across the ribbon they fall — the same darkening-toward-the-limb
// reading a planet's own terminator hatch gives a sphere.
const FIG_HATCH_ANGLE=.95;
function figHatch(g,spine,leftFn,rightFn,count,rng,rgb,alpha,width){
  const n=Math.max(1,Math.round(count*figStyle.hatch)),step=1/n;
  const ca=Math.cos(FIG_HATCH_ANGLE),sa=Math.sin(FIG_HATCH_ANGLE);
  for(let i=0;i<n;i++){
    const t=clamp((i+.5)*step+(rng()-.5)*step*.7,0,1),s=spine.at(t);
    const lo=Math.min(leftFn(t),rightFn(t)),hi=Math.max(leftFn(t),rightFn(t)),span=Math.max(.5,hi-lo);
    const frac=rng(),o=lerp(lo,hi,frac),len=Math.max(1.2,span*.26)*(.75+rng()*.5);
    const x=s.x+s.px*o,y=s.y+s.py*o,tone=alpha*(.4+frac*.7);
    burinSegment(g,x-ca*len,y-sa*len,x+ca*len,y+sa*len,rgb,tone,width,Math.floor(rng()*4294967296)>>>0,{segments:2,wobble:.35,hair:false});
  }
}
// A colourist's pass is collected while the black plate is being cut, then painted after the figure
// has finished. That ordering is important: this is pigment brushed onto a pulled print, not a colour
// plate that landed during printing. The strips deliberately vary in density, leave dry gaps and put a
// small bristle-loaded start at the beginning of a stroke. A perfect landing has no offset; rougher
// arrivals carry the frozen `n.impression` offset made by simulation.js.
function figWash(g,left,right,state){
  if(state&&state.handColour)state.colourRegions.push({left,right});
  else{
    g.beginPath();g.moveTo(left[0].x,left[0].y);
    for(const p of left)g.lineTo(p.x,p.y);
    for(let i=right.length-1;i>=0;i--)g.lineTo(right[i].x,right[i].y);
    g.closePath();g.fill();
  }
  // A completed chart has been struck a second time, the way the shield device's own escutcheon
  // carries a fainter inner echo of its outer line (chargeDevice, 'shield'): the outer edge of each
  // washed region is gone over once more, at half the contour's own ink.
  if(state&&state.completed){
    const seed=(state.colourSeed^Math.round(left[0].x*131+left[0].y*17))>>>0;
    figRestrike(g,left,state.contourRgb,state.contourAlpha*.5,seed);
    figRestrike(g,right,state.contourRgb,state.contourAlpha*.5,seed^0x9e37);
  }
}
// The second pass of a doubled line: the same span, cut again rather than merely redrawn, so the
// echo reads as a hand going back over its own work rather than a duplicated vector.
function figRestrike(g,pts,rgb,alpha,seed){
  for(let i=0;i<pts.length-1;i++){
    const a=pts[i],b=pts[i+1];
    burinSegment(g,a.x,a.y,b.x,b.y,rgb,alpha,1,(seed+i*7919)>>>0,{segments:2,hair:false,wobble:.3});
  }
}
// A smooth vector curve, cut by the same hand as every straight and arced mark on the figure: `pts`
// is a chain of cubic Bezier segments in bezierCurveTo's own layout ([start, c1,c2,end, c1,c2,end,
// ...]), sampled and struck span by span with burinSegment rather than drawn as a bare path.
function figCurve(g,pts,rgb,alpha,width,seed,steps=14){
  const sampled=[pts[0]];
  for(let i=0;i+3<pts.length;i+=3){
    const [p0x,p0y]=pts[i],[c1x,c1y]=pts[i+1],[c2x,c2y]=pts[i+2],[p1x,p1y]=pts[i+3];
    for(let s=1;s<=steps;s++){
      const t=s/steps,mt=1-t;
      const x=mt*mt*mt*p0x+3*mt*mt*t*c1x+3*mt*t*t*c2x+t*t*t*p1x;
      const y=mt*mt*mt*p0y+3*mt*mt*t*c1y+3*mt*t*t*c2y+t*t*t*p1y;
      sampled.push([x,y]);
    }
  }
  for(let i=0;i<sampled.length-1;i++){
    const [ax,ay]=sampled[i],[bx,by]=sampled[i+1];
    burinSegment(g,ax,ay,bx,by,rgb,alpha,width,(seed+i*7919)>>>0,{segments:1,wobble:.2,hair:false});
  }
}
function colourPoint(p,c,dx,dy,rotation){
  const x=p.x-c.x,y=p.y-c.y,cos=Math.cos(rotation),sin=Math.sin(rotation);
  return {x:c.x+dx+x*cos-y*sin,y:c.y+dy+x*sin+y*cos};
}
function paintHandColour(g,state){
  if(!state.handColour||!state.wash||state.colourFrac<=0||!state.colourRegions.length)return;
  const style=HAND_COLOUR_STYLES[state.colourStyle]||HAND_COLOUR_STYLES.mineral;
  const rng=seeded(state.colourSeed>>>0||1),full=state.colourFull;
  for(const region of state.colourRegions){
    const {left,right}=region,segments=Math.min(left.length,right.length)-1;
    if(segments<1)continue;
    let cx=0,cy=0,total=0;
    for(const p of left) {cx+=p.x;cy+=p.y;total++;}
    for(const p of right) {cx+=p.x;cy+=p.y;total++;}
    const centre={x:cx/total,y:cy/total};
    let i=0;
    while(i<segments){
      const strokeLength=1+Math.floor(rng()*(style.brush>1?3:5)),end=Math.min(segments,i+strokeLength);
      const painted=full||rng()<state.colourFrac;
      if(!painted||rng()<style.skip||rng()>style.coverage){i=end;continue;}
      const dx=state.colourOffset.x+(rng()-.5)*style.grain*state.colourRough,
        dy=state.colourOffset.y+(rng()-.5)*style.grain*state.colourRough,
        rotation=state.colourOffset.rotation+(rng()-.5)*.006*style.brush*state.colourRough,
        alpha=style.alpha*(.48+rng()*.72)*(full?1:.86)*state.colourFade;
      const a=colourPoint(left[i],centre,dx,dy,rotation),b=colourPoint(left[end],centre,dx,dy,rotation),
        c=colourPoint(right[end],centre,dx,dy,rotation),d=colourPoint(right[i],centre,dx,dy,rotation);
      g.save();g.globalAlpha=alpha;g.fillStyle=state.wash;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(c.x,c.y);g.lineTo(d.x,d.y);g.closePath();g.fill();
      // The loaded brush leaves a visible, rounded start rather than a perfectly clipped vector edge.
      if(rng()<.7){
        const r=Math.max(.55,Math.min(2.4,Math.hypot(d.x-a.x,d.y-a.y)*.08))*style.brush;
        g.globalAlpha=alpha*.58;g.beginPath();g.arc((a.x+d.x)/2,(a.y+d.y)/2,r,0,TAU);g.fill();
      }
      g.restore();
      i=end;
    }
  }
}
// A long sailmaker's needle: a thin tapering shaft with a pierced eye near the blunt end, and a
// curling thread that doubles back through all three stars. A needle that carried the budget in its
// shaft would stop being a needle, so the shaft takes only enough of it to read as forged and the
// thread — which is free to wander — spends the rest, swinging nearly the whole box at the middle star.
function figNeedle(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,54),steps=48,box=figBox(spine,p1);
  const shaft=t=>3.4+box.lat(t,.055);
  const halfW=t=>t<.05?shaft(t)*.76:t>.9?Math.max(.4,shaft(t)*(1-(t-.9)/.1)):shaft(t);
  const left=figRibbon(spine,t=>-halfW(t),steps),right=figRibbon(spine,t=>halfW(t),steps);
  figInk(g,left,rng,.7,.08,1.3,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.7,.08,1.3,state.contourRgb,state.contourAlpha);
  // Set clear of the star punch (buildFigureLayer's own destination-out pass erases every figure mark
  // within p0.r+8), which used to take the eye out with it: pushed out to p0.r+18 on the spine's own
  // outward side, with its long axis turned across the spine rather than along it. That reach is
  // capped the same way figBox caps every other outward mark — by what inboard() leaves past p0's own
  // position — since a fork whose bottom star is cut at the full inboard reach would otherwise push
  // the eye past the sheet's own edge; the 54-unit lead-in to spine.at(0) already clears the punch on
  // its own, so the cap can give ground there without the eye landing back inside it.
  const eyeReach=Math.max(12,Math.min(p0.r+18,world.inboard(FIG_EDGE)-Math.abs(p0.x)));
  const eyeDir=spine.at(0),eye=figAt(spine,0,eyeReach),eyeSeed=Math.floor(rng()*4294967296)>>>0;
  g.save();g.translate(eye.x,eye.y);g.rotate(Math.atan2(eyeDir.ty,eyeDir.tx)+Math.PI/2);
  burinArc(g,0,0,3.6,0,TAU,state.contourRgb,state.contourAlpha,1.3,eyeSeed,{flatten:7/3.6,segments:16,skips:2,wobble:.25});
  burinArc(g,0,0,1.4,0,TAU,state.contourRgb,state.contourAlpha,1,eyeSeed^0x91,{flatten:3.2/1.4,segments:12,skips:2,wobble:.25});
  g.restore();
  const thread=[];for(let i=0;i<=76;i++){const t=.08+i/76*.86,s=spine.at(t),o=box.lat(t,Math.sin(t*9+side)*.95);thread.push({x:s.x+s.px*o,y:s.y+s.py*o});}
  figInk(g,thread,rng,.7,.1,1,state.contourRgb,state.contourAlpha);
  if(state.hatchFrac>0){figHatch(g,spine,t=>-halfW(t),t=>halfW(t),Math.round(46*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-halfW(t)-2,t=>halfW(t)+2,26,rng,.9);
}
// A billowing lateen sail on a spar: a near-straight luff close to the spine and a bulging leech that
// bellies out through the middle star.
function figSail(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,46),steps=52,box=figBox(spine,p1);
  // The luff is hauled close to the spine on the crowded outward side; the leech bellies into the open
  // half of the sheet and is fullest at the middle star, which is where a lateen sail draws.
  const inner=t=>2.4+box.lat(t,.05),outer=t=>-2.4+box.lat(t,-.95);
  const left=figRibbon(spine,inner,steps),right=figRibbon(spine,outer,steps);
  figInk(g,left,rng,.6,.06,1.5,state.contourRgb,state.contourAlpha);figInk(g,right,rng,1,.05,1.2,state.contourRgb,state.contourAlpha);
  figInk(g,[left[2],right[2]],rng,.5,0,1,state.contourRgb,state.contourAlpha);figInk(g,[left[steps-2],right[steps-2]],rng,.5,0,1,state.contourRgb,state.contourAlpha);
  if(state.hatchFrac>0){figHatch(g,spine,inner,outer,Math.round(60*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,inner,outer,30,rng,.9);
}
// A classical chelys lyre: two curved arms rising from a soundbox to a crossbar, with strings strung
// between, the soundbox low on the frame and the yoke high.
function figLyre(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,40),steps=48,box=figBox(spine,p1);
  // Both arms sweep out from the soundbox to the yoke, each taking its own side's share of the budget:
  // the inward arm is the deeper of the two because that is the half of the sheet that is free.
  const armOut=t=>2.6+box.lat(t,.92),armInner=t=>1.7+box.lat(t,.46);
  const bowOut=t=>-2.6+box.lat(t,-.92),bowInner=t=>-1.7+box.lat(t,-.46);
  const leftOut=figRibbon(spine,bowOut,steps),leftIn=figRibbon(spine,bowInner,steps);
  const rightIn=figRibbon(spine,armInner,steps),rightOut=figRibbon(spine,armOut,steps);
  figInk(g,leftOut,rng,.7,.07,1.3,state.contourRgb,state.contourAlpha);figInk(g,leftIn,rng,.7,.09,1,state.contourRgb,state.contourAlpha);
  figInk(g,rightIn,rng,.7,.09,1,state.contourRgb,state.contourAlpha);figInk(g,rightOut,rng,.7,.07,1.3,state.contourRgb,state.contourAlpha);
  // Moved clear of the star punch (see figNeedle's eye, above) rather than shrunk: set in on the
  // spine's inward side at p0.r+16, and given the full mass of a real soundbox now that there is room.
  const boxDir=spine.at(0),chelys=figAt(spine,0,-(p0.r+16));
  g.save();g.translate(chelys.x,chelys.y);g.rotate(Math.atan2(boxDir.ty,boxDir.tx));
  burinArc(g,0,0,34,0,TAU,state.contourRgb,state.contourAlpha,1.4,Math.floor(rng()*4294967296)>>>0,{flatten:12/34,segments:28,skips:3,wobble:.2});
  g.restore();
  const i92=Math.round(steps*.92),yl=leftIn[i92],yr=rightIn[i92];
  burinSegment(g,yl.x,yl.y,yr.x,yr.y,state.contourRgb,state.contourAlpha,1.5,Math.floor(rng()*4294967296)>>>0,{segments:3,wobble:.3,hair:true});
  for(let i=0;i<7;i++){
    const u=i/6,t0=.14,t1=.9,a=spine.at(t0),b=spine.at(t1);
    const o0=lerp(bowInner(t0),armInner(t0),u)*.86,o1=lerp(bowInner(t1),armInner(t1),u)*.86;
    const x0=a.x+a.px*o0,y0=a.y+a.py*o0,x1=b.x+b.px*o1,y1=b.y+b.py*o1;
    burinSegment(g,x0,y0,x1,y1,state.contourRgb,state.contourAlpha,.7,Math.floor(rng()*4294967296)>>>0,{segments:2,wobble:.2,hair:false});
  }
  if(state.hatchFrac>0){
    figHatch(g,spine,bowOut,bowInner,Math.round(20*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
    figHatch(g,spine,armInner,armOut,Math.round(20*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
  }
  if(state.wash){g.fillStyle=state.wash;figWash(g,leftOut,leftIn,state);figWash(g,rightIn,rightOut,state);}
  g.fillStyle=state.contour;figStipple(g,spine,bowOut,armOut,22,rng,.7);
}
// A pointed diadem: a thin band that arcs past the stars with occasional spikes, and a jewel collar
// set clear of each star's rim.
function figCrown(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,34),steps=48,box=figBox(spine,p1);
  // The hoop keeps close to the spine and the points rise off it into the open half of the sheet,
  // tallest at the middle star and shortening to little more than the hoop by the outer two.
  const point=t=>Math.abs(Math.sin(t*Math.PI*2.4))>.8?.82:.13;
  const band=t=>-2+box.lat(t,-point(t)),hoop=t=>2.4+box.lat(t,.1);
  const left=figRibbon(spine,band,steps),right=figRibbon(spine,hoop,steps);
  figInk(g,left,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);
  for(const p of [p0,p1,p2]){
    burinArc(g,p.x,p.y,p.r+14,0,TAU,state.contourRgb,state.contourAlpha,1.2,Math.floor(rng()*4294967296)>>>0,{segments:24,skips:3,wobble:.2});
    burinArc(g,p.x,p.y,p.r+21,-.65,.65,state.contourRgb,state.contourAlpha,1.2,Math.floor(rng()*4294967296)>>>0,{segments:8,skips:1,wobble:.2});
  }
  if(state.hatchFrac>0){figHatch(g,spine,band,hoop,Math.round(40*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>band(t)-2,t=>hoop(t)+2,24,rng,.9);
}
// Points along a circular arc, ready for figInk to cut as a broken hand-drawn curve.
function figArcPts(cx,cy,r,from,to,steps){
  const pts=[];for(let i=0;i<=steps;i++){const a=lerp(from,to,i/steps);pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});}
  return pts;
}
// A pair of dividers. The hinge closes on the top star, the pencil socket rings the middle star,
// and the fixed leg's point descends into the bottom one; the second leg swings out to the side
// and a graduated sector arc spans the opening.
function figCompass(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,58),steps=52,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const hinge=Math.min(1,t2+(1-t2)*.3);
  // The legs swing apart from the knuckle at the top star and reach their full opening at the middle
  // one, where the sheet is widest; below that they draw very slightly together again toward the points,
  // rather than running on off the plate the way a leg opening all the way to the foot had to.
  const open=t=>t>=t1?clamp((t2-t)/Math.max(.001,t2-t1),0,1):1-(t1-t)/Math.max(.001,t1)*.16;
  const cap=t=>clamp(1-(t-t2)/Math.max(.001,(1-t2)*.3),0,1);
  const legA=t=>2.2+open(t)*box.out*.2,legB=t=>-2.2-open(t)*box.room(t)*.92;
  const wA=t=>(3.1-open(t)*1.9)*cap(t),wB=t=>(3.3-open(t)*2.1)*cap(t);
  const aIn=figRibbonRange(spine,t=>legA(t)-wA(t),steps,0,hinge),aOut=figRibbonRange(spine,t=>legA(t)+wA(t),steps,0,hinge);
  const bIn=figRibbonRange(spine,t=>legB(t)-wB(t),steps,0,hinge),bOut=figRibbonRange(spine,t=>legB(t)+wB(t),steps,0,hinge);
  figInk(g,aIn,rng,.7,.07,1.35,state.contourRgb,state.contourAlpha);figInk(g,aOut,rng,.7,.07,1.35,state.contourRgb,state.contourAlpha);
  figInk(g,bIn,rng,.7,.07,1.35,state.contourRgb,state.contourAlpha);figInk(g,bOut,rng,.7,.07,1.35,state.contourRgb,state.contourAlpha);
  // The hinge: a knuckle ring round the top star with two rivet ticks.
  figInk(g,figArcPts(p2.x,p2.y,p2.r+12,0,TAU,30),rng,.5,.06,1.3,state.contourRgb,state.contourAlpha);
  figInk(g,figArcPts(p2.x,p2.y,p2.r+17,-2.5,-.6,10),rng,.5,0,.9,state.contourRgb,state.contourAlpha);
  figInk(g,figArcPts(p2.x,p2.y,p2.r+17,.5,2.4,10),rng,.5,0,.9,state.contourRgb,state.contourAlpha);
  // The socket that grips the lead, on the middle star.
  figInk(g,figArcPts(p1.x,p1.y,p1.r+11,0,TAU,26),rng,.6,.1,1.1,state.contourRgb,state.contourAlpha);
  for(let i=0;i<6;i++){
    const a=i/6*TAU,q0={x:p1.x+Math.cos(a)*(p1.r+8),y:p1.y+Math.sin(a)*(p1.r+8)};
    const q1={x:p1.x+Math.cos(a)*(p1.r+15),y:p1.y+Math.sin(a)*(p1.r+15)};
    figInk(g,[q0,q1],rng,.4,0,.8,state.contourRgb,state.contourAlpha);
  }
  // The sector arc between the two points, graduated in fifths.
  const aTip=figAt(spine,0,legA(0)),bTip=figAt(spine,0,legB(0)),foot=spine.at(0);
  const sector=[];
  for(let i=0;i<=22;i++){const u=i/22,bow=Math.sin(Math.PI*u)*13;
    sector.push({x:lerp(aTip.x,bTip.x,u)-foot.tx*bow,y:lerp(aTip.y,bTip.y,u)-foot.ty*bow});}
  figInk(g,sector,rng,.6,.08,.9,state.contourRgb,state.contourAlpha);
  for(let i=1;i<5;i++){
    const p=sector[Math.round(i/5*22)],q=sector[Math.round(i/5*22)+1]||p;
    const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1;
    figInk(g,[p,{x:p.x-dy/d*5,y:p.y+dx/d*5}],rng,.3,0,.7,state.contourRgb,state.contourAlpha);
  }
  const inA=t=>legA(clamp(t,0,hinge))-wA(clamp(t,0,hinge)),outA=t=>legA(clamp(t,0,hinge))+wA(clamp(t,0,hinge));
  const inB=t=>legB(clamp(t,0,hinge))-wB(clamp(t,0,hinge)),outB=t=>legB(clamp(t,0,hinge))+wB(clamp(t,0,hinge));
  if(state.hatchFrac>0){figHatch(g,spine,inA,outA,Math.round(22*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
    figHatch(g,spine,inB,outB,Math.round(26*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,aIn,aOut,state);figWash(g,bIn,bOut,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>inA(t)-4,t=>outB(t)+4,26,rng,.85);
}
// An hourglass. The waist pinches at the middle star, and the two plates are set on the outer
// stars, joined by the corner posts, with the sand run out into the lower bulb.
function figHourglass(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,34),steps=64,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const reach=Math.max(.001,Math.max(t1-t0,t2-t1));
  // The one figure whose anatomy refuses to put its mass at the middle star: an hourglass is pinched
  // at the waist by definition, and the waist is hung on t1. It answers to the budget all the same,
  // and leans the same way — the deep half of each bulb is the inward one.
  const bulb=t=>Math.pow(clamp(Math.abs(clamp(t,t0,t2)-t1)/reach,0,1),1.15);
  const glassIn=t=>-2.2-bulb(t)*box.room(t)*.86,glassOut=t=>2.2+bulb(t)*box.out*.86;
  const left=figRibbonRange(spine,glassIn,steps,t0,t2),right=figRibbonRange(spine,glassOut,steps,t0,t2);
  figInk(g,left,rng,.7,.05,1.4,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.7,.05,1.4,state.contourRgb,state.contourAlpha);
  // A plate on each of the outer stars, with a foot, joined by the two corner posts.
  const plateIn=t=>-(box.room(t)*.96+4),plateOut=()=>box.out*.96+4;
  for(const t of [t0,t2]){
    const out=t===t0?-.05:.05;
    figInk(g,[figAt(spine,t,plateIn(t)),figAt(spine,t,plateOut(t))],rng,.5,0,1.9,state.contourRgb,state.contourAlpha);
    figInk(g,[figAt(spine,t+out*.55,plateIn(t)+5),figAt(spine,t+out*.55,plateOut(t)-5)],rng,.5,0,.9,state.contourRgb,state.contourAlpha);
    figInk(g,[figAt(spine,t+out,plateIn(t)*.7),figAt(spine,t+out,plateOut(t)*.7)],rng,.5,0,1.4,state.contourRgb,state.contourAlpha);
    for(const edge of [plateIn,plateOut])figInk(g,[figAt(spine,t,edge(t)),figAt(spine,t+out,edge(t)*.7)],rng,.5,0,1.1,state.contourRgb,state.contourAlpha);
  }
  for(const [edge,inset] of [[plateIn,3],[plateOut,-3]])figInk(g,[figAt(spine,t0,edge(t0)+inset),figAt(spine,t2,edge(t2)+inset)],rng,.9,.12,1.15,state.contourRgb,state.contourAlpha);
  // The sand: a thread falling through the waist and a drift heaped in the lower bulb.
  const thread=[];for(let i=0;i<=14;i++){const t=lerp(t1,t0+.015,i/14);thread.push(figAt(spine,t,Math.sin(i*1.9)*1.3));}
  figInk(g,thread,rng,.4,.18,.6,state.contourRgb,state.contourAlpha);
  g.fillStyle=state.contour;
  for(let i=0;i<110;i++){
    const t=lerp(t0+.008,t1-.02,rng()*rng()),s=spine.at(t),o=lerp(glassIn(t),glassOut(t),rng())*.82;
    g.fillRect(s.x+s.px*o,s.y+s.py*o,.9,.9);
  }
  if(state.hatchFrac>0){figHatch(g,spine,glassIn,glassOut,Math.round(52*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>glassIn(t)-3,t=>glassOut(t)+3,22,rng,.85);
}
// A serpent. The body is a wave whose centre line crosses the spine at each of the three stars,
// tapering to a tail below and rearing into a head above the top one.
function figSerpent(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,74),steps=88,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const phase=t=>t<=t0?(t-t0)/Math.max(.001,t0)*2.3:t<=t1?Math.PI*(t-t0)/(t1-t0):
    t<=t2?Math.PI*(1+(t-t1)/(t2-t1)):Math.PI*2+(t-t2)/Math.max(.001,1-t2)*2.1;
  // The centre line still crosses the spine at all three stars, so each coil is free to take its own
  // side's share of the budget: the coil above the middle star swings into the open inward half and is
  // half again as deep as the one below it, and the body is thickest where it passes the middle star.
  const swing=t=>Math.sin(phase(t)),mid=t=>box.lat(t,swing(t)*.92)+swing(t)*6;
  const thick=t=>1.4+box.half*.15*box.mass(t);
  const left=figRibbon(spine,t=>mid(t)-thick(t),steps),right=figRibbon(spine,t=>mid(t)+thick(t),steps);
  figInk(g,left,rng,.7,.05,1.3,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.7,.05,1.3,state.contourRgb,state.contourAlpha);
  // Belly bands across the body, thickest where it coils past the middle star.
  for(let i=1;i<26;i++){
    const t=t0*.4+i/26*(1-t0*.4);
    figInk(g,[figAt(spine,t,mid(t)-thick(t)),figAt(spine,t,mid(t)+thick(t))],rng,.4,.22,.55,state.contourRgb,state.contourAlpha);
  }
  // The head: a wedge with an eye and a forked tongue, set on the spine's upper extension.
  const head=spine.at(.985),hx=head.x+head.px*mid(.985),hy=head.y+head.py*mid(.985);
  const dir=Math.atan2(head.ty,head.tx),headSeed=Math.floor(rng()*4294967296)>>>0;
  g.save();g.translate(hx,hy);g.rotate(dir);
  figCurve(g,[[-9,-6],[6,-8],[14,-4],[20,-1.4],[14,4],[6,7],[-9,6]],state.contourRgb,state.contourAlpha,1.2,headSeed);
  burinArc(g,4,-1.6,1.9,0,TAU,state.contourRgb,state.contourAlpha,1,headSeed^0x2f,{segments:10,skips:2,wobble:.25});
  burinSegment(g,20,-1.4,30,-4.6,state.contourRgb,state.contourAlpha,.8,headSeed^0x53,{segments:2,wobble:.25,hair:false});
  burinSegment(g,24.6,-2.9,30,.6,state.contourRgb,state.contourAlpha,.8,headSeed^0x77,{segments:2,wobble:.25,hair:false});
  g.restore();
  if(state.hatchFrac>0){figHatch(g,spine,t=>mid(t)-thick(t),t=>mid(t)+thick(t),Math.round(60*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>mid(t)-thick(t)-2,t=>mid(t)+thick(t)+2,30,rng,.8);
}
// A ship. The hull is bellied out below the deck, its keel deepest amidships at the middle star where
// the mast is stepped, and the truck with its pennant is set on the top one.
function figArgo(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,60),steps=52,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  // The hull is stepped amidships on the middle star rather than ending there, so its deepest point —
  // the figure's whole mass — falls at t1 and the keel rises away to stem and stern. Below deck is the
  // inward half of the sheet and above deck the outward one, which is the same way round as the sail.
  const stern=Math.max(.02,t0-(t1-t0)*.34),bow=Math.min(.99,t1+(t2-t1)*.46);
  const arc=t=>t<=stern||t>=bow?0:Math.pow(Math.sin(Math.PI/2*(t<t1?(t-stern)/(t1-stern):(bow-t)/(bow-t1))),.7);
  const hull=t=>-arc(t)*box.room(t)*.92,deck=t=>arc(t)*box.out*.16;
  const keel=figRibbonRange(spine,hull,steps,stern,bow),sheer=figRibbonRange(spine,deck,steps,stern,bow);
  figInk(g,keel,rng,.8,.04,1.6,state.contourRgb,state.contourAlpha);figInk(g,sheer,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);
  for(const f of [.7,.46,.24])figInk(g,figRibbonRange(spine,t=>lerp(deck(t),hull(t),f),steps,stern,bow),rng,.7,.12,.7,state.contourRgb,state.contourAlpha);
  // Oar ports along the upper strake, and the stem and stern posts.
  for(let i=1;i<10;i++){
    const t=lerp(stern,bow,i/10),o=lerp(deck(t),hull(t),.82);
    figInk(g,[figAt(spine,t,o-3),figAt(spine,t,o+3)],rng,.3,0,.75,state.contourRgb,state.contourAlpha);
  }
  figInk(g,[figAt(spine,stern,0),figAt(spine,stern-.045,16)],rng,.6,0,1.5,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,stern-.045,16),figAt(spine,stern-.03,8)],rng,.5,0,1.1,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,bow,0),figAt(spine,bow+.04,13)],rng,.6,0,1.5,state.contourRgb,state.contourAlpha);
  // The mast, stepped on the middle star and carrying its yard and square sail.
  figInk(g,[figAt(spine,t1,-2),figAt(spine,t2+.02,-2)],rng,.5,0,1.9,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,t1,2),figAt(spine,t2+.02,2)],rng,.5,0,1.5,state.contourRgb,state.contourAlpha);
  const yard=lerp(t1,t2,.58);
  figInk(g,[figAt(spine,yard,-box.out*.3),figAt(spine,yard,box.out*.98)],rng,.5,0,1.5,state.contourRgb,state.contourAlpha);
  const luff=[],leech=[];
  for(let i=0;i<=20;i++){
    const u=i/20,t=lerp(yard,t1+.02,u);
    luff.push(figAt(spine,t,lerp(-box.out*.14,0,u)));
    leech.push(figAt(spine,t,lerp(box.out*.94,box.out*.2,u)+Math.sin(Math.PI*u)*box.out*.28));
  }
  figInk(g,leech,rng,.9,.04,1.25,state.contourRgb,state.contourAlpha);figInk(g,luff,rng,.5,.1,.8,state.contourRgb,state.contourAlpha);
  figInk(g,[leech[20],luff[20]],rng,.5,0,.9,state.contourRgb,state.contourAlpha);
  for(let i=1;i<5;i++){const u=i/5;figInk(g,[luff[Math.round(u*20)],leech[Math.round(u*20)]],rng,.6,.42,.5,state.contourRgb,state.contourAlpha);}
  // Shrouds and a pennant streaming from the truck.
  for(const o of [-.3,.64])figInk(g,[figAt(spine,t2-.012,0),figAt(spine,t1+.008,o*box.out)],rng,.6,.18,.6,state.contourRgb,state.contourAlpha);
  const flag=[];for(let i=0;i<=10;i++){const u=i/10;flag.push(figAt(spine,lerp(t2+.025,t2+.014,u),u*box.out*.64+Math.sin(u*6)*4));}
  figInk(g,flag,rng,.5,.04,.85,state.contourRgb,state.contourAlpha);
  if(state.hatchFrac>0){figHatch(g,spine,deck,hull,Math.round(50*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,sheer,keel,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>hull(t)-2,t=>deck(t)+2,26,rng,.85);
}
// An astrolabe. The graduated limb rings the middle star, the alidade lies along all three, its
// sighting vanes on the outer two, and the throne and suspension ring rise above the figure.
function figAstrolabe(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,58),steps=40,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const halfRule=t=>2.4+box.lat(t,.045);
  const left=figRibbon(spine,t=>-halfRule(t),steps),right=figRibbon(spine,halfRule,steps);
  figInk(g,left,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);
  // The limb is the instrument, and it is the one part of any figure that has to enclose a star rather
  // than pass beside it: what it may not do is foul the punch that keeps figure ink off that star's
  // orbit ring and tick fence. So it is struck as a full circle whose mother is set inward of the star
  // by exactly the difference between its radius and its outward reach — which fixes the outward reach
  // at the punch's own clearance however the budget falls, and spends the whole inward allowance on
  // the other side of the ring. The star sits inside the limb, off its centre, as it does on a plate
  // where the rete has been turned.
  const limbReach=p1.r+14,limbOuter=(limbReach+box.room(t1)*.94)/2,limbInner=limbOuter-10,mother=figAt(spine,t1,limbReach-limbOuter);
  figInk(g,figArcPts(mother.x,mother.y,limbOuter,0,TAU,52),rng,.7,.05,1.35,state.contourRgb,state.contourAlpha);
  figInk(g,figArcPts(mother.x,mother.y,limbInner,0,TAU,44),rng,.6,.08,.9,state.contourRgb,state.contourAlpha);
  for(let i=0;i<48;i++){
    const a=i/48*TAU,inner=i%4===0?limbInner:limbOuter-3.5;
    figInk(g,[{x:mother.x+Math.cos(a)*inner,y:mother.y+Math.sin(a)*inner},{x:mother.x+Math.cos(a)*limbOuter,y:mother.y+Math.sin(a)*limbOuter}],rng,.25,0,i%4===0?.75:.45,state.contourRgb,state.contourAlpha);
  }
  // Sighting vanes on the outer stars.
  for(const q of [p0,p2]){
    figInk(g,figArcPts(q.x,q.y,q.r+10,0,TAU,22),rng,.5,.12,.9,state.contourRgb,state.contourAlpha);
    for(const o of [-1,1])figInk(g,[{x:q.x+o*(q.r+16),y:q.y-5},{x:q.x+o*(q.r+16),y:q.y+5}],rng,.3,0,1.1,state.contourRgb,state.contourAlpha);
  }
  // Throne and suspension ring above the instrument.
  const crown=spine.at(clamp(t2+(1-t2)*.42,0,1)),ring=spine.at(clamp(t2+(1-t2)*.78,0,1));
  figInk(g,[figAt(spine,t2+(1-t2)*.1,-11),figAt(spine,t2+(1-t2)*.42,-7),figAt(spine,t2+(1-t2)*.42,7),figAt(spine,t2+(1-t2)*.1,11)],rng,.5,0,1.2,state.contourRgb,state.contourAlpha);
  figInk(g,figArcPts(crown.x,crown.y,9,0,TAU,16),rng,.5,.1,.9,state.contourRgb,state.contourAlpha);
  figInk(g,figArcPts(ring.x,ring.y,11,0,TAU,20),rng,.6,.06,1.3,state.contourRgb,state.contourAlpha);
  figInk(g,figArcPts(ring.x,ring.y,6.5,0,TAU,14),rng,.5,.1,.7,state.contourRgb,state.contourAlpha);
  if(state.hatchFrac>0){
    const n=Math.round(40*state.hatchFrac);
    for(let i=0;i<n;i++){
      const a=rng()*TAU,d=lerp(limbInner,limbOuter,rng()),x=mother.x+Math.cos(a)*d,y=mother.y+Math.sin(a)*d,len=1.6+rng()*2.4;
      burinSegment(g,x-Math.cos(a)*len,y-Math.sin(a)*len,x+Math.cos(a)*len,y+Math.sin(a)*len,state.hatchRgb,state.hatchAlpha*(.55+rng()*.55),figStyle.hatchWeight,Math.floor(rng()*4294967296)>>>0,{segments:2,wobble:.3,hair:false});
    }
    figHatch(g,spine,t=>-halfRule(t),halfRule,Math.round(14*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
  }
  if(state.wash){
    g.fillStyle=state.wash;figWash(g,left,right,state);
    // The annular limb is a printed rule in the hand-colour path; the old solid fill remains only for
    // non-atlas callers that still use figWash as a plain completed wash.
    if(!state.handColour){g.beginPath();g.arc(mother.x,mother.y,limbOuter,0,TAU);g.arc(mother.x,mother.y,limbInner,TAU,0,true);g.fill();}
  }
  g.fillStyle=state.contour;figStipple(g,spine,t=>-halfRule(t)-3,t=>halfRule(t)+3,18,rng,.8);
}
// A quill. The nib is cut at the bottom star, the vane opens at the middle one and the plume
// curls past the top; the barbs are laid in with short slanted strokes on both sides of the shaft.
function figQuill(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,66),steps=56,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const shaft=t=>1+2.9*clamp((t-t0*.5)/Math.max(.001,1-t0*.5),0,1);
  // The vane is stripped from the calamus below, opens to its full width at the middle star, and
  // tapers away into the plume above — which is where a real feather is widest as well.
  const barbs=t=>{const bare=lerp(t0,t1,.42);return t<=bare||t>=.995?0:t<t1?Math.pow(Math.sin(Math.PI/2*(t-bare)/(t1-bare)),.8):Math.pow(Math.sin(Math.PI/2*(.995-t)/(.995-t1)),.75);};
  const vane=t=>-barbs(t)*box.room(t)*.93;
  const inner=t=>barbs(t)*box.out*.42;
  const left=figRibbon(spine,t=>vane(t)-shaft(t),steps),right=figRibbon(spine,t=>inner(t)+shaft(t),steps);
  const shaftL=figRibbon(spine,t=>-shaft(t),steps),shaftR=figRibbon(spine,shaft,steps);
  figInk(g,shaftL,rng,.6,.05,1.25,state.contourRgb,state.contourAlpha);figInk(g,shaftR,rng,.6,.05,1.25,state.contourRgb,state.contourAlpha);
  figInk(g,left,rng,1.1,.07,1.15,state.contourRgb,state.contourAlpha);figInk(g,right,rng,1,.09,1,state.contourRgb,state.contourAlpha);
  // Barbs, laid from the shaft out to the edge of each vane.
  for(let i=0;i<88;i++){
    const t=lerp(lerp(t0,t1,.42),.99,i/88),slant=.16;
    const o1=vane(t),o0=inner(t);
    if(o1<-1)figInk(g,[figAt(spine,t,-shaft(t)),figAt(spine,t-slant*.04,o1*(.82+rng()*.18))],rng,.4,0,.5,state.contourRgb,state.contourAlpha);
    if(o0>1)figInk(g,[figAt(spine,t,shaft(t)),figAt(spine,t-slant*.04,o0*(.82+rng()*.18))],rng,.4,0,.45,state.contourRgb,state.contourAlpha);
  }
  // The nib: two lines closing to a point at the bottom star, with its slit.
  const nib=t0;
  figInk(g,[figAt(spine,nib+.06,-3.4),figAt(spine,nib-.012,-.7)],rng,.4,0,1.1,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,nib+.06,3.4),figAt(spine,nib-.012,.7)],rng,.4,0,1.1,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,nib+.055,0),figAt(spine,nib-.01,0)],rng,.3,0,.6,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,nib+.062,-3.6),figAt(spine,nib+.062,3.6)],rng,.3,0,.7,state.contourRgb,state.contourAlpha);
  if(state.hatchFrac>0){figHatch(g,spine,vane,inner,Math.round(54*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>vane(t)-2,t=>inner(t)+2,26,rng,.8);
}
// A hanging lantern. The dome springs from the top star, the flame burns at the middle one and
// throws its light out past the rim, and the foot stands on the bottom star.
function figLantern(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,62),steps=56,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const dome=t=>clamp((t-t2)/Math.max(.001,(1-t2)*.62),0,1);
  const foot=t=>clamp((t0-t)/Math.max(.001,t0*.62),0,1);
  // A bellied lantern rather than a straight-sided box: the glass is fullest where the flame burns at
  // the middle star and draws in a little toward the sills on the outer two.
  const shell=t=>(t>t2?Math.max(0,Math.cos(dome(t)*Math.PI*.5)):t<t0?1+foot(t)*.24:1)*(.76+.24*box.mass(t));
  const glassIn=t=>-shell(t)*box.room(t)*.94,glassOut=t=>shell(t)*box.out*.94;
  const left=figRibbon(spine,glassIn,steps),right=figRibbon(spine,glassOut,steps);
  figInk(g,left,rng,.7,.06,1.4,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.7,.06,1.4,state.contourRgb,state.contourAlpha);
  // Corner posts, glazing bars and the sills at each star.
  for(const w of [glassIn,glassOut])figInk(g,figRibbon(spine,t=>w(t)-Math.sign(w(t))*4.5,steps),rng,.6,.16,.8,state.contourRgb,state.contourAlpha);
  for(const t of [t0,lerp(t0,t1,.5),t1,lerp(t1,t2,.5),t2]){
    figInk(g,[figAt(spine,t,glassIn(t)),figAt(spine,t,glassOut(t))],rng,.5,.06,t===t0||t===t2?1.5:.7,state.contourRgb,state.contourAlpha);
  }
  // The foot below and the ring above.
  const sill=Math.max(0,t0-t0*.62);
  figInk(g,[figAt(spine,sill,glassIn(sill)*1.12),figAt(spine,sill,glassOut(sill)*1.12)],rng,.5,0,1.6,state.contourRgb,state.contourAlpha);
  const hook=spine.at(clamp(t2+(1-t2)*.82,0,1));
  figInk(g,figArcPts(hook.x,hook.y,11,0,TAU,20),rng,.6,.06,1.3,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,t2+(1-t2)*.62,0),figAt(spine,t2+(1-t2)*.72,0)],rng,.4,0,1.4,state.contourRgb,state.contourAlpha);
  // The flame at the middle star, and the light it throws beyond the glass.
  for(let i=0;i<30;i++){
    const a=i/30*TAU,long=i%3===0,r0=p1.r+9,r1=r0+(long?26:13)+rng()*6;
    figInk(g,[{x:p1.x+Math.cos(a)*r0,y:p1.y+Math.sin(a)*r0},{x:p1.x+Math.cos(a)*r1,y:p1.y+Math.sin(a)*r1}],rng,.4,0,long?.7:.45,state.contourRgb,state.contourAlpha);
  }
  if(state.hatchFrac>0){figHatch(g,spine,glassIn,glassOut,Math.round(56*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>glassIn(t)-3,t=>glassOut(t)+3,26,rng,.85);
}
// A moth. The wings open either side of the middle star, the head and its feathered antennae are
// set on the top star, and the abdomen tapers away below the bottom one.
function figMoth(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,48),steps=72,[t0,t1,t2]=spine.stops,box=figBox(spine,p1),reach=Math.max(.001,Math.max(t1-t0,t2-t1));
  // The thorax stays on the spine, so the stars still run down the moth's back; it is the wings that
  // take the budget, each pair as wide as its own half of the sheet allows and each pinched halfway
  // out to part fore wing from hind.
  const cut=t=>1-.17*Math.pow(Math.sin(clamp((t-t1)/reach,-1,1)*Math.PI),2);
  const wingOut=t=>box.lat(t,.95)*cut(t),wingIn=t=>box.lat(t,-.95)*cut(t);
  const body=t=>t>t2?Math.max(1,7-(t-t2)*46):t<t0?Math.max(1,6.5-(t0-t)*30):6.5;
  const spanOut=t=>wingOut(t)+body(t),spanIn=t=>wingIn(t)-body(t);
  const left=figRibbon(spine,spanIn,steps),right=figRibbon(spine,spanOut,steps);
  const bodyL=figRibbon(spine,t=>-body(t),steps),bodyR=figRibbon(spine,body,steps);
  figInk(g,left,rng,.9,.05,1.3,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.9,.05,1.3,state.contourRgb,state.contourAlpha);
  figInk(g,bodyL,rng,.5,.08,1,state.contourRgb,state.contourAlpha);figInk(g,bodyR,rng,.5,.08,1,state.contourRgb,state.contourAlpha);
  // The seam between fore and hind wing, and the veins running out from the thorax.
  const edge=(t,o)=>o<0?spanIn(t):spanOut(t);
  for(const o of [-1,1]){
    figInk(g,[figAt(spine,t1,o*body(t1)),figAt(spine,t1-.012,edge(t1,o)*.96)],rng,.5,.06,.8,state.contourRgb,state.contourAlpha);
    for(let i=0;i<5;i++){
      const t=lerp(t1+.02,t2+.02,i/5),far=edge(t,o)*(.55+i*.08);
      if(Math.abs(far)>body(t)+3)figInk(g,[figAt(spine,t1+.005,o*body(t1)),figAt(spine,t,far)],rng,.6,.2,.5,state.contourRgb,state.contourAlpha);
    }
    for(let i=0;i<4;i++){
      const t=lerp(t0-.01,t1-.02,i/4),far=edge(t,o)*(.6+i*.07);
      if(Math.abs(far)>body(t)+3)figInk(g,[figAt(spine,t1-.01,o*body(t1)),figAt(spine,t,far)],rng,.6,.24,.45,state.contourRgb,state.contourAlpha);
    }
  }
  // An eyespot on each forewing.
  for(const o of [-1,1]){
    const t=lerp(t1,t2,.55),c=figAt(spine,t,edge(t,o)*.58);
    figInk(g,figArcPts(c.x,c.y,7.5,0,TAU,16),rng,.5,.08,.9,state.contourRgb,state.contourAlpha);
    figInk(g,figArcPts(c.x,c.y,3.4,0,TAU,12),rng,.4,.12,.6,state.contourRgb,state.contourAlpha);
  }
  // Body segments, then the head and its combed antennae on the top star.
  for(let i=0;i<12;i++){
    const t=lerp(t0-.05,t2-.01,i/12);
    figInk(g,[figAt(spine,t,-body(t)),figAt(spine,t,body(t))],rng,.35,.18,.5,state.contourRgb,state.contourAlpha);
  }
  for(const o of [-1,1]){
    const feel=[];for(let i=0;i<=12;i++){const u=i/12;feel.push(figAt(spine,lerp(t2+.005,1,u),o*(3+u*u*26)));}
    figInk(g,feel,rng,.5,.04,.85,state.contourRgb,state.contourAlpha);
    for(let i=2;i<12;i+=1){
      const p=feel[i],q=feel[i-1],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;
      figInk(g,[p,{x:p.x-dy/d*3.4*o,y:p.y+dx/d*3.4*o}],rng,.25,0,.4,state.contourRgb,state.contourAlpha);
    }
  }
  if(state.hatchFrac>0){
    figHatch(g,spine,spanIn,t=>-body(t),Math.round(34*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
    figHatch(g,spine,body,spanOut,Math.round(34*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
  }
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,bodyL,state);figWash(g,bodyR,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>spanIn(t)-2,t=>spanOut(t)+2,34,rng,.8);
}
// A placeholder for catalogue figures that have no engraving of their own yet: a broken
// contour joining the three stars, doubled as a hairline, with a small ornament at the
// middle star. It reads as an asterism on the plate without claiming to be a figure.
function figAsterism(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,30),steps=44;
  const swell=t=>3+Math.sin(Math.PI*clamp(t,0,1))*9;
  const left=figRibbon(spine,t=>-swell(t),steps),right=figRibbon(spine,swell,steps);
  g.strokeStyle=state.contour;
  figInk(g,left,rng,.8,.14,1.25,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.8,.14,1.25,state.contourRgb,state.contourAlpha);
  figInk(g,figRibbon(spine,()=>0,steps),rng,.6,.22,.7,state.contourRgb,state.contourAlpha);
  const mid=spine.at(.5);
  g.save();g.translate(mid.x+mid.px*(swell(.5)+11),mid.y+mid.py*(swell(.5)+11));g.rotate(Math.atan2(mid.ty,mid.tx));
  g.lineWidth=1.1;g.beginPath();g.arc(0,0,6.5,0,TAU);g.stroke();
  g.beginPath();g.moveTo(-10,0);g.lineTo(10,0);g.moveTo(0,-10);g.lineTo(0,10);g.stroke();g.restore();
  for(const q of [p0,p1,p2]){g.lineWidth=.9;g.beginPath();g.arc(q.x,q.y,q.r+13,-.5,.5);g.stroke();g.beginPath();g.arc(q.x,q.y,q.r+13,Math.PI-.5,Math.PI+.5);g.stroke();}
  if(state.hatchFrac>0){figHatch(g,spine,t=>-swell(t),swell,Math.round(34*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-swell(t)-3,t=>swell(t)+3,22,rng,.85);
}
// Every entry in the catalogue has its own engraving, looked up by name. figAsterism remains only
// as the last resort for a chart whose name this plate has never been cut for.
const FIGURE_SHAPES={
  'THE NEEDLE':figNeedle,'THE SAIL':figSail,'THE LYRE':figLyre,'THE CROWN':figCrown,
  'THE COMPASS':figCompass,'THE HOURGLASS':figHourglass,'THE SERPENT':figSerpent,'THE ARGO':figArgo,
  'THE ASTROLABE':figAstrolabe,'THE QUILL':figQuill,'THE LANTERN':figLantern,'THE MOTH':figMoth
};
const figureFor=chart=>FIGURE_SHAPES[chart&&chart.name]||FIGURE_SHAPES[CONSTELLATIONS[chart&&chart.catalogueIndex]&&CONSTELLATIONS[chart.catalogueIndex].name]||figAsterism;
function buildFigureLayer(chart,frame,count,curScale){
  const w=Math.max(1,Math.ceil(frame.w*curScale)),h=Math.max(1,Math.ceil(frame.h*curScale));
  const c=makeCanvas(w,h),g=c.getContext('2d');
  g.scale(curScale,curScale);g.translate(-frame.originX,-frame.originY);g.lineJoin='round';g.lineCap='round';
  const figureSeed=48200+((chart.catalogueIndex??chart.id)+chart.id*13)*104729,
    rng=seeded(figureSeed),pal=ink.figures,expired=chart.expired,fade=expired?.24:1;
  figStyle=figureStyle();
  // The contour earns its strength the way an engraver's own plate does: a first light cut, then the
  // same line gone over. An untouched chart is a faint construction line; a completed one has had its
  // outer edge struck a second time (see the completion re-strike in figWash, below).
  const contourA=((onPaper()?.34:.26)+(onPaper()?.20:.16)*(count/3))*fade*(figStyle.weight>1?1.1:.95),hatchA=(onPaper()?.17:.12)*fade,washA=onPaper()?.1:.07,
    handColour=renaissanceAtlas(),seen=chart.stars.filter(star=>star.visited&&star.impression),
    colourOffset=seen.length?seen.reduce((out,star)=>({x:out.x+star.impression.x/seen.length,y:out.y+star.impression.y/seen.length,rotation:out.rotation+star.impression.rotation/seen.length}),{x:0,y:0,rotation:0}):{x:0,y:0,rotation:0},
    colourRough=seen.length?seen.reduce((total,star)=>total+(star.impression.perfect?0:1-(star.impression.quality??1)),0)/seen.length:0;
  const state={contour:`rgba(${pal.contour},${contourA})`,style:figStyle,
    contourRgb:pal.contour,contourAlpha:contourA,hatchRgb:pal.hatch,hatchAlpha:hatchA,
    hatchFrac:expired?0:count/3,
    // Partial colour is earned by each visited star; completion permits the colourist to make one
    // final pass over all the figure's parts. The unprinted star signs and coordinate furniture
    // never enter this region list and remain black ink.
    handColour,colourRegions:[],colourStyle:figStyle.wash,colourSeed:(figureSeed^0x4c4f52)>>>0,
    colourOffset,colourRough,colourFrac:expired?0:Math.min(1,count/3),colourFull:!expired&&chart.completed,colourFade:fade,
    completed:!expired&&chart.completed,
    wash:handColour&&count>0||(!handColour&&!expired&&chart.completed)?`rgba(${pal.wash},${washA})`:null};
  const [p0,p1,p2]=chart.stars;
  figureFor(chart)(figPen(g,figStyle),p0,p1,p2,frame.side,rng,state);
  // All black engraving marks have now been laid. Only after that does the hand-colour pass touch the
  // pulled sheet, so a displaced patch reads as a brush stroke over ink with its own hand-drawn edge.
  paintHandColour(g,state);
  // Never let the ink cross the orbit rings, release marks, or the pricked guide around a star.
  g.save();g.globalCompositeOperation='destination-out';g.fillStyle='#000';
  for(const s of chart.stars){g.beginPath();g.arc(s.x,s.y,s.r+8,0,TAU);g.fill();}
  g.restore();
  return {canvas:c,count,completed:chart.completed,expired:chart.expired};
}
function drawConstellationFigure(chart){
  if(chart.stars.length<3)return;
  if(sy(chart.entry.y)<-190||sy(chart.stars[2].y)>H+210)return;
  const frame=figFrame(chart),count=chart.stars.filter(n=>n.visited).length;
  const bucket=Math.round(scale*20),key=chart.id+':'+plateName+':'+activeCosmetic('figures')+':'+frame.side+':'+bucket;
  let layer=figureLayers.get(key);
  if(!layer||layer.count!==count||layer.completed!==chart.completed||layer.expired!==chart.expired){
    if(figureLayers.size>10)figureLayers.clear();
    layer=buildFigureLayer(chart,frame,count,scale);figureLayers.set(key,layer);
  }
  const x=sx(frame.originX),y=sy(frame.originY);
  if(x>W||y>H||x+layer.canvas.width<0||y+layer.canvas.height<0)return;
  ctx.drawImage(layer.canvas,x,y);
}

function drawConstellations(){
  // The figure and the route through it are two different things, and only one of them is the atlas's
  // taste: an age that draws no constellation-figures at all still owes the player the line its stars
  // are strung along. So the seam is around the figure alone, and the route below is drawn either way.
  const figure=handFor('figure')||drawConstellationFigure;
  for(const chart of world.constellations){
    revealFigure(chart,figure);
    if(!chart.stars.length||sy(chart.entry.y)<-150||sy(chart.stars[chart.stars.length-1].y)>H+170)continue;
    const count=chart.stars.filter(n=>n.visited).length,points=[chart.entry,...chart.stars];if(chart.exit)points.push(chart.exit);
    ctx.save();revealChartClip(chart);ctx.lineWidth=.8*scale;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],lit=chart.completed||(a.visited&&b.visited),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
      const start=a.cap+10,end=b.cap+10,alpha=chart.expired?.065:lit?.55:.25;
      const ax=sx(a.x+dx/d*start),ay=sy(a.y+dy/d*start),bx=sx(b.x-dx/d*end),by=sy(b.y-dy/d*end);
      if(lit&&!chart.expired){
        ctx.setLineDash([]);engravedLine(ax,ay,bx,by,ink.marks.constellationLine,alpha,.8*scale,a.id*131+b.id);
      }else{
        ctx.strokeStyle=`rgba(${ink.marks.constellationLine},${alpha})`;ctx.setLineDash(lit?[]:[3*scale,7*scale]);
        ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    if(chart.completed){
      const first=chart.stars[0],last=chart.stars[2];ctx.strokeStyle=`rgba(${ink.marks.constellationComplete},${.16+Math.min(.22,chart.flash*.12)})`;ctx.lineWidth=.55*scale;
      ctx.beginPath();ctx.moveTo(sx(first.x),sy(first.y));ctx.lineTo(sx(last.x),sy(last.y));ctx.stroke();
    }
    // Renaissance stars are drawn at the node itself, where the orbit, point size and letter share one
    // observation clock. Later hands keep the older decorative marker until they claim their own form.
    if(!renaissanceAtlas())for(const n of chart.stars){
      const x=sx(n.x),y=sy(n.y)-(n.r+15)*scale;
      ctx.strokeStyle=`rgba(${ink.marks.constellationStar},${chart.expired?.2:n.visited?.9:.6})`;ctx.fillStyle=n.visited?ink.marks.constellationFillLit:ink.marks.constellationFillDark;ctx.lineWidth=.8;
      ctx.beginPath();
      for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=(i%2?1.4:4.8)*scale;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
      ctx.closePath();ctx.fill();ctx.stroke();
    }
    // The chart's name is engraved round the rim of its entry star for as long as the route is live —
    // in the atlas's own Latin, the way every other name on the plate is set (see CONSTELLATIONS in
    // simulation.js), with the vernacular kept only as the smaller gloss a two-register name always
    // gets on this sheet. `name` itself is never relettered here: it is still the ledger's own key.
    if(!chart.expired){
      const e=chart.entry,ex=sx(e.x),ey=sy(e.y),size=Math.max(8,9.5*scale);
      if(ey>-80&&ey<H+80&&!captionsHeld()){
        // The name is set round the top of the rim, and turns to the bottom of it — the same flip the node
        // captions make — when the star sits too near the top edge for the lettering to print inside the frame.
        const ring=e.r*scale+11*scale+size,inner=frameBand()*.92+8;
        const guard=Math.abs(ex-W*.5)<HUD_TEXT_HALF?Math.max(inner,hudBand()):inner,below=ey-ring-size<guard;
        const dir=below?Math.PI/2:-Math.PI/2,latin=CONSTELLATIONS[chart.catalogueIndex]&&CONSTELLATIONS[chart.catalogueIndex].latin;
        const alpha=chart.completed?.34:.52;
        ctx.save();ctx.translate(ex,ey);
        ctx.font=plateFace(size,'sc');
        ctx.fillStyle=`rgba(${ink.marks.constellationLabel},${alpha})`;
        textAlongArc(ctx,latin||chart.name,0,0,ring,dir,{align:'center',size,spacing:size*.24,inward:below});
        if(latin){
          const glossSize=size*.64,glossRing=ring+size*1.05;
          ctx.font=plateFace(glossSize,'text','italic');
          ctx.fillStyle=`rgba(${ink.marks.constellationCaption},${alpha*.85})`;
          textAlongArc(ctx,chart.name,0,0,glossRing,dir,{align:'center',size:glossSize,spacing:glossSize*.22,inward:below});
        }
        ctx.restore();
      }
    }
    // Progress toward the constellation is announced once, as permanent ink, by the "chartProgress" and
    // "constellation" inscriptions (see event() in ui.js) pinned to the star each capture happens at.
    // A second, live caption chasing whichever star is next would just repeat the same name in a
    // different place every frame — the name would seem to drift as the target moved from star to star.
    if(chart.completed&&chart.flash>0&&!chart.expired&&!plainPlate()&&!captionsHeld()){
      const label=chart.stars[2];
      // The caption rides above its star, flips below it and clears the HUD band exactly as a node caption does.
      const x=clamp(sx(label.x),20,W-20),star=sy(label.y),r=label.r*scale;
      const y=star+captionOffset(sx(label.x),star,r,46*scale);
      ctx.textAlign=label.x>0?'right':'left';ctx.font=plateFace(14);ctx.fillStyle=`rgba(${ink.marks.constellationLabel},.8)`;ctx.fillText(chart.name,x,y);
      ctx.font=plateFace(13,'sc');ctx.fillStyle=`rgba(${ink.marks.constellationCaption},.78)`;ctx.fillText('COMPLETE · +60',x,y+16);
    }
    // Skipped where the node already carries the early-run "NEXT" caption (see drawNode in figures.js):
    // the wide-orbit hint sits on the same main-line node right after a constellation's entry, and the
    // two captions would otherwise print on top of each other.
    const nextCaptioned=world.captures<2&&chart.main[0]&&chart.main[0].row===Math.floor(world.progress)+1;
    if(world.player.node===chart.entry&&chart.main[0]&&!nextCaptioned&&!plainPlate()&&!captionsHeld()){
      const n=chart.main[0];ctx.textAlign='center';ctx.font=plateFace(13,'sc');ctx.fillStyle=`rgba(${ink.marks.constellationHint},.66)`;ctx.fillText('WIDE ORBITS',sx(n.x),sy(n.y)-(n.r+26)*scale);
    }
    ctx.restore();
  }
}
// How far either side of the middle the DOM HUD's centre column — the score, the pace and the flow — can
// reach. A caption printed inside it has to keep below the whole HUD band rather than merely inside the frame.
const HUD_TEXT_HALF=150;
// The frontispiece is its own leaf: while the run is still to be dealt, the chart beneath it is printed
// without a caption on it, so nothing the pen would letter can show through the title cartouche.
const captionsHeld=()=>world.state==='ready';
// Captions ride above their planet, but flip underneath it when the node sits so high that the text would
// cross the frame's inner rule or run into the DOM score block in the middle of the HUD band — or when the
// chapter name is lettered at that same height, as it is over the middle of the three opening targets.
// Returns the y offset in node-local coordinates, where 0 is the planet's centre.
function captionOffset(x,y,r,gap){
  const inner=frameBand()*.92+8,guard=Math.abs(x-W*.5)<HUD_TEXT_HALF?Math.max(inner,hudBand()):inner;
  const band=revealBand(),nearBand=band&&Math.abs(x-W*.5)<W*.45,above=-(r+gap);
  if(y+above>=guard&&!(nearBand&&y+above>band.top-12&&y+above<band.bottom+12))return above;
  let below=Math.max(r+gap+3,guard+12-y);
  if(nearBand&&y+below>band.top&&y+below<band.bottom+12)below=band.bottom+12-y;
  return below;
}
// The halo behind a planet. It used to be a radial gradient built per node and rasterised over a box
// four planet-diameters across, every frame — and, because the held orbit's radius changes constantly,
// the gradient behind the active planet was rebuilt on every single frame as well. The falloff does
// not depend on the radius, only on the plate and whether the orbit is held, so it is baked once into
// a small sprite and blitted at whatever size the planet needs: the same halo, as a plain copy rather
// than a screenful of gradient evaluation.
const glowSprites=new Map();
function nodeGlow(rgb,active,paper){
  const key=plateName+'|'+(active?1:0)+'|'+(paper?'-':rgb);
  const cached=glowSprites.get(key);if(cached!==undefined)return cached;
  const size=192,c=makeCanvas(size,size),g=c&&c.getContext?c.getContext('2d'):null;
  if(!g||!g.createRadialGradient){glowSprites.set(key,null);return null;}
  g.setTransform(size/2,0,0,size/2,size/2,size/2);
  // Ink does not glow: the night gradient is a coloured light bloom, the paper one a pale halo of raised, worn paper.
  const glow=g.createRadialGradient(0,0,.2/2.1,0,0,1);
  if(paper){glow.addColorStop(0,`rgba(${ink.base.paperRgb},${active?.55:.2})`);glow.addColorStop(1,`rgba(${ink.base.paperRgb},0)`);}
  else{glow.addColorStop(0,`rgba(${rgb},${active?.07:.026})`);glow.addColorStop(1,`rgba(${rgb},0)`);}
  g.fillStyle=glow;g.fillRect(-1,-1,2,2);
  glowSprites.set(key,c);
  if(glowSprites.size>24)glowSprites.delete(glowSprites.keys().next().value);
  return c;
}
// ---------- The device a body off the main line is engraved with ----------
// A charge is not read by its colour. A pale blue disc and a violet one are the same mark at arm's length,
// and by the time the caption lettered beside one is legible the fork it hangs off is already behind the
// traveller — so each of them wears the device of the thing it actually does, cut in the same burin as
// everything else on the sheet. Sobieski's shield for the charge that turns a lethal hazard aside; the
// geometer's own figure of a line thrown back from a bound for the one that turns the traveller in from
// the margin; a sun coming up out of the flood for the one that drives the rising dark back down the
// sheet; and, for the inkwell, the pot itself with a nib dipped into it.
// Every one of them rides the pen reaching the page rather than the observation clock, exactly as the
// slingshot's charge band and every caption do: what a body will give the run is the whole reason to leave
// the main line for it, so it is owed to the player before the orbit is taken rather than after.
// The devices are cut once each into a small sprite — the geometry is fixed against the orbit's own radius,
// so one impression is blitted at whatever size the node is drawn at, exactly as the halo behind it is.
const DEVICE_UNITS=64,DEVICE_PX=160,deviceSprites=new Map();
function deviceLine(g,pts,rgb,alpha,weight,seed,closed){
  for(let i=0;i<pts.length-(closed?0:1);i++){
    const a=pts[i],b=pts[(i+1)%pts.length];
    burinSegment(g,a[0],a[1],b[0],b[1],rgb,alpha,weight,(seed+i*7919)>>>0,{segments:5,hair:false,wobble:.45});
  }
}
// Hatching, as this plate always lays it: parallel strokes running down and to the right, never crossed.
function deviceHatch(g,x,y,count,step,length,rgb,alpha,seed){
  for(let i=0;i<count;i++)burinSegment(g,x+i*step,y+i*step*.5,x+i*step+length*.62,y+i*step*.5+length,rgb,alpha,1,(seed+i*104729)>>>0,{segments:3,hair:false,wobble:.3});
}
function chargeDevice(kind,rgb){
  const key=plateName+'|'+kind+'|'+rgb;
  const held=deviceSprites.get(key);if(held!==undefined)return held;
  const c=makeCanvas(DEVICE_PX,DEVICE_PX),g=c&&c.getContext?c.getContext('2d'):null;
  if(!g){deviceSprites.set(key,null);return null;}
  const unit=DEVICE_PX/(DEVICE_UNITS*2);g.setTransform(unit,0,0,unit,DEVICE_PX/2,DEVICE_PX/2);
  const strong=onPaper()?.86:.72,faint=onPaper()?.4:.32;
  if(kind==='shield'){
    // The escutcheon Hevelius cut for Scutum Sobiescianum: flat across the chief, the flanks falling to
    // a point, and the second, fainter pass inside it where the hand went round twice.
    const face=[[-29,-27],[0,-31],[29,-27],[30,-6],[26,12],[14,29],[0,41],[-14,29],[-26,12],[-30,-6]];
    deviceLine(g,face,rgb,strong,2.4,0x5c07,true);
    deviceLine(g,face.map(([x,y])=>[x*.8,y*.8]),rgb,faint,1,0x5c31,true);
    deviceHatch(g,13,-2,4,4.4,13,rgb,faint,0x5c59);
  }else if(kind==='reflector'){
    // The bound at the right, ruled twice and hatched outward as the plate rules its own margin, and a
    // line coming in at it, turning, and leaving again.
    deviceLine(g,[[34,-33],[34,33]],rgb,strong,2.2,0x7a11);
    deviceLine(g,[[38,-27],[38,27]],rgb,faint,1,0x7a29);
    for(let i=0;i<5;i++)burinSegment(g,39,-22+i*11,46,-18+i*11,rgb,faint,1,(0x7a41+i*7919)>>>0,{segments:3,hair:false,wobble:.3});
    // The two lines are laid to straddle the body rather than to run over it: the specimen stands in the
    // mouth of the V, which is also where the flight it stands for would actually have been turned.
    deviceLine(g,[[-40,38],[31,10]],rgb,strong,2.2,0x7a53);
    deviceLine(g,[[31,10],[-40,-32]],rgb,strong,2.2,0x7a67);
    // The head of the departing line, cut as an open chevron rather than filled: the plate has no solid
    // arrowheads on it anywhere else.
    deviceLine(g,[[-27,-31],[-40,-32],[-33,-22]],rgb,strong,1.8,0x7a79);
  }else if(kind==='inkwell'){
    // The pot in profile, cut wide enough that the specimen stands inside the belly rather than over the
    // line of it: the body is the ink, and the rim it is filled to is the mouth. A nib dips in from the
    // right, since a well is only a well because something is dipped into it.
    burinArc(g,0,-19,27,0,TAU,rgb,strong,1.8,0x1b03,{flatten:.3,segments:40,skips:4});
    burinArc(g,0,-19,21,0,TAU,rgb,faint,1,0x1b0d,{flatten:.3,segments:30,skips:5});
    deviceLine(g,[[-27,-19],[-32,5],[-22,30],[0,37],[22,30],[32,5],[27,-19]],rgb,strong,2.4,0x1b17);
    deviceHatch(g,15,4,4,4.4,13,rgb,faint,0x1b2f);
    deviceLine(g,[[47,-42],[13,-23]],rgb,strong,1.8,0x1b43);
    deviceLine(g,[[20,-32],[13,-23],[22,-21]],rgb,strong,1.4,0x1b57);
  }else if(kind==='dawn'){
    // A sun coming up out of the flood: the waterline ruled across the sheet with the ink standing under
    // it, and the spokes thrown off the disc above it — long and short alternately, the way the first
    // magnitude is punched, and struck from outside the body so the light leaves the specimen rather
    // than being drawn on it.
    for(let i=0;i<11;i++){
      const a=Math.PI+.16+i*(Math.PI-.32)/10,long=i%2===0,from=22,to=long?46:34;
      burinSegment(g,Math.cos(a)*from,Math.sin(a)*from,Math.cos(a)*to,Math.sin(a)*to,rgb,long?strong:faint+.14,long?2:1.2,(0x3d11+i*7919)>>>0,{segments:3,hair:false,wobble:.3});
    }
    deviceLine(g,[[-46,19],[46,19]],rgb,strong,2.4,0x3d67);
    deviceLine(g,[[-38,25],[38,25]],rgb,faint,1,0x3d79);
  }
  deviceSprites.set(key,c);
  if(deviceSprites.size>16)deviceSprites.delete(deviceSprites.keys().next().value);
  return c;
}
// An engraver's register mark — the small cross-struck-through-a-circle punched at a plate's rim so a
// second pull lines up against the first — standing in for a release point, at a third of the ink a
// plain arc took. A perfect release doubles it: a smaller inner circle and a diagonal cross laid over
// the first, cut at a heavier weight, the way a printer struck the one mark that really mattered twice.
function registerMark(px,py,rgb,alpha,doubled){
  const rad=(doubled?3.2:2.6)*scale,arm=rad+1.6*scale,weight=Math.min((doubled?1.3:.75)*scale,1.4*scale);
  ctx.save();ctx.translate(px,py);ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=weight;
  ctx.beginPath();ctx.arc(0,0,rad,0,TAU);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-arm,0);ctx.lineTo(arm,0);ctx.moveTo(0,-arm);ctx.lineTo(0,arm);ctx.stroke();
  if(doubled){
    ctx.beginPath();ctx.arc(0,0,rad*.55,0,TAU);ctx.stroke();
    const d=arm*.7;
    ctx.beginPath();ctx.moveTo(-d,-d);ctx.lineTo(d,d);ctx.moveTo(-d,d);ctx.lineTo(d,-d);ctx.stroke();
  }
  ctx.restore();
}
function drawChargeDevice(kind,r,rgb,pen){
  if(pen.ring<=0)return;
  const sprite=chargeDevice(kind,rgb);if(!sprite)return;
  const reach=r*DEVICE_UNITS/60;
  ctx.save();ctx.globalAlpha*=Math.min(1,pen.ring*1.4);
  ctx.drawImage(sprite,-reach,-reach,reach*2,reach*2);
  ctx.restore();
}
function drawNode(n,aim){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('node');if(own)return own(n,aim);
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=aim&&aim.n.id===n.id;
  const x=sx(n.x),y=sy(n.y),r=(active?p.rad:n.r)*scale;
  if(y<-r*2||y>H+r*2)return;
  // The pen has to have reached this planet before any of it is on the page.
  const pen=revealNode(n),struck=used?revealRetire(n):0;
  if(pen.t<=0)return;
  const gold=n.type==='gold',renaissanceStar=n.routeRole==='star'&&renaissanceAtlas(),drift=n.type==='drift',fading=n.type==='fading',sling=n.type==='sling',shield=n.type==='shield';
  const reflector=n.type==='reflector',inkwell=n.type==='inkwell',dawn=n.type==='dawn';
  // The two outer pressures carry their own coloured ink — a verdant, friendly accent for the
  // gentlest choice and a rubrication red for the fiercest — while the middle target keeps the
  // plate's ordinary ink, reading as the plain, unmarked choice between the two.
  const rgb=n.difficultyChoice==='relaxed'?ink.marks.nodeRelaxed:n.difficultyChoice==='hardcore'?ink.marks.nodeHardcore:drift?ink.marks.nodeDrift:fading?ink.marks.nodeFading:gold?ink.marks.nodeGold:shield?ink.marks.nodeShield:reflector?ink.marks.nodeReflector:inkwell?ink.marks.nodeInkwell:dawn?ink.marks.nodeDawn:sling?ink.marks.slingFill:ink.marks.node;
  ctx.save();ctx.translate(x,y);
  if(world.state==='ready'&&n.row>1)ctx.globalAlpha=.35;
  // A used orbit is struck through, not simply dimmed (README's own line on it): floored at .75 rather
  // than .2, so the diagonal strike below carries the spent reading on its own instead of the whole
  // composite being crushed down to a fifth of its ink, against the sheet's own rule that ink never fades.
  if(used)ctx.globalAlpha=lerp(.62,.75,struck);
  const paper=onPaper();
  const halo=nodeGlow(rgb,active,paper);
  if(halo)ctx.drawImage(halo,-r*2.1,-r*2.1,r*4.2,r*4.2);
  else{
    const glow=ctx.createRadialGradient(0,0,r*.2,0,0,r*2.1);
    if(paper){glow.addColorStop(0,`rgba(${ink.base.paperRgb},${active?.55:.2})`);glow.addColorStop(1,`rgba(${ink.base.paperRgb},0)`);}
    else{glow.addColorStop(0,`rgba(${rgb},${active?.07:.026})`);glow.addColorStop(1,`rgba(${rgb},0)`);}
    ctx.fillStyle=glow;ctx.fillRect(-r*2.1,-r*2.1,r*4.2,r*4.2);
  }
  if(renaissanceStar)revealRenaissanceStar(n,pen,rgb);
  else if(sling)revealNova(n,pen,rgb);
  else revealPlanet(glyph(n.seed,n.type,n.row,world.seed,n.difficultyChoice),n.r*scale,world.time,pen,n.seed,n.impression);
  // The star's charge band is planning information, not depiction: the pilot reads the filling arc to
  // know when the lap is paid for. It therefore rides the pen reaching the page, as it always did, and
  // not the observation clock, which would hold back the first two fifths of a fill the release depends on.
  if(sling&&pen.ring>0){
    // A graduated limb, not a dial that lights: eighteen radial ticks off a faint guide ring, each
    // growing in length and weight as the charge reaches it, the way a real instrument's rim is read.
    const charge=active?world.charge():0,band=r*.73,wMax=cut('bold');
    ctx.strokeStyle=`rgba(${ink.marks.slingRing},.2)`;ctx.lineWidth=cut('fine');ctx.beginPath();ctx.arc(0,0,band,0,TAU);ctx.stroke();
    for(let i=0;i<18;i++){
      const a=-Math.PI/2+i*TAU/18,cx=Math.cos(a),sn=Math.sin(a),fill=clamp(charge*18-i,0,1);
      ctx.strokeStyle=`rgba(${ink.marks.slingRing},.4)`;ctx.lineWidth=cut('fine');
      ctx.beginPath();ctx.moveTo(cx*band,sn*band);ctx.lineTo(cx*(band+2.2*scale),sn*(band+2.2*scale));ctx.stroke();
      if(fill>0){
        const len=lerp(2.2,6.4,fill)*scale;
        ctx.strokeStyle=`rgba(${ink.marks.slingFill},.92)`;ctx.lineWidth=Math.min(lerp(.55,1.3,fill)*scale,wMax);
        ctx.beginPath();ctx.moveTo(cx*band,sn*band);ctx.lineTo(cx*(band+len),sn*(band+len));ctx.stroke();
      }
    }
    for(const a of [0,Math.PI]){
      ctx.save();ctx.rotate(a);ctx.strokeStyle=`rgba(${ink.marks.slingNotch},.6)`;ctx.lineWidth=cut('line');ctx.beginPath();ctx.moveTo(band-3,-3);ctx.lineTo(band,1);ctx.lineTo(band+3,-3);ctx.stroke();ctx.restore();
    }
    if(!used&&!captionsHeld()){
      ctx.textAlign='center';ctx.font=plateFace(13,'sc');ctx.fillStyle=`rgba(${ink.marks.slingLabel},.82)`;
      const pace=world.speedMultiplier().toFixed(1);
      const caption=active?(p.speed>=MAX_SPEED?'MAX SPEED  ·  ×'+pace:charge>=1?'SPEED HELD  ·  ×'+pace:'BUILDING SPEED  ·  ×'+pace):'SLINGSHOT STAR';
      // The caption for the orbit being held is always set below the planet, where it cannot cover the
      // release marks; when the star is high enough that below is still inside the HUD band, it is pushed
      // clear of the band instead.
      let dy=active?r+28*scale:captionOffset(x,y,r,25*scale);
      if(active&&Math.abs(x-W*.5)<HUD_TEXT_HALF&&y+dy<hudBand()+12)dy=hudBand()+12-y;
      writeText(ctx,caption,0,dy,revealLabel(pen,caption),{size:13});
    }
  }
  if(shield||reflector||inkwell||dawn)drawChargeDevice(n.type,r,rgb,pen);
  const wedged=penWedgeBegin(pen,n,Math.max(r,n.cap*scale)*2+30);
  {
    const ring=engravedRing(r,rgb,active?.59:target?.57:.25,cut('line'),n.seed,!active&&!n.visited);
    const fit=ring.size*(ring.radius>0?r/ring.radius:1);
    ctx.drawImage(ring.canvas,-fit/2,-fit/2,fit,fit);
  }
  ctx.lineWidth=cut('fine');ctx.strokeStyle=`rgba(${rgb},.19)`;ctx.beginPath();ctx.arc(0,0,r-2.5*scale,n.phase,n.phase+TAU*.78);ctx.stroke();
  ctx.strokeStyle=`rgba(${rgb},${target?.36:.11})`;ctx.setLineDash([1*scale,5*scale]);ctx.beginPath();ctx.arc(0,0,n.cap*scale,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.lineWidth=cut('fine');ctx.strokeStyle=paper?`rgba(${ink.base.ink},.4)`:`rgba(${rgb},.16)`;ctx.beginPath();
  for(let i=0;i<48;i++){
    if(i%4===0)continue;
    const a=i/48*TAU;ctx.moveTo(Math.cos(a)*(r+3*scale),Math.sin(a)*(r+3*scale));ctx.lineTo(Math.cos(a)*(r+4.2*scale),Math.sin(a)*(r+4.2*scale));
  }
  ctx.stroke();
  ctx.strokeStyle=paper?`rgba(${ink.base.inkStrong},.6)`:`rgba(${rgb},.37)`;ctx.beginPath();
  for(let i=0;i<48;i+=4){
    const a=i/48*TAU;ctx.moveTo(Math.cos(a)*(r+3*scale),Math.sin(a)*(r+3*scale));ctx.lineTo(Math.cos(a)*(r+6.2*scale),Math.sin(a)*(r+6.2*scale));
  }
  ctx.stroke();
  if(wedged)penWedgeEnd(pen,n,r);
  if(used)penStrike(n,r,struck,rgb);
  // A Latin caption engraved round the outer rim of every fourth main orbit, set in small caps at a
  // whisper — the sheet reads better with fewer of them, and fainter. It is printed only on orbits the
  // player is not holding, so it can never cross the release marks, the perfect window, or the fading
  // ring, which are drawn on the current orbit alone.
  if(!active&&!sling&&!gold&&!shield&&!reflector&&!inkwell&&!dawn&&n.row>0&&n.row%4===0&&r>15&&!captionsHeld()){
    const word=RIM_CAPTIONS[(n.seed+n.row)%RIM_CAPTIONS.length],size=Math.max(6.5,7.4*scale);
    ctx.font=plateFace(size,'sc');
    ctx.fillStyle=paper?`rgba(${ink.base.ink},.22)`:`rgba(${rgb},.15)`;
    textAlongArc(ctx,word,0,0,r+11*scale+size,Math.PI/2,{align:'center',size,spacing:size*.2,inward:true});
  }
  if(active){
    for(const next of releaseTargets(n)){
      const d=Math.hypot(next.x-n.x,next.y-n.y),a=Math.atan2(next.y-n.y,next.x-n.x)-p.dir*Math.acos(clamp(p.rad/d,-1,1)),window=Math.asin(clamp(next.cap/d,0,.8));
      ctx.strokeStyle=next.routeRole==='star'||(sling&&next.id===n.shortcutId)?`rgba(${ink.marks.releaseWindowStar},.35)`:`rgba(${ink.marks.releaseWindowPlain},.24)`;ctx.lineWidth=cut('bold');ctx.beginPath();ctx.arc(0,0,r,a-window,a+window);ctx.stroke();
      for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
        if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
        registerMark(Math.cos(path.angle)*r,Math.sin(path.angle)*r,ink.marks.releaseMark,.85,false);
      }
    }
    if(world.flightPreview?.curved&&aim?.perfect){
      registerMark(Math.cos(p.angle)*r,Math.sin(p.angle)*r,ink.marks.perfectPreview,.98,true);
    }
    // A fading orbit visibly unravels in less than two revolutions.
    if(fading){const left=clamp(1-p.orbitTime/4.5,0,1);ctx.strokeStyle=left<.3?ink.marks.fadingCritical:ink.marks.fadingWarn;ctx.lineWidth=cut('bold');ctx.beginPath();ctx.arc(0,0,r+9*scale,-Math.PI/2,-Math.PI/2+TAU*left);ctx.stroke();}
  }
  if(target){
    // Fixed on the entry bearing rather than spinning: the arc's alpha carries the arrival quality
    // the player is actually flying toward, the same continuous read arrivalQuality gives the score.
    const quality=clamp((aim.angle-GRAZE_MINIMUM)/(90-GRAZE_MINIMUM),0,1);
    ctx.strokeStyle=`rgba(${rgb},${lerp(.3,.76,quality)})`;ctx.lineWidth=cut('bold');ctx.beginPath();ctx.arc(0,0,n.cap*scale+4,aim.entryAngle-.42,aim.entryAngle+.42);ctx.stroke();
    if(aim.perfect){
      ctx.strokeStyle=`rgba(${ink.marks.perfectTarget},.8)`;ctx.lineWidth=cut('bold');ctx.beginPath();ctx.arc(0,0,r,aim.entryAngle-.18,aim.entryAngle+.18);ctx.stroke();
    }
  }
  if(!used&&!captionsHeld()&&!renaissanceStar){
    // The slot is split by kind, not left to one face for all four: a named thing (a power-up, or the
    // gold node's own Aurum) is set the way every other proper name on the plate is, in small caps; a
    // plain row number stays in the sheet's ordinary text face; and the one deliberate English word on
    // the chart, INK, is set in the same italic gloss every other aside on the sheet uses.
    const size=Math.max(9,10*scale),named=gold||shield||reflector||dawn;
    ctx.font=inkwell?plateFace(size,'text','italic'):named?plateFace(size,'sc'):plateFace(size);
    ctx.textAlign='left';ctx.fillStyle=paper?`rgba(${ink.base.ink},.72)`:`rgba(${rgb},.48)`;
    const mark=gold?'AURUM':shield?POWERUP_LABELS.shield:reflector?POWERUP_LABELS.reflector:dawn?POWERUP_LABELS.dawn:inkwell?'INK':String(Math.floor(n.row)+1);
    writeText(ctx,mark,r+12*scale,4*scale,revealLabel(pen,mark),{size});
    if(drift){const dy=captionOffset(x,y,r,15),up=dy<0?1:-1;ctx.beginPath();ctx.strokeStyle=`rgba(${rgb},.45)`;ctx.lineWidth=cut('line');ctx.moveTo(-9,dy);ctx.bezierCurveTo(-3,dy-8*up,3,dy+8*up,9,dy);ctx.stroke();}
    // A difficulty node takes the "next" caption's spot, centred so it never runs off either
    // edge, and names the pressure it sets instead of just marking the node as reachable. A
    // sling star keeps its own name in that same spot instead (see above): the first main-line
    // star is always row 2, so without this the two captions would print on top of each other.
    if(world.captures<2&&!active&&!sling&&n.row===Math.floor(world.progress)+1){
      const label=n.difficultyChoice?DIFFICULTY_LABELS[n.difficultyChoice]:'NEXT';
      ctx.textAlign='center';ctx.font=plateFace(Math.max(9,9*scale),'sc');ctx.fillStyle=paper?`rgba(${ink.base.ink},.75)`:`rgba(${ink.marks.next},.6)`;writeText(ctx,label,0,captionOffset(x,y,r,24*scale),revealLabel(pen,label),{size:Math.max(9,9*scale)});
    }
  }
  if(renaissanceStar&&!captionsHeld())drawRenaissanceStarLetter(n,renaissanceStarObservation(n),rgb);
  ctx.restore();
}
// How far the innermost band of a vortex's field is wound about its eye, in radians. The bands
// between it and the rim take a share of this by the square of how deep they lie, so the sheet is
// only just off true where the field begins and fully caught by the time it reaches the dark.
// Both numbers here are bounded by the same artefact rather than by taste: the bands are discrete,
// so where two of them meet, the sheet is displaced by the difference in their turn times the
// radius they meet at, and past about this much winding that seam shows as a step in any orbit ring
// crossing the field. A square profile spreads the difference evenly over the bands where a cube
// piles it into the few nearest the eye, and 0.62 radians is what those sixteen bands will carry
// without the step being visible on a ring drawn through them.
const SWIRL_TURN=0.62;
function drawGravitationalLenses(){
  for(const h of world.hazards){
    if(h.kind&&h.kind!=='vortex')continue;
    const x=sx(h.x),y=sy(h.y),outer=gravityRadius(h)*scale,inner=(h.r+1)*scale,diameter=outer*2;
    if(x+outer<0||x-outer>W||y+outer<0||y-outer>H)continue;
    if(!lensPatch)lensPatch=makeCanvas(640,640);
    const g=lensPatch.getContext('2d'),left=x-outer,top=y-outer;
    const sourceX=Math.max(0,left*DPR),sourceY=Math.max(0,top*DPR);
    const sourceRight=Math.min(canvas.width,(x+outer)*DPR),sourceBottom=Math.min(canvas.height,(y+outer)*DPR);
    const sw=sourceRight-sourceX,sh=sourceBottom-sourceY;if(sw<=0||sh<=0)continue;
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,640,640);
    g.drawImage(canvas,sourceX,sourceY,sw,sh,(sourceX/DPR-left)/diameter*640,(sourceY/DPR-top)/diameter*640,sw/(DPR*diameter)*640,sh/(DPR*diameter)*640);
    // Resample the actual atlas and starlight in clipped annuli. What the bands carry is a whirl
    // rather than the outward stretch a lens would give: each annulus is turned further about the
    // dark eye than the one outside it, so the sheet itself appears wound into the vortex, and the
    // winding reaches zero at the field's edge, where the chart stands square again. Foreground
    // targets and the player are drawn above this and stay sharp.
    const drift=reducedMotion?0:Math.sin(world.time*.32+(h.phase||0))*.05;
    ctx.save();ctx.translate(x,y);
    // Each band costs a clip (the one genuinely expensive Canvas2D call here) plus a rotate, scale
    // and drawImage, every frame this vortex is on screen. The whirl spans about six tenths of a
    // radian across the whole radius, which is as much as this many bands will carry without seaming,
    // so a coarser count is not merely invisible but the thing that sets the winding; scale it down
    // for a small or distant vortex, where it matters least, and cap it under the old fixed 24.
    const bands=Math.max(10,Math.min(16,Math.round(outer/6)));
    for(let band=0;band<bands;band++){
      const a=band/bands,b=(band+1)/bands,ro=lerp(outer,inner,a),ri=lerp(outer,inner,b);
      // Slack water at the rim, the turns tightening as they near the eye — but only as the square
      // of the depth, since a steeper profile piles the whole difference into the innermost bands,
      // where it shows as a seam rather than as a current.
      const mid=(a+b)/2,weight=mid*mid,whirl=SWIRL_TURN*weight;
      ctx.save();ctx.beginPath();ctx.arc(0,0,ro+.2,0,TAU);ctx.arc(0,0,ri,TAU,0,true);ctx.closePath();ctx.clip();
      ctx.rotate(whirl+drift*weight);ctx.scale(1+.34*weight,1+.34*weight);ctx.drawImage(lensPatch,-outer,-outer,diameter,diameter);ctx.restore();
    }
    ctx.restore();
  }
}
// Palettes for the two later hazard kinds. The black-hole colours above are untouched.
definePlate('field',{
  night:{flareCore:'244,222,168',flareRim:'226,178,112',flareRay:'223,166,109',flareEdge:'205,159,122',
    flareUmbra:'6,9,15',flarePenumbra:'214,163,110',fieldRing:'205,159,122',
    windLine:'196,206,214',windHead:'214,222,228',windShade:'150,166,180',
    fog:'202,214,220',fogEdge:'139,156,168'},
  paper:{flareCore:'176,118,38',flareRim:'150,100,32',flareRay:'160,84,52',flareEdge:'150,100,32',
    flareUmbra:'26,18,12',flarePenumbra:'140,86,44',fieldRing:'166,58,40',
    windLine:'70,54,38',windHead:'46,34,24',windShade:'96,78,56',
    fog:'116,94,66',fogEdge:'58,42,28'},
  // flareUmbra is not a colour, it is the absence of the sheet — the same reading hazardCore and the
  // rising dark's own void family already carry — but the automatic duotone lands night's near-black
  // raw value within three or four levels of these three plates' own tinted ground, since both sit at
  // the same dark end of the same luminance-only ramp. sink() reads it well clear of the ground instead.
  cellarius:{flareUmbra:sink('6,9,15','cellarius')},
  verdigris:{flareUmbra:sink('6,9,15','verdigris')},
  azzurra:{flareUmbra:sink('6,9,15','azzurra')}
});
// A sunspot in the Galileo manner: a dark body, a penumbra of fine radial strokes, and rays cut
// live. The body itself is not the round pool it once was: a vortex's void is a circle no matter
// how it is broken up, so a disc drawn the same way for the flare read as the same hazard at any
// distance the strokes around it are too faint to save. Cutting the body as a nine-point burst
// instead gives the two hazards a silhouette apart, readable in the same instant the eye would
// otherwise have to read ink colour or ray density to tell them. Everything that does not move is
// baked into a sprite; only the flare's rays are cut live.
const FLARE_SPIKES=9;
const flareSprites=new Map();
function flareSprite(seed,radius,core,phase){
  const rBucket=Math.round(radius),key=seed+':'+rBucket+':'+Math.round(core)+':'+(phase||0).toFixed(3)+':'+plateName+':'+DPR.toFixed(2);
  const cached=flareSprites.get(key);if(cached)return cached;
  const pad=Math.max(6,rBucket*.45),size=Math.max(4,Math.ceil((rBucket+pad)*2));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);g.lineCap='round';
  const p=ink.field,rng=seeded((seed>>>0)||1),r=rBucket,u=Math.max(1.5,core);
  // The penumbra: radial strokes, close-set and long where the spot is deepest.
  for(let i=0;i<108;i++){
    const a=i/108*TAU+rng()*.03,from=u*(.98+rng()*.06),to=r*(.82+rng()*.24);
    const bow=(rng()-.5)*.06;
    g.strokeStyle=`rgba(${p.flarePenumbra},${.1+rng()*.26})`;g.lineWidth=(i%3?.4:.7);
    g.beginPath();g.moveTo(Math.cos(a)*from,Math.sin(a)*from);
    g.quadraticCurveTo(Math.cos(a+bow)*(from+to)/2,Math.sin(a+bow)*(from+to)/2,Math.cos(a+bow*2)*to,Math.sin(a+bow*2)*to);
    g.stroke();
  }
  // Two broken contours, restored: the outer limb of the penumbra and the edge of the old round
  // umbra, both still true of the burst's own drawn radius r even though the body itself is no
  // longer a disc — these are the only marks that draw r, which the pricked field ring out in
  // drawFlare is measured from.
  burinArc(g,0,0,r,0,TAU,p.flareEdge,.34,.6,seed+7,{segments:34,skips:4});
  burinArc(g,0,0,r*.82,0,TAU,p.flareEdge,.2,.45,seed+13,{segments:26,skips:5});
  // The body: a burst rather than a disc, its points reaching out toward the drawn radius and its
  // notches held at (or just past) the lethal core radius u, each wobbled its own amount so it
  // reads engraved rather than stamped, and so the ink drawn never retreats inside the radius that
  // actually kills. The rim is struck along the same jagged path, not a circle around it.
  const tip=Math.max(u*1.45,r*.85),notch=u,verts=[];
  for(let i=0;i<FLARE_SPIKES*2;i++){
    const a=i/(FLARE_SPIKES*2)*TAU+rng()*.02+(phase||0)*.1,spike=i%2===0;
    const jr=spike?tip*(.9+rng()*.22):notch*(1+rng()*.08);
    verts.push([Math.cos(a)*jr,Math.sin(a)*jr]);
  }
  // Each edge is walked in a few sub-steps with a small perpendicular wobble rather than cut dead
  // straight, so the burst reads as an engraved outline rather than a bare polygon; the last sub-step
  // of every edge lands exactly on the vertex, so neighbouring edges still close without a seam.
  g.beginPath();
  for(let i=0;i<verts.length;i++){
    const [x0,y0]=verts[i],[x1,y1]=verts[(i+1)%verts.length];
    if(i===0)g.moveTo(x0,y0);
    const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,steps=3+(i%2);
    for(let s=1;s<=steps;s++){
      const t=s/steps,wob=s<steps?(rng()-.5)*len*.09:0;
      g.lineTo(x0+dx*t+nx*wob,y0+dy*t+ny*wob);
    }
  }
  g.closePath();g.fillStyle=`rgba(${p.flareUmbra},${onPaper()?.92:.96})`;g.fill();
  // The rim is not a smooth stroke: it is the one mark in the atlas that was, so it is cut the same
  // way as everything else, piece by piece along the burst's own 18 vertices, letting it skip and
  // swell exactly as a hand-engraved outline would.
  for(let i=0;i<verts.length;i++){
    const [x0,y0]=verts[i],[x1,y1]=verts[(i+1)%verts.length];
    burinSegment(g,x0,y0,x1,y1,p.flareRim,.75,.9,seed+31+i,{wobble:.5,hair:false});
  }
  for(let i=0;i<14;i++){const a=rng()*TAU,d=u*(1.05+rng()*.5);g.fillStyle=`rgba(${p.flarePenumbra},${.14+rng()*.3})`;g.fillRect(Math.cos(a)*d,Math.sin(a)*d,.8,.8);}
  // Two lesser spots of the same group, as the sunspot plates always show — set clear of the burst's
  // own jagged rim rather than landing on it, each cut by hand like everything else on the sheet: a
  // jittered landContour fill instead of a bare arc(), and a burin-struck penumbra ring instead of a
  // plain stroke.
  const burstRadiusAt=ang=>{
    const idx=((Math.round(ang/TAU*verts.length)%verts.length)+verts.length)%verts.length,[vx,vy]=verts[idx];
    return Math.hypot(vx,vy);
  };
  for(let i=0;i<2;i++){
    let a,d,tries=0;
    do{a=rng()*TAU;d=r*(1.05+rng()*.35);tries++;}while(d<burstRadiusAt(a)*1.15&&tries<8);
    const sr=u*(.14+rng()*.1),cx=Math.cos(a)*d,cy=Math.sin(a)*d;
    landContour(g,cx,cy,sr,sr,seeded(seed+61+i*7));g.fillStyle=`rgba(${p.flareUmbra},.75)`;g.fill();
    burinArc(g,cx,cy,sr*2.1,0,TAU,p.flarePenumbra,.35,.4,seed+71+i*7,{segments:12,skips:2});
  }
  const sprite={canvas:c,size};
  flareSprites.set(key,sprite);
  if(flareSprites.size>16)flareSprites.delete(flareSprites.keys().next().value);
  return sprite;
}
function drawFlare(h){
  const x=sx(h.x),y=sy(h.y),r=h.r*scale,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const c=ink.field,rng=seeded(h.seed),pulse=reducedMotion?1:.9+.1*Math.sin(world.time*1.6+(h.phase||0));
  ctx.save();ctx.translate(x,y);
  // The field is drawn as a dotted ring at its true radius, with small outward barbs: this hazard
  // pushes, and its ring is pricked, where a black hole's edge is cut solid.
  ctx.setLineDash([1.7*scale,4.4*scale]);
  ctx.strokeStyle=`rgba(${c.fieldRing},.3)`;ctx.lineWidth=.8*scale;
  ctx.beginPath();ctx.arc(0,0,reach,0,TAU);ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<8;i++){
    const a=i/8*TAU+(h.phase||0)*.2;
    ctx.strokeStyle=`rgba(${c.fieldRing},.32)`;ctx.lineWidth=.65*scale;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a-.035)*(reach-2.6*scale),Math.sin(a-.035)*(reach-2.6*scale));
    ctx.lineTo(Math.cos(a)*(reach+1.4*scale),Math.sin(a)*(reach+1.4*scale));
    ctx.lineTo(Math.cos(a+.035)*(reach-2.6*scale),Math.sin(a+.035)*(reach-2.6*scale));
    ctx.stroke();
  }
  // The flare: a breathing extension struck outward from each of the burst's own points, so the
  // one part of this mark cut live lines up with the jagged body baked into the sprite instead of
  // scattering a different rhythm of rays against it. The phase term that turns the burst's own
  // points is baked into the sprite itself (flareSprite) rather than reapplied here, so the two
  // agree exactly rather than drifting apart as h.phase differs hazard to hazard; the rays start at
  // the same tip radius the points themselves reach, extending them rather than piercing through.
  const u=Math.max(1.5,core),tip=Math.max(u*1.45,r*.85);
  for(let i=0;i<FLARE_SPIKES;i++){
    const a=i/FLARE_SPIKES*TAU+(h.phase||0)*.1,len=r*(.35+rng()*.45)*pulse;
    ctx.strokeStyle=`rgba(${c.flareRay},${(.22+rng()*.3)*pulse})`;ctx.lineWidth=(i%2?.7:1.1)*scale;
    ctx.beginPath();ctx.moveTo(Math.cos(a)*tip,Math.sin(a)*tip);ctx.lineTo(Math.cos(a)*(tip+len),Math.sin(a)*(tip+len));ctx.stroke();
  }
  const sprite=flareSprite(h.seed,r,core,h.phase);
  ctx.drawImage(sprite.canvas,-sprite.size/2,-sprite.size/2,sprite.size,sprite.size);
  ctx.restore();
}
// A wind-head, as every chart of the century puffs one from its margin: a cheek-blown profile set at
// the upwind edge of its own field, breathing a band clean across it. The head is the one hazard mark
// that has a direction, so it is cut blowing along +x and turned to h.dir where it is drawn — and its
// own bearing goes into the key, because the hatch inside it is laid in turned back by that same
// angle so the strokes still run down and to the right on the sheet. A gust keeps its bearing for
// life, so that is one sprite per wind-head and not one per angle it might have had. Nothing about
// the head or the pricked bounds of the stream moves, so those are baked; only the breath is cut
// live, so it can drift down the wind with the plate's own time.
const windSprites=new Map();
function windSprite(seed,radius,reach,dir){
  const rBucket=Math.round(radius),reachBucket=Math.round(reach);
  const key=seed+':'+rBucket+':'+reachBucket+':'+dir.toFixed(2)+':'+plateName+':'+DPR.toFixed(2)+':'+scale.toFixed(3);
  const cached=windSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil(reachBucket*2+8));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);g.lineCap='round';
  const p=ink.field,rng=seeded((seed>>>0)||1),head=rBucket*.62,hx=-reachBucket+head*1.25;
  // The bounds of the stream, pricked rather than ruled, opening from the mouth and closing again at
  // the field's edge: this is the wind's reach told the way the flare tells its own, and it is a leaf
  // rather than a ring because what it bounds blows one way instead of standing round a centre.
  g.setLineDash([1.7*scale,4.4*scale]);
  g.strokeStyle=`rgba(${p.windLine},.28)`;g.lineWidth=.75*scale;
  for(const side of [-1,1]){
    g.beginPath();g.moveTo(hx+head*.9,side*head*.3);
    g.quadraticCurveTo(0,side*rBucket*1.5,reachBucket,side*head*.35);g.stroke();
  }
  g.setLineDash([]);
  // The head in profile, facing the way it blows: skull, a cheek puffed round with the breath in it,
  // pursed lips, and the loose curls the engravers always gave these creatures.
  burinArc(g,hx,0,head,0,TAU,p.windHead,.6,.9*scale,seed+3,{segments:22,skips:2});
  burinArc(g,hx+head*.34,0,head*.72,-1.15,1.15,p.windHead,.5,.8*scale,seed+7,{segments:14,skips:1});
  for(let i=0;i<9;i++){
    const a=Math.PI*.45+i/9*Math.PI*1.1;
    burinSpiral(g,hx+Math.cos(a)*head*.96,Math.sin(a)*head*.96,head*.3,head*.06,a-1.1,a+2.1,p.windHead,.34,.6*scale,seed+i*13,{segments:7,skips:0});
  }
  // Closed eyes under heavy brows, ported from the frame's own wind-head (frameWindHead, frame.js) so
  // the two are cut by one engraver's hand rather than the frame's carrying a face this one goes without.
  for(const s of [-1,1]){
    burinArc(g,hx+head*.06,s*head*.3,head*.24,-1,.7,p.windHead,.6,.8*scale,seed+31+(s>0?1:0),{segments:5,skips:0});
    burinArc(g,hx+head*.02,s*head*.32,head*.34,-.8,.35,p.windHead,.39,.6*scale,seed+41+(s>0?1:0),{segments:4,skips:0});
    burinArc(g,hx+head*.34,s*head*.46,head*.42,-2.5,-.15,p.windHead,.48,.7*scale,seed+51+(s>0?1:0),{segments:6,skips:0});
  }
  // The shaded side is the one the light does not reach. The head is the one mark on the plate that
  // is turned to point somewhere, so its hatch is laid in turned back by the same angle: on the
  // sheet the strokes still run down and to the right, with the light still coming from the left,
  // exactly as every other body here is hatched, whichever way this one happens to be blowing.
  g.save();g.translate(hx,0);g.rotate(-dir);
  for(let i=0;i<12;i++){
    const t=i/11,ry=(t-.5)*1.7*head,run=Math.sqrt(Math.max(0,head*head-ry*ry));
    g.strokeStyle=`rgba(${p.windShade},${.1+rng()*.16})`;g.lineWidth=.5*scale;
    g.beginPath();g.moveTo(-run*.95,ry);g.lineTo(-run*.2,ry+head*.16);g.stroke();
  }
  g.restore();
  g.strokeStyle=`rgba(${p.windHead},.6)`;g.lineWidth=.9*scale;
  g.beginPath();g.arc(hx+head*1.02,0,head*.17,0,TAU);g.stroke();
  g.fillStyle=`rgba(${p.windHead},.42)`;g.beginPath();g.arc(hx+head*1.02,0,head*.08,0,TAU);g.fill();
  const sprite={canvas:c,size,head,hx};
  windSprites.set(key,sprite);
  if(windSprites.size>16)windSprites.delete(windSprites.keys().next().value);
  return sprite;
}
function drawWind(h){
  const x=sx(h.x),y=sy(h.y),r=h.r*scale,reach=gravityRadius(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const p=ink.field,rng=seeded(h.seed);
  ctx.save();ctx.translate(x,y);ctx.rotate(h.dir||0);
  const sprite=windSprite(h.seed,r,reach,h.dir||0);
  ctx.drawImage(sprite.canvas,-sprite.size/2,-sprite.size/2,sprite.size,sprite.size);
  // The breath: long tapering strokes leaving the lips and running the length of the field, each
  // waved a little and each drifting downwind, so the gust is read as moving even though what it
  // does to a flight is perfectly steady. Reduced motion holds them still, as it holds the flare's
  // rays and the vortex's twist.
  const start=sprite.hx+sprite.head*1.2,span=reach-start;
  ctx.lineCap='round';
  for(let i=0;i<7;i++){
    const lane=(i/6-.5),spread=r*1.15,wobble=1.5+rng()*1.6,phase=rng()*TAU;
    const travel=reducedMotion?0:world.time*.55+(h.phase||0);
    ctx.strokeStyle=`rgba(${p.windLine},${.13+rng()*.2})`;ctx.lineWidth=(i%2?.5:.8)*scale;
    ctx.beginPath();
    for(let j=0;j<=14;j++){
      const t=j/14,px=start+span*t;
      // The lane opens toward the middle of the stream and closes again at the edge, and the wave
      // travels along it rather than standing on it, so the breath streams instead of rippling.
      const py=lane*spread*(.45+Math.sin(t*Math.PI)*.85)+Math.sin(t*wobble*TAU+phase-travel)*r*.09;
      if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
// A nebula patch: a faint stippled haze, no more. There is no hatch and no fill; a sparse stipple
// thins to nothing well before the edge, and one broken contour is barely suggested inside it, so the
// cloud is noticed rather than looked at. It is baked once per patch and blitted, since nothing about
// it moves — it exists only to hide the chart, which the fogged guide ring says plainly enough.
const nebulaSprites=new Map();
function nebulaSprite(seed,radius){
  const rBucket=Math.round(radius/2)*2,key=seed+':'+rBucket+':'+plateName+':'+DPR.toFixed(2);
  const cached=nebulaSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil(rBucket*2.3));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);
  const p=ink.field,rng=seeded((seed>>>0)||1),r=Math.max(2,rBucket),paper=onPaper();
  const dots=Math.round(340+r*7);
  for(let i=0;i<dots;i++){
    // Drawn well inside the patch and faded off with the cube of the distance, so the stipple has no
    // edge of its own to read as a disc.
    const a=rng()*TAU,d=Math.pow(rng(),.8)*r*.92,fade=Math.pow(1-d/r,3);
    const wobble=1+Math.sin(a*3+seed)*.12;
    g.fillStyle=`rgba(${p.fog},${((paper?.02:.028)+rng()*(paper?.07:.1))*fade})`;
    g.fillRect(Math.cos(a)*d*wobble,Math.sin(a)*d*.82,.5+rng()*.45,.5+rng()*.4);
  }
  // One contour, mostly lifted: a suggestion of a boundary rather than a drawn one. Cut with the same
  // burin that engraves every other stroke on the plate, so the mist reads as ink and not a plotted curve.
  burinArc(g,0,0,r*.72,0,TAU,p.fogEdge,paper?.075:.055,.4,seed+31,{flatten:.82,segments:20,skips:9,wobble:.5});
  const sprite={canvas:c,size};
  nebulaSprites.set(key,sprite);
  if(nebulaSprites.size>10)nebulaSprites.delete(nebulaSprites.keys().next().value);
  return sprite;
}
function drawNebula(h){
  const x=sx(h.x),y=sy(h.y),r=h.r*scale;if(x+r*1.2<0||x-r*1.2>W||y+r<0||y-r>H)return;
  const sprite=nebulaSprite(h.seed,r);
  ctx.drawImage(sprite.canvas,x-sprite.size/2,y-sprite.size/2,sprite.size,sprite.size);
}
// The dark core, its edge, rim, faint arcs and outer glow depend only on h.seed and the plate —
// never on pull or the pulse — so, exactly like flareSprite and nebulaSprite above, they are cut
// once into a sprite instead of being replayed (including the paper core's own RNG-jittered edge)
// every single frame a hole is on screen.
const hazardCoreSprites=new Map();
function hazardCoreSprite(seed,radius){
  const rBucket=Math.round(radius),key=seed+':'+rBucket+':'+plateName+':'+DPR.toFixed(2);
  const cached=hazardCoreSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil((rBucket+18)*2));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);
  const rng=seeded(seed),r=rBucket;
  if(onPaper()){
    // A pooled ink blot, not a clean printed circle: the same wobbling quadratic contour the pools and
    // splats elsewhere are cut with (landContour, planets.js), filled short of opaque so the laid tile
    // still reads through it, with a coffee-ring struck twice more near its own rim — what a pool of
    // ink actually dries down to, the pigment deepest where the liquid last stood.
    landContour(g,0,0,r,r,rng);g.fillStyle=ink.marks.hazardCore;g.globalAlpha=.86;g.fill();g.globalAlpha=1;
    for(const [rr,rseed,a] of [[r*.94,seed+53,.7],[r,seed+59,.5]]){
      landContour(g,0,0,rr,rr,seeded(rseed));
      g.strokeStyle=ink.marks.hazardCore;g.globalAlpha=a;g.lineWidth=Math.max(.5,r*.05);g.stroke();
    }
    g.globalAlpha=1;
  }else{
    g.fillStyle=ink.marks.hazardCore;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();
  }
  burinArc(g,0,0,r,0,TAU,ink.marks.hazardEdge,.62,.85,seed+3,{segments:28,skips:2});
  burinArc(g,-.7,-.3,r,Math.PI*1.04,Math.PI*1.82,ink.marks.hazardRim,.8,1.35,seed+11,{segments:14,skips:1});
  for(let i=0;i<6;i++)burinArc(g,0,0,r+3+i*1.35,Math.PI*(1+i*.05),Math.PI*(1.8-i*.04),ink.marks.hazardArcFaint,.12-i*.014,.5,seed+17+i,{segments:8,skips:1});
  burinArc(g,0,0,r+15,0,TAU,ink.marks.hazardOuter,.16,.4,seed+41,{segments:18,skips:3});
  const sprite={canvas:c,size};
  hazardCoreSprites.set(key,sprite);
  if(hazardCoreSprites.size>24)hazardCoreSprites.delete(hazardCoreSprites.keys().next().value);
  return sprite;
}
// The 54 hatch strokes' angles and lengths come only from h.seed, bucketed by alpha band so
// same-alpha strokes share one stroke() call. Only the bucket alphas (via the live pulse) change
// frame to frame, so the geometry — the RNG walk and the Map/array bucketing, the biggest
// allocation in drawHazard — is cached; every stroke is still issued live at its exact current
// alpha, so the breathing pulse animation is untouched.
const hazardHatchCache=new Map();
function hazardHatchGeometry(seed,radius){
  const rBucket=Math.round(radius),key=seed+':'+rBucket;
  const cached=hazardHatchCache.get(key);if(cached)return cached;
  const rng=seeded(seed),buckets=new Map();
  for(let i=0;i<54;i++){
    const a=i/54*TAU,l=2+rng()*rBucket*.42,base=.08+rng()*.27,bucket=Math.min(11,Math.floor((base-.08)/.27*12));
    let seg=buckets.get(bucket);if(!seg){seg=[];buckets.set(bucket,seg);}
    seg.push(Math.cos(a)*(rBucket+3),Math.sin(a)*(rBucket+3),Math.cos(a+.035)*(rBucket+l+3),Math.sin(a+.035)*(rBucket+l+3));
  }
  const entries=[...buckets.entries()];
  hazardHatchCache.set(key,entries);
  if(hazardHatchCache.size>32)hazardHatchCache.delete(hazardHatchCache.keys().next().value);
  return entries;
}
// The whirl a vortex is engraved with, drawn where a black hole's tilted accretion rings used to
// be: three arms wound into the eye, each doubled by a fainter one set behind it, so what the plate
// shows is water turning rather than a disc seen edge-on. They are cut round rather than flattened,
// since a whirlpool is charted from above.
function vortexWhirl(g,radius,alpha,seed){
  for(let i=0;i<3;i++){
    const a=i/3*TAU;
    burinSpiral(g,0,0,radius*1.88,radius*.6,a,a+TAU*.72,ink.marks.hazardAccretion,.5*alpha,.85*scale,seed+i*29,{segments:24,skips:2});
    burinSpiral(g,0,0,radius*1.52,radius*.7,a+.46,a+.46+TAU*.55,ink.marks.hazardAccretion,.26*alpha,.45*scale,seed+i*37,{segments:18,skips:3});
  }
}
// The whirl's shape depends only on h.seed, the plate and the viewport scale; its alpha is scaled
// uniformly by (1+pull*.5), and pull is 0 whenever the player is orbiting — the overwhelming
// majority of play, since it only turns nonzero during a brief free flight close enough to a vortex
// to feel its draw. That common (pull===0) case is baked once and blitted; the rare pulled case
// falls back to the same drawing done live rather than approximate it, so the pulled look and the
// still one are the same marks.
const hazardAccretionSprites=new Map();
function hazardAccretionSprite(seed,radius){
  const rBucket=Math.round(radius),key=seed+':'+rBucket+':'+plateName+':'+DPR.toFixed(2)+':'+scale.toFixed(3);
  const cached=hazardAccretionSprites.get(key);if(cached)return cached;
  const outer=rBucket*1.91+Math.max(10,rBucket*.15),size=Math.max(4,Math.ceil(outer*2));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);g.rotate(-.35);
  vortexWhirl(g,rBucket,1,seed);
  const sprite={canvas:c,size};
  hazardAccretionSprites.set(key,sprite);
  if(hazardAccretionSprites.size>24)hazardAccretionSprites.delete(hazardAccretionSprites.keys().next().value);
  return sprite;
}
function drawHazard(h){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('hazard');if(own)return own(h);
  if(h.kind==='nebula')return drawNebula(h);
  if(h.kind==='flare')return drawFlare(h);
  if(h.kind==='wind')return drawWind(h);
  const x=sx(h.x),y=sy(h.y),r=h.r*scale;if(y<-r*3||y>H+r*3)return;
  ctx.save();ctx.translate(x,y);const pulse=reducedMotion?1:.95+.05*Math.sin(world.time*1.2+(h.phase||0)),paper=onPaper();
  const pull=world.player.node?0:clamp(1-Math.hypot(world.player.x-h.x,world.player.y-h.y)/gravityRadius(h),0,1);
  // Ink does not glow: the paper plate drops the warm gravity-well halo and reads the pull only through the
  // rubrication accretion rings and the dark radiating hatch below.
  if(!paper){
    const halo=ctx.createRadialGradient(0,0,r*.7,0,0,r*3.4);halo.addColorStop(0,`rgba(${ink.marks.hazardHalo0},${(.25+pull*.12)*pulse})`);halo.addColorStop(.5,`rgba(${ink.marks.hazardHaloMid},.07)`);halo.addColorStop(1,`rgba(${ink.marks.hazardHaloEdge},0)`);ctx.fillStyle=halo;ctx.fillRect(-r*3.4,-r*3.4,r*6.8,r*6.8);
  }
  if(pull>0){
    ctx.save();ctx.rotate(-.35);vortexWhirl(ctx,r,1+pull*.5,h.seed);ctx.restore();
  }else{
    const ring=hazardAccretionSprite(h.seed,r);
    ctx.drawImage(ring.canvas,-ring.size/2,-ring.size/2,ring.size,ring.size);
  }
  {
    const hatch=hazardHatchGeometry(h.seed,r);
    ctx.lineWidth=.5;
    for(const [bucket,seg] of hatch){
      ctx.strokeStyle=`rgba(${ink.marks.hazardHatch},${(.08+(bucket+.5)/12*.27)*pulse})`;
      ctx.beginPath();
      for(let j=0;j<seg.length;j+=4){ctx.moveTo(seg[j],seg[j+1]);ctx.lineTo(seg[j+2],seg[j+3]);}
      ctx.stroke();
    }
  }
  const core=hazardCoreSprite(h.seed,r);
  ctx.drawImage(core.canvas,-core.size/2,-core.size/2,core.size,core.size);
  ctx.restore();
}
function drawAim(aim){
  const p=world.player;if(!p.node||world.state==='dead')return;
  const preview=world.flightPreview,points=preview?.points;if(!points||points.length<2)return;
  const launch=world.launchVelocity(),speed=launch.speed,dx=launch.vx/speed,dy=launch.vy/speed,sling=p.node.type==='sling',end=points[points.length-1],blocked=!!preview.blocked;
  ctx.save();ctx.lineCap='round';
  const ax=sx(p.x+dx*12),ay=sy(p.y+dy*12),bx=sx(end.x),by=sy(end.y);
  // The course is pricked, not ruled: small burin wedges are set along the predicted path, spaced and sized
  // by the plate scale, opening slightly toward the destination. They creep forward with the flight unless
  // reduced motion is requested, in which case the pricking stands still.
  const warn=blocked||aim?.steep;
  const guideRgb=warn?ink.marks.aimBlockedStart:aim?ink.marks.aimLocked:ink.marks.aimDefault;
  const nearAlpha=warn?.72:aim?.78:.5,farAlpha=warn?.5:aim?.34:.12,weight=aim?1.15:.92;
  const legs=[];let total=0,px=ax,py=ay;
  for(let i=1;i<points.length;i++){
    if(points[i].distance<12)continue;
    const qx=sx(points[i].x),qy=sy(points[i].y),len=Math.hypot(qx-px,qy-py);
    if(len>.001){legs.push({x:px,y:py,ux:(qx-px)/len,uy:(qy-py)/len,len});total+=len;}
    px=qx;py=qy;
  }
  // Where the nib would run out along this course, as a fraction of the drawn line. Past it the
  // pricking is starved to almost nothing: the pen has no ink left to set it down.
  const dryFrom=preview.inkRange>=0&&end.distance>0?clamp(preview.inkRange/end.distance,0,1):1;
  if(total>1){
    const gap=Math.max(4,8.5*scale),crawl=reducedMotion?0:(world.time*26*scale)%gap;
    let leg=0,walked=0,d=crawl;
    while(d<total&&leg<legs.length){
      while(leg<legs.length-1&&walked+legs[leg].len<d){walked+=legs[leg].len;leg++;}
      const l=legs[leg],along=clamp(d-walked,0,l.len),f=d/total;
      const x=l.x+l.ux*along,y=l.y+l.uy*along,size=(1.8+f*2.2)*scale*weight;
      const starved=f>dryFrom?.16:1;
      ctx.fillStyle=`rgba(${guideRgb},${lerp(nearAlpha,farAlpha,f)*starved})`;
      ctx.beginPath();
      ctx.moveTo(x-l.ux*size,y-l.uy*size);
      ctx.lineTo(x+l.ux*size*.6-l.uy*size*.5,y+l.uy*size*.6+l.ux*size*.5);
      ctx.lineTo(x+l.ux*size*.6+l.uy*size*.5,y+l.uy*size*.6-l.ux*size*.5);
      ctx.closePath();ctx.fill();
      d+=gap*(1+f*.65);
    }
  }
  if(sling){
    for(let seconds=.5;seconds<1.9;seconds+=.5){
      const index=points.findIndex(q=>q.time>=seconds);if(index<1)break;
      const a=points[index-1],b=points[index],t=(seconds-a.time)/(b.time-a.time),length=Math.hypot(b.x-a.x,b.y-a.y)||1;
      const x=sx(lerp(a.x,b.x,t)),y=sy(lerp(a.y,b.y,t)),nx=-(b.y-a.y)/length,ny=(b.x-a.x)/length;
      line(x+nx*2.5*scale,y+ny*2.5*scale,x-nx*2.5*scale,y-ny*2.5*scale,`rgba(${ink.marks.slingAimTick},.45)`,cut('line'));
    }
  }
  if(aim?.perfect&&!preview.fogged){
    ctx.strokeStyle=`rgba(${ink.marks.aimPerfectArc},.65)`;ctx.lineWidth=cut('bold');ctx.beginPath();ctx.arc(sx(aim.cx),sy(aim.cy),aim.radius*scale,aim.entryAngle,aim.entryAngle+aim.entryDir*.46,aim.entryDir<0);ctx.stroke();
  }
  // A transfer the nib cannot pay for is still aimed and still drawn: the course is barred with a
  // copper stroke where the ink gives out, so the decision to fly it is made in full knowledge.
  if(dryFrom<1&&total>1){
    let leg=0,walked=0,d=dryFrom*total;
    while(leg<legs.length-1&&walked+legs[leg].len<d){walked+=legs[leg].len;leg++;}
    const l=legs[leg],along=clamp(d-walked,0,l.len);
    const x=l.x+l.ux*along,y=l.y+l.uy*along,bar=4.6*scale;
    line(x-l.uy*bar,y+l.ux*bar,x+l.uy*bar,y-l.ux*bar,`rgba(${ink.marks.aimMarkBlocked},.8)`,cut('bold'));
    ctx.strokeStyle=`rgba(${ink.marks.aimMarkBlocked},.55)`;ctx.lineWidth=cut('line');
    ctx.beginPath();ctx.arc(x,y,2.4*scale,0,TAU);ctx.stroke();
  }
  if(preview.fogged){ctx.setLineDash([]);ctx.strokeStyle=`rgba(${ink.field.fogEdge},.5)`;ctx.lineWidth=cut('bold');ctx.beginPath();ctx.arc(bx,by,3.2,0,TAU);ctx.stroke();}
  // A course below the bonus threshold is marked with an open chevron: it still earns the base
  // impression, but the player can read before release that no angle bonus will be added.
  else if(aim?.steep){
    const l=legs[legs.length-1]||{ux:1,uy:0},w2=4.2*scale;
    ctx.strokeStyle=`rgba(${ink.marks.aimMarkBlocked},.8)`;ctx.lineWidth=cut('bold');ctx.beginPath();
    ctx.moveTo(bx-l.uy*w2-l.ux*w2,by+l.ux*w2-l.uy*w2);ctx.lineTo(bx,by);
    ctx.lineTo(bx+l.uy*w2-l.ux*w2,by-l.ux*w2-l.uy*w2);ctx.stroke();
  }
  else if(aim){ctx.translate(bx,by);ctx.rotate(Math.PI/4);ctx.strokeStyle=aim.perfect?`rgba(${ink.marks.aimMarkPerfect},.9)`:`rgba(${ink.marks.aimMarkNormal},.49)`;ctx.lineWidth=cut('line');ctx.strokeRect(-2.5,-2.5,5,5);}
  else if(blocked){line(bx-3,by-3,bx+3,by+3,`rgba(${ink.marks.aimMarkBlocked},.7)`,cut('bold'));line(bx+3,by-3,bx-3,by+3,`rgba(${ink.marks.aimMarkBlocked},.7)`,cut('bold'));}
  ctx.restore();
}
