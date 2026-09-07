import fs from 'node:fs/promises';
const ids = [
  'photo-1504279577054-acfeccf8fc52',
  'photo-1510812431401-41d2bd2722f3',
  'photo-1414235077428-338989a2e8c0',
  'photo-1464822759023-fed622ff2c3b',
];
await fs.mkdir('public/images', { recursive: true });
for (const id of ids) {
  const r = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=85`);
  if (!r.ok) throw new Error(`${id}: ${r.status}`);
  await fs.writeFile(`public/images/${id}.jpg`, Buffer.from(await r.arrayBuffer()));
  console.log(`Downloaded ${id}`);
}
