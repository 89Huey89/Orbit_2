'use strict';
/* Orbit · src/audio.js
   Procedural sound: soft glass, brushed noise, and low strings, heard in a small room. */
// ---------- Procedural sound: soft glass, brushed noise, and low strings ----------
// Every sound below is the atlas's own by default; an era with a different instrument in hand
// registers a row of numbers or a painter function under its own name (see defineHand()/handFor() in
// src/plates.js) and the method reads it, rather than forking on which plate is on the press itself.
// audio.js is loaded before plates.js (see the <script> order in src/index.html), so handFor isn't a
// global yet at class definition time, and every read below is guarded with the same
// `typeof handFor==='function'` test used wherever a file this early has to reach for a global that
// arrives later. Keeping the read inside the method means the ~30 audio.* call sites through
// src/ui.js never have to know which plate is on the press; the one exception is the sistrum, which
// needed a dedicated method, so its one call site (the constellation fanfare) was changed to call it
// instead of looping tone() itself.
// The atlas's own scratch() row — the numbers a grain of filtered noise is drawn from — kept as a
// named default rather than a literal, so an era with a different instrument in hand can register a
// row of its own (see defineHand('ceiling',...) in src/ceiling.js) without forking the method itself.
// The two instruments tone() plays, by the wave a call site asks for. Glass rings nearly harmonic, a
// touch stretched, with a slow beat between two close fundamentals; the string is harmonic and plucked,
// its brightness gone within the first third of the note.
const TIMBRES={
  sine:{ratio:[1,2.003,3.012,4.17,5.43],amp:[1,.34,.15,.07,.04],decay:[1,.62,.4,.27,.19],twin:1.0017,lift:1.6,attack:.004,strike:[5,.012,.18]},
  triangle:{ratio:[1,2,3,4,5,6,7],amp:[1,.5,.33,.22,.15,.1,.07],decay:[1,.72,.5,.38,.3,.24,.2],lift:1.4,attack:.003,strike:[8,.02,.22]}
};
const QUILL={band:[2800,2800],q:[1,2],peak:.07,attack:.003,dur:[.018,.024],gap:[.024,.045],ease:.012};
class OrbitAudio {
  constructor(enabled){this.enabled=enabled;this.ctx=null;this.scratchNext=0;}
  unlock(){
    try{
      if(!this.ctx){
        const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
        this.ctx=new AC();const c=this.ctx,sr=c.sampleRate;
        // Every voice meets in master, which is still the one volume the sound switch turns; from
        // there the sound goes out twice, dry and through a small room, and both pass one gentle
        // compressor so that a capture landing on a chime never sums into a clip.
        this.master=c.createGain();this.master.gain.value=this.enabled?.16:0;
        const comp=c.createDynamicsCompressor();comp.threshold.value=-20;comp.knee.value=14;comp.ratio.value=3;comp.attack.value=.004;comp.release.value=.22;
        this.master.connect(comp);comp.connect(c.destination);
        if(c.createConvolver){const verb=c.createConvolver(),wet=c.createGain();verb.buffer=this.room();wet.gain.value=.26;this.master.connect(verb);verb.connect(wet);wet.connect(comp);}
        // Pink rather than white: white noise puts half its energy above the top octave, which is why
        // every brush and quill grain read as a hiss rather than as a bristle or a nib on paper. A full
        // second of it, so that no two grains need ever start on the same sample.
        this.noise=c.createBuffer(1,sr,sr);
        const data=this.noise.getChannelData(0),rng=seeded(8124);let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,sum=0;
        for(let i=0;i<data.length;i++){const w=rng()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;data[i]=b0+b1+b2+b3+b4+b5+b6+w*.5362;b6=w*.115926;sum+=data[i]*data[i];}
        const k=.2/Math.sqrt(sum/data.length);for(let i=0;i<data.length;i++)data[i]*=k;
      }
      if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});
    }catch(_){this.ctx=null;}
  }
  // The room every sound is heard in: a second and a bit of decaying seeded noise, a different draw
  // on each side, darkened as it dies because a real room swallows the treble first. Built once, at
  // unlock, rather than shipped as a sample.
  room(){
    const c=this.ctx,sr=c.sampleRate,n=Math.floor(sr*1.3),pre=Math.floor(sr*.014),b=c.createBuffer(2,n,sr);
    for(let ch=0;ch<2;ch++){
      const d=b.getChannelData(ch),rng=seeded(4409+ch*977);let lp=0;
      for(let i=pre;i<n;i++){const t=(i-pre)/sr,a=Math.min(.92,.18+t*1.1);lp=lp*a+(rng()*2-1)*(1-a);d[i]=lp*Math.exp(-t/.19)*(3-2*Math.min(1,t*4));}
    }
    return b;
  }
  toggle(){this.enabled=!this.enabled;this.unlock();if(this.ctx)this.master.gain.setTargetAtTime(this.enabled?.16:0,this.ctx.currentTime,.04);}
  // A note is never one oscillator. The atlas's sine is a struck glass and its triangle a plucked low
  // string: each a handful of partials that ring down at their own rates, the upper ones first, so the
  // note darkens as it dies, opened by a few milliseconds of struck noise. No two strikes are quite
  // alike, a few cents and a decibel either way. A note that sits below the register a phone's speaker
  // can sound keeps its upper partials louder, since those are all the hand ever hears of it and the ear
  // puts the missing fundamental back from them.
  tone(hz,length=.35,delay=0,volume=.5,wave='sine',endHz=hz){
    if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime+delay,voice=TIMBRES[wave],cents=Math.pow(2,(Math.random()*2-1)*6/1200);
    volume*=.88+Math.random()*.24;hz*=cents;endHz*=cents;
    if(!voice){this.partial(hz,endHz,wave,t,length,volume,.007);return;}
    const lift=clamp((340-hz)/220,0,1),amps=voice.amp.map((a,i)=>i?a*(1+lift*voice.lift):a),norm=1/Math.sqrt(amps.reduce((s,a)=>s+a*a,0));
    voice.ratio.forEach((r,i)=>{if(hz*r<15000)this.partial(hz*r,endHz*r,'sine',t,length*voice.decay[i],volume*amps[i]*norm,voice.attack);});
    if(voice.twin)this.partial(hz*voice.twin,endHz*voice.twin,'sine',t,length*.9,volume*norm*.45,voice.attack);
    this.strike(Math.min(7000,Math.max(900,hz*voice.strike[0])),voice.strike[1],t,volume*voice.strike[2]);
  }
  partial(hz,endHz,wave,t,length,volume,attack){
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=wave;o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,endHz),t+length);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+attack);g.gain.exponentialRampToValueAtTime(.0008,t+length);
    o.connect(g);g.connect(this.master);o.start(t);o.stop(t+length+.03);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  // The contact itself: a sliver of filtered noise, the rim struck or the string caught.
  strike(freq,dur,t,volume){
    const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    s.buffer=this.noise;f.type='bandpass';f.frequency.value=freq;f.Q.value=1.4;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.0015);g.gain.exponentialRampToValueAtTime(.0006,t+dur);
    s.connect(f);f.connect(g);g.connect(this.master);s.start(t,Math.random()*(this.noise.duration-dur-.01),dur+.01);
    s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};
  }
  brush(freq=1300,volume=.25){
    if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime,s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    s.buffer=this.noise;f.type='bandpass';f.frequency.value=freq*(.93+Math.random()*.14);f.Q.value=1.1;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume*1.35,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+.2);
    s.connect(f);f.connect(g);g.connect(this.master);s.start(t,Math.random()*(this.noise.duration-.22),.21);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};
  }
  // A quill dragging on paper: tiny random grains of filtered noise, not a looped sample, so there is
  // no seam to hear. Called every frame while a line is being drawn; it self-schedules the next grain
  // and simply does nothing on the frames between, faster and a touch louder the harder the line
  // bites.
  scratch(active,speed=0){
    if(!active||!this.ctx||!this.enabled||this.ctx.state!=='running'){this.scratchNext=0;return;}
    const t=this.ctx.currentTime;if(t<this.scratchNext)return;
    const row=(typeof handFor==='function'&&handFor('scratch'))||QUILL;
    const level=clamp((speed-BASE_SPEED)/(MAX_SPEED-BASE_SPEED),0,1);
    const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    s.buffer=this.noise;f.type='bandpass';
    f.frequency.value=row.band[0]+Math.random()*row.band[1];f.Q.value=row.q[0]+Math.random()*row.q[1];
    const peak=row.peak+level*.05+Math.random()*.03,dur=row.dur[0]+Math.random()*row.dur[1];
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+row.attack);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
    s.connect(f);f.connect(g);g.connect(this.master);
    s.start(t,Math.random()*(this.noise.duration-dur-.01),dur);
    s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};
    this.scratchNext=t+row.gap[0]+Math.random()*row.gap[1]-level*row.ease;
  }
  // A run's first chord and the tap that lets go are the atlas's own unless the plate in hand registers
  // its own painter for them, exactly as capture/death/medal below already do.
  start(){
    const own=typeof handFor==='function'&&handFor('start');
    if(own){own(this);return;}
    this.tone(196,.8,0,.3);this.tone(293.66,.7,.11,.22);this.tone(440,.9,.22,.16);
  }
  release(){
    const own=typeof handFor==='function'&&handFor('release');
    if(own){own(this);return;}
    this.tone(330,.11,0,.25,'sine',190);this.brush(2100,.17);
  }
  // A plucked string — the angular harp and the lyre of the New Kingdom's banquet scenes, played for
  // the Ceiling. The string is its fundamental and two overtones that die away faster than it does,
  // a hair out of tune with each other the way gut strings are, over the short dry click of the finger
  // leaving the string. Nothing here is sampled; like every other sound in this file it is built on the
  // spot from oscillators and the one buffer of noise.
  pluck(hz,length=1.1,delay=0,volume=.4){
    if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
    this.tone(hz,length,delay,volume,'triangle',hz*.998);
    this.tone(hz*2.004,length*.45,delay,volume*.32,'sine');
    this.tone(hz*3.01,length*.22,delay,volume*.14,'sine');
    const t=this.ctx.currentTime+delay,s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    s.buffer=this.noise;f.type='bandpass';f.frequency.value=Math.min(6000,hz*6);f.Q.value=2.2;
    g.gain.setValueAtTime(volume*.5,t);g.gain.exponentialRampToValueAtTime(.0006,t+.035);
    s.connect(f);f.connect(g);g.connect(this.master);s.start(t,0,.05);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};
  }
  // A frame drum struck with the flat of the hand: a low body falling in pitch as the skin settles,
  // under a short muffled slap of noise.
  drum(hz=96,delay=0,volume=.5){
    if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
    this.tone(hz,.42,delay,volume,'sine',hz*.55);
    const t=this.ctx.currentTime+delay,s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    s.buffer=this.noise;f.type='lowpass';f.frequency.value=520;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume*.8,t+.004);g.gain.exponentialRampToValueAtTime(.0006,t+.12);
    s.connect(f);f.connect(g);g.connect(this.master);s.start(t,0,.14);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};
  }
  // Moving water: the noise swelled up and let fall through a low filter sweeping downward, the sound
  // of an oar's stroke or, drawn out and deeper, of water closing over something.
  wash(from=1400,to=300,length=.5,volume=.3,delay=0){
    if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime+delay,f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();f.type='lowpass';f.Q.value=.7;
    f.frequency.setValueAtTime(from,t);f.frequency.exponentialRampToValueAtTime(Math.max(60,to),t+length);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+length*.3);g.gain.exponentialRampToValueAtTime(.0006,t+length);
    f.connect(g);g.connect(this.master);
    // The noise buffer is shorter than a long wash, so the swell is laid from as many copies as it needs.
    const n=Math.ceil(length/(this.noise.duration*.9));
    for(let i=0;i<n;i++){const s=this.ctx.createBufferSource();s.buffer=this.noise;s.connect(f);s.start(t+i*this.noise.duration*.9);s.onended=()=>s.disconnect();}
    setTimeout(()=>{f.disconnect();g.disconnect();},(delay+length+.2)*1000);
  }
  // A landing on the atlas rings a note off the row's own scale, and a perfect transfer adds the
  // atlas's second chime; an era with its own instrument registers a capture painter to replace both.
  capture(row,perfect){
    const own=typeof handFor==='function'&&handFor('capture');
    if(own){own(this,row,perfect);return;}
    const notes=[220,261.63,293.66,349.23,392,440,523.25];const n=notes[Math.floor(row)%notes.length];this.tone(n,.58,0,.5);this.tone(n*2,.4,.025,.15);if(perfect){this.tone(n*1.5,.7,.08,.2);this.tone(n*2,.6,.14,.12);}this.brush(3500,.14);
  }
  // The atlas dies to a dying chord; an era with its own instrument registers a death painter to
  // replace it.
  death(){
    const own=typeof handFor==='function'&&handFor('death');
    if(own){own(this);return;}
    this.tone(146.8,.9,0,.7,'sine',38);this.tone(73.4,1.2,0,.45,'triangle',30);this.brush(380,.7);
  }
  // The naos sistrum's loop of loose metal disks: a tight burst of short high grains, each a metallic
  // tone paired a beat later with a sliver of bright filtered noise, close enough together to read as
  // one shake rather than a run of separate notes. The one era sound with no shared primitive to
  // retime — every other era sound above is tone/brush/scratch with different numbers.
  sistrum(){
    if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime,notes=[2637.02,3135.96,3520,4186.01];
    for(let i=0;i<6;i++){
      const delay=i*.05+Math.random()*.015;
      this.tone(notes[i%notes.length]*(1+Math.random()*.02),.09,delay,.09,'triangle');
      const f=this.ctx.createBiquadFilter(),g=this.ctx.createGain(),s=this.ctx.createBufferSource(),at=t+delay+.01;
      s.buffer=this.noise;f.type='highpass';f.frequency.value=4200+Math.random()*2400;
      g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.11,at+.004);g.gain.exponentialRampToValueAtTime(.0006,at+.07);
      s.connect(f);f.connect(g);g.connect(this.master);s.start(at,0,.08);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};
    }
  }
  // The constellation fanfare: the atlas's own rising three-note chime. The one ui.js call site that
  // could not just read a row or call a registered painter directly, since the atlas's version is
  // three separately-delayed tone() calls rather than one method, so it stays a method here for an
  // era's own registration to call into instead.
  medal(){
    const own=typeof handFor==='function'&&handFor('medal');
    if(own){own(this);return;}
    this.tone(261.63,1.1,0,.24);this.tone(329.63,1.1,.14,.24);this.tone(392,1.1,.28,.24);
  }
}

