const { google } = require('googleapis');
const http = require('http');
const url = require('url');

// REEMPLAZA ESTOS VALORES
const CLIENT_ID = "xxx";
const CLIENT_SECRET = "xxx";
const REDIRECT_URI = 'http://localhost:3000/api/google-drive/callback'; // ✅ Coincide con Google Cloud

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file'
];

async function getRefreshToken() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\n🔗 Abre esta URL en tu navegador:\n');
  console.log(authUrl);
  console.log('\n');

  // Crear servidor en puerto 3000 con ruta /api/google-drive/callback
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url.startsWith('/api/google-drive/callback')) {
        const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
        const code = qs.get('code');

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>Autenticación Exitosa</title></head>
            <body style="font-family: Arial; padding: 50px; text-align: center;">
              <h1>✅ Autenticación exitosa!</h1>
              <p>Puedes cerrar esta ventana y volver a la terminal.</p>
            </body>
            </html>
          `);
          
          server.close();

          // Intercambiar código por tokens
          const { tokens } = await oauth2Client.getToken(code);
          
          console.log('\n✅ ¡Refresh Token obtenido!\n');
          console.log('📋 Copia este valor a tu .env.local:\n');
          console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
          
          if (!tokens.refresh_token) {
            console.log('⚠️  No se obtuvo refresh_token.');
            console.log('💡 Solución:');
            console.log('   1. Ve a https://myaccount.google.com/permissions');
            console.log('   2. Elimina el acceso a tu app');
            console.log('   3. Vuelve a ejecutar este script\n');
          } else {
            console.log('✨ Todo listo! Copia el token a tu archivo .env.local\n');
          }
          
          process.exit(0);
        }
      } else {
        res.writeHead(404);
        res.end('Ruta no encontrada');
      }
    } catch (e) {
      console.error('\n❌ Error:', e.message);
      res.writeHead(500);
      res.end('Error en la autenticación');
      server.close();
      process.exit(1);
    }
  });

  server.listen(3000, () => {
    console.log('🚀 Servidor escuchando en http://localhost:3000');
    console.log('   Esperando autorización en /api/google-drive/callback...\n');
  });
}

// Validar que CLIENT_ID y CLIENT_SECRET estén configurados
if (CLIENT_ID === 'TU_CLIENT_ID_AQUI' || CLIENT_SECRET === 'TU_CLIENT_SECRET_AQUI') {
  console.error('❌ ERROR: Debes reemplazar CLIENT_ID y CLIENT_SECRET en el script!');
  process.exit(1);
}

getRefreshToken();