/* Fixture builders shared by the sequential checks in checks.mjs: small hand-built worlds and flights
   that isolate one mechanic (a flyby, a tangent arrival, a hazard-bent guide, a distant transfer...)
   from the seeded playthroughs in tasks.mjs. Pure functions of the sim API and the fixed step alone.
*/
import assert from 'node:assert/strict';
import {step,OrbitWorld,orbitTangents,flightStep} from './sandbox.mjs';

// Black-hole flybys bend close, slow flights most strongly while preserving
// the player's selected speed. The field ends cleanly outside its drawn range.
export function flyby(offset,speed){
  const h={x:0,y:0,r:24,seed:1,phase:0},p={x:offset,y:180,vx:0,vy:-speed};let minDistance=Infinity,hit=null;
  for(let i=0;i<120*6&&p.y>-180&&!hit;i++){
    const result=flightStep(p,[],[h],i*step,step,4000);minDistance=Math.min(minDistance,Math.hypot(p.x,p.y));hit=result.hit;
  }
  return {p,hit,minDistance,turn:Math.atan2(-p.vx,-p.vy)};
}

// Sunspot flares use the same field radius and the same steering, with the sign
// reversed: they push the flight outward, preserve its speed, and end just as cleanly.
export function flareFlyby(offset,speed){
  const h={x:0,y:0,r:24,kind:'flare',seed:2,phase:0},p={x:offset,y:180,vx:0,vy:-speed};let minDistance=Infinity,hit=null;
  for(let i=0;i<120*6&&p.y>-180&&!hit;i++){
    const result=flightStep(p,[],[h],i*step,step,4000);minDistance=Math.min(minDistance,Math.hypot(p.x,p.y));hit=result.hit;
  }
  return {p,hit,minDistance,turn:Math.atan2(-p.vx,-p.vy)};
}

// Newton mode: a main body's own pull bends a free flight the way a hazard's field does, but with one
// deliberate difference — it is a real acceleration rather than a direction-only steer. Over a full
// symmetric pass the field gives back on the way out almost exactly what it took on the way in (the
// same conservative-field behaviour that lets a real slingshot trade a course for speed rather than
// create it), so what actually tells a Newtonian body apart from a hazard is the traveller's transient
// speed at closest approach, not its speed once clear of the field again. newtonOn is otherwise inert:
// none of the flybys above pass it, and it does nothing without it (see the false case below).
export function newtonFlyby(offset,speed,newtonOn=true){
  const n={x:0,y:0,r:50,cap:1,amp:0,vx:0,vy:0,visited:false,type:'still',seed:1,phase:0};
  const p={x:offset,y:180,vx:0,vy:-speed};let minDistance=Infinity,hit=null,speedAtClosest=speed;
  for(let i=0;i<120*6&&p.y>-180&&!hit;i++){
    const result=flightStep(p,[n],[],i*step,step,4000,1,newtonOn);
    const d=Math.hypot(p.x,p.y);if(d<minDistance){minDistance=d;speedAtClosest=Math.hypot(p.vx,p.vy);}
    hit=result.hit;
  }
  return {p,hit,minDistance,speedAtClosest,speed:Math.hypot(p.vx,p.vy),turn:Math.atan2(-p.vx,-p.vy)};
}

// A head-on approach feels no turning force, so it reaches the lethal core directly:
// a vortex is lethal to its drawn edge, a flare only inside a core of 0.6 r.
export function headOn(kind){
  const h={x:0,y:0,r:24,kind,seed:5,phase:0},p={x:0,y:180,vx:0,vy:-300};let hit=null;
  for(let i=0;i<120*3&&p.y>-180&&!hit;i++)hit=flightStep(p,[],[h],i*step,step,4000).hit;
  return {hit,y:p.y};
}

// The arrival angle reads 90 for a line exactly tangent to the drawn ring, a little off for a smooth
// entry joined inside or outside it, and far below for a hard turn toward the centre. Only the exact
// tangent is a square and earns its own bonus, once per landing, on top of the perfect transfer.
export function tangentArrival(offset){
  const events=[],w=new OrbitWorld(31,440,860,(type,e)=>{if(type==='capture')events.push(e);}),origin=w.player.node;
  const destination=w.makeNode(120,-400,54,1,'still');w.nodes=[origin,destination];w.lastMain=destination;w.row=1;w.ensureAhead=()=>{};w.hazards=[];
  const path=orbitTangents(origin,destination,-1)[0];assert(path,'A tangent route must exist for the fixture');
  w.player.angle=path.angle+offset;w.player.dir=-1;w.player.speed=150;w.positionPlayer();w.start();w.release();
  for(let i=0;i<120*8&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.player.node,destination);assert.equal(events.length,1);return {event:events[0],world:w};
}

export function curvedFixture(speed=240,drift=false,angle=-.002){
  const captures=[],w=new OrbitWorld(712,440,860,(type,e)=>{if(type==='capture')captures.push(e);}),origin=w.player.node;
  origin.x=origin.baseX=-57;const destination=w.makeNode(70,-420,50,2,drift?'drift':'still');
  w.nodes=[origin,destination];w.lastMain=destination;w.row=2;w.ensureAhead=()=>{};
  w.hazards=[{x:70,y:-170,r:24,seed:43,phase:.2,near:false}];
  w.releaseGrace=0;w.player.angle=angle;w.player.dir=-1;w.player.speed=speed;w.positionPlayer();w.start();return {w,destination,captures};
}

// The curved guide and real flight must agree through a repulsive field too. Like the fixture above, it
// is flown with no release grace, since what it compares is the guide's solver against flight at one
// exact point of the orbit; the grace is proved separately, below.
export function flareFixture(angle){
  const captures=[],w=new OrbitWorld(713,440,860,(type,e)=>{if(type==='capture')captures.push(e);}),origin=w.player.node;
  origin.x=origin.baseX=-57;const destination=w.makeNode(70,-420,50,2,'still');
  w.nodes=[origin,destination];w.lastMain=destination;w.row=2;w.ensureAhead=()=>{};
  w.hazards=[{x:70,y:-170,r:24,kind:'flare',seed:44,phase:.2,near:false}];
  w.releaseGrace=0;w.player.angle=angle;w.player.dir=-1;w.player.speed=240;w.positionPlayer();w.start();return {w,destination,captures};
}

// The curved guide and real flight must agree through a gust too, and a gust must actually bend a
// crossing without ever ending one: a wind-head has no lethal core at all.
export function windFixture(angle,dir=Math.PI*.5){
  const captures=[],w=new OrbitWorld(714,440,860,(type,e)=>{if(type==='capture')captures.push(e);}),origin=w.player.node;
  origin.x=origin.baseX=-57;const destination=w.makeNode(70,-420,50,2,'still');
  w.nodes=[origin,destination];w.lastMain=destination;w.row=2;w.ensureAhead=()=>{};
  w.hazards=[{x:70,y:-170,r:30,kind:'wind',dir,seed:45,phase:.2,near:false}];
  w.releaseGrace=0;w.player.angle=angle;w.player.dir=-1;w.player.speed=240;w.positionPlayer();w.start();return {w,destination,captures};
}

// A nebula is inert. It only cuts the drawn guide at its near edge.
export function nebulaFixture(withFog){
  const captures=[],w=new OrbitWorld(214,440,860,(type,e)=>{if(type==='capture')captures.push(e);});
  const origin=w.player.node,destination=w.makeNode(0,-300,50,1,'still');
  origin.x=origin.baseX=50-origin.r;w.player.angle=0;w.player.dir=-1;w.player.speed=240;w.positionPlayer();
  w.nodes=[origin,destination];w.lastMain=destination;w.row=1;
  w.nebulas=withFog?[{kind:'nebula',x:50,y:-150,r:70,seed:9,phase:0}]:[];
  w.start();return {w,destination,captures};
}

// A perfect transfer reaches a rim tangent without changing direction or speed.
// Test both arrival windings, fast frame-spanning flights, and rough center hits.
export function transferFixture(offset,speed=240,drift=false){
  const captures=[],w=new OrbitWorld(101,440,860,(type,e)=>{if(type==='capture')captures.push(e);});
  const origin=w.player.node,destination=w.makeNode(0,-300,50,1,drift?'drift':'still');
  if(drift){destination.amp=18;destination.phase=.4;}
  origin.x=origin.baseX=offset-origin.r;w.player.angle=0;w.player.dir=-1;w.player.speed=speed;w.positionPlayer();
  // Flown with no release grace: these are the capture mechanics at one exact release point, and an
  // angled release a few thousandths from a tangent would otherwise be let go on the tangent instead.
  w.releaseGrace=0;
  w.nodes=[origin,destination];w.lastMain=destination;w.row=1;w.start();return {w,destination,captures};
}

// A clear 1,800-unit transfer used to die at 3.6 seconds, before reaching its
// destination. Flight duration must never override a valid distant landing.
export function distantTransfer(boosted=true){
  const captures=[],w=new OrbitWorld(99,440,860,(type,e)=>{if(type==='capture')captures.push(e);});
  const origin=w.player.node;origin.type=boosted?'sling':'still';
  w.player.angle=0;w.player.dir=-1;w.player.orbitSweep=Math.PI*2;
  w.player.speed=boosted?240:150;
  w.positionPlayer();
  // Offset enough to cross the rim at about 27 degrees: an ordinary capture, as this fixture wants,
  // but not the near-radial drop the rim now turns away.
  const destination=w.makeNode(origin.x+origin.r+25,-1800,54,8,'still');
  // No release grace: the hazard case below aims its release into the vortex on purpose, and the grace
  // would otherwise let it go from the neighbouring point that clears it.
  w.releaseGrace=0;
  w.nodes=[origin,destination];w.lastMain=destination;w.row=8;w.start();
  return {w,destination,captures};
}
