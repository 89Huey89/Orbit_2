'use strict';
/* Orbit · src/flyby.js
   Era VII, The Flyby: the Solar System, 1965–2015 — Mariner 4's hand-tinted strip chart, the Viking
   landers' scanned ground, the Voyager mosaics from Jupiter to Neptune, and New Horizons at Pluto. */
// Like every other century beside the atlas, this era is a hand and not a fork: painters registered by name
// in `defineHand` below and reached wherever frame.js would otherwise draw the atlas's own, with everything
// it does not name still the atlas's. docs/archive/eras/07-flyby.md is what the era is. None of the physics
// comes with it; the simulation is and stays OrbitWorld.
//
// What the sheet argues, in one line: this is the first century whose point of view has left the Earth. Every
// era before it built a better picture of the same distant light; this one sends a machine, and the light turns
// out to have been a place the whole time. So the sheet has no ground in the old sense — no rock, no plaster,
// no paper, no glass — only vacuum, and the vacuum is drawn as what it is made of: a parallaxing star field,
// the Deep Space Network's own listening in the margins, and the odd cosmic-ray hit on the sensor.
//
// A body is never delivered whole, because a mission's picture never was. Held, it arrives as a controller
// actually sat through it: scan lines filling from the top as Mariner 4's ten-hour frames did; then a mosaic of
// separately radioed tiles locking in with their seams showing, a false-colour pass where there is a named
// reason for one; then the seams closing into one clean disc; and only then the instrument margin — a scale
// bar, a filter, and a mission label dated as the mission was. A small irregular body is a shape model instead,
// a mesh of facets closing over the side that has been imaged.
//
// It is told as a story, as the Lens and the Astrolabe are: six encounters of six rows, from Mars in 1965 to
// Pluto in 2015, and at each one's opening the frame that encounter is remembered for is drawn again behind the
// play the way it came down — the strip chart coloured by hand from its numbers, the lander's ground scanned a
// column at a time, a navigation frame with a plume off Io's limb, a star winking five times either side of
// Uranus, Neptune's dark spot, Pluto's heart in stated false colour. A run that reaches the thirty-sixth row
// lays the strip chart out as the era file's signature sheet, with the mission log beneath it. How far the log
// has ever got is kept under its own key (orbit.flyby.v1), and the frontispiece shows the furthest frame.

// ---------- The material: vacuum, and the instruments listening to it ----------
// Hexes from 07-flyby.md, "Palette": a black starker than the Lens's sensor, the vidicon's own greys, the two
// phosphor colours a period console would have drawn in, and the few named colours a false-colour pass earns.
definePlate('flyby',(()=>{const P={
  vac:'2,2,3',vacHi:'10,12,16',vid:'232,232,232',grey:'150,156,164',dim:'78,86,98',faint:'34,38,46',white:'240,244,248',
  phos:'51,255,102',phosDim:'36,140,70',amber:'255,176,0',red:'232,84,60',core:'255,247,220',
  sulphur:'236,204,64',methane:'46,84,160',haze:'160,214,220',ice:'214,228,244',tan:'214,150,96'};
  return{night:P,paper:P};})());

// ---------- The story: six encounters, one mission log ----------
// Six rows to an encounter and thirty-six to the finish, the length the Lens and the Astrolabe are measured to.
// `frame` is what that encounter is remembered for, and is what its opening draws; `when` is the date the frame
// itself carries.
const FLY_CHAPTER_ROWS=6;
const FLY_CHAPTERS=[
  {place:'MARS',year:1965,craft:'MARINER 4',when:'15 JUL 1965',reading:'A PICTURE IS A TABLE OF NUMBERS',credit:'NASA · JPL'},
  {place:'CHRYSE PLANITIA',year:1976,craft:'VIKING 1',when:'20 JUL 1976',reading:'THE GROUND, SCANNED A COLUMN AT A TIME',credit:'NASA · JPL'},
  {place:'JUPITER',year:1979,craft:'VOYAGER 1',when:'8 MAR 1979',reading:'A PLUME OFF IO’S LIMB',credit:'NASA · JPL'},
  {place:'URANUS',year:1986,craft:'VOYAGER 2',when:'24 JAN 1986',reading:'THE RINGS A STAR REVEALED IN 1977',credit:'NASA · JPL'},
  {place:'NEPTUNE',year:1989,craft:'VOYAGER 2',when:'AUG 1989',reading:'A DARK SPOT THE SIZE OF THE EARTH',credit:'NASA · JPL'},
  {place:'PLUTO',year:2015,craft:'NEW HORIZONS',when:'14 JUL 2015',reading:'ONE PASS, AND NEVER BACK',credit:'NASA · JHUAPL · SWRI'}
];
const FLY_GOAL_ROW=FLY_CHAPTERS.length*FLY_CHAPTER_ROWS;
const flyChapterOf=w=>clamp(Math.floor((w?w.progress:0)/FLY_CHAPTER_ROWS),0,FLY_CHAPTERS.length-1);
const FLY_ROMAN=['I','II','III','IV','V','VI'];
// Where a body's four stages fall on the observation clock. Early, as on the Lens: a flown run leaves most
// bodies part-way through their sweep, so the scan is done within a tenth of it and the seams closed by a little over half; only
// the instrument margin asks for the whole observation.
const FLY_STAGE={scan:[0,.1],tiles:[.1,.32],seams:[.32,.55],margin:[.55,1]};
const flySpan=(t,r)=>clamp((t-r[0])/(r[1]-r[0]),0,1);
const flyEase=t=>t*t*(3-2*t);
const FLY_UNIT=12;

// The twelve targets of the catalogue, each a real body a real mission mapped, with the one thing its record
// still carries (the notes are in the voice below); and the seven families, captioned with the mission that
// actually found each — dated as the mission was, never by resemblance. Ocean keeps its two dates apart, as
// the era file insists, and dune says plainly that its evidence came from orbiters and not a flyby.
const FLY_TARGETS=[
  ['IO','VOYAGER 1 · 1979'],['EUROPA','VOYAGER 2 · 1979'],['GANYMEDE','VOYAGER 1 · 1979'],['CALLISTO','VOYAGER 1 · 1979'],
  ['TITAN','HUYGENS · 2005'],['ENCELADUS','CASSINI · 2005'],['MIRANDA','VOYAGER 2 · 1986'],['TRITON','VOYAGER 2 · 1989'],
  ['CHARON','NEW HORIZONS · 2015'],['433 EROS','NEAR · 2000'],['ITOKAWA','HAYABUSA · 2005'],['67P','ROSETTA · 2014']];
const FLY_FAMILIES=['ocean','crater','ringed','ice','dune','volcanic','storm'];
const FLY_WORLD_NAMES={ocean:'OCEAN WORLD',crater:'CRATERED WORLD',ringed:'RINGED GIANT',ice:'ICE GIANT',dune:'DESERT WORLD',volcanic:'VOLCANIC WORLD',storm:'STORM GIANT'};
// `pass` is what the mosaic stage is labelled while it locks — a false-colour pass only where there is a named
// reason for one, the raw frame otherwise; `mission` is the caption the finished frame is sealed with.
const FLY_READINGS={
  crater:{pass:'RAW · 6-BIT',mission:'1965 · MARINER 4'},
  ringed:{pass:'OCCULTATION · 1977',mission:'1986 · VOYAGER 2'},
  volcanic:{pass:'FALSE COLOUR · SULPHUR',mission:'1979 · VOYAGER 1'},
  storm:{pass:'ENHANCED · METHANE',mission:'1989 · VOYAGER 2'},
  ice:{pass:'ENHANCED · HAZE',mission:'1986–89 · VOYAGER 2'},
  ocean:{pass:'1979 · FRACTURED ICE',mission:'1995–2003 · GALILEO · AN OCEAN?'},
  dune:{pass:'CLEAR FILTER',mission:'1971–76 · MARINER 9 · VIKING'},
  moon:{pass:'RAW',mission:'1969 · APOLLO 11'}
};
// The rendered colour of each family: most of what a controller saw arrived grey, so these are the colours a
// finished composite settles on, and the false-colour ramps are the ones a named pass reaches for.
const FLY_WORLD={
  crater:{light:[214,192,170],body:[150,122,100],dark:[40,30,24],rim:[0,0,0]},
  ocean:{light:[248,242,230],body:[210,198,178],dark:[62,56,48],rim:[0,0,0]},
  ringed:{light:[216,242,240],body:[150,202,206],dark:[28,52,58],rim:[190,236,240]},
  ice:{light:[196,232,244],body:[92,156,196],dark:[14,38,60],rim:[160,220,246]},
  dune:{light:[238,180,128],body:[182,104,60],dark:[54,26,14],rim:[236,170,130]},
  volcanic:{light:[252,238,156],body:[214,170,70],dark:[60,40,16],rim:[0,0,0]},
  storm:{light:[156,194,248],body:[52,96,190],dark:[8,20,60],rim:[140,190,255]},
  moon:{light:[226,224,218],body:[150,148,142],dark:[34,34,32],rim:[0,0,0]}
};
const FLY_FALSE={volcanic:[[10,4,0],[150,40,10],[236,150,30],[250,236,110]],storm:[[4,6,30],[30,60,170],[120,180,250],[240,250,255]],ice:[[6,24,40],[40,130,150],[160,226,220],[250,255,250]],ocean:[[40,20,12],[150,80,50],[220,200,170],[255,252,244]]};

// ---------- Small tools ----------
const flyRgb=(a,k=1)=>`rgba(${a[0]|0},${a[1]|0},${a[2]|0},${k})`;
// Anything framed as a literal downlink figure is set in IBM Plex Mono, uppercase and fixed-width, and comes
// up a whole glyph at a time behind a block cursor (`shown` glyphs so far); a numeral is never written with a
// stroke on this sheet, since a telemetry counter has never advanced any other way.
function flyMono(g,str,x,y,size,rgb,alpha,align='left',shown=Infinity){
  if(alpha<=0||!str)return;g.save();g.font=plateFace(size,'mono');g.direction='ltr';g.textAlign='left';g.textBaseline='middle';
  const cw=g.measureText('M').width,n=str.length,x0=align==='center'?x-cw*n/2:align==='right'?x-cw*n:x,k=Math.min(n,Math.max(0,shown));
  g.fillStyle=`rgba(${rgb},${alpha})`;g.fillText(str.slice(0,k),x0,y);
  if(k<n&&shown!==Infinity){g.fillStyle=`rgba(${rgb},${(alpha*.85).toFixed(3)})`;g.fillRect(x0+k*cw,y-size*.42,cw*.8,size*.84);}
  g.restore();
}
// Labels are set in a grotesque, as NASA's own graphics standard set them from 1976: Libre Franklin, an open
// Franklin Gothic, standing in for the Helvetica the era actually used.
function flyGrot(g,str,x,y,size,rgb,alpha,align='left'){
  if(alpha<=0||!str)return;g.save();g.font=plateFace(size,'grot');g.direction='ltr';g.textAlign=align;g.textBaseline='middle';g.fillStyle=`rgba(${rgb},${alpha})`;g.fillText(str,x,y);g.restore();
}
function flyTextWidth(str,size,variant){ctx.save();ctx.font=plateFace(size,variant);const w=ctx.measureText(str).width;ctx.restore();return w;}
// A reseau cross: the known mark etched into the optical path, so a frame carries its own check inside it.
function flyReseau(g,x,y,s,rgb,alpha){g.strokeStyle=`rgba(${rgb},${alpha})`;g.beginPath();g.moveTo(x-s,y);g.lineTo(x+s,y);g.moveTo(x,y-s);g.lineTo(x,y+s);g.stroke();}

// A world, lit from the upper left with its night to the lower right: albedo, the family's own marks, a
// terminator, limb darkening and, where there is air, a thin rim. Drawn once into a sprite per body.
function flyRenderWorld(g,x,y,r,family,seed){
  const C=FLY_WORLD[family]||FLY_WORLD.crater,rng=seeded(seed|0);
  g.save();g.beginPath();g.arc(x,y,r,0,TAU);g.clip();
  const al=g.createRadialGradient(x-r*.3,y-r*.35,r*.05,x,y,r*1.05);al.addColorStop(0,flyRgb(C.light));al.addColorStop(.62,flyRgb(C.body));al.addColorStop(1,flyRgb(C.dark));g.fillStyle=al;g.fillRect(x-r,y-r,r*2,r*2);
  if(family==='crater'||family==='moon'){
    if(family==='moon')for(let i=0;i<5;i++){g.fillStyle=`rgba(40,40,38,${(.22+rng()*.14).toFixed(3)})`;g.beginPath();g.ellipse(x+(rng()-.6)*r*1.1,y+(rng()-.6)*r*1.1,r*(.16+rng()*.22),r*(.12+rng()*.16),rng()*TAU,0,TAU);g.fill();}
    for(let i=0;i<18;i++){const a=rng()*TAU,d=Math.sqrt(rng())*r*.9,cr=r*(.04+rng()*rng()*.2),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d;
      g.fillStyle='rgba(16,12,10,.3)';g.beginPath();g.arc(cx+cr*.22,cy+cr*.26,cr,0,TAU);g.fill();g.fillStyle='rgba(255,248,236,.24)';g.beginPath();g.arc(cx-cr*.16,cy-cr*.2,cr*.78,0,TAU);g.fill();}}
  else if(family==='ocean'){
    // Europa's lineae: long dark reddish cracks crossing the bright ice in great arcs, and a few freckles
    g.lineCap='round';for(let i=0;i<11;i++){g.strokeStyle=`rgba(140,76,46,${(.35+rng()*.3).toFixed(3)})`;g.lineWidth=r*(.018+rng()*.03);g.beginPath();const cx=x+(rng()-.5)*r*3,cy=y+(rng()-.5)*r*3,rr=r*(1+rng()*1.6),a0=rng()*TAU;g.arc(cx,cy,rr,a0,a0+.5+rng()*.9);g.stroke();}
    for(let i=0;i<14;i++){g.fillStyle='rgba(150,90,60,.3)';g.beginPath();g.arc(x+(rng()-.5)*r*1.8,y+(rng()-.5)*r*1.8,r*(.02+rng()*.04),0,TAU);g.fill();}}
  else if(family==='ringed'||family==='ice'){
    for(let i=0;i<6;i++){g.fillStyle=`rgba(255,255,255,${(.03+rng()*.05).toFixed(3)})`;g.beginPath();g.ellipse(x,y+(-.8+i*.32)*r,r*1.1,r*.07,0,0,TAU);g.fill();}
    const cap=g.createRadialGradient(x-r*.2,y-r*.25,0,x-r*.2,y-r*.25,r*.55);cap.addColorStop(0,'rgba(255,255,255,.22)');cap.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=cap;g.fillRect(x-r,y-r,r*2,r*2);}
  else if(family==='dune'){
    for(let i=0;i<7;i++){g.fillStyle=`rgba(${C.dark.join(',')},${(.18+rng()*.2).toFixed(3)})`;g.beginPath();g.ellipse(x+(rng()-.5)*r*1.3,y+(rng()-.35)*r*1.2,r*(.14+rng()*.24),r*(.05+rng()*.1),rng()*TAU,0,TAU);g.fill();}
    g.strokeStyle='rgba(60,28,14,.28)';g.lineWidth=r*.025;for(let i=0;i<9;i++){const yy=y+(rng()-.3)*r;g.beginPath();g.moveTo(x-r,yy);g.quadraticCurveTo(x,yy+(rng()-.5)*r*.3,x+r,yy+(rng()-.5)*r*.2);g.stroke();}
    g.fillStyle='rgba(255,252,246,.85)';g.beginPath();g.ellipse(x-r*.06,y-r*.9,r*.34,r*.13,-.1,0,TAU);g.fill();}
  else if(family==='volcanic'){
    // Io in its own colours: sulphur yellows, orange flows, black vents and one red ring round the largest
    for(let i=0;i<14;i++){const px=x+(rng()-.5)*r*1.8,py=y+(rng()-.5)*r*1.8,rr=r*(.05+rng()*.16);g.fillStyle=rng()<.4?`rgba(230,120,40,${(.35+rng()*.3).toFixed(3)})`:`rgba(250,246,210,${(.25+rng()*.3).toFixed(3)})`;g.beginPath();g.arc(px,py,rr,0,TAU);g.fill();}
    for(let i=0;i<7;i++){g.fillStyle='rgba(20,12,8,.8)';g.beginPath();g.arc(x+(rng()-.5)*r*1.5,y+(rng()-.5)*r*1.5,r*(.02+rng()*.05),0,TAU);g.fill();}
    const vx=x+r*.2,vy=y+r*.15;g.strokeStyle='rgba(196,70,34,.6)';g.lineWidth=r*.07;g.beginPath();g.ellipse(vx,vy,r*.3,r*.26,0,0,TAU);g.stroke();g.fillStyle='rgba(20,12,8,.9)';g.beginPath();g.arc(vx,vy,r*.05,0,TAU);g.fill();}
  else if(family==='storm'){
    // Neptune in 1989: faint bands, the Great Dark Spot at the lower left with a white companion cloud on its
    // edge, and the fast small cloud Voyager's team called the scooter
    for(let i=0;i<5;i++){g.fillStyle=`rgba(${i%2?'20,40,120':'140,180,250'},.12)`;g.beginPath();g.ellipse(x,y+(-.7+i*.35)*r,r*1.1,r*.08,0,0,TAU);g.fill();}
    g.fillStyle='rgba(10,20,70,.72)';g.beginPath();g.ellipse(x-r*.25,y+r*.32,r*.3,r*.14,-.08,0,TAU);g.fill();
    g.fillStyle='rgba(250,252,255,.8)';g.beginPath();g.ellipse(x-r*.25,y+r*.49,r*.18,r*.04,-.05,0,TAU);g.fill();
    g.fillStyle='rgba(250,252,255,.7)';g.beginPath();g.ellipse(x-r*.02,y+r*.62,r*.07,r*.03,0,0,TAU);g.fill();
    g.strokeStyle='rgba(250,252,255,.35)';g.lineWidth=r*.025;g.beginPath();g.moveTo(x+r*.1,y-r*.35);g.lineTo(x+r*.62,y-r*.4);g.stroke();}
  const lx=-.62,ly=-.78,tg=g.createLinearGradient(x+lx*r,y+ly*r,x-lx*r,y-ly*r);
  tg.addColorStop(0,'rgba(0,0,0,0)');tg.addColorStop(.52,'rgba(0,0,0,.04)');tg.addColorStop(.74,'rgba(0,0,0,.66)');tg.addColorStop(1,'rgba(0,0,0,.96)');g.fillStyle=tg;g.fillRect(x-r,y-r,r*2,r*2);
  const ld=g.createRadialGradient(x,y,r*.55,x,y,r);ld.addColorStop(0,'rgba(0,0,0,0)');ld.addColorStop(1,'rgba(0,0,0,.34)');g.fillStyle=ld;g.fillRect(x-r,y-r,r*2,r*2);
  g.restore();
  if(C.rim[0]||C.rim[1]||C.rim[2]){g.save();g.lineCap='round';const a0=Math.PI*1.02,a1=Math.PI*1.7,rg=g.createLinearGradient(x+Math.cos(a0)*r,y+Math.sin(a0)*r,x+Math.cos(a1)*r,y+Math.sin(a1)*r);
    rg.addColorStop(0,flyRgb(C.rim,0));rg.addColorStop(.4,flyRgb(C.rim,.5));rg.addColorStop(.65,flyRgb(C.rim,.45));rg.addColorStop(1,flyRgb(C.rim,0));
    g.strokeStyle=rg;g.lineWidth=Math.max(.6,r*.05);g.beginPath();g.arc(x,y,r*1.005,a0,a1);g.stroke();g.restore();}
}
// Uranus's rings as Voyager 2 met them in 1986, with the planet's pole turned nearly to the Sun: narrow and
// dark, seen almost face-on as a bullseye, the outermost (epsilon) the brightest. Drawn in two halves so the
// far half goes behind the globe.
function flyRings(g,x,y,r,half,k=1){
  if(k<=0)return;g.save();g.translate(x,y);g.rotate(-.35);const fl=.72;
  g.beginPath();if(half==='back')g.rect(-r*3,-r*3,r*6,r*3);else g.rect(-r*3,0,r*6,r*3);g.clip();
  const rings=[[1.45,.5],[1.52,.35],[1.6,.45],[1.7,.4],[1.92,.95]];
  for(const [a,al] of rings){g.strokeStyle=`rgba(226,236,238,${(al*k).toFixed(3)})`;g.lineWidth=Math.max(.35,r*(a>1.8?.05:.022));g.beginPath();g.ellipse(0,0,a*r,a*r*fl,0,0,TAU);g.stroke();}
  g.restore();
}

// ---------- A body's picture, and the three states it passes through on the way home ----------
// Each world is baked once as its finished colour composite, and taken from that into the two states that came
// before it: the raw frame, in the vidicon's greys and at a coarse raster; and, where a family earns one, a
// false-colour pass along a named ramp. getImageData can be refused (a tainted or a stub canvas), and then the
// finished composite stands in for both, so a body is never left undrawn.
const flyArts=new Map();
function flyDerive(src,family){
  const g=src.getContext('2d');if(!g||!g.getImageData)return {mono:null,falsec:null,raw:null};
  let im;try{im=g.getImageData(0,0,src.width,src.height);}catch(_){return {mono:null,falsec:null,raw:null};}if(!im||!im.data)return {mono:null,falsec:null,raw:null};
  const W0=src.width,H0=src.height,make=()=>{const c=makeCanvas(W0,H0),cg=c.getContext('2d');return[c,cg,cg.createImageData?cg.createImageData(W0,H0):null];};
  const [mc,mg,mo]=make();if(!mo)return {mono:null,falsec:null,raw:null};
  const ramp=FLY_FALSE[family],[fc,fg,fo]=ramp?make():[null,null,null],s=im.data,d=mo.data,f=fo?fo.data:null;
  for(let i=0;i<s.length;i+=4){const L=(s[i]*.3+s[i+1]*.59+s[i+2]*.11)/255,a=s[i+3];
    // six bits: sixty-four levels of grey, which is what Mariner's own pixels carried
    const q=Math.round(L*63)/63*236;d[i]=d[i+1]=d[i+2]=q;d[i+3]=a;
    if(f){const t=clamp(L*1.25,0,1)*(ramp.length-1),j=Math.min(ramp.length-2,Math.floor(t)),u=t-j;for(let c=0;c<3;c++)f[i+c]=lerp(ramp[j][c],ramp[j+1][c],u);f[i+3]=a;}}
  mg.putImageData(mo,0,0);if(fo)fg.putImageData(fo,0,0);
  // the raw frame as it first came down: a coarse raster of the same greys, read out a line at a time
  const rows=Math.max(8,Math.round(H0/(4.5*DPR))),cols=Math.max(8,Math.round(W0/(4.5*DPR))),rc=makeCanvas(cols,rows),rg=rc.getContext('2d');rg.imageSmoothingEnabled=true;rg.drawImage(mc,0,0,cols,rows);
  return {mono:mc,falsec:fc,raw:rc};
}
function flyBodyArt(n,family,R){
  const key=n.id+':'+family+':'+R.toFixed(1)+':'+DPR;let a=flyArts.get(key);if(a)return a;
  // The raw frame and the mosaic are of the globe alone: a ringed world's rings are only the star's winks until
  // the composite comes down, so they are laid on that alone.
  const S=Math.ceil(R*(family==='ringed'?4.4:2.6)),mk=()=>{const c=makeCanvas(Math.round(S*DPR),Math.round(S*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);return[c,g];};
  const [c0,g0]=mk();flyRenderWorld(g0,S/2,S/2,R,family,(n.seed|0)^0x1965);const der=flyDerive(c0,family);let c=c0;
  if(family==='ringed'){const [c1,g1]=mk();flyRings(g1,S/2,S/2,R,'back');g1.setTransform(1,0,0,1,0,0);g1.drawImage(c0,0,0);g1.setTransform(DPR,0,0,DPR,0,0);flyRings(g1,S/2,S/2,R,'front');c=c1;}
  a={canvas:c,size:S,...der};if(flyArts.size>36)flyArts.delete(flyArts.keys().next().value);flyArts.set(key,a);return a;
}
// A tile order is dealt once per body, so its mosaic always locks in the same sequence.
function flyTileOrder(seed,n){const o=[...Array(n).keys()],r=seeded((seed|0)^0x1979);for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));[o[i],o[j]]=[o[j],o[i]];}return o;}

// The picture itself, at any size, as far as `d` has brought it home. Used for a held body on the chart, for the
// opening choice, and inside the chapter frames and the finale.
function flyPicture(g,art,x,y,R,d,family,seed,opts={}){
  const S=art.size,s1=flySpan(d,FLY_STAGE.scan),s2=flySpan(d,FLY_STAGE.tiles),s3=flySpan(d,FLY_STAGE.seams),x0=x-S/2,y0=y-S/2;
  const mono=art.mono||art.canvas,late=art.falsec&&FLY_FALSE[family]?art.falsec:mono;
  g.save();
  // Stage one: the raw raster, filled from the top a line at a time, its line pitch visible, the scan head bright.
  if(s2<1&&s1>0&&art.raw){const top=y0,h=S*s1;g.save();g.beginPath();g.rect(x0,top,S,h);g.clip();g.imageSmoothingEnabled=false;g.globalAlpha*=.92*(1-s2);g.drawImage(art.raw,x0,y0,S,S);g.restore();
    const rows=art.raw.height,pitch=S/rows;g.fillStyle='rgba(0,0,0,.55)';for(let i=1;i<rows*s1;i++)g.fillRect(x0,top+i*pitch-pitch*.18,S,Math.max(.4,pitch*.28));
    if(s1<1){g.fillStyle=`rgba(${ink.flyby.white},.7)`;g.fillRect(x0+S*.15,top+h-.6,S*.7,1.2);}}
  else if(s2<1&&s1>0){g.save();g.globalAlpha*=s1*.6;g.drawImage(mono,x0,y0,S,S);g.restore();}
  // Stage two: the mosaic. Each tile is a separate radioed frame, laid over the raster in a dealt order, a shade
  // off its neighbours, with the seams between them showing; stage three closes the seams into one disc.
  if(s2>0){const n=opts.grid||3,N=n*n,order=flyTileOrder(seed,N),tw=S/n,lock=s2*N,fade=1-s3;
    for(let k=0;k<N;k++){const t=order[k],on=clamp(lock-k,0,1);if(on<=0)continue;const tx=x0+(t%n)*tw,ty=y0+Math.floor(t/n)*tw,off=(tileHash(seed,t,5)-.5)*.3*fade;
      // each tile a shade off its neighbours, as separately exposed frames are, until the seams close
      g.save();g.beginPath();g.rect(tx,ty,tw,tw);g.clip();g.globalAlpha*=on*(1-Math.max(0,-off));g.drawImage(fade>0?late:mono,x0,y0,S,S);
      if(off>.01){g.globalCompositeOperation='lighter';g.globalAlpha=on*off;g.drawImage(fade>0?late:mono,x0,y0,S,S);}
      g.restore();}
    if(fade>0){g.strokeStyle=`rgba(0,0,0,${(.8*fade).toFixed(3)})`;g.lineWidth=Math.max(.5,R*.04);g.beginPath();for(let i=1;i<n;i++){g.moveTo(x0+i*tw,y0+S*.08);g.lineTo(x0+i*tw,y0+S*.92);g.moveTo(x0+S*.08,y0+i*tw);g.lineTo(x0+S*.92,y0+i*tw);}g.stroke();}
    // the colour composite arriving as the seams close — the last step, never the first
    if(s3>0){g.globalAlpha*=flyEase(s3);g.drawImage(art.canvas,x0,y0,S,S);}}
  g.restore();
}
// A small irregular body cannot be a lit sphere with a terminator: a mission fits a polyhedral mesh to its
// images instead. The mesh is dealt from the body's seed — an outline of lumpy radii, an inner ring, a centre —
// and its facets close over the side already imaged, from the sunward side across, while the rest stays open
// wireframe. A comet is two lobes, after 67P.
function flyMeshTris(seed,R,ox=0,oy=0,sx=1){
  const N=16,out=[],inn=[],tris=[];
  for(let i=0;i<N;i++){const a=i/N*TAU,rr=R*(.78+tileHash(seed,i,31)*.34);out.push([ox+Math.cos(a)*rr*sx,oy+Math.sin(a)*rr]);}
  for(let i=0;i<8;i++){const a=(i+.5)/8*TAU,rr=R*(.44+tileHash(seed,i,32)*.18);inn.push([ox+Math.cos(a)*rr*sx,oy+Math.sin(a)*rr]);}
  const c=[ox+(tileHash(seed,1,33)-.5)*R*.2,oy+(tileHash(seed,2,33)-.5)*R*.2];
  for(let i=0;i<N;i++){const j=Math.floor(i/2);tris.push([out[i],out[(i+1)%N],inn[j]]);if(i%2)tris.push([out[(i+1)%N],inn[j],inn[(j+1)%8]]);}
  for(let j=0;j<8;j++)tris.push([inn[j],inn[(j+1)%8],c]);
  return tris.map((t,k)=>{const mx=(t[0][0]+t[1][0]+t[2][0])/3,my=(t[0][1]+t[1][1]+t[2][1])/3,nx=(mx-ox)/(R*sx),ny=(my-oy)/R,nz=Math.sqrt(Math.max(.05,1-nx*nx-ny*ny)),lam=clamp(-.6*nx-.7*ny+.45*nz,0,1)*.85+.15*tileHash(seed,k,34);return{t,mx,lam};});
}
function flyMesh(g,x,y,R,seed,d,comet,col){
  const tris=comet?[...flyMeshTris(seed,R*.72,-R*.3,R*.08,1.1),...flyMeshTris(seed^77,R*.5,R*.62,-R*.22,1)]:flyMeshTris(seed,R,0,0,1.45);
  const xs=tris.map(t=>t.mx),lo=Math.min(...xs),hi=Math.max(...xs),closed=flyEase(clamp(d*1.25,0,1));
  g.save();g.translate(x,y);g.lineJoin='round';
  for(const f of tris){const u=(f.mx-lo)/((hi-lo)||1);const k=clamp((closed*1.2-u)*5,0,1);
    g.beginPath();g.moveTo(f.t[0][0],f.t[0][1]);g.lineTo(f.t[1][0],f.t[1][1]);g.lineTo(f.t[2][0],f.t[2][1]);g.closePath();
    if(k>0){const v=Math.round(lerp(20,col[0],f.lam)),w=Math.round(lerp(20,col[1],f.lam)),z=Math.round(lerp(22,col[2],f.lam));g.fillStyle=`rgba(${v},${w},${z},${k.toFixed(3)})`;g.fill();}
    g.strokeStyle=`rgba(${ink.flyby.phos},${(.55*(1-k)+.08).toFixed(3)})`;g.lineWidth=Math.max(.3,R*.025);g.stroke();}
  g.restore();
}

// ---------- The mission log, kept across runs ----------
// A small record under its own key, apart from the atlas's ledger: the furthest encounter any run has reached,
// how often the log was finished, the best downlink, and — as the era's own mission log — which of the seven
// families have ever been mapped and which of the twelve targets. Blocked or corrupt storage reads as empty.
const FLY_KEY='orbit.flyby.v1';
function flyRead(){
  let raw=null;try{raw=JSON.parse(storage.get(FLY_KEY,'null'));}catch(_){raw=null;}
  const n=(v,max)=>clamp(Math.floor(Number(v)||0),0,max);
  return{v:1,furthest:n(raw&&raw.furthest,FLY_CHAPTERS.length-1),completed:n(raw&&raw.completed,1e6),best:n(raw&&raw.best,1e9),runs:n(raw&&raw.runs,1e9),worlds:n(raw&&raw.worlds,127),targets:n(raw&&raw.targets,4095)};
}
function flyWrite(r){try{storage.set(FLY_KEY,JSON.stringify(r));}catch(_){}}
function flyNoteChapter(i){const r=flyRead();if(i>r.furthest){r.furthest=i;flyWrite(r);flySprites.clear();}}
function flyNoteWorld(family){const i=FLY_FAMILIES.indexOf(family);if(i<0)return;const r=flyRead();if(!(r.worlds&(1<<i))){r.worlds|=1<<i;flyWrite(r);}}
function flyNoteTarget(i){const r=flyRead(),b=1<<(((i|0)%12+12)%12);if(!(r.targets&b)){r.targets|=b;flyWrite(r);}}
function flyRecordRun(w){
  const r=flyRead();r.runs++;r.best=Math.max(r.best,w.score|0);if(w.won)r.completed++;
  r.furthest=Math.max(r.furthest,Math.min(FLY_CHAPTERS.length-1,Math.floor(w.progress/FLY_CHAPTER_ROWS)));flyWrite(r);flySprites.clear();
}
const flyBest=()=>flyRead().best;
const flyBits=v=>{let c=0;while(v){c+=v&1;v>>>=1;}return c;};
const flySprites=new Map();

// ---------- The ground: vacuum, stars at three depths, and the network listening ----------
// Three star layers, each baked once as a tile of transparent sky and laid at its own fraction of the camera's
// rate, so the field parallaxes against the craft's own motion — the depth an optical-navigation frame carries
// for nothing. The farthest carries a faint band of the galaxy; the nearest a few bright stars only.
const FLY_TILE=900,FLY_DEPTHS=[.18,.42,.8];
const flyLayers=[null,null,null];let flyLayerKey='';
function flyWrapDot(g,x,y,TH,draw){draw(x,y);if(y<24)draw(x,y+TH);if(y>TH-24)draw(x,y-TH);}
function flyBakeLayer(k){
  const TH=FLY_TILE,pw=Math.max(1,Math.round(W*DPR)),ph=Math.round(TH*DPR),c=makeCanvas(pw,ph),g=c.getContext('2d');g.scale(DPR,DPR);const r=seeded(701+k*13);
  // the farthest layer is laid on the vacuum itself, so the black costs no fill of its own each frame
  if(k===0){g.fillStyle=`rgb(${ink.flyby.vac})`;g.fillRect(0,0,W,TH);}
  if(k===0){const a=-.5,cx=W*.5,cy=TH*.5;g.save();g.translate(cx,cy);g.rotate(a);
    for(let i=0;i<40;i++){const px=(r()-.5)*W*2.2,py=(r()-.5)*70,rr=30+r()*70,gg=g.createRadialGradient(px,py,0,px,py,rr);gg.addColorStop(0,'rgba(170,180,210,.035)');gg.addColorStop(1,'rgba(170,180,210,0)');g.fillStyle=gg;g.fillRect(px-rr,py-rr,rr*2,rr*2);}
    g.restore();}
  const count=[W*TH/900,W*TH/2600,W*TH/14000][k];
  for(let i=0;i<Math.round(count);i++){const x=r()*W,y=r()*TH,m=Math.pow(r(),k===2?1.5:3),rr=[.35,.5,.7][k]+m*[.5,.9,1.6][k],warm=r(),a=[.35,.55,.8][k]*(.4+m*.6);
    const tone=warm<.15?'255,222,190':warm<.4?'206,222,255':'240,244,250';
    flyWrapDot(g,x,y,TH,(px,py)=>{if(rr>1.1){const sg=g.createRadialGradient(px,py,0,px,py,rr*2.4);sg.addColorStop(0,`rgba(${tone},${a.toFixed(3)})`);sg.addColorStop(.35,`rgba(${tone},${(a*.35).toFixed(3)})`);sg.addColorStop(1,`rgba(${tone},0)`);g.fillStyle=sg;g.beginPath();g.arc(px,py,rr*2.4,0,TAU);g.fill();}
      else{g.fillStyle=`rgba(${tone},${a.toFixed(3)})`;g.fillRect(px-rr*.5,py-rr*.5,rr,rr);}});}
  return c;
}
function flyLayer(k){
  const key=W+'x'+DPR;if(flyLayerKey!==key){flyLayers[0]=flyLayers[1]=flyLayers[2]=null;flyLayerKey=key;}
  if(!flyLayers[k])flyLayers[k]=flyBakeLayer(k);return flyLayers[k];
}
// The Deep Space Network's margins: down the left edge a carrier's signal-to-noise trace, down the right the
// Doppler residual, both scrolling as the craft climbs, so the black is never only black but always being
// listened to. They are kept faint, well under anything a transfer is read from.
const FLY_BAND=14;
function flyMargins(){
  const P=ink.flyby,B=FLY_BAND,t=reducedMotion?0:world.time,cam=world.cameraY;
  ctx.save();
  for(const side of[-1,1]){const x0=side<0?0:W-B,inner=side<0?B:W-B;
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x0,0,B,H);ctx.strokeStyle=`rgba(${P.phosDim},.35)`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(inner,0);ctx.lineTo(inner,H);ctx.stroke();
    // graticule ticks every ten units of climb, a longer one every fifty
    const first=Math.floor((cam-40)/FLY_UNIT),last=Math.ceil((cam+H/scale+40)/FLY_UNIT);ctx.beginPath();
    for(let k=first;k<=last;k++){const y=sy(k*FLY_UNIT);if(y<-4||y>H+4)continue;const L=k%10===0?B*.5:k%5===0?B*.32:B*.16;ctx.moveTo(inner,y);ctx.lineTo(inner-side*L,y);}
    ctx.strokeStyle=`rgba(${P.dim},.7)`;ctx.lineWidth=.5;ctx.stroke();
    // the trace: SNR on the left, a Doppler residual on the right, read off world height so it scrolls with the climb
    ctx.beginPath();for(let y=0;y<=H;y+=4){const wy=(y-plateShift.y)/scale+cam,v=side<0?.55+.25*Math.sin(wy*.021)+.12*Math.sin(wy*.093+1.3)+.06*Math.sin(wy*.31+t*2):.5+.2*Math.sin(wy*.013+2)+.1*Math.sin(wy*.061),xx=x0+B*(side<0?clamp(v,0,1):1-clamp(v,0,1))*.8+B*.1;y?ctx.lineTo(xx,y):ctx.moveTo(xx,y);}
    ctx.strokeStyle=`rgba(${P.phos},${side<0?.3:.2})`;ctx.lineWidth=.7;ctx.stroke();
    for(let k=first;k<=last;k++){if(((k%50)+50)%50)continue;const y=sy(k*FLY_UNIT);if(y<-10||y>H+10)continue;ctx.save();ctx.translate(side<0?B*.32:W-B*.32,y);ctx.rotate(side<0?-Math.PI/2:Math.PI/2);
      flyMono(ctx,side<0?'SNR':'DOP',0,0,5.5,P.dim,.9,'center');ctx.restore();}}
  ctx.restore();
}
// A cosmic-ray hit: the rare bright pixel or short streak a deep-space camera's sensor records whenever a
// particle passes through it. A few are dealt per half-second off the run's clock; reduced motion shows none.
function flyCosmicRays(){
  if(reducedMotion)return;const t=world.time,bucket=Math.floor(t*2),P=ink.flyby;
  for(let b=bucket-1;b<=bucket;b++)for(let i=0;i<2;i++){if(tileHash(b,i,51)>.42)continue;const born=b/2+tileHash(b,i,52)*.5,age=t-born;if(age<0||age>.3)continue;
    const x=FLY_BAND+tileHash(b,i,53)*(W-FLY_BAND*2),y=tileHash(b,i,54)*H,a=(1-age/.3)*.85,L=tileHash(b,i,55)<.5?0:3+tileHash(b,i,56)*9,ang=tileHash(b,i,57)*TAU;
    ctx.fillStyle=`rgba(${P.white},${a.toFixed(3)})`;if(!L)ctx.fillRect(Math.round(x),Math.round(y),1.4,1.4);
    else{ctx.strokeStyle=`rgba(${P.white},${(a*.8).toFixed(3)})`;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(ang)*L,y+Math.sin(ang)*L);ctx.stroke();}}
}
function flyAtmosphere(){
  plateShift.x=0;plateShift.y=0;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  for(let k=0;k<3;k++){const th=FLY_TILE,phase=(((-world.cameraY*scale*FLY_DEPTHS[k])%th)+th)%th,tile=flyLayer(k);for(let y=phase-th;y<H+th;y+=th)ctx.drawImage(tile,0,Math.round(y*DPR));}
  ctx.restore();
  flyMargins();flyCosmicRays();flyTitleMark();
}

// ---------- The six frames: what each encounter is remembered for ----------
// One function draws each chapter's frame, at any size, so the frontispiece, a chapter opening, the finale and
// the Journey's milestones are the same drawing at different stages. `stage` is 1 to 6; `k` 0–1 is how far the
// frame has come down, in the manner that frame actually arrived. Each carries its own black field and a
// typed header, and only once whole does its instrument margin — scale bar and credit — arrive.
const FLY_CHART_COLS=12,FLY_CHART_ROWS=8;
// Mariner 4's pastels: the strip chart's own improvised ramp, from the pale limb to the dark sky
const FLY_PASTELS=['40,30,26','96,56,40','152,88,56','196,130,82','224,176,120','242,214,168','250,236,208'];
function flyChartValue(c,r){const u=c/(FLY_CHART_COLS-1),v=r/(FLY_CHART_ROWS-1),d=Math.hypot(u-1.35,v-1.55)-1.05;return d>0?Math.max(0,Math.round(4+tileHash(c,r,61)*5-d*30)):Math.round(clamp(26-d*70+tileHash(c,r,62)*6,8,63));}
const flyPicArts=new Map();
function flyStageArt(stage,R){
  const key=stage+':'+R.toFixed(1)+':'+DPR;let a=flyPicArts.get(key);if(a)return a;
  const fam=stage===3?'volcanic':stage===4?'ringed':stage===5?'storm':'crater',S=Math.ceil(R*(fam==='ringed'?4.4:2.6)),c=makeCanvas(Math.round(S*DPR),Math.round(S*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);
  if(stage===6){// Pluto, in New Horizons' enhanced colour: tan-orange ground and the pale heart of Tombaugh Regio
    g.save();g.beginPath();g.arc(S/2,S/2,R,0,TAU);g.clip();const al=g.createRadialGradient(S/2-R*.3,S/2-R*.3,R*.05,S/2,S/2,R*1.05);al.addColorStop(0,'rgb(236,206,168)');al.addColorStop(.6,'rgb(190,130,86)');al.addColorStop(1,'rgb(60,36,22)');g.fillStyle=al;g.fillRect(0,0,S,S);
    g.fillStyle='rgba(92,40,26,.7)';g.beginPath();g.ellipse(S/2-R*.3,S/2+R*.5,R*.7,R*.22,.2,0,TAU);g.fill();
    g.fillStyle='rgba(236,240,248,.9)';const hx=S/2+R*.15,hy=S/2+R*.1;g.beginPath();g.moveTo(hx,hy+R*.42);g.bezierCurveTo(hx-R*.55,hy+R*.05,hx-R*.5,hy-R*.4,hx-R*.18,hy-R*.36);g.bezierCurveTo(hx-R*.05,hy-R*.34,hx,hy-R*.22,hx,hy-R*.16);g.bezierCurveTo(hx,hy-R*.26,hx+R*.12,hy-R*.36,hx+R*.26,hy-R*.33);g.bezierCurveTo(hx+R*.52,hy-R*.28,hx+R*.46,hy+R*.08,hx,hy+R*.42);g.fill();
    g.fillStyle='rgba(180,210,236,.45)';g.beginPath();g.ellipse(hx-R*.2,hy,R*.2,R*.26,0,0,TAU);g.fill();
    const tg=g.createLinearGradient(S/2-R*.6,S/2-R*.8,S/2+R*.6,S/2+R*.8);tg.addColorStop(.55,'rgba(0,0,0,0)');tg.addColorStop(1,'rgba(0,0,0,.8)');g.fillStyle=tg;g.fillRect(0,0,S,S);g.restore();}
  else flyRenderWorld(g,S/2,S/2,R,fam,1965+stage);
  const der=flyDerive(c,stage===6?'ocean':fam);
  if(fam==='ringed'){const c1=makeCanvas(c.width,c.height),g1=c1.getContext('2d');g1.scale(DPR,DPR);flyRings(g1,S/2,S/2,R,'back');g1.setTransform(1,0,0,1,0,0);g1.drawImage(c,0,0);g1.setTransform(DPR,0,0,DPR,0,0);flyRings(g1,S/2,S/2,R,'front');a={canvas:c1,size:S,...der};}
  else a={canvas:c,size:S,...der};if(flyPicArts.size>14)flyPicArts.clear();flyPicArts.set(key,a);return a;
}
function flyFrame(g,R,stage,k=1,opts={}){
  const P=ink.flyby,e=clamp(k,0,1),w=R*3.4,h=R*2.4,C=FLY_CHAPTERS[stage-1],hs=Math.max(5.5,R*.1);
  g.save();g.fillStyle=`rgba(${P.vac},${opts.clear?0:.96})`;g.fillRect(-w/2,-h/2,w,h);g.strokeStyle=`rgba(${P.grey},.55)`;g.lineWidth=Math.max(.5,R*.012);g.strokeRect(-w/2,-h/2,w,h);
  g.beginPath();g.rect(-w/2,-h/2,w,h);g.clip();
  const ix=-w/2+R*.12,iy=-h/2+R*.3,iw=w-R*.24,ih=h-R*.46;
  if(stage===1){
    // The strip chart: the teletype's numbers laid out in a grid, and pastels rubbed over them by hand, cell by
    // cell in reading order, keyed by value — a data table made legible, not a photograph
    const cw=iw/FLY_CHART_COLS,ch=ih/FLY_CHART_ROWS,N=FLY_CHART_COLS*FLY_CHART_ROWS,num=clamp(e*1.6,0,1)*N,tint=clamp(e*1.5-.4,0,1)*N;
    g.fillStyle='rgba(246,240,226,.95)';g.fillRect(ix,iy,iw,ih);
    for(let i=0;i<N;i++){const c=i%FLY_CHART_COLS,r=Math.floor(i/FLY_CHART_COLS),v=flyChartValue(c,r),x=ix+c*cw,y=iy+r*ch;
      if(i<tint){const band=clamp(Math.floor(v/10),0,FLY_PASTELS.length-1);g.save();g.beginPath();g.rect(x+.3,y+.3,cw-.6,ch-.6);g.clip();g.fillStyle=`rgba(${FLY_PASTELS[band]},.62)`;g.fill();g.strokeStyle=`rgba(${FLY_PASTELS[band]},.8)`;g.lineWidth=Math.max(.8,cw*.16);
        g.beginPath();for(let s=-ch;s<cw+ch;s+=Math.max(1.2,cw*.2)){const j=(tileHash(i,s|0,63)-.5)*cw*.12;g.moveTo(x+s+j,y+ch);g.lineTo(x+s+ch*.8,y);}g.stroke();g.restore();}
      if(i<num&&ch>5)flyMono(g,String(v).padStart(2,'0'),x+cw/2,y+ch/2,Math.min(ch*.52,cw*.42),i<tint&&v<30?'226,214,196':'40,34,30',.85,'center');}
    g.strokeStyle='rgba(60,50,40,.25)';g.lineWidth=.5;g.beginPath();for(let c=1;c<FLY_CHART_COLS;c++){g.moveTo(ix+c*cw,iy);g.lineTo(ix+c*cw,iy+ih);}g.stroke();
  }else if(stage===2){
    // The lander's facsimile camera: the scene built a column at a time left to right as the photodiode turned
    // in azimuth, reseau crosses riding inside the picture and a grey test chart along its edge
    const cols=Math.ceil(iw/2),shown=Math.floor(cols*e),sky=iy+ih*.36;
    for(let i=0;i<shown;i++){const x=ix+i*2,u=i/cols,hz=sky+Math.sin(u*9)*R*.04+Math.sin(u*23+1)*R*.02;
      g.fillStyle=`rgb(${Math.round(175-((hz-iy)/ih)*30)},${Math.round(175-((hz-iy)/ih)*30)},${Math.round(175-((hz-iy)/ih)*30)})`;g.fillRect(x,iy,2.2,hz-iy);
      const gv=Math.round(120-tileHash(i,3,64)*18);g.fillStyle=`rgb(${gv},${gv},${gv})`;g.fillRect(x,hz,2.2,iy+ih-hz);}
    // rocks, lit from the left, in the part already scanned
    g.save();g.beginPath();g.rect(ix,iy,shown*2,ih);g.clip();for(let i=0;i<16;i++){const rx=ix+tileHash(i,1,65)*iw,ry=sky+R*.12+Math.pow(tileHash(i,2,65),.7)*(ih*.6),rs=R*(.03+tileHash(i,3,65)*.09)*(1+(ry-sky)/ih);
      g.fillStyle='rgb(46,46,46)';g.beginPath();g.ellipse(rx+rs*.3,ry+rs*.15,rs*1.2,rs*.45,0,0,TAU);g.fill();g.fillStyle='rgb(168,168,168)';g.beginPath();g.ellipse(rx,ry,rs,rs*.62,0,Math.PI,TAU);g.fill();g.fillStyle='rgb(96,96,96)';g.beginPath();g.ellipse(rx,ry,rs,rs*.4,0,0,Math.PI);g.fill();}g.restore();
    g.lineWidth=Math.max(.5,R*.012);for(let a=0;a<5;a++)for(let b=0;b<3;b++){const x=ix+iw*(a+.5)/5,y=iy+ih*(b+.5)/3;if(x<ix+shown*2)flyReseau(g,x,y,R*.05,'0,0,0',.75);}
    if(shown<cols){g.fillStyle=`rgba(${P.white},.8)`;g.fillRect(ix+shown*2,iy,1,ih);}
    const tw=R*.12;for(let i=0;i<6;i++){const v=Math.round(20+i*44);g.fillStyle=`rgba(${v},${v},${v},${e>.9?1:0})`;g.fillRect(ix+iw-tw-2,iy+2+i*tw,tw,tw);}
  }else if(stage===4&&e<.55){
    // Uranus, first as a light curve: a star's light flat, winking five times before the planet occults it and
    // five times after, drawn left to right as the chart recorder ran — a curve and not a picture
    const u=clamp(e/.5,0,1),y0=iy+ih*.3,base=iy+ih*.3,dip=ih*.5;g.strokeStyle=`rgba(${P.grey},.6)`;g.lineWidth=Math.max(.5,R*.012);g.beginPath();g.moveTo(ix,iy+ih*.9);g.lineTo(ix+iw,iy+ih*.9);g.moveTo(ix,iy+ih*.1);g.lineTo(ix,iy+ih*.9);g.stroke();
    const dips=[.08,.12,.15,.19,.27],f=x=>{const t=(x-ix)/iw;if(Math.abs(t-.5)<.09)return base+dip;for(const q of dips){for(const s of[-1,1]){const at=.5+s*(.14+q*.9);if(Math.abs(t-at)<.006)return base+dip*.42;}}return base+(tileHash(Math.floor(t*300),1,66)-.5)*ih*.025;};
    g.strokeStyle=`rgba(${P.phos},.9)`;g.lineWidth=Math.max(.7,R*.018);g.beginPath();for(let x=ix;x<=ix+iw*u;x+=1)x===ix?g.moveTo(x,f(x)):g.lineTo(x,f(x));g.stroke();
    flyMono(g,'KAO · 10 MAR 1977 · STAR SAO 158687',ix+R*.05,y0-ih*.14,hs,P.phos,.9*u);
    flyMono(g,'5 DIPS | URANUS | 5 DIPS',ix+iw/2,iy+ih*.96,hs,P.grey,.9*clamp(u*2-1,0,1),'center');
  }else{
    // the encounter's picture, brought down in the way that mission brought it: a navigation frame at Io, the
    // mosaic at Neptune, four grey frames and then a stated false colour at Pluto
    const Rp=Math.min(ih*.42,iw*.26),art=flyStageArt(stage,Rp),kk=stage===4?clamp((e-.55)/.45,0,1):e;
    if(stage===3){// the long navigation exposure: Io burnt out to white, background stars showing, and the plume
      g.save();g.globalAlpha=kk;g.drawImage(art.mono||art.canvas,-art.size/2,-art.size/2+R*.1,art.size,art.size);g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,255,255,${(.62*kk).toFixed(3)})`;g.beginPath();g.arc(0,R*.1,Rp,0,TAU);g.fill();g.restore();
      for(let i=0;i<5;i++){g.fillStyle=`rgba(${P.white},${(.9*kk).toFixed(3)})`;g.fillRect(ix+tileHash(i,1,67)*iw,iy+tileHash(i,2,67)*ih,1.4,1.4);}
      const pk=clamp((kk-.65)/.3,0,1);if(pk>0){g.save();g.strokeStyle=`rgba(210,226,255,${(.7*pk).toFixed(3)})`;g.lineWidth=Math.max(1,Rp*.09);g.beginPath();g.arc(Rp*.62,R*.1-Rp*.78,Rp*.3,Math.PI*1.05,Math.PI*1.95);g.stroke();g.restore();
        g.strokeStyle=`rgba(${P.amber},${(.9*pk).toFixed(3)})`;g.lineWidth=Math.max(.5,R*.012);g.strokeRect(Rp*.62-Rp*.45,R*.1-Rp*1.2,Rp*.9,Rp*.6);flyMono(g,'?',Rp*.62+Rp*.52,R*.1-Rp*1.1,hs,P.amber,.9*pk);}}
    else if(stage===6){const strips=4,sw=art.size/strips,x0=-art.size/2,y0=-art.size/2+R*.08,mono=clamp(kk*1.6,0,1)*strips,col=clamp((kk-.6)/.35,0,1);
      for(let i=0;i<strips;i++){const on=clamp(mono-i,0,1);if(on<=0)continue;g.save();g.beginPath();g.rect(x0+i*sw,y0,sw,art.size);g.clip();g.globalAlpha=on;g.drawImage(art.mono||art.canvas,x0,y0,art.size,art.size);g.restore();}
      if(col>0){g.save();g.globalAlpha=col;g.drawImage(art.canvas,x0,y0,art.size,art.size);g.restore();if(!opts.bare)flyMono(g,'ENHANCED COLOUR · NOT NATURAL',ix+iw-R*.02,iy+ih-R*.02,hs*.9,P.amber,.9*col,'right');}}
    else flyPicture(g,art,0,R*.08,Rp,kk,stage===4?'ringed':'storm',1960+stage,{grid:4});
  }
  g.restore();
  // header and margin, typed: the mission, the target, the date; and once whole, a scale bar and the credit
  if(!opts.bare)flyMono(g,C.craft+' · '+C.place+' · '+C.when,-w/2+R*.1,-h/2+R*.14,hs,P.phos,.95,'left',opts.shown??Infinity);
  const m=clamp(e*3-2,0,1);if(m>0&&!opts.bare){g.save();g.strokeStyle=`rgba(${P.white},${(.85*m).toFixed(3)})`;g.lineWidth=Math.max(.5,R*.014);const bx=w/2-R*.86,by=h/2-R*.1;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+R*.6,by);g.moveTo(bx,by-R*.04);g.lineTo(bx,by+R*.04);g.moveTo(bx+R*.6,by-R*.04);g.lineTo(bx+R*.6,by+R*.04);g.stroke();g.restore();
    flyMono(g,C.credit,-w/2+R*.1,h/2-R*.1,hs*.9,P.grey,.85*m);}
  // the four corner reseau marks every frame carries
  g.lineWidth=Math.max(.4,R*.01);for(const [sx0,sy0] of[[-1,-1],[1,-1],[1,1],[-1,1]])flyReseau(g,sx0*(w/2-R*.07),sy0*(h/2-R*.07),R*.035,P.grey,.6);
}

// The frontispiece's title mark: the furthest frame the mission log has reached, above the opening choice and
// gone once the run starts, the era's name beneath it in the grotesque, and the log's count.
let flyTitleFade=1;
function flyTitleRoom(){
  let top=H*.13;
  try{const e=document.getElementById('flyby-lore-open'),r=e&&e.getBoundingClientRect?e.getBoundingClientRect():null,gr=game.getBoundingClientRect?game.getBoundingClientRect():null;if(r&&gr&&r.height>0)top=r.bottom-gr.top+6;}catch(_){}
  let bottom=H*.36;for(const n of world.nodes)if(n.difficultyChoice)bottom=Math.min(bottom,sy(n.y)-n.cap*scale-6);
  return{top,bottom};
}
function flyTitleMark(){
  const ready=world.state==='ready';flyTitleFade=ready?1:Math.max(0,flyTitleFade-.03);if(flyTitleFade<=0)return;
  const P=ink.flyby,rec=flyRead(),stage=rec.completed>0?6:rec.furthest+1,C=FLY_CHAPTERS[stage-1],x=W/2,nw=flyBits(rec.worlds),nt=flyBits(rec.targets),log=nw||nt;
  const {top,bottom}=flyTitleRoom(),logY=bottom-6,lineY=log?logY-15:logY,titleY=lineY-21,fit=Math.min(W*.1,30*scale+4,(titleY-18-top)/2.5),R=clamp(fit,10,36),y=titleY-18-R*1.2;
  ctx.save();ctx.globalAlpha=flyTitleFade;
  if(fit>=10){const key='title:'+stage+':'+R.toFixed(1)+':'+DPR;let sp=flySprites.get(key);
    if(!sp){const sw=Math.ceil(R*3.6),shh=Math.ceil(R*2.6),c=makeCanvas(Math.round(sw*DPR),Math.round(shh*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(sw/2,shh/2);flyFrame(g,R,stage,1);sp={canvas:c,w:sw,h:shh};if(flySprites.size>8)flySprites.clear();flySprites.set(key,sp);}
    ctx.drawImage(sp.canvas,x-sp.w/2,y-sp.h/2,sp.w,sp.h);}
  flyGrot(ctx,'THE FLYBY',x,titleY,Math.min(22,W*.056),P.white,.95,'center');
  flyMono(ctx,'LOG: '+C.year+' · '+C.place,x,lineY,Math.min(9.5,W*.024),P.grey,.9,'center');
  if(log)flyMono(ctx,'MAPPED '+nw+'/7 WORLDS · '+nt+'/12 TARGETS',x,logY,8,P.phos,.8,'center');
  ctx.restore();
}

// ---------- An encounter opens: the craft, the target, and the frame it is remembered for ----------
// Struck early in the paint order, under every orbit and body, as the atlas cuts its chapter title into the
// plate: the frame faint behind the play, coming down in its own manner, with the encounter's header typed
// above it a glyph at a time.
let flyRevealCanvas=null,flyRevealKey='',flyRevealOf=null,flyRevealAt=0;
function flyHudTop(){if(flyHudTopPx!==null)return flyHudTopPx;let t=26;try{const e=document.querySelector('.hud'),v=e&&typeof getComputedStyle==='function'?parseFloat(getComputedStyle(e).top):NaN;if(isFinite(v))t=v;}catch(e){}return flyHudTopPx=t;}
let flyHudTopPx=null;
function flyChapterReveal(dt){
  if(!world||world.state==='ready'||world.state==='dead')return;
  if(flyRevealOf!==chapterReveal){flyRevealOf=chapterReveal;flyRevealAt=world.time-chapterReveal.age;}
  chapterReveal.age=world.time-flyRevealAt;
  const age=chapterReveal.age,i=clamp(chapterReveal.index|0,0,FLY_CHAPTERS.length-1);if(age>4.4)return;
  // over the opening choice, the whole opening is laid out in the room above its rings, shrinking to fit
  let clear=Infinity;for(const n of world.nodes)if(n.difficultyChoice){const t=sy(n.y)-n.cap*scale-10;if(t>-40&&t<H)clear=Math.min(clear,t);}
  let R=Math.min(W*.15,58),cy=H*.44,draw=true;
  if(cy+R*1.2>clear){const room=clear-(flyHudTop()+70);R=Math.min(R,(room-60)/2.4);draw=R>=18;cy=draw?clear-R*1.2:clear;}
  const P=ink.flyby,C=FLY_CHAPTERS[i],fade=age<.4?age/.4:age>3.6?clamp(1-(age-3.6)/.8,0,1):1,sw=Math.ceil(Math.max(R,18)*3.6),shh=Math.ceil(Math.max(R,18)*2.6);
  const key=sw+':'+DPR;if(!flyRevealCanvas||flyRevealKey!==key){flyRevealCanvas=makeCanvas(Math.round(sw*DPR),Math.round(shh*DPR));flyRevealKey=key;}
  const cx=W/2;
  if(draw){const g=flyRevealCanvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,flyRevealCanvas.width,flyRevealCanvas.height);g.setTransform(DPR,0,0,DPR,0,0);g.translate(sw/2,shh/2);
    flyFrame(g,R,i+1,clamp((age-.35)/2.3,0,1),{shown:Math.floor(age*30)});ctx.save();ctx.globalAlpha=.66*fade;ctx.drawImage(flyRevealCanvas,cx-sw/2,cy-shh/2,sw,shh);ctx.restore();}
  const tk=clamp((age-.2)/.8,0,1)*fade,ty=draw?cy-R*1.2-12:clear-8;
  // the encounter's header: a mission-control title card, the numerals ticking in whole
  ctx.save();ctx.globalAlpha=tk;const bw=Math.min(W-40,300),bh=52;ctx.fillStyle='rgba(2,3,5,.8)';ctx.fillRect(cx-bw/2,ty-bh,bw,bh);ctx.strokeStyle=`rgba(${P.phosDim},.7)`;ctx.lineWidth=.7;ctx.strokeRect(cx-bw/2,ty-bh,bw,bh);ctx.restore();
  flyGrot(ctx,C.place,cx,ty-bh+15,Math.min(20,W*.05),P.white,.95*tk,'center');
  flyMono(ctx,'ENCOUNTER '+FLY_ROMAN[i]+' OF VI · '+C.craft+' · '+C.year,cx,ty-bh+31,8.5,P.phos,.9*tk,'center',Math.floor((age-.3)*34));
  flyMono(ctx,C.reading,cx,ty-bh+43,8,P.grey,.9*tk,'center',Math.floor((age-.8)*34));
}

// ---------- The node: a tracked point, then a picture on its way home ----------
// The ring stands at the node's real capture radius, never staged wider or narrower than the truth the code
// tests: a thin instrument circle with twelve plot ticks, drawn on round from the top as the node is revealed.
const flyFlourishAt=new Map();
function flyFlourish(n){flyFlourishAt.set(n,world.time);if(flyFlourishAt.size>40)for(const[key,at]of flyFlourishAt)if(world.time-at>.9)flyFlourishAt.delete(key);}
function flyRing(n,x,y,cap,state,drawn,active){
  const P=ink.flyby;if(drawn<=0)return;const a0=-Math.PI/2,a1=a0+TAU*drawn,col=active?P.phos:P.grey;
  ctx.save();ctx.lineCap='butt';ctx.strokeStyle=`rgba(${col},${(.62*state).toFixed(3)})`;ctx.lineWidth=Math.max(.6,.7*scale);ctx.beginPath();ctx.arc(x,y,cap,a0,a1);ctx.stroke();
  ctx.lineWidth=Math.max(.5,.55*scale);ctx.beginPath();for(let i=0;i<12;i++){const a=a0+i/12*TAU;if(a-a0>TAU*drawn)break;const L=(i%3===0?5:2.6)*scale;ctx.moveTo(x+Math.cos(a)*cap,y+Math.sin(a)*cap);ctx.lineTo(x+Math.cos(a)*(cap+L),y+Math.sin(a)*(cap+L));}ctx.stroke();
  const at=flyFlourishAt.get(n);
  if(at!==undefined){const k=clamp(1-(world.time-at)/.9,0,1);if(k>0){ctx.strokeStyle=`rgba(${P.phos},${(.95*k).toFixed(3)})`;ctx.lineWidth=(.5+2.2*k)*scale;ctx.beginPath();ctx.arc(x,y,cap+(1-k)*7*scale,0,TAU);ctx.stroke();
    flyMono(ctx,'LOCK',x,y-cap-9*scale,Math.max(7,7.5*scale),P.phos,.95*k,'center');}}
  ctx.restore();
}
// Where the next body can be reached from the held ring: a band outside the rim over the arc that connects,
// and at every tangent that threads clear of every hazard a division struck across it with a small square on
// it — geometry only, read exactly as drawNode reads it, only the material this sheet's.
function flyReleaseMarks(n,p,x,y){
  const P=ink.flyby,rad=p.rad*scale;
  for(const next of releaseTargets(n)){
    const dist=Math.hypot(next.x-n.x,next.y-n.y),a=Math.atan2(next.y-n.y,next.x-n.x)-p.dir*Math.acos(clamp(p.rad/dist,-1,1)),win=Math.asin(clamp(next.cap/dist,0,.8));
    ctx.save();ctx.strokeStyle=`rgba(${P.phos},.26)`;ctx.lineWidth=3.2*scale;ctx.lineCap='butt';ctx.beginPath();ctx.arc(x,y,rad+7*scale,a-win,a+win);ctx.stroke();
    ctx.strokeStyle=`rgba(${P.phos},.8)`;ctx.lineWidth=.5*scale;ctx.beginPath();for(let t=-1;t<=1;t+=.25){const b=a+t*win;ctx.moveTo(x+Math.cos(b)*(rad+5*scale),y+Math.sin(b)*(rad+5*scale));ctx.lineTo(x+Math.cos(b)*(rad+9*scale),y+Math.sin(b)*(rad+9*scale));}ctx.stroke();ctx.restore();
    for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
      if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
      const c=Math.cos(path.angle),s=Math.sin(path.angle),mx=x+c*(rad+9*scale),my=y+s*(rad+9*scale);
      ctx.save();ctx.strokeStyle=`rgba(${P.white},.9)`;ctx.lineWidth=1*scale;ctx.beginPath();ctx.moveTo(x+c*(rad-4*scale),y+s*(rad-4*scale));ctx.lineTo(x+c*(rad+13*scale),y+s*(rad+13*scale));ctx.stroke();
      const q=2.6*scale;ctx.lineWidth=.8*scale;ctx.strokeRect(mx-q,my-q,q*2,q*2);ctx.fillStyle=`rgb(${P.phos})`;ctx.fillRect(mx-.8*scale,my-.8*scale,1.6*scale,1.6*scale);ctx.restore();}
  }
}
const flyFamily=n=>planetFamilyFor(n.type,n.row,world.seed,n.difficultyChoice);
const flyDiscR=n=>clamp(n.r*.4,7,17)*scale;
// A body not yet reached is what tracking alone can give a mission before arrival: a bright point wearing a
// small halo sized to the target it offers, boxed by the navigation plot's four brackets — amber where the
// plot already marks it as a risk, a faint light that will not wait.
function flyPhenomenon(n,x,y){
  const P=ink.flyby,m=clamp((n.r-18)/34,0,1),fading=n.type==='fading',t=reducedMotion?0:world.time,r=(1.3+m*1.8)*scale,tw=1+.07*Math.sin(t*2.6+n.id);
  ctx.save();ctx.globalAlpha=fading?.6:1;const sg=ctx.createRadialGradient(x,y,0,x,y,r*3.4*tw);sg.addColorStop(0,'rgba(255,255,255,1)');sg.addColorStop(.18,'rgba(232,240,255,.75)');sg.addColorStop(.5,'rgba(180,200,240,.14)');sg.addColorStop(1,'rgba(180,200,240,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,r*3.4*tw,0,TAU);ctx.fill();
  const b=(7+m*6)*scale,L=2.6*scale;ctx.strokeStyle=fading?`rgba(${P.amber},.7)`:`rgba(${P.grey},.55)`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.beginPath();
  for(const [sx0,sy0] of[[-1,-1],[1,-1],[1,1],[-1,1]]){ctx.moveTo(x+sx0*b,y+sy0*(b-L));ctx.lineTo(x+sx0*b,y+sy0*b);ctx.lineTo(x+sx0*(b-L),y+sy0*b);}ctx.stroke();ctx.restore();
}
let flyRunWorld=null,flyNoted=new Set();
function flyRun(){if(flyRunWorld!==world){flyRunWorld=world;flyNoted=new Set();flyFlourishAt.clear();flyDoneAt.clear();}}
function flyNoteDone(n,family){if(n.difficultyChoice||flyNoted.has(n.id))return;flyNoted.add(n.id);flyNoteWorld(family);}
const flyDoneAt=new Map();
function flyDoneAge(n){let at=flyDoneAt.get(n.id);if(at===undefined){at=world.time;flyDoneAt.set(n.id,at);if(flyDoneAt.size>60)flyDoneAt.delete(flyDoneAt.keys().next().value);}return world.time-at;}
// A held world: its picture as far as the observation has brought it, and under it the stage it is in — the
// pass's own label while the mosaic locks, and once the seams close, the instrument margin and the mission
// label, typed out whole-glyph after the frame is complete.
function flyBody(n,family,x,y,d,al){
  const P=ink.flyby,R=flyDiscR(n),art=flyBodyArt(n,family,R),Rd=FLY_READINGS[family]||FLY_READINGS.crater;
  ctx.save();ctx.globalAlpha=al;flyPicture(ctx,art,x,y,R,d,family,n.seed|0,{grid:R>11*scale?4:3});
  // Io's plume, an anomaly off the limb that turns up mid-orbit, as it turned up in an engineer's frame
  if(family==='volcanic'){const pk=clamp((d-.35)/.2,0,1);if(pk>0){ctx.strokeStyle=`rgba(210,226,255,${(.6*pk).toFixed(3)})`;ctx.lineWidth=Math.max(.8,R*.1);ctx.beginPath();ctx.arc(x+R*.62,y-R*.78,R*.3,Math.PI*1.05,Math.PI*1.95);ctx.stroke();}}
  // the rings of a ringed world, before they are seen, are only the star's five winks either side of it
  if(family==='ringed'){const lk=flySpan(d,FLY_STAGE.tiles)*(1-flySpan(d,FLY_STAGE.seams));if(lk>0){ctx.strokeStyle=`rgba(${P.phos},${(.8*lk).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.beginPath();
    ctx.moveTo(x-R*2.2,y);ctx.lineTo(x+R*2.2,y);for(const s of[-1,1])for(let i=0;i<5;i++){const px=x+s*R*(1.25+i*.18);ctx.moveTo(px,y-2*scale);ctx.lineTo(px,y+2*scale);}ctx.stroke();}}
  ctx.restore();
  if(n.difficultyChoice)return;
  const sz=Math.max(7.5,7.5*scale),by=y+R*(family==='ringed'?1.55:1.05)+11*scale,s2=flySpan(d,FLY_STAGE.tiles),s4=flySpan(d,FLY_STAGE.margin);
  if(s4<=0){if(s2>0)flyMono(ctx,Rd.pass,x,by,sz,FLY_FALSE[family]?P.amber:P.grey,.85*al*Math.min(1,s2*3),'center');}
  else{// the instrument margin: a scale bar, then the mission label
    ctx.save();ctx.strokeStyle=`rgba(${P.white},${(.75*al*s4).toFixed(3)})`;ctx.lineWidth=.7;const bx=x-R*.5,yy=by-6*scale;ctx.beginPath();ctx.moveTo(bx,yy);ctx.lineTo(bx+R,yy);ctx.moveTo(bx,yy-1.5*scale);ctx.lineTo(bx,yy+1.5*scale);ctx.moveTo(bx+R,yy-1.5*scale);ctx.lineTo(bx+R,yy+1.5*scale);ctx.stroke();ctx.restore();
    flyMono(ctx,Rd.mission,x,by+3*scale,sz,P.white,.92*al*Math.min(1,s4*2),'center',d>=1?Math.floor(flyDoneAge(n)*40)+Math.floor(s4*Rd.mission.length):Math.floor(s4*Rd.mission.length));}
  if(d>=1)flyNoteDone(n,family);
}
// A small irregular body — a faint light on the chart — is a shape model; the gilt find is a comet nucleus,
// two lobes, with its jets breaking from the sunward side once the mesh has closed.
const FLY_SMALL=[['433 EROS','2000 · NEAR'],['25143 ITOKAWA','2005 · HAYABUSA'],['101955 BENNU','2018 · OSIRIS-REX']];
function flySmallBody(n,x,y,d,al,comet,taken=true){
  const P=ink.flyby,R=(comet?Math.max(6,n.r*.3):flyDiscR(n)*.9),col=comet?[150,146,140]:[176,166,150];
  ctx.save();ctx.globalAlpha=al;flyMesh(ctx,x,y,R,(n.seed|0)^0x67,d,comet,col);
  if(comet&&d>.5){const k=clamp((d-.5)*2,0,1),t=reducedMotion?0:world.time;ctx.lineCap='round';for(let i=0;i<4;i++){const a=-2.3+i*.28+Math.sin(t*1.4+i)*.05,L=R*(1.4+tileHash(n.id,i,71)*1.2);const jg=ctx.createLinearGradient(x,y,x+Math.cos(a)*L,y+Math.sin(a)*L);jg.addColorStop(0,`rgba(236,242,255,${(.55*k).toFixed(3)})`);jg.addColorStop(1,'rgba(236,242,255,0)');ctx.strokeStyle=jg;ctx.lineWidth=Math.max(.8,R*.14);ctx.beginPath();ctx.moveTo(x+Math.cos(a)*R*.5,y+Math.sin(a)*R*.5);ctx.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);ctx.stroke();}}
  ctx.restore();
  if(!taken)return;const lab=comet?['67P','2014 · ROSETTA']:FLY_SMALL[(n.id|0)%3],sz=Math.max(7,7.5*scale),by=y+R*1.3+10*scale;
  if(d<.8)flyMono(ctx,'SHAPE MODEL · '+Math.round(d*100)+'%',x,by,sz,P.phos,.8*al,'center');
  else flyMono(ctx,lab[0]+' · '+lab[1],x,by,sz,P.white,.9*al,'center',Math.floor((d-.8)*5*(lab[0].length+lab[1].length+3)));
}
// The opening choice, drawn whole: the Moon for Tiro, the one body here a person has stood on, marked where
// Apollo 11 came down; Mars for Adeptus, as Mariner 4 first showed it cratered; Neptune for Magister, the last
// planet Voyager 2 reached.
function flyChoice(n,x,y){
  const P=ink.flyby,c=n.difficultyChoice,fam=c==='relaxed'?'moon':c==='classic'?'crater':'storm',R=flyDiscR(n);
  flyBody(n,fam,x,y,1,1);
  if(c==='relaxed'){const mx=x+R*.18,my=y-R*.12;ctx.save();ctx.strokeStyle=`rgba(${P.amber},.95)`;ctx.lineWidth=Math.max(.6,.7*scale);ctx.beginPath();ctx.moveTo(mx-3*scale,my);ctx.lineTo(mx+3*scale,my);ctx.moveTo(mx,my-3*scale);ctx.lineTo(mx,my+3*scale);ctx.stroke();ctx.restore();}
  const name=c==='relaxed'?'THE MOON':c==='classic'?'MARS':'NEPTUNE',sub=c==='relaxed'?'1969 · APOLLO 11':c==='classic'?'1965 · MARINER 4':'1989 · VOYAGER 2';
  flyGrot(ctx,name,x,y+R+13*scale,Math.max(10,10.5*scale),P.white,.92,'center');flyMono(ctx,sub,x,y+R+25*scale,Math.max(7,7.5*scale),P.grey,.85,'center');
}
// The charges, as the things a mission actually carried or leaned on: a radiation vault, the shielded box its
// electronics ride Jupiter's belts in; a high-gain dish locked on Earth; one of the network's seventy-metre
// dishes, the margin that pushes loss of signal back; and for the propellant, an aerobraking pass, a planet's
// own air spent in place of a burn.
function flyGift(n,x,y,used,sc=scale){
  const P=ink.flyby,r=n.r*sc,k=used?.35:1;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=k;ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=`rgb(${P.white})`;ctx.lineWidth=Math.max(.7,.85*sc);
  if(n.type==='shield'){const R=r*.4;ctx.fillStyle='rgba(20,22,26,.9)';ctx.fillRect(-R,-R*.8,R*2,R*1.6);ctx.strokeRect(-R,-R*.8,R*2,R*1.6);
    ctx.fillStyle=`rgb(${P.amber})`;ctx.beginPath();ctx.arc(0,0,R*.14,0,TAU);ctx.fill();for(let i=0;i<3;i++){const a=-Math.PI/2+i*TAU/3;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R*.62,a-.5,a+.5);ctx.closePath();ctx.fill();}
    ctx.fillStyle='rgba(20,22,26,1)';ctx.beginPath();ctx.arc(0,0,R*.24,0,TAU);ctx.fill();ctx.fillStyle=`rgb(${P.amber})`;ctx.beginPath();ctx.arc(0,0,R*.12,0,TAU);ctx.fill();}
  else if(n.type==='reflector'||n.type==='dawn'){const R=r*(n.type==='dawn'?.5:.4);ctx.save();ctx.rotate(-.5);ctx.fillStyle='rgba(220,226,234,.9)';ctx.beginPath();ctx.ellipse(0,0,R*.34,R,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.moveTo(-R*.1,0);ctx.lineTo(R*.7,-R*.35);ctx.stroke();ctx.strokeStyle=`rgba(${P.phos},.9)`;for(let i=1;i<=3;i++){ctx.beginPath();ctx.arc(R*.7,-R*.35,R*.22*i,-1.2,.2);ctx.stroke();}
    if(n.type==='dawn'){ctx.strokeStyle=`rgb(${P.white})`;ctx.beginPath();ctx.moveTo(-R*.3,R*.6);ctx.lineTo(-R*.1,R*1.1);ctx.lineTo(R*.3,R*1.1);ctx.lineTo(R*.1,R*.5);ctx.stroke();}}
  else{const R=r*.46;ctx.strokeStyle=`rgba(${P.tan},.9)`;ctx.lineWidth=Math.max(1,1.4*sc);ctx.beginPath();ctx.arc(0,R*1.6,R*1.4,-Math.PI*.8,-Math.PI*.2);ctx.stroke();
    ctx.strokeStyle=`rgba(${P.phos},.9)`;ctx.lineWidth=Math.max(.6,.8*sc);ctx.setLineDash([2*sc,2*sc]);ctx.beginPath();ctx.moveTo(-R*1.3,-R*.5);ctx.quadraticCurveTo(0,R*.55,R*1.3,-R*.5);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=`rgb(${P.white})`;ctx.fillRect(R*1.1,-R*.62,R*.3,R*.22);}
  ctx.restore();
}
// A gravity assist: arrows circling the body in the sense of its own motion, the momentum a craft borrows.
function flySling(n,x,y){
  const P=ink.flyby,R=n.r*scale*.86,t=reducedMotion?0:world.time;
  ctx.save();ctx.strokeStyle=`rgba(${P.phos},.55)`;ctx.lineWidth=Math.max(.6,.7*scale);ctx.setLineDash([3*scale,3*scale]);ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=`rgba(${P.phos},.85)`;for(let i=0;i<3;i++){const a=i*TAU/3+t*.4,px=x+Math.cos(a)*R,py=y+Math.sin(a)*R,tx=-Math.sin(a),ty=Math.cos(a),s=3.6*scale;
    ctx.beginPath();ctx.moveTo(px+tx*s,py+ty*s);ctx.lineTo(px-tx*s*.6+Math.cos(a)*s*.7,py-ty*s*.6+Math.sin(a)*s*.7);ctx.lineTo(px-tx*s*.6-Math.cos(a)*s*.7,py-ty*s*.6-Math.sin(a)*s*.7);ctx.closePath();ctx.fill();}
  ctx.restore();
}
// A target's moon: a point in a track box until it is visited, then a small disc of its own, numbered.
function flyStar(n,x,y,d,al){
  const P=ink.flyby,mag=clamp(n.magnitude??3,1,6),r=(4.2-mag*.45)*scale,k=flyEase(clamp(d*1.6,0,1));
  ctx.save();ctx.globalAlpha=al;
  const sg=ctx.createRadialGradient(x,y,0,x,y,r*2.4);sg.addColorStop(0,`rgba(250,252,255,${(1-k*.6).toFixed(3)})`);sg.addColorStop(.3,`rgba(220,232,255,${(.5*(1-k)).toFixed(3)})`);sg.addColorStop(1,'rgba(220,232,255,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,r*2.4,0,TAU);ctx.fill();
  if(k>0){const rr=r*(.8+.6*k),dg=ctx.createRadialGradient(x-rr*.35,y-rr*.35,rr*.1,x,y,rr);dg.addColorStop(0,`rgba(236,232,224,${k.toFixed(3)})`);dg.addColorStop(1,`rgba(70,68,64,${k.toFixed(3)})`);ctx.fillStyle=dg;ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.fill();}
  const b=r*2.2;ctx.strokeStyle=`rgba(${k>0?P.phos:P.grey},${(.6+.3*k).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.55*scale);ctx.strokeRect(x-b,y-b,b*2,b*2);
  ctx.restore();
}
function flyNode(n,aim){
  flyRun();
  const pen=revealNode(n);if(pen.t<=0)return;
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=!!(aim&&aim.n.id===n.id);
  const x=sx(n.x),y=sy(n.y),cap=n.cap*scale;
  if(y<-cap*2-60||y>H+cap*2+60)return;
  flyRing(n,x,y,cap,active||target?1:used?.32:.62,pen.ring,active);
  if(n.type==='sling')flySling(n,x,y);
  if(['shield','reflector','dawn','inkwell'].includes(n.type))flyGift(n,x,y,used);
  else if(n.difficultyChoice)flyChoice(n,x,y);
  else if(n.routeRole==='star')flyStar(n,x,y,pen.taken>0?pen.d:0,pen.taken>0?1:.75);
  else if(n.type==='gold')flySmallBody(n,x,y,pen.taken>0?pen.d:0,pen.taken>0?pen.taken:.75,true,pen.taken>0);
  else if(pen.taken>0){if(n.type==='fading')flySmallBody(n,x,y,pen.d,pen.taken,false);else flyBody(n,flyFamily(n),x,y,pen.d,pen.taken);}
  else flyPhenomenon(n,x,y);
  if(active)flyReleaseMarks(n,p,x,y);
}

// ---------- The dangers: mission risk, never a monster ----------
// A danger's name stands beside its core on the right, and goes to the left where the right would run it off.
function flyHazardLabel(str,x,y,off,size,col){const w=flyTextWidth(str,size,'mono'),right=x+off+w<=W-FLY_BAND-4;flyMono(ctx,str,right?x+off:x-off,y,size,col,.85,right?'left':'right');}
// The gravity well, for the pull: a body's mass drawn into the navigation team's own plot — the trajectory
// grid bent in toward it, quietly wrong until the next fix corrects it — and at its centre a black exactly as
// wide as the lethal core and no wider, with rings drawn in toward it for the reach.
function flyWell(h,x,y){
  const P=ink.flyby,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time;
  ctx.save();ctx.beginPath();ctx.arc(x,y,reach,0,TAU);ctx.clip();ctx.strokeStyle=`rgba(${P.phosDim},.42)`;ctx.lineWidth=Math.max(.4,.5*scale);
  const lines=8,step=reach*2/lines,pull=r=>{const u=clamp(1-r/reach,0,1);return core*1.9*u*u;};
  for(let dir=0;dir<2;dir++)for(let i=0;i<=lines;i++){const o=-reach+i*step;ctx.beginPath();for(let j=0;j<=20;j++){const q=-reach+j*reach/10,px=dir?o:q,py=dir?q:o,r=Math.hypot(px,py)||1,pl=Math.min(pull(r),r-core*.98);const X=x+px-px/r*Math.max(0,pl),Y=y+py-py/r*Math.max(0,pl);j?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();}
  ctx.restore();ctx.save();ctx.setLineDash([1.5*scale,2.5*scale]);
  for(let i=0;i<3;i++){const f=((t*.25+i/3)%1),r=core+(1-f)*(reach-core);ctx.strokeStyle=`rgba(${P.amber},${(f*.4).toFixed(3)})`;ctx.lineWidth=(.5+f*.5)*scale;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}ctx.setLineDash([]);
  ctx.fillStyle='rgb(0,0,0)';ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(${P.grey},.9)`;ctx.lineWidth=1*scale;ctx.stroke();
  ctx.restore();flyHazardLabel('GRAVITY WELL',x,y-core-5*scale,core+8*scale,Math.max(7.5,7.5*scale),P.amber);
}
// The radiation belt, for the push: a hard-edged, dense field of trapped particles round a small giant, a band to
// cross quickly and never to dwell in. The giant is the lethal core and exactly as wide; the belt's outer edge
// is the reach of the push.
function flyBelt(h,x,y){
  const P=ink.flyby,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time,in0=core*1.35;
  ctx.save();ctx.strokeStyle=`rgba(${P.amber},.45)`;ctx.lineWidth=Math.max(.6,.7*scale);ctx.beginPath();ctx.arc(x,y,reach,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(x,y,in0,0,TAU);ctx.stroke();
  for(let i=0;i<3;i++){const f=((t*.3+i/3)%1),r=core+f*(reach-core);ctx.strokeStyle=`rgba(${P.amber},${((1-f)*.28).toFixed(3)})`;ctx.lineWidth=.6*scale;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
  const N=Math.min(220,Math.round(reach*reach/(22*scale*scale)));for(let i=0;i<N;i++){const u=tileHash(h.seed,i,81),rr=lerp(in0,reach,Math.sqrt(u)),w=.6/Math.max(.3,rr/reach),a=tileHash(h.seed,i,82)*TAU+t*w*.5,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;
    ctx.fillStyle=`rgba(${tileHash(h.seed,i,83)<.2?P.amber:P.white},${(.35+tileHash(h.seed,i,84)*.45).toFixed(3)})`;ctx.fillRect(px,py,Math.max(.8,scale*.9),Math.max(.8,scale*.9));}
  const gg=ctx.createRadialGradient(x-core*.3,y-core*.35,core*.1,x,y,core);gg.addColorStop(0,'rgb(236,214,180)');gg.addColorStop(.6,'rgb(180,130,90)');gg.addColorStop(1,'rgb(50,32,20)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
  ctx.save();ctx.clip();ctx.strokeStyle='rgba(120,70,40,.5)';ctx.lineWidth=core*.12;for(const b of[-.4,-.05,.3]){ctx.beginPath();ctx.moveTo(x-core,y+b*core);ctx.lineTo(x+core,y+b*core);ctx.stroke();}ctx.restore();
  ctx.strokeStyle=`rgba(${P.white},.9)`;ctx.lineWidth=scale;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.stroke();
  ctx.restore();flyHazardLabel('RADIATION BELT',x,y-core-4*scale,in0+6*scale,Math.max(7.5,7.5*scale),P.amber);
}
// The solar wind, for the crosswind: streamlines carrying drifting specks past, one field-not-figure convention.
function flyWind(h,x,y){
  const P=ink.flyby,reach=gravityRadius(h)*scale;if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const t=reducedMotion?0:world.time,dir=h.dir||0;
  ctx.save();ctx.translate(x,y);ctx.rotate(dir);ctx.beginPath();ctx.arc(0,0,reach,0,TAU);ctx.clip();ctx.lineCap='round';
  for(let i=0;i<18;i++){const lane=(tileHash(h.seed,i,1)-.5)*reach*1.8,len=reach*(.18+tileHash(h.seed,i,3)*.2),x0=((t*26*scale+tileHash(h.seed,i,2)*reach*2.6)%(reach*2.6))-reach*1.3;
    const tg=ctx.createLinearGradient(x0,0,x0+len,0);tg.addColorStop(0,`rgba(${P.haze},0)`);tg.addColorStop(1,`rgba(${P.haze},.55)`);ctx.strokeStyle=tg;ctx.lineWidth=.8*scale;
    ctx.beginPath();ctx.moveTo(x0,lane);ctx.quadraticCurveTo(x0+len*.5,lane-len*.16,x0+len,lane);ctx.stroke();ctx.fillStyle=`rgba(${P.white},.8)`;ctx.fillRect(x0+len-.6*scale,lane-.6*scale,1.2*scale,1.2*scale);}
  ctx.restore();
  const lx=x-Math.cos(dir)*reach*.72,ly=y-Math.sin(dir)*reach*.72-12*scale;flyMono(ctx,'SOLAR WIND',lx,ly,Math.max(7.5,7.5*scale),P.haze,.85,'center');
  ctx.save();ctx.strokeStyle=`rgba(${P.haze},.85)`;ctx.lineWidth=1.3*scale;const ax=lx,ay=ly+10*scale;
  ctx.beginPath();ctx.moveTo(ax-Math.cos(dir)*8*scale,ay-Math.sin(dir)*8*scale);ctx.lineTo(ax+Math.cos(dir)*10*scale,ay+Math.sin(dir)*10*scale);ctx.lineTo(ax+Math.cos(dir-2.6)*4*scale+Math.cos(dir)*10*scale,ay+Math.sin(dir-2.6)*4*scale+Math.sin(dir)*10*scale);ctx.stroke();ctx.restore();
}
// Signal dropout, for the obscurer: not a shape blocking a view but the frame itself losing sync — scan lines
// replaced by flat dropout bands, a tile that never resolves sitting grey among the ones that did.
function flyDropout(h,x,y){
  const P=ink.flyby,R=h.r*scale;if(y+R<-20||y-R>H+20)return;const t=reducedMotion?0:Math.floor(world.time*6);
  ctx.save();ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.clip();ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(x-R,y-R,R*2,R*2);
  const pitch=4*scale;for(let yy=y-R,j=0;yy<y+R;yy+=pitch,j++){const u=tileHash(h.seed,j+t*3,91);if(u<.42){const x0=x-R+tileHash(h.seed,j,92)*R*.8,w=R*(.5+tileHash(h.seed,j+t,93)*1.4);ctx.fillStyle=u<.2?'rgba(0,0,0,.9)':`rgba(${P.dim},.55)`;ctx.fillRect(x0,yy,w,pitch*.8);}
    else if(u>.9){ctx.fillStyle=`rgba(${P.white},.28)`;ctx.fillRect(x-R,yy+pitch*.4,R*2,Math.max(.5,.4*scale));}}
  const ts=14*scale;for(let i=0;i<6;i++){const tx=x+(tileHash(h.seed,i,94)-.5)*R*1.2,ty=y+(tileHash(h.seed,i,95)-.5)*R*1.2;ctx.fillStyle=`rgba(${P.dim},.6)`;ctx.fillRect(tx,ty,ts,ts);ctx.strokeStyle=`rgba(${P.grey},.35)`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+ts,ty+ts);ctx.moveTo(tx+ts,ty);ctx.lineTo(tx,ty+ts);ctx.stroke();}
  ctx.restore();ctx.save();ctx.strokeStyle=`rgba(${P.grey},.45)`;ctx.setLineDash([2*scale,3*scale]);ctx.lineWidth=.6*scale;ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.stroke();ctx.restore();
  flyMono(ctx,'SIGNAL DROPOUT · NO SYNC',x,y-R-8*scale,Math.max(7.5,7.5*scale),P.grey,.9,'center');
}
function flyHazard(h){
  const x=sx(h.x),y=sy(h.y);
  if(h.kind==='nebula')return flyDropout(h,x,y);
  if(h.kind==='wind')return flyWind(h,x,y);
  const reach=gravityRadius(h)*scale;if(y+reach<-20||y-reach>H+20)return;
  if(h.kind==='flare')return flyBelt(h,x,y);
  return flyWell(h,x,y);
}
// A danger comes onto the sheet as everything else here does: read out from the top a line at a time.
function flyHazardReveal(h,draw,t){
  const x=sx(h.x),y=sy(h.y),R=(gravityRadius(h)+24)*scale,e=1-Math.pow(1-t,3);
  ctx.save();ctx.beginPath();ctx.rect(x-R,y-R,R*2,R*2*e);ctx.clip();draw(h);ctx.restore();
  if(e<1){ctx.save();ctx.strokeStyle=`rgba(${ink.flyby.phos},${(.7*(1-e)).toFixed(3)})`;ctx.lineWidth=scale;ctx.beginPath();ctx.moveTo(x-R,y-R+R*2*e);ctx.lineTo(x+R,y-R+R*2*e);ctx.stroke();ctx.restore();}
}

// ---------- The flight: telemetry behind, the course flown, the prediction ahead ----------
// Behind the craft the line is its own reconstructed track, a run of sampled points; the course already flown is
// a faint plotted line; the guide ahead is the navigation team's prediction, ticked at even intervals.
function flyTrail(){
  const tr=world.trail;if(tr.length<2)return;const P=ink.flyby;
  const pts=[];for(const s of tr){const life=clamp(1-(world.time-s.time)/TRAIL_LIFE,0,1);if(life>0)pts.push([sx(s.x),sy(s.y),life]);}
  const p=world.player;if(world.state!=='dead')pts.push([sx(p.x),sy(p.y),1]);if(pts.length<2)return;
  ctx.save();ctx.strokeStyle=`rgba(${P.phosDim},.35)`;ctx.lineWidth=.6*scale;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  for(let i=0;i<pts.length;i+=2){const f=pts[i][2];ctx.fillStyle=`rgba(${P.phos},${(.12+f*.75).toFixed(3)})`;ctx.fillRect(pts[i][0]-.9*scale,pts[i][1]-.9*scale,1.8*scale,1.8*scale);}
  ctx.restore();
}
function flyInkPath(){
  const Q=world.inkPath;if(Q.length<2)return;const P=ink.flyby;
  ctx.save();ctx.strokeStyle=`rgba(${P.dim},.7)`;ctx.lineWidth=Math.max(.6,.8*scale);ctx.setLineDash([1.5*scale,4*scale]);
  ctx.beginPath();ctx.moveTo(sx(Q[0].x),sy(Q[0].y));for(let i=1;i<Q.length;i++)ctx.lineTo(sx(Q[i].x),sy(Q[i].y));ctx.stroke();ctx.restore();
}
function flyAim(aim,preview){
  const P=ink.flyby,points=preview.points,warn=preview.blocked||aim?.steep,end=points[points.length-1];
  const dryFrom=preview.inkRange>=0&&end.distance>0?clamp(preview.inkRange/end.distance,0,1):1;
  const Q=points.map(q=>[sx(q.x),sy(q.y)]),lens=[0];for(let i=1;i<Q.length;i++)lens.push(lens[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));const total=lens[lens.length-1];if(total<2)return;
  const at=d=>{let i=1;while(i<Q.length-1&&lens[i]<d)i++;const t=(d-lens[i-1])/((lens[i]-lens[i-1])||1);return[Q[i-1][0]+(Q[i][0]-Q[i-1][0])*t,Q[i-1][1]+(Q[i][1]-Q[i-1][1])*t,Math.atan2(Q[i][1]-Q[i-1][1],Q[i][0]-Q[i-1][0])];};
  ctx.save();const step=6.5*scale,start=27*scale+(reducedMotion?0:(world.time*14*scale)%step);let k=0;
  for(let d=start;d<total;d+=step,k++){const f=d/total,q=at(d),dry=f>dryFrom,a=dry?.4*(1-f*.4):warn?.9*(1-f*.3):(aim?.88:.6)*(1-f*.35),col=dry?P.dim:warn?P.amber:P.phos;
    ctx.fillStyle=`rgba(${col},${a.toFixed(3)})`;const s=(aim?1.3:1.05)*scale;ctx.fillRect(q[0]-s/2,q[1]-s/2,s,s);
    // every sixth sample a tick across the line, the plot's own time marks
    if(k%6===5){const nx=-Math.sin(q[2]),ny=Math.cos(q[2]);ctx.strokeStyle=`rgba(${col},${(a*.9).toFixed(3)})`;ctx.lineWidth=.7*scale;ctx.beginPath();ctx.moveTo(q[0]-nx*2.6*scale,q[1]-ny*2.6*scale);ctx.lineTo(q[0]+nx*2.6*scale,q[1]+ny*2.6*scale);ctx.stroke();}}
  if(aim?.perfect&&!preview.fogged){const x=sx(aim.cx+Math.cos(aim.entryAngle)*aim.radius),y=sy(aim.cy+Math.sin(aim.entryAngle)*aim.radius),q=3.2*scale;
    ctx.strokeStyle=`rgb(${P.white})`;ctx.lineWidth=1*scale;ctx.strokeRect(x-q,y-q,q*2,q*2);ctx.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.moveTo(x+Math.cos(a)*4.6*scale,y+Math.sin(a)*4.6*scale);ctx.lineTo(x+Math.cos(a)*6.8*scale,y+Math.sin(a)*6.8*scale);}ctx.stroke();}
  ctx.restore();
}

// ---------- The traveller: a spacecraft, the Observer Core at its sensor's boresight ----------
// Not a hand holding anything, but the hand's own extension sent where it cannot go: a small hull, the camera on
// its scan platform leading, the big dish trailing and turned home, and the booms a real deep-space craft carries
// out of the way of its instruments. The silhouette is a generic deep-space layout, not one named mission's
// (07-flyby.md, "The bodies"). The Core sits at the camera's boresight, the point doing the looking — not at the
// dish, the point talking to Earth.
let flyCraft=null,flyCraftKey='';
function flyCraftSprite(){
  const key=DPR.toFixed(2);if(flyCraft&&flyCraftKey===key)return flyCraft;flyCraftKey=key;
  const S=1.15,size=80,c=makeCanvas(Math.round(size*DPR),Math.round(size*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);g.scale(S,S);
  const foil=(y0,y1,a,b,dk)=>{const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,a);gr.addColorStop(.35,b);gr.addColorStop(1,dk);return gr;};
  g.lineJoin='round';g.lineCap='round';
  // the magnetometer boom, long and thin, trailing up and back; the RTG boom down and back with its power units
  g.strokeStyle='rgba(190,196,206,.9)';g.lineWidth=.45;g.beginPath();g.moveTo(-6,-3.6);g.lineTo(-19,-24);g.stroke();
  for(let i=1;i<6;i++){const u=i/6;g.beginPath();g.moveTo(-6-13*u-.6,-3.6-20.4*u);g.lineTo(-6-13*u+.6,-3.6-20.4*u);g.stroke();}
  g.lineWidth=.7;g.beginPath();g.moveTo(-5,4);g.lineTo(-9,15);g.stroke();
  for(let i=0;i<3;i++){const px=-7.4-i*1.3,py=10+i*2.4;g.fillStyle=foil(py-1.2,py+1.2,'rgb(90,92,96)','rgb(170,172,176)','rgb(40,42,46)');g.save();g.translate(px,py);g.rotate(1.2);g.fillRect(-1.1,-1.3,2.2,2.6);g.strokeStyle='rgba(20,22,26,.9)';g.lineWidth=.25;g.strokeRect(-1.1,-1.3,2.2,2.6);g.restore();}
  // the science boom forward, and the scan platform at its end: two cameras, their lenses to the front
  g.strokeStyle='rgba(200,204,212,.95)';g.lineWidth=.8;g.beginPath();g.moveTo(1,0);g.lineTo(15,0);g.stroke();
  g.fillStyle=foil(-3.6,3.6,'rgb(70,70,72)','rgb(150,150,154)','rgb(26,26,28)');g.fillRect(14.5,-3.6,5.5,7.2);g.strokeStyle='rgba(16,18,22,.95)';g.lineWidth=.35;g.strokeRect(14.5,-3.6,5.5,7.2);
  g.fillStyle='rgb(210,214,220)';g.fillRect(20,-3,1.4,2.2);g.fillRect(20,.6,1.4,2.6);g.fillStyle='rgba(40,70,110,.95)';g.beginPath();g.ellipse(21.4,-1.9,.5,1,0,0,TAU);g.fill();g.beginPath();g.ellipse(21.4,1.9,.5,1.2,0,0,TAU);g.fill();
  // the bus: a ring of electronics bays under black and gold thermal blanket
  g.fillStyle=foil(-4.8,4.8,'rgb(200,160,70)','rgb(248,214,120)','rgb(90,64,20)');g.beginPath();g.moveTo(-9,-3.4);g.lineTo(-7,-4.8);g.lineTo(0,-4.8);g.lineTo(2,-3.4);g.lineTo(2,3.4);g.lineTo(0,4.8);g.lineTo(-7,4.8);g.lineTo(-9,3.4);g.closePath();g.fill();g.strokeStyle='rgba(30,22,8,.9)';g.lineWidth=.35;g.stroke();
  g.strokeStyle='rgba(60,40,10,.5)';g.lineWidth=.25;g.beginPath();for(const x of[-6,-3.5,-1])g.moveTo(x,-4.8),g.lineTo(x,4.8);g.stroke();
  g.fillStyle='rgba(20,20,22,.85)';g.fillRect(-5.2,-1.4,3,2.8);
  // the high-gain dish trailing, its face turned back toward the Earth, and the feed on its struts
  g.strokeStyle='rgba(210,214,222,.9)';g.lineWidth=.35;g.beginPath();g.moveTo(-9,-3);g.lineTo(-15.5,0);g.lineTo(-9,3);g.stroke();
  const dg=g.createLinearGradient(-14,-12,-9,12);dg.addColorStop(0,'rgb(252,253,255)');dg.addColorStop(.5,'rgb(214,218,226)');dg.addColorStop(1,'rgb(120,126,138)');
  g.fillStyle=dg;g.beginPath();g.ellipse(-11,0,3.2,12,0,0,TAU);g.fill();g.strokeStyle='rgba(40,44,54,.9)';g.lineWidth=.4;g.stroke();
  g.strokeStyle='rgba(120,126,140,.6)';g.lineWidth=.25;g.beginPath();g.ellipse(-11,0,1.8,7,0,0,TAU);g.stroke();
  g.fillStyle='rgb(230,232,238)';g.beginPath();g.arc(-15.5,0,.8,0,TAU);g.fill();
  // a thin rim of light along the lit edge, so the craft is never lost against the black
  g.strokeStyle='rgba(200,226,255,.45)';g.lineWidth=.35;g.beginPath();g.moveTo(-7,-5.1);g.lineTo(0,-5.1);g.moveTo(14.5,-3.9);g.lineTo(20,-3.9);g.stroke();
  flyCraft={canvas:c,size,S,core:22.3*S};return flyCraft;
}
function flyPlayer(){
  if(world.state==='dead')return;
  const P=ink.flyby,p=world.player,sp=flyCraftSprite(),{x,y,ang}=heldPose(-20*sp.S,23*sp.S),t=reducedMotion?0:world.time;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);
  // the boresight ahead of the camera, faint, so the craft reads as pointing
  const sl=ctx.createLinearGradient(sp.core,0,sp.core+34,0);sl.addColorStop(0,`rgba(${P.phos},.35)`);sl.addColorStop(1,`rgba(${P.phos},0)`);ctx.strokeStyle=sl;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(sp.core+2,0);ctx.lineTo(sp.core+34,0);ctx.stroke();
  ctx.drawImage(sp.canvas,-sp.size/2,-sp.size/2,sp.size,sp.size);
  const ax=sp.core,br=1+.08*Math.sin(t*2.1),hg=ctx.createRadialGradient(ax,0,0,ax,0,9*br);
  hg.addColorStop(0,'rgba(255,250,232,.95)');hg.addColorStop(.35,'rgba(255,240,200,.45)');hg.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=hg;ctx.beginPath();ctx.arc(ax,0,9*br,0,TAU);ctx.fill();
  ctx.fillStyle=`rgb(${P.core})`;ctx.beginPath();ctx.arc(ax,0,1.8,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(${P.phos},.8)`;ctx.lineWidth=.5;ctx.beginPath();ctx.arc(ax,0,2.6,0,TAU);ctx.stroke();
  // the charges held: the vault as a hexagonal shield, the lock as signal arcs, the big dish's margin as a ring of ticks
  const cr=6;
  if(p.shielded){ctx.strokeStyle=`rgba(${P.amber},.75)`;ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/6;i?ctx.lineTo(Math.cos(a)*(26+cr),Math.sin(a)*(26+cr)):ctx.moveTo(Math.cos(a)*(26+cr),Math.sin(a)*(26+cr));}ctx.stroke();}
  if(p.reflectorArmed){ctx.strokeStyle=`rgba(${P.phos},.9)`;ctx.lineWidth=1.4;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-14,0,20+cr+i*3,Math.PI-.5,Math.PI+.5);ctx.stroke();}}
  if(p.dawnArmed){ctx.strokeStyle=`rgba(${P.white},.8)`;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<12;i++){const a=i*TAU/12;ctx.moveTo(Math.cos(a)*(21+cr),Math.sin(a)*(21+cr));ctx.lineTo(Math.cos(a)*(i%2?23+cr:25.5+cr),Math.sin(a)*(i%2?23+cr:25.5+cr));}ctx.stroke();}
  ctx.restore();
}

// ---------- LOS: the boundary as a link losing lock ----------
// This era's word for the boundary is the network's own, Loss of Signal, and what fails as it nears is what a
// digital link actually does (07-flyby.md, "The frontier"): never static as decoration, but scan lines replaced
// by flat dropout bands, mosaic tiles that never resolve and sit grey among the ones that did, a frame counter
// that skips instead of climbing. It thickens toward the edge rather than dropping like a curtain, since
// received power falls with distance while the noise holds steady. The edge itself stays the sharpest line in
// the field, cut in the square steps of a raster. Its place, rate and grace are read straight off the state
// drawDark reads, and untouched.
function flyDark(dt){
  const P=ink.flyby,fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  const level=Math.floor(world.floorY/30),tick=reducedMotion?0:Math.floor(world.time*4),reach=(96+near*50)*scale,pitch=Math.max(2.5,3*scale),stepW=6*scale;
  ctx.save();
  // the dropout field above the edge, thicker as it nears
  for(let yy=fy-reach,j=0;yy<fy;yy+=pitch,j++){const u=1-(fy-yy)/reach,p=u*u*(.75+near*.2),h=tileHash(j+level*7,tick,101);if(h>p)continue;
    // a dropped run of a scan line, not a whole line: short near the top of the field, longer toward the edge
    const w=W*(.06+tileHash(j,tick+level,103)*(.2+u*.45)),x0=tileHash(j+level*7,tick,102)*(W-w),dark=tileHash(j,tick,104)<.55;
    ctx.fillStyle=dark?`rgba(0,0,0,${(.35+u*.5).toFixed(3)})`:`rgba(${P.dim},${(.16+u*.34).toFixed(3)})`;ctx.fillRect(Math.round(x0),Math.round(yy),Math.round(w),Math.max(1,Math.round(pitch*.8)));}
  // grey placeholder tiles along the edge, the ones that never came down
  const ts=22*scale;for(let i=0;i<Math.ceil(W/ts)+1;i++){const hh=tileHash(i,level,105);if(hh>.35+near*.3)continue;const tx=i*ts,ty=fy-ts*(1+Math.floor(tileHash(i,level,106)*2));
    ctx.fillStyle=`rgba(${P.faint},.92)`;ctx.fillRect(tx,ty,ts-1,ts-1);ctx.strokeStyle=`rgba(${P.dim},.7)`;ctx.lineWidth=.5;ctx.strokeRect(tx+.5,ty+.5,ts-2,ts-2);ctx.beginPath();ctx.moveTo(tx+3,ty+3);ctx.lineTo(tx+ts-4,ty+ts-4);ctx.moveTo(tx+ts-4,ty+3);ctx.lineTo(tx+3,ty+ts-4);ctx.stroke();}
  // below the edge: nothing received at all, a flat black over a faint grid of frames still owed
  const edge=[];for(let x=0;x<=W+stepW;x+=stepW){const q=Math.floor(x/stepW);edge.push([x,fy+Math.round((tileHash(q,level,107)-.5)*3)*2*scale]);}
  ctx.beginPath();ctx.moveTo(0,edge[0][1]);for(let i=0;i<edge.length;i++){const [x,y]=edge[i];ctx.lineTo(x,y);if(i+1<edge.length)ctx.lineTo(edge[i+1][0],y);}ctx.lineTo(W+10,H+10);ctx.lineTo(-10,H+10);ctx.closePath();
  ctx.fillStyle='rgba(1,1,2,.985)';ctx.fill();ctx.save();ctx.clip();ctx.strokeStyle=`rgba(${P.faint},.8)`;ctx.lineWidth=.5;ctx.beginPath();
  const g0=((fy%ts)+ts)%ts;for(let x=0;x<W;x+=ts){ctx.moveTo(x,fy);ctx.lineTo(x,H);}for(let y=fy+g0;y<H;y+=ts){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();
  for(let i=0;i<4;i++){const ly=fy+(30+i*44)*scale;if(ly>H)break;flyMono(ctx,'NO SYNC · NO SYNC · NO SYNC',W*(.2+tileHash(i,level,108)*.6),ly,6.5,P.faint,.9,'center');}
  ctx.restore();
  // the edge: a square-stepped raster line, bright, the sharpest thing in the field
  ctx.strokeStyle=`rgba(${P.white},${(.75+near*.2).toFixed(3)})`;ctx.lineWidth=Math.max(1,1.1*scale);ctx.beginPath();ctx.moveTo(0,edge[0][1]);for(let i=0;i<edge.length;i++){const [x,y]=edge[i];ctx.lineTo(x,y);if(i+1<edge.length)ctx.lineTo(edge[i+1][0],y);}ctx.stroke();
  // what is lost is named plainly: LOS, and the frame counter jumping the frames that never arrived
  const f0=1200+Math.abs(level)*7%88000,lost=2+Math.floor(tileHash(level,1,109)*9);
  flyMono(ctx,'LOS',W-FLY_BAND-8,fy-9*scale,Math.max(9,10*scale),P.amber,.95,'right');
  flyMono(ctx,'FRM '+String(f0).padStart(5,'0')+' > '+String(f0+lost).padStart(5,'0')+' · '+lost+' LOST',FLY_BAND+8,fy-9*scale,Math.max(6.5,7*scale),P.grey,.85,'left');
  ctx.restore();
}

// ---------- A target mapped ----------
// Where the atlas engraves a constellation-figure, this era draws the mosaic the three were taken in: a frame
// round them tiled as a mission's footprint plot is, its tiles locking as the stars are held, the target's name
// and the mission that mapped it set once it is whole.
function flyMarkName(str,x,y,size,variant){const w=flyTextWidth(str,size,variant);markGround('caption',x-w/2-2,y-size*.62,x+w/2+2,y+size*.62);}
const flyTargetOf=chart=>FLY_TARGETS[((chart.catalogueIndex|0)%12+12)%12];
function flyFigure(chart){
  if(chart.stars.length<3)return;const P=ink.flyby;
  const pts=chart.stars.map(s=>[sx(s.x),sy(s.y)]),ys=pts.map(p=>p[1]);if(Math.max(...ys)<-240||Math.min(...ys)>H+240)return;
  const count=chart.stars.filter(n=>n.visited).length,done=chart.completed,f=chart.expired?.3:done?1:count/3;if(f<=0)return;
  const T=flyTargetOf(chart),al=chart.expired?.35:1,pad=26*scale;let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const p of pts){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}
  x0-=pad;y0-=pad;x1+=pad;y1+=pad;const cols=3,rows=2,tw=(x1-x0)/cols,th=(y1-y0)/rows,N=cols*rows,order=flyTileOrder(chart.catalogueIndex|0,N);
  ctx.save();ctx.globalAlpha=al;
  for(let k=0;k<N;k++){const on=clamp(f*N-k,0,1);if(on<=0)continue;const t=order[k],tx=x0+(t%cols)*tw,ty=y0+Math.floor(t/cols)*th;ctx.fillStyle=`rgba(${P.phos},${(.035*on).toFixed(3)})`;ctx.fillRect(tx,ty,tw,th);ctx.strokeStyle=`rgba(${P.phosDim},${(.6*on).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.strokeRect(tx+.5,ty+.5,tw-1,th-1);}
  ctx.strokeStyle=`rgba(${P.grey},.55)`;ctx.lineWidth=Math.max(.6,.8*scale);ctx.beginPath();for(const [fx,fy] of[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]){ctx.moveTo(fx-5*scale,fy);ctx.lineTo(fx+5*scale,fy);ctx.moveTo(fx,fy-5*scale);ctx.lineTo(fx,fy+5*scale);}ctx.stroke();
  flyMono(ctx,'TARGET '+T[0],x0+2*scale,y0-7*scale,Math.max(7,7.5*scale),P.phos,.9);
  if(done){const nx=clamp((x0+x1)/2,90,W-90),ny=y1+12*scale,sz=Math.max(9,9.5*scale),s=T[0]+' · '+T[1];flyGrot(ctx,s,nx,ny,sz,P.white,.95,'center');flyMarkName(s,nx,ny,sz,'grot');}
  ctx.restore();
}
// A target's route before it is mapped: straight lines between its moons, dotted while only planned and solid
// once both ends are held, each numbered as a sequence plan numbers them, and the target named small by its
// middle moon while the route is live.
function flyChartRoute(chart){
  if(!chart.stars.length||sy(chart.entry.y)<-150||sy(chart.stars[chart.stars.length-1].y)>H+170)return;
  const P=ink.flyby,points=[chart.entry,...chart.stars];if(chart.exit)points.push(chart.exit);
  ctx.save();revealChartClip(chart);ctx.lineCap='round';
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],lit=chart.completed||(a.visited&&b.visited),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
    const ax=sx(a.x+dx/d*(a.cap+10)),ay=sy(a.y+dy/d*(a.cap+10)),bx=sx(b.x-dx/d*(b.cap+10)),by=sy(b.y-dy/d*(b.cap+10));
    ctx.strokeStyle=`rgba(${lit?P.phos:P.dim},${chart.expired?.12:lit?.5:.55})`;ctx.lineWidth=(lit?.7:.55)*scale;ctx.setLineDash(lit?[]:[1.5*scale,3.5*scale]);
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();}
  ctx.setLineDash([]);
  chart.stars.forEach((n,i)=>{const x=sx(n.x)-(n.r*.62+8)*scale,y=sy(n.y)-(n.r*.62+8)*scale,a=chart.expired?.2:n.visited?.85:.6;flyMono(ctx,'#'+(i+1),x,y,Math.max(7.5,8*scale),n.visited?P.phos:P.grey,a,'center');});
  if(!chart.expired&&!chart.completed&&!captionsHeld()){const e=chart.stars[1]||chart.stars[0],x=sx(e.x),y=sy(e.y)+e.cap*scale+14*scale;if(y>-40&&y<H+40)flyMono(ctx,flyTargetOf(chart)[0],x,y,Math.max(7.5,8*scale),P.grey,.7,'center');}
  ctx.restore();
}

// ---------- The HUD: a console, not a page ----------
// Set at the head of the sheet in the telemetry hand: the downlink as the score, in bits, its digits ticking
// whole; the propellant as a segmented gauge in metres a second of Δv, amber once it will not carry a transfer;
// the encounter, the network complex holding contact, and the lock streak. The DOM HUD stays for screen readers
// and is taken off the screen (index.html).
const FLY_DSN=['GOLDSTONE','CANBERRA','MADRID'];
function flyHudLeaf(){
  if(!world||world.state==='ready')return;
  if(world.won){flyFinale();return;}
  const P=ink.flyby,top=flyHudTop(),words=plateWords().hud,score=world.score|0,level=world.inkLevel(),low=level<=.34,pulse=low&&!reducedMotion?.5+.5*Math.sin(world.time*6):1,ci=flyChapterOf(world),C=FLY_CHAPTERS[ci];
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  const left=FLY_BAND+10,right=W-FLY_BAND-12,cx=W/2,m=world.speedMultiplier(),pace=words.pace+(m%1?m.toFixed(1):m);
  ctx.fillStyle='rgba(2,3,5,.72)';ctx.fillRect(left-4,top-9,102,34);ctx.strokeStyle=`rgba(${P.phosDim},.5)`;ctx.lineWidth=.6;ctx.strokeRect(left-4,top-9,102,34);
  flyGrot(ctx,'DOWNLINK · BITS',left,top-2,7,P.grey,.9);flyMono(ctx,String(score).padStart(7,'0'),left,top+13,16,P.phos,.98);
  // the propellant gauge
  const gw=Math.min(112,W*.27),gx=cx-gw/2,gy=top-4,cells=16;flyGrot(ctx,'PROPELLANT',gx,gy-4,7,P.grey,.9);flyMono(ctx,'ΔV '+String(Math.round(level*1600)).padStart(4,'0')+' M/S',gx+gw,gy-4,7,low?P.amber:P.white,.9,'right');
  for(let i=0;i<cells;i++){const on=(i+1)/cells<=level+1e-6,x=gx+i*gw/cells;ctx.fillStyle=on?(low?`rgba(${P.amber},${(.55+.45*pulse).toFixed(3)})`:`rgba(${P.phos},.9)`):`rgba(${P.faint},.9)`;ctx.fillRect(x+.6,gy+2,gw/cells-1.2,7);}
  flyMono(ctx,pace,gx,gy+18,7.5,P.grey,.9,'left');flyMono(ctx,'ENC '+FLY_ROMAN[ci],gx+gw,gy+18,7.5,P.grey,.9,'right');
  flyMono(ctx,C.craft+' · '+C.place+' '+C.year,cx,gy+30,7.5,P.phos,.8,'center');
  // the network complex holding contact, handed round the three as the Earth turns, and AOS while it holds
  const dsn=FLY_DSN[Math.floor((reducedMotion?0:world.time)/24)%3];
  ctx.save();ctx.strokeStyle=`rgba(${P.white},.85)`;ctx.lineWidth=.8;const dx=right-4,dy=top+2;ctx.beginPath();ctx.ellipse(dx,dy,5,2.2,-.5,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(dx,dy+1.5);ctx.lineTo(dx,dy+7);ctx.moveTo(dx-3,dy+7);ctx.lineTo(dx+3,dy+7);ctx.stroke();ctx.restore();
  flyMono(ctx,'AOS · '+dsn,right-13,top+2,7,P.phos,.9,'right');
  let rx=right;if(world.combo>1&&world.captures>0){const shown=Math.min(6,world.combo);ctx.strokeStyle=`rgba(${P.phos},.9)`;ctx.lineWidth=.8;for(let i=0;i<shown;i++){ctx.strokeRect(rx-3.5,top+12.5,7,7);rx-=11;}
    if(world.combo>6)flyMono(ctx,'x'+world.combo,right+4,top+28,8,P.grey,.85,'right');}
  let ix=right;const iy=top+40,p=world.player,badge=type=>{ctx.save();ctx.strokeStyle=`rgba(${P.grey},.6)`;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(ix,iy,9.5,0,TAU);ctx.stroke();ctx.restore();flyGift({type,r:20},ix,iy,false,.85);ix-=24;};
  if(p.shielded)badge('shield');if(p.reflectorArmed)badge('reflector');if(p.dawnArmed)badge('dawn');
  ctx.restore();
}
// The finish: the era file's own signature sheet. Mariner 4's strip chart laid out whole, a data table made
// legible with a box of pastels bought that morning; beneath it the mission log, every encounter's frame side
// by side; and under them what this era did that no other on the ladder did.
function flyFinale(){
  const P=ink.flyby,time=world.player.deadTime,t=reducedMotion?1:clamp(time/1.2,0,1),e=1-Math.pow(1-t,3);
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=`rgba(${P.vac},${(.92*e).toFixed(3)})`;ctx.fillRect(0,0,W,H);
  const R=Math.min(W*.2,H*.1,84),y=lerp(H*.42,H*.34,e);
  flyGrot(ctx,'MARS · 15 JULY 1965',W/2,y-R*1.2-26,Math.min(22,W*.055),P.white,.95*e,'center');
  flyMono(ctx,'A TABLE OF NUMBERS, COLOURED BY HAND',W/2,y-R*1.2-9,Math.min(9,W*.022),P.grey,.9*e,'center');
  ctx.save();ctx.translate(W/2,y);ctx.globalAlpha=e;flyFrame(ctx,R,1,reducedMotion?1:clamp((time-.2)/2.2,0,1));ctx.restore();
  const r=Math.min(W/7.2/1.7,18),gap=r*3.7,ly=y+R*1.2+r*1.4+24;
  flyMono(ctx,'THE MISSION LOG',W/2,ly-r*1.2-10,8,P.phos,.9*clamp((time-.9)/.4,0,1),'center');
  for(let i=0;i<6;i++){const k=clamp((time-1-i*.18)/.5,0,1);if(k<=0)continue;const x=W/2+(i-2.5)*gap;ctx.save();ctx.translate(x,ly);ctx.globalAlpha=k;flyFrame(ctx,r,i+1,1,{bare:true});ctx.restore();flyMono(ctx,String(FLY_CHAPTERS[i].year),x,ly+r*1.2+7,6.5,P.grey,.9*k,'center');}
  const lk=.9*clamp((time-2.2)/.5,0,1),vy=ly+r*1.2+30;
  flyGrot(ctx,'It went, and looked, and was right.',W/2,vy,12,P.white,lk,'center');
  flyGrot(ctx,'The next machine will not need anyone at the other end.',W/2,vy+18,11,P.grey,lk,'center');
  ctx.restore();
}
function flyInscriptionInk(caps){const P=ink.flyby;return [{rgb:'0,0,0',alpha:caps?.6:.5,dx:.6,dy:.6},{rgb:P.white,alpha:caps?.95:.88,dx:0,dy:0}];}
// The downlink on the leaf: a telemetry card with the count in phosphor and the log's progress beneath it.
function flyPaintEndNumerals(canvas,w){
  if(!canvas)return;const P=ink.flyby,rec=flyRead(),Wd=240,Hd=80,dpr=Math.min(Math.max(window.devicePixelRatio||1,1.5),2);
  canvas.width=Math.ceil(Wd*dpr);canvas.height=Math.ceil(Hd*dpr);canvas.style.width=Wd+'px';canvas.style.height=Hd+'px';
  const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,Wd,Hd);
  g.fillStyle='rgba(2,3,5,.96)';g.fillRect(34,4,Wd-68,50);g.strokeStyle=`rgba(${P.phosDim},.8)`;g.lineWidth=.8;g.strokeRect(34,4,Wd-68,50);
  flyMono(g,String(w.score|0).padStart(7,'0'),Wd/2,24,22,P.phos,.98,'center');flyMono(g,'BITS RECEIVED',Wd/2,44,8,P.grey,.9,'center');
  flyMono(g,'LOG · '+flyBits(rec.worlds)+'/7 WORLDS · '+flyBits(rec.targets)+'/12 TARGETS',Wd/2,68,7.5,P.white,.85,'center');
}
// A landing's note and its running tally, in the console's white, marked with a small bracket where the atlas
// sets its pointing hand.
function flyNoteMark(x,y,hand,alpha){ctx.strokeStyle=`rgba(${ink.flyby.phos},${alpha})`;ctx.lineWidth=.9;ctx.strokeRect(x-hand*.55,y,hand*1.1,hand*1.1);}
function flyFloater(f,fb,alpha){
  if(!fb)return null;const size=Math.max(10.5,12*scale),hand=Math.max(4.5,6*scale),{x,y,left}=fb;
  ctx.fillStyle=`rgba(${ink.flyby.white},${alpha})`;ctx.font=plateFace(size,'grot');ctx.textAlign=left?'left':'right';ctx.fillText(f.text,x,y);
  flyNoteMark(x+(left?-hand*1.5:hand*1.5),y-hand*.62,hand,alpha*.85);
}
function flyTally(t,tb,alpha){
  const size=Math.max(10.5,12*scale),size2=Math.max(9,10.5*scale),hand=Math.max(4.5,6*scale);
  ctx.fillStyle=`rgba(${ink.flyby.white},${alpha})`;ctx.font=plateFace(size,'grot');ctx.textAlign=t.left?'left':'right';ctx.fillText(t.line1,tb.x,tb.y);
  ctx.fillStyle=`rgba(${ink.flyby.phos},${alpha})`;ctx.font=plateFace(size2,'mono');ctx.fillText(t.line2,tb.x,tb.y+size*.98);
  flyNoteMark(tb.x+(t.left?-hand*1.5:hand*1.5),tb.y-hand*.62,hand,alpha*.85);
}
function flyNone(){}
function invalidateFlybyArt(){flyLayers[0]=flyLayers[1]=flyLayers[2]=null;flyLayerKey='';flySprites.clear();flyArts.clear();flyPicArts.clear();flyCraft=null;flyCraftKey='';flyHudTopPx=null;flyRevealCanvas=null;flyRevealKey='';}
function flyFaceReady(){
  if(!document.fonts||!document.fonts.load)return;
  Promise.all([document.fonts.load(plateFace(16,'mono'),'DOWNLINK'),document.fonts.load(plateFace(16,'grot'),'FLYBY')]).then(()=>{invalidateFlybyArt();if(world)render(0);}).catch(()=>{});
}

// ---------- The instrument's sound ----------
// A short rising two-tone chirp for acquisition — carrier lock, not a guide star found; a dry hiss cut short for
// a burn; a soft tick under the flight; and for loss of signal, static rising and then plain silence — an
// absence, not a klaxon, because a real LOS is exactly that (07-flyby.md, "Sound").
defineHand('flyby',{
  atmosphere:flyAtmosphere,
  node:flyNode,
  hazard:flyHazard,
  player:flyPlayer,
  dark:flyDark,
  plateFrame:flyNone,
  laid:flyNone,
  figure:flyFigure,
  surveys:flyNone,
  hudLeaf:flyHudLeaf,
  runningHead:flyNone,
  chapterReveal:flyChapterReveal,
  flourish:flyFlourish,
  trail:flyTrail,
  aim:flyAim,
  inkPath:flyInkPath,
  inscriptionInk:flyInscriptionInk,
  lenses:flyNone,
  hazardReveal:flyHazardReveal,
  ready:flyFaceReady,
  best:flyBest,
  caveRun:flyRecordRun,
  caveAnimal:i=>flyNoteTarget(i),
  chartRoute:flyChartRoute,
  floater:flyFloater,
  tally:flyTally,
  endNumerals:flyPaintEndNumerals,
  scratch:{band:[5200,4200],q:[2,2],peak:.018,attack:.001,dur:[.006,.012],gap:[.09,.13],ease:.02},
  start(a){a.tone(55,1.8,0,.08,'sine');a.tone(660,.12,.1,.12);a.tone(990,.18,.22,.12);},
  release(a){a.brush(6400,.12);a.tone(170,.07,0,.06,'square',110);},
  capture(a,row,perfect){a.tone(880,.08,0,.12);a.tone(1320,.13,.08,.12);if(perfect)a.tone(1760,.12,.2,.08);a.tone(55,.6,0,.04,'sine');},
  graze(a){a.tone(1250,.08,0,.07,'square',900);},
  death(a){a.wash(700,5200,.8,.16);a.tone(90,.5,0,.1,'sine',40);},
  medal(a){for(let i=0;i<3;i++)a.tone(i===2?1760:1320,.07,i*.12,.09,'square');a.tone(523.25,1.1,.4,.1);},
  chapter(a,i){flyNoteChapter(i);a.tone(660,.1,0,.12);a.tone(990,.16,.1,.12);a.tone(110,1.6,.05,.08,'sine');},
  dawn(a){flyNoteChapter(FLY_CHAPTERS.length-1);a.tone(55,3,0,.1,'sine');[440,554.37,659.25,880,1108.73].forEach((f,i)=>a.tone(f,1.4,.15+i*.14,.08));}
});

// ---------- The vocabulary: only what this era calls differently ----------
// Modern operational English, almost all of it attested (07-flyby.md, "Names"): the run is the mission, the score
// the downlink, the currency propellant, a chapter an encounter, the boundary loss of signal.
defineVoice('flyby',{
  chart:'TARGET',
  chartNoun:'target',
  chartVerb:'mapped',
  chartNames:FLY_TARGETS.map(t=>t[0]+' · '+t[1]),
  chartSaid:'{chart} is mapped. Sixty toward the downlink. The signal holds for four seconds.',
  chapters:FLY_CHAPTERS.map(c=>c.place+' · '+c.year),
  chapterRows:FLY_CHAPTER_ROWS,
  goalRow:FLY_GOAL_ROW,
  // The Journey's milestones: Mars, the Grand Tour, and the edge of the planets, two encounters apiece.
  milestones:['MARS','THE GRAND TOUR','THE EDGE OF THE PLANETS'],
  chapterSaid:'Encounter {numeral}. {name}.',
  chapterLines:[
    'Mars, 1965. Mariner 4 sends its pictures home at about eight bits a second. Engineers colour the first by hand, from the printed numbers.',
    'Chryse Planitia, 1976. Viking 1 lands, and its camera scans the ground beside it one narrow column at a time.',
    'Jupiter, 1979. Linda Morabito, a navigation engineer, finds a plume rising off Io’s limb: the first active volcano seen beyond the Earth.',
    'Uranus, 1986. Voyager 2 photographs the narrow rings that a star’s winks had revealed from an aircraft in 1977.',
    'Neptune, 1989. Voyager 2’s last planet: a dark storm about the size of the Earth, gone when Hubble looked again.',
    'Pluto, 2015. New Horizons passes once and never returns. Its colours are enhanced, and the caption says so.'
  ],
  chartNotes:[
    'Io: Linda Morabito saw a plume off its limb in a navigation frame in March 1979.',
    'Europa: Voyager’s frames showed bright ice crossed by dark cracks; the case for an ocean beneath came later, from Galileo.',
    'Ganymede: the largest moon in the Solar System, wider than the planet Mercury.',
    'Callisto: one of the most heavily cratered surfaces known, with the great ringed basin Valhalla.',
    'Titan: the Huygens probe landed in January 2005 and photographed rounded pebbles of ice on its floor.',
    'Enceladus: Cassini found jets of water ice venting from its south pole in 2005.',
    'Miranda: Voyager 2 found a patchwork of grooved ground and cliffs many kilometres high.',
    'Triton: Voyager 2 saw dark streaks laid down by plumes on its frozen surface.',
    'Charon: New Horizons found a reddish cap over its north pole.',
    'Eros: NEAR Shoemaker orbited it for a year and then touched down, though it was never built to land.',
    'Itokawa: Hayabusa brought grains of it back to the Earth in 2010.',
    '67P: Rosetta’s lander Philae bounced and came to rest in shadow in November 2014.'
  ],
  opening:'The mission is launched. Tap to release. Follow the predicted course to the next light. Hold a light until its picture comes home, and to take on more propellant; every flight spends propellant by the distance it carries. Fly from Mars in 1965 to Pluto.',
  ended:'Loss of signal. Downlink {score} bits. Tap to launch again, or return to the atlas.',
  won:'The mission log is complete. Downlink {score} bits. Tap to begin again or return to the atlas.',
  unrecorded:'ERA PREVIEW · NOT RECORDED',
  newRecord:'A NEW DOWNLINK RECORD',
  hazards:{vortex:'GRAVITY WELL',flare:'THE RADIATION BELT',wind:'SOLAR WIND'},
  labels:{shield:'THE RADIATION VAULT',reflector:'HIGH-GAIN LOCK',dawn:'THE 70-METRE DISH'},
  pressures:{relaxed:'THE MOON',classic:'MARS',hardcore:'NEPTUNE'},
  pressureSet:'TARGET ACQUIRED · {label}',
  losses:{
    'THE DARK CAUGHT UP':'LOSS OF SIGNAL',
    'LEFT THE STAR CHART':'OFF THE NAVIGATION PLOT',
    'THE ORBIT FADED':'THE TARGET WAS LOST',
    'THE NIB RAN DRY':'OUT OF PROPELLANT',
    'DRAWN INTO A VORTEX':'LOST IN A GRAVITY WELL',
    'SEARED BY A SUNSPOT FLARE':'FRIED IN THE RADIATION BELT',
    'THE SUN ROSE':'THE MISSION LOG IS COMPLETE'
  },
  observations:{
    perfectThree:'THREE CLEAN ENCOUNTERS',
    skipFive:'FIVE LIGHTS PASSED BY',
    maxSpeed:'FULL VELOCITY',
    graze:'THE WELL GRAZED AT FULL VELOCITY',
    pureChart:'A TARGET MAPPED CLEANLY',
    fortyRows:'THE FORTIETH ROW',
    threeMinutes:'THREE MINUTES IN FLIGHT',
    rightAngle:'A SQUARE INSERTION'
  },
  squareLanding:'A SQUARE INSERTION',
  hud:{pace:'VEL ×',flow:'LOCK ×',shield:'THE VAULT HOLDS',reflector:'THE LOCK HOLDS',dawn:'THE DISH HOLDS'},
  chrome:{
    brand:'THE FLYBY',bestLabel:'Best downlink',endTitle:'Loss of signal.',endTitleWon:'The mission log is complete.',pauseTitle:'Safe mode.',
    pauseEyebrow:'THE CRAFT HOLDS ATTITUDE',pauseNote:'Tap the sheet to continue',pauseResume:'RESUME THE SEQUENCE',
    pauseLeave:'END THE MISSION',pauseLabel:'Enter safe mode',gameLabel:'The Flyby, a playable Era VII preview',
    canvasLabel:'The Flyby. Fly a spacecraft from Mars in 1965 to Pluto in 2015, holding each light until its picture comes home. Tap or press Space to release.',
    eraExit:'BACK TO THE ATLAS',eraExitLabel:'Back to the atlas',endAction:'Tap to launch again',endActionWon:'Tap to begin again',
    statCaptures:'Mapped',statPerfects:'Clean',statFlow:'Best lock',statRow:'Row',
    instructions:{head:'THE MISSION PLAN',rules:['Tap to release the craft.','Hold a light until its picture comes home.','Stay ahead of the loss of signal rising below.','Six encounters, Mars to Pluto. Choose the first target — {pressures}.']}
  },
  tips:{
    first:'Release when the predicted course reaches the next light.',
    dark:'Hold a light for velocity and propellant. The signal fails faster below.',
    faded:'A small body will not wait. Map it and move on.',
    vortex:'A gravity well bends the course toward it. Give it room.',
    angle:'Meet the rim along its curve for a clean insertion.',
    speed:'Clean insertions keep your velocity.',
    won:'Six encounters, and every picture came home.'
  },
  glosses:{
    slingshot:'GRAVITY ASSIST · VEL ×{factor}',
    maxSpeed:'FULL VELOCITY · HOLD THE COURSE',
    fullCharge:'TANKS FULL · VELOCITY IS YOURS',
    rough:'A ROUGH INSERTION · BASE {base}',
    skip:'{count} LIGHT{plural} PASSED BY · +{bonus}',
    reprieve:'MAP 3 LIGHTS · +60 & A REPRIEVE',
    slingOrbit:'CIRCLE FOR A GRAVITY ASSIST · TAP TO LEAVE',
    fading:'A SMALL BODY · KEEP MOVING',
    golden:'A COMET NUCLEUS',
    perfectFlow:'CLEAN INSERTION · LOCK ×{combo}',
    perfect:'CLEAN INSERTION',
    wandering:'A DRIFTING TARGET',
    chartProgress:'{chart} · {count} / 3',
    chartComplete:'{chart} · MAPPED +60',
    angleBonus:'  ·  TRUE ENTRY +{bonus}',
    multiplier:'  ·  ×{mult}',
    shieldArmed:'{label} · TURNS ONE BLOW',
    shieldBreak:'{label} SPENT · TOOK THE HIT',
    reflectorArmed:'{label} · SENDS YOU BACK FROM THE EDGE',
    reflectorBreak:'{label} TURNED YOU BACK',
    dawnArmed:'{label} · HOLDS THE SIGNAL',
    dawnBreak:'{label} PUSHED LOS BACK',
    inkwellFound:'AN AEROBRAKING PASS · MARGIN BOUGHT BACK',
    inkwellDry:'PROPELLANT RUNS LOW · FIND AN AEROBRAKING PASS',
    observation:'MAPPED · {name}',
    close:'CLOSE +5'
  },
  held:{
    choose:'The first target you hold sets how fast the signal fails.',
    dry:'Propellant is running low. Hold this light to take on more.',
    sling:'One circle is a gravity assist. Meet the next cleanly and it holds.',
    release:'Release when the predicted course meets the next light.',
    bend:'The well bends the course. Follow the prediction; give it room.'
  }
});

// The Journey's milestones through the flyby (LINKING.md): the frame the climb has reached — Mars before any is
// known, then Io, Neptune and Pluto — over three pricked points filled as each milestone is known.
defineHand('flyby',{journeyMark(g,w,h,m){
  const P=ink.flyby,stage=[1,3,5,6][Math.min(3,m.open)],R=Math.min(13,h*.18);
  g.save();g.translate(w/2,h*.4);flyFrame(g,R,stage,1,{bare:true});g.restore();
  for(let i=0;i<m.of;i++){const x=w/2+(i-(m.of-1)/2)*14,y=h-7;g.save();g.strokeStyle=`rgb(${P.phos})`;g.lineWidth=.8;g.strokeRect(x-2.6,y-2.6,5.2,5.2);
    const f=i<m.open?1:i===m.open?m.toward:0;if(f>0){g.fillStyle=`rgb(${P.phos})`;g.fillRect(x-2.6,y+2.6-5.2*f,5.2,5.2*f);}g.restore();}
}});
