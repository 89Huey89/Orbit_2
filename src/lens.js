'use strict';
/* Orbit · src/lens.js
   Era VI, The Lens: the era a point of light became a place, 1610–1990 — Galileo's Sidereus Nuncius and
   Huygens's Systema Saturnium, the Carte du Ciel's glass plates and the Harvard stacks, and the first
   rendered measurements, closed by a telescope carried above the air. */
// Like every other century beside the atlas, this era is a hand and not a fork: painters registered by name
// in `defineHand` below and reached wherever frame.js would otherwise draw the atlas's own, with everything
// it does not name still the atlas's. docs/archive/eras/06-lens.md is what the era is. None of the physics
// comes with it; the simulation is and stays OrbitWorld.
//
// What the sheet argues, in one line: this is the first century that claims to have seen a *surface*, and so
// the first that can be wrong about one. It does that in three registers worn in succession by the same act
// of resolving — the engraved drawing at the eyepiece, the silver negative on a glass plate, the rendered
// measurement — and the sheet climbs through all three as the run goes: the first twelve rows are drawn at
// the eyepiece on laid paper, the next twelve on a glass plate ruled with its réseau, the last twelve read
// off a sensor. The era file proposes reading the register off a ledger fraction; a preview has no ledger,
// so the register is read off the row instead, and the boundary between two of them is a real edge on the
// sheet — a plate lying on the paper, a readout replacing the plate — that a player climbs across.
//
// It is also told as a story, as the Astrolabe is: six chapters, each a place and a year, and at each one's
// opening the one planet this era got wrong longest and corrected best, Saturn, is drawn again the way that
// place drew it — three bodies at Padua, a ring at The Hague, a smear on glass at Paris, an annotated plate
// at Meudon, three filtered channels at Tucson, a lit sphere with its instrument margin in 1990. A run that
// reaches the thirty-sixth row lays the three registers' Saturns side by side, the era file's own signature
// sheet. How far the drawing has ever got is kept under its own key (orbit.lens.v1), and the frontispiece
// shows Saturn as far as any run has resolved it.

// ---------- The three materials ----------
// Register one is era V's own ground and ink, because a Huygens or a Herschel plate was the same medium;
// register two is silver on glass, the ground the clear emulsion and the dark the silver itself; register
// three is the observatory plate's sensor black and instrument white, with the three narrowband channels.
// Hexes from 06-lens.md, "Palette".
definePlate('lens',(()=>{const P={
  paper:'231,218,189',paperDeep:'214,197,160',ink:'52,38,26',inkSoft:'104,82,58',sepia:'122,88,54',wash:'150,116,80',rubric:'166,58,40',gold:'150,100,32',brass:'176,138,70',leather:'92,52,30',
  glass:'232,228,218',glassDeep:'212,208,196',silver:'26,23,20',silverMid:'138,131,120',reseau:'58,54,48',inkBlack:'20,18,16',inkRed:'138,35,24',cast:'201,214,210',sepiaPrint:'92,69,48',mirror:'150,166,188',
  sensor:'4,6,11',sensorHi:'18,24,34',instr:'233,242,250',instrSoft:'124,142,163',cyan:'128,208,242',sii:'232,72,47',ha:'57,196,106',oiii:'58,160,232',amber:'255,140,60',core:'255,247,220'};
  return{night:P,paper:P};})());

// ---------- The story: six places, three registers, one planet ----------
// Six rows to a chapter and thirty-six to the finish, the length the Astrolabe's journey and the Ceiling's
// night were measured to (scripts/probe.mjs). Two chapters to a register, in the order the era file gives
// its instruments: the eyepiece (1610–1887), the plate (1887–1958), the rendered measurement (1958–1990).
// `reading` is what that place made of Saturn, or of the sky, and is what its chapter opening draws.
const LENS_CHAPTER_ROWS=6;
const LENS_CHAPTERS=[
  {place:'PADUA',year:1610,reg:0,who:'GALILEO',reading:'SATURN IS THREE BODIES',tag:'ALTISSIMUM PLANETAM TERGEMINUM OBSERVAVI'},
  {place:'THE HAGUE',year:1659,reg:0,who:'HUYGENS',reading:'THE HANDLES ARE A RING',tag:'SYSTEMA SATURNIUM'},
  {place:'PARIS',year:1887,reg:1,who:'CARTE DU CIEL',reading:'THE SKY IS PUT ON GLASS',tag:'ASTROGRAPHIC CONGRESS'},
  {place:'MEUDON',year:1909,reg:1,who:'ANTONIADI',reading:'THE CANALS ARE PATCHES',tag:'GRANDE LUNETTE · 83 CM'},
  {place:'TUCSON',year:1981,reg:2,who:'FITS',reading:'A PICTURE IS A TABLE OF NUMBERS',tag:'WELLS · GREISEN · HARTEN'},
  {place:'CAPE CANAVERAL',year:1990,reg:2,who:'HST',reading:'THE TELESCOPE ABOVE THE AIR',tag:'STS-31 · 24 APRIL'}
];
const LENS_GOAL_ROW=LENS_CHAPTERS.length*LENS_CHAPTER_ROWS;
const LENS_REG_ROWS=LENS_CHAPTER_ROWS*2;
const lensRegOfRow=row=>row<LENS_REG_ROWS?0:row<LENS_REG_ROWS*2?1:2;
const lensChapterOf=w=>clamp(Math.floor((w?w.progress:0)/LENS_CHAPTER_ROWS),0,LENS_CHAPTERS.length-1);
const lensRegNow=()=>world?lensRegOfRow(world.progress):0;
// Where the observation's three stages fall on the observation clock. Earlier than on the other eras: a
// flown run leaves most bodies part-way through their sweep, and a surface the player never stays long
// enough to see is art nobody sees, so the blur clears within a sixth of the sweep and the first reading is
// cut by a little over half; only the dated seal still asks for the whole observation.
const LENS_STAGE={soft:[0,.16],first:[.16,.55],done:[.55,1]};
const lensSpan=(t,r)=>clamp((t-r[0])/(r[1]-r[0]),0,1);
const lensEase=t=>t*t*(3-2*t);
// World units to one arcminute of the climb, which the margin counts in every register.
const LENS_UNIT=12;
const LENS_ROMAN=['I','II','III','IV','V','VI'];

// The twelve fields of the catalogue, each an object this era actually resolved or photographed, with the
// one thing its record still carries; and the seven families, which registers one and two decline to name
// (06-lens.md, "Names") and register three names in the informal words of the present.
const LENS_FIELDS=[
  ['M 45','THE PLEIADES'],['M 44','PRAESEPE'],['M 42','THE ORION NEBULA'],['M 31','ANDROMEDA'],['M 51','THE WHIRLPOOL'],['M 1','THE CRAB'],
  ['B 33','THE HORSEHEAD'],['B 86','A DARK CLOUD'],['M 13','THE HERCULES CLUSTER'],['M 57','THE RING'],['MEL 25','THE HYADES'],['β CYG','ALBIREO']];
const LENS_WORLD_NAMES={ocean:'OCEAN WORLD',crater:'AIRLESS WORLD',ringed:'RINGED GIANT',ice:'ICE GIANT',dune:'DESERT WORLD',volcanic:'LAVA WORLD',storm:'GAS GIANT'};
const LENS_FAMILIES=['ocean','crater','ringed','ice','dune','volcanic','storm'];
// Register one's readings, one to a family: what the eyepiece first made of such a body, what it later made
// of it, and the dated caption the finished drawing is sealed with. Every one is drawn as its century
// believed it — Herschel's volcanoes are never put out, and the Georgian star keeps its courtly name.
const LENS_EYE_READINGS={
  ringed:{first:'TERGEMINUM',caption:'1659 · ANNULUS'},
  crater:{first:'MONTES',caption:'1610 · SIDEREUS NUNCIUS'},
  storm:{first:'FASCIAE',caption:'1665 · MACULA'},
  dune:{first:'MACULAE',caption:'1666 · CALOTTA'},
  ocean:{first:'CORNUA',caption:'1610 · CYNTHIAE FIGURAS'},
  ice:{first:'COMETA?',caption:'1781 · GEORGIUM SIDUS'},
  volcanic:{first:'IGNES',caption:'1787 · THREE VOLCANOS'}
};
// The rendered register's own colour for each family: the observatory plate's, carried over so a lit world
// here is the colour it is and not the colour a colourist reached for (backdrop.js, `modern`).
const LENS_WORLD={
  ocean:{light:[168,212,238],body:[47,100,148],dark:[8,24,44],rim:[116,178,226]},
  crater:{light:[224,218,203],body:[140,135,121],dark:[33,31,27],rim:[196,190,178]},
  ringed:{light:[242,222,187],body:[198,166,112],dark:[58,44,23],rim:[230,204,158]},
  ice:{light:[238,247,252],body:[157,195,214],dark:[30,54,68],rim:[196,226,242]},
  dune:{light:[238,180,136],body:[172,101,57],dark:[52,26,13],rim:[218,142,94]},
  volcanic:{light:[208,119,74],body:[76,59,51],dark:[20,12,9],rim:[214,100,52]},
  storm:{light:[240,223,200],body:[191,158,128],dark:[60,44,32],rim:[226,198,168]}
};

// ---------- Small tools ----------
const lensRgb=(a,k=1)=>`rgba(${a[0]|0},${a[1]|0},${a[2]|0},${k})`;
// Register one sets its words in the Fell types, roman and italic, because a Huygens or a Herschel paper was
// set in them; `variant` 'sc' is the Fell small capitals.
function lensFell(g,str,x,y,size,rgb,alpha,align='center',variant='text',style=''){
  if(alpha<=0||!str)return;g.save();g.font=plateFace(size,variant,style);g.direction='ltr';g.textAlign=align;g.textBaseline='middle';g.fillStyle=`rgba(${rgb},${alpha})`;g.fillText(str,x,y);g.restore();
}
// Register two is typed, not written: Courier Prime, each strike a little heavier or lighter than the one
// before and a hair off the line, the way a type bar hits a label. It is resolved whole, never stroked.
function lensTyped(g,str,x,y,size,rgb,alpha,align='left',shown=Infinity,face='typed'){
  if(alpha<=0||!str)return;g.save();g.font=plateFace(size,face);g.direction='ltr';g.textAlign='left';g.textBaseline='middle';
  const cw=g.measureText('M').width,n=str.length,x0=align==='center'?x-cw*n/2:align==='right'?x-cw*n:x,seed=n*31+str.charCodeAt(0);
  for(let i=0;i<n&&i<shown;i++){const ch=str[i];if(ch===' ')continue;const h=tileHash(seed,i,7);g.fillStyle=`rgba(${rgb},${(alpha*(.74+.26*h)).toFixed(3)})`;g.fillText(ch,x0+i*cw,y+(tileHash(seed,i,9)-.5)*.6);}
  g.restore();
}
// The plate's printed labels — the réseau's numbers, a field's catalogue entry, the survey's zone — are set
// in a grotesque rather than typed, since the observatory printed them before any hand touched the glass.
function lensGrot(g,str,x,y,size,rgb,alpha,align='left'){
  if(alpha<=0||!str)return;g.save();g.font=plateFace(size,'grot');g.direction='ltr';g.textAlign=align;g.textBaseline='middle';g.fillStyle=`rgba(${rgb},${alpha})`;g.fillText(str,x,y);g.restore();
}
// Register three is a card, not a hand: IBM Plex Mono, uppercase, fixed width, and revealed a whole glyph
// at a time at a constant cadence with a block cursor where a nib would be (`shown` glyphs so far).
function lensMono(g,str,x,y,size,rgb,alpha,align='left',shown=Infinity){
  if(alpha<=0||!str)return;g.save();g.font=plateFace(size,'mono');g.direction='ltr';g.textAlign='left';g.textBaseline='middle';
  const cw=g.measureText('M').width,n=str.length,x0=align==='center'?x-cw*n/2:align==='right'?x-cw*n:x,k=Math.min(n,shown);
  g.fillStyle=`rgba(${rgb},${alpha})`;g.fillText(str.slice(0,k),x0,y);
  if(k<n&&shown!==Infinity){g.fillStyle=`rgba(${rgb},${(alpha*.85).toFixed(3)})`;g.fillRect(x0+k*cw,y-size*.42,cw*.8,size*.84);}
  g.restore();
}
// A FITS card is a keyword padded to eight, an equals sign, and a value — `KEYWORD = value`.
const lensCard=(key,value)=>(key+'        ').slice(0,8)+'= '+value;
// A line drawn once, loosely, by a hand holding a loupe: a closed loop that overshoots where it began, the
// Harvard computers' circle round a star. Seeded so it is the same loop every frame; `k` draws it on.
function lensLoop(g,x,y,r,seed,k=1,w=1){
  if(k<=0)return;const n=40,end=Math.floor(n*1.12*k),a0=tileHash(seed,1)*TAU;
  g.beginPath();for(let i=0;i<=end;i++){const u=i/n,a=a0+u*TAU,rr=r*(1+(tileHash(seed,i%n,3)-.5)*.05+.04*Math.sin(u*TAU*2+seed));const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.94;i?g.lineTo(px,py):g.moveTo(px,py);}
  g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke();
}
// An ellipse drawn by hand rather than by compass: its radius breathes a little round the curve, at a slow
// swell and a quicker tremor, with the phases seeded so the same hand draws the same line every frame — a line
// already on the sheet must never shiver. Appends to the current path; the caller strokes it.
function lensHandEllipse(g,x,y,rx,ry,rot,a0,a1,seed,wob=1){
  const n=Math.max(10,Math.ceil(Math.abs(a1-a0)/TAU*56)),p1=tileHash(seed,1,61)*TAU,p2=tileHash(seed,2,61)*TAU,c=Math.cos(rot),s=Math.sin(rot);
  for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,k=1+wob*(.028*Math.sin(a*2+p1)+.012*Math.sin(a*7+p2)),ex=Math.cos(a)*rx*k,ey=Math.sin(a)*ry*k,px=x+ex*c-ey*s,py=y+ex*s+ey*c;i?g.lineTo(px,py):g.moveTo(px,py);}
}
// A drawn outline: the pen comes round a little past where it began, and a second, lighter pass goes back
// over part of it, as a draughtsman firms up a contour — never the one clean stroke of a printed circle.
function lensHandRing(g,x,y,rx,ry,rot,seed,k,w,rgb,alpha){
  if(k<=0)return;const a0=-Math.PI*.9+(tileHash(seed,3,61)-.5)*1.2,sweep=TAU*(1.04+tileHash(seed,4,61)*.08)*k;
  g.save();g.lineCap='round';g.lineJoin='round';g.strokeStyle=`rgba(${rgb},${alpha.toFixed(3)})`;g.lineWidth=w;g.beginPath();lensHandEllipse(g,x,y,rx,ry,rot,a0,a0+sweep,seed);g.stroke();
  if(k>.6){const b0=a0+TAU*(.3+tileHash(seed,5,61)*.4),bk=(k-.6)/.4;g.strokeStyle=`rgba(${rgb},${(alpha*.4).toFixed(3)})`;g.lineWidth=w*.6;g.beginPath();lensHandEllipse(g,x,y,rx*1.015,ry*1.015,rot,b0,b0+TAU*.35*bk,seed+7,1.4);g.stroke();}
  g.restore();
}
// The engraver's shading of a sphere lit from the upper left: a sepia wash under it, parallel burin lines
// across the disc that thicken and darken toward the shadowed limb, a second set crossing them only where
// the shadow is deepest, and the keyline last. `k` cuts it on, line by line, so a drawing is seen being made.
function lensHatchDisc(g,x,y,R,k,P,alpha=1,opts={}){
  if(k<=0||R<=0)return;const ang=opts.angle??-.42,step=Math.max(1.05,R*.14),seed=(opts.seed|0)*13+7,h=(i,j)=>tileHash(seed,i,j);
  g.save();g.globalAlpha*=alpha;
  // the wash is laid with a brush, so it pools a little off centre and never quite fills a perfect circle
  const wx=x-R*(.3+(h(0,81)-.5)*.2),wy=y-R*(.4+(h(1,81)-.5)*.2),wg=g.createRadialGradient(wx,wy,R*.1,x+(h(2,81)-.5)*R*.12,y+(h(3,81)-.5)*R*.12,R*1.02);wg.addColorStop(0,`rgba(${P.wash},0)`);wg.addColorStop(1,`rgba(${P.wash},${(.38*k).toFixed(3)})`);
  g.fillStyle=wg;g.beginPath();lensHandEllipse(g,x,y,R,R,0,0,TAU,seed+3,.6);g.fill();
  g.beginPath();g.arc(x,y,R*1.01,0,TAU);g.clip();g.lineCap='round';
  // Every stroke is the hand's, not the ruling machine's: its spacing, its angle and its pressure drift a
  // little from the last; it bows faintly as a wrist does across a stroke; and it starts and stops short of
  // the outline by a different amount each time, so the edge of the shading is ragged inside the contour.
  const lines=Math.ceil(R*2/step),shown=Math.ceil(lines*k);
  for(let i=0;i<shown;i++){const o=-R+(i+.5+(h(i,71)-.5)*.4)*step,shade=clamp((o/R*.8+.55),0,1);if(shade<.12+h(i,77)*.08)continue;
    const a=ang+(h(i,72)-.5)*.07,c=Math.cos(a),s=Math.sin(a),px=x-s*o,py=y+c*o,L=Math.sqrt(Math.max(0,R*R-o*o));if(L<.6)continue;
    const l0=L*(1-h(i,73)*.16),l1=L*(1-h(i,74)*.16),bow=(h(i,75)-.5)*step*.6,mx=px+c*(l1-l0)/2-s*bow,my=py+s*(l1-l0)/2+c*bow;
    g.strokeStyle=`rgba(${P.ink},${((.18+shade*.6)*(.8+.35*h(i,76))).toFixed(3)})`;g.lineWidth=Math.max(.35,(.28+shade*.55*(R/12))*(.8+.4*h(i,78)));
    g.beginPath();g.moveTo(px-c*l0,py-s*l0);g.quadraticCurveTo(mx,my,px+c*l1,py+s*l1);g.stroke();}
  if(k>.5&&!opts.noCross){const ck=clamp((k-.5)*2,0,1);
    for(let i=0;i<lines*ck;i++){const a2=ang+1.15+(h(i,91)-.5)*.09,c2=Math.cos(a2),s2=Math.sin(a2),o=-R+(i+.5+(h(i,92)-.5)*.5)*step*1.2,px=x-s2*o,py=y+c2*o,L=Math.sqrt(Math.max(0,R*R-o*o));
      // only on the side away from the light, and where it stops is the hand's judgement, not a threshold
      const t0=.3+h(i,93)*.12,seg=Math.max(1,R*.12);g.strokeStyle=`rgba(${P.ink},${(.26+.14*h(i,94)).toFixed(3)})`;g.lineWidth=Math.max(.3,.3*(R/12));g.beginPath();
      for(let u=-L;u<L;u+=seg){const qx=px+c2*u,qy=py+s2*u,lit=((qx-x)*.62+(qy-y)*.78)/R;if(lit>t0){g.moveTo(qx,qy);g.lineTo(qx+c2*seg,qy+s2*seg);}}
      g.stroke();}}
  g.restore();
  if(!opts.noKey)lensHandRing(g,x,y,R,R,0,seed,Math.min(1,k*1.4),Math.max(.5,R*.06),P.ink,.85*alpha);
}
// A lit sphere, rendered rather than engraved: albedo, bands, a terminator from the upper left, limb
// darkening and a scattering rim. Drawn once into a sprite per world; the painters only ever blit it.
function lensRenderSphere(g,x,y,r,family,seed,tilt){
  const C=LENS_WORLD[family]||LENS_WORLD.crater,rng=seeded(seed|0);
  g.save();g.beginPath();g.arc(x,y,r,0,TAU);g.clip();
  const al=g.createRadialGradient(x-r*.3,y-r*.35,r*.05,x,y,r*1.05);al.addColorStop(0,lensRgb(C.light));al.addColorStop(.6,lensRgb(C.body));al.addColorStop(1,lensRgb(C.dark));g.fillStyle=al;g.fillRect(x-r,y-r,r*2,r*2);
  // A ringed world's bands are drawn at the rings' own tilt, since the rings lie in its equator and the bands
  // run parallel to it; a world without rings leans its bands a little at random.
  if(family==='ringed'||family==='storm'){const lean=(rng()-.5)*.3,bt=tilt??lean;g.save();g.translate(x,y);g.rotate(bt);
    // Each band is a line of latitude seen from a little above the equator: an ellipse flattened exactly as
    // the rings are, centred up or down the disc by its latitude, and only its near half is on the face.
    const sinB=family==='ringed'?.34:.12,cosB=Math.sqrt(1-sinB*sinB);
    for(let i=0;i<9;i++){const lat=(-1+i/4.5+rng()*.08)*1.25,h=r*(.05+rng()*.12),lt=rng()<.5,a=r*Math.cos(lat)*1.02;if(a<=0)continue;
      g.strokeStyle=lt?`rgba(255,248,232,${(.12+rng()*.14).toFixed(3)})`:`rgba(${C.dark.join(',')},${(.12+rng()*.18).toFixed(3)})`;g.lineWidth=h;
      g.beginPath();g.ellipse(0,-r*Math.sin(lat)*cosB,a,a*sinB,0,0,Math.PI);g.stroke();}
    if(family==='storm'){g.fillStyle='rgba(176,82,52,.55)';g.beginPath();g.ellipse(r*.18,r*.3,r*.22,r*.12,0,0,TAU);g.fill();g.strokeStyle='rgba(255,236,210,.4)';g.lineWidth=Math.max(.4,r*.03);g.stroke();}
    g.restore();}
  else if(family==='crater'){for(let i=0;i<14;i++){const a=rng()*TAU,d=Math.sqrt(rng())*r*.85,cr=r*(.05+rng()*.13),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d;
      g.fillStyle='rgba(20,18,16,.28)';g.beginPath();g.arc(cx+cr*.2,cy+cr*.25,cr,0,TAU);g.fill();g.fillStyle='rgba(255,250,236,.22)';g.beginPath();g.arc(cx-cr*.15,cy-cr*.2,cr*.8,0,TAU);g.fill();}
    for(let i=0;i<3;i++){g.fillStyle='rgba(40,38,34,.18)';g.beginPath();g.ellipse(x+(rng()-.5)*r,y+(rng()-.5)*r,r*(.2+rng()*.25),r*(.14+rng()*.2),rng()*TAU,0,TAU);g.fill();}}
  else if(family==='ocean'){for(let i=0;i<5;i++){g.fillStyle=`rgba(96,120,72,${(.35+rng()*.2).toFixed(3)})`;g.beginPath();g.ellipse(x+(rng()-.5)*r*1.3,y+(rng()-.5)*r*1.3,r*(.12+rng()*.22),r*(.08+rng()*.18),rng()*TAU,0,TAU);g.fill();}
    // Cloud lies along the latitudes, as weather is sheared into streaks by the planet's turning: long thin
    // lenses of white, overlapping and a little leaned, never the loops of a pen, and brightest at the poles.
    for(let i=0;i<10;i++){const cy=y+(rng()-.5)*r*1.7,cx=x+(rng()-.5)*r*.9,rx=r*(.3+rng()*.55),ry=r*(.03+rng()*.05);
      g.fillStyle=`rgba(255,255,255,${(.16+rng()*.24).toFixed(3)})`;g.beginPath();g.ellipse(cx,cy,rx,ry,(rng()-.5)*.35,0,TAU);g.fill();}
    for(const sgn of[-1,1]){const pg=g.createLinearGradient(x,y+sgn*r,x,y+sgn*r*.55);pg.addColorStop(0,'rgba(255,255,255,.55)');pg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=pg;g.fillRect(x-r,sgn<0?y-r:y+r*.55,r*2,r*.45);}}
  else if(family==='dune'){for(let i=0;i<6;i++){g.fillStyle=`rgba(${C.dark.join(',')},${(.2+rng()*.2).toFixed(3)})`;g.beginPath();g.ellipse(x+(rng()-.5)*r*1.2,y+(rng()-.3)*r*1.1,r*(.15+rng()*.25),r*(.06+rng()*.1),rng()*TAU,0,TAU);g.fill();}
    g.fillStyle='rgba(255,252,246,.85)';g.beginPath();g.ellipse(x-r*.08,y-r*.9,r*.34,r*.14,-.1,0,TAU);g.fill();}
  else if(family==='volcanic'){
    // Old flows first, darker basalt laid over the body in broad tongues; then a few calderas, each a dark pit
    // with a warm lip; then the live flows, smooth curves that glow at their source and cool along their
    // length, drawn wide and faint under narrow and bright so they read as heat rather than as a scribble.
    for(let i=0;i<5;i++){g.fillStyle=`rgba(${C.dark.join(',')},${(.25+rng()*.2).toFixed(3)})`;g.beginPath();g.ellipse(x+(rng()-.5)*r*1.3,y+(rng()-.5)*r*1.3,r*(.2+rng()*.25),r*(.08+rng()*.12),rng()*TAU,0,TAU);g.fill();}
    const vents=[];for(let i=0;i<3;i++){const a=i/3*TAU+rng()*.8,d=r*(.25+rng()*.35);vents.push([x+Math.cos(a)*d,y+Math.sin(a)*d,r*(.07+rng()*.05)]);}
    g.lineCap='round';for(const [vx,vy] of vents){const a=rng()*TAU,L=r*(.35+rng()*.35),ex=vx+Math.cos(a)*L,ey=vy+Math.sin(a)*L,bx=(vx+ex)/2+Math.cos(a+1.57)*L*(rng()-.5)*.6,by=(vy+ey)/2+Math.sin(a+1.57)*L*(rng()-.5)*.6;
      const fl=g.createLinearGradient(vx,vy,ex,ey);fl.addColorStop(0,'rgba(255,190,110,.9)');fl.addColorStop(.6,'rgba(236,96,40,.55)');fl.addColorStop(1,'rgba(160,50,20,0)');
      for(const [w,k] of[[.12,.3],[.035,1]]){g.globalAlpha=k;g.strokeStyle=fl;g.lineWidth=Math.max(.5,r*w);g.beginPath();g.moveTo(vx,vy);g.quadraticCurveTo(bx,by,ex,ey);g.stroke();}g.globalAlpha=1;}
    for(const [vx,vy,vr] of vents){const gg=g.createRadialGradient(vx,vy,0,vx,vy,vr*3);gg.addColorStop(0,'rgba(255,200,120,.6)');gg.addColorStop(1,'rgba(255,120,50,0)');g.fillStyle=gg;g.beginPath();g.arc(vx,vy,vr*3,0,TAU);g.fill();
      g.fillStyle='rgba(18,10,6,.85)';g.beginPath();g.arc(vx,vy,vr,0,TAU);g.fill();g.strokeStyle='rgba(255,150,70,.8)';g.lineWidth=Math.max(.4,r*.02);g.stroke();}}
  else if(family==='ice'){for(let i=0;i<5;i++){g.fillStyle=`rgba(255,255,255,${(.06+rng()*.08).toFixed(3)})`;g.beginPath();g.ellipse(x,y+(-.8+i*.4)*r,r*1.1,r*.08,0,0,TAU);g.fill();}}
  // the terminator: night from the lower right, a soft band where the light grazes
  const lx=-.62,ly=-.78,tg=g.createLinearGradient(x+lx*r,y+ly*r,x-lx*r,y-ly*r);
  tg.addColorStop(0,'rgba(0,0,0,0)');tg.addColorStop(.5,'rgba(0,0,0,.05)');tg.addColorStop(.72,'rgba(0,0,0,.62)');tg.addColorStop(1,'rgba(0,0,0,.93)');g.fillStyle=tg;g.fillRect(x-r,y-r,r*2,r*2);
  const ld=g.createRadialGradient(x,y,r*.55,x,y,r);ld.addColorStop(0,'rgba(0,0,0,0)');ld.addColorStop(1,'rgba(0,0,0,.36)');g.fillStyle=ld;g.fillRect(x-r,y-r,r*2,r*2);
  g.restore();
  const air=family==='crater'?0:family==='volcanic'?.25:family==='dune'?.45:.9;
  // The scattering rim hugs the lit limb and fades off toward the terminator; drawn as one arc with round
  // ends it can never stand out past the globe as a hood or leave a square end where a ring crosses it.
  if(air>0){g.save();g.lineCap='round';const a0=Math.PI*1.02,a1=Math.PI*1.7,rg=g.createLinearGradient(x+Math.cos(a0)*r,y+Math.sin(a0)*r,x+Math.cos(a1)*r,y+Math.sin(a1)*r);
    rg.addColorStop(0,lensRgb(C.rim,0));rg.addColorStop(.35,lensRgb(C.rim,.5*air));rg.addColorStop(.65,lensRgb(C.rim,.5*air));rg.addColorStop(1,lensRgb(C.rim,0));
    g.strokeStyle=rg;g.lineWidth=Math.max(.6,r*.05);g.beginPath();g.arc(x,y,r*1.005,a0,a1);g.stroke();g.restore();}
}
// Saturn's rings, rendered: an ellipse of bands with the Cassini division dark across it, drawn in two halves
// so the far half goes behind the globe and the near half across it, the globe's shadow cut into the far one.
function lensRenderRings(g,x,y,r,tilt,half){
  g.save();g.translate(x,y);g.rotate(tilt);const fl=.34;
  g.beginPath();if(half==='back')g.rect(-r*3,-r*3,r*6,r*3);else g.rect(-r*3,0,r*6,r*3);g.clip();
  const bands=[[1.25,1.52,'rgba(196,172,128,.55)'],[1.55,1.95,'rgba(236,218,178,.9)'],[1.95,2.02,'rgba(10,8,6,.9)'],[2.02,2.3,'rgba(214,196,160,.75)']];
  // each band a flattened annulus, filled between its two edges, so it is foreshortened top and bottom as a
  // flat ring seen from above its plane is, rather than a stroke of one width all the way round
  for(const [a,b,c] of bands){g.fillStyle=c;g.beginPath();g.ellipse(0,0,b*r,b*r*fl,0,0,TAU);g.ellipse(0,0,a*r,a*r*fl,0,0,TAU);g.fill('evenodd');}
  // the globe's shadow on the far ring: the light comes from the upper left, so the shadow is cast back and to
  // the right, a band as wide as the globe crossing the ring just behind its right limb
  if(half==='back'){g.save();g.beginPath();g.ellipse(0,0,2.3*r,2.3*r*fl,0,0,TAU);g.ellipse(0,0,1.25*r,1.25*r*fl,0,0,TAU);g.clip('evenodd');
    g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.moveTo(r*.25,-r*.05);g.lineTo(r*1.05,-r*.05);g.lineTo(r*1.55,-r*1.2);g.lineTo(r*.75,-r*1.2);g.closePath();g.fill();g.restore();}
  g.restore();
}

// ---------- Saturn, six times: the story's one planet at each chapter's reading ----------
// One function draws Saturn as each of the six chapters drew it, at any size, so the frontispiece, a chapter
// opening and the finale are the same drawing at different stages. `stage` is 1 to 6; `k` 0–1 is how far
// the drawing has been made, in the register's own manner — cut on line by line at the eyepiece, developed
// in from the densest silver outward on the plate, and assembled a filtered channel at a time off the sensor.
// Each stage carries its own ground (a paper vignette, a glass pane, a sensor frame), since it is shown on
// every register's sheet and on the frontispiece alike.
const lensSaturnArts=new Map();
function lensSaturnArt(R){
  const key=R.toFixed(1)+':'+DPR;let a=lensSaturnArts.get(key);if(a)return a;
  const S=Math.ceil(R*5.2),c=makeCanvas(Math.round(S*DPR),Math.round(S*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);
  const r=R*.62,tilt=-.2;lensRenderRings(g,S/2,S/2,r,tilt,'back');lensRenderSphere(g,S/2,S/2,r,'ringed',1610,tilt);
  // the rings' shadow across the globe, then the near half of the rings over it
  g.save();g.beginPath();g.arc(S/2,S/2,r,0,TAU);g.clip();g.translate(S/2,S/2);g.rotate(tilt);g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(0,r*.3,r*1.6,r*.1,0,0,TAU);g.fill();g.restore();
  lensRenderRings(g,S/2,S/2,r,tilt,'front');
  a={canvas:c,size:S,channels:lensChannels(c)};if(lensSaturnArts.size>8)lensSaturnArts.clear();lensSaturnArts.set(key,a);return a;
}
// A colour image taken apart into the three filtered exposures it was built from, each kept in its own
// colour so that drawn back over one another additively they sum to the image exactly.
function lensChannels(canvas){
  const g=canvas.getContext('2d');if(!g||!g.getImageData)return null;
  let im;try{im=g.getImageData(0,0,canvas.width,canvas.height);}catch(_){return null;}if(!im||!im.data)return null;
  return [0,1,2].map(ch=>{const c=makeCanvas(canvas.width,canvas.height),cg=c.getContext('2d'),o=cg.createImageData?cg.createImageData(canvas.width,canvas.height):null;if(!o)return null;
    const s=im.data,d=o.data;for(let i=0;i<s.length;i+=4){const a=s[i+3]/255;d[i+ch]=s[i+ch]*a;d[i+3]=255;}cg.putImageData(o,0,0);return c;});
}
function lensSaturn(g,R,stage,k=1,opts={}){
  const P=ink.lens,e=lensEase(clamp(k,0,1));
  if(stage<=2){
    // Paper, and the burin: a pale vignette of the sheet so the drawing reads on any ground.
    const vg=g.createRadialGradient(0,0,R*.4,0,0,R*2.1);vg.addColorStop(0,`rgba(${P.paper},${opts.card===false?0:.92})`);vg.addColorStop(1,`rgba(${P.paper},0)`);g.fillStyle=vg;g.beginPath();g.arc(0,0,R*2.1,0,TAU);g.fill();
    if(stage===1){
      // Galileo, 1610: the highest planet triform — one body and two smaller ones touching it at either side.
      lensHatchDisc(g,0,0,R*.55,e,P,1,{seed:1610});
      for(const s of[-1,1])lensHatchDisc(g,s*R*.93,R*(s<0?.0:.04),R*(s<0?.3:.28),clamp(e*1.4-.3,0,1),P,1,{noCross:true,seed:1611+s});
    }else{
      // Huygens, 1659: a thin flat ring, touching nowhere, inclined to the ecliptic — his own diagram's
      // lines: the far arc of the ring behind the globe, the globe, the near arc across it.
      const rx=R*1.3,ry=R*.44,ix=R*.86,iy=R*.29,rk=clamp(e*1.3,0,1);
      g.save();g.strokeStyle=`rgba(${P.ink},.85)`;g.lineWidth=Math.max(.6,R*.03);
      g.lineCap='round';g.beginPath();lensHandEllipse(g,0,0,rx,ry,-.12,Math.PI,Math.PI+Math.PI*rk,1659);g.stroke();g.beginPath();lensHandEllipse(g,0,0,ix,iy,-.12,Math.PI,Math.PI+Math.PI*rk,1660);g.stroke();g.restore();
      lensHatchDisc(g,0,0,R*.5,e,P,1,{seed:1659});
      g.save();g.strokeStyle=`rgba(${P.ink},.9)`;g.lineWidth=Math.max(.6,R*.035);
      g.lineCap='round';g.beginPath();lensHandEllipse(g,0,0,rx,ry,-.12,-.05,(Math.PI+.1)*rk-.05,1659);g.stroke();g.beginPath();lensHandEllipse(g,0,0,ix,iy,-.12,-.05,(Math.PI+.1)*rk-.05,1660);g.stroke();
      // the near half of the ring hatched lengthwise, and the globe's shadow falling across the far half
      g.beginPath();g.ellipse(0,0,rx,ry,-.12,0,Math.PI);g.ellipse(0,0,ix,iy,-.12,Math.PI,0,true);g.closePath();g.save();g.clip();
      g.strokeStyle=`rgba(${P.ink},${(.4*rk).toFixed(3)})`;g.lineWidth=Math.max(.35,R*.012);for(let i=1;i<5;i++){const t=i/5;g.beginPath();g.ellipse(0,0,lerp(ix,rx,t),lerp(iy,ry,t),-.12,0,Math.PI);g.stroke();}g.restore();
      g.restore();
    }
    return;
  }
  if(stage<=4){
    // Glass: a pane of clear emulsion ruled with its réseau, the planet a knot of silver developing in from
    // its densest middle, elongated where the ring is and no ring resolved.
    const w=R*3.3,h=R*2.3;g.save();
    g.fillStyle=`rgba(${P.glass},.97)`;g.fillRect(-w/2,-h/2,w,h);g.strokeStyle=`rgba(${P.reseau},.8)`;g.lineWidth=Math.max(.6,R*.02);g.strokeRect(-w/2,-h/2,w,h);
    g.strokeStyle=`rgba(${P.reseau},.35)`;g.lineWidth=Math.max(.35,R*.008);const sp=R*.42;g.beginPath();
    for(let x=-w/2+sp*.5;x<w/2;x+=sp){g.moveTo(x,-h/2);g.lineTo(x,h/2);}for(let y=-h/2+sp*.5;y<h/2;y+=sp){g.moveTo(-w/2,y);g.lineTo(w/2,y);}g.stroke();
    for(let i=0;i<22;i++){const sx0=(tileHash(i,3,11)-.5)*w*.94,sy0=(tileHash(i,4,11)-.5)*h*.9,sr=R*(.015+tileHash(i,5,11)*.05);g.fillStyle=`rgba(${P.silver},${(.35+tileHash(i,6,11)*.5)*Math.min(1,e*1.6)})`;g.beginPath();g.arc(sx0,sy0,sr,0,TAU);g.fill();}
    const dev=stage===3?e:1;
    g.save();g.scale(1.9,1);const kg=g.createRadialGradient(0,0,0,0,0,R*.5);
    kg.addColorStop(0,`rgba(${P.silver},${(.95*Math.min(1,dev*2)).toFixed(3)})`);kg.addColorStop(clamp(.25+dev*.35,0,1),`rgba(${P.silver},${(.75*dev).toFixed(3)})`);kg.addColorStop(1,`rgba(${P.silverMid},0)`);
    g.fillStyle=kg;g.beginPath();g.arc(0,0,R*.5,0,TAU);g.fill();g.restore();
    // plate edge label, in the typed hand
    lensTyped(g,stage===3?'A 1887 · PARIS · 40 MIN':'MEUDON · 1909 · 83 CM',-w/2+R*.12,h/2-R*.16,Math.max(7,R*.13),P.inkBlack,.8*Math.min(1,e*2));
    if(stage===4){
      // The ink laid on afterwards, on the glass back: a loose loop round the planet, the ring's axis ticked,
      // and the name written beside it.
      g.save();g.scale(1.3,.72);g.strokeStyle=`rgba(${P.inkRed},.9)`;lensLoop(g,0,0,R*.95,1909,e,Math.max(.8,R*.03));g.restore();
      g.strokeStyle=`rgba(${P.inkBlack},${(.85*e).toFixed(3)})`;g.lineWidth=Math.max(.5,R*.02);g.beginPath();g.moveTo(-R*1.25,0);g.lineTo(-R*1.05,0);g.moveTo(R*1.05,0);g.lineTo(R*1.25,0);g.stroke();
      lensTyped(g,'SATURNE',R*.35,-R*.86,Math.max(8,R*.16),P.inkRed,.9*clamp(e*2-1,0,1));
    }
    g.restore();return;
  }
  // The sensor: a black frame, the planet assembled channel by channel — the red exposure, then the green,
  // then the blue, each a little off register until the last settles them — and, in 1990, the instrument
  // margin arriving only once the composite is whole.
  const w=R*3.3,h=R*2.4,art=lensSaturnArt(R);g.save();
  g.fillStyle=`rgba(${P.sensor},.98)`;g.fillRect(-w/2,-h/2,w,h);g.strokeStyle=`rgba(${P.instrSoft},.6)`;g.lineWidth=Math.max(.5,R*.012);g.strokeRect(-w/2,-h/2,w,h);
  g.beginPath();g.rect(-w/2,-h/2,w,h);g.clip();
  const S=art.size,ch=art.channels,pass=stage===5?e*3:3;
  g.globalCompositeOperation='lighter';
  if(ch&&ch[0]&&ch[1]&&ch[2]){for(let i=0;i<3;i++){const a=clamp(pass-i,0,1);if(a<=0)continue;const off=(1-clamp(pass-2,0,1))*R*.09*(i-1);g.globalAlpha=a;g.drawImage(ch[i],-S/2+off,-S/2-off*.5,S,S);}}
  else{g.globalAlpha=clamp(pass/3,0,1);g.drawImage(art.canvas,-S/2,-S/2,S,S);}
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  if(stage===5){const names=['FILTER R','FILTER V','FILTER B'];for(let i=0;i<3;i++)if(pass>i)lensMono(g,names[i],-w/2+R*.1,-h/2+R*(.18+i*.2),Math.max(6.5,R*.12),[P.sii,P.ha,P.oiii][i],.9);}
  if(stage===6){const m=clamp(e*1.5-.5,0,1);
    // scale bar, N/E arrows, filter and epoch: the picture's proof, set only once the picture is whole
    g.strokeStyle=`rgba(${P.instr},${(.9*m).toFixed(3)})`;g.lineWidth=Math.max(.6,R*.02);const bx=w/2-R*.9,by=h/2-R*.2;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+R*.6,by);g.moveTo(bx,by-R*.05);g.lineTo(bx,by+R*.05);g.moveTo(bx+R*.6,by-R*.05);g.lineTo(bx+R*.6,by+R*.05);g.stroke();
    lensMono(g,'10"',bx+R*.3,by-R*.14,Math.max(6.5,R*.12),P.instr,.9*m,'center');
    const nx=-w/2+R*.8,ny=h/2-R*.22;g.beginPath();g.moveTo(nx,ny);g.lineTo(nx,ny-R*.42);g.moveTo(nx,ny);g.lineTo(nx-R*.42,ny);g.stroke();
    lensMono(g,'N',nx,ny-R*.54,Math.max(6.5,R*.12),P.instr,.9*m,'center');lensMono(g,'E',nx-R*.54,ny,Math.max(6.5,R*.12),P.instr,.9*m,'center');
    lensMono(g,'WF/PC · 1990',-w/2+R*.1,-h/2+R*.18,Math.max(6.5,R*.12),P.cyan,.9*m);}
  g.restore();
}

// ---------- What the lens has resolved, kept across runs ----------
// A small record under its own key, apart from the atlas's ledger: the furthest chapter any run has reached,
// how often the sheet was finished, the best magnitude, and — as the era's optical catalogue — which of the
// seven families have ever been resolved and which of the twelve fields ever set. Blocked or corrupt storage
// reads as an empty record.
const LENS_KEY='orbit.lens.v1';
function lensRead(){
  let raw=null;try{raw=JSON.parse(storage.get(LENS_KEY,'null'));}catch(_){raw=null;}
  const n=(v,max)=>clamp(Math.floor(Number(v)||0),0,max);
  return{v:1,furthest:n(raw&&raw.furthest,LENS_CHAPTERS.length-1),completed:n(raw&&raw.completed,1e6),best:n(raw&&raw.best,1e9),runs:n(raw&&raw.runs,1e9),worlds:n(raw&&raw.worlds,127),fields:n(raw&&raw.fields,4095)};
}
function lensWrite(r){try{storage.set(LENS_KEY,JSON.stringify(r));}catch(_){}}
function lensNoteChapter(i){const r=lensRead();if(i>r.furthest){r.furthest=i;lensWrite(r);lensSprites.clear();}}
function lensNoteWorld(family){const i=LENS_FAMILIES.indexOf(family);if(i<0)return;const r=lensRead();if(!(r.worlds&(1<<i))){r.worlds|=1<<i;lensWrite(r);}}
function lensNoteField(i){const r=lensRead(),b=1<<(((i|0)%12+12)%12);if(!(r.fields&b)){r.fields|=b;lensWrite(r);}}
function lensRecordRun(w){
  const r=lensRead();r.runs++;r.best=Math.max(r.best,w.score|0);if(w.won)r.completed++;
  r.furthest=Math.max(r.furthest,Math.min(LENS_CHAPTERS.length-1,Math.floor(w.progress/LENS_CHAPTER_ROWS)));lensWrite(r);lensSprites.clear();
}
const lensBest=()=>lensRead().best;
const lensBits=v=>{let c=0;while(v){c+=v&1;v>>>=1;}return c;};
const lensSprites=new Map();

// ---------- The three grounds, each baked once as a tile ----------
// A tile is 900 units high — twenty-five réseau squares of 36 — so every ruled line of the plate lands on the
// same place across the seam, and each is laid end to end at the camera's own rate as the Astrolabe's page is.
const LENS_TILE=900,LENS_RESEAU=36;
const lensTiles=[null,null,null];let lensTileKey='';
// Every seeded mark near a tile's top or bottom edge is laid twice, a tile apart, so the tile wraps clean.
function lensWrapDot(g,x,y,TH,draw){draw(x,y);if(y<24)draw(x,y+TH);if(y>TH-24)draw(x,y-TH);}
// Register one: laid paper under an engraving — mottle, chain and laid lines, fibres — with, faint in the
// sheet, the Moon as Galileo washed it in sepia in 1609: a terminator broken by lit peaks in the dark and
// shadowed craters along it, set in the ground where a proof of his plate might have offset onto the next.
function lensBakeEye(pw,ph){
  const P=ink.lens,TH=LENS_TILE,c=makeCanvas(pw,ph),g=c.getContext('2d'),q=4,lw=Math.ceil(pw/q),lh=Math.ceil(ph/q),lo=makeCanvas(lw,lh),lg=lo.getContext('2d'),im=lg.createImageData?lg.createImageData(lw,lh):null,base=P.paper.split(',').map(Number);
  if(im){const d=im.data;for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){const X=x*q/DPR,Y=y*q/DPR,i=(y*lw+x)*4,m=tileFbm(X,Y,180,4,41,TH),f=tileFbm(X,Y,30,2,43,TH),l=1+m*.06+f*.025;
    d[i]=base[0]*l;d[i+1]=base[1]*l*(1-Math.max(0,-m)*.03);d[i+2]=base[2]*l*(1-Math.max(0,-m)*.1);d[i+3]=255;}lg.putImageData(im,0,0);g.imageSmoothingQuality='high';g.drawImage(lo,0,0,pw,ph);}
  else{g.fillStyle=`rgb(${P.paper})`;g.fillRect(0,0,pw,ph);}
  g.scale(DPR,DPR);const r=seeded(61);
  // laid lines close together, chain lines far apart, as the mould's wires left them
  g.strokeStyle='rgba(120,96,64,.05)';g.lineWidth=.5;g.beginPath();for(let y=0;y<TH;y+=3.2){g.moveTo(0,y);g.lineTo(W,y);}g.stroke();
  g.strokeStyle='rgba(120,96,64,.07)';g.lineWidth=1.1;g.beginPath();for(let x=W*.08;x<W;x+=62){g.moveTo(x,0);g.lineTo(x,TH);}g.stroke();
  for(let i=0;i<Math.round(W*TH/260);i++){const x=r()*W,y=r()*TH,a=r()*TAU,L=2+r()*7;g.strokeStyle=r()<.5?`rgba(255,250,236,${(.1+r()*.1).toFixed(3)})`:`rgba(120,90,56,${(.05+r()*.06).toFixed(3)})`;g.lineWidth=.25+r()*.3;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}
  for(let i=0;i<Math.round(W*TH/22000);i++){const x=r()*W,y=r()*TH,rr=1+r()*r()*5;lensWrapDot(g,x,y,TH,(px,py)=>{const gr=g.createRadialGradient(px,py,0,px,py,rr);gr.addColorStop(0,`rgba(150,104,52,${(.1+r()*.12).toFixed(3)})`);gr.addColorStop(1,'rgba(150,104,52,0)');g.fillStyle=gr;g.beginPath();g.arc(px,py,rr,0,TAU);g.fill();});}
  // the offset moons, two to a tile, kept clear of the seam
  for(let k=0;k<2;k++){const cx=W*(.25+r()*.5),cy=TH*(k+.5)/2+(r()-.5)*120,R=46+r()*26,ph0=.25+r()*.5;
    g.save();g.globalAlpha=.075;g.beginPath();g.arc(cx,cy,R,0,TAU);g.clip();
    const wg=g.createRadialGradient(cx-R*.3,cy-R*.3,R*.2,cx,cy,R);wg.addColorStop(0,`rgba(${P.sepia},.5)`);wg.addColorStop(1,`rgba(${P.sepia},.9)`);g.fillStyle=wg;g.fillRect(cx-R,cy-R,R*2,R*2);
    // the lit side: the sheet left unwashed, bounded by a ragged terminator
    g.fillStyle=`rgb(${P.paper})`;g.beginPath();g.moveTo(cx-R,cy-R);for(let i=0;i<=24;i++){const t=i/24,yy=cy-R+t*R*2,xx=cx+(ph0-.5)*R*2*Math.sqrt(Math.max(0,1-((yy-cy)/R)**2))+(r()-.5)*R*.12;g.lineTo(xx,yy);}g.lineTo(cx-R,cy+R);g.closePath();g.fill();
    for(let i=0;i<7;i++){const a=r()*TAU,d=r()*R*.8,cr=2+r()*7;g.strokeStyle=`rgba(${P.ink},.8)`;g.lineWidth=.8;g.beginPath();g.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,cr,0,TAU);g.stroke();}
    g.restore();g.save();g.globalAlpha=.1;g.strokeStyle=`rgb(${P.ink})`;g.lineWidth=.6;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();g.restore();}
  return c;
}
// Register two: a glass negative. The ground is the clear emulsion, a hair blue where the blue-sensitive
// layer shows and uneven in its fog; the réseau printed through it in a hairline grid before exposure; the
// stars as knots of black silver, larger as they are brighter, never with a diffraction spike; and the plate's
// own wear — dust that prints clear, a scratch through the gelatin, a few pits.
function lensBakeGlass(pw,ph){
  const P=ink.lens,TH=LENS_TILE,c=makeCanvas(pw,ph),g=c.getContext('2d'),q=2,lw=Math.ceil(pw/q),lh=Math.ceil(ph/q),lo=makeCanvas(lw,lh),lg=lo.getContext('2d'),im=lg.createImageData?lg.createImageData(lw,lh):null,base=P.glass.split(',').map(Number),cast=P.cast.split(',').map(Number);
  if(im){const d=im.data;for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){const X=x*q/DPR,Y=y*q/DPR,i=(y*lw+x)*4,m=tileFbm(X,Y,260,3,71,TH),b=tileFbm(X,Y,120,2,73,TH),gr=(tileHash(x,y,77)-.5)*.05,l=1+m*.035+gr,t=clamp(.2+b*.5,0,1);
    for(let k=0;k<3;k++)d[i+k]=lerp(base[k],cast[k],t*.5)*l;d[i+3]=255;}lg.putImageData(im,0,0);g.imageSmoothingQuality='high';g.drawImage(lo,0,0,pw,ph);}
  else{g.fillStyle=`rgb(${P.glass})`;g.fillRect(0,0,pw,ph);}
  g.scale(DPR,DPR);const r=seeded(83);
  // the réseau, centred on the sheet and ruled straight through the whole field
  const x0=(W/2)%LENS_RESEAU;g.strokeStyle=`rgba(${P.reseau},.34)`;g.lineWidth=.55;g.beginPath();
  for(let x=x0;x<W;x+=LENS_RESEAU){g.moveTo(x,0);g.lineTo(x,TH);}for(let y=LENS_RESEAU/2;y<TH;y+=LENS_RESEAU){g.moveTo(0,y);g.lineTo(W,y);}g.stroke();
  // stars as silver: the faint ones a thin grey deposit, the bright ones a dense black knot with a soft skirt
  for(let i=0;i<Math.round(W*TH/4200);i++){const x=r()*W,y=r()*TH,m=Math.pow(r(),4),rr=.35+m*2.2,a=.16+m*.34;
    lensWrapDot(g,x,y,TH,(px,py)=>{if(rr>1.2){const sg=g.createRadialGradient(px,py,0,px,py,rr*2.2);sg.addColorStop(0,`rgba(${P.silver},${a})`);sg.addColorStop(.45,`rgba(${P.silver},${(a*.8).toFixed(3)})`);sg.addColorStop(1,`rgba(${P.silverMid},0)`);g.fillStyle=sg;g.beginPath();g.arc(px,py,rr*2.2,0,TAU);g.fill();}
      else{g.fillStyle=`rgba(${m<.02?P.silverMid:P.silver},${a.toFixed(3)})`;g.beginPath();g.arc(px,py,rr,0,TAU);g.fill();}});}
  // dust that printed clear, each with the slight dark ring round a clear spot, and pits in the gelatin
  for(let i=0;i<Math.round(W*TH/9000);i++){const x=r()*W,y=r()*TH,rr=.6+r()*1.8;lensWrapDot(g,x,y,TH,(px,py)=>{g.fillStyle='rgba(250,250,246,.8)';g.beginPath();g.arc(px,py,rr,0,TAU);g.fill();g.strokeStyle=`rgba(${P.silverMid},.35)`;g.lineWidth=.4;g.stroke();});}
  for(let i=0;i<3;i++){const x=r()*W,y=40+r()*(TH-80),a=-Math.PI/2+(r()-.5)*.9,L=60+r()*160;g.strokeStyle='rgba(252,252,248,.55)';g.lineWidth=.5+r()*.4;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*L*.5+(r()-.5)*14,y+Math.sin(a)*L*.5,x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}
  return c;
}
// Register three: a sensor read out. Black with its read noise showing as square pixels (the texture is laid
// with smoothing off), a faint bias pattern down its columns, the sky's stars as small point-spread
// functions, a few hot pixels, and the jagged track a cosmic ray leaves across an exposure.
function lensBakeSensor(pw,ph){
  const P=ink.lens,TH=LENS_TILE,c=makeCanvas(pw,ph),g=c.getContext('2d'),q=Math.max(2,Math.round(2*DPR)),lw=Math.ceil(pw/q),lh=Math.ceil(ph/q),lo=makeCanvas(lw,lh),lg=lo.getContext('2d'),im=lg.createImageData?lg.createImageData(lw,lh):null,base=P.sensor.split(',').map(Number);
  if(im){const d=im.data;for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){const i=(y*lw+x)*4,n=tileHash(x,y,97),col=tileHash(x,0,98)*3,sky=tileFbm(x*q/DPR,y*q/DPR,220,3,99,TH)*5,v=n*n*9+col+sky;
    d[i]=base[0]+v*.8;d[i+1]=base[1]+v*.95;d[i+2]=base[2]+v*1.2;d[i+3]=255;}lg.putImageData(im,0,0);g.imageSmoothingEnabled=false;g.drawImage(lo,0,0,lw*q,lh*q);}
  else{g.fillStyle=`rgb(${P.sensor})`;g.fillRect(0,0,pw,ph);}
  g.imageSmoothingEnabled=true;g.scale(DPR,DPR);const r=seeded(101);
  for(let i=0;i<Math.round(W*TH/1700);i++){const x=r()*W,y=r()*TH,m=Math.pow(r(),3),rr=.5+m*2.6,warm=r();
    const tone=warm<.2?'255,226,196':warm<.5?'214,230,255':'236,242,250';
    lensWrapDot(g,x,y,TH,(px,py)=>{const sg=g.createRadialGradient(px,py,0,px,py,rr*2.4);sg.addColorStop(0,`rgba(${tone},${(.45+m*.55).toFixed(3)})`);sg.addColorStop(.3,`rgba(${tone},${(.18+m*.3).toFixed(3)})`);sg.addColorStop(1,`rgba(${tone},0)`);g.fillStyle=sg;g.beginPath();g.arc(px,py,rr*2.4,0,TAU);g.fill();});}
  for(let i=0;i<Math.round(W*TH/30000);i++){const x=Math.floor(r()*W),y=Math.floor(r()*TH);g.fillStyle='rgba(255,255,255,.75)';g.fillRect(x,y,1,1);}
  for(let i=0;i<2;i++){let x=r()*W,y=40+r()*(TH-80);const a=r()*TAU;g.strokeStyle='rgba(236,244,255,.5)';g.lineWidth=.8;g.beginPath();g.moveTo(x,y);for(let j=0;j<6;j++){x+=Math.cos(a)*(3+r()*4)+(r()-.5)*2;y+=Math.sin(a)*(3+r()*4)+(r()-.5)*2;g.lineTo(x,y);}g.stroke();}
  return c;
}
function lensTile(reg){
  const key=W+'x'+DPR;if(lensTileKey!==key){lensTiles[0]=lensTiles[1]=lensTiles[2]=null;lensTileKey=key;}
  if(!lensTiles[reg]){const pw=Math.max(1,Math.round(W*DPR)),ph=Math.round(LENS_TILE*DPR);lensTiles[reg]=[lensBakeEye,lensBakeGlass,lensBakeSensor][reg](pw,ph);}
  return lensTiles[reg];
}

// ---------- Where one register gives way to the next ----------
// The next register does not arrive from an edge: it grows out of the body the run lands on at the first
// row past each register's last (the simulation's 'transition', at LENS_REG_ROWS and twice that), as a
// circle round that body widening until it holds the whole sheet — the plate laid over the drawing from
// the planet outward, then the readout from the planet outward over the plate. This is JOURNEY.md's stage 5
// tried inside one century first: the medium changes under the run, the body it grows from stays where it
// is, and nothing waits on the player, who may release while it grows and leave it growing behind them.
// The dark is held while it does (TRANSITION_GRACE in the simulation). Everything on the sheet is drawn in
// the register of the ground it stands on, so a body the circle has not reached yet is still the old one.
const LENS_GROW=1.8;
let lensGrowWorld=null,lensGrowth=[];
function lensGrowths(){if(lensGrowWorld!==world){lensGrowWorld=world;lensGrowth=[];}return lensGrowth;}
function lensTransition(e){const g=lensGrowths();if(g.length<2)g.push({x:e.x,y:e.y,t0:e.time});}
// How far a register has grown from its body, in world units: nothing before it starts and, once grown,
// everything, so a body dealt later far up the chart is already in it. Read off the run's own clock, so a
// pause holds it where it stands.
function lensReach(g){
  const t=(world.time-g.t0)/(reducedMotion?.5:LENS_GROW);if(t<=0)return 0;if(t>=1)return Infinity;
  return t*t*(3-2*t)*Math.hypot(W,H)/scale*1.15;
}
function lensRegAt(x,y){const gs=lensGrowths();let reg=0;for(let k=0;k<gs.length;k++){const r=lensReach(gs[k]);if(r===Infinity||Math.hypot(x-gs[k].x,y-gs[k].y)<r)reg=k+1;}return reg;}
// The register a point in the world is drawn in. Callers that know only a height ask at the sheet's middle.
function lensRegAtY(y,x=0){return lensRegAt(x,y);}
const lensRegAtScreen=(ys,xs=W/2)=>lensRegAt((xs-W*.5-plateShift.x)/scale,(ys-plateShift.y)/scale+world.cameraY);
// The margins down both edges count the climb in arcminutes in every register, each in its own manner: an
// engraved double rule with the Fell's figures at the eyepiece; the plate's own unexposed edge, clear glass
// with its numbers typed, on the plate; and an instrument axis with row numbers in the card face, off the sensor.
const LENS_BAND=14;
function lensMargins(reg,top,bot){
  const P=ink.lens,B=LENS_BAND,camTop=world.cameraY+top/scale,camBot=world.cameraY+bot/scale,first=Math.floor(-camBot/LENS_UNIT)-1,last=Math.ceil(-camTop/LENS_UNIT)+1;
  ctx.save();ctx.beginPath();ctx.rect(0,top,W,bot-top);ctx.clip();
  for(const side of[-1,1]){const x0=side<0?0:W-B,inner=side<0?B:W-B;
    if(reg===0){ctx.fillStyle=`rgba(${P.paper},.55)`;ctx.fillRect(x0,top,B,bot-top);ctx.strokeStyle=`rgba(${P.ink},.8)`;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(inner,top);ctx.lineTo(inner,bot);ctx.stroke();ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(inner+side*2.2,top);ctx.lineTo(inner+side*2.2,bot);ctx.stroke();}
    else if(reg===1){const cg=ctx.createLinearGradient(x0,0,x0+B,0);cg.addColorStop(0,`rgba(246,246,242,${side<0?.85:.5})`);cg.addColorStop(1,`rgba(246,246,242,${side<0?.5:.85})`);ctx.fillStyle=cg;ctx.fillRect(x0,top,B,bot-top);
      ctx.strokeStyle=`rgba(${P.reseau},.55)`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(inner,top);ctx.lineTo(inner,bot);ctx.stroke();}
    else{ctx.fillStyle='rgba(2,3,6,.9)';ctx.fillRect(x0,top,B,bot-top);ctx.strokeStyle=`rgba(${P.cyan},.45)`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(inner,top);ctx.lineTo(inner,bot);ctx.stroke();}
    ctx.beginPath();for(let k=first;k<=last;k++){const y=sy(-k*LENS_UNIT),m=((k%60)+60)%60,L=m%10===0?B*.55:m%5===0?B*.36:B*.2;ctx.moveTo(inner,y);ctx.lineTo(inner-side*L,y);}
    ctx.strokeStyle=reg===0?`rgba(${P.ink},.75)`:reg===1?`rgba(${P.inkBlack},.7)`:`rgba(${P.instrSoft},.8)`;ctx.lineWidth=.5;ctx.stroke();
    for(let k=first;k<=last;k++){const m=((k%60)+60)%60;if(m%10)continue;const y=sy(-k*LENS_UNIT),xm=side<0?B*.32:W-B*.32,deg=Math.floor(k/60);
      ctx.save();ctx.translate(xm,y);ctx.rotate(side<0?-Math.PI/2:Math.PI/2);
      if(reg===0)lensFell(ctx,m===0?deg+'°':m+'′',0,0,7.5,P.ink,.8);
      else if(reg===1)lensGrot(ctx,String(m===0?deg:m).padStart(2,'0'),0,0,7,P.inkBlack,.75,'center');
      else lensMono(ctx,String(k*LENS_UNIT*4).padStart(5,'0'),0,0,6,P.instrSoft,.85,'center');
      ctx.restore();}}
  ctx.restore();
}
// The growing edge itself. Paper to glass: the plate's bevel catching the light over a thin shadow cast
// out onto the paper, with a strip of unexposed emulsion inside it. Glass to sensor: the readout's dark
// border with a scan line glowing inside it.
function lensRim(reg,x,y,R){
  // Just after it starts the circle is smaller than the edge's own rings, which then stand at nought.
  const P=ink.lens,at=d=>Math.max(0,R+d);ctx.save();
  if(reg===1){
    ctx.strokeStyle='rgba(60,44,24,.22)';ctx.lineWidth=8;ctx.beginPath();ctx.arc(x,y,at(+4),0,TAU);ctx.stroke();
    ctx.strokeStyle='rgba(248,248,244,.7)';ctx.lineWidth=6;ctx.beginPath();ctx.arc(x,y,at(-3),0,TAU);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(x,y,at(0),0,TAU);ctx.stroke();
    ctx.strokeStyle=`rgba(${P.reseau},.6)`;ctx.lineWidth=.6;ctx.beginPath();ctx.arc(x,y,at(-6),0,TAU);ctx.stroke();
  }else{
    ctx.strokeStyle=`rgb(${P.sensor})`;ctx.lineWidth=Math.max(3,4*scale);ctx.beginPath();ctx.arc(x,y,at(+1.5),0,TAU);ctx.stroke();
    const glow=.55+.25*Math.sin((reducedMotion?0:world.time)*2.4);
    ctx.strokeStyle=`rgba(${P.cyan},${glow.toFixed(3)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,at(-1.5),0,TAU);ctx.stroke();
  }
  ctx.restore();
}
// The frontispiece's title mark: Saturn as far as any run on this device has resolved it, above the opening
// lights and gone once the hand starts; the era's name beneath it in the Fell capitals, and the catalogue.
let lensTitleFade=1;
// The mark is laid out upward from the opening lights and downward from the lore above them, so it fits the
// gap between the two on any sheet — a short phone gets a smaller Saturn rather than a title set over the
// rings, and a wide one lifts it clear of rings that sit higher than they do in the hand.
function lensTitleRoom(){
  let top=H*.13;
  // read every frame the frontispiece stands, which is the only time this is drawn, so a turned phone is followed
  try{const e=document.getElementById('lens-lore-open'),r=e&&e.getBoundingClientRect?e.getBoundingClientRect():null,gr=game.getBoundingClientRect?game.getBoundingClientRect():null;
    if(r&&gr&&r.height>0)top=r.bottom-gr.top+6;}catch(_){}
  let bottom=H*.36;for(const n of world.nodes)if(n.difficultyChoice)bottom=Math.min(bottom,sy(n.y)-n.cap*scale-6);
  return{top,bottom};
}
function lensTitleMark(){
  const ready=world.state==='ready';lensTitleFade=ready?1:Math.max(0,lensTitleFade-.03);if(lensTitleFade<=0)return;
  const P=ink.lens,rec=lensRead(),stage=rec.completed>0?6:rec.furthest+1,C=LENS_CHAPTERS[stage-1],x=W/2,nw=lensBits(rec.worlds),nf=lensBits(rec.fields),log=nw||nf;
  // from the bottom up: the log, the line, the title, then Saturn in what is left. The vignette round a
  // drawing reaches past it, so a drawing is measured by its own body and companions or rings, and from
  // 1887 on by the pane or sensor frame it is set in, which stands taller than either
  const {top,bottom}=lensTitleRoom(),logY=bottom-6,lineY=log?logY-15:logY,titleY=lineY-21,half=stage<=2?.95:1.25,fit=Math.min(W*.1,34*scale+4,(titleY-16-top)/(half*2)),R=clamp(fit,12,40),y=titleY-16-R*half;
  // a sheet too short to hold the drawing clear of the lore gets the title alone rather than a drawing set over words
  ctx.save();ctx.globalAlpha=lensTitleFade;
  if(fit>=14){const key='title:'+stage+':'+R.toFixed(1)+':'+DPR;let sp=lensSprites.get(key);
  if(!sp){const size=Math.ceil(R*4.4),c=makeCanvas(Math.round(size*DPR),Math.round(size*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);lensSaturn(g,R,stage,1);sp={canvas:c,size};if(lensSprites.size>8)lensSprites.clear();lensSprites.set(key,sp);}
  ctx.drawImage(sp.canvas,x-sp.size/2,y-sp.size/2,sp.size,sp.size);}
  lensFell(ctx,'THE LENS',x,titleY,Math.min(24,W*.062),P.ink,.94,'center','sc');
  lensFell(ctx,'Saturn, as far as it has been resolved: '+C.year+' · '+C.place.toLowerCase().replace(/\b\w/g,m=>m.toUpperCase()),x,lineY,Math.min(10.5,W*.027),P.inkSoft,.85,'center','text','italic');
  if(log)lensTyped(ctx,'LOG · '+nw+' OF 7 WORLDS · '+nf+' OF 12 FIELDS',x,logY,8,P.inkRed,.8,'center');
  ctx.restore();
}
// The ground: each register's tile laid in its own band at the camera's rate, a light held over the middle of
// the sheet where the eye is, the margins, the seams, and on the frontispiece the title.
function lensGround(reg){
  const th=LENS_TILE,phase=(((-world.cameraY*scale)%th)+th)%th,tile=lensTile(reg);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  for(let y=phase-th;y<H+th;y+=th)ctx.drawImage(tile,0,Math.round(y*DPR));ctx.restore();
  sheetWash('lens.lamp.'+reg,g=>{const lg=g.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.12,W*.5,H*.45,Math.max(W,H)*.8);
    if(reg===0){lg.addColorStop(0,'rgba(255,250,232,.07)');lg.addColorStop(1,'rgba(80,56,24,.16)');}
    else if(reg===1){lg.addColorStop(0,'rgba(255,255,255,.08)');lg.addColorStop(1,'rgba(40,44,48,.12)');}
    else{lg.addColorStop(0,'rgba(40,60,90,.06)');lg.addColorStop(1,'rgba(0,0,0,.35)');}
    g.fillStyle=lg;g.fillRect(0,0,W,H);});
  lensMargins(reg,0,H);
}
function lensAtmosphere(){
  plateShift.x=0;plateShift.y=0;
  // The newest register that has finished growing is the whole ground; any still growing is laid over it
  // inside its own circle, with its edge drawn round it.
  const gs=lensGrowths();let base=0;gs.forEach((g,k)=>{if(lensReach(g)===Infinity)base=k+1;});
  lensGround(base);
  for(let k=base;k<gs.length;k++){const r=lensReach(gs[k]);if(r<=0)continue;const x=sx(gs[k].x),y=sy(gs[k].y),R=r*scale;
    ctx.save();ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.clip();lensGround(k+1);ctx.restore();lensRim(k+1,x,y,R);}
  lensTitleMark();
}

// ---------- A chapter opens: the place, its year, and Saturn as it drew it ----------
// Struck early in the paint order, under every orbit and body, the way the atlas cuts its chapter title into
// the plate: Saturn at this chapter's reading, faint behind the play and made in the register's own manner,
// the place above it, and the reading set in the register's own hand — the Fell at the eyepiece, a typed
// jacket label on the plate, a teletyped header off the sensor.
let lensRevealCanvas=null,lensRevealKey='',lensRevealOf=null,lensRevealAt=0;
function lensChapterReveal(dt){
  if(!world||world.state==='ready'||world.state==='dead')return;
  // Timed off the run's own clock from the moment this chapter's reveal was dealt, as the Astrolabe's is.
  if(lensRevealOf!==chapterReveal){lensRevealOf=chapterReveal;lensRevealAt=world.time-chapterReveal.age;}
  chapterReveal.age=world.time-lensRevealAt;
  const age=chapterReveal.age,i=clamp(chapterReveal.index|0,0,LENS_CHAPTERS.length-1);if(age>4.2)return;
  // The first chapter opens over the three lights the run is chosen on, and those are read before anything
  // else on the sheet; so while any of them stands on screen the whole opening — its title above and Saturn
  // below it — is laid out in the room above their rings, Saturn shrinking to fit and left out when it cannot.
  let clear=Infinity;for(const n of world.nodes)if(n.difficultyChoice){const t=sy(n.y)-n.cap*scale-10;if(t>-40&&t<H)clear=Math.min(clear,t);}
  // how far the drawing stands above its centre: the bare drawing at the eyepiece, the pane or sensor frame after
  const i0=clamp(chapterReveal.index|0,0,LENS_CHAPTERS.length-1),up=i0<2?.75:1.25;
  let R=Math.min(W*.16,62),cy=H*.44,drawSat=true;
  if(cy+R*1.2>clear){const room=clear-(lensHudTop()+66);R=Math.min(R,(room-66)/(up+1.2));drawSat=R>=18;cy=drawSat?clear-R*1.2:clear;}
  const P=ink.lens,C=LENS_CHAPTERS[i],reg=C.reg,fade=age<.4?age/.4:age>3.4?clamp(1-(age-3.4)/.8,0,1):1,size=Math.ceil(Math.max(R,18)*4.4);
  const key=size+':'+DPR;if(!lensRevealCanvas||lensRevealKey!==key){lensRevealCanvas=makeCanvas(Math.round(size*DPR),Math.round(size*DPR));lensRevealKey=key;}
  const g=lensRevealCanvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,lensRevealCanvas.width,lensRevealCanvas.height);
  const cx=W/2;
  if(drawSat){g.setTransform(DPR,0,0,DPR,0,0);g.translate(size/2,size/2);lensSaturn(g,R,i+1,clamp((age-.35)/2,0,1));
    ctx.save();ctx.globalAlpha=(reg===0?.5:.62)*fade;ctx.drawImage(lensRevealCanvas,cx-size/2,cy-size/2,size,size);ctx.restore();}
  const tk=clamp((age-.2)/.8,0,1)*fade,ty=drawSat?cy-R*up-14:clear-8,sub=LENS_ROMAN[i]+' OF VI · '+C.place+' · '+C.year;
  if(reg===0){
    lensFell(ctx,C.place,cx,ty-40,28,P.ink,.9*tk,'center','sc');
    lensFell(ctx,'Caput '+LENS_ROMAN[i]+' · '+C.year+' · '+C.who.toLowerCase().replace(/\b\w/g,m=>m.toUpperCase()),cx,ty-16,12,P.ink,.8*tk,'center','text','italic');
    lensFell(ctx,C.reading,cx,ty+1,9.5,P.inkSoft,.85*clamp((age-.9)/.6,0,1)*fade,'center','sc');
  }else if(reg===1){
    // a plate jacket's label: a ruled slip with the plate's particulars typed on it
    const w=Math.min(W-60,250),h=58,x0=cx-w/2,y0=ty-54;ctx.save();ctx.globalAlpha=tk;
    ctx.fillStyle='rgba(236,226,200,.92)';ctx.fillRect(x0,y0,w,h);ctx.strokeStyle=`rgba(${P.inkBlack},.6)`;ctx.lineWidth=.8;ctx.strokeRect(x0,y0,w,h);
    ctx.strokeStyle=`rgba(${P.inkBlack},.2)`;ctx.lineWidth=.5;ctx.beginPath();for(let k=1;k<4;k++){ctx.moveTo(x0+6,y0+k*h/4);ctx.lineTo(x0+w-6,y0+k*h/4);}ctx.stroke();ctx.restore();
    lensTyped(ctx,C.place+' · '+C.year,cx,y0+h*.125+1,13,P.inkBlack,.95*tk,'center',Math.floor(age*30),'jacket');
    lensTyped(ctx,'PLATE '+LENS_ROMAN[i]+' OF VI · '+C.who,cx,y0+h*.375+1,9.5,P.inkBlack,.85*tk,'center',Math.floor((age-.4)*30));
    lensTyped(ctx,C.reading,cx,y0+h*.625+1,9.5,P.inkRed,.9*tk,'center',Math.floor((age-.8)*30));
    lensTyped(ctx,C.tag,cx,y0+h*.875+1,8,P.inkBlack,.7*tk,'center',Math.floor((age-1.2)*30));
  }else{
    // a header of cards, typed a glyph at a time behind a block cursor
    const lines=[lensCard('TELESCOP',"'"+(i===4?'KPNO':'HST')+"'"),lensCard('DATE-OBS',"'"+C.year+"'"),lensCard('OBJECT',"'SATURN'"),lensCard('COMMENT',C.reading)],cw=7.2,x0=cx-Math.min(W-50,34*cw)/2;
    ctx.save();ctx.globalAlpha=tk;ctx.fillStyle='rgba(2,4,8,.82)';ctx.fillRect(x0-8,ty-100,Math.min(W-34,34*cw+16),lines.length*14+46);ctx.strokeStyle=`rgba(${P.instrSoft},.5)`;ctx.lineWidth=.6;ctx.strokeRect(x0-8,ty-100,Math.min(W-34,34*cw+16),lines.length*14+46);ctx.restore();
    lensMono(ctx,C.place,cx,ty-86,18,P.instr,.95*tk,'center',Math.floor(age*26));
    let t0=.3;lines.forEach((ln,k)=>{lensMono(ctx,ln,x0,ty-54+k*14,10,k===3?P.cyan:P.instr,.92*tk,'left',Math.max(0,Math.floor((age-t0)*34)));t0+=ln.length/34;});
  }
}

// ---------- The node: an aperture, a light, or a surface ----------
// The ring stands at the node's real capture radius in every register, never staged wider or narrower than
// the truth the code tests: at the eyepiece a field stop cut as a fine circle with four index ticks; on the
// plate a grease-pencil circle laid on the glass back; off the sensor a photometry aperture. Each is drawn
// on round from the top as the node is revealed.
const lensFlourishAt=new Map();
function lensFlourish(n){
  lensFlourishAt.set(n,world.time);
  if(lensFlourishAt.size>40)for(const[key,at]of lensFlourishAt)if(world.time-at>.8)lensFlourishAt.delete(key);
}
function lensRing(n,reg,x,y,cap,state,drawn){
  const P=ink.lens;if(drawn<=0)return;const a0=-Math.PI/2,a1=a0+TAU*drawn;
  ctx.save();ctx.lineCap='round';
  if(reg===0){ctx.strokeStyle=`rgba(${P.ink},${(.7*state).toFixed(3)})`;ctx.lineWidth=Math.max(.6,.7*scale);ctx.beginPath();ctx.arc(x,y,cap,a0,a1);ctx.stroke();
    ctx.lineWidth=Math.max(.35,.35*scale);ctx.strokeStyle=`rgba(${P.ink},${(.4*state).toFixed(3)})`;ctx.beginPath();ctx.arc(x,y,cap-2.2*scale,a0,a1);ctx.stroke();
    ctx.lineWidth=Math.max(.5,.6*scale);ctx.strokeStyle=`rgba(${P.ink},${(.7*state).toFixed(3)})`;ctx.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;if(a-(-Math.PI/2)>TAU*drawn+1e-3&&drawn<1)continue;ctx.moveTo(x+Math.cos(a)*cap,y+Math.sin(a)*cap);ctx.lineTo(x+Math.cos(a)*(cap+5*scale),y+Math.sin(a)*(cap+5*scale));}ctx.stroke();}
  else if(reg===1){ctx.strokeStyle=`rgba(${P.inkRed},${(.72*state).toFixed(3)})`;ctx.beginPath();
    // a grease pencil wanders a little, but never off the true radius by more than a fraction of a unit
    const N=64;for(let i=0;i<=N*drawn;i++){const a=a0+i/N*TAU,rr=cap+(tileHash(n.id,i,5)-.5)*.8+.4*Math.sin(i*.7+n.id);i?ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):ctx.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}
    ctx.lineWidth=Math.max(.9,1.25*scale);ctx.stroke();}
  else{ctx.strokeStyle=`rgba(${P.cyan},${(.62*state).toFixed(3)})`;ctx.lineWidth=Math.max(.6,.65*scale);ctx.beginPath();ctx.arc(x,y,cap,a0,a1);ctx.stroke();
    ctx.lineCap='butt';ctx.beginPath();for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;ctx.moveTo(x+Math.cos(a)*(cap+2*scale),y+Math.sin(a)*(cap+2*scale));ctx.lineTo(x+Math.cos(a)*(cap+6*scale),y+Math.sin(a)*(cap+6*scale));}ctx.stroke();}
  const at=lensFlourishAt.get(n);
  if(at!==undefined){const k=clamp(1-(world.time-at)/.8,0,1);if(k>0){ctx.strokeStyle=reg===0?`rgba(${P.gold},${(.95*k).toFixed(3)})`:reg===1?`rgba(${P.silver},${(.8*k).toFixed(3)})`:`rgba(${P.instr},${(.95*k).toFixed(3)})`;ctx.lineWidth=(.5+2.6*k)*scale;ctx.beginPath();ctx.arc(x,y,cap+(1-k)*6*scale,0,TAU);ctx.stroke();}}
  ctx.restore();
}
// Where the next body can be reached from the held ring: a band laid outside the rim over the arc that
// connects, and at every tangent that threads clear of every hazard a division struck across it with a mark
// on it — geometry only, read exactly as drawNode reads it, and only the material changes by register.
function lensReleaseMarks(n,p,reg,x,y){
  const P=ink.lens,rad=p.rad*scale,band=reg===0?P.rubric:reg===1?P.inkRed:P.cyan,tick=reg===0?P.ink:reg===1?P.inkBlack:P.instr;
  for(const next of releaseTargets(n)){
    const dist=Math.hypot(next.x-n.x,next.y-n.y),a=Math.atan2(next.y-n.y,next.x-n.x)-p.dir*Math.acos(clamp(p.rad/dist,-1,1)),win=Math.asin(clamp(next.cap/dist,0,.8));
    ctx.save();ctx.strokeStyle=`rgba(${band},${reg===2?.3:.4})`;ctx.lineWidth=3.2*scale;ctx.lineCap='butt';ctx.beginPath();ctx.arc(x,y,rad+7*scale,a-win,a+win);ctx.stroke();
    ctx.strokeStyle=`rgba(${band},.85)`;ctx.lineWidth=.5*scale;ctx.beginPath();for(let t=-1;t<=1;t+=.25){const b=a+t*win;ctx.moveTo(x+Math.cos(b)*(rad+5*scale),y+Math.sin(b)*(rad+5*scale));ctx.lineTo(x+Math.cos(b)*(rad+9*scale),y+Math.sin(b)*(rad+9*scale));}ctx.stroke();ctx.restore();
    for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
      if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
      const c=Math.cos(path.angle),s=Math.sin(path.angle),mx=x+c*(rad+9*scale),my=y+s*(rad+9*scale);
      ctx.save();ctx.strokeStyle=`rgba(${tick},.9)`;ctx.lineWidth=1*scale;ctx.beginPath();ctx.moveTo(x+c*(rad-4*scale),y+s*(rad-4*scale));ctx.lineTo(x+c*(rad+13*scale),y+s*(rad+13*scale));ctx.stroke();
      if(reg===0){ctx.fillStyle=`rgb(${P.gold})`;ctx.strokeStyle=`rgba(${P.ink},.85)`;ctx.lineWidth=.5*scale;ctx.beginPath();for(let i=0;i<10;i++){const aa=i/10*TAU-Math.PI/2,rr=i%2?1.2*scale:3*scale;i?ctx.lineTo(mx+Math.cos(aa)*rr,my+Math.sin(aa)*rr):ctx.moveTo(mx+Math.cos(aa)*rr,my+Math.sin(aa)*rr);}ctx.closePath();ctx.fill();ctx.stroke();}
      else if(reg===1){ctx.strokeStyle=`rgba(${P.inkRed},.95)`;ctx.lineWidth=1.1*scale;ctx.beginPath();ctx.arc(mx,my,2.6*scale,0,TAU);ctx.stroke();ctx.fillStyle=`rgb(${P.inkBlack})`;ctx.beginPath();ctx.arc(mx,my,.9*scale,0,TAU);ctx.fill();}
      else{ctx.strokeStyle=`rgba(${P.instr},.95)`;ctx.lineWidth=.8*scale;const q=2.6*scale;ctx.strokeRect(mx-q,my-q,q*2,q*2);ctx.fillStyle=`rgb(${P.cyan})`;ctx.fillRect(mx-.8*scale,my-.8*scale,1.6*scale,1.6*scale);}
      ctx.restore();}
  }
}
// Which world a body is, and how large its disc is drawn once it is resolved.
const lensFamily=n=>planetFamilyFor(n.type,n.row,world.seed,n.difficultyChoice);
const lensDiscR=n=>clamp(n.r*.4,7,17)*scale;
// A light not yet reached, in each register's way of being unresolved: a soft blot at the eyepiece that has
// not come to focus; a bare knot of silver on the glass; a point-spread function off the sensor.
function lensPhenomenon(n,reg,x,y){
  const P=ink.lens,m=clamp((n.r-18)/34,0,1),fading=n.type==='fading',al=fading?.5:1;
  ctx.save();ctx.globalAlpha=al;
  if(reg===0){const r=(3+m*3.5)*scale,gr=ctx.createRadialGradient(x,y,0,x,y,r*1.6);gr.addColorStop(0,`rgba(${P.sepia},.85)`);gr.addColorStop(.45,`rgba(${P.sepia},.5)`);gr.addColorStop(1,`rgba(${P.sepia},0)`);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r*1.6,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(${P.ink},.45)`;ctx.lineWidth=Math.max(.4,.4*scale);ctx.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.moveTo(x+Math.cos(a)*r*2,y+Math.sin(a)*r*2);ctx.lineTo(x+Math.cos(a)*r*3.2,y+Math.sin(a)*r*3.2);}ctx.stroke();}
  else if(reg===1){const r=(1.6+m*2.4)*scale,sg=ctx.createRadialGradient(x,y,0,x,y,r*2.1);sg.addColorStop(0,`rgba(${P.silver},.95)`);sg.addColorStop(.5,`rgba(${P.silver},.75)`);sg.addColorStop(1,`rgba(${P.silverMid},0)`);ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,r*2.1,0,TAU);ctx.fill();}
  else{const r=(1.4+m*2)*scale,t=reducedMotion?0:world.time,tw=1+.08*Math.sin(t*3+n.id),sg=ctx.createRadialGradient(x,y,0,x,y,r*3*tw);sg.addColorStop(0,'rgba(248,252,255,1)');sg.addColorStop(.18,'rgba(230,242,255,.8)');sg.addColorStop(.5,'rgba(160,200,240,.18)');sg.addColorStop(1,'rgba(160,200,240,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,r*3*tw,0,TAU);ctx.fill();}
  ctx.restore();
}
// Which bodies' records this run has already written to the catalogue, so a finished world is noted once.
let lensRunWorld=null,lensNoted=new Set();
function lensRun(){if(lensRunWorld!==world){lensRunWorld=world;lensNoted=new Set();lensFlourishAt.clear();lensBodyArts.clear();}}
function lensNoteDone(n,family){if(n.difficultyChoice||lensNoted.has(n.id))return;lensNoted.add(n.id);lensNoteWorld(family);}
// Register one: the body at the eyepiece. Out of focus at the capture, a soft blot that tightens; by a
// quarter of the sweep the first reading is cut on in the burin's hatching; by two thirds it has resolved
// into its better answer where history gives one, and the drawing is sealed with its dated caption.
function lensBodyEye(n,family,x,y,d,al){
  const P=ink.lens,R=lensDiscR(n),s1=lensSpan(d,LENS_STAGE.soft),s2=lensSpan(d,LENS_STAGE.first),s3=lensSpan(d,LENS_STAGE.done),e2=lensEase(s2),e3=lensEase(s3);
  ctx.save();ctx.globalAlpha=al;
  // the blot before focus, fading as the lines take over
  if(s2<1){const b=R*(1.7-.6*s1),gr=ctx.createRadialGradient(x,y,0,x,y,b);gr.addColorStop(0,`rgba(${P.sepia},${(.55*(1-e2)).toFixed(3)})`);gr.addColorStop(.6,`rgba(${P.sepia},${(.3*(1-e2)).toFixed(3)})`);gr.addColorStop(1,`rgba(${P.sepia},0)`);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,b,0,TAU);ctx.fill();}
  let reach=R;
  if(family==='ringed'){
    // Galileo's two companions, and then Huygens's ring where they stood
    const side=R*.46,off=R*1.62;const sd=n.id|0;for(const s of[-1,1])lensHatchDisc(ctx,x+s*off,y+(s<0?-.04:.05)*R,side*(s<0?1:.92),e2*(1-e3),P,1-e3,{noCross:true,seed:sd+(s<0?1:2)});
    // Each of the ring's two outlines is one hand-drawn ellipse cut into its far and near halves with the same
    // seed, so the halves meet where the globe hides the join; the near half is gone over a second time.
    const rx=R*2.25,ry=R*.72,ix=R*1.45,iy=R*.46,ring=(a0,a1,w,al)=>{ctx.strokeStyle=`rgba(${P.ink},${al.toFixed(3)})`;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();lensHandEllipse(ctx,x,y,rx,ry,-.12,a0,a1,sd+11);ctx.stroke();ctx.beginPath();lensHandEllipse(ctx,x,y,ix,iy,-.12,a0,a1,sd+12);ctx.stroke();};
    if(e3>0)ring(Math.PI,TAU,Math.max(.6,R*.07),.85*e3);
    lensHatchDisc(ctx,x,y,R,e2,P,1,{seed:sd});
    if(e3>0){ring(-.05,Math.PI+.05,Math.max(.6,R*.08),.9*e3);
      ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx,ry,-.12,0,Math.PI);ctx.ellipse(x,y,ix,iy,-.12,Math.PI,0,true);ctx.closePath();ctx.clip();ctx.strokeStyle=`rgba(${P.ink},${(.35*e3).toFixed(3)})`;ctx.lineWidth=Math.max(.35,R*.03);
        for(let i=1;i<4;i++){const t=i/4+(tileHash(sd,i,63)-.5)*.08,a0=tileHash(sd,i,64)*.5,a1=Math.PI-tileHash(sd,i,65)*.5;ctx.beginPath();lensHandEllipse(ctx,x,y,lerp(ix,rx,t),lerp(iy,ry,t),-.12,a0,a1,sd+20+i,1.5);ctx.stroke();}ctx.restore();}
    reach=Math.max(R*.75,R*.72*e3)+R*.1;
  }else if(family==='ocean'){
    // Venus in her phases, as Galileo's anagram has it: the mother of loves imitates the shapes of Cynthia
    lensHatchDisc(ctx,x,y,R,e2,P,1,{angle:.2,seed:n.id|0});
    if(e2>0){const tw=R*(.35+.3*(1-e3));ctx.fillStyle=`rgba(${P.paper},${(.92*e2).toFixed(3)})`;ctx.beginPath();ctx.arc(x,y,R*.97,Math.PI*.55,Math.PI*1.45);ctx.ellipse(x,y,tw,R*.97,0,Math.PI*1.5,Math.PI*.5,true);ctx.closePath();ctx.fill();
      // the terminator is the one line of the phase the hand draws; the limb is the disc's own outline
      ctx.strokeStyle=`rgba(${P.ink},${(.7*e2).toFixed(3)})`;ctx.lineWidth=Math.max(.4,R*.05);ctx.lineCap='round';ctx.beginPath();lensHandEllipse(ctx,x,y,tw,R*.97,0,Math.PI*.5+.08,Math.PI*1.5-.06,(n.id|0)+31,1.6);ctx.stroke();}
  }else if(family==='ice'){
    // Herschel's comet that would not move like one: a coma at first, then a clean small disc
    if(e2>0&&e3<1){const cg=ctx.createRadialGradient(x,y,R*.3,x+R*1.4,y-R*.4,R*2.6);cg.addColorStop(0,`rgba(${P.sepia},${(.35*e2*(1-e3)).toFixed(3)})`);cg.addColorStop(1,`rgba(${P.sepia},0)`);ctx.fillStyle=cg;ctx.beginPath();ctx.ellipse(x+R*.9,y-R*.25,R*2.2,R*.9,-.25,0,TAU);ctx.fill();}
    lensHatchDisc(ctx,x,y,R*.72,e2,P,1,{noCross:true,seed:n.id|0});
  }else{
    lensHatchDisc(ctx,x,y,R,e2,P,1,{angle:family==='volcanic'?.9:undefined,seed:n.id|0});
    if(family==='crater'&&e2>0){ctx.strokeStyle=`rgba(${P.ink},${(.75*e2).toFixed(3)})`;ctx.lineWidth=Math.max(.4,R*.045);
      // Craters spread over the lit face, each a rim cut as the arc of its wall that faces away from the light
      // with the shadow it throws laid inside, the way Galileo's wash drawings of the Moon set them.
      // They are dealt round the disc a sector each, so they never pile into one clump whatever the seed.
      ctx.lineWidth=Math.max(.35,R*.03);
      for(let i=0;i<7;i++){const a=(i+tileHash(n.id,i,3)*.7)/7*TAU,d0=R*(i===6?.12:.38+tileHash(n.id,i,5)*.3),cx=x+Math.cos(a)*d0,cy=y+Math.sin(a)*d0,cr=R*(.07+tileHash(n.id,i,4)*.08);
        ctx.fillStyle=`rgba(${P.ink},${(.35*e2).toFixed(3)})`;ctx.beginPath();ctx.arc(cx,cy,cr,Math.PI*.95,Math.PI*1.85);ctx.quadraticCurveTo(cx+cr*.1,cy-cr*.1,cx-cr*.95,cy+cr*.15);ctx.fill();
        ctx.beginPath();lensHandEllipse(ctx,cx,cy,cr,cr*(.9+tileHash(n.id,i,6)*.15),tileHash(n.id,i,7)*3,-1,-1+TAU*1.08,(n.id|0)*7+i,2.2);ctx.stroke();}
      // lit peaks standing out in the dark beyond the terminator, the mountains Galileo measured by their shadows
      ctx.fillStyle=`rgba(${P.paper},${(.95*e3).toFixed(3)})`;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(x+R*(.45+tileHash(n.id,i,6)*.3),y+R*(tileHash(n.id,i,7)-.5)*1.1,Math.max(.6,R*.05),0,TAU);ctx.fill();}}
    if(family==='storm'&&e2>0){ctx.save();ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.clip();ctx.strokeStyle=`rgba(${P.ink},${(.8*e2).toFixed(3)})`;ctx.lineCap='round';
      // Each belt is laid as a few loose side-by-side strokes that wander a little up and down the disc and
      // thin out toward the limb, the way a belt is shaded in at the eyepiece rather than ruled across it.
      for(const [bi,b] of[[0,-.28],[1,.22]])for(let j=0;j<3;j++){const q=bi*3+j,yo=y+R*(b+(j-1)*.065+(tileHash(n.id,q,51)-.5)*.04),ph=tileHash(n.id,q,52)*TAU,x0=x-R*(1.05-tileHash(n.id,q,53)*.2),x1=x+R*(1.05-tileHash(n.id,q,54)*.2);
        ctx.globalAlpha=al*(.55+.4*tileHash(n.id,q,57));ctx.lineWidth=Math.max(.5,R*(.04+tileHash(n.id,q,55)*.03));ctx.beginPath();for(let t=0;t<=12;t++){const px=lerp(x0,x1,t/12),py=yo+Math.sin(t*.9+ph)*R*.03+(px-x)*(tileHash(n.id,bi,56)-.5)*.06;t?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}ctx.restore();
      if(e3>0){ctx.strokeStyle=`rgba(${P.rubric},${(.9*e3).toFixed(3)})`;ctx.lineWidth=Math.max(.5,R*.07);ctx.lineCap='round';ctx.beginPath();lensHandEllipse(ctx,x+R*.25,y+R*.42,R*.26,R*.13,-.08,-.6,-.6+TAU*1.1,(n.id|0)+41,2);ctx.stroke();}}
    if(family==='dune'&&e2>0){ctx.fillStyle=`rgba(${P.paper},${(.95*e2).toFixed(3)})`;ctx.beginPath();lensHandEllipse(ctx,x-R*.05,y-R*.8,R*.38,R*.16,-.1,0,TAU,(n.id|0)+43,2);ctx.fill();ctx.strokeStyle=`rgba(${P.ink},${(.6*e2).toFixed(3)})`;ctx.lineWidth=Math.max(.4,R*.04);ctx.lineCap='round';ctx.beginPath();lensHandEllipse(ctx,x-R*.05,y-R*.8,R*.38,R*.16,-.1,2.4,2.4+TAU*1.06,(n.id|0)+43,2);ctx.stroke();
      ctx.fillStyle=`rgba(${P.ink},${(.4*e3).toFixed(3)})`;for(let i=0;i<14;i++){ctx.beginPath();ctx.arc(x+(tileHash(n.id,i,8)-.6)*R*1.2,y+(tileHash(n.id,i,9)-.3)*R,Math.max(.5,R*.06),0,TAU);ctx.fill();}}
    // Herschel's three volcanoes, three separate points of red light set well apart on the dark of the disc,
    // each a small glow round a pricked core, so the caption's count can be read off the drawing.
    if(family==='volcanic'&&e3>0){for(let i=0;i<3;i++){const a=.35+i/3*TAU+(tileHash(n.id,i,10)-.5)*.6,dd=R*(.42+tileHash(n.id,i,11)*.18),vx=x+Math.cos(a)*dd,vy=y+Math.sin(a)*dd,gr=R*.2,gg=ctx.createRadialGradient(vx,vy,0,vx,vy,gr);
      gg.addColorStop(0,`rgba(${P.rubric},${(.75*e3).toFixed(3)})`);gg.addColorStop(1,`rgba(${P.rubric},0)`);ctx.fillStyle=gg;ctx.beginPath();ctx.arc(vx,vy,gr,0,TAU);ctx.fill();
      ctx.fillStyle=`rgba(${P.rubric},${e3.toFixed(3)})`;ctx.beginPath();ctx.arc(vx,vy,Math.max(.8,R*.055),0,TAU);ctx.fill();}}
  }
  ctx.restore();
  // the reading, then the dated caption that seals the drawing
  const Rd=LENS_EYE_READINGS[family];if(Rd&&!n.difficultyChoice){const cy=y+reach+13*scale,sz=Math.max(10,10.5*scale);
    if(e2>0&&e3<1)lensFell(ctx,Rd.first.toLowerCase(),x,cy,sz,P.inkSoft,.8*al*e2*(1-e3),'center','text','italic');
    if(e3>0)lensFell(ctx,Rd.caption,x,cy,sz,P.ink,.9*al*e3,'center','text','italic');}
  if(d>=1)lensNoteDone(n,family);
}
// Register two: the body on the glass. A bare knot at the capture; held, it develops as a tray print does,
// the densest middle first and the faint outer wash last, in the shape its family leaves on a plate — and
// the ink laid on afterwards by a hand at the glass back: a loop round it, and its plate number stamped.
function lensBodyPlate(n,family,x,y,d,al){
  const P=ink.lens,R=lensDiscR(n),s1=lensSpan(d,LENS_STAGE.soft),s2=lensSpan(d,LENS_STAGE.first),s3=lensSpan(d,LENS_STAGE.done),e3=lensEase(s3),dev=lensEase(clamp(.25+s1*.35+s2*.5,0,1));
  // [horizontal stretch, size, density]: Jupiter prints a little oblate, Uranus small and thin, the Moon and a
  // lava world a mid grey so what is laid on them afterwards can still be read against the silver.
  const shape={ringed:[1,.95,.95],storm:[1.12,1,.9],ocean:[1,.95,.95],ice:[1,.74,.5],volcanic:[1,1,.62],crater:[1,1,.66],dune:[1,1,.78]}[family]||[1,1,.85];
  ctx.save();ctx.globalAlpha=al;
  if(family==='volcanic'){const hg=ctx.createRadialGradient(x,y,R*.8,x,y,R*2.2);hg.addColorStop(0,`rgba(${P.silverMid},${(.32*dev).toFixed(3)})`);hg.addColorStop(1,`rgba(${P.silverMid},0)`);ctx.fillStyle=hg;ctx.beginPath();ctx.arc(x,y,R*2.2,0,TAU);ctx.fill();}
  const rr=R*shape[1]*1.1,outer=rr*(.45+.7*dev);
  // Saturn's ring prints as dense as the globe: a flattened annulus of silver, soft-edged like everything on
  // the glass, with Cassini's division showing as a clear line through it once the plate is fully developed.
  if(family==='ringed'&&dev>.2){const rk=clamp((dev-.2)/.8,0,1);ctx.save();ctx.translate(x,y);ctx.rotate(-.12);
    for(const [w,k] of[[R*.5,.22],[R*.26,.8]]){ctx.strokeStyle=`rgba(${P.silver},${(k*rk).toFixed(3)})`;ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(0,0,R*1.9,R*.6,0,0,TAU);ctx.stroke();}
    if(e3>0){ctx.strokeStyle=`rgba(${P.glass},${(.7*e3).toFixed(3)})`;ctx.lineWidth=Math.max(.5,R*.05);ctx.beginPath();ctx.ellipse(0,0,R*1.95,R*.615,0,0,TAU);ctx.stroke();}
    ctx.restore();}
  // Venus prints only where she is lit: the silver is laid inside her phase, the gibbous shape narrowing to
  // the crescent as the plate develops, over a faint ghost of the whole disc.
  if(family==='ocean'){const w=.3+.35*(1-e3);ctx.save();ctx.beginPath();ctx.arc(x,y,outer,-Math.PI/2,Math.PI/2);ctx.ellipse(x,y,outer*w,outer,0,Math.PI/2,Math.PI*1.5);ctx.closePath();ctx.clip();}
  ctx.save();ctx.translate(x,y);ctx.scale(shape[0],1);const kg=ctx.createRadialGradient(0,0,0,0,0,outer);
  kg.addColorStop(0,`rgba(${P.silver},${(.97*shape[2]).toFixed(3)})`);kg.addColorStop(clamp(.45+.35*dev,0,.95),`rgba(${P.silver},${(.92*shape[2]*Math.min(1,.45+dev)).toFixed(3)})`);kg.addColorStop(1,`rgba(${P.silverMid},0)`);
  ctx.fillStyle=kg;ctx.beginPath();ctx.arc(0,0,outer,0,TAU);ctx.fill();
  if(family==='storm'&&e3>0){ctx.strokeStyle=`rgba(${P.glass},${(.45*e3).toFixed(3)})`;ctx.lineWidth=Math.max(.5,R*.1);for(const b of[-.3,.05,.35]){ctx.beginPath();ctx.moveTo(-rr,b*rr);ctx.lineTo(rr,b*rr);ctx.stroke();}}
  ctx.restore();
  if(family==='ocean'){ctx.restore();ctx.fillStyle=`rgba(${P.silverMid},${(.16*dev).toFixed(3)})`;ctx.beginPath();ctx.arc(x,y,rr*.95,0,TAU);ctx.fill();}
  // The Moon's seas print lighter than its highlands on the negative, as broad pale patches on the grey.
  if(family==='crater'&&dev>.4){const mk=(dev-.4)/.6;ctx.fillStyle=`rgba(${P.glass},${(.4*mk).toFixed(3)})`;for(let i=0;i<4;i++){const ma=(i+tileHash(n.id,i,28)*.6)/4*TAU+.4,md=rr*(.3+tileHash(n.id,i,29)*.25);ctx.beginPath();ctx.ellipse(x+Math.cos(ma)*md,y+Math.sin(ma)*md,rr*(.14+tileHash(n.id,i,30)*.16),rr*(.1+tileHash(n.id,i,31)*.1),tileHash(n.id,i,32)*TAU,0,TAU);ctx.fill();}}
  // The lava world's three hot vents burn through as knots denser than the rest of its disc.
  if(family==='volcanic'&&e3>0){for(let i=0;i<3;i++){const a=.35+i/3*TAU+(tileHash(n.id,i,10)-.5)*.6,dd=rr*(.4+tileHash(n.id,i,11)*.15),vx=x+Math.cos(a)*dd,vy=y+Math.sin(a)*dd,kr=rr*.2,vg=ctx.createRadialGradient(vx,vy,0,vx,vy,kr);
    vg.addColorStop(0,`rgba(${P.silver},${e3.toFixed(3)})`);vg.addColorStop(1,`rgba(${P.silver},0)`);ctx.fillStyle=vg;ctx.beginPath();ctx.arc(vx,vy,kr,0,TAU);ctx.fill();}}
  // A bright body over-exposes the glass and scatters light back off the plate's back face: the halation ring,
  // a faint circle clear of the image, which is what tells a world on a plate from a star.
  if(e3>0&&family!=='ice'){ctx.strokeStyle=`rgba(${P.silverMid},${(.3*e3).toFixed(3)})`;ctx.lineWidth=Math.max(.8,1.4*scale);ctx.beginPath();ctx.arc(x,y,rr*(family==='ringed'?2.5:1.6),0,TAU);ctx.stroke();}
  // Mars on the plate: Lowell's canals ruled straight across it in ink, and then Antoniadi's irregular patches
  // with his correction written beside the first annotation rather than over it
  if(family==='dune'){const ck=clamp(s2*2-.4,0,1);if(ck>0){ctx.strokeStyle=`rgba(${P.inkBlack},${(.75*ck*(1-.45*e3)).toFixed(3)})`;ctx.lineWidth=Math.max(.4,.45*scale);ctx.beginPath();
      for(let i=0;i<6;i++){const a=tileHash(n.id,i,21)*Math.PI,o=(tileHash(n.id,i,22)-.5)*R*.9,c=Math.cos(a),s=Math.sin(a);ctx.moveTo(x-s*o-c*R*.9,y+c*o-s*R*.9);ctx.lineTo(x-s*o+c*R*.9,y+c*o+s*R*.9);}ctx.stroke();
      lensTyped(ctx,'LOWELL 1895',x+R*1.2,y-R*.9,Math.max(8,8.5*scale),P.inkBlack,.8*ck*al,'left');}
    if(e3>0){ctx.fillStyle=`rgba(${P.silver},${(.55*e3).toFixed(3)})`;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(x+(tileHash(n.id,i,23)-.5)*R*1.1,y+(tileHash(n.id,i,24)-.5)*R*1.1,R*(.14+tileHash(n.id,i,25)*.18),R*(.08+tileHash(n.id,i,26)*.12),tileHash(n.id,i,27)*TAU,0,TAU);ctx.fill();}
      lensTyped(ctx,'NOT CANALS · A. 1909',x+R*1.2,y-R*.9+11*scale,Math.max(8,8.5*scale),P.inkRed,.9*e3*al,'left');}}
  // the hand at the glass back: a loose loop, then a stamped number
  if(e3>0){ctx.strokeStyle=`rgba(${P.inkRed},${(.85*al).toFixed(3)})`;lensLoop(ctx,x,y,R*(family==='ringed'?2.2:1.45),n.id|0,e3,Math.max(.8,1.05*scale));
    const num='No '+(214+((n.id|0)*37)%760),bx=x-R*1.2,by=y+R*(family==='ringed'?2.3:1.55)+6*scale,sz=Math.max(8,8.5*scale);
    ctx.save();ctx.globalAlpha=al*e3;ctx.strokeStyle=`rgba(${P.inkBlack},.75)`;ctx.lineWidth=.8;ctx.font=plateFace(sz,'typed');const tw=ctx.measureText(num).width;ctx.strokeRect(bx-3,by-sz*.7,tw+6,sz*1.4);ctx.restore();
    lensTyped(ctx,num,bx,by,sz,P.inkBlack,.9*al*e3,'left');}
  ctx.restore();
  if(d>=1)lensNoteDone(n,family);
}
// Register three: the body off the sensor. A rendered sphere baked once for the world and taken apart into its
// three filtered exposures; held, the red frame comes up first, then the green, then the blue, each a little
// off register until the last settles them, and only once the composite is whole does the card name it.
const lensBodyArts=new Map();
function lensBodyArt(n,family,R){
  const key=n.id+':'+R.toFixed(1)+':'+DPR;let a=lensBodyArts.get(key);if(a)return a;
  const S=Math.ceil(R*(family==='ringed'?5:2.8)),c=makeCanvas(Math.round(S*DPR),Math.round(S*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);
  const tilt=-.18+(tileHash(n.id,1,31)-.5)*.3;
  if(family==='ringed')lensRenderRings(g,S/2,S/2,R,tilt,'back');
  lensRenderSphere(g,S/2,S/2,R,family,(n.seed|0)^0x1990,family==='ringed'?tilt:undefined);
  if(family==='ringed'){g.save();g.beginPath();g.arc(S/2,S/2,R,0,TAU);g.clip();g.translate(S/2,S/2);g.rotate(tilt);g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(0,R*.3,R*1.6,R*.1,0,0,TAU);g.fill();g.restore();lensRenderRings(g,S/2,S/2,R,tilt,'front');}
  a={canvas:c,size:S,channels:lensChannels(c)};if(lensBodyArts.size>30)lensBodyArts.delete(lensBodyArts.keys().next().value);lensBodyArts.set(key,a);return a;
}
function lensBodySensor(n,family,x,y,d,al){
  const P=ink.lens,R=lensDiscR(n),s1=lensSpan(d,LENS_STAGE.soft),s2=lensSpan(d,LENS_STAGE.first),s3=lensSpan(d,LENS_STAGE.done),e3=lensEase(s3),art=lensBodyArt(n,family,R),S=art.size,ch=art.channels;
  const pass=clamp(s1+s2+s3*1.2,0,3);
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(ch&&ch[0]&&ch[1]&&ch[2]){for(let i=0;i<3;i++){const a=clamp(pass-i,0,1)*al;if(a<=0)continue;const off=(1-e3)*R*.16*(i-1);ctx.globalAlpha=a;ctx.drawImage(ch[i],x-S/2+off,y-S/2-off*.4,S,S);}}
  else{ctx.globalAlpha=al*clamp(pass/3,0,1);ctx.drawImage(art.canvas,x-S/2,y-S/2,S,S);}
  ctx.restore();
  // the filter of the frame being read, and once the composite is whole, the card and a scale bar
  const sz=Math.max(7.5,7.5*scale),by=y+R*(family==='ringed'?1.2:1)+12*scale;
  if(e3<1){const f=pass<1?['R','sii']:pass<2?['V','ha']:['B','oiii'];lensMono(ctx,'FILTER = '+f[0],x,by,sz,P[f[1]],.85*al,'center');}
  else{const card=lensCard('OBJECT',"'"+(LENS_WORLD_NAMES[family]||'SOURCE')+"'");lensMono(ctx,card,x,by,sz,P.instr,.9*al,'center',Math.floor((lensFlourishAge(n))*40));
    ctx.save();ctx.strokeStyle=`rgba(${P.instr},${(.7*al).toFixed(3)})`;ctx.lineWidth=.7;const bx=x-R*.5;ctx.beginPath();ctx.moveTo(bx,by+9*scale);ctx.lineTo(bx+R,by+9*scale);ctx.moveTo(bx,by+7.5*scale);ctx.lineTo(bx,by+10.5*scale);ctx.moveTo(bx+R,by+7.5*scale);ctx.lineTo(bx+R,by+10.5*scale);ctx.stroke();ctx.restore();}
  if(d>=1)lensNoteDone(n,family);
}
// How long ago a body's observation closed, for the card that types itself out after it.
const lensDoneAt=new Map();
function lensFlourishAge(n){let at=lensDoneAt.get(n.id);if(at===undefined){at=world.time;lensDoneAt.set(n.id,at);if(lensDoneAt.size>60)lensDoneAt.delete(lensDoneAt.keys().next().value);}return world.time-at;}
// The three bodies of the opening choice, drawn whole before they are held, as on every era: the Moon for
// Tiro, the first body this era resolves; Saturn for Adeptus, the one it got wrong longest; and for Magister
// a nebula, the faintest thing an eyepiece was asked to draw — Huygens's Orion, a cloud with stars in it.
function lensChoice(n,x,y){
  const P=ink.lens,R=lensDiscR(n),c=n.difficultyChoice;
  if(c==='relaxed'){lensBodyEye(n,'crater',x,y,1,1);lensFell(ctx,'LUNA',x,y+R+14*scale,Math.max(10,10.5*scale),P.ink,.85,'center','sc');}
  else if(c==='classic'){lensBodyEye(n,'ringed',x,y,1,1);lensFell(ctx,'SATURNUS',x,y+R+14*scale,Math.max(10,10.5*scale),P.ink,.85,'center','sc');}
  else{ctx.save();for(let i=0;i<5;i++){const a=tileHash(n.id,i,41)*TAU,dd=R*.5*tileHash(n.id,i,42),gx=x+Math.cos(a)*dd,gy=y+Math.sin(a)*dd,gr=ctx.createRadialGradient(gx,gy,0,gx,gy,R*1.1);
      gr.addColorStop(0,`rgba(${P.sepia},.32)`);gr.addColorStop(1,`rgba(${P.sepia},0)`);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(gx,gy,R*1.1,0,TAU);ctx.fill();}
    ctx.fillStyle=`rgba(${P.ink},.85)`;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(x+(tileHash(n.id,i,43)-.5)*R*.7,y+(tileHash(n.id,i,44)-.5)*R*.5,Math.max(.7,.9*scale),0,TAU);ctx.fill();}
    ctx.restore();lensFell(ctx,'NEBULA',x,y+R+14*scale,Math.max(10,10.5*scale),P.ink,.85,'center','sc');}
}
// The charges, as the things an observatory kept: the objective's dew-cap for the shield; a finder's mirror
// for the reflector; the dome's shutter opening on a clear sky for the dawn charge; and for the inkwell, a
// box of fresh plates, still sealed and unexposed. Drawn in whichever register's material they stand in.
function lensGift(n,reg,x,y,used,sc=scale){
  const P=ink.lens,r=n.r*sc,k=used?.35:1,col=reg===0?P.ink:reg===1?P.inkBlack:P.instr,acc=reg===0?P.gold:reg===1?P.inkRed:P.cyan;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=k;ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=`rgb(${col})`;ctx.lineWidth=Math.max(.7,.9*sc);
  if(n.type==='shield'){const R=r*.42;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,R*.7,0,TAU);ctx.stroke();
    ctx.save();ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.arc(0,0,R*.7,0,TAU,true);ctx.clip();ctx.lineWidth=Math.max(.35,.4*sc);ctx.beginPath();for(let i=-6;i<=6;i++){ctx.moveTo(i*R*.2-R,-R);ctx.lineTo(i*R*.2+R,R);}ctx.stroke();ctx.restore();
    ctx.fillStyle=`rgba(${acc},.8)`;ctx.beginPath();ctx.arc(0,0,R*.28,0,TAU);ctx.fill();}
  else if(n.type==='reflector'){const R=r*.45;ctx.save();ctx.rotate(-.7);ctx.fillStyle=`rgba(${P.mirror},.75)`;ctx.beginPath();ctx.ellipse(0,0,R,R*.32,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
    ctx.lineWidth=Math.max(.5,.55*sc);ctx.beginPath();ctx.moveTo(-R*1.6,R*.1);ctx.lineTo(0,0);ctx.lineTo(R*.2,-R*1.5);ctx.stroke();ctx.beginPath();ctx.moveTo(R*.2,-R*1.5);ctx.lineTo(R*.02,-R*1.2);ctx.moveTo(R*.2,-R*1.5);ctx.lineTo(R*.42,-R*1.25);ctx.stroke();}
  else if(n.type==='dawn'){const R=r*.42;ctx.beginPath();ctx.arc(0,R*.35,R,Math.PI,0);ctx.lineTo(R,R*.35);ctx.lineTo(-R,R*.35);ctx.closePath();ctx.stroke();
    ctx.fillStyle=`rgba(${acc},.9)`;ctx.fillRect(-R*.14,-R*.64,R*.28,R*.99);ctx.lineWidth=Math.max(.4,.45*sc);ctx.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.28;ctx.moveTo(Math.cos(a)*R*.8,-R*.6+Math.sin(a)*R*.3);ctx.lineTo(Math.cos(a)*R*1.5,-R*.6+Math.sin(a)*R*.9);}ctx.stroke();}
  else{const w=r*.8,h=r*.5;ctx.fillStyle=reg===2?'rgba(20,26,36,.9)':`rgba(${P.paperDeep},.9)`;ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeRect(-w/2,-h/2,w,h);ctx.beginPath();ctx.moveTo(-w/2,-h/2+h*.28);ctx.lineTo(w/2,-h/2+h*.28);ctx.stroke();
    ctx.strokeStyle=`rgba(${acc},.9)`;ctx.lineWidth=Math.max(.8,1.1*sc);ctx.beginPath();ctx.moveTo(-w/2,h*.15);ctx.lineTo(w/2,h*.15);ctx.stroke();}
  ctx.restore();
}
// The slingshot body carries the mount's setting circle round it: a toothed worm wheel, graduated, turned
// once through by the slow-motion screw. The gilt find is a comet — the one thing an eyepiece could discover
// by chance on any night — with its tail laid away from the light.
function lensSling(n,reg,x,y){
  const P=ink.lens,R=n.r*scale*.86,col=reg===0?P.rubric:reg===1?P.inkRed:P.cyan,t=reducedMotion?0:world.time;
  ctx.save();ctx.strokeStyle=`rgba(${col},.8)`;ctx.lineWidth=Math.max(.6,.7*scale);ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.stroke();
  ctx.lineWidth=Math.max(.4,.45*scale);ctx.beginPath();for(let i=0;i<48;i++){const a=i/48*TAU+t*.15,l=(i%4===0?3.4:1.8)*scale;ctx.moveTo(x+Math.cos(a)*R,y+Math.sin(a)*R);ctx.lineTo(x+Math.cos(a)*(R+l),y+Math.sin(a)*(R+l));}ctx.stroke();ctx.restore();
}
function lensComet(n,reg,x,y,al){
  const P=ink.lens,R=Math.max(3,n.r*scale*.22),tail=ctx.createLinearGradient(x,y,x+R*6,y-R*3.5),col=reg===0?P.sepia:reg===1?P.silver:'236,244,255';
  ctx.save();ctx.globalAlpha=al;tail.addColorStop(0,`rgba(${col},.6)`);tail.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(x,y-R*.8);ctx.quadraticCurveTo(x+R*3,y-R*2.2,x+R*6.5,y-R*3.8);ctx.quadraticCurveTo(x+R*3.2,y-R*1,x,y+R*.8);ctx.closePath();ctx.fill();
  const hg=ctx.createRadialGradient(x,y,0,x,y,R*1.4);hg.addColorStop(0,`rgba(${col},1)`);hg.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=hg;ctx.beginPath();ctx.arc(x,y,R*1.4,0,TAU);ctx.fill();
  if(reg===0){ctx.strokeStyle=`rgba(${P.gold},.9)`;ctx.lineWidth=Math.max(.6,.8*scale);ctx.beginPath();ctx.arc(x,y,R*2.2,0,TAU);ctx.stroke();}
  ctx.restore();
}
// A field's star is a star and not a world: it has no surface to resolve, only a position and a brightness
// to be fixed. At the eyepiece it is set down as Galileo set his in the Sidereus Nuncius, a small six-rayed
// star outlined in ink, larger as it is brighter; on the plate a dense knot circled and numbered by the hand
// at the glass back; off the sensor a point-spread function with the four spikes a secondary mirror's
// supports throw across a reflector's image, the one register whose telescope has them.
function lensStar(n,reg,x,y,d,al){
  const P=ink.lens,mag=clamp(n.magnitude??3,1,6),r=(4.6-mag*.5)*scale,k=lensEase(clamp(d*1.6,0,1));
  ctx.save();ctx.globalAlpha=al;
  if(reg===0){if(k<1){const gr=ctx.createRadialGradient(x,y,0,x,y,r*1.8);gr.addColorStop(0,`rgba(${P.sepia},${(.7*(1-k)).toFixed(3)})`);gr.addColorStop(1,`rgba(${P.sepia},0)`);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r*1.8,0,TAU);ctx.fill();}
    if(k>0){ctx.beginPath();for(let i=0;i<12;i++){const a=i/12*TAU-Math.PI/2,rr=(i%2?r*.42:r*1.35)*(.6+.4*k);i?ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):ctx.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();
      ctx.fillStyle=`rgba(${P.paper},${k.toFixed(3)})`;ctx.fill();ctx.strokeStyle=`rgba(${P.ink},${(.9*k).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.stroke();
      if(mag<=2){ctx.fillStyle=`rgba(${P.ink},${(.85*k).toFixed(3)})`;ctx.beginPath();ctx.arc(x,y,r*.28,0,TAU);ctx.fill();}}}
  else if(reg===1){const kr=r*(.9+.5*k),sg=ctx.createRadialGradient(x,y,0,x,y,kr*1.9);sg.addColorStop(0,`rgba(${P.silver},.97)`);sg.addColorStop(.5,`rgba(${P.silver},.85)`);sg.addColorStop(1,`rgba(${P.silverMid},0)`);ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,kr*1.9,0,TAU);ctx.fill();
    if(d>=1){ctx.strokeStyle=`rgba(${P.inkRed},.85)`;lensLoop(ctx,x,y,kr*3,(n.id|0)+5,1,Math.max(.8,scale));}}
  else{const t=reducedMotion?0:world.time,tw=1+.06*Math.sin(t*3+n.id),R=r*(1.2+.6*k)*tw,sg=ctx.createRadialGradient(x,y,0,x,y,R*2.4);sg.addColorStop(0,'rgba(250,252,255,1)');sg.addColorStop(.2,'rgba(226,240,255,.85)');sg.addColorStop(.55,'rgba(150,196,240,.2)');sg.addColorStop(1,'rgba(150,196,240,0)');
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,R*2.4,0,TAU);ctx.fill();
    if(k>0){ctx.strokeStyle=`rgba(236,244,255,${(.55*k).toFixed(3)})`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.beginPath();for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;ctx.moveTo(x+Math.cos(a)*R*.6,y+Math.sin(a)*R*.6);ctx.lineTo(x+Math.cos(a)*R*(2.6+2*k),y+Math.sin(a)*R*(2.6+2*k));}ctx.stroke();}}
  ctx.restore();
}
function lensNode(n,aim){
  lensRun();
  const pen=revealNode(n);if(pen.t<=0)return;
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=!!(aim&&aim.n.id===n.id);
  const x=sx(n.x),y=sy(n.y),cap=n.cap*scale;
  if(y<-cap*2-60||y>H+cap*2+60)return;
  const reg=lensRegAt(n.x,n.y),state=active||target?1:used?.32:.62;
  lensRing(n,reg,x,y,cap,state,pen.ring);
  if(n.type==='sling')lensSling(n,reg,x,y);
  if(['shield','reflector','dawn','inkwell'].includes(n.type))lensGift(n,reg,x,y,used);
  else if(n.difficultyChoice)lensChoice(n,x,y);
  else if(n.routeRole==='star')lensStar(n,reg,x,y,pen.taken>0?pen.d:0,pen.taken>0?1:.75);
  else if(pen.taken>0){const fam=lensFamily(n);
    if(n.type==='gold')lensComet(n,reg,x,y,pen.taken);
    else if(reg===0)lensBodyEye(n,fam,x,y,pen.d,pen.taken);else if(reg===1)lensBodyPlate(n,fam,x,y,pen.d,pen.taken);else lensBodySensor(n,fam,x,y,pen.d,pen.taken);}
  else if(n.type==='gold')lensComet(n,reg,x,y,.6);
  else lensPhenomenon(n,reg,x,y);
  if(active)lensReleaseMarks(n,p,reg,x,y);
}

// ---------- The dangers, each in the register it stands in ----------
// The emulsion void, for the pull: at the eyepiece a patch where a field's stars refuse to resolve, cut as a
// dense cross-hatched darkness; on the plate a ragged island where the silver has lifted clean off the glass;
// off the sensor the same absence admitting what it was, a black disc ringed by a thin bright arc brighter on
// one side. Whatever the register, the black is exactly the lethal core and no wider, and the reach is drawn
// as rings drawn in toward it.
function lensVoid(h,reg,x,y){
  const P=ink.lens,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time;
  ctx.save();
  const ring=reg===0?P.ink:reg===1?P.inkBlack:P.amber;ctx.setLineDash([1.5*scale,2.5*scale]);
  for(let i=0;i<3;i++){const f=((t*.25+i/3)%1),r=core+(1-f)*(reach-core);ctx.strokeStyle=`rgba(${ring},${(f*(reg===2?.35:.4)).toFixed(3)})`;ctx.lineWidth=(.5+f*.5)*scale;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}ctx.setLineDash([]);
  if(reg===0){ctx.save();ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.clip();ctx.fillStyle=`rgba(${P.ink},.3)`;ctx.fillRect(x-core,y-core,core*2,core*2);
    ctx.strokeStyle=`rgba(${P.ink},.8)`;ctx.lineWidth=Math.max(.5,.6*scale);const st=1.9*scale;ctx.beginPath();for(let o=-core*2;o<core*2;o+=st){ctx.moveTo(x+o-core,y-core);ctx.lineTo(x+o+core,y+core);ctx.moveTo(x+o+core,y-core);ctx.lineTo(x+o-core,y+core);}ctx.stroke();ctx.restore();
    ctx.strokeStyle=`rgba(${P.ink},.95)`;ctx.lineWidth=1.1*scale;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.stroke();
    {const sz=Math.max(10,10.5*scale);lensHazardLabel((lx,ly,al)=>lensFell(ctx,'Nihil visum',lx,ly,sz,P.ink,.8,al,'text','italic'),'Nihil visum',x,y-core-5*scale,core+8*scale,sz,'text');}}
  else if(reg===1){
    // the lifted silver: clear glass inside a torn edge, the edge itself darker where the gelatin rolled up
    ctx.beginPath();const N=40;for(let i=0;i<=N;i++){const a=i/N*TAU,rr=core*(1+(tileHash(h.seed,i%N,1)-.5)*.14);i?ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):ctx.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();
    ctx.fillStyle='rgba(252,252,250,.97)';ctx.fill();ctx.strokeStyle=`rgba(${P.silver},.8)`;ctx.lineWidth=1.4*scale;ctx.stroke();ctx.strokeStyle=`rgba(${P.silverMid},.5)`;ctx.lineWidth=3*scale;ctx.stroke();
    ctx.fillStyle=`rgba(${P.silver},.6)`;for(let i=0;i<14;i++){const a=tileHash(h.seed,i,2)*TAU,d=core*(1.05+tileHash(h.seed,i,3)*.2);ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,(.4+tileHash(h.seed,i,4))*scale,0,TAU);ctx.fill();}
    {const sz=Math.max(8,8.5*scale);lensHazardLabel((lx,ly,al)=>lensTyped(ctx,'EMULSION LIFTED',lx,ly,sz,P.inkRed,.85,al),'EMULSION LIFTED',x,y-core-5*scale,core+8*scale,sz,'typed');}}
  else{ctx.fillStyle='rgb(0,0,0)';ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
    const sp=h.seed%7+t*.12,rg=ctx.createConicGradient?ctx.createConicGradient(sp,x,y):null;
    if(rg){rg.addColorStop(0,`rgba(${P.amber},.95)`);rg.addColorStop(.35,`rgba(${P.amber},.35)`);rg.addColorStop(.6,`rgba(${P.amber},.15)`);rg.addColorStop(1,`rgba(${P.amber},.95)`);ctx.strokeStyle=rg;}else ctx.strokeStyle=`rgba(${P.amber},.7)`;
    ctx.lineWidth=core*.34;ctx.beginPath();ctx.arc(x,y,core*1.28,0,TAU);ctx.stroke();ctx.lineWidth=core*.1;ctx.strokeStyle='rgba(255,236,200,.6)';ctx.beginPath();ctx.arc(x,y,core*1.2,sp-1,sp+.4);ctx.stroke();
    {const sz=Math.max(7.5,7.5*scale);lensHazardLabel((lx,ly,al)=>lensMono(ctx,'NO SIGNAL',lx,ly,sz,P.amber,.85,al),'NO SIGNAL',x,y-core-5*scale,core*1.5+6*scale,sz,'mono');}}
  ctx.restore();
}
// Halation, for the push: a bright body overrunning its own edge. At the eyepiece a glare no stop checks,
// struck as rays with the spots Scheiner drew on the Sun; on the plate light scattered back off the glass into
// a soft concentric bloom of silver beyond the true disc; off the sensor an occulting disc with the corona's
// streamers breaking past it.
function lensHalation(h,reg,x,y){
  const P=ink.lens,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time;
  ctx.save();
  if(reg===0){ctx.lineCap='butt';for(let i=0;i<36;i++){const a=i/36*TAU+h.seed%5,long=i%3===0,r2=long?reach*.95:lerp(core*1.4,reach*.7,.5+.5*Math.sin(i*1.7));ctx.strokeStyle=`rgba(${P.ink},${long?.55:.3})`;ctx.lineWidth=(long?.7:.45)*scale;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*core*1.12,y+Math.sin(a)*core*1.12);ctx.lineTo(x+Math.cos(a)*r2,y+Math.sin(a)*r2);ctx.stroke();}
    for(let i=0;i<3;i++){const f=((t*.3+i/3)%1),r=core+f*(reach-core);ctx.strokeStyle=`rgba(${P.rubric},${((1-f)*.4).toFixed(3)})`;ctx.lineWidth=.6*scale;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
    ctx.fillStyle=`rgba(${P.paper},1)`;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();lensHatchDisc(ctx,x,y,core,1,P,.35,{noCross:true});
    ctx.fillStyle=`rgba(${P.ink},.85)`;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(x+(tileHash(h.seed,i,5)-.5)*core*1.1,y+(tileHash(h.seed,i,6)-.5)*core*.6,Math.max(.8,core*(.05+tileHash(h.seed,i,7)*.06)),0,TAU);ctx.fill();}
    ctx.strokeStyle=`rgba(${P.ink},.95)`;ctx.lineWidth=1*scale;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.stroke();
    {const sz=Math.max(10,10.5*scale);lensHazardLabel((lx,ly,al)=>lensFell(ctx,'Sol · maculae',lx,ly,sz,P.ink,.8,al,'text','italic'),'Sol · maculae',x,y-core-4*scale,core+10*scale,sz,'text');}}
  else if(reg===1){for(let i=4;i>=1;i--){const rr=core+(reach-core)*i/4.4;ctx.strokeStyle=`rgba(${P.silverMid},${(.14+.08*(4-i)).toFixed(3)})`;ctx.lineWidth=(reach-core)/5;ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.stroke();}
    for(let i=0;i<3;i++){const f=((t*.3+i/3)%1),r=core+f*(reach-core);ctx.strokeStyle=`rgba(${P.silver},${((1-f)*.35).toFixed(3)})`;ctx.lineWidth=.7*scale;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
    const kg=ctx.createRadialGradient(x,y,0,x,y,core);kg.addColorStop(0,`rgb(${P.silver})`);kg.addColorStop(.85,`rgb(${P.silver})`);kg.addColorStop(1,`rgba(${P.silver},.8)`);ctx.fillStyle=kg;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
    {const sz=Math.max(8,8.5*scale);lensHazardLabel((lx,ly,al)=>lensTyped(ctx,'HALATION',lx,ly,sz,P.inkRed,.85,al),'HALATION',x,y-core-4*scale,core+10*scale,sz,'typed');}}
  else{for(let i=0;i<9;i++){const a=tileHash(h.seed,i,8)*TAU+Math.sin(t*.2+i)*.03,L=reach*(.7+tileHash(h.seed,i,9)*.3),w=core*(.25+tileHash(h.seed,i,10)*.35);
      const sg=ctx.createLinearGradient(x,y,x+Math.cos(a)*L,y+Math.sin(a)*L);sg.addColorStop(0,'rgba(236,244,255,.5)');sg.addColorStop(1,'rgba(236,244,255,0)');ctx.fillStyle=sg;ctx.beginPath();
      ctx.moveTo(x+Math.cos(a+Math.PI/2)*w,y+Math.sin(a+Math.PI/2)*w);ctx.quadraticCurveTo(x+Math.cos(a)*L*.5,y+Math.sin(a)*L*.5,x+Math.cos(a)*L,y+Math.sin(a)*L);ctx.quadraticCurveTo(x+Math.cos(a)*L*.5,y+Math.sin(a)*L*.5,x+Math.cos(a-Math.PI/2)*w,y+Math.sin(a-Math.PI/2)*w);ctx.closePath();ctx.fill();}
    for(let i=0;i<3;i++){const f=((t*.3+i/3)%1),r=core+f*(reach-core);ctx.strokeStyle=`rgba(${P.cyan},${((1-f)*.3).toFixed(3)})`;ctx.lineWidth=.6*scale;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
    ctx.fillStyle='rgb(8,10,14)';ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(${P.instrSoft},.9)`;ctx.lineWidth=1*scale;ctx.stroke();
    ctx.strokeStyle=`rgba(${P.instrSoft},.6)`;ctx.lineWidth=1.4*scale;ctx.beginPath();ctx.moveTo(x+core*.7,y+core*.7);ctx.lineTo(x+core*1.6,y+core*1.6);ctx.stroke();
    {const sz=Math.max(7.5,7.5*scale);lensHazardLabel((lx,ly,al)=>lensMono(ctx,'CORONAGRAPH',lx,ly,sz,P.instr,.85,al),'CORONAGRAPH',x,y-core-4*scale,core+10*scale,sz,'mono');}}
  ctx.restore();
}
// Tracking drift, for the crosswind: an unsteady hand at the slow-motion screw drags the whole field one way
// over a long exposure, so every star inside it is drawn as a short parallel trail, fading along its length;
// off the sensor the same push is the solar wind, thin curved arcs and drifting specks.
function lensDrift(h,reg,x,y){
  const P=ink.lens,reach=gravityRadius(h)*scale;if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const t=reducedMotion?0:world.time,dir=h.dir||0,col=reg===0?P.ink:reg===1?P.silver:P.cyan;
  ctx.save();ctx.translate(x,y);ctx.rotate(dir);ctx.beginPath();ctx.arc(0,0,reach,0,TAU);ctx.clip();ctx.lineCap='round';
  for(let i=0;i<16;i++){const lane=(tileHash(h.seed,i,1)-.5)*reach*1.8,len=reach*(.18+tileHash(h.seed,i,3)*.2),x0=((t*24*scale+tileHash(h.seed,i,2)*reach*2.6)%(reach*2.6))-reach*1.3;
    const tg=ctx.createLinearGradient(x0,0,x0+len,0);tg.addColorStop(0,`rgba(${col},0)`);tg.addColorStop(1,`rgba(${col},${reg===2?.55:.7})`);ctx.strokeStyle=tg;ctx.lineWidth=(reg===1?1.3:.8)*scale;
    ctx.beginPath();if(reg===2){ctx.moveTo(x0,lane);ctx.quadraticCurveTo(x0+len*.5,lane-len*.18,x0+len,lane);}else{ctx.moveTo(x0,lane);ctx.lineTo(x0+len,lane);}ctx.stroke();
    ctx.fillStyle=`rgba(${col},${reg===2?.8:.9})`;ctx.beginPath();ctx.arc(x0+len,lane,(reg===1?1.1:.8)*scale,0,TAU);ctx.fill();}
  ctx.restore();
  const lx=x-Math.cos(dir)*reach*.72,ly=y-Math.sin(dir)*reach*.72-12*scale,sz=Math.max(reg===0?10:7.5,(reg===0?10.5:7.5)*scale);
  if(reg===0)lensFell(ctx,'Manus tremula',lx,ly,sz,P.ink,.75,'center','text','italic');else if(reg===1)lensTyped(ctx,'TRACKING DRIFT',lx,ly,sz,P.inkRed,.85,'center');else lensMono(ctx,'SOLAR WIND',lx,ly,sz,P.cyan,.8,'center');
  ctx.save();ctx.strokeStyle=reg===0?`rgba(${P.rubric},.85)`:reg===1?`rgba(${P.inkRed},.85)`:`rgba(${P.cyan},.85)`;ctx.lineWidth=1.3*scale;const ax=lx,ay=ly+10*scale;
  ctx.beginPath();ctx.moveTo(ax-Math.cos(dir)*8*scale,ay-Math.sin(dir)*8*scale);ctx.lineTo(ax+Math.cos(dir)*10*scale,ay+Math.sin(dir)*10*scale);ctx.lineTo(ax+Math.cos(dir-2.6)*4*scale+Math.cos(dir)*10*scale,ay+Math.sin(dir-2.6)*4*scale+Math.sin(dir)*10*scale);ctx.stroke();ctx.restore();
}
// The dark nebula, for the obscurer: a patch where the star count falls to nothing, unremarkable until the
// photographs of Barnard and Wolf proved some of the sky's holes to be dust — on paper a blank reserved in the
// sheet's own tone, on glass a clear starless island, off the sensor a lane of dust dark against a faint glow.
function lensDarkNebula(h,reg,x,y){
  const P=ink.lens,R=h.r*scale;if(y+R<-20||y-R>H+20)return;
  ctx.save();const t=reducedMotion?0:world.time;
  if(reg===0){const wg=ctx.createRadialGradient(x,y,0,x,y,R);wg.addColorStop(0,`rgba(${P.paperDeep},.75)`);wg.addColorStop(.75,`rgba(${P.paperDeep},.4)`);wg.addColorStop(1,`rgba(${P.paperDeep},0)`);ctx.fillStyle=wg;ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(${P.inkSoft},.35)`;ctx.setLineDash([2*scale,3*scale]);ctx.lineWidth=.6*scale;ctx.beginPath();ctx.arc(x,y,R*.9,0,TAU);ctx.stroke();ctx.setLineDash([]);
    lensFell(ctx,'Foramen in caelo?',x,y-R-8*scale,Math.max(10,10.5*scale),P.ink,.72,'center','text','italic');}
  else if(reg===1){const wg=ctx.createRadialGradient(x,y,0,x,y,R);wg.addColorStop(0,'rgba(246,246,242,.9)');wg.addColorStop(.7,'rgba(246,246,242,.6)');wg.addColorStop(1,'rgba(246,246,242,0)');ctx.fillStyle=wg;ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(${P.inkBlack},.55)`;ctx.lineWidth=.8*scale;lensLoop(ctx,x,y,R*.82,h.seed|0,1,.8*scale);
    lensTyped(ctx,'B '+(33+(h.seed%330|0)),x,y-R*.82-8*scale,Math.max(8,8.5*scale),P.inkBlack,.85,'center');}
  else{const gg=ctx.createRadialGradient(x,y,0,x,y,R*1.15);gg.addColorStop(0,`rgba(${P.sii},.2)`);gg.addColorStop(.45,`rgba(${P.ha},.08)`);gg.addColorStop(.75,`rgba(${P.oiii},.07)`);gg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(x,y,R*1.15,0,TAU);ctx.fill();
    // one sinuous lane of dust, laid as soft strokes of narrowing width so its edge has no line
    const a0=tileHash(h.seed,1,12)*Math.PI,c=Math.cos(a0),sn=Math.sin(a0),bend=(tileHash(h.seed,2,12)-.5)*R*.9,drift=Math.sin(t*.05)*R*.02;
    ctx.save();ctx.beginPath();ctx.arc(x,y,R*1.05,0,TAU);ctx.clip();ctx.lineCap='round';
    for(let i=6;i>=1;i--){ctx.strokeStyle=`rgba(2,3,6,${(.16+.1*(6-i)/5).toFixed(3)})`;ctx.lineWidth=R*.1*i;ctx.beginPath();ctx.moveTo(x-c*R*1.1,y-sn*R*1.1);ctx.bezierCurveTo(x-c*R*.4-sn*bend,y-sn*R*.4+c*bend+drift,x+c*R*.4+sn*bend*.6,y+sn*R*.4-c*bend*.6,x+c*R*1.1,y+sn*R*1.1);ctx.stroke();}
    ctx.restore();
    lensMono(ctx,'LDN '+(1000+(h.seed%900|0)),x,y-R-8*scale,Math.max(7.5,7.5*scale),P.instrSoft,.85,'center');}
  ctx.restore();
}
// A danger's name stands beside its core on the right, and goes to the left where the right would run it off
// the sheet; the width is measured in the face it is set in, so every register's name is placed the same way.
function lensHazardLabel(draw,str,x,y,off,size,variant){
  ctx.save();ctx.font=plateFace(size,variant);const w=ctx.measureText(str).width;ctx.restore();
  const right=x+off+w<=W-LENS_BAND-4;draw(right?x+off:x-off,y,right?'left':'right');
}
function lensHazard(h){
  const x=sx(h.x),y=sy(h.y),reg=lensRegAt(h.x,h.y);
  if(h.kind==='nebula')return lensDarkNebula(h,reg,x,y);
  if(h.kind==='wind')return lensDrift(h,reg,x,y);
  const reach=gravityRadius(h)*scale;if(y+reach<-20||y-reach>H+20)return;
  if(h.kind==='flare')return lensHalation(h,reg,x,y);
  return lensVoid(h,reg,x,y);
}
// A danger comes onto the sheet the way its register makes an image: at the eyepiece it is brought to focus
// out of a blur; on the plate it develops in, faint to dense; off the sensor it is read out a row at a time.
function lensHazardReveal(h,draw,t){
  const reg=lensRegAt(h.x,h.y),x=sx(h.x),y=sy(h.y),R=(gravityRadius(h)+24)*scale,e=1-Math.pow(1-t,3);
  ctx.save();
  if(reg===2){ctx.beginPath();ctx.rect(x-R,y-R,R*2,R*2*e);ctx.clip();draw(h);ctx.restore();
    if(e<1){ctx.save();ctx.strokeStyle=`rgba(${ink.lens.cyan},${(.7*(1-e)).toFixed(3)})`;ctx.lineWidth=scale;ctx.beginPath();ctx.moveTo(x-R,y-R+R*2*e);ctx.lineTo(x+R,y-R+R*2*e);ctx.stroke();ctx.restore();}return;}
  ctx.globalAlpha*=reg===1?e*e:e;draw(h);ctx.restore();
}

// ---------- The flight: the line behind, the course flown, the guide ahead ----------
// Behind the telescope the line is the register's own record of motion: a burin's wet line at the eyepiece;
// on the plate a star trail, a streak of silver that is densest where the tube was last; off the sensor a
// telemetry track of sampled points. The course already flown dries to a construction line; the guide ahead
// is pricked in dots at the eyepiece, grease-pencil dashes on the plate, and reticle ticks off the sensor.
// Every sample is drawn in the register of the ground it lies on, not the one the traveller has reached: a line
// already on the sheet is never restyled because the row counter moved on, and while a register grows out
// from its body the line changes medium exactly where the ground under it does.
function lensTrail(){
  const tr=world.trail;if(tr.length<2)return;const P=ink.lens;
  const pts=[];for(const s of tr){const life=clamp(1-(world.time-s.time)/TRAIL_LIFE,0,1);if(life>0)pts.push([sx(s.x),sy(s.y),life,lensRegAt(s.x,s.y),s.n||0]);}
  const p=world.player;if(world.state!=='dead')pts.push([sx(p.x),sy(p.y),1,lensRegAt(p.x,p.y),-1]);if(pts.length<2)return;
  // Butt caps, not round ones: every piece is stroked on its own to fade along the line, and round caps
  // would paint each joint twice and bead the line at every sample (see drawTrail in effects.js).
  ctx.save();ctx.lineCap='butt';ctx.lineJoin='round';
  // The plate's silver spreads a little into the emulsion round the streak: one soft stroke under the
  // plate's stretch of the line, laid as a single path so it has no joints to bead.
  ctx.strokeStyle=`rgba(${P.silverMid},.2)`;ctx.lineWidth=3.6*scale;ctx.lineCap='round';let open=false;
  ctx.beginPath();for(let i=1;i<pts.length;i++){if(pts[i][3]!==1){open=false;continue;}if(!open){ctx.moveTo(pts[i-1][0],pts[i-1][1]);open=true;}ctx.lineTo(pts[i][0],pts[i][1]);}ctx.stroke();ctx.lineCap='butt';
  for(let i=1;i<pts.length;i++){const q=pts[i],reg=q[3],f=q[2];if(reg===2)continue;
    ctx.strokeStyle=reg===0?`rgba(${P.ink},${(.1+f*.75).toFixed(3)})`:`rgba(${P.silver},${(.1+f*.62).toFixed(3)})`;
    ctx.lineWidth=(reg===0?.6+f*1.1:.8+f*1.3)*scale;ctx.beginPath();ctx.moveTo(pts[i-1][0],pts[i-1][1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}
  // Off the sensor, every other sample by its own count, so the same points stay lit frame after frame.
  const d=.8*scale;for(const q of pts){if(q[3]!==2||q[4]<0||q[4]%2)continue;ctx.fillStyle=`rgba(${P.cyan},${(.15+q[2]*.75).toFixed(3)})`;ctx.fillRect(q[0]-d,q[1]-d,d*2,d*2);}
  ctx.restore();
}
// The course flown is laid in runs, one per register it crosses, each dashed from the point's own distance
// along the route so the dashes stay where they were printed as the oldest points are pruned below the sheet.
function lensInkPath(){
  const Q=world.inkPath;if(Q.length<2)return;const P=ink.lens;
  const pen=[[`rgba(${P.wash},.6)`,[5,3.5]],[`rgba(${P.silverMid},.6)`,[5,3.5]],[`rgba(${P.instrSoft},.5)`,[1.5,4]]];
  ctx.save();ctx.lineCap='butt';ctx.lineJoin='round';ctx.lineWidth=Math.max(.7,.9*scale);
  for(let i=0;i<Q.length-1;){const reg=lensRegAt(Q[i+1].x,Q[i+1].y);let j=i+1;while(j<Q.length-1&&lensRegAt(Q[j+1].x,Q[j+1].y)===reg)j++;
    ctx.strokeStyle=pen[reg][0];ctx.setLineDash(pen[reg][1].map(v=>v*scale));ctx.lineDashOffset=(Q[i].cd||0)*scale;
    ctx.beginPath();ctx.moveTo(sx(Q[i].x),sy(Q[i].y));for(let k=i+1;k<=j;k++)ctx.lineTo(sx(Q[k].x),sy(Q[k].y));ctx.stroke();i=j;}
  ctx.restore();
}
function lensAim(aim,preview){
  const P=ink.lens,reg=lensRegAt(world.player.x,world.player.y),points=preview.points,warn=preview.blocked||aim?.steep,end=points[points.length-1];
  const dryFrom=preview.inkRange>=0&&end.distance>0?clamp(preview.inkRange/end.distance,0,1):1;
  const Q=points.map(q=>[sx(q.x),sy(q.y)]),lens=[0];for(let i=1;i<Q.length;i++)lens.push(lens[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));const total=lens[lens.length-1];if(total<2)return;
  const at=d=>{let i=1;while(i<Q.length-1&&lens[i]<d)i++;const t=(d-lens[i-1])/((lens[i]-lens[i-1])||1);return[Q[i-1][0]+(Q[i][0]-Q[i-1][0])*t,Q[i-1][1]+(Q[i][1]-Q[i-1][1])*t,Math.atan2(Q[i][1]-Q[i-1][1],Q[i][0]-Q[i-1][0])];};
  const live=reg===0?P.ink:reg===1?P.inkRed:P.cyan,dryC=reg===0?P.wash:reg===1?P.silverMid:P.instrSoft,warnC=reg===2?P.amber:P.rubric;
  ctx.save();const step=(reg===1?9:6.5)*scale,start=27*scale+(reducedMotion?0:(world.time*14*scale)%step);
  for(let d=start;d<total;d+=step){const f=d/total,q=at(d),dry=f>dryFrom,a=dry?.4*(1-f*.4):warn?.9*(1-f*.3):(aim?.85:.6)*(1-f*.35),col=dry?dryC:warn?warnC:live;
    if(reg===0){ctx.fillStyle=`rgba(${col},${a.toFixed(3)})`;ctx.beginPath();ctx.arc(q[0],q[1],(aim?1.05:.85)*(1-.35*f)*scale+.3,0,TAU);ctx.fill();}
    else if(reg===1){ctx.strokeStyle=`rgba(${col},${a.toFixed(3)})`;ctx.lineWidth=(aim?1.5:1.1)*scale;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-Math.cos(q[2])*2.4*scale,q[1]-Math.sin(q[2])*2.4*scale);ctx.lineTo(q[0]+Math.cos(q[2])*2.4*scale,q[1]+Math.sin(q[2])*2.4*scale);ctx.stroke();}
    else{ctx.strokeStyle=`rgba(${col},${a.toFixed(3)})`;ctx.lineWidth=(aim?1:.8)*scale;const nx=-Math.sin(q[2]),ny=Math.cos(q[2]);ctx.beginPath();ctx.moveTo(q[0]-nx*1.8*scale,q[1]-ny*1.8*scale);ctx.lineTo(q[0]+nx*1.8*scale,q[1]+ny*1.8*scale);ctx.stroke();}}
  if(aim?.perfect&&!preview.fogged){const x=sx(aim.cx+Math.cos(aim.entryAngle)*aim.radius),y=sy(aim.cy+Math.sin(aim.entryAngle)*aim.radius);
    ctx.strokeStyle=reg===0?`rgb(${P.gold})`:reg===1?`rgb(${P.inkRed})`:`rgb(${P.instr})`;ctx.lineWidth=1.1*scale;ctx.beginPath();ctx.arc(x,y,3.2*scale,0,TAU);ctx.stroke();
    ctx.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.moveTo(x+Math.cos(a)*4.4*scale,y+Math.sin(a)*4.4*scale);ctx.lineTo(x+Math.cos(a)*6.4*scale,y+Math.sin(a)*6.4*scale);}ctx.stroke();}
  ctx.restore();
}

// ---------- The traveller: a refracting telescope, the Observer Core at its eyepiece ----------
// The tube leads objective-first along the flight's heading, and the Core sits where an eye resolves the image,
// near its trailing end — the point that wants to know, not the point that merely gathers light (06-lens.md,
// "The bodies"). It is re-clad in each register without the Core ever moving: Galileo's tooled leather tube
// at the eyepiece; an astrograph with its photographic back and guide scope on the plate; a telescope carried
// above the air, its aperture door open and its arrays out, off the sensor.
const lensScopes=[null,null,null];let lensScopeKey='';
function lensScopeSprite(reg){
  const key=DPR.toFixed(2);if(lensScopeKey!==key){lensScopes[0]=lensScopes[1]=lensScopes[2]=null;lensScopeKey=key;}
  if(lensScopes[reg])return lensScopes[reg];
  const P=ink.lens,S=1.15,size=76,c=makeCanvas(Math.round(size*DPR),Math.round(size*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);g.scale(S,S);
  const cyl=(y0,y1,a,b,dark)=>{const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,lensRgb(b));gr.addColorStop(.35,lensRgb(a));gr.addColorStop(1,lensRgb(dark));return gr;};
  let core=-19;
  g.fillStyle='rgba(30,20,10,.14)';g.beginPath();g.ellipse(0,3,20,3.6,0,0,TAU);g.fill();
  if(reg===0){
    g.beginPath();g.moveTo(-17,-2.3);g.lineTo(16,-3.5);g.lineTo(16,3.5);g.lineTo(-17,2.3);g.closePath();g.fillStyle=cyl(-3.5,3.5,[120,70,40],[176,120,78],[52,28,16]);g.fill();g.strokeStyle=`rgb(${P.ink})`;g.lineWidth=.5;g.stroke();
    // gilt tooling: bands and a running line of small stamps, as the Florentine tubes are tooled
    g.strokeStyle='rgba(222,184,96,.9)';g.lineWidth=.55;for(const x of[-12,-2,8]){const hh=lerp(2.3,3.5,(x+17)/33);g.beginPath();g.moveTo(x,-hh);g.lineTo(x,hh);g.moveTo(x+1.1,-hh);g.lineTo(x+1.1,hh);g.stroke();}
    g.fillStyle='rgba(222,184,96,.8)';for(let x=-10;x<14;x+=2.2){if(Math.abs(x+1.5)<1.2||Math.abs(x-8.5)<1.2)continue;g.beginPath();g.arc(x,0,.35,0,TAU);g.fill();}
    g.fillStyle=cyl(-4,4,[196,160,86],[240,214,150],[110,84,40]);g.fillRect(15,-4,3.6,8);g.strokeStyle=`rgb(${P.ink})`;g.strokeRect(15,-4,3.6,8);
    g.fillStyle='rgba(150,190,210,.7)';g.beginPath();g.ellipse(18.6,0,.8,3.2,0,0,TAU);g.fill();
    g.fillStyle=cyl(-1.7,1.7,[196,160,86],[240,214,150],[110,84,40]);g.fillRect(-21.5,-1.7,4.6,3.4);g.strokeRect(-21.5,-1.7,4.6,3.4);core=-20.3;
  }else if(reg===1){
    g.fillStyle=cyl(-6,-4.2,[60,60,58],[120,120,116],[20,20,20]);g.fillRect(-9,-6.6,22,2.2);g.strokeStyle=`rgb(${P.inkBlack})`;g.lineWidth=.4;g.strokeRect(-9,-6.6,22,2.2);
    g.fillStyle='rgb(40,40,38)';g.fillRect(-2,-4.4,1.4,1.2);g.fillRect(8,-4.4,1.4,1.2);
    g.fillStyle=cyl(-3.8,3.8,[46,46,44],[110,110,104],[12,12,12]);g.fillRect(-16,-3.8,32,7.6);g.strokeRect(-16,-3.8,32,7.6);
    g.fillStyle=cyl(-4.3,4.3,[60,60,56],[130,130,124],[16,16,16]);g.fillRect(14,-4.3,5,8.6);g.strokeRect(14,-4.3,5,8.6);
    g.fillStyle='rgba(170,196,210,.6)';g.fillRect(18.6,-3.2,.6,6.4);
    // the photographic back: a plate holder, its dark slide drawn half out
    g.fillStyle=cyl(-5.2,5.2,[92,70,48],[140,110,78],[40,28,18]);g.fillRect(-22,-5.2,6.2,10.4);g.strokeRect(-22,-5.2,6.2,10.4);
    g.fillStyle='rgb(22,20,18)';g.fillRect(-20.6,-7.4,1.6,4);g.strokeStyle='rgba(220,220,210,.6)';g.lineWidth=.35;g.beginPath();g.moveTo(-21.8,0);g.lineTo(-16,0);g.stroke();core=-19;
  }else{
    // Hubble as it flew in 1990, in the few shapes that still read at the size it is flown: a body wrapped in
    // silver foil, quilted in panels and banded where its sections join, with the equipment bays standing
    // proud round its middle; the aperture door swung open at the front on its hinge, the baffle's black
    // inside the mouth; the first arrays, two flexible blankets rolled out along a central mast on each
    // side; the two high-gain dishes on their booms; and the yellow handrails a spacewalker holds.
    const foil=(y0,y1)=>{const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'rgb(150,156,168)');gr.addColorStop(.18,'rgb(236,240,246)');gr.addColorStop(.32,'rgb(252,253,255)');gr.addColorStop(.62,'rgb(186,192,204)');gr.addColorStop(1,'rgb(70,76,90)');return gr;};
    // the arrays first, so the body lies over their roots: the mast, the blanket either side of it in cells,
    // a gold frame at the blanket's edge and the spreader bar at its tip
    for(const s of[-1,1]){const y0=s*6.2,y1=s*20.5;
      g.strokeStyle='rgba(206,210,220,.95)';g.lineWidth=.7;g.beginPath();g.moveTo(-.5,s*4.4);g.lineTo(-.5,y1+s*.8);g.stroke();
      for(const side of[-1,1]){const x0=side<0?-5.4:.3,w=4.6,cellH=(y1-y0)/7;
        const bl=g.createLinearGradient(x0,0,x0+w,0);bl.addColorStop(0,'rgb(34,44,86)');bl.addColorStop(.5,'rgb(58,74,128)');bl.addColorStop(1,'rgb(30,38,74)');g.fillStyle=bl;g.fillRect(x0,y0,w,y1-y0);
        g.strokeStyle='rgba(150,170,220,.55)';g.lineWidth=.22;g.beginPath();for(let k=1;k<7;k++){g.moveTo(x0,y0+k*cellH);g.lineTo(x0+w,y0+k*cellH);}g.moveTo(x0+w/2,y0);g.lineTo(x0+w/2,y1);g.stroke();
        g.strokeStyle='rgba(214,176,92,.85)';g.lineWidth=.35;g.strokeRect(x0,Math.min(y0,y1),w,Math.abs(y1-y0));}
      g.fillStyle='rgb(200,204,212)';g.fillRect(-5.8,y1-(s<0?.9:0),11.8,.9);
      // a sheen across the blankets, the one glint the sun gives the arrays
      const sh=g.createLinearGradient(-6,y0,6,y1);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.45,'rgba(200,220,255,.18)');sh.addColorStop(.55,'rgba(200,220,255,0)');g.fillStyle=sh;g.fillRect(-5.4,Math.min(y0,y1),10.3,Math.abs(y1-y0));}
    // the high-gain dishes on their booms, one above the body and one below, set aft of the arrays
    for(const s of[-1,1]){g.strokeStyle='rgba(196,200,210,.95)';g.lineWidth=.55;g.beginPath();g.moveTo(-8.5,s*4.4);g.lineTo(-11,s*9.6);g.stroke();
      g.save();g.translate(-11.4,s*10.4);g.rotate(s*.5);g.fillStyle='rgb(222,226,232)';g.beginPath();g.ellipse(0,0,2.3,.95,0,0,TAU);g.fill();g.strokeStyle='rgba(60,66,80,.9)';g.lineWidth=.3;g.stroke();
      g.fillStyle='rgba(90,96,110,.9)';g.beginPath();g.ellipse(0,s*.25,1.2,.4,0,0,TAU);g.fill();g.restore();}
    // the body: the light shield forward, the equipment section standing proud aft of the arrays, the aft shroud
    g.fillStyle=foil(-4.3,4.3);g.fillRect(-9,-4.3,23,8.6);
    g.fillStyle=foil(-4.9,4.9);g.fillRect(-16.5,-4.9,8,9.8);
    g.fillStyle=foil(-4.6,4.6);g.fillRect(-20,-4.6,3.6,9.2);
    // the foil's quilting: faint panel seams, and one crumpled facet catching light a little differently
    g.strokeStyle='rgba(110,116,130,.45)';g.lineWidth=.22;g.beginPath();for(const x of[-5,-1,3,7.5,11])g.moveTo(x,-4.3),g.lineTo(x,4.3);for(const x of[-14.5,-12.5,-10.5])g.moveTo(x,-4.9),g.lineTo(x,4.9);g.stroke();
    g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.moveTo(4,-4.3);g.lineTo(7.2,-4.3);g.lineTo(6.4,-.6);g.lineTo(3.6,-1.2);g.closePath();g.fill();
    g.fillStyle='rgba(40,46,60,.18)';g.beginPath();g.moveTo(-4.6,1);g.lineTo(-1.4,1.6);g.lineTo(-1.8,4.3);g.lineTo(-4.8,4.3);g.closePath();g.fill();
    g.strokeStyle='rgba(34,38,48,.95)';g.lineWidth=.45;g.strokeRect(-9,-4.3,23,8.6);g.strokeRect(-16.5,-4.9,8,9.8);g.strokeRect(-20,-4.6,3.6,9.2);
    // the equipment bays' doors, a row of small panels round the proud section
    g.strokeStyle='rgba(80,86,100,.7)';g.lineWidth=.25;g.beginPath();for(let k=0;k<3;k++){const x=-16+k*2.5;g.rect(x,-3.4,2,2.6);g.rect(x,.8,2,2.6);}g.stroke();
    // handrails, yellow, where a hand would hold on
    g.strokeStyle='rgba(236,190,40,.95)';g.lineWidth=.45;g.lineCap='round';g.beginPath();for(const x of[-15.5,-12,-6,0,8])g.moveTo(x,x<-8?-5.35:-4.75),g.lineTo(x+2,x<-8?-5.35:-4.75);for(const x of[-14,-4,5])g.moveTo(x,x<-8?5.35:4.75),g.lineTo(x+2,x<-8?5.35:4.75);g.stroke();
    // the mouth and the baffle's black inside it, then the aperture door swung open on its hinge
    g.fillStyle='rgb(200,206,214)';g.fillRect(14,-4.5,1.2,9);
    g.fillStyle='rgb(6,8,12)';g.beginPath();g.ellipse(15.2,0,1.1,4.1,0,0,TAU);g.fill();g.strokeStyle='rgba(90,100,120,.6)';g.lineWidth=.25;g.beginPath();g.ellipse(15.2,0,.6,2.6,0,0,TAU);g.stroke();
    g.save();g.translate(15.2,-4.5);g.rotate(-1.18);const dg=g.createLinearGradient(0,-1,0,1);dg.addColorStop(0,'rgb(250,251,253)');dg.addColorStop(1,'rgb(150,156,168)');
    g.fillStyle=dg;g.beginPath();g.moveTo(0,-.7);g.lineTo(9,-.5);g.quadraticCurveTo(9.8,0,9,.5);g.lineTo(0,.7);g.closePath();g.fill();g.strokeStyle='rgba(34,38,48,.9)';g.lineWidth=.35;g.stroke();g.restore();
    g.fillStyle='rgb(120,126,140)';g.beginPath();g.arc(15.2,-4.5,.7,0,TAU);g.fill();
    // a thin rim light along the lit edge, so the craft is never lost against the star field
    g.strokeStyle='rgba(170,220,255,.5)';g.lineWidth=.35;g.beginPath();g.moveTo(-20,-4.75);g.lineTo(-16.5,-4.75);g.moveTo(-16.5,-5.05);g.lineTo(-8.5,-5.05);g.moveTo(-9,-4.45);g.lineTo(14,-4.45);g.stroke();
    core=-18.2;
  }
  lensScopes[reg]={canvas:c,size,S,core:core*S};return lensScopes[reg];
}
function lensPlayer(){
  if(world.state==='dead')return;
  const P=ink.lens,reg=lensRegNow(),p=world.player,sp=lensScopeSprite(reg),{x,y,ang}=heldPose(-21*sp.S,19*sp.S),t=reducedMotion?0:world.time;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);
  // the sightline ahead of the objective, faint, so the tube reads as pointing
  const sl=ctx.createLinearGradient(20,0,54,0),lc=reg===0?P.ink:reg===1?P.inkBlack:P.cyan;sl.addColorStop(0,`rgba(${lc},.35)`);sl.addColorStop(1,`rgba(${lc},0)`);ctx.strokeStyle=sl;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(54,0);ctx.stroke();
  ctx.drawImage(sp.canvas,-sp.size/2,-sp.size/2,sp.size,sp.size);
  const ax=sp.core,br=1+.08*Math.sin(t*2.1),hg=ctx.createRadialGradient(ax,0,0,ax,0,10*br);
  hg.addColorStop(0,reg===2?'rgba(230,246,255,.95)':'rgba(255,250,228,.95)');hg.addColorStop(.35,reg===2?'rgba(160,220,250,.5)':'rgba(255,240,196,.5)');hg.addColorStop(1,'rgba(255,240,196,0)');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(ax,0,10*br,0,TAU);ctx.fill();ctx.fillStyle=`rgb(${P.core})`;ctx.beginPath();ctx.arc(ax,0,1.9,0,TAU);ctx.fill();
  ctx.strokeStyle=reg===2?`rgb(${P.instrSoft})`:`rgb(${P.ink})`;ctx.lineWidth=.6;ctx.beginPath();ctx.arc(ax,0,2.5,0,TAU);ctx.stroke();
  // the charges held: the dew-cap as a ring round the tube, the finder's mirror as a silver arc, the open sky's light
  const cc=reg===0?P.ink:reg===1?P.inkBlack:P.instr;
  // the arrays reach further than a tube, so off the sensor the charges stand clear of them
  const cr=reg===2?6:0;
  if(p.shielded){ctx.strokeStyle=`rgba(${cc},.75)`;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,24+cr,0,TAU);ctx.stroke();ctx.lineWidth=.5;ctx.beginPath();ctx.arc(0,0,22+cr,0,TAU);ctx.stroke();}
  if(p.reflectorArmed){ctx.strokeStyle=`rgba(${P.mirror},.95)`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,27+cr,-.9,.9);ctx.stroke();ctx.strokeStyle=`rgba(${cc},.8)`;ctx.lineWidth=.4;ctx.beginPath();ctx.arc(0,0,28.3+cr,-.9,.9);ctx.stroke();}
  if(p.dawnArmed){ctx.strokeStyle=reg===2?`rgba(${P.cyan},.85)`:`rgba(${P.gold},.85)`;ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<12;i++){const a=i*TAU/12;ctx.moveTo(Math.cos(a)*(19+cr),Math.sin(a)*(19+cr));ctx.lineTo(Math.cos(a)*(i%2?21.5+cr:24+cr),Math.sin(a)*(i%2?21.5+cr:24+cr));}ctx.stroke();}
  ctx.restore();
}

// ---------- The fog: the boundary as three photographic failures ----------
// This era's word for the boundary is a real conservation term, and what fails as it nears is three real and
// distinct failures in order (06-lens.md, "The frontier"): fog first, an overall density flattening the image
// toward grey; silver mirroring next, a thin bluish metallic sheen blooming where the image was darkest; and
// emulsion frilling at the edge itself, the gelatin lifting and curling off its support. The shoreline stays
// the sharpest edge in the field, drawn over the grain rather than folded into it. Its position, rate and
// grace are untouched: read straight off the state drawDark reads.
function lensFrontAt(xw,level){const lv=Math.floor(level/60),u=xw/30,i=Math.floor(u),f=u-i;return lerp((tileHash(i,lv,5)-.5)*10,(tileHash(i+1,lv,5)-.5)*10,f*f*(3-2*f))+Math.sin(xw*.21+lv)*1.6;}
function lensDark(dt){
  const P=ink.lens,fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  const reg=lensRegAtY(world.floorY),level=world.floorY,step=Math.max(2,2.5*scale),pts=[];
  for(let x=-step;x<=W+step;x+=step){const xw=(x-W*.5)/scale;pts.push([x,fy+lensFrontAt(xw+1000,level)*scale]);}
  const fogC=reg===0?'150,138,116':reg===1?'142,140,134':'58,62,70',massTop=reg===0?'122,110,90':reg===1?'112,110,104':'34,38,46',massBot=reg===0?'70,62,50':reg===1?'64,62,58':'16,18,24';
  ctx.save();
  // fog: density rising over everything above the edge, flattening its contrast
  const reach=(70+near*44)*scale,tg=ctx.createLinearGradient(0,fy-reach,0,fy);
  tg.addColorStop(0,`rgba(${fogC},0)`);tg.addColorStop(.6,`rgba(${fogC},${(.22+near*.12).toFixed(3)})`);tg.addColorStop(1,`rgba(${fogC},${(.5+near*.15).toFixed(3)})`);ctx.fillStyle=tg;ctx.fillRect(0,fy-reach,W,reach+2);
  // silver mirroring: a thin metallic band just above the edge, blue to violet, shifting as the light moves
  const time=reducedMotion?0:world.time,mh=16*scale,mg=ctx.createLinearGradient(0,0,W,0),sh=(Math.sin(time*.6)*.5+.5)*.3;
  mg.addColorStop(0,`rgba(${P.mirror},.0)`);mg.addColorStop(clamp(.2+sh,0,1),`rgba(${P.mirror},${(.35+near*.2).toFixed(3)})`);mg.addColorStop(clamp(.45+sh,0,1),'rgba(170,150,196,.28)');mg.addColorStop(clamp(.7+sh*.5,0,1),`rgba(${P.mirror},${(.32+near*.2).toFixed(3)})`);mg.addColorStop(1,`rgba(${P.mirror},.05)`);
  ctx.save();ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]-mh);for(const q of pts)ctx.lineTo(q[0],q[1]-mh);for(let i=pts.length-1;i>=0;i--)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.clip();
  ctx.fillStyle=mg;ctx.fillRect(0,fy-mh-8*scale,W,mh+14*scale);ctx.restore();
  // the frilled emulsion below the edge: the gelatin lifted off and gone grey, with the old image drowned in it
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.lineTo(W+10,H+10);ctx.lineTo(-10,H+10);ctx.closePath();
  const mass=ctx.createLinearGradient(0,fy,0,fy+170*scale);mass.addColorStop(0,`rgba(${massTop},.97)`);mass.addColorStop(1,`rgba(${massBot},1)`);ctx.fillStyle=mass;ctx.fill();
  ctx.save();ctx.clip();const lv=Math.floor(level/60);
  for(let i=0;i<22;i++){const x=tileHash(i,lv,21)*W,y=fy+(10+tileHash(i,lv,22)*150)*scale,r=(5+tileHash(i,lv,23)*18)*scale,g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(${reg===2?'90,96,108':'196,190,176'},.28)`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  // wrinkles in the lifted gelatin: short curved crests running along the edge
  ctx.strokeStyle='rgba(255,255,250,.18)';ctx.lineWidth=.8;for(let i=0;i<30;i++){const x=tileHash(i,lv,24)*W,y=fy+(6+tileHash(i,lv,25)*90)*scale,L=(8+tileHash(i,lv,26)*22)*scale;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+L*.5,y-3*scale,x+L,y+tileHash(i,lv,27)*3*scale);ctx.stroke();}
  ctx.restore();
  // the curled lip: a lit crest on the edge and its shadow under it, and here and there a curl turned back
  ctx.strokeStyle='rgba(255,255,250,.75)';ctx.lineWidth=1.1*scale;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]-1*scale):ctx.moveTo(q[0],q[1]-1*scale));ctx.stroke();
  ctx.strokeStyle='rgba(20,18,16,.55)';ctx.lineWidth=1.4*scale;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]+1.2*scale):ctx.moveTo(q[0],q[1]+1.2*scale));ctx.stroke();
  for(let k=0;k<7;k++){const x=((k*.3819+lv*.137)%1)*W,y=fy+lensFrontAt((x-W*.5)/scale+1000,level)*scale,r=(3+(k%3)*2)*scale,lift=reducedMotion?0:Math.sin(time*.8+k)*.15;
    ctx.fillStyle=`rgba(${massTop},.95)`;ctx.beginPath();ctx.ellipse(x,y-r*.5,r*1.4,r*(.8+lift),0,Math.PI,TAU);ctx.fill();ctx.strokeStyle='rgba(255,255,250,.55)';ctx.lineWidth=.7*scale;ctx.beginPath();ctx.ellipse(x,y-r*.5,r*1.4,r*(.8+lift),0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}
  ctx.restore();
}

// ---------- A field resolved ----------
// Where the atlas engraves a constellation-figure, this era draws no figure at all — figures are entirely gone
// from its plates (06-lens.md, "The grammar") — but the field the three stars were resolved in: the finder's
// circle of view at the eyepiece, crosshairs and all; the rectangular field of a survey plate with its
// fiducial crosses and identity typed in its corner on the glass; a detection box off the sensor. Each is laid
// on as the field's stars are held, so an unfinished field shows exactly how much of it has been taken.
// A field's name is settled type, declared to the ground register so a note written after it is set round it
// rather than over it; the register's own faces are all set on the middle, so the box is measured about y.
function lensMarkName(str,x,y,size,variant){ctx.save();ctx.font=plateFace(size,variant);const w=ctx.measureText(str).width;ctx.restore();markGround('caption',x-w/2-2,y-size*.62,x+w/2+2,y+size*.62);}
function lensFieldName(chart){const F=LENS_FIELDS[((chart.catalogueIndex|0)%12+12)%12];return F;}
function lensFigure(chart){
  if(chart.stars.length<3)return;const P=ink.lens;
  const pts=chart.stars.map(s=>[sx(s.x),sy(s.y)]),ys=pts.map(p=>p[1]);if(Math.max(...ys)<-240||Math.min(...ys)>H+240)return;
  const count=chart.stars.filter(n=>n.visited).length,done=chart.completed,f=chart.expired?.3:done?1:count/3;if(f<=0)return;
  const reg=lensRegAt(chart.stars[1].x,chart.stars[1].y),F=lensFieldName(chart),al=chart.expired?.35:1;
  let cx=0,cy=0;for(const p of pts){cx+=p[0];cy+=p[1];}cx/=3;cy/=3;
  ctx.save();ctx.globalAlpha=al;ctx.lineCap='round';
  if(reg===0){let R=0;for(const p of pts)R=Math.max(R,Math.hypot(p[0]-cx,p[1]-cy));R+=30*scale;const a0=-Math.PI/2,a1=a0+TAU*f;
    ctx.strokeStyle=`rgba(${P.ink},.62)`;ctx.lineWidth=Math.max(.6,.8*scale);ctx.beginPath();ctx.arc(cx,cy,R,a0,a1);ctx.stroke();ctx.lineWidth=Math.max(.35,.4*scale);ctx.beginPath();ctx.arc(cx,cy,R+3*scale,a0,a1);ctx.stroke();
    if(done){ctx.strokeStyle=`rgba(${P.ink},.35)`;ctx.lineWidth=Math.max(.35,.4*scale);ctx.setLineDash([3*scale,3*scale]);ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx-R*.2,cy);ctx.moveTo(cx+R*.2,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy-R*.2);ctx.moveTo(cx,cy+R*.2);ctx.lineTo(cx,cy+R);ctx.stroke();ctx.setLineDash([]);
      const x=clamp(cx,90,W-90),y=clamp(cy+R+16*scale,70,H-70),sz=Math.max(12,13*scale);lensFell(ctx,F[0]+' · '+F[1],x,y,sz,P.ink,.92,'center','sc');lensMarkName(F[0]+' · '+F[1],x,y,sz,'sc');}}
  else if(reg===1){const pad=30*scale;let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const p of pts){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}
    x0-=pad;y0-=pad;x1+=pad;y1+=pad;const per=2*((x1-x0)+(y1-y0));
    ctx.strokeStyle=`rgba(${P.inkBlack},.7)`;ctx.lineWidth=Math.max(.6,.8*scale);ctx.setLineDash([per*f,per]);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y0);ctx.lineTo(x1,y1);ctx.lineTo(x0,y1);ctx.closePath();ctx.stroke();ctx.setLineDash([]);
    ctx.lineWidth=Math.max(.6,.8*scale);ctx.beginPath();for(const [fx,fy] of[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]){ctx.moveTo(fx-5*scale,fy);ctx.lineTo(fx+5*scale,fy);ctx.moveTo(fx,fy-5*scale);ctx.lineTo(fx,fy+5*scale);}ctx.stroke();
    lensGrot(ctx,'FIELD '+(100+((chart.catalogueIndex|0)*53)%900),x0+4*scale,y0+8*scale,Math.max(8,8.5*scale),P.inkBlack,.85);
    chart.stars.forEach((n,i)=>{if(!n.visited&&!done)return;lensTyped(ctx,String(i+1),pts[i][0]+(n.r*.45+5)*scale,pts[i][1]-(n.r*.45+5)*scale,Math.max(9,9.5*scale),P.inkRed,.9);});
    if(done){const nx=clamp((x0+x1)/2,90,W-90),ny=y1+12*scale,sz=Math.max(9.5,10*scale);lensGrot(ctx,F[0]+' · '+F[1],nx,ny,sz,P.inkBlack,.95,'center');lensMarkName(F[0]+' · '+F[1],nx,ny,sz,'grot');}}
  else{const pad=26*scale;let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const p of pts){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}
    x0-=pad;y0-=pad;x1+=pad;y1+=pad;const L=Math.min(22*scale,(x1-x0)*.3)*f;
    ctx.strokeStyle=`rgba(${P.cyan},.8)`;ctx.lineWidth=Math.max(.7,.9*scale);ctx.beginPath();
    for(const [fx,fy,sx0,sy0] of[[x0,y0,1,1],[x1,y0,-1,1],[x1,y1,-1,-1],[x0,y1,1,-1]]){ctx.moveTo(fx+sx0*L,fy);ctx.lineTo(fx,fy);ctx.lineTo(fx,fy+sy0*L);}ctx.stroke();
    lensMono(ctx,lensCard('OBJECT',"'"+F[0]+"'"),x0,y0-8*scale,Math.max(7.5,7.5*scale),P.cyan,.9);
    if(done){const nx=clamp((x0+x1)/2,90,W-90),ny=y1+11*scale,sz=Math.max(8.5,9*scale);lensMono(ctx,F[1],nx,ny,sz,P.instr,.95,'center');lensMarkName(F[1],nx,ny,sz,'mono');}}
  ctx.restore();
}
// A field's route before it is resolved: straight lines between its stars, dashed while only proposed and
// drawn solid once both ends are held, each star numbered at its vertex as a plate's catalogue numbers them,
// and the field's name set small by its middle star while the route is live.
function lensChartRoute(chart){
  if(!chart.stars.length||sy(chart.entry.y)<-150||sy(chart.stars[chart.stars.length-1].y)>H+170)return;
  const P=ink.lens,reg=lensRegAt(chart.stars[0].x,chart.stars[0].y),points=[chart.entry,...chart.stars];if(chart.exit)points.push(chart.exit);
  const live=reg===0?P.ink:reg===1?P.inkBlack:P.cyan,dry=reg===0?P.wash:reg===1?P.silverMid:P.instrSoft;
  ctx.save();revealChartClip(chart);ctx.lineCap='round';
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],lit=chart.completed||(a.visited&&b.visited),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
    const ax=sx(a.x+dx/d*(a.cap+10)),ay=sy(a.y+dy/d*(a.cap+10)),bx=sx(b.x-dx/d*(b.cap+10)),by=sy(b.y-dy/d*(b.cap+10));
    ctx.strokeStyle=`rgba(${lit?live:dry},${chart.expired?.12:lit?.5:.42})`;ctx.lineWidth=(lit?.7:.55)*scale;ctx.setLineDash(lit?[]:reg===2?[1.5*scale,3.5*scale]:[4*scale,4*scale]);
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
  }
  ctx.setLineDash([]);
  chart.stars.forEach((n,i)=>{const x=sx(n.x)-(n.r*.62+8)*scale,y=sy(n.y)-(n.r*.62+8)*scale,a=chart.expired?.2:n.visited?.85:.6,sz=Math.max(10,10.5*scale),c=n.visited?live:dry;
    if(reg===0)lensFell(ctx,LENS_ROMAN[i].toLowerCase(),x,y,sz,c,a,'center','text','italic');else if(reg===1)lensTyped(ctx,String(i+1),x,y,sz,c,a,'center');else lensMono(ctx,'#'+(i+1),x,y,sz*.8,c,a,'center');});
  if(!chart.expired&&!chart.completed&&!captionsHeld()){const e=chart.stars[1]||chart.stars[0],x=sx(e.x),y=sy(e.y)+e.cap*scale+14*scale,F=lensFieldName(chart);
    if(y>-40&&y<H+40){if(reg===0)lensFell(ctx,F[0],x,y,Math.max(10,10.5*scale),P.inkSoft,.6,'center','sc');else if(reg===1)lensGrot(ctx,F[0],x,y,Math.max(8.5,9*scale),P.inkBlack,.55,'center');else lensMono(ctx,F[0],x,y,Math.max(7.5,8*scale),P.instrSoft,.7,'center');}}
  ctx.restore();
}

// ---------- The HUD, in the register's own hand ----------
// The magnitude reached as the score and the exposure as the currency, set at the head of the sheet: at the
// eyepiece in the Fell over an engraved scale; on the plate typed on a log slip, the exposure a strip of film
// darkening as far as it will carry; off the sensor a stack of FITS cards ticking over, the exposure a meter.
// The DOM HUD stays for screen readers and is taken off the screen (index.html).
let lensHudTopPx=null;
function lensHudTop(){
  if(lensHudTopPx!==null)return lensHudTopPx;
  let t=26;try{const e=document.querySelector('.hud'),v=e&&typeof getComputedStyle==='function'?parseFloat(getComputedStyle(e).top):NaN;if(isFinite(v))t=v;}catch(e){}
  return lensHudTopPx=t;
}
function lensHudLeaf(){
  if(!world||world.state==='ready')return;
  if(world.won){lensFinale();return;}
  const P=ink.lens,reg=lensRegNow(),top=lensHudTop(),words=plateWords().hud,score=world.score|0,level=world.inkLevel(),low=level<=.34,pulse=low&&!reducedMotion?.5+.5*Math.sin(world.time*6):1,C=LENS_CHAPTERS[lensChapterOf(world)];
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  const left=LENS_BAND+12,right=W-LENS_BAND-14,cx=W/2,m=world.speedMultiplier(),pace=words.pace+(m%1?m.toFixed(1):m);
  if(reg===0){
    lensFell(ctx,String(score),left,top+7,22,P.ink,.94,'left');lensFell(ctx,'magnitudo',left,top+24,9.5,P.inkSoft,.75,'left','text','italic');
    // the exposure as an engraved scale, gilt as far as it will carry, and rubric once it will not carry a transfer
    const span=Math.min(62,W*.15),R=170,cy=top+14-R,half=Math.asin(span/R),a0=Math.PI/2+half,a1=Math.PI/2-half;
    ctx.lineCap='butt';ctx.strokeStyle=`rgba(${P.ink},.8)`;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(cx,cy,R,a1,a0);ctx.stroke();
    for(let i=0;i<=40;i++){const u=i/40,a=a0-(a0-a1)*u,on=u<=level,big=i%10===0,l=big?7:i%5===0?5:3.2,x0=cx+Math.cos(a)*R,y0=cy+Math.sin(a)*R,x1=cx+Math.cos(a)*(R+l),y1=cy+Math.sin(a)*(R+l);
      if(on){ctx.strokeStyle=low?`rgba(${P.rubric},${(.55+.45*pulse).toFixed(3)})`:`rgba(${P.gold},.95)`;ctx.lineWidth=big?1.3:.9;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}
      else{ctx.fillStyle=`rgba(${P.inkSoft},.4)`;ctx.beginPath();ctx.arc(x1,y1,.55,0,TAU);ctx.fill();}}
    lensFell(ctx,'EXPOSURE',cx,top-2,8.5,P.ink,.75,'center','sc');
    lensFell(ctx,pace,cx,top+30,9.5,P.inkSoft,.8,'center','sc');
    lensFell(ctx,C.place.toLowerCase().replace(/\b\w/g,q=>q.toUpperCase())+', '+C.year,cx,top+44,10,P.inkSoft,.75,'center','text','italic');
    let rx=right;if(world.combo>1&&world.captures>0){const shown=Math.min(6,world.combo);for(let i=0;i<shown;i++){ctx.strokeStyle=`rgba(${P.ink},.85)`;ctx.lineWidth=.8;ctx.beginPath();for(let k=0;k<3;k++){const a=k*Math.PI/3;ctx.moveTo(rx-Math.cos(a)*4.5,top+6-Math.sin(a)*4.5);ctx.lineTo(rx+Math.cos(a)*4.5,top+6+Math.sin(a)*4.5);}ctx.stroke();rx-=12;}
      if(world.combo>6)lensFell(ctx,'×'+world.combo,right+4,top+20,10,P.inkSoft,.75,'right');}
  }else if(reg===1){
    // a log slip: score typed as a running entry, and the plate's exposure as a strip of film
    ctx.fillStyle='rgba(240,236,224,.85)';ctx.fillRect(left-4,top-8,96,30);ctx.strokeStyle=`rgba(${P.inkBlack},.45)`;ctx.lineWidth=.6;ctx.strokeRect(left-4,top-8,96,30);
    lensTyped(ctx,'No '+String(score).padStart(5,'0'),left+2,top+2,13,P.inkBlack,.95);lensTyped(ctx,'OBJECTS LOGGED',left+2,top+15,7,P.inkBlack,.7);
    const fw=Math.min(128,W*.3),fx=cx-fw/2,fy=top-4,fh=16;ctx.fillStyle='rgba(30,26,22,.92)';ctx.fillRect(fx,fy,fw,fh);
    ctx.fillStyle='rgba(236,232,220,.9)';for(let x=fx+3;x<fx+fw-3;x+=6){ctx.fillRect(x,fy+1.5,3,2);ctx.fillRect(x,fy+fh-3.5,3,2);}
    const frames=8,fwid=(fw-8)/frames;for(let i=0;i<frames;i++){const on=(i+1)/frames<=level+1e-6;ctx.fillStyle=on?(low?`rgba(${P.inkRed},${(.6+.4*pulse).toFixed(3)})`:'rgba(214,208,192,.95)'):'rgba(90,84,74,.6)';ctx.fillRect(fx+4+i*fwid+1,fy+5,fwid-2,fh-10);}
    lensTyped(ctx,'EXPOSURE',cx,top+20,8,P.inkBlack,.8,'center');lensTyped(ctx,pace,cx,top+31,8,P.inkBlack,.75,'center');lensTyped(ctx,C.place+' '+C.year,cx,top+42,8,P.inkRed,.75,'center');
    let rx=right;if(world.combo>1&&world.captures>0){const shown=Math.min(6,world.combo);ctx.strokeStyle=`rgba(${P.inkRed},.85)`;for(let i=0;i<shown;i++){lensLoop(ctx,rx,top+6,4.2,i*7+3,1,.9);rx-=12;}
      if(world.combo>6)lensTyped(ctx,'x'+world.combo,right+4,top+20,9,P.inkBlack,.8,'right');}
  }else{
    // a header of cards, the values ticking rather than written
    const cards=[lensCard('SIMPLE','T'),lensCard('SNR',String(score)),lensCard('EXPTIME',(level*1200).toFixed(0)+'.0'),lensCard('VISIT',"'"+String(lensChapterOf(world)+1).padStart(2,'0')+"'")];
    ctx.fillStyle='rgba(2,4,8,.72)';ctx.fillRect(left-5,top-9,132,cards.length*11+8);
    cards.forEach((c,i)=>lensMono(ctx,c,left,top-1+i*11,8,i===1?P.instr:P.instrSoft,.95,'left'));
    const bw=Math.min(96,W*.22),bx=cx-bw/2+30,by=top+2;ctx.strokeStyle=`rgba(${P.instrSoft},.8)`;ctx.lineWidth=.7;ctx.strokeRect(bx,by,bw,7);
    ctx.fillStyle=low?`rgba(${P.amber},${(.6+.4*pulse).toFixed(3)})`:`rgba(${P.cyan},.9)`;ctx.fillRect(bx+1,by+1,(bw-2)*clamp(level,0,1),5);
    ctx.beginPath();for(let i=0;i<=10;i++){ctx.moveTo(bx+i*bw/10,by+7);ctx.lineTo(bx+i*bw/10,by+(i%5?9:11));}ctx.stroke();
    lensMono(ctx,'EXPOSURE',bx,by+17,7,P.instrSoft,.85,'left');lensMono(ctx,pace,bx+bw,by+17,7,P.instrSoft,.85,'right');
    let rx=right;if(world.combo>1&&world.captures>0){const shown=Math.min(6,world.combo);ctx.strokeStyle=`rgba(${P.cyan},.9)`;ctx.lineWidth=.8;for(let i=0;i<shown;i++){ctx.strokeRect(rx-3.5,top+2.5,7,7);rx-=12;}
      if(world.combo>6)lensMono(ctx,'x'+world.combo,right+4,top+20,8,P.instrSoft,.8,'right');}
  }
  // the charges held, each as a small picture of the thing itself, drawn as it stands on the chart
  let ix=right;const iy=top+36,p=world.player,badge=type=>{ctx.save();ctx.strokeStyle=reg===2?`rgba(${P.instr},.6)`:`rgba(${reg===0?P.ink:P.inkBlack},.5)`;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(ix,iy,9.5,0,TAU);ctx.stroke();ctx.restore();
    lensGift({type,r:20},reg,ix,iy,false,.85);ix-=24;};
  if(p.shielded)badge('shield');if(p.reflectorArmed)badge('reflector');if(p.dawnArmed)badge('dawn');
  ctx.restore();
}
// The finish: the era file's own signature sheet. The page washes to paper and Saturn is laid out three times —
// Galileo's triform reading of 1610, the plate's unresolved smear of 1887, the rendered sphere of 1990 — one
// planet, one era, three centuries of the same question; and under them the one catalogue entry the era made
// and never kept, struck through rather than erased.
function lensFinale(){
  const P=ink.lens,time=world.player.deadTime,t=reducedMotion?1:clamp(time/1.2,0,1),e=1-Math.pow(1-t,3);
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=`rgba(${P.paper},${(.9*e).toFixed(3)})`;ctx.fillRect(0,0,W,H);
  const R=Math.min(W*.085,H*.05,34),y=lerp(H*.56,H*.47,e),gap=Math.min(W/3,R*4.1),stages=[1,3,6],years=['PADUA · 1610','PARIS · 1887','ABOVE THE AIR · 1990'];
  lensFell(ctx,'SATURN, THREE TIMES',W/2,y-R*2.6-22,Math.min(26,W*.06),P.ink,.95*e,'center','sc');
  lensFell(ctx,'one planet, one era, the same question answered three ways',W/2,y-R*2.6+2,11,P.inkSoft,.85*e,'center','text','italic');
  stages.forEach((s,i)=>{const k=clamp((time-.25-i*.45)/.8,0,1);if(k<=0)return;const x=W/2+(i-1)*gap;ctx.save();ctx.translate(x,y);ctx.scale(.78,.78);lensSaturn(ctx,R,s,reducedMotion?1:k);ctx.restore();
    const lab=clamp(k*2-1,0,1);if(i===0)lensFell(ctx,years[i],x,y+R*1.7,9,P.ink,.9*lab,'center','sc');else if(i===1)lensTyped(ctx,years[i],x,y+R*1.7,8,P.inkBlack,.9*lab,'center');else lensMono(ctx,years[i],x,y+R*1.7,7.5,P.ink,.9*lab,'center');});
  const vk=clamp((time-1.7)/.5,0,1),vy=y+R*1.7+34;
  if(vk>0){const s='VULCAN · CATALOGUED 1859 · NEVER FOUND';lensTyped(ctx,s,W/2,vy,9,P.inkBlack,.85*vk,'center');ctx.font=plateFace(9,'typed');const tw=ctx.measureText(s).width;
    ctx.strokeStyle=`rgba(${P.inkRed},${(.9*vk).toFixed(3)})`;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(W/2-tw/2-3,vy);ctx.lineTo(W/2-tw/2-3+(tw+6)*clamp((time-2)/.5,0,1),vy+.5);ctx.stroke();
    const lk=.9*clamp((time-2.3)/.6,0,1);lensFell(ctx,'Every surface it drew, it drew as it believed.',W/2,vy+22,11.5,P.ink,lk,'center','text','italic');
    lensFell(ctx,'The next century goes there.',W/2,vy+38,11.5,P.ink,lk,'center','text','italic');}
  ctx.restore();
}
// What is written on the sheet — a note, a warning, a landing — takes the register's own ink.
function lensInscriptionInk(caps,box){
  const reg=box&&isFinite(box.top)?lensRegAtScreen(box.top):lensRegNow(),P=ink.lens;
  if(reg===2)return [{rgb:'0,0,0',alpha:caps?.55:.45,dx:.6,dy:.6},{rgb:P.instr,alpha:caps?.95:.88,dx:0,dy:0}];
  if(reg===1)return [{rgb:P.glassDeep,alpha:.2,dx:.3,dy:.35},{rgb:P.inkBlack,alpha:caps?.92:.86,dx:0,dy:0}];
  return [{rgb:P.wash,alpha:caps?.2:.16,dx:.3,dy:.35},{rgb:P.ink,alpha:caps?.92:.84,dx:0,dy:0}];
}
// The score on the leaf: typed on a plate-jacket's label, and beneath it how far the optical catalogue has come.
function lensPaintEndNumerals(canvas,w){
  if(!canvas)return;const P=ink.lens,rec=lensRead(),Wd=240,Hd=80,dpr=Math.min(Math.max(window.devicePixelRatio||1,1.5),2);
  canvas.width=Math.ceil(Wd*dpr);canvas.height=Math.ceil(Hd*dpr);canvas.style.width=Wd+'px';canvas.style.height=Hd+'px';
  const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,Wd,Hd);
  g.fillStyle='rgba(236,226,200,.95)';g.fillRect(40,6,Wd-80,46);g.strokeStyle=`rgba(${P.inkBlack},.6)`;g.lineWidth=.8;g.strokeRect(40,6,Wd-80,46);
  g.strokeStyle=`rgba(${P.inkBlack},.18)`;g.lineWidth=.5;g.beginPath();g.moveTo(46,38);g.lineTo(Wd-46,38);g.stroke();
  lensTyped(g,String(w.score|0),Wd/2,24,26,P.inkBlack,.95,'center');lensTyped(g,'MAGNITUDE REACHED',Wd/2,45,8,P.inkRed,.9,'center');
  lensTyped(g,'LOG · '+lensBits(rec.worlds)+' / 7 WORLDS · '+lensBits(rec.fields)+' / 12 FIELDS',Wd/2,68,8,P.inkBlack,.85,'center');
}
// A landing's note and its running tally, set in the ink of the register they stand in, so a note carried up
// off the plate onto the sensor is read in the sensor's white and not left in iron-gall on black.
function lensNoteInk(ys){const reg=lensRegAtScreen(ys),P=ink.lens;return reg===2?P.instr:reg===1?P.inkBlack:P.ink;}
function lensNoteMark(x,y,left,hand,ys,alpha){const reg=lensRegAtScreen(ys),P=ink.lens;
  if(reg===0)manicule(x,y,left?1:-1,hand,P.ink,alpha);
  else if(reg===1){ctx.strokeStyle=`rgba(${P.inkRed},${alpha})`;lensLoop(ctx,x,y+hand*.6,hand*.7,7,1,.9);}
  else{ctx.strokeStyle=`rgba(${P.cyan},${alpha})`;ctx.lineWidth=.9;ctx.strokeRect(x-hand*.55,y,hand*1.1,hand*1.1);}}
function lensFloater(f,fb,alpha){
  if(!fb)return null;const size=Math.max(11,13*scale),hand=Math.max(4.5,6*scale),{x,y,left}=fb;
  ctx.fillStyle=`rgba(${lensNoteInk(y)},${alpha})`;ctx.font=plateFace(size,'text','italic');ctx.textAlign=left?'left':'right';ctx.fillText(f.text,x,y);
  lensNoteMark(x+(left?-hand*1.5:hand*1.5),y-hand*.62,left,hand,y,alpha*.85);
}
function lensTally(t,tb,alpha){
  const size=Math.max(11,13*scale),size2=Math.max(9.5,11*scale),hand=Math.max(4.5,6*scale);
  ctx.fillStyle=`rgba(${lensNoteInk(tb.y)},${alpha})`;ctx.font=plateFace(size,'text','italic');ctx.textAlign=t.left?'left':'right';ctx.fillText(t.line1,tb.x,tb.y);
  ctx.font=plateFace(size2,'text','italic');ctx.fillText(t.line2,tb.x,tb.y+size*.98);
  lensNoteMark(tb.x+(t.left?-hand*1.5:hand*1.5),tb.y-hand*.62,t.left,hand,tb.y,alpha*.85);
}
function lensNone(){}
function invalidateLensArt(){lensTiles[0]=lensTiles[1]=lensTiles[2]=null;lensTileKey='';lensSprites.clear();lensSaturnArts.clear();lensBodyArts.clear();lensScopes[0]=lensScopes[1]=lensScopes[2]=null;lensScopeKey='';lensHudTopPx=null;lensRevealCanvas=null;lensRevealKey='';}
// Entering the era asks for its three faces and repaints the cached art when they land, since a face arriving
// late would otherwise leave its fallback baked into the title and the sprites.
function lensFaceReady(){
  if(!document.fonts||!document.fonts.load)return;
  Promise.all([document.fonts.load(plateFace(16,'text'),'Lens'),document.fonts.load(plateFace(16,'sc'),'LENS'),document.fonts.load(plateFace(16,'typed'),'PLATE'),document.fonts.load(plateFace(16,'mono'),'SIMPLE'),document.fonts.load(plateFace(16,'grot'),'FIELD'),document.fonts.load(plateFace(16,'jacket'),'PARIS')])
    .then(()=>{invalidateLensArt();if(world)render(0);}).catch(()=>{});
}

// ---------- The instrument's sound, in three registers ----------
// The eyepiece keeps era V's own voice: a burin's scratch, a rising chime on a capture, a brush-flick on a
// clean transfer. The plate breaks it: a shutter's clack opening an exposure and a softer one closing it, the
// swish of a tray for the develop-in, the blink comparator's quick clicks, a crack of glass for a loss. The
// sensor replaces all of it with instrument sound: a two-tone chime for guide-star lock, a dry shutter click,
// a readout's short falling whine, and a klaxon for a loss (06-lens.md, "Sound").
const LENS_SCALE=[196,220,246.94,293.66,329.63,392,440,493.88,587.33,659.25,783.99,880];
function lensClack(a,soft=false){a.brush(soft?1800:2600,soft?.12:.2);a.tone(soft?140:180,.05,0,soft?.1:.16,'square',90);}
defineHand('lens',{
  transition:lensTransition,
  atmosphere:lensAtmosphere,
  node:lensNode,
  hazard:lensHazard,
  player:lensPlayer,
  dark:lensDark,
  plateFrame:lensNone,
  laid:lensNone,
  figure:lensFigure,
  surveys:lensNone,
  hudLeaf:lensHudLeaf,
  runningHead:lensNone,
  chapterReveal:lensChapterReveal,
  flourish:lensFlourish,
  trail:lensTrail,
  aim:lensAim,
  inkPath:lensInkPath,
  inscriptionInk:lensInscriptionInk,
  lenses:lensNone,
  hazardReveal:lensHazardReveal,
  ready:lensFaceReady,
  best:lensBest,
  caveRun:lensRecordRun,
  caveAnimal:i=>lensNoteField(i),
  chartRoute:lensChartRoute,
  floater:lensFloater,
  tally:lensTally,
  endNumerals:lensPaintEndNumerals,
  scratch:{band:[3200,1800],q:[1.6,1.4],peak:.045,attack:.002,dur:[.016,.03],gap:[.03,.05],ease:.015},
  start(a){a.tone(392,1.4,0,.18);a.tone(587.33,1.2,.14,.12);a.tone(783.99,1,.28,.08);a.brush(5200,.08);},
  release(a){const r=lensRegNow();if(r===0){a.tone(1318.51,.35,0,.07,'sine',1250);a.brush(4400,.08);}else if(r===1)lensClack(a,true);else{a.tone(2093,.03,0,.08,'square');a.brush(7000,.05);}},
  capture(a,row,perfect){const r=lensRegNow(),n=LENS_SCALE[3+Math.floor(row)%6];
    if(r===0){a.brush(6000,.14);a.tone(n*2,.5,0,.18);if(perfect)a.tone(n*3,.5,.08,.1);}
    else if(r===1){lensClack(a);a.wash(900,260,.45,.12,.05);if(perfect)setTimeout(()=>a.brush(3200,.1),90);}
    else{a.tone(880,.14,0,.12);a.tone(1318.51,.22,.12,.12);if(perfect)a.tone(1760,.2,.26,.07);a.tone(2400,.35,.05,.03,'sine',900);}},
  graze(a){const r=lensRegNow();if(r===2)a.tone(620,.16,0,.08,'square',560);else{a.brush(2400,.12);a.tone(740,.12,0,.05,'sine',700);}},
  death(a){const r=lensRegNow();if(r===0){a.tone(110,1,0,.35,'triangle',72);a.wash(700,120,.9,.2);}
    else if(r===1){a.brush(5200,.3);a.brush(3600,.22);setTimeout(()=>a.brush(6400,.18),60);a.tone(98,.8,0,.2,'triangle',60);}
    else{for(let i=0;i<3;i++)a.tone(i%2?520:390,.22,i*.24,.14,'square');}},
  medal(a){const r=lensRegNow();if(r===1){for(let i=0;i<6;i++)setTimeout(()=>a.tone(1600,.02,0,.08,'square'),i*330);a.tone(523.25,1.2,.1,.12);}
    else if(r===2){a.tone(1760,.5,0,.08,'sine',440);a.tone(659.25,1.2,.2,.12);}
    else{for(let i=0;i<4;i++)setTimeout(()=>a.brush(900+i*140,.1),i*70);a.tone(523.25,1.3,.1,.15);a.tone(783.99,1.2,.24,.11);}},
  chapter(a,i){lensNoteChapter(i);const r=LENS_CHAPTERS[clamp(i,0,5)].reg;if(r===1){lensClack(a);a.wash(1200,300,.8,.12,.1);}else if(r===2){a.tone(880,.18,0,.12);a.tone(1318.51,.3,.16,.12);}
    a.tone(392,1.8,.1,.16);a.tone(LENS_SCALE[6+i%5],1.6,.35,.12);},
  dawn(a){lensNoteChapter(LENS_CHAPTERS.length-1);a.tone(98,3,0,.14,'triangle');LENS_SCALE.forEach((f,i)=>a.tone(f*2,1.6,.12+i*.09,.12));setTimeout(()=>{a.tone(783.99,2.4,0,.13);a.tone(1174.66,2.2,.1,.08);},1300);}
});

// ---------- The vocabulary: only what this era calls differently ----------
// The era keeps one word for its currency through all three institutions, exposure; the score is the
// magnitude a run reaches; a constellation is a field, resolved; a chapter is a plate; the boundary is the fog.
// Names from 06-lens.md, "Names", set in English where a player reads them and in the Fell's Latin on the sheet.
defineVoice('lens',{
  chart:'FIELD',
  chartNoun:'field',
  chartVerb:'resolved',
  chartNames:LENS_FIELDS.map(f=>f[0]+' · '+f[1]),
  chartSaid:'{chart} is resolved. Sixty toward the magnitude. The fog holds back for four seconds.',
  chapters:LENS_CHAPTERS.map(c=>c.place+' · '+c.year),
  chapterRows:LENS_CHAPTER_ROWS,
  goalRow:LENS_GOAL_ROW,
  // The rows past which the sheet changes medium under the run (lensTransition, above).
  transitionRows:[LENS_REG_ROWS,LENS_REG_ROWS*2],
  // The three registers the sheet climbs through are the Journey's milestones, not the six chapters in them.
  milestones:['AT THE EYEPIECE','ON THE GLASS PLATE','OFF THE SENSOR'],
  chapterSaid:'Plate {numeral}. {name}.',
  // A line for each place as its chapter opens, set on the sheet as a curator's note beside the telescope.
  // Each says only what is known of the place and the work it is named for.
  chapterLines:[
    'Padua, 1610. Galileo turns a tube of two lenses on the sky: mountains on the Moon, and Saturn with two companions.',
    'The Hague, 1659. Huygens, with a sharper lens, reads Saturn’s two companions as one thin flat ring touching nowhere.',
    'Paris, 1887. Twenty observatories agree to photograph the whole sky on matched glass plates, each printed with a grid.',
    'Meudon, 1909. Antoniadi, at a great refractor, watches the canals of Mars break up into irregular patches.',
    'Tucson, 1981. A picture is written down as a header of plain cards and a table of numbers: the FITS standard.',
    'Cape Canaveral, 1990. A telescope is carried above the air. Its mirror, it turns out, was ground a hair too flat.'
  ],
  // A note for each field as it is resolved: one thing its record still carries.
  chartNotes:[
    'Galileo drew the Pleiades with thirty more stars than the eye alone can find.',
    'Galileo found the cloudy Praesepe to be a crowd of some forty small stars.',
    'Huygens drew the Orion Nebula in 1656: a cloud with stars inside it.',
    'Isaac Roberts photographed Andromeda in 1888 and showed it was a spiral.',
    'Lord Rosse drew the Whirlpool as a spiral in 1845, by eye, at a six-foot mirror.',
    'Rosse drew M 1 with claws in 1844, and the name Crab stuck.',
    'Williamina Fleming found the Horsehead on a Harvard plate in 1888.',
    'Barnard photographed the dark patches and argued that some were clouds of dust, not gaps.',
    'Halley came across the Hercules cluster in 1714.',
    'Darquier found the Ring Nebula in 1779 and likened it to a fading planet.',
    'On the Carte du Ciel, each star was measured against the printed grid, not against its neighbours.',
    'Albireo splits in a small telescope into a gold star and a blue one.'
  ],
  opening:'The tube is raised. Tap to release. Follow the guide to the next light. Hold a light until it resolves into a surface, and to take up more exposure; every flight spends exposure by the distance it carries. Carry the lens from Padua to 1990.',
  ended:'The fog has taken the plate. Magnitude {score}. Tap to raise the tube again, or return to the atlas.',
  won:'Saturn is resolved three times over. 1990, magnitude {score}. Tap to begin again or return to the atlas.',
  unrecorded:'ERA PREVIEW · NOT RECORDED',
  newRecord:'A NEW MAGNITUDE',
  hazards:{vortex:'THE EMULSION VOID',flare:'HALATION',wind:'TRACKING DRIFT'},
  labels:{shield:'THE DEW-CAP',reflector:'THE FINDER’S MIRROR',dawn:'THE OPEN SHUTTER'},
  pressures:{relaxed:'LUNA · THE MOON',classic:'SATURN',hardcore:'A NEBULA'},
  pressureSet:'THE TUBE IS TRAINED · {label}',
  losses:{
    'THE DARK CAUGHT UP':'THE FOG TOOK THE PLATE',
    'LEFT THE STAR CHART':'OUT OF THE FIELD OF VIEW',
    'THE ORBIT FADED':'THE LIGHT FELL BELOW THE PLATE’S LIMIT',
    'THE NIB RAN DRY':'THE EXPOSURE RAN OUT',
    'DRAWN INTO A VORTEX':'LOST IN THE EMULSION VOID',
    'SEARED BY A SUNSPOT FLARE':'BURNED OUT BY HALATION',
    'THE SUN ROSE':'SATURN IS RESOLVED'
  },
  observations:{
    perfectThree:'THREE CLEAN ACQUISITIONS',
    skipFive:'FIVE LIGHTS PASSED OVER',
    maxSpeed:'THE TUBE AT FULL SLEW',
    graze:'THE VOID GRAZED AT FULL SLEW',
    pureChart:'A FIELD IN CLEAN ACQUISITIONS',
    fortyRows:'THE FORTIETH ROW',
    threeMinutes:'THREE MINUTES AT THE EYEPIECE',
    rightAngle:'A SQUARE ACQUISITION'
  },
  squareLanding:'A SQUARE ACQUISITION',
  hud:{pace:'SLEW ×',flow:'LOCK ×',shield:'THE DEW-CAP HELD',reflector:'THE MIRROR HELD',dawn:'THE SHUTTER HELD'},
  chrome:{
    brand:'THE LENS',bestLabel:'Deepest magnitude',endTitle:'The fog has taken the plate.',endTitleWon:'Saturn is resolved.',pauseTitle:'The dome is closed.',
    pauseEyebrow:'THE CLOCK DRIVE IS STOPPED',pauseNote:'Tap the sheet to continue',pauseResume:'OPEN THE SHUTTER',
    pauseLeave:'CAP THE LENS',pauseLabel:'Close the dome',gameLabel:'The Lens, a playable Era VI preview',
    canvasLabel:'The Lens. Guide a telescope from Padua in 1610 to a telescope above the air in 1990, resolving each light you hold into a surface. Tap or press Space to release.',
    eraExit:'BACK TO THE ATLAS',eraExitLabel:'Back to the atlas',endAction:'Tap to raise the tube again',endActionWon:'Tap to begin again',
    statCaptures:'Resolved',statPerfects:'Clean',statFlow:'Best lock',statRow:'Row',
    instructions:{head:'THE MANNER OF OBSERVING',rules:['Tap to release the telescope.','Hold a light until it resolves into a surface.','Keep ahead of the fog rising below.','From the eyepiece to the plate to the sensor, six places. Choose the first light — {pressures}.']}
  },
  tips:{
    first:'Release when the guide reaches the next light.',
    dark:'Hold a light for slew and exposure. The fog rises faster below.',
    faded:'A faint light falls below the plate’s limit. Resolve it and move on.',
    vortex:'The emulsion void pulls a flight toward it. Give it room.',
    angle:'Meet the rim along its curve for a clean acquisition.',
    speed:'Clean acquisitions keep your slew.',
    won:'Three registers, one planet, and the question answered three times.'
  },
  glosses:{
    slingshot:'THE SCREW RUN ONE TURN · SLEW ×{factor}',
    maxSpeed:'FULL SLEW · HOLD THE LINE',
    fullCharge:'A FRESH PLATE · SLEW IS YOURS',
    rough:'A ROUGH ACQUISITION · BASE {base}',
    skip:'{count} LIGHT{plural} PASSED OVER · +{bonus}',
    reprieve:'RESOLVE 3 LIGHTS · +60 & A REPRIEVE',
    slingOrbit:'CIRCLE TO RUN THE SCREW · TAP TO LEAVE',
    fading:'A FAINT LIGHT · KEEP MOVING',
    golden:'A COMET, FOUND BY CHANCE',
    perfectFlow:'CLEAN ACQUISITION · LOCK ×{combo}',
    perfect:'CLEAN ACQUISITION',
    wandering:'A WANDERING LIGHT',
    chartProgress:'{chart} · {count} / 3',
    chartComplete:'{chart} · RESOLVED +60',
    angleBonus:'  ·  TRUE ENTRY +{bonus}',
    multiplier:'  ·  ×{mult}',
    shieldArmed:'{label} · TURNS ONE BLOW',
    shieldBreak:'{label} SPENT · TOOK THE HIT',
    reflectorArmed:'{label} · SENDS YOU BACK FROM THE EDGE',
    reflectorBreak:'{label} TURNED YOU BACK',
    dawnArmed:'{label} · HOLDS THE FOG BACK',
    dawnBreak:'{label} PUSHED THE FOG BACK',
    inkwellFound:'A BOX OF FRESH PLATES',
    inkwellDry:'THE EXPOSURE RUNS LOW · TAKE A FRESH PLATE',
    observation:'RESOLVED · {name}',
    close:'CLOSE +5'
  },
  held:{
    choose:'The first light you hold sets how fast the fog rises.',
    dry:'The exposure is running low. Hold this light to take up more.',
    sling:'One circle runs the screw a turn. Meet the next cleanly and it holds.',
    release:'Release when the guide meets the next light.',
    bend:'The void bends the course. Follow the guide; give it room.'
  }
});

// The Journey's milestones through the lens (LINKING.md): Saturn, resolved as far as the climb has taken
// it — Galileo's three bodies before the eyepiece is known, Huygens's ring once it is, the glass plate's and
// the sensor's after — with the three registers pricked beneath it, filled as each is known.
defineHand('lens',{journeyMark(g,w,h,m){
  const P=ink.lens,stage=[1,2,4,6][Math.min(3,m.open)],R=Math.min(15,h*.2);
  g.save();g.translate(w/2,h*.42);lensSaturn(g,R,stage,1,{card:false});g.restore();
  for(let i=0;i<m.of;i++){const x=w/2+(i-(m.of-1)/2)*14,y=h-7;g.save();g.strokeStyle=`rgb(${P.ink})`;g.lineWidth=.8;g.beginPath();g.arc(x,y,2.6,0,TAU);g.stroke();
    const f=i<m.open?1:i===m.open?m.toward:0;if(f>0){g.fillStyle=`rgb(${P.inkRed})`;g.beginPath();g.moveTo(x,y);g.arc(x,y,2.6,-Math.PI/2,-Math.PI/2+TAU*f);g.closePath();g.fill();}g.restore();}
}});
