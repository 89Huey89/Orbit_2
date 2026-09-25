'use strict';
/* Orbit · src/effects.js
   The rising darkness's ink palette, the player comet, trail, ripples, and particle effects; the
   darkness's own art and marginalia are src/darkness.js, which loads right after this file. */
// ---------- Rising darkness's ink, player comet, and effects: spilled ink on paper, starlight ink at night ----------
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
    // Not fire: the ink burning its own drawing out of the page it is drawn on. Iron-gall is acidic and
    // mildly self-catalytic, so a damp sheet browns along its own heaviest strokes before it fails —
    // this is that halo's own colour, paler and warmer than the rubrication pigment it deepens toward
    // as the corrosion goes on to foxing and then to a puncture the sheet shows through.
    corrosion:'176,108,54',
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
// The tiled value noise the era sheets bake their paper from: hashed on an integer lattice, smoothed,
// and wrapped every `period` cells down the sheet, so a tile lays end to end with no seam. Shared by
// scroll.js, astrolabe.js and lens.js, whose sheets all want the same paper grain.
function tileHash(a,b=0,c=0){let h=Math.imul((a|0)^0x9E3779B1,0x85EBCA77)^Math.imul((b|0)+0x27d4eb2f,0xC2B2AE3D)^Math.imul((c|0)+0x165667b1,0x27D4EB2F);h=Math.imul(h^(h>>>15),0x2C1B3C6D);h^=h>>>13;h=Math.imul(h,0x297A2D39);h^=h>>>16;return (h>>>0)/4294967296;}
function tileNoise(x,y,seed,period){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=q=>((q%period)+period)%period;
  const h=(i,j)=>tileHash(i,w(j),seed);return lerp(lerp(h(xi,yi),h(xi+1,yi),u),lerp(h(xi,yi+1),h(xi+1,yi+1),u),v)*2-1;}
function tileFbm(x,y,cell,oct,seed,tileH){let a=0,m=.5,c=cell;for(let i=0;i<oct;i++){a+=tileNoise(x/c,y/c,seed+i*17,Math.max(1,Math.round(tileH/c)))*m;m*=.5;c/=2;}return a;}
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
  // Each point carries how far along the route it lies, so a painter that dashes or ticks the route can
  // anchor the pattern to the sheet: counted from the first point still kept, every dash would slide back
  // along the line each time the oldest point is pruned off the bottom of the chart.
  const p=world.player,last=world.inkPath[world.inkPath.length-1],gap=last?Math.hypot(p.x-last.x,p.y-last.y):0;
  if(!last||gap>.6)world.inkPath.push({x:p.x,y:p.y,speed:Math.hypot(p.vx,p.vy),d:last?(last.d||0)+gap:0});
  pruneInkPath();
}
function recordTrail(){
  if(world.state!=='playing'&&world.state!=='ready')return;
  const p=world.player;
  if(trailSampledAt<0||world.time<trailSampledAt||world.time-trailSampledAt>=TRAIL_STEP){
    trailSampledAt=world.time;
    // A running count, so a painter that marks every other sample picks the same samples every frame
    // rather than by their place in an array whose head is spliced off as fast as its tail grows.
    const prev=world.trail[world.trail.length-1];
    world.trail.push({x:p.x,y:p.y,time:world.time,air:!p.node,speed:Math.hypot(p.vx,p.vy),n:prev?(prev.n||0)+1:0});
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
  const own=handFor('inkPath');if(own)return own();
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
// the alphabet is taken again with a prime — a', b', c' — the way a geometer marks the points of a second
// figure, and again with two and three. Doubling the letter instead grew a word at every pass, and by the
// thirtieth row the sheet carried points lettered mmmmmmm. After the third prime the plain letters come
// round again; by then the constructions that used them have long been carried off the sheet. The prime
// is set as the Fell apostrophe, since none of the three faces cuts a prime of its own.
function surveyLetterName(n){return String.fromCharCode(97+n%26)+"'".repeat(Math.floor(n/26)%4);}
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
  if(t<1&&head!==false){const a=Math.atan2(y1-y0,x1-x0);penBead(x,y,a,1.1*scale,.75);penNib(x,y,a,.8,undefined,nibRecency(t));}
}
// The same stroke swept round an arc, from one angle to another.
function surveyArc(cx,cy,r,from,to,t,rgb,alpha,weight){
  if(t<=0||!(r>.2))return;
  const end=from+(to-from)*t;
  ctx.strokeStyle=`rgba(${rgb},${alpha})`;ctx.lineWidth=Math.max(.35,weight);
  ctx.beginPath();ctx.arc(cx,cy,r,Math.min(from,end),Math.max(from,end));ctx.stroke();
  if(t<1){
    const x=cx+Math.cos(end)*r,y=cy+Math.sin(end)*r,a=end+(to>=from?Math.PI/2:-Math.PI/2);
    penBead(x,y,a,1.1*scale,.75);penNib(x,y,a,.8,undefined,nibRecency(t));
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
  // A small reserve of the sheet's own ground behind the letter, since on a crater's own hatching a bare
  // letter simply vanishes into it. It is a soft clearing that fades out at its rim, as a burnisher lifts
  // the tone round a letter, and not a filled box: a hard rectangle printed as a label chip on the night
  // plate rather than as bare sheet.
  const half=ctx.measureText(text).width*.5+size*.45,cy=y-size*.05;
  ctx.save();ctx.translate(x,cy);ctx.scale(1,size*.62/half);
  const clear=ctx.createRadialGradient(0,0,0,0,0,half);
  clear.addColorStop(0,`rgba(${ink.base.paperRgb},${alpha*t*.8})`);clear.addColorStop(.6,`rgba(${ink.base.paperRgb},${alpha*t*.55})`);clear.addColorStop(1,`rgba(${ink.base.paperRgb},0)`);
  ctx.fillStyle=clear;ctx.beginPath();ctx.arc(0,0,half,0,Math.PI*2);ctx.fill();ctx.restore();
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
  // (e) No note is set beside the construction. It once repeated the landing's speed and gain, and the
  // square's name and bonus, which the tally in the gutter and the note on the orbit already carry: one
  // landing then wrote the same figures three times over, and it is the figure itself — the angle and
  // its numeral, or the right angle — that the construction is for.
}
function drawTrail(){
  // A plate whose traveller does not write with a nib names its own trail painter.
  const own=handFor('trail');if(own)return own();
  const trail=world.trail;
  if(trail.length<2)return;
  const pen=trailInk(),m=trailMaterial(),level=world.inkLevel();
  // Past the point where the barrel's own fill would show copper (see OBSERVER_MARKS.quill) the nib
  // is starved: the stroke skips beats and loses its weight the nearer the reservoir runs to dry, as
  // a real pen scratches out its last ink.
  const starved=clamp(1-level/.34,0,1),thin=1-starved*.55;
  // A charged nib presses more ink onto the sheet than a half-spent one, so the stroke's own body and
  // wash answer to how much is actually held, graded across the whole reservoir rather than only once
  // it runs starved — but only ever down from the weight a brimming nib has always laid, never past
  // it, so a full trail reads exactly as it always has.
  const wet=1-(1-level)*.35;
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
    const spread=m.body*scale*thin*wet,gauge=(1+m.nib*(cut-.62))*spread;
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
          `rgba(${tone},${t*t*STROKE_PROFILE[j][1]*grain*wet*(j===0?m.halo:1)})`,core+reach*out);
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
    // The barrel below needs more of the shaft than a feather that started right at the nib would
    // leave it, so the whole feather — its near end, its control point, and the plume alike — is
    // struck this same distance further out. Moved as one piece rather than restretched, it keeps
    // exactly the length and curve it always had; only where it starts changes.
    const reed=4.6,plume0=-(24+length*.3),plume=plume0-reed,tipY=-5.2-flex*.9,cx=plume0*.5-reed,cy=-1.1-flex*.26,quillX0=-10.6-reed,BARBS=30;
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
        ctx.beginPath();if(!pass)ctx.moveTo(quillX0,-.5);
        for(let i=0;i<BARBS;i++){
          const u=(i+.7)/(BARBS+.7),x=qAt(u,quillX0,cx,plume),y=qAt(u,-.5,cy,tipY);
          const tx=2*((1-u)*(cx-quillX0)+u*(plume-cx)),ty=2*((1-u)*(cy+.5)+u*(tipY-cy)),tl=Math.hypot(tx,ty)||1;
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
    ctx.beginPath();ctx.moveTo(quillX0,-.5);ctx.quadraticCurveTo(cx,cy,plume,tipY);ctx.stroke();
    // The stripped barrel between the cut and the feather: a quill is bared where the hand holds it,
    // so the shaft is two outlines with the sheet showing through between them — the only way an
    // engraver had of saying that a thing was translucent — except where the ink actually drawn up
    // into it shows through those same outlines instead, exactly as far as the level held.
    const bNear=-7,bCtrl=-9-reed,bFarTop=-11.2-reed,bFarBot=-10.9-reed;
    if(inkHeld>0){
      // Filled from the nib's own end toward the feather, to the level held, rather than laid as a
      // flat tint over the whole shaft: a barrel this narrow reads as a reservoir only if the fill
      // itself has a level in it. Clipped to the barrel's own outline so a straight-sided wash still
      // comes out cut to the taper of a real shaft.
      const tone=inkHeld<=.34?ink.base.copper:ink.dark.playerNib,reach=bNear-(bFarTop+bFarBot)*.5;
      ctx.save();
      ctx.beginPath();ctx.moveTo(bNear,-2.2);ctx.quadraticCurveTo(bCtrl,-2.2,bFarTop,-1.4);
      ctx.lineTo(bFarBot,1);ctx.quadraticCurveTo(bCtrl,2.1,bNear,2.2);ctx.closePath();ctx.clip();
      ctx.fillStyle=`rgba(${tone},.58)`;
      ctx.fillRect(bNear-reach*inkHeld,-3,reach*inkHeld,6);
      ctx.restore();
    }
    markStroke(.66,.7);
    ctx.beginPath();ctx.moveTo(bNear,-2.2);ctx.quadraticCurveTo(bCtrl,-2.2,bFarTop,-1.4);
    ctx.moveTo(bNear,2.2);ctx.quadraticCurveTo(bCtrl,2.1,bFarBot,1);ctx.stroke();
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

};
// A rigid instrument held tangent to an orbit stands off the curve at both ends, and the longer it is the
// worse: a crayon trailing thirty units behind its point on a fifty-unit orbit hung its butt a fifth of the
// radius outside the ring it was going round. So while the traveller is on an orbit the instrument is laid
// along the chord its own two ends cut on that orbit instead, and set halfway between that chord and the
// tangent, so its ends and its middle stray from the curve by the same small amount the other way. back and
// front are the instrument's extent behind and ahead of the travelling point, in the units it is drawn in.
// The fit eases in on capture and out on release rather than snapping the whole tool a few degrees at once.
let heldFit=0,heldFitAt=0,heldOrbit=null;
function heldPose(back,front){
  const p=world.player,n=p.node,dt=world.time-heldFitAt;heldFitAt=world.time;
  if(n&&p.rad>0)heldOrbit={x:n.x,y:n.y,r:p.rad,s:p.dir||1};
  const on=n&&p.rad>0?1:0;heldFit=dt<0||dt>.5||reducedMotion||!heldOrbit?on:heldFit+(on-heldFit)*(1-Math.exp(-dt*14));
  let ang=Math.atan2(p.vy,p.vx),dx=0,dy=0;
  if(heldOrbit&&heldFit>.001){
    const o=heldOrbit,r=o.r,s=o.s,at=Math.atan2(p.y-o.y,p.x-o.x),a1=at+s*back/r,a2=at+s*front/r;
    const e1x=o.x+Math.cos(a1)*r,e1y=o.y+Math.sin(a1)*r,e2x=o.x+Math.cos(a2)*r,e2y=o.y+Math.sin(a2)*r,t=-back/(front-back);
    let turn=Math.atan2(e2y-e1y,e2x-e1x)-(at+s*Math.PI/2);turn=Math.atan2(Math.sin(turn),Math.cos(turn));
    ang+=turn*heldFit;
    // The offset is taken to the true point projected onto that orbit, so easing out after a release never
    // carries the tool along a ring the traveller has already left.
    const px=o.x+Math.cos(at)*r,py=o.y+Math.sin(at)*r;
    dx=(e1x+(e2x-e1x)*t-px)*.5*heldFit;dy=(e1y+(e2y-e1y)*t-py)*.5*heldFit;
  }
  return {x:sx(p.x+dx),y:sy(p.y+dy),ang};
}
function drawPlayer(){
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
  // Round the whole mark the sheet is kept clean, as an engraver keeps a reserve round the one figure the
  // eye must find first: a soft oval of the plate's own ground under the pen, so a flight across the
  // graticule, the orbits and the route is not lost among lines drawn in the same pale ink as the quill.
  {
    const rx=length*.62+7,ry=7.5,cx=-length*.42;
    ctx.save();ctx.translate(cx,0);ctx.scale(rx,ry);
    const clear=ctx.createRadialGradient(0,0,0,0,0,1);
    clear.addColorStop(0,`rgba(${ink.base.paperRgb},${onPaper()?.6:.55})`);clear.addColorStop(.55,`rgba(${ink.base.paperRgb},${onPaper()?.4:.38})`);clear.addColorStop(1,`rgba(${ink.base.paperRgb},0)`);
    ctx.fillStyle=clear;ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.fill();ctx.restore();
  }
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
  // The embossed bite a perfect landing's strike leaves in the ring (src/press.js).
  drawPress(dt);
  // An era's own score is still written up as a marginal note in Fell italic beside the play field,
  // each with a small engraved manicule pointing back in at the event, drifting up gently and fading —
  // exactly as the atlas's own used to. The atlas keeps its score as ink now instead (drawTallies,
  // below), so this loop only ever has anything in it on a plate that still deals in floaters.
  for(let i=floaters.length-1;i>=0;i--){
    const f=floaters[i];if(world.state!=='paused')f.age+=dt;if(f.age>1.15){floaters.splice(i,1);continue;}
    const alpha=Math.min(1,f.age*8)*clamp((1.15-f.age)*3,0,1);
    const hand=Math.max(4.5,6*scale),size=Math.max(11,13*scale);
    // A note beside the chart can be slid round its subject until it is clear; a marginal note is set in
    // one of two fixed gutters and has only its own margin to move in. Its line is settled once, on the
    // frame it is first printed, and the side with it, so neither jumps while the note is still standing;
    // what it is settled clear of is the chapter lettering, whatever the placement solver has already set
    // within reach of the gutter, and the notes still in it. The line is kept as a lift off the sheet
    // rather than a screen position, so the note goes on riding the ascent exactly as it did. A gutter
    // with no clear line left anywhere leaves `f.lift` null rather than forcing the note onto ground
    // already spoken for — checked once here, exactly as the settle itself is, rather than retried every
    // frame, which would let an already-standing note jump about as the ground around it changes.
    if(f.lift===undefined){
      f.left=sx(f.x)<W*.5;
      const line=floaterLine(f,f.left,size*1.5);
      f.lift=line===null?null:line-sy(f.y);
    }
    if(f.lift===null)continue;
    // floaterBox (inscriptions.js) is the one place this geometry is worked out; placeInscription reads
    // the same box to keep a brand-new note off a floater still standing where it would be set.
    // A plate that sets its notes in its own marks names a `floater` painter: asked once with no box it
    // says how wide its marks run (or null, for a note it still sets as text), so the box, the register
    // and the gutter solver all see the ground it really takes; asked with the box, it draws the note.
    const own=handFor('floater');
    if(own&&f.markWidth===undefined)f.markWidth=own(f,null);
    const fb=floaterBox(f),{x,y,left}=fb;
    markGround('floater',fb.l,fb.t,fb.r,fb.b,f);
    if(own){ctx.save();own(f,fb,alpha);ctx.restore();continue;}
    ctx.save();ctx.fillStyle=`rgba(${ink.dark.floaterText},${alpha})`;
    ctx.font=plateFace(size,'text','italic');ctx.textAlign=left?'left':'right';
    ctx.fillText(f.text,x,y);
    manicule(x+(left?-hand*1.5:hand*1.5),y-hand*.62,left?1:-1,hand,ink.dark.floaterText,alpha*.85);
    ctx.restore();
  }
  drawTallies(dt);
}
// The atlas's own reading of a landing's score: the same gutter and hand as a floater, but struck once
// and left, so it goes on carrying the run's own SUMMA down the sheet rather than drifting up and out
// of it. Settling a line is the one thing it still shares with a floater's own first frame (see the
// comment above); everything after that is a difference of degree, not of kind — ink instead of chalk.
function drawTallies(dt){
  for(let i=tallies.length-1;i>=0;i--){
    const t=tallies[i];
    if(world.state!=='paused')t.age+=dt;
    // Settled one frame after it is pushed, not the frame it arrives: the landing that pushes it also
    // announces itself in the same breath (ui.js), and that note is placed before this tally has any
    // line to declare. The register is read a frame behind by design, so a tally settling on its first
    // frame would read a sheet without the note and could take the note's own line; waiting one frame
    // reads the note where it was actually set, and sixteen milliseconds is not a delay anyone reads.
    if(!t.seen){t.seen=true;continue;}
    if(t.lift===undefined){
      t.left=sx(t.x)<W*.5;
      // Two lines tall, so the line it asks for is the height tallyBox will actually declare, not a floater's one.
      const size=Math.max(11,13*scale),line=floaterLine(t,t.left,size*1.85,'tally');
      // A gutter with nowhere left to stand it is a tally that is never struck at all, exactly as a
      // note the plate has no clear ground for goes unwritten (inscriptions.js) rather than printed
      // over whatever already stands there.
      if(line===null){tallies.splice(i,1);continue;}
      t.lift=line-sy(t.y);
    }
  }
  // The cap, weighed once every tally on the sheet has a settled line to stand on: the lowest — the
  // next the ascent would carry under the footer band anyway — gives way to a fresh landing rather
  // than the sheet keeping an unbounded history of every one a long run has made.
  while(tallies.length>TALLY_CAP){
    let drop=0,lowest=-Infinity;
    for(let i=0;i<tallies.length;i++){const b=tallyBox(tallies[i]);if(b&&b.bottom>lowest){lowest=b.bottom;drop=i;}}
    tallies.splice(drop,1);
  }
  // Cut off at the plate's inner rule and its footer band exactly as an inscription is (drawInscriptions,
  // inscriptions.js), since a tally is that same kind of mark now: ink laid once in world units and
  // carried away under the sheet's own furniture rather than a sprite clipped to the raw canvas.
  const rule=frameBand()*.92;
  ctx.save();ctx.beginPath();ctx.rect(rule,rule,Math.max(0,W-rule*2),Math.max(0,H-footerBand()-rule));ctx.clip();
  for(let i=tallies.length-1;i>=0;i--){
    const t=tallies[i],tb=tallyBox(t);
    // No box yet is a tally still waiting its frame for a line (above), not one to strike; a box carried
    // under the footer band is ink the sheet has taken away, and goes exactly as an inscription goes.
    if(!tb)continue;
    if(tb.top>H-footerBand()){tallies.splice(i,1);continue;}
    markGround('tally',tb.l,tb.top,tb.r,tb.bottom,t);
    // Only the newest tally is wet. Every older one dries back to half its strength over a second once a
    // later landing has been written, as the trail dries behind the nib: the running SUMMA is the one
    // figure the eye needs, and a column of equally bright tallies down the gutter outweighed the chart.
    const newest=i===tallies.length-1;
    if(newest)t.stale=0;else if(world.state!=='paused')t.stale=(t.stale||0)+dt;
    const dry=newest?1:reducedMotion?.5:lerp(1,.5,Math.min(1,(t.stale||0)/1.1));
    const alpha=(reducedMotion?1:Math.min(1,t.age*8))*dry;
    // A plate that sets its tallies in its own ink names a `tally` painter, handed the settled box to draw in.
    const own=handFor('tally');if(own){ctx.save();own(t,tb,alpha);ctx.restore();continue;}
    const hand=Math.max(4.5,6*scale),size=Math.max(11,13*scale),size2=Math.max(9.5,11*scale);
    ctx.save();ctx.fillStyle=`rgba(${ink.dark.floaterText},${alpha})`;
    ctx.font=plateFace(size,'text','italic');ctx.textAlign=t.left?'left':'right';
    ctx.fillText(t.line1,tb.x,tb.y);
    ctx.font=plateFace(size2,'text','italic');
    ctx.fillText(t.line2,tb.x,tb.y+size*.98);
    manicule(tb.x+(t.left?-hand*1.5:hand*1.5),tb.y-hand*.62,t.left?1:-1,hand,ink.dark.floaterText,alpha*.85);
    ctx.restore();
  }
  ctx.restore();
}
