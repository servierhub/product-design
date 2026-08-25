#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gif":"image/gif"};
function args(argv){const out={};for(let i=0;i<argv.length;i++){const a=argv[i];if(!a.startsWith("--"))continue;const [k,v]=a.slice(2).split("=",2);if(v!==undefined)out[k]=v;else if(argv[i+1]&&!argv[i+1].startsWith("--"))out[k]=argv[++i];else out[k]=true}return out}
const a=args(process.argv.slice(2)),root=path.resolve(String(a.root||"")),host=String(a.host||"127.0.0.1"),port=Number(a.port||4178);
if(!a.root||!existsSync(root)||!statSync(root).isDirectory()){console.error("Usage: node scripts/serve-journey-board.mjs --root review-dir [--port 4178]");process.exit(1)}
const server=createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url||"/","http://localhost").pathname);const relative=pathname==="/"?"index.html":pathname.replace(/^\/+/,"");const file=path.resolve(root,relative);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end("Forbidden");return}if(!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end("Not found");return}res.setHeader("Content-Type",types[path.extname(file).toLowerCase()]||"application/octet-stream");res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Content-Security-Policy","default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'");createReadStream(file).pipe(res)});
server.listen(port,host,()=>console.log(JSON.stringify({status:"ready",root,url:"http://"+host+":"+port+"/"})));process.on("SIGTERM",()=>server.close());process.on("SIGINT",()=>server.close());
