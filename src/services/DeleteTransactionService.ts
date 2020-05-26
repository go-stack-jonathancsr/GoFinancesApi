import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const transactionExist = await transactionRepository.findOne({
      where: { id },
    });

    if (!transactionExist) {
      throw new AppError('Transaction not exists', 204);
    }

    transactionRepository.delete(transactionExist);
  }
}

export default DeleteTransactionService;
