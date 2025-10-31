const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('dev.db');

// Usuario admin
const hashedPassword = bcrypt.hashSync('admin123', 10);
db.prepare(`
  INSERT INTO users (name, email, phone, password, role, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`).run('Admin', 'admin@example.com', '123456789', hashedPassword, 'admin', Date.now());

// Producto de ejemplo
db.prepare(`
  INSERT INTO products (slug, name, description, categories, price, stock, show_in_store, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'producto-demo',
  'Producto Demo',
  'Descripción de prueba',
  JSON.stringify(['Demo']),
  1000,
  10,
  1,
  Date.now()
);

console.log('✅ Usuario admin y producto demo creados');
db.close();
