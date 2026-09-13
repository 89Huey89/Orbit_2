'use strict';
/* Orbit · src/ground.js
   The plate's register of lettered ground: what type stands where, and what ground is still free. */
// ---------- One register for everything the plate letters ----------
// A plate is engraved once and read for four hundred years, so nothing on it is ever set over anything
// else: the engraver knew where every line of type stood because he had cut them all himself. This is that
// knowledge, kept for a sheet that is engraved a mark at a time while it is being read. Every mark that
// sets type — the chapter title, a note beside an orbit, a planet's caption, a constellation's name, a
// score in the margin, the gloss on the flood, the running head, the impressum — declares the ground it
// stands on as it is struck, and every solver looking for somewhere to letter asks this one register
// instead of knowing its neighbours one at a time. Knowing them one at a time is what the plate did
// before, and it does not carry past two: a caption that dodged the title walked into a note, a note that
// dodged both was crossed by a name lettered round a rim, and each new piece of type on the sheet meant
// another clause in three other files. Chart marks are not in here and are not meant to be — an orbit, a
// planet, the traveller and the rising dark all print straight over the plate's own engraving, as they
// print over the graticule. This register is about two things wanting to be read in the same place.
// It is double-buffered. Solvers run inside the frame being drawn — placeInscription is called from a
// draw, and a caption picks its side as the planet under it is cut — so a mark asks about the last
// complete frame rather than about however much of this one happens to have been struck ahead of it. One
// frame's lag, on a sheet that scrolls a few points in that frame, is not a lag anyone can read.
let groundMarks=[],groundPast=[];
// Called once at the top of the frame, beside the nib's own reset (render(), frame.js): this frame's
// register becomes the one solvers read, and the frame begins collecting again into the other.
function groundTurn(){const done=groundMarks;groundMarks=groundPast;groundPast=done;groundMarks.length=0;}
// `kind` is what sort of type this is — 'title', 'note', 'caption', 'name', 'floater', 'gloss', 'head',
// 'impressum', 'key' — and is how a solver excuses its own kind from its own question. `owner` is the
// particular mark, for a solver that must excuse one note without excusing every note.
function markGround(kind,left,top,right,bottom,owner){
  if(!(right>left)||!(bottom>top)||!Number.isFinite(left)||!Number.isFinite(top)||!Number.isFinite(right)||!Number.isFinite(bottom))return;
  groundMarks.push({kind,left,top,right,bottom,owner:owner||null});
}
function markGroundBox(kind,box,owner){if(box)markGround(kind,box.left,box.top,box.right,box.bottom,owner);}
// Type declared from where it is actually set: the pen's own x and baseline, the measured width, and the
// face's size, which stands in for its cap height and descender. The three alignments canvas letters in
// are the three a caller can be setting.
function markGroundText(kind,x,baseline,width,size,align,owner){
  const left=align==='center'?x-width/2:align==='right'?x-width:x;
  markGround(kind,left,baseline-size*.86,left+width,baseline+size*.28,owner);
}
// Not all type on a plate is equally settled, and a solver has to know the difference. These kinds are cut
// and left: the plate's own title, a note already written, the running head, the legend. Nothing may be set
// over them, and a mark that can find no ground clear of them goes unwritten rather than illegibly printed.
// The rest — a caption riding a planet up the sheet, a score standing in the margin for a second, the gloss
// drifting along the flood, the impressum at the start of a run — is type that will have moved on shortly,
// so it is worth stepping around but never worth suppressing a note for.
const GROUND_FIXED=new Set(['title','note','head','key']);
const groundSpan=(a0,a1,b0,b1)=>Math.max(0,Math.min(a1,b1)-Math.max(a0,b0));
function groundSkipped(mark,skip){
  if(!skip)return false;
  if(Array.isArray(skip)){for(const one of skip)if(mark.kind===one||mark.owner===one)return true;return false;}
  return mark.kind===skip||mark.owner===skip;
}
// How much lettered ground a box would stand on, in hundredths of a square point — the same measure
// placeInscription has always weighed a clash in, so the numbers a caller balances against it need no
// rescaling. `pad` is the gutter type keeps from other type: lettering set touching lettering reads as
// badly as lettering set over it.
function groundTaken(box,skip,pad,fixedOnly){
  const g=pad||0;let taken=0;
  for(const m of groundPast){
    if(groundSkipped(m,skip)||(fixedOnly&&!GROUND_FIXED.has(m.kind)))continue;
    taken+=groundSpan(box.left-g,box.right+g,m.left,m.right)*groundSpan(box.top-g,box.bottom+g,m.top,m.bottom)/100;
  }
  return taken;
}
// The settled type alone, for the one caller that must refuse to write rather than crowd: a note.
const groundFixed=(box,skip,pad)=>groundTaken(box,skip,pad,true);
const groundClear=(box,skip,pad)=>groundTaken(box,skip,pad)<=0;
// The marks themselves, for a caller that has to know what it is standing on rather than only how much of
// it there is — the running head yielding its line to the title, say.
function groundStanding(box,skip,pad){
  const g=pad||0,found=[];
  for(const m of groundPast){
    if(groundSkipped(m,skip))continue;
    if(groundSpan(box.left-g,box.right+g,m.left,m.right)>0&&groundSpan(box.top-g,box.bottom+g,m.top,m.bottom)>0)found.push(m);
  }
  return found;
}
