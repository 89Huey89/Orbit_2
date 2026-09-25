// ---------- The relit surface: one small WebGL pass a plate can lay over its own ground ----------
// The whole sheet is Canvas 2D and stays so. What this adds is a single fragment shader run into an
// offscreen WebGL canvas of its own, which the 2D frame then lays down like any other image: a plate
// hands it height maps as byte textures and a light as uniforms, the shader answers with a shading
// layer, and the plate composites that over the ground it has already painted. Nothing else in the
// pipeline knows WebGL exists. Where it does not — an old browser, a lost context, the test suite's
// canvas stub — `relightSurface` returns null and the plate draws exactly what it drew before, so the
// relit surface is only ever an addition, never a dependency. See docs/ROCK-OVERHAUL.md, "Later: a
// shared relit surface", for why it is built generic rather than for one wall.
//
// It is also watched for cost. A surface that takes longer than RELIGHT_BUDGET_MS a frame on average,
// over enough frames to be sure, switches itself off for the rest of the session: the flame's moving
// shadows are worth something, but never a stutter in the hand.
const RELIGHT_BUDGET_MS=4,RELIGHT_WATCH=90;
// Every surface made, so the frame's own pacer (pacePresent, src/ui.js) can retire them all at once: the
// watch above sees only what a frame spends handing the work over, never the wait for it to come back or
// the one frame in ten it runs long, and the pacer sees exactly that — frames arriving late. A surface
// retired either way stays retired for the session.
const relightSurfaces=[];
function relightShed(){let shed=false;for(const s of relightSurfaces)if(s.ok){s.retire();shed=true;}return shed;}
function relightSurface(fragment){
  let canvas,gl;
  try{
    if(typeof WebGLRenderingContext==='undefined'||typeof document==='undefined')return null;
    canvas=document.createElement('canvas');
    gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false});
    if(!(gl instanceof WebGLRenderingContext))return null;
  }catch(e){return null;}
  const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const log=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(log||'shader');}return s;};
  let prog;
  try{
    prog=gl.createProgram();
    gl.attachShader(prog,shader(gl.VERTEX_SHADER,'attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}'));
    gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog)||'link');
  }catch(e){return null;}
  gl.useProgram(prog);
  // One triangle over the whole canvas: the cheapest way to run a fragment shader on every pixel.
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const aPos=gl.getAttribLocation(prog,'aPos');gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
  const locs=new Map(),loc=name=>{if(!locs.has(name))locs.set(name,gl.getUniformLocation(prog,name));return locs.get(name);};
  const textures=new Map();
  let lost=false,spent=0,frames=0,off=false;
  canvas.addEventListener&&canvas.addEventListener('webglcontextlost',e=>{lost=true;if(e.preventDefault)e.preventDefault();});
  const surface={
    canvas,
    get ok(){return !lost&&!off;},
    retire(){off=true;},
    // A height map, one byte a sample, as a single-channel texture filtered linearly: sampled between
    // its texels, so a map a quarter the size of the screen still gives a smooth slope to be lit.
    // `pair` packs two bytes a sample, high then low, for a map whose slope is lit and so cannot stand
    // the terracing 256 levels leave; linear filtering of the two channels is still linear in the value,
    // so the shader reads it back as L+A/256 between texels as well as on them.
    texture(name,unit,w,h,bytes,pair){
      let t=textures.get(name);if(!t){t=gl.createTexture();textures.set(name,t);}
      gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
      const f=pair?gl.LUMINANCE_ALPHA:gl.LUMINANCE;gl.texImage2D(gl.TEXTURE_2D,0,f,w,h,0,f,gl.UNSIGNED_BYTE,bytes);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.uniform1i(loc(name),unit);
    },
    // Runs the shader once at w×h device pixels. `uniforms` maps a name to a number or an array of
    // two to four numbers. Returns the canvas to composite, or null once the surface has been retired.
    render(w,h,uniforms){
      if(lost||off||gl.isContextLost())return null;
      const t0=typeof performance!=='undefined'?performance.now():0;
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      gl.viewport(0,0,w,h);
      for(const k in uniforms){const v=uniforms[k],l=loc(k);if(l===null)continue;
        if(typeof v==='number')gl.uniform1f(l,v);else if(v.length===2)gl.uniform2f(l,v[0],v[1]);else if(v.length===3)gl.uniform3f(l,v[0],v[1],v[2]);else gl.uniform4f(l,v[0],v[1],v[2],v[3]);}
      gl.drawArrays(gl.TRIANGLES,0,3);
      if(t0){spent+=performance.now()-t0;if(++frames>=RELIGHT_WATCH){if(spent/frames>RELIGHT_BUDGET_MS)off=true;spent=0;frames=0;}}
      return off?null:canvas;
    },
    // What the composite itself cost, counted against the same budget: on some devices the copy of the
    // WebGL canvas into the 2D one is where the time really goes, not the shader.
    charge(ms){spent+=ms;}
  };
  relightSurfaces.push(surface);
  return surface;
}
