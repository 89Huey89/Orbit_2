'use strict';
/* Orbit · src/backdrop.js
   The two sheets: aged laid paper, and indigo night with starlight. */
function paintBackdrop(){return dressSheet(onPaper()?paintPaperBackdrop():paintNightBackdrop());}
// A derived plate is pulled on its base plate's sheet and then dressed: the whole sheet is washed
// toward the new ground colour, keeping every fibre, laid line and tide mark of the original beneath
// it, and each plate adds whatever else belongs to it — gold leaf, oxidation, or another century of
// foxing. The two base plates pass straight through untouched.
function dressSheet(sheet){
  const style=PLATE_STYLES[plateName];
  if(!style||!W||!H)return sheet;
  const g=sheet.getContext('2d');
  g.save();g.setTransform(DPR,0,0,DPR,0,0);
  g.globalAlpha=style.wash??.5;g.fillStyle=ink.base.paper;g.fillRect(0,0,W,H);g.globalAlpha=1;
  const rng=seeded(6120133);
  if(plateName==='cellarius'){
    // Gold leaf laid over a deep blue ground: a warm bloom through the middle of the sheet and a
    // scatter of leaf where the burnisher caught it.
    const bloom=g.createRadialGradient(W*.5,H*.42,0,W*.5,H*.5,Math.max(W,H)*.7);
    bloom.addColorStop(0,'rgba(214,176,96,.1)');bloom.addColorStop(1,'rgba(214,176,96,0)');
    g.fillStyle=bloom;g.fillRect(0,0,W,H);
    for(let i=0;i<190;i++){
      const x=rng()*W,y=rng()*H,r=.4+rng()*rng()*2.1;
      g.fillStyle=`rgba(244,216,148,${.05+rng()*.16})`;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
    }
  }else if(plateName==='verdigris'){
    // Copper gone green: soft oxidation patches creeping across the plate.
    for(let i=0;i<22;i++){
      const x=rng()*W,y=rng()*H,r=(.08+rng()*.3)*Math.max(W,H);
      const patch=g.createRadialGradient(x,y,0,x,y,r);
      patch.addColorStop(0,`rgba(96,168,132,${.03+rng()*.055})`);patch.addColorStop(1,'rgba(96,168,132,0)');
      g.fillStyle=patch;g.fillRect(x-r,y-r,r*2,r*2);
    }
  }else if(plateName==='azzurra'){
    // A blue-grey ground prepared over the sheet: an uneven wash, pale fibres lying every way, and a
    // soft darkening toward the edges where the preparation pooled.
    for(let i=0;i<18;i++){
      const x=rng()*W,y=rng()*H,r=(.1+rng()*.3)*Math.max(W,H);
      const patch=g.createRadialGradient(x,y,0,x,y,r);
      patch.addColorStop(0,`rgba(${rng()<.5?'70,88,106':'150,164,174'},${.03+rng()*.06})`);patch.addColorStop(1,'rgba(90,108,124,0)');
      g.fillStyle=patch;g.fillRect(x-r,y-r,r*2,r*2);
    }
    for(let i=0;i<380;i++){
      const x=rng()*W,y=rng()*H,a=rng()*TAU,l=2+rng()*9;
      g.strokeStyle=`rgba(${rng()<.55?'236,232,220':'62,78,94'},${.04+rng()*.1})`;g.lineWidth=.3+rng()*.5;
      g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();
    }
    const edge=g.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.3,W*.5,H*.5,Math.max(W,H)*.75);
    edge.addColorStop(0,'rgba(60,76,92,0)');edge.addColorStop(1,'rgba(60,76,92,.3)');
    g.fillStyle=edge;g.fillRect(0,0,W,H);
  }else if(plateName==='foxed'){
    // Another century in a damp room: heavy foxing, a few deep stains, and a darkened edge.
    for(let i=0;i<240;i++){
      const corner=rng()<.6,x=corner?(rng()<.5?rng()*W*.34:W-rng()*W*.34):rng()*W;
      const y=corner?H*.55+rng()*H*.45:rng()*H,r=1.1+rng()*rng()*9;
      const spot=g.createRadialGradient(x,y,0,x,y,r);
      spot.addColorStop(0,`rgba(116,64,24,${.2+rng()*.28})`);spot.addColorStop(.55,`rgba(132,80,36,${.1+rng()*.14})`);spot.addColorStop(1,'rgba(132,80,36,0)');
      g.fillStyle=spot;g.fillRect(x-r,y-r,r*2,r*2);
      // The rusted rim a damp spot dries into.
      if(rng()<.35){g.strokeStyle=`rgba(112,62,24,${.08+rng()*.12})`;g.lineWidth=.5;g.beginPath();g.arc(x,y,r*.78,0,TAU);g.stroke();}
    }
    const edge=g.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.22,W*.5,H*.5,Math.max(W,H)*.72);
    edge.addColorStop(0,'rgba(74,46,18,0)');edge.addColorStop(1,'rgba(74,46,18,.42)');
    g.fillStyle=edge;g.fillRect(0,0,W,H);
  }
  g.restore();
  return sheet;
}
function paintPaperBackdrop(){
  // Aged laid paper: warm cream, mottled sizing, laid and chain lines, fibres, foxing, a tide mark, and the
  // same calibrated ecliptic as the night plate pressed into the sheet in dilute sepia.
  const c=makeCanvas(Math.ceil(W*DPR),Math.ceil(H*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);
  const rng=seeded(90211);
  g.fillStyle='#e6d8b8';g.fillRect(0,0,W,H);
  const sizing=g.createRadialGradient(W*.5,H*.42,0,W*.5,H*.5,Math.max(W,H)*.72);
  sizing.addColorStop(0,'#eee2c6');sizing.addColorStop(.55,'#e4d5b3');sizing.addColorStop(1,'#d4c096');g.fillStyle=sizing;g.fillRect(0,0,W,H);
  for(let i=0;i<16;i++){
    const x=rng()*W,y=rng()*H,r=(0.16+rng()*.34)*Math.max(W,H),warm=rng()>.5;
    const blot=g.createRadialGradient(x,y,0,x,y,r);
    blot.addColorStop(0,warm?'rgba(196,160,104,.10)':'rgba(246,238,216,.16)');blot.addColorStop(1,'rgba(200,170,120,0)');
    g.fillStyle=blot;g.fillRect(x-r,y-r,r*2,r*2);
  }
  // Laid lines run across the sheet; heavier chain lines cross them at the mould's wire spacing.
  g.strokeStyle='rgba(112,86,52,.045)';g.lineWidth=.5;g.beginPath();
  for(let y=0;y<H;y+=1.55){g.moveTo(0,y+rng()*.3);g.lineTo(W,y+rng()*.3);}
  g.stroke();
  g.strokeStyle='rgba(112,86,52,.075)';g.lineWidth=.8;
  for(let x=(rng()*10);x<W;x+=27+rng()*2){
    g.beginPath();g.moveTo(x,0);for(let y=0;y<=H;y+=40)g.lineTo(x+Math.sin(y*.013+x)*.6,y);g.stroke();
  }
  for(let i=0;i<520;i++){
    const x=rng()*W,y=rng()*H,a=(rng()-.5)*.9+(rng()>.5?0:Math.PI/2),l=4+rng()*22;
    g.strokeStyle=`rgba(120,92,58,${.035+rng()*.06})`;g.lineWidth=.35+rng()*.4;
    g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*l*.5+(rng()-.5)*3,y+Math.sin(a)*l*.5+(rng()-.5)*3,x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();
  }
  // Foxing: small rust-brown spots, denser toward the sheet's lower corners.
  for(let i=0;i<46;i++){
    const corner=rng()<.55,x=corner?(rng()<.5?rng()*W*.3:W-rng()*W*.3):rng()*W,y=corner?H*.6+rng()*H*.4:rng()*H,r=.8+rng()*rng()*5.5;
    const spot=g.createRadialGradient(x,y,0,x,y,r);spot.addColorStop(0,`rgba(140,92,46,${.10+rng()*.13})`);spot.addColorStop(.6,`rgba(150,104,56,${.05+rng()*.06})`);spot.addColorStop(1,'rgba(150,104,56,0)');
    g.fillStyle=spot;g.fillRect(x-r,y-r,r*2,r*2);
  }
  // Two old water tide marks: a pale interior and a slightly darker deposited rim.
  for(const [cx,cy,rx,ry,rot] of [[W*.18,H*.86,W*.34,H*.2,-.3],[W*.9,H*.12,W*.26,H*.17,.5]]){
    g.save();g.translate(cx,cy);g.rotate(rot);
    const tide=g.createRadialGradient(0,0,0,0,0,1);tide.addColorStop(0,'rgba(250,244,226,.09)');tide.addColorStop(.86,'rgba(240,230,205,.05)');tide.addColorStop(.97,'rgba(150,112,62,.13)');tide.addColorStop(1,'rgba(150,112,62,0)');
    g.scale(rx,ry);g.fillStyle=tide;g.beginPath();g.arc(0,0,1,0,TAU);g.fill();g.restore();
  }
  // Hand-stippled dust settles in a gentle sweep, as on the night plate.
  for(let i=0;i<4200;i++){
    const y=rng()*H,x=W*(.4+.22*Math.sin(y/H*4.4-1))+(rng()+rng()+rng()-1.5)*W*.18;
    g.fillStyle=`rgba(96,70,40,${rng()*.09})`;g.fillRect(x,y,rng()>.95?1.3:.7,.65);
  }
  // A copperplate ecliptic pressed into the sheet: calibrated arcs and sparse hour marks.
  const chartRadius=Math.max(W*.8,H*.46),chartFlatten=.48;
  g.save();g.translate(W*.5,H*.62);
  g.strokeStyle='rgba(84,60,32,.14)';g.lineWidth=.9;g.beginPath();g.ellipse(0,0,chartRadius,chartRadius*chartFlatten,0,0,TAU);g.stroke();
  for(const offset of [-3,3]){g.strokeStyle='rgba(84,60,32,.075)';g.lineWidth=.5;g.beginPath();g.ellipse(0,0,chartRadius+offset,(chartRadius+offset)*chartFlatten,0,0,TAU);g.stroke();}
  for(let i=0;i<120;i++){
    const a=i/120*TAU,major=i%10===0,r=chartRadius,l=major?9:i%5===0?5:2.5;
    g.strokeStyle=`rgba(84,60,32,${major?.2:.12})`;g.lineWidth=major?.8:.5;
    g.beginPath();g.moveTo(Math.cos(a)*r,Math.sin(a)*r*chartFlatten);g.lineTo(Math.cos(a)*(r+l),Math.sin(a)*(r+l)*chartFlatten);g.stroke();
    if(major&&!plainPlate()){g.font="10px 'IM Fell English',Georgia,serif";g.fillStyle='rgba(84,60,32,.22)';g.textAlign='center';g.fillText(['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'][i/10],Math.cos(a)*(r+18),Math.sin(a)*(r+18)*chartFlatten+3);}
  }
  g.restore();
  const vignette=g.createRadialGradient(W/2,H*.46,Math.min(W,H)*.3,W/2,H*.5,Math.max(W,H)*.74);
  vignette.addColorStop(0,'rgba(120,84,40,0)');vignette.addColorStop(1,'rgba(96,64,28,.34)');g.fillStyle=vignette;g.fillRect(0,0,W,H);
  return c;
}
function paintNightBackdrop(){
  const c=makeCanvas(Math.ceil(W*DPR),Math.ceil(H*DPR)),g=c.getContext('2d');g.scale(DPR,DPR);
  g.fillStyle='#080f18';g.fillRect(0,0,W,H);
  let glow=g.createRadialGradient(W*.56,H*.38,0,W*.48,H*.5,H*.85);glow.addColorStop(0,'#182529');glow.addColorStop(.5,'#101b23');glow.addColorStop(1,'#060b13');g.fillStyle=glow;g.fillRect(0,0,W,H);
  // Fine bands resemble an old astronomical plate, rather than a flat star field.
  const rng=seeded(74812);
  g.save();g.translate(W*.04,H*.79);g.rotate(-.42);
  for(let i=0;i<32;i++){
    const r=H*(.23+i*.023);g.strokeStyle=`rgba(161,189,181,${i%5===0?.049:.018})`;g.lineWidth=i%5===0?.75:.45;
    g.beginPath();g.ellipse(0,0,r,r*.69,0,-Math.PI*.98,Math.PI*.96);g.stroke();
  }
  for(let i=0;i<135;i++){
    const a=i/135*TAU,r=H*.61,l=i%5===0?9:3;g.strokeStyle='rgba(165,177,153,.09)';g.lineWidth=.6;
    g.beginPath();g.moveTo(Math.cos(a)*r,Math.sin(a)*r*.69);g.lineTo(Math.cos(a)*(r+l),Math.sin(a)*(r+l)*.69);g.stroke();
  }
  g.restore();
  // A hand-stippled sweep of dust. Each mark is fixed in the paper texture.
  for(let i=0;i<5100;i++){
    const y=rng()*H,x=W*(.4+.22*Math.sin(y/H*4.4-1))+(rng()+rng()+rng()-1.5)*W*.18;
    const a=rng()*.06;g.fillStyle=`rgba(154,183,177,${a})`;g.fillRect(x,y,rng()>.95?1.5:.7,.65);
  }
  for(let i=0;i<34;i++){
    const x=rng()*W,y=rng()*H;g.strokeStyle='rgba(173,185,161,.028)';g.lineWidth=.5;g.beginPath();g.moveTo(x,y);g.lineTo(x+15+rng()*65,y-.2);g.stroke();
  }
  // A copperplate ecliptic: calibrated arcs and sparse hour marks in the paper.
  g.save();g.translate(W*.48,H*.51);g.rotate(-.48);
  const chartRadius=Math.max(W*.8,H*.46),chartFlatten=.48;
  g.strokeStyle='rgba(197,181,140,.095)';g.lineWidth=.65;
  for(const offset of [-3,3]){
    g.beginPath();g.ellipse(0,0,chartRadius+offset,(chartRadius+offset)*chartFlatten,0,0,TAU);g.stroke();
  }
  for(let i=0;i<120;i++){
    const a=i/120*TAU,major=i%10===0,r=chartRadius,l=major?9:i%5===0?5:2.5;
    g.strokeStyle=`rgba(207,189,146,${major?.18:.10})`;g.lineWidth=.55;
    g.beginPath();g.moveTo(Math.cos(a)*(r-3),Math.sin(a)*(r-3)*chartFlatten);
    g.lineTo(Math.cos(a)*(r+l),Math.sin(a)*(r+l)*chartFlatten);g.stroke();
    if(major&&!plainPlate()){
      g.save();g.translate(Math.cos(a)*(r+20),Math.sin(a)*(r+20)*chartFlatten);g.rotate(.48);
      g.font="italic 12px 'IM Fell English',Georgia,serif";g.textAlign='center';g.fillStyle='rgba(207,189,146,.2)';
      g.fillText(['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][i/10],0,4);g.restore();
    }
  }
  g.restore();
  const vignette=g.createRadialGradient(W/2,H*.46,Math.min(W,H)*.22,W/2,H*.5,Math.max(W,H)*.7);
  vignette.addColorStop(0,'rgba(3,8,15,0)');vignette.addColorStop(1,'rgba(2,6,13,.66)');g.fillStyle=vignette;g.fillRect(0,0,W,H);
  return c;
}
const planetFamilies=['ocean','crater','ringed','ice','dune','volcanic','storm'];
// Each world's local colour is registered per plate; on paper it is a restrained period pigment
// (verdigris, ochre, burnt sienna, indigo, chalk) instead of the night plate's muted alien tone.
// planetPalettes forwards to the live plate so both `distantGlobe` (outside this region) and the
// code below keep reading `planetPalettes[family].rgb` etc. without knowing which plate is active.
definePlate('planets',{
  night:{
    ocean:   {light:'#cdc7ac',body:'#929c87',dark:'#343a32',rgb:'184,190,164',size:26,spin:.012},
    crater:  {light:'#ded1b4',body:'#b1a58a',dark:'#3c3931',rgb:'207,194,164',size:21,spin:.007},
    ringed:  {light:'#d8c7a1',body:'#b2a07d',dark:'#443b2d',rgb:'202,185,147',size:27,spin:.009},
    ice:     {light:'#d6d5bd',body:'#a4b0a6',dark:'#39413d',rgb:'196,205,187',size:24,spin:.008},
    dune:    {light:'#d8bf93',body:'#b49b72',dark:'#493b2d',rgb:'202,178,137',size:24,spin:.01},
    volcanic:{light:'#b5a184',body:'#82735f',dark:'#302d29',rgb:'184,159,122',size:25,spin:.011},
    storm:   {light:'#c9c3b4',body:'#9c9b91',dark:'#3e3d3c',rgb:'191,188,173',size:29,spin:.013},
    gold:    {light:'#d7c18b',body:'#9b8558',dark:'#34362f',rgb:'218,192,139',size:14,spin:.006},
    shield:  {light:'#bcd8e0',body:'#6f95a3',dark:'#26363c',rgb:'163,205,214',size:15,spin:.006}
  },
  paper:{
    ocean:   {light:'#e2dcc4',body:'#aebd9f',dark:'#465648',rgb:'62,104,84',   size:26,spin:.012}, // verdigris
    crater:  {light:'#e8dcbe',body:'#c3b48e',dark:'#524832',rgb:'122,100,70', size:21,spin:.007}, // weathered chalk/ochre
    ringed:  {light:'#ead5a0',body:'#c9a76a',dark:'#5a4221',rgb:'176,118,38', size:27,spin:.009}, // ochre
    ice:     {light:'#ece4cb',body:'#c4cbb2',dark:'#465148',rgb:'100,118,128',size:24,spin:.008}, // chalk + slate
    dune:    {light:'#ecd09b',body:'#c99b60',dark:'#5a3a1e',rgb:'166,90,46',  size:24,spin:.01},  // burnt sienna
    volcanic:{light:'#d8ab7c',body:'#ab7346',dark:'#4a2818',rgb:'166,58,40',  size:25,spin:.011}, // rubrication
    storm:   {light:'#dad4bc',body:'#a3a894',dark:'#3f454a',rgb:'52,84,120',  size:29,spin:.013}, // indigo
    gold:    {light:'#ead495',body:'#c39e55',dark:'#4a3a1c',rgb:'190,132,46', size:14,spin:.006}, // bright ochre
    shield:  {light:'#d5dfd7',body:'#9ab6ac',dark:'#2e4640',rgb:'56,104,134', size:15,spin:.006}  // dull Prussian
  }
});
// The red chalk the paper plate's keylines are first tried in: sanguine on the sheet, and, for the derived
// plates, whatever the press makes of it.
definePlate('underdrawing',{night:{chalk:'214,116,88'},paper:{chalk:'168,74,56'}});
const planetPalettes={};
for(const family in PLATES.night.planets)Object.defineProperty(planetPalettes,family,{enumerable:true,get:()=>ink.planets[family]});

// Every seven main worlds have different geology. The run seed changes their
// order; decoration has its own RNG and never changes the course or physics.
