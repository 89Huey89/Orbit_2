'use strict';
/* Orbit · src/plates.js
   Render globals, storage, difficulty, the star field, and the plate system (night and paper colour tokens). */
// ---------- Canvas artwork: an engraved celestial atlas ----------
const game=document.getElementById('game'),canvas=document.getElementById('sky'),ctx=canvas.getContext('2d',{alpha:false});
const $=id=>document.getElementById(id);
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let W=0,H=0,DPR=1,scale=1,world,trail=[],inkPath=[],particles=[],rings=[],floaters=[],surveys=[],glyphs=new Map();
// Height in CSS pixels of the DOM HUD band across the top of the plate, mirroring the CSS: the header sits
// higher and prints smaller on short landscape screens and lower on wide ones. Canvas lettering keeps below it.
function hudBand(){return H<=530&&W>H?104:W>=800?142:132;}
// Height in CSS pixels of the DOM footer band across the bottom of the plate — the chapter name and the
// utility buttons — again mirroring the CSS, with whatever safe-area inset the browser reports added to
// it. Canvas marginalia keep above it.
let safeBottom=-1;
function safeAreaBottom(){
  if(safeBottom>=0)return safeBottom;
  safeBottom=0;
  try{
    const probe=document.createElement('div');
    probe.style.cssText='position:absolute;left:-9999px;padding-bottom:env(safe-area-inset-bottom,0px)';
    if(document.body&&document.body.appendChild){
      document.body.appendChild(probe);
      const read=window.getComputedStyle&&window.getComputedStyle(probe).paddingBottom;
      safeBottom=Math.max(0,Math.min(80,parseFloat(read)||0));
      if(probe.remove)probe.remove();
    }
  }catch(_){safeBottom=0;}
  return safeBottom;
}
function footerBand(){return Math.min(H*.42,(H<=530&&W>H?58:70)+safeAreaBottom());}
// The play channel: the width down the middle of the sheet the chart itself is drawn in. The scenery is
// held back inside it and left fuller in the margins either side, so the moving parts read first.
function playChannel(){return Math.min(W*.5,Math.max(W*.3,168*scale));}
// The band the DOM toast occupies while one is showing, or null when the line is clear.
function toastBand(){return toastLife>0?{top:H*.29-20,bottom:H*.29+15}:null;}
let frameTime=0,accumulator=0,toastLife=0,deathShown=false,screenFlash=0,lastScore=-1;
let lastChapter=-1,recordAtStart=0,runSeed=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;
const storage={get(key,fallback){try{return localStorage.getItem(key)??fallback;}catch(_){return fallback;}},set(key,value){try{localStorage.setItem(key,String(value));}catch(_){}}};
let best=Math.max(0,parseInt(storage.get('orbit.best.v1','0'),10)||0);
let bestRow=Math.max(0,parseInt(storage.get('orbit.bestRow.v1','0'),10)||0);
const audio=new OrbitAudio(storage.get('orbit.sound.v1','on')!=='off');
const DARKNESS_MULT={relaxed:.72,classic:1,hardcore:1.35};
let difficulty=storage.get('orbit.difficulty.v1','classic');
if(!(difficulty in DARKNESS_MULT))difficulty='classic';
// The daily plate: one shared course a day, drawn from the UTC date, always at Classic
// pressure, with its own record. The choice itself is never remembered between visits.
function utcDay(){try{return new Date().toISOString().slice(0,10);}catch(_){return '1970-01-01';}}
function dayStamp(date){let h=0x811c9dc5;for(let i=0;i<date.length;i++){h=Math.imul(h^date.charCodeAt(i),0x01000193);}return h>>>0;}
let dailyOn=false,dailyDay=utcDay(),dailySeed=dayStamp(dailyDay),dailyBest=0;
function readDailyBest(){
  try{const raw=JSON.parse(storage.get('orbit.daily.v1','null'));if(raw&&raw.date===dailyDay)return Math.max(0,Number(raw.best)||0);}catch(_){}
  return 0;
}
const activeDifficulty=()=>dailyOn?'classic':difficulty;
const currentBest=()=>dailyOn?dailyBest:best;
function recordBest(score){
  if(dailyOn){if(score>dailyBest){dailyBest=score;storage.set('orbit.daily.v1',JSON.stringify({date:dailyDay,best:dailyBest}));}}
  else if(score>best){best=score;storage.set('orbit.best.v1',best);}
}
function setDifficulty(value){if(dailyOn)return;difficulty=value;storage.set('orbit.difficulty.v1',difficulty);syncDifficulty();}
function syncDifficulty(){
  for(const key in DARKNESS_MULT)$('diff-'+key).setAttribute('aria-pressed',String(key===activeDifficulty()));
  if(world)world.darknessMult=DARKNESS_MULT[activeDifficulty()];
}
function syncDaily(){
  game.classList.toggle('daily',dailyOn);
  $('daily').setAttribute('aria-pressed',String(dailyOn));
  $('daily-date').textContent=dailyOn?'Tabula diei \u00b7 '+dailyDay:'';
  $('best').textContent=currentBest();
  syncDifficulty();
}
function setDaily(on){
  dailyOn=on;dailyDay=utcDay();dailySeed=dayStamp(dailyDay);dailyBest=readDailyBest();
  syncDaily();
  if(world&&world.state==='ready'){newWorld();recordAtStart=currentBest();if(W&&H)render(0);}
}
function scoreLine(){
  const charts=world.constellationsCompleted;
  return 'Orbit \u00b7 '+(dailyOn?'Tabula diei '+dailyDay:'Ascent')+' \u00b7 '+world.score+' points \u00b7 row '+Math.floor(world.progress)+
    ' \u00b7 '+charts+' constellation'+(charts===1?'':'s');
}
function copyScore(){
  const line=scoreLine();
  $('copy-score').textContent='COPIED';
  try{
    if(typeof navigator!=='undefined'&&navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){
      const p=navigator.clipboard.writeText(line);if(p&&typeof p.catch==='function')p.catch(()=>{$('copy-score').textContent='COPY SCORE';});
    }else $('copy-score').textContent='COPY SCORE';
  }catch(_){$('copy-score').textContent='COPY SCORE';}
  return line;
}
const chapters=['THE QUIET','THE DRIFT','THE ECLIPSE','THE DEEP'];
const numerals=['I','II','III','IV'];
const starRng=seeded(763428);
const stars=Array.from({length:210},()=>{
  const s={x:starRng(),y:starRng(),size:.3+starRng()*1.15,phase:starRng()*TAU,depth:.06+starRng()*.19,bright:starRng()};
  // Six magnitude classes drawn from the star's own brightness and size; the first magnitude is rarest.
  const v=s.bright*.68+(s.size-.3)/1.15*.32;
  s.mag=v<.52?0:v<.76?1:v<.88?2:v<.945?3:v<.982?4:5;
  return s;
});
const MAGNITUDES=['I','II','III','IV','V','VI'];
// Magnitude glyphs, as engraved in a printed star atlas: a plain dot for the sixth, a ringed dot for the
// fifth, then four-, six- and eight-pointed forms, and a haloed eight-point for the first. x,y is the
// glyph's top-left, so a plain dot lands exactly where the old fillRect did.
function starGlyph(g,x,y,mag,rgb,alpha,size){
  g.fillStyle=`rgba(${rgb},${alpha})`;
  if(mag===0){g.fillRect(x,y,size,size*.8);return;}
  const cx=x+size*.5,cy=y+size*.4;
  if(mag===1){
    g.fillRect(x,y,size,size*.8);
    g.strokeStyle=`rgba(${rgb},${alpha*.45})`;g.lineWidth=.4;
    g.beginPath();g.arc(cx,cy,size*.5+1.2,0,TAU);g.stroke();return;
  }
  const points=mag===2?4:mag===3?6:8,reach=size*.5+.75+mag*.62;
  g.strokeStyle=`rgba(${rgb},${alpha*.72})`;g.lineWidth=mag>=4?.5:.4;
  g.beginPath();
  for(let j=0;j<points*2;j++){
    const a=j*Math.PI/points-Math.PI/2,long=points===8&&j%4?.62:1;
    const r=j%2?reach*.3:reach*long,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;
    if(j)g.lineTo(px,py);else g.moveTo(px,py);
  }
  g.closePath();g.stroke();
  g.beginPath();g.arc(cx,cy,Math.max(.35,size*.36),0,TAU);g.fill();
  if(mag===5){g.strokeStyle=`rgba(${rgb},${alpha*.35})`;g.lineWidth=.4;g.beginPath();g.arc(cx,cy,reach*1.35,0,TAU);g.stroke();}
}
let grain,backdrop,lensPatch,regionBlend=0,darknessRelief=0;
// The chart's ink is laid a pixel or two off true, by whichever plate is on the press; see plateRegistration().
let plateShift={x:0,y:0};
// ---------- Plates: the night plate (ink and starlight on indigo) and the paper plate (sepia ink on cream) ----------
// Every render section registers its own colours for both plates with definePlate(); `ink` always points at the
// active plate so draw code reads ink.section.token. Night values are the original artwork and stay unchanged.
//
// A plate may also be *derived*: it names one of the two base plates and passes every token that plate
// registers through one colour transform, so a new plate costs a transform rather than a second atlas.
// The derived plates are the catalogue's unlockable ones; PLATE_STYLES below is their whole definition.
const rgbClamp=v=>Math.max(0,Math.min(255,Math.round(v)));
const luminance=(r,g,b)=>(r*.299+g*.587+b*.114)/255;
const mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
// A duotone press: every tone is re-inked along a three-stop ramp from the ground through a middle
// tone to the highlight, so the plate keeps its whole tonal range in one new pair of colours.
const duotone=(dark,mid,light)=>(r,g,b)=>{
  const L=luminance(r,g,b),ramp=L<.5?mix3(dark,mid,L*2):mix3(mid,light,(L-.5)*2);
  return ramp.map(rgbClamp);
};
// A sheet left too long in a damp room: everything blends toward foxing brown and loses a little light,
// the pale sizing most of all. Unlike a duotone this keeps every hue the paper plate already prints.
const aged=(r,g,b)=>{
  const L=luminance(r,g,b),t=.2+.28*L,to=[104,68,32];
  return [lerp(r,to[0],t)*.86,lerp(g,to[1],t)*.86,lerp(b,to[2],t)*.86].map(rgbClamp);
};
const PLATE_STYLES={
  cellarius:{base:'night',wash:.7,tint:duotone([7,16,56],[118,102,72],[252,228,164])},
  verdigris:{base:'night',wash:.52,tint:duotone([5,15,13],[62,124,100],[196,230,204])},
  foxed:{base:'paper',wash:.5,tint:aged},
  // Blue prepared paper, as the Florentine workshops made it: the night plate's pale ink becomes white
  // heightening on a blue-grey ground, so the drawing is carried by the lights rather than the darks.
  azzurra:{base:'night',wash:.55,tint:duotone([100,116,132],[168,180,188],[244,240,230])},
  // A proof pulled before the letters were cut: rich ink, clean sheet, and not one caption on it.
  proof:{base:'paper',wash:.22,plain:true,tint:duotone([20,17,14],[150,138,116],[240,231,205])}
};
const PLATES={night:{},paper:{}};
for(const id in PLATE_STYLES)PLATES[id]={};
// Colour transforms reach every registered token, whatever shape it is stored in: `r,g,b` triplets,
// rgb()/rgba() strings, hex, [r,g,b] arrays, and any array or object of those.
const RGB_TRIPLE=/^\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*$/;
const RGB_FUNC=/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*([\d.]+)\s*)?\)$/i;
const RGB_HEX=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
function tintValue(value,tint){
  if(Array.isArray(value)){
    if(value.length===3&&value.every(v=>typeof v==='number'))return tint(value[0],value[1],value[2]);
    return value.map(v=>tintValue(v,tint));
  }
  if(value&&typeof value==='object'){const out={};for(const key in value)out[key]=tintValue(value[key],tint);return out;}
  if(typeof value!=='string')return value;
  let m=value.match(RGB_TRIPLE);
  if(m){const [r,g,b]=tint(+m[1],+m[2],+m[3]);return r+','+g+','+b;}
  m=value.match(RGB_FUNC);
  if(m){const [r,g,b]=tint(+m[1],+m[2],+m[3]);return m[4]===undefined?`rgb(${r},${g},${b})`:`rgba(${r},${g},${b},${m[4]})`;}
  m=value.match(RGB_HEX);
  if(m){
    const hex=m[1].length===3?m[1].split('').map(c=>c+c).join(''):m[1];
    const [r,g,b]=tint(parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16));
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  return value;
}
let plateName=storage.get('orbit.plate.v1','night');if(!PLATES[plateName])plateName='night';
const ink={};
function definePlate(section,variants){
  PLATES.night[section]=variants.night;PLATES.paper[section]=variants.paper;
  for(const id in PLATE_STYLES){const style=PLATE_STYLES[id];PLATES[id][section]=tintValue(variants[style.base],style.tint);}
  ink[section]=PLATES[plateName][section];
}
// Which of the two base plates a plate is pulled from, and what that means for the artwork.
const plateBase=name=>PLATE_STYLES[name]?PLATE_STYLES[name].base:name;
const onPaper=()=>plateBase(plateName)==='paper';
// A proof before letters carries no captions, labels, numerals or legend: figures and rings only.
const plainPlate=()=>!!(PLATE_STYLES[plateName]&&PLATE_STYLES[plateName].plain);
definePlate('base',{
  night:{paper:'#080f18',paperRgb:'8,15,24',ink:'209,190,146',inkStrong:'236,229,211',inkSoft:'177,192,183',gold:'226,195,133',goldBright:'244,229,196',copper:'205,159,122',blue:'148,180,177',shieldBlue:'150,196,214',red:'222,145,106',text:'#e0d4b5',caption:'198,187,155',shadow:'#080f18'},
  paper:{paper:'#e7dabd',paperRgb:'231,218,189',ink:'58,42,28',inkStrong:'34,24,16',inkSoft:'96,74,52',gold:'150,100,32',goldBright:'176,118,38',copper:'160,84,52',blue:'52,84,120',shieldBlue:'56,104,134',red:'166,58,40',text:'#2a2016',caption:'92,70,48',shadow:'#e7dabd'}
});
function invalidateArt(){
  regionPlates.clear();celestialPlates.clear();darknessPlates.clear();glyphs.clear();
  figureLayers.clear();ringSprites.clear();flareSprites.clear();nebulaSprites.clear();darkMarginalia.clear();
  if(world)for(const n of world.nodes){n._glowKey=null;}
  grain=grainTexture();laidTile=null;laidSheet=null;if(W&&H)backdrop=paintBackdrop();
  frameLayer=null;
}
function syncPlate(){
  // The stylesheet switches its variables on the base plate; the exact plate is named beside it so a
  // derived plate can adjust a line or two of chrome without repeating the whole palette.
  game.setAttribute('data-plate',plateBase(plateName));
  game.setAttribute('data-plate-id',plateName);
  const meta=document.querySelector?document.querySelector('meta[name="theme-color"]'):null;if(meta)meta.setAttribute('content',ink.base.paper);
  const button=$('plate');if(button){button.setAttribute('aria-label',onPaper()?'Switch to night plate':'Switch to paper plate');button.setAttribute('aria-pressed',String(onPaper()));}
}
// Point `ink` at a plate without touching storage or the cached artwork: used while the modules are
// still registering their sections, before there is anything cached to rebuild.
function applyPlate(name){
  if(!PLATES[name])return false;
  plateName=name;
  for(const key of Object.keys(PLATES[name]))ink[key]=PLATES[name][key];
  return true;
}
function setPlate(name){
  if(!PLATES[name]||name===plateName)return;
  applyPlate(name);storage.set('orbit.plate.v1',name);
  if(typeof recordCosmetic==='function')recordCosmetic('plate',name);
  invalidateArt();syncPlate();if(world)render(0);
}
const regionPlates=new Map();
const celestialPlates=new Map();
let chapterReveal={index:0,age:5};
let ambience={random:seeded(7419),wait:7,event:null,sequence:0};
const darknessPlates=new Map();
const inkRng=seeded(741593),inkMotes=Array.from({length:40},()=>({x:inkRng(),phase:inkRng(),speed:.045+inkRng()*.045,length:.5+inkRng()*1.6,drift:inkRng()*TAU}));
const atlasRegions=[
  {wash:'29,40,40',pigment:'149,157,143',star:[183,190,175],density:1,seed:3197,
    paper:{wash:'80,68,50',pigment:'92,78,58',star:[70,54,38]}},
  {wash:'51,39,30',pigment:'175,146,111',star:[202,182,151],density:.82,seed:7321,
    paper:{wash:'100,74,42',pigment:'112,84,48',star:[76,52,28]}},
  {wash:'34,27,34',pigment:'143,116,111',star:[179,163,159],density:.62,seed:9481,
    paper:{wash:'96,58,46',pigment:'104,66,50',star:[68,40,32]}},
  {wash:'24,34,47',pigment:'126,145,159',star:[172,185,196],density:.46,seed:5107,
    paper:{wash:'64,76,92',pigment:'70,84,98',star:[42,54,70]}}
];
// Reads whichever colour set (night literals or paper.*) is active for a region, passed through the
// derived plate's transform like every registered token, and cached because it is read per frame.
const regionInkCache=new Map();
function regionInk(region){
  const base=onPaper()?region.paper:region;
  const style=PLATE_STYLES[plateName];if(!style)return base;
  const key=plateName+':'+region.seed;
  let tinted=regionInkCache.get(key);
  if(!tinted){tinted=tintValue({wash:base.wash,pigment:base.pigment,star:base.star},style.tint);regionInkCache.set(key,tinted);}
  return tinted;
}

function makeCanvas(width,height){const c=document.createElement('canvas');c.width=width;c.height=height;return c;}
// The sheet itself, as a seamless tile: laid wires every 1.5 px, heavier chain lines every 27 px, and
// short fibres. It is multiplied over the finished frame on paper so every stroke breaks across the laid
// lines instead of lying on top of them; at night the same tile is screened back at a whisper.
let laidTile=null,laidKey='',laidSheet=null,laidSheetKey='';
function laidPaper(){
  const key=plateName+':'+DPR;
  if(laidTile&&laidKey===key)return laidTile;
  const paper=onPaper(),unit=Math.max(1,Math.round(DPR)),tw=108,th=96;
  const c=makeCanvas(tw*unit,th*unit),g=c.getContext('2d'),rng=seeded(30517);
  g.scale(unit,unit);
  g.fillStyle=paper?'#ffffff':'#000000';g.fillRect(0,0,tw,th);
  const dark=a=>paper?`rgba(70,50,26,${a})`:`rgba(206,222,226,${a})`;
  const light=a=>paper?`rgba(255,252,242,${a})`:`rgba(0,0,0,${a})`;
  g.lineWidth=.55;
  for(let y=0;y<th;y+=1.5){
    g.strokeStyle=dark(paper?.2:.14);g.beginPath();g.moveTo(0,y+.3);g.lineTo(tw,y+.3);g.stroke();
    if(paper){g.strokeStyle=light(.5);g.beginPath();g.moveTo(0,y+1.05);g.lineTo(tw,y+1.05);g.stroke();}
  }
  for(let x=0;x<tw;x+=27){
    if(paper){g.strokeStyle=light(.4);g.lineWidth=2.4;g.beginPath();g.moveTo(x,0);g.lineTo(x,th);g.stroke();}
    g.strokeStyle=dark(paper?.11:.07);g.lineWidth=.9;g.beginPath();g.moveTo(x,0);g.lineTo(x,th);g.stroke();
  }
  for(let i=0;i<90;i++){
    const x=rng()*tw,y=rng()*th,a=rng()*TAU,l=1.5+rng()*5;
    g.strokeStyle=rng()>.45?dark(.05+rng()*.1):light(.25+rng()*.35);g.lineWidth=.3+rng()*.5;
    for(const [ox,oy] of [[0,0],[-tw,0],[0,-th],[-tw,-th]]){
      g.beginPath();g.moveTo(x+ox,y+oy);g.lineTo(x+ox+Math.cos(a)*l,y+oy+Math.sin(a)*l);g.stroke();
    }
  }
  laidTile=c;laidKey=key;return c;
}
function laidSheetFor(){
  const key=plateName+':'+W+'x'+H+':'+DPR;
  if(laidSheet&&laidSheetKey===key)return laidSheet;
  const c=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(H*DPR))),g=c.getContext('2d');
  const pattern=g.createPattern(laidPaper(),'repeat');if(!pattern)return null;
  // One tile pixel to one device pixel, so the wires stay crisp whatever the pixel ratio.
  g.fillStyle=pattern;g.fillRect(0,0,c.width,c.height);
  laidSheet=c;laidSheetKey=key;return c;
}
function drawLaidPaper(){
  const sheet=laidSheetFor();if(!sheet||!W||!H)return;
  ctx.save();ctx.globalCompositeOperation=onPaper()?'multiply':'screen';ctx.globalAlpha=onPaper()?.35:.055;
  ctx.drawImage(sheet,0,0,W,H);ctx.restore();
}
function grainTexture(){
  const c=makeCanvas(256,256),g=c.getContext('2d'),rng=seeded(4404),im=g.createImageData(256,256),paper=onPaper();
  for(let i=0;i<im.data.length;i+=4){
    const light=rng()>(paper?.62:.46),v=light?(paper?250:235):(paper?52:10);
    im.data[i]=v;im.data[i+1]=paper&&!light?40:v;im.data[i+2]=paper&&!light?26:v;im.data[i+3]=Math.floor(rng()*(paper&&light?14:20));
  }
  g.putImageData(im,0,0);return c;
}
