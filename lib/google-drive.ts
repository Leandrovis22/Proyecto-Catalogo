import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

/**
 * Obtiene un cliente autenticado de Google Drive
 */
export function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export interface DriveImage {
  id: string;
  name: string;
  md5Checksum: string;
  mimeType: string;
  size: string;
}

/**
 * Lista todas las imágenes en una carpeta de Google Drive
 */
export async function listDriveImages(
  folderId: string
): Promise<DriveImage[]> {
  const drive = getDriveClient();

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/webp') and trashed=false`,
      fields: 'files(id, name, md5Checksum, mimeType, size)',
      pageSize: 1000,
    });

    return (response.data.files || []) as DriveImage[];
  } catch (error) {
    console.error('Error listing Drive images:', error);
    throw new Error('Failed to list images from Google Drive');
  }
}

/**
 * Descarga una imagen de Google Drive
 */
export async function downloadDriveImage(
  fileId: string
): Promise<ArrayBuffer> {
  const drive = getDriveClient();

  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    return response.data as ArrayBuffer;
  } catch (error) {
    console.error(`Error downloading Drive image ${fileId}:`, error);
    throw new Error(`Failed to download image ${fileId} from Google Drive`);
  }
}

/**
 * Obtiene metadata de un archivo de Drive
 */
export async function getDriveFileMetadata(fileId: string) {
  const drive = getDriveClient();

  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, md5Checksum, mimeType, size',
    });

    return response.data;
  } catch (error) {
    console.error(`Error getting Drive file metadata ${fileId}:`, error);
    throw new Error(`Failed to get metadata for file ${fileId}`);
  }
}

/**
 * Extrae el slug del nombre del archivo
 * Ej: "cadenas-acero-gruesas.jpg" → "cadenas-acero-gruesas"
 */
export function extractSlugFromFilename(filename: string): string {
  return filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
}
