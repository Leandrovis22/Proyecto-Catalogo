import { google } from 'googleapis';

interface DriveAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
}

export async function getProductImagesFromDrive(
  folderId: string,
  authConfig: DriveAuthConfig
) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      authConfig.clientId,
      authConfig.clientSecret,
      authConfig.redirectUri
    );
    oauth2Client.setCredentials({ refresh_token: authConfig.refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, webContentLink, webViewLink, thumbnailLink)',
      pageSize: 1000,
    });
    const files = Array.isArray(res.data.files) ? res.data.files : [];
    if (files.length === 0) {
      console.warn('⚠️ No se encontraron imágenes en Google Drive');
      return [];
    }
    console.log(`📸 ${files.length} imágenes encontradas en Google Drive`);
    return files
      .filter((file): file is {
        id: string;
        name: string;
        webContentLink?: string;
        webViewLink?: string;
        thumbnailLink?: string;
      } =>
        typeof file.id === 'string' && !!file.id && typeof file.name === 'string' && !!file.name
      )
      .map(file => {
        const slug = file.name.replace(/\.[^/.]+$/, '').toLowerCase().trim();
        let url = '';
        if (file.webContentLink) {
          url = file.webContentLink;
        } else if (file.thumbnailLink) {
          url = file.thumbnailLink.replace(/=s\d+/, '=s800');
        } else if (file.webViewLink) {
          url = file.webViewLink;
        }
        return {
          slug,
          googleDriveId: file.id,
          url,
          isPrimary: true,
          cachedAt: new Date(),
        };
      })
      .filter(img => img.url);
  } catch (error) {
    console.error('❌ Error accediendo a Google Drive:', error);
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        throw new Error('Refresh token inválido o expirado. Genera uno nuevo desde Google Cloud Console.');
      }
      if (error.message.includes('insufficient permissions')) {
        throw new Error('Permisos insuficientes. Verifica los scopes de la API.');
      }
      if (error.message.includes('quota')) {
        throw new Error('Límite de cuota de Google Drive excedido. Intenta más tarde.');
      }
    }
    throw error;
  }
}

export function getPublicDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function getDriveThumbnailUrl(fileId: string, size = 800): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

