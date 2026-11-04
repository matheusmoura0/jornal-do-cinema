import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('public', {recursive:true});
for (const file of ['styles.css', 'app.js']) await copyFile(file, `public/${file}`);
await cp('icons', 'public/icons', {recursive:true});
