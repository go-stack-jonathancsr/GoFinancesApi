import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
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
    const categoryRepository = getRepository(Category);
    let typeParsed: 'income' | 'outcome';
    let categoryObject: Category | undefined;

    if (type === 'income' || type === 'outcome') {
      typeParsed = type === 'income' ? 'income' : 'outcome';
    } else {
      throw new AppError('The type is not suported');
    }

    const existCategory = await categoryRepository.findOne({
      where: { title: category },
    });
    categoryObject = existCategory;

    if (!existCategory) {
      categoryObject = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryObject);
    }

    const transaction = transactionRepository.create({
      title,
      type: typeParsed,
      value,
      category: categoryObject,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
