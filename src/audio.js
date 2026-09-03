'use strict';
/* Orbit · src/audio.js
   Procedural sound: soft glass, brushed noise, and low strings. */
// ---------- Procedural sound: soft glass, brushed noise, and low strings ----------
class OrbitAudio {
  constructor(enabled){this.enabled=enabled;this.ctx=null;}
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
  start(){this.tone(196,.8,0,.3);this.tone(293.66,.7,.11,.22);this.tone(440,.9,.22,.16);}
  release(){this.tone(330,.11,0,.25,'sine',190);this.brush(2100,.17);}
  capture(row,perfect){const notes=[220,261.63,293.66,349.23,392,440,523.25];const n=notes[Math.floor(row)%notes.length];this.tone(n,.58,0,.5);this.tone(n*2,.4,.025,.15);if(perfect){this.tone(n*1.5,.7,.08,.2);this.tone(n*2,.6,.14,.12);}this.brush(3500,.14);}
  death(){this.tone(146.8,.9,0,.7,'sine',38);this.tone(73.4,1.2,0,.45,'triangle',30);this.brush(380,.7);}
}

