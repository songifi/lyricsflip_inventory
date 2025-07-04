import { Injectable, Logger } from '@nestjs/common';
import * as csv from 'csv-parse';
import { stringify } from 'csv-stringify';

@Injectable()
export class CsvService {
  private readonly logger = new Logger(CsvService.name);

  async parseCsv(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      csv.parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, { column, index }) => {
          // Handle empty values
          if (value === '' || value === null || value === undefined) {
            return null;
          }
          
          // Try to parse numbers
          if (!isNaN(Number(value)) && value !== '') {
            return Number(value);
          }
          
          // Try to parse booleans
          if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            return value.toLowerCase() === 'true';
          }
          
          return value;
        },
      })
      .on('data', (row) => {
        results.push(row);
      })
      .on('error', (error) => {
        this.logger.error(`CSV parsing error: ${error.message}`);
        reject(error);
      })
      .on('end', () => {
        this.logger.log(`CSV parsing completed: ${results.length} rows parsed`);
        resolve(results);
      });
    });
  }

  async convertToCsv(data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      stringify(data, {
        header: true,
        quoted: true,
        cast: {
          date: (value) => value.toISOString(),
          boolean: (value) => value.toString(),
          number: (value) => value.toString(),
        },
      }, (error, output) => {
        if (error) {
          this.logger.error(`CSV conversion error: ${error.message}`);
          reject(error);
        } else {
          resolve(output);
        }
      });
    });
  }
}