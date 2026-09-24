'use strict';
/* Orbit · src/scroll.js
   Era III, The Scroll: the sky as a Bureau's own record, brushed on hemp paper after the Dunhuang star
   chart (British Library Or.8210/S.3326, c. 649–684 CE). */
// Like the Rock, this era is a hand and not a fork: a small set of painters registered by name in
// `defineHand` below, reached by the pipeline in frame.js wherever it would otherwise draw the atlas's
// own, with everything it does not name still the atlas's. See docs/archive/eras/03-scroll.md for what
// the era is, and docs/archive/eras/prototypes/scroll.html for the standalone sheet every mark here is
// ported from. None of the physics comes with it; the simulation is and stays OrbitWorld.
//
// What the sheet argues, in one line: a light is not a picture to be traced but a position to be filed.
// A body starts as a hollow point with no identity; holding its orbit joins it to its neighbours with a
// brush line, closes the group inside a boundary and gives it one of three school colours — Gan De's
// black, Shi Shen's cinnabar, Wu Xian's pale — and at the last writes its name in kaishu, or, when that
// colour has already been named this run, presses a seal beside it instead. The three colours are
// provenance, not decoration: whose observation, centuries apart, the chart is standing on.

// ---------- The pigments ----------
// Pine-soot ink in three tones (dense for what was observed, diluted for the ruling that holds it),
// cinnabar ground from the mineral, a chalk-pale pigment kept legible on amber by a hairline of ink, the
// paper itself as it reads now after thirteen centuries, and the dark of the cave it lay sealed in.
definePlate('scroll',{
  night:{soot:'30,26,21',soot2:'44,36,26',soot3:'58,46,32',cin:'183,49,44',cinDeep:'134,31,27',cinLight:'210,73,60',pale:'233,225,202',
    paper:'216,199,155',paperLight:'239,231,210',fibreLight:'246,236,206',fibreDark:'120,92,52',fox:'128,82,38',paste:'120,86,40',
    dried:'90,76,60',bronze:'140,107,56',bronzeHi:'210,174,108',bronzeLo:'78,55,24',core:'255,247,220',gilt:'201,162,78',cave:'22,17,12',bloom:'60,44,28',tide:'110,74,34'},
  paper:{soot:'30,26,21',soot2:'44,36,26',soot3:'58,46,32',cin:'183,49,44',cinDeep:'134,31,27',cinLight:'210,73,60',pale:'233,225,202',
    paper:'216,199,155',paperLight:'239,231,210',fibreLight:'246,236,206',fibreDark:'120,92,52',fox:'128,82,38',paste:'120,86,40',
    dried:'90,76,60',bronze:'140,107,56',bronzeHi:'210,174,108',bronzeLo:'78,55,24',core:'255,247,220',gilt:'201,162,78',cave:'22,17,12',bloom:'60,44,28',tide:'110,74,34'}
});

// ---------- The tunable rows ----------
// The opening triad, as on the Rock: the Moon for Tiro, a bright star for Adeptus, a faint one for
// Magister. And the two radii a body is sorted by into three magnitudes of dot, the way the chart itself
// draws a brighter star as a larger disc and nothing more.
const SCROLL_TRIAD={relaxed:'moon',classic:'bright',hardcore:'faint'};
const SCROLL_TIER_BRIGHT=34,SCROLL_TIER_MAJOR=46;
function scrollTier(n){
  if(n.difficultyChoice)return SCROLL_TRIAD[n.difficultyChoice];
  return n.r>=SCROLL_TIER_MAJOR?'major':n.r>=SCROLL_TIER_BRIGHT?'bright':'faint';
}
// Where each of the reveal's three stages falls on the observation clock `d` (revealNode's pen.d):
// by a quarter-turn of the 240° that completes an observation the joining line has reached the
// neighbours, by half a turn the boundary has closed and the colour taken, by two thirds the entry is
// written. 03-scroll.md's own order — dot, then line, then boundary — is the chart's real grammar.
const SCROLL_STAGE={line:[0,.375],bound:[.375,.75],entry:[.75,1]};
const scrollSpan=(t,r)=>clamp((t-r[0])/(r[1]-r[0]),0,1);
const scrollEase=t=>t*t*(3-2*t);
// The three schools, in the order an encounter cycles through them.
const SCROLL_SCHOOLS=['甘氏','石氏','巫咸'];
const scrollSchool=n=>((n.row|0)%3+3)%3;
// Star offices a body may be written up as: real names from the Chinese catalogue, drawn on without any
// claim that the body the run deals is that office — the chart's positions here are the run's own.
const SCROLL_NAMES=['天江','傅說','東咸','西咸','鍵閉','天市','帝座','貫索','織女','河鼓','天津','騰蛇','華蓋','五車','天船','軒轅','天廚','天棓','天槍','天床','文昌','三台','天倉','天囷'];
// The twelve charts of the catalogue, as the twelve asterisms each is filed under on this sheet.
const SCROLL_CHARTS=[['北斗','THE NORTHERN DIPPER'],['軒轅','XUANYUAN'],['織女','THE WEAVER GIRL'],['河鼓','THE RIVER DRUM'],['天津','THE HEAVENLY FORD'],['五車','THE FIVE CHARIOTS'],
  ['參','THREE STARS'],['昴','THE HAIRY HEAD'],['心','THE HEART'],['天市','THE MARKET'],['北極','THE NORTH POLE'],['南斗','THE SOUTHERN DIPPER']];
// The twenty-eight mansions in their traditional widths in dù, eastern palace first: 365 between them
// and the quarter-dù left over. The paper's side bands count the climb in these, so a run is literally a
// passage round the mansions, and one column drawn as wide as another can carry a visibly different scale.
const SCROLL_MANSIONS=[['角',12],['亢',9],['氐',15],['房',5],['心',5],['尾',18],['箕',11],['斗',26],['牛',8],['女',12],['虛',10],['危',17],['室',16],['壁',9],
  ['奎',16],['婁',12],['胃',14],['昴',11],['畢',16],['觜',2],['參',9],['井',33],['鬼',4],['柳',15],['星',7],['張',18],['翼',18],['軫',17]];
const SCROLL_DU=14;// world units to one dù of the climb.

// ---------- Small tools ----------
function scrollHash(a,b=0,c=0){let h=Math.imul((a|0)^0x9E3779B1,0x85EBCA77)^Math.imul((b|0)+0x27d4eb2f,0xC2B2AE3D)^Math.imul((c|0)+0x165667b1,0x27D4EB2F);h=Math.imul(h^(h>>>15),0x2C1B3C6D);h^=h>>>13;h=Math.imul(h,0x297A2D39);h^=h>>>16;return (h>>>0)/4294967296;}
// Value noise that repeats every `period` lattice cells down the sheet, so the paper can be baked once as
// a tile and laid end to end with no seam.
function scrollNoise(x,y,seed,period){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=q=>((q%period)+period)%period;
  const h=(i,j)=>scrollHash(i,w(j),seed);return lerp(lerp(h(xi,yi),h(xi+1,yi),u),lerp(h(xi,yi+1),h(xi+1,yi+1),u),v)*2-1;}
function scrollFbm(x,y,cell,oct,seed,tileH){let a=0,m=.5,c=cell;for(let i=0;i<oct;i++){a+=scrollNoise(x/c,y/c,seed+i*17,Math.round(tileH/c))*m;m*=.5;c/=2;}return a;}
function scrollNum(n){const d='零一二三四五六七八九',u=['','十','百','千'],s=String(Math.max(0,n|0));let o='',z=false;
  for(let i=0;i<s.length;i++){const c=+s[i],p=s.length-1-i;if(p>3){o+=d[c];continue;}if(c===0){z=true;continue;}if(z&&o)o+='零';z=false;o+=(c===1&&p===1&&i===0?'':d[c])+u[p];}return o||'零';}
// One stroke of a loaded brush, as a filled ribbon: pressed in fat where it lands, lifted thin, and —
// when `dry` — its tail breaking into the separate hairs of flying white (飛白) as the load runs out.
// Points are screen [x,y] pairs; `w` is the stroke's body width in CSS pixels.
function scrollBrush(g,pts,w,rgb,alpha,o={}){
  const n=pts.length;if(n<2||alpha<=0)return;
  const rnd=seeded((o.seed>>>0)||1),ph=rnd()*9,press=o.press??.5,lift=o.lift??.35,dryAt=o.dry?(o.dryAt??.7):1.01;
  const L=[0];for(let i=1;i<n;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const T=L[n-1]||1;
  const wid=i=>{const t=L[i]/T;return w*(1+press*Math.exp(-t*9))*(t>.7?1-(1-lift)*((t-.7)/.3):1)*(1+.12*Math.sin(t*21+ph));};
  const nor=i=>{const p=pts[Math.max(0,i-1)],q=pts[Math.min(n-1,i+1)],dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1;return[-dy/l,dx/l];};
  g.save();g.fillStyle=`rgba(${rgb},${alpha})`;
  const idx=[];for(let i=0;i<n&&L[i]/T<=dryAt;i++)idx.push(i);
  if(idx.length>1){g.beginPath();for(const i of idx){const m=nor(i),h=wid(i)/2;g.lineTo(pts[i][0]+m[0]*h,pts[i][1]+m[1]*h);}
    for(let j=idx.length-1;j>=0;j--){const i=idx[j],m=nor(i),h=wid(i)/2;g.lineTo(pts[i][0]-m[0]*h,pts[i][1]-m[1]*h);}g.closePath();g.fill();}
  if(o.dry){const hairs=Math.max(3,Math.round(w*2)),from=Math.max(0,dryAt-.06);g.strokeStyle=`rgba(${rgb},${alpha})`;g.lineCap='round';
    for(let k=0;k<hairs;k++){const u=(k/(hairs-1)-.5)*.9,end=.8+rnd()*.2;let on=rnd()<.8;g.globalAlpha=.4+rnd()*.55;g.lineWidth=Math.max(.25,w*.13*(.6+rnd()*.8));g.beginPath();
      for(let i=0;i<n;i++){const t=L[i]/T;if(t<from)continue;if(t>end)break;const m=nor(i),x=pts[i][0]+m[0]*wid(i)*u,y=pts[i][1]+m[1]*wid(i)*u;if(rnd()<.12+.18*t)on=!on;on?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}}
  g.restore();
}
const scrollLine=(a,b,n=10)=>{const p=[];for(let i=0;i<=n;i++){const t=i/n;p.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t)]);}return p;};
const scrollArc=(x,y,r,a0,a1,n=40)=>{const p=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);p.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}return p;};
const scrollCut=(p,f)=>f>=1?p:p.slice(0,Math.max(1,Math.round((p.length-1)*f))+1);
// The boundary a group is closed inside: its convex hull grown outward by a pad, traced as one loop — in
// each direction the member furthest that way, stepped out along it — and wobbled so it is a brush's line.
function scrollLoop(pts,pad,seed,n=56){
  let cx=0,cy=0;for(const p of pts){cx+=p[0];cy+=p[1];}cx/=pts.length;cy/=pts.length;const out=[];
  for(let i=0;i<=n;i++){const t=i/n,a=t*TAU-Math.PI/2,ux=Math.cos(a),uy=Math.sin(a);let b=pts[0],h=-1e9;for(const p of pts){const d=(p[0]-cx)*ux+(p[1]-cy)*uy;if(d>h){h=d;b=p;}}
    const r=pad*(1+.08*Math.sin(t*TAU*3+seed));out.push([b[0]+ux*r,b[1]+uy*r]);}
  return out;
}
// The dot stroke (點): the brush comes in from the upper left, presses and turns, so a star is a disc with
// a short tapered entry on one side — a mark with a direction, not a stamped circle.
function scrollDotPath(g,x,y,r,seed){const ea=-Math.PI*.78+(scrollHash(seed,1)-.5)*.3;g.beginPath();
  for(let i=0;i<=22;i++){const a=ea+i/22*TAU,rr=r*(1+(scrollHash(seed,i+3)-.5)*.1),tip=Math.max(0,Math.cos(a-ea));g.lineTo(x+Math.cos(a)*(rr+r*.28*tip**8),y+Math.sin(a)*(rr+r*.28*tip**8));}g.closePath();}
// A star as the chart draws it. `school` −1 is a point not yet catalogued — a hollow ring of ink, the
// same for every unfiled light, which is exactly what a guest star's first entry says about it.
function scrollStar(g,x,y,r,school,seed,alpha=1,fill=1){
  const P=ink.scroll;g.save();
  if(school<0||fill<1){g.globalAlpha=alpha*(school<0?.85:1-fill);g.strokeStyle=`rgb(${P.soot})`;g.lineWidth=Math.max(.6,r*.28);g.beginPath();g.arc(x,y,r*.82,0,TAU);g.stroke();}
  if(school>=0&&fill>0){g.globalAlpha=alpha*fill;
    if(school===0){const gr=g.createRadialGradient(x-r*.2,y-r*.25,0,x,y,r*1.1);gr.addColorStop(0,'#3a342b');gr.addColorStop(.7,`rgb(${P.soot})`);gr.addColorStop(1,'#0e0c09');
      g.fillStyle=`rgba(${P.soot},.14)`;g.beginPath();g.arc(x+.2,y+.3,r*1.45,0,TAU);g.fill();g.fillStyle=gr;scrollDotPath(g,x,y,r,seed);g.fill();
      g.fillStyle='rgba(255,248,228,.16)';g.beginPath();g.ellipse(x-r*.3,y-r*.35,r*.34,r*.18,-.7,0,TAU);g.fill();}
    else if(school===1){const gr=g.createRadialGradient(x-r*.25,y-r*.3,0,x,y,r*1.05);gr.addColorStop(0,`rgb(${P.cinLight})`);gr.addColorStop(.65,`rgb(${P.cin})`);gr.addColorStop(1,`rgb(${P.cinDeep})`);
      g.fillStyle='rgba(120,40,24,.18)';g.beginPath();g.arc(x+.35,y+.45,r*1.1,0,TAU);g.fill();g.fillStyle=gr;scrollDotPath(g,x,y,r,seed);g.fill();
      g.strokeStyle='rgba(100,20,16,.55)';g.lineWidth=.4;g.stroke();
      for(let i=0;i<Math.max(2,r*2);i++){const a=scrollHash(seed,i,7)*TAU,d=scrollHash(seed,i,8)*r*.7;g.fillStyle=scrollHash(seed,i,9)<.6?'rgba(246,150,120,.75)':'rgba(96,16,12,.6)';g.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d,.45,.45);}}
    else{g.fillStyle='rgba(90,66,34,.28)';g.beginPath();g.arc(x+.45,y+.55,r,0,TAU);g.fill();
      const gr=g.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);gr.addColorStop(0,'#F6F0DE');gr.addColorStop(1,'#DCD2B6');g.fillStyle=gr;scrollDotPath(g,x,y,r,seed);g.fill();
      g.strokeStyle=`rgb(${P.soot})`;g.lineWidth=.6;g.globalAlpha=alpha*fill*.85;g.stroke();}}
  g.restore();
}
// A vertical column of characters, top to bottom, in the kaishu book hand. `reveal` writes them down in
// order, each drawn top-first under a growing clip — the stroke-order rule's first clause and no more.
function scrollColumn(g,str,x,y,size,rgb,alpha,reveal=1,variant='kai'){
  const ch=[...str],tot=ch.length*reveal;g.save();g.font=plateFace(size,variant);g.textAlign='center';g.textBaseline='middle';g.fillStyle=`rgb(${rgb})`;
  ch.forEach((c,i)=>{const f=clamp(tot-i,0,1);if(f<=0)return;const cy=y+i*size*1.06+size/2;g.save();
    if(f<1){g.beginPath();g.rect(x-size,cy-size/2-1,size*2,size*f+1);g.clip();}
    g.globalAlpha=alpha*.2;g.fillText(c,x+.25,cy+.3);g.globalAlpha=alpha;g.fillText(c,x,cy);g.restore();});
  g.restore();return y+ch.length*size*1.06;
}
// A seal pressed in cinnabar paste: an uneven block heavier at its margin, the paste taken up unevenly so
// the paper shows through in specks, the characters carved out of it and so printed as paper (白文).
// A real seal would be cut in seal script; no free traditional seal-script face is in reach, so the kaishu
// stands in, reversed out — a compromise the era file names.
function scrollSeal(g,x,y,size,chars,seed,alpha=1,rot=-.03,hw=1){
  const P=ink.scroll;g.save();g.translate(x,y);g.rotate(rot);g.globalAlpha=alpha;
  const h=size/2,hx=h*hw,j=k=>(scrollHash(seed,k,3)-.5)*size*.035;g.beginPath();g.moveTo(-hx+j(1),-h+j(2));g.lineTo(hx+j(3),-h+j(4));g.lineTo(hx+j(5),h+j(6));g.lineTo(-hx+j(7),h+j(8));g.closePath();
  const gr=g.createRadialGradient(0,0,size*.1,0,0,size*.75);gr.addColorStop(0,'#BE3A30');gr.addColorStop(1,'#96231e');g.fillStyle=gr;g.fill();
  const cs=[...chars],n=cs.length===4?2:1,cell=size/n*.86;g.fillStyle='rgb(226,210,170)';g.font=plateFace(cell*.94,'kaiM');g.textAlign='center';g.textBaseline='middle';
  cs.forEach((c,i)=>{const col=n===1?0:(i<2?1:0),row=n===1?0:i%2;g.fillText(c,(col-(n-1)/2)*cell*1.08*hw,(row-(n-1)/2)*cell*1.08+cell*.04);});
  g.fillStyle=`rgb(${P.paper})`;const k=Math.round(size*size*hw*.1);for(let i=0;i<k;i++){g.globalAlpha=alpha*(.3+scrollHash(seed,i,5)*.6);g.fillRect((scrollHash(seed,i,6)-.5)*size*hw,(scrollHash(seed,i,7)-.5)*size,.4+scrollHash(seed,i,8)*.8,.4+scrollHash(seed,i,9)*.6);}
  g.globalAlpha=alpha*.6;g.strokeStyle='rgba(110,22,18,.8)';g.lineWidth=.6;g.strokeRect(-hx,-h,size*hw,size);g.restore();
}

// ---------- The paper: baked once as a tile, laid end to end down the scroll ----------
// Aged hemp paper, #D8C79B as the Dunhuang scroll reads today. The broad fields — mottle, formation
// cloud, the cockle of old damp — are baked at a quarter of the device resolution and smoothed up; the
// tooth, the bamboo mould's laid lines and chain ties, and the fibres go on at full resolution over it,
// since those are what a coarse bake smears into fog. Under the ink, the verso shows through: S.3326 is
// written on both faces and the sheet is thin, so the other side's columns read here mirrored, soft and
// brown. Every field repeats down the tile's height, so it scrolls with no seam; one paste join per tile
// is where one sheet of the scroll was glued to the next, and a seal is stamped across it, half on each
// sheet, as joins were stamped to show that no sheet had been swapped.
const SCROLL_TILE=900;
let scrollTile=null,scrollTileKey='';
function scrollBakeTile(){
  const key=W+'x'+DPR;if(scrollTile&&scrollTileKey===key)return scrollTile;
  const P=ink.scroll,TH=SCROLL_TILE,pw=Math.max(1,Math.round(W*DPR)),ph=Math.round(TH*DPR),c=makeCanvas(pw,ph),g=c.getContext('2d');
  // The pixel passes are skipped where there are no pixels to read (the test harness's stub canvas).
  const q=4,lw=Math.ceil(pw/q),lh=Math.ceil(ph/q),lo=makeCanvas(lw,lh),lg=lo.getContext('2d'),im=lg.createImageData?lg.createImageData(lw,lh):null,d=im&&im.data,base=P.paper.split(',').map(Number);
  if(d){for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){
    const X=x*q/DPR,Y=y*q/DPR,i=(y*lw+x)*4;
    const m=scrollFbm(X,Y,180,4,11,TH),cl=scrollFbm(X,Y,22.5,3,29,TH),ck=Math.sin(Y/TH*TAU*4+scrollFbm(X,Y,225,2,5,TH)*2.4);
    const ed=Math.min(X,W-X),br=clamp(1-ed/26,0,1),l=1+m*.075+cl*.04+ck*.016;
    d[i]=base[0]*l*(1-br*.1);d[i+1]=base[1]*l*(1-br*.17);d[i+2]=base[2]*l*(1-br*.3);d[i+3]=255;}
  lg.putImageData(im,0,0);g.imageSmoothingQuality='high';g.drawImage(lo,0,0,pw,ph);}
  const fi=d&&g.getImageData?g.getImageData(0,0,pw,ph):null,fd=fi&&fi.data,chainStep=36*DPR,laidStep=2.3*DPR;
  if(fd){for(let y=0;y<ph;y++){const chain=Math.abs((y%chainStep)-chainStep/2)<.55*DPR?-.022:0;
    for(let x=0;x<pw;x++){const f=1+Math.sin(x/laidStep*Math.PI)*.012+chain+(scrollHash(x,y,3)-.5)*.05,i=(y*pw+x)*4;fd[i]*=f;fd[i+1]*=f;fd[i+2]*=f;}}
  g.putImageData(fi,0,0);}g.scale(DPR,DPR);
  const rnd=seeded(7),wrap=(fn)=>{for(const o of[-TH,0,TH]){g.save();g.translate(0,o);fn();g.restore();}};
  // The verso, set on its own layer and blurred once — a filter per character would be a full blur pass each.
  {const vc=makeCanvas(pw,ph),vg=vc.getContext('2d');vg.scale(DPR,DPR);vg.translate(W,0);vg.scale(-1,1);vg.font=plateFace(11,'kai');vg.textAlign='center';vg.textBaseline='middle';
    const pool=[...'自氐五度至尾九度為大火於辰在卯宋之分野天文圖北極紫微垣華蓋心房尾東咸天江傅說鍵閉罰甘氏石巫咸彗星風角日食熒惑守'],r2=seeded(19);
    for(let cx=30;cx<W-16;cx+=19){vg.strokeStyle=`rgba(${P.fibreDark},.035)`;vg.lineWidth=.5;vg.beginPath();vg.moveTo(cx-9.5,0);vg.lineTo(cx-9.5,TH);vg.stroke();
      let y=r2()*60;while(y<TH-8){const run=4+r2()*22|0;vg.fillStyle=`rgba(80,54,26,${(.045+r2()*.035).toFixed(3)})`;for(let i=0;i<run&&y<TH-8;i++){vg.fillText(pool[r2()*pool.length|0],cx,y);y+=12.4;}y+=18+r2()*80;}}
    g.save();g.setTransform(1,0,0,1,0,0);g.filter=`blur(${(.9*DPR).toFixed(2)}px)`;g.drawImage(vc,0,0);g.restore();}
  wrap(()=>{const r=seeded(7);
    for(let i=0;i<Math.round(W*TH/150);i++){const x=r()*W,y=r()*TH,a=r()*TAU,L=3+r()*11,cu=(r()-.5)*.6,lt=r()<.55;
      g.strokeStyle=lt?`rgba(${P.fibreLight},${(.12+r()*.16).toFixed(3)})`:`rgba(${P.fibreDark},${(.06+r()*.1).toFixed(3)})`;g.lineWidth=.25+r()*.4;
      g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a+cu)*L*.5,y+Math.sin(a+cu)*L*.5,x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}
    for(let i=0;i<Math.round(W*TH/5600);i++){const x=r()*W,y=r()*TH,a=r()*TAU,L=30+r()*70;g.strokeStyle=r()<.5?`rgba(250,242,214,${(.08+r()*.08).toFixed(3)})`:`rgba(110,84,46,${(.08+r()*.08).toFixed(3)})`;
      g.lineWidth=.35+r()*.3;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+Math.cos(a)*L*.3+(r()-.5)*14,y+Math.sin(a)*L*.3+(r()-.5)*14,x+Math.cos(a)*L*.7+(r()-.5)*14,y+Math.sin(a)*L*.7+(r()-.5)*14,x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}
    for(let i=0;i<Math.round(W*TH/13000);i++){const x=r()*W,y=r()*TH,rr=1.5+r()*r()*9,gr=g.createRadialGradient(x,y,0,x,y,rr);
      gr.addColorStop(0,`rgba(${P.fox},${(.16+r()*.18).toFixed(3)})`);gr.addColorStop(.5,`rgba(150,104,52,${(.07+r()*.07).toFixed(3)})`);gr.addColorStop(1,'rgba(150,104,52,0)');
      g.fillStyle=gr;g.beginPath();g.ellipse(x,y,rr,rr*(.7+r()*.5),r()*TAU,0,TAU);g.fill();}});
  // The paste join, half way down the tile, and the seal stamped across it.
  const sy0=TH*.5,seam=x=>sy0+Math.sin(x*.07)*.6+Math.sin(x*.023+1)*.8;
  g.fillStyle=`rgba(${P.paste},.11)`;g.beginPath();g.moveTo(0,seam(0));for(let x=0;x<=W;x+=6)g.lineTo(x,seam(x));for(let x=W;x>=0;x-=6)g.lineTo(x,seam(x)+6);g.fill();
  g.strokeStyle='rgba(90,64,30,.28)';g.lineWidth=.7;g.beginPath();for(let x=0;x<=W;x+=4)x?g.lineTo(x,seam(x)+6.2):g.moveTo(x,seam(x)+6.2);g.stroke();
  g.strokeStyle='rgba(250,242,216,.45)';g.lineWidth=.5;g.beginPath();for(let x=0;x<=W;x+=4)x?g.lineTo(x,seam(x)+7):g.moveTo(x,seam(x)+7);g.stroke();
  const sx0=Math.max(40,W*.16);g.save();g.beginPath();g.rect(0,0,W,sy0+3);g.clip();scrollSeal(g,sx0,sy0+3,20,'沙州之印',77,.8,.02,.8);g.restore();
  g.save();g.beginPath();g.rect(0,sy0+3,W,40);g.clip();scrollSeal(g,sx0+1.2,sy0+3.8,20,'沙州之印',77,.72,.02,.8);g.restore();
  // The long edges of the sheet: a worn, browned margin, a lit lip, and the dark of the cave beyond.
  const edge=(y,s)=>5+Math.sin(y*.013+s)*1.4+Math.sin(y*.11+s*2)*.5;
  for(const side of[-1,1]){const E=y=>side<0?edge(y,1):W-edge(y,4);
    g.fillStyle=`rgb(${P.cave})`;g.beginPath();g.moveTo(side<0?0:W,0);for(let y=0;y<=TH;y+=3)g.lineTo(E(y),y);g.lineTo(side<0?0:W,TH);g.closePath();g.fill();
    g.strokeStyle='rgba(96,66,32,.35)';g.lineWidth=1;g.beginPath();for(let y=0;y<=TH;y+=3)y?g.lineTo(E(y)-side*1.1,y):g.moveTo(E(y)-side*1.1,y);g.stroke();
    g.strokeStyle='rgba(248,236,204,.4)';g.lineWidth=.45;g.beginPath();for(let y=0;y<=TH;y+=3)y?g.lineTo(E(y)-side*.3,y):g.moveTo(E(y)-side*.3,y);g.stroke();
    for(let i=0;i<Math.round(TH/3.5);i++){const y=rnd()*TH,x=E(y),a=(side<0?Math.PI:0)+(rnd()-.5)*1.4,L=1+rnd()*rnd()*6;g.strokeStyle=`rgba(${205+rnd()*25|0},${184+rnd()*22|0},${140+rnd()*22|0},${(.3+rnd()*.4).toFixed(2)})`;
      g.lineWidth=.25+rnd()*.3;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}}
  scrollTile=c;scrollTileKey=key;return c;
}
// The graduated bands down both sides of the panel, counting the climb in dù of the mansions it passes:
// a tick a dù, a longer one every five, a numeral every ten, and at each mansion's first dù a rule across
// the band with the mansion's name in it. Drawn live rather than baked, since they are read off the world.
function scrollBands(){
  const P=ink.scroll,B=11,xl=10,xr=W-10,camTop=world.cameraY,camBot=world.cameraY+H/scale;
  ctx.save();ctx.lineCap='butt';
  ctx.strokeStyle=`rgba(${P.soot},.8)`;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(xl,0);ctx.lineTo(xl,H);ctx.moveTo(xr,0);ctx.lineTo(xr,H);ctx.stroke();
  ctx.strokeStyle=`rgba(${P.soot},.5)`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(xl+B,0);ctx.lineTo(xl+B,H);ctx.moveTo(xr-B,0);ctx.lineTo(xr-B,H);ctx.stroke();
  const total=365.25,first=Math.floor(-camBot/SCROLL_DU)-1,last=Math.ceil(-camTop/SCROLL_DU)+1;
  const starts=[];let acc=0;for(const[,w]of SCROLL_MANSIONS){starts.push(acc);acc+=w;}
  for(let k=first;k<=last;k++){const y=sy(-k*SCROLL_DU),du=((k%365)+365)%365,big=du%10===0,mid=du%5===0,l=big?B*.6:mid?B*.42:B*.24;
    ctx.strokeStyle=`rgba(${P.soot},.62)`;ctx.lineWidth=big?.55:.35;ctx.beginPath();ctx.moveTo(xl+B,y);ctx.lineTo(xl+B-l,y);ctx.moveTo(xr-B,y);ctx.lineTo(xr-B+l,y);ctx.stroke();
    const mi=starts.indexOf(du);
    if(mi>=0){ctx.strokeStyle=`rgba(${P.soot},.75)`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(xl,y);ctx.lineTo(xl+B,y);ctx.moveTo(xr-B,y);ctx.lineTo(xr,y);ctx.stroke();
      const wd=SCROLL_MANSIONS[mi][1],my=sy(-(k+wd/2)*SCROLL_DU);for(const x of[xl+B/2,xr-B/2])scrollColumn(ctx,SCROLL_MANSIONS[mi][0],x,my-5,9,P.soot,.85,1,'kaiM');}
    else if(big){const t=scrollNum(du).replace(/^一百/,'百');for(const x of[xl+B/2,xr-B/2])scrollColumn(ctx,t,x,y+2,6.4,P.soot,.7,1);}}
  ctx.restore();
}
// The circumpolar panel, the Dunhuang chart's own thirteenth: the frontispiece's title mark, standing
// above the three opening lights and gone once the hand starts. The pole stands in for the emperor's
// fixed seat; round it the Purple Forbidden Enclosure in cinnabar, the Pole and the Dipper in black, the
// twenty-eight mansions ruled out to a graduated rim at their true widths, and the title column beside.
let scrollTitleFade=1,scrollTitleArt=null,scrollTitleKey='';
function scrollTitleSprite(R){
  const key=R.toFixed(1)+':'+DPR;if(scrollTitleArt&&scrollTitleKey===key)return scrollTitleArt;
  const P=ink.scroll,size=R*2+60,c=makeCanvas(Math.round(size*DPR),Math.round(size*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);
  scrollBrush(g,scrollArc(0,0,R,-Math.PI/2,Math.PI*1.5,120),1.2,P.soot,.86,{press:.06,lift:.9,seed:3});
  scrollBrush(g,scrollArc(0,0,R-9,-Math.PI/2+.1,Math.PI*1.5+.1,120),.5,P.soot,.6,{press:.1,lift:.9,seed:4});
  const RIN=R*.56;scrollBrush(g,scrollArc(0,0,RIN,0,TAU,90),.45,P.soot2,.38,{press:.1,lift:.9,seed:5});
  g.strokeStyle=`rgba(${P.soot2},.4)`;g.lineCap='butt';
  for(let d=0;d<365.25;d+=2){const a=-Math.PI/2+d/365.25*TAU,big=d%10===0,l=big?3:1.4;g.lineWidth=big?.5:.3;g.beginPath();g.moveTo(Math.cos(a)*(R-9),Math.sin(a)*(R-9));g.lineTo(Math.cos(a)*(R-9+l),Math.sin(a)*(R-9+l));g.stroke();}
  let acc=0;const a0=Math.PI*.5+.35;
  for(const[,wd]of SCROLL_MANSIONS){const a=a0-acc/365.25*TAU;g.strokeStyle=`rgba(${P.soot3},.2)`;g.lineWidth=.4;g.beginPath();g.moveTo(Math.cos(a)*RIN,Math.sin(a)*RIN);g.lineTo(Math.cos(a)*(R-1),Math.sin(a)*(R-1));g.stroke();acc+=wd;}
  const k=R/146,groups=[
    {school:0,pts:[[-2,-8],[6,-3],[12,5],[15,15],[16,26]],links:[[0,1],[1,2],[2,3],[3,4]]},
    {school:1,pts:[[-40,-58],[-58,-44],[-68,-22],[-70,2],[-66,26],[-56,46],[-40,60]],links:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]},
    {school:1,pts:[[40,-58],[58,-42],[68,-18],[70,6],[64,30],[52,50]],links:[[0,1],[1,2],[2,3],[3,4],[4,5]]},
    {school:0,pts:[[62,84],[84,98],[102,82],[82,68],[44,96],[30,112],[14,126]],links:[[0,1],[1,2],[2,3],[3,0],[0,4],[4,5],[5,6]]},
    {school:-1,pts:[[-6,-100],[-18,-92],[6,-92],[-26,-82],[14,-82],[-4,-118]],links:[[5,0],[0,1],[0,2],[1,3],[2,4]]},
    {school:2,pts:[[-104,40],[-96,58],[-84,72],[-110,20]],links:[[3,0],[0,1],[1,2]]}];
  let s=20;
  for(let i=0;i<40;i++){const a=scrollHash(i,1,41)*TAU,r=(28+Math.sqrt(scrollHash(i,2,41))*(146-44))*k;scrollStar(g,Math.cos(a)*r,Math.sin(a)*r,1.1,-1,s++,.8);}
  for(const o of groups){const pts=o.pts.map(p=>[p[0]*k,p[1]*k]);
    for(const[a,b]of o.links)scrollBrush(g,scrollLine(pts[a],pts[b]),.6,o.school<0?P.soot2:P.soot,.85,{seed:s++});
    for(const p of pts)scrollStar(g,p[0],p[1],o.school<0?1.5:2.1,o.school,s++);
    if(o.school>=0)scrollBrush(g,scrollLoop(pts,6*k+2,s),.45,P.soot3,.55,{press:.3,lift:.8,seed:s++});}
  g.fillStyle=`rgb(${P.soot})`;g.beginPath();g.arc(0,0,1,0,TAU);g.fill();
  scrollTitleArt={canvas:c,size};scrollTitleKey=key;return scrollTitleArt;
}
function scrollTitleMark(){
  const ready=world.state==='ready';scrollTitleFade=ready?1:Math.max(0,scrollTitleFade-.03);if(scrollTitleFade<=0)return;
  const P=ink.scroll,R=Math.min(W*.17,58*scale+10),x=W/2,y=H*.235+R*.2,sp=scrollTitleSprite(R);
  ctx.save();ctx.globalAlpha=scrollTitleFade;ctx.drawImage(sp.canvas,x-sp.size/2,y-sp.size/2,sp.size,sp.size);
  const tx=Math.min(W-34,x+R+34),ts=Math.max(19,R*.3);scrollColumn(ctx,'天文圖',tx,y-R,ts,P.soot,.94,1,'kaiM');
  scrollSeal(ctx,tx,y-R+ts*3.2+14,Math.max(18,R*.26),'司天監印',5,.95);
  ctx.restore();
}
// The ground: the paper tile at the camera's own rate, one lamp above the held body, the bands, the title.
function scrollAtmosphere(){
  plateShift.x=0;plateShift.y=0;
  const tile=scrollBakeTile(),th=SCROLL_TILE,phase=(((-world.cameraY*scale)%th)+th)%th;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  for(let y=phase-th;y<H+th;y+=th)ctx.drawImage(tile,0,Math.round((y)*DPR));
  ctx.restore();
  const lg=ctx.createRadialGradient(W*.54,H*.46,Math.min(W,H)*.12,W*.54,H*.46,Math.max(W,H)*.78);
  lg.addColorStop(0,'rgba(255,248,226,.06)');lg.addColorStop(.6,'rgba(60,40,20,0)');lg.addColorStop(1,'rgba(60,40,20,.2)');
  ctx.fillStyle=lg;ctx.fillRect(0,0,W,H);
  scrollBands();
  scrollTitleMark();
}

// ---------- The node: ring, body or phenomenon, and the release marks while it is held ----------
// The ring is graduated in dù, 365¼ to the circle, a tick every five, so its last division is a quarter
// of the rest — the year's odd quarter-day, a short gap at the top of the rim. It stands at the node's
// real capture radius, never staged wider or narrower than the truth the code will test.
const scrollFlourishAt=new Map();
function scrollFlourish(n){
  scrollFlourishAt.set(n,world.time);
  if(scrollFlourishAt.size>40)for(const[key,at]of scrollFlourishAt)if(world.time-at>.66)scrollFlourishAt.delete(key);
}
function scrollRing(n,x,y,cap,state,drawn){
  const P=ink.scroll;if(drawn<=0)return;
  ctx.save();ctx.strokeStyle=`rgba(${P.soot},${(.85*state).toFixed(3)})`;ctx.lineWidth=Math.max(.7,.8*scale);
  ctx.beginPath();ctx.arc(x,y,cap,-Math.PI/2,-Math.PI/2+TAU*drawn);ctx.stroke();
  ctx.strokeStyle=`rgba(${P.soot},${(.62*state).toFixed(3)})`;ctx.lineCap='butt';ctx.beginPath();
  for(let du=0;du<365.25*drawn;du+=5){const a=-Math.PI/2+du/365.25*TAU,l=(du%30===0?4.4:2.3)*scale;ctx.moveTo(x+Math.cos(a)*(cap+.6),y+Math.sin(a)*(cap+.6));ctx.lineTo(x+Math.cos(a)*(cap+.6+l),y+Math.sin(a)*(cap+.6+l));}
  ctx.lineWidth=Math.max(.35,.42*scale);ctx.stroke();
  const at=scrollFlourishAt.get(n);
  if(at!==undefined){const k=clamp(1-(world.time-at)/.66,0,1);if(k>0){ctx.strokeStyle=`rgba(${P.soot},${(.9*k).toFixed(3)})`;ctx.lineWidth=(.4+2.2*k)*scale;ctx.beginPath();ctx.arc(x,y,cap,0,TAU);ctx.stroke();}}
  ctx.restore();
}
// Where the next body can be reached from the held ring: a cinnabar wash laid outside the rim over the
// arc that connects, and at every tangent that threads clear of every hazard, a division struck across
// the rim with a pale disc on it. Geometry only, read exactly as drawNode reads it.
function scrollReleaseMarks(n,p,x,y){
  const P=ink.scroll,rad=p.rad*scale;
  for(const next of releaseTargets(n)){
    const dist=Math.hypot(next.x-n.x,next.y-n.y),a=Math.atan2(next.y-n.y,next.x-n.x)-p.dir*Math.acos(clamp(p.rad/dist,-1,1)),win=Math.asin(clamp(next.cap/dist,0,.8));
    scrollBrush(ctx,scrollArc(x,y,rad+8*scale,a-win,a+win,24),3.4*scale,P.cin,.4,{press:.2,lift:.6,seed:n.id+7});
    for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
      if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
      const c=Math.cos(path.angle),s=Math.sin(path.angle);
      scrollBrush(ctx,[[x+c*(rad-4*scale),y+s*(rad-4*scale)],[x+c*(rad+13*scale),y+s*(rad+13*scale)]],1.05*scale,P.soot,.9,{press:.2,lift:.6,seed:n.id+9});
      scrollStar(ctx,x+c*(rad+8*scale),y+s*(rad+8*scale),2.2*scale,2,n.id+11);
    }
  }
}
// The members of the star office a body is filed as: the held light itself, and one to three neighbours
// round it by its magnitude, seeded so the same office sits the same way every frame.
function scrollMembers(n,x,y,tier){
  const count=tier==='major'?3:tier==='bright'?2:1,R=n.r*scale,out=[{x,y,r:(tier==='major'?3.6:tier==='bright'?3:2.3)*scale}];
  for(let i=0;i<count;i++){const a=scrollHash(n.seed,i,1)*TAU,d=R*(.55+scrollHash(n.seed,i,2)*.3);out.push({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,r:(1.7+scrollHash(n.seed,i,3)*.8)*scale});}
  return out;
}
// Which school has already been captioned this run, and by which body: the first body of each colour
// to close its entry is written up by name; every later one of that colour takes a seal instead.
let scrollRunWorld=null,scrollCaptioned=new Map();
function scrollRun(){if(scrollRunWorld!==world){scrollRunWorld=world;scrollCaptioned=new Map();scrollFlourishAt.clear();}}
function scrollBody(n,x,y,tier,d,taken){
  const P=ink.scroll,school=scrollSchool(n),M=scrollMembers(n,x,y,tier),al=taken;
  if(tier==='moon'){
    // The Moon: the one point every mansion's width was set to measure against, not a face. A pale disc,
    // and the thin line down to its mansion's determinative that says where it is measured from.
    const r=n.r*scale*.42;scrollBrush(ctx,scrollLine([x,y+r+3*scale],[x,y+r+22*scale],6),.35*scale,P.soot3,.5*al,{press:.1,lift:.4,seed:n.seed});
    ctx.save();ctx.globalAlpha=al;ctx.fillStyle='rgba(90,66,34,.25)';ctx.beginPath();ctx.arc(x+.6,y+.8,r,0,TAU);ctx.fill();
    const mg=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);mg.addColorStop(0,'#F6F0DE');mg.addColorStop(1,'#DCD2B6');ctx.fillStyle=mg;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.restore();
    scrollBrush(ctx,scrollArc(x,y,r,-2.3,-2.3+TAU*.98,60),.9*scale,P.soot,.85*al,{press:.4,lift:.5,seed:n.seed});
    if(d>.75)scrollColumn(ctx,'月',x+r+10*scale,y-r,12*scale,P.soot,.85*al*scrollSpan(d,SCROLL_STAGE.entry),1);
    return;
  }
  const s1=scrollSpan(d,SCROLL_STAGE.line),s2=scrollSpan(d,SCROLL_STAGE.bound),s3=scrollSpan(d,SCROLL_STAGE.entry);
  for(let i=1;i<M.length;i++){const f=clamp(s1*(M.length-1)-(i-1),0,1);if(f<=0)continue;const a=M[i===1?0:i-1],b=M[i];
    scrollBrush(ctx,scrollCut(scrollLine([a.x,a.y],[b.x,b.y],12),scrollEase(f)),.8*scale,P.soot,.88*al,{press:.4,lift:.6,seed:n.seed+i});}
  const pts=M.map(m=>[m.x,m.y]);
  if(s2>0)scrollBrush(ctx,scrollCut(scrollLoop(pts,8*scale+M[0].r,n.seed%97),s2),.6*scale,P.soot2,.62*al,{press:.3,lift:.8,seed:n.seed+31});
  const fill=scrollEase(clamp((s2-.35)/.65,0,1)),gold=n.type==='gold';
  M.forEach((m,i)=>scrollStar(ctx,m.x,m.y,fill>0?m.r:1.9*scale,fill>0?school:-1,n.seed+i*7,al,fill));
  // A lucky find is ringed in gilt, the one gold on the sheet; a slingshot star carries a drawn bow round
  // it, the bowstring (弦) this era names the slingshot for, after the bowman who closes the scroll.
  if(gold&&fill>0){ctx.save();ctx.strokeStyle=`rgba(${P.gilt},${(.9*fill*al).toFixed(3)})`;ctx.lineWidth=1.2*scale;ctx.beginPath();ctx.arc(x,y,M[0].r*2.1,0,TAU);ctx.stroke();ctx.restore();}
  if(n.type==='sling'){const R=n.r*scale*.9;scrollBrush(ctx,scrollArc(x,y,R,Math.PI*.62,Math.PI*1.38,30),1.6*scale,P.cin,.85*al,{press:.6,lift:.3,seed:n.seed+5});
    const a=[x+Math.cos(Math.PI*.62)*R,y+Math.sin(Math.PI*.62)*R],b=[x+Math.cos(Math.PI*1.38)*R,y+Math.sin(Math.PI*1.38)*R];scrollBrush(ctx,scrollLine(a,b),.4*scale,P.soot,.7*al,{press:0,lift:1,seed:n.seed+6});}
  if(s3>0){
    let owner=scrollCaptioned.get(school);if(owner===undefined){owner=n.id;scrollCaptioned.set(school,owner);}
    let maxX=-1e9,minY=1e9;for(const p of pts){maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);}
    const cx=maxX+12*scale+M[0].r,cy=minY-6*scale;
    if(owner===n.id){const size=Math.max(11,12.5*scale),e=scrollColumn(ctx,SCROLL_NAMES[n.id%SCROLL_NAMES.length],cx,cy,size,P.soot,.9*al,clamp(s3*1.6,0,1));
      scrollColumn(ctx,SCROLL_SCHOOLS[school],cx,e+2,Math.max(8.5,9*scale),P.soot,.72*al,clamp(s3*1.6-.9,0,1),'kaiL');}
    else{const k=scrollEase(clamp(s3*2,0,1));ctx.save();ctx.translate(cx,cy+12*scale);ctx.scale(1.35-.35*k,1.35-.35*k);scrollSeal(ctx,0,0,Math.max(10,11*scale),'志',n.id*13+1,k*al,.05);ctx.restore();}
  }
}
// A light not yet reached: a hollow point with no identity, and four short register marks round it that
// say only where it is — the exact condition of a guest star's first entry.
function scrollPhenomenon(n,x,y,tier){
  const P=ink.scroll,r=(tier==='major'?3.2:tier==='bright'?2.7:tier==='moon'?4:2.2)*scale,fading=n.type==='fading';
  ctx.save();scrollStar(ctx,x,y,r,-1,n.seed,fading?.5:1);
  ctx.strokeStyle=`rgba(${fading?P.soot3:P.soot2},.6)`;ctx.lineWidth=Math.max(.5,.5*scale);ctx.beginPath();
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;ctx.moveTo(x+Math.cos(a)*r*2,y+Math.sin(a)*r*2);ctx.lineTo(x+Math.cos(a)*r*3.2,y+Math.sin(a)*r*3.2);}ctx.stroke();ctx.restore();
}
// The charges a run can pick up, as the things this Bureau actually kept: a standing screen (屏) for the
// shield; the notched jade disc of the legendary sighting instrument (璣) for the reflector; the sun rising
// over a horizon rule for the dawn charge; and an inkstone (硯), the well of the Four Treasures, for the
// inkwell. Each is drawn whole from the moment it comes into view, and taken, dimmed, once used.
const SCROLL_GIFTS={shield:1,reflector:1,dawn:1,inkwell:1};
function scrollGift(n,x,y,r,used){
  const P=ink.scroll,k=used?.35:1;ctx.save();ctx.translate(x,y);ctx.globalAlpha=k;ctx.lineJoin='round';
  if(n.type==='shield'){const w=r*.36,h=r*.7;for(let i=-1;i<=1;i++){const px=i*w*.95;ctx.fillStyle=`rgba(${P.pale},.9)`;ctx.fillRect(px-w/2,-h/2,w,h);
      ctx.strokeStyle=`rgb(${P.soot})`;ctx.lineWidth=1*scale;ctx.strokeRect(px-w/2,-h/2,w,h);ctx.strokeStyle=`rgba(${P.soot},.4)`;ctx.lineWidth=.5*scale;ctx.strokeRect(px-w/2+2*scale,-h/2+2*scale,w-4*scale,h-4*scale);}
    ctx.fillStyle=`rgb(${P.soot})`;ctx.fillRect(-w*1.5,h/2,w*3,1.6*scale);}
  else if(n.type==='reflector'){const R=r*.5;ctx.beginPath();for(let i=0;i<=60;i++){const a=i/60*TAU,notch=(i%20)>15?R*.18:0;ctx.lineTo(Math.cos(a)*(R+notch),Math.sin(a)*(R+notch));}ctx.closePath();
    const gr=ctx.createRadialGradient(-R*.3,-R*.3,0,0,0,R);gr.addColorStop(0,'rgb(186,206,176)');gr.addColorStop(1,'rgb(96,130,104)');ctx.fillStyle=gr;ctx.fill();ctx.strokeStyle=`rgb(${P.soot})`;ctx.lineWidth=.9*scale;ctx.stroke();
    ctx.fillStyle=`rgb(${P.paper})`;ctx.beginPath();ctx.arc(0,0,R*.3,0,TAU);ctx.fill();ctx.stroke();}
  else if(n.type==='dawn'){const R=r*.42;ctx.save();ctx.beginPath();ctx.rect(-r,-r,r*2,r*.2+R*.4);ctx.clip();ctx.fillStyle=`rgb(${P.cin})`;ctx.beginPath();ctx.arc(0,R*.2,R,0,TAU);ctx.fill();ctx.restore();
    scrollBrush(ctx,scrollLine([-r*.7,R*.62],[r*.7,R*.62]),1.4*scale,P.soot,.9,{seed:n.seed});
    for(let i=0;i<5;i++){const a=-Math.PI*(.15+i*.175);scrollBrush(ctx,scrollLine([Math.cos(a)*R*1.25,R*.2+Math.sin(a)*R*1.25],[Math.cos(a)*R*1.6,R*.2+Math.sin(a)*R*1.6]),.7*scale,P.cin,.8,{seed:n.seed+i});}}
  else{const w=r*.85,h=r*.6;ctx.fillStyle='rgb(58,54,50)';ctx.beginPath();ctx.roundRect?ctx.roundRect(-w/2,-h/2,w,h,3*scale):ctx.rect(-w/2,-h/2,w,h);ctx.fill();
    ctx.fillStyle='rgb(24,22,20)';ctx.beginPath();ctx.ellipse(0,-h*.18,w*.3,h*.2,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,250,235,.25)';ctx.beginPath();ctx.ellipse(-w*.08,-h*.24,w*.1,h*.05,0,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgb(${P.soot})`;ctx.lineWidth=.8*scale;ctx.stroke();}
  ctx.restore();
}
function scrollNode(n,aim){
  scrollRun();
  const pen=revealNode(n);if(pen.t<=0)return;
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=!!(aim&&aim.n.id===n.id);
  const x=sx(n.x),y=sy(n.y),cap=n.cap*scale;
  if(y<-cap*2-60||y>H+cap*2+60)return;
  const tier=scrollTier(n),state=active||target?1:used?.3:.62;
  scrollRing(n,x,y,cap,state,pen.ring);
  if(SCROLL_GIFTS[n.type])scrollGift(n,x,y,n.r*scale,used);
  else if(n.difficultyChoice||pen.taken>0)scrollBody(n,x,y,tier,pen.d,n.difficultyChoice?1:pen.taken);
  else scrollPhenomenon(n,x,y,tier);
  if(active)scrollReleaseMarks(n,p,x,y);
}

// ---------- The dangers: omens, depicted, never an invented monster ----------
// 熒惑守心, Mars lingering at the Heart, for the pull: the omen this tradition dreaded most, a baleful red
// point the eye is drawn to and held at, its field drawn as rings of dilute cinnabar closing in on it —
// and its lethal core as a wash of exactly the core's radius, since the reach a danger is drawn at must
// never lie. 彗星, the broom star, for the push: a head drawn as a ring round a point and a tail of
// straight strokes, the way the Mawangdui silk draws its comets, sweeping outward. 風角, the wind angle,
// for the crosswind: dry brush dragged along the gust, and the eight-direction rosette the practice read
// it against. 日食, sun-eating, for the obscurer: a disc with a bite taken out of it.
function scrollMars(h,x,y){
  const P=ink.scroll,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time;
  ctx.save();
  const wg=ctx.createRadialGradient(x,y,0,x,y,core);wg.addColorStop(0,`rgba(${P.cin},.34)`);wg.addColorStop(.8,`rgba(${P.cin},.18)`);wg.addColorStop(1,`rgba(${P.cin},.05)`);
  ctx.fillStyle=wg;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
  scrollBrush(ctx,scrollArc(x,y,core,h.seed%7,h.seed%7+TAU*.98,60),1*scale,P.cinDeep,.7,{press:.3,lift:.4,dry:true,dryAt:.85,seed:h.seed});
  for(let i=0;i<3;i++){const f=((t*.28+i/3)%1),r=core+(1-f)*(reach-core);ctx.strokeStyle=`rgba(${P.cin},${(f*.45).toFixed(3)})`;ctx.lineWidth=(.5+f*.5)*scale;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
  scrollStar(ctx,x,y,Math.max(3,4*scale),1,h.seed);ctx.fillStyle='rgba(70,10,8,.85)';ctx.beginPath();ctx.arc(x,y,1.3*scale,0,TAU);ctx.fill();
  scrollColumn(ctx,'熒惑',x+core+9*scale,y-10*scale,Math.max(9,10*scale),P.soot,.78,1);
  ctx.restore();
}
function scrollComet(h,x,y){
  const P=ink.scroll,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale,t=reducedMotion?0:world.time,base=scrollHash(h.seed,1)*TAU;
  ctx.save();
  const wg=ctx.createRadialGradient(x,y,0,x,y,core);wg.addColorStop(0,`rgba(${P.soot},.16)`);wg.addColorStop(1,`rgba(${P.soot},.03)`);ctx.fillStyle=wg;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
  scrollBrush(ctx,scrollArc(x,y,core,base,base+TAU*.97,50),1*scale,P.soot,.85,{press:.5,lift:.5,seed:h.seed});
  scrollStar(ctx,x,y,Math.max(2,2.4*scale),0,h.seed);
  for(let i=0;i<7;i++){const a=base+Math.PI+(i-3)*.14+Math.sin(t*.7+i)*.02,L=reach*(.72+(i%2)*.18),m=[x+Math.cos(a)*L*.5+(i-3)*1.5*scale,y+Math.sin(a)*L*.5];
    const pts=[];for(let k=0;k<=24;k++){const u=k/24,s=core*1.05+(L-core*1.05)*u;pts.push([x+Math.cos(a)*s+(m[0]-x-Math.cos(a)*L*.5)*Math.sin(u*Math.PI),y+Math.sin(a)*s+(m[1]-y-Math.sin(a)*L*.5)*Math.sin(u*Math.PI)]);}
    scrollBrush(ctx,pts,(1.4-(i%2)*.4)*scale,P.soot,.8,{press:.7,lift:.3,dry:true,dryAt:.35,seed:h.seed+i});}
  scrollColumn(ctx,'彗星',x+core+9*scale,y-10*scale,Math.max(9,10*scale),P.soot,.78,1);
  ctx.restore();
}
function scrollWind(h,x,y){
  const P=ink.scroll,reach=gravityRadius(h)*scale;if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const t=reducedMotion?0:world.time,drift=(t*18*scale)%(reach*.5);
  ctx.save();ctx.translate(x,y);ctx.rotate(h.dir||0);
  ctx.beginPath();ctx.arc(0,0,reach,0,TAU);ctx.clip();
  for(let i=0;i<6;i++){const lane=(scrollHash(h.seed,i,1)-.5)*reach*1.3,x0=-reach+scrollHash(h.seed,i,2)*reach*.6+drift-reach*.25,len=reach*(.9+scrollHash(h.seed,i,3)*.7);
    const pts=[];for(let k=0;k<=40;k++){const u=k/40;pts.push([x0+len*u,lane+Math.sin(u*3+i)*2.5*scale-u*4*scale]);}
    scrollBrush(ctx,pts,(3+scrollHash(h.seed,i,4)*3)*scale,P.soot,.42+scrollHash(h.seed,i,5)*.2,{press:.5,lift:.55,dry:true,dryAt:0,seed:h.seed+i});}
  ctx.restore();
  // The rosette the practice read the wind against, the quarter it blows from struck in cinnabar.
  const rx=x-Math.cos(h.dir||0)*reach*.78,ry=y-Math.sin(h.dir||0)*reach*.78,R=9*scale;ctx.save();ctx.strokeStyle=`rgba(${P.soot},.62)`;ctx.lineWidth=.55*scale;
  ctx.beginPath();ctx.arc(rx,ry,R,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(rx,ry,R*.24,0,TAU);ctx.stroke();ctx.beginPath();
  for(let i=0;i<8;i++){const a=i/8*TAU;ctx.moveTo(rx+Math.cos(a)*R*.33,ry+Math.sin(a)*R*.33);ctx.lineTo(rx+Math.cos(a)*R*(i%2?.78:1.28),ry+Math.sin(a)*R*(i%2?.78:1.28));}ctx.stroke();
  const d=(h.dir||0)+Math.PI;scrollBrush(ctx,scrollLine([rx+Math.cos(d)*R*1.5,ry+Math.sin(d)*R*1.5],[rx+Math.cos(d)*R*.33,ry+Math.sin(d)*R*.33],6),1.8*scale,P.cin,.95,{press:.4,lift:.4,seed:h.seed+9});
  ctx.restore();
}
function scrollEclipse(h,x,y){
  const P=ink.scroll,R=h.r*scale;if(y+R<-20||y-R>H+20)return;
  const t=reducedMotion?0:world.time,bite=.55+.2*Math.sin(t*.25+h.phase),bx=x+R*(1.35-bite),by=y-R*.3;
  ctx.save();ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.arc(bx,by,R*.8,0,TAU,true);ctx.clip('evenodd');
  const eg=ctx.createRadialGradient(x-R*.3,y-R*.3,R*.1,x,y,R);eg.addColorStop(0,`rgba(${P.cinLight},.42)`);eg.addColorStop(1,`rgba(${P.cinDeep},.5)`);ctx.fillStyle=eg;ctx.fillRect(x-R,y-R,R*2,R*2);ctx.restore();
  scrollBrush(ctx,scrollArc(x,y,R,.9,TAU-.95,60),.9*scale,P.soot,.8,{press:.4,lift:.4,seed:h.seed});
  const b0=Math.atan2(y-by,x-bx);scrollBrush(ctx,scrollArc(bx,by,R*.8,b0-1.05,b0+1.05,30),.9*scale,P.soot,.8,{press:.6,lift:.2,seed:h.seed+1});
  scrollColumn(ctx,'日食',x+R+8*scale,y-12*scale,Math.max(9,10*scale),P.soot,.78,1);
}
function scrollHazard(h){
  const x=sx(h.x),y=sy(h.y);
  if(h.kind==='nebula')return scrollEclipse(h,x,y);
  if(h.kind==='wind')return scrollWind(h,x,y);
  const reach=gravityRadius(h)*scale;if(y+reach<-20||y-reach>H+20)return;
  if(h.kind==='flare')return scrollComet(h,x,y);
  return scrollMars(h,x,y);
}
// A danger comes onto the sheet as ink does onto absorbent paper: a bloom widening from the middle, its
// edge soft and irregular, fast and then settling.
function scrollHazardReveal(h,draw,t){
  const x=sx(h.x),y=sy(h.y),R=(gravityRadius(h)+12)*scale*(1-Math.pow(1-t,3)),n=20;
  ctx.save();ctx.beginPath();for(let i=0;i<=n;i++){const a=i/n*TAU,r=R*(.84+scrollHash(h.seed,i,2)*.22);i?ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}
  ctx.closePath();ctx.clip();draw(h);ctx.restore();
}

// ---------- The flight: the wet stroke, the dried route and the pricked guide ----------
// The stroke laid behind the traveller is wet ink in the colour of the school the current encounter is
// drawing from, glossy near the tube where it is still wet; the route already flown is that stroke dry,
// gone brown, and broken where the paper's tooth lifted the ink. The guide ahead is pricked, never ruled,
// so the solid barrel of the tube and the dotted guide can never read as one line.
function scrollTrailSchool(){const n=world.player.node||world.nodes.filter(q=>q.visited).pop();return n?scrollSchool(n):0;}
function scrollTrail(){
  const tr=world.trail;if(tr.length<2)return;const P=ink.scroll;
  const pts=[];for(const s of tr){const life=clamp(1-(world.time-s.time)/TRAIL_LIFE,0,1);if(life>0)pts.push([sx(s.x),sy(s.y),life]);}
  const p=world.player;if(world.state!=='dead')pts.push([sx(p.x),sy(p.y),1]);if(pts.length<2)return;
  const school=scrollTrailSchool(),rgb=school===0?P.soot:school===1?P.cin:P.pale;
  ctx.save();ctx.lineCap='round';
  for(let i=1;i<pts.length;i++){const f=pts[i][2];ctx.strokeStyle=`rgba(${rgb},${(.15+f*.75).toFixed(3)})`;ctx.lineWidth=(.9+f*1.3)*scale;ctx.beginPath();ctx.moveTo(pts[i-1][0],pts[i-1][1]);ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();}
  if(school===2){ctx.strokeStyle=`rgba(${P.soot},.45)`;ctx.lineWidth=.35;for(const side of[-1,1]){ctx.beginPath();
    for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,o=side*((.9+pts[i][2]*1.3)*scale/2+.2);
      const X=pts[i][0]-dy/l*o,Y=pts[i][1]+dx/l*o;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();}}
  const tail=Math.max(0,pts.length-10);ctx.strokeStyle='rgba(255,248,226,.5)';ctx.lineWidth=.35;ctx.beginPath();
  for(let i=tail;i<pts.length;i++)i>tail?ctx.lineTo(pts[i][0]-.5,pts[i][1]-.5):ctx.moveTo(pts[i][0]-.5,pts[i][1]-.5);ctx.stroke();
  ctx.restore();
}
// Where the dried route breaks is read off each sample's own distance along the whole route (`cd`, set
// once, the first time it is drawn — the same field the ceiling's route keeps), never off its distance
// from the oldest sample still held: the tail is pruned as the sheet unrolls, and breaks counted from
// there slid along the whole line every time it was, so the dry ink crawled up the scroll.
function scrollInkPath(){
  const Q=world.inkPath;if(Q.length<2)return;const P=ink.scroll;
  if(Q[0].cd===undefined)Q[0].cd=0;
  for(let i=1;i<Q.length;i++)if(Q[i].cd===undefined)Q[i].cd=Q[i-1].cd+Math.hypot(Q[i].x-Q[i-1].x,Q[i].y-Q[i-1].y);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=`rgba(${P.dried},.55)`;ctx.lineWidth=Math.max(.9,1.3*scale);
  let on=true;ctx.beginPath();ctx.moveTo(sx(Q[0].x),sy(Q[0].y));
  for(let i=1;i<Q.length;i++){const a=Q[i-1],b=Q[i];const next=scrollHash(Math.floor(b.cd/9),world.seed|0,71)>.2;
    if(next&&!on)ctx.moveTo(sx(a.x),sy(a.y));if(next)ctx.lineTo(sx(b.x),sy(b.y));on=next;}
  ctx.stroke();ctx.restore();
}
function scrollAim(aim,preview){
  const P=ink.scroll,points=preview.points,warn=preview.blocked||aim?.steep,end=points[points.length-1];
  const dryFrom=preview.inkRange>=0&&end.distance>0?clamp(preview.inkRange/end.distance,0,1):1;
  const Q=points.map(q=>[sx(q.x),sy(q.y)]),lens=[0];for(let i=1;i<Q.length;i++)lens.push(lens[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));const total=lens[lens.length-1];if(total<2)return;
  const at=d=>{let i=1;while(i<Q.length-1&&lens[i]<d)i++;const t=(d-lens[i-1])/((lens[i]-lens[i-1])||1);return[Q[i-1][0]+(Q[i][0]-Q[i-1][0])*t,Q[i-1][1]+(Q[i][1]-Q[i-1][1])*t];};
  // The pricks hold still: stepping them forward on the clock made the guide read as a line crawling off
  // the brush, which ink on paper never does.
  ctx.save();const step=7*scale,start=16*scale;
  for(let d=start;d<total;d+=step){const f=d/total,q=at(d),dry=f>dryFrom;
    ctx.fillStyle=dry?`rgba(${P.soot3},${(.3*(1-f*.4)).toFixed(3)})`:warn?`rgba(${P.cin},${(.9*(1-f*.3)).toFixed(3)})`:`rgba(${P.soot},${((aim?.85:.62)*(1-f*.35)).toFixed(3)})`;
    ctx.beginPath();ctx.arc(q[0],q[1],(aim?1.1:.9)*(1-.35*f)*scale+.3,0,TAU);ctx.fill();}
  if(aim?.perfect&&!preview.fogged){const x=sx(aim.cx+Math.cos(aim.entryAngle)*aim.radius),y=sy(aim.cy+Math.sin(aim.entryAngle)*aim.radius);scrollStar(ctx,x,y,2.6*scale,2,901);}
  ctx.restore();
}

// ---------- The traveller: an armillary sighting tube, the Observer Core at its forward aperture ----------
// A cast bronze barrel laid on the flight's own tangent, with raised collars and the fine lengthwise
// hatching of its finish, one graduated ring round it seen nearly edge-on, and the Core as a warm white
// point at the aperture's lip — the one pure light on the sheet. The tube's best-documented form is Guo
// Shoujing's, centuries after this chart; its presence here is a plausible reconstruction, as the era
// file says, and the brush that records what it sights stays in the scribe's hand, off the sheet.
let scrollTubeArt=null,scrollTubeKey='';
function scrollTubeSprite(){
  const key=DPR.toFixed(2);if(scrollTubeArt&&scrollTubeKey===key)return scrollTubeArt;
  const P=ink.scroll,S=1.25,size=64,c=makeCanvas(Math.round(size*DPR),Math.round(size*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);g.translate(size/2,size/2);g.scale(S,S);
  g.fillStyle='rgba(40,28,14,.1)';g.beginPath();g.ellipse(-2,2.2,15,3.6,0,0,TAU);g.fill();
  const ring=back=>{const a0=back?Math.PI/2:-Math.PI/2,a1=back?Math.PI*1.5:Math.PI/2;g.save();g.translate(-2,0);
    g.strokeStyle=`rgb(${P.bronzeLo})`;g.lineWidth=2.3;g.beginPath();g.ellipse(0,0,3.3,11.8,0,a0,a1);g.stroke();
    g.strokeStyle=`rgb(${back?P.bronze:P.bronzeHi})`;g.lineWidth=1.3;g.beginPath();g.ellipse(0,0,3.3,11.8,0,a0,a1);g.stroke();
    g.strokeStyle='rgba(30,26,21,.8)';g.lineWidth=.35;for(let i=0;i<=12;i++){const a=a0+i/12*Math.PI;g.beginPath();g.moveTo(Math.cos(a)*2.3,Math.sin(a)*10.8);g.lineTo(Math.cos(a)*4.3,Math.sin(a)*12.8);g.stroke();}g.restore();};
  ring(true);
  const bg=g.createLinearGradient(0,-4,0,4);bg.addColorStop(0,`rgb(${P.bronzeHi})`);bg.addColorStop(.3,`rgb(${P.bronze})`);bg.addColorStop(.75,`rgb(${P.bronzeLo})`);bg.addColorStop(1,'#3a2810');
  const barrel=()=>{g.beginPath();g.moveTo(-17,-3.9);g.lineTo(13,-2.8);g.lineTo(13,2.8);g.lineTo(-17,3.9);g.closePath();};
  barrel();g.fillStyle=bg;g.fill();g.save();barrel();g.clip();g.strokeStyle='rgba(40,26,8,.35)';g.lineWidth=.22;for(let y=-3.4;y<3.6;y+=.9){g.beginPath();g.moveTo(-17,y);g.lineTo(13,y*.74);g.stroke();}g.restore();
  barrel();g.strokeStyle='rgba(30,26,21,.9)';g.lineWidth=.6;g.stroke();
  for(const x of[-13,-4,7]){const hh=3.9-(x+17)*.037+.6;g.fillStyle=`rgb(${P.bronzeLo})`;g.fillRect(x-.9,-hh,1.8,hh*2);g.fillStyle=`rgb(${P.bronzeHi})`;g.fillRect(x-.9,-hh,1.8,.7);g.strokeStyle='rgba(30,26,21,.8)';g.lineWidth=.3;g.strokeRect(x-.9,-hh,1.8,hh*2);}
  g.fillStyle='#2a1c0a';g.beginPath();g.ellipse(-17,0,1.2,3.9,0,0,TAU);g.fill();g.stroke();
  ring(false);
  scrollTubeArt={canvas:c,size,S,aperture:14*S};scrollTubeKey=key;return scrollTubeArt;
}
function scrollPlayer(){
  if(world.state==='dead')return;
  const P=ink.scroll,p=world.player,sp=scrollTubeSprite(),{x,y,ang}=heldPose(-19*sp.S,15*sp.S),t=reducedMotion?0:world.time;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);
  ctx.drawImage(sp.canvas,-sp.size/2,-sp.size/2,sp.size,sp.size);
  const ax=sp.aperture,br=1+.08*Math.sin(t*2.1),hg=ctx.createRadialGradient(ax,0,0,ax,0,11*br);
  hg.addColorStop(0,'rgba(255,250,228,.95)');hg.addColorStop(.3,'rgba(255,244,206,.55)');hg.addColorStop(1,'rgba(255,244,206,0)');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(ax,0,11*br,0,TAU);ctx.fill();ctx.fillStyle=`rgb(${P.core})`;ctx.beginPath();ctx.arc(ax,0,2.5,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgb(${P.bronzeLo})`;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(ax,0,3.4,0,TAU);ctx.stroke();
  // The charges held, round the instrument: the screen as a pale rule-drawn ring, the jade disc's notched
  // rim, the dawn as cinnabar rays.
  if(p.shielded){ctx.strokeStyle=`rgba(${P.soot},.55)`;ctx.lineWidth=1;ctx.setLineDash([3,2]);ctx.beginPath();ctx.arc(0,0,20,0,TAU);ctx.stroke();ctx.setLineDash([]);}
  if(p.reflectorArmed){ctx.strokeStyle='rgba(96,130,104,.8)';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,24,-.9,.9);ctx.stroke();}
  if(p.dawnArmed){ctx.strokeStyle=`rgba(${P.cin},.7)`;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<10;i++){const a=i*TAU/10;ctx.moveTo(Math.cos(a)*17,Math.sin(a)*17);ctx.lineTo(Math.cos(a)*(i%2?20.5:23),Math.sin(a)*(i%2?20.5:23));}ctx.stroke();}
  ctx.restore();
}

// ---------- Hundun: the boundary as the paper failing ----------
// Pine-soot ink bound in glue on hemp, failing: the cellulose goes first, so the edge is fibrous rather
// than cut; the binder lets go beside it, so the ink blooms outward into soft stains with a browned
// tide-line before the sheet thins to nothing. Below it is the cave the scroll lay sealed in for nine
// centuries — this is what resumes the moment the seal is broken. The boundary's own position, rate and
// grace are untouched: read straight off the same world state drawDark reads.
function scrollTearAt(xw,level){const lv=Math.floor(level/50);return (scrollHash(Math.floor(xw/40),lv,5)-.5)*14*(1-(xw/40%1))+(scrollHash(Math.floor(xw/40)+1,lv,5)-.5)*14*(xw/40%1)+Math.sin(xw*.21+lv)*1.6+Math.sin(xw*.53)*1;}
function scrollDark(dt){
  const P=ink.scroll,fy=sy(world.floorY-4),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  const level=world.floorY,step=Math.max(2,2.5*scale),pts=[];
  for(let x=-step;x<=W+step;x+=step){const xw=(x-W*.5)/scale;pts.push([x,fy+scrollTearAt(xw+1000,level)*scale]);}
  ctx.save();
  // the sheet thinning ahead of the loss, the cave's dark coming through it.
  const reach=(54+near*40)*scale,tg=ctx.createLinearGradient(0,fy-reach,0,fy+8*scale);
  tg.addColorStop(0,`rgba(${P.bloom},0)`);tg.addColorStop(.75,`rgba(${P.bloom},${(.16+near*.14).toFixed(3)})`);tg.addColorStop(1,`rgba(${P.bloom},.42)`);ctx.fillStyle=tg;ctx.fillRect(0,fy-reach,W,reach+10*scale);
  // ink running into the wet margin: soft stains with a browned tide-line, anchored to the world.
  const lv=Math.floor(level/60);
  for(let i=0;i<9;i++){const xw=(scrollHash(i,lv,11)-.5)*W/scale*1.1,x=W/2+xw*scale,y=fy-(8+scrollHash(i,lv,12)*34)*scale,rx=(14+scrollHash(i,lv,13)*22)*scale,ry=(6+scrollHash(i,lv,14)*8)*scale;
    const g=ctx.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,`rgba(${P.bloom},.07)`);g.addColorStop(1,`rgba(${P.bloom},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(${P.tide},${(.12+near*.06).toFixed(3)})`;ctx.lineWidth=.6;ctx.beginPath();for(let j=0;j<=28;j++){const a=j/28*TAU,k=1+(scrollHash(i*31+j,lv,15)-.5)*.2;j?ctx.lineTo(x+Math.cos(a)*rx*k,y+Math.sin(a)*ry*k):ctx.moveTo(x+Math.cos(a)*rx*k,y+Math.sin(a)*ry*k);}ctx.stroke();}
  // the loss itself, and the cave below it.
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.lineTo(W+10,H+10);ctx.lineTo(-10,H+10);ctx.closePath();ctx.fillStyle=`rgba(${P.cave},.97)`;ctx.fill();
  // the fringe: loose fibres standing out over the dark from the broken edge, and scraps drifting down.
  ctx.lineCap='round';
  for(let i=0;i<pts.length;i+=1){for(let k=0;k<3;k++){const h=scrollHash(i,k,lv+17);if(h<.25)continue;const a=Math.PI/2+(scrollHash(i,k,lv+18)-.5)*1.6,L=(2+scrollHash(i,k,lv+19)**2*11)*scale,x=pts[i][0]+(scrollHash(i,k,20)-.5)*step,y=pts[i][1]-.5;
    ctx.strokeStyle=`rgba(${205+(h*25|0)},${184+(h*20|0)},${140+(h*20|0)},${(.35+h*.4).toFixed(3)})`;ctx.lineWidth=.3+h*.3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);ctx.stroke();}}
  const time=reducedMotion?0:world.time;
  for(let k=0;k<10;k++){const ph=((k*.618+time*(.15+(k%5)*.04))%1+1)%1,x=((k*.3819+lv*.137)%1)*W,y=fy+(scrollTearAt((x-W*.5)/scale+1000,level)+ph*ph*34+2)*scale,r=(.6+(k%4)*.35)*scale,al=(1-ph)*(.4+near*.2);
    if(y<-10||y>H+10||al<.02)continue;ctx.fillStyle=`rgba(200,178,132,${al.toFixed(3)})`;ctx.beginPath();ctx.ellipse(x,y,r*1.4,r,k,0,TAU);ctx.fill();}
  ctx.restore();
}

// ---------- A chart, filed: the boundary closed round its three stars and its name written beside ----------
// Where the atlas engraves a constellation-figure, this chart draws no picture at all: a star office is
// a position among neighbours, never a silhouette. A completed chart is closed inside one boundary and
// captioned in kaishu with the asterism it is filed under, and a seal pressed below the name.
function scrollFigure(chart){
  if(chart.stars.length<3)return;const P=ink.scroll;
  const pts=chart.stars.map(s=>[sx(s.x),sy(s.y)]),ys=pts.map(p=>p[1]);if(Math.max(...ys)<-220||Math.min(...ys)>H+220)return;
  const count=chart.stars.filter(n=>n.visited).length,done=chart.completed,f=chart.expired?.25:done?1:count/3;if(f<=0)return;
  const pad=Math.max(...chart.stars.map(s=>s.cap))*scale+10*scale,seed=(chart.id*7919)>>>0;
  scrollBrush(ctx,scrollCut(scrollLoop(pts,pad,seed%97,72),done?1:f*.85),.7*scale,chart.expired?P.soot3:P.soot2,chart.expired?.3:.5,{press:.25,lift:.8,seed});
  if(!done||chart.expired)return;
  let maxX=-1e9,minY=1e9;for(const p of pts){maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);}
  const name=SCROLL_CHARTS[((chart.catalogueIndex|0)%12+12)%12][0],x=Math.min(W-30,maxX+pad+10*scale),e=scrollColumn(ctx,name,x,minY,Math.max(13,15*scale),P.soot,.9,1,'kaiM');
  scrollSeal(ctx,x,e+12*scale,Math.max(12,13*scale),'志',seed,.95,.04);
}

// ---------- The HUD: what the run owes the player, set in the chart's own hand ----------
// The score in Chinese numerals down a column at the head of the sheet, with the curator's figure small
// beneath it, because nobody should have to read 一千二百四十七 to know a score; the ink as a stick of pine
// soot ground down at one end, which is exactly what 墨 is — a consumed-by-labour resource, spent by the
// flight and ground back up by holding an orbit — reddening when it will not carry an ordinary transfer;
// the pace under it; the rhythm of clean landings as a row of small seals; and each charge held as its
// character in a seal. The DOM HUD stays for screen readers and is taken off the screen (index.html).
let scrollHudTopPx=null;
function scrollHudTop(){
  if(scrollHudTopPx!==null)return scrollHudTopPx;
  let t=26;try{const e=document.querySelector('.hud'),v=e&&typeof getComputedStyle==='function'?parseFloat(getComputedStyle(e).top):NaN;if(isFinite(v))t=v;}catch(e){}
  return scrollHudTopPx=t;
}
function scrollHudLeaf(){
  if(!world||world.state==='ready')return;
  const P=ink.scroll,top=scrollHudTop(),words=plateWords().hud,score=world.score|0;
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  const left=30,col=scrollNum(score)+'度';
  scrollColumn(ctx,col,left,top-4,15,P.soot,.94,1,'kaiM');
  ctx.font=plateFace(10,'sc');ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle=`rgba(${P.soot},.62)`;ctx.fillText(String(score),left,top-4+[...col].length*15*1.06+3);
  // The ink-stick: its full length pricked out, what is left of it solid, the ground face at its end.
  const level=world.inkLevel(),low=level<=.34,pulse=low&&!reducedMotion?.5+.5*Math.sin(world.time*6):1,L=Math.min(150,W*.36),x0=W/2-L/2,y=top,h=10,x1=x0+Math.max(6,L*level);
  ctx.fillStyle=`rgba(${P.soot2},.5)`;for(let x=x1+4;x<x0+L;x+=4){ctx.beginPath();ctx.arc(x,y+h/2,.55,0,TAU);ctx.fill();}
  ctx.fillStyle='rgba(30,26,21,.22)';ctx.fillRect(x0+1.2,y+1.5,x1-x0,h);
  const gr=ctx.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#3b352c');gr.addColorStop(.22,'#23201a');gr.addColorStop(1,'#0f0d0a');ctx.fillStyle=gr;
  ctx.beginPath();ctx.moveTo(x0+1.5,y);ctx.lineTo(x1,y);ctx.lineTo(x1-3,y+h);ctx.lineTo(x0+1.5,y+h);ctx.quadraticCurveTo(x0,y+h/2,x0+1.5,y);ctx.fill();
  ctx.fillStyle=low?`rgba(${P.cin},${(.6+.4*pulse).toFixed(3)})`:'#4a453d';ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x1+1.6,y+.8);ctx.lineTo(x1-1.4,y+h);ctx.lineTo(x1-3,y+h);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,246,220,.18)';ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(x0+3,y+1.2);ctx.lineTo(x1-1,y+1.2);ctx.stroke();
  if(x1-x0>34){ctx.strokeStyle=`rgba(${P.gilt},.85)`;ctx.lineWidth=.45;ctx.strokeRect(x0+7,y+2,26,h-4);ctx.fillStyle=`rgba(${P.gilt},.9)`;ctx.font=plateFace(6.6,'kaiM');ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('松煙',x0+20,y+h/2+.3);}
  scrollColumn(ctx,'墨',x0-10,y-1,10,P.soot,.75,1,'kaiL');
  const m=world.speedMultiplier();ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle=`rgba(${P.soot},.6)`;ctx.font=plateFace(10,'sc');ctx.fillText(words.pace+(m%1?m.toFixed(1):m),W/2,y+h+5);
  // Clean landings as seals, and the charges held.
  const right=W-30;let rx=right;
  if(world.combo>1&&world.captures>0){const shown=Math.min(6,world.combo);for(let i=0;i<shown;i++){scrollSeal(ctx,rx,top+6,11,'正',400+i,.95,(i%2?.05:-.04));rx-=15;}
    if(world.combo>6){ctx.textAlign='right';ctx.font=plateFace(10,'sc');ctx.fillStyle=`rgba(${P.soot},.62)`;ctx.fillText('×'+world.combo,right+6,top+16);}}
  let ix=right;const iy=top+34,p=world.player;
  if(p.shielded){scrollSeal(ctx,ix,iy,14,'屏',61,.95);ix-=19;}
  if(p.reflectorArmed){scrollSeal(ctx,ix,iy,14,'璣',62,.95);ix-=19;}
  if(p.dawnArmed){scrollSeal(ctx,ix,iy,14,'曉',63,.95);ix-=19;}
  ctx.restore();
}
// What is written on the sheet — a note, a warning, a landing — is ink: the line itself, and a breath of
// it feathering a hair wider into the paper.
function scrollInscriptionInk(caps){
  return [{rgb:ink.scroll.soot2,alpha:caps?.2:.16,dx:.3,dy:.35},{rgb:ink.scroll.soot,alpha:caps?.92:.82,dx:0,dy:0}];
}
// Fixtures of the printed sheet this one does not have, registered as no-ops so the intent is stated
// rather than inferred: the engraved plate-frame (the paper's edges and the graduated bands stand in for
// it, drawn under the loss rather than over it), the laid wires (the paper's own laid lines are baked into
// its ground), the geometer's lettered survey of a landing, the swirl of starlight round a vortex, the
// engraved running head and the chapter title struck across the sheet.
function scrollNone(){}
// Three more of the atlas's fixtures this chart has no use for, named here so the intent is stated. The
// armillary sphere the atlas rules behind its chart is lettered in Latin — Ecliptica, Aequator Coelestis,
// Roman hours — and a Tang chart measures its sky in lodges and dù, which the rails already carry. The
// engraved star the atlas sets over each star of a chart says "these belong together", and a star
// office says that with its own joined circles and the boundary it is filed in. And the atlas's quill
// nib is not the tool that wrote this sheet: a brush lays each sign down whole, so the captions come up
// a glyph at a time (see the reveal plate in reveal.js) with no tip following them.
function invalidateScrollArt(){scrollTile=null;scrollTileKey='';scrollTitleArt=null;scrollTitleKey='';scrollTubeArt=null;scrollTubeKey='';scrollHudTopPx=null;}
// Entering the era asks for the kaishu at each weight it is set in, and repaints the cached art when they
// land, since a face that arrives late would otherwise leave its fallback baked into the title and tile.
function scrollFaceReady(){
  if(!document.fonts||!document.fonts.load)return;
  Promise.all([document.fonts.load(plateFace(16,'kai'),'天文圖'),document.fonts.load(plateFace(16,'kaiM'),'天文圖'),document.fonts.load(plateFace(16,'kaiL'),'天文圖')])
    .then(()=>{invalidateScrollArt();if(world)render(0);}).catch(()=>{});
}

defineHand('scroll',{
  atmosphere:scrollAtmosphere,
  node:scrollNode,
  hazard:scrollHazard,
  player:scrollPlayer,
  dark:scrollDark,
  plateFrame:scrollNone,
  laid:scrollNone,
  figure:scrollFigure,
  surveys:scrollNone,
  hudLeaf:scrollHudLeaf,
  runningHead:scrollNone,
  chapterReveal:scrollNone,
  flourish:scrollFlourish,
  trail:scrollTrail,
  aim:scrollAim,
  inkPath:scrollInkPath,
  inscriptionInk:scrollInscriptionInk,
  lenses:scrollNone,
  sphere:scrollNone,
  chartStar:scrollNone,
  nib:scrollNone,
  hazardReveal:scrollHazardReveal,
  ready:scrollFaceReady
});

// ---------- The vocabulary: only what this era calls differently ----------
// Everything set on this sheet in English is a curator's gloss, in the modern slab the other two eras
// use, with the chart's own words in kaishu beside it where it has them: a constellation is a star office,
// a chapter one of the four palaces of the sky, the score is counted in dù, the currency is the ink-stick,
// the boundary is hundun, the formless chaos before the world had shape. Names from 03-scroll.md.
defineVoice('scroll',{
  chart:'STAR OFFICE',
  chartNoun:'star office',
  chartVerb:'filed',
  chartNames:SCROLL_CHARTS.map(c=>c[0]+' · '+c[1]),
  chartSaid:'{chart} is filed. Sixty toward the count. Hundun holds back for four seconds.',
  chapters:['THE AZURE DRAGON','THE BLACK TORTOISE','THE WHITE TIGER','THE VERMILION BIRD'],
  chapterSaid:'Palace {numeral}. {name}.',
  milestones:['THE AZURE DRAGON','THE BLACK TORTOISE','THE WHITE TIGER','THE VERMILION BIRD'],
  opening:'The tube is raised. Tap to release. Follow the pricked line to the next light. Hold a light to file it and to grind more ink; every flight spends ink by the distance it carries.',
  // The Chronicle ends with the fourth palace: the sky's four quarters passed and the scroll rolled up.
  // Read Endless, the sheet unrolls as it always did (LINKING.md).
  goalRow:32,
  endless:true,
  ended:'The paper gives way. {score} dù. Tap to unroll the scroll again, or return to the atlas.',
  won:'The four palaces are passed and the scroll is rolled up. {score} dù. Tap to unroll it again, or return to the atlas.',
  unrecorded:'ERA PREVIEW · NOT RECORDED',
  hazards:{vortex:'熒惑守心 · MARS AT THE HEART',flare:'彗星 · THE BROOM STAR',wind:'風角 · THE WIND ANGLE'},
  labels:{shield:'THE SCREEN',reflector:'THE JADE DISC',dawn:'DAYBREAK'},
  pressures:{relaxed:'月 · THE MOON',classic:'A BRIGHT STAR',hardcore:'A FAINT STAR'},
  pressureSet:'THE COURSE IS SET · {label}',
  losses:{
    'THE DARK CAUGHT UP':'HUNDUN TOOK THE SHEET',
    'LEFT THE STAR CHART':'OFF THE EDGE OF THE SCROLL',
    'THE ORBIT FADED':'THE LIGHT WAS LOST',
    'THE NIB RAN DRY':'THE INK RAN OUT',
    'DRAWN INTO A VORTEX':'HELD BY MARS AT THE HEART',
    'SEARED BY A SUNSPOT FLARE':'SWEPT BY THE BROOM STAR',
    'THE SUN ROSE':'THE FOUR PALACES WERE PASSED'
  },
  observations:{
    perfectThree:'THREE CLEAN SIGHTINGS',
    skipFive:'FIVE LIGHTS PASSED OVER',
    maxSpeed:'FULL PACE ACROSS THE SHEET',
    graze:'MARS GRAZED AT FULL PACE',
    pureChart:'A STAR OFFICE IN CLEAN SIGHTINGS',
    fortyRows:'THE FORTIETH ROW',
    threeMinutes:'THREE MINUTES OF WATCHING',
    rightAngle:'A SQUARE SIGHTING'
  },
  squareLanding:'A SQUARE SIGHTING',
  hud:{pace:'PACE ×',flow:'ORDER ×',shield:'THE SCREEN HELD',reflector:'THE JADE DISC HELD',dawn:'DAYBREAK HELD'},
  chrome:{
    brand:'天文圖',bestLabel:'Preview',endTitle:'The paper gives way.',endTitleWon:'The scroll is rolled up.',pauseTitle:'The Bureau waits.',
    pauseEyebrow:'THE BRUSH IS RESTED',pauseNote:'Tap the sheet to continue',pauseResume:'TAKE UP THE TUBE',
    pauseLeave:'ROLL UP THE SCROLL',pauseLabel:'Rest the tube',gameLabel:'The Scroll, a playable Era III preview',
    canvasLabel:'The Scroll. Guide an armillary sighting tube across a Tang star chart, filing each light you hold. Tap or press Space to release.',
    eraExit:'BACK TO THE ATLAS',eraExitLabel:'Back to the atlas',endAction:'Tap to unroll it again',endActionWon:'Tap to unroll it again',
    readings:{chronicle:'THE FOUR PALACES',endless:'THE ENDLESS SCROLL',label:'The reading: {reading}. Tap to change it'},
    statCaptures:'Lights',statPerfects:'Clean',statFlow:'Best order',statRow:'Row',
    instructions:{head:'THE MANNER OF SIGHTING',rules:['Tap to release the sighting tube.','Hold a light to file it: joined, closed, coloured, named.','Keep ahead of hundun, the paper failing below.','Choose the first light — {pressures}.']}
  },
  tips:{
    first:'Release when the pricked line reaches the next light.',
    dark:'Hold a light for speed and ink. The paper fails faster below.',
    faded:'A pale light fades. File it and move on.',
    vortex:'Mars pulls a flight toward it. Give the red point room.',
    angle:'Meet the rim along its curve for a clean sighting.',
    speed:'Clean sightings keep your pace.'
  },
  // Every note a landing writes, in the curator's English rather than the atlas's Latin.
  glosses:{
    slingshot:'THE BOW DRAWN · PACE ×{factor}',
    maxSpeed:'FULL PACE · HOLD THE LINE',
    fullCharge:'THE INK IS GROUND · PACE IS YOURS',
    rough:'A ROUGH SIGHTING · BASE {base}',
    skip:'{count} LIGHT{plural} PASSED OVER · +{bonus}',
    reprieve:'FILE 3 LIGHTS · +60 & A REPRIEVE',
    slingOrbit:'CIRCLE TO DRAW THE BOW · TAP TO LEAVE',
    fading:'A PALE LIGHT · KEEP MOVING',
    golden:'A LUCKY FIND',
    perfectFlow:'CLEAN SIGHTING · ORDER ×{combo}',
    perfect:'CLEAN SIGHTING',
    wandering:'A WANDERING STAR',
    chartProgress:'{chart} · {count} / 3',
    chartComplete:'{chart} · FILED +60',
    angleBonus:'  ·  TRUE ENTRY +{bonus}',
    multiplier:'  ·  ×{mult}',
    shieldArmed:'{label} · TURNS ONE BLOW',
    shieldBreak:'{label} SPENT · TOOK THE HIT',
    reflectorArmed:'{label} · SENDS YOU BACK FROM THE EDGE',
    reflectorBreak:'{label} TURNED YOU BACK',
    dawnArmed:'{label} · HOLDS HUNDUN BACK',
    dawnBreak:'{label} PUSHED HUNDUN BACK',
    inkwellFound:'THE INKSTONE · A NEW INK TAKES',
    inkwellDry:'THE INK RUNS LOW · GRIND FIRST',
    observation:'ENTERED · {name}',
    close:'CLOSE +5'
  },
  held:{
    choose:'The first light you hold sets how fast the paper fails.',
    dry:'The ink is running low. Hold this light to grind more.',
    sling:'One circle builds speed. Meet the next cleanly and it holds.',
    release:'Release when the pricked line meets the next light.',
    bend:'Mars bends the course. Follow the pricked line; give it room.'
  }
});

// The Journey's milestones on the scroll (LINKING.md): the four palaces as the four quarters they keep —
// east, north, west, south — each a seal pressed in cinnabar once its palace is filed, and until then its
// quarter written in soot inside a ruled frame, the ink coming up the frame as the knowledge banked does.
defineHand('scroll',{journeyMark(g,w,h,m){
  const P=ink.scroll,quarters=['東','北','西','南'],step=Math.min(56,w/(m.of+.4)),size=Math.min(24,h*.4);
  for(let i=0;i<m.of;i++){const cx=w/2+(i-(m.of-1)/2)*step,cy=h/2,q=quarters[i]||'';
    if(i<m.open){scrollSeal(g,cx,cy,size,q,i+31,.95,(i%2?.04:-.04));continue;}
    const part=i===m.open?m.toward:0;g.save();g.strokeStyle=`rgba(${P.soot},.4)`;g.lineWidth=.7;g.strokeRect(cx-size/2,cy-size/2,size,size);
    if(part>0){g.fillStyle=`rgba(${P.soot},.12)`;g.fillRect(cx-size/2,cy+size/2-size*part,size,size*part);}g.restore();
    scrollColumn(g,q,cx,cy-size*.53,size*.72,P.soot,.35+.5*part,1,'kaiM');}
}});
