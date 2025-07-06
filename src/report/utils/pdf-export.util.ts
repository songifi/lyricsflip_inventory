import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'html-pdf';

export async function exportToPDF(html: string, filePath: string): Promise<string> {
  const fullPath = path.resolve(__dirname, '..', '..', 'exports', filePath);
  return new Promise((resolve, reject) => {
    pdf.create(html).toFile(fullPath, (err, res) => {
      if (err) reject(err);
      else resolve(res.filename);
    });
  });
}
