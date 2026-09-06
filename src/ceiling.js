'use strict';
/* Orbit · Era III · The Ceiling
   A playable, render-only reconstruction grounded in Senenmut's astronomical ceiling (TT353).

   Historical boundary:
   - TT353 supplies the light lime-plaster ground, fine black drawing, red setting-out, two-register
     organisation, decan columns, five-point star signs and twelve 24-part month circles.
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
const CEILING_HIERO="'Noto Egyptian Hieroglyphs','Segoe UI Historic',serif";
const CEILING_G={a:0x1313f,w:0x13171,n:0x13216,r:0x1308b,t:0x133cf,s:0x132f4,h:0x13254,
  eye:0x13079,sun:0x131f3,feather:0x13184,star:0x131f4};
const CEILING_HOURS=['FIRST WATCH','SECOND WATCH','MIDDLE WATCH','BEFORE DAWN'];
let ceilingWall=null,ceilingWallKey='';

function invalidateCeilingArt(){ceilingWall=null;ceilingWallKey='';}
function ceilingHash(a,b=0){
  let h=Math.imul(((a*1009+b*9176)|0)^0x9e3779b9,2654435761);h^=h>>>15;h=Math.imul(h,2246822519);h^=h>>>13;
  return(h>>>0)/4294967296;
}
function ceilingArcPoints(cx,cy,r,a0,a1,count=24){
  const out=[];for(let i=0;i<=count;i++){const a=lerp(a0,a1,i/count);out.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return out;
}
function ceilingBrush(g,points,color=CEILING_PALETTE.carbon,width=1,alpha=1,seed=1){
  if(!points||points.length<2||alpha<=0)return;
  g.save();g.strokeStyle=color;g.globalAlpha=alpha;g.lineCap='round';g.lineJoin='round';g.lineWidth=width;
  g.beginPath();
  for(let i=0;i<points.length;i++){
    const p=points[i],j=(ceilingHash(seed+i*13,p[0]+p[1])-.5)*Math.min(.7,width*.24);
    if(i)g.lineTo(p[0]+j,p[1]-j*.45);else g.moveTo(p[0]+j,p[1]-j*.45);
  }
  g.stroke();
  if(width>1.2){
    g.globalAlpha=alpha*.18;g.lineWidth=Math.max(.35,width*.25);g.translate(.65,-.45);g.stroke();
  }
  g.restore();
}
function ceilingPolygon(g,points,fill,stage=1,seed=1,width=1.2){
  if(!points.length||stage<=0)return;
  const s1=clamp(stage*4,0,1),s2=clamp((stage-.25)*4,0,1),s3=clamp((stage-.5)*4,0,1),s4=clamp((stage-.75)*4,0,1);
  const sketch=points.map((p,i)=>[p[0]+(ceilingHash(seed,i)-.5)*2.4+1.2,p[1]+(ceilingHash(i,seed)-.5)*2.2-1]);
  ceilingBrush(g,sketch.concat([sketch[0]]),CEILING_PALETTE.red,Math.max(.65,width*.72),(.14+.4*(1-s4))*s1,seed);
  if(s2>0)ceilingBrush(g,points.concat([points[0]]),CEILING_PALETTE.carbon,Math.max(.55,width*.72),.28*s2,seed+31);
  if(s3>0){
    g.save();g.globalAlpha=s3;g.fillStyle=fill;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.restore();
  }
  if(s4>0)ceilingBrush(g,points.concat([points[0]]),CEILING_PALETTE.carbon,width,.92*s4,seed+67);
}
function ceilingStar(g,cx,cy,r,fill=CEILING_PALETTE.yellow,stage=1,seed=1){
  const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.4:r;p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
  ceilingPolygon(g,p,fill,stage,seed,Math.max(.8,r*.12));
}
function ceilingMonthCircle(g,cx,cy,r,alpha=.72){
  g.save();g.globalAlpha=alpha;g.strokeStyle=CEILING_PALETTE.carbon;g.lineWidth=.65;
  g.beginPath();g.arc(cx,cy,r,0,TAU);g.stroke();g.beginPath();g.arc(cx,cy,r*.28,0,TAU);g.stroke();
  for(let i=0;i<24;i++){
    const a=i/24*TAU-Math.PI/2;
    g.beginPath();g.moveTo(cx+Math.cos(a)*r*.31,cy+Math.sin(a)*r*.31);g.lineTo(cx+Math.cos(a)*r*.94,cy+Math.sin(a)*r*.94);g.stroke();
  }
  g.fillStyle=CEILING_PALETTE.red;g.beginPath();g.arc(cx,cy,r*.16,0,TAU);g.fill();g.restore();
}
function ceilingGlyphColumn(g,x,y,size,count,seed,alpha=.36){
  const signs=[CEILING_G.n,CEILING_G.w,CEILING_G.t,CEILING_G.a,CEILING_G.r,CEILING_G.s,CEILING_G.h,CEILING_G.eye,CEILING_G.sun];
  g.save();g.globalAlpha=alpha;g.fillStyle=CEILING_PALETTE.carbon;g.font=size+'px '+CEILING_HIERO;g.textAlign='center';g.textBaseline='middle';
  g.strokeStyle=CEILING_PALETTE.carbon;g.lineWidth=.45;g.beginPath();g.moveTo(x-size*.68,y-size*.55);g.lineTo(x-size*.68,y+(count-.35)*size);g.stroke();
  for(let i=0;i<count;i++)g.fillText(String.fromCodePoint(signs[Math.floor(ceilingHash(seed,i)*signs.length)]),x,y+i*size);
  g.restore();
}
function ceilingPaintBull(g,x,y,s,alpha=.22){
  g.save();g.globalAlpha=alpha;g.fillStyle=CEILING_PALETTE.red;g.strokeStyle=CEILING_PALETTE.carbon;g.lineWidth=1;
  g.beginPath();g.ellipse(x,y,s*1.05,s*.42,0,0,TAU);g.fill();g.stroke();
  g.beginPath();g.moveTo(x+s*.86,y-s*.18);g.lineTo(x+s*1.35,y-s*.42);g.lineTo(x+s*1.5,y-s*.18);g.lineTo(x+s*1.33,y+s*.04);g.closePath();g.fill();g.stroke();
  for(const dx of [-.68,-.25,.38,.72])ceilingBrush(g,[[x+dx*s,y+s*.24],[x+dx*s,y+s*.93]],CEILING_PALETTE.carbon,1,.85,dx*100+19);
  ceilingBrush(g,[[x+s*1.43,y-s*.35],[x+s*1.62,y-s*.65]],CEILING_PALETTE.carbon,1,.8,31);
  ceilingBrush(g,[[x+s*1.43,y-s*.35],[x+s*1.72,y-s*.25]],CEILING_PALETTE.carbon,1,.8,37);g.restore();
}
function ceilingPaintHippo(g,x,y,s,alpha=.2){
  g.save();g.globalAlpha=alpha;g.fillStyle=CEILING_PALETTE.blue;g.strokeStyle=CEILING_PALETTE.carbon;g.lineWidth=1;
  g.beginPath();g.ellipse(x,y,s*1.05,s*.52,0,0,TAU);g.fill();g.stroke();
  g.beginPath();g.ellipse(x+s*.92,y-s*.05,s*.44,s*.34,0,0,TAU);g.fill();g.stroke();
  for(const dx of [-.62,-.18,.42,.72])ceilingBrush(g,[[x+dx*s,y+s*.3],[x+dx*s,y+s*.9]],CEILING_PALETTE.carbon,1,.85,dx*91+41);
  ceilingBrush(g,[[x+s*1.18,y-s*.22],[x+s*1.75,y-s*1.5]],CEILING_PALETTE.carbon,1.2,.85,53);g.restore();
}
function ceilingBuildWall(){
  const key=W+'x'+H+'x'+DPR;if(ceilingWall&&ceilingWallKey===key)return ceilingWall;
  const c=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(H*DPR))),g=c.getContext('2d');g.scale(DPR,DPR);
  g.fillStyle=CEILING_PALETTE.plaster;g.fillRect(0,0,W,H);
  // The wall's texture is material, not pictorial modelling: broad lime patches, worn pits and hairline cracks.
  const rng=seeded(14731458);
  for(let i=0;i<180;i++){
    const x=rng()*W,y=rng()*H,rx=8+rng()*70,ry=2+rng()*16;
    g.fillStyle=rng()>.48?'rgba(238,228,205,.08)':'rgba(102,78,49,.045)';g.beginPath();g.ellipse(x,y,rx,ry,(rng()-.5)*.3,0,TAU);g.fill();
  }
  for(let i=0;i<Math.min(1400,Math.floor(W*H/420));i++){
    const x=rng()*W,y=rng()*H,a=.05+rng()*.08;g.fillStyle=rng()>.55?`rgba(250,243,222,${a})`:`rgba(73,54,34,${a})`;g.fillRect(x,y,.6+rng()*.8,.6+rng()*.8);
  }
  for(let i=0;i<20;i++){
    let x=rng()*W,y=rng()*H;const pts=[[x,y]];for(let j=0;j<3+Math.floor(rng()*4);j++){x+=(rng()-.5)*24;y+=4+rng()*17;pts.push([x,y]);}
    ceilingBrush(g,pts,CEILING_PALETTE.loss,.45,.17,100+i);
  }
  const inset=Math.max(10,Math.min(17,W*.03));
  g.strokeStyle='rgba(36,29,22,.56)';g.lineWidth=1.1;g.strokeRect(inset,inset,W-inset*2,H-inset*2);
  g.strokeStyle='rgba(157,55,36,.36)';g.lineWidth=.7;g.strokeRect(inset+4,inset+4,W-inset*2-8,H-inset*2-8);
  // Five-point star signs make the architectural border of the original ceiling.
  const gap=Math.max(19,Math.min(27,W/18));
  for(let x=inset+gap;x<W-inset-gap*.3;x+=gap){ceilingStar(g,x,inset+7,2.5,CEILING_PALETTE.carbon,1,Math.round(x));ceilingStar(g,x,H-inset-7,2.5,CEILING_PALETTE.carbon,1,Math.round(x)+5);}
  for(let y=inset+gap;y<H-inset-gap*.3;y+=gap){ceilingStar(g,inset+7,y,2.5,CEILING_PALETTE.carbon,1,Math.round(y)+11);ceilingStar(g,W-inset-7,y,2.5,CEILING_PALETTE.carbon,1,Math.round(y)+17);}
  // TT353 is organised as two fields separated by a broad band of inscriptions.
  const divide=H*.50,band=Math.max(18,Math.min(27,H*.035));
  g.fillStyle='rgba(238,228,205,.38)';g.fillRect(inset+9,divide-band*.5,W-inset*2-18,band);
  for(let k=-2;k<=2;k++)ceilingBrush(g,[[inset+10,divide+k*band*.18],[W-inset-10,divide+k*band*.18]],k===0?CEILING_PALETTE.red:CEILING_PALETTE.carbon,k===0?.7:.55,k===0?.26:.24,211+k);
  // The twelve month circles stay grouped when there is room; on a narrow sheet they flank the route.
  if(W>=700){
    const r=Math.min(19,H*.025),x0=inset+42,y0=divide+band+34;
    for(let i=0;i<12;i++)ceilingMonthCircle(g,x0+(i%3)*r*2.35,y0+Math.floor(i/3)*r*2.35,r,.38);
    for(let i=0;i<5;i++)ceilingGlyphColumn(g,W-inset-32-i*24,divide+band+27,16,Math.max(5,Math.floor((H-divide-band-60)/17)),300+i,.27);
    ceilingPaintHippo(g,W-inset-175,divide-band-28,19,.18);ceilingPaintBull(g,W-inset-92,divide-band-30,17,.18);
  }else{
    const r=Math.max(9,Math.min(13,W*.027)),top=hudBand()+22,span=Math.max(r*2.35,(H-top-footerBand()-18)/6);
    for(let i=0;i<6;i++){const y=top+i*span;ceilingMonthCircle(g,inset+20,y,r,.27);ceilingMonthCircle(g,W-inset-20,y,r,.27);}
  }
  // Vertical decan-name columns: real sign forms, treated as uncited fragments rather than invented prose.
  const columns=W>=700?4:2,sz=W>=700?15:12;
  for(let i=0;i<columns;i++){
    const side=i%2?-1:1,x=side>0?inset+48+Math.floor(i/2)*22:W-inset-48-Math.floor(i/2)*22;
    ceilingGlyphColumn(g,x,hudBand()+22,sz,Math.max(5,Math.floor((divide-hudBand()-52)/sz)),430+i,.2);
  }
  ceilingWall=c;ceilingWallKey=key;return c;
}

function ceilingDrawRegisterGrid(){
  const step=207*scale,start=Math.floor((world.cameraY-80)/207)*207;
  ctx.save();ctx.strokeStyle='rgba(36,29,22,.09)';ctx.lineWidth=.55;
  for(let wy=start;wy<world.cameraY+world.height+207;wy+=207){const y=sy(wy);ctx.beginPath();ctx.moveTo(22,y);ctx.lineTo(W-22,y);ctx.stroke();}
  ctx.restore();
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
    if(y>-20&&y<H+20){ctx.globalAlpha=alpha+.14;ctx.fillStyle=CEILING_PALETTE.carbon;ctx.font=Math.max(11,13*scale)+'px '+CEILING_HIERO;ctx.textAlign='center';ctx.fillText(String.fromCodePoint(CEILING_G.star,CEILING_G.n,CEILING_G.t),x,y);ctx.globalAlpha=1;}
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
  if(red>0){ctx.strokeStyle='rgba(157,55,36,.42)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(1.2,-1,r,start,start+TAU*red);ctx.stroke();}
  if(correct>0){ctx.strokeStyle=`rgba(36,29,22,${retired?.16:.42})`;ctx.lineWidth=active?1.45:1;ctx.beginPath();ctx.arc(0,0,r,start,start+TAU*correct);ctx.stroke();}
  if(finish>0){
    ctx.strokeStyle=`rgba(36,29,22,${retired?.16:active?.68:.38})`;ctx.lineWidth=active?1.45:1;
    for(let i=0;i<24;i++){const a=i/24*TAU;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.72,Math.sin(a)*r*.72);ctx.lineTo(Math.cos(a)*r*.94,Math.sin(a)*r*.94);ctx.stroke();}
    ctx.beginPath();ctx.arc(0,0,r*.7,0,TAU);ctx.stroke();
  }
  if(target||active){ctx.strokeStyle=target?'rgba(40,89,135,.72)':'rgba(196,147,46,.64)';ctx.lineWidth=1.2;ctx.setLineDash([3.5*scale,3*scale]);ctx.beginPath();ctx.arc(0,0,cap,0,TAU);ctx.stroke();ctx.setLineDash([]);}
  ceilingNodeIcon(n,r,t);
  if(retired&&finish>0)ceilingBrush(ctx,[[-r*.7,r*.48],[r*.7,-r*.48]],CEILING_PALETTE.red,.7,.22,700+n.id);
  if(n.difficultyChoice&&t>.6){
    const labels={relaxed:'TIRO',classic:'ADEPTUS',hardcore:'MAGISTER'};ctx.globalAlpha=clamp((t-.6)/.4,0,1);ctx.font=Math.max(8,9.5*scale)+'px Georgia,serif';ctx.fillStyle=CEILING_PALETTE.gloss;ctx.textAlign='center';ctx.fillText(labels[n.difficultyChoice],0,r+15*scale);
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
  const r=h.r*scale,field=gravityRadius(h)*scale;
  ctx.save();ctx.translate(sx(h.x),sy(h.y));
  ctx.strokeStyle='rgba(157,55,36,.2)';ctx.lineWidth=.7;for(const k of [.48,.72,1]){ctx.beginPath();ctx.ellipse(0,0,field*k,field*k*.62,0,0,TAU);ctx.stroke();}
  const points=[];for(let i=0;i<=52;i++){const u=i/52,a=u*TAU*1.7+(h.phase||0),rr=r*(.12+.78*u);points.push([Math.cos(a)*rr,Math.sin(a)*rr*.62]);}
  ceilingBrush(ctx,points,CEILING_PALETTE.carbon,Math.max(3,r*.24),.92*t,h.seed);
  ceilingBrush(ctx,points,CEILING_PALETTE.redDark,Math.max(1.5,r*.14),.92*t,h.seed+7);
  const p=points.at(-1),q=points.at(-3),a=Math.atan2(p[1]-q[1],p[0]-q[0]);ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(a);
  ceilingPolygon(ctx,[[0,-r*.12],[r*.32,0],[0,r*.12]],CEILING_PALETTE.red,t,h.seed+13,1);ctx.restore();ctx.restore();
}
function ceilingDrawEye(h,t){
  const r=h.r*scale,field=gravityRadius(h)*scale;ctx.save();ctx.translate(sx(h.x),sy(h.y));
  for(let i=0;i<12;i++){const a=i/12*TAU+(h.phase||0)*.08,from=r*.68,to=field*.78;ceilingBrush(ctx,[[Math.cos(a)*from,Math.sin(a)*from],[Math.cos(a+.08)*to,Math.sin(a+.08)*to]],CEILING_PALETTE.red,.9,.38*t,h.seed+i);}
  ctx.globalAlpha=t;ctx.fillStyle=CEILING_PALETTE.yellow;ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,r*.68,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle=CEILING_PALETTE.redDark;ctx.beginPath();ctx.arc(0,0,r*.33,0,TAU);ctx.fill();
  ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-r*.35,0);ctx.quadraticCurveTo(0,-r*.25,r*.35,0);ctx.quadraticCurveTo(0,r*.24,-r*.35,0);ctx.stroke();ctx.restore();
}
function ceilingDrawShu(h,t){
  const r=h.r*scale,field=gravityRadius(h)*scale,dir=Number.isFinite(h.dir)?h.dir:0;ctx.save();ctx.translate(sx(h.x),sy(h.y));
  ctx.save();ctx.rotate(dir);for(const side of [-.55,0,.55]){const y=side*r*.68;ceilingBrush(ctx,[[-field*.8,y],[field*.8,y]],CEILING_PALETTE.blue,.9,.3*t,h.seed+side*20);for(let x=-field*.55;x<field*.7;x+=field*.36)ceilingBrush(ctx,[[x,y-2],[x+6*scale,y],[x,y+2]],CEILING_PALETTE.blue,.7,.28*t,h.seed+x);}ctx.restore();
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
  ctx.save();ctx.globalAlpha=.78*t;ctx.beginPath();ctx.ellipse(x,y,r*1.02,r*.82,0,0,TAU);ctx.clip();ctx.fillStyle='rgba(221,207,173,.82)';ctx.fillRect(x-r,y-r,r*2,r*2);
  for(let i=-5;i<=5;i++){const yy=y+i*r*.16,pts=[];for(let px=x-r*1.1,k=0;px<=x+r*1.15;px+=r*.12,k++)pts.push([px,yy+(k%2?-r*.045:r*.045)]);ceilingBrush(ctx,pts,CEILING_PALETTE.blue,Math.max(.8,r*.055),.62,g.seed+i);}
  ctx.restore();ctx.save();ctx.globalAlpha=.32*t;ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(x,y,r*1.02,r*.82,0,0,TAU);ctx.stroke();ctx.restore();
}
function ceilingDrawPlayer(){
  if(world.state==='dead')return;const p=world.player,x=sx(p.x),y=sy(p.y),angle=Math.atan2(p.vy,p.vx),s=Math.max(.72,scale);
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(s,s);
  // A single flat night barque: no exhaust, glow, modelled hull or banking.
  const hull=[[-20,3],[20,3],[27,-5],[16,-1],[-16,-1],[-27,-5]];ceilingPolygon(ctx,hull,CEILING_PALETTE.yellow,1,913,1.5);
  ceilingBrush(ctx,[[-10,-1],[-10,-12]],CEILING_PALETTE.carbon,1.3,.9,919);
  ctx.fillStyle=CEILING_PALETTE.red;ctx.strokeStyle=CEILING_PALETTE.carbon;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(4,-10,6,0,TAU);ctx.fill();ctx.stroke();
  ceilingBrush(ctx,[[4,-16],[7,-20]],CEILING_PALETTE.carbon,1,.85,923);
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
    if(q.kind==='blot'||q.kind==='splat'){ctx.fillStyle=`rgba(157,55,36,${(1-t)*.42})`;ctx.beginPath();ctx.ellipse(x,y,(q.size||6)*scale,(q.size||6)*scale*.68,0,0,TAU);ctx.fill();continue;}
    const r=(q.start+(reducedMotion?0:t*q.distance))*scale;ctx.strokeStyle=`rgba(${q.perfect?'40,89,135':'157,55,36'},${(1-t)*(q.alpha||.5)})`;ctx.lineWidth=.9;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
  }
  for(let i=floaters.length-1;i>=0;i--){
    const f=floaters[i];if(world.state!=='paused')f.age+=dt;if(f.age>1.15){floaters.splice(i,1);continue;}const a=Math.min(1,f.age*8)*clamp((1.15-f.age)*3,0,1);
    ctx.save();ctx.globalAlpha=a;ctx.fillStyle=CEILING_PALETTE.red;ctx.font=Math.max(10,12*scale)+'px Georgia,serif';ctx.textAlign='center';ctx.fillText(f.text,sx(f.x),sy(f.y)-f.age*18*scale);ctx.restore();
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
  ctx.save();ctx.textAlign='center';ctx.fillStyle=CEILING_PALETTE.carbon;ctx.globalAlpha=.72;ctx.font=Math.max(10,11*scale)+'px Georgia,serif';ctx.fillText('HOUR '+numerals[index]+'  ·  '+CEILING_HOURS[index],W*.5,y);ctx.restore();
  if(chapterReveal.age<2.35&&world.state==='playing'){
    if(world.state!=='paused')chapterReveal.age+=dt;const a=Math.sin(clamp(chapterReveal.age/2.35,0,1)*Math.PI),cy=H*.5;
    ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.fillStyle='rgba(221,207,173,.9)';ctx.fillRect(W*.18,cy-34,W*.64,68);
    ctx.fillStyle=CEILING_PALETTE.red;ctx.font='24px '+CEILING_HIERO;ctx.fillText(String.fromCodePoint(CEILING_G.w,CEILING_G.n,CEILING_G.w,CEILING_G.t),W*.5,cy-5);
    ctx.fillStyle=CEILING_PALETTE.carbon;ctx.font='11px Georgia,serif';ctx.fillText('HOUR '+numerals[index]+' · '+CEILING_HOURS[index],W*.5,cy+20);ctx.restore();
  }
}
function renderCeiling(dt,aim){
  reveal.prime();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);ctx.drawImage(ceilingBuildWall(),0,0,W,H);
  ceilingDrawRegisterGrid();
  ctx.save();if(!reducedMotion&&world.shake>.08)ctx.translate(Math.sin(world.time*109)*world.shake*scale,Math.cos(world.time*137)*world.shake*.65*scale);
  ceilingDrawRoute();ceilingDrawDecanCharts();for(const n of world.nodes)ceilingDrawNode(n,aim);for(const h of world.hazards)ceilingDrawHazard(h);
  ceilingDrawAim(aim);for(const g of world.nebulas)ceilingDrawNun(g);ceilingDrawEffects(dt);drawInscriptions(dt);ceilingDrawPlayer();ceilingDrawDark(dt);ctx.restore();
  ceilingDrawRunningHead(dt);
  if(screenFlash>0){ctx.fillStyle=`rgba(157,55,36,${screenFlash*.055})`;ctx.fillRect(0,0,W,H);if(world.state!=='paused')screenFlash=Math.max(0,screenFlash-dt*3);}
}
