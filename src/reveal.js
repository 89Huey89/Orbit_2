'use strict';
/* Orbit · src/reveal.js
   The living pen: every mark on the chart is drawn on as the traveller reaches it. */
// ---------- The living pen: reveal state, the nib, and the masks each kind of mark is drawn through ----------
// A render-side map of birth times keyed by element identity (a node, a hazard, a chart, or a named
// singleton such as 'frame'), each with a duration. `reveal.progress(key,duration)` registers a key the
// first time it is asked for and returns 0..1 from then on; it reads `world.time`, so a pause freezes the
// pen mid-stroke and reduced motion returns 1 immediately. The simulation never learns any of this exists:
// capture, release and aim are computed from the world alone, whether or not a mark has finished drawing.
definePlate('reveal',{
  night:{nib:'242,232,205',bead:'250,242,216',dry:'209,190,146',spatter:'232,220,186',
    strike:'214,197,155',washRim:'34,32,26',blot:'6,10,17',rule:'226,213,178'},
  paper:{nib:'34,24,16',bead:'22,15,8',dry:'58,42,28',spatter:'58,42,28',
    strike:'58,42,28',washRim:'26,18,11',blot:'23,15,8',rule:'34,24,16'}
});
// How long each kind of mark takes, and how far above the top of the view the cartographer works ahead.
const REVEAL_MARGIN=-24,REVEAL_CAP=3;
const NODE_REVEAL=1.25,HAZARD_REVEAL=1.1,CHART_REVEAL=1.4;
const reveal=(function(){
  const born=new Map(),drawing=new Set();
  let runs=-1,lastScratch=-9;
  const clock=()=>world?world.time:0;
  // Finished marks are kept so nothing is ever drawn twice, but the map cannot grow without bound.
  function prune(){
    if(born.size<=360)return;
    for(const key of born.keys()){if(!drawing.has(key)){born.delete(key);if(born.size<=280)break;}}
  }
  function scratch(){
    // One very quiet scratch of the nib as a stroke starts. Never while muted, never off the run.
    if(reducedMotion||!world||world.state!=='playing')return;
    const at=clock();if(at-lastScratch<.11)return;lastScratch=at;
    audio.brush(2100+((born.size*173)%700),.035);
  }
  return {
    get runs(){return runs;},
    reset(){born.clear();drawing.clear();runs++;lastScratch=-9;},
    // 0..1 for a key, registering it on first sight. While three other marks are still being drawn a new
    // one waits at 0, unless it is urgent — anything already inside the view draws at once, so a mark can
    // never be invisible where it matters.
    progress(key,duration,urgent){
      if(reducedMotion)return 1;
      let mark=born.get(key);
      if(!mark){
        if(!urgent&&drawing.size>=REVEAL_CAP)return 0;
        mark={birth:clock(),span:Math.max(.001,duration||NODE_REVEAL)};
        born.set(key,mark);drawing.add(key);prune();scratch();
      }
      const t=(clock()-mark.birth)/mark.span;
      if(t>=1){drawing.delete(key);return 1;}
      return t>0?t:0;
    },
    // Seconds since a mark was begun, or -1 when it has never been asked for.
    age(key){
      if(reducedMotion)return Infinity;
      const mark=born.get(key);return mark?clock()-mark.birth:-1;
    },
    // Progress without registering: -1 for a mark the pen has not started. Used by the connection lines,
    // which follow whichever node is being drawn, and by the tests.
    peek(key){
      if(reducedMotion)return 1;
      const mark=born.get(key);if(!mark)return -1;
      return clamp((clock()-mark.birth)/mark.span,0,1);
    },
    report(){return {marks:born.size,drawing:drawing.size};},
    // The cartographer works in view: a mark starts once it has entered the top of the sheet by a small
    // margin, nearest first, so the drawing is seen. The view keeps the traveller far enough below its top
    // that the next ring closes before a full-speed flight can reach it.
    prime(){
      if(reducedMotion||!world)return;
      const top=world.cameraY-REVEAL_MARGIN,bottom=world.cameraY+world.height+80,inView=world.cameraY+world.height*.45;
      primeList.length=0;
      for(const n of world.nodes)if(n.y>top&&n.y<bottom)primeList.push(n.y,n,NODE_REVEAL);
      for(const h of world.hazards)if(h.y>top&&h.y<bottom)primeList.push(h.y,h,HAZARD_REVEAL);
      for(const g of world.nebulas)if(g.y>top&&g.y<bottom)primeList.push(g.y,g,HAZARD_REVEAL);
      for(const c of world.constellations){
        const anchor=c.stars.length?c.stars[0]:c.entry;
        if(anchor&&anchor.y>top&&anchor.y<bottom)primeList.push(anchor.y,c,CHART_REVEAL);
      }
      // Lowest on the sheet first: those marks are the nearest, and the ones already finished free a slot.
      for(let i=0;i<primeList.length;i+=3){
        for(let j=i+3;j<primeList.length;j+=3){
          if(primeList[j]>primeList[i]){
            for(let k=0;k<3;k++){const swap=primeList[i+k];primeList[i+k]=primeList[j+k];primeList[j+k]=swap;}
          }
        }
      }
      for(let i=0;i<primeList.length;i+=3)this.progress(primeList[i+1],primeList[i+2],primeList[i]>inView);
    }
  };
})();
const primeList=[];
// Fraction of a reveal spent inside one stage of it.
const revealSpan=(t,from,to)=>clamp((t-from)/(to-from),0,1);
// One shared record, refilled per node per frame: reveal state must not allocate while the chart moves.
const NODE_PEN={t:1,done:true,age:Infinity,ring:1,keyline:1,hatch:1,wash:1,survey:1};
// The colourist's order for one planet and its orbit: the ring first (finished at 0.6 s), the keyline cut
// around the disc, the hatching laid in, the wash bloomed, the survey marks and rings last, the caption
// after the ring is closed.
function revealNode(n){
  const t=reveal.progress(n,NODE_REVEAL);
  NODE_PEN.t=t;NODE_PEN.done=t>=1;
  if(t>=1){NODE_PEN.age=Infinity;NODE_PEN.ring=NODE_PEN.keyline=NODE_PEN.hatch=NODE_PEN.wash=NODE_PEN.survey=1;return NODE_PEN;}
  NODE_PEN.age=reveal.age(n);
  NODE_PEN.ring=revealSpan(t,0,.6);
  NODE_PEN.keyline=revealSpan(t,.06,.44);
  NODE_PEN.hatch=revealSpan(t,.3,.64);
  NODE_PEN.wash=revealSpan(t,.38,.84);
  NODE_PEN.survey=revealSpan(t,.6,.92);
  return NODE_PEN;
}
// A caption is written after its ring closes, a glyph every 40 ms.
function revealLabel(pen,text){
  if(pen.done||pen.age===Infinity)return 1;
  return clamp((pen.age-.62)/Math.max(.04,text.length*.04),0,1);
}
// ---------- The nib itself ----------
// A small dark wedge on a hairline shaft rides the leading end of whichever stroke is being drawn, with a
// bead of wet ink under the point and the occasional fleck of spatter. The flecks are seeded from the nib's
// own position so they sit still on the page instead of boiling, and reduced motion has none of it.
function penNib(x,y,angle,alpha=1,rgb){
  if(reducedMotion||alpha<=.02)return;
  const c=ink.reveal,tone=rgb||c.nib,reach=Math.max(6,7*scale);
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.fillStyle=`rgba(${c.bead},${.5*alpha})`;
  ctx.beginPath();ctx.ellipse(0,0,reach*.26,reach*.19,0,0,TAU);ctx.fill();
  ctx.fillStyle=`rgba(${tone},${.9*alpha})`;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-reach*.66,-reach*.28);ctx.lineTo(-reach*.44,0);ctx.lineTo(-reach*.66,reach*.28);ctx.closePath();ctx.fill();
  ctx.strokeStyle=`rgba(${tone},${.45*alpha})`;ctx.lineWidth=.6;
  ctx.beginPath();ctx.moveTo(-reach*.5,0);ctx.lineTo(-reach*1.9,-reach*.42);ctx.stroke();
  ctx.restore();
  const grid=(Math.floor(x/7)*73856093^Math.floor(y/7)*19349663)>>>0;
  if((grid&7)===0){
    ctx.fillStyle=`rgba(${c.spatter},${.3*alpha})`;
    for(let i=0;i<2;i++){
      const a=((grid>>>(3+i*5))&31)/32*TAU,d=reach*(.7+((grid>>>(8+i*5))&15)/15);
      ctx.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d,.8,.8);
    }
  }
}
// A bead of wet ink at the end of a stroke, drying back to the line's own colour behind the point.
function penBead(x,y,angle,size,alpha=1){
  const c=ink.reveal;
  ctx.save();ctx.fillStyle=`rgba(${c.bead},${.7*alpha})`;
  ctx.beginPath();ctx.ellipse(x,y,size*1.25,size*.85,angle,0,TAU);ctx.fill();
  ctx.fillStyle=`rgba(${c.dry},${.35*alpha})`;
  ctx.beginPath();ctx.ellipse(x-Math.cos(angle)*size*1.4,y-Math.sin(angle)*size*1.4,size*.8,size*.62,angle,0,TAU);ctx.fill();
  ctx.restore();
}
// ---------- Orbit rings: a wedge from the ring's own start angle to the pen ----------
// The burin sprite is never touched. The ring, its capture band and its ticks are simply clipped to the
// wedge the pen has covered so far, so the ticks appear as it passes them.
function penWedgeBegin(pen,n,reach){
  if(pen.ring>=1)return false;
  ctx.save();
  ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,reach,n.phase,n.phase+TAU*pen.ring);ctx.closePath();ctx.clip();
  return true;
}
function penWedgeEnd(pen,n,r){
  ctx.restore();
  if(pen.ring<=0||pen.ring>=1)return;
  const a=n.phase+TAU*pen.ring,x=Math.cos(a)*r,y=Math.sin(a)*r;
  ctx.save();ctx.globalAlpha=1;
  penBead(x,y,a+Math.PI/2,1.5*scale,.9);
  penNib(x,y,a+Math.PI/2,.9);
  ctx.restore();
}
// ---------- Planets: the stages a colourist works in ----------
// Each stage composites the cached glyph layers through a mask; when the reveal finishes the finished
// composite is drawn exactly as before, at no extra cost.
function revealPlanet(art,r,time,pen,seed){
  if(!pen||pen.done){drawPlanet(art,r,time);return;}
  const core=art.core,angle=art.tilt+(reducedMotion?0:time*art.spin);
  ctx.save();ctx.scale(r/60,r/60);
  // (d) The survey arcs and the far half of a ring system are the last marks laid down.
  if(pen.survey>0){ctx.save();ctx.globalAlpha*=pen.survey;ctx.drawImage(art.back,-72,-72,144,144);ctx.restore();}
  // (c) The wash blooms as an irregular blot from a seeded point off the centre, its wet rim drying lighter
  // over the last third of the stage.
  if(pen.wash>0){
    const rng=seeded((seed^0x9e3779)>>>0||1),ox=(rng()-.5)*core*.8,oy=(rng()-.5)*core*.8;
    const grow=core*2.2*pen.wash,dry=revealSpan(pen.wash,.66,1);
    ctx.save();
    ctx.beginPath();ctx.arc(0,0,core,0,TAU);ctx.clip();
    landContour(ctx,ox,oy,grow,grow*.88,rng);
    ctx.save();ctx.clip();ctx.rotate(angle);ctx.drawImage(art.surface,-40,-40,80,80);ctx.restore();
    ctx.strokeStyle=`rgba(${ink.reveal.washRim},${.42*(1-dry)+.06})`;ctx.lineWidth=1.2;ctx.stroke();
    ctx.restore();
  }
  // (a) The keyline is cut around the disc by angle.
  if(pen.keyline>0){
    const a0=art.phase,a1=a0+TAU*pen.keyline;
    ctx.save();ctx.beginPath();
    ctx.arc(0,0,core*1.34,a0,a1);ctx.arc(0,0,core*.78,a1,a0,true);ctx.closePath();ctx.clip();
    ctx.drawImage(art.front,-72,-72,144,144);ctx.restore();
  }
  // (b) The hatching is revealed by a band travelling across the disc along the direction of the strokes.
  if(pen.hatch>0){
    ctx.save();
    ctx.beginPath();ctx.arc(0,0,core*1.5,0,TAU);ctx.clip();
    ctx.beginPath();ctx.rect(-core*1.7,-core*1.7,core*3.4*pen.hatch,core*3.4);ctx.clip();
    ctx.drawImage(art.front,-72,-72,144,144);ctx.restore();
  }
  ctx.restore();
}
// ---------- Retiring marks ----------
// A used orbit is not simply dimmed: the pen strikes it through with one diagonal hairline over 300 ms,
// and the ring then dries to a hairline behind it.
function revealRetire(n){return reveal.progress('struck:'+n.id,.3,true);}
function penStrike(n,r,t,rgb){
  if(t<=0)return;
  const a=((n.seed>>>2)&1?1:-1)*.72,reach=(r+7*scale),dx=Math.cos(a),dy=Math.sin(a);
  const x0=-dx*reach,y0=-dy*reach,x1=x0+dx*reach*2*t,y1=y0+dy*reach*2*t;
  ctx.save();ctx.globalAlpha=1;
  ctx.strokeStyle=`rgba(${rgb||ink.reveal.strike},${lerp(.5,.22,t)})`;ctx.lineWidth=lerp(1.15,.45,t)*scale;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
  if(t<1){penBead(x1,y1,a,1.1*scale,.8);penNib(x1,y1,a,.85);}
  ctx.restore();
}
// ---------- Hazards: a drop of ink lands, spreads, darkens, and the rings are scratched in ----------
function revealHazard(h,draw){
  const t=reveal.progress(h,HAZARD_REVEAL,true);
  if(t>=1||reducedMotion){draw(h);return;}
  if(t<=0)return;
  const x=sx(h.x),y=sy(h.y),r=Math.max(4,h.r*scale);
  const drop=revealSpan(t,0,.52),cut=revealSpan(t,.42,1),rng=seeded((h.seed^0x2b17ac)>>>0||1);
  ctx.save();
  landContour(ctx,x,y,r*1.4*drop,r*1.3*drop,rng);
  if(cut>0){const a0=h.phase||0;ctx.moveTo(x,y);ctx.arc(x,y,r*4.4,a0,a0+TAU*cut);ctx.closePath();}
  ctx.clip();
  draw(h);
  ctx.restore();
  // The drop darkens at its centre while it is still spreading, with a wet rim around the edge.
  if(drop<1){
    ctx.save();
    landContour(ctx,x,y,r*1.4*drop,r*1.3*drop,seeded((h.seed^0x2b17ac)>>>0||1));
    ctx.fillStyle=`rgba(${ink.reveal.blot},${.34*(1-drop)})`;ctx.fill();
    ctx.strokeStyle=`rgba(${ink.reveal.washRim},${.4*(1-drop*.7)})`;ctx.lineWidth=1.3;ctx.stroke();
    ctx.restore();
  }
  if(cut>0&&cut<1){
    const a=(h.phase||0)+TAU*cut,rr=r*1.8;
    penNib(x+Math.cos(a)*rr,y+Math.sin(a)*rr,a+Math.PI/2,.8);
  }
}
// ---------- Cached rasters swept along their own axis ----------
// A constellation figure is a cached layer, so it is revealed with a directional clip that sweeps along the
// figure's dominant axis — the spine running through its three stars — rather than by touching the figure
// functions themselves. The chart's links, stars and captions follow the same sweep.
function chartSweep(chart,t){
  const s=chart.stars;if(s.length<3)return false;
  const ax=sx(s[0].x),ay=sy(s[0].y);
  let ux=sx(s[2].x)-ax,uy=sy(s[2].y)-ay;
  const len=Math.hypot(ux,uy)||1;ux/=len;uy/=len;
  const pad=110*scale,front=-pad+(len+pad*2)*t,big=(W+H)*1.4,nx=-uy,ny=ux;
  ctx.beginPath();
  ctx.moveTo(ax+ux*-big+nx*big,ay+uy*-big+ny*big);
  ctx.lineTo(ax+ux*front+nx*big,ay+uy*front+ny*big);
  ctx.lineTo(ax+ux*front-nx*big,ay+uy*front-ny*big);
  ctx.lineTo(ax+ux*-big-nx*big,ay+uy*-big-ny*big);
  ctx.closePath();ctx.clip();
  return {x:ax+ux*front,y:ay+uy*front,angle:Math.atan2(uy,ux)};
}
// Clips the caller's context to the swept part of a chart. The caller has already saved.
function revealChartClip(chart){
  const t=reveal.peek(chart);
  if(t<0){chartSweep(chart,0);return 0;}
  if(t>=1)return 1;
  chartSweep(chart,t);return t;
}
function revealFigure(chart,draw){
  const t=reveal.progress(chart,CHART_REVEAL);
  if(t>=1){draw(chart);return;}
  if(t<=0)return;
  ctx.save();
  const head=chartSweep(chart,t);
  draw(chart);
  ctx.restore();
  if(head)penNib(head.x,head.y,head.angle,.75);
}
// ---------- Route lines ----------
// The pricked line into a planet is drawn on as that planet is: everything above the pen's reach on the
// least advanced of the marks currently being drawn is held back.
function revealConnections(draw){
  if(reducedMotion||!world){draw();return;}
  let frontier=-1;
  for(const n of world.nodes){
    if(n.type==='gold')continue;
    const t=reveal.peek(n);
    if(t<0||t>=1)continue;
    let previous=null;
    for(const q of world.nodes){
      if(q.type==='gold'||q.row>=n.row)continue;
      if(!previous||q.row>previous.row)previous=q;
    }
    const reach=previous?lerp(sy(previous.y),sy(n.y),revealSpan(t,0,.7)):sy(n.y);
    if(reach>frontier)frontier=reach;
  }
  if(frontier<=0){draw();return;}
  if(frontier>=H)return;
  ctx.save();ctx.beginPath();ctx.rect(0,frontier,W,H-frontier);ctx.clip();
  draw();
  ctx.restore();
}
// ---------- The plate frame ----------
// Once per run: the double rule draws itself round by dash offset, the graduated ticks follow the pen
// around the perimeter, and the marginal ornaments come up last. A restart redraws it briskly.
function penDashRect(x,y,w,h,color,weight,t){
  if(t<=0||w<=0||h<=0)return;
  const length=(w+h)*2;
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=weight;
  ctx.setLineDash([length,length]);ctx.lineDashOffset=length*(1-t);
  ctx.strokeRect(x,y,w,h);ctx.restore();
}
function framePerimeterClip(t,depth){
  const perimeter=(W+H)*2,run=perimeter*t;
  ctx.beginPath();
  if(run>0)ctx.rect(0,0,Math.min(W,run),depth);
  if(run>W)ctx.rect(W-depth,0,depth,Math.min(H,run-W));
  if(run>W+H){const across=Math.min(W,run-W-H);ctx.rect(W-across,H-depth,across,depth);}
  if(run>W*2+H){const down=Math.min(H,run-W*2-H);ctx.rect(0,H-down,depth,down);}
  ctx.clip();
}
function penPerimeterPoint(t){
  const run=((W+H)*2)*t;
  if(run<=W)return {x:run,y:0,angle:0};
  if(run<=W+H)return {x:W,y:run-W,angle:Math.PI/2};
  if(run<=W*2+H)return {x:W-(run-W-H),y:H,angle:Math.PI};
  return {x:0,y:H-(run-W*2-H),angle:-Math.PI/2};
}
function revealFrame(layer){
  const t=reveal.progress('frame',reveal.runs>0?.5:1.4,true);
  if(t>=1){ctx.drawImage(layer,0,0,W,H);return 1;}
  const colors=ink.frame,band=frameBand(),wide=frameWide(),outer=band*.56,inner=band*.92;
  penDashRect(outer+.5,outer+.5,Math.max(1,W-outer*2-1),Math.max(1,H-outer*2-1),colors.rule,wide?1.4:1,revealSpan(t,0,.5));
  penDashRect(inner+.5,inner+.5,Math.max(1,W-inner*2-1),Math.max(1,H-inner*2-1),colors.ruleFaint,wide?1:.7,revealSpan(t,.12,.6));
  const sweep=revealSpan(t,.25,.85);
  if(sweep>0){ctx.save();framePerimeterClip(sweep,band*1.5);ctx.drawImage(layer,0,0,W,H);ctx.restore();}
  const settle=revealSpan(t,.72,1);
  if(settle>0){ctx.save();ctx.globalAlpha=settle;ctx.drawImage(layer,0,0,W,H);ctx.restore();}
  if(sweep>0&&sweep<1){const head=penPerimeterPoint(sweep);penNib(head.x,head.y,head.angle,.8);}
  return t;
}
// ---------- Canvas captions, a glyph at a time ----------
// One clip rectangle uncovers the caption glyph by glyph with a nib mark at its edge; a finished caption is
// printed with a single fillText, exactly as before.
function writeText(context,text,x,y,progress,options){
  // A proof before letters carries no captions at all: the pen simply never writes them.
  if(plainPlate())return;
  if(progress>=1||reducedMotion){context.fillText(text,x,y);return;}
  if(progress<=0||!text)return;
  const shownGlyphs=Math.max(1,Math.ceil(progress*text.length));
  if(shownGlyphs>=text.length){context.fillText(text,x,y);return;}
  const size=(options&&options.size)||12,align=context.textAlign||'left';
  const width=context.measureText(text).width,shown=context.measureText(text.slice(0,shownGlyphs)).width;
  const left=align==='center'?x-width/2:align==='right'?x-width:x;
  context.save();
  context.beginPath();context.rect(left-size,y-size*1.4,shown+size,size*2.1);context.clip();
  context.fillText(text,x,y);
  context.restore();
  if(context===ctx&&(!options||options.nib!==false))penNib(left+shown+1,y-size*.28,-.6,.75);
}
// ---------- Large lettering: true stroke order ----------
// The chapter name is written letter by letter from the outlines of the Fell faces themselves (see
// scripts/glyphs.mjs): each glyph's contours are stroked on by dash offset with a bead of wet ink at the
// pen, then the counters flood with ink. Once the writing is finished the ordinary text rendering takes
// over as the finished state, so nothing about the printed result changes.
const LETTER_STAGGER=.09,LETTER_STROKE=.12,LETTER_FLOOD=.26;
const fellOutlines=new Map();
let fellDigits=null;
function fellGlyph(face,char){
  const key=face+char;
  const cached=fellOutlines.get(key);if(cached!==undefined)return cached;
  const set=typeof FELL_GLYPHS==='undefined'?null:FELL_GLYPHS.faces[face];
  const entry=set&&set[char];
  if(!entry){fellOutlines.set(key,null);return null;}
  if(!fellDigits){fellDigits=new Map();for(let i=0;i<FELL_GLYPHS.digits.length;i++)fellDigits.set(FELL_GLYPHS.digits[i],i);}
  const counts=entry[1],blob=entry[2],contours=[],lengths=[];
  let at=0,px=0,py=0;
  const next=()=>{
    let value=0,shift=1,code;
    do{code=fellDigits.get(blob[at++]);value+=(code&31)*shift;shift*=32;}while(code&32);
    return value&1?-(value+1)/2:value/2;
  };
  for(const count of counts){
    const points=new Float64Array(count*2),spans=new Float64Array(count+1);
    for(let i=0;i<count;i++){px+=next();py+=next();points[i*2]=px;points[i*2+1]=py;}
    let total=0;
    for(let i=1;i<=count;i++){
      const a=(i%count)*2,b=(i-1)*2;
      total+=Math.hypot(points[a]-points[b],points[a+1]-points[b+1]);spans[i]=total;
    }
    contours.push(points);lengths.push(spans);
  }
  const glyphOutline={advance:entry[0],contours,lengths};
  fellOutlines.set(key,glyphOutline);return glyphOutline;
}
function fellAdvance(face,char){
  const set=typeof FELL_GLYPHS==='undefined'?null:FELL_GLYPHS.faces[face];
  const entry=set&&(set[char]||set[' ']);
  return entry?entry[0]:0;
}
function letteringTime(text){return text.length*LETTER_STAGGER+LETTER_STROKE+LETTER_FLOOD;}
// Returns false when the writing is over (or impossible), and the caller prints the text as it always has.
function penLettering(text,x,y,size,face,age,align){
  if(reducedMotion||typeof FELL_GLYPHS==='undefined'||!FELL_GLYPHS.faces[face])return false;
  if(age>=letteringTime(text))return false;
  const unit=size/FELL_GLYPHS.unitsPerEm;
  let width=0;for(let i=0;i<text.length;i++)width+=fellAdvance(face,text[i])*unit;
  let pen=align==='center'?x-width/2:align==='right'?x-width:x;
  const style=ctx.fillStyle,base=ctx.globalAlpha;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  for(let i=0;i<text.length;i++){
    const char=text[i],advance=fellAdvance(face,char)*unit,start=i*LETTER_STAGGER;
    const stroke=clamp((age-start)/LETTER_STROKE,0,1),flood=clamp((age-start-LETTER_STROKE*.55)/LETTER_FLOOD,0,1);
    const outline=stroke>0?fellGlyph(face,char):null;
    if(outline&&outline.contours.length){
      // The counters flood with ink behind the contour that made them.
      if(flood>0){
        ctx.globalAlpha=base*flood;ctx.fillStyle=style;ctx.beginPath();
        for(const points of outline.contours){
          for(let p=0;p<points.length;p+=2){
            const px=pen+points[p]*unit,py=y-points[p+1]*unit;
            if(p===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
          }
          ctx.closePath();
        }
        ctx.fill();
      }
      if(stroke<1){
        ctx.globalAlpha=base;ctx.strokeStyle=style;ctx.lineWidth=Math.max(.6,size*.035);
        for(let c=0;c<outline.contours.length;c++){
          const points=outline.contours[c],spans=outline.lengths[c],length=spans[spans.length-1]*unit;
          if(length<=0)continue;
          ctx.setLineDash([length,length]);ctx.lineDashOffset=length*(1-stroke);
          ctx.beginPath();
          for(let p=0;p<points.length;p+=2){
            const px=pen+points[p]*unit,py=y-points[p+1]*unit;
            if(p===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
          }
          ctx.closePath();ctx.stroke();
        }
        ctx.setLineDash([]);
        // The wet bead sits where the nib is, on the longest contour of the glyph.
        const points=outline.contours[0],spans=outline.lengths[0],target=spans[spans.length-1]*stroke;
        let index=1;while(index<spans.length-1&&spans[index]<target)index++;
        const back=(index-1)%(points.length/2)*2,ahead=(index%(points.length/2))*2;
        const seg=Math.max(1e-6,spans[index]-spans[index-1]),along=clamp((target-spans[index-1])/seg,0,1);
        const gx=pen+lerp(points[back],points[ahead],along)*unit,gy=y-lerp(points[back+1],points[ahead+1],along)*unit;
        const angle=Math.atan2(-(points[ahead+1]-points[back+1]),points[ahead]-points[back]);
        ctx.globalAlpha=base;penBead(gx,gy,angle,Math.max(1,size*.05),.8);penNib(gx,gy,angle,.85);
      }
    }
    pen+=advance;
  }
  ctx.restore();ctx.globalAlpha=base;ctx.fillStyle=style;
  return true;
}
// A rule drawn on from its centre outward, used under the chapter lettering.
function penRule(x,y,reach,color,weight,t){
  if(t<=0)return;
  const run=reach*t;
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x-9,y);ctx.lineTo(x-9-run,y);ctx.moveTo(x+9,y);ctx.lineTo(x+9+run,y);ctx.stroke();
  ctx.restore();
  if(t<1){penNib(x-9-run,y,Math.PI,.7);penNib(x+9+run,y,0,.7);}
}
