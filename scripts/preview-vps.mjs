import http from 'node:http';
import {readFile} from 'node:fs/promises';
import worker from '../src/worker.mjs';
const types = {css:'text/css',js:'text/javascript',svg:'image/svg+xml'};
const env = {ASSETS:{async fetch(request) {
  const path = new URL(request.url).pathname;
  try {return new Response(await readFile(`public${path}`),{headers:{'content-type':types[path.split('.').pop()] || 'text/plain'}});}
  catch {return new Response('Not found',{status:404});}
}}};
http.createServer(async (req,res) => {
  try {
    const response = await worker.fetch(new Request(`https://jornaldocinema.com.br${req.url}`,{method:req.method}),env);
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {res.writeHead(500);res.end('Preview failed');}
}).listen(3210,'0.0.0.0',() => console.log('VPS preview on port 3210'));
