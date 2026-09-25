/* Worker playthroughs: seeded sixty-flight (and similar) pilots that each fly a whole course, run on
   their own worker thread by the driver in ../verify.mjs alongside the sequential checks. */
import assert from 'node:assert/strict';
import {step,OrbitWorld,pointSegment,CONSTELLATIONS} from './sandbox.mjs';

// A tangent-seeking pilot uses the stars and follows the generated main route.
export function taskRoute60(){
  let totalCaptures=0,perfects=0,maxNodes=0,maxHazards=0;const failures=[];
  for(let seed=1;seed<=60;seed++){
    const w=new OrbitWorld(seed,seed%3===0?1280:440,860);w.start();
    for(let i=0;i<120*220&&w.state==='playing'&&w.progress<48;i++){
      if(w.player.node){
        const aim=w.aim();
        if(aim&&!aim.steep&&aim.n.type!=='gold'&&aim.n.row===Math.floor(w.progress)+1&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))w.release();
      }
      w.update(step);
      if(i===120*12&&seed%4===0)w.resize(1280,780);
      if(i===120*16&&seed%4===0)w.resize(440,860);
      assert(Number.isFinite(w.player.x)&&Number.isFinite(w.player.y));
      maxNodes=Math.max(maxNodes,w.nodes.length);maxHazards=Math.max(maxHazards,w.hazards.length);
    }
    totalCaptures+=w.captures;perfects+=w.perfects;
    if(w.progress<48)failures.push({seed,progress:w.progress,reason:w.reason,elapsed:w.elapsed});
  }
  assert.equal(failures.length,0,'Every tested route must remain playable: '+JSON.stringify(failures));
  assert(maxNodes<20&&maxHazards<12,'Endless generation should stay bounded');
  return {totalCaptures,perfects,maxNodes,maxHazards};
}

// Era I's own hazards, run through the same tangent-seeking pilot taskRoute60 already trusts, with
// chasmsOn AND relightOn both set together — the two era-only flags the wall turns on at once, so this
// is the pilot that proves neither perturbs the other: every seed must still reach row 48, chasms
// actually have to appear, no node's capture-plus-orbit disc may ever come within a chasm's own
// half-width, and the run must never raise anything (the relight logic runs every flight tick of every
// seed here, so a broken bound or a NaN would surface across sixty seeds long before anyone saw it).
export function taskChasmRoute60(){
  let totalChasms=0,firstRow=Infinity;const failures=[],intersections=[];
  for(let seed=1;seed<=60;seed++){
    // The world prunes as a live run does rather than keeping everything (keepAll): kept, every node
    // ever dealt stays in aim()'s sweep and stretches its reach, which made this one flight the whole
    // suite's wall time. The fairness check below still sees every node and chasm the run dealt,
    // because each is collected here as it appears, before the darkness can prune it.
    const w=new OrbitWorld(seed,seed%3===0?1280:440,860,()=>{},false,false,false,true,true);w.start();
    const nodes=new Set(w.nodes),chasms=new Set(w.chasms);
    for(let i=0;i<120*220&&w.state==='playing'&&w.progress<48;i++){
      if(w.player.node){
        const aim=w.aim();
        if(aim&&!aim.steep&&aim.n.type!=='gold'&&aim.n.row===Math.floor(w.progress)+1&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))w.release();
      }
      w.update(step);
      for(const q of w.nodes)nodes.add(q);for(const c of w.chasms)chasms.add(c);
      assert(Number.isFinite(w.player.x)&&Number.isFinite(w.player.y));
    }
    if(w.progress<48)failures.push({seed,progress:w.progress,reason:w.reason,elapsed:w.elapsed});
    totalChasms+=chasms.size;
    for(const c of chasms){
      firstRow=Math.min(firstRow,c.row);
      for(const q of nodes){
        const d=pointSegment(q.baseX,q.baseY,c.x0,c.y0,c.x1,c.y1);
        if(d<q.cap+q.amp+c.w)intersections.push({seed,row:c.row,node:q.row,d,need:q.cap+q.amp+c.w});
      }
    }
  }
  assert.equal(failures.length,0,'Every tested route must remain playable with chasms on: '+JSON.stringify(failures));
  assert(totalChasms>=30,'Chasms must actually be generated when the flag is on: '+totalChasms);
  assert(firstRow>=5,'No chasm may appear before row 5: first at row '+firstRow);
  assert.equal(intersections.length,0,'No node\'s capture-plus-orbit disc may ever touch a chasm: '+JSON.stringify(intersections.slice(0,5)));
  return {totalChasms};
}

export function taskDetourDeep(){
  // Follow each optional three-star path, rejoin, and continue to row 48, then keep flying the same
  // course to row 60: forks no longer stop at the fourth region, and one seeded flight answers both,
  // since the pilot at row 48 has no notion of stopping there. Row 48 is a snapshot taken in passing,
  // not a second flight of the same seed under the same policy — the two used to be run separately.
  let chartCompletions=0,deepCharts=0,deepRows=0;
  const detourFailures=[],deepFailures=[],deepFigures=new Set();
  for(let seed=1;seed<=60;seed++){
    const rewards=[],w=new OrbitWorld(seed,seed%3===0?1280:440,860,(type,e)=>{if(type==='constellation')rewards.push(e);});w.start();
    let past48=false;
    for(let i=0;i<120*320&&w.state==='playing'&&w.progress<60;i++){
      if(w.player.node){
        const row=Math.floor(w.progress)+1;
        const target=w.nodes.find(n=>n.row===row&&n.routeRole==='star')||w.nodes.find(n=>n.row===row&&n.type!=='gold');
        const aim=w.aim();
        if(aim&&!aim.steep&&target&&aim.n.id===target.id&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))w.release();
      }
      w.update(step);
      if(i===120*12&&seed%4===0)w.resize(1280,780);
      if(i===120*16&&seed%4===0)w.resize(440,860);
      assert(w.nodes.length<20&&w.hazards.length<12&&w.nebulas.length<8,'Later generation must stay bounded');
      if(w.progress<48)assert(w.constellations.length<=Math.floor(w.row/8)+1,'Branch generation must stay bounded');
      if(!past48&&w.progress>=48){
        past48=true;
        // Every region now carries a fork, so a course through row 48 offers six charts.
        if(w.constellationsCompleted<4)detourFailures.push({seed,progress:w.progress,completed:w.constellationsCompleted,reason:w.reason});
        chartCompletions+=w.constellationsCompleted;
        assert.equal(rewards.length,w.constellationsCompleted,'Exactly one reward event per completed chart');
        assert(rewards.every(e=>e.gain===60&&e.chart.mask===7));
        assert(rewards.every(e=>e.chart.name===e.chart.name.toUpperCase()&&e.chart.catalogueIndex>=0));
        if(w.constellationsCompleted>=4){
          const score=w.score,captures=w.captures,done=w.constellations.filter(c=>c.completed);
          assert.equal(w.capture(done[done.length-1].stars[2]),false,'A visited star cannot be farmed');
          assert.equal(w.score,score);assert.equal(w.captures,captures);
        }
      }
    }
    if(!past48)detourFailures.push({seed,progress:w.progress,completed:w.constellationsCompleted,reason:w.reason});
    if(w.progress<60)deepFailures.push({seed,progress:w.progress,reason:w.reason,elapsed:w.elapsed});
    deepRows+=w.progress;
    for(const chart of w.constellations){
      assert(chart.catalogueIndex>=0&&chart.catalogueIndex<CONSTELLATIONS.length);
      assert.equal(chart.name,CONSTELLATIONS[chart.catalogueIndex].name);
      assert(chart.stars.length<=3&&chart.id===Math.floor(chart.entry.row/8),'A chart is identified by its region');
      if(chart.id>=4)deepFigures.add(chart.catalogueIndex);
    }
    deepCharts+=w.constellations.filter(c=>c.completed&&c.id>=4).length;
  }
  assert.equal(detourFailures.length,0,'Every optional path must be playable: '+JSON.stringify(detourFailures));
  assert.equal(deepFailures.length,0,'Forks past the fourth region must stay completable: '+JSON.stringify(deepFailures));
  assert(deepCharts>=60,'The later regions must actually be traced: '+deepCharts);
  assert(deepFigures.size>=8,'Later regions must draw a varying figure from the catalogue: '+deepFigures.size);
  return {chartCompletions,deepCharts,deepRows,deepFiguresSize:deepFigures.size};
}

export function taskSling60(){
  let boostedTransfers=0;const slingFailures=[];
  for(let seed=1;seed<=60;seed++){
    const w=new OrbitWorld(seed,440,860);w.start();let expected=null,boosts=0;
    for(let i=0;i<120*240&&w.state==='playing'&&w.progress<48;i++){
      if(w.player.node){
        if(expected!==null){assert.equal(w.player.node.id,expected,'A charged guide must lead to the advertised landing');boosts++;expected=null;}
        const n=w.player.node,row=Math.floor(w.progress)+1;
        const target=n.shortcut?w.nodes.find(q=>q.id===n.shortcutId):w.nodes.find(q=>q.row===row&&q.routeRole==='star')||w.nodes.find(q=>q.row===row&&q.type!=='gold');
        const aim=w.aim();
        if(aim&&!aim.steep&&target&&aim.n.id===target.id&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(n.type!=='sling'||w.charge()===1)){
          if(n.shortcut)expected=target.id;
          w.release();
        }
      }
      w.update(step);
    }
    if(expected!==null&&w.player.node?.id===expected)boosts++;
    boostedTransfers+=boosts;
    if(w.progress<48||boosts!==6)slingFailures.push({seed,progress:w.progress,boosts,reason:w.reason});
  }
  assert.equal(slingFailures.length,0,'Charged shortcuts must remain playable: '+JSON.stringify(slingFailures));
  return {boostedTransfers};
}

// The daily plate's varyOpening lets a seed draw the second and third planets and all twelve regions'
// figures itself instead of reading the same fixed values every other chart opens on (see the
// constructor and catalogueFor() in src/simulation.js). It reuses the same formula every later planet
// already trusted, so this checks two things rather than re-proving the formula: that the opening
// actually varies from one seed to the next, and that a course drawn this way is exactly as playable
// through the same depth an ordinary seed already is.
export function taskVariedOpening(){
  let totalCaptures=0;const failures=[];
  const opens=[],firstFigures=new Set();
  for(let seed=1;seed<=20;seed++){
    const w=new OrbitWorld(seed,440,860,()=>{},false,true);
    opens.push({x1:w.nodes.find(n=>n.row===1).x,x2:w.nodes.find(n=>n.row===2).x});
    firstFigures.add(w.catalogueFor(0));
    // No figure may repeat before all twelve have been drawn, exactly as an ordinary seed's later
    // regions already promise — only now the promise covers the first four regions too.
    const order=Array.from({length:12},(_,r)=>w.catalogueFor(r));
    assert.equal(new Set(order).size,12,'A varied opening must still draw all twelve figures before any repeats: seed '+seed);
    assert.equal(w.catalogueFor(12),order[0],'The thirteenth region must repeat the first exactly as an ordinary seed\'s does');
    w.start();
    for(let i=0;i<120*220&&w.state==='playing'&&w.progress<40;i++){
      if(w.player.node){
        const aim=w.aim();
        if(aim&&!aim.steep&&aim.n.type!=='gold'&&aim.n.row===Math.floor(w.progress)+1&&(aim.perfect||w.player.orbitSweep>Math.PI*3)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))w.release();
      }
      w.update(step);
      assert(Number.isFinite(w.player.x)&&Number.isFinite(w.player.y));
    }
    totalCaptures+=w.captures;
    if(w.progress<40)failures.push({seed,progress:w.progress,reason:w.reason});
  }
  assert.equal(failures.length,0,'A varied opening must stay exactly as playable as a fixed one: '+JSON.stringify(failures));
  assert(new Set(opens.map(o=>o.x1)).size>1&&new Set(opens.map(o=>o.x2)).size>1,'The second and third planets must actually move from one seed to the next');
  assert(firstFigures.size>1,'The first region\'s own figure must actually vary from one seed to the next');
  return {totalCaptures,variedOpenings:opens.length,variedFigures:firstFigures.size};
}
