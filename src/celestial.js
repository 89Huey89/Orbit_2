'use strict';
/* Orbit · src/celestial.js
   Chapter plates, ambient events, chapter reveal, region atmosphere. */
// The grain overlay pattern is only as fresh as the grain canvas it wraps (rebuilt on resize —
// see plates.js), so it is memoized here instead of re-wrapped every frame.
let grainPattern=null,grainPatternSource=null,grainSheetCanvas=null,grainSheetKey='',grainSheetSource=null;
// The grain used to be laid as a repeating pattern across the whole sheet every frame: a full screen of
// wrapped, filtered texture lookups, which is the most expensive way a canvas can paint a flat field.
// It is tiled once into a sheet the size of the plate instead — exactly as the laid paper already is —
// and that sheet is then blitted one device pixel to one device pixel. Same grain, a straight copy.
// ---------- Chapter plates: `distantGlobe` (a reusable engraved world) and `celestialPlate` (the four
// cached full-bleed illustrations), plus their placement and blit. Night keeps every original literal
// untouched; paper redraws the same compositions with hairline hatching, stipple and dilute washes —
// never a flat dark fill, a glow, or a dark vignette. New Galileo-quotation marks (a Sidereus Nuncius
// terminator on the Quiet moon, sunspot groups on the Eclipse disc, a marginal 1610 Saturn sketch on the
// Drift caption, and Jupiter's "O * * *" notation on the Deep caption) are drawn with their own
// independent seeded generators so they never perturb the deterministic marks already on the night plate.
definePlate('plates',{
  night:{
    globeContour:'30,29,24',globeShadeA:'8,17,24',globeShadeB:'7,14,22',globeShadeC:'5,11,19',globeRim:'214,203,167',
    tones:[['#1c3031','#0a151e'],['#30281f','#10151c'],['#251f2a','#080e19'],['#19283b','#080e1b']],
    limbRing:'202,197,162',moonStipple:'207,206,179',
    ringBack:'190,158,113',ringFront:'202,175,127',ringFleck:'214,183,134',
    coronaA:'219,198,161',coronaB:'172,147,132',sunDisc:'#090f1b',coronaRing:'219,196,153',coronaArc:'219,184,134',
    smokeFill:'5,8,18',smokeStroke:'137,117,130',
    armWarm:'193,201,192',armCool:'119,149,169',stippleWarm:'218,207,174',stippleCool:'171,192,205',coreRing:'195,200,182',
    chartLine:'190,183,154',captionLatin:'207,196,166',captionTab:'198,187,155',figCaption:'198,187,155',
    speckleLight:'229,215,181',speckleDark:'1,6,14',veil:'5,11,19',vignette:'3,8,17',
    terminator:'224,214,182',ringGlyph:'214,205,172',jupiterGlyph:'214,205,172',
    sunspotCore:'2,4,9',sunspotPenumbra:'219,196,153'
  },
  paper:{
    globeContour:'58,42,28',globeShadeInk:'34,24,16',globeRim:'58,42,28',
    patchTone:'96,74,52',patchIndigo:'52,84,120',
    limbRing:'58,42,28',moonStipple:'58,42,28',
    ringBack:'150,100,32',ringFront:'176,118,38',ringFleck:'160,84,52',
    coronaA:'166,58,40',coronaB:'96,74,52',discInk:'34,24,16',coronaRing:'58,42,28',coronaArc:'96,74,52',
    smokeWash:'96,74,52',smokeStroke:'58,42,28',
    armWarm:'58,42,28',armCool:'96,74,52',stippleWarm:'58,42,28',stippleCool:'96,74,52',coreRing:'58,42,28',
    chartLine:'96,74,52',captionLatin:'58,42,28',captionTab:'58,42,28',figCaption:'96,74,52',
    speckleLight:'246,238,216',speckleDark:'58,42,28',
    terminator:'58,42,28',ringGlyph:'58,42,28',jupiterGlyph:'58,42,28',
    sunspotCore:'34,24,16',sunspotPenumbra:'96,74,52'
  }
});
function distantGlobe(g,x,y,r,family,seed){
  const rng=seeded(seed),palette=planetPalettes[family],paper=onPaper();
  g.save();g.translate(x,y);g.beginPath();g.arc(0,0,r,0,TAU);g.clip();
  if(!paper){
    g.fillStyle=palette.body;g.fillRect(-r,-r,r*2,r*2);
    paintPlanetSurface(g,g,r,family,palette,rng);paintPigment(g,r,rng);
    // Dense curved engraving holds up at the scale of a whole atlas page.
    for(let i=0;i<150;i++){
      const xx=-r+i*r/65;
      g.strokeStyle=`rgba(${ink.plates.globeContour},${.08+i/150*.24})`;g.lineWidth=.45+rng()*.35;
      g.beginPath();g.moveTo(xx,-r);g.bezierCurveTo(xx+r*.19,-r*.3,xx-r*.34,r*.5,xx-r*.55,r);g.stroke();
    }
  }else if(family==='ringed'){
    // Paper: Saturn's globe is pure ink line work — no fill, a keyline, hairline latitude bands.
    const lat=seeded((seed*40503)>>>0);
    for(let i=-4;i<=4;i++){
      if(i===0)continue;
      const yy=i*r/5,half=Math.sqrt(Math.max(0,r*r-yy*yy));
      g.strokeStyle=`rgba(${ink.plates.globeContour},${.16+lat()*.14})`;g.lineWidth=.45;
      g.beginPath();g.moveTo(-half,yy);g.lineTo(half,yy);g.stroke();
    }
  }else if(family==='crater'){
    // Paper: craters are line work only — a hairline rim with a short hatched shadow crescent inside
    // on the far side, no fill, so most of the body stays clean sheet.
    const cr=seeded((seed*40503)>>>0);
    for(let i=0;i<20;i++){
      const a=cr()*TAU,d=Math.sqrt(cr())*r*.9,cx0=Math.cos(a)*d,cy0=Math.sin(a)*d;
      const cr0=r*(i<3?.12+cr()*.05:.03+cr()*.065);
      g.strokeStyle=`rgba(${ink.plates.globeContour},${.22+cr()*.2})`;g.lineWidth=.4+cr()*.25;
      g.beginPath();g.arc(cx0,cy0,cr0,0,TAU);g.stroke();
      g.save();g.beginPath();g.arc(cx0,cy0,cr0,0,TAU);g.clip();
      for(let k=-cr0;k<cr0;k+=cr0*.4){
        if(k<cr0*.05)continue;
        g.strokeStyle=`rgba(${ink.plates.globeContour},${.1+cr()*.12})`;g.lineWidth=.3;
        g.beginPath();g.moveTo(cx0+k,cy0-cr0);g.lineTo(cx0+k,cy0+cr0);g.stroke();
      }
      g.restore();
    }
  }else{
    paintPlanetSurface(g,g,r,family,palette,rng);paintPigment(g,r,rng);
  }
  if(paper){
    // Paper: the shaded hemisphere is crosshatched ink, never a flat dark fill — an independent
    // generator keeps this from ever touching the night plate's deterministic sequence above.
    const hatch=seeded((seed*2654435761)>>>0);
    for(let pass=0;pass<2;pass++){
      g.save();g.rotate(pass===0?.62:-.31);
      for(let i=-r*1.3;i<r*1.3;i+=1.8+hatch()*1.4){
        const t=(i+r*1.3)/(r*2.6),cover=Math.max(0,t-.22)/.78;
        if(hatch()>cover*.85+.05)continue;
        g.strokeStyle=`rgba(${ink.plates.globeShadeInk},${.06+hatch()*.22*cover})`;g.lineWidth=.35+hatch()*.35;
        g.beginPath();g.moveTo(i,-r*1.3);g.lineTo(i,r*1.3);g.stroke();
      }
      g.restore();
    }
  }else{
    const shade=g.createLinearGradient(-r*.8,-r*.4,r*.65,r*.4);
    shade.addColorStop(0,`rgba(${ink.plates.globeShadeA},.23)`);shade.addColorStop(.45,`rgba(${ink.plates.globeShadeB},.44)`);shade.addColorStop(1,`rgba(${ink.plates.globeShadeC},.95)`);
    g.fillStyle=shade;g.fillRect(-r,-r,r*2,r*2);
  }
  g.restore();
  if(paper){
    // A keyline closes the disc's edge — an engraving always has one, even where no shading falls.
    g.strokeStyle=`rgba(${ink.plates.globeRim},.28)`;g.lineWidth=.7;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();
  }
  g.strokeStyle=`rgba(${ink.plates.globeRim},${paper?.4:.27})`;g.lineWidth=1.1;g.beginPath();g.arc(x,y,r,Math.PI*.82,Math.PI*1.72);g.stroke();
}
// A compass rose, as a chart carries one: sixteen points about a common centre, each cut in two halves
// that meet on its own axis so the one half is inked and the other left as the sheet — which is what
// lets a rose be read at a glance from the far side of a chart, and is the only reason a rose is drawn
// this way rather than as a star.
function paintWindRose(g,x,y,r,paper){
  const line=ink.plates.chartLine,fleck=ink.plates.ringFleck,base=r*.14;
  for(let i=0;i<16;i++){
    const a=-Math.PI/2+i/16*TAU,len=r*(i%4===0?1:i%2?.44:.68);
    for(const side of [-1,1]){
      const edge=a+side*Math.PI/16;
      g.beginPath();g.moveTo(x+Math.cos(a)*len,y+Math.sin(a)*len);g.lineTo(x+Math.cos(edge)*base,y+Math.sin(edge)*base);g.lineTo(x,y);g.closePath();
      g.fillStyle=`rgba(${side<0?line:fleck},${(side<0?.26:.13)*(paper?1.3:1)})`;g.fill();
      g.strokeStyle=`rgba(${line},${paper?.24:.16})`;g.lineWidth=.35;g.stroke();
    }
  }
  g.strokeStyle=`rgba(${line},${paper?.3:.2})`;g.lineWidth=.5;
  for(const rr of [base,r*.68,r]){g.beginPath();g.arc(x,y,rr,0,TAU);g.stroke();}
  // North is picked out with a lys, as it is on every chart that has one, so the rose says which way
  // the sheet is meant to be held.
  g.beginPath();g.moveTo(x,y-r*1.28);g.lineTo(x-r*.09,y-r*1.04);g.lineTo(x+r*.09,y-r*1.04);g.closePath();
  g.fillStyle=`rgba(${line},${paper?.3:.2})`;g.fill();g.stroke();
}
// A portolan's rhumb web in place of a chapter's figure: a hidden circle pricked with wind-nodes, each
// throwing its thirty-two lines clean across the sheet, and the rose set on the node the chart is
// oriented from. Every line fades away from the node it leaves, because a chart's rhumbs are ruled in
// one charge of ink and run out of it — and because a web of hard lines all the way to the edge would
// read as a grid laid over the chart rather than as something printed a long way behind it.
function paintRhumbPlate(g,index,w,h){
  const paper=onPaper(),rng=seeded(41077+index*911);
  const cx=w*[.34,.62,.5,.44][index],cy=h*[.42,.55,.35,.6][index];
  const R=Math.min(w,h)*[.34,.29,.38,.32][index],phase=[0,.19,.4,-.24][index],reach=Math.hypot(w,h);
  // A chart carries more than one rose: the great one on the node it is oriented from, and a lesser one
  // on another node away from it, at the size a portolan's second rose actually is.
  const great=R*.31,lesser=R*.16,secondAt=1+Math.floor(rng()*8);
  const nodes=[[cx,cy,32,great]];
  for(let i=0;i<8;i++){const a=phase+i/8*TAU;nodes.push([cx+Math.cos(a)*R,cy+Math.sin(a)*R,16,i+1===secondAt?lesser:0]);}
  g.strokeStyle=`rgba(${ink.plates.chartLine},${paper?.14:.075})`;g.lineWidth=.6;
  g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();
  // Where a node carries a rose, its lines are ruled from the rose's own points outward rather than from
  // the prick underneath it — as they are on the chart, and because thirty-two lines meeting at a point
  // would otherwise swallow the very figure they are meant to leave.
  for(const [nx,ny,rays,from] of nodes){
    for(let i=0;i<rays;i++){
      const a=phase+i/rays*TAU,cardinal=i%(rays/4)===0,half=i%(rays/8)===0;
      const tone=cardinal?ink.plates.ringFleck:ink.plates.chartLine;
      const alpha=(rays===32?.14:.085)*(cardinal?2:half?1.4:1)*(paper?1.5:1);
      const sx0=nx+Math.cos(a)*from,sy0=ny+Math.sin(a)*from,ex=nx+Math.cos(a)*reach,ey=ny+Math.sin(a)*reach;
      const stroke=g.createLinearGradient(sx0,sy0,ex,ey);
      stroke.addColorStop(0,`rgba(${tone},${alpha})`);stroke.addColorStop(.42,`rgba(${tone},${alpha*.5})`);stroke.addColorStop(1,`rgba(${tone},0)`);
      g.strokeStyle=stroke;g.lineWidth=cardinal?.55:.4;
      g.beginPath();g.moveTo(sx0,sy0);g.lineTo(ex,ey);g.stroke();
    }
  }
  paintWindRose(g,cx,cy,great,paper);
  const second=nodes[secondAt];
  paintWindRose(g,second[0],second[1],lesser,paper);
  // The scale of leagues, ruled and stepped, in the corner a chart puts it in.
  const bx=w*.12,by=h*.88,step=w*.055;
  g.strokeStyle=`rgba(${ink.plates.chartLine},${paper?.22:.13})`;g.lineWidth=.6;
  g.beginPath();g.moveTo(bx,by);g.lineTo(bx+step*5,by);g.stroke();
  for(let i=0;i<=5;i++){g.beginPath();g.moveTo(bx+i*step,by-4);g.lineTo(bx+i*step,by+4);g.stroke();}
  for(let i=0;i<5;i+=2){g.fillStyle=`rgba(${ink.plates.chartLine},${paper?.14:.08})`;g.fillRect(bx+i*step,by-3,step,3);}
  // The same hand-stippled grain the chapter prints carry, so the two styles sit on one sheet.
  for(let i=0;i<2600;i++){
    const x=rng()*w,y=rng()*h;
    g.fillStyle=i%2?`rgba(${ink.plates.speckleLight},${paper?.05:.035})`:`rgba(${ink.plates.speckleDark},${paper?.05:.07})`;
    g.fillRect(x,y,.55,.7);
  }
}
// How strongly the plate's line is printed down the play channel, where its tone is left out altogether.
const CHANNEL_LINE=.55;
// A context that lets every stroke through and holds back every fill but the finest: what an engraving is
// when its tone is taken away — the hatching, the contours, the stipple — and nothing of its washes, patches,
// grounds or solid discs.
function lineOnlyContext(g){
  return new Proxy(g,{
    get(t,k){
      if(k==='fill')return ()=>{};
      if(k==='fillRect')return (x,y,w,h)=>{if(Math.abs(w*h)<=6)t.fillRect(x,y,w,h);};
      const v=t[k];return typeof v==='function'?v.bind(t):v;
    },
    set(t,k,v){t[k]=v;return true;}
  });
}
function celestialPlate(index,style){
  // The plate goes into the key as well as the region index — a cross-dissolve holds two plates in one
  // frame, so each must keep its own cached illustration — and it is built once, here, so the lookup
  // below and the store at the end of the function can never be spelled two different ways.
  // The plate is drawn in its own 720 by 1200 measure but cut at the resolution it is actually shown at:
  // laid at a fixed 720 by 1200 it was always blown up to fill the sheet, by about two thirds again on the
  // reference phone, and the moon's hatching went to grey fog. The density is capped, and only the two
  // most recent plates are held, since each one is several megabytes and a page turn only ever needs two.
  const job=celestialJob(index,style);
  if(celestialPlates.has(job.key))return celestialPlates.get(job.key);
  while(celestialStage(job));
  return celestialPlates.get(job.key);
}
// A plate is baked in three stages — the whole print, the line alone, the join — and the page turn needs
// the next one the moment it begins. Done all at once there, the bake stood still in the middle of the turn;
// so the next chapter's plate is started a couple of rows ahead (prewarmCelestial, from drawAtmosphere) and
// taken one stage a frame, and asking for a plate part-way through only finishes the stages still to do.
let celestialPending=null;
function celestialJob(index,style){
  // A counterproof is the very same copper pulled a second time, so it asks for the chapter print's own
  // plate and differs only in how that plate is laid down; only the rhumb web is a different cut.
  const cut=style==='rhumbs'?'rhumbs':'chapters',density=clamp(Math.ceil(celestialPlacementFit()*DPR*8)/8,1,1.66);
  const key=plateName+':'+cut+':'+index+':'+density+':'+Math.round(W);
  if(celestialPending&&celestialPending.key===key)return celestialPending;
  return celestialPending={key,index,cut,density,stage:0,full:null,line:null};
}
// Runs the next stage of a job, and answers whether there is another still to run.
function celestialStage(job){
  if(celestialPlates.has(job.key)){if(celestialPending===job)celestialPending=null;return false;}
  if(job.stage===0){job.full=paintCelestialPlate(job.index,job.cut,job.density,false);job.stage=1;return true;}
  if(job.stage===1){job.line=paintCelestialPlate(job.index,job.cut,job.density,true);job.stage=2;return true;}
  while(celestialPlates.size>=2)celestialPlates.delete(celestialPlates.keys().next().value);
  celestialPlates.set(job.key,joinChannel(job.full,job.line));
  if(celestialPending===job)celestialPending=null;
  return false;
}
function prewarmCelestial(index,style){
  if(index>3||style==='none')return;
  const job=celestialJob(index,style);
  if(!celestialPlates.has(job.key))celestialStage(job);
}
function joinChannel(c,line){
  // Behind the chart an engraving reads because it is line, not tone: a dark disc under a veil is still a
  // disc. So the plate is pulled twice — whole, and with its tone left out — and the two are joined once,
  // here: the whole print in the margins, where nothing is played, and only its line, at a little over half
  // strength, down the play channel, graded across the same feather either side the veil it replaces used.
  // The channel is a fixed band of the sheet and the print is only ever carried up and down it, never
  // across, so the join can be cut into the cached plate rather than composited every frame.
  const fit=celestialPlacementFit(),ox=(W-720*fit)/2,half=playChannel(),u=X=>clamp((X-ox)/(720*fit),0,1);
  const band=g=>{const grad=g.createLinearGradient(0,0,c.width,0);
    grad.addColorStop(u(W*.5-half-CHANNEL_FEATHER),'rgba(0,0,0,0)');grad.addColorStop(u(W*.5-half),'rgba(0,0,0,1)');
    grad.addColorStop(u(W*.5+half),'rgba(0,0,0,1)');grad.addColorStop(u(W*.5+half+CHANNEL_FEATHER),'rgba(0,0,0,0)');return grad;};
  const g=c.getContext('2d'),gl=line.getContext('2d');
  g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-out';g.fillStyle=band(g);g.fillRect(0,0,c.width,c.height);
  gl.setTransform(1,0,0,1,0,0);gl.globalCompositeOperation='destination-in';gl.globalAlpha=CHANNEL_LINE;gl.fillStyle=band(gl);gl.fillRect(0,0,line.width,line.height);
  g.globalCompositeOperation='source-over';g.drawImage(line,0,0);
  return c;
}
function paintCelestialPlate(index,cut,density,lineOnly){
  const c=makeCanvas(Math.round(720*density),Math.round(1200*density)),raw=c.getContext('2d'),g=lineOnly?lineOnlyContext(raw):raw,rng=seeded(98153+index*437),w=720,h=1200;
  g.scale(density,density);
  if(cut==='rhumbs'){paintRhumbPlate(g,index,w,h);return c;}
  if(!onPaper()){
    const tones=ink.plates.tones[index];
    const base=g.createLinearGradient(0,0,w,h);base.addColorStop(0,tones[0]);base.addColorStop(1,tones[1]);g.fillStyle=base;g.fillRect(0,0,w,h);
  }
  // On paper the plate starts fully transparent — no background fill of any kind — so the laid-paper
  // backdrop shows through everywhere an ink mark doesn't fall, the way an engraving sits on the sheet.
  // Broad, diluted brush marks give each region the texture of a printed plate. On paper every patch is
  // one dilute sepia tone (plate IV may fold in a faint indigo for the nebula) rather than the night
  // plate's per-region colour.
  for(let i=0;i<36;i++){
    const x=rng()*w,y=rng()*h;
    landContour(g,x,y,80+rng()*180,25+rng()*70,rng);
    if(onPaper()){
      const indigo=index===3&&i%3===0;
      g.fillStyle=indigo?`rgba(${ink.plates.patchIndigo},${.01+rng()*.02})`:`rgba(${ink.plates.patchTone},${.015+rng()*.025})`;
    }else{
      g.fillStyle=`rgba(${atlasRegions[index].pigment},${.012+rng()*.025})`;
    }
    g.fill();
  }
  if(index===0){
    // The Quiet: a monumental lunar limb, with a distant companion above it.
    g.save();g.globalAlpha=.49;distantGlobe(g,52,627,317,'crater',43119);g.restore();
    g.save();g.globalAlpha=.25;distantGlobe(g,568,269,73,'crater',2771);g.restore();
    g.save();g.translate(52,627);g.rotate(-.25);g.strokeStyle=`rgba(${ink.plates.limbRing},.11)`;g.lineWidth=.75;
    for(const r of [340,348]){g.beginPath();g.arc(0,0,r,-1.53,.43);g.stroke();}
    for(let i=0;i<44;i++){
      const a=-1.52+i*.045,r=348,outer=r+(i%5===0?10:4);
      g.beginPath();g.moveTo(Math.cos(a)*r,Math.sin(a)*r);g.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);g.stroke();
    }
    g.restore();
    for(let i=0;i<1900;i++){
      const t=rng(),x=130+t*510+(rng()-.5)*115,y=140+t*870+(rng()-.5)*95;
      g.fillStyle=`rgba(${ink.plates.moonStipple},${.025+rng()*.11})`;g.fillRect(x,y,.6+rng()*.8,.7);
    }
    {
      // A Sidereus Nuncius terminator: a ragged day/night line across the limb, with crater rims
      // catching grazing light on the dark side. Its own generator never touches `rng` above, so this
      // is the only permitted change to the night plate's output here.
      const tr=seeded(51103),paper=onPaper(),cx=52,cy=627,rr=317;
      g.save();g.beginPath();g.arc(cx,cy,rr-1,0,TAU);g.clip();
      const termX=t=>cx+rr*.6+Math.sin(t*13+1.1)*16+Math.sin(t*31-.4)*7;
      g.strokeStyle=`rgba(${ink.plates.terminator},${paper?.5:.3})`;g.lineWidth=paper?1:.8;
      g.beginPath();
      for(let i=0;i<=48;i++){const t=i/48,yy=cy-rr*1.05+t*rr*2.1,xx=termX(t);if(i===0)g.moveTo(xx,yy);else g.lineTo(xx,yy);}
      g.stroke();
      if(paper){
        // Dark hatching stands in for the night side, rather than a flat shadow fill.
        // The strokes run down and to the right, as a left hand lays them.
        for(let i=0;i<70;i++){
          const t=tr(),yy=cy-rr+t*rr*2,xx=termX(t)+8+tr()*(rr*.6);
          if(xx>cx+rr)continue;
          g.strokeStyle=`rgba(${ink.plates.terminator},${.05+tr()*.1})`;g.lineWidth=.4;
          const len=9+tr()*9;g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+len*.72,yy+len*.7);g.stroke();
        }
      }
      for(let i=0;i<20;i++){
        const t=tr(),yy=cy-rr*.85+t*rr*1.7,edge=termX(t),xx=edge+10+tr()*(rr*.35),rimR=2+tr()*3.5;
        if(xx>cx+rr*.98)continue;
        g.strokeStyle=`rgba(${ink.plates.terminator},${paper?.42:.28})`;g.lineWidth=.6;
        g.beginPath();g.arc(xx,yy,rimR,Math.PI*.15,Math.PI*.95);g.stroke();
      }
      g.restore();
    }
  }else if(index===1){
    // The Drift: a vast ring system cuts diagonally through the copper sky.
    const x=618,y=530,r=234,tilt=-.62,flatten=.29;
    g.save();g.translate(x,y);g.globalAlpha=.36;paintPlanetRings(g,r,tilt,flatten,false,ink.plates.ringBack);g.restore();
    g.save();g.globalAlpha=.44;distantGlobe(g,x,y,r,'ringed',67181);g.restore();
    g.save();g.translate(x,y);g.globalAlpha=.53;paintPlanetRings(g,r,tilt,flatten,true,ink.plates.ringFront);g.restore();
    // Separate fine ring shadows and flecks carry the hand-engraved texture.
    g.save();g.translate(x,y);g.rotate(tilt);
    for(let i=0;i<3600;i++){
      const a=rng()*TAU,rr=r*(1.29+rng()*.72),xx=Math.cos(a)*rr,yy=Math.sin(a)*rr*flatten;
      if(a>Math.PI&&Math.hypot(xx,yy)<r)continue;
      g.fillStyle=`rgba(${ink.plates.ringFleck},${.035+rng()*.17})`;g.fillRect(xx,yy,.5+rng()*1.1,.65);
    }
    g.restore();
    if(onPaper()){
      // A hatched shadow band where the globe occults part of the ring, drawn with its own generator.
      const rh=seeded(61777);
      g.save();g.translate(x,y);g.rotate(tilt);
      for(let i=0;i<90;i++){
        const rr=r*(1.31+rh()*.6),a=Math.PI+rh()*Math.PI*.36-.18,xx=Math.cos(a)*rr,yy=Math.sin(a)*rr*flatten;
        const len=4+rh()*5,ang=.9+rh()*.4;
        g.strokeStyle=`rgba(${ink.plates.ringFleck},${.12+rh()*.14})`;g.lineWidth=.4;
        g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+Math.cos(ang)*len,yy+Math.sin(ang)*len*flatten);g.stroke();
      }
      g.restore();
    }
    g.save();g.globalAlpha=.28;distantGlobe(g,137,844,84,'dune',83591);g.restore();
  }else if(index===2){
    // The Eclipse: a dark solar disc inside a corona drawn in hundreds of strokes.
    const x=418,y=470,r=217,eclipsePaper=onPaper();
    g.save();g.translate(x,y);
    // The corona is a whisper of radiating strokes, not a sunburst: barely half as many, shorter, and at
    // two fifths of the weight, so the chapter's dark disc no longer throws light across the whole chart.
    for(let i=0;i<300;i++){
      const a=i/300*TAU,ray=12+Math.pow(rng(),2)*78+Math.pow(Math.abs(Math.cos(a+.3)),6)*46;
      g.strokeStyle=`rgba(${i%4===0?ink.plates.coronaA:ink.plates.coronaB},${.022+rng()*.085})`;g.lineWidth=.35+rng()*.45;
      g.beginPath();g.moveTo(Math.cos(a)*(r+2),Math.sin(a)*(r+2));
      g.quadraticCurveTo(Math.cos(a+.027)*(r+ray*.5),Math.sin(a+.027)*(r+ray*.5),Math.cos(a+.055)*(r+ray),Math.sin(a+.055)*(r+ray));g.stroke();
    }
    if(eclipsePaper){
      // The eclipsed disc is built from dense hatching, never a flat dark fill. The strokes are parallel and
      // slant down to the right, the left hand's way; a second pass at a near angle darkens the lower limb
      // instead of crossing the first, so the disc reads as drawn rather than engraved.
      const dh=seeded(60413);
      g.save();g.beginPath();g.arc(0,0,r,0,TAU);g.clip();
      for(let pass=0;pass<2;pass++){
        g.save();g.rotate(pass===0?-.55:-.82);
        for(let i=-r*1.2;i<r*1.2;i+=(pass===0?1.8:2.6)+dh()*1.1){
          if(pass===1&&i<r*.05)continue;
          g.strokeStyle=`rgba(${ink.plates.discInk},${(pass===0?.16:.1)+dh()*.2})`;g.lineWidth=.55+dh()*.4;
          g.beginPath();g.moveTo(i,-r*1.2);g.lineTo(i,r*1.2);g.stroke();
        }
        g.restore();
      }
      for(let i=0;i<1400;i++){
        const a=dh()*TAU,d=Math.sqrt(dh())*r;
        g.fillStyle=`rgba(${ink.plates.discInk},${.14+dh()*.22})`;g.fillRect(Math.cos(a)*d,Math.sin(a)*d,.8+dh()*.8,.8+dh()*.8);
      }
      g.restore();
    }else{
      g.fillStyle=ink.plates.sunDisc;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();
    }
    {
      // Galileo's sunspot letters: small irregular groups with hatched penumbrae, in a shallow band
      // across the disc. An independent generator keeps this from perturbing the marks above.
      const sp=seeded(74551);
      for(let s=0;s<(eclipsePaper?5:4);s++){
        const a=(s/4-.5)*1.35+sp()*.12,d=r*(.12+sp()*.28),sx0=Math.cos(a)*d,sy0=Math.sin(a)*d*.32,spotR=1.7+sp()*2.1;
        g.fillStyle=`rgba(${ink.plates.sunspotCore},${.5+sp()*.3})`;
        for(let k=0;k<(eclipsePaper?5:3);k++){
          const jr=spotR*(.35+sp()*.7),ja=sp()*TAU;
          g.beginPath();g.arc(sx0+Math.cos(ja)*jr*.4,sy0+Math.sin(ja)*jr*.4,jr*.55,0,TAU);g.fill();
        }
        for(let k=0;k<10;k++){
          const pa=k/10*TAU,pr=spotR*(1.7+sp()*1.1);
          g.strokeStyle=`rgba(${ink.plates.sunspotPenumbra},${(eclipsePaper?.14:.22)+sp()*.08})`;g.lineWidth=.5;
          g.beginPath();g.moveTo(sx0+Math.cos(pa)*spotR*1.15,sy0+Math.sin(pa)*spotR*1.15);
          g.lineTo(sx0+Math.cos(pa)*pr,sy0+Math.sin(pa)*pr);g.stroke();
        }
      }
    }
    for(let i=0;i<9;i++){
      g.strokeStyle=`rgba(${ink.plates.coronaRing},${.16-i*.016})`;g.lineWidth=i===0?1.8:.65;
      g.beginPath();g.arc(-.8,-.7,r+i*1.6,0,TAU);g.stroke();
    }
    for(let i=0;i<14;i++){
      const a=i/14*TAU;
      g.strokeStyle=`rgba(${ink.plates.coronaArc},.14)`;g.lineWidth=.8;
      g.beginPath();g.arc(0,0,r+3,a+.025,a+.08);g.stroke();
    }
    g.restore();
    // Broken bands of smoke make the page feel heavier towards its lower edge.
    for(let i=0;i<16;i++){
      const lx=rng()*w,ly=780+rng()*260,lrx=120+rng()*160,lry=17+rng()*35;
      landContour(g,lx,ly,lrx,lry,rng);
      if(eclipsePaper){
        // Sepia contours with a hatched fill, never a flat wash.
        g.save();g.clip();
        const hb=seeded(80200+i*97);
        for(let k=-lrx*1.3;k<lrx*1.3;k+=2.6+hb()*2){
          g.strokeStyle=`rgba(${ink.plates.smokeWash},${.07+hb()*.08})`;g.lineWidth=.4;
          g.beginPath();g.moveTo(lx+k,ly-lry*1.6);g.lineTo(lx+k+lry*.8,ly+lry*1.6);g.stroke();
        }
        g.restore();
        g.strokeStyle=`rgba(${ink.plates.smokeStroke},.15)`;g.lineWidth=.6;g.stroke();
      }else{
        g.fillStyle='rgba(5,8,18,.19)';g.fill();g.strokeStyle='rgba(137,117,130,.04)';g.lineWidth=.7;g.stroke();
      }
    }
  }else{
    // The Deep: long spiral arms made of chalk, stipple and fine ink contours.
    g.save();g.translate(408,534);g.rotate(-.38);g.scale(1,.72);
    for(let arm=0;arm<3;arm++){
      for(let strand=0;strand<21;strand++){
        g.beginPath();
        for(let i=0;i<=160;i++){
          const t=i/160,a=arm*TAU/3+t*6.9,rr=18+t*401+(strand-10)*(1+t)*1.8;
          const x=Math.cos(a)*rr,y=Math.sin(a)*rr;if(i===0)g.moveTo(x,y);else g.lineTo(x,y);
        }
        g.strokeStyle=`rgba(${strand%4===0?ink.plates.armWarm:ink.plates.armCool},${.025+(1-Math.abs(strand-10)/11)*.07})`;
        g.lineWidth=strand%4===0?.7:1.3;g.stroke();
      }
    }
    for(let i=0;i<7600;i++){
      const t=Math.pow(rng(),.74),arm=i%3,a=arm*TAU/3+t*6.9+(rng()-.5)*.15;
      const rr=18+t*401+(rng()+rng()-1)*(9+t*37),x=Math.cos(a)*rr,y=Math.sin(a)*rr;
      g.fillStyle=`rgba(${i%5===0?ink.plates.stippleWarm:ink.plates.stippleCool},${(.035+rng()*.2)*(1-t*.42)})`;
      g.fillRect(x,y,.5+rng()*.9,.6+rng()*.6);
    }
    for(let i=0;i<22;i++){
      g.strokeStyle=`rgba(${ink.plates.coreRing},${.09-i*.003})`;g.lineWidth=.5;
      g.beginPath();g.ellipse(0,0,8+i*1.7,4+i*.8,-.2,0,TAU);g.stroke();
    }
    g.restore();
  }
  // Chart coordinates and captions are part of the distant print, not controls.
  g.save();g.translate(358,600);g.rotate(-.24);g.strokeStyle=`rgba(${ink.plates.chartLine},${onPaper()?.12:.065})`;g.lineWidth=.65;
  for(const r of [414,423,537]){g.beginPath();g.ellipse(0,0,r,r*.79,0,0,TAU);g.stroke();}
  for(let i=0;i<72;i++){
    const a=i/72*TAU,r=423,l=i%6===0?9:3;
    g.beginPath();g.moveTo(Math.cos(a)*r,Math.sin(a)*r*.79);g.lineTo(Math.cos(a)*(r+l),Math.sin(a)*(r+l)*.79);g.stroke();
  }
  g.restore();
  // The plate's caption block and Galileo's marginal figures are set live at the foot of the sheet — see
  // drawPlateCaptions() — so they keep inside the frame whatever crop the print takes on a narrow sheet.
  for(let i=0;i<4200;i++){
    const x=rng()*w,y=rng()*h;
    if(onPaper()&&x>w*.32&&x<w*.68&&i%3)continue; // a cleaner paper channel: thin the grain toward the centre
    g.fillStyle=i%2?`rgba(${ink.plates.speckleLight},${onPaper()?.05:.035})`:`rgba(${ink.plates.speckleDark},${onPaper()?.05:.07})`;
    g.fillRect(x,y,.55,.7);
  }
  if(!onPaper()){
    // A quiet central channel preserves foreground planets and the trajectory line.
    const veil=g.createLinearGradient(0,0,w,0);
    veil.addColorStop(0,'rgba(5,11,19,.03)');veil.addColorStop(.32,'rgba(5,11,19,.13)');veil.addColorStop(.5,'rgba(5,11,19,.28)');veil.addColorStop(.68,'rgba(5,11,19,.13)');veil.addColorStop(1,'rgba(5,11,19,.03)');
    g.fillStyle=veil;g.fillRect(0,0,w,h);
    const vignette=g.createRadialGradient(w*.5,h*.46,240,w*.5,h*.5,690);
    vignette.addColorStop(0,'rgba(3,8,17,0)');vignette.addColorStop(1,'rgba(3,8,17,.54)');g.fillStyle=vignette;g.fillRect(0,0,w,h);
    // Paper adds no veil and no vignette here — the channel is already kept clear above by thinning
    // the background grain, and the plate must stay fully transparent otherwise so the laid-paper
    // backdrop shows through.
  }
  return c;
}
// How far the scenery rides the ascent relative to the chart itself: the two dust layers behind it
// (drawRegion) are nearer and carry their own faster factors, this is the furthest thing on the
// plate, so it is barely moved by the same climb that scrolls a node clean off the sheet.
const CELESTIAL_PARALLAX=.05;
const celestialPlacementFit=()=>Math.max(W/720,H/1200)*1.07;
function celestialPlacement(){
  const fit=celestialPlacementFit();
  const x=(W-720*fit)/2,y=(H-1200*fit)/2;
  // Tied to cameraY exactly as sy() is, not to elapsed time, so the scenery is engraved on the sheet
  // rather than pasted on the glass: it holds still with the world under pause and reduced motion,
  // and only ever moves because the chart itself has scrolled.
  const parallax=reducedMotion?0:-world.cameraY*scale*CELESTIAL_PARALLAX;
  return {x,y:y+parallax,fit};
}
function drawCelestialScene(index,weight){
  if(weight<.001)return;
  const style=sceneryStyle();if(style==='none')return;
  const plate=celestialPlate(index,style),place=celestialPlacement();
  // On paper the plate sits back as a distant engraving beneath the gameplay marks, so it is blitted
  // at a reduced alpha; night is unaffected.
  // The plate is laid larger than the sheet so it fills it at any aspect; on a phone that is half a
  // screen of engraving blended in beyond both margins every frame. Only the part on the sheet is
  // blitted, with a little overhang so the resampler still has neighbours to read at the edges.
  const dw=720*place.fit,dh=1200*place.fit,overhang=Math.max(2,Math.ceil(place.fit*2));
  // The chapter plates are engraved illustrations; on the observatory plate they are held far back, so
  // they read as the faint deep-sky field a long exposure returns rather than as a printed globe.
  ctx.save();ctx.globalAlpha=onPaper()?weight*.72:modernPlate()?weight*.22:weight;
  if(style==='counterproof'){
    // A counterproof is pulled off an impression while it is still wet, onto a second damp sheet: what
    // comes back is reversed, weaker, and softened by the pass. So the same plate is laid mirrored, at
    // rather less than half a charge, and again a hair off itself — which is the doubling a damp sheet
    // actually takes, rather than a blur standing in for one. Mirroring the whole transform means the
    // blit's own clipping is mirrored with it, so the plate is asked for at its usual coordinates and
    // still lands, and is still cut to the sheet, on the other side of the middle.
    ctx.globalAlpha*=.62;ctx.translate(W,0);ctx.scale(-1,1);
    blitVisible(plate,place.x,place.y,dw,dh,overhang);
    ctx.globalAlpha*=.5;
    blitVisible(plate,place.x+1.3,place.y+1,dw,dh,overhang);
  }else blitVisible(plate,place.x,place.y,dw,dh,overhang);
  ctx.restore();
  drawPlateCaptions(index,weight,place,style);
}
// The plate's caption block — its Latin title, the table numeral, the figure line and, on two of the plates,
// Galileo's own marginal figure above them — used to be baked into the print at its lower-left corner, where a
// narrow sheet cropped it against the frame. It is set live instead, at the print's own place on a wide sheet
// and drawn in to the foot of the margin on a narrow one, in the same whisper the print carries it at.
function drawPlateCaptions(index,weight,place,style){
  if(plainPlate()||weight<.001)return;
  const figures=style!=='rhumbs';
  const paper=onPaper(),fit=clamp(place.fit,.7,1.15),inner=frameBand()+9;
  const x=Math.max(inner,place.x+48*place.fit);
  // Also stops short of the impressum: at the start of a run, before a climbing camera has carried
  // the cartouche down and out of the way, it sits in this same lower margin (see impressumTop()).
  const y=Math.min(place.y+1027*place.fit,H-footerBand()-frameBand()*.92-46*fit,impressumTop()-45*fit-8);
  ctx.save();ctx.globalAlpha=paper?weight*.72:weight;ctx.textAlign='left';ctx.textBaseline='alphabetic';
  // The caption is cut into the print and carried with it, so each of its lines declares its ground
  // (ground.js) as a 'legend': a planet's caption steps round it rather than printing through it, and a
  // note would rather stand elsewhere — but, being the print's own whisper and not the chart's, it is never
  // reason enough to leave a note unwritten, so it is not settled type. A print fading out under a page
  // turn has stopped being read, and claims nothing. The three lines are one legend, owned together.
  const legend=(text,size,dy)=>{ctx.fillText(text,x,y+dy);if(weight>.5)markGroundText('legend',x,y+dy,ctx.measureText(text).width,size,'left','legend');};
  ctx.font=plateFace(17*fit,'text','italic');ctx.fillStyle=`rgba(${ink.plates.captionLatin},${paper?.62:.21})`;
  // A rhumb web is not a figure of anything, so it is captioned as a chart is: by the quarter of the
  // wind its rose is oriented from, and by the ruled scale rather than by a draughtsman.
  legend(figures
    ?['Luna · Cava et montes','Saturnus · Ansae','Sol · Obscuratio','Nebula · Profundum · post tempus tabulae'][index]
    :['Rosa ventorum · Septentrio','Rosa ventorum · Oriens','Rosa ventorum · Meridies','Rosa ventorum · Occidens'][index],17*fit,0);
  // FIG. rather than TAB.: this numbers the hand-drawn figure above the caption, not the plate itself —
  // the plate's own number is the running head's REGIO and the impressum's TAB., and the three used to
  // collide on the one abbreviation.
  ctx.font=plateFace(12*fit);ctx.fillStyle=`rgba(${ink.plates.captionTab},${paper?.5:.18})`;legend('FIG. '+numerals[index],12*fit,25*fit);
  ctx.font=plateFace(11*fit,'text','italic');ctx.fillStyle=`rgba(${ink.plates.figCaption},${paper?.55:.15})`;
  legend(figures
    ?['Fig. I · Luna, Galilæus delin. MDCIX','Fig. II · Saturnus, Galilæus delin. MDCX','Fig. III · Sol maculosus, Galilæus delin. MDCXII','Fig. IV · Iuppiter et Medicea sidera, Galilæus delin. MDCX'][index]
    :'Scala leucarum · XXV ad partem',11*fit,45*fit);
  if(!figures){ctx.restore();return;}
  if(index===1){
    // Galileo's own 1610 sketch of Saturn: a disc with two attached "ears", set above the caption —
    // a small marginal figure, not the plate's big ring system.
    const ms=9,col=`rgba(${ink.plates.ringGlyph},${paper?.55:.4})`;
    ctx.save();ctx.translate(x+102*fit,y-31*fit);ctx.scale(fit,fit);ctx.strokeStyle=col;ctx.lineWidth=.9;
    ctx.beginPath();ctx.arc(0,0,ms,0,TAU);ctx.stroke();
    for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*ms*1.55,0,ms*.62,ms*.42,0,0,TAU);ctx.stroke();}
    ctx.restore();
  }else if(index===3){
    // Galileo's Medicean-stars notation for Jupiter: "O * * *" above the caption.
    const col=`rgba(${ink.plates.jupiterGlyph},${paper?.55:.4})`;
    ctx.save();ctx.translate(x+102*fit,y-31*fit);ctx.scale(fit,fit);ctx.strokeStyle=col;ctx.lineWidth=.9;ctx.beginPath();ctx.arc(0,0,4.4,0,TAU);ctx.stroke();
    ctx.lineWidth=1;
    for(let k=0;k<4;k++){
      const sxk=14+k*12;
      for(const rot of [0,Math.PI/2,Math.PI/4,-Math.PI/4]){
        ctx.beginPath();ctx.moveTo(sxk-3.2*Math.cos(rot),0-3.2*Math.sin(rot));ctx.lineTo(sxk+3.2*Math.cos(rot),0+3.2*Math.sin(rot));ctx.stroke();
      }
    }
    ctx.restore();
  }
  ctx.restore();
}
// The illustrated plate is left whole in the margins and only its line is printed down the play channel,
// where the chart and the traveller have to read first (see celestialPlate, above), graded across a 60-pixel
// feather either side so the change from print to line is never a cut.
const CHANNEL_FEATHER=60;
function ambientPoint(e,progress){
  if(e.kind==='comet')return {x:lerp(e.x,e.endX,progress)*W,y:lerp(e.y,e.endY,progress)*H};
  const place=celestialPlacement();
  return {x:place.x+e.x*place.fit,y:place.y+e.y*place.fit};
}
function ambientClearance(point,tail,aim){
  let clearance=Math.min(point.x,tail.x,W-point.x,W-tail.x)/18;
  for(const n of world.nodes){
    const distance=pointSegment(sx(n.x),sy(n.y),tail.x,tail.y,point.x,point.y);
    clearance=Math.min(clearance,(distance-n.cap*scale-16*scale)/(32*scale));
  }
  for(const h of world.hazards)clearance=Math.min(clearance,(pointSegment(sx(h.x),sy(h.y),tail.x,tail.y,point.x,point.y)-h.r*scale-20*scale)/(30*scale));
  const p=world.player,px=sx(p.x),py=sy(p.y);
  clearance=Math.min(clearance,(pointSegment(px,py,tail.x,tail.y,point.x,point.y)-42*scale)/(35*scale));
  if(p.node){
    const points=world.flightPreview?.points||[];
    for(let i=1;i<points.length;i++)for(const q of [point,tail,{x:(point.x+tail.x)/2,y:(point.y+tail.y)/2}]){
      clearance=Math.min(clearance,(pointSegment(q.x,q.y,sx(points[i-1].x),sy(points[i-1].y),sx(points[i].x),sy(points[i].y))-22*scale)/(30*scale));
    }
  }
  clearance=Math.min(clearance,(sy(world.floorY-4)-Math.max(point.y,tail.y)-45*scale)/(35*scale));
  return clamp(clearance,0,1);
}
function makeAmbientEvent(chapter){
  // A glint picks out a mark that is already on the distant illustration, at the coordinate the plate
  // engraves it at. Only the chapter print puts a mark there: a bare sheet has none, a rhumb web has
  // none of these, and a counterproof is reversed, so the coordinate no longer says where the mark is.
  // In all three the sheet keeps its comets, which are its own and never the illustration's.
  const rng=ambience.random,kind=ambience.sequence%2===0||sceneryStyle()!=='chapterplates'?'comet':'glint';
  for(let attempt=0;attempt<8;attempt++){
    const e={kind,chapter,age:0,life:kind==='comet'?4.5+rng()*1.5:3.6+rng()*1.4,visibility:0};
    if(kind==='comet'){
      const right=rng()>.5;e.x=right?.95:.05;e.endX=right?.80:.20;e.y=.18+rng()*.26;e.endY=e.y+.12+rng()*.07;
    }else{
      // Glints briefly pick out existing marks on the distant illustration.
      const angle=rng()*TAU;
      if(chapter===0){e.x=52+Math.cos(angle)*317;e.y=627+Math.sin(angle)*317;}
      else if(chapter===1){
        const r=310+rng()*145,x=Math.cos(angle)*r,y=Math.sin(angle)*r*.29;
        e.x=618+x*Math.cos(-.62)-y*Math.sin(-.62);e.y=530+x*Math.sin(-.62)+y*Math.cos(-.62);
      }else if(chapter===2){e.x=418+Math.cos(angle)*220;e.y=470+Math.sin(angle)*220;}
      else{
        const t=.42+rng()*.48,a=Math.floor(rng()*3)*TAU/3+t*6.9,r=18+t*401,x=Math.cos(a)*r,y=Math.sin(a)*r*.72;
        e.x=408+x*Math.cos(-.38)-y*Math.sin(-.38);e.y=534+x*Math.sin(-.38)+y*Math.cos(-.38);
      }
    }
    const point=ambientPoint(e,kind==='comet'?.5:0),aim=world.aim();
    if(point.y>H*.16&&point.y<H*.68&&ambientClearance(point,point,aim)>.45)return e;
  }
  return null;
}
// The comet is struck in the plate's own hand, as the cometary broadsides of 1577 and 1618 cut one and as
// the comet observer mark already is (ui.js): a punched head on a small reserved disc, a coma of short
// hairs leaving the limb rather than the nucleus, and a tail of six tapering burin strokes that fan, lean
// off the axis as the tail curls and break as they go — no wash anywhere, since nothing on this plate is
// laid in as light. The tail is cut outward from the head over its first second, so it arrives drawn
// rather than shown; its volume and every clearance rule are the ones the gradient streak kept. `length`
// is read straight off the distance already travelled between the delayed tail sample and the head, so
// the mark's own scale answers to how far the comet has actually moved.
const COMET_RAYS=[{v:-1,run:.72},{v:-.55,run:.9},{v:-.18,run:1},{v:.2,run:.96},{v:.58,run:.82},{v:1,run:.66}];
function drawAmbientComet(point,tail,alpha,age=Infinity){
  const dx=point.x-tail.x,dy=point.y-tail.y,length=Math.max(4,Math.hypot(dx,dy)),ang=Math.atan2(dy,dx);
  const k=length/28,spread=3+k*1.2,curl=1.3+k*.6,STEPS=5,cut=clamp(age/1,0,1);
  ctx.save();ctx.translate(point.x,point.y);ctx.rotate(ang);ctx.lineCap='round';
  COMET_RAYS.forEach((ray,i)=>{
    const v=ray.v,rv=v*(.42+.58*Math.abs(v)),sx0=-1.9*k-Math.abs(rv)*.8*k,sy0=rv*1.6*k;
    const ex=-length*ray.run,ey=rv*spread+curl*ray.run,ccx=-length*.36,ccy=rv*spread*.3+curl*.3;
    for(let s=0;s<STEPS;s++){
      const t0=s/STEPS,t1=(s+1)/STEPS;if(t0>=cut)break;
      // Each stroke breaks once, at its own place, the way a burin lifts on a long cut.
      if(s>0&&(i*3+s*2)%5===0)continue;
      const w=(.75-s*.12)*(1-Math.abs(v)*.25),a=alpha*(.95-s*.15);
      ctx.strokeStyle=`rgba(${s<2?ink.atmosphere.cometHead:ink.atmosphere.cometTrail},${a})`;ctx.lineWidth=Math.max(.15,w);
      ctx.beginPath();ctx.moveTo(qAt(t0,sx0,ccx,ex),qAt(t0,sy0,ccy,ey));ctx.lineTo(qAt(Math.min(t1,cut),sx0,ccx,ex),qAt(Math.min(t1,cut),sy0,ccy,ey));ctx.stroke();
    }
  });
  // The head: the sheet reserved clean round it, the nucleus punched, and the coma's hairs off its limb.
  const r=1.9*k;
  ctx.fillStyle=`rgba(${ink.base.paperRgb},${Math.min(1,alpha*2.4)})`;
  ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();
  ctx.fillStyle=`rgba(${ink.atmosphere.cometDot},${Math.min(1,alpha*2.2)})`;
  ctx.beginPath();ctx.arc(0,0,clamp(.55*k,.8,1.8),0,TAU);ctx.fill();
  ctx.strokeStyle=`rgba(${ink.atmosphere.cometHead},${alpha*.8})`;ctx.lineWidth=.4;
  ctx.beginPath();
  for(let h=0;h<11;h++){
    const a=Math.PI+(h/10-.5)*3.6,out=(.45+((h*5)%4)*.22)*k;
    ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a)*(r+out),Math.sin(a)*(r+out));
  }
  ctx.stroke();
  ctx.restore();
}
function drawAmbient(dt,aim){
  if(reducedMotion||world.state==='dead')return;
  const chapter=clamp(Math.floor(world.progress/8),0,3);
  const busy=chapterReveal.age<4.2||Math.abs(regionBlend-chapter)>.08||world.darknessGrace>3||world.floorY-world.player.y<155||world.state==='playing'&&world.elapsed-world.lastCaptureAt<.65;
  if(world.state!=='paused'){
    if(ambience.event)ambience.event.age+=dt;
    else if(!busy){
      ambience.wait-=dt;
      if(ambience.wait<=0){
        ambience.event=makeAmbientEvent(chapter);
        if(ambience.event)ambience.sequence++;else ambience.wait=4;
      }
    }
  }
  const e=ambience.event;if(!e)return;
  if(e.age>=e.life){ambience.event=null;ambience.wait=19+ambience.random()*11;return;}
  const progress=e.age/e.life,point=ambientPoint(e,progress),tail=ambientPoint(e,Math.max(0,progress-.23));
  const clear=busy||e.chapter!==chapter?0:ambientClearance(point,tail,aim);
  if(world.state!=='paused')e.visibility=lerp(e.visibility,clear,1-Math.exp(-dt*7));
  const envelope=Math.pow(Math.sin(progress*Math.PI),1.8),alpha=envelope*e.visibility*(e.kind==='comet'?.28:.32);
  if(alpha<.003)return;
  ctx.save();ctx.lineCap='round';
  if(e.kind==='comet'){
    drawAmbientComet(point,tail,alpha,e.age);
  }else{
    const reach=1.7+envelope*1.5,rgb=e.chapter===3?ink.atmosphere.glintBlue:ink.atmosphere.glintWarm;
    line(point.x-reach,point.y,point.x+reach,point.y,`rgba(${rgb},${alpha*.65})`,.5);
    line(point.x,point.y-reach*1.25,point.x,point.y+reach*1.25,`rgba(${rgb},${alpha*.65})`,.5);
    ctx.fillStyle=`rgba(${rgb},${alpha})`;ctx.fillRect(point.x-.6,point.y-.6,1.2,1.2);
  }
  ctx.restore();
}
// The plate title's own measure, taken once per plate, chapter and viewport: the width of the longer of
// the two lines it sets, which is the rule's reach and the ground the rest of the sheet's lettering keeps
// off. Both used to be struck at a fixed reach — 325 points across on the reference sheet, twice the width
// of the widest name the atlas sets — so a short name reserved a stretch of plate it never came near. The
// rule under the name is cut to the title now rather than to the sheet, and the whole assembly is only
// ever as wide as the words in it.
// The owner the current turn's title declares its ground under while it is still finding its line.
const REVEAL_PENDING={pending:'title'};
const REVEAL_TRACK=2,REVEAL_NAME_TRACK=1,REVEAL_HALF=34,REVEAL_TITLE_CAP=3,REVEAL_CARTOUCHE_H=78;
let revealMeasure=null;
// Every chapter title still standing on the sheet, oldest first. Each is struck once — same moment,
// same line choice, as revealAnchor below always chose — and the strike converts that line into a fixed
// world y (drawChapterReveal), so from then on it is carried exactly as any other mark set at a world
// point is: sy() of that y, every frame, until the paper takes it under the foot. Capped rather than
// unbounded because a run flown at real pace turns a chapter before the last one's title has scrolled
// clear of the foot, so more than one is legitimately on the page at once — but never the whole run's
// history at once.
let revealTitles=[];
// The index of the newest turn actually struck, kept apart from revealTitles itself because that list
// only holds what is still standing: a title carried under the foot is pruned from it same as any other
// ink that has left the sheet, but its turn must not read as unstruck again just because nothing of it is
// left to look at — struck once is once, whether or not a trace of it remains on the page.
let revealStruckIndex=-1;
function clearRevealTitles(){revealTitles.length=0;revealStruckIndex=-1;}
function revealMetrics(){
  const compact=H<540&&W>H,key=plateName+'|'+chapterReveal.index+'|'+Math.round(W)+'x'+Math.round(H)+(compact?'c':'');
  if(revealMeasure&&revealMeasure.key===key)return revealMeasure;
  const plate='TABULA '+numerals[chapterReveal.index],name=chapters[chapterReveal.index];
  // Still the largest lettering on the sheet, as a plate's own title should be, but no longer a headline:
  // at the old size it stood half again above everything else printed on the plate, read as a poster laid
  // over the chart rather than as the plate's own title, and dragged the ground it asked for up with it.
  const size=compact?22:Math.min(32,Math.max(22,W*.055));
  ctx.save();
  ctx.font=plateFace(size);ctx.letterSpacing=REVEAL_NAME_TRACK+'px';const nameW=ctx.measureText(name).width;
  ctx.font=plateFace(12,'sc');ctx.letterSpacing=REVEAL_TRACK+'px';const plateW=ctx.measureText(plate).width;
  ctx.letterSpacing='0px';ctx.restore();
  const reach=Math.min(Math.max(nameW,plateW)*.5+9,W*.42);
  revealMeasure={key,size,plate,name,reach,half:Math.min(reach+13,Math.max(70,W*.5-frameBand()*.92-6))};
  return revealMeasure;
}
// The band the newest chapter title occupies while it is on the page, or null when none stands there.
// This is a claim on the sheet, not a reserve painted on it: the chart prints straight over the title and
// is meant to, the way it prints over the graticule, but two pieces of lettering on one line are two things
// to read in the same place, so everything else the plate letters keeps off this box — which it does by
// reading it out of the register (ground.js) rather than by asking here. The claim stands for as long as
// the newest title stands on the sheet, from the turn that struck it to the moment the paper carries it
// under the foot — an older title still on its way out declares its own box straight to the register
// (drawChapterReveal), rather than through this, since this is only ever asked about the newest.
function revealBand(){
  if(world.state==='ready'||world.state==='dead'||plainPlate())return null;
  if(H<540&&W>H)return null;
  const struck=revealCurrent();
  // The current turn was struck and has already left the sheet: there is nothing standing for it any more,
  // and — unlike a title still finding its line — nothing left here to search for either.
  if(!struck&&revealStruckIndex===chapterReveal.index)return null;
  const p=revealPoint(),m=struck||revealMetrics();
  return {top:p.y-REVEAL_HALF,bottom:p.y+REVEAL_HALF,left:p.x-m.half,right:p.x+m.half};
}
// One line of the title, cut into the sheet rather than written onto it. A copper plate meets damp paper
// under a ton of pressure: the ink is driven into the stock and the stock is driven down with it, so every
// stroke sits in a shallow valley with a shaded wall on the side the light comes from and a lit one
// opposite. That is all this is — the same line set three times, the press's shadow a fraction up and
// left, the sheet's own light a fraction down and right, and the ink itself between them. The impression
// arrives with the ink and not before it: while the pen is still cutting the letter there is nothing to
// have pressed yet, so it comes up over the half second after the writing is done.
function engraveLettering(text,x,y,size,face,age,track,inkStyle){
  const press=reducedMotion?1:clamp((age-letteringTime(text))/.5,0,1),base=ctx.globalAlpha;
  if(press>0){
    // Paper takes the whole impression: cream stock holds a lit edge as plainly as a shaded one. The night
    // plate's stock is darker than the ink is light, so a lit edge in its own ground would be no edge at
    // all — there the press leaves the shadow alone, which is what lifts ivory lettering out of a dark sheet.
    const shade=onPaper()?.26:.34,lift=onPaper()?.62:0,d=Math.max(.7,size*.045);
    ctx.fillStyle=`rgb(${ink.base.inkSoft})`;ctx.globalAlpha=base*press*shade;ctx.fillText(text,x-d,y-d);
    if(lift){ctx.fillStyle=`rgb(${ink.base.paperRgb})`;ctx.globalAlpha=base*press*lift;ctx.fillText(text,x+d,y+d*1.15);}
    ctx.globalAlpha=base;
  }
  ctx.fillStyle=inkStyle;
  if(!penLettering(text,x,y,size,face,age,'center',track))ctx.fillText(text,x,y);
}
// Whether the chart the reader is actually about to fly through exists yet. The opening's three-way
// difficulty choice fills world.nodes with nothing but its own three targets; capturing one clears
// difficultyPending, but the real rows past it are only laid down by ensureAhead() later in that same
// tick — and the capture's own "PRESSURE SET" announcement is inscribed in between the two, asking
// revealBand() for the reveal's line before that chart exists. difficultyPending alone is already false
// by then, so it is not what this checks: a node past the picker (row>0, not itself a difficultyChoice)
// is the actual chart, and its absence is what the reveal has to wait out.
function chartOpen(){return world.nodes.some(n=>!n.difficultyChoice&&n.row>0);}
// Where the chapter lettering is set: the line under the HUD band, or one of the lower lines when the chart
// or the plate's own lettering already sits across it as the sheet turns. The choice is made once, when the
// reveal begins — but "begins" waits for chartOpen(), so it reads the ground the reader is actually about to
// fly through rather than the three offered targets alone. Struck, the choice is not re-made: this function
// never searches a second time for the same turn, whatever comes to stand across its line afterward. What
// becomes of that struck line is no longer this function's business — it hands the line to strikeReveal,
// below, which turns it into the world anchor the title actually rides on from here.
// This one choice is the whole of the title's defence against the chart, since nothing is cleared for it.
// Against the plate's own lettering it has a second: everything else the plate letters asks the register
// (ground.js) what ground is taken, and the title's band is in it. So this weighs both — what is drawn on
// the sheet, which can only be dodged now, and what is lettered on it, which will dodge back.
function revealAnchor(){
  if(chapterReveal.y!==undefined)return clamp(chapterReveal.y,hudBand()+40,Math.max(hudBand()+40,H-footerBand()-REVEAL_HALF-6));
  if(!world.nodes)return Math.min(H*.3,hudBand()+46);
  const base=Math.min(H*.3,hudBand()+46),m=revealMetrics(),reach=m.half,limit=H*.62;
  let bestY=base,bestCost=Infinity;
  for(const y of [base,base+60,base+120,base+180,base+240]){
    if(y!==base&&y+40>limit)break;
    // The first line under the HUD band is the title's proper home; a lower one is a concession to
    // whatever is standing across it, so it has to be clearly better to be taken rather than merely
    // a shade quieter.
    let cost=y===base?0:6;
    const cover=(px,py,r)=>{const dx=Math.max(0,Math.abs(px-W*.5)-reach),dy=Math.max(0,Math.abs(py-y)-REVEAL_HALF-4);return Math.max(0,r-Math.hypot(dx,dy));};
    for(const n of world.nodes)cost+=cover(sx(n.x),sy(n.y),(n.cap||n.r)*scale+6);
    for(const h of world.hazards)cost+=cover(sx(h.x),sy(h.y),h.r*scale+10);
    // A live constellation's name is lettered round its entry star's rim, well past the star's own
    // radius: keep the chapter lettering off that ring too, not just off the planet itself.
    for(const c of world.constellations)if(!c.expired&&c.entry)cost+=cover(sx(c.entry.x),sy(c.entry.y),c.entry.r*scale+40*scale);
    // Whatever the plate has already lettered keeps its ground. Type that is cut and left — a note, a
    // tally, the running head — is weighed far above the six points a lower line costs, since a title
    // struck across a standing note is the one thing the register exists to prevent and the note, being
    // ink, cannot step aside afterward; type only passing through — a caption, the gloss, the impressum —
    // is worth stepping around at the same modest rate a planet's edge is.
    const band={left:W*.5-reach,right:W*.5+reach,top:y-REVEAL_HALF,bottom:y+REVEAL_HALF};
    // The title excuses only its own ground — the line it is still trying out — and never an earlier
    // chapter's title still standing on the sheet: excusing the whole kind let a new chapter's name be
    // set straight over the last one's as the page turned.
    // The notes themselves are read from the live list rather than the register: the landing that opens
    // the chart is the same one that writes its note, and the title settles its line in that frame, before
    // the note has declared any ground — so the register alone let the two choose the same line at once.
    const excused=[REVEAL_PENDING,'note'];
    cost+=groundFixed(band,excused,3)*8+(groundTaken(band,excused,3)-groundFixed(band,excused,3))*.4;
    for(const q of inscriptions){const b=inscriptionBox(q);cost+=groundSpan(band.left-3,band.right+3,b.left,b.right)*groundSpan(band.top-3,band.bottom+3,b.top,b.bottom)/100*8;}
    if(cost<bestCost-.5){bestCost=cost;bestY=y;}
    if(cost===0)break;
  }
  if(chartOpen())chapterReveal.y=bestY;
  return bestY;
}
// The current turn's own struck title, while it still stands: the newest entry in revealTitles, if its
// index still matches chapterReveal's. Null both before the strike (revealAnchor is still finding the
// line) and after the title has scrolled clear off the sheet — telling those two apart is revealStruckIndex's
// job, not this one. An older entry, left over from a chapter already behind us, is never what "the" title
// means to revealPoint or revealBand: only the newest is, and this is how they tell it apart from the rest.
function revealCurrent(){
  const newest=revealTitles[revealTitles.length-1];
  return newest&&newest.index===chapterReveal.index?newest:null;
}
// The title is ink on the scroll, not a fixture of the frame, and moves exactly as everything else set on
// the chart moves: once struck, its line is read into a world y a single time (strikeReveal, below) and
// every frame after draws it at sy() of that y — the rule an orbit or an inscription is drawn by — so it
// rides down under the traveller's ascent and leaves the sheet under the foot exactly as they do. Before
// it is struck, this reports the live candidate line revealAnchor is searching (or the compact layout's
// fixed one). Two earlier treatments animated the title in screen space instead — held at the foot of
// the play channel it parked across the live chart, let go it drifted — and both were guesses at a motion
// the camera already knows; sy() of a world anchor is that motion read off the camera itself.
function revealPoint(){
  const compact=H<540&&W>H,inner=frameBand()*.92+8,struck=revealCurrent(),m=struck||revealMetrics();
  const x=clamp(compact?W*.2:W*.5,Math.min(W*.5,inner+m.reach),Math.max(W*.5,W-inner-m.reach));
  const y=struck?sy(struck.anchorY):clamp(compact?H*.44:revealAnchor(),hudBand()+40,Math.max(hudBand()+40,H-footerBand()-REVEAL_HALF-6));
  return {x,y,compact};
}
// The moment the current turn's line is settled — chartOpen() true, and this index not struck already —
// it is read once into a world y, the same way drawImpressum reads a screen line back into one for its own
// world-anchored block (impressumAnchor, src/frame.js): cameraY and plateShift undone out of sy(). From
// here the title is exactly what any other mark set at a world y is, and this function has nothing further
// to do with it — including, once revealStruckIndex records the strike, ever doing it again for this turn,
// however long after the title itself has scrolled off the sheet. Everything about the choice of line
// itself is untouched — the same cost search above, the same compact-layout exception, the same one-time
// freeze of chapterReveal.y that revealAnchor keeps for its own sake — only what the chosen line becomes.
function strikeReveal(){
  if(revealStruckIndex===chapterReveal.index||!world.nodes||!chartOpen())return;
  const compact=H<540&&W>H,m=revealMetrics(),y=compact?H*.44:revealAnchor();
  revealTitles.push({index:chapterReveal.index,anchorY:world.cameraY+(y-plateShift.y)/scale,plate:m.plate,name:m.name,size:m.size,reach:m.reach,half:m.half,age:chapterReveal.age});
  if(revealTitles.length>REVEAL_TITLE_CAP)revealTitles.shift();
  revealStruckIndex=chapterReveal.index;
}
// A struck title leaves the sheet the way an inscription does (drawInscriptions, src/inscriptions.js, is
// the precedent this mirrors): carried under the plate's own furniture and struck from the list once the
// paper has carried it wholly clear, never faded and never rewritten in place. Checked once here, ahead of
// the draw below, so a title that has left is simply absent from every solver asking about it this frame.
function pruneRevealTitles(){
  for(let i=revealTitles.length-1;i>=0;i--)if(sy(revealTitles[i].anchorY)-REVEAL_HALF>H-footerBand())revealTitles.splice(i,1);
}
// One title's letters, its rule and its diamond, at whatever screen point and whatever age it is standing
// at now — the age an older entry in the list is still carrying forward from the turn that struck it, or
// chapterReveal.age itself for the current turn's own line before strikeReveal has cut it in. Factored out
// of drawChapterReveal because more than one of these can legitimately be true on the sheet at once.
function drawRevealTitle(x,y,m,age){
  const t=age,alpha=clamp(t/.55,0,1);
  ctx.save();ctx.globalAlpha=alpha;ctx.textAlign='center';
  // The plate line and the chapter name are written in the true order of the pen: each letter's outline is
  // stroked on from the Fell faces themselves and its counters then flood with ink. Once the writing is
  // done — and always under reduced motion — the ordinary lettering below is the finished state.
  // Spelled out rather than abbreviated: this is the largest lettering on the sheet, so it names the
  // plate itself in full — TABULA, matching what the impressum's own TAB. row abbreviates — while the
  // running head six inches below it (frame.js) names the region instead, REGIO, so the two no longer
  // collide on one abbreviation for two different things. The tracking on both lines is real letterspacing,
  // not literal space characters typed in between the letters — those timed and drew as glyphs of their
  // own under penLettering, which is why the plain strings carry no gaps and the same tracking value is
  // handed to both the pen and the settled ctx.letterSpacing. The name is set a little wider than it was
  // cut, which is how a title reads as engraved lettering rather than as a line of running text blown up.
  const plate=m.plate,name=m.name,size=m.size;
  ctx.font=plateFace(12,'sc');ctx.letterSpacing=REVEAL_TRACK+'px';
  // On paper the plate line is the rubricated line of the title, and its rule and lozenge are red with it.
  const rubric=rubricInk(),ruleInk=rubric||ink.dark.chapterRule;
  engraveLettering(plate,x,y-22,12,'sc',t,REVEAL_TRACK,rubric?`rgb(${rubric})`:ink.dark.chapterLabel);
  ctx.font=plateFace(size);ctx.letterSpacing=REVEAL_NAME_TRACK+'px';
  engraveLettering(name,x,y+12,size,'text',t,REVEAL_NAME_TRACK,ink.base.text);
  ctx.letterSpacing='0px';
  const reach=m.reach,ruled=reducedMotion?1:clamp((t-letteringTime(name)*.75)/.42,0,1);
  if(ruled>=1){
    line(x-reach,y+27,x-9,y+27,`rgba(${ruleInk},.42)`,.6);line(x+9,y+27,x+reach,y+27,`rgba(${ruleInk},.42)`,.6);
  }else penRule(x,y+27,reach-9,`rgba(${ruleInk},.42)`,.6,ruled);
  ctx.globalAlpha=alpha*(ruled>=1?1:ruled);
  // The title is set in a strapwork cartouche (src/press.js), struck with the rule once the name is cut:
  // its scrolls stand clear of the rule's ends, and it never reaches past the frame's own inner margin.
  {const out=pressCartoucheInset(W,REVEAL_CARTOUCHE_H),half=Math.min(reach+8+out.x,Math.max(reach+out.x,Math.min(x,W-x)-frameBand()*.92-4));
    drawPressCartouche(x-half,y-40,half*2,REVEAL_CARTOUCHE_H,ink.dark.chapterRule,.5,.7,70291);}
  ctx.strokeStyle=`rgba(${rubric||ink.dark.chapterDiamond},.7)`;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(x,y+24);ctx.lineTo(x+3,y+27);ctx.lineTo(x,y+30);ctx.lineTo(x-3,y+27);ctx.closePath();ctx.stroke();ctx.restore();
}
function drawChapterReveal(dt){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('chapterReveal');if(own)return own(dt);
  if(world.state==='ready'||world.state==='dead'||plainPlate())return;
  if(world.state!=='paused'){chapterReveal.age+=dt;for(const rt of revealTitles)rt.age+=dt;}
  strikeReveal();pruneRevealTitles();
  const compact=H<540&&W>H,inner=frameBand()*.92+8,rule=frameBand()*.92,struck=revealCurrent();
  // Nothing is cleared for it and nothing is laid under it: it is struck early in the chart's own paint
  // order — with the graticule, before a single orbit or body — so everything drawn after prints over it
  // exactly as it prints over the graticule, and the sheet's own grain goes over all of it last. Whatever
  // the atlas tried instead — a torn scrap of clean stock, a soft leaf of ground, a ruled band of the
  // running head's own kind — was a card laid on the sheet, and read as one however it was cut. The answer
  // to a planet standing across the name was never a card: it is the line the name was set on (revealAnchor,
  // chosen once) and, now, ink like the chart's own — carried down with it rather than left floating over it.
  // Clipped to the same rect drawInscriptions uses: the inner rule on the sides and top, the footer band at
  // the foot. A title is a piece of that file's kind of ink now, and leaves the sheet the same way.
  ctx.save();ctx.beginPath();ctx.rect(rule,rule,Math.max(0,W-rule*2),Math.max(0,H-footerBand()-rule));ctx.clip();
  // Every struck title still standing draws and declares its own ground (ground.js), oldest first, so a
  // reader who has carried two chapters' names down the sheet at once — the next turn strikes its own
  // title whether or not the last one has left — sees both, and neither is a card laid over the other.
  for(const rt of revealTitles){
    const x=clamp(compact?W*.2:W*.5,Math.min(W*.5,inner+rt.reach),Math.max(W*.5,W-inner-rt.reach)),y=sy(rt.anchorY);
    if(!compact)markGroundBox('title',{left:x-rt.half,right:x+rt.half,top:y-REVEAL_HALF,bottom:y+REVEAL_HALF},rt);
    drawRevealTitle(x,y,rt,rt.age);
  }
  // The current turn's own title, still finding its line before chartOpen() lets strikeReveal cut it into
  // the list above: drawn live here in the meantime, on the same ground the list entries claim, so it
  // never reads as unclaimed merely because the chart is not open yet. Gated on revealStruckIndex rather
  // than merely on `!struck`, since a turn already struck and carried clear off the sheet is not awaiting
  // a line any more — it is finished, not unclaimed, and must not be drawn a second time from scratch.
  if(!struck&&revealStruckIndex!==chapterReveal.index){
    const place=revealPoint(),m=revealMetrics();
    if(!compact)markGroundBox('title',{left:place.x-m.half,right:place.x+m.half,top:place.y-REVEAL_HALF,bottom:place.y+REVEAL_HALF},REVEAL_PENDING);
    drawRevealTitle(place.x,place.y,m,chapterReveal.age);
  }
  ctx.restore();
}
// Region-level ambience: drifting dust plates, the region wash, the starfield and its atlas annotations.
// Night literals below are the original artwork's exact values; only the paper column is new.
definePlate('atmosphere',{
  night:{eclipseShadow:'3,6,12',starBright:'218,205,176',starGlyph:'220,204,164',annotation:'155,174,171',
    cometTrail:'187,195,177',cometHead:'222,211,179',cometDot:'224,216,190',glintBlue:'187,204,213',glintWarm:'222,204,159',
    sheetEdgeShade:'2,5,10'},
  paper:{eclipseShadow:PLATES.paper.base.inkSoft,starBright:PLATES.paper.base.inkStrong,starGlyph:PLATES.paper.base.inkStrong,annotation:PLATES.paper.base.inkSoft,
    cometTrail:PLATES.paper.base.inkSoft,cometHead:PLATES.paper.base.ink,cometDot:PLATES.paper.base.inkStrong,glintBlue:'52,84,120',glintWarm:'150,100,32',
    sheetEdgeShade:'58,42,28'}
});
function regionPlate(index,near){
  const key=plateName+':'+index+':'+near+(onPaper()?'p':'');if(regionPlates.has(key))return regionPlates.get(key);
  const region=atlasRegions[index],rc=regionInk(region),paper=onPaper(),c=makeCanvas(384,768),g=c.getContext('2d'),rng=seeded(region.seed+(near?1701:0));
  const w=c.width,h=c.height,phase=[0,.9,2.4,-.7][index];
  const center=v=>w*([.38,.48,.66,.32][index]+[.14,.25,.21,.1][index]*Math.sin(v*TAU+phase));
  if(!near){
    const count=index===3?5:10;
    for(let i=0;i<count;i++){
      const v=(i+.5)/count,x=center(v),y=v*h,rx=w*([.3,.34,.22,.18][index]+rng()*.1),ry=50+rng()*80;
      // Wrapped washes let the engraved dust field scroll without a seam.
      for(const wrap of [-h,0,h]){
        g.save();g.translate(x,y+wrap);g.rotate(index===1?-.5:index===2?.4:.16);g.scale(rx,ry);
        const haze=g.createRadialGradient(0,0,0,0,0,1);
        haze.addColorStop(0,`rgba(${rc.pigment},${(index===3?.065:.12)*(paper?.55:1)})`);haze.addColorStop(.45,`rgba(${rc.pigment},${paper?.02:.035})`);haze.addColorStop(1,`rgba(${rc.pigment},0)`);
        g.fillStyle=haze;g.fillRect(-1,-1,2,2);g.restore();
      }
    }
  }
  // The dust is thinned by a third: the plates are the quietest thing on the sheet and were reading loud.
  const marks=near?[650,1100,620,290][index]:[2150,3500,1950,910][index];
  for(let i=0;i<marks;i++){
    const v=rng(),scatter=(rng()+rng()+rng()-1.5),spread=near?.3:[.44,.5,.27,.26][index];
    const x=center(v)+scatter*w*spread,y=v*h;
    const edge=clamp(1-Math.abs(scatter)/1.4,0,1);
    const a=((near?.045:.025)+rng()*(near?.19:.1)*edge)*(paper?.6:1);
    g.fillStyle=`rgba(${rc.pigment},${a})`;g.fillRect(x,y,near?.6+rng()*.6:.45,.55);
  }
  if(index===2&&!near){
    // A broad dust shadow distinguishes the eclipse region from a colour wash; on paper it is a dilute
    // sepia pool, never a dark fill.
    for(let i=0;i<6;i++){
      const y=(i+.5)*h/6;
      for(const wrap of [-h,0,h]){
        g.save();g.translate(center(y/h)-35,y+wrap);g.rotate(.38);g.scale(62,125);
        const shadow=g.createRadialGradient(0,0,0,0,0,1);shadow.addColorStop(0,`rgba(${ink.atmosphere.eclipseShadow},${paper?.09:.22})`);shadow.addColorStop(1,`rgba(${ink.atmosphere.eclipseShadow},0)`);g.fillStyle=shadow;g.fillRect(-1,-1,2,2);g.restore();
      }
    }
  }
  regionPlates.set(key,c);return c;
}
// One copy of a wrapped, scrolling backdrop tile, blitted with only the slice of it that lands on the
// sheet. The two copies a wrap needs stand 1.7-1.9 screens tall each, so drawing them whole asked the
// canvas to blend better than six screens of texture per plate that were never going to be seen; the
// source rectangle here costs exactly the screen the plate actually covers. A couple of destination
// pixels of overhang either side keep the resampler's edge clamping off the visible seam, so the
// sliced blit is the same picture as the whole one.
function blitVisible(image,dx,dy,dw,dh,overhang){
  if(!(dw>0&&dh>0)||!image||!(image.width>0)||!(image.height>0))return;
  const x0=Math.max(-overhang,dx),x1=Math.min(W+overhang,dx+dw);
  const y0=Math.max(-overhang,dy),y1=Math.min(H+overhang,dy+dh);
  if(!(x1>x0)||!(y1>y0))return;
  const kx=image.width/dw,ky=image.height/dh;
  const sx0=(x0-dx)*kx,sy0=(y0-dy)*ky,sw=(x1-x0)*kx,sh=(y1-y0)*ky;
  if(!(sw>0)||!(sh>0))return;
  ctx.drawImage(image,sx0,sy0,sw,sh,x0,y0,x1-x0,y1-y0);
}
function drawRegion(index,weight){
  if(weight<.001)return;
  const region=atlasRegions[index],rc=regionInk(region),time=reducedMotion?0:world.time,paper=onPaper();
  ctx.save();ctx.globalAlpha=weight;
  ctx.fillStyle=`rgba(${rc.wash},${paper?.042:.25})`;ctx.fillRect(0,0,W,H);
  for(const near of [false,true]){
    const plate=regionPlate(index,near),height=H*(near?1.7:1.9);
    const travel=reducedMotion?0:world.cameraY*scale*(near?.17:.055)+time*(near?1.1:.35);
    const offset=((travel%height)+height)%height;
    const overhang=Math.max(2,Math.ceil(height/plate.height)*2);
    ctx.globalAlpha=weight*(paper?(near?.17:.27):(near?.4:.62));
    blitVisible(plate,0,-offset,W,height,overhang);blitVisible(plate,0,height-offset,W,height,overhang);
  }
  ctx.restore();
}
// ---------- The page turn: one chapter's sheet laid over the last ----------
// Each plate is pulled with its own slight misregistration, a pixel or two off true. The chart's ink
// carries the offset of whichever sheet is on the press; the rising darkness does not, since spilled
// ink is not part of the printed plate.
const PLATE_REGISTRATION=[0,1,2,3].map(i=>{const rng=seeded(9241+i*3607);return {x:(rng()*2-1)*1.7,y:(rng()*2-1)*1.6};});
function plateRegistration(){
  const first=clamp(Math.floor(regionBlend),0,3),second=Math.min(3,first+1),mix=clamp(regionBlend-first,0,1);
  const a=PLATE_REGISTRATION[first],b=PLATE_REGISTRATION[second];
  return {x:lerp(a.x,b.x,mix)*scale,y:lerp(a.y,b.y,mix)*scale};
}
// How far the fresh sheet has travelled: 0 as it lies below the frame, 1 once it is squarely on the
// press. It lands a little before the cross-fade finishes, so the old plate fades away underneath it.
function pageTurn(mix){const u=clamp(mix/.86,0,1);return u*u*(3-2*u);}
// The leading edge of the arriving sheet: its shadow, its cut edge, and its own plate-mark.
function drawSheetEdge(y,strength,curl=0){
  if(y<=0||y>=H||strength<=.002)return;
  const colors=ink.frame,band=frameBand(),lift=Math.max(6,14*scale);
  const shade=ctx.createLinearGradient(0,y-lift,0,y);
  shade.addColorStop(0,`rgba(${ink.base.paperRgb},0)`);shade.addColorStop(1,`rgba(${ink.atmosphere.sheetEdgeShade},${.3*strength})`);
  ctx.fillStyle=shade;ctx.fillRect(0,y-lift,W,lift);
  // The edge and its plate mark stop where the corner is turned back: past the fold there is no sheet.
  line(0,y,W-curl,y,`rgba(${ink.base.inkStrong},${onPaper()?.62:.46})`,Math.max(.7,scale*.9));
  const inset=band*.2;
  ctx.save();ctx.globalAlpha=strength;ctx.strokeStyle=colors.markEdge;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(inset+.5,H);ctx.lineTo(inset+.5,y+inset+.5);
  if(curl>inset){ctx.lineTo(W-curl-inset,y+inset+.5);ctx.moveTo(W-inset-.5,y+curl+inset);}else ctx.lineTo(W-inset-.5,y+inset+.5);
  ctx.lineTo(W-inset-.5,H);ctx.stroke();
  ctx.restore();
}
function grainSheet(){
  if(!grain||!W||!H)return null;
  const key=plateName+':'+W+'x'+H+':'+DPR;
  if(grainSheetCanvas&&grainSheetKey===key&&grainSheetSource===grain)return grainSheetCanvas;
  const c=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(H*DPR))),g=c.getContext('2d');
  if(!g||!g.createPattern)return null;
  // Painted through the same DPR transform the pattern fill used, so the tile lands at the same size
  // and phase it always did.
  g.setTransform(DPR,0,0,DPR,0,0);
  const pattern=g.createPattern(grain,'repeat');if(!pattern)return null;
  g.fillStyle=pattern;g.fillRect(0,0,W,H);
  grainSheetCanvas=c;grainSheetKey=key;grainSheetSource=grain;return c;
}
function drawAtmosphere(dt=0,aim=null){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('atmosphere');if(own)return own(dt,aim);
  ctx.drawImage(backdrop,0,0,W,H);
  // The sheet ages as the run goes on (drawFoxing, src/press.js), laid on the stock under everything printed.
  drawFoxing();
  const chapter=clamp(Math.floor(world.progress/8),0,3);
  if(world.state!=='paused')regionBlend=lerp(regionBlend,chapter,1-Math.exp(-dt*.8));
  if(Math.abs(chapter-regionBlend)<.001)regionBlend=chapter;
  plateShift=plateRegistration();
  const first=Math.floor(regionBlend),second=Math.min(3,first+1),mix=regionBlend-first;
  // The distance is a selection (see `scenery` in COSMETIC_KINDS, src/ledger.js), and a bare sheet is
  // the one a fresh atlas ships with: the chapter print, the wash it is knocked back with down the
  // play channel, and both drifting dust plates are the layers the ascent carries more slowly than the
  // chart, and they stand or fall together. The page turn is not one of them — the chapter still
  // changes on a bare sheet — so the fresh sheet still rises whatever is or is not printed on it.
  const distance=sceneryOn();
  // The next chapter's plate is baked a stage a frame over the last rows before its turn (celestialJob).
  if(distance&&world.state==='playing'&&world.progress%8>5.5)prewarmCelestial(chapter+1,sceneryStyle());
  if(mix>0&&!reducedMotion){
    // The new chapter arrives as a fresh sheet drawn up from below the frame, its dust and its own
    // marginalia riding with it; the old plate stays where it lies and fades away underneath.
    const turn=pageTurn(mix),slide=(1-turn)*H;
    if(distance){drawCelestialScene(first,1-turn*.9);drawRegion(first,1-turn);}
    // Its leading corner is turned back as it rises (pageCurlSize, src/press.js), and cut from its clip.
    const curl=pageCurlSize(turn);
    ctx.save();pageTurnClip(slide,curl);ctx.clip();
    ctx.globalAlpha=(1-turn)*.7;ctx.fillStyle=ink.base.paper;ctx.fillRect(0,slide,W,Math.max(0,H-slide));ctx.globalAlpha=1;
    if(distance){drawCelestialScene(second,1);drawRegion(second,1);}
    ctx.restore();
    drawSheetEdge(slide,1-turn,curl);drawPageCurl(slide,curl);
  }else if(distance){
    drawCelestialScene(first,1);if(mix>0)drawCelestialScene(second,mix);
    drawRegion(first,1-mix);if(mix>0)drawRegion(second,mix);
  }
  const regionA=regionInk(atlasRegions[first]),regionB=regionInk(atlasRegions[second]),paper=onPaper();
  const starColor=regionA.star.map((v,i)=>Math.round(lerp(v,regionB.star[i],mix))).join(',');
  const density=lerp(atlasRegions[first].density,atlasRegions[second].density,mix),cy=world.cameraY;
  // Inside the play channel the field is set at half the number of stars and a little over half the
  // contrast, so a glyph on the chart is never mistaken for one behind it; the margins keep the full field.
  const channel=playChannel(),middle=W*.5;
  for(let i=0;i<stars.length;i++){
    const s=stars[i],visibility=clamp((density-((i*.61803398875)%1))/.09,0,1);if(visibility===0)continue;
    const y=((s.y*H-cy*s.depth*scale)%(H+12)+(H+12))%(H+12)-6,x=s.x*W;
    const inside=Math.abs(x-middle)<channel;
    if(inside&&(i&1))continue;
    const alpha=visibility*(.2+s.bright*.42)*(reducedMotion?1:.86+.14*Math.sin(world.time*.58+s.phase))*(inside?.55:1);
    starGlyph(ctx,x,y,s.mag,s.mag>=4?ink.atmosphere.starGlyph:s.bright>.86?ink.atmosphere.starBright:starColor,alpha,s.size);
  }
  drawAmbient(dt,aim);
  // Quiet atlas annotations stay outside the central play path on wide screens.
  if(W>780&&!plainPlate()){
    ctx.font=plateFace(10);ctx.fillStyle=`rgba(${ink.atmosphere.annotation},.23)`;ctx.textAlign='left';
    // The atlas's own word for the climb (marks.js's RIM_CAPTIONS already sets it), and a plain unpadded
    // figure under it — no 1603 hand set a Leibniz delta or a zero-padded counter.
    // Both glosses are set on one line across the sheet. IMPETVS's own value line used to stand nearly a
    // quarter of a plate lower, which is the ground the MAGNITUDINES key now stands on above the scale
    // bar (see buildFrameLayer's wide flank in frame.js); on a short wide window the two headings ran
    // into each other's underline. A marginal note answering another marginal note straight across the
    // play channel is also what a printed sheet does with a pair of glosses.
    const glossY=H*.45;
    ctx.fillText('ASCENSUS',W*.115,glossY);ctx.fillText(String(Math.floor(world.progress)),W*.115,glossY+17);
    line(W*.115,glossY-15,W*.115+45,glossY-15,`rgba(${ink.atmosphere.annotation},.2)`);
    // The period term for the run's own speed factor, not the modern loanword the caption used to
    // carry — and, unlike ASCENSUS's neighbour, actually given the figure the finding asked for.
    ctx.textAlign='right';ctx.fillText('IMPETVS',W*.88,glossY);
    const impetus=world.speedMultiplier();
    ctx.fillText('×'+(impetus%1?impetus.toFixed(1):impetus),W*.88,glossY+17);
    line(W*.88-34,glossY+12,W*.88,glossY+12,`rgba(${ink.atmosphere.annotation},.16)`);
  }
  // grain itself is only rebuilt on resize (see resize()); the pattern built from it is just as
  // reusable, so it is memoized against the same canvas instead of re-wrapped every frame.
  const sheet=grainSheet();
  ctx.save();ctx.globalAlpha=.32;
  if(sheet)ctx.drawImage(sheet,0,0,W,H);
  else{if(grainPatternSource!==grain){grainPattern=ctx.createPattern(grain,'repeat');grainPatternSource=grain;}ctx.fillStyle=grainPattern;ctx.fillRect(0,0,W,H);}
  ctx.restore();
}
