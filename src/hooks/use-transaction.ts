'use client';

import { useContext } from 'react';
import { TransactionContext, type TransactionContextType } from '@/context/TransactionContext';

export const useTransaction = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === null) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
