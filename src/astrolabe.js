'use strict';
/* Orbit · src/astrolabe.js
   Era IV, The Astrolabe: the sky measured through an instrument, after the Islamic Golden Age's own
   brass — the Nastūlus astrolabe (Baghdad, 927–928 CE), al-Ṣūfī's Book of the Fixed Stars (964 CE), the
   Valencia globe (1085 CE) — and closed by Ulugh Beg's Zīj-i Sulṭānī (Samarkand, 1437 CE). */
// Like the Scroll and the Rock, this era is a hand and not a fork: a set of painters registered by name
// in `defineHand` below, reached by frame.js wherever it would otherwise draw the atlas's own, with
// everything it does not name still the atlas's. docs/archive/eras/04-astrolabe.md is what the era is.
// None of the physics comes with it; the simulation is and stays OrbitWorld.
//
// What the sheet argues, in one line: a light is not a picture and not a name but a number anyone holding
// the same instrument could read again. The sheet leads with engraved brass — a graduated limb down both
// edges, an alidade for the traveller, a rete of star-pointers for a finished figure — and keeps the
// manuscript page only as the ground the geometry is constructed on, in the hand of Ibn al-Haytham's
// optics. A body starts as an unadorned punched point; holding its orbit strikes a scale round it, sparse,
// then thick, then closed and gilt, with its greatness (qadr) cut beside it in abjad numerals.
//
// It is also the one sheet after the Ceiling that can be won, and the first that tells a story as it goes:
// six chapters, one to each of the places the instrument was made and read — Baghdad, Isfahan, Cairo,
// Valencia, Marāgha, Samarkand — and at each chapter's opening the astrolabe behind the sheet gains the part
// that place gave it, until at Samarkand the instrument is whole and the Zīj is finished. What a player has
// assembled is kept across runs under its own key (orbit.astrolabe.v1), so the frontispiece shows the
// instrument as far as it has ever been built.

// ---------- The metals and the page ----------
// Working brass, its polished high light, the bare cut groove and the patina pooled in it, gilt, a rare
// silver; and for the demoted manuscript page, lapis, vermilion, sized cream paper and lamp-black. The
// brass rows are judged, not measured (04-astrolabe.md, "Palette"); the manuscript rows are carried forward.
definePlate('astro',{
  night:{brass:'138,110,62',brassHi:'201,162,74',brassLo:'96,74,38',groove:'42,34,22',patina:'74,59,34',gilt:'212,175,55',giltDeep:'160,122,36',silver:'199,196,184',
    lapis:'27,63,143',verm:'196,58,44',paper:'239,225,196',paperDeep:'222,202,160',ink:'36,28,17',inkSoft:'92,74,50',faded:'150,128,92',verdigris:'62,98,78',tarnish:'28,23,15',core:'255,247,220'},
  paper:{brass:'138,110,62',brassHi:'201,162,74',brassLo:'96,74,38',groove:'42,34,22',patina:'74,59,34',gilt:'212,175,55',giltDeep:'160,122,36',silver:'199,196,184',
    lapis:'27,63,143',verm:'196,58,44',paper:'239,225,196',paperDeep:'222,202,160',ink:'36,28,17',inkSoft:'92,74,50',faded:'150,128,92',verdigris:'62,98,78',tarnish:'28,23,15',core:'255,247,220'}
});

// ---------- The tunable rows ----------
// The opening triad, as on the other eras: the Moon for Tiro, a bright star for Adeptus, a faint one for
// Magister. And the two radii a body is sorted by into three classes of disc.
const ASTRO_TRIAD={relaxed:'moon',classic:'bright',hardcore:'faint'};
const ASTRO_TIER_BRIGHT=34,ASTRO_TIER_MAJOR=46;
function astroTier(n){
  if(n.difficultyChoice)return ASTRO_TRIAD[n.difficultyChoice];
  return n.r>=ASTRO_TIER_MAJOR?'major':n.r>=ASTRO_TIER_BRIGHT?'bright':'faint';
}
// A body's greatness, al-Ṣūfī's qadr, one to six from the brightest, cut beside its closed scale in abjad. It
// is read off the same naked-eye grading the atlas gives its figures' stars (renaissanceStarProfile, in
// simulation.js) rather than off a body's size: the chart deals almost every plain orbit wider than any
// threshold a size could be graded by, so a qadr read off the radius was the first greatness on nearly every
// body, and a number that is always the same has measured nothing. A figure's star keeps the grade the chart
// already gave it; every other body is graded off its own seed, so one seed grades the same sheet every time.
const astroQadr=n=>n.magnitude||renaissanceStarProfile(n.seed|0,0).magnitude;
// The disc a finished measurement nests, sized to that greatness: the brightest the largest.
const ASTRO_QADR_DISC=[4.6,4.1,3.6,3.2,2.8,2.5];
// Where the measurement's three stages fall on the observation clock `d` (revealNode's pen.d, 0 to 1 over
// the 240° that completes an observation): by a quarter-turn a sparse scale, by half a turn the scale all
// but struck, by two thirds of a turn the arc closed and gilt and the qadr lettered — 04-astrolabe.md's
// own order, "The bodies".
const ASTRO_STAGE={sweep:[0,.375],struck:[.375,.75],closed:[.75,1]};
const astroSpan=(t,r)=>clamp((t-r[0])/(r[1]-r[0]),0,1);
const astroEase=t=>t*t*(3-2*t);
// World units to one degree of the climb: the limb down each side of the sheet counts it.
const ASTRO_DEG=12;

// ---------- The story: six places, six parts of one instrument ----------
// Six rows to a chapter and thirty-six to the finish, the same length the Ceiling's night was measured to
// (scripts/probe.mjs; docs/CEILING-OVERHAUL.md): short enough that a practised hand reaches Samarkand in a
// fair share of runs, long enough that most do not. Each place gives the instrument the part it is
// remembered for, in the order a real astrolabe is actually built — mater, limb, plate, rete, pointers,
// rule. The mapping of part to place is this sheet's own telling, not a claim about any one workshop.
const ASTRO_CHAPTER_ROWS=6;
const ASTRO_CHAPTERS=[
  {ar:'بغداد',en:'BAGHDAD',year:927,part:'THE MATER IS CAST'},
  {ar:'أصفهان',en:'ISFAHAN',year:964,part:'THE LIMB IS DIVIDED'},
  {ar:'القاهرة',en:'CAIRO',year:1027,part:'THE PLATE IS CONSTRUCTED'},
  {ar:'بلنسية',en:'VALENCIA',year:1085,part:'THE RETE IS PIERCED'},
  {ar:'مراغة',en:'MARAGHA',year:1259,part:'THE STARS ARE SET'},
  {ar:'سمرقند',en:'SAMARKAND',year:1428,part:'THE RULE IS LAID'}
];
const ASTRO_GOAL_ROW=ASTRO_CHAPTERS.length*ASTRO_CHAPTER_ROWS;
// Abjad: the twenty-eight letters, each with a fixed value — the numerals a real limb is graduated in.
const ASTRO_ABJAD=[[1000,'غ'],[900,'ظ'],[800,'ض'],[700,'ذ'],[600,'خ'],[500,'ث'],[400,'ت'],[300,'ش'],[200,'ر'],[100,'ق'],[90,'ص'],[80,'ف'],[70,'ع'],[60,'س'],
  [50,'ن'],[40,'م'],[30,'ل'],[20,'ك'],[10,'ي'],[9,'ط'],[8,'ح'],[7,'ز'],[6,'و'],[5,'ه'],[4,'د'],[3,'ج'],[2,'ب'],[1,'ا']];
function astroAbjad(n){let o='';n=Math.max(0,n|0);for(const[v,c]of ASTRO_ABJAD)while(n>=v){o+=c;n-=v;}return o;}
// The manuscript's own digits, the Eastern Arabic-Indic set al-Ṣūfī's tables were written in. Prose sets
// these; engraved graduation sets abjad: the numerals split by surface, not by convention.
const astroDigits=n=>String(Math.max(0,n|0)).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
// The twelve signs of the zodiac as the ecliptic ring of an astrolabe names them, one to every thirty
// degrees of the limb.
const ASTRO_SIGNS=['الحمل','الثور','الجوزاء','السرطان','الأسد','السنبلة','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'];
// The twelve figures of the catalogue, as al-Ṣūfī names them.
const ASTRO_FIGURES=[['الدب الأكبر','THE GREATER BEAR'],['الجبار','THE GIANT'],['الأسد','THE LION'],['العقرب','THE SCORPION'],['الثور','THE BULL'],['الدجاجة','THE HEN'],
  ['الشجاع','THE BRAVE ONE'],['الفرس الأعظم','THE GREATER HORSE'],['المرأة المسلسلة','THE CHAINED WOMAN'],['السلياق','THE LYRE'],['العقاب','THE EAGLE'],['ذات الكرسي','SHE OF THE THRONE']];
// The star names the rete's pointers carry: Arabic names still read, most of them, in the Latin the atlas
// inherited. Rigel, the Giant's foot, is always the first a run names, after the signature sheet in the era file.
const ASTRO_STARS=[['رجل الجبار','RIGEL · THE GIANT’S FOOT'],['منكب الجوزاء','BETELGEUSE · THE SHOULDER'],['الدبران','ALDEBARAN · THE FOLLOWER'],['العيوق','CAPELLA'],
  ['النسر الواقع','VEGA · THE SWOOPING EAGLE'],['النسر الطائر','ALTAIR · THE FLYING EAGLE'],['قلب الأسد','REGULUS · THE LION’S HEART'],['السماك الرامح','ARCTURUS'],
  ['الشعرى','SIRIUS'],['السماك الأعزل','SPICA'],['ذنب الدجاجة','DENEB · THE HEN’S TAIL'],['الفرد','ALPHARD · THE SOLITARY']];
// The five wandering stars (kawkab sayyār), in the order of their spheres from Saturn inward, as a zīj
// tabulates them: named in full wherever one is sighted, since each is one body and not one of a class.
const ASTRO_PLANETS=[['زحل','SATURN'],['المشتري','JUPITER'],['المريخ','MARS'],['الزهرة','VENUS'],['عطارد','MERCURY']];
// Ibn al-Haytham's own lettering for the vertices of a construction: abjad order, as his diagrams letter them.
const ASTRO_VERTICES=['ا','ب','ج','د','ه','ز','ح','ط','ي','ك','ل','م'];

// ---------- Small tools ----------
function astroHash(a,b=0,c=0){let h=Math.imul((a|0)^0x9E3779B1,0x85EBCA77)^Math.imul((b|0)+0x27d4eb2f,0xC2B2AE3D)^Math.imul((c|0)+0x165667b1,0x27D4EB2F);h=Math.imul(h^(h>>>15),0x2C1B3C6D);h^=h>>>13;h=Math.imul(h,0x297A2D39);h^=h>>>16;return (h>>>0)/4294967296;}
function astroNoise(x,y,seed,period){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=q=>((q%period)+period)%period;
  const h=(i,j)=>astroHash(i,w(j),seed);return lerp(lerp(h(xi,yi),h(xi+1,yi),u),lerp(h(xi,yi+1),h(xi+1,yi+1),u),v)*2-1;}
function astroFbm(x,y,cell,oct,seed,tileH){let a=0,m=.5,c=cell;for(let i=0;i<oct;i++){a+=astroNoise(x/c,y/c,seed+i*17,Math.round(tileH/c))*m;m*=.5;c/=2;}return a;}
// Naskh, set right to left in Amiri; the browser shapes the joins. Bold is the heavier cut, for titles.
// `halo` sets the lettering the way an engraver letters over ruled work: the lines it crosses are
// burnished back to the paper for a hair round every stroke, so a name laid over its own orbit still reads.
function astroNaskh(g,str,x,y,size,rgb,alpha,align='center',bold=false,halo=false){
  if(alpha<=0)return;g.save();g.font=plateFace(size,bold?'naskhB':'naskh');g.direction='rtl';g.textAlign=align;g.textBaseline='middle';
  if(halo)astroHalo(g,str,x,y,size,alpha);g.fillStyle=`rgba(${rgb},${alpha})`;g.fillText(str,x,y);g.restore();
}
// The curator's English beside it, in the slab the other eras use.
function astroGloss(g,str,x,y,size,rgb,alpha,align='center',halo=false){
  if(alpha<=0)return;g.save();g.font=plateFace(size,'sc');g.direction='ltr';g.textAlign=align;g.textBaseline='middle';
  if(halo)astroHalo(g,str,x,y,size,alpha);g.fillStyle=`rgba(${rgb},${alpha})`;g.fillText(str,x,y);g.restore();
}
function astroHalo(g,str,x,y,size,alpha){g.strokeStyle=`rgba(${ink.astro.paper},${(.92*alpha).toFixed(3)})`;g.lineWidth=Math.max(2.5,size*.34);g.lineJoin='round';g.strokeText(str,x,y);}
// A line cut into brass: the groove itself dark, and a hair of burr beside it catching the light, offset
// down and right the way a lit groove's lower lip shows. `path` builds the path; it is stroked twice.
function astroGroove(g,path,w,alpha=1,rgb){
  const P=ink.astro;g.save();g.lineCap='round';g.lineJoin='round';
  g.translate(.35,.45);g.strokeStyle=`rgba(${P.brassHi},${(.55*alpha).toFixed(3)})`;g.lineWidth=w*.8;g.beginPath();path();g.stroke();
  g.translate(-.35,-.45);g.strokeStyle=`rgba(${rgb||P.groove},${(.9*alpha).toFixed(3)})`;g.lineWidth=w;g.beginPath();path();g.stroke();g.restore();
}
// Set while the instrument is drawn as a construction on the page rather than as metal (a chapter's
// opening): every brass surface is left unfilled and only the cut lines stand, in ink.
let astroGhost=false;
// Brass as a surface: brightest where light and handling concentrate, darkest where neither reaches.
function astroBrass(g,x0,y0,x1,y1,hi=1){
  if(astroGhost)return 'rgba(0,0,0,0)';
  const P=ink.astro,gr=g.createLinearGradient(x0,y0,x1,y1);
  gr.addColorStop(0,`rgb(${mixRgb(P.brass.split(',').map(Number),P.brassHi.split(',').map(Number),.7*hi)})`);gr.addColorStop(.45,`rgb(${P.brass})`);gr.addColorStop(1,`rgb(${P.brassLo})`);return gr;
}
// An eight-pointed star, two squares turned on each other: the khātam the brass is tooled with.
function astroKhatam(g,x,y,r,fill,stroke,lw=.5){
  g.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU-Math.PI/2,rr=i%2?r*.72:r;i?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();
  if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke();}
}
// A star-pointer on the rete: a flame-shaped blade from a root on the strap to a tip exactly on the star,
// the one place on an openwork rete a position is read from.
function astroPointer(g,tx,ty,rx,ry,w,fillRgb,alpha=1){
  const dx=tx-rx,dy=ty-ry,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,P=ink.astro;
  g.save();g.globalAlpha*=alpha;g.beginPath();g.moveTo(rx+nx*w,ry+ny*w);
  g.bezierCurveTo(rx+ux*L*.35+nx*w*1.3,ry+uy*L*.35+ny*w*1.3,rx+ux*L*.7+nx*w*.2,ry+uy*L*.7+ny*w*.2,tx,ty);
  g.bezierCurveTo(rx+ux*L*.6-nx*w*.9,ry+uy*L*.6-ny*w*.9,rx+ux*L*.3-nx*w*.1,ry+uy*L*.3-ny*w*.1,rx+ux*L*.18-nx*w*1.1,ry+uy*L*.18-ny*w*1.1);
  g.quadraticCurveTo(rx-nx*w*.4,ry-ny*w*.4,rx+nx*w,ry+ny*w);g.closePath();
  g.fillStyle=astroGhost?'rgba(0,0,0,0)':`rgb(${fillRgb})`;g.fill();g.strokeStyle=`rgba(${P.groove},.85)`;g.lineWidth=Math.max(.35,w*.22);g.stroke();g.restore();
}

// ---------- The instrument: the astrolabe assembling, part by part ----------
// One function draws the whole astrolabe at any radius, from the bare mater to the finished instrument,
// so the frontispiece, a chapter's opening and the finale are the same object at different stages. `parts`
// is how many of the six are on it (1 to 6); the last of them is being cut when `fresh` < 1, under a
// sector swept round from the top the way an engraver works round a limb. `rot` turns the rete and the
// rule on the pin; `gilt` 0–1 picks out the finished instrument in gold. The plate is stereographic for a
// latitude of 33°, Baghdad's, which is what any astrolabe made there would have carried.
const ASTRO_OBLIQ=23.44*Math.PI/180,ASTRO_LAT=33.3*Math.PI/180;
// The rete's named stars at their real right ascension and declination (J2000, rounded): a rete is a star
// map, and pointers set anywhere else would be decoration.
const ASTRO_RETE=[[78.6,-8.2,0],[88.8,7.4,1],[69,16.5,2],[79.2,46,3],[279.2,38.8,4],[297.7,8.9,5],[152.1,12,6],[213.9,19.2,7],[101.3,-16.7,8],[201.3,-11.2,9],[310.4,45.3,10],[141.9,-8.7,11]];
function astroInstrument(g,R,parts,fresh=1,rot=0,gilt=0,opts={}){
  astroGhost=!!opts.ghost;try{astroInstrumentCut(g,R,parts,fresh,rot,gilt,opts);}finally{astroGhost=false;}
}
function astroInstrumentCut(g,R,parts,fresh,rot,gilt,opts){
  const P=ink.astro,rim=R*.13,rc=R-rim,k=rc/Math.tan((Math.PI/2+ASTRO_OBLIQ)/2),dr=d=>k*Math.tan((Math.PI/2-d)/2),big=R>=70;
  const reveal=(i,draw)=>{if(i>=parts)return;if(i<parts-1||fresh>=1){draw();return;}
    g.save();g.beginPath();g.moveTo(0,0);g.arc(0,0,R*1.6,-Math.PI/2,-Math.PI/2+TAU*fresh);g.closePath();g.clip();draw();g.restore();
    if(fresh>0){const a=-Math.PI/2+TAU*fresh;g.save();g.strokeStyle=`rgba(${P.gilt},.9)`;g.lineWidth=Math.max(.8,R*.012);g.beginPath();g.moveTo(Math.cos(a)*R*.08,Math.sin(a)*R*.08);g.lineTo(Math.cos(a)*R*1.02,Math.sin(a)*R*1.02);g.stroke();g.restore();}};
  const lw=Math.max(.4,R*.006);
  // The mater: the throne, its shackle and ring, and the disc with its raised rim, cast and not yet cut.
  {const tw=R*.34,th=R*.2,ty=-R-th*.72;
    g.save();g.beginPath();g.arc(0,ty-th*.55,R*.075,0,TAU);g.lineWidth=Math.max(1,R*.022);g.strokeStyle=`rgb(${P.brassLo})`;g.stroke();g.strokeStyle=`rgba(${P.brassHi},.8)`;g.lineWidth=Math.max(.5,R*.01);g.stroke();
    g.beginPath();g.ellipse(0,ty-th*.02,R*.03,R*.06,0,0,TAU);g.stroke();
    g.beginPath();g.moveTo(-tw*.5,-R+rim*.3);g.bezierCurveTo(-tw*.62,ty+th*.1,-tw*.28,ty-th*.2,0,ty-th*.18);g.bezierCurveTo(tw*.28,ty-th*.2,tw*.62,ty+th*.1,tw*.5,-R+rim*.3);g.closePath();
    g.fillStyle=astroBrass(g,-tw,ty-th,tw,-R,1.1);g.fill();g.strokeStyle=`rgba(${P.groove},.85)`;g.lineWidth=lw*1.4;g.stroke();
    // A trefoil pierced through the throne, as the openwork thrones are.
    g.fillStyle=`rgba(${P.tarnish},${astroGhost?.3:.75})`;for(const [ox,oy,rr] of [[0,-.02,.05],[-.075,.045,.036],[.075,.045,.036]]){g.beginPath();g.arc(ox*R,ty+th*.3+oy*R,rr*R,0,TAU);g.fill();}
    g.restore();
    g.save();g.beginPath();g.arc(0,0,R,0,TAU);g.fillStyle=astroBrass(g,-R,-R,R,R);g.fill();
    g.strokeStyle=`rgba(${P.groove},.9)`;g.lineWidth=lw*1.6;g.stroke();
    g.beginPath();g.arc(0,0,rc,0,TAU);g.lineWidth=lw*1.3;g.stroke();
    if(!astroGhost){const well=g.createRadialGradient(-rc*.3,-rc*.35,rc*.1,0,0,rc);well.addColorStop(0,`rgba(${P.brassHi},.28)`);well.addColorStop(1,`rgba(${P.patina},.4)`);
    g.fillStyle=well;g.beginPath();g.arc(0,0,rc,0,TAU);g.fill();}g.restore();}
  // The limb: a degree scale round the rim, a longer stroke every five and ten, and abjad every thirty.
  reveal(1,()=>{g.save();g.lineCap='butt';
    for(let d=0;d<360;d+=big?1:2){const a=-Math.PI/2+d/360*TAU,L=d%10===0?rim*.62:d%5===0?rim*.42:rim*.26,c=Math.cos(a),s=Math.sin(a);
      g.strokeStyle=`rgba(${gilt>0&&d%10===0?P.giltDeep:P.groove},.85)`;g.lineWidth=d%10===0?lw*1.2:lw*.7;g.beginPath();g.moveTo(c*(R-.5),s*(R-.5));g.lineTo(c*(R-L),s*(R-L));g.stroke();}
    g.strokeStyle=`rgba(${P.groove},.6)`;g.lineWidth=lw*.7;g.beginPath();g.arc(0,0,R-rim*.62,0,TAU);g.stroke();
    if(big)for(let d=30;d<=360;d+=30){const a=-Math.PI/2+(d%360)/360*TAU,r=R-rim*.8;g.save();g.translate(Math.cos(a)*r,Math.sin(a)*r);g.rotate(a+Math.PI/2);astroNaskh(g,astroAbjad(d),0,-rim*.02,rim*.44,P.groove,.85);g.restore();}
    g.restore();});
  // The plate: the tropics and equator, the almucantars every ten degrees of altitude for the plate's
  // latitude, the horizon, and azimuths fanned from the zenith — each arc compass-swung, and a few of the
  // swings left visible past where they stop, the way a construction is left standing.
  reveal(2,()=>{g.save();g.beginPath();g.arc(0,0,rc,0,TAU);g.clip();
    const sp=Math.sin(ASTRO_LAT),cp=Math.cos(ASTRO_LAT),line=(w,al)=>{g.strokeStyle=`rgba(${P.groove},${al})`;g.lineWidth=w;};
    line(lw*.8,.55);for(const d of[0,ASTRO_OBLIQ]){g.beginPath();g.arc(0,0,dr(d),0,TAU);g.stroke();}
    g.beginPath();g.moveTo(0,-rc);g.lineTo(0,rc);g.moveTo(-rc,0);g.lineTo(rc,0);g.stroke();
    const alm=a=>({y:-k*cp/(sp+Math.sin(a)),r:k*Math.cos(a)/(sp+Math.sin(a))});
    for(let h=0;h<90;h+=big?6:10){const c=alm(h*Math.PI/180);line(h===0?lw*1.2:lw*.6,h===0?.85:.55);g.beginPath();g.arc(0,c.y,c.r,0,TAU);g.stroke();}
    const zy=-k*cp/(sp+1),ny=k*cp/(1-sp),my=(zy+ny)/2,half=(ny-zy)/2,hz=alm(0);
    g.save();g.beginPath();g.arc(0,hz.y,hz.r,0,TAU);g.clip();line(lw*.55,.45);
    for(let i=1;i<9;i++){const x=half*Math.tan((i/9-.5)*Math.PI*.96);if(Math.abs(x)<1e-3)continue;g.beginPath();g.arc(x,my,Math.hypot(x,half),0,TAU);g.stroke();}g.restore();
    g.fillStyle=`rgba(${P.groove},.9)`;g.beginPath();g.arc(0,zy,Math.max(.8,R*.012),0,TAU);g.fill();
    g.restore();
    if(big){g.save();g.setLineDash([R*.012,R*.018]);g.strokeStyle=`rgba(${P.groove},.35)`;g.lineWidth=lw*.5;g.beginPath();g.arc(0,hz.y,hz.r,Math.PI*.18,Math.PI*.34);g.stroke();g.restore();
      astroNaskh(g,'ا',0,zy-R*.05,R*.055,P.groove,.7);astroNaskh(g,'ب',rc*.72,hz.y+Math.sqrt(Math.max(0,hz.r*hz.r-(rc*.72)**2))-R*.03,R*.05,P.groove,.6);}
  });
  // The rete, pierced: the ring of Capricorn, the ecliptic ring set eccentric on it, the equatorial bar, and
  // openwork struts; everything else cut away so the plate shows through. It turns on the pin with `rot`.
  const eclR=(rc+dr(ASTRO_OBLIQ))/2,eclC=(rc-dr(ASTRO_OBLIQ))/2;
  const strap=(path,w)=>{g.lineCap='round';g.lineJoin='round';if(astroGhost){g.strokeStyle=`rgba(${P.groove},.8)`;g.lineWidth=Math.max(lw*1.4,w*.35);g.beginPath();path();g.stroke();return;}g.strokeStyle=`rgb(${P.groove})`;g.lineWidth=w+lw*1.6;g.beginPath();path();g.stroke();
    g.strokeStyle=astroBrass(g,-R,-R,R,R,1.2);g.lineWidth=w;g.beginPath();path();g.stroke();};
  reveal(3,()=>{g.save();g.rotate(rot);const w=Math.max(1.2,R*.035);
    if(!astroGhost){g.fillStyle=`rgba(${P.tarnish},.22)`;}else g.fillStyle='rgba(0,0,0,0)';g.beginPath();g.arc(0,-eclC,eclR+w,0,TAU);g.arc(0,-eclC,eclR-w,0,TAU,true);g.fill('evenodd');
    strap(()=>{g.arc(0,0,rc-w*.4,0,TAU);},w*.9);
    strap(()=>{g.arc(0,-eclC,eclR,0,TAU);},w);
    strap(()=>{g.moveTo(-rc+w,0);g.lineTo(rc-w,0);g.moveTo(0,rc-w);g.lineTo(0,-eclC+eclR);},w*.7);
    for(const s of[-1,1])strap(()=>{g.moveTo(s*rc*.72,rc*.66);g.quadraticCurveTo(s*rc*.3,rc*.62,s*rc*.2,rc*.2);g.quadraticCurveTo(s*rc*.12,0,s*rc*.36,-rc*.12);},w*.55);
    if(big){g.save();g.lineCap='butt';for(let i=0;i<72;i++){const a=i/72*TAU,c=Math.cos(a),s=Math.sin(a);g.strokeStyle=`rgba(${P.groove},.7)`;g.lineWidth=lw*.6;g.beginPath();g.moveTo(c*(eclR-w*.45),-eclC+s*(eclR-w*.45));g.lineTo(c*(eclR+(i%6?0:w*.45)),-eclC+s*(eclR+(i%6?0:w*.45)));g.stroke();}g.restore();}
    g.fillStyle=`rgba(${P.brass},1)`;g.beginPath();g.arc(0,0,w*1.1,0,TAU);g.fill();g.strokeStyle=`rgb(${P.groove})`;g.lineWidth=lw;g.stroke();
    g.restore();});
  // The pointers, set at their stars and named.
  reveal(4,()=>{g.save();g.rotate(rot);const w=Math.max(1,R*.026);
    for(const [ra,dec,ni] of ASTRO_RETE){const a=-Math.PI/2+ra*Math.PI/180,r=dr(dec*Math.PI/180);if(r>rc*.94)continue;
      const tx=Math.cos(a)*r,ty=Math.sin(a)*r,rr=r+(r<eclR*.8?R*.08:-R*.08),rx=Math.cos(a+.12)*rr,ry=Math.sin(a+.12)*rr;
      const known=gilt>0||(opts.found&&opts.found&(1<<ni));
      astroPointer(g,tx,ty,rx,ry,w,known?(gilt>0?mixRgb(P.brassHi.split(',').map(Number),P.gilt.split(',').map(Number),gilt):P.gilt):P.brassHi,1);
      g.fillStyle=`rgb(${known?P.gilt:P.groove})`;g.beginPath();g.arc(tx,ty,Math.max(.6,R*.008),0,TAU);g.fill();
      if(big){g.save();g.translate(rx,ry);g.rotate(rot*-1);astroNaskh(g,ASTRO_STARS[ni][0],0,R*.045,R*.04,P.groove,.7);g.restore();}}
    g.restore();});
  // The rule: a straight bar across the whole face on the same pin, fiducial edge through the centre, and
  // the wedge (the "horse") through the pin that holds the stack together.
  reveal(5,()=>{g.save();g.rotate(rot*1.6+.7);const w=Math.max(1.6,R*.05);
    g.beginPath();g.moveTo(-R*.98,0);g.lineTo(-R*.9,-w/2);g.lineTo(R*.9,-w/2);g.lineTo(R*.98,0);g.lineTo(R*.9,w/2);g.lineTo(-R*.9,w/2);g.closePath();
    g.fillStyle=astroBrass(g,0,-w,0,w,1.3);g.fill();g.strokeStyle=`rgb(${P.groove})`;g.lineWidth=lw*1.2;g.stroke();
    g.strokeStyle=`rgba(${P.groove},.8)`;g.lineWidth=lw*.6;g.beginPath();g.moveTo(-R*.92,0);g.lineTo(R*.92,0);g.stroke();
    g.restore();
    g.fillStyle=astroBrass(g,-R*.05,-R*.05,R*.05,R*.05,1.4);g.beginPath();g.arc(0,0,R*.045,0,TAU);g.fill();g.strokeStyle=`rgb(${P.groove})`;g.lineWidth=lw;g.stroke();
    g.fillStyle=`rgb(${P.brassLo})`;g.fillRect(-R*.012,-R*.07,R*.024,R*.14);});
  // Gilt over the finished instrument: its rim burnished and a warmth over the whole face.
  if(gilt>0){g.save();g.globalAlpha=gilt;g.strokeStyle=`rgba(${P.gilt},.95)`;g.lineWidth=Math.max(1,R*.02);g.beginPath();g.arc(0,0,R-.5,0,TAU);g.stroke();
    const gg=g.createRadialGradient(-R*.3,-R*.4,R*.05,0,0,R);gg.addColorStop(0,'rgba(255,236,170,.28)');gg.addColorStop(1,'rgba(255,236,170,0)');g.fillStyle=gg;g.beginPath();g.arc(0,0,R,0,TAU);g.fill();g.restore();}
  if(opts.shade!==false&&!astroGhost){const sh=g.createRadialGradient(R*.25,R*.3,R*.2,0,0,R*1.05);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(30,20,8,.18)');g.fillStyle=sh;g.beginPath();g.arc(0,0,R,0,TAU);g.fill();}
}
// The instrument drawn once into a sprite at a stage, for the places it stands still.
const astroSprites=new Map();
function astroInstrumentSprite(R,parts,gilt,found=0){
  const key=R.toFixed(1)+':'+parts+':'+gilt+':'+found+':'+DPR;let s=astroSprites.get(key);if(s)return s;
  const size=Math.ceil(R*2.7),c=makeCanvas(Math.round(size*DPR),Math.round(size*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2+R*.18);
  astroInstrument(g,R,parts,1,.35,gilt,{found});s={canvas:c,size,dy:R*.18};if(astroSprites.size>6)astroSprites.clear();astroSprites.set(key,s);return s;
}

// ---------- What a hand has built, kept across runs ----------
// A small record under its own key, apart from the atlas's ledger (the atlas never reads it, and a preview
// era never writes the atlas's): the furthest chapter any run has reached, how often the Zīj was finished,
// and the best reckoning. Storage may be blocked or the record corrupt; either reads as an empty record.
const ASTRO_KEY='orbit.astrolabe.v1';
function astroRead(){
  let raw=null;try{raw=JSON.parse(storage.get(ASTRO_KEY,'null'));}catch(_){raw=null;}
  const n=(v,max)=>clamp(Math.floor(Number(v)||0),0,max);
  return{v:1,furthest:n(raw&&raw.furthest,ASTRO_CHAPTERS.length-1),completed:n(raw&&raw.completed,1e6),best:n(raw&&raw.best,1e9),runs:n(raw&&raw.runs,1e9)};
}
function astroWrite(r){try{storage.set(ASTRO_KEY,JSON.stringify(r));}catch(_){}}
function astroNoteChapter(i){const r=astroRead();if(i>r.furthest){r.furthest=i;astroWrite(r);invalidateAstroTitle();}}
function astroRecordRun(w){
  const r=astroRead();r.runs++;r.best=Math.max(r.best,w.score|0);if(w.won)r.completed++;
  r.furthest=Math.max(r.furthest,Math.min(ASTRO_CHAPTERS.length-1,Math.floor(w.progress/ASTRO_CHAPTER_ROWS)));astroWrite(r);invalidateAstroTitle();
}
const astroBest=()=>astroRead().best;
// The fihrist: every star a run has named off the rete, every figure it has set and every wanderer it has
// sighted, counted across all runs, under a key of its own so the run record above keeps its shape. Each
// tally is read on its own against the list it counts, so a fihrist written before the wanderers were
// counted simply has none yet and keeps its version, as the cosmetics document does for a new category. It is what the frontispiece gilds
// on the instrument's rete — a star once named keeps a gold pointer — and what the leaf counts at the end.
const ASTRO_FIHRIST_KEY='orbit.fihrist.v1';
function astroFihrist(){
  let raw=null;try{raw=JSON.parse(storage.get(ASTRO_FIHRIST_KEY,'null'));}catch(_){raw=null;}
  const tally=(o,n)=>{const out={};if(o&&typeof o==='object')for(let i=0;i<n;i++){const v=Math.floor(Number(o[i])||0);if(v>0)out[i]=v;}return out;};
  return{v:1,stars:tally(raw&&raw.stars,ASTRO_STARS.length),figures:tally(raw&&raw.figures,ASTRO_FIGURES.length),planets:tally(raw&&raw.planets,ASTRO_PLANETS.length)};
}
function astroFihristNote(kind,i){const f=astroFihrist();f[kind][i]=(f[kind][i]||0)+1;try{storage.set(ASTRO_FIHRIST_KEY,JSON.stringify(f));}catch(_){}invalidateAstroTitle();}
const astroFihristMask=f=>Object.keys(f.stars).reduce((m,k)=>m|(1<<k),0);

// ---------- The page: sized manuscript paper, baked once as a tile ----------
// Cream paper sized and burnished smooth, as the scribes of Baghdad prepared it, so it has almost no tooth;
// the blind lines of a misṭara, the ruling board pressed into the sheet to keep the lines straight; and,
// faint under everything, the geometry of Ibn al-Haytham's optics — rays as straight lines from a lettered
// eye, a compass-swung circle with its point still pricked at the centre, chords and their lettered ends —
// the demoted manuscript grammar the doc keeps as the ground the construction is drawn on.
const ASTRO_TILE=900;
let astroTile=null,astroTileKey='';
function astroBakeTile(){
  const key=W+'x'+DPR;if(astroTile&&astroTileKey===key)return astroTile;
  const P=ink.astro,TH=ASTRO_TILE,pw=Math.max(1,Math.round(W*DPR)),ph=Math.round(TH*DPR),c=makeCanvas(pw,ph),g=c.getContext('2d');
  const q=4,lw=Math.ceil(pw/q),lh=Math.ceil(ph/q),lo=makeCanvas(lw,lh),lg=lo.getContext('2d'),im=lg.createImageData?lg.createImageData(lw,lh):null,d=im&&im.data,base=P.paper.split(',').map(Number);
  if(d){for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){
    const X=x*q/DPR,Y=y*q/DPR,i=(y*lw+x)*4,m=astroFbm(X,Y,225,4,13,TH),cl=astroFbm(X,Y,45,3,31,TH),l=1+m*.05+cl*.022;
    d[i]=base[0]*l;d[i+1]=base[1]*l*(1-Math.max(0,-m)*.03);d[i+2]=base[2]*l*(1-Math.max(0,-m)*.08);d[i+3]=255;}
    lg.putImageData(im,0,0);g.imageSmoothingQuality='high';g.drawImage(lo,0,0,pw,ph);}
  else{g.fillStyle=`rgb(${P.paper})`;g.fillRect(0,0,pw,ph);}
  g.scale(DPR,DPR);
  // The misṭara's blind lines: a pressed furrow and its lit shoulder, every line of a page's text.
  for(let y=9;y<TH;y+=18){g.strokeStyle='rgba(120,96,60,.07)';g.lineWidth=.6;g.beginPath();g.moveTo(22,y);g.lineTo(W-22,y);g.stroke();
    g.strokeStyle='rgba(255,250,236,.22)';g.lineWidth=.5;g.beginPath();g.moveTo(22,y+.8);g.lineTo(W-22,y+.8);g.stroke();}
  const r=seeded(23);
  // Burnishing: long soft streaks where the agate stone was drawn across the sized sheet.
  for(let i=0;i<Math.round(W*TH/9000);i++){const x=r()*W,y=r()*TH,L=40+r()*120,a=(r()-.5)*.3;g.strokeStyle=`rgba(255,250,236,${(.05+r()*.06).toFixed(3)})`;g.lineWidth=2+r()*5;g.lineCap='round';
    g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}
  for(let i=0;i<Math.round(W*TH/200);i++){const x=r()*W,y=r()*TH,a=r()*TAU,L=2+r()*6;g.strokeStyle=r()<.5?`rgba(255,250,236,${(.1+r()*.12).toFixed(3)})`:`rgba(130,104,64,${(.05+r()*.07).toFixed(3)})`;g.lineWidth=.25+r()*.3;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}
  for(let i=0;i<Math.round(W*TH/16000);i++){const x=r()*W,y=r()*TH,rr=1+r()*r()*6,gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,`rgba(150,104,52,${(.12+r()*.14).toFixed(3)})`);gr.addColorStop(1,'rgba(150,104,52,0)');
    g.fillStyle=gr;g.beginPath();g.arc(x,y,rr,0,TAU);g.fill();}
  // The constructions, three to a tile, never crossing the tile's seam, set faint enough to read as ground.
  g.font=plateFace(9,'naskh');g.direction='rtl';g.textAlign='center';g.textBaseline='middle';
  for(let k=0;k<3;k++){const cx=W*(.28+r()*.44),cy=TH*(k+.5)/3+(r()-.5)*60,R=34+r()*40,ink1=`rgba(${P.ink},.13)`;let v=0;
    const letter=(x,y,dx,dy)=>{g.fillStyle=`rgba(${P.ink},.2)`;g.fillText(ASTRO_VERTICES[v++%ASTRO_VERTICES.length],x+dx,y+dy);};
    g.strokeStyle=ink1;g.lineWidth=.6;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();g.fillStyle=`rgba(${P.ink},.3)`;g.beginPath();g.arc(cx,cy,.8,0,TAU);g.fill();letter(cx,cy,-6,-5);
    // the compass's swing, carried on past where the circle was wanted
    g.strokeStyle=`rgba(${P.ink},.08)`;g.beginPath();g.arc(cx,cy,R*1.35,-.5+r(),.2+r());g.stroke();
    const ex=cx+(r()<.5?-1:1)*R*(1.9+r()*.5),ey=cy+(r()-.5)*R;letter(ex,ey,0,-8);
    const hits=[];for(let i=0;i<3;i++){const a=Math.atan2(ey-cy,ex-cx)+Math.PI+(i-1)*(.5+r()*.25);hits.push([cx+Math.cos(a)*R,cy+Math.sin(a)*R]);}
    g.strokeStyle=ink1;g.lineWidth=.5;for(const h of hits){g.beginPath();g.moveTo(ex,ey);g.lineTo(h[0],h[1]);g.stroke();letter(h[0],h[1],(h[0]-cx)/R*8,(h[1]-cy)/R*8);}
    g.setLineDash([2,3]);g.beginPath();g.moveTo(hits[0][0],hits[0][1]);g.lineTo(hits[2][0],hits[2][1]);g.stroke();g.setLineDash([]);
    // the angle at the eye, marked by a small arc as the proof names it
    const a0=Math.atan2(hits[0][1]-ey,hits[0][0]-ex),a1=Math.atan2(hits[2][1]-ey,hits[2][0]-ex);g.beginPath();g.arc(ex,ey,12,Math.min(a0,a1),Math.max(a0,a1));g.stroke();}
  astroTile=c;astroTileKey=key;return c;
}
// The limb down both edges of the sheet: brass, graduated a degree at a time as the climb goes, a longer
// cut every five and ten, abjad every ten, and at every thirty the sign of the zodiac that arc of the
// ecliptic carries. Drawn live, since it is read off the world.
const ASTRO_BAND=15;
function astroBands(){
  const P=ink.astro,B=ASTRO_BAND,camTop=world.cameraY,camBot=world.cameraY+H/scale,first=Math.floor(-camBot/ASTRO_DEG)-1,last=Math.ceil(-camTop/ASTRO_DEG)+1;
  for(const side of[-1,1]){const x0=side<0?0:W-B,x1=side<0?B:W,inner=side<0?x1:x0;
    ctx.save();ctx.fillStyle=astroBrass(ctx,side<0?x0:x1,0,inner,0,1);ctx.fillRect(x0,0,B,H);
    // wear: brighter down the middle of the strip where a hand runs along it, patina at its edges
    const wear=ctx.createLinearGradient(x0,0,x1,0);wear.addColorStop(0,`rgba(${P.patina},.35)`);wear.addColorStop(.5,'rgba(255,236,170,.1)');wear.addColorStop(1,`rgba(${P.patina},.35)`);ctx.fillStyle=wear;ctx.fillRect(x0,0,B,H);
    ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(inner+side*-.5,0);ctx.lineTo(inner+side*-.5,H);ctx.stroke();
    ctx.strokeStyle='rgba(60,44,20,.28)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(inner-side*1.8,0);ctx.lineTo(inner-side*1.8,H);ctx.stroke();ctx.restore();
    ctx.save();ctx.lineCap='butt';ctx.beginPath();
    for(let k=first;k<=last;k++){const y=sy(-k*ASTRO_DEG),deg=((k%360)+360)%360,L=deg%10===0?B*.55:deg%5===0?B*.38:B*.22;ctx.moveTo(inner,y);ctx.lineTo(inner-side*L,y);}
    ctx.strokeStyle=`rgba(${P.brassHi},.5)`;ctx.lineWidth=.6;ctx.translate(0,.5);ctx.stroke();ctx.translate(0,-.5);ctx.strokeStyle=`rgba(${P.groove},.9)`;ctx.lineWidth=.5;ctx.stroke();ctx.restore();
    for(let k=first;k<=last;k++){const deg=((k%360)+360)%360;if(deg%10)continue;const y=sy(-k*ASTRO_DEG),xm=side<0?B*.32:W-B*.32;
      ctx.save();ctx.translate(xm,y);ctx.rotate(side<0?-Math.PI/2:Math.PI/2);
      if(deg%30===0){ctx.strokeStyle=`rgba(${P.groove},.9)`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-.5,-B*.3);ctx.lineTo(-.5,B*.3);ctx.moveTo(1.5,-B*.3);ctx.lineTo(1.5,B*.3);ctx.stroke();
        astroNaskh(ctx,ASTRO_SIGNS[deg/30],side<0?-24:24,0,8.5,P.groove,.9);}
      else astroNaskh(ctx,astroAbjad(deg),0,0,7.5,P.groove,.85);
      ctx.restore();}}
}
// The frontispiece's title mark: the instrument itself, built as far as any run on this device has taken it,
// standing above the three opening lights and gone once the hand starts; its name beside it in naskh.
let astroTitleFade=1;
function invalidateAstroTitle(){astroSprites.clear();}
function astroTitleMark(){
  const ready=world.state==='ready';astroTitleFade=ready?1:Math.max(0,astroTitleFade-.03);if(astroTitleFade<=0)return;
  const P=ink.astro,rec=astroRead(),fih=astroFihrist(),R=Math.min(W*.14,48*scale+6),x=W/2,y=H*.215,sp=astroInstrumentSprite(R,rec.furthest+1,rec.completed>0?1:0,astroFihristMask(fih));
  ctx.save();ctx.globalAlpha=astroTitleFade;ctx.drawImage(sp.canvas,x-sp.size/2,y-sp.size/2-sp.dy,sp.size,sp.size);
  astroNaskh(ctx,'الأسطرلاب',x,y+R+20,22,P.ink,.92,'center',true);
  const done=rec.completed>0?'THE ZIJ IS FINISHED':'PARTS '+(rec.furthest+1)+' OF '+ASTRO_CHAPTERS.length+' · '+ASTRO_CHAPTERS[rec.furthest].en;
  astroGloss(ctx,done,x,y+R+40,9.5,P.inkSoft,.85);
  const ns=Object.keys(fih.stars).length,nf=Object.keys(fih.figures).length,np=Object.keys(fih.planets).length;
  if(ns||nf||np)astroGloss(ctx,'FIHRIST · '+ns+' OF '+ASTRO_STARS.length+' STARS · '+nf+' OF '+ASTRO_FIGURES.length+' FIGURES'+(np?' · '+np+' OF '+ASTRO_PLANETS.length+' WANDERERS':''),x,y+R+55,9,P.giltDeep,.95,'center',true);
  ctx.restore();
}
// The ground: the paper tile at the camera's own rate, a lamp above the held body, the limb, the title.
function astroAtmosphere(){
  plateShift.x=0;plateShift.y=0;
  const tile=astroBakeTile(),th=ASTRO_TILE,phase=(((-world.cameraY*scale)%th)+th)%th;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  for(let y=phase-th;y<H+th;y+=th)ctx.drawImage(tile,0,Math.round(y*DPR));
  ctx.restore();
  const lg=ctx.createRadialGradient(W*.5,H*.44,Math.min(W,H)*.1,W*.5,H*.44,Math.max(W,H)*.8);
  lg.addColorStop(0,'rgba(255,250,232,.08)');lg.addColorStop(.6,'rgba(80,56,24,0)');lg.addColorStop(1,'rgba(80,56,24,.16)');ctx.fillStyle=lg;ctx.fillRect(0,0,W,H);
  astroBands();
  astroTitleMark();
}

// ---------- A chapter opens: the place, and the part it gives the instrument ----------
// Struck early in the paint order, under every orbit and body, the way the atlas cuts its chapter title
// into the plate: the astrolabe as far as this chapter builds it, faint behind the play, its newest part
// swept in over two seconds, and the place named in naskh with the curator's English and year beneath.
let astroRevealCanvas=null,astroRevealKey='',astroRevealOf=null,astroRevealAt=0;
// Two of the places gave the sky a theorem as well as the instrument a part, and their doors draw it,
// in ink over the ghost of the instrument and turning while the door stands. Valencia's century built the
// equatorium (Ibn al-Samḥ, al-Zarqālī): a planet's place found with no tables at all, by setting its
// epicycle on an eccentric deferent and reading the line of sight from the earth. Marāgha gave the Ṭūsī
// couple: a circle rolling inside one twice its size, whose point runs back and forth along a straight
// diameter — two circular motions making a straight one, the device the observatory's planetary models
// were built on. Every other door draws only its part of the instrument.
function astroTheorem(i,cx,cy,R,age,alpha){
  if((i!==3&&i!==4)||alpha<=0)return;
  const P=ink.astro,lw=Math.max(.6,.7*scale),ln=`rgba(${P.ink},.8)`,lt=(ch,x,y)=>astroNaskh(ctx,ch,x,y,Math.max(11,12*scale),P.ink,.85*alpha,'center',false,true);
  ctx.save();ctx.globalAlpha=alpha;ctx.lineWidth=lw;ctx.strokeStyle=ln;ctx.lineCap='round';
  const dot=(x,y,r,rgb)=>{ctx.fillStyle=`rgb(${rgb})`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();};
  if(i===3){
    const th=-Math.PI/2+age*.9,ex=cx,ey=cy+R*.12,dx=cx+R*.16,dy=cy-R*.04,rd=R*.78,re=R*.24,qx=dx+Math.cos(th)*rd,qy=dy+Math.sin(th)*rd,ph=th*3,px=qx+Math.cos(ph)*re,py=qy+Math.sin(ph)*re;
    ctx.beginPath();ctx.arc(dx,dy,rd,0,TAU);ctx.stroke();
    ctx.beginPath();ctx.arc(qx,qy,re,0,TAU);ctx.stroke();
    ctx.setLineDash([2*scale,2.5*scale]);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(dx,dy);ctx.moveTo(dx,dy);ctx.lineTo(qx,qy);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(qx,qy);ctx.lineTo(px,py);ctx.stroke();
    // the line of sight from the earth through the planet, carried on to the limb where it is read
    const a=Math.atan2(py-ey,px-ex);ctx.strokeStyle=`rgba(${P.verm},.85)`;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+Math.cos(a)*R*1.12,ey+Math.sin(a)*R*1.12);ctx.stroke();
    ctx.beginPath();ctx.arc(ex,ey,R*.2,Math.min(-Math.PI/2,a),Math.max(-Math.PI/2,a));ctx.stroke();
    dot(ex,ey,1.6*scale,P.ink);dot(dx,dy,1.2*scale,P.ink);dot(qx,qy,1.2*scale,P.ink);dot(px,py,2.4*scale,P.gilt);
    ctx.restore();lt('ا',ex-9*scale,ey+8*scale);lt('ب',dx+8*scale,dy-7*scale);lt('ج',qx+(qx-dx)/rd*11*scale,qy+(qy-dy)/rd*11*scale);lt('د',px+(px-qx)/re*9*scale,py+(py-qy)/re*9*scale);
  }else{
    const ph=age*1.7,sx0=cx+Math.cos(ph)*R/2,sy0=cy+Math.sin(ph)*R/2,px=cx+Math.cos(ph)*R,py=cy;
    ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.stroke();
    ctx.beginPath();ctx.arc(sx0,sy0,R/2,0,TAU);ctx.stroke();
    ctx.setLineDash([2*scale,2.5*scale]);ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(sx0,sy0);ctx.lineTo(px,py);ctx.stroke();
    // the straight path the point has run so far, struck solid over the dashed diameter
    const lo=age*1.7>=Math.PI?-R:Math.cos(ph)*R;ctx.strokeStyle=`rgba(${P.verm},.85)`;ctx.lineWidth=lw*1.6;ctx.beginPath();ctx.moveTo(cx+lo,cy);ctx.lineTo(cx+R,cy);ctx.stroke();
    dot(cx,cy,1.4*scale,P.ink);dot(sx0,sy0,1.2*scale,P.ink);dot(px,py,2.4*scale,P.gilt);
    ctx.restore();lt('ا',cx-11*scale,cy-9*scale);lt('ب',sx0+(sx0-cx)/R*14*scale,sy0+(sy0-cy)/R*14*scale-4*scale);lt('ج',px,py+11*scale);
  }
}
let astroTitleGap=null;
function astroChapterReveal(dt){
  astroTitleGap=null;
  if(!world||world.state==='ready'||world.state==='dead')return;
  // Timed off the run's own clock from the moment this chapter's reveal was dealt, rather than by adding up
  // frame times, so a frame that is never painted (a background tab, a long step) cannot hold it open.
  if(astroRevealOf!==chapterReveal){astroRevealOf=chapterReveal;astroRevealAt=world.time-chapterReveal.age;}
  chapterReveal.age=world.time-astroRevealAt;
  const age=chapterReveal.age,i=clamp(chapterReveal.index|0,0,ASTRO_CHAPTERS.length-1);if(age>3.9)return;
  const P=ink.astro,C=ASTRO_CHAPTERS[i],fade=age<.4?age/.4:age>3.1?clamp(1-(age-3.1)/.8,0,1):1,R=Math.min(W*.34,128),size=Math.ceil(R*2.7);
  const key=size+':'+DPR;if(!astroRevealCanvas||astroRevealKey!==key){astroRevealCanvas=makeCanvas(Math.round(size*DPR),Math.round(size*DPR));astroRevealKey=key;}
  const g=astroRevealCanvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,astroRevealCanvas.width,astroRevealCanvas.height);
  g.setTransform(DPR,0,0,DPR,0,0);g.translate(size/2,size/2+R*.18);astroInstrument(g,R,i+1,astroEase(clamp((age-.3)/1.8,0,1)),.35+age*.04,0,{ghost:true});
  const cx=W/2,cy=H*.47;ctx.save();ctx.globalAlpha=.36*fade;ctx.drawImage(astroRevealCanvas,cx-size/2,cy-size/2-R*.18,size,size);ctx.restore();
  astroTheorem(i,cx,cy,R*.52,age,fade*clamp((age-.5)/.8,0,1));
  const tk=clamp((age-.2)/.8,0,1)*fade;
  const ty=cy-R*1.5-8;astroNaskh(ctx,C.ar,cx,ty-46,30,P.ink,.9*tk,'center',true);
  astroGloss(ctx,'DOOR '+(i+1)+' OF '+ASTRO_CHAPTERS.length+' · '+C.en+' · '+C.year,cx,ty-20,10,P.ink,.78*tk);
  astroGloss(ctx,C.part,cx,ty-3,9.5,P.inkSoft,.85*clamp((age-.9)/.6,0,1)*fade);
  // The title is cut under every orbit, so while it stands the orbits and bodies struck over it break
  // round it, as an engraver breaks ruled work round lettering, rather than running through its words.
  if(tk>.05){ctx.save();ctx.font=plateFace(30,'naskhB');const w1=ctx.measureText(C.ar).width;ctx.font=plateFace(10,'sc');
    const w2=ctx.measureText('DOOR '+(i+1)+' OF '+ASTRO_CHAPTERS.length+' · '+C.en+' · '+C.year).width;ctx.font=plateFace(9.5,'sc');const w3=ctx.measureText(C.part).width;ctx.restore();
    const hw=Math.max(w1,w2,w3)/2+10;astroTitleGap={x0:cx-hw,x1:cx+hw,y0:ty-68,y1:ty+6};}
}

// ---------- The node: ring, body or point, and the release marks while it is held ----------
// The ring stands at the node's real capture radius, never staged wider or narrower than the truth the code
// tests: a thin cut line with a degree tick every ten, so even the orbit reads as something measured.
const astroFlourishAt=new Map();
function astroFlourish(n){
  astroFlourishAt.set(n,world.time);
  if(astroFlourishAt.size>40)for(const[key,at]of astroFlourishAt)if(world.time-at>.7)astroFlourishAt.delete(key);
}
function astroRing(n,x,y,cap,state,drawn){
  const P=ink.astro;if(drawn<=0)return;
  ctx.save();ctx.strokeStyle=`rgba(${P.ink},${(.72*state).toFixed(3)})`;ctx.lineWidth=Math.max(.7,.75*scale);
  ctx.beginPath();ctx.arc(x,y,cap,-Math.PI/2,-Math.PI/2+TAU*drawn);ctx.stroke();
  ctx.strokeStyle=`rgba(${P.ink},${(.5*state).toFixed(3)})`;ctx.lineCap='butt';ctx.lineWidth=Math.max(.35,.4*scale);ctx.beginPath();
  for(let d=0;d<360*drawn;d+=10){const a=-Math.PI/2+d/360*TAU,l=(d%90===0?4.2:d%30===0?3:1.8)*scale;ctx.moveTo(x+Math.cos(a)*cap,y+Math.sin(a)*cap);ctx.lineTo(x+Math.cos(a)*(cap+l),y+Math.sin(a)*(cap+l));}
  ctx.stroke();
  const at=astroFlourishAt.get(n);
  if(at!==undefined){const k=clamp(1-(world.time-at)/.7,0,1);if(k>0){ctx.strokeStyle=`rgba(${P.gilt},${(.95*k).toFixed(3)})`;ctx.lineWidth=(.5+2.4*k)*scale;ctx.beginPath();ctx.arc(x,y,cap,0,TAU);ctx.stroke();}}
  ctx.restore();
}
// Where the next body can be reached from the held ring: a vermilion rubric laid outside the rim over the
// arc that connects, and at every tangent that threads clear of every hazard, a division struck across
// the rim with a gilt point on it. Geometry only, read exactly as drawNode reads it.
function astroReleaseMarks(n,p,x,y){
  const P=ink.astro,rad=p.rad*scale;
  for(const next of releaseTargets(n)){
    const dist=Math.hypot(next.x-n.x,next.y-n.y),a=Math.atan2(next.y-n.y,next.x-n.x)-p.dir*Math.acos(clamp(p.rad/dist,-1,1)),win=Math.asin(clamp(next.cap/dist,0,.8));
    ctx.save();ctx.strokeStyle=`rgba(${P.verm},.42)`;ctx.lineWidth=3.2*scale;ctx.lineCap='butt';ctx.beginPath();ctx.arc(x,y,rad+7*scale,a-win,a+win);ctx.stroke();
    ctx.strokeStyle=`rgba(${P.verm},.8)`;ctx.lineWidth=.5*scale;ctx.beginPath();for(let t=-1;t<=1;t+=.25){const b=a+t*win;ctx.moveTo(x+Math.cos(b)*(rad+5*scale),y+Math.sin(b)*(rad+5*scale));ctx.lineTo(x+Math.cos(b)*(rad+9*scale),y+Math.sin(b)*(rad+9*scale));}ctx.stroke();ctx.restore();
    for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
      if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
      const c=Math.cos(path.angle),s=Math.sin(path.angle);
      ctx.save();ctx.strokeStyle=`rgba(${P.ink},.9)`;ctx.lineWidth=1*scale;ctx.beginPath();ctx.moveTo(x+c*(rad-4*scale),y+s*(rad-4*scale));ctx.lineTo(x+c*(rad+13*scale),y+s*(rad+13*scale));ctx.stroke();ctx.restore();
      astroKhatam(ctx,x+c*(rad+9*scale),y+s*(rad+9*scale),2.6*scale,`rgb(${P.gilt})`,`rgba(${P.groove},.8)`,.4);
    }
  }
}
// Which bodies have been named this run: every completed body of the first or second greatness is set on the
// sheet with a star's name from a rete, in naskh with the curator's gloss, since those are the stars a rete
// actually carries pointers to; every other one carries only its qadr.
let astroRunWorld=null,astroNamed=new Map(),astroNameNext=0;
function astroRun(){if(astroRunWorld!==world){astroRunWorld=world;astroNamed=new Map();astroNameNext=0;astroFlourishAt.clear();}}
// The wanderers: one body of each chapter after Baghdad is not a fixed star but a planet, its row
// dealt off the run's seed and its planet off a shuffle of the five, so one seed always sights the same
// wanderers in the same places. Baghdad has none of its own: its only plain row is the opening's, where
// the Moon already stands among the three lights, so the five fall one to each of the other five places.
// Nothing about the body changes in the simulation; before it is held it is
// the same unadorned point as any other, since a planet and a star look alike to the naked eye and only
// measuring over nights tells them apart. Only a plain body of the main line can be one: never a fork's
// star, which belongs to its figure, nor the slingshot or the fading star, whose marks are their own. The
// rows those stand on are read off the chart's own rule for them in simulation.js, and the body itself is
// checked as well, so a chart that ever deals differently costs a chapter its wanderer and nothing more.
function astroPlainRow(k){const l=k%8;return k>=1&&!(l>=3&&l<=7)&&!(k===2||k>=7&&l===7)&&!(k>=14&&k%7===0);}
function astroWanderer(n){
  if(n.difficultyChoice||n.routeId!=null||(n.type!=='still'&&n.type!=='drift')||n.row!==Math.floor(n.row))return -1;
  const c=Math.floor(n.row/ASTRO_CHAPTER_ROWS);if(c<1||c>ASTRO_PLANETS.length)return -1;
  const seed=(world.seed|0)>>>0,rows=[];for(let k=c*ASTRO_CHAPTER_ROWS;k<(c+1)*ASTRO_CHAPTER_ROWS;k++)if(astroPlainRow(k))rows.push(k);
  if(!rows.length||n.row!==rows[Math.floor(astroHash(seed,c,11)*rows.length)])return -1;
  const order=[0,1,2,3,4];for(let i=order.length-1;i>0;i--){const j=Math.floor(astroHash(seed,i,29)*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  return order[c-1];
}
// A wanderer's track: its places pricked night by night as a zīj's observer reduced them, eastward along
// the ecliptic, turning back through its retrograde loop between the two stations and on again, the
// newest prick against the body. It is pricked outward from the body as the scale is struck, the older
// nights read back one at a time, and kept well inside the orbit so the traveller never rides over it.
function astroTrack(x,y,rm,d,alpha){
  const P=ink.astro,k=astroEase(astroSpan(d,[.2,.9]));if(k<=0||alpha<=0)return;
  // a prolate trochoid, the curve an epicycle rolled along the ecliptic draws, flattened along its height
  // as a real loop is: wider than it is tall
  const a=1,b=2.6,X=5.5*scale,Y=2.3*scale,N=23,pt=t=>[(a*t-b*Math.sin(t)+a*Math.PI)*X,-(b*Math.cos(t)+b)*Y];
  ctx.save();ctx.translate(x,y);ctx.rotate(-.3);ctx.translate(rm+5*scale,0);ctx.globalAlpha=alpha;
  // the ecliptic the wanderer keeps near, a hair through the middle of its loop
  ctx.strokeStyle=`rgba(${P.inkSoft},${(.4*k).toFixed(3)})`;ctx.lineWidth=Math.max(.4,.45*scale);ctx.setLineDash([1.5*scale,2*scale]);
  ctx.beginPath();ctx.moveTo(-2*scale,-b*Y);ctx.lineTo(2*a*Math.PI*X+3*scale,-b*Y);ctx.stroke();ctx.setLineDash([]);
  const shown=k*(N-1);
  ctx.strokeStyle=`rgba(${P.ink},.35)`;ctx.lineWidth=Math.max(.35,.4*scale);ctx.beginPath();
  for(let s=0;s<=shown*4;s++){const[px,py]=pt(-Math.PI+s/4*TAU/(N-1));s?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
  for(let i=0;i<=shown;i++){const[px,py]=pt(-Math.PI+i*TAU/(N-1)),r=(i?1.1:1.6)*scale;
    ctx.fillStyle=`rgba(${i?P.ink:P.verm},${i?.8:.95})`;ctx.beginPath();ctx.arc(px,py,r,0,TAU);ctx.fill();}
  // the two stations, where the wanderer stands still before and after it turns back: a short cross-cut each
  if(k>=1){const ts=Math.acos(a/b);ctx.strokeStyle=`rgba(${P.verm},.85)`;ctx.lineWidth=Math.max(.5,.6*scale);ctx.beginPath();
    for(const t of[-ts,ts]){const[px,py]=pt(t);ctx.moveTo(px,py-2.2*scale);ctx.lineTo(px,py+2.2*scale);}ctx.stroke();}
  ctx.restore();
}
// The punched point: a small depression with a dark floor and a lit lip, the way the Valencia globe marks
// its stars, and a faint sighting cross round it that says only where it is — not yet what it is.
function astroPoint(x,y,r,alpha=1){
  const P=ink.astro;ctx.save();ctx.globalAlpha=alpha;
  ctx.fillStyle=`rgba(${P.groove},.9)`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,248,226,.9)';ctx.beginPath();ctx.arc(x+r*.25,y+r*.3,r*.45,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgba(${P.brassHi},.7)`;ctx.lineWidth=Math.max(.4,r*.3);ctx.beginPath();ctx.arc(x,y,r*1.35,Math.PI*.1,Math.PI*.9);ctx.stroke();
  ctx.restore();
}
function astroCross(x,y,r,alpha){
  const P=ink.astro;ctx.save();ctx.strokeStyle=`rgba(${P.inkSoft},${alpha})`;ctx.lineWidth=Math.max(.45,.45*scale);ctx.setLineDash([1.2*scale,1.8*scale]);ctx.beginPath();
  for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.moveTo(x+Math.cos(a)*r*1.8,y+Math.sin(a)*r*1.8);ctx.lineTo(x+Math.cos(a)*r*3.6,y+Math.sin(a)*r*3.6);}ctx.stroke();ctx.restore();
}
// The catalogued disc a finished measurement nests: gold sized to class, a fine dark contour, a burnished rim.
function astroDisc(x,y,r,alpha=1){
  const P=ink.astro;ctx.save();ctx.globalAlpha=alpha;
  ctx.fillStyle='rgba(90,60,20,.22)';ctx.beginPath();ctx.arc(x+.4,y+.55,r*1.1,0,TAU);ctx.fill();
  const gr=ctx.createRadialGradient(x-r*.3,y-r*.35,0,x,y,r);gr.addColorStop(0,'#F7E39A');gr.addColorStop(.55,`rgb(${P.gilt})`);gr.addColorStop(1,`rgb(${P.giltDeep})`);
  ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(${P.groove},.9)`;ctx.lineWidth=Math.max(.45,r*.14);ctx.stroke();
  ctx.strokeStyle='rgba(255,246,200,.7)';ctx.lineWidth=Math.max(.3,r*.1);ctx.beginPath();ctx.arc(x,y,r*.78,Math.PI*1.05,Math.PI*1.6);ctx.stroke();ctx.restore();
}
// The measurement: an arc struck round the body, sparse and unlit while the alidade is still sweeping,
// thickening into a protractor scale, and at the last closed whole with its ticks picked out in gilt.
function astroScale(x,y,rm,d,alpha){
  const P=ink.astro,s1=astroSpan(d,ASTRO_STAGE.sweep),s2=astroSpan(d,ASTRO_STAGE.struck),s3=astroSpan(d,ASTRO_STAGE.closed);if(d<=0)return;
  const reach=d>=1?1:lerp(0,.45,astroEase(s1))+lerp(0,.4,astroEase(s2))+.15*astroEase(s3),a0=-Math.PI/2,a1=a0+TAU*Math.min(1,reach),step=s2>0?5:15,gold=s3>=1;
  ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='butt';
  ctx.strokeStyle=`rgba(${gold?P.giltDeep:P.groove},.85)`;ctx.lineWidth=Math.max(.5,(s2>0?.8:.55)*scale);ctx.beginPath();ctx.arc(x,y,rm,a0,a1);ctx.stroke();
  ctx.beginPath();for(let deg=0;deg<=360*Math.min(1,reach);deg+=step){const a=a0+deg/360*TAU,l=(deg%30===0?3.6:deg%15===0?2.4:1.5)*scale*(s2>0?1:.8);
    ctx.moveTo(x+Math.cos(a)*rm,y+Math.sin(a)*rm);ctx.lineTo(x+Math.cos(a)*(rm+l),y+Math.sin(a)*(rm+l));}
  ctx.strokeStyle=gold?`rgba(${P.gilt},.95)`:`rgba(${P.groove},.75)`;ctx.lineWidth=Math.max(.35,.42*scale);ctx.stroke();
  if(gold){ctx.strokeStyle=`rgba(${P.groove},.5)`;ctx.lineWidth=Math.max(.3,.3*scale);ctx.beginPath();ctx.arc(x,y,rm+4*scale,0,TAU);ctx.stroke();}
  // the alidade's own line of sight while it is still sweeping: a hairline from the centre to the scale's edge
  if(reach<1){ctx.strokeStyle=`rgba(${P.verm},.55)`;ctx.lineWidth=.5*scale;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a1)*(rm+5*scale),y+Math.sin(a1)*(rm+5*scale));ctx.stroke();}
  ctx.restore();
}
function astroBody(n,x,y,tier,d,taken){
  const P=ink.astro,al=taken,s3=astroSpan(d,ASTRO_STAGE.closed);
  if(tier==='moon'){
    // The Moon is the crescent that sets the calendar, sighted, never drawn as ornament: a thin brass-cut
    // crescent and its name, nothing else.
    const r=n.r*scale*.42;ctx.save();ctx.globalAlpha=al;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.arc(x+r*.42,y-r*.18,r*.86,0,TAU,true);ctx.fillStyle=`rgb(${P.gilt})`;ctx.fill('evenodd');
    ctx.strokeStyle=`rgba(${P.groove},.85)`;ctx.lineWidth=Math.max(.5,.7*scale);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.restore();
    astroScale(x,y,r+7*scale,d,al);
    astroNaskh(ctx,'القمر',x,y+r+16*scale,Math.max(12,13*scale),P.ink,.88*al*(n.difficultyChoice?1:s3));
    return;
  }
  const wi=astroWanderer(n),cls=n.difficultyChoice?(tier==='bright'?3.6:2.7):wi>=0?ASTRO_QADR_DISC[0]:ASTRO_QADR_DISC[astroQadr(n)-1],disc=cls*scale,rm=disc*2.4+5*scale,fill=astroEase(s3);
  if(fill<1)astroPoint(x,y,Math.max(1.4,disc*.55),al*(1-fill));
  if(fill>0)astroDisc(x,y,disc,al*fill);
  astroScale(x,y,rm,d,al);
  if(wi>=0)astroTrack(x,y,rm,d,al);
  if(n.type==='gold'&&fill>0){ctx.save();ctx.strokeStyle=`rgba(${P.gilt},${(.9*fill*al).toFixed(3)})`;ctx.lineWidth=1.3*scale;ctx.beginPath();ctx.arc(x,y,rm+7*scale,0,TAU);ctx.stroke();ctx.restore();}
  // The slingshot star carries a sling (miqlāʿ): a pouch cut in brass under it and its two cords.
  if(n.type==='sling'){const R=n.r*scale*.86;ctx.save();ctx.globalAlpha=al;ctx.strokeStyle=`rgba(${P.verm},.85)`;ctx.lineWidth=1.3*scale;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(x,y,R,Math.PI*.2,Math.PI*.8);ctx.stroke();ctx.lineWidth=.5*scale;ctx.strokeStyle=`rgba(${P.ink},.7)`;
    ctx.beginPath();ctx.moveTo(x+Math.cos(Math.PI*.2)*R,y+Math.sin(Math.PI*.2)*R);ctx.lineTo(x+R*.35,y-R*.9);ctx.moveTo(x+Math.cos(Math.PI*.8)*R,y+Math.sin(Math.PI*.8)*R);ctx.lineTo(x-R*.35,y-R*.9);ctx.stroke();ctx.restore();}
  // A wanderer carries no qadr, since al-Ṣūfī measured greatness for the fixed stars alone: only its name,
  // noted in the fihrist the first time a run sights it.
  if(s3>0&&wi>=0){const k=clamp(s3*2-1,0,1),key='planet'+wi;
    if(s3>=.5&&!astroNamed.has(key)){astroNamed.set(key,{id:n.id,i:wi});astroFihristNote('planets',wi);}
    const S=ASTRO_PLANETS[wi];astroNaskh(ctx,S[0],x,y+rm+15*scale,Math.max(13,14*scale),P.ink,.9*al*k,'center',true,true);
    astroGloss(ctx,S[1]+' · A WANDERING STAR',x,y+rm+31*scale,Math.max(9,9.5*scale),P.inkSoft,.85*al*k,'center',true);}
  else if(s3>0&&!n.difficultyChoice){
    const q=astroQadr(n),tx=x+(rm+9*scale)*Math.cos(-.75),ty=y+(rm+9*scale)*Math.sin(-.75);
    astroNaskh(ctx,astroAbjad(q),tx+3*scale,ty,Math.max(11,12*scale),P.ink,.9*al*s3,'left',true,true);
    let named=astroNamed.get(n.id);if(named===undefined&&q<=2&&s3>=.5){named={id:n.id,i:astroNameNext===0?0:1+((astroNameNext-1+((world.seed|0)>>>0))%(ASTRO_STARS.length-1))};astroNameNext++;astroNamed.set(n.id,named);astroFihristNote('stars',named.i);}
    if(named&&named.id===n.id){const S=ASTRO_STARS[named.i],k=clamp(s3*2-1,0,1);
      astroNaskh(ctx,S[0],x,y+rm+15*scale,Math.max(13,14*scale),P.ink,.9*al*k,'center',true,true);
      astroGloss(ctx,S[1],x,y+rm+31*scale,Math.max(9,9.5*scale),P.inkSoft,.85*al*k,'center',true);}
  }
}
// A light not yet reached: an unadorned punched point, its sighting cross, and nothing else.
function astroPhenomenon(n,x,y,tier){
  const r=(tier==='major'?2.6:tier==='bright'?2.2:tier==='moon'?3:1.8)*scale,fading=n.type==='fading';
  astroPoint(x,y,r,fading?.5:1);astroCross(x,y,r,fading?.3:.55);
}
// The charges, as the things this workshop kept: a round buckler (dirʿ) for the shield; Ibn al-Haytham's
// burning mirror, parallel rays gathered to its focus, for the reflector; the sun half over a horizon line
// for the dawn charge; and a scribe's pen-case and ink (dawāh) for the inkwell.
const ASTRO_GIFTS={shield:1,reflector:1,dawn:1,inkwell:1};
function astroGift(n,x,y,r,used){
  const P=ink.astro,k=used?.35:1;ctx.save();ctx.translate(x,y);ctx.globalAlpha=k;ctx.lineJoin='round';ctx.lineCap='round';
  if(n.type==='shield'){const R=r*.5;ctx.fillStyle=astroBrass(ctx,-R,-R,R,R);ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.fill();ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=1*scale;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,R*.72,0,TAU);ctx.lineWidth=.5*scale;ctx.stroke();for(let i=0;i<8;i++){const a=i/8*TAU;ctx.beginPath();ctx.arc(Math.cos(a)*R*.72,Math.sin(a)*R*.72,R*.14,0,TAU);ctx.stroke();}
    astroKhatam(ctx,0,0,R*.34,`rgb(${P.brassHi})`,`rgb(${P.groove})`,.6*scale);}
  else if(n.type==='reflector'){const R=r*.5;ctx.strokeStyle=`rgb(${P.silver})`;ctx.lineWidth=3*scale;ctx.beginPath();ctx.arc(-R*.9,0,R*1.3,-.62,.62);ctx.stroke();
    ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=.7*scale;ctx.beginPath();ctx.arc(-R*.9,0,R*1.3+1.6*scale,-.62,.62);ctx.stroke();
    const fx=-R*.9+R*.65;ctx.strokeStyle=`rgba(${P.ink},.75)`;ctx.lineWidth=.5*scale;
    for(let i=-2;i<=2;i++){const yy=i*R*.26,hx=-R*.9+Math.sqrt(Math.max(0,(R*1.3)**2-yy*yy));ctx.beginPath();ctx.moveTo(-R*1.8,yy);ctx.lineTo(hx,yy);ctx.lineTo(fx,0);ctx.stroke();}
    ctx.fillStyle=`rgb(${P.verm})`;ctx.beginPath();ctx.arc(fx,0,1.6*scale,0,TAU);ctx.fill();}
  else if(n.type==='dawn'){const R=r*.4;ctx.save();ctx.beginPath();ctx.rect(-r,-r,r*2,r+R*.1);ctx.clip();ctx.fillStyle=`rgb(${P.gilt})`;ctx.beginPath();ctx.arc(0,R*.1,R,0,TAU);ctx.fill();ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=.7*scale;ctx.stroke();ctx.restore();
    ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=1.1*scale;ctx.beginPath();ctx.moveTo(-r*.7,R*.1);ctx.lineTo(r*.7,R*.1);ctx.stroke();
    ctx.lineWidth=.55*scale;ctx.beginPath();for(let i=0;i<9;i++){const a=-Math.PI*(.06+i*.11);ctx.moveTo(Math.cos(a)*R*1.25,R*.1+Math.sin(a)*R*1.25);ctx.lineTo(Math.cos(a)*R*(i%2?1.55:1.8),R*.1+Math.sin(a)*R*(i%2?1.55:1.8));}ctx.stroke();}
  else{const w=r*.95,h=r*.34;ctx.fillStyle=astroBrass(ctx,0,-h,0,h);ctx.beginPath();ctx.roundRect?ctx.roundRect(-w/2,-h/2,w,h,h/2):ctx.rect(-w/2,-h/2,w,h);ctx.fill();ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=.8*scale;ctx.stroke();
    ctx.fillStyle=`rgb(${P.tarnish})`;ctx.beginPath();ctx.arc(w*.28,0,h*.3,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(${P.ink},.9)`;ctx.lineWidth=1*scale;ctx.beginPath();ctx.moveTo(-w*.42,-h*1.1);ctx.lineTo(w*.18,h*.2);ctx.stroke();
    for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(${P.groove},.6)`;ctx.lineWidth=.4*scale;ctx.beginPath();ctx.arc(-w*.18+i*w*.1,0,h*.2,0,TAU);ctx.stroke();}}
  ctx.restore();
}
function astroNode(n,aim){
  const gap=astroTitleGap;if(!gap)return astroNodeDrawn(n,aim);
  ctx.save();ctx.beginPath();ctx.rect(-W,-H,W*3,H*3);ctx.rect(gap.x0,gap.y0,gap.x1-gap.x0,gap.y1-gap.y0);ctx.clip('evenodd');astroNodeDrawn(n,aim);ctx.restore();
}
function astroNodeDrawn(n,aim){
  astroRun();
  const pen=revealNode(n);if(pen.t<=0)return;
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=!!(aim&&aim.n.id===n.id);
  const x=sx(n.x),y=sy(n.y),cap=n.cap*scale;
  if(y<-cap*2-60||y>H+cap*2+60)return;
  const tier=astroTier(n),state=active||target?1:used?.3:.62;
  astroRing(n,x,y,cap,state,pen.ring);
  if(ASTRO_GIFTS[n.type])astroGift(n,x,y,n.r*scale,used);
  else if(n.difficultyChoice||pen.taken>0)astroBody(n,x,y,tier,pen.d,n.difficultyChoice?1:pen.taken);
  else astroPhenomenon(n,x,y,tier);
  if(active)astroReleaseMarks(n,p,x,y);
}

// ---------- The dangers ----------
// raʾs al-tinnīn, the dragon's head, for the pull: the Moon's ascending node, the term every zīj's eclipse
// tables are built on, drawn as a coiled and knotted dragon engraved round its lethal core with its head at
// the pull. The concept is attested; its placement as a figure here is the era file's own flagged invention.
// The core's wash is exactly the core's radius, since the reach a danger is drawn at must never lie.
function astroDragon(h,x,y){
  const P=ink.astro,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time,spin=t*.22+h.seed%7;
  ctx.save();
  const wg=ctx.createRadialGradient(x,y,0,x,y,core);wg.addColorStop(0,`rgba(${P.tarnish},.5)`);wg.addColorStop(.85,`rgba(${P.patina},.3)`);wg.addColorStop(1,`rgba(${P.patina},.08)`);
  ctx.fillStyle=wg;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
  ctx.setLineDash([1.5*scale,2.5*scale]);for(let i=0;i<3;i++){const f=((t*.25+i/3)%1),r=core+(1-f)*(reach-core);ctx.strokeStyle=`rgba(${P.ink},${(f*.4).toFixed(3)})`;ctx.lineWidth=(.5+f*.5)*scale;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}ctx.setLineDash([]);
  // the body: a band round the core, a loop knotted in it half way, thinning to a tail at the head's jaws
  const rb=core*1.22,bw=Math.max(2.4,core*.2),N=120,pts=[];
  const kw=.14,lp=rb*.34;
  for(let i=0;i<=N;i++){const u=i/N,k=u-.5+kw/2,ph=k>0&&k<kw?k/kw*TAU:0,a=spin+u*TAU*.9-lp*Math.sin(ph)/rb,lr=rb+Math.sin(u*TAU*9)*bw*.12+lp*(1-Math.cos(ph));pts.push([x+Math.cos(a)*lr,y+Math.sin(a)*lr,u]);}
  const wid=u=>bw*(u<.08?.35+u/.08*.65:u>.9?1-(u-.9)/.1*.2:1);
  ctx.lineCap='round';ctx.lineJoin='round';
  for(let pass=0;pass<2;pass++){for(let i=1;i<pts.length;i++){const [x0,y0,u]=pts[i-1],[x1,y1]=pts[i];ctx.strokeStyle=pass?`rgb(${P.brass})`:`rgb(${P.groove})`;ctx.lineWidth=pass?wid(u):wid(u)+1.4*scale;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}}
  ctx.strokeStyle=`rgba(${P.groove},.6)`;ctx.lineWidth=.4*scale;ctx.beginPath();for(let i=2;i<pts.length-2;i+=2){const [x0,y0]=pts[i],[x1,y1]=pts[i+1],dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,w=wid(pts[i][2])*.42;ctx.moveTo(x0-dy/l*w,y0+dx/l*w);ctx.lineTo(x0+dx/l*w*.6,y0+dy/l*w*.6);ctx.lineTo(x0+dy/l*w,y0-dx/l*w);}ctx.stroke();
  // the head at the body's end, jaws open toward the core
  const [hx,hy]=pts[pts.length-1],ha=Math.atan2(y-hy,x-hx)+.5,hs=bw*1.6;
  ctx.save();ctx.translate(hx,hy);ctx.rotate(ha);ctx.fillStyle=`rgb(${P.brass})`;ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=.8*scale;
  ctx.beginPath();ctx.moveTo(-hs*.5,-hs*.55);ctx.quadraticCurveTo(hs*.4,-hs*.8,hs*1.25,-hs*.35);ctx.lineTo(hs*.55,-hs*.05);ctx.lineTo(hs*1.15,hs*.3);ctx.quadraticCurveTo(hs*.3,hs*.7,-hs*.5,hs*.5);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=`rgb(${P.verm})`;ctx.beginPath();ctx.arc(hs*.35,-hs*.35,Math.max(.8,hs*.1),0,TAU);ctx.fill();
  ctx.beginPath();ctx.moveTo(-hs*.3,-hs*.5);ctx.quadraticCurveTo(-hs*.9,-hs*1.2,-hs*.2,-hs*1.3);ctx.stroke();ctx.restore();
  astroNaskh(ctx,'رأس التنين',x+core+10*scale,y-core-6*scale,Math.max(11,12*scale),P.ink,.8,'left');
  ctx.restore();
}
// al-Shams, the sun's burning, for the push: a gilt disc with fine lines struck outward from it at even
// angles, the shadow square's own ruled divisions rather than a painted sunburst.
function astroSun(h,x,y){
  const P=ink.astro,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time;
  ctx.save();
  const n=36;ctx.lineCap='butt';
  for(let i=0;i<n;i++){const a=i/n*TAU+h.seed%5,long=i%3===0,r1=core*1.12,r2=long?reach*.96:lerp(core*1.4,reach*.7,.5+.5*Math.sin(i*1.7));ctx.strokeStyle=`rgba(${P.groove},${long?.6:.35})`;ctx.lineWidth=(long?.7:.45)*scale;
    ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);ctx.lineTo(x+Math.cos(a)*r2,y+Math.sin(a)*r2);ctx.stroke();}
  for(let i=0;i<3;i++){const f=((t*.3+i/3)%1),r=core+f*(reach-core);ctx.strokeStyle=`rgba(${P.giltDeep},${((1-f)*.45).toFixed(3)})`;ctx.lineWidth=.6*scale;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
  const gr=ctx.createRadialGradient(x-core*.3,y-core*.35,0,x,y,core);gr.addColorStop(0,'#F7E39A');gr.addColorStop(.6,`rgb(${P.gilt})`);gr.addColorStop(1,`rgb(${P.giltDeep})`);
  ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=1*scale;ctx.stroke();
  ctx.strokeStyle=`rgba(${P.groove},.5)`;ctx.lineWidth=.5*scale;ctx.beginPath();ctx.arc(x,y,core*.72,0,TAU);ctx.stroke();
  astroNaskh(ctx,'الشمس',x+core+10*scale,y-core-4*scale,Math.max(11,12*scale),P.ink,.8,'left');
  ctx.restore();
}
// al-Rīḥ, the wind (sammūm, the hot one, in the period texts), for the crosswind: a compass-rose fragment,
// a few rhumb lines struck out from a point, the same drafting mark an azimuth line uses on this instrument,
// and the gust itself as ruled lines drifting across its field.
function astroWind(h,x,y){
  const P=ink.astro,reach=gravityRadius(h)*scale;if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const t=reducedMotion?0:world.time,dir=h.dir||0;
  ctx.save();ctx.translate(x,y);ctx.rotate(dir);ctx.beginPath();ctx.arc(0,0,reach,0,TAU);ctx.clip();
  ctx.lineCap='round';
  for(let i=0;i<7;i++){const lane=(astroHash(h.seed,i,1)-.5)*reach*1.5,len=reach*(.5+astroHash(h.seed,i,3)*.5),x0=((t*26*scale+astroHash(h.seed,i,2)*reach*2)%(reach*2.6))-reach*1.3;
    ctx.strokeStyle=`rgba(${P.ink},${(.3+astroHash(h.seed,i,5)*.2).toFixed(3)})`;ctx.lineWidth=.6*scale;ctx.setLineDash([6*scale,3*scale]);ctx.beginPath();ctx.moveTo(x0,lane);ctx.lineTo(x0+len,lane);ctx.stroke();
    ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(x0+len,lane);ctx.lineTo(x0+len-3*scale,lane-1.6*scale);ctx.moveTo(x0+len,lane);ctx.lineTo(x0+len-3*scale,lane+1.6*scale);ctx.stroke();}
  ctx.restore();
  const rx=x-Math.cos(dir)*reach*.78,ry=y-Math.sin(dir)*reach*.78,R=10*scale;ctx.save();ctx.strokeStyle=`rgba(${P.ink},.62)`;ctx.lineWidth=.5*scale;
  ctx.beginPath();ctx.arc(rx,ry,R*.3,0,TAU);ctx.stroke();ctx.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,L=i%4===0?R*1.4:i%2===0?R:R*.65;ctx.moveTo(rx+Math.cos(a)*R*.3,ry+Math.sin(a)*R*.3);ctx.lineTo(rx+Math.cos(a)*L,ry+Math.sin(a)*L);}ctx.stroke();
  ctx.strokeStyle=`rgba(${P.verm},.9)`;ctx.lineWidth=1.4*scale;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx+Math.cos(dir)*R*2.2,ry+Math.sin(dir)*R*2.2);ctx.stroke();
  astroNaskh(ctx,'الريح',rx,ry-R*1.9,Math.max(10,11*scale),P.ink,.75);
  ctx.restore();
}
// al-Ṣūfī's little cloud, for the obscurer: a loose scatter of small unengraved, unlit points — the one thing
// on the sheet drawn by the absence of its engraving, since no period image of a nebula as a danger exists.
function astroCloud(h,x,y){
  const P=ink.astro,R=h.r*scale;if(y+R<-20||y-R>H+20)return;
  ctx.save();const wg=ctx.createRadialGradient(x,y,0,x,y,R);wg.addColorStop(0,`rgba(${P.paperDeep},.55)`);wg.addColorStop(1,`rgba(${P.paperDeep},0)`);ctx.fillStyle=wg;ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.fill();
  const t=reducedMotion?0:world.time;
  for(let i=0;i<46;i++){const a=astroHash(h.seed,i,1)*TAU+Math.sin(t*.1+i)*.02,d=Math.sqrt(astroHash(h.seed,i,2))*R*.92,r=(.5+astroHash(h.seed,i,3)*1.1)*scale;
    ctx.strokeStyle=`rgba(${P.faded},${(.35+astroHash(h.seed,i,4)*.35).toFixed(3)})`;ctx.lineWidth=.45*scale;ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,r,0,TAU);ctx.stroke();}
  astroNaskh(ctx,'لطخة سحابية',x,y-R-8*scale,Math.max(10,11*scale),P.ink,.72);
  ctx.restore();
}
function astroHazard(h){
  const x=sx(h.x),y=sy(h.y);
  if(h.kind==='nebula')return astroCloud(h,x,y);
  if(h.kind==='wind')return astroWind(h,x,y);
  const reach=gravityRadius(h)*scale;if(y+reach<-20||y-reach>H+20)return;
  if(h.kind==='flare')return astroSun(h,x,y);
  return astroDragon(h,x,y);
}
// A danger comes onto the sheet the way an engraver cuts a disc: swept round from its top by the alidade's
// edge, a sector opening clockwise until the whole field stands.
function astroHazardReveal(h,draw,t){
  const x=sx(h.x),y=sy(h.y),R=(gravityRadius(h)+20)*scale,e=1-Math.pow(1-t,3);
  ctx.save();ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,R,-Math.PI/2,-Math.PI/2+TAU*e);ctx.closePath();ctx.clip();draw(h);ctx.restore();
  if(e<1){const a=-Math.PI/2+TAU*e,L=gravityRadius(h)*scale;ctx.save();ctx.strokeStyle=`rgba(${ink.astro.ink},${(.35*(1-e)).toFixed(3)})`;ctx.lineWidth=.6*scale;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);ctx.stroke();ctx.restore();}
}

// ---------- The flight: the wet line, the faded construction, the pricked guide ----------
// The line laid behind the alidade is lamp-black ḥibr, still wet and glossy near the instrument; the course
// already flown is that same line gone to a construction line, dashed and fading toward the page's own tone
// the way manuscript ink fails. The guide ahead is pricked — dots, never a ruled line — so the solid brass of
// the alidade and the dotted guide can never read as one.
function astroTrail(){
  const tr=world.trail;if(tr.length<2)return;const P=ink.astro;
  const pts=[];for(const s of tr){const life=clamp(1-(world.time-s.time)/TRAIL_LIFE,0,1);if(life>0)pts.push([sx(s.x),sy(s.y),life]);}
  const p=world.player;if(world.state!=='dead')pts.push([sx(p.x),sy(p.y),1]);if(pts.length<2)return;
  ctx.save();ctx.lineCap='round';
  for(let i=1;i<pts.length;i++){const f=pts[i][2];ctx.strokeStyle=`rgba(${P.ink},${(.12+f*.78).toFixed(3)})`;ctx.lineWidth=(.7+f*1.2)*scale;ctx.beginPath();ctx.moveTo(pts[i-1][0],pts[i-1][1]);ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();}
  const tail=Math.max(0,pts.length-10);ctx.strokeStyle='rgba(255,248,226,.5)';ctx.lineWidth=.35;ctx.beginPath();
  for(let i=tail;i<pts.length;i++)i>tail?ctx.lineTo(pts[i][0]-.4,pts[i][1]-.4):ctx.moveTo(pts[i][0]-.4,pts[i][1]-.4);ctx.stroke();
  ctx.restore();
}
// The dashes are phased off each sample's own distance along the whole route (`cd`, the field the ceiling
// and the scroll keep), not off the oldest sample still held: a dash pattern starts wherever its path
// starts, so every time the tail was pruned the whole construction line slid along the flight.
function astroInkPath(){
  const Q=world.inkPath;if(Q.length<2)return;const P=ink.astro;
  if(Q[0].cd===undefined)Q[0].cd=0;
  for(let i=1;i<Q.length;i++)if(Q[i].cd===undefined)Q[i].cd=Q[i-1].cd+Math.hypot(Q[i].x-Q[i-1].x,Q[i].y-Q[i-1].y);
  ctx.save();ctx.lineCap='butt';ctx.strokeStyle=`rgba(${P.faded},.62)`;ctx.lineWidth=Math.max(.7,.9*scale);ctx.setLineDash([5*scale,3.5*scale]);ctx.lineDashOffset=(Q[0].cd*scale)%(8.5*scale);
  ctx.beginPath();ctx.moveTo(sx(Q[0].x),sy(Q[0].y));for(let i=1;i<Q.length;i++)ctx.lineTo(sx(Q[i].x),sy(Q[i].y));ctx.stroke();ctx.restore();
}
function astroAim(aim,preview){
  const P=ink.astro,points=preview.points,warn=preview.blocked||aim?.steep,end=points[points.length-1];
  const dryFrom=preview.inkRange>=0&&end.distance>0?clamp(preview.inkRange/end.distance,0,1):1;
  const Q=points.map(q=>[sx(q.x),sy(q.y)]),lens=[0];for(let i=1;i<Q.length;i++)lens.push(lens[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));const total=lens[lens.length-1];if(total<2)return;
  const at=d=>{let i=1;while(i<Q.length-1&&lens[i]<d)i++;const t=(d-lens[i-1])/((lens[i]-lens[i-1])||1);return[Q[i-1][0]+(Q[i][0]-Q[i-1][0])*t,Q[i-1][1]+(Q[i][1]-Q[i-1][1])*t];};
  // The pricks hold still; stepped forward on the clock they read as the guide itself crawling.
  ctx.save();const step=6.5*scale,start=27*scale;
  for(let d=start;d<total;d+=step){const f=d/total,q=at(d),dry=f>dryFrom;
    ctx.fillStyle=dry?`rgba(${P.faded},${(.4*(1-f*.4)).toFixed(3)})`:warn?`rgba(${P.verm},${(.9*(1-f*.3)).toFixed(3)})`:`rgba(${P.ink},${((aim?.85:.6)*(1-f*.35)).toFixed(3)})`;
    ctx.beginPath();ctx.arc(q[0],q[1],(aim?1.05:.85)*(1-.35*f)*scale+.3,0,TAU);ctx.fill();}
  if(aim?.perfect&&!preview.fogged){const x=sx(aim.cx+Math.cos(aim.entryAngle)*aim.radius),y=sy(aim.cy+Math.sin(aim.entryAngle)*aim.radius);astroKhatam(ctx,x,y,3*scale,`rgb(${P.gilt})`,`rgba(${P.groove},.8)`,.5);}
  ctx.restore();
}

// ---------- The traveller: the alidade, the Observer Core at its forward pinnule ----------
// A short brass rule pivoting on the sheet's own pin, laid along the flight's tangent, its two ends cut to
// the fiducial point and a pinnule standing up at each: a small pierced vane, the hole the line of sight
// passes through. The Core sits at the forward pinnule's hole — literally a hole drilled in metal with a
// point of light showing through it. The whole bar is drawn visibly shorter than the pricked guide ahead,
// and in solid brass against the guide's ink dots, so the two lines never fuse.
let astroAlidadeArt=null,astroAlidadeKey='';
function astroAlidadeSprite(){
  const key=DPR.toFixed(2);if(astroAlidadeArt&&astroAlidadeKey===key)return astroAlidadeArt;
  const P=ink.astro,S=1.2,size=64,c=makeCanvas(Math.round(size*DPR),Math.round(size*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);g.scale(S,S);
  g.fillStyle='rgba(40,28,14,.14)';g.beginPath();g.ellipse(-.5,2,17,3.4,0,0,TAU);g.fill();
  const bar=()=>{g.beginPath();g.moveTo(-19,0);g.lineTo(-15,-2.2);g.lineTo(15,-2.2);g.lineTo(19,0);g.lineTo(15,2.2);g.lineTo(-15,2.2);g.closePath();};
  bar();g.fillStyle=astroBrass(g,0,-2.2,0,2.2,1.3);g.fill();g.strokeStyle=`rgb(${P.groove})`;g.lineWidth=.55;g.stroke();
  g.strokeStyle=`rgba(${P.groove},.7)`;g.lineWidth=.3;g.beginPath();g.moveTo(-18,0);g.lineTo(18,0);g.stroke();
  // a few degree cuts along the fiducial edge
  g.beginPath();for(let x=-12;x<=12;x+=2){g.moveTo(x,-2.2);g.lineTo(x,x%6===0?-1.1:-1.6);}g.stroke();
  // the pinnules, seen from above as two raised vanes across the bar, each pierced
  for(const px of[-9.5,9.5]){g.fillStyle=astroBrass(g,px-1.3,-4,px+1.3,4,1.5);g.fillRect(px-1.2,-4.2,2.4,8.4);g.strokeStyle=`rgb(${P.groove})`;g.lineWidth=.45;g.strokeRect(px-1.2,-4.2,2.4,8.4);
    g.fillStyle=`rgb(${P.tarnish})`;g.beginPath();g.arc(px,0,.8,0,TAU);g.fill();}
  // the pin and its wedge
  g.fillStyle=astroBrass(g,-1.6,-1.6,1.6,1.6,1.6);g.beginPath();g.arc(0,0,1.9,0,TAU);g.fill();g.strokeStyle=`rgb(${P.groove})`;g.lineWidth=.45;g.stroke();
  g.fillStyle=`rgb(${P.brassLo})`;g.fillRect(-.35,-2.6,.7,5.2);
  astroAlidadeArt={canvas:c,size,S,core:9.5*S};astroAlidadeKey=key;return astroAlidadeArt;
}
function astroPlayer(){
  if(world.state==='dead')return;
  const P=ink.astro,p=world.player,x=sx(p.x),y=sy(p.y),ang=Math.atan2(p.vy,p.vx),sp=astroAlidadeSprite(),t=reducedMotion?0:world.time;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);
  ctx.drawImage(sp.canvas,-sp.size/2,-sp.size/2,sp.size,sp.size);
  const ax=sp.core,br=1+.08*Math.sin(t*2.1),hg=ctx.createRadialGradient(ax,0,0,ax,0,10*br);
  hg.addColorStop(0,'rgba(255,250,228,.95)');hg.addColorStop(.35,'rgba(255,240,196,.5)');hg.addColorStop(1,'rgba(255,240,196,0)');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(ax,0,10*br,0,TAU);ctx.fill();ctx.fillStyle=`rgb(${P.core})`;ctx.beginPath();ctx.arc(ax,0,1.9,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=.6;ctx.beginPath();ctx.arc(ax,0,2.5,0,TAU);ctx.stroke();
  // The charges held, round the instrument: the buckler's ring, the mirror's silver arc, the sun's rays.
  if(p.shielded){ctx.strokeStyle=`rgba(${P.brassLo},.8)`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,22,0,TAU);ctx.stroke();ctx.strokeStyle=`rgba(${P.brassHi},.7)`;ctx.lineWidth=.5;ctx.beginPath();ctx.arc(0,0,20.5,0,TAU);ctx.stroke();}
  if(p.reflectorArmed){ctx.strokeStyle=`rgba(${P.silver},.95)`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,25,-.9,.9);ctx.stroke();ctx.strokeStyle=`rgba(${P.groove},.8)`;ctx.lineWidth=.4;ctx.beginPath();ctx.arc(0,0,26.3,-.9,.9);ctx.stroke();}
  if(p.dawnArmed){ctx.strokeStyle=`rgba(${P.giltDeep},.8)`;ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<12;i++){const a=i*TAU/12;ctx.moveTo(Math.cos(a)*17,Math.sin(a)*17);ctx.lineTo(Math.cos(a)*(i%2?19.5:22),Math.sin(a)*(i%2?19.5:22));}ctx.stroke();}
  ctx.restore();
}

// ---------- aẓ-ẓulumāt, "the darknesses": the boundary as tarnish and fading ----------
// Engraved brass tarnishes unevenly, pooling first in the cut lines and spreading until nothing on the
// instrument is handled enough to stay bright; manuscript ink does not corrode but fades toward the page.
// So the page above the loss pales and browns, and the loss itself is tarnished brass rising: a dark patina
// with verdigris blooming in it and the grooves of an old graduation drowned in it, its edge uneven where
// the patina creeps. Its position, rate and grace are untouched: read straight off the state drawDark reads.
function astroFrontAt(xw,level){const lv=Math.floor(level/60);return (astroHash(Math.floor(xw/36),lv,5)-.5)*12*(1-(xw/36%1))+(astroHash(Math.floor(xw/36)+1,lv,5)-.5)*12*(xw/36%1)+Math.sin(xw*.17+lv)*1.8;}
function astroDark(dt){
  const P=ink.astro,fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  const level=world.floorY,step=Math.max(2,2.5*scale),pts=[];
  for(let x=-step;x<=W+step;x+=step){const xw=(x-W*.5)/scale;pts.push([x,fy+astroFrontAt(xw+1000,level)*scale]);}
  ctx.save();
  // the page fading ahead of the loss: ink losing its contrast to the paper, the paper browning
  const reach=(64+near*40)*scale,tg=ctx.createLinearGradient(0,fy-reach,0,fy+6*scale);
  tg.addColorStop(0,`rgba(${P.paper},0)`);tg.addColorStop(.55,`rgba(${P.paper},${(.3+near*.1).toFixed(3)})`);tg.addColorStop(.85,`rgba(150,112,60,${(.18+near*.12).toFixed(3)})`);tg.addColorStop(1,`rgba(${P.patina},.5)`);
  ctx.fillStyle=tg;ctx.fillRect(0,fy-reach,W,reach+8*scale);
  // the tarnish itself
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.lineTo(W+10,H+10);ctx.lineTo(-10,H+10);ctx.closePath();
  const tar=ctx.createLinearGradient(0,fy,0,fy+160*scale);tar.addColorStop(0,`rgba(${P.patina},.97)`);tar.addColorStop(.25,`rgba(${P.tarnish},.98)`);tar.addColorStop(1,`rgba(${P.tarnish},1)`);ctx.fillStyle=tar;ctx.fill();
  ctx.save();ctx.clip();
  const lv=Math.floor(level/60);
  // drowned graduation: old cut lines running across the patina, darker than it, catching no light
  ctx.strokeStyle='rgba(10,8,4,.55)';ctx.lineWidth=.7;ctx.beginPath();for(let y=fy+10*scale;y<H+10;y+=9*scale){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();
  for(let i=0;i<14;i++){const x=astroHash(i,lv,21)*W,y=fy+(12+astroHash(i,lv,22)*120)*scale,r=(6+astroHash(i,lv,23)*16)*scale,g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(${P.verdigris},.45)`);g.addColorStop(1,`rgba(${P.verdigris},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  ctx.restore();
  // the creeping edge: a lip of pale oxide and a line of verdigris pooled in it
  ctx.strokeStyle=`rgba(${P.verdigris},${(.55+near*.2).toFixed(3)})`;ctx.lineWidth=1.6*scale;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
  ctx.strokeStyle='rgba(180,150,96,.4)';ctx.lineWidth=.6;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]-1.4*scale):ctx.moveTo(q[0],q[1]-1.4*scale));ctx.stroke();
  const time=reducedMotion?0:world.time;
  for(let k=0;k<12;k++){const ph=((k*.618+time*(.12+(k%5)*.03))%1+1)%1,x=((k*.3819+lv*.137)%1)*W,y=fy+(astroFrontAt((x-W*.5)/scale+1000,level)-ph*18-2)*scale,r=(.6+(k%3)*.4)*scale,al=(1-ph)*(.3+near*.25);
    if(y<-10||y>H+10||al<.02)continue;ctx.fillStyle=`rgba(${P.verdigris},${al.toFixed(3)})`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  ctx.restore();
}

// ---------- A figure set on the rete ----------
// Where the atlas engraves a constellation-figure, this sheet draws no picture at all: the figure's three
// stars are held by an openwork strap of brass with a flame-shaped pointer to each, exactly as a rete holds
// its stars, and once all three are measured the figure's name is cut beside it in naskh.
function astroFigure(chart){
  if(chart.stars.length<3)return;const P=ink.astro;
  const pts=chart.stars.map(s=>[sx(s.x),sy(s.y)]),ys=pts.map(p=>p[1]);if(Math.max(...ys)<-220||Math.min(...ys)>H+220)return;
  const count=chart.stars.filter(n=>n.visited).length,done=chart.completed,f=chart.expired?.3:done?1:count/3;if(f<=0)return;
  let cx=0,cy=0;for(const p of pts){cx+=p[0];cy+=p[1];}cx/=3;cy/=3;
  // the strap runs through a point set out from each star toward the group's centre, so it never lies on a star
  const roots=pts.map(p=>{const dx=cx-p[0],dy=cy-p[1],l=Math.hypot(dx,dy)||1,o=Math.min(l*.5,22*scale);return[p[0]+dx/l*o,p[1]+dy/l*o];});
  const al=chart.expired?.35:1,w=Math.max(1.6,2.2*scale),links=done?2:Math.max(0,count-1);
  ctx.save();ctx.globalAlpha=al;ctx.lineCap='round';ctx.lineJoin='round';
  // the strap is laid a link at a time as the figure's stars are measured, so an unfinished figure shows
  // exactly how much of it has been set
  const path=()=>{ctx.moveTo(roots[0][0],roots[0][1]);if(links>0)ctx.quadraticCurveTo(cx,cy,roots[1][0],roots[1][1]);if(links>1)ctx.quadraticCurveTo(cx,cy,roots[2][0],roots[2][1]);};
  if(links>0){ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=w+1.3*scale;ctx.beginPath();path();ctx.stroke();ctx.strokeStyle=astroBrass(ctx,cx-40,cy-40,cx+40,cy+40,1.2);ctx.lineWidth=w;ctx.beginPath();path();ctx.stroke();}
  for(let i=0;i<3;i++){if(!chart.stars[i].visited&&!done)continue;astroPointer(ctx,pts[i][0],pts[i][1],roots[i][0],roots[i][1],1.9*scale,done?P.brassHi:P.brass,1);}
  ctx.restore();
  if(!done||chart.expired)return;
  // The name is cut where the strap's arms meet, between the stars rather than over any one of them.
  const F=ASTRO_FIGURES[((chart.catalogueIndex|0)%12+12)%12],x=clamp(cx,70,W-70),y=cy-6*scale;
  astroNaskh(ctx,F[0],x,y,Math.max(15,17*scale),P.ink,.92,'center',true);
  astroGloss(ctx,F[1],x,y+16*scale,Math.max(7.5,8*scale),P.inkSoft,.8);
}

// ---------- The HUD, set in the manuscript's own hand ----------
// The reckoning (ḥisāb) in Eastern Arabic-Indic digits at the head of the sheet, the curator's figure small
// beneath it; the ḥibr as a segment of a graduated limb whose divisions are gilt as far as the ink will
// carry and pricked beyond it, reddening when it will not carry an ordinary transfer; the pace under it;
// clean sightings as a row of khātam stars; and each charge in hand as a small brass roundel lettered in
// naskh. The DOM HUD stays for screen readers and is taken off the screen (index.html).
let astroHudTopPx=null;
function astroHudTop(){
  if(astroHudTopPx!==null)return astroHudTopPx;
  let t=26;try{const e=document.querySelector('.hud'),v=e&&typeof getComputedStyle==='function'?parseFloat(getComputedStyle(e).top):NaN;if(isFinite(v))t=v;}catch(e){}
  return astroHudTopPx=t;
}
function astroRoundel(x,y,r,word){
  const P=ink.astro;ctx.save();ctx.fillStyle=astroBrass(ctx,x-r,y-r,x+r,y+r,1.2);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.strokeStyle=`rgb(${P.groove})`;ctx.lineWidth=.8;ctx.stroke();
  ctx.lineWidth=.4;ctx.beginPath();ctx.arc(x,y,r-2,0,TAU);ctx.stroke();ctx.restore();astroNaskh(ctx,word,x,y+1,r*.9,P.groove,.95,'center',true);
}
function astroHudLeaf(){
  if(!world||world.state==='ready')return;
  if(world.won){astroFinale();return;}
  const P=ink.astro,top=astroHudTop(),words=plateWords().hud,score=world.score|0;
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  const left=ASTRO_BAND+12;
  astroNaskh(ctx,astroDigits(score),left,top+6,20,P.ink,.94,'left',true);
  astroGloss(ctx,String(score),left,top+24,9,P.inkSoft,.7,'left');
  // The ḥibr: a limb segment struck in gilt as far as the ink will carry.
  const level=world.inkLevel(),low=level<=.34,pulse=low&&!reducedMotion?.5+.5*Math.sin(world.time*6):1,span=Math.min(64,W*.16),R=170,cx=W/2,cy=top+14-R,half=Math.asin(span/R),a0=Math.PI/2+half,a1=Math.PI/2-half;
  ctx.lineCap='butt';ctx.strokeStyle=`rgba(${P.groove},.8)`;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(cx,cy,R,a1,a0);ctx.stroke();
  const n=40;for(let i=0;i<=n;i++){const u=i/n,a=a0-(a0-a1)*u,on=u<=level,big=i%10===0,l=big?7:i%5===0?5:3.2,x0=cx+Math.cos(a)*R,y0=cy+Math.sin(a)*R,x1=cx+Math.cos(a)*(R+l),y1=cy+Math.sin(a)*(R+l);
    if(on){ctx.strokeStyle=low?`rgba(${P.verm},${(.55+.45*pulse).toFixed(3)})`:`rgba(${P.giltDeep},.95)`;ctx.lineWidth=big?1.3:.9;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}
    else{ctx.fillStyle=`rgba(${P.inkSoft},.4)`;ctx.beginPath();ctx.arc(x1,y1,.55,0,TAU);ctx.fill();}}
  const la=a0-(a0-a1)*clamp(level,0,1);ctx.strokeStyle=`rgba(${P.ink},.9)`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx+Math.cos(la)*(R-3),cy+Math.sin(la)*(R-3));ctx.lineTo(cx+Math.cos(la)*(R+10),cy+Math.sin(la)*(R+10));ctx.stroke();
  astroNaskh(ctx,'حبر',cx-span-8,top+7,12,P.ink,.8,'right');
  const m=world.speedMultiplier();astroGloss(ctx,words.pace+(m%1?m.toFixed(1):m),cx,top+30,9,P.inkSoft,.75);
  // The chapter, small under the pace: the place the run has reached.
  {const i=Math.min(ASTRO_CHAPTERS.length-1,Math.floor(world.progress/ASTRO_CHAPTER_ROWS));astroNaskh(ctx,ASTRO_CHAPTERS[i].ar,cx,top+44,11,P.inkSoft,.7);}
  // Clean sightings as khātam stars, and the charges held.
  const right=W-ASTRO_BAND-14;let rx=right;
  if(world.combo>1&&world.captures>0){const shown=Math.min(6,world.combo);for(let i=0;i<shown;i++){astroKhatam(ctx,rx,top+6,4.6,`rgb(${P.gilt})`,`rgba(${P.groove},.85)`,.5);rx-=12;}
    if(world.combo>6)astroGloss(ctx,'×'+world.combo,right+4,top+19,9,P.inkSoft,.7,'right');}
  let ix=right;const iy=top+32,p=world.player;
  if(p.shielded){astroRoundel(ix,iy,8,'درع');ix-=20;}
  if(p.reflectorArmed){astroRoundel(ix,iy,8,'مرآة');ix-=20;}
  if(p.dawnArmed){astroRoundel(ix,iy,8,'فجر');ix-=20;}
  ctx.restore();
}
// The finish: Samarkand, 1437, the Zīj finished. The page washes gold, the whole instrument rises gilt
// with its rete turning once on the pin, and the tables' name is set under it; the leaf comes up over this.
function astroFinale(){
  const P=ink.astro,time=world.player.deadTime,t=reducedMotion?1:clamp(time/2.6,0,1),e=1-Math.pow(1-t,3);
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=`rgba(${P.paper},${(.82*e).toFixed(3)})`;ctx.fillRect(0,0,W,H);
  const R=Math.min(W*.32,H*.19),cx=W/2,cy=lerp(H*.62,H*.4,e),glow=ctx.createRadialGradient(cx,cy,R*.4,cx,cy,R*2.4);
  glow.addColorStop(0,`rgba(255,226,140,${(.5*e).toFixed(3)})`);glow.addColorStop(1,'rgba(255,226,140,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=e;ctx.translate(cx,cy);ctx.scale(.7+.3*e,.7+.3*e);astroInstrument(ctx,R,ASTRO_CHAPTERS.length,1,.35+(reducedMotion?0:time*.35),e);
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=1;
  astroNaskh(ctx,'الزيج السلطاني',cx,cy+R+34,28,P.ink,.95*e,'center',true);
  astroGloss(ctx,'THE ZIJ IS COMPLETE',cx,cy+R+62,11,P.ink,.9*e);
  astroGloss(ctx,'SAMARKAND · 1437 · 1,018 STARS OBSERVED AGAIN',cx,cy+R+80,8.5,P.inkSoft,.85*e);
  ctx.restore();
}
// What is written on the sheet — a note, a warning, a landing — is lamp-black on the page.
function astroInscriptionInk(caps){
  return [{rgb:ink.astro.faded,alpha:caps?.2:.16,dx:.3,dy:.35},{rgb:ink.astro.ink,alpha:caps?.92:.84,dx:0,dy:0}];
}
// Fixtures of the printed sheet this one does not have, named as no-ops so the intent is stated rather than
// inferred: the engraved plate-frame (the brass limb down each edge stands in for it), the laid wires (the
// misṭara's blind lines are baked into the ground), the geometer's lettered survey, the lensing swirl, and
// the engraved running head.
function astroNone(){}
function invalidateAstrolabeArt(){astroTile=null;astroTileKey='';astroSprites.clear();astroAlidadeArt=null;astroAlidadeKey='';astroHudTopPx=null;astroRevealCanvas=null;astroRevealKey='';}
// Entering the era asks for the naskh at both weights and repaints the cached art when they land, since a
// face arriving late would otherwise leave its fallback baked into the tile and the title.
function astroFaceReady(){
  if(!document.fonts||!document.fonts.load)return;
  Promise.all([document.fonts.load(plateFace(16,'naskh'),'الأسطرلاب'),document.fonts.load(plateFace(16,'naskhB'),'الأسطرلاب')])
    .then(()=>{invalidateAstrolabeArt();if(world)render(0);}).catch(()=>{});
}

// ---------- A figure's route, before it is set ----------
// Where the atlas engraves a route with star markers, this sheet strings a figure the way Ibn al-Haytham
// strings a proof: straight construction lines, dashed while they are only proposed and drawn solid in ink
// once both ends are measured, each star lettered at its vertex in abjad order (ا, ب, ج), and the figure's
// Arabic name set small by its middle star while the route is live.
function astroChartRoute(chart){
  if(!chart.stars.length||sy(chart.entry.y)<-150||sy(chart.stars[chart.stars.length-1].y)>H+170)return;
  const P=ink.astro,points=[chart.entry,...chart.stars];if(chart.exit)points.push(chart.exit);
  ctx.save();revealChartClip(chart);ctx.lineCap='round';
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],lit=chart.completed||(a.visited&&b.visited),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
    const ax=sx(a.x+dx/d*(a.cap+10)),ay=sy(a.y+dy/d*(a.cap+10)),bx=sx(b.x-dx/d*(b.cap+10)),by=sy(b.y-dy/d*(b.cap+10));
    ctx.strokeStyle=`rgba(${lit?P.ink:P.faded},${chart.expired?.12:lit?.55:.45})`;ctx.lineWidth=(lit?.7:.55)*scale;ctx.setLineDash(lit?[]:[4*scale,4*scale]);
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
  }
  ctx.setLineDash([]);
  chart.stars.forEach((n,i)=>{const x=sx(n.x)-(n.r*.62+8)*scale,y=sy(n.y)-(n.r*.62+8)*scale;
    astroNaskh(ctx,ASTRO_VERTICES[i],x,y,Math.max(11,12*scale),n.visited?P.ink:P.faded,chart.expired?.2:n.visited?.85:.6);});
  if(!chart.expired&&!chart.completed&&!captionsHeld()){const e=chart.stars[1]||chart.stars[0],x=sx(e.x),y=sy(e.y)+e.cap*scale+14*scale;
    if(y>-40&&y<H+40){const F=ASTRO_FIGURES[((chart.catalogueIndex|0)%12+12)%12];astroNaskh(ctx,F[0],x,y,Math.max(11,12*scale),P.inkSoft,.6);}}
  ctx.restore();
}
// The score on the leaf: the reckoning in the manuscript's own digits, cut over a short graduated arc,
// and beneath it how far the fihrist has come.
function astroPaintEndNumerals(canvas,w){
  if(!canvas)return;const P=ink.astro,f=astroFihrist(),np=Object.keys(f.planets).length,text=astroDigits(w.score),Wd=300,Hd=80,dpr=Math.min(Math.max(window.devicePixelRatio||1,1.5),2);
  canvas.width=Math.ceil(Wd*dpr);canvas.height=Math.ceil(Hd*dpr);canvas.style.width=Wd+'px';canvas.style.height=Hd+'px';
  const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,Wd,Hd);
  astroNaskh(g,text,Wd/2,28,40,P.ink,.95,'center',true);
  const R=260,cx=Wd/2,cy=52-R,half=Math.asin(90/R);g.strokeStyle=`rgba(${P.giltDeep},.9)`;g.lineWidth=.8;g.beginPath();g.arc(cx,cy,R,Math.PI/2-half,Math.PI/2+half);g.stroke();
  g.beginPath();for(let i=0;i<=36;i++){const a=Math.PI/2+half-i/36*half*2,l=i%6===0?6:3;g.moveTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);g.lineTo(cx+Math.cos(a)*(R+l),cy+Math.sin(a)*(R+l));}g.lineWidth=.6;g.stroke();
  astroGloss(g,'FIHRIST · '+Object.keys(f.stars).length+' / '+ASTRO_STARS.length+' STARS · '+Object.keys(f.figures).length+' / '+ASTRO_FIGURES.length+' FIGURES'+(np?' · '+np+' / '+ASTRO_PLANETS.length+' WANDERERS':''),Wd/2,71,9,P.giltDeep,.95);
}

// ---------- The instrument's sound: brass, a burin, dividers ----------
// A burin's short dry bite into brass on a capture, with the plate ringing under it; the alidade swinging
// free on its pin at a release, a thin ring quickly damped; a divider's double click for a clean sighting;
// gold leaf burnished for a finished figure; the dragon's dry hiss for the pull; and at the frontier, brass
// gone dull enough to give back nothing. The scale is a plain one on G, kept clear of the augmented second
// a film score reaches for when it wants to say "the East".
const ASTRO_SCALE=[196,220,246.94,261.63,293.66,329.63,392,440,493.88,523.25,587.33,659.25];
defineHand('astrolabe',{
  atmosphere:astroAtmosphere,
  node:astroNode,
  hazard:astroHazard,
  player:astroPlayer,
  dark:astroDark,
  plateFrame:astroNone,
  laid:astroNone,
  figure:astroFigure,
  surveys:astroNone,
  hudLeaf:astroHudLeaf,
  runningHead:astroNone,
  chapterReveal:astroChapterReveal,
  flourish:astroFlourish,
  trail:astroTrail,
  aim:astroAim,
  inkPath:astroInkPath,
  inscriptionInk:astroInscriptionInk,
  lenses:astroNone,
  hazardReveal:astroHazardReveal,
  ready:astroFaceReady,
  best:astroBest,
  caveRun:astroRecordRun,
  caveAnimal:i=>astroFihristNote('figures',((i|0)%12+12)%12),
  chartRoute:astroChartRoute,
  endNumerals:astroPaintEndNumerals,
  scratch:{band:[3000,1600],q:[1.8,1.6],peak:.05,attack:.002,dur:[.018,.03],gap:[.03,.05],ease:.015},
  start(a){a.tone(392,1.6,0,.2);a.tone(587.33,1.4,.14,.13);a.tone(783.99,1.2,.28,.08);a.brush(5200,.1);},
  release(a){a.tone(1318.51,.45,0,.08,'sine',1296);a.tone(880,.3,0,.07);a.brush(4400,.08);},
  capture(a,row,perfect){const n=ASTRO_SCALE[3+Math.floor(row)%6];a.brush(6400,.16);a.tone(n*2,.5,0,.2);a.tone(n*2*2.76,.22,0,.04);
    if(perfect){a.tone(n*3,.55,.08,.1);setTimeout(()=>a.brush(5600,.11),70);}},
  graze(a){a.brush(2400,.12);a.tone(740,.12,0,.05,'sine',700);},
  death(a){a.tone(110,1,0,.4,'triangle',72);a.wash(700,120,.9,.22);},
  medal(a){for(let i=0;i<5;i++)setTimeout(()=>a.brush(900+i*120,.12),i*70);a.tone(523.25,1.4,.1,.16);a.tone(783.99,1.3,.24,.12);},
  chapter(a,i){astroNoteChapter(i);a.tone(392,2,0,.2);a.tone(392*2.76,1.1,0,.05);a.tone(ASTRO_SCALE[6+i%5],1.8,.3,.14);a.brush(5200,.08);},
  dawn(a){astroNoteChapter(ASTRO_CHAPTERS.length-1);a.tone(98,3,0,.16,'triangle');ASTRO_SCALE.forEach((f,i)=>a.tone(f*2,1.6,.12+i*.09,.14));setTimeout(()=>{a.tone(783.99,2.4,0,.14);a.tone(1174.66,2.2,.1,.08);},1300);}
});

// ---------- The vocabulary: only what this era calls differently ----------
// Everything set on this sheet in English is a curator's gloss, in the slab the other eras use, with the
// manuscript's own words in naskh beside it where it has them. A constellation is a figure set on the rete,
// a chapter a door (bāb) of the journey, the score a reckoning, the currency ḥibr, the lamp-black ink, the
// boundary aẓ-ẓulumāt. Names from 04-astrolabe.md.
defineVoice('astrolabe',{
  chart:'RETE FIGURE',
  chartNoun:'figure',
  chartVerb:'set on the rete',
  chartNames:ASTRO_FIGURES.map(f=>f[0]+' · '+f[1]),
  chartSaid:'{chart} is set on the rete. Sixty toward the reckoning. The darknesses hold back for four seconds.',
  chapters:ASTRO_CHAPTERS.map(c=>c.en+' · '+c.year),
  chapterRows:ASTRO_CHAPTER_ROWS,
  goalRow:ASTRO_GOAL_ROW,
  chapterSaid:'Door {numeral}. {name}.',
  // A line for each place as its chapter opens, set on the sheet as a curator's note beside the alidade.
  // Each says only what is known of the place and the work it is named for, and says "roughly" where the
  // number is only reported.
  chapterLines:[
    'Baghdad, 927. Nastulus signs a brass astrolabe and dates it: the oldest whose year we know.',
    'Isfahan, 964. Al-Sufi looks again at every star Ptolemy listed and grades its brightness by his own eye.',
    'Cairo, c. 1027. Ibn al-Haytham proves with geometry that light runs to the eye in straight lines.',
    'Valencia, 1085. Al-Sahli makes a brass globe of the sky: stars punched as points, no colour anywhere.',
    'Maragha, 1259. Al-Tusi’s observatory: a great library, and a quadrant set in a wall, roughly forty metres, it is said.',
    'Samarkand, 1428. Ulugh Beg cuts his sextant into the hill itself, so the arc can never move.'
  ],
  // A note for each figure as it is set: one thing its Arabic names still carry.
  chartNotes:[
    'Al-Sufi drew every figure twice: once as it stands on a globe, once as it stands in the sky.',
    'Rigel is rijl al-jabbar, the Giant’s foot: the star kept its Arabic name in Latin.',
    'Regulus was qalb al-asad, the heart of the lion.',
    'Antares was qalb al-aqrab, the heart of the scorpion.',
    'Aldebaran is al-dabaran, the follower: it follows the Pleiades across the sky.',
    'Deneb is dhanab, the tail: the tail of the hen.',
    'Alphard is al-fard, the solitary one, alone in an empty part of the sky.',
    'Markab is the saddle; Scheat, the upper arm: names still read off the Arabic.',
    'Al-Sufi notes a little cloud beside the Chained Woman: the first written record of another galaxy.',
    'Vega is from al-nasr al-waqi, the swooping eagle.',
    'Altair is from al-nasr al-tair, the flying eagle.',
    'Dhat al-kursi, she of the throne. The astrolabe hangs from a throne too.'
  ],
  opening:'The alidade is raised. Tap to release. Follow the pricked line to the next light. Hold a light until its scale closes to measure it and to take up more ink; every flight spends ink by the distance it carries. Carry the measure from Baghdad to Samarkand.',
  ended:'The brass has tarnished. Reckoning {score}. Tap to take up the alidade again, or return to the atlas.',
  won:'The Zij is complete. Samarkand, 1437, with a reckoning of {score}. Tap to begin the journey again or return to the atlas.',
  unrecorded:'ERA PREVIEW · NOT RECORDED',
  newRecord:'A NEW RECKONING',
  hazards:{vortex:'رأس التنين · THE DRAGON’S HEAD',flare:'الشمس · THE SUN’S BURNING',wind:'الريح · THE WIND'},
  labels:{shield:'THE BUCKLER',reflector:'THE BURNING MIRROR',dawn:'THE RISING SUN'},
  pressures:{relaxed:'القمر · THE MOON',classic:'A BRIGHT STAR',hardcore:'A FAINT STAR'},
  pressureSet:'THE SIGHTING IS SET · {label}',
  losses:{
    'THE DARK CAUGHT UP':'THE DARKNESSES TOOK THE BRASS',
    'LEFT THE STAR CHART':'OFF THE EDGE OF THE LIMB',
    'THE ORBIT FADED':'THE STAR WAS LOST',
    'THE NIB RAN DRY':'THE INK RAN OUT',
    'DRAWN INTO A VORTEX':'SWALLOWED AT THE DRAGON’S HEAD',
    'SEARED BY A SUNSPOT FLARE':'BURNED BY THE SUN',
    'THE SUN ROSE':'THE ZIJ IS COMPLETE'
  },
  observations:{
    perfectThree:'THREE CLEAN SIGHTINGS',
    skipFive:'FIVE STARS PASSED OVER',
    maxSpeed:'THE ALIDADE AT FULL SWING',
    graze:'THE DRAGON GRAZED AT FULL SWING',
    pureChart:'A FIGURE IN CLEAN SIGHTINGS',
    fortyRows:'THE FORTIETH ROW',
    threeMinutes:'THREE MINUTES AT THE INSTRUMENT',
    rightAngle:'A SQUARE SIGHTING'
  },
  squareLanding:'A SQUARE SIGHTING',
  hud:{pace:'SWING ×',flow:'ORDER ×',shield:'THE BUCKLER HELD',reflector:'THE MIRROR HELD',dawn:'THE RISING SUN HELD'},
  chrome:{
    brand:'الأسطرلاب',bestLabel:'Best reckoning',endTitle:'The brass has tarnished.',endTitleWon:'The Zij is complete.',pauseTitle:'The instrument rests.',
    pauseEyebrow:'THE ALIDADE IS STILL',pauseNote:'Tap the plate to continue',pauseResume:'TAKE UP THE ALIDADE',
    pauseLeave:'HANG UP THE ASTROLABE',pauseLabel:'Rest the alidade',gameLabel:'The Astrolabe, a playable Era IV preview',
    canvasLabel:'The Astrolabe. Guide a brass alidade from Baghdad to Samarkand, measuring each star you hold. Tap or press Space to release.',
    eraExit:'BACK TO THE ATLAS',eraExitLabel:'Back to the atlas',endAction:'Tap to take up the alidade again',endActionWon:'Tap to begin the journey again',
    statCaptures:'Stars',statPerfects:'Clean',statFlow:'Best order',statRow:'Row',
    instructions:{head:'THE MANNER OF SIGHTING',rules:['Tap to release the alidade.','Hold a star until its scale closes and the qadr is cut.','Keep ahead of the darknesses, the brass tarnishing below.','Six doors from Baghdad to Samarkand. Choose the first star — {pressures}.']}
  },
  tips:{
    first:'Release when the pricked line reaches the next star.',
    dark:'Hold a star for swing and ink. The tarnish climbs faster below.',
    faded:'A pale star fades. Measure it and move on.',
    vortex:'The dragon’s head pulls a flight toward it. Give the knot room.',
    angle:'Meet the rim along its curve for a clean sighting.',
    speed:'Clean sightings keep your swing.',
    won:'Six doors, one instrument, and the tables are finished.'
  },
  glosses:{
    slingshot:'THE SLING DRAWN · SWING ×{factor}',
    maxSpeed:'FULL SWING · HOLD THE LINE',
    fullCharge:'THE INKWELL IS FULL · SWING IS YOURS',
    rough:'A ROUGH SIGHTING · BASE {base}',
    skip:'{count} STAR{plural} PASSED OVER · +{bonus}',
    reprieve:'MEASURE 3 STARS · +60 & A REPRIEVE',
    slingOrbit:'CIRCLE TO DRAW THE SLING · TAP TO LEAVE',
    fading:'A PALE STAR · KEEP MOVING',
    golden:'A GILT FIND',
    perfectFlow:'CLEAN SIGHTING · ORDER ×{combo}',
    perfect:'CLEAN SIGHTING',
    wandering:'A WANDERING STAR · كوكب سيار',
    chartProgress:'{chart} · {count} / 3',
    chartComplete:'{chart} · SET +60',
    angleBonus:'  ·  TRUE ENTRY +{bonus}',
    multiplier:'  ·  ×{mult}',
    shieldArmed:'{label} · TURNS ONE BLOW',
    shieldBreak:'{label} SPENT · TOOK THE HIT',
    reflectorArmed:'{label} · SENDS YOU BACK FROM THE EDGE',
    reflectorBreak:'{label} TURNED YOU BACK',
    dawnArmed:'{label} · HOLDS THE DARKNESSES BACK',
    dawnBreak:'{label} PUSHED THE DARKNESSES BACK',
    inkwellFound:'THE PEN-CASE · FRESH INK',
    inkwellDry:'THE INK RUNS LOW · FILL IT FIRST',
    observation:'MEASURED · {name}',
    close:'CLOSE +5'
  },
  held:{
    choose:'The first star you hold sets how fast the brass tarnishes.',
    dry:'The ink is running low. Hold this star to take up more.',
    sling:'One circle builds swing. Meet the next cleanly and it holds.',
    release:'Release when the pricked line meets the next star.',
    bend:'The dragon’s head bends the course. Follow the pricked line; give it room.'
  }
});
