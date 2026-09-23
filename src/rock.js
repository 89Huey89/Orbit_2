'use strict';
/* Orbit · src/rock.js
   Era I, The Rock: torchlit limestone, and every mark on it struck by a hand rather than printed. */
// This era is not a colourway of the atlas and it does not take the atlas's whole frame away either.
// It registers a hand — a small set of painters, named in `defineHand` below — and the pipeline in
// frame.js reaches for each of them by name where it would otherwise have drawn the atlas's own. What
// this file does not name, the atlas still draws, which is the difference between an era and a
// sandbox: two hands can work into one frame, and the next century is another row in that registry
// rather than another question asked at every mark.
//
// See docs/archive/eras/01-rock.md for what the era is, and docs/archive/eras/PROTOTYPES.md for what its readability
// spike proved. The spike is the porting source for the language on this sheet; none of its physics
// comes with it, because the simulation is and stays OrbitWorld.

// ---------- The pigments ----------
// The whole palette this era has, and it is short by two on purpose. There is no gold — the reddest
// ochre stands in, and is spent as sparingly as gold ever was — and there is no blue at all, so what
// the atlas says in blue this era says in its black. Charcoal and manganese are both here and are
// never mixed on one panel, exactly as a real one never mixes them: charcoal is the warmer line,
// manganese the cooler, and each panel is worked in one of them. The tooth stage below is the wall's
// own mineral speckle rather than a drawn line and is the one place both blacks sit side by side, the
// way a real face of limestone can carry both stains at once under a single figure worked in only one.
definePlate('rock',{
  night:{redOchre:'156,59,34',ochre:'201,150,46',ochreDeep:'169,112,31',manganese:'33,31,30',charcoal:'44,38,34',
    kaolin:'234,225,207',ember:'255,201,122',emberCore:'255,247,225',flare:'228,90,32',
    stone:'204,180,146',shaft:'4,3,3',dark:'2,2,2',
    ambient:'24,18,14',torchCore:'255,222,172',torchWarm:'228,178,128',torchFar:'150,100,62',
    crust:'226,204,166',scar:'210,196,166',stain:'160,120,64',crack:'46,39,33',facePale:'182,176,166',faceDeep:'90,84,80',faceIron:'196,88,56',faceOchre:'200,160,60',faceCalcite:'182,186,190',faceFlow:'222,220,214',faceDamp:'44,40,38'},
  paper:{redOchre:'156,59,34',ochre:'201,150,46',ochreDeep:'169,112,31',manganese:'33,31,30',charcoal:'44,38,34',
    kaolin:'234,225,207',ember:'255,201,122',emberCore:'255,247,225',flare:'228,90,32',
    stone:'204,180,146',shaft:'4,3,3',dark:'2,2,2',
    ambient:'24,18,14',torchCore:'255,222,172',torchWarm:'228,178,128',torchFar:'150,100,62',
    crust:'226,204,166',scar:'210,196,166',stain:'160,120,64',crack:'46,39,33',facePale:'182,176,166',faceDeep:'90,84,80',faceIron:'196,88,56',faceOchre:'200,160,60',faceCalcite:'182,186,190',faceFlow:'222,220,214',faceDamp:'44,40,38'}
});

// ---------- The tunable rows ----------
// The opening triad's reading, written down once so it can be read against the running page rather
// than buried in a conditional: the Moon for Tiro, a bright star for Adeptus, a faint star for
// Magister (01-rock.md; JOURNEY.md §9 leaves the choice itself open).
const ROCK_TRIAD={relaxed:'moon',classic:'bright',hardcore:'faint'};
// The two radii a naked eye sorts an ordinary body by, beside the triad above as the other tunable
// row. A difficultyChoice body skips this and takes ROCK_TRIAD's word for it instead.
const ROCK_TIER_BRIGHT=34,ROCK_TIER_MAJOR=46;
function rockTier(n){
  if(n.difficultyChoice)return ROCK_TRIAD[n.difficultyChoice];
  return n.r>=ROCK_TIER_MAJOR?'major':n.r>=ROCK_TIER_BRIGHT?'bright':'faint';
}
// Stage spans over the observation clock `d` (revealNode's own pen.d — see rockNode), copied from the
// spike: the hand-drawn edge, the wall's tooth coming up through the pigment, the accumulating dabs,
// and last the mark that says which body this is.
const ROCK_STAGE={edge:[.10,.46],tooth:[.26,.70],marks:[.34,.88],detail:[.70,1]};
const rockSpan=(t,r)=>clamp((t-r[0])/(r[1]-r[0]),0,1);

// ---------- The wall: height and minerals, baked once, tiled and lit by one torch ----------
// The fine relief and the grain are baked at full resolution — every one of NW*NH cells reads its own
// honest interpolation of the lattice below it — because a wall upscaled from a coarser grid is a fog,
// not a rock face; the slow fields, with no detail finer than a hand's breadth, are not, and say so
// below. Every lattice is indexed modulo its own width and height, which is the whole reason the tile
// can be drawn twice at a scroll offset with no seam ever showing.
const ROCK_NW=960,ROCK_NH=900;
const rockSS=t=>t*t*(3-2*t);
const rockStep=(lo,hi,v)=>{const t=Math.min(1,Math.max(0,(v-lo)/(hi-lo)));return t*t*(3-2*t);};
// A byte read back as a fraction is multiplied by this rather than divided by 255, a fraction stored as
// a byte is divided by it rather than multiplied, and the step above clamps rather than branching to a
// whole nought or one: the engine types an arithmetic site by what it has seen there, and a site that
// has only ever produced whole numbers is compiled as one, to be thrown away — with the whole fast pass
// around it — the first time it does not. The two are the same number: 1/(1/255) is exactly 255.
const ROCK_K=1/255;
// Which two lattice columns a pixel falls between, and how far, depends only on its x, and the four
// corner values of a cell are the same for every pixel in it — so the x weight is worked out once per
// octave across the row, and the corners once per cell per row, with the y interpolation folded into
// them; what is left per pixel is one multiply-add, which is what keeps nineteen octaves of it cheap
// beside the memory they are written into. The lattice cells are given in wall pixels whatever the
// field's own resolution, and must divide its width and height.
const rockTX=new Float32Array(ROCK_NW);
function rockOctave(arr,w,h,cx,cy,amp,seed){
  const gw=w/cx,gh=h/cy,rnd=seeded(seed),lat=new Float32Array(gw*gh);
  for(let i=0;i<lat.length;i++)lat[i]=rnd();
  for(let x=0;x<w;x++){const fx=x/cx;rockTX[x]=rockSS(fx-(fx|0))*amp;}
  for(let y=0;y<h;y++){
    const fy=y/cy,iy=fy|0,ty=rockSS(fy-iy),y0=(iy%gh)*gw,y1=((iy+1)%gh)*gw,row=y*w;
    for(let ix=0;ix<gw;ix++){
      const x1=(ix+1)%gw,a=lat[y0+ix]+(lat[y1+ix]-lat[y0+ix])*ty,b=lat[y0+x1]+(lat[y1+x1]-lat[y0+x1])*ty,aa=a*amp,dd=b-a;
      for(let x=ix*cx,xe=x+cx;x<xe;x++)arr[row+x]+=aa+dd*rockTX[x];
    }
  }
}
// Fresh memory is what this bake actually costs — every megabyte first touched is milliseconds of the
// budget, and the arithmetic is cheap beside it — so a field is built into the array it is handed, at
// the resolution that array has, and stretched to fill its own range.
function rockBuild(arr,w,h,q,specs){
  arr.fill(0);
  for(const o of specs)rockOctave(arr,w,h,o[0]/q,o[1]/q,o[2],o[3]);
  let lo=1e9,hi=-1e9;for(let i=0;i<arr.length;i++){if(arr[i]<lo)lo=arr[i];if(arr[i]>hi)hi=arr[i];}
  const k=1/(hi-lo||1);for(let i=0;i<arr.length;i++)arr[i]=(arr[i]-lo)*k;
  return arr;
}
// The slow fields — everything with no detail finer than a hand's breadth — are built at a quarter of
// the wall's resolution and read back up through it, bilinearly where a front is cut from them and by
// the nearest cell where they only tint. Which cell a wall column falls in, and how far across it, is
// hoisted per column exactly as the octaves hoist theirs.
const ROCK_Q=4,ROCK_QW=ROCK_NW/ROCK_Q,ROCK_QH=ROCK_NH/ROCK_Q,ROCK_QN=ROCK_QW*ROCK_QH;
const rockQX0=new Int32Array(ROCK_NW),rockQX1=new Int32Array(ROCK_NW),rockQTX=new Float32Array(ROCK_NW);
for(let x=0;x<ROCK_NW;x++){const fx=(x+.5)/ROCK_Q-.5,ix=Math.floor(fx);rockQTX[x]=fx-ix;rockQX0[x]=(ix+ROCK_QW)%ROCK_QW;rockQX1[x]=(ix+1)%ROCK_QW;}
// A fractal field is continuous everywhere, and a wall that is only a fractal field reads as rendered
// plaster: restless, but with nothing in it that ever breaks. What a cave wall carries over its broad
// undulation is discontinuity — a calcite crust grown over the stone behind a hard, lobed front, with a
// grain of its own; a fold that turns a corner along one long line; scales come away to fresh stone;
// hairline crazing gathered in patches; iron that changes across a line rather than fading. Two earlier
// passes struck all of that as vector shapes over the finished pixels, and both floated: a clean curve
// laid over a grainy ground reads as a wash on glass however it is filled. So every one of them is now
// a term in the height field or a threshold on a mineral field, roughened by the fine relief before it
// is cut, and the one light shades the lot. A crust that stands proud takes its lit lip and its shadow
// from the same gradient the bosses do, and its front is ragged at the grain's own scale because the
// grain is what cut it.
//
// A groove's presence laid along a short run, to be cut into the height and darkened by the passes
// below. The run may leave the tile on any side and comes back in at the other.
function rockGroove(F,x0,y0,x1,y1,w,depth){
  const dx=x1-x0,dy=y1-y0,l=dx*dx+dy*dy,reach=w+1;
  const ax=Math.floor(Math.min(x0,x1)-reach),bx=Math.ceil(Math.max(x0,x1)+reach),ay=Math.floor(Math.min(y0,y1)-reach),by=Math.ceil(Math.max(y0,y1)+reach);
  for(let y=ay;y<=by;y++){
    const row=((y%ROCK_NH+ROCK_NH)%ROCK_NH)*ROCK_NW;
    for(let x=ax;x<=bx;x++){
      const t=l?clamp(((x-x0)*dx+(y-y0)*dy)/l,0,1):0,px=x0+t*dx-x,py=y0+t*dy-y,d=Math.sqrt(px*px+py*py);
      if(d>=reach)continue;
      const i=row+(x%ROCK_NW+ROCK_NW)%ROCK_NW,f=depth*(1-d/reach)*255;if(f>F[i])F[i]=f;
    }
  }
}
// The few long fissures — a fold that broke — walked in short steps that each turn a little, so no run
// of one is straight for longer than a hand's width, and cut deeper and wider in some steps than others.
function rockFissures(F,rng){
  for(let n=0;n<3;n++){
    let x=rng()*ROCK_NW,y=rng()*ROCK_NH,a=rng()*TAU;const steps=18+((rng()*16)|0);
    for(let k=0;k<steps;k++){
      a+=(rng()-.5)*.8;const len=8+rng()*14,nx=x+Math.cos(a)*len,ny=y+Math.sin(a)*len;
      rockGroove(F,x,y,nx,ny,.4+rng()*.6,.45+rng()*.55);x=nx;y=ny;
    }
  }
}
// The crazing's cells: one jittered point in each cell of a lattice, and a hairline wherever the ground
// nearest one point meets the ground nearest another. A crack network is a partition, not a curve —
// every line in it ends on another line — which is why it is cut from cells rather than walked, and the
// lattice wraps like every other one on this wall.
const ROCK_CELL=15,ROCK_CW=ROCK_NW/ROCK_CELL,ROCK_CH=ROCK_NH/ROCK_CELL;
// The height, with every discontinuity in it, and the fronts that were cut to make them. Each front is
// a threshold on a slow field pushed about by the fine relief, so it is lobed at the relief's scale, and
// by a per-pixel hash, so it is ragged at the pixel's. The crust is a skin and stands barely proud, and
// its grain is height; a lost scale sits below the surface; a pit is only ever a shadow, and is not cut
// here at all. The large forms — the slabs, the chasms between them, the step where one stands before
// another — are not in this tile at all: they are the face's, below. Rows y0 to y1 of it; rockBakeWall
// says why a pass takes a range.
function rockHeightPass(F,y0,y1){
  const {HL,CR,SA,SZ,ST,HN,GR,RG,RM,FM,H,CM,SM}=F,NW=ROCK_NW,Q=ROCK_Q,QW=ROCK_QW,QH=ROCK_QH;
  for(let y=y0;y<y1;y++){
    const fy=(y+.5)/Q-.5,iy=Math.floor(fy),ty=fy-iy,qy0=((iy+QH)%QH)*QW,qy1=((iy+1)%QH)*QW,row=y*NW;
    for(let x=0;x<NW;x++){
      const i=row+x,x0=rockQX0[x],x1=rockQX1[x],tx=rockQTX[x],a0=qy0+x0,a1=qy0+x1,b0=qy1+x0,b1=qy1+x1;
      const hl=(HL[a0]+(HL[a1]-HL[a0])*tx)*(1-ty)+(HL[b0]+(HL[b1]-HL[b0])*tx)*ty;
      const crv=(CR[a0]+(CR[a1]-CR[a0])*tx)*(1-ty)+(CR[b0]+(CR[b1]-CR[b0])*tx)*ty;
      const sav=(SA[a0]+(SA[a1]-SA[a0])*tx)*(1-ty)+(SA[b0]+(SA[b1]-SA[b0])*tx)*ty;
      const rm=(RM[a0]+(RM[a1]-RM[a0])*tx)*(1-ty)+(RM[b0]+(RM[b1]-RM[b0])*tx)*ty;
      let h=Math.imul(x,0x9E3779B1)^Math.imul(y,0x85EBCA77);h=Math.imul(h^(h>>>15),0x2C1B3C6D);h^=h>>>13;
      const t1=(h&255)*ROCK_K-.5,hn=HN[i]*ROCK_K-.5;
      const cm=rockStep(.80,.83,crv+hn*.14+t1*.006),sm=rockStep(.78,.80,sav+hn*.2+t1*.01)*SZ[a0],th=cm*ST[a0];
      H[i]=hl+hn*.07+RG[i]*ROCK_K*.04*rm*(1-cm*.6)+cm*.003+GR[i]*ROCK_K*.011*th-sm*.006-FM[i]*ROCK_K*.006;
      CM[i]=cm/ROCK_K;SM[i]=sm/ROCK_K;
    }
  }
}
// One hairline of the crazing, at one pixel. The ground here is nearest one cell's point and next
// nearest another's, and where those two distances are all but equal is the line between the cells.
// Not every line is cut — a hash of the pair decides, far more often inside a patch than out — and no
// line is as dark as the next, or as wide along its whole length.
function rockCraze(x,y,wx,wy,hn,t2,cz,FX,FY){
  const cxi=(x/ROCK_CELL)|0,cyi=(y/ROCK_CELL)|0;
  let f1=1e9,f2=1e9,c1=0,c2=0;
  for(let oy=-1;oy<=1;oy++){
    const ky=((cyi+oy+ROCK_CH)%ROCK_CH)*ROCK_CW,by=(cyi+oy)*ROCK_CELL;
    for(let ox=-1;ox<=1;ox++){
      const k=ky+(cxi+ox+ROCK_CW)%ROCK_CW,ex=(cxi+ox)*ROCK_CELL+FX[k]*ROCK_CELL-wx,ey=by+FY[k]*ROCK_CELL-wy,dd=ex*ex+ey*ey;
      if(dd<f1){f2=f1;c2=c1;f1=dd;c1=k;}else if(dd<f2){f2=dd;c2=k;}
    }
  }
  let e=Math.imul(Math.min(c1,c2),0x27d4eb2f)^Math.imul(Math.max(c1,c2)+1,0x165667b1);e=Math.imul(e^(e>>>15),0x2C1B3C6D);e^=e>>>13;
  if((e&255)*ROCK_K>=.08+cz*.72)return 0;
  return (1-rockStep(.5,1.8,Math.sqrt(f2)-Math.sqrt(f1)+hn*.6))*(.1+((e>>>8)&255)*ROCK_K*.16+t2*.1);
}
// The light and the minerals. The lamp is above and to the right of the sheet — the torch's glow is a
// brightness the eye does not take a normal from, and a form lit from below reads inside out — so a
// surface climbing to the left or downward faces it. The per-pixel tooth is what lets ochre read on this ground at all, and is stronger in the
// crust, which is crystalline. Every colour is a plate token, mixed by weight. The crazing is cut where
// the patch field says so and in the odd lone cell besides, only as far as the nearer cell is one of
// them, so a lone fracture stops short of its full length as a fracture does.
function rockShadePass(F,y0,y1){
  const {BL,SF,ST,MP,MN,CZ,HN,GR,FM,H,CM,SM,FX,FY,FA,d,st,cu,sc,ir,mg,ck}=F,NW=ROCK_NW,NH=ROCK_NH,N=NW*NH,Q=ROCK_Q,QW=ROCK_QW,QH=ROCK_QH;
  for(let y=y0;y<y1;y++){
    const ym=((y+NH-1)%NH)*NW,yp=((y+1)%NH)*NW,row=y*NW,cyi=(y/ROCK_CELL)|0;
    const qi0=((y/Q)|0)*QW,fy=(y+.5)/Q-.5,iy=Math.floor(fy),ty=fy-iy,qy0=((iy+QH)%QH)*QW,qy1=((iy+1)%QH)*QW;
    for(let x=0;x<NW;x++){
      const i=row+x,xm=(x+NW-1)%NW,xp=(x+1)%NW,qi=qi0+((x/Q)|0),x0=rockQX0[x],x1=rockQX1[x],tx=rockQTX[x];
      const bl=(BL[qy0+x0]+(BL[qy0+x1]-BL[qy0+x0])*tx)*(1-ty)+(BL[qy1+x0]+(BL[qy1+x1]-BL[qy1+x0])*tx)*ty;
      let h=Math.imul(x,0x9E3779B1)^Math.imul(y,0x85EBCA77);h=Math.imul(h^(h>>>15),0x2C1B3C6D);h^=h>>>13;
      const t1=(h&255)*ROCK_K-.5,t2=((h>>>8)&255)*ROCK_K-.5,hn=HN[i]*ROCK_K-.5,gr=GR[i]*ROCK_K,cm=CM[i]*ROCK_K,sm=SM[i]*ROCK_K,sf=SF[qi];
      const gx=(H[row+xp]-H[row+xm])*.5,gy=(H[yp+x]-H[ym+x])*.5;
      const th=cm*ST[qi];
      const lam=Math.min(1.28,Math.max(.06,((.60*gy-.62*gx)*40+bl+cm*.03)*(1-th*(1-gr)*.16)*(1-cm*(1-cm)*.35)+t1*(.1+cm*.03)));
      const pm=rockStep(.88,.93,gr*.7+hn*.6+t1*.15)*MP[qi]*(1-cm),iron=sf*.5+rockStep(.6,.66,sf+hn*.12)*.2,mn=MN[qi]*(.6+hn*.8);
      // The line is wobbled by the fine relief, read a way off for its second axis, which is as good as
      // a second field and costs nothing.
      let craze=0;const cz=CZ[qi]*(1-cm);
      if(cz>.02||(cm<.5&&FA[cyi*ROCK_CW+((x/ROCK_CELL)|0)]))craze=rockCraze(x,y,x+hn*5,y+(HN[(i+137*NW+251)%N]*ROCK_K-.5)*5,hn,t2,cz,FX,FY)*(1-cm);
      let r=st[0],gg=st[1],b=st[2],w=iron*.7*(1-cm);r+=(ir[0]-r)*w;gg+=(ir[1]-gg)*w;b+=(ir[2]-b)*w;
      w=sm*.4*(1-cm);r+=(sc[0]-r)*w;gg+=(sc[1]-gg)*w;b+=(sc[2]-b)*w;
      w=cm*(.1+th*.28)*(.85+t2*.3)*(.75+gr*.25);r+=(cu[0]-r)*w;gg+=(cu[1]-gg)*w;b+=(cu[2]-b)*w;
      w=mn*(.4-cm*.15);r+=(mg[0]-r)*w;gg+=(mg[1]-gg)*w;b+=(mg[2]-b)*w;
      w=Math.min(1,craze+FM[i]*ROCK_K*.3+pm*.45);r+=(ck[0]-r)*w;gg+=(ck[1]-gg)*w;b+=(ck[2]-b)*w;
      const o=i*4;d[o]=Math.min(255,r*lam);d[o+1]=Math.min(255,gg*lam);d[o+2]=Math.min(255,b*lam);d[o+3]=255;
    }
  }
}
// Baked lazily on first reach rather than at load, so a player who never opens this era never pays for
// it; invalidateRockArt() below drops it, and rockBakeWall() below rebuilds it once on next reach.
let rockWall=null;
function rockBakeWall(){
  if(rockWall)return rockWall;
  const NW=ROCK_NW,NH=ROCK_NH,N=NW*NH,QW=ROCK_QW,QH=ROCK_QH;
  // The slow fields first: room-sized bulges down to a hand's breadth, kept shallow, since the slabs
  // laid over this tile are flat planes and a wall that heaves under them reads as neither; the crust,
  // run down the wall a little further than across it; the iron staining, stretched for the water that
  // ran it; the manganese; the flake scars; and where the crazing gathers.
  const q=()=>new Float32Array(ROCK_QN),Q=ROCK_Q;
  const HL=rockBuild(q(),QW,QH,Q,[[320,300,1,101],[192,180,.42,202],[120,100,.12,303],[64,60,.04,404]]);
  const CR=rockBuild(q(),QW,QH,Q,[[160,300,1,707],[64,100,.45,808]]);
  const SF=rockBuild(q(),QW,QH,Q,[[320,900,1,1010],[192,300,.4,1111]]);
  const MB=rockBuild(q(),QW,QH,Q,[[120,100,1,1414],[48,60,.55,1515]]);
  const SA=rockBuild(q(),QW,QH,Q,[[40,36,1,1818],[16,12,.35,1919]]);
  const CZ=rockBuild(q(),QW,QH,Q,[[240,300,1,2020],[96,100,.5,2121]]);
  // Where the stone is broken and where water has worn it smooth: the creases below are cut at full
  // depth in some reaches and all but polished away in others, so the wall is not one texture repeated.
  const RM=rockBuild(q(),QW,QH,Q,[[192,180,1,2222],[96,90,.4,2323]]);for(let i=0;i<ROCK_QN;i++)RM[i]=.18+rockStep(.25,.75,RM[i])*1.05;
  // The zones are decided here, once, on the slow fields: where the crazing gathers, where the wall is
  // pitted, where manganese has bloomed, how thick the crust is, and where scales have come away.
  const MP=q(),MN=q(),ST=q(),SZ=q();
  for(let i=0;i<ROCK_QN;i++){const sf=SF[i],mb=MB[i];CZ[i]=rockStep(.82,.87,CZ[i]);MP[i]=rockStep(.44,.58,mb);MN[i]=rockStep(.80,.96,mb);ST[i]=rockStep(.3,.8,sf);SZ[i]=rockStep(.34,.42,sf)*(1-rockStep(.46,.54,sf));}
  // The broad light — how the slow relief faces the lamp, read a cell either side so a fold darkens
  // as a whole and not only at its crest — is settled at the same size and read back up bilinearly,
  // because a cell of it read whole shows as a mosaic wherever the relief turns quickly.
  const BL=q();
  for(let y=0;y<QH;y++){const ym=((y+QH-1)%QH)*QW,yp=((y+1)%QH)*QW,row=y*QW;
    for(let x=0;x<QW;x++){const i=row+x,gx=(HL[row+(x+1)%QW]-HL[row+(x+QW-1)%QW])/8,gy=(HL[yp+x]-HL[ym+x])/8;BL[i]=(.60*gy-.62*gx)*38+.56+HL[i]*.32;}}
  // Then the two fine ones, which have to be full-size — the relief that roughens every front, and the
  // crust's grain — each built in the one full-size scratch and kept as bytes; the scratch then becomes
  // the height itself. Before they are built, the two passes are each run over a few rows of
  // nothing, whose every result is overwritten: a loop this size is slow until the engine has made a
  // fast version of it, and that is made in the background, so it is asked for first and the rest of
  // the bake is done while it is being made. The rows are the first with crazing in them, so that the
  // fast version has seen every branch it will meet; the bulk is then run in short calls rather than one
  // long one, because only a fresh call picks the fast version up the moment it is ready, and a call
  // already running stays slow to its end. The first bake is the one that counts.
  const S=new Float32Array(N),HN=new Uint8Array(N),GR=new Uint8Array(N),RG=new Uint8Array(N),FM=new Uint8Array(N);
  const cr=seeded(0xc4a2e),cn=ROCK_CW*ROCK_CH,FX=new Float32Array(cn),FY=new Float32Array(cn),FA=new Uint8Array(cn);
  for(let k=0;k<cn;k++){FX[k]=cr();FY[k]=cr();FA[k]=cr()<.015?1:0;}
  const c=makeCanvas(NW,NH),g=c.getContext('2d'),img=g.createImageData(NW,NH),tok=n=>ink.rock[n].split(',').map(Number);
  const F={HL,BL,CR,SF,ST,SZ,MP,MN,SA,CZ,HN,GR,RG,RM,FM,H:S,CM:new Uint8Array(N),SM:new Uint8Array(N),FX,FY,FA,d:img.data,
    st:tok('stone'),cu:tok('crust'),sc:tok('scar'),ir:tok('stain'),mg:tok('manganese'),ck:tok('crack')};
  let wy=0;for(let i=0;i<ROCK_QN;i++)if(CZ[i]>.5){wy=Math.min(NH-16,((i/QW)|0)*Q);break;}
  rockHeightPass(F,wy,wy+16);rockShadePass(F,wy,wy+16);
  rockBuild(S,NW,NH,1,[[24,20,1,505],[12,10,.3,606]]);for(let i=0;i<N;i++)HN[i]=S[i]*255;
  rockBuild(S,NW,NH,1,[[3,3,1,1616]]);for(let i=0;i<N;i++)GR[i]=S[i]*255;
  // The creases. Value noise is soft everywhere by construction — a smooth rise between every pair of
  // lattice points — and a wall made of nothing else reads as a blur however many octaves of it are
  // stacked. Stone is the opposite: it is sharp where it broke. Folding each octave about its midline
  // turns every smooth swell into a ridge with a hard crest, and four of them, from a hand's breadth
  // down to a grain, give the raking light a crisp edge to catch at every scale the eye reads rock at.
  {const T=new Float32Array(N);S.fill(0);let hi=0;
    for(const [cx,cy,amp,sd] of [[40,36,1,1717],[24,20,.6,1818],[12,12,.36,1919],[6,6,.2,2020]]){
      rockBuild(T,NW,NH,1,[[cx,cy,1,sd]]);for(let i=0;i<N;i++){const v=1-Math.abs(2*T[i]-1);S[i]+=v*v*v*amp;}}
    for(let i=0;i<N;i++)if(S[i]>hi)hi=S[i];const k=255/(hi||1);for(let i=0;i<N;i++)RG[i]=S[i]*k;}
  rockFissures(FM,seeded(0x5ca1e5));
  for(let y=0;y<NH;y+=60)rockHeightPass(F,y,y+60);
  for(let y=0;y<NH;y+=60)rockShadePass(F,y,y+60);
  g.putImageData(img,0,0);
  rockWall=c;return rockWall;
}

// ---------- The face: the fissures, and the tone of the plane they run across, in the world's own space ----------
// A rock face is a composition before it is a material, and the composition is not a partition of the
// plane. A wall that is cut into cells reads as a pavement whatever its cells are filled with — every
// cell convex, every edge shared, every junction three-way — and that was tried here and read exactly
// so. What the mockup has instead is three to five fissures in a frame: each starts somewhere, runs,
// turns, opens wide and black and closes again to nothing along its own length, branches at most once,
// and stops, mostly in the middle of a plane that goes on past it. And the tone of the plane is its own
// slow field, so a pale reach or a deep one need not end at a crack.
//
// None of it can live in the tile — a tile is one screen wide, and a layout that repeats every screen
// is the defect this sheet has been sent back for twice — so the face is laid in world coordinates: the
// plane is cut into chunks, each chunk seeds its fissures off the world's own seed, and every fissure
// within reach of the sheet is walked again, identically, whenever the sheet is rebuilt. The sheet is an
// offscreen a little taller than the screen, rebuilt only when the camera has scrolled past its margin,
// and laid over the tile as one overlay blit a frame; the tile's own grain and its broad relief show
// through all of it.
const ROCK_CHUNK=600,ROCK_REACH=1800,ROCK_FACE_UP=.34,ROCK_FACE_DOWN=.11,ROCK_TONE_Q=4,ROCK_OPENING_Y=-60,ROCK_OPENING_R=330;
function rockHash(a,b,c){let h=Math.imul(a^0x9E3779B1,0x85EBCA77)^Math.imul(b+0x27d4eb2f,0xC2B2AE3D)^Math.imul(c+0x165667b1,0x27D4EB2F);h=Math.imul(h^(h>>>15),0x2C1B3C6D);h^=h>>>13;h=Math.imul(h,0x297A2D39);h^=h>>>16;return (h>>>0)/4294967296;}
// Value noise on the world's own plane, one octave, read at a point rather than baked to a lattice. A
// bake walks this along a grid a great deal finer than most of the cells it reads (see rockBakeFace's
// material loop, where a whole reach of ≥260-unit cells moves under one column of samples at a time), so
// consecutive calls along a row overwhelmingly share one or both lattice corners with the call before
// them. `st`, when given, is that one field's running state across such a sweep — the last (ix,iy) asked
// for and the four corner hashes that came back — so a step that lands on the same cell, or slides into
// the next one along x, costs zero or two fresh rockHash calls instead of four; a jump (a new row, or the
// first call) falls back to computing all four fresh, which is always correct, just not free.
function rockWorldNoise(x,y,cell,seed,st){
  const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=rockSS(fx-ix),ty=rockSS(fy-iy);
  let a,b,c,d;
  if(st&&st.iy===iy&&st.ix===ix){a=st.a;b=st.b;c=st.c;d=st.d;}
  else if(st&&st.iy===iy&&st.ix+1===ix){a=st.b;c=st.d;b=rockHash(seed,ix+1,iy);d=rockHash(seed,ix+1,iy+1);}
  else{a=rockHash(seed,ix,iy);b=rockHash(seed,ix+1,iy);c=rockHash(seed,ix,iy+1);d=rockHash(seed,ix+1,iy+1);}
  if(st){st.ix=ix;st.iy=iy;st.a=a;st.b=b;st.c=c;st.d=d;}
  return (a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;
}
// One fissure: a walk from a point, turning a little at every step, with a width that tapers to
// nothing at both ends, closes and opens between them, and flickers from point to point so its edges
// rag as rock does. It stops at the edge of the opening plane,
// which stays uncut, unless it was placed by hand to run clear of the marks, in which case it also
// wanders less. Some carry a step — one side standing before the other — and some do not.
function rockFissureWalk(x,y,a,L,base,turn,hf,step,out,free,wobble=.6){
  const pts=[],as=[];let d=0,i=0;
  while(d<L&&i<80){
    if(!free&&Math.hypot(x,y-ROCK_OPENING_Y)<ROCK_OPENING_R)break;
    pts.push(x,y);as.push(a);a+=turn+(hf(20+i)-.5)*wobble;const st=22+hf(60+i)*10;x+=Math.cos(a)*st;y+=Math.sin(a)*st;d+=st;i++;
  }
  const n=pts.length/2;if(n<4)return null;
  const ws=[],kw=1+hf(7)*2.5,ph=hf(8)*TAU;
  for(let k=0;k<n;k++){const t=k/(n-1);ws.push(base*Math.pow(Math.sin(Math.PI*t),.5)*Math.max(.05,.35+.65*Math.sin(t*Math.PI*kw+ph))*(.8+hf(120+k)*.4));}
  const w={pts,as,ws,step};out.push(w);return w;
}
// A fissure runs whichever way the rock parted, and wanders as it goes. Both of those are the same
// correction: an opening angle held near the vertical put two cracks from one chunk on parallel courses
// and a small drift kept them there, and two parallel lines of even width read as rope rather than as
// stone. The angle is free and the drift is twice what it was.
function rockChunkFissures(seed,ci,cj,out){
  const C=ROCK_CHUNK,h=rockHash(seed+ci*7919,cj*104729,1),count=h<.45?0:h<.88?1:2;
  for(let f=0;f<count;f++){
    const hf=k=>rockHash(seed+ci*7919+f*131,cj*104729+f*17,k);
    const w=rockFissureWalk((ci+hf(2))*C,(cj+hf(3))*C,hf(4)*TAU,600+hf(5)*1000,3+hf(6)*5,(hf(11)-.5)*.16,hf,hf(9)<.6?(hf(10)<.5?1:-1):0,out);
    // A branch at most once, from a point in the middle reaches, striking off to one side and thinner.
    if(w&&hf(12)<.35){const n=w.pts.length/2,bi=Math.floor(n*(.3+hf(13)*.4)),hb=k=>hf(k+200);
      rockFissureWalk(w.pts[bi*2],w.pts[bi*2+1],w.as[bi]+(hf(14)<.5?1:-1)*(.7+hf(15)*.6),(600+hf(5)*1000)*(.3+hf(16)*.3),(3+hf(6)*5)*.6,(hf(17)-.5)*.2,hb,w.step,out);}
  }
}
let rockFaceH=null,rockFaceLayer=null,rockFace=null,rockFaceKey='',rockFaceY=0,rockFaceTop=0,rockFaceTone=null,rockFaceToneImg=null;
function rockBakeFace(camY){
  const tok=k=>ink.rock[k].split(',').map(Number),pale=tok('facePale'),ironT=tok('faceIron'),ochreT=tok('faceOchre'),calcT=tok('faceCalcite'),flowT=tok('faceFlow'),dampT=tok('faceDamp'),shaft=ink.rock.shaft,crack=ink.rock.crack,lip=ink.rock.kaolin;
  const up=H*ROCK_FACE_UP,down=H*ROCK_FACE_DOWN,sheetH=H+up+down,cw=Math.max(1,Math.ceil(W*DPR)),ch=Math.max(1,Math.ceil(sheetH*DPR));
  if(!rockFace||rockFace.width!==cw||rockFace.height!==ch)rockFace=makeCanvas(cw,ch);
  const g=rockFace.getContext('2d');g.setTransform(DPR,0,0,DPR,0,0);g.globalCompositeOperation='source-over';
  const seed=world.seed>>>0,X=x=>W*.5+x*scale,Y=y=>(y-camY)*scale+up;
  // The material of the plane, read a sample every few pixels and stretched up smooth. A wall that is
  // one stone lit one way everywhere is a texture, not a cave, however sharp its grain: what the eye
  // actually reads rock by is that it changes. So the plane has large forms — broken ridges, bosses
  // standing out of it, and in some reaches bedding planes that step down in ledges with a hard lip —
  // lit from the same lamp above and to the right as the tile, and it changes material across itself:
  // iron-red reaches, yellow ones, grey-white calcite, damp dark patches, and flowstone run down it in
  // pale smooth streaks where water came over the rock for long enough. Every field is on the world's
  // own plane and seeded off the world, so no two runs and no two screens are the same wall. The
  // opening plane is still lifted pale around the first screen, where the triad has to read before any
  // caption could, and the plane still darkens toward the sides of a wide sheet.
  const tw=Math.ceil(W/ROCK_TONE_Q),th=Math.ceil(sheetH/ROCK_TONE_Q);
  if(!rockFaceTone||rockFaceTone.width!==tw||rockFaceTone.height!==th){rockFaceTone=makeCanvas(tw,th);rockFaceToneImg=rockFaceTone.getContext('2d').createImageData(tw,th);rockFaceH=new Float32Array((tw+2)*(th+2));}
  const td=rockFaceToneImg.data,FH=rockFaceH,fw=tw+2;
  // Each of the seventeen fields below is read on a fine sweep across a cell it barely moves through —
  // every one of the fields is ≥34 world units on a side and the sweep steps by a few world units at a
  // time, so a column, and often several rows, land back in the same lattice cell as the sample before
  // it. rockWorldNoise's own hashing is cheap, but paying it 17×4 times a pixel across a whole sheet is
  // not, so the four corner hashes for each field are carried between samples by hand in plain scalars
  // (ix/iy/a/b/c/d per field, one letter set per field number) rather than through a shared object or
  // map: a sample that lands in the cell it just read costs nothing further, one that slides one cell
  // over costs two fresh hashes instead of four, and a jump — the first sample, or the start of a new
  // row — costs the full four, which is always correct, only not free. This is exactly what
  // rockWorldNoise(...,cache) already does; it is inlined here, field by field, because plain local
  // numbers stay in registers across the loop where a shared cache object's fields do not, and this loop
  // runs 17 times over every pixel of the sheet.
  let ix11=NaN,iy11=NaN,a11=0,b11=0,c11=0,d11=0,n11=0,ix12=NaN,iy12=NaN,a12=0,b12=0,c12=0,d12=0,n12=0,ix13=NaN,iy13=NaN,a13=0,b13=0,c13=0,d13=0,n13=0,ix14=NaN,iy14=NaN,a14=0,b14=0,c14=0,d14=0,n14=0,ix15=NaN,iy15=NaN,a15=0,b15=0,c15=0,d15=0,n15=0,ix16=NaN,iy16=NaN,a16=0,b16=0,c16=0,d16=0,n16=0,ix17=NaN,iy17=NaN,a17=0,b17=0,c17=0,d17=0,n17=0,ix18=NaN,iy18=NaN,a18=0,b18=0,c18=0,d18=0,n18=0,ix21=NaN,iy21=NaN,a21=0,b21=0,c21=0,d21=0,n21=0,ix22=NaN,iy22=NaN,a22=0,b22=0,c22=0,d22=0,n22=0,ix23=NaN,iy23=NaN,a23=0,b23=0,c23=0,d23=0,n23=0,ix24=NaN,iy24=NaN,a24=0,b24=0,c24=0,d24=0,n24=0,ix25=NaN,iy25=NaN,a25=0,b25=0,c25=0,d25=0,n25=0,ix26=NaN,iy26=NaN,a26=0,b26=0,c26=0,d26=0,n26=0,ix27=NaN,iy27=NaN,a27=0,b27=0,c27=0,d27=0,n27=0,ix28=NaN,iy28=NaN,a28=0,b28=0,c28=0,d28=0,n28=0,ix29=NaN,iy29=NaN,a29=0,b29=0,c29=0,d29=0,n29=0;
  const bed=(rockHash(seed,5,5)-.5)*.7,bs=Math.sin(bed),bc=Math.cos(bed),sp=64+rockHash(seed,6,6)*56;
  const wxOf=i=>((i-.5)*ROCK_TONE_Q-W*.5)/scale,wyOf=j=>camY+((j-.5)*ROCK_TONE_Q-up)/scale;
  // The height first, with a border of one sample so every sample has both neighbours to be lit from.
  for(let j=0;j<th+2;j++)for(let i=0;i<fw;i++){
    const wx=wxOf(i),wy=wyOf(j);
    {const fx=wx/380,fy=wy/380,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy11===iy&&ix11===ix){a=a11;b=b11;c=c11;d=d11;}else if(iy11===iy&&ix11+1===ix){a=b11;c=d11;b=rockHash(seed+11,ix+1,iy);d=rockHash(seed+11,ix+1,iy+1);}else{a=rockHash(seed+11,ix,iy);b=rockHash(seed+11,ix+1,iy);c=rockHash(seed+11,ix,iy+1);d=rockHash(seed+11,ix+1,iy+1);}ix11=ix;iy11=iy;a11=a;b11=b;c11=c;d11=d;n11=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}
    const r=1-Math.abs(2*n11-1);
    {const fx=wx/170,fy=wy/170,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy12===iy&&ix12===ix){a=a12;b=b12;c=c12;d=d12;}else if(iy12===iy&&ix12+1===ix){a=b12;c=d12;b=rockHash(seed+12,ix+1,iy);d=rockHash(seed+12,ix+1,iy+1);}else{a=rockHash(seed+12,ix,iy);b=rockHash(seed+12,ix+1,iy);c=rockHash(seed+12,ix,iy+1);d=rockHash(seed+12,ix+1,iy+1);}ix12=ix;iy12=iy;a12=a;b12=b;c12=c;d12=d;n12=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/75,fy=wy/75,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy13===iy&&ix13===ix){a=a13;b=b13;c=c13;d=d13;}else if(iy13===iy&&ix13+1===ix){a=b13;c=d13;b=rockHash(seed+13,ix+1,iy);d=rockHash(seed+13,ix+1,iy+1);}else{a=rockHash(seed+13,ix,iy);b=rockHash(seed+13,ix+1,iy);c=rockHash(seed+13,ix,iy+1);d=rockHash(seed+13,ix+1,iy+1);}ix13=ix;iy13=iy;a13=a;b13=b;c13=c;d13=d;n13=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/260,fy=wy/260,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy14===iy&&ix14===ix){a=a14;b=b14;c=c14;d=d14;}else if(iy14===iy&&ix14+1===ix){a=b14;c=d14;b=rockHash(seed+14,ix+1,iy);d=rockHash(seed+14,ix+1,iy+1);}else{a=rockHash(seed+14,ix,iy);b=rockHash(seed+14,ix+1,iy);c=rockHash(seed+14,ix,iy+1);d=rockHash(seed+14,ix+1,iy+1);}ix14=ix;iy14=iy;a14=a;b14=b;c14=c;d14=d;n14=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}
    let h=.5*r*r+.3*n12+.2*n13+.38*rockStep(.56,.82,n14);
    // A bedding plane: across the beds the rock climbs slowly and then drops away at the next one's lip.
    {const fx=wx/300,fy=wy/300,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy15===iy&&ix15===ix){a=a15;b=b15;c=c15;d=d15;}else if(iy15===iy&&ix15+1===ix){a=b15;c=d15;b=rockHash(seed+15,ix+1,iy);d=rockHash(seed+15,ix+1,iy+1);}else{a=rockHash(seed+15,ix,iy);b=rockHash(seed+15,ix+1,iy);c=rockHash(seed+15,ix,iy+1);d=rockHash(seed+15,ix+1,iy+1);}ix15=ix;iy15=iy;a15=a;b15=b;c15=c;d15=d;n15=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/110,fy=wy/110,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy17===iy&&ix17===ix){a=a17;b=b17;c=c17;d=d17;}else if(iy17===iy&&ix17+1===ix){a=b17;c=d17;b=rockHash(seed+17,ix+1,iy);d=rockHash(seed+17,ix+1,iy+1);}else{a=rockHash(seed+17,ix,iy);b=rockHash(seed+17,ix+1,iy);c=rockHash(seed+17,ix,iy+1);d=rockHash(seed+17,ix+1,iy+1);}ix17=ix;iy17=iy;a17=a;b17=b;c17=c;d17=d;n17=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/420,fy=wy/420,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy18===iy&&ix18===ix){a=a18;b=b18;c=c18;d=d18;}else if(iy18===iy&&ix18+1===ix){a=b18;c=d18;b=rockHash(seed+18,ix+1,iy);d=rockHash(seed+18,ix+1,iy+1);}else{a=rockHash(seed+18,ix,iy);b=rockHash(seed+18,ix+1,iy);c=rockHash(seed+18,ix,iy+1);d=rockHash(seed+18,ix+1,iy+1);}ix18=ix;iy18=iy;a18=a;b18=b;c18=c;d18=d;n18=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}
    // The beds keep one spacing: a spacing that drifted across the wall bunched them into rings, and
    // rings of ridges read as ripples on water, not strata in stone.
    const v=(-wx*bs+wy*bc+(n15-.5)*220+(n17-.5)*60)/sp,fr=v-Math.floor(v),saw=fr<.84?fr/.84:(1-fr)/.16;
    {const fx=wx/380,fy=wy/380,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy16===iy&&ix16===ix){a=a16;b=b16;c=c16;d=d16;}else if(iy16===iy&&ix16+1===ix){a=b16;c=d16;b=rockHash(seed+16,ix+1,iy);d=rockHash(seed+16,ix+1,iy+1);}else{a=rockHash(seed+16,ix,iy);b=rockHash(seed+16,ix+1,iy);c=rockHash(seed+16,ix,iy+1);d=rockHash(seed+16,ix+1,iy+1);}ix16=ix;iy16=iy;a16=a;b16=b;c16=c;d16=d;n16=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}
    h+=saw*.15*rockStep(.62,.8,n16);
    FH[j*fw+i]=h;
  }
  const d=ROCK_TONE_Q/scale,K=34/d*.5,tone=(o,c,w)=>{td[o]+=(c[0]-td[o])*w;td[o+1]+=(c[1]-td[o+1])*w;td[o+2]+=(c[2]-td[o+2])*w;};
  for(let j=0;j<th;j++)for(let i=0;i<tw;i++){
    const wx=wxOf(i+1),wy=wyOf(j+1),k=(j+1)*fw+i+1,gx=FH[k+1]-FH[k-1],gy=FH[k+fw]-FH[k-fw];
    {const fx=wx/300,fy=wy/300,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy21===iy&&ix21===ix){a=a21;b=b21;c=c21;d=d21;}else if(iy21===iy&&ix21+1===ix){a=b21;c=d21;b=rockHash(seed+21,ix+1,iy);d=rockHash(seed+21,ix+1,iy+1);}else{a=rockHash(seed+21,ix,iy);b=rockHash(seed+21,ix+1,iy);c=rockHash(seed+21,ix,iy+1);d=rockHash(seed+21,ix+1,iy+1);}ix21=ix;iy21=iy;a21=a;b21=b;c21=c;d21=d;n21=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/80,fy=wy/80,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy22===iy&&ix22===ix){a=a22;b=b22;c=c22;d=d22;}else if(iy22===iy&&ix22+1===ix){a=b22;c=d22;b=rockHash(seed+22,ix+1,iy);d=rockHash(seed+22,ix+1,iy+1);}else{a=rockHash(seed+22,ix,iy);b=rockHash(seed+22,ix+1,iy);c=rockHash(seed+22,ix,iy+1);d=rockHash(seed+22,ix+1,iy+1);}ix22=ix;iy22=iy;a22=a;b22=b;c22=c;d22=d;n22=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/340,fy=wy/340,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy27===iy&&ix27===ix){a=a27;b=b27;c=c27;d=d27;}else if(iy27===iy&&ix27+1===ix){a=b27;c=d27;b=rockHash(seed+27,ix+1,iy);d=rockHash(seed+27,ix+1,iy+1);}else{a=rockHash(seed+27,ix,iy);b=rockHash(seed+27,ix+1,iy);c=rockHash(seed+27,ix,iy+1);d=rockHash(seed+27,ix+1,iy+1);}ix27=ix;iy27=iy;a27=a;b27=b;c27=c;d27=d;n27=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/70,fy=wy/70,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy28===iy&&ix28===ix){a=a28;b=b28;c=c28;d=d28;}else if(iy28===iy&&ix28+1===ix){a=b28;c=d28;b=rockHash(seed+28,ix+1,iy);d=rockHash(seed+28,ix+1,iy+1);}else{a=rockHash(seed+28,ix,iy);b=rockHash(seed+28,ix+1,iy);c=rockHash(seed+28,ix,iy+1);d=rockHash(seed+28,ix+1,iy+1);}ix28=ix;iy28=iy;a28=a;b28=b;c28=c;d28=d;n28=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}
    const iron=rockStep(.5,.74,.75*n21+.25*n22),yel=rockStep(.52,.76,.8*n27+.2*n28);
    {const fx=wx/380,fy=wy/380,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy23===iy&&ix23===ix){a=a23;b=b23;c=c23;d=d23;}else if(iy23===iy&&ix23+1===ix){a=b23;c=d23;b=rockHash(seed+23,ix+1,iy);d=rockHash(seed+23,ix+1,iy+1);}else{a=rockHash(seed+23,ix,iy);b=rockHash(seed+23,ix+1,iy);c=rockHash(seed+23,ix,iy+1);d=rockHash(seed+23,ix+1,iy+1);}ix23=ix;iy23=iy;a23=a;b23=b;c23=c;d23=d;n23=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/60,fy=wy/60,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy29===iy&&ix29===ix){a=a29;b=b29;c=c29;d=d29;}else if(iy29===iy&&ix29+1===ix){a=b29;c=d29;b=rockHash(seed+29,ix+1,iy);d=rockHash(seed+29,ix+1,iy+1);}else{a=rockHash(seed+29,ix,iy);b=rockHash(seed+29,ix+1,iy);c=rockHash(seed+29,ix,iy+1);d=rockHash(seed+29,ix+1,iy+1);}ix29=ix;iy29=iy;a29=a;b29=b;c29=c;d29=d;n29=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/260,fy=wy/260,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy24===iy&&ix24===ix){a=a24;b=b24;c=c24;d=d24;}else if(iy24===iy&&ix24+1===ix){a=b24;c=d24;b=rockHash(seed+24,ix+1,iy);d=rockHash(seed+24,ix+1,iy+1);}else{a=rockHash(seed+24,ix,iy);b=rockHash(seed+24,ix+1,iy);c=rockHash(seed+24,ix,iy+1);d=rockHash(seed+24,ix+1,iy+1);}ix24=ix;iy24=iy;a24=a;b24=b;c24=c;d24=d;n24=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}
    const calc=rockStep(.54,.76,.8*n23+.2*n29),damp=rockStep(.58,.8,n24);
    {const fx=wx/34,fy=wy/9/34,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy25===iy&&ix25===ix){a=a25;b=b25;c=c25;d=d25;}else if(iy25===iy&&ix25+1===ix){a=b25;c=d25;b=rockHash(seed+25,ix+1,iy);d=rockHash(seed+25,ix+1,iy+1);}else{a=rockHash(seed+25,ix,iy);b=rockHash(seed+25,ix+1,iy);c=rockHash(seed+25,ix,iy+1);d=rockHash(seed+25,ix+1,iy+1);}ix25=ix;iy25=iy;a25=a;b25=b;c25=c;d25=d;n25=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}{const fx=wx/460,fy=wy/460,ix=Math.floor(fx),iy=Math.floor(fy),fxi=fx-ix,fyi=fy-iy,tx=fxi*fxi*(3-2*fxi),ty=fyi*fyi*(3-2*fyi);let a,b,c,d;if(iy26===iy&&ix26===ix){a=a26;b=b26;c=c26;d=d26;}else if(iy26===iy&&ix26+1===ix){a=b26;c=d26;b=rockHash(seed+26,ix+1,iy);d=rockHash(seed+26,ix+1,iy+1);}else{a=rockHash(seed+26,ix,iy);b=rockHash(seed+26,ix+1,iy);c=rockHash(seed+26,ix,iy+1);d=rockHash(seed+26,ix+1,iy+1);}ix26=ix;iy26=iy;a26=a;b26=b;c26=c;d26=d;n26=(a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;}
    const flow=rockStep(.6,.78,n25)*rockStep(.5,.7,n26);
    const shade=clamp(.5+(.60*gy-.62*gx)*K*(1-flow*.6)-(1-FH[k])*.08,0,1);
    const o=(j*tw+i)*4;td[o]=132;td[o+1]=126;td[o+2]=120;
    tone(o,ironT,iron*.72);tone(o,ochreT,yel*.85);tone(o,calcT,calc*.9);tone(o,flowT,flow*.45);tone(o,dampT,damp*.8);
    const sv=(shade-.5)*230;td[o]+=sv;td[o+1]+=sv;td[o+2]+=sv;
    const lift=rockStep(.42,1,1-(Math.hypot(wx,wy-ROCK_OPENING_Y)-200)/460)*.3,side=1-.4*Math.min(1,(wx/700)*(wx/700));
    for(let c=0;c<3;c++)td[o+c]=Math.max(0,Math.min(255,(td[o+c]+(pale[c]-td[o+c])*lift)*side));
    td[o+3]=255;
  }
  rockFaceTone.getContext('2d').putImageData(rockFaceToneImg,0,0);g.drawImage(rockFaceTone,0,0,W,sheetH);
  // Every fissure seeded within reach of this sheet, walked again.
  const C=ROCK_CHUNK,R=ROCK_REACH,wx0=-W*.5/scale-R,wx1=W*.5/scale+R,wy0=camY-up/scale-R,wy1=camY+(H+down)/scale+R,walks=[];
  for(let cj=Math.floor(wy0/C);cj<=Math.floor(wy1/C);cj++)for(let ci=Math.floor(wx0/C);ci<=Math.floor(wx1/C);ci++)rockChunkFissures(seed,ci,cj,walks);
  // The frontispiece is composed, not dealt: whatever the seed, two fissures frame the opening plane
  // by hand — one across the top above the triad, one across the foot below the ring — placed to run
  // clear of every mark, which is why they alone may cross the disc the seeded ones stop at.
  const hand=k=>rockHash(0x5ca1e,k,k*7+1);
  rockFissureWalk(-340,-450,.1,760,5,.01,k=>hand(k),1,walks,true,.12);
  rockFissureWalk(360,300,Math.PI+.15,640,4,-.02,k=>hand(k+300),-1,walks,true,.12);
  // The lamp is above and to the right. Where a fissure carries a step, the higher side throws its
  // shadow across the lower where the step faces away from the lamp and shows a lit lip where it faces
  // it; every fissure darkens the rock a little to both sides; and the crack itself goes dark, as wide
  // as the walk says at that reach and no wider. Shadows first, then margins, lips and cores, so no
  // fissure's soft edge lies over another's cut. Each pass is struck opaque into a layer of its own and
  // laid down once at its strength: struck straight at that strength, segment by segment, every joint
  // where two round caps overlap took the ink twice and the crack read as a string of beads.
  const LX=.707,LY=-.707;
  if(!rockFaceLayer||rockFaceLayer.width!==cw||rockFaceLayer.height!==ch)rockFaceLayer=makeCanvas(cw,ch);
  const L=rockFaceLayer.getContext('2d');
  // Every fissure is walked the full length seeded for it, out to ROCK_REACH beyond the sheet so a walk
  // that wanders toward the edge still reads as continuing past it rather than stopping dead — but most
  // of most walks, and entire walks near the reach's own far edge, project nowhere near the sheet once
  // X()/Y() places them. The four passes below all share the same geometry, so it is filtered to the
  // sheet (padded for the widest line any pass draws, plus its offset) exactly once here rather than
  // once per pass, and what does not survive that is skipped before it ever reaches a stroke call: a
  // fissure a screen and a half off to the side is real for continuity, not for ink.
  const segs=[],CULL=48;
  for(const w of walks){const n=w.pts.length/2;for(let i=0;i+1<n;i++){
    const wd=(w.ws[i]+w.ws[i+1])/2;if(wd<.12)continue;
    const x0=X(w.pts[i*2]),y0=Y(w.pts[i*2+1]),x1=X(w.pts[i*2+2]),y1=Y(w.pts[i*2+3]);
    if(Math.max(x0,x1)<-CULL||Math.min(x0,x1)>W+CULL||Math.max(y0,y1)<-CULL||Math.min(y0,y1)>sheetH+CULL)continue;
    const dx=w.pts[i*2+2]-w.pts[i*2],dy=w.pts[i*2+3]-w.pts[i*2+1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w.step,ny=dx/l*w.step,facing=nx*LX-ny*LY;
    segs.push(w,i,wd,nx,ny,facing,x0,y0,x1,y1);
  }}
  // Both the clear and the blit below used to cover the whole sheet on every one of the four passes, but
  // a pass's ink never comes close to filling it: the fissures on screen are a scatter of thin walks, not
  // a wash. So each pass first asks, of every segment it would stroke, only for the axis-aligned box that
  // stroke reaches (its endpoints, moved by this pass's own offset and widened by half its line width) and
  // unions those; then it clears and blits back only that box, not the sheet around it the pass was never
  // going to touch. The strokes themselves are laid down exactly as before — one beginPath/moveTo/lineTo/
  // stroke call per segment, in the same order, at the same width and offset — because round-capped
  // strokes overlap at every joint along a fissure, and a browser's antialiasing of many overlapping
  // partial-coverage edges compounds very slightly differently when several are batched into one stroke()
  // call versus stroked one at a time; the fissures are meant to look hand-struck, not identical to the
  // pixel between a batched and an unbatched render, so the batching was dropped and only the windowing
  // kept, which costs nothing in fidelity and is where nearly all of the saving already was (the sheet is
  // mostly untouched paper; clearing and blitting all of it back four times over was the waste).
  const spec=(fn)=>{
    const list=[];let bx0=Infinity,by0=Infinity,bx1=-Infinity,by1=-Infinity;
    for(let s=0;s<segs.length;s+=10){
      const r=fn(segs[s],segs[s+1],segs[s+2],segs[s+3],segs[s+4],segs[s+5],segs[s+6],segs[s+7],segs[s+8],segs[s+9]);
      if(!r)continue;
      const[lw,ox,oy,x0,y0,x1,y1]=r,hw=lw/2,X0=x0+ox,Y0=y0+oy,X1=x1+ox,Y1=y1+oy;
      const mnx=Math.min(X0,X1)-hw,mxx=Math.max(X0,X1)+hw,mny=Math.min(Y0,Y1)-hw,mxy=Math.max(Y0,Y1)+hw;
      if(mnx<bx0)bx0=mnx;if(mxx>bx1)bx1=mxx;if(mny<by0)by0=mny;if(mxy>by1)by1=mxy;
      list.push(lw,X0,Y0,X1,Y1);
    }
    return{list,bx0,by0,bx1,by1};
  };
  const pass=(rgb,alpha,fn)=>{
    const{list,bx0,by0,bx1,by1}=spec(fn);
    if(bx0>bx1)return;
    // Padded by 2 CSS px beyond the exact half-width box: a stroke's antialiased fringe reaches a little
    // past its geometric edge, and this keeps that fringe inside the region actually cleared and blitted.
    const px0=Math.max(0,Math.floor((bx0-2)*DPR)),py0=Math.max(0,Math.floor((by0-2)*DPR)),px1=Math.min(cw,Math.ceil((bx1+2)*DPR)),py1=Math.min(ch,Math.ceil((by1+2)*DPR)),pw=px1-px0,ph=py1-py0;
    if(pw<=0||ph<=0)return;
    L.setTransform(1,0,0,1,0,0);L.clearRect(px0,py0,pw,ph);L.setTransform(DPR,0,0,DPR,0,0);
    L.lineCap='round';L.lineJoin='round';L.strokeStyle=`rgb(${rgb})`;
    for(let k=0;k<list.length;k+=5){L.lineWidth=list[k];L.beginPath();L.moveTo(list[k+1],list[k+2]);L.lineTo(list[k+3],list[k+4]);L.stroke();}
    g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=alpha;g.drawImage(rockFaceLayer,px0,py0,pw,ph,px0,py0,pw,ph);g.restore();
  };
  pass(crack,.26,(w,i,wd,nx,ny,facing,x0,y0,x1,y1)=>{if(!w.step||facing>0)return null;return[wd*1.8+4,nx*(wd*.8+2),ny*(wd*.8+2),x0,y0,x1,y1];});
  pass(crack,.24,(w,i,wd,nx,ny,facing,x0,y0,x1,y1)=>[wd*2.4+2,0,0,x0,y0,x1,y1]);
  pass(lip,.5,(w,i,wd,nx,ny,facing,x0,y0,x1,y1)=>{if(!w.step||facing<=0||wd<1||rockHash(w.pts.length,i>>1,4)<.35)return null;return[1.3,-nx*(wd*.5+1.2),-ny*(wd*.5+1.2),x0,y0,x1,y1];});
  pass(shaft,.78,(w,i,wd,nx,ny,facing,x0,y0,x1,y1)=>[wd*.8,0,0,x0,y0,x1,y1]);
  rockFaceY=camY;rockFaceTop=up;
}
function rockPaintFace(){
  const key=W+'x'+H+'@'+DPR+'/'+scale.toFixed(4)+'#'+(world.seed>>>0),dy=(world.cameraY-rockFaceY)*scale;
  if(rockFaceKey!==key||dy<-H*ROCK_FACE_UP*.85||dy>H*ROCK_FACE_DOWN*.85){rockBakeFace(world.cameraY);rockFaceKey=key;}
  ctx.save();ctx.globalCompositeOperation='overlay';ctx.drawImage(rockFace,0,-rockFaceTop-(world.cameraY-rockFaceY)*scale,W,rockFace.height/DPR);ctx.restore();
}

// The torch is carried. A cave is a dark that one small flame is moved through, and a light pinned to
// the view reads as a lamp on a stand however warm it is made, so the pool is centred on the hand and
// the rest of the wall falls away to near black. The flame is one sprite, baked once per size; each
// frame lays it into a small light buffer over the ambient dark — a quarter of the view's resolution,
// since a light has nothing finer in it than its own falloff — and the buffer is multiplied over the
// sheet, so moving the flame costs the same as holding it still.
const ROCK_TORCH_R=560,ROCK_TORCH_Q=4,ROCK_TORCH_LAG=4.2;
let rockFlame=null,rockFlameKey='',rockLight=null,rockTorchAt=null;
function rockFlameSprite(){
  const key=ink.rock.torchCore+ink.rock.torchWarm;if(rockFlame&&rockFlameKey===key)return rockFlame;
  const S=256,c=makeCanvas(S,S),g=c.getContext('2d'),gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  // A flame's light does not fall off as a cone: it is a hot, small, near-white centre, a long even
  // warm body the wall is actually read by, and a short last shoulder into the dark.
  gr.addColorStop(0,`rgba(${ink.rock.torchCore},1)`);gr.addColorStop(.12,`rgba(${ink.rock.torchCore},.9)`);
  gr.addColorStop(.36,`rgba(${ink.rock.torchWarm},.78)`);gr.addColorStop(.66,`rgba(${ink.rock.torchFar},.34)`);
  gr.addColorStop(.86,`rgba(${ink.rock.torchFar},.08)`);gr.addColorStop(1,`rgba(${ink.rock.torchFar},0)`);
  g.fillStyle=gr;g.fillRect(0,0,S,S);
  rockFlame=c;rockFlameKey=key;return c;
}
// Where the flame is, in the world's own space: it trails the hand a little, as a torch held out does,
// and is carried by the run's own clock, so a pause stands it still and a fresh run finds it at once.
function rockTorchFollow(){
  const p=world.player;
  if(!rockTorchAt||world.time<rockTorchAt.t||world.time-rockTorchAt.t>1){rockTorchAt={x:p.x,y:p.y,t:world.time};return rockTorchAt;}
  const k=1-Math.exp(-(world.time-rockTorchAt.t)*ROCK_TORCH_LAG);
  rockTorchAt.x+=(p.x-rockTorchAt.x)*k;rockTorchAt.y+=(p.y-rockTorchAt.y)*k;rockTorchAt.t=world.time;return rockTorchAt;
}
// Three unrelated rates, so the flame never settles into a beat the eye can count; reduced motion
// holds it at its mean.
function rockFlicker(t,a,b,c){return reducedMotion?0:Math.sin(t*a)*.5+Math.sin(t*b+1.7)*.32+Math.sin(t*c+.4)*.18;}
function rockBuildLight(){
  const lw=Math.max(1,Math.ceil(W/ROCK_TORCH_Q)),lh=Math.max(1,Math.ceil(H/ROCK_TORCH_Q));
  if(!rockLight||rockLight.width!==lw||rockLight.height!==lh)rockLight=makeCanvas(lw,lh);
  const g=rockLight.getContext('2d'),at=rockTorchFollow(),t=world.time;
  g.globalCompositeOperation='source-over';g.globalAlpha=1;g.fillStyle=`rgb(${ink.rock.ambient})`;g.fillRect(0,0,lw,lh);
  const f=rockFlicker(t,8.3,13.1,21.7),sway=rockFlicker(t,2.3,3.7,5.9);
  const R=ROCK_TORCH_R*scale*(1+f*.05)/ROCK_TORCH_Q,x=(sx(at.x)+sway*4*scale)/ROCK_TORCH_Q,y=(sy(at.y)-10*scale)/ROCK_TORCH_Q;
  g.globalCompositeOperation='lighter';g.globalAlpha=.92+f*.08;g.drawImage(rockFlameSprite(),x-R,y-R,R*2,R*2);
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
// Multiplied over whatever is already on the canvas: full strength over the wall alone (drawn from
// rockAtmosphere, before a single mark is on it) and again at .42 over the whole composited frame
// (drawn from rockDark, the last of this era's own painters to run), so the wall takes the whole fall
// of the flame and the marks laid on it keep over half of their own light however far from it they
// sit — which is what lets a ring in the dark still be read.
function rockTorchPass(strength){
  if(!rockLight)rockBuildLight();
  ctx.save();ctx.globalCompositeOperation='multiply';if(strength!==undefined)ctx.globalAlpha=strength;
  ctx.imageSmoothingEnabled=true;ctx.drawImage(rockLight,0,0,W,H);ctx.restore();
}
function rockPaintWall(){
  rockBakeWall();
  // One baked sample to one device pixel, and every blit landing on a whole one. The wall's tooth is a
  // per-pixel term by construction — a hash at the mark scale, which is the scale the era's own risk
  // lives at, since red ochre survives on warm limestone by being regular against something that is not
  // — so drawing this tile at anything but its native resolution smears away exactly the detail it
  // exists to carry, and lands a wall that reads as a fog. The tile still scrolls at the world's own
  // rate: only how much wall a screen holds changes with the pixel ratio, never how fast it passes.
  const tileW=ROCK_NW/DPR,tileH=ROCK_NH/DPR,snap=v=>Math.round(v*DPR)/DPR;
  const off=((world.cameraY*scale)%tileH+tileH)%tileH;
  for(let x=0;x<W;x+=tileW)for(let y=-off;y<H;y+=tileH)ctx.drawImage(rockWall,snap(x),snap(y),tileW,tileH);
  rockPaintFace();
  rockPaintNiches();rockPaintOldHands();
}

// ---------- The niches: hollows in the face whose back can always be seen ----------
// A cave wall is not a surface with holes in it only where it is dangerous; it is full of pockets —
// dissolution hollows, spalled scoops, the dishes painters set bodies into. They are here for the rock's
// sake alone and must never be read as a drop, so they keep the rule the whole wall keeps: a hollow
// whose back can be seen is only a hollow. None holds any black. Its back is the wall's own rock a
// shade deeper; its lip on the side facing the lamp throws a hard little shadow across it, and the
// far inner wall, which faces the flame across the hollow, catches it. They are seeded off the world
// in chunks exactly as the fissures are, stay off the opening plane where the triad has to read, and
// are baked once per shape.
const ROCK_NICHE_CHUNK=380,rockNicheSprites=new Map();
function rockNicheSprite(seed,R,ax,rot){
  const Rq=Math.max(6,Math.round(R)),key=(seed>>>0)+':'+Rq+':'+DPR.toFixed(2);
  const cached=rockNicheSprites.get(key);if(cached)return cached;
  const size=Math.ceil(Rq*2*Math.max(1,ax)+12),px=Math.max(2,Math.round(size*DPR));
  const mk=()=>{const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);return {c,g};};
  const out=mk(),rnd=seeded((seed>>>0)^0x71c4||7),n=18,pts=[];
  const cr=Math.cos(rot),sr=Math.sin(rot),h1=rnd()*TAU,h2=rnd()*TAU;
  for(let i=0;i<n;i++){const a=i/n*TAU,r=Rq*(.86+Math.sin(a*2+h1)*.1+Math.sin(a*3+h2)*.07+(rnd()-.5)*.12),x=Math.cos(a)*r*ax,y=Math.sin(a)*r;pts.push([x*cr-y*sr,x*sr+y*cr]);}
  // Laid through the midpoints, so the rim of a hollow worn by water is a curve and not a cut; sampled
  // densely once, so the live light can slide the very same curve.
  const P=i=>pts[(i+n)%n],M=i=>[(P(i)[0]+P(i+1)[0])/2,(P(i)[1]+P(i+1)[1])/2],rim=[];
  for(let i=0;i<n;i++){const a=M(i-1),c=P(i),b=M(i);for(let t=0;t<1;t+=1/3)rim.push([(1-t)*(1-t)*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*c[1]+t*t*b[1]]);}
  const path=(g,ox=0,oy=0,k=1)=>{g.beginPath();g.moveTo(rim[0][0]*k+ox,rim[0][1]*k+oy);for(let i=1;i<rim.length;i++)g.lineTo(rim[i][0]*k+ox,rim[i][1]*k+oy);g.closePath();};
  const soot=ink.rock.crack;
  // The dish round it: the face turning down into the hollow, with no edge of its own.
  {const g=out.g,gr=g.createRadialGradient(0,0,Rq*.3,0,0,Rq*1.35*Math.max(1,ax));gr.addColorStop(0,`rgba(${soot},.3)`);gr.addColorStop(1,`rgba(${soot},0)`);g.fillStyle=gr;path(g,0,0,1.35);g.fill();}
  // The back: deeper toward its middle, but always the rock itself, seen.
  {const g=out.g,gr=g.createRadialGradient(0,0,0,0,0,Rq*Math.max(1,ax));gr.addColorStop(0,`rgba(${soot},.34)`);gr.addColorStop(1,`rgba(${soot},.1)`);g.fillStyle=gr;path(g);g.fill();}
  rockStoneInto(out.g,()=>path(out.g),.45,(seed%83)*5,(seed%79)*5);
  const sprite={canvas:out.c,size,rim,depth:Rq*.3};rockNicheSprites.set(key,sprite);
  if(rockNicheSprites.size>40)rockNicheSprites.delete(rockNicheSprites.keys().next().value);
  return sprite;
}
function rockPaintNiches(){
  const seed=world.seed>>>0,C=ROCK_NICHE_CHUNK,wx0=-W*.5/scale-C,wx1=W*.5/scale+C,wy0=world.cameraY-C*.5,wy1=world.cameraY+H/scale+C*.5;
  for(let cj=Math.floor(wy0/C);cj<=Math.floor(wy1/C);cj++)for(let ci=Math.floor(wx0/C);ci<=Math.floor(wx1/C);ci++){
    const h=rockHash(seed+ci*6007,cj*92821,31),count=h<.35?0:h<.8?1:2;
    for(let k=0;k<count;k++){const hf=q=>rockHash(seed+ci*6007+k*73,cj*92821+k*11,q);
      const wx=(ci+hf(2))*C,wy=(cj+hf(3))*C,R=22+hf(4)*44;if(Math.hypot(wx,wy-ROCK_OPENING_Y)<ROCK_OPENING_R+R)continue;
      const x=sx(wx),y=sy(wy),Rs=R*scale;if(x+Rs*2<0||x-Rs*2>W||y+Rs*2<0||y-Rs*2>H)continue;
      const sp=rockNicheSprite((seed^(ci*7919+cj*104729+k*31))>>>0,Rs,1+hf(5)*.9,hf(6)*TAU);
      ctx.drawImage(sp.canvas,x-sp.size/2,y-sp.size/2,sp.size,sp.size);
      ctx.save();ctx.translate(x,y);rockHollowLight(ctx,sp.rim,null,rockLightAt(x,y),sp.depth*1.3,.14,.11);ctx.restore();}
  }
}

// ---------- The four primitives, each taking the context they draw into so a hazard's own bake can
// use them exactly as the live frame does ----------
// A dab: opacity ramps in from a seeded, slightly irregular silhouette; no direction, no leading edge.
// The silhouette and its three-stop gradient are baked once per (pigment, variant) into a small sprite
// and every dab after that is one drawImage scaled to the radius wanted, globalAlpha carrying the
// alpha — the spike's own dab rebuilt a gradient and a ten-point path on every call, which is this
// project's landmine L9, and is the single thing this port must not carry across.
const ROCK_DAB_VARIANTS=8,ROCK_DAB_R=28;
const rockDabSprites=new Map();
function rockDabSprite(rgb,variant){
  const key=rgb+':'+variant+':'+DPR.toFixed(2);
  const cached=rockDabSprites.get(key);if(cached)return cached;
  const pad=4,size=(ROCK_DAB_R+pad)*2,px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const rnd=seeded((0x9e3779b1+variant*0x1000193)>>>0);
  const gr=g.createRadialGradient(0,0,0,0,0,ROCK_DAB_R);
  gr.addColorStop(0,`rgba(${rgb},1)`);gr.addColorStop(.55,`rgba(${rgb},.72)`);gr.addColorStop(1,`rgba(${rgb},0)`);
  g.fillStyle=gr;g.beginPath();
  for(let i=0;i<=9;i++){
    const t=i/9*TAU,rr=ROCK_DAB_R*(.78+rnd()*.4),x=Math.cos(t)*rr,y=Math.sin(t)*rr;
    if(i)g.lineTo(x,y);else g.moveTo(x,y);
  }
  g.closePath();g.fill();
  const sprite={canvas:c,size};rockDabSprites.set(key,sprite);
  if(rockDabSprites.size>64)rockDabSprites.delete(rockDabSprites.keys().next().value);
  return sprite;
}
function rockDab(g,x,y,r,rgb,alpha,seed){
  if(alpha<=.003||r<=.05)return;
  const sprite=rockDabSprite(rgb,(seed>>>0)%ROCK_DAB_VARIANTS);
  g.globalAlpha=alpha;g.drawImage(sprite.canvas,x-r,y-r,r*2,r*2);
}
// A wash: the palm loaded and pressed again and again — never a flat fill, always a scatter of many
// small dabs so the mark keeps a hand's own unevenness.
function rockWash(g,x,y,r,rgb,alpha,n,seed){
  const rnd=seeded((seed>>>0)||3);
  for(let i=0;i<n;i++){
    const t=rnd()*TAU,dd=Math.sqrt(rnd());
    rockDab(g,x+Math.cos(t)*dd*r,y+Math.sin(t)*dd*r,r*(.18+rnd()*.22),rgb,alpha*(.5+.5*(1-dd)),i*7+seed);
  }
}
// A flint scratch: fresh pale stone in the groove, a dark shadow thrown to one side — never a clean
// ruled line, because nothing this era cut was ruled.
function rockScratch(g,x0,y0,x1,y1,w,alpha,dash){
  g.save();g.lineCap='round';g.setLineDash(dash?[w*2.4,w*3]:[]);
  g.strokeStyle=`rgba(${ink.rock.charcoal},${alpha*.55})`;g.lineWidth=w*1.5;
  g.beginPath();g.moveTo(x0+1,y0+1.3);g.lineTo(x1+1,y1+1.3);g.stroke();
  g.strokeStyle=`rgba(${ink.rock.kaolin},${alpha*.62})`;g.lineWidth=w*.72;
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
  g.restore();
}
// A pecked hollow: stone struck with stone, a rim thrown up bright around a dark pit.
function rockPeck(g,x,y,r,alpha){
  g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle=`rgba(${ink.rock.manganese},${alpha*.85})`;g.fill();
  g.beginPath();g.arc(x-r*.32,y-r*.32,r*.62,0,TAU);g.fillStyle=`rgba(${ink.rock.kaolin},${alpha*.4})`;g.fill();
}

// ---------- A hand-walked edge, cached by shape rather than rebuilt by point ----------
// The radius breathes on a slow harmonic with noise over it, laid through the midpoints so it reads as
// a wavering line rather than a polygon — seeded off the body, so it is the same edge every frame. The
// spike rebuilt the 26-point walk on every call, twice per visible body per frame; here the walk's own
// per-angle multipliers are cached once per seed and the draw call is pure trigonometry over that
// lookup, so nothing is allocated on the hot path at all.
const rockEdgeShapes=new Map();
function rockEdgeShape(seed){
  const key=seed>>>0;
  let k=rockEdgeShapes.get(key);if(k)return k;
  const rnd=seeded(key||5),ph=rnd()*TAU,steps=26;
  k=new Float32Array(steps);
  for(let i=0;i<steps;i++){const a=i/steps*TAU;k[i]=1+Math.sin(a*2+ph)*.10+Math.sin(a*5-ph)*.06+(rnd()-.5)*.15;}
  rockEdgeShapes.set(key,k);
  if(rockEdgeShapes.size>240)rockEdgeShapes.delete(rockEdgeShapes.keys().next().value);
  return k;
}
function rockEdgePath(g,x,y,r,seed){
  const k=rockEdgeShape(seed),steps=k.length;
  // Point 0 sits at angle 0 (cos=1, sin=0), so it is just (x+r*k[0], y); no need to call either
  // trig function for it. Point[steps-1] is still needed once, to open the path at their midpoint.
  const a=(steps-1)/steps*TAU,lx=x+Math.cos(a)*r*k[steps-1],ly=y+Math.sin(a)*r*k[steps-1]*.95;
  let cx=x+r*k[0],cy=y;
  g.beginPath();g.moveTo((lx+cx)/2,(ly+cy)/2);
  for(let i=0;i<steps;i++){
    const j=(i+1)%steps,aj=j/steps*TAU,jx=x+Math.cos(aj)*r*k[j],jy=y+Math.sin(aj)*r*k[j]*.95;
    g.quadraticCurveTo(cx,cy,(cx+jx)/2,(cy+jy)/2);
    cx=jx;cy=jy;
  }
  g.closePath();
}

// ---------- The rock's own form under a body ----------
// Painters worked the rock's own bulges and hollows, giving figures modelled relief without a shaded
// stroke (01-rock.md, Grammar): a body on this sheet sits on a rise or in a dish that was there before
// any hand found it. The form is a sprite — one dome and one hollow, cached — laid under the pigment
// and lit from above and to the right exactly as the tile is, since a form lit from anywhere else reads
// as pasted on; which form a body has, or none, is read off the body's own seed.
const ROCK_RELIEF_R=48,rockReliefSprites=new Map();
function rockReliefSprite(kind){
  const key=kind+':'+DPR.toFixed(2),cached=rockReliefSprites.get(key);if(cached)return cached;
  const R=ROCK_RELIEF_R,pad=4,size=(R+pad)*2,px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const lx=.7*kind,ly=-.7*kind,lg=g.createLinearGradient(lx*R,ly*R,-lx*R,-ly*R);
  lg.addColorStop(0,`rgba(${ink.rock.kaolin},.9)`);lg.addColorStop(.5,`rgba(${ink.rock.kaolin},0)`);lg.addColorStop(1,`rgba(${ink.rock.crack},.9)`);
  g.beginPath();g.arc(0,0,R,0,TAU);g.fillStyle=lg;g.fill();
  // A foot that fades into the wall rather than a coin sitting on it.
  const rg=g.createRadialGradient(0,0,R*.35,0,0,R);rg.addColorStop(0,`rgba(${ink.rock.crack},1)`);rg.addColorStop(1,`rgba(${ink.rock.crack},0)`);
  g.globalCompositeOperation='destination-in';g.fillStyle=rg;g.fillRect(-size/2,-size/2,size,size);
  const sprite={canvas:c,size};rockReliefSprites.set(key,sprite);return sprite;
}
// Returns what the body sits on: 1 a rise, -1 a dish, 0 flat rock.
function rockRelief(n,x,y,r){
  const k=(n.seed>>>0)%10;if(k<2)return 0;
  const kind=k<6?1:-1,sprite=rockReliefSprite(kind),R=r*2*sprite.size/(ROCK_RELIEF_R*2);
  ctx.save();ctx.globalCompositeOperation='overlay';ctx.drawImage(sprite.canvas,x-R,y-R,R*2,R*2);ctx.restore();
  return kind;
}

// ---------- Pressed pigment: the mark a loaded pad or fingertip actually leaves on stone ----------
// A dab of soft gradient reads as a blur laid over the wall, and the bodies drawn that way read as
// stains. What pressed ochre leaves is the opposite: a shape with an edge, broken where the pad did not
// reach into the stone's hollows, pooled a little darker at its rim where the wet pigment ran to the
// edge and dried there, and uneven inside with the grain of the pad. So a pressed mark is baked per
// pixel into a sprite — a lobed outline, a coverage that frays at the edge on a coarse noise and a fine
// one, a density that varies inside and deepens at the rim — and laid on the wall by multiplying, so
// the rock's own relief shows through the pigment exactly as it does through a real one, with a little
// laid over the top as well so a mark far from the flame is never lost in the dark.
//
// The same bake gives the mark in stages. Every pixel is given the moment it is reached — the middle of
// the mark first, then outward, sooner or later on the pad's own grain — and a stage holds every pixel
// reached by then, so the stages only ever add, as a hand going back to the same mark only ever adds.
const ROCK_PRESS_STAGES=[.28,.52,.76,1];
function rockLattice(seed,n){const r=seeded((seed>>>0)||1),a=new Float32Array(n*n);for(let i=0;i<a.length;i++)a[i]=r();return a;}
function rockLatticeAt(a,n,x,y){const ix=Math.floor(x),iy=Math.floor(y),tx=rockSS(x-ix),ty=rockSS(y-iy),i0=((iy%n+n)%n)*n,i1=(((iy+1)%n+n)%n)*n,j0=(ix%n+n)%n,j1=((ix+1)%n+n)%n;
  return (a[i0+j0]+(a[i0+j1]-a[i0+j0])*tx)*(1-ty)+(a[i1+j0]+(a[i1+j1]-a[i1+j0])*tx)*ty;}
const rockPressSprites=new Map();
function rockPressSprite(seed,R,rgb,lobe=.12,fray=.32,holes=.8,bite=0){
  const Rq=Math.max(2,Math.round(R)),key=(seed>>>0)+':'+Rq+':'+rgb+':'+lobe+':'+fray+':'+holes+':'+bite+':'+DPR.toFixed(2);
  const cached=rockPressSprites.get(key);if(cached)return cached;
  const pad=Math.ceil(Rq*.35)+2,size=(Rq+pad)*2,px=Math.max(2,Math.round(size*DPR)),k=size/px,c0=rgb.split(',').map(Number);
  const rnd=seeded((seed>>>0)^0x6a09||3),h1=rnd()*TAU,h2=rnd()*TAU,h3=rnd()*TAU,L1=rockLattice(seed^0x1234,16),L2=rockLattice(seed^0x9876,16),L3=rockLattice(seed^0x5151,32);
  const stages=ROCK_PRESS_STAGES.map(()=>{const cv=makeCanvas(px,px),g=cv.getContext('2d');return {cv,g,img:g.createImageData(px,px)};});
  for(let j=0;j<px;j++)for(let i=0;i<px;i++){
    const dx=(i+.5)*k-size/2,dy=(j+.5)*k-size/2,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
    const edge=Rq*(1+lobe*(Math.sin(a*2+h1)*.55+Math.sin(a*3+h2)*.3+Math.sin(a*5+h3)*.15));
    const n1=rockLatticeAt(L1,16,dx/Rq*2.2+8,dy/Rq*2.2+8),n2=rockLatticeAt(L2,16,dx/Rq*6+8,dy/Rq*6+8);
    let hh=Math.imul(i+1,0x9E3779B1)^Math.imul(j+7,0x85EBCA77)^(seed|0);hh=Math.imul(hh^(hh>>>15),0x2C1B3C6D);hh^=hh>>>13;const h=(hh&1023)/1023;
    // A crescent is the same press with a second disc bitten out of it, offset toward the upper right.
    let d=(edge-r)/Rq;if(bite)d=Math.min(d,(Math.hypot(dx-Rq*bite*.62,dy+Rq*bite*.46)-Rq*.86)/Rq);
    d+=(n1-.5)*fray+(n2-.5)*fray*.45+(h-.5)*.05;if(d<=0)continue;
    const cover=Math.min(1,d*14),order=Math.min(1,Math.max(0,(1-d)*.55+n1*.45)),rim=Math.exp(-d*9);
    // Where the pad met a hollow in the stone it left little or nothing, in patches a grain or two across.
    const u=(dx*.8+dy*.6)/Rq*9+(n1-.5)*2.4,v=(dy*.8-dx*.6)/Rq*9+(n2-.5)*2.4,n3=rockLatticeAt(L3,32,u+16,v+16)*.6+rockLatticeAt(L1,16,u*1.7+3,v*1.7+5)*.4;
    const skip=1-rockStep(.62,.74,n3)*holes;
    const dens=Math.min(1,(.64+.34*n2+(h-.5)*.24)*(1+.4*rim)*skip);
    for(let s=0;s<stages.length;s++){const f=ROCK_PRESS_STAGES[s];if(order>f)continue;
      const reach=Math.min(1,(f-order)*9),o=(j*px+i)*4,D=stages[s].img.data;
      D[o]=c0[0]*(1-rim*.18);D[o+1]=c0[1]*(1-rim*.22);D[o+2]=c0[2]*(1-rim*.25);D[o+3]=255*cover*dens*reach;}
  }
  const sprite={size,stages:stages.map(st=>{st.g.putImageData(st.img,0,0);return st.cv;})};
  rockPressSprites.set(key,sprite);if(rockPressSprites.size>48)rockPressSprites.delete(rockPressSprites.keys().next().value);
  return sprite;
}
// Lay a pressed mark at a fill between nought and one: the two baked stages either side of it, the
// later coming in over the earlier. Dark pigments are multiplied into the stone and a share laid over
// it; a pale one — kaolin — cannot be multiplied into anything, and is laid straight.
function rockPress(g,x,y,sprite,fill,alpha,pale,over=.3){
  if(alpha<=.003||fill<=0)return;
  const S=ROCK_PRESS_STAGES,sz=sprite.size;let lo=-1;for(let s=0;s<S.length;s++)if(S[s]<=fill)lo=s;
  const hi=Math.min(S.length-1,lo+1),t=lo<0?fill/S[0]:hi===lo?1:(fill-S[lo])/(S[hi]-S[lo]);
  const lay=(cv,al)=>{if(al<=.003)return;if(pale){g.globalCompositeOperation='screen';g.globalAlpha=al*.7;g.drawImage(cv,x-sz/2,y-sz/2,sz,sz);g.globalCompositeOperation='source-over';g.globalAlpha=al*.45;g.drawImage(cv,x-sz/2,y-sz/2,sz,sz);return;}
    g.globalCompositeOperation='multiply';g.globalAlpha=al;g.drawImage(cv,x-sz/2,y-sz/2,sz,sz);
    g.globalCompositeOperation='source-over';g.globalAlpha=al*over;g.drawImage(cv,x-sz/2,y-sz/2,sz,sz);};
  g.save();
  if(lo>=0)lay(sprite.stages[lo],alpha*(hi===lo?1:1));
  if(hi!==lo)lay(sprite.stages[hi],alpha*t);
  g.restore();
}
// A fingertip dot: the same pressed mark, small, in a handful of seeded shapes per pigment.
function rockDot(g,x,y,r,rgb,alpha,seed,pale){
  if(r<=.3)return;const sp=rockPressSprite(((seed>>>0)%6)+1,Math.max(3,Math.round(r)),rgb,.14,.2,0);
  const sc=r/Math.max(3,Math.round(r));g.save();g.translate(x,y);g.scale(sc,sc);rockPress(g,0,0,sp,1,alpha,pale,rgb===ink.rock.ochre?.62:.34);g.restore();
}

// ---------- The body: what has been learned, staged over the observation clock alone ----------
// This era has no secure evidence of telling a planet from a star, and no script to name either; what
// it does have is a small set of attested marks that later prehistoric walls use for lights in the
// sky, and the bodies are drawn in those. A star is the Iberian schematic estrelliform — a pressed dot
// with short strokes rayed out round it; a brighter light is the soliform and the cup-and-ring — a
// larger disc with a ring walked round it and rays beyond; and the Moon is a crescent with a row of
// tally notches beside it, after the notched horn of Laussel and the pitted plaque of Blanchard, the
// oldest things anyone has proposed as a count of the Moon. None of those readings is certain, and the
// wall claims no more than the marks: they say "a light, watched and returned to", which is the whole
// of what this era could know. Each is a real mark in real pigment, and at its middle, once the watch
// is complete, the light itself shows through: the one thing on the body no hand put there.
function rockCore(r,tier){return r*(tier==='moon'?.94:tier==='faint'?.6:.72);}
function rockTone(tier){return tier==='moon'?ink.rock.kaolin:tier==='faint'?ink.rock.ochre:ink.rock.redOchre;}
// A finger stroke: the same pressed dot laid again and again along a line, thinning as the finger
// lifts, so a ray has the pigment's own edge and grain rather than a ruled line's. `f` is how far along
// it the finger has got.
function rockStroke(g,x0,y0,x1,y1,w,rgb,alpha,seed,f=1,pale){
  if(f<=0)return;const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.ceil(L/(w*.7))),m=Math.max(1,Math.round(n*f));
  for(let i=0;i<=m&&i<=n;i++){const t=i/n;rockDot(g,x0+(x1-x0)*t,y0+(y1-y0)*t,w*(1-t*.55),rgb,alpha,seed+i,pale);}
}
// The light at the middle of a body whose watch is complete: warm, small, breathing, laid as light.
function rockGlint(g,r,alpha,seed){
  const pulse=.8+.2*(reducedMotion?0:Math.sin(world.time*2.1+seed));
  g.save();g.globalCompositeOperation='lighter';rockDab(g,0,0,r*2.6,ink.rock.ember,.22*alpha*pulse,seed);rockDab(g,0,0,r,ink.rock.emberCore,.9*alpha*pulse,seed+1);g.restore();
}
// `taken` is revealNode's own pen.taken — 0 until the body has ever been orbited, then a fast fade to 1
// — except a difficultyChoice body, which the design already draws whole before it is observed (see
// reveal.js's own comment on pen.d): the choice has to read before any caption could, on a sheet that
// has none, so its taken-ness is never gated at all.
//
// Built in the era's own order: the first press at the capture itself, ungated — colour before
// contour; then over the observation the rest of the sign, ray by ray, round the ring, notch by notch,
// each only ever added to; and last the light. Wet pigment pools in a dish and starves over a rise.
function rockBody(n,x,y,r,tier,d,taken,relief){
  if(taken<=0)return;
  const cr=rockCore(r,tier)/scale,tone=rockTone(tier),moon=tier==='moon',bright=tier==='bright'||tier==='major';
  const pool=relief<0?1.08:relief>0?.9:1,edge=rockSpan(d,ROCK_STAGE.edge),marks=rockSpan(d,ROCK_STAGE.marks),detail=rockSpan(d,ROCK_STAGE.detail);
  const al=taken*pool,rnd=seeded((n.seed^0x7e57)>>>0||11);
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  if(moon){
    // A crescent, horns to the upper right, and beside it a tally that counts up as the Moon is watched.
    const sp=rockPressSprite(n.seed,cr*.8,tone,.05,.2,.3,1);
    rockPress(ctx,-cr*.12,0,sp,Math.min(1,.55+.45*Math.max(edge,marks)),al,true);
    const N=7,shown=marks*N;
    for(let i=0;i<N&&i<shown;i++){const tx=cr*.62+i*cr*.17,ty=cr*.12+(rnd()-.5)*cr*.08,len=cr*(.34+rnd()*.1);
      rockStroke(ctx,tx,ty-len/2,tx+(rnd()-.5)*3,ty+len/2,1.35,ink.rock.kaolin,.85*al,n.seed+i*31,Math.min(1,shown-i),true);}
    if(detail>0)ctx.save(),ctx.translate(-cr*.42,-cr*.08),rockGlint(ctx,3.2,detail*taken,n.seed),ctx.restore();
  }else{
    const disc=bright?cr*.5:cr*.36,rays=bright?(tier==='major'?12:10):7,r0=bright?cr*.86:cr*.56,r1=bright?cr*1.32:cr*1.08,w=bright?2.1:1.8;
    rockPress(ctx,0,0,rockPressSprite(n.seed,disc,tone,.1,.26,.6),Math.min(1,.45+.55*Math.max(edge,marks)),al,false,tier==='faint'?.55:.34);
    // The ring of the cup-and-ring, walked round the disc as the edge firms; a major light takes two.
    if(bright){const rings=tier==='major'?[.66,.76]:[.68];
      for(const k of rings){const R=cr*k,N=Math.round(TAU*R/3.4),m=Math.round(N*edge);
        for(let i=0;i<m;i++){const a=i/N*TAU+n.seed*.1;rockDot(ctx,Math.cos(a)*R,Math.sin(a)*R,1.9,tone,.9*al,n.seed+i+200);}}}
    // The rays, struck one after another as the hand comes back, each a little off true.
    const shown=marks*rays;
    for(let i=0;i<rays&&i<shown;i++){const a=i/rays*TAU+(n.seed%97)*.07+(rnd()-.5)*.22,a0=r0*(.95+rnd()*.1),a1=r1*(.78+rnd()*.34);
      rockStroke(ctx,Math.cos(a)*a0,Math.sin(a)*a0,Math.cos(a)*a1,Math.sin(a)*a1,w,tone,.92*al,n.seed+i*37,Math.min(1,shown-i));}
    if(detail>0)rockGlint(ctx,bright?3.4:2.6,detail*taken,n.seed);
  }
  ctx.restore();
}
// A body not yet reached is not a mark at all but the light alone, before any hand has answered it:
// the same point that shows at the middle of a finished sign, breathing on the rock and seen however
// dark the rock is, with a faint cross of light on it at the size a naked eye would sort it by.
function rockPhenomenon(n,x,y,r){
  const t=reducedMotion?0:world.time,pulse=.62+.28*Math.sin(t/.6+n.seed),tier=rockTier(n),k=tier==='faint'?.75:tier==='moon'?1.15:1;
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  rockGlint(ctx,2.8*k,pulse,n.seed);
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${ink.rock.ember},${(.28*pulse).toFixed(3)})`;ctx.lineWidth=1;ctx.lineCap='round';
  const L=9*k;ctx.beginPath();ctx.moveTo(-L,0);ctx.lineTo(L,0);ctx.moveTo(0,-L);ctx.lineTo(0,L);ctx.stroke();
  ctx.restore();
}

// ---------- The ring: where an observation is possible, structurally unchanged while it is made ----------
// 28 pressed dots at the node's own capture radius, never staged wider or narrower and never re-seeded, so the
// same 28 dots sit in the same 28 places every frame; only a caller-supplied state scales their size
// and alpha uniformly. The one exception is the completion cue below, a single brief change of state.
const ROCK_RING_N=28,ROCK_FLOURISH_DUR=.64;
// Stamped by rockFlourish (this era's `flourish` painter) on the crossing into a full observation, kept
// on this side rather than on the simulation node; read here and pruned by age once the map grows past
// a small bound, so a run that finishes many bodies never grows this without limit.
const rockFlourishAt=new Map();
function rockFlourish(n){
  rockFlourishAt.set(n,world.time);
  if(rockFlourishAt.size>40)for(const [key,at] of rockFlourishAt)if(world.time-at>ROCK_FLOURISH_DUR)rockFlourishAt.delete(key);
}
function rockRing(n,x,y,cap,state){
  for(let i=0;i<ROCK_RING_N;i++){
    const a=i/ROCK_RING_N*TAU;
    rockDot(ctx,x+Math.cos(a)*cap,y+Math.sin(a)*cap,2.6*Math.max(.55,state)*scale,ink.rock.redOchre,.95*state,n.seed+i);
  }
  const at=rockFlourishAt.get(n);if(at===undefined)return;
  const seal=clamp(1-(world.time-at)/ROCK_FLOURISH_DUR,0,1);if(seal<=0)return;
  const glow=seal*seal;
  // The 28 dots drawing together into one struck line, and a little dust lifting off it, for 640ms.
  ctx.save();ctx.strokeStyle=`rgba(${ink.rock.kaolin},${.42*glow})`;ctx.lineWidth=(1.3+2.4*glow)*scale;
  ctx.beginPath();ctx.arc(x,y,cap,0,TAU);ctx.stroke();ctx.restore();
  for(let i=0;i<10;i++){
    const a=i/10*TAU+n.seed,lift=cap+(6+(1-seal)*16)*scale;
    rockDab(ctx,x+Math.cos(a)*lift,y+Math.sin(a)*lift,2.6*glow*scale,ink.rock.kaolin,.4*glow,n.seed+i+500);
  }
}

// ---------- The release marks: the same information the atlas draws, in this era's own hand ----------
// A hand does not react to an instant, it arrives at a mark it can already see. Geometry only, taken
// from the shipped code exactly as drawNode reads it — releaseTargets, orbitTangents, segmentCircle
// and the real p.rad — not from the spike's own 144-sample sweep and hazard test.
function rockReleaseMarks(n,p,x,y){
  const rad=p.rad*scale;
  ctx.save();ctx.translate(x,y);
  for(const next of releaseTargets(n)){
    const dist=Math.hypot(next.x-n.x,next.y-n.y);
    const a=Math.atan2(next.y-n.y,next.x-n.x)-p.dir*Math.acos(clamp(p.rad/dist,-1,1));
    const window=Math.asin(clamp(next.cap/dist,0,.8));
    // A row of pressed ochre dabs along the arc that connects.
    const ROWS=6;
    for(let i=0;i<=ROWS;i++){
      const wa=a-window+2*window*(i/ROWS);
      rockDot(ctx,Math.cos(wa)*rad,Math.sin(wa)*rad,2*scale,ink.rock.ochre,.9,n.seed+i*17+3);
    }
    // One struck deeper — kaolin over manganese — at the middle of each run that actually threads clear
    // of every hazard; a run with none is left with only the row above, so danger reads as an absence.
    for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
      if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
      const mx=Math.cos(path.angle)*rad,my=Math.sin(path.angle)*rad;
      rockDot(ctx,mx,my,4.2*scale,ink.rock.manganese,.9,n.seed+900);
      rockDot(ctx,mx,my,2.6*scale,ink.rock.kaolin,.95,n.seed+901,true);
    }
  }
  ctx.restore();
}

// ---------- The node: ring, body or phenomenon, and the release marks while it is held ----------
function rockNode(n,aim){
  const pen=revealNode(n);if(pen.t<=0)return;
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=!!(aim&&aim.n.id===n.id);
  const x=sx(n.x),y=sy(n.y),cap=n.cap*scale,bodyR=n.r*scale;
  if(y<-cap*2-60||y>H+cap*2+60)return;
  const tier=rockTier(n);
  const state=active?1:target?1:used?.24:.6;
  ctx.save();
  const relief=rockRelief(n,x,y,bodyR);
  rockRing(n,x,y,cap,state);
  if(n.difficultyChoice||pen.taken>0)rockBody(n,x,y,bodyR,tier,pen.d,n.difficultyChoice?1:pen.taken,relief);
  else rockPhenomenon(n,x,y,bodyR);
  if(active)rockReleaseMarks(n,p,x,y);
  ctx.restore();
}

// ---------- The hazards ----------
// Two things the holes share. The rock of a throat is the wall's own rock, not a painted gradient —
// drawn as a smooth fall of tone alone it read as clay — so the wall's tile is laid into it over the
// fall of the light, one sample to one device pixel as the wall itself is laid, and its creases run on
// down into the dark. And a lip is not an outline: the face breaks over the edge in pieces, and only
// the pieces that face the lamp catch it, so the lit edge is struck in broken lengths along the side
// that faces the flame and nowhere else; the rest of the edge is told by the shade alone.
function rockStoneInto(g,path,alpha,ox=0,oy=0){
  if(!g.createPattern)return;let pat=null;
  try{pat=g.createPattern(rockBakeWall(),'repeat');if(pat&&pat.setTransform&&typeof DOMMatrix==='function')pat.setTransform(new DOMMatrix([1/DPR,0,0,1/DPR,ox,oy]));}catch(e){pat=null;}
  if(!pat)return;g.save();path();g.clip();g.globalCompositeOperation='overlay';g.globalAlpha=alpha;g.fillStyle=pat;g.fillRect(-4000,-4000,8000,8000);g.restore();
}
// The flame as a feature at (x,y) on screen sees it: the unit direction from the flame to the feature,
// how long a shadow its rim throws — short with the flame close over it, lengthening as the flame draws
// off and its light comes across the wall lower — and how strongly it is lit at all.
function rockLightAt(x,y){
  const at=rockTorchAt||world.player,tx=sx(at.x),ty=sy(at.y)-10*scale;let dx=x-tx,dy=y-ty;const d=Math.hypot(dx,dy)||1;
  return {dx:dx/d,dy:dy/d,reach:.35+.65*d/(d+170*scale),fall:clamp(1-d/(ROCK_TORCH_R*scale),0,1)};
}
// A hollow shaded live from the flame, so its shadow turns as the flame is carried past it: the lip
// nearest the flame throws a shadow down into it, and the far inner wall, facing the flame across the
// hollow, is lit. Each is the hollow less the hollow slid along the light, laid several times at
// widening slides for a penumbra. `rim` and `core` are closed rings of [x,y] in the current space; a
// core is left untouched, because it is the black and nothing lights it.
function rockHollowLight(g,rim,core,L,depth,shade=.13,lift=.1){
  // What makes an opening read as cut rather than stained is three things a stain never has: a hard
  // shadow thrown by the near lip down across the inside, walls whose grain runs down into it (baked,
  // see the flutes in the sprites), and an edge that is an edge — the top of the far wall catching the
  // flame in a thin bright line, the near edge dark where it turns away. The shadow here is one crisp
  // shape with a narrow penumbra either side, not a soft stack of washes.
  const ring=(pts,ox,oy)=>{g.moveTo(pts[0][0]+ox,pts[0][1]+oy);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0]+ox,pts[i][1]+oy);g.closePath();};
  const o=depth*L.reach;
  g.save();g.beginPath();ring(rim,0,0);if(core)ring(core,0,0);g.clip('evenodd');
  g.globalCompositeOperation='multiply';
  for(const [f,a] of [[.82,.16],[1,.62*shade/.13],[1.16,.16]]){g.beginPath();g.rect(-4000,-4000,8000,8000);ring(rim,L.dx*o*f,L.dy*o*f);g.fillStyle=`rgba(40,32,26,${Math.min(.8,a).toFixed(3)})`;g.fill('evenodd');}
  g.globalCompositeOperation='screen';
  g.beginPath();g.rect(-4000,-4000,8000,8000);ring(rim,-L.dx*o*.5,-L.dy*o*.5);g.fillStyle=`rgba(${ink.rock.torchWarm},${(lift*.3*(.45+.55*L.fall)).toFixed(3)})`;g.fill('evenodd');
  g.restore();
  rockRimEdges(g,rim,L);
}
// The rim as an edge, one segment at a time, by which way its own outward face turns from the flame.
function rockRimEdges(g,pts,L){
  const n=pts.length;let area=0;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];area+=a[0]*b[1]-b[0]*a[1];}const sg=area>0?1:-1;
  g.save();g.lineCap='round';
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],ex=b[0]-a[0],ey=b[1]-a[1],l=Math.hypot(ex,ey)||1,nx=ey/l*sg,ny=-ex/l*sg,f=nx*L.dx+ny*L.dy;
    if(f>.08){g.globalCompositeOperation='screen';g.strokeStyle=`rgba(${ink.rock.torchWarm},${(.42*f*(.35+.65*L.fall)).toFixed(3)})`;g.lineWidth=1.1;}
    else if(f<-.08){g.globalCompositeOperation='multiply';g.strokeStyle=`rgba(30,24,20,${(.45*-f).toFixed(3)})`;g.lineWidth=1;}
    else continue;
    g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
  g.restore();
}
// `pts` is the edge as a closed ring of [x,y]; (LX,LY) points toward the lamp. A piece is lit as far as
// its outward face turns away from the lamp — the far side of a hollow faces the flame across it.
function rockBrokenLip(g,pts,LX,LY,rnd,rgb,alpha){
  const n=pts.length;let cx=0,cy=0;for(const p of pts){cx+=p[0];cy+=p[1];}cx/=n;cy/=n;g.save();g.lineCap='round';
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],mx=(a[0]+b[0])/2-cx,my=(a[1]+b[1])/2-cy,l=Math.hypot(mx,my)||1,face=-(mx*LX+my*LY)/l;
    if(face<.2||rnd()<.4)continue;const f0=rnd()*.35,f1=f0+.2+rnd()*.35;
    g.strokeStyle=`rgba(${rgb},${(alpha*Math.min(1,face*1.2)*(.5+rnd()*.5)).toFixed(3)})`;g.lineWidth=.7+rnd()*.7;
    g.beginPath();g.moveTo(a[0]+(b[0]-a[0])*f0,a[1]+(b[1]-a[1])*f0);g.lineTo(a[0]+(b[0]-a[0])*f1,a[1]+(b[1]-a[1])*f1);g.stroke();}
  g.restore();
}
// The Shaft: a hole in the wall that goes down, and the one place on this sheet the rock opens rather
// than being marked. It is drawn as a hole is seen by one light: a jagged mouth broken out of the face,
// its lip catching the lamp on the side that faces it; inside, the throat stepping down in darker and
// darker shelves, shifted toward the lamp as they go deeper, so the far inner wall — the one that faces
// the flame — is lit in a crescent and the near one falls into its own shadow; and at the bottom of it
// a black with no floor at all. That black is exactly the lethal core and no wider, because the one
// thing a hole must never do is lie about where the fall begins; what the pull reaches is the soot and
// the broken rock around the mouth, and the grit going over the edge. The rule the whole wall keeps is
// that a hollow whose back can be seen is only a hollow, and only this has none. Nothing turns: it is
// a drop, not a whirlpool. The mouth, the shelves and the cracks are baked once per hazard and size.
const rockShaftSprites=new Map();
function rockShaftSprite(seed,reach,core){
  const rB=Math.max(2,Math.round(reach)),cB=Math.max(1,Math.round(core)),key=(seed>>>0)+':'+rB+':'+cB+':'+DPR.toFixed(2);
  const cached=rockShaftSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil(rB*2.2)),px=Math.max(1,Math.round(size*DPR));
  // Two layers, not one picture: the shade is multiplied into the wall that is really there, so the
  // rock's own creases run on down into the hole and darken with its depth — a throat painted as a
  // picture of rock, however good, sat on the wall like a sticker — and only the floorless core is
  // laid as itself, opaque, because it is the one thing here that is not rock.
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const cc=makeCanvas(px,px),gc=cc.getContext('2d');gc.scale(DPR,DPR);gc.translate(size/2,size/2);
  // The mouth breaks in straight facets at uneven angles, and only ever outward of the core, so the
  // black it holds is never narrower than the fall it stands for.
  const rnd=seeded((seed>>>0)^0x5aa7||9),rim=cB*1.85,n=17,jag=[],ang=[];
  for(let i=0;i<n;i++){ang.push((i+(rnd()-.5)*.55)/n*TAU);jag.push(1+Math.pow(rnd(),1.4)*.3+Math.abs(Math.sin(i/n*TAU*2+seed%7))*.1);}
  const ring=(r,ox,oy)=>ang.map((a,k)=>{const rr=r*(1+(jag[k]-1)*Math.min(1,r/rim+.25));return [ox+Math.cos(a)*rr,oy+Math.sin(a)*rr];});
  const mouth=(r,ox,oy)=>{const p=ring(r,ox,oy);g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();};
  const rgb=t=>ink.rock[t].split(',').map(Number),stone=rgb('stone'),dark=rgb('shaft'),soot=ink.rock.crack,warm=stone.map((v,i)=>(v+rgb('stain')[i])/2);
  // Nothing darkens the face round the mouth: a band of soot or slope drawn there read as a raised
  // rim throwing its shadow on the rock below it. The face runs unchanged to the edge and breaks.
  // The rock broke along lines out from the mouth before it fell in.
  g.lineCap='round';g.strokeStyle=`rgba(${soot},.7)`;
  for(let k=0;k<7;k++){let a=rnd()*TAU,r=rim*.95,x=Math.cos(a)*r,y=Math.sin(a)*r;const L=rim*(.5+rnd()*1.1);g.lineWidth=1.6;g.beginPath();g.moveTo(x,y);
    for(let d=0;d<L;d+=5){a+=(rnd()-.5)*.7;x+=Math.cos(a)*5;y+=Math.sin(a)*5;g.lineTo(x,y);g.lineWidth*=.9;}g.stroke();}
  // The throat: a smooth fall of the rock into the dark, a little smaller and darker at every depth, with
  // a few ledges where it broke in steps, told as a step down in the light rather than a line round it —
  // a line round every shelf read as a contour map of a hole. Which wall of it the flame reaches is laid
  // on live, over this, by rockHollowLight.
  const layers=64,ledge=new Set([12+(rnd()*8|0),29+(rnd()*8|0),45+(rnd()*7|0)]);let step=1;
  for(let k=0;k<=layers;k++){
    if(ledge.has(k))step*=.74;
    // The inner wall just under the lip is already a step darker than the face: the edge of a hole is
    // a break, and a throat that shaded in from nothing put its visible edge inside its real one, so the
    // lip's line and its shadow landed on what looked like the face outside it.
    const t=k/layers,r=rim+(cB-rim)*Math.pow(t,.8),lit=.7-.58*(1-Math.pow(1-t,1.3)*step);
    g.fillStyle=`rgb(${Math.round(255*lit)},${Math.round(244*lit)},${Math.round(228*lit)})`;mouth(r,0,0);g.fill();
  }
  // The walls' own grain, running down: flutes from the lip toward the black, a few broken strata
  // across them. Grain that runs across the face and on inside, as the wall's own did, read as a stain.
  g.lineCap='round';
  {const N=Math.round(TAU*rim/2.2),jagAt=a=>{let k=0,best=9;for(let i=0;i<n;i++){const d=Math.abs(((ang[i]-a)%TAU+TAU+Math.PI)%TAU-Math.PI);if(d<best){best=d;k=i;}}return jag[k];};
    for(let i=0;i<N;i++){const a=(i+(rnd()-.5)*.9)/N*TAU,j=jagAt(a),r0=rim*(1+(j-1)*.9)*(.9+rnd()*.09),r1=rnd()<.45?r0+(cB-r0)*(.3+rnd()*.4):cB*(1.02+rnd()*.25),v=.45+rnd()*.4;
      g.strokeStyle=`rgba(${Math.round(255*v)},${Math.round(240*v)},${Math.round(222*v)},${(.18+rnd()*.3).toFixed(3)})`;g.lineWidth=.5+rnd()*rnd()*2.2;
      g.beginPath();g.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);g.lineTo(Math.cos(a+(rnd()-.5)*.05)*r1,Math.sin(a+(rnd()-.5)*.05)*r1);g.stroke();}
    for(let k=0;k<3;k++){const r=rim+(cB-rim)*(.25+k*.22+rnd()*.06);if(g.setLineDash)g.setLineDash([6+rnd()*14,3+rnd()*8,2+rnd()*6,5+rnd()*9]);
      g.strokeStyle='rgba(120,100,82,.55)';g.lineWidth=1.1;mouth(r,0,0);g.stroke();}
    if(g.setLineDash)g.setLineDash([]);}
  // The floorless black, exactly the core and centred on it.
  gc.fillStyle=`rgb(${ink.rock.shaft})`;{const p=ring(cB,0,0);gc.beginPath();gc.moveTo(p[0][0],p[0][1]);for(const q of p)gc.lineTo(q[0],q[1]);gc.closePath();gc.fill();}
  const deep=gc.createRadialGradient(0,0,0,0,0,cB);deep.addColorStop(0,`rgba(${ink.rock.dark},1)`);deep.addColorStop(1,`rgba(${ink.rock.dark},0)`);
  gc.fillStyle=deep;gc.fill();
  const sprite={canvas:c,core:cc,size,rim,rimPts:ring(rim,0,0),corePts:ring(cB,0,0),cB,seed};rockShaftSprites.set(key,sprite);
  if(rockShaftSprites.size>16)rockShaftSprites.delete(rockShaftSprites.keys().next().value);
  return sprite;
}
function rockShaft(h,x,y){
  const reach=gravityRadius(h)*scale,core=hazardCore(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const sprite=rockShaftSprite(h.seed||1,reach,core);
  ctx.save();ctx.globalCompositeOperation='multiply';ctx.drawImage(sprite.canvas,x-sprite.size/2,y-sprite.size/2,sprite.size,sprite.size);ctx.restore();
  ctx.drawImage(sprite.core,x-sprite.size/2,y-sprite.size/2,sprite.size,sprite.size);
  {const L=rockLightAt(x,y);ctx.save();ctx.translate(x,y);rockHollowLight(ctx,sprite.rimPts,sprite.corePts,L,sprite.cB*.7,.13,.17);ctx.restore();}
  // Grit going over the edge: each grain slides in from the loosened face, shrinks and goes dark as it
  // drops, and is gone at the black. Reduced motion leaves a few grains lying on the slope.
  // A dab leaves the context's alpha where it set it, so the grit is struck inside its own save.
  const t=reducedMotion?0:world.time,cx=x,cy=y;ctx.save();
  for(let i=0;i<14;i++){
    const ph=((i*.618+t*(.35+(i%5)*.07))%1+1)%1,a=i*2.399+(h.phase||0),r0=sprite.rim*(1.05+(i%3)*.12),r=r0+(core*.5-r0)*ph*ph;
    const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r,k=1-ph;
    rockDab(ctx,px,py,(1.1+(i%3)*.5)*scale*(.4+.6*k),ph>.5?ink.rock.charcoal:ink.rock.stain,.7*k,i+(h.seed>>>0));
  }
  ctx.restore();
}
// The Flare: a fire burning in a hollow of the rock. What the atlas calls a flare is, on a cave wall, a
// hearth — the one thing down here that pushes a hand away. It is drawn as fire is seen by the eye in
// the dark: a bed of embers exactly the size of the lethal core, tongues of flame licking up off it
// (always up the screen, as flame rises whatever way the wall is climbed), sparks lifting off the
// tips, the rock above it blackened with soot where centuries of such fires stood, and the face all
// round warmed by its light as far as its push reaches. Its colours are deliberately not the torch's:
// the torch is the pale, near-white flame; this is the deep red-orange of a fire burning down.
function rockFlare(h,x,y){
  const core=hazardCore(h)*scale,reach=gravityRadius(h)*scale;
  if(x+reach<0||x-reach>W||y+reach*2<0||y-reach>H)return;
  const t=reducedMotion?0:world.time,ph=h.phase||0,seed=h.seed>>>0;
  ctx.save();
  // Soot: the rock above blackened in a plume, broad and uneven.
  ctx.globalCompositeOperation='multiply';
  const sg=ctx.createRadialGradient(x,y-core*1.6,core*.3,x,y-core*1.4,reach*1.1);sg.addColorStop(0,'rgba(40,30,24,.55)');sg.addColorStop(1,'rgba(40,30,24,0)');
  ctx.fillStyle=sg;ctx.beginPath();ctx.ellipse(x,y-core*1.3,reach*.75,reach*1.05,0,0,TAU);ctx.fill();
  // The warmth it throws on the face, out to where its push ends.
  ctx.globalCompositeOperation='lighter';
  const fl=1+(reducedMotion?0:Math.sin(t*9+ph)*.06+Math.sin(t*13.7+ph*2)*.04);
  const wg=ctx.createRadialGradient(x,y,core*.4,x,y,reach*fl);wg.addColorStop(0,`rgba(${ink.rock.flare},.45)`);wg.addColorStop(.5,`rgba(${ink.rock.flare},.14)`);wg.addColorStop(1,`rgba(${ink.rock.flare},0)`);
  ctx.fillStyle=wg;ctx.beginPath();ctx.arc(x,y,reach*fl,0,TAU);ctx.fill();
  // The ember bed: the lethal core, glowing and breaking into coals.
  ctx.globalCompositeOperation='source-over';
  const eg=ctx.createRadialGradient(x,y,0,x,y,core);eg.addColorStop(0,'rgba(255,200,110,.95)');eg.addColorStop(.5,`rgba(${ink.rock.flare},.8)`);eg.addColorStop(1,`rgba(${ink.rock.flare},0)`);
  ctx.fillStyle=eg;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
  const r=seeded(seed^0xfe||1);ctx.globalCompositeOperation='multiply';
  for(let i=0;i<9;i++){const a=r()*TAU,d=Math.sqrt(r())*core*.8,k=.5+.5*Math.sin(t*3+i*2.1);ctx.fillStyle=`rgba(90,24,8,${(.18+.12*k).toFixed(2)})`;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d,core*(.16+r()*.12),core*(.1+r()*.08),r()*3,0,TAU);ctx.fill();}
  // The flames: tongues rising off the bed, each swaying and flickering on its own clock.
  ctx.globalCompositeOperation='lighter';
  const n=9;
  for(let i=0;i<n;i++){
    const u=(i/(n-1)-.5),bx=x+u*core*1.7,hgt=core*(1.8+1.8*(1-Math.abs(u)*1.7))*(.75+.3*Math.sin(t*(6+i)+ph+i*1.7)),w=core*(.4-Math.abs(u)*.14),sw=Math.sin(t*(3.1+i*.4)+i+ph)*core*.28;
    const tipx=bx+sw,tipy=y-core*.2-hgt;
    const fg=ctx.createLinearGradient(bx,y,tipx,tipy);fg.addColorStop(0,'rgba(255,214,130,.6)');fg.addColorStop(.35,'rgba(255,150,60,.45)');fg.addColorStop(.7,`rgba(${ink.rock.flare},.28)`);fg.addColorStop(1,'rgba(160,40,12,0)');
    // Each tongue is rooted in the embers with a rounded foot, never cut off on a line.
    const by=y+core*.25;ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(bx-w,by);
    ctx.bezierCurveTo(bx-w*1.2,y-hgt*.4,tipx-w*.5+sw*.3,tipy+hgt*.35,tipx,tipy);
    ctx.bezierCurveTo(tipx+w*.5+sw*.3,tipy+hgt*.35,bx+w*1.2,y-hgt*.4,bx+w,by);
    ctx.quadraticCurveTo(bx,by+w*.9,bx-w,by);ctx.closePath();ctx.fill();
  }
  // The heart of the fire over the roots of the flames, so tongue and bed are one light.
  const hg=ctx.createRadialGradient(x,y-core*.3,0,x,y-core*.3,core*1.3);hg.addColorStop(0,'rgba(255,220,150,.55)');hg.addColorStop(1,'rgba(255,160,70,0)');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(x,y-core*.3,core*1.3,0,TAU);ctx.fill();
  // Sparks lifting off the tips and dying as they climb.
  for(let i=0;i<10;i++){const k=((i*.618+t*(.5+(i%4)*.12))%1+1)%1,sx0=x+(((i*.37)%1)-.5)*core*1.4+Math.sin(t*2+i)*core*.3*k,sy0=y-core-k*reach*.9;
    ctx.fillStyle=`rgba(255,${Math.round(200-80*k)},100,${(.85*(1-k)).toFixed(3)})`;ctx.beginPath();ctx.arc(sx0,sy0,Math.max(.6,1.4*scale*(1-k*.6)),0,TAU);ctx.fill();}
  ctx.restore();
}
// The Draught: moving air made visible the only way a cave shows it — smoke. Soft grey ribbons stream
// through its reach along the way it blows, each rising and falling on its own slow wave, thickest at
// the middle of the current and fraying at its edges; and on the rock under them, the finger flutings
// of an older hand run the same way, as though whoever made them had felt the same draught.
function rockDraught(h,x,y){
  const reach=gravityRadius(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const t=reducedMotion?0:world.time,seed=h.seed>>>0,r=seeded(seed||1);
  ctx.save();ctx.translate(x,y);ctx.rotate(h.dir||0);
  // Flutings under it: three fingers drawn through the soft film, along the wind.
  ctx.globalCompositeOperation='multiply';ctx.lineCap='round';
  for(let f=0;f<3;f++){const off=(f-1)*5*scale+(r()-.5)*reach*.6;ctx.strokeStyle='rgba(90,72,56,.35)';ctx.lineWidth=2.4*scale;ctx.beginPath();
    for(let k=0;k<=12;k++){const u=(k/12-.5)*reach*1.5;k?ctx.lineTo(u,off+Math.sin(k*.6+f)*3*scale):ctx.moveTo(u,off);}ctx.stroke();}
  // Smoke ribbons streaming along +x.
  ctx.globalCompositeOperation='source-over';
  const lanes=6;
  for(let i=0;i<lanes;i++){
    const lane=(i/(lanes-1)-.5)*reach*1.1,thick=(1-Math.abs(i/(lanes-1)-.5)*1.4)*reach*.16,speed=.6+r()*.5,ph=r()*TAU;
    const grd=ctx.createLinearGradient(-reach*1.1,0,reach*1.1,0);grd.addColorStop(0,'rgba(190,180,168,0)');grd.addColorStop(.3,'rgba(190,180,168,.22)');grd.addColorStop(.7,'rgba(190,180,168,.18)');grd.addColorStop(1,'rgba(190,180,168,0)');
    ctx.fillStyle=grd;ctx.beginPath();
    const N=18,top=[],bot=[];
    for(let k=0;k<=N;k++){const u=(k/N-.5)*reach*2.2,wv=Math.sin(u/reach*3+t*speed*2.4+ph)*reach*.08,wv2=Math.sin(u/reach*5.3-t*speed*1.7+ph*2)*thick*.5;top.push([u,lane+wv-thick*.5+wv2]);bot.push([u,lane+wv+thick*.5-wv2*.6]);}
    ctx.moveTo(top[0][0],top[0][1]);for(const q of top)ctx.lineTo(q[0],q[1]);for(let k=bot.length-1;k>=0;k--)ctx.lineTo(bot[k][0],bot[k][1]);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}
// Unlit rock: the one hazard this era depicts with total fidelity. Nothing drawn at all.
function rockHazard(h){
  if(h.kind==='nebula')return;
  const x=sx(h.x),y=sy(h.y);
  if(h.kind==='wind')return rockDraught(h,x,y);
  if(h.kind==='flare')return rockFlare(h,x,y);
  return rockShaft(h,x,y);
}
// The chasm: a long crack in the wall that goes down, kept in world.chasms's own array rather than a
// row of the hazard table (see simulation.js), since it carries no field at all — only a lethal capsule.
// It is drawn in the Shaft's own language, because it is the same kind of thing stretched: the black
// with no floor is the capsule exactly — a crack must no more lie about where the fall begins than a
// hole may — and everything round it is rock falling into it. Across its length the wall on the far
// side, the one facing the lamp, is lit as it drops in ledges and the near side falls into its own
// shade; the lip breaks over lit where it faces the flame, soot and short cracks run off it into the
// face, and grit slides over the edge along it. Baked once per chasm and size in its own frame, along
// the crack, and laid rotated to it.
const rockChasmSprites=new Map();
function rockChasmSprite(h,L,w){
  const Lq=Math.max(4,Math.round(L)),wq=Math.max(2,Math.round(w*2)/2),key=(h.seed>>>0)+':'+Lq+':'+wq+':'+DPR.toFixed(2);
  const cached=rockChasmSprites.get(key);if(cached)return cached;
  const ang=Math.atan2(h.y1-h.y0,h.x1-h.x0),padX=wq*3.2,padY=wq*3.4,SW=Lq+padX*2,SH=padY*2;
  // Shade multiplied into the real wall, core laid opaque: see rockShaftSprite.
  const c=makeCanvas(Math.max(1,Math.round(SW*DPR)),Math.max(1,Math.round(SH*DPR))),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(SW/2,SH/2);
  const cc=makeCanvas(c.width,c.height),gc=cc.getContext('2d');gc.scale(DPR,DPR);gc.translate(SW/2,SH/2);
  const rnd=seeded((h.seed>>>0)^0xc4a5||13);
  const rgb=t=>ink.rock[t].split(',').map(Number),stone=rgb('stone'),dark=rgb('shaft'),soot=ink.rock.crack,warm=stone.map((v,i)=>(v+rgb('stain')[i])/2);
  // Rock breaks in facets, so each side of the crack is a run of straight breaks at uneven spacing, and
  // it is only ever broken outward: the black may stand a little wider than the capsule the fall is
  // tested against, never narrower, so where it looks safe it is.
  const J=Math.max(8,Math.round(Lq/(wq*1.1))),side=()=>{const a=[];for(let i=0;i<=J;i++)a.push(Math.pow(rnd(),1.6)*.42+(rnd()<.12?.25:0));return a;};
  const jt=side(),jb=side(),jag=(arr,x)=>{const f=(x/Lq+.5)*J,i=Math.max(0,Math.min(J-1,Math.floor(f)));return arr[i]+(arr[i+1]-arr[i])*(f-i);};
  // The crack's outline at a width `k` times its own, shifted by (ox,oy): two ragged sides joined by
  // ragged round ends, so it is the capsule at k of one and the throat widening from it beyond that.
  const ringAt=(k,T=jt,B=jb)=>{const H=Lq/2,rr=wq*k,p=[];
    for(let i=0;i<=J;i++)p.push([-H+Lq*i/J,-rr*(1+T[i]*k*k*.6)]);
    for(let i=1;i<6;i++){const a=-Math.PI/2+Math.PI*i/6;p.push([H+Math.cos(a)*rr*(1+(T[J]+B[J])/2),Math.sin(a)*rr*(1+(T[J]+B[J])/2)]);}
    for(let i=J;i>=0;i--)p.push([-H+Lq*i/J,rr*(1+B[i]*k*k*.6)]);
    for(let i=1;i<6;i++){const a=Math.PI/2+Math.PI*i/6;p.push([-H+Math.cos(a)*rr*(1+(T[0]+B[0])/2),Math.sin(a)*rr*(1+(T[0]+B[0])/2)]);}
    return p;};
  const outline=(k,ox=0,oy=0)=>{const p=ringAt(k);g.beginPath();g.moveTo(p[0][0]+ox,p[0][1]+oy);for(let i=1;i<p.length;i++)g.lineTo(p[i][0]+ox,p[i][1]+oy);g.closePath();};
  // No band of soot round it: see rockShaftSprite — the face runs unchanged to the edge and breaks.
  // Short cracks struck off the lip into the face where the rock gave.
  g.lineCap='round';g.strokeStyle=`rgba(${soot},.65)`;
  for(let k=0;k<Math.max(3,Math.round(Lq/40));k++){const side=rnd()<.5?-1:1;let x=(rnd()-.5)*Lq*.9,y=side*wq*1.85,a=side*Math.PI/2+(rnd()-.5)*1.2;g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);
    for(let d=0,Lc=wq*(1.2+rnd()*2.2);d<Lc;d+=4){a+=(rnd()-.5)*.6;x+=Math.cos(a)*4;y+=Math.sin(a)*4;g.lineTo(x,y);g.lineWidth*=.88;}g.stroke();}
  // The throat: the rock falling away from the lip to the black, with a few ledges where it broke in
  // steps; which wall of it takes the flame is laid on live.
  const layers=64,ledge=new Set([15+(rnd()*9|0),37+(rnd()*9|0)]);let step=1;
  for(let k=0;k<=layers;k++){
    if(ledge.has(k))step*=.74;
    const t=k/layers,kk=1.9+(1-1.9)*Math.pow(t,.8),lit=.7-.58*(1-Math.pow(1-t,1.2)*step);
    g.fillStyle=`rgb(${Math.round(255*lit)},${Math.round(244*lit)},${Math.round(228*lit)})`;outline(kk);g.fill();
  }
  // The walls' grain, running down into the crack from both lips toward the black.
  g.lineCap='round';
  {const R=ringAt(1.9),C=ringAt(1),top=R.slice(0,J+1),bot=R.slice(J+6,J+6+J+1).reverse(),ctop=C.slice(0,J+1),cbot=C.slice(J+6,J+6+J+1).reverse(),M=Math.round(Lq/1.1);
    const at=(arr,x)=>{const f=(x/Lq+.5)*J,i=Math.max(0,Math.min(J-1,Math.floor(f))),t=f-i;return arr[i][1]+(arr[i+1][1]-arr[i][1])*t;};
    for(let i=0;i<M;i++){const x=-Lq/2+Lq*rnd(),v=.45+rnd()*.4;g.strokeStyle=`rgba(${Math.round(255*v)},${Math.round(240*v)},${Math.round(222*v)},${(.14+rnd()*.26).toFixed(3)})`;g.lineWidth=.4+rnd()*rnd()*2;
      const side=rnd()<.5?1:-1,ya=(side<0?at(top,x):at(bot,x))*(.86+rnd()*.12),yb=(side<0?at(ctop,x):at(cbot,x))*(1.02+rnd()*.2),y1=rnd()<.4?ya+(yb-ya)*(.3+rnd()*.4):yb;g.beginPath();g.moveTo(x,ya);g.lineTo(x+(rnd()-.5)*3,y1);g.stroke();}
    for(let k=0;k<2;k++){const kk=1.9-(.9)*(.3+k*.35);if(g.setLineDash)g.setLineDash([8+rnd()*16,4+rnd()*8,3+rnd()*6,6+rnd()*10]);g.strokeStyle='rgba(120,100,82,.55)';g.lineWidth=1.1;outline(kk);g.stroke();}
    if(g.setLineDash)g.setLineDash([]);}
  // The floorless black, which is the capsule the simulation tests and nothing more.
  {const p=ringAt(1);gc.fillStyle=`rgb(${ink.rock.shaft})`;gc.beginPath();gc.moveTo(p[0][0],p[0][1]);for(const q of p)gc.lineTo(q[0],q[1]);gc.closePath();gc.fill();}
  const sprite={canvas:c,core:cc,SW,SH,ang,rimPts:ringAt(1.9),corePts:ringAt(1),wq};rockChasmSprites.set(key,sprite);
  if(rockChasmSprites.size>12)rockChasmSprites.delete(rockChasmSprites.keys().next().value);
  return sprite;
}
function rockChasm(h){
  const x0=sx(h.x0),y0=sy(h.y0),x1=sx(h.x1),y1=sy(h.y1),w=h.w*scale,m=w*3.4;
  if(Math.max(x0,x1)+m<0||Math.min(x0,x1)-m>W||Math.max(y0,y1)+m<0||Math.min(y0,y1)-m>H)return;
  const L=Math.hypot(x1-x0,y1-y0),sp=rockChasmSprite(h,L,w),ang=Math.atan2(y1-y0,x1-x0),mx=(x0+x1)/2,my=(y0+y1)/2;
  ctx.save();ctx.translate(mx,my);ctx.rotate(ang);ctx.globalCompositeOperation='multiply';ctx.drawImage(sp.canvas,-sp.SW/2,-sp.SH/2,sp.SW,sp.SH);ctx.globalCompositeOperation='source-over';ctx.drawImage(sp.core,-sp.SW/2,-sp.SH/2,sp.SW,sp.SH);
  // The light along a crack is not one direction: its near end may have the flame beside it and its far
  // end below it. It is taken from the flame to the crack's nearest point, which is where the eye is
  // looking, and turned into the crack's own frame.
  {const tp=rockTorchAt||world.player,tx=sx(tp.x),ty=sy(tp.y),ex=x1-x0,ey=y1-y0,u=clamp(((tx-x0)*ex+(ty-y0)*ey)/(L*L||1),0,1);
    const Lw=rockLightAt(x0+ex*u,y0+ey*u),ca=Math.cos(-ang),sa=Math.sin(-ang),Ll={dx:Lw.dx*ca-Lw.dy*sa,dy:Lw.dx*sa+Lw.dy*ca,reach:Lw.reach,fall:Lw.fall};
    rockHollowLight(ctx,sp.rimPts,sp.corePts,Ll,sp.wq*.75,.13,.17);}
  // Grit going over the lip along the crack's length, dropping and darkening into the black.
  const t=reducedMotion?0:world.time,n=Math.max(6,Math.round(L/26));
  for(let i=0;i<n;i++){const ph=((i*.618+t*(.3+(i%4)*.08))%1+1)%1,side=i%2?1:-1,x=((i*.3819)%1-.5)*L*.92,y=side*w*(1.8-ph*ph*1.5);
    rockDab(ctx,x,y,(1+(i%3)*.45)*scale*(1-ph*.5),ph>.5?ink.rock.charcoal:ink.rock.stain,.7*(1-ph),i+(h.seed>>>0));}
  ctx.restore();
}

// ---------- The trail: a finger of wet ochre dragged across the stone ----------
// Not a row of dots and not a pen's line: the mark a loaded finger leaves as it is drawn along the
// rock — one continuous stroke, widest and wettest just behind the hand, drying and thinning back along
// the way it came until it is a dry scrape and gone. It is built as one ribbon (a polygon whose two
// sides are the path offset by the stroke's half-width at every sample), so it never breaks into beads
// where pieces overlap, then laid into the wall by multiplying, so the rock's grain runs through it,
// with a thin darker ridge along one edge where the pigment was pushed.
function rockTrail(){
  const tr=world.trail;if(tr.length<2)return;
  const pts=[];for(let i=0;i<tr.length;i++){const s=tr[i],life=clamp(1-(world.time-s.time)/TRAIL_LIFE,0,1);if(life<=0)continue;pts.push({x:sx(s.x),y:sy(s.y),life});}
  const p=world.player;if(world.state!=='dead')pts.push({x:sx(p.x),y:sy(p.y),life:1});
  if(pts.length<2)return;
  const L=[],R=[],E=[];
  for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
    const t=pts[i].life,w=(1.6+4*t*t)*scale*(.85+.3*Math.sin(i*.7)),q=pts[i];L.push([q.x+nx*w,q.y+ny*w]);R.push([q.x-nx*w,q.y-ny*w]);E.push([q.x+nx*w*.8,q.y+ny*w*.8,t]);}
  const ribbon=()=>{ctx.beginPath();ctx.moveTo(L[0][0],L[0][1]);for(let i=1;i<L.length;i++)ctx.lineTo(L[i][0],L[i][1]);for(let i=R.length-1;i>=0;i--)ctx.lineTo(R[i][0],R[i][1]);ctx.closePath();};
  const head=pts[pts.length-1],tail=pts[0],gr=ctx.createLinearGradient(tail.x,tail.y,head.x,head.y);
  gr.addColorStop(0,`rgba(${ink.rock.redOchre},.25)`);gr.addColorStop(.45,`rgba(${ink.rock.redOchre},.8)`);gr.addColorStop(1,`rgba(${ink.rock.redOchre},1)`);
  // Laid twice into the stone, so the pigment is dense enough to read on the darkest rock the flame reaches.
  ctx.save();ctx.globalCompositeOperation='multiply';ribbon();ctx.fillStyle=gr;ctx.fill();ctx.fill();
  // The wet part catches the flame a little, where it is still fresh.
  ctx.globalCompositeOperation='source-over';const gw=ctx.createLinearGradient(tail.x,tail.y,head.x,head.y);
  gw.addColorStop(0,`rgba(${ink.rock.ochre},0)`);gw.addColorStop(.7,`rgba(${ink.rock.ochre},.08)`);gw.addColorStop(1,`rgba(${ink.rock.ember},.28)`);ribbon();ctx.fillStyle=gw;ctx.fill();
  // The ridge the finger pushed up along one side.
  ctx.globalCompositeOperation='multiply';ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(.7,.9*scale);
  const gr2=ctx.createLinearGradient(tail.x,tail.y,head.x,head.y);gr2.addColorStop(0,`rgba(${ink.rock.charcoal},.25)`);gr2.addColorStop(1,`rgba(${ink.rock.charcoal},.75)`);
  ctx.strokeStyle=gr2;ctx.beginPath();ctx.moveTo(E[0][0],E[0][1]);for(let i=1;i<E.length;i++)ctx.lineTo(E[i][0],E[i][1]);ctx.stroke();
  ctx.restore();
}

// The route already flown, once the finger's ochre has dried: a thin, dry scrape of it along the whole
// way, laid into the rock by multiplying and breaking where the stone's tooth lifted the pigment — read
// off the path's own length, so it breaks in the same places every frame and scrolls with the wall.
function rockInkPath(){
  const P=world.inkPath;if(P.length<2)return;
  ctx.save();ctx.globalCompositeOperation='multiply';ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=`rgba(${ink.rock.redOchre},.6)`;ctx.lineWidth=Math.max(1.2,2.6*scale);
  let d=0,on=true;ctx.beginPath();ctx.moveTo(sx(P[0].x),sy(P[0].y));
  for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];d+=Math.hypot(b.x-a.x,b.y-a.y);
    const next=rockWorldNoise(d,0,14,(world.seed>>>0)^0x71)>.28;
    if(next&&!on)ctx.moveTo(sx(a.x),sy(a.y));if(next)ctx.lineTo(sx(b.x),sy(b.y));on=next;}
  ctx.stroke();ctx.restore();
}

// ---------- The guide: where the hand means to go, blown in ochre ----------
// Not a pricked line: a row of fingertip dots pressed ahead along the course, close and full near the
// hand and smaller and further apart as they reach — the way a sprayed line thins with distance from
// the mouth — so it reads as one intention and not a dashed rule. Warned courses (a rim that would turn
// the flight away, a hazard in the way) go dark in manganese; past where the ochre would run out the
// dots are only ghosts; and a clean landing is promised by a pale kaolin dot at the rim it would meet.
function rockAim(aim,preview){
  const p=world.player,points=preview.points,warn=preview.blocked||aim?.steep,end=points[points.length-1];
  // Pale kaolin, the one pigment that reads on every patch of this wall lit or dark; manganese black
  // for a course that is warned against.
  const col=warn?ink.rock.manganese:ink.rock.kaolin,alpha=warn?.85:aim?.95:.7,pale=!warn;
  const dryFrom=preview.inkRange>=0&&end.distance>0?clamp(preview.inkRange/end.distance,0,1):1;
  const P=points.map(q=>[sx(q.x),sy(q.y)]);
  const lens=[0];for(let i=1;i<P.length;i++)lens.push(lens[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const total=lens[lens.length-1];if(total<2)return;
  const at=d=>{let i=1;while(i<P.length-1&&lens[i]<d)i++;const t=(d-lens[i-1])/((lens[i]-lens[i-1])||1);return [P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t];};
  const breathe=14*scale+(reducedMotion?0:(world.time*18*scale)%(9*scale));
  ctx.save();
  for(let d=breathe,k=0;d<total;k++){const f=d/total,q=at(d),r=(aim?3.4:2.8)*(1-.45*f)*scale,dry=f>dryFrom;
    rockDot(ctx,q[0],q[1],r,dry?ink.rock.stone:col,alpha*(dry?.3:1)*(1-f*.3),k*7+3,pale&&!dry);
    d+=(7+f*9)*scale;}
  if(aim?.perfect&&!preview.fogged){const x=sx(aim.cx+Math.cos(aim.entryAngle)*aim.radius),y=sy(aim.cy+Math.sin(aim.entryAngle)*aim.radius);
    rockDot(ctx,x,y,3.6*scale,ink.rock.kaolin,.95,901,true);}
  ctx.restore();
}

// ---------- The traveller: not the crayon, the point on it actually touching the wall ----------
// A lump of ground haematite worked to a blunt contact point, held point-first — no vane, no
// aerodynamic taper, because nothing about mined stone needs to look like it is flying. Baked once,
// since it is one tool rather than a body keyed by seed, and rotated live to the heading of travel.
let rockCrayon=null,rockCrayonKey='';
// A stick of haematite a finger long, knapped to a blunt faceted point at the working end and worn
// round at the other: the shape Blombos's ochre crayons are found in. Drawn along local +x (the tip
// leads), lit from above, with the facets of the point catching light and the rest of the lump dark,
// grained stone — dead weight around the one point that touches the wall.
function rockCrayonSprite(){
  const key=DPR.toFixed(2);if(rockCrayon&&rockCrayonKey===key)return rockCrayon;
  const L=34,Wd=10,pad=6,size=(L+pad)*2,px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const rnd=seeded(4051),out=[];
  // The outline: a worn round butt, two slightly uneven flanks, and a knapped point in three facets.
  const tip=L*.5,butt=-L*.5;
  out.push([tip,0],[tip-5,-Wd*.28],[tip-10,-Wd*.46]);for(let i=0;i<=6;i++){const t=i/6;out.push([tip-10-(L-14)*t,-Wd*.5*(1+(rnd()-.5)*.12)]);}
  for(let i=0;i<=8;i++){const a=-Math.PI/2-i/8*Math.PI;out.push([butt+4+Math.cos(a)*4.2,Math.sin(a)*Wd*.5]);}
  for(let i=6;i>=0;i--){const t=i/6;out.push([tip-10-(L-14)*t,Wd*.5*(1+(rnd()-.5)*.12)]);}
  out.push([tip-10,Wd*.46],[tip-5,Wd*.3]);
  const path=()=>{g.beginPath();g.moveTo(out[0][0],out[0][1]);for(const p of out)g.lineTo(p[0],p[1]);g.closePath();};
  const gr=g.createLinearGradient(0,-Wd*.5,0,Wd*.5);gr.addColorStop(0,`rgb(${ink.rock.ochre})`);gr.addColorStop(.35,`rgb(${ink.rock.redOchre})`);gr.addColorStop(1,'rgb(70,26,14)');
  path();g.fillStyle=gr;g.fill();
  // Grain of the stone and the scratches of grinding, along the stick.
  g.save();path();g.clip();for(let i=0;i<26;i++){const y=(rnd()-.5)*Wd,x0=butt+rnd()*L*.7;g.strokeStyle=`rgba(${rnd()<.5?'40,16,8':ink.rock.ochre},${(.2+rnd()*.3).toFixed(2)})`;g.lineWidth=.5+rnd()*.6;g.beginPath();g.moveTo(x0,y);g.lineTo(x0+4+rnd()*10,y+(rnd()-.5));g.stroke();}
  // The knapped facets of the point, lit on their upper faces.
  g.fillStyle='rgba(255,214,160,.38)';g.beginPath();g.moveTo(tip,0);g.lineTo(tip-5,-Wd*.28);g.lineTo(tip-10,-Wd*.46);g.lineTo(tip-9,-Wd*.05);g.closePath();g.fill();
  g.fillStyle='rgba(40,14,6,.35)';g.beginPath();g.moveTo(tip,0);g.lineTo(tip-5,Wd*.3);g.lineTo(tip-10,Wd*.46);g.lineTo(tip-9,-Wd*.05);g.closePath();g.fill();
  g.restore();
  path();g.strokeStyle='rgba(30,12,6,.7)';g.lineWidth=1;g.stroke();
  const sprite={canvas:c,size,tip};rockCrayon=sprite;rockCrayonKey=key;return sprite;
}
// The Observer Core: the one small bright spot on the whole tool, and the only pure light on the
// sheet. Baked once — one traveller, one point — and blended in additively wherever it sits.
let rockCoreArt=null,rockCoreKey='';
function rockCoreSprite(){
  const key=DPR.toFixed(2);if(rockCoreArt&&rockCoreKey===key)return rockCoreArt;
  const R=64,size=R*2,px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(R,R);
  g.globalCompositeOperation='lighter';
  const halo=g.createRadialGradient(0,0,0,0,0,R);
  halo.addColorStop(0,`rgba(${ink.rock.ember},.16)`);halo.addColorStop(1,`rgba(${ink.rock.ember},0)`);
  g.fillStyle=halo;g.beginPath();g.arc(0,0,R,0,TAU);g.fill();
  const core=g.createRadialGradient(0,0,0,0,0,R*.13);
  core.addColorStop(0,`rgba(${ink.rock.emberCore},1)`);core.addColorStop(.4,`rgba(${ink.rock.ember},.9)`);core.addColorStop(1,`rgba(${ink.rock.ember},0)`);
  g.fillStyle=core;g.beginPath();g.arc(0,0,R*.13,0,TAU);g.fill();
  rockCoreArt={canvas:c,size,R};rockCoreKey=key;return rockCoreArt;
}
function rockPlayer(){
  if(world.state==='dead')return;
  const p=world.player,x=sx(p.x),y=sy(p.y),ang=Math.atan2(p.vy,p.vx);
  ctx.save();
  // Everything from here in is one rigid tool: translate to the travelling point, face the heading of
  // travel, and scale by the chart's own scale exactly as every other mark on it does.
  ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);
  const crayon=rockCrayonSprite();
  ctx.drawImage(crayon.canvas,-crayon.size/2-crayon.tip,-crayon.size/2,crayon.size,crayon.size);
  const core=rockCoreSprite();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(core.canvas,-core.R,-core.R,core.size,core.size);ctx.restore();
  // A shielded run carries the charge visibly, in the one colour this era spends on rarity: kaolin.
  if(p.shielded){ctx.strokeStyle=`rgba(${ink.rock.kaolin},.55)`;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.stroke();}
  // The charge held against the forgetting is the one thing on this wall that is not a pigment at all:
  // it is the torch, so it is struck outward in the flame's own colour rather than ringed in a mark.
  if(p.dawnArmed){
    ctx.strokeStyle=`rgba(${ink.rock.ember},.6)`;ctx.lineWidth=1.5;ctx.lineCap='round';ctx.beginPath();
    for(let i=0;i<10;i++){
      const a=i*TAU/10,to=i%2===0?23:20.5;
      ctx.moveTo(Math.cos(a)*17,Math.sin(a)*17);ctx.lineTo(Math.cos(a)*to,Math.sin(a)*to);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- The forgetting: two failures, not one, read as one broken-edged loss ----------
// The pigment's own film lets go or is sealed under a calcite skin that later spalls, and the engraved
// line fails by the limestone itself exfoliating — a complete loss of the support rather than a fading
// film. Read together here as a hard, sharp-lipped spall margin with small chips drifting free, rather
// than the atlas's soft wash. The boundary's own position, rate and grace are untouched: read straight
// off the same world state drawDark reads, so nothing about where the edge is ever moves.
// The edge is not a fixed sawtooth scrolled along — that read as a range of mountains on the horizon —
// but a break in the world's own rock: faceted at a hand's breadth, wandering at an arm's, and read off
// the height the dark has reached as well as the position along it, so the margin keeps failing into new
// shapes as it climbs rather than carrying one outline up the wall. Above it the soot bites into the
// face; along it only the facets that face the flame catch any light, in broken pieces; and scales of
// the face come away at it and drop into the dark rather than floating up out of it.
const ROCK_DARK_FACET=38;
function rockDarkEdgeAt(xw,level,seed){
  // Long, gently angled fracture lines meeting at uneven intervals, never a run of bumps: any regular
  // bump along a horizon reads as a landscape, which is what this edge must never be.
  const f=xw/ROCK_DARK_FACET,i=Math.floor(f),t=f-i,lv=Math.floor(level/40),v=k=>(rockHash(seed,k,lv)-.5)*10;
  return v(i)+(v(i+1)-v(i))*t+(rockWorldNoise(xw,level*.35,120,seed+5)-.5)*20;
}
// The next scale to come away: a thin sheet of the face already lifting just above the break, its
// thickness changing from one fracture to the next, parted from the rock behind it by a hairline.
function rockDarkScaleAt(xw,level,seed){const f=xw/(ROCK_DARK_FACET*.7),i=Math.floor(f),t=f-i,lv=Math.floor(level/40),v=k=>3+rockHash(seed+11,k,lv)*7;return v(i)+(v(i+1)-v(i))*t;}
function rockDark(dt){
  const fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);
  if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  rockTorchPass(.42);
  const time=reducedMotion?0:world.time,seed=(world.seed>>>0)^0xd4c,level=world.floorY,step=Math.max(2,3.5*scale),pts=[];
  for(let x=-step;x<=W+step;x+=step){const xw=(x-W*.5)/scale;pts.push([x,fy+rockDarkEdgeAt(xw,level,seed)*scale]);}
  ctx.save();
  // The soot the dark drives ahead of it, deeper as it closes on the hand.
  const reach=(46+near*40)*scale,sg=ctx.createLinearGradient(0,fy-reach-20*scale,0,fy+10*scale);
  sg.addColorStop(0,`rgba(${ink.rock.dark},0)`);sg.addColorStop(.7,`rgba(${ink.rock.dark},${(.35+near*.2).toFixed(3)})`);sg.addColorStop(1,`rgba(${ink.rock.dark},.7)`);
  ctx.fillStyle=sg;ctx.fillRect(0,fy-reach-20*scale,W,reach+40*scale);
  // The dark itself, below the break.
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const p of pts)ctx.lineTo(p[0],p[1]);ctx.lineTo(W+10,H+10);ctx.lineTo(-10,H+10);ctx.closePath();
  ctx.fillStyle=`rgba(${ink.rock.dark},.96)`;ctx.fill();
  // The lifting scale above the break, and the hairline that parts it from the face.
  {const top=pts.map(p=>[p[0],p[1]-rockDarkScaleAt((p[0]-W*.5)/scale,level,seed)*scale]);
    ctx.beginPath();ctx.moveTo(top[0][0],top[0][1]);for(const p of top)ctx.lineTo(p[0],p[1]);for(let i=pts.length-1;i>=0;i--)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();
    ctx.fillStyle=`rgba(${ink.rock.crust},${(.1+near*.06).toFixed(3)})`;ctx.fill();
    ctx.strokeStyle=`rgba(${ink.rock.dark},${(.55+near*.2).toFixed(3)})`;ctx.lineWidth=Math.max(.7,1*scale);
    for(let i=0;i+1<top.length;i++){if(rockHash(seed+21,i+Math.floor(level/40)*613,2)<.25)continue;ctx.beginPath();ctx.moveTo(top[i][0],top[i][1]);ctx.lineTo(top[i+1][0],top[i+1][1]);ctx.stroke();}}
  // The facets of the break that face the flame, lit in broken pieces; nowhere an outline.
  const tp=rockTorchAt||world.player,tx=sx(tp.x);ctx.lineCap='round';
  for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],slope=(b[1]-a[1])/(b[0]-a[0]),toward=(tx-(a[0]+b[0])/2)>0?-1:1,face=clamp(-slope*toward*1.4+.15,0,1);
    if(face<.25||rockHash(seed,i+Math.floor(level/40)*977,3)<.5)continue;
    ctx.strokeStyle=`rgba(${ink.rock.crust},${(face*(.22+near*.12)).toFixed(3)})`;ctx.lineWidth=Math.max(.8,1.2*scale);ctx.beginPath();ctx.moveTo(a[0],a[1]-.8*scale);ctx.lineTo(b[0],b[1]-.8*scale);ctx.stroke();}
  // Scales of the face coming away at the break and dropping into the dark.
  for(let k=0;k<12;k++){
    const ph=((k*.618+time*(.18+(k%5)*.05))%1+1)%1,x=((k*.3819+Math.floor(level/60)*.137)%1)*W,xw=(x-W*.5)/scale,ey=fy+rockDarkEdgeAt(xw,level,seed)*scale,y=ey+(ph*ph*34-2)*scale,sz=(.9+(k%4)*.4)*scale,al=(1-ph)*(.35+near*.25);
    if(y<-10||y>H+10||al<.02)continue;
    ctx.save();ctx.translate(x,y);ctx.rotate(k*1.7+ph*3);ctx.fillStyle=`rgba(${ink.rock.stain},${(al*.8).toFixed(3)})`;
    ctx.beginPath();ctx.moveTo(-sz,-sz*.5);ctx.lineTo(sz*.9,-sz*.7);ctx.lineTo(sz*.4,sz*.8);ctx.closePath();ctx.fill();ctx.restore();
  }
  ctx.restore();
}

// ---------- The animals: what this wall draws where the atlas draws constellation-figures ----------
// Palaeolithic painters drew animals and never a constellation-figure, so a cluster on this wall is an
// animal found through its three lights — the way the six dots over the black bull's shoulder at
// Lascaux sit on an animal and not in a diagram. Every animal is one parametric profile in the manner
// of the Hall of the Bulls: a body as one closed contour whose back, belly, chest and rump are the
// real anatomy of a large grazer, thin legs set on as strokes rather than drawn in the round, and the
// head's horns or antlers in twisted perspective — seen from the front on a head seen from the side,
// which is exactly how those walls draw them. What changes between species is a row of numbers.
// Each animal is drawn by hand as one outline — body, legs and head in a single contour, as the Hall
// of the Bulls outlines them — with horns, antlers, tusks, tail and mane as separate strokes, since
// those walls set them on in twisted perspective, seen from the front on a head seen from the side.
// Coordinates are in hundredths, rump at x 0, muzzle near x 100, back near y 0, hooves near y 56,
// facing right; the silhouettes follow the published Lascaux, Chauvet and Font-de-Gaume animals in
// proportion only, and none is a tracing of any one figure.
const ROCK_ANIMALS=[
  {name:'THE AUROCHS',body:[[2,0],[15,-6],[35,-8],[55,-12],[66,-13],[74,-9],[80,-4],[86,-2],[92,2],[97,8],[99,13],[96,17],[88,16],[82,14],[76,20],[72,26],[70,32],[72,48],[71,56],[67,57],[66,46],[63,36],[61,46],[60,56],[56,56],[56,40],[48,31],[34,30],[24,33],[24,46],[25,56],[21,57],[19,44],[16,37],[14,46],[13,56],[9,56],[9,40],[5,28],[2,14],[0,6]],
    strokes:[[[86,-2],[84,-12],[88,-22],[97,-25]],[[88,-1],[91,-10],[98,-16],[103,-13]],[[2,3],[-3,14],[-4,30],[-2,40]]]},
  {name:'THE HORSE',body:[[3,2],[14,-4],[32,-6],[52,-8],[62,-10],[68,-16],[74,-22],[80,-24],[86,-20],[92,-12],[98,-4],[100,2],[97,6],[90,4],[84,0],[78,4],[72,14],[68,24],[68,34],[70,46],[70,56],[66,56],[64,44],[61,36],[59,46],[58,56],[54,56],[54,40],[46,33],[32,32],[22,34],[21,46],[23,56],[19,56],[16,44],[14,38],[12,48],[11,56],[7,56],[7,42],[4,30],[2,16]],
    strokes:[[[62,-10],[66,-18],[72,-26],[80,-28],[86,-24]],[[3,4],[-4,10],[-8,22],[-6,36]],[[84,-22],[86,-28],[88,-22]]]},
  {name:'THE BISON',body:[[2,4],[12,-2],[26,-6],[40,-14],[52,-24],[60,-26],[68,-20],[74,-10],[80,-2],[86,4],[90,12],[92,20],[88,24],[84,22],[80,30],[74,30],[70,28],[68,36],[69,48],[68,56],[64,56],[63,46],[60,38],[58,48],[57,56],[53,56],[53,42],[46,34],[34,32],[24,33],[23,46],[24,56],[20,56],[18,44],[15,38],[13,48],[12,56],[8,56],[8,42],[4,30],[2,16]],
    strokes:[[[80,-2],[84,-10],[90,-10]],[[82,0],[88,-6]],[[2,6],[-2,14],[-2,24]],[[74,24],[76,34],[80,36]]]},
  {name:'THE IBEX',body:[[3,2],[16,-2],[34,-4],[52,-6],[62,-8],[70,-10],[76,-12],[82,-10],[88,-4],[94,2],[96,8],[92,10],[86,8],[80,10],[74,16],[70,24],[68,32],[70,46],[70,56],[66,56],[64,44],[61,36],[59,46],[58,56],[54,56],[54,38],[46,30],[32,29],[22,32],[21,44],[23,56],[19,56],[16,44],[14,38],[12,48],[11,56],[7,56],[7,40],[4,28],[2,14]],
    strokes:[[[80,-10],[76,-22],[66,-32],[52,-34],[42,-28]],[[82,-10],[80,-24],[72,-34],[60,-38],[50,-34]],[[3,4],[0,8],[-2,12]],[[92,10],[94,16],[92,20]]]},
  {name:'THE STAG',body:[[3,2],[16,-2],[34,-4],[50,-6],[60,-10],[66,-18],[72,-26],[78,-30],[84,-28],[90,-22],[96,-16],[99,-12],[96,-8],[88,-10],[82,-12],[76,-6],[72,4],[68,16],[68,30],[70,44],[71,56],[67,56],[65,44],[62,34],[60,44],[59,56],[55,56],[55,38],[46,30],[32,29],[22,32],[21,44],[23,56],[19,56],[16,44],[14,38],[12,48],[11,56],[7,56],[7,40],[4,28],[2,14]],
    strokes:[[[80,-30],[76,-44],[70,-58],[62,-66]],[[76,-44],[66,-46]],[[72,-54],[66,-60]],[[73,-58],[76,-68]],[[82,-30],[84,-46],[82,-60],[78,-70]],[[84,-46],[90,-54]],[[83,-58],[88,-66]],[[3,4],[0,8]]]},
  {name:'THE MAMMOTH',body:[[4,10],[10,-4],[24,-14],[40,-22],[54,-30],[64,-34],[74,-32],[82,-26],[88,-16],[92,-4],[94,8],[96,22],[98,36],[100,48],[98,54],[94,50],[92,38],[88,26],[84,22],[80,26],[76,32],[72,40],[72,50],[72,58],[66,58],[65,46],[62,40],[60,48],[60,58],[54,58],[54,44],[46,38],[32,36],[22,38],[20,48],[21,58],[15,58],[14,46],[12,42],[10,50],[9,58],[4,58],[4,44],[2,28]],
    strokes:[[[88,22],[96,28],[100,20],[98,12]],[[86,24],[90,32],[96,32]],[[4,12],[-1,18],[-2,26]]]},
  {name:'THE CAVE LION',body:[[3,6],[16,2],[34,0],[52,-2],[64,-4],[72,-8],[80,-12],[88,-10],[94,-4],[98,2],[98,8],[94,12],[88,12],[82,14],[76,18],[72,26],[70,38],[72,50],[72,56],[68,56],[66,46],[63,40],[61,48],[61,56],[57,56],[56,42],[48,34],[34,32],[22,34],[20,44],[22,56],[18,56],[15,46],[13,40],[11,48],[10,56],[6,56],[6,42],[4,30],[2,18]],
    strokes:[[[3,8],[-6,4],[-14,8],[-18,20],[-14,26]],[[84,-12],[86,-18],[90,-14]]]},
  {name:'THE BEAR',body:[[4,14],[10,0],[22,-10],[38,-14],[52,-16],[62,-14],[70,-10],[78,-6],[86,-4],[94,0],[100,6],[98,12],[90,14],[82,14],[76,20],[72,28],[72,42],[74,54],[76,58],[68,58],[65,46],[62,40],[60,50],[60,58],[53,58],[53,44],[44,38],[30,38],[20,40],[18,50],[20,58],[12,58],[11,46],[8,40],[6,50],[6,58],[1,58],[1,42],[2,28]],
    strokes:[[[80,-6],[80,-12],[84,-10]]]},
  {name:'THE RHINOCEROS',body:[[4,8],[14,-2],[30,-8],[46,-12],[58,-12],[66,-8],[74,-4],[82,0],[90,4],[96,10],[98,18],[94,22],[86,22],[80,24],[74,30],[70,38],[70,50],[70,58],[64,58],[63,48],[60,42],[58,50],[58,58],[52,58],[52,44],[44,38],[30,38],[20,40],[19,50],[20,58],[14,58],[13,48],[10,42],[8,50],[8,58],[3,58],[3,44],[2,26]],
    strokes:[[[96,10],[104,-6],[110,-20]],[[88,4],[92,-6],[95,-10]],[[4,10],[0,18],[1,26]],[[76,-4],[78,-10],[81,-6]]]},
  {name:'THE HIND',body:[[3,2],[16,-2],[34,-4],[50,-6],[60,-10],[66,-18],[72,-26],[78,-30],[84,-30],[90,-26],[96,-20],[99,-16],[96,-12],[88,-14],[82,-16],[76,-8],[72,4],[68,16],[68,30],[70,44],[71,56],[67,56],[65,44],[62,34],[60,44],[59,56],[55,56],[55,38],[46,30],[32,29],[22,32],[21,44],[23,56],[19,56],[16,44],[14,38],[12,48],[11,56],[7,56],[7,40],[4,28],[2,14]],
    strokes:[[[80,-30],[76,-40],[82,-34]],[[84,-30],[84,-40],[88,-33]],[[3,4],[0,8]]]},
  {name:'THE BOAR',body:[[4,10],[12,-2],[26,-10],[42,-16],[56,-18],[66,-14],[74,-8],[82,-2],[90,4],[98,10],[102,16],[98,20],[88,20],[80,22],[74,28],[70,36],[70,48],[70,56],[65,56],[64,46],[61,40],[59,48],[59,56],[54,56],[54,42],[46,36],[32,35],[22,37],[21,48],[22,56],[17,56],[15,46],[12,42],[10,50],[10,56],[5,56],[5,42],[3,26]],
    strokes:[[[94,16],[98,8],[96,4]],[[4,12],[0,14],[-2,20]],[[26,-10],[34,-18],[44,-20],[56,-22],[66,-18]],[[76,-6],[78,-12],[81,-7]]]},
  {name:'THE SALMON',body:[[6,2],[18,-6],[34,-12],[52,-14],[68,-12],[82,-8],[94,-2],[100,4],[96,8],[86,12],[70,16],[52,17],[34,14],[18,10],[8,6],[0,-6],[-4,-10],[-2,4],[-4,18],[0,14]],
    strokes:[[[44,-13],[48,-22],[58,-14]],[[62,15],[64,22],[70,16]],[[86,-2],[88,0]],[[80,-6],[78,6]]]}
].map(a=>({...a,body:a.body.map(p=>[p[0]/100,p[1]/100]),strokes:a.strokes.map(st=>st.map(p=>[p[0]/100,p[1]/100]))}));
// A few thousandths of seeded wobble per point, so the same species is never drawn twice exactly alike.
function rockAnimalShape(a,seed){
  const r=seeded((seed>>>0)||7),j=p=>[p[0]+(r()-.5)*.012,p[1]+(r()-.5)*.012];
  return {body:a.body.map(j),strokes:a.strokes.map(st=>st.map(j))};
}
// Through the points rather than between them (Catmull-Rom), so a thin leg keeps its taper and a hoof
// its point; smoothing through midpoints rounded every leg into a club.
function rockSmoothPath(g,pts,T){
  const n=pts.length,P=i=>T(pts[(i+n)%n]);g.beginPath();const s0=P(0);g.moveTo(s0[0],s0[1]);
  for(let i=0;i<n;i++){const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2);
    g.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
  g.closePath();
}
function rockSmoothOpen(g,pts,T){
  const P=pts.map(T);g.beginPath();g.moveTo(P[0][0],P[0][1]);
  for(let i=1;i<P.length-1;i++){const e=[(P[i][0]+P[i+1][0])/2,(P[i][1]+P[i+1][1])/2];g.quadraticCurveTo(P[i][0],P[i][1],e[0],e[1]);}
  g.lineTo(P[P.length-1][0],P[P.length-1][1]);
}
const rockPolyLen=(P,closed)=>{let l=0;for(let i=0;i+1<P.length;i++)l+=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);if(closed)l+=Math.hypot(P[0][0]-P[P.length-1][0],P[0][1]-P[P.length-1][1]);return l;};
// A charcoal line is one continuous stroke, drawn twice: a broad soft pass and a narrower dark core a
// hair off it, so the line swells and thins where the two part and meet, as a stick pressed and lifted
// does — without ever breaking into the beads a stroke laid in short pieces made. `f` is how much of
// it the hand has drawn, by its own length.
function rockCharcoal(g,path,len,w,rgb,alpha,f){
  if(f<=0)return;g.save();g.lineCap='round';g.lineJoin='round';
  if(f<1&&g.setLineDash)g.setLineDash([len*f,len*2]);
  // `rgb` is a colour triple, or a gradient already carrying its own alpha, laid at `alpha` overall.
  const paint=a=>typeof rgb==='string'?`rgba(${rgb},${a.toFixed(3)})`:(g.globalAlpha=a,rgb);
  g.strokeStyle=paint(alpha*.4);g.lineWidth=w*1.8;path(0,0);g.stroke();
  // The core skips, as a charcoal stick does on stone: a dash of uneven gaps, where the soft pass
  // under it keeps the line continuous.
  if(f>=1&&g.setLineDash)g.setLineDash([w*9,w*1.4,w*5,w*.8,w*12,w*2.2]);
  g.strokeStyle=paint(alpha);g.lineWidth=w*.8;path(w*.25,w*.15);g.stroke();
  g.restore();
}
// How the Hall of the Bulls actually lays an animal down, which is what this follows rather than a
// filled silhouette: the colour sits high — sprayed and dabbed along the back, neck and head and fading
// out down the flank, so the belly is mostly the rock itself; a fine spray of pigment dust lies just
// outside the back line where it was blown; the black contour is heaviest along the back, withers and
// head and thins and breaks along the belly; and the legs are not closed round the hooves but trail
// off, the line lifting before it reaches the ground.
function rockPaintAnimal(g,a,seed,T,unit,sketch,wash,pig,alpha=1){
  const sh=rockAnimalShape(a,seed),w=Math.max(1.1,unit*.012),col=ink.rock.charcoal,r=seeded((seed^0x9d)>>>0||1);
  const top=T([.5,-.3]),mid=T([.5,.22]),foot=T([.5,.6]);
  const down=(stops)=>{const gr=g.createLinearGradient(top[0],top[1],foot[0],foot[1]);for(const [t,c] of stops)gr.addColorStop(t,c);return gr;};
  if(wash>0){
    // The body's colour, strong on the back and gone by the belly.
    g.save();g.globalCompositeOperation='multiply';rockSmoothPath(g,sh.body,T);g.clip();
    g.fillStyle=down([[0,`rgba(${pig},${(.62*wash*alpha).toFixed(3)})`],[.42,`rgba(${pig},${(.38*wash*alpha).toFixed(3)})`],[.62,`rgba(${pig},${(.08*wash*alpha).toFixed(3)})`],[1,`rgba(${pig},0)`]]);
    g.fillRect(-9999,-9999,19999,19999);
    // Dabbed, not flat: the pad's own blotches through the coloured part.
    const bb=sh.body.map(T),xs=bb.map(p=>p[0]),ys=bb.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),n=Math.round((x1-x0)*(y1-y0)/(unit*unit)*500);
    for(let i=0;i<n;i++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0),up=clamp(1-(y-y0)/((y1-y0)*.6||1),0,1);if(up<=0)continue;rockDab(g,x,y,unit*(.012+r()*.03),pig,.16*up*wash*alpha,i+seed);}
    g.globalAlpha=1;g.restore();
    // Blown dust just outside the back line: points along the upper contour, pushed out and scattered.
    g.save();const P=sh.body;for(let i=0;i<P.length;i++){const p=P[i];if(p[1]>.12)continue;
      for(let k=0;k<9;k++){const q=T([p[0]+(r()-.5)*.06,p[1]-.01-r()*.05]);rockDab(g,q[0],q[1],unit*(.003+r()*.006),pig,(.35+r()*.35)*wash*alpha,i*9+k+seed);}}
    g.globalAlpha=1;g.restore();}
  if(sketch>0){
    const P=sh.body.map(T),len=rockPolyLen(P,true),outline=(ox,oy)=>rockSmoothPath(g,sh.body,p=>{const q=T(p);return [q[0]+ox,q[1]+oy];});
    // The whole contour, fading out toward the hooves so the legs trail off unclosed.
    const fade=down([[0,`rgba(${col},1)`],[.5,`rgba(${col},.85)`],[.66,`rgba(${col},.3)`],[.82,`rgba(${col},.06)`],[.92,`rgba(${col},0)`]]);
    rockCharcoal(g,outline,len*1.05,w,fade,.92*alpha,Math.min(1,sketch*1.3));
    // And again, heavier, over the back, withers and head alone.
    if(sketch>.6){g.save();g.beginPath();g.moveTo(top[0]-9999,top[1]-9999);const cut=T([0,.1]),cut2=T([1.2,.1]);
      g.rect(Math.min(cut[0],cut2[0])-9999,Math.min(top[1],cut[1],cut2[1])-9999,19999,Math.max(cut[1],cut2[1])-Math.min(top[1],cut[1],cut2[1])+9999);g.clip();
      rockCharcoal(g,outline,len*1.05,w*1.25,`${col}`,.85*alpha*clamp((sketch-.6)*2.5,0,1),1);g.restore();}
    const rest=clamp((sketch-.55)*2.2,0,1);
    sh.strokes.forEach(st=>{const Q=st.map(T);rockCharcoal(g,(ox,oy)=>rockSmoothOpen(g,st,p=>{const q=T(p);return [q[0]+ox,q[1]+oy];}),rockPolyLen(Q)*1.05,w*.9,col,.9*alpha,rest);});
  }
}
// The three lights fix where the animal stands: it spans the first and last, rides level rather than
// tipping with them, faces the way the course climbs, and the middle light falls on its shoulder.
const rockAnimalFor=chart=>ROCK_ANIMALS[((chart.catalogueIndex|0)%ROCK_ANIMALS.length+ROCK_ANIMALS.length)%ROCK_ANIMALS.length];
function rockFigure(chart){
  if(chart.stars.length<3)return;
  const s=chart.stars,x0=sx(s[0].x),y0=sy(s[0].y),x2=sx(s[2].x),y2=sy(s[2].y);
  if(Math.max(y0,y2)<-220||Math.min(y0,y2)>H+220)return;
  const count=s.filter(n=>n.visited).length,a=rockAnimalFor(chart),seed=(chart.id*7919+(chart.catalogueIndex|0)*131)>>>0;
  const span=Math.max(120*scale,Math.hypot(x2-x0,y2-y0)*1.25),face=x2>=x0?1:-1,tilt=clamp(Math.atan2(y2-y0,Math.abs(x2-x0)||1),-.3,.3)*face;
  const cx=(x0+x2)/2+(sx(s[1].x)-(x0+x2)/2)*.3,cy=(y0+y2)/2+(sy(s[1].y)-(y0+y2)/2)*.3+span*.12,ct=Math.cos(tilt),st=Math.sin(tilt);
  const T=p=>{const u=(p[0]-.5)*span*face,v=(p[1]-.25)*span;return [cx+u*ct-v*st,cy+u*st+v*ct];};
  const sketch=chart.expired?0:chart.completed?1:count/3,wash=chart.completed?Math.min(1,.4+(chart.flash||0)*.3+.6):0;
  if(chart.expired){ctx.save();rockPaintAnimal(ctx,a,seed,T,span,1,.5,ink.rock.redOchre,.25);ctx.restore();return;}
  ctx.save();rockPaintAnimal(ctx,a,seed,T,span,Math.max(.12,sketch),wash,seed%3?ink.rock.redOchre:ink.rock.ochreDeep);ctx.restore();
}

// ---------- The older hands: what was on this wall before the traveller came ----------
// A painted cave is never painted once, and the deeper a cave goes the more hands it has seen. The
// panels passed on the way in carry the simplest marks — fingers drawn through the soft film on the
// rock, scratches, rows of dots; further in, hands pressed and blown and animals drawn in outline; deeper
// still, whole washed herds; and at the far end, pecked in the stone, the spirals and cup-and-rings of
// the people who built Newgrange — the last and latest hands on this wall, as the fourth chamber is its
// last. So the wall itself tells the climb as generations. All of it is seeded off the world in chunks
// like the niches and fissures, kept off the opening plane, and held far below the contrast of a live
// mark: nothing here is anything to fly by.
const ROCK_OLD_CHUNK=440,ROCK_OLD_DEPTHS=[1400,3600,7200];
// Finger flutings: three or four fingers drawn together through the soft surface in a long curve.
function rockFlutings(g,x,y,len,ang,fingers,alpha,hf){
  g.save();g.globalCompositeOperation='multiply';g.lineCap='round';
  for(let f=0;f<fingers;f++){const off=(f-(fingers-1)/2)*5*scale,bend=(hf(60)-.5)*.9;g.strokeStyle=`rgba(90,72,56,${(alpha*(.75+hf(61+f)*.25)).toFixed(3)})`;g.lineWidth=2.6*scale;
    g.beginPath();for(let t=0;t<=1.001;t+=.08){const a=ang+bend*(t-.5),px=x+Math.cos(a)*len*(t-.5)-Math.sin(ang)*off,py=y+Math.sin(a)*len*(t-.5)+Math.cos(ang)*off+Math.sin(t*Math.PI)*bend*len*.15;t?g.lineTo(px,py):g.moveTo(px,py);}g.stroke();}
  g.restore();
}
// A pecked spiral or a cup-and-ring: rows of small hammer-struck pits, dark hollows with a lit lip.
function rockPeckedSpiral(g,x,y,R,turns,alpha,seed){
  for(let t=0,i=0;t<=1;t+=1/(turns*26),i++){const a=t*turns*TAU+seed,r=R*t;rockPeck(g,x+Math.cos(a)*r,y+Math.sin(a)*r,1.5*scale,alpha*(.7+.3*Math.sin(i)));}
}
function rockCupAndRing(g,x,y,R,rings,alpha){
  rockPeck(g,x,y,R*.22,alpha);
  for(let k=1;k<=rings;k++){const r=R*k/rings,n=Math.round(TAU*r/(3.2*scale));for(let i=0;i<n;i++){const a=i/n*TAU;rockPeck(g,x+Math.cos(a)*r,y+Math.sin(a)*r,1.3*scale,alpha*.8);}}
}
function rockPaintOldHands(){
  const seed=(world.seed>>>0)^0x0a1d,C=ROCK_OLD_CHUNK,wx0=-W*.5/scale-C,wx1=W*.5/scale+C,wy0=world.cameraY-C*.6,wy1=world.cameraY+H/scale+C*.6;
  for(let cj=Math.floor(wy0/C);cj<=Math.floor(wy1/C);cj++)for(let ci=Math.floor(wx0/C);ci<=Math.floor(wx1/C);ci++){
    const hf=q=>rockHash(seed+ci*4099,cj*65537,q),kind=hf(1);if(kind<.1)continue;
    const wx=(ci+.15+hf(2)*.7)*C,wy=(cj+.15+hf(3)*.7)*C;if(Math.hypot(wx,wy-ROCK_OPENING_Y)<ROCK_OPENING_R+160)continue;
    const x=sx(wx),y=sy(wy),fade=.42+hf(4)*.25;if(x<-260||x>W+260||y<-260||y>H+260)continue;
    // How far in this panel is decides whose hands made it; a little overlap either side, since no
    // generation stopped at a line.
    const depth=-wy+(hf(70)-.5)*900,layer=depth<ROCK_OLD_DEPTHS[0]?0:depth<ROCK_OLD_DEPTHS[1]?1:depth<ROCK_OLD_DEPTHS[2]?2:3;
    ctx.save();
    if(layer===0){
      if(kind<.55)rockFlutings(ctx,x,y,(90+hf(8)*120)*scale,(hf(9)-.5)*1.6+Math.PI/2*(hf(10)<.5?1:0),3+((hf(11)*2)|0),fade*.7,hf);
      else{const n=5+((hf(13)*9)|0),dx=(9+hf(14)*6)*scale,ang=(hf(15)-.5)*.6;
        for(let i=0;i<n;i++){const t=i-n/2;rockDot(ctx,x+Math.cos(ang)*t*dx,y+Math.sin(ang)*t*dx+Math.sin(i*1.3)*2*scale,(2.4+hf(50+i)*1.4)*scale,ink.rock.redOchre,fade*2,i+ci*13);}}
    }else if(layer===1){
      if(kind<.5){const n=2+((hf(12)*4)|0);for(let i=0;i<n;i++)rockHand(x+(i-n/2)*26*scale+(hf(20+i)-.5)*10*scale,y+(hf(30+i)-.5)*18*scale,17*scale,ink.rock.redOchre,fade*1.4,hf(40+i)<.5);}
      else{const a=ROCK_ANIMALS[(hf(5)*12)|0],span=(110+hf(6)*110)*scale,face=hf(7)<.5?1:-1;
        rockPaintAnimal(ctx,a,(hf(9)*1e6)|0,p=>[x+(p[0]-.5)*span*face,y+(p[1]-.25)*span],span,1,0,ink.rock.redOchre,fade);}
    }else if(layer===2){
      // A herd: two or three washed animals of one kind, overlapping, walking one way.
      const a=ROCK_ANIMALS[(hf(5)*11)|0],n=2+((hf(16)*2)|0),span=(100+hf(6)*80)*scale,face=hf(7)<.5?1:-1,pig=hf(8)<.5?ink.rock.redOchre:ink.rock.manganese;
      for(let i=0;i<n;i++){const ox=(i-(n-1)/2)*span*.55*face,oy=(i%2)*span*.12;
        rockPaintAnimal(ctx,a,((hf(9)*1e6)|0)+i,p=>[x+ox+(p[0]-.5)*span*face,y+oy+(p[1]-.25)*span],span,1,.75,pig,fade*(1-i*.15));}
    }else{
      // The last hands: pecked into the stone rather than painted on it, as at Newgrange and Knowth.
      if(kind<.45){const R=(24+hf(17)*14)*scale;for(let k=0;k<3;k++){const a=k/3*TAU-Math.PI/2;rockPeckedSpiral(ctx,x+Math.cos(a)*R*.95,y+Math.sin(a)*R*.95,R*.8,2.2,fade*1.3,k*2.1+hf(18)*6);}}
      else if(kind<.8)rockCupAndRing(ctx,x,y,(18+hf(19)*20)*scale,2+((hf(20)*3)|0),fade*1.3);
      else rockPeckedSpiral(ctx,x,y,(22+hf(21)*18)*scale,2.6,fade*1.3,hf(22)*6);
    }
    ctx.restore();
  }
}

// ---------- The frame, the laid paper: nothing surrounds this sky ----------
// No border, cartouche, colophon or maker's mark — a figure's edge is wherever rock or torchlight
// stops, and there are no laid wires on a cave wall. Registered as no-ops so the intent is stated
// rather than inferred from an absence.
function rockPlateFrame(){}
function rockLaid(){}
// Two more the atlas draws that this wall has no word for, and neither is a matter of taste. It draws a
// constellation as an engraved figure — a lyre, a ship, a pair of dividers — where this era draws
// animals and never constellation-figures at all; the route through the chart's stars is a separate
// mark and is still drawn, so nothing a transfer depends on is withheld. And it surveys a landing as a
// geometer's construction, lettered a-b-c with the arrival angle set in figures beside it, on a sheet
// with no script and no geometry to letter one in. The cluster this era does have for a constellation
// — six dots over a bull's shoulder, three of them ringed, kept exactly as ambiguous as the reading
// that licenses it — is not drawn yet.
function rockSurveys(){}
// And three fixtures of the printed sheet that a wall simply does not have: the leaf of ground the
// atlas lays under its running numbers, the plate's number and name engraved at the foot, and the
// chapter title written across the sheet as a new plate opens. A cave has no foot and no title page,
// the chamber it names is announced in the live region instead, and a soft patch of paper laid under
// the HUD reads on lit limestone as exactly what it is — a patch of paper. The counts themselves are
// still owed the player and are still set, in the modern hand this era admits to; what is dropped is
// the furniture that would have carried them on a sheet.
// A hazard comes onto this wall the way rock gives: not a drop of ink landing and a pen cutting round
// it, but the face breaking open from the middle outward, the break's edge ragged and the opening
// widening fast and then settling, with no blot and no nib, since nothing here was written.
function rockHazardReveal(h,draw,t){
  const x=sx(h.x),y=sy(h.y),R=(gravityRadius(h)+12)*scale*(1-Math.pow(1-t,3)),rng=seeded((h.seed^0x5e11)>>>0||3),n=15;
  ctx.save();ctx.beginPath();
  for(let i=0;i<n;i++){const a=(i+(rng()-.5)*.6)/n*TAU,r=R*(.78+rng()*.3);if(i)ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);else ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}
  ctx.closePath();ctx.clip();draw(h);ctx.restore();
}
// The atlas bends the starlight round a vortex by resampling the sheet in a whirl. The Shaft is a
// drop, not a whirlpool, and nothing on this wall is light to be bent, so the swirl is not drawn: the
// pull is told by the soot and the grit going over the lip.
function rockLenses(){}
// What the wall has to say is cut into it rather than inked on: the charcoal of the groove's shadow a
// hair below and to the right, and the pale fresh stone on the line itself — the same two passes as the
// scratch primitive — so a note reads on lit rock and dark alike, where one ink read on neither.
function rockInscriptionInk(caps){
  return [{rgb:ink.rock.dark,alpha:caps?.85:.7,dx:.9,dy:1.1},{rgb:ink.rock.kaolin,alpha:caps?.95:.86,dx:0,dy:0}];
}
// ---------- The HUD: what the run owes the player, set on the rock in the era's own marks ----------
// The counts are still owed, and are still exact, but they are cut where a hand in this cave would
// have cut them: at the head of the wall, in the dark above the flame. The tally is additive, as every
// tally before writing was — a pressed dot for each hundred, a scratched notch for each ten, bundled in
// fives with the fifth struck across the four, and a ringed dot for each thousand — so 560 is five
// dots and six notches, and it reads at a glance as a quantity before it is read as a number. Beside
// it, small, the curator's numeral, because nobody should have to count notches to know a score. The
// ochre the hand carries is paste in a shell palette, draining as the flight spends it and reddening
// when it will not carry an ordinary transfer; the pace is a note under the shell; the rhythm of clean
// landings is a row of hand stencils; and each charge held is its attested mark. The DOM HUD stays
// in place for screen readers and is only taken off the screen for this wall (index.html).
let rockHudTopPx=null;
function rockHudTop(){
  if(rockHudTopPx!==null)return rockHudTopPx;
  let t=26;try{const e=document.querySelector('.hud'),v=e&&typeof getComputedStyle==='function'?parseFloat(getComputedStyle(e).top):NaN;if(isFinite(v))t=v;}catch(e){}
  return rockHudTopPx=t;
}
// A hand stencil: pigment blown round a hand held flat against the rock, so the hand is the rock left
// bare inside a halo of spray. Baked once per pigment and size.
const rockHandSprites=new Map();
function rockHandSprite(rgb,S,flip){
  const key=rgb+':'+S+':'+(flip?1:0)+':'+DPR.toFixed(2),cached=rockHandSprites.get(key);if(cached)return cached;
  const size=Math.ceil(S*2.4),px=Math.max(2,Math.round(size*DPR)),c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const rnd=seeded(0x4a4d+S),k=S/12;
  for(let i=0;i<520;i++){const a=rnd()*TAU,r=Math.pow(rnd(),.55)*S*1.1;g.fillStyle=`rgba(${rgb},${(.3+rnd()*.35)*(1-r/(S*1.15))})`;g.beginPath();g.arc(Math.cos(a)*r,Math.sin(a)*r*1.1,.5+rnd()*1.1*k,0,TAU);g.fill();}
  // The hand itself, pointing up: palm, thumb out to one side, four fingers spread.
  g.globalCompositeOperation='destination-out';g.save();if(flip)g.scale(-1,1);g.fillStyle='#000';g.strokeStyle='#000';g.lineCap='round';
  g.beginPath();g.ellipse(0,3*k,4.6*k,5.2*k,0,0,TAU);g.fill();
  for(const [a,L,w] of [[-1.05,6.4,2.4],[-.3,8.6,2.2],[-.06,9.6,2.2],[.18,8.8,2.1],[.42,7,1.9]]){
    const bx=Math.sin(a)*3.6*k,by=3*k-Math.cos(a)*3.8*k;g.lineWidth=w*k;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.sin(a)*L*k,by-Math.cos(a)*L*k);g.stroke();}
  g.restore();
  const sp={canvas:c,size};rockHandSprites.set(key,sp);return sp;
}
function rockHand(x,y,S,rgb,alpha,flip){const sp=rockHandSprite(rgb,Math.round(S),flip);ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(sp.canvas,x-sp.size/2,y-sp.size/2,sp.size,sp.size);ctx.restore();}
// Newgrange's triple spiral, pecked: the shield's mark.
function rockSpiralMark(x,y,r,alpha){
  ctx.save();ctx.translate(x,y);ctx.strokeStyle=`rgba(${ink.rock.kaolin},${alpha})`;ctx.lineWidth=1.3;ctx.lineCap='round';
  for(let s=0;s<3;s++){const a0=s/3*TAU-Math.PI/2,cx=Math.cos(a0)*r*.55,cy=Math.sin(a0)*r*.55;ctx.beginPath();
    for(let t=0;t<=1.001;t+=.04){const a=a0+Math.PI+t*TAU*1.6,rr=r*.5*t;const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;t?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}
  ctx.restore();
}
function rockHudLeaf(){
  if(!world||world.state==='ready')return;
  const top=rockHudTop(),left=26,words=plateWords().hud,score=world.score|0;
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalCompositeOperation='source-over';
  // The tally. Its marks sit on a band of the dark itself, so they read on any rock.
  const th=Math.floor(score/1000),hu=Math.floor(score/100)%10,te=Math.floor(score/10)%10;let x=left;const y=top+10;
  for(let i=0;i<th;i++){rockDot(ctx,x+6,y,5.2,ink.rock.redOchre,1,900+i);ctx.strokeStyle=`rgba(${ink.rock.kaolin},.8)`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x+6,y,8.6,0,TAU);ctx.stroke();x+=21;}
  for(let i=0;i<hu;i++){rockDot(ctx,x+4.5,y,4.4,ink.rock.redOchre,1,700+i);x+=11.5;}
  if(th+hu)x+=5;
  for(let b=0;b<te;b+=5){const n=Math.min(5,te-b),x0=x;
    for(let i=0;i<Math.min(4,n);i++){const nx=x0+i*5.2+((b+i)%3-1)*.4;rockScratch(ctx,nx,y-9,nx+((b+i)%2?.7:-.5),y+9,1.8,1);}
    if(n===5)rockScratch(ctx,x0-3,y+7,x0+19,y-7,1.6,1);
    x=x0+(n===5?27:Math.min(4,n)*5.2+6);}
  if(!score){rockScratch(ctx,x,y,x+10,y,1.2,.5);}
  ctx.font=plateFace(11,'sc');ctx.textBaseline='top';ctx.textAlign='left';ctx.fillStyle=`rgba(${ink.rock.kaolin},.62)`;ctx.fillText(String(score),left,y+14);
  // The ochre in hand, as paste in a scallop valve: the fan of the shell from its hinge, ribbed, with
  // the paste laid in from the left as far as the ochre goes.
  const level=world.inkLevel(),cx=W/2,hy=top+22,R=19,low=level<=.34,pulse=low&&!reducedMotion?.5+.5*Math.sin(world.time*6):1,a0=Math.PI*1.08,a1=Math.PI*1.92,ry=R*.8;
  const fan=()=>{ctx.beginPath();ctx.moveTo(cx,hy);for(let i=0;i<=18;i++){const a=a0+(a1-a0)*i/18,w=1+.05*Math.cos(i*Math.PI);ctx.lineTo(cx+Math.cos(a)*R*w,hy+Math.sin(a)*ry*w);}ctx.closePath();};
  fan();ctx.fillStyle=`rgba(${ink.rock.dark},.6)`;ctx.fill();
  ctx.save();fan();ctx.clip();
  ctx.fillStyle=`rgba(${low?ink.rock.redOchre:ink.rock.ochre},${(.95*(low?.7+.3*pulse:1)).toFixed(3)})`;ctx.fillRect(cx-R,hy-ry-2,R*2*level,ry+4);
  for(let i=0;i<10;i++)rockDab(ctx,cx-R+((i*7.3)%(R*2))*level,hy-ry*.2-((i*3.7)%(ry*.7)),1.7,ink.rock.ochreDeep,.35,i+40);
  ctx.restore();ctx.globalAlpha=1;
  ctx.strokeStyle=`rgba(${ink.rock.kaolin},.28)`;ctx.lineWidth=.9;for(let i=1;i<8;i++){const a=a0+(a1-a0)*i/8;ctx.beginPath();ctx.moveTo(cx,hy);ctx.lineTo(cx+Math.cos(a)*R*.97,hy+Math.sin(a)*ry*.97);ctx.stroke();}
  fan();ctx.strokeStyle=`rgba(${ink.rock.kaolin},.6)`;ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle=`rgba(${ink.rock.kaolin},.5)`;ctx.fillRect(cx-4,hy-1,8,3);
  const cy=hy-ry*.4,ry0=ry*.5;
  const m=world.speedMultiplier();ctx.textAlign='center';ctx.fillStyle=`rgba(${ink.rock.kaolin},.55)`;ctx.font=plateFace(10,'sc');ctx.fillText(words.pace+(m%1?m.toFixed(1):m),cx,hy+6);
  // The rhythm of clean landings, as hands; and each charge held, as its mark.
  const right=W-26;let rx2=right;
  if(world.combo>1&&world.captures>0){const shown=Math.min(6,world.combo);
    for(let i=0;i<shown;i++){rockHand(rx2-10,top+11,15,ink.rock.redOchre,1,i%2);rx2-=22;}
    if(world.combo>6){ctx.textAlign='right';ctx.font=plateFace(10,'sc');ctx.fillStyle=`rgba(${ink.rock.kaolin},.6)`;ctx.fillText('×'+world.combo,right,top+24);}}
  let ix=right-8;const iy=top+40,p=world.player;
  if(p.shielded){rockSpiralMark(ix,iy,9,.85);ix-=24;}
  if(p.reflectorArmed){rockHand(ix,iy,10,ink.rock.kaolin,.8,true);ix-=24;}
  if(p.dawnArmed){ctx.save();ctx.translate(ix,iy);rockGlint(ctx,2.6,1,7);ctx.restore();ix-=24;}
  ctx.restore();
}
function rockRunningHead(){}
function rockChapterReveal(){}

// ---------- The ground: the wall, lit by one torch, and nothing else behind the marks ----------
function rockAtmosphere(){
  plateShift.x=0;plateShift.y=0;
  rockPaintWall();
  rockBuildLight();rockTorchPass();
}

defineHand('rock',{
  atmosphere:rockAtmosphere,
  node:rockNode,
  hazard:rockHazard,
  chasm:rockChasm,
  player:rockPlayer,
  dark:rockDark,
  plateFrame:rockPlateFrame,
  laid:rockLaid,
  figure:rockFigure,
  surveys:rockSurveys,
  hudLeaf:rockHudLeaf,
  runningHead:rockRunningHead,
  chapterReveal:rockChapterReveal,
  flourish:rockFlourish,
  trail:rockTrail,
  aim:rockAim,
  inkPath:rockInkPath,
  inscriptionInk:rockInscriptionInk,
  lenses:rockLenses,
  hazardReveal:rockHazardReveal
});

// ---------- The vocabulary: only what this era actually calls differently ----------
// Currency needs no renaming (ochre already), and the title is deliberately left untranslated — this
// era does not get its own frontispiece. Score is the tally, chapter is the chamber, and best is how
// deep the torch carried you (01-rock.md's Names table); the four chambers are its own signature sheet
// and the later panels its own enrichment adds, in that order. The daily plate is deliberately not
// attempted, and is not touched here at all — it is already hidden by data-era's own CSS rule.
// This wall has no script of its own, so everything set on it is a curator's gloss in plain modern
// English: short, capitalised where the atlas capitalises, but with none of the atlas's Latin and none
// of its printing-and-writing vocabulary (no pen, nib, ink, press, plate, sheet, chart, engraving,
// pricked line, frontispiece, atlas — the one exception is the door back out, which really does return
// to the atlas). The era's own terms, from 01-rock.md's Names table: a constellation is a cluster, a
// chapter a chamber, the score the tally, the best how deep the torch carried you, the currency the
// ochre the hand carries, the boundary the dark and the torch guttering, the traveller the hand and its
// crayon. What the atlas prices as a vortex, a flare and a wind-head this wall gives its own names —
// the Shaft, the Flare and the Draught — since the sky's own Latin never reached a cave wall.
defineVoice('rock',{
  chartNoun:'cluster',
  chartVerb:'marked',
  // The catalogue's twelve, named for the animal each is found as on this wall (ROCK_ANIMALS).
  chartNames:ROCK_ANIMALS.map(a=>a.name),
  chartSaid:'{chart} closes. Sixty toward the tally. The dark retreats for four seconds.',
  chapters:['THE HALL OF THE BULLS','THE SHAFT SCENE','THE PANEL OF HAND DOTS','NEWGRANGE'],
  chapterSaid:'Chamber {numeral}. {name}.',
  // A line for each chamber as it opens, set on the wall as a curator's note beside the hand. Each says
  // only what is actually known of the place it borrows its name from.
  chapterLines:[
    'Bulls painted over older bulls. No one knows how many hands.',
    'At the foot of the shaft: a bison, a bird on a stick, a fallen man. No one agrees what it means.',
    'Palms loaded with wet ochre and pressed to the rock, again and again.',
    'Five thousand years ago: a tomb built so the midwinter sunrise reaches its heart.'
  ],
  // A note for each animal as its cluster closes: one thing known of how the caves drew it, and where
  // a reading is only a reading, it says so.
  chartNotes:[
    'The largest Lascaux bull is over five metres long. Six dots on one shoulder may be the Pleiades, or may not.',
    'The most painted animal of the Ice Age caves.',
    'At Altamira the bison lie over bulges in the ceiling, so the rock gives them their bodies.',
    'Both horns drawn on a head seen from the side, as if it turned to look at you.',
    'A row of stags at Lascaux, heads raised, is read as a herd swimming a river.',
    'Rouffignac holds over a hundred and fifty mammoths, some traced with fingers in soft clay.',
    'Chauvet drew its lions without manes. So, it seems, were the real ones.',
    'Cave bears slept here long before anyone painted. Their claw marks are still on the walls.',
    'One Chauvet rhinoceros has its horn drawn again and again, as if to make it move.',
    'A few quick lines: the painters knew the hind well enough to leave most of her out.',
    'A many-legged animal at Altamira: a boar, some say; a bison, say others. Perhaps it is only running.',
    'At the Abri du Poisson a salmon a metre long is carved into the roof of the shelter.'
  ],
  opening:'The hand is raised. Tap to release. Follow the ochre dots for a clean landing. Circle a bright light to gain speed and to fill the hand. Every stroke spends ochre by the distance carried; hold a light to fill it again.',
  ended:'The torch gutters. Tally {score}. Deepest {best}. Strike again.',
  unrecorded:'A PREVIEW · NOT KEPT',
  newRecord:'A NEW DEPTH',
  // The wall's own names for the three fields the atlas prices as a vortex, a flare and a wind-head
  // (HAZARD_KINDS in simulation.js) — taught once per kind, the same as on the atlas, just in the
  // hand's own words rather than the sky's Latin.
  hazards:{vortex:'THE SHAFT',flare:'THE FLARE',wind:'THE DRAUGHT'},
  // The bare word for each of the three charges a run can carry, without the HELD suffix (below).
  labels:{shield:'THE SPIRAL',reflector:'THE TURNED HAND',dawn:'THE EMBER'},
  squareLanding:'A SQUARE LANDING',
  // The opening triad, read against ROCK_TRIAD above rather than restated: the Moon for Tiro, a bright
  // light for Adeptus, a faint one for Magister.
  pressures:{relaxed:'THE MOON',classic:'A BRIGHT LIGHT',hardcore:'A FAINT LIGHT'},
  pressureSet:'THE PACE IS SET · {label}',
  // Every loss the simulation can deal, in the wall's own terms — the chasm's own loss (what the pen
  // wrote on the atlas as a vortex swallowing the traveller) is the crack it actually is here.
  losses:{
    'THE DARK CAUGHT UP':'THE TORCH GUTTERED',
    'LEFT THE STAR CHART':'LOST IN THE DARK',
    'THE ORBIT FADED':'THE LIGHT WAS LOST',
    'THE NIB RAN DRY':'THE OCHRE RAN OUT',
    'FELL INTO THE CHASM':'THE WALL FELL AWAY',
    'DRAWN INTO A VORTEX':'DRAWN DOWN THE SHAFT',
    'SEARED BY A SUNSPOT FLARE':'BURNED AT THE FLARE'
  },
  // Every named feat the simulation can record, captioned in the curator's own gloss rather than the
  // atlas's Latin (see OBSERVATIONS in simulation.js for the keys this table must cover).
  observations:{
    perfectThree:'THREE CLEAN LANDINGS',
    skipFive:'FIVE LIGHTS SKIPPED',
    maxSpeed:'FULL SPEED ON THE WALL',
    graze:'THE SHAFT GRAZED AT FULL SPEED',
    pureChart:'A CLUSTER IN CLEAN LANDINGS',
    fortyRows:'THE FORTIETH ROW',
    threeMinutes:'THREE MINUTES BY TORCHLIGHT',
    rightAngle:'A SQUARE LANDING'
  },
  hud:{pace:'PACE ×',flow:'RHYTHM ×',shield:'THE SPIRAL HELD',reflector:'THE TURNED HAND HELD',dawn:'THE EMBER HELD'},
  // The halt, in the terms this era actually has: nothing here is printed, so there is no press to stand
  // idle and no pen to take up — only a hand holding ochre against a wall, and no frontispiece behind it.
  chrome:{
    brand:'THE ROCK',bestLabel:'Deepest',endTitle:'The hand rests.',pauseTitle:'The torch waits.',
    pauseEyebrow:'THE HAND IS STAYED',pauseNote:'Tap the wall to continue',pauseResume:'TAKE UP THE CRAYON',
    pauseLeave:'LEAVE THE WALL',pauseLabel:'Rest the hand',gameLabel:'The Rock, a playable Era I preview',
    canvasLabel:'The Rock. Guide a hand of ochre across torchlit stone through painted lights. Tap or press Space to release.',
    eraExit:'BACK TO THE ATLAS',eraExitLabel:'Back to the atlas',tryAgain:'Tap to strike again',
    statCaptures:'Lights',statPerfects:'Clean',statFlow:'Best rhythm',statRow:'Depth',
    reduceMotion:'STILL THE DUST',reduceMotionLabel:'Reduce motion and effects, for a lighter, faster run',
    instructions:{head:'HOW TO MARK IT',rules:['Tap to release the hand of ochre.','Circle a light to gain speed. Faster earns more.','Keep ahead of the rising dark.','Aim your first light — {pressures}.']}
  },
  tips:{
    first:'Tap when the ochre dots reach the next light.',
    dark:'Circle a bright light for speed. The dark grows faster.',
    faded:'A dim light fades. Move on before it goes.',
    vortex:'Close passes bend your path. Follow the curve and give the shaft room.',
    angle:'Land along the rim for a clean landing.',
    speed:'Clean landings keep your speed. Faster earns more.'
  },
  held:{
    choose:'The first light you circle sets how fast the dark comes.',
    dry:'The ochre is running low. Hold this light to fill it, or find a bright one.',
    sling:'One circle builds speed. Land clean and it holds.',
    release:'Tap when the ochre dots meet the next light.',
    bend:'The Shaft bends your path. Follow the curve; leave room for the drop.'
  },
  glosses:{
    slingshot:'SWING · SPEED ×{factor}',
    maxSpeed:'FULL SPEED · HOLD THE LINE',
    fullCharge:'FULL OCHRE · SPEED IS YOURS',
    rough:'ROUGH MARK · BASE {base}',
    skip:'{count} LIGHT{plural} SKIPPED · +{bonus}',
    reprieve:'MARK 3 LIGHTS · +60 & A REPRIEVE',
    slingOrbit:'CIRCLE TO GAIN SPEED · TAP TO LEAVE',
    fading:'FADING LIGHT · KEEP MOVING',
    golden:'A LUCKY FIND',
    perfectFlow:'CLEAN LANDING · RHYTHM ×{combo}',
    perfect:'CLEAN LANDING',
    wandering:'A DRIFTING LIGHT',
    chartProgress:'{chart} · {count} / 3',
    chartComplete:'{chart} · COMPLETE +60',
    angleBonus:'  ·  ANGLE +{bonus}',
    multiplier:'  ·  ×{mult}',
    shieldArmed:'{label} · TURNS ONE BLOW',
    shieldBreak:'{label} SPENT · TOOK THE HIT',
    reflectorArmed:'{label} · SENDS YOU BACK FROM THE EDGE',
    reflectorBreak:'{label} BOUNCED YOU BACK',
    dawnArmed:'{label} · HOLDS BACK THE DARK',
    dawnBreak:'{label} PUSHED THE DARK BACK',
    inkwellFound:'A BOLD MARK · A NEW COLOUR TAKES',
    inkwellDry:'THE OCHRE RUNS LOW · GO BOLD FIRST',
    observation:'MARKED · {name}',
    close:'CLOSE +5'
  }
});

// ---------- Invalidation ----------
// Drops every baked tile and sprite cache this file owns; invalidateArt() calls this alongside its own
// when the plate or the pixel ratio changes, so the next reach simply rebuilds lazily as it always did.
function invalidateRockArt(){
  rockWall=null;rockFace=null;rockFaceLayer=null;rockFaceKey='';rockFaceTone=null;rockFaceToneImg=null;rockFaceH=null;rockReliefSprites.clear();
  rockFlame=null;rockFlameKey='';rockLight=null;rockTorchAt=null;
  rockDabSprites.clear();rockPressSprites.clear();
  rockEdgeShapes.clear();
  rockShaftSprites.clear();rockChasmSprites.clear();rockNicheSprites.clear();
  rockCrayon=null;rockCrayonKey='';rockHandSprites.clear();rockHudTopPx=null;
  rockCoreArt=null;rockCoreKey='';
}
