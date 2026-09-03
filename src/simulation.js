'use strict';
/* Orbit · src/simulation.js
   OrbitWorld: seeded generation, geometry, fixed-step flight, swept collisions, scoring, difficulty.
   This file is what scripts/verify.mjs runs in isolation, so it must not reference the DOM. */
// BEGIN SIMULATION
const TAU = Math.PI * 2;
const BASE_SPEED = 150, MAX_SPEED = 360, STAR_GAIN = 90;
const FLIGHT_STEP = 1/120;
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
function gravityRadius(h) { return h.r+100; }
function bendVelocity(p,hazards,dt) {
  let ax=0,ay=0;
  for(const h of hazards){
    const dx=h.x-p.x,dy=h.y-p.y,d2=dx*dx+dy*dy,reach=gravityRadius(h);
    if(d2>=reach*reach||d2<1e-10)continue;
    const d=Math.sqrt(d2),edge=1-d/reach;
    const pull=1800*h.r*h.r/(d2+h.r*h.r*.36)*edge*edge;
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
    const t=segmentCircle(x,y,bx,by,h.x,h.y,h.r+3);
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
function arrivalAim(n,contact,distance,vx,vy) {
  const speed=Math.hypot(vx,vy);
  return {n,distance,perfect:contact.perfect,entryAngle:Math.atan2(contact.ry,contact.rx),entryDir:contact.rx*contact.rvy-contact.ry*contact.rvx>=0?1:-1,cx:contact.cx,cy:contact.cy,radius:contact.distance,dx:vx/speed,dy:vy/speed};
}

class OrbitWorld {
  constructor(seed, width = 440, height = 860, emit = () => {}) {
    this.random = seeded(seed); this.seed = seed; this.emit = emit;
    this.width = width; this.height = height; this.time = 0; this.elapsed = 0;
    this.state = 'ready'; this.cameraY = -height * .62; this.floorY = height * .30 - 16;
    this.nodes = []; this.hazards = []; this.row = 0; this.serial = 0;
    this.constellations=[];this.constellationsCompleted=0;this.darknessGrace=0;
    this.score = 0; this.captures = 0; this.perfects = 0; this.combo = 1; this.maxCombo = 1; this.progress = 0;
    this.topY = 0; this.lastCaptureAt = 0; this.shake = 0; this.darknessMult = 1;
    const n = this.makeNode(-45, 0, 57, 0, 'still'); n.visited = true;
    this.lastMain = n;
    this.player = {x:0,y:0,vx:0,vy:0,angle:-.45,dir:-1,speed:BASE_SPEED,rad:n.r,node:n,orbitTime:0,orbitSweep:0,chargeAnnounced:false,tangentCapture:true,flightTime:0,ignore:-1,launch:null,deadTime:0,shielded:false};
    this.positionPlayer(); this.ensureAhead();
  }
  makeNode(x, y, r, row, type) {
    const n = {id:this.serial++,x,y,baseX:x,baseY:y,r,cap:r+11,row,type,phase:this.random()*TAU,seed:Math.floor(this.random()*1e8),visited:false,flash:0,vx:0,vy:0,amp:type==='drift'?12+this.random()*10:0};
    this.nodes.push(n); return n;
  }
  generateRow() {
    const k = ++this.row, prev = this.lastMain, rng = this.random;
    const region=Math.floor(k/8),local=k%8,fork=region<4&&local>=3&&local<=7;
    const side=((this.seed>>region)&1)?1:-1;
    const spread = Math.min(149, this.width * .29);
    let x = k === 1 ? 77 : k === 2 ? -75 : (rng()-.5)*spread*2;
    if (k > 2 && Math.abs(x - prev.baseX) < 58) x = clamp(x + (x < 0 ? 72 : -72), -spread, spread);
    let y = prev.baseY - (k <= 2 ? 207 : 193 + Math.min(48, k * 1.5) + rng()*28);
    let radius = k < 3 ? 54 : 54 - Math.min(13,k*.39) + rng()*7;
    if(fork){x=local===3||local===7?0:-side*[0,0,0,0,100,82,106][local];radius=local===3||local===7?55:55-region*2;}
    const type = k===2||k>=7&&k%8===7?'sling':k >= 14 && k%7===0 ? 'fading' : k>=8 && k%4===0 ? 'drift' : 'still';
    if(type==='sling'){if(k>=7)x=0;radius=57;}
    const slingOrigin=this.nodes.find(q=>q.shortcut&&k>q.row&&k<=q.row+2);
    if(slingOrigin){const first=k===slingOrigin.row+1;x=first?-slingOrigin.shortcut.x*1.2:slingOrigin.shortcut.x;y=first?slingOrigin.y-224:slingOrigin.shortcut.y;}
    const n = this.makeNode(x,y,radius,k,type);
    if(type==='sling'&&k>=7)n.shortcut={x:-side*98,y:y-500,r:54};
    if(slingOrigin&&k===slingOrigin.row+2)slingOrigin.shortcutId=n.id;
    n.cap = n.r + Math.max(6, 12-k*.13);
    this.lastMain = n;
    if(fork){
      n.routeId=region;n.routeRole=local===3?'entry':local===7?'exit':'main';
      if(local===3){
        this.constellations.push({id:region,name:['THE NEEDLE','THE SAIL','THE LYRE','THE CROWN'][region],entry:n,main:[],stars:[],exit:null,mask:0,completed:false,expired:false,flash:0,bonus:60});
      }else{
        const chart=this.constellations.find(c=>c.id===region);
        if(local===7)chart.exit=n;
        else{
          chart.main.push(n);
          const i=local-4,shapes=[[112,151,105],[143,91,144],[100,152,117],[139,92,143]];
          const star=this.makeNode(side*shapes[region][i],y+[24,42,18][i],35-region,k,'gold');
          star.cap=star.r+9;star.routeId=region;star.routeRole='star';star.starIndex=i;chart.stars.push(star);
        }
      }
    }
    // Small gold satellites offer a harder detour. The main path remains available.
    if (!fork && k >= 4 && k%4 === 0) {
      const side = (prev.x+n.x)>0 ? -1 : 1;
      const ex = side * Math.min(174,this.width*.39), ey = (prev.y+n.y)/2;
      if ([prev,n].every(q=>Math.hypot(ex-q.x,ey-q.y)>q.r+82)) this.makeNode(ex,ey,32,k-.5,'gold');
    }
    // A rare shield star: one carried charge absorbs the next black-hole contact.
    if (!fork && k >= 10 && k%10 === 0) {
      const side = (prev.x+n.x)>0 ? -1 : 1;
      const ex = side * Math.min(150,this.width*.34), ey = (prev.y+n.y)/2-40;
      if (this.nodes.every(q=>Math.hypot(ex-q.x,ey-q.y)>q.r+q.amp+70)) this.makeNode(ex,ey,28,k-.5,'shield');
    }
    // Keep both possible tangent routes to each main node clear, including drift envelopes.
    if (!fork && k >= 6 && k%3 !== 1) {
      const r = 18+rng()*11+Math.min(8,k*.14);
      for (let tries=0;tries<12;tries++) {
        const hx=(rng()-.5)*Math.min(this.width-72,380), hy=(prev.y+n.y)/2+(rng()-.5)*55;
        if (this.nodes.some(q=>Math.hypot(hx-q.baseX,hy-q.baseY)<q.r+q.amp+r+30)) continue;
        const paths=tangentPaths(prev,n);
        if (paths.some(p=>pointSegment(hx,hy,p.x,p.y,n.x,n.y)<r+prev.amp+n.amp+25)) continue;
        const smooth=[...orbitTangents(prev,n,1),...orbitTangents(prev,n,-1)];
        if(smooth.some(p=>pointSegment(hx,hy,p.x,p.y,p.bx,p.by)<r+prev.amp+n.amp+25))continue;
        if(slingOrigin&&tangentPaths(slingOrigin,slingOrigin.shortcut).some(p=>pointSegment(hx,hy,p.x,p.y,slingOrigin.shortcut.x,slingOrigin.shortcut.y)<r+25))continue;
        if(slingOrigin&&[...orbitTangents(slingOrigin,slingOrigin.shortcut,1),...orbitTangents(slingOrigin,slingOrigin.shortcut,-1)].some(p=>pointSegment(hx,hy,p.x,p.y,p.bx,p.by)<r+25))continue;
        this.hazards.push({x:hx,y:hy,r,seed:Math.floor(rng()*1e8),phase:rng()*TAU,near:false}); break;
      }
    }
  }
  ensureAhead() { while (this.lastMain.y > this.cameraY-350) this.generateRow(); }
  positionPlayer() {
    const p=this.player,n=p.node; if (!n) return;
    p.x=n.x+Math.cos(p.angle)*p.rad; p.y=n.y+Math.sin(p.angle)*p.rad;
    p.vx=-Math.sin(p.angle)*p.speed*p.dir+n.vx; p.vy=Math.cos(p.angle)*p.speed*p.dir+n.vy;
  }
  start() { if(this.state!=='ready')return; this.state='playing'; this.emit('start',{}); }
  charge() { const p=this.player;return p.node&&p.node.type==='sling'?clamp(p.orbitSweep/TAU,0,1):0; }
  speedMultiplier(speed=this.player.node?this.player.speed:Math.hypot(this.player.vx,this.player.vy)) { return clamp(speed/BASE_SPEED,1,MAX_SPEED/BASE_SPEED); }
  darknessSpeed() { return (22+Math.min(128,Math.max(0,this.elapsed-1.5)*.55))*this.darknessMult; }
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
    p.dir=cross>=0?1:-1; p.angle=Math.atan2(ry,rx); p.rad=radius||n.r;p.tangentCapture=perfect;
    // Smooth entries preserve momentum. A hard turn sheds some excess speed.
    p.speed=perfect?arrivalSpeed:clamp(BASE_SPEED+(arrivalSpeed-BASE_SPEED)*(.72+.28*alignment),BASE_SPEED,MAX_SPEED);
    p.node=n; p.orbitTime=0;p.orbitSweep=0;p.chargeAnnounced=false; n.visited=true; n.flash=1;
    this.positionPlayer();
    const skipped=l?Math.max(0,Math.ceil(n.row)-Math.floor(l.row)-1):0,skipBonus=Math.round(skipped*10*scoreMultiplier);
    const skip=skipped>0,quick=l&&l.sweep<TAU*1.25;
    this.combo=quick?Math.min(5,this.combo+1):1; this.maxCombo=Math.max(this.maxCombo,this.combo);
    const baseGain=10+(this.combo-1)*2+(perfect?5:0)+(n.type==='gold'?15:0),gain=Math.round(baseGain*scoreMultiplier)+skipBonus;
    this.score+=gain; this.captures++; this.perfects+=perfect?1:0;
    this.progress=Math.max(this.progress,n.row); this.lastCaptureAt=this.elapsed;
    this.shake=perfect?1.8:1.0;
    this.emit('capture',{x:p.x,y:p.y,n,gain,perfect,skip,skipped,skipBonus,scoreMultiplier,combo:this.combo});
    if(n.type==='shield'&&!p.shielded){p.shielded=true;this.emit('shield',{x:n.x,y:n.y});}
    if(n.routeRole==='star'){
      const chart=this.constellations.find(c=>c.id===n.routeId);
      if(chart&&!chart.completed&&!chart.expired){
        chart.mask|=1<<n.starIndex;
        if(chart.mask===7){
          chart.completed=true;chart.flash=2.4;this.constellationsCompleted++;
          this.score+=chart.bonus;this.darknessGrace=4;
          this.emit('constellation',{chart,x:n.x,y:n.y,gain:chart.bonus});
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
    if(!p.shielded){this.die('CAUGHT BY A BLACK HOLE');return;}
    p.shielded=false;
    const dx=p.x-h.x,dy=p.y-h.y,d=Math.hypot(dx,dy)||1,nx=dx/d,ny=dy/d,dot=p.vx*nx+p.vy*ny;
    p.vx-=2*dot*nx;p.vy-=2*dot*ny;
    const clear=h.r+8;if(d<clear){p.x=h.x+nx*clear;p.y=h.y+ny*clear;}
    this.shake=3;this.emit('shieldBreak',{x:p.x,y:p.y});
  }
  resize(width,height) {
    const oldHeight=this.height;this.width=width;this.height=height;
    this.cameraY-=(height-oldHeight)*.62;
    if(this.state==='ready')this.floorY=height*.30-16;
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
    this.elapsed+=dt;
    const oldX=p.x,oldY=p.y,wasOrbiting=!!p.node;
    if(p.node){
      p.orbitTime+=dt;
      if(!p.tangentCapture)p.rad=lerp(p.rad,p.node.r,1-Math.exp(-dt*10));
      const turn=p.speed/p.rad*dt,chargeStep=Math.min(turn,Math.max(0,TAU-p.orbitSweep));p.angle+=p.dir*turn;
      p.orbitSweep+=turn;
      if(p.node.type==='sling'){
        if(p.speed<MAX_SPEED)p.speed=Math.min(MAX_SPEED,p.speed+STAR_GAIN*chargeStep/TAU);
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
        if(result.hit?.kind==='hole')this.hazardHit(result.hit.h);
        else if(result.hit?.kind==='edge')this.die('LEFT THE STAR CHART');
        else if(result.hit?.kind==='node')this.capture(result.hit.n,result.hit.contact);
        if(this.state==='playing'&&!p.node)for(const h of this.hazards){
          if(!h.near&&pointSegment(h.x,h.y,ax,ay,p.x,p.y)<h.r+17){h.near=true;this.score+=5;this.emit('near',{x:p.x,y:p.y});}
        }
      }
    }
    if(wasOrbiting)for(const h of this.hazards){
      const d=pointSegment(h.x,h.y,oldX,oldY,p.x,p.y);
      if(d<h.r+3)this.hazardHit(h);
    }
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
    const until=best?best.distance:reach;
    const gravity=this.hazards.some(h=>segmentCircle(p.x,p.y,p.x+dx*until,p.y+dy*until,h.x,h.y,gravityRadius(h))!==null);
    if(gravity)return this.curvedAim(launch,reach/speed+4);
    if(best&&this.hazards.some(h=>{const t=segmentCircle(p.x,p.y,bx,by,h.x,h.y,h.r+3);return t!==null&&t<=hitAt;}))return null;
    const length=best?best.distance:p.node.type==='sling'?speed*1.9:83;
    this.flightPreview={points:[{x:p.x,y:p.y,time:0,distance:0},{x:p.x+dx*length,y:p.y+dy*length,time:length/speed,distance:length}],aim:best,curved:false,blocked:false,steps:0};
    return best;
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
    preview.curved=bend>.001;this.flightPreview=preview;return preview.aim;
  }
}
// END SIMULATION
