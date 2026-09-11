'use strict';
/* Orbit · src/effects.js
   Rising darkness, the player comet, trail, ripples, and particle effects. */
// ---------- Rising darkness, player comet, and effects: spilled ink on paper, starlight ink at night ----------
definePlate('dark',{
  night:{
    chapterLabel:'#baa57b',chapterRule:'202,180,137',chapterDiamond:'216,195,154',
    playerHeadWash:'222,199,151',playerFilamentA:'195,178,138',playerFilamentB:'236,218,178',
    playerHalo:'#0c1519',playerKeyline:'#0c1519',playerMid:'#dcc394',playerHighlight:'#fff3ce',playerNib:'246,227,181',playerShield:'150,205,224',playerReflector:'196,172,224',playerDawn:'247,203,152',
    trailWash:'204,181,133',trailStroke:'242,225,186',trailEdge:'165,154,123',trailBleed:'214,193,151',
    // What the plate's own ink actually is, as against what colour it is: the atlas is written with a
    // cut quill, so its line swells and thins with the turn of the flight. See MATERIALS below.
    trailMedium:'quill',
    // The route already flown, long dry on the sheet.
    pathInk:'128,134,116',
    // A fresh stroke is bright ink; as it ages it sinks back to a dimmer, drier tone.
    trailWet:[250,240,208],trailDry:[143,148,128],blotWet:[236,224,186],blotDry:[152,148,122],
    pigment:'166,125,101',pigmentRelief:'211,192,143',shorelineRelief:'221,202,152',
    washTop:'4,10,17',washMid:'6,13,22',washSolid:'#040910',bodyTop:'5,11,19',bodyMid:'4,10,18',
    voidLayers:['rgba(22,30,36,.23)','rgba(13,22,31,.44)','rgba(7,16,25,.57)','rgba(4,11,20,.63)','rgba(3,8,15,.72)'],
    landFillWash:'rgba(36,45,50,.075)',landFillPool:'rgba(1,5,12,.3)',fleckDark:'0,3,9',
    burstGold:'230,209,159',burstRed:'222,145,106',burstBlue:'165,215,210',burstViolet:'210,190,224',ringSimple:'231,216,171',
    transferArc:'226,207,165',transferArcSoft:'186,169,131',transferTick:'239,219,173',transferNib:'232,212,171',
    floaterText:'238,224,185',screenFlash:'238,212,157'
  },
  paper:{
    chapterLabel:'#5c4630',chapterRule:'58,42,28',chapterDiamond:'34,24,16',
    playerHeadWash:'96,74,52',playerFilamentA:'96,74,52',playerFilamentB:'58,42,28',
    playerHalo:'#e7dabd',playerKeyline:'#221810',playerMid:'#3a2a1c',playerHighlight:'#604a34',playerNib:'58,42,28',playerShield:'52,84,120',playerReflector:'92,58,120',playerDawn:'186,102,40',
    trailWash:'96,74,52',trailStroke:'34,24,16',trailEdge:'120,92,60',trailBleed:'80,55,34',
    trailMedium:'quill',
    pathInk:'104,74,42',
    // Wet iron-gall is glossy blue-black; it dries to a matte sepia within a second.
    trailWet:[24,26,46],trailDry:[122,88,52],blotWet:[20,22,42],blotDry:[130,98,58],
    // The calibrated shoreline is rubrication red-brown on paper, turning ochre/gold during a reprieve.
    pigment:'166,58,40',pigmentRelief:'176,118,38',shorelineRelief:'176,118,38',
    // Spilled indigo-black ink, #14121f family, pooling and feathering into the paper fibres.
    washTop:'20,18,31',washMid:'24,20,34',washSolid:'#14121f',bodyTop:'20,18,31',bodyMid:'20,18,31',
    // Capped at .82 rather than running to near-opaque: the paper sheet — its grain, the laid tile
    // multiplied over it — has to still be legible even at the deepest reach of the flood, or the ink
    // stops reading as ink on a sheet and becomes a flat printed field, the one thing no burin cuts.
    voidLayers:['rgba(28,24,38,.3)','rgba(24,20,34,.48)','rgba(20,18,31,.62)','rgba(16,14,26,.73)','rgba(14,12,22,.82)'],
    landFillWash:'rgba(20,18,31,.09)',landFillPool:'rgba(14,12,22,.34)',fleckDark:'14,12,22',
    burstGold:'150,100,32',burstRed:'166,58,40',burstBlue:'52,84,120',burstViolet:'92,58,120',ringSimple:'58,42,28',
    transferArc:'58,42,28',transferArcSoft:'96,74,52',transferTick:'34,24,16',transferNib:'58,42,28',
    floaterText:'34,24,16',
    // Ink does not glow, so a flash on this plate has to be a dark shadow the press throws rather than
    // a bright wash it never carries — otherwise a near-white fill over paper's own pale ground does
    // almost nothing. Read at a higher alpha than night's own bright flash for the same reason.
    screenFlash:'22,20,38'
  },
  // A void family that never goes through the tint: azzurra's own duotone dark stop is a mid-value
  // blue-grey and cellarius's and verdigris's sit only a little below their own sheet, so the rising
  // darkness these six tokens paint would land close to — on azzurra, lighter than — the plate's own
  // ground instead of reading as an encroaching black. Each plate states its own ink-black directly.
  cellarius:{washTop:'6,8,20',washMid:'6,8,20',washSolid:'#060814',bodyTop:'6,8,20',bodyMid:'6,8,20',
    voidLayers:['rgba(6,8,20,.23)','rgba(6,8,20,.44)','rgba(6,8,20,.57)','rgba(6,8,20,.63)','rgba(6,8,20,.72)']},
  verdigris:{washTop:'8,14,12',washMid:'8,14,12',washSolid:'#080e0c',bodyTop:'8,14,12',bodyMid:'8,14,12',
    voidLayers:['rgba(8,14,12,.23)','rgba(8,14,12,.44)','rgba(8,14,12,.57)','rgba(8,14,12,.63)','rgba(8,14,12,.72)']},
  azzurra:{washTop:'38,34,40',washMid:'38,34,40',washSolid:'#262228',bodyTop:'38,34,40',bodyMid:'38,34,40',
    voidLayers:['rgba(38,34,40,.23)','rgba(38,34,40,.44)','rgba(38,34,40,.57)','rgba(38,34,40,.63)','rgba(38,34,40,.72)']},
  // Era I states only what it cannot inherit. A crayon leaves no wet ink and dries to nothing, so the
  // wake behind the traveller is ochre dust rather than iron gall going from glossy blue-black to
  // sepia; the burst colours lose the atlas's blue and violet, which this era has no pigment for, and
  // the flash and the floated numerals take the wall's own kaolin and charcoal. Everything the era does
  // not name here — the shoreline, the spilled ink, the player's own tones — is its own hand's, drawn
  // by src/rock.js, and never reaches these tokens at all.
  rock:{
    trailWash:'169,112,31',trailStroke:'44,38,34',trailEdge:'156,59,34',trailBleed:'201,150,46',
    trailMedium:'crayon',
    pathInk:'156,59,34',
    trailWet:[156,59,34],trailDry:[169,112,31],blotWet:[156,59,34],blotDry:[201,150,46],
    burstGold:'201,150,46',burstRed:'156,59,34',burstBlue:'44,38,34',burstViolet:'33,31,30',ringSimple:'156,59,34',
    transferArc:'44,38,34',transferArcSoft:'105,88,66',transferTick:'33,31,30',transferNib:'44,38,34',
    floaterText:'234,225,207',screenFlash:'255,247,225'
  }
});
// Blends two registered [r,g,b] plate colours into an `r,g,b` string for a template literal.
const mixRgb=(a,b,t)=>Math.round(lerp(a[0],b[0],t))+','+Math.round(lerp(a[1],b[1],t))+','+Math.round(lerp(a[2],b[2],t));
// The catalogue's trail inks, registered per plate like every other colour: a wet and a dry tone for
// the stroke, the wash beneath it, the dry-brush edge, the bleed of a fast segment, and the bead of ink
// at a release. The plate's own iron gall is read from the `dark` section above and needs no entry.
definePlate('inks',{
  night:{
    sanguine:{wet:[214,116,88],dry:[150,86,68],wash:'196,110,84',edge:'170,96,74',bleed:'206,120,92',blotWet:[214,116,88],blotDry:[152,90,70],path:'150,86,68'},
    silverpoint:{wet:[226,230,236],dry:[132,138,146],wash:'170,176,184',edge:'150,158,168',bleed:'196,202,210',blotWet:[214,220,228],blotDry:[134,140,148],shimmer:'244,248,255',path:'126,132,140'},
    goldleaf:{wet:[252,222,150],dry:[178,140,70],wash:'214,178,104',edge:'150,116,54',bleed:'232,198,126',blotWet:[250,220,148],blotDry:[176,138,68],keyline:'26,20,8',burnish:'255,240,196',path:'164,128,64'},
    // A reckless line's ink: soot-black bistre, warm rather than the iron gall's cool near-black.
    bistre:{wet:[232,208,168],dry:[138,112,82],wash:'210,182,140',edge:'176,148,108',bleed:'218,192,150',blotWet:[230,206,166],blotDry:[140,114,84],path:'150,122,88'},
    // Orpiment: the old illuminators' bright, faintly dangerous yellow-orange mineral.
    orpiment:{wet:[255,196,96],dry:[190,124,54],wash:'224,158,72',edge:'196,128,58',bleed:'236,172,84',blotWet:[252,194,94],blotDry:[188,122,52],path:'176,116,50'},
    // The badAngles ladder: five pigments running common to precious, the way the slingshot ladder
    // runs chalk to gold leaf, but earned by a lifetime of visibly rough impressions.
    umber:{wet:[214,188,140],dry:[124,100,64],wash:'192,166,118',edge:'158,132,90',bleed:'200,174,124',blotWet:[212,186,138],blotDry:[126,102,66],path:'142,116,78'},
    woad:{wet:[176,196,224],dry:[92,112,148],wash:'140,160,196',edge:'108,128,164',bleed:'156,176,210',blotWet:[174,194,222],blotDry:[94,114,150],path:'104,124,158'},
    vermilion:{wet:[248,138,96],dry:[186,84,58],wash:'214,110,76',edge:'182,88,60',bleed:'228,124,86',blotWet:[246,136,94],blotDry:[188,86,60],path:'176,84,56'},
    malachite:{wet:[168,224,196],dry:[70,132,102],wash:'120,182,152',edge:'92,152,120',bleed:'142,202,172',blotWet:[166,222,194],blotDry:[72,134,104],path:'84,146,114'},
    ultramarine:{wet:[150,178,240],dry:[64,86,168],wash:'104,132,206',edge:'78,102,178',bleed:'126,154,224',blotWet:[148,176,238],blotDry:[66,88,170],path:'72,96,176'},
    // Never dries: wet and dry are the same colour on purpose, so the mix drawTrail runs between them
    // is a no-op and the last second of trail stays glassy-bright instead of settling like every other
    // liquid ink on the sheet.
    quicksilver:{wet:[214,220,222],dry:[214,220,222],wash:'150,158,162',edge:'170,178,182',bleed:'198,204,208',blotWet:[214,220,222],blotDry:[190,196,200],path:'168,174,178'},
    // Calcined baryte: a dull grey-violet mineral by daylight (`dry`/`path`, below), and see drawTrail
    // for the `glow` it gives back for a moment after dark — the one ink in the catalogue that holds
    // any light at all, and only for as long as it is still wet.
    phosphor:{wet:[176,168,196],dry:[132,128,150],wash:'150,144,168',edge:'120,116,136',bleed:'160,154,180',blotWet:[176,168,196],blotDry:[134,130,152],glow:'224,232,255',path:'128,124,146'}
  },
  paper:{
    sanguine:{wet:[168,74,56],dry:[184,108,84],wash:'176,92,68',edge:'150,80,60',bleed:'176,96,72',blotWet:[166,72,54],blotDry:[186,112,88],path:'168,92,70'},
    silverpoint:{wet:[96,100,108],dry:[142,144,148],wash:'126,130,136',edge:'112,116,122',bleed:'134,138,144',blotWet:[94,98,106],blotDry:[144,146,150],shimmer:'250,250,252',path:'118,122,128'},
    goldleaf:{wet:[146,104,30],dry:[184,142,64],wash:'168,124,44',edge:'132,96,32',bleed:'186,146,70',blotWet:[144,102,28],blotDry:[186,144,66],keyline:'40,28,10',burnish:'236,206,132',path:'160,120,48'},
    bistre:{wet:[58,44,30],dry:[146,112,72],wash:'96,74,50',edge:'80,60,40',bleed:'104,80,54',blotWet:[56,42,28],blotDry:[148,114,74],path:'112,86,58'},
    orpiment:{wet:[150,88,20],dry:[196,140,58],wash:'176,112,36',edge:'140,88,30',bleed:'198,142,60',blotWet:[148,86,18],blotDry:[198,142,60],path:'168,106,40'},
    umber:{wet:[68,52,30],dry:[138,108,66],wash:'92,70,42',edge:'76,58,34',bleed:'100,76,46',blotWet:[66,50,28],blotDry:[140,110,68],path:'108,82,50'},
    woad:{wet:[36,46,84],dry:[100,116,158],wash:'64,78,120',edge:'48,60,100',bleed:'76,92,134',blotWet:[34,44,82],blotDry:[102,118,160],path:'72,86,126'},
    vermilion:{wet:[142,38,20],dry:[198,96,60],wash:'168,64,36',edge:'134,42,22',bleed:'176,72,40',blotWet:[140,36,18],blotDry:[200,98,62],path:'158,58,32'},
    malachite:{wet:[16,64,44],dry:[86,142,108],wash:'40,96,68',edge:'28,78,52',bleed:'52,108,78',blotWet:[14,62,42],blotDry:[88,144,110],path:'60,116,84'},
    ultramarine:{wet:[20,30,110],dry:[76,96,180],wash:'40,56,140',edge:'28,42,120',bleed:'52,70,156',blotWet:[18,28,108],blotDry:[78,98,182],path:'48,64,150'},
    quicksilver:{wet:[150,156,160],dry:[150,156,160],wash:'120,126,130',edge:'100,106,110',bleed:'132,138,142',blotWet:[150,156,160],blotDry:[128,134,138],path:'110,116,120'},
    phosphor:{wet:[120,112,138],dry:[104,98,118],wash:'108,100,124',edge:'88,82,102',bleed:'116,108,134',blotWet:[120,112,138],blotDry:[106,100,120],glow:'214,224,255',path:'100,94,114'}
  }
});
// The ink in the pen: the plate's own by default, one of the catalogue's once it has been chosen. The
// catalogue itself asks for an ink by name rather than for the one in hand, so a card can be printed in
// the very ink it offers; every other caller wants whatever is loaded and passes nothing.
function trailInk(id=activeCosmetic('trail')){
  const chosen=ink.inks[id];
  if(chosen)return chosen;
  return {wet:ink.dark.trailWet,dry:ink.dark.trailDry,wash:ink.dark.trailWash,edge:ink.dark.trailEdge,
    bleed:ink.dark.trailBleed,blotWet:ink.dark.blotWet,blotDry:ink.dark.blotDry};
}
// ---------- What each ink is made of ----------
// Colour is registered per plate above, because a plate may grind its own; substance is not, because
// chalk is chalk on either sheet. What the catalogue actually holds is eleven different materials, and
// until this table they were eleven colours of one stroke. Each is described by how it behaves under
// the hand rather than by what it looks like, and drawTrail reads the same nine numbers off all of
// them: `nib`, how much a cut edge swells the stroke across itself and thins it to a hairline along
// itself; `swell`, how much speed alone broadens it; `body`, the weight it lays overall; `tooth`, how
// far it breaks on the grain of the sheet; `feather`, how far it wicks into the fibres; `settle`, how
// much of it is mineral grain that drops into the hollows instead of dissolving; `halo` and `bloom`,
// the strength and breadth of the damp wash — or the dust — around the line; and `wet`, whether it is
// laid liquid at all, and so whether it dries after it is laid.
const MATERIALS={
  // A cut quill charged with iron gall: the broadest range of any of them, a dye rather than a
  // pigment so it stains the sheet evenly, and notorious for feathering along the fibres.
  quill:{nib:1,swell:1,body:1,tooth:.06,feather:1,settle:0,halo:1,bloom:1,wet:1},
  // Ochre and charcoal rubbed on rock: no wet stage, no nib, and heavy break-up on a coarse wall.
  crayon:{nib:0,swell:.5,body:1.1,tooth:.85,feather:0,settle:.5,halo:1.3,bloom:1.3,wet:0},
  // Red chalk in a holder. It rides the tooth of the paper, printing on the peaks and skipping the
  // hollows, and what it leaves is dust: soft-edged, granular, already the colour it will stay, and
  // broken rather than broad — a stick that is pressed harder does not draw a wider line, it crumbles.
  sanguine:{nib:0,swell:.55,body:1,tooth:1,feather:0,settle:.5,halo:1.15,bloom:1.25,wet:0},
  // A silver stylus on prepared ground. It cannot be pressed darker and it cannot be made broader —
  // one faint, even hairline whatever the hand does, which is the whole character of the medium.
  silverpoint:{nib:0,swell:.12,body:.5,tooth:.14,feather:0,settle:0,halo:.3,bloom:.7,wet:0},
  // Leaf is not a stroke at all. It is laid in flakes onto a mordant line and burnished, so where a
  // flake failed to take the dark line beneath shows through, and a facet catches the light.
  goldleaf:{nib:.25,swell:.5,body:1.1,tooth:0,feather:0,settle:0,halo:0,bloom:1,wet:0,leaf:1},
  // The five earth and mineral pigments, ground in gum and laid with a brush: a softer edge than a
  // nib's, a damp wash around the line, and visible grain where the heavier ones settled.
  umber:{nib:.55,swell:1,body:1.05,tooth:.2,feather:.5,settle:.7,halo:1.25,bloom:1.15,wet:1},
  // Woad is a dye, not a ground mineral: nothing in it settles, and it wicks as far as iron gall.
  woad:{nib:.6,swell:1.05,body:1,tooth:.12,feather:1,settle:0,halo:1.25,bloom:1.15,wet:1},
  vermilion:{nib:.5,swell:.95,body:1.15,tooth:.22,feather:.28,settle:.85,halo:1.2,bloom:1.12,wet:1},
  // Malachite is the coarsest grind in the catalogue — ground fine it loses its green — so it is the
  // most granular thing the pen can be charged with.
  malachite:{nib:.45,swell:.95,body:1.1,tooth:.34,feather:.22,settle:1,halo:1.2,bloom:1.12,wet:1},
  ultramarine:{nib:.45,swell:.95,body:1.1,tooth:.3,feather:.26,settle:.9,halo:1.2,bloom:1.12,wet:1},
  // Soot in gum: a transparent wash rather than a body colour, so it lays light and wicks freely.
  bistre:{nib:.7,swell:1.15,body:.95,tooth:.1,feather:.9,settle:.12,halo:1.35,bloom:1.2,wet:1},
  orpiment:{nib:.5,swell:.9,body:1.1,tooth:.38,feather:.2,settle:.8,halo:1.2,bloom:1.12,wet:1},
  // Mercury: it beads rather than blends. `settle` is doing something different here than it does for
  // a ground mineral — those flecks are beads of the metal itself rather than pigment dropped out of a
  // wash — and nothing about never drying is written into these nine numbers at all: that is the plate's
  // own `wet`/`dry` tones above, deliberately the same colour.
  quicksilver:{nib:0,swell:.4,body:.85,tooth:0,feather:0,settle:.9,halo:.35,bloom:.55,wet:1},
  // Baryte holds no light of its own in these nine numbers either — see `glow` beside its colours above
  // and drawTrail below for the second or so it actually spends it.
  phosphor:{nib:.5,swell:.9,body:1,tooth:.28,feather:.15,settle:.55,halo:1.1,bloom:1.05,wet:1}
};
// A catalogue ink brings its own substance; the plate's own ink is whatever medium the plate writes
// in, which is the one thing about the trail an era gets to name for itself.
function trailMaterial(){
  const chosen=activeCosmetic('trail');
  if(ink.inks[chosen])return MATERIALS[chosen]||MATERIALS.quill;
  return MATERIALS[ink.dark.trailMedium]||MATERIALS.quill;
}
// ---------- The cross-section of a stroke ----------
// A stroke is not an outline with a fill, and it is not a pale band with a dark line dropped on top of
// it: that gives two edges and two centres, and the eye obligingly reads two marks laid over one
// another. What a real stroke has is one gradient across its width — full-strength ink where the point
// pressed, thinning through a duller shoulder to a damp margin that fades into the sheet. So the stroke
// is laid as a ramp of passes from the outside in: each entry is how far out that pass sits, as a
// fraction of the distance from the core's own width to the wash's, and how much ink it lays there.
// Being translucent they accumulate — about three quarters opaque down the middle, thinning smoothly
// all the way out — so there is no step anywhere across the section for the eye to catch a second edge
// on. The margin takes the wash's tone and the shoulder the dry-brush edge's, which makes the ramp a
// gradient of colour as well: dilute and dull at the edge, full ink at the centre, as thinned ink
// actually behaves.
const STROKE_PROFILE=[[1,.16],[.7,.12],[.45,.18],[.22,.28],[0,.4]];
// The scribe's hand: the nib is held at a constant angle to the sheet, so which way the flight happens
// to be going decides whether the stroke is the full width of the cut edge or the hairline along it.
const NIB_COS=Math.cos(-.7),NIB_SIN=Math.sin(-.7);
// The tooth of the sheet, read where the mark actually fell rather than at some point along the
// stroke, so a dry medium's grain belongs to the paper and stays on it instead of crawling under the
// line as the camera climbs.
//
// It has to be a *field* rather than a throw of dice per sample, which is the whole reason for the
// lattice and the interpolation. A stroke is laid down as seventy-odd short pieces, and giving each
// piece its own independent roughness turns the line into a string of separate beads — the eye reads
// the pieces rather than the line. Read off a smooth field a dozen units across, the same stroke
// thins and thickens along its length, and a dry medium that loses the sheet loses it for a run of
// samples, the way a stick that skips actually skips.
function sheetHash(i,j){const s=Math.sin(i*12.9898+j*78.233)*43758.5453;return s-Math.floor(s);}
function sheetNoise(x,y,span){
  const u=x/span,v=y/span,i=Math.floor(u),j=Math.floor(v);
  const fu=u-i,fv=v-j,su=fu*fu*(3-2*fu),sv=fv*fv*(3-2*fv);
  return lerp(lerp(sheetHash(i,j),sheetHash(i+1,j),su),lerp(sheetHash(i,j+1),sheetHash(i+1,j+1),su),sv);
}
// How coarse each field is, in world units: the tooth the stroke rides, the wander it takes across the
// sheet, and the far finer drift of settled mineral inside the line.
const TOOTH_SPAN=12,WANDER_SPAN=9,GRAIN_SPAN=4.5;
// ---------- The route already flown ----------
// The wet trail is a hundred-odd samples that fade in a second; the dried path is the whole route the
// run has taken, kept in world coordinates and printed under the wet ink every frame. It is bounded
// twice over: everything that has passed below the sheet is dropped as the camera climbs — it only
// ever climbs — and a hard cap holds the rest whatever happens. Reduced motion keeps it, since a line
// already on the page is not motion; a paused run adds nothing to it because nothing is sampled.
const INK_PATH_CAP=3000;
// The wet trail is sampled on the run's own clock rather than once per frame drawn. Sampled per frame,
// a 120 Hz screen laid down twice as many segments over the same second of flight as a 60 Hz one and
// then stroked every one of them four or five times over — the same line, at twice the cost, on
// exactly the phones that refresh fastest. A sixtieth of a second between samples gives both screens
// the same line, and the cap is the longest any of it stays wet, so no dead sample is walked at all.
const TRAIL_STEP=1/60,TRAIL_LIFE=1.25;
let trailSampledAt=-1;
// The dry route alone, distance-gated rather than time-gated so it reads the same whatever is
// sampling it: a live frame here and there, or, replaying a finished run, every physics tick it took.
function sampleInkPath(){
  const p=world.player,last=world.inkPath[world.inkPath.length-1];
  if(!last||Math.hypot(p.x-last.x,p.y-last.y)>.6)world.inkPath.push({x:p.x,y:p.y,speed:Math.hypot(p.vx,p.vy)});
  pruneInkPath();
}
function recordTrail(){
  if(world.state!=='playing'&&world.state!=='ready')return;
  const p=world.player;
  if(trailSampledAt<0||world.time<trailSampledAt||world.time-trailSampledAt>=TRAIL_STEP){
    trailSampledAt=world.time;
    world.trail.push({x:p.x,y:p.y,time:world.time,air:!p.node,speed:Math.hypot(p.vx,p.vy)});
    const limit=reducedMotion?32:Math.ceil(TRAIL_LIFE/TRAIL_STEP);
    if(world.trail.length>limit)world.trail.splice(0,world.trail.length-limit);
  }
  sampleInkPath();
}
// A replayed run keeps every sample rather than pruning by what has scrolled off the current
// viewport: see keepAll on OrbitWorld. The live game still bounds both by camera and by a hard cap.
function pruneInkPath(){
  if(!H||!world||world.keepAll)return;
  const below=H+220;
  let gone=0;while(gone<world.inkPath.length&&sy(world.inkPath[gone].y)>below)gone++;
  if(gone>0)world.inkPath.splice(0,gone);
  if(world.inkPath.length>INK_PATH_CAP)world.inkPath.splice(0,world.inkPath.length-INK_PATH_CAP);
  // The surveyed departures and landings are dried ink beside the route, and are pruned with it.
  let dropped=0;while(dropped<world.surveys.length&&sy(world.surveys[dropped].cy)>below)dropped++;
  if(dropped>0)world.surveys.splice(0,dropped);
  if(world.surveys.length>SURVEY_CAP)world.surveys.splice(0,world.surveys.length-SURVEY_CAP);
}
// The dried route: one wash pass and three weights of burin line, the heavier where the flight was
// faster, cut in the ink the pen is charged with. The wet trail dries into its head, so the line the
// player is drawing now and the line drawn a minute ago are the same line.
function drawInkPath(){
  const inkPath=world.inkPath;
  if(inkPath.length<2)return;
  const pen=trailInk(),m=trailMaterial(),rgb=pen.path||ink.dark.pathInk,paper=onPaper();
  // The route is the same substance the wet trail was, so it is laid at the same weight and with the
  // same wash around it: a stylus leaves a fine faint rule where chalk leaves a broad dusty one. What a
  // medium that breaks on the tooth cannot leave is a crisp line, so the burin passes give way to the
  // wash by exactly as much as the sheet's grain took out of it.
  const crisp=1-m.tooth*.5;
  const band=p=>Math.min(2,Math.floor(clamp((p.speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1)*3));
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=`rgba(${rgb},${(paper?.11:.08)*m.halo})`;ctx.lineWidth=1.9*scale*m.bloom*m.body;
  ctx.beginPath();
  ctx.moveTo(sx(inkPath[0].x),sy(inkPath[0].y));
  for(let i=1;i<inkPath.length;i++)ctx.lineTo(sx(inkPath[i].x),sy(inkPath[i].y));
  ctx.stroke();
  // A gilder cuts the line before laying the leaf into it, and the route keeps that cut as much as the
  // wet trail does, so a gilded run reads as gold on a drawn line rather than as a gold line. It is the
  // wash's own path stroked a second time rather than a second path, since three thousand points are
  // expensive to walk and free to stroke again.
  if(pen.keyline){
    ctx.strokeStyle=`rgba(${pen.keyline},${paper?.16:.12})`;ctx.lineWidth=.55*scale*m.body;ctx.stroke();
  }
  for(let weight=0;weight<3;weight++){
    ctx.strokeStyle=`rgba(${rgb},${((paper?.4:.3)+weight*.05)*crisp})`;ctx.lineWidth=(.34+weight*.26)*scale*m.body;
    ctx.beginPath();
    for(let i=1;i<inkPath.length;i++){
      if(band(inkPath[i])!==weight)continue;
      ctx.moveTo(sx(inkPath[i-1].x),sy(inkPath[i-1].y));ctx.lineTo(sx(inkPath[i].x),sy(inkPath[i].y));
    }
    ctx.stroke();
  }
  ctx.restore();
}
// ---------- The survey: every flight measured at both ends ----------
// A flight is surveyed where it leaves and where it lands, and the geometer's construction stays on the
// sheet as dried ink. At the release: the radius out to the release point, the departure line along the
// tangent with an arrowhead at its end, and the release bearing — an arc swept clockwise from the sheet's
// north to the release radius, its numeral set outside it, over a dotted north reference. At the landing:
// the radius to the contact, the incoming line carried a little past it, the arrival angle between them
// with its numeral — or, for a square, the geometer's right angle in gold — and a short note of the
// arrival speed, the reward, and the orbits skipped.
// Both are kept in world coordinates, pruned with the permanent ink path, cleared when a new run is dealt,
// and drawn in one style and the pen's own dried ink. The pen reads `world.time`, so a paused run freezes
// a construction mid-stroke and reduced motion prints it whole.
const SURVEY_CAP=48,SURVEY_LANDING=.6,SURVEY_DEPARTURE=.4;
function surveyProgress(s){
  if(reducedMotion)return 1;
  return clamp((world.time-s.birth)/Math.max(.001,s.span),0,1);
}
// One continuing alphabet for the whole run rather than a fresh a/b/c for every construction: the index
// is kept on the world itself, not read off world.surveys.length, since that array is pruned from the
// front as old constructions dry off the sheet and would otherwise make the count run backward. Past z
// the letters double — aa, bb, cc — the way a surveyor reaches for a second mark rather than a new one.
function surveyLetterName(n){const letter=String.fromCharCode(97+n%26);return letter.repeat(Math.floor(n/26)+1);}
function nextSurveyLetters(){
  const base=(world.surveyLetterSeq=(world.surveyLetterSeq||0)+3)-3;
  return [surveyLetterName(base),surveyLetterName(base+1),surveyLetterName(base+2)];
}
// The moment of release: the orbit just left is the node the flight is ignoring, and the release velocity
// is the tangent it left along. The bearing is read clockwise from the sheet's north, 0 to 359.
function recordDeparture(e){
  if(!world)return null;
  const n=world.nodes.find(q=>q.id===world.player.ignore);if(!n)return null;
  const rx=e.x-n.x,ry=e.y-n.y,r=Math.hypot(rx,ry);if(!(r>1))return null;
  const speed=Math.hypot(e.vx,e.vy)||1;
  const record={kind:'departure',cx:n.x,cy:n.y,nr:n.r,x:e.x,y:e.y,r,ux:rx/r,uy:ry/r,dx:e.vx/speed,dy:e.vy/speed,
    bearing:Math.round(((Math.atan2(rx,-ry)*180/Math.PI)%360+360)%360)%360,birth:world.time,span:SURVEY_DEPARTURE,
    letters:nextSurveyLetters()};
  world.surveys.push(record);pruneInkPath();return record;
}
// The landing: only a flight that was launched is surveyed, so the orbit the run opens on is not.
function recordLanding(e){
  if(!world||!e.launch)return null;
  const n=e.n,rx=e.x-n.x,ry=e.y-n.y,r=Math.hypot(rx,ry)||n.r||1;
  const speed=Math.hypot(e.vx,e.vy)||1;
  const record={kind:'landing',cx:n.x,cy:n.y,nr:n.r,x:e.x,y:e.y,r,ux:rx/r,uy:ry/r,dx:e.vx/speed,dy:e.vy/speed,
    angle:e.angle,square:!!e.square,squareBonus:e.squareBonus||0,gain:e.gain,
    mult:e.scoreMultiplier||1,skipped:e.skipped||0,birth:world.time,span:SURVEY_LANDING,
    // A rough impression cannot be joined, only arrested; the skid it leaves needs its own seed, kept
    // deterministic off the node's own so a replayed run scuffs the sheet exactly where the live one did.
    rough:!!e.steep,seed:(n.seed^0x5c1d9b)>>>0||1,letters:nextSurveyLetters()};
  world.surveys.push(record);pruneInkPath();return record;
}
// A hairline drawn on from one end to the other, with the wet bead and the nib riding the moving end.
function surveyLine(x0,y0,x1,y1,t,rgb,alpha,weight,head){
  if(t<=0)return;
  const x=lerp(x0,x1,t),y=lerp(y0,y1,t);
  ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=Math.max(.35,weight);
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x,y);ctx.stroke();
  if(t<1&&head!==false){const a=Math.atan2(y1-y0,x1-x0);penBead(x,y,a,1.1*scale,.75);penNib(x,y,a,.8);}
}
// The same stroke swept round an arc, from one angle to another.
function surveyArc(cx,cy,r,from,to,t,rgb,alpha,weight){
  if(t<=0||!(r>.2))return;
  const end=from+(to-from)*t;
  ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=Math.max(.35,weight);
  ctx.beginPath();ctx.arc(cx,cy,r,Math.min(from,end),Math.max(from,end));ctx.stroke();
  if(t<1){
    const x=cx+Math.cos(end)*r,y=cy+Math.sin(end)*r,a=end+(to>=from?Math.PI/2:-Math.PI/2);
    penBead(x,y,a,1.1*scale,.75);penNib(x,y,a,.8);
  }
}
// A short tick across the arc at one of its ends, the way a geometer closes an angle.
function surveyTick(cx,cy,r,angle,rgb,alpha,weight){
  const c=Math.cos(angle),s=Math.sin(angle),reach=Math.max(2,2.6*scale);
  line(cx+c*(r-reach),cy+s*(r-reach),cx+c*(r+reach),cy+s*(r+reach),`rgba(${rgb},${alpha})`,Math.max(.35,weight));
}
// The engraved figures a construction is numbered with, and the italic note beside it.
function surveyNumeral(text,x,y,size,rgb,alpha,t){
  if(t<=0)return;
  ctx.save();ctx.textAlign='center';ctx.fillStyle=`rgba(${rgb},${alpha})`;
  ctx.font=plateFace(size);
  writeText(ctx,text,x,y+size*.35,t,{size});
  ctx.restore();
}
// The points of a construction are lettered as a geometer letters a figure — a at the centre, b at the point
// on the ring, c at the far end of the line — in the same italic hand the note beside it is written in.
function surveyLetter(text,x,y,size,rgb,alpha,t){
  if(t<=0)return;
  ctx.save();ctx.textAlign='center';ctx.font=plateFace(size,'text','italic');
  // A small leaf of the sheet's own ground behind the letter — the same clearing the construction
  // labels cut for themselves — since on a crater's own hatching a bare letter simply vanishes into it.
  const half=ctx.measureText(text).width*.5+2;
  ctx.fillStyle=`rgba(${ink.base.paperRgb},${alpha*t*.7})`;ctx.fillRect(x-half,y-size*.65,half*2,size*1.2);
  ctx.fillStyle=`rgba(${rgb},${alpha})`;
  writeText(ctx,text,x,y+size*.35,t,{size,nib:false});
  ctx.restore();
}
// A unit vector across a construction's line, turned to the side away from a given direction.
function surveyAside(ux,uy,dx,dy){let px=-uy,py=ux;if(px*dx+py*dy>0){px=-px;py=-py;}return [px,py];}
function drawSurveys(){
  // A plate that draws this in its own hand names the painter; an age with no geometry and no script to
  // letter one in names a painter that draws nothing at all.
  const own=handFor('surveys');if(own)return own();
  if(!world||!world.surveys.length)return;
  const rgb=(trailInk().path||ink.dark.pathInk),gold=ink.base.gold,base=onPaper()?.6:.46;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.textBaseline='alphabetic';
  for(const s of world.surveys){
    const y=sy(s.cy);if(y<-320||y>H+320)continue;
    const t=surveyProgress(s);if(t<=0)continue;
    if(s.kind==='departure')drawDepartureSurvey(s,t,rgb,base);
    else drawLandingSurvey(s,t,rgb,gold,base);
  }
  ctx.restore();
}
function drawDepartureSurvey(s,t,rgb,base){
  const cx=sx(s.cx),cy=sy(s.cy),px=sx(s.x),py=sy(s.y),r=s.r*scale;
  // (a) The radius, from the planet's centre out to the point the pen left the ring.
  surveyLine(cx,cy,px,py,revealSpan(t,0,.3),rgb,base*.7,.45*scale);
  // (b) The departure line along the tangent, closed with a small arrowhead.
  const reach=30*scale,ex=px+s.dx*reach,ey=py+s.dy*reach,run=revealSpan(t,.25,.6);
  surveyLine(px,py,ex,ey,run,rgb,base,.55*scale);
  if(run>=1){
    const a=Math.atan2(s.dy,s.dx),wing=Math.max(3,4.2*scale);
    ctx.strokeStyle=`rgba(${rgb},${base})`;ctx.lineWidth=Math.max(.35,.55*scale);
    ctx.beginPath();
    ctx.moveTo(ex-Math.cos(a-.42)*wing,ey-Math.sin(a-.42)*wing);ctx.lineTo(ex,ey);
    ctx.lineTo(ex-Math.cos(a+.42)*wing,ey-Math.sin(a+.42)*wing);ctx.stroke();
  }
  // (c) The bearing: the dotted north reference from the centre up to the ring, the arc swept clockwise
  // from it to the release radius with a tick at each end, and the reading set outside the arc. The whole
  // figure is kept well inside the ring, so it can never cross the release marks printed on the rim.
  const bear=revealSpan(t,.55,1);if(bear<=0)return;
  ctx.save();ctx.setLineDash([Math.max(1,1.6*scale),Math.max(2,3*scale)]);
  surveyLine(cx,cy,cx,cy-r,Math.min(1,bear*2.6),rgb,base*.45,.4*scale,false);
  ctx.restore();
  const arcR=Math.max(5,r*.52),from=-Math.PI/2,to=from+s.bearing*Math.PI/180;
  surveyArc(cx,cy,arcR,from,to,bear,rgb,base*.8,.45*scale);
  if(bear>=1){
    surveyTick(cx,cy,arcR,from,rgb,base*.75,.4*scale);
    surveyTick(cx,cy,arcR,to,rgb,base*.75,.4*scale);
  }
  const mid=(from+to)/2,size=Math.max(8,9*scale),labelR=arcR+Math.max(8,9*scale);
  surveyNumeral(s.bearing+'°',cx+Math.cos(mid)*labelR,cy+Math.sin(mid)*labelR,size,rgb,base*.95,revealSpan(t,.72,1));
  // (d) The letters: the centre, then the release point, set across the radius on the side away from
  // the departure line, and the third beyond the arrowhead — each written as the pen reaches its point.
  // They continue the run's own single alphabet (s.letters, assigned once at recordDeparture) rather
  // than restarting at a/b/c for every flight.
  // The first letter sits outside the specimen rather than on it: its offset from centre is derived from
  // the node's own drawn radius, not the flat clearance the other two (already set off the ring, clear
  // of the disc) still use.
  const [ax,ay]=surveyAside(s.ux,s.uy,s.dx,s.dy),off=8*scale,centerOff=Math.max(off,(s.nr||0)*scale+6*scale),ls=Math.max(7.5,8.5*scale);
  surveyLetter(s.letters[0],cx+ax*centerOff,cy+ay*centerOff,ls,rgb,base*.9,revealSpan(t,.25,.38));
  surveyLetter(s.letters[1],px+ax*off-s.ux*2*scale,py+ay*off-s.uy*2*scale,ls,rgb,base*.9,revealSpan(t,.3,.43));
  surveyLetter(s.letters[2],ex+s.dx*9*scale,ey+s.dy*9*scale,ls,rgb,base*.9,revealSpan(t,.6,.74));
}
// A rough impression cannot glide onto the ring the way a tangent does: the incoming line is arrested
// rather than joined, so the nib scuffs sideways at the contact instead of lifting clean, and pools
// where it caught. Cut in the trail's own ink — the same ink the landing earned no dividend back from —
// and never redrawn once it is dry, exactly as the rest of the construction is not. The scuff is set to
// the side of the contact letter (b) below does not use, so a bad landing never blots out its own label.
function drawSkidMark(s,t,rgb,base){
  const drag=revealSpan(t,.4,.72);if(drag<=0)return;
  const px=sx(s.x),py=sy(s.y),pen=trailInk(),hard=1-clamp(s.angle/GRAZE_MINIMUM,0,1);
  const rng=seeded(s.seed),[tx,ty]=surveyAside(s.dx,s.dy,s.ux,s.uy),tang=Math.atan2(ty,tx);
  const bx=px-s.dx*6*scale,by=py-s.dy*6*scale;
  ctx.save();ctx.lineCap='round';
  for(let i=0;i<3;i++){
    const a=tang+(rng()-.5)*1.1,len=(5+rng()*7+hard*5)*scale,off=(i-1)*2*scale;
    const x0=bx+tx*off,y0=by+ty*off;
    burinSegment(ctx,x0,y0,x0+Math.cos(a)*len,y0+Math.sin(a)*len,rgb,base*(.6-i*.1)*drag,(.4+rng()*.35)*scale,s.seed+i*23+1,{segments:4,wobble:1.6,hair:false});
  }
  const stain=Math.max(1.4,2.2*scale)*(.65+hard*.6)*drag;
  landContour(ctx,px,py,stain,stain*.82,seeded(s.seed+11));
  ctx.fillStyle=`rgba(${mixRgb(pen.blotWet,pen.blotDry,.7)},${base*.62*drag})`;ctx.fill();
  ctx.restore();
}
function drawLandingSurvey(s,t,rgb,gold,base){
  const cx=sx(s.cx),cy=sy(s.cy),px=sx(s.x),py=sy(s.y);
  // (a) The radius from the planet's centre out to the contact.
  surveyLine(cx,cy,px,py,revealSpan(t,0,.28),rgb,base*.7,.45*scale);
  // (b) The incoming line, carried a little past the contact so the angle has two full arms.
  const back=34*scale,past=11*scale;
  surveyLine(px-s.dx*back,py-s.dy*back,px+s.dx*past,py+s.dy*past,revealSpan(t,.22,.55),rgb,base,.55*scale);
  if(s.rough)drawSkidMark(s,t,rgb,base);
  // (c) Between them the arrival angle: an arc with two tick ends and its numeral outside, or — where the
  // line met the ring square — the geometer's right angle, a small square with a dot inside it, in gold.
  const mark=revealSpan(t,.5,.82),reach=Math.max(9,11*scale);
  const inward=Math.atan2(-s.uy,-s.ux),along=Math.atan2(s.dy,s.dx);
  let delta=along-inward;while(delta>Math.PI)delta-=TAU;while(delta<-Math.PI)delta+=TAU;
  const bis=inward+delta/2;
  if(s.square){
    const ex=Math.cos(inward),ey=Math.sin(inward),fx=Math.cos(along),fy=Math.sin(along),q=reach*.72;
    surveyLine(px+ex*q,py+ey*q,px+ex*q+fx*q,py+ey*q+fy*q,revealSpan(mark,0,.52),gold,base+.14,.7*scale);
    surveyLine(px+fx*q,py+fy*q,px+fx*q+ex*q,py+fy*q+ey*q,revealSpan(mark,.44,.94),gold,base+.14,.7*scale);
    if(mark>.9){
      ctx.fillStyle=`rgba(${gold},${base+.2})`;
      ctx.beginPath();ctx.arc(px+(ex+fx)*q*.44,py+(ey+fy)*q*.44,Math.max(.9,1.15*scale),0,TAU);ctx.fill();
    }
  }else{
    surveyArc(px,py,reach,inward,inward+delta,mark,rgb,base*.9,.45*scale);
    if(mark>=1){
      surveyTick(px,py,reach,inward,rgb,base*.8,.4*scale);
      surveyTick(px,py,reach,inward+delta,rgb,base*.8,.4*scale);
    }
    const size=Math.max(8,9.5*scale),labelR=reach+Math.max(9,10*scale);
    surveyNumeral(Math.round(s.angle)+'°',px+Math.cos(bis)*labelR,py+Math.sin(bis)*labelR,size,rgb,base*.95,revealSpan(t,.62,.88));
  }
  // (d) The letters: continued from the run's own single alphabet (s.letters) rather than restarting at
  // a/b/c for every construction, since a node landed on can be the same one a later flight departs
  // from, and every construction on the sheet is one long piece of surveying work. The first letter at
  // the centre, across the radius on the side away from the incoming line; the second at the contact,
  // across the incoming line on the outward side; the third at the far end of the incoming line.
  {
    // The first letter sits outside the specimen rather than on it: its offset from centre is derived
    // from the node's own drawn radius, not the flat clearance the other two (already clear of the disc)
    // still use.
    const [ax,ay]=surveyAside(s.ux,s.uy,s.dx,s.dy),[bx,by]=surveyAside(s.dx,s.dy,-s.ux,-s.uy),off=8*scale,centerOff=Math.max(off,(s.nr||0)*scale+6*scale),ls=Math.max(7.5,8.5*scale);
    surveyLetter(s.letters[0],cx+ax*centerOff,cy+ay*centerOff,ls,rgb,base*.9,revealSpan(t,.26,.4));
    surveyLetter(s.letters[1],px+bx*off,py+by*off,ls,rgb,base*.9,revealSpan(t,.3,.44));
    surveyLetter(s.letters[2],px-s.dx*(back+7*scale),py-s.dy*(back+7*scale),ls,rgb,base*.9,revealSpan(t,.5,.62));
  }
  // (e) The note, set in Fell italic beside the construction on the far side of the ring from the planet.
  const note=revealSpan(t,.78,1);if(note<=0||plainPlate())return;
  const lines=[];
  // This note is set in the sheet's own italic text face, not the small-caps one, so the name is raised
  // to caps here rather than restated — OBSERVATIONS stays the one place the name itself is spelled.
  if(s.square)lines.push([OBSERVATIONS.rightAngle.latin.toUpperCase()+' · +'+s.squareBonus,gold]);
  lines.push(['×'+s.mult.toFixed(1)+'  ·  +'+s.gain,rgb]);
  if(s.skipped>0)lines.push(['SKIP '+s.skipped,rgb]);
  // The node prints its own row numeral a little east of the ring, so a contact that landed due east
  // pushes the note further out rather than setting it on top of the number.
  const size=Math.max(9,10*scale),step=size*1.28,right=s.ux>=0;
  const out=(s.ux>.9&&Math.abs(s.uy)<.36?38:22)*scale;
  const nx=px+s.ux*out+(right?4:-4),ny=py+s.uy*out;
  ctx.save();ctx.font=plateFace(size,'text','italic');
  // The note is kept inside the frame's inner rule: its left edge is clamped to the sheet, whichever
  // side of the ring it was set on, so a landing near the margin never prints into the border.
  let widest=0;for(const l of lines)widest=Math.max(widest,ctx.measureText(l[0]).width||l[0].length*size*.5);
  const inset=frameBand()+5*scale,left=clamp(right?nx:nx-widest,inset,Math.max(inset,W-inset-widest));
  ctx.textAlign='left';
  for(let i=0;i<lines.length;i++){
    const from=i/lines.length,step2=1/lines.length;
    ctx.fillStyle=`rgba(${lines[i][1]},${base*.95})`;
    writeText(ctx,lines[i][0],left,ny+i*step,revealSpan(note,from,from+step2),{size,nib:false});
  }
  ctx.restore();
}
function drawTrail(){
  const trail=world.trail;
  if(trail.length<2)return;
  const pen=trailInk(),m=trailMaterial();
  // Past the gauge's own copper mark (see updateUI) the nib is starved: the stroke skips beats and
  // loses its weight the nearer the reservoir runs to dry, as a real pen scratches out its last ink.
  const starved=clamp(1-world.inkLevel()/.34,0,1),thin=1-starved*.55;
  // Only a liquid medium dries, so only a liquid medium is mixed from its wet tone to its dry one as
  // the segment ages. Chalk, silverpoint and leaf are already the colour they will stay the instant
  // they touch the sheet, so the settled tone is written out once here rather than mixed seventy-five
  // times — and it is the tone a granulating pigment's settled grain is drawn in as well, since grain
  // is exactly what is left of the ink once the water has gone.
  const settled=pen.dry.join(',');
  // Butt caps, not round ones. A round cap reaches half the stroke's width past each end, so every
  // joint between two of the seventy-odd pieces is painted twice and comes out at nearly double the
  // alpha — a bead at every sample, all the way along a line that is meant to be continuous. Butt caps
  // abut instead of overlapping; the wedge they leave on the outside of a turn is a few hundredths of a
  // pixel at these widths and angles, and never as visible as the beading was.
  ctx.save();ctx.lineCap='butt';ctx.lineJoin='round';
  for(let i=1;i<trail.length;i++){
    const a=trail[i-1],b=trail[i],age=world.time-b.time;
    const life=reducedMotion?.48:b.air?1.18:.78,t=clamp(1-age/life,0,1);if(t===0)continue;
    if(starved>0){
      const skip=(Math.sin(b.time*5.3)+Math.sin(b.time*11.7+2.1)*.6+1.6)/3.2;
      if(skip<starved*.6)continue;
    }
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<.01)continue;
    // A dry stick prints on the peaks of the sheet and skips the hollows. What breaks is the core of
    // the stroke, not the dust shed around it — a chalk line is continuous and granular at once, where
    // dropping the whole segment would only make a dashed line. A liquid ink floods the tooth and
    // barely notices it. Both ends of the segment are read, so the stroke's roughness and its wander
    // pass unbroken from one piece to the next instead of jumping at every joint.
    let grain=1,bare=false;
    if(m.tooth>0){
      const bite=(sheetNoise(a.x,a.y,TOOTH_SPAN)+sheetNoise(b.x,b.y,TOOTH_SPAN))*.5;
      bare=bite<m.tooth*.2;
      grain=1-m.tooth*.55*(1-bite);
    }
    const nx=-dy/d,ny=dx/d,boost=clamp((b.speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1);
    const weight=t*(1+boost*.7*m.swell);
    // The cut of the nib: full width across its edge, a hairline along it, so the line swells and thins
    // as the flight turns and an orbit is written the way a letter is. A stick or a stylus has no edge
    // to turn and holds one width whichever way the flight goes.
    const cut=m.nib>0?Math.abs((dx*NIB_SIN-dy*NIB_COS)/d):1;
    const spread=m.body*scale*thin,gauge=(1+m.nib*(cut-.62))*spread;
    // Whatever feels the grain of the sheet also wanders on it: a chalk line is never straight, where a
    // stylus on prepared ground is. A second field, read across the sheet rather than along it so the
    // line does not veer in step with its own fading, and taken at both ends, so consecutive pieces
    // share the point between them and the wander is a drift rather than a stagger.
    const drift=m.tooth*.9;
    const ax=drift?(sheetNoise(a.y,a.x,WANDER_SPAN)-.5)*drift:0,bx=drift?(sheetNoise(b.y,b.x,WANDER_SPAN)-.5)*drift:0;
    const x1=sx(a.x+nx*ax),y1=sy(a.y+ny*ax),x2=sx(b.x+nx*bx),y2=sy(b.y+ny*bx);
    // A wet stroke is laid glossy and dries as the segment ages, from blue-black to matte sepia on
    // paper, bright to dim ink at night; a dry one arrives already settled.
    const dried=m.wet?mixRgb(pen.wet,pen.dry,1-t*t):settled;
    // Gold leaf is laid over a dark keyline, the way a gilder cuts the line first and lays the leaf into it.
    if(pen.keyline)line(x1,y1,x2,y2,`rgba(${pen.keyline},${t*t*.5})`,(.5+1.7*weight)*gauge);
    // Leaf takes or it does not. Where a flake failed, the mordant line stands bare and the run of gold
    // breaks in patches the way beaten leaf actually breaks; where it took, the burnisher left a facet
    // that comes up and falls away again along the run rather than switching on at one sample.
    // Interpolating the field gathers it about its middle rather than spreading it evenly over nought
    // to one, so both of these thresholds sit near a half to bite at all.
    const flake=m.leaf?sheetNoise(b.x,b.y,7):1;
    // The section, laid from the margin inward. The margin takes `spread` and the core `gauge`, so the
    // damp edge stays an even band while the middle keeps the nib's thick and thin: what soaks into the
    // sheet spreads by the paper's own capillary action and knows nothing about the angle the nib is
    // held at. As a stroke runs dry the ink holds to one side of the point, so the outer passes lean
    // across while the core stays on the line the point took — a dry-brush margin as an asymmetry of
    // the section, rather than as a second stroke ruled alongside the first.
    const margin=(1+3.5*weight)*spread*m.bloom,core=(.18+1.2*weight)*gauge,reach=margin-core;
    const lean=reducedMotion?0:(.55+Math.sin(b.time*19)*.3)*(1-t)*.55;
    if(flake>.36){
      for(let j=0;j<STROKE_PROFILE.length;j++){
        const out=STROKE_PROFILE[j][0];
        // The wash is the only pass a material may be without — gold leaf has no damp margin at all —
        // and the two densest passes are the ones the sheet's tooth takes out, leaving the dust.
        if(j===0?m.halo<=0:bare&&j>2)continue;
        const off=lean*out,tone=j===0?pen.wash:j===1?pen.edge:dried;
        line(x1+nx*off,y1+ny*off,x2+nx*off,y2+ny*off,
          `rgba(${tone},${t*t*STROKE_PROFILE[j][1]*grain*(j===0?m.halo:1)})`,core+reach*out);
      }
    }
    if(pen.burnish&&flake>.6&&!reducedMotion)line(x1,y1,x2,y2,`rgba(${pen.burnish},${t*t*(flake-.6)*2.4})`,(.15+.5*weight)*gauge);
    if(!reducedMotion){
      // Silverpoint catches the light along the stroke: a faint shimmer that travels segment by segment.
      if(pen.shimmer){
        const glint=Math.max(0,Math.sin(world.time*3.1-i*.35));
        if(glint>.55)line(x1,y1,x2,y2,`rgba(${pen.shimmer},${t*t*(glint-.55)*.9})`,(.15+.5*weight)*scale);
      }
      // Calcined baryte drinks whatever light the flight crosses and gives a little back after dark: a
      // burst of afterglow at the instant it is laid, brighter the faster the pen was moving, burned off
      // within a second — well before this same stretch has dried into the record the sheet keeps, which
      // never carries the glow at all. A plate still has no lamp in it; only the wet ink, briefly,
      // remembers holding one.
      if(pen.glow){
        const afterglow=Math.exp(-age*2.1)*(.5+boost*.6);
        if(afterglow>.02){
          ctx.save();ctx.globalCompositeOperation='lighter';
          line(x1,y1,x2,y2,`rgba(${pen.glow},${afterglow*.4})`,(1.6+2.4*weight)*gauge*m.bloom);
          ctx.restore();
        }
      }
      // Ground mineral does not dissolve: it drops into the hollows of the sheet and stays there as
      // visible grain. Malachite, ground coarse to keep its green, is the worst of them; a dye like
      // woad or iron gall stains evenly and drops nothing at all. Drawn not as specks but as a fine
      // thread of the same ink laid again where the grain collected: at a line a pixel and a half wide
      // a speck is not a grain of pigment but a bead on a string, and the eye reads the beads instead
      // of the line. Density is what granulation looks like at this size, and laying the ink twice is
      // what density is. It wanders, but only within the core it belongs to — a thread that strays past
      // the stroke's own margin stops being grain in the ink and becomes a second line beside it.
      if(m.settle>0&&!bare){
        const fleck=sheetNoise(b.x,b.y,GRAIN_SPAN);
        if(fleck>.4){
          const across=(fleck-.66)*.9*core;
          line(x1+nx*across,y1+ny*across,x2+nx*across,y2+ny*across,
            `rgba(${dried},${t*t*(fleck-.4)*1.7*m.settle})`,core*.55);
        }
      }
      if(m.feather>0&&b.air&&i%6===0&&t<.88){
        const reach=(1-t)*(1.5+boost*2.5)*m.feather,sign=i%12===0?1:-1;
        line(sx(b.x+nx*sign),sy(b.y+ny*sign),sx(b.x-dx/d*reach+nx*reach*sign),sy(b.y-dy/d*reach+ny*reach*sign),`rgba(${pen.bleed},${t*.24*m.feather})`,.4*scale);
      }
    }
  }
  ctx.restore();
}
// ---------- Observer marks: the glyph the traveller is engraved as ----------
// Every mark is cut in the same local space — the heading along +x, the moving point at the origin —
// and every one either ends with the shared head or, as the quill and the graver do, cuts its own
// keylined point, so the actual position stays legible over a pale planet whatever is chosen. The
// quill is the plate's own mark and the default; the other seven are earned.
// The head all marks share: a reserved highlight on paper, a dark keyline, and the nib ticks that
// brighten with the charge held.
function markHead(boost,charge,inkHeld=1){
  if(onPaper()){ctx.fillStyle=ink.dark.playerHalo;ctx.beginPath();ctx.ellipse(0,0,6,5,0,0,TAU);ctx.fill();}
  ctx.fillStyle=ink.dark.playerKeyline;ctx.beginPath();ctx.ellipse(0,0,5.3,4.4,0,0,TAU);ctx.fill();
  ctx.fillStyle=ink.dark.playerMid;ctx.beginPath();ctx.ellipse(-.25,.2,4.1,3.3,0,0,TAU);ctx.fill();
  ctx.fillStyle=ink.dark.playerHighlight;ctx.beginPath();ctx.ellipse(.7,-.45,2.7,2.3,0,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgba(${ink.dark.playerNib},${(.48+charge*.25)*(.35+inkHeld*.65)})`;ctx.lineWidth=.55;
  ctx.beginPath();ctx.moveTo(5.1,0);ctx.lineTo(7.8+boost*1.5,0);ctx.moveTo(0,-4.7);ctx.lineTo(0,-6.4);ctx.moveTo(0,4.7);ctx.lineTo(0,6.1);ctx.stroke();
}
const markStroke=(alpha,width)=>{ctx.strokeStyle=`rgba(${ink.dark.playerFilamentB},${alpha})`;ctx.lineWidth=width;};
// A point on a quadratic at t. A mark laid in pieces — a comet's rays fading along their own length,
// a feather's barbs standing off a curved rachis — is walked with this rather than built as a path
// object per piece, since the pen redraws every one of them on every frame.
const qAt=(t,a,c,b)=>{const u=1-t;return u*u*a+2*u*t*c+t*t*b;};
// The half-width of a feather's vane along its rachis: nothing at the quill, widest two fifths of the
// way out, nothing again at the tip. Barbs and the wash they enclose are both cut to this, so the two
// agree and the vane closes rather than bristling past its own edge.
const vaneProfile=u=>Math.sin(Math.PI*Math.pow(u,.78));
const OBSERVER_MARKS={
  // The pen itself: the nib leads, cut to a point at the traveller's exact position and turned along
  // the flight, with the stripped barrel and then the feather trailing behind it. The vane flexes
  // back as the flight quickens and breathes a little; under reduced motion it is held still.
  quill(length,boost,breath,charge,inkHeld=1){
    const flex=reducedMotion?0:boost*3.6+breath*1.6;
    // A feather does not grow when the hand moves faster. The plume keeps very nearly its own length
    // whatever the flight is doing and answers to speed in the flex of the vane instead.
    const plume=-(24+length*.3),tipY=-5.2-flex*.9,cx=plume*.5,cy=-1.1-flex*.26,BARBS=30;
    // On paper a ring of reserved, unprinted sheet keeps the ink of the vane clear of the nib.
    if(onPaper()){ctx.fillStyle=ink.dark.playerHalo;ctx.beginPath();ctx.ellipse(-4.4,0,8,4.6,0,0,TAU);ctx.fill();}
    // The vane is laid twice from one formula: once as the wash the barb tips enclose, once as the
    // barbs themselves, thirty a side. One side is cut broad and the other narrow, which is what makes
    // this a flight feather rather than a leaf.
    for(const side of [-1,1]){
      const reach=(side>0?4.7:3.1)*(1+boost*.07);
      for(let pass=0;pass<2;pass++){
        if(pass){ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},${side>0?.56:.46})`;ctx.lineWidth=.34;}
        else ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},${side>0?.28:.22})`;
        ctx.beginPath();if(!pass)ctx.moveTo(-10.6,-.5);
        for(let i=0;i<BARBS;i++){
          const u=(i+.7)/(BARBS+.7),x=qAt(u,-10.6,cx,plume),y=qAt(u,-.5,cy,tipY);
          const tx=2*((1-u)*(cx+10.6)+u*(plume-cx)),ty=2*((1-u)*(cy+.5)+u*(tipY-cy)),tl=Math.hypot(tx,ty)||1;
          const ux=tx/tl,uy=ty/tl,w=vaneProfile(u)*reach,nx=-uy*side,ny=ux*side;
          // Every barb leaves the rachis across it and is swept back along it, so the vane closes to
          // the tip instead of standing off the shaft like the teeth of a comb.
          const ex=x+nx*w+ux*w*.95,ey=y+ny*w+uy*w*.95;
          if(pass){ctx.moveTo(x,y);ctx.quadraticCurveTo(x+nx*w*.78+ux*w*.2,y+ny*w*.78+uy*w*.2,ex,ey);}
          else ctx.lineTo(ex,ey);
        }
        if(pass)ctx.stroke();else{ctx.lineTo(plume,tipY);ctx.fill();}
      }
    }
    // The rachis, laid over the barbs it carries.
    markStroke(.8,.95);
    ctx.beginPath();ctx.moveTo(-10.6,-.5);ctx.quadraticCurveTo(cx,cy,plume,tipY);ctx.stroke();
    // The stripped barrel between the cut and the feather: a quill is bared where the hand holds it,
    // so the shaft is two outlines with nothing printed between them and the sheet showing through,
    // which is the only way an engraver had of saying that a thing was translucent.
    markStroke(.66,.7);
    ctx.beginPath();ctx.moveTo(-7,-2.2);ctx.quadraticCurveTo(-9,-2.2,-11.2,-1.4);
    ctx.moveTo(-7,2.2);ctx.quadraticCurveTo(-9,2.1,-10.9,1);ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.42)`;ctx.lineWidth=.38;
    ctx.beginPath();
    for(let i=0;i<3;i++){const x=-8-i*1.4;ctx.moveTo(x,-2.1+i*.14);ctx.quadraticCurveTo(x-.55,0,x+.2,2.1-i*.18);}
    ctx.stroke();
    // The nib: one taper from the barrel to a cut point at the traveller's own position, keylined so
    // that point stays legible over a pale planet exactly as the shared head is.
    ctx.fillStyle=ink.dark.playerKeyline;
    ctx.beginPath();ctx.moveTo(1.5,0);ctx.quadraticCurveTo(-3.2,-.85,-7.3,-2.2);
    ctx.lineTo(-7.3,2.2);ctx.quadraticCurveTo(-3.2,.85,1.5,0);ctx.fill();
    ctx.fillStyle=ink.dark.playerMid;
    ctx.beginPath();ctx.moveTo(.4,0);ctx.quadraticCurveTo(-3.4,-.55,-6.9,-1.65);
    ctx.lineTo(-6.9,1.65);ctx.quadraticCurveTo(-3.4,.55,.4,0);ctx.fill();
    ctx.fillStyle=ink.dark.playerHighlight;ctx.beginPath();ctx.ellipse(-4.6,-.7,1.9,.62,-.1,0,TAU);ctx.fill();
    // The slit runs from the point back to the vent that stops it splitting further, which is the one
    // detail that says a nib has been cut rather than merely sharpened.
    ctx.strokeStyle=`rgba(${ink.dark.playerNib},.5)`;ctx.lineWidth=.45;
    ctx.beginPath();ctx.moveTo(1.1,0);ctx.lineTo(-4.7,0);ctx.moveTo(-5.2,-1.2);ctx.lineTo(-5.2,1.2);ctx.stroke();
    // The bead of wet ink held at the point. It brightens with the slingshot charge in hand and
    // dries away as the nib empties, so a starved point is visible before the line ever stops.
    ctx.fillStyle=`rgba(${ink.dark.playerNib},${(.4+charge*.45)*(.24+inkHeld*.76)})`;
    ctx.beginPath();ctx.arc(-1.4,0,(1+charge*.5)*(.4+inkHeld*.6),0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(${ink.dark.playerNib},${.42+charge*.3})`;ctx.lineWidth=.55;
    ctx.beginPath();ctx.moveTo(-5.6,-2.8);ctx.lineTo(-5.6,-4.8);ctx.moveTo(-5.6,2.8);ctx.lineTo(-5.6,4.5);ctx.stroke();
    return true;
  },
  // A comet as the plates of the century actually cut one — Hevelius's Cometographia, Lubieniecki's
  // Theatrum — where the tail is not a shape with an outline but a bundle of divergent rays. They
  // widen away from the head, lean off the axis as the dust of a real tail lags behind the motion,
  // and run out of ink at different lengths rather than closing to a point, which is what stops the
  // whole mark reading as a leaf. Only the near half is washed, in stacked wedges, so the wash has
  // somewhere to end that the hatching over it can hide.
  comet(length,boost,breath,charge=0){
    const spread=4+boost*4.8+breath*1.2,curl=1.9+boost*1.7,RAYS=9,STEPS=4;
    for(let i=0;i<3;i++){
      const far=length*(.3+i*.17),u=far/length;
      ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.11)`;
      ctx.beginPath();ctx.moveTo(2.6,-1.7);
      ctx.quadraticCurveTo(-far*.5,-spread*u*.44+curl*.2,-far,-spread*u*.78+curl*u);
      ctx.lineTo(-far,spread*u+curl*u);
      ctx.quadraticCurveTo(-far*.5,spread*u*.5+curl*.2,2.6,1.7);ctx.fill();
    }
    for(let k=0;k<STEPS;k++){
      const t0=k/STEPS,t1=(k+1)/STEPS;
      ctx.strokeStyle=`rgba(${k<2?ink.dark.playerFilamentB:ink.dark.playerFilamentA},${.52-k*.1})`;
      ctx.lineWidth=.76-k*.13;
      ctx.beginPath();
      for(let i=0;i<RAYS;i++){
        // Rays crowd the axis and thin toward the edges of the fan, and each runs its own length, so
        // the tail ends ragged. Every one is walked in four pieces that fade as they go.
        const v=i/(RAYS-1)*2-1,s=v*(.42+.58*Math.abs(v)),run=.62+(i%3)*.14+(i&1)*.08;
        // Each ray leaves the coma's own limb rather than the nucleus, so the tail opens out of a
        // head that has width instead of being whisked out of a single point.
        const sx0=-2.6-Math.abs(s)*2.2,sy0=s*5.2;
        const ex=-length*run,ey=s*spread+curl*run,ccx=-length*.36,ccy=s*spread*.3+curl*.3;
        ctx.moveTo(qAt(t0,sx0,ccx,ex),qAt(t0,sy0,ccy,ey));
        ctx.lineTo(qAt(t1,sx0,ccx,ex),qAt(t1,sy0,ccy,ey));
      }
      ctx.stroke();
    }
    // The coma: the head's own hood of light, and the beard of short rays standing off its sunward
    // limb that every engraver of a comet drew. Both gather with the charge in hand.
    ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},${.19+charge*.11})`;
    ctx.beginPath();ctx.ellipse(-.8,0,7.2,6.1,0,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentB},${.34+charge*.2})`;ctx.lineWidth=.4;
    ctx.beginPath();
    for(let i=0;i<9;i++){
      const a=(i/8-.5)*2.1,r=6.3,out=1.4+((i*5)%4)*.75+charge*1.2;
      ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a)*(r+out),Math.sin(a)*(r+out));
    }
    ctx.stroke();
  },
  telescope(length,boost,breath){
    const back=-length*.86,joint=back*.45;
    ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.16)`;
    ctx.beginPath();ctx.moveTo(8,-3.1);ctx.lineTo(joint,-2.5);ctx.lineTo(back,-1.7);ctx.lineTo(back,1.7);ctx.lineTo(joint,2.5);ctx.lineTo(8,3.1);ctx.closePath();ctx.fill();
    markStroke(.62,.7);
    ctx.beginPath();ctx.moveTo(8,-3.1);ctx.lineTo(joint,-2.5);ctx.lineTo(back,-1.7);ctx.moveTo(8,3.1);ctx.lineTo(joint,2.5);ctx.lineTo(back,1.7);ctx.stroke();
    for(const [x,r] of [[8,3.4],[joint,2.7],[back,1.9]]){
      markStroke(.6,.6);ctx.beginPath();ctx.ellipse(x,0,.9,r,0,0,TAU);ctx.stroke();
    }
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.4)`;ctx.lineWidth=.4;
    ctx.beginPath();
    for(let i=0;i<7;i++){const x=lerp(joint,8,i/6);ctx.moveTo(x,1.1);ctx.lineTo(x-1.3,2.9);}
    ctx.stroke();
    // The line of sight, breathing a little as the observer holds the tube steady.
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentB},${.26+boost*.16})`;ctx.lineWidth=.4;
    ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(15+boost*5,breath*2);ctx.stroke();
  },
  moth(length,boost,breath){
    const beat=1+breath*.5,span=Math.max(13,length*.62);
    for(const side of [-1,1]){
      ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.22)`;
      ctx.beginPath();ctx.moveTo(1,side*1.2);
      ctx.bezierCurveTo(-2,side*(9*beat),-span*.9,side*(10.5*beat),-span,side*(2.2*beat));
      ctx.bezierCurveTo(-span*.6,side*.8,-3,side*.9,1,side*1.2);ctx.fill();
      markStroke(.72,.7);
      ctx.beginPath();ctx.moveTo(1,side*1.2);
      ctx.bezierCurveTo(-2,side*(9*beat),-span*.9,side*(10.5*beat),-span,side*(2.2*beat));ctx.stroke();
      ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.5)`;ctx.lineWidth=.4;
      ctx.beginPath();
      for(let i=1;i<4;i++){const u=i/4;ctx.moveTo(-1,side*1.4);ctx.lineTo(lerp(-2,-span*.95,u),side*(2.6+6.4*beat*(1-u*.4)));}
      ctx.stroke();
      // The feathered antennae.
      markStroke(.5,.4);
      ctx.beginPath();ctx.moveTo(3.4,side*1.2);ctx.quadraticCurveTo(8,side*2.4,10.5,side*(5+breath));ctx.stroke();
    }
    markStroke(.6,.9);ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(-span*.72,0);ctx.stroke();
  },
  // Saturn as Galileo actually reported it in 1610 and drew it in 1616: not one body but three, the
  // handles standing clear of the globe on either side, since the glass he had could not resolve
  // that they were one ring. The mark is therefore the only one in the catalogue with no heading of
  // its own, and the shared head at the middle of it is the whole of what points.
  saturn(length,boost,breath){
    const reach=8.6+breath;
    for(const side of [-1,1]){
      ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.24)`;
      ctx.beginPath();ctx.ellipse(side*reach,0,3.2,4.2,side*.12,0,TAU);ctx.fill();
      markStroke(.8,.85);ctx.beginPath();ctx.ellipse(side*reach,0,3.2,4.2,side*.12,0,TAU);ctx.stroke();
      // Hatched as the rest of the plate is hatched — down and to the right, one slant for the whole
      // sheet — rather than with the flat chords this handle used to carry. The slant is a property of
      // the hand holding the burin, so it does not turn with the body it is laid on, and the two handles
      // therefore take the same stroke rather than mirroring into each other.
      ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.5)`;ctx.lineWidth=.4;
      ctx.save();ctx.translate(side*reach,0);ctx.rotate(.55);
      ctx.beginPath();
      for(let i=0;i<4;i++){const y=-2.4+i*1.6,w=2.4*Math.sqrt(Math.max(0,1-(y/3.9)*(y/3.9)));ctx.moveTo(-w,y);ctx.lineTo(w,y);}
      ctx.stroke();ctx.restore();
    }
    // The observation's own wake: two hatched strokes rather than one ruled line, since a ruled line
    // through three separate bodies reads as a skewer holding them together.
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},${.26+boost*.2})`;ctx.lineWidth=.4;
    ctx.beginPath();
    for(const side of [-1,1]){ctx.moveTo(-13,side*1.4);ctx.lineTo(-length*.52,side*(2.6+breath*1.5));}
    ctx.stroke();
  },
  // The cross-staff the sky was actually shot with, sighted along its length: the graduated staff
  // runs back from the body being observed to the eye, and the transversary slides down it toward
  // the eye as the flight quickens — which is the way the instrument opens to a wider angle, and so
  // exactly the motion of taking a reading. Its arm opens a little further with the charge in hand.
  crossstaff(length,boost,breath,charge=0){
    const back=-length*.92,slide=lerp(.42,.72,clamp(boost+breath*.4,0,1)),cross=back*slide,arm=6.4+charge*1.5;
    markStroke(.74,1);
    ctx.beginPath();ctx.moveTo(2.6,0);ctx.lineTo(back,0);ctx.stroke();
    // The divisions cut into the staff, every third one struck longer as the scales of the period are.
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.5)`;ctx.lineWidth=.4;
    ctx.beginPath();
    for(let i=1;i<12;i++){const x=lerp(2.6,back,i/12),t=i%3?1:1.9;ctx.moveTo(x,-1.1*t);ctx.lineTo(x,1.1*t);}
    ctx.stroke();
    ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.2)`;
    ctx.beginPath();ctx.moveTo(cross-1.1,-arm);ctx.lineTo(cross+1.1,-arm);ctx.lineTo(cross+1.1,arm);ctx.lineTo(cross-1.1,arm);ctx.closePath();ctx.fill();
    markStroke(.82,1);
    ctx.beginPath();ctx.moveTo(cross,-arm);ctx.lineTo(cross,arm);
    // A sighting vane stands at each end of the transversary, turned to face the observation.
    ctx.moveTo(cross-.6,-arm);ctx.lineTo(cross+3.4,-arm);ctx.moveTo(cross-.6,arm);ctx.lineTo(cross+3.4,arm);ctx.stroke();
    // The eye end: the little pierced plate the staff is held against the cheek by.
    markStroke(.7,.8);
    ctx.beginPath();ctx.moveTo(back,-2.6);ctx.lineTo(back,2.6);ctx.moveTo(back-1.4,-1.7);ctx.lineTo(back-1.4,1.7);ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentB},${.3+boost*.18})`;ctx.lineWidth=.4;
    ctx.beginPath();ctx.moveTo(cross,-arm);ctx.lineTo(back-1.4,0);ctx.moveTo(cross,arm);ctx.lineTo(back-1.4,0);ctx.stroke();
  },
  // The graver that cut this plate, laid as an engraver lays one: the blade almost flat on the
  // copper with its point at the traveller, the short mushroom handle — flat underneath, so it
  // clears the plate — seated in the heel of the hand behind it, and the shaving the point is
  // lifting out of the line, which runs longer and stands further off the faster the line is being
  // cut. The shaving is the one part of the mark that is not the tool but the work.
  burin(length,boost,breath,charge=0){
    const coil=reducedMotion?.9:.9+boost*.45+breath*.2;
    // The blade: a long slim wedge to the point, with the top facet of its lozenge section laid in
    // as a narrow band, which is the whole of how a square section was ever drawn in line.
    ctx.fillStyle=ink.dark.playerKeyline;
    ctx.beginPath();ctx.moveTo(2.4,0);ctx.lineTo(-17,-3.4);ctx.lineTo(-17,2.7);ctx.closePath();ctx.fill();
    ctx.fillStyle=ink.dark.playerMid;
    ctx.beginPath();ctx.moveTo(1.2,-.15);ctx.lineTo(-16.2,-2.7);ctx.lineTo(-16.2,-.9);ctx.closePath();ctx.fill();
    ctx.fillStyle=ink.dark.playerHighlight;
    ctx.beginPath();ctx.moveTo(.4,-.1);ctx.lineTo(-8,-1.3);ctx.lineTo(-8,-.7);ctx.closePath();ctx.fill();
    // The face the point is actually cut on, struck across the very end of the blade.
    ctx.strokeStyle=`rgba(${ink.dark.playerNib},${.5+charge*.3})`;ctx.lineWidth=.5;
    ctx.beginPath();ctx.moveTo(2.4,0);ctx.lineTo(-.8,-1.9);ctx.stroke();
    // The handle: half a mushroom, hatched round its turning.
    ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.26)`;
    ctx.beginPath();ctx.moveTo(-17,-3.4);ctx.bezierCurveTo(-18.6,-6.3,-23,-6,-23.6,-1.4);
    ctx.quadraticCurveTo(-23.8,1.7,-22,2.7);ctx.closePath();ctx.fill();
    markStroke(.8,.85);
    ctx.beginPath();ctx.moveTo(-17,-3.4);ctx.bezierCurveTo(-18.6,-6.3,-23,-6,-23.6,-1.4);
    ctx.quadraticCurveTo(-23.8,1.7,-22,2.7);ctx.lineTo(-17,2.7);ctx.closePath();ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.45)`;ctx.lineWidth=.36;
    ctx.beginPath();
    for(let i=0;i<3;i++){const x=-18.6-i*1.7;ctx.moveTo(x,-5.4+i*.8);ctx.quadraticCurveTo(x-.8,-.6,x+.3,2.7);}
    ctx.stroke();
    // The shaving: it springs off the point and rolls up on itself, tightening as it goes, the way
    // copper leaves a graver — never a closed loop, which the eye reads as a bubble rather than a
    // curl, and never longer than the blade it is being lifted off.
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentB},${.46+charge*.16})`;ctx.lineWidth=.42;
    ctx.beginPath();ctx.moveTo(2.2,-.5);
    ctx.quadraticCurveTo(.6,-4.6*coil,-2.6*coil-1.2,-4.4*coil);
    ctx.quadraticCurveTo(-4.8*coil-2.4,-4.1*coil,-4.2*coil-2,-2.1*coil);ctx.stroke();
    return true;
  },
  // The moon as Galileo washed it in 1610, carried at the traveller's shoulder: the crescent laid in
  // wash rather than drawn in outline, its terminator broken by the mountains he was the first to
  // say were there, the dark limb kept only as a broken contour, and three of his own spots laid
  // along the light and drawn far larger than they are, exactly as he drew them. The disc is set
  // wholly behind the head, since a ring closed around the head reads as an eye. The phase opens
  // with the slingshot charge in hand, so the mark waxes as the flight is loaded.
  moon(length,boost,breath,charge=0){
    const R=8.4,CX=-12.6,k=Math.cos(Math.PI*(.34+charge*.26));
    // The terminator is walked rather than swept, in fourteen pieces off one fixed jag: a ragged
    // edge is the whole of what the wash was arguing, and a clean arc here would be the smooth moon
    // it was arguing against.
    ctx.fillStyle=`rgba(${ink.dark.playerHeadWash},.32)`;
    ctx.beginPath();ctx.arc(CX,0,R,-Math.PI/2,Math.PI/2);
    for(let i=1;i<=14;i++){
      const th=Math.PI/2-i/14*Math.PI,jag=((i*7)%5-2)*.4+((i&1)?.3:-.25);
      ctx.lineTo(CX+Math.cos(th)*(k*R+jag),Math.sin(th)*R);
    }
    ctx.closePath();ctx.fill();
    markStroke(.76,.95);
    ctx.beginPath();ctx.arc(CX,0,R,-Math.PI/2,Math.PI/2);ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentB},.52)`;ctx.lineWidth=.45;
    ctx.beginPath();ctx.moveTo(CX,R);
    for(let i=1;i<=14;i++){
      const th=Math.PI/2-i/14*Math.PI,jag=((i*7)%5-2)*.4+((i&1)?.3:-.25);
      ctx.lineTo(CX+Math.cos(th)*(k*R+jag),Math.sin(th)*R);
    }
    ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.3)`;ctx.lineWidth=.4;
    ctx.beginPath();
    for(let i=0;i<4;i++){
      const a0=Math.PI/2+i*Math.PI/4+.16;
      ctx.moveTo(CX+Math.cos(a0)*R,Math.sin(a0)*R);ctx.arc(CX,0,R,a0,a0+Math.PI/4-.32);
    }
    ctx.stroke();
    for(const [along,y,r] of [[.34,-3.7,1.5],[.5,3.1,2.1],[.72,.4,1.1]]){
      const edge=Math.sqrt(Math.max(.04,1-(y/R)*(y/R))),x=CX+lerp(k*R,R,along)*edge;
      ctx.fillStyle=`rgba(${ink.dark.playerFilamentA},.32)`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
      ctx.strokeStyle=`rgba(${ink.dark.playerFilamentA},.5)`;ctx.lineWidth=.35;
      ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
    }
  }

};function drawPlayer(){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('player');if(own)return own();
  if(world.state==='dead')return;const p=world.player,flight=!p.node;
  const speed=Math.hypot(p.vx,p.vy),boost=clamp((speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1),charge=world.charge(),inkHeld=world.inkLevel();
  const length=flight?23+boost*20:16,breath=reducedMotion?0:Math.sin(world.time*5.5)*.22;
  ctx.save();ctx.translate(sx(p.x),sy(p.y));ctx.rotate(Math.atan2(p.vy,p.vx));ctx.scale(scale,scale);
  ctx.lineCap='round';ctx.lineJoin='round';
  // A mark that cuts its own point — the quill's nib is the moving point — says so and keeps it;
  // every other mark ends with the shared head. The dark keyline keeps the actual moving point legible
  // over pale planets; on paper a thin ring of exposed, unprinted paper sits between the ink and it.
  const mark=OBSERVER_MARKS[activeCosmetic('mark')]||OBSERVER_MARKS.quill;
  if(!mark(length,boost,breath,charge,inkHeld))markHead(boost,charge,inkHeld);
  if(p.shielded){
    const pulse=reducedMotion?1:.85+.15*Math.sin(world.time*4);
    ctx.strokeStyle=`rgba(${ink.dark.playerShield},${.55*pulse})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,9,0,TAU);ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.playerShield},${.22*pulse})`;ctx.lineWidth=.5;ctx.beginPath();ctx.arc(0,0,11.5,0,TAU);ctx.stroke();
  }
  // The reflector's charge rides a wider, broken ring, so the two carried charges read apart at a
  // glance and neither is lost when both are held at once.
  if(p.reflectorArmed){
    const pulse=reducedMotion?1:.85+.15*Math.sin(world.time*4+1.7);
    ctx.strokeStyle=`rgba(${ink.dark.playerReflector},${.55*pulse})`;ctx.lineWidth=1;ctx.setLineDash([2.4,2.4]);
    ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.stroke();ctx.setLineDash([]);
  }
  // The dawn's charge is not a ring at all but the light thrown off one, so the third charge is told from
  // the other two by what kind of mark it is and not only by how wide it stands: twelve short spokes struck
  // outward, the same light the body it was taken from has rising off it.
  if(p.dawnArmed){
    const pulse=reducedMotion?1:.85+.15*Math.sin(world.time*4+3.1);
    ctx.strokeStyle=`rgba(${ink.dark.playerDawn},${.6*pulse})`;ctx.lineWidth=.9;ctx.beginPath();
    for(let i=0;i<12;i++){
      const a=i*TAU/12,long=i%2===0;
      ctx.moveTo(Math.cos(a)*16.5,Math.sin(a)*16.5);ctx.lineTo(Math.cos(a)*(long?20.5:18.6),Math.sin(a)*(long?20.5:18.6));
    }
    ctx.stroke();
  }
  ctx.restore();
}
function darknessPlate(relief){
  // The plate goes into the key beside relief, built once here, so two plates on screen at once (a
  // cross-dissolve) never share a slot — and the lookup below can't drift from the store at the end.
  // DPR is in the key too: this is the one major art layer that used to be baked at 1x and stretched
  // to fill the tile drawImage() blits it into, the only mark in the atlas soft enough at the device
  // pixel ratios a phone actually runs at to look stretched rather than engraved.
  const key=plateName+':'+(relief?'r':'n')+':'+DPR.toFixed(2);
  if(darknessPlates.has(key))return darknessPlates.get(key);
  const w=640,h=180,c=makeCanvas(Math.round(w*DPR),Math.round(h*DPR)),g=c.getContext('2d'),rng=seeded(620173);
  g.scale(DPR,DPR);
  const pigment=relief?ink.dark.pigmentRelief:ink.dark.pigment;
  // Seamless pools of dilute ink, growing opaque below the leading edge — clipped to the same wavy
  // front the void layers below draw, not a flat rect: a dead-straight gradient under a wavy coastline
  // read as a ruled horizon peeking out from under it, which is the one thing an engraved sheet with no
  // flat fill anywhere on it cannot afford at the edge that matters most.
  g.save();g.beginPath();g.moveTo(0,h);
  for(let x=0;x<=w;x+=4){const a=x/w*TAU;g.lineTo(x,28+Math.sin(a*3)*6+Math.sin(a*11)*2.5);}
  g.lineTo(w,h);g.closePath();g.clip();
  const wash=g.createLinearGradient(0,24,0,140);
  wash.addColorStop(0,`rgba(${ink.dark.washTop},0)`);wash.addColorStop(.22,`rgba(${ink.dark.washMid},${onPaper()?.94:.78})`);wash.addColorStop(1,ink.dark.washSolid);
  g.fillStyle=wash;g.fillRect(0,0,w,h);
  g.restore();
  if(onPaper()){
    // Spilled ink on paper: the flood bleeds upward along the fibres in short, blunt feathered threads
    // — a spreading stain's own failure, not a shoreline's — with the odd near-opaque pool pushing
    // ahead of the front where the pigment has already settled, breaking the line rather than fringing it.
    const bleed=seeded(311977);
    for(let i=0;i<110;i++){
      const x=bleed()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5,reach=1+bleed()*bleed()*7,bend=(bleed()-.5)*10,start=edge+3+bleed()*5;
      for(const wrap of [-w,0,w]){
        g.strokeStyle=`rgba(${ink.dark.fleckDark},${.1+bleed()*.24})`;g.lineWidth=.65+bleed()*.65;
        g.beginPath();g.moveTo(x+wrap,start);g.bezierCurveTo(x+wrap+bend*.6,start-4,x+wrap-bend,edge-reach*.5,x+wrap+bend*.5,edge-reach);g.stroke();
      }
    }
    // The pools a spreading stain actually leaves: irregular blots breaking ahead of the front, not the
    // even comb a shoreline's tree line would be. Enough of them, and large enough, to read as the front
    // itself rather than as flecks caught in it.
    for(let i=0;i<16;i++){
      const x=bleed()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5;
      const y=edge-1-bleed()*bleed()*13,rx=3+bleed()*bleed()*11,ry=2+bleed()*5,seed=Math.floor(bleed()*1e7);
      for(const wrap of [-w,0,w]){landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=`rgba(${ink.dark.fleckDark},${.38+bleed()*.32})`;g.fill();}
    }
    for(let i=0;i<14;i++){
      const x=bleed()*w,y=44+bleed()*90,rx=10+bleed()*34,ry=4+bleed()*11,seed=Math.floor(bleed()*1e7);
      for(const wrap of [-w,0,w]){landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=`rgba(${ink.dark.fleckDark},.55)`;g.fill();}
    }
  }
  for(let layer=0;layer<5;layer++){
    g.beginPath();g.moveTo(0,h);
    for(let x=0;x<=w;x+=4){
      const a=x/w*TAU,y=28+layer*13+Math.sin(a*3+layer*.6)*6+Math.sin(a*11-layer*.4)*2.5;
      g.lineTo(x,y);
    }
    g.lineTo(w,h);g.closePath();g.fillStyle=ink.dark.voidLayers[layer];g.fill();
  }
  g.save();g.beginPath();g.rect(0,27,w,h-27);g.clip();
  for(let i=0;i<24;i++){
    const x=rng()*w,y=36+rng()*100,rx=14+rng()*52,ry=6+rng()*18,seed=Math.floor(rng()*1e7);
    for(const wrap of [-w,0,w]){
      landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=i%3?ink.dark.landFillWash:ink.dark.landFillPool;g.fill();
      g.strokeStyle=`rgba(${pigment},.055)`;g.lineWidth=.6;g.stroke();
    }
  }
  // The pigment settles along paper fibres, leaving a ragged, pale tide mark.
  for(let i=0;i<220;i++){
    const x=rng()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5;
    const length=2+rng()*15,bend=(rng()-.5)*5;
    for(const wrap of [-w,0,w]){
      g.strokeStyle=`rgba(${pigment},${.045+rng()*.07})`;g.lineWidth=.3+rng()*.45;
      g.beginPath();g.moveTo(x+wrap,edge+length);
      g.bezierCurveTo(x+wrap+bend,edge+length*.6,x+wrap-bend,edge+2,x+wrap,edge);g.stroke();
    }
  }
  for(let i=0;i<2400;i++){
    const x=rng()*w,y=28+rng()*(h-28),fade=Math.pow(1-(y-28)/(h-28),1.5);
    g.fillStyle=i%3?`rgba(${pigment},${fade*(.02+rng()*.09)})`:`rgba(${ink.dark.fleckDark},${fade*.18})`;
    g.fillRect(x,y,.3+rng()*.65,.35+rng()*.6);
  }
  g.restore();
  // The shallow fringe is translucent; the calibrated danger line stays clear.
  for(let i=0;i<75;i++){
    const x=rng()*w,top=7+rng()*15,length=1+rng()*4;
    g.strokeStyle=`rgba(${pigment},${.035+rng()*.055})`;g.lineWidth=.45;
    g.beginPath();g.moveTo(x,25);g.bezierCurveTo(x+length,21,x-length,top+4,x+.7,top);g.stroke();
  }
  darknessPlates.set(key,c);return c;
}
// ---------- Marginalia carried on the rising ink ----------
// A sea-monster and a gloss ride the shoreline, as they do in the empty quarters of an old chart.
// Both are cut once into sprites: the Leviathan only bobs and fades, it is never re-engraved, and
// the waterline crops whatever of him is still under the ink.
const darkMarginalia=new Map();
function leviathanSprite(relief){
  const s=Math.max(.55,Math.min(1.6,scale)),key='leviathan:'+plateName+':'+(relief?'r':'n')+':'+s.toFixed(2)+':'+DPR.toFixed(2);
  const cached=darkMarginalia.get(key);if(cached)return cached;
  const w=Math.ceil(180*s),h=Math.ceil(80*s);
  const c=makeCanvas(Math.max(1,Math.round(w*DPR)),Math.max(1,Math.round(h*DPR))),g=c.getContext('2d');
  g.scale(DPR*s,DPR*s);g.lineCap='round';g.lineJoin='round';
  const rgb=relief?ink.dark.shorelineRelief:ink.dark.pigment,base=80,rng=seeded(880517);
  // Three coils breaking the surface, each with its own scaled back.
  const coils=[[34,17],[66,21],[95,15]];
  for(const [cx,cr] of coils){
    burinArc(g,cx,base,cr,Math.PI,TAU,rgb,.85,1.15,Math.floor(rng()*1e6)||3,{segments:16,skips:2});
    burinArc(g,cx,base+2,cr-5,Math.PI*1.08,Math.PI*1.92,rgb,.4,.6,Math.floor(rng()*1e6)||5,{segments:10,skips:2});
    for(let i=0;i<7;i++){
      const a=Math.PI*(1.1+i*.12),x=cx+Math.cos(a)*(cr-2),y=base+Math.sin(a)*(cr-2);
      burinSegment(g,x,y,x+Math.cos(a)*4,y+Math.sin(a)*4,rgb,.4,.5,Math.floor(rng()*1e6)||7,{segments:2,hair:false});
    }
  }
  // The tail thrown up at the far end, with its fluke.
  burinSegment(g,14,base,7,base-24,rgb,.8,1.3,4113,{segments:5,hair:false,wobble:.7});
  burinSegment(g,7,base-24,-3,base-33,rgb,.75,1,4127,{segments:3,hair:false,wobble:.4});
  burinSegment(g,7,base-24,15,base-34,rgb,.75,1,4133,{segments:3,hair:false,wobble:.4});
  burinSegment(g,-3,base-33,15,base-34,rgb,.35,.6,4137,{segments:4,hair:false,wobble:.8});
  // The neck, rising from the third coil.
  burinSegment(g,112,base,127,base-34,rgb,.85,1.5,4139,{segments:6,hair:false,wobble:.8});
  burinSegment(g,121,base,134,base-30,rgb,.6,1,4157,{segments:6,hair:false,wobble:.8});
  // The head: a long wedge with open jaws, an eye, teeth, and two swept horns.
  burinArc(g,130,base-38,8.5,Math.PI*.36,Math.PI*1.42,rgb,.85,1.2,4159,{segments:11,skips:1});
  burinSegment(g,129,base-45,160,base-50,rgb,.9,1.3,4177,{segments:6,hair:false,wobble:.5});
  burinSegment(g,131,base-32,153,base-40,rgb,.85,1.1,4201,{segments:6,hair:false,wobble:.5});
  burinSegment(g,153,base-40,160,base-50,rgb,.8,1,4211,{segments:3,hair:false,wobble:.3});
  for(let i=0;i<5;i++){
    const u=i/5,x0=lerp(134,152,u),y0=lerp(base-45.6,base-49,u),y1=lerp(base-41,base-44.5,u);
    burinSegment(g,x0,y0,x0+1.4,y1,rgb,.5,.5,4217+i,{segments:2,hair:false});
  }
  g.fillStyle=`rgba(${rgb},.9)`;g.beginPath();g.arc(136,base-42.5,1.6,0,TAU);g.fill();
  burinArc(g,136,base-42.5,4,0,TAU,rgb,.45,.5,4229,{segments:8,skips:1});
  for(const [dx,dy] of [[-9,-9],[-13,-4]])burinSegment(g,128,base-44,128+dx,base-44+dy,rgb,.6,.8,4233+dx,{segments:3,hair:false,wobble:.5});
  // The spout, blown clear of the head.
  for(let i=0;i<7;i++){
    const spread=(i-3)/3*.55,len=16+rng()*14;
    burinSegment(g,133,base-50,133+Math.sin(spread)*len*.85,base-50-Math.cos(spread)*len,rgb,.34,.6,4241+i*3,{segments:4,skips:1,hair:false,wobble:1.2});
  }
  const sprite={canvas:c,w,h};
  darkMarginalia.set(key,sprite);return sprite;
}
function glossSprite(relief){
  const size=Math.max(9,11*scale),key='gloss:'+plateName+':'+(relief?'r':'n')+':'+size.toFixed(1)+':'+DPR.toFixed(2);
  const cached=darkMarginalia.get(key);if(cached)return cached;
  const rgb=relief?ink.dark.shorelineRelief:ink.dark.pigment;
  const text='HIC SUNT DRACONES',font=plateFace(size,'sc');
  // Measured, not guessed: the canvas used to be sized from an estimate of the text's width, and
  // whenever the real, rendered string ran wider than that guess the last letters were clipped clean
  // off by the canvas's own edge rather than by anything to do with where the sprite is drawn.
  const measure=makeCanvas(1,1).getContext('2d');measure.font=font;
  const w=Math.ceil(measure.measureText(text).width)+8,h=Math.ceil(size*1.9);
  const c=makeCanvas(Math.max(1,Math.round(w*DPR)),Math.max(1,Math.round(h*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.font=font;g.textAlign='left';g.textBaseline='alphabetic';
  g.fillStyle=`rgba(${rgb},.9)`;
  g.fillText(text,4,size*1.15);
  g.fillStyle=`rgba(${rgb},.45)`;
  g.fillRect(4,size*1.45,Math.max(1,w-14),.6);
  const sprite={canvas:c,w,h};
  darkMarginalia.set(key,sprite);return sprite;
}
// The lowest line the shoreline's marginalia may reach: the footer band across the bottom of the plate,
// where the chapter name and the utility buttons are set, plus the frame's own inner rule; or the top
// of the impressum's cartouche, at the start of a run when that furniture still sits in this same
// lower margin — whichever comes first. The waterline itself goes on rising past it — only the
// monster and the gloss are held above.
// The chapter title is world-anchored ink, not a screen overlay (see revealPoint()): once the camera
// has scrolled well past where it was written, it settles at the same clamp this floor is built from
// and stays there, in the same lower reach the gloss is drifting into. Left alone, the gloss would
// slowly climb up through that fixed band as the flood rose past it, fading in and out of
// glossClearance's own test the whole time it took to cross — a systematic collision, not an
// occasional one. Lowering the floor by the band's own height while it is on the sheet keeps the
// gloss's own pinned rest position clear of it, so it sinks under the lettering and stays there.
function marginaliaFloor(){
  const floor=Math.min(H-footerBand()-frameBand()*.92,impressumTop()-8);
  const band=typeof revealBand==='function'?revealBand():null;
  return band?floor-(band.bottom-band.top):floor;
}
// Where the gloss is printed for a given waterline: it rides just under the ink until the flood would
// carry it into the footer band, and from there it stays where it is while the ink goes on past it.
function marginaliaGloss(fy,gloss){
  const floor=marginaliaFloor();
  return {y:Math.min(fy+9*scale,floor-gloss.h),h:gloss.h};
}
// The Leviathan surfaces slowly and periodically at his own place along the edge, and the gloss
// drifts with the flood. Both stand still when the run is paused or reduced motion is requested, and
// both stay above the footer band however high the ink has risen.
// The gloss keeps off the chart: where it would drift across an orbit ring or a hazard it fades to nothing
// over a short reach and comes back once it is clear, so it never prints through a ring in the play channel.
function glossClearance(x,y,w,h){
  let clear=1;
  const near=(px,py,r)=>{const dx=Math.max(0,Math.abs(px-(x+w*.5))-w*.5),dy=Math.max(0,Math.abs(py-(y+h*.5))-h*.5);return Math.hypot(dx,dy)-r;};
  for(const n of world.nodes){const ny=sy(n.y);if(ny<y-220||ny>y+h+220)continue;clear=Math.min(clear,near(sx(n.x),ny,(n.cap||n.r)*scale+6*scale)/(16*scale));}
  for(const hz of world.hazards){const hy=sy(hz.y);if(hy<y-320||hy>y+h+320)continue;clear=Math.min(clear,near(sx(hz.x),hy,hz.r*scale+14*scale)/(16*scale));}
  // The gloss keeps off lettering as carefully as it keeps off the chart. The chapter plate is set in the
  // same lower half of the sheet the flood is climbing into, and the whole point of the drifting gloss is
  // that it eventually reaches wherever the title has come to rest; left uncounted it parked across it.
  // Notes set beside the chart are counted the same way, since the solver that places them cannot see a
  // sprite drifting in from the margin.
  const box=(t,b,l,r)=>{
    const dx=Math.max(0,Math.max(l-(x+w),x-r)),dy=Math.max(0,Math.max(t-(y+h),y-b));
    clear=Math.min(clear,Math.hypot(dx,dy)/(14*scale));
  };
  const band=typeof revealBand==='function'?revealBand():null;
  if(band)box(band.top,band.bottom,0,W);
  if(typeof inscriptions!=='undefined')for(const g of inscriptions){const q=inscriptionBox(g);box(q.top,q.bottom,q.left,q.right);}
  return clamp(clear,0,1);
}
// The line a marginal note is set on: its subject's own, slid up or down its margin until the note
// stands clear of everything already lettered there. Only lettering that actually reaches into this
// gutter is counted, so a note on the left margin is never pushed about by one on the right.
function floaterLine(f,left,h){
  const top=hudBand()+16,bottom=H-frameBand()*.92-21,boxes=[];
  const band=typeof revealBand==='function'?revealBand():null;
  if(band)boxes.push([band.top,band.bottom]);
  if(typeof inscriptions!=='undefined')for(const g of inscriptions){
    const b=inscriptionBox(g);
    if(left?b.left>W*.5:b.right<W*.5)continue;
    boxes.push([b.top,b.bottom]);
  }
  for(const q of floaters)if(q!==f&&q.lift!==undefined&&q.left===left){
    const qy=sy(q.y)+q.lift;boxes.push([qy-h*.55,qy+h*.55]);
  }
  const clash=y=>{let worst=0;for(const [t,b] of boxes){const o=Math.min(y+h*.55,b)-Math.max(y-h*.55,t);if(o>worst)worst=o;}return worst;};
  const home=clamp(sy(f.y),top,bottom);
  let best=home,cost=clash(home);
  for(let step=1;step<=12&&cost>0;step++)for(const dir of [1,-1]){
    const y=clamp(home+dir*step*h*.85,top,bottom),c=clash(y);
    if(c<cost){best=y;cost=c;}
  }
  return best;
}
function drawDarkMarginalia(fy,time,alpha){
  const s=scale,drift=time*2.3*s,cycle=27,window=9.5;
  const floor=marginaliaFloor(),line=Math.min(fy,floor);
  // Both marks below are held to the same copper as every other one on the sheet: rather than be
  // guillotined at the plate mark, each is inked in and out over the last reach of the margin — which
  // is what a mark carried by the flood would do anyway. The vertical clip on the Leviathan (the rect
  // below) only ever kept it inside the canvas, not inside the frame's own inner rule, so on its own it
  // let the monster surface clean through the tick ladder and the corner ornaments; this edge fade is
  // what actually holds it to the plate, the same fade the gloss earned first.
  const rule=frameBand()*.92+6,fade=Math.max(18,26*scale);
  const monster=leviathanSprite(false),phase=((time+7)%cycle)/cycle;
  if(phase<window/cycle&&line>monster.h*.25){
    const u=phase*cycle/window,rise=Math.sin(Math.PI*u);
    const span=W+monster.w*2,x=((.34*span-drift*.62)%span+span)%span-monster.w;
    const y=line-monster.h+(1-rise)*monster.h*1.05;
    const edge=clamp(Math.min(x-rule,W-rule-(x+monster.w))/fade+1,0,1);
    if(edge>0){
      ctx.save();ctx.beginPath();ctx.rect(0,0,W,Math.max(0,line+1));ctx.clip();
      ctx.globalAlpha=alpha*rise*.9*edge;
      ctx.drawImage(monster.canvas,x,y,monster.w,monster.h);
      if(darknessRelief>.001){const r=leviathanSprite(true);ctx.globalAlpha=alpha*rise*.9*darknessRelief*edge;ctx.drawImage(r.canvas,x,y,r.w,r.h);}
      ctx.restore();
    }
  }
  if(plainPlate())return;
  const gloss=glossSprite(false),span=W+gloss.w*2;
  const gx=((.62*span-drift*.62)%span+span)%span-gloss.w;
  const gy=marginaliaGloss(fy,gloss).y;
  if(gy+gloss.h<=0)return;
  const edge=clamp(Math.min(gx-rule,W-rule-(gx+gloss.w))/fade+1,0,1);
  const clear=glossClearance(gx,gy,gloss.w,gloss.h)*edge;if(clear<=0)return;
  ctx.save();ctx.globalAlpha=alpha*.5*clear;
  ctx.drawImage(gloss.canvas,gx,gy,gloss.w,gloss.h);
  if(darknessRelief>.001){const r=glossSprite(true);ctx.globalAlpha=alpha*.5*darknessRelief*clear;ctx.drawImage(r.canvas,gx,gy,r.w,r.h);}
  ctx.restore();
}
function drawDark(dt=0){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('dark');if(own)return own(dt);
  // Match the visible hairline to the simulation's exact loss threshold.
  const fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);
  if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  const time=reducedMotion?0:world.time,s=scale;
  const shoreBase=ink.dark.pigment.split(',').map(Number),shoreTarget=ink.dark.shorelineRelief.split(',').map(Number);
  const rgb=shoreBase.map((v,i)=>Math.round(lerp(v,shoreTarget[i],darknessRelief))).join(',');
  ctx.save();
  const body=ctx.createLinearGradient(0,fy,0,fy+68*s);
  body.addColorStop(0,`rgba(${ink.dark.bodyTop},.12)`);body.addColorStop(.4,`rgba(${ink.dark.bodyMid},.82)`);body.addColorStop(1,ink.dark.washSolid);
  ctx.fillStyle=body;ctx.fillRect(0,fy,W,Math.max(0,H-fy));
  const tileWidth=640*s,tileHeight=180*s,drift=(time*2.3*s)%tileWidth;
  const normal=darknessPlate(false),relief=darknessPlate(true);
  for(let x=-drift-tileWidth;x<W;x+=tileWidth){
    ctx.drawImage(normal,x,fy-24*s,tileWidth,tileHeight);
    if(darknessRelief>.001){ctx.globalAlpha=darknessRelief;ctx.drawImage(relief,x,fy-24*s,tileWidth,tileHeight);ctx.globalAlpha=1;}
  }
  // One fine shoreline communicates danger; softer sediment lines stay below it. Both are cut with the
  // same burin as every other mark on the sheet rather than ruled straight — the waterline is the one
  // line in the atlas that kills you, and it reads as ink, not a ruler. Seeded off the floor's own
  // rounded position so the cut is stable frame to frame instead of crawling as the flood rises.
  burinSegment(ctx,0,fy,W,fy,rgb,.38+near*.24+darknessRelief*.12,Math.max(.65,s*.75),Math.round(world.floorY),{segments:10,wobble:.5,hair:false});
  for(let layer=0;layer<3;layer++){
    ctx.strokeStyle=`rgba(${rgb},${(.18-layer*.04)*(1+darknessRelief*.45)})`;ctx.lineWidth=.45*s;
    ctx.beginPath();
    for(let x=-8;x<W+9;x+=8){
      const y=fy+(3+layer*5+(Math.sin(x/(48*s)+time*.19+layer)*.5+.5)*(4+layer))*s;
      if(x===-8)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  for(const mote of inkMotes){
    const phase=(mote.phase+time*mote.speed)%1,alpha=Math.sin(phase*Math.PI)*(.13+near*.09+darknessRelief*.1);
    const x=mote.x*W+Math.sin(time*.3+mote.drift)*2*s,y=fy-(4+phase*25)*s;
    line(x,y,x+.3*s,y+mote.length*s,`rgba(${rgb},${alpha})`,.55*s);
  }
  drawDarkMarginalia(fy,time,.55+near*.3+darknessRelief*.15);
  if(near>.2&&world.state==='playing'){
    const edge=ctx.createRadialGradient(W*.5,H*.5,H*.3,W*.5,H*.5,Math.max(W,H)*.65);
    edge.addColorStop(0,'rgba(81,48,39,0)');edge.addColorStop(1,`rgba(${rgb},${near*.105*(1-darknessRelief*.75)})`);
    ctx.fillStyle=edge;ctx.fillRect(0,0,W,H);
  }
  ctx.restore();
}
function burst(x,y,count,color='gold',force=1){
  if(reducedMotion)return;
  for(let i=0;i<count;i++){
    const a=Math.random()*TAU,v=(18+Math.random()*90)*force;
    particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.4+Math.random()*.7,max:1.1,size:.6+Math.random()*1.3,color});
  }
  if(particles.length>230)particles.splice(0,particles.length-230);
}
// ---------- Capture marks: what the burin leaves at a planet as the traveller is taken ----------
// Each mark is drawn in the planet's own space, rotated so +x is the point of contact, with `radius`
// the ripple's reach and `alpha` its remaining life. Reduced motion holds every one of them still.
const CAPTURE_MARKS={
  // A compass rose thrown out from the contact: eight rays, the cardinals long, on two faint rings.
  rose(r,t,radius,alpha,burin){
    const rgb=ink.dark.transferArc;
    burinArc(ctx,0,0,radius,0,TAU,rgb,alpha*.5,r.perfect?.7:.5,burin,{segments:22,skips:2});
    if(r.perfect)burinArc(ctx,0,0,radius*.62,0,TAU,ink.dark.transferArcSoft,alpha*.4,.45,burin+5,{segments:16,skips:2});
    for(let i=0;i<8;i++){
      const a=i/8*TAU,long=i%2===0,reach=radius*(long?1.22:.86);
      const c=Math.cos(a),s=Math.sin(a);
      ctx.fillStyle=`rgba(${rgb},${alpha*(long?.85:.5)})`;
      ctx.beginPath();ctx.moveTo(c*reach,s*reach);
      ctx.lineTo(Math.cos(a+.13)*radius*.28,Math.sin(a+.13)*radius*.28);
      ctx.lineTo(Math.cos(a-.13)*radius*.28,Math.sin(a-.13)*radius*.28);
      ctx.closePath();ctx.fill();
    }
    line(0,0,radius*1.34,0,`rgba(${ink.dark.transferTick},${alpha*.8})`,.6);
  },
  // A wax seal pressed at the contact: a pooled blot of wax under a stamped star.
  seal(r,t,radius,alpha,burin){
    const size=Math.max(2,radius*(r.perfect?.5:.4));
    ctx.save();ctx.translate(radius*.72,0);
    landContour(ctx,0,0,size,size*.88,seeded(burin));
    ctx.fillStyle=`rgba(${ink.dark.transferArcSoft},${alpha*.5})`;ctx.fill();
    ctx.strokeStyle=`rgba(${ink.dark.transferArc},${alpha*.8})`;ctx.lineWidth=.5;ctx.stroke();
    ctx.strokeStyle=`rgba(${ink.dark.transferTick},${alpha*.9})`;ctx.lineWidth=.5;
    ctx.beginPath();
    for(let i=0;i<12;i++){
      const a=i/12*TAU,rr=i%2?size*.24:size*.55;
      const px=Math.cos(a)*rr,py=Math.sin(a)*rr;
      if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);
    }
    ctx.closePath();ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,size*.72,0,TAU);ctx.stroke();
    ctx.restore();
    burinArc(ctx,0,0,radius,-2.4,2.4,ink.dark.transferArc,alpha*.45,.5,burin+11,{segments:14,skips:2});
  },
  // A printer's manicule swung round to point at the planet that took you.
  manicule(r,t,radius,alpha,burin){
    burinArc(ctx,0,0,radius,-1.9,1.9,ink.dark.transferArc,alpha*.42,.5,burin,{segments:14,skips:2});
    ctx.save();ctx.rotate(Math.PI);
    manicule(-radius*1.5,0,1,Math.max(3.4,radius*.42),ink.dark.transferTick,alpha*.95);
    ctx.restore();
    if(r.perfect)line(radius*.4,0,radius*1.1,0,`rgba(${ink.dark.transferTick},${alpha*.7})`,.5);
  }
};
function drawTransferMark(r,t){
  const grow=reducedMotion?0:1-Math.pow(1-t,3),radius=r.start+grow*r.distance;
  const x=r.node?r.node.x:r.x,y=r.node?r.node.y:r.y,alpha=Math.pow(1-t,1.5)*r.alpha;
  const sectors=r.perfect?8:5;
  ctx.save();ctx.translate(sx(x),sy(y));ctx.scale(scale,scale);ctx.rotate(r.angle);
  const burin=r.seed||1;
  const chosen=CAPTURE_MARKS[activeCosmetic('capture')];
  if(chosen){chosen(r,t,radius,alpha,burin);ctx.restore();return;}
  for(let j=0;j<sectors;j++){
    const a=j*TAU/sectors,gap=r.perfect?.055:.11;
    burinArc(ctx,0,0,radius,a+gap,a+TAU/sectors-gap,ink.dark.transferArc,alpha,r.perfect?.9:.6,burin+j*13,{segments:7,skips:0});
    if(r.perfect){
      burinArc(ctx,0,0,radius+3,a+.1,a+TAU/sectors-.17,ink.dark.transferArcSoft,alpha*.68,.4,burin+j*13+5,{segments:5,skips:1});
      const c=Math.cos(a),s=Math.sin(a),reach=j%2===0?6:3;
      line(c*(radius+1),s*(radius+1),c*(radius+reach),s*(radius+reach),`rgba(${ink.dark.transferTick},${alpha})`,.6);
    }
  }
  // A short fan marks the actual point of contact, like a nib touching paper.
  if(!reducedMotion){
    for(let i=-2;i<=2;i++){
      const a=i*.07,c=Math.cos(a),s=Math.sin(a),start=radius+3,reach=(r.perfect?12:6)*(1-Math.abs(i)*.16);
      line(c*start,s*start,c*(start+reach),s*(start+reach),`rgba(${ink.dark.transferNib},${alpha*.72})`,.5);
    }
  }
  ctx.restore();
}
// A pointing hand cut with a few strokes, as printed in the margin of a seventeenth-century book.
// `dir` is +1 for a hand pointing right, -1 for one pointing left.
function manicule(x,y,dir,size,rgb,alpha){
  ctx.save();ctx.translate(x,y);ctx.scale(dir*size,size);
  ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=.85/size;
  ctx.beginPath();ctx.moveTo(-1,-.5);ctx.lineTo(-.66,-.6);ctx.lineTo(-.66,.6);ctx.lineTo(-1,.5);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-.62,-.52);
  ctx.bezierCurveTo(-.2,-.6,-.02,-.42,.18,-.34);
  ctx.lineTo(.92,-.26);ctx.bezierCurveTo(1.16,-.2,1.16,-.02,.9,.02);
  ctx.lineTo(.2,.06);ctx.bezierCurveTo(.42,.3,.24,.62,-.16,.6);
  ctx.lineTo(-.62,.56);ctx.closePath();ctx.stroke();
  ctx.lineWidth=.5/size;
  ctx.beginPath();ctx.moveTo(-.1,.1);ctx.lineTo(.16,.13);ctx.moveTo(-.14,.3);ctx.lineTo(.1,.32);ctx.stroke();
  ctx.restore();
}
// A run lost off the side of the chart is not a burst but a spill: the hand jittered as the nib left the
// sheet, so ink pools where it left rather than exploding outward. `r.dir` (+1 right, -1 left) biases the
// flung droplets and the jittery flicked strokes toward the side the flight was headed, in the pen's own
// registered ink, drying from wet to dry exactly as the release blot does. Reduced motion keeps only the
// pool itself, at its full size at once, and drops the flicks and droplets as the decorative filaments
// they are.
// The spill itself, in its own local space and on any context that can take a burin, so the thing is
// drawn in exactly one place: the chart spills one where a run left the sheet, and the catalogue prints
// one on a card in the ink it is offering. `t` is how far through its life the splat is — that alone
// fixes how far it has spread, how far it has dried from blotWet toward blotDry, and every alpha on it
// — `spray` flings the flicks and droplets (the chart biases them the way the flight was headed), and
// `flung` is what reduced motion drops: without it the splat is only its pool, at full size at once.
function inkSplat(g,pen,t,seed,size,peak,spray,flung,crown){
  const rng=seeded(seed),grow=flung?clamp(t*7,.3,1):1;
  const dry=clamp((t-.12)/.88,0,1),alpha=peak*clamp(1-t*t,0,1);
  const rgb=mixRgb(pen.blotWet,pen.blotDry,dry);
  if(flung){
    for(let i=0;i<5;i++){
      const a=spray+(rng()-.5)*2.6,len=(16+rng()*34)*grow;
      burinSegment(g,0,0,Math.cos(a)*len,Math.sin(a)*len,rgb,alpha*.5,.5+rng()*.6,seed+i*31+1,{segments:5,wobble:1.5,hair:false});
    }
    for(let i=0;i<7;i++){
      const a=spray+(rng()-.5)*2.6,d=(8+rng()*32)*grow,drop=(1.4+rng()*3.6)*grow;
      landContour(g,Math.cos(a)*d,Math.sin(a)*d,drop,drop*.8,seeded(seed+i*17+3));
      g.fillStyle=`rgba(${rgb},${alpha*.68})`;g.fill();
    }
  }
  const pool=size*grow;
  landContour(g,0,0,pool,pool*.86,seeded(seed));
  g.fillStyle=`rgba(${rgb},${alpha*.85})`;g.fill();
  g.strokeStyle=`rgba(${rgb},${alpha*.55})`;g.lineWidth=.5;g.stroke();
  // The dark's own splat asks for a crown: a handful of short bleed threads climbing away from the
  // spray direction, in the same fanned-quadratic hand as the flood's own bleed loop in
  // darknessPlate() — the point of loss reads as ink the flood is still climbing, not a spent blot.
  if(crown)for(let i=0;i<6;i++){
    const a=spray+(rng()-.5)*1.8,reach=(pool*.7+rng()*pool*.9)*grow,bend=(rng()-.5)*pool*.5;
    const x0=Math.cos(a)*pool*.3,y0=Math.sin(a)*pool*.3,x1=Math.cos(a)*(pool*.3+reach),y1=Math.sin(a)*(pool*.3+reach);
    g.strokeStyle=`rgba(${rgb},${alpha*(.28+rng()*.24)})`;g.lineWidth=.5+rng()*.5;
    g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(x0+bend,(y0+y1)/2,x1,y1);g.stroke();
  }
}
function drawInkSplat(r,t){
  ctx.save();ctx.translate(sx(r.x),sy(r.y));ctx.scale(scale,scale);
  const spray=r.spray!==undefined?r.spray:(r.dir>=0?0:Math.PI);
  inkSplat(ctx,trailInk(),t,r.seed,r.size,r.alpha,spray,!reducedMotion,r.crown);
  ctx.restore();
}
function drawEffects(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];if(world.state!=='paused'){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*1.5);p.vy*=Math.exp(-dt*1.5);}
    if(p.life<=0){particles.splice(i,1);continue;}
    const alpha=clamp(p.life/p.max,0,1),rgb=p.color==='red'?ink.dark.burstRed:p.color==='blue'?ink.dark.burstBlue:p.color==='violet'?ink.dark.burstViolet:ink.dark.burstGold;
    line(sx(p.x),sy(p.y),sx(p.x-p.vx*.025),sy(p.y-p.vy*.025),`rgba(${rgb},${alpha})`,p.size*scale);
  }
  for(let i=rings.length-1;i>=0;i--){
    const r=rings[i];if(world.state!=='paused')r.age+=dt;if(r.age>r.life){rings.splice(i,1);continue;}
    const t=r.age/r.life;
    if(r.kind==='capture'){drawTransferMark(r,t);continue;}
    if(r.kind==='splat'){drawInkSplat(r,t);continue;}
    if(r.kind==='blot'){
      // A bead of ink pools at the release point, then dries lighter as it soaks in.
      const grow=reducedMotion?1:clamp(t*6,.25,1),dry=clamp((t-.15)/.85,0,1),alpha=r.alpha*clamp(1-t*t,0,1);
      ctx.save();ctx.translate(sx(r.x),sy(r.y));ctx.scale(scale,scale);
      const pen=trailInk(),rgb=mixRgb(pen.blotWet,pen.blotDry,dry),size=r.size*grow;
      landContour(ctx,0,0,size,size*.84,seeded(r.seed));
      ctx.fillStyle=`rgba(${rgb},${alpha*.8})`;ctx.fill();
      ctx.strokeStyle=`rgba(${rgb},${alpha*.55})`;ctx.lineWidth=.45;ctx.stroke();
      ctx.restore();continue;
    }
    burinArc(ctx,sx(r.x),sy(r.y),(r.start+(reducedMotion?0:t*r.distance))*scale,0,TAU,ink.dark.ringSimple,(1-t)*r.alpha,.8,r.seed||7,{segments:20,skips:2});
  }
  // Scores are written up as marginal notes in Fell italic beside the play field, each with a small
  // engraved manicule pointing back in at the event. They drift up gently and fade, as before.
  for(let i=floaters.length-1;i>=0;i--){
    const f=floaters[i];if(world.state!=='paused')f.age+=dt;if(f.age>1.15){floaters.splice(i,1);continue;}
    const alpha=Math.min(1,f.age*8)*clamp((1.15-f.age)*3,0,1);
    const hand=Math.max(4.5,6*scale),size=Math.max(11,13*scale);
    // A note beside the chart can be slid round its subject until it is clear; a marginal note is set in
    // one of two fixed gutters and has only its own margin to move in. Its line is settled once, on the
    // frame it is first printed, and the side with it, so neither jumps while the note is still standing;
    // what it is settled clear of is the chapter lettering, whatever the placement solver has already set
    // within reach of the gutter, and the notes still in it. The line is kept as a lift off the sheet
    // rather than a screen position, so the note goes on riding the ascent exactly as it did.
    if(f.lift===undefined){
      f.left=sx(f.x)<W*.5;
      f.lift=floaterLine(f,f.left,size*1.5)-sy(f.y);
    }
    // floaterBox (inscriptions.js) is the one place this geometry is worked out; placeInscription reads
    // the same box to keep a brand-new note off a floater still standing where it would be set.
    const {x,y,left}=floaterBox(f);
    ctx.save();ctx.fillStyle=`rgba(${ink.dark.floaterText},${alpha})`;
    ctx.font=plateFace(size,'text','italic');ctx.textAlign=left?'left':'right';
    ctx.fillText(f.text,x,y);
    manicule(x+(left?-hand*1.5:hand*1.5),y-hand*.62,left?1:-1,hand,ink.dark.floaterText,alpha*.85);
    ctx.restore();
  }
}
