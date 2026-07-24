// Placeholder untuk integrasi Google Drive API
// Gunakan 'googleapis' package: npm install googleapis

// Contoh implementasi nyata (siap dipakai setelah .env.local diisi):
/*
import { google } from 'googleapis';
import { Readable } from 'stream';

const auth = new google.auth.JWT({
  email: process.env.GDRIVE_CLIENT_EMAIL,
  key: process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

export async function uploadFileToGoogleDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string = 'application/pdf'
): Promise<string> {
  const folderId = process.env.GDRIVE_FOLDER_ID;
  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId!],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id',
  });
  return response.data.id!;
}

export function getGDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}
*/

// Simulasi untuk development (tanpa koneksi nyata ke Google Drive)
export async function uploadFileToGoogleDrive(
  file: File,
  folderId: string
): Promise<string> {
  console.log(`[DEV] Simulasi upload: ${file.name} → folder ${folderId}`);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return `gdrive-sim-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

export function getGDriveViewUrl(fileId: string): string {
  if (fileId.startsWith("gdrive-sim-")) {
    return "#"; // Simulasi tidak menghasilkan URL nyata
  }
  return `https://drive.google.com/file/d/${fileId}/view`;
}
