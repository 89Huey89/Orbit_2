/* Orbit · scripts/glyphs.mjs
   Extracts the outlines of the letters the plate lettering actually sets — A–Z, the figures 0–9 (the Roman
   numerals I, V and X are among the capitals), the middle dot, the solidus and the space — from the two Fell
   faces embedded as base64 woff2 in assets/fonts.source.css, and writes src/glyphs.js.

   Every contour is flattened and then simplified to a tolerance of about a tenth of a pixel at the size the
   chapter lettering is set, which is what turns the traced Fell contours from hundreds of commands into a
   few dozen points. A glyph is stored as its advance width, the length of each contour, and one blob of
   coordinates: 512 units to the em, y up, taken as deltas from the pen's last point, zig-zagged and written
   five bits to a character. src/glyphs.js is committed, so the runtime, the build and CI never need this
   script or fontkit. Run it with `npm run glyphs` after changing the embedded faces.  */
import {readFile,writeFile} from 'node:fs/promises';
import * as fontkit from 'fontkit';

const root=new URL('../',import.meta.url);
const css=await readFile(new URL('assets/fonts.source.css',root),'utf8');
const FACES=[['text','IM Fell English','normal'],['sc','IM Fell English SC','normal']];
const CHARS=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',' ','·','/'];
const UNITS=512,TOLERANCE=1.2,FLATNESS=3;
const ALPHABET='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#';

function pack(value){
  let u=value<0?-2*value-1:2*value,out='';
  while(u>=32){out+=ALPHABET[(u&31)|32];u=Math.floor(u/32);}
  return out+ALPHABET[u];
}
function faceSource(family,style){
  const pattern=new RegExp("font-family:'"+family+"';font-style:"+style+";[^}]*?src:url\\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\\)");
  const found=css.match(pattern);
  if(!found)throw new Error('assets/fonts.css has no '+style+' '+family+' face.');
  return Buffer.from(found[1],'base64');
}
// Every command becomes points on the contour; curves are sampled about every FLATNESS units.
function flatten(commands,scale){
  const contours=[];let current=null,px=0,py=0,startX=0,startY=0;
  const push=(x,y)=>{const last=current[current.length-1];if(Math.hypot(x-last[0],y-last[1])>.05)current.push([x,y]);};
  for(const {command,args} of commands){
    const a=args.map(v=>v*scale);
    if(command==='moveTo'){current=[[a[0],a[1]]];contours.push(current);px=startX=a[0];py=startY=a[1];}
    else if(!current)continue;
    else if(command==='lineTo'){push(a[0],a[1]);px=a[0];py=a[1];}
    else if(command==='quadraticCurveTo'){
      const steps=Math.max(2,Math.ceil(Math.hypot(a[2]-px,a[3]-py)/FLATNESS));
      for(let i=1;i<=steps;i++){const t=i/steps,u=1-t;push(u*u*px+2*u*t*a[0]+t*t*a[2],u*u*py+2*u*t*a[1]+t*t*a[3]);}
      px=a[2];py=a[3];
    }else if(command==='bezierCurveTo'){
      const steps=Math.max(3,Math.ceil(Math.hypot(a[4]-px,a[5]-py)/FLATNESS));
      for(let i=1;i<=steps;i++){const t=i/steps,u=1-t;
        push(u*u*u*px+3*u*u*t*a[0]+3*u*t*t*a[2]+t*t*t*a[4],u*u*u*py+3*u*u*t*a[1]+3*u*t*t*a[3]+t*t*t*a[5]);}
      px=a[4];py=a[5];
    }else if(command==='closePath'){px=startX;py=startY;}
  }
  return contours;
}
// Douglas–Peucker: the traced Fell contours carry far more detail than the plate can print.
function simplify(points,tolerance){
  if(points.length<3)return points;
  const keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;
  const stack=[[0,points.length-1]];
  while(stack.length){
    const [a,b]=stack.pop();if(b-a<2)continue;
    const [ax,ay]=points[a],dx=points[b][0]-ax,dy=points[b][1]-ay,span=Math.hypot(dx,dy);
    let best=-1,far=tolerance;
    for(let i=a+1;i<b;i++){
      // A closed contour ends where it began, so the first baseline is a point, not a line.
      const d=span<1e-6?Math.hypot(points[i][0]-ax,points[i][1]-ay)
        :Math.abs((points[i][0]-ax)*dy-(points[i][1]-ay)*dx)/span;
      if(d>far){far=d;best=i;}
    }
    if(best>0){keep[best]=1;stack.push([a,best],[best,b]);}
  }
  return points.filter((_,i)=>keep[i]);
}

const faces={};let glyphCount=0,pointCount=0;
for(const [key,family,style] of FACES){
  const font=fontkit.create(faceSource(family,style));
  const scale=UNITS/font.unitsPerEm,set={};
  for(const char of CHARS){
    const glyph=font.glyphForCodePoint(char.codePointAt(0));
    if(!glyph)continue;
    const counts=[];let blob='',px=0,py=0;
    if(char!==' '){
      for(const contour of flatten(glyph.path.commands,scale)){
        const points=simplify(contour,TOLERANCE);
        if(points.length<3)continue;
        counts.push(points.length);
        for(const [x,y] of points){
          const qx=Math.round(x),qy=Math.round(y);
          blob+=pack(qx-px)+pack(qy-py);px=qx;py=qy;
        }
        pointCount+=points.length;
      }
    }
    set[char]=[Math.round(glyph.advanceWidth*scale),counts,blob];
    glyphCount++;
  }
  faces[key]={family,glyphs:set};
}

const lines=[];
lines.push("'use strict';");
lines.push('/* Orbit · src/glyphs.js');
lines.push('   Generated by scripts/glyphs.mjs from the Fell faces embedded in assets/fonts.css — do not edit by hand.');
lines.push('   Per glyph: [advance width, the point count of each contour, packed coordinates]. Coordinates are in font');
lines.push('   units at '+UNITS+' to the em, y up, stored as zig-zagged deltas five bits to a character. The chapter');
lines.push('   lettering strokes these contours on in the order of the pen before flooding the counters with ink. */');
lines.push('const FELL_GLYPHS={unitsPerEm:'+UNITS+',digits:'+JSON.stringify(ALPHABET)+',faces:{');
const faceLines=[];
for(const [key,face] of Object.entries(faces)){
  const entries=Object.entries(face.glyphs)
    .map(([char,[adv,counts,blob]])=>JSON.stringify(char)+':['+adv+',['+counts.join(',')+'],"'+blob+'"]');
  faceLines.push('  /* '+face.family+' */\n  '+key+':{\n    '+entries.join(',\n    ')+'\n  }');
}
lines.push(faceLines.join(',\n')+'\n}};');
const out=lines.join('\n')+'\n';
await writeFile(new URL('src/glyphs.js',root),out);
console.log('src/glyphs.js written: '+glyphCount+' glyphs from '+FACES.length+' faces, '+pointCount+' points at '+UNITS+
  ' units per em, '+out.length.toLocaleString()+' bytes.');
