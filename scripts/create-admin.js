require('dotenv').config({ path: '.env.local' });
const { hash } = require('bcryptjs');
const { nanoid } = require('nanoid');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL_DEFAULT || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD_DEFAULT || 'admin123';
  
  const passwordHash = await hash(password, 10);
  const id = nanoid();
  const createdAt = Math.floor(Date.now() / 1000);

  console.log('\n📝 SQL Query para crear usuario administrador:\n');
  console.log('--------------------------------------------------');
  console.log(`INSERT INTO users (id, email, password_hash, role, created_at)`);
  console.log(`VALUES ('${id}', '${email}', '${passwordHash}', 'admin', ${createdAt});`);
  console.log('--------------------------------------------------\n');
  
  console.log('📋 Ejecuta este comando en tu terminal:\n');
  console.log('Para desarrollo local:');
  console.log(`wrangler d1 execute catalogo-db --local --command="INSERT INTO users (id, email, password_hash, role, created_at) VALUES ('${id}', '${email}', '${passwordHash}', 'admin', ${createdAt});"\n`);
  
  console.log('Para producción:');
  console.log(`wrangler d1 execute catalogo-db --command="INSERT INTO users (id, email, password_hash, role, created_at) VALUES ('${id}', '${email}', '${passwordHash}', 'admin', ${createdAt});"\n`);
  
  console.log('✅ Credenciales de acceso:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);
}

createAdmin().catch(console.error);
