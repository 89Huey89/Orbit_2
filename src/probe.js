'use strict';
/* Orbit · src/probe.js
   Era VIII, The Probe: the far future — a self-replicating interstellar probe, after Freitas's REPRO (1980),
   the NASA lunar-factory study (1980), Project Daedalus (1973–78) and Breakthrough Starshot (2016–). */
// Like every other century beside the atlas, this era is a hand and not a fork: painters registered by name
// in `defineHand` below and reached wherever frame.js would otherwise draw the atlas's own, with everything
// it does not name still the atlas's. docs/archive/eras/08-probe.md is what the era is. None of the physics
// comes with it; the simulation is and stays OrbitWorld.
//
// What the sheet argues, in one line: this is the last rung, and nobody is left at the other end. Every era
// before it drew the sky for someone; this one keeps a log for itself. So nothing here is a picture of the sky
// as seen — the probe has no eye — and everything on the sheet is either a measurement or an inheritance. Two
// grammars share it and never merge: the self-log, instrument white on interstellar black, every figure ticking
// in whole like an odometer and never set by a stroke; and the plaque, the one gilt line bolted to the hull, cut
// once in the Flyby's century and copied unread into every daughter. One ticks and updates; the other has not
// changed since it was cut, and a player should be able to tell them apart without a caption.
//
// A body is a sensed mass before it is anything else. Held, it is read the way a machine catalogues a world:
// a spectral guess with wide error bars, then mass and density locking and a wireframe closing round it, then a
// periapsis and apoapsis struck on the ring, and last the class tag printed whole and the counter going still —
// a machine's silence standing in for the flourish it cannot make. Every body is read the identical class-first
// way; there is no privileged Moon here, because there is no naked eye left aboard to see one differently.
//
// What it reads, it harvests. A catalogued body pays its material into the manifest — volatiles, silicates,
// metals or fusion fuel, read off its class and never chosen — and the manifest is the schematic of the next
// daughter, drawn part by part as the bill is met. When it is, a second craft peels off the traveller's line on
// an escape burn, the plaque copied onto it in miniature, and GEN rises by one; the first bill met is closure.
// The manifest is presentation only, read off the same captures the simulation already counts: the score, the
// darkness and the run are the atlas's own, untouched.
//
// It is told as a story, as the Lens and the Flyby are: six mission phases of six rows, from the departure out
// of the Solar System to the first daughter's escape burn, and each opens with the log's own drawing of it
// behind the play. Its Chronicle ends at closure, on the era file's signature sheet; read Endless, it does
// not end at all, which is the truest reading of the last rung. Its record is its own (orbit.probe.v1).

// ---------- The material: interstellar black, and the one warm light aboard ----------
// Hexes from 08-probe.md, "Palette": a ground nearer true black than the Lens's sensor or the Flyby's vacuum,
// instrument white for the self-log (the brief's own "no CRT-green cliché" call; green is kept for the one
// status that means the memory still reads back clean), telemetry amber for warnings, radiator glow for the
// probe's only warm light, sail film, and the engraved gold that belongs to the inherited plaque and nothing else.
definePlate('probe',(()=>{const P={
  vac:'5,5,5',vacHi:'14,14,15',white:'232,236,242',grey:'148,152,160',dim:'80,84,92',faint:'30,31,34',
  gold:'199,162,76',goldHi:'236,208,134',goldDk:'92,70,28',rad:'184,69,31',radHi:'255,140,72',
  green:'51,255,102',amber:'255,176,0',sail:'217,228,234',core:'255,247,220'};
  return{night:P,paper:P};})());

// ---------- The story: six mission phases, one self-log ----------
// There is no calendar left to date a phase by, so each carries an elapsed-time tally from departure instead.
// The tallies follow the attested designs where there is one — Daedalus's fifty-year cruise to Barnard's Star
// and Freitas's five centuries for SEED to grow a FACTORY — and are the game's own fiction past that.
const PRB_CHAPTER_ROWS=6;
const PRB_CHAPTERS=[
  {phase:'DEPARTURE',place:'SOL',t:'T+0000.0 Y',reading:'THE PLAQUE IS BOLTED ON, UNREAD'},
  {phase:'CRUISE',place:'THE INTERSTELLAR MEDIUM',t:'T+0012.4 Y',reading:'SAIL DEPLOYED · 0.12 C'},
  {phase:'ARRIVAL',place:'BARNARD’S STAR',t:'T+0049.6 Y',reading:'ORBIT INSERTION · 5.96 LY'},
  {phase:'SEED',place:'BARNARD’S STAR B',t:'T+0051.0 Y',reading:'THE SEED IS DROPPED'},
  {phase:'FACTORY',place:'BARNARD’S STAR B',t:'T+0548.7 Y',reading:'CLOSURE: IT CAN BUILD EVERY PART OF ITSELF'},
  {phase:'REPLICATION',place:'BARNARD’S STAR',t:'T+0612.3 Y',reading:'GEN 2 · ESCAPE BURN'}
];
const PRB_GOAL_ROW=PRB_CHAPTERS.length*PRB_CHAPTER_ROWS;
const prbChapterOf=w=>clamp(Math.floor((w?w.progress:0)/PRB_CHAPTER_ROWS),0,PRB_CHAPTERS.length-1);
const PRB_ROMAN=['I','II','III','IV','V','VI'];
// Where a reading's four stages fall on the observation clock. Early, as on the Flyby: a flown run leaves most
// bodies part-way through their sweep, so the spectral guess is in within a tenth of it and the class tag
// printed by four fifths; only the counter going still asks for the whole observation.
const PRB_STAGE={spec:[0,.1],mass:[.1,.3],apse:[.3,.55],seal:[.55,.8]};
const prbSpan=(t,r)=>clamp((t-r[0])/(r[1]-r[0]),0,1);
const prbEase=t=>t*t*(3-2*t);
const PRB_UNIT=12;

// The seven classes, in the probe's own mnemonics (08-probe.md, "Names"), and the material each pays: volatiles
// for water- and ice-rich bodies, silicates for rock and dune, metals for a volcanic world's exposed core, and
// fusion fuel for a storm giant's helium-3, as Daedalus's aerostats would have mined it.
const PRB_FAMILIES=['ocean','crater','ringed','ice','dune','volcanic','storm'];
const PRB_CLASS={ocean:'CLASS-H2O',crater:'CLASS-REG',ringed:'CLASS-RNG',ice:'CLASS-CRYO',dune:'CLASS-AEOL',volcanic:'CLASS-IGN',storm:'CLASS-ATM',moon:'CLASS-REG'};
const PRB_MATS=['VOL','SIL','MET','FUEL'];
const PRB_MAT_NAME={VOL:'VOLATILES',SIL:'SILICATES',MET:'METALS',FUEL:'FUSION FUEL'};
const PRB_MAT_OF={ocean:'VOL',ice:'VOL',ringed:'VOL',crater:'SIL',dune:'SIL',moon:'SIL',volcanic:'MET',storm:'FUEL'};
// What a class pays beyond its main material, after the same ISRU consensus: regolith and dune sand carry iron
// and titanium as well as silicon, a volcanic world's flows are silicate over its metal, an ice giant's ices and a
// storm giant's air both hold hydrogen. Smaller shares, so the build stays honestly uneven, but a chart that deals
// no volcanic world for a long stretch still pays a little metal and never stalls a bill outright.
const PRB_SIDE_OF={crater:['MET',.5],dune:['MET',.3],moon:['MET',.5],volcanic:['SIL',.3],ice:['FUEL',.3],storm:['VOL',.3]};
// Units a fully read body pays into its main material. Measured on the oracle pilot, which releases fast and
// reads a body to about a sixth of its orbit: two units a body lets it reach closure in the middle phases, and a
// steadier hand, holding each body longer, a generation or two past it by the end of the Chronicle.
const PRB_YIELD=2;
// The four pickups arrive as finished parts rather than raw stock: a shield plate, a sail segment, a memory
// scrub, an isotope cache; a gravity assist is a salvaged drive core. Each pays one unit of what it is made of.
const PRB_PART_OF={shield:'MET',reflector:'SIL',dawn:'VOL',inkwell:'FUEL',sling:'FUEL'};
// The bill for a daughter, in whole units of each material. Provisional, as the era file says it must be:
// sized so a steady run meets closure somewhere in its middle phases, weighted toward the materials the chart
// deals most of, and multiplied by the generation, because every bill after closure is larger than the last.
const PRB_BILL={VOL:2,SIL:1,MET:1,FUEL:1};
const prbBill=gen=>{const b={};for(const m of PRB_MATS)b[m]=PRB_BILL[m]*gen;return b;};
// The factory refines what it mines, badly: a surplus of one material covers a shortfall in another at two units
// for one. Never a choice, and never cheap enough to make the four materials one, but it keeps a chart that deals
// one class for a long stretch from holding a bill open forever.
const PRB_REFINE=2;
function prbShort(got,bill){let short=0,spare=0;for(const m of PRB_MATS){short+=Math.max(0,bill[m]-got[m]);spare+=Math.max(0,got[m]-bill[m]);}return{short,spare};}
function prbPay(got,bill){
  const {short,spare}=prbShort(got,bill);if(spare/PRB_REFINE+1e-9<short)return false;
  let owe=short*PRB_REFINE;for(const m of PRB_MATS){const take=Math.min(Math.max(0,got[m]-bill[m]),owe);got[m]-=take;owe-=take;}
  for(const m of PRB_MATS)got[m]=got[m]>=bill[m]?got[m]-bill[m]:0;return true;
}

// The twelve systems a daughter can be sent to, each a real star with the one fact its record carries.
const PRB_SYSTEMS=[
  ['BARNARD’S STAR','5.96 LY'],['ALPHA CENTAURI','4.37 LY'],['PROXIMA CENTAURI','4.24 LY'],['WOLF 359','7.86 LY'],
  ['LALANDE 21185','8.31 LY'],['SIRIUS','8.60 LY'],['EPSILON ERIDANI','10.5 LY'],['ROSS 128','11.0 LY'],
  ['61 CYGNI','11.4 LY'],['TAU CETI','11.9 LY'],['LUYTEN’S STAR','12.2 LY'],['TRAPPIST-1','40.7 LY']];

// ---------- Small tools ----------
// Every figure on this sheet is set in B612 Mono, the cockpit face Airbus drew for legibility under vibration
// and glare, uppercase and fixed-width, and comes up a whole glyph at a time behind a block cursor (`shown`
// glyphs so far). No numeral is ever written with a stroke here: a machine with no hand left has no other way.
function prbMono(g,str,x,y,size,rgb,alpha,align='left',shown=Infinity){
  if(alpha<=0||!str)return;g.save();g.font=plateFace(size,'mono');g.direction='ltr';g.textAlign='left';g.textBaseline='middle';
  const cw=g.measureText('M').width,n=str.length,x0=align==='center'?x-cw*n/2:align==='right'?x-cw*n:x,k=Math.min(n,Math.max(0,shown));
  g.fillStyle=`rgba(${rgb},${alpha})`;g.fillText(str.slice(0,k),x0,y);
  if(k<n&&shown!==Infinity){g.fillStyle=`rgba(${rgb},${(alpha*.85).toFixed(3)})`;g.fillRect(x0+k*cw,y-size*.42,cw*.8,size*.84);}
  g.restore();
}
function prbTextWidth(str,size){ctx.save();ctx.font=plateFace(size,'mono');const w=ctx.measureText('M').width*str.length;ctx.restore();return w;}
// A counter that turns like an odometer: each digit in its own window, the lowest rolling continuously toward
// the next and a higher one turning only while every digit beneath it is passing nine.
function prbOdometer(g,value,digits,x,y,size,rgb,alpha){
  g.save();g.font=plateFace(size,'mono');g.textAlign='center';g.textBaseline='middle';const cw=g.measureText('M').width*1.08,h=size*1.1,v=Math.max(0,value);
  let carry=v%1;
  for(let i=0;i<digits;i++){const p=Math.pow(10,i),d=Math.floor(v/p)%10,cx=x+(digits-1-i)*cw+cw/2,f=i===0?carry:(Math.floor(v/1)%p===p-1?carry:0);
    g.save();g.beginPath();g.rect(cx-cw/2+.5,y-h/2,cw-1,h);g.clip();g.fillStyle=`rgba(${rgb},${alpha})`;
    g.fillText(String(d),cx,y-f*h);if(f>0)g.fillText(String((d+1)%10),cx,y+h-f*h);g.restore();
    g.fillStyle=`rgba(${rgb},${(alpha*.14).toFixed(3)})`;g.fillRect(cx-cw/2+.5,y-h/2,cw-1,.6);g.fillRect(cx-cw/2+.5,y+h/2-.6,cw-1,.6);}
  g.restore();
}
// Figures still being read tick through values until they lock; the value they lock on is dealt from the body.
function prbTick(seed,i,len,locked){
  if(locked)return null;const t=reducedMotion?0:Math.floor(world.time*18);let s='';
  for(let k=0;k<len;k++)s+=String(Math.floor(tileHash(seed+t,i*7+k,211)*10));return s;
}

// ---------- The plaque: the one gilt line aboard ----------
// Not this era's document but the Flyby's: the plate Pioneer 10 carried out of the Solar System in 1972, one
// continuous engraved line of uniform weight, bolted to the hull here and copied unread into every daughter.
// It is drawn from a fixed table rather than dealt, since a copy that differed from its ancestor would no longer
// be the same plaque, and always as a burin cuts, the line lengthening along its own path (`k` 0–1). Reduced
// to what reads at a phone's size: the hydrogen hyperfine key, the pulsar map with its binary ticks and the long
// line to the galactic centre, and the Sun with its nine planets and the craft's own course out past Jupiter.
let prbPlaqueCache=null;
function prbCirclePath(cx,cy,r,n=18){const p=[];for(let i=0;i<=n;i++){const a=i/n*TAU;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return p;}
function prbPlaquePaths(){
  if(prbPlaqueCache)return prbPlaqueCache;const P=[];
  // the hyperfine key: two hydrogen atoms, spins up and down, and the unit length between them
  P.push(prbCirclePath(-1.36,-.52,.06,12),prbCirclePath(-1.1,-.52,.06,12),[[-1.36,-.62],[-1.36,-.42]],[[-1.1,-.42],[-1.1,-.62]],[[-1.3,-.52],[-1.16,-.52]],[[-1.23,-.38],[-1.23,-.3]]);
  // the pulsar map: fourteen lines from the Sun, each carrying its period in binary ticks, and the long line
  const ox=-.38,oy=.02,ang=[8,31,55,78,97,118,146,163,187,205,232,258,289,330],len=[.52,.84,.4,.66,.34,.74,.48,.88,.44,.58,.7,.38,.8,.55];
  ang.forEach((a,i)=>{const r=a*Math.PI/180,c=Math.cos(r),s=Math.sin(r),L=len[i]*.78;P.push([[ox,oy],[ox+c*L,oy+s*L]]);
    for(let k=0;k<5;k++){const u=L*(.62+k*.07),t=tileHash(i,k,221)<.5?.022:.045;P.push([[ox+c*u-s*t,oy+s*u+c*t],[ox+c*u+s*t,oy+s*u-c*t]]);}});
  P.push([[ox,oy],[ox+1.36,oy]]);
  // the Sun, nine planets, Saturn's ring, and the course out from the third past the fifth with the craft on it
  const py=.6,xs=[-1.1,-.9,-.74,-.58,-.36,-.06,.22,.46,.66],rs=[.014,.022,.024,.018,.064,.056,.036,.034,.012];
  P.push(prbCirclePath(-1.34,py,.07,16));xs.forEach((x,i)=>P.push(prbCirclePath(x,py,rs[i],rs[i]>.03?14:8)));P.push([[-.06-.1,py+.018],[-.06+.1,py-.018]]);
  const cr=[];for(let i=0;i<=16;i++){const t=i/16,a=1-t;cr.push([a*a*-.74+2*a*t*-.36+t*t*.98,a*a*(py-.03)+2*a*t*(py-.34)+t*t*(py-.2)]);}P.push(cr);
  P.push([[.98,py-.2],[1.08,py-.22],[1.0,py-.14]],[[.98,py-.2],[1.0,py-.14]]);
  let total=0;const lens=P.map(p=>{let L=0;for(let i=1;i<p.length;i++)L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);total+=L;return L;});
  return prbPlaqueCache={paths:P,lens,total};
}
// Stroke a set of polylines as far as `k` of their whole length, in order, as a single burin would cut them.
function prbCut(g,paths,lens,total,k,sx0,sy0,ox,oy){
  let left=k*total;g.beginPath();
  for(let j=0;j<paths.length&&left>0;j++){const p=paths[j];g.moveTo(ox+p[0][0]*sx0,oy+p[0][1]*sy0);
    for(let i=1;i<p.length&&left>0;i++){const L=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);const u=Math.min(1,left/(L||1));g.lineTo(ox+(p[i-1][0]+(p[i][0]-p[i-1][0])*u)*sx0,oy+(p[i-1][1]+(p[i][1]-p[i-1][1])*u)*sy0);left-=L;}}
  g.stroke();
}
// The plaque at any size: `s` is half its width. The plate itself is anodised aluminium, a faint gold; the
// line is the brighter gold, of one weight, exactly as cut.
function prbPlaque(g,x,y,s,k=1,alpha=1){
  const P=ink.probe,d=prbPlaqueCache||prbPlaquePaths(),w=s,h=s*.66,sc=s/1.5;
  g.save();g.globalAlpha*=alpha;g.fillStyle=`rgba(${P.gold},.12)`;g.fillRect(x-w,y-h,w*2,h*2);g.strokeStyle=`rgba(${P.gold},.45)`;g.lineWidth=Math.max(.4,s*.012);g.strokeRect(x-w,y-h,w*2,h*2);
  g.strokeStyle=`rgba(${P.goldHi},.95)`;g.lineWidth=Math.max(.45,s*.018);g.lineCap='round';g.lineJoin='round';prbCut(g,d.paths,d.lens,d.total,k,sc,sc,x,y);
  g.restore();
}

// ---------- The hull, as a schematic ----------
// The probe drawn in plan, pointing right, as the manifest draws it: a Whipple shield at the bow, the spine truss,
// three propellant tanks, the replication core amidships with the plaque bolted beside it, two radiator fins
// and the fusion drive's bell at the stern. Each part belongs to the material it is built from, so the manifest
// can draw the next daughter honestly unevenly — structure sketched while the metal is still logged as zero.
let prbHullCache=null;
function prbHullParts(){
  if(prbHullCache)return prbHullCache;
  const truss=[[[-.9,-.05],[1.06,-.05]],[[-.9,.05],[1.06,.05]]];for(let x=-.9;x<1.02;x+=.14)truss.push([[x,-.05],[x+.07,.05],[x+.14,-.05]]);
  const fins=[[[-.56,-.06],[-.46,-.44],[-.2,-.44],[-.26,-.06]],[[-.56,.06],[-.46,.44],[-.2,.44],[-.26,.06]]];for(const s of[-1,1])for(let i=1;i<4;i++){const u=i/4;fins.push([[-.56+u*.1,s*(.06+u*.38)],[-.26+u*.06,s*(.06+u*.38)]]);}
  const tanks=[prbCirclePath(.66,0,.15,16),prbCirclePath(.36,0,.15,16),prbCirclePath(.06,0,.15,16)];
  const shield=[[[1.1,-.36],[1.1,.36]],[[1.16,-.3],[1.16,.3]],[[1.06,0],[1.16,0]]];
  const bell=[[[-.9,-.07],[-1.2,-.26],[-1.2,.26],[-.9,.07]],[[-.9,-.07],[-.9,.07]],[[-1.05,-.165],[-1.05,.165]]];
  const fuel=[prbCirclePath(.66,0,.06,10),prbCirclePath(.36,0,.06,10),prbCirclePath(.06,0,.06,10),[[-.94,-.03],[-1.12,0],[-.94,.03]]];
  const parts=[{m:'SIL',paths:truss},{m:'SIL',paths:fins},{m:'VOL',paths:tanks},{m:'MET',paths:shield},{m:'MET',paths:bell},{m:'FUEL',paths:fuel}];
  for(const p of parts){p.total=0;p.lens=p.paths.map(q=>{let L=0;for(let i=1;i<q.length;i++)L+=Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]);p.total+=L;return L;});}
  return prbHullCache=parts;
}
// `fill` per material 0–1 is how much of each part is drawn; the replication core and its plaque are drawn only
// once the bill is met (`closed`), because they are the one thing a daughter cannot be built without.
function prbHull(g,x,y,s,fill,closed,alpha=1,col){
  const P=ink.probe,c=col||P.white;g.save();g.globalAlpha*=alpha;g.lineCap='round';g.lineJoin='round';
  // the outline to be filled, faint, so an empty manifest is a real bill waiting rather than a blank
  g.strokeStyle=`rgba(${c},.16)`;g.lineWidth=Math.max(.4,s*.012);for(const p of prbHullParts())prbCut(g,p.paths,p.lens,p.total,1,s,s,x,y);
  g.strokeStyle=`rgba(${c},.9)`;g.lineWidth=Math.max(.5,s*.018);for(const p of prbHullParts()){const f=clamp(fill[p.m]||0,0,1);if(f>0)prbCut(g,p.paths,p.lens,p.total,f,s,s,x,y);}
  if(closed>0){g.strokeStyle=`rgba(${c},${(.9*closed).toFixed(3)})`;g.beginPath();g.arc(x-.28*s,y,.12*s,0,TAU);g.stroke();g.fillStyle=`rgba(${P.core},${(.9*closed).toFixed(3)})`;g.beginPath();g.arc(x-.28*s,y,.04*s,0,TAU);g.fill();
    g.fillStyle=`rgba(${P.gold},${(.9*closed).toFixed(3)})`;g.fillRect(x-.2*s,y+.1*s,.16*s,.1*s);g.strokeStyle=`rgba(${P.goldHi},${closed.toFixed(3)})`;g.lineWidth=Math.max(.3,s*.008);g.strokeRect(x-.2*s,y+.1*s,.16*s,.1*s);}
  g.restore();
}

// ---------- The self-log, kept across runs ----------
// A small record under its own key, apart from the atlas's ledger: the furthest phase any run has reached, how
// often the Chronicle reached closure, the best mass processed, the highest generation ever launched, and — as
// the probe's own catalogue — which of the seven classes have been read and which of the twelve systems
// surveyed. Blocked or corrupt storage reads as empty.
const PRB_KEY='orbit.probe.v1';
function prbRead(){
  let raw=null;try{raw=JSON.parse(storage.get(PRB_KEY,'null'));}catch(_){raw=null;}
  const n=(v,max)=>clamp(Math.floor(Number(v)||0),0,max);
  return{v:1,furthest:n(raw&&raw.furthest,PRB_CHAPTERS.length-1),completed:n(raw&&raw.completed,1e6),best:n(raw&&raw.best,1e9),runs:n(raw&&raw.runs,1e9),maxGen:n(raw&&raw.maxGen,1e6),classes:n(raw&&raw.classes,127),systems:n(raw&&raw.systems,4095)};
}
function prbWrite(r){try{storage.set(PRB_KEY,JSON.stringify(r));}catch(_){}}
function prbNoteChapter(i){const r=prbRead();if(i>r.furthest){r.furthest=i;prbWrite(r);prbSprites.clear();}}
function prbNoteClass(family){const i=PRB_FAMILIES.indexOf(family);if(i<0)return;const r=prbRead();if(!(r.classes&(1<<i))){r.classes|=1<<i;prbWrite(r);}}
function prbNoteSystem(i){const r=prbRead(),b=1<<(((i|0)%12+12)%12);if(!(r.systems&b)){r.systems|=b;prbWrite(r);}}
function prbNoteGen(gen){const r=prbRead();if(gen>r.maxGen){r.maxGen=gen|0;prbWrite(r);prbSprites.clear();}}
function prbRecordRun(w){
  const r=prbRead();r.runs++;r.best=Math.max(r.best,w.score|0);if(w.won)r.completed++;
  r.furthest=Math.max(r.furthest,Math.min(PRB_CHAPTERS.length-1,Math.floor(w.progress/PRB_CHAPTER_ROWS)));
  if(prbRunWorld===w)r.maxGen=Math.max(r.maxGen,prbState.gen);prbWrite(r);prbSprites.clear();
}
const prbBest=()=>prbRead().best;
const prbBits=v=>{let c=0;while(v){c+=v&1;v>>>=1;}return c;};
const prbSprites=new Map();

// ---------- The harvest and the manifest, per run ----------
// Read every frame off the chart as it stands: a body pays its material by how far it has been observed —
// the fraction frozen on it at release, or the sweep so far while it is held — and never more than once for
// the same fraction, so a half-read ice world pays half the volatiles a whole reading would. A pickup pays one
// unit of the part it is. When every material meets the bill, a daughter launches and the bill starts again.
let prbRunWorld=null,prbState=null,prbNoted=new Set();
function prbFresh(){return{gen:1,got:{VOL:0,SIL:0,MET:0,FUEL:0},paid:new Map(),launches:[],closureAt:-1};}
function prbRun(){if(prbRunWorld!==world){prbRunWorld=world;prbState=prbFresh();prbNoted=new Set();prbFlourishAt.clear();prbDoneAt.clear();prbShown=0;}}
const prbFamily=n=>n.difficultyChoice?PRB_CHOICE[n.difficultyChoice].fam:planetFamilyFor(n.type,n.row,world.seed,n.difficultyChoice);
function prbHarvest(){
  prbRun();if(!world||world.state==='ready')return;const S=prbState,p=world.player;
  for(const n of world.nodes){if(n.difficultyChoice||!n.visited)continue;
    const part=PRB_PART_OF[n.type],read=p.node===n?clamp(p.orbitSweep/SWEEP_FULL,0,1):clamp(n.documented||0,0,1);let mat,f=read,k=PRB_YIELD,side=null;
    if(part){mat=part;f=1;k=1;}
    else if(n.routeRole==='star'||n.type==='gold'||n.type==='fading')mat=n.type==='gold'?'MET':'SIL';
    else{const fam=prbFamily(n);mat=PRB_MAT_OF[fam]||'SIL';side=PRB_SIDE_OF[fam]||null;}
    const had=S.paid.get(n.id)||0;if(f>had+1e-4){S.got[mat]+=(f-had)*k;if(side)S.got[side[0]]+=(f-had)*k*side[1];S.paid.set(n.id,f);}}
  if(S.paid.size>400){const keep=new Set(world.nodes.map(n=>n.id));for(const k of S.paid.keys())if(!keep.has(k)&&S.paid.size>200)S.paid.delete(k);}
  if(world.state==='playing'&&prbPay(S.got,prbBill(S.gen))){
    S.gen++;prbNoteGen(S.gen);
    S.launches.push({at:world.time,x:sx(p.x),y:sy(p.y),gen:S.gen});if(S.launches.length>4)S.launches.shift();
    if(S.gen===2)S.closureAt=world.time;prbLaunchSound(S.gen);}
}
function prbFill(){const S=prbState,b=prbBill(S.gen),o={};for(const m of PRB_MATS)o[m]=clamp(S.got[m]/b[m],0,1);return o;}
function prbLaunchSound(gen){try{if(!audio||!audio.enabled)return;audio.tone(220,.9,0,.1,'sine',880);audio.tone(880,.05,.9,.06,'square');if(gen===2)audio.tone(98,2.4,.4,.12,'sine');}catch(_){}}

// ---------- The ground: interstellar black, a static log, and the bitstream in the margins ----------
// Two star layers, each baked once as a tile and laid at its own fraction of the camera's rate; the stars are
// single points with no halo, since at these distances nothing is near enough to bloom. The farther tile also
// carries the self-log itself, a hex dump faint as a watermark, because on this sheet the ground is the record.
const PRB_TILE=900,PRB_DEPTHS=[.14,.5];
const prbLayers=[null,null];let prbLayerKey='';
function prbBakeLayer(k){
  const TH=PRB_TILE,pw=Math.max(1,Math.round(W*DPR)),ph=Math.round(TH*DPR),c=makeCanvas(pw,ph),g=c.getContext('2d');g.scale(DPR,DPR);const r=seeded(801+k*17),P=ink.probe;
  if(k===0){g.fillStyle=`rgb(${P.vac})`;g.fillRect(0,0,W,TH);
    // the log as a watermark: rows of bytes, eight to a word, in the self-log hand
    g.font=plateFace(7,'mono');g.textBaseline='top';g.fillStyle=`rgba(${P.white},.045)`;const cw=g.measureText('M').width||4.2;
    for(let y=6,row=0;y<TH-10;y+=11,row++){let s='';const words=Math.floor((W-24)/(cw*18));for(let w=0;w<words;w++){for(let b=0;b<8;b++)s+=(Math.floor(r()*256)).toString(16).toUpperCase().padStart(2,'0');s+='  ';}g.fillText(s,18,y);}}
  const count=[W*TH/1300,W*TH/9000][k];
  for(let i=0;i<Math.round(count);i++){const x=r()*W,y=r()*TH,m=Math.pow(r(),3),s=k?.8+m*1.4:.5+m*.7,a=k?.55+m*.45:.28+m*.4,warm=r();
    g.fillStyle=`rgba(${warm<.12?'255,214,180':warm<.35?'200,216,255':'236,238,244'},${a.toFixed(3)})`;g.fillRect(x-s/2,y-s/2,s,s);if(y<3)g.fillRect(x-s/2,y+TH-s/2,s,s);}
  return c;
}
function prbLayer(k){const key=W+'x'+DPR;if(prbLayerKey!==key){prbLayers[0]=prbLayers[1]=null;prbLayerKey=key;}if(!prbLayers[k])prbLayers[k]=prbBakeLayer(k);return prbLayers[k];}
// The margins are the log's own addressing: down the left a two-column bitstream scrolling with the climb and
// a block address every fifty units; down the right the checksum column, reading OK in green for as long as
// the memory reads back clean, and turning amber once the flux is close enough to flip bits in it.
const PRB_BAND=14;
function prbMargins(){
  const P=ink.probe,B=PRB_BAND,cam=world.cameraY,near=world.state==='playing'?clamp(1-(world.floorY-world.player.y)/260,0,1):0;
  ctx.save();
  for(const side of[-1,1]){const x0=side<0?0:W-B,inner=side<0?B:W-B;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x0,0,B,H);ctx.strokeStyle=`rgba(${P.dim},.5)`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(inner,0);ctx.lineTo(inner,H);ctx.stroke();}
  // the bitstream, one bit per unit of climb, two tracks
  const first=Math.floor((cam-40)/4),last=Math.ceil((cam+H/scale+40)/4);
  for(let k=first;k<=last;k++){const y=sy(k*4);if(y<-4||y>H+4)continue;for(let c=0;c<2;c++)if(tileHash(k,c,231)<.5){ctx.fillStyle=`rgba(${P.white},${c?.22:.34})`;ctx.fillRect(3+c*4.5,y,3,Math.max(1,3*scale*.8));}}
  for(let k=Math.floor((cam-60)/(PRB_UNIT*5));k<=Math.ceil((cam+H/scale+60)/(PRB_UNIT*5));k++){const y=sy(k*PRB_UNIT*5);if(y<-20||y>H+20)continue;
    ctx.strokeStyle=`rgba(${P.grey},.6)`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(B,y);ctx.lineTo(B+4,y);ctx.moveTo(W-B,y);ctx.lineTo(W-B-4,y);ctx.stroke();
    if(((k%2)+2)%2===0){ctx.save();ctx.translate(W-B*.5,y);ctx.rotate(Math.PI/2);const bad=near>.35&&tileHash(k,Math.floor(world.time*3),232)<near*.6;prbMono(ctx,bad?'CRC ERR':'CRC OK',0,0,5.5,bad?P.amber:P.green,bad?.9:.55,'center');ctx.restore();
      ctx.save();ctx.translate(B*.5+1,y-30);ctx.rotate(-Math.PI/2);prbMono(ctx,'BLK '+((Math.abs(k)*2749)&0xffff).toString(16).toUpperCase().padStart(4,'0'),0,0,5.5,P.dim,.95,'center');ctx.restore();}}
  ctx.restore();
}
// A single-event upset: now and then a bit in the log flips, shown as one amber cell lit and gone. The flux is
// made of exactly these, so the ground carries a few long before the boundary does. Reduced motion shows none.
function prbUpsets(){
  if(reducedMotion)return;const t=world.time,b0=Math.floor(t*1.5),P=ink.probe;
  for(let b=b0-1;b<=b0;b++){if(tileHash(b,0,241)>.55)continue;const born=b/1.5+tileHash(b,1,242)*.66,age=t-born;if(age<0||age>.45)continue;
    const x=PRB_BAND+6+tileHash(b,2,243)*(W-PRB_BAND*2-12),y=tileHash(b,3,244)*H,a=(1-age/.45)*.8;ctx.fillStyle=`rgba(${P.amber},${a.toFixed(3)})`;ctx.fillRect(Math.round(x),Math.round(y),4,5);
    prbMono(ctx,'SEU',x+7,y+2.5,5.5,P.amber,a*.8);}
}
function prbAtmosphere(){
  prbHarvest();
  plateShift.x=0;plateShift.y=0;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  for(let k=0;k<2;k++){const th=PRB_TILE,phase=(((-world.cameraY*scale*PRB_DEPTHS[k])%th)+th)%th,tile=prbLayer(k);for(let y=phase-th;y<H+th;y+=th)ctx.drawImage(tile,0,Math.round(y*DPR));}
  ctx.restore();
  prbMargins();prbUpsets();prbTitleMark();
}

// ---------- The six drawings: what each phase is logged as ----------
// One function draws each phase's drawing, at any size, so the frontispiece, a phase opening, the finale and the
// Journey's milestones are the same drawing at different stages. `stage` is 1 to 6; `k` 0–1 is how far it has
// come in. Each carries its own black field and a typed header, and a checksum on its lower edge once whole.
function prbFrame(g,R,stage,k=1,opts={}){
  const P=ink.probe,e=clamp(k,0,1),w=R*3.4,h=R*2.4,C=PRB_CHAPTERS[stage-1],hs=Math.max(5.5,R*.1);
  g.save();g.fillStyle=`rgba(${P.vac},${opts.clear?0:.96})`;g.fillRect(-w/2,-h/2,w,h);g.strokeStyle=`rgba(${P.grey},.5)`;g.lineWidth=Math.max(.5,R*.012);g.strokeRect(-w/2,-h/2,w,h);
  g.beginPath();g.rect(-w/2,-h/2,w,h);g.clip();
  // a few stars, single points, in every drawing but the plaque's own
  if(stage!==1)for(let i=0;i<14;i++){g.fillStyle=`rgba(${P.white},${(.25+tileHash(i,stage,251)*.5).toFixed(3)})`;g.fillRect(-w/2+tileHash(i,1,252)*w,-h/2+tileHash(i,2,252)*h,1,1);}
  const ix=-w/2+R*.12,iy=-h/2+R*.3,iw=w-R*.24,ih=h-R*.46,cy=iy+ih/2;
  g.lineCap='round';g.lineJoin='round';
  if(stage===1){
    // Departure: the plaque itself, cut as it was cut, the one gilt thing in the log
    prbPlaque(g,0,cy+R*.02,Math.min(iw*.46,ih*.72),e);
    if(!opts.bare)prbMono(g,'INHERITED · NOT EDITED',0,h/2-R*.1,hs*.9,P.gold,.85*clamp(e*3-2,0,1),'center');
  }else if(stage===2){
    // Cruise: the sail unfolding from the hull, a bright point at its centre, pushed from behind by the beam
    const u=prbEase(clamp(e/.7,0,1)),s=Math.min(iw,ih)*.46*(.12+.88*u),c0=cy-R*.04;
    g.strokeStyle=`rgba(${P.sail},.18)`;g.lineWidth=Math.max(.5,R*.01);g.beginPath();for(let i=-3;i<=3;i++){g.moveTo(i*R*.07,h/2);g.lineTo(i*R*.012,c0+s*.2);}g.stroke();
    g.save();g.translate(0,c0);g.rotate(Math.PI/4*(1-u));
    const sg=g.createLinearGradient(-s,-s,s,s);sg.addColorStop(0,`rgba(${P.sail},.5)`);sg.addColorStop(.5,`rgba(${P.sail},.16)`);sg.addColorStop(1,`rgba(${P.sail},.42)`);
    g.fillStyle=sg;g.beginPath();g.moveTo(0,-s);g.lineTo(s,0);g.lineTo(0,s);g.lineTo(-s,0);g.closePath();g.fill();g.strokeStyle=`rgba(${P.sail},.85)`;g.lineWidth=Math.max(.5,R*.014);g.stroke();
    g.strokeStyle=`rgba(${P.sail},.35)`;g.lineWidth=Math.max(.4,R*.008);g.beginPath();g.moveTo(-s,0);g.lineTo(s,0);g.moveTo(0,-s);g.lineTo(0,s);g.stroke();g.restore();
    const hg=g.createRadialGradient(0,c0,0,0,c0,R*.12);hg.addColorStop(0,`rgba(${P.core},1)`);hg.addColorStop(1,`rgba(${P.core},0)`);g.fillStyle=hg;g.beginPath();g.arc(0,c0,R*.12,0,TAU);g.fill();
    const m=clamp((e-.6)/.3,0,1);prbMono(g,'SAIL 4.1 M · 0.12 C',ix+R*.02,iy+ih-R*.08,hs,P.white,.9*m,'left',Math.floor(m*20));prbMono(g,'BEAM',0,h/2-R*.1,hs*.9,P.grey,.8*m,'center');
  }else if(stage===3){
    // Arrival: the system read as Keplerian conics, one after another round the star at their focus, each tagged,
    // and the probe's own hyperbola bending into a captured ellipse at the orbit insertion
    const fx=-iw*.12,fy=cy,orb=[[.18,.1,'CLASS-REG'],[.3,.2,'CLASS-AEOL'],[.46,.08,'CLASS-ATM'],[.64,.24,'CLASS-CRYO']];
    g.fillStyle=`rgba(${P.white},.95)`;g.beginPath();g.arc(fx,fy,R*.05,0,TAU);g.fill();g.strokeStyle=`rgba(${P.white},.6)`;g.lineWidth=Math.max(.4,R*.01);g.beginPath();g.moveTo(fx-R*.1,fy);g.lineTo(fx+R*.1,fy);g.moveTo(fx,fy-R*.1);g.lineTo(fx,fy+R*.1);g.stroke();
    orb.forEach(([a,ec,tag],i)=>{const q=clamp(e*5-i,0,1);if(q<=0)return;const A=a*iw*.62,B=A*Math.sqrt(1-ec*ec),c=A*ec;g.strokeStyle=`rgba(${P.white},${(.55*q).toFixed(3)})`;g.beginPath();g.ellipse(fx+c,fy,A,B,0,-Math.PI/2,-Math.PI/2+TAU*q);g.stroke();
      const pa=i*1.7+.6,px=fx+c+Math.cos(pa)*A,py=fy+Math.sin(pa)*B;if(q>=1){g.fillStyle=`rgb(${P.white})`;g.fillRect(px-1.2,py-1.2,2.4,2.4);prbMono(g,tag,px+R*.06,py-R*.08,hs*.8,P.grey,.85);}});
    const q=clamp((e-.72)/.28,0,1);if(q>0){g.strokeStyle=`rgba(${P.amber},${(.9*q).toFixed(3)})`;g.lineWidth=Math.max(.5,R*.014);g.setLineDash([R*.04,R*.03]);g.beginPath();g.moveTo(ix+iw,iy+R*.05);g.quadraticCurveTo(fx+iw*.5,fy-ih*.5,fx+iw*.42,fy);g.stroke();g.setLineDash([]);prbMono(g,'OI',fx+iw*.42+R*.06,fy,hs,P.amber,.95*q);}
  }else if(stage===4){
    // Seed: the limb of the world below, the seed coming down on its retro burn, and once it is down the mine
    // opening out across the regolith in a fan of survey lines while the feedstock counter starts to turn
    const gy=iy+ih*.82,gr=iw*1.6,dn=clamp(e/.5,0,1),sy0=lerp(iy+ih*.05,gy-R*.06,prbEase(dn));
    g.strokeStyle=`rgba(${P.white},.8)`;g.lineWidth=Math.max(.5,R*.014);g.beginPath();g.arc(0,gy+gr,gr,-Math.PI/2-.6,-Math.PI/2+.6);g.stroke();
    g.strokeStyle=`rgba(${P.white},.12)`;for(let i=1;i<5;i++){g.beginPath();g.arc(0,gy+gr,gr-i*R*.08,-Math.PI/2-.6,-Math.PI/2+.6);g.stroke();}
    g.strokeStyle=`rgba(${P.grey},.5)`;g.setLineDash([R*.02,R*.03]);g.beginPath();g.moveTo(0,iy);g.lineTo(0,sy0);g.stroke();g.setLineDash([]);
    g.strokeStyle=`rgba(${P.white},.95)`;g.beginPath();g.moveTo(-R*.06,sy0);g.lineTo(0,sy0-R*.08);g.lineTo(R*.06,sy0);g.closePath();g.stroke();
    if(dn<1){const fl=g.createLinearGradient(0,sy0,0,sy0+R*.18);fl.addColorStop(0,`rgba(${P.radHi},.9)`);fl.addColorStop(1,`rgba(${P.rad},0)`);g.fillStyle=fl;g.beginPath();g.moveTo(-R*.035,sy0);g.lineTo(0,sy0+R*.18);g.lineTo(R*.035,sy0);g.fill();}
    const fan=clamp((e-.5)/.4,0,1);if(fan>0){g.strokeStyle=`rgba(${P.white},${(.5*fan).toFixed(3)})`;g.beginPath();for(let i=0;i<9;i++){const u=Math.sin((i-4)*.24),L=R*(.3+tileHash(i,4,253)*.4)*fan;g.moveTo(0,gy);g.lineTo(u*L*2.2,gy+Math.abs(u)*L*.18+R*.02);}g.stroke();
      prbMono(g,'FEED '+String(Math.round(fan*412)).padStart(4,'0')+' T',ix+R*.02,iy+R*.02,hs,P.white,.9,'left');}
  }else if(stage===5){
    // Factory: the manifest itself, part after part, until the hull closes and the core is copied into it
    const f=clamp(e/.8,0,1),fill={SIL:clamp(f*2.2,0,1),VOL:clamp(f*2.2-.5,0,1),MET:clamp(f*2.2-.8,0,1),FUEL:clamp(f*2.2-1.2,0,1)};
    prbHull(g,0,cy,Math.min(iw*.36,ih*.9),fill,clamp((e-.82)/.12,0,1));
    const m=clamp((e-.9)/.1,0,1);if(m>0){const bw=R*1.1,bh=R*.26,by=iy+ih-bh*.9;g.strokeStyle=`rgba(${P.amber},${m.toFixed(3)})`;g.lineWidth=Math.max(.6,R*.02);g.strokeRect(-bw/2,by-bh/2,bw,bh);prbMono(g,'CLOSURE',0,by,hs*1.3,P.amber,m,'center');}
  }else{
    // Replication: the daughter peeling off the mother's line on its escape burn, the plaque copied in miniature
    const u=prbEase(clamp(e/.8,0,1)),s=Math.min(iw*.2,ih*.5),mx=-iw*.18,my=cy+ih*.18,dx=lerp(mx,iw*.26,u),dy=lerp(my,iy+ih*.22,u);
    prbHull(g,mx,my,s,{SIL:1,VOL:1,MET:1,FUEL:1},1,.7);
    g.strokeStyle=`rgba(${P.white},.35)`;g.setLineDash([R*.03,R*.03]);g.beginPath();g.moveTo(mx+s*.2,my);g.quadraticCurveTo(mx+s*1.2,my-R*.1,dx,dy);g.stroke();g.setLineDash([]);
    g.save();g.translate(dx,dy);g.rotate(-.5*u);prbHull(g,0,0,s*.8,{SIL:1,VOL:1,MET:1,FUEL:1},1,1);
    const fl=g.createLinearGradient(-s*1.2,0,-s*.95,0);fl.addColorStop(0,`rgba(${P.rad},0)`);fl.addColorStop(1,`rgba(${P.radHi},${(.8*u).toFixed(3)})`);g.fillStyle=fl;g.fillRect(-s*1.5,-s*.08,s*.56,s*.16);g.restore();
    if(u>.6){prbMono(g,'ESC',dx+s*.5,dy-R*.12,hs,P.amber,.9);}
    prbMono(g,'GEN 1',mx,my+s*.52,hs*.9,P.grey,.85,'center');prbMono(g,'GEN 2',dx,dy+s*.5,hs*.9,P.white,.9*clamp(u*2-1,0,1),'center');
  }
  g.restore();
  // header: the phase and its elapsed-time tally, typed; once whole, a checksum on the lower edge
  if(!opts.bare)prbMono(g,'PHASE '+PRB_ROMAN[stage-1]+' · '+C.phase+' · '+C.t,-w/2+R*.1,-h/2+R*.14,hs,P.white,.95,'left',opts.shown??Infinity);
  const m=clamp(e*3-2,0,1);if(m>0&&!opts.bare&&stage!==1)prbMono(g,'CRC 0x'+((stage*40503)&0xffff).toString(16).toUpperCase().padStart(4,'0')+' OK',w/2-R*.1,h/2-R*.1,hs*.85,P.green,.7*m,'right');
}

// The frontispiece's title mark: the furthest phase the log has reached, the era's name beneath it, and the log.
let prbTitleFade=1;
function prbTitleRoom(){
  let top=H*.13;
  try{const e=document.getElementById('probe-lore-open'),r=e&&e.getBoundingClientRect?e.getBoundingClientRect():null,gr=game.getBoundingClientRect?game.getBoundingClientRect():null;if(r&&gr&&r.height>0)top=r.bottom-gr.top+6;}catch(_){}
  let bottom=H*.36;for(const n of world.nodes)if(n.difficultyChoice)bottom=Math.min(bottom,sy(n.y)-n.cap*scale-6);
  return{top,bottom};
}
function prbTitleMark(){
  const ready=world.state==='ready';prbTitleFade=ready?1:Math.max(0,prbTitleFade-.03);if(prbTitleFade<=0)return;
  const P=ink.probe,rec=prbRead(),stage=rec.completed>0?6:rec.furthest+1,C=PRB_CHAPTERS[stage-1],x=W/2,nc=prbBits(rec.classes),ns=prbBits(rec.systems),log=nc||ns||rec.maxGen>1;
  const {top,bottom}=prbTitleRoom(),logY=bottom-6,lineY=log?logY-15:logY,titleY=lineY-21,fit=Math.min(W*.1,30*scale+4,(titleY-18-top)/2.5),R=clamp(fit,10,36),y=titleY-18-R*1.2;
  ctx.save();ctx.globalAlpha=prbTitleFade;
  if(fit>=10){const key='title:'+stage+':'+R.toFixed(1)+':'+DPR;let sp=prbSprites.get(key);
    if(!sp){const sw=Math.ceil(R*3.6),shh=Math.ceil(R*2.6),c=makeCanvas(Math.round(sw*DPR),Math.round(shh*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(sw/2,shh/2);prbFrame(g,R,stage,1);sp={canvas:c,w:sw,h:shh};if(prbSprites.size>8)prbSprites.clear();prbSprites.set(key,sp);}
    ctx.drawImage(sp.canvas,x-sp.w/2,y-sp.h/2,sp.w,sp.h);}
  prbMono(ctx,'THE PROBE',x,titleY,Math.min(20,W*.05),P.white,.95,'center');
  prbMono(ctx,'LOG: PHASE '+PRB_ROMAN[stage-1]+' · '+C.phase,x,lineY,Math.min(9.5,W*.024),P.grey,.9,'center');
  if(log)prbMono(ctx,'MAX GEN '+Math.max(1,rec.maxGen)+' · '+nc+'/7 CLASSES · '+ns+'/12 SYSTEMS',x,logY,8,P.green,.7,'center');
  ctx.restore();
}

// ---------- A phase opens ----------
// Struck early in the paint order, under every orbit and body, as the atlas cuts its chapter title into the
// plate: the phase's drawing faint behind the play, with its header typed above it a glyph at a time.
let prbRevealCanvas=null,prbRevealKey='',prbRevealOf=null,prbRevealAt=0,prbHudTopPx=null;
function prbHudTop(){if(prbHudTopPx!==null)return prbHudTopPx;let t=26;try{const e=document.querySelector('.hud'),v=e&&typeof getComputedStyle==='function'?parseFloat(getComputedStyle(e).top):NaN;if(isFinite(v))t=v;}catch(e){}return prbHudTopPx=t;}
function prbChapterReveal(dt){
  if(!world||world.state==='ready'||world.state==='dead')return;
  if(prbRevealOf!==chapterReveal){prbRevealOf=chapterReveal;prbRevealAt=world.time-chapterReveal.age;}
  chapterReveal.age=world.time-prbRevealAt;
  const age=chapterReveal.age,i=clamp(chapterReveal.index|0,0,PRB_CHAPTERS.length-1);if(age>4.4)return;
  let clear=Infinity;for(const n of world.nodes)if(n.difficultyChoice){const t=sy(n.y)-n.cap*scale-10;if(t>-40&&t<H)clear=Math.min(clear,t);}
  let R=Math.min(W*.15,58),cy=H*.44,draw=true;
  if(cy+R*1.2>clear){const room=clear-(prbHudTop()+84);R=Math.min(R,(room-60)/2.4);draw=R>=18;cy=draw?clear-R*1.2:clear;}
  const P=ink.probe,C=PRB_CHAPTERS[i],fade=age<.4?age/.4:age>3.6?clamp(1-(age-3.6)/.8,0,1):1,sw=Math.ceil(Math.max(R,18)*3.6),shh=Math.ceil(Math.max(R,18)*2.6);
  const key=sw+':'+DPR;if(!prbRevealCanvas||prbRevealKey!==key){prbRevealCanvas=makeCanvas(Math.round(sw*DPR),Math.round(shh*DPR));prbRevealKey=key;}
  const cx=W/2;
  if(draw){const g=prbRevealCanvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,prbRevealCanvas.width,prbRevealCanvas.height);g.setTransform(DPR,0,0,DPR,0,0);g.translate(sw/2,shh/2);
    prbFrame(g,R,i+1,clamp((age-.35)/2.3,0,1),{shown:Math.floor(age*30)});ctx.save();ctx.globalAlpha=.66*fade;ctx.drawImage(prbRevealCanvas,cx-sw/2,cy-shh/2,sw,shh);ctx.restore();}
  const tk=clamp((age-.2)/.8,0,1)*fade,ty=draw?cy-R*1.2-12:clear-8;
  ctx.save();ctx.globalAlpha=tk;const bw=Math.min(W-40,300),bh=52;ctx.fillStyle='rgba(3,3,3,.82)';ctx.fillRect(cx-bw/2,ty-bh,bw,bh);ctx.strokeStyle=`rgba(${P.grey},.55)`;ctx.lineWidth=.7;ctx.strokeRect(cx-bw/2,ty-bh,bw,bh);ctx.restore();
  prbMono(ctx,C.phase,cx,ty-bh+15,Math.min(17,W*.042),P.white,.95*tk,'center');
  prbMono(ctx,'PHASE '+PRB_ROMAN[i]+' OF VI · '+C.place+' · '+C.t,cx,ty-bh+31,Math.min(8,W*.019),P.grey,.9*tk,'center',Math.floor((age-.3)*34));
  prbMono(ctx,C.reading,cx,ty-bh+43,Math.min(8,W*.019),i===4?P.amber:P.white,.85*tk,'center',Math.floor((age-.8)*34));
}

// ---------- The node: a sensed mass, then a world read and priced ----------
// The ring stands at the node's real capture radius, never staged wider or narrower than the truth the code
// tests: a thin instrument circle, dashed where it is not yet drawn round, with eight ticks.
const prbFlourishAt=new Map();
function prbFlourish(n){prbFlourishAt.set(n,world.time);if(prbFlourishAt.size>40)for(const[key,at]of prbFlourishAt)if(world.time-at>.9)prbFlourishAt.delete(key);}
function prbRing(n,x,y,cap,state,drawn,active){
  const P=ink.probe;if(drawn<=0)return;const a0=-Math.PI/2,a1=a0+TAU*drawn;
  ctx.save();ctx.strokeStyle=`rgba(${active?P.white:P.grey},${(.6*state).toFixed(3)})`;ctx.lineWidth=Math.max(.6,.7*scale);ctx.beginPath();ctx.arc(x,y,cap,a0,a1);ctx.stroke();
  ctx.lineWidth=Math.max(.5,.55*scale);ctx.beginPath();for(let i=0;i<8;i++){const a=a0+i/8*TAU;if(a-a0>TAU*drawn)break;const L=(i%2===0?4.5:2.2)*scale;ctx.moveTo(x+Math.cos(a)*(cap-L*.4),y+Math.sin(a)*(cap-L*.4));ctx.lineTo(x+Math.cos(a)*(cap+L*.6),y+Math.sin(a)*(cap+L*.6));}ctx.stroke();
  const at=prbFlourishAt.get(n);
  if(at!==undefined){const k=clamp(1-(world.time-at)/.9,0,1);if(k>0){ctx.strokeStyle=`rgba(${P.white},${(.95*k).toFixed(3)})`;ctx.lineWidth=(.5+2*k)*scale;ctx.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;ctx.moveTo(x+Math.cos(a)*(cap+(1-k)*8*scale),y+Math.sin(a)*(cap+(1-k)*8*scale));ctx.lineTo(x+Math.cos(a)*(cap+(1-k)*8*scale+6*scale),y+Math.sin(a)*(cap+(1-k)*8*scale+6*scale));}ctx.stroke();
    prbMono(ctx,'OI',x,y-cap-9*scale,Math.max(7.5,8*scale),P.white,.95*k,'center');}}
  ctx.restore();
}
// Where the next body can be reached from the held ring, read exactly as drawNode reads it: a band outside the
// rim over the arc that connects, and at every tangent that threads clear a burn marker — a diamond on a tick.
function prbReleaseMarks(n,p,x,y){
  const P=ink.probe,rad=p.rad*scale;
  for(const next of releaseTargets(n)){
    const dist=Math.hypot(next.x-n.x,next.y-n.y),a=Math.atan2(next.y-n.y,next.x-n.x)-p.dir*Math.acos(clamp(p.rad/dist,-1,1)),win=Math.asin(clamp(next.cap/dist,0,.8));
    ctx.save();ctx.strokeStyle=`rgba(${P.white},.2)`;ctx.lineWidth=3*scale;ctx.lineCap='butt';ctx.beginPath();ctx.arc(x,y,rad+7*scale,a-win,a+win);ctx.stroke();ctx.restore();
    for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
      if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
      const c=Math.cos(path.angle),s=Math.sin(path.angle),mx=x+c*(rad+9*scale),my=y+s*(rad+9*scale),q=3*scale;
      ctx.save();ctx.strokeStyle=`rgba(${P.white},.9)`;ctx.lineWidth=1*scale;ctx.beginPath();ctx.moveTo(x+c*(rad-4*scale),y+s*(rad-4*scale));ctx.lineTo(x+c*(rad+13*scale),y+s*(rad+13*scale));ctx.stroke();
      ctx.lineWidth=.8*scale;ctx.beginPath();ctx.moveTo(mx,my-q);ctx.lineTo(mx+q,my);ctx.lineTo(mx,my+q);ctx.lineTo(mx-q,my);ctx.closePath();ctx.stroke();ctx.restore();}
  }
}
const prbDiscR=n=>clamp(n.r*.4,7,17)*scale;
// The opening choice: where the probe leaves from, what it fuels at, and the nearest world beyond the Sun.
const PRB_CHOICE={relaxed:{fam:'ocean',name:'SOL III',sub:'ORIGIN · UNREAD'},classic:{fam:'storm',name:'JUPITER',sub:'HE-3 · DAEDALUS'},hardcore:{fam:'ice',name:'PROXIMA B',sub:'4.24 LY · NEAREST'}};
// A body not yet held is a sensed mass: a fixed position, a return pulsing out from it, and nothing more — the
// probe's sensors could say more and do not yet, since nothing a course depends on is ever staged ahead of it.
function prbPhenomenon(n,x,y){
  const P=ink.probe,fading=n.type==='fading',t=reducedMotion?0:world.time,col=fading?P.amber:P.white,s=(3+clamp((n.r-18)/34,0,1)*2.4)*scale;
  ctx.save();ctx.strokeStyle=`rgba(${col},.85)`;ctx.lineWidth=Math.max(.6,.75*scale);ctx.beginPath();ctx.moveTo(x-s*1.8,y);ctx.lineTo(x-s*.6,y);ctx.moveTo(x+s*.6,y);ctx.lineTo(x+s*1.8,y);ctx.moveTo(x,y-s*1.8);ctx.lineTo(x,y-s*.6);ctx.moveTo(x,y+s*.6);ctx.lineTo(x,y+s*1.8);ctx.stroke();
  ctx.fillStyle=`rgb(${col})`;ctx.fillRect(x-.9*scale,y-.9*scale,1.8*scale,1.8*scale);
  const f=(t*.55+n.id*.37)%1;ctx.strokeStyle=`rgba(${col},${((1-f)*.4).toFixed(3)})`;ctx.lineWidth=.6*scale;ctx.beginPath();ctx.arc(x,y,s*(1.2+f*2.4),0,TAU);ctx.stroke();
  prbMono(ctx,fading?'M ? · DECAYING':'M ?',x+s*2.1,y-s*1.4,Math.max(6.5,6.5*scale),col,fading?.8:.5,'left');
  ctx.restore();
}
// The class icon, in the plaque's own reductive line-and-tick shorthand — borrowed as an inheritance, not
// redrawn — set inside the wireframe as the mass locks.
function prbIcon(g,family,x,y,R,k,col){
  if(k<=0)return;const P=ink.probe;g.save();g.strokeStyle=`rgba(${col},${(.85*k).toFixed(3)})`;g.lineWidth=Math.max(.6,R*.07);g.lineCap='round';g.beginPath();const s=R*.5;
  if(family==='ocean'){for(let i=-1;i<=1;i++){for(let j=0;j<=8;j++){const u=j/8,px=x-s+u*s*2,py=y+i*s*.5+Math.sin(u*TAU)*s*.14;j?g.lineTo(px,py):g.moveTo(px,py);}}}
  else if(family==='crater'||family==='moon'){for(const [dx,dy,r] of[[-.35,-.25,.32],[.35,.1,.24],[-.1,.45,.18]]){g.moveTo(x+dx*s+r*s,y+dy*s);g.arc(x+dx*s,y+dy*s,r*s,0,TAU);}}
  else if(family==='ringed'){g.ellipse(x,y,s*1.9,s*.45,-.3,0,TAU);}
  else if(family==='ice'){for(let i=0;i<3;i++){const a=i*Math.PI/3;g.moveTo(x-Math.cos(a)*s,y-Math.sin(a)*s);g.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);for(const e of[-1,1]){const bx=x+Math.cos(a)*s*.6*e,by=y+Math.sin(a)*s*.6*e;g.moveTo(bx+Math.cos(a+Math.PI/2)*s*.18,by+Math.sin(a+Math.PI/2)*s*.18);g.lineTo(bx-Math.cos(a+Math.PI/2)*s*.18,by-Math.sin(a+Math.PI/2)*s*.18);}}}
  else if(family==='dune'){for(let i=0;i<3;i++){const yy=y-s*.45+i*s*.45;g.moveTo(x-s,yy+s*.15);g.quadraticCurveTo(x-s*.2,yy-s*.25,x+s,yy+s*.12);}}
  else if(family==='volcanic'){g.moveTo(x-s*.7,y+s*.6);g.lineTo(x,y-s*.2);g.lineTo(x+s*.7,y+s*.6);for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.4;g.moveTo(x+Math.cos(a)*s*.45,y-s*.2+Math.sin(a)*s*.45);g.lineTo(x+Math.cos(a)*s*.8,y-s*.2+Math.sin(a)*s*.8);}}
  else{for(let j=0;j<=28;j++){const a=j*.42,r=s*.08+j/28*s;j?g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}}
  g.stroke();
  // the volcanic class carries the sheet's one warm accent at its vent, the radiator's own colour
  if(family==='volcanic'){const vg=g.createRadialGradient(x,y-s*.2,0,x,y-s*.2,s*.35);vg.addColorStop(0,`rgba(${P.radHi},${(.9*k).toFixed(3)})`);vg.addColorStop(1,`rgba(${P.rad},0)`);g.fillStyle=vg;g.beginPath();g.arc(x,y-s*.2,s*.35,0,TAU);g.fill();}
  g.restore();
}
// A world as a machine sees it: a wireframe globe, meridians closing round it as the reading runs, turning
// slowly under the probe, with no shading and no light — a measurement, not a picture.
function prbGlobe(g,x,y,R,k,spin,col,alpha=1){
  if(k<=0)return;g.save();g.lineWidth=Math.max(.5,R*.055);g.strokeStyle=`rgba(${col},${(.9*alpha).toFixed(3)})`;g.beginPath();g.arc(x,y,R,-Math.PI/2,-Math.PI/2+TAU*clamp(k*1.6,0,1));g.stroke();
  g.fillStyle=`rgba(5,5,5,${(.7*alpha).toFixed(3)})`;g.beginPath();g.arc(x,y,R*.98,0,TAU);g.fill();
  g.lineWidth=Math.max(.4,R*.03);const m=clamp(k*1.6-.4,0,1);
  for(let i=0;i<4;i++){const ph=(i/4+spin)%1,cx=Math.cos(ph*Math.PI),q=clamp(m*4-i,0,1);if(q<=0)continue;g.strokeStyle=`rgba(${col},${(.35*q*alpha*(.4+.6*Math.abs(Math.sin(ph*Math.PI)))).toFixed(3)})`;g.beginPath();g.ellipse(x,y,Math.abs(cx)*R,R,0,0,TAU);g.stroke();}
  for(const la of[-.5,0,.5]){const q=clamp(m*2-.5,0,1);if(q<=0)continue;const yy=y+la*R,rr=Math.sqrt(1-la*la)*R;g.strokeStyle=`rgba(${col},${(.3*q*alpha).toFixed(3)})`;g.beginPath();g.ellipse(x,yy,rr,rr*.18,0,0,TAU);g.stroke();}
  g.restore();
}
let prbDoneAt=new Map(),prbShown=0;
function prbDoneAge(n){let at=prbDoneAt.get(n.id);if(at===undefined){at=world.time;prbDoneAt.set(n.id,at);if(prbDoneAt.size>60)prbDoneAt.delete(prbDoneAt.keys().next().value);}return world.time-at;}
function prbNoteDone(n,family){if(n.difficultyChoice||prbNoted.has(n.id))return;prbNoted.add(n.id);prbNoteClass(family);}
// A body held: the spectral read first, then mass and density locking under the globe, a periapsis and an
// apoapsis struck on the ring, and last the class tag and the material it pays, printed whole.
function prbBody(n,family,x,y,d,al,cap){
  const P=ink.probe,R=prbDiscR(n),s1=prbSpan(d,PRB_STAGE.spec),s2=prbSpan(d,PRB_STAGE.mass),s3=prbSpan(d,PRB_STAGE.apse),s4=prbSpan(d,PRB_STAGE.seal),seed=(n.seed|0)^0x8,spin=reducedMotion?.2:(world.time*.05+n.id*.13)%1;
  ctx.save();ctx.globalAlpha=al;
  prbGlobe(ctx,x,y,R,Math.max(.15,s1*.3+s2*.7),spin,P.white);
  prbIcon(ctx,family,x,y,R,s2,P.white);
  if(family==='ringed'&&s3>0){ctx.strokeStyle=`rgba(${P.white},${(.55*s3).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.beginPath();ctx.ellipse(x,y,R*1.9,R*.5,-.3,Math.PI*.05,Math.PI*.95+Math.PI*s3);ctx.stroke();}
  // the apsides, struck on the ring the probe is actually holding
  if(s3>0&&cap){const a=(n.seed|0)%628/100,pe=[x+Math.cos(a)*cap,y+Math.sin(a)*cap],ap=[x-Math.cos(a)*cap,y-Math.sin(a)*cap];
    ctx.strokeStyle=`rgba(${P.white},${(.8*s3).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.7*scale);ctx.beginPath();for(const q of[pe,ap]){ctx.moveTo(q[0]-3*scale,q[1]-3*scale);ctx.lineTo(q[0]+3*scale,q[1]+3*scale);ctx.moveTo(q[0]+3*scale,q[1]-3*scale);ctx.lineTo(q[0]-3*scale,q[1]+3*scale);}ctx.stroke();
    const lx=Math.cos(a)>=0?1:-1;prbMono(ctx,'PE '+String(Math.round(n.cap*.92)).padStart(3,'0'),pe[0]+lx*5*scale,pe[1]-5*scale,Math.max(6.5,6.5*scale),P.grey,.85*s3,lx>0?'left':'right');prbMono(ctx,'AP '+String(Math.round(n.cap*1.08)).padStart(3,'0'),ap[0]-lx*5*scale,ap[1]+5*scale,Math.max(6.5,6.5*scale),P.grey,.85*s3,lx>0?'right':'left');}
  ctx.restore();
  if(n.difficultyChoice)return;
  // the readout under the body: three lines, each ticking until it locks
  const sz=Math.max(7,7.2*scale),by=y+R+(family==='ringed'?R*.45:0)+10*scale,mex=1+Math.round(clamp((n.r-12)/40,0,1)*8)+18,md=(tileHash(seed,1,261)*8+1).toFixed(1),den=(tileHash(seed,2,261)*4.5+.6).toFixed(2),mat=PRB_MAT_OF[family]||'SIL';
  if(s1>0&&s4<1){const guess=s2<1?'CLASS-'+(prbTick(seed,1,1,false)==='5'?'???':'?'+(PRB_CLASS[family]||'').slice(6,7)+'?')+' ±'+Math.round(40-30*s2)+'%':PRB_CLASS[family];prbMono(ctx,guess,x,by,sz,s2<1?P.grey:P.white,.85*al*Math.min(1,s1*3),'center');}
  if(s2>0){const mv=s2<1?prbTick(seed,2,2,false):null,ml='M '+(mv?mv[0]+'.'+mv[1]:md)+'E'+mex+' · ρ '+(s2<1?prbTick(seed,3,1,false)+'.'+prbTick(seed,4,2,false):den);prbMono(ctx,ml,x,by+sz*1.25,sz*.92,s2<1?P.grey:P.white,.8*al,'center');}
  if(s4>0){const tag=PRB_CLASS[family]+' · '+PRB_MAT_NAME[mat];prbMono(ctx,tag,x,by,sz,P.white,.95*al,'center',d>=.8?Infinity:Math.floor(s4*tag.length));
    const paid=(d*PRB_YIELD).toFixed(2);prbMono(ctx,mat+' +'+paid,x,by+sz*2.5,sz*.92,d>=.8?P.green:P.grey,.8*al*s4,'center');}
  if(d>=.8)prbNoteDone(n,family);
}
// The opening choice, drawn whole with its name and what it stands for.
function prbChoice(n,x,y){
  const P=ink.probe,C=PRB_CHOICE[n.difficultyChoice]||PRB_CHOICE.classic,R=prbDiscR(n);
  prbBody(n,C.fam,x,y,1,1,0);
  prbMono(ctx,C.name,x,y+R+13*scale,Math.max(9.5,10*scale),P.white,.95,'center');prbMono(ctx,C.sub,x,y+R+25*scale,Math.max(7,7.2*scale),P.grey,.85,'center');
}
// A small body — a faint light, or the gilt find — is read the same class-first way, only as rubble: a lumpy
// outline, its figures in the same hand; the gilt find is a metal-rich asteroid, the one worth the most metal.
function prbSmallBody(n,x,y,d,al,metal,taken=true){
  const P=ink.probe,R=(metal?Math.max(6,n.r*.3):prbDiscR(n)*.85),col=metal?P.goldHi:P.white;
  ctx.save();ctx.globalAlpha=al;ctx.strokeStyle=`rgba(${metal&&d<.8?P.white:P.white},.85)`;ctx.lineWidth=Math.max(.5,.7*scale);ctx.beginPath();
  for(let i=0;i<=14;i++){const a=i/14*TAU,rr=R*(.72+tileHash(n.seed|0,i%14,271)*.4)*(i%14===0?1:1);const px=x+Math.cos(a)*rr*1.3,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.stroke();
  const q=prbEase(clamp(d*1.4,0,1));if(q>0){ctx.strokeStyle=`rgba(${P.white},${(.35*q).toFixed(3)})`;ctx.beginPath();for(let i=0;i<4;i++){const yy=y-R*.6+i*R*.4;ctx.moveTo(x-R*1.1*q,yy);ctx.lineTo(x+R*1.1*q,yy);}ctx.stroke();}
  if(metal){ctx.fillStyle=`rgba(${P.gold},${(.25+.5*q).toFixed(3)})`;ctx.beginPath();ctx.arc(x,y,R*.3,0,TAU);ctx.fill();}
  ctx.restore();
  if(!taken)return;const sz=Math.max(7,7.2*scale),by=y+R+10*scale;
  if(d<.8)prbMono(ctx,'READ '+String(Math.round(d*100)).padStart(3,'0')+'%',x,by,sz,P.grey,.85*al,'center');
  else prbMono(ctx,metal?'CLASS-M · METALS +'+(d*PRB_YIELD).toFixed(2):'CLASS-S · SILICATES +'+(d*PRB_YIELD).toFixed(2),x,by,sz,metal?P.goldHi:P.white,.9*al,'center');
}
// The charges, as finished parts rather than raw stock (08-probe.md, "Currency and the rule"): a radiation-
// shield plate, a sail segment, a memory scrub that pushes the flux back, and an isotope cache for the feed.
function prbGift(n,x,y,used,sc=scale){
  const P=ink.probe,r=n.r*sc,k=used?.35:1;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=k;ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=`rgb(${P.white})`;ctx.lineWidth=Math.max(.7,.85*sc);
  if(n.type==='shield'){const R=r*.42;ctx.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/6+Math.PI/6;i?ctx.lineTo(Math.cos(a)*R,Math.sin(a)*R):ctx.moveTo(Math.cos(a)*R,Math.sin(a)*R);}ctx.stroke();
    ctx.save();ctx.clip();ctx.strokeStyle=`rgba(${P.white},.4)`;ctx.lineWidth=Math.max(.4,.5*sc);ctx.beginPath();for(let i=-4;i<=4;i++){ctx.moveTo(i*R*.3-R,-R);ctx.lineTo(i*R*.3+R,R);}ctx.stroke();ctx.restore();}
  else if(n.type==='reflector'){const R=r*.42;ctx.fillStyle=`rgba(${P.sail},.25)`;ctx.beginPath();ctx.moveTo(0,-R);ctx.lineTo(R,0);ctx.lineTo(0,R);ctx.lineTo(-R,0);ctx.closePath();ctx.fill();ctx.strokeStyle=`rgb(${P.sail})`;ctx.stroke();
    ctx.strokeStyle=`rgba(${P.sail},.5)`;ctx.beginPath();ctx.moveTo(-R,0);ctx.lineTo(R,0);ctx.moveTo(0,-R);ctx.lineTo(0,R);ctx.stroke();}
  else if(n.type==='dawn'){const R=r*.34;ctx.strokeRect(-R,-R,R*2,R*2);ctx.beginPath();for(let i=0;i<4;i++){const u=-R+R*.4+i*R*.4;ctx.moveTo(u,-R);ctx.lineTo(u,-R*1.35);ctx.moveTo(u,R);ctx.lineTo(u,R*1.35);ctx.moveTo(-R,u);ctx.lineTo(-R*1.35,u);ctx.moveTo(R,u);ctx.lineTo(R*1.35,u);}ctx.stroke();
    ctx.strokeStyle=`rgb(${P.green})`;ctx.beginPath();ctx.arc(0,0,R*.5,-.3,Math.PI*1.5);ctx.stroke();ctx.beginPath();ctx.moveTo(R*.5,-R*.25);ctx.lineTo(R*.5*Math.cos(-.3),R*.5*Math.sin(-.3));ctx.lineTo(R*.72,-R*.05);ctx.stroke();}
  else{const R=r*.3;ctx.beginPath();ctx.ellipse(0,-R,R*.8,R*.28,0,0,TAU);ctx.moveTo(-R*.8,-R);ctx.lineTo(-R*.8,R);ctx.ellipse(0,R,R*.8,R*.28,0,Math.PI,0,true);ctx.lineTo(R*.8,-R);ctx.stroke();
    const vg=ctx.createRadialGradient(0,0,0,0,0,R*.6);vg.addColorStop(0,`rgba(${P.radHi},.9)`);vg.addColorStop(1,`rgba(${P.rad},0)`);ctx.fillStyle=vg;ctx.beginPath();ctx.arc(0,0,R*.6,0,TAU);ctx.fill();}
  ctx.restore();
}
// A gravity assist, logged as a DV ASSIST: the salvaged drive core ringing the body, chevrons in its sense.
function prbSling(n,x,y){
  const P=ink.probe,R=n.r*scale*.86,t=reducedMotion?0:world.time;
  ctx.save();ctx.strokeStyle=`rgba(${P.white},.45)`;ctx.lineWidth=Math.max(.6,.7*scale);ctx.setLineDash([1.5*scale,3.5*scale]);ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=`rgba(${P.white},.85)`;ctx.lineWidth=Math.max(.8,1*scale);for(let i=0;i<4;i++){const a=i*TAU/4+t*.45,px=x+Math.cos(a)*R,py=y+Math.sin(a)*R,tx=-Math.sin(a),ty=Math.cos(a),s=3.2*scale,nx=Math.cos(a),ny=Math.sin(a);
    ctx.beginPath();ctx.moveTo(px-tx*s+nx*s*.8,py-ty*s+ny*s*.8);ctx.lineTo(px,py);ctx.lineTo(px-tx*s-nx*s*.8,py-ty*s-ny*s*.8);ctx.stroke();}
  prbMono(ctx,'DV ASSIST',x,y-R-7*scale,Math.max(6.5,6.8*scale),P.grey,.75,'center');
  ctx.restore();
}
// A system's star: a point in a bracket until it is visited, then a spectral class set beside it.
function prbStar(n,x,y,d,al){
  const P=ink.probe,mag=clamp(n.magnitude??3,1,6),r=(3.6-mag*.4)*scale,k=prbEase(clamp(d*1.6,0,1));
  ctx.save();ctx.globalAlpha=al;ctx.fillStyle=`rgb(${P.white})`;ctx.fillRect(x-r*.45,y-r*.45,r*.9,r*.9);
  ctx.strokeStyle=`rgba(${P.white},${(.45+.4*k).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.55*scale);const b=r*2.2;ctx.beginPath();for(const [s0,s1] of[[-1,-1],[1,-1],[1,1],[-1,1]]){ctx.moveTo(x+s0*b,y+s1*(b-2*scale));ctx.lineTo(x+s0*b,y+s1*b);ctx.lineTo(x+s0*(b-2*scale),y+s1*b);}ctx.stroke();
  if(k>0)prbMono(ctx,['M4V','G2V','K1V','M5V','A1V','K2V'][(n.id|0)%6],x+b+3*scale,y,Math.max(6.5,6.5*scale),P.grey,.85*k,'left');
  ctx.restore();
}
function prbNode(n,aim){
  prbRun();
  const pen=revealNode(n);if(pen.t<=0)return;
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=!!(aim&&aim.n.id===n.id);
  const x=sx(n.x),y=sy(n.y),cap=n.cap*scale;
  if(y<-cap*2-60||y>H+cap*2+60)return;
  prbRing(n,x,y,cap,active||target?1:used?.32:.62,pen.ring,active);
  if(n.type==='sling')prbSling(n,x,y);
  if(['shield','reflector','dawn','inkwell'].includes(n.type))prbGift(n,x,y,used);
  else if(n.difficultyChoice)prbChoice(n,x,y);
  else if(n.routeRole==='star')prbStar(n,x,y,pen.taken>0?pen.d:0,pen.taken>0?1:.75);
  else if(n.type==='gold')prbSmallBody(n,x,y,pen.taken>0?pen.d:0,pen.taken>0?pen.taken:.75,true,pen.taken>0);
  else if(pen.taken>0){if(n.type==='fading')prbSmallBody(n,x,y,pen.d,pen.taken,false);else prbBody(n,prbFamily(n),x,y,pen.d,pen.taken,active?p.rad*scale:cap);}
  else prbPhenomenon(n,x,y);
  if(active)prbReleaseMarks(n,p,x,y);
}

// ---------- The dangers: readings, never pictures ----------
// All four keep the field, core, reach and lethality the simulation gives them; only the depiction is this
// era's. The register is the fix for the risk the era file names — two neighbours already draw these rows —
// so the well is a polar equipotential mesh and not a grid, the push a pulsar's swept wedge and not a belt, the
// wind a field of vectors and not streamlines, and the obscurer an attenuation logged in magnitudes.
function prbHazardLabel(str,x,y,off,size,col){const w=prbTextWidth(str,size),right=x+off+w<=W-PRB_BAND-4;prbMono(ctx,str,right?x+off:x-off,y,size,col,.85,right?'left':'right');}
function prbWell(h,x,y){
  const P=ink.probe,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time;
  ctx.save();
  // equipotentials, crowding toward the mass
  for(let i=1;i<=7;i++){const u=i/7,r=core+(reach-core)*Math.pow(u,1.7);ctx.strokeStyle=`rgba(${P.white},${(.08+.26*(1-u)).toFixed(3)})`;ctx.lineWidth=Math.max(.4,.5*scale);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
  // the mesh's radials, twisted inward as a field line is drawn down a well
  ctx.strokeStyle=`rgba(${P.white},.16)`;ctx.beginPath();for(let i=0;i<16;i++){const a0=i/16*TAU+t*.04;for(let j=0;j<=10;j++){const u=j/10,r=reach-(reach-core)*u,a=a0+u*u*.9;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;j?ctx.lineTo(px,py):ctx.moveTo(px,py);}}ctx.stroke();
  // the core: hatched, exactly as wide as the lethal core, bounded by a dashed amber line
  ctx.save();ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fillStyle='rgb(0,0,0)';ctx.fill();ctx.clip();ctx.strokeStyle=`rgba(${P.amber},.45)`;ctx.lineWidth=Math.max(.4,.5*scale);ctx.beginPath();for(let i=-6;i<=6;i++){const o=i*core/3;ctx.moveTo(x+o-core,y-core);ctx.lineTo(x+o+core,y+core);}ctx.stroke();ctx.restore();
  ctx.strokeStyle=`rgba(${P.amber},.9)`;ctx.lineWidth=scale;ctx.setLineDash([2*scale,2*scale]);ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
  prbHazardLabel('WELL',x,y-core-12*scale,core+8*scale,Math.max(8,8*scale),P.amber);
  prbHazardLabel('M '+(1+tileHash(h.seed|0,1,281)*8).toFixed(1)+'E30 KG',x,y-core-2*scale,core+8*scale,Math.max(6.5,6.5*scale),P.grey);
}
function prbBeam(h,x,y){
  const P=ink.probe,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time,a=t*1.4+(h.seed|0)%7,w=.34;
  ctx.save();ctx.strokeStyle=`rgba(${P.amber},.35)`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.setLineDash([1*scale,4*scale]);ctx.beginPath();ctx.arc(x,y,reach,0,TAU);ctx.stroke();ctx.setLineDash([]);
  // the swept wedge, and its opposite, as a pulsar's two beams: hatched sectors, a reading of flux, not a glow
  for(const s of[0,Math.PI]){ctx.save();ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,reach,a+s-w,a+s+w);ctx.closePath();ctx.fillStyle=`rgba(${P.amber},.07)`;ctx.fill();ctx.clip();ctx.strokeStyle=`rgba(${P.amber},.32)`;ctx.lineWidth=Math.max(.4,.5*scale);ctx.beginPath();for(let r=core*1.4;r<reach;r+=5*scale){ctx.moveTo(x+Math.cos(a+s-w)*r,y+Math.sin(a+s-w)*r);ctx.arc(x,y,r,a+s-w,a+s+w);}ctx.stroke();ctx.restore();
    ctx.strokeStyle=`rgba(${P.amber},.85)`;ctx.lineWidth=Math.max(.6,.8*scale);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a+s)*reach,y+Math.sin(a+s)*reach);ctx.stroke();}
  ctx.fillStyle='rgb(0,0,0)';ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();ctx.strokeStyle=`rgb(${P.white})`;ctx.lineWidth=scale;ctx.stroke();ctx.fillStyle=`rgb(${P.white})`;ctx.beginPath();ctx.arc(x,y,Math.max(1.5,core*.3),0,TAU);ctx.fill();
  ctx.restore();
  prbHazardLabel('BEAM',x,y-core-12*scale,core+8*scale,Math.max(8,8*scale),P.amber);
  prbHazardLabel('P 1.337 S',x,y-core-2*scale,core+8*scale,Math.max(6.5,6.5*scale),P.grey);
}
function prbFlux(h,x,y){
  const P=ink.probe,reach=gravityRadius(h)*scale;if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const t=reducedMotion?0:world.time,dir=h.dir||0,step=15*scale,off=(t*9*scale)%step;
  ctx.save();ctx.translate(x,y);ctx.rotate(dir);ctx.beginPath();ctx.arc(0,0,reach,0,TAU);ctx.clip();ctx.strokeStyle=`rgba(${P.white},.5)`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.beginPath();
  for(let gy=-reach;gy<=reach;gy+=step)for(let gx=-reach-step;gx<=reach;gx+=step){const px=gx+off+((Math.round(gy/step)&1)?step/2:0),L=step*.55,a=3*scale;ctx.moveTo(px-L/2,gy);ctx.lineTo(px+L/2,gy);ctx.moveTo(px+L/2-a,gy-a*.6);ctx.lineTo(px+L/2,gy);ctx.lineTo(px+L/2-a,gy+a*.6);}
  ctx.stroke();ctx.restore();
  ctx.save();ctx.strokeStyle=`rgba(${P.white},.2)`;ctx.lineWidth=.6*scale;ctx.setLineDash([1*scale,4*scale]);ctx.beginPath();ctx.arc(x,y,reach,0,TAU);ctx.stroke();ctx.restore();
  const lx=x-Math.cos(dir)*reach*.6,ly=y-Math.sin(dir)*reach*.6-12*scale;prbMono(ctx,'ISM FLUX',lx,ly,Math.max(7.5,7.5*scale),P.white,.85,'center');prbMono(ctx,'N 0.08 /CM3',lx,ly+10*scale,Math.max(6.5,6.5*scale),P.grey,.8,'center');
}
// The obscurer: an attenuation region, a Bayer dither thickening toward its centre, its loss logged in magnitudes.
const PRB_BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function prbExt(h,x,y){
  const P=ink.probe,R=h.r*scale;if(y+R<-20||y-R>H+20)return;const c=Math.max(2.5,3*scale);
  ctx.save();ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.clip();ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-R,y-R,R*2,R*2);ctx.fillStyle=`rgba(${P.grey},.38)`;
  for(let yy=-R,j=0;yy<R;yy+=c,j++)for(let xx=-R,i=0;xx<R;xx+=c,i++){const d=Math.hypot(xx,yy)/R;if(d>1)continue;const th=(1-d)*16*.75;if(PRB_BAYER[(j&3)*4+(i&3)]<th)ctx.fillRect(x+xx,y+yy,c*.5,c*.5);}
  ctx.restore();ctx.save();ctx.strokeStyle=`rgba(${P.grey},.5)`;ctx.setLineDash([2*scale,3*scale]);ctx.lineWidth=.6*scale;ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.stroke();ctx.restore();
  prbMono(ctx,'EXT · -'+(1.5+tileHash(h.seed|0,2,282)*2).toFixed(1)+' MAG',x,y-R-8*scale,Math.max(7.5,7.5*scale),P.grey,.9,'center');
}
function prbHazard(h){
  const x=sx(h.x),y=sy(h.y);
  if(h.kind==='nebula')return prbExt(h,x,y);
  if(h.kind==='wind')return prbFlux(h,x,y);
  const reach=gravityRadius(h)*scale;if(y+reach<-20||y-reach>H+20)return;
  if(h.kind==='flare')return prbBeam(h,x,y);
  return prbWell(h,x,y);
}
// A danger comes onto the sheet as a reading does: its block written in from the top, a cursor line below it.
function prbHazardReveal(h,draw,t){
  const x=sx(h.x),y=sy(h.y),R=(gravityRadius(h)+24)*scale,e=Math.round((1-Math.pow(1-t,3))*12)/12;
  ctx.save();ctx.beginPath();ctx.rect(x-R,y-R,R*2,R*2*e);ctx.clip();draw(h);ctx.restore();
  if(e<1){ctx.save();ctx.fillStyle=`rgba(${ink.probe.white},${(.6*(1-e)).toFixed(3)})`;ctx.fillRect(x-R,y-R+R*2*e,R*2,Math.max(1,scale));ctx.restore();}
}

// ---------- The flight: the log behind, the course flown, the solution ahead ----------
function prbTrail(){
  const tr=world.trail;if(tr.length<2)return;const P=ink.probe;
  const pts=[];for(const s of tr){const life=clamp(1-(world.time-s.time)/TRAIL_LIFE,0,1);if(life>0)pts.push([sx(s.x),sy(s.y),life]);}
  const p=world.player;if(world.state!=='dead')pts.push([sx(p.x),sy(p.y),1]);if(pts.length<2)return;
  ctx.save();ctx.strokeStyle=`rgba(${P.white},.22)`;ctx.lineWidth=.6*scale;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  // a logged block every few samples: a hollow square, the probe's own account of where it has been
  for(let i=0;i<pts.length;i+=4){const f=pts[i][2],s=1.6*scale;ctx.strokeStyle=`rgba(${P.white},${(.1+f*.6).toFixed(3)})`;ctx.lineWidth=.5*scale;ctx.strokeRect(pts[i][0]-s,pts[i][1]-s,s*2,s*2);}
  // the drive's exhaust, the radiator glow's colour, briefly behind the craft in flight
  if(world.state==='playing'&&!p.node&&pts.length>2){const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-4)],g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,`rgba(${P.radHi},.55)`);g.addColorStop(1,`rgba(${P.rad},0)`);ctx.strokeStyle=g;ctx.lineWidth=1.6*scale;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
  ctx.restore();
}
function prbInkPath(){
  const Q=world.inkPath;if(Q.length<2)return;const P=ink.probe;
  ctx.save();ctx.strokeStyle=`rgba(${P.dim},.7)`;ctx.lineWidth=Math.max(.6,.8*scale);ctx.setLineDash([4*scale,3*scale]);
  ctx.beginPath();ctx.moveTo(sx(Q[0].x),sy(Q[0].y));for(let i=1;i<Q.length;i++)ctx.lineTo(sx(Q[i].x),sy(Q[i].y));ctx.stroke();ctx.restore();
}
// The course ahead is the probe's own trajectory solution: short dashes, white while it closes, amber where it
// will not, grey past the point the feedstock will carry it; every sixth a time tick across it.
function prbAim(aim,preview){
  const P=ink.probe,points=preview.points,warn=preview.blocked||aim?.steep,end=points[points.length-1];
  const dryFrom=preview.inkRange>=0&&end.distance>0?clamp(preview.inkRange/end.distance,0,1):1;
  const Q=points.map(q=>[sx(q.x),sy(q.y)]),lens=[0];for(let i=1;i<Q.length;i++)lens.push(lens[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));const total=lens[lens.length-1];if(total<2)return;
  const at=d=>{let i=1;while(i<Q.length-1&&lens[i]<d)i++;const t=(d-lens[i-1])/((lens[i]-lens[i-1])||1);return[Q[i-1][0]+(Q[i][0]-Q[i-1][0])*t,Q[i-1][1]+(Q[i][1]-Q[i-1][1])*t,Math.atan2(Q[i][1]-Q[i-1][1],Q[i][0]-Q[i-1][0])];};
  ctx.save();const step=7*scale,start=27*scale+(reducedMotion?0:(world.time*14*scale)%step);let k=0;ctx.lineCap='butt';
  for(let d=start;d<total;d+=step,k++){const f=d/total,q=at(d),dry=f>dryFrom,a=dry?.4*(1-f*.4):warn?.9*(1-f*.3):(aim?.9:.62)*(1-f*.35),col=dry?P.dim:warn?P.amber:P.white,L=(aim?3.4:2.6)*scale;
    ctx.strokeStyle=`rgba(${col},${a.toFixed(3)})`;ctx.lineWidth=(aim?1.2:1)*scale;ctx.beginPath();ctx.moveTo(q[0]-Math.cos(q[2])*L/2,q[1]-Math.sin(q[2])*L/2);ctx.lineTo(q[0]+Math.cos(q[2])*L/2,q[1]+Math.sin(q[2])*L/2);ctx.stroke();
    if(k%6===5){const nx=-Math.sin(q[2]),ny=Math.cos(q[2]);ctx.lineWidth=.7*scale;ctx.beginPath();ctx.moveTo(q[0]-nx*2.6*scale,q[1]-ny*2.6*scale);ctx.lineTo(q[0]+nx*2.6*scale,q[1]+ny*2.6*scale);ctx.stroke();}}
  if(aim?.perfect&&!preview.fogged){const x=sx(aim.cx+Math.cos(aim.entryAngle)*aim.radius),y=sy(aim.cy+Math.sin(aim.entryAngle)*aim.radius),q=3.6*scale;
    ctx.strokeStyle=`rgb(${P.white})`;ctx.lineWidth=1*scale;ctx.beginPath();ctx.moveTo(x,y-q);ctx.lineTo(x+q,y);ctx.lineTo(x,y+q);ctx.lineTo(x-q,y);ctx.closePath();ctx.stroke();ctx.fillStyle=`rgb(${P.white})`;ctx.fillRect(x-.8*scale,y-.8*scale,1.6*scale,1.6*scale);}
  ctx.restore();
}

// ---------- The traveller: the probe, its Observer Core at the replication core ----------
// A long spine with a Whipple shield at the bow, three propellant tanks, the fusion drive's bell at the stern and
// two radiator fins glowing the one warm colour aboard; amidships the replication core, where the Observer Core
// sits — not at a sensor, since this tool's Core is the part that survives being copied (08-probe.md, "The
// bodies") — drawn omnidirectional, with the gilt plaque bolted beside it.
let prbCraft=null,prbCraftKey='';
function prbCraftSprite(){
  const key=DPR.toFixed(2);if(prbCraft&&prbCraftKey===key)return prbCraft;prbCraftKey=key;
  const S=1.1,size=84,c=makeCanvas(Math.round(size*DPR),Math.round(size*DPR)),g=c.getContext('2d'),P=ink.probe;g.scale(DPR,DPR);g.translate(size/2,size/2);g.scale(S,S);
  const L=18;g.lineJoin='round';g.lineCap='round';
  // radiator fins, glowing
  for(const s of[-1,1]){const rg=g.createLinearGradient(0,s*1.2,0,s*8.6);rg.addColorStop(0,`rgba(${P.radHi},.95)`);rg.addColorStop(1,`rgba(${P.rad},.55)`);g.fillStyle=rg;g.beginPath();g.moveTo(-.56*L,s*1.1);g.lineTo(-.46*L,s*8);g.lineTo(-.2*L,s*8);g.lineTo(-.26*L,s*1.1);g.closePath();g.fill();g.strokeStyle='rgba(40,14,6,.8)';g.lineWidth=.3;g.stroke();
    g.strokeStyle='rgba(60,20,8,.5)';g.beginPath();for(let i=1;i<4;i++){const y=s*(1.1+i*1.7);g.moveTo(-.55*L+i*.02*L,y);g.lineTo(-.25*L,y);}g.stroke();}
  // the spine
  g.fillStyle='rgb(150,154,162)';g.fillRect(-.92*L,-.7,2*L,1.4);g.strokeStyle='rgba(30,32,36,.9)';g.lineWidth=.25;g.beginPath();for(let x=-.9*L;x<1.05*L;x+=2.4){g.moveTo(x,-.7);g.lineTo(x+1.2,.7);}g.stroke();
  // the drive bell
  const bg=g.createLinearGradient(0,-4.8,0,4.8);bg.addColorStop(0,'rgb(90,92,98)');bg.addColorStop(.4,'rgb(196,198,204)');bg.addColorStop(1,'rgb(40,42,46)');g.fillStyle=bg;g.beginPath();g.moveTo(-.9*L,-1.3);g.lineTo(-1.2*L,-4.8);g.lineTo(-1.2*L,4.8);g.lineTo(-.9*L,1.3);g.closePath();g.fill();g.strokeStyle='rgba(20,22,26,.9)';g.lineWidth=.3;g.stroke();
  // three tanks
  for(const tx of[.66,.36,.06]){const tg=g.createRadialGradient(tx*L-.9,-1,0,tx*L,0,2.8);tg.addColorStop(0,'rgb(246,248,252)');tg.addColorStop(.6,'rgb(170,176,186)');tg.addColorStop(1,'rgb(60,64,72)');g.fillStyle=tg;g.beginPath();g.arc(tx*L,0,2.7,0,TAU);g.fill();g.strokeStyle='rgba(20,22,26,.85)';g.lineWidth=.3;g.stroke();}
  // the Whipple shield at the bow, seen edge-on
  g.fillStyle='rgb(214,218,226)';g.fillRect(1.08*L,-6.4,.9,12.8);g.fillStyle='rgb(150,156,166)';g.fillRect(1.16*L+.6,-5.4,.6,10.8);
  // the replication core amidships, and the plaque bolted beside it
  const cg=g.createRadialGradient(-.28*L,0,0,-.28*L,0,2.4);cg.addColorStop(0,'rgb(250,250,252)');cg.addColorStop(1,'rgb(110,114,122)');g.fillStyle=cg;g.beginPath();g.arc(-.28*L,0,2.3,0,TAU);g.fill();g.strokeStyle='rgba(20,22,26,.9)';g.lineWidth=.3;g.stroke();
  g.fillStyle=`rgb(${P.gold})`;g.fillRect(-.2*L,1.3,2.4,1.5);g.strokeStyle=`rgb(${P.goldHi})`;g.lineWidth=.2;g.strokeRect(-.2*L,1.3,2.4,1.5);
  // a thin rim of starlight along the upper edge, so the craft is never lost against the black
  g.strokeStyle='rgba(220,230,255,.4)';g.lineWidth=.3;g.beginPath();g.moveTo(-.9*L,-.9);g.lineTo(1.05*L,-.9);g.stroke();
  prbCraft={canvas:c,size,S,core:-.28*L*S};return prbCraft;
}
function prbPlayer(){
  prbDaughters();
  if(world.state==='dead')return;
  const P=ink.probe,p=world.player,sp=prbCraftSprite(),{x,y,ang}=heldPose(-22*sp.S,22*sp.S),t=reducedMotion?0:world.time;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);
  // the drive's plume while in flight: a short radiator-coloured cone from the bell
  if(world.state==='playing'&&!p.node){const fl=ctx.createLinearGradient(-22,0,-34,0);fl.addColorStop(0,`rgba(${P.radHi},.85)`);fl.addColorStop(1,`rgba(${P.rad},0)`);ctx.fillStyle=fl;ctx.beginPath();ctx.moveTo(-22,-3.2);ctx.lineTo(-34-2*Math.sin(t*20),0);ctx.lineTo(-22,3.2);ctx.closePath();ctx.fill();}
  ctx.drawImage(sp.canvas,-sp.size/2,-sp.size/2,sp.size,sp.size);
  // the Observer Core: omnidirectional, three thin rings breathing out from it rather than a beam forward
  const cx=sp.core;ctx.fillStyle=`rgb(${P.core})`;ctx.beginPath();ctx.arc(cx,0,1.5,0,TAU);ctx.fill();
  for(let i=0;i<3;i++){const f=((t*.5+i/3)%1);ctx.strokeStyle=`rgba(${P.core},${((1-f)*.45).toFixed(3)})`;ctx.lineWidth=.5;ctx.beginPath();ctx.arc(cx,0,3+f*9,0,TAU);ctx.stroke();}
  // the charges held: the shield plate as a hexagon, the sail segment as a diamond astern, the scrub as a ring of bits
  const cr=6;
  if(p.shielded){ctx.strokeStyle=`rgba(${P.white},.7)`;ctx.lineWidth=1.1;ctx.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/6;i?ctx.lineTo(Math.cos(a)*(26+cr),Math.sin(a)*(26+cr)):ctx.moveTo(Math.cos(a)*(26+cr),Math.sin(a)*(26+cr));}ctx.stroke();}
  if(p.reflectorArmed){ctx.strokeStyle=`rgba(${P.sail},.85)`;ctx.lineWidth=1.1;const q=10;ctx.beginPath();ctx.moveTo(-30,-q);ctx.lineTo(-30+q,0);ctx.lineTo(-30,q);ctx.lineTo(-30-q,0);ctx.closePath();ctx.stroke();}
  if(p.dawnArmed){ctx.fillStyle=`rgba(${P.green},.75)`;for(let i=0;i<16;i++){if(tileHash(i,3,291)<.45)continue;const a=i*TAU/16+t*.3;ctx.fillRect(Math.cos(a)*(22+cr)-1,Math.sin(a)*(22+cr)-1,2,2);}}
  ctx.restore();
}
// A daughter launched: peeling from the traveller's own line toward the top of the frame on its escape burn,
// the plaque copied onto it in miniature, the generation it is ticking over as it goes. The first is closure.
function prbDaughters(){
  if(!prbState||!prbState.launches.length)return;const P=ink.probe;
  for(const L of prbState.launches){const age=world.time-L.at,dur=3.2;if(age<0||age>dur)continue;const u=prbEase(clamp(age/dur,0,1)),x=lerp(L.x,W*(L.x<W/2?.72:.28),u),y=lerp(L.y,-40,u*u),k=age<.3?age/.3:age>dur-.5?(dur-age)/.5:1;
    ctx.save();ctx.globalAlpha=k;ctx.strokeStyle=`rgba(${P.white},.35)`;ctx.lineWidth=.8*scale;ctx.setLineDash([2*scale,3*scale]);ctx.beginPath();ctx.moveTo(L.x,L.y);ctx.quadraticCurveTo(L.x,lerp(L.y,y,.5),x,y);ctx.stroke();ctx.setLineDash([]);
    ctx.translate(x,y);ctx.rotate(-Math.PI/2+(L.x<W/2?.35:-.35)*(1-u));const s=20*scale;
    const fl=ctx.createLinearGradient(-s*1.2,0,-s*2.2,0);fl.addColorStop(0,`rgba(${P.radHi},.9)`);fl.addColorStop(1,`rgba(${P.rad},0)`);ctx.fillStyle=fl;ctx.beginPath();ctx.moveTo(-s*1.2,-s*.18);ctx.lineTo(-s*2.4,0);ctx.lineTo(-s*1.2,s*.18);ctx.fill();
    prbHull(ctx,0,0,s,{SIL:1,VOL:1,MET:1,FUEL:1},1,1);ctx.restore();
    const lab=L.gen===2?'CLOSURE · GEN 2 · ESC':'GEN '+L.gen+' · ESC';prbMono(ctx,lab,clamp(x,70,W-70),y+34*scale,Math.max(8,8.5*scale),L.gen===2?P.amber:P.white,.95*k,'center',Math.floor(age*30));}
}

// ---------- The flux: the boundary as a bitstream failing ----------
// This era's word for the boundary is the flux (ECONOMY.md): a probe is chased by its own ageing, and what fails
// behind it is the one substrate on the ladder with nothing physical to decay. A bitstream does not flake or
// fade; it flips, bit by bit, until the error rate beats the frame's own correction, and then a block does not
// decay toward anything — it reverts, all at once, to one flat null value. So above the edge the log's bytes
// are shown flipping in amber, more of them nearer the edge; at the edge whole blocks have gone flat; and below
// it there is one textureless value and nothing else, the least textured decay of all eight. Its place, rate
// and grace are read straight off the state drawDark reads, and untouched.
function prbDark(dt){
  const P=ink.probe,fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  const level=Math.floor(world.floorY/30),tick=reducedMotion?0:Math.floor(world.time*5),reach=(110+near*50)*scale,cw=Math.max(11,12*scale),ch=Math.max(8,9*scale);
  ctx.save();ctx.font=plateFace(Math.max(6,6.5*scale),'mono');ctx.textAlign='center';ctx.textBaseline='middle';
  // above the edge: the log's bytes, a few flipped in amber, thickening to whole flat blocks near the edge
  for(let row=0,yy=fy-ch;yy>fy-reach;row++,yy-=ch){const u=1-(fy-yy)/reach;
    for(let i=0,x=PRB_BAND+cw/2;x<W-PRB_BAND;i++,x+=cw){const h=tileHash(i+level*31,row,301),flip=tileHash(i,row+tick,302);
      if(h>u*1.1)continue;
      if(h<u*u*.55){ctx.fillStyle=`rgba(${P.dim},${(.35+u*.4).toFixed(3)})`;ctx.fillRect(x-cw/2+.5,yy-ch/2+.5,cw-1,ch-1);}
      else{const bad=flip<u*.35;ctx.fillStyle=bad?`rgba(${P.amber},${(.5+u*.4).toFixed(3)})`:`rgba(${P.white},${(.1+u*.3).toFixed(3)})`;ctx.fillText(Math.floor(tileHash(i,row+(bad?tick:0),303)*256).toString(16).toUpperCase().padStart(2,'0'),x,yy);}}}
  // below the edge: one flat value, no texture, no grid, nothing left to show a record was ever there
  ctx.fillStyle="rgb(17,17,19)";ctx.fillRect(0,fy,W,H-fy+10);
  // the edge: straight, square, the sharpest line in the field
  ctx.strokeStyle=`rgba(${P.white},${(.75+near*.2).toFixed(3)})`;ctx.lineWidth=Math.max(1,1.1*scale);ctx.beginPath();ctx.moveTo(0,fy);ctx.lineTo(W,fy);ctx.stroke();
  // what is lost is named plainly: the error count past what correction can hold, and the null it reverts to
  const seu=1200+((level*977)%9000+9000)%9000;
  prbMono(ctx,'THE FLUX',W-PRB_BAND-8,fy-9*scale,Math.max(9,9.5*scale),P.amber,.95,'right');
  prbMono(ctx,'SEU '+String(seu).padStart(5,'0')+' · ECC LIMIT',PRB_BAND+8,fy-9*scale,Math.max(6.5,7*scale),P.grey,.85,'left');
  for(let i=0;i<3;i++){const ly=fy+(28+i*46)*scale;if(ly>H)break;prbMono(ctx,'0x00000000 · UNCORRECTABLE',W/2,ly,Math.max(6.5,6.5*scale),P.dim,.8,'center');}
  ctx.restore();
}

// ---------- A system surveyed ----------
// Where the atlas engraves a constellation-figure, this era draws the system the three stars were read as: each
// joined to the next by an orbit's arc, the whole bracketed as a survey volume, and once complete, the system's
// name and distance set beneath it and a daughter assigned to it.
function prbMarkName(str,x,y,size){const w=prbTextWidth(str,size);markGround('caption',x-w/2-2,y-size*.62,x+w/2+2,y+size*.62);}
const prbSystemOf=chart=>PRB_SYSTEMS[((chart.catalogueIndex|0)%12+12)%12];
function prbFigure(chart){
  if(chart.stars.length<3)return;const P=ink.probe;
  const pts=chart.stars.map(s=>[sx(s.x),sy(s.y)]),ys=pts.map(p=>p[1]);if(Math.max(...ys)<-240||Math.min(...ys)>H+240)return;
  const count=chart.stars.filter(n=>n.visited).length,done=chart.completed,f=chart.expired?.3:done?1:count/3;if(f<=0)return;
  const S=prbSystemOf(chart),al=chart.expired?.35:1,pad=24*scale;let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const p of pts){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}
  x0-=pad;y0-=pad;x1+=pad;y1+=pad;
  ctx.save();ctx.globalAlpha=al;ctx.lineCap='round';
  // arcs between the stars, as far as the survey has come
  for(let i=1;i<pts.length;i++){const q=clamp(f*3-(i-1)*1.2,0,1);if(q<=0)continue;const [ax,ay]=pts[i-1],[bx,by]=pts[i],mx=(ax+bx)/2,my=(ay+by)/2,nx=-(by-ay)*.22,ny=(bx-ax)*.22;
    ctx.strokeStyle=`rgba(${P.white},${(.4*q).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.beginPath();for(let j=0;j<=16*q;j++){const t=j/16,a=1-t,px=a*a*ax+2*a*t*(mx+nx)+t*t*bx,py=a*a*ay+2*a*t*(my+ny)+t*t*by;j?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}
  ctx.strokeStyle=`rgba(${P.grey},${(.5*f).toFixed(3)})`;ctx.lineWidth=Math.max(.6,.7*scale);ctx.beginPath();const b=8*scale;for(const [bx,by,dx,dy] of[[x0,y0,1,1],[x1,y0,-1,1],[x1,y1,-1,-1],[x0,y1,1,-1]]){ctx.moveTo(bx+dx*b,by);ctx.lineTo(bx,by);ctx.lineTo(bx,by+dy*b);}ctx.stroke();
  prbMono(ctx,'SURVEY '+S[0],x0+2*scale,y0-7*scale,Math.max(7,7.5*scale),P.white,.85);
  if(done){const nx=clamp((x0+x1)/2,90,W-90),ny=y1+12*scale,sz=Math.max(8.5,9*scale),s=S[0]+' · '+S[1];prbMono(ctx,s,nx,ny,sz,P.white,.95,'center');prbMarkName(s,nx,ny,sz);prbMono(ctx,'DAUGHTER ASSIGNED',nx,ny+sz*1.3,Math.max(6.5,6.8*scale),P.green,.75,'center');}
  ctx.restore();
}
function prbChartRoute(chart){
  if(!chart.stars.length||sy(chart.entry.y)<-150||sy(chart.stars[chart.stars.length-1].y)>H+170)return;
  const P=ink.probe,points=[chart.entry,...chart.stars];if(chart.exit)points.push(chart.exit);
  ctx.save();revealChartClip(chart);ctx.lineCap='round';
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],lit=chart.completed||(a.visited&&b.visited),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
    const ax=sx(a.x+dx/d*(a.cap+10)),ay=sy(a.y+dy/d*(a.cap+10)),bx=sx(b.x-dx/d*(b.cap+10)),by=sy(b.y-dy/d*(b.cap+10));
    ctx.strokeStyle=`rgba(${lit?P.white:P.dim},${chart.expired?.12:lit?.45:.55})`;ctx.lineWidth=(lit?.7:.55)*scale;ctx.setLineDash(lit?[]:[3*scale,3*scale]);
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();}
  ctx.setLineDash([]);
  chart.stars.forEach((n,i)=>{const x=sx(n.x)-(n.r*.62+8)*scale,y=sy(n.y)-(n.r*.62+8)*scale,a=chart.expired?.2:n.visited?.85:.6;prbMono(ctx,'S'+(i+1),x,y,Math.max(7.5,8*scale),n.visited?P.white:P.grey,a,'center');});
  if(!chart.expired&&!chart.completed&&!captionsHeld()){const e=chart.stars[1]||chart.stars[0],x=sx(e.x),y=sy(e.y)+e.cap*scale+14*scale;if(y>-40&&y<H+40)prbMono(ctx,prbSystemOf(chart)[0],x,y,Math.max(7.5,8*scale),P.grey,.7,'center');}
  ctx.restore();
}

// ---------- The HUD: the self-log block ----------
// Set at the head of the sheet in the log's own hand: the mass processed as the score, on an odometer; the feed
// as a segmented gauge, amber once it will not carry a transfer; the phase and its elapsed time; the generation
// and the manifest of the daughter being built, part by part, with the four materials against their bill. The
// DOM HUD stays for screen readers and is taken off the screen (index.html).
function prbHudLeaf(){
  if(!world||world.state==='ready')return;
  if(world.won){prbFinale();return;}
  prbRun();const P=ink.probe,top=prbHudTop(),words=plateWords().hud,score=world.score|0,level=world.inkLevel(),low=level<=.34,pulse=low&&!reducedMotion?.5+.5*Math.sin(world.time*6):1,ci=prbChapterOf(world),C=PRB_CHAPTERS[ci],S=prbState;
  prbShown=prbShown<score?Math.min(score,prbShown+Math.max(.6,(score-prbShown)*.12)):score;
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  const left=PRB_BAND+10,right=W-PRB_BAND-10,cx=W/2,m=world.speedMultiplier(),pace=words.pace+(m%1?m.toFixed(1):m);
  // the mass processed
  ctx.fillStyle='rgba(3,3,3,.78)';ctx.fillRect(left-4,top-9,98,34);ctx.strokeStyle=`rgba(${P.grey},.45)`;ctx.lineWidth=.6;ctx.strokeRect(left-4,top-9,98,34);
  prbMono(ctx,'MASS · T',left,top-2,6.5,P.grey,.9);prbOdometer(ctx,prbShown,7,left-1,top+13,14,P.white,.98);
  // the feed gauge, the phase, and the pace
  const gw=Math.min(106,W*.25),gx=cx-gw/2-4,gy=top-4,cells=12;prbMono(ctx,'FEED',gx,gy-4,6.5,P.grey,.9);prbMono(ctx,String(Math.round(level*100)).padStart(3,'0')+'%',gx+gw,gy-4,6.5,low?P.amber:P.white,.9,'right');
  for(let i=0;i<cells;i++){const on=(i+1)/cells<=level+1e-6,x=gx+i*gw/cells;ctx.fillStyle=on?(low?`rgba(${P.amber},${(.55+.45*pulse).toFixed(3)})`:`rgba(${P.white},.85)`):`rgba(${P.faint},.95)`;ctx.fillRect(x+.6,gy+2,gw/cells-1.2,6);}
  const flow=world.combo>1&&world.captures>0?'  '+words.flow+world.combo:'';
  prbMono(ctx,pace+flow,gx,gy+17,6.8,P.grey,.9,'left');prbMono(ctx,'PH '+PRB_ROMAN[ci],gx+gw,gy+17,6.8,P.grey,.9,'right');
  prbMono(ctx,C.phase+' · '+C.t,gx+gw/2,gy+28,6.8,P.white,.75,'center');
  // the generation and the manifest of the next daughter
  const mw=86,mx=right-mw,my=top-9;ctx.fillStyle='rgba(3,3,3,.78)';ctx.fillRect(mx-4,my,mw+4,58);ctx.strokeStyle=`rgba(${P.grey},.45)`;ctx.strokeRect(mx-4,my,mw+4,58);
  prbMono(ctx,'GEN',mx,my+7,6.5,P.grey,.9);prbMono(ctx,String(S.gen),mx+22,my+8,11,S.gen>1?P.amber:P.white,.98);prbMono(ctx,'MANIFEST',right-2,my+7,6.5,P.grey,.9,'right');
  const fill=prbFill();prbHull(ctx,mx+mw/2-2,my+23,mw*.34,fill,0,1);
  const bill=prbBill(S.gen);PRB_MATS.forEach((mat,i)=>{const bx=mx+(i%2)*(mw/2),by=my+37+Math.floor(i/2)*10,bw=mw/2-24;prbMono(ctx,mat,bx,by,6,P.grey,.9);
    ctx.fillStyle=`rgba(${P.faint},.95)`;ctx.fillRect(bx+19,by-2,bw,4);ctx.fillStyle=fill[mat]>=1?`rgb(${P.green})`:`rgba(${P.white},.85)`;ctx.fillRect(bx+19,by-2,bw*fill[mat],4);
    ctx.fillStyle=`rgba(${P.vac},1)`;for(let q=1;q<bill[mat];q++)ctx.fillRect(bx+19+bw*q/bill[mat]-.4,by-2,.8,4);});
  // the charges held, as small part glyphs under the mass block
  let ix=left+6;const iy=top+36,p=world.player,badge=type=>{ctx.save();ctx.strokeStyle=`rgba(${P.grey},.55)`;ctx.lineWidth=.7;ctx.strokeRect(ix-9,iy-9,18,18);ctx.restore();prbGift({type,r:22},ix,iy,false,.85);ix+=22;};
  if(p.shielded)badge('shield');if(p.reflectorArmed)badge('reflector');if(p.dawnArmed)badge('dawn');
  ctx.restore();
}
// The finish: the era file's own signature sheet, closure. The manifest closes into a whole second hull,
// indistinguishable in outline from the one that built it, with the ancestral plaque copied onto it in miniature
// exactly as the original was cut; the daughter leaves on its escape burn; and beneath them the ladder itself,
// the eight marks of eight centuries' hands, the last one still a cursor, because this era does not end.
function prbFinale(){
  const P=ink.probe,time=world.player.deadTime,t=reducedMotion?1:clamp(time/1.2,0,1),e=1-Math.pow(1-t,3);
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=`rgba(${P.vac},${(.93*e).toFixed(3)})`;ctx.fillRect(0,0,W,H);
  const R=Math.min(W*.2,H*.1,84),y=lerp(H*.42,H*.33,e);
  prbMono(ctx,'CLOSURE',W/2,y-R*1.2-26,Math.min(20,W*.05),P.amber,.95*e,'center');
  prbMono(ctx,'EVERY PART OF ITSELF, BUILT FROM WHAT IT READ',W/2,y-R*1.2-9,Math.min(8,W*.019),P.grey,.9*e,'center');
  ctx.save();ctx.translate(W/2,y);ctx.globalAlpha=e;prbFrame(ctx,R,6,reducedMotion?1:clamp((time-.15)/1.4,0,1));ctx.restore();
  // the plaque, copied: the original and the copy side by side, the same line, cut once. The whole sheet is laid
  // out inside the three seconds and a bit before the leaf opens over it (WIN_END_DELAY in ui.js).
  const ps=Math.min(W*.16,60),py=y+R*1.2+ps*.66+26,ck=clamp((time-.7)/.3,0,1);
  prbMono(ctx,'THE PLAQUE · ANCESTOR AND COPY',W/2,py-ps*.66-10,7.5,P.gold,.9*ck,'center');
  prbPlaque(ctx,W/2-ps*1.15,py,ps,reducedMotion?1:clamp((time-.75)/.8,0,1),ck);prbPlaque(ctx,W/2+ps*1.15,py,ps,reducedMotion?1:clamp((time-1.15)/.8,0,1),clamp((time-1.05)/.3,0,1));
  // the ladder: eight small marks, each in its own era's manner, the eighth a blinking cursor
  const ly=py+ps*.66+34,gap=Math.min(34,W/10),lk=clamp((time-1.7)/.4,0,1);
  if(lk>0){prbMono(ctx,'THE LADDER',W/2,ly-16,7,P.grey,.85*lk,'center');
    for(let i=0;i<8;i++){const k=clamp((time-1.7-i*.08)/.25,0,1);if(k<=0)continue;const x=W/2+(i-3.5)*gap;ctx.save();ctx.globalAlpha=k;prbLadderMark(ctx,i,x,ly,7);ctx.restore();prbMono(ctx,['I','II','III','IV','V','VI','VII','VIII'][i],x,ly+13,6,P.dim,.9*k,'center');}}
  const vk=.9*clamp((time-2.5)/.4,0,1),vy=ly+36;
  prbMono(ctx,'THE FIRST HAND MARKED THE ROCK SO THE SKY WOULD OUTLAST IT.',W/2,vy,Math.min(8,W*.0185),P.white,vk,'center');
  prbMono(ctx,'THE LAST IS NOT A HAND. IT KEEPS LOOKING.',W/2,vy+14,Math.min(8,W*.0185),P.grey,vk,'center');
  ctx.restore();
}
// One mark per rung, each in its own century's material, for the finale's ladder and the Journey's leaf.
function prbLadderMark(g,i,x,y,s){
  const P=ink.probe;g.save();g.lineCap='round';
  if(i===0){g.fillStyle='rgb(176,74,46)';g.beginPath();g.ellipse(x,y,s*.55,s*.45,.3,0,TAU);g.fill();}
  else if(i===1){g.fillStyle='rgb(236,196,84)';g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?s*.22:s*.6;k?g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();g.fill();}
  else if(i===2){g.fillStyle='rgb(200,52,40)';g.beginPath();g.arc(x,y,s*.38,0,TAU);g.fill();g.strokeStyle='rgb(30,26,22)';g.lineWidth=s*.14;g.beginPath();g.moveTo(x-s*.6,y+s*.5);g.lineTo(x+s*.6,y-s*.3);g.stroke();}
  else if(i===3){g.strokeStyle='rgb(206,164,84)';g.lineWidth=s*.14;g.beginPath();g.arc(x,y,s*.55,0,TAU);g.stroke();g.beginPath();g.moveTo(x-s*.6,y);g.lineTo(x+s*.6,y);g.stroke();}
  else if(i===4){g.strokeStyle='rgb(226,214,184)';g.lineWidth=s*.1;g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;g.moveTo(x,y);g.lineTo(x+Math.cos(a)*s*.62,y+Math.sin(a)*s*.62);}g.stroke();}
  else if(i===5){g.strokeStyle='rgb(200,200,196)';g.lineWidth=s*.1;g.beginPath();g.arc(x,y,s*.55,0,TAU);g.stroke();g.fillStyle='rgb(200,200,196)';g.beginPath();g.arc(x-s*.12,y-s*.12,s*.2,0,TAU);g.fill();}
  else if(i===6){g.strokeStyle='rgb(51,255,102)';g.lineWidth=s*.09;for(let a=0;a<2;a++)for(let b=0;b<2;b++)g.strokeRect(x-s*.55+a*s*.56,y-s*.55+b*s*.56,s*.5,s*.5);}
  else{const on=reducedMotion||Math.floor(world.time*2)%2===0;if(on){g.fillStyle=`rgb(${P.white})`;g.fillRect(x-s*.3,y-s*.55,s*.6,s*1.1);}else{g.strokeStyle=`rgba(${P.white},.5)`;g.lineWidth=.6;g.strokeRect(x-s*.3,y-s*.55,s*.6,s*1.1);}}
  g.restore();
}
function prbInscriptionInk(caps){const P=ink.probe;return [{rgb:'0,0,0',alpha:caps?.6:.5,dx:.6,dy:.6},{rgb:P.white,alpha:caps?.95:.88,dx:0,dy:0}];}
// The mass on the leaf: a self-log card with the count on an odometer and the log's progress beneath it.
function prbPaintEndNumerals(canvas,w){
  if(!canvas)return;const P=ink.probe,rec=prbRead(),Wd=240,Hd=80,dpr=Math.min(Math.max(window.devicePixelRatio||1,1.5),2);
  canvas.width=Math.ceil(Wd*dpr);canvas.height=Math.ceil(Hd*dpr);canvas.style.width=Wd+'px';canvas.style.height=Hd+'px';
  const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,Wd,Hd);
  g.fillStyle='rgba(3,3,3,.96)';g.fillRect(34,4,Wd-68,50);g.strokeStyle=`rgba(${P.grey},.7)`;g.lineWidth=.8;g.strokeRect(34,4,Wd-68,50);
  g.save();g.font=plateFace(20,'mono');const cw=g.measureText('M').width*1.08;g.restore();prbOdometer(g,w.score|0,7,Wd/2-cw*3.5,24,20,P.white,.98);prbMono(g,'TONNES PROCESSED',Wd/2,44,7.5,P.grey,.9,'center');
  const gen=prbRunWorld===w&&prbState?prbState.gen:1;
  prbMono(g,'GEN '+gen+' · MAX '+Math.max(1,rec.maxGen)+' · '+prbBits(rec.classes)+'/7 CLASSES · '+prbBits(rec.systems)+'/12 SYSTEMS',Wd/2,68,6.5,P.white,.85,'center');
}
// A landing's note and its running tally, in the log's white, marked with a small bracket.
function prbNoteMark(x,y,hand,alpha){ctx.strokeStyle=`rgba(${ink.probe.white},${alpha})`;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-hand*.3,y);ctx.lineTo(x-hand*.6,y);ctx.lineTo(x-hand*.6,y+hand*1.1);ctx.lineTo(x-hand*.3,y+hand*1.1);ctx.stroke();}
function prbFloater(f,fb,alpha){
  if(!fb)return null;const size=Math.max(9.5,10.5*scale),hand=Math.max(4.5,6*scale),{x,y,left}=fb;
  ctx.fillStyle=`rgba(${ink.probe.white},${alpha})`;ctx.font=plateFace(size,'mono');ctx.textAlign=left?'left':'right';ctx.fillText(f.text,x,y);
  prbNoteMark(x+(left?-hand*1.2:hand*1.9),y-hand*.62,hand,alpha*.85);
}
function prbTally(t,tb,alpha){
  const size=Math.max(9.5,10.5*scale),size2=Math.max(8.5,9.5*scale),hand=Math.max(4.5,6*scale);
  ctx.fillStyle=`rgba(${ink.probe.white},${alpha})`;ctx.font=plateFace(size,'mono');ctx.textAlign=t.left?'left':'right';ctx.fillText(t.line1,tb.x,tb.y);
  ctx.fillStyle=`rgba(${ink.probe.grey},${alpha})`;ctx.font=plateFace(size2,'mono');ctx.fillText(t.line2,tb.x,tb.y+size*.98);
  prbNoteMark(tb.x+(t.left?-hand*1.2:hand*1.9),tb.y-hand*.62,hand,alpha*.85);
}
function prbNone(){}
function invalidateProbeArt(){prbLayers[0]=prbLayers[1]=null;prbLayerKey='';prbSprites.clear();prbCraft=null;prbCraftKey='';prbHudTopPx=null;prbRevealCanvas=null;prbRevealKey='';}
function prbFaceReady(){
  if(!document.fonts||!document.fonts.load)return;
  document.fonts.load(plateFace(16,'mono'),'GEN 0123456789').then(()=>{invalidateProbeArt();if(world)render(0);}).catch(()=>{});
}

// ---------- The machine's sound ----------
// A low reaction-wheel hum at the start; a short two-tone frame-sync chirp on every orbit insertion; a tone
// climbing and cut off cleanly for each escape burn; for the loss, the self-check chime dropping out into plain
// silence, since there is no one at the other end to lose a signal to; and a low chime, once, on closure.
defineHand('probe',{
  atmosphere:prbAtmosphere,
  node:prbNode,
  hazard:prbHazard,
  player:prbPlayer,
  dark:prbDark,
  plateFrame:prbNone,
  laid:prbNone,
  figure:prbFigure,
  surveys:prbNone,
  hudLeaf:prbHudLeaf,
  runningHead:prbNone,
  chapterReveal:prbChapterReveal,
  flourish:prbFlourish,
  trail:prbTrail,
  aim:prbAim,
  inkPath:prbInkPath,
  inscriptionInk:prbInscriptionInk,
  lenses:prbNone,
  hazardReveal:prbHazardReveal,
  ready:prbFaceReady,
  best:prbBest,
  caveRun:prbRecordRun,
  caveAnimal:i=>prbNoteSystem(i),
  chartRoute:prbChartRoute,
  floater:prbFloater,
  tally:prbTally,
  endNumerals:prbPaintEndNumerals,
  scratch:{band:[1800,1400],q:[3,3],peak:.012,attack:.002,dur:[.004,.008],gap:[.16,.22],ease:.02},
  start(a){a.tone(46,2.4,0,.1,'sine',52);a.tone(1175,.08,.3,.08,'square');a.tone(1568,.1,.4,.08,'square');},
  release(a){a.tone(330,.22,0,.07,'sine',990);},
  capture(a,row,perfect){a.tone(1046.5,.06,0,.1,'square');a.tone(1568,.08,.07,.1,'square');if(perfect)a.tone(2093,.07,.16,.06,'square');a.tone(49,.5,0,.05,'sine');},
  graze(a){a.tone(2400,.05,0,.06,'square',1800);},
  death(a){a.tone(1318.5,.3,0,.08,'sine');a.tone(1318.5,.05,.45,.03,'sine');},
  medal(a){a.tone(392,.9,0,.1);a.tone(587.33,1.2,.18,.08);},
  chapter(a,i){prbNoteChapter(i);a.tone(784,.08,0,.1,'square');a.tone(1175,.12,.1,.1,'square');a.tone(58,1.6,.05,.08,'sine');},
  dawn(a){prbNoteChapter(PRB_CHAPTERS.length-1);a.tone(49,3.2,0,.12,'sine');[392,493.88,587.33,783.99].forEach((f,i)=>a.tone(f,1.6,.2+i*.2,.07));}
});

// ---------- The vocabulary: only what this era calls differently ----------
// Wholly constructed in CCSDS/JPL mnemonic convention (08-probe.md, "Names") — short, all-caps, clipped English
// — but read as a log the probe keeps for itself: the run a phase, the chart a system, the boundary the flux.
defineVoice('probe',{
  chart:'SYSTEM',
  chartNoun:'system',
  chartVerb:'surveyed',
  chartNames:PRB_SYSTEMS.map(s=>s[0]+' · '+s[1]),
  chartSaid:'{chart} is surveyed and a daughter assigned. Sixty toward the mass. The flux holds for four seconds.',
  chapters:PRB_CHAPTERS.map(c=>c.phase),
  chapterRows:PRB_CHAPTER_ROWS,
  goalRow:PRB_GOAL_ROW,
  // Read Endless, the log goes on past closure as the era file says the last rung must: no row it is won at,
  // the sixth phase held, and the generations climbing for as long as a run survives to pay for them.
  endless:true,
  // The Journey's milestones: the crossing, the seed, and closure, two phases apiece.
  milestones:['THE CROSSING','THE SEED','CLOSURE'],
  chapterSaid:'Phase {numeral}. {name}.',
  chapterLines:[
    'Departure. The probe leaves the Sun carrying a plate cut in 1972 for Pioneer 10. Nothing aboard will ever read it.',
    'Cruise. A sail of a few metres, pushed by a beam from home, as Breakthrough Starshot proposed in 2016.',
    'Arrival. Barnard’s Star, six light-years out: the target Project Daedalus was designed to reach in fifty years.',
    'Seed. After Freitas’s REPRO of 1980, the probe drops a seed onto a world to mine it.',
    'Factory. Closure: a factory that can build every one of its own parts, as the 1980 NASA study defined it.',
    'Replication. The first daughter leaves on its own escape burn, the plaque copied onto it unread.'
  ],
  chartNotes:[
    'Barnard’s Star: the red dwarf Project Daedalus chose as its target in 1978.',
    'Alpha Centauri: the pair Breakthrough Starshot aims its gram-scale sails at.',
    'Proxima Centauri: the nearest star to the Sun. A planet in its habitable zone was found in 2016.',
    'Wolf 359: a faint red dwarf just under eight light-years away.',
    'Lalande 21185: one of the brightest red dwarfs in the northern sky, and still too faint to see without a telescope.',
    'Sirius: the brightest star in the night sky. Its white-dwarf companion was first seen in 1862.',
    'Epsilon Eridani: Project Ozma listened to it for signals in 1960. It is ringed by dust.',
    'Ross 128: a quiet red dwarf with an Earth-sized planet, found in 2017.',
    '61 Cygni: the first star whose distance was measured, by Bessel in 1838.',
    'Tau Ceti: the other star Project Ozma listened to in 1960.',
    'Luyten’s Star: a red dwarf with a planet, found in 2017, that may be temperate.',
    'TRAPPIST-1: a small star with seven Earth-sized planets, announced in 2017.'
  ],
  opening:'The probe is under way. Tap to release. Follow the trajectory solution to the next mass. Hold a body until it is catalogued; what it is made of pays toward the next daughter, and holding it refills the feed. Every flight spends feed by the distance it carries.',
  ended:'The flux overtook the log. {score} tonnes processed. Tap to begin again, or return to the atlas.',
  won:'Closure. The first daughter has left. {score} tonnes processed. Tap to begin again, or return to the atlas.',
  unrecorded:'ERA PREVIEW · NOT RECORDED',
  newRecord:'A NEW MASS RECORD',
  hazards:{vortex:'WELL',flare:'BEAM',wind:'ISM FLUX'},
  labels:{shield:'SHLD',reflector:'DEFL',dawn:'SCRUB'},
  pressures:{relaxed:'SOL III',classic:'JUPITER',hardcore:'PROXIMA B'},
  pressureSet:'DEPARTURE LOGGED · {label}',
  losses:{
    'THE DARK CAUGHT UP':'THE FLUX OVERTOOK THE LOG',
    'LEFT THE STAR CHART':'OUT OF THE SURVEY VOLUME',
    'THE ORBIT FADED':'THE RETURN WAS LOST',
    'THE NIB RAN DRY':'FEEDSTOCK EXHAUSTED',
    'DRAWN INTO A VORTEX':'LOST DOWN A WELL',
    'SEARED BY A SUNSPOT FLARE':'BURNT IN THE BEAM',
    'THE SUN ROSE':'CLOSURE'
  },
  observations:{
    perfectThree:'THREE CLEAN INSERTIONS',
    skipFive:'FIVE MASSES PASSED BY',
    maxSpeed:'FULL VELOCITY',
    graze:'A WELL GRAZED AT FULL VELOCITY',
    pureChart:'A SYSTEM SURVEYED CLEANLY',
    fortyRows:'THE FORTIETH ROW',
    threeMinutes:'THREE MINUTES UNDER WAY',
    rightAngle:'A SQUARE INSERTION'
  },
  squareLanding:'A SQUARE INSERTION',
  hud:{pace:'V ×',flow:'OI ×',shield:'SHLD HOLDS',reflector:'DEFL HOLDS',dawn:'SCRUB HOLDS'},
  chrome:{
    brand:'THE PROBE',bestLabel:'Max mass',endTitle:'The flux overtook the log.',endTitleWon:'Closure.',pauseTitle:'Dormant.',
    pauseEyebrow:'THE PROBE IS IN SAFE HOLD',pauseNote:'Tap the sheet to continue',pauseResume:'RESUME THE LOG',
    pauseLeave:'END THE LOG',pauseLabel:'Put the probe in safe hold',gameLabel:'The Probe, a playable Era VIII preview',
    canvasLabel:'The Probe. Fly a self-replicating probe from the Sun to Barnard’s Star, cataloguing each world you hold and building the next probe from what you read. Tap or press Space to release.',
    eraExit:'BACK TO THE ATLAS',eraExitLabel:'Back to the atlas',endAction:'Tap to begin again',endActionWon:'Tap to begin again',
    readings:{chronicle:'TO CLOSURE',endless:'THE ENDLESS LOG',label:'The reading: {reading}. Tap to change it'},
    statCaptures:'Catalogued',statPerfects:'Clean',statFlow:'Best OI',statRow:'Row',
    instructions:{head:'THE MISSION RULE',rules:['Tap to release the probe.','Hold a body until it is catalogued. What it is made of builds the next probe.','Stay ahead of the flux rising below.','Six phases, the Sun to the first daughter. Choose where to leave from — {pressures}.']}
  },
  tips:{
    first:'Release when the trajectory solution reaches the next mass.',
    dark:'Hold a body for velocity and feed. The flux rises faster below.',
    faded:'A decaying return will not wait. Read it and move on.',
    vortex:'A well bends the course toward it. Give its core room.',
    angle:'Meet the rim along its curve for a clean insertion.',
    speed:'Clean insertions keep your velocity.',
    won:'Closure: the probe has built its first daughter.'
  },
  glosses:{
    slingshot:'DV ASSIST · V ×{factor}',
    maxSpeed:'FULL VELOCITY · HOLD THE COURSE',
    fullCharge:'FEED FULL · VELOCITY IS YOURS',
    rough:'A ROUGH INSERTION · BASE {base}',
    skip:'{count} MASS{plural} PASSED BY · +{bonus}',
    reprieve:'SURVEY 3 STARS · +60 & A REPRIEVE',
    slingOrbit:'CIRCLE FOR A DV ASSIST · TAP TO LEAVE',
    fading:'A DECAYING RETURN · KEEP MOVING',
    golden:'A METAL-RICH BODY',
    perfectFlow:'CLEAN INSERTION · OI ×{combo}',
    perfect:'CLEAN INSERTION',
    wandering:'A DRIFTING MASS',
    chartProgress:'{chart} · {count} / 3',
    chartComplete:'{chart} · SURVEYED +60',
    angleBonus:'  ·  TRUE ENTRY +{bonus}',
    multiplier:'  ·  ×{mult}',
    shieldArmed:'{label} FITTED · TURNS ONE BLOW',
    shieldBreak:'{label} SPENT · TOOK THE HIT',
    reflectorArmed:'{label} FITTED · SENDS YOU BACK FROM THE EDGE',
    reflectorBreak:'{label} TURNED YOU BACK',
    dawnArmed:'{label} LOADED · HOLDS BACK THE FLUX',
    dawnBreak:'{label} RAN · THE FLUX FELL BACK',
    inkwellFound:'AN ISOTOPE CACHE · FEED RESTORED',
    inkwellDry:'FEED RUNS LOW · FIND AN ISOTOPE CACHE',
    observation:'LOGGED · {name}',
    close:'CLOSE +5'
  },
  held:{
    choose:'The body you leave from sets how fast the flux rises.',
    dry:'Feed is running low. Hold this body to take on more.',
    sling:'One circle is a DV assist. Meet the next cleanly and it holds.',
    release:'Release when the trajectory solution meets the next mass.',
    bend:'The well bends the course. Follow the solution; give it room.'
  }
});

// The Journey's milestones through the probe (LINKING.md): the phase the climb has reached — the plaque before
// any is known, then the sail, the factory and the daughter — over three squares filling as each is known.
defineHand('probe',{journeyMark(g,w,h,m){
  const P=ink.probe,stage=[1,2,5,6][Math.min(3,m.open)],R=Math.min(13,h*.18);
  g.save();g.translate(w/2,h*.4);prbFrame(g,R,stage,1,{bare:true});g.restore();
  for(let i=0;i<m.of;i++){const x=w/2+(i-(m.of-1)/2)*14,y=h-7;g.save();g.strokeStyle=`rgb(${P.white})`;g.lineWidth=.8;g.strokeRect(x-2.6,y-2.6,5.2,5.2);
    const f=i<m.open?1:i===m.open?m.toward:0;if(f>0){g.fillStyle=`rgb(${P.white})`;g.fillRect(x-2.6,y+2.6-5.2*f,5.2,5.2*f);}g.restore();}
}});
