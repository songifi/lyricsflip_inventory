import { Workbook } from 'exceljs';

export async function exportToExcel(data: any[], filePath: string) {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Report');

  if (data.length > 0) {
    sheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
    data.forEach(row => sheet.addRow(row));
  }

  await workbook.xlsx.writeFile(filePath);
}
