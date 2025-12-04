const rules: Record<TransactionType, keyof Pick<Transaction, 'buyerId' | 'sellerId'>> = {
  [TransactionType.acceptOffer]: 'buyerId',
  [TransactionType.transfertToSellerBalance]: 'sellerId',
  [TransactionType.transfertToBuyerBalance]: 'buyerId',
  [TransactionType.fees]: 'sellerId',
  [TransactionType.cancelOffer]: 'buyerId'
}

import { balanceOperations } from '@/server/databaseOperations/prisma.provider'
import { Transaction, TransactionType } from '@prisma/client'

export const getTransactions = (userId: number) =>
  balanceOperations
    .getUserTransactions(userId)
    .then(transactions =>
      transactions.filter(transaction => transaction[rules[transaction.type]] === userId)
    )
