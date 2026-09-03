'use strict';
/* Orbit · src/plates.js
   Render globals, storage, difficulty, the star field, and the plate system (night and paper colour tokens). */
// ---------- Canvas artwork: an engraved celestial atlas ----------
const game=document.getElementById('game'),canvas=document.getElementById('sky'),ctx=canvas.getContext('2d',{alpha:false});
const $=id=>document.getElementById(id);
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let W=0,H=0,DPR=1,scale=1,world,trail=[],particles=[],rings=[],floaters=[],glyphs=new Map();
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
const stars=Array.from({length:210},()=>({x:starRng(),y:starRng(),size:.3+starRng()*1.15,phase:starRng()*TAU,depth:.06+starRng()*.19,bright:starRng()}));
let grain,backdrop,lensPatch,regionBlend=0,darknessRelief=0;
// ---------- Plates: the night plate (ink and starlight on indigo) and the paper plate (sepia ink on cream) ----------
// Every render section registers its own colours for both plates with definePlate(); `ink` always points at the
// active plate so draw code reads ink.section.token. Night values are the original artwork and stay unchanged.
const PLATES={night:{},paper:{}};
let plateName=storage.get('orbit.plate.v1','night');if(!PLATES[plateName])plateName='night';
const ink={};
function definePlate(section,variants){PLATES.night[section]=variants.night;PLATES.paper[section]=variants.paper;ink[section]=variants[plateName];}
const onPaper=()=>plateName==='paper';
definePlate('base',{
  night:{paper:'#080f18',paperRgb:'8,15,24',ink:'209,190,146',inkStrong:'236,229,211',inkSoft:'177,192,183',gold:'226,195,133',goldBright:'244,229,196',copper:'205,159,122',blue:'148,180,177',shieldBlue:'150,196,214',red:'222,145,106',text:'#e0d4b5',caption:'198,187,155',shadow:'#080f18'},
  paper:{paper:'#e7dabd',paperRgb:'231,218,189',ink:'58,42,28',inkStrong:'34,24,16',inkSoft:'96,74,52',gold:'150,100,32',goldBright:'176,118,38',copper:'160,84,52',blue:'52,84,120',shieldBlue:'56,104,134',red:'166,58,40',text:'#2a2016',caption:'92,70,48',shadow:'#e7dabd'}
});
function invalidateArt(){
  regionPlates.clear();celestialPlates.clear();darknessPlates.clear();glyphs.clear();
  figureLayers.clear();ringSprites.clear();
  if(world)for(const n of world.nodes){n._glowKey=null;}
  grain=grainTexture();if(W&&H)backdrop=paintBackdrop();
  frameLayer=null;
}
function syncPlate(){
  game.setAttribute('data-plate',plateName);
  const meta=document.querySelector?document.querySelector('meta[name="theme-color"]'):null;if(meta)meta.setAttribute('content',ink.base.paper);
  const button=$('plate');if(button){button.setAttribute('aria-label',onPaper()?'Switch to night plate':'Switch to paper plate');button.setAttribute('aria-pressed',String(onPaper()));}
}
function setPlate(name){
  if(!PLATES[name]||name===plateName)return;
  plateName=name;storage.set('orbit.plate.v1',name);
  for(const key of Object.keys(PLATES[name]))ink[key]=PLATES[name][key];
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
// Reads whichever colour set (night literals or paper.*) is active for a region.
const regionInk=region=>onPaper()?region.paper:region;

function makeCanvas(width,height){const c=document.createElement('canvas');c.width=width;c.height=height;return c;}
function grainTexture(){
  const c=makeCanvas(256,256),g=c.getContext('2d'),rng=seeded(4404),im=g.createImageData(256,256),paper=onPaper();
  for(let i=0;i<im.data.length;i+=4){
    const light=rng()>(paper?.62:.46),v=light?(paper?250:235):(paper?52:10);
    im.data[i]=v;im.data[i+1]=paper&&!light?40:v;im.data[i+2]=paper&&!light?26:v;im.data[i+3]=Math.floor(rng()*(paper&&light?14:20));
  }
  g.putImageData(im,0,0);return c;
}
