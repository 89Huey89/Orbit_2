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
const CEILING_HOURS=['FIRST WATCH','SECOND WATCH','MIDDLE WATCH','BEFORE DAWN'];
// The wall's own names for the three courses the opening circles offer, standing in for the atlas's
// TIRO, ADEPTUS and MAGISTER (src/simulation.js's DIFFICULTY_LABELS). They are captions on a night's
// voyage rather than grades of a practitioner, because that is the register everything else on this
// sheet speaks in, and they are read both by the circles themselves and by src/ui.js's announcement,
// so the two can never drift apart. They are kept short on purpose: the outer two are set under the
// circles nearest the edge, where a longer caption runs under the marginal month circles on a phone.
const CEILING_COURSES={relaxed:'QUIET NIGHT',classic:'FULL NIGHT',hardcore:'HARD NIGHT'};
let ceilingWall=null,ceilingWallKey='';
// The room's own architecture — the kheker frieze and the foot's block rule — is cached separately
// from the tall passing strip below, because it never moves: see ceilingDrawRegisterGrid(). Each is
// only as tall as the band it actually draws, not a full screen-sized sheet, since the two together
// are otherwise pinned exactly the way this file always pinned the whole wall.
let ceilingFrameTop=null,ceilingFrameBot=null,ceilingFrameKey='';
// The barque's last known heading, held between frames so a passing moment of near-zero horizontal
// speed (the tip of a climb or dive) does not flicker the mirror back and forth.
let ceilingFacing=1;

function invalidateCeilingArt(){ceilingWall=null;ceilingWallKey='';ceilingFrameTop=null;ceilingFrameBot=null;ceilingFrameKey='';}
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
// N14, the star sign, sets one point downward and two arms up — the orientation the wall uses, and
// the quickest way to tell an Egyptian star from the one a modern chart prints.
function ceilingStar(g,cx,cy,r,fill=CEILING_PALETTE.yellow,stage=1,seed=1){
  const p=[];for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r;p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
  ceilingPolygon(g,p,fill,stage,seed,Math.max(.8,r*.12));
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
    const b=x+step*.5,c=cols[i%3],u=h/16;
    ceilingPolygon(g,[[b-u*1.9,y+h],[b-u*1.9,y+h*.52],[b-u*2.7,y+h*.44],[b-u*1.1,y+h*.36],[b+u*1.1,y+h*.36],[b+u*2.7,y+h*.44],[b+u*1.9,y+h*.52],[b+u*1.9,y+h]],CEILING_PALETTE.white,1,i*17+3,1);
    for(let k=-2;k<=2;k++)ceilingBrush(g,[[b+k*u*.85,y+h*.36],[b+k*u*2.5,y+h*.02]],k%2?c:CEILING_PALETTE.carbon,Math.max(1,u*.7),.85,i*29+k*5);
    ceilingBrush(g,[[b-u*2.9,y+h*.51],[b+u*2.9,y+h*.51]],c,Math.max(1,u*.8),.9,i*31);
    ceilingBrush(g,[[b-u*2.9,y+h*.64],[b+u*2.9,y+h*.64]],CEILING_PALETTE.carbon,Math.max(.55,u*.45),.62,i*37);
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
  for(let x=x0,i=0;x<x1;x+=block,i++){
    g.globalAlpha=alpha*(.88+ceilingHash(i,y)*.12);g.fillStyle=cols[i%8];g.fillRect(x,y+1.4,Math.max(0,Math.min(block,x1-x)-.9),h);
  }
  g.restore();
  ceilingBrush(g,[[x0,y+h+2.4],[x1,y+h+2.4]],CEILING_PALETTE.carbon,1.3,.78*alpha/.8,202);
}
// The painter snapped a grid in red before any figure was set out, and the flood never quite covered
// it. It is the only orthogonal thing on the sheet that was not drawn by a brush.
function ceilingSettingGrid(g,x0,y0,x1,y1,unit){
  g.save();g.strokeStyle='rgba(157,55,36,.085)';g.lineWidth=.5;g.beginPath();
  for(let x=x0;x<=x1;x+=unit){g.moveTo(x,y0);g.lineTo(x,y1);}
  for(let y=y0;y<=y1;y+=unit){g.moveTo(x0,y);g.lineTo(x1,y);}
  g.stroke();g.restore();
}
// The side borders are the star-strewn band the room's own edge carries: painted star signs between
// two rules, alternately yellow and red where the pigment has held.
function ceilingStarBorder(g,x,y0,y1,gap){
  ceilingBrush(g,[[x-6,y0],[x-6,y1]],CEILING_PALETTE.carbon,.7,.4,x|0);
  ceilingBrush(g,[[x+6,y0],[x+6,y1]],CEILING_PALETTE.carbon,.7,.4,(x|0)+3);
  for(let y=y0+gap*.5,i=0;y<y1;y+=gap,i++)
    ceilingStar(g,x,y,4.4,i%3?CEILING_PALETTE.yellow:CEILING_PALETTE.red,1,(y|0)+i);
}
// One of the twelve lunar-month circles: twenty-four segments for the hours, every other one flooded
// blue, a hub and a red centre. Painted rather than ruled, so the ring wanders as a hand's does.
function ceilingMonthCircle(g,cx,cy,r,alpha=.72){
  g.save();g.globalAlpha=alpha;
  for(let i=0;i<24;i+=2){
    const a=i/24*TAU-Math.PI/2,b=(i+1)/24*TAU-Math.PI/2,p=[[cx+Math.cos(a)*r*.34,cy+Math.sin(a)*r*.34]];
    for(let k=0;k<=5;k++){const t=lerp(a,b,k/5);p.push([cx+Math.cos(t)*r*.95,cy+Math.sin(t)*r*.95]);}
    p.push([cx+Math.cos(b)*r*.34,cy+Math.sin(b)*r*.34]);
    g.globalAlpha=alpha*.62;g.fillStyle=CEILING_PALETTE.blue;g.beginPath();p.forEach((q,j)=>j?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();
  }
  g.globalAlpha=alpha;g.strokeStyle=CEILING_PALETTE.carbon;g.lineWidth=.75;
  g.beginPath();g.arc(cx,cy,r,0,TAU);g.stroke();g.beginPath();g.arc(cx,cy,r*.3,0,TAU);g.stroke();
  for(let i=0;i<24;i++){
    const a=i/24*TAU-Math.PI/2;
    g.beginPath();g.moveTo(cx+Math.cos(a)*r*.32,cy+Math.sin(a)*r*.32);g.lineTo(cx+Math.cos(a)*r*.95,cy+Math.sin(a)*r*.95);g.stroke();
  }
  g.fillStyle=CEILING_PALETTE.red;g.beginPath();g.arc(cx,cy,r*.17,0,TAU);g.fill();g.restore();
}
// Meskhetiu, the Foreleg — the seven stars a later century calls the Plough, drawn on this ceiling as
// the bull they belong to. The seven are set on the animal itself as star signs, which is how the
// northern panel identifies it: the figure is the constellation, not a label beside one.
const CEILING_MESKHETIU=[[-1.1,-1.06],[-.68,-1.2],[-.24,-1.26],[.2,-1.16],[.58,-1.02],[.92,-1.2],[1.2,-1.08]];
function ceilingPaintBull(g,x,y,s,alpha=.5){
  g.save();g.globalAlpha=alpha;
  // the barrel of the body, low and long, on four legs that end in hooves
  ceilingPolygon(g,[[x-s*1.15,y-s*.22],[x+s*.72,y-s*.3],[x+s*.86,y-s*.02],[x+s*.78,y+s*.3],[x-s*1.02,y+s*.32],[x-s*1.24,y+s*.04]],CEILING_PALETTE.red,1,17,1.3);
  for(const dx of [-.86,-.42,.24,.62]){
    ceilingBrush(g,[[x+dx*s,y+s*.26],[x+dx*s-s*.04,y+s*.92]],CEILING_PALETTE.carbon,1.4,.85,dx*100+19);
    ceilingBrush(g,[[x+dx*s-s*.1,y+s*.92],[x+dx*s+s*.08,y+s*.92]],CEILING_PALETTE.carbon,1.9,.8,dx*100+23);
  }
  // the neck and the head, set forward and up, with the horns above and the ear behind them
  ceilingPolygon(g,[[x+s*.72,y-s*.24],[x+s*1.04,y-s*.5],[x+s*1.2,y-s*.42],[x+s*.92,y-s*.02],[x+s*.76,y+s*.06]],CEILING_PALETTE.red,1,23,1.2);
  ceilingPolygon(g,[[x+s*1.0,y-s*.52],[x+s*1.46,y-s*.62],[x+s*1.54,y-s*.4],[x+s*1.12,y-s*.3]],CEILING_PALETTE.red,1,29,1.2);
  ceilingBrush(g,ceilingArcPoints(x+s*1.14,y-s*.72,s*.3,Math.PI*.95,Math.PI*.1,10),CEILING_PALETTE.carbon,1.3,.85,31);
  ceilingBrush(g,ceilingArcPoints(x+s*1.26,y-s*.68,s*.26,Math.PI*.9,Math.PI*.05,10),CEILING_PALETTE.carbon,1.2,.72,33);
  ceilingBrush(g,[[x+s*1.02,y-s*.5],[x+s*.86,y-s*.74]],CEILING_PALETTE.carbon,1.2,.8,37);
  g.globalAlpha=alpha;g.fillStyle=CEILING_PALETTE.carbon;g.beginPath();g.arc(x+s*1.3,y-s*.48,s*.06,0,TAU);g.fill();
  // the tail, and the seven stars above the back that are the reason the animal is drawn at all
  ceilingBrush(g,[[x-s*1.18,y-s*.1],[x-s*1.52,y+s*.34],[x-s*1.4,y+s*.6]],CEILING_PALETTE.carbon,1.2,.7,41);
  for(let i=0;i<CEILING_MESKHETIU.length;i++)
    ceilingStar(g,x+CEILING_MESKHETIU[i][0]*s,y+CEILING_MESKHETIU[i][1]*s,s*.19,CEILING_PALETTE.yellow,1,i*13+5);
  g.restore();
}
// Reret, the hippopotamus, standing upright with the crocodile along her back and one hand on the
// mooring post — the northern panel's other guardian, and the figure this sheet used to cut to a bare
// post for want of room.
function ceilingPaintHippo(g,x,y,s,alpha=.46){
  g.save();g.globalAlpha=alpha;
  ceilingPolygon(g,[[x-s*.5,y+s*1.15],[x+s*.44,y+s*1.15],[x+s*.56,y+s*.2],[x+s*.4,y-s*.62],[x-s*.24,y-s*.78],[x-s*.56,y-s*.2],[x-s*.6,y+s*.6]],CEILING_PALETTE.blue,1,53,1.4);
  ceilingPolygon(g,[[x-s*.3,y-s*.76],[x+s*.36,y-s*.66],[x+s*.5,y-s*1.02],[x+s*.22,y-s*1.24],[x-s*.26,y-s*1.16]],CEILING_PALETTE.blue,1,57,1.4);
  ceilingPolygon(g,[[x+s*.2,y-s*1.2],[x+s*.62,y-s*1.28],[x+s*.66,y-s*1.06],[x+s*.4,y-s*1.02]],CEILING_PALETTE.blue,1,61,1.2);
  g.globalAlpha=alpha;g.fillStyle=CEILING_PALETTE.carbon;g.beginPath();g.arc(x+s*.3,y-s*1.1,s*.06,0,TAU);g.fill();
  for(const dx of [-.34,.2]){
    ceilingBrush(g,[[x+dx*s,y+s*1.1],[x+dx*s,y+s*1.48]],CEILING_PALETTE.carbon,1.5,.82,dx*91+41);
    ceilingBrush(g,[[x+dx*s-s*.12,y+s*1.48],[x+dx*s+s*.1,y+s*1.48]],CEILING_PALETTE.carbon,1.9,.78,dx*91+47);
  }
  // The crocodile she carries, laid down the length of her back.
  ceilingPolygon(g,[[x-s*.44,y-s*.52],[x-s*.28,y-s*.94],[x-s*.02,y-s*1.14],[x-s*.06,y-s*1.26],[x-s*.36,y-s*1.06],[x-s*.6,y-s*.6],[x-s*.66,y+s*.3],[x-s*.5,y+s*.66],[x-s*.66,y+s*.7],[x-s*.82,y+s*.28],[x-s*.74,y-s*.58]],CEILING_PALETTE.green,1,67,1.3);
  for(let i=0;i<6;i++){const t=i/5,cx=lerp(x-s*.72,x-s*.2,t),cy=lerp(y+s*.2,y-s*1.0,t);
    ceilingBrush(g,[[cx-s*.05,cy],[cx+s*.09,cy-s*.05]],CEILING_PALETTE.carbon,1.1,.6,71+i);}
  // The mooring post, the sign she holds and the thing this figure is most often reduced to.
  ceilingBrush(g,[[x+s*.86,y+s*1.15],[x+s*.86,y-s*1.05]],CEILING_PALETTE.carbon,2.1,.85,79);
  ceilingBrush(g,[[x+s*.72,y-s*1.05],[x+s*1.0,y-s*1.05]],CEILING_PALETTE.carbon,1.8,.8,83);
  ceilingBrush(g,[[x+s*.56,y+s*.14],[x+s*.84,y+s*.06]],CEILING_PALETTE.carbon,1.4,.8,89);
  g.restore();
}
function ceilingBuildWall(){
  const key=W+'x'+H+'x'+DPR;if(ceilingWall&&ceilingWallKey===key)return ceilingWall;
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
  // only a few pixels' worth of height each, not a second full-screen sheet), not a cost that grows
  // with how long a run gets.
  //
  // Every rhythm that has to survive the join between one copy of the tile and the next — the star
  // band's gap, the canon grid's unit — is forced to an exact divisor of the tile height before it is
  // drawn with, so the spacing never jumps at the seam. The plaster texture and the crack network are
  // not periodic, so they are drawn wrapped instead: once at their own position, and again shifted by a
  // tile height whenever they fall near an edge, the ordinary way to make a baked canvas repeat without
  // a visible seam. Checked by eye at 390px and 1400px, stepping world.cameraY across three tile heights.
  const gap=Math.max(20,Math.min(28,H/22)),rows=Math.max(14,Math.round(H*1.6/gap)),R=rows*gap;
  const unitTarget=Math.max(20,Math.min(32,W/36)),gridUnit=R/Math.max(3,Math.round(R/unitTarget));
  const c=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(R*DPR))),g=c.getContext('2d');g.scale(DPR,DPR);
  g.fillStyle=CEILING_PALETTE.plaster;g.fillRect(0,0,W,R);
  // The wall's texture is material, not pictorial modelling: broad lime patches, worn pits and hairline
  // cracks. The patches and the cracks are drawn a second time, shifted by ±R, whenever they land within
  // their own reach of an edge, so the texture wraps rather than ending at one edge of the tile and
  // starting over, unrelated, at the other.
  const rng=seeded(14731458),patches=Math.round(180*R/H),cracks=Math.round(20*R/H);
  for(let i=0;i<patches;i++){
    const x=rng()*W,y=rng()*R,rx=8+rng()*70,ry=2+rng()*16,rot=(rng()-.5)*.3;
    g.fillStyle=rng()>.48?'rgba(238,228,205,.08)':'rgba(102,78,49,.045)';
    const draw=yy=>{g.beginPath();g.ellipse(x,yy,rx,ry,rot,0,TAU);g.fill();};
    draw(y);if(y<ry+2)draw(y+R);if(y>R-ry-2)draw(y-R);
  }
  for(let i=0;i<Math.min(Math.round(1400*R/H),Math.floor(W*R/420));i++){
    const x=rng()*W,y=rng()*R,a=.05+rng()*.08;g.fillStyle=rng()>.55?`rgba(250,243,222,${a})`:`rgba(73,54,34,${a})`;g.fillRect(x,y,.6+rng()*.8,.6+rng()*.8);
  }
  for(let i=0;i<cracks;i++){
    let x=rng()*W,y=rng()*R;const pts=[[x,y]];for(let j=0;j<3+Math.floor(rng()*4);j++){x+=(rng()-.5)*24;y+=4+rng()*17;pts.push([x,y]);}
    ceilingBrush(g,pts,CEILING_PALETTE.loss,.45,.17,100+i);
    if(pts.at(-1)[1]>R)ceilingBrush(g,pts.map(p=>[p[0],p[1]-R]),CEILING_PALETTE.loss,.45,.17,100+i);
  }
  const inset=Math.max(10,Math.min(17,W*.03)),x0=inset+10,x1=W-inset-10,wide=W>=700;
  // The grid's own unit already divides R exactly; stopping one pixel short of R keeps the loop from
  // drawing the seam's line twice (once here, once as the next copy's y=0 line).
  ceilingSettingGrid(g,inset,0,W-inset,R-1,gridUnit);
  // The side star bands used to run only between the frieze and the foot rule; now they are furniture
  // like everything else here, so they run the tile's whole height on a gap that already divides it.
  ceilingStarBorder(g,inset+9,0,R,gap);
  ceilingStarBorder(g,W-inset-9,0,R,gap);
  // TT353 is organised as two fields divided by a band; here the band is the block border it would
  // have been painted as. It belongs to the register it divides, not to the room's architecture, so it
  // passes with the rest of the tile instead of pinning the way the foot rule does.
  const divide=R*.52,band=Math.max(7,Math.min(11,H*.014));
  ceilingBlockRule(g,x0+4,x1-4,divide-band*.5,band,.5);
  // The upper field carries the two circumpolar figures and their names; the lower one the month
  // circles and the decan columns. The middle of the tile is left to the route on purpose — a wall
  // this dense would bury the flight if the density ran edge to edge.
  const cell=wide?15:12;
  if(wide){
    const top=R*.09;
    ceilingPaintBull(g,W-inset-152,divide-70,20,.5);
    ceilingWordColumn(g,'foreleg',W-inset-58,divide-118,cell,CEILING_PALETTE.carbon,.5);
    ceilingPaintHippo(g,W-inset-262,divide-84,19,.46);
    ceilingWordColumn(g,'star',W-inset-300,divide-120,cell,CEILING_PALETTE.carbon,.44);
    for(let i=0;i<3;i++)ceilingWordColumn(g,CEILING_COLUMNS[i],inset+40+i*26,top,cell,CEILING_PALETTE.carbon,.42);
    const r=Math.min(18,H*.024),mx=inset+46,my=divide+band+38;
    for(let i=0;i<12;i++)ceilingMonthCircle(g,mx+(i%3)*r*2.4,my+Math.floor(i/3)*r*2.4,r,.42);
    for(let i=0;i<5;i++)ceilingWordColumn(g,CEILING_COLUMNS[3+i],W-inset-44-i*26,divide+band+32,cell,CEILING_PALETTE.carbon,.42);
    for(let i=0;i<3;i++)ceilingWordColumn(g,CEILING_COLUMNS[8+i],inset+40+i*26,R*.92-cell*3,cell,CEILING_PALETTE.carbon,.36);
  }else{
    const r=Math.max(9,Math.min(13,W*.027)),top=R*.07,span=Math.max(r*2.5,(R*.86-top)/5);
    for(let i=0;i<5;i++){const y=top+i*span;ceilingMonthCircle(g,inset+22,y,r,.34);ceilingMonthCircle(g,W-inset-22,y,r,.34);}
    ceilingPaintBull(g,W*.5+38,divide-46,13,.4);
    ceilingWordColumn(g,'foreleg',inset+30,divide+band+26,cell,CEILING_PALETTE.carbon,.4);
    ceilingWordColumn(g,'hour',W-inset-30,divide+band+26,cell,CEILING_PALETTE.carbon,.4);
  }
  ceilingWall=c;ceilingWallKey=key;return c;
}
// The room's only furniture that does not pass: the kheker frieze crowning it and the block rule
// closing it at the foot (see ceilingBuildWall() above for the reasoning). This used to be the 9%-alpha
// hairline register grid, an abstraction standing in for a register the wall never actually drew and
// which read, in practice, as invisible; now the wall draws real registers and passes them for real, so
// that abstraction is retired rather than left running beside it, and this is the sheet's one remaining
// screen-pinned layer — cached the same way the tile above is, so the cost is one drawImage a frame.
function ceilingDrawRegisterGrid(){
  const key=W+'x'+H+'x'+DPR;
  if(!ceilingFrameTop||ceilingFrameKey!==key){
    const inset=Math.max(10,Math.min(17,W*.03)),x0=inset+10,x1=W-inset-10,frieze=Math.max(13,Math.min(20,H*.026));
    // Each band is baked at just its own height rather than a screen-sized sheet — the frieze band
    // never needs more than the reed bundle plus its closing line, and the foot rule is a few pixels
    // thick, so this pair costs almost nothing beside the tall tile above.
    const topH=Math.ceil(inset+frieze+8),botY=H-inset-frieze*.45-8-4,botH=Math.ceil(H-botY);
    const top=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(topH*DPR))),tg=top.getContext('2d');tg.scale(DPR,DPR);
    ceilingKheker(tg,x0,x1,inset+3,frieze);
    const bot=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(botH*DPR))),bg=bot.getContext('2d');bg.scale(DPR,DPR);
    // Drawn near-opaque rather than the .5 a register-dividing rule wears inside the passing tile: this
    // one is the room's real edge, so it has to close over whatever furniture is sliding behind it, not
    // share a static sheet with it at a register's own translucency. Its y is measured from botY, the
    // top of this small canvas, not from the screen the rule actually sits near the foot of.
    ceilingBlockRule(bg,x0,x1,H-inset-frieze*.45-8-botY,Math.max(4.5,frieze*.4),.94);
    ceilingFrameTop=top;ceilingFrameBot={c:bot,y:botY};ceilingFrameKey=key;
  }
  ctx.drawImage(ceilingFrameTop,0,0,W,ceilingFrameTop.height/DPR);
  ctx.drawImage(ceilingFrameBot.c,0,ceilingFrameBot.y,W,ceilingFrameBot.c.height/DPR);
}
function ceilingDrawRoute(){
  if(inkPath.length<2)return;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='rgba(157,55,36,.18)';ctx.lineWidth=1.6*scale;ctx.beginPath();ctx.moveTo(sx(inkPath[0].x)+1,sy(inkPath[0].y)-1);
  for(let i=1;i<inkPath.length;i++)ctx.lineTo(sx(inkPath[i].x)+1,sy(inkPath[i].y)-1);ctx.stroke();
  ctx.strokeStyle='rgba(36,29,22,.48)';ctx.lineWidth=.8*scale;ctx.beginPath();ctx.moveTo(sx(inkPath[0].x),sy(inkPath[0].y));
  for(let i=1;i<inkPath.length;i++)ctx.lineTo(sx(inkPath[i].x),sy(inkPath[i].y));ctx.stroke();ctx.restore();
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
function ceilingNodeIcon(n,r,stage){
  const seed=n.seed||n.id+1;
  if(n.type==='gold'||n.type==='sling'){
    ceilingStar(ctx,0,0,r*(n.type==='sling'?.27:.22),CEILING_PALETTE.yellow,stage,seed);return;
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
  // Ordinary bodies alternate between the star sign and a moving-star disc in a small barque.
  if((Math.floor(n.row)+seed)%3===0){
    ceilingPolygon(ctx,[[-r*.28,r*.14],[r*.28,r*.14],[r*.39,r*.04],[r*.24,r*.1],[-r*.24,r*.1],[-r*.39,r*.04]],CEILING_PALETTE.yellow,stage,seed,1.1);
    if(stage>.5){ctx.save();ctx.globalAlpha=clamp((stage-.5)*2,0,1);ctx.fillStyle=(seed&1)?CEILING_PALETTE.red:CEILING_PALETTE.yellow;ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-r*.05,r*.14,0,TAU);ctx.fill();ctx.stroke();ctx.restore();}
  }else ceilingStar(ctx,0,0,r*.22,(seed&1)?CEILING_PALETTE.red:CEILING_PALETTE.yellow,stage,seed);
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
    for(let i=0;i<24;i++){const a=i/24*TAU;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.72,Math.sin(a)*r*.72);ctx.lineTo(Math.cos(a)*r*.94,Math.sin(a)*r*.94);ctx.stroke();}
    ctx.beginPath();ctx.arc(0,0,r*.7,0,TAU);ctx.stroke();
  }
  if(target||active){ctx.strokeStyle=target?'rgba(40,89,135,.72)':'rgba(196,147,46,.64)';ctx.lineWidth=1.2;ctx.setLineDash([3.5*scale,3*scale]);ctx.beginPath();ctx.arc(0,0,cap,0,TAU);ctx.stroke();ctx.setLineDash([]);}
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
  if(p.shielded){ctx.strokeStyle='rgba(40,89,135,.72)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.stroke();}
  if(p.reflectorArmed){ctx.strokeStyle='rgba(157,55,36,.72)';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(0,0,21,0,TAU);ctx.stroke();ctx.setLineDash([]);}
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
    if(q.kind==='blot'){
      // A blot is pigment pooling where the brush lifted off the wall: one flat, slightly flattened
      // disc, settling rather than flying.
      ctx.fillStyle=`rgba(157,55,36,${(1-t)*(q.alpha||.42)})`;ctx.beginPath();ctx.ellipse(x,y,(q.size||6)*scale,(q.size||6)*scale*.68,0,0,TAU);ctx.fill();continue;
    }
    if(q.kind==='splat'){
      // A splat is a graze: pigment thrown off the brush, not pooled — a scatter of short flecks
      // flung clear of the point rather than one round mark. `dir`, when the event supplies it, aims
      // the scatter (the side the barque left by); with none the flecks fly full circle.
      const alpha=(1-t)*(q.alpha||.42),sd=q.seed||1,base=q.dir?(q.dir<0?Math.PI:0):0,cone=q.dir?1.9:TAU;
      ctx.strokeStyle=`rgba(157,55,36,${alpha})`;ctx.lineCap='round';
      for(let i=0;i<6;i++){
        const a=base+(ceilingHash(sd,i)-.5)*cone,len=((q.size||6)*.5+ceilingHash(i,sd)*(q.size||6)*.6)*scale;
        ctx.lineWidth=Math.max(.8,(q.size||6)*.11*scale);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();
      }
      continue;
    }
    const r=(q.start+(reducedMotion?0:t*q.distance))*scale;ctx.strokeStyle=`rgba(${q.perfect?'40,89,135':'157,55,36'},${(1-t)*(q.alpha||.5)})`;ctx.lineWidth=.9;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
  }
  for(let i=floaters.length-1;i>=0;i--){
    const f=floaters[i];if(world.state!=='paused')f.age+=dt;if(f.age>1.15){floaters.splice(i,1);continue;}const a=Math.min(1,f.age*8)*clamp((1.15-f.age)*3,0,1);
    ctx.save();ctx.globalAlpha=a;ctx.fillStyle=CEILING_PALETTE.red;ctx.font=plateFace(Math.max(10,12*scale));ctx.textAlign='center';ctx.fillText(f.text,sx(f.x),sy(f.y)-(reducedMotion?0:f.age*18*scale));ctx.restore();
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
  const index=clamp(Math.floor(world.progress/8),0,3),bottom=Math.max(22,safeAreaBottom()+13),y=H-bottom;
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
  if(chapterReveal.age<2.35&&world.state==='playing'){
    if(world.state!=='paused')chapterReveal.age+=dt;
    const age=chapterReveal.age,a=Math.sin(clamp(age/2.35,0,1)*Math.PI),cy=H*.5;
    ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.fillStyle=CEILING_PALETTE.lime;ctx.fillRect(W*.18,cy-46,W*.64,94);
    ceilingBlockRule(ctx,W*.18,W*.82,cy-46,5,.62*a);ceilingBlockRule(ctx,W*.18,W*.82,cy+40,5,.62*a);
    // wnwt, the hour: the word is painted on in the wall's four passes, and the Latin under it is
    // written in the same order by the plate's own hand, which is what `mode:'wall'` now buys.
    ceilingWordRow(ctx,'hour',W*.5,cy-9,40,CEILING_PALETTE.red,1,clamp(age/.9,0,1));
    ctx.fillStyle=CEILING_PALETTE.carbon;ctx.font=plateFace(11,'sc');
    if(!penLettering(label,W*.5,cy+30,11,'slab',age-.5,'center'))ctx.fillText(label,W*.5,cy+30);
    ctx.restore();
  }
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
  ceilingDrawRegisterGrid();
  ctx.save();if(!reducedMotion&&world.shake>.08)ctx.translate(Math.sin(world.time*109)*world.shake*scale,Math.cos(world.time*137)*world.shake*.65*scale);
  ceilingDrawRoute();ceilingDrawDecanCharts();for(const n of world.nodes)ceilingDrawNode(n,aim);for(const h of world.hazards)ceilingDrawHazard(h);
  ceilingDrawAim(aim);for(const g of world.nebulas)ceilingDrawNun(g);ceilingDrawEffects(dt);drawInscriptions(dt);ceilingDrawPlayer();ceilingDrawDark(dt);ctx.restore();
  ceilingDrawRunningHead(dt);
  if(screenFlash>0){ctx.fillStyle=`rgba(157,55,36,${screenFlash*.055})`;ctx.fillRect(0,0,W,H);if(world.state!=='paused')screenFlash=Math.max(0,screenFlash-dt*3);}
}
