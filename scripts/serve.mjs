/* Development server: serves the repository root so http://localhost:PORT/src/ runs the module
   template directly and http://localhost:PORT/dist/ serves the last build. Node built-ins only. */
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {join,extname,normalize} from 'node:path';
const root=new URL('..',import.meta.url).pathname;
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
createServer(async(req,res)=>{
  try{
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path==='/')path='/src/';
    if(path.endsWith('/'))path+='index.html';
    const file=normalize(join(root,path));
    if(!file.startsWith(root))throw new Error('outside root');
    await stat(file);
    res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});
    res.end(await readFile(file));
  }catch(_){res.writeHead(404);res.end('Not found');}
}).listen(port,()=>console.log(`Orbit dev server: http://localhost:${port}/src/  (build output at /dist/ after npm run build)`));
