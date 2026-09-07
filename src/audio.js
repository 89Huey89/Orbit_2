'use strict';
/* Orbit · src/audio.js
   Procedural sound: soft glass, brushed noise, and low strings. */
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
const QUILL={band:[2800,2800],q:[1,2],peak:.07,attack:.003,dur:[.018,.024],gap:[.024,.045],ease:.012};
class OrbitAudio {
  constructor(enabled){this.enabled=enabled;this.ctx=null;this.scratchNext=0;}
  unlock(){
    try{
      if(!this.ctx){
        const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
        this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.enabled?.16:0;this.master.connect(this.ctx.destination);
        this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate*.22,this.ctx.sampleRate);
        const data=this.noise.getChannelData(0),rng=seeded(8124);for(let i=0;i<data.length;i++)data[i]=(rng()*2-1)*.35;
      }
      if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});
    }catch(_){this.ctx=null;}
  }
  toggle(){this.enabled=!this.enabled;this.unlock();if(this.ctx)this.master.gain.setTargetAtTime(this.enabled?.16:0,this.ctx.currentTime,.04);}
  tone(hz,length=.35,delay=0,volume=.5,wave='sine',endHz=hz){
    if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=wave;o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,endHz),t+length);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.007);g.gain.exponentialRampToValueAtTime(.001,t+length);
    o.connect(g);g.connect(this.master);o.start(t);o.stop(t+length+.02);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  brush(freq=1300,volume=.25){
    if(!this.ctx||!this.enabled||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime,s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    s.buffer=this.noise;f.type='bandpass';f.frequency.value=freq;f.Q.value=.65;g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);
    s.connect(f);f.connect(g);g.connect(this.master);s.start();s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};
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
  start(){this.tone(196,.8,0,.3);this.tone(293.66,.7,.11,.22);this.tone(440,.9,.22,.16);}
  release(){this.tone(330,.11,0,.25,'sine',190);this.brush(2100,.17);}
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

