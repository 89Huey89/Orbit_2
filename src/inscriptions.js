'use strict';
/* Orbit · src/inscriptions.js
   Inscriptions: every description the run has to give, written into the chart instead of over it. */
// ---------- Inscriptions: what the plate has to say, said on the plate ----------
// Nothing the run announces is printed on a bar laid across the view. Every description — a slingshot
// taken, a transfer landed square, a chart named as its stars are traced, an observation made, and the
// standing instructions the opening rows give — is written onto the sheet beside whatever it is about, in
// the plate's own hand, on a hairline leader that points back at it. It is set once, in world units, so
// the chart carries the lettering exactly as it carries the orbit it belongs to: the sheet takes it away
// under the traveller as he climbs, and it fades where it runs out at the edge of the plate.
definePlate('inscription',{
  night:{caps:'222,203,158',note:'196,204,190',leader:'188,180,152',rule:'202,180,137'},
  paper:{caps:'150,100,32',note:'58,42,28',leader:'96,74,52',rule:'96,74,52'}
});
// At most this many are on the sheet at once; the oldest that is not a standing instruction gives way.
const INSCRIPTION_CAP=8;
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
// where the lettering has run over one of them, which is where an inscription fades out rather than
// printing into the margin.
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
const inscriptionSpan=(a0,a1,b0,b1)=>Math.max(0,Math.min(a1,b1)-Math.max(a0,b0));
const inscriptionOverDisc=(box,cx,cy,r)=>inscriptionSpan(box.left,box.right,cx-r,cx+r)*inscriptionSpan(box.top,box.bottom,cy-r,cy+r)/100;
const inscriptionOverBox=(box,other)=>inscriptionSpan(box.left,box.right,other.left,other.right)*inscriptionSpan(box.top,box.bottom,other.top,other.bottom)/100;
// Wherever a place is chosen, the lettering is slid back onto the sheet before it is judged, so a note
// beside a planet at the very edge of the plate is set inside the frame rather than into its margin.
function ontoSheet(cx,cy,w,h){
  const inner=inscriptionInner();
  const x=clamp(cx,inner+w/2,Math.max(inner+w/2,W-inner-w/2));
  const middle=x-w/2<W*.5+HUD_TEXT_HALF&&x+w/2>W*.5-HUD_TEXT_HALF;
  const top=(middle?hudBand():inner)+h/2,bottom=H-footerBand()-h/2;
  return {x,y:clamp(cy,top,Math.max(top,bottom))};
}
// Where the note is set: beside its subject, in whichever of eight places is clearest of the chart, of the
// traveller himself, and of whatever is already written. The choice is kept in world units, so it is made
// once and the sheet carries it from there.
const INSCRIPTION_PLACES=[[1,0],[-1,0],[1,.8],[-1,.8],[1,-.8],[-1,-.8],[0,1],[0,-1]];
function placeInscription(g){
  const a=inscriptionAnchor(g),ax=sx(a.x),ay=sy(a.y),rad=a.r*scale;
  const w=g.w*scale,h=g.h*scale,p=world.player;
  let bestX=0,bestY=0,bestCost=Infinity;
  for(let i=0;i<INSCRIPTION_PLACES.length;i++){
    const [px,py]=INSCRIPTION_PLACES[i];
    const set=ontoSheet(ax+px*(rad+w/2+13*scale),ay+py*(rad+h/2+12*scale),w,h),cx=set.x,cy=set.y;
    const box={left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2};
    // Running off the sheet is the strongest objection: an inscription is never set into the margin.
    const room=inscriptionRoom(box);
    let cost=i*.6+(room<12?(12-room)*3:0);
    for(const n of world.nodes)cost+=inscriptionOverDisc(box,sx(n.x),sy(n.y),(n.cap||n.r)*scale+4);
    for(const z of world.hazards)cost+=inscriptionOverDisc(box,sx(z.x),sy(z.y),z.r*scale+8)*1.5;
    // The constructions still being drawn up at either end of the last flight are the busiest part of the
    // sheet, so the lettering keeps off them as well.
    for(let k=Math.max(0,surveys.length-3);k<surveys.length;k++)cost+=inscriptionOverDisc(box,sx(surveys[k].x),sy(surveys[k].y),30*scale);
    cost+=inscriptionOverDisc(box,sx(p.x),sy(p.y),16*scale)*3;
    for(const q of inscriptions)if(q!==g)cost+=inscriptionOverBox(box,inscriptionBox(q))*2;
    if(cost<bestCost){bestCost=cost;bestX=(cx-ax)/scale;bestY=(cy-ay)/scale;}
    if(bestCost<=i*.6+.001)break;
  }
  g.dx=bestX;g.dy=bestY;g.placedX=a.x;g.placedY=a.y;
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
    age:0,write:reducedMotion?0:.22+String(text).length*.017,life:0,held:false,touched:false,
    seed:(++inscriptionSeq*2654435761)>>>0,dx:0,dy:0,placedX:0,placedY:0
  };
  g.life=(options.life||1.6)+g.write;
  placeInscription(g);
  if(g.key)inscriptions=inscriptions.filter(q=>q.key!==g.key);
  inscriptions.push(g);
  while(inscriptions.length>INSCRIPTION_CAP){
    let drop=0;
    for(let i=0;i<inscriptions.length;i++)if(!inscriptions[i].held&&(inscriptions[drop].held||inscriptions[i].age>inscriptions[drop].age))drop=i;
    inscriptions.splice(drop,1);
  }
  // The same words go to a live region of their own, so a reader hears exactly what the pen has written.
  const note=$('inscribed');if(note&&!options.silent)note.textContent=g.text;
  return g;
}
// A standing instruction: written once, kept on the sheet while its condition holds, and left to fade the
// moment it stops being asked for. It is re-set when its subject changes or drifts away from where the
// lettering was placed.
function inscribeHeld(key,text,options={}){
  const live=inscriptions.find(q=>q.key===key&&q.held&&q.text===text);
  if(live){
    live.touched=true;
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
  const g=inscribe(text,Object.assign({},options,{key,tone:options.tone||'note',life:options.life||1}));
  if(g){g.held=true;g.touched=true;}
  return g;
}
function drawInscription(g){
  const box=inscriptionBox(g),room=inscriptionRoom(box);
  const edge=clamp(room/24,0,1);
  const alpha=clamp(g.age/.14,0,1)*clamp((g.life-g.age)/.8,0,1)*edge;
  if(alpha<=.01)return;
  const t=reducedMotion||g.write<=0?1:clamp(g.age/g.write,0,1);
  const caps=g.tone!=='note',size=g.size*scale,step=size*1.34;
  ctx.save();ctx.globalAlpha=alpha;ctx.textBaseline='alphabetic';
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
// leaves of their own, and a paused run freezes the pen exactly where it stopped.
function drawInscriptions(dt){
  if(!world||!inscriptions.length)return;
  const running=world.state!=='paused',onPage=world.state!=='ready'&&world.state!=='dead';
  for(let i=inscriptions.length-1;i>=0;i--){
    const g=inscriptions[i];
    if(running){
      if(g.held&&g.touched){g.age=Math.min(g.age+dt,g.write+.02);g.touched=false;}
      else g.age+=dt;
    }
    if(g.age>=g.life){inscriptions.splice(i,1);continue;}
    if(onPage)drawInscription(g);
  }
}
