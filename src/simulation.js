'use strict';
/* Orbit · src/simulation.js
   OrbitWorld: seeded generation, geometry, fixed-step flight, swept collisions, scoring, difficulty.
   This file is what scripts/verify.mjs runs in isolation, so it must not reference the DOM. */
// BEGIN SIMULATION
const TAU = Math.PI * 2;
const BASE_SPEED = 150, MAX_SPEED = 360, STAR_GAIN = 90;
// The opening orbit, held only while the difficulty choice is pending, is flown at a gentler pace
// than ordinary play so a new player has time to read all three targets before committing to one.
const OPENING_ORBIT_SPEED = BASE_SPEED * 0.6;
// Display names for the three pressures, in the atlas's own Latin voice — TIRO the raw recruit,
// ADEPTUS the one who has attained (the alchemist's own rank for a practitioner), MAGISTER the
// master — rather than a modern difficulty label. The stored/internal values (relaxed/classic/
// hardcore) are unchanged so existing saves, personal bests and the pressure multiplier lookup all
// keep working; only the printed word changes.
const DIFFICULTY_LABELS = {relaxed:'TIRO', classic:'ADEPTUS', hardcore:'MAGISTER'};
const FLIGHT_STEP = 1/120;
// The nib carries a charge of ink, held as 0..1. Flight spends it by the distance flown, so a
// transfer costs what it is long rather than what it takes; going faster crosses the same gulf for
// the same ink. Holding an orbit re-charges the nib slowly, a landing pays a dividend — a clean
// tangent arrival pays better than a hard turn — and one lap of a slingshot star fills it. Run the
// nib dry in flight and the line stops: the run ends. INK_REACH is the whole budget in world units,
// so a full nib carries the traveller that far before anything is earned back.
// The budget is set so the ordinary main line pays for itself — a short hop costs less than the
// landing and the dwell give back — while a long skip has to be funded deliberately. One lap of a
// slingshot star fills the nib outright, so a star buys reach as well as speed, and the deep skip
// the chart offers after it is affordable exactly once per star.
const INK_REACH = 2000;
const INK_ORBIT_GAIN = 0.13, INK_SLING_GAIN = 0.85;
const INK_CAPTURE_GAIN = 0.05, INK_PERFECT_GAIN = 0.12;
// The chart is drawn for a pace rather than for a row count, and every transfer on it is cut to
// take about the same time to fly. As the early slingshots put a faster pace within reach the
// gulfs open to match, so speed earned on a star buys distance instead of merely arriving sooner.
// The pace is a property of the chart and not of the traveller: it depends only on the row, so a
// seed still draws one plate for everyone, which is what the daily plate rests on.
const TRANSFER_SECONDS = 1.28;
// The row from which a hazard may sit on one of the two ways between main nodes and close it, and
// then only on every third row, so a closed route stays an event rather than the standing state of
// the chart. Before it, every route is left clear and a hazard is only something to give room to.
const HAZARD_CLOSES_ROUTE = 12;
// How far along a course the pen will still set it down. At the opening pace the whole transfer is
// drawn and nothing is hidden; as the chart's speed is earned the far part of a fast crossing is
// left unset, so a run flown at full pace commits to the last of it unseen. The release marks and
// the perfect window on the orbit being left are untouched, exactly as they are under a nebula, so
// what is lost is where the flight ends rather than whether it leaves on a tangent.
const SIGHT_NEAR = 260, SIGHT_FAR = 900;
function chartPace(row) { return BASE_SPEED+(MAX_SPEED-BASE_SPEED)*clamp((row-3)/25,0,1)*.78; }
// How much wider the chart is cut at this row than at the opening: 1 at the start, about 2.1 once
// the chart is drawn for its full pace.
function chartGrowth(row) { return chartPace(row)/BASE_SPEED; }
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
function seeded(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function pointSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  const t = l ? clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
function segmentCircle(ax, ay, bx, by, cx, cy, radius) {
  const dx = bx - ax, dy = by - ay, fx = ax - cx, fy = ay - cy;
  const a = dx * dx + dy * dy, c = fx * fx + fy * fy - radius * radius;
  if (c <= 0) return 0;
  if (a < 1e-10) return null;
  const b = 2 * (fx * dx + fy * dy), d = b * b - 4 * a * c;
  if (d < 0) return null;
  const t = (-b - Math.sqrt(d)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}
function tangentPaths(a, b) {
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const offset = Math.acos(clamp(a.r / d, -1, 1));
  return [-1, 1].map(sign => ({x:a.x + Math.cos(angle + sign * offset) * a.r, y:a.y + Math.sin(angle + sign * offset) * a.r}));
}
// Common tangents connect the two rims, for either arrival winding.
function orbitTangents(a,b,dir) {
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),heading=Math.atan2(dy,dx),paths=[];
  for(const winding of [1,-1]){
    const offset=a.r-winding*b.r;if(d<=Math.abs(offset))continue;
    const angle=heading-dir*Math.acos(offset/d),nx=Math.cos(angle),ny=Math.sin(angle);
    paths.push({angle,x:a.x+nx*a.r,y:a.y+ny*a.r,bx:b.x+nx*b.r*winding,by:b.y+ny*b.r*winding,dir:dir*winding});
  }
  return paths;
}
function nodeMotion(n,time) {
  if(!n.amp)return {x:n.x,y:n.y,vx:n.vx,vy:n.vy,ax:0};
  const phase=time*.72+n.phase;
  return {x:n.baseX+Math.sin(phase)*n.amp,y:n.y,vx:Math.cos(phase)*n.amp*.72,vy:0,ax:-Math.sin(phase)*n.amp*.72*.72};
}
// A grazing flight joins at closest approach, where relative velocity is
// tangent to the orbit. Other flights retain the forgiving outer capture rim.
// The guide and actual flight share this solver, including moving planets.
function transferContact(p,v,n,time,limit) {
  const speed=Math.hypot(v.vx,v.vy);if(speed<1e-8)return null;
  const sample=t=>{
    const m=nodeMotion(n,time+t),x=p.x+v.vx*t,y=p.y+v.vy*t,rx=x-m.x,ry=y-m.y;
    return {...m,x,y,cx:m.x,cy:m.y,rx,ry,rvx:v.vx-m.vx,rvy:v.vy-m.vy,distance:Math.hypot(rx,ry)};
  };
  const initial=sample(0);
  if(initial.distance-n.cap>(speed+n.amp*.72)*limit+1e-7)return null;
  let closest=Math.max(0,-(initial.rx*initial.rvx+initial.ry*initial.rvy)/(initial.rvx**2+initial.rvy**2));
  if(n.amp){
    for(let i=0;i<8;i++){
      const q=sample(closest),slope=q.rvx**2+q.rvy**2-q.rx*q.ax;
      if(slope<1e-8)break;
      const next=Math.max(0,closest-(q.rx*q.rvx+q.ry*q.rvy)/slope);
      if(Math.abs(next-closest)<1e-8){closest=next;break;}closest=next;
    }
  }
  const near=sample(closest),rimWindow=Math.max(8,n.r*.20);
  const perfect=closest>0&&near.distance>=n.r-rimWindow&&near.distance<=Math.min(n.cap,n.r+rimWindow);
  let arrival=closest;
  if(!perfect){
    if(!n.amp){
      const t=segmentCircle(p.x,p.y,p.x+v.vx*limit,p.y+v.vy*limit,n.x,n.y,n.cap);
      if(t===null)return null;arrival=t*limit;
    }else if(initial.distance<=n.cap)arrival=0;
    else{
      if(near.distance>n.cap||closest<=0)return null;
      let lo=0,hi=closest;
      for(let i=0;i<25;i++){const mid=(lo+hi)/2;if(sample(mid).distance>n.cap)lo=mid;else hi=mid;}
      arrival=hi;
    }
  }
  if(arrival>limit+1e-8)return null;
  return {...sample(arrival),time:arrival,perfect};
}
// Twelve engraved asterisms. Each entry carries the three lateral star offsets of its
// fork, in the fixed bottom-to-top generation order. Catalogue entries 0-3 belong to
// regions 0-3 and are unchanged; later regions draw from the whole catalogue in a
// seeded order that does not repeat until every figure has been used.
const CONSTELLATIONS = [
  {name:'THE NEEDLE',shape:[112,151,105]},
  {name:'THE SAIL',shape:[143,91,144]},
  {name:'THE LYRE',shape:[100,152,117]},
  {name:'THE CROWN',shape:[139,92,143]},
  {name:'THE COMPASS',shape:[106,148,128]},
  {name:'THE HOURGLASS',shape:[146,97,140]},
  {name:'THE SERPENT',shape:[99,147,119]},
  {name:'THE ARGO',shape:[134,102,146]},
  {name:'THE ASTROLABE',shape:[121,149,101]},
  {name:'THE QUILL',shape:[148,105,135]},
  {name:'THE LANTERN',shape:[103,141,124]},
  {name:'THE MOTH',shape:[140,100,150]}
];
// Named feats. Each is recorded at most once per run and reported as it happens.
const OBSERVATIONS = {
  perfectThree:{name:'THREE PERFECT TRANSFERS',latin:'TRES PERFECTI'},
  skipFive:{name:'FIVE ORBITS SKIPPED',latin:'SALTUS QUINQUE'},
  maxSpeed:{name:'THE FULL PACE OF THE CHART',latin:'VELOCITAS SUMMA'},
  graze:{name:'A BLACK HOLE GRAZED AT FULL SPEED',latin:'PERICULUM'},
  pureChart:{name:'A CONSTELLATION IN PERFECT TRANSFERS',latin:'LINEA PURA'},
  fortyRows:{name:'THE FORTIETH ROW',latin:'ALTITUDO'},
  threeMinutes:{name:'THREE MINUTES ALOFT',latin:'VIGILIA'},
  rightAngle:{name:'A RIGHT ANGLE OF ARRIVAL',latin:'ANGULUS RECTUS'}
};
// An arrival whose incoming line meets the orbit's radius this close to a right angle is a square.
const SQUARE_TOLERANCE = 1.5;
// Black holes pull inward and are lethal to their drawn edge; sunspot flares push
// outward over the same field and only their smaller core kills. An absent kind is a
// black hole, so older hazards and fixtures keep their behaviour.
function hazardCore(h) { return h.kind==='flare'?h.r*.6:h.r; }
function gravityRadius(h) { return h.r+100; }
function bendVelocity(p,hazards,dt) {
  let ax=0,ay=0;
  for(const h of hazards){
    const dx=h.x-p.x,dy=h.y-p.y,d2=dx*dx+dy*dy,reach=gravityRadius(h);
    if(d2>=reach*reach||d2<1e-10)continue;
    const d=Math.sqrt(d2),edge=1-d/reach,sign=h.kind==='flare'?-1:1;
    const pull=sign*1800*h.r*h.r/(d2+h.r*h.r*.36)*edge*edge;
    ax+=dx/d*pull;ay+=dy/d*pull;
  }
  // This local arcade field turns momentum while preserving earned speed.
  const speed2=p.vx*p.vx+p.vy*p.vy;
  if(speed2<1e-10)return 0;
  const turn=clamp((p.vx*ay-p.vy*ax)/speed2,-2.4,2.4)*dt;
  if(turn){const c=Math.cos(turn),s=Math.sin(turn),vx=p.vx;p.vx=vx*c-p.vy*s;p.vy=vx*s+p.vy*c;}
  return turn;
}
// Real flight and prediction share the same steering and swept contacts.
function flightStep(p,nodes,hazards,time,dt,launchY,width) {
  const turn=bendVelocity(p,hazards,dt),x=p.x,y=p.y,bx=x+p.vx*dt,by=y+p.vy*dt;
  const reach=Math.hypot(p.vx,p.vy)*dt;let hit=null,first=dt+1;
  for(const n of nodes){
    if(n.visited||n.y>launchY+90||Math.abs(n.y-y)>reach+n.cap)continue;
    const contact=transferContact({x,y},p,n,time,dt);
    if(contact&&contact.time<first){first=contact.time;hit={kind:'node',n,contact};}
  }
  for(const h of hazards){
    const t=segmentCircle(x,y,bx,by,h.x,h.y,hazardCore(h)+3);
    if(t!==null&&t*dt<=first){first=t*dt;hit={kind:'hole',h};}
  }
  const boundary=width/2+16;
  if(Math.abs(bx)>boundary){
    const fraction=Math.abs(x)>=boundary?0:clamp(((bx>0?boundary:-boundary)-x)/(bx-x),0,1);
    if(fraction*dt<first){first=fraction*dt;hit={kind:'edge'};}
  }
  const used=hit?first:dt;p.x=x+p.vx*used;p.y=y+p.vy*used;
  return {hit,dt:used,turn};
}
function freeFlightStep(p,hazards,remaining) {
  let entry=remaining;
  for(const h of hazards){
    const t=segmentCircle(p.x,p.y,p.x+p.vx*remaining,p.y+p.vy*remaining,h.x,h.y,gravityRadius(h));
    if(t!==null)entry=Math.min(entry,t*remaining);
  }
  // Skip force-free sections on the same 120 Hz grid as real flight.
  return Math.min(remaining,Math.max(FLIGHT_STEP,Math.floor(entry/FLIGHT_STEP)*FLIGHT_STEP));
}
// The arrival angle: 90 is a line exactly tangent to the drawn ring. A smooth entry that joined a
// little inside or outside reads a few degrees under or over; a flight coming straight down at the
// centre reads near nothing. One definition, shared by the landing and by the guide that predicts it.
function arrivalAngle(n,rx,ry,rvx,rvy,radius,perfect) {
  if(perfect)return 90+Math.asin(clamp((radius-n.r)/n.r,-1,1))*180/Math.PI;
  return Math.atan2(Math.abs(rx*rvy-ry*rvx),-(rx*rvx+ry*rvy))*180/Math.PI;
}
// An arrival steeper than this still joins — there is no way to steer a flight once it is released,
// so refusing it outright left a mistimed release with nothing to recover onto — but earns nothing:
// see the steep case in OrbitWorld.capture. It is set to catch a flight that is falling onto a planet
// rather than crossing its rim — about a quarter of the arrivals the chart offers — while leaving
// anything with real angle on it the forgiving ordinary capture it has always been. A tangent-seeking
// pilot never meets it at all.
const GRAZE_MINIMUM = 16;
function arrivalAim(n,contact,distance,vx,vy) {
  const speed=Math.hypot(vx,vy);
  const angle=arrivalAngle(n,contact.rx,contact.ry,contact.rvx,contact.rvy,contact.distance,contact.perfect);
  return {n,distance,perfect:contact.perfect,angle,steep:angle<GRAZE_MINIMUM,entryAngle:Math.atan2(contact.ry,contact.rx),entryDir:contact.rx*contact.rvy-contact.ry*contact.rvx>=0?1:-1,cx:contact.cx,cy:contact.cy,radius:contact.distance,dx:vx/speed,dy:vy/speed};
}

class OrbitWorld {
  // offerDifficulty spawns three parallel opening targets — relaxed, classic, hardcore internally,
  // printed as TIRO, ADEPTUS, MAGISTER (see DIFFICULTY_LABELS) — in place of the single first node;
  // whichever one the player captures sets the run's difficulty. Off by default so every existing
  // fixture and fixed layout keeps its ordinary single-node opening.
  constructor(seed, width = 440, height = 860, emit = () => {}, offerDifficulty = false) {
    this.random = seeded(seed); this.seed = seed; this.emit = emit;
    this.width = width; this.height = height; this.time = 0; this.elapsed = 0;
    this.state = 'ready'; this.cameraY = -height * .62; this.floorY = height * .30 - 16;
    this.nodes = []; this.hazards = []; this.nebulas = []; this.row = 0; this.serial = 0;
    this.constellations=[];this.constellationsCompleted=0;this.darknessGrace=0;
    // Figure order and nebula placement use their own streams so the main course
    // generation for a seed is unaffected by them.
    const shuffle=seeded((seed*2654435761>>>0)^0x9e3779b9);
    const deal=list=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(shuffle()*(i+1));const t=list[i];list[i]=list[j];list[j]=t;}return list;};
    // The eight later figures come first, then the four opening ones, so a region past
    // the fourth never repeats a figure until the whole catalogue has been used.
    this.catalogueOrder=[...deal(CONSTELLATIONS.map((_,i)=>i).slice(4)),...deal(CONSTELLATIONS.map((_,i)=>i).slice(0,4))];
    this.nebulaRandom=seeded((seed*40503>>>0)^0x4e65);this.flarePhase=0;
    this.perfectStreak=0;this.observations=[];this.observed=new Set();
    this.score = 0; this.captures = 0; this.perfects = 0; this.squares = 0; this.combo = 1; this.maxCombo = 1; this.progress = 0;
    this.topY = 0; this.lastCaptureAt = 0; this.shake = 0; this.darknessMult = 1; this.inkMult = 1;
    const n = this.makeNode(-45, 0, 57, 0, 'still'); n.visited = true;
    this.lastMain = n;
    this.player = {x:0,y:0,vx:0,vy:0,angle:-.45,dir:-1,speed:offerDifficulty?OPENING_ORBIT_SPEED:BASE_SPEED,rad:n.r,node:n,orbitTime:0,orbitSweep:0,chargeAnnounced:false,tangentCapture:true,flightTime:0,ignore:-1,launch:null,deadTime:0,shielded:false,ink:1,dryAnnounced:false};
    this.positionPlayer();
    if (offerDifficulty) this.spawnDifficultyPaths(); else this.ensureAhead();
  }
  // Three targets, side by side at the first row, each carrying a difficulty. Row generation
  // stays paused (see ensureAhead) until the player captures one of them.
  spawnDifficultyPaths() {
    const y = this.lastMain.baseY - 207, gap = Math.min(140, this.width * .32);
    this.difficultyPending = true;
    for (const [choice, x] of [['relaxed', -gap], ['classic', 0], ['hardcore', gap]]) {
      const n = this.makeNode(x, y, 54, 1, 'still');
      n.difficultyChoice = choice;
    }
    this.row = 1;
  }
  makeNode(x, y, r, row, type) {
    const n = {id:this.serial++,x,y,baseX:x,baseY:y,r,cap:r+11,row,type,phase:this.random()*TAU,seed:Math.floor(this.random()*1e8),visited:false,flash:0,vx:0,vy:0,amp:type==='drift'?12+this.random()*10:0};
    this.nodes.push(n); return n;
  }
  // The furthest from the middle a node of this radius may be cut and still keep its whole orbit —
  // and the traveller riding it — inside the chart's edge, which is where a run is lost.
  inboard(r) { return Math.max(40, this.width/2 - r - 22); }
  generateRow() {
    const k = ++this.row, prev = this.lastMain, rng = this.random;
    const region=Math.floor(k/8),local=k%8,fork=local>=3&&local<=7;
    const side=((this.seed>>region)&1)?1:-1;
    const grow = chartGrowth(k);
    // The orbits open with the chart, up to half as wide again. A wider ring is swept more slowly at
    // the same pace and presents a larger rim from further off, which is what keeps the release
    // window about as wide in the hand as it was when the orbits sat close together.
    const size = Math.min(grow,1.5);
    // The chart opens sideways as well as upward, but never past what the sheet can hold: a captured
    // orbit has to stay clear of the chart's edge, which is where the traveller is lost.
    const spread = Math.min(this.width*.29*Math.min(grow,1.45), this.inboard(57*size), 232);
    const apart = 58*grow;
    let x = k === 1 ? 77 : k === 2 ? -75 : (rng()-.5)*spread*2;
    if (k > 2 && Math.abs(x - prev.baseX) < apart) x = clamp(x + (x < 0 ? apart*1.24 : -apart*1.24), -spread, spread);
    // Every transfer is cut to about TRANSFER_SECONDS at the pace the chart is drawn for, so the
    // gulf between two orbits grows with that pace rather than with the row number.
    let y = prev.baseY - (k <= 2 ? 207 : chartPace(k)*TRANSFER_SECONDS + rng()*30);
    let radius = k < 3 ? 54 : (54 - Math.min(13,k*.39) + rng()*7)*size;
    if(fork){x=local===3||local===7?0:-side*Math.min([0,0,0,0,100,82,106][local]*grow,spread);radius=(local===3||local===7?55:55-Math.min(region,4)*2)*size;}
    const type = k===2||k>=7&&k%8===7?'sling':k >= 14 && k%7===0 ? 'fading' : k>=8 && k%4===0 ? 'drift' : 'still';
    // A slingshot star keeps its original ring whatever the chart does around it: the charge is
    // earned per lap, so a wider ring would only make the same 90 units of speed cost more time
    // against the rising dark.
    if(type==='sling'){if(k>=7)x=0;radius=57;}
    const slingOrigin=this.nodes.find(q=>q.shortcut&&k>q.row&&k<=q.row+2);
    if(slingOrigin){
      const first=k===slingOrigin.row+1,edge=this.inboard(radius);
      x=first?clamp(-slingOrigin.shortcut.x*1.2,-edge,edge):slingOrigin.shortcut.x;
      y=first?slingOrigin.y-224*grow:slingOrigin.shortcut.y;
    }
    const n = this.makeNode(x,y,radius,k,type);
    // The star's own shortcut stays about two and a half rows deep, so it opens up with the chart:
    // the reach a full nib and a full lap buy together is always the same number of orbits skipped.
    if(type==='sling'&&k>=7)n.shortcut={x:-side*Math.min(98*grow,this.inboard(54*size)),y:y-chartPace(k)*TRANSFER_SECONDS*2.55,r:54*size};
    if(slingOrigin&&k===slingOrigin.row+2)slingOrigin.shortcutId=n.id;
    // The capture band opens with the chart. A long crossing is aimed from further off, so the
    // angle that finds the rim is finer; the band grows with the gulf to keep the release window
    // about as wide in the hand as it was when the orbits were close together.
    n.cap = n.r + Math.max(6, 12-k*.13)*grow;
    this.lastMain = n;
    if(fork){
      n.routeId=region;n.routeRole=local===3?'entry':local===7?'exit':'main';
      if(local===3){
        const catalogueIndex=this.catalogueFor(region);
        this.constellations.push({id:region,catalogueIndex,name:CONSTELLATIONS[catalogueIndex].name,entry:n,main:[],stars:[],exit:null,mask:0,completed:false,expired:false,pure:true,flash:0,bonus:60});
      }else{
        const chart=this.constellations.find(c=>c.id===region);
        if(local===7)chart.exit=n;
        else{
          chart.main.push(n);
          const i=local-4,shape=CONSTELLATIONS[chart.catalogueIndex].shape;
          const starR=(35-Math.min(region,4))*size,reach=Math.min(shape[i]*size,this.inboard(starR));
          const star=this.makeNode(side*reach,y+[24,42,18][i]*grow,starR,k,'gold');
          star.cap=star.r+9*grow;star.routeId=region;star.routeRole='star';star.starIndex=i;chart.stars.push(star);
        }
      }
    }
    // Small gold satellites offer a harder detour. The main path remains available.
    if (!fork && k >= 4 && k%4 === 0) {
      const side = (prev.x+n.x)>0 ? -1 : 1;
      const ex = side * Math.min(174*grow,this.width*.39,this.inboard(32*size)), ey = (prev.y+n.y)/2;
      if ([prev,n].every(q=>Math.hypot(ex-q.x,ey-q.y)>q.r+82)) this.makeNode(ex,ey,32*size,k-.5,'gold');
    }
    // A rare shield star: one carried charge absorbs the next black-hole contact.
    if (!fork && k >= 10 && k%10 === 0) {
      const side = (prev.x+n.x)>0 ? -1 : 1;
      const ex = side * Math.min(150*grow,this.width*.34,this.inboard(28*size)), ey = (prev.y+n.y)/2-40;
      if (this.nodes.every(q=>Math.hypot(ex-q.x,ey-q.y)>q.r+q.amp+70)) this.makeNode(ex,ey,28*size,k-.5,'shield');
    }
    // Hazards and the ways across. Through the opening regions a hole or a flare is placed clear of
    // every route between the last two main nodes, so it is scenery to be given room rather than an
    // obstacle. From HAZARD_CLOSES_ROUTE onward it is allowed to sit on one of them and shut it: the
    // side you cross on becomes a decision instead of a formality. What is never allowed is closing
    // the last way through — at least one smooth tangent, the route a perfect transfer is flown on,
    // is always left open, and the slingshot's own shortcut is never touched.
    if (!fork && k >= 6 && k%3 !== 1) {
      const r = 18+rng()*11+Math.min(8,k*.14);
      const direct=tangentPaths(prev,n),smooth=[...orbitTangents(prev,n,1),...orbitTangents(prev,n,-1)];
      // Two margins, because a hazard reaches further than it kills. A route closer than `kill` is
      // shut; the route left open has to be clear of the whole gravity field, or it would be bent
      // into the hazard it was supposed to avoid.
      const kill=r+prev.amp+n.amp+25,free=gravityRadius({r})+prev.amp+n.amp+10;
      const mayClose=k>=HAZARD_CLOSES_ROUTE&&k%3===2;
      let chosen=null,clearOf=null;
      for (let tries=0;tries<12&&!chosen;tries++) {
        const hx=(rng()-.5)*Math.min(this.width-72,380), hy=(prev.y+n.y)/2+(rng()-.5)*55;
        if (this.nodes.some(q=>Math.hypot(hx-q.baseX,hy-q.baseY)<q.r+q.amp+r+30)) continue;
        if(slingOrigin&&tangentPaths(slingOrigin,slingOrigin.shortcut).some(p=>pointSegment(hx,hy,p.x,p.y,slingOrigin.shortcut.x,slingOrigin.shortcut.y)<r+25))continue;
        if(slingOrigin&&[...orbitTangents(slingOrigin,slingOrigin.shortcut,1),...orbitTangents(slingOrigin,slingOrigin.shortcut,-1)].some(p=>pointSegment(hx,hy,p.x,p.y,p.bx,p.by)<r+25))continue;
        const toSmooth=smooth.map(p=>pointSegment(hx,hy,p.x,p.y,p.bx,p.by));
        const toDirect=direct.map(p=>pointSegment(hx,hy,p.x,p.y,n.x,n.y));
        const openSmooth=toSmooth.filter(d=>d>=kill).length,openDirect=toDirect.filter(d=>d>=kill).length;
        // The way left open has to be flyable both ways it can be flown: a smooth tangent for a
        // perfect transfer, and a centre-directed line for a player not yet flying them. A hazard
        // closes one side of the crossing, never one style of play.
        const flyable=toSmooth.filter(d=>d>=free).length&&toDirect.filter(d=>d>=free).length;
        if(openSmooth===smooth.length&&openDirect===direct.length){
          // Clear of everything: the old placement, kept as the fallback and used outright until
          // the chart is deep enough for a hazard to be allowed to close a route.
          if(!clearOf)clearOf={hx,hy};
          if(!mayClose)break;
          continue;
        }
        if(mayClose&&flyable>0)chosen={hx,hy};
      }
      const place=chosen||clearOf;
      if(place){
        // From the third region, sunspot flares alternate with black holes under the
        // same placement rules: they repel instead of pulling and only their core kills.
        const kind=k>=16&&(this.flarePhase=(this.flarePhase+1)&1)?'flare':'hole';
        this.hazards.push({x:place.hx,y:place.hy,r,kind,row:k,seed:Math.floor(rng()*1e8),phase:rng()*TAU,near:false});
      }
    }
    // A nebula patch lies across one of the tangent routes between the last two main
    // nodes. It is inert: it neither kills nor pulls, it only hides the far part of the
    // aiming guide. It never covers a capture band, a drift envelope, or a hazard.
    if (k >= 12 && k%4 === 0) {
      const fog=this.nebulaRandom,routes=[...orbitTangents(prev,n,1),...orbitTangents(prev,n,-1)];
      for (let tries=0;tries<14&&routes.length;tries++) {
        const path=routes[Math.floor(fog()*routes.length)],t=.34+fog()*.32;
        const gx=lerp(path.x,path.bx,t),gy=lerp(path.y,path.by,t);
        // The cloud is grown to the largest size that still clears every capture band,
        // drift envelope and hazard field around it, and dropped if that is under 60.
        let room=90;
        for(const q of this.nodes)room=Math.min(room,Math.hypot(gx-q.baseX,gy-q.baseY)-q.cap-q.amp-8);
        for(const h of this.hazards)room=Math.min(room,Math.hypot(gx-h.x,gy-h.y)-gravityRadius(h)+30);
        for(const g of this.nebulas)room=Math.min(room,Math.hypot(gx-g.x,gy-g.y)-g.r);
        if(room<60)continue;
        this.nebulas.push({kind:'nebula',row:k,x:gx,y:gy,r:Math.min(90,room),seed:Math.floor(fog()*1e8),phase:fog()*TAU});break;
      }
    }
  }
  catalogueFor(region) { return region<4?region:this.catalogueOrder[(region-4)%CONSTELLATIONS.length]; }
  // A named feat, reported and recorded once per run.
  observe(key) {
    if(this.observed.has(key)||!OBSERVATIONS[key])return false;
    this.observed.add(key);const record={key,...OBSERVATIONS[key]};
    this.observations.push(record);this.emit('observation',record);return true;
  }
  ensureAhead() { if (this.difficultyPending) return; while (this.lastMain.y > this.cameraY-350) this.generateRow(); }
  positionPlayer() {
    const p=this.player,n=p.node; if (!n) return;
    p.x=n.x+Math.cos(p.angle)*p.rad; p.y=n.y+Math.sin(p.angle)*p.rad;
    p.vx=-Math.sin(p.angle)*p.speed*p.dir+n.vx; p.vy=Math.cos(p.angle)*p.speed*p.dir+n.vy;
  }
  start() { if(this.state!=='ready')return; this.state='playing'; this.emit('start',{}); }
  charge() { const p=this.player;return p.node&&p.node.type==='sling'?clamp(p.orbitSweep/TAU,0,1):0; }
  // What the nib holds, and what a flight of a given length would take out of it. The pressure
  // scales the drain rather than the capacity, so every plate reads the same gauge.
  inkLevel() { return clamp(this.player.ink,0,1); }
  inkCost(distance) { return distance/INK_REACH*this.inkMult; }
  // How far the nib could still carry the traveller, in world units.
  inkRange() { return this.inkLevel()*INK_REACH/Math.max(1e-8,this.inkMult); }
  speedMultiplier(speed=this.player.node?this.player.speed:Math.hypot(this.player.vx,this.player.vy)) { return clamp(speed/BASE_SPEED,1,MAX_SPEED/BASE_SPEED); }
  // Consecutive perfect transfers past the second ease the pursuit by 3% each, to 15%.
  darknessRelief() { return 1-Math.min(.15,Math.max(0,this.perfectStreak-2)*.03); }
  // The flood rises in proportion to the chart it is covering. The plate is cut for a faster pace
  // as the run climbs, so a tide fixed in world units would slacken exactly where the chart opens
  // up; a quarter of that growth keeps the squeeze roughly even without letting the tide outrun what
  // even a skilled run can climb, so the fully developed pursuit reaches about 191 rather than 150.
  darknessSpeed() { return (22+Math.min(128,Math.max(0,this.elapsed-1.5)*.55))*(1+(chartGrowth(this.progress)-1)*.25)*this.darknessMult*this.darknessRelief(); }
  launchVelocity() {
    const p=this.player,rawSpeed=Math.hypot(p.vx,p.vy),speed=Math.min(MAX_SPEED,rawSpeed),ratio=speed/Math.max(1e-8,rawSpeed);
    // Bound repeated assists from moving planets without changing the heading.
    return {vx:p.vx*ratio,vy:p.vy*ratio,speed,charge:this.charge(),factor:this.speedMultiplier(speed)};
  }
  release() {
    if(this.state!=='playing'||!this.player.node)return false;
    const p=this.player,n=p.node;
    this.positionPlayer();
    const launch=this.launchVelocity();p.vx=launch.vx;p.vy=launch.vy;
    p.launch={x:p.x,y:p.y,vx:p.vx,vy:p.vy,row:n.row,dwell:p.orbitTime,sweep:p.orbitSweep,period:TAU*p.rad/p.speed,charge:launch.charge,sling:n.type==='sling'};
    p.ignore=n.id; p.node=null; p.flightTime=0;
    this.emit('release',{x:p.x,y:p.y,vx:p.vx,vy:p.vy,charge:launch.charge,factor:launch.factor,sling:n.type==='sling'}); return true;
  }
  capture(n,contact=null) {
    if(this.state!=='playing'||n.visited)return false;
    const p=this.player,l=p.launch,rx=p.x-(contact?contact.cx:n.x),ry=p.y-(contact?contact.cy:n.y);
    const rvx=p.vx-(contact?contact.vx:n.vx),rvy=p.vy-(contact?contact.vy:n.vy),arrivalSpeed=Math.hypot(rvx,rvy),radius=Math.hypot(rx,ry);
    const cross=rx*rvy-ry*rvx,alignment=clamp(Math.abs(cross)/Math.max(1e-8,radius*arrivalSpeed),0,1);
    const perfect=!!contact?.perfect,scoreMultiplier=this.speedMultiplier(Math.hypot(p.vx,p.vy));
    const angle=arrivalAngle(n,rx,ry,rvx,rvy,radius,perfect);
    // A flight that comes down at the centre rather than across the rim still joins: there is no way
    // to steer a flight once it is released, so turning one away outright only ever stranded a
    // mistimed release with nothing left to recover onto. It lands as the same forgiving hard turn
    // any angled arrival gets, but a steep one earns nothing at all — no score, no skip bonus, no ink
    // dividend — so a careless release is still worse than a patient one, and the choice of pressure
    // is never lost to it.
    const steep=angle<GRAZE_MINIMUM&&!this.difficultyPending;
    const square=!steep&&!!l&&Math.abs(angle-90)<=SQUARE_TOLERANCE,squareBonus=square?Math.round(10*scoreMultiplier):0;
    p.dir=cross>=0?1:-1; p.angle=Math.atan2(ry,rx); p.rad=radius||n.r;p.tangentCapture=perfect;
    // Smooth entries preserve momentum. A hard turn sheds some excess speed.
    p.speed=perfect?arrivalSpeed:clamp(BASE_SPEED+(arrivalSpeed-BASE_SPEED)*(.72+.28*alignment),BASE_SPEED,MAX_SPEED);
    p.node=n; p.orbitTime=0;p.orbitSweep=0;p.chargeAnnounced=false; n.visited=true; n.flash=1;
    // A landing pays the nib back. A clean tangent arrival pays better than a hard turn; a steep one
    // pays nothing, exactly what it cost to get there.
    p.ink=Math.min(1,p.ink+(steep?0:perfect?INK_PERFECT_GAIN:INK_CAPTURE_GAIN));p.dryAnnounced=false;
    if(n.difficultyChoice){
      this.nodes=this.nodes.filter(q=>q===n||!q.difficultyChoice);
      this.difficultyPending=false;this.lastMain=n;
      // The gentler opening pace was only ever meant to ease aiming among the three targets;
      // ordinary pacing begins the moment the choice is made, whatever speed the capture landed at.
      p.speed=BASE_SPEED;
      this.emit('difficulty',{value:n.difficultyChoice});
    }
    this.positionPlayer();
    const skipped=l?Math.max(0,Math.ceil(n.row)-Math.floor(l.row)-1):0,skipBonus=steep?0:Math.round(skipped*10*scoreMultiplier);
    const skip=skipped>0,quick=l&&l.sweep<TAU*1.25;
    this.combo=quick?Math.min(5,this.combo+1):1; this.maxCombo=Math.max(this.maxCombo,this.combo);
    const baseGain=10+(this.combo-1)*2+(perfect?5:0)+(n.type==='gold'?15:0),gain=steep?0:Math.round(baseGain*scoreMultiplier)+skipBonus;
    this.score+=gain+squareBonus; this.captures++; this.perfects+=perfect?1:0; this.squares+=square?1:0;
    this.perfectStreak=perfect?this.perfectStreak+1:0;
    this.progress=Math.max(this.progress,n.row); this.lastCaptureAt=this.elapsed;
    this.shake=perfect?1.8:steep?1.3:1.0;
    this.emit('capture',{x:p.x,y:p.y,n,gain,perfect,steep,skip,skipped,skipBonus,scoreMultiplier,combo:this.combo,angle,square,squareBonus,arrivalSpeed,radius,vx:rvx,vy:rvy,launch:l});
    if(square)this.observe('rightAngle');
    if(this.perfectStreak>=3)this.observe('perfectThree');
    if(skipped>=5)this.observe('skipFive');
    if(this.progress>=40)this.observe('fortyRows');
    if(n.type==='shield'&&!p.shielded){p.shielded=true;this.emit('shield',{x:n.x,y:n.y});}
    if(n.routeId!==undefined&&!perfect){
      const route=this.constellations.find(c=>c.id===n.routeId);if(route)route.pure=false;
    }
    if(n.routeRole==='star'){
      const chart=this.constellations.find(c=>c.id===n.routeId);
      if(chart&&!chart.completed&&!chart.expired){
        chart.mask|=1<<n.starIndex;
        if(chart.mask===7){
          chart.completed=true;chart.flash=2.4;this.constellationsCompleted++;
          this.score+=chart.bonus;this.darknessGrace=4;
          this.emit('constellation',{chart,x:n.x,y:n.y,gain:chart.bonus});
          if(chart.pure)this.observe('pureChart');
        }else this.emit('chartProgress',{chart,x:n.x,y:n.y,count:chart.stars.filter(s=>s.visited).length});
      }
    }
    for(const chart of this.constellations){if(!chart.completed&&this.progress>=chart.entry.row+4)chart.expired=true;}
    return true;
  }
  die(reason) {
    if(this.state!=='playing')return;
    this.state='dead';this.reason=reason;this.player.deadTime=0;this.shake=5;
    this.emit('death',{x:this.player.x,y:this.player.y,reason,score:this.score});
  }
  // A carried shield absorbs one black-hole contact: it consumes itself and
  // reflects the flight outward instead of ending the run.
  hazardHit(h) {
    if(this.state!=='playing')return;
    const p=this.player;
    if(!p.shielded){this.die(h.kind==='flare'?'SEARED BY A SUNSPOT FLARE':'CAUGHT BY A BLACK HOLE');return;}
    p.shielded=false;
    const dx=p.x-h.x,dy=p.y-h.y,d=Math.hypot(dx,dy)||1,nx=dx/d,ny=dy/d,dot=p.vx*nx+p.vy*ny;
    p.vx-=2*dot*nx;p.vy-=2*dot*ny;
    const clear=hazardCore(h)+8;if(d<clear){p.x=h.x+nx*clear;p.y=h.y+ny*clear;}
    this.shake=3;this.emit('shieldBreak',{x:p.x,y:p.y});
  }
  resize(width,height) {
    const oldHeight=this.height;this.width=width;this.height=height;
    this.cameraY-=(height-oldHeight)*.62;
    if(this.state==='ready')this.floorY=height*.30-16;
    // A narrower sheet must not strand what was already drawn outside its edge: everything the chart
    // carries is pulled back inboard, and the traveller rides its own orbit in.
    for(const n of this.nodes){
      const edge=this.inboard(n.r+n.amp);
      n.baseX=clamp(n.baseX,-edge,edge);
      n.x=n.amp?n.baseX+Math.sin(this.time*.72+n.phase)*n.amp:n.baseX;
      if(n.shortcut){const far=this.inboard(n.shortcut.r);n.shortcut.x=clamp(n.shortcut.x,-far,far);}
    }
    for(const h of this.hazards){const edge=this.inboard(h.r);h.x=clamp(h.x,-edge,edge);}
    for(const g of this.nebulas){const edge=this.inboard(g.r);g.x=clamp(g.x,-edge,edge);}
    if(this.player.node)this.positionPlayer();
    this.ensureAhead();
  }
  update(dt) {
    if(this.state==='paused')return;
    this.flightPreview=null;
    this.time+=dt;this.shake*=Math.exp(-9*dt);
    if(this.state==='dead'){this.player.deadTime+=dt;return;}
    for(const n of this.nodes){
      n.flash=Math.max(0,n.flash-dt*1.8);
      if(n.amp){n.x=n.baseX+Math.sin(this.time*.72+n.phase)*n.amp;n.vx=Math.cos(this.time*.72+n.phase)*n.amp*.72;}
    }
    const p=this.player;
    if(this.state==='ready'){p.angle+=p.dir*dt*.78;this.positionPlayer();return;}
    // The rising dark must not creep up while the difficulty choice is still pending: the player is
    // meant to read all three targets and aim at leisure, not race a pursuit that already started.
    if(!this.difficultyPending)this.elapsed+=dt;
    const oldX=p.x,oldY=p.y,wasOrbiting=!!p.node;
    if(p.node){
      p.orbitTime+=dt;
      if(!p.tangentCapture)p.rad=lerp(p.rad,p.node.r,1-Math.exp(-dt*10));
      const turn=p.speed/p.rad*dt,chargeStep=Math.min(turn,Math.max(0,TAU-p.orbitSweep));p.angle+=p.dir*turn;
      p.orbitSweep+=turn;
      // The nib re-charges on the ring it is holding, and a slingshot star fills it over its lap:
      // dwelling buys ink, which is what makes the rising dark the price of a long transfer.
      const wasDry=p.ink<=0;
      p.ink=Math.min(1,p.ink+(p.node.type==='sling'?INK_SLING_GAIN:INK_ORBIT_GAIN)*dt);
      if(wasDry&&p.ink>0)p.dryAnnounced=false;
      if(p.node.type==='sling'){
        if(p.speed<MAX_SPEED)p.speed=Math.min(MAX_SPEED,p.speed+STAR_GAIN*chargeStep/TAU);
        if(p.speed>=MAX_SPEED)this.observe('maxSpeed');
        if((p.orbitSweep>=TAU||p.speed>=MAX_SPEED)&&!p.chargeAnnounced){p.chargeAnnounced=true;this.emit('charged',{x:p.node.x,y:p.node.y,max:p.speed>=MAX_SPEED});}
      }
      this.positionPlayer();
      if(p.node.type==='fading'&&p.orbitTime>4.5)this.die('THE ORBIT FADED');
    }else{
      let remaining=dt,time=this.time-dt;
      while(remaining>1e-9&&this.state==='playing'&&!p.node){
        const step=this.hazards.length?Math.min(FLIGHT_STEP,remaining):remaining,ax=p.x,ay=p.y;
        const result=flightStep(p,this.nodes,this.hazards,time,step,p.launch?.y??p.y,this.width);
        p.flightTime+=result.dt;remaining-=step;time+=step;
        // The line costs ink by its length. What the step drew is spent before anything else is
        // settled, but the landing is settled first: a transfer that arrives on the last drop stands.
        p.ink=Math.max(0,p.ink-this.inkCost(Math.hypot(p.x-ax,p.y-ay)));
        if(result.hit?.kind==='hole')this.hazardHit(result.hit.h);
        else if(result.hit?.kind==='edge')this.die('LEFT THE STAR CHART');
        else if(result.hit?.kind==='node')this.capture(result.hit.n,result.hit.contact);
        if(this.state==='playing'&&!p.node&&p.ink<=0)this.die('THE NIB RAN DRY');
        if(this.state==='playing'&&!p.node)for(const h of this.hazards){
          if(!h.near&&pointSegment(h.x,h.y,ax,ay,p.x,p.y)<h.r+17){
            h.near=true;this.score+=5;this.emit('near',{x:p.x,y:p.y});
            if(h.kind!=='flare'&&Math.hypot(p.vx,p.vy)>=MAX_SPEED-.5)this.observe('graze');
          }
        }
      }
    }
    if(wasOrbiting)for(const h of this.hazards){
      const d=pointSegment(h.x,h.y,oldX,oldY,p.x,p.y);
      if(d<hazardCore(h)+3)this.hazardHit(h);
    }
    if(this.elapsed>=180)this.observe('threeMinutes');
    this.topY=Math.min(this.topY,p.y);
    const target=this.topY-this.height*.57;
    if(target<this.cameraY)this.cameraY=lerp(this.cameraY,target,1-Math.exp(-dt*4));
    const respite=Math.min(dt,this.darknessGrace);this.darknessGrace=Math.max(0,this.darknessGrace-dt);
    if(this.elapsed>1.5)this.floorY+=48*respite-this.darknessSpeed()*(dt-respite);
    this.floorY=Math.min(this.floorY,this.cameraY+this.height-25);
    if(p.y>this.floorY-4)this.die('THE DARK CAUGHT UP');
    if(Math.abs(p.x)>this.width/2+16)this.die('LEFT THE STAR CHART');
    this.ensureAhead();
    this.nodes=this.nodes.filter(n=>n===p.node||n.y<this.floorY+170);
    this.hazards=this.hazards.filter(h=>h.y<this.floorY+170);
    this.nebulas=this.nebulas.filter(g=>g.y-g.r<this.floorY+170);
    if(this.constellations.length>14)this.constellations=this.constellations.slice(-14);
    for(const chart of this.constellations){
      chart.flash=Math.max(0,chart.flash-dt);
      if(!chart.completed&&chart.stars.some(s=>!s.visited&&s.y-s.cap>this.floorY-4))chart.expired=true;
    }
  }
  aim() {
    const p=this.player;if(!p.node){this.flightPreview=null;return null;}
    const launch=this.launchVelocity(),speed=launch.speed,dx=launch.vx/speed,dy=launch.vy/speed;
    // Check every generated destination, including transfers beyond the screen.
    const reach=this.nodes.reduce((range,n)=>n.visited?range:Math.max(range,Math.hypot(n.x-p.x,n.y-p.y)+n.cap+n.amp*2),speed*1.9);
    const bx=p.x+dx*reach,by=p.y+dy*reach;
    let best=null,hitAt=2;
    for(const n of this.nodes){
      if(n.visited||n.y>p.y+90)continue;
      const hit=transferContact(p,launch,n,this.time,reach/speed);if(!hit)continue;
      const t=hit.time*speed/reach;if(t>=hitAt)continue;
      hitAt=t;best=arrivalAim(n,hit,hit.time*speed,launch.vx,launch.vy);
    }
    // The opening targets never cost a landing its credit, so the guide must not warn that this one will.
    if(best&&this.difficultyPending)best.steep=false;
    const until=best?best.distance:reach;
    const gravity=this.hazards.some(h=>segmentCircle(p.x,p.y,p.x+dx*until,p.y+dy*until,h.x,h.y,gravityRadius(h))!==null);
    if(gravity)return this.curvedAim(launch,reach/speed+4);
    if(best&&this.hazards.some(h=>{const t=segmentCircle(p.x,p.y,bx,by,h.x,h.y,h.r+3);return t!==null&&t<=hitAt;}))return null;
    const length=best?best.distance:p.node.type==='sling'?speed*1.9:83;
    this.flightPreview={points:[{x:p.x,y:p.y,time:0,distance:0},{x:p.x+dx*length,y:p.y+dy*length,time:length/speed,distance:length}],aim:best,curved:false,blocked:false,steps:0};
    this.fogPreview();
    this.markInk(this.flightPreview,best);
    return best;
  }
  // What the drawn transfer would take out of the nib, and whether the nib can pay for it. A
  // transfer the ink cannot reach is still aimed and still drawn — it is marked dry, so the choice
  // to fly it stays the player's, made knowing the line stops short.
  markInk(preview,aim) {
    if(!preview)return preview;
    preview.inkRange=this.inkRange();
    preview.inkCost=this.inkCost(aim?aim.distance:preview.points[preview.points.length-1].distance);
    preview.dry=!!aim&&preview.inkCost>this.inkLevel();
    if(aim)aim.dry=preview.dry;
    return preview;
  }
  // How far the chart is still drawn ahead of the traveller at the pace in hand.
  sightRange() {
    const p=this.player,speed=p.node?p.speed:Math.hypot(p.vx,p.vy);
    return lerp(SIGHT_FAR,SIGHT_NEAR,clamp((speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1));
  }
  // Two things hide the chart, and both cut the drawn course at the nearer of them: a nebula, which
  // hides everything past its near edge, and the pace itself, which leaves the far part of a fast
  // crossing unset. Either way the preview stops and is marked fogged. The aim itself, and the
  // release marks on the current orbit, stand.
  fogPreview() {
    const preview=this.flightPreview;if(!preview)return preview;
    preview.fogged=false;
    const pts=preview.points;if(pts.length<2)return preview;
    // What the course actually comes to, kept whole. Fog decides how much of it is drawn, never what
    // the flight will do, so prediction can still be checked against the real thing.
    preview.landing={x:pts[pts.length-1].x,y:pts[pts.length-1].y,distance:pts[pts.length-1].distance};
    const sight=this.sightRange();
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i],b=pts[i+1];let first=null;
      for(const g of this.nebulas){
        const t=segmentCircle(a.x,a.y,b.x,b.y,g.x,g.y,g.r);
        if(t!==null&&(first===null||t<first))first=t;
      }
      // The pace's own horizon, wherever it falls inside this leg.
      if(b.distance>sight&&b.distance>a.distance){
        const t=clamp((sight-a.distance)/(b.distance-a.distance),0,1);
        if(first===null||t<first)first=t;
      }
      if(first===null)continue;
      const entry={x:lerp(a.x,b.x,first),y:lerp(a.y,b.y,first),time:lerp(a.time,b.time,first),distance:lerp(a.distance,b.distance,first)};
      preview.points=pts.slice(0,i+1).concat([entry]);preview.fogged=true;break;
    }
    return preview;
  }
  curvedAim(launch,duration) {
    const source=this.player,p={x:source.x,y:source.y,vx:launch.vx,vy:launch.vy};
    const preview={points:[{x:p.x,y:p.y,time:0,distance:0}],aim:null,curved:false,blocked:false,steps:0};
    let time=0,distance=0,bend=0;
    while(time<duration-1e-9&&preview.steps<4096){
      const dt=freeFlightStep(p,this.hazards,duration-time),x=p.x,y=p.y;
      const result=flightStep(p,this.nodes,this.hazards,this.time+time,dt,source.y,this.width);
      time+=result.dt;distance+=Math.hypot(p.x-x,p.y-y);bend+=Math.abs(result.turn);preview.steps++;
      const last=preview.points[preview.points.length-1];
      if(result.hit||time>=duration-1e-9||(distance-last.distance>=9&&preview.points.length<384))preview.points.push({x:p.x,y:p.y,time,distance});
      if(result.hit){
        if(result.hit.kind==='node')preview.aim=arrivalAim(result.hit.n,result.hit.contact,distance,p.vx,p.vy);
        else preview.blocked=result.hit.kind;
        break;
      }
    }
    if(preview.aim&&this.difficultyPending)preview.aim.steep=false;
    preview.curved=bend>.001;this.flightPreview=preview;this.fogPreview();this.markInk(preview,preview.aim);return preview.aim;
  }
}
// END SIMULATION
