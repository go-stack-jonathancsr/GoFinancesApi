import { getCustomRepository } from 'typeorm';
import { isUuid } from 'uuidv4';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const idIsUuid = await isUuid(id);

    if (!idIsUuid) {
      throw new AppError('id invalid');
    }

    const transactionExist = await transactionRepository.findOne({
      where: { id },
    });

    if (!transactionExist) {
      throw new AppError('Transaction not exists', 204);
    }
    await transactionRepository.remove(transactionExist);
  }
}

export default DeleteTransactionService;
