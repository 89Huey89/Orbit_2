'use strict';
/* Orbit · src/inscriptions.js
   Inscriptions: every description the run has to give, written into the chart instead of over it. */
// ---------- Inscriptions: what the plate has to say, said on the plate ----------
// Nothing the run announces is printed on a bar laid across the view. Every description — a slingshot
// taken, a transfer landed square, a chart named as its stars are traced, an observation made, and the
// standing instructions the opening rows give — is written onto the sheet beside whatever it is about, in
// the plate's own hand, on a hairline leader that points back at it. It is set once, in world units, so
// the chart carries the lettering exactly as it carries the orbit it belongs to: the sheet takes it away
// under the traveller as he climbs, and it leaves the plate only where it is carried under the inner rule.
// Nothing written here ever fades: what the pen has set down is ink, and stays until the sheet has
// carried it off.
definePlate('inscription',{
  night:{caps:'222,203,158',note:'196,204,190',leader:'188,180,152',rule:'202,180,137'},
  paper:{caps:'150,100,32',note:'58,42,28',leader:'96,74,52',rule:'96,74,52'}
});
// At most this many are on the sheet at once. Nothing is written twice over, so the cap is only a bound:
// when it is reached, the note lowest on the sheet — the next the scroll would have carried off — gives
// way, and never a standing instruction that is still being asked for.
const INSCRIPTION_CAP=24;
let inscriptions=[],inscriptionSeq=0;
function clearInscriptions(){inscriptions=[];}
// Two hands: announcements in the small caps the plate names things in, instructions in the same italic
// the marginal notes are written in.
const inscriptionFont=(tone,size)=>tone==='note'
  ?`italic ${size}px 'IM Fell English',Georgia,serif`
  :`${size}px 'IM Fell English SC','IM Fell English',Georgia,serif`;
const inscriptionSize=tone=>tone==='note'?Math.max(10.5,12*scale):Math.max(10,11.5*scale);
const inscriptionInner=()=>frameBand()*.92+8;
const inscriptionWidth=()=>Math.max(96,Math.min(W-inscriptionInner()*2-16,244));
// How much room an inscription's box has on the sheet: the distance from its nearest edge to the frame's
// inner rule, to the DOM score band over the middle of the plate, and to the footer band. It goes negative
// where the lettering has run over one of them: a note is never set there, and a standing instruction the
// sheet has carried that far is set again.
function inscriptionRoom(box){
  const inner=inscriptionInner();
  const middle=box.left<W*.5+HUD_TEXT_HALF&&box.right>W*.5-HUD_TEXT_HALF;
  return Math.min(box.left-inner,W-inner-box.right,box.top-(middle?hudBand():inner),H-footerBand()-box.bottom);
}
// The lettering is broken to the width of the play channel, in the face it will be written in.
function wrapInscription(text,tone,size){
  const max=inscriptionWidth(),lines=[];
  ctx.save();ctx.font=inscriptionFont(tone,size);
  let line='';
  for(const word of String(text).split(' ')){
    const next=line?line+' '+word:word;
    if(line&&ctx.measureText(next).width>max){lines.push(line);line=word;}else line=next;
  }
  if(line)lines.push(line);
  let width=0;for(const one of lines)width=Math.max(width,ctx.measureText(one).width);
  ctx.restore();
  return {lines,width:Math.min(width,max)};
}
// What an inscription is about: a planet or a star it follows, or the plain point on the chart where the
// thing it describes happened.
function inscriptionAnchor(g){
  const n=g.node;
  if(n&&Number.isFinite(n.x))return {x:n.x,y:n.y,r:n.cap||n.r||6};
  return {x:g.x,y:g.y,r:g.r};
}
function inscriptionBox(g){
  const a=inscriptionAnchor(g),ax=sx(a.x),ay=sy(a.y),w=g.w*scale,h=g.h*scale;
  const cx=ax+g.dx*scale,cy=ay+g.dy*scale;
  return {left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2,cx,cy,ax,ay,rad:a.r*scale};
}
// A note beside a wandering planet sways with it. The sway is the whole envelope the lettering can be
// carried across, and every judgement of the note's place allows for it, so two notes set clear of each
// other stay clear however their subjects drift.
const inscriptionSway=g=>g.node&&g.node.amp?g.node.amp*scale:0;
// How far, on the screen, a note's box now stands from where it rests: the planet's drift is judged about
// the centre of its envelope, not about wherever the planet happens to be at the moment of writing.
const inscriptionRest=g=>g.node&&g.node.amp?(g.node.baseX-g.node.x)*scale:0;
const inscriptionSpan=(a0,a1,b0,b1)=>Math.max(0,Math.min(a1,b1)-Math.max(a0,b0));
const inscriptionOverDisc=(box,cx,cy,r)=>inscriptionSpan(box.left,box.right,cx-r,cx+r)*inscriptionSpan(box.top,box.bottom,cy-r,cy+r)/100;
// How much of a box would lie over another inscription already on the sheet, with both notes' sway and a
// small gutter allowed for, so lettering is never set touching lettering.
function inscriptionClash(box,sway,q){
  const o=inscriptionBox(q),r=inscriptionRest(q),s=sway+inscriptionSway(q)+3*scale,v=2*scale;
  return inscriptionSpan(box.left-s,box.right+s,o.left+r,o.right+r)*inscriptionSpan(box.top-v,box.bottom+v,o.top,o.bottom)/100;
}
// Wherever a place is chosen, the lettering is slid back onto the sheet before it is judged, so a note
// beside a planet at the very edge of the plate is set inside the frame rather than into its margin.
function ontoSheet(cx,cy,w,h){
  const inner=inscriptionInner();
  const x=clamp(cx,inner+w/2,Math.max(inner+w/2,W-inner-w/2));
  const middle=x-w/2<W*.5+HUD_TEXT_HALF&&x+w/2>W*.5-HUD_TEXT_HALF;
  const top=(middle?hudBand():inner)+h/2,bottom=H-footerBand()-h/2;
  return {x,y:clamp(cy,top,Math.max(top,bottom))};
}
// Where the note is set: beside its subject, in whichever of eight places round it is clearest of the
// chart, of the traveller himself, and of whatever is already written. Overlapping lettering already on
// the sheet is the one thing a note is not allowed: if none of the eight places beside the subject is
// clear, the note is set further out on a longer leader, and failing that it is stacked directly above
// or below whichever note stands in its way. The choice is kept in world units, so it is made once and
// the sheet carries it from there.
const INSCRIPTION_PLACES=[[1,0],[-1,0],[1,.8],[-1,.8],[1,-.8],[-1,-.8],[0,1],[0,-1]];
const INSCRIPTION_REACHES=3;
function placeInscription(g){
  // The geometry is worked at the subject's rest, so a note beside a wandering planet is set clear for the
  // whole of its drift; the offset kept is from the subject itself, wherever it is carried.
  const a=inscriptionAnchor(g),ax=sx(a.x)+inscriptionRest(g),ay=sy(a.y),rad=a.r*scale;
  const w=g.w*scale,h=g.h*scale,p=world.player,sway=inscriptionSway(g);
  const others=inscriptions.filter(q=>q!==g);
  let best=null;
  // The cost of setting the note with its centre at a point: it is first slid onto the sheet, then judged
  // against the margin, the chart, the traveller and the other notes.
  const judge=(x,y,base)=>{
    const set=ontoSheet(x,y,w+sway*2,h),cx=set.x,cy=set.y;
    const box={left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2};
    // Running off the sheet is the strongest objection after other lettering: an inscription is never set
    // into the margin.
    const room=inscriptionRoom({left:box.left-sway,right:box.right+sway,top:box.top,bottom:box.bottom});
    let cost=base+(room<12?(12-room)*3:0),clash=0;
    for(const n of world.nodes)cost+=inscriptionOverDisc(box,sx(n.x),sy(n.y),(n.cap||n.r)*scale+4);
    for(const z of world.hazards)cost+=inscriptionOverDisc(box,sx(z.x),sy(z.y),z.r*scale+8)*1.5;
    // The constructions still being drawn up at either end of the last flight are the busiest part of the
    // sheet, so the lettering keeps off them as well.
    for(let k=Math.max(0,surveys.length-3);k<surveys.length;k++)cost+=inscriptionOverDisc(box,sx(surveys[k].x),sy(surveys[k].y),30*scale);
    cost+=inscriptionOverDisc(box,sx(p.x),sy(p.y),16*scale)*3;
    for(const q of others)clash+=inscriptionClash(box,sway,q);
    cost+=clash*40;
    if(!best||cost<best.cost)best={cost,clash,cx,cy,box};
    return cost;
  };
  // Eight places round the subject, then the same eight further out, nearest first.
  const stepX=w*.6+10*scale,stepY=h+10*scale;
  outer:for(let reach=0;reach<INSCRIPTION_REACHES;reach++){
    for(let i=0;i<INSCRIPTION_PLACES.length;i++){
      const [px,py]=INSCRIPTION_PLACES[i],base=i*.6+reach*2.4;
      const cost=judge(ax+px*(rad+w/2+13*scale+reach*stepX),ay+py*(rad+h/2+12*scale+reach*stepY),base);
      // A place with nothing at all against it but its rank cannot be bettered by any later one.
      if(cost<=base+.001)break outer;
    }
  }
  // Whatever stands in the way of the best place so far, the note is tried directly above and below it.
  if(best.clash>0){
    const chosen=best;
    for(const q of others){
      const o=inscriptionBox(q);
      if(inscriptionClash(chosen.box,sway,q)<=0)continue;
      const gap=h/2+4*scale;
      judge(chosen.cx,o.top-gap,INSCRIPTION_REACHES*2.4);
      judge(chosen.cx,o.bottom+gap,INSCRIPTION_REACHES*2.4);
    }
  }
  // As a last resort the whole sheet is combed for a clear place, the nearest to the subject preferred:
  // lettering is set over lettering only when there is no clear ground left on the plate at all.
  if(best.clash>0){
    const inner=inscriptionInner(),dx=Math.max(8,w*.5),dy=Math.max(6,h*.5);
    for(let y=inner+h/2;y<=H-footerBand()-h/2;y+=dy)for(let x=inner+w/2;x<=W-inner-w/2;x+=dx){
      judge(x,y,INSCRIPTION_REACHES*2.4+Math.hypot(x-ax,y-ay)/(40*scale));
    }
  }
  g.dx=(best.cx-ax)/scale;g.dy=(best.cy-ay)/scale;g.placedX=a.x;g.placedY=a.y;
}
// Write one inscription onto the chart. `node` follows a planet or a star wherever it drifts; `x`/`y` pin
// it to the point on the sheet where the thing happened; with neither, it is set beside the traveller.
function inscribe(text,options={}){
  if(!world||!text)return null;
  const tone=options.tone||'caps',size=inscriptionSize(tone);
  const {lines,width}=wrapInscription(text,tone,size);
  const step=size*1.34,p=world.player;
  const g={
    key:options.key||'',text:String(text),tone,lines,
    size:size/scale,w:(width+3)/scale,h:lines.length*step/scale,
    node:options.node||(options.x===undefined?p.node:null)||null,
    x:options.x===undefined?p.x:options.x,y:options.y===undefined?p.y:options.y,r:options.r||6,
    age:0,write:reducedMotion?0:.22+String(text).length*.017,held:false,touched:false,
    seed:(++inscriptionSeq*2654435761)>>>0,dx:0,dy:0,placedX:0,placedY:0
  };
  placeInscription(g);
  // A note that held this key before is not struck out: it is ink already, and stays where it was written
  // until the sheet carries it off. It simply stops being kept on the plate.
  if(g.key)for(const q of inscriptions)if(q.key===g.key)q.held=false;
  inscriptions.push(g);
  while(inscriptions.length>INSCRIPTION_CAP){
    let drop=-1,lowest=-Infinity;
    for(let i=0;i<inscriptions.length;i++){
      const q=inscriptions[i];if(q.held&&q.touched)continue;
      const y=inscriptionBox(q).bottom-q.age*1e-3;
      if(y>lowest){lowest=y;drop=i;}
    }
    inscriptions.splice(Math.max(0,drop),1);
  }
  // The same words go to a live region of their own, so a reader hears exactly what the pen has written.
  const note=$('inscribed');if(note&&!options.silent)note.textContent=g.text;
  return g;
}
// A standing instruction: written once and kept on the sheet while its condition holds. The moment it
// stops being asked for it is left as it stands — ink like any other note, carried off with the sheet —
// and if the same instruction is asked for again while it is still on the plate, it is taken up again
// rather than written twice. While held it is re-set when its subject changes, when the subject drifts
// away from where the lettering was placed, or when the sheet has carried it off the plate.
function inscribeHeld(key,text,options={}){
  const live=inscriptions.find(q=>q.key===key&&q.text===text);
  if(live){
    for(const q of inscriptions)if(q!==live&&q.key===key)q.held=false;
    live.held=true;live.touched=true;
    // An instruction is re-set when its subject changes, when the subject has drifted away from where the
    // lettering was placed, and whenever the sheet has carried the lettering itself off the plate: what is
    // still being asked for is kept legible rather than left to run off the edge.
    if(options.node&&options.node!==live.node){live.node=options.node;placeInscription(live);}
    else{
      const a=inscriptionAnchor(live);
      if(Math.hypot(a.x-live.placedX,a.y-live.placedY)>46||inscriptionRoom(inscriptionBox(live))<0)placeInscription(live);
    }
    return live;
  }
  const g=inscribe(text,Object.assign({},options,{key,tone:options.tone||'note'}));
  if(g){g.held=true;g.touched=true;}
  return g;
}
// An inscription is drawn at full strength from its first stroke to its last: it never fades, in or out.
// It is cut off only by the plate's inner rule, the way the orbits are, as the sheet carries it under.
function drawInscription(g){
  const box=inscriptionBox(g);
  const t=reducedMotion||g.write<=0?1:clamp(g.age/g.write,0,1);
  const caps=g.tone!=='note',size=g.size*scale,step=size*1.34;
  ctx.save();ctx.textBaseline='alphabetic';
  // The leader is drawn first, from the subject's rim out to the lettering, with the nib riding its end and
  // a small tick left where it started — the way a plate points a note at the thing it describes.
  const dx=box.cx-box.ax,dy=box.cy-box.ay,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
  const half=Math.min(Math.abs(ux)>.001?(box.right-box.left)/2/Math.abs(ux):Infinity,Math.abs(uy)>.001?(box.bottom-box.top)/2/Math.abs(uy):Infinity);
  const from=box.rad+3*scale,to=d-half-3*scale,lead=revealSpan(t,0,.22);
  if(to>from+1&&lead>0){
    const ex=box.ax+ux*(from+(to-from)*lead),ey=box.ay+uy*(from+(to-from)*lead),angle=Math.atan2(uy,ux);
    line(box.ax+ux*from,box.ay+uy*from,ex,ey,`rgba(${ink.inscription.leader},.4)`,.5);
    if(lead<1){penBead(ex,ey,angle,1.1*scale,.7);penNib(ex,ey,angle,.7);}
    else{
      const tick=2.4*scale;
      line(box.ax+ux*from+uy*tick,box.ay+uy*from-ux*tick,box.ax+ux*from-uy*tick,box.ay+uy*from+ux*tick,`rgba(${ink.inscription.leader},.5)`,.5);
    }
  }
  ctx.textAlign='center';ctx.font=inscriptionFont(g.tone,size);
  ctx.fillStyle=`rgba(${caps?ink.inscription.caps:ink.inscription.note},${caps?.94:.82})`;
  for(let i=0;i<g.lines.length;i++){
    const start=.22+i/g.lines.length*.78,end=.22+(i+1)/g.lines.length*.78;
    writeText(ctx,g.lines[i],box.cx,box.top+size+i*step,revealSpan(t,start,end),{size,plain:true});
  }
  // An announcement is ruled underneath, as a plate rules a legend; an instruction is left unruled.
  const ruled=caps?revealSpan(t,.88,1):0;
  if(ruled>0){
    const reach=Math.min((box.right-box.left)*.42,44*scale)*ruled,y=box.bottom+3*scale;
    line(box.cx-reach,y,box.cx+reach,y,`rgba(${ink.inscription.rule},.34)`,.5);
  }
  ctx.restore();
}
// The sheet is written on while the run is on and nowhere else: the frontispiece and the colophon are
// leaves of their own, and a paused run freezes the pen exactly where it stopped. The lettering is drawn
// through the plate's inner rule, so a note leaves the page only by being carried under it, and a note the
// sheet has carried wholly off the plate is struck from the list — unless it is a standing instruction
// still being asked for, which is set again on the sheet rather than lost.
function drawInscriptions(dt){
  if(!world||!inscriptions.length)return;
  const running=world.state!=='paused',onPage=world.state!=='ready'&&world.state!=='dead';
  const rule=frameBand()*.92;
  ctx.save();ctx.beginPath();ctx.rect(rule,rule,Math.max(0,W-rule*2),Math.max(0,H-rule*2));ctx.clip();
  for(let i=inscriptions.length-1;i>=0;i--){
    const g=inscriptions[i];
    if(running)g.age+=dt;
    const box=inscriptionBox(g);
    if(box.top>H-rule&&!(g.held&&g.touched)){inscriptions.splice(i,1);continue;}
    if(onPage)drawInscription(g);
    if(running)g.touched=false;
  }
  ctx.restore();
}
