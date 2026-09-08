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
    stone:'186,176,158',shaft:'4,3,3',dark:'2,2,2',
    ambient:'36,31,27',torchWarm:'206,176,140',torchFar:'150,126,100',
    crust:'232,218,186',scar:'210,196,166',stain:'160,120,64',crack:'46,39,33',facePale:'182,176,166',faceDeep:'90,84,80'},
  paper:{redOchre:'156,59,34',ochre:'201,150,46',ochreDeep:'169,112,31',manganese:'33,31,30',charcoal:'44,38,34',
    kaolin:'234,225,207',ember:'255,201,122',emberCore:'255,247,225',flare:'228,90,32',
    stone:'186,176,158',shaft:'4,3,3',dark:'2,2,2',
    ambient:'36,31,27',torchWarm:'206,176,140',torchFar:'150,126,100',
    crust:'232,218,186',scar:'210,196,166',stain:'160,120,64',crack:'46,39,33',facePale:'182,176,166',faceDeep:'90,84,80'}
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
  const {HL,CR,SA,SZ,ST,HN,GR,FM,H,CM,SM}=F,NW=ROCK_NW,Q=ROCK_Q,QW=ROCK_QW,QH=ROCK_QH;
  for(let y=y0;y<y1;y++){
    const fy=(y+.5)/Q-.5,iy=Math.floor(fy),ty=fy-iy,qy0=((iy+QH)%QH)*QW,qy1=((iy+1)%QH)*QW,row=y*NW;
    for(let x=0;x<NW;x++){
      const i=row+x,x0=rockQX0[x],x1=rockQX1[x],tx=rockQTX[x],a0=qy0+x0,a1=qy0+x1,b0=qy1+x0,b1=qy1+x1;
      const hl=(HL[a0]+(HL[a1]-HL[a0])*tx)*(1-ty)+(HL[b0]+(HL[b1]-HL[b0])*tx)*ty;
      const crv=(CR[a0]+(CR[a1]-CR[a0])*tx)*(1-ty)+(CR[b0]+(CR[b1]-CR[b0])*tx)*ty;
      const sav=(SA[a0]+(SA[a1]-SA[a0])*tx)*(1-ty)+(SA[b0]+(SA[b1]-SA[b0])*tx)*ty;
      let h=Math.imul(x,0x9E3779B1)^Math.imul(y,0x85EBCA77);h=Math.imul(h^(h>>>15),0x2C1B3C6D);h^=h>>>13;
      const t1=(h&255)*ROCK_K-.5,hn=HN[i]*ROCK_K-.5;
      const cm=rockStep(.80,.83,crv+hn*.14+t1*.006),sm=rockStep(.78,.80,sav+hn*.2+t1*.01)*SZ[a0],th=cm*ST[a0];
      H[i]=hl+hn*.05+cm*.003+GR[i]*ROCK_K*.011*th-sm*.006-FM[i]*ROCK_K*.006;
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
      const lam=Math.min(1.28,Math.max(.06,((.60*gy-.62*gx)*40+bl+cm*.03)*(1-th*(1-gr)*.16)*(1-cm*(1-cm)*.35)+t1*(.06+cm*.03)));
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
  const S=new Float32Array(N),HN=new Uint8Array(N),GR=new Uint8Array(N),FM=new Uint8Array(N);
  const cr=seeded(0xc4a2e),cn=ROCK_CW*ROCK_CH,FX=new Float32Array(cn),FY=new Float32Array(cn),FA=new Uint8Array(cn);
  for(let k=0;k<cn;k++){FX[k]=cr();FY[k]=cr();FA[k]=cr()<.015?1:0;}
  const c=makeCanvas(NW,NH),g=c.getContext('2d'),img=g.createImageData(NW,NH),tok=n=>ink.rock[n].split(',').map(Number);
  const F={HL,BL,CR,SF,ST,SZ,MP,MN,SA,CZ,HN,GR,FM,H:S,CM:new Uint8Array(N),SM:new Uint8Array(N),FX,FY,FA,d:img.data,
    st:tok('stone'),cu:tok('crust'),sc:tok('scar'),ir:tok('stain'),mg:tok('manganese'),ck:tok('crack')};
  let wy=0;for(let i=0;i<ROCK_QN;i++)if(CZ[i]>.5){wy=Math.min(NH-16,((i/QW)|0)*Q);break;}
  rockHeightPass(F,wy,wy+16);rockShadePass(F,wy,wy+16);
  rockBuild(S,NW,NH,1,[[24,20,1,505],[12,10,.3,606]]);for(let i=0;i<N;i++)HN[i]=S[i]*255;
  rockBuild(S,NW,NH,1,[[3,3,1,1616]]);for(let i=0;i<N;i++)GR[i]=S[i]*255;
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
const ROCK_CHUNK=600,ROCK_REACH=1800,ROCK_FACE_UP=.34,ROCK_FACE_DOWN=.11,ROCK_TONE_Q=8,ROCK_OPENING_Y=-60,ROCK_OPENING_R=330;
function rockHash(a,b,c){let h=Math.imul(a^0x9E3779B1,0x85EBCA77)^Math.imul(b+0x27d4eb2f,0xC2B2AE3D)^Math.imul(c+0x165667b1,0x27D4EB2F);h=Math.imul(h^(h>>>15),0x2C1B3C6D);h^=h>>>13;h=Math.imul(h,0x297A2D39);h^=h>>>16;return (h>>>0)/4294967296;}
// Value noise on the world's own plane, one octave, read at a point rather than baked to a lattice.
function rockWorldNoise(x,y,cell,seed){
  const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=rockSS(fx-ix),ty=rockSS(fy-iy);
  const a=rockHash(seed,ix,iy),b=rockHash(seed,ix+1,iy),c=rockHash(seed,ix,iy+1),d=rockHash(seed,ix+1,iy+1);
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
  const C=ROCK_CHUNK,h=rockHash(seed+ci*7919,cj*104729,1),count=h<.25?0:h<.72?1:h<.95?2:3;
  for(let f=0;f<count;f++){
    const hf=k=>rockHash(seed+ci*7919+f*131,cj*104729+f*17,k);
    const w=rockFissureWalk((ci+hf(2))*C,(cj+hf(3))*C,hf(4)*TAU,600+hf(5)*1000,5+hf(6)*9,(hf(11)-.5)*.34,hf,hf(9)<.6?(hf(10)<.5?1:-1):0,out);
    // A branch at most once, from a point in the middle reaches, striking off to one side and thinner.
    if(w&&hf(12)<.35){const n=w.pts.length/2,bi=Math.floor(n*(.3+hf(13)*.4)),hb=k=>hf(k+200);
      rockFissureWalk(w.pts[bi*2],w.pts[bi*2+1],w.as[bi]+(hf(14)<.5?1:-1)*(.7+hf(15)*.6),(600+hf(5)*1000)*(.3+hf(16)*.3),(5+hf(6)*9)*.6,(hf(17)-.5)*.2,hb,w.step,out);}
  }
}
let rockFace=null,rockFaceKey='',rockFaceY=0,rockFaceTop=0,rockFaceTone=null,rockFaceToneImg=null;
function rockBakeFace(camY){
  const tok=k=>ink.rock[k].split(',').map(Number),pale=tok('facePale'),deep=tok('faceDeep'),shaft=ink.rock.shaft,crack=ink.rock.crack,lip=ink.rock.kaolin;
  const up=H*ROCK_FACE_UP,down=H*ROCK_FACE_DOWN,sheetH=H+up+down,cw=Math.max(1,Math.ceil(W*DPR)),ch=Math.max(1,Math.ceil(sheetH*DPR));
  if(!rockFace||rockFace.width!==cw||rockFace.height!==ch)rockFace=makeCanvas(cw,ch);
  const g=rockFace.getContext('2d');g.setTransform(DPR,0,0,DPR,0,0);g.globalCompositeOperation='source-over';
  const seed=world.seed>>>0,X=x=>W*.5+x*scale,Y=y=>(y-camY)*scale+up;
  // The tone of the plane: a slow field on the world, read a sample every few pixels and stretched up
  // smooth, since it has nothing finer in it. The opening plane is a pale lift around the first screen,
  // where the triad has to read before any caption could, and the plane darkens toward the sides of a
  // wide sheet, where the light does not reach.
  const tw=Math.ceil(W/ROCK_TONE_Q),th=Math.ceil(sheetH/ROCK_TONE_Q);
  if(!rockFaceTone||rockFaceTone.width!==tw||rockFaceTone.height!==th){rockFaceTone=makeCanvas(tw,th);rockFaceToneImg=rockFaceTone.getContext('2d').createImageData(tw,th);}
  const td=rockFaceToneImg.data;
  for(let j=0;j<th;j++)for(let i=0;i<tw;i++){
    const wx=((i+.5)*ROCK_TONE_Q-W*.5)/scale,wy=camY+((j+.5)*ROCK_TONE_Q-up)/scale;
    const n=.55*rockWorldNoise(wx,wy,520,seed+1)+.3*rockWorldNoise(wx,wy,210,seed+2)+.15*rockWorldNoise(wx,wy,90,seed+3);
    let t=.5+(n-.5)*.9;const lift=rockStep(.42,1,1-(Math.hypot(wx,wy-ROCK_OPENING_Y)-200)/460);t+=(1-t)*lift*.8;t*=1-.4*Math.min(1,(wx/700)*(wx/700));
    const o=(j*tw+i)*4;td[o]=deep[0]+(pale[0]-deep[0])*t;td[o+1]=deep[1]+(pale[1]-deep[1])*t;td[o+2]=deep[2]+(pale[2]-deep[2])*t;td[o+3]=255;
  }
  rockFaceTone.getContext('2d').putImageData(rockFaceToneImg,0,0);g.drawImage(rockFaceTone,0,0,W,sheetH);
  // Every fissure seeded within reach of this sheet, walked again.
  const C=ROCK_CHUNK,R=ROCK_REACH,wx0=-W*.5/scale-R,wx1=W*.5/scale+R,wy0=camY-up/scale-R,wy1=camY+(H+down)/scale+R,walks=[];
  for(let cj=Math.floor(wy0/C);cj<=Math.floor(wy1/C);cj++)for(let ci=Math.floor(wx0/C);ci<=Math.floor(wx1/C);ci++)rockChunkFissures(seed,ci,cj,walks);
  // The frontispiece is composed, not dealt: whatever the seed, two fissures frame the opening plane
  // by hand — one across the top above the triad, one across the foot below the ring — placed to run
  // clear of every mark, which is why they alone may cross the disc the seeded ones stop at.
  const hand=k=>rockHash(0x5ca1e,k,k*7+1);
  rockFissureWalk(-340,-450,.1,760,8,.01,k=>hand(k),1,walks,true,.12);
  rockFissureWalk(360,300,Math.PI+.15,640,7,-.02,k=>hand(k+300),-1,walks,true,.12);
  // The lamp is above and to the right. Where a fissure carries a step, the higher side throws its
  // shadow across the lower where the step faces away from the lamp and shows a lit lip where it faces
  // it; every fissure darkens the rock a little to both sides; and the crack itself goes to black, as
  // wide as the walk says at that reach and no wider. Shadows first, then margins, lips and cores, so
  // no fissure's soft edge lies over another's cut.
  const LX=.707,LY=-.707;g.lineCap='round';
  const seg=(w,i,ox,oy)=>{g.beginPath();g.moveTo(X(w.pts[i*2])+ox,Y(w.pts[i*2+1])+oy);g.lineTo(X(w.pts[i*2+2])+ox,Y(w.pts[i*2+3])+oy);g.stroke();};
  const each=fn=>{for(const w of walks){const n=w.pts.length/2;for(let i=0;i+1<n;i++){const wd=(w.ws[i]+w.ws[i+1])/2;if(wd<.12)continue;
    const dx=w.pts[i*2+2]-w.pts[i*2],dy=w.pts[i*2+3]-w.pts[i*2+1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w.step,ny=dx/l*w.step,facing=nx*LX-ny*LY;fn(w,i,wd,nx,ny,facing);}}};
  each((w,i,wd,nx,ny,facing)=>{if(!w.step)return;const sh=Math.max(0,-facing)*.4+.06;g.strokeStyle=`rgba(${crack},${sh.toFixed(3)})`;g.lineWidth=wd*1.8+4;seg(w,i,nx*(wd*.8+2),ny*(wd*.8+2));});
  each((w,i,wd)=>{g.strokeStyle=`rgba(${crack},.45)`;g.lineWidth=wd*3+3;seg(w,i,0,0);});
  each((w,i,wd,nx,ny,facing)=>{if(!w.step||facing<=0||wd<1||rockHash(w.pts.length,i>>1,4)<.35)return;g.strokeStyle=`rgba(${lip},${(facing*.5).toFixed(3)})`;g.lineWidth=1.5;seg(w,i,-nx*(wd*.5+1.2),-ny*(wd*.5+1.2));});
  each((w,i,wd)=>{g.strokeStyle=`rgba(${shaft},.95)`;g.lineWidth=wd;seg(w,i,0,0);});
  rockFaceY=camY;rockFaceTop=up;
}
function rockPaintFace(){
  const key=W+'x'+H+'@'+DPR+'/'+scale.toFixed(4)+'#'+(world.seed>>>0),dy=(world.cameraY-rockFaceY)*scale;
  if(rockFaceKey!==key||dy<-H*ROCK_FACE_UP*.85||dy>H*ROCK_FACE_DOWN*.85){rockBakeFace(world.cameraY);rockFaceKey=key;}
  ctx.save();ctx.globalCompositeOperation='overlay';ctx.drawImage(rockFace,0,-rockFaceTop-(world.cameraY-rockFaceY)*scale,W,rockFace.height/DPR);ctx.restore();
}

// The torch's own reach, in view space rather than world space — a light left behind in world space
// would slide off the top of the sheet the instant the traveller climbed past it. Rebuilt whenever the
// viewport's own size changes; never rebuilt for a scroll.
let rockTorch=null,rockTorchKey='';
function rockBakeTorch(){
  const key=W+'x'+H;
  if(rockTorch&&rockTorchKey===key)return rockTorch;
  const c=makeCanvas(Math.max(1,Math.round(W)),Math.max(1,Math.round(H))),g=c.getContext('2d');
  g.fillStyle=`rgb(${ink.rock.ambient})`;g.fillRect(0,0,W,H);
  const tx=W*.44,ty=H*.70;
  g.globalCompositeOperation='lighter';
  const near=g.createRadialGradient(tx,ty,8,tx,ty,H*.86);
  near.addColorStop(0,`rgba(${ink.rock.emberCore},1)`);near.addColorStop(.46,`rgba(${ink.rock.torchWarm},.58)`);near.addColorStop(1,`rgba(${ink.rock.torchWarm},0)`);
  g.fillStyle=near;g.fillRect(0,0,W,H);
  const far=g.createRadialGradient(tx,ty,H*.42,tx,ty,H*1.6);
  far.addColorStop(0,`rgba(${ink.rock.torchFar},.42)`);far.addColorStop(1,`rgba(${ink.rock.torchFar},0)`);
  g.fillStyle=far;g.fillRect(0,0,W,H);
  // A fire, low and to the left and out of the frame, throwing its own colour up the nearest rock — a
  // second source, and a warm one, so the pool of the torch is not the only light on the sheet.
  const fire=g.createRadialGradient(W*.04,H*1.04,4,W*.04,H*1.04,H*.62);
  fire.addColorStop(0,`rgba(${ink.rock.ember},.9)`);fire.addColorStop(.3,`rgba(${ink.rock.flare},.5)`);fire.addColorStop(1,`rgba(${ink.rock.flare},0)`);
  g.fillStyle=fire;g.fillRect(0,0,W,H);
  rockTorch=c;rockTorchKey=key;return rockTorch;
}
// Multiplied over whatever is already on the canvas: full strength over the wall alone (drawn from
// rockAtmosphere, before a single mark is on it) and again at .42 over the whole composited frame
// (drawn from rockDark, the last of this era's own painters to run), so the wall takes the whole fall
// of the flame and the marks laid on it keep under half of that loss.
function rockTorchPass(strength){
  ctx.save();ctx.globalCompositeOperation='multiply';if(strength!==undefined)ctx.globalAlpha=strength;
  ctx.drawImage(rockBakeTorch(),0,0,W,H);ctx.restore();
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

// ---------- The body: what has been learned, staged over the observation clock alone ----------
function rockCore(r,tier){return r*(tier==='moon'?.94:tier==='faint'?.6:.72);}
function rockTone(tier){return tier==='moon'?ink.rock.kaolin:tier==='faint'?ink.rock.ochre:ink.rock.redOchre;}
// `taken` is revealNode's own pen.taken — 0 until the body has ever been orbited, then a fast fade to 1
// — except a difficultyChoice body, which the design already draws whole before it is observed (see
// reveal.js's own comment on pen.d): the choice has to read before any caption could, on a sheet that
// has none, so its taken-ness is never gated at all.
function rockBody(n,x,y,r,tier,d,taken,relief){
  if(taken<=0)return;
  const core=rockCore(r,tier),tone=rockTone(tier),moon=tier==='moon',bright=tier==='bright'||tier==='major';
  // Wet pigment pools in a dish and starves over a rise, where the wall's own tooth comes up through it
  // sooner — the same attested observation from the other side (prototypes/rock.html does the same).
  const pool=relief<0?1.15:relief>0?.85:1,starve=relief>0?1.3:1;
  // Colour before contour: the crude mass a hand lays down at the capture itself, ungated by d.
  rockWash(ctx,x,y,core*1.06,tone,(moon?.17:.58)*taken*pool,moon?18:12,n.seed+91);
  const edge=rockSpan(d,ROCK_STAGE.edge),tooth=rockSpan(d,ROCK_STAGE.tooth),marks=rockSpan(d,ROCK_STAGE.marks),detail=rockSpan(d,ROCK_STAGE.detail);
  if(marks>0){
    // Not a bigger dab: the same seeded scatter carried further, since raising n only ever adds.
    const base=moon?58:tier==='major'?46:bright?40:22;
    rockWash(ctx,x,y,core,tone,(moon?.15:.5)*Math.min(1,.35+marks)*taken*pool,Math.round(base*marks),n.seed);
  }
  if(tooth>0){
    // The wall's own mineral speckle coming up through the pigment as it is worked — not a drawn line,
    // which is why both blacks sit in it together (see the palette note above).
    ctx.save();rockEdgePath(ctx,x,y,core,n.seed^0x51ed);ctx.clip();
    const rnd=seeded((n.seed^0x2ba9)>>>0||7),count=moon?26:40;
    for(let i=0;i<count;i++){
      const a=rnd()*TAU,rr=Math.sqrt(rnd())*core;
      rockDab(ctx,x+Math.cos(a)*rr,y+Math.sin(a)*rr,(.7+rnd()*1.4)*scale,rnd()<.4?ink.rock.charcoal:ink.rock.manganese,(.05+rnd()*.12)*tooth*taken*starve,n.seed+i+30);
    }
    ctx.restore();
  }
  if(edge>0){
    ctx.save();rockEdgePath(ctx,x,y,core*1.03,n.seed^0x51ed);
    ctx.strokeStyle=`rgba(${moon?ink.rock.manganese:ink.rock.charcoal},${.3*edge*taken})`;ctx.lineWidth=(.9+.9*edge)*scale;ctx.stroke();ctx.restore();
  }
  // What the body is, rather than that it is: the last thing the orbit pays for.
  if(detail>0){
    if(moon){
      for(let i=0;i<7;i++){const rnd=seeded(n.seed+i*13);
        rockDab(ctx,x+(rnd()*2-1)*core*.5,y+(rnd()*2-1)*core*.5,(5+rnd()*5)*(.45+.55*detail)*scale,ink.rock.manganese,.8*detail*taken,n.seed+i);}
    }else if(bright){
      for(let i=0;i<7;i++){const a=i/7*TAU+n.seed,rr=core*1.24;
        rockDab(ctx,x+Math.cos(a)*rr,y+Math.sin(a)*rr,(3.2+1.6*detail)*scale,ink.rock.manganese,.7*detail*taken,n.seed+i+7);}
    }else rockDab(ctx,x,y,3.2*scale,ink.rock.manganese,.55*detail*taken,n.seed+3);
  }
}
function rockPhenomenon(n,x,y,r){
  const pulse=.28+.14*(reducedMotion?0:Math.sin(world.time/.6+n.seed));
  rockDab(ctx,x,y,r*.52,ink.rock.ochre,pulse*1.05,n.seed);
}

// ---------- The ring: where an observation is possible, structurally unchanged while it is made ----------
// 28 dabs at the node's own capture radius, never staged wider or narrower and never re-seeded, so the
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
    rockDab(ctx,x+Math.cos(a)*cap,y+Math.sin(a)*cap,3.2*Math.max(.55,state)*scale,ink.rock.redOchre,.5*state,n.seed+i);
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
      rockDab(ctx,Math.cos(wa)*rad,Math.sin(wa)*rad,2.2*scale,ink.rock.ochre,.5,n.seed+i*17+3);
    }
    // One struck deeper — kaolin over manganese — at the middle of each run that actually threads clear
    // of every hazard; a run with none is left with only the row above, so danger reads as an absence.
    for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
      if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
      const mx=Math.cos(path.angle)*rad,my=Math.sin(path.angle)*rad;
      rockDab(ctx,mx,my,4.6*scale,ink.rock.manganese,.7,n.seed+900);
      rockDab(ctx,mx,my,3*scale,ink.rock.kaolin,.85,n.seed+901);
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
// The Shaft: a true black void with a pecked rim. The eye is drawn down into it; it is not a whirlpool,
// so nothing here turns — only the gradient's own reach and the ten pecks ringing the core.
const rockShaftSprites=new Map();
function rockShaftSprite(reach,core){
  const rB=Math.max(2,Math.round(reach)),cB=Math.max(1,Math.round(core)),key=rB+':'+cB+':'+DPR.toFixed(2);
  const cached=rockShaftSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil(rB*2.1)),px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const gr=g.createRadialGradient(0,0,2,0,0,rB);
  gr.addColorStop(0,`rgba(${ink.rock.shaft},.95)`);gr.addColorStop(.45,`rgba(${ink.rock.shaft},.7)`);gr.addColorStop(1,`rgba(${ink.rock.shaft},0)`);
  g.fillStyle=gr;g.beginPath();g.arc(0,0,rB,0,TAU);g.fill();
  g.fillStyle=`rgb(${ink.rock.shaft})`;g.beginPath();g.arc(0,0,cB,0,TAU);g.fill();
  const sprite={canvas:c,size};rockShaftSprites.set(key,sprite);
  if(rockShaftSprites.size>16)rockShaftSprites.delete(rockShaftSprites.keys().next().value);
  return sprite;
}
function rockShaft(h,x,y){
  const reach=gravityRadius(h)*scale,core=hazardCore(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const sprite=rockShaftSprite(reach,core);
  ctx.drawImage(sprite.canvas,x-sprite.size/2,y-sprite.size/2,sprite.size,sprite.size);
  for(let i=0;i<10;i++){const a=(h.phase||0)+i/10*TAU;rockPeck(ctx,x+Math.cos(a)*core*1.15,y+Math.sin(a)*core*1.15,3.4*scale,.85);}
}
// The Flare: an ember-red core under soot, breathing gently, deliberately not the traveller's own warm
// glow — an early pass of the spike let the two share one and they read as the same thing at a glance.
// Sixteen sooty manganese dabs orbit outside the glow rather than inside it.
const rockFlareSprites=new Map();
function rockFlareGlowSprite(core){
  const cB=Math.max(1,Math.round(core)),key=cB+':'+DPR.toFixed(2);
  const cached=rockFlareSprites.get(key);if(cached)return cached;
  const reach=cB*1.15,size=Math.max(4,Math.ceil(reach*2.3)),px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const gr=g.createRadialGradient(0,0,0,0,0,reach);
  gr.addColorStop(0,`rgba(${ink.rock.flare},.9)`);gr.addColorStop(.55,`rgba(${ink.rock.redOchre},.45)`);gr.addColorStop(1,`rgba(${ink.rock.redOchre},0)`);
  g.fillStyle=gr;g.beginPath();g.arc(0,0,reach,0,TAU);g.fill();
  const sprite={canvas:c,size};rockFlareSprites.set(key,sprite);
  if(rockFlareSprites.size>16)rockFlareSprites.delete(rockFlareSprites.keys().next().value);
  return sprite;
}
function rockFlare(h,x,y){
  const core=hazardCore(h)*scale,reach=gravityRadius(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const t=reducedMotion?0:world.time,breathe=1+(reducedMotion?0:Math.sin(t*7+(h.phase||0))*.03);
  const sprite=rockFlareGlowSprite(core),bs=sprite.size*breathe;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(sprite.canvas,x-bs/2,y-bs/2,bs,bs);ctx.restore();
  for(let i=0;i<16;i++){
    const a=i/16*TAU,dd=core*1.35+(reducedMotion?0:Math.sin(t*4+i)*3*scale);
    rockDab(ctx,x+Math.cos(a)*dd,y+Math.sin(a)*dd,(7+(i*7)%5)*scale,ink.rock.manganese,.5,h.seed+i);
  }
}
// The Draught: a streaked charcoal smear dragged sideways, a torch-flame bent by real cave airflow.
// Baked once per hazard along local +x and rotated live to h.dir, so nothing about its own shape is
// rebuilt from one frame to the next.
const rockDraughtSprites=new Map();
function rockDraughtSprite(seed,reach){
  const rB=Math.max(2,Math.round(reach)),key=(seed>>>0)+':'+rB+':'+DPR.toFixed(2);
  const cached=rockDraughtSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil(rB*2.2)),px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  const rnd=seeded((seed>>>0)||1);
  for(let i=0;i<8;i++){
    const lane=(i/7-.5)*rB*1.1,len=rB*(.5+rnd()*.55),jog=(rnd()*2-1)*rB*.08;
    rockScratch(g,-len*.5,lane,len*.5,lane+jog,1.3+rnd()*1.4,.6+rnd()*.25,false);
  }
  const sprite={canvas:c,size};rockDraughtSprites.set(key,sprite);
  if(rockDraughtSprites.size>16)rockDraughtSprites.delete(rockDraughtSprites.keys().next().value);
  return sprite;
}
function rockDraught(h,x,y){
  const reach=gravityRadius(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const sprite=rockDraughtSprite(h.seed,reach);
  ctx.save();ctx.translate(x,y);ctx.rotate(h.dir||0);
  ctx.drawImage(sprite.canvas,-sprite.size/2,-sprite.size/2,sprite.size,sprite.size);
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

// ---------- The traveller: not the crayon, the point on it actually touching the wall ----------
// A lump of ground haematite worked to a blunt contact point, held point-first — no vane, no
// aerodynamic taper, because nothing about mined stone needs to look like it is flying. Baked once,
// since it is one tool rather than a body keyed by seed, and rotated live to the heading of travel.
let rockCrayon=null,rockCrayonKey='';
function rockCrayonSprite(){
  const key=DPR.toFixed(2);if(rockCrayon&&rockCrayonKey===key)return rockCrayon;
  const rx=17,ry=9,pad=6,size=(rx+pad)*2,px=Math.max(1,Math.round(size*DPR));
  const c=makeCanvas(px,px),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  // A closed, wavering silhouette exactly like a body's own edge, but elongated and squashed toward
  // local +x — the direction of travel — into the one blunt working point, baked once since this is
  // one tool rather than a body keyed by seed. Building the point array here costs nothing: the whole
  // function only ever runs again if the pixel ratio changes.
  const rnd=seeded(4051),steps=14,pts=[];
  for(let i=0;i<steps;i++){
    const a=i/steps*TAU,taper=1-Math.max(0,Math.cos(a))*.72,jit=1+(rnd()-.5)*.22;
    pts.push([Math.cos(a)*rx*taper*jit,Math.sin(a)*ry*taper*jit]);
  }
  const f=pts[0],l=pts[steps-1];
  g.beginPath();g.moveTo((f[0]+l[0])/2,(f[1]+l[1])/2);
  for(let i=0;i<steps;i++){const a=pts[i],b=pts[(i+1)%steps];g.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}
  g.closePath();
  g.fillStyle=`rgba(${ink.rock.ochreDeep},1)`;g.fill();
  g.strokeStyle=`rgba(${ink.rock.charcoal},.5)`;g.lineWidth=1;g.stroke();
  const sprite={canvas:c,size};rockCrayon=sprite;rockCrayonKey=key;return sprite;
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
  // A short trail of fading ember dabs, sampled off the same shared trail every other era's own
  // traveller mark rides, so the era's tail keeps whatever cadence the rest of the chart already keeps.
  for(let i=0;i<world.trail.length;i++){
    const s=world.trail[i],age=world.time-s.time,life=clamp(1-age/TRAIL_LIFE,0,1);if(life<=0)continue;
    rockDab(ctx,sx(s.x),sy(s.y),(1.6+2*life)*scale,ink.rock.ember,.35*life,i+7);
  }
  // Everything from here in is one rigid tool: translate to the travelling point, face the heading of
  // travel, and scale by the chart's own scale exactly as every other mark on it does.
  ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);
  const crayon=rockCrayonSprite();
  ctx.drawImage(crayon.canvas,-crayon.size*.72,-crayon.size*.5,crayon.size,crayon.size);
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
const rockChipRng=seeded(50221);
const ROCK_CHIP_N=22;
const rockChips=Array.from({length:ROCK_CHIP_N},()=>({x:rockChipRng(),phase:rockChipRng(),speed:.4+rockChipRng()*.5,size:.8+rockChipRng()*1.6,drift:rockChipRng()*TAU}));
let rockDarkEdge=null,rockDarkEdgeW=-1,rockDarkStep=0;
function rockEnsureDarkEdge(){
  const wB=Math.round(W/8)*8;
  if(rockDarkEdge&&rockDarkEdgeW===wB)return;
  const step=Math.max(1,26*scale),n=Math.max(8,Math.ceil(W/step)+3);
  const rnd=seeded(9001),pts=new Float32Array(n);
  for(let i=0;i<n;i++)pts[i]=rnd()*2-1;
  rockDarkEdge=pts;rockDarkEdgeW=wB;rockDarkStep=step;
}
function rockDark(dt){
  const fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);
  if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  rockTorchPass(.42);
  rockEnsureDarkEdge();
  const time=reducedMotion?0:world.time,lip=3*scale;
  ctx.save();
  ctx.fillStyle=`rgba(${ink.rock.dark},.94)`;
  ctx.beginPath();ctx.moveTo(-10,fy+rockDarkEdge[0]*16*scale);
  for(let i=0;i<rockDarkEdge.length;i++)ctx.lineTo(-40*scale+i*rockDarkStep,fy+rockDarkEdge[i]*16*scale);
  ctx.lineTo(W+10,H+10);ctx.lineTo(-10,H+10);ctx.closePath();ctx.fill();
  ctx.strokeStyle=`rgba(${ink.rock.charcoal},${.55+near*.2})`;ctx.lineWidth=Math.max(1,4*scale);ctx.stroke();
  ctx.strokeStyle=`rgba(${ink.rock.kaolin},${.28+near*.18})`;ctx.lineWidth=Math.max(.7,1.3*scale);
  ctx.beginPath();ctx.moveTo(-10,fy+rockDarkEdge[0]*16*scale-lip);
  for(let i=0;i<rockDarkEdge.length;i++)ctx.lineTo(-40*scale+i*rockDarkStep,fy+rockDarkEdge[i]*16*scale-lip);
  ctx.stroke();
  for(const chip of rockChips){
    const phase=(chip.phase+time*chip.speed)%1,cx=chip.x*W+Math.sin(time*.3+chip.drift)*3*scale,cy=fy-(2+phase*22)*scale;
    if(cy<-10||cy>H+10)continue;
    rockDab(ctx,cx,cy,chip.size*scale*(1-phase*.4),ink.rock.charcoal,(1-phase)*.4*(.6+near*.4),Math.floor(chip.x*1000)+1);
  }
  ctx.restore();
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
function rockFigure(){}
function rockSurveys(){}
// And three fixtures of the printed sheet that a wall simply does not have: the leaf of ground the
// atlas lays under its running numbers, the plate's number and name engraved at the foot, and the
// chapter title written across the sheet as a new plate opens. A cave has no foot and no title page,
// the chamber it names is announced in the live region instead, and a soft patch of paper laid under
// the HUD reads on lit limestone as exactly what it is — a patch of paper. The counts themselves are
// still owed the player and are still set, in the modern hand this era admits to; what is dropped is
// the furniture that would have carried them on a sheet.
function rockHudLeaf(){}
function rockRunningHead(){}
function rockChapterReveal(){}

// ---------- The ground: the wall, lit by one torch, and nothing else behind the marks ----------
function rockAtmosphere(){
  plateShift.x=0;plateShift.y=0;
  rockPaintWall();
  rockTorchPass();
}

defineHand('rock',{
  atmosphere:rockAtmosphere,
  node:rockNode,
  hazard:rockHazard,
  player:rockPlayer,
  dark:rockDark,
  plateFrame:rockPlateFrame,
  laid:rockLaid,
  figure:rockFigure,
  surveys:rockSurveys,
  hudLeaf:rockHudLeaf,
  runningHead:rockRunningHead,
  chapterReveal:rockChapterReveal,
  flourish:rockFlourish
});

// ---------- The vocabulary: only what this era actually calls differently ----------
// Currency needs no renaming (ochre already), and the title is deliberately left untranslated — this
// era does not get its own frontispiece. Score is the tally, chapter is the chamber, and best is how
// deep the torch carried you (01-rock.md's Names table); the four chambers are its own signature sheet
// and the later panels its own enrichment adds, in that order. The daily plate is deliberately not
// attempted, and is not touched here at all — it is already hidden by data-era's own CSS rule.
defineVoice('rock',{
  chartNoun:'cluster',
  chartSaid:'{chart} closes. Sixty toward the tally. The dark retreats for four seconds.',
  chapters:['THE HALL OF THE BULLS','THE SHAFT SCENE','THE PANEL OF HAND DOTS','NEWGRANGE'],
  chapterSaid:'Chamber {numeral}. {name}.',
  ended:'The torch gutters. Tally {score}. Deepest {best}. Strike again.',
  // The halt, in the terms this era actually has: nothing here is printed, so there is no press to stand
  // idle and no pen to take up — only a hand holding ochre against a wall, and no frontispiece behind it.
  chrome:{bestLabel:'Deepest',pauseEyebrow:'THE HAND IS STAYED',pauseNote:'Tap the wall to continue',pauseResume:'TAKE UP THE CRAYON',pauseLeave:'LEAVE THE WALL'}
});

// ---------- Invalidation ----------
// Drops every baked tile and sprite cache this file owns; invalidateArt() calls this alongside its own
// when the plate or the pixel ratio changes, so the next reach simply rebuilds lazily as it always did.
function invalidateRockArt(){
  rockWall=null;rockFace=null;rockFaceKey='';rockFaceTone=null;rockFaceToneImg=null;rockReliefSprites.clear();
  rockTorch=null;rockTorchKey='';
  rockDabSprites.clear();
  rockEdgeShapes.clear();
  rockShaftSprites.clear();rockFlareSprites.clear();rockDraughtSprites.clear();
  rockCrayon=null;rockCrayonKey='';
  rockCoreArt=null;rockCoreKey='';
  rockDarkEdge=null;rockDarkEdgeW=-1;
}
