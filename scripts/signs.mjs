/* Orbit · scripts/signs.mjs
   Traces individual hieroglyphic signs of Senenmut's astronomical ceiling (tomb TT353) into
   embedded coordinate data, the way scripts/figures.mjs traces Reret and Meskhetiu: authored art
   in, packed numbers out, drawn at runtime by the game's own painter rather than shipped as an
   image. This script is the sign-column counterpart -- where figures.mjs traces two whole animal
   silhouettes, this one traces the small marks that fill the ceiling's caption columns: individual
   hieroglyphs, not read, not translated, reproduced as drawing.

   Two source crops, neither part of the repository (one-off research photographs, taken on the
   command line the way figures.mjs takes its two crops):

     node scripts/signs.mjs <divider-crop.png> <column-crop.jpg>

   <divider-crop.png> is a high-resolution crop of the horizontal register-divider band: a star row,
   then several full-width RULED LINES of hieroglyphs with real whitespace between signs. This is
   the primary source for this script's sign bank, because it is exactly the layout the vertical
   decan columns are not: there, signs are stacked in quadrats and habitually touch or nest, and a
   first pass at this script tried to segment them there and failed outright (see "What did not
   work" below). Signs set along a ruled line, by contrast, are far more separable, and every traced
   sign and the one standing figure in this bank comes from that crop.

   <column-crop.jpg> is the sheet's upper-right corner at figure scale -- the narrow decan columns
   themselves (a group of signs, a run of small stars, an occasional foot figure). It supplies only
   the three small in-column asterisk stars this script keeps; every attempt to segment its packed
   signs merged an entire column into one blob (see below), so no signs are traced from it.

   What did not work, and why it is recorded: a naive connected-component pass inside a decan
   column -- even bounded by the column's own rules, even with a small closing to bridge
   antialiasing gaps -- merges the whole column into a single component, because consecutive signs
   there routinely touch or overlap (this was tested directly: every column sampled from
   upper-right-hires.jpg produced exactly one component spanning its full sign height). The fix the
   project already uses for touching parts (figures.mjs's hand-picked exclusion boxes for Reret's
   crocodile and Meskhetiu's legs) does not generalise to a column of eight-plus mutually-touching
   signs with no reliable per-sign boundary to hand-pick. Rather than force a split and ship a bank
   of smears, this script narrows its ambition: it hand-picks a curated set of boxes -- the same
   trust-the-eye-then-verify-the-crop method figures.mjs uses for its ROIs -- around signs that
   *are* cleanly isolated (mostly on the ruled divider line, where whitespace already does the
   separating), and traces only those. Every kept box was individually re-cropped and visually
   confirmed against the source before being kept; several early candidates (see SIGN_BOXES'
   comments) turned out on close inspection to be fragments or noise and were dropped.

   The pipeline per sign: threshold the crop to an ink mask (illumination-corrected relative
   threshold, red setting-out excluded by its red excess -- reused verbatim from the research
   session's tt353/extract.py, the same function figures.mjs reuses); close small gaps; take the
   box's largest connected component (drops any fragment of a neighbouring sign the box's margin
   didn't fully exclude); trace ALL of its contours with skimage's find_contours at the ink/paper
   boundary, not just the longest one. Unlike figures.mjs's figures (outline drawings that get
   flood-filled into a flat silhouette before tracing), most signs here are ink-outline strokes
   whose interior is genuine paper, not solid fill -- tracing every contour before any fill_holes
   catches both the outer boundary AND the boundary of every enclosed counter (the ring's own hole,
   the wedjat eye's pupil) as separate closed loops, the way a font glyph carries counters. The
   longest-by-enclosed-area contour is kept as 'outer'; any other contour above a minimum area
   fraction, and inside the outer's box, is kept as a 'counter'. Each is simplified with
   Douglas-Peucker (approximate_polygon) to a point count that keeps the shape at small size.

   Coordinates: y-down (canvas convention), one unit equal to the sign's OWN outer-contour height,
   origin at the horizontal centre and the lowest point of that contour -- the same unit-box
   convention figures.mjs uses, applied per sign since each sign here is its own independent unit
   (there is no shared parent body to register against). 'aspect' records outer width / outer
   height in that same unit box, so a renderer can set a sign at a chosen height without distorting
   it.

   THE EPISTEMIC POSITION, STATED PLAINLY: every shape in this bank is a traced mark, reproduced as
   drawing, exactly as it sits on the facsimile. None of it is transliterated. None of it is
   translated. Nothing here asserts what any sign says, what word it belongs to, or which modern
   hieroglyph it corresponds to -- the comments beside SIGN_BOXES name a shape only the way a
   caption under a museum photograph would ("a loop on a crossbar"), never a reading. A renderer may
   set these signs into a column to fill it the way the wall's own columns are filled; it may not
   treat their arrangement as spelling anything.

   Also emitted, where this script's own hand-count could reach it: PATTERNS, small structural
   observations (not shapes) about how the wall lays these things out -- a handful of representative
   decan-column recipes (how many signs, how many stars, whether a foot figure closes the column),
   the divider band's own layering (star rows, ruled sign lines, roughly how many signs per line),
   and one short caption-line recipe of the kind set above a lunar-month circle. These are hand
   counts read off the two crops, not measurements, and are reported as such rather than as a claim
   to have mapped every column on the sheet.

   Source and rights: Charles K. Wilkinson's facsimile of TT353, Metropolitan Museum of Art,
   public-domain/Open Access (recorded in docs/eras/03-ceiling.md, "The documents"). */
import {writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);

const PYTHON=String.raw`
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure

# --- reused verbatim from the research session's tt353/extract.py, as figures.mjs also does ----
def ink_mask(path, t=0.90):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float64)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    lum = R * 0.299 + G * 0.587 + B * 0.114
    rel = lum / np.maximum(ndimage.gaussian_filter(lum, 25), 1)
    redline = ((R - (G + B) / 2) > 34) & (lum > 150)
    return (rel < t) & ~redline

def largest_component(mask, struct=None):
    struct = struct if struct is not None else np.ones((3, 3))
    lab, n = ndimage.label(mask, structure=struct)
    if n == 0:
        return np.zeros_like(mask)
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    big = int(np.argmax(sizes)) + 1
    return lab == big

def poly_area(pts):
    x = pts[:, 1]; y = pts[:, 0]
    return 0.5 * abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))

def trace_with_counters(mask, tol, min_hole_frac=0.015, drop_fill_frac=0.35):
    """All contours of a component -- not flood-filled first, unlike figures.mjs's figures --
    so an ink-outline sign's own enclosed counters (a ring's hole, the wedjat's pupil) come back
    as separate closed loops rather than being erased by a fill. The largest-by-area contour is
    the outer; any other above min_hole_frac of the outer's own area is kept as a counter (this
    drops single-pixel antialiasing loops without discarding a real hole) -- EXCEPT one above
    drop_fill_frac, which is discarded instead of kept.

    That second cutoff exists because ink_mask's relative threshold, tuned to pick out a hand-drawn
    line against paper, under-detects a large uniform pale wash: several signs here are genuinely
    solid-filled on the facsimile (a visibly bluer-grey interior, confirmed by eye against the
    source crop, not paper-coloured) but trace as a thin border around a spuriously 'open' counter
    because that fill's local contrast against its own Gaussian-blurred neighbourhood never crosses
    the threshold -- the same failure mode already noted for the divider's own thick horizontal
    rules in this script's header. A real counter (a wedjat's pupil-shaped gap, a wing held clear
    of a bird's body) was never seen running past roughly a third of the outer contour's own area
    among this bank's signs; a fill-detection artefact was never seen under that. 0.35 sits in the
    gap between the two and was checked against the source crop for every sign it affects, not
    picked blind."""
    contours = measure.find_contours(mask.astype(float), 0.5)
    if not contours:
        return None
    areas = [poly_area(c) for c in contours]
    order = sorted(range(len(contours)), key=lambda i: areas[i], reverse=True)
    outer = contours[order[0]]
    outer_area = areas[order[0]]
    counters = [contours[i] for i in order[1:]
                if min_hole_frac * outer_area <= areas[i] < drop_fill_frac * outer_area]
    def simp(c):
        s = measure.approximate_polygon(c, tol)
        return [(float(p[1]), float(p[0])) for p in s]
    return {'outer': simp(outer), 'counters': [simp(c) for c in counters]}

def extract(path, box, tol=1.2, close_k=3, threshold=0.90, pad=6, min_hole_frac=0.015):
    """box = (x0,y0,x1,y1) hand-picked and visually verified (see SIGN_BOXES/STAR_BOXES below).
    pad is background margin cropped around the box so the component never touches the crop's own
    edge -- otherwise find_contours would trace the crop boundary itself as a spurious contour."""
    ink = ink_mask(path, threshold)
    x0, y0, x1, y1 = box
    sub = ink[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]
    closed = ndimage.binary_closing(sub, structure=np.ones((close_k, close_k))) if close_k > 1 else sub
    comp = largest_component(closed)
    return trace_with_counters(comp, tol, min_hole_frac)

def bbox_of(pts):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)

def normalize(shape):
    """Unit-box convention, per sign (each sign is its own independent unit, unlike figures.mjs's
    figures which share one parent transform): origin at the horizontal centre and the lowest
    point of the OUTER contour; y grows downward; uniform scale so the outer contour is 1 unit
    tall. Counters ride the same transform. 'aspect' = outer width / outer height post-scale."""
    x0, y0, x1, y1 = bbox_of(shape['outer'])
    cx = (x0 + x1) / 2.0
    h = max(1e-6, y1 - y0)
    scale = 1.0 / h
    def tx(pt): return [round((pt[0] - cx) * scale, 4), round((pt[1] - y1) * scale, 4)]
    outer = [tx(p) for p in shape['outer']]
    counters = [[tx(p) for p in c] for c in shape['counters']]
    aspect = round((x1 - x0) * scale, 4)
    return {'outer': outer, 'counters': counters, 'aspect': aspect}

def count_points(shape):
    return len(shape['outer']) + sum(len(c) for c in shape['counters'])

# ================================================================ the sign bank ====================
# Every box below was hand-picked off the divider crop's two clean ruled lines (or, for the three
# stars and nothing else, off the column crop) and individually re-cropped and looked at before
# being kept -- see scripts/signs.mjs's header for why this is a curated list rather than an
# automated segmentation of either source. The name beside each is a plain-English description of
# the traced shape, never a reading: this bank does not transliterate or translate.
SIGN_BOXES = [
    ('staff',        'divider', (35, 982, 98, 1119)),      # a hooked staff or crook
    ('archLow',      'divider', (43, 1113, 110, 1150)),    # a shallow, low outlined arch
    ('basketWide',   'divider', (109, 1090, 253, 1153)),   # a wide flat-bottomed basket, filled
    ('ovalSeal',     'divider', (174, 994, 246, 1057)),    # a thick-bordered oval ring
    ('hookNeck',     'divider', (245, 1008, 336, 1103)),   # a curved hook, like a bent neck
    ('reedStroke',   'divider', (258, 1107, 282, 1153)),   # a single vertical stroke
    ('crossedWedge', 'divider', (334, 1003, 416, 1087)),   # a crossed, wedge-shaped compound mark
    ('knotTie',      'divider', (413, 1012, 480, 1105)),   # a knotted tie with two side loops
    ('columnCase',   'divider', (525, 1006, 584, 1107)),   # a tall rounded-cornered column
    ('legDiagonal',  'divider', (578, 998, 710, 1153)),    # a hooked diagonal leg with small feet
    ('ankhCross',    'divider', (711, 1001, 773, 1153)),   # a looped cross (ankh-shaped)
    ('curvedBlade',  'divider', (902, 1011, 1036, 1060)),  # a long curved blade or throwstick
    ('standardBar',  'divider', (1358, 1022, 1494, 1096)), # an oval loop set on a crossbar
    ('featherBundle','divider', (1570, 1011, 1726, 1089)), # four fanned diagonal strokes
    ('featherLeaf',  'divider', (1870, 1050, 2000, 1153)), # a single curved feather or leaf
    ('wedjatEye',    'divider', (2046, 1023, 2186, 1072)), # an eye with a marked pupil (counter)
    ('flagCloth',    'divider', (2051, 1070, 2116, 1153)), # a folded-cloth/flag corner shape
    ('ibisTicks',    'divider', (2201, 1029, 2361, 1153)), # a standing ibis with three tally ticks
                                                            # touching it -- kept as the one
                                                            # compound where the touch is itself
                                                            # part of what the wall drew, not an
                                                            # artefact of this script's boxing
    ('lensHoriz',    'divider', (2361, 1027, 2482, 1082)), # a flattened horizontal lens/eye shape
    ('bowlFalcon',   'divider', (135, 1225, 266, 1361)),   # a small bowl touching a standing falcon
    ('falconWalk',   'divider', (1121, 1223, 1237, 1367)), # a walking falcon/hawk, clean silhouette
    ('eyeOverBowl',  'divider', (1314, 1223, 1531, 1375)), # a lens shape stacked on a bowl -- two
                                                            # signs sharing one quadrat cell, the
                                                            # stacking docs/eras/03-ceiling.md's
                                                            # "Lettering and the hand" describes
    ('gooseDuck',    'divider', (2374, 1238, 2516, 1382)), # a standing goose or duck, clean
];
FIGURE_BOX = ('standingMan', 'divider', (1855, 1225, 1940, 1375));  # the one foot-of-column figure
                                                                     # this script could isolate
                                                                     # cleanly: a full standing man
STAR_BOXES = [
    ('star0', 'column', (184, 1294, 227, 1350)),
    ('star1', 'column', (235, 1296, 279, 1345)),
    ('star2', 'column', (292, 1302, 336, 1349)),
];

def main(divider_path, column_path):
    paths = {'divider': divider_path, 'column': column_path}
    marks = []
    rejects = []
    for name, src, box in SIGN_BOXES + [FIGURE_BOX] + STAR_BOXES:
        kind = 'star' if (name, src, box) in STAR_BOXES else ('figure' if name == FIGURE_BOX[0] else 'sign')
        shape = extract(paths[src], box)
        if shape is None or len(shape['outer']) < 4:
            rejects.append(name); continue
        norm = normalize(shape)
        marks.append({'id': name, 'kind': kind, 'outer': norm['outer'], 'counters': norm['counters'],
                       'aspect': norm['aspect'], 'points': count_points(norm)})
    return marks, rejects

if __name__ == '__main__':
    marks, rejects = main(sys.argv[1], sys.argv[2])
    print(json.dumps({'marks': marks, 'rejects': rejects}))
`;

// Hand-counted structural patterns -- not shapes, not pixel-derived, read off the two crops the
// way a caption reads a figure. Recorded because a renderer laying out a column or a divider band
// from real proportions is worth more than one guessing, per this script's brief; reported as hand
// counts of a few representative examples, not as a claim to have mapped every column or line on
// the sheet.
const PATTERNS={
  // Four decan columns from upper-right-hires.jpg's left edge, the only ones fully visible top to
  // bottom in one crop: a short stack of signs, then 0-2 small stars, then a ruled foot register
  // holding one standing figure. Columns further right keep stacking signs and stars but run past
  // this crop's bottom edge before any foot register, so they are not counted here.
  columns:[
    {signs:4,stars:0,footFigure:true},
    {signs:3,stars:1,footFigure:true},
    {signs:4,stars:2,footFigure:true},
    {signs:3,stars:1,footFigure:true},
  ],
  // The divider crop itself: a pair of star rows, then two full ruled lines of signs (a third
  // begins at the crop's own bottom edge, too little of it visible to count), each line holding
  // roughly twenty sign-forms end to end -- far denser than any decan column, which is what makes
  // a ruled line the better source for a bank of signs and the column the better source for a
  // column's own layout. divider-source.png, a wider but lower-resolution view of the same sheet,
  // shows the pattern continuing for at least three more ruled sign lines before a second pair of
  // star rows closes the band -- too coarse a source to vectorise from, but enough to confirm the
  // shape of the whole: star rows, several ruled sign lines, star rows again.
  divider:{starRows:2,signLines:2,signsPerLineApprox:20,moreLinesBelowApprox:3,starRowsBelow:2},
  // The short caption line set above a lunar-month circle (divider-source.png, the wheel/cartouche
  // group beneath the second star band): a handful of signs end to end, no stars, no column rules
  // -- a caption, not a decan column.
  caption:{signs:4,stars:0},
};

function fmtPoint([x,y]){return '['+x+','+y+']';}
function fmtPoints(pts){return '['+pts.map(fmtPoint).join(',')+']';}
function fmtMark(m){
  return '{'+[
    '"id":'+JSON.stringify(m.id),
    '"kind":'+JSON.stringify(m.kind),
    '"outer":'+fmtPoints(m.outer),
    '"counters":['+m.counters.map(fmtPoints).join(',')+']',
    '"aspect":'+m.aspect,
  ].join(',')+'}';
}
function fmtPatterns(p){
  const cols='['+p.columns.map(c=>`{"signs":${c.signs},"stars":${c.stars},"footFigure":${c.footFigure}}`).join(',')+']';
  const div=`{"starRows":${p.divider.starRows},"signLines":${p.divider.signLines},"signsPerLineApprox":${p.divider.signsPerLineApprox},"moreLinesBelowApprox":${p.divider.moreLinesBelowApprox},"starRowsBelow":${p.divider.starRowsBelow}}`;
  const cap=`{"signs":${p.caption.signs},"stars":${p.caption.stars}}`;
  return `{"columns":${cols},"divider":${div},"caption":${cap}}`;
}

const root=new URL('../',import.meta.url);
const [,,dividerPath,columnPath]=process.argv;
if(!dividerPath||!columnPath){
  console.error('usage: node scripts/signs.mjs <divider-crop.png> <column-crop.jpg>');
  process.exit(1);
}
const tmp=await mkdtemp(join(tmpdir(),'signs-tt353-'));
const scriptPath=join(tmp,'extract.py');
await writeFile(scriptPath,PYTHON,'utf8');
let stdout;
try{
  ({stdout}=await run('python3',[scriptPath,dividerPath,columnPath],{maxBuffer:1024*1024*64}));
}finally{
  await rm(tmp,{recursive:true,force:true});
}
const {marks,rejects}=JSON.parse(stdout);
if(rejects.length)console.log('rejected (empty/degenerate trace):',rejects.join(', '));
const totalPoints=marks.reduce((n,m)=>n+m.points,0);
console.log(`${marks.length} marks kept (${marks.filter(m=>m.kind==='sign').length} signs, ${marks.filter(m=>m.kind==='figure').length} figure, ${marks.filter(m=>m.kind==='star').length} stars), ${totalPoints} points total.`);

const out=`'use strict';
/* Orbit · src/signs-tt353.js
   Generated by scripts/signs.mjs from two crops of a Wilkinson facsimile of Senenmut's
   astronomical ceiling (tomb TT353) -- do not edit by hand; re-run the script against the source
   crops to regenerate. Source and rights: Charles K. Wilkinson's facsimile of TT353, Metropolitan
   Museum of Art, public-domain/Open Access (recorded in docs/eras/03-ceiling.md, "The documents").

   THESE ARE TRACED MARKS, REPRODUCED AS DRAWING. None of it is transliterated. None of it is
   translated. Nothing in this file asserts what any sign says, what word it belongs to, or which
   modern hieroglyph it corresponds to. A renderer may set these into a column to fill it the way
   the wall's own columns are filled; it may not treat their order as spelling anything.

   marks: a flat bank of shapes. Each is {id, kind, outer, counters, aspect}: 'kind' is 'sign',
   'figure' (the one standing foot-of-column figure this script could isolate cleanly) or 'star'
   (a small in-column asterisk, not the large bordering star-band rosette, which is out of this
   file's scope). 'outer' and each entry of 'counters' are [x,y] point lists, y-down, one unit
   equal to the mark's OWN outer-contour height, origin at the horizontal centre and the lowest
   point of that contour -- each mark is normalised independently, unlike figures-tt353.js's
   figures, which share one parent transform; there is no parent here for a single sign to
   register against. 'counters' are enclosed holes (a ring's own hole, the wedjat eye's pupil) --
   most signs here are ink-outline strokes, not flood-filled silhouettes, so a renderer should fill
   'outer' and then cut 'counters' out of it (an even-odd fill, or fill outer then paint counters
   in the surrounding colour), the way a font glyph carries its own counters. 'aspect' is outer
   width / outer height in that same unit box, for setting a mark at a chosen height undistorted.

   Most of this bank comes from a high-resolution crop of the sheet's horizontal register-divider
   band, not the narrow decan columns the original brief pointed at first: signs set along a ruled
   line have real whitespace between them, where a decan column's signs are stacked in quadrats and
   habitually touch, and every attempt this script's author made to segment a column automatically
   merged the whole column into one blob (see scripts/signs.mjs's header, "What did not work," for
   the specifics). The three 'star' entries are the one thing kept from the column crop, because
   they alone were isolated enough there to trace cleanly.

   patterns: hand counts, not shapes, of how the wall lays these things out -- a few representative
   decan-column recipes (signs, stars, whether a foot figure closes the column), the divider band's
   own layering (star rows, ruled sign lines, roughly how many signs per line, and how much more of
   the same pattern a wider but lower-resolution view of the sheet shows continuing below), and one
   short caption-line recipe of the kind set above a lunar-month circle. These are read off the
   source crops by eye, the way a caption reads a figure, not measured -- and are reported as a
   handful of examples, not as a map of every column or line on the sheet. */
const SIGNS_TT353={"marks":[${marks.map(fmtMark).join(',')}],"patterns":${fmtPatterns(PATTERNS)}};
`;
await writeFile(new URL('src/signs-tt353.js',root),out,'utf8');
console.log('wrote src/signs-tt353.js');
