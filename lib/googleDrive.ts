// Configuración base para Google Drive API
import { google } from 'googleapis';

export function getDriveClient() {
  return google.drive({ version: 'v3', auth: process.env.GOOGLE_API_KEY });
}

// TODO: Implementar lógica para obtener URLs públicas de imágenes
