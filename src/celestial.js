'use strict';
/* Orbit · src/celestial.js
   Chapter plates, ambient events, chapter reveal, region atmosphere. */
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
    paintPlanetSurface(g,r,family,palette,rng);paintPigment(g,r,rng);
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
    paintPlanetSurface(g,r,family,palette,rng);paintPigment(g,r,rng);
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
function celestialPlate(index){
  if(celestialPlates.has(index))return celestialPlates.get(index);
  const c=makeCanvas(720,1200),g=c.getContext('2d'),rng=seeded(98153+index*437),w=c.width,h=c.height;
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
  celestialPlates.set(index,c);return c;
}
function celestialPlacement(index){
  const fit=Math.max(W/720,H/1200)*1.07;
  const x=(W-720*fit)/2,y=(H-1200*fit)/2;
  const drift=reducedMotion?0:Math.sin(-world.cameraY*.0005+index*.9)*10*fit;
  return {x,y:y+drift,fit};
}
function drawCelestialScene(index,weight){
  if(weight<.001)return;
  const plate=celestialPlate(index),place=celestialPlacement(index);
  // On paper the plate sits back as a distant engraving beneath the gameplay marks, so it is blitted
  // at a reduced alpha; night is unaffected.
  ctx.save();ctx.globalAlpha=onPaper()?weight*.72:weight;ctx.drawImage(plate,place.x,place.y,plate.width*place.fit,plate.height*place.fit);ctx.restore();
  drawPlateCaptions(index,weight,place);
}
// The plate's caption block — its Latin title, the table numeral, the figure line and, on two of the plates,
// Galileo's own marginal figure above them — used to be baked into the print at its lower-left corner, where a
// narrow sheet cropped it against the frame. It is set live instead, at the print's own place on a wide sheet
// and drawn in to the foot of the margin on a narrow one, in the same whisper the print carries it at.
function drawPlateCaptions(index,weight,place){
  if(plainPlate()||weight<.001)return;
  const paper=onPaper(),fit=clamp(place.fit,.7,1.15),inner=frameBand()+9;
  const x=Math.max(inner,place.x+48*place.fit);
  const y=Math.min(place.y+1027*place.fit,H-footerBand()-frameBand()*.92-46*fit);
  ctx.save();ctx.globalAlpha=paper?weight*.72:weight;ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.font=`italic ${17*fit}px 'IM Fell English',Georgia,serif`;ctx.fillStyle=`rgba(${ink.plates.captionLatin},${paper?.62:.21})`;
  ctx.fillText(['Luna · Mare silentii','Saturnus · Annuli','Sol · Obscuratio','Nebula · Profundum'][index],x,y);
  ctx.font=`${12*fit}px 'IM Fell English',Georgia,serif`;ctx.fillStyle=`rgba(${ink.plates.captionTab},${paper?.5:.18})`;ctx.fillText('TAB. '+numerals[index],x,y+25*fit);
  ctx.font=`italic ${11*fit}px 'IM Fell English',Georgia,serif`;ctx.fillStyle=`rgba(${ink.plates.figCaption},${paper?.55:.15})`;
  ctx.fillText(['Fig. I · Luna, Galilaeo delin.','Fig. II · Saturnus, Galilaeo delin.','Fig. III · Sol maculosus, Galilaeo delin.','Fig. IV · Jupiter et satellites, Galilaeo delin.'][index],x,y+45*fit);
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
// The illustrated plate is left whole in the margins and washed back down the play channel, where the
// chart and the traveller have to read first: one pass of the sheet's own ground colour, at full strength
// across the channel and fading out over a 60-pixel feather either side, so the transition is graded
// rather than cut and nothing changes but the contrast under the chart.
const CHANNEL_FEATHER=60;
function drawChannelVeil(){
  const half=playChannel(),edge=half+CHANNEL_FEATHER,cx=W*.5,alpha=onPaper()?.3:.34;
  const veil=ctx.createLinearGradient(cx-edge,0,cx+edge,0),stop=CHANNEL_FEATHER/(edge*2);
  const ground=ink.base.paperRgb;
  veil.addColorStop(0,`rgba(${ground},0)`);
  veil.addColorStop(stop,`rgba(${ground},${alpha})`);
  veil.addColorStop(1-stop,`rgba(${ground},${alpha})`);
  veil.addColorStop(1,`rgba(${ground},0)`);
  ctx.save();ctx.fillStyle=veil;ctx.fillRect(Math.max(0,cx-edge),0,Math.min(W,edge*2),H);ctx.restore();
}
function ambientPoint(e,progress){
  if(e.kind==='comet')return {x:lerp(e.x,e.endX,progress)*W,y:lerp(e.y,e.endY,progress)*H};
  const place=celestialPlacement(e.chapter);
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
  const rng=ambience.random,kind=ambience.sequence%2===0?'comet':'glint';
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
    const stroke=ctx.createLinearGradient(tail.x,tail.y,point.x,point.y);
    stroke.addColorStop(0,`rgba(${ink.atmosphere.cometTrail},0)`);stroke.addColorStop(.72,`rgba(${ink.atmosphere.cometTrail},${alpha*.55})`);stroke.addColorStop(1,`rgba(${ink.atmosphere.cometHead},${alpha})`);
    ctx.strokeStyle=stroke;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(point.x,point.y);ctx.stroke();
    ctx.fillStyle=`rgba(${ink.atmosphere.cometDot},${alpha})`;ctx.beginPath();ctx.arc(point.x,point.y,.75,0,TAU);ctx.fill();
  }else{
    const reach=1.7+envelope*1.5,rgb=e.chapter===3?ink.atmosphere.glintBlue:ink.atmosphere.glintWarm;
    line(point.x-reach,point.y,point.x+reach,point.y,`rgba(${rgb},${alpha*.65})`,.5);
    line(point.x,point.y-reach*1.25,point.x,point.y+reach*1.25,`rgba(${rgb},${alpha*.65})`,.5);
    ctx.fillStyle=`rgba(${rgb},${alpha})`;ctx.fillRect(point.x-.6,point.y-.6,1.2,1.2);
  }
  ctx.restore();
}
// The band the chapter lettering occupies while it is on the page, or null when nothing is printed there.
function revealBand(){
  if(chapterReveal.age>=4.2||world.state==='ready'||world.state==='dead')return null;
  if(H<540&&W>H)return null;
  const y=revealPoint().y;return {top:y-36,bottom:y+36};
}
// Where the chapter lettering is set: the line under the HUD band, or one of two lower lines when a planet
// or a hazard already sits across it as the sheet turns. The choice is made once, when the reveal begins,
// so the lettering never jumps while the pen is still writing it.
function revealAnchor(){
  if(chapterReveal.y!==undefined)return chapterReveal.y;
  if(!world.nodes)return Math.min(H*.3,hudBand()+46);
  const base=Math.min(H*.3,hudBand()+46),reach=Math.min(95,W*.21)+30,limit=H*.62;
  let bestY=base,bestCost=Infinity;
  for(const y of [base,base+70,base+140]){
    if(y!==base&&y+40>limit)break;
    let cost=0;
    const cover=(px,py,r)=>{const dx=Math.max(0,Math.abs(px-W*.5)-reach),dy=Math.max(0,Math.abs(py-y)-38);return Math.max(0,r-Math.hypot(dx,dy));};
    for(const n of world.nodes)cost+=cover(sx(n.x),sy(n.y),(n.cap||n.r)*scale+6);
    for(const h of world.hazards)cost+=cover(sx(h.x),sy(h.y),h.r*scale+10);
    if(cost<bestCost-.5){bestCost=cost;bestY=y;}
    if(cost===0)break;
  }
  chapterReveal.y=bestY;return bestY;
}
// The name is written onto the sheet, not over it: the line chosen above is taken into world coordinates
// the first time it is asked for, and the chart carries the lettering from there, exactly as it carries an
// orbit. It is held back at the edge of the play channel rather than allowed to print into the margin, so
// a fast ascent slides it to the foot of the sheet and it fades there.
function revealPoint(){
  const compact=H<540&&W>H;
  if(chapterReveal.wx===undefined){
    const x=compact?W*.2:W*.5,y=compact?H*.44:revealAnchor();
    chapterReveal.wx=(x-W*.5-plateShift.x)/scale;
    chapterReveal.wy=(y-plateShift.y)/scale+world.cameraY;
  }
  const reach=Math.min(95,W*.21)+16,inner=frameBand()*.92+8;
  return {
    x:clamp(sx(chapterReveal.wx),Math.min(W*.5,inner+reach),Math.max(W*.5,W-inner-reach)),
    y:clamp(sy(chapterReveal.wy),hudBand()+40,H-footerBand()-34),
    compact
  };
}
function drawChapterReveal(dt){
  if(chapterReveal.age>=4.2||world.state==='ready'||world.state==='dead'||plainPlate())return;
  if(world.state!=='paused')chapterReveal.age+=dt;
  const t=chapterReveal.age,alpha=clamp(Math.min(t/.55,(4.2-t)/1.2),0,1);
  // The DOM HUD (brand, score, pace, flow) owns roughly the top 132 CSS px; the reveal is set in the play
  // channel underneath it, and rides the sheet from there.
  const place=revealPoint(),compact=place.compact,x=place.x,y=place.y,rise=reducedMotion?0:(1-Math.min(t,1))*5;
  ctx.save();ctx.globalAlpha=alpha;ctx.textAlign='center';
  {
    // The lettering is pulled on a small leaf of its own: one soft pass of the sheet's ground, feathered to
    // nothing, so the chapter name reads over whatever the chart has scrolled beneath it — the Eclipse's dark
    // disc included — without a hard edge anywhere on the page.
    const spread=Math.min(95,W*.21)+72;
    ctx.save();ctx.translate(x,y+4+rise);ctx.scale(spread,spread*.42);
    const leaf=ctx.createRadialGradient(0,0,0,0,0,1);
    leaf.addColorStop(0,`rgba(${ink.base.paperRgb},${onPaper()?.66:.56})`);leaf.addColorStop(.5,`rgba(${ink.base.paperRgb},${onPaper()?.5:.42})`);leaf.addColorStop(1,`rgba(${ink.base.paperRgb},0)`);
    ctx.fillStyle=leaf;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  ctx.shadowColor=ink.dark.chapterShadow;ctx.shadowBlur=12;
  // The plate line and the chapter name are written in the true order of the pen: each letter's outline is
  // stroked on from the Fell faces themselves and its counters then flood with ink. Once the writing is
  // done — and always under reduced motion — the ordinary lettering below is the finished state.
  const plate='P L A T E   '+numerals[chapterReveal.index],name=chapters[chapterReveal.index];
  const size=compact?24:Math.min(36,Math.max(24,W*.062));
  ctx.fillStyle=ink.dark.chapterLabel;ctx.font="12px 'IM Fell English SC','IM Fell English',Georgia,serif";
  if(!penLettering(plate,x,y-22+rise,12,'sc',t,'center'))ctx.fillText(plate,x,y-22+rise);
  ctx.fillStyle=ink.base.text;ctx.font=`${size}px 'IM Fell English',Georgia,serif`;
  if(!penLettering(name,x,y+12+rise,size,'text',t,'center'))ctx.fillText(name,x,y+12+rise);
  ctx.shadowBlur=0;
  const reach=Math.min(95,W*.21),ruled=reducedMotion?1:clamp((t-letteringTime(name)*.75)/.42,0,1);
  if(ruled>=1){
    line(x-reach,y+27+rise,x-9,y+27+rise,`rgba(${ink.dark.chapterRule},.42)`,.6);line(x+9,y+27+rise,x+reach,y+27+rise,`rgba(${ink.dark.chapterRule},.42)`,.6);
  }else penRule(x,y+27+rise,reach-9,`rgba(${ink.dark.chapterRule},.42)`,.6,ruled);
  ctx.globalAlpha=alpha*(ruled>=1?1:ruled);
  ctx.strokeStyle=`rgba(${ink.dark.chapterDiamond},.7)`;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(x,y+24+rise);ctx.lineTo(x+3,y+27+rise);ctx.lineTo(x,y+30+rise);ctx.lineTo(x-3,y+27+rise);ctx.closePath();ctx.stroke();ctx.restore();
}
// Region-level ambience: drifting dust plates, the region wash, the starfield and its atlas annotations.
// Night literals below are the original artwork's exact values; only the paper column is new.
definePlate('atmosphere',{
  night:{eclipseShadow:'3,6,12',starBright:'218,205,176',starGlyph:'220,204,164',annotation:'155,174,171',
    cometTrail:'187,195,177',cometHead:'222,211,179',cometDot:'224,216,190',glintBlue:'187,204,213',glintWarm:'222,204,159'},
  paper:{eclipseShadow:PLATES.paper.base.inkSoft,starBright:PLATES.paper.base.inkStrong,starGlyph:PLATES.paper.base.inkStrong,annotation:PLATES.paper.base.inkSoft,
    cometTrail:PLATES.paper.base.inkSoft,cometHead:PLATES.paper.base.ink,cometDot:PLATES.paper.base.inkStrong,glintBlue:'52,84,120',glintWarm:'150,100,32'}
});
function regionPlate(index,near){
  const key=index+':'+near+(onPaper()?'p':'');if(regionPlates.has(key))return regionPlates.get(key);
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
function drawRegion(index,weight){
  if(weight<.001)return;
  const region=atlasRegions[index],rc=regionInk(region),time=reducedMotion?0:world.time,paper=onPaper();
  ctx.save();ctx.globalAlpha=weight;
  ctx.fillStyle=`rgba(${rc.wash},${paper?.042:.25})`;ctx.fillRect(0,0,W,H);
  for(const near of [false,true]){
    const plate=regionPlate(index,near),height=H*(near?1.7:1.9);
    const travel=reducedMotion?0:world.cameraY*scale*(near?.17:.055)+time*(near?1.1:.35);
    const offset=((travel%height)+height)%height;
    ctx.globalAlpha=weight*(paper?(near?.17:.27):(near?.4:.62));
    ctx.drawImage(plate,0,-offset,W,height);ctx.drawImage(plate,0,height-offset,W,height);
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
function drawSheetEdge(y,strength){
  if(y<=0||y>=H||strength<=.002)return;
  const colors=ink.frame,band=frameBand(),lift=Math.max(6,14*scale);
  const shade=ctx.createLinearGradient(0,y-lift,0,y);
  shade.addColorStop(0,`rgba(${ink.base.paperRgb},0)`);shade.addColorStop(1,`rgba(${onPaper()?'58,42,28':'2,5,10'},${.3*strength})`);
  ctx.fillStyle=shade;ctx.fillRect(0,y-lift,W,lift);
  line(0,y,W,y,colors.rule,Math.max(.7,scale*.9));
  const inset=band*.2;
  ctx.save();ctx.globalAlpha=strength;ctx.strokeStyle=colors.markEdge;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(inset+.5,H);ctx.lineTo(inset+.5,y+inset+.5);ctx.lineTo(W-inset-.5,y+inset+.5);ctx.lineTo(W-inset-.5,H);ctx.stroke();
  ctx.restore();
}
function drawAtmosphere(dt=0,aim=null){
  ctx.drawImage(backdrop,0,0,W,H);
  const chapter=clamp(Math.floor(world.progress/8),0,3);
  if(world.state!=='paused')regionBlend=lerp(regionBlend,chapter,1-Math.exp(-dt*.8));
  if(Math.abs(chapter-regionBlend)<.001)regionBlend=chapter;
  plateShift=plateRegistration();
  const first=Math.floor(regionBlend),second=Math.min(3,first+1),mix=regionBlend-first;
  if(mix>0&&!reducedMotion){
    // The new chapter arrives as a fresh sheet drawn up from below the frame, its dust and its own
    // marginalia riding with it; the old plate stays where it lies and fades away underneath.
    const turn=pageTurn(mix),slide=(1-turn)*H;
    drawCelestialScene(first,1-turn*.9);drawChannelVeil();drawRegion(first,1-turn);
    ctx.save();ctx.beginPath();ctx.rect(0,slide,W,Math.max(0,H-slide));ctx.clip();
    ctx.globalAlpha=(1-turn)*.7;ctx.fillStyle=ink.base.paper;ctx.fillRect(0,slide,W,Math.max(0,H-slide));ctx.globalAlpha=1;
    drawCelestialScene(second,1);drawChannelVeil();drawRegion(second,1);
    ctx.restore();
    drawSheetEdge(slide,1-turn);
  }else{
    drawCelestialScene(first,1);if(mix>0)drawCelestialScene(second,mix);
    drawChannelVeil();
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
    ctx.font="10px 'IM Fell English',Georgia,serif";ctx.fillStyle=`rgba(${ink.atmosphere.annotation},.23)`;ctx.textAlign='left';
    ctx.fillText('ASCENDENS',W*.115,H*.45);ctx.fillText('Δ  /  '+String(Math.floor(world.progress)).padStart(3,'0'),W*.115,H*.45+17);
    line(W*.115,H*.45-15,W*.115+45,H*.45-15,`rgba(${ink.atmosphere.annotation},.2)`);
    ctx.textAlign='right';ctx.fillText('MOMENTUM',W*.88,H*.68);line(W*.88-34,H*.68+12,W*.88,H*.68+12,`rgba(${ink.atmosphere.annotation},.16)`);
  }
  ctx.save();ctx.globalAlpha=.32;ctx.fillStyle=ctx.createPattern(grain,'repeat');ctx.fillRect(0,0,W,H);ctx.restore();
}
