import { mkdir, copyFile, cp, readFile, writeFile } from 'node:fs/promises';
import MarkdownIt from 'markdown-it';
const markdown = new MarkdownIt({html:false,linkify:false});
const manifest = JSON.parse(await readFile('content/guides.json','utf8'));
const guides = [];
for (const guide of manifest) {
  if (guide.approved !== true) continue;
  const tokens = markdown.parse(await readFile(guide.file,'utf8'),{});
  const body = [];
  for (let i=0;i<tokens.length;i++) {
    if (tokens[i].type === 'heading_open' && tokens[i].tag === 'h1') {i+=2;continue;}
    if (tokens[i].type === 'paragraph_open' && /^(Status:|Resumo proposto:|Revisão necessária:)/.test(tokens[i+1]?.content || '')) {i+=2;continue;}
    body.push(tokens[i]);
  }
  const {file,approved,...metadata} = guide;
  guides.push({...metadata,html:markdown.renderer.render(body,markdown.options,{})});
}
await mkdir('.generated',{recursive:true});
await writeFile('.generated/guides.mjs',`export default ${JSON.stringify(guides)};\n`);
await mkdir('public', {recursive:true});
for (const file of ['styles.css', 'app.js']) await copyFile(file, `public/${file}`);
await cp('icons', 'public/icons', {recursive:true});
