/* The main-thread sequential checks: fast, fixture-based assertions run directly in this process
   while the seeded playthroughs and full-page runtime scenarios fly on their own worker threads
   (see the driver in ../verify.mjs, which awaits their promises and passes them in as pRoute etc.
   below). Kept as one function, in the order the original suite always ran it in, because most of
   its local state — captures, catalogue draws, hazard tallies — threads through to the final
   JSON summary at the end. */
import assert from 'node:assert/strict';
import {step,OrbitWorld,segmentCircle,segmentCapsuleTime,segmentSegmentDist,tangentPaths,orbitTangents,transferContact,pointSegment,gravityRadius,hazardCore,hazardKind,bendVelocity,flightStep,CONSTELLATIONS,OBSERVATIONS,BASE_SPEED,MAX_SPEED,SWEEP_FULL,STAR_GAIN,GRAZE_MINIMUM,INK_PERFECT_GAIN,INK_CAPTURE_GAIN,INK_ORBIT_GAIN,DARKNESS_RESCUE_GRACE,RELEASE_GRACE} from './sandbox.mjs';
import {flyby,flareFlyby,newtonFlyby,headOn,tangentArrival,curvedFixture,flareFixture,windFixture,nebulaFixture,transferFixture,distantTransfer} from './fixtures.mjs';

// Runs every sequential check in the original suite's order, given the bundled page (script and its
// enclosing html), the quick flag, and the five playthrough and the layouts promises the driver fired
// off in parallel. Left to throw on the first failed assertion, exactly as the inline suite always did.
export async function runSequentialChecks({script,html,quick,pRoute,pChasmRoute,pDetourDeep,pSling,pVaried,pLayouts}){

// Nothing may ask the plate which era it is by name. Twenty-one places once did, across four files,
// and every era after the first would have had to be answered at all of them; the plate is asked what
// it does instead. This is the guard that keeps that true, because the cheapest way to add an era is
// always to add a second name beside the first.
assert(!/ceilingPlate/.test(script),'No code may ask whether the plate is the Ceiling by name');

assert.equal(segmentCircle(-100,0,100,0,0,0,10),.45,'Swept collision must detect fast crossing');
assert.equal(segmentCircle(-100,20,100,20,0,0,10),null);
assert.equal(segmentCircle(0,0,100,0,0,0,10),0);

// ---------- The chasm: a capsule, era I's own hazard ----------
// segmentCapsuleTime is the swept test flightStep uses for a chasm: a moving point against a fixed
// segment with a half-width, in place of segmentCircle's moving point against a fixed centre.
{
  // A capsule lying along y=0 from x=-50 to x=50, half-width 10: a flight crossing it head-on from
  // above must be caught at the fraction of its step where it first comes within that half-width,
  // exactly as segmentCircle reports a fraction for a circle.
  assert(Math.abs(segmentCapsuleTime(0,-100,0,100,-50,0,50,0,10)-.45)<1e-6,'A capsule is crossed exactly as its circle equivalent would be, straight on');
  // Passing well clear of the whole capsule, including its rounded reach past either end, never hits.
  assert.equal(segmentCapsuleTime(-200,50,200,50,-50,0,50,0,10),null,'A flight that never nears the capsule is never caught');
  // A flight already inside the half-width at the very start of the step is caught at t=0.
  assert.equal(segmentCapsuleTime(0,0,0,50,-50,0,50,0,10),0,'A flight starting inside the capsule is caught immediately');
  // A grazing flight parallel to a long capsule, offset by exactly its half-width, must not be
  // reported as crossing it — a flight lying exactly along a segment's own length has nothing to
  // enter, unlike a straight line crossing it, so the convex bisection must not mis-fire tangent to it.
  assert.equal(segmentCapsuleTime(-60,10.5,60,10.5,-50,0,50,0,10),null,'A flight passing just outside a long capsule\'s width is never caught');
  // segmentSegmentDist is the placement-time check: zero where two segments actually cross, and
  // otherwise the true minimum distance between them, achieved at an endpoint.
  assert.equal(segmentSegmentDist(-10,-10,10,10,-10,10,10,-10),0,'Crossing segments are zero apart');
  assert.equal(segmentSegmentDist(0,0,10,0,0,5,10,5),5,'Two parallel segments are exactly their offset apart');
}

// ---------- The chasm: generation, fairness, and lethality ----------
{
  // The flag defaults off, and off it must generate nothing at all, however many rows are dealt —
  // proof that mere presence of the machinery never leaks into a plate that never turns it on.
  const off=new OrbitWorld(9001,440,860);off.keepAll=true;
  for(let k=0;k<60;k++)off.generateRow();
  assert.equal(off.chasms.length,0,'chasmsOn defaults off: no chasm is ever generated without it');
  // A separate stream (this.chasmRandom) means turning chasms on must never perturb the ordinary
  // course: the same seed must deal the identical nodes and hazards whether the flag is on or off.
  const on=new OrbitWorld(9001,440,860,()=>{},false,false,false,true);on.keepAll=true;
  for(let k=0;k<60;k++)on.generateRow();
  assert(on.chasms.length>0,'chasmsOn: chasms actually appear over 60 rows');
  assert(on.chasms.every(c=>c.row>=5),'No chasm may be generated before row 5');
  assert.equal(off.nodes.length,on.nodes.length,'Chasms on or off, the same seed deals the same number of nodes');
  for(let i=0;i<off.nodes.length;i++){
    assert.equal(off.nodes[i].x,on.nodes[i].x,'Chasms on or off, node '+i+' sits at the same x');
    assert.equal(off.nodes[i].y,on.nodes[i].y,'Chasms on or off, node '+i+' sits at the same y');
  }
  assert.equal(off.hazards.length,on.hazards.length,'Chasms on or off, the same seed deals the same number of hazards');
  for(let i=0;i<off.hazards.length;i++)assert.equal(off.hazards[i].x,on.hazards[i].x,'Chasms on or off, hazard '+i+' sits at the same place');
  // Generation stays bounded exactly as every other endless array does: pruned by update(), never
  // held onto past the floor's own reach.
  const bounded=new OrbitWorld(9002,440,860,()=>{},false,false,false,true);bounded.start();
  let sawChasm=false;
  for(let i=0;i<120*400&&bounded.state==='playing'&&bounded.progress<48;i++){
    if(bounded.player.node){
      const aim=bounded.aim();
      if(aim&&!aim.steep&&aim.n.type!=='gold'&&aim.n.row===Math.floor(bounded.progress)+1&&(aim.perfect||bounded.player.orbitSweep>Math.PI*3)&&bounded.player.orbitTime>.12&&(bounded.player.node.type!=='sling'||bounded.charge()===1))bounded.release();
    }
    bounded.update(step);
    if(bounded.chasms.length)sawChasm=true;
    assert(bounded.chasms.length<6,'Chasm generation must stay bounded exactly as hazard generation does');
  }
  assert(sawChasm,'A bounded run long enough to reach row 48 must have carried at least one chasm');
}

// A chasm applies no force at all: bendVelocity must leave a flight passing through its reach
// untouched, unlike a real hazard's field.
{
  const c={x0:-100,y0:0,x1:100,y1:0,w:12};
  const p={x:0,y:0,vx:150,vy:0};const before={vx:p.vx,vy:p.vy};
  const turn=bendVelocity(p,[],step);
  assert.equal(turn,0);assert.equal(p.vx,before.vx);assert.equal(p.vy,before.vy);
}

// Crossing a chasm in free flight kills with its own reason; a shield spends itself and deflects
// exactly as a lethal hazard core does (see OrbitWorld.chasmHit/hazardHit).
{
  const c={x0:-100,y0:0,x1:100,y1:0,w:10};
  const w=new OrbitWorld(1,440,860,()=>{},false,false,false,true);
  w.chasms=[c];w.nodes=[];w.hazards=[];w.ensureAhead=()=>{};w.state='playing';
  const p=w.player;p.node=null;p.x=0;p.y=-200;p.vx=0;p.vy=400;
  for(let i=0;i<400&&w.state==='playing';i++)w.update(step);
  assert.equal(w.state,'dead');assert.equal(w.reason,'FELL INTO THE CHASM','An unshielded crossing dies with the chasm\'s own reason');
}
{
  const c={x0:-100,y0:0,x1:100,y1:0,w:10};
  const w=new OrbitWorld(2,440,860,()=>{},false,false,false,true);
  w.chasms=[c];w.nodes=[];w.hazards=[];w.ensureAhead=()=>{};w.state='playing';
  const p=w.player;p.node=null;p.shielded=true;p.x=0;p.y=-200;p.vx=0;p.vy=400;
  for(let i=0;i<400&&w.state==='playing'&&p.shielded;i++)w.update(step);
  assert.equal(w.state,'playing','A shielded crossing survives the chasm exactly as it survives a lethal hazard core');
  assert.equal(p.shielded,false,'The shield is spent, once, on the crossing');
}
// Orbiting must never touch a chasm at all — generation's own guarantee — checked directly here by
// holding an orbit whose ring is deliberately drawn to pass through one, to prove the run-loop itself
// never fires a chasm hit while p.node is set (flightStep, which is what tests for a chasm, is only
// ever called from the free-flight branch of update()).
{
  const c={x0:-100,y0:0,x1:100,y1:0,w:10};
  const w=new OrbitWorld(3,440,860,()=>{},false,false,false,true);
  w.chasms=[c];w.hazards=[];w.ensureAhead=()=>{};w.state='playing';
  const n=w.player.node;n.x=0;n.y=0;n.baseX=0;n.baseY=0;n.r=10;n.cap=13;w.nodes=[n];
  w.player.rad=10;w.player.speed=150;w.player.dir=1;w.positionPlayer();
  for(let i=0;i<600&&w.state==='playing';i++)w.update(step);
  assert.equal(w.state,'playing','Holding an orbit never triggers a chasm, whatever the ring is drawn across');
}

// aim() must refuse a release whose straight path would cross a chasm, exactly as it refuses one
// that would cross a lethal hazard's core. launchVelocity() reads nothing but p.vx/p.vy, so the
// launch ray can be set directly rather than reconstructed from an orbit's angle and radius.
{
  const w=new OrbitWorld(4,440,860);w.start();
  w.makeNode(0,-400,54,1,'still');
  const p=w.player;p.x=0;p.y=0;p.vx=0;p.vy=-200;
  w.chasms=[{x0:-200,y0:-200,x1:200,y1:-200,w:20}];
  assert.equal(w.aim(),null,'A straight path crossing a chasm must not be offered as an aim');
  w.chasms=[];
  assert(w.aim(),'The same release with the chasm removed is offered normally');
}

// ---------- Relighting at the Flare: era-only, gated exactly like chasmsOn (G2) ----------
{
  // relightOn defaults off: held in a Flare's outer field, in flight, for a good while, the charge
  // must never move — the flag is inert exactly like newtonOn and chasmsOn before this era sets it.
  const h={x:0,y:0,r:100,kind:'flare'},mid=(hazardCore(h)+gravityRadius(h))/2;
  const off=new OrbitWorld(101,440,860);
  off.hazards=[h];off.nodes=[];off.chasms=[];off.ensureAhead=()=>{};off.state='playing';
  const op=off.player;op.node=null;op.ink=.5;
  for(let i=0;i<200&&off.state==='playing';i++){op.x=mid;op.y=0;op.vx=0;op.vy=0;off.update(step);}
  assert.equal(off.state,'playing','A traveller held in a Flare\'s outer field is never itself in danger');
  assert(op.ink<=.5+1e-9,'relightOn defaults off: the charge never refills inside a Flare\'s field');
}
{
  // relightOn set: held in the same band, the charge refills, and clamps at 1 rather than running past it.
  const h={x:0,y:0,r:100,kind:'flare'},mid=(hazardCore(h)+gravityRadius(h))/2;
  const on=new OrbitWorld(102,440,860,()=>{},false,false,false,false,true);
  on.hazards=[h];on.nodes=[];on.chasms=[];on.ensureAhead=()=>{};on.state='playing';
  // Started a hair above empty rather than at it: hitting dry exactly is its own, older death (THE NIB
  // RAN DRY, checked before this rule ever runs), not a case relighting is meant to answer.
  const p=on.player;p.node=null;p.ink=.01;
  for(let i=0;i<400&&on.state==='playing';i++){p.x=mid;p.y=0;p.vx=0;p.vy=0;on.update(step);}
  assert.equal(on.state,'playing','Refilling in the field must not itself endanger the traveller');
  assert.equal(p.ink,1,'relightOn: the charge refills inside the band and clamps at 1');
}
{
  // The lethal core still kills exactly as it does without the flag: relighting only ever answers the
  // outer field, never the core a straight crossing dies to.
  const h={x:0,y:0,r:100,kind:'flare'};
  const w=new OrbitWorld(103,440,860,()=>{},false,false,false,false,true);
  w.hazards=[h];w.nodes=[];w.chasms=[];w.ensureAhead=()=>{};w.state='playing';
  const p=w.player;p.node=null;p.ink=.5;p.x=0;p.y=-400;p.vx=0;p.vy=400;
  for(let i=0;i<400&&w.state==='playing';i++)w.update(step);
  assert.equal(w.state,'dead','relightOn: the core still kills a straight crossing');
  assert.equal(w.reason,hazardKind(h).loss,'relightOn: the core kills with its own, unchanged reason');
}
{
  // No refill while orbiting, even when the ring sits inside a Flare's own band: an orbit still earns
  // only the ordinary per-second gain the node it holds always paid, never the relight rate as well.
  const h={x:0,y:150,r:100,kind:'flare'};
  const w=new OrbitWorld(104,440,860,()=>{},false,false,false,false,true);
  w.hazards=[h];w.chasms=[];w.ensureAhead=()=>{};w.state='playing';
  const n=w.player.node;n.x=0;n.y=0;n.baseX=0;n.baseY=0;n.r=50;n.cap=60;n.amp=0;n.type='still';w.nodes=[n];
  const p=w.player;p.rad=50;p.dir=1;p.speed=150;p.angle=Math.PI/2;p.ink=.5;p.orbitSweep=0;p.orbitTime=0;p.tangentCapture=true;
  w.positionPlayer();
  const d=Math.hypot(p.x-h.x,p.y-h.y);
  assert(d>hazardCore(h)&&d<gravityRadius(h),'fixture must actually hold its orbit inside the Flare\'s own band');
  w.update(step);
  assert(Math.abs(p.ink-Math.min(1,.5+INK_ORBIT_GAIN*step))<1e-9,'relightOn: an orbit inside a Flare\'s field earns only the ordinary orbit gain, never relight on top of it');
}

// Tiro's wider pressure asks less precise timing to land a smooth tangent transfer: the windowMult
// argument widens the band around the target's rim that counts as perfect, and the guide and real
// flight both read it from the world's own perfectMult, so a flight passing just outside the drawn
// window at Classic's ×1 reads perfect once Tiro's ×1.35 is in effect.
{
  const n={x:0,y:0,vx:0,vy:0,amp:0,r:100,cap:130},p={x:125,y:-500},v={vx:0,vy:200};
  assert.equal(transferContact(p,v,n,0,10).perfect,false,'125 falls outside the drawn ±20 rim window');
  assert.equal(transferContact(p,v,n,0,10,1.35).perfect,true,'The same flight is perfect inside the widened window');
}

for(const speed of [150,240,360])for(const offset of [45,60,85,130]){
  const result=flyby(offset,speed);assert(Number.isFinite(result.p.x)&&Number.isFinite(result.p.y));
  assert(Math.abs(Math.hypot(result.p.vx,result.p.vy)-speed)<1e-7,'Gravity changes heading without overriding earned speed');
}
const slowClose=flyby(60,150),fastClose=flyby(60,360),farPass=flyby(130,150),mirror=flyby(-60,150);
assert(slowClose.turn>.25&&slowClose.turn<.5,'A close pass at opening speed should visibly turn the flight');
assert(fastClose.turn>.025&&fastClose.turn<.08&&fastClose.turn<slowClose.turn,'Faster flybys get less time to bend');
assert(Math.abs(farPass.turn)<1e-10);assert(Math.abs(mirror.turn+slowClose.turn)<1e-10,'The field is symmetric around the vortex');

for(const speed of [150,240,360])for(const offset of [45,60,85,130]){
  const result=flareFlyby(offset,speed);assert(Number.isFinite(result.p.x)&&Number.isFinite(result.p.y));
  assert(Math.abs(Math.hypot(result.p.vx,result.p.vy)-speed)<1e-7,'A flare turns the flight without touching its speed');
}
const flareSlow=flareFlyby(60,150),flareFast=flareFlyby(60,360),flareFar=flareFlyby(130,150),flareMirror=flareFlyby(-60,150);
assert(flareSlow.turn<-.15&&flareSlow.turn>-.35,'A close flare pass pushes the flight outward');
assert(flareFast.turn<0&&flareFast.turn>flareSlow.turn,'Faster flare passes get less time to bend');
assert(Math.abs(flareFar.turn)<1e-10,'The flare field ends cleanly at its drawn edge');
assert(Math.abs(flareMirror.turn+flareSlow.turn)<1e-10,'The flare field is symmetric around its core');
assert(slowClose.turn>0&&flareSlow.turn<0,'A hole and a flare of the same size turn a flight opposite ways');
assert(Math.abs(flareSlow.turn+slowClose.turn)<.16,'Both fields bend a matched flyby by a comparable amount');

for(const speed of [150,240,360])for(const offset of [20,45,60,110]){
  const result=newtonFlyby(offset,speed);assert(Number.isFinite(result.p.x)&&Number.isFinite(result.p.y)&&Number.isFinite(result.speed));
}
assert.equal(Math.abs(newtonFlyby(45,150,false).turn),0,'newtonOn defaults off: flightStep’s existing callers see no node pull');
const newtonSlow=newtonFlyby(45,150),newtonFast=newtonFlyby(45,360),newtonFar=newtonFlyby(110,150),newtonMirror=newtonFlyby(-45,150);
assert(newtonSlow.turn>.45&&newtonSlow.turn<.8,'A pass halfway into the field at opening speed should visibly turn the flight toward the body');
assert(newtonSlow.speedAtClosest-150>10,'Unlike a hazard, gravity speeds the traveller up on the way past');
assert(Math.abs(newtonSlow.speed-150)<.5,'A full symmetric pass gives back on the way out almost exactly what it took on the way in');
assert(newtonFast.turn>0&&newtonFast.turn<newtonSlow.turn,'Faster flybys get less time to bend');
assert(newtonFast.speedAtClosest-360>0&&newtonFast.speedAtClosest-360<newtonSlow.speedAtClosest-150,'Faster flybys also get less time to speed up');
assert(Math.abs(newtonFar.turn)<1e-9&&Math.abs(newtonFar.speedAtClosest-150)<1e-7,'The field ends cleanly at its drawn reach');
assert(Math.abs(newtonMirror.turn+newtonSlow.turn)<1e-9,'The field is symmetric around the body');
assert(Math.abs(newtonMirror.speedAtClosest-newtonSlow.speedAtClosest)<1e-9,'A mirrored pass speeds the traveller up by the same amount');

const holeHead=headOn('vortex'),flareHead=headOn('flare');
assert.equal(holeHead.hit?.kind,'hazard');assert(Math.abs(holeHead.y-27)<3,'A vortex is lethal to its drawn edge');
assert.equal(flareHead.hit?.kind,'hazard');assert(Math.abs(flareHead.y-(24*.6+3))<3,'A flare only kills inside its smaller core');
assert.equal(hazardCore({r:24}),24);assert.equal(hazardCore({r:24,kind:'vortex'}),24);assert.equal(hazardCore({r:24,kind:'flare'}),24*.6);
// An unknown kind falls back to the vortex, so a fixture naming none keeps its old behaviour.
assert.equal(hazardKind({}).latin,'VORAGO');assert.equal(hazardKind({kind:'wind'}).lethal,false);

const exact=tangentArrival(0),shy=tangentArrival(.02);
assert(exact.event.perfect&&Math.abs(exact.event.angle-90)<1e-6,'An exact tangent reads ninety degrees');
assert(exact.event.square&&exact.event.squareBonus===10&&exact.world.squares===1,'An exact tangent is a square worth ten at the opening pace');
assert(exact.world.observations.some(o=>o.key==='rightAngle'),'The first square is observed');
assert(exact.world.score===exact.event.gain+10,'The square bonus is added beside the landing reward');
assert(exact.event.n.impression?.perfect&&exact.event.n.impression.x===0&&exact.event.n.impression.y===0,'A perfect landing keeps hand-colour inside the engraving');
assert(!shy.event.square&&Math.abs(shy.event.angle-90)>1.5&&Math.abs(shy.event.angle-90)<15,'A tangent released late joins off the ring and is not a square');
{
  const events=[],w=new OrbitWorld(32,440,860,(type,e)=>{if(type==='capture')events.push(e);}),destination=w.makeNode(0,-400,54,1,'still');
  w.player.node=null;w.player.x=0;w.player.y=-400+54;w.player.vx=0;w.player.vy=-150;w.player.launch={row:0,sweep:1};w.state='playing';
  assert.equal(w.capture(destination),true);assert.equal(events.length,1);
  assert(!events[0].n.impression?.perfect&&events[0].n.impression?.quality<1,'A rough landing records a distinct hand-colour impression');
  assert(!events[0].perfect&&!events[0].square&&events[0].angle<10,'A flight straight at the centre reads near zero');
}
// A change of medium inside a run: the first landing at or past each transition row is where it happens,
// once per row and on the body landed on, holding the dark still, and never on a plate that names none.
{
  const land=(w,row,y)=>{const n=w.makeNode(0,y,54,row,'still');w.nodes.push(n);w.player.node=null;w.player.x=0;w.player.y=y+54;w.player.vx=0;w.player.vy=-150;w.player.launch={row:row-1,sweep:1};w.state='playing';w.capture(n);return n;};
  const said=[],w=new OrbitWorld(33,440,860,(type,e)=>{if(type==='transition')said.push(e);});
  w.transitionRows=[3,6];
  land(w,2,-400);assert.equal(said.length,0,'No change of medium short of its row');
  const at=land(w,4,-800);
  assert.equal(said.length,1,'The first landing past a transition row changes the medium');
  assert.equal(said[0].n,at,'It grows out of the body landed on');assert.equal(said[0].index,0);
  assert(w.darknessGrace>=2.9,'The dark is held still while the new medium grows');
  land(w,5,-1200);assert.equal(said.length,1,'A transition row is crossed once');
  land(w,7,-1600);assert.equal(said.length,2,'And the next one past it');assert.equal(said[1].index,1);
  land(w,9,-2000);assert.equal(said.length,2,'Past the last, nothing more');
  const quiet=[],plain=new OrbitWorld(33,440,860,(type,e)=>{if(type==='transition')quiet.push(e);});
  land(plain,4,-800);assert.equal(quiet.length,0,'A plate that names no transition rows never changes medium');
}
let curvedCaptures=0,maxPreviewSteps=0;
for(const [speed,drift,angle] of [[150,false,-.032],[150,true,-.026],[240,false,-.002],[240,true,-.02],[360,false,.016],[360,true,-.014]]){
  const {w,destination,captures}=curvedFixture(speed,drift,angle),before={score:w.score,near:w.hazards[0].near,node:w.player.node};
  const aim=w.aim(),preview=w.flightPreview;assert.equal(aim?.n,destination);assert(preview.curved&&preview.points.length>4);maxPreviewSteps=Math.max(maxPreviewSteps,preview.steps);
  assert.deepEqual({score:w.score,near:w.hazards[0].near,node:w.player.node},before,'Prediction cannot mutate the live run');
  // The drawn course may be cut short by the pace's own horizon; what is compared is the prediction.
  const expected=preview.landing;w.release();for(let i=0;i<120*8&&!w.player.node&&w.state==='playing';i++)w.update(step);
  assert.equal(w.player.node,destination);assert.equal(captures[0].perfect,aim.perfect);
  assert(Math.hypot(w.player.x-expected.x,w.player.y-expected.y)<.2,'The curved guide must land where real flight lands');curvedCaptures++;
}
assert(maxPreviewSteps<300,'Curved prediction must remain bounded');
const blockedCurve=curvedFixture(240,false,.32);assert.equal(blockedCurve.w.aim(),null);assert.equal(blockedCurve.w.flightPreview.blocked,'hazard');
const blockedPoint=blockedCurve.w.flightPreview.landing;assert(Math.abs(Math.hypot(blockedPoint.x-70,blockedPoint.y+170)-27)<.02);
blockedCurve.w.release();for(let i=0;i<120*4&&blockedCurve.w.state==='playing';i++)blockedCurve.w.update(step);
assert.equal(blockedCurve.w.reason,'DRAWN INTO A VORTEX','A warning guide must agree with the real collision');

let flareCaptures=0,flareGrazes=0;
for(let angle=-.02;angle<=.24;angle+=.004){
  const {w,destination}=flareFixture(angle),aim=w.aim(),preview=w.flightPreview,before=w.score;
  if(!aim||aim.n!==destination||!preview.curved)continue;
  const expected=preview.landing;w.release();
  for(let i=0;i<120*8&&!w.player.node&&w.state==='playing';i++)w.update(step);
  assert.equal(w.player.node,destination,'A flare-bent guide must reach the planet it advertises');
  assert(Math.hypot(w.player.x-expected.x,w.player.y-expected.y)<.2,'The flare guide must land where real flight lands');
  if(w.hazards[0].near){assert(w.score>=before+5,'A flare graze earns its once-per-hazard bonus');flareGrazes++;}
  flareCaptures++;
}
assert(flareCaptures>8,'Exercise real flights steered by a repulsive field');
assert(flareGrazes>0,'Close flare passes still count as grazes');
const flareDeath=flareFixture(.12);flareDeath.w.release();
flareDeath.w.hazards=[{x:flareDeath.w.player.x+flareDeath.w.player.vx*.05,y:flareDeath.w.player.y+flareDeath.w.player.vy*.05,r:20,kind:'flare',seed:2,phase:0,near:false}];
for(let i=0;i<15;i++)flareDeath.w.update(step);
assert.equal(flareDeath.w.reason,'SEARED BY A SUNSPOT FLARE','A flare core reports its own loss');

let windCaptures=0,windBent=0;
for(let angle=-.02;angle<=.24;angle+=.004){
  const {w,destination}=windFixture(angle),aim=w.aim(),preview=w.flightPreview;
  if(!aim||aim.n!==destination||!preview.curved)continue;
  windBent++;
  const expected=preview.landing;w.release();
  for(let i=0;i<120*8&&!w.player.node&&w.state==='playing';i++)w.update(step);
  assert.equal(w.player.node,destination,'A wind-bent guide must reach the planet it advertises');
  assert(Math.hypot(w.player.x-expected.x,w.player.y-expected.y)<.2,'The wind guide must land where real flight lands');
  assert(!w.hazards[0].near,'A gust is never grazed, so it never pays the once-per-hazard bonus');
  windCaptures++;
}
assert(windCaptures>8,'Exercise real flights steered by a wind-head');
assert(windBent>8,'A gust must actually put the guide onto its curved prediction');
// Flown across the heart of a gust, the crossing comes out measurably off the line it left on, and
// the run is never lost to it however square the hit. Flown along one it is untouched: these fields
// steer without changing speed, so a force lying along the flight has nothing left to turn — which
// is exactly why a wind-head is laid across its route rather than down it.
{
  const w=new OrbitWorld(715,440,860);w.nodes=[];w.ensureAhead=()=>{};w.state='playing';
  const h={x:0,y:-400,r:30,kind:'wind',dir:0,near:false,seed:1,phase:0};
  w.hazards=[h];const p=w.player;p.node=null;
  p.x=0;p.y=-400-gravityRadius(h)-40;p.vx=0;p.vy=240;p.launch={row:0,sweep:1};p.ink=1;
  const startX=p.x;
  for(let i=0;i<120*4&&w.state==='playing'&&p.y<-400+gravityRadius(h)+40;i++)w.update(step);
  assert(w.state==='playing','A wind-head has no lethal core: flying through its centre cannot end a run');
  assert(Math.abs(p.x-startX)>12,'A crossing flown through a gust is carried off its line: '+(p.x-startX).toFixed(1));
  assert(Math.abs(Math.hypot(p.vx,p.vy)-240)<1e-6,'A gust steers without touching the speed it steers');
  const along=new OrbitWorld(716,440,860);along.nodes=[];along.ensureAhead=()=>{};along.state='playing';
  const g={x:0,y:-400,r:30,kind:'wind',dir:Math.PI/2,near:false,seed:1,phase:0};
  along.hazards=[g];const q=along.player;q.node=null;
  q.x=0;q.y=-400-gravityRadius(g)-40;q.vx=0;q.vy=240;q.launch={row:0,sweep:1};q.ink=1;
  for(let i=0;i<120*4&&along.state==='playing'&&q.y<-400+gravityRadius(g)+40;i++)along.update(step);
  assert(Math.abs(q.x)<1e-9,'A crossing flown straight down a gust is not turned by it at all');
}

const fogged=nebulaFixture(true),unfogged=nebulaFixture(false);
const fogAim=fogged.w.aim(),clearAim=unfogged.w.aim();
assert(fogAim?.perfect&&fogAim.n===fogged.destination,'A nebula changes nothing about where the flight goes');
assert.deepEqual({n:fogAim.n.id,perfect:fogAim.perfect,radius:fogAim.radius},{n:clearAim.n.id,perfect:clearAim.perfect,radius:clearAim.radius});
assert.equal(fogged.w.flightPreview.fogged,true);assert.equal(unfogged.w.flightPreview.fogged,false);
const cutPoint=fogged.w.flightPreview.points.at(-1),fullPoint=unfogged.w.flightPreview.points.at(-1);
assert(Math.abs(Math.hypot(cutPoint.x-50,cutPoint.y+150)-70)<1e-6,'The preview stops at the near edge of the cloud');
assert(cutPoint.distance<fullPoint.distance-100,'The guide is cut well short of the landing');
fogged.w.release();for(let i=0;i<120*4&&!fogged.w.player.node&&fogged.w.state==='playing';i++)fogged.w.update(step);
assert.equal(fogged.w.player.node,fogged.destination,'The flight crosses a nebula and captures normally');
assert.equal(fogged.captures[0].perfect,true,'A fogged guide still describes a perfect transfer');

for(const offset of [-50,50])for(const speed of [150,240,360]){
  const {w,destination,captures}=transferFixture(offset,speed),guide=w.aim();
  assert(guide?.perfect);assert.equal(guide.n,destination);assert(Math.abs(guide.distance-300)<1e-8);
  w.release();const incoming={vx:w.player.vx,vy:w.player.vy};
  w.update(280/speed);assert.equal(w.player.node,null,'A tangent flight must pass the outer capture rim before joining');
  w.update(20/speed+1e-7);assert.equal(w.player.node,destination);assert.equal(captures[0].perfect,true);
  assert(Math.abs(w.player.x-offset)<1e-7&&Math.abs(w.player.y+300)<1e-7,'Join at the closest rim point without snapping to the center');
  assert(Math.abs(w.player.vx-incoming.vx)<1e-7&&Math.abs(w.player.vy-incoming.vy)<1e-7,'A perfect join must preserve the entire velocity vector');
  for(let i=0;i<120;i++)w.update(step);
  assert(Math.abs(w.player.speed-speed)<1e-7,'Ordinary orbits must not erase earned momentum or auto-accelerate');
}
// The release grace absorbs the screen's and the touch's own noise and nothing more. A tap a few
// thousandths either side of a perfect release is let go from it, a tap that would have missed is let go
// from the nearest point that lands, and a tap further off than the grace is flown exactly as asked.
{
  const rateOf=w=>w.player.dir*w.player.speed/w.player.rad;
  const readAt=(w,offset)=>{const angle=w.player.angle;w.player.angle+=rateOf(w)*offset;w.positionPlayer();const aim=w.aim();w.player.angle=angle;w.positionPlayer();return aim;};
  let upgraded=0,beyond=0;
  for(const offset of [-50,50])for(const speed of [240,360])for(const sign of [-1,1]){
    // Walk away from the tangent until the guide stops calling the release perfect, while it still lands.
    // Walked finely, since the band can be narrower than the grace's own step: the tap is placed where
    // the release is an ordinary landing but a point one grace step back toward the tangent is perfect.
    const fixture=transferFixture(offset,speed),probe=fixture.w;let off=null;
    for(let k=4;k<=Math.round(RELEASE_GRACE*960);k++){
      const aim=readAt(probe,sign*k/960),back=readAt(probe,sign*(k-4)/960);
      if(aim&&aim.n===fixture.destination&&!aim.perfect&&back&&back.n===fixture.destination&&back.perfect){off=sign*k/960;break;}
    }
    if(off===null)continue;
    const {w,destination,captures}=transferFixture(offset,speed);w.releaseGrace=RELEASE_GRACE;
    w.player.angle+=rateOf(w)*off;w.positionPlayer();
    assert.equal(w.aim()?.perfect,false,'The tap itself is not on the perfect band');
    w.release();for(let i=0;i<120*3&&!w.player.node;i++)w.update(1/120);
    assert.equal(w.player.node,destination,'A graced release still lands on the body the tap was aimed at');
    assert.equal(captures[0].perfect,true,'A tap within the grace of a perfect release is let go from it');upgraded++;
  }
  assert(upgraded>=2,'The grace must be exercised on both sides of a perfect band: '+upgraded);
  // Beyond the grace a tap is the hand's own, and is flown exactly where it was asked for.
  for(const speed of [240,360]){
    const probe=transferFixture(50,speed).w;
    for(let k=Math.round(RELEASE_GRACE*240)+3;k<60;k++){
      const aim=readAt(probe,k/240);if(!aim||aim.perfect)continue;
      // Only a point no perfect release lies within the grace of says anything about the grace's edge.
      let near=false;for(let j=-Math.round(RELEASE_GRACE*240);j<=Math.round(RELEASE_GRACE*240);j++){const a=readAt(probe,(k+j)/240);if(a&&a.perfect)near=true;}
      if(near)continue;
      const graced=transferFixture(50,speed),bare=transferFixture(50,speed);graced.w.releaseGrace=RELEASE_GRACE;
      for(const t of [graced,bare]){t.w.player.angle+=rateOf(t.w)*k/240;t.w.positionPlayer();t.w.release();}
      assert.deepEqual([graced.w.player.x,graced.w.player.y,graced.w.player.vx,graced.w.player.vy],[bare.w.player.x,bare.w.player.y,bare.w.player.vx,bare.w.player.vy],'A tap beyond the grace is flown exactly as asked');
      beyond++;break;
    }
  }
  assert(beyond>=1,'The edge of the grace must be exercised');
  // A tap that would miss outright is let go from the nearest point that lands, if one is within the grace.
  let rescued=0;
  for(const speed of [150,240,360]){
    const fixture=transferFixture(50,speed),probe=fixture.w;
    for(let k=1;k<120&&!rescued;k++)for(const sign of [-1,1]){
      if(readAt(probe,sign*k/240))continue;
      const land=readAt(probe,sign*(k-2)/240);if(!land||land.n!==fixture.destination)continue;
      const {w,destination}=transferFixture(50,speed);w.releaseGrace=RELEASE_GRACE;
      w.player.angle+=rateOf(w)*sign*k/240;w.positionPlayer();assert.equal(w.aim(),null,'The tap itself would miss');
      w.release();for(let i=0;i<120*4&&!w.player.node&&w.state==='playing';i++)w.update(1/120);
      assert.equal(w.player.node,destination,'A tap that would have missed by less than the grace lands');rescued++;break;
    }
  }
  assert(rescued>=1,'The grace must rescue a near miss');
}
// An angled arrival that is not a tangent is still the forgiving ordinary capture it has always been.
const roughSlow=transferFixture(25,150),roughFast=transferFixture(25,300);
for(const test of [roughSlow,roughFast]){
  const aim=test.w.aim();
  assert.equal(aim.perfect,false,'An angled, non-tangent flight is an ordinary capture');
  assert.equal(aim.steep,false,'and still joins the orbit');
  assert(aim.angle>GRAZE_MINIMUM&&aim.angle<45,'well inside the forgiving band: '+aim.angle.toFixed(1));
  test.w.release();
  for(let i=0;i<120*3&&!test.w.player.node;i++)test.w.update(step);
  assert.equal(test.w.player.node,test.destination);assert.equal(test.captures[0].perfect,false);
}
// A flight falling straight down at the centre still joins the orbit — there is no way to steer a
// flight once it is released, so turning it away outright only ever stranded a mistimed release with
// nothing left to recover onto. It earns the same base as every accepted arrival, while the guide says
// before the release that its rough impression receives no angle bonus.
// release is made.
for(const offset of [0,10]){
  const skid=transferFixture(offset,240),aim=skid.w.aim();
  assert.equal(aim.n,skid.destination,'The guide still aims the course');
  assert(aim.angle<GRAZE_MINIMUM);
  assert.equal(aim.steep,true,'and marks that the landing will leave a rough impression');
  const inkBefore=skid.w.player.ink,cost=skid.w.inkCost(aim.distance);
  skid.w.release();
  for(let i=0;i<120*3&&skid.w.state==='playing'&&!skid.w.player.node;i++)skid.w.update(step);
  assert.equal(skid.w.player.node,skid.destination,'The orbit is still joined');
  assert.equal(skid.destination.visited,true,'and the planet is spent, exactly as any other capture spends it');
  assert.equal(skid.captures.length,1,'the capture happens');
  assert.equal(skid.captures[0].steep,true,'marked as a rough impression');
  assert(skid.captures[0].gain>0,'and still earns its base score');
  assert.equal(skid.captures[0].angleBonus,0,'but earns no angle bonus');
  assert.equal(skid.destination.impression.quality,0,'and freezes the roughest colour registration on the body');
  assert(skid.w.player.speed<240&&skid.w.player.speed>=BASE_SPEED,'a steep landing sheds speed like any other hard turn');
  assert(Math.abs(skid.w.player.ink-(inkBefore-cost))<1e-6,'no ink dividend is paid for a steep landing');
}
// The three opening targets never turn a landing away, so the choice of pressure cannot be lost to it.
{
  const open=new OrbitWorld(12,440,860,()=>{},true);open.start();
  const target=open.nodes.find(q=>q.difficultyChoice==='classic');
  open.player.x=target.x;open.player.y=target.y+target.r;open.player.vx=0;open.player.vy=-240;
  assert.equal(open.capture(target,{cx:target.x,cy:target.y,vx:0,vy:0,perfect:false,rx:0,ry:target.r,rvx:0,rvy:-240,distance:target.r}),true,
    'A dead-centre arrival on an opening target still sets the pressure');
  // And the guide never warns of a refusal that cannot happen while the choice is pending.
  const offer=new OrbitWorld(12,440,860,()=>{},true);offer.start();
  let warned=0,aimed=0;
  for(let i=0;i<360;i++){
    offer.player.angle=i/360*Math.PI*2;offer.positionPlayer();
    const a=offer.aim();if(!a)continue;aimed++;if(a.steep)warned++;
  }
  assert(aimed>0,'The opening targets must be aimable');
  assert.equal(warned,0,'No opening course is marked as one that will earn nothing');
}
assert.equal(roughFast.captures[0].gain,roughSlow.captures[0].gain*2,'The same landing at twice the speed earns twice the points');
assert(roughFast.w.player.speed<300&&roughFast.w.player.speed>BASE_SPEED,'A sharp capture sheds only some excess momentum');
for(const offset of [-80,80])assert.equal(transferFixture(offset).w.aim(),null,'A flight outside the capture rim must miss');
let driftCaptures=0;
for(let angle=-.22;angle<=.22;angle+=.003){
  const test=transferFixture(50,240,true);test.w.player.angle=angle;test.w.positionPlayer();const aim=test.w.aim();
  if(!aim?.perfect)continue;
  test.w.release();const incoming={vx:test.w.player.vx,vy:test.w.player.vy};
  for(let i=0;i<120*4&&!test.w.player.node&&test.w.state==='playing';i++)test.w.update(step);
  assert.equal(test.w.player.node,test.destination);assert.equal(test.captures[0].perfect,true,'A moving-planet guide must predict the actual tangent capture');
  assert(Math.hypot(test.w.player.vx-incoming.vx,test.w.player.vy-incoming.vy)<.1,'A moving capture preserves velocity within the planet motion remaining in the fixed step');driftCaptures++;
}
assert(driftCaptures>3,'Exercise a real range of moving-planet tangent arrivals');
for(const dir of [-1,1])for(const path of orbitTangents({x:0,y:0,r:57},{x:77,y:-207,r:54},dir)){
  const dx=path.bx-path.x,dy=path.by-path.y;
  assert(Math.abs(path.x*dx+path.y*dy)<1e-8);
  assert(Math.abs((path.bx-77)*dx+(path.by+207)*dy)<1e-8,'Release markers must describe circle-to-circle tangents');
}

const tangent=new OrbitWorld(1);tangent.start();tangent.update(step);
assert.equal(tangent.player.speed,150,'The opening pace is slower than the former 205');
assert.equal(tangent.nodes.find(n=>n.row===2).type,'sling','Introduce speed control on the third planet');
const initial={...tangent.player};assert(tangent.release());const released={...tangent.player};
assert(Math.abs((released.x-initial.node.x)*released.vx+(released.y-initial.node.y)*released.vy)<1e-8,'Release must be tangent');
tangent.update(step);
assert(Math.abs(tangent.player.x-released.x-released.vx*step)<1e-8);
assert(Math.abs(tangent.player.y-released.y-released.vy*step)<1e-8);
assert.equal(tangent.release(),false,'Airborne taps must not alter trajectory');

const idle=new OrbitWorld(2);idle.start();for(let i=0;i<120*40&&idle.state==='playing';i++)idle.update(step);
assert.equal(idle.state,'dead','Waiting forever must lose');assert.equal(idle.reason,'THE DARK CAUGHT UP');
assert(idle.elapsed>6&&idle.elapsed<13,'Opening darkness must give a few learning seconds, then threaten idle play');
const paused=new OrbitWorld(3);paused.start();paused.state='paused';const old=paused.player.x;paused.update(10);assert.equal(paused.player.x,old);assert.equal(paused.elapsed,0);

// ---------- The pace hides the far end of a fast crossing ----------
// At the opening pace the whole course is drawn. As the chart's speed is earned the pen stops setting
// down the far part of it, so a run at full pace commits to the last of a long transfer unseen. What
// is hidden is only what is drawn: the aim and the prediction behind it are untouched, which is what
// lets the guide still be checked against real flight.
{
  const sight=speed=>{const w=new OrbitWorld(13,440,860);w.start();
    const origin=w.player.node,far=w.makeNode(origin.x+origin.r+25,origin.y-700,54,2,'still');
    w.nodes=[origin,far];w.lastMain=far;w.player.angle=0;w.player.dir=-1;w.player.speed=speed;w.positionPlayer();
    const aim=w.aim(),p=w.flightPreview;
    return {aim,fogged:p.fogged,drawn:p.points.at(-1).distance,landing:p.landing,range:w.sightRange()};
  };
  const slow=sight(BASE_SPEED),fast=sight(MAX_SPEED);
  assert.equal(slow.aim?.n.row,2);assert.equal(fast.aim?.n.row,2,'The same planet is aimed at either pace');
  assert.equal(slow.fogged,false,'At the opening pace the whole course is drawn');
  assert(Math.abs(slow.drawn-slow.aim.distance)<1e-6);
  assert.equal(fast.fogged,true,'At the chart top speed the far part of a long crossing is not');
  assert(fast.drawn<slow.drawn*.6,'and a good deal of it is left unset: '+fast.drawn.toFixed(0)+' of '+slow.drawn.toFixed(0));
  assert(Math.abs(fast.drawn-fast.range)<1e-6,'The course is cut exactly at the pace horizon');
  assert(fast.range<slow.range,'The horizon closes in as the pace rises');
  // The fog is what is drawn, never what will happen.
  assert(Math.abs(slow.landing.x-fast.landing.x)<1e-6&&Math.abs(slow.landing.y-fast.landing.y)<1e-6,
    'The predicted landing is the same whether or not the course to it is drawn');
  assert.equal(slow.aim.perfect,fast.aim.perfect);
  assert(Math.abs(slow.aim.angle-fast.aim.angle)<1e-6,'and so is the arrival it predicts');
}

// ---------- The nib and its ink ----------
// A full nib carries 2000 world units, spent by the distance flown rather than the time taken, so
// the same crossing costs the same whether it is flown slowly or at the chart's top speed.
{
  const w=new OrbitWorld(5,440,860);w.start();
  assert.equal(w.inkLevel(),1,'A run is dealt with a full nib');
  assert.equal(w.inkCost(2000),1,'A full nib carries two thousand world units');
  assert.equal(w.inkRange(),2000);
  w.inkMult=1.25;assert.equal(w.inkCost(2000),1.25,'The pressure scales the drain, not the gauge');
  assert.equal(w.inkRange(),1600,'A harder plate reaches less far on the same charge');
  assert.equal(w.inkLevel(),1,'and reads the same full gauge');
}
// Flight spends it; a landing pays a dividend, and a clean tangent arrival pays more than a hard turn.
{
  const spend=(speed)=>{
    const w=new OrbitWorld(6,440,860);w.start();
    w.nodes=[w.player.node];w.player.speed=speed;w.positionPlayer();w.release();
    let flown=0;
    for(let i=0;i<120*4&&w.state==='playing';i++){
      const x=w.player.x,y=w.player.y;w.update(step);flown+=Math.hypot(w.player.x-x,w.player.y-y);
    }
    return {spent:1-w.player.ink,flown};
  };
  const slow=spend(150),fast=spend(300);
  assert(slow.flown>0&&fast.flown>0);
  assert(Math.abs(slow.spent-slow.flown/2000)<1e-9,'Ink is spent by the distance drawn');
  assert(Math.abs(fast.spent-fast.flown/2000)<1e-9);
  assert(Math.abs(slow.spent/slow.flown-fast.spent/fast.flown)<1e-12,
    'The same crossing costs the same ink however fast it is flown');
}
// Running the nib dry in flight ends the run, and the landing is settled first, so a transfer that
// arrives on the last drop stands.
{
  const dry=new OrbitWorld(7,440,860);dry.start();
  dry.nodes=[dry.player.node];dry.player.ink=.02;dry.release();
  for(let i=0;i<120*4&&dry.state==='playing';i++)dry.update(step);
  assert.equal(dry.reason,'THE NIB RAN DRY','An empty nib ends the run in flight');
  const last=new OrbitWorld(8,440,860);last.start();
  const origin=last.player.node,target=last.makeNode(origin.x+origin.r+25,origin.y-600,54,2,'still');
  last.nodes=[origin,target];last.lastMain=target;last.player.angle=0;last.player.dir=-1;last.positionPlayer();
  const aim=last.aim();assert.equal(aim?.n,target);
  last.player.ink=last.inkCost(aim.distance)+1e-4;
  last.release();
  for(let i=0;i<120*10&&last.state==='playing'&&!last.player.node;i++)last.update(step);
  assert.equal(last.player.node,target,'A transfer that arrives on the last drop stands');
  assert.equal(last.state,'playing');
}
// A goal row (the Ceiling's twelfth hour) ends a run the same way every other ending does — state,
// reason, deadTime — but as a win rather than a death: no shake, a 'sunrise' event instead of 'death',
// and never both. goalRow 0, every existing caller's default, must leave a run exactly as endless as
// it always was.
{
  const seen=[];
  const w=new OrbitWorld(21,440,860,(type,e)=>{seen.push(type);},false,false,false,false,false,5);w.start();
  // The suite's own tangent-seeking pilot: release the instant the guide reports a clean transfer.
  for(let i=0;i<120*40&&w.state==='playing';i++){
    const aim=w.aim();
    if(aim&&aim.perfect&&w.player.node&&w.player.orbitTime>.12)w.release();
    w.update(step);
  }
  assert.equal(w.won,true,'A goal-row world ends in a win once progress reaches the goal');
  assert.equal(w.reason,'THE SUN ROSE');
  assert.equal(w.state,'dead','A win still ends the run through the same state every other ending shares');
  assert(w.progress>=5,'The winning run must actually have reached its goal row');
  assert.equal(seen.filter(t=>t==='sunrise').length,1,'The win fires exactly once');
  assert.equal(seen.includes('death'),false,'A win never also fires a death');
}
{
  const w=new OrbitWorld(22,440,860);
  assert.equal(w.goalRow,0,'goalRow defaults to 0: every existing caller stays endless');
  w.state='playing';const n=w.makeNode(0,-400,54,1,'still');
  w.player.x=0;w.player.y=-400+54;w.player.vx=0;w.player.vy=-150;
  w.capture(n);
  assert.equal(w.won,false,'With no goal, a landing however deep never wins the run on its own');
  assert.equal(w.state,'playing');
}
// A skipped orbit is flown past at the same distance-based cost as a landing, so it now pays half the
// dividend a landing on it would have, rather than the flight paying full price for dividends it
// never stopped to collect.
{
  const captures=[];
  const w=new OrbitWorld(11,440,860,(type,e)=>{if(type==='capture')captures.push(e);});w.start();
  const origin=w.player.node,target=w.makeNode(origin.x+origin.r+25,origin.y-600,54,4,'still');
  w.nodes=[origin,target];w.lastMain=target;w.player.angle=0;w.player.dir=-1;w.positionPlayer();
  const aim=w.aim();assert.equal(aim?.n,target);assert.equal(aim.steep,false,'the fixture must actually score');
  w.release();
  let flown=0;
  for(let i=0;i<120*10&&w.state==='playing'&&!w.player.node;i++){
    const x=w.player.x,y=w.player.y;w.update(step);flown+=Math.hypot(w.player.x-x,w.player.y-y);
  }
  assert.equal(w.player.node,target,'the long transfer lands');
  assert.equal(captures.length,1);assert.equal(captures[0].skipped,3,'three main orbits lie between them');
  const dividend=(captures[0].perfect?INK_PERFECT_GAIN:INK_CAPTURE_GAIN)*(1+3*.5);
  assert(Math.abs(w.player.ink-Math.min(1,1-w.inkCost(flown)+dividend))<1e-6,
    'each of the three skipped orbits pays half the landing dividend on top of the one landed');
}
// Holding a ring re-charges the nib; a slingshot star fills it over its lap; a landing pays back more
// for a tangent arrival than for a hard turn. Dwelling is how ink is bought, and time is what it costs.
{
  const w=new OrbitWorld(9,440,860);w.start();w.player.ink=.2;
  w.update(1);assert(Math.abs(w.player.ink-.33)<1e-9,'A held orbit re-charges the nib slowly');
  const star=new OrbitWorld(10,440,860);star.start();
  star.player.node.type='sling';star.player.ink=.2;star.update(1);
  assert(Math.abs(star.player.ink-1.05+.05)<1e-9||star.player.ink===1,'A slingshot star fills the nib far faster');
  assert(star.player.ink>w.player.ink,'and faster than an ordinary ring');
  assert(star.player.ink<=1,'The nib never holds more than a full charge');
}
// The guide prices the transfer it is drawing and marks the one the nib cannot pay for. It still aims
// it and still draws it: the choice to fly a course that stops short stays the player's to make.
{
  const w=new OrbitWorld(11,440,860);w.start();
  const origin=w.player.node,far=w.makeNode(origin.x+origin.r,origin.y-1500,54,2,'still');
  w.nodes=[origin,far];w.lastMain=far;w.player.angle=0;w.player.dir=-1;w.positionPlayer();
  const rich=w.aim();
  assert.equal(rich?.n,far,'The guide reaches the distant planet');
  assert.equal(rich.dry,false,'A full nib pays for it');
  assert(Math.abs(w.flightPreview.inkCost-w.inkCost(rich.distance))<1e-9);
  w.player.ink=.2;
  const poor=w.aim();
  assert.equal(poor?.n,far,'The same course is still aimed when the nib cannot pay for it');
  assert.equal(poor.dry,true,'and is marked dry');
  assert.equal(w.flightPreview.dry,true);
  assert(Math.abs(w.flightPreview.inkRange-400)<1e-9,'The preview says how far the ink still reaches');
  assert.equal(w.release(),true,'A dry course may still be flown');
}

// Charge follows angular travel, caps at one lap, and changes actual momentum.
const chargeEvents=[],charged=new OrbitWorld(4,440,860,(type,e)=>chargeEvents.push({type,...e}));
charged.player.node.type='sling';charged.update(1);assert.equal(charged.charge(),0,'Ready mode cannot pre-charge');charged.start();
assert.equal(charged.launchVelocity().factor,1);
for(let i=0;i<45;i++)charged.update(step);
assert(charged.charge()>0&&charged.charge()<1);
assert(Math.abs(charged.player.speed-(BASE_SPEED+STAR_GAIN*charged.charge()))<1e-8,'The star accelerates during the orbit, in proportion to angular travel');
charged.state='paused';const partialCharge=charged.charge();charged.update(2);assert.equal(charged.charge(),partialCharge);
charged.state='playing';while(charged.charge()<1)charged.update(step);
for(let i=0;i<120;i++)charged.update(step);
assert.equal(charged.charge(),1);assert.equal(chargeEvents.filter(e=>e.type==='charged').length,1);
const predicted=charged.launchVelocity();assert(Math.abs(predicted.factor-1.6)<1e-8);assert(Math.abs(predicted.speed-240)<1e-8);charged.release();
assert.equal(charged.player.vx,predicted.vx);assert.equal(charged.player.vy,predicted.vy);assert.equal(charged.player.launch.charge,1);
const launchPoint={x:charged.player.x,y:charged.player.y};charged.update(step);
assert(Math.abs(charged.player.x-launchPoint.x-predicted.vx*step)<1e-8);
assert(Math.abs(charged.player.y-launchPoint.y-predicted.vy*step)<1e-8);
assert.equal(charged.charge(),0);assert.equal(charged.release(),false);
charged.capture(charged.nodes.find(n=>!n.visited));assert.equal(charged.player.orbitSweep,0);assert(charged.player.speed<=360);
const capped=new OrbitWorld(5);capped.player.node.type='sling';capped.player.speed=330;capped.start();
while(capped.charge()<1)capped.update(step);assert.equal(capped.player.speed,MAX_SPEED,'Stars have a finite speed cap');
for(let i=0;i<120;i++)capped.update(step);assert.equal(capped.player.speed,MAX_SPEED);assert.equal(capped.score,0,'Orbiting cannot farm points');
const assisted=new OrbitWorld(6);assisted.player.speed=358;assisted.player.angle=-Math.PI/2;assisted.player.dir=1;assisted.player.node.vx=16;assisted.positionPlayer();
assert(assisted.player.vx>MAX_SPEED);const limitedLaunch=assisted.launchVelocity();
assert(Math.abs(limitedLaunch.speed-MAX_SPEED)<1e-8);assert(Math.abs(limitedLaunch.vx*assisted.player.vy-limitedLaunch.vy*assisted.player.vx)<1e-8,'Bounding a moving-planet assist must keep its heading');
assisted.start();assisted.release();assert(Math.abs(Math.hypot(assisted.player.vx,assisted.player.vy)-MAX_SPEED)<1e-8);

const longFlightSeconds=[];
for(const boosted of [true,false]){
  const {w,destination,captures}=distantTransfer(boosted);
  assert.equal(w.aim()?.n,destination,'The guide must include distant generated planets');
  w.release();for(let i=0;i<240;i++)w.update(step);
  w.state='paused';const frozen={x:w.player.x,y:w.player.y,time:w.player.flightTime};w.update(10);
  assert.deepEqual({x:w.player.x,y:w.player.y,time:w.player.flightTime},frozen);w.state='playing';
  for(let i=0;i<120*15&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.state,'playing');assert.equal(w.player.node,destination);
  assert(w.player.flightTime>3.6,'Regression must cross the former automatic death deadline');
  longFlightSeconds.push(w.player.flightTime);
  assert.equal(captures.length,1);assert.equal(captures[0].skipped,7);assert.equal(captures[0].skipBonus,boosted?112:70);
  assert.equal(w.score,captures[0].gain+captures[0].squareBonus,'Landing earns base, its progressive angle award and seven skipped-orbit rewards');
  const score=w.score;assert.equal(w.capture(destination),false);assert.equal(w.score,score,'Long bonuses cannot be farmed');
  assert(Math.abs((w.player.x-destination.x)*w.player.vx+(w.player.y-destination.y)*w.player.vy)<1e-7,'Captured velocity must immediately match the new orbit');
}
// The hazard sits on the flight's own line, which is the launch tangent rather than the destination's
// centre now that the fixture crosses the rim at an angle.
const longHazard=distantTransfer();longHazard.w.hazards.push({x:longHazard.w.player.x,y:-1620,r:14,near:false});
assert.equal(longHazard.w.aim(),null,'A distant hazard must block the guide');longHazard.w.release();
for(let i=0;i<120*12&&longHazard.w.state==='playing';i++)longHazard.w.update(step);
assert(longHazard.w.player.flightTime>3.6);assert.equal(longHazard.w.reason,'DRAWN INTO A VORTEX');assert.equal(longHazard.captures.length,0);
const outside=new OrbitWorld(12);outside.start();outside.player.angle=-Math.PI/2;outside.player.dir=1;outside.release();
for(let i=0;i<120*3&&outside.state==='playing';i++)outside.update(step);
assert.equal(outside.reason,'LEFT THE STAR CHART','A shot leaving the chart still ends the run');
for(const [from,to,expected]of [[0,1,0],[0,2,1],[0,4,3],[3,4.5,1],[3.5,5,1]]){
  const {w,destination,captures}=distantTransfer();w.player.node.row=from;destination.row=to;w.release();
  for(let i=0;i<120*12&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.player.node,destination);assert.equal(captures[0].skipped,expected);assert.equal(captures[0].skipBonus,expected*16,'Count each intervening full orbit, including gold detour endpoints, with the speed reward');
}

// A real new run opens on three parallel targets, one per pressure, in place of the ordinary
// single first node. Course generation waits until one is captured; that capture sets the run's
// difficulty, clears the two unchosen targets, and becomes the new main node exactly as an
// ordinary capture would.
for(const choice of ['relaxed','classic','hardcore']){
  const emitted=[],w=new OrbitWorld(55,440,860,(type,e)=>{if(type==='difficulty')emitted.push(e.value);},true);
  const paths=w.nodes.filter(n=>n.difficultyChoice);
  assert.equal(paths.length,3,'A real new run opens on three difficulty targets');
  assert.equal(paths.map(n=>n.difficultyChoice).sort().join(','),'classic,hardcore,relaxed');
  assert.equal(w.difficultyPending,true,'The choice is pending until one target is captured');
  const rowBefore=w.row;w.start();w.ensureAhead();
  assert.equal(w.row,rowBefore,'Course generation must wait for the difficulty choice');
  const target=paths.find(n=>n.difficultyChoice===choice);
  w.player.x=target.x;w.player.y=target.y;w.player.vx=0;w.player.vy=-1;
  assert.equal(w.capture(target),true,'Capturing a difficulty target is an ordinary capture');
  assert.equal(w.difficultyPending,false,'Capturing a target resolves the pending choice');
  assert.deepEqual(emitted,[choice],'The chosen pressure is announced exactly once, and only the chosen one');
  assert.equal(w.nodes.filter(n=>n.difficultyChoice).length,1,'The two unchosen targets are removed');
  assert.equal(w.nodes.some(n=>n.difficultyChoice&&n!==target),false,'Only the captured target remains');
  assert.equal(w.lastMain,target,'The captured target becomes the new main node');
  const rowAfter=w.row;w.ensureAhead();assert(w.row>rowAfter,'Course generation resumes once the choice is made');
}
{
  // Daily runs and every fixed layout keep the ordinary single-node opening.
  const daily=new OrbitWorld(56,440,860,()=>{},false);
  assert.equal(daily.nodes.some(n=>n.difficultyChoice),false,'A run started with offerDifficulty off skips the choice');
  assert.equal(daily.difficultyPending,undefined);
}

// Missing a capture outright is harsher than only missing the perfect band inside it, so Tiro's
// capMult widens the whole forgiving window generateRow and makeNode grant a node, on top of the
// narrower perfect band widened by perfectMult. Two worlds built from the same seed generate
// identical geometry, so the only thing capMult may change is the capture radius, never the
// drawn radius or position a node is placed at.
{
  const seed=777;
  const plain=new OrbitWorld(seed,440,860,()=>{},false);
  const widened=new OrbitWorld(seed,440,860,()=>{},false);
  widened.capMult=1.3;
  const pBefore=plain.nodes.length,wBefore=widened.nodes.length;
  plain.generateRow();widened.generateRow();
  const pNew=plain.nodes.slice(pBefore),wNew=widened.nodes.slice(wBefore);
  assert(pNew.length>0,'generateRow must add at least one node');
  assert.equal(wNew.length,pNew.length,'The same seed generates the same nodes regardless of capMult');
  for(let i=0;i<pNew.length;i++){
    assert.equal(wNew[i].x,pNew[i].x);assert.equal(wNew[i].r,pNew[i].r,'capMult must never change a node\'s drawn radius');
    assert(Math.abs(wNew[i].cap-pNew[i].cap*1.3)<1e-9,'capMult scales the forgiving capture window by exactly the difficulty multiplier');
  }
}


const {totalCaptures,perfects,maxNodes,maxHazards}=await pRoute;
const {totalChasms}=await pChasmRoute;
const {chartCompletions,deepCharts,deepRows,deepFiguresSize}=await pDetourDeep;

// The catalogue is fixed by the run seed and exhausts itself before repeating.
assert(CONSTELLATIONS.length>=12&&CONSTELLATIONS.every(c=>c.name===c.name.toUpperCase()&&c.shape.length===3));
assert.equal(new Set(CONSTELLATIONS.map(c=>c.name)).size,CONSTELLATIONS.length,'Every catalogue figure has its own name');
const orderA=new OrbitWorld(4242),orderB=new OrbitWorld(4242),orderC=new OrbitWorld(4243);
assert.deepEqual(orderA.catalogueOrder,orderB.catalogueOrder,'A seed fixes the figure order');
assert.notDeepEqual(orderA.catalogueOrder,orderC.catalogueOrder,'Different runs order the catalogue differently');
assert.equal(new Set(orderA.catalogueOrder).size,CONSTELLATIONS.length);
for(let region=0;region<4;region++)assert.equal(orderA.catalogueFor(region),region,'The opening four regions keep their own figures');
const drawn=[];for(let region=4;region<4+CONSTELLATIONS.length;region++)drawn.push(orderA.catalogueFor(region));
assert.equal(new Set(drawn).size,CONSTELLATIONS.length,'No figure repeats until the catalogue is exhausted');
assert.equal(orderA.catalogueFor(4+CONSTELLATIONS.length),orderA.catalogueFor(4),'The catalogue then starts again');
// Omitting varyOpening — every existing fixture and every ordinary run — must read exactly as it
// always has: the same fixed second and third planets, whatever the seed.
for(const seed of [1,4242,99999]){
  const w=new OrbitWorld(seed);
  assert.equal(w.nodes.find(n=>n.row===1).x,77,'An unvaried opening keeps its fixed second planet: seed '+seed);
  assert.equal(w.nodes.find(n=>n.row===2).x,-75,'An unvaried opening keeps its fixed third planet: seed '+seed);
}
// varyOpening lets the same seed draw both instead: a seed fixes what it draws, two different seeds
// need not agree, and the whole twelve-figure catalogue — the first four regions included — keeps the
// no-repeat-before-exhaustion promise an ordinary seed already keeps for the eight later ones alone.
const variedA=new OrbitWorld(4242,440,860,()=>{},false,true),variedB=new OrbitWorld(4242,440,860,()=>{},false,true),variedC=new OrbitWorld(4243,440,860,()=>{},false,true);
assert.deepEqual(variedA.catalogueOrder,variedB.catalogueOrder,'A seed fixes a varied opening exactly as it fixes an ordinary one');
assert.notDeepEqual(variedA.catalogueOrder,variedC.catalogueOrder,'Different seeds still vary the drawn order');
assert.equal(new Set(variedA.catalogueOrder).size,CONSTELLATIONS.length,'A varied opening still shuffles the whole catalogue, not a subset of it');
const variedDrawn=[];for(let region=0;region<CONSTELLATIONS.length;region++)variedDrawn.push(variedA.catalogueFor(region));
assert.equal(new Set(variedDrawn).size,CONSTELLATIONS.length,'No figure repeats before the catalogue is exhausted, first four regions included');
assert.equal(variedA.catalogueFor(CONSTELLATIONS.length),variedA.catalogueFor(0),'The catalogue then starts again, exactly as the unvaried opening already does');

// ---------- The chart is cut for the pace it expects ----------
// Every transfer is drawn to take about the same time to fly at the pace the chart is cut for, so the
// gulfs open as the run climbs instead of staying the length they were at the opening.
{
  const w=new OrbitWorld(4242,440,860);while(w.row<60)w.generateRow();
  const main=new Map();
  for(const n of w.nodes)if(Number.isInteger(n.row)&&n.type!=='gold'&&n.type!=='shield'&&n.routeRole!=='star')main.set(n.row,n);
  const gap=row=>{const a=main.get(row-1),b=main.get(row);return a&&b?Math.hypot(b.baseX-a.baseX,b.baseY-a.baseY)-a.r-b.r:null;};
  const early=[4,5,6].map(gap),late=[40,41,42].map(gap);
  assert(early.every(v=>v!==null)&&late.every(v=>v!==null));
  const mean=v=>v.reduce((s,x)=>s+x,0)/v.length;
  assert(mean(late)>mean(early)*1.8,'A deep crossing must be far longer than an opening one: '+mean(early).toFixed(0)+' then '+mean(late).toFixed(0));
  // The orbits open with the chart, so a wider ring is swept more slowly and presents a larger rim
  // from further off. Without this the release window would halve as the gulfs doubled.
  assert(main.get(40).r>main.get(5).r,'Orbits open with the chart rather than shrinking');
  assert(main.get(40).cap-main.get(40).r>main.get(5).cap-main.get(5).r,'and their capture bands open too');
  // A slingshot ring is the exception: its charge is earned per lap, so a wider one would only cost
  // more time against the flood for the same 90 units of speed.
  const stars=[...main.values()].filter(n=>n.type==='sling');
  assert(stars.length>=4&&stars.every(n=>n.r===57),'Slingshot rings keep their size whatever the chart does');
}
// The pace is a property of the row and not of the traveller, which is what the daily plate rests on:
// two players opening the same seed are dealt the same plate, and how one of them flies cannot change
// the chart the other is given.
{
  const plate=()=>{const w=new OrbitWorld(20260904,440,860);while(w.row<40)w.generateRow();
    return JSON.stringify(w.nodes.map(n=>[n.row,n.baseX,n.baseY,n.r,n.type]));};
  assert.equal(plate(),plate(),'One seed deals one chart');
  const flown=new OrbitWorld(20260904,440,860);flown.start();
  for(let i=0;i<120*30&&flown.state==='playing';i++){
    if(flown.player.node&&flown.aim()?.perfect)flown.release();
    flown.update(step);
  }
  while(flown.row<40)flown.generateRow();
  const untouched=new OrbitWorld(20260904,440,860);while(untouched.row<40)untouched.generateRow();
  const deep=w=>JSON.stringify([...w.nodes].filter(n=>n.row>=30).map(n=>[n.row,n.baseY]).sort());
  assert.equal(deep(flown),deep(untouched),'How a run is flown cannot change the chart it is dealt');
}
// The observation clock rides the body released, never the generation that follows it: two flights of
// one seed that hold the opening body for different fractions of SWEEP_FULL must document it
// differently, yet the chart dealt beneath them — the same fields plate() above compares — must still
// come out identical.
{
  const chart=w=>JSON.stringify(w.nodes.map(n=>[n.row,n.baseX,n.baseY,n.r,n.type]));
  const brief=new OrbitWorld(20260905,440,860);brief.start();
  brief.player.orbitSweep=SWEEP_FULL*.25;brief.release();
  const lingering=new OrbitWorld(20260905,440,860);lingering.start();
  lingering.player.orbitSweep=SWEEP_FULL*1.5;lingering.release();
  while(brief.row<40)brief.generateRow();
  while(lingering.row<40)lingering.generateRow();
  assert.notEqual(brief.nodes[0].documented,lingering.nodes[0].documented,'The two flights must actually leave different documented fractions on the opening body, or this fixture proves nothing');
  assert.equal(chart(brief),chart(lingering),'How the opening body was held cannot change the chart dealt beneath it');
}
// A sheet made narrower must not leave orbits standing outside its own edge, where a run is lost.
{
  const w=new OrbitWorld(31,1280,860);w.start();
  for(let i=0;i<120*30&&w.state==='playing';i++){
    if(w.player.node&&w.aim()?.perfect)w.release();
    w.update(step);
  }
  const before=w.nodes.map(n=>n.baseX);
  assert(w.nodes.some(n=>Math.abs(n.baseX)+n.r>440/2+16),'The wide sheet must lay orbits beyond a narrow one');
  w.resize(440,860);
  assert(w.nodes.some((n,i)=>n.baseX!==before[i]),'Narrowing the sheet must actually move what stood outside it');
  for(const n of w.nodes)assert(Math.abs(n.baseX)+n.r+n.amp<=440/2+16,'Every orbit is pulled inside the narrower chart');
  for(const h of w.hazards)assert(Math.abs(h.x)+h.r<=440/2+16);
  if(w.player.node)assert(Math.abs(w.player.x)<=440/2+16,'and the traveller rides its own orbit in');
}

// Generation of the later hazard kinds. The wind-heads are placed on their own cadence, the way a
// nebula is, so the vortex/flare alternation is read off the lethal hazards alone.
let flareRows=0,holeRows=0,windRows=0,nebulaCount=0;
for(let seed=1;seed<=60;seed++){
  const w=new OrbitWorld(seed);while(w.row<60)w.generateRow();
  const lethal=w.hazards.filter(h=>hazardKind(h).lethal),later=lethal.filter(h=>h.row>=16);
  assert(lethal.filter(h=>h.row<16).every(h=>h.kind==='vortex'),'Flares only appear from the third region');
  for(let i=1;i<later.length;i++)assert(later[i].kind!==later[i-1].kind,'Flares alternate with vortices');
  flareRows+=w.hazards.filter(h=>h.kind==='flare').length;holeRows+=w.hazards.filter(h=>h.kind==='vortex').length;
  const winds=w.hazards.filter(h=>h.kind==='wind');windRows+=winds.length;
  for(const g of winds){
    assert(g.row>=20&&g.row%5===3,'Wind-heads start at row 20 and appear at most once every five rows');
    assert(g.r>=16&&g.r<=34,'A wind-head is 16 to 34 units across its radius');
    assert(Number.isFinite(g.dir),'A wind-head blows one settled way');
    assert.equal(hazardKind(g).lethal,false,'A wind-head kills nothing');
    // It is the whole field that is kept clear, not just the head: a gust over a capture band would
    // bend the arrival itself, and two fields overlapping would be read at once.
    const field=gravityRadius(g);
    for(const q of w.nodes)assert(Math.hypot(g.x-q.baseX,g.y-q.baseY)>=q.cap+q.amp+field-1e-9,'A wind field never covers a capture band or a drift envelope');
    for(const h of w.hazards)if(h!==g)assert(Math.hypot(g.x-h.x,g.y-h.y)>=gravityRadius(h)+field-1e-9,'Two hazard fields are never read at once');
    for(const q of w.nebulas)assert(Math.hypot(g.x-q.x,g.y-q.y)>=q.r+field-1e-9,'A wind field never lies under a cloud');
  }
  assert.equal(new Set(winds.map(g=>g.row)).size,winds.length,'At most one wind-head per row');
  nebulaCount+=w.nebulas.length;
  for(const g of w.nebulas){
    assert.equal(g.kind,'nebula');assert(g.r>=60&&g.r<=90,'A nebula patch is 60 to 90 units across its radius');
    assert(g.row>=12&&g.row%4===0,'Nebulas start at row 12 and appear at most once every four rows');
    for(const q of w.nodes)assert(Math.hypot(g.x-q.baseX,g.y-q.baseY)>=q.cap+q.amp+g.r,'A nebula never covers a capture band or a drift envelope');
    for(const h of w.hazards)assert(Math.hypot(g.x-h.x,g.y-h.y)>=h.r+g.r,'A nebula never sits on a hazard');
  }
  assert.equal(new Set(w.nebulas.map(g=>g.row)).size,w.nebulas.length,'At most one nebula per row');
}
assert(flareRows>60&&holeRows>60,'Both lethal hazard kinds must be common past the third region');
assert(windRows>=120,'Wind-heads must actually appear: '+windRows);
assert(nebulaCount>=120,'Nebula patches must actually appear: '+nebulaCount);

// A hazard may sit on one of the ways between two main nodes and shut it, from row 12 and only on
// every third row. What it may never do is close the last way through: whichever side it leaves open
// has to be flyable both ways it can be flown — a smooth tangent for a perfect transfer and a
// centre-directed line for a player not yet flying them — and clear of the whole gravity field, not
// merely of the lethal core, or the flight would be bent into the hazard it was drawn around.
let hazardsPlaced=0,routesClosed=0;
for(let seed=1;seed<=120;seed++){
  const w=new OrbitWorld(seed,440,860);
  const rowOf=new Map(),placed=[];
  // Only the lethal hazards go through the route-closing placement; a wind-head is put on a route
  // deliberately and is exempt, since it cannot shut one.
  while(w.row<70){const before=w.hazards.length;w.generateRow();for(const h of w.hazards.slice(before))if(hazardKind(h).lethal)placed.push(h);}
  for(const n of w.nodes)if(Number.isInteger(n.row)&&n.type!=='gold'&&n.type!=='shield'&&n.routeRole!=='star')rowOf.set(n.row,n);
  for(const h of placed){
    const n=rowOf.get(h.row),prev=rowOf.get(h.row-1);if(!n||!prev)continue;
    hazardsPlaced++;
    const smooth=[...orbitTangents(prev,n,1),...orbitTangents(prev,n,-1)].map(p=>pointSegment(h.x,h.y,p.x,p.y,p.bx,p.by));
    const direct=tangentPaths(prev,n).map(p=>pointSegment(h.x,h.y,p.x,p.y,n.x,n.y));
    const kill=h.r+prev.amp+n.amp+25,free=gravityRadius(h)+prev.amp+n.amp+10;
    if(!smooth.concat(direct).some(d=>d<kill))continue;
    routesClosed++;
    assert(h.row>=12,'No route is closed before row 12: row '+h.row+' seed '+seed);
    assert.equal(h.row%3,2,'A route is only closed on every third row: row '+h.row+' seed '+seed);
    assert(smooth.some(d=>d>=free),'A closed crossing must leave a smooth tangent clear of the field: seed '+seed+' row '+h.row);
    assert(direct.some(d=>d>=free),'A closed crossing must leave a centred line clear of the field: seed '+seed+' row '+h.row);
  }
}
assert(routesClosed>200,'Hazards must actually close routes, not merely be allowed to: '+routesClosed);
assert(routesClosed<hazardsPlaced*.6,'A closed route stays an event, not the standing state of the chart: '+routesClosed+'/'+hazardsPlaced);

const {boostedTransfers}=await pSling;
const {totalCaptures:variedCaptures,variedOpenings,variedFigures}=await pVaried;

const missed=new OrbitWorld(77);while(missed.row<7)missed.generateRow();missed.start();
const partial=missed.constellations[0];missed.capture(partial.stars[0]);missed.capture(partial.exit);
assert(partial.expired,'Leaving an incomplete chart expires the objective');
missed.capture(partial.stars[1]);missed.capture(partial.stars[2]);assert.equal(missed.constellationsCompleted,0);assert.equal(missed.darknessGrace,0);
const respite=new OrbitWorld(78);respite.start();respite.elapsed=5;respite.floorY=110;respite.darknessGrace=4;
respite.update(.25);assert(respite.floorY>110,'The reward must move visible darkness away');
respite.state='paused';const frozenFloor=respite.floorY,frozenGrace=respite.darknessGrace;respite.update(2);
assert.equal(respite.floorY,frozenFloor);assert.equal(respite.darknessGrace,frozenGrace,'Pausing preserves the reprieve');
respite.state='playing';for(let i=0;i<120*4;i++)respite.update(step);
assert.equal(respite.darknessGrace,0);const recoveredFloor=respite.floorY;respite.update(step);assert(respite.floorY<recoveredFloor,'Darkness resumes after the reward');

// A skipped orbit also banks a capped, decaying head start on the flood: a burst of skips keeps the
// pursuit off-screen for a few seconds instead of it being re-painted at the sill next frame.
{
  const w=new OrbitWorld(81,440,860);w.start();
  const origin=w.player.node,target=w.makeNode(origin.x+origin.r+25,origin.y-900,54,6,'still');
  w.nodes=[origin,target];w.lastMain=target;w.player.angle=0;w.player.dir=-1;w.positionPlayer();
  const aim=w.aim();assert.equal(aim?.n,target);assert.equal(aim.steep,false,'the fixture must actually score');
  w.elapsed=5;w.release();
  for(let i=0;i<120*10&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.player.node,target,'the long transfer lands');
  assert(w.darknessLead>259&&w.darknessLead<=260,'five skipped orbits at 55 each are capped at 260, not stacked without limit');
  // Force the camera far ahead, as the skips just flown would, and confirm the floor is let to trail
  // behind the ordinary 25-unit slack rather than being snapped back to the sill immediately.
  w.cameraY-=600;const bound=w.cameraY+w.height-25;w.floorY=bound+w.darknessLead-5;
  w.update(step);
  assert(w.floorY>bound+1,'the banked lead must widen the clamp, not just the ordinary 25-unit slack');
  // Put the camera back to an ordinary trailing distance — the forced value above exists only to
  // prove the clamp, and pinning the floor near the player every tick keeps idle chase from ending
  // the run — so the credit's own leak, not a collision, is what the next check observes.
  w.cameraY=w.player.y-w.height*.57;
  for(let i=0;i<120*15&&w.darknessLead>0;i++){w.floorY=w.player.y+400;w.update(step);}
  assert.equal(w.state,'playing');assert.equal(w.darknessLead,0,'the head start leaks away rather than standing forever');
  w.floorY=w.cameraY+w.height+50;w.update(step);
  assert(w.floorY<=w.cameraY+w.height-25+1e-6,'once spent, the ordinary slack is all that is left');
}

// ---------- The charge carried against the rising dark ----------
// The third carried charge answers the one loss the other two do not, and the one most runs actually end
// on: the flood itself. It is dealt off the main line every nineteenth row, arms one charge at a time, and
// is spent at the moment the dark would have taken the traveller — driving the waterline back down the
// sheet and holding it off for a reprieve rather than ending the run there.
{
  let dealt=0;
  for(let seed=1;seed<=12;seed++){
    const w=new OrbitWorld(seed,440,860);while(w.row<44)w.generateRow();
    for(const n of w.nodes)if(n.type==='dawn'){
      dealt++;
      assert.equal((n.row+.5-18)%32,0,'A charge against the dark hangs off the eighteenth row and every thirty-second after it');
      assert(n.row>17,'and never before the row a median run reaches');
      assert(!w.nodes.some(q=>q!==n&&Math.hypot(q.x-n.x,q.y-n.y)<=q.r+q.amp+70),'and is cut clear of everything already on the chart');
    }
  }
  assert(dealt>=12,'The chart deals the charge wherever it has room for it: '+dealt);
}
{
  const events=[];
  const w=new OrbitWorld(55,440,860,type=>{if(type==='dawn'||type==='dawnBreak')events.push(type);});w.start();
  const origin=w.player.node,charge=w.makeNode(origin.x+origin.r+25,origin.y-400,28,6,'dawn');
  w.nodes=[origin,charge];w.lastMain=charge;w.player.angle=0;w.player.dir=-1;w.positionPlayer();
  assert.equal(w.aim()?.n,charge,'the fixture must actually reach the charge');
  w.release();
  for(let i=0;i<120*8&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.player.node,charge,'the flight lands on the charge');
  assert.equal(w.player.dawnArmed,true,'taking the orbit arms one charge');
  assert.deepEqual(events,['dawn'],'and says so exactly once');
  // The worst case the rescue has to survive is the one where the flood is already trailing the camera by
  // everything the ordinary clamp allows: the traveller at the very sill with a full skip credit banked. The
  // charge has to open that floor further on its own, or it would buy nothing at all where it is needed most.
  w.darknessLead=260;w.cameraY=w.player.y-w.height+25-260;w.floorY=w.player.y-100;
  w.update(step);
  assert.equal(w.state,'playing','A charge in hand turns the flood back rather than ending the run');
  assert.equal(w.player.dawnArmed,false,'and is spent doing it');
  assert.deepEqual(events,['dawn','dawnBreak']);
  assert(w.floorY-w.player.y>100,'the waterline is driven clear below the traveller: '+(w.floorY-w.player.y).toFixed(0));
  assert.equal(w.darknessGrace,DARKNESS_RESCUE_GRACE,'and then held off for a reprieve');
  for(let i=0;i<120*3&&w.state==='playing';i++)w.update(step);
  assert.equal(w.state,'playing','The reprieve is real time, not one frame of it');
  // Only one, and only ever the one loss it answers: the next time the flood arrives it takes the run.
  w.floorY=w.player.y-100;w.update(step);
  assert.equal(w.state,'dead');assert.equal(w.reason,'THE DARK CAUGHT UP');
  assert.deepEqual(events,['dawn','dawnBreak'],'a spent charge is not spent twice');
}
{
  // The trailing room a rescue grants is not the credit a skipped orbit banks, and a skip flown while it
  // is still standing must not cut it back to what skipping alone is allowed to hold.
  const {w,destination}=distantTransfer(false);
  w.release();
  for(let i=0;i<120*20&&w.state==='playing'&&!w.player.node;i++){w.update(step);w.darknessLead=400;}
  assert.equal(w.player.node,destination,'the long transfer lands');
  assert(w.darknessLead>300,'seven skipped orbits must not cut back room the flood was already being held off by: '+w.darknessLead.toFixed(0));
}

// Explicit hazard contact and disappearing-node deadline.
const hit=new OrbitWorld(9);hit.start();hit.release();hit.hazards.push({x:hit.player.x+hit.player.vx*.05,y:hit.player.y+hit.player.vy*.05,r:10,near:false});
for(let i=0;i<15;i++)hit.update(step);assert.equal(hit.state,'dead');assert.equal(hit.reason,'DRAWN INTO A VORTEX');
const fade=new OrbitWorld(8);fade.start();fade.player.node.type='fading';fade.player.orbitTime=4.49;fade.update(.02);assert.equal(fade.reason,'THE ORBIT FADED');

// n.documented freezes the fraction of SWEEP_FULL an orbit actually held, the moment the traveller
// lets go of it: a partial hold documents partially, and one held past a full two thirds of a turn
// still documents at exactly one, never past it.
{
  const partial=new OrbitWorld(106);partial.start();
  const n=partial.player.node;partial.player.orbitSweep=SWEEP_FULL*.4;partial.release();
  assert.equal(n.documented,.4,'A released body documents exactly the fraction of SWEEP_FULL it held');
}
{
  const overheld=new OrbitWorld(107);overheld.start();
  const n=overheld.player.node;overheld.player.orbitSweep=SWEEP_FULL*1.3;overheld.release();
  assert.equal(n.documented,1,'An orbit held past SWEEP_FULL still documents at one and never beyond it');
}
// A body's documented fraction is frozen at release and nothing captured afterwards can touch it: the
// player's own sweep is zeroed by the very next capture, and a body that went on reading it live would
// blank the instant the traveller landed anywhere else.
{
  const w=new OrbitWorld(108);w.start();
  const first=w.player.node;w.player.orbitSweep=SWEEP_FULL*.7;w.release();
  const documented=first.documented,second=w.nodes.find(q=>q!==first&&!q.visited);
  w.capture(second);
  assert.equal(first.documented,documented,'A later capture must never rewrite an earlier body\'s documented fraction');
}
// Dying while still in orbit is not a release: die() never lets go of p.node, so a body held at death
// carries no frozen fraction at all and the renderer's only truth is the live orbitSweep it can still read.
{
  const w=new OrbitWorld(109);w.start();
  const n=w.player.node;n.type='fading';w.player.orbitTime=4.49;w.player.orbitSweep=SWEEP_FULL*.55;
  w.update(.02);
  assert.equal(w.state,'dead','A fading orbit held past 4.5s of dwell ends the run');
  assert.equal(w.player.node,n,'Dying in orbit must leave the node on the player rather than clear it');
  assert.equal(n.documented,undefined,'A body died on rather than released from is never frozen onto');
}
// A body neither captured nor released carries no documented fraction at all, which is exactly what
// the renderer's own (n.documented||0) turns into nothing drawn.
{
  const w=new OrbitWorld(110);w.start();
  const untouched=w.nodes.find(n=>!n.visited);
  assert.equal(untouched.documented,undefined,'An untouched body carries no documented fraction');
  assert.equal(untouched.documented||0,0,'A missing documented fraction reads as zero wherever it is asked for');
}

const layouts=(await pLayouts).filter(Boolean);

// Two pilots traverse the same course. A dawdler that lingers two laps on every ring and leaves its
// stars uncharged keeps little of the chart's pace and is eventually overhauled by the flood;
// deliberate charging and tangent entries outrun the fully developed pursuit. No artificial flight
// timer and no automatic speed gain: the difference is entirely in how the two of them fly.
function pressureRun(useStars,observations,inkMult=0){
  const w=new OrbitWorld(1,440,860,observations?(type,e)=>{if(type==='observation')observations.push(e);}:undefined);w.start();
  // The pursuit is what these two runs are about, so ink is free here and measured on its own below.
  w.inkMult=inkMult;w.bestRelief=1;
  // 220 rows is a longer journey than it was: the chart is now cut for the pace it expects, so the
  // same row count covers close to twice the distance and needs the wall-clock to match.
  for(let i=0;i<120*700&&w.state==='playing'&&w.progress<220;i++){
    const n=w.player.node;
    if(n){
      const target=w.nodes.find(q=>q.row===Math.floor(w.progress)+1&&q.type!=='gold'),aim=w.aim();
      // The dawdler takes whatever landing the rim will accept, but only after two idle laps, and
      // never charges a star. The other flies tangents and takes every star to a full lap.
      const ready=useStars?aim&&(aim.perfect||w.player.orbitSweep>Math.PI*3):aim&&w.player.orbitSweep>Math.PI*4;
      if(ready&&!aim.steep&&aim.n===target&&w.player.orbitTime>.12&&(!useStars||n.type!=='sling'||w.charge()===1))w.release();
    }
    w.update(step);
    w.bestRelief=Math.min(w.bestRelief,w.darknessRelief());
    if(!w.player.node)assert(Math.hypot(w.player.vx,w.player.vy)<=MAX_SPEED+1e-7);
  }
  return w;
}
// These long pilots are playthroughs too, and a quick run leaves them to `npm test` with the rest.
const observed=[];let slowRun,fastRun;
if(!quick){
slowRun=pressureRun(false);fastRun=pressureRun(true,observed);
assert.equal(slowRun.state,'dead');assert.equal(slowRun.reason,'THE DARK CAUGHT UP');// Consistently slow play meets the flood far sooner than it once did, and deliberately so: the chart
// is cut for a faster pace with the tide taking a quarter of that growth, from row 12 a hazard may
// close one side of a crossing, and a rim will not accept a flight that falls at it. The band is what
// this assertion is really for — the pursuit must neither become unable to catch a dawdler nor take
// one the instant the run begins.
assert(slowRun.elapsed>60&&slowRun.elapsed<300,'The pursuit must eventually catch consistently slow progress: '+slowRun.elapsed.toFixed(0)+'s');
}
// The streak rule, tested where it lives rather than read off whichever landing a pilot happened to
// stop on: an ordinary capture resets it, and with no streak there is no relief from the pursuit.
{
  const streak=transferFixture(25,240);streak.w.perfectStreak=6;
  assert(streak.w.darknessRelief()<1,'A standing streak is worth relief');
  streak.w.release();
  for(let i=0;i<120*3&&!streak.w.player.node;i++)streak.w.update(step);
  assert.equal(streak.captures[0].perfect,false,'An angled arrival is an ordinary capture');
  assert.equal(streak.w.perfectStreak,0,'An ordinary capture resets the perfect streak');
  assert.equal(streak.w.darknessRelief(),1,'and with it the relief from the pursuit');
}
if(!quick){
assert.equal(fastRun.state,'playing');assert(fastRun.progress>=220&&fastRun.elapsed>slowRun.elapsed);
// The two pressures answer two different mistakes, and a run can only dodge both by flying well.
// Dwelling on a ring buys ink but spends the time the flood is counting, so the slow, centred pilot
// above is caught by the dark with ink still in hand. Leaving at the first opening spends distance
// faster than any landing pays it back, so a pilot that never waits runs the nib dry instead. Flying
// tangent entries and charging the stars pays for both and outlasts the pursuit.
const wetRun=pressureRun(true,undefined,1);
assert.equal(wetRun.state,'playing','Tangent entries and charged stars keep the nib paid for');
assert(wetRun.progress>=220&&wetRun.inkLevel()>0,'A well-flown run reaches row 220 with ink to spare');
assert(pressureRun(false,undefined,1).inkLevel()>0,'A run that dwells is never short of ink, only of time');
// The rusher is flown without the release grace. It lets go on the very first frame a landing opens,
// which is a hand no screen delivers, and that first frame so often sits a few thousandths from the
// perfect band skimming the same rim that the grace would let most of its releases go on the tangent —
// flying the strategy this assertion is meant to price out of existence rather than the one it names.
function rusher(seed){
  const w=new OrbitWorld(seed,440,860);w.releaseGrace=0;w.start();
  for(let i=0;i<120*400&&w.state==='playing'&&w.progress<120;i++){
    if(w.player.node){const aim=w.aim();if(aim&&!aim.steep&&aim.n.row>w.progress&&w.player.orbitTime>.12)w.release();}
    w.update(step);
  }
  return w;
}
const rushed=[1,2,3,4,5,6,7,8].map(rusher);
assert(rushed.every(w=>w.reason==='THE NIB RAN DRY'),
  'Leaving at the first opening every time must run the nib dry: '+JSON.stringify(rushed.map(w=>w.reason)));
assert(rushed.every(w=>w.progress<60),'The nib gives out well before a rushed run gets deep');
// The pursuit is fully developed at 150; a long chain of perfect transfers holds it
// 15% back, which is the whole of the relief a run can earn.
assert.equal(fastRun.bestRelief,.85,'A long chain of perfect transfers earns the whole of the relief');
assert.equal(150*fastRun.bestRelief,127.5,'A player using speed and smooth transfers faces 127.5 where sloppy play faces the full 150');
}
const reliefWorld=new OrbitWorld(21);reliefWorld.start();reliefWorld.elapsed=400;
for(const [streak,factor] of [[0,1],[1,1],[2,1],[3,.97],[4,.94],[7,.85],[40,.85]]){
  reliefWorld.perfectStreak=streak;
  assert(Math.abs(reliefWorld.darknessSpeed()-150*factor)<1e-9,'Each perfect past the second slows the pursuit 3%, to a limit of 15%');
}
if(!quick){
// Named feats fire once each and are recorded on the world in the order they happen.
assert(observed.length>=3,'A long, fast run must earn several observations: '+JSON.stringify(observed.map(o=>o.key)));
assert.equal(new Set(observed.map(o=>o.key)).size,observed.length,'Each observation is awarded once per run');
assert.equal(observed.length,fastRun.observations.length);
assert(observed.every((o,i)=>o===fastRun.observations[i]),'Emitted observations are the ones recorded on the world');
assert(observed.every(o=>OBSERVATIONS[o.key]&&o.name===OBSERVATIONS[o.key].name&&o.latin===OBSERVATIONS[o.key].latin));
for(const key of ['perfectThree','maxSpeed','fortyRows','threeMinutes'])assert(observed.some(o=>o.key===key),'Expected the '+key+' observation: '+JSON.stringify(observed.map(o=>o.key)));
// The dawdler takes whatever landing the rim accepts, so it does sometimes fly a tangent by luck; the
// claim worth holding is that the feat is never awarded without the transfers it names.
assert(!slowRun.observations.some(o=>o.key==='perfectThree')||slowRun.perfects>=3,
  'TRES PERFECTI is never earned without three perfect transfers');
}
{
  const plain=transferFixture(25,240);plain.w.release();
  for(let i=0;i<120*3&&!plain.w.player.node;i++)plain.w.update(step);
  assert.equal(plain.w.perfects,0,'An angled arrival is not a perfect transfer');
  assert.equal(plain.w.observations.some(o=>o.key==='perfectThree'),false,'A run without perfect transfers cannot earn TRES PERFECTI');
}
assert.equal((html.match(/<\/script>/g)||[]).length,1);
assert(!/\b(fetch\(|XMLHttpRequest|WebSocket|https?:\/\/)/.test(script),'Game must not require the network');

console.log(JSON.stringify({simulation:quick?'passed (quick: playthroughs skipped)':'passed',...(quick?{}:{routeSeeds:60,detourSeeds:60,slingSeeds:60,deepSeeds:60}),boostedTransfers,longFlightSeconds,openingIdleSeconds:idle.elapsed,driftCaptures,gravity:{curvedCaptures,maxPreviewSteps,slowFlybyDegrees:slowClose.turn*180/Math.PI,fastFlybyDegrees:fastClose.turn*180/Math.PI,flareCaptures,flareGrazes,flareFlybyDegrees:flareSlow.turn*180/Math.PI,windCaptures},pressure:quick?undefined:{slowCaughtAt:slowRun.elapsed,fastSurvivedTo:fastRun.elapsed,fastProgress:fastRun.progress,reliefEarned:1-fastRun.bestRelief},chartCompletions,catalogue:CONSTELLATIONS.length,deep:{rowsReached:deepRows/60,lateChartsTraced:deepCharts,lateFiguresSeen:deepFiguresSize},hazards:{flares:flareRows,vortices:holeRows,winds:windRows,nebulas:nebulaCount,placed:hazardsPlaced,closingARoute:routesClosed},observations:observed.map(o=>o.key),transfers:totalCaptures,perfectTransfers:perfects,maxResidentNodes:maxNodes,maxResidentHazards:maxHazards,variedOpening:{seeds:variedOpenings,transfers:variedCaptures,distinctFirstFigures:variedFigures},runtimeLayouts:layouts,checks:['rim tangency in both directions at three speeds','moving-planet tangent prediction and momentum','symmetric gravity with retained speed','curved guide matches real captures','vortex warnings match collisions','bounded prediction and clipped lens sampling','center captures do not earn perfects','persistent speed and star acceleration','speed-based rewards and bounded launches','slow progress eventually loses; charged runs survive','a nib charged with ink, spent by distance and paid back by landings','a guide that prices its own course and marks the one the nib cannot pay for','two pressures: dwelling loses to the dark, rushing runs the nib dry','a chart cut for the pace it expects, with orbits that open with it','a rough radial arrival that keeps its base score and is marked before the release','a pace that hides the far end of a fast crossing without moving the landing','one seed deals one chart however it is flown','a narrowed sheet pulls its orbits back inside its edge','hazards that close one way across but never the last','swept collision','automatic capture','both routes through 48 rows','forks in every region through 60 rows','a seeded catalogue of twelve figures','an engraving for every catalogue figure','a varied opening that draws the second and third planets and all twelve regions’ figures from its own seed, exactly as playable as a fixed one','lettering along an arc','the page turn completes and freezes','charged shortcut routes','one-lap charge, cap and reset','boosted preview matches momentum','long flights have no expiry','per-orbit skip rewards including gold endpoints','distant hazards and chart boundary','resizing mid-run','bounded generation','constellation reward and expiry','duplicate capture protection','symmetric repulsive flare fields with a smaller core','arrival angles and the right-angle square bonus','flare guides match real flight','wind-heads that bend a crossing without ever ending one, and whose guide matches real flight','inert nebulas that fog the guide but not the flight','perfect streaks relieve the pursuit','a charge carried against the rising dark, dealt off the main line and spent once at the waterline','observations awarded once per run','the daily plate, its own record and its copied line','the ephemeris of daily plates: a day opened only by having been drawn on itself, dealt again from its own date','the ascent record','an empty ledger from a fresh, blocked or malformed store','the ledger written at the end of a run','a Journey banked only by a Journey run, paced by knowledge and gated by milestones','a Chronicle and an Endless reading of every century that offers both','a change of medium inside a run, once per transition row, grown from the body landed on with the dark held still','a Journey door onto the frontier, its milestones said on the frontispiece and the leaf, and the page turned between runs once an era is known','every unlock threshold in the catalogue','every plate and every cosmetic selection renders','a bounded dried route, cleared with the run','a surveyed departure and a surveyed square landing, bounded and cleared','descriptions inscribed on the chart, carried by the sheet, kept off the margins, never overlapping and never fading','a nebula baked into its own faint sprite','the gloss kept clear of the footer band at every layout','the catalogue leaf, its locked rules and its initials','reprieve and pause','a pause control on the sheet, its leaf, and the run it sets aside for the frontispiece','earlier rising darkness','fading orbit','hazard death','full-script boot and drawing arguments','slingshot UI and hints','blocked localStorage','one-tap restart','focus pause','a chart replayed from nothing but its own seed and release log matches the run that drew it, unpruned','a review scrolls freely over that replay and its range never inverts','a plate saved at the end of a run is named on the frontispiece and reviewable from it, blocked storage included','no network dependencies']},null,2));
}
