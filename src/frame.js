'use strict';
/* Orbit · src/frame.js
   The engraved plate frame, degree scale, marginalia, and the frame-per-frame render() composition. */
// ---------- Plate frame: the engraved margin, degree scale, and marginalia framing the play field ----------
// A single offscreen frameLayer holds everything static (plate-mark, double rule, tick ladders, corner
// ornaments, and — on wide screens — the compass rose, scale bar and credit line). It is rebuilt only when
// its key (size, pixel ratio, plate) changes. The one moving part, the declination numbers on the side
// scales, is cheap enough to redraw live each frame straight onto ctx after the cached layer is blitted.
definePlate('frame',{
  night:{markEdge:'rgba(155,174,171,.14)',mark:'rgba(198,187,155,.08)',rule:'rgba(236,229,211,.46)',ruleFaint:'rgba(177,192,183,.26)',tick:'rgba(198,187,155,.32)',tickMinor:'rgba(155,174,171,.16)',text:'rgba(198,187,155,.42)',orn:'rgba(198,187,155,.26)'},
  paper:{markEdge:'rgba(96,74,52,.18)',mark:'rgba(58,42,28,.1)',rule:'rgba(34,24,16,.62)',ruleFaint:'rgba(96,74,52,.34)',tick:'rgba(58,42,28,.42)',tickMinor:'rgba(96,74,52,.24)',text:'rgba(58,42,28,.48)',orn:'rgba(58,42,28,.36)'},
  // Blue prepared paper is drawn white-heightened everywhere the chart's own hand appears — see
  // 05-engraving.md:366, and definePlate('marks')/reveal.nib/bead, which stay on that pale end. But the
  // plate's own furniture (the double rule, the graduation, the plate-mark, the running lettering) is
  // owed the dark end azzurra is missing entirely without this block: a dark ink drawn onto the ground,
  // the way every other plate's frame is either dark-on-light or light-on-dark rather than pale on pale.
  azzurra:{markEdge:'rgba(44,42,50,.22)',mark:'rgba(30,28,36,.12)',rule:'rgba(44,42,50,.45)',ruleFaint:'rgba(44,42,50,.25)',tick:'rgba(44,42,50,.36)',tickMinor:'rgba(44,42,50,.2)',text:'rgba(38,36,44,.5)',orn:'rgba(44,42,50,.31)'}
});
let frameLayer=null,frameKey='',frameInset=Infinity;
function frameWide(){return W>780;}
function frameBand(){return frameWide()?26:14;}
function frameEdgeTicks(len){const unitPx=frameWide()?7:5,n=Math.max(20,Math.round(len/unitPx));return {n,step:len/n};}
// A frame-layer token is a pre-mixed rgba() string, colour and alpha baked together the way every
// other plate token is; the burin primitives instead take a bare "r,g,b" triple and its alpha apart,
// the way ink.base's tokens already are. This pulls the two back apart without a second, parallel set
// of tokens just for the marks this file now cuts with a burin instead of a ruling pen.
function rgbaSplit(str){
  const m=/rgba?\(([^)]+)\)/.exec(str);
  if(!m)return {rgb:str,alpha:1};
  const parts=m[1].split(',').map(s=>s.trim());
  return {rgb:parts.slice(0,3).join(','),alpha:parts[3]!==undefined?Number(parts[3]):1};
}
// The Roman hours sphereGraduation's own limb counts by, shared here so the plate frame's own hour
// ladder is provably the same vocabulary rather than a second, independently-spelled one.
const ROMAN_HOURS=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
function frameCorner(g,x,y,dirX,dirY,color){
  const len=frameWide()?11:7,{rgb,alpha}=rgbaSplit(color),seed=Math.round(x*3+y*5)+1;
  burinSegment(g,x,y+len*dirY,x,y,rgb,alpha,.85,seed,{segments:3,skips:0,hair:false,wobble:.22});
  burinSegment(g,x,y,x+len*dirX,y,rgb,alpha,.85,seed+1,{segments:3,skips:0,hair:false,wobble:.22});
  burinArc(g,x+4*dirX,y+4*dirY,1.3,0,TAU,rgb,alpha,.6,seed+2,{segments:8,skips:0});
}
function frameCompassRose(g,cx,cy,r,colors){
  // The ornament and its four cardinal names stay within 3r of cx,cy, so callers can budget the footprint.
  const {rgb,alpha}=rgbaSplit(colors.orn),seed=Math.round(cx*5+cy*7);
  g.save();g.translate(cx,cy);
  burinArc(g,0,0,r,0,TAU,rgb,alpha,.8,seed+1,{segments:40,skips:2,wobble:.22});
  burinArc(g,0,0,r*.5,0,TAU,rgb,alpha,.8,seed+2,{segments:28,skips:2,wobble:.22});
  for(let i=0;i<8;i++){
    const a=i/8*TAU-Math.PI/2,long=i%2===0,rr=long?r:r*.6;
    burinSegment(g,0,0,Math.cos(a)*rr,Math.sin(a)*rr,rgb,alpha,long?.9:.6,seed+10+i,{segments:3,skips:0,hair:false,wobble:.2});
  }
  g.fillStyle=colors.orn;g.beginPath();g.moveTo(0,-r-3);g.lineTo(-2,-r+1.2);g.lineTo(0,-r-.5);g.lineTo(2,-r+1.2);g.closePath();g.fill();
  g.restore();
  // The four winds named round the rose, each set on its own quarter of the ring, all four at the
  // same radius: MERIDIES reads upright at the foot the same way a printed rose actually sets its
  // bottom name, by walking the arc backward rather than by standing on a smaller circle than its
  // three neighbours. The faint ring moves out to just past the lettering, so it reads as the band
  // the four names stand on rather than a stray mark closer to the rose than any of them.
  if(plainPlate())return;
  const size=Math.max(4.6,r*.42),ring=r*1.9;
  g.strokeStyle=colors.tickMinor;g.lineWidth=.5;g.beginPath();g.arc(cx,cy,ring+size*1.5,0,TAU);g.stroke();
  g.font=plateFace(size,'sc');
  g.fillStyle=colors.text;
  const opts={align:'center',size,spacing:size*.14};
  textAlongArc(g,'SEPTENTRIO',cx,cy,ring+size,-Math.PI/2,opts);
  textAlongArc(g,'ORIENS',cx,cy,ring+size,0,opts);
  textAlongArc(g,'OCCIDENS',cx,cy,ring+size,Math.PI,opts);
  textAlongArc(g,'MERIDIES',cx,cy,ring+size,Math.PI/2,{...opts,inward:true});
}
// A cherubic wind-head, cut for the corner of the plate: a puffing face turned into the chart with its
// breath streaming away from the mouth. Seeded so no two corners are the same head.
function frameWindHead(g,cx,cy,angle,rgb,alpha,radius,seed,breath=1){
  const rng=seeded(seed>>>0||1),R=radius;
  g.save();g.translate(cx,cy);g.rotate(angle);
  // The face, cut with few and heavy strokes so it still reads at the size of a margin ornament.
  burinArc(g,0,0,R,0,TAU,rgb,alpha,1.1,seed+3,{segments:24,skips:2});
  // Hair, a wreath of curls round the back of the head only.
  for(let i=0;i<6;i++){
    const a=Math.PI*.62+i/5*Math.PI*.76+(rng()-.5)*.1,cxx=Math.cos(a)*R*1.02,cyy=Math.sin(a)*R*1.02;
    burinArc(g,cxx,cyy,R*(.3+rng()*.12),a-2.4,a+.9,rgb,alpha*(.7+rng()*.4),.75,seed+11+i*5,{segments:6,skips:0});
  }
  // Closed eyes under heavy brows, and the swell of two cheeks blown full of wind.
  for(const s of [-1,1]){
    burinArc(g,R*.06,s*R*.3,R*.24,-1,.7,rgb,alpha,.8,seed+31+(s>0?1:0),{segments:5,skips:0});
    burinArc(g,R*.02,s*R*.32,R*.34,-.8,.35,rgb,alpha*.65,.6,seed+41+(s>0?1:0),{segments:4,skips:0});
    burinArc(g,R*.34,s*R*.46,R*.42,-2.5,-.15,rgb,alpha*.8,.7,seed+51+(s>0?1:0),{segments:6,skips:0});
  }
  // The pursed mouth, blowing along the local x axis.
  burinArc(g,R*.74,0,R*.2,0,TAU,rgb,alpha,.9,seed+61,{segments:10,skips:0});
  g.fillStyle=`rgba(${rgb},${alpha*.7})`;g.beginPath();g.arc(R*.74,0,R*.09,0,TAU);g.fill();
  // The breath: long tapering strokes leaving the mouth and spreading over the margin.
  for(let i=0;i<5;i++){
    const spread=(i-2)/2*.4,len=R*(2.1+rng()*2.2)*breath;
    const x0=R*.98,y0=Math.sin(spread)*R*.28;
    burinSegment(g,x0,y0,x0+Math.cos(spread)*len,y0+Math.sin(spread)*len,rgb,alpha*(.6-Math.abs(spread)*.5),.7,seed+71+i*7,{segments:6,skips:1,hair:false,wobble:1.1});
  }
  g.restore();
}
// The full wind-head's twenty-odd strokes read as a face at the lower corners' size; shrunk small
// enough to clear the HUD's text at the top of a narrow sheet, they read as dirt instead. Six marks
// only, cut heavier so the reduction reads as a simplification rather than a fainter version of the
// same noise: the outline, one cheek's swell standing for the whole face, the pursed mouth, and three
// breath strokes rather than five.
function frameWindHeadSimple(g,cx,cy,angle,rgb,alpha,radius,seed){
  const rng=seeded(seed>>>0||1),R=radius;
  g.save();g.translate(cx,cy);g.rotate(angle);
  burinArc(g,0,0,R,0,TAU,rgb,alpha,1.1,seed+3,{segments:16,skips:1});
  burinArc(g,R*.1,R*.34,R*.42,-1.15,.55,rgb,alpha*.85,.8,seed+31,{segments:6,skips:0});
  burinArc(g,R*.74,0,R*.2,0,TAU,rgb,alpha,.9,seed+61,{segments:8,skips:0});
  for(let i=0;i<3;i++){
    const spread=(i-1)*.4,len=R*(1.3+rng());
    const x0=R*.98,y0=Math.sin(spread)*R*.28;
    burinSegment(g,x0,y0,x0+Math.cos(spread)*len,y0+Math.sin(spread)*len,rgb,alpha*(.6-Math.abs(spread)*.5),.7,seed+71+i*7,{segments:5,skips:1,hair:false,wobble:1.1});
  }
  g.restore();
}
// A small pierced trefoil, standing in at the top two corners for whichever cosmetic ornament is
// otherwise active there: strapwork's interlace, the acanthus scroll and the sea-monster corner's own
// rosette all pack their identity into a reach that reads only at the lower corners' full size, the same
// floor the default wind-head was rescued from above. Three overlapping rings and a pierced centre read
// at any size a corner mark actually gets, so one small mark stands in for all three catalogue styles
// rather than three bespoke reductions.
function frameCornerKnot(g,cx,cy,rgb,alpha,size,seed){
  g.save();g.translate(cx,cy);
  for(let i=0;i<3;i++){
    const a=i/3*TAU-Math.PI/2;
    burinArc(g,Math.cos(a)*size*.5,Math.sin(a)*size*.5,size*.5,0,TAU,rgb,alpha,.8,seed+i*13,{segments:14,skips:1,wobble:.25});
  }
  burinArc(g,0,0,size*.22,0,TAU,rgb,alpha*.9,.6,seed+41,{segments:8,skips:0});
  g.restore();
}
// ---------- The catalogue's marginal ornaments ----------
// Alternatives to the wind-heads, cut into the same four corners with the same burin at the margin's
// own tone, and baked into the same cached frame layer. Each takes the corner point, the diagonal
// pointing into the chart, a size and its own seed.
// Interlaced strapwork: two pierced straps crossing at the corner and running along both margins,
// the upright one passing over the one that follows the edge.
function frameStrapwork(g,cx,cy,dirX,dirY,rgb,alpha,size,seed){
  const w=size*.4,reach=size*3.4;
  g.save();g.translate(cx,cy);g.scale(dirX,dirY);
  const strap=(along,s)=>{
    const gap=w+size*.34;
    for(const side of [-1,1]){
      const edge=side*w;
      if(along){
        // Broken where the upright strap passes over it, so the two read as interlaced.
        burinSegment(g,gap,edge,reach,edge,rgb,alpha,.75,s+side*3,{segments:8,skips:1,hair:false,wobble:.5});
        burinSegment(g,-size*.5,edge,-gap,edge,rgb,alpha*.7,.6,s+side*7,{segments:2,hair:false,wobble:.4});
      }else burinSegment(g,edge,-size*.5,edge,reach,rgb,alpha,.75,s+side*11,{segments:9,skips:1,hair:false,wobble:.5});
    }
    // A pierced lozenge two thirds along the band, and a curled terminal at its end.
    const t=reach*.66,lx=along?t:0,ly=along?0:t;
    g.strokeStyle=`rgba(${rgb},${alpha*.9})`;g.lineWidth=.7;
    g.beginPath();
    g.moveTo(lx+(along?size*.62:0),ly+(along?0:size*.62));
    g.lineTo(lx+(along?0:w),ly+(along?w:0));
    g.lineTo(lx-(along?size*.62:0),ly-(along?0:size*.62));
    g.lineTo(lx-(along?0:w),ly-(along?w:0));
    g.closePath();g.stroke();
    g.beginPath();g.arc(lx,ly,size*.13,0,TAU);g.stroke();
    burinArc(g,along?reach:0,along?0:reach,w,along?-Math.PI/2:Math.PI,along?Math.PI/2:TAU,rgb,alpha*.85,.7,s+29,{segments:8,skips:0});
  };
  strap(true,seed);strap(false,seed+137);
  g.restore();
}
// An acanthus scroll: a stem sweeping out of the corner into the margin, ending in a tight volute,
// with lobed leaves turning over along its back.
function frameAcanthus(g,cx,cy,dirX,dirY,rgb,alpha,size,seed){
  const rng=seeded(seed>>>0||1);
  g.save();g.translate(cx,cy);g.rotate(Math.atan2(dirY,dirX));
  const stem=[];
  for(let i=0;i<=24;i++){
    const u=i/24;
    stem.push({x:lerp(-size*.5,size*4.2,u),y:Math.sin(u*Math.PI*.92)*size*1.8-size*.25});
  }
  for(let i=0;i<stem.length-1;i++){
    const a=stem[i],b=stem[i+1];
    burinSegment(g,a.x,a.y,b.x,b.y,rgb,alpha,1.15-i*.025,seed+i*7,{segments:2,hair:false,wobble:.5});
  }
  // The volute the stem curls into, a turn and a half of tightening spiral.
  const tip=stem[stem.length-1];
  let prev=tip;
  for(let i=1;i<=22;i++){
    const u=i/22,a=-Math.PI*.45+u*Math.PI*2.6,r=size*(.95-u*.72);
    const point={x:tip.x+size*.85+Math.cos(a)*r,y:tip.y+size*.5+Math.sin(a)*r};
    burinSegment(g,prev.x,prev.y,point.x,point.y,rgb,alpha*(.95-u*.35),.8,seed+91+i*3,{segments:2,hair:false,wobble:.4});
    prev=point;
  }
  g.fillStyle=`rgba(${rgb},${alpha*.7})`;
  g.beginPath();g.arc(tip.x+size*.85,tip.y+size*.5,size*.13,0,TAU);g.fill();
  // Four leaves off the back of the stem, each a lobe turning over at its tip.
  for(let i=0;i<4;i++){
    const at=stem[3+i*5],next=stem[4+i*5]||at;
    const tx=next.x-at.x,ty=next.y-at.y,d=Math.hypot(tx,ty)||1;
    const nx=ty/d,ny=-tx/d,leaf=size*(1.5-i*.22)*(.85+rng()*.3);
    const tipX=at.x+nx*leaf+tx/d*leaf*.5,tipY=at.y+ny*leaf+ty/d*leaf*.5;
    burinSegment(g,at.x,at.y,tipX,tipY,rgb,alpha*(.85-i*.08),.85,seed+41+i*5,{segments:3,hair:false,wobble:.7});
    burinArc(g,at.x+nx*leaf*.45,at.y+ny*leaf*.45,leaf*.6,Math.atan2(ny,nx)-1.9,Math.atan2(ny,nx)+.9,rgb,alpha*(.8-i*.08),.75,seed+61+i*5,{segments:8,skips:1});
    // The rib of the leaf, and the curl where it turns over.
    burinArc(g,tipX,tipY,leaf*.24,0,Math.PI*1.6,rgb,alpha*(.65-i*.07),.6,seed+81+i*5,{segments:6,skips:0});
  }
  g.restore();
}
// A sea monster out of the empty quarters: coils breaking the margin, a reared head and a blown spout.
function frameSeaMonster(g,cx,cy,dirX,rgb,alpha,size,seed){
  const rng=seeded(seed>>>0||1);
  g.save();g.translate(cx,cy);g.scale(dirX,1);
  for(const [x,r] of [[-size*.2,size*.5],[size*.9,size*.62],[size*1.95,size*.44]]){
    burinArc(g,x,0,r,Math.PI,TAU,rgb,alpha,.85,Math.floor(rng()*1e6)||3,{segments:12,skips:2});
    for(let i=0;i<5;i++){
      const a=Math.PI*(1.12+i*.16),px=x+Math.cos(a)*(r-size*.1),py=Math.sin(a)*(r-size*.1);
      burinSegment(g,px,py,px+Math.cos(a)*size*.16,py+Math.sin(a)*size*.16,rgb,alpha*.5,.4,Math.floor(rng()*1e6)||7,{segments:2,hair:false});
    }
  }
  burinSegment(g,size*2.3,0,size*2.9,-size*1.5,rgb,alpha,.9,seed+11,{segments:5,hair:false,wobble:.6});
  burinArc(g,size*3,-size*1.7,size*.42,Math.PI*.4,Math.PI*1.5,rgb,alpha,.8,seed+17,{segments:8,skips:1});
  burinSegment(g,size*2.95,-size*2.05,size*4.1,-size*2.25,rgb,alpha,.8,seed+23,{segments:4,hair:false,wobble:.4});
  burinSegment(g,size*3.05,-size*1.5,size*3.9,-size*1.85,rgb,alpha*.9,.7,seed+29,{segments:4,hair:false,wobble:.4});
  burinSegment(g,size*3.9,-size*1.85,size*4.1,-size*2.25,rgb,alpha*.85,.6,seed+31,{segments:2,hair:false});
  g.fillStyle=`rgba(${rgb},${alpha})`;g.beginPath();g.arc(size*3.15,-size*1.9,size*.08,0,TAU);g.fill();
  for(let i=0;i<5;i++){
    const spread=(i-2)/2*.5,len=size*(1+rng());
    burinSegment(g,size*3,-size*2.3,size*3+Math.sin(spread)*len,-size*2.3-Math.cos(spread)*len,rgb,alpha*.4,.5,seed+41+i*3,{segments:3,skips:1,hair:false,wobble:1.1});
  }
  for(let i=0;i<3;i++){
    const y=size*(.18+i*.16);
    burinSegment(g,-size*1.1,y,size*4.4,y,rgb,alpha*(.28-i*.06),.45,seed+61+i*9,{segments:9,skips:2,hair:false,wobble:1.4});
  }
  g.restore();
}
// A small engraved star, set in the two corners a sea-monster plate leaves empty.
function frameRosette(g,cx,cy,rgb,alpha,size,seed){
  burinArc(g,cx,cy,size*.34,0,TAU,rgb,alpha*.7,.6,seed,{segments:10,skips:1});
  g.strokeStyle=`rgba(${rgb},${alpha})`;g.lineWidth=.7;
  g.beginPath();
  for(let i=0;i<16;i++){
    const a=i/16*TAU,r=i%2?size*.3:size;
    const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;
    if(i)g.lineTo(px,py);else g.moveTo(px,py);
  }
  g.closePath();g.stroke();
}
// The full compass rose only fits a wide sheet's flank (frameCompassRose, drawn below). A narrow one
// still gets a north reference: a bare needle in the corner the wind-heads would otherwise take, with
// nothing but its own point and SEPTENTRIO's abbreviation to name what it points at.
function frameNorthNeedle(g,cx,cy,rgb,alpha,size){
  g.save();g.translate(cx,cy);
  g.strokeStyle=`rgba(${rgb},${alpha})`;g.lineWidth=.8;
  g.beginPath();g.moveTo(0,size*.15);g.lineTo(0,-size*.92);g.stroke();
  g.fillStyle=`rgba(${rgb},${alpha})`;
  g.beginPath();g.moveTo(0,-size*1.15);g.lineTo(-size*.28,-size*.5);g.lineTo(0,-size*.72);g.lineTo(size*.28,-size*.5);g.closePath();g.fill();
  g.font=plateFace(size*.46,'sc');g.textAlign='center';g.fillStyle=`rgba(${rgb},${alpha*.85})`;
  g.fillText('SEPT.',0,size*.5);
  g.restore();
}
// The DOM HUD prints ORBIT, the score and BEST across the top of the plate, and the two upper corners of
// the margin have to keep out of its way. Shrinking whichever ornament is active there to clear it —
// the documented 45%-of-the-head reduction — read fine at a wide sheet's 14px head but reduced the
// reference wind-head to a smudge of noise at a narrow sheet's 9px, and every cosmetic corner (the
// strapwork interlace, the acanthus scroll, the sea-monster corner's own rosette) packs the same kind of
// fine detail into its own reach, so the same floor catches all four at some width. The two upper corners
// keep the *reduction*, not the shrink: a mark cut lean enough to read at any width instead, tucked close
// to the literal corner and blown or knotted so it clears the HUD by where it sits rather than by how
// small it has been made. The two lower corners, which nothing is set over, are unchanged.
const SIMPLE_INSET=2,SIMPLE_ANGLE=Math.PI/2;
function frameOrnaments(g,wide,innerR){
  const style=activeCosmetic('frame'),head=wide?14:9,simpleHead=head*.8,inset=SIMPLE_INSET+(wide?1:0);
  const rgb=ink.base.inkSoft,alpha=onPaper()?.34:.24;
  // Budgeted from the wind-head's own outermost stroke rather than its face circle: the hair curls
  // (frameWindHead below) reach out to R*1.02 plus their own radius of up to R*.42, or 1.44R from the
  // centre at the worst case, so anchoring the inset at R*.9 let that hair print across the inner rule
  // and into the tick ladder it should clear. Anchoring it at R*1.44 instead, plus the same clearance
  // gap the old formula already carried, clears the rule by that gap rather than missing it by one.
  const fullInset=innerR+head*1.44+(wide?3:2);
  // Top corners carry only their direction: every top mark now sits at its own fixed inset (below)
  // rather than at the shrunken-head inset the old single corners array placed it at.
  const topCorners=[[1],[-1]],bottomCorners=[[fullInset,H-fullInset,1,-1],[W-fullInset,H-fullInset,-1,-1]];
  for(const [dirX] of topCorners){
    const cx=dirX>0?innerR+inset:W-(innerR+inset),cy=innerR+inset,seed=51001+Math.round(cx*7+cy*13);
    // A narrow sheet has no flank for the compass rose (see buildFrameLayer's `if(wide)` block below),
    // so the upper-left corner — otherwise the same wind-head or cosmetic ornament as the other three —
    // takes a bare needle instead, the one piece of the rose a phone actually has room for.
    if(!wide&&dirX>0){frameNorthNeedle(g,innerR+11,innerR+11,rgb,alpha,10);continue;}
    if(style==='strapwork'||style==='acanthus'||style==='seamonsters')frameCornerKnot(g,cx,cy,rgb,alpha,simpleHead*.72,seed);
    else frameWindHeadSimple(g,cx,cy,SIMPLE_ANGLE,rgb,alpha,simpleHead,seed);
  }
  for(const [x,y,dx,dy] of bottomCorners){
    const seed=51001+Math.round(x*7+y*13);
    if(style==='strapwork')frameStrapwork(g,x,y,dx,dy,rgb,alpha,head,seed);
    else if(style==='acanthus')frameAcanthus(g,x,y,dx,dy,rgb,alpha,head*.9,seed);
    // The monsters swim in the two lower corners, where the rising ink reaches: they are cut in the
    // flood's own pigment, at the weight the shoreline marginalia is printed at, so they still read
    // once the page is half drowned.
    else if(style==='seamonsters')frameSeaMonster(g,x,y,dx,ink.dark.pigment,onPaper()?.55:.46,head*.72,seed);
    else frameWindHead(g,x,y,Math.atan2(dy,dx),rgb,alpha,head,seed,1);
  }
}
// A scale bar that scales nothing on a sheet with no distances reads as a mile-scale sitting on a
// chart that never states a mile. Cut to the same unit the border ladder itself counts by — ten
// degrees, in two five-degree panels — the bar agrees with the graduation instead of contradicting
// it, and a small pair of open dividers stepping off one panel is the period's own cheap, standard
// way of saying an angle was measured here rather than a length.
function frameScaleBar(g,x,y,colors){
  const w=30,h=3;
  // The rule's own ink, not a second, separately-tuned rule token: the printed double rule and the bar
  // that stands beside it are provably the same colour rather than two that happen to look close.
  g.lineWidth=1;g.strokeStyle=`rgba(${ink.base.inkStrong},${onPaper()?.62:.46})`;g.strokeRect(x+.5,y+.5,w,h);
  g.fillStyle=colors.orn;g.fillRect(x,y,w*.5,h);
  g.strokeStyle=colors.tickMinor;g.lineWidth=.5;
  for(const t of [0,.5,1]){g.beginPath();g.moveTo(x+t*w,y-1);g.lineTo(x+t*w,y+h+2);g.stroke();}
  // The dividers: two legs off one pivot, their tips set exactly on the bar's own end and mid tick, so
  // the mark reads as the instrument caught mid-step rather than a stray decoration beside the scale.
  // Kept small and close to the bar — this flank's own furniture (the frontispiece action row's own
  // rule sits just above it) leaves little headroom to spare.
  const px=x+w*.25,py=y-5;
  g.strokeStyle=`rgba(${ink.base.inkStrong},${onPaper()?.55:.4})`;g.lineWidth=.6;
  g.beginPath();g.moveTo(px,py);g.lineTo(x,y-1);g.moveTo(px,py);g.lineTo(x+w*.5,y-1);g.stroke();
  g.beginPath();g.arc(px,py,.7,0,TAU);g.fill();
  if(plainPlate())return;
  g.font=plateFace(Math.max(4.6,5*scale),'text','italic');g.fillStyle=colors.text;g.textAlign='center';
  g.fillText('0',x,y+h+8);g.fillText('5',x+w*.5,y+h+8);g.fillText('10',x+w,y+h+8);
  g.font=plateFace(Math.max(6.4,7*scale),'sc');g.textAlign='left';g.fillText('SCALA GRADUUM',x+w+5,y+h+1);
}
function buildFrameLayer(){
  const c=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(H*DPR))),g=c.getContext('2d');g.scale(DPR,DPR);
  const colors=ink.frame,wide=frameWide(),band=frameBand();
  const pm1=band*.2,pm2=band*.42,pmR=band*.25;
  // The plate mark is the paper's own scar, not a printer's rule: the metal plate's edge bit into the
  // sheet under the press, so it reads as a shallow groove rather than an inked line. Corners are
  // rounded (a filed edge, never sharp) and each rect is stroked twice a half-pixel either side of its
  // true line — a fainter pass outward standing for the light catching the near lip, the full tone
  // inward standing for the shadow the groove throws — rather than the one flat vector line a screen
  // draws by default.
  const groove=(x,y,w,h,rgba)=>{
    const r=Math.max(0,Math.min(pmR,w*.5,h*.5));
    g.strokeStyle=rgba;g.lineWidth=1;
    g.globalAlpha=.55;g.beginPath();g.roundRect(x-.6,y-.6,w+1.2,h+1.2,r+.6);g.stroke();
    g.globalAlpha=1;g.beginPath();g.roundRect(x+.6,y+.6,Math.max(1,w-1.2),Math.max(1,h-1.2),Math.max(0,r-.6));g.stroke();
  };
  // A plate is never wiped perfectly clean: a very faint film of its own ink stands across everything
  // it printed, one flat fill with no gradient so it stops dead at the mark instead of fading toward
  // it — which is what actually proves an edge was cut there rather than merely ruled. Reading
  // ink.base.ink rather than a literal keeps the film honest per plate: the same film that reads as a
  // dark plate tone on paper reads as a pale one on night, since that token is already the sheet's
  // own dark-on-light/light-on-dark ink, so the mark wants a lip raised into the light rather than a
  // stain sunk into shadow without a second, plate-specific branch.
  const markW=Math.max(1,W-pm1*2),markH=Math.max(1,H-pm1*2),markR=Math.max(0,Math.min(pmR,markW*.5,markH*.5));
  g.beginPath();g.roundRect(pm1,pm1,markW,markH,markR);
  g.fillStyle=`rgba(${ink.base.ink},${onPaper()?.05:.045})`;g.fill();
  groove(pm1,pm1,markW,markH,colors.markEdge);
  if(onPaper()){
    groove(pm2,pm2,Math.max(1,W-pm2*2),Math.max(1,H-pm2*2),colors.mark);
    // The plate's own edge was filed by hand and never ran perfectly true either — one very faint
    // burin pass over the mechanical groove, at the same low weight the shoreline's finer marks use.
    burinRect(g,pm2,pm2,Math.max(1,W-pm2*2),Math.max(1,H-pm2*2),ink.base.inkSoft,.07,.4,90233);
    // The plate's corners were filed once, by hand, at one angle, and the burr that left snags the
    // sheet the same way on every pull: a couple of short streaks drag in from each corner along one
    // shared direction (mirrored corner to corner, the way frameCorner's own bracket already is)
    // rather than radiating outward from each corner on its own, which is what one consistent file
    // mark looks like and a scatter of dirt does not.
    const rx=.55,ry=.95,rl=Math.hypot(rx,ry),rux=rx/rl,ruy=ry/rl;
    const ragCorners=[[pm1,pm1,1,1],[W-pm1,pm1,-1,1],[pm1,H-pm1,1,-1],[W-pm1,H-pm1,-1,-1]];
    for(let ci=0;ci<ragCorners.length;ci++){
      const [cx0,cy0,sx,sy]=ragCorners[ci],rdx=rux*sx,rdy=ruy*sy;
      for(let k=0;k<2;k++){
        const start=1+k*2.6,len=2.6+k*1.4,x1=cx0+rdx*start,y1=cy0+rdy*start;
        burinSegment(g,x1,y1,x1+rdx*len,y1+rdy*len,ink.base.inkSoft,.12-k*.03,.35,90270+ci*10+k,{segments:2,skips:0,hair:false,wobble:.3});
      }
    }
  }
  g.globalAlpha=1;
  // The double rule is cut with the same burin as the orbit rings: it swells, wobbles and lifts a little.
  // Read from the frame's own registered rule/ruleFaint rather than ink.base.inkStrong/inkSoft directly,
  // so a plate whose furniture departs from its drawing's own ink (azzurra's dark rule on a white-
  // heightened chart) can say so in one place instead of the double rule silently following the chart.
  const outerR=band*.56,innerR=band*.92;
  const {rgb:ruleRgb,alpha:ruleAlpha}=rgbaSplit(colors.rule),{rgb:faintRgb,alpha:faintAlpha}=rgbaSplit(colors.ruleFaint);
  burinRect(g,outerR+.5,outerR+.5,Math.max(1,W-outerR*2-1),Math.max(1,H-outerR*2-1),ruleRgb,ruleAlpha,wide?1.4:1,90211);
  burinRect(g,innerR+.5,innerR+.5,Math.max(1,W-innerR*2-1),Math.max(1,H-innerR*2-1),faintRgb,faintAlpha,wide?1:.7,44127);
  const tickLen=Math.max(1,innerR-outerR);
  // Top and bottom read right ascension, not a pixel count: 24 hour ticks span the sheet at every
  // width, each cut into six ten-minute divisions, so the count is 24 wherever the plate is played and
  // only the spacing changes with it. Numbered in the same Roman hours sphereGraduation's own limb
  // already counts by, going round twice — a 24-hour dial unrolled flat rather than run as a circle.
  // Majors are cut short of the inner rule on purpose, leaving the numeral its own lane rather than
  // the tick's own ink.
  const hLen=Math.max(1,W-band*2),HOUR_STEP=hLen/24,MIN_STEP=HOUR_STEP/6,hourLen=tickLen*.5,minLen=tickLen*.3;
  const numFont=wide?Math.max(7,8*scale):Math.max(6,6.5*scale);
  for(let i=0;i<=144;i++){
    const x=band+i*MIN_STEP,onHour=i%6===0,len=onHour?hourLen:minLen;
    const {rgb,alpha}=rgbaSplit(onHour?colors.tick:colors.tickMinor);
    burinSegment(g,x,outerR,x,outerR+len,rgb,alpha,onHour?.9:.5,90301+i*3,{segments:3,skips:0,hair:false,wobble:.22});
    burinSegment(g,x,H-outerR,x,H-outerR-len,rgb,alpha,onHour?.9:.5,90401+i*3,{segments:3,skips:0,hair:false,wobble:.22});
    if(onHour&&!plainPlate()){
      const label=ROMAN_HOURS[(i/6)%12];
      g.font=plateFace(numFont,'sc');g.textAlign='center';g.fillStyle=colors.text;g.textBaseline='middle';
      g.fillText(label,x,(outerR+innerR)/2);g.fillText(label,x,H-(outerR+innerR)/2);
    }
  }
  g.textBaseline='alphabetic';
  // The sides read declination in degrees, cut the same short-of-the-rule way; the live pass in
  // drawPlateFrame below carries the signed values, the equator's own heavier mark and the unit head,
  // since only that pass knows how far the ascent has scrolled the ladder.
  const vLen=Math.max(1,H-band*2),{n:vn,step:vStep}=frameEdgeTicks(vLen);
  for(let i=0;i<=vn;i++){
    const y=band+i*vStep,major=i%5===0,len=tickLen*(major?.5:.3);
    const {rgb,alpha}=rgbaSplit(major?colors.tick:colors.tickMinor);
    burinSegment(g,outerR,y,outerR+len,y,rgb,alpha,major?.9:.5,90501+i*3,{segments:3,skips:0,hair:false,wobble:.22});
    burinSegment(g,W-outerR,y,W-outerR-len,y,rgb,alpha,major?.9:.5,90601+i*3,{segments:3,skips:0,hair:false,wobble:.22});
  }
  // A single ° at the head of each flank, once, naming the unit the whole side scale counts in — set
  // clear of the top corners' own ornament (the needle and the simplified wind-head on a narrow sheet,
  // the full wind-head on a wide one) rather than crowding into the same few pixels they already claim.
  if(!plainPlate()){
    const unitY=band+(wide?22:34);
    g.font=plateFace(Math.max(6,6.5*scale),'text','italic');g.fillStyle=colors.text;g.textAlign='left';
    g.fillText('°',outerR+tickLen*.5+2,unitY);
    g.textAlign='right';g.fillText('°',W-outerR-tickLen*.5-2,unitY);
  }
  // Restrained corner brackets at the inner rule — the two lower corners only. Their own ornament sits
  // well clear of the bracket's reach (frameOrnaments' `inset` pushes it out by the ornament's own size
  // plus a gap), so the two read as separate marks; the two upper corners tuck their ornament in close
  // to the literal corner on purpose (needle, simplified head or knot, all sized for HUD clearance by
  // placement rather than by distance), which puts it on top of a bracket cut here, so the bracket is
  // dropped there rather than fighting the ornament for the same few pixels.
  frameCorner(g,innerR,H-innerR,1,-1,colors.orn);frameCorner(g,W-innerR,H-innerR,-1,-1,colors.orn);
  // The marginal ornament in each corner — the wind-heads blowing along the diagonal into the chart by
  // default, or whichever of the catalogue's ornaments is chosen — kept in the margin's own tone.
  frameOrnaments(g,wide,innerR);
  // Marginalia in the flanks either side of the play channel — desktop only, and clear of the centre 55%.
  // Anchored a fixed distance off the bottom edge so the whole cluster (rose, bar, its label, the credit
  // line below) always lands inside the band regardless of how band scales.
  if(wide){
    const flank=W*.225,leftCx=(band+4+flank)/2,rightX=W-flank+4,roseR=13;
    // The rose is set in the left flank, clear of the play channel, where its cardinal names have room.
    frameCompassRose(g,leftCx,Math.min(H-roseR*3-band,H*.63),roseR,colors);
    // Lifted well clear of the bottom graduation's own hour ticks and numerals, which the bar and its
    // "Scala" label used to sit right on top of; the credit line keeps its own place hard against the
    // rule, in the same narrow strip between it and the sheet's true edge.
    frameScaleBar(g,rightX,H-70,colors);
    if(plainPlate())return c;
    // The engraver's line, which carries the player's initials once the catalogue has granted them.
    g.font=plateFace(Math.max(6,6.5*scale),'text','italic');g.fillStyle=colors.text;g.textAlign='left';
    g.fillText(engraverCredit(),rightX,H-5);
    // A key to the six star forms used on the plate, set in the right flank clear of the play channel.
    // Its ghost rows are printed with the first proof; a row becomes dark only after a player has held
    // a matching star long enough to classify it, so the margin records the atlas's actual knowledge.
    const keyX=rightX,keyTop=Math.max(H*.28,band+70);
    g.font=plateFace(Math.max(7,8*scale),'sc');g.fillStyle=colors.text;g.textAlign='left';
    g.fillText('MAGNITUDINES',keyX,keyTop);
    // Ruled to the heading's own measured width rather than a hard 66, so a wider or narrower face
    // never leaves the underline short of the word or trailing past it.
    const headingWidth=g.measureText('MAGNITUDINES').width;
    g.lineWidth=.6;g.strokeStyle=colors.tickMinor;g.beginPath();g.moveTo(keyX,keyTop+3.5);g.lineTo(keyX+headingWidth,keyTop+3.5);g.stroke();
    g.font=plateFace(Math.max(6.8,7.5*scale),'text','italic');
    const known=typeof renaissanceLegendMask==='function'?renaissanceLegendMask():0;
    // The .72 gauge is the chart's own — kept — but a uniform 12px pitch assumed every class the same
    // height, and class I's actual reach at that gauge is nearly three of them. Each row is stacked by
    // its own magnitude's real span (renaissanceStarSpan, figures.js) plus a fixed 4px gutter instead,
    // so the key reads as a real descending column of unequal signs rather than a smear at the top.
    const KEY_GAUGE=.72,KEY_GUTTER=4;
    let rowTop=keyTop+13;
    for(let m=5;m>=0;m--){
      const magnitude=6-m,classified=!!(known&(1<<(magnitude-1)));
      // A row not yet classified is a ghost: the punch alone survived at .12, but its rays and rings
      // are further scaled down inside renaissanceStarGlyph (to as little as .38 of that), which left
      // classes I-IV reading as a bare dot with no sign at all. Raised to .22 for exactly those classes.
      const hasRays=magnitude<=4,alpha=classified?.72:hasRays?.22:.12;
      const half=renaissanceStarSpan(magnitude)*KEY_GAUGE,rowCenter=rowTop+half;
      renaissanceStarGlyph(g,keyX+7,rowCenter,magnitude,ink.atmosphere.starGlyph,alpha,KEY_GAUGE,0x1603+magnitude);
      g.textBaseline='middle';
      g.fillStyle=`rgba(${onPaper()?ink.base.ink:ink.base.inkStrong},${classified?.78:.2})`;
      g.fillText(MAGNITUDES[5-m],keyX+24,rowCenter);
      rowTop=rowCenter+half+KEY_GUTTER;
    }
    g.textBaseline='alphabetic';
  }else if(!plainPlate()){
    // No flank to carry it in, but the credit still belongs on the plate: set along the inside of the
    // bottom inner rule, where the sheet has a clear run the whole width of the play field.
    g.font=plateFace(Math.max(5.2,5.6*scale),'text','italic');g.fillStyle=colors.text;g.textAlign='center';
    g.fillText(engraverCredit(),W*.5,H-innerR-4);
  }
  return c;
}
// How far into the sheet the frame layer actually carries ink. The layer is cut at the size of the
// whole plate, but nearly all of it is bare: the double rule, the graduated scales and the corner
// ornaments all live in the margin, and only a wide sheet's flank marginalia — the rose, the scale
// bar, the key to the magnitudes — reach further in. Laying the whole layer down meant blending a
// screenful of empty sheet over the finished chart on every frame. It is measured once, when the
// layer is cut, from a thumbnail of it, and a sheet whose ink runs too deep to be worth banding
// simply reports back that the whole layer should be laid as before.
// The thumbnail is reduced by halves. A single big downscale samples too sparsely to see a hairline
// rule or eight-point lettering at all, and a probe that cannot see a mark would band the layer so
// tightly that the mark is cut off the sheet; halving averages every source pixel into the one below
// it, so nothing on the layer can go unnoticed. Anything but a wholly transparent block counts.
const FRAME_PROBE=700;
function frameLayerInset(layer){
  if(!layer||!(layer.width>0)||!(layer.height>0))return Infinity;
  try{
    let source=layer,w=layer.width,h=layer.height;
    while(w>FRAME_PROBE&&w>4&&h>4){
      const nw=Math.max(2,Math.ceil(w/2)),nh=Math.max(2,Math.ceil(h/2));
      const half=makeCanvas(nw,nh),hg=half.getContext('2d');
      if(!hg||typeof hg.drawImage!=='function')return Infinity;
      hg.drawImage(source,0,0,w,h,0,0,nw,nh);
      source=half;w=nw;h=nh;
    }
    const g=source.getContext?source.getContext('2d'):null;
    if(!g||typeof g.getImageData!=='function')return Infinity;
    const data=g.getImageData(0,0,w,h);
    if(!data||!data.data||data.data.length<w*h*4)return Infinity;
    const d=data.data;
    let deepest=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      if(d[(y*w+x)*4+3]===0)continue;
      const depth=Math.min(Math.min(x+1,w-x)/w*W,Math.min(y+1,h-y)/h*H);
      if(depth>deepest)deepest=depth;
    }
    if(!(deepest>0))return Infinity;
    // Two whole probe cells of margin either way, and a multiple of four CSS pixels so the band edges
    // land on whole device pixels at any of the ratios the plate is drawn at.
    const margin=Math.max(W/w,H/h)*2+4;
    return Math.ceil((deepest+margin)/4)*4;
  }catch(_){return Infinity;}
}
// The frame layer laid down as the four bands that carry it, rather than as a screenful of mostly
// empty sheet. The bands never overlap, so nothing is blended twice, and each is a whole-device-pixel
// copy of the layer, so the picture is the one the full blit drew.
function blitFrameLayer(layer){
  const d=frameInset;
  // The layer is painted through the same device-pixel scale the plate is, so a CSS coordinate maps to
  // a layer pixel by exactly that ratio: the bands are cut on it and laid back at one to one, no
  // resampling and so no seam. A layer that is not the plate's own size, or a sheet whose ink runs
  // deeper than half of it, is laid whole as before.
  if(!(d>0)||!(d*2<Math.min(W,H))||layer.width!==Math.max(1,Math.ceil(W*DPR))||layer.height!==Math.max(1,Math.ceil(H*DPR))){
    ctx.drawImage(layer,0,0,W,H);return;
  }
  const k=DPR,mid=H-d*2,sd=d*k,sw=layer.width,sh=layer.height;
  ctx.drawImage(layer,0,0,sw,sd,0,0,W,d);
  ctx.drawImage(layer,0,Math.max(0,sh-sd),sw,Math.min(sd,sh),0,H-d,W,d);
  ctx.drawImage(layer,0,sd,sd,mid*k,0,d,d,mid);
  ctx.drawImage(layer,Math.max(0,sw-sd),sd,Math.min(sd,sw),mid*k,W-d,d,d,mid);
}
function drawPlateFrame(){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('plateFrame');if(own)return own();
  if(!W||!H)return;
  const legend=typeof renaissanceLegendMask==='function'?renaissanceLegendMask():0;
  // The legend mask only ever reaches the sheet through the wide flank's MAGNITUDINES key
  // (buildFrameLayer's `if(wide)` block below); on a narrow sheet nothing drawn reads it, so folding
  // the width test into the key itself stops a phone from re-cutting its whole frame layer every time
  // a class is classified, which is a change the narrow sheet was never going to draw in the first place.
  const key=W+'x'+H+'x'+DPR+':'+plateName+':'+(frameWide()?legend:0);
  if(!frameLayer||key!==frameKey){frameLayer=buildFrameLayer();frameKey=key;frameInset=frameLayerInset(frameLayer);}
  const framePen=revealFrame(frameLayer);
  // The side scales alone track world.cameraY, redrawn live over the cached ladder so the chart reads as
  // ascending with the player; everything else in the frame stays perfectly still.
  const colors=ink.frame,band=frameBand(),outerR=band*.56,innerR=band*.92,tickLen=Math.max(1,innerR-outerR);
  if(framePen<.8||plainPlate())return;
  // Declination, not a wrapping pixel count: the scroll reflects off each pole at ±90° rather than
  // silently restarting at 90, so the reading is signed and matches a real limb; the equator, wherever
  // it currently falls, is always the heaviest mark on the ladder rather than a tick like any other.
  const {n,step}=frameEdgeTicks(Math.max(1,H-band*2)),scroll=Math.round(-world.cameraY*.015);
  const declAt=i=>{const m=(((i+scroll)%360)+360)%360;return m<=90?m:m<=270?180-m:m-360;};
  const declText=v=>v===0?'0':(v>0?'+':'−')+Math.abs(v);
  ctx.font=plateFace(frameWide()?Math.max(7,8*scale):Math.max(6,6.5*scale));ctx.fillStyle=colors.text;ctx.textBaseline='middle';
  const labelIn=outerR+tickLen*.5+1,labelOut=W-outerR-tickLen*.5-1;
  for(let i=0;i<=n;i+=10){
    const y=band+i*step,text=declText(declAt(i));
    ctx.textAlign='left';ctx.fillText(text,labelIn,y);
    ctx.textAlign='right';ctx.fillText(text,labelOut,y);
  }
  ctx.textBaseline='alphabetic';
  const eqBase=((-scroll)%180+180)%180;
  ctx.strokeStyle=colors.tick;ctx.lineWidth=1.3;
  for(let e=eqBase;e<=n;e+=180){
    const y=band+e*step;
    ctx.beginPath();ctx.moveTo(outerR,y);ctx.lineTo(innerR,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W-outerR,y);ctx.lineTo(W-innerR,y);ctx.stroke();
  }
}
// The atlas earns its geometry one capture at a time. What begins as a compass prick grows through
// the pole, equator and ecliptic into a complete graticule; construction circles remain faintly visible
// beneath the darker finished circles instead of appearing as decoration on an already complete sheet.
//
// Which figure the captures construct is the player's, from the catalogue (`sphere` in COSMETIC_KINDS,
// src/ledger.js). The atlas builds its graticule, but the same ten stages will as readily lay out an
// astrolabe's rete, the Ptolemaic orbs or a volvelle's dials — all four are things a sixteenth-century
// hand set out from one prick with one pair of compasses, and none of them is more or less earned than
// another. A sheet may also be left unruled, and then nothing here is drawn at all.
let renaissanceGridLayer=null,renaissanceGridKey='';
// Every construction stands on the same centre and the same axes and arrives at the same rate, so the
// measure is taken once and each hand below is only its own drawing. `stage(n)` is how far the
// construction has got past its nth mark, `arc` the part-swept ellipse every one of them is built out
// of, and `prick` the compass hole all four of them open on.
function sphereMeasure(g,progress){
  const cx=W*.5,cy=H*.54,rx=Math.min(W*.41,H*.43),ry=rx*.62,rgb=ink.base.inkSoft;
  const arc=(p,x,y,ax,ay,rotation=0,alpha=.18,weight=.55)=>{
    if(p<=0)return;g.save();g.translate(x,y);g.rotate(rotation);
    g.strokeStyle=`rgba(${rgb},${alpha})`;g.lineWidth=weight;
    g.beginPath();g.ellipse(0,0,ax,ay,0,-Math.PI/2,-Math.PI/2+TAU*p);g.stroke();g.restore();
  };
  // The pole is a real compass prick with two short crossed ruling strokes.
  const prick=p=>{
    if(p<=0)return;
    g.strokeStyle=`rgba(${rgb},${.28*p})`;g.lineWidth=.65;
    g.beginPath();g.moveTo(cx-4,cy);g.lineTo(cx+4,cy);g.moveTo(cx,cy-4);g.lineTo(cx,cy+4);g.stroke();
    g.fillStyle=`rgba(${rgb},${.5*p})`;g.beginPath();g.arc(cx,cy,1.15,0,TAU);g.fill();
  };
  // Lettering a construction names its parts with: one line, set where the part it names actually is,
  // on a small leaf of the sheet's own ground rather than bare over the construction's own lines — the
  // same clearing `drawRunningHead()` cuts for itself, sized to the caption rather than to a fixed band.
  const label=(p,text,x,y,rotation=0)=>{
    if(p<=0)return;
    const size=frameWide()?8:6.5;
    g.save();g.font=plateFace(size,'sc');g.textAlign='center';
    g.translate(x,y);if(rotation)g.rotate(rotation);
    const half=g.measureText(text).width*.5+3;
    g.globalAlpha=.32*p;g.fillStyle=`rgba(${ink.base.paperRgb},1)`;g.fillRect(-half,-size*.78,half*2,size*1.12);
    g.globalAlpha=.42*p;g.fillStyle=ink.frame.text;g.fillText(text,0,0);
    g.restore();
  };
  return {stage:n=>clamp(progress-n,0,1),cx,cy,rx,ry,rgb,colors:ink.frame,arc,prick,label};
}
// A graduated limb: 120 divisions cut round an ellipse, every tenth one long and numbered in the hours
// the atlas counts them in. It is the last thing struck on three of the four constructions, and cutting
// it once here keeps the three of them graduated by the same hand.
function sphereGraduation(g,m,p,ax,ay,numbered=true){
  if(p<=0)return;
  const {cx,cy,colors}=m;
  g.save();g.translate(cx,cy);g.strokeStyle=colors.tick;g.fillStyle=colors.text;g.textAlign='center';g.font=plateFace(frameWide()?8:6.5,'text','italic');
  for(let i=0;i<120*p;i++){
    const a=i/120*TAU,major=i%10===0,len=major?8:i%5===0?5:2.5,x=Math.cos(a)*ax,y=Math.sin(a)*ay,nx=Math.cos(a),ny=Math.sin(a);
    g.globalAlpha=major?.52:.3;g.lineWidth=major?.8:.45;g.beginPath();g.moveTo(x,y);g.lineTo(x+nx*len,y+ny*len*.62);g.stroke();
    if(major&&numbered){
      // A body drifts through this fixed construction independently of it, and a numeral is cheaper to
      // skip than to leaf: with twelve struck round the limb, losing the rare one a body sits on reads
      // as an interrupted rim rather than a missing hour.
      const nlx=x+nx*18,nly=y+ny*12+3,nsx=cx+nlx,nsy=cy+nly;
      const onBody=world.nodes.some(n=>Math.hypot(sx(n.x)-nsx,sy(n.y)-nsy)<(n.cap||n.r)*scale+6);
      if(!onBody){g.globalAlpha=.48;g.fillText(ROMAN_HOURS[i/10],nlx,nly);}
    }
  }
  g.restore();
}
// The atlas's own: a sphere seen very nearly edge-on, equator and oblique ecliptic first, then the
// parallels and meridians between them.
function paintGraticuleSphere(g,m){
  const {stage,cx,cy,rx,ry,arc}=m;
  m.prick(stage(0));
  // Pale compass trials survive under the accepted projection.
  arc(stage(1),cx,cy,rx*.34,ry*.34,0,.07);arc(stage(1.5),cx,cy,rx*.68,ry*.68,0,.07);
  arc(stage(2),cx,cy,rx,ry,0,.2,.8); // celestial equator
  arc(stage(3),cx,cy,rx,ry,-.31,.24,.9); // ecliptic
  for(let i=1;i<=4;i++)arc(stage(3+i*.55),cx,cy,rx,ry*(1-i*.16),0,.1,.5); // parallels
  for(let i=0;i<6;i++)arc(stage(5.4+i*.42),cx,cy,rx*(.16+i*.14),ry,0,.1,.5); // meridians
  sphereGraduation(g,m,stage(8),rx,ry);
  const names=stage(9);
  m.label(names,'Æquator cælestis',cx,cy+ry+15);m.label(names,'Ecliptica',cx+rx*.58,cy-ry*.54,-.31);
}
// The pierced plate that turns over an astrolabe's tympan: the limb, the two tropics between which the
// whole zodiac lies, and the eccentric ecliptic ring laid tangent to both of them — which is the one
// construction on this sheet that is a real theorem rather than a decoration, since a circle tangent
// inside Capricorn and outside Cancer can only be drawn in one place. The tongues are star pointers,
// each ending on a star the rete is cut to carry.
function paintReteSphere(g,m){
  const {stage,cx,cy,rx,arc,rgb}=m;
  const R=rx,cancer=R*.44,er=(R-cancer)/2,ex=cx+Math.cos(-.9)*(R-er),ey=cy+Math.sin(-.9)*(R-er);
  m.prick(stage(0));
  arc(stage(1),cx,cy,R*.34,R*.34,0,.07);arc(stage(1.5),cx,cy,R*.68,R*.68,0,.07);
  arc(stage(2),cx,cy,R,R,0,.2,.8); // the limb, and with it the tropic of Capricorn
  arc(stage(3),ex,ey,er,er,0,.24,.9); // the ecliptic, eccentric and tangent to both tropics
  arc(stage(3.55),cx,cy,cancer,cancer,0,.12,.5); // the tropic of Cancer
  arc(stage(4.1),cx,cy,R*.72,R*.72,0,.1,.5); // the equator
  // The east-west bar and the meridian: the rete's own frame, all that holds the rest of it together.
  const bar=stage(4.65);
  if(bar>0){
    g.save();g.strokeStyle=`rgba(${rgb},${.14*bar})`;g.lineWidth=.7;
    g.beginPath();g.moveTo(cx-R*bar,cy);g.lineTo(cx+R*bar,cy);g.moveTo(cx,cy-R*bar);g.lineTo(cx,cy+R*bar);g.stroke();g.restore();
  }
  // Six star pointers, one per stage: a tongue curling off the ecliptic ring to the star it names, with
  // the star itself pricked at the point of it.
  for(let i=0;i<6;i++){
    const p=stage(5.4+i*.42);if(p<=0)continue;
    const a=-.9+(i-2.5)*.86,from=er*.92,to=R*(.52+(i%3)*.17);
    const bx=ex+Math.cos(a)*from,by=ey+Math.sin(a)*from,tx=cx+Math.cos(a)*to,ty=cy+Math.sin(a)*to;
    g.save();g.strokeStyle=`rgba(${rgb},${.17*p})`;g.lineWidth=.6;
    g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+Math.cos(a+.9)*22,by+Math.sin(a+.9)*22,tx,ty);g.stroke();
    // The point is filed to a barb so the star it reads against is unmistakable.
    g.beginPath();g.moveTo(tx,ty);g.lineTo(tx-Math.cos(a-.4)*7,ty-Math.sin(a-.4)*7);g.moveTo(tx,ty);g.lineTo(tx-Math.cos(a+.4)*7,ty-Math.sin(a+.4)*7);g.stroke();
    g.fillStyle=`rgba(${rgb},${.3*p})`;g.beginPath();g.arc(tx,ty,1.1,0,TAU);g.fill();g.restore();
  }
  sphereGraduation(g,m,stage(8),R,R);
  const names=stage(9);
  // An instrument is named on its own limb, inside the graduation, rather than under it: the band below
  // the construction is where the sheet's standing instructions are written.
  m.label(names,'Rete',cx,cy+R-13);m.label(names,'Zodiacus',ex,ey-er-7);
}
// The spheres as Sacrobosco's readers were taught them: the earth at the centre, seven orbs round it
// carrying their planets on epicycles, and the firmament outside them all. It is the one construction
// here whose stages are a list rather than a geometry — a capture buys the next heaven.
function paintOrbSphere(g,m){
  const {stage,cx,cy,rx,arc,rgb}=m;
  const R=rx,earth=stage(0);
  m.prick(earth);
  // The earth is drawn as a body, not a point: the small hatched disc every one of these diagrams
  // opens on, laid over the prick that set the compasses.
  if(earth>0){
    const globe=R*.055;
    g.save();g.strokeStyle=`rgba(${rgb},${.22*earth})`;g.lineWidth=.5;
    g.beginPath();g.arc(cx,cy,globe,0,TAU);g.stroke();
    for(let i=-2;i<=2;i++){const dy=i*R*.021,half=Math.sqrt(Math.max(0,globe*globe-dy*dy));g.beginPath();g.moveTo(cx-half,cy+dy);g.lineTo(cx+half,cy+dy);g.stroke();}
    g.restore();
  }
  arc(stage(1),cx,cy,R*.34,R*.34,0,.07);arc(stage(1.5),cx,cy,R*.68,R*.68,0,.07);
  for(let i=0;i<7;i++){
    const p=stage(2+i*.86);if(p<=0)continue;
    const r=R*(.16+i*.115),a=-.62+i*1.17;
    arc(p,cx,cy,r,r,0,i===6?.16:.11,i===6?.7:.55);
    // Each orb carries its planet on a small epicycle, which is the whole reason a heaven is a shell
    // and not a line: the sweep of the deferent is the orb, the little circle on it is the wandering.
    const ex=cx+Math.cos(a)*r,ey=cy+Math.sin(a)*r,er=R*.045;
    g.save();g.strokeStyle=`rgba(${rgb},${.15*p})`;g.lineWidth=.5;
    g.beginPath();g.arc(ex,ey,er,0,TAU*p);g.stroke();
    g.fillStyle=`rgba(${rgb},${.28*p})`;g.beginPath();g.arc(ex+Math.cos(a+1.1)*er,ey+Math.sin(a+1.1)*er,1.2,0,TAU);g.fill();g.restore();
  }
  // The firmament: the fixed stars on a doubled ring, with the sphere beyond them that moves it.
  const sky=stage(8);
  arc(sky,cx,cy,R*.955,R*.955,0,.14,.75);arc(sky,cx,cy,R,R,0,.18,.9);
  if(sky>0){
    g.save();g.fillStyle=`rgba(${rgb},${.3*sky})`;
    for(let i=0;i<48*sky;i++){const a=i/48*TAU+.13,r=R*.978;g.fillRect(cx+Math.cos(a)*r-.55,cy+Math.sin(a)*r-.55,1.1,1.1);}
    g.restore();
  }
  const names=stage(9);
  m.label(names,'Terra',cx,cy+R*.055+13);m.label(names,'Primum mobile',cx,cy-R-9);
}
// Apian's paper instrument: dials cut one inside another on a common pin, with an index arm swung over
// them and a thread hanging off it. A volvelle is read rather than looked at, so it is built outward —
// the pin, then the plates it turns on, then the arm that does the reading.
function paintVolvelleSphere(g,m){
  const {stage,cx,cy,rx,arc,rgb}=m;
  const R=rx;
  m.prick(stage(0));
  arc(stage(1),cx,cy,R*.34,R*.34,0,.07);arc(stage(1.5),cx,cy,R*.68,R*.68,0,.07);
  arc(stage(2),cx,cy,R,R,0,.2,.8); // the mount, and the graduated band's outer edge
  arc(stage(2.6),cx,cy,R*.9,R*.9,0,.14,.6); // its inner edge
  for(let i=0;i<3;i++)arc(stage(3.2+i*.62),cx,cy,R*(.74-i*.16),R*(.74-i*.16),0,.11,.55); // the turning plates
  // The band is divided into twelve, and each plate carries its own quarter marks, so the dials read
  // against one another rather than each being a bare circle.
  const spokes=stage(5.1);
  if(spokes>0){
    g.save();g.strokeStyle=`rgba(${rgb},${.13*spokes})`;g.lineWidth=.5;
    for(let i=0;i<12*spokes;i++){
      const a=i/12*TAU-Math.PI/2;
      g.beginPath();g.moveTo(cx+Math.cos(a)*R*.9,cy+Math.sin(a)*R*.9);g.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);g.stroke();
      if(i%3===0){g.beginPath();g.moveTo(cx+Math.cos(a)*R*.42,cy+Math.sin(a)*R*.42);g.lineTo(cx+Math.cos(a)*R*.74,cy+Math.sin(a)*R*.74);g.stroke();}
    }
    g.restore();
  }
  // The index: one arm across the whole instrument, filed to a point at the reading end and pierced at
  // the pin, with the plumb thread the reading is actually taken on hanging from it.
  const arm=stage(6.4);
  if(arm>0){
    const a=-1.09,tip=R*1.02*arm,tail=R*.44*arm;
    const tx=cx+Math.cos(a)*tip,ty=cy+Math.sin(a)*tip;
    g.save();g.strokeStyle=`rgba(${rgb},${.24*arm})`;g.lineWidth=1;
    g.beginPath();g.moveTo(cx-Math.cos(a)*tail,cy-Math.sin(a)*tail);g.lineTo(tx,ty);g.stroke();
    g.lineWidth=.55;
    g.beginPath();g.moveTo(tx,ty);g.lineTo(tx-Math.cos(a-.32)*11,ty-Math.sin(a-.32)*11);g.moveTo(tx,ty);g.lineTo(tx-Math.cos(a+.32)*11,ty-Math.sin(a+.32)*11);g.stroke();
    g.beginPath();g.arc(cx,cy,3.2,0,TAU);g.stroke();
    // The thread falls plumb from a point along the arm, whatever angle the arm is set at.
    const hx=cx+Math.cos(a)*R*.66,hy=cy+Math.sin(a)*R*.66;
    g.strokeStyle=`rgba(${rgb},${.12*arm})`;g.lineWidth=.4;
    g.beginPath();g.moveTo(hx,hy);g.lineTo(hx,hy+R*.3*arm);g.stroke();
    g.fillStyle=`rgba(${rgb},${.22*arm})`;g.beginPath();g.arc(hx,hy+R*.3*arm,1.6,0,TAU);g.fill();g.restore();
  }
  sphereGraduation(g,m,stage(8),R,R,false);
  const names=stage(9);
  m.label(names,'Volvella',cx,cy+R-13);m.label(names,'Index',cx+Math.cos(-1.09)*R*.78+16,cy+Math.sin(-1.09)*R*.78);
}
const SPHERE_HANDS={graticule:paintGraticuleSphere,rete:paintReteSphere,orbs:paintOrbSphere,volvelle:paintVolvelleSphere};
function paintRenaissanceGrid(g,progress,style){
  const hand=SPHERE_HANDS[style]||SPHERE_HANDS.graticule,band=frameBand()+4;
  g.save();g.beginPath();g.rect(band,band,Math.max(1,W-band*2),Math.max(1,H-band*2));g.clip();
  hand(g,sphereMeasure(g,progress));
  g.restore();
}
function drawRenaissanceGrid(){
  if(!world||plainPlate())return;
  // An unruled sheet is a selection like any other, and the cheapest one: nothing is painted and no
  // layer is kept, so the construction costs exactly nothing when it is not wanted.
  const style=sphereStyle();if(!SPHERE_HANDS[style])return;
  const count=Math.min(10,world.captures),progress=count;
  const key=W+'x'+H+'x'+DPR+':'+plateName+':'+style+':'+count;
  if(!renaissanceGridLayer||key!==renaissanceGridKey){
    renaissanceGridLayer=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(H*DPR)));const g=renaissanceGridLayer.getContext('2d');g.scale(DPR,DPR);paintRenaissanceGrid(g,progress,style);renaissanceGridKey=key;
  }
  ctx.drawImage(renaissanceGridLayer,0,0,W,H);
}

// The score, the pace and the flow are DOM, printed in the middle of the HUD band, and the chart scrolls up
// beneath them. While a run is on, a soft leaf of the sheet's own ground is laid under that column,
// feathered to nothing all round, so the figures never print straight across a planet.
// A gradient's stops depend only on the plate, never on where or how large it is painted — the
// translate+scale around each fillRect below place and size it — so, like the plate frame layer
// above, it is built once per plate and reused rather than reallocated every single frame.
const hudLeafGradients=new Map();
function hudLeafGradient(){
  let g=hudLeafGradients.get(plateName);
  if(!g){
    g=ctx.createRadialGradient(0,0,0,0,0,1);
    // A reserved patch of the sheet's own stock, not a light: the centre and the .85 stop share one
    // alpha, so the ground reads flat out to there, and only the last sliver feathers to nothing.
    const centre=onPaper()?.5:.62;
    g.addColorStop(0,`rgba(${ink.base.paperRgb},${centre})`);g.addColorStop(.85,`rgba(${ink.base.paperRgb},${centre})`);g.addColorStop(1,`rgba(${ink.base.paperRgb},0)`);
    hudLeafGradients.set(plateName,g);
  }
  return g;
}
function drawHudLeaf(){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('hudLeaf');if(own)return own();
  if(!world||world.state==='ready'||world.state==='dead')return;
  // The block is one line taller for every charge in hand, and those lines are the ones that come and go,
  // so the pass is drawn to reach whatever is actually set on it rather than to a fixed depth: a charge
  // the player is carrying is printed on its own ground like every other figure, not straight onto the chart.
  const p=world.player,carried=(p.shielded?1:0)+(p.reflectorArmed?1:0)+(p.dawnArmed?1:0);
  const cx=W*.5,band=hudBand(),cy=band*.5,rx=Math.min(W*.3,124),ry=Math.max(band*.64,band+carried*15-cy);
  ctx.save();ctx.translate(cx,cy);ctx.scale(rx,ry);
  ctx.fillStyle=hudLeafGradient();ctx.fillRect(-1,-1,2,2);ctx.restore();
  drawInkGauge();
}
// The nib's reservoir, cut as an engraved rule rather than a browser's progress bar: the wet length in
// the plate's gold (copper once it is too short to carry an ordinary transfer), a bead of wet ink at its
// end, and the spent length left as a bare score in the copper — a mark a burin left, not a grey
// remainder. Positioned off the DOM slip's own rect (#ink, kept invisible on the atlas — see index.html)
// so it sits exactly where the score-block's own rhythm already puts it, without this file having to
// reason about that layout itself. The fixed seeds keep the wobble steady frame to frame; only the split
// between wet and spent moves.
function drawInkGauge(){
  if(!renaissanceAtlas())return;
  const el=$('ink');if(!el)return;
  const rect=el.getBoundingClientRect();
  if(!(rect.width>0)||!Number.isFinite(rect.left)||!Number.isFinite(rect.top)||!Number.isFinite(rect.height))return;
  const level=clamp(world.inkLevel(),0,1),x0=rect.left,x1=rect.left+rect.width,y=rect.top+rect.height*.5,xh=x0+rect.width*level;
  if(level<1)burinSegment(ctx,xh,y,x1,y,ink.base.copper,.3,.5,81403,{segments:6,skips:1,hair:false,wobble:.18});
  if(level>0){
    burinSegment(ctx,x0,y,xh,y,level<=.34?ink.base.copper:ink.base.gold,.92,.9,81401,{segments:6,skips:1,hair:false,wobble:.18});
    penBead(xh,y,0,1.1*scale,.85);
  }
}
// The MAGNITUDINES key: on a wide sheet it stands permanently in the right flank (buildFrameLayer's
// `if(wide)` block above), but a narrow one has no flank to carry it in, and the play field is kept
// clear rather than crowded with a sixth line of furniture. It is drawn here instead, live, only while
// the run is paused — the one moment a phone actually has the screen free, and a reader has stopped to
// consult a legend rather than fly past it. Laid horizontally rather than as the wide key's column, in
// the open sheet below the pause leaf's own card.
function drawPauseMagnitudeKey(){
  if(frameWide()||plainPlate()||!world)return;
  const colors=ink.frame,cx=W*.5,top=Math.min(H*.68,H-186);
  ctx.save();
  ctx.font=plateFace(Math.max(6.8,7.5*scale),'sc');ctx.fillStyle=colors.text;ctx.textAlign='center';
  ctx.fillText('MAGNITUDINES',cx,top);
  ctx.lineWidth=.6;ctx.strokeStyle=colors.tickMinor;
  ctx.beginPath();ctx.moveTo(cx-40,top+5.5);ctx.lineTo(cx+40,top+5.5);ctx.stroke();
  const known=typeof renaissanceLegendMask==='function'?renaissanceLegendMask():0;
  const cols=6,spacing=Math.min(52,(W-60)/cols),startX=cx-spacing*(cols-1)/2,glyphY=top+27;
  ctx.font=plateFace(Math.max(6.4,7*scale),'text','italic');
  for(let i=0;i<cols;i++){
    const magnitude=i+1,classified=!!(known&(1<<(magnitude-1))),alpha=classified?.78:.16,x=startX+i*spacing;
    renaissanceStarGlyph(ctx,x,glyphY,magnitude,ink.atmosphere.starGlyph,alpha,.5,0x1603+magnitude);
    ctx.fillStyle=`rgba(${onPaper()?ink.base.ink:ink.base.inkStrong},${classified?.78:.2})`;
    ctx.fillText(MAGNITUDES[magnitude-1],x,glyphY+18);
  }
  ctx.restore();
}
// The running head: the plate's own number and name, engraved at the foot of the sheet where a printer
// sets one, in the frame's ink rather than in the DOM. It names the chapter the ascent has reached, and
// the page turn writes the same name large across the chart as the sheet changes.
function drawRunningHead(){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('runningHead');if(own)return own();
  if(!world||plainPlate())return;
  const bottom=H<=530&&W>H?4:W>=800?23:Math.max(17,safeAreaBottom()+7);
  const y=H-bottom-24+3,index=clamp(Math.floor(world.progress/8),0,3),colors=ink.frame;
  // While the chapter title is still freshly written and sitting close to this line, it already names
  // the plate; running the head under it too would set the same name twice within a hand's breadth.
  // The title yields the ground back once it has settled or drifted well clear of the foot.
  if(chapterReveal.age<4.2){
    const band=revealBand();
    // 60px is the audit's own estimate; measured against the reference viewport, the title's own clamp
    // (revealPoint) never lets it drift closer than about 66px, so the threshold is set just past that.
    if(band&&Math.abs((band.top+band.bottom)/2-y)<70)return;
  }
  const size=frameWide()?9.5:8.5,head='TAB. '+numerals[index]+'  \u00b7  '+chapters[index];
  ctx.save();ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.font=plateFace(size,'sc');
  // Cleared the way a printer actually clears a running head: a plain band of the sheet's own stock,
  // ruled top and bottom in the plate's own burin, rather than a glow that fades to nothing on every side.
  const half=Math.min(ctx.measureText(head).width*.5+18,W*.42),midY=y-size*.35,halfH=size*.95;
  ctx.fillStyle=`rgba(${ink.base.paperRgb},${onPaper()?.5:.6})`;
  ctx.fillRect(W*.5-half,midY-halfH,half*2,halfH*2);
  burinSegment(ctx,W*.5-half,midY-halfH,W*.5+half,midY-halfH,ink.base.inkSoft,onPaper()?.28:.2,.4,81301,{segments:10,skips:1,hair:false,wobble:.15});
  burinSegment(ctx,W*.5-half,midY+halfH,W*.5+half,midY+halfH,ink.base.inkSoft,onPaper()?.28:.2,.4,81307,{segments:10,skips:1,hair:false,wobble:.15});
  ctx.fillStyle=colors.text;
  ctx.fillText(head,W*.5,y);
  ctx.restore();
}
// The impressum is plate furniture, not a running HUD element. Its centre is stored on the current
// world once, in the lower part of the opening sheet. From then on it is always transformed through
// sx()/sy(), so a rising camera carries the already engraved cartouche downward with the rest of the
// sheet. It is never re-created at the viewport edge and never follows the traveller.
const IMPRESSUM_ROWS=11,IMPRESSUM_REVEAL=.52;
// The nine — now eleven, with the second state and the edition row — rows read as one flat list before
// this: a real setter would never give a princely dedication and a place-line the same weight. Place
// and printer carry the cartouche's headline size; plate, year, the second state and the title stand at
// the plate's ordinary size; the edition number, correction and privilege step down; and the engraver's
// credit and the daily date are set in the same italic gloss every other aside on the sheet is, in the
// plain text face rather than small caps, since they read as notes appended to the plate rather than
// proper names cut into it.
const IMPRESSUM_TIERS={place:1.25,printer:1.25,plate:1,edition:.85,year:1,state:1,title:1,correction:.85,privilege:.85,engraver:.85,daily:.85};
const IMPRESSUM_ITALIC=new Set(['engraver','daily']);
function impressumRowSize(key,size){return size*(IMPRESSUM_TIERS[key]||1);}
function impressumMetrics(){
  const inner=frameBand()*.92+8,size=frameWide()?7.4:6.4,padY=9;
  const width=Math.min(frameWide()?392:320,Math.max(100,W-inner*2-10));
  let rowsHeight=0;for(const key in IMPRESSUM_TIERS)rowsHeight+=impressumRowSize(key,size)*1.48;
  if(impressumHasCompleteAtlas())rowsHeight+=ESCUTCHEON_GAP;
  return {inner,size,padY,width,height:padY*2+rowsHeight};
}
function impressumAnchor(metrics){
  if(!world)return null;
  const min=metrics.inner+metrics.height*.5+4;
  // Nothing is stamped on the plate yet while the frontispiece leaf is still up, so the cartouche does
  // not commit to a spot: it is measured live against the leaf's own occupied band (the MORE disclosure
  // can grow it) rather than the footer alone, and only settles for good — the one-time anchor below —
  // once a run actually begins and the leaf lifts, which is also when the clearance stops applying.
  if(world.state==='ready'){
    const rect=$('start-copy')?.getBoundingClientRect(),top=rect&&Number.isFinite(rect.top)?rect.top:null;
    const clear=top!==null?top-8:H-footerBand();
    const max=Math.max(min,Math.min(H-footerBand(),clear)-metrics.height*.5-7);
    return {x:0,y:world.cameraY+((min<=max?max:(min+max)*.5)-plateShift.y)/scale};
  }
  if(!Number.isFinite(world.impressumY)){
    const max=H-footerBand()-metrics.height*.5-7;
    const target=min<=max?max:(min+max)*.5;
    world.impressumX=0;
    world.impressumY=world.cameraY+(target-plateShift.y)/scale;
  }
  return {x:Number.isFinite(world.impressumX)?world.impressumX:0,y:world.impressumY};
}
// The top of the impressum's cartouche, in screen space, for other lower-margin marginalia to stay
// clear of (src/celestial.js's plate captions, src/effects.js's drifting gloss): each of those hugs
// the footer band on its own account, the same strip the impressum claims at the foot of the opening
// sheet, so left uncoordinated they print straight through it at the start of a run. Answers Infinity
// whenever the cartouche itself would not be drawn — off era, a plain plate, or scrolled past either
// edge — so nothing clamps against a box that isn't actually there to collide with.
function impressumTop(){
  if(!world||eraId()!==0||plainPlate()||!W||!H)return Infinity;
  const m=impressumMetrics(),a=impressumAnchor(m);if(!a)return Infinity;
  const top=sy(a.y)-m.height*.5;
  if(top>H-m.inner||top+m.height<m.inner)return Infinity;
  return top;
}
function impressumHasCapture(){return !!(ledger&&ledger.captures>0)||(world&&world.captures>0);}
function impressumHasConstellation(){
  const lifetime=typeof ledgerStat==='function'?ledgerStat('constellations'):0;
  return lifetime>0||!!(world&&world.constellationsCompleted>0);
}
function impressumHasPerfectChain(){
  const lifetime=!!(ledger&&ledger.observations&&ledger.observations.perfectThree);
  const current=!!(world&&world.observations&&world.observations.some(o=>o.key==='perfectThree'));
  return lifetime||current;
}
function impressumHasRoughImpression(){
  const lifetime=!!(ledger&&ledger.badAngles>0);
  const current=typeof runTally!=='undefined'&&runTally&&runTally.badAngles>0;
  return lifetime||current;
}
// Every world the plate hand-colours — every family in planetFamilies, src/backdrop.js — is a
// surface a 1603 eye had no glass to resolve: a crater field, a ring, a belted giant. Rather than
// move the plate's own dated year, the cartouche admits a second pull: this answers true the first
// time a run captures one of those bodies, lifetime or this run, exactly as the other impressum
// conditions do.
function impressumHasTelescopicBody(){
  const lifetime=!!(ledger&&ledger.telescopicCaptures>0);
  const current=typeof runTally!=='undefined'&&runTally&&runTally.telescopicCaptures>0;
  return lifetime||current;
}
function impressumHasCompleteAtlas(){
  const lifetime=typeof ledgerStat==='function'?ledgerStat('constellations'):0;
  return lifetime>=12||!!(world&&lifetime+world.constellationsCompleted>=12);
}
function impressumRows(){
  const perfect=impressumHasPerfectChain(),complete=impressumHasCompleteAtlas();
  const engraver=typeof engraverCredit==='function'?engraverCredit().toUpperCase():'DELINEAVIT ET SCULPSIT · ORBIS TABULA';
  return [
    {key:'place',text:'AUGUSTÆ VINDELICORUM'},
    {key:'printer',text:'Ex officina Orbis Tabulæ'},
    // TAB. names the plate itself here — the sheet's own number, matching what the running head calls
    // it at the foot of the same chart — with the atlas's edition number moved to its own smaller row
    // rather than sharing the same abbreviation, which used to read as a second, contradictory plate
    // number six inches from the first.
    {key:'plate',text:'TAB. I · A1'},
    {key:'edition',text:'EDITIO V'},
    {key:'year',text:impressumHasCapture()?'Anno MDCIII':''},
    {key:'state',text:impressumHasTelescopicBody()?'AUCTA ET RECUSA · ANNO MDCLXXXVII':''},
    {key:'title',text:impressumHasConstellation()?'URANOMETRIA':''},
    {key:'engraver',text:perfect?engraver:'',device:perfect},
    {key:'correction',text:impressumHasRoughImpression()?'* CORR.':''},
    {key:'privilege',text:complete?'Serenissimo principi · patrono astronomiæ · cum privilegio':''},
    {key:'daily',text:dailyOn?'TABULA DIEI · '+dailyDay+(dailyReplay?' · ITERUM':''):''}
  ];
}
function impressumRowProgress(row){
  if(!row.text)return 0;
  if(reducedMotion||world.state==='ready'||world.state==='dead')return 1;
  return reveal.progress('impressum:'+row.key,IMPRESSUM_REVEAL,true);
}
function impressumDevice(g,x,y,size,alpha,seed){
  const rgb=onPaper()?ink.base.inkStrong:ink.base.inkSoft;
  burinArc(g,x,y,size*.46,0,TAU,rgb,alpha,.55,seed,{segments:14,skips:1,wobble:.18});
  burinSegment(g,x-size*.54,y+size*.5,x+size*.55,y-size*.54,rgb,alpha,.65,seed+7,{segments:4,skips:0,hair:false,wobble:.22});
  burinSegment(g,x-size*.48,y-size*.46,x+size*.28,y+size*.43,rgb,alpha*.82,.5,seed+13,{segments:4,skips:0,hair:false,wobble:.2});
  burinSegment(g,x+size*.22,y+size*.38,x+size*.7,y+size*.05,rgb,alpha*.76,.45,seed+19,{segments:3,skips:0,hair:false,wobble:.18});
}
// The reserved vertical gap the escutcheon takes above the privilege row, and the shield's own height
// within it — a real arms shield rather than a bare dedication line, but small enough it never crowds
// the row it sits over.
const ESCUTCHEON_GAP=20,ESCUTCHEON_SIZE=14;
// A small arms shield above the dedication, once the atlas is complete: the same Scutum Sobiescianum
// silhouette a captured shield node already carries (chargeDevice('shield') in figures.js), cut down
// to cartouche size, field hatched the one direction this plate ever hatches in, charged with the
// plate's own compass-and-quill device, and flanked by a short strapwork curl on either side — the
// ordinary furniture a princely privilege earned on a real plate, not a line of type standing alone.
function impressumEscutcheon(g,cx,cy,alpha){
  if(!(alpha>0))return;
  const rgb=onPaper()?ink.base.inkStrong:ink.base.inkSoft,strong=(onPaper()?.62:.48)*alpha,faint=(onPaper()?.3:.22)*alpha;
  const k=ESCUTCHEON_SIZE/72;
  const face=[[-29,-27],[0,-31],[29,-27],[30,-6],[26,12],[14,29],[0,41],[-14,29],[-26,12],[-30,-6]].map(([px,py])=>[px*k,py*k]);
  g.save();g.translate(cx,cy);
  deviceLine(g,face,rgb,strong,.9,80311,true);
  deviceLine(g,face.map(([px,py])=>[px*.8,py*.8]),rgb,faint,.6,80331,true);
  deviceHatch(g,13*k,-2*k,4,4.4*k,13*k,rgb,faint,80359);
  impressumDevice(g,0,3*k,ESCUTCHEON_SIZE*.3,(onPaper()?.55:.4)*alpha,80371);
  for(const side of [-1,1]){
    const hx=side*ESCUTCHEON_SIZE*.72,a0=side<0?Math.PI*.15:Math.PI*.85,a1=side<0?Math.PI*1.05:-Math.PI*.05;
    burinArc(g,hx,-ESCUTCHEON_SIZE*.08,ESCUTCHEON_SIZE*.24,a0,a1,rgb,faint,.55,80391+side,{segments:6,skips:1});
    burinSegment(g,side*ESCUTCHEON_SIZE*.34,-ESCUTCHEON_SIZE*.18,hx,-ESCUTCHEON_SIZE*.08,rgb,faint,.5,80401+side,{segments:2,hair:false,wobble:.3});
  }
  g.restore();
}
function impressumScreenLine(){
  if(plainPlate())return 'Impressum · ANTE LITTERAS';
  let line='Impressum · AUGUSTÆ VINDELICORUM · TAB. V · I';
  if(dailyOn)line+=' · TABULA DIEI · '+dailyDay+(dailyReplay?' · ITERUM':'');
  return line;
}
// The imprint belongs to the sheet, and where the burin actually cuts it there is nothing for the
// screen to add: the engraved cartouche and this line carry the same place, the same house and the
// same plate number, and the leaf sets them in the same lower margin, so the italic ran straight
// across the rows the cartouche had already put there. The line is kept only for the plates that
// have no cartouche of their own to read — a proof pulled before the letters were cut, and the eras
// whose imprint is not an atlas imprint at all.
function syncImpressumScreen(){
  const line=$('atlas-impressum');if(line)line.textContent=impressumScreenLine();
  const leaf=$('printer-line');if(leaf)leaf.hidden=eraId()===0&&!plainPlate();
}
function drawImpressum(){
  if(!world||eraId()!==0||plainPlate()||!W||!H)return;
  const m=impressumMetrics(),a=impressumAnchor(m),x=sx(a.x),y=sy(a.y),left=x-m.width*.5,top=y-m.height*.5;
  if(top>H-m.inner||top+m.height<m.inner)return;
  const colors=ink.frame,rows=impressumRows();
  ctx.save();
  ctx.beginPath();ctx.rect(m.inner,m.inner,Math.max(0,W-m.inner*2),Math.max(0,H-m.inner*2));ctx.clip();
  burinRect(ctx,left,top,m.width,m.height,ink.base.inkStrong,onPaper()?.6:.42,frameWide()?1:.75,70211);
  burinRect(ctx,left+4,top+4,m.width-8,m.height-8,ink.base.inkSoft,onPaper()?.36:.25,.6,70217);
  ctx.textAlign='center';ctx.textBaseline='middle';
  let ry=top+m.padY;
  for(let i=0;i<rows.length;i++){
    const row=rows[i];
    // The shield takes its own reserved gap right above the privilege row rather than crowding it,
    // matching the extra height impressumMetrics() only grants once the atlas is actually complete.
    if(row.key==='privilege'&&row.text)ry+=ESCUTCHEON_GAP;
    const rowSize=impressumRowSize(row.key,m.size),rowLineH=rowSize*1.48,cy=ry+rowLineH*.5,progress=impressumRowProgress(row);
    if(row.key==='privilege'&&row.text)impressumEscutcheon(ctx,x,ry-ESCUTCHEON_GAP*.5,progress);
    ctx.font=IMPRESSUM_ITALIC.has(row.key)?plateFace(rowSize,'text','italic'):plateFace(rowSize,'sc');
    if(!row.text){
      burinSegment(ctx,left+m.width*.25,cy,left+m.width*.75,cy,ink.base.inkSoft,onPaper()?.16:.1,.35,70231+i,{segments:6,skips:1,hair:false,wobble:.16});
      ry+=rowLineH;continue;
    }
    ctx.fillStyle=colors.text;writeText(ctx,row.text,x,cy,progress,{size:rowSize,nib:true});
    if(row.device&&progress>=1)impressumDevice(ctx,left+m.width*.86,cy,rowSize*.9,onPaper()?.55:.4,70267);
    ry+=rowLineH;
  }
  ctx.restore();
}
// The frontispiece's two action rows (see .action-row, index.html) stand directly on the open plate,
// with no CSS box of their own — a group boxed in CSS there would be a chip laid over the drawing, the
// very thing this cut is meant to stop. The frame around each is cut here instead, in the plate's own
// burin, measured live off the DOM row exactly as drawInkGauge() measures #ink: the row decides its own
// width and wrap, this only draws the rule around whatever it settled on.
function drawActionRowFrame(el){
  if(!el)return;
  const rect=el.getBoundingClientRect();
  if(!(rect.width>0)||!(rect.height>0)||!Number.isFinite(rect.left)||!Number.isFinite(rect.top))return;
  burinRect(ctx,rect.left,rect.top,rect.width,rect.height,ink.frame.tickMinor,onPaper()?.55:.4,.75,80601);
}
function drawActionFrames(){
  if(!world||world.state!=='ready'||eraId()!==0||plainPlate())return;
  drawActionRowFrame($('daily-actions'));
  drawActionRowFrame($('more-actions'));
}
function render(dt){
  // However many strokes are in progress this frame, only one hand cuts the plate: the claim every
  // penNib call registers instead of drawing (reveal.js) is cleared here, at the very top, and whichever
  // candidate is still standing is cut once, at the very bottom, after everything else this frame draws.
  nibClaimReset();
  // A plate that draws its whole frame in its own hand names one painter here (see defineHand() in
  // src/plates.js) and this file steps aside completely; everything below that it does not draw
  // instead is still the atlas's own, since every other painter in this file is unchanged.
  const own=handFor('frame');
  if(own){own(dt,world.aim());updateUI(dt);return;}
  reveal.prime();prewarmGlyph();
  const aim=world.aim();ctx.setTransform(DPR,0,0,DPR,0,0);drawAtmosphere(dt,aim);drawRenaissanceGrid();drawConstellationFigures();drawGravitationalLenses();
  ctx.save();if(!reducedMotion&&world.shake>.08)ctx.translate(Math.sin(world.time*109)*world.shake*scale,Math.cos(world.time*137)*world.shake*.65*scale);
  for(const g of world.nebulas)revealHazard(g,drawHazard);
  drawConnections();drawConstellations();for(const n of world.nodes)drawNode(n,aim);for(const h of world.hazards)revealHazard(h,drawHazard);
  drawAim(aim);drawInkPath();drawSurveys();drawTrail();drawEffects(dt);drawInscriptions(dt);drawImpressum();drawPlayer();drawDark(dt);ctx.restore();
  drawPlateFrame();drawRunningHead();drawHudLeaf();drawActionFrames();
  if(world.state==='paused')drawPauseMagnitudeKey();
  if(screenFlash>0){if(!reducedMotion){ctx.fillStyle=`rgba(${ink.dark.screenFlash},${screenFlash*(onPaper()?.09:.055)})`;ctx.fillRect(0,0,W,H);}if(world.state!=='paused')screenFlash=Math.max(0,screenFlash-dt*3);}
  // The dark's own flash is one frame of the flood's own ink rather than screenFlash's fading warm
  // wash: it is drawn once, at whatever alpha that single frame calls for, then cleared unconditionally
  // so it can never linger into a second frame or survive a pause.
  if(darkFlash>0){if(!reducedMotion){ctx.fillStyle=`rgba(${ink.dark.pigment},${darkFlash*(onPaper()?.09:.055)})`;ctx.fillRect(0,0,W,H);}darkFlash=0;}
  drawChapterReveal(dt);
  // Whichever candidate this frame's marks claimed, drawn once, here, after every one of them has had
  // its turn to register (drawChapterReveal's own letter-stroke nib included) and before the laid
  // paper's own grain goes over the whole sheet last, the way every other mark's ink already sits under it.
  nibClaimDraw();
  drawLaidPaper();
  updateUI(dt);
}
