import axios from 'axios'

/**
 * Google Drive helper (skeleton)
 * Assumes images are shared publicly or accessible via an API key/service account.
 */

export async function getDriveImageUrl(fileId: string) {
  // For public files, a URL pattern can be used. For private files use Drive API + auth.
  if (!fileId) return null
  // Public URL pattern (may require settings on Drive):
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

export async function fetchDriveFileMetadata(fileId: string, apiKey?: string) {
  if (!apiKey) return null
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webContentLink,webViewLink&key=${apiKey}`
  const res = await axios.get(url)
  return res.data
}

export async function syncImagesForProducts(productImageMap: Record<string, string>, apiKey?: string) {
  // productImageMap: { productSlug: driveFileId }
  const results: Record<string, string | null> = {}
  for (const [slug, fileId] of Object.entries(productImageMap)) {
    try {
      results[slug] = await getDriveImageUrl(fileId)
    } catch (err) {
      results[slug] = null
    }
  }
  return results
}
