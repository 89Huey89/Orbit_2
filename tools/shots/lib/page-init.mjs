/* Orbit · tools/shots/lib/page-init.mjs
   Runs in the page before any of the game's own scripts (Playwright's addInitScript), and is the whole
   reason a capture is repeatable. It takes the page's clock away from the wall: requestAnimationFrame,
   performance.now, Date and Math.random all answer to a virtual clock and a seeded generator the
   harness advances by hand, so "four seconds into seed 7" is the same sheet on every machine however
   slowly that machine happens to paint it. It is a plain function so it can be serialised into the
   page; it must not close over anything from Node. */
export function pageInit({seed,epoch,storage}){
  // Storage first, so the game's first read of localStorage already sees the profile.
  try{localStorage.clear();for(const [k,v] of Object.entries(storage||{}))localStorage.setItem(k,String(v));}catch(_){}
  let now=0,queue=[],nextId=1,s=(seed>>>0)||1;
  // mulberry32: small, fast, and good enough for sparks and audio jitter.
  Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  const RealDate=Date;
  class VirtualDate extends RealDate{
    constructor(...a){if(a.length)super(...a);else super(epoch+now);}
    static now(){return epoch+now;}
  }
  window.Date=VirtualDate;
  try{Object.defineProperty(performance,'now',{value:()=>now,configurable:true});}catch(_){}
  window.requestAnimationFrame=cb=>{const id=nextId++;queue.push([id,cb]);return id;};
  window.cancelAnimationFrame=id=>{queue=queue.filter(e=>e[0]!==id);};
  const errors=[];
  window.addEventListener('error',e=>errors.push(String(e.error&&e.error.stack||e.message)));
  window.addEventListener('unhandledrejection',e=>errors.push('unhandled rejection: '+String(e.reason&&e.reason.stack||e.reason)));
  const shots=window.__shots={
    errors,
    hooks:[],         // functions run before every frame: the pilot lives here
    now:()=>now,
    // One presented frame: the clock moves on by ms and every callback queued for it runs.
    frame(ms){
      for(const h of shots.hooks)h(now);
      now+=ms;const q=queue;queue=[];
      for(const [,cb] of q){try{cb(now);}catch(e){errors.push(String(e&&e.stack||e));}}
    },
    // Advances the page by `seconds` of play. With paint off, the game's own render() is swapped for a
    // no-op for all but the last `settle` seconds: the simulation, the trail and the reveals still step
    // every frame, but the costly part — painting a sheet nobody will look at — is skipped, which is
    // what makes a two-minute run take seconds rather than minutes on a software rasteriser.
    advance(seconds,{fps=60,paint=true,settle=.5}={}){
      const ms=1000/fps,n=Math.max(0,Math.round(seconds*fps)),quiet=paint?0:Math.max(0,n-Math.round(settle*fps));
      const real=window.render;
      try{
        if(quiet)window.render=function(){};
        for(let i=0;i<n;i++){if(i===quiet&&quiet)window.render=real;shots.frame(ms);}
      }finally{window.render=real;}
      return now;
    }
  };
}
