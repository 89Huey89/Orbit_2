/* Orbit · scripts/figures.mjs
   Traces the hand-drawn animal figures of Senenmut's astronomical ceiling (tomb TT353) into
   embedded coordinate data, the way scripts/glyphs.mjs traces the atlas's type: authored art in,
   packed numbers out, drawn at runtime by the game's own painter rather than shipped as an image.

   Reads two high-resolution crops of the Charles K. Wilkinson facsimile (Metropolitan Museum of
   Art, public-domain/Open Access — see docs/eras/03-ceiling.md, "The documents") and the ink masks
   already proven for them by that research session's extract.py (kept here as INK_MASK, reused
   verbatim rather than re-derived): one crop of Reret the hippopotamus with the crocodile laid
   along her back, one of Meskhetiu, the Foreleg constellation. Neither source crop nor its mask is
   part of the repository — they are one-off research photographs, not a shipped asset — so this
   script takes their paths on the command line:

     node scripts/figures.mjs <reret-crop.jpg> <meskhetiu-crop.jpg>

   and writes src/figures-tt353.js. It shells out to Python (numpy/scipy/scikit-image/Pillow) for
   the image work, the way glyphs.mjs reaches for fontkit, and adds no runtime dependency: the
   Python source lives inline below, is written to a temp file for the one call, and is never
   needed again once src/figures-tt353.js is committed.

   The pipeline per figure: threshold the crop to an ink mask; restrict to a hand-picked region of
   interest clear of the crop's other content (hieroglyph rows, a neighbouring human figure, the
   mooring post); close small gaps in the hand-drawn line and flood-fill its interior to turn the
   outline drawing into the flat silhouette the wall actually paints; trace the outer contour and
   simplify it with Douglas-Peucker (skimage's approximate_polygon) to a point count that keeps the
   reading (muzzle, ridge, toes) without embedding the drawing's full hand-wobble. Small attached
   parts — a crocodile, a pair of legs, a chain bead, a star — are the same trace run again inside
   their own small box, since a rectangle that excludes a part before the fill would sever the
   outline it is stitched to.

   Coordinates: y-down (canvas convention, not the em-box y-up of glyphs.js), one unit equal to the
   figure's own outer-silhouette height, origin at the horizontal centre and the lowest point of
   that silhouette. Every other part of a figure — Reret's crocodile, Meskhetiu's legs and chain —
   is carried through the identical transform, so it stays registered against the body that owns it
   even where it falls outside the unit box (a chain trailing off to one side, legs hanging below
   the body's own lowest point).  */
import {writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);

const PYTHON=String.raw`
import sys, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from skimage import measure

# --- reused verbatim from the research session's tt353/extract.py ------------------------------
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

def trace(mask, tol, downsample=1):
    """Outer contour of a filled/solid mask, simplified with Douglas-Peucker. Downsampling first
    is what turns the facsimile's hand-drawn wobble and JPEG ringing into a clean line without
    losing the shape's real corners -- a plain tolerance bump keeps the wobble as extra points."""
    m = mask
    if downsample > 1:
        im = Image.fromarray((m.astype(np.uint8) * 255))
        im = im.resize((max(1, im.width // downsample), max(1, im.height // downsample)), Image.BILINEAR)
        m = np.asarray(im) > 127
    contours = measure.find_contours(m.astype(float), 0.5)
    if not contours:
        return []
    main = sorted(contours, key=len, reverse=True)[0]
    simp = measure.approximate_polygon(main, tol)
    return [(float(p[1] * downsample), float(p[0] * downsample)) for p in simp]

def region_contour(ink, box, tol, close_k=3, downsample=1):
    x0, y0, x1, y1 = box
    sub = ink[y0:y1, x0:x1]
    closed = ndimage.binary_closing(sub, structure=np.ones((close_k, close_k))) if close_k > 1 else sub
    pts = trace(largest_component(closed), tol, downsample)
    return [(x + x0, y + y0) for (x, y) in pts]

def polygon_mask(size, poly):
    im = Image.new('L', size, 0)
    ImageDraw.Draw(im).polygon(poly, fill=255)
    return np.asarray(im) > 0

def line_mask(size, points, width):
    im = Image.new('L', size, 0)
    ImageDraw.Draw(im).line(points, fill=255, width=width)
    return np.asarray(im) > 0

# ================================================================ Reret, the hippopotamus =========
# She stands upright on her hind legs with one forearm reaching to grasp the mooring post; the
# crocodile lies the length of her back, snout tucked behind her head, tail tapering past her hip.
# The mooring post itself (a free-standing quay fitting, not one of her own limbs, and explicitly
# named in the era brief as excluded iconography) is cut at the wrist, leaving her closed fist. A
# small hooked/spiral mark at her near knee reads as the same joint-volute convention used on the
# crocodile's scutes, not as a separate held object, and is left as part of her own silhouette.
def build_reret(path):
    ink = ink_mask(path, 0.90)
    size = (ink.shape[1], ink.shape[0])
    roi = (120, 180, 1010, 1520)  # hippo + crocodile, clear of the hieroglyph row, the circle
                                  # fragment, the human figure and the border rules
    work = np.zeros_like(ink)
    work[roi[1]:roi[3], roi[0]:roi[2]] = ink[roi[1]:roi[3], roi[0]:roi[2]]

    post_box = (90, 865, 300, 1520)
    work[post_box[1]:post_box[3], post_box[0]:post_box[2]] = False

    # The crocodile lies directly along her spine, its near edge only ~10-30px from her own back
    # line, so it is separated by a hand-picked band read off the facsimile rather than by
    # connected components, which would catch both lines as one blob.
    croc_poly = [(750, 215), (1015, 215), (1015, 1400), (900, 1400), (778, 700), (748, 400)]
    croc_region = polygon_mask(size, croc_poly)

    body = work & ~croc_region
    # Removing the crocodile's band also removes the stretch of her own back line that ran through
    # it, opening her silhouette into an unclosed curve. A synthetic seam along the band's inner
    # edge closes it back up before the fill, standing in for the real line underneath the reptile.
    seam = line_mask(size, [(748, 220), (778, 700), (900, 1400)], 4)
    closed = ndimage.binary_closing(body | seam, structure=np.ones((7, 7)))
    filled = ndimage.binary_fill_holes(closed)
    filled &= ~croc_region
    filled[post_box[1]:post_box[3], post_box[0]:post_box[2]] = False
    silhouette = trace(largest_component(filled), 1.3, downsample=4)

    croc_ink = ink & croc_region
    croc_filled = largest_component(ndimage.binary_fill_holes(
        ndimage.binary_closing(croc_ink, structure=np.ones((9, 9)))))
    croc_silhouette = trace(croc_filled, 1.0, downsample=3)

    # The serrated dorsal ridge along the crocodile's outer edge, traced as its own thin filled
    # sliver rather than folded into the body fill, so the wall can brush it in as a second colour.
    ridge = region_contour(ink, (990, 600, 1030, 1060), 1.0, close_k=3)

    return {'silhouette': silhouette, 'crocodile': {'silhouette': croc_silhouette, 'ridge': ridge}}

# ================================================================ Meskhetiu, the Foreleg ==========
# A crescent of horns, a bull's head in profile, one smooth oval/teardrop body, four short curved
# legs in two pairs, three stars on the body, and a chain running from the narrow (tail) end to a
# disc. On the facsimile the body is drawn in ink outline ONLY; the legs, the three stars and the
# disc are painted in red ochre, measurably redder than the outline (a sampled red excess of
# ~49-51 against the outline's ~29). They are kept as separate entries for exactly that reason: the
# renderer that colours this data should give the body one flat fill and the legs/stars/disc
# another, which is the reverse of src/ceiling.js's present ceilingPaintBull (a fully modelled
# four-legged, blue-hooved bull with a tail) -- deliberately so, since this facsimile shows a far
# more schematic animal with no rump, withers or tail. The chain and disc are kept as part of the
# figure (she is regularly shown tethered this way); the mooring post's own pole is not.
def build_meskhetiu(path):
    ink = ink_mask(path, 0.93)
    roi = (220, 165, 1060, 415)
    work = np.zeros_like(ink)
    work[roi[1]:roi[3], roi[0]:roi[2]] = ink[roi[1]:roi[3], roi[0]:roi[2]]

    # Every one of these is a piece of some OTHER figure or caption in the crop, not Meskhetiu: the
    # reclining human at top right (split into a near and a far fragment by the boxes below), a
    # stray isolated hieroglyph above the chain, and the "mshtjw" name-caption written on the body.
    exclude_always = [
        (820, 165, 1060, 305),  # the reclining human's far foot
        (683, 120, 825, 222),   # the reclining human's head/neck
        (840, 168, 908, 206),   # a stray hieroglyph above the chain
    ]
    star_boxes = [(440, 170, 478, 207), (484, 172, 518, 207), (529, 180, 561, 214)]
    leg_boxes = [(498, 318, 588, 408), (698, 323, 792, 415)]   # front pair, rear pair
    chain_disc_box = (835, 298, 1065, 424)

    # The legs and the chain meet the body by touching its own outline, and the tail tapers
    # straight into the chain -- clearing any of those boxes before the fill would cut the loop
    # itself, not just the appendage. So the closing runs on the untouched crop first (a wide
    # kernel: this outline has no doubled edge nearby to help bridge it, unlike Reret's), and only
    # the filled result has the appendages and the intruders carved back out.
    closed = ndimage.binary_closing(work, structure=np.ones((25, 25)))
    body_mask = largest_component(ndimage.binary_fill_holes(closed))
    for (x0, y0, x1, y1) in exclude_always + leg_boxes + [chain_disc_box]:
        body_mask[y0:y1, x0:x1] = False
    silhouette = trace(largest_component(body_mask), 1.2)

    legs = [region_contour(ink, box, 1.0) for box in leg_boxes]
    stars = [region_contour(ink, box, 0.8) for box in star_boxes]
    chain = region_contour(ink, (835, 310, 1040, 392), 1.0)
    disc = region_contour(ink, (1005, 372, 1062, 424), 0.8)
    return {'silhouette': silhouette, 'legs': legs, 'stars': stars, 'chain': {'links': chain, 'disc': disc}}

def bbox_of(points):
    xs = [p[0] for p in points]; ys = [p[1] for p in points]
    return min(xs), min(ys), max(xs), max(ys)

def normalize(fig):
    """Unit-box convention: origin at the horizontal centre and the lowest point of the figure's
    own outer silhouette; y grows downward; uniform scale so that silhouette is 1 unit tall. Every
    other part of the same figure is carried through the identical transform."""
    x0, y0, x1, y1 = bbox_of(fig['silhouette'])
    cx = (x0 + x1) / 2.0
    scale = 1.0 / max(1e-6, (y1 - y0))
    def tx(pt): return [round((pt[0] - cx) * scale, 4), round((pt[1] - y1) * scale, 4)]
    def walk(node):
        if isinstance(node, (list, tuple)):
            if len(node) == 2 and all(isinstance(v, (int, float)) for v in node):
                return tx(node)
            return [walk(n) for n in node]
        if isinstance(node, dict):
            return {k: walk(v) for k, v in node.items()}
        return node
    return walk(fig)

def count_points(node, n=0):
    if isinstance(node, (list, tuple)):
        if len(node) == 2 and all(isinstance(v, (int, float)) for v in node):
            return n + 1
        for x in node: n = count_points(x, n)
        return n
    if isinstance(node, dict):
        for x in node.values(): n = count_points(x, n)
        return n
    return n

if __name__ == '__main__':
    reret = normalize(build_reret(sys.argv[1]))
    meskhetiu = normalize(build_meskhetiu(sys.argv[2]))
    data = {'reret': reret, 'meskhetiu': meskhetiu}
    print(json.dumps({'data': data, 'counts': {
        'reret': count_points(reret), 'meskhetiu': count_points(meskhetiu),
    }}))
`;

function fmtPoint([x,y]){return '['+x+','+y+']';}
function fmtPoints(pts){return '['+pts.map(fmtPoint).join(',')+']';}
function fmtNode(node){
  if(Array.isArray(node)){
    if(node.length===2&&typeof node[0]==='number')return fmtPoint(node);
    if(node.length&&Array.isArray(node[0])&&typeof node[0][0]==='number')return fmtPoints(node);
    return '['+node.map(fmtNode).join(',')+']';
  }
  if(node&&typeof node==='object')return '{'+Object.keys(node).map(k=>JSON.stringify(k)+':'+fmtNode(node[k])).join(',')+'}';
  return JSON.stringify(node);
}

const root=new URL('../',import.meta.url);
const [,,reretPath,meskhetiuPath]=process.argv;
if(!reretPath||!meskhetiuPath){
  console.error('usage: node scripts/figures.mjs <reret-crop.jpg> <meskhetiu-crop.jpg>');
  process.exit(1);
}
const tmp=await mkdtemp(join(tmpdir(),'figures-tt353-'));
const scriptPath=join(tmp,'extract.py');
await writeFile(scriptPath,PYTHON,'utf8');
let stdout;
try{
  ({stdout}=await run('python3',[scriptPath,reretPath,meskhetiuPath],{maxBuffer:1024*1024*64}));
}finally{
  await rm(tmp,{recursive:true,force:true});
}
const {data,counts}=JSON.parse(stdout);
console.log(`Reret: ${counts.reret} points. Meskhetiu: ${counts.meskhetiu} points.`);

const out=`'use strict';
/* Orbit · src/figures-tt353.js
   Generated by scripts/figures.mjs from a Wilkinson facsimile crop of Senenmut's astronomical
   ceiling (tomb TT353) -- do not edit by hand; re-run the script against the source crops to
   regenerate. Source and rights: Charles K. Wilkinson's facsimile of TT353, Metropolitan Museum
   of Art, public-domain/Open Access (recorded in docs/eras/03-ceiling.md, "The documents").

   Each figure is [x,y] coordinate data, y-down, one unit equal to the figure's own outer-
   silhouette height, origin at the horizontal centre and the lowest point of that silhouette.
   Every other part of a figure shares its silhouette's transform, so it stays registered against
   the body that owns it even past the unit box (Meskhetiu's chain trailing off to one side, both
   figures' legs hanging below the body's own lowest point).

   The data is split for the wall's painter: 'silhouette' is the one outer contour meant for
   ceilingPolygon (a flat fill closed by a black line); everything else is a small attached part
   -- Reret's crocodile (its own silhouette plus its serrated dorsal ridge, a second colour and an
   interior line), Meskhetiu's four legs, three stars and tether chain+disc -- meant either as its
   own small ceilingPolygon fill or, for a line rather than a shape, a ceilingBrush stroke. On the
   facsimile Meskhetiu's body is ink outline only; her legs, stars and disc are a measurably redder
   red-ochre wash -- the reverse of src/ceiling.js's current ceilingPaintBull, which models a full
   four-legged, blue-hooved bull with a tail that this crop does not show. */
const FIGURES_TT353=${fmtNode(data)};
`;
await writeFile(new URL('src/figures-tt353.js',root),out,'utf8');
console.log('wrote src/figures-tt353.js');
