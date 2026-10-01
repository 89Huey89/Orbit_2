'use strict';
/* Orbit · src/onestar.js
   One star, eight names (JOURNEY.md §9.2, docs/KNOWLEDGE-AUDIT.md §3.3): what each round of the Journey after
   the first reveals. Loads after the era files, whose painters and selectors it reads, and before descent.js. */
// ---------- The round's star ----------
// The first climb reveals nothing; it is the climb. Every round after it follows one real star up the whole
// ladder, the same light named in each century's own hand: the Pleiades in the second round, Sirius in the third,
// Antares in the fourth, Aldebaran in the fifth, and the four again from the sixth. In every century of such a
// round one body on the chart *is* that star, and the descent that ends the round letters the ochre dot with its
// name. Only attested names are set: where a century has left no name for the star, its line says so plainly,
// and a reading that is only likely is hedged the way the Rock's notes hedge the Lascaux dots. Each entry carries
// the evidence label ERA-AUDIT.md asks for and its source; docs/archive/eras/research/one-star.md keeps the table.
// `line` is what the sheet inscribes beside the body, in the century's own small caps, always ending in the name
// the player knows the star by; `own` is the name in the century's own script, set again on the catalogue's
// leaf with `reading` beneath it; `note` is the curator's sentence said as the body is landed on; `glyphs`, for
// the Ceiling alone, is the name spelt in signs, quadrat by quadrat, as CEILING_WORD spells its words.
const ONE_STAR_KEY='orbit.star.v1',ONE_STAR_FROM=2;
const ONE_STARS=[
  {id:'pleiades',title:'The Pleiades',eras:{
    1:{line:'THE PLEIADES · NO NAME SURVIVES',own:'',reading:'',label:'plausible reconstruction',
      note:'No name for it survives from the wall. Six dots over a Lascaux bull’s shoulder may be the Pleiades, or may not.',
      source:'Rappenglück, after Antequera Congregado (1992); contested by Bahn and by Hayden & Villeneuve (2011). research/rock.md §1, §12.'},
    2:{line:'KHAU · THE PLEIADES?',own:'',reading:'Khau · the Thousands',label:'plausible reconstruction',
      glyphs:[[0x1340d],[0x1313f,0x13171],[0x131fc]],
      note:'Khau, the Thousands, is a decan most now read as the Pleiades. The reading is likely, not certain.',
      source:'The decan ḫꜣw; its reading as the Pleiades is the majority view, not a certainty (Sparavigna, arXiv:0810.1592; Sino-Platonic Papers 253). Spelt here ḫ-ꜣ-w with the star sign.'},
    3:{line:'昴 MAO · THE PLEIADES',own:'昴',reading:'Mao · the Hairy Head',label:'attested',
      note:'Mao, the Hairy Head, is the eighteenth lodge of the Moon. The Book of Songs already sings of “twinkling small stars, Shen and Mao.”',
      source:'The lodge 昴 of the twenty-eight xiu; Shijing, Shao Nan, 小星: 嘒彼小星，維參與昴.'},
    4:{line:'الثريا · AL-THURAYYA · THE PLEIADES',own:'الثريا',reading:'al-Thurayyā · the little abundant one',label:'attested',
      note:'Al-thurayya, the little abundant one: the Pleiades, whose risings at dawn the Arabs tied to the coming of the rains.',
      source:'Arabic al-thurayyā, a diminutive of “abundant” (Kunitzsch; Univ. of Arizona, Arab Star Calendars).'},
    5:{line:'PLEIADES · η TAURI',own:'Pleiades · η Tauri',reading:'Alcyone, the brightest of them',label:'attested',
      note:'Bayer lettered the Pleiades inside Taurus in 1603. Alcyone, the brightest, is his η Tauri.',
      source:'Bayer, Uranometria (1603): η Tauri = Alcyone.'},
    6:{line:'25 TAURI · THE PLEIADES',own:'25 Tauri',reading:'Alcyone, numbered from Flamsteed',label:'attested',
      note:'Alcyone is 25 Tauri, numbered from Flamsteed’s telescopic catalogue. In 1769 Messier entered the whole cluster as M 45, at Alcyone’s place.',
      source:'Flamsteed number 25 Tau; Messier, 4 March 1769: “cluster of stars known by the name of the Pleiades”, position of Alcyone (SEDS Messier pages).'},
    7:{line:'HIP 17702 · THE PLEIADES',own:'HIP 17702',reading:'Alcyone, in the Hipparcos catalogue',label:'attested',
      note:'Hipparcos measured the Pleiades from space as nearer than every other method did. Radio telescopes settled it in 2014: about 444 light-years.',
      source:'HIP 17702 = η Tau; Hipparcos 118–122 pc against 133–136 pc; Melis et al., Science 345 (2014), VLBI 136.2 pc.'},
    8:{line:'PLEIADES · 444 LY',own:'PLEIADES · 444 LY',reading:'logged, not a target',label:'gameplay translation',
      note:'Pleiades: a cluster about a hundred million years old, its brightest stars hot and blue. Logged; not a target.',
      source:'Distance from the 2014 VLBI parallax; age c. 100–125 Myr. The probe’s log is the game’s.'}
  }},
  {id:'sirius',title:'Sirius',eras:{
    1:{line:'SIRIUS · NO NAME SURVIVES',own:'',reading:'',label:'gameplay translation',
      note:'No name for it survives from the wall, and no mark on any wall is securely read as it.',
      source:'No claim is made for Sirius in the Palaeolithic record; research/rock.md.'},
    2:{line:'SOPDET · SIRIUS',own:'',reading:'Sopdet',label:'attested',
      glyphs:[[0x132f4,0x132aa],[0x130a7,0x133cf],[0x131fc]],
      note:'Sopdet, Sirius: her rising before the Sun opened the year. On Senenmut’s ceiling she sits behind Sah.',
      source:'Sopdet (Greek Sothis) on the Senenmut ceiling, TT353, seated behind Sah; research/ceiling.md. Spelt here s-p-d-t with the star sign; the common spelling opens with the thorn sign instead.'},
    3:{line:'天狼 TIANLANG · SIRIUS',own:'天狼',reading:'Tianlang · the Celestial Wolf',label:'attested',
      note:'Tianlang, the Celestial Wolf. Sima Qian set it among the celestial offices, with the Bow to its south drawn against it.',
      source:'天狼 in Sima Qian’s Tianguan shu (Shiji, c. 100 BCE); the Bow and Arrow, 弧矢.'},
    4:{line:'الشعرى · AL-SHIRA · SIRIUS',own:'الشعرى',reading:'al-Shirā',label:'attested',
      note:'Al-shira is Sirius, one of the few stars the Qur’an names: “He is the Lord of al-shira” (53:49).',
      source:'Qur’an 53:49; al-shiʿrā al-yamāniya in the star lists (Kunitzsch).'},
    5:{line:'SIRIUS · α CANIS MAIORIS',own:'Sirius · α Canis Maioris',reading:'the Dog Star',label:'attested',
      note:'Sirius, α Canis Maioris: the brightest of the fixed stars, the Dog Star whose rising with the Sun named the dog days.',
      source:'Bayer, Uranometria (1603).'},
    6:{line:'9 CANIS MAIORIS · SIRIUS',own:'9 Canis Majoris',reading:'Sirius, numbered from Flamsteed',label:'attested',
      note:'Bessel saw Sirius wobble in 1844 and said an unseen star pulled it. Alvan Graham Clark, testing a new lens in 1862, saw it.',
      source:'Flamsteed number 9 CMa; Bessel 1844; A. G. Clark, 31 January 1862, the 18½-inch Dearborn refractor.'},
    7:{line:'HIP 32349 · SIRIUS',own:'HIP 32349',reading:'Sirius, in the Hipparcos catalogue',label:'attested',
      note:'Voyager 2 is bound past Sirius: in about 296,000 years it will come within 4.3 light-years of it.',
      source:'HIP 32349 = α CMa; NASA/JPL Voyager mission pages (4.3 ly, c. 296,000 years).'},
    8:{line:'SIRIUS · 8.60 LY',own:'SIRIUS · 8.60 LY',reading:'logged, not a target',label:'gameplay translation',
      note:'Sirius: 8.6 light-years, a star twice the Sun’s mass with a white dwarf beside it. Logged; a hard system to settle.',
      source:'The Probe’s own PRB_SYSTEMS entry (8.60 ly); Sirius A c. 2 solar masses. The probe’s log is the game’s.'}
  }},
  {id:'antares',title:'Antares',eras:{
    1:{line:'ANTARES · NO NAME SURVIVES',own:'',reading:'',label:'gameplay translation',
      note:'No name for it survives from the wall, and no mark on any wall is securely read as it.',
      source:'No claim is made for Antares in the Palaeolithic record; research/rock.md.'},
    2:{line:'ANTARES · NO NAME IS CERTAIN',own:'',reading:'',label:'gameplay translation',
      note:'No Egyptian name for Antares can be fixed with confidence. It may stand in the decan lists under a name no one can now match.',
      source:'Decan identifications beyond Sah, Sopdet and Meskhetiu are uncertain; research/ceiling.md.'},
    3:{line:'大火 DAHUO · ANTARES',own:'大火',reading:'Dahuo · the Great Fire',label:'attested',
      note:'Dahuo, the Great Fire, the red heart of the lodge Xin. “In the seventh month the Fire goes down,” sings the Book of Songs.',
      source:'大火 = 心宿二; Shijing, Bin Feng, 七月: 七月流火.'},
    4:{line:'قلب العقرب · QALB AL-AQRAB · ANTARES',own:'قلب العقرب',reading:'Qalb al-Aqrab · the heart of the scorpion',label:'attested',
      note:'Qalb al-aqrab, the heart of the scorpion: the red middle star of the three across its body.',
      source:'Al-Ṣūfī, Book of the Fixed Stars (964), after Ptolemy’s “middle of the three in the body”; Kunitzsch.'},
    5:{line:'ANTARES · α SCORPII',own:'Antares · α Scorpii',reading:'the rival of Ares',label:'attested',
      note:'Antares, α Scorpii: the name is Greek, the rival of Ares, for a redness to match the planet Mars.',
      source:'Ptolemy, Almagest (Ἀντάρης); Bayer, Uranometria (1603).'},
    6:{line:'21 SCORPII · ANTARES',own:'21 Scorpii',reading:'Antares, numbered from Flamsteed',label:'attested',
      note:'Its faint companion was first glimpsed in 1819, by Bürg in Vienna, in the moment the Moon slid over Antares.',
      source:'Flamsteed number 21 Sco; J. T. Bürg, lunar occultation of 13 April 1819.'},
    7:{line:'HIP 80763 · ANTARES',own:'HIP 80763',reading:'Antares, in the Hipparcos catalogue',label:'attested',
      note:'Hipparcos put it some 550 light-years off: a red supergiant near seven hundred times the Sun’s width.',
      source:'HIP 80763 = α Sco; Hipparcos parallax 5.89 ± 1.00 mas (c. 170 pc); radius c. 680 solar.'},
    8:{line:'ANTARES · 550 LY',own:'ANTARES · 550 LY',reading:'logged, not a target',label:'gameplay translation',
      note:'Antares: a supergiant near the end of its life, which will end as a supernova. Not a place to send a daughter.',
      source:'Antares as a core-collapse supernova progenitor (RNAAS 2025). The probe’s log is the game’s.'}
  }},
  {id:'aldebaran',title:'Aldebaran',eras:{
    1:{line:'ALDEBARAN · NO NAME SURVIVES',own:'',reading:'',label:'plausible reconstruction',
      note:'No name for it survives. If the dots over the Lascaux bull are the Pleiades, its eye may be Aldebaran, or may not.',
      source:'Rappenglück’s reading of the Hall of the Bulls; contested. research/rock.md §12.'},
    2:{line:'ALDEBARAN · NO NAME IS CERTAIN',own:'',reading:'',label:'gameplay translation',
      note:'No Egyptian name for Aldebaran can be fixed with confidence, though the Thousands, Khau, may stand just beside it.',
      source:'Decan identifications beyond Sah, Sopdet and Meskhetiu are uncertain; research/ceiling.md.'},
    3:{line:'畢 BI · ALDEBARAN',own:'畢',reading:'Bi · the Net',label:'attested',
      note:'Bi, the Net, the nineteenth lodge, a hunter’s net of stars. Aldebaran is its brightest; a later list calls it the Net’s fifth.',
      source:'The lodge 畢 of the twenty-eight xiu; 畢宿五 is the later numbered name.'},
    4:{line:'الدبران · AL-DABARAN · ALDEBARAN',own:'الدبران',reading:'al-Dabarān · the follower',label:'attested',
      note:'Al-dabaran, the follower: it rises after al-thurayya, the Pleiades, and follows them all night.',
      source:'Al-Ṣūfī (964); Kunitzsch. The Astrolabe’s own ASTRO_STARS.'},
    5:{line:'ALDEBARAN · α TAURI',own:'Aldebaran · α Tauri',reading:'Oculus Tauri, the Bull’s eye',label:'attested',
      note:'Aldebaran, α Tauri, the Bull’s eye. Its Arabic name came into Latin whole, and stayed.',
      source:'Bayer, Uranometria (1603); Oculus Tauri in Allen, Star-Names (1899).'},
    6:{line:'87 TAURI · ALDEBARAN',own:'87 Tauri',reading:'Aldebaran, numbered from Flamsteed',label:'attested',
      note:'In 1718 Halley found from an old record of the Moon covering it that it had moved since: the fixed stars are not fixed.',
      source:'Flamsteed number 87 Tau; Halley 1718, from the occultation seen at Athens in 509.'},
    7:{line:'HIP 21421 · ALDEBARAN',own:'HIP 21421',reading:'Aldebaran, in the Hipparcos catalogue',label:'attested',
      note:'Pioneer 10 is coasting in its direction. It will take about two million years to cover the sixty-eight light-years.',
      source:'HIP 21421 = α Tau; NASA Pioneer 10 mission pages.'},
    8:{line:'ALDEBARAN · 65 LY',own:'ALDEBARAN · 65 LY',reading:'logged, not a target',label:'gameplay translation',
      note:'Aldebaran: an orange giant sixty-five light-years off, some forty-four times the Sun’s width. Logged; not a target.',
      source:'Distance 65 ly, radius c. 44 solar. The probe’s log is the game’s.'}
  }}
];
// The round counts from one, as the Journey's line names it (journey.rounds is the circles closed before it).
const oneStarOfRound=round=>round>=2?ONE_STARS[(Math.floor(round)-2)%ONE_STARS.length]:null;
// The star the run in hand follows: only a Journey run, and only in a round after the first.
function oneStarNow(){
  if(runMode!=='journey'||dailyOn||typeof journey==='undefined')return null;
  return oneStarOfRound(journey.rounds+1);
}
// ---------- What has been met, kept ----------
// A star is met in a century once its name has been set on that century's sheet, and held once it has been
// landed on. Each star keeps one small mask per century: 1 for met, 2 for held.
function readOneStars(){
  let raw=null;
  try{raw=JSON.parse(storage.get(ONE_STAR_KEY,'null'));}catch(_){raw=null;}
  const out={v:1,met:{}},src=raw&&typeof raw==='object'&&!Array.isArray(raw)&&raw.met&&typeof raw.met==='object'&&!Array.isArray(raw.met)?raw.met:{};
  for(const star of ONE_STARS){
    const from=src[star.id],into={};
    if(from&&typeof from==='object'&&!Array.isArray(from))for(let era=1;era<=JOURNEY_ERAS;era++){const m=Math.floor(Number(from[era]))&3;if(m>0)into[era]=m;}
    out.met[star.id]=into;
  }
  return out;
}
const oneStarBook=readOneStars();
function oneStarMeet(star,era,bit){
  const into=oneStarBook.met[star.id]||(oneStarBook.met[star.id]={});
  if(((into[era]||0)&bit)===bit)return false;
  into[era]=(into[era]||0)|bit;storage.set(ONE_STAR_KEY,JSON.stringify(oneStarBook));return true;
}
const oneStarMet=(star,era)=>(oneStarBook.met[star.id]&&oneStarBook.met[star.id][era])||0;
// ---------- The body that is the star ----------
// One body in each century of the round: the first plain main-line body from the second row the century is
// flown in, never an opening choice, a figure's star, a pickup, a slingshot or a fading copper orbit, and never
// a body the century has already given a name of its own — the Ceiling's wanderers in their barques, the
// Astrolabe's wandering stars. It is read off the chart a seed deals, so a seed always deals it on the same body,
// and the pick is kept once made, since a body passed under the dark is taken off the chart.
let oneStarPicked={world:null,from:-1,era:0,id:-1};
const oneStarPlain=n=>!!n&&!n.difficultyChoice&&n.routeId==null&&(n.type==='still'||n.type==='drift')&&n.row===Math.floor(n.row);
function oneStarClaimed(n,era){
  if(era===2&&typeof ceilingWanderer==='function')return !!ceilingWanderer(n);
  if(era===4&&typeof astroWanderer==='function')return astroWanderer(n)!==-1;
  return false;
}
function oneStarBody(w=world){
  if(!w||!oneStarNow())return null;
  const from=w.eraFrom||0,era=journeyEraOf(),p=oneStarPicked;
  if(p.world===w&&p.from===from&&p.era===era)return w.nodes.find(q=>q.id===p.id)||null;
  for(let k=from+ONE_STAR_FROM;k<=w.row;k++){
    if(!astroPlainRow(k))continue;
    const n=w.nodes.find(q=>q.row===k&&oneStarPlain(q));
    if(!n||oneStarClaimed(n,era))continue;
    oneStarPicked={world:w,from,era,id:n.id};return n;
  }
  return null;
}
const oneStarIs=n=>!!n&&oneStarBody()===n;
// The entry for the century in hand, or null.
function oneStarHere(){const star=oneStarNow();return star?{star,era:journeyEraOf(),entry:star.eras[journeyEraOf()]}:null;}
// ---------- On the sheet ----------
// Called once a frame from updateUI. The name is a standing inscription, in the plate's own small caps on a
// leader to the body, written once the pen has drawn the body and kept there while the body is still ahead of
// the traveller or held; once it is left behind it is ink like any other note, and the sheet carries it off.
function oneStarTick(){
  if(!world||world.state!=='playing'||(typeof eraGrowth!=='undefined'&&eraGrowth))return;
  const here=oneStarHere();if(!here)return;
  const n=oneStarBody();if(!n)return;
  const y=sy(n.y),p=world.player,ahead=p.node===n||n.row>=Math.floor(world.progress);
  if(!ahead||y<H*.08||y>H-footerBand())return;
  if(reveal.progress(n,NODE_REVEAL)<.6)return;
  const g=inscribeHeld('onestar',here.entry.line,{node:n,tone:'caps'});
  if(g)oneStarMeet(here.star,here.era,1);
}
// The landing on it is the century's note, in the curator's voice, said once.
function oneStarCapture(n){
  const here=oneStarHere();if(!here||!oneStarIs(n))return;
  oneStarMeet(here.star,here.era,1);oneStarMeet(here.star,here.era,2);
  say(here.entry.note,{node:n,tone:'note'});
}
// The Ceiling spells the name in signs as well, under the body, in the yellow its stars are painted in: the
// small caps the plate letters its inscriptions in carry no hieroglyphs. Drawn from ceilingDrawNode's loop.
function oneStarCeilingSigns(n){
  const here=oneStarHere();if(!here||here.era!==2||!here.entry.glyphs||!oneStarIs(n))return;
  const t=reveal.progress(n,NODE_REVEAL);if(t<.6)return;
  const q=here.entry.glyphs,cell=Math.max(22,24*scale),x=sx(n.x),y=sy(n.y)+n.r*scale+cell*.9,left=x-(q.length-1)*cell/2;
  ctx.save();ctx.globalAlpha=clamp((t-.6)/.4,0,1)*.95;
  for(let i=0;i<q.length;i++)ceilingQuadrat(ctx,q[i],left+i*cell,y,cell,CEILING_PALETTE.yellow,1,(n.id|0)+i*13);
  ctx.restore();
}
// The Astrolabe names a few bright bodies of every chart from its own twelve stars (ASTRO_STARS). Where the round
// follows one of those twelve, the Astrolabe does not set its name on a second body as well.
function oneStarAstroTaken(i){
  const here=oneStarHere();if(!here||here.era!==4||typeof ASTRO_STARS==='undefined'||!ASTRO_STARS[i])return false;
  return ASTRO_STARS[i][0]===here.entry.own;
}
