'use strict';
/* Orbit · src/effects.js
   Rising darkness, the player comet, trail, ripples, and particle effects. */
// ---------- Rising darkness, player comet, and effects: spilled ink on paper, starlight ink at night ----------
definePlate('dark',{
  night:{
    chapterShadow:'#080f18',chapterLabel:'#baa57b',chapterRule:'202,180,137',chapterDiamond:'216,195,154',
    playerHeadWash:'222,199,151',playerFilamentA:'195,178,138',playerFilamentB:'236,218,178',
    playerHalo:'#0c1519',playerKeyline:'#0c1519',playerMid:'#dcc394',playerHighlight:'#fff3ce',playerNib:'246,227,181',playerShield:'150,205,224',playerReflector:'196,172,224',
    trailWash:'204,181,133',trailStroke:'242,225,186',trailEdge:'165,154,123',trailBleed:'214,193,151',
    // The route already flown, long dry on the sheet.
    pathInk:'128,134,116',
    // A fresh stroke is bright ink; as it ages it sinks back to a dimmer, drier tone.
    trailWet:[250,240,208],trailDry:[143,148,128],blotWet:[236,224,186],blotDry:[152,148,122],
    pigment:'166,125,101',pigmentRelief:'211,192,143',shorelineRelief:'221,202,152',
    washTop:'4,10,17',washMid:'6,13,22',washSolid:'#040910',bodyTop:'5,11,19',bodyMid:'4,10,18',
    voidLayers:['rgba(22,30,36,.23)','rgba(13,22,31,.44)','rgba(7,16,25,.57)','rgba(4,11,20,.63)','rgba(3,8,15,.72)'],
    landFillWash:'rgba(36,45,50,.075)',landFillPool:'rgba(1,5,12,.3)',fleckDark:'0,3,9',
    burstGold:'230,209,159',burstRed:'222,145,106',burstBlue:'165,215,210',burstViolet:'210,190,224',ringSimple:'231,216,171',
    transferArc:'226,207,165',transferArcSoft:'186,169,131',transferTick:'239,219,173',transferNib:'232,212,171',
    floaterText:'238,224,185',screenFlash:'238,212,157'
  },
  paper:{
    chapterShadow:'transparent',chapterLabel:'#5c4630',chapterRule:'58,42,28',chapterDiamond:'34,24,16',
    playerHeadWash:'96,74,52',playerFilamentA:'96,74,52',playerFilamentB:'58,42,28',
    playerHalo:'#e7dabd',playerKeyline:'#221810',playerMid:'#3a2a1c',playerHighlight:'#604a34',playerNib:'58,42,28',playerShield:'52,84,120',playerReflector:'92,58,120',
    trailWash:'96,74,52',trailStroke:'34,24,16',trailEdge:'120,92,60',trailBleed:'80,55,34',
    pathInk:'104,74,42',
    // Wet iron-gall is glossy blue-black; it dries to a matte sepia within a second.
    trailWet:[24,26,46],trailDry:[122,88,52],blotWet:[20,22,42],blotDry:[130,98,58],
    // The calibrated shoreline is rubrication red-brown on paper, turning ochre/gold during a reprieve.
    pigment:'166,58,40',pigmentRelief:'176,118,38',shorelineRelief:'176,118,38',
    // Spilled indigo-black ink, #14121f family, pooling and feathering into the paper fibres.
    washTop:'20,18,31',washMid:'24,20,34',washSolid:'#14121f',bodyTop:'20,18,31',bodyMid:'20,18,31',
    voidLayers:['rgba(28,24,38,.34)','rgba(24,20,34,.58)','rgba(20,18,31,.78)','rgba(16,14,26,.9)','rgba(14,12,22,.97)'],
    landFillWash:'rgba(20,18,31,.09)',landFillPool:'rgba(14,12,22,.34)',fleckDark:'14,12,22',
    burstGold:'150,100,32',burstRed:'166,58,40',burstBlue:'52,84,120',burstViolet:'92,58,120',ringSimple:'58,42,28',
    transferArc:'58,42,28',transferArcSoft:'96,74,52',transferTick:'34,24,16',transferNib:'58,42,28',
    floaterText:'34,24,16',screenFlash:'255,248,222'
  }
});
// Blends two registered [r,g,b] plate colours into an `r,g,b` string for a template literal.
const mixRgb=(a,b,t)=>Math.round(lerp(a[0],b[0],t))+','+Math.round(lerp(a[1],b[1],t))+','+Math.round(lerp(a[2],b[2],t));
// The catalogue's trail inks, registered per plate like every other colour: a wet and a dry tone for
// the stroke, the wash beneath it, the dry-brush edge, the bleed of a fast segment, and the bead of ink
// at a release. The plate's own iron gall is read from the `dark` section above and needs no entry.
definePlate('inks',{
  night:{
    sanguine:{wet:[214,116,88],dry:[150,86,68],wash:'196,110,84',edge:'170,96,74',bleed:'206,120,92',blotWet:[214,116,88],blotDry:[152,90,70],path:'150,86,68'},
    silverpoint:{wet:[226,230,236],dry:[132,138,146],wash:'170,176,184',edge:'150,158,168',bleed:'196,202,210',blotWet:[214,220,228],blotDry:[134,140,148],shimmer:'244,248,255',path:'126,132,140'},
    goldleaf:{wet:[252,222,150],dry:[178,140,70],wash:'214,178,104',edge:'150,116,54',bleed:'232,198,126',blotWet:[250,220,148],blotDry:[176,138,68],keyline:'26,20,8',path:'164,128,64'},
    // A reckless line's ink: soot-black bistre, warm rather than the iron gall's cool near-black.
    bistre:{wet:[232,208,168],dry:[138,112,82],wash:'210,182,140',edge:'176,148,108',bleed:'218,192,150',blotWet:[230,206,166],blotDry:[140,114,84],path:'150,122,88'},
    // Orpiment: the old illuminators' bright, faintly dangerous yellow-orange mineral.
    orpiment:{wet:[255,196,96],dry:[190,124,54],wash:'224,158,72',edge:'196,128,58',bleed:'236,172,84',blotWet:[252,194,94],blotDry:[188,122,52],path:'176,116,50'}
  },
  paper:{
    sanguine:{wet:[168,74,56],dry:[184,108,84],wash:'176,92,68',edge:'150,80,60',bleed:'176,96,72',blotWet:[166,72,54],blotDry:[186,112,88],path:'168,92,70'},
    silverpoint:{wet:[96,100,108],dry:[142,144,148],wash:'126,130,136',edge:'112,116,122',bleed:'134,138,144',blotWet:[94,98,106],blotDry:[144,146,150],shimmer:'250,250,252',path:'118,122,128'},
    goldleaf:{wet:[146,104,30],dry:[184,142,64],wash:'168,124,44',edge:'132,96,32',bleed:'186,146,70',blotWet:[144,102,28],blotDry:[186,144,66],keyline:'40,28,10',path:'160,120,48'},
    bistre:{wet:[58,44,30],dry:[146,112,72],wash:'96,74,50',edge:'80,60,40',bleed:'104,80,54',blotWet:[56,42,28],blotDry:[148,114,74],path:'112,86,58'},
    orpiment:{wet:[150,88,20],dry:[196,140,58],wash:'176,112,36',edge:'140,88,30',bleed:'198,142,60',blotWet:[148,86,18],blotDry:[198,142,60],path:'168,106,40'}
  }
});
// The ink in the pen: the plate's own by default, one of the catalogue's once it has been chosen.
function trailInk(){
  const chosen=ink.inks[cosmetic('trail')];
  if(chosen)return chosen;
  return {wet:ink.dark.trailWet,dry:ink.dark.trailDry,wash:ink.dark.trailWash,edge:ink.dark.trailEdge,
    bleed:ink.dark.trailBleed,blotWet:ink.dark.blotWet,blotDry:ink.dark.blotDry};
}
// ---------- The route already flown ----------
// The wet trail is a hundred-odd samples that fade in a second; the dried path is the whole route the
// run has taken, kept in world coordinates and printed under the wet ink every frame. It is bounded
// twice over: everything that has passed below the sheet is dropped as the camera climbs — it only
// ever climbs — and a hard cap holds the rest whatever happens. Reduced motion keeps it, since a line
// already on the page is not motion; a paused run adds nothing to it because nothing is sampled.
const INK_PATH_CAP=3000;
function recordTrail(){
  if(world.state!=='playing'&&world.state!=='ready')return;
  const p=world.player;
  trail.push({x:p.x,y:p.y,time:world.time,air:!p.node,speed:Math.hypot(p.vx,p.vy)});
  const limit=reducedMotion?64:148;if(trail.length>limit)trail.splice(0,trail.length-limit);
  const last=inkPath[inkPath.length-1];
  if(!last||Math.hypot(p.x-last.x,p.y-last.y)>.6)inkPath.push({x:p.x,y:p.y,speed:Math.hypot(p.vx,p.vy)});
  pruneInkPath();
}
function pruneInkPath(){
  if(!H||!world)return;
  const below=H+220;
  let gone=0;while(gone<inkPath.length&&sy(inkPath[gone].y)>below)gone++;
  if(gone>0)inkPath.splice(0,gone);
  if(inkPath.length>INK_PATH_CAP)inkPath.splice(0,inkPath.length-INK_PATH_CAP);
  // The surveyed departures and landings are dried ink beside the route, and are pruned with it.
  let dropped=0;while(dropped<surveys.length&&sy(surveys[dropped].cy)>below)dropped++;
  if(dropped>0)surveys.splice(0,dropped);
  if(surveys.length>SURVEY_CAP)surveys.splice(0,surveys.length-SURVEY_CAP);
}
// The dried route: one wash pass and three weights of burin line, the heavier where the flight was
// faster, cut in the ink the pen is charged with. The wet trail dries into its head, so the line the
// player is drawing now and the line drawn a minute ago are the same line.
function drawInkPath(){
  if(inkPath.length<2)return;
  const pen=trailInk(),rgb=pen.path||ink.dark.pathInk,paper=onPaper();
  const band=p=>Math.min(2,Math.floor(clamp((p.speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1)*3));
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=`rgba(${rgb},${paper?.11:.08})`;ctx.lineWidth=1.9*scale;
  ctx.beginPath();
  ctx.moveTo(sx(inkPath[0].x),sy(inkPath[0].y));
  for(let i=1;i<inkPath.length;i++)ctx.lineTo(sx(inkPath[i].x),sy(inkPath[i].y));
  ctx.stroke();
  for(let weight=0;weight<3;weight++){
    ctx.strokeStyle=`rgba(${rgb},${(paper?.4:.3)+weight*.05})`;ctx.lineWidth=(.34+weight*.26)*scale;
    ctx.beginPath();
    for(let i=1;i<inkPath.length;i++){
      if(band(inkPath[i])!==weight)continue;
      ctx.moveTo(sx(inkPath[i-1].x),sy(inkPath[i-1].y));ctx.lineTo(sx(inkPath[i].x),sy(inkPath[i].y));
    }
    ctx.stroke();
  }
  ctx.restore();
}
// ---------- The survey: every flight measured at both ends ----------
// A flight is surveyed where it leaves and where it lands, and the geometer's construction stays on the
// sheet as dried ink. At the release: the radius out to the release point, the departure line along the
// tangent with an arrowhead at its end, and the release bearing — an arc swept clockwise from the sheet's
// north to the release radius, its numeral set outside it, over a dotted north reference. At the landing:
// the radius to the contact, the incoming line carried a little past it, the arrival angle between them
// with its numeral — or, for a square, the geometer's right angle in gold — and a short note of the
// arrival speed, the reward, and the orbits skipped.
// Both are kept in world coordinates, pruned with the permanent ink path, cleared when a new run is dealt,
// and drawn in one style and the pen's own dried ink. The pen reads `world.time`, so a paused run freezes
// a construction mid-stroke and reduced motion prints it whole.
const SURVEY_CAP=48,SURVEY_LANDING=.6,SURVEY_DEPARTURE=.4;
function surveyProgress(s){
  if(reducedMotion)return 1;
  return clamp((world.time-s.birth)/Math.max(.001,s.span),0,1);
}
// The moment of release: the orbit just left is the node the flight is ignoring, and the release velocity
// is the tangent it left along. The bearing is read clockwise from the sheet's north, 0 to 359.
function recordDeparture(e){
  if(!world)return null;
  const n=world.nodes.find(q=>q.id===world.player.ignore);if(!n)return null;
  const rx=e.x-n.x,ry=e.y-n.y,r=Math.hypot(rx,ry);if(!(r>1))return null;
  const speed=Math.hypot(e.vx,e.vy)||1;
  const record={kind:'departure',cx:n.x,cy:n.y,x:e.x,y:e.y,r,ux:rx/r,uy:ry/r,dx:e.vx/speed,dy:e.vy/speed,
    bearing:Math.round(((Math.atan2(rx,-ry)*180/Math.PI)%360+360)%360)%360,birth:world.time,span:SURVEY_DEPARTURE};
  surveys.push(record);pruneInkPath();return record;
}
// The landing: only a flight that was launched is surveyed, so the orbit the run opens on is not.
function recordLanding(e){
  if(!world||!e.launch)return null;
  const n=e.n,rx=e.x-n.x,ry=e.y-n.y,r=Math.hypot(rx,ry)||n.r||1;
  const speed=Math.hypot(e.vx,e.vy)||1;
  const record={kind:'landing',cx:n.x,cy:n.y,x:e.x,y:e.y,r,ux:rx/r,uy:ry/r,dx:e.vx/speed,dy:e.vy/speed,
    angle:e.angle,square:!!e.square,squareBonus:e.squareBonus||0,gain:e.gain,
    mult:e.scoreMultiplier||1,skipped:e.skipped||0,birth:world.time,span:SURVEY_LANDING};
  surveys.push(record);pruneInkPath();return record;
}
// A hairline drawn on from one end to the other, with the wet bead and the nib riding the moving end.
function surveyLine(x0,y0,x1,y1,t,rgb,alpha,weight,head){
  if(t<=0)return;
  const x=lerp(x0,x1,t),y=lerp(y0,y1,t);
  ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=Math.max(.35,weight);
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x,y);ctx.stroke();
  if(t<1&&head!==false){const a=Math.atan2(y1-y0,x1-x0);penBead(x,y,a,1.1*scale,.75);penNib(x,y,a,.8);}
}
// The same stroke swept round an arc, from one angle to another.
function surveyArc(cx,cy,r,from,to,t,rgb,alpha,weight){
  if(t<=0||!(r>.2))return;
  const end=from+(to-from)*t;
  ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=Math.max(.35,weight);
  ctx.beginPath();ctx.arc(cx,cy,r,Math.min(from,end),Math.max(from,end));ctx.stroke();
  if(t<1){
    const x=cx+Math.cos(end)*r,y=cy+Math.sin(end)*r,a=end+(to>=from?Math.PI/2:-Math.PI/2);
    penBead(x,y,a,1.1*scale,.75);penNib(x,y,a,.8);
  }
}
// A short tick across the arc at one of its ends, the way a geometer closes an angle.
function surveyTick(cx,cy,r,angle,rgb,alpha,weight){
  const c=Math.cos(angle),s=Math.sin(angle),reach=Math.max(2,2.6*scale);
  line(cx+c*(r-reach),cy+s*(r-reach),cx+c*(r+reach),cy+s*(r+reach),`rgba(${rgb},${alpha})`,Math.max(.35,weight));
}
// The engraved figures a construction is numbered with, and the italic note beside it.
function surveyNumeral(text,x,y,size,rgb,alpha,t){
  if(t<=0)return;
  ctx.save();ctx.textAlign='center';ctx.fillStyle=`rgba(${rgb},${alpha})`;
  ctx.font=`${size}px 'IM Fell English',Georgia,serif`;
  writeText(ctx,text,x,y+size*.35,t,{size});
  ctx.restore();
}
// The points of a construction are lettered as a geometer letters a figure — a at the centre, b at the point
// on the ring, c at the far end of the line — in the same italic hand the note beside it is written in.
function surveyLetter(text,x,y,size,rgb,alpha,t){
  if(t<=0)return;
  ctx.save();ctx.textAlign='center';ctx.fillStyle=`rgba(${rgb},${alpha})`;
  ctx.font=`italic ${size}px 'IM Fell English',Georgia,serif`;
  writeText(ctx,text,x,y+size*.35,t,{size,nib:false});
  ctx.restore();
}
// A unit vector across a construction's line, turned to the side away from a given direction.
function surveyAside(ux,uy,dx,dy){let px=-uy,py=ux;if(px*dx+py*dy>0){px=-px;py=-py;}return [px,py];}
function drawSurveys(){
  if(!surveys.length||!world)return;
  const rgb=(trailInk().path||ink.dark.pathInk),gold=ink.base.gold,base=onPaper()?.6:.46;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.textBaseline='alphabetic';
  for(const s of surveys){
    const y=sy(s.cy);if(y<-320||y>H+320)continue;
    const t=surveyProgress(s);if(t<=0)continue;
    if(s.kind==='departure')drawDepartureSurvey(s,t,rgb,base);
    else drawLandingSurvey(s,t,rgb,gold,base);
  }
  ctx.restore();
}
function drawDepartureSurvey(s,t,rgb,base){
  const cx=sx(s.cx),cy=sy(s.cy),px=sx(s.x),py=sy(s.y),r=s.r*scale;
  // (a) The radius, from the planet's centre out to the point the pen left the ring.
  surveyLine(cx,cy,px,py,revealSpan(t,0,.3),rgb,base*.7,.45*scale);
  // (b) The departure line along the tangent, closed with a small arrowhead.
  const reach=30*scale,ex=px+s.dx*reach,ey=py+s.dy*reach,run=revealSpan(t,.25,.6);
  surveyLine(px,py,ex,ey,run,rgb,base,.55*scale);
  if(run>=1){
    const a=Math.atan2(s.dy,s.dx),wing=Math.max(3,4.2*scale);
    ctx.strokeStyle=`rgba(${rgb},${base})`;ctx.lineWidth=Math.max(.35,.55*scale);
    ctx.beginPath();
    ctx.moveTo(ex-Math.cos(a-.42)*wing,ey-Math.sin(a-.42)*wing);ctx.lineTo(ex,ey);
    ctx.lineTo(ex-Math.cos(a+.42)*wing,ey-Math.sin(a+.42)*wing);ctx.stroke();
  }
  // (c) The bearing: the dotted north reference from the centre up to the ring, the arc swept clockwise
  // from it to the release radius with a tick at each end, and the reading set outside the arc. The whole
  // figure is kept well inside the ring, so it can never cross the release marks printed on the rim.
  const bear=revealSpan(t,.55,1);if(bear<=0)return;
  ctx.save();ctx.setLineDash([Math.max(1,1.6*scale),Math.max(2,3*scale)]);
  surveyLine(cx,cy,cx,cy-r,Math.min(1,bear*2.6),rgb,base*.45,.4*scale,false);
  ctx.restore();
  const arcR=Math.max(5,r*.52),from=-Math.PI/2,to=from+s.bearing*Math.PI/180;
  surveyArc(cx,cy,arcR,from,to,bear,rgb,base*.8,.45*scale);
  if(bear>=1){
    surveyTick(cx,cy,arcR,from,rgb,base*.75,.4*scale);
    surveyTick(cx,cy,arcR,to,rgb,base*.75,.4*scale);
  }
  const mid=(from+to)/2,size=Math.max(8,9*scale),labelR=arcR+Math.max(8,9*scale);
  surveyNumeral(s.bearing+'°',cx+Math.cos(mid)*labelR,cy+Math.sin(mid)*labelR,size,rgb,base*.95,revealSpan(t,.72,1));
  // (d) The letters: a at the centre and b at the release point, set across the radius on the side away
  // from the departure line, and c beyond the arrowhead — each written as the pen reaches its point.
  const [ax,ay]=surveyAside(s.ux,s.uy,s.dx,s.dy),off=8*scale,ls=Math.max(7.5,8.5*scale);
  surveyLetter('a',cx+ax*off,cy+ay*off,ls,rgb,base*.9,revealSpan(t,.25,.38));
  surveyLetter('b',px+ax*off-s.ux*2*scale,py+ay*off-s.uy*2*scale,ls,rgb,base*.9,revealSpan(t,.3,.43));
  surveyLetter('c',ex+s.dx*9*scale,ey+s.dy*9*scale,ls,rgb,base*.9,revealSpan(t,.6,.74));
}
function drawLandingSurvey(s,t,rgb,gold,base){
  const cx=sx(s.cx),cy=sy(s.cy),px=sx(s.x),py=sy(s.y);
  // (a) The radius from the planet's centre out to the contact.
  surveyLine(cx,cy,px,py,revealSpan(t,0,.28),rgb,base*.7,.45*scale);
  // (b) The incoming line, carried a little past the contact so the angle has two full arms.
  const back=34*scale,past=11*scale;
  surveyLine(px-s.dx*back,py-s.dy*back,px+s.dx*past,py+s.dy*past,revealSpan(t,.22,.55),rgb,base,.55*scale);
  // (c) Between them the arrival angle: an arc with two tick ends and its numeral outside, or — where the
  // line met the ring square — the geometer's right angle, a small square with a dot inside it, in gold.
  const mark=revealSpan(t,.5,.82),reach=Math.max(9,11*scale);
  const inward=Math.atan2(-s.uy,-s.ux),along=Math.atan2(s.dy,s.dx);
  let delta=along-inward;while(delta>Math.PI)delta-=TAU;while(delta<-Math.PI)delta+=TAU;
  const bis=inward+delta/2;
  if(s.square){
    const ex=Math.cos(inward),ey=Math.sin(inward),fx=Math.cos(along),fy=Math.sin(along),q=reach*.72;
    surveyLine(px+ex*q,py+ey*q,px+ex*q+fx*q,py+ey*q+fy*q,revealSpan(mark,0,.52),gold,base+.14,.7*scale);
    surveyLine(px+fx*q,py+fy*q,px+fx*q+ex*q,py+fy*q+ey*q,revealSpan(mark,.44,.94),gold,base+.14,.7*scale);
    if(mark>.9){
      ctx.fillStyle=`rgba(${gold},${base+.2})`;
      ctx.beginPath();ctx.arc(px+(ex+fx)*q*.44,py+(ey+fy)*q*.44,Math.max(.9,1.15*scale),0,TAU);ctx.fill();
    }
  }else{
    surveyArc(px,py,reach,inward,inward+delta,mark,rgb,base*.9,.45*scale);
    if(mark>=1){
      surveyTick(px,py,reach,inward,rgb,base*.8,.4*scale);
      surveyTick(px,py,reach,inward+delta,rgb,base*.8,.4*scale);
    }
    const size=Math.max(8,9.5*scale),labelR=reach+Math.max(9,10*scale);
    surveyNumeral(Math.round(s.angle)+'°',px+Math.cos(bis)*labelR,py+Math.sin(bis)*labelR,size,rgb,base*.95,revealSpan(t,.62,.88));
  }
  // (d) The letters: a at the centre, across the radius on the side away from the incoming line; b at the
  // contact, across the incoming line on the outward side; c at the far end of the incoming line.
  {
    const [ax,ay]=surveyAside(s.ux,s.uy,s.dx,s.dy),[bx,by]=surveyAside(s.dx,s.dy,-s.ux,-s.uy),off=8*scale,ls=Math.max(7.5,8.5*scale);
    surveyLetter('a',cx+ax*off,cy+ay*off,ls,rgb,base*.9,revealSpan(t,.26,.4));
    surveyLetter('b',px+bx*off,py+by*off,ls,rgb,base*.9,revealSpan(t,.3,.44));
    surveyLetter('c',px-s.dx*(back+7*scale),py-s.dy*(back+7*scale),ls,rgb,base*.9,revealSpan(t,.5,.62));
  }
  // (e) The note, set in Fell italic beside the construction on the far side of the ring from the planet.
  const note=revealSpan(t,.78,1);if(note<=0||plainPlate())return;
  const lines=[];
  if(s.square)lines.push(['ANGULUS RECTUS · +'+s.squareBonus,gold]);
  lines.push(['×'+s.mult.toFixed(1)+'  ·  +'+s.gain,rgb]);
  if(s.skipped>0)lines.push(['SKIP '+s.skipped,rgb]);
  // The node prints its own row numeral a little east of the ring, so a contact that landed due east
  // pushes the note further out rather than setting it on top of the number.
  const size=Math.max(9,10*scale),step=size*1.28,right=s.ux>=0;
  const out=(s.ux>.9&&Math.abs(s.uy)<.36?38:22)*scale;
  const nx=px+s.ux*out+(right?4:-4),ny=py+s.uy*out;
  ctx.save();ctx.font=`italic ${size}px 'IM Fell English',Georgia,serif`;
  // The note is kept inside the frame's inner rule: its left edge is clamped to the sheet, whichever
  // side of the ring it was set on, so a landing near the margin never prints into the border.
  let widest=0;for(const l of lines)widest=Math.max(widest,ctx.measureText(l[0]).width||l[0].length*size*.5);
  const inset=frameBand()+5*scale,left=clamp(right?nx:nx-widest,inset,Math.max(inset,W-inset-widest));
  ctx.textAlign='left';
  for(let i=0;i<lines.length;i++){
    const from=i/lines.length,step2=1/lines.length;
    ctx.fillStyle=`rgba(${lines[i][1]},${base*.95})`;
    writeText(ctx,lines[i][0],left,ny+i*step,revealSpan(note,from,from+step2),{size,nib:false});
  }
  ctx.restore();
}
function drawTrail(){
  if(trail.length<2)return;
  const pen=trailInk();
  // Past the gauge's own copper mark (see updateUI) the nib is starved: the stroke skips beats and
  // loses its weight the nearer the reservoir runs to dry, as a real pen scratches out its last ink.
  const starved=clamp(1-world.inkLevel()/.34,0,1),thin=1-starved*.55;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(let i=1;i<trail.length;i++){
    const a=trail[i-1],b=trail[i],age=world.time-b.time;
    const life=reducedMotion?.48:b.air?1.18:.78,t=clamp(1-age/life,0,1);if(t===0)continue;
    if(starved>0){
      const skip=(Math.sin(b.time*5.3)+Math.sin(b.time*11.7+2.1)*.6+1.6)/3.2;
      if(skip<starved*.6)continue;
    }
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<.01)continue;
    const nx=-dy/d,ny=dx/d,boost=clamp((b.speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1),weight=t*(1+boost*.7);
    // A tapered wash, a fine pen stroke and a dry-brush edge follow real motion. The stroke is laid wet and
    // dries as the segment ages, from glossy blue-black to matte sepia on paper, bright to dim ink at night.
    const dried=mixRgb(pen.wet,pen.dry,1-t*t);
    line(sx(a.x),sy(a.y),sx(b.x),sy(b.y),`rgba(${pen.wash},${t*t*.16})`,(1+3.5*weight)*scale*thin);
    // Gold leaf is laid over a dark keyline, the way a gilder cuts the line first and lays the leaf into it.
    if(pen.keyline)line(sx(a.x),sy(a.y),sx(b.x),sy(b.y),`rgba(${pen.keyline},${t*t*.5})`,(.5+1.7*weight)*scale*thin);
    line(sx(a.x),sy(a.y),sx(b.x),sy(b.y),`rgba(${dried},${t*t*.77})`,(.18+1.2*weight)*scale*thin);
    if(!reducedMotion){
      const offset=(.55+Math.sin(b.time*19)*.3)*(1-t)+.6;
      line(sx(a.x+nx*offset),sy(a.y+ny*offset),sx(b.x+nx*offset),sy(b.y+ny*offset),`rgba(${pen.edge},${t*.36})`,.4*scale*thin);
      // Silverpoint catches the light along the stroke: a faint shimmer that travels segment by segment.
      if(pen.shimmer){
        const glint=Math.max(0,Math.sin(world.time*3.1-i*.35));
        if(glint>.55)line(sx(a.x),sy(a.y),sx(b.x),sy(b.y),`rgba(${pen.shimmer},${t*t*(glint-.55)*.9})`,(.15+.5*weight)*scale);
      }
      if(b.air&&i%6===0&&t<.88){
        const reach=(1-t)*(1.5+boost*2.5),sign=i%12===0?1:-1;
        line(sx(b.x+nx*sign),sy(b.y+ny*sign),sx(b.x-dx/d*reach+nx*reach*sign),sy(b.y-dy/d*reach+ny*reach*sign),`rgba(${pen.bleed},${t*.24})`,.4*scale);
      }
    }
  }
  ctx.restore();
}
// ---------- Observer marks: the glyph the traveller is engraved as ----------
// Every mark is cut in the same local space — the heading along +x, the moving point at the origin —
// and every one ends with the same head, so the actual position stays legible over a pale planet
// whatever is chosen. The comet is the plate's own mark and the default.
// The head all marks share: a reserved highlight on paper, a dark keyline, and the nib ticks that
// brighten with the charge held.
function markHead(boost,charge,inkHeld=1){
  if(onPaper()){ctx.fillStyle=ink.dark.playerHalo;ctx.beginPath();ctx.ellipse(0,0,6,5,0,0,TAU);ctx.fill();}
  ctx.fillStyle=ink.dark.playerKeyline;ctx.beginPath();ctx.ellipse(0,0,5.3,4.4,0,0,TAU);ctx.fill();
  ctx.fillStyle=ink.dark.playerMid;ctx.beginPath();ctx.ellipse(-.25,.2,4.1,3.3,0,0,TAU);ctx.fill();
  ctx.fillStyle=ink.dark.playerHighlight;ctx.beginPath();ctx.ellipse(.7,-.45,2.7,2.3,0,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgba(${ink.dark.playerNib},${(.48+charge*.25)*(.35+inkHeld*.65)})`;ctx.lineWidth=.55;
  ctx.beginPath();ctx.moveTo(5.1,0);ctx.lineTo(7.8+boost*1.5,0);ctx.moveTo(0,-4.7);ctx.lineTo(0,-6.4);ctx.moveTo(0,4.7);ctx.lineTo(0,6.1);ctx.stroke();
}
const markStroke=(alpha,width)=>{ctx.strokeStyle=`rgba(${ink.dark.playerFilamentB},${alpha})`;ctx.lineWidth=width;};
const OBSERVER_MARKS={
  // The pen itself: the nib leads, cut to a point at the traveller's exact position and turned along
  // the flight, with the barrel and the feather trailing behind it. The vane flexes back as the flight
  // quickens and breathes a little; under reduced motion it is held still.
  quill(length,boost,breath,charge,inkHeld=1){
    const flex=reducedMotion?0:boost*3.6+breath*1.6,back=-length*1.05;
    // On paper a ring of reserved, unprinted sheet keeps the ink of the vane clear of the nib.
    if(onPaper()){ctx.fillStyle=ink.dark.playerHalo;ctx.beginPath();ctx.ellipse(-4,0,7.4,5,0,0,TAU);ctx.fill();}
    const tipY=-6-flex;
    // The vane, laid either side of the shaft as a long lens of dilute ink.
    ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.3)`;
    ctx.beginPath();ctx.moveTo(-5,-.6);
    ctx.quadraticCurveTo(back*.4,-4.4-flex*.3,back,tipY);
    ctx.quadraticCurveTo(back*.5,5.4-flex*.2,-5,1.8);ctx.fill();
    markStroke(.78,1);
    ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(back*.45,-1.6-flex*.35,back,tipY);ctx.stroke();
    // The barbs of the feather, longer and more swept the further back they are cut.
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.72)`;ctx.lineWidth=.55;
    ctx.beginPath();
    for(let i=1;i<=12;i++){
      const u=i/13,x=lerp(-5.5,back,u),y=lerp(-.3,tipY*.94,u);
      const sweep=Math.sin(Math.PI*Math.min(1,u*1.15));
      ctx.moveTo(x,y);ctx.lineTo(x-3.4-u*2.6,y+3.4+sweep*4.4);
      ctx.moveTo(x,y);ctx.lineTo(x-2.6-u*1.8,y-2.2-sweep*3.1);
    }
    ctx.stroke();
    // The nib: a cut point with its slit and shoulder, keylined so the moving point stays legible over
    // a pale planet, exactly as the comet's head is.
    ctx.fillStyle=ink.dark.playerKeyline;
    ctx.beginPath();ctx.moveTo(.6,0);ctx.lineTo(-7.4,-3.1);ctx.lineTo(-9.4,0);ctx.lineTo(-7.4,3.1);ctx.closePath();ctx.fill();
    ctx.fillStyle=ink.dark.playerMid;
    ctx.beginPath();ctx.moveTo(-.6,0);ctx.lineTo(-7,-2.1);ctx.lineTo(-8.4,0);ctx.lineTo(-7,2.1);ctx.closePath();ctx.fill();
    ctx.fillStyle=ink.dark.playerHighlight;
    ctx.beginPath();ctx.ellipse(-5.6,-.5,1.9,1.2,0,0,TAU);ctx.fill();
    ctx.strokeStyle=ink.dark.playerKeyline;ctx.lineWidth=.5;
    ctx.beginPath();ctx.moveTo(-.4,0);ctx.lineTo(-6.4,0);ctx.stroke();
    // The bead of wet ink held at the point. It brightens with the slingshot charge in hand and
    // dries away as the nib empties, so a starved point is visible before the line ever stops.
    ctx.fillStyle=`rgba(${ink.dark.playerNib},${(.4+charge*.45)*(.24+inkHeld*.76)})`;
    ctx.beginPath();ctx.arc(-1.6,0,(1+charge*.5)*(.4+inkHeld*.6),0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(${ink.dark.playerNib},${.42+charge*.3})`;ctx.lineWidth=.55;
    ctx.beginPath();ctx.moveTo(-6.6,-3.4);ctx.lineTo(-6.6,-5.4);ctx.moveTo(-6.6,3.4);ctx.lineTo(-6.6,5.1);ctx.stroke();
    return true;
  },
  // A little copperplate comet: a bright head and asymmetric engraved filaments.
  comet(length,boost,breath){
    ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.2)`;ctx.beginPath();ctx.moveTo(4,0);
    ctx.bezierCurveTo(-3,-4.4,-length*.7,-2.8,-length,0);
    ctx.bezierCurveTo(-length*.58,2.3,-4,4.1,4,0);ctx.fill();
    for(let i=0;i<5;i++){
      const side=i%2?1:-1,spread=(1+i*.48)*(1+boost*.28)+breath;
      ctx.strokeStyle=`rgba(${i%2?ink.dark.playerFilamentA:ink.dark.playerFilamentB},${.56-i*.065})`;ctx.lineWidth=i===0?.7:.45;
      ctx.beginPath();ctx.moveTo(1,side*.8);
      ctx.bezierCurveTo(-length*.26,side*spread,-length*.63,side*(spread+.7),-length*(.72+i*.1),side*(.4+i*.22));ctx.stroke();
    }
  },
  telescope(length,boost,breath){
    const back=-length*.86,joint=back*.45;
    ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.16)`;
    ctx.beginPath();ctx.moveTo(8,-3.1);ctx.lineTo(joint,-2.5);ctx.lineTo(back,-1.7);ctx.lineTo(back,1.7);ctx.lineTo(joint,2.5);ctx.lineTo(8,3.1);ctx.closePath();ctx.fill();
    markStroke(.62,.7);
    ctx.beginPath();ctx.moveTo(8,-3.1);ctx.lineTo(joint,-2.5);ctx.lineTo(back,-1.7);ctx.moveTo(8,3.1);ctx.lineTo(joint,2.5);ctx.lineTo(back,1.7);ctx.stroke();
    for(const [x,r] of [[8,3.4],[joint,2.7],[back,1.9]]){
      markStroke(.6,.6);ctx.beginPath();ctx.ellipse(x,0,.9,r,0,0,TAU);ctx.stroke();
    }
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.4)`;ctx.lineWidth=.4;
    ctx.beginPath();
    for(let i=0;i<7;i++){const x=lerp(joint,8,i/6);ctx.moveTo(x,1.1);ctx.lineTo(x-1.3,2.9);}
    ctx.stroke();
    // The line of sight, breathing a little as the observer holds the tube steady.
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentB},${.26+boost*.16})`;ctx.lineWidth=.4;
    ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(15+boost*5,breath*2);ctx.stroke();
  },
  moth(length,boost,breath){
    const beat=1+breath*.5,span=Math.max(13,length*.62);
    for(const side of [-1,1]){
      ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.22)`;
      ctx.beginPath();ctx.moveTo(1,side*1.2);
      ctx.bezierCurveTo(-2,side*(9*beat),-span*.9,side*(10.5*beat),-span,side*(2.2*beat));
      ctx.bezierCurveTo(-span*.6,side*.8,-3,side*.9,1,side*1.2);ctx.fill();
      markStroke(.72,.7);
      ctx.beginPath();ctx.moveTo(1,side*1.2);
      ctx.bezierCurveTo(-2,side*(9*beat),-span*.9,side*(10.5*beat),-span,side*(2.2*beat));ctx.stroke();
      ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.5)`;ctx.lineWidth=.4;
      ctx.beginPath();
      for(let i=1;i<4;i++){const u=i/4;ctx.moveTo(-1,side*1.4);ctx.lineTo(lerp(-2,-span*.95,u),side*(2.6+6.4*beat*(1-u*.4)));}
      ctx.stroke();
      // The feathered antennae.
      markStroke(.5,.4);
      ctx.beginPath();ctx.moveTo(3.4,side*1.2);ctx.quadraticCurveTo(8,side*2.4,10.5,side*(5+breath));ctx.stroke();
    }
    markStroke(.6,.9);ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(-length*.42,0);ctx.stroke();
  },
  saturn(length,boost,breath){
    const reach=8.4+breath;
    for(const side of [-1,1]){
      ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.24)`;
      ctx.beginPath();ctx.ellipse(side*reach,0,3.3,4.1,0,0,TAU);ctx.fill();
      markStroke(.8,.85);ctx.beginPath();ctx.ellipse(side*reach,0,3.3,4.1,0,0,TAU);ctx.stroke();
      ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.5)`;ctx.lineWidth=.4;
      ctx.beginPath();
      for(let i=0;i<4;i++){const y=-2.4+i*1.6;ctx.moveTo(side*(reach-2.4),y);ctx.lineTo(side*(reach+2.4),y);}
      ctx.stroke();
    }
    markStroke(.6,.6);
    ctx.beginPath();ctx.moveTo(-reach+3,0);ctx.lineTo(reach-3,0);ctx.stroke();
    // The wake of the observation, faint behind the figure.
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},${.3+boost*.2})`;ctx.lineWidth=.4;
    ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(-length*.6,breath*1.5);ctx.stroke();
  }
};function drawPlayer(){
  if(world.state==='dead')return;const p=world.player,flight=!p.node;
  const speed=Math.hypot(p.vx,p.vy),boost=clamp((speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1),charge=world.charge(),inkHeld=world.inkLevel();
  const length=flight?23+boost*20:16,breath=reducedMotion?0:Math.sin(world.time*5.5)*.22;
  ctx.save();ctx.translate(sx(p.x),sy(p.y));ctx.rotate(Math.atan2(p.vy,p.vx));ctx.scale(scale,scale);
  ctx.lineCap='round';ctx.lineJoin='round';
  // A mark that cuts its own point — the quill's nib is the moving point — says so and keeps it;
  // every other mark ends with the shared head. The dark keyline keeps the actual moving point legible
  // over pale planets; on paper a thin ring of exposed, unprinted paper sits between the ink and it.
  const mark=OBSERVER_MARKS[cosmetic('mark')]||OBSERVER_MARKS.quill;
  if(!mark(length,boost,breath,charge,inkHeld))markHead(boost,charge,inkHeld);
  if(p.shielded){
    const pulse=reducedMotion?1:.85+.15*Math.sin(world.time*4);
    ctx.strokeStyle=`rgba(${ink.dark.playerShield},${.55*pulse})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,9,0,TAU);ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.playerShield},${.22*pulse})`;ctx.lineWidth=.5;ctx.beginPath();ctx.arc(0,0,11.5,0,TAU);ctx.stroke();
  }
  // The reflector's charge rides a wider, broken ring, so the two carried charges read apart at a
  // glance and neither is lost when both are held at once.
  if(p.reflectorArmed){
    const pulse=reducedMotion?1:.85+.15*Math.sin(world.time*4+1.7);
    ctx.strokeStyle=`rgba(${ink.dark.playerReflector},${.55*pulse})`;ctx.lineWidth=1;ctx.setLineDash([2.4,2.4]);
    ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.stroke();ctx.setLineDash([]);
  }
  ctx.restore();
}
function darknessPlate(relief){
  if(darknessPlates.has(relief))return darknessPlates.get(relief);
  const c=makeCanvas(640,180),g=c.getContext('2d'),rng=seeded(620173),w=c.width,h=c.height;
  const pigment=relief?ink.dark.pigmentRelief:ink.dark.pigment;
  // Seamless pools of dilute ink, growing opaque below the leading edge.
  const wash=g.createLinearGradient(0,24,0,140);
  wash.addColorStop(0,`rgba(${ink.dark.washTop},0)`);wash.addColorStop(.22,`rgba(${ink.dark.washMid},${onPaper()?.94:.78})`);wash.addColorStop(1,ink.dark.washSolid);
  g.fillStyle=wash;g.fillRect(0,24,w,h-24);
  if(onPaper()){
    // Spilled ink on paper: the flood bleeds upward along the fibres in dark feathered threads, with a few
    // near-opaque pools where the pigment settled, so the edge reads as a stain rather than a horizon.
    const bleed=seeded(311977);
    for(let i=0;i<260;i++){
      const x=bleed()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5,reach=2+bleed()*bleed()*16,bend=(bleed()-.5)*6;
      for(const wrap of [-w,0,w]){
        g.strokeStyle=`rgba(${ink.dark.fleckDark},${.08+bleed()*.22})`;g.lineWidth=.35+bleed()*.7;
        g.beginPath();g.moveTo(x+wrap,edge+6);g.bezierCurveTo(x+wrap+bend,edge+2,x+wrap-bend,edge-reach*.5,x+wrap+bend*.4,edge-reach);g.stroke();
      }
    }
    for(let i=0;i<14;i++){
      const x=bleed()*w,y=44+bleed()*90,rx=10+bleed()*34,ry=4+bleed()*11,seed=Math.floor(bleed()*1e7);
      for(const wrap of [-w,0,w]){landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=`rgba(${ink.dark.fleckDark},.55)`;g.fill();}
    }
  }
  for(let layer=0;layer<5;layer++){
    g.beginPath();g.moveTo(0,h);
    for(let x=0;x<=w;x+=4){
      const a=x/w*TAU,y=28+layer*13+Math.sin(a*3+layer*.6)*6+Math.sin(a*11-layer*.4)*2.5;
      g.lineTo(x,y);
    }
    g.lineTo(w,h);g.closePath();g.fillStyle=ink.dark.voidLayers[layer];g.fill();
  }
  g.save();g.beginPath();g.rect(0,27,w,h-27);g.clip();
  for(let i=0;i<24;i++){
    const x=rng()*w,y=36+rng()*100,rx=14+rng()*52,ry=6+rng()*18,seed=Math.floor(rng()*1e7);
    for(const wrap of [-w,0,w]){
      landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=i%3?ink.dark.landFillWash:ink.dark.landFillPool;g.fill();
      g.strokeStyle=`rgba(${pigment},.055)`;g.lineWidth=.6;g.stroke();
    }
  }
  // The pigment settles along paper fibres, leaving a ragged, pale tide mark.
  for(let i=0;i<220;i++){
    const x=rng()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5;
    const length=2+rng()*15,bend=(rng()-.5)*5;
    for(const wrap of [-w,0,w]){
      g.strokeStyle=`rgba(${pigment},${.045+rng()*.07})`;g.lineWidth=.3+rng()*.45;
      g.beginPath();g.moveTo(x+wrap,edge+length);
      g.bezierCurveTo(x+wrap+bend,edge+length*.6,x+wrap-bend,edge+2,x+wrap,edge);g.stroke();
    }
  }
  for(let i=0;i<2400;i++){
    const x=rng()*w,y=28+rng()*(h-28),fade=Math.pow(1-(y-28)/(h-28),1.5);
    g.fillStyle=i%3?`rgba(${pigment},${fade*(.02+rng()*.09)})`:`rgba(${ink.dark.fleckDark},${fade*.18})`;
    g.fillRect(x,y,.3+rng()*.65,.35+rng()*.6);
  }
  g.restore();
  // The shallow fringe is translucent; the calibrated danger line stays clear.
  for(let i=0;i<75;i++){
    const x=rng()*w,top=7+rng()*15,length=1+rng()*4;
    g.strokeStyle=`rgba(${pigment},${.035+rng()*.055})`;g.lineWidth=.45;
    g.beginPath();g.moveTo(x,25);g.bezierCurveTo(x+length,21,x-length,top+4,x+.7,top);g.stroke();
  }
  darknessPlates.set(relief,c);return c;
}
// ---------- Marginalia carried on the rising ink ----------
// A sea-monster and a gloss ride the shoreline, as they do in the empty quarters of an old chart.
// Both are cut once into sprites: the Leviathan only bobs and fades, it is never re-engraved, and
// the waterline crops whatever of him is still under the ink.
const darkMarginalia=new Map();
function leviathanSprite(relief){
  const s=Math.max(.55,Math.min(1.6,scale)),key='leviathan:'+plateName+':'+(relief?'r':'n')+':'+s.toFixed(2)+':'+DPR.toFixed(2);
  const cached=darkMarginalia.get(key);if(cached)return cached;
  const w=Math.ceil(180*s),h=Math.ceil(80*s);
  const c=makeCanvas(Math.max(1,Math.round(w*DPR)),Math.max(1,Math.round(h*DPR))),g=c.getContext('2d');
  g.scale(DPR*s,DPR*s);g.lineCap='round';g.lineJoin='round';
  const rgb=relief?ink.dark.shorelineRelief:ink.dark.pigment,base=80,rng=seeded(880517);
  // Three coils breaking the surface, each with its own scaled back.
  const coils=[[34,17],[66,21],[95,15]];
  for(const [cx,cr] of coils){
    burinArc(g,cx,base,cr,Math.PI,TAU,rgb,.85,1.15,Math.floor(rng()*1e6)||3,{segments:16,skips:2});
    burinArc(g,cx,base+2,cr-5,Math.PI*1.08,Math.PI*1.92,rgb,.4,.6,Math.floor(rng()*1e6)||5,{segments:10,skips:2});
    for(let i=0;i<7;i++){
      const a=Math.PI*(1.1+i*.12),x=cx+Math.cos(a)*(cr-2),y=base+Math.sin(a)*(cr-2);
      burinSegment(g,x,y,x+Math.cos(a)*4,y+Math.sin(a)*4,rgb,.4,.5,Math.floor(rng()*1e6)||7,{segments:2,hair:false});
    }
  }
  // The tail thrown up at the far end, with its fluke.
  burinSegment(g,14,base,7,base-24,rgb,.8,1.3,4113,{segments:5,hair:false,wobble:.7});
  burinSegment(g,7,base-24,-3,base-33,rgb,.75,1,4127,{segments:3,hair:false,wobble:.4});
  burinSegment(g,7,base-24,15,base-34,rgb,.75,1,4133,{segments:3,hair:false,wobble:.4});
  burinSegment(g,-3,base-33,15,base-34,rgb,.35,.6,4137,{segments:4,hair:false,wobble:.8});
  // The neck, rising from the third coil.
  burinSegment(g,112,base,127,base-34,rgb,.85,1.5,4139,{segments:6,hair:false,wobble:.8});
  burinSegment(g,121,base,134,base-30,rgb,.6,1,4157,{segments:6,hair:false,wobble:.8});
  // The head: a long wedge with open jaws, an eye, teeth, and two swept horns.
  burinArc(g,130,base-38,8.5,Math.PI*.36,Math.PI*1.42,rgb,.85,1.2,4159,{segments:11,skips:1});
  burinSegment(g,129,base-45,160,base-50,rgb,.9,1.3,4177,{segments:6,hair:false,wobble:.5});
  burinSegment(g,131,base-32,153,base-40,rgb,.85,1.1,4201,{segments:6,hair:false,wobble:.5});
  burinSegment(g,153,base-40,160,base-50,rgb,.8,1,4211,{segments:3,hair:false,wobble:.3});
  for(let i=0;i<5;i++){
    const u=i/5,x0=lerp(134,152,u),y0=lerp(base-45.6,base-49,u),y1=lerp(base-41,base-44.5,u);
    burinSegment(g,x0,y0,x0+1.4,y1,rgb,.5,.5,4217+i,{segments:2,hair:false});
  }
  g.fillStyle=`rgba(${rgb},.9)`;g.beginPath();g.arc(136,base-42.5,1.6,0,TAU);g.fill();
  burinArc(g,136,base-42.5,4,0,TAU,rgb,.45,.5,4229,{segments:8,skips:1});
  for(const [dx,dy] of [[-9,-9],[-13,-4]])burinSegment(g,128,base-44,128+dx,base-44+dy,rgb,.6,.8,4233+dx,{segments:3,hair:false,wobble:.5});
  // The spout, blown clear of the head.
  for(let i=0;i<7;i++){
    const spread=(i-3)/3*.55,len=16+rng()*14;
    burinSegment(g,133,base-50,133+Math.sin(spread)*len*.85,base-50-Math.cos(spread)*len,rgb,.34,.6,4241+i*3,{segments:4,skips:1,hair:false,wobble:1.2});
  }
  const sprite={canvas:c,w,h};
  darkMarginalia.set(key,sprite);return sprite;
}
function glossSprite(relief){
  const size=Math.max(9,11*scale),key='gloss:'+plateName+':'+(relief?'r':'n')+':'+size.toFixed(1)+':'+DPR.toFixed(2);
  const cached=darkMarginalia.get(key);if(cached)return cached;
  const rgb=relief?ink.dark.shorelineRelief:ink.dark.pigment;
  const text='HIC SUNT DRACONES',font=`${size}px 'IM Fell English SC','IM Fell English',Georgia,serif`;
  const w=Math.ceil(size*text.length*.72)+8,h=Math.ceil(size*1.9);
  const c=makeCanvas(Math.max(1,Math.round(w*DPR)),Math.max(1,Math.round(h*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.font=font;g.textAlign='left';g.textBaseline='alphabetic';
  g.fillStyle=`rgba(${rgb},.9)`;
  g.fillText(text,4,size*1.15);
  g.fillStyle=`rgba(${rgb},.45)`;
  g.fillRect(4,size*1.45,Math.max(1,w-14),.6);
  const sprite={canvas:c,w,h};
  darkMarginalia.set(key,sprite);return sprite;
}
// The lowest line the shoreline's marginalia may reach: the footer band across the bottom of the plate,
// where the chapter name and the utility buttons are set, plus the frame's own inner rule. The waterline
// itself goes on rising past it — only the monster and the gloss are held above.
function marginaliaFloor(){return H-footerBand()-frameBand()*.92;}
// Where the gloss is printed for a given waterline: it rides just under the ink until the flood would
// carry it into the footer band, and from there it stays where it is while the ink goes on past it.
function marginaliaGloss(fy,gloss){
  const floor=marginaliaFloor();
  return {y:Math.min(fy+9*scale,floor-gloss.h),h:gloss.h};
}
// The Leviathan surfaces slowly and periodically at his own place along the edge, and the gloss
// drifts with the flood. Both stand still when the run is paused or reduced motion is requested, and
// both stay above the footer band however high the ink has risen.
// The gloss keeps off the chart: where it would drift across an orbit ring or a hazard it fades to nothing
// over a short reach and comes back once it is clear, so it never prints through a ring in the play channel.
function glossClearance(x,y,w,h){
  let clear=1;
  const near=(px,py,r)=>{const dx=Math.max(0,Math.abs(px-(x+w*.5))-w*.5),dy=Math.max(0,Math.abs(py-(y+h*.5))-h*.5);return Math.hypot(dx,dy)-r;};
  for(const n of world.nodes){const ny=sy(n.y);if(ny<y-220||ny>y+h+220)continue;clear=Math.min(clear,near(sx(n.x),ny,(n.cap||n.r)*scale+6*scale)/(16*scale));}
  for(const hz of world.hazards){const hy=sy(hz.y);if(hy<y-320||hy>y+h+320)continue;clear=Math.min(clear,near(sx(hz.x),hy,hz.r*scale+14*scale)/(16*scale));}
  return clamp(clear,0,1);
}
function drawDarkMarginalia(fy,time,alpha){
  const s=scale,drift=time*2.3*s,cycle=27,window=9.5;
  const floor=marginaliaFloor(),line=Math.min(fy,floor);
  const monster=leviathanSprite(false),phase=((time+7)%cycle)/cycle;
  if(phase<window/cycle&&line>monster.h*.25){
    const u=phase*cycle/window,rise=Math.sin(Math.PI*u);
    const span=W+monster.w*2,x=((.34*span-drift*.62)%span+span)%span-monster.w;
    const y=line-monster.h+(1-rise)*monster.h*1.05;
    ctx.save();ctx.beginPath();ctx.rect(0,0,W,Math.max(0,line+1));ctx.clip();
    ctx.globalAlpha=alpha*rise*.9;
    ctx.drawImage(monster.canvas,x,y,monster.w,monster.h);
    if(darknessRelief>.001){const r=leviathanSprite(true);ctx.globalAlpha=alpha*rise*.9*darknessRelief;ctx.drawImage(r.canvas,x,y,r.w,r.h);}
    ctx.restore();
  }
  if(plainPlate())return;
  const gloss=glossSprite(false),span=W+gloss.w*2;
  const gx=((.62*span-drift*.62)%span+span)%span-gloss.w;
  const gy=marginaliaGloss(fy,gloss).y;
  if(gy+gloss.h<=0)return;
  const clear=glossClearance(gx,gy,gloss.w,gloss.h);if(clear<=0)return;
  ctx.save();ctx.globalAlpha=alpha*.5*clear;
  ctx.drawImage(gloss.canvas,gx,gy,gloss.w,gloss.h);
  if(darknessRelief>.001){const r=glossSprite(true);ctx.globalAlpha=alpha*.5*darknessRelief*clear;ctx.drawImage(r.canvas,gx,gy,r.w,r.h);}
  ctx.restore();
}
function drawDark(dt=0){
  // Match the visible hairline to the simulation's exact loss threshold.
  const fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);
  if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  const time=reducedMotion?0:world.time,s=scale;
  const shoreBase=ink.dark.pigment.split(',').map(Number),shoreTarget=ink.dark.shorelineRelief.split(',').map(Number);
  const rgb=shoreBase.map((v,i)=>Math.round(lerp(v,shoreTarget[i],darknessRelief))).join(',');
  ctx.save();
  const body=ctx.createLinearGradient(0,fy,0,fy+68*s);
  body.addColorStop(0,`rgba(${ink.dark.bodyTop},.12)`);body.addColorStop(.4,`rgba(${ink.dark.bodyMid},.82)`);body.addColorStop(1,ink.dark.washSolid);
  ctx.fillStyle=body;ctx.fillRect(0,fy,W,Math.max(0,H-fy));
  const tileWidth=640*s,tileHeight=180*s,drift=(time*2.3*s)%tileWidth;
  const normal=darknessPlate(false),relief=darknessPlate(true);
  for(let x=-drift-tileWidth;x<W;x+=tileWidth){
    ctx.drawImage(normal,x,fy-24*s,tileWidth,tileHeight);
    if(darknessRelief>.001){ctx.globalAlpha=darknessRelief;ctx.drawImage(relief,x,fy-24*s,tileWidth,tileHeight);ctx.globalAlpha=1;}
  }
  // One fine shoreline communicates danger; softer sediment lines stay below it.
  line(0,fy,W,fy,`rgba(${rgb},${.38+near*.24+darknessRelief*.12})`,Math.max(.65,s*.75));
  for(let layer=0;layer<3;layer++){
    ctx.strokeStyle=`rgba(${rgb},${(.18-layer*.04)*(1+darknessRelief*.45)})`;ctx.lineWidth=.45*s;
    ctx.beginPath();
    for(let x=-8;x<W+9;x+=8){
      const y=fy+(3+layer*5+(Math.sin(x/(48*s)+time*.19+layer)*.5+.5)*(2+layer))*s;
      if(x===-8)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  for(const mote of inkMotes){
    const phase=(mote.phase+time*mote.speed)%1,alpha=Math.sin(phase*Math.PI)*(.13+near*.09+darknessRelief*.1);
    const x=mote.x*W+Math.sin(time*.3+mote.drift)*2*s,y=fy-(4+phase*25)*s;
    line(x,y,x+.3*s,y+mote.length*s,`rgba(${rgb},${alpha})`,.55*s);
  }
  drawDarkMarginalia(fy,time,.55+near*.3+darknessRelief*.15);
  if(near>.2&&world.state==='playing'){
    const edge=ctx.createRadialGradient(W*.5,H*.5,H*.3,W*.5,H*.5,Math.max(W,H)*.65);
    edge.addColorStop(0,'rgba(81,48,39,0)');edge.addColorStop(1,`rgba(${rgb},${near*.105*(1-darknessRelief*.75)})`);
    ctx.fillStyle=edge;ctx.fillRect(0,0,W,H);
  }
  ctx.restore();
}
function burst(x,y,count,color='gold',force=1){
  if(reducedMotion)return;
  for(let i=0;i<count;i++){
    const a=Math.random()*TAU,v=(18+Math.random()*90)*force;
    particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.4+Math.random()*.7,max:1.1,size:.6+Math.random()*1.3,color});
  }
  if(particles.length>230)particles.splice(0,particles.length-230);
}
// ---------- Capture marks: what the burin leaves at a planet as the traveller is taken ----------
// Each mark is drawn in the planet's own space, rotated so +x is the point of contact, with `radius`
// the ripple's reach and `alpha` its remaining life. Reduced motion holds every one of them still.
const CAPTURE_MARKS={
  // A compass rose thrown out from the contact: eight rays, the cardinals long, on two faint rings.
  rose(r,t,radius,alpha,burin){
    const rgb=ink.dark.transferArc;
    burinArc(ctx,0,0,radius,0,TAU,rgb,alpha*.5,r.perfect?.7:.5,burin,{segments:22,skips:2});
    if(r.perfect)burinArc(ctx,0,0,radius*.62,0,TAU,ink.dark.transferArcSoft,alpha*.4,.45,burin+5,{segments:16,skips:2});
    for(let i=0;i<8;i++){
      const a=i/8*TAU,long=i%2===0,reach=radius*(long?1.22:.86);
      const c=Math.cos(a),s=Math.sin(a);
      ctx.fillStyle=`rgba(${rgb},${alpha*(long?.85:.5)})`;
      ctx.beginPath();ctx.moveTo(c*reach,s*reach);
      ctx.lineTo(Math.cos(a+.13)*radius*.28,Math.sin(a+.13)*radius*.28);
      ctx.lineTo(Math.cos(a-.13)*radius*.28,Math.sin(a-.13)*radius*.28);
      ctx.closePath();ctx.fill();
    }
    line(0,0,radius*1.34,0,`rgba(${ink.dark.transferTick},${alpha*.8})`,.6);
  },
  // A wax seal pressed at the contact: a pooled blot of wax under a stamped star.
  seal(r,t,radius,alpha,burin){
    const size=Math.max(2,radius*(r.perfect?.5:.4));
    ctx.save();ctx.translate(radius*.72,0);
    landContour(ctx,0,0,size,size*.88,seeded(burin));
    ctx.fillStyle=`rgba(${ink.dark.transferArcSoft},${alpha*.5})`;ctx.fill();
    ctx.strokeStyle=`rgba(${ink.dark.transferArc},${alpha*.8})`;ctx.lineWidth=.5;ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.transferTick},${alpha*.9})`;ctx.lineWidth=.5;
    ctx.beginPath();
    for(let i=0;i<12;i++){
      const a=i/12*TAU,rr=i%2?size*.24:size*.55;
      const px=Math.cos(a)*rr,py=Math.sin(a)*rr;
      if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);
    }
    ctx.closePath();ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,size*.72,0,TAU);ctx.stroke();
    ctx.restore();
    burinArc(ctx,0,0,radius,-2.4,2.4,ink.dark.transferArc,alpha*.45,.5,burin+11,{segments:14,skips:2});
  },
  // A printer's manicule swung round to point at the planet that took you.
  manicule(r,t,radius,alpha,burin){
    burinArc(ctx,0,0,radius,-1.9,1.9,ink.dark.transferArc,alpha*.42,.5,burin,{segments:14,skips:2});
    ctx.save();ctx.rotate(Math.PI);
    manicule(-radius*1.5,0,1,Math.max(3.4,radius*.42),ink.dark.transferTick,alpha*.95);
    ctx.restore();
    if(r.perfect)line(radius*.4,0,radius*1.1,0,`rgba(${ink.dark.transferTick},${alpha*.7})`,.5);
  }
};
function drawTransferMark(r,t){
  const grow=reducedMotion?0:1-Math.pow(1-t,3),radius=r.start+grow*r.distance;
  const x=r.node?r.node.x:r.x,y=r.node?r.node.y:r.y,alpha=Math.pow(1-t,1.5)*r.alpha;
  const sectors=r.perfect?8:5;
  ctx.save();ctx.translate(sx(x),sy(y));ctx.scale(scale,scale);ctx.rotate(r.angle);
  const burin=r.seed||1;
  const chosen=CAPTURE_MARKS[cosmetic('capture')];
  if(chosen){chosen(r,t,radius,alpha,burin);ctx.restore();return;}
  for(let j=0;j<sectors;j++){
    const a=j*TAU/sectors,gap=r.perfect?.055:.11;
    burinArc(ctx,0,0,radius,a+gap,a+TAU/sectors-gap,ink.dark.transferArc,alpha,r.perfect?.9:.6,burin+j*13,{segments:7,skips:0});
    if(r.perfect){
      burinArc(ctx,0,0,radius+3,a+.1,a+TAU/sectors-.17,ink.dark.transferArcSoft,alpha*.68,.4,burin+j*13+5,{segments:5,skips:1});
      const c=Math.cos(a),s=Math.sin(a),reach=j%2===0?6:3;
      line(c*(radius+1),s*(radius+1),c*(radius+reach),s*(radius+reach),`rgba(${ink.dark.transferTick},${alpha})`,.6);
    }
  }
  // A short fan marks the actual point of contact, like a nib touching paper.
  if(!reducedMotion){
    for(let i=-2;i<=2;i++){
      const a=i*.07,c=Math.cos(a),s=Math.sin(a),start=radius+3,reach=(r.perfect?12:6)*(1-Math.abs(i)*.16);
      line(c*start,s*start,c*(start+reach),s*(start+reach),`rgba(${ink.dark.transferNib},${alpha*.72})`,.5);
    }
  }
  ctx.restore();
}
// A pointing hand cut with a few strokes, as printed in the margin of a seventeenth-century book.
// `dir` is +1 for a hand pointing right, -1 for one pointing left.
function manicule(x,y,dir,size,rgb,alpha){
  ctx.save();ctx.translate(x,y);ctx.scale(dir*size,size);
  ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=.85/size;
  ctx.beginPath();ctx.moveTo(-1,-.5);ctx.lineTo(-.66,-.6);ctx.lineTo(-.66,.6);ctx.lineTo(-1,.5);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-.62,-.52);
  ctx.bezierCurveTo(-.2,-.6,-.02,-.42,.18,-.34);
  ctx.lineTo(.92,-.26);ctx.bezierCurveTo(1.16,-.2,1.16,-.02,.9,.02);
  ctx.lineTo(.2,.06);ctx.bezierCurveTo(.42,.3,.24,.62,-.16,.6);
  ctx.lineTo(-.62,.56);ctx.closePath();ctx.stroke();
  ctx.lineWidth=.5/size;
  ctx.beginPath();ctx.moveTo(-.1,.1);ctx.lineTo(.16,.13);ctx.moveTo(-.14,.3);ctx.lineTo(.1,.32);ctx.stroke();
  ctx.restore();
}
function drawEffects(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];if(world.state!=='paused'){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*1.5);p.vy*=Math.exp(-dt*1.5);}
    if(p.life<=0){particles.splice(i,1);continue;}
    const alpha=clamp(p.life/p.max,0,1),rgb=p.color==='red'?ink.dark.burstRed:p.color==='blue'?ink.dark.burstBlue:p.color==='violet'?ink.dark.burstViolet:ink.dark.burstGold;
    line(sx(p.x),sy(p.y),sx(p.x-p.vx*.025),sy(p.y-p.vy*.025),`rgba(${rgb},${alpha})`,p.size*scale);
  }
  for(let i=rings.length-1;i>=0;i--){
    const r=rings[i];if(world.state!=='paused')r.age+=dt;if(r.age>r.life){rings.splice(i,1);continue;}
    const t=r.age/r.life;
    if(r.kind==='capture'){drawTransferMark(r,t);continue;}
    if(r.kind==='blot'){
      // A bead of ink pools at the release point, then dries lighter as it soaks in.
      const grow=reducedMotion?1:clamp(t*6,.25,1),dry=clamp((t-.15)/.85,0,1),alpha=r.alpha*clamp(1-t*t,0,1);
      ctx.save();ctx.translate(sx(r.x),sy(r.y));ctx.scale(scale,scale);
      const pen=trailInk(),rgb=mixRgb(pen.blotWet,pen.blotDry,dry),size=r.size*grow;
      landContour(ctx,0,0,size,size*.84,seeded(r.seed));
      ctx.fillStyle=`rgba(${rgb},${alpha*.8})`;ctx.fill();
      ctx.strokeStyle=`rgba(${rgb},${alpha*.55})`;ctx.lineWidth=.45;ctx.stroke();
      ctx.restore();continue;
    }
    burinArc(ctx,sx(r.x),sy(r.y),(r.start+(reducedMotion?0:t*r.distance))*scale,0,TAU,ink.dark.ringSimple,(1-t)*r.alpha,.8,r.seed||7,{segments:20,skips:2});
  }
  // Scores are written up as marginal notes in Fell italic beside the play field, each with a small
  // engraved manicule pointing back in at the event. They drift up gently and fade, as before.
  for(let i=floaters.length-1;i>=0;i--){
    const f=floaters[i];if(world.state!=='paused')f.age+=dt;if(f.age>1.15){floaters.splice(i,1);continue;}
    const alpha=Math.min(1,f.age*8)*clamp((1.15-f.age)*3,0,1);
    const inner=frameBand()*.92+7,left=sx(f.x)<W*.5,hand=Math.max(4.5,6*scale);
    const y=clamp(sy(f.y)-(reducedMotion?0:f.age*22*scale),hudBand()+16,H-inner-14);
    const x=left?inner+hand*2.4:W-inner-hand*2.4;
    ctx.save();ctx.fillStyle=`rgba(${ink.dark.floaterText},${alpha})`;
    ctx.font=`italic ${Math.max(11,13*scale)}px 'IM Fell English',Georgia,serif`;ctx.textAlign=left?'left':'right';
    ctx.fillText(f.text,x,y);
    manicule(x+(left?-hand*1.5:hand*1.5),y-hand*.62,left?1:-1,hand,ink.dark.floaterText,alpha*.85);
    ctx.restore();
  }
}
