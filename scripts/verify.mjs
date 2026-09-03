/* Deterministic simulation and runtime checks. No browser or dependencies required. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const simulation=script.split('// BEGIN SIMULATION')[1].split('// END SIMULATION')[0];
const sandbox={};vm.createContext(sandbox);vm.runInContext(simulation+'\nthis.api={OrbitWorld,segmentCircle,tangentPaths,orbitTangents,transferContact,nodeMotion,pointSegment,gravityRadius,bendVelocity,flightStep,BASE_SPEED,MAX_SPEED,STAR_GAIN};',sandbox);
const {OrbitWorld,segmentCircle,tangentPaths,orbitTangents,transferContact,nodeMotion,pointSegment,gravityRadius,bendVelocity,flightStep,BASE_SPEED,MAX_SPEED,STAR_GAIN}=sandbox.api;
const step=1/120;

assert.equal(segmentCircle(-100,0,100,0,0,0,10),.45,'Swept collision must detect fast crossing');
assert.equal(segmentCircle(-100,20,100,20,0,0,10),null);
assert.equal(segmentCircle(0,0,100,0,0,0,10),0);

// Black-hole flybys bend close, slow flights most strongly while preserving
// the player's selected speed. The field ends cleanly outside its drawn range.
function flyby(offset,speed){
  const h={x:0,y:0,r:24,seed:1,phase:0},p={x:offset,y:180,vx:0,vy:-speed};let minDistance=Infinity,hit=null;
  for(let i=0;i<120*6&&p.y>-180&&!hit;i++){
    const result=flightStep(p,[],[h],i*step,step,180,4000);minDistance=Math.min(minDistance,Math.hypot(p.x,p.y));hit=result.hit;
  }
  return {p,hit,minDistance,turn:Math.atan2(-p.vx,-p.vy)};
}
for(const speed of [150,240,360])for(const offset of [45,60,85,130]){
  const result=flyby(offset,speed);assert(Number.isFinite(result.p.x)&&Number.isFinite(result.p.y));
  assert(Math.abs(Math.hypot(result.p.vx,result.p.vy)-speed)<1e-7,'Gravity changes heading without overriding earned speed');
}
const slowClose=flyby(60,150),fastClose=flyby(60,360),farPass=flyby(130,150),mirror=flyby(-60,150);
assert(slowClose.turn>.25&&slowClose.turn<.5,'A close pass at opening speed should visibly turn the flight');
assert(fastClose.turn>.025&&fastClose.turn<.08&&fastClose.turn<slowClose.turn,'Faster flybys get less time to bend');
assert(Math.abs(farPass.turn)<1e-10);assert(Math.abs(mirror.turn+slowClose.turn)<1e-10,'The field is symmetric around the black hole');

function curvedFixture(speed=240,drift=false,angle=-.002){
  const captures=[],w=new OrbitWorld(712,440,860,(type,e)=>{if(type==='capture')captures.push(e);}),origin=w.player.node;
  origin.x=origin.baseX=-57;const destination=w.makeNode(70,-420,50,2,drift?'drift':'still');
  w.nodes=[origin,destination];w.lastMain=destination;w.row=2;w.ensureAhead=()=>{};
  w.hazards=[{x:70,y:-170,r:24,seed:43,phase:.2,near:false}];
  w.player.angle=angle;w.player.dir=-1;w.player.speed=speed;w.positionPlayer();w.start();return {w,destination,captures};
}
let curvedCaptures=0,maxPreviewSteps=0;
for(const [speed,drift,angle] of [[150,false,-.032],[150,true,-.026],[240,false,-.002],[240,true,-.02],[360,false,.016],[360,true,-.014]]){
  const {w,destination,captures}=curvedFixture(speed,drift,angle),before={score:w.score,near:w.hazards[0].near,node:w.player.node};
  const aim=w.aim(),preview=w.flightPreview;assert.equal(aim?.n,destination);assert(preview.curved&&preview.points.length>4);maxPreviewSteps=Math.max(maxPreviewSteps,preview.steps);
  assert.deepEqual({score:w.score,near:w.hazards[0].near,node:w.player.node},before,'Prediction cannot mutate the live run');
  const expected=preview.points.at(-1);w.release();for(let i=0;i<120*8&&!w.player.node&&w.state==='playing';i++)w.update(step);
  assert.equal(w.player.node,destination);assert.equal(captures[0].perfect,aim.perfect);
  assert(Math.hypot(w.player.x-expected.x,w.player.y-expected.y)<.2,'The curved guide must land where real flight lands');curvedCaptures++;
}
assert(maxPreviewSteps<300,'Curved prediction must remain bounded');
const blockedCurve=curvedFixture(240,false,.32);assert.equal(blockedCurve.w.aim(),null);assert.equal(blockedCurve.w.flightPreview.blocked,'hole');
const blockedPoint=blockedCurve.w.flightPreview.points.at(-1);assert(Math.abs(Math.hypot(blockedPoint.x-70,blockedPoint.y+170)-27)<.02);
blockedCurve.w.release();for(let i=0;i<120*4&&blockedCurve.w.state==='playing';i++)blockedCurve.w.update(step);
assert.equal(blockedCurve.w.reason,'CAUGHT BY A BLACK HOLE','A warning guide must agree with the real collision');

// A perfect transfer reaches a rim tangent without changing direction or speed.
// Test both arrival windings, fast frame-spanning flights, and rough center hits.
function transferFixture(offset,speed=240,drift=false){
  const captures=[],w=new OrbitWorld(101,440,860,(type,e)=>{if(type==='capture')captures.push(e);});
  const origin=w.player.node,destination=w.makeNode(0,-300,50,1,drift?'drift':'still');
  if(drift){destination.amp=18;destination.phase=.4;}
  origin.x=origin.baseX=offset-origin.r;w.player.angle=0;w.player.dir=-1;w.player.speed=speed;w.positionPlayer();
  w.nodes=[origin,destination];w.lastMain=destination;w.row=1;w.start();return {w,destination,captures};
}
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
const roughSlow=transferFixture(0,150),roughFast=transferFixture(0,300);
for(const test of [roughSlow,roughFast]){
  assert.equal(test.w.aim().perfect,false,'Center-directed flights are ordinary captures');test.w.release();
  for(let i=0;i<120*3&&!test.w.player.node;i++)test.w.update(step);
  assert.equal(test.w.player.node,test.destination);assert.equal(test.captures[0].perfect,false);
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

// A clear 1,800-unit transfer used to die at 3.6 seconds, before reaching its
// destination. Flight duration must never override a valid distant landing.
function distantTransfer(boosted=true){
  const captures=[],w=new OrbitWorld(99,440,860,(type,e)=>{if(type==='capture')captures.push(e);});
  const origin=w.player.node;origin.type=boosted?'sling':'still';
  w.player.angle=0;w.player.dir=-1;w.player.orbitSweep=Math.PI*2;
  w.player.speed=boosted?240:150;
  w.positionPlayer();
  const destination=w.makeNode(origin.x+origin.r,-1800,54,8,'still');
  w.nodes=[origin,destination];w.lastMain=destination;w.row=8;w.start();
  return {w,destination,captures};
}
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
  assert.equal(w.score,boosted?131:82,'Landing earns base, flow and seven skipped-orbit rewards, multiplied by arrival speed');
  const score=w.score;assert.equal(w.capture(destination),false);assert.equal(w.score,score,'Long bonuses cannot be farmed');
  assert(Math.abs((w.player.x-destination.x)*w.player.vx+(w.player.y-destination.y)*w.player.vy)<1e-7,'Captured velocity must immediately match the new orbit');
}
const longHazard=distantTransfer();longHazard.w.hazards.push({x:longHazard.destination.x,y:-1620,r:14,near:false});
assert.equal(longHazard.w.aim(),null,'A distant hazard must block the guide');longHazard.w.release();
for(let i=0;i<120*12&&longHazard.w.state==='playing';i++)longHazard.w.update(step);
assert(longHazard.w.player.flightTime>3.6);assert.equal(longHazard.w.reason,'CAUGHT BY A BLACK HOLE');assert.equal(longHazard.captures.length,0);
const outside=new OrbitWorld(12);outside.start();outside.player.angle=-Math.PI/2;outside.player.dir=1;outside.release();
for(let i=0;i<120*3&&outside.state==='playing';i++)outside.update(step);
assert.equal(outside.reason,'LEFT THE STAR CHART','A shot leaving the chart still ends the run');
for(const [from,to,expected]of [[0,1,0],[0,2,1],[0,4,3],[3,4.5,1],[3.5,5,1]]){
  const {w,destination,captures}=distantTransfer();w.player.node.row=from;destination.row=to;w.release();
  for(let i=0;i<120*12&&w.state==='playing'&&!w.player.node;i++)w.update(step);
  assert.equal(w.player.node,destination);assert.equal(captures[0].skipped,expected);assert.equal(captures[0].skipBonus,expected*16,'Count each intervening full orbit, including gold detour endpoints, with the speed reward');
}

// A tangent-seeking pilot uses the stars and follows the generated main route.
let totalCaptures=0,perfects=0,maxNodes=0,maxHazards=0;const failures=[];
for(let seed=1;seed<=60;seed++){
  const w=new OrbitWorld(seed,seed%3===0?1280:440,860);w.start();
  for(let i=0;i<120*220&&w.state==='playing'&&w.progress<48;i++){
    if(w.player.node){
      const aim=w.aim();
      if(aim&&aim.n.type!=='gold'&&aim.n.row===Math.floor(w.progress)+1&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))w.release();
    }
    w.update(step);
    if(i===120*12&&seed%4===0)w.resize(1280,780);
    if(i===120*16&&seed%4===0)w.resize(440,860);
    assert(Number.isFinite(w.player.x)&&Number.isFinite(w.player.y));
    maxNodes=Math.max(maxNodes,w.nodes.length);maxHazards=Math.max(maxHazards,w.hazards.length);
  }
  totalCaptures+=w.captures;perfects+=w.perfects;
  if(w.progress<48)failures.push({seed,progress:w.progress,reason:w.reason,elapsed:w.elapsed});
}
assert.equal(failures.length,0,'Every tested route must remain playable: '+JSON.stringify(failures));
assert(maxNodes<20&&maxHazards<12,'Endless generation should stay bounded');

// Follow each optional three-star path, rejoin, and continue to row 48.
// This exercises real tangent launches and automatic captures on both sides.
let chartCompletions=0;const detourFailures=[];
for(let seed=1;seed<=60;seed++){
  const rewards=[],w=new OrbitWorld(seed,seed%3===0?1280:440,860,(type,e)=>{if(type==='constellation')rewards.push(e);});w.start();
  for(let i=0;i<120*240&&w.state==='playing'&&w.progress<48;i++){
    if(w.player.node){
      const row=Math.floor(w.progress)+1;
      const target=w.nodes.find(n=>n.row===row&&n.routeRole==='star')||w.nodes.find(n=>n.row===row&&n.type!=='gold');
      const aim=w.aim();
      if(aim&&target&&aim.n.id===target.id&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))w.release();
    }
    w.update(step);
    if(i===120*12&&seed%4===0)w.resize(1280,780);
    if(i===120*16&&seed%4===0)w.resize(440,860);
    assert(w.nodes.length<20&&w.constellations.length<=4,'Branch generation must stay bounded');
  }
  if(w.progress<48||w.constellationsCompleted!==4)detourFailures.push({seed,progress:w.progress,completed:w.constellationsCompleted,reason:w.reason});
  chartCompletions+=w.constellationsCompleted;
  assert.equal(rewards.length,w.constellationsCompleted,'Exactly one reward event per completed chart');
  assert(rewards.every(e=>e.gain===60&&e.chart.mask===7));
  if(w.constellationsCompleted===4){
    const score=w.score,captures=w.captures;
    assert.equal(w.capture(w.constellations[3].stars[2]),false,'A visited star cannot be farmed');
    assert.equal(w.score,score);assert.equal(w.captures,captures);
  }
}
assert.equal(detourFailures.length,0,'Every optional path must be playable: '+JSON.stringify(detourFailures));

// Charge fully at every slingshot and take its direct two-row transfer.
let boostedTransfers=0;const slingFailures=[];
for(let seed=1;seed<=60;seed++){
  const w=new OrbitWorld(seed,440,860);w.start();let expected=null,boosts=0;
  for(let i=0;i<120*240&&w.state==='playing'&&w.progress<48;i++){
    if(w.player.node){
      if(expected!==null){assert.equal(w.player.node.id,expected,'A charged guide must lead to the advertised landing');boosts++;expected=null;}
      const n=w.player.node,row=Math.floor(w.progress)+1;
      const target=n.shortcut?w.nodes.find(q=>q.id===n.shortcutId):w.nodes.find(q=>q.row===row&&q.routeRole==='star')||w.nodes.find(q=>q.row===row&&q.type!=='gold');
      const aim=w.aim();
      if(aim&&target&&aim.n.id===target.id&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(n.type!=='sling'||w.charge()===1)){
        if(n.shortcut)expected=target.id;
        w.release();
      }
    }
    w.update(step);
  }
  if(expected!==null&&w.player.node?.id===expected)boosts++;
  boostedTransfers+=boosts;
  if(w.progress<48||boosts!==6)slingFailures.push({seed,progress:w.progress,boosts,reason:w.reason});
}
assert.equal(slingFailures.length,0,'Charged shortcuts must remain playable: '+JSON.stringify(slingFailures));

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

// Explicit hazard contact and disappearing-node deadline.
const hit=new OrbitWorld(9);hit.start();hit.release();hit.hazards.push({x:hit.player.x+hit.player.vx*.05,y:hit.player.y+hit.player.vy*.05,r:10,near:false});
for(let i=0;i<15;i++)hit.update(step);assert.equal(hit.state,'dead');assert.equal(hit.reason,'CAUGHT BY A BLACK HOLE');
const fade=new OrbitWorld(8);fade.start();fade.player.node.type='fading';fade.player.orbitTime=4.49;fade.update(.02);assert.equal(fade.reason,'THE ORBIT FADED');

// Execute the complete script against native-API stand-ins. This catches boot,
// input, storage, drawing-argument, and restart errors without a browser session.
function runtime(width,height,storageBlocked=false,reduceMotion=false){
  const events={},items=new Map(),raf=[],saved=new Map();
  let lensCopies=0;
  const gradient={addColorStop(){}};
  const drawing=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>gradient,createLinearGradient:()=>gradient,createPattern:()=>({})},{
    get(target,key){return key in target?target[key]:(...args)=>{
      for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),'Non-finite canvas argument in '+String(key));
      if(key==='drawImage'&&args[0]?.id==='sky'&&args.length===9){
        const [source,x,y,w,h,,,dw,dh]=args;
        assert(x>=0&&y>=0&&w>0&&h>0&&dw>0&&dh>0);assert(x+w<=source.width+1e-6&&y+h<=source.height+1e-6,'Lens sampling must clip to the real canvas bounds');lensCopies++;
      }
    };},set(target,key,value){target[key]=value;return true;}
  });
  function element(id){
    if(items.has(id))return items.get(id);
    const classes=new Set(),e={id,style:{},textContent:'',innerHTML:'',classList:{add:(...x)=>x.forEach(a=>classes.add(a)),remove:(...x)=>x.forEach(a=>classes.delete(a)),toggle:(x,force)=>force?classes.add(x):classes.delete(x),contains:x=>classes.has(x)},setAttribute(){},getContext:()=>drawing,getBoundingClientRect:()=>({width,height}),closest:()=>null,addEventListener:(type,fn)=>{events[id+':'+type]=fn;}};
    items.set(id,e);return e;
  }
  const context={console,Math,Date,Uint8ClampedArray,performance:{now:()=>0},requestAnimationFrame:fn=>raf.push(fn),document:{hidden:false,getElementById:element,createElement:()=>element('offscreen-'+items.size),addEventListener:(t,fn)=>{events['document:'+t]=fn;}},window:{devicePixelRatio:2,matchMedia:()=>({matches:reduceMotion}),addEventListener:(t,fn)=>{events['window:'+t]=fn;}},localStorage:{getItem:k=>{if(storageBlocked)throw Error('blocked');return saved.get(k)??null;},setItem:(k,v)=>{if(storageBlocked)throw Error('blocked');saved.set(k,v);}}};
  vm.createContext(context);vm.runInContext(script+'\nthis.test={get world(){return world},handleInput,newWorld,resize,render,showEnd,audio,drawCelestialScene,setPlate,get plateName(){return plateName}};',context);
  // Drive real frame callbacks so sampled trail history is rendered in orbit,
  // in flight, after death, and across pause/restart, including reduced motion.
  let clock=1;const frames=count=>{for(let i=0;i<count;i++){const next=raf.shift();assert(next);next(clock+=1000/60);}};
  assert.equal(context.test.world.state,'ready');
  for(let chapter=0;chapter<4;chapter++)context.test.drawCelestialScene(chapter,1);
  // Both plates must boot, draw every chapter, and switch mid-run without touching the simulation.
  context.test.setPlate('paper');assert.equal(context.test.plateName,'paper');
  for(let chapter=0;chapter<4;chapter++)context.test.drawCelestialScene(chapter,1);
  context.test.handleInput();assert.equal(context.test.world.state,'playing');
  frames(75);const midRun=context.test.world.time;context.test.setPlate('night');assert.equal(context.test.world.time,midRun);
  frames(75);
  context.test.handleInput();assert.equal(context.test.world.player.node,null);
  frames(900);
  assert.equal(context.test.world.state,'dead');context.test.render(.1);
  context.test.handleInput();assert.equal(context.test.world.state,'playing');assert.equal(context.test.world.score,0);assert(context.test.world.player.node);
  events['window:blur']();assert.equal(context.test.world.state,'paused');const pausedTime=context.test.world.time;frames(10);assert.equal(context.test.world.time,pausedTime);context.test.handleInput();assert.equal(context.test.world.state,'playing');
  context.test.render(step);
  // Complete a constellation through the full runtime, including presentation,
  // score persistence, pause during the reward, the end screen, and a new run.
  const run=context.test.world;let captures=run.captures;
  for(let i=0;i<120*70&&run.state==='playing'&&run.constellationsCompleted===0;i++){
    if(run.player.node){
      const row=Math.floor(run.progress)+1,target=run.nodes.find(n=>n.row===row&&n.routeRole==='star')||run.nodes.find(n=>n.row===row&&n.type!=='gold'),aim=run.aim();
      if(aim&&target&&aim.n.id===target.id&&aim.perfect&&run.player.orbitTime>.12)run.release();
    }
    run.update(step);
    if(i%60===0||captures!==run.captures){context.test.render(step);captures=run.captures;}
  }
  assert.equal(run.constellationsCompleted,1,'The complete runtime must support the optional route');
  assert(element('announcement').textContent.includes('Darkness retreats'));
  if(!storageBlocked)assert(Number(saved.get('orbit.best.v1'))>=run.score,'The constellation bonus must be saved in the best score');
  const grace=run.darknessGrace;events['window:blur']();run.update(1);context.test.render(.1);assert.equal(run.darknessGrace,grace);
  context.test.handleInput();
  for(let i=0;i<120*30&&run.state==='playing'&&run.progress<7;i++){
    const aim=run.aim();if(aim&&aim.perfect&&aim.n.row===7&&run.player.orbitTime>.12)run.release();run.update(step);
  }
  assert.equal(run.player.node?.type,'sling',JSON.stringify({seed:run.seed,progress:run.progress,reason:run.reason}));context.test.render(step);
  assert(element('hint').textContent.includes('One lap'));
  while(run.state==='playing'&&run.charge()<1){run.update(step);context.test.render(step);}
  assert.equal(run.charge(),1);assert(/FULL CHARGE|MAX SPEED/.test(element('toast').textContent));
  events['window:blur']();run.update(1);assert.equal(run.charge(),1);context.test.handleInput();
  const shortcut=run.player.node.shortcutId;
  for(let i=0;i<120*10&&run.state==='playing'&&run.player.node;i++){
    const aim=run.aim();if(aim&&aim.n.id===shortcut&&aim.perfect)run.release();else run.update(step);
  }
  assert.equal(run.player.node,null);assert(element('toast').textContent.includes('SLINGSHOT'));
  for(let i=0;i<120*4&&run.state==='playing'&&!run.player.node;i++){run.update(step);context.test.render(step);}
  assert.equal(run.player.node?.id,shortcut);assert.equal(run.charge(),0);
  run.die('RUN COMPLETE');run.player.deadTime=.8;context.test.render(.1);
  assert.equal(element('end-constellations').textContent,'1 / 4 constellations traced');
  context.test.handleInput();assert.equal(context.test.world.constellationsCompleted,0);assert.equal(context.test.world.darknessGrace,0);
  assert(context.test.world.constellations.every(c=>c.mask===0&&!c.completed&&!c.expired),'Restart must clear chart progress');
  assert(element('hint').textContent.startsWith('Tap when'),'Restart must clear slingshot instructions');
  const fresh=context.test.world;
  fresh.hazards=[{x:-fresh.width/2+4,y:fresh.cameraY+4,r:28,seed:23,phase:.3,near:false},{x:fresh.width/2-4,y:fresh.cameraY+fresh.height-4,r:30,seed:24,phase:.6,near:false}];
  const beforeCopies=lensCopies;context.test.render(step);assert.equal(lensCopies-beforeCopies,2,'Partly clipped black holes must still lens the background');
  events['window:blur']();const frozenTime=fresh.time;fresh.update(2);context.test.render(step);assert.equal(fresh.time,frozenTime);
  return {width,height,storageBlocked,reduceMotion,lensCopies};
}
const layouts=[runtime(390,844),runtime(430,932,true,true),runtime(1440,900),runtime(844,390),runtime(320,568)];

// Two pilots traverse the same course. Slow, sharp captures retain little of
// the stars' acceleration; deliberate charging and tangent entries outrun the
// fully developed pursuit. No artificial flight timer or automatic speed gain.
function pressureRun(useStars){
  const w=new OrbitWorld(1);w.start();
  for(let i=0;i<120*400&&w.state==='playing'&&w.progress<220;i++){
    const n=w.player.node;
    if(n){
      const target=w.nodes.find(q=>q.row===Math.floor(w.progress)+1&&q.type!=='gold'),aim=w.aim();
      const end=w.flightPreview?.points.at(-1);
      const centered=aim&&end&&!aim.perfect&&Math.abs((aim.cx-end.x)*aim.dy-(aim.cy-end.y)*aim.dx)<aim.n.r*.15;
      if(aim&&aim.n===target&&(useStars?aim.perfect||w.player.orbitSweep>Math.PI*3:centered)&&w.player.orbitTime>.12&&(!useStars||n.type!=='sling'||w.charge()===1))w.release();
    }
    w.update(step);
    if(!w.player.node)assert(Math.hypot(w.player.vx,w.player.vy)<=MAX_SPEED+1e-7);
  }
  return w;
}
const slowRun=pressureRun(false),fastRun=pressureRun(true);
assert.equal(slowRun.state,'dead');assert.equal(slowRun.reason,'THE DARK CAUGHT UP');assert(slowRun.elapsed>120&&slowRun.elapsed<300,'The pursuit must eventually catch consistently slow progress');
assert.equal(fastRun.state,'playing');assert(fastRun.progress>=220&&fastRun.elapsed>slowRun.elapsed);assert.equal(fastRun.darknessSpeed(),150,'A player using speed and smooth transfers can outlast the full pursuit');
assert.equal((html.match(/<\/script>/g)||[]).length,1);
assert(!/\b(fetch\(|XMLHttpRequest|WebSocket|https?:\/\/)/.test(script),'Game must not require the network');
console.log(JSON.stringify({simulation:'passed',routeSeeds:60,detourSeeds:60,slingSeeds:60,boostedTransfers,longFlightSeconds,openingIdleSeconds:idle.elapsed,driftCaptures,gravity:{curvedCaptures,maxPreviewSteps,slowFlybyDegrees:slowClose.turn*180/Math.PI,fastFlybyDegrees:fastClose.turn*180/Math.PI},pressure:{slowCaughtAt:slowRun.elapsed,fastSurvivedTo:fastRun.elapsed,fastProgress:fastRun.progress},chartCompletions,transfers:totalCaptures,perfectTransfers:perfects,maxResidentNodes:maxNodes,maxResidentHazards:maxHazards,runtimeLayouts:layouts,checks:['rim tangency in both directions at three speeds','moving-planet tangent prediction and momentum','symmetric gravity with retained speed','curved guide matches real captures','black-hole warnings match collisions','bounded prediction and clipped lens sampling','center captures do not earn perfects','persistent speed and star acceleration','speed-based rewards and bounded launches','slow progress eventually loses; charged runs survive','swept collision','automatic capture','both routes through 48 rows','charged shortcut routes','one-lap charge, cap and reset','boosted preview matches momentum','long flights have no expiry','per-orbit skip rewards including gold endpoints','distant hazards and chart boundary','resizing mid-run','bounded generation','constellation reward and expiry','duplicate capture protection','reprieve and pause','earlier rising darkness','fading orbit','hazard death','full-script boot and drawing arguments','slingshot UI and hints','blocked localStorage','one-tap restart','focus pause','no network dependencies']},null,2));
