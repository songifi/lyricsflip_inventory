// Utility to generate unique batch/lot numbers
export function generateBatchNumber(productId: string, manufacturedDate: Date): string {
  const datePart = manufacturedDate.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${productId}-${datePart}-${randomPart}`;
}
