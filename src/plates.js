'use strict';
/* Orbit · src/plates.js
   Render globals, storage, difficulty, the star field, and the plate system (night and paper colour tokens). */
// ---------- Canvas artwork: an engraved celestial atlas ----------
const game=document.getElementById('game'),canvas=document.getElementById('sky'),ctx=canvas.getContext('2d',{alpha:false});
const $=id=>document.getElementById(id);
const storage={get(key,fallback){try{return localStorage.getItem(key)??fallback;}catch(_){return fallback;}},set(key,value){try{localStorage.setItem(key,String(value));}catch(_){}}};
// Seeded from the OS accessibility signal, but a reader who wants a lighter, faster plate without
// asking the whole system for it can say so directly (see the pause menu's REDUCE MOTION button in
// ui.js); once they have, that explicit choice is what's kept, in either direction.
const reducedMotionStored=storage.get('orbit.reducedMotion.v1','');
let reducedMotion=reducedMotionStored?reducedMotionStored==='on':window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// A second, unrelated reason for the pen to skip its own stroke-by-stroke drawing: reviewing a
// finished plate wants every mark already standing, exactly as it stands after the run, never a
// live accessibility signal (reducedMotion stays about motion, this stays about which world is on
// the press). See openReview()/renderReview() in src/review.js.
let reviewing=false;
let W=0,H=0,DPR=1,scale=1,world,particles=[],rings=[],floaters=[],glyphs=new Map();
// Height in CSS pixels of the DOM HUD band across the top of the plate, mirroring the CSS: the header sits
// higher and prints smaller on short landscape screens and lower on wide ones. Canvas lettering keeps below it.
function hudBand(){return H<=530&&W>H?104:W>=800?142:132;}
// Height in CSS pixels of the footer band across the bottom of the plate — the running head and the
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
// darkFlash is screenFlash's one-frame cousin: the dark takes the traveller by drowning, not by the
// force every hazard death answers with a fading flash for, so it gets a single frame of the flood's
// own tone (see the death handler in ui.js) rather than a wash that lingers and decays.
let frameTime=0,accumulator=0,deathShown=false,screenFlash=0,darkFlash=0,lastScore=-1;
let lastChapter=-1,inkGaugePaint='',recordAtStart=0,runSeed=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;
// A hazard's Latin name (HAZARD_KINDS in simulation.js) is taught once per kind, on the first instance
// of it the run fully reveals, rather than lettered on every one it ever generates: a run passes
// dozens of vortices as it climbs, and inscribing all of them would spend the whole plate's inscription
// budget on repeating the one word instead of leaving room for anything the run still has to say.
let namedHazardKinds=new Set();
let best=Math.max(0,parseInt(storage.get('orbit.best.v1','0'),10)||0);
let bestRow=Math.max(0,parseInt(storage.get('orbit.bestRow.v1','0'),10)||0);
const audio=new OrbitAudio(storage.get('orbit.sound.v1','on')!=='off');
// Whether the frontispiece's full instruction paragraph has already been shown once: after that
// first visit only "Tap to begin" prints by default, with a small toggle to read it again.
let tutorialSeen=!!storage.get('orbit.tutorialSeen.v1','');
function markTutorialSeen(){if(tutorialSeen)return;tutorialSeen=true;storage.set('orbit.tutorialSeen.v1','1');}
const DARKNESS_MULT={relaxed:.72,classic:1,hardcore:1.35};
// The pressure also sets how fast the nib spends its ink, so a gentler plate grants a longer
// reach on the same charge rather than a different gauge.
const INK_MULT={relaxed:.82,classic:1,hardcore:1.22};
// Tiro also asks less precise timing to land a smooth tangent transfer, since a tight orbit sweeps
// through its release window quickly whatever the pressure; Adeptus and Magister keep the drawn window.
const PERFECT_MULT={relaxed:1.35,classic:1,hardcore:1};
// Missing a capture outright is a harsher failure than missing only the perfect band inside it, so
// Tiro widens the whole forgiving capture window a body carries beyond its drawn rim, not just the
// narrower perfect band within it. Adeptus and Magister keep the drawn window.
const CAP_MULT={relaxed:1.3,classic:1,hardcore:1};
let difficulty=storage.get('orbit.difficulty.v1','classic');
if(!(difficulty in DARKNESS_MULT))difficulty='classic';
// Newton mode: a standing preference like the pressure choice rather than a one-visit special like
// the daily plate, so it is remembered between visits — but only ever honoured once earned; see
// setNewton() below and isUnlocked('newton') in src/ledger.js.
let newtonOn=storage.get('orbit.newton.v1','off')==='on';
// The daily plate: one shared course a day, drawn from the UTC date, always at Classic
// pressure, with its own record. The choice itself is never remembered between visits.
function utcDay(){try{return new Date().toISOString().slice(0,10);}catch(_){return '1970-01-01';}}
function dayStamp(date){let h=0x811c9dc5;for(let i=0;i<date.length;i++){h=Math.imul(h^date.charCodeAt(i),0x01000193);}return h>>>0;}
let dailyOn=false,dailyDay=utcDay(),dailySeed=dayStamp(dailyDay),dailyBest=0,dailyReplay=false;
// The ephemeris rests on one rule: a day is written into the log only while it is still that day, so a
// past plate can be drawn again by the hand that drew it when it was current and by no other. The log is
// a single document of date to {best, plays}; a blocked or malformed store simply reads as an empty one.
const DAILY_LOG_KEY='orbit.dailyLog.v1';
const isDayKey=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value);
function readDailyLog(){
  const out={},today=utcDay();
  let raw=null;
  try{raw=JSON.parse(storage.get(DAILY_LOG_KEY,'null'));}catch(_){raw=null;}
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const key in raw){
    if(!isDayKey(key)||key>today)continue;
    const entry=raw[key];if(!entry||typeof entry!=='object')continue;
    out[key]={best:Math.max(0,Math.floor(Number(entry.best)||0)),plays:Math.max(1,Math.floor(Number(entry.plays)||1))};
  }
  return out;
}
const dailyLog=readDailyLog();
function saveDailyLog(){storage.set(DAILY_LOG_KEY,JSON.stringify(dailyLog));}
// The one record that predates the log is folded into it once and left where it is: a player who has
// already drawn today's plate finds that day open in the ephemeris.
(function migrateDailyLog(){
  try{
    const raw=JSON.parse(storage.get('orbit.daily.v1','null'));
    if(raw&&isDayKey(raw.date)&&raw.date<=utcDay()&&!dailyLog[raw.date]){
      dailyLog[raw.date]={best:Math.max(0,Math.floor(Number(raw.best)||0)),plays:1};saveDailyLog();
    }
  }catch(_){}
})();
const dailyDrawn=date=>Object.prototype.hasOwnProperty.call(dailyLog,date);
const dailyDates=()=>Object.keys(dailyLog).sort();
// A plate is open to be drawn again only if it was drawn on its own day; today's is always open.
const dailyOpen=date=>isDayKey(date)&&(date===utcDay()||dailyDrawn(date));
function dailyEntry(date){
  const entry=dailyLog[date]||(dailyLog[date]={best:0,plays:0});
  return entry;
}
// Written when a daily run actually begins, and only while the plate is the current day's: a replay of
// an older plate never enters a day into the log.
function noteDailyPlay(){
  if(!dailyOn||dailyReplay||dailyDay!==utcDay())return;
  dailyEntry(dailyDay).plays++;saveDailyLog();
}
function readDailyBest(){
  const entry=dailyLog[dailyDay];if(entry)return entry.best;
  try{const raw=JSON.parse(storage.get('orbit.daily.v1','null'));if(raw&&raw.date===dailyDay)return Math.max(0,Number(raw.best)||0);}catch(_){}
  return 0;
}
// What the plate is called on the title screen, the colophon and the copied line.
const dailyLabel=()=>'Tabula diei \u00b7 '+dailyDay+(dailyReplay?' \u00b7 iterum':'');
const activeDifficulty=()=>dailyOn?'classic':difficulty;
const currentBest=()=>plateOwns('score')?0:dailyOn?dailyBest:best;
function recordBest(score){
  // A plate that keeps its own record does not write the atlas's. Its run is playable and scored on
  // its own sheet; what it may never do is rewrite a number the atlas earned.
  if(plateOwns('score'))return;
  if(dailyOn){
    if(score>dailyBest){
      dailyBest=score;
      const entry=dailyEntry(dailyDay);
      if(score>entry.best){entry.best=score;if(!entry.plays)entry.plays=1;saveDailyLog();}
      if(dailyDay===utcDay())storage.set('orbit.daily.v1',JSON.stringify({date:dailyDay,best:dailyBest}));
    }
  }
  else if(score>best){best=score;storage.set('orbit.best.v1',best);}
}
// The difficulty is set in-run, by which of the three opening targets the player captures
// (see the 'difficulty' event in ui.js), not by a button; this only applies it to the world.
function setDifficulty(value){if(dailyOn)return;difficulty=value;if(!plateOwns('score'))storage.set('orbit.difficulty.v1',difficulty);syncDifficulty();}
function syncDifficulty(){if(!world)return;world.darknessMult=DARKNESS_MULT[activeDifficulty()];world.inkMult=INK_MULT[activeDifficulty()];world.perfectMult=PERFECT_MULT[activeDifficulty()];world.capMult=CAP_MULT[activeDifficulty()];}
function syncDaily(){
  game.classList.toggle('daily',dailyOn);
  $('daily').setAttribute('aria-pressed',String(dailyOn));
  $('daily-end').setAttribute('aria-pressed',String(dailyOn));
  $('daily-date').textContent=dailyOn?dailyLabel():'';
  $('best').textContent=currentBest();
  if(typeof syncImpressumScreen==='function')syncImpressumScreen();
  syncDifficulty();
}
// Newton mode is a frontispiece switch rather than an in-run choice, since gravity has to be known
// before the chart's first flight rather than settled by which opening target is captured (contrast
// setDifficulty, which the 'difficulty' event calls mid-run). It stacks with whichever pressure is
// chosen, but never applies under the daily plate, which keeps its own fixed setup exactly as the
// pressure choice already does; newWorld() re-checks isUnlocked('newton') itself before honouring it.
function setNewton(on){
  newtonOn=!!on&&isUnlocked('newton');
  storage.set('orbit.newton.v1',newtonOn?'on':'off');
  syncNewton();
  if(world&&world.state==='ready'){newWorld();if(W&&H)render(0);}
}
function toggleNewton(){setNewton(!newtonOn);}
// Also the one place a stored 'on' left over from before a cleared or copied-between-browsers ledger
// is caught: a selection naming something the ledger has not earned is never honoured, exactly as a
// locked cosmetic in readCosmetics() falls back rather than staying selected.
function syncNewton(){
  const unlocked=isUnlocked('newton');
  if(newtonOn&&!unlocked){newtonOn=false;storage.set('orbit.newton.v1','off');}
  for(const id of ['newton','newton-end']){
    const button=$(id);if(!button)continue;
    button.hidden=!unlocked;button.setAttribute('aria-pressed',String(newtonOn));
  }
}
// The plate the daily's own showcase asks for right now, drawn from dailySetup() in src/ledger.js \u2014
// which this file loads before, hence the guard already used the same way by setPlate() below \u2014 or
// null while there is no daily to show one for.
function dailyPressPlate(){
  if(!dailyOn||typeof dailySetup!=='function')return null;
  const shown=dailySetup().plate;
  return shown&&PLATES[shown]?shown:null;
}
// Toggled from the title screen before a run, or from the colophon after one: the run-complete screen
// carries its own DAILY PLATE switch (see #daily-end in ui.js) precisely so the daily plate is never a
// one-way door \u2014 tapping to try again always honours whichever plate was chosen last, standard included.
// A date may be named, which is how the ephemeris draws a past plate again; anything but a day that was
// drawn on its own day falls back to the current one.
function setDaily(on,date){
  const today=utcDay();
  dailyDay=on&&dailyOpen(date)?date:today;
  dailyOn=on;dailyReplay=on&&dailyDay!==today;dailySeed=dayStamp(dailyDay);dailyBest=readDailyBest();
  // Puts the daily's own showcase on the press, or takes it back off again: applyPlate alone, exactly
  // as an era's own door changes the plate, so orbit.plate.v1 and the ledger's cosmetic choice are
  // never touched by a day's setup.
  const shown=dailyPressPlate()||(typeof cosmetics==='object'&&cosmetics&&PLATES[cosmetics.plate]?cosmetics.plate:plateName);
  if(shown!==plateName){applyPlate(shown);invalidateArt();syncPlate();}
  syncDaily();
  if(world&&world.state==='ready'){newWorld();recordAtStart=currentBest();if(W&&H)render(0);}
}
// The ephemeris's own way in: draw the plate of a named day, if that day is open at all.
function replayDaily(date){
  if(!dailyOpen(date))return false;
  setDaily(true,date);
  return true;
}
function scoreLine(){
  const charts=world.constellationsCompleted;
  return 'Orbit \u00b7 '+(dailyOn?'Tabula diei '+dailyDay+(dailyReplay?' (iterum)':''):'Ascent')+' \u00b7 '+world.score+' points \u00b7 row '+Math.floor(world.progress)+
    ' \u00b7 '+charts+' constellation'+(charts===1?'':'s');
}
function copyScore(){
  const line=scoreLine();
  $('copy-score').textContent='IMPRESSION TAKEN';
  try{
    if(typeof navigator!=='undefined'&&navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){
      const p=navigator.clipboard.writeText(line);if(p&&typeof p.catch==='function')p.catch(()=>{$('copy-score').textContent='TAKE AN IMPRESSION';});
    }else $('copy-score').textContent='TAKE AN IMPRESSION';
  }catch(_){$('copy-score').textContent='TAKE AN IMPRESSION';}
  return line;
}
const chapters=['THE QUIET','THE DRIFT','THE ECLIPSE','THE DEEP'];
const numerals=['I','II','III','IV'];
// The running head speaks the plate's own Latin rather than the game's English — REGIO, not TAB., since
// TAB. already names two other things on the same sheet (the impressum's plate number and, until this
// pairing landed, the illustrated figure's own caption). PROFVNDVM is the word the Deep's own nebula
// caption already uses; the other three are chosen the same way — a real Latin word for what the region
// actually is, not a transliteration of its English name.
const chaptersLatin=['SILENTIUM','VAGATIO','ECLIPSIS','PROFUNDUM'];
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
// A ramp read so that its light stop is reached at the sheet's own tone rather than at pure white, so a
// duotone pulled over the paper plate keeps the paper's ground where it is.
const topped=(tint,top)=>(r,g,b)=>{const L=luminance(r,g,b),k=L>0?Math.min(1,L/top)/L:1;return tint(r*k,g*k,b*k);};
// A token whose whole meaning is "this is the absence of the sheet", not a colour of it — a hazard's
// lethal body, the flood's own solid wash — must always read as ink well clear of the ground it sits
// on. A duotone's own luminance-only ramp does not know that: it can land two tokens within a few
// levels of each other if their raw values happened to sit close on the ramp it reads. sink(raw,plate,
// floor) derives `raw` through `plate`'s own tint exactly as the automatic pipeline would, then, only
// if the result lands within `floor` luminance levels (0-255) of that plate's own already-tinted
// ground (`PLATES[plate].base.paperRgb`, registered by definePlate('base',...) above), scales it
// darker until it clears the floor. Called once per plate at plate-definition time, beside duotone().
function sink(raw,plate,floor=22){
  const [r,g,b]=raw.split(',').map(Number),[dr,dg,db]=PLATE_STYLES[plate].tint(r,g,b);
  const [gr,gg,gb]=PLATES[plate].base.paperRgb.split(',').map(Number);
  const ground=luminance(gr,gg,gb)*255,L=luminance(dr,dg,db)*255,target=Math.max(0,ground-floor);
  if(L<=target)return `${dr},${dg},${db}`;
  const t=L>0?target/L:0;
  return [rgbClamp(dr*t),rgbClamp(dg*t),rgbClamp(db*t)].join(',');
}
const PLATE_STYLES={
  cellarius:{base:'night',wash:.7,tint:duotone([7,16,56],[118,102,72],[252,228,164])},
  verdigris:{base:'night',wash:.52,tint:duotone([5,15,13],[62,124,100],[196,230,204])},
  foxed:{base:'paper',wash:.5,tint:aged},
  // Blue prepared paper, as the Florentine workshops made it: the night plate's pale ink becomes white
  // heightening on a blue-grey ground, so the drawing is carried by the lights rather than the darks.
  azzurra:{base:'night',wash:.55,tint:duotone([100,116,132],[168,180,188],[244,240,230])},
  // The whole chart in one brown ink, as Galileo washed his moons: no hand-colouring, no rubrication, no
  // Prussian blue — every body a sepia wash under a sepia line on a cream a shade cooler than the paper
  // plate's own, the deeper mid stop and the greyed sheet together what tell the two plates apart.
  sepia:{base:'paper',wash:.3,pixels:true,tint:topped(duotone([34,24,15],[104,78,50],[213,205,190]),.86)},
  // A proof pulled before the letters were cut: rich ink, clean sheet, and not one caption on it — the
  // opposite of a dulled swatch, so its own ramp is darkened at the mid stop and lifted at the light one
  // and topped the way sepia's is, so the sheet actually reaches its light stop rather than stopping short.
  proof:{base:'paper',wash:.22,plain:true,tint:topped(duotone([14,12,10],[86,78,66],[250,245,233]),.9)},
  // The observatory plate: the same chart as a modern survey would publish it. The sheet goes to the
  // black of a sensor rather than the blue of a night sky and every engraved line is re-inked as a cool
  // instrument hairline, but the bodies themselves are no longer printed — they are rendered, lit from
  // one quarter and left in their own colour, which is what `render:'modern'` asks the painters for and
  // what the per-plate overrides beside the night and paper palettes supply. It is pulled on its own
  // sheet rather than dressed over the night one, so its wash is nothing.
  modern:{base:'night',wash:0,render:'modern',tint:duotone([4,7,13],[104,124,146],[233,242,250])},
  // Era II is not a colourway of the printed atlas. It is a temporary, isolated render mode whose
  // grammar follows the light-ground astronomical ceiling in TT353: lime plaster, fine black drawing,
  // red setting-out and restrained mineral fills. The identity transform lets the shared plate registry
  // finish booting; ceiling.js owns every visible mark once render() takes its dedicated branch.
  ceiling:{base:'paper',wash:0,era:2,render:'ceiling',can:{score:true,mode:true},door:{button:'ceiling-open',label:'ERA II \u00b7 THE CEILING'},tint:(r,g,b)=>[rgbClamp(r),rgbClamp(g),rgbClamp(b)]},
  // Era I is a wall, not a sheet, and the atlas has nothing to say about it: no frame, no laid wires,
  // no engraved line, and a ground that is a lit material rather than a colour. It is pulled from the
  // paper plate only because a light ground is the nearer of the two starting points; every mark on it
  // comes from the hand `src/rock.js` registers, and the identity transform is here for the same reason
  // it is on the Ceiling — to let the shared registry finish booting before that hand takes over.
  rock:{base:'paper',wash:0,era:1,render:'rock',can:{score:true,mode:true},door:{button:'rock-open',label:'ERA I \u00b7 THE ROCK'},tint:(r,g,b)=>[rgbClamp(r),rgbClamp(g),rgbClamp(b)]}
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
// A plate pulled in one ink presses a finished layer through its tint pixel by pixel as well, so the colours
// the painters use as literals — a shoreline's verdigris, a fissure's glow, a storm's indigo bands — go to
// the same brown as every registered token. Only a plate that asks for it pays for the pass.
function pressPixels(canvas){
  const style=PLATE_STYLES[plateName];if(!style||!style.pixels||!canvas||!canvas.getContext)return canvas;
  const g=canvas.getContext('2d'),im=g&&g.getImageData?g.getImageData(0,0,canvas.width,canvas.height):null;
  if(!im||!im.data)return canvas;
  const d=im.data;
  for(let i=0;i<d.length;i+=4){
    if(!d[i+3])continue;
    const [r,gg,b]=style.tint(d[i],d[i+1],d[i+2]);d[i]=r;d[i+1]=gg;d[i+2]=b;
  }
  g.putImageData(im,0,0);return canvas;
}
let plateName=storage.get('orbit.plate.v1','night');if(!PLATES[plateName])plateName='night';
const ink={};
// A derived plate normally takes its base plate's values through its transform and nothing else. A plate
// that departs from its base in kind rather than only in colour may also name itself in the same call and
// give the tokens it keeps for itself; those are folded over the transformed ones, so it states only what
// it changes and inherits the rest. Only whole leaf values are replaced — a nested group is merged.
function mergeTokens(base,over){
  if(!over||typeof over!=='object'||Array.isArray(over))return over===undefined?base:over;
  if(!base||typeof base!=='object'||Array.isArray(base))return over;
  const out={};for(const key in base)out[key]=base[key];
  for(const key in over)out[key]=mergeTokens(base[key],over[key]);
  return out;
}
function definePlate(section,variants){
  PLATES.night[section]=variants.night;PLATES.paper[section]=variants.paper;
  for(const id in PLATE_STYLES){
    const style=PLATE_STYLES[id],derived=tintValue(variants[style.base],style.tint);
    PLATES[id][section]=variants[id]===undefined?derived:mergeTokens(derived,variants[id]);
  }
  ink[section]=PLATES[plateName][section];
}
// Which of the two base plates a plate is pulled from, and what that means for the artwork.
const plateBase=name=>PLATE_STYLES[name]?PLATE_STYLES[name].base:name;
// A plate cut for a century whose sheet is not this one carries that century's ordinal. Nought is not
// the absence of an era: the printed atlas is itself era V, the Renaissance engraving, which is why it
// is the hand every other plate falls back to and why its own furniture is the furniture an era hides.
// The stylesheet reads the ordinal to swap the whole frontispiece in two rules per era rather than one
// rule per element, and `[data-plate-id]` narrows back to a variation inside one century.
const eraId=()=>(PLATE_STYLES[plateName]&&PLATE_STYLES[plateName].era)||0;
const onPaper=()=>plateBase(plateName)==='paper';
// A proof before letters carries no captions, labels, numerals or legend: figures and rings only.
const plainPlate=()=>!!(PLATE_STYLES[plateName]&&PLATE_STYLES[plateName].plain);
// Whether the bodies on this plate are rendered rather than engraved. A plate that answers yes is still
// pulled from the night plate's tokens and still answers no to onPaper(), so every existing fork stands.
const modernPlate=()=>!!(PLATE_STYLES[plateName]&&PLATE_STYLES[plateName].render==='modern');
// The printed sheet itself, as opposed to a century beside it or the hidden observatory hand: the one
// case a call site sometimes has to name outright, because it is the one hand that answers a `handFor()`
// question with nothing and is still owed a mark of its own rather than the shared bare fallback.
const renaissanceAtlas=()=>!modernPlate()&&eraId()===0;
// ---------- What a plate is, beyond its colours ----------
// A plate was a colourway of one atlas for as long as there was one atlas. An era is not that: it
// keeps its own record, hides furniture the atlas needs, calls the same things by other names and
// draws them in another hand. The first era to arrive answered all four of those by being asked, at
// two dozen places, whether it was itself — which is a question that has to be asked again for every
// era after it. So the plate is asked what it *does* instead, and answers from its own row: `can` for
// what it keeps to itself, a registered vocabulary for what it calls things, and a named hand for
// what draws them. A new era is those three declarations and no new conditional anywhere.
const plateOwns=trait=>!!(PLATE_STYLES[plateName]&&PLATE_STYLES[plateName].can&&PLATE_STYLES[plateName].can[trait]);
// The vocabulary. It is registered rather than derived, because an era's own words live in that era's
// own file, which loads after this one — so `defineVoice` is additive where `definePlate` is a single
// declaration, and the atlas's words stand under every plate that does not replace them. Resolution is
// memoised on the plate and the registration count, so the merge happens on a plate change and not in
// a frame.
const VOICES={};let voiceHeld=null,voiceKey='',voiceStamp=0;
function defineVoice(id,words){VOICES[id]=mergeTokens(VOICES[id]||{},words);voiceStamp++;}
function plateWords(){
  const key=plateName+':'+voiceStamp;
  if(voiceHeld&&voiceKey===key)return voiceHeld;
  voiceHeld=mergeTokens(VOICES.atlas||{},VOICES[plateName]||{});voiceKey=key;return voiceHeld;
}
// A sentence with the run's own nouns dropped into it. The whole sentence belongs to the plate, not a
// stem the code assembles, because word order is the first thing a century changes.
const spoken=(key,vars)=>String(plateWords()[key]||'').replace(/\{(\w+)\}/g,(m,name)=>vars&&vars[name]!==undefined?String(vars[name]):'');
// The hand. A plate that draws in its own names only the painters that differ from the atlas's; every
// painter it does not name is the atlas's own, so an era is a row in this registry rather than a fork
// at every mark, and two hands can draw into one frame — which a render branch that returns early
// can never do.
const HANDS={atlas:{}};
function defineHand(id,painters){HANDS[id]=Object.assign(HANDS[id]||{},painters);}
const plateHand=()=>HANDS[(PLATE_STYLES[plateName]&&PLATE_STYLES[plateName].render)||'atlas']||HANDS.atlas;
const handFor=name=>plateHand()[name];
definePlate('base',{
  night:{paper:'#080f18',paperRgb:'8,15,24',ink:'209,190,146',inkStrong:'236,229,211',inkSoft:'177,192,183',gold:'226,195,133',goldBright:'244,229,196',copper:'205,159,122',blue:'148,180,177',shieldBlue:'150,196,214',red:'222,145,106',text:'#e0d4b5',caption:'198,187,155',shadow:'#080f18'},
  paper:{paper:'#e7dabd',paperRgb:'231,218,189',ink:'58,42,28',inkStrong:'34,24,16',inkSoft:'96,74,52',gold:'150,100,32',goldBright:'176,118,38',copper:'160,84,52',blue:'52,84,120',shieldBlue:'56,104,134',red:'166,58,40',text:'#2a2016',caption:'92,70,48',shadow:'#e7dabd'},
  ceiling:{paper:'#ddcfad',paperRgb:'221,207,173',ink:'35,29,22',inkStrong:'24,20,15',inkSoft:'92,75,53',gold:'190,142,40',goldBright:'217,173,55',copper:'157,55,36',blue:'32,74,116',shieldBlue:'55,105,120',red:'157,55,36',text:'#211a12',caption:'91,72,49',shadow:'#b9a77f'},
  // Torchlit limestone, and a palette with two holes in it that are the point rather than an omission:
  // there is no gold, so the reddest ochre stands in and is spent as sparingly as gold ever was, and
  // there is no blue at all, so everything the atlas says in blue this era says in its black.
  rock:{paper:'#c7bc9e',paperRgb:'199,188,158',ink:'44,38,34',inkStrong:'33,31,30',inkSoft:'105,88,66',gold:'156,59,34',goldBright:'201,150,46',copper:'169,112,31',blue:'33,31,30',shieldBlue:'44,38,34',red:'156,59,34',text:'#2c2622',caption:'105,88,66',shadow:'#8a7f68'}
});
// ---------- The hand the plate letters in ----------
// Every `ctx.font` in the game is built here. The Fell faces are era V's — the engraved atlas the
// game is set in — and are registered as a plate token like any colour, so a plate cut for another
// century sets its captions in its own type by naming one value rather than by rewriting the font
// string at every place text is drawn. `text` is the roman, `sc` the small caps, `body` the stack the
// stylesheet's running copy uses; each keeps its own fallbacks so a face that fails to load still
// lands on something with the right proportions.
const HIERO_FACE="'Noto Egyptian Hieroglyphs','Segoe UI Historic',serif";
const FELL_FACES={
  text:"'IM Fell English',Georgia,serif",
  sc:"'IM Fell English SC','IM Fell English',Georgia,serif",
  body:"'IM Fell English',Georgia,'Times New Roman',serif",
  hiero:HIERO_FACE
};
// The Ceiling letters in two hands at once, and neither of them is the atlas's. Its Latin is an
// openly modern curatorial layer, so it is set in a slab serif — the class the trade named
// "Egyptian" in the 1810s after the revival Napoleon's expedition set off, and the type an
// excavation plate has been captioned in ever since. It declares itself modern, where the Fell
// types would have claimed the wrong century and a screen serif claimed no century at all. Its
// second hand is the wall's own, and `hiero` is where every plate names the sign face, so a
// caption in signs asks for a face like any other rather than writing one out at the canvas.
const CEILING_FACES={
  text:"'Zilla Slab',Georgia,serif",
  sc:"'Zilla Slab',Georgia,serif",
  body:"'Zilla Slab',Georgia,'Times New Roman',serif",
  hiero:HIERO_FACE
};
// The Rock has no script of its own to letter anything in, so what it sets is entirely the modern
// curatorial layer — and that takes the same slab the Ceiling's does, for the same reason: it is the
// type an excavation plate has been captioned in since the trade named the class, and it declares
// itself modern where the Fell types would claim the wrong century by seventeen thousand years.
definePlate('type',{night:FELL_FACES,paper:FELL_FACES,ceiling:CEILING_FACES,rock:CEILING_FACES});
// A CSS font shorthand at a size, in one of the plate's faces, optionally in a style. Sizes are in
// the same CSS pixels every caller already worked in, so this changes nothing about what is drawn.
const plateFace=(size,variant='text',style='')=>`${style?style+' ':''}${size}px ${ink.type[variant]}`;
function invalidateArt(){
  regionPlates.clear();celestialPlates.clear();darknessPlates.clear();glyphs.clear();
  figureLayers.clear();ringSprites.clear();flareSprites.clear();nebulaSprites.clear();darkMarginalia.clear();
  glowSprites.clear();deviceSprites.clear();regionInkCache.clear();
  grain=grainTexture();laidTiles.clear();laidSheets.clear();backdrops.clear();grainSheetCanvas=null;if(W&&H)backdrop=paintBackdrop();
  frameLayer=null;
  if(typeof invalidateCeilingArt==='function')invalidateCeilingArt();
  if(typeof invalidateRockArt==='function')invalidateRockArt();
}
// The DOM's own hand-authored accent palette — index.html's --ink/--gold/--ivory/... custom properties —
// is a second palette beside the canvas tokens, not derived from them (the two are not 1:1: night's own
// --gold #d5b779 is not base.gold #e2c385). Night's and paper's values are cut by hand and stay that way;
// every other derived plate is owed the same tint its canvas already gets rather than a third hand-tuned
// palette to keep in step. `footer` is `.footer`'s colour, currently only authored for the paper plate
// (index.html:17); a plate with no reason of its own to depart states nothing here.
const DOM_BASE_VARS={
  night:{ink:'#080f18',ivory:'#ece5d3',gold:'#d5b779',muted:'#8d9ca5',copy:'#a9b3b6',best:'#d1c8b6',shield:'#9fc9d8',reflector:'#c4a8d6',dawn:'#f2c79a',copper:'#cd9f7a',line:'rgba(207,188,141,.24)',veil:'8,15,24'},
  paper:{ink:'#e7dabd',ivory:'#2a2016',gold:'#8f5f1e',muted:'#6d5a45',copy:'#4d3d2d',best:'#3d3022',shield:'#3f6f8a',reflector:'#6a406e',dawn:'#a5622a',copper:'#a05434',line:'rgba(74,52,30,.34)',veil:'226,213,184',footer:'#d9ccb0'}
};
const DOM_VAR_NAMES=['ink','ivory','gold','muted','copy','best','shield','reflector','dawn','copper','line','veil','footer'];
// Plates whose CSS rule in index.html genuinely departs from what its own tint would produce (azzurra's
// white heightening, modern's real instrument hues) keep that rule instead of a computed one. An era
// (ceiling, rock) is not a colourway of this palette at all — it carries its own `[data-era]` chrome —
// so it is skipped here the same way, rather than have a computed value at inline specificity clobber it.
const DOM_EXPLICIT_PLATES=new Set(['azzurra','modern']);
function syncDomPalette(){
  // A real CSSStyleDeclaration only outside the test harness, whose lightweight DOM stub has no CSS
  // object of its own; skipped there the same way every other DOM-only sync already guards itself.
  if(!game.style||typeof game.style.setProperty!=='function')return;
  const style=PLATE_STYLES[plateName];
  const computed=style&&!style.era&&!DOM_EXPLICIT_PLATES.has(plateName)?tintValue(DOM_BASE_VARS[style.base],style.tint):null;
  for(const name of DOM_VAR_NAMES){
    const value=computed&&computed[name];
    if(value)game.style.setProperty('--'+name,value);else game.style.removeProperty('--'+name);
  }
}
// The catalogue, colophon and pause leaves are owed the plate's own grain rather than a flat panel
// colour: laidPaper()'s own small tile — the same one drawLaidPaper() lays over the chart — goes into
// --leaf-paper as a repeating data-URL tile, pre-washed to the same .35 (paper) or .055 (night) strength
// drawLaidPaper() uses, so every leaf panel's CSS background can blend it straight into an opaque ground
// with background-blend-mode (--leaf-blend carries multiply or screen to match). Rebuilt only when the
// plate or the pixel ratio actually changes, since the tile itself is keyed the same way laidPaper() is.
let leafAssetsKey='';
function syncLeafAssets(){
  if(!game.style||typeof game.style.setProperty!=='function')return;
  const key=plateName+':'+DPR;
  if(key===leafAssetsKey)return;
  leafAssetsKey=key;
  const tile=laidPaper();
  if(!tile||!tile.width||!tile.height)return;
  const c=makeCanvas(tile.width,tile.height),g=c.getContext('2d');
  g.globalAlpha=onPaper()?.35:.055;g.drawImage(tile,0,0);
  try{
    game.style.setProperty('--leaf-paper',`url(${c.toDataURL('image/png')})`);
    game.style.setProperty('--leaf-blend',onPaper()?'multiply':'screen');
  }catch(_){}
}
function syncPlate(){
  // The stylesheet switches its variables on the base plate; the exact plate is named beside it so a
  // derived plate can adjust a line or two of chrome without repeating the whole palette.
  game.setAttribute('data-plate',plateBase(plateName));
  game.setAttribute('data-plate-id',plateName);
  syncLeafAssets();
  syncDomPalette();
  const era=eraId();if(era)game.setAttribute('data-era',String(era));else game.removeAttribute('data-era');
  const meta=document.querySelector?document.querySelector('meta[name="theme-color"]'):null;if(meta)meta.setAttribute('content',ink.base.paper);
  const button=$('plate');if(button){button.setAttribute('aria-label',onPaper()?'Switch to night plate':'Switch to paper plate');button.setAttribute('aria-pressed',String(onPaper()));}
  if(typeof syncImpressumScreen==='function')syncImpressumScreen();
  if(typeof syncEraChrome==='function')syncEraChrome();
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
// The four chapters' own wash widened so the run's four-act structure actually reaches the sheet once
// composited at the alphas drawRegion (celestial.js) lays them with — night .25, paper a bare .042 — rather
// than the 5-9-unit drift the four used to sit at, which came out barely distinguishable once composited.
// Cool grey-green, warm brown, mauve, indigo: night's own four; paper's run a parallel warm progression so
// each chapter still reads as its own gathering rather than a uniform wash of one plate's whole run.
const atlasRegions=[
  {wash:'38,56,52',pigment:'149,157,143',star:[183,190,175],density:1,seed:3197,
    paper:{wash:'96,86,58',pigment:'92,78,58',star:[70,54,38]}},
  {wash:'68,48,32',pigment:'175,146,111',star:[202,182,151],density:.82,seed:7321,
    paper:{wash:'124,84,42',pigment:'112,84,48',star:[76,52,28]}},
  {wash:'46,34,52',pigment:'143,116,111',star:[179,163,159],density:.62,seed:9481,
    paper:{wash:'112,58,50',pigment:'104,66,50',star:[68,40,32]}},
  {wash:'22,36,64',pigment:'126,145,159',star:[172,185,196],density:.46,seed:5107,
    paper:{wash:'58,74,104',pigment:'70,84,98',star:[42,54,70]}}
];
// A faint change in the laid-paper blend strength across the four chapters, so the gathering reads as a
// slightly different stock as well as a different wash — period-true twice over, since both a hand-coloured
// atlas's gatherings and a colourist's palette genuinely drift through a book. Multiplies drawLaidPaper's
// own base alpha; kept small enough that no single chapter reads as a visible jump on its own.
const CHAPTER_LAID_STRENGTH=[.92,1,1.07,1.15];
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
// Both are held as small maps rather than as one slot apiece. The key already named the plate, so a
// single slot was correct for as long as only one plate was ever on the press at a time — but these two
// are on the per-frame path, and a frame carrying two eras at once through one slot is a full rebuild
// of a tile and a screen-sized sheet, every frame, for as long as the two are both on the sheet.
const laidTiles=new Map(),laidSheets=new Map();
function laidPaper(){
  const key=plateName+':'+DPR,held=laidTiles.get(key);
  if(held)return held;
  // Wires every 4 CSS px and chain lines every 120 — the same reduction the rest of the sheet is judged
  // at (see "Target viewport" in CLAUDE.md), rather than the 1.5px/27px mould the tile used to carry,
  // which packed seven-odd grey levels of banding into a texture too fine for the mark to read as wires
  // at all and left the chain lines close enough to lose the real rhythm a laid sheet has. The tile is
  // widened to 120 so one chain line per tile is the new 120px pitch exactly, with no seam at the repeat.
  const paper=onPaper(),unit=Math.max(1,Math.round(DPR)),tw=120,th=96;
  const c=makeCanvas(tw*unit,th*unit),g=c.getContext('2d'),rng=seeded(30517);
  g.scale(unit,unit);
  g.fillStyle=paper?'#ffffff':'#000000';g.fillRect(0,0,tw,th);
  const dark=a=>paper?`rgba(70,50,26,${a})`:`rgba(206,222,226,${a})`;
  const light=a=>paper?`rgba(255,252,242,${a})`:`rgba(0,0,0,${a})`;
  g.lineWidth=.45;
  for(let y=0;y<th;y+=4){
    g.strokeStyle=dark(paper?.2:.14);g.beginPath();g.moveTo(0,y+.3);g.lineTo(tw,y+.3);g.stroke();
    if(paper){g.strokeStyle=light(.5);g.beginPath();g.moveTo(0,y+1.05);g.lineTo(tw,y+1.05);g.stroke();}
  }
  for(let x=0;x<tw;x+=120){
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
  laidTiles.set(key,c);if(laidTiles.size>4)laidTiles.delete(laidTiles.keys().next().value);return c;
}
function laidSheetFor(){
  const key=plateName+':'+W+'x'+H+':'+DPR,held=laidSheets.get(key);
  if(held)return held;
  const c=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(H*DPR))),g=c.getContext('2d');
  const pattern=g.createPattern(laidPaper(),'repeat');if(!pattern)return null;
  // One tile pixel to one device pixel, so the wires stay crisp whatever the pixel ratio.
  g.fillStyle=pattern;g.fillRect(0,0,c.width,c.height);
  laidSheets.set(key,c);if(laidSheets.size>4)laidSheets.delete(laidSheets.keys().next().value);return c;
}
function drawLaidPaper(){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('laid');if(own)return own();
  // The observatory plate is not printed on a sheet, so it carries neither laid wires nor chain lines;
  // the grain over it stands alone and reads as the sensor's own noise.
  if(modernPlate())return;
  const sheet=laidSheetFor();if(!sheet||!W||!H)return;
  const chapter=world?clamp(Math.floor(world.progress/8),0,3):0;
  ctx.save();ctx.globalCompositeOperation=onPaper()?'multiply':'screen';ctx.globalAlpha=(onPaper()?.35:.055)*CHAPTER_LAID_STRENGTH[chapter];
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
