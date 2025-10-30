import { google } from 'googleapis';

export class GoogleDriveService {
  private drive;

  constructor() {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async listImagesInFolder(folderId: string) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/'`,
        fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
        pageSize: 1000,
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing files from Google Drive:', error);
      throw error;
    }
  }

  async getPublicImageUrl(fileId: string): Promise<string> {
    try {
      // Hacer el archivo público
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Retornar URL directa
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    } catch (error) {
      console.error('Error getting public URL:', error);
      throw error;
    }
  }

  async syncProductImages(folderId: string): Promise<Map<string, string>> {
    const files = await this.listImagesInFolder(folderId);
    const imageMap = new Map<string, string>();

    for (const file of files) {
      if (!file.id || !file.name) continue;

      // Extraer slug del nombre del archivo (ej: "producto-123.jpg" -> "producto-123")
      const slug = file.name.replace(/\.[^/.]+$/, '');
      const url = await this.getPublicImageUrl(file.id);
      imageMap.set(slug, url);
    }

    return imageMap;
  }
}