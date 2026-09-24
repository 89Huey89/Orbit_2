/* Orbit · tools/shots/lib/viewports.mjs
   Named sheets to pull a capture on. The iPhone 15 Pro Max is the reference sheet (CLAUDE.md, "Target
   viewport") and is the default; the rest are there to check a change holds at the edges of what the
   game is actually played on. Add a row here to make a new name available to --viewport; any
   WIDTHxHEIGHT[@SCALE] string works without one. */
export const VIEWPORTS={
  'iphone-15-pro-max':{width:430,height:932,scale:3,mobile:true,touch:true,note:'the reference sheet'},
  'iphone-15':{width:393,height:852,scale:3,mobile:true,touch:true},
  'iphone-se':{width:375,height:667,scale:2,mobile:true,touch:true,note:'the shortest phone still in hand'},
  'pixel-7':{width:412,height:915,scale:2.625,mobile:true,touch:true},
  'galaxy-fold':{width:344,height:882,scale:3,mobile:true,touch:true,note:'the narrowest'},
  'phone-landscape':{width:932,height:430,scale:3,mobile:true,touch:true},
  'ipad-mini':{width:744,height:1133,scale:2,mobile:true,touch:true},
  'laptop':{width:1440,height:900,scale:2,mobile:false,touch:false,note:'wide-sheet marginalia'},
  'desktop':{width:1920,height:1080,scale:1,mobile:false,touch:false},
  'ultrawide':{width:2560,height:1080,scale:1,mobile:false,touch:false}
};
export const DEFAULT_VIEWPORT='iphone-15-pro-max';
// Short names a hand types most often.
const ALIASES={phone:'iphone-15-pro-max',ref:'iphone-15-pro-max',reference:'iphone-15-pro-max',se:'iphone-se',fold:'galaxy-fold',landscape:'phone-landscape',ipad:'ipad-mini',tablet:'ipad-mini',wide:'laptop'};

// Resolves a name, an alias, or WIDTHxHEIGHT[@SCALE] into {id,width,height,scale,mobile,touch}. A
// custom size under 800 CSS px wide is treated as a phone, since that is what this game is sized for.
export function resolveViewport(spec,overrideScale){
  const key=ALIASES[spec]||spec;
  let vp;
  if(VIEWPORTS[key])vp={id:key,...VIEWPORTS[key]};
  else{
    const m=/^(\d+)x(\d+)(?:@([\d.]+))?$/.exec(String(spec));
    if(!m)throw new Error(`Unknown viewport "${spec}". Use one of: ${Object.keys(VIEWPORTS).join(', ')} — or WIDTHxHEIGHT[@SCALE].`);
    const width=+m[1],height=+m[2],mobile=Math.min(width,height)<800;
    vp={id:`${width}x${height}${m[3]?'@'+m[3]:''}`,width,height,scale:m[3]?+m[3]:(mobile?3:1),mobile,touch:mobile};
  }
  if(overrideScale)vp.scale=overrideScale;
  return vp;
}
