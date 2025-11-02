const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/60eb755a5e57cbc02def8d3735fd2d41a57117937eb255b5c776679a855aca2e.sqlite');

const db = new Database(dbPath);

console.log('\n=== SLUGS DE PRODUCTOS ===');
const slugs = db.prepare('SELECT DISTINCT slug FROM products ORDER BY slug').all();
slugs.forEach(s => console.log('-', s.slug));

console.log('\n\n=== VERIFICAR COINCIDENCIAS ===');
// De los logs vimos que se sincronizó: cadenas-acero-blanco-y-dorado-planas-25-10-12-19-48.jpg
const testSlug = 'cadenas-acero-blanco-y-dorado-planas-25-10-12-19-48';
const match = db.prepare('SELECT id, slug, name, image_url FROM products WHERE slug = ?').all(testSlug);
console.log(`Productos con slug "${testSlug}":`);
console.table(match);

db.close();
