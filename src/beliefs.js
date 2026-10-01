'use strict';
/* Orbit · src/beliefs.js
   A belief kept, and corrected, in every century (docs/KNOWLEDGE-AUDIT.md §3.2 item 7): the Lens's own form —
   LOWELL 1895, then NOT CANALS · A. 1909 — carried to every sheet that has an honest pair to offer. Loads after
   the era files and onestar.js, whose selectors it reads, and before descent.js. */
// ---------- What each century believed, and what corrected it ----------
// Every century but the Rock sets one belief of its own time on the sheet early in the run, as a standing note
// beside a body, and later in the same run sets it again struck through, with the correction written beneath it
// in the same hand: the sheet corrects itself in ink rather than erasing, as the Lens's plate corrects Lowell.
// Only an attested belief and an attested correction are set, and the correction is never dated past what the
// era can honestly reach: inside the century, or, for the Flyby, the century that undid the one before it.
// Each entry carries the evidence label ERA-AUDIT.md asks for and its source; the table and the argument for
// every pair are docs/archive/eras/research/beliefs.md and KNOWLEDGE-HORIZON.md's last column.
// `at` and `fixAt` are rows counted from the row the century was entered on: the first plain body from `at` is
// given the belief, the first from `fixAt` the struck belief and its correction. Where a century tells itself
// in dated chapters, the two rows fall in the chapters of the two dates.
// The Rock sets none. It asserts nothing a later hand could correct: no belief of the Palaeolithic survives in
// words, and a modern reading of a wall corrected by another modern reading is not the wall's own belief.
// The Lens keeps its pair on Mars's own plate (lensBodyPlate), where it was first built; it is listed here so
// the table is whole, and `own` says the Lens draws it itself.
const BELIEFS={
  2:{belief:'THE YEAR IS 365 DAYS',fix:'SOPDET SLIPS A DAY IN FOUR YEARS · CANOPUS, 238 BCE',at:3,fixAt:15,
    label:'attested',
    source:'The civil year of 12 × 30 days and five epagomenal days; the Decree of Canopus (Ptolemy III, 7 March 238 BCE): “the rising of Sothis advances to another day in every four years”, and a sixth epagomenal day every fourth year. The reform lapsed and was taken up only under Augustus.'},
  3:{belief:'寸差千里 · AN INCH OF SHADOW PER THOUSAND LI',fix:'一行 YIXING, 724 · 2.1 INCHES IN 527 LI',at:3,fixAt:11,
    label:'attested',
    source:'The old rule that a gnomon’s noon shadow changes one cun for every thousand li north or south (寸差千里), doubted by Liu Zhuo under the Sui; refuted by the Kaiyuan survey of 724 under Yixing and Nangong Yue: from Baima to Shangcai, 526 li 270 bu, the summer-solstice shadow differed by 2.1 cun, and one du of the pole’s height came to 351 li 80 bu.'},
  4:{belief:'معدل المسير · PTOLEMY’S EQUANT',fix:'TWO CIRCLES FOR THE EQUANT · AL-TUSI, MARAGHA 1261',at:19,fixAt:25,
    label:'attested',
    source:'Ptolemy’s equant (Ar. muʿaddil al-masīr), kept by the Almagest tradition and the equatorium makers; al-Ṭūsī’s al-Tadhkira fī ʿilm al-hayʾa (1261), whose pair of circles — one rolling inside another twice its size — gives a straight motion from two uniform ones and replaced the equant in his models (not for Mercury, which he left unsolved).'},
  5:{belief:'CŒLUM IMMUTABILE · ARISTOTELES',fix:'STELLA NOVA SUPRA LUNAM · TYCHO 1572',at:3,fixAt:10,
    label:'attested',
    source:'Aristotle’s unchanging heavens above the Moon; Tycho Brahe, De nova stella (1573): the new star of November 1572 showed no daily parallax, and so stood beyond the Moon.'},
  6:{own:true,belief:'LOWELL 1895',fix:'NOT CANALS · A. 1909',
    label:'attested',
    source:'Lowell, Mars (1895); Antoniadi at the Meudon 83 cm refractor, 1909. Drawn on Mars’s own plate by lens.js.'},
  7:{belief:'CANALS · LOWELL 1895',fix:'NO CANALS · CRATERS · MARINER 4, 1965',at:2,fixAt:4,
    label:'attested',
    source:'Lowell, Mars (1895); Mariner 4’s 21 pictures of July 1965, covering about one per cent of the planet, showed craters and no canals.'},
  8:{belief:'TWO GIANTS · VAN DE KAMP 1969',fix:'NOT FOUND · TELESCOPE FAULT, 1973',at:13,fixAt:19,
    label:'attested',
    source:'Van de Kamp’s astrometric planet (1963) and two-planet solution (1969) from Sproul plates — the reason Project Daedalus chose the star; Gatewood & Eichhorn (1973) found no wobble, and Hershey (1973) traced it to the Sproul objective’s cleaning and remounting. Four small planets, under half an Earth’s mass each, were confirmed in 2025 (Basant et al., ApJL 982 L1).'}
};
const beliefOf=era=>BELIEFS[era]||null;
// The belief the sheet in hand keeps, or null: none on a proof before letters, which carries no notes at all,
// and none where the Lens draws its own.
function beliefHere(){
  if(typeof journeyEraOf!=='function'||(typeof plainPlate==='function'&&plainPlate())||(typeof modernPlate==='function'&&modernPlate()))return null;
  const era=journeyEraOf(),b=beliefOf(era);
  return b&&!b.own?{era,b}:null;
}
// ---------- The two bodies ----------
// The first plain main-line body from a row: never an opening choice, a figure's star, a pickup, a slingshot or
// a fading orbit, never a body the century has named itself (the Ceiling's wanderers, the Astrolabe's wandering
// stars), and never the round's star, which carries a name of its own. Read off the chart a seed deals, so the
// same seed always sets the belief on the same body, and kept once found.
let beliefPicked={world:null,from:-1,era:0,set:-1,fix:-1};
function beliefFirstFrom(w,row,era,skip){
  for(let k=row;k<=w.row;k++){
    const n=w.nodes.find(q=>q.row===k&&q!==skip&&oneStarPlain(q)&&!oneStarClaimed(q,era)&&!(typeof oneStarIs==='function'&&oneStarIs(q)));
    if(n)return n;
  }
  return null;
}
function beliefBodies(w=world){
  const here=beliefHere();if(!w||!here)return null;
  const from=w.eraFrom||0,p=beliefPicked;
  if(p.world!==w||p.from!==from||p.era!==here.era)beliefPicked={world:w,from,era:here.era,set:-1,fix:-1};
  const q=beliefPicked,find=id=>id<0?null:w.nodes.find(n=>n.id===id)||null;
  let set=find(q.set),fix=find(q.fix);
  if(q.set<0){set=beliefFirstFrom(w,from+here.b.at,here.era,null);if(set)q.set=set.id;}
  if(q.fix<0){fix=beliefFirstFrom(w,from+here.b.fixAt,here.era,set);if(fix)q.fix=fix.id;}
  return {set,fix,here};
}
// ---------- On the sheet ----------
// Called once a frame from updateUI, after the round's star. The belief is a standing note in the plate's own
// small caps on a leader to its body, written once the pen has drawn the body and kept while the body is ahead
// or held; left behind, it is ink like any other note and the sheet carries it off. The correction is set the
// same way on its own body further up the run: the belief quoted and struck through, the correction beneath.
// If the first note is still on the sheet when the correction is written, it is struck where it stands too.
// Whether a body is where a note may be set for it: ahead of the traveller or held, on the plate, and drawn.
function beliefVisible(n){
  if(!n)return false;const y=sy(n.y),p=world.player,ahead=p.node===n||n.row>=Math.floor(world.progress);
  return ahead&&y>=H*.08&&y<=H-footerBand()&&reveal.progress(n,NODE_REVEAL)>=.6;
}
function beliefTick(visible=beliefVisible){
  if(!world||world.state!=='playing'||(typeof eraGrowth!=='undefined'&&eraGrowth))return;
  const got=beliefBodies();if(!got)return;
  const {set,fix,here}=got,b=here.b;
  if(fix&&visible(fix)){
    const g=inscribeHeld('belief-fix',b.fix,{node:fix,tone:'caps',struck:b.belief});
    if(g)for(const q of inscriptions)if(q.key==='belief'&&q.text===b.belief)strikeInscription(q);
    return;
  }
  if(set&&visible(set)&&!inscriptions.some(q=>q.key==='belief-fix'))inscribeHeld('belief',b.belief,{node:set,tone:'caps'});
}
