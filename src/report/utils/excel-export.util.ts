import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

export async function exportToExcel(data: any[], filePath: string): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Inventory Report');

  if (data.length) {
    sheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
    sheet.addRows(data);
  }

  const fullPath = path.resolve(__dirname, '..', '..', 'exports', filePath);
  await workbook.xlsx.writeFile(fullPath);
  return fullPath;
}
