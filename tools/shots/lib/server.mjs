/* Orbit · tools/shots/lib/server.mjs
   The same repository-root static server scripts/serve.mjs runs for `npm start`, but started on a free
   port and handed back to the caller, so a capture never collides with a dev server already running. */
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {join,extname,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT=fileURLToPath(new URL('../../../',import.meta.url));
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf'};

export function startServer({port=0}={}){
  const server=createServer(async(req,res)=>{
    try{
      let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(path==='/')path='/src/';
      if(path.endsWith('/'))path+='index.html';
      const file=normalize(join(ROOT,path));
      if(!file.startsWith(ROOT))throw new Error('outside root');
      await stat(file);
      res.writeHead(200,{'content-type':TYPES[extname(file)]||'application/octet-stream','cache-control':'no-store'});
      res.end(await readFile(file));
    }catch(_){res.writeHead(404);res.end('Not found');}
  });
  return new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(port,'127.0.0.1',()=>{
      const url=`http://127.0.0.1:${server.address().port}`;
      resolve({url,close:()=>new Promise(r=>server.close(()=>r()))});
    });
  });
}
