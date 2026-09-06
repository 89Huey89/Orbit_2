'use strict';
/* Orbit · Era III · The Ceiling
   A playable, render-only reconstruction grounded in Senenmut's astronomical ceiling (TT353).

   Historical boundary:
   - TT353 supplies the light lime-plaster ground, fine black drawing, red setting-out, two-register
     organisation, decan columns, five-point star signs and twelve 24-part month circles.
   - The kheker frieze and the polychrome block border are the standing furniture of a painted
     Egyptian wall rather than a motif borrowed from one object; the snapped red grid under
     everything is the painter's own eighteen-square canon, left where the flood never covered it.
   - The solar night barque, Apep, the Eye of Ra, Shu and Nun belong to the wider Egyptian funerary
     repertoire. Their use as player and force diagrams is an explicit gameplay translation, not a
     claim that those figures occur together on TT353. In particular, TT353 has no Nut arch.
   - The simulation's seven later planetary families are intentionally not painted as surfaces here:
     a pre-telescopic body remains a star sign, disc, or moving star carried in a barque.
*/

const CEILING_PALETTE={
  plaster:'#ddcfad',lime:'#eee4cd',warm:'#cbb98e',loss:'#9d8966',carbon:'#241d16',
  red:'#9d3724',redDark:'#67271d',yellow:'#c4932e',blue:'#285987',green:'#526f59',white:'#eee5d1',
  gloss:'#5f4b34',duat:'#38271e',duatDeep:'#211914'
};
// The checked sign vocabulary: Gardiner's uniliterals, four logograms and the five ready-made groups,
// every codepoint carried over from the research file rather than looked up again here. A word this
// table cannot spell is not written on the wall at all — the sheet would rather be quiet than invent
// an inscription.
const CEILING_G={a:0x1313f,i:0x131cb,w:0x13171,b:0x130c0,p:0x132aa,f:0x13191,m:0x13153,n:0x13216,
  r:0x1308b,h:0x13254,H:0x1339b,x:0x1340d,s:0x132f4,g:0x133bc,t:0x133cf,
  eye:0x13079,sun:0x131f3,setAnimal:0x130e9,feather:0x13184,star:0x131f4};
const CEILING_RG={mw:[0x13217],hd:[0x13321,0x133cf],dsrt:[0x132aa,0x133cf],ikm:[0x133bc,0x13153]};
// A word is a column of quadrats; a quadrat is one, two or three signs sharing one square, and a
// quadrat headed by 'h' sets its pair side by side instead of stacked. This is the layout the wall
// actually uses, and setting one sign per line — which is what this sheet did before — is not
// writing but a list of pictures.
const CEILING_WORD={
  hour:{q:[[CEILING_G.w,CEILING_G.n],[CEILING_G.w,CEILING_G.t]],tr:'wnwt',gl:'hour'},
  foreleg:{q:[[CEILING_G.m,CEILING_G.s],[CEILING_G.x,CEILING_G.t],[CEILING_G.i,CEILING_G.w]],tr:'msḫtjw',gl:'the Foreleg'},
  sah:{q:[[CEILING_G.s],[CEILING_G.a,CEILING_G.H]],tr:'Sꜣḥ',gl:'Sah · Orion'},
  apep:{q:[[CEILING_G.a],['h',CEILING_G.p,CEILING_G.p]],tr:'ꜥꜣpp',gl:'Apep'},
  eye:{q:[[CEILING_G.eye],[CEILING_G.sun]],tr:'jrt Rꜥ',gl:'the Eye of Ra'},
  shu:{q:[[CEILING_G.feather]],tr:'Šw',gl:'Shu'},
  nun:{q:[[CEILING_G.n],[CEILING_G.w,CEILING_G.n]],tr:'Nwn',gl:'Nun'},
  sekhmet:{q:[[CEILING_G.s,CEILING_G.x],[CEILING_G.m,CEILING_G.t]],tr:'sḫmt',gl:'Sekhmet'},
  set:{q:[[CEILING_G.setAnimal]],tr:'stẖ',gl:'Set'},
  water:{q:[CEILING_RG.mw],tr:'mw',gl:'water'},
  white:{q:[CEILING_RG.hd],tr:'ḥḏ',gl:'white'},
  red:{q:[CEILING_RG.dsrt],tr:'dšrt',gl:'the red land'},
  shield:{q:[CEILING_RG.ikm],tr:'ikm',gl:'shield'},
  star:{q:[[CEILING_G.star]],tr:'sbꜣ',gl:'star'}
};
// The columns beside the route are decan-name columns on the wall itself. These are the words the
// vocabulary above can spell in full; the order is fixed so the sheet paints identically every load.
const CEILING_COLUMNS=['hour','foreleg','star','water','sah','apep','nun','white','red','shu','sekhmet','set','eye','shield'];
// The twelve month circles are captioned from the same checked vocabulary rather than an invented
// calendar: twelve of CEILING_WORD's fourteen entries are enough to give every wheel a caption line
// without a word the table cannot spell, so nothing here is short of the twelve the correction asks for.
const CEILING_MONTH_NAMES=['star','water','white','red','shu','nun','sekhmet','set','eye','shield','sah','apep'];
const CEILING_HOURS=['FIRST WATCH','SECOND WATCH','MIDDLE WATCH','BEFORE DAWN'];
// The wall's own names for the three courses the opening circles offer, standing in for the atlas's
// TIRO, ADEPTUS and MAGISTER (src/simulation.js's DIFFICULTY_LABELS). They are captions on a night's
// voyage rather than grades of a practitioner, because that is the register everything else on this
// sheet speaks in, and they are read both by the circles themselves and by src/ui.js's announcement,
// so the two can never drift apart. They are kept short on purpose: the outer two are set under the
// circles nearest the edge, where a longer caption runs under the marginal month circles on a phone.
const CEILING_COURSES={relaxed:'QUIET NIGHT',classic:'FULL NIGHT',hardcore:'HARD NIGHT'};
let ceilingWall=null,ceilingWallKey='',ceilingWallWatch=-1;
// P2 · a register per watch. ceilingWall is keyed on the watch as well as the size, so each of the
// four now bakes its own tile (see ceilingWatch()/ceilingBakeWall() below). ceilingChangeover is the
// one place this file ever holds a second tile at once: the outgoing register, still passing below,
// alongside the incoming one baked and waiting while the painted band in ceilingDrawChangeover() is
// seen doing the work. It is never more than these two, and it is dropped — freeing the outgoing
// tile — the instant that band finishes, so the peak cost of four watches is twice one tile, briefly,
// not four times it standing the whole run.
let ceilingChangeover=null;
const CEILING_CHANGE_DUR=1.2;
// The room's own architecture — the kheker frieze and the foot's block rule — is cached separately
// from the tall passing strip below, because it never moves: see ceilingDrawRegisterGrid(). Each is
// only as tall as the band it actually draws, not a full screen-sized sheet, since the two together
// are otherwise pinned exactly the way this file always pinned the whole wall.
let ceilingFrameTop=null,ceilingFrameBot=null,ceilingFrameKey='';
// The barque's last known heading, held between frames so a passing moment of near-zero horizontal
// speed (the tip of a climb or dive) does not flicker the mirror back and forth.
let ceilingFacing=1;
// The one expression that names which of the four watches is current, shared by the wall's own bake
// (which register to paint) and the running head (which word to print) so the two can never drift.
function ceilingWatch(){return world?clamp(Math.floor(world.progress/8),0,3):0;}

function invalidateCeilingArt(){ceilingWall=null;ceilingWallKey='';ceilingWallWatch=-1;ceilingChangeover=null;ceilingFrameTop=null;ceilingFrameBot=null;ceilingFrameKey='';}
// The wall is painted into a cached canvas once, and a face that has not arrived yet paints nothing
// at all — the sign columns would stay blank for the whole visit, which is exactly what they did.
// Entering the era therefore asks for both of its hands by name and repaints the wall when they land.
function ceilingFaceReady(){
  if(!document.fonts||!document.fonts.load)return;
  Promise.all([document.fonts.load('16px "Noto Egyptian Hieroglyphs"',String.fromCodePoint(CEILING_G.w)),
    document.fonts.load('16px "Zilla Slab"','ORBIT')]).then(()=>{invalidateCeilingArt();if(world)render(0);}).catch(()=>{});
}
function ceilingHash(a,b=0){
  let h=Math.imul(((a*1009+b*9176)|0)^0x9e3779b9,2654435761);h^=h>>>15;h=Math.imul(h,2246822519);h^=h>>>13;
  return(h>>>0)/4294967296;
}
function ceilingArcPoints(cx,cy,r,a0,a1,count=24){
  const out=[];for(let i=0;i<=count;i++){const a=lerp(a0,a1,i/count);out.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return out;
}
function ceilingBrush(g,points,color=CEILING_PALETTE.carbon,width=1,alpha=1,seed=1,progress=1){
  if(!points||points.length<2||alpha<=0)return null;
  g.save();g.strokeStyle=color;g.globalAlpha=alpha;g.lineCap='round';g.lineJoin='round';g.lineWidth=width;
  g.beginPath();
  let head=null;
  if(progress>=1){
    for(let i=0;i<points.length;i++){
      const p=points[i],j=(ceilingHash(seed+i*13,p[0]+p[1])-.5)*Math.min(.7,width*.24);
      if(i)g.lineTo(p[0]+j,p[1]-j*.45);else g.moveTo(p[0]+j,p[1]-j*.45);
    }
  }else{
    // A stroke still travelling is walked to an exact length fraction along its own jittered path, not
    // the raw polyline, so the brush the caller parks at the head rides the same line the ink does
    // instead of drifting off it. Only asked for while a mark is mid-reveal, so the ordinary case above
    // — the whole run of the sheet, every finished mark, every frame — allocates nothing extra.
    const jx=[],jy=[];let total=0;
    for(let i=0;i<points.length;i++){
      const p=points[i],j=(ceilingHash(seed+i*13,p[0]+p[1])-.5)*Math.min(.7,width*.24);
      jx.push(p[0]+j);jy.push(p[1]-j*.45);
      if(i)total+=Math.hypot(jx[i]-jx[i-1],jy[i]-jy[i-1]);
    }
    const target=total*clamp(progress,0,1);let along=0;g.moveTo(jx[0],jy[0]);
    for(let i=1;i<jx.length;i++){
      const seg=Math.hypot(jx[i]-jx[i-1],jy[i]-jy[i-1]),reach=along+seg;
      if(reach>=target||i===jx.length-1){
        const f=seg>1e-6?clamp((target-along)/seg,0,1):1,hx=lerp(jx[i-1],jx[i],f),hy=lerp(jy[i-1],jy[i],f);
        g.lineTo(hx,hy);head={x:hx,y:hy,angle:Math.atan2(jy[i]-jy[i-1],jx[i]-jx[i-1])};break;
      }
      g.lineTo(jx[i],jy[i]);along=reach;
    }
  }
  g.stroke();
  if(width>1.2){
    g.globalAlpha=alpha*.18;g.lineWidth=Math.max(.35,width*.25);g.translate(.65,-.45);g.stroke();
  }
  g.restore();
  return head;
}
// The loaded reed at the leading end of a travelling stroke: broad across the stroke and tapering to
// the point, on a hairline shaft trailing back the way the atlas's nib does — a brush, not a wedge, so
// there is no hard point and no ferrule. Coloured for whichever pass it belongs to. The fleck of
// spatter is seeded from the position so it sits still on the wall instead of boiling, and reduced
// motion draws none of it, same guard as penNib.
function ceilingReed(g,x,y,angle,alpha=1,rgb){
  if(reducedMotion||alpha<=.02)return;
  const tone=rgb||CEILING_PALETTE.carbon,reach=Math.max(6,7*scale);
  g.save();g.translate(x,y);g.rotate(angle);g.fillStyle=tone;
  g.globalAlpha=.92*alpha;g.beginPath();
  g.moveTo(0,0);g.lineTo(-reach*.6,-reach*.38);g.lineTo(-reach*.98,-reach*.15);g.lineTo(-reach*.98,reach*.15);g.lineTo(-reach*.6,reach*.38);g.closePath();g.fill();
  g.globalAlpha=.4*alpha;g.strokeStyle=tone;g.lineWidth=.6;
  g.beginPath();g.moveTo(-reach*.78,0);g.lineTo(-reach*2.1,-reach*.32);g.stroke();
  g.restore();
  const grid=(Math.floor(x/7)*73856093^Math.floor(y/7)*19349663)>>>0;
  if((grid&7)===0){
    g.save();g.fillStyle=tone;g.globalAlpha=.22*alpha;
    for(let i=0;i<2;i++){
      const a=((grid>>>(3+i*5))&31)/32*TAU,d=reach*(.7+((grid>>>(8+i*5))&15)/15);
      g.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d,.8,.8);
    }
    g.restore();
  }
}
// The wet edge just behind the tip: a dark, wet core with a wider, fainter bloom drying back toward the
// pigment's own value around it — the wall's counterpart of penBead, flat like everything else here.
function ceilingWet(g,x,y,size,alpha=1,rgb){
  if(reducedMotion||alpha<=.02)return;
  const tone=rgb||CEILING_PALETTE.carbon;
  g.save();g.fillStyle=tone;
  g.globalAlpha=.62*alpha;g.beginPath();g.ellipse(x,y,size*1.15,size*.95,0,0,TAU);g.fill();
  g.globalAlpha=.28*alpha;g.beginPath();g.ellipse(x,y,size*1.75,size*1.45,0,0,TAU);g.fill();
  g.restore();
}
function ceilingPolygon(g,points,fill,stage=1,seed=1,width=1.2){
  if(!points.length||stage<=0)return;
  const s1=clamp(stage*4,0,1),s2=clamp((stage-.25)*4,0,1),s3=clamp((stage-.5)*4,0,1),s4=clamp((stage-.75)*4,0,1);
  const sketch=points.map((p,i)=>[p[0]+(ceilingHash(seed,i)-.5)*2.4+1.2,p[1]+(ceilingHash(i,seed)-.5)*2.2-1]);
  // A fixed sliver of the red setting-out is never fully covered, seeded from the mark's own seed so no
  // two figures on the wall are finished to quite the same degree — the flood simply never reached that
  // much of the cord. This is a static property of the finished mark, so it stands under reduced motion
  // exactly as it does mid-reveal.
  const survive=.05+ceilingHash(seed+503)*.15;
  ceilingBrush(g,sketch.concat([sketch[0]]),CEILING_PALETTE.red,Math.max(.65,width*.72),(survive+.4*(1-s4))*s1,seed);
  if(s2>0)ceilingBrush(g,points.concat([points[0]]),CEILING_PALETTE.carbon,Math.max(.55,width*.72),.28*s2,seed+31);
  if(s3>0){
    g.save();g.globalAlpha=s3;g.fillStyle=fill;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.restore();
  }
  // The closing black line is the mark's last stroke, so it is the one worth seeing laid: while it
  // travels, only the covered length is drawn and the reed rides its head; once it is finished the line
  // is exactly what it was before this brush existed. The earlier three passes stay a cross-fade — a
  // wall this thick with marks would turn to noise if every pass travelled at once, and the closing
  // line is the one a player's eye is already on, since it is what makes a mark read as done.
  if(s4>0){
    const closed=points.concat([points[0]]);
    if(s4<1){
      const head=ceilingBrush(g,closed,CEILING_PALETTE.carbon,width,.92,seed+67,s4);
      if(head){ceilingWet(g,head.x,head.y,Math.max(1,width*.85),.7,CEILING_PALETTE.carbon);ceilingReed(g,head.x,head.y,head.angle,.85,CEILING_PALETTE.carbon);}
    }else ceilingBrush(g,closed,CEILING_PALETTE.carbon,width,.92*s4,seed+67);
  }
}
// N14, the star sign. Two things about it belong to the wall rather than to a modern chart, and this
// used to have only the first: it sets one point downward and two arms up, and its arms are lens
// shaped — two curved edges meeting at a point at the hub and again at the tip, the shape a loaded
// brush leaves when it is dragged off to a point — not the straight-sided lobes of a pentagram.
// ceilingBorderStar already carried that correction for the band unit; the sign the whole route is
// drawn around had stayed the pentagram the comment here claimed the wall does not print.
// Everything that varies varies off the mark's own seed and nothing off the clock: each arm's length,
// the depth of the valley between one arm and the next, how much belly each of the ten edges carries,
// and a wobble of the whole sign about the one-point-down orientation — a wobble, where a band star
// takes a free rotation, because at figure scale the orientation is the sign's own grammar while a
// band is a texture. The unit-radius outline is cached against the seed: a node redraws every frame
// and its shape is a property of the node, not of the frame.
const CEILING_STAR_OUTLINES=new Map();
function ceilingStarOutline(seed){
  let pts=CEILING_STAR_OUTLINES.get(seed);if(pts)return pts;
  const rot=Math.PI/2+(ceilingHash(seed,211)-.5)*.34,tips=[],valleys=[];
  for(let i=0;i<5;i++){
    const a=rot+i*TAU/5+(ceilingHash(seed+i*7,227)-.5)*.26,len=.82+ceilingHash(seed+i*3,229)*.34;
    tips.push([Math.cos(a)*len,Math.sin(a)*len]);
    const av=rot+(i+.5)*TAU/5+(ceilingHash(seed+i*5,233)-.5)*.22,w=.25+ceilingHash(seed+i*11,239)*.11;
    valleys.push([Math.cos(av)*w,Math.sin(av)*w]);
  }
  pts=[];
  // Every edge is a quadratic whose control point is its own midpoint pushed straight out from the
  // centre, so the belly bulges away from the hub however uneven the two ends it runs between are.
  const edge=(a,b,bow)=>{
    const mx=(a[0]+b[0])*.5*(1+bow),my=(a[1]+b[1])*.5*(1+bow);
    for(let s=1;s<=4;s++){const t=s/4,u=1-t;pts.push([u*u*a[0]+2*u*t*mx+t*t*b[0],u*u*a[1]+2*u*t*my+t*t*b[1]]);}
  };
  for(let i=0;i<5;i++){
    edge(valleys[(i+4)%5],tips[i],.17+ceilingHash(seed+i*17,241)*.14);
    edge(tips[i],valleys[i],.17+ceilingHash(seed+i*19,251)*.14);
  }
  if(CEILING_STAR_OUTLINES.size>400)CEILING_STAR_OUTLINES.clear();
  CEILING_STAR_OUTLINES.set(seed,pts);return pts;
}
function ceilingStar(g,cx,cy,r,fill=CEILING_PALETTE.yellow,stage=1,seed=1,hub=true){
  const u=ceilingStarOutline(seed),p=new Array(u.length);
  for(let i=0;i<u.length;i++)p[i]=[cx+u[i][0]*r,cy+u[i][1]*r];
  ceilingPolygon(g,p,fill,stage,seed,Math.max(.8,r*.12));
  // The ringed hub the facsimile sets where five arm bases meet, there to cover what would otherwise
  // be a knot of coincident line-ends — so it is laid last, after the closing black line, and only
  // where the sign is drawn big enough for the ring to be a ring rather than a blot.
  if(hub&&stage>.78&&r>9){
    const hr=r*.17;g.save();g.globalAlpha=clamp((stage-.78)/.22,0,1)*.85;
    g.strokeStyle=CEILING_PALETTE.carbon;g.lineWidth=Math.max(.5,hr*.34);g.beginPath();g.arc(cx,cy,hr,0,TAU);g.stroke();
    g.fillStyle=CEILING_PALETTE.carbon;g.beginPath();g.arc(cx,cy,Math.max(.5,hr*.32),0,TAU);g.fill();g.restore();
  }
}
// ---------- The wall's second hand: signs, quadrats, words, numbers ----------
// A sign is painted, not typed. The face supplies the shape and the four passes supply the hand: a
// red setting-out laid off register, a thin black correction, the flat flood, and the black line
// that closes it last. What that buys is the thing a font cannot give — an edge that was made by
// something wet, and no two signs identical.
function ceilingSign(g,cp,x,y,size,col=CEILING_PALETTE.carbon,stage=1,seed=1){
  if(stage<=0||!cp)return;
  const s1=clamp(stage*4,0,1),s2=clamp((stage-.25)*4,0,1),s3=clamp((stage-.5)*4,0,1),s4=clamp((stage-.75)*4,0,1);
  const ch=String.fromCodePoint(cp),jx=(ceilingHash(seed,cp)-.5)*size*.06,jy=(ceilingHash(cp,seed)-.5)*size*.05;
  // The same per-mark sliver of red that a painted figure keeps, seeded by the sign and its own glyph
  // so a column of letters does not all fade to the same resting shade.
  const survive=.04+ceilingHash(seed+509,cp)*.14;
  g.save();g.font=plateFace(size,'hiero');g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  if(s1>0){g.globalAlpha=(survive+.36*(1-s4))*s1;g.fillStyle=CEILING_PALETTE.red;g.fillText(ch,x+jx+size*.07,y+jy-size*.06);}
  if(s2>0){g.globalAlpha=.3*s2;g.fillStyle=CEILING_PALETTE.carbon;g.fillText(ch,x+jx*.4,y+jy*.4);}
  if(s3>0){g.globalAlpha=s3;g.fillStyle=col;g.fillText(ch,x,y);}
  if(s4>0){
    g.globalAlpha=.8*s4;g.strokeStyle=CEILING_PALETTE.carbon;g.lineWidth=Math.max(.45,size*.03);g.strokeText(ch,x,y);
    // Where the brush reloaded it laid the pigment on twice; the doubling is a hair off register.
    g.globalAlpha=.16*s4;g.fillStyle=col;g.fillText(ch,x+.55,y-.45);
    // A sign cannot be travelled through a font's own outline, so this is its only concession to the
    // brush: a wet edge that blooms and dries back over the closing stroke, gone once the letter is done.
    if(s4<1)ceilingWet(g,x,y,size*.16,.55*Math.sin(clamp(s4,0,1)*Math.PI),CEILING_PALETTE.carbon);
  }
  g.restore();
}
// One, two or three signs sharing one square. Stacking is what makes a column read as writing, and
// it is the layout note this sheet carried as "not achieved" for as long as it set one sign a line.
function ceilingQuadrat(g,q,x,y,cell,col,stage=1,seed=1){
  if(!q||!q.length)return;
  if(q[0]==='h'){ceilingSign(g,q[1],x-cell*.24,y,cell*.5,col,stage,seed);ceilingSign(g,q[2],x+cell*.24,y,cell*.5,col,stage,seed+3);return;}
  if(q.length===1){ceilingSign(g,q[0],x,y,cell*.88,col,stage,seed);return;}
  if(q.length===2){ceilingSign(g,q[0],x,y-cell*.24,cell*.5,col,stage,seed);ceilingSign(g,q[1],x,y+cell*.25,cell*.5,col,stage,seed+3);return;}
  ceilingSign(g,q[0],x,y-cell*.29,cell*.4,col,stage,seed);
  ceilingSign(g,q[1],x-cell*.21,y+cell*.21,cell*.42,col,stage,seed+3);
  ceilingSign(g,q[2],x+cell*.21,y+cell*.21,cell*.42,col,stage,seed+7);
}
// A caption is a column of quadrats between two ruled lines, which is the ceiling's own habit.
function ceilingWordColumn(g,word,x,topY,cell,col,alpha=1,stage=1){
  const w=CEILING_WORD[word];if(!w||!w.q.length)return 0;
  const depth=w.q.length*cell;
  g.save();g.globalAlpha=alpha;
  ceilingBrush(g,[[x-cell*.6,topY-cell*.55],[x-cell*.6,topY+depth-cell*.4]],CEILING_PALETTE.carbon,.75,.62,x|0);
  ceilingBrush(g,[[x+cell*.6,topY-cell*.55],[x+cell*.6,topY+depth-cell*.4]],CEILING_PALETTE.carbon,.75,.4,(x|0)+7);
  for(let i=0;i<w.q.length;i++)ceilingQuadrat(g,w.q[i],x,topY+i*cell,cell,col,stage,(x|0)+i*31);
  g.restore();return depth;
}
// The same word set across instead of down, for the places a column has no height to stand in.
function ceilingWordRow(g,word,cx,y,cell,col,alpha=1,stage=1){
  const w=CEILING_WORD[word];if(!w||!w.q.length)return 0;
  const span=w.q.length*cell,left=cx-span/2+cell/2;
  g.save();g.globalAlpha=alpha;
  for(let i=0;i<w.q.length;i++)ceilingQuadrat(g,w.q[i],left+i*cell,y,cell,col,stage,(cx|0)+i*37);
  g.restore();return span;
}
// The decan field: on the facsimile a decan column is a star table, not a caption — narrow columns
// ruled on both sides, packed wall to wall, dozens deep, most of them carrying only a short run of
// quadrats and a star before the ruling simply keeps going, empty, for the rest of the column's
// length. This draws one side's whole share of that field as nSub adjoining columns spanning the
// margin's full height: the dividing rules are drawn once each, nSub+1 lines rather than 2*nSub, since
// neighbours share an edge on a real ruled sheet; a third or so of the columns are left as ruling only
// (at most a stray star or two, since even a wall's emptiest column is rarely perfectly bare); and the
// rest are walked down with the checked fourteen-word list, a border star — the frame band's own unit,
// reused rather than invented twice — marking where each run of signs gives out, well short of the
// column's own foot. avoidY/figClear keep this generic content, never the ruling, clear of whichever
// circumpolar figure is out this watch on the same side: the animal's own caption is drawn by the
// caller right there, and a real canon grid would still run behind a painted figure, not stop at it.
// One mark from src/signs-tt353.js, set at a chosen height. The bank's marks are ink-outline traces
// carrying their own counters, so the shape is filled even-odd — outer flooded, holes cut back out —
// which is how the wall itself finishes a sign: flat colour closed by its own line, not a hollow
// drawing. The facsimile records the drawing; the wall was painted.
function ceilingTracedMark(g,m,x,y,h,col,alpha){
  if(!m||!m.outer||m.outer.length<3)return;
  g.save();g.globalAlpha=alpha;g.fillStyle=col;g.beginPath();
  const run=pts=>{for(let i=0;i<pts.length;i++){const px=x+pts[i][0]*h,py=y+pts[i][1]*h;if(i)g.lineTo(px,py);else g.moveTo(px,py);}g.closePath();};
  run(m.outer);if(m.counters)for(const c of m.counters)if(c.length>2)run(c);
  g.fill('evenodd');g.restore();
}
// Which marks a traced column may set. The bank's own header is binding here: these are traced marks
// reproduced as drawing, and their order spells nothing — so a column takes either a word the checked
// vocabulary can spell in full, or marks from the bank, and never both. Mixing them inside one column
// would make a mark look like part of the word beside it, which is the one claim this data may not make.
const ceilingSignBank=()=>typeof SIGNS_TT353!=='undefined'&&SIGNS_TT353.marks?SIGNS_TT353.marks.filter(m=>m.kind==='sign'):null;
function ceilingDecanField(g,xNear,xFar,loY,hiY,side,nSub,cell,rot,avoidY,figClear,alpha){
  const subW=(xFar-xNear)/nSub,pad=cell*.5;
  for(let k=0;k<=nSub;k++){
    // A ruled line snapped by eye leans a hair off true rather than running dead straight, so each
    // rule is walked as three points with the middle one nudged sideways instead of a bare two-point
    // line — cheap, and it is what stops a wall of them reading as a printed table's gridlines.
    const x=xNear+k*subW,al=alpha*(.85+ceilingHash(rot+k,side*97)*.35),bow=(ceilingHash(rot+k*5,side*61+3)-.5)*cell*.6,
      midY=(loY+hiY)*.5;
    ceilingBrush(g,[[x,loY-pad],[x+bow,midY],[x,hiY+pad]],CEILING_PALETTE.carbon,.65,al,rot*11+k*13+side*503+7);
  }
  // A side that happened to roll every one of its columns blank would read as an empty lane rather
  // than a quiet one, so at least the outermost column — nearest the star border, and the one the
  // facsimile itself never leaves bare — always carries content.
  const blank=new Array(nSub);let anyContent=false;
  for(let k=0;k<nSub;k++){blank[k]=ceilingHash(rot*29+k*41+side*757,3)<.24;if(!blank[k])anyContent=true;}
  if(!anyContent)blank[0]=false;
  let cursor=0;
  for(let k=0;k<nSub;k++){
    // The sign has to fit inside its own share of the lane, between its own two rules, so its size is
    // read off subW — the column's actual pitch once nSub is known — rather than off the fixed outer
    // cell that sized the single old column; a fixed size stopped noticing when four columns replaced
    // one and started running signs into their neighbours.
    const cx=xNear+(k+.5)*subW,jitter=.86+ceilingHash(rot+k*3,side+9)*.3,ccell=Math.max(6,subW*.84*jitter),
      seed=rot*29+k*41+side*757,starAlpha=Math.min(.8,alpha+.32);
    if(blank[k]){
      // A column's star count is its data, on a real star table, so it is not fixed at one or two:
      // most columns carry a couple, spread loosely down the lane, but some run a tight cluster of
      // four or five, close enough together to read as a run rather than a scatter.
      const roll=ceilingHash(seed,5),stars=roll<.42?1:roll<.7?2:roll<.88?4:5,cluster=stars>2,
        step=cluster?ccell*.6:(hiY-loY)*.4,y0b=loY+ccell*1.4+(hiY-loY)*(cluster?ceilingHash(seed,13)*.28:.16);
      for(let s=0;s<stars;s++){
        const y=cluster?y0b+s*step*(.8+ceilingHash(seed+s,19)*.4):loY+ccell*1.5+(hiY-loY)*(.18+ceilingHash(seed+s,11)*.6);
        if(y>hiY-ccell*.3)break;
        if(avoidY==null||Math.abs(y-avoidY)>=figClear)ceilingAsteriskStar(g,cx,y,Math.max(2,ccell*.3),starAlpha,seed+s*17);
      }
      continue;
    }
    let y=loY+ccell*.7;const limitY=loY+(hiY-loY)*(.4+ceilingHash(seed,23)*.26),kAlpha=alpha*(.8+ceilingHash(seed,61)*.4);
    // Roughly two columns in five are set from the traced bank instead of from the vocabulary. That is
    // what buys the density the facsimile has and the checked table cannot: a wall packed with columns
    // it can spell would need a vocabulary this sheet does not honestly have, and inventing one is the
    // fault this era's file exists to prevent.
    const bank=ceilingSignBank(),traced=bank&&bank.length&&ceilingHash(seed*3+11,29)<.4;
    if(traced){
      let ty=loY+ccell*.7,n=0;
      while(ty<limitY-ccell*.3){
        if(avoidY!=null&&Math.abs(ty-avoidY)<figClear){ty+=ccell*1.6;n++;continue;}
        const m=bank[(cursor+n*3+rot+side*5)%bank.length],h=ccell*(.62+ceilingHash(seed+n,37)*.3);
        ceilingTracedMark(g,m,cx+(ceilingHash(seed+n,41)-.5)*ccell*.12,ty,h,CEILING_PALETTE.carbon,kAlpha);
        ty+=h*1.42;n++;
      }
      cursor+=n;
      // The ruling runs on below the last mark exactly as it does under a spelled column, and the star
      // run that follows is the column's own count, so a traced column is a decan column like any other.
      const roll=ceilingHash(seed,53),stars=roll<.5?1:roll<.82?2:3;
      for(let s2=0;s2<stars;s2++){
        const sy=limitY+ (hiY-limitY)*(.14+ceilingHash(seed+s2,71)*.6);
        if(avoidY==null||Math.abs(sy-avoidY)>=figClear)ceilingAsteriskStar(g,cx,sy,Math.max(2,ccell*.3),starAlpha,seed+s2*23);
      }
      continue;
    }
    while(y<limitY-ccell*.3){
      if(avoidY!=null&&Math.abs(y-avoidY)<figClear){y+=ccell*1.6;continue;}
      const word=CEILING_COLUMNS[(cursor+rot+side*7)%CEILING_COLUMNS.length],w=CEILING_WORD[word];cursor++;
      if(w){
        g.save();g.globalAlpha=kAlpha;
        for(let i=0;i<w.q.length&&y<limitY;i++,y+=ccell)ceilingQuadrat(g,w.q[i],cx,y,ccell,CEILING_PALETTE.carbon,1,seed+i*7+cursor*3);
        g.restore();
      }
      if(y<limitY-ccell*.4){ceilingAsteriskStar(g,cx,y,Math.max(2.2,ccell*.32),starAlpha,seed+cursor*13);y+=ccell*1.15;}
    }
  }
}
// Egyptian numerals: stroke, heel-bone, coil of rope, lotus. Base ten, additive, no zero, and signs
// of one value stacked in a block of up to three rows, which is why a small count reads at a glance.
// The score stays an Arabic figure — it has to be read at speed — but a count the sheet itself makes,
// like the hour, is written the way the wall would have written it.
function ceilingNumSign(g,kind,cx,cy,w,h,col){
  const width=Math.max(1.1,h*.13);
  if(kind===1)ceilingBrush(g,[[cx,cy-h*.42],[cx+h*.02,cy+h*.42]],col,width,.9,cx+cy);
  else if(kind===10){
    const p=[];for(let i=0;i<=14;i++){const a=Math.PI+i/14*Math.PI;p.push([cx+Math.cos(a)*w*.4,cy+h*.32+Math.sin(a)*h*.6]);}
    ceilingBrush(g,p,col,width,.9,cx*3+cy);
  }else if(kind===100){
    const r=Math.min(w,h)*.44,p=[];for(let i=0;i<=26;i++){const t=i/26,a=-1.1+t*8.2,rr=r*(.34+.66*t);p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
    ceilingBrush(g,p,col,Math.max(1,h*.1),.9,cx*5+cy);
  }else{
    ceilingBrush(g,[[cx-w*.05,cy+h*.44],[cx,cy+h*.02]],col,width,.9,cx*7+cy);
    ceilingBrush(g,[[cx,cy+h*.04],[cx-w*.16,cy-h*.14],[cx-w*.3,cy-h*.3],[cx-w*.32,cy-h*.44]],col,Math.max(.9,h*.09),.9,cx*11+cy);
    ceilingBrush(g,[[cx,cy+h*.04],[cx-w*.03,cy-h*.44]],col,Math.max(.9,h*.09),.9,cx*13+cy);
    ceilingBrush(g,[[cx,cy+h*.04],[cx+w*.16,cy-h*.14],[cx+w*.3,cy-h*.3],[cx+w*.32,cy-h*.44]],col,Math.max(.9,h*.09),.9,cx*17+cy);
  }
}
const CEILING_NW={1:.2,10:.34,100:.36,1000:.44};
const ceilingNumRows=c=>c<=3?1:c<=6?2:3;
function ceilingNumWidth(n,h){
  let w=0;for(const k of [1000,100,10,1]){const c=Math.floor(n/k)%10;if(c)w+=Math.ceil(c/ceilingNumRows(c))*h*CEILING_NW[k]+h*.1;}
  return Math.max(0,w-h*.1);
}
function ceilingNumber(g,n,x,y,h,col=CEILING_PALETTE.carbon,center=false){
  const total=ceilingNumWidth(n,h);let left=center?x-total/2:x;
  for(const k of [1000,100,10,1]){
    const c=Math.floor(n/k)%10;if(!c)continue;
    const rows=ceilingNumRows(c),per=Math.ceil(c/rows),sw=h*CEILING_NW[k],rh=h/rows;
    for(let i=0;i<c;i++)ceilingNumSign(g,k,left+sw*(i%per+.5),y+rh*(Math.floor(i/per)+.5),sw*.92,rh*.92,col);
    left+=per*sw+h*.1;
  }
  return total;
}
// ---------- The wall's standing furniture ----------
// The kheker frieze: a bundle of reeds bound at the neck and let splay at the head, repeated along
// the top of a painted wall. It is the one piece of Egyptian architecture that is only ever
// decoration, and it is what tells the eye at a glance that the surface it crowns is a painted room.
function ceilingKheker(g,x0,x1,y,h){
  const cols=[CEILING_PALETTE.red,CEILING_PALETTE.blue,CEILING_PALETTE.yellow],step=Math.max(19,Math.min(30,(x1-x0)/24));
  for(let x=x0,i=0;x<=x1-step*.55;x+=step,i++){
    // Each bundle gets its own size and a little give in where it sits along the crown — a reed
    // bundle bound by hand is never quite the same girth as its neighbour, and the row it stands on
    // is not a ruled line — plus a heavier or lighter pass on the splay, the same reloaded-brush
    // unevenness ceilingBrush's own thicker stroke already fakes for a single mark, read here across
    // the whole frieze instead of within one.
    const jit=.86+ceilingHash(i,7)*.32,b=x+step*.5+(ceilingHash(i,13)-.5)*step*.22,c=cols[i%3],u=h/16*jit,
      drop=(ceilingHash(i,19)-.5)*h*.06,load=.72+ceilingHash(i,23)*.5;
    ceilingPolygon(g,[[b-u*1.9,y+h+drop],[b-u*1.9,y+h*.52+drop],[b-u*2.7,y+h*.44+drop],[b-u*1.1,y+h*.36+drop],[b+u*1.1,y+h*.36+drop],[b+u*2.7,y+h*.44+drop],[b+u*1.9,y+h*.52+drop],[b+u*1.9,y+h+drop]],CEILING_PALETTE.white,1,i*17+3,1);
    for(let k=-2;k<=2;k++)ceilingBrush(g,[[b+k*u*.85,y+h*.36+drop],[b+k*u*2.5,y+h*.02+drop]],k%2?c:CEILING_PALETTE.carbon,Math.max(1,u*.7*load),.7+.18*load,i*29+k*5);
    ceilingBrush(g,[[b-u*2.9,y+h*.51+drop],[b+u*2.9,y+h*.51+drop]],c,Math.max(1,u*.8),.9,i*31);
    ceilingBrush(g,[[b-u*2.9,y+h*.64+drop],[b+u*2.9,y+h*.64+drop]],CEILING_PALETTE.carbon,Math.max(.55,u*.45),.62,i*37);
  }
  ceilingBrush(g,[[x0,y+h+1],[x1,y+h+1]],CEILING_PALETTE.carbon,1.2,.68,91);
}
// The polychrome block border, which is how one register is divided from the next: a black rule, a
// run of flat coloured blocks in a fixed cycle, and a black rule to close it.
function ceilingBlockRule(g,x0,x1,y,h,alpha=.8){
  const cols=[CEILING_PALETTE.red,CEILING_PALETTE.white,CEILING_PALETTE.blue,CEILING_PALETTE.white,
    CEILING_PALETTE.yellow,CEILING_PALETTE.white,CEILING_PALETTE.green,CEILING_PALETTE.white];
  ceilingBrush(g,[[x0,y],[x1,y]],CEILING_PALETTE.carbon,1.3,.78*alpha/.8,201);
  g.save();
  const block=Math.max(7,h*.9);
  // Neither the block's own width nor the colour it takes is a perfect cycle: a pot runs low and the
  // next block is cut a hair short or long to use it up, and the colour index is nudged off its
  // strict rotation often enough that the run of eight never quite repeats — kept rare enough that
  // the sequence still reads as the cycle it is, just not a stamped one.
  for(let x=x0,i=0;x<x1;i++){
    const w=Math.min(block*(.78+ceilingHash(i,y)*.5),x1-x),ci=(i+(ceilingHash(i,y+11)<.18?1:0))%8;
    g.globalAlpha=alpha*(.82+ceilingHash(i,y)*.22);g.fillStyle=cols[ci];g.fillRect(x,y+1.4,Math.max(0,w-.9),h);
    x+=w;
  }
  g.restore();
  ceilingBrush(g,[[x0,y+h+2.4],[x1,y+h+2.4]],CEILING_PALETTE.carbon,1.3,.78*alpha/.8,202);
}
// The painter snapped a grid in red before any figure was set out, and the flood never quite covered
// it. It is the only orthogonal thing on the sheet that was not drawn by a brush.
function ceilingSettingGrid(g,x0,y0,x1,y1,unit){
  // The facsimile's red canon is one of the most present things on the sheet — everywhere, under
  // everything — and the .085-alpha hairline this used to run was, in practice, invisible. Brought up
  // to a plainly-legible ruled surface; it still sits under every painted pass (drawn first in
  // ceilingBakeWall, before any furniture) so nothing above it competes for the same ink.
  g.save();g.strokeStyle='rgba(157,55,36,.24)';g.lineWidth=.6;g.beginPath();
  for(let x=x0;x<=x1;x+=unit){g.moveTo(x,y0);g.lineTo(x,y1);}
  for(let y=y0;y<=y1;y+=unit){g.moveTo(x0,y);g.lineTo(x1,y);}
  g.stroke();g.restore();
}
// The border star, redrawn from a figure-scale crop rather than the small reference this first went
// up from: not five straight-sided kite lobes but five unequal lens-shaped arms — two curved edges
// meeting at a point at both the hub and the tip, so an arm has a belly, the way a loaded brush
// dragged to a point does. A small ringed hub with its own centre dot sits over where the five bases
// converge, hiding what would otherwise be a knot of coincident line-ends. Every arm gets its own
// length, belly and weight off the star's own seed, the whole star an arbitrary full rotation rather
// than a token wobble, so no two stars on a band — and no two arms on one star — are quite alike.
function ceilingBorderStar(g,cx,cy,r,alpha,seed){
  // A stroked lens reads as intended at figure scale, but at the size a band actually runs it — a few
  // pixels — a hollow outline this thin just breaks into a scribble of crossing hairlines. Filled
  // solid, the same lens silhouette holds at any size: still five bellied arms tapering to a point,
  // just painted rather than drawn open, and every arm's own curve still shows wherever the star is
  // big enough to see it (a band at 4x, the corner roundel). Jitter is kept modest on purpose — this
  // is a band of stars, not a scatter of them, and the facsimile's own arms are close to even.
  const rr0=r*(.86+ceilingHash(seed,101)*.3),rot=ceilingHash(seed,3)*TAU,hub=rr0*.17;
  g.save();g.globalAlpha=alpha*(.84+ceilingHash(seed,97)*.3);g.fillStyle=CEILING_PALETTE.carbon;
  for(let i=0;i<5;i++){
    const a=rot+i*TAU/5+(ceilingHash(seed+i*7,41)-.5)*.32,len=rr0*(.84+ceilingHash(seed+i*3,53)*.3),
      belly=len*(.15+ceilingHash(seed+i*5,59)*.08),bf=.44+ceilingHash(seed+i*9,61)*.12,perp=a+Math.PI/2,
      hp=[cx+Math.cos(a)*hub,cy+Math.sin(a)*hub],tip=[cx+Math.cos(a)*len,cy+Math.sin(a)*len],
      bx=cx+Math.cos(a)*len*bf,by=cy+Math.sin(a)*len*bf,
      c1=[bx+Math.cos(perp)*belly,by+Math.sin(perp)*belly],c2=[bx-Math.cos(perp)*belly,by-Math.sin(perp)*belly];
    g.beginPath();g.moveTo(hp[0],hp[1]);g.quadraticCurveTo(c1[0],c1[1],tip[0],tip[1]);g.quadraticCurveTo(c2[0],c2[1],hp[0],hp[1]);g.closePath();g.fill();
  }
  g.strokeStyle=CEILING_PALETTE.carbon;g.lineWidth=Math.max(.45,hub*.4);g.beginPath();g.arc(cx,cy,hub,0,TAU);g.stroke();
  g.beginPath();g.arc(cx,cy,Math.max(.4,hub*.36),0,TAU);g.fill();
  g.restore();
}
// The column star: a different mark from the border star, not a smaller copy of it — inside a decan
// column the sky is a table and its unit is a plain five-line asterisk, thin straight strokes crossing
// at a point with no hub and no belly at all. Kept as its own function rather than a size argument to
// ceilingBorderStar because the two are different signs on the wall, not one sign at two scales.
function ceilingAsteriskStar(g,cx,cy,r,alpha,seed){
  const rr0=r*(.82+ceilingHash(seed,103)*.4),rot=ceilingHash(seed,7)*TAU;
  g.save();g.globalAlpha=alpha*(.72+ceilingHash(seed,131)*.42);g.strokeStyle=CEILING_PALETTE.carbon;g.lineCap='round';
  for(let i=0;i<5;i++){
    const a=rot+i*TAU/5+(ceilingHash(seed+i*13,139)-.5)*.5,len=rr0*(.7+ceilingHash(seed+i*7,151)*.6);
    g.lineWidth=Math.max(.45,rr0*(.11+ceilingHash(seed+i*3,157)*.07));
    g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*len,cy+Math.sin(a)*len);g.stroke();
  }
  g.restore();
}
// The star band, corrected: not a single file of small solid stars but a broad woven band of three
// staggered rows, the sheet's main framing device and, by sheer repetition of one flat unit, its
// principal source of density (docs/eras/03-ceiling.md, "The grammar" — hierarchy from scale,
// separation, overlap and register, never from rendering up a single mark). The middle row sits a
// half-gap out of phase with its neighbours so the three interlock instead of stacking into a plain
// square grid. Used for the tile's own two side bands, which pass with the climb like every other
// margin furniture; ceilingStarBandH below is the same unit run sideways for the frame's fixed top
// and bottom edges.
// A hi-res crop settled two things a small reference could not: the arm tips of neighbouring stars
// actually overlap (density comes from the crowding, not from gaps between clean units), and each
// row runs between fine RED rules — the canon again, not a black border — with as many rules as rows
// plus one. rows itself is not fixed at three: the sheet's own top border runs three, the band that
// divides its two registers runs two, so the caller says how many. Every star gets its own size from
// ceilingBorderStar's own seed already; on top of that each row drifts off true as a slow wave whose
// period is a whole number of cycles across the band's own length, so a tiled copy still joins its
// neighbour exactly, and each star's position wanders a little more besides — opening and closing the
// pitch instead of holding one constant gap, the same wobble a hand ruling by eye actually makes.
function ceilingStarBand(g,x,y0,y1,gap,width,rows=3){
  const cols=[];for(let c=0;c<rows;c++)cols.push(x-width*.5+(c+.5)*width/rows);
  for(let e=0;e<=rows;e++)ceilingBrush(g,[[x-width*.5+e*width/rows,y0],[x-width*.5+e*width/rows,y1]],CEILING_PALETTE.red,.6,.34,(x|0)+e*13);
  // The band is dense before it is irregular. On the facsimile a star is wider than the pitch it is
  // set at, so the arms of neighbours interlock and the band reads as a mat rather than a scatter;
  // sizing the star off its row's height instead left it half the pitch and the wobble then read as
  // randomness. The pitch itself is untouchable — it has to divide the tile height — so the star grows
  // into it instead, past its own row and into the ones beside it, which is what the wall does.
  const span=y1-y0,cycles=Math.max(2,Math.round(span/230)),r=Math.max(4.2,Math.min(gap*.62,width/rows*1.5));
  for(let c=0;c<rows;c++){
    const stagger=c%2?gap*.5:0,drift=width/rows*.16;
    for(let y=y0+gap*.5+stagger,i=0;y<y1;y+=gap,i++){
      const wob=Math.sin((y-y0)/span*TAU*cycles+c*2.09)*drift,seed=(y|0)*3+i*7+c*101+(x|0),
        jx=(ceilingHash(i*7+c*31,(x|0)+11)-.5)*gap*.24,jy=(ceilingHash(c*13+i*5,(x|0)+17)-.5)*gap*.16;
      ceilingBorderStar(g,cols[c]+wob+jx,y+jy,r,.86,seed);
    }
  }
}
function ceilingStarBandH(g,x0,x1,y,gap,width,rows=3){
  const trows=[];for(let c=0;c<rows;c++)trows.push(y-width*.5+(c+.5)*width/rows);
  for(let e=0;e<=rows;e++)ceilingBrush(g,[[x0,y-width*.5+e*width/rows],[x1,y-width*.5+e*width/rows]],CEILING_PALETTE.red,.6,.34,(y|0)+e*13);
  const span=x1-x0,cycles=Math.max(2,Math.round(span/230)),r=Math.max(4.2,Math.min(gap*.62,width/rows*1.5));
  for(let rr=0;rr<rows;rr++){
    const stagger=rr%2?gap*.5:0,drift=width/rows*.16;
    for(let x=x0+gap*.5+stagger,i=0;x<x1;x+=gap,i++){
      const wob=Math.sin((x-x0)/span*TAU*cycles+rr*2.09)*drift,seed=(x|0)*3+i*7+rr*101+(y|0),
        jy=(ceilingHash(i*7+rr*31,(y|0)+11)-.5)*gap*.24,jx=(ceilingHash(rr*13+i*5,(y|0)+17)-.5)*gap*.16;
      ceilingBorderStar(g,x+jx,trows[rr]+wob+jy,r,.86,seed);
    }
  }
}
// A plain disc at each corner of the frame, ringed once — small, cheap, and the one thing that turns
// a set of four independent rules into a closed frame, exactly as the facsimile's own corners do.
function ceilingRoundel(g,x,y,r){
  g.save();g.fillStyle=CEILING_PALETTE.warm;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
  g.strokeStyle=CEILING_PALETTE.carbon;g.lineWidth=Math.max(.7,r*.13);g.stroke();
  g.beginPath();g.arc(x,y,r*.52,0,TAU);g.stroke();g.restore();
}
// One of the twelve lunar-month circles, undone back to what the facsimile actually shows: twelve
// identical wheels, uniform, roughly two dozen plain thin spokes hub to rim and a small hub circle —
// no wedge floods, no varying division count or rim. What actually differs wheel to wheel on TT353,
// and what this used to skip past in favour of inventing colour, is external to the wheel itself: the
// ruled box, the name beneath it and the red construction lines through its centre, all drawn by the
// caller below rather than by this function.
function ceilingMonthCircle(g,cx,cy,r,alpha=.85,seed=0){
  // Thirty spokes, not the twenty-four this first read off a smaller crop: the count is still one
  // uniform division shared by every wheel — nothing here is invented per-circle — but a closer look
  // corrects what that fixed count actually is.
  const div=30,hub=r*.12,ink=CEILING_PALETTE.carbon,jit=.97+ceilingHash(seed,5)*.06;
  g.save();g.globalAlpha=alpha;
  ceilingBrush(g,ceilingArcPoints(cx,cy,r*jit,0,TAU,48),ink,Math.max(.75,r*.02),alpha*.95,seed*7+1);
  for(let i=0;i<div;i++){
    // The division stays exact — every spoke at its own i/div — but the brush laying each one is not:
    // weight and finish vary spoke to spoke, some heavier where the reed was freshly loaded.
    const a=i/div*TAU,w=Math.max(.5,r*.011)*(.7+ceilingHash(seed*7+i,29)*.7);
    ceilingBrush(g,[[cx+Math.cos(a)*hub,cy+Math.sin(a)*hub],[cx+Math.cos(a)*r*jit,cy+Math.sin(a)*r*jit]],ink,w,alpha*(.58+ceilingHash(seed*7+i,31)*.34),seed*7+11+i);
  }
  ceilingBrush(g,ceilingArcPoints(cx,cy,hub,0,TAU,20),ink,Math.max(.6,r*.014),alpha*.9,seed*7+2);
  g.restore();
}
// The wheel's actual differentiators: a ruled box, a caption line beneath it in the checked vocabulary
// (or, past the twelfth spellable word, left blank — a ruled box with an empty line rather than an
// invented sign), and the red construction rules through its own centre that the setting-out grid
// would have carried anyway. Drawn as three separate small passes rather than folded into
// ceilingMonthCircle so a clash with the watch's animal can drop the box and rules with the wheel
// while still leaving the caller free to draw the rules first, under the circle, the way a real
// canon line sits under the figure it located.
function ceilingMonthRules(g,cx,cy,reachX,reachY,alpha){
  ceilingBrush(g,[[cx,cy-reachY],[cx,cy+reachY]],CEILING_PALETTE.red,.6,alpha,(cx|0)*3+1);
  ceilingBrush(g,[[cx-reachX,cy],[cx+reachX,cy]],CEILING_PALETTE.red,.55,alpha*.85,(cy|0)*5+1);
}
function ceilingMonthBox(g,cx,cy,r,word,alpha){
  const w=CEILING_WORD[word],cell=Math.max(5,r*.5),span=w?w.q.length*cell:0,
    boxW=Math.max(r*2.3,span+cell*.7),boxH=r*2+cell*1.9,
    x0=cx-boxW/2,x1=cx+boxW/2,y0=cy-boxH/2,y1=cy+boxH/2;
  ceilingBrush(g,[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]],CEILING_PALETTE.carbon,.65,alpha*.55,(cx|0)+(cy|0));
  // Corrected: the caption sits above the wheel on the facsimile, held off it by its own red rule —
  // a construction line, the same as every other one the canon strikes through a circle's centre —
  // not set beneath it as the box first had it.
  if(w){
    const capY=y0+cell*.68;
    ceilingWordRow(g,word,cx,capY,cell,CEILING_PALETTE.carbon,alpha*.9,1);
    ceilingBrush(g,[[x0+cell*.25,capY+cell*.5],[x1-cell*.25,capY+cell*.5]],CEILING_PALETTE.red,.55,alpha*.6,(cx|0)*7+(cy|0)+3);
  }
}
// Meskhetiu, the Foreleg — the seven stars a later century calls the Plough, drawn on this ceiling as
// the bull they belong to. The seven are set on the animal itself as star signs, which is how the
// northern panel identifies it: the figure is the constellation, not a label beside one. They keep the
// dipper's own shape above the back, a handle of three and a bowl of four, so the sky is legible on
// the animal that carries it.
// ---------- The two circumpolar figures, traced from the facsimile ----------
// These were drawn by hand until now, and both were wrong in kind rather than merely coarse: the
// hippopotamus was a sack and the bull a modelled quadruped with a rump, a tail and seven stars laid
// out as the Dipper. The facsimile shows neither. Both are now taken from src/figures-tt353.js,
// which scripts/figures.mjs traces off Wilkinson's facsimile of TT353 — the document 03-ceiling.md
// makes the test of every decision on this sheet — so what is drawn here is what the wall carries.
//
// What is sourced and what is this plate's own is worth keeping apart, in the habit of the Names
// table. Sourced: every contour, the count of Meskhetiu's stars (three, not the Dipper's seven), and
// the fact that his legs, stars and disc are painted a measurably redder ochre than his body, which
// the facsimile leaves as ink contour and does not flood. This plate's own: the pale lime flood
// under both bodies, which the facsimile has no colour for and which is here so that a figure drawn
// at thirteen pixels on the narrow layout still reads as a shape; and the green of Reret's
// crocodile, which is the palette's local animal fill rather than anything this sheet records.
// Each figure is scaled by its own silhouette rather than by a shared number, because the two have
// nothing like the same proportion: the bull is a long low shape a little over two units wide and one
// tall, Reret an upright one barely half a unit across. Sizing both off one factor made her a third of
// his weight on the sheet, which is not what the facsimile shows.
const CEILING_FIG_UNIT={meskhetiu:1.15,reret:2.6};
// A traced contour comes off a pixel mask, so it arrives with the mask's own staircase on it, and at
// the size the bull is drawn that staircase reads as a crude hand rather than a painted line. One
// Chaikin pass cuts every corner at the quarter points, which is enough to put a brush's roundness
// back without softening the drawing into mush. It runs at bake time, not per frame.
function ceilingSmooth(p){
  const n=p.length,out=new Array(n*2);
  for(let i=0;i<n;i++){
    const a=p[i],b=p[(i+1)%n];
    out[i*2]=[a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25];
    out[i*2+1]=[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75];
  }
  return out;
}
// One traced part, laid in the figure's own unit box: y down, one unit the silhouette's height,
// origin at its foot and horizontal centre, so every part shares one transform and stays registered.
function ceilingTracedPart(g,pts,x,y,u,fill,seed,width){
  if(!pts||pts.length<3)return;
  const p=new Array(pts.length);
  for(let i=0;i<pts.length;i++)p[i]=[x+pts[i][0]*u,y+pts[i][1]*u];
  const q=ceilingSmooth(p);
  if(fill)ceilingPolygon(g,q,fill,1,seed,width);
  else ceilingBrush(g,q.concat([q[0]]),CEILING_PALETTE.carbon,width,.92,seed);
}
function ceilingPaintBull(g,x,y,s,alpha=1){
  const F=typeof FIGURES_TT353!=='undefined'&&FIGURES_TT353.meskhetiu;if(!F)return;
  const u=s*CEILING_FIG_UNIT.meskhetiu,lw=Math.max(1,u*.022);
  g.save();g.globalAlpha=alpha;
  // The tether first, so the body's closing line runs over where it meets the flank.
  ceilingTracedPart(g,F.chain&&F.chain.links,x,y,u,null,311,Math.max(.8,lw*.8));
  ceilingTracedPart(g,F.chain&&F.chain.disc,x,y,u,CEILING_PALETTE.red,317,lw);
  ceilingTracedPart(g,F.silhouette,x,y,u,CEILING_PALETTE.lime,17,lw*1.15);
  for(let i=0;i<F.legs.length;i++)ceilingTracedPart(g,F.legs[i],x,y,u,CEILING_PALETTE.red,23+i*7,lw);
  for(let i=0;i<F.stars.length;i++)ceilingTracedPart(g,F.stars[i],x,y,u,CEILING_PALETTE.red,41+i*11,lw*.9);
  g.restore();
}
function ceilingPaintHippo(g,x,y,s,alpha=1){
  const F=typeof FIGURES_TT353!=='undefined'&&FIGURES_TT353.reret;if(!F)return;
  const u=s*CEILING_FIG_UNIT.reret,lw=Math.max(1,u*.02);
  g.save();g.globalAlpha=alpha;
  ceilingTracedPart(g,F.silhouette,x,y,u,CEILING_PALETTE.lime,53,lw*1.15);
  // The crocodile lies over her back, so it is laid after her and closes its own line on top of hers.
  if(F.crocodile){
    ceilingTracedPart(g,F.crocodile.silhouette,x,y,u,CEILING_PALETTE.green,67,lw);
    ceilingTracedPart(g,F.crocodile.ridge,x,y,u,null,71,Math.max(.7,lw*.7));
  }
  g.restore();
}
// A line of signs is TT353's own habit for the register divider — not a spelled column laid on its
// side, but marks from the traced bank set loose along a ruled line with real whitespace between
// them, the way src/signs-tt353.js's own header describes the crop this bank came from. Two ruled
// hairlines carry it top and bottom, the same canon the rest of the wall is snapped to. Never mixed
// with a CEILING_WORD column: this is a line of marks, and their order spells nothing.
function ceilingSignLine(g,x0,x1,y,h,count,alpha,seed){
  ceilingBrush(g,[[x0,y-h*.5],[x1,y-h*.5]],CEILING_PALETTE.carbon,.55,.5*alpha,seed+1);
  ceilingBrush(g,[[x0,y+h*.5],[x1,y+h*.5]],CEILING_PALETTE.carbon,.55,.5*alpha,seed+2);
  const bank=ceilingSignBank();if(!bank||!bank.length)return;
  const span=x1-x0,cell=span/count;
  for(let i=0;i<count;i++){
    const cx=x0+cell*(i+.5)+(ceilingHash(seed+i,3)-.5)*cell*.16,
      m=bank[(seed*7+i*13)%bank.length],mh=h*(.62+ceilingHash(seed+i,7)*.3);
    ceilingTracedMark(g,m,cx,y+h*.42,mh,CEILING_PALETTE.carbon,alpha*(.65+ceilingHash(seed+i,11)*.3));
  }
}
// The foot register, rebuilt as one horizontal band running the tile's own width instead of two short
// vertical files stood in the margins (procession.png shows the real thing: roughly sixteen striding
// figures the width of the panel, standing on ruled red lines, Reret's own row breaking them near the
// middle). The bank's one traced 'figure' mark stands in for every instance — varied a hair figure to
// figure off its own seed, per the brief, so the row reads as repetition and not a stamp, the same
// discipline ceilingBorderStar already keeps for a band of stars — and each carries the short caption
// of signs patterns.caption records above the head. The red disc survives every figure regardless: on
// the facsimile it is almost the only colour on the whole sheet, and that is the point of it.
// This band runs the tile's full width by construction, so it crosses the play channel; weight is
// eased toward the centre column there — a figure thins and dims as it nears mid-screen, its caption
// drops out first — so nothing here bids against an hour-circle or the aim guide for the eye.
function ceilingProcession(g,x0,x1,y,fig,capCell,count,alpha){
  const bank=typeof SIGNS_TT353!=='undefined'?SIGNS_TT353.marks:null,
    figMark=bank&&bank.find(m=>m.kind==='figure'),signs=bank?bank.filter(m=>m.kind==='sign'):null;
  if(!figMark)return;
  const span=x1-x0,mid=(x0+x1)*.5,chW=Math.max(50,span*.14),skip=Math.floor(count/2);
  ceilingBrush(g,[[x0,y+fig*.1],[x1,y+fig*.1]],CEILING_PALETTE.red,.6,.42*alpha,8001);
  ceilingBrush(g,[[x0,y-fig*1.02],[x1,y-fig*1.02]],CEILING_PALETTE.red,.55,.3*alpha,8003);
  for(let i=0;i<count;i++){
    if(i===skip)continue; // the row breaks near the middle, the way the facsimile's own does
    const t=count>1?i/(count-1):.5,x=x0+span*t,seed=i*97+11,
      near=clamp(1-Math.abs(x-mid)/chW,0,1),ease=lerp(1,.3,near),
      fh=fig*(.9+ceilingHash(seed,3)*.18),fa=alpha*ease;
    ceilingTracedMark(g,figMark,x,y,fh,CEILING_PALETTE.carbon,fa*.82);
    g.save();g.globalAlpha=alpha*lerp(1,.45,near);g.fillStyle=CEILING_PALETTE.red;
    g.beginPath();g.arc(x,y-fh*1.02,fh*.24,0,TAU);g.fill();g.restore();
    if(capCell>0&&signs&&signs.length&&near<.7){
      for(let c=0;c<4;c++){
        const m=signs[(seed+c*17)%signs.length],cx=x+(c-1.5)*capCell,cy=y-fh*1.7;
        ceilingTracedMark(g,m,cx,cy,capCell*.92,CEILING_PALETTE.carbon,fa*.68);
      }
    }
  }
}
// The four watches used to be one wall keyed on size alone, so every hour of the night was the same
// tile with a different word in the running head. ceilingBakeWall paints one watch's register; the
// cache and the changeover between registers are ceilingBuildWall()'s job, below it.
function ceilingBakeWall(watch){
  // P1 · carry the wall with the climb. The wall used to be one canvas the size of the screen, blitted
  // at 0,0 forever, so forty rows of climbing never moved a single kheker or a single month circle.
  // It is baked here as one repeating TILE instead: the room's own architecture — the kheker frieze
  // crowning it and the foot's block rule closing it (docs/eras/03-ceiling.md, "Frame and furniture" —
  // a tomb ceiling's boundary is its architecture, not a page border) — is cached apart from this and
  // pinned to the viewport by ceilingDrawRegisterGrid(). Everything else drawn below is furniture, and
  // furniture passes: the plaster itself, the painter's snapped canon grid, both star bands, the
  // register-dividing rule, the twelve month circles, the decan columns, Meskhetiu and Reret. This tile
  // is drawn once and blitted at an offset tracking world.cameraY*scale in renderCeiling() — the exact
  // rate sy() gives every node and hazard, so the room passes at one rate with no depth in it, the way
  // the era file's "flat, one wall, one rate" reading of the vertical asks for.
  //
  // The tile stands about 1.6 view-heights tall: taller than one glance, as asked, but still a plain
  // multiple of it rather than an unbounded strip, so the memory this costs over the old screen-sized
  // bake is a fixed ~1.6x of one screen (the frieze/foot pair cached in ceilingDrawRegisterGrid() adds
  // only a few pixels' worth of height each, not a second full-screen sheet). P2 keys this same tile on
  // the watch as well, so four of them exist over a run, but see ceilingBuildWall() below for why that
  // never means four resident at once.
  //
  // Every rhythm that has to survive the join between one copy of the tile and the next — the star
  // band's gap, the canon grid's unit — is forced to an exact divisor of the tile height before it is
  // drawn with, so the spacing never jumps at the seam. The plaster texture and the crack network are
  // not periodic, so they are drawn wrapped instead: once at their own position, and again shifted by a
  // tile height whenever they fall near an edge, the ordinary way to make a baked canvas repeat without
  // a visible seam. Checked by eye at 390px and 1400px, stepping world.cameraY across three tile heights.
  const gap=Math.max(20,Math.min(28,H/22)),rows=Math.max(14,Math.round(H*1.6/gap)),R=rows*gap;
  const unitTarget=Math.max(20,Math.min(32,W/36)),gridUnit=R/Math.max(3,Math.round(R/unitTarget));
  // The gutter grows over the old single-file border's 10-17px: a broad three-row band needs real
  // width to interlock in, and this is the one number both this bake and ceilingDrawRegisterGrid's
  // pinned frame read, so the two stay lined up at x0/x1 exactly as before.
  const inset=Math.max(15,Math.min(24,W*.05)),x0=inset+10,x1=W-inset-10,wide=W>=700;
  const c=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(R*DPR))),g=c.getContext('2d');g.scale(DPR,DPR);
  g.fillStyle=CEILING_PALETTE.plaster;g.fillRect(0,0,W,R);
  // The wall's texture is material, not pictorial modelling. It used to be 180-odd broad, soft-alpha
  // ellipses per view-height, which is exactly enough overlap to blend into a haze — plaster read as
  // grey cloud under the drawing rather than as a surface. Far fewer patches now, each an irregular
  // hard-edged chip at a real, flat alpha instead of a faint blur, plus a crack network below that
  // actually follows the ruled canon grid the way a real fracture in a plastered, ruled wall would.
  // Patches and cracks are drawn a second time, shifted by ±R, whenever they land within their own
  // reach of an edge, so the texture wraps rather than ending at one edge of the tile and starting
  // over, unrelated, at the other.
  const rng=seeded(14731458),patches=Math.round(46*R/H),cracks=Math.round(26*R/H);
  for(let i=0;i<patches;i++){
    const x=rng()*W,y=rng()*R,r=10+rng()*46,sides=5+Math.floor(rng()*3),rot=rng()*TAU,loss=rng()>.5,
      fill=loss?'rgba(157,137,102,.17)':'rgba(238,228,205,.22)';
    const draw=yy=>{
      g.beginPath();
      for(let k=0;k<sides;k++){const a=rot+k/sides*TAU,rr=r*(.72+ceilingHash(i,k)*.5),px=x+Math.cos(a)*rr,py=yy+Math.sin(a)*rr*.42;k?g.lineTo(px,py):g.moveTo(px,py);}
      g.closePath();g.fillStyle=fill;g.fill();
      if(loss){g.strokeStyle='rgba(157,137,102,.32)';g.lineWidth=.6;g.stroke();}
    };
    draw(y);if(y<r*.5+2)draw(y+R);if(y>R-r*.5-2)draw(y-R);
  }
  for(let i=0;i<Math.min(Math.round(1400*R/H),Math.floor(W*R/420));i++){
    const x=rng()*W,y=rng()*R,a=.05+rng()*.08;g.fillStyle=rng()>.55?`rgba(250,243,222,${a})`:`rgba(73,54,34,${a})`;g.fillRect(x,y,.6+rng()*.8,.6+rng()*.8);
  }
  // A crack runs through the same ruled surface the painter snapped, so the grid is what sets its
  // scale and its general bearing — but a fracture is not a drawn line, and one that steps cleanly
  // from intersection to intersection closes rectangles and reads as an anriss in pencil rather than
  // as a break in lime. So each crack keeps one horizontal sense and one vertical sense for its whole
  // length, which is what stops it doubling back into a box, and every vertex is thrown off the
  // intersection it belongs to by a share of a unit, with a wandering midpoint inside each leg.
  // Plaster fails downward under its own weight, so the vertical sense is always down.
  const gcols=Math.max(1,Math.round((x1-x0)/gridUnit)),grows=Math.round(R/gridUnit);
  for(let i=0;i<cracks;i++){
    let gxk=Math.floor(rng()*gcols),gyk=Math.floor(rng()*grows);
    const sway=rng()<.5?-1:1,off=()=>(rng()-.5)*gridUnit*.5;
    const at=(kx,ky)=>[x0+kx*gridUnit+off(),ky*gridUnit+off()];
    let p0=at(gxk,gyk);const pts=[p0],legs=3+Math.floor(rng()*4);
    for(let j=0;j<legs;j++){
      if(rng()<.5)gxk=clamp(gxk+sway,0,gcols);else gyk=gyk+1;
      const p1=at(gxk,gyk);
      pts.push([lerp(p0[0],p1[0],.5)+off()*.7,lerp(p0[1],p1[1],.5)+off()*.7],p1);p0=p1;
    }
    // The break is widest where it started and closes to nothing, so it is laid in two passes rather
    // than as one even line: the whole run thin, and the first third of it again a shade heavier.
    const draw=q=>{ceilingBrush(g,q,CEILING_PALETTE.loss,.55,.3,100+i);ceilingBrush(g,q.slice(0,Math.max(2,Math.ceil(q.length/3))),CEILING_PALETTE.loss,.95,.26,300+i);};
    draw(pts);
    if(pts.some(p=>p[1]>R-2))draw(pts.map(p=>[p[0],p[1]-R]));
    if(pts.some(p=>p[1]<2))draw(pts.map(p=>[p[0],p[1]+R]));
  }
  // The grid's own unit already divides R exactly; stopping one pixel short of R keeps the loop from
  // drawing the seam's line twice (once here, once as the next copy's y=0 line).
  ceilingSettingGrid(g,inset,0,W-inset,R-1,gridUnit);
  // The side star bands used to run only between the frieze and the foot rule; now they are furniture
  // like everything else here, so they run the tile's whole height on a gap that already divides it —
  // and, per the correction, as the broad three-row woven band the facsimile actually carries rather
  // than a single filed line of stars.
  const starW=inset*1.15,starL=6+starW*.5,starRx=W-6-starW*.5;
  ceilingStarBand(g,starL,0,R,gap,starW);
  ceilingStarBand(g,starRx,0,R,gap,starW);
  // TT353 is organised as two fields divided by a band, and the band is a layered one: a star band,
  // then several full-width ruled lines of signs, then another star band (divider.png) — not the
  // single flat block rule this used to stand in with. The counts are read off SIGNS_TT353's own
  // patterns.divider rather than invented: starRows/starRowsBelow size the two star bands exactly as
  // they did before the correction, and signLines/signsPerLineApprox now give the layer between them
  // real content — full-width lines of the bank's own traced marks (ceilingSignLine), never
  // CEILING_WORD's spelled quadrats, per that file's own claim boundary. It belongs to the register it
  // divides, not to the room's architecture, so it passes with the rest of the tile instead of pinning
  // the way the foot rule does.
  const divide=R*.52,
    DIV=(typeof SIGNS_TT353!=='undefined'&&SIGNS_TT353.patterns&&SIGNS_TT353.patterns.divider)||
      {starRows:2,signLines:2,signsPerLineApprox:20,starRowsBelow:2};
  const divStep=Math.max(14,Math.min(20,W/30)),divBandW=Math.max(9,H*.012),
    signRowH=Math.max(8,Math.min(13,H*.014)),signGap=1.6,
    signsH=DIV.signLines*signRowH+Math.max(0,DIV.signLines-1)*signGap,clearance=divBandW*.72,
    // A line this small still wants real whitespace between its signs — a per-sign width no narrower
    // than a decan column's own cell — so a narrow layout gets fewer signs per line rather than the
    // approx count crushed into a lane that cannot honestly hold it.
    minSignCell=wide?26:19,perLine=Math.max(6,Math.min(DIV.signsPerLineApprox,Math.floor((x1-x0-8)/minSignCell)));
  ceilingStarBandH(g,x0+4,x1-4,divide-signsH*.5-clearance-divBandW*.5,divStep,divBandW,DIV.starRows);
  for(let li=0;li<DIV.signLines;li++){
    const ly=divide-signsH*.5+signRowH*(li+.5)+li*signGap;
    ceilingSignLine(g,x0+4,x1-4,ly,signRowH,perLine,.5,7000+li*97);
  }
  ceilingStarBandH(g,x0+4,x1-4,divide+signsH*.5+clearance+divBandW*.5,divStep,divBandW,DIV.starRowsBelow);
  // This comment used to say the tile's middle is left to the route "on purpose," written when the
  // wall was one static screen and the screen's middle and the tile's middle were the same place. On
  // a tile that passes with the climb they are not: the play channel is the centre COLUMN of the
  // screen at every height the camera can sit at, not one band of the tile. So none of the furniture
  // below is shelved around the fixed divide any more — the month circles, the decan columns and the
  // two circumpolar figures are all walked down the tile's whole span, kept to the margins throughout,
  // so there is no height of the climb where the plaster is the only thing on screen. Two lanes keep
  // the margin from turning to noise: columns hug the star border, circles sit a little further in,
  // and each figure keeps a clear stretch on its own side so nothing is ever set on top of the animal
  // that already anchors that reach of the tile. The foot register claims a strip of its own below all
  // of it — reserved out of footY rather than shared with the margin furniture above, the same way the
  // divider claims its own reach of the tile rather than competing with whatever is passing behind it.
  const cell=wide?15:12,circIn=wide?64:30,bullIn=wide?120:40,hippoIn=wide?108:38,
    figClear=wide?90:46,loY=R*.07,footY=wide?R*.94:R*.93,
    procFig=wide?11:7,procCap=wide?procFig*.42:0,procCount=wide?15:8,
    procStripH=procFig*2.3+procCap*1.5+10,procY=footY-procFig*.15,
    hiY=footY-procStripH,span=hiY-loY,bullY=loY+span*.24,hippoY=loY+span*.7;
  // P2 · a register per watch. TT353 is one authored sheet and the circumpolar pair, the decan columns
  // and the twelve month circles are not separate chapters of it (docs/eras/03-ceiling.md, "The
  // signature sheet") — but which of that one sheet's furniture the flight is currently passing is
  // exactly the kind of thing a night's watches divide, the way a real visit to the room would not take
  // in the whole ceiling in one glance. So each watch is given a different reach of the same wall
  // rather than a different wall: Meskhetiu leads the first watch alone, since the seven stars of the
  // Foreleg are the sheet's own signature drawing and earn the room to themselves; Reret takes the
  // second watch's margin in her turn, so the two guardians are never competing for the eye at once and
  // neither is on screen for the entire run the way both used to be; the months come forward at the
  // watch that has no animal in it at all, so the margins are not always the same two shapes; and the
  // last watch, before dawn, is the one place everything the room owns is out together, since the night
  // is closing and there is nothing left for the wall to hold back. rot walks the decan field's own
  // word cursor a quarter of the fourteen-word list forward each watch, so a full night's climb reads
  // most of the checked vocabulary by its end rather than the same handful every time.
  const CEILING_FURNITURE=[{bull:1,hippo:0,months:0},{bull:0,hippo:1,months:0},{bull:0,hippo:0,months:1},{bull:1,hippo:1,months:1}];
  const furn=CEILING_FURNITURE[watch],rot=watch*4;
  if(furn.bull){
    ceilingPaintBull(g,W-inset-bullIn,bullY,wide?34:15,1);
    ceilingWordColumn(g,'foreleg',W-inset-(wide?36:14),bullY-(wide?76:56),cell,CEILING_PALETTE.carbon,.6);
  }
  if(furn.hippo){
    ceilingPaintHippo(g,inset+hippoIn,hippoY,wide?30:13,1);
    ceilingWordColumn(g,'star',inset+(wide?30:14),hippoY-(wide?100:52),cell,CEILING_PALETTE.carbon,.55);
  }
  // The clash margin only excludes a figure's own reach of the tile when that figure is actually
  // painted this watch — a watch with neither animal in it (the months' own turn) gives every column
  // slot back to the columns instead of leaving two dead gaps where the animals used to stand.
  const clash=(y,side)=>(side&&furn.bull&&Math.abs(y-bullY)<figClear)||(!side&&furn.hippo&&Math.abs(y-hippoY)<figClear);
  // The decan field itself: one lane per side, run from just past the star border to just short of the
  // circle/wheel lane those bands already claim, so the field never eats into furniture that is spoken
  // for. desiredSub grows watch by watch, the same escalation the animals and the wheels follow, so the
  // last watch's margin is not just "everything the room owns" for its figures but its densest field of
  // columns too; minSub is the narrowest a column can go before a quadrat stops reading as one. Where
  // the lane is too tight to honour desiredSub at all — the whole of the narrow layout, most watches —
  // it quietly settles for as many as actually fit, down to one, rather than crowd the margin further
  // than 390px has room for.
  const laneGap=4,xL0=starL+starW*.5+laneGap,xL1=inset+circIn-laneGap,
    xR0=W-inset-circIn+laneGap,xR1=starRx-starW*.5-laneGap,
    minSub=10,desiredSub=[2,2,3,4][watch],
    nSubL=Math.max(1,Math.min(desiredSub,Math.floor((xL1-xL0)/minSub))),
    nSubR=Math.max(1,Math.min(desiredSub,Math.floor((xR1-xR0)/minSub)));
  ceilingDecanField(g,xL0,xL1,loY,hiY,0,nSubL,cell,rot,furn.hippo?hippoY:null,figClear,.36);
  ceilingDecanField(g,xR0,xR1,loY,hiY,1,nSubR,cell,rot,furn.bull?bullY:null,figClear,.36);
  // Twelve identical wheels in two ruled rows is the facsimile's own layout; a vertically scrolling
  // margin has no width to lay six across, so the sheet's "row" becomes a left/right pair sharing one
  // height instead — six pairs down the tile's span, each pair generously spaced from the next, which
  // reads as the same "two, not twelve-in-a-block" arrangement the correction asks for even though the
  // axis it runs on is turned ninety degrees from the wall's own. A shared red rule ties each pair's
  // centres together the way the canon's horizontal course would.
  if(furn.months)for(let i=0;i<6;i++){
    const y=loY+span*(i+.5)/6,jit=.95+ceilingHash(i,71)*.1,
      r=(wide?Math.min(17,H*.021):Math.max(8,Math.min(11,W*.024)))*jit,
      lx=inset+circIn+r,rx=W-inset-circIn-r,lOk=!clash(y,0),rOk=!clash(y,1);
    if(lOk&&rOk)ceilingMonthRules(g,(lx+rx)/2,y,(rx-lx)/2+r*1.4,r*1.7,.32);
    if(lOk){ceilingMonthRules(g,lx,y,r*1.4,r*1.7,.32);ceilingMonthCircle(g,lx,y,r,.85,i*2);ceilingMonthBox(g,lx,y,r,CEILING_MONTH_NAMES[i*2],.7);}
    if(rOk){ceilingMonthRules(g,rx,y,r*1.4,r*1.7,.32);ceilingMonthCircle(g,rx,y,r,.85,i*2+1);ceilingMonthBox(g,rx,y,r,CEILING_MONTH_NAMES[i*2+1],.7);}
  }
  // The foot register: TT353's bottom band is a march of near-identical striding figures each bearing
  // a solid disc, the sheet's purest instance of density-by-repetition and almost its only colour —
  // drawn horizontally, full width, in the strip reserved above rather than as two short vertical
  // files stood in the margins the way this used to place it. It runs every watch, since the foot
  // register is part of TT353's one authored sheet rather than a chapter of it, in a lane clear of the
  // bull, the hippo, the wheels and the decan field, which all keep to loY..hiY now instead of sharing
  // the tile's whole span with a striding file the way the old five-a-side arrangement made them.
  ceilingProcession(g,starL,starRx,procY,procFig,procCap,procCount,.82);
  return c;
}
// P2's cache and changeover. A register change is detected here — the watch ceilingWatch() names has
// moved on from the one the resident tile was baked for — and answered by baking the new tile once, at
// the instant the change is first seen, and holding it in ceilingChangeover while the outgoing tile
// keeps passing below and the painted band above (ceilingDrawChangeover) does the work of being seen.
// That is the one window in which two tiles are resident; every frame inside it returns the cached
// outgoing tile with no further baking, and the window is cleared the moment it closes — whether by
// the band finishing, by the watch moving on again before it did (a very fast climb finishes the one in
// flight at once rather than stacking a third tile), by a resize (not a register change, so it is
// finished at once and not cross-faded), or under reducedMotion, which never opens one at all.
function ceilingBuildWall(){
  const watch=ceilingWatch(),dims=W+'x'+H+'x'+DPR,key=dims+':'+watch;
  if(ceilingChangeover){
    if(ceilingChangeover.toKey!==key){
      // The target no longer matches this frame's watch/size — the climb skipped ahead again, or the
      // screen resized — so the pending tile is promoted at once rather than left waiting on a target
      // that has already passed; whatever changed further is picked up fresh below, the same as any
      // other cache miss.
      ceilingWall=ceilingChangeover.to;ceilingWallKey=ceilingChangeover.toKey;ceilingWallWatch=ceilingChangeover.toWatch;ceilingChangeover=null;
    }else if(reducedMotion||chapterReveal.age>=CEILING_CHANGE_DUR||chapterReveal.index!==watch){
      ceilingWall=ceilingChangeover.to;ceilingWallKey=ceilingChangeover.toKey;ceilingWallWatch=ceilingChangeover.toWatch;ceilingChangeover=null;
      return ceilingWall;
    }else return ceilingWall; // still mid-band: the outgoing tile keeps passing, already baked — no work this frame
  }
  if(ceilingWall&&ceilingWallKey===key)return ceilingWall;
  const tile=ceilingBakeWall(watch);
  if(!reducedMotion&&ceilingWall&&ceilingWallWatch>=0&&ceilingWallWatch!==watch&&ceilingWallKey.split(':')[0]===dims){
    ceilingChangeover={to:tile,toKey:key,toWatch:watch};
    return ceilingWall;
  }
  ceilingWall=tile;ceilingWallKey=key;ceilingWallWatch=watch;return ceilingWall;
}
// The room's only furniture that does not pass: the kheker frieze crowning it and the block rule
// closing it at the foot (see ceilingBuildWall() above for the reasoning). This used to be the 9%-alpha
// hairline register grid, an abstraction standing in for a register the wall never actually drew and
// which read, in practice, as invisible; now the wall draws real registers and passes them for real, so
// that abstraction is retired rather than left running beside it, and this is the sheet's one remaining
// screen-pinned layer — cached the same way the tile above is, so the cost is one drawImage a frame.
// Defect: hudBand() is honoured everywhere else the atlas draws (figures.js's guard, reveal.js's
// margin) so that nothing is ever set behind the DOM chrome, but the passing wall never observed it —
// whatever tile row is scrolling by simply shows straight through. A faint star or a column rule
// under "PREVIEW" is harmless; Reret's own contour passing directly behind the brand's lettering is
// not, and since every row of the tile crosses screen-top exactly once per tile-height climbed, the
// collision is not a one-off — it recurs the whole watch. No placement fixes that (a row cannot dodge
// a screen position it is scrolling through), so this borrows the running head's own answer to the
// same problem — a flat patch of the wall's own plaster laid fresh under the label — and lays it
// under the HUD instead: cheap, and it is what actually keeps the reserved band clear.
function ceilingDrawHudClear(){
  ctx.save();ctx.globalAlpha=.94;ctx.fillStyle=CEILING_PALETTE.plaster;ctx.fillRect(0,0,W,hudBand());ctx.restore();
}
function ceilingDrawRegisterGrid(){
  const key=W+'x'+H+'x'+DPR;
  if(!ceilingFrameTop||ceilingFrameKey!==key){
    // Same formula ceilingBakeWall reads for its own inset, so the frame's x0/x1 and the passing
    // tile's stay lined up.
    const inset=Math.max(15,Math.min(24,W*.05)),x0=inset+10,x1=W-inset-10,frieze=Math.max(13,Math.min(20,H*.026));
    // Each band is baked at just its own height rather than a screen-sized sheet — the frieze band
    // never needs more than the reed bundle plus its closing line, and the foot rule is a few pixels
    // thick, so this pair costs almost nothing beside the tall tile above.
    const topH=Math.ceil(inset+frieze+8),botY=H-inset-frieze*.45-8-4,botH=Math.ceil(H-botY);
    // The frame's own top and bottom star bands and corner roundels: correction 1 frames the room on
    // all four sides, and the top/bottom edges are screen-pinned architecture exactly like the frieze
    // and the foot rule below, not furniture that passes with the climb — so they belong here, in the
    // gutter each canvas already carries above the frieze and below the foot rule, rather than in the
    // tile. No extra canvas height: that gutter was empty before.
    const gapH=Math.max(16,Math.min(24,W/28)),bandT=Math.min(inset-3,20),rr=Math.max(4,inset*.42);
    const top=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(topH*DPR))),tg=top.getContext('2d');tg.scale(DPR,DPR);
    const bandYt=inset*.5+1;
    ceilingStarBandH(tg,6,W-6,bandYt,gapH,bandT);
    ceilingRoundel(tg,6+rr,bandYt,rr);ceilingRoundel(tg,W-6-rr,bandYt,rr);
    ceilingKheker(tg,x0,x1,inset+3,frieze);
    const bot=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(botH*DPR))),bg=bot.getContext('2d');bg.scale(DPR,DPR);
    // Drawn near-opaque rather than the .5 a register-dividing rule wears inside the passing tile: this
    // one is the room's real edge, so it has to close over whatever furniture is sliding behind it, not
    // share a static sheet with it at a register's own translucency. Its y is measured from botY, the
    // top of this small canvas, not from the screen the rule actually sits near the foot of.
    ceilingBlockRule(bg,x0,x1,H-inset-frieze*.45-8-botY,Math.max(4.5,frieze*.4),.94);
    const bandYb=botH-bandT*.5-2;
    ceilingStarBandH(bg,6,W-6,bandYb,gapH,bandT);
    ceilingRoundel(bg,6+rr,bandYb,rr);ceilingRoundel(bg,W-6-rr,bandYb,rr);
    ceilingFrameTop=top;ceilingFrameBot={c:bot,y:botY};ceilingFrameKey=key;
  }
  ctx.drawImage(ceilingFrameTop,0,0,W,ceilingFrameTop.height/DPR);
  ctx.drawImage(ceilingFrameBot.c,0,ceilingFrameBot.y,W,ceilingFrameBot.c.height/DPR);
}
// The route is a sequence of brush dabs, not a stroke — 03-ceiling.md says so outright, and the aim
// guide beside it already draws that way. A slow stretch of the flight is a run of close, loaded
// touches; a fast one thins to a scatter of light ones, which is the speed reading drawInkPath()
// gets from three line weights, given here instead through dab spacing and size — the way a loaded
// brush actually runs dry as the hand hurries. Walked once in screen space so the spacing reads the
// same at any zoom, and cheap regardless of how long inkPath has grown: one pass, two strokes a dab,
// nothing sampled that is not already on the path.
function ceilingDrawRoute(){
  if(inkPath.length<2)return;
  ctx.save();ctx.lineCap='round';
  let carry=0;
  for(let i=1;i<inkPath.length;i++){
    const a=inkPath[i-1],b=inkPath[i],ax=sx(a.x),ay=sy(a.y),bx=sx(b.x),by=sy(b.y),len=Math.hypot(bx-ax,by-ay);
    if(len<.1)continue;
    const ux=(bx-ax)/len,uy=(by-ay)/len,t=clamp((b.speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1);
    const spacing=lerp(4.5,13,t)*scale,weight=lerp(2.3,1.05,t)*scale,reach=lerp(2.1,1,t)*scale,alpha=lerp(.42,.22,t);
    for(let d=Math.max(0,spacing-carry);d<len;d+=spacing){
      const f=d/len,x=ax+(bx-ax)*f,y=ay+(by-ay)*f;
      // The setting-out rides a hair under the closing dab, off-register, the way the wall's other
      // two-pass marks already keep their red under the black.
      ctx.strokeStyle=`rgba(157,55,36,${alpha*.5})`;ctx.lineWidth=weight*1.1;
      ctx.beginPath();ctx.moveTo(x+1-ux*reach,y-1-uy*reach);ctx.lineTo(x+1+ux*reach,y-1+uy*reach);ctx.stroke();
      ctx.strokeStyle=`rgba(36,29,22,${alpha})`;ctx.lineWidth=weight;
      ctx.beginPath();ctx.moveTo(x-ux*reach,y-uy*reach);ctx.lineTo(x+ux*reach,y+uy*reach);ctx.stroke();
    }
    carry=(carry+len)%spacing;
  }
  ctx.restore();
}
// ---------- The wall's survey: the flight measured at both ends ----------
// The atlas measures every departure and every landing (drawSurveys(), src/effects.js:146-335); the
// data is recorded here too — src/ui.js calls recordDeparture/recordLanding regardless of plate — it
// was simply never drawn. The wall answers in its own instruments rather than borrowing the atlas's
// geometer's arcs: a cord snapped taut along the departure, and a plumb dropped from the hour-circle
// at the landing, with the arrival's angle set the way the wall sets every other count it keeps
// itself — Egyptian numerals, stroke by stroke. Both age on the same clock the atlas's constructions
// do (surveyProgress, defined once in effects.js and shared here), and both stay part of the wall
// once drawn on, pruned only when `surveys` itself is pruned. Kept deliberately quiet — thin, low
// alpha — since these sit on the route running up the sheet's own middle and must not compete with
// the hour-circles, the aim guide or the barque for the eye.
function ceilingDrawDepartureCord(s,t){
  const px=sx(s.x),py=sy(s.y),reach=24*scale,ex=px+s.dx*reach,ey=py+s.dy*reach,seed=((s.cx|0)*7+(s.cy|0)*11+3)|0;
  const head=ceilingBrush(ctx,[[px,py],[ex,ey]],CEILING_PALETTE.red,Math.max(.55,.85*scale),.24,seed,t);
  if(head){ceilingWet(ctx,head.x,head.y,.85*scale,.5,CEILING_PALETTE.red);ceilingReed(ctx,head.x,head.y,head.angle,.7,CEILING_PALETTE.red);}
}
function ceilingDrawLandingPlumb(s,t){
  const cx=sx(s.cx),cy=sy(s.cy),drop=Math.max(14,s.r*scale*.85),bx=cx,by=cy+drop*t,seed=((s.cx|0)*13+(s.cy|0)*17+5)|0;
  // The line: a plumb dropped straight down from the centre of the circle the flight landed on — the
  // wall's own vertical, in place of the atlas's swept arrival angle.
  ceilingBrush(ctx,[[cx,cy],[bx,by]],CEILING_PALETTE.carbon,Math.max(.5,.7*scale),.22,seed,t);
  if(t<1){ceilingWet(ctx,bx,by,.75*scale,.45,CEILING_PALETTE.carbon);return;}
  ctx.save();ctx.globalAlpha=.3;ctx.fillStyle=CEILING_PALETTE.carbon;ctx.beginPath();
  ctx.moveTo(bx,by+4.4*scale);ctx.lineTo(bx-2.5*scale,by-2.6*scale);ctx.lineTo(bx+2.5*scale,by-2.6*scale);ctx.closePath();ctx.fill();ctx.restore();
  const n=Math.max(1,Math.round(s.angle||1)),h=Math.max(6,7*scale);
  ceilingNumber(ctx,n,bx,by+8*scale,h,CEILING_PALETTE.carbon,true);
}
function ceilingDrawSurveys(){
  if(!surveys.length||!world)return;
  ctx.save();
  for(const s of surveys){
    const y=sy(s.cy);if(y<-160||y>H+160)continue;
    const t=surveyProgress(s);if(t<=0)continue;
    if(s.kind==='departure')ceilingDrawDepartureCord(s,t);else ceilingDrawLandingPlumb(s,t);
  }
  ctx.restore();
}
function ceilingDrawDecanCharts(){
  ctx.save();ctx.lineWidth=.7*scale;
  for(const chart of world.constellations){
    if(!chart.stars.length)continue;const t=reveal.progress(chart,CHART_REVEAL),alpha=(chart.expired?.12:chart.completed?.62:.27)*t;
    ctx.strokeStyle=`rgba(${chart.completed?'40,89,135':'36,29,22'},${alpha})`;ctx.beginPath();
    chart.stars.forEach((n,i)=>{const x=sx(n.x),y=sy(n.y);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.stroke();
    const anchor=chart.stars[0],x=sx(anchor.x),y=sy(anchor.y)-anchor.r*scale-10;
    if(y>-20&&y<H+20)ceilingWordRow(ctx,'star',x,y-2,Math.max(11,13*scale),CEILING_PALETTE.carbon,alpha+.2,t);
  }
  ctx.restore();
}
// The ordinary bodies draw from the wall's own range of star colours, and yellow is deliberately not
// in it. Yellow ochre is the sheet's small local accent (docs/eras/research/ceiling.md, §3: "small
// local fill and star sign; do not infer generic gold from it") and this plate spends the whole of it
// on the two bodies that have to be told apart at a glance — the gold body and the slingshot. An
// ordinary star reaching into the same pot was costing the sheet twice: half the field wore the
// accent colour, and a gold body was then indistinguishable from any ordinary star beside it.
// White is huntite, the pigment the wall paints star discs in; it is kept to one pot in five and
// otherwise spent on the disc a star is set on, since a white sign on plaster is a pale mark and a
// field of them would be a route the player has to hunt for.
const CEILING_BODY_FILLS=[CEILING_PALETTE.carbon,CEILING_PALETTE.red,CEILING_PALETTE.white,CEILING_PALETTE.redDark,CEILING_PALETTE.carbon];
function ceilingNodeIcon(n,r,stage){
  const seed=n.seed||n.id+1;
  if(n.type==='gold'||n.type==='sling'){
    ceilingStar(ctx,0,0,r*(n.type==='sling'?.3:.25),CEILING_PALETTE.yellow,stage,seed);return;
  }
  if(n.type==='shield'){
    ceilingPolygon(ctx,[[-r*.2,-r*.23],[r*.2,-r*.23],[r*.2,r*.06],[0,r*.28],[-r*.2,r*.06]],CEILING_PALETTE.blue,stage,seed,1.2);return;
  }
  if(n.type==='reflector'){
    ctx.save();ctx.globalAlpha=stage;ctx.fillStyle=CEILING_PALETTE.white;ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,-r*.05,r*.18,0,TAU);ctx.fill();ctx.stroke();ceilingBrush(ctx,[[0,r*.13],[0,r*.3]],CEILING_PALETTE.carbon,1,.9,seed);ctx.restore();return;
  }
  if(n.type==='inkwell'){
    ceilingPolygon(ctx,[[-r*.27,-r*.12],[r*.27,-r*.12],[r*.24,r*.14],[-r*.24,r*.14]],CEILING_PALETTE.yellow,stage,seed,1.1);
    if(stage>.72){ctx.fillStyle=CEILING_PALETTE.carbon;ctx.beginPath();ctx.arc(-r*.1,0,r*.06,0,TAU);ctx.fill();ctx.fillStyle=CEILING_PALETTE.red;ctx.beginPath();ctx.arc(r*.1,0,r*.06,0,TAU);ctx.fill();}return;
  }
  // A star table is a table of entries, not one stamp repeated down a column. The wall keeps three
  // kinds of ordinary body and this sheet keeps all three: the plain decan star sign; a star set on a
  // huntite disc, the way the brighter named stars are painted; and a moving star — one of the
  // ikhemu-wretju, the planets that never rest — carried past in its barque. Which kind a body is,
  // how big its sign is drawn and which pot it was flooded from all come off the node's own seed, so
  // a plate still paints identically every load while no two bodies on it are the same mark.
  const kind=ceilingHash(seed,307),size=r*(.2+ceilingHash(seed,311)*.11),
    fill=CEILING_BODY_FILLS[Math.floor(ceilingHash(seed,313)*CEILING_BODY_FILLS.length)%CEILING_BODY_FILLS.length];
  if(kind<.2){
    const w=r*(.26+ceilingHash(seed,317)*.08);
    ceilingPolygon(ctx,[[-w,r*.14],[w,r*.14],[w*1.4,r*.04],[w*.86,r*.1],[-w*.86,r*.1],[-w*1.4,r*.04]],CEILING_PALETTE.white,stage,seed,1.1);
    if(stage>.5){ctx.save();ctx.globalAlpha=clamp((stage-.5)*2,0,1);ctx.fillStyle=(seed&1)?CEILING_PALETTE.red:CEILING_PALETTE.carbon;ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-r*.05,r*.14,0,TAU);ctx.fill();ctx.stroke();ctx.restore();}
  }else if(kind<.4){
    const disc=size*1.34;
    if(stage>.3){
      ctx.save();ctx.globalAlpha=clamp((stage-.3)/.3,0,1);ctx.fillStyle=CEILING_PALETTE.white;ctx.beginPath();ctx.arc(0,0,disc,0,TAU);ctx.fill();
      ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=Math.max(.5,disc*.09);ctx.stroke();ctx.restore();
    }
    ceilingStar(ctx,0,0,size*.86,fill===CEILING_PALETTE.white?CEILING_PALETTE.carbon:fill,stage,seed,false);
  }else ceilingStar(ctx,0,0,size,fill,stage,seed);
}
function ceilingDrawNode(n,aim){
  const x=sx(n.x),y=sy(n.y),r=n.r*scale,cap=(n.cap||n.r)*scale;if(y+cap<-30||y-cap>H+30)return;
  const t=reveal.progress(n,NODE_REVEAL,y>0&&y<H),fade=n.type==='fading'&&world.player.node===n?clamp(1-world.player.orbitTime/4.5,.08,1):1;
  const active=world.player.node===n,target=aim&&aim.n===n,retired=n.visited&&!active;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=fade;
  const red=clamp(t/.25,0,1),correct=clamp((t-.22)/.28,0,1),finish=clamp((t-.68)/.32,0,1),start=n.phase||0;
  if(red>0){
    ctx.strokeStyle='rgba(157,55,36,.42)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(1.2,-1,r,start,start+TAU*red);ctx.stroke();
    // The setting-out ring is the wall's first pass, so the reed rides its own leading end — the direct
    // counterpart of the atlas's penWedgeEnd, parked on whichever ring is currently sweeping.
    if(red<1&&r>3){const a=start+TAU*red,hx=1.2+Math.cos(a)*r,hy=-1+Math.sin(a)*r,ta=a+Math.PI/2;
      ceilingWet(ctx,hx,hy,1.2*scale,.7*fade,CEILING_PALETTE.red);ceilingReed(ctx,hx,hy,ta,.85*fade,CEILING_PALETTE.red);}
  }
  if(correct>0){
    ctx.strokeStyle=`rgba(36,29,22,${retired?.16:.42})`;ctx.lineWidth=active?1.45:1;ctx.beginPath();ctx.arc(0,0,r,start,start+TAU*correct);ctx.stroke();
    if(correct<1&&r>3){const a=start+TAU*correct,hx=Math.cos(a)*r,hy=Math.sin(a)*r,ta=a+Math.PI/2;
      ceilingWet(ctx,hx,hy,scale,.65*fade,CEILING_PALETTE.carbon);ceilingReed(ctx,hx,hy,ta,.8*fade,CEILING_PALETTE.carbon);}
  }
  if(finish>0){
    ctx.strokeStyle=`rgba(36,29,22,${retired?.16:active?.68:.38})`;ctx.lineWidth=active?1.45:1;
    // A wheel divided by hand keeps its marks about a fixed distance apart whatever its size; a fixed
    // count instead made every ring on the sheet a scaled copy of every other, which is most of what
    // read as sameness across a field of bodies. The count follows the circumference, clamped so the
    // smallest ring still reads as divided and the largest does not close up into a solid band.
    const ticks=clamp(Math.round(r*.62),12,34);
    for(let i=0;i<ticks;i++){const a=i/ticks*TAU;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.72,Math.sin(a)*r*.72);ctx.lineTo(Math.cos(a)*r*.94,Math.sin(a)*r*.94);ctx.stroke();}
    ctx.beginPath();ctx.arc(0,0,r*.7,0,TAU);ctx.stroke();
  }
  // Defect (e): a dashed circle is the engraved atlas's mark, carried over unexamined. The wall's own
  // way to rule a boundary is a doubled line — the same hair-off-register repeat ceilingSign's closing
  // stroke already wears where the brush reloaded — so the target ring (where the flight will land)
  // and the capture band (how close counts while orbiting) keep the true radius on the inner, on-cap
  // stroke and add only a fainter echo outside it, never inside, so the boundary itself never blurs.
  if(target||active){
    const col=target?'40,89,135':'196,147,46';
    ctx.strokeStyle=`rgba(${col},.74)`;ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,0,cap,0,TAU);ctx.stroke();
    ctx.strokeStyle=`rgba(${col},.36)`;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(0,0,cap+2.6*scale,0,TAU);ctx.stroke();
  }
  ceilingNodeIcon(n,r,t);
  if(retired&&finish>0)ceilingBrush(ctx,[[-r*.7,r*.48],[r*.7,-r*.48]],CEILING_PALETTE.red,.7,.22,700+n.id);
  if(n.difficultyChoice&&t>.6){
    ctx.globalAlpha=clamp((t-.6)/.4,0,1);ctx.font=plateFace(Math.max(8,9.5*scale),'sc');ctx.fillStyle=CEILING_PALETTE.gloss;ctx.textAlign='center';ctx.fillText(CEILING_COURSES[n.difficultyChoice],0,r+15*scale);
  }
  ctx.restore();
}
function ceilingDrawAim(aim){
  const preview=world.flightPreview,points=preview&&preview.points;if(!world.player.node||!points||points.length<2)return;
  const warn=!!preview.blocked||!!aim?.steep,color=warn?CEILING_PALETTE.red:aim?CEILING_PALETTE.blue:CEILING_PALETTE.carbon;
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=Math.max(.8,1.05*scale);ctx.lineCap='round';
  let carry=0;
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],ax=sx(a.x),ay=sy(a.y),bx=sx(b.x),by=sy(b.y),len=Math.hypot(bx-ax,by-ay);if(len<.1)continue;
    const ux=(bx-ax)/len,uy=(by-ay)/len;
    for(let d=Math.max(0,7-carry);d<len;d+=11){const f=d/len,x=ax+(bx-ax)*f,y=ay+(by-ay)*f;ctx.globalAlpha=lerp(.72,.24,points[i].distance/Math.max(1,points.at(-1).distance));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+ux*4.2*scale,y+uy*4.2*scale);ctx.stroke();}
    carry=(carry+len)%11;
  }
  ctx.globalAlpha=1;
  if(aim?.perfect&&!preview.fogged){ctx.strokeStyle='rgba(196,147,46,.72)';ctx.lineWidth=1.4*scale;ctx.beginPath();ctx.arc(sx(aim.cx),sy(aim.cy),aim.radius*scale,aim.entryAngle,aim.entryAngle+aim.entryDir*.46,aim.entryDir<0);ctx.stroke();}
  if(preview.inkRange>=0&&points.at(-1).distance>preview.inkRange){
    const q=points.find(p=>p.distance>=preview.inkRange);if(q){const x=sx(q.x),y=sy(q.y);ctx.strokeStyle=CEILING_PALETTE.red;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-4,y-4);ctx.lineTo(x+4,y+4);ctx.moveTo(x+4,y-4);ctx.lineTo(x-4,y+4);ctx.stroke();}
  }
  ctx.restore();
}
function ceilingDrawApep(h,t){
  const r=h.r*scale,field=gravityRadius(h)*scale,time=reducedMotion?0:world.time;
  // A serpent is already drawn as a wave, so turning the coil and running a travelling undulation
  // along it adds no depth and no modelling — it is the figure doing what the figure depicts. The
  // pull is the atlas's own term: as the barque is taken the coil visibly winds tighter around it,
  // which is the one place a still image here was costing the player information.
  const pull=world.player.node?0:clamp(1-Math.hypot(world.player.x-h.x,world.player.y-h.y)/gravityRadius(h),0,1);
  ctx.save();ctx.translate(sx(h.x),sy(h.y));
  const pulse=reducedMotion?1:.94+.06*Math.sin(time*1.1+(h.phase||0));
  ctx.strokeStyle='rgba(157,55,36,.2)';ctx.lineWidth=.7;for(const k of [.48,.72,1]){const kk=k*pulse*(1-pull*.08);ctx.beginPath();ctx.ellipse(0,0,field*kk,field*kk*.62,0,0,TAU);ctx.stroke();}
  const turn=time*.5+(h.phase||0),wind=1.7+pull*1.1;
  const points=[];for(let i=0;i<=52;i++){const u=i/52,a=u*TAU*wind+turn,wave=reducedMotion?0:Math.sin(u*TAU*3-time*2.4+(h.phase||0))*r*.05,rr=r*(.12+.78*u)+wave;points.push([Math.cos(a)*rr,Math.sin(a)*rr*.62]);}
  ceilingBrush(ctx,points,CEILING_PALETTE.carbon,Math.max(3,r*.24),.92*t,h.seed);
  ceilingBrush(ctx,points,CEILING_PALETTE.redDark,Math.max(1.5,r*.14),.92*t,h.seed+7);
  const p=points.at(-1),q=points.at(-3),a=Math.atan2(p[1]-q[1],p[0]-q[0]);ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(a);
  ceilingPolygon(ctx,[[0,-r*.12],[r*.32,0],[0,r*.12]],CEILING_PALETTE.red,t,h.seed+13,1);ctx.restore();ctx.restore();
}
function ceilingDrawEye(h,t){
  const r=h.r*scale,field=gravityRadius(h)*scale,time=reducedMotion?0:world.time;ctx.save();ctx.translate(sx(h.x),sy(h.y));
  // "Radiating" is the whole content of this figure, so the rays are where the motion has to live:
  // they lengthen and shorten on a slow breath, and flare outward as the traveller closes in — the
  // Eye's own reading of the atlas's pull term.
  const pull=world.player.node?0:clamp(1-Math.hypot(world.player.x-h.x,world.player.y-h.y)/gravityRadius(h),0,1);
  const breath=reducedMotion?1:.82+.18*Math.sin(time*1.3+(h.phase||0));
  for(let i=0;i<12;i++){const a=i/12*TAU+(h.phase||0)*.08,from=r*.68,to=(field*.6+field*.3*breath)*(1+pull*.5);ceilingBrush(ctx,[[Math.cos(a)*from,Math.sin(a)*from],[Math.cos(a+.08)*to,Math.sin(a+.08)*to]],CEILING_PALETTE.red,.9+pull*.5,(.32+.14*breath+pull*.3)*t,h.seed+i);}
  ctx.globalAlpha=t;ctx.fillStyle=CEILING_PALETTE.yellow;ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,r*.68,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle=CEILING_PALETTE.redDark;ctx.beginPath();ctx.arc(0,0,r*(.33+pull*.05),0,TAU);ctx.fill();
  ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-r*.35,0);ctx.quadraticCurveTo(0,-r*.25,r*.35,0);ctx.quadraticCurveTo(0,r*.24,-r*.35,0);ctx.stroke();ctx.restore();
}
function ceilingDrawShu(h,t){
  const r=h.r*scale,field=gravityRadius(h)*scale,dir=Number.isFinite(h.dir)?h.dir:0,time=reducedMotion?0:world.time;ctx.save();ctx.translate(sx(h.x),sy(h.y));
  // Shu himself holds still — holding sky and earth apart is the whole point of him — and only the
  // air he holds drifts, along the same local +x the gust actually pushes (see flightStep's
  // Math.cos(h.dir)/Math.sin(h.dir) gust), so the crosswind's direction is read, not inferred.
  const step=field*.36,drift=reducedMotion?0:(time*34*scale)%step;
  ctx.save();ctx.rotate(dir);for(const side of [-.55,0,.55]){const y=side*r*.68;ceilingBrush(ctx,[[-field*.8,y],[field*.8,y]],CEILING_PALETTE.blue,.9,.3*t,h.seed+side*20);for(let x=-field*.55-(reducedMotion?0:step)+drift;x<field*.7;x+=step)ceilingBrush(ctx,[[x,y-2],[x+6*scale,y],[x,y+2]],CEILING_PALETTE.blue,.7,.28*t,h.seed+x);}ctx.restore();
  // Upright Shu is the sign; the blue currents carry the mechanical direction separately.
  ceilingPolygon(ctx,[[-r*.16,r*.34],[r*.16,r*.34],[r*.2,r*.62],[-r*.2,r*.62]],CEILING_PALETTE.white,t,h.seed,1.1);
  ceilingPolygon(ctx,[[-r*.12,-r*.08],[r*.12,-r*.08],[r*.16,r*.35],[-r*.16,r*.35]],CEILING_PALETTE.red,t,h.seed+3,1.1);
  ceilingBrush(ctx,[[-r*.1,-r*.02],[-r*.42,-r*.44]],CEILING_PALETTE.carbon,1.2,.9*t,h.seed+9);ceilingBrush(ctx,[[r*.1,-r*.02],[r*.42,-r*.44]],CEILING_PALETTE.carbon,1.2,.9*t,h.seed+10);
  ceilingBrush(ctx,[[-r*.52,-r*.47],[r*.52,-r*.47]],CEILING_PALETTE.carbon,1.3,.9*t,h.seed+11);
  ctx.globalAlpha=t;ctx.fillStyle=CEILING_PALETTE.red;ctx.beginPath();ctx.arc(0,-r*.18,r*.12,0,TAU);ctx.fill();ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.stroke();ctx.restore();
}
function ceilingDrawHazard(h){
  const y=sy(h.y),reach=gravityRadius(h)*scale;if(y+reach<-40||y-reach>H+40)return;const t=reveal.progress(h,HAZARD_REVEAL,true);
  if(h.kind==='flare')ceilingDrawEye(h,t);else if(h.kind==='wind')ceilingDrawShu(h,t);else ceilingDrawApep(h,t);
}
function ceilingDrawNun(g){
  const x=sx(g.x),y=sy(g.y),r=g.r*scale;if(y+r<-30||y-r>H+30)return;const t=reveal.progress(g,HAZARD_REVEAL,true);
  // Formless water held perfectly still is the one thing Nun is not, so the hatch drifts sideways
  // as a travelling wave instead of sitting as a fixed zigzag.
  const time=reducedMotion?0:world.time;
  ctx.save();ctx.globalAlpha=.78*t;ctx.beginPath();ctx.ellipse(x,y,r*1.02,r*.82,0,0,TAU);ctx.clip();ctx.fillStyle='rgba(221,207,173,.82)';ctx.fillRect(x-r,y-r,r*2,r*2);
  for(let i=-5;i<=5;i++){const yy=y+i*r*.16,pts=[];for(let px=x-r*1.1,k=0;px<=x+r*1.15;px+=r*.12,k++)pts.push([px,yy+Math.sin((px-x)/(r*.24)*Math.PI+i*.7+(g.phase||0)+time*1.4)*r*.045]);ceilingBrush(ctx,pts,CEILING_PALETTE.blue,Math.max(.8,r*.055),.62,g.seed+i);}
  ctx.restore();ctx.save();ctx.globalAlpha=.32*t;ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(x,y,r*1.02,r*.82,0,0,TAU);ctx.stroke();ctx.restore();
}
function ceilingDrawPlayer(){
  if(world.state==='dead')return;const p=world.player,x=sx(p.x),y=sy(p.y),s=Math.max(.72,scale),speed=Math.hypot(p.vx,p.vy);
  if(Math.abs(p.vx)>1)ceilingFacing=p.vx<0?-1:1;
  // A single flat night barque, level and mirrored to face travel rather than rotated onto it: an
  // orbit's tangent swings through every angle, and a hull turned to match it stood on its stern for
  // half of every circle. No banking, and — the same discipline — never upside down either. A small
  // heel toward horizontal, capped well short of vertical, is the only nod the hull gives to climbing
  // or diving; the water and the flown route still carry the actual heading.
  const heel=clamp(Math.atan2(p.vy,Math.abs(p.vx)||1e-3),-.3,.3);
  ctx.save();ctx.translate(x,y);ctx.rotate(heel);ctx.scale(ceilingFacing*s,s);
  const hull=[[-20,3],[20,3],[27,-5],[16,-1],[-16,-1],[-27,-5]];ceilingPolygon(ctx,hull,CEILING_PALETTE.yellow,1,913,1.5);
  ceilingBrush(ctx,[[-10,-1],[-10,-12]],CEILING_PALETTE.carbon,1.3,.9,919);
  // The one moving part: the solar disc the barque exists to carry, crossing the deck on its own slow
  // travel and quickening with the boost exactly as the quill's vane flexes with speed
  // (OBSERVER_MARKS.quill, src/effects.js) — flat, no glow, no modelling, held still under reducedMotion.
  const boost=clamp((speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1),dx=4+(reducedMotion?0:Math.sin(world.time*(1.2+boost*1.8))*11);
  ctx.fillStyle=CEILING_PALETTE.red;ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(dx,-10,6,0,TAU);ctx.fill();ctx.stroke();
  ceilingBrush(ctx,[[dx,-16],[dx+3,-20]],CEILING_PALETTE.carbon,1,.85,923);
  // Defect (e): the reflector's ring was the atlas's dashed convention; the wall marks the same
  // boundary two other ways instead, so the two held charges stay tellable apart by shape as well as
  // by colour and radius. The shield keeps a doubled line, close and smooth, at its own tighter radius
  // — the era file's "src/effects.js:511-522" precedent for keeping the two apart by radius as well as
  // colour still holds here. The reflector, wider still, becomes a block border: short painted segments
  // around the rim, the same rhythm ceilingBlockRule lays along a straight register line, bent around a
  // circle instead of ruled with a dash — a ring built of blocks reads as broken at a glance without
  // borrowing the engraved atlas's ruling pen to do it.
  if(p.shielded){
    ctx.strokeStyle='rgba(40,89,135,.72)';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.stroke();
    ctx.strokeStyle='rgba(40,89,135,.36)';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(0,0,19.4,0,TAU);ctx.stroke();
  }
  if(p.reflectorArmed){
    const segs=14,gap=.32;ctx.strokeStyle='rgba(157,55,36,.8)';ctx.lineWidth=1.4;ctx.lineCap='butt';
    for(let i=0;i<segs;i++){const a0=i/segs*TAU,a1=a0+(1-gap)/segs*TAU;ctx.beginPath();ctx.arc(0,0,21,a0,a1);ctx.stroke();}
  }
  ctx.restore();
}
// ---------- The wall's record of a flight: four marks in pigment, and the score as a marginal note ----------
// Wet red ochre and the tone it dries toward as it soaks into the lime — this sheet's own wet/dry
// pair, built from CEILING_PALETTE.red and .loss rather than borrowed from the atlas's trailInk(),
// since a painted wall dries into its own plaster, not into someone else's paper.
const CEILING_WET=[157,55,36],CEILING_DRY=[157,137,102];
// A capture is the wall's record of a landing: a loaded dab of red ochre set at the circle, its
// edge grown out from the node by the same reducedMotion-gated start/distance the plain ring below
// uses, so it stands complete and still exactly like every other mark under that setting. A perfect
// landing set true first time and reads as already finished — closed with a black ring and the fan
// of ticks a perfect atlas transfer wears at its point of contact; an ordinary one is left as pigment
// only, its edge still the wet red rather than a closing black line, which is the whole of the
// "cleaner" reading the gameplay asks for.
function ceilingCaptureMark(q,t,x,y){
  const radius=(q.start+(reducedMotion?0:t*q.distance))*scale,alpha=(q.alpha||.5)*clamp(1-t*t,0,1),seed=q.seed||1;
  ctx.save();ctx.translate(x,y);ctx.rotate(q.angle||0);
  landContour(ctx,0,0,radius,radius*.86,seeded(seed));
  ctx.fillStyle=`rgba(${CEILING_WET},${alpha*(q.perfect?.92:.78)})`;ctx.fill();
  if(q.perfect){
    ctx.strokeStyle=`rgba(36,29,22,${alpha})`;ctx.lineWidth=Math.max(.7,radius*.12);ctx.stroke();
    for(let i=-2;i<=2;i++){
      const a=i*.5,c=Math.cos(a),s=Math.sin(a),from=radius*1.05,to=from+3+scale*1.5;
      ceilingBrush(ctx,[[c*from,s*from],[c*to,s*to]],CEILING_PALETTE.carbon,Math.max(.5,radius*.08),alpha*.75,seed+i*11);
    }
  }else{
    ctx.strokeStyle=`rgba(${CEILING_WET},${alpha*.42})`;ctx.lineWidth=Math.max(.5,radius*.06);ctx.stroke();
  }
  ctx.restore();
}
// The bead pooled where the brush lifted at a release — grown fast then left to dry, the same two
// stages the atlas's own drying blot passes through (mixRgb(pen.blotWet,pen.blotDry,dry)), but mixed
// from this sheet's own pair and given landContour's organic edge instead of the flat ellipse it
// wore before. `dry` is a colour change, not a motion, so it runs the same under reducedMotion,
// exactly as it does on the atlas's own version of this mark.
function ceilingBlotMark(q,t,x,y){
  const grow=reducedMotion?1:clamp(t*6,.28,1),dry=clamp((t-.15)/.85,0,1),alpha=(q.alpha||.42)*clamp(1-t*t,0,1),
    size=(q.size||6)*scale*grow,rgb=mixRgb(CEILING_WET,CEILING_DRY,dry);
  ctx.save();ctx.translate(x,y);
  landContour(ctx,0,0,size,size*.82,seeded(q.seed||1));
  ctx.fillStyle=`rgba(${rgb},${alpha*.82})`;ctx.fill();
  ctx.strokeStyle=`rgba(${rgb},${alpha*.5})`;ctx.lineWidth=Math.max(.4,size*.07);ctx.stroke();
  ctx.restore();
}
// A graze: pigment thrown off the brush, not pooled — a scatter of short flecks flung clear of the
// point rather than one round mark, same as before, with one addition: a small dab at the origin
// itself, so the flecks read as having come from somewhere instead of hanging with nothing at their
// centre. `dir`, when the event supplies it, aims the scatter; with none the flecks fly full circle.
function ceilingSplatMark(q,t,x,y){
  const alpha=(q.alpha||.42)*clamp(1-t*t,0,1),sd=q.seed||1,size=(q.size||6)*scale,
    base=q.dir?(q.dir<0?Math.PI:0):0,cone=q.dir?1.9:TAU;
  ctx.save();ctx.translate(x,y);
  landContour(ctx,0,0,size*.4,size*.34,seeded(sd));
  ctx.fillStyle=`rgba(${CEILING_WET},${alpha*.7})`;ctx.fill();
  ctx.strokeStyle=`rgba(${CEILING_WET},${alpha})`;ctx.lineCap='round';
  for(let i=0;i<6;i++){
    const a=base+(ceilingHash(sd,i)-.5)*cone,len=size*.5+ceilingHash(i,sd)*size*.6;
    ctx.lineWidth=Math.max(.8,size*.11);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*len,Math.sin(a)*len);ctx.stroke();
  }
  ctx.restore();
}
// A painted pointing sign — the wall's own equivalent of the atlas's printer's manicule, cut in two
// brushed strokes instead of an engraved hand: a chevron closing to a point, and a short shaft
// running back from it. dir is +1 to point right (a note standing in the left margin) or -1 to
// point left, so the sign always aims back in at the field rather than out past the edge.
function ceilingPointer(x,y,dir,size,alpha){
  if(alpha<=0)return;
  ceilingBrush(ctx,[[x-dir*size,y-size*.6],[x,y],[x-dir*size,y+size*.6]],CEILING_PALETTE.carbon,Math.max(.6,size*.16),alpha,(x|0)*7+(y|0));
  ceilingBrush(ctx,[[x-dir*size*.1,y],[x-dir*size*1.6,y]],CEILING_PALETTE.carbon,Math.max(.5,size*.11),alpha*.7,(x|0)*3+(y|0)*5);
}
// A score is set as a marginal note beside the play field rather than floating up over it: the
// wall's own reading of the atlas's manicule-and-margin gesture (src/effects.js's floater loop),
// clamped between hudBand() and footerBand() the same way. It keeps to the wall's small-caps hand
// and its own red ochre rubric rather than the atlas's Fell italic. The digits themselves stay
// Arabic — the era file's own rule is that a count read at a run stays Arabic and only a count the
// wall makes for itself, like the hour, is written in strokes with ceilingNumber(), and a capture's
// score is exactly a count read at a run — so no Egyptian numerals are used here.
function ceilingFloaterMark(f,alpha){
  const size=Math.max(10,12*scale),margin=Math.max(9,Math.min(15,W*.028)),hand=Math.max(4,5.2*scale),
    left=sx(f.x)<W*.5,nx=left?margin+hand*2.2:W-margin-hand*2.2,
    ny=clamp(sy(f.y)-(reducedMotion?0:f.age*20*scale),hudBand()+15,H-footerBand()-15);
  ctx.save();ctx.globalAlpha=alpha;ctx.font=plateFace(size,'sc');ctx.fillStyle=CEILING_PALETTE.red;
  ctx.textAlign=left?'left':'right';ctx.fillText(f.text,nx,ny);
  ceilingPointer(nx+(left?-hand*1.8:hand*1.8),ny-hand*.5,left?1:-1,hand,alpha*.85);
  ctx.restore();
}
function ceilingDrawEffects(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];if(world.state!=='paused'){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*1.5);p.vy*=Math.exp(-dt*1.5);}if(p.life<=0){particles.splice(i,1);continue;}
    const rgb=p.color==='red'?'157,55,36':p.color==='blue'?'40,89,135':p.color==='violet'?'82,65,91':'196,147,46',a=clamp(p.life/(p.max||1),0,1);
    ctx.strokeStyle=`rgba(${rgb},${a*.75})`;ctx.lineWidth=Math.max(.7,p.size*scale);ctx.beginPath();ctx.moveTo(sx(p.x),sy(p.y));ctx.lineTo(sx(p.x-p.vx*.02),sy(p.y-p.vy*.02));ctx.stroke();
  }
  for(let i=rings.length-1;i>=0;i--){
    const q=rings[i];if(world.state!=='paused')q.age+=dt;if(q.age>q.life){rings.splice(i,1);continue;}const t=q.age/q.life,x=sx(q.node?q.node.x:q.x),y=sy(q.node?q.node.y:q.y);
    if(q.kind==='capture'){ceilingCaptureMark(q,t,x,y);continue;}
    if(q.kind==='blot'){ceilingBlotMark(q,t,x,y);continue;}
    if(q.kind==='splat'){ceilingSplatMark(q,t,x,y);continue;}
    // The plain ring — a release, a ricochet, a wormhole's exit — is a brushed circle on a painted
    // wall, not a compass circle: painted with the sheet's own ceilingBrush over ceilingArcPoints
    // like everything else here, in place of the raw ctx.arc it used to be drawn with.
    const r=(q.start+(reducedMotion?0:t*q.distance))*scale;
    ceilingBrush(ctx,ceilingArcPoints(x,y,r,0,TAU,22),q.perfect?CEILING_PALETTE.blue:CEILING_PALETTE.red,Math.max(.8,1.1*scale),(1-t)*(q.alpha||.5),q.seed||7);
  }
  for(let i=floaters.length-1;i>=0;i--){
    const f=floaters[i];if(world.state!=='paused')f.age+=dt;if(f.age>1.15){floaters.splice(i,1);continue;}
    ceilingFloaterMark(f,Math.min(1,f.age*8)*clamp((1.15-f.age)*3,0,1));
  }
}
function ceilingDrawDark(dt){
  const fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  ctx.save();ctx.fillStyle=darknessRelief>.05?'rgba(62,55,40,.84)':'rgba(56,39,30,.9)';ctx.fillRect(0,fy,W,Math.max(0,H-fy));
  for(let layer=0;layer<5;layer++){
    ctx.strokeStyle=`rgba(${layer? '36,29,22':'157,55,36'},${.54-layer*.07})`;ctx.lineWidth=layer?1:.9;ctx.beginPath();
    for(let x=-8;x<=W+8;x+=8){const y=fy+layer*7+Math.sin(x/45+world.time*.16+layer)*3;if(x<0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
  }
  // Apep's long back repeatedly breaks the boundary, an image of threatened order rather than a space fog.
  ctx.strokeStyle=`rgba(25,18,14,${.28+near*.22})`;ctx.lineWidth=5*scale;ctx.beginPath();
  for(let x=-20;x<=W+20;x+=10){const y=fy+12+Math.sin(x/54+world.time*.12)*8;if(x<0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.restore();
}
function ceilingDrawRunningHead(dt){
  const index=ceilingWatch(),bottom=Math.max(22,safeAreaBottom()+13),y=H-bottom;
  // The hour is a count the wall itself makes, so it is written in strokes, largest first, and the
  // Latin beside it stays what it is: a modern gloss, set in the era's slab and not pretending to
  // be a reading of the line it glosses. Roman numerals belonged to a century three sheets later.
  const size=Math.max(10,11*scale),label=CEILING_HOURS[index];
  ctx.save();ctx.textAlign='left';ctx.font=plateFace(size,'sc');
  const width=ctx.measureText(label).width,figures=ceilingNumWidth(index+1,size*1.05),left=W*.5-(width+figures+size*.75)/2;
  // By mid-run the risen darkness sits directly behind this line — dark brown ink on the atlas's own
  // dark-brown floor, unreadable. The atlas answers with a soft paper gradient under its running head
  // (runningHeadGradient(), src/frame.js); a painted wall carries no such glow, so this is a flat patch
  // of the wall's own plaster laid fresh under the label instead — a repair the palette already
  // accounts for (Plaster loss/wear-and-repairs), not an added UI device, and cheaper than a gradient.
  const pad=size*.55;ctx.fillStyle=CEILING_PALETTE.plaster;ctx.globalAlpha=.95;
  ctx.fillRect(left-pad,y-size*1.5,width+figures+size*.75+pad*2,size*1.85);
  ctx.globalAlpha=.72;ceilingNumber(ctx,index+1,left,y-size*.78,size*1.05,CEILING_PALETTE.carbon);
  ctx.fillStyle=CEILING_PALETTE.carbon;ctx.fillText(label,left+figures+size*.75,y);ctx.restore();
}
// P3 · the flat lime chapter card is retired outright rather than softened. It used to fill
// W*.18..W*.82 with opaque lime and cover the very hour-circles the player was aiming at every time a
// watch turned — the crudest single element on the sheet (docs/eras/CEILING-POLISH.md, "1 · The wall
// does not move"). Now that P2 gives every watch its own register, the new furniture arriving under
// the flight IS the announcement, exactly the preferred outcome that file names; no card is needed to
// say what the wall is already saying by looking different. What is left of the old card is the brief
// painted band below marking the moment the register turns, and it is drawn here — before a single
// node, hazard, the aim guide or the barque — so it sits under the whole flight layer in renderCeiling
// and can never cost the player sight of a circle, whatever alpha it wears.
function ceilingDrawChangeover(dt){
  if(reducedMotion||world.state!=='playing'||chapterReveal.index<=0||chapterReveal.age>=CEILING_CHANGE_DUR)return;
  chapterReveal.age+=dt;
  const age=chapterReveal.age,a=Math.sin(clamp(age/CEILING_CHANGE_DUR,0,1)*Math.PI),cy=H*.5,label=CEILING_HOURS[chapterReveal.index];
  ctx.save();ctx.textAlign='center';
  // A band of fresh plaster laid across, translucent rather than the old opaque fill, so whatever it
  // covers is dimmed, never hidden — docs/eras/CEILING-POLISH.md P3's own alternative, applied to the
  // register change itself rather than to a card standing apart from it. It is set in `lime`, the
  // palette's own brighter repair tone (docs/eras/03-ceiling.md's palette table: "wear and repairs"),
  // not the base `plaster` the rest of the wall is mixed from — the same colour, at full opacity, would
  // be invisible laid over itself.
  ctx.globalAlpha=a*.6;ctx.fillStyle=CEILING_PALETTE.lime;ctx.fillRect(W*.18,cy-48,W*.64,100);
  ctx.globalAlpha=a;
  ceilingBlockRule(ctx,W*.18,W*.82,cy-48,5,.62*a);ceilingBlockRule(ctx,W*.18,W*.82,cy+42,5,.62*a);
  // wnwt, the hour: the new register's own name, set out in red and closed in black — the wall's four
  // passes, which ceilingWordRow already runs — standing in for the atlas's turned sheet.
  ceilingWordRow(ctx,'hour',W*.5,cy-9,46,CEILING_PALETTE.red,1,clamp(age/(CEILING_CHANGE_DUR*.75),0,1));
  ctx.fillStyle=CEILING_PALETTE.carbon;ctx.font=plateFace(11,'sc');
  if(!penLettering(label,W*.5,cy+30,11,'slab',age-.5,'center'))ctx.fillText(label,W*.5,cy+30);
  ctx.restore();
}
function renderCeiling(dt,aim){
  reveal.prime();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
  const tile=ceilingBuildWall(),tileH=tile.height/DPR;
  // One wall, one rate: the tile is carried at exactly -world.cameraY*scale, the same factor sy()
  // applies to every node and hazard on this sheet, so the room passes at the same speed as everything
  // flying over it — no parallax, because a slower or faster layer would be a depth cue, and the era
  // file rules those out flat. phase is where in the tile's own cycle the camera currently sits; the
  // loop draws just enough copies, starting one tile above that phase, to cover the screen regardless
  // of where the phase falls.
  const phase=(((-world.cameraY*scale)%tileH)+tileH)%tileH;
  for(let y=phase-tileH;y<H;y+=tileH)ctx.drawImage(tile,0,y,W,tileH);
  ceilingDrawHudClear();
  ceilingDrawRegisterGrid();
  ceilingDrawChangeover(dt);
  ctx.save();if(!reducedMotion&&world.shake>.08)ctx.translate(Math.sin(world.time*109)*world.shake*scale,Math.cos(world.time*137)*world.shake*.65*scale);
  ceilingDrawRoute();ceilingDrawDecanCharts();for(const n of world.nodes)ceilingDrawNode(n,aim);for(const h of world.hazards)ceilingDrawHazard(h);
  ceilingDrawAim(aim);for(const g of world.nebulas)ceilingDrawNun(g);
  // Same slot the atlas gives drawSurveys(): after the aim guide and the route's own ink, ahead of the
  // transient effects layer (render(), src/frame.js) — the survey is dried ink beside the route, not a
  // live effect.
  ceilingDrawSurveys();
  ceilingDrawEffects(dt);drawInscriptions(dt);ceilingDrawPlayer();ceilingDrawDark(dt);ctx.restore();
  ceilingDrawRunningHead(dt);
  if(screenFlash>0){ctx.fillStyle=`rgba(157,55,36,${screenFlash*.055})`;ctx.fillRect(0,0,W,H);if(world.state!=='paused')screenFlash=Math.max(0,screenFlash-dt*3);}
}
