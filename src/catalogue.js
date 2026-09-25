'use strict';
/* Orbit · src/catalogue.js
   The catalogue: the ledger's record, cosmetic catalogue and named-feat leaf, with the engraved SVG
   previews every card shows. Loads before ui.js, which opens and closes the leaf and wires its tabs. */
// ---------- The catalogue: the ledger's own leaf ----------
// A ruled library-catalogue page over the plate. It lists what the ledger has recorded and, under it,
// every cosmetic the atlas can be printed with: the ones that have been earned are selectable, the
// rest are blank rules with their condition beside them. Nothing here touches the simulation, and the
// button that opens it is only on the plate when no run is in progress.
let pendingUnlocks=[],catalogueOpen=false,catalogueTab='record';
// Thousands set off by a thin space, the period convention, rather than the en-US comma this used to
// hard-code — an old-style figure was never grouped by a punctuation mark.
const commas=n=>String(Math.round(Number(n)||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
// A count of nothing is ruled off rather than lettered as Fell's old-style zero, which sets as a
// lowercase o at table size — the same convention roman() already declares for a bare figure.
const countMark=n=>{const v=Math.round(Number(n)||0);return v?commas(v):'—';};
function chartTime(seconds){
  const total=Math.max(0,Math.round(Number(seconds)||0)),h=Math.floor(total/3600),m=Math.floor(total%3600/60);
  return h?h+' hor. '+m+' min.':m?m+' min.':total+' sec.';
}
const plainText=value=>String(value??'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
// Chapter numbers are printed the way the running head and the plate reveal already print them — a
// roman numeral beside the chapter's own name (see `numerals`/`chapters` in src/plates.js) — rather
// than a bare digit. ledger.deepestChapter and ledger.deepestHardcoreChapter are stored 1-4, or 0 for
// a ledger that has never yet folded in a finished run.
function chapterLabel(value){
  const n=Math.max(0,Math.min(chapters.length,Math.round(Number(value)||0)));
  // Prefixed with TAB. so the record pane and the ephemeris agree with the chapter reveal's own TABULA,
  // rather than the bare numeral this used to print alone.
  return n?'TAB. '+numerals[n-1]+' · '+chapters[n-1]:'—';
}
// The atlas's eight named feats, in the order src/simulation.js's OBSERVATIONS lists them, paired with
// the same Latin caption the sheet inscribes when each first fires — read off OBSERVATIONS rather than
// restated here, so this table and src/ledger.js's UNLOCKS medals can never drift out of the one name.
const OBSERVATION_LABELS=Object.keys(OBSERVATIONS).map(key=>[key,OBSERVATIONS[key].latin]);
// Every ledger table sits on its own .ledger-wrap so paintLedgerRules() (below) can back it with a
// canvas of engraved row rules cut to its actual measured height — the straight CSS border-bottom a
// ruled register carried before read as forty identical strokes from one hand that owns none of them.
// A table may open on a lead group: its first `lead` rows are marked so the register can set its
// headline figures larger than the entries beneath them, the way a folio opens on its own first lines.
function ledgerTable(rows,lead=0){
  return '<div class="ledger-wrap"><canvas class="ledger-rule" aria-hidden="true"></canvas><table class="ledger-table"><tbody>'+
    rows.map(([label,value],i)=>`<tr${i<lead?' class="ledger-lead"':''}><th scope="row">${label}</th><td>${value}</td></tr>`).join('')+
    '</tbody></table></div>';
}
// The register opens on the four figures the pane used to box off above it in a block of tiles — and
// then printed a second time, two of them, as ordinary rows a screen further down, so one screen held
// HIGHEST ROW and BEST FLOW twice over. They are the register's own first four lines now, set larger
// than the entries under them rather than fenced off from them in a spreadsheet of cards.
function catalogueTable(){
  const rows=[
    ['Unlocks',commas(unlockedIds().size)+' / '+UNLOCKS.length],
    ['Constellations traced',commas(ledgerStat('constellations'))],
    ['Highest row',commas(ledger.bestRow)],
    ['Best flow','×'+commas(ledger.bestFlow)],
    ['Orbits captured',commas(ledger.captures)],
    ['Perfect transfers',commas(ledger.perfects)],
    ['Runs',commas(ledgerStat('runs'))],
    ['Time in the chart',chartTime(ledger.playSeconds)]
  ];
  return ledgerTable(rows,4);
}
// How far the studiolo has been filled, pricked rather than filled in: twelve lozenges — the same mark
// the score frame and a chosen menu line are pricked with — of which as many are inked as the standing
// reaches. A catalogue counts its plates in discrete marks and does not run a bar across them, and the
// exact figure is already set in the kicker above the row, so these are a reading at a glance rather
// than a second statement of it. The last lozenge is held back until the catalogue is actually complete,
// since twelve marks stand in for fifty-odd plates and a rounded ninety-nine would otherwise ink a full
// row over a studiolo still missing a sheet.
function studioloMarks(percent){
  const marks=12,inked=percent>=100?marks:Math.min(marks-1,Math.round(percent/100*marks));let out='';
  for(let i=0;i<marks;i++)out+=i<inked?'<i class="inked"></i>':'<i></i>';
  return out;
}
function catalogueOverview(){
  const total=UNLOCKS.length,earned=unlockedIds().size,percent=total?Math.round(earned/total*100):100;
  const locked=UNLOCKS.filter(entry=>!isUnlocked(entry.id));
  const next=locked.map(entry=>({entry,progress:unlockProgress(entry)}))
    .filter(item=>item.progress).sort((a,b)=>a.progress.value/a.progress.threshold-b.progress.value/b.progress.threshold)[0];
  const nextText=next?next.entry.describe():locked.length?'Complete a named feat':'The catalogue is complete';
  const nextProgress=next?commas(Math.min(next.progress.value,next.progress.threshold))+' / '+commas(next.progress.threshold):locked.length?'SPECIAL':commas(total)+' / '+commas(total);
  return '<div class="cat-overview">'+
    '<div class="cat-overview-seal"><strong>'+earned+'</strong><span>/ '+total+'</span></div>'+
    '<div class="cat-overview-copy"><span class="cat-overview-kicker">THE STUDIOLO · '+percent+'%</span>'+
      '<strong>'+plainText(nextText)+'</strong>'+
      '<span class="cat-overview-progress">NEXT · '+nextProgress+'</span>'+
      '<span class="cat-progress-rule" aria-hidden="true">'+studioloMarks(percent)+'</span></div>'+
    '</div>';
}
// The score and the run count the ledger holds for each pressure, TIRO through MAGISTER, beside the
// daily plate's own tally under its own name.
function pressureTable(){
  // Named alongside TIRO through MAGISTER, which are a shared display constant kept in full caps, this
  // row's own label matches them here rather than the sentence case 'Tabula diei' reads as elsewhere.
  const rows=[['relaxed',DIFFICULTY_LABELS.relaxed],['classic',DIFFICULTY_LABELS.classic],
    ['hardcore',DIFFICULTY_LABELS.hardcore],['daily','TABULA DIEI']];
  // Vis Gravitatis stays off this table until it is earned, exactly as its own catalogue row stays a
  // locked rule rather than a selectable one: an always-present zero row would read as played rather
  // than as not yet unlocked.
  if(isUnlocked('newton'))rows.push(['newton',UNLOCK_BY_ID.newton.latin]);
  return ledgerTable(rows.map(([key,label])=>[plainText(label),`${countMark(ledger.personalBests[key])} best · ${countMark(ledger.runs[key])} runs`]));
}
// The fuller record: the lifetime figures the catalogue has always shown, then every other stat the
// ledger keeps that otherwise never surfaces anywhere in the UI on its own — some of it only ever
// leaking out as a locked cosmetic's "progress toward" text, and only until that rule is unlocked and
// the text disappears for good.
function catalogueRecord(){
  const streak=typeof dailyStreak==='function'?dailyStreak():{current:0,longest:0};
  const rows=[
    ['Deepest chapter reached',chapterLabel(ledger.deepestChapter)],
    ['Deepest chapter at '+DIFFICULTY_LABELS.hardcore+' pressure',chapterLabel(ledger.deepestHardcoreChapter)],
    ['Vortices grazed',commas(ledger.grazes)],
    [POWERUP_LABELS.shield+' spent',commas(ledger.shieldsSpent)],
    [POWERUP_LABELS.reflector+' spent',commas(ledger.reflectorsSpent)],
    [POWERUP_LABELS.dawn+' spent',commas(ledger.dawnsSpent)],
    ['Slingshots left at full charge',commas(ledger.maxSpeedSlings)],
    ['Inkwells filled on a streak',commas(ledger.inkwellsFound)],
    ['Rough impressions',commas(ledger.badAngles)],
    ['Daily streak',commas(streak.current)+' day'+(streak.current===1?'':'s')+' · best '+commas(streak.longest)]
  ];
  let html=catalogueTable()+ledgerTable(rows);
  html+='<section class="cat-group"><h3>By pressure<span class="cat-latin">Pondera</span></h3>'+pressureTable()+'</section>';
  html+='<section class="cat-group"><h3>Feats achieved<span class="cat-latin">Insignia</span></h3>'+
    ledgerTable(OBSERVATION_LABELS.map(([key,latin])=>[plainText(latin),countMark(ledger.observations[key])]))+'</section>';
  // How the runs ended, in the order the losses are commonly met, then any other the plate has reported.
  // It is the one figure that says which of the chart's pressures is actually the one being lost to.
  const losses=['LEFT THE STAR CHART','THE NIB RAN DRY','THE DARK CAUGHT UP',...Object.values(HAZARD_KINDS).map(k=>k.loss).filter(Boolean),'THE ORBIT FADED'];
  for(const reason in ledger.deaths)if(!losses.includes(reason))losses.push(reason);
  html+='<section class="cat-group"><h3>How runs ended<span class="cat-latin">Exitus</span></h3>'+
    ledgerTable(losses.map(reason=>[plainText(reason.charAt(0)+reason.slice(1).toLowerCase()),countMark(ledger.deaths[reason])]))+'</section>';
  html+='<section class="cat-group"><h3>Constellations<span class="cat-latin">Asterismi</span></h3>'+
    ledgerTable(CONSTELLATIONS.map(c=>[`<span class="cat-name">${plainText(c.name)}</span><span class="cat-latin">${plainText(c.latin)}</span>`,countMark(ledger.constellations[c.name])]))+'</section>';
  return html;
}
// ---------- The catalogue's engraved previews ----------
// Every card shows the thing itself rather than a stand-in character. These were single Unicode
// dingbats before, set in the plate's own face — and a face that was never cut for a nib or a comet
// falls through to whatever the device keeps for them, which on a phone is the colour emoji font: a
// glossy pen and a cartoon comet, laid on an engraved plate. They are cut here instead, in the
// vocabulary of the marks they stand for, as inline SVG over a 120×72 field held inside the middle of
// the window so its own rules still read around the drawing. Everything strokes in currentColor — the
// plate's gold — except the two kinds that are themselves about colour: a plate prints as a swatch of
// its own ground, ink and gold, and a trail ink is laid in the very ink it would letter a run in.
const ART_FIELD='0 0 120 72',ART_GROUND='rgb(var(--veil))';
const artRound=n=>Math.round(n*10)/10;
const artRgb=v=>'rgb('+(Array.isArray(v)?v.join(','):v)+')';
const artLine=(d,w=1.1,a=1,c='',extra='')=>'<path d="'+d+'"'+(c?' stroke="'+c+'"':'')+' stroke-width="'+w+'"'+(a===1?'':' opacity="'+a+'"')+extra+'/>';
const artFill=(d,a=1,c='')=>'<path d="'+d+'" stroke="none" fill="'+(c||'currentColor')+'"'+(a===1?'':' opacity="'+a+'"')+'/>';
const artDot=(x,y,r,a=1,c='')=>'<circle cx="'+artRound(x)+'" cy="'+artRound(y)+'" r="'+artRound(r)+'" stroke="none" fill="'+(c||'currentColor')+'"'+(a===1?'':' opacity="'+a+'"')+'/>';
const artRing=(x,y,r,w=1.1,a=1,c='')=>'<circle cx="'+artRound(x)+'" cy="'+artRound(y)+'" r="'+artRound(r)+'"'+(c?' stroke="'+c+'"':'')+' stroke-width="'+w+'"'+(a===1?'':' opacity="'+a+'"')+'/>';
// Arcs, stars and spirals are cut rather than typed out: a ring of beads, a compass rose and a
// vortex are all far shorter as a loop than as path data, and stay true when a size is changed.
function artArc(cx,cy,r,from,to){
  const x0=cx+Math.cos(from)*r,y0=cy+Math.sin(from)*r,x1=cx+Math.cos(to)*r,y1=cy+Math.sin(to)*r;
  return 'M'+artRound(x0)+' '+artRound(y0)+'A'+artRound(r)+' '+artRound(r)+' 0 '+(Math.abs(to-from)>Math.PI?1:0)+' '+(to>from?1:0)+' '+artRound(x1)+' '+artRound(y1);
}
function artStar(cx,cy,points,outer,inner,turn=-Math.PI/2){
  let d='';
  for(let i=0;i<points*2;i++){
    const a=turn+i*Math.PI/points,r=i%2?inner:outer;
    d+=(i?'L':'M')+artRound(cx+Math.cos(a)*r)+' '+artRound(cy+Math.sin(a)*r);
  }
  return d+'Z';
}
function artSpiral(cx,cy,rFrom,rTo,from,to,steps=44){
  let d='';
  for(let i=0;i<=steps;i++){
    const u=i/steps,a=lerp(from,to,u),r=lerp(rFrom,rTo,u);
    d+=(i?'L':'M')+artRound(cx+Math.cos(a)*r)+' '+artRound(cy+Math.sin(a)*r);
  }
  return d;
}
// A plate is a colourway, so its card is a sheet of it: the plate's own ground under its own ink, with
// one orbit and one star of its own gold. Every derived plate has passed the base tokens through its
// transform already (see PLATE_STYLES in src/plates.js), so this reads eight sheets from one drawing.
function platePreview(id){
  const p=(PLATES[id]||PLATES.night).base,line=artRgb(p.ink),soft=artRgb(p.inkSoft),gold=artRgb(p.gold);
  return '<rect x="25" y="10" width="70" height="52" fill="'+p.paper+'" stroke="'+line+'" stroke-width="1.1"/>'+
    '<rect x="29" y="14" width="62" height="44" fill="none" stroke="'+soft+'" stroke-width=".6" opacity=".7"/>'+
    artRing(60,36,18,.7,.6,soft)+artRing(60,36,11,1,.85,line)+
    artFill(artStar(60,36,4,7.5,2.2),1,gold)+
    artDot(41,22,1.5,.9,line)+artDot(79,49,1.3,.85,line)+artDot(77,21,1.1,.7,soft)+artDot(43,49,1.2,.7,soft)+
    artLine('M33 55h11M87 17H76',.7,.55,soft);
}
// A trail ink is the one cosmetic that is nothing but colour, so its card is a stroke of it, and the
// whole life of one: the card lays the same line the pen lays, read back to front. The bead at the point
// and the wet leading half are the ink as it leaves the nib; the swelling body behind them is the same
// ink drying; and the thin tail it runs back to is the dried route the run's whole flight is printed in
// — which is a tone of its own, `path`, and the one most of the ink standing on a chart actually is (see
// drawTrail and drawInkPath in src/effects.js, which read these very tokens). Under all of it the wash
// the nib leaves in the paper, over it the dry-brush edge, and a blot where the stroke began. Every tone
// is the ink's own registered value on the plate now on the press; nothing here is a stand-in for one.
// The card prints them at close to full strength where the chart lays them thin and lets them fade, so
// it reads as a pigment swatch rather than as a screenshot of a stroke — which is what a catalogue of
// inks is for. The lay is one cubic; every segment below is cut from it, so they meet as one line.
function trailPreview(id){
  const pen=trailInk(id),lay='M26 55C46 48 68 29 94 14',dry=artRgb(pen.dry);
  return (pen.keyline?artLine(lay,5.4,.34,artRgb(pen.keyline)):'')+
    artLine(lay,9,.2,artRgb(pen.wash))+
    artLine('M26 55Q39.5 49.9 54.4 39.7',1.8,.8,artRgb(pen.path||ink.dark.pathInk))+
    artLine('M47.8 43.9Q68.8 29.7 94 14',3.2,.92,dry)+artLine('M57.8 37.5Q69.5 29.5 82.6 21',4.6,.92,dry)+
    artLine('M66 32Q79.2 22.8 94 14',3.4,1,artRgb(pen.wet))+
    artLine('M30 52C50 45 70 26 93 11',.7,.5,artRgb(pen.edge))+
    (pen.shimmer?artLine('M42 45C58 39 74 26 92 14',.6,.85,artRgb(pen.shimmer)):'')+
    artDot(95,13.5,3.4,1,artRgb(pen.wet));
}
// Where the stroke began, the card spills one — and that one is not drawn here at all. A splat is a
// seeded contour under five burin flicks and seven flung droplets, and reproducing any of that in path
// data would be a second copy of it to keep true; so the card carries a canvas at the same field the
// SVG is cut on, and `inkSplat` (src/effects.js) paints it, the very function the chart spills with, at
// the ink's own blotWet-to-blotDry mix and at its own alphas. What the card chooses is only the moment:
// SPLAT_LIFE is a seventh of the way in, which is exactly where the spill has finished spreading and
// has barely begun to dry, so the card shows an ink at its fullest body — .70 on the pool's own .85,
// against the .72 the chart peaks at. The spray is thrown left, out of the window and away from the
// stroke, and the seed is the ink's own name, so a card keeps one blot rather than a new one per pass.
const SPLAT_LIFE=.18,SPLAT_SIZE=11.5,SPLAT_AT=[25,57];
const splatSeed=id=>{let h=0x811c9dc5;for(let i=0;i<id.length;i++)h=Math.imul(h^id.charCodeAt(i),0x01000193);return h>>>0;};
function paintCatalogueSplats(body){
  if(!body||!body.querySelectorAll)return;
  for(const c of body.querySelectorAll('canvas.cat-splat')){
    const w=c.clientWidth,h=c.clientHeight;
    if(!(w>0&&h>0)||!c.getContext)continue;
    c.width=Math.max(1,Math.round(w*DPR));c.height=Math.max(1,Math.round(h*DPR));
    const g=c.getContext('2d');if(!g)continue;
    // The same fit the SVG beside it is given, so the spill lands on the stroke's own start.
    const k=Math.min(w/120,h/72);
    g.setTransform(DPR,0,0,DPR,0,0);
    g.translate((w-120*k)/2,(h-72*k)/2);g.scale(k,k);
    g.translate(SPLAT_AT[0],SPLAT_AT[1]);
    g.lineCap='round';g.lineJoin='round';
    inkSplat(g,trailInk(c.getAttribute('data-ink')),SPLAT_LIFE,splatSeed(c.getAttribute('data-ink')||''),SPLAT_SIZE,.72,Math.PI,true);
  }
}
// One engraved rule per row, cut at each row's own measured foot rather than at an assumed pitch: a
// register that opens on four figures set larger than the entries under them has rows of two heights,
// and the canvas-height-over-row-count tile this used to lay would drift out of register against them
// the moment it did. The figures run in a ruled column of their own besides — one vertical hairline
// down the boundary between label and value, cut by the same burin as the rows and set a touch finer,
// so a number is read against a rule rather than flush right in open paper. See the art audit.
function paintLedgerRules(body){
  if(!body||!body.querySelectorAll)return;
  for(const wrap of body.querySelectorAll('.ledger-wrap')){
    const c=wrap.querySelector('canvas.ledger-rule'),table=wrap.querySelector('table.ledger-table');
    const w=c&&c.clientWidth,h=c&&c.clientHeight,rows=table&&table.rows.length;
    if(!c||!table||!(w>0&&h>0&&rows>0)||!c.getContext)continue;
    c.width=Math.max(1,Math.round(w*DPR));c.height=Math.max(1,Math.round(h*DPR));
    const g=c.getContext('2d');if(!g)continue;
    g.setTransform(DPR,0,0,DPR,0,0);
    const box=c.getBoundingClientRect(),rgb=ink.base.inkSoft,alpha=onPaper()?.3:.2;
    for(let i=0;i<rows;i++){
      const y=table.rows[i].getBoundingClientRect().bottom-box.top;
      burinSegment(g,1,y,w-1,y,rgb,alpha,.55,(i+1)*97+31,{segments:Math.max(6,Math.round(w/22)),hair:false,wobble:.22});
    }
    const cell=table.rows[0].cells[1],x=cell?cell.getBoundingClientRect().left-box.left:0;
    if(x>2&&x<w-2)burinSegment(g,x,0,x,h,rgb,alpha*.78,.42,rows*53+17,{segments:Math.max(6,Math.round(h/26)),hair:false,wobble:.18});
  }
}
// A leaf's own edge, cut on the canvas behind the DOM rather than ruled with a straight CSS border: the
// plate-mark rect buildFrameLayer opens the chart's own frame with, one faint inner rule, and (unless
// asked to skip it) a single corner rosette — a book page, not a chart, so no tick ladder. Shared by the
// catalogue and ephemeris leaves, which hide their own CSS border once this is drawn (see index.html);
// the colophon keeps its own double CSS rule and the ink-wipe reveal it carries, so it draws this
// underneath as one more layer rather than in place of it, and skips the rosette to stay out of its way.
function paintLeafFrame(id,opts={}){
  const c=$(id);if(!c)return;
  const w=c.clientWidth,h=c.clientHeight;
  if(!(w>0&&h>0)||!c.getContext)return;
  c.width=Math.max(1,Math.round(w*DPR));c.height=Math.max(1,Math.round(h*DPR));
  const g=c.getContext('2d');if(!g)return;
  g.setTransform(DPR,0,0,DPR,0,0);
  const rgb=ink.base.inkSoft;
  g.lineWidth=1;g.strokeStyle=`rgba(${rgb},${onPaper()?.3:.2})`;
  g.strokeRect(3.5,3.5,Math.max(1,w-7),Math.max(1,h-7));
  burinRect(g,10.5,10.5,Math.max(1,w-21),Math.max(1,h-21),rgb,onPaper()?.34:.24,.7,58113);
  if(!opts.noRosette)frameRosette(g,24,24,rgb,onPaper()?.34:.24,9,58119);
}
function paintCatalogueLeafFrame(){paintLeafFrame('cat-leaf-frame');}
// The colophon's own closing device, struck small over FINIS or (a perfect chain earned) LAVS DEO —
// the same armillary-and-strapwork mark impressumDevice already cuts for the frontispiece cartouche,
// re-centred on its own little canvas rather than shared with a live-drawn layer.
function paintFinisDevice(){
  const c=$('end-finis-device');if(!c)return;
  const w=c.clientWidth,h=c.clientHeight;
  if(!(w>0&&h>0)||!c.getContext)return;
  c.width=Math.max(1,Math.round(w*DPR));c.height=Math.max(1,Math.round(h*DPR));
  const g=c.getContext('2d');if(!g)return;
  g.setTransform(DPR,0,0,DPR,0,0);
  impressumDevice(g,w/2,h/2,w*.42,onPaper()?.6:.42,90721);
}
// The eight observer marks, cut as the pen cuts them in flight (see OBSERVER_MARKS in src/effects.js).
// Five of them are walked out of a loop here rather than typed as path data — the feather's vane off
// the very `vaneProfile` the flight lays it with, and the comet's rays, Saturn's hatching, the
// cross-staff's divisions and the moon's broken terminator off the same arithmetic the chart uses —
// so a card cannot quietly drift from the mark it is offering.
const MARK_ART={
  quill:(()=>{
    const QX=40,QY=43,PX=108,PY=11,CX=72,CY=18,N=26,edge=[[],[]];
    let barbs='';
    for(let i=0;i<N;i++){
      const u=(i+.7)/(N+.7),x=qAt(u,QX,CX,PX),y=qAt(u,QY,CY,PY);
      const tx=2*((1-u)*(CX-QX)+u*(PX-CX)),ty=2*((1-u)*(CY-QY)+u*(PY-CY)),tl=Math.hypot(tx,ty)||1;
      const ux=tx/tl,uy=ty/tl,w=vaneProfile(u);
      for(const side of [-1,1]){
        const r=w*(side>0?14:9.4),nx=-uy*side,ny=ux*side,ex=x+nx*r+ux*r*.95,ey=y+ny*r+uy*r*.95;
        barbs+='M'+artRound(x)+' '+artRound(y)+'Q'+artRound(x+nx*r*.78+ux*r*.2)+' '+artRound(y+ny*r*.78+uy*r*.2)+' '+artRound(ex)+' '+artRound(ey);
        edge[side>0?0:1].push(artRound(ex)+' '+artRound(ey));
      }
    }
    const vane=side=>'M'+QX+' '+QY+'L'+edge[side].join('L')+'L'+PX+' '+PY+'Z';
    return artFill(vane(0),.17)+artFill(vane(1),.13)+artLine(barbs,.45,.68)+
      artLine('M'+QX+' '+QY+'Q'+CX+' '+CY+' '+PX+' '+PY,1.3)+
      artLine('M26.1 47.3L38.7 40.8M29.9 52.7L41.3 45.3',.75,.8)+
      artLine('M31 46.7L33.3 50.4M34.4 44.8L36.7 48.5',.5,.5)+
      artFill('M10 63L26.1 47.3L29.9 52.7Z',.9)+artLine('M12.4 61L24.4 50.2',1,1,ART_GROUND)+
      artLine('M22.5 47.2L26.6 52.9',.6,.7)+artDot(15.6,59.3,2.2);
  })(),
  comet:(()=>{
    const HX=94,HY=31,LEN=78,SPREAD=15,CURL=5,RAYS=9;
    let rays='',beard='';
    for(let i=0;i<RAYS;i++){
      const v=i/(RAYS-1)*2-1,s=v*(.42+.58*Math.abs(v)),run=.62+(i%3)*.14+(i&1)*.08;
      rays+='M'+artRound(HX-6-Math.abs(s)*5)+' '+artRound(HY+s*11)+
        'Q'+artRound(HX-LEN*.36)+' '+artRound(HY+s*SPREAD*.3+CURL*.3)+
        ' '+artRound(HX-LEN*run)+' '+artRound(HY+s*SPREAD+CURL*run);
    }
    for(let i=0;i<9;i++){
      const a=(i/8-.5)*2.1,r=13,out=3+((i*5)%4)*1.7;
      beard+='M'+artRound(HX+Math.cos(a)*r)+' '+artRound(HY+Math.sin(a)*r)+'L'+artRound(HX+Math.cos(a)*(r+out))+' '+artRound(HY+Math.sin(a)*(r+out));
    }
    const u=.64,far=LEN*u;
    const wash='M'+(HX-4)+' '+artRound(HY-2.6)+'Q'+artRound(HX-far*.5)+' '+artRound(HY-SPREAD*u*.44+CURL*.2)+
      ' '+artRound(HX-far)+' '+artRound(HY-SPREAD*u*.78+CURL*u)+'L'+artRound(HX-far)+' '+artRound(HY+SPREAD*u+CURL*u)+
      'Q'+artRound(HX-far*.5)+' '+artRound(HY+SPREAD*u*.5+CURL*.2)+' '+(HX-4)+' '+artRound(HY+2.6)+'Z';
    return artFill(wash,.1)+artLine(rays,.7,.6)+
      artDot(HX,HY,11.5,.15)+artLine(beard,.55,.55)+artDot(HX,HY,5.6,.3)+artRing(HX,HY,5.6,1.2);
  })(),
  telescope:artFill('M88 18L56 24L22 30L22 44L56 50L88 56Z',.12)+
    artLine('M88 18L56 24L22 30M88 56L56 50L22 44',1,.9)+
    artLine('M34 28v18M44 26v22M68 22v30M78 20v36',.45,.3)+
    '<ellipse cx="88" cy="37" rx="2.8" ry="19" stroke-width="1"/>'+
    '<ellipse cx="56" cy="37" rx="2.4" ry="13" stroke-width=".8" opacity=".8"/>'+
    '<ellipse cx="22" cy="37" rx="1.8" ry="7" stroke-width=".8" opacity=".8"/>'+
    artLine('M92 32L101 29',.5,.4,'',' stroke-dasharray="3 3"')+artFill(artStar(106,27,4,4.4,1.3),.85),
  moth:artFill('M58 26C44 16 28 22 27 34C26 44 42 44 58 34Z',.14)+artFill('M62 26C76 16 92 22 93 34C94 44 78 44 62 34Z',.14)+
    artLine('M58 26C44 16 28 22 27 34C26 44 42 44 58 34Z',.9,.9)+artLine('M62 26C76 16 92 22 93 34C94 44 78 44 62 34Z',.9,.9)+
    artLine('M58 34C48 38 42 48 48 56C54 60 60 48 60 40Z',.8,.75)+artLine('M62 34C72 38 78 48 72 56C66 60 60 48 60 40Z',.8,.75)+
    artLine('M56 30L34 28M56 33L32 36M57 36L37 41',.4,.4)+artLine('M64 30L86 28M64 33L88 36M63 36L83 41',.4,.4)+
    artLine('M57 21C52 14 46 11 40 11M63 21C68 14 74 11 80 11',.8,.8)+
    artLine('M50 14l-3-3M45 12l-2-3M69 14l3-3M74 12l2-3',.45,.5)+
    artLine('M60 22V54',2.4)+artDot(60,22,3,.9),
  // Three bodies and no ring, since that is what the glass showed and what the chart draws.
  saturn:(()=>{
    let bars='';
    for(const side of [-1,1])for(let i=0;i<4;i++){
      const y=28+i*5.4,w=9*Math.sqrt(Math.max(0,1-((y-36)/14)*((y-36)/14)));
      bars+='M'+artRound(60+side*(30-w))+' '+y+'H'+artRound(60+side*(30+w));
    }
    return '<ellipse cx="30" cy="36" rx="10.5" ry="14" transform="rotate(-7 30 36)" stroke-width="1.1" fill="currentColor" fill-opacity=".18"/>'+
      '<ellipse cx="90" cy="36" rx="10.5" ry="14" transform="rotate(7 90 36)" stroke-width="1.1" fill="currentColor" fill-opacity=".18"/>'+
      artLine(bars,.5,.5)+artDot(60,36,12,.2)+artRing(60,36,12,1.3)+
      artLine('M50 31C55 33 66 33 70 31M50 41C55 39 66 39 70 41',.55,.5);
  })(),
  crossstaff:(()=>{
    const Y=36,X0=112,X1=14,CROSS=54,ARM=25;
    let ticks='';
    for(let i=1;i<12;i++){const x=lerp(X0,X1,i/12),t=i%3?1:1.8;ticks+='M'+artRound(x)+' '+artRound(Y-3.2*t)+'V'+artRound(Y+3.2*t);}
    return artLine('M'+X0+' '+Y+'H'+X1,1.4)+artLine(ticks,.5,.6)+
      artFill('M'+(CROSS-2.6)+' '+(Y-ARM)+'H'+(CROSS+2.6)+'V'+(Y+ARM)+'H'+(CROSS-2.6)+'Z',.14)+
      artLine('M'+CROSS+' '+(Y-ARM)+'V'+(Y+ARM),1.4)+
      artLine('M'+(CROSS-2)+' '+(Y-ARM)+'H'+(CROSS+10)+'M'+(CROSS-2)+' '+(Y+ARM)+'H'+(CROSS+10),1)+
      artLine('M'+X1+' '+(Y-8)+'V'+(Y+8)+'M'+(X1-4)+' '+(Y-5)+'V'+(Y+5),.9)+
      artLine('M'+CROSS+' '+(Y-ARM)+'L'+(X1-4)+' '+Y+'M'+CROSS+' '+(Y+ARM)+'L'+(X1-4)+' '+Y,.5,.45);
  })(),
  burin:(()=>{
    let turning='';
    for(let i=0;i<3;i++){const x=35-i*5.8;turning+='M'+x+' 25.4Q'+(x-2.5)+' 36 '+(x+.9)+' 46';}
    return artFill('M110 40L40 32.4L40 46Z',.16)+artLine('M110 40L40 32.4L40 46Z',.9)+
      artFill('M106 39.2L44 33.9L44 37.7Z',.55)+
      artFill('M40 32.4C34.9 23.4 19.8 24.1 17.6 36.5C17 43.4 20.4 46 24.6 46L40 46Z',.22)+
      artLine('M40 32.4C34.9 23.4 19.8 24.1 17.6 36.5C17 43.4 20.4 46 24.6 46L40 46Z',1)+
      artLine(turning,.5,.5)+artLine('M110 40L100 34.6',.8,.9)+
      artLine('M110 38.6Q104.7 29 90.8 29.6Q80 30.3 83 36.1',.7,.8);
  })(),
  moon:(()=>{
    const CX=64,CY=36,R=30,K=Math.cos(Math.PI*.4);
    let term='',dark='';
    for(let i=1;i<=14;i++){
      const th=Math.PI/2-i/14*Math.PI,jag=(((i*7)%5)-2)*1.4+((i&1)?1:-.9);
      term+='L'+artRound(CX+Math.cos(th)*(K*R+jag))+' '+artRound(CY+Math.sin(th)*R);
    }
    for(let i=0;i<4;i++){const a0=Math.PI/2+i*Math.PI/4+.16;dark+=artArc(CX,CY,R,a0,a0+Math.PI/4-.32);}
    const limb=artArc(CX,CY,R,-Math.PI/2,Math.PI/2);
    let spots='';
    for(const [along,y,r] of [[.34,-13,5.4],[.5,11,7.4],[.72,1.4,3.9]]){
      const edge=Math.sqrt(Math.max(.04,1-(y/R)*(y/R))),x=CX+lerp(K*R,R,along)*edge;
      spots+=artDot(x,CY+y,r,.26)+artRing(x,CY+y,r,.5,.6);
    }
    return artFill(limb+term+'Z',.22)+artLine(limb,1.2)+artLine('M'+CX+' '+(CY+R)+term,.75,.85)+
      artLine(dark,.6,.45)+spots;
  })()
};
// What the burin leaves at a planet as the traveller is taken (see CAPTURE_MARKS in src/effects.js).
const CAPTURE_ART={
  ripple:(()=>{
    let broken='',outer='',fan='';
    for(let i=0;i<5;i++){
      const a=i/5*TAU-Math.PI/2;
      broken+=artArc(60,36,20,a+.13,a+TAU/5-.13);outer+=artArc(60,36,26,a+.3,a+TAU/5-.36);
    }
    for(let i=-2;i<=2;i++){
      const a=i*.13,reach=9*(1-Math.abs(i)*.16);
      fan+='M'+artRound(60+Math.cos(a)*28)+' '+artRound(36+Math.sin(a)*28)+'L'+artRound(60+Math.cos(a)*(28+reach))+' '+artRound(36+Math.sin(a)*(28+reach));
    }
    return artLine(broken,1.4)+artLine(outer,.7,.55)+artRing(60,36,7,.9,.65)+artLine(fan,.6,.7);
  })(),
  rose:artFill(artStar(60,36,4,26,7),.9)+artFill(artStar(60,36,4,17,6,-Math.PI/4),.6)+
    artRing(60,36,7.5,.8,.7)+artRing(60,36,28.5,.6,.45)+artLine('M70 36H98',.7,.6),
  seal:artFill('M62 12C77 11 88 20 87 33C86 45 76 59 61 59C46 60 33 49 32 35C31 21 46 13 62 12Z',.2)+
    artLine('M62 12C77 11 88 20 87 33C86 45 76 59 61 59C46 60 33 49 32 35C31 21 46 13 62 12Z',1)+
    artLine(artStar(60,36,6,15,6.5),.85,.9)+artRing(60,36,19,.7,.7),
  manicule:'<g transform="translate(56 36) scale(28)">'+
    artLine('M-1 -.5L-.66 -.6L-.66 .6L-1 .5Z',.04)+
    artLine('M-.62 -.52C-.2 -.6 -.02 -.42 .18 -.34L.92 -.26C1.16 -.2 1.16 -.02 .9 .02L.2 .06C.42 .3 .24 .62 -.16 .6L-.62 .56Z',.04)+
    artLine('M-.1 .1L.16 .13M-.14 .3L.1 .32',.024,.75)+'</g>'
};
// The marginal ornaments cut into the frame's four corners (see frameOrnaments in src/frame.js).
const FRAME_ART={
  windheads:(()=>{
    let curls='';
    for(let i=0;i<5;i++){
      const a=Math.PI*.74+i/4*Math.PI*.98;
      curls+=artRing(44+Math.cos(a)*17.4,34+Math.sin(a)*17.4,5.6,.85,.8);
    }
    return artRing(44,34,17,1.3)+curls+
      artLine('M48 23Q56 20.5 62 24',1,.8)+artLine('M49 28Q55 32 61 28',1.1,.9)+
      artLine('M42 40Q53 48 61 39',1.1,.85)+artRing(59,35,4,1.1)+artDot(59,35,1.7,.85)+
      artLine('M64 31L98 20',.9,.5)+artLine('M64 33L100 27',1,.7)+artLine('M64 35L101 36',1.1,.8)+
      artLine('M64 37L99 44',1,.65)+artLine('M64 39L96 52',.9,.5);
  })(),
  strapwork:artLine('M24 30H50M70 30H96M24 42H50M70 42H96',1.1,.9)+
    artLine('M24 30A6 6 0 0 0 24 42M96 30A6 6 0 0 1 96 42',.95,.85)+
    artLine('M52 10V62M68 10V62',1.1,.95)+
    artLine('M52 10A8 8 0 0 1 68 10M52 62A8 8 0 0 0 68 62',.95,.9)+
    artLine('M27 36L34 29L41 36L34 43ZM79 36L86 29L93 36L86 43ZM60 14L67 21L60 28L53 21Z',.8,.85)+
    artRing(34,36,1.8,.6,.7)+artRing(86,36,1.8,.6,.7)+artRing(60,21,1.8,.6,.7),
  acanthus:artLine('M20 58C34 55 46 43 54 30C61 21 74 13 87 18',1.6,.9)+
    artLine(artSpiral(86,27,9,1.2,-1.4,-1.4+TAU*1.35),1.1,.9)+artDot(86,27,1.5,.8)+
    artFill('M30 52C31 43 37 37 45 35C43 43 38 49 30 52Z',.12)+artLine('M30 52C31 43 37 37 45 35C43 43 38 49 30 52Z',.9,.85)+
    artFill('M43 40C46 31 53 26 61 25C58 33 52 38 43 40Z',.12)+artLine('M43 40C46 31 53 26 61 25C58 33 52 38 43 40Z',.9,.8)+
    artFill('M56 28C60 20 67 16 75 15C71 23 65 27 56 28Z',.12)+artLine('M56 28C60 20 67 16 75 15C71 23 65 27 56 28Z',.9,.75)+
    artLine('M32 50C36 46 40 42 44 37M45 38C48 33 52 30 59 27M57 27C60 23 65 19 72 17',.4,.45),
  seamonsters:artLine('M14 52A12 12 0 0 1 38 52M38 52A14 14 0 0 1 66 52',1.2)+
    artLine('M20 44l-3-3M28 40l-2-4M36 44l-3-3M46 40l-3-4M56 39l-2-4M62 45l-3-3',.5,.45)+
    artLine('M66 52C74 48 74 38 80 30',1.2,.95)+
    artFill('M74 28C74 20 82 15 91 18C99 21 100 29 94 32L80 35Z',.16)+
    artLine('M74 28C74 20 82 15 91 18C99 21 100 29 94 32L80 35Z',1.1)+
    artLine('M80 25L96 22',.65,.7)+artDot(81,22.5,1.4)+
    artLine('M84 28v3M88 27v3M92 26v3',.5,.5)+
    artLine('M88 15L84 7M91 15L92 6M92 16L99 9',.7,.5)+
    artLine('M12 55H108',.6,.3)+artLine('M16 59H104',.55,.22)+artLine('M22 63H98',.5,.15)
};
// The three engraver's manners, shown on the Lyre — one of the twelve figures the chart actually deals
// (see CONSTELLATIONS in src/simulation.js) — so the card offers a hand rather than an invented beast.
// One contour and one set of stars, cut at the weight, breakage and hatching the chosen hand uses:
// Hevelius's medium broken line, Bayer's finer and more continuous one, Bode's heavy cut under far more
// shading (see FIGURE_STYLES in src/figures.js). The stars are struck the same in all three, since the
// hand changes how the figure over them is engraved and never where the chart says they stand.
const FIGURE_SHELL='M46 44C46 56 52 61 60 61C68 61 74 56 74 44Z';
const FIGURE_ARMS='M48 44C40 38 34 28 36 19M72 44C80 38 86 28 84 19M33 20H87';
const FIGURE_STRINGS='M48 21V44M54 21V44M60 21V44M66 21V44M72 21V44';
const FIGURE_STARS=[[36,17],[84,17],[60,20],[60,61],[40,31]];
const FIGURE_STIPPLE=[[54,50],[60,52],[66,50],[57,56],[63,56],[50,47],[70,47],[60,46],[60,58]];
function figurePreview(weight,dash,hatch,stipple){
  let hat='';
  for(let i=0;i<hatch;i++)hat+='M'+artRound(49+i*3.4)+' 46l2.4 '+artRound(8-Math.abs(i-hatch/2)*1.4);
  const cut=dash?' stroke-dasharray="'+dash+'"':'';
  return artLine(FIGURE_SHELL,weight,.92,'',cut)+artLine(FIGURE_ARMS,weight,.92,'',cut)+
    artLine(artSpiral(36,17,4.5,1,-.4,-.4+TAU*1.1,22),weight*.85,.85)+
    artLine(artSpiral(84,17,4.5,1,Math.PI+.4,Math.PI+.4-TAU*1.1,22),weight*.85,.85)+
    artLine(FIGURE_STRINGS,weight*.5,.6)+artLine(hat,weight*.5,.42)+
    FIGURE_STIPPLE.slice(0,stipple).map(([x,y])=>artDot(x,y,.9,.5)).join('')+
    FIGURE_STARS.map(([x,y])=>artFill(artStar(x,y,4,4.4,1.3),.95)).join('');
}
// Drawn from FIGURE_STYLES itself (src/figures.js) rather than three hand-typed literal calls, so the
// card can never drift from what the plate actually cuts: the dash reads the hand's own breakage, the
// hatch and stipple counts its own density fields, scaled to the small range this preview was tuned to.
const FIGURE_ART={};
for(const figureId in FIGURE_STYLES){
  const fs=FIGURE_STYLES[figureId],dash=fs.breaks>=.8?'4.5 2.2':fs.breaks>=.4?'3 2.6':'';
  FIGURE_ART[figureId]=figurePreview(fs.weight*1.35,dash,Math.max(2,Math.round(fs.hatch*3.5)),Math.max(2,Math.round(fs.stipple*5)));
}
// A struck medal: a beaded rim, a plain field, and the feat's own device cut into it.
function medalRoundel(device){
  let beads='';
  for(let i=0;i<26;i++){const a=i/26*TAU;beads+=artDot(60+Math.cos(a)*23.2,36+Math.sin(a)*23.2,.85,.6);}
  return artRing(60,36,26,1.3)+artRing(60,36,20,.6,.55)+beads+device;
}
const MEDAL_ART={
  // Three perfect transfers in a row, five orbits cleared in one flight, the chart's top speed.
  perfecti:medalRoundel(artFill(artStar(47,36,4,4.8,1.5))+artFill(artStar(60,36,4,4.8,1.5))+artFill(artStar(73,36,4,4.8,1.5))),
  quinque:medalRoundel(artLine('M46 44Q60 22 74 44',1.2)+[46,53,60,67,74].map(x=>artDot(x,46,1.7,.9)).join('')),
  summa:medalRoundel(artLine('M50 26L63 36L50 46M60 26L73 36L60 46',2)),
  // A vortex grazed at speed, a chart traced in perfect transfers alone, the fortieth row.
  periculum:medalRoundel(artLine(artSpiral(60,36,13,1.4,0,TAU*1.7),1.1)+artLine('M47 25C55 32 63 40 73 46',1.1,.8)),
  pura:medalRoundel(artLine('M60 25L48 45L72 45Z',.9,.8)+artFill(artStar(60,25,4,4.6,1.4))+artFill(artStar(48,45,4,4.6,1.4))+artFill(artStar(72,45,4,4.6,1.4))),
  altitudo:medalRoundel(artLine('M60 48V24M55 29L60 22L65 29',1.5)+artLine('M51 46H69M53 40H67M55 34H65',.8,.7)),
  // Three minutes aloft, a right angle of arrival, twenty-five narrow escapes, ten thousand orbits.
  vigilia:medalRoundel(artLine('M50 24H70L60.5 36L70 48H50L59.5 36Z',1.2)+artLine('M54 45H66',.8,.7)+artDot(60,33,1.2,.8)),
  rectus:medalRoundel(artLine('M48 22V48H76',1.6)+artLine('M48 41H55V48',.8,.8)+artDot(48,48,2)),
  evasio:medalRoundel(artLine(artArc(60,36,14,.8,TAU-.8),1.5)+artLine('M49 42C57 39 68 35 78 31',1.1,.85)),
  myrias:medalRoundel(artLine('M50 27L70 46M70 27L50 46',1.6)+artLine('M50 21H70',1.1,.85)+
    [[46,29],[74,29],[46,45],[74,45]].map(([x,y])=>artDot(x,y,1,.5)).join(''))
};
// The engraver's own two: the burin the plate is cut with, and the stamp the sheet is owned by.
const CREDIT_ART=artFill('M24 44C18 40 18 32 24 28C31 25 39 29 39 36C39 43 31 47 24 44Z',.16)+
  artLine('M24 44C18 40 18 32 24 28C31 25 39 29 39 36C39 43 31 47 24 44Z',1.2)+
  artLine('M39 31L45 30V42L39 41Z',.9,.9)+
  artFill('M45 31L92 21L96 26L46 41Z',.14)+artLine('M45 31L92 21L96 26L46 41Z',1.2)+
  artLine('M46 34L93 24',.55,.5)+artLine('M28 56H92',.6,.3);
const STAMP_ART='<ellipse cx="60" cy="36" rx="32" ry="22" stroke-width="1.3"/>'+
  '<ellipse cx="60" cy="36" rx="27" ry="17.5" stroke-width=".6" opacity=".55"/>'+
  artFill('M44 41C50 37 55 37 60 39C65 37 70 37 76 41L76 30C70 26 65 26 60 28C55 26 50 26 44 30Z',.14)+
  artLine('M44 41C50 37 55 37 60 39C65 37 70 37 76 41L76 30C70 26 65 26 60 28C55 26 50 26 44 30Z',1.1)+
  artLine('M60 28V39',.8,.8)+artLine('M47 47H73',.6,.5);
// ---------- The two categories that are about what stands behind the chart ----------
// An oval is the one primitive the rest of this file never needed: the graticule is a sphere seen
// edge-on, and so is every parallel and meridian on it.
const artOval=(x,y,rx,ry,w=1.1,a=1,turn=0)=>'<ellipse cx="'+artRound(x)+'" cy="'+artRound(y)+'" rx="'+artRound(rx)+'" ry="'+artRound(ry)+'" stroke-width="'+w+'"'+(a===1?'':' opacity="'+a+'"')+(turn?' transform="rotate('+artRound(turn)+' '+artRound(x)+' '+artRound(y)+')"':'')+'/>';
// Strokes cut radially between two radii, as one path: the divisions of a dial, the graduations of a
// limb, and the rhumbs a wind-node throws are all the same figure at different reaches.
function artRays(x,y,r0,r1,count,turn=0){
  let d='';
  for(let i=0;i<count;i++){
    const a=turn+i/count*TAU;
    d+='M'+artRound(x+Math.cos(a)*r0)+' '+artRound(y+Math.sin(a)*r0)+'L'+artRound(x+Math.cos(a)*r1)+' '+artRound(y+Math.sin(a)*r1);
  }
  return d;
}
// The compass prick and its two crossed ruling strokes: the first mark of every construction, and on
// the unruled card the only one.
const SPHERE_PRICK=artLine('M55.5 36h9M60 31.5v9',.7,.8)+artDot(60,36,1.2,.95);
// Each construction as its own hand actually sets it out (see SPHERE_HANDS in src/frame.js), cut small.
const SPHERE_ART={
  graticule:artOval(60,36,33,20.5,1,.9)+artOval(60,36,33,20.5,.85,.7,-18)+
    artOval(60,36,33,17,.5,.45)+artOval(60,36,33,11,.5,.4)+
    artOval(60,36,9,20.5,.5,.42)+artOval(60,36,20,20.5,.5,.36)+SPHERE_PRICK,
  // The limb, the two tropics, and the eccentric ecliptic laid tangent inside one and outside the
  // other — set out at the very proportions paintReteSphere solves for.
  rete:artRing(60,36,30,1,.9)+artRing(60,36,13.2,.55,.45)+artRing(60,36,21.6,.5,.35)+
    artRing(73.4,19.1,8.4,.9,.75)+artLine('M30 36h60M60 6v60',.5,.28)+
    artLine('M67.6 26.5Q57 31 46 42',.6,.6)+artLine('M45.5 39.5L46 42L48.5 42.4',.5,.6)+artDot(46,42,1.1,.85)+
    artLine('M80.5 25Q86 35 81 47',.6,.6)+artLine('M83 44.8L81 47L78.5 46',.5,.6)+artDot(81,47,1.1,.85),
  // Seven heavens about the earth, the outermost doubled and pricked with the fixed stars.
  orbs:artRing(60,36,30,1,.9)+artRing(60,36,28.4,.55,.45)+
    [5.5,9.5,13.5,17.5,21.5,25.5].map(r=>artRing(60,36,r,.5,.4)).join('')+
    artRing(60,36,3,.6,.7)+artLine('M57.3 34.7h5.4M57.3 37.3h5.4',.45,.5)+
    artRing(75.5,25,2.8,.55,.6)+artDot(77.5,23.3,1,.85)+
    Array.from({length:8},(_,i)=>artDot(60+Math.cos(i/8*TAU+.4)*29.2,36+Math.sin(i/8*TAU+.4)*29.2,.75,.55)).join(''),
  // Dials on a common pin, divided into twelve, with the index swung over them and its thread hanging.
  volvelle:artRing(60,36,30,1,.9)+artRing(60,36,27,.55,.45)+artRing(60,36,22,.5,.4)+artRing(60,36,17,.5,.36)+artRing(60,36,12,.5,.3)+
    artLine(artRays(60,36,27,30,12,-Math.PI/2),.5,.42)+artLine(artRays(60,36,17,22,4,-Math.PI/2),.5,.3)+
    artLine('M53.6 48.5L74.5 21.7',1)+artLine('M70.5 21.2L74.5 21.7L74.9 25.6',.55,.75)+
    artRing(60,36,3.2,.7,.8)+artLine('M67.5 30.5V43',.4,.4)+artDot(67.5,43,1.4,.6),
  // An unruled sheet: its corner marks, and the prick that is the one thing a capture always makes.
  none:artLine('M28 14h7M28 14v7M92 14h-7M92 14v7M28 58h7M28 58v-7M92 58h-7M92 58v-7',.6,.34)+SPHERE_PRICK
};
// The chapter print in miniature: plate I's monumental lunar limb, its graduated arc, and the small
// companion above it — which is what the distance is when it is switched on. Drawn deliberately past
// the field on the left, exactly as the print runs off the sheet.
const SCENE_PRINT=artRing(6,44,34,1,.55)+artLine(artArc(6,44,24,-1.16,1.16),.55,.32)+
  artRing(22,30,4,.5,.5)+artRing(14,55,5.5,.5,.42)+artRing(29,49,3,.5,.38)+
  artLine(artArc(6,44,38,-1.2,1.2),.5,.3)+
  artLine(Array.from({length:9},(_,i)=>{const a=-1.2+i*.3,out=38+(i%2?3:6);
    return 'M'+artRound(6+Math.cos(a)*38)+' '+artRound(44+Math.sin(a)*38)+'L'+artRound(6+Math.cos(a)*out)+' '+artRound(44+Math.sin(a)*out);}).join(''),.45,.3)+
  artRing(97,15,11,.8,.5)+artRing(94,12,2.6,.45,.4)+artRing(100,19,2,.45,.35);
// A wind rose, cut as paintWindRose cuts it: sixteen points in halves, one inked and one left open.
function artRose(x,y,r){
  let art='';
  for(let i=0;i<16;i++){
    const a=-Math.PI/2+i/16*TAU,len=r*(i%4===0?1:i%2?.44:.68);
    for(const side of [-1,1]){
      const edge=a+side*Math.PI/16;
      const d='M'+artRound(x+Math.cos(a)*len)+' '+artRound(y+Math.sin(a)*len)+'L'+artRound(x+Math.cos(edge)*r*.14)+' '+artRound(y+Math.sin(edge)*r*.14)+'L'+artRound(x)+' '+artRound(y)+'Z';
      art+=artFill(d,side<0?.5:.16)+artLine(d,.35,.5);
    }
  }
  return art+artRing(x,y,r*.14,.4,.5)+artRing(x,y,r*.68,.4,.4);
}
const SCENE_ART={
  // A sheet with nothing behind the chart: its plate-mark, its inner rule and its laid lines, and that
  // is the whole card, because that is the whole of what is printed there.
  none:'<rect x="25" y="10" width="70" height="52" fill="none" stroke="currentColor" stroke-width="1" opacity=".75"/>'+
    '<rect x="29" y="14" width="62" height="44" fill="none" stroke="currentColor" stroke-width=".5" opacity=".35"/>'+
    artLine('M33 22h54M33 30h54M33 38h54M33 46h54M33 54h54',.4,.15),
  chapterplates:SCENE_PRINT,
  // The hidden circle, its eight wind-nodes each throwing their own lines clean across the sheet, the
  // four winds heavier than the rest of them, and the rose on the node the chart is oriented from.
  rhumbs:artLine(Array.from({length:8},(_,i)=>{const a=i/8*TAU;return artRays(60+Math.cos(a)*26,36+Math.sin(a)*26,0,90,8);}).join(''),.35,.11)+
    artLine(artRays(60,36,15,90,16),.4,.18)+artLine(artRays(60,36,15,90,4),.4,.4)+
    artRing(60,36,26,.4,.26)+artRose(60,36,15),
  // The same copper pulled a second time onto a damp sheet: reversed, weaker, and doubled a hair off
  // itself. The card is the print's own art run through the very transform the blit runs it through.
  counterproof:'<g transform="translate(120,0) scale(-1,1)"><g opacity=".5">'+SCENE_PRINT+'</g>'+
    '<g opacity=".26" transform="translate(2,1.5)">'+SCENE_PRINT+'</g></g>'
};
const PREVIEW_ART={
  plate:platePreview,trail:trailPreview,
  sphere:id=>SPHERE_ART[id]||SPHERE_ART.graticule,
  scenery:id=>SCENE_ART[id]||SCENE_ART.none,
  mark:id=>MARK_ART[id]||MARK_ART.quill,
  capture:id=>CAPTURE_ART[id]||CAPTURE_ART.ripple,
  frame:id=>FRAME_ART[id]||FRAME_ART.windheads,
  figures:id=>FIGURE_ART[id]||FIGURE_ART.bayer,
  medal:id=>MEDAL_ART[id]||medalRoundel(artFill(artStar(60,36,6,13,5))),
  credit:()=>CREDIT_ART,stamp:()=>STAMP_ART
};
function cataloguePreview(item,kind,locked=false){
  const cut=PREVIEW_ART[kind],art=cut?cut(item.id):medalRoundel(artFill(artStar(60,36,6,13,5)));
  const spill=!locked&&kind==='trail'?'<canvas class="cat-splat" data-ink="'+plainText(item.id)+'" aria-hidden="true"></canvas>':'';
  const shown=locked?'<span class="cat-preview-glyph">DESIDERATUR</span>'
    :'<svg class="cat-art" viewBox="'+ART_FIELD+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'+art+'</svg>'+spill;
  return '<span class="cat-preview'+(locked?' is-locked':'')+'" data-kind="'+plainText(kind)+'" data-item="'+plainText(item.id)+'" aria-hidden="true">'+
    shown+'<span class="cat-preview-rule"></span></span>';
}
function catalogueRow(item,kind){
  const entry=UNLOCK_BY_ID[item.id];
  if(entry&&!isUnlocked(item.id)){
    const progress=unlockProgress(entry);
    const need=entry.describe()+(progress?' · '+commas(Math.min(progress.value,progress.threshold))+' / '+commas(progress.threshold):' · BY FEAT ALONE');
    return `<li class="cat-row cat-card locked">${cataloguePreview(item,entry.kind||kind||'medal',true)}<div class="cat-card-copy"><span class="cat-name">${plainText(item.name)}</span><span class="cat-latin">${plainText(item.latin)}</span><span class="cat-state">NOT YET CUT</span><span class="cat-cond">${plainText(need)}</span></div></li>`;
  }
  const chosen=kind&&cosmetic(kind)===item.id;
  const label=`<span class="cat-name">${plainText(item.name)}</span><span class="cat-latin">${plainText(item.latin)}</span><span class="cat-state">${chosen?'ON THE PRESS':'IN THE CASE'}</span>`;
  if(!kind)return `<li class="cat-row cat-card">${cataloguePreview(item,entry?.kind||'medal')}<div class="cat-card-copy">${label}</div></li>`;
  return `<li class="cat-row cat-card"><button class="cat-item" type="button" data-kind="${kind}" data-id="${item.id}" aria-pressed="${chosen}">${cataloguePreview(item,kind)}<span class="cat-card-copy">${label}</span></button></li>`;
}
// Every cosmetic group, the named feats as earned-or-not, and the engraver's credit — the catalogue
// half of the leaf, unchanged from before the Record tab existed beside it.
function catalogueItems(){
  let html=catalogueOverview();
  for(const group of COSMETIC_KINDS){
    html+=`<section class="cat-group"><h3>${group.title}<span class="cat-latin">${group.latin}</span></h3><ul class="cat-grid">`;
    for(const item of cosmeticItems(group.kind))html+=catalogueRow(item,group.kind);
    html+='</ul></section>';
  }
  return html;
}
function catalogueInsignia(){
  let html=catalogueOverview();
  html+='<section class="cat-group"><h3>Named feats<span class="cat-latin">Insignia</span></h3><ul class="cat-grid">';
  for(const entry of UNLOCKS)if(entry.kind==='medal')html+=catalogueRow(entry,null);
  html+='</ul></section>';
  // A harder plate rather than a selection, so it earns a card here beside the feats and the engraver
  // rather than a slot among the eight chosen cosmetic categories in Catalogue.
  html+='<section class="cat-group"><h3>Natural philosophy<span class="cat-latin">Philosophia naturalis</span></h3><ul class="cat-grid">';
  for(const entry of UNLOCKS)if(entry.kind==='mode')html+=catalogueRow(entry,null);
  html+='</ul></section>';
  html+='<section class="cat-group"><h3>The engraver<span class="cat-latin">Sculptor</span></h3><ul class="cat-grid">';
  for(const id of ['delineavit','exlibris'])html+=catalogueRow(UNLOCK_BY_ID[id],null);
  html+='</ul>';
  if(isUnlocked('delineavit')){
    html+='<p class="cat-initials"><label for="initials">Initials, three letters</label>'+
      `<input id="initials" type="text" maxlength="3" size="3" autocomplete="off" spellcheck="false" value="${plainText(initials)}"></p>`;
  }
  html+='</section>';
  return html;
}
// The leaf holds three sections — the ledger's Record, the cosmetic Catalogue, and Insignia — and a
// small tab switch between them. All are rendered into the DOM on every pass; only the inactive one is
// hidden with the .hidden class already used elsewhere for whole-screen show/hide (see .cat-pane.hidden
// in src/index.html), so anything that reads the leaf's markup — including scripts/verify.mjs, which
// searches catalogue-body's innerHTML right after opening it — finds every section regardless of which
// tab is showing.
function renderCatalogue(){
  const body=$('catalogue-body');if(!body)return;
  // One rule for all three: the vernacular label on the button, the learned caption beneath it, set
  // mixed case (the tab's own CSS already reads data-sub with text-transform:none) so a borrowed word
  // like Studiolo reads as one rather than as a third capitalisation convention.
  const tabs=[['record','RECORD','Chronicon'],['catalogue','CATALOGUE','Studiolo'],['insignia','FEATS','Insignia']];
  let html='<div class="cat-tabs">'+
    tabs.map(([id,label,sub])=>`<button type="button" class="diff-btn cat-tab-btn" data-tab="${id}" data-sub="${sub}" aria-pressed="${catalogueTab===id}">${label}</button>`).join('')+
    '</div>';
  html+=`<div class="cat-pane${catalogueTab==='record'?'':' hidden'}" data-pane="record">${catalogueRecord()}</div>`;
  html+=`<div class="cat-pane${catalogueTab==='catalogue'?'':' hidden'}" data-pane="catalogue">${catalogueItems()}</div>`;
  html+=`<div class="cat-pane${catalogueTab==='insignia'?'':' hidden'}" data-pane="insignia">${catalogueInsignia()}</div>`;
  body.innerHTML=html;
  paintCatalogueSplats(body);
  paintLedgerRules(body);
  paintCatalogueLeafFrame();
  const field=$('initials');
  if(field&&field.addEventListener&&!field.wired){
    field.wired=true;
    field.addEventListener('input',()=>{const clean=setInitials(field.value);if(field.value!==clean)field.value=clean;});
  }
}
// The ex libris stamp is printed on the colophon once the ledger has a score at every pressure.
function syncCatalogueMarks(){
  const stamp=$('end-exlibris');
  if(stamp)stamp.classList.toggle('hidden',!isUnlocked('exlibris'));
  const mark=$('exlibris-initials');
  if(mark)mark.textContent=initials||'ORBIS';
}
function openCatalogue(){
  if(ephemerisOpen)closeEphemeris();
  // Always opens on the Record tab, whichever tab was showing when the leaf was last closed.
  catalogueOpen=true;catalogueTab='record';renderCatalogue();
  $('catalogue').classList.remove('hidden');$('catalogue').setAttribute('aria-hidden','false');
  $('catalogue-open').setAttribute('aria-expanded','true');
  game.classList.add('cataloguing');
  if(audio.enabled)audio.brush(1200,.14);
}
function closeCatalogue(){
  catalogueOpen=false;
  $('catalogue').classList.add('hidden');$('catalogue').setAttribute('aria-hidden','true');
  $('catalogue-open').setAttribute('aria-expanded','false');
  game.classList.remove('cataloguing');
}
