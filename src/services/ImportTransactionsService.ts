import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface RequestTransaction {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const pathFile = path.join(uploadConfig.directory, filename);

    async function loadCSV(filePath: string): Promise<RequestTransaction[]> {
      const readCSVStream = fs.createReadStream(filePath);

      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: RequestTransaction[] = [];

      parseCSV.on('data', async line => {
        const [title, type, value, category] = line;
        lines.push({ title, type, value, category });
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      return lines;
    }
    const lines = await loadCSV(pathFile);
    async function createTransactions(
      transactionsArray: RequestTransaction[],
    ): Promise<Transaction[]> {
      const createTransactionService = new CreateTransactionService();
      const transactions: Transaction[] = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const { title, type, value, category } of transactionsArray) {
        // eslint-disable-next-line no-await-in-loop
        const transaction = await createTransactionService.execute({
          title,
          type,
          value,
          category,
        });
        transactions.push(transaction);
      }
      return transactions;
    }
    return createTransactions(lines);
  }
}

export default ImportTransactionsService;
