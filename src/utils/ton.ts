import { Address, BN, toNano as coreToNano, fromNano as coreFromNano } from 'ton-core';

export const toNano = (amount: string | number): BN => {
  return coreToNano(amount.toString());
};

export const fromNano = (amount: BN | bigint | string | number): string => {
  if (typeof amount === 'number') {
    amount = amount.toString();
  }
  return coreFromNano(amount);
};

export const isValidAddress = (address: string): boolean => {
  try {
    Address.parse(address);
    return true;
  } catch {
    return false;
  }
};
