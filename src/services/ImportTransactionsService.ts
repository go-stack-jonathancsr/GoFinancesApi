import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const pathFile = path.join(uploadConfig.directory, filename);

    async function loadCSV(filePath: string): any[] {
      const readCSVStream = fs.createReadStream(filePath);

      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: any[] = [];

      parseCSV.on('data', async line => {
        lines.push(line);
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      return lines;
    }
    const lines = await loadCSV(pathFile);
    const createTransactionService = new CreateTransactionService();
    const transactions: Transaction[] = [];

    await Promise.all(
      lines.map(async element => {
        const [title, type, value, category] = element;
        const transaction = await createTransactionService.execute({
          title,
          type,
          value,
          category,
        });
        transactions.push(transaction);
      }),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
