import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDto {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: RequestDto): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    let typeParsed: 'income' | 'outcome';

    if (type === 'income' || type === 'outcome') {
      typeParsed = type === 'income' ? 'income' : 'outcome';
    } else {
      throw new AppError('The type is not suported');
    }

    const transaction = transactionRepository.create({
      title,
      type: typeParsed,
      value,
      category_id: category,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
