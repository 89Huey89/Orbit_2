'use strict';
/* Orbit · src/reveal.js
   The living pen: every mark on the chart is drawn on as the traveller reaches it. */
// ---------- The living pen: reveal state, the nib, and the masks each kind of mark is drawn through ----------
// A render-side map of birth times keyed by element identity (a node, a hazard, a chart, or a named
// singleton such as 'frame'), each with a duration. `reveal.progress(key,duration)` registers a key the
// first time it is asked for and returns 0..1 from then on; it reads `world.time`, so a pause freezes the
// pen mid-stroke and reduced motion returns 1 immediately. The simulation never learns any of this exists:
// capture, release and aim are computed from the world alone, whether or not a mark has finished drawing.
// `mode` names the hand a plate writes in. The engraved atlas writes with a pen: a stroke, then a
// flood, one letter at a time. A painted wall does not — its own order is sketch in red, correct in
// black, flood the colour, close the line in black, and that order is what the Ceiling animates,
// both in the large hand below and in the small one that writes captions.
definePlate('reveal',{
  // night's own nib sits at or below the frame's own inkSoft (plates.js): a near-white nib used to read
  // as the brightest mark on the plate, ahead of the ink it was supposedly laying — the tool must sit
  // under the ink it carries, not over it.
  night:{mode:'pen',nib:'177,192,183',bead:'250,242,216',dry:'209,190,146',spatter:'232,220,186',
    strike:'214,197,155',washRim:'34,32,26',blot:'6,10,17',rule:'226,213,178'},
  paper:{mode:'pen',nib:'34,24,16',bead:'22,15,8',dry:'58,42,28',spatter:'58,42,28',
    strike:'58,42,28',washRim:'26,18,11',blot:'23,15,8',rule:'34,24,16'},
  ceiling:{mode:'wall',sketch:'157,55,36',nib:'36,29,22',bead:'36,29,22',dry:'92,75,53',
    spatter:'157,55,36',strike:'157,55,36',washRim:'36,29,22',blot:'157,55,36',rule:'36,29,22'},
  // blot is the eighth "this means black" token the void-family finding names (see definePlate('dark')
  // in effects.js): the same three plates' own ink-black, not the automatic duotone's lighter reach.
  cellarius:{blot:'6,8,20'},
  verdigris:{blot:'8,14,12'},
  azzurra:{blot:'38,34,40'}
});
// How long each kind of mark takes, and how far above the top of the view the cartographer works ahead.
const REVEAL_MARGIN=-24,REVEAL_CAP=3;
// The hatch's own tilt off vertical: paintEngraving's strokes (planets.js) run from (x,-core*1.14) to
// (x+core*.48,core*1.1), down and to the right by a fixed ratio regardless of body size, so the hatch
// reveal band below is cut on that same angle rather than a bare vertical edge.
const HATCH_TILT=Math.atan2(.48,1.14+1.1);
const NODE_REVEAL=1.25,HAZARD_REVEAL=1.1,CHART_REVEAL=1.4;
const reveal=(function(){
  // `drawing` is every mark still in progress, urgent or not — the pruning and reporting below both
  // want that whole set. `queued` is narrower: only the throttled marks REVEAL_CAP is actually a bound
  // on, since an urgent registration bypasses the cap and so must not eat into its budget either.
  const born=new Map(),drawing=new Set(),queued=new Set();
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
    reset(){born.clear();drawing.clear();queued.clear();runs++;lastScratch=-9;},
    // 0..1 for a key, registering it on first sight. While three other throttled marks are still being
    // drawn a new one waits at 0, unless it is urgent — anything already inside the view draws at once,
    // so a mark can never be invisible where it matters, and never counts against the three either.
    progress(key,duration,urgent){
      if(reducedMotion||reviewing)return 1;
      let mark=born.get(key);
      if(!mark){
        if(!urgent&&queued.size>=REVEAL_CAP)return 0;
        mark={birth:clock(),span:Math.max(.001,duration||NODE_REVEAL)};
        born.set(key,mark);drawing.add(key);if(!urgent)queued.add(key);prune();scratch();
      }
      const t=(clock()-mark.birth)/mark.span;
      if(t>=1){drawing.delete(key);queued.delete(key);return 1;}
      return t>0?t:0;
    },
    // Seconds since a mark was begun, or -1 when it has never been asked for.
    age(key){
      if(reducedMotion||reviewing)return Infinity;
      const mark=born.get(key);return mark?clock()-mark.birth:-1;
    },
    // Progress without registering: -1 for a mark the pen has not started. Used by the connection lines,
    // which follow whichever node is being drawn, and by the tests.
    peek(key){
      if(reducedMotion||reviewing)return 1;
      const mark=born.get(key);if(!mark)return -1;
      return clamp((clock()-mark.birth)/mark.span,0,1);
    },
    report(){return {marks:born.size,drawing:drawing.size};},
    // The cartographer works in view: a mark starts once it has entered the top of the sheet by a small
    // margin, nearest first, so the drawing is seen. The view keeps the traveller far enough below its top
    // that the next ring closes before a full-speed flight can reach it.
    prime(){
      if(reducedMotion||reviewing||!world)return;
      const top=world.cameraY-REVEAL_MARGIN,bottom=world.cameraY+world.height+80,inView=world.cameraY+world.height*.45;
      primeList.length=0;
      for(const n of world.nodes)if(n.y>top&&n.y<bottom)primeList.push(n.y,n,NODE_REVEAL);
      for(const h of world.hazards)if(h.y>top&&h.y<bottom)primeList.push(h.y,h,HAZARD_REVEAL);
      for(const g of world.nebulas)if(g.y>top&&g.y<bottom)primeList.push(g.y,g,HAZARD_REVEAL);
      for(const c of world.constellations){
        const anchor=c.stars.length?c.stars[0]:c.entry;
        if(anchor&&anchor.y>top&&anchor.y<bottom)primeList.push(anchor.y,c,CHART_REVEAL);
      }
      // Lowest on the sheet first: those marks are the nearest, and the ones already finished free a
      // slot. Sorted by index into the reused primeList (native sort, not the busy fork's own
      // triple-swap) so a crowded fork does not turn a frame quadratic.
      primeOrder.length=0;
      for(let i=0;i<primeList.length;i+=3)primeOrder.push(i);
      primeOrder.sort((a,b)=>primeList[b]-primeList[a]);
      // The three opening paths are drawn at once, never waiting on the cap: the player must see every
      // difficulty on offer immediately, not have one appear only once a slot frees up.
      for(const i of primeOrder)this.progress(primeList[i+1],primeList[i+2],primeList[i]>inView||!!primeList[i+1].difficultyChoice);
    }
  };
})();
const primeList=[],primeOrder=[];
// Fraction of a reveal spent inside one stage of it.
const revealSpan=(t,from,to)=>clamp((t-from)/(to-from),0,1);
// One shared record, refilled per node per frame: reveal state must not allocate while the chart moves.
const NODE_PEN={t:1,d:1,taken:1,done:true,age:Infinity,ring:1,keyline:1,hatch:1,wash:1,survey:1};
// The crossing from looked-at to known happens on exactly one frame of one orbit, and each age will want
// to mark it in its own hand. Finding the crossing is the same problem eight times, so it is solved once
// here. An era names its own mark at the `flourish` hook, exactly as `rockFlourish` does in src/rock.js;
// the printed atlas cannot name one there — `HANDS.atlas` stays the empty hand every call site's own
// fallback code answers for, never a registered painter, so night and paper read as undeclared exactly
// like every other hand that has nothing to say — so it is answered for below at `atlasFlourish` instead,
// and `revealFlourish.fire` is the silence left for a hand that names neither, as Era II does not.
const revealFlourish={fire(){}};
let flourishFor=null,flourishAt=0;
// A body is watched only while it is the one being orbited. Coming to a different body arms the watch at
// whatever that body already stands at rather than firing on it, so a crossing is never reported twice
// and never reported for an observation this orbit did not make.
function watchCompletion(n,d){
  if(n!==flourishFor){flourishFor=n;flourishAt=d;return;}
  if(d>=1&&flourishAt<1){
    const own=handFor('flourish');
    if(own)own(n);else if(renaissanceAtlas())atlasFlourish(n);else revealFlourish.fire(n);
  }
  flourishAt=d;
}
// Two clocks run over one body and they answer different questions. `t` is the pen reaching the page: the
// phenomenon is owed to the player the instant the body is on screen, so the ring, the wedge and every
// caption ride it. `d` is what the orbit has actually observed, as a fraction of SWEEP_FULL, and the
// drawing of the body itself rides that instead — an un-orbited body is a mass and a position, a
// documented one is a specimen. `d` is read from the world directly and never through `reveal.progress()`:
// that throttle exists to stagger marks entering the view, and routing an earned observation through it
// would blank a body that had been paid for the moment a fourth one scrolled in.
function revealNode(n){
  const t=reveal.progress(n,NODE_REVEAL),p=world&&world.player,active=!!p&&p.node===n;
  const observed=active?clamp(p.orbitSweep/SWEEP_FULL,0,1):(n.documented||0);
  if(active)watchCompletion(n,observed);
  // The opening choice is the one body drawn in full before it has been observed, and the design already
  // made that exception: the three pressures are cut as three kinds of world precisely so the choice reads
  // before its caption is legible. Staging them would withhold the only thing the choice is made on, which
  // is the same reason every caption is owed to the player whole.
  const d=n.difficultyChoice?1:observed;
  // Taking the orbit is the event that turns a light into a body, so the disc has a clock of its own that
  // begins at the capture rather than at the observation. It is urgent: a full hand may stagger a body
  // entering the view, never one the traveller is already going round.
  NODE_PEN.taken=active||n.visited?reveal.progress('taken:'+n.id,.35,true):0;
  NODE_PEN.t=t;NODE_PEN.d=d;NODE_PEN.done=t>=1&&d>=1;
  NODE_PEN.age=t>=1?Infinity:reveal.age(n);
  NODE_PEN.ring=t>=1?1:revealSpan(t,0,.6);
  NODE_PEN.keyline=revealSpan(d,0,.4);
  NODE_PEN.hatch=revealSpan(d,.28,.62);
  NODE_PEN.wash=revealSpan(d,.36,.84);
  NODE_PEN.survey=revealSpan(d,.58,1);
  return NODE_PEN;
}
// A caption is written after its ring closes, a glyph every 40 ms.
function revealLabel(pen,text){
  if(pen.done||pen.age===Infinity)return 1;
  return clamp((pen.age-.62)/Math.max(.04,text.length*.04),0,1);
}
// ---------- The nib itself ----------
// However many strokes are in progress, the plate is cut by one hand at a time. `penNib` no longer draws:
// it registers a candidate, and only the highest-priority one still standing at the end of the frame is
// actually cut (`nibClaimDraw`, called from render() in frame.js, which also clears the claim at the top
// of every frame via `nibClaimReset`). Priority is explicit rather than 'nearest the traveller': the ring
// or capture wedge of the node actually being orbited (NIB_TIER_ORBIT) outranks every other in-progress
// stroke (NIB_TIER_STROKE), which outranks the frame's own reveal (NIB_TIER_FRAME), the plate's least
// urgent mark. Within the stroke tier, `nibRecency(t)` ranks by how recently a stroke began — the local
// 0..1 clock every call site already reads to decide whether to claim at all — so the most recently
// begun stroke wins over one nearer its own finish. A candidate's x/y/angle are read off the canvas's own
// current transform at claim time (`ctx.getTransform()`), not off whatever local, often-rotated frame the
// call site happens to be drawing in, so the one winning nib can be cut in plain, unrotated screen space
// long after every local `ctx.save()`/`ctx.restore()` around it has already unwound.
const NIB_TIER_FRAME=0,NIB_TIER_STROKE=1,NIB_TIER_ORBIT=2;
const nibRecency=t=>NIB_TIER_STROKE-clamp(t,0,1)*.9;
let nibClaim=null;
function nibClaimReset(){nibClaim=null;}
// The traveller's own nib silhouette (markHead, effects.js) rides the leading end of whichever stroke is
// being drawn, scaled to this stroke's own reach: a small round ink point cut in two shades, not the bare
// arrowhead this used to be — the same hand the player's own quill is cut in, not a different tool. A bead
// of wet ink sits under the point (a bead IS ink, so it keeps its own full brightness on both plates), the
// shaft runs collinear off the frame edge instead of stopping at a visible stub — a hand's pen has no
// visible end — fading out well before it actually gets there, and the occasional fleck of spatter lands
// nearby. The flecks are seeded from the nib's own position so they sit still on the page instead of
// boiling, and reduced motion has none of it.
function penNibDraw(x,y,angle,alpha,rgb){
  const c=ink.reveal,tone=rgb||c.nib,reach=Math.max(6,7*scale),k=reach/7;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.fillStyle=`rgba(${c.bead},${.5*alpha})`;
  ctx.beginPath();ctx.ellipse(0,0,reach*.26,reach*.19,0,0,TAU);ctx.fill();
  ctx.fillStyle=`rgba(${tone},${.55*alpha})`;
  ctx.beginPath();ctx.ellipse(0,0,5.3*k,4.4*k,0,0,TAU);ctx.fill();
  ctx.fillStyle=`rgba(${tone},${.72*alpha})`;
  ctx.beginPath();ctx.ellipse(-.25*k,.2*k,4.1*k,3.3*k,0,0,TAU);ctx.fill();
  const sx0=-reach*.5,sdx=-1.9,sdy=-.42,sl=Math.hypot(sdx,sdy),sux=sdx/sl,suy=sdy/sl,far=reach*.5+W+H;
  const ex=sux*far,ey=suy*far,shaft=ctx.createLinearGradient(sx0,0,ex,ey);
  shaft.addColorStop(0,`rgba(${tone},${.45*alpha})`);shaft.addColorStop(1,`rgba(${tone},0)`);
  ctx.strokeStyle=shaft;ctx.lineWidth=.6;
  ctx.beginPath();ctx.moveTo(sx0,0);ctx.lineTo(ex,ey);ctx.stroke();
  ctx.restore();
  // Flecks are placed at the cell's own quantised origin, not the nib's live x,y: seeding the decision
  // and the offsets off the cell already meant a fleck held still while the nib stayed inside one, but
  // drawing it relative to x,y let it drift with the nib the whole time regardless — a spatter that
  // never actually landed. Quantising the draw position too is what makes it land and stay landed.
  const gx=Math.floor(x/7)*7,gy=Math.floor(y/7)*7,grid=(Math.floor(x/7)*73856093^Math.floor(y/7)*19349663)>>>0;
  if((grid&7)===0){
    ctx.fillStyle=`rgba(${c.spatter},${.3*alpha})`;
    for(let i=0;i<2;i++){
      const a=((grid>>>(3+i*5))&31)/32*TAU,d=reach*(.7+((grid>>>(8+i*5))&15)/15);
      ctx.fillRect(gx+Math.cos(a)*d,gy+Math.sin(a)*d,.8,.8);
    }
  }
}
function nibClaimDraw(){
  if(!nibClaim)return;
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  penNibDraw(nibClaim.x,nibClaim.y,nibClaim.angle,nibClaim.alpha,nibClaim.rgb);
  ctx.restore();
}
function penNib(x,y,angle,alpha=1,rgb,priority=NIB_TIER_STROKE){
  if(reducedMotion||alpha<=.02||(nibClaim&&priority<=nibClaim.priority))return;
  const m=ctx.getTransform();
  nibClaim={x:(m.a*x+m.c*y+m.e)/DPR,y:(m.b*x+m.d*y+m.f)/DPR,angle:angle+Math.atan2(m.b,m.a),alpha,rgb,priority};
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
// wedge the pen has covered so far, so the ticks appear as it passes them. `clock` defaults to the ring's
// own reveal (`pen.ring`, the node's first arrival on the page) but takes any other 0..1 field on `pen` —
// the capture ring reuses this same mask on `pen.taken` to cut its sketch into a closed line as the orbit
// is taken, rather than swapping the two sprites whole in a single frame.
function penWedgeBegin(pen,n,reach,clock=pen.ring){
  if(clock>=1)return false;
  ctx.save();
  ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,reach,n.phase,n.phase+TAU*clock);ctx.closePath();ctx.clip();
  return true;
}
function penWedgeEnd(pen,n,r,clock=pen.ring){
  ctx.restore();
  if(clock<=0||clock>=1)return;
  const a=n.phase+TAU*clock,x=Math.cos(a)*r,y=Math.sin(a)*r;
  ctx.save();ctx.globalAlpha=1;
  penBead(x,y,a+Math.PI/2,1.5*scale,.9);
  // The node actually being orbited outranks every other stroke on the sheet, however recent — the pilot's
  // own hand is always the one on the page. Any other node still cutting its ring or capture line is an
  // ordinary stroke, ranked by how far into its own clock it is like every other candidate.
  const priority=world&&world.player&&world.player.node===n?NIB_TIER_ORBIT:nibRecency(clock);
  penNib(x,y,a+Math.PI/2,.9,undefined,priority);
  ctx.restore();
}
// A pen lifts off the page rather than blinking out: for NIB_LIFT_DUR after a wedge has closed (`key`
// the same identity and `span` the same duration its own clock was registered with — `n` for the ring's
// own arrival, `'taken:'+n.id` for the capture ring), the nib is drawn once more at the point the stroke
// closed, growing a little and fading to nothing rather than vanishing the instant `clock` reaches 1.
// Called unconditionally once the wedge itself stops calling penWedgeEnd; cheap to call every frame after,
// since reveal.age(key) keeps climbing and the early return below fires for the rest of that mark's life.
const NIB_LIFT_DUR=.12;
function penNibLift(key,span,n,r){
  if(reducedMotion)return;
  const since=reveal.age(key)-span;
  if(since<0||since>=NIB_LIFT_DUR)return;
  const u=since/NIB_LIFT_DUR,a=n.phase,x=Math.cos(a)*r,y=Math.sin(a)*r;
  ctx.save();ctx.translate(x,y);ctx.scale(1+u*.12,1+u*.12);ctx.translate(-x,-y);
  const priority=world&&world.player&&world.player.node===n?NIB_TIER_ORBIT:nibRecency(u);
  penNib(x,y,a+Math.PI/2,.9*(1-u),undefined,priority);
  ctx.restore();
}
// A circle gone round once by a hand that was not being careful: the radius breathes by a few per cent
// on three slow harmonics with a little noise over them, and the path is laid through the midpoints so
// the wobble reads as a wavering line rather than a polygon. It is a disc, not a blot — `landContour`
// swings too far for a body, which has a size the player is about to judge a transfer against.
function sketchDisc(g,r,rng){
  const phase=rng()*TAU,drift=rng()*TAU,steps=26,pts=[];
  for(let i=0;i<steps;i++){
    const a=i/steps*TAU,k=1+Math.sin(a*2+phase)*.045+Math.sin(a*5-drift)*.028+(rng()-.5)*.05;
    pts.push({x:Math.cos(a)*r*k,y:Math.sin(a)*r*k*.985});
  }
  const last=pts[steps-1],first=pts[0];g.beginPath();g.moveTo((last.x+first.x)/2,(last.y+first.y)/2);
  for(let i=0;i<steps;i++){const a=pts[i],b=pts[(i+1)%steps];g.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}
  g.closePath();
}
// A first paper sight is not a miniature planet. It is the paper remembering pressure: a shallow,
// irregular depression with a pin-prick at its centre, a broken compressed rim, and fibres dragged out
// in the direction the observing hand came from. The shape is seeded, so it stays still on the sheet,
// but its parts are revealed as the capture mark is made instead of appearing as one clean circle.
function punchedLoop(g,r,flatten,rng,phase,steps=40){
  const pts=[];
  for(let i=0;i<steps;i++){
    const a=i/steps*TAU;
    const k=1+Math.sin(a*3+phase)*.018+Math.sin(a*7-phase*.7)*.01+(rng()-.5)*.008;
    pts.push({x:Math.cos(a)*r*k,y:Math.sin(a)*r*flatten*k});
  }
  const last=pts[steps-1],first=pts[0];g.beginPath();g.moveTo((last.x+first.x)/2,(last.y+first.y)/2);
  for(let i=0;i<steps;i++){
    const a=pts[i],b=pts[(i+1)%steps];g.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);
  }
  g.closePath();
}
function punchedMark(g,core,rng,alpha,progress,seed){
  if(alpha<=.012)return;
  g.save();
  const phase=rng()*TAU,drag=phase+Math.PI*(.58+rng()*.32),build=clamp(progress,0,1);
  const outer=core*(1.01+.025*Math.sin(phase));
  // The rim is nearly circular: the organic character belongs to the paper fibres and the slight offset,
  // not to a ragged painted outline. It closes as the capture mark is made.
  const rimSweep=TAU*(.62+.38*build);
  burinArc(g,0,0,outer,phase,phase+rimSweep,ink.reveal.washRim,.72*alpha,.82,seed^0x3a17,{segments:42,skips:1,wobble:.28});
  burinArc(g,0,0,outer*1.018,drag,drag+TAU*Math.min(.28,.1+.18*build),ink.base.paperRgb,.22*alpha,.55,seed^0x4c29,{segments:12,skips:1,wobble:.2});

  // A punched sheet needs a dark absence, not a dilute painted centre. Keep the cavity compact and
  // slightly off-axis so it reads as a puncture through the page rather than a planet-sized blot.
  const cx=Math.cos(drag)*outer*.08,cy=Math.sin(drag)*outer*.08*.82,hole=outer*(.27+rng()*.035);
  g.save();g.translate(cx,cy);
  punchedLoop(g,hole,.88,rng,drag+.4,32);
  const holeAlpha=clamp(.25+.72*alpha,0,1);
  g.fillStyle=`rgba(${ink.reveal.blot},${holeAlpha})`;g.fill();
  g.strokeStyle=`rgba(${ink.base.inkStrong},${clamp(.5+.4*alpha,0,1)})`;g.lineWidth=.7;g.stroke();
  g.restore();

  // Only short fibre burrs escape the rim. Their small cluster gives the punch direction without turning
  // the body into a rough painting.
  const fibres=2+Math.round(build*4);
  g.lineCap='round';
  for(let i=0;i<fibres;i++){
    const f=i/Math.max(1,fibres-1),a=drag+(f-.5)*1.15+(rng()-.5)*.22;
    const inner=outer*(1.0+rng()*.025),len=outer*(.07+rng()*.12)*(.7+.3*build);
    const bend=(rng()-.5)*outer*.08,tx=Math.cos(a),ty=Math.sin(a),nx=-ty,ny=tx;
    g.strokeStyle=`rgba(${i%3===0?ink.underdrawing.chalk:ink.reveal.strike},${(.16+rng()*.16)*alpha})`;
    g.lineWidth=.3+rng()*.3;g.beginPath();
    g.moveTo(tx*inner,ty*inner);
    g.quadraticCurveTo(tx*(inner+len*.45)+nx*bend,ty*(inner+len*.45)+ny*bend,tx*(inner+len),ty*(inner+len));
    g.stroke();
  }

  g.restore();
}
// ---------- Planets: the stages a colourist works in ----------
// Each stage composites the cached glyph layers through a mask; when the reveal finishes the finished
// composite is drawn exactly as before, at no extra cost, plus whatever brief flourish `drawAtlasFlourish`
// (below) is still marking the crossing into a full observation with.
function revealPlanet(art,r,time,pen,seed,impression=null){
  if(!pen||pen.done){drawPlanet(art,r,time,impression);drawAtlasFlourish(art,r,seed);drawModernFlourish(art,r,seed);return;}
  const core=art.core,angle=art.tilt+(reducedMotion?0:time*art.spin);
  ctx.save();ctx.scale(r/60,r/60);
  // (0) A body no orbit has ever taken is still only a phenomenon. Night keeps that as a light; paper
  // gives it a very faint pressure impression so the material grammar is visible without revealing its
  // identity. Taking the orbit makes the pressure mark darker and more complete, then the mark dries away
  // as the specimen fills in behind it.
  if(pen.taken<1&&pen.ring>0){
    const lit=(1-pen.taken)*pen.ring;
    if(onPaper()){
      const rng=seeded((seed^0x7a41c3)>>>0||1);
      punchedMark(ctx,core,rng,.42*lit,pen.taken,seed^0x19d7);
    }else{
      ctx.fillStyle=`rgba(${ink.reveal.bead},${.16*lit})`;
      ctx.beginPath();ctx.arc(0,0,Math.max(2.4,core*.3),0,TAU);ctx.fill();
      ctx.fillStyle=`rgba(${ink.reveal.bead},${.92*lit})`;
      ctx.beginPath();ctx.arc(0,0,Math.max(1.1,core*.12),0,TAU);ctx.fill();
    }
  }
  // Faded out by .36, just ahead of the keyline's own close at .4: once the contour is a closed line the
  // centre reads as bare sheet inside it, not a punched hole the specimen still has to fill.
  const laid=pen.taken*(1-revealSpan(pen.d,.08,.36));
  if(laid>.012){
    const rng=seeded((seed^0x5bd1e9)>>>0||1);
    if(onPaper())punchedMark(ctx,core,rng,laid,pen.taken,seed);
    else{
      sketchDisc(ctx,core*1.02,rng);
      ctx.fillStyle=`rgba(${ink.reveal.dry},${.33*laid})`;ctx.fill();
      ctx.strokeStyle=`rgba(${ink.reveal.strike},${.5*laid})`;ctx.lineWidth=1.05;ctx.stroke();
      // The grain is the tooth of the sheet coming up through a first, hurried laying-in. It is seeded off
      // the body so it sits still on the page rather than boiling under the orbit, and it is cut to the
      // disc so nothing of the first sight escapes the outline the hand actually drew.
      ctx.save();ctx.clip();
      for(let i=0;i<64;i++){
        const a=rng()*TAU,rad=Math.sqrt(rng())*core*1.04,dot=.3+rng()*.7;
        ctx.fillStyle=`rgba(${rng()<.34?ink.reveal.spatter:ink.reveal.strike},${(.07+rng()*.2)*laid})`;
        ctx.beginPath();ctx.arc(Math.cos(a)*rad,Math.sin(a)*rad,dot,0,TAU);ctx.fill();
      }
      ctx.restore();
    }
  }
  // (d) The survey arcs and both halves of a ring system are the last marks laid down, so the ring
  // closes in one motion rather than its near half snapping in early with the keyline and hatch.
  if(pen.survey>0){
    ctx.save();ctx.globalAlpha*=pen.survey;ctx.drawImage(art.back,-72,-72,144,144);
    if(art.ringFront)ctx.drawImage(art.ringFront,-72,-72,144,144);
    ctx.restore();
  }
  // (c) The wash blooms as an irregular blot from a seeded point off the centre, its wet rim drying lighter
  // over the last third of the stage.
  if(pen.wash>0){
    const rng=seeded((seed^0x9e3779)>>>0||1),ox=(rng()-.5)*core*.8,oy=(rng()-.5)*core*.8;
    const grow=core*2.2*pen.wash,dry=revealSpan(pen.wash,.66,1);
    ctx.save();
    if(onPaper()&&impression){ctx.translate(impression.x||0,impression.y||0);ctx.rotate(impression.rotation||0);}
    ctx.beginPath();ctx.arc(0,0,core,0,TAU);ctx.clip();
    landContour(ctx,ox,oy,grow,grow*.88,rng);
    ctx.save();ctx.clip();ctx.rotate(angle);ctx.drawImage(art.surface,-40,-40,80,80);ctx.restore();
    ctx.strokeStyle=`rgba(${ink.reveal.washRim},${.42*(1-dry)+.06})`;ctx.lineWidth=1.2;ctx.stroke();
    ctx.restore();
  }
  // (a) The keyline is cut around the disc by angle — a genuine hairline band, not the wide annulus this
  // used to clip to — and it reveals `art.key` alone: the colourist's correction (the keyline circle, its
  // off-register colour circle, the chalk underdrawing, the rim arcs) is a different raster from the
  // hatch's own `art.front`, so the two stages never composite the same layer twice over whatever ground
  // both their masks have already crossed.
  if(pen.keyline>0&&art.key){
    const a0=art.phase,a1=a0+TAU*pen.keyline;
    ctx.save();ctx.beginPath();
    ctx.arc(0,0,core+2,a0,a1);ctx.arc(0,0,core-2,a1,a0,true);ctx.closePath();ctx.clip();
    ctx.drawImage(art.key,-72,-72,144,144);ctx.restore();
  }
  // (b) The hatching is revealed by a band travelling across the disc along the direction of the strokes:
  // the clip is rotated to HATCH_TILT so its leading edge runs parallel to a stroke and the sweep is
  // perpendicular to the set, uncovering one whole stroke at a time rather than slicing across the tilt.
  if(pen.hatch>0){
    ctx.save();
    ctx.beginPath();ctx.arc(0,0,core*1.5,0,TAU);ctx.clip();
    ctx.rotate(-HATCH_TILT);
    ctx.beginPath();ctx.rect(-core*1.9,-core*2.3,core*3.8*pen.hatch,core*4.6);ctx.clip();
    ctx.rotate(HATCH_TILT);
    ctx.drawImage(art.front,-72,-72,144,144);ctx.restore();
  }
  ctx.restore();
}
// The broken survey arcs just drawn are already the atlas's answer to "has this been mapped": they fade
// in as `pen.survey` climbs, so a body let go at 95% observed dries to very nearly the same faint hairline
// as one held to 100% — exactly the crossing a player most wants to see and can least tell happened.
// `atlasFlourish` is what the printed atlas answers `watchCompletion`'s hook with above, called directly
// rather than registered through `defineHand()`: night and paper carry no painters of their own in that
// registry at all (see `renaissanceAtlas()` in src/plates.js), so this is reached the same way every other
// atlas-drawn mark is, as the code a call site runs when it finds nothing named. The instant an orbit
// actually reaches a full observation, those same arcs are struck whole in one bright ring — in the gold
// that already marks a landing squared, ochre on paper — then left to fade back into the ordinary hairline
// the cached plate carries underneath. The birth time is kept per seed rather than per node, exactly as
// `rockFlourishAt` is kept in src/rock.js, and pruned the same way once the map outgrows a small bound, so
// a run that documents many bodies never grows this without limit.
const ATLAS_FLOURISH_DUR=.6;
const atlasFlourishAt=new Map();
function atlasFlourish(n){
  atlasFlourishAt.set(n.seed,world.time);
  if(atlasFlourishAt.size>40)for(const [key,at] of atlasFlourishAt)if(world.time-at>ATLAS_FLOURISH_DUR)atlasFlourishAt.delete(key);
}
// Pickups carry no survey furniture to close — paintSurvey never ran for them — so they are left alone.
function drawAtlasFlourish(art,r,seed){
  if(PICKUP_FAMILIES.has(art.family))return;
  const at=atlasFlourishAt.get(seed);if(at===undefined)return;
  const seal=clamp(1-(world.time-at)/ATLAS_FLOURISH_DUR,0,1);if(seal<=0)return;
  const radius=art.family==='ringed'?art.core*1.98:art.core+6,glow=seal*seal;
  ctx.save();ctx.scale(r/60,r/60);
  ctx.strokeStyle=`rgba(${ink.base.gold},${.85*glow})`;ctx.lineWidth=1+1.8*glow;
  ctx.beginPath();ctx.arc(0,0,radius,0,TAU);ctx.stroke();
  ctx.restore();
}
// The observatory plate's own answer to the same completion: it has no pen to ring a keyline in gold
// with, so it has had no completion mark at all — `watchCompletion`'s `handFor('flourish')` found
// nothing registered for `render:'modern'` and fell through to the silent default. A focus-lock bracket
// snaps in at the four corners of the specimen's own observed radius instead, the way a telescope's own
// autoguider marks a lock, and fades the same way the atlas's ring does.
const MODERN_FLOURISH_DUR=.6;
const modernFlourishAt=new Map();
function modernFlourish(n){
  modernFlourishAt.set(n.seed,world.time);
  if(modernFlourishAt.size>40)for(const [key,at] of modernFlourishAt)if(world.time-at>MODERN_FLOURISH_DUR)modernFlourishAt.delete(key);
}
function drawModernFlourish(art,r,seed){
  if(PICKUP_FAMILIES.has(art.family))return;
  const at=modernFlourishAt.get(seed);if(at===undefined)return;
  const seal=clamp(1-(world.time-at)/MODERN_FLOURISH_DUR,0,1);if(seal<=0)return;
  const radius=art.core*1.2,glow=seal*seal,arm=radius*.22;
  ctx.save();ctx.scale(r/60,r/60);
  ctx.strokeStyle=`rgba(214,232,240,${.85*glow})`;ctx.lineWidth=1+1.4*glow;ctx.lineCap='round';
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2+Math.PI/4,cx=Math.cos(a)*radius,cy=Math.sin(a)*radius,tx=-Math.sin(a),ty=Math.cos(a);
    ctx.beginPath();
    ctx.moveTo(cx-Math.cos(a)*arm,cy-Math.sin(a)*arm);ctx.lineTo(cx,cy);ctx.lineTo(cx-tx*arm,cy-ty*arm);
    ctx.stroke();
  }
  ctx.restore();
}
defineHand('modern',{flourish:modernFlourish});
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
  if(t<1){penBead(x1,y1,a,1.1*scale,.8);penNib(x1,y1,a,.85,undefined,nibRecency(t));}
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
    penNib(x+Math.cos(a)*rr,y+Math.sin(a)*rr,a+Math.PI/2,.8,undefined,nibRecency(cut));
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
  // No nib here: the sweep's own edge runs along a chord between two stars, not along any stroke the
  // figure actually cuts, so a tool claimed there rode a phantom spine. A figure is a plate area coming
  // up, not a single line being drawn, and the honest reading is that the pen is elsewhere.
  chartSweep(chart,t);
  draw(chart);
  ctx.restore();
}
// ---------- The plate frame ----------
// Once per run: the double rule draws itself round by dash offset, the graduated ticks follow the pen
// around the perimeter, and the marginal ornaments come up last. A restart redraws it briskly.
function penDashRect(x,y,w,h,color,weight,t){
  if(t<=0||t>=1||w<=0||h<=0)return;
  const length=(w+h)*2;
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=weight;
  ctx.setLineDash([length,length]);ctx.lineDashOffset=length*(1-t);
  ctx.strokeRect(x,y,w,h);ctx.restore();
}
function framePerimeterPath(t,depth){
  const perimeter=(W+H)*2,run=perimeter*t;
  if(run>0)ctx.rect(0,0,Math.min(W,run),depth);
  if(run>W)ctx.rect(W-depth,0,depth,Math.min(H,run-W));
  if(run>W+H){const across=Math.min(W,run-W-H);ctx.rect(W-across,H-depth,across,depth);}
  if(run>W*2+H){const down=Math.min(H,run-W*2-H);ctx.rect(0,H-down,depth,down);}
}
function framePerimeterClip(t,depth){
  ctx.beginPath();
  framePerimeterPath(t,depth);
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
  if(t>=1){blitFrameLayer(layer);return 1;}
  const band=frameBand(),wide=frameWide(),outer=band*.56,inner=band*.92;
  // Read straight off the same ink.base tokens buildFrameLayer's own double rule is cut in, at the same
  // alphas, rather than a second rule/ruleFaint pair tuned to look close: the animated rule the pen
  // draws and the printed rule it hands off to are then provably one ink, not two.
  const ruleColor=`rgba(${ink.base.inkStrong},${onPaper()?.62:.46})`,faintColor=`rgba(${ink.base.inkSoft},${onPaper()?.34:.26})`;
  penDashRect(outer+.5,outer+.5,Math.max(1,W-outer*2-1),Math.max(1,H-outer*2-1),ruleColor,wide?1.4:1,revealSpan(t,0,.5));
  penDashRect(inner+.5,inner+.5,Math.max(1,W-inner*2-1),Math.max(1,H-inner*2-1),faintColor,wide?1:.7,revealSpan(t,.12,.6));
  const sweep=revealSpan(t,.25,.85);
  if(sweep>0){ctx.save();framePerimeterClip(sweep,band*1.5);ctx.drawImage(layer,0,0,W,H);ctx.restore();}
  const settle=revealSpan(t,.72,1);
  if(settle>0){
    ctx.save();ctx.globalAlpha=settle;
    // The sweep above has already cut the perimeter band opaque; settle only ever needs to lay the
    // rest of the layer (the corner ornaments reaching past that band), so its blit is clipped to the
    // band's own complement rather than composited over ground the sweep already finished.
    if(sweep>0){ctx.beginPath();ctx.rect(0,0,W,H);framePerimeterPath(sweep,band*1.5);ctx.clip('evenodd');}
    blitFrameLayer(layer);
    ctx.restore();
  }
  // The frame is the plate's own least urgent mark: it claims the nib only when nothing else on the
  // sheet wants it.
  if(sweep>0&&sweep<1){const head=penPerimeterPoint(sweep);penNib(head.x,head.y,head.angle,.8,undefined,NIB_TIER_FRAME);}
  return t;
}
// ---------- Canvas captions, a glyph at a time ----------
// A brush does not uncover a line of text through a window sliding across it: it puts one sign down
// whole and wet, and the next goes down beside it. Each letter therefore fades up in place over its
// own short turn, and every one is set from the finished string's own measurement, so the caption
// that arrives is the caption that stays — the marks land in order, nothing shifts when the last
// one dries, and there is no nib, because a reed has none.
function wallText(context,text,x,y,progress){
  const align=context.textAlign||'left',width=context.measureText(text).width;
  const left=align==='center'?x-width/2:align==='right'?x-width:x;
  const base=context.globalAlpha,span=1/text.length;
  context.save();context.textAlign='left';
  for(let i=0;i<text.length;i++){
    const wet=clamp((progress-i*span)/(span*.8),0,1);
    if(wet<=0)break;
    context.globalAlpha=base*wet;
    context.fillText(text[i],left+context.measureText(text.slice(0,i)).width,y+(1-wet)*.8);
  }
  context.restore();context.globalAlpha=base;
}
// One clip rectangle uncovers the caption glyph by glyph with a nib mark at its edge; a finished caption is
// printed with a single fillText, exactly as before.
function writeText(context,text,x,y,progress,options){
  // A proof before letters carries no captions at all: the pen simply never writes them. What the run
  // itself has to say is not part of the engraving, so an inscription asks for `plain` and is written
  // on every plate in the press.
  if(plainPlate()&&!(options&&options.plain))return;
  if(progress>=1||reducedMotion){context.fillText(text,x,y);return;}
  if(progress<=0||!text)return;
  if(ink.reveal.mode==='wall'){wallText(context,text,x,y,progress);return;}
  const size=(options&&options.size)||12,align=context.textAlign||'left';
  // The clip edge lerps continuously between the glyph boundaries either side of it, rather than
  // jumping a whole glyph width at a time, so a letter uncovers left to right as the nib crosses it
  // instead of teleporting in whole the instant progress reaches its boundary.
  const raw=progress*text.length,n=Math.floor(raw),frac=raw-n;
  const width=context.measureText(text).width;
  const shown=lerp(context.measureText(text.slice(0,n)).width,context.measureText(text.slice(0,n+1)).width,frac);
  const left=align==='center'?x-width/2:align==='right'?x-width:x;
  context.save();
  context.beginPath();context.rect(left-size,y-size*1.4,shown+size,size*2.1);context.clip();
  context.fillText(text,x,y);
  context.restore();
  if(context===ctx&&(!options||options.nib!==false))penNib(left+shown+1,y-size*.28,-.6,.75,undefined,nibRecency(progress));
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
// `tracking` is extra space held between glyphs, in the same px the size itself is given in — the way
// the caller asks for a wide-set abbreviation without typing the gaps in as literal space characters,
// which would otherwise be timed and drawn as glyphs of their own.
function penLettering(text,x,y,size,face,age,align,tracking=0){
  if(reducedMotion||typeof FELL_GLYPHS==='undefined'||!FELL_GLYPHS.faces[face])return false;
  if(age>=letteringTime(text))return false;
  const unit=size/FELL_GLYPHS.unitsPerEm;
  let width=Math.max(0,text.length-1)*tracking;for(let i=0;i<text.length;i++)width+=fellAdvance(face,text[i])*unit;
  let pen=align==='center'?x-width/2:align==='right'?x-width:x;
  const style=ctx.fillStyle,base=ctx.globalAlpha,wall=ink.reveal.mode==='wall';
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  for(let i=0;i<text.length;i++){
    const char=text[i],advance=fellAdvance(face,char)*unit,start=i*LETTER_STAGGER;
    const stroke=clamp((age-start)/LETTER_STROKE,0,1),flood=clamp((age-start-LETTER_STROKE*.55)/LETTER_FLOOD,0,1);
    const outline=stroke>0?fellGlyph(face,char):null;
    if(outline&&wall){
      // The wall's own order, letter by letter: the draftsman's red setting-out laid off register,
      // the senior hand's thin black correction over it, the flat flood, and the black line that
      // closes the letter last. The red is never quite covered — on the wall it survives wherever
      // the later paint has fallen away — so it is left as a whisper under the finished letter.
      const turn=clamp((age-start)/(LETTER_STROKE+LETTER_FLOOD),0,1);
      const s1=clamp(turn*4,0,1),s2=clamp((turn-.25)*4,0,1),s3=clamp((turn-.5)*4,0,1),s4=clamp((turn-.75)*4,0,1);
      const trace=(dx,dy)=>{
        ctx.beginPath();
        for(const points of outline.contours){
          for(let p=0;p<points.length;p+=2){const px=pen+points[p]*unit+dx,py=y-points[p+1]*unit+dy;if(p===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
          ctx.closePath();
        }
      };
      if(s1>0){ctx.globalAlpha=base*(.15+.4*(1-s4))*s1;ctx.fillStyle=`rgb(${ink.reveal.sketch})`;trace(size*.045,-size*.035);ctx.fill();}
      if(s2>0){ctx.globalAlpha=base*.32*s2;ctx.strokeStyle=style;ctx.lineWidth=Math.max(.5,size*.025);trace(0,0);ctx.stroke();}
      if(s3>0){ctx.globalAlpha=base*s3;ctx.fillStyle=style;trace(0,0);ctx.fill();}
      if(s4>0){ctx.globalAlpha=base*.85*s4;ctx.strokeStyle=style;ctx.lineWidth=Math.max(.6,size*.045);trace(0,0);ctx.stroke();}
    }else if(outline&&outline.contours.length){
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
        ctx.globalAlpha=base;penBead(gx,gy,angle,Math.max(1,size*.05),.8);penNib(gx,gy,angle,.85,undefined,nibRecency(stroke));
      }
    }
    pen+=advance+(i<text.length-1?tracking:0);
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
  // One nib, not two: a rule is one hand's stroke, cut from its own centre outward, not two hands
  // working outward from the middle at once. It rides the arm the rule is considered to have started
  // from — the left one, kept as the fixed, deterministic choice a symmetric rule has no other basis to make.
  if(t<1)penNib(x-9-run,y,Math.PI,.7,undefined,nibRecency(t));
}
