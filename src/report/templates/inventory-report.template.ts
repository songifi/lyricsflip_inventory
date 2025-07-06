export interface InventoryItem {
  name: string;
  sku: string;
  quantity: number;
  location: string;
  lastUpdated: Date;
}

export function generateInventoryReportTemplate(data: InventoryItem[]): string {
  return `
    <h2>Inventory Report</h2>
    <table border="1" cellpadding="4" cellspacing="0">
      <thead>
        <tr>
          <th>Name</th>
          <th>SKU</th>
          <th>Quantity</th>
          <th>Location</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.sku}</td>
            <td>${item.quantity}</td>
            <td>${item.location}</td>
            <td>${item.lastUpdated.toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
