import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const transactionsRouter = Router();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.find({
    cache: true,
    relations: ['category'],
  });

  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();

  const valueParsed = Number.parseFloat(value);
  const transaction = await createTransactionService.execute({
    title,
    value: valueParsed,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute(id);

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();

    const transactions = await importTransactionService.execute(
      request.file.filename,
    );

    return response.json(transactions);
  },
);

export default transactionsRouter;
