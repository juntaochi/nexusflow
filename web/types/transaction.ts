export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type TransactionType = 'deposit' | 'withdraw' | 'rebalance' | 'register' | 'authorize';

export interface Transaction {
  hash: string;
  type: TransactionType;
  amount?: string;
  asset?: string;
  timestamp: number;
  status: TransactionStatus;
  chainId: number;
}
